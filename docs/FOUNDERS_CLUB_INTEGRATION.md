# Kompally Founders Club native integration

This branch adds the native FitFlix campaign at `/kompally/founders-club` and its campaign privacy route at `/kompally/founders-club/privacy`. Vercel rewrites point those clean URLs to `locations/kompally-founders-club.html` and `pages/kompally-founders-privacy.html`, respectively. Existing static routes remain Vite inputs and were not replaced.

## Native source and build

Editable React source lives under `founders-club/src/`; the copied public modules are `Home`, `Privacy`, `ApplicationWizard`, `LandingContent`, `BrandShell`, `ResultBrief`, `WellnessAvatar`, `DnaHero`, their CSS, the dialog primitive, analytics/content/utils, and the shared founders/questionnaire schemas. `founders-club/src/lib/trpc.ts` keeps typed React hooks while using a same-origin REST tRPC link. It sends no Manus-cookie or Authorization headers. `shared/router.ts` is type metadata only; it is never a runtime backend stub.

The root uses the existing npm lock manager. `npm run build` runs the existing Vite 8 multi-page build and includes both campaign HTML inputs. `tsconfig.native.json` is a focused source check for the campaign. The Tailwind v4 Vite plugin is loaded dynamically because the existing Vite config is CommonJS.

## Backend binding

The browser calls `/api/presales/founders?operation=<whitelisted-action>`. `api/presales/founders.js` accepts only the public operation/method pairs and forwards to the fixed same-origin backend paths:

- `GET /presales/founders/settings`
- `GET /presales/founders/slots`
- `POST /presales/founders/submit`
- `POST /presales/founders/lead`
- `POST /presales/founders/booking-config`
- `POST /presales/founders/request-call`

Set exactly one runtime server environment variable: `PRESALES_BACKEND_ORIGIN`, an HTTPS origin with no path, query, credentials, or fragment. If it is absent or invalid, the proxy returns a descriptive `503`; it does not fake captures. Requests are bounded to 256 KiB, use a timeout, return `no-store`, do not log contact/body data, and sanitize upstream errors. Admin routes remain backend-protected and there is no frontend admin page.

The backend must provide public settings, slot records (`id`, `startAt`, `endAt`, with ISO timestamps), exact application results, private lead retrieval, booking configuration, and call-request responses. Booking is `null` by default until an actual scheduler/admin setting exists. No database writes or real application submissions were performed during this integration.

## Assets and privacy

All campaign media references are durable HTTPS CDN URLs; no `/manus-storage` paths remain. The DNA hero uses the exact preferred transparent image and the result guide uses the mapped public GLB. The campaign keeps the consent gate, private brief retrieval in session storage, and privacy links without putting private tokens in URLs. A campaign application or call request is not payment, membership confirmation, or a confirmed appointment.

This work is branch-only on `feat/kompally-founders-club-2026-10-25`. It was not merged to `main`, deployed, or connected to the managed Preview origin.

The site CSP permits the Meta SDK at `connect.facebook.net`; the existing advertising-consent gate still controls whether it loads. Native results use a structured personalised brief, not an invented AI-outage message. Public slots use `{ id, startAt, endAt }` and non-founder clients can request a pending team follow-up without a founder slot.
