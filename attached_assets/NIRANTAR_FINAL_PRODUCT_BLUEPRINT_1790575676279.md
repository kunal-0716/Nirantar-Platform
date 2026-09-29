# NIRANTAR — FINAL PRODUCT BLUEPRINT

> **Document status:** Final reconciled product blueprint for the locked SIH product selection.
>
> **Product:** NIRANTAR — Case-Aware Wellbeing Continuity Engine
>
> **Problem Statement:** SIH26094
>
> **Data status:** All MVP data is synthetic. No real participant data, no real court or case identifiers, and no live integrations. Nothing in the MVP is clinically validated.
>
> **Implementation status:** Architecture and product specification only. This document contains no implementation code.

---

# PRODUCT NORTH STAR

> **Build a human-in-the-loop continuity system that understands how a victim’s wellbeing changes alongside the changing case context, identifies meaningful change with explicit uncertainty, and turns that signal into safe, accountable human action and measurable follow-up.**

NIRANTAR is **not** a distress prediction app, chatbot, generic case-management dashboard, or autonomous decision system.

Its central product question is:

> **“Is this person’s wellbeing trajectory changing meaningfully given what is happening in their case, how certain is that interpretation, and who should review it?”**

The product must make one loop continuously visible:

### **CASE EVENT → CHECK-IN → PERSONAL TRAJECTORY → CONTEXTUAL CHANGE → HUMAN REVIEW → ACTION → FOLLOW-UP**

The final word in the North Star loop is **Learn**. In the MVP, “Learn” means capturing reviewer feedback, dismissal reasons, outcomes, follow-up states, and system verification results for future calibration. The MVP does **not** perform online learning or silently change its decision rules.

## Non-negotiable principles

1. **Continuity is the product object.** The primary worker experience is a participant continuity view, not a generic alert dashboard.
2. **Longitudinal, context-conditioned change detection is the core technical primitive.**
3. **System outputs are attention signals and evidence, not diagnoses.**
4. **Case context changes interpretation, not truth.** The system must not claim that an event caused a wellbeing outcome without evidence.
5. **Silence is uncertainty, never proof of safety.**
6. **Every meaningful task has an accountable human owner or a defined escalation path.**
7. **Every intervention has a follow-up state.** The MVP must never claim intervention “efficacy”.
8. **Consent, privacy, and participant safety are architecture, not add-ons.**
9. **No invented government API, real victim dataset, or clinical validation claim.**
10. **Synthetic data demonstrates software behaviour only.**
11. **Threat/safety events never make the detector more tolerant.**
12. **A context window may classify a change as event-consistent, but may never suppress a safety condition or a sustained deterioration backstop.**
13. **There is no composite risk score and no red/amber/green risk display.**
14. **Every screen carries a visible `SYNTHETIC DATA` banner in the MVP.**
15. **The MVP is a modular monolith with a persisted simulation clock; unnecessary infrastructure is removed before core safety/continuity functionality is removed.**

---

# 0. RECONCILIATION DECISIONS

This section records the material disagreements between the earlier Product Blueprint and the hostile design audit, explains the final interpretation, and states the correction applied to the product.

## 0.1 Event context: wider threshold vs expected shift

**Disagreement:** The earlier blueprint widened a statistical tolerance band after a high-significance event. The audit identified this as unsafe because a threat or severe event could make the detector less sensitive exactly when attention may be most important.

**Resolution:** The system will **not widen the alert threshold because of an event**.

**Applied correction:** Case events create a time-dependent **expected score shift**. For ordinary events, the expected value may temporarily move downward and then recover toward baseline. A change can therefore be classified as `EVENT_CONSISTENT_CHANGE` if it is meaningful but remains inside the context-adjusted expected range. Safety/threat events contribute **zero expected shift** and create a separate immediate human-review path.

This preserves the North Star idea of “expected behaviour in context” without treating context as an excuse for deterioration.

---

## 0.2 Rolling baseline: all recent observations vs eligible observations

**Disagreement:** The earlier blueprint used a rolling baseline that could include post-event changes and post-signal observations. A sustained decline could therefore drag the baseline downward until the alert disappeared.

**Resolution:** Baseline calculations use **eligible observations only**. While an episode is open, the baseline is frozen.

**Applied correction:** Observations inside an active event window or inside an open atypical episode do not update the baseline used to judge that episode. This preserves the distinction between “what changed” and “what the new normal might eventually become.”

---

## 0.3 Simple z-score vs robust, small-N-safe detector

**Disagreement:** The earlier blueprint relied on a normal-distribution-style z-score with small sample sizes and could divide by a near-zero standard deviation.

**Resolution:** Keep the detector statistically simple and implementable, but make it robust and bounded.

**Applied correction:** Use MAD-based within-person spread, empirical-Bayes-style shrinkage toward a configured population prior, a minimum scale floor, a minimum meaningful change, persistence rules, a drift backstop, and a fixed absolute-floor backstop.

The result remains a configurable statistical detector, not a heavy ML model.

---

## 0.4 “Trajectory = slope” vs useful longitudinal representation

**Disagreement:** The earlier blueprint named slope as trajectory but never used it.

**Resolution:** “Trajectory” is represented by the person’s repeated observations, EWMA baseline, descriptive trend slope, and drift detector. Slope alone does not generate an alert.

**Applied correction:** The continuity view displays the trajectory; the detector uses baseline-relative residuals plus CUSUM for gradual drift. This makes the trajectory operational without pretending a single slope value is a clinical predictor.

---

## 0.5 “Cause-typed pathway” vs available data

**Disagreement:** The earlier blueprint proposed “cause-typed” support recommendations although the system does not establish causes.

**Resolution:** Use **context-typed pathways**.

**Applied correction:** Pathways are selected from the nearest relevant event type, current task type, participant safety/consent constraints, and worker judgement. The UI must state that the pathway is a review/action aid, not a causal inference.

---

## 0.6 Non-response: fixed timer sequence vs safety-gated state machine

**Disagreement:** The earlier state machine could send messages before checking whether contact was safe. It also had no proper pause/revoke exits or ownership timeout.

**Resolution:** All participant-facing dispatches go through a **dispatch gate before sending**. After a check-in is missed, the system does not automatically keep messaging.

**Applied correction:** `SCHEDULED → DISPATCHED → REMINDED → MISSED → IN_REVIEW → CLOSED`, with `SUPPRESSED` and `HALTED` safety states. Ownership and supervisor escalation are explicit. Timers are simulation-policy placeholders rather than institutional guarantees.

---

## 0.7 Single consent flag vs scoped, versioned consent

**Disagreement:** The earlier model reduced consent to one boolean.

**Resolution:** Consent is a set of explicit, versioned scopes.

**Applied correction:** Separate permissions for check-ins, role visibility, external sharing, named safe contacts, reminder permission, and other necessary contact controls. Revocation immediately blocks future participant-facing dispatch.

---

## 0.8 Case keyed by participant vs explicit Case entity

**Disagreement:** The earlier model attached events directly to a participant profile.

**Resolution:** NIRANTAR is case-aware, so cases must be first-class.

**Applied correction:** `Case` owns events. `CaseParticipant` links one or more participants to a case. One person may belong to multiple cases.

---

## 0.9 Real SMS/WhatsApp plumbing vs demonstrable core loop

**Disagreement:** The earlier blueprint assumed SMS/WhatsApp delivery and even suggested offline storage.

**Resolution:** Channel plumbing is not necessary to demonstrate NIRANTAR’s core innovation and introduces privacy and operational dependencies.

**Applied correction:** The MVP uses a simulated in-app device inbox behind a channel-adapter boundary. No real numbers, no real message delivery, no offline storage, no persistent participant answers on the device.

---

## 0.10 “Immutable audit” vs honest tamper-evidence

**Disagreement:** The earlier blueprint called the audit log immutable.

**Resolution:** A hash chain stored in the same database is **tamper-evident under a stated threat model**, not independently immutable.

**Applied correction:** Audit rows contain sequence, previous hash, current hash, actor, action, object reference, timestamp, and minimal metadata. A verification action must detect a modified row in the demo.

---

## 0.11 External referral acceptance vs simulated handoff

**Disagreement:** The earlier blueprint implied system-level referral to Tele-MANAS or an external service.

**Resolution:** NIRANTAR does not claim a system-to-system referral integration in the MVP.

**Applied correction:** A worker may record a “Facilitated connection” or internal handoff. The receiving party is a synthetic directory entry in the demo and may accept or decline. Any real helpline details or integration claims must be verified before real deployment.

---

## 0.12 Intervention “efficacy” vs follow-up state

**Disagreement:** The earlier blueprint described the post-action check-in as measuring intervention efficacy.

**Resolution:** A simple before/after prototype cannot establish causal efficacy.

**Applied correction:** The system records a follow-up state:
- `RETURNED_TOWARD_BASELINE`
- `PERSISTENT`
- `CHANGED_AGAIN`
- `UNKNOWN`

---

## 0.13 Generic dashboard vs continuity-first interface

**Disagreement:** The earlier Worker Dashboard was the primary screen and largely a list of alerts.

**Resolution:** A queue is operationally necessary but is not the product’s main differentiator.

**Applied correction:** The primary worker experience is the **Participant Continuity View**, with observed check-ins, expected band, event markers, missed-check-in gaps, attention signals, interventions, and follow-ups on one temporal surface. The queue is a supporting task-management screen.

---

## 0.14 “Insufficient evidence = review task” vs uncertainty-aware routing

**Disagreement:** Sending every sparse-history case to the review queue creates alarm fatigue.

**Resolution:** Insufficient evidence should be visible without automatically becoming a signal.

**Applied correction:** `INSUFFICIENT_EVIDENCE` is a status/class, not a standalone alert. A task is created only when it is paired with non-response, a positive safety item, a safety event, or another explicit review trigger.

---

## 0.15 “Learn” omitted vs capture-only feedback

**Disagreement:** The selected product’s North Star ends in a learning loop, but the earlier blueprint stopped at follow-up.

**Resolution:** Learning belongs in the architecture, but not as live online model adaptation in the MVP.

**Applied correction:** Store dismissal reasons, reviewer feedback, outcome states, signal versions, and verification results for future calibration.

---

# 1. PRODUCT DEFINITION

## 1.1 Product identity

**Name:** NIRANTAR

**Tagline:** Case-Aware Wellbeing Continuity Engine

**Product type:** Human-in-the-loop longitudinal wellbeing decision-support system.

## 1.2 Purpose

NIRANTAR helps authorized support workers detect meaningful changes in a participant’s wellbeing trajectory in relation to case events and turn that change into accountable human review, action, and follow-up.

The product does not determine:
- whether a participant has a mental-health condition;
- whether a case event caused a wellbeing change;
- whether a participant is objectively “safe” because they responded;
- whether a service or legal action should be initiated autonomously.

## 1.3 Primary product object

The primary product object is the **participant continuity state across the case lifecycle**.

The continuity state connects:

`participant → case membership → case events → check-in observations → personal trajectory → context-conditioned change → human review → action → follow-up → captured learning`

## 1.4 One-line value proposition

> **NIRANTAR helps authorized support workers detect meaningful changes in a participant’s wellbeing in the context of case events and turn those changes into timely, accountable human support.**

## 1.5 Product boundary

NIRANTAR sits between:
- structured longitudinal wellbeing observation;
- structured case-event context;
- human review;
- action coordination;
- follow-up.

It does **not** replace:
- case-management systems;
- legal case records;
- emergency services;
- mental-health treatment;
- government justice infrastructure;
- validated clinical assessment workflows.

## 1.6 MVP truth statement

> **All MVP data is synthetic. No real participant data, no real court or case identifiers, no live integrations. Nothing here is clinically validated.**

---

# 2. USERS & ROLES

## 2.1 Participant

A voluntary participant may be a victim, complainant, witness, or dependent linked to a synthetic case.

Primary capabilities:
- read consent information;
- provide or update scoped consent;
- complete structured check-ins;
- choose self or worker-assisted completion;
- raise a concern;
- pause participation;
- revoke participation;
- change permitted language;
- view a minimal participant-facing status message.

The participant does not see:
- internal reviewer notes;
- signal-classification logic;
- other participants;
- administrative audit information;
- internal task ownership;
- other people’s case information.

## 2.2 Case Liaison

Responsible for case-context logistics.

Capabilities:
- view only assigned participant/case relationships;
- create and edit case events;
- verify significance-3 events;
- maintain safe-contact plans;
- review silence tasks;
- perform approved participant contact through registered safe channels;
- update case-event status;
- record case-event provenance.

The Case Liaison must **not** make clinical referral decisions based on the detector.

## 2.3 Counsellor/Clinician

MVP role is a simulated persona for demonstrating human review of wellbeing signals.

Capabilities:
- view assigned signal evidence;
- review item-level check-in responses;
- review trajectory and uncertainty;
- select wellbeing-support pathways;
- countersign atypical-change dismissals when required;
- record an action;
- record outcome and follow-up state.

The MVP role is not a claim that a real deployment has clinical authority.

## 2.4 Supervisor

Responsible for escalation and operational safety.

Capabilities:
- receive unowned-task escalations;
- receive repeated non-response escalation;
- receive threat/safety-event tasks;
- receive overload/queue-capacity warnings;
- reassign tasks;
- countersign dismissals when required;
- review aggregate operational load;
- inspect assignment and escalation history.

## 2.5 Programme Admin

Oversight-only role.

Default capabilities:
- aggregate operations view;
- capacity metrics;
- system verification summary;
- audit-chain verification;
- simulation verification results.

Default restriction:
- no participant-level access.

Break-glass access, if included in the MVP demo, requires:
- written reason;
- second-person approval;
- time-limited access;
- explicit audit entry.

## 2.6 Receiving Party — Simulated

A synthetic directory entry representing a service recipient.

Capabilities:
- receive a simulated handoff;
- accept or decline;
- return a short structured status;
- produce no autonomous service decision.

## 2.7 Important operating constraint

> **Reviewer roles, response-time targets, escalation timers, and organisational ownership shown in the MVP are simulated programme policy. They do not represent institutional authority or a real-world service-level agreement.**

---

# 3. PERMISSIONS

## 3.1 Permission matrix

| Capability | Participant | Case Liaison | Counsellor/Clinician | Supervisor | Programme Admin | Simulated Receiver |
|---|---|---|---|---|---|---|
| View own consent | Yes | No | No | No | No | No |
| Change own participation status | Yes | No | No | No | No | No |
| Complete check-in | Yes | Assisted mode only | Assisted mode only | Assisted mode only | No | No |
| Raise concern | Yes | No | No | No | No | No |
| View assigned case events | Limited participant-facing subset if explicitly enabled | Yes | Yes, where assigned | Yes | Aggregate only | Handoff context only |
| Create/edit case event | No | Yes | No | Yes for correction/supersede | No | No |
| Verify significance-3 event | No | Second authorized operator / Supervisor | No | Yes | No | No |
| View raw item-level responses | Own responses only | No by default | Yes, assigned | Yes when necessary | No | No |
| View signal evidence | No | Limited task metadata | Yes | Yes | Aggregate only | Handoff-relevant subset |
| Review silence task | No | Yes | As assigned | Yes | Aggregate only | No |
| Take ownership of review task | No | Relevant task types | Yes | Yes | No | No |
| Dismiss atypical signal | No | No | Yes + required countersign | Yes | No | No |
| Create intervention | No | Logistics/support only | Yes | Yes | No | No |
| Share externally | Consent-gated worker action | Logistics only | Yes where scope allows | Yes | No | No |
| Record outcome | No | Operational outcomes | Yes | Yes | No | No |
| See aggregate operations | No | Limited to assigned operations | Limited | Yes | Yes | No |
| Verify audit chain | No | No | No | Yes | Yes | No |
| Break-glass participant view | No | No | No | Limited | Exceptional only | No |
| Access simulation controls | No | No | No | Optional | Yes | No |
| Access `SimulationTruth` | No | No | No | No | No | No |

## 3.2 Assignment rule

A worker may access only records where they are:
- directly assigned to the participant/case;
- assigned to the relevant task;
- explicitly escalated into the task;
- or authorised temporarily through the documented break-glass procedure.

## 3.3 Least privilege rule

No role receives a broad “view everything” permission merely because it is operationally convenient for the demo.

---

# 4. PRODUCT MODULES

NIRANTAR is a modular monolith divided into product modules.

## Module 1 — Consent & Participant Safety

Responsibilities:
- enrolment;
- scoped consent;
- language;
- assisted mode;
- pause/revoke;
- safety profile;
- safe contacts;
- discreet communication rules.

## Module 2 — Case & Event Timeline

Responsibilities:
- case entity;
- case-participant relationships;
- structured events;
- event lifecycle;
- event verification;
- event windows;
- event supersession.

## Module 3 — Longitudinal Check-in Engine

Responsibilities:
- instrument versioning;
- check-in scheduling;
- check-in request state;
- item-level response storage;
- safety item;
- score normalization;
- late response handling.

## Module 4 — Statistical Change Detector

Responsibilities:
- eligible-observation selection;
- personal EWMA baseline;
- robust spread;
- shrinkage and scale floor;
- expected event-conditioned score;
- residual calculation;
- minimum meaningful change;
- persistence;
- CUSUM drift backstop;
- absolute-floor backstop;
- attention classification;
- uncertainty factors.

## Module 5 — Human Review & Task Orchestration

Responsibilities:
- episodes;
- review tasks;
- task ownership;
- task timeout;
- escalation;
- countersign;
- review decisions;
- pathway selection.

## Module 6 — Action, Handoff & Follow-up

Responsibilities:
- intervention records;
- consent checks before sharing;
- synthetic receiving party;
- handoff acceptance/decline;
- outcome capture;
- follow-up scheduling;
- follow-up state.

## Module 7 — Non-Response & Contact Safety

Responsibilities:
- dispatch gate;
- reminder rules;
- missed check-in states;
- restricted/suppressed contact;
- silence review;
- escalation.

## Module 8 — Continuity & Governance Audit

Responsibilities:
- tamper-evident audit;
- access events;
- model/config version references;
- verification;
- redaction rules.

## Module 9 — Simulation & Demonstration Control

Responsibilities:
- scenario loading;
- simulation clock;
- state advancement;
- deterministic resets;
- null-cohort run;
- ground-truth isolation;
- demo labels.

---

# 5. FEATURE ARCHITECTURE

## 5.1 Participant-facing features

The participant experience must be short, discreet, and low-friction.

Core features:
- consent intro;
- check-in;
- safety item;
- always-visible “Raise concern” control;
- help page;
- pause;
- revoke;
- language selection;
- quick exit;
- neutral completion message.

Participant-facing design rules:
- no prior responses displayed;
- no visible internal score trend;
- no programme-specific wording in simulated channel previews;
- no free-text field in the ordinary check-in;
- no offline persistence;
- no health terminology in neutral reminder text;
- `SYNTHETIC DATA` banner remains visible in MVP.

## 5.2 Worker-facing features

The worker interface is continuity-first.

Primary:
- review queue;
- participant continuity view;
- signal review;
- event entry/edit;
- silence review;
- action/handoff;
- outcome/follow-up.

Secondary:
- assignment;
- supervisor escalation;
- aggregate operations.

## 5.3 Intelligence features

The detector must expose:
- event context;
- expected shift;
- observed score;
- personal baseline;
- expected band;
- residual;
- confidence tier;
- confidence factors;
- classification;
- persistence;
- backstop subtype.

The interface must never reduce the result to a single “risk score”.

## 5.4 Governance features

- scoped consent records;
- safety profile;
- task ownership;
- escalation history;
- audit chain;
- audit verification;
- synthetic-data guard;
- configuration versioning.

---

# 6. COMPLETE USER JOURNEYS

## 6.1 Journey A — Participant Enrollment

**Entry:** Participant is invited by the assigned programme flow in the synthetic environment.

**Step 1 — Consent intro**
- explains voluntary participation;
- states participation does not affect the case or relief;
- states this is not real-time monitoring;
- states the system is not an emergency service;
- explains what information is collected.

**Step 2 — Consent scopes**
Participant selects the permitted scopes required for the MVP:
- check-ins;
- role visibility;
- reminder permission;
- external sharing when a later action requests it;
- named safe-contact permission where applicable.

**Step 3 — Safety profile**
Participant can:
- restrict automated contact;
- choose permitted channels/time windows;
- choose discreet communication;
- register safe contacts only where explicitly permitted.

**Step 4 — Language and mode**
- choose supported language;
- choose `self` or `assisted` mode.

**Step 5 — Baseline**
Participant completes the placeholder wellbeing instrument plus the separate safety item.

**Completion**
A baseline observation is created only after valid consent and a valid response.

---

## 6.2 Journey B — Scheduled Check-in

**Entry:** Check-in request reaches `SCHEDULED`.

**Dispatch gate**
Before any message:
- consent active;
- participant not paused/halted/withdrawn;
- channel permitted;
- time window permitted;
- discreet template exists.

**Dispatch**
A simulated device-inbox message appears.

**Participant**
- opens check-in;
- sees the disclosure and help control;
- answers five wellbeing items;
- answers safety item;
- submits.

**System**
- stores item-level responses;
- normalizes score;
- evaluates late status;
- selects eligible historical observations;
- calculates trajectory and expected value;
- runs detector;
- generates or updates signal/episode if required.

**Outcome**
- response is recorded;
- check-in request closes;
- an open silence task is cleared when a late response arrives.

---

## 6.3 Journey C — Participant Raises a Concern

**Entry:** Participant selects `Raise concern`.

**System**
- creates `CONCERN_RAISED`;
- creates a top-priority review task;
- does not require waiting for the next scheduled check-in.

**Participant**
Sees:
- plain-language confirmation;
- emergency-service disclosure;
- verified-in-build emergency/helpline options when those details are available.

**Worker**
Reviews the concern and chooses an appropriate human action.

---

## 6.4 Journey D — Participant Pauses Participation

**Entry:** Participant selects `Pause`.

**System**
- changes participant status to `paused`;
- halts future participant-facing dispatch;
- prevents new silence tasks;
- retains existing records according to the retention policy;
- notifies the assigned worker of the status change only.

**Resume**
A later explicit participant action changes status to `active`.

---

## 6.5 Journey E — Participant Revokes Consent

**Entry:** Participant selects `Revoke`.

**System**
- immediately sets the relevant consent record to revoked;
- halts future participant-facing dispatch;
- prevents new silence tasks;
- does not display a signal or score back to the participant;
- notifies assigned worker that participation status changed.

No automated contact is initiated after revocation.

---

## 6.6 Journey F — Worker Creates a Case Event

**Entry:** Case Liaison opens the assigned participant’s case timeline.

**Step 1**
Select event type.

**Step 2**
Select lifecycle status:
- scheduled;
- occurred;
- postponed;
- cancelled;
- corrected.

**Step 3**
Enter time information.

**Step 4**
Select significance 1–3.

**Step 5**
If significance = 3:
- require a second confirmation;
- store verifier.

**Step 6**
If type is `THREAT_SAFETY`:
- flag `is_safety_event = true`;
- do not create an expected shift;
- create a `SAFETY_EVENT_REVIEW` task for Supervisor.

**Step 7**
Save event provenance.

**Retroactive correction**
Creates a new version and preserves earlier signal records.

---

## 6.7 Journey G — Event-Conditioned Change

**Entry:** A check-in is submitted within a configured event window.

**System**
- retrieves eligible baseline;
- computes EWMA and robust spread;
- calculates event-conditioned expected score;
- calculates expected band;
- computes decline residual;
- applies MMC;
- applies persistence;
- applies CUSUM/floor backstops;
- calculates confidence tier.

**Possible result**
`EVENT_CONSISTENT_CHANGE`

No review task is created unless another rule independently requires review.

The continuity view explains:
> “A recorded event falls within the configured observation window.”

It does **not** say:
> “The event caused the decline.”

---

## 6.8 Journey H — Atypical Change Review

**Entry:** `ATYPICAL_CHANGE` creates/updates an episode.

**Queue**
Task is ordered by attention tier then age.

**Worker opens continuity view**
Sees:
- current score;
- prior observations;
- EWMA baseline;
- expected band;
- event markers;
- missed-check-in gaps;
- signal marker;
- confidence tier and factors;
- prior actions;
- follow-ups.

**Worker**
- acknowledges;
- takes ownership;
- reviews evidence;
- chooses `Dismiss`, `Act`, or `Escalate`.

**Dismiss**
Requires:
- reason code;
- qualified countersign where required.

**Act**
Requires:
- action type;
- rationale;
- consent check if sharing is involved.

**Escalate**
Transfers ownership to Supervisor or another authorized role.

---

## 6.9 Journey I — Simulated Handoff

**Worker chooses action requiring another party.**

System checks:
- relevant consent scope;
- target party;
- permitted disclosure level.

A synthetic receiving party appears in the demo directory.

Receiver may:
- accept;
- decline.

System stores handoff status and timestamp.

No external system is contacted.

---

## 6.10 Journey J — Outcome and Follow-up

After the human action:
- worker records outcome;
- system creates an allowed follow-up request;
- cadence cap is checked;
- dispatch gate will be evaluated when the follow-up becomes due.

Possible outcome:
- completed;
- participant declined;
- unable to reach;
- participant requested continuation;
- other configured structured state.

Follow-up state later becomes:
- `RETURNED_TOWARD_BASELINE`;
- `PERSISTENT`;
- `CHANGED_AGAIN`;
- `UNKNOWN`.

---

## 6.11 Journey K — Non-response / Silence

**Entry:** scheduled check-in becomes due.

**Dispatch gate**
If it passes:
- `DISPATCHED`.

At due + 24h:
- one reminder maximum, only if the gate passes again.

At due + 48h or cadence-adjusted placeholder:
- `MISSED`;
- no further automated participant message;
- `SILENCE_REVIEW` task created.

Worker reviews:
- recent events;
- prior atypical episode;
- consecutive misses;
- contact restrictions;
- last valid observation;
- current participant status.

Worker chooses:
- contact through registered safe channel;
- plan a retry;
- escalate.

After three consecutive misses (placeholder):
- Supervisor escalation.

Late response:
- accepted;
- marked `late`;
- evaluated;
- clears open silence review where appropriate.

---

## 6.12 Journey L — Supervisor Escalation

**Triggers**
- unowned task timeout;
- repeated non-response;
- threat/safety event;
- queue overload;
- explicit worker escalation.

Supervisor:
- reviews evidence;
- assigns or reassigns owner;
- records action;
- can countersign dismissal;
- closes escalation only after a documented disposition.

---

## 6.13 Journey M — Programme Admin Oversight

Admin opens aggregate operations.

Can view:
- active task counts;
- task age bands;
- completion/missingness aggregates;
- follow-up state distribution;
- software-verification metrics;
- audit verification result.

Cannot open a participant.

---

## 6.14 Journey N — Audit Verification

Authorized oversight user opens audit verification.

System:
- checks sequence continuity;
- recomputes chain hashes;
- reports pass/fail;
- identifies first failing sequence.

Demo supports:
1. successful verification;
2. intentional modification of a database row;
3. failed verification.

---

# 7. COMPLETE SCREEN INVENTORY

## 7.1 Mandatory screens

| ID | Screen | Role | Priority | Purpose |
|---|---|---|---|---|
| S01 | Login / Demo Persona Switcher | All internal roles | MUST | Enter synthetic environment with explicit persona |
| S02 | Review Queue | Operational/Supervisor | MUST | Prioritize human-owned work |
| S03 | Participant Continuity View | Worker/Supervisor | MUST | Main NIRANTAR experience |
| S04 | Signal Review Panel | Worker/Supervisor | MUST | Examine evidence and make a decision |
| S05 | Event Entry/Edit | Case Liaison/Supervisor | MUST | Maintain structured event timeline |
| S06 | Action & Handoff | Counsellor/Clinician/Supervisor | MUST | Record action and simulated handoff |
| S07 | Outcome & Follow-up | Operational roles | MUST | Close action loop |
| S08 | Silence Review | Case Liaison/Supervisor | MUST | Handle missed check-in safely |
| S09 | Enrollment / Consent / Safety | Participant/Worker-assisted | MUST | Capture participation and safety settings |
| S10 | Participant Check-in | Participant/Assisted | MUST | Collect structured observation |
| S11 | Participant Help / Raise Concern | Participant | MUST | Provide immediate concern pathway |
| S12 | Participant Settings | Participant | MUST | Pause, revoke, language, safety preferences |
| S13 | Supervisor Escalations | Supervisor | SHOULD | Focused escalation view |
| S14 | Aggregate Operations | Supervisor/Admin | SHOULD | Operational aggregate view |
| S15 | Audit Verification | Supervisor/Admin | MUST | Verify tamper-evident log |
| S16 | Simulation Control | Admin/demo operator | MUST | Clock, scenarios, reset, null cohort |
| S17 | Assignment / Workload | Supervisor | SHOULD | Explicitly assign/reassign tasks |
| S18 | Synthetic Receiver | Simulated receiver | MUST for demo | Accept/decline simulated handoff |

## 7.2 Continuity View composition

The continuity view is the product’s hero screen.

It must show, on one timeline:
- observed check-in points;
- score trajectory;
- EWMA baseline;
- expected band;
- event markers;
- event observation windows;
- missed-check-in gaps;
- attention signal markers;
- intervention markers;
- follow-up markers;
- participant status changes relevant to interpretation.

It must answer visually:
> **What happened, what changed, what context surrounds it, what is uncertain, and what happened next?**

## 7.3 Queue design

Queue columns should be:
- task type;
- attention tier;
- age;
- participant/case pseudonymous reference;
- owner;
- due time;
- escalation state.

Do not display:
- risk score;
- red/amber/green;
- synthetic “severity score”;
- pseudo-clinical probability.

---

# 8. CORE WORKFLOW

## 8.1 Canonical NIRANTAR workflow

```text
CASE EVENT
    ↓
CHECK-IN SCHEDULED
    ↓
DISPATCH GATE
    ↓
CHECK-IN RESPONSE / MISSED CHECK-IN
    ↓
ELIGIBLE HISTORY + CASE CONTEXT
    ↓
PERSONAL TRAJECTORY
    ↓
EXPECTED CONTEXTUAL SCORE
    ↓
CHANGE DETECTOR
    ↓
UNCERTAINTY / CONFIDENCE
    ↓
ATTENTION CLASSIFICATION
    ↓
EPISODE / REVIEW TASK IF REQUIRED
    ↓
HUMAN REVIEW
    ↓
ACTION / DISMISS / ESCALATE
    ↓
SIMULATED HANDOFF IF NEEDED
    ↓
OUTCOME
    ↓
FOLLOW-UP CHECK-IN
    ↓
FOLLOW-UP STATE
    ↓
LEARN / CALIBRATION DATA CAPTURE
```

## 8.2 Core invariants

- A case event is not a signal.
- A check-in score is not a diagnosis.
- An event window is not proof of causation.
- A missed check-in is not evidence of safety.
- An `INSUFFICIENT_EVIDENCE` state is not an automatic alert.
- A signal is not an action.
- A task is not closed merely because it was viewed.
- A follow-up is not an efficacy claim.
- Audit verification is not proof of absolute immutability.

---

# 9. INTELLIGENCE ARCHITECTURE

## 9.1 Intelligence boundary

The MVP intelligence layer is a **rule-based statistical change detector**.

No deep learning is required.

No clinical diagnosis is produced.

No population-wide distress prediction is produced.

## 9.2 Inputs

For each participant:
- historical check-in item responses;
- current check-in score;
- check-in timestamps;
- late/missed status;
- case-event records;
- event type;
- event significance;
- event status;
- event observation configuration;
- data quality flags;
- participant safety item;
- current consent/contact state.

## 9.3 Outputs

The detector returns:
- class;
- subtype;
- baseline;
- effective spread;
- expected value;
- expected band;
- decline residual;
- confidence tier;
- confidence factors;
- episode reference;
- model/config version;
- supersedes/version reference where recomputed.

## 9.4 Separation of responsibilities

### Normal software logic
- RBAC;
- consent;
- CRUD;
- scheduling;
- state machines;
- task management;
- audit;
- UI.

### Statistical layer
- EWMA;
- robust spread;
- shrinkage;
- event-conditioned expected value;
- residual;
- persistence;
- CUSUM;
- absolute floor.

### Policy layer
- queue ordering;
- task creation;
- escalation;
- human action options.

### Safety layer
- dispatch gate;
- safety item;
- threat event branch;
- raise-concern workflow;
- pause/revoke.

---

# 10. LONGITUDINAL CHANGE-DETECTION LOGIC

This is the primary technical specification.

## 10.1 Instrument

MVP placeholder instrument:
- 5 wellbeing items;
- each item scored 0–5;
- higher = better for the prototype;
- raw total = 0–25;
- normalized score = raw total × 4;
- range = 0–100.

A separate safety item is:
- `YES`;
- `NO`;
- `PREFER_NOT_TO_SAY`.

The safety item is **not part of the wellbeing score**.

The instrument definition is versioned and stores:
- instrument ID;
- version;
- language;
- item IDs;
- item direction;
- response scale;
- normalization rules.

> **Placeholder instrument. A clinical owner must select the real instrument and validated translations before any real use.**

## 10.2 Cadence

MVP placeholders:
- default scheduled check-in: weekly;
- max one event-triggered extra check-in per 7 days;
- hard cap: 3 check-ins per 7 days;
- participant may defer.

No action may schedule a follow-up that violates the cadence cap.

## 10.3 Eligible observations

An observation is eligible for baseline estimation if:
- it is a completed check-in;
- its data-quality status is acceptable;
- it is not inside an active event window for baseline purposes;
- it is not part of an open episode under evaluation;
- it is not otherwise flagged as invalid.

The current observation is not inserted into its own prior baseline.

## 10.4 Personal baseline

The baseline `μ_t` is an exponentially weighted mean over eligible historical observations.

Placeholder:
- half-life ≈ 3 eligible check-ins.

While an atypical-change episode is open:
- baseline used for evaluating that episode is frozen.

## 10.5 Robust within-person spread

Compute a robust spread estimate `σ_hat` using MAD-based dispersion.

Then apply shrinkage toward a configured prior:

`σ_eff² = (n · σ_hat² + n0 · σ_prior²) / (n + n0)`

MVP placeholders:
- `n0 = 4`;
- `σ_prior = 8 score points`.

Then apply:

`σ_eff = max(σ_eff, σ_floor)`

MVP placeholder:
- `σ_floor = 4 score points`.

This prevents a stable series such as `20, 20, 20, 20` from making a one-point movement appear infinitely large.

## 10.6 Event-conditioned expected score

For each non-safety event `e`, configure:
- pre-window duration;
- post-window duration;
- expected drop `δ_e`;
- recovery constant `τ_e`.

MVP configuration values are synthetic placeholders.

Expected score:

`E_t = μ_t − max(δ_e · r_e(Δd))`

where `r_e` is:
- a ramp during the pre-event window;
- `1` at the event;
- `exp(−Δd/τ_e)` after the event.

Important:
- overlapping event shifts combine by **maximum**, not addition;
- event significance may influence configuration;
- threat/safety events contribute **zero** to `E_t`;
- context can explain classification but cannot remove an independent safety backstop.

## 10.7 Expected band

Display:

`E_t ± σ_eff`

The band is a presentation and interpretation aid. It is not a clinical confidence interval.

## 10.8 Decline residual

Only declines are relevant to attention.

Define:

`z_dec = (E_t − score_t) / σ_eff`

Where:
- positive `z_dec` means observed wellbeing is below expected value;
- negative `z_dec` means observed wellbeing is above expected value.

Implausibly large upward jumps:
- trigger data-quality review;
- do not become an attention signal.

## 10.9 Minimum meaningful change

MVP placeholder:

`MMC = 10 score points`

No `ATYPICAL_CHANGE` or `EVENT_CONSISTENT_CHANGE` classification may be generated solely from a smaller absolute drop.

This rule protects the system from small numerical movements becoming operational noise.

## 10.10 Attention classes

The single canonical enum is:

### `WITHIN_EXPECTED_RANGE`

Use when:
- the observation does not meet meaningful-change requirements;
- no safety condition overrides it;
- no backstop triggers.

### `EVENT_CONSISTENT_CHANGE`

Use when:
- absolute drop from personal baseline ≥ MMC;
- relevant ordinary event context is active;
- decline residual is below the atypical threshold.

No review task is created by this class alone.

At the end of the configured event window plus grace:
- if the person has not moved back toward baseline, the result may convert to `ATYPICAL_CHANGE`.

### `ATYPICAL_CHANGE`

Use when one or more of the following are true:
- `z_dec ≥ 2.0` with persistence;
- two consecutive observations each have `z_dec ≥ 1.5`;
- one observation has `z_dec ≥ 3.0`;
- one observation drops by ≥ 25 points;
- CUSUM drift backstop triggers;
- absolute-floor backstop triggers.

MVP persistence values are placeholders.

### `INSUFFICIENT_EVIDENCE`

Use when:
- fewer than 4 eligible historical observations;
- last valid observation is older than the configured gap limit;
- relevant data-quality flag exists.

This class:
- is visible to the reviewer;
- is not itself a review task;
- becomes actionable only when paired with another explicit review trigger.

### `IMMEDIATE_ATTENTION`

Use when:
- the safety item is positive;
- regardless of baseline;
- regardless of event context;
- regardless of current classification.

## 10.11 Gradual drift backstop

Use one-sided CUSUM on decline residuals.

MVP placeholders:
- reference level ≈ `0.5σ`;
- threshold ≈ `4σ`.

The purpose is to catch:
- small declines over time;
- slow deterioration that would otherwise adapt into the baseline.

Output:
- `ATYPICAL_CHANGE`
- subtype `GRADUAL_DRIFT`.

## 10.12 Absolute floor backstop

MVP placeholder:
- score below `40`;
- on two consecutive completed check-ins.

Output:
- `ATYPICAL_CHANGE`
- subtype `SUSTAINED_LOW`.

The absolute floor exists because a person may be chronically low and stable relative to their personal baseline.

## 10.13 Threat/safety event rule

A worker-entered threat/safety event:
- does not create an expected downward shift;
- does not widen any tolerance;
- does not suppress any change signal;
- creates `SAFETY_EVENT_REVIEW`.

## 10.14 Missingness as a feature

Track:
- missed check-ins;
- late responses;
- consecutive misses;
- rolling missingness rate.

Missingness appears on the continuity timeline.

Missingness influences:
- silence-task priority;
- confidence;
- contextual review.

It is never interpreted as proof of worsening or proof of safety.

## 10.15 Episode aggregation

Multiple related signals are collapsed into one `Episode`.

A new task is not created for every consecutive atypical observation.

Re-alert only when:
- attention class escalates;
- a new safety condition occurs;
- a new independent review trigger occurs.

If the next observation is also atypical after a dismissal:
- the episode resurfaces.

---

# 11. CASE EVENT MODEL

## 11.1 Case entity

A `Case` contains:
- synthetic case reference;
- case type;
- current stage;
- status;
- created timestamp;
- data origin.

## 11.2 Case-participant relationship

`CaseParticipant` contains:
- case ID;
- participant ID;
- role;
- start date;
- end date if applicable;
- data origin.

Allowed relationship roles:
- victim;
- witness;
- complainant;
- dependent.

One case may have multiple participants.

One participant may have multiple cases.

## 11.3 Case event

`CaseEvent` fields:
- `event_id`;
- `case_id`;
- `type`;
- `status`;
- `scheduled_at`;
- `occurred_at`;
- `significance`;
- `is_safety_event`;
- `source`;
- `entered_by`;
- `verified_by`;
- `supersedes_event_id`;
- `version`;
- `created_at`;
- `data_origin`.

## 11.4 Event lifecycle

Allowed states:
- `SCHEDULED`;
- `OCCURRED`;
- `POSTPONED`;
- `CANCELLED`;
- `CORRECTED`.

A future-dated event may only exist in `SCHEDULED`.

## 11.5 Event types

MVP:
- `HEARING`;
- `BAIL_DECISION`;
- `PROTECTION_ORDER_EVENT`;
- `RELIEF_COMPENSATION`;
- `RELOCATION`;
- `THREAT_SAFETY`.

## 11.6 Significance

- `1 = ROUTINE`
- `2 = MODERATE`
- `3 = HIGH_SIGNIFICANCE`

Significance 3 requires second confirmation.

## 11.7 Event configuration

`EventConfig` is versioned and contains:
- event type;
- pre-window days;
- post-window days;
- expected drop `δ`;
- recovery constant `τ`;
- maximum contextual shift;
- grace period.

Values are:
- synthetic MVP configuration;
- clinician-configurable priors;
- not learned;
- not validated clinically.

## 11.8 Overlap rule

If multiple ordinary events overlap:
- use the maximum expected shift.

Never sum shifts.

Reason:
- prevents stacking arbitrary explanatory effects;
- keeps the model interpretable;
- reduces the chance that a sequence of events can suppress attention indefinitely.

## 11.9 Retroactive edits

If an event is corrected:
- create a new event version;
- preserve the prior version;
- annotate the timeline with “context updated”;
- recompute downstream state through a versioned signal process;
- never silently delete earlier signals.

## 11.10 Event provenance

The event timeline must show:
- entered by;
- verified by when applicable;
- source;
- version;
- lifecycle status.

---

# 12. NON-RESPONSE STATE MACHINE

## 12.1 Principle

> **Silence does not equal safety.**

Every participant-facing dispatch passes the dispatch gate.

## 12.2 Dispatch gate

A dispatch is allowed only when all are true:

`consent active`
AND
`participant not paused/halted/withdrawn`
AND
`channel permitted`
AND
`current time within allowed contact window`
AND
`discreet template available`.

If any condition fails:
- no participant-facing message;
- state becomes `SUPPRESSED`;
- a `CONTACT_RESTRICTED_DUE` task may be created for a Case Liaison if operational follow-up is warranted.

## 12.3 State definitions

### `SCHEDULED`

Entry:
- weekly cadence;
- approved event trigger;
- approved follow-up trigger.

Behaviour:
- waits until due.

### `DISPATCHED`

Entry:
- dispatch gate passes.

Behaviour:
- simulated discreet message sent.

### `REMINDED`

Entry:
- due + 24h placeholder;
- gate passes again;
- reminder permission exists.

Behaviour:
- at most one participant-facing reminder for the check-in.

### `MISSED`

Entry:
- due + 48h placeholder, scaled if cadence configuration requires.

Behaviour:
- record missed;
- create `SILENCE_REVIEW`;
- stop participant-facing automated contact.

Priority is increased by:
- recent high-significance event;
- recent threat/safety event;
- consecutive misses;
- prior atypical episode;
- restricted profile.

### `IN_REVIEW`

Entry:
- human worker owns silence task.

Worker options:
- contact using registered safe channel;
- plan retry;
- escalate.

Worker records outcome:
- reached and okay;
- reached and needs support;
- not reached;
- unreachable.

### `CLOSED`

Entry:
- worker outcome recorded.

Behaviour:
- future scheduled check-in proceeds through normal rules.

### `SUPPRESSED`

Entry:
- dispatch gate fails.

Behaviour:
- no message.

### `HALTED`

Entry:
- participant pauses or revokes, from any state.

Behaviour:
- no messages;
- no silence tasks;
- worker receives status-change notification only.

## 12.4 Repeated misses

Placeholder:
- three consecutive misses trigger Supervisor escalation.

This is a configurable synthetic policy, not a real-world service target.

## 12.5 Late response

A late response:
- is accepted;
- receives `late = true`;
- is evaluated by the detector;
- updates the timeline;
- clears open silence review where appropriate.

## 12.6 No unowned silence task

Every `SILENCE_REVIEW` has:
- owner;
- due time;
- escalation history.

Unowned task timeout:
- placeholder 24h simulated;
- escalates to Supervisor.

---

# 13. HUMAN REVIEW WORKFLOW

## 13.1 Review packet

A worker reviewing an attention task must see:

1. current item-level check-in responses;
2. normalized score;
3. previous observations;
4. EWMA baseline;
5. expected band;
6. event timeline;
7. event window;
8. missingness/late-response context;
9. confidence tier;
10. confidence factors;
11. prior actions;
12. open episode information;
13. previous outcomes;
14. context-typed action pathways.

## 13.2 Confidence display

The UI must explicitly state:

> **Confidence tier is not a probability and is not clinical certainty.**

Suggested factors:
- number of eligible observations;
- degree of variance shrinkage;
- time since last valid observation;
- event-data quality.

## 13.3 Confidence tiers

- `INSUFFICIENT`: fewer than 4 eligible observations;
- `LOW`: 4–7;
- `MODERATE`: 8–15;
- `HIGHER`: 16+.

Final tier is the lowest tier produced by the factor set.

These are software-design placeholders, not validated confidence probabilities.

## 13.4 Review actions

### Acknowledge

Means:
- worker has seen the task.

Does not:
- take ownership;
- close the task.

### Take ownership

Means:
- worker becomes the accountable owner.

### Dismiss

Requires:
- structured reason code;
- reviewer identity;
- countersign for atypical-change dismissal by a Counsellor/Clinician or Supervisor.

### Act

Requires:
- action type;
- rationale;
- consent check if any external sharing occurs.

### Escalate

Moves ownership to the next authorised role.

## 13.5 Dismissal re-open rule

If an episode was dismissed and the next completed observation is also atypical:
- the episode resurfaces;
- a new or updated review task is created;
- prior dismissal remains visible.

---

# 14. ACTION & OUTCOME WORKFLOW

## 14.1 Action types

MVP examples:
- `SUPPORT_CHECK_IN`;
- `LEGAL_ACCOMPANIMENT_SUPPORT`;
- `COUNSELLING_CONNECTION`;
- `SAFETY_REVIEW`;
- `CASE_LIAISON_FOLLOW_UP`;
- `SUPERVISOR_ESCALATION`;
- `FACILITATED_CONNECTION`.

These are action categories, not automated prescriptions.

## 14.2 Context-typed pathway logic

Pathway suggestions consider:
- current task type;
- nearest relevant event type;
- event lifecycle;
- participant consent;
- safety profile;
- prior actions.

Example:
- a legal-event-related signal may surface “case liaison follow-up”;
- a wellbeing signal reviewed by a Counsellor/Clinician may surface “counselling connection”;
- a threat/safety event surfaces safety review.

The system must not say:
> “The hearing caused mental-health decline.”

It may say:
> “A hearing is within the configured event window.”

## 14.3 Handoff

Before a handoff:
- check consent scope;
- select permitted disclosure level;
- select synthetic receiving party.

MVP status:
- pending;
- accepted;
- declined.

No real external system is called.

## 14.4 Outcome

Outcome is structured.

Suggested values:
- `COMPLETED`;
- `PARTICIPANT_DECLINED`;
- `UNABLE_TO_REACH`;
- `CONTINUED_SUPPORT_REQUESTED`;
- `OTHER_CONFIGURED_OUTCOME`.

## 14.5 Follow-up scheduling

A follow-up:
- respects cadence cap;
- respects participant status;
- passes the dispatch gate when due;
- is not hard-coded to 3 days.

The exact follow-up delay is configuration, not a universal rule.

## 14.6 Follow-up state

After the follow-up observation:
- `RETURNED_TOWARD_BASELINE`;
- `PERSISTENT`;
- `CHANGED_AGAIN`;
- `UNKNOWN`.

No “efficacy” claim is generated.

## 14.7 Learn

The MVP captures:
- reviewer feedback;
- dismissal reason;
- action type;
- outcome;
- follow-up state;
- false-signal/null-cohort verification;
- signal version;
- detector configuration version.

No online learning occurs.

---

# 15. DATA MODEL

Every participant-related table includes:

`data_origin = synthetic | demo_entered`

Hard guard:
- real-looking identifiers are rejected.

## 15.1 Core entities

### `Unit`
- `unit_id`
- `name`
- `type`
- `status`
- `data_origin`

### `User`
- `user_id`
- `role`
- `unit_id`
- `display_name`
- `credentials_reference`
- `status`

### `ParticipantProfile`
- `participant_id`
- pseudonymous reference
- language
- status: active | paused | halted | withdrawn
- assisted-use availability
- `data_origin`

### `ConsentRecord`
- `consent_id`
- participant ID
- scope set
- version
- language
- captured by
- mode
- captured at
- revoked at
- guardian consent state where applicable
- `data_origin`

### `SafetyProfile`
- `safety_profile_id`
- participant ID
- restricted-contact flag
- permitted channels
- permitted time windows
- discreet-template requirement
- reminder permission
- `data_origin`

### `SafeContact`
- `safe_contact_id`
- participant ID
- name
- relationship
- per-contact consent
- permitted disclosure level
- contact channel
- active/inactive
- `data_origin`

### `Case`
- `case_id`
- synthetic reference
- type
- stage
- status
- created at
- `data_origin`

### `CaseParticipant`
- `case_participant_id`
- case ID
- participant ID
- role
- start/end dates
- `data_origin`

### `CaseEvent`
- fields defined in Section 11.

### `EventConfig`
- event type
- version
- pre-window
- post-window
- delta
- recovery constant
- grace period
- max contextual shift
- status

### `InstrumentDefinition`
- instrument ID
- version
- language
- items
- scales
- direction
- normalization

### `CheckInRequest`
- request ID
- participant ID
- trigger type
- due time
- state
- dispatch attempts
- last dispatch
- late threshold
- related event/intervention
- `data_origin`

### `CheckInResponse`
- response ID
- request ID
- participant ID
- submitted at
- item-level responses
- normalized score
- safety-item response
- mode
- late
- data-quality status
- `data_origin`

### `TrajectorySnapshot`
- snapshot ID
- participant ID
- baseline μ
- robust spread σ_hat
- effective spread σ_eff
- eligible count
- descriptive slope
- last valid observation
- model/config version
- calculated at
- `data_origin`

### `AttentionSignal`
- signal ID
- participant ID
- trigger check-in ID
- class
- subtype
- observed score
- baseline
- expected value
- expected band
- residual
- confidence tier
- confidence factors
- episode ID
- context-event references
- model config version
- signal version
- supersedes signal ID
- created at
- `data_origin`

### `SignalContextEvent`
Many-to-many link:
- signal ID
- event ID
- role of event in context
- applied config version.

### `Episode`
- episode ID
- participant ID
- opened at
- closed at
- current class
- current subtype
- trigger signal ID
- status.

### `ReviewTask`
- task ID
- type
- source reference
- owner
- status
- created at
- due at
- escalation count
- escalation history
- closed at
- disposition.

Task types:
- `SIGNAL_REVIEW`
- `SILENCE_REVIEW`
- `CONCERN_RAISED`
- `SAFETY_EVENT_REVIEW`
- `CONTACT_RESTRICTED_DUE`

### `Intervention`
- intervention ID
- source episode/task
- worker ID
- action type
- rationale
- started at
- status
- consent scope used.

### `Handoff`
- handoff ID
- intervention ID
- receiving directory entry
- disclosure level
- consent checked
- status
- timestamps.

### `ServiceDirectoryEntry`
Synthetic receiver directory:
- entry ID
- display name
- service category
- active
- synthetic flag.

### `Outcome`
- outcome ID
- intervention ID
- structured outcome
- recorded by
- recorded at
- notes if necessary and length-limited.

### `ConcernReport`
- concern ID
- participant ID
- created at
- channel
- status
- linked task
- disposition.

### `ModelConfig`
- version
- effective date
- detector parameters
- event configuration version references
- instrument version reference.

### `AuditLog`
- sequence number
- actor ID
- action
- object reference
- timestamp
- `prev_hash`
- `hash`
- minimal metadata only
- no sensitive data snapshot.

### `SimulationTruth`

Stored separately from product data.

Contains:
- ground-truth trajectory state;
- injected-event state;
- expected simulation change;
- injected anomaly;
- expected detector label for software verification.

Product code and user-facing screens must not read this store.

---

# 16. SYNTHETIC DEMO DATASET

## 16.1 Dataset size

MVP:
- 50 synthetic participants;
- approximately 6 months historical data;
- weekly observations where appropriate.

## 16.2 Archetypes

Include:
- stable trajectory;
- chronically low trajectory;
- slow drift;
- noisy trajectory;
- sparse/new enrollee;
- high missingness;
- restricted-contact profile;
- paused participant;
- revoked participant;
- event-consistent change;
- atypical change;
- positive safety-item participant.

## 16.3 Dataset generation rule

The generator must use a **different model family from the detector**.

Example generator family:
- autoregressive noise;
- event-response curves;
- informative missingness;
- controlled recovery;
- separate anomaly injection.

Detector remains:
- EWMA;
- robust spread;
- event-conditioned expected shift;
- CUSUM;
- floor;
- persistence.

This separation avoids circular evaluation.

## 16.4 Ground truth

`SimulationTruth` stores labels hidden from normal application code.

Used only for:
- software verification;
- null-cohort testing;
- sensitivity testing on injected changes.

## 16.5 Synthetic identity rules

Use:
- fictional names;
- pseudonymous participant IDs;
- fictional case references;
- fictional event descriptions.

Do not use:
- real court numbers;
- real case identifiers;
- real participant names;
- real phone numbers;
- caste/religion or similar sensitive demographic attributes as model inputs;
- real institutional personnel.

Language may be stored for UI/translation testing.

## 16.6 Fixed reproducibility

Synthetic data must be generated with:
- fixed seeds;
- versioned generator parameters;
- stable scenario IDs.

A demo reset must reproduce the same scenario.

---

# 17. TECHNICAL ARCHITECTURE

## 17.1 Architecture style

**Modular monolith.**

Avoid microservices.

Rationale:
- smaller operational surface;
- easier student-team development;
- simpler audit transaction handling;
- faster demo iteration;
- enough separation through internal modules.

## 17.2 Frontend

**React responsive web application.**

Participant pages:
- mobile-first;
- low-bandwidth layout;
- plain responsive page;
- no PWA requirement.

Internal pages:
- desktop-first where appropriate;
- responsive enough for demonstration.

## 17.3 Backend

**Python FastAPI.**

Responsibilities:
- authentication;
- RBAC;
- API routing;
- validation;
- domain services;
- detector orchestration;
- scheduler;
- audit events.

## 17.4 Database

**PostgreSQL.**

Reasons:
- relational integrity;
- explicit case/event relationships;
- task ownership;
- audit sequence ordering;
- versioning.

## 17.5 Statistical engine

Implemented inside the modular backend or a clearly isolated internal module using standard numerical libraries.

No separate ML infrastructure required.

## 17.6 Simulation clock

A persisted simulation clock drives:
- due check-ins;
- reminders;
- misses;
- task timeouts;
- escalation;
- event windows;
- follow-ups.

Required operations:
- set scenario;
- reset;
- advance by one day;
- advance to next event;
- advance custom duration.

Scheduler jobs must be idempotent.

## 17.7 Channel adapter

The interface should conceptually support:
- `SimulatedInbox` — implemented in MVP;
- future `SMSAdapter`;
- future `WhatsAppAdapter`.

Only simulated in-app delivery exists in MVP.

## 17.8 Event adapter

Interface:
- `ManualEntry` — implemented in MVP.

Future:
- government or service-system adapters.

README/product copy must state:

> **No government integration exists or is implied in the MVP.**

## 17.9 Deployment

MVP deployment:
- local `docker-compose`.

Do not deploy synthetic demo data to a public free-tier service merely for convenience.

## 17.10 Time representation

Use:
- ISO 8601;
- explicit IST offset for MVP;
- stored timestamps in a consistent canonical representation;
- display timezone explicitly.

---

# 18. API REQUIREMENTS

The following APIs are required conceptually. Exact route naming is an implementation detail; the semantics are not.

## 18.1 Authentication

- sign in;
- sign out;
- current session;
- persona switch for demo only.

## 18.2 Participants

- create synthetic participant;
- read assigned participant;
- update participant status;
- read consent state;
- update scoped consent;
- read safety profile;
- update safety profile.

## 18.3 Cases

- list assigned cases;
- read case;
- read case participants;
- create case event;
- update event;
- verify event;
- supersede event.

## 18.4 Check-ins

- create check-in request;
- get due check-ins;
- get participant check-in;
- submit response;
- mark/decorate late response;
- evaluate safety item.

## 18.5 Detector

- run evaluation for response;
- retrieve latest trajectory snapshot;
- retrieve signal;
- retrieve episode;
- retrieve model configuration version.

Detector API must return:
- classification;
- evidence fields;
- uncertainty fields;
- configuration/model version.

## 18.6 Tasks

- list tasks;
- acknowledge;
- take ownership;
- dismiss;
- countersign;
- escalate;
- close;
- reassign.

## 18.7 Actions and handoffs

- create intervention;
- perform consent check;
- list synthetic receivers;
- create handoff;
- accept/decline simulated handoff;
- record outcome;
- create follow-up.

## 18.8 Non-response

- get silence task;
- get participant safety/contact state;
- record worker contact attempt;
- record outcome;
- escalate repeated misses.

## 18.9 Simulation

- load scenario;
- reset;
- inspect clock;
- advance clock;
- run null cohort;
- display verification summary.

## 18.10 Audit

- append event;
- list authorized audit metadata;
- verify hash chain;
- return first failed sequence if tampered.

## 18.11 Aggregate operations

- task counts;
- task age distribution;
- completion/missingness counts;
- follow-up state distribution;
- synthetic verification metrics.

Admin endpoints must never return participant-level rows by default.

---

# 19. SECURITY / PRIVACY / CONSENT

> This is a product architecture requirement, not a legal compliance assertion.

## 19.1 Consent

Consent is:
- explicit;
- scoped;
- versioned;
- language-aware;
- attributable to the actor/mode that captured it;
- revocable.

Consent screen language must include:
- participation is voluntary;
- participation does not affect the case or relief;
- responses are not read in real time;
- NIRANTAR is not an emergency service;
- participation can be stopped.

For minors/dependents:
- store guardian-consent state as required by the deployment design;
- assisted mode must be explicit.

## 19.2 Safety profile

Store:
- restricted-contact flag;
- permitted channels;
- permitted time windows;
- reminder permission;
- discreet template requirement;
- safe contacts.

## 19.3 Shared-device privacy

The MVP must:
- never display previous check-in answers;
- never persist participant answers offline;
- use neutral message text in simulated inbox;
- avoid explicit programme name in message previews where that would reveal participation;
- disable link previews in message simulation;
- include quick exit.

## 19.4 Data separation

Wellbeing data must be treated as separate from ordinary case-file data.

MVP rule:
- investigating/prosecuting roles have no access;
- no export to a case file;
- no “copy wellbeing summary into case record” button.

Any future pilot requires legal review of this data separation.

## 19.5 Free text

The MVP does not pretend free text is harmless.

Where free text is unavoidable:
- mark as potentially sensitive;
- length-limit;
- do not include in audit snapshots;
- avoid free-text participant check-ins.

## 19.6 Audit design

Audit rows contain only:
- who;
- what action;
- which object;
- when;
- hash-chain metadata.

Do not store complete sensitive snapshots in the audit chain.

Claim:
> **Tamper-evident under the stated threat model.**

Do not claim:
> immutable.

## 19.7 Break-glass

If implemented:
- reason required;
- second-person approval;
- limited time;
- logged;
- reviewable.

## 19.8 Retention and deletion

MVP must include a policy stub covering:
- normal application data retention;
- audit metadata retention;
- revocation;
- deletion/erasure handling;
- tension between erasure of sensitive records and audit integrity.

Audit records should contain minimal non-identifying metadata so that deletion of participant content does not require copying sensitive content into an audit archive.

## 19.9 Responsible-AI positioning

The product may state:

> “Designed with reference to responsible-AI and data-governance principles. This is not a compliance claim.”

The MVP must not claim formal certification or compliance.

---

# 20. FAILURE HANDLING

## 20.1 False positive

**Risk:** worker overload.

**Mitigation:**
- null-cohort alert budget;
- MMC;
- persistence;
- episode aggregation;
- queue tiering;
- confidence display.

## 20.2 False negative

**Risk:** meaningful deterioration may not trigger the detector.

**Mitigation:**
- participant Raise Concern;
- positive safety item;
- CUSUM drift;
- absolute floor;
- human review of silence;
- missed-check-in priority.

No design claims that false negatives are eliminated.

## 20.3 Small history

**Risk:** unstable baseline.

**Response:**
- confidence = insufficient/low;
- no automatic signal from insufficient evidence alone;
- human pathway activates only with explicit safety/missingness/event triggers.

## 20.4 Zero variance

**Risk:** infinite z-score.

**Response:**
- shrinkage;
- floor;
- MMC;
- no signal from a one-point movement alone.

## 20.5 Chronic low

**Risk:** low but stable participant never deviates from their baseline.

**Response:**
- absolute-floor backstop;
- repeated low-score rule.

## 20.6 Slow deterioration

**Risk:** baseline adapts downward.

**Response:**
- frozen baseline during episode;
- eligible-only baseline;
- CUSUM gradual drift backstop.

## 20.7 Bad event data

**Risk:** wrong context changes interpretation.

**Response:**
- event lifecycle;
- significance-3 double confirmation;
- provenance;
- confidence factor;
- versioned correction.

## 20.8 Postponed event

**Response:**
- preserve scheduled record;
- create updated version;
- move window;
- annotate timeline;
- preserve earlier signal versions.

## 20.9 Restricted contact

**Response:**
- dispatch gate fails;
- no automated participant message;
- contact-restricted task for Case Liaison if required.

## 20.10 Paused/revoked

**Response:**
- no dispatch;
- no silence task;
- worker status notification only.

## 20.11 Queue overload

**Response:**
- queue count displayed;
- Supervisor escalation;
- assignment/reassignment;
- task age monitoring.

## 20.12 Worker unavailable

**Response:**
- unowned timeout;
- Supervisor escalation;
- explicit escalation history.

The system must not leave an unowned task indefinitely.

## 20.13 Scheduler failure

**Response:**
- persisted request state;
- idempotent jobs;
- deterministic retry;
- visible simulation-control state;
- no duplicate reminders.

## 20.14 Data-quality failure

Examples:
- impossible timestamp;
- invalid score;
- missing required item;
- invalid event status/date combination.

Response:
- reject before evaluation;
- show validation reason;
- create quality flag if persisted.

## 20.15 Audit-chain failure

Response:
- verification status = failed;
- first failing sequence displayed;
- no “immutable” language;
- system records verification attempt.

---

# 21. PRODUCT METRICS

Metrics must prove the software workflow without implying clinical performance.

## 21.1 Operational metrics

- time to task ownership;
- unowned tasks past timeout;
- supervisor escalations;
- task closure time;
- reassignment count.

## 21.2 Participant workflow metrics

- check-in completion rate;
- missed check-ins;
- late responses;
- pause rate;
- revocation count;
- concern submissions.

These are product-operational measures, not clinical outcomes.

## 21.3 Safety metrics

- positive safety-item reviews;
- restricted-contact suppressions;
- silence tasks reviewed;
- repeated-miss escalations;
- safety-event reviews.

## 21.4 Follow-up metrics

- `RETURNED_TOWARD_BASELINE`;
- `PERSISTENT`;
- `CHANGED_AGAIN`;
- `UNKNOWN`.

## 21.5 Detector software-verification metrics

- false signals per 100 participant-weeks on the null cohort;
- sensitivity on injected changes;
- detection consistency across synthetic archetypes;
- number of detector version changes;
- proportion of signals with reproducible configuration/version references.

Label:
> **Software verification only. Not clinical validation.**

## 21.6 Alert-budget target

Placeholder:
- ≤ 1 false signal per 100 participant-weeks on the null cohort.

This threshold is a design parameter for MVP tuning, not an empirically validated deployment standard.

---

# 22. MVP SCOPE

## 22.1 MUST WORK

1. Synthetic cohort.
2. Explicit Case + CaseParticipant model.
3. Consent and participant safety profile.
4. Versioned placeholder instrument.
5. Weekly cadence and controlled extra check-ins.
6. Participant check-in.
7. Safety item.
8. Personal trajectory.
9. Event-conditioned change detector.
10. Confidence tier and factors.
11. CUSUM and absolute-floor backstops.
12. Attention episodes.
13. Human review queue.
14. Task ownership and timeout.
15. Non-response state machine.
16. Participant Raise Concern.
17. Threat/safety-event branch.
18. Action logging.
19. Simulated handoff recipient.
20. Outcome and follow-up.
21. Tamper-evident audit chain and verification.
22. Simulation clock.
23. Scenario loader and reset.
24. Null-cohort verification.
25. `SYNTHETIC DATA` banner.

## 22.2 SHOULD WORK

- Supervisor escalation screen.
- Aggregate operations view with minimum cell-size protection.
- English + one additional UI language placeholder.
- Synthetic receiver acceptance/decline.

## 22.3 DEFER

- real SMS;
- WhatsApp;
- OTP through real messaging;
- government integration;
- cloud deployment;
- offline PWA storage;
- advanced analytics;
- real clinical instrument;
- real service directory;
- real referral integration.

## 22.4 DO NOT BUILD

- clinical diagnosis;
- population-wide distress prediction;
- autonomous treatment selection;
- autonomous legal action;
- autonomous police deployment;
- fake government APIs;
- fake real-victim data;
- voice-emotion analysis presented as validated;
- generic chatbot;
- risk score;
- red/amber/green risk display;
- automated contacting of family without explicit consent and a defined safety protocol;
- online learning that silently changes thresholds.

---

# 23. DEMO FLOW

The demo must demonstrate the product’s central innovation, not just navigation.

## 23.1 Demo setup

Load synthetic scenario:
- P-01;
- P-02;
- P-03;
- P-04.

Open the simulation control panel.

Ensure:
- clock;
- scenario label;
- `SYNTHETIC DATA` banner;
- current model/config version are visible.

## 23.2 Demonstration 1 — Same change, different context

Create two participants with the same baseline.

Both drop by the same numerical amount.

### P-01
A hearing occurs two days earlier.

Expected result:
- `EVENT_CONSISTENT_CHANGE`;
- no task from that class alone.

### P-02
No relevant event.

Expected result:
- `ATYPICAL_CHANGE`;
- review task created.

The demonstration line is:

> **Same numerical change. Different case context. Different interpretation.**

This is the clearest proof of NIRANTAR’s core technical idea.

## 23.3 Demonstration 2 — Context does not explain away persistent change

Advance the simulation clock.

P-01 does not recover toward baseline by the end of the context window plus grace.

Expected result:
- event-consistent classification converts to `ATYPICAL_CHANGE`;
- review task is created.

This demonstrates that context can contextualize a change but cannot hide persistent deterioration.

## 23.4 Demonstration 3 — Human action loop

Open P-02.

Show:
- trajectory;
- expected band;
- event context;
- signal evidence;
- confidence factors.

Then:
- take ownership;
- review;
- choose action;
- perform synthetic handoff;
- simulated receiver accepts;
- record outcome;
- schedule follow-up.

Advance clock.

Show:
- follow-up state.

## 23.5 Demonstration 4 — Silence safety

P-03 has restricted contact.

Miss a check-in.

Expected:
- no additional participant-facing message after the dispatch gate fails or after the miss;
- `SILENCE_REVIEW` task appears;
- recent context is visible;
- no automatic family contact.

Advance clock with no worker ownership.

Expected:
- task escalates to Supervisor.

## 23.6 Demonstration 5 — Pause

P-04 pauses.

Advance clock beyond a due time.

Expected:
- no dispatch;
- no silence task.

## 23.7 Demonstration 6 — Raise concern

P-04 raises a concern.

Expected:
- `CONCERN_RAISED`;
- top-of-queue task.

## 23.8 Demonstration 7 — Safety item

Submit a positive safety item for a stable participant.

Expected:
- `IMMEDIATE_ATTENTION`;
- immediate human attention task.

It must not wait for baseline history.

## 23.9 Demonstration 8 — Threat event

Enter a Threat/Safety event.

Expected:
- no event-conditioned expected downward shift;
- `SAFETY_EVENT_REVIEW`;
- Supervisor task.

## 23.10 Demonstration 9 — Governance

Open Admin.

Expected:
- aggregate only;
- cannot open participant-level detail.

Open Audit Verification.

Tamper with an audit row in the demo environment.

Expected:
- verification fails.

## 23.11 Demonstration 10 — Null cohort

Run the null cohort.

Display:

> **Software verification only — not clinical validation**

Show:
- false signals per 100 participant-weeks;
- threshold target;
- sensitivity on injected changes.

---

# 24. FUTURE ROADMAP

Roadmap order is deliberately governance-first.

## Phase 0 — MVP

- synthetic cases;
- synthetic longitudinal data;
- manual events;
- statistical detector;
- review workflow;
- safety;
- simulation;
- audit.

## Phase 1 — Pre-pilot governance

Before using real participant data:
- ethics approval;
- data-protection impact assessment;
- clinical governance owner;
- legal review of case/wellbeing data separation;
- instrument selection;
- validated translation selection;
- participant safety protocol.

## Phase 2 — Controlled pilot

- authorised social-worker/counsellor involvement;
- real participant consent;
- validated instrument;
- explicit safety procedures;
- limited deployment setting.

## Phase 3 — Validation dataset

Create an authorised longitudinal dataset.

Evaluate:
- calibration;
- subgroup robustness;
- missingness;
- language;
- event-response patterns;
- reviewer agreement;
- operational workload.

## Phase 4 — Authorized integrations

Potential adapter boundaries:
- relevant justice systems;
- relevant service systems.

Only after:
- technical authorization;
- data-sharing agreement;
- security review;
- interface availability.

## Phase 5 — Advanced modelling

Only after sufficient data and governance:
- hierarchical models;
- state-space models;
- more robust event-response estimation;
- calibrated uncertainty.

These are research directions, not MVP features.

## Phase 6 — Validated predictive systems

Only after:
- validated labels;
- clinical oversight;
- external evaluation;
- subgroup performance checks;
- prospective validation.

Never move from prototype synthetic performance directly to clinical claims.

---

# 25. EXPLICIT ASSUMPTIONS

The MVP assumes:

1. An authorised human operator exists.
2. Participants join voluntarily.
3. The MVP uses structured wellbeing observations rather than diagnostic AI.
4. Case events are manually entered.
5. Event data can be wrong, delayed, postponed, or corrected.
6. Human support capacity exists in the simulation.
7. The synthetic receiver directory represents a handoff only.
8. A safety/clinical owner would define real-world protocols before deployment.
9. The placeholder instrument is not clinically validated.
10. Detector thresholds are synthetic configurable parameters.
11. Confidence tiers are not probabilities.
12. Simulation clock timing does not represent real institutional SLAs.
13. Real helpline/contact details are not treated as verified until checked before build/deployment.
14. Any future government integration requires explicit authorization.
15. Any real pilot requires legal, privacy, safety, and governance review.
16. The participant may share a device with another person; therefore discreet UX is a safety requirement.
17. A missed check-in is ambiguous.
18. Case events influence interpretation but do not prove causation.
19. Synthetic ground truth remains separated from the detector.
20. Audit-chain verification demonstrates tamper detection under the stated threat model, not absolute immutability.

---

# 26. EXPLICITLY SIMULATED COMPONENTS

The MVP must clearly label these as simulated:

- participant identities;
- participant profiles;
- case identities;
- case-event timelines;
- wellbeing observations;
- instrument responses;
- expected event-response curves;
- detector outputs;
- uncertainty/confidence;
- review assignments;
- human ownership;
- task escalation;
- service directory entries;
- handoff acceptance/decline;
- action outcomes;
- follow-up observations;
- capacity constraints;
- simulation time;
- participant device inbox;
- emergency/helpline contact content when shown before build-time verification;
- null-cohort verification;
- `SimulationTruth`.

The UI may simulate the **appearance of a real operational workflow**, but it must never present the synthetic objects as real cases or real participants.

---

# 27. EXPLICITLY EXCLUDED COMPONENTS

The following are outside the NIRANTAR MVP and must not be added under the guise of “completeness”.

## Clinical / diagnostic exclusions

- psychiatric diagnosis;
- clinical risk probability;
- validated distress prediction claim;
- autonomous treatment recommendation;
- voice-emotion diagnosis;
- biomarker claims;
- clinical efficacy claims.

## Government / integration exclusions

- fake ICJS integration;
- fake eCourts API;
- fake NHAA API;
- fake Tele-MANAS referral API;
- simulated government authentication presented as live integration;
- automated government legal action.

## Channel exclusions

- real SMS;
- real WhatsApp;
- real OTP infrastructure;
- persistent offline participant storage;
- local device storage of prior answers.

## Data exclusions

- real victim data;
- real case numbers;
- real personal contact details;
- sensitive demographic fields that are unnecessary to demonstrate the core mechanism;
- copying wellbeing data into case records.

## Product-shape exclusions

- generic chatbot;
- standalone referral directory;
- generic case-management dashboard;
- red/amber/green risk dashboard;
- composite risk score;
- “AI copilot” replacing human review.

---

# BUILD RULES

These rules are **non-negotiable** for every future AI coding, design, UX, data, demo, content, architecture, or presentation agent.

## Rule 1 — Do not change the product

The product remains:

> **NIRANTAR — Case-Aware Wellbeing Continuity Engine**

Do not replace it with another idea.

## Rule 2 — Protect the North Star loop

Every major feature must support:

> **CASE EVENT → CHECK-IN → PERSONAL TRAJECTORY → CONTEXTUAL CHANGE → HUMAN REVIEW → ACTION → FOLLOW-UP**

Features that do not strengthen this loop require explicit justification.

## Rule 3 — Protect the core innovation

The differentiator is:

> **personal longitudinal change interpreted in case context with explicit uncertainty and human action**

Do not reduce NIRANTAR to:
- a dashboard;
- a case-management tool;
- a chatbot;
- a referral directory;
- a generic prediction interface.

## Rule 4 — Never use context to hide risk

An event window may change the expected value.

It must never:
- widen a safety threshold;
- suppress a threat;
- suppress a positive safety item;
- suppress a sustained-low backstop;
- suppress gradual drift.

## Rule 5 — Never treat causal inference as established

Use:
- “event-consistent”;
- “atypical change”;
- “within expected range”.

Do not use:
- “the event caused the distress”;
- “the case event explains the decline”;
- “the person became depressed because of the hearing”.

## Rule 6 — Never use a risk score

No composite risk score.

No red/amber/green.

Use:
- attention class;
- subtype;
- evidence;
- confidence tier;
- confidence factors;
- task state.

## Rule 7 — Never hide uncertainty

Every meaningful signal must retain:
- number of eligible observations;
- variance/shrinkage information;
- recency of valid observation;
- event-data quality.

## Rule 8 — Silence is not safety

Never write UI or logic implying:
- “no response = fine”;
- “no signal = safe”.

Use missed/insufficient-evidence language.

## Rule 9 — Dispatch is always safety-gated

No participant-facing message may bypass:
- consent;
- status;
- permitted channel;
- permitted time;
- discreet template.

After a miss:
- no automated messaging beyond the configured single reminder;
- human review owns next contact.

## Rule 10 — Pause and revoke must be real state transitions

Pause/revoke must:
- stop dispatch;
- stop silence tasks;
- respect the participant’s latest state immediately.

## Rule 11 — Threat events are special

Threat/safety events:
- create safety review;
- create no expected shift;
- never lower detector sensitivity.

## Rule 12 — Safety item bypasses baseline logic

A positive safety item creates `IMMEDIATE_ATTENTION` regardless of:
- baseline;
- context;
- score;
- history.

## Rule 13 — Do not fake external integrations

Government and service-system integrations are adapter boundaries only.

The MVP may say:
> “Manual event entry.”

It may not imply:
> “Connected to live government systems.”

## Rule 14 — Synthetic means synthetic

All MVP data must be fictional.

Every participant-related table must have:
- `data_origin`.

Every screen must show:
> `SYNTHETIC DATA`

Never introduce real-looking identifiers.

## Rule 15 — Keep SimulationTruth separate

Ground truth must not be used by the live detector.

The detector must earn its displayed classification from its actual logic.

## Rule 16 — Do not hard-code demo outputs

Demo signals must emerge from the live pipeline.

Do not code:
> “When P-02 is opened, show ATYPICAL_CHANGE.”

Instead, the synthetic scenario must contain data that causes the detector to produce the result.

## Rule 17 — Keep detector complexity proportional to the MVP

Use:
- EWMA;
- robust spread;
- shrinkage;
- expected event shift;
- residual;
- persistence;
- CUSUM;
- floor.

Do not add:
- deep learning;
- opaque embeddings;
- LLM-generated risk;
- unnecessary ML infrastructure.

## Rule 18 — Baseline must not self-contaminate

During an open episode:
- freeze the baseline used for that episode.

Do not let a sustained decline redefine the baseline until the episode lifecycle permits it.

## Rule 19 — Small-N must be safe

Never allow:
- σ = 0 to create infinite alerts;
- one new enrollee observation to generate a false “high confidence” classification.

Use:
- shrinkage;
- floor;
- MMC;
- confidence tiers.

## Rule 20 — Every task must have an owner or escalation path

A task cannot remain indefinitely unowned.

Required:
- owner;
- due time;
- timeout;
- escalation history.

## Rule 21 — Do not overload “Accept”

Use separate concepts:
- acknowledge;
- take ownership;
- handoff accepted;
- action completed.

## Rule 22 — Every intervention closes with an outcome

An action is not complete when the worker clicks “send”.

The flow is:

> action → handoff/status → outcome → follow-up → follow-up state

## Rule 23 — No “efficacy” claims

Use:
- returned toward baseline;
- persistent;
- changed again;
- unknown.

## Rule 24 — Keep audit claims honest

Use:
> **tamper-evident (hash-chained)**

Do not use:
> immutable.

The audit log must not contain full sensitive snapshots.

## Rule 25 — Admin is aggregate-first

Programme Admin:
- sees aggregate;
- verifies audit;
- does not browse participant-level wellbeing by default.

## Rule 26 — Continuity view is the hero

The first meaningful worker screen must make visible:
- trajectory;
- event context;
- expected band;
- gaps;
- signals;
- actions;
- follow-ups.

The queue is supporting infrastructure.

## Rule 27 — Every screen must answer “what next?”

A screen without an actionable next state is likely decorative.

Design every workflow around:
- current state;
- evidence;
- owner;
- next action;
- follow-up.

## Rule 28 — Use context-typed pathways

Recommendations may be based on:
- nearest event type;
- task type;
- participant constraints;
- worker judgement.

They must not claim verified cause.

## Rule 29 — Human review remains accountable

The system can:
- calculate;
- classify;
- surface evidence;
- route a task.

The system cannot:
- diagnose;
- autonomously treat;
- autonomously issue legal orders;
- autonomously contact unsafe people.

## Rule 30 — Keep safety visible without sensationalizing it

Participant screens must:
- explain limits;
- show help;
- provide quick exit;
- remain neutral and discreet.

Worker screens must:
- clearly distinguish routine attention from safety review;
- avoid panic-inducing wording;
- preserve uncertainty.

## Rule 31 — Do not add features merely because they are technically possible

Before adding a feature, ask:

> **Does this make the NIRANTAR continuity loop more demonstrable, safer, or more implementable?**

If not, defer it.

## Rule 32 — MVP infrastructure stays simple

Preferred:
- React;
- FastAPI;
- PostgreSQL;
- numerical/statistical library;
- local Docker Compose;
- modular monolith.

Avoid:
- unnecessary microservices;
- public-cloud dependency for demo;
- message-provider dependency;
- offline-first complexity.

## Rule 33 — Simulation time is part of the product demo

All timer-dependent behaviours must be testable using the simulation clock.

No demo may depend on waiting 24 or 48 real hours.

## Rule 34 — Deterministic reset must exist

Every demo scenario must be reproducible.

Required:
- fixed seed;
- scenario loader;
- reset;
- clock control.

## Rule 35 — Recomputations must be versioned

If event data changes:
- do not silently rewrite history;
- create a new version;
- preserve signal lineage.

## Rule 36 — Terminology is fixed

Use:
- `WITHIN_EXPECTED_RANGE`
- `EVENT_CONSISTENT_CHANGE`
- `ATYPICAL_CHANGE`
- `INSUFFICIENT_EVIDENCE`
- `IMMEDIATE_ATTENTION`
- `MISSED_CHECK-IN — REVIEW NEEDED`
- `FOLLOW-UP STATE`
- `CONTEXT-TYPED PATHWAY`
- `TAMPER-EVIDENT`

Avoid:
- monitored;
- unexplained silence;
- efficacy;
- cause-typed;
- risk score;
- severity as a user-facing risk label;
- immutable.

## Rule 37 — Every important claim must fit the evidence

The MVP proves:
- software mechanics;
- statistical workflow;
- contextual interpretation;
- task routing;
- safety-state handling;
- audit verification.

The MVP does not prove:
- clinical effectiveness;
- clinical safety in real populations;
- national-scale performance;
- legal validity;
- institutional readiness.

## Rule 38 — Future AI agents must preserve the architecture

Any future coding/design/content agent must read this blueprint before modifying:
- data model;
- detector;
- task logic;
- participant safety flow;
- screen hierarchy;
- terminology;
- demo scenarios.

## Rule 39 — No silent product decisions

When a future agent encounters an unspecified implementation detail:
1. choose the smallest option consistent with this blueprint;
2. preserve the North Star;
3. preserve safety;
4. preserve synthetic/demo boundaries;
5. record the assumption.

Do not silently broaden product scope.

## Rule 40 — The final test

Before accepting any feature, ask:

> **Does this make NIRANTAR better at understanding how a person is changing as their case changes, showing uncertainty, assigning accountable human attention, enabling safe action, and showing what happened afterward?**

If the answer is no, it is not core NIRANTAR functionality.
