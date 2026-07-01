const crypto = require('crypto');

const RATE_LIMIT_MAX = Number(process.env.LEAD_RATE_LIMIT_MAX || process.env.RATE_LIMIT_MAX || 20);
const RATE_LIMIT_WINDOW_MS = Number(process.env.LEAD_RATE_LIMIT_WINDOW_MS || process.env.RATE_LIMIT_WINDOW_MS || 60_000);
const CORS_ALLOW_ORIGIN = process.env.LEAD_CORS_ALLOW_ORIGIN || '*';
const ipBuckets = new Map();

function setCorsHeaders(res) {
  res.setHeader('Access-Control-Allow-Origin', CORS_ALLOW_ORIGIN);
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
}

function getRequestId() {
  if (typeof crypto.randomUUID === 'function') {
    return crypto.randomUUID();
  }
  return `${Date.now()}-${Math.random().toString(36).slice(2, 10)}`;
}

function getClientIp(req) {
  const xfwd = req.headers['x-forwarded-for'];
  if (typeof xfwd === 'string' && xfwd.trim()) {
    return xfwd.split(',')[0].trim();
  }
  return req.headers['x-real-ip'] || req.socket?.remoteAddress || 'unknown';
}

function isRateLimited(ip) {
  const now = Date.now();
  const current = ipBuckets.get(ip);

  if (!current || now > current.resetAt) {
    ipBuckets.set(ip, { count: 1, resetAt: now + RATE_LIMIT_WINDOW_MS });
    return false;
  }

  current.count += 1;
  if (current.count > RATE_LIMIT_MAX) {
    return true;
  }
  return false;
}

function parseJsonBody(req) {
  if (typeof req.body === 'string') {
    try {
      return JSON.parse(req.body);
    } catch (e) {
      return {};
    }
  }
  return req.body || {};
}

module.exports = async function handler(req, res) {
  const requestId = getRequestId();
  const startedAt = Date.now();
  const clientIp = getClientIp(req);

  setCorsHeaders(res);
  res.setHeader('x-request-id', requestId);

  if (req.method === 'OPTIONS') {
    return res.status(204).end();
  }

  if (req.method !== 'POST') {
    return res.status(405).json({
      error: 'Method not allowed',
      request_id: requestId
    });
  }

  if (isRateLimited(clientIp)) {
    return res.status(429).json({
      error: 'Too many requests, please wait and try again.',
      request_id: requestId
    });
  }

  let body;
  try {
    body = parseJsonBody(req);
  } catch (err) {
    return res.status(400).json({
      error: 'Invalid JSON body',
      request_id: requestId
    });
  }

  // Honeypot field spam protection
  if (body.website && body.website.trim()) {
    console.log(JSON.stringify({
      level: 'info',
      requestId,
      message: 'account_deletion_honeypot_triggered',
      clientIp,
      latencyMs: Date.now() - startedAt
    }));
    return res.status(200).json({
      success: true,
      message: 'Your account deletion request has been submitted successfully.',
      request_id: requestId
    });
  }

  const fullName = typeof body.fullName === 'string' ? body.fullName.trim() : '';
  const email = typeof body.email === 'string' ? body.email.trim() : '';
  const phone = typeof body.phone === 'string' ? body.phone.trim() : '';
  const reason = typeof body.reason === 'string' ? body.reason.trim() : '';
  const confirm = body.confirm === true;

  if (!fullName) {
    return res.status(400).json({
      error: 'Full name is required.',
      request_id: requestId
    });
  }

  if (!email) {
    return res.status(400).json({
      error: 'Email address is required.',
      request_id: requestId
    });
  }

  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!emailRegex.test(email)) {
    return res.status(400).json({
      error: 'Invalid email address format.',
      request_id: requestId
    });
  }

  if (!confirm) {
    return res.status(400).json({
      error: 'Confirmation is required to delete the account.',
      request_id: requestId
    });
  }

  // Securely log the request to stdout (Vercel Log Drain / console logs)
  const logPayload = {
    level: 'info',
    requestId,
    message: 'account_deletion_requested',
    fullName,
    email,
    phone,
    reason,
    clientIp,
    timestamp: new Date().toISOString(),
    latencyMs: Date.now() - startedAt
  };
  console.log(JSON.stringify(logPayload));

  // Dispatch webhook if DELETION_WEBHOOK_URL is set
  const webhookUrl = process.env.DELETION_WEBHOOK_URL;
  if (webhookUrl && webhookUrl.trim()) {
    try {
      const response = await fetch(webhookUrl, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-request-id': requestId
        },
        body: JSON.stringify({
          event: 'account_deletion_requested',
          requestId,
          fullName,
          email,
          phone,
          reason,
          clientIp,
          timestamp: logPayload.timestamp
        }),
        signal: AbortSignal.timeout(8000) // 8-second timeout
      });

      if (!response.ok) {
        console.warn(JSON.stringify({
          level: 'warn',
          requestId,
          message: 'account_deletion_webhook_failed',
          statusCode: response.status,
          statusText: response.statusText
        }));
      } else {
        console.log(JSON.stringify({
          level: 'info',
          requestId,
          message: 'account_deletion_webhook_sent_successfully'
        }));
      }
    } catch (webhookErr) {
      console.error(JSON.stringify({
        level: 'error',
        requestId,
        message: 'account_deletion_webhook_error',
        error: webhookErr.message || String(webhookErr)
      }));
    }
  }

  return res.status(200).json({
    success: true,
    message: 'Your account deletion request has been submitted successfully. Your account and associated data will be deleted within 7 business days.',
    request_id: requestId
  });
};
