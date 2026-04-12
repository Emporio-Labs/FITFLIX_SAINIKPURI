const crypto = require('crypto');

const RATE_LIMIT_MAX = Number(process.env.LEAD_RATE_LIMIT_MAX || process.env.RATE_LIMIT_MAX || 20);
const RATE_LIMIT_WINDOW_MS = Number(process.env.LEAD_RATE_LIMIT_WINDOW_MS || process.env.RATE_LIMIT_WINDOW_MS || 60_000);
const CAPTCHA_VERIFY_URL = process.env.LEAD_CAPTCHA_VERIFY_URL || 'https://www.google.com/recaptcha/api/siteverify';
const CAPTCHA_TIMEOUT_MS = Number(process.env.LEAD_CAPTCHA_TIMEOUT_MS || 8_000);
const CORS_ALLOW_ORIGIN = process.env.LEAD_CORS_ALLOW_ORIGIN || '*';
const ipBuckets = new Map();

const ASSESSMENT_VERSIONS = {
  v1_quick_vitality_check: [
    { id: 'v1_q1', category: 'Movement' },
    { id: 'v1_q2', category: 'Nutrition' },
    { id: 'v1_q3', category: 'Sleep' },
    { id: 'v1_q4', category: 'Mental Wellness' },
    { id: 'v1_q5', category: 'Hydration' },
    { id: 'v1_q6', category: 'Recovery' },
    { id: 'v1_q7', category: 'Energy' }
  ],
  v2_deep_longevity_assessment: [
    { id: 'v2_q1', category: 'Movement' },
    { id: 'v2_q2', category: 'Movement' },
    { id: 'v2_q3', category: 'Nutrition' },
    { id: 'v2_q4', category: 'Nutrition' },
    { id: 'v2_q5', category: 'Sleep' },
    { id: 'v2_q6', category: 'Sleep' },
    { id: 'v2_q7', category: 'Mental Wellness' },
    { id: 'v2_q8', category: 'Mental Wellness' },
    { id: 'v2_q9', category: 'Social Wellness' },
    { id: 'v2_q10', category: 'Biomarkers' },
    { id: 'v2_q11', category: 'Habits' },
    { id: 'v2_q12', category: 'Habits' },
    { id: 'v2_q13', category: 'Recovery' },
    { id: 'v2_q14', category: 'Environment' },
    { id: 'v2_q15', category: 'Purpose' }
  ]
};

const BRAND_TIERS = [
  { min: 0, max: 20, brand: 'Equinox', tier: 'Performance & Lifestyle' },
  { min: 21, max: 40, brand: 'Six Senses', tier: 'Holistic Mind-Body' },
  { min: 41, max: 60, brand: 'Canyon Ranch', tier: 'Integrative Preventive Health' },
  { min: 61, max: 80, brand: 'SHA Wellness Clinic', tier: 'Medical Nutrition & Longevity Science' },
  { min: 81, max: 100, brand: 'Lanserhof', tier: 'Precision Medical Longevity' }
];

function toTrimmedString(value) {
  return typeof value === 'string' ? value.trim() : '';
}

function toBoolean(value) {
  const normalized = toTrimmedString(value).toLowerCase();
  return normalized === '1' || normalized === 'true' || normalized === 'yes' || normalized === 'on';
}

function setCorsHeaders(res) {
  res.setHeader('Access-Control-Allow-Origin', CORS_ALLOW_ORIGIN);
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
  if (CORS_ALLOW_ORIGIN !== '*') {
    res.setHeader('Vary', 'Origin');
  }
}

function getRequestId() {
  if (typeof crypto.randomUUID === 'function') {
    return crypto.randomUUID();
  }
  return `${Date.now()}-${Math.random().toString(36).slice(2, 10)}`;
}

function getLeadId() {
  const timeHex = Math.floor(Date.now() / 1000).toString(16).padStart(8, '0');
  const randomHex = crypto.randomBytes(8).toString('hex');
  return `${timeHex}${randomHex}`;
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
    return JSON.parse(req.body || '{}');
  }
  if (req.body && typeof req.body === 'object') {
    return req.body;
  }
  return {};
}

function passesContentGuardrails(text) {
  const value = toTrimmedString(text);
  if (!value) {
    return true;
  }

  const blockedPatterns = [
    /<script/i,
    /javascript:/i,
    /onerror\s*=/i,
    /onload\s*=/i,
    /data:text\/html/i
  ];

  if (blockedPatterns.some((pattern) => pattern.test(value))) {
    return false;
  }

  if (/(.)\1{39,}/.test(value.toLowerCase())) {
    return false;
  }

  return true;
}

function sanitizeText(value, maxLength) {
  const text = toTrimmedString(value);
  if (!text) {
    return '';
  }
  return text.slice(0, maxLength);
}

function isEmailValid(email) {
  if (!email) {
    return true;
  }
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
}

function isPhoneValid(phone) {
  if (!phone) {
    return true;
  }
  const digits = phone.replace(/\D/g, '');
  return digits.length >= 7 && digits.length <= 15;
}

function normalizeStringArray(value, maxItems, maxLength) {
  let items = [];
  if (Array.isArray(value)) {
    items = value;
  } else if (typeof value === 'string' && value.trim()) {
    items = value.split(',');
  }

  const output = [];
  const seen = new Set();
  for (const item of items) {
    const cleaned = sanitizeText(item, maxLength);
    if (!cleaned) {
      continue;
    }
    const key = cleaned.toLowerCase();
    if (seen.has(key)) {
      continue;
    }
    seen.add(key);
    output.push(cleaned);
    if (output.length >= maxItems) {
      break;
    }
  }

  return output;
}

function parseAge(value) {
  if (value === undefined || value === null || value === '') {
    return null;
  }

  const age = Number(value);
  if (!Number.isInteger(age) || age < 13 || age > 120) {
    return null;
  }
  return age;
}

function normalizeFollowUpDate(rawDate) {
  const value = toTrimmedString(rawDate);
  if (!value) {
    return null;
  }
  const parsed = new Date(value);
  if (Number.isNaN(parsed.getTime())) {
    return null;
  }
  return parsed.toISOString();
}

function inferFormType(body) {
  const explicitType = toTrimmedString(body.formType).toLowerCase();
  if (explicitType === 'healthscore' || explicitType === 'callback') {
    return explicitType;
  }

  if (body.personalDetails || body.assessment) {
    return 'healthscore';
  }

  return 'callback';
}

function validateAssessment(assessment) {
  if (assessment === undefined || assessment === null) {
    return { assessment: null, error: null };
  }

  if (typeof assessment !== 'object' || Array.isArray(assessment)) {
    return { assessment: null, error: 'assessment must be an object' };
  }

  const version = toTrimmedString(assessment.version);
  if (!ASSESSMENT_VERSIONS[version]) {
    return {
      assessment: null,
      error: 'assessment.version must be one of: v1_quick_vitality_check, v2_deep_longevity_assessment'
    };
  }

  const answers = assessment.answers;
  if (!answers || typeof answers !== 'object' || Array.isArray(answers)) {
    return { assessment: null, error: 'assessment.answers must be an object' };
  }

  const questionConfig = ASSESSMENT_VERSIONS[version];
  const normalizedAnswers = {};

  for (const question of questionConfig) {
    const rawScore = answers[question.id];
    const score = Number(rawScore);
    if (!Number.isInteger(score) || score < 1 || score > 4) {
      return {
        assessment: null,
        error: `assessment.answers.${question.id} must be an integer from 1 to 4`
      };
    }
    normalizedAnswers[question.id] = score;
  }

  return {
    assessment: {
      version,
      answers: normalizedAnswers
    },
    error: null
  };
}

function computeHealthScore(assessment) {
  const questionConfig = ASSESSMENT_VERSIONS[assessment.version];
  const categoryTotals = {};
  let totalScore = 0;
  let maxScore = 0;

  for (const question of questionConfig) {
    const score = assessment.answers[question.id];
    const category = question.category;

    if (!categoryTotals[category]) {
      categoryTotals[category] = { score: 0, max: 0 };
    }

    categoryTotals[category].score += score;
    categoryTotals[category].max += 4;

    totalScore += score;
    maxScore += 4;
  }

  const categoryScores = {};
  for (const [category, values] of Object.entries(categoryTotals)) {
    categoryScores[category] = Math.round((values.score / values.max) * 100);
  }

  const overallScore = Math.round((totalScore / maxScore) * 100);
  const band = BRAND_TIERS.find((item) => overallScore >= item.min && overallScore <= item.max)
    || BRAND_TIERS[BRAND_TIERS.length - 1];

  return {
    overallScore,
    categoryScores,
    brand: band.brand,
    tier: band.tier
  };
}

function buildNormalizedLead(body) {
  const formType = inferFormType(body);
  const details = body.personalDetails && typeof body.personalDetails === 'object' && !Array.isArray(body.personalDetails)
    ? body.personalDetails
    : {};

  const fallbackInterests = normalizeStringArray(
    body.interests !== undefined ? body.interests : body.intrests,
    20,
    80
  );

  const personalDetails = {
    fullName: sanitizeText(
      formType === 'healthscore' ? details.fullName : (body.name || body.leadName),
      120
    ),
    phoneNumber: sanitizeText(
      formType === 'healthscore' ? details.phoneNumber : (body.phone || body.mobile),
      40
    ),
    emailAddress: sanitizeText(
      formType === 'healthscore' ? details.emailAddress : body.email,
      160
    ).toLowerCase(),
    age: parseAge(details.age),
    gender: sanitizeText(details.gender, 30),
    city: sanitizeText(details.city, 80),
    primaryHealthGoal: sanitizeText(details.primaryHealthGoal, 120),
    fitnessLevel: sanitizeText(details.fitnessLevel, 100),
    wellnessInterests: normalizeStringArray(
      details.wellnessInterests !== undefined ? details.wellnessInterests : fallbackInterests,
      20,
      80
    ),
    notes: sanitizeText(details.notes || body.notes, 800)
  };

  if (formType === 'callback') {
    personalDetails.wellnessInterests = fallbackInterests;
  }

  if (!personalDetails.fullName) {
    return { error: 'name is required' };
  }

  if (!personalDetails.phoneNumber && !personalDetails.emailAddress) {
    return { error: 'phone or email is required' };
  }

  if (!isEmailValid(personalDetails.emailAddress)) {
    return { error: 'email format is invalid' };
  }

  if (!isPhoneValid(personalDetails.phoneNumber)) {
    return { error: 'phone format is invalid' };
  }

  const scannedTextFields = [
    personalDetails.fullName,
    personalDetails.phoneNumber,
    personalDetails.emailAddress,
    personalDetails.gender,
    personalDetails.city,
    personalDetails.primaryHealthGoal,
    personalDetails.fitnessLevel,
    personalDetails.notes,
    ...personalDetails.wellnessInterests
  ];

  if (scannedTextFields.some((value) => !passesContentGuardrails(value))) {
    return { error: 'payload contains blocked content patterns' };
  }

  const tags = normalizeStringArray(body.tags, 20, 50);
  if (tags.some((tag) => !passesContentGuardrails(tag))) {
    return { error: 'tags contain blocked content patterns' };
  }

  const source = sanitizeText(body.source, 120) || 'fitflix.in';
  if (!passesContentGuardrails(source)) {
    return { error: 'source contains blocked content patterns' };
  }

  const followUpDateValue = body.followUpDate;
  const followUpDate = normalizeFollowUpDate(followUpDateValue);
  if (followUpDateValue && !followUpDate) {
    return { error: 'followUpDate must be a valid ISO date or parseable date string' };
  }

  const assessmentResult = validateAssessment(body.assessment);
  if (assessmentResult.error) {
    return { error: assessmentResult.error };
  }

  const normalizedLead = {
    leadId: getLeadId(),
    formType,
    personalDetails,
    assessment: assessmentResult.assessment,
    source,
    tags,
    followUpDate,
    metadata: {
      capturedAt: new Date().toISOString()
    }
  };

  return { lead: normalizedLead };
}

async function verifyCaptcha(secret, token, clientIp) {
  const missingToken = !toTrimmedString(token);
  if (missingToken) {
    return {
      checked: true,
      passed: false,
      reason: 'missing_token'
    };
  }

  const body = new URLSearchParams({
    secret,
    response: token
  });

  if (clientIp && clientIp !== 'unknown') {
    body.set('remoteip', clientIp);
  }

  const timeoutController = new AbortController();
  const timeout = setTimeout(() => timeoutController.abort(), CAPTCHA_TIMEOUT_MS);

  try {
    const response = await fetch(CAPTCHA_VERIFY_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded'
      },
      body: body.toString(),
      signal: timeoutController.signal
    });

    const payload = await response.json().catch(() => ({}));
    const success = Boolean(payload.success);

    return {
      checked: true,
      passed: success,
      reason: success ? 'verified' : ((payload['error-codes'] || []).join(',') || 'verification_failed'),
      score: typeof payload.score === 'number' ? payload.score : null
    };
  } catch (error) {
    return {
      checked: true,
      passed: false,
      reason: error.name === 'AbortError' ? 'verification_timeout' : 'verification_unreachable'
    };
  } finally {
    clearTimeout(timeout);
  }
}

function logEvent(level, requestId, message, extra) {
  console.log(JSON.stringify({
    level,
    requestId,
    message,
    ...extra
  }));
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
    logEvent('warn', requestId, 'lead_rate_limited', { clientIp });
    return res.status(429).json({
      error: 'Too many requests, please wait and try again.',
      request_id: requestId
    });
  }

  let body;
  try {
    body = parseJsonBody(req);
  } catch (_error) {
    return res.status(400).json({
      error: 'Invalid JSON body',
      request_id: requestId
    });
  }

  if (toTrimmedString(body.website)) {
    logEvent('info', requestId, 'lead_honeypot_triggered', {
      clientIp,
      latencyMs: Date.now() - startedAt
    });
    return res.status(202).json({
      message: 'Lead captured',
      leadId: getLeadId()
    });
  }

  const captchaSecret = toTrimmedString(process.env.LEAD_CAPTCHA_SECRET);
  const captchaRequired = toBoolean(process.env.LEAD_CAPTCHA_REQUIRED);
  const captchaToken = toTrimmedString(body.captchaToken);

  let captchaCheck = {
    checked: false,
    passed: false,
    reason: 'not_configured'
  };

  if (captchaSecret) {
    captchaCheck = await verifyCaptcha(captchaSecret, captchaToken, clientIp);

    if (captchaRequired && !captchaCheck.passed) {
      logEvent('warn', requestId, 'lead_captcha_rejected', {
        clientIp,
        reason: captchaCheck.reason,
        latencyMs: Date.now() - startedAt
      });
      return res.status(400).json({
        error: 'Captcha validation failed',
        request_id: requestId
      });
    }
  }

  const normalized = buildNormalizedLead(body);
  if (normalized.error) {
    return res.status(400).json({
      error: normalized.error,
      request_id: requestId
    });
  }

  const lead = normalized.lead;
  const healthScore = lead.assessment ? computeHealthScore(lead.assessment) : null;

  logEvent('info', requestId, 'lead_captured', {
    leadId: lead.leadId,
    formType: lead.formType,
    source: lead.source,
    tagsCount: lead.tags.length,
    hasAssessment: Boolean(lead.assessment),
    captchaChecked: captchaCheck.checked,
    captchaPassed: captchaCheck.passed,
    latencyMs: Date.now() - startedAt
  });

  const responsePayload = {
    message: 'Lead captured',
    leadId: lead.leadId
  };

  if (healthScore) {
    responsePayload.healthScore = healthScore;
  }

  return res.status(202).json(responsePayload);
};
