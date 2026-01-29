# Question Comprehension Options

This document outlines approaches for improving user comprehension of assessment questions in the SME Exit Readiness Assessment application.

## Problem Statement

Users and customers often struggle to understand assessment questions due to:

1. **M&A Jargon** - Questions use specialist terminology such as "EBITDA", "normalised", "vendor DD pack", "locked-box ready", and "change of control" that many SME owners have never encountered
2. **Punitive Default** - Current guidance states "If you don't understand a question or it doesn't apply, choose 0" which:
   - Penalises users for lack of M&A knowledge rather than lack of business readiness
   - Doesn't help users learn or understand what's being asked
   - May significantly understate their actual position
3. **Post-Selection Explanations** - Level explanations are only shown *after* a user selects a value, requiring them to guess first

This results in:
- **Inaccurate assessments** - Users guess incorrectly or default to 0
- **Assessment abandonment** - Users give up when faced with unfamiliar terminology
- **Reduced trust** - Users question the validity of results they don't understand

## Constraint

**Scoring accuracy must be maintained.** Any UX changes must preserve:

- Responses mapping to 0-4 integer values
- Domain averages calculated as simple arithmetic means
- Overall score as weighted average across domains
- Threshold violation detection (scores < 0.9 as blockers, critical domains < 2.0)
- Export code compatibility

---

## Approach 1: Show All Explanations Upfront

**Effort: Low | Impact: High | Recommended: Yes (Priority 1)**

### Description

Add an expandable "What do the levels mean?" section to each question that reveals all 5 level explanations (0-4) before the user makes a selection. Users can compare their situation to each description and self-assess accurately.

### User Experience

1. User sees the question text
2. Below the question, a collapsed section shows "What do the levels mean?" or similar
3. Clicking/tapping expands to show all 5 explanations in a clear list
4. User reads the explanations and identifies which best matches their situation
5. User selects the corresponding level (0-4)
6. Selected explanation is highlighted for confirmation

### Implementation Requirements

**Files to modify:**
- `src/app/pages/assessment.ts` - Add expand/collapse state and accordion UI

**Changes:**
```typescript
// Add signal to track expanded questions
expandedQuestions = signal<Set<string>>(new Set());

toggleQuestionHelp(qid: string) {
  this.expandedQuestions.update(set => {
    const newSet = new Set(set);
    if (newSet.has(qid)) {
      newSet.delete(qid);
    } else {
      newSet.add(qid);
    }
    return newSet;
  });
}
```

**Template addition:**
```html
<button (click)="toggleQuestionHelp(q.id)" class="text-xs text-purple-600 mt-2 underline">
  {{ expandedQuestions().has(q.id) ? 'Hide levels' : 'What do the levels mean?' }}
</button>

<div *ngIf="expandedQuestions().has(q.id)" class="mt-3 space-y-2 text-xs border-l-2 border-purple-200 pl-3">
  <div *ngFor="let exp of q.explanations; let i = index"
       class="p-2 rounded"
       [class.bg-purple-50]="responses()[q.id] === i"
       [class.border-purple-300]="responses()[q.id] === i">
    <span class="font-semibold">{{ labelFor(i) }}:</span>
    <span class="text-slate-600"> {{ exp }}</span>
  </div>
</div>
```

### Pros

- Uses existing data - no new content creation required
- Empowers users to self-assess by comparison
- Low cognitive load - expansion is optional
- Works well on mobile (accordion pattern)
- Quick to implement

### Cons

- Adds visual complexity to the page
- May slow down users who already understand questions
- Does not address jargon within the explanations themselves

### Scoring Accuracy

**Maintained** - Users still select 0-4 directly; this only changes when explanations are visible.

---

## Approach 2: Contextual Jargon Tooltips / Glossary

**Effort: Medium | Impact: Medium | Recommended: Yes (Priority 3)**

### Description

Identify and highlight M&A jargon terms throughout questions and explanations. When users hover (desktop) or tap (mobile), a tooltip displays a plain English definition. Optionally, a persistent glossary panel can be toggled open.

### User Experience

1. Jargon terms appear with a subtle underline or highlight (e.g., dotted underline)
2. Hovering or tapping shows an inline tooltip with definition
3. Users can also open a "Glossary" panel to browse all terms
4. Terms link bidirectionally (clicking in glossary highlights in questions)

### Implementation Requirements

**Files to modify/create:**
- `public/assessment.json` - Add `glossary` section
- `src/app/models/assessment.ts` - Add `GlossaryTerm` interface
- `src/app/services/glossary.service.ts` - New service
- `src/app/components/tooltip.component.ts` - New component
- `src/app/pages/assessment.ts` - Integrate tooltips

**Data addition to assessment.json:**
```json
{
  "glossary": [
    {
      "term": "EBITDA",
      "definition": "Earnings Before Interest, Tax, Depreciation and Amortisation - a measure of operating profit before accounting adjustments"
    },
    {
      "term": "normalised",
      "definition": "Adjusted to remove one-off or unusual items that don't reflect normal business performance"
    },
    {
      "term": "vendor DD pack",
      "definition": "Vendor Due Diligence Pack - documents prepared by the seller to answer buyer questions proactively"
    },
    {
      "term": "locked-box",
      "definition": "A transaction mechanism where accounts are frozen at a specific date, with no value leaving the business after that point"
    },
    {
      "term": "change of control",
      "definition": "When business ownership transfers to a new party - some contracts require consent when this happens"
    }
  ]
}
```

**Estimated glossary size:** 30-50 terms

### Pros

- Addresses jargon problem directly at the source
- Educational - users learn M&A terminology as they go
- Non-intrusive - only appears when users seek help
- Reusable across the application (report, methodology pages)

### Cons

- Requires curating and writing a glossary (30-50 terms)
- Touch interaction needs careful UX design (tap vs long-press)
- May feel cluttered if too many terms are highlighted
- Does not help users who don't realise they need help

### Scoring Accuracy

**Maintained** - No change to selection mechanism or values.

---

## Approach 3: "I Don't Understand" Button

**Effort: High | Impact: Medium | Recommended: No**

### Description

Add an explicit "I don't understand" button alongside the 0-4 options. When clicked, it records a 0 for scoring purposes but opens a modal with additional help including a plain English summary, all level explanations, and optionally sector-specific examples.

### User Experience

1. User sees question with 0-4 buttons plus an "I don't understand" button (styled differently)
2. Clicking "I don't understand":
   - Sets the response to 0 (maintains scoring)
   - Opens a help modal showing:
     - Plain English summary of what the question asks
     - All 5 level explanations
     - Sector-specific examples (if available)
   - "Now I understand - let me answer" button returns to question with explanations visible
3. If user doesn't change their answer, it remains 0

### Implementation Requirements

**Files to modify/create:**
- `public/assessment.json` - Add `plainSummary` and optionally `sectorExamples` to each question
- `src/app/components/question-help-modal.ts` - New modal component
- `src/app/pages/assessment.ts` - Add button and modal integration

**Data addition (per question):**
```json
{
  "id": "f3",
  "text": "Is EBITDA and profitability measured, normalised, and documented for review?",
  "plainSummary": "Do you know your real operating profit? Can you explain any unusual costs or income that affected it?",
  "sectorExamples": {
    "technology": "For a SaaS company: can you show your MRR minus server costs, salaries, and marketing spend?",
    "professional": "For a consultancy: can you show fees earned minus staff costs and overheads, adjusted for unusual projects?"
  },
  "explanations": [...]
}
```

**Content creation:** 36 plain summaries + optionally 216 sector examples (36 questions x 6 sectors)

### Pros

- Provides explicit path for confused users
- Educational with contextual examples
- Could capture analytics on which questions confuse users

### Cons

- Significant content creation (36 summaries minimum)
- Modal interrupts assessment flow
- May encourage users to "give up" rather than try to understand
- Still results in 0 score - doesn't help users who actually have higher readiness

### Scoring Accuracy

**Maintained** - "I don't understand" maps directly to 0.

---

## Approach 4: Progressive Complexity by Lifecycle Stage

**Effort: Medium | Impact: Medium | Recommended: No**

### Description

Adjust question language complexity based on the user's selected lifecycle stage. Pre-Revenue users see simpler language; £30M valuation users see full M&A terminology (they should know it at that stage).

### User Experience

1. User selects their lifecycle stage at the start (already required)
2. For "Pre-Revenue/Early Stage" users:
   - Questions display simplified text
   - Original M&A terminology shown in smaller text or on request
3. For "£30M Valuation" users:
   - Full M&A terminology displayed
   - Simplified text available on request

### Implementation Requirements

**Files to modify:**
- `public/assessment.json` - Add `simplifiedText` to each question
- `src/app/pages/assessment.ts` - Conditional display based on lifecycle

**Data addition (per question):**
```json
{
  "id": "f3",
  "text": "Is EBITDA and profitability measured, normalised, and documented for review?",
  "simplifiedText": "Do you know your real operating profit, with unusual items explained?",
  "explanations": [...]
}
```

**Logic:**
```typescript
presentationMode = computed(() => {
  const lifecycle = this.selectedLifecycle();
  if (lifecycle === 'preRevenue') return 'simplified';
  if (lifecycle === 'fiveM') return 'standard';
  return 'advanced';
});
```

### Pros

- Tailors experience to expected user sophistication
- Uses existing lifecycle selection (no extra input)
- Maintains full rigour for advanced users

### Cons

- Requires creating simplified versions of 36 questions
- Lifecycle stage may not correlate with M&A knowledge (a £30M business owner may be selling for the first time)
- Risk of oversimplification losing important nuance
- Users don't know they're seeing a different version

### Scoring Accuracy

**Maintained** - Same 0-4 selection, same underlying explanations.

---

## Approach 5: Pre-Assessment Calibration

**Effort: Medium-High | Impact: Medium | Recommended: No**

### Description

Before starting the assessment, users answer 3-5 calibration questions to gauge their familiarity with M&A concepts. Based on responses, the system adjusts presentation: help level, language complexity, and tooltip visibility.

### User Experience

1. Before assessment begins, user sees "Let's personalise your experience"
2. 3-5 quick questions:
   - "Have you sold a business before?"
   - "Do you know what EBITDA stands for?"
   - "Have you worked with M&A advisers?"
3. Based on answers, system sets:
   - Default help panel state (expanded vs collapsed)
   - Language mode (simplified vs standard)
   - Tooltip density (all terms vs key terms only)
4. User can override with "Show me full M&A terminology" option

### Implementation Requirements

**Files to create/modify:**
- `public/assessment.json` or new `calibration.json` - Calibration questions
- `src/app/components/calibration.component.ts` - New pre-assessment component
- `src/app/services/user-preferences.service.ts` - Store sophistication level
- `src/app/pages/assessment.ts` - Consume preferences

### Pros

- Personalises experience based on actual knowledge (not assumptions)
- Can be very quick (3 questions)
- User feels the assessment is tailored to them

### Cons

- Adds friction before assessment starts
- May frustrate experienced users
- Calibration questions may not accurately predict comprehension
- Additional complexity to maintain

### Scoring Accuracy

**Maintained** - Calibration only affects presentation, not response values.

---

## Approach 6: Inline Plain English Summaries

**Effort: Medium | Impact: High | Recommended: Yes (Priority 2)**

### Description

Display both a plain English summary and the original M&A terminology for each question. The summary appears prominently; the technical term appears in smaller or muted text for reference.

### User Experience

1. User sees question displayed as:
   > **Do you know your real operating profit, with unusual items explained?**
   > *(EBITDA normalised and documented)*
2. User understands what's being asked from the plain English
3. User learns the M&A terminology through association
4. Explanations still use technical terms (maintains precision)

### Implementation Requirements

**Files to modify:**
- `public/assessment.json` - Add `plainSummary` to each question
- `src/app/models/assessment.ts` - Update `AssessmentQuestion` interface
- `src/app/pages/assessment.ts` - Update question display template

**Data addition (per question):**
```json
{
  "id": "f3",
  "text": "Is EBITDA and profitability measured, normalised, and documented for review?",
  "plainSummary": "Do you know your real operating profit, with unusual items explained?",
  "explanations": [...]
}
```

**Template change:**
```html
<div class="text-sm text-slate-800 font-medium">
  {{ q.plainSummary || q.text }}
</div>
<div *ngIf="q.plainSummary" class="text-xs text-slate-500 italic mt-1">
  ({{ q.text }})
</div>
```

**Content creation:** 36 plain English summaries

### Pros

- Immediate clarity without requiring interaction
- Users learn terminology through association
- Simple template change
- Works perfectly on mobile
- Non-intrusive

### Cons

- Makes question area visually longer
- Requires writing 36 plain English summaries
- Some questions may not have clean simple translations

### Scoring Accuracy

**Maintained** - Same 0-4 selection; summaries don't affect scoring.

---

## Approach 7: Guided Assessment Mode with Scenarios

**Effort: High | Impact: High | Recommended: No (complexity too high)**

### Description

Offer a "Guided Mode" toggle that replaces numeric buttons with descriptive scenarios. Users select the description that best matches their situation; the system maps it to the appropriate 0-4 value.

### User Experience

1. User can toggle "Guided Mode" on/off
2. In Guided Mode, instead of buttons 0-4, users see:
   - "I don't track profit formally or don't know what EBITDA means" → 0
   - "I know roughly what we make but don't have formal calculations" → 1
   - "I track profit regularly and can explain our margins" → 2
   - "I have documented profit calculations reviewed by my accountant" → 3
   - "I have a detailed earnings analysis ready for investors" → 4
3. Users select the description; system records the mapped value

### Implementation Requirements

**Files to modify:**
- `public/assessment.json` - Add `guidedOptions` to each question
- `src/app/pages/assessment.ts` - Add mode toggle and alternative display

**Data addition (per question):**
```json
{
  "id": "f3",
  "text": "Is EBITDA and profitability measured, normalised, and documented for review?",
  "guidedOptions": [
    { "value": 0, "description": "I don't track profit formally or don't know what EBITDA means" },
    { "value": 1, "description": "I know roughly what we make but don't have formal calculations" },
    { "value": 2, "description": "I track profit regularly and can explain our margins" },
    { "value": 3, "description": "I have documented profit calculations reviewed by my accountant" },
    { "value": 4, "description": "I have a detailed earnings analysis ready for investors" }
  ],
  "explanations": [...]
}
```

**Content creation:** 180 guided descriptions (5 per question x 36 questions)

### Pros

- Most user-friendly for novices
- Removes jargon barrier entirely
- Self-assessment by description is intuitive
- Still produces accurate 0-4 values

### Cons

- **Massive content creation** (180 descriptions)
- Risk of users selecting based on wording rather than reality
- Harder to validate accuracy of descriptions vs explanations
- Doubles UI complexity with mode toggle
- Maintenance burden (two parallel content sets)

### Scoring Accuracy

**Maintained** - Descriptions map directly to 0-4 values.

---

## Recommendations Summary

| Priority | Approach | Effort | Impact | Rationale |
|----------|----------|--------|--------|-----------|
| 1 | Show All Explanations Upfront | Low | High | Quick win using existing data; empowers self-assessment |
| 2 | Inline Plain English Summaries | Medium | High | Addresses jargon at source; educational |
| 3 | Contextual Jargon Tooltips | Medium | Medium | Supplements above approaches; reusable |

### Not Recommended

- **"I Don't Understand" Button** - High effort, still results in 0 score
- **Progressive Complexity** - Lifecycle doesn't reliably indicate M&A knowledge
- **Pre-Assessment Calibration** - Adds friction, uncertain accuracy
- **Guided Assessment Mode** - Excellent UX but prohibitive content creation (180 items)

---

## Implementation Notes

### Key Files

| File | Purpose |
|------|---------|
| `src/app/pages/assessment.ts` | Main assessment UI - question display, selection handling |
| `public/assessment.json` | Assessment data - questions, explanations, new fields |
| `src/app/models/assessment.ts` | TypeScript interfaces for assessment data |
| `src/styles.css` | Global styles for new components |

### Mobile Considerations

- Accordion pattern (Approach 1) works well on touch devices
- Tooltips (Approach 2) need tap-to-show rather than hover
- All approaches should use touch targets minimum 44x44px
- Test at 375px viewport width

### Phased Implementation Suggestion

1. **Phase 1**: Implement Approach 1 (Show All Explanations) - immediate value, no content creation
2. **Phase 2**: Write plain English summaries for most jargon-heavy questions (10-15 questions)
3. **Phase 3**: Complete remaining summaries and add glossary tooltips
4. **Gather feedback** between phases to prioritise remaining work

---

## Appendix: Jargon Terms Requiring Definition

The following terms appear in assessment questions and explanations and may need glossary entries:

- EBITDA
- Normalised / normalisation
- Vendor DD pack / Vendor Due Diligence
- Locked-box
- Change of control
- Audit trail
- Statutory filings
- Add-back schedule
- Quality of earnings
- Working capital
- Cash conversion
- Tax clearances
- Corporate structure
- Statutory books
- Board minutes / resolutions
- Material contracts
- Assignability
- Chain of title (IP)
- Freedom to operate
- W&I insurance (Warranty & Indemnity)
- KPIs
- SOPs (Standard Operating Procedures)
- DR plan (Disaster Recovery)
- SRM (Supplier Relationship Management)
- LTIP (Long-Term Incentive Plan)
- NPS (Net Promoter Score)
- LTV (Lifetime Value)
- DPIA (Data Protection Impact Assessment)
- DPO (Data Protection Officer)
- ISO certifications (9001, 14001, 27001, 45001)
- Six Sigma / Lean
- CQC (Care Quality Commission - healthcare sector)
