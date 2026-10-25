import React from "react";
import { BrandHeader, BrandFooter } from "@/components/BrandShell";
export default function Privacy() {
  return (
    <>
      <BrandHeader simple />
      <main className="legal-page">
        <span className="eyebrow">FITFLIX KOMPALLY · FOUNDERS CLUB</span>
        <h1>
          Your enquiry.
          <br />
          <em>Your privacy.</em>
        </h1>
        <p>
          This notice applies to the Kompally Founders Club application and
          Founder Call Brief. Last updated 25 October 2026. Read it together
          with{" "}
          <a
            href="https://www.fitflix.in/pages/privacy.html"
            target="_blank"
            rel="noreferrer"
          >
            FitFlix’s main privacy policy
          </a>
          .
        </p>
        <h2>What this questionnaire is for</h2>
        <p>
          It helps FitFlix understand your stated goals, purpose, purchase
          priorities, questions, schedule, support preferences and next step.
          Non-contact questions use defined choices rather than written
          disclosures. Optional grounding, gratitude and ordinary-day
          visualisation prompts can be skipped; they are not therapy, hypnosis,
          a religious practice or a condition of applying. We do not infer a
          subconscious personality or a medical diagnosis from your choices.
          Please do not put medical details in contact or booking fields.
        </p>
        <h2>What we collect</h2>
        <p>
          Your name, email, mobile number, preferred contact channel,
          questionnaire answers, voluntary personal intention, consent
          selections, enquiry time, campaign referral parameters and booking
          requests. The server also uses limited request information to protect
          against abuse. Meta click IDs are captured only when optional
          advertising consent is accepted.
        </p>
        <h2>How we use it</h2>
        <p>
          To prepare and show your brief, understand programme fit, manage the
          enquiry, respond through your chosen channel and organise a founder
          conversation or visit discussion. Marketing consent is optional and
          separate from permission to respond to this enquiry. We do not request
          payment details in this application.
        </p>
        <h2>AI-assisted and 3D briefings</h2>
        <p>
          Selected non-medical multiple-choice questionnaire answers may be
          processed by an AI service to produce your text brief and narration.
          Your name, email, phone, free-text personal reason/intention and
          ad-attribution identifiers are not included in that AI request. If the
          service is unavailable, a structured brief is created from your
          selected answers and labelled accordingly. The 3D guide is an original
          synthetic visual, not the founder, a doctor or a diagnostic
          representation of your body. On-demand audio uses your browser’s
          available speech service, whose processing depends on your device and
          browser.
        </p>
        <p>
          Recognised multiple-choice reasons and intentions may be included in
          your AI-assisted brief. Earlier free-text answers, contact details and
          attribution identifiers remain excluded from the model request. The
          landing-page DNA helix is symbolic artwork, not a genetic result and
          not an indication that genetic testing is included in every
          membership.
        </p>
        <h2>Storage and access</h2>
        <p>
          Enquiry records are stored in the campaign’s managed database and
          accessible through a protected owner dashboard. A private access token
          is stored in your browser’s session storage to reopen your brief in
          the current browser session. Treat your device and any private access
          token as confidential. We do not expose a public directory of
          applicants or share questionnaire answers with Meta.
        </p>
        <h2>Optional advertising measurement</h2>
        <p>
          If you choose to allow it and FitFlix has configured a Meta Pixel,
          generic events such as application start, lead completion and opening
          the founder calendar may be measured. Questionnaire answers, medical
          interests, qualification scores, contact details and private tokens
          are not included in event parameters. You can change your preference
          using “Advertising preferences” in the footer. Declining optional
          advertising does not prevent applying. The hosting platform may
          independently collect operational or aggregate analytics under its own
          policies.
        </p>
        <h2>Founder booking</h2>
        <p>
          A live external Google Calendar, Calendly or Cal.com scheduler may be
          opened after your brief. Its own terms and privacy policy apply.
          Availability and actual Google Meet invitations are controlled by that
          scheduler and the founder. If no live scheduler is connected, this
          page records a call request only. It does not create a confirmed
          appointment or reserve a membership.
        </p>
        <h2>Contact, withdrawal and deletion</h2>
        <p>
          For questions, correction, a request to delete your enquiry, or to
          withdraw marketing permission, email{" "}
          <a href="mailto:support@fitflix.in">support@fitflix.in</a> with
          “Kompally Founders Club privacy” in the subject. You may also ask the
          team through your agreed follow-up channel. FitFlix will respond and
          handle records in accordance with its applicable obligations and main
          privacy policy. Do not email private medical records with an enquiry.
        </p>
        <h2>Before making a commitment</h2>
        <p>
          Completing the questionnaire and booking a call do not constitute
          payment, membership confirmation or an enrolment contract. Opening
          date, final price and taxes, screening and coaching inclusions,
          service credits, safety/suitability and pause/cancellation terms must
          be confirmed in writing before you join. Results vary. DNA-informed
          programming is not a guarantee and does not replace professional
          judgement.
        </p>
      </main>
      <BrandFooter />
    </>
  );
}
