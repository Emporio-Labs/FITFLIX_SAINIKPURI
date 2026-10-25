const ALLOWED = Object.freeze({
  settings: "GET",
  slots: "GET",
  submit: "POST",
  lead: "POST",
  "booking-config": "POST",
  "request-call": "POST",
});
const MAX_BODY_BYTES = 256 * 1024;
const TIMEOUT_MS = 12000;

function json(res, status, payload) {
  res.statusCode = status;
  res.setHeader("Content-Type", "application/json; charset=utf-8");
  res.setHeader("Cache-Control", "no-store");
  res.end(JSON.stringify(payload));
}
function originFromEnv() {
  const raw = process.env.PRESALES_BACKEND_ORIGIN;
  if (!raw) return null;
  try {
    const url = new URL(raw);
    if (url.protocol !== "https:" || url.pathname !== "/" || url.search || url.hash || url.username || url.password) return null;
    return url.origin;
  } catch {
    return null;
  }
}
function readBody(req) {
  // Vercel and the local Vite bridge may already have consumed the stream.
  // Preserve that parsed body rather than waiting for an end event twice.
  if (req.body !== undefined && req.body !== null) {
    let parsed;
    try {
      parsed = typeof req.body === "string" ? req.body : Buffer.isBuffer(req.body) ? req.body.toString("utf8") : JSON.stringify(req.body);
    } catch {
      return Promise.reject(Object.assign(new Error("Invalid request body"), { statusCode: 400 }));
    }
    if (Buffer.byteLength(parsed, "utf8") > MAX_BODY_BYTES) {
      return Promise.reject(Object.assign(new Error("Request body too large"), { statusCode: 413 }));
    }
    return Promise.resolve(parsed);
  }
  return new Promise((resolve, reject) => {
    let body = "";
    let bytes = 0;
    req.setEncoding("utf8");
    req.on("data", chunk => {
      bytes += Buffer.byteLength(chunk, "utf8");
      if (bytes > MAX_BODY_BYTES) {
        reject(Object.assign(new Error("Request body too large"), { statusCode: 413 }));
        req.destroy();
        return;
      }
      body += chunk;
    });
    req.on("end", () => resolve(body));
    req.on("error", reject);
  });
}
module.exports = async function foundersProxy(req, res) {
  res.setHeader("Cache-Control", "no-store");
  const operation = new URL(req.url || "/", "https://fitflix.in").searchParams.get("operation");
  const aliases = { bookingConfig: "booking-config", requestCall: "request-call" };
  const action = Object.prototype.hasOwnProperty.call(aliases, operation) ? aliases[operation] : operation;
  if (!action || !Object.prototype.hasOwnProperty.call(ALLOWED, action)) return json(res, 404, { error: "Unknown public campaign operation" });
  if (req.method !== ALLOWED[action]) return json(res, 405, { error: "Method not allowed" });
  const origin = originFromEnv();
  if (!origin) return json(res, 503, { error: process.env.PRESALES_BACKEND_ORIGIN ? "Campaign backend origin is invalid" : "Campaign backend is not configured" });
  let body = "";
  if (req.method === "POST") {
    try { body = await readBody(req); } catch (error) { return json(res, error.statusCode || 400, { error: error.statusCode === 413 ? "Request body too large" : "Invalid request body" }); }
    try { JSON.parse(body); } catch { return json(res, 400, { error: "Request body must be JSON" }); }
  }
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), TIMEOUT_MS);
  try {
    const upstream = await fetch(`${origin}/presales/founders/${action}`, {
      method: req.method,
      headers: req.method === "POST" ? { "content-type": "application/json" } : undefined,
      body: req.method === "POST" ? body : undefined,
      signal: controller.signal,
    });
    const text = await upstream.text();
    let payload;
    try { payload = text ? JSON.parse(text) : null; } catch { return json(res, 502, { error: "Campaign backend returned an invalid response" }); }
    if (!upstream.ok) return json(res, upstream.status, { error: typeof payload?.error === "string" ? payload.error : "Campaign request could not be completed" });
    if (payload === null || typeof payload !== "object") return json(res, 502, { error: "Campaign backend returned an invalid response" });
    return json(res, upstream.status, payload);
  } catch {
    return json(res, 504, { error: "Campaign backend did not respond" });
  } finally {
    clearTimeout(timer);
  }
};
