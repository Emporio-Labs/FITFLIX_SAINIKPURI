const crypto = require('crypto');

const RATE_LIMIT_MAX = Number(process.env.RATE_LIMIT_MAX || 20);
const RATE_LIMIT_WINDOW_MS = Number(process.env.RATE_LIMIT_WINDOW_MS || 60_000);
const MAX_MESSAGE_LENGTH = Number(process.env.MAX_MESSAGE_LENGTH || 1200);
const UPSTREAM_TIMEOUT_MS = Number(process.env.UPSTREAM_TIMEOUT_MS || 15_000);
const ipBuckets = new Map();
let hasLoggedDevConfig = false;

function isDevRuntime() {
  return process.env.NODE_ENV !== 'production' || process.env.VERCEL_ENV === 'development';
}

function sanitizeApiUrl(rawUrl) {
  if (typeof rawUrl !== 'string' || !rawUrl.trim()) {
    return 'not_set';
  }

  try {
    const parsed = new URL(rawUrl);
    const port = parsed.port ? `:${parsed.port}` : '';
    return `${parsed.protocol}//${parsed.hostname}${port}${parsed.pathname}`;
  } catch (_error) {
    return 'invalid_url';
  }
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

function passesContentGuardrails(text) {
  const lowered = text.toLowerCase();
  const blockedPatterns = [
    /<script/i,
    /javascript:/i,
    /onerror\s*=/i,
    /onload\s*=/i,
    /data:text\/html/i
  ];
  if (blockedPatterns.some((pattern) => pattern.test(text))) {
    return false;
  }

  // Reject low-signal spam like extreme repeated single characters.
  if (/(.)\1{39,}/.test(lowered)) {
    return false;
  }

  return true;
}

function logEvent(level, requestId, message, extra) {
  console.log(JSON.stringify({
    level,
    requestId,
    message,
    ...extra
  }));
}

function maybeLogDevRuntimeConfig(requestId, apiUrl, collectionId, apiKey) {
  if (hasLoggedDevConfig || !isDevRuntime()) {
    return;
  }

  hasLoggedDevConfig = true;
  logEvent('info', requestId, 'dev_runtime_config', {
    nodeEnv: process.env.NODE_ENV || 'unset',
    vercelEnv: process.env.VERCEL_ENV || 'unset',
    apiUrl: sanitizeApiUrl(apiUrl),
    collectionId,
    hasApiKey: Boolean(apiKey),
    timeoutMs: UPSTREAM_TIMEOUT_MS
  });
}

module.exports = async function handler(req, res) {
  const requestId = getRequestId();
  const startedAt = Date.now();
  res.setHeader('x-request-id', requestId);

  if (req.method === 'OPTIONS') {
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
    return res.status(204).end();
  }

  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed', request_id: requestId });
  }

  const apiUrl = process.env.CHATPLUG_API_URL || 'http://65.0.21.64:7860/v1/chat';
  const apiKey = process.env.CHATPLUG_API_KEY;
  const collectionId = process.env.CHATPLUG_COLLECTION_ID || 'fitflix-collection';
  const clientIp = getClientIp(req);

  maybeLogDevRuntimeConfig(requestId, apiUrl, collectionId, apiKey);

  if (isRateLimited(clientIp)) {
    logEvent('warn', requestId, 'rate_limited', { clientIp });
    return res.status(429).json({
      error: 'Too many requests, please wait and try again.',
      request_id: requestId
    });
  }

  if (!apiKey) {
    logEvent('error', requestId, 'missing_api_key', {});
    return res.status(500).json({ error: 'Server missing CHATPLUG_API_KEY', request_id: requestId });
  }

  let body;
  try {
    body = typeof req.body === 'string' ? JSON.parse(req.body || '{}') : (req.body || {});
  } catch (_error) {
    return res.status(400).json({ error: 'Invalid JSON body', request_id: requestId });
  }

  const message = typeof body.message === 'string' ? body.message.trim() : '';

  if (!message) {
    return res.status(400).json({ error: 'message is required', request_id: requestId });
  }

  if (message.length > MAX_MESSAGE_LENGTH) {
    return res.status(400).json({
      error: `message exceeds max length (${MAX_MESSAGE_LENGTH})`,
      request_id: requestId
    });
  }

  if (!passesContentGuardrails(message)) {
    return res.status(400).json({
      error: 'message contains blocked content patterns',
      request_id: requestId
    });
  }

  const timeoutController = new AbortController();
  const timeout = setTimeout(() => timeoutController.abort(), UPSTREAM_TIMEOUT_MS);

  try {
    const upstream = await fetch(apiUrl, {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${apiKey}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        message,
        collection_id: collectionId
      }),
      signal: timeoutController.signal
    });

    const text = await upstream.text();
    let data;
    try {
      data = JSON.parse(text);
    } catch (_ignore) {
      data = { raw: text };
    }

    if (!upstream.ok) {
      const detail = data.error || data.message || `Upstream error ${upstream.status}`;
      logEvent('warn', requestId, 'upstream_error', {
        status: upstream.status,
        detail,
        latencyMs: Date.now() - startedAt
      });
      return res.status(upstream.status).json({ error: detail, request_id: requestId });
    }

    const answer = typeof data.answer === 'string' ? data.answer : '';
    logEvent('info', requestId, 'chat_success', {
      status: 200,
      latencyMs: Date.now() - startedAt,
      answerLength: answer.length
    });
    return res.status(200).json({ answer, request_id: requestId });
  } catch (error) {
    const errorMsg = error.name === 'AbortError'
      ? 'Upstream request timed out'
      : (error.message || 'Failed to reach Chatplug service');

    logEvent('error', requestId, 'proxy_failure', {
      error: errorMsg,
      latencyMs: Date.now() - startedAt
    });
    return res.status(502).json({ error: errorMsg, request_id: requestId });
  } finally {
    clearTimeout(timeout);
  }
};
