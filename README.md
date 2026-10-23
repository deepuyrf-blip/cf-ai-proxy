# cf-ai-proxy

A tiny **Cloudflare Worker** that proxies the Cloudflare API so a browser page
(the `cf-ai-tester.html`) can call it without CORS problems.

## Deploy

Click **Deploy to Cloudflare** (or run `npx wrangler deploy`). After it deploys you
get a URL like:

```
https://cf-ai-proxy.<your-subdomain>.workers.dev
```

## Use

Open the tester page, put this in the **API base (Worker)** field:

```
https://cf-ai-proxy.<your-subdomain>.workers.dev/api
```

then paste your Cloudflare token and hit **Load models**.

## What it does

* `GET /` → a short text banner.
* `ANY /api/<path>` → forwards to `https://api.cloudflare.com/client/v4/<path>`
  with your `Authorization` header, and adds `Access-Control-Allow-Origin: *`.

Your token is never stored — it is only forwarded, and only the Cloudflare
account / Workers-AI paths are allowed.
