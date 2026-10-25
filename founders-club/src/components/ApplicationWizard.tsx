import { useEffect, useRef, useState, type CSSProperties } from "react";
import {
  ArrowLeft,
  ArrowRight,
  Check,
  Circle,
  Loader2,
  LockKeyhole,
  Pencil,
  Sparkles,
  X,
} from "lucide-react";
import { trpc } from "@/lib/trpc";
import { getAttribution, trackEvent } from "@/lib/analytics";
import {
  contactSchema,
  currentAnswerSchema,
  type Answers,
  type ApplicationResult,
} from "@shared/founders";
import {
  isStepComplete,
  questionnaireProgress,
  questionnaireSteps,
  type QuestionStep,
} from "@shared/questionnaire";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogTitle,
} from "@/components/ui/dialog";
import "./questionnaire.css";

function makeRequestId() {
  if (typeof globalThis.crypto?.randomUUID === "function") {
    return globalThis.crypto.randomUUID();
  }
  return "xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx".replace(/[xy]/g, character => {
    const random = Math.random() * 16;
    const value = character === "x" ? random : (random & 0x3) | 0x8;
    return Math.floor(value).toString(16);
  });
}

function ChoiceCards({
  step,
  value,
  onChange,
}: {
  step: QuestionStep;
  value: string | string[] | undefined;
  onChange: (value: string | string[]) => void;
}) {
  const options = step.options ?? [];
  const selectedValues = Array.isArray(value) ? value : [];
  const inputName = `question-${step.field}`;

  return (
    <div
      className="question-options"
      role={step.multiple ? "group" : "radiogroup"}
      aria-label={step.title}
    >
      {options.map((option, index) => {
        const selected = step.multiple
          ? selectedValues.includes(option)
          : value === option;
        return (
          <label
            className={`question-option ${selected ? "selected" : ""}`}
            key={option}
          >
            <input
              className="option-control"
              type={step.multiple ? "checkbox" : "radio"}
              name={inputName}
              value={option}
              checked={selected}
              onChange={event => {
                if (step.multiple) {
                  const next = event.target.checked
                    ? [...selectedValues, option].slice(0, 2)
                    : selectedValues.filter(item => item !== option);
                  onChange(next);
                } else {
                  onChange(option);
                }
              }}
              aria-label={option}
            />
            <span className="option-mark" aria-hidden="true">
              {selected ? (
                <Check size={15} strokeWidth={2.5} />
              ) : (
                <Circle size={9} />
              )}
            </span>
            <span className="option-copy">
              <span className="option-index">
                {String(index + 1).padStart(2, "0")}
              </span>
              <span>{option}</span>
            </span>
          </label>
        );
      })}
    </div>
  );
}

function RecapItem({
  label,
  value,
  onEdit,
}: {
  label: string;
  value: string;
  onEdit: () => void;
}) {
  return (
    <div className="recap-item">
      <div>
        <span className="recap-label">{label}</span>
        <strong>{value}</strong>
      </div>
      <button type="button" className="recap-edit" onClick={onEdit}>
        <Pencil size={13} /> <span>Edit</span>
      </button>
    </div>
  );
}

const initialContact = {
  name: "",
  email: "",
  phone: "",
  channel: "Phone" as "Phone" | "WhatsApp" | "Email",
  adultConsent: false,
  serviceConsent: false,
  marketingConsent: false,
};

export default function ApplicationWizard({
  open,
  onClose,
  onComplete,
}: {
  open: boolean;
  onClose: () => void;
  onComplete: (result: ApplicationResult) => void;
}) {
  const [step, setStep] = useState(0);
  const [answers, setAnswers] = useState<Partial<Answers>>({
    goals: [],
    windows: [],
  });
  const [contact, setContact] = useState(initialContact);
  const [error, setError] = useState("");
  const [website, setWebsite] = useState("");
  const requestId = useRef<string | null>(null);
  const bodyRef = useRef<HTMLDivElement>(null);
  const mutation = trpc.founders.submit.useMutation({
    onSuccess: result => {
      trackEvent("Lead");
      onComplete(result as ApplicationResult);
      requestId.current = null;
      setStep(0);
      setAnswers({ goals: [], windows: [] });
      setContact({ ...initialContact });
      setWebsite("");
      setError("");
    },
    onError: err =>
      setError(
        err.message || "Your answers are still here. Please retry in a moment."
      ),
  });
  const currentStep = questionnaireSteps[step];
  const progress = questionnaireProgress(answers, contact);
  const currentValue =
    currentStep.field === "contact" ? undefined : answers[currentStep.field];
  const currentAnswered =
    currentStep.field !== "contact" &&
    (Array.isArray(currentValue)
      ? currentValue.length > 0
      : typeof currentValue === "string" &&
        (currentValue.length > 0 || Boolean(currentStep.optional)));
  const progressStyle = {
    "--completion-angle": `${(progress.count / progress.total) * 360}deg`,
  } as CSSProperties;

  useEffect(() => {
    if (open) trackEvent("ApplicationStart");
  }, [open]);

  useEffect(() => {
    bodyRef.current?.scrollTo({ top: 0 });
  }, [step]);

  function updateAnswer(field: keyof Answers, value: Answers[keyof Answers]) {
    setAnswers(previous => ({ ...previous, [field]: value }));
    setError("");
  }

  function updateContact<Key extends keyof typeof contact>(
    field: Key,
    value: (typeof contact)[Key]
  ) {
    setContact(previous => ({ ...previous, [field]: value }));
    setError("");
  }

  function goToStep(nextStep: number) {
    setError("");
    setStep(Math.max(0, Math.min(questionnaireSteps.length - 1, nextStep)));
  }

  function next() {
    const complete = isStepComplete(currentStep, answers, contact);
    if (!complete) {
      setError(
        currentStep.optional
          ? "Choose an intention or use ‘Skip this optional question’ to continue."
          : "Please choose an answer before continuing."
      );
      return;
    }
    setError("");
    goToStep(step + 1);
  }

  function submit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError("");
    const parsedAnswers = currentAnswerSchema.safeParse(answers);
    const parsedContact = contactSchema.safeParse(contact);
    if (!parsedAnswers.success) {
      setError("Please review your previous answers before submitting.");
      return;
    }
    if (!parsedContact.success) {
      setError(
        parsedContact.error.issues
          .map(issue => {
            if (issue.path[0] === "serviceConsent") {
              return "Please consent to contact about this enquiry.";
            }
            if (issue.path[0] === "adultConsent") {
              return "Please confirm you are 18 or older.";
            }
            if (issue.path[0] === "phone") {
              return "Please enter a valid mobile number.";
            }
            return `${String(issue.path[0])}: ${issue.message}`;
          })
          .join(" ")
      );
      return;
    }
    if (!requestId.current) requestId.current = makeRequestId();
    mutation.mutate({
      requestId: requestId.current,
      answers: parsedAnswers.data,
      contact: parsedContact.data,
      attribution: getAttribution(),
      website,
    });
  }

  const summaryItems = [
    { label: "Priorities", value: answers.goals?.join(" · ") || "—", step: 0 },
    { label: "Your reason", value: answers.motivation || "—", step: 1 },
    {
      label: "What earns your trust",
      value: answers.buyingPriority || "—",
      step: 2,
    },
    { label: "What needs clarity", value: answers.hesitation || "—", step: 3 },
    { label: "Location", value: answers.location || "—", step: 4 },
    {
      label: "Practical rhythm",
      value:
        [answers.sessions, answers.windows?.join(" · ")]
          .filter(Boolean)
          .join(" · ") || "—",
      step: 8,
    },
    { label: "Investment context", value: answers.investment || "—", step: 11 },
    { label: "Decision process", value: answers.decision || "—", step: 12 },
    {
      label: "Intention",
      value: answers.pledge || "Skipped for now",
      step: 13,
    },
    { label: "After your brief", value: answers.nextStep || "—", step: 14 },
  ];

  return (
    <Dialog
      open={open}
      onOpenChange={value => {
        if (!value && !mutation.isPending) onClose();
      }}
    >
      <DialogContent
        className="wizard-dialog reflective-wizard"
        showCloseButton={false}
      >
        <div className="wizard-top">
          <div>
            <span className="eyebrow">FITFLIX KOMPALLY</span>
            <DialogTitle>Your Founders Club fit</DialogTitle>
            <DialogDescription className="sr-only">
              A calm, choice-based coaching-fit questionnaire. No medical
              history or payment information is requested.
            </DialogDescription>
          </div>
          <button
            type="button"
            className="icon-button"
            aria-label="Close questionnaire and retain answers"
            onClick={onClose}
            disabled={mutation.isPending}
          >
            <X size={21} />
          </button>
        </div>

        <div className="wizard-progress-summary" aria-live="polite">
          <div className="completion-ring" style={progressStyle}>
            <div className="completion-ring-inner">
              <strong>{progress.count}</strong>
              <span>of {progress.total}</span>
              <small>{progress.percentage}%</small>
            </div>
          </div>
          <div className="completion-copy">
            <span className="eyebrow">YOUR PACE</span>
            <strong>
              {progress.count} of {progress.total} steps complete
            </strong>
            <span>Move at your own pace. You can edit any answer.</span>
          </div>
          <div className="completion-dots" aria-label="16-step completion path">
            {progress.completed.map((completed, index) => (
              <button
                key={questionnaireSteps[index].field}
                type="button"
                className={`completion-dot ${completed ? "done" : ""} ${
                  index === step ? "current" : ""
                }`}
                aria-current={index === step ? "step" : undefined}
                aria-label={`${questionnaireSteps[index].label}${
                  completed ? ", completed; edit" : ", not completed"
                }`}
                disabled={!completed}
                onClick={() => completed && goToStep(index)}
              >
                <span aria-hidden="true" />
              </button>
            ))}
          </div>
        </div>

        <div className="wizard-step-label" aria-live="polite">
          <span>{currentStep.label}</span>
          <span>
            {String(step + 1).padStart(2, "0")} / {questionnaireSteps.length}
          </span>
        </div>

        <form onSubmit={submit} className="wizard-form">
          <div className="wizard-body" ref={bodyRef} key={step}>
            {currentStep.field !== "contact" ? (
              <section
                className="question-screen"
                aria-labelledby="question-title"
              >
                <span className="eyebrow">{currentStep.label}</span>
                <h2 id="question-title">{currentStep.title}</h2>
                <p className="question-description">
                  {currentStep.description}
                </p>
                <ChoiceCards
                  step={currentStep}
                  value={currentValue as string | string[] | undefined}
                  onChange={value =>
                    updateAnswer(
                      currentStep.field as Exclude<
                        QuestionStep["field"],
                        "contact"
                      >,
                      value as Answers[keyof Answers]
                    )
                  }
                />
                {currentStep.optional && (
                  <button
                    type="button"
                    className={`optional-skip ${answers.pledge === "" ? "chosen" : ""}`}
                    onClick={() => updateAnswer("pledge", "")}
                  >
                    {answers.pledge === "" ? (
                      <Check size={15} />
                    ) : (
                      <Circle size={12} />
                    )}
                    <span>Skip this optional question</span>
                    <small>An explicit skip counts as a completed step.</small>
                  </button>
                )}
                {currentStep.reflection && (
                  <details
                    className="reflection-card"
                    aria-label="Optional pause"
                  >
                    <summary>
                      <span className="reflection-ring" aria-hidden="true" />
                      <strong>Pause &amp; picture (optional)</strong>
                      <span
                        className="reflection-open-label"
                        aria-hidden="true"
                      >
                        +
                      </span>
                    </summary>
                    <p>{currentStep.reflection}</p>
                  </details>
                )}
                {currentAnswered && (
                  <div className="question-value" role="status">
                    <Sparkles size={15} aria-hidden="true" />
                    <span>{currentStep.reinforcement}</span>
                  </div>
                )}
              </section>
            ) : (
              <section
                className="contact-screen"
                aria-labelledby="question-title"
              >
                <span className="eyebrow">{currentStep.label}</span>
                <h2 id="question-title">{currentStep.title}</h2>
                <p className="question-description">
                  {currentStep.description}
                </p>

                <details className="final-recap">
                  <summary className="recap-summary">
                    <span>
                      <span className="eyebrow">YOUR SELECTED ANSWERS</span>
                      <span>Review or edit before sending.</span>
                    </span>
                    <span className="recap-toggle" aria-hidden="true">
                      +
                    </span>
                  </summary>
                  <div className="recap-grid">
                    {summaryItems.map(item => (
                      <RecapItem
                        key={item.label}
                        label={item.label}
                        value={item.value}
                        onEdit={() => goToStep(item.step)}
                      />
                    ))}
                  </div>
                </details>

                <div className="contact-intro">
                  <strong>Only these three fields need typing.</strong>
                  <span>
                    Your brief appears on screen immediately. Details are used
                    to respond to this enquiry, not to reserve a membership.
                  </span>
                </div>
                <div className="contact-fields">
                  <label>
                    Full name
                    <input
                      autoComplete="name"
                      value={contact.name}
                      maxLength={100}
                      onChange={event =>
                        updateContact("name", event.target.value)
                      }
                      required
                    />
                  </label>
                  <label>
                    Email
                    <input
                      type="email"
                      autoComplete="email"
                      value={contact.email}
                      maxLength={254}
                      onChange={event =>
                        updateContact("email", event.target.value)
                      }
                      required
                    />
                  </label>
                  <label>
                    Mobile number
                    <input
                      type="tel"
                      autoComplete="tel"
                      placeholder="+91"
                      value={contact.phone}
                      maxLength={20}
                      onChange={event =>
                        updateContact("phone", event.target.value)
                      }
                      required
                    />
                  </label>
                  <label>
                    Preferred follow-up channel
                    <select
                      value={contact.channel}
                      onChange={event =>
                        updateContact(
                          "channel",
                          event.target.value as typeof contact.channel
                        )
                      }
                    >
                      <option>Phone</option>
                      <option>WhatsApp</option>
                      <option>Email</option>
                    </select>
                  </label>
                </div>

                <label className="honeypot" aria-hidden="true">
                  Website
                  <input
                    name="website"
                    tabIndex={-1}
                    autoComplete="off"
                    value={website}
                    onChange={event => setWebsite(event.target.value)}
                  />
                </label>
                <label className="consent-check">
                  <input
                    type="checkbox"
                    checked={contact.adultConsent}
                    onChange={event =>
                      updateContact("adultConsent", event.target.checked)
                    }
                  />
                  <span>I confirm I am 18 or older.</span>
                </label>
                <label className="consent-check">
                  <input
                    type="checkbox"
                    checked={contact.serviceConsent}
                    onChange={event =>
                      updateContact("serviceConsent", event.target.checked)
                    }
                  />
                  <span>
                    I agree that FitFlix may use my answers and contact details
                    to respond to this Founders Club enquiry and prepare a
                    personalised brief, including AI processing of my
                    non-medical answers. I have read the{" "}
                    <a href="/kompally/founders-club/privacy" target="_blank" rel="noreferrer">
                      enquiry privacy notice
                    </a>
                    . This is not medical advice or a membership reservation.
                  </span>
                </label>
                <label className="consent-check optional">
                  <input
                    type="checkbox"
                    checked={contact.marketingConsent}
                    onChange={event =>
                      updateContact("marketingConsent", event.target.checked)
                    }
                  />
                  <span>
                    Optional: send me future FitFlix news and offers. I can opt
                    out anytime.
                  </span>
                </label>
                <p className="privacy-line">
                  <LockKeyhole size={14} aria-hidden="true" />
                  Your contact details are not sent to the summary AI or Meta.
                </p>
                <div className="question-value" role="status">
                  <Sparkles size={15} aria-hidden="true" />
                  <span>{currentStep.reinforcement}</span>
                </div>
              </section>
            )}
            {error && (
              <p role="alert" className="form-error">
                {error}
              </p>
            )}
          </div>

          <div className="wizard-bottom">
            <button
              className="text-button"
              type="button"
              onClick={() => goToStep(step - 1)}
              disabled={step === 0 || mutation.isPending}
            >
              <ArrowLeft size={17} /> Back
            </button>
            {step < questionnaireSteps.length - 1 ? (
              <button className="button" type="button" onClick={next}>
                Continue <ArrowRight size={17} />
              </button>
            ) : (
              <button
                className="button submit-button"
                type="submit"
                disabled={mutation.isPending}
              >
                {mutation.isPending ? (
                  <>
                    <Loader2 size={18} className="spin" /> Preparing your brief…
                  </>
                ) : (
                  <>
                    Create my Founders Club brief <ArrowRight size={17} />
                  </>
                )}
              </button>
            )}
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
