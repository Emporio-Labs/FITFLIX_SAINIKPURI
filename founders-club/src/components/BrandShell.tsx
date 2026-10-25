import React, { useEffect, useState } from "react";
import { ArrowUpRight } from "lucide-react";
import { assets } from "@/lib/content";
import { getAdConsent, setAdConsent, initMetaPixel } from "@/lib/analytics";

export function BrandHeader({
  onApply,
  simple = false,
}: {
  onApply?: () => void;
  simple?: boolean;
}) {
  return (
    <header className="brand-header simplified-header">
      <a
        className="brand"
        href="https://www.fitflix.in"
        aria-label="FitFlix home"
      >
        <img
          src={assets.logo}
          alt="FitFlix Wellness Club"
          width="34"
          height="30"
        />
        <span className="brand-wordmark">Fitflix</span>
      </a>
      <span className="nav-branch">
        KOMPALLY <span>·</span> FOUNDERS CLUB
      </span>
      {!simple && (
        <nav
          className="simple-header-actions"
          aria-label="Founders Club navigation"
        >
          <a className="simple-membership-link" href="#memberships">
            Memberships
          </a>
          <button
            className="button small nav-apply"
            onClick={onApply}
            aria-label="Find my Founders Club fit"
          >
            <span className="desktop-cta-label">Find my Founders Club fit</span>
            <span className="mobile-cta-label">Find my fit</span>
            <ArrowUpRight size={17} />
          </button>
        </nav>
      )}
    </header>
  );
}
export function BrandFooter() {
  return (
    <footer className="brand-footer">
      <div>
        <a
          className="brand footer-brand"
          href="https://www.fitflix.in"
          aria-label="FitFlix home"
        >
          <img
            src={assets.logo}
            alt="FitFlix Wellness Club"
            width="34"
            height="30"
          />
          <span className="brand-wordmark">Fitflix</span>
        </a>
        <p>A stronger life. A more intentional beginning.</p>
      </div>
      <div>
        <span className="eyebrow">KOMPALLY · HYDERABAD</span>
        <p>6th floor, Fairmont Downtown, Kompally.</p>
        <a
          href="https://maps.app.goo.gl/qyu7CKjSomi5AfG86"
          target="_blank"
          rel="noreferrer"
        >
          Find the club <ArrowUpRight size={14} />
        </a>
      </div>
      <div className="footer-links">
        <a href="/kompally/founders-club/privacy">Enquiry privacy</a>
        <a
          href="https://www.fitflix.in/pages/privacy.html"
          target="_blank"
          rel="noreferrer"
        >
          FitFlix privacy policy
        </a>
        <a href="mailto:support@fitflix.in">support@fitflix.in</a>
        <button
          className="text-button"
          onClick={() =>
            window.dispatchEvent(new Event("fitflix-consent-open"))
          }
        >
          Advertising preferences
        </button>
      </div>
      <p className="footer-disclaimer">
        Presale application only. Results vary. Screening and wellness services
        are subject to professional suitability checks; this page and its
        questionnaire are not a medical assessment. Service imagery is
        illustrative. The DNA helix is symbolic brand artwork, not a genetic
        result or a promise that genetic testing is included in every plan.
      </p>
    </footer>
  );
}
export function ConsentBanner({ pixelId }: { pixelId: string | null }) {
  const [choice, setChoice] = useState(getAdConsent);
  const [open, setOpen] = useState(false);
  useEffect(() => {
    const show = () => setOpen(true);
    window.addEventListener("fitflix-consent-open", show);
    return () => window.removeEventListener("fitflix-consent-open", show);
  }, []);
  useEffect(() => {
    if (pixelId && !choice) setOpen(true);
    if (choice === "accepted") initMetaPixel(pixelId);
  }, [choice, pixelId]);
  function select(value: "accepted" | "declined") {
    setAdConsent(value);
    setChoice(value);
    setOpen(false);
  }
  if (!open) return null;
  return (
    <aside className="consent-banner" aria-label="Advertising preferences">
      <div>
        <strong>Your privacy, your choice.</strong>
        <p>
          Optional Meta measurement helps us understand campaign performance. We
          never send questionnaire answers to Meta. Declining does not affect
          your application. <a href="/kompally/founders-club/privacy">Details</a>
        </p>
      </div>
      <div className="consent-actions">
        <button
          className="button outline small"
          onClick={() => select("declined")}
        >
          Decline optional ads
        </button>
        <button className="button small" onClick={() => select("accepted")}>
          Allow optional ads
        </button>
      </div>
    </aside>
  );
}
