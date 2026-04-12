# Fitflix Sainikpuri - Vercel Deployment

This project is configured to deploy as a static site + Vercel Serverless Function.

## Architecture

- Frontend: `index.html`
- Backend proxy routes: `api/chat.js`, `api/leads/public-capture.js`
- Chat endpoint from browser: `/api/chat`
- Public lead capture endpoint: `/leads/public-capture` (rewritten to `/api/leads/public-capture`)
- Upstream RAG API: `CHATPLUG_API_URL` (default `http://65.0.21.64:7860/v1/chat`)

## Required Vercel Environment Variables

Set these in Vercel Project Settings -> Environment Variables:

- `CHATPLUG_API_KEY` = your tenant key (`cp_...`)
- `CHATPLUG_API_URL` = `http://65.0.21.64:7860/v1/chat`
- `CHATPLUG_COLLECTION_ID` = `fitflix-collection`

Optional hardening variables:

- `RATE_LIMIT_MAX` = requests per IP per window (default `20`)
- `RATE_LIMIT_WINDOW_MS` = rate-limit window in milliseconds (default `60000`)
- `MAX_MESSAGE_LENGTH` = max accepted message characters (default `1200`)
- `UPSTREAM_TIMEOUT_MS` = timeout for Chatplug call (default `15000`)

Lead capture variables:

- `LEAD_RATE_LIMIT_MAX` = requests per IP per window for lead capture (default `20`)
- `LEAD_RATE_LIMIT_WINDOW_MS` = rate-limit window in milliseconds for lead capture (default `60000`)
- `LEAD_CAPTCHA_SECRET` = captcha verification secret (if set, captcha verification runs)
- `LEAD_CAPTCHA_REQUIRED` = `true`/`false` to enforce captcha verification
- `LEAD_CAPTCHA_VERIFY_URL` = verification endpoint (default `https://www.google.com/recaptcha/api/siteverify`)
- `LEAD_CAPTCHA_TIMEOUT_MS` = captcha verification timeout in milliseconds (default `8000`)
- `LEAD_CORS_ALLOW_ORIGIN` = CORS origin for public lead endpoint (default `*`)

## Public Lead Capture API

`POST /leads/public-capture`

Accepted payload shapes:

- Health score lead with `formType: "healthscore"`, `personalDetails`, and optional `assessment`
- Callback lead with `formType: "callback"`, `name`, `phone`, `email`, and `interests`
- Compatibility aliases:
   - `intrests` is accepted as alias for `interests`
   - legacy top-level `leadName` + `email` is accepted

Assessment behavior:

- Supports `assessment.version` values:
   - `v1_quick_vitality_check`
   - `v2_deep_longevity_assessment`
- `assessment.answers` must include all required question IDs for the selected version
- Scores must be integers from `1` to `4`
- If assessment is present, response includes computed `healthScore`, category scores, `brand`, and `tier`

Security behavior:

- IP-based rate limiting is applied
- Honeypot field `website` returns `202` and ignores submission when non-empty
- Captcha verification runs when `LEAD_CAPTCHA_SECRET` is configured
- When `LEAD_CAPTCHA_REQUIRED=true`, requests are rejected unless captcha passes

## Local Dev (optional)

1. Install Vercel CLI:
   - `npm i -g vercel`
2. Copy `.env.example` to `.env`
3. Fill `.env` with real values
4. Run:
   - `vercel dev`

Open `http://localhost:3000`.

For Vite local development, this project also supports:

- `npm run dev`

The local middleware serves:

- `/api/chat`
- `/api/leads/public-capture`
- `/leads/public-capture`

## Deploy to Vercel

1. Login:
   - `vercel login`
2. From project root:
   - `vercel`
3. For production:
   - `vercel --prod`

## Notes

- API key is never exposed in frontend code.
- Client only sends `{ "message": "..." }` to `/api/chat`.
- Server function injects `collection_id` and bearer token when calling Chatplug.
- Every response includes `request_id` and `x-request-id` for easier log tracing.
- Booking modal in `index.html` submits callback leads to `/leads/public-capture`.
- Health score page in `fitflix_longevity_health_score.html` submits assessment leads to `/leads/public-capture`.
