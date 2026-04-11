# Fitflix Sainikpuri - Vercel Deployment

This project is configured to deploy as a static site + Vercel Serverless Function.

## Architecture

- Frontend: `index.html`
- Backend proxy: `api/chat.js`
- Chat endpoint from browser: `/api/chat`
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

## Local Dev (optional)

1. Install Vercel CLI:
   - `npm i -g vercel`
2. Copy `.env.example` to `.env`
3. Fill `.env` with real values
4. Run:
   - `vercel dev`

Open `http://localhost:3000`.

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
