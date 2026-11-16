# Product Suite

One dashboard on your own computer that turns one idea into a digital product, finds buyers, emails them safely, and launches it. It also runs 3 AI side hustles (Airbnb Photos, Ad Remakes, YouTube Shorts) from the same engine, with one Unibox for every reply.

It opens in **Demo mode**: every step is already done with saved, made up examples. No keys, no spending, no emails, no outside calls.

## Start it

You need [Node.js](https://nodejs.org) 18.17 or newer.

```bash
npm install
```

```bash
npm start
```

Then open http://127.0.0.1:5177 (it tries to open by itself). Stop it with Ctrl+C.

Port busy? Start on another one:

```bash
PORT=5178 npm start
```

## How it is built

```
server/            the local helper (Node, one dependency: the official Claude SDK)
  index.js         serves the page, guards every request, enforces caps and yeses
  store.js         private key file and settings
  connectors.js    the 9 services, their free key tests, and request helpers
  robots.js        the Apify robots and their prices
public/            the dashboard (plain JavaScript modules, no build step)
  js/app.js        shell: sidebar, top bar, "What the app did", router
  js/steps/        every step: frame, Build it, Find buyers & send, Launch, hustles
  js/player.js     "Demo this step" movies and "Run live demo"
  js/data/         all demo content (book, research, leads, replies, listings, ads)
  js/core/art.js   drawn stand ins: covers, rooms, ads, clips (no outside images)
scripts/check.js   npm run check: every file parses, no dashes, no banned phrases
```

## Keys and safety

- Keys are pasted once (Settings, or right on a step) and saved in `~/.product-suite/keys.json` with owner only permissions (file 600, folder 700). The page only ever receives masked keys like `sk-a........9f2c`.
- Every outside call goes through the local helper, which adds the key on the way out. The helper only listens on 127.0.0.1, checks the Host and Origin headers, and requires a per launch token that only the page it served knows.
- Every paid, sent or published action needs a one time confirm token that the page gets only after you press yes. A bug in the page can not spend or send by accident.
- The helper enforces a session spend cap (default $10) and a hard cap per robot run (default $1, sent to Apify as `maxTotalChargeUsd`).
- Instantly campaigns are always created paused; starting is its own yes. Whop products are always created hidden with stock 0; visible is its own yes. Test emails only go to the one address you type. Replies are drafts; the app never answers an email by itself. Inbox passwords go straight from ScaledMail to Instantly and are never returned to the page.
- Saved demo runs never contain a key, because the page never has one.

## Partner links

The sign up links in Settings are the ones from the build prompt, and some are partner links. They may pay the person who shared the prompt. Same price for you. To use plain links instead, edit `LINKS` in `public/js/screens/screens.js`.

## Live mode, honestly

Live mode calls the real APIs with your keys. The endpoints follow each service's public docs (Claude via the official SDK, Apify, Instantly API v2, Whop API v1, Spaceship, ScaledMail, AI Ark, Higgsfield, Gemini). They have not been tested against live accounts yet, and some of these APIs change often. If a step fails, the error says which service answered and how. Endpoint paths live in one place (`server/connectors.js` and `server/index.js`) so they are easy to fix. Robot actor IDs can be changed in `~/.product-suite/settings.json` under `robots`.

The "Download PDF" button opens your browser's print window set to a 6 by 9 inch page. Pick "Save as PDF".

General information, not medical advice. Every demo person, business, channel and listing is made up and marked "(demo)".
