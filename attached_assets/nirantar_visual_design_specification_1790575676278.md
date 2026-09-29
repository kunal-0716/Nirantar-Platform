# NIRANTAR — VISUAL DESIGN SPECIFICATION

**Product:** NIRANTAR — Case-Aware Wellbeing Continuity Engine
**Target Audience:** Institutional support workers, supervisors, case liaisons, and participants.
**Design Philosophy:** Institutional competence, strict accountability, contextual clarity, and absolute restraint. 

This document defines the comprehensive visual system for the NIRANTAR MVP. It strictly prohibits generic SaaS UI, "AI-themed" decoration, and composite risk scoring.

---

## A. BRAND / VISUAL DIRECTION

NIRANTAR is an institutional decision-support system, not a consumer app or a flashy startup product. The visual direction must convey safety, data integrity, and professional accountability.

*   **Personality:** Objective, restrained, analytical, and supportive.
*   **Tone:** Factual and unambiguous. "Silence is not safety."
*   **Visual Metaphor:** A secure case file combined with a rigorous statistical ledger. 
*   **Key Constraint:** The UI must never pretend to know more than it does. Uncertainty is explicitly visualized.
*   **Mandatory Element:** A persistent `SYNTHETIC DATA` banner across all internal screens to reinforce the MVP's boundary.

---

## B. DESIGN SYSTEM

### 1. Color System
Strictly avoid RAG (Red/Amber/Green) paradigms. Red implies clinical emergency or diagnostic certainty, which NIRANTAR does not provide.

*   **Brand / Structural Colors:**
    *   Primary: Navy (`#1E293B`) - Used for structural headers, primary text, EWMA baseline.
    *   Secondary: Slate Blue (`#475569`) - Used for secondary text, UI borders, unselected states.
    *   Backgrounds: App Background (`#F8FAFC`), Card/Surface (`#FFFFFF`).
*   **Status & Classification Colors (Core Semantic Palette):**
    *   `WITHIN_EXPECTED_RANGE`: Neutral Grey (`#64748B`).
    *   `EVENT_CONSISTENT_CHANGE`: Muted Blue (`#3B82F6` subdued, e.g., `#60A5FA`).
    *   `ATYPICAL_CHANGE`: Deep Purple (`#7C3AED`).
    *   `IMMEDIATE_ATTENTION`: Charcoal / Black (`#0F172A`) with high-contrast UI treatment.
*   **Utility Colors:**
    *   `SYNTHETIC DATA` Banner: Warning Yellow background (`#FEF08A`) with Black text (`#000000`).
    *   Missing Data / Gaps: Light Grey hashed/dashed (`#CBD5E1`).

### 2. Typography
Use a highly legible, utilitarian sans-serif font like **Inter** or **Roboto**.

*   **Display/Headers (Inter SemiBold):**
    *   H1 (Page Title): 24px, Tracking -1%.
    *   H2 (Section Header): 18px, Tracking -0.5%.
    *   H3 (Card/Panel Header): 14px, All-caps, Tracking +2% (e.g., "CONFIDENCE FACTORS").
*   **Body (Inter Regular/Medium):**
    *   Body Primary (Data/Values): 14px.
    *   Body Secondary (Metadata/Timestamps): 12px, Slate Blue.
*   **Participant Mode:** Minimum 16px body size for accessibility on mobile devices.

### 3. Spacing & Grid
*   **Base Unit:** 4px baseline. All padding/margins must be multiples of 4 (4, 8, 12, 16, 24, 32, 48).
*   **Internal Grid:** 12-column fluid grid for desktop (max-width 1440px). 
*   **Density:** High data density for internal roles (compact rows, 12px-16px padding on table cells).
*   **Card Radii:** Maximum 2px or 4px. Avoid pill-shaped buttons or heavily rounded SaaS containers. Keep it sharp and paper-like.

---

## C. COMPONENT SYSTEM

### 1. Buttons
*   **Primary Action:** Solid Navy (`#1E293B`), white text, 0px drop shadow, 2px border radius. Used *only* for the single most important action on a page (e.g., "Take Ownership").
*   **Secondary Action:** Outline Slate Blue. Transparent background, 1px solid border.
*   **Ghost/Tertiary:** Text only, underline on hover.
*   **Destructive/Escalate:** Deep Purple outline (Do not use Red).

### 2. Forms & Inputs
*   **Style:** No floating labels. Labels are 12px semi-bold, placed directly above the input. 
*   **Inputs:** 1px solid border (`#E2E8F0`), white background, sharp corners. Focus state utilizes a stark `#1E293B` 2px outline (accessibility).
*   **Select/Dropdown:** Standard browser styling overlay, clean borders.

### 3. Tables (List Views)
*   **Style:** Flat, line-separated rows. No zebra striping. 1px `#E2E8F0` horizontal borders.
*   **Headers:** 12px, all-caps, Slate Blue text.
*   **Interaction:** Entire row is clickable where applicable, indicated by a subtle `#F1F5F9` background on hover.

### 4. Alerts & Indicators
*   **Alert Panels:** Left-border emphasis (4px wide). No heavily tinted backgrounds. E.g., A warning alert has a white background, 1px grey border all around, and a 4px Deep Purple left border.
*   **Badges:** 2px radius, light grey background, Slate Blue text. Used for status tags (e.g., `SCHEDULED`, `DISPATCHED`).

### 5. Modals & Panels
*   Prefer **Slide-out Side Panels** (30% width, anchored right) over center-screen modals for contextual tasks (like the Signal Review Panel). This keeps the timeline visible.
*   A dim overlay (`#0F172A` at 40% opacity) covers the main content when side panels are active on smaller screens.

### 6. Empty / Error / Loading States
*   **Empty:** Text only. "No open tasks in queue." **No stock illustrations of empty boxes or sleeping cats.**
*   **Loading:** Skeleton text lines (subtle pulsing `#E2E8F0` rects). No spinning futuristic logos.
*   **Error:** Plain text description of the failure and a generic "Reload" or "Return" button.

---

## D. NAVIGATION DESIGN

### 1. Internal Roles (Desktop-First)
*   **Global Top Bar:** 48px height. 
    *   Top edge: 24px `SYNTHETIC DATA - MVP ENVIRONMENT` persistent yellow banner.
    *   Left: NIRANTAR text logo (Inter Bold, 16px, Navy).
    *   Right: Demo Persona Switcher dropdown, current User Profile, Time/Clock (for simulation).
*   **Left Sidebar:** 240px fixed width, `#F8FAFC` background, right border 1px `#E2E8F0`.
    *   Navigation Items: Queue, Caseload, Events, Escalations, Operations, Simulation & Audit.
    *   Active state: Bold text, Navy `#1E293B` text, 3px solid Navy left border.

### 2. Participant View (Mobile-First)
*   **Header:** Minimal. Just a text label indicating "Secure Check-in". Top `SYNTHETIC DATA` banner. Fixed right-aligned "Raise Concern" outline button.
*   **Navigation:** Hamburger menu top-left for Settings (Consent, Pause, Language, Exit).
*   **Footer:** Safe quick exit button persistently visible.

---

## E. SCREEN DESIGNS

### S01: Login / Demo Persona Switcher
*   **Layout:** Centered single column (400px width).
*   **Content:** "Select Demo Persona". List of buttons: Participant, Case Liaison, Clinician, Supervisor, Admin.
*   **Visual:** Stark white card on off-white background.

### S02: Review Queue (Worker Dashboard)
*   **Layout:** Full-width table view with Left Sidebar.
*   **Header:** "Review Queue". Quick filter tabs: "Unowned Tasks", "My Tasks", "Escalated".
*   **Data Table:** 
    *   Columns: Task Type, Attention Tier (Text, not color dots), Age, Pseudonym, Owner, Due Time.
    *   Typography: Unowned tasks have bolded Pseudonyms.

### S03: Participant Continuity View (HERO SCREEN)
*   *(Detailed in Section F)*

### S04: Signal Review Panel (Inside S03)
*   *(Detailed in Section F)*

### S05: Event Entry/Edit
*   **Layout:** Standard form rendering inside a right-hand slide-out panel (over S03) or dedicated center view.
*   **Sections:** Event Type dropdown, Status dropdown, Scheduled/Occurred Date inputs, Significance (1, 2, 3) radio buttons.
*   **Interaction:** Selecting Significance 3 dynamically reveals a "Verified By" secondary input.

### S06: Action & Handoff
*   **Layout:** Inside the S04 Signal Review Panel, replacing the review context once "Act" is clicked.
*   **Content:** Dropdown of "Context-Typed Pathways". Checkbox for explicit external sharing consent. Dropdown for "Simulated Receiver". 
*   **Primary Action:** "Execute Action" (Navy button).

### S07: Outcome & Follow-up
*   **Layout:** Modal or Slide-out panel.
*   **Content:** Radio list of structured outcomes (`COMPLETED`, `UNABLE_TO_REACH`, etc.). Next follow-up date selector (constrained by cadence cap rules).

### S08: Silence Review
*   *(Detailed in Section F)*

### S09: Enrollment / Consent / Safety
*   **Layout:** Mobile-first vertical flow.
*   **Sections:** 
    *   1. Plain language disclosure.
    *   2. Scopes (Checkboxes for Check-ins, Role visibility).
    *   3. Safety Profile (Toggles for Restrict automated contact, discreet comms).
*   **Typography:** Minimum 16px body, 1.5 line height for readability. Grade 6 reading level layout.

### S10: Participant Check-in
*   *(Detailed in Section F)*

### S11: Participant Help / Raise Concern
*   **Layout:** Mobile full screen.
*   **Content:** Large bold text: "Submit Immediate Concern". Text area (optional). Large primary action button. Secondary text listing emergency numbers (verified demo placeholders).

### S12: Participant Settings
*   **Layout:** Mobile list view.
*   **Actions:** "Pause Participation" (toggle), "Revoke Consent" (Destructive text link), "Change Language" (dropdown).

### S13: Supervisor Escalations
*   **Layout:** Identical to S02 Review Queue, but filtered strictly for `ESCALATED` status tasks with an added column for "Escalation Reason" (e.g., "Unowned Timeout", "Threat Event").

### S14: Aggregate Operations
*   **Layout:** Desktop grid. 
*   **Content:** Simple KPI counters (Total Active Cases, Open Tasks, Escalations). Bar charts for Task Age Distribution. *Strictly no pie charts of arbitrary demographics.* 

### S15: Audit Verification
*   **Layout:** Two columns. Left: Verification run button and status (Pass/Fail). Right: Hash chain ledger (Row sequence, actor, action, timestamp, hash fragment).
*   **Interaction:** Simulated database tamper triggers a visual failure state (Red border on the failing row, system halt message).

### S16: Simulation Control
*   **Layout:** Fixed bottom utility bar across all Admin/Supervisor screens (if activated).
*   **Actions:** "Advance Clock 24h", "Advance to Next Event", "Reset Scenario", "Inject Null Cohort".

### S17: Assignment / Workload
*   **Layout:** Table view mapping workers to case counts and open tasks. Includes "Reassign" button per row.

### S18: Synthetic Receiver
*   **Layout:** Basic external-simulated page. White screen, text: "Simulated External Partner". Shows handoff payload metadata. Buttons: "Accept Handoff", "Decline Handoff".

---

## F. HERO SCREENS (DEEP DIVE)

### 1. S03: Participant Continuity View
*   **Purpose:** The singular source of truth for a case.
*   **Layout:** 
    *   Left 70%: The Data Visualization Canvas (Trajectory Chart directly above Case Timeline).
    *   Right 30%: The Context & Action Panel (S04).
*   **Header:** Participant Pseudonym (e.g., "P-02"). Badges for `ACTIVE` and restricted contact constraints.
*   **Visual Priority:** The timeline chart is the most prominent element. No decorative backgrounds. Just axes, data, and context lines.

### 2. S04: Signal Review Panel (Right 30% of S03)
*   **Hierarchy:**
    *   **Top:** Task Status banner ("UNOWNED" -> Prominent Navy "Take Ownership" button).
    *   **Section 1: Classification:** e.g., `ATYPICAL_CHANGE` (Deep Purple text, no background fill).
    *   **Section 2: Evidence Summary:** "Score dropped by 18 points. Overlaps with ordinary HEARING event."
    *   **Section 3: Confidence:** Explicit text block. 
        *   "MODERATE CONFIDENCE" (Bold).
        *   Bullets: 14 eligible observations (check icon), Variance shrinkage applied (info icon).
    *   **Section 4: Actions:** (Disabled until ownership is taken). Buttons for `Dismiss` (requires text rationale), `Act`, `Escalate`.

### 3. S08: Silence Review
*   **Purpose:** Safely manage a missed check-in.
*   **Layout:** Embedded in the right 30% panel of S03 (replacing S04 when viewing a silence task).
*   **Warning:** Top alert with 4px Charcoal left border: "SILENCE DOES NOT EQUAL SAFETY. Contact Restricted Profile."
*   **Data:** Shows consecutive misses count and date of last valid observation.
*   **Actions:** "Log Contact via Safe Channel", "Plan Retry", "Escalate to Supervisor".

### 4. S10: Participant Check-in
*   **Purpose:** Frictionless, private data collection.
*   **Layout:** Mobile-optimized (320px+). Single column.
*   **Visuals:** One question visible at a time. Large vertical list of tap targets (0 to 5), 48px height minimum per target. 1px borders, high contrast text. 
*   **Safety Item:** Presented distinctly on the final screen with binary YES/NO choices, visually separated from the 0-5 scale to prevent habituated tapping.

---

## G. DATA VISUALIZATION (CORE CONTINUITY CHART)

This visualization (rendered in the left 70% of S03) is the heart of NIRANTAR. It strictly forbids clinical/diagnostic design patterns.

**Structure (Top to Bottom mapping exact X-axis time alignment):**

1.  **The Trajectory Canvas (Y-Axis 0-100 Score, X-Axis Time)**
    *   **Observations (Dots):** 6px solid Slate Grey (`#475569`) circles. 
    *   **Missing Data:** Dashed horizontal line segment on the X-axis where an observation was scheduled but missed.
    *   **EWMA Baseline (Line):** Thin (1.5px), solid Navy line tracing the trend.
    *   **Expected Band (Area):** A subtle, semi-transparent grey polygon (`rgba(100, 116, 139, 0.1)`) surrounding the baseline.
    *   **Contextual Dip:** When an event occurs, this shaded band physically dips downwards on the graph (representing `δ_e` shift) and curves back to the baseline.
    *   **Signals:** If a dot falls far below the band, it is wrapped in a 2px Deep Purple ring (`ATYPICAL_CHANGE`). If it falls inside the dipped band, it gets a Muted Blue ring (`EVENT_CONSISTENT_CHANGE`).

2.  **The Case Events Track (Immediately below X-Axis)**
    *   **Event Markers:** Geometric icons resting on the timeline axis.
        *   Significance 1 (Routine): Small grey square.
        *   Significance 2 (Moderate): Slate blue triangle.
        *   Significance 3 (High): Navy diamond.
    *   **Event Window:** A subtle grey highlight on the X-axis extending behind and forward of the marker (showing pre/post observation windows).

3.  **The Intervention Track (Bottom)**
    *   **Human Actions:** Vertical Navy lines (`#1E293B`, 1px wide) dropping down from the top trajectory canvas all the way through the timeline to denote a timestamp where a worker logged an action.

*Interaction:* Hovering over any dot, event marker, or intervention line brings up a stark white tooltip (no shadow, 1px border) with raw metadata (date, raw score, event description).

---

## H. INTERACTION STATES

*   **Hover:** Desktop elements (rows, menu items) use a subtle background change (`#F1F5F9`). Tooltips appear instantly without fade-in delays.
*   **Focus:** Absolutely mandatory 2px solid Navy (`#1E293B`) outline with a 2px white offset for all interactive elements navigated via keyboard.
*   **Active/Pressed:** Button backgrounds darken slightly (e.g., `#1E293B` to `#0F172A`).
*   **Disabled:** Opacity reduced to 40%. Cursor changes to `not-allowed`. Disabled buttons do *not* have tooltips explaining why they are disabled (put that explanation in the UI text itself).

---

## I. RESPONSIVE DESIGN

*   **Mobile (320px - 767px):** 
    *   Participant views are exclusively optimized for this constraint.
    *   Internal views are fundamentally broken here; display a "Please use a desktop device for Case Management" message if forced.
*   **Tablet (768px - 1023px):**
    *   Internal S03 view collapses: Left sidebar becomes a hamburger menu. The right 30% action panel drops below the Trajectory Canvas to become a stacked layout.
*   **Desktop (1024px+):**
    *   Full three-column view (Nav, Trajectory, Action Panel) utilizes maximum width to prioritize visualization clarity.

---

## J. DEMO SCREEN SEQUENCE (THE "HERO" STORY)

The UI must seamlessly support this exact presentation flow:

1.  **CASE EVENT (S05):** Operator enters "Hearing" event. UI immediately plots a square on the timeline track of S03.
2.  **CHECK-IN (S16 -> S10):** Operator advances simulation clock. Participant receives simulated inbox message, taps link, completes S10 check-in.
3.  **PERSONAL TRAJECTORY & CONTEXT (S03):** Back on worker view, a new dot appears. The UI dynamically draws the "Expected Band" dipping exactly around the Hearing event.
4.  **UNCERTAINTY & SIGNAL (S03/S04):**
    *   *Demo P-01:* The dot falls *inside* the dipped band. Muted Blue circle. UI states `EVENT_CONSISTENT_CHANGE`. No action forced.
    *   *Demo P-02:* The dot falls *below* the dipped band. Deep Purple circle. UI states `ATYPICAL_CHANGE`. S04 slides open demanding an owner.
5.  **HUMAN REVIEW & ACTION (S04 -> S06):** Worker clicks "Take Ownership". Reads explicit confidence factors (e.g., "14 eligible obs"). Selects "Act". Chooses "Facilitated Connection".
6.  **FOLLOW-UP (S07):** Worker records outcome. A vertical intervention line drops onto the S03 timeline chart. The system schedules the next observation.

---

## K. VISUAL QUALITY CHECKLIST

Before final frontend approval, verify:
*   [ ] Is the `SYNTHETIC DATA` banner fixed at the top of every internal screen?
*   [ ] Does the UI strictly avoid the colors Red, Amber, and Green for risk status?
*   [ ] Are all buttons and cards flat (no drop shadows, maximum 4px border radius)?
*   [ ] Is the word "Risk Score" or any percentage-based risk completely absent?
*   [ ] Are the confidence tiers (Insufficient, Low, Moderate, Higher) rendered as plain text, not probability meters?
*   [ ] Do missed check-ins explicitly render as dashed gaps on the Trajectory X-axis?
*   [ ] Does the expected band visually "dip" around ordinary events on the chart?

---

## L. RULES FOR AVOIDING GENERIC AI-GENERATED APPEARANCE

To ensure the MVP looks like a serious institutional tool and not a generic SaaS template or AI generator output, the frontend developer MUST adhere to these strict negative constraints:

1.  **NO Dashboard Widgets:** The home screen is a structured Queue list, not a grid of KPI summary cards, pie charts, or "Total Users" widgets.
2.  **NO Magic/Sparkle Icons:** Do not use wand icons, sparkle emojis, or glowing gradients to indicate the statistical detector's output.
3.  **NO Neumorphism or Glassmorphism:** No frosted glass effects, layered shadows, or extruded buttons. Use flat, high-contrast, border-defined layouts.
4.  **NO Empty State Cartoons:** If a queue is empty or a participant has no history, show plain text (e.g., "0 eligible observations"). Do not use illustrations of people looking through telescopes, sleeping animals, or empty boxes.
5.  **NO AI Copywriting Tropes:** Do not use phrases like "AI-Powered Wellbeing", "Delve into the case", "Supercharge your workflow", or "Smart Insights". Use dry, exact terminology (`EVENT_CONSISTENT_CHANGE`, `ATYPICAL_CHANGE`).
6.  **NO Avatar Placeholders:** Do not use generic silhouette heads or initials in colored circles for participants. Use standard typographic pseudonyms (e.g., `P-043`, `Case Ref: 992-A`).
7.  **NO Animated Loading Spinners:** Avoid bouncing dots or complex SVG animations. Use simple text "Calculating trajectory..." or static skeleton wireframes. 

*End of Visual Design Specification.*