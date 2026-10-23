/**
 * cf-ai-worker.js — chhota Cloudflare Worker jo Cloudflare API ko proxy karta hai,
 * taaki browser page (cf-ai-tester.html) bina CORS problem ke call kar sake.
 *
 * Deploy (2 minute, free):
 *   1. dash.cloudflare.com  ->  Workers & Pages  ->  Create  ->  Worker  ->  Deploy
 *   2. Worker ko Edit karo, sample code delete karke YE poori file paste karo, Deploy.
 *   3. Tumhara proxy base ban jayega:   https://<worker-name>.<you>.workers.dev/api
 *   4. cf-ai-tester.html kholo  ->  "API base (Worker)" me wahi URL daalo  ->  Load models.
 *
 * Caller ka Authorization header waise hi aage bhejta hai; kuch store nahi karta.
 */
export default {
  async fetch(request) {
    const cors = {
      "Access-Control-Allow-Origin": "*",
      "Access-Control-Allow-Methods": "GET,POST,PUT,PATCH,DELETE,OPTIONS",
      "Access-Control-Allow-Headers": "Authorization,Content-Type,Accept",
      "Access-Control-Max-Age": "86400",
    };

    // browser ka preflight
    if (request.method === "OPTIONS") {
      return new Response(null, { status: 204, headers: cors });
    }

    const u = new URL(request.url);
    if (!u.pathname.startsWith("/api/")) {
      return new Response(
        "Cloudflare AI proxy chal raha hai.\n" +
        "Use: /api/<cloudflare-path>,  jaise  /api/accounts\n",
        { status: 200, headers: { ...cors, "Content-Type": "text/plain; charset=utf-8" } }
      );
    }

    const target = "https://api.cloudflare.com/client/v4/" +
                   u.pathname.slice("/api/".length) + u.search;

    const h = new Headers();
    for (const [k, v] of request.headers) {
      const lk = k.toLowerCase();
      if (lk === "authorization" || lk === "content-type" || lk === "accept") h.set(k, v);
    }

    const init = { method: request.method, headers: h };
    if (request.method !== "GET" && request.method !== "HEAD") {
      init.body = await request.arrayBuffer();
    }

    let resp;
    try {
      resp = await fetch(target, init);
    } catch (e) {
      return new Response("proxy upstream fail: " + e, { status: 502, headers: cors });
    }

    const out = new Response(resp.body, { status: resp.status, statusText: resp.statusText });
    resp.headers.forEach((v, k) => {
      if (!k.toLowerCase().startsWith("access-control")) out.headers.set(k, v);
    });
    for (const [k, v] of Object.entries(cors)) out.headers.set(k, v);
    return out;
  },
};
