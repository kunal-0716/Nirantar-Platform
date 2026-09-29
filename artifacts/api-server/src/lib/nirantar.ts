import { eq } from "drizzle-orm";
import { db } from "@workspace/db";
import { nirantarStateTable } from "@workspace/db/schema";

export type Role = "CASE_LIAISON" | "COUNSELLOR" | "SUPERVISOR" | "ADMIN" | "PARTICIPANT";
export type Scenario = "baseline" | "atypical" | "silence";
export type Classification =
  | "WITHIN_EXPECTED_RANGE"
  | "EVENT_CONSISTENT_CHANGE"
  | "ATYPICAL_CHANGE"
  | "SILENCE_REVIEW";
export type FollowUpState =
  | "RETURNED_TOWARD_BASELINE"
  | "PERSISTENT"
  | "CHANGED_AGAIN"
  | "UNKNOWN";

export type Workspace = {
  clockLabel: string;
  activeRole: Role;
  activeScenario: Scenario;
  counts: { openTasks: number; unownedTasks: number; participants: number; followUps: number };
};

export type ParticipantSummary = {
  id: string;
  pseudonym: string;
  status: string;
  latestClass: Classification;
  latestScore: number;
  lastObservationLabel: string;
  contactRestriction: string;
};

export type ReviewTask = {
  id: string;
  taskType: "ATYPICAL_CHANGE" | "SILENCE_REVIEW" | "SAFETY_EVENT_REVIEW" | "CONCERN_RAISED";
  attentionTier: "IMMEDIATE_ATTENTION" | "PRIORITY_REVIEW" | "ROUTINE_REVIEW";
  ageLabel: string;
  participantId: string;
  pseudonym: string;
  owner: string | null;
  dueLabel: string;
  status: "OPEN" | "OWNED" | "ESCALATED" | "CLOSED";
  summary: string;
  escalationReason: string | null;
  confidenceTier: string | null;
};

export type TrajectoryPoint = {
  label: string;
  score: number | null;
  baseline: number;
  lowerBand: number;
  upperBand: number;
  classification: Exclude<Classification, "SILENCE_REVIEW">;
  missing: boolean;
};

export type TimelineItem = {
  id: string;
  label: string;
  kind: "EVENT" | "INTERVENTION" | "FOLLOW_UP" | "MISSING";
  description: string;
  significance: number | null;
};

export type CaseEvent = {
  id: string;
  label: string;
  eventType: string;
  status: string;
  significance: number;
  dateLabel: string;
};

export type ActionRecord = {
  id: string;
  pathway: string;
  outcome: string;
  followUpLabel: string;
  followUpDueLabel: string;
  followUpState: FollowUpState;
  dateLabel: string;
};

export type Observation = {
  id: string;
  label: string;
  score: number;
  source: "SYNTHETIC" | "PARTICIPANT_CHECKIN";
};

export type SignalEvidence = {
  classification: Classification;
  whatChanged: string;
  context: string;
  confidenceTier: string;
  confidenceFactors: string[];
  actionLocked: boolean;
  taskId: string | null;
  owner: string | null;
};

type ParticipantState = {
  summary: ParticipantSummary;
  observations: Observation[];
  trajectory: TrajectoryPoint[];
  timeline: TimelineItem[];
  signal: SignalEvidence;
  events: CaseEvent[];
  interventions: ActionRecord[];
};

export type NirantarState = {
  workspace: Workspace;
  participants: Record<string, ParticipantState>;
  tasks: ReviewTask[];
  auditRows: { sequence: number; actor: string; action: string; hash: string }[];
  auditTampered: boolean;
};

const baselineTrajectory = (): TrajectoryPoint[] => [
  { label: "06 Aug", score: 76, baseline: 76, lowerBand: 66, upperBand: 86, classification: "WITHIN_EXPECTED_RANGE", missing: false },
  { label: "13 Aug", score: 78, baseline: 77, lowerBand: 67, upperBand: 87, classification: "WITHIN_EXPECTED_RANGE", missing: false },
  { label: "20 Aug", score: 75, baseline: 76, lowerBand: 66, upperBand: 86, classification: "WITHIN_EXPECTED_RANGE", missing: false },
  { label: "27 Aug", score: 77, baseline: 76, lowerBand: 66, upperBand: 86, classification: "WITHIN_EXPECTED_RANGE", missing: false },
  { label: "03 Sep", score: 74, baseline: 76, lowerBand: 66, upperBand: 86, classification: "WITHIN_EXPECTED_RANGE", missing: false },
  { label: "10 Sep", score: 72, baseline: 75, lowerBand: 65, upperBand: 85, classification: "WITHIN_EXPECTED_RANGE", missing: false },
];

const eventConsistentTrajectory = (): TrajectoryPoint[] => [
  ...baselineTrajectory().slice(0, 4),
  { label: "03 Sep", score: 61, baseline: 75, lowerBand: 54, upperBand: 68, classification: "EVENT_CONSISTENT_CHANGE", missing: false },
  { label: "10 Sep", score: 66, baseline: 73, lowerBand: 56, upperBand: 70, classification: "EVENT_CONSISTENT_CHANGE", missing: false },
];

const atypicalTrajectory = (): TrajectoryPoint[] => [
  ...baselineTrajectory().slice(0, 4),
  { label: "03 Sep", score: 59, baseline: 75, lowerBand: 64, upperBand: 86, classification: "ATYPICAL_CHANGE", missing: false },
  { label: "10 Sep", score: 57, baseline: 75, lowerBand: 64, upperBand: 86, classification: "ATYPICAL_CHANGE", missing: false },
];

const silenceTrajectory = (): TrajectoryPoint[] => [
  ...baselineTrajectory().slice(0, 4),
  { label: "03 Sep", score: null, baseline: 76, lowerBand: 66, upperBand: 86, classification: "WITHIN_EXPECTED_RANGE", missing: true },
  { label: "10 Sep", score: null, baseline: 76, lowerBand: 66, upperBand: 86, classification: "WITHIN_EXPECTED_RANGE", missing: true },
];

const eventFor = (id: string, label: string, significance: number): CaseEvent => ({
  id,
  label,
  eventType: label.toUpperCase().replaceAll(" ", "_"),
  status: "OCCURRED",
  significance,
  dateLabel: "28 Aug",
});

const makeParticipant = (
  id: string,
  pseudonym: string,
  scenario: Scenario,
): ParticipantState => {
  const isSilence = scenario === "silence";
  const isAtypical = scenario === "atypical";
  const classification: Classification = isSilence
    ? "SILENCE_REVIEW"
    : isAtypical
      ? "ATYPICAL_CHANGE"
      : "EVENT_CONSISTENT_CHANGE";
  const event = eventFor(`${id}-event`, isAtypical ? "Hearing" : "Mediation", isAtypical ? 3 : 2);
  const trajectory = isSilence
    ? silenceTrajectory()
    : isAtypical
      ? atypicalTrajectory()
      : eventConsistentTrajectory();
  const timeline: TimelineItem[] = [
    { id: event.id, label: event.label, kind: "EVENT", description: "Case event recorded in the observation window.", significance: event.significance },
    ...(isSilence
      ? [{ id: `${id}-missing`, label: "03–10 Sep", kind: "MISSING" as const, description: "Two scheduled check-ins have no response.", significance: null }]
      : []),
  ];
  return {
    summary: {
      id,
      pseudonym,
      status: isSilence ? "ACTIVE · CONTACT RESTRICTED" : "ACTIVE",
      latestClass: classification,
      latestScore: trajectory.at(-1)?.score ?? 72,
      lastObservationLabel: isSilence ? "Last valid observation · 27 Aug" : "10 Sep · 09:12",
      contactRestriction: isSilence ? "Discreet contact only" : "No automated contact",
    },
    observations: trajectory.flatMap((point, index) =>
      point.score === null
        ? []
        : [{ id: `${id}-observation-${index + 1}`, label: point.label, score: point.score, source: "SYNTHETIC" as const }],
    ),
    trajectory,
    timeline,
    signal: isSilence
      ? {
          classification,
          whatChanged: "No response across two scheduled check-ins.",
          context: "Silence is uncertainty, not evidence of safety.",
          confidenceTier: "REVIEW REQUIRED",
          confidenceFactors: ["2 consecutive misses", "Contact restriction is active", "Last valid observation 14 days ago"],
          actionLocked: false,
          taskId: "task-silence",
          owner: null,
        }
      : isAtypical
        ? {
            classification,
            whatChanged: "Score dropped by 18 points from personal baseline.",
            context: "The observation sits outside the expected band after a high-significance Hearing event.",
            confidenceTier: "MODERATE CONFIDENCE",
            confidenceFactors: ["14 eligible observations", "Variance shrinkage applied", "No causal inference is made"],
            actionLocked: true,
            taskId: "task-atypical",
            owner: null,
          }
        : {
            classification,
            whatChanged: "Score moved 14 points below baseline.",
            context: "The observation falls inside the context-adjusted band after a recorded Mediation event.",
            confidenceTier: "HIGHER CONFIDENCE",
            confidenceFactors: ["14 eligible observations", "Event window overlaps observation", "No review task created"],
            actionLocked: true,
            taskId: null,
            owner: null,
          },
    events: [event],
    interventions: [],
  };
};

const clamp = (value: number, minimum: number, maximum: number): number =>
  Math.max(minimum, Math.min(maximum, value));

const average = (values: number[], fallback: number): number =>
  values.length ? values.reduce((sum, value) => sum + value, 0) / values.length : fallback;

const standardDeviation = (values: number[]): number => {
  if (values.length < 2) return 0;
  const mean = average(values, 0);
  return Math.sqrt(average(values.map((value) => (value - mean) ** 2), 0));
};

const confidenceFor = (eligibleObservations: number): string => {
  if (eligibleObservations < 4) return "INSUFFICIENT";
  if (eligibleObservations <= 7) return "LOW CONFIDENCE";
  if (eligibleObservations <= 15) return "MODERATE CONFIDENCE";
  return "HIGHER CONFIDENCE";
};

const latestRelevantEvent = (participant: ParticipantState): CaseEvent | undefined =>
  [...participant.events].sort((left, right) => right.significance - left.significance).at(0);

export function recalculateParticipant(
  state: NirantarState,
  participantId: string,
  fromNewObservation = false,
): void {
  const participant = state.participants[participantId];
  if (!participant || !participant.observations.length) return;

  const previousSignal = participant.signal;
  if (!fromNewObservation && previousSignal.classification === "SILENCE_REVIEW") return;

  const latestObservation = participant.observations.at(-1);
  if (!latestObservation) return;

  const historicalPoints = participant.trajectory
    .filter((point) => point.score !== null)
    .slice(0, -1);
  const stableScores = historicalPoints.slice(0, 4).map((point) => point.score as number);
  const allPriorScores = participant.observations
    .slice(0, -1)
    .map((observation) => observation.score);
  const baseline = Math.round(
    average(stableScores.length >= 4 ? stableScores : allPriorScores, participant.trajectory.at(-1)?.baseline ?? 75),
  );
  const spread = standardDeviation(stableScores.length >= 4 ? stableScores : allPriorScores);
  const event = latestRelevantEvent(participant);
  const contextualShift = event ? -Math.min(8, event.significance * 2) : 0;
  const expected = clamp(baseline + contextualShift, 0, 100);
  const bandWidth = Math.max(8, Math.round(spread * 1.5) + 5);
  const lowerBand = clamp(expected - bandWidth, 0, 100);
  const upperBand = clamp(expected + bandWidth, 0, 100);
  const score = latestObservation.score;
  const eventConsistentThreshold = event?.significance === 3 ? 8 : 14;
  const classification: Exclude<Classification, "SILENCE_REVIEW"> =
    score < lowerBand
      ? event && score >= expected - eventConsistentThreshold
        ? "EVENT_CONSISTENT_CHANGE"
        : "ATYPICAL_CHANGE"
      : score < expected
        ? event
          ? "EVENT_CONSISTENT_CHANGE"
          : "WITHIN_EXPECTED_RANGE"
        : "WITHIN_EXPECTED_RANGE";

  let latestTrajectoryIndex = -1;
  for (let index = participant.trajectory.length - 1; index >= 0; index -= 1) {
    if (participant.trajectory[index]?.score !== null) {
      latestTrajectoryIndex = index;
      break;
    }
  }
  const latestTrajectoryPoint = participant.trajectory[latestTrajectoryIndex];
  if (latestTrajectoryPoint) {
    latestTrajectoryPoint.baseline = Math.round(
      (latestTrajectoryPoint.baseline * 0.8) + (score * 0.2),
    );
    latestTrajectoryPoint.lowerBand = lowerBand;
    latestTrajectoryPoint.upperBand = upperBand;
    latestTrajectoryPoint.classification = classification;
  }

  const eligibleObservations = participant.observations.length;
  const confidenceTier = confidenceFor(eligibleObservations);
  const difference = Math.round(score - baseline);
  const context = event
    ? `The observation sits ${Math.abs(difference)} points ${difference < 0 ? "below" : "from"} the personal baseline. A recorded ${event.label} is in the contextual observation window.`
    : `The observation sits ${Math.abs(difference)} points ${difference < 0 ? "below" : "from"} the personal baseline. No event context is being used.`;

  participant.summary.latestScore = score;
  participant.summary.latestClass = classification;
  participant.signal = {
    classification,
    whatChanged: difference < 0
      ? `Score dropped by ${Math.abs(difference)} points from the personal baseline.`
      : `Score moved ${Math.abs(difference)} points from the personal baseline.`,
    context,
    confidenceTier,
    confidenceFactors: [
      `${eligibleObservations} eligible observations`,
      `Baseline spread ${Math.round(spread)} points`,
      event ? `Event window overlaps ${event.label}` : "No recent case event",
      "No causal inference is made",
    ],
    actionLocked: true,
    taskId: null,
    owner: null,
  };

  if (fromNewObservation && previousSignal.classification === "SILENCE_REVIEW") {
    const silenceTask = state.tasks.find(
      (task) => task.participantId === participantId && task.taskType === "SILENCE_REVIEW",
    );
    if (silenceTask && silenceTask.status !== "CLOSED") {
      silenceTask.status = "CLOSED";
      silenceTask.escalationReason = "Late check-in received";
    }
  }

  if (classification === "ATYPICAL_CHANGE") {
    let task = state.tasks.find(
      (item) => item.participantId === participantId && item.taskType === "ATYPICAL_CHANGE",
    );
    if (!task) {
      task = {
        id: participantId === "p-02" ? "task-atypical" : `task-${participantId}-atypical`,
        taskType: "ATYPICAL_CHANGE",
        attentionTier: "PRIORITY_REVIEW",
        ageLabel: "Just now",
        participantId,
        pseudonym: participant.summary.pseudonym,
        owner: null,
        dueLabel: "Next working day",
        status: "OPEN",
        summary: "Observed score is outside the event-adjusted expected band.",
        escalationReason: null,
        confidenceTier,
      };
      state.tasks.push(task);
    } else {
      if (task.status === "CLOSED") task.status = task.owner ? "OWNED" : "OPEN";
      task.summary = "Observed score is outside the event-adjusted expected band.";
      task.confidenceTier = confidenceTier;
    }
    participant.signal.taskId = task.id;
    participant.signal.owner = task.owner;
    participant.signal.actionLocked = !task.owner;
  } else if (classification === "EVENT_CONSISTENT_CHANGE" || classification === "WITHIN_EXPECTED_RANGE") {
    participant.signal.taskId = null;
    participant.signal.actionLocked = true;
  }
}

export function hydrateState(state: NirantarState): NirantarState {
  for (const participant of Object.values(state.participants)) {
    participant.events ??= [];
    participant.timeline ??= [];
    participant.interventions ??= [];
    participant.observations ??= participant.trajectory.flatMap((point, index) =>
      point.score === null
        ? []
        : [{ id: `${participant.summary.id}-observation-${index + 1}`, label: point.label, score: point.score, source: "SYNTHETIC" as const }],
    );
    participant.interventions = participant.interventions.map((action) => ({
      ...action,
      followUpDueLabel: action.followUpDueLabel ?? action.followUpLabel,
      followUpState: action.followUpState ?? "UNKNOWN",
    }));
  }
  state.auditRows ??= [];
  state.auditTampered ??= false;
  return state;
}

export const initialState = (): NirantarState => {
  const participants = {
    "p-01": makeParticipant("p-01", "P-01", "baseline"),
    "p-02": makeParticipant("p-02", "P-02", "atypical"),
    "p-03": makeParticipant("p-03", "P-03", "silence"),
  };
  return {
    workspace: {
      clockLabel: "10 Sep 2026 · 09:12",
      activeRole: "COUNSELLOR",
      activeScenario: "atypical",
      counts: { openTasks: 2, unownedTasks: 2, participants: 3, followUps: 0 },
    },
    participants,
    tasks: [
      {
        id: "task-atypical",
        taskType: "ATYPICAL_CHANGE",
        attentionTier: "PRIORITY_REVIEW",
        ageLabel: "4h",
        participantId: "p-02",
        pseudonym: "P-02",
        owner: null,
        dueLabel: "Today · 14:00",
        status: "OPEN",
        summary: "Observed score is outside the event-adjusted expected band.",
        escalationReason: null,
        confidenceTier: "MODERATE CONFIDENCE",
      },
      {
        id: "task-silence",
        taskType: "SILENCE_REVIEW",
        attentionTier: "PRIORITY_REVIEW",
        ageLabel: "1d",
        participantId: "p-03",
        pseudonym: "P-03",
        owner: null,
        dueLabel: "Tomorrow · 10:00",
        status: "OPEN",
        summary: "Two scheduled check-ins have no response.",
        escalationReason: "Contact Restricted",
        confidenceTier: "REVIEW REQUIRED",
      },
      {
        id: "task-closed",
        taskType: "SAFETY_EVENT_REVIEW",
        attentionTier: "IMMEDIATE_ATTENTION",
        ageLabel: "2d",
        participantId: "p-01",
        pseudonym: "P-01",
        owner: "Supervisor",
        dueLabel: "Closed",
        status: "CLOSED",
        summary: "Event verification recorded.",
        escalationReason: "Completed",
        confidenceTier: null,
      },
    ],
    auditRows: [
      { sequence: 1, actor: "system", action: "Scenario loaded", hash: "9a1f…c204" },
      { sequence: 2, actor: "Counsellor", action: "Opened P-02 continuity", hash: "c204…a89d" },
      { sequence: 3, actor: "system", action: "Signal version 1.2.0 recorded", hash: "a89d…77bf" },
      { sequence: 4, actor: "system", action: "Synthetic event window evaluated", hash: "77bf…bb12" },
    ],
    auditTampered: false,
  };
};

const STATE_ID = "default";

export async function getState(): Promise<NirantarState> {
  const rows = await db.select().from(nirantarStateTable).where(eq(nirantarStateTable.id, STATE_ID));
  if (rows[0]) return hydrateState(rows[0].payload as NirantarState);
  const state = initialState();
  await db.insert(nirantarStateTable).values({ id: STATE_ID, payload: state });
  return state;
}

export async function saveState(state: NirantarState): Promise<void> {
  await db
    .update(nirantarStateTable)
    .set({ payload: state, updatedAt: new Date() })
    .where(eq(nirantarStateTable.id, STATE_ID));
}

export function recalculateWorkspace(state: NirantarState): void {
  const openTasks = state.tasks.filter((task) => task.status !== "CLOSED").length;
  state.workspace.counts = {
    openTasks,
    unownedTasks: state.tasks.filter((task) => task.status === "OPEN").length,
    participants: Object.keys(state.participants).length,
    followUps: Object.values(state.participants).reduce((count, participant) => count + participant.interventions.length, 0),
  };
}

export function addAudit(state: NirantarState, actor: string, action: string): void {
  const previous = state.auditRows.at(-1)?.hash ?? "root";
  const sequence = (state.auditRows.at(-1)?.sequence ?? 0) + 1;
  state.auditRows.push({ sequence, actor, action, hash: `${previous.slice(-4)}…${sequence.toString(16).padStart(4, "0")}` });
}