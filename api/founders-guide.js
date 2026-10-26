const GUIDE_URL = "https://files.manuscdn.com/user_upload_by_module/session_file/310419663030674154/zJRyoWjFyxrdofxU.glb";
const MAX_BYTES = 4 * 1024 * 1024;
module.exports = async function foundersGuide(req, res) {
  res.setHeader("Cache-Control", "public, max-age=86400");
  if (req.method !== "GET" && req.method !== "HEAD") {
    res.statusCode = 405;
    res.setHeader("Allow", "GET, HEAD");
    return res.end();
  }
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), 15000);
  try {
    const upstream = await fetch(GUIDE_URL, { method: "GET", signal: controller.signal });
    if (!upstream.ok || !upstream.body) {
      res.statusCode = upstream.status >= 400 ? upstream.status : 502;
      return res.end();
    }
    const contentLength = Number(upstream.headers.get("content-length") || 0);
    if (contentLength > MAX_BYTES) { res.statusCode = 502; return res.end(); }
    const chunks = [];
    let size = 0;
    for await (const chunk of upstream.body) {
      size += chunk.length;
      if (size > MAX_BYTES) { res.statusCode = 502; return res.end(); }
      chunks.push(chunk);
    }
    res.statusCode = 200;
    res.setHeader("Content-Type", "model/gltf-binary");
    res.setHeader("Content-Length", String(size));
    if (req.method === "HEAD") return res.end();
    return res.end(Buffer.concat(chunks));
  } catch {
    res.statusCode = 504;
    return res.end();
  } finally { clearTimeout(timer); }
};
