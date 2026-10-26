type Pixel = (...args: unknown[]) => void;
declare global {
  interface Window {
    fbq?: Pixel;
    _fbq?: Pixel;
  }
}
const key = "fitflix-ad-consent";
let currentPixel: string | null = null;
export function getAdConsent(): "accepted" | "declined" | null {
  try {
    const value = localStorage.getItem(key);
    return value === "accepted" || value === "declined" ? value : null;
  } catch {
    return null;
  }
}
export function setAdConsent(value: "accepted" | "declined") {
  try {
    localStorage.setItem(key, value);
  } catch {
    /* browser storage unavailable */
  }
  if (value === "declined" && window.fbq) window.fbq("consent", "revoke");
}
export function initMetaPixel(id: string | null) {
  if (!id || !/^\d{5,30}$/.test(id) || getAdConsent() !== "accepted") return;
  if (currentPixel === id) {
    window.fbq?.("consent", "grant");
    return;
  }
  if (!window.fbq) {
    const q: unknown[][] = [];
    const f = ((...args: unknown[]) => {
      const n = f as Pixel & { callMethod?: Pixel };
      if (n.callMethod) n.callMethod(...args);
      else q.push(args);
    }) as Pixel & {
      queue: unknown[][];
      loaded: boolean;
      version: string;
      push?: Pixel;
    };
    f.queue = q;
    f.loaded = true;
    f.version = "2.0";
    f.push = f;
    window.fbq = f;
    window._fbq = f;
    const script = document.createElement("script");
    script.async = true;
    script.src = "https://connect.facebook.net/en_US/fbevents.js";
    document.head.appendChild(script);
  }
  window.fbq("consent", "grant");
  window.fbq("init", id);
  window.fbq("track", "PageView");
  currentPixel = id;
}
export function trackEvent(
  event: "ApplicationStart" | "Lead" | "FounderBookingOpen" | "CallRequested"
) {
  if (getAdConsent() !== "accepted" || !window.fbq || !currentPixel) return;
  if (event === "Lead") window.fbq("track", "Lead");
  else window.fbq("trackCustom", event);
  // Never include answers, health interests, qualification scores, contact details or tokens.
}
export function getAttribution() {
  const params = new URLSearchParams(window.location.search);
  const data: Record<string, string> = {};
  for (const [dest, source] of [
    ["source", "utm_source"],
    ["medium", "utm_medium"],
    ["campaign", "utm_campaign"],
    ["content", "utm_content"],
    ["term", "utm_term"],
  ] as const) {
    const value = params.get(source);
    if (value) data[dest] = value.slice(0, 200);
  }
  // Store Meta click IDs only after optional advertising consent.
  if (getAdConsent() === "accepted") {
    const click = params.get("fbclid");
    if (click) data.fbclid = click.slice(0, 500);
  }
  return data;
}
