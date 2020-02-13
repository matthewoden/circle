# Circle

A puppeteer script that handles tedium around online coupons at my local "general store".

## Background

This store offers online coupns - up to 60 offers can be redeemed. This little script logs in, "clips" every single coupon available in a given category, then exits.

## Category Ids

Known category ids can be found below.

- [Baby, 22](https://circle.target.com/c/coupons/-/22)
- [Beauty, 232](https://circle.target.com/c/coupons/-/32)
- [Food, 26](https://circle.target.com/c/coupons/-/26)
- [Health, 205](https://circle.target.com/c/coupons/-/205)
- [Home, 30](https://circle.target.com/c/coupons/-/30)
- [Household Supplies, 27](https://circle.target.com/c/coupons/-/27)
- [Party/Holiday, 35](https://circle.target.com/c/coupons/-/35)
- [Pets 37](https://circle.target.com/c/coupons/-/37)
- [Tech & Entertainment, 24](https://circle.target.com/c/coupons/-/24)
- [Toys/Sports, 41](https://circle.target.com/c/coupons/-/41)

## Requirements

- Node 10.15.1 or later.
- A [Schnucks](https://nourish.schnucks.com/) account

## Install

From the project directory, install and symlink the binary:

```
npm ci && npm link
```

For updates:

```
git pull && npm ci
```

## Usage

```

Options:
  -V, --version                  output the version number
  -u, --username <username>      Your account username
  -p, --password <password>      Your account password
  -c, --categoryId <categoryId>  Category id for circle coupons. See README.md for known categories
  -t, --timeout <timeout>        amount of time to wait for completion account password. Defaults to 3600 (5 minutes)
  -k, --iftttKey <iftttKey>      IFTTT.com webhook key. Used with the 'iftttEvent' option to dispatch notifications and errors.
                                 Defaults to 'circle'.
  -e, --iftttEvent <iftttEvent>  IFTTT.com webhook event name. Used to dispatch notifications and errors.
                                 https://maker.ifttt.com/trigger/YOUR-EVENT/with/key/YOUR-KEY
  -h, --help                     output usage information
```

## Example

```
# in cron, in docker, or wherever
circle \
  --username $CIRCLE_USERNAME  \
  --password $CIRCLE_PASSWORD  \
  --timeout 3600  \
  --iftttKey $IFTTT_WEBHOOK_KEY
```

## Troubleshooting

On failure, there's an option to dispatch alerts to IFTTT, which you can send anywhere.
Otherwise, the last 14 days of logs are kept in `./logs`

## Tip

If you're running locally on osx - use pmset to ensure cron jobs wake your machine:

```bash
# cron job runs at 8:00am, so let's wake a little early
pmset repeat wakeorpoweron MTWRFSU 7:58:00
```
