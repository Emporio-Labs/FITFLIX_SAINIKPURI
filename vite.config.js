const { defineConfig, loadEnv } = require('vite');
const chatHandler = require('./api/chat');

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
  return {
    name: 'local-api-chat',
    configureServer(server) {
      server.middlewares.use('/api/chat', async (req, res, next) => {
        try {
          if (req.method === 'POST') {
            req.body = await readRawBody(req);
          }

          addVercelResponseHelpers(res);
          await chatHandler(req, res);
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
  };
}

module.exports = defineConfig(({ mode }) => {
  const env = loadEnv(mode, process.cwd(), '');
  Object.assign(process.env, env);

  return {
    plugins: [localApiPlugin()]
  };
});
