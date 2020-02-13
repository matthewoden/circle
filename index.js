const Circle = require("./circle");
const logger = require("./logger");

module.exports = async options => {
  const circle = new Circle({
    timeout: options.timeout,
    username: options.username,
    password: options.password,
    iftttKey: options.iftttKey,
    iftttEvent: options.iftttEvent
  });

  try {
    await circle.init();
    await circle.login();
    await circle.clipCoupons();
  } catch (err) {
    logger.warn("Circle clipping failure.");
    logger.error(err);
    await circle.dispatch(err.message);
  } finally {
    circle.cleanup();
  }
};
