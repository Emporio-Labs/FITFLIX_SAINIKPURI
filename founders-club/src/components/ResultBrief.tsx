import { lazy, Suspense, useEffect, useState } from "react";
import {
  ArrowLeft,
  ArrowUpRight,
  Download,
  CalendarDays,
  Check,
  Loader2,
  MapPin,
  ShieldCheck,
} from "lucide-react";
import { trpc } from "@/lib/trpc";
import { trackEvent } from "@/lib/analytics";
import { BrandHeader, BrandFooter } from "./BrandShell";
import type { ApplicationResult, CampaignSettings } from "@shared/founders";
const WellnessAvatar = lazy(() => import("./WellnessAvatar"));

function downloadBrief(result: ApplicationResult) {
  const { summary: s, answers: a } = result;
  const text = [
    `FITFLIX KOMPALLY — YOUR FOUNDER CALL BRIEF`,
    `Prepared for ${result.name}`,
    "",
    s.title,
    s.reflection,
    "",
    "YOUR PRIORITIES",
    ...a.goals,
    "",
    "YOUR STARTING RHYTHM",
    s.rhythm,
    "",
    "FOCUS AREAS",
    ...s.focus,
    "",
    "THREE USEFUL PREPARATION ACTIONS",
    ...s.actions.map((x, i) => `${i + 1}. ${x}`),
    "",
    "YOUR FOUNDER-CALL AGENDA",
    ...s.agenda.map((x, i) => `${i + 1}. ${x}`),
    "",
    "WHAT MATTERS IN YOUR DECISION",
    a.buyingPriority || "No decision priority recorded in this earlier brief.",
    a.hesitation ? `What needs clarity: ${a.hesitation}` : "",
    "",
    "YOUR PERSONAL INTENTION",
    a.pledge || "No intention supplied.",
    "",
    "YOUR CONTEXT",
    `Schedule: ${a.windows.join(", ")}`,
    `Investment to discuss: ${a.investment}`,
    `Decision context: ${a.decision}`,
    `Timeline: ${a.timeline}`,
    "",
    "This is a preliminary coaching-fit brief based on your answers, not a medical assessment or a prescribed programme. Results vary. Application/call does not reserve membership.",
  ].join("\n");
  const url = URL.createObjectURL(
    new Blob([text], { type: "text/plain;charset=utf-8" })
  );
  const link = document.createElement("a");
  link.href = url;
  link.download = "FitFlix_Founder_Call_Brief.txt";
  link.click();
  setTimeout(() => URL.revokeObjectURL(url), 1000);
}
export default function ResultBrief({
  result,
  settings,
  onBack,
}: {
  result: ApplicationResult;
  settings: CampaignSettings;
  onBack: () => void;
}) {
  const { summary: s, answers: a } = result;
  const [preferred, setPreferred] = useState("");
  const [slot, setSlot] = useState("");
  const [kind, setKind] = useState<"call" | "tour">(
    a.nextStep === "Discuss a club visit" ? "tour" : "call"
  );
  const [confirmation, setConfirmation] = useState("");
  const [bookingOpened, setBookingOpened] = useState(false);
  const slotsQuery = trpc.founders.slots.useQuery(undefined, {
    retry: 1,
    enabled: result.route === "founder",
  });
  const request = trpc.founders.requestCall.useMutation({
    onSuccess: data => {
      setConfirmation(data.message);
      trackEvent("CallRequested");
      slotsQuery.refetch();
    },
  });
  const statusText =
    result.route === "founder"
      ? "A founder conversation looks like a useful next step."
      : result.route === "concierge"
        ? "Let’s clarify the practical fit before you decide."
        : "Take the brief. Explore at your own pace.";
  const calendar = trpc.founders.bookingConfig.useMutation();
  useEffect(() => {
    calendar.mutate({ id: result.id, token: result.token });
  }, [result.id, result.token]);
  const externalUrl = calendar.data?.bookingUrl || null;
  function submitRequest() {
    request.mutate({
      id: result.id,
      token: result.token,
      kind,
      slotId: slot || undefined,
      preferredWindow: preferred || undefined,
    });
  }
  return (
    <div className="result-page">
      <BrandHeader simple />
      <main className="result-main">
        <div className="result-topline">
          <button className="text-link" onClick={onBack}>
            <ArrowLeft size={16} /> Back to the club
          </button>
          <span className="eyebrow">
            YOUR STARTING POINT · NOT A MEDICAL ASSESSMENT
          </span>
        </div>
        <div className="result-heading">
          <span className="eyebrow">
            THANK YOU, {result.name.split(" ")[0].toUpperCase()}
          </span>
          <h1>{s.title}</h1>
          <p>{s.reflection}</p>
          <div className="result-status">
            <ShieldCheck size={17} />
            {statusText}
          </div>
        </div>
        <div className="result-grid">
          <section className="brief-detail">
            <div className="brief-label">
              <span className="eyebrow">YOUR PERSONAL BRIEF</span>
              <button
                className="text-button"
                onClick={() => downloadBrief(result)}
              >
                <Download size={16} /> Save brief
              </button>
            </div>
            <div className="brief-block">
              <span className="eyebrow">YOUR STATED PRIORITIES</span>
              <div className="goal-tags">
                {a.goals.map(g => (
                  <span key={g}>{g}</span>
                ))}
              </div>
            </div>
            <div className="brief-block">
              <span className="eyebrow">A STARTING RHYTHM TO DISCUSS</span>
              <h3>{s.rhythm}</h3>
              <p>
                {a.windows.join(" / ")} · {a.sessions.toLowerCase()} per week
              </p>
              <p className="fineprint">
                A discussion direction, not a prescribed exercise routine or a
                promise of session availability.
              </p>
            </div>
            {(a.buyingPriority || a.hesitation) && (
              <div className="brief-block decision-insights">
                <span className="eyebrow">WHAT MATTERS IN YOUR DECISION</span>
                {a.buyingPriority && (
                  <>
                    <h3>{a.buyingPriority}</h3>
                    <p>Your chosen priority when considering a club.</p>
                  </>
                )}
                {a.hesitation && (
                  <p>
                    <strong>What needs clarity:</strong> {a.hesitation}
                  </p>
                )}
                <p className="fineprint">
                  These are your stated preferences, not a personality profile
                  or an inferred psychological diagnosis.
                </p>
              </div>
            )}
            <div className="brief-block">
              <span className="eyebrow">YOUR FOCUS</span>
              {s.focus.map(f => (
                <p className="focus-item" key={f}>
                  <Check size={16} />
                  {f}
                </p>
              ))}
            </div>
            <div className="brief-block">
              <span className="eyebrow">
                THREE ACTIONS YOU CAN TAKE BEFORE THE CALL
              </span>
              <ol className="action-list">
                {s.actions.map((action, i) => (
                  <li key={i}>
                    <span>{String(i + 1).padStart(2, "0")}</span>
                    <p>{action}</p>
                  </li>
                ))}
              </ol>
            </div>
            {a.motivation && (
              <blockquote className="pledge">
                <span className="eyebrow">YOUR REASON FOR BEGINNING</span>
                <p>“{a.motivation}”</p>
              </blockquote>
            )}
            {a.pledge && (
              <blockquote className="pledge">
                <span className="eyebrow">YOUR PERSONAL INTENTION</span>
                <p>“{a.pledge}”</p>
                <span>A personal intention, not a purchase commitment.</span>
              </blockquote>
            )}
            <div className="brief-block">
              <span className="eyebrow">WHAT TO EXPLORE</span>
              <p>{s.approach}</p>
              <p className="fineprint">
                You selected: {a.investment}. Exact taxes, inclusions, start
                date, credit validity and enrolment terms are confirmed in
                writing. Memberships, Pilates packages and coaching programmes
                are separate offers.
              </p>
            </div>
            <p className="fineprint">
              {result.summaryMode === "ai"
                ? "AI-assisted brief, based only on your questionnaire answers."
                : "Structured brief, tailored to your selected answers. The AI service was unavailable."}{" "}
              This is not a diagnosis, disease-risk score, genetic
              interpretation or treatment recommendation.
            </p>
          </section>
          <aside className="brief-sidebar">
            <Suspense
              fallback={
                <div className="avatar-loading">
                  <Loader2 className="spin" /> Loading your 3D guide
                </div>
              }
            >
              <WellnessAvatar narration={s.narration} />
            </Suspense>
            <div className="call-agenda">
              <span className="eyebrow">YOUR FOUNDER-CALL AGENDA</span>
              <h3>
                A conversation
                <br />
                <em>with a clear purpose.</em>
              </h3>
              <ol>
                {s.agenda.map((item, i) => (
                  <li key={i}>{item}</li>
                ))}
              </ol>
              <p>
                Bring anyone involved in the decision. Ask for the written offer
                before making a commitment.
              </p>
            </div>
          </aside>
        </div>
        <section className="booking-section" id="founder-call">
          <div className="booking-intro">
            <span className="eyebrow">YOUR NEXT STEP</span>
            <h2>
              {result.route === "explore" ? (
                <>
                  Ready when
                  <br />
                  <em>you are.</em>
                </>
              ) : (
                <>
                  Make room for
                  <br />
                  <em>a useful conversation.</em>
                </>
              )}
            </h2>
            <p>
              {externalUrl
                ? "Choose a genuine appointment through the founder’s live scheduler. Your time and Google Meet invitation are confirmed there."
                : calendar.isPending
                  ? "Checking your founder-call options…"
                  : result.route !== "founder"
                    ? "Your brief is ready. A team follow-up can clarify your schedule, location or investment questions before a founder appointment."
                    : "Live Google Meet scheduling is not connected yet. Request a preferred window and the team will confirm the time and invitation."}
            </p>
            <div className="booking-facts">
              <span>
                <CalendarDays size={16} /> Founder conversation
              </span>
              <span>
                <MapPin size={16} /> Google Meet · timing confirmed by the team
              </span>
            </div>
            <p className="fineprint">
              A call is not a membership reservation. No payment or automatic
              enrolment.
            </p>
          </div>
          <div className="booking-card">
            {externalUrl ? (
              <>
                <h3>Choose your founder appointment.</h3>
                <p>
                  Available times and meeting details are controlled by{" "}
                  {settings.founderName}’s scheduler, not generated by this
                  page.
                </p>
                <a
                  className="button"
                  href={externalUrl}
                  target="_blank"
                  rel="noreferrer"
                  onClick={() => {
                    trackEvent("FounderBookingOpen");
                    setBookingOpened(true);
                  }}
                >
                  Open live founder calendar <ArrowUpRight size={18} />
                </a>
                {bookingOpened && (
                  <p className="booking-notice">
                    The scheduler opened in a new tab. This page cannot verify a
                    completed external booking. Complete its confirmation step
                    to receive your actual invite.
                  </p>
                )}
              </>
            ) : confirmation || result.bookingStatus === "requested" ? (
              <div className="request-success">
                <Check size={28} />
                <h3>Call request received.</h3>
                <p>
                  {confirmation ||
                    "Your call request is awaiting the team’s confirmation."}
                </p>
                <strong>This is not yet a confirmed appointment.</strong>
                <p>
                  The team must send your confirmed time and Google Meet link
                  via your preferred contact channel.
                </p>
              </div>
            ) : (
              <>
                <h3>Request a conversation.</h3>
                <p>
                  Your details are already captured. No need to fill them in
                  again.
                </p>
                <label className="booking-field">
                  I would prefer
                  <select
                    value={kind}
                    onChange={e => setKind(e.target.value as "call" | "tour")}
                  >
                    <option value="call">
                      {result.route === "founder"
                        ? "A founder call on Google Meet"
                        : "A team follow-up to clarify my fit"}
                    </option>
                    <option value="tour">To discuss a club visit</option>
                  </select>
                </label>
                {slotsQuery.data?.length ? (
                  <fieldset className="slot-list">
                    <legend>Team-published call windows (IST)</legend>
                    {slotsQuery.data.map(item => (
                      <label
                        className={slot === item.id ? "slot selected" : "slot"}
                        key={item.id}
                      >
                        <input
                          type="radio"
                          name="slot"
                          checked={slot === item.id}
                          onChange={() => setSlot(item.id)}
                        />
                        <span>
                          {new Date(item.startAt).toLocaleString("en-IN", {
                            timeZone: "Asia/Kolkata",
                            dateStyle: "medium",
                            timeStyle: "short",
                          })}{" "}
                          IST
                        </span>
                      </label>
                    ))}
                  </fieldset>
                ) : (
                  <p className="fineprint">
                    {slotsQuery.isLoading
                      ? "Checking team-published windows…"
                      : slotsQuery.error
                        ? "Published windows are unavailable. You can still share a preference."
                        : "No confirmed founder windows are published yet."}
                  </p>
                )}
                <label className="booking-field">
                  Your preferred window (optional)
                  <select
                    value={preferred}
                    onChange={e => setPreferred(e.target.value)}
                  >
                    <option value="">
                      No preference — suggest a suitable time
                    </option>
                    <option>Weekday mornings (IST)</option>
                    <option>Weekday afternoons (IST)</option>
                    <option>Weekday evenings (IST)</option>
                    <option>Weekend mornings (IST)</option>
                    <option>Weekend afternoons or evenings (IST)</option>
                    <option>My schedule varies — please discuss with me</option>
                  </select>
                </label>
                {request.error && (
                  <p className="form-error" role="alert">
                    {request.error.message}
                  </p>
                )}
                <button
                  className="button"
                  onClick={submitRequest}
                  disabled={request.isPending}
                >
                  {request.isPending ? (
                    <>
                      <Loader2 size={17} className="spin" /> Sending request…
                    </>
                  ) : (
                    <>
                      {result.route === "founder"
                        ? "Request founder follow-up"
                        : "Request team follow-up"}{" "}
                      <ArrowUpRight size={17} />
                    </>
                  )}
                </button>
                <p className="fineprint">
                  Published windows and your preferences are requests, not
                  confirmed Google Meet bookings. The team confirms availability
                  and sends the invite.
                </p>
              </>
            )}
          </div>
        </section>
      </main>
      <BrandFooter />
    </div>
  );
}
