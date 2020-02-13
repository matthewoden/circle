const agent = require("superagent");
const wait = require("waait");
const puppeteer = require("puppeteer");
const logger = require("./logger");

const COUPONS_URL = "https://circle.target.com/c/coupons";
const LOGIN_URL = "https://circle.target.com/";

class Circle {
  constructor(options = {}) {
    const defaultOptions = {
      timeout: 3600,
      iftttEvent: "circle",
      headless: false,
      // human-like imperfection
      viewport: { width: 1507, height: 876 },
      // recent-ish version of chrome.
      // TODO: Figure out a good way to have this update without pull/redeployment.
      useragent:
        "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_14_6) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/79.0.3945.88 Safari/537.36"
    };

    this.options = {
      ...defaultOptions,
      ...options
    };
  }

  async init() {
    if (this.options.timeout) {
      clearTimeout(this.timeout);
      this.timeout = setTimeout(async () => {
        await this.dispatch(
          `Circle Coupon Failure: Timeout of ${this.options.timeout} second(s) exceeded.`
        );
        process.exit(1);
      }, this.options.timeout * 1000);
    }
    this.browser = await puppeteer.launch({ headless: this.options.headless });
    this.page = await this.browser.newPage();
    await this.page.setViewport(this.options.viewport);
    await this.page.setUserAgent(this.options.useragent);

    return this;
  }

  async clickByText(element, text) {
    // Xpath example
    // https://gist.github.com/tokland/d3bae3b6d3c1576d8700405829bbdb52
    const splitedQuotes = text.replace(/'/g, `', "'", '`);
    const escapedText = `concat('${splitedQuotes}', '')`;
    const elementHandlers = await this.page.$x(
      `//${element}[contains(text(), ${escapedText})]`
    );

    if (elementHandlers.length > 0) {
      await elementHandlers[0].click();
    } else {
      throw new Error(`${element} not found with ${text}`);
    }
  }

  async _scrollPage() {
    logger.info("Scrolling all offers into view");
    const bodyHandle = await this.page.$("body");

    let lastHeight = 0;
    const scroller = async () => {
      this.page.evaluate(_viewportHeight => {
        window.scrollBy(0, _viewportHeight);
      }, this.options.viewport.height);

      await wait(1000);
      const { height } = await bodyHandle.boundingBox();

      if (height > lastHeight) {
        lastHeight = height;
        await scroller();
      }
    };
    await scroller();
    await bodyHandle.dispose();
    logger.info("All offers are now available");
  }

  async login() {
    logger.info("Logging in.");
    await this.page.goto(LOGIN_URL, { waitUntil: "networkidle2" });
    await this.clickByText("button", "Sign in");
    await this.page.waitForNavigation({ waitUntil: "networkidle2" });

    await this.page.type('input[type="email"]', this.options.username);
    await this.page.type('input[type="password"]', this.options.password);
    await this.page.click('button[type="submit"]');
    await this.page.waitForNavigation({ waitUntil: "networkidle2" });

    logger.info("Login successful.");
    return this;
  }

  async clipCoupons() {
    return this._toggleCoupons(true);
  }

  // for testing/resetting state.
  // TODO: figure out the best way to test puppeteer?
  async unclipCoupons() {
    return this._toggleCoupons(false);
  }

  async dispatch(message) {
    if (this.options.iftttKey) {
      logger.info(`Dispatching to ${this.options.iftttEvent}`);
      await agent.post(
        `https://maker.ifttt.com/trigger/${this.options.iftttEvent}/with/key/${this.options.iftttKey}`,
        { value1: message }
      );
    }
  }

  async cleanup() {
    clearTimeout(this.timeout);
    await this.browser.close();
    return this;
  }

  async _toggleCoupons(shouldClip) {
    const action = shouldClip
      ? {
          className: 'button[aria-label^="add"]',
          actionName: "Clipping"
        }
      : {
          className: 'button[aria-label^="remove"]',
          actionName: "Unclipping"
        };

    logger.info(`${action.actionName} coupons.`);

    await this.page.goto(`${COUPONS_URL}/-/${this.options.categoryId}`, {
      waitUntil: "networkidle2"
    });
    await this.page.waitForSelector("#Offer-Grid-Container");
    await this._scrollPage();

    const couponIds = await this.page.$$eval(action.className, coupons =>
      coupons.map(c => c.getAttribute("data-offerid"))
    );

    // Attempting, because the buttons are always there, just not always active.
    // Not worth debugging schnuck's toggle states.
    logger.info(`Attempting to click on ${couponIds.length} coupons.`);

    const missedClicks = await couponIds.reduce(async (previous, id) => {
      const missed = await previous;
      try {
        await this.page.click(`button[data-offerid="${id}"]`);
        if (shouldClip) {
          await this.page.waitForResponse(
            `https://cartwheel.target.com/ssa/cwlservice/api/v16/myProfile/offers/${id}`
          );
        }
      } catch (err) {
        missed.push(id);
      }
      return missed;
    }, []);

    logger.info(
      `${action.actionName} complete. ${missedClicks.length} coupons skipped.`
    );

    return this;
  }
}

module.exports = Circle;
