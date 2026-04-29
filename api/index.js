export const config = { runtime: "edge" };
const TARGET = ("https://api.rexnet.shop:2096").replace(/\/$/, "");
const HEADER = new Set([
  "host",
  "connection",
  "keep-alive",
  "proxy-authenticate",
  "proxy-authorization",
  "te",
  "trailer",
  "transfer-encoding",
  "upgrade",
  "forwarded",
  "x-forwarded-host",
  "x-forwarded-proto",
  "x-forwarded-port",
]);
export default async function handler(req) {
  try {
    const pathStart = req.url.indexOf("/", 8);
    const targetUrl =
      pathStart === -1 ? TARGET + "/" : TARGET + req.url.slice(pathStart);
    const out = new Headers();
    let clientIp = null;
    for (const [k, v] of req.headers) {
      if (HEADER.has(k)) continue;
      if (k.startsWith("x-vercel-")) continue;
      if (k === "x-real-ip") {
        clientIp = v;
        continue;
      }
      if (k === "x-forwarded-for") {
        if (!clientIp) clientIp = v;
        continue;
      }
      out.set(k, v);
    }
    if (clientIp) out.set("x-forwarded-for", clientIp);
    const method = req.method;
    const hasBody = method !== "GET" && method !== "HEAD";
    return await fetch(targetUrl, {
      method,
      headers: out,
      body: hasBody ? req.body : undefined,
      duplex: "half",
      redirect: "manual",
    });
   } catch (err) {
    return new Response("Err");
   }
}
