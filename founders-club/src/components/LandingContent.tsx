import React from "react";
import DnaHero from "./DnaHero";
const dnaFallback = "https://files.manuscdn.com/user_upload_by_module/session_file/310419663030674154/XFNwydSXhLACJKXa.webp";
import {
  ArrowUpRight,
  ArrowRight,
  Check,
  ChevronDown,
  Activity,
  Dna,
  Dumbbell,
  Smartphone,
  ShieldCheck,
  MapPin,
  ScanLine,
  CalendarDays,
  Sparkles,
} from "lucide-react";
import { assets, appLinks, pilatesPackages, faqs } from "@/lib/content";
import { BrandHeader, BrandFooter } from "./BrandShell";
import {
  defaultSettings,
  memberCapacity,
  type CampaignSettings,
} from "@shared/founders";

const services = [
  {
    title: "Cold plunge",
    description: "A guided chilled-water immersion experience.",
    image: assets.cold,
    credits: 5,
    access: "Elite",
  },
  {
    title: "Infrared sauna",
    description: "Infrared warmth in a dedicated sauna cabin.",
    image: assets.sauna,
    credits: 4,
    access: "Elite + Club",
  },
  {
    title: "Collagen bed",
    description: "A full-body light-therapy bed experience.",
    image: assets.collagen,
    credits: 5,
    access: "Elite",
  },
  {
    title: "Oxygen therapy",
    description: "Oxygen delivery — not a hyperbaric chamber.",
    image: assets.oxygen,
    credits: 4,
    access: "Elite",
  },
  {
    title: "Compression therapy",
    description: "Pneumatic leg boots with controlled compression.",
    image: assets.compression,
    credits: 2,
    access: "Elite",
  },
  {
    title: "Automatic massage bed",
    description: "A motorised bed-based massage experience.",
    image: assets.massage,
    credits: 2,
    access: "Elite + Club",
  },
];
export function ApplicationCTA({
  onClick,
  children = "Find my Founders Club fit",
  outline = false,
}: {
  onClick: () => void;
  children?: React.ReactNode;
  outline?: boolean;
}) {
  return (
    <button className={`button ${outline ? "outline" : ""}`} onClick={onClick}>
      {children}
      <ArrowUpRight size={18} />
    </button>
  );
}
export default function LandingContent({
  settings = defaultSettings,
  onApply = () => {},
  embedded = false,
  availabilityVerified = false,
}: {
  settings?: CampaignSettings;
  onApply?: () => void;
  embedded?: boolean;
  availabilityVerified?: boolean;
}) {
  const closed =
    !settings.applicationOpen ||
    (settings.confirmedMembers !== null &&
      settings.confirmedMembers >= memberCapacity) ||
    Boolean(settings.deadline && Date.parse(settings.deadline) <= Date.now());
  const remaining =
    settings.confirmedMembers === null
      ? null
      : Math.max(0, memberCapacity - settings.confirmedMembers);
  return (
    <div className={`landing ${embedded ? "embedded" : ""}`}>
      {!embedded && <BrandHeader onApply={onApply} />}
      <main>
        <section className="hero-section" aria-labelledby="hero-heading">
          <div className="hero-copy">
            <div className="launch-label">
              <span className="status-dot" /> KOMPALLY PRESALES · FOUNDERS CLUB
            </div>
            <h1 id="hero-heading">
              <span className="founders-title">Founders Club.</span>
              <em>
                Your health.
                <br />
                Your next chapter.
              </em>
            </h1>
            <p className="hero-description">
              An invitation for Kompally’s first 100 members.
              <br />A considered approach to training, recovery and progress.
            </p>
            <p className="hero-subcopy">
              Begin with what matters to you. Get a personal brief.
              <br />
              Then explore your fit with the founder.
            </p>
            <ApplicationCTA onClick={onApply}>
              {availabilityVerified && closed
                ? "Applications currently closed"
                : "Find my Founders Club fit"}
            </ApplicationCTA>
            <div className="cta-reassurance">
              <ShieldCheck size={15} />
              <span>Choice-based · about 3–4 minutes · no payment</span>
            </div>
            <div className="hero-location">
              <MapPin size={16} />
              <span>6th floor, Fairmont Downtown, Kompally</span>
            </div>
          </div>
          <div className="hero-visual">
            <DnaHero fallbackUrl={dnaFallback} />
            <div className="founder-badge">
              <span className="eyebrow">THE FOUNDERS CLUB</span>
              <span className="badge-number">100</span>
              <span className="badge-sub">FOUNDING MEMBERS</span>
              <div className="badge-line" />
              <span className="badge-status">
                {!availabilityVerified
                  ? "100-member launch cohort"
                  : closed
                    ? "Applications currently closed"
                    : remaining === null
                      ? "Applications now open"
                      : `${remaining} places not yet confirmed`}
              </span>
            </div>
          </div>
        </section>
        <div className="promise-strip">
          <span>
            <ScanLine size={17} /> SCREENING FIRST
          </span>
          <span>
            <Dumbbell size={17} /> GOAL-BASED TRAINING
          </span>
          <span>
            <Activity size={17} /> SIX WELLNESS SERVICES
          </span>
          <span>
            <Smartphone size={17} /> FITFLIX APP TRACKING
          </span>
        </div>
        <section className="intro-section section-pad" id="founders">
          <div className="intro-label">
            <span className="eyebrow">NOT ANOTHER GYM MEMBERSHIP</span>
            <span className="section-index">01 / THE BEGINNING</span>
          </div>
          <div className="intro-columns">
            <h2>
              Less guesswork.
              <br />
              <em>More direction.</em>
            </h2>
            <div>
              <p className="lead-text">
                A place for your priorities. A plan that fits your life.
              </p>
              <p>
                FitFlix brings assessment-led training, recovery and progress
                tracking into one place. The Kompally Founders Club is an
                invitation to begin that journey with clarity — not another
                promise you have to figure out alone.
              </p>
              <a className="text-link" href="#journey">
                See how the journey works <ArrowRight size={17} />
              </a>
            </div>
          </div>
          <div className="founders-note">
            <div>
              <span className="eyebrow">A SMALL FIRST COHORT</span>
              <h3>
                Be part of the beginning.
                <br />
                Not the crowd that follows.
              </h3>
            </div>
            <div>
              <p>
                The launch cohort is limited to{" "}
                <strong>100 confirmed memberships</strong>. Start with your
                personal brief, then discuss fit, availability and the written
                offer with the founder.
              </p>
              {settings.presaleNote && (
                <p className="owner-note">{settings.presaleNote}</p>
              )}
              {settings.deadline && (
                <p className="deadline">
                  Applications{" "}
                  {Date.parse(settings.deadline) <= Date.now()
                    ? "closed"
                    : "close"}
                  :{" "}
                  {new Date(settings.deadline).toLocaleString("en-IN", {
                    timeZone: "Asia/Kolkata",
                    dateStyle: "medium",
                    timeStyle: "short",
                  })}{" "}
                  IST
                </p>
              )}
              <p className="fineprint">
                Applying or booking a call does not reserve a membership. No
                payment is taken on this page.
              </p>
            </div>
          </div>
        </section>
        <section className="journey-section section-pad" id="journey">
          <div className="section-heading">
            <div>
              <span className="eyebrow">
                YOUR FIRST 90 DAYS, WITH DIRECTION
              </span>
              <h2>
                A plan around you.
                <br />
                <em>Not the other way around.</em>
              </h2>
            </div>
            <p>
              Two goal-based programme routes:
              <br />
              90-day transformation and DNA-informed transformation.
              <br />
              <strong>₹1,50,000 MRP · Separate coaching programme</strong>
            </p>
          </div>
          <div className="journey-track">
            {[
              [
                "01",
                "Understand",
                "Screening assessments: body composition, blood and genetic testing where included, plus strength and range-of-motion testing.",
              ],
              [
                "02",
                "Programme",
                "Translate your goals and assessment findings into a practical training and recovery plan.",
              ],
              [
                "03",
                "Execute",
                "One-to-one personal training and end-to-end coaching for the 90-day programme.",
              ],
              [
                "04",
                "Track & refine",
                "Track your wellness and training in the FitFlix app. Review progress and refine the plan with your team.",
              ],
            ].map(([number, title, copy]) => (
              <article className="journey-step" key={number}>
                <span className="step-number">{number}</span>
                <h3>{title}</h3>
                <p>{copy}</p>
              </article>
            ))}
          </div>
          <div className="journey-footnote">
            <Dna size={20} />
            <p>
              DNA-informed means one input into a broader assessment — not a
              genetic guarantee. Programme inclusions, coaching frequency and
              testing are confirmed before enrolment. Progress is individual.
            </p>
          </div>
        </section>
        <section className="services-section section-pad" id="experience">
          <div className="section-heading">
            <div>
              <span className="eyebrow">TRAIN. RECOVER. REPEAT.</span>
              <h2>
                Wellness you can see.
                <br />
                <em>Choices you can understand.</em>
              </h2>
            </div>
            <p>
              Six distinct experiences. Clear access and credits.
              <br />
              Your team helps determine what is appropriate for you.
            </p>
          </div>
          <div className="service-grid">
            {services.map(service => (
              <article className="service-card" key={service.title}>
                <div className="service-image">
                  <img
                    src={service.image}
                    alt={`Illustration of ${service.title.toLowerCase()} equipment`}
                    loading="lazy"
                    width="640"
                    height="426"
                  />
                  <span className="service-credit">
                    {service.credits} CREDITS / SESSION
                  </span>
                </div>
                <div className="service-info">
                  <span className="eyebrow">{service.access}</span>
                  <h3>{service.title}</h3>
                  <p>{service.description}</p>
                </div>
              </article>
            ))}
          </div>
          <p className="fineprint services-note">
            Service images are illustrative. Wellness sessions are subject to
            screening, suitability, credit allowance and booking availability.
            Elite accesses all six services; Club accesses infrared sauna and
            automatic massage beds. Credits are not unlimited.
          </p>
        </section>
        <section className="pilates-section section-pad">
          <div className="pilates-copy">
            <span className="eyebrow">YOUR MOVEMENT, REFINED</span>
            <h2>
              Reformer Pilates.
              <br />
              <em>Precision with purpose.</em>
            </h2>
            <p>
              Spring-resistance training on a moving carriage — for controlled
              strength, mobility and movement quality. A dedicated route for
              those who prefer a focused Pilates experience.
            </p>
            <p className="credit-note">
              <strong>Already an Elite or Club member?</strong>
              <br />
              Reformer Pilates is 4 credits per session.
            </p>
            <ApplicationCTA onClick={onApply} outline>
              Find my Founders Club fit
            </ApplicationCTA>
          </div>
          <div className="pilates-panel">
            <img
              src={assets.reformer}
              alt="Reformer Pilates machine showing the moving carriage, footbar and rope system"
              loading="lazy"
              width="900"
              height="430"
            />
            <div className="pilates-prices">
              <span className="eyebrow">EXCLUSIVE PILATES PACKAGES</span>
              <table>
                <thead>
                  <tr>
                    <th>Package</th>
                    <th>Sessions</th>
                    <th>Price</th>
                  </tr>
                </thead>
                <tbody>
                  {pilatesPackages.map(p => (
                    <tr key={p.duration}>
                      <td>{p.duration}</td>
                      <td>{p.sessions}</td>
                      <td>
                        ₹{p.price} <small>+ taxes</small>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
              <p className="fineprint">
                Standalone Pilates packages are separate from memberships and
                90-day programmes. Confirm starter validity, class format and
                booking terms with the team.
              </p>
            </div>
          </div>
        </section>
        <section className="app-section section-pad">
          <div className="app-visual">
            <div className="phone-frame">
              <img
                src="https://files.manuscdn.com/user_upload_by_module/session_file/310419663030674154/izpZUOwLMbdUKozt.png"
                alt="Official FitFlix app screenshot"
                loading="lazy"
                width="320"
                height="640"
              />
            </div>
            <div className="app-orbit orbit-one" />
            <div className="app-orbit orbit-two" />
            <div className="app-chip">
              <Activity size={17} /> One connected journey
            </div>
          </div>
          <div className="app-copy">
            <span className="eyebrow">THE FITFLIX APP · ALREADY LIVE</span>
            <h2>
              Your effort.
              <br />
              Your progress.
              <br />
              <em>In one place.</em>
            </h2>
            <p>
              Bring your training and wellness into one connected view. Your app
              supports a journey you can follow, discuss and build on — not a
              plan that disappears after your first session.
            </p>
            <div className="app-feature">
              <Check size={17} />
              <span>Training and wellness tracking</span>
            </div>
            <div className="app-feature">
              <Check size={17} />
              <span>A shared reference for progress conversations</span>
            </div>
            <div className="app-feature">
              <Check size={17} />
              <span>Available now on iPhone and Android</span>
            </div>
            <div className="app-downloads">
              <a
                href={appLinks.ios}
                target="_blank"
                rel="noreferrer"
                className="button outline small"
              >
                App Store <ArrowUpRight size={15} />
              </a>
              <a
                href={appLinks.android}
                target="_blank"
                rel="noreferrer"
                className="button outline small"
              >
                Google Play <ArrowUpRight size={15} />
              </a>
            </div>
            <p className="fineprint">
              Official app screenshot. Features and records depend on your plan,
              team workflow and app version.
            </p>
          </div>
        </section>
        <section className="memberships-section section-pad" id="memberships">
          <div className="section-heading">
            <div>
              <span className="eyebrow">CLARITY BEFORE COMMITMENT</span>
              <h2>
                Choose the level
                <br />
                <em>of support you need.</em>
              </h2>
            </div>
            <p>
              Published annual membership prices.
              <br />
              Final presale terms are explained on your founder call.
              <br />
              No hidden “from” price for the full experience.
            </p>
          </div>
          <div className="membership-grid">
            <article className="membership elite">
              <span className="membership-label">
                <Sparkles size={15} /> THE FULL WELLNESS EXPERIENCE
              </span>
              <h3>Elite</h3>
              <p className="plan-for">
                For the most complete FitFlix experience.
              </p>
              <div className="price">
                ₹1,50,000 <span>/ year</span>
              </div>
              <div className="credit-total">
                150 total credits across 12 months
              </div>
              <ul>
                <li>
                  <Check /> Gym & strength training access
                </li>
                <li>
                  <Check /> Access to all six wellness services
                </li>
                <li>
                  <Check /> Blood & genetic testing included
                </li>
                <li>
                  <Check /> Body composition + strength/ROM assessments
                </li>
                <li>
                  <Check /> Reformer Pilates at 4 credits per session
                </li>
              </ul>
              <ApplicationCTA onClick={onApply}>
                Find my Founders Club fit
              </ApplicationCTA>
              <p className="fineprint">
                Wellness and group sessions deduct credits. One-to-one 90-day
                coaching is a separate programme.
              </p>
            </article>
            <article className="membership club">
              <span className="membership-label">
                THE ESSENTIAL CLUB EXPERIENCE
              </span>
              <h3>Club</h3>
              <p className="plan-for">
                For independent training and selected wellness.
              </p>
              <div className="price">
                ₹1,00,000 <span>/ year</span>
              </div>
              <div className="credit-total">
                150 total credits across 12 months
              </div>
              <ul>
                <li>
                  <Check /> Gym & strength training access
                </li>
                <li>
                  <Check /> Infrared sauna & automatic massage beds
                </li>
                <li>
                  <Check /> Body composition + strength/ROM assessments
                </li>
                <li>
                  <Check /> Reformer Pilates at 4 credits per session
                </li>
                <li className="not-included">
                  Blood/genetic testing not included
                </li>
              </ul>
              <ApplicationCTA onClick={onApply} outline>
                Find my Founders Club fit
              </ApplicationCTA>
              <p className="fineprint">
                Other wellness services are not included in Club. 90-day
                coaching is a separate programme.
              </p>
            </article>
          </div>
          <div className="programme-callout">
            <div>
              <span className="eyebrow">
                WANT END-TO-END, ONE-TO-ONE COACHING?
              </span>
              <h3>The 90-day transformation programme.</h3>
              <p>
                Goal-based or DNA-informed routes. Personal training,
                programming, execution and app-supported tracking.
              </p>
            </div>
            <div>
              <strong>₹1,50,000</strong>
              <span>MRP · separate programme</span>
              <button className="text-link" onClick={onApply}>
                Find my Founders Club fit <ArrowRight size={17} />
              </button>
            </div>
          </div>
          <div className="pricing-footnote">
            <p>
              All prices in INR. Membership credits are total term allowances,
              not monthly allocations. Confirm applicable taxes, start date,
              testing and programme inclusions, credit validity,
              pause/cancellation and written enrolment terms before joining.
            </p>
            <a href={assets.brochure} target="_blank" rel="noreferrer">
              View the detailed brochure <ArrowUpRight size={15} />
            </a>
          </div>
        </section>
        <section className="value-section section-pad">
          <div className="value-copy">
            <span className="eyebrow">
              YOUR TIME SHOULD GIVE YOU SOMETHING BACK
            </span>
            <h2>
              A few thoughtful choices.
              <br />
              <em>A clearer starting point.</em>
            </h2>
            <p>
              Tap through a few thoughtful choices. Leave with a personal brief
              — even if you never become a member.
            </p>
            <ApplicationCTA onClick={onApply} />
          </div>
          <div className="brief-preview">
            <div className="preview-top">
              <span className="eyebrow">YOUR FOUNDER CALL BRIEF</span>
              <span className="preview-badge">PERSONALISED</span>
            </div>
            <div className="preview-item">
              <ScanLine />
              <div>
                <h3>Your priorities, reflected.</h3>
                <p>The goals, schedule and support that matter to you.</p>
              </div>
            </div>
            <div className="preview-item">
              <CalendarDays />
              <div>
                <h3>A practical first rhythm.</h3>
                <p>
                  Three useful preparation actions and a starting direction.
                </p>
              </div>
            </div>
            <div className="preview-item">
              <Dumbbell />
              <div>
                <h3>A conversation worth having.</h3>
                <p>
                  Your decision priorities, a tailored call agenda and a 3D
                  guide’s spoken briefing.
                </p>
              </div>
            </div>
            <p className="fineprint">
              A coaching-fit brief, not a health score, diagnosis or treatment
              plan.
            </p>
          </div>
        </section>
        <section className="faq-section section-pad" id="questions">
          <div>
            <span className="eyebrow">BEFORE YOU BEGIN</span>
            <h2>
              Good questions.
              <br />
              <em>Clear answers.</em>
            </h2>
          </div>
          <div className="faq-list">
            {faqs.map(([question, answer]) => (
              <details key={question}>
                <summary>
                  {question}
                  <ChevronDown size={18} />
                </summary>
                <p>{answer}</p>
              </details>
            ))}
          </div>
        </section>
        <section className="final-section section-pad">
          <span className="eyebrow">THE FOUNDERS CLUB IS YOURS TO WRITE</span>
          <h2>
            Make space for
            <br />
            <em>a stronger life.</em>
          </h2>
          <p>100 founding memberships. One intentional next step.</p>
          <ApplicationCTA onClick={onApply}>
            Find my Founders Club fit
          </ApplicationCTA>
          <p className="fineprint">
            An application is not a reservation. No payment. No obligation.
          </p>
        </section>
      </main>
      {!embedded && <BrandFooter />}
    </div>
  );
}
