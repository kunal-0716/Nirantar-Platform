import { Router, type IRouter } from "express";
import {
  CreateActionBody,
  CreateCaseEventBody,
  CreateCaseEventParams,
  CreateCaseEventResponse,
  CreateActionResponse,
  DecideTaskBody,
  DecideTaskParams,
  DecideTaskResponse,
  GetParticipantContinuityParams,
  GetParticipantContinuityResponse,
  GetWorkspaceResponse,
  ListParticipantsResponse,
  ListTasksQueryParams,
  ListTasksResponse,
  ListParticipantsResponseItem,
  ListTasksResponseItem,
  TakeTaskOwnershipBody,
  TakeTaskOwnershipParams,
  TakeTaskOwnershipResponse,
  SubmitParticipantCheckinBody,
  SubmitParticipantCheckinResponse,
  ControlSimulationBody,
  ControlSimulationResponse,
  VerifyAuditResponse,
  VerifyAuditBody,
} from "@workspace/api-zod";
import {
  addAudit,
  getState,
  recalculateParticipant,
  recalculateWorkspace,
  saveState,
  type ActionRecord,
  type CaseEvent,
  type ReviewTask,
  type Scenario,
} from "../lib/nirantar";

const router: IRouter = Router();

router.get("/workspace", async (req, res): Promise<void> => {
  const state = await getState();
  res.json(GetWorkspaceResponse.parse(state.workspace));
});

router.get("/tasks", async (req, res): Promise<void> => {
  const parsedQuery = ListTasksQueryParams.safeParse(req.query);
  if (!parsedQuery.success) {
    res.status(400).json({ error: parsedQuery.error.message });
    return;
  }
  const state = await getState();
  const filter = parsedQuery.data.filter;
  const tasks = state.tasks.filter((task) => {
    if (filter === "unowned") return task.owner === null && task.status !== "CLOSED";
    if (filter === "mine") return task.owner === "R. Sen" && task.status !== "CLOSED";
    if (filter === "escalated") return task.status === "ESCALATED";
    return true;
  });
  res.json(ListTasksResponse.parse(tasks));
});

router.post("/tasks/:taskId/ownership", async (req, res): Promise<void> => {
  const params = TakeTaskOwnershipParams.safeParse(req.params);
  const body = TakeTaskOwnershipBody.safeParse(req.body);
  if (!params.success || !body.success) {
    res.status(400).json({ error: !params.success ? params.error.message : "Invalid ownership body" });
    return;
  }
  const state = await getState();
  const task = state.tasks.find((item) => item.id === params.data.taskId);
  if (!task) {
    res.status(404).json({ error: "Task not found" });
    return;
  }
  task.owner = body.data.owner;
  task.status = "OWNED";
  const participant = state.participants[task.participantId];
  if (participant) {
    participant.signal.owner = body.data.owner;
    participant.signal.actionLocked = false;
  }
  addAudit(state, body.data.owner, `Took ownership of ${task.pseudonym}`);
  recalculateWorkspace(state);
  await saveState(state);
  res.json(TakeTaskOwnershipResponse.parse(task));
});

router.post("/tasks/:taskId/decision", async (req, res): Promise<void> => {
  const params = DecideTaskParams.safeParse(req.params);
  const body = DecideTaskBody.safeParse(req.body);
  if (!params.success || !body.success) {
    res.status(400).json({ error: !params.success ? params.error.message : "Invalid decision body" });
    return;
  }
  const state = await getState();
  const task = state.tasks.find((item) => item.id === params.data.taskId);
  if (!task) {
    res.status(404).json({ error: "Task not found" });
    return;
  }
  if (body.data.decision === "ACT" && !task.owner) {
    res.status(409).json({ error: "Task must have an owner before an action decision can be recorded" });
    return;
  }
  task.status = body.data.decision === "ESCALATE"
    ? "ESCALATED"
    : body.data.decision === "ACT"
      ? "OWNED"
      : "CLOSED";
  task.escalationReason = body.data.rationale ?? task.escalationReason;
  const participant = state.participants[task.participantId];
  if (participant) {
    participant.signal.actionLocked = body.data.decision === "ACT" ? !task.owner : true;
    participant.timeline.push({
      id: `${task.id}-${body.data.decision.toLowerCase()}`,
      label: body.data.decision === "LOG_CONTACT" ? "Safe contact logged" : body.data.decision,
      kind: body.data.decision === "LOG_CONTACT" ? "INTERVENTION" : "FOLLOW_UP",
      description: body.data.rationale ?? "Human review decision recorded.",
      significance: null,
    });
  }
  addAudit(state, task.owner ?? "A. Rao", `Decision ${body.data.decision} on ${task.pseudonym}`);
  recalculateWorkspace(state);
  await saveState(state);
  res.json(DecideTaskResponse.parse(task));
});

router.get("/participants", async (_req, res): Promise<void> => {
  const state = await getState();
  const participants = Object.values(state.participants).map((item) => item.summary);
  res.json(ListParticipantsResponse.parse(participants));
});

router.get("/participants/:participantId/continuity", async (req, res): Promise<void> => {
  const params = GetParticipantContinuityParams.safeParse(req.params);
  if (!params.success) {
    res.status(400).json({ error: params.error.message });
    return;
  }
  const state = await getState();
  const participant = state.participants[params.data.participantId];
  if (!participant) {
    res.status(404).json({ error: "Participant not found" });
    return;
  }
  res.json(GetParticipantContinuityResponse.parse({
    participant: participant.summary,
    trajectory: participant.trajectory,
    timeline: participant.timeline,
    signal: participant.signal,
    events: participant.events,
    interventions: participant.interventions,
  }));
});

router.post("/participants/:participantId/events", async (req, res): Promise<void> => {
  const params = CreateCaseEventParams.safeParse(req.params);
  const body = CreateCaseEventBody.safeParse(req.body);
  if (!params.success || !body.success) {
    res.status(400).json({ error: !params.success ? params.error.message : "Invalid event body" });
    return;
  }
  const state = await getState();
  const participant = state.participants[params.data.participantId];
  if (!participant) {
    res.status(404).json({ error: "Participant not found" });
    return;
  }
  const event: CaseEvent = {
    id: `event-${Date.now()}`,
    label: body.data.label,
    eventType: body.data.eventType,
    status: "OCCURRED",
    significance: body.data.significance,
    dateLabel: body.data.dateLabel,
  };
  participant.events.push(event);
  participant.timeline.push({
    id: event.id,
    label: event.label,
    kind: "EVENT",
    description: "Case event recorded in the observation window.",
    significance: event.significance,
  });
  recalculateParticipant(state, params.data.participantId);
  addAudit(state, "Case Liaison", `Recorded event ${event.label}`);
  await saveState(state);
  res.status(201).json(CreateCaseEventResponse.parse(event));
});

router.post("/actions", async (req, res): Promise<void> => {
  const body = CreateActionBody.safeParse(req.body);
  if (!body.success) {
    res.status(400).json({ error: body.error.message });
    return;
  }
  const state = await getState();
  const participant = state.participants[body.data.participantId];
  const task = state.tasks.find((item) => item.id === body.data.taskId);
  if (!participant || !task || task.participantId !== body.data.participantId) {
    res.status(404).json({ error: "Participant or task not found" });
    return;
  }
  if (task.status === "CLOSED") {
    res.status(409).json({ error: "Task is already closed" });
    return;
  }
  if (!task.owner) {
    res.status(409).json({ error: "Task must have an owner before an action can close it" });
    return;
  }
  const action: ActionRecord = {
    id: `action-${Date.now()}`,
    pathway: body.data.pathway,
    outcome: body.data.outcome,
    followUpLabel: body.data.followUpLabel ?? "Structured follow-up created",
    followUpDueLabel: body.data.followUpDueLabel ?? "Next scheduled check-in",
    followUpState: "UNKNOWN",
    dateLabel: state.workspace.clockLabel.split(" · ")[0],
  };
  participant.interventions.push(action);
  participant.timeline.push({
    id: action.id,
    label: "Support provided",
    kind: "INTERVENTION",
    description: `${action.pathway} · ${action.outcome}`,
    significance: null,
  });
  participant.timeline.push({
    id: `${action.id}-follow-up`,
    label: "Follow-up scheduled",
    kind: "FOLLOW_UP",
    description: `${action.followUpDueLabel} · state ${action.followUpState}`,
    significance: null,
  });
  task.status = "CLOSED";
  participant.signal.actionLocked = true;
  participant.signal.owner = task.owner;
  addAudit(state, task.owner ?? "A. Rao", `Action recorded for ${participant.summary.pseudonym}`);
  recalculateWorkspace(state);
  await saveState(state);
  res.status(201).json(CreateActionResponse.parse(action));
});

router.post("/participant/checkins", async (req, res): Promise<void> => {
  const body = SubmitParticipantCheckinBody.safeParse(req.body);
  if (!body.success) {
    res.status(400).json({ error: body.error.message });
    return;
  }
  const state = await getState();
  const participant = state.participants[body.data.participantId];
  if (!participant) {
    res.status(404).json({ error: "Participant not found" });
    return;
  }
  const previousClassification = participant.summary.latestClass;
  const score = Math.round((body.data.responses.reduce((sum, value) => sum + value, 0) / 25) * 100);
  const observationId = `observation-${Date.now()}`;
  participant.observations.push({
    id: observationId,
    label: "Today",
    score,
    source: "PARTICIPANT_CHECKIN",
  });
  participant.summary.latestScore = score;
  participant.summary.lastObservationLabel = "Just now · response recorded";
  participant.trajectory.push({
    label: "Today",
    score,
    baseline: participant.trajectory.at(-1)?.baseline ?? 75,
    lowerBand: participant.trajectory.at(-1)?.lowerBand ?? 65,
    upperBand: participant.trajectory.at(-1)?.upperBand ?? 85,
    classification: "WITHIN_EXPECTED_RANGE",
    missing: false,
  });
  participant.timeline.push({
    id: observationId,
    label: "Check-in recorded",
    kind: "EVENT",
    description: `Participant response recorded at score ${score}.`,
    significance: null,
  });
  recalculateParticipant(state, body.data.participantId, true);
  const latestClassification = participant.signal.classification === "SILENCE_REVIEW"
    ? "WITHIN_EXPECTED_RANGE"
    : participant.signal.classification;
  const latestIntervention = participant.interventions.at(-1);
  if (latestIntervention && latestIntervention.followUpState === "UNKNOWN") {
    latestIntervention.followUpState = latestClassification === "ATYPICAL_CHANGE"
      ? previousClassification === "ATYPICAL_CHANGE" ? "PERSISTENT" : "CHANGED_AGAIN"
      : score >= (participant.trajectory.at(-1)?.baseline ?? score) - 5
        ? "RETURNED_TOWARD_BASELINE"
        : "UNKNOWN";
  }
  addAudit(state, "Participant", `Check-in recorded for ${participant.summary.pseudonym}`);
  recalculateWorkspace(state);
  await saveState(state);
  res.status(201).json(SubmitParticipantCheckinResponse.parse({
    message: "Thank you. Your response has been recorded.",
    score,
    classification: latestClassification,
  }));
});

router.post("/simulation", async (req, res): Promise<void> => {
  const body = ControlSimulationBody.safeParse(req.body);
  if (!body.success) {
    res.status(400).json({ error: body.error.message });
    return;
  }
  const state = await getState();
  if (body.data.action === "RESET") {
    const reset = (await import("../lib/nirantar")).initialState();
    await saveState(reset);
    res.json(ControlSimulationResponse.parse(reset.workspace));
    return;
  }
  const scenario = body.data.action === "LOAD_BASELINE"
    ? "baseline"
    : body.data.action === "LOAD_SILENCE"
      ? "silence"
      : body.data.action === "LOAD_ATYPICAL"
        ? "atypical"
        : state.workspace.activeScenario;
  if (body.data.action.startsWith("LOAD_")) {
    const next = (await import("../lib/nirantar")).initialState();
    next.workspace.activeScenario = scenario as Scenario;
    await saveState(next);
    res.json(ControlSimulationResponse.parse(next.workspace));
    return;
  }
  state.workspace.clockLabel = "11 Sep 2026 · 09:12";
  addAudit(state, "Simulation", "Advanced clock by 24 hours");
  await saveState(state);
  res.json(ControlSimulationResponse.parse(state.workspace));
});

router.post("/audit/verify", async (req, res): Promise<void> => {
  const body = VerifyAuditBody.safeParse(req.body ?? {});
  if (!body.success) {
    res.status(400).json({ error: body.error.message });
    return;
  }
  const state = await getState();
  if (body.data.simulateTamper) state.auditTampered = true;
  const result = state.auditTampered
    ? { status: "FAIL" as const, message: "Verification failed at sequence 3. Stored hash does not match recomputed chain.", checkedRows: state.auditRows.length, firstFailingSequence: 3 }
    : { status: "PASS" as const, message: "Verification passed. Sequence continuity and hash fragments are consistent.", checkedRows: state.auditRows.length, firstFailingSequence: null };
  addAudit(state, "Admin", `Audit verification ${result.status}`);
  await saveState(state);
  res.json(VerifyAuditResponse.parse(result));
});

export default router;