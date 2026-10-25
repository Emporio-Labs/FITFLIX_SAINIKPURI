import {
  goalOptions,
  reasonOptions,
  buyingPriorityOptions,
  hesitationOptions,
  locationOptions,
  routineOptions,
  barrierOptions,
  supportOptions,
  sessionOptions,
  windowOptions,
  timelineOptions,
  investmentOptions,
  decisionOptions,
  intentionOptions,
  nextOptions,
  contactSchema,
  type Answers,
} from "./founders";
export type QuestionField = keyof Answers;
export type QuestionStep = {
  field: QuestionField | "contact";
  chapter: 0 | 1 | 2 | 3;
  label: string;
  title: string;
  description: string;
  options?: readonly string[];
  multiple?: boolean;
  optional?: boolean;
  reflection?: string;
  reinforcement: string;
};
export const questionnaireSteps: QuestionStep[] = [
  {
    field: "goals",
    chapter: 0,
    label: "Your priorities",
    title: "What would make the next 90 days meaningful?",
    description:
      "Choose up to two priorities. Start with what matters to you, not what sounds impressive.",
    options: goalOptions,
    multiple: true,
    reflection:
      "Feel your feet on the ground, if comfortable. Imagine one ordinary weekday with a routine that supports you. Which change would you actually notice?",
    reinforcement:
      "Your priorities give this conversation a direction. They are not a promise of a 90-day outcome.",
  },
  {
    field: "motivation",
    chapter: 0,
    label: "Your personal why",
    title: "What would that change make room for?",
    description:
      "Picture your real life, not an ideal version. Choose the closest reason — uncertainty is welcome.",
    options: reasonOptions,
    reflection:
      "Optional: take one easy, natural breath. Picture a familiar moment — family time, work, movement or rest. What would you like to feel more available for?",
    reinforcement:
      "Knowing your reason helps keep the plan connected to your life, not someone else’s expectations.",
  },
  {
    field: "buyingPriority",
    chapter: 0,
    label: "What earns your trust",
    title: "What would matter most when choosing a club?",
    description:
      "Tell us what you would be looking for. This is your decision criterion, not a feature promise.",
    options: buyingPriorityOptions,
    reinforcement:
      "Useful to know. Your founder conversation can address what earns your trust before discussing a commitment.",
  },
  {
    field: "hesitation",
    chapter: 0,
    label: "What needs clarity",
    title: "What would you want clarified before deciding?",
    description:
      "An honest question is more helpful than an agreeable answer. Choose the biggest uncertainty, if any.",
    options: hesitationOptions,
    reinforcement:
      "Thank you for being clear. Naming uncertainty helps make the call useful rather than pressured.",
  },
  {
    field: "location",
    chapter: 1,
    label: "Your location",
    title: "How would Kompally fit into your week?",
    description:
      "The club is in person: 6th floor, Fairmont Downtown, Kompally. Include the commute in your decision.",
    options: locationOptions,
    reinforcement:
      "A convenient, realistic route supports consistency. It is fine to check the commute before deciding.",
  },
  {
    field: "routine",
    chapter: 1,
    label: "Your starting point",
    title: "What is your activity rhythm today?",
    description:
      "Think about a typical recent week, not your best week. There is no judgement here.",
    options: routineOptions,
    reinforcement:
      "An honest starting point is useful. You do not need an established routine to begin a conversation.",
  },
  {
    field: "barrier",
    chapter: 1,
    label: "Your real-life friction",
    title: "What most interrupts your consistency?",
    description:
      "Choose what genuinely happens in your week. We are looking for practical context, not excuses.",
    options: barrierOptions,
    reflection:
      "Optional: remember the last time you intended to train but did not. Notice the practical obstacle, without criticising yourself.",
    reinforcement:
      "This context helps the team discuss realistic support, rather than assuming more motivation is the answer.",
  },
  {
    field: "support",
    chapter: 1,
    label: "Your support preference",
    title: "Which kind of support feels most useful?",
    description:
      "Personal coaching, membership and Pilates are separate offers. You can ask for help choosing.",
    options: supportOptions,
    reinforcement:
      "Your preference is noted. We will keep the difference between coaching, memberships and Pilates clear.",
  },
  {
    field: "sessions",
    chapter: 1,
    label: "Your realistic rhythm",
    title: "How many weekly sessions could you protect?",
    description:
      "Choose what you can repeat in an ordinary week. Less, done consistently, can be a sensible discussion starting point.",
    options: sessionOptions,
    reflection:
      "Optional: picture next week’s actual calendar. Which commitment would still be realistic if work or family plans changed?",
    reinforcement:
      "A realistic rhythm is useful information. This selection is a preference, not a prescribed training plan.",
  },
  {
    field: "windows",
    chapter: 1,
    label: "Your workable windows",
    title: "When would those sessions fit?",
    description:
      "Choose up to two workable windows. These are preferences, not guaranteed club availability.",
    options: windowOptions,
    multiple: true,
    reinforcement:
      "You are turning an idea into a practical schedule. The team will check actual availability with you.",
  },
  {
    field: "timeline",
    chapter: 1,
    label: "Your timing",
    title: "When would you like to explore beginning?",
    description:
      "Kompally is in presales. The opening date and your start date are confirmed before you commit.",
    options: timelineOptions,
    reinforcement:
      "Your pace is noted. Exploring for now is a valid answer — there is no automatic enrolment.",
  },
  {
    field: "investment",
    chapter: 2,
    label: "Your investment context",
    title: "Which option is worth a closer look?",
    description:
      "Published prices, not an unconfirmed Founders discount. Coaching is separate from membership; taxes and inclusions are confirmed in writing.",
    options: investmentOptions,
    reinforcement:
      "This keeps surprises out of the call. Choosing “not ready” or asking about inclusions is welcome.",
  },
  {
    field: "decision",
    chapter: 2,
    label: "Your decision process",
    title: "Who would be part of a considered decision?",
    description:
      "A good conversation should leave the right people informed — not rush you into deciding alone.",
    options: decisionOptions,
    reinforcement:
      "We can make the conversation work for your decision process. You may bring anyone involved.",
  },
  {
    field: "pledge",
    chapter: 2,
    label: "A small intention",
    title: "What intention feels honest today?",
    description:
      "Optional. Choose one non-financial intention, or skip. This is not a purchase promise or a test of character.",
    options: intentionOptions,
    optional: true,
    reflection:
      "Optional: notice one thing you appreciate about your body or your life today. From that place, choose one small, realistic next step — or none yet.",
    reinforcement:
      "Your intention belongs to you. Skipping or not being ready does not make your answers less valuable.",
  },
  {
    field: "nextStep",
    chapter: 2,
    label: "Your preferred next step",
    title: "What would you like after your personal brief?",
    description:
      "Receive a useful brief either way. A conversation or application does not reserve a membership.",
    options: nextOptions,
    reinforcement:
      "Your preferred next step is respected. You remain in control of what happens after the brief.",
  },
  {
    field: "contact",
    chapter: 3,
    label: "Your personal brief",
    title: "Your choices are clear. Your brief is next.",
    description:
      "Only the essential contact details need typing, so the team can respond to this enquiry. Your brief appears on screen, not automatically by email.",
    reinforcement:
      "Your contact information is used for this enquiry. Optional marketing consent is separate.",
  },
];
export const questionnaireChapters = [
  { name: "Purpose", start: 0, end: 3 },
  { name: "Practical fit", start: 4, end: 10 },
  { name: "Your decision", start: 11, end: 14 },
  { name: "Your brief", start: 15, end: 15 },
] as const;
export function isStepComplete(
  step: QuestionStep,
  answers: Partial<Answers>,
  contact?: unknown
): boolean {
  if (step.field === "contact") return contactSchema.safeParse(contact).success;
  const value = answers[step.field];
  if (step.optional) return typeof value === "string"; // empty string records an explicit skip
  return Array.isArray(value)
    ? value.length > 0
    : typeof value === "string" && value.length > 0;
}
export function questionnaireProgress(
  answers: Partial<Answers>,
  contact?: unknown
) {
  const completed = questionnaireSteps.map(step =>
    isStepComplete(step, answers, contact)
  );
  const count = completed.filter(Boolean).length;
  return {
    completed,
    count,
    total: questionnaireSteps.length,
    percentage: Math.round((count / questionnaireSteps.length) * 100),
  };
}
