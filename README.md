# Circle

A puppeteer script that handles tedium around online coupons at my local "general store".

## Background

This store offers online coupns - up to 60 offers can bbe redeemed.
This little script logs in, "clips" every single coupon available in the home good category, then exits.

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
Usage: circle [options]

Options:
  -V, --version                  output the version number
  -u, --username <username>      Your account username
  -p, --password <password>      Your account password
  -t, --timeout <timeout>        amount of time to wait for completion account password. Defaults to 3600 (5 minutes)
  -k, --iftttKey <iftttKey>      IFTTT.com webhook key. Used with the 'iftttEvent' option to dispatch notifications
                                 and errors.
  -e, --iftttEvent <iftttEvent>  IFTTT.com webhook event name. Used to dispatch notifications and errors.
                                 https://maker.ifttt.com/trigger/YOUR-EVENT/with/key/YOUR-KEY
  -h, --help                     output usage information
```

## Example

```
# in cron, in docker, or wherever
schnupons \
  --username $SCHNUPONS_USERNAME  \
  --password $SCHNUPONS_PASSWORD  \
  --timeout 3600  \
  --iftttKey $IFTTT_WEBHOOK_KEY
```

## Troubleshooting

On failure, there's an option to dispatch alerts to IFTTT, which you can send anywhere.
Otherwise, the last 14 days of logs are kept in `./logs`
