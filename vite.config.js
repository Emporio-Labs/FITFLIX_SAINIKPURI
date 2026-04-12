const { defineConfig, loadEnv } = require('vite');
const chatHandler = require('./api/chat');
const leadPublicCaptureHandler = require('./api/leads/public-capture');

function readRawBody(req) {
  return new Promise((resolve, reject) => {
    let rawBody = '';
    req.setEncoding('utf8');
    req.on('data', (chunk) => {
      rawBody += chunk;
    });
    req.on('end', () => resolve(rawBody));
    req.on('error', reject);
  });
}

function addVercelResponseHelpers(res) {
  if (typeof res.status !== 'function') {
    res.status = function status(code) {
      res.statusCode = code;
      return res;
    };
  }

  if (typeof res.json !== 'function') {
    res.json = function json(payload) {
      if (!res.headersSent) {
        res.setHeader('Content-Type', 'application/json; charset=utf-8');
      }
      res.end(JSON.stringify(payload));
      return res;
    };
  }
}

function localApiPlugin() {
  function registerLocalRoute(server, path, handler) {
    server.middlewares.use(path, async (req, res, next) => {
      try {
        if (req.method === 'POST') {
          req.body = await readRawBody(req);
        }

        addVercelResponseHelpers(res);
        await handler(req, res);
      } catch (error) {
        if (!res.headersSent) {
          res.statusCode = 500;
          res.setHeader('Content-Type', 'application/json; charset=utf-8');
          res.end(JSON.stringify({
            error: 'Local API middleware failed',
            detail: error.message || 'Unknown error'
          }));
        }
        next(error);
      }
    });
  }

  return {
    name: 'local-api-routes',
    configureServer(server) {
      registerLocalRoute(server, '/api/chat', chatHandler);
      registerLocalRoute(server, '/api/leads/public-capture', leadPublicCaptureHandler);
      registerLocalRoute(server, '/leads/public-capture', leadPublicCaptureHandler);
    }
  };
}

module.exports = defineConfig(({ mode }) => {
  const env = loadEnv(mode, process.cwd(), '');
  Object.assign(process.env, env);

  return {
    plugins: [localApiPlugin()]
  };
});
