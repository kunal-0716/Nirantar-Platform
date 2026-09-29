# NIRANTAR — UX/UI BLUEPRINT

**Product:** NIRANTAR — Case-Aware Wellbeing Continuity Engine
**Reference:** `NIRANTAR_FINAL_PRODUCT_BLUEPRINT.md`
**Design Objective:** A serious, human-in-the-loop, institutional wellbeing continuity interface. 

---

## A. UX PRINCIPLES

The interface of NIRANTAR must communicate institutional competence, safety, and accountability. It is a decision-support environment, not a clinical diagnostic tool or a generic SaaS startup.

**Core Principles:**
1. **Context over Isolation:** Wellbeing data is never shown without its surrounding case timeline.
2. **Explicit Uncertainty:** The system must visually separate "what is known" (observations, events) from "what is inferred" (expected shifts, confidence).
3. **Silence is not Safety:** Missing data (non-response) is rendered as a prominent feature, not just a blank space.
4. **Accountability:** Every alert, signal, and task must clearly show who owns it and what the next action is.
5. **Institutional Restraint:** UI density must match professional operational tools.

**Strictly Avoid:**
- "Red/Amber/Green" risk indicators (use contextual labeling instead).
- Composite "Risk Scores" or percentages.
- Glowing, futuristic, or "magic AI" decorative elements.
- Generic dashboard widgets (e.g., meaningless pie charts of total users).
- "Empty state" illustrations that look playful or consumer-focused.

---

## B. INFORMATION ARCHITECTURE

The IA is partitioned strictly between the Participant (mobile-first, minimal) and Internal Roles (desktop-first, high-density).

**1. Global Architecture (Internal Roles):**
*   **Global Header:** Persona Switcher (Demo Only), `SYNTHETIC DATA` persistent banner, Global Search (Pseudonyms/Cases), Notifications, User Profile.
*   **Primary Navigation (Left Sidebar):**
    *   Queue (Task Management)
    *   Caseload (Participant Directory)
    *   Events (Case Logistics)
    *   Escalations (Supervisor only)
    *   Operations (Admin/Supervisor only)
    *   Simulation & Audit (Demo/Admin only)

**2. Global Architecture (Participant):**
*   **Global Header:** Minimal brand, `SYNTHETIC DATA` banner, "Raise Concern" omnipresent button, Quick Exit.
*   **Primary Navigation (Bottom Bar or Hamburger):**
    *   Home (Check-ins)
    *   Settings (Consent, Pause, Revoke, Language)

---

## C. ROLE-BASED NAVIGATION

*   **Participant:** Sees only their own check-in tasks, consent toggles, and safety settings. No historical data, no baseline trends, no program metrics.
*   **Case Liaison:** Focuses on *Events* and *Silence Reviews*. Navigation prioritizes the Event Entry timeline and logistical participant contact.
*   **Counsellor/Clinician (Simulated):** Lands on the *Queue*. Primary workflow routes directly into the *Participant Continuity View* and *Action/Handoff* pathways.
*   **Supervisor:** Navigates via *Escalations*. Can access all assigned queues, unowned tasks, and operational overloads.
*   **Programme Admin:** Bypasses individual participant views. Lands on *Aggregate Operations* and *Audit Verification*.

---

## D. COMPLETE SCREEN INVENTORY

| ID | Screen Name | Role | Entry Point | Primary Action | Secondary Actions |
|---|---|---|---|---|---|
| **S01** | Demo Persona Switcher | Demo Operator | App Launch | Select Role | Reset Simulation |
| **S02** | Review Queue | Worker / Sup. | Default Nav | Open Task (Continuity) | Filter, Sort |
| **S03** | Participant Continuity View | Worker / Sup. | S02 (Queue) | Review Signal | View Timeline, Edit Events |
| **S04** | Signal Review Panel | Worker / Sup. | S03 (Continuity) | Take Ownership | Dismiss, Act, Escalate |
| **S05** | Event Entry/Edit | Liaison / Sup. | S03 / Nav | Save Event | Verify (Sig-3), Supersede |
| **S06** | Action & Handoff | Clinician / Sup. | S04 (Review) | Execute Handoff | Check Consent, Record |
| **S07** | Outcome & Follow-up | Worker | S06 / Nav | Record Outcome | Schedule Follow-up |
| **S08** | Silence Review | Liaison / Sup. | S02 (Queue) | Log Contact Attempt | Escalate |
| **S09** | Enrollment & Consent | Participant | Invite Link | Set Scopes & Save | Read Help |
| **S10** | Participant Check-in | Participant | SMS/Inbox link | Submit Responses | Raise Concern, Quick Exit |
| **S11** | Raise Concern / Help | Participant | Global Nav | Submit Concern | Call Emergency |
| **S12** | Participant Settings | Participant | Nav Menu | Pause/Revoke | Change Language |
| **S13** | Supervisor Escalations | Supervisor | Nav Menu | Reassign Task | Countersign |
| **S14** | Aggregate Operations | Admin / Sup. | Nav Menu | View Metrics | Export Audit |
| **S15** | Audit Verification | Admin | Nav Menu | Run Verification | View Chain |
| **S16** | Simulation Control | Demo Operator | Utility Bar | Advance Clock | Inject Anomaly |
| **S17** | Synthetic Receiver | Receiver | Hand-off Link | Accept/Decline | N/A |

---

## E. SCREEN-BY-SCREEN UI SPECIFICATION

### S02: Review Queue
*   **Layout:** Standard enterprise list view.
*   **Header:** Quick filters (My Tasks, Unowned, Escalated).
*   **Data Table:** Columns for Task Type (e.g., Atypical Change, Silence Review, Safety), Attention Tier (Text label, no colors), Age (e.g., "4h"), Pseudonym, Owner, Due Time.
*   **Visuals:** Use typographic weight (boldness) to denote priority, not red alarms.

### S03: Participant Continuity View (HERO SCREEN)
*   **Layout:** Two-column split. Left/Top (70%): The Timeline & Trajectory visualization. Right (30%): Contextual Data & Action Panel.
*   **Header:** Participant Pseudonym, Current Status Badge (Active/Restricted).
*   **Main Area:** The **Wellbeing Trajectory** (See Section G). Below it, the **Case Timeline** (See Section J). Both share the same X-axis (Time).
*   **Right Panel:** Dynamic context. If viewing a task, shows S04 (Signal Review). If default, shows consent status, missingness rate, and recent follow-ups.

### S04: Signal Review Panel (Inside S03)
*   **Hierarchy:** 
    1. Task Owner Status (Unassigned -> "Take Ownership" primary button).
    2. The Signal: e.g., "ATYPICAL CHANGE".
    3. The Context: "Observation is 12 points below expected band. Overlaps with Hearing event."
    4. Confidence Tier: "LOW (Fewer than 4 eligible observations)".
    5. Action Group: Dropdown for 'Dismiss', 'Act', 'Escalate'.

### S08: Silence Review
*   **Layout:** Focuses on contact safety. 
*   **Top Card:** Warning: "SILENCE DOES NOT EQUAL SAFETY."
*   **Data Display:** Shows consecutive misses, safety profile restrictions (e.g., "Discreet contact only").
*   **Form:** Dropdown to log action ("Contacted via safe channel", "Unable to reach", "Escalate").

### S10: Participant Check-in
*   **Layout:** Mobile-optimized, single-column.
*   **Header:** Simple progress indicator (1/5). "Raise Concern" button fixed at top right.
*   **Content:** One question per screen or a short scrolling list. Large, high-contrast touch targets for 0-5 scale.
*   **Safety Item:** Presented clearly separate from the 0-5 scale ("YES/NO/PREFER NOT TO SAY").
*   **Footer:** Clear "Submit" button.

---

## F. CORE WORKFLOW UX

The UI makes the `NIRANTAR_FINAL_PRODUCT_BLUEPRINT.md` core loop visible primarily through **S03 (Continuity View)**.

1. **CASE EVENT:** Appears as a distinct marker on the X-axis of the timeline.
2. **CHECK-IN:** A new observation dot appears on the chart.
3. **PERSONAL TRAJECTORY:** The EWMA baseline line recalculates and extends.
4. **CONTEXTUAL CHANGE:** The UI visually "dips" the expected band (shaded area) around the event marker.
5. **UNCERTAINTY:** The confidence tier is explicitly spelled out in the side panel with bulleted factors.
6. **HUMAN REVIEW:** The dot turns into a hollow focal point, and an action panel slides out requiring an owner.
7. **ACTION & FOLLOW-UP:** Once acted upon, a vertical line (annotation) drops onto the timeline noting "Support Provided", setting the stage for the next dot.

---

## G. WELLBEING TRAJECTORY UX (No RAG colors)

This is the most critical visualization in the product. It must look statistical, not medical.

*   **X-Axis:** Time (Weeks/Days).
*   **Y-Axis:** Score (0-100). Hidden gridlines to avoid false precision.
*   **Observations (The Dots):** Solid slate-grey dots.
*   **EWMA Baseline:** A solid, thin, dark navy line tracking through the dots.
*   **Expected Band:** A light grey, semi-transparent shaded ribbon around the baseline. 
    *   *Crucial Interaction:* When an Event occurs, this shaded band physically dips (expected contextual shift) and then recovers.
*   **Meaningful Deviations:** If a dot falls significantly below the shaded band, it is circled with a dark purple stroke (indicating Atypical Change). 
*   **Missing Data:** Indicated by a dashed line gap on the X-axis and a small "x" on the baseline.

---

## H. HUMAN REVIEW UX

When an `ATYPICAL_CHANGE` is generated, the worker sees a structured panel (S04) that forbids automatic assumptions.

*   **WHAT CHANGED:** "Score dropped by 18 points from personal baseline."
*   **WHAT CASE CONTEXT:** "Occurred inside the 7-day post-window of [Hearing (Sig 2)]."
*   **CONFIDENCE:** Displayed as text: `MODERATE CONFIDENCE`. 
    *   *Supporting factors:* (Checkmark) 14 eligible observations. (Warning) Variance shrinkage applied.
*   **ACTION PATHWAYS:** Suggests "Context-Typed" pathways based on the event (e.g., "Legal Accompaniment Support").
*   **COUNTERSIGN:** If dismissing, the UI surfaces a mandatory text area for rationale and requires a Supervisor PIN/Auth.

---

## I. CHECK-IN UX

*   **Discreet Mode:** The initial simulated SMS/Inbox notification must say something neutral like, "Your scheduled update is ready." It must *never* say "Mental Health Check-in".
*   **Interrupted Check-ins:** If the user closes the app, no data is cached locally (strict privacy rule). They must restart.
*   **Completion:** A plain success screen: "Thank you. Your response has been recorded." No scores or charts are shown to the participant.

---

## J. CASE TIMELINE UX

The Timeline sits directly beneath the Trajectory chart, sharing the same horizontal time axis.

*   **Track 1: Events:** Represented by geometric shapes (Square = Routine, Triangle = Moderate, Diamond = High Significance). Hovering reveals the Event Window (pre/post grace period).
*   **Track 2: Missingness:** Redacted/hashed blocks indicating periods of non-response or paused consent.
*   **Track 3: Human Interventions:** Vertical flags indicating when a worker took action.

---

## K. NON-RESPONSE UX

*   **Visualizing Silence:** On the Continuity view, missing check-ins are not ignored. They appear as grey dashed gaps on the timeline.
*   **The Silence Task:** In the queue, `SILENCE_REVIEW` is treated with the same UI weight as a wellbeing drop. 
*   **Safety Lock:** The UI disables automated "Send Reminder" buttons if the dispatch gate rules fail, displaying a lock icon and "Contact Suppressed: Safety Profile Restrictions."

---

## L. DESIGN SYSTEM

*   **Typography:** Inter or Roboto. Clean, legible, high x-height.
*   **Color Palette:**
    *   *Primary/Brand:* Slate Blue (`#475569`), Navy (`#1E293B`).
    *   *Backgrounds:* Off-white (`#F8FAFC`), crisp white for cards.
    *   *Status (Never RAG):* 
        *   `WITHIN_EXPECTED_RANGE`: Neutral Grey
        *   `EVENT_CONSISTENT_CHANGE`: Muted Blue
        *   `ATYPICAL_CHANGE`: Deep Purple
        *   `IMMEDIATE_ATTENTION`: High-contrast Charcoal/Black.
*   **Components:**
    *   *Cards:* Zero drop-shadow. 1px solid border (`#E2E8F0`). Sharp corners (2px or 4px radius max).
    *   *Buttons:* Flat, high contrast. "Take Ownership" is the only filled primary button on a review screen.
    *   *Alerts:* Solid borders, left-aligned icons, no tinted backgrounds.
*   **Banners:** The `SYNTHETIC DATA` banner must be a fixed, high-contrast bar (e.g., yellow background, black text) at the absolute top of every internal viewport.

---

## M. RESPONSIVE DESIGN

*   **Participant Views (Mobile-First):** Must work perfectly on 320px width screens. Single-column, large tap areas (min 48x48px). No horizontal scrolling.
*   **Worker Views (Desktop-First):** Optimized for 1280px+ viewports. Complex charts and data tables require horizontal real estate. 
*   **Tablet:** Worker views adapt by collapsing the side navigation into a hamburger and stacking the right-hand action panel below the Trajectory chart.

---

## N. ACCESSIBILITY

*   **Contrast:** Minimum 4.5:1 for all text. The trajectory chart must rely on shapes/strokes (solid vs dashed, circles vs squares), not just color, to convey meaning.
*   **Keyboard:** Full tab-navigation for the worker queue and participant check-in forms. Visible focus rings are mandatory.
*   **Screen Readers:** The Trajectory chart must have an `aria-label` summarizing the current status (e.g., "Trajectory chart showing 12 observations. Latest observation is 15 points below expected baseline, marked as Atypical Change").
*   **Language Simplicity:** Grade 6 reading level for participant-facing text.

---

## O. SIH DEMO EXPERIENCE (The "Hero" Sequence)

The UI must support the blueprint's 10-step demo flawlessly. The "Hero Screen" for judges is **S03: Participant Continuity View**.

1. **Baseline & Context (Demo 1):** Show P-01 and P-02. Judges see the exact same dip in the chart. But P-01's shaded "expected band" dips to catch the dot (Event-Consistent, Blue label). P-02's band remains flat, leaving the dot exposed (Atypical Change, Purple label). *This visualizes the core innovation instantly.*
2. **Action Loop (Demo 3):** On P-02, the operator clicks "Take Ownership" -> Selects "Facilitated Connection" -> Records Outcome. A vertical intervention flag immediately drops onto the timeline.
3. **Silence (Demo 4):** Open P-03. Show the dashed gaps. Show the `SILENCE_REVIEW` task. Point out the "Contact Restricted" lock icon to prove safety over automation.
4. **Governance (Demo 9/10):** Navigate to the Admin view. Show the "Verification Failed" UI state after a simulated database tamper, proving tamper-evidence.

---

## P. NATURALNESS / DESIGN AUDIT

Before finalizing the build, apply this strict audit against common AI-generated UI tropes:

*   [x] **No generic Dashboard home:** Does the worker land on a useless page of pie charts? *Fix: Route them to the Task Queue (S02) immediately.*
*   [x] **No AI 'Sparkles':** Are there any magic wand icons, glowing buttons, or "AI generated" text? *Fix: Remove them. The system uses statistical rules, not GenAI.*
*   [x] **No Red/Green Risk:** Is "Atypical Change" red? *Fix: Change it to Purple or Navy. Red implies immediate danger/diagnosis, violating the blueprint.*
*   [x] **Visible Constraints:** Is the Confidence Tier visible on every review? *Fix: Ensure it is prominent in the S04 review panel.*
*   [x] **No 'Orphaned' Data:** Is the wellbeing score shown without the case event timeline? *Fix: Enforce the combined Continuity View (S03).*

*This UX/UI blueprint adheres strictly to the constraints and data model defined in `NIRANTAR_FINAL_PRODUCT_BLUEPRINT.md`.*