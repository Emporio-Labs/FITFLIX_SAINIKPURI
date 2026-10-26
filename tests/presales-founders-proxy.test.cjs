const test = require("node:test");
const assert = require("node:assert/strict");
const { EventEmitter } = require("node:events");

function request(url, method, body = "") {
  const req = new EventEmitter();
  req.url = url;
  req.method = method;
  req.setEncoding = () => {};
  process.nextTick(() => {
    if (body) req.emit("data", body);
    req.emit("end");
  });
  return req;
}
function response() {
  return {
    statusCode: 200,
    headers: {},
    body: "",
    setHeader(key, value) { this.headers[key] = value; },
    end(value) { this.body = value || ""; },
  };
}
async function handler() {
  delete process.env.PRESALES_BACKEND_ORIGIN;
  delete require.cache[require.resolve("../api/presales/founders")];
  return require("../api/presales/founders");
}

test("rejects unknown operations without contacting an upstream", async () => {
  const fn = await handler();
  const res = response();
  await fn(request("/api/presales/founders?operation=admin", "GET"), res);
  assert.equal(res.statusCode, 404);
  assert.match(res.body, /Unknown public campaign operation/);
});

test("returns descriptive 503 when the backend origin is unset", async () => {
  const fn = await handler();
  const res = response();
  await fn(request("/api/presales/founders?operation=settings", "GET"), res);
  assert.equal(res.statusCode, 503);
  assert.match(res.body, /not configured/);
});

test("forwards only the fixed public path and preserves a safe status", async () => {
  process.env.PRESALES_BACKEND_ORIGIN = "https://backend.example.test";
  const originalFetch = global.fetch;
  let seen;
  global.fetch = async (url, init) => {
    seen = { url, init };
    return { ok: true, status: 200, text: async () => JSON.stringify({ applicationOpen: true }) };
  };
  try {
    const fn = require("../api/presales/founders");
    const res = response();
    await fn(request("/api/presales/founders?operation=booking-config", "POST", JSON.stringify({ id: "x", token: "y" })), res);
    assert.equal(res.statusCode, 200);
    assert.equal(seen.url, "https://backend.example.test/presales/founders/booking-config");
    assert.equal(seen.init.headers["content-type"], "application/json");
    assert.equal(seen.init.body, JSON.stringify({ id: "x", token: "y" }));
  } finally {
    global.fetch = originalFetch;
    delete process.env.PRESALES_BACKEND_ORIGIN;
  }
});

for (const parsedBody of [{ id: "private-id", token: "private-token" }, JSON.stringify({ id: "private-id", token: "private-token" })]) {
  test(`forwards an already-parsed ${typeof parsedBody} body and maps requestCall`, async () => {
    process.env.PRESALES_BACKEND_ORIGIN = "https://backend.example.test";
    const originalFetch = global.fetch;
    let seen;
    global.fetch = async (url, init) => {
      seen = { url, init };
      return { ok: true, status: 200, text: async () => JSON.stringify({ status: "requested", message: "Request recorded" }) };
    };
    try {
      const req = new EventEmitter();
      req.url = "/api/presales/founders?operation=requestCall";
      req.method = "POST";
      req.body = parsedBody;
      req.setEncoding = () => { throw new Error("The consumed stream must not be reread"); };
      const res = response();
      await require("../api/presales/founders")(req, res);
      assert.equal(res.statusCode, 200);
      assert.equal(seen.url, "https://backend.example.test/presales/founders/request-call");
      assert.deepEqual(JSON.parse(seen.init.body), { id: "private-id", token: "private-token" });
      assert.equal(res.headers["Cache-Control"], "no-store");
    } finally {
      global.fetch = originalFetch;
      delete process.env.PRESALES_BACKEND_ORIGIN;
    }
  });
}

test("does not report success for an HTML upstream response", async () => {
  process.env.PRESALES_BACKEND_ORIGIN = "https://backend.example.test";
  const originalFetch = global.fetch;
  global.fetch = async () => ({ ok: true, status: 200, text: async () => "<html>Not the campaign API</html>" });
  try {
    const res = response();
    await require("../api/presales/founders")(request("/api/presales/founders?operation=settings", "GET"), res);
    assert.equal(res.statusCode, 502);
    assert.match(res.body, /invalid response/);
  } finally {
    global.fetch = originalFetch;
    delete process.env.PRESALES_BACKEND_ORIGIN;
  }
});
