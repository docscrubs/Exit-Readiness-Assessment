# Architecture Documentation

This document describes the technical architecture of the SME Exit Readiness Assessment application.

## Overview

The SME Exit Readiness Assessment is a **client-side single-page application (SPA)** built with Angular 18+, TypeScript, and Tailwind CSS. It requires no backend server and stores all data locally in the browser.

## Technology Stack

### Core Framework
- **Angular 18+**: Modern web framework with standalone components
- **TypeScript 5.6+**: Type-safe JavaScript for maintainable code
- **RxJS**: Reactive programming with observables

### UI & Styling
- **Tailwind CSS 4**: Utility-first CSS framework
- **Chart.js 4**: Interactive radar charts
- **Angular Signals**: Built-in reactivity for state management

### Build & Deploy
- **Angular CLI 20+**: Build tooling and development server
- **Vercel**: Static site hosting with automatic SPA routing
- **ESBuild**: Fast JavaScript bundler

## Application Architecture

### High-Level Structure

```
┌─────────────────────────────────────────────┐
│           Browser (Client-Side)             │
├─────────────────────────────────────────────┤
│  ┌───────────────────────────────────────┐  │
│  │         Angular Application           │  │
│  │  ┌─────────────────────────────────┐  │  │
│  │  │          Components             │  │  │
│  │  │  ┌──────┐  ┌──────┐  ┌──────┐  │  │  │
│  │  │  │ Home │  │ Asst │  │Report│  │  │  │
│  │  │  └──────┘  └──────┘  └──────┘  │  │  │
│  │  └─────────────────────────────────┘  │  │
│  │  ┌─────────────────────────────────┐  │  │
│  │  │          Services               │  │  │
│  │  │  ┌──────────────────────────┐   │  │  │
│  │  │  │ AssessmentService        │   │  │  │
│  │  │  │ RecommendationService    │   │  │  │
│  │  │  └──────────────────────────┘   │  │  │
│  │  └─────────────────────────────────┘  │  │
│  │  ┌─────────────────────────────────┐  │  │
│  │  │          Models/Data            │  │  │
│  │  │  assessment.json (loaded)       │  │  │
│  │  │  valuation-tiers.ts             │  │  │
│  │  └─────────────────────────────────┘  │  │
│  └───────────────────────────────────────┘  │
│  ┌───────────────────────────────────────┐  │
│  │      Browser APIs & Storage           │  │
│  │  - localStorage (save/restore)        │  │
│  │  - fetch API (load assessment.json)   │  │
│  │  - window.print() (report export)     │  │
│  └───────────────────────────────────────┘  │
└─────────────────────────────────────────────┘
```

### Component Architecture

#### Standalone Components
All components are standalone (no NgModules):
- **app.ts**: Root component with routing outlet
- **pages/home.ts**: Landing page with overview
- **pages/assessment.ts**: Interactive questionnaire
- **pages/report.ts**: Results and recommendations
- **components/radar.ts**: Reusable radar chart component

### Data Flow

```
assessment.json (static file)
    ↓
AssessmentService.loadAssessment()
    ↓
AssessmentSpec (signal)
    ↓
Components (computed signals)
    ↓
User Interactions (setResponse)
    ↓
Responses (signal)
    ↓
RecommendationService.computeRecommendations()
    ↓
Report Page (recommendations, thresholds, valuation, timeline)
```

## State Management

### Angular Signals

The application uses Angular's built-in signals for reactive state:

```typescript
// Core state
spec = signal<AssessmentSpec | null>(null);
responses = signal<Responses>({});

// Computed state
dimensionAverages = computed(() => {
  const s = this.spec();
  const r = this.responses();
  if (!s) return [];
  return s.dimensions.map(dim => this.recSvc.average(dim.questions, r));
});

// Derived recommendations
recommendations = computed(() =>
  this.recSvc.computeRecommendations(this.spec()!, this.responses())
);

thresholdViolations = computed(() =>
  this.recSvc.detectThresholdViolations(this.spec()!, this.responses())
);

valuationAssessment = computed(() =>
  this.recSvc.assessValuationReadiness(this.spec()!, this.responses())
);
```

### Benefits of Signals
- **Automatic reactivity**: UI updates when signals change
- **Fine-grained updates**: Only affected components re-render
- **Type-safe**: Full TypeScript support
- **No RxJS overhead**: Simpler than observables for state

## Data Models

### Core Interfaces

```typescript
interface AssessmentSpec {
  title: string;
  description: string;
  scale: {
    min: number;
    max: number;
    labels: AssessmentLevel[];
  };
  dimensions: AssessmentDimension[];
  sectors?: SectorBenchmark[];
}

interface AssessmentDimension {
  id: string;
  name: string;
  description?: string;
  critical?: boolean;        // Flags critical domains
  minAcceptable?: number;    // Minimum threshold (e.g., 2)
  questions: AssessmentQuestion[];
}

interface AssessmentQuestion {
  id: string;
  text: string;
  explanations: string[];    // One per level (0-4)
}

interface ValuationTier {
  name: string;
  description: string;
  valuationRange: string;    // "£1-3M"
  ebitdaRange: string;       // "3-5x EBITDA"
  minLevel: number;          // Overall minimum (e.g., 1.5)
  targetLevel: number;       // Target to reach tier (e.g., 2.5)
  criticalRequirements: {    // Domain-specific minimums
    domainId: string;
    minLevel: number;
  }[];
}

interface Responses {
  [questionId: string]: number;  // 0-4
}
```

## Services

### AssessmentService

**Responsibility**: Load and provide assessment specification

```typescript
class AssessmentService {
  private spec = signal<AssessmentSpec | null>(null);

  // Load assessment.json on init
  async loadAssessment(url: string): Promise<AssessmentSpec> {
    const response = await fetch(url);
    const data = await response.json();
    this.spec.set(data);
    return data;
  }

  getSpec(): Signal<AssessmentSpec | null> {
    return this.spec.asReadonly();
  }
}
```

### RecommendationService

**Responsibility**: Business logic for scoring and recommendations

**Key Methods**:

1. **computeRecommendations(spec, responses)**: Generate prioritised recommendations
2. **detectThresholdViolations(spec, responses)**: Find Level 0 and critical domain violations
3. **assessValuationReadiness(spec, responses)**: Compare against valuation tiers
4. **generateTimelineGuidance(spec, responses)**: Estimate months to readiness
5. **getSectorBenchmark(spec, sectorName)**: Retrieve sector baseline scores

**Recommendation Algorithm**:

```typescript
// 1. Calculate dimension averages
const dimAvg = dimension.questions.reduce((sum, q) =>
  sum + (responses[q.id] ?? 0), 0
) / dimension.questions.length;

// 2. Detect thresholds
if (dimAvg === 0) {
  violations.push({
    type: 'level-zero',
    severity: 'blocker',
    message: 'Critical gap - no evidence of capability'
  });
}

if (dimension.critical && dimAvg < dimension.minAcceptable) {
  violations.push({
    type: `${dimension.id}-critical`,
    severity: 'critical',
    message: `Below transaction-ready threshold`
  });
}

// 3. Prioritize recommendations
const prioritized = [
  ...levelZeroRecs,     // Priority 1: Blockers
  ...criticalRecs,      // Priority 2: Critical thresholds
  ...improvementRecs    // Priority 3: Improvements
];
```

## Code Generation Algorithm

The application generates compact alphanumeric codes representing user responses for easy sharing and restoration.

### Encoding Process

```typescript
function generateCode(responses: Responses, spec: AssessmentSpec): string {
  // 1. Extract responses in question order
  const values = spec.dimensions
    .flatMap(d => d.questions)
    .map(q => responses[q.id] ?? 0);  // 0-4

  // 2. Pack into base-5 number
  let packed = 0n;
  for (let i = values.length - 1; i >= 0; i--) {
    packed = packed * 5n + BigInt(values[i]);
  }

  // 3. Obfuscate with XOR mask
  const obfuscated = packed ^ OBFUSCATION_MASK;

  // 4. Encode as base-36 (0-9, a-z)
  const encoded = obfuscated.toString(36).toUpperCase();

  // 5. Add checksum
  const checksum = computeChecksum(encoded);

  return `${encoded}-${checksum}`;
}
```

### Why Base-5 Packing?

- Responses are 0-4 (5 possible values)
- Base-5 encoding is optimal: `5^36 ≈ 8.67e24` combinations
- Compact: 36 questions → ~25 character code
- Human-friendly: Base-36 (alphanumeric) is easy to type

### Decoding Process

```typescript
function restoreFromCode(code: string, spec: AssessmentSpec): Responses {
  // 1. Validate checksum
  const [encoded, checksum] = code.split('-');
  if (computeChecksum(encoded) !== checksum) {
    throw new Error('Invalid code');
  }

  // 2. Decode from base-36
  const obfuscated = BigInt(`0x${encoded}`);

  // 3. De-obfuscate
  const packed = obfuscated ^ OBFUSCATION_MASK;

  // 4. Unpack to base-5 digits
  const values: number[] = [];
  let remaining = packed;
  for (let i = 0; i < questionCount; i++) {
    values.push(Number(remaining % 5n));
    remaining = remaining / 5n;
  }

  // 5. Map to question IDs
  const responses: Responses = {};
  spec.dimensions.flatMap(d => d.questions).forEach((q, i) => {
    responses[q.id] = values[i];
  });

  return responses;
}
```

## Routing

### Client-Side Routing

```typescript
const routes: Routes = [
  { path: '', component: HomePageComponent },
  { path: 'assessment', component: AssessmentPageComponent },
  { path: 'report', component: ReportPageComponent },
  { path: '**', redirectTo: '' }
];
```

### SPA Configuration

**vercel.json**:
```json
{
  "rewrites": [
    { "source": "/(.*)", "destination": "/index.html" }
  ]
}
```

All routes redirect to `index.html`, allowing Angular router to handle navigation.

## Responsive Design

### Mobile-First Approach

Uses Tailwind CSS utility classes for responsive layouts:

```html
<!-- Stack on mobile, side-by-side on desktop -->
<div class="flex flex-col md:flex-row gap-6">
  <div class="w-full md:w-1/2">...</div>
  <div class="w-full md:w-1/2">...</div>
</div>

<!-- Grid: 1 column mobile, 2 columns tablet, 3 columns desktop -->
<div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
  <div>...</div>
</div>

<!-- Responsive text sizing -->
<h1 class="text-3xl sm:text-4xl lg:text-5xl">Title</h1>

<!-- Responsive padding -->
<div class="px-4 md:px-6 lg:px-8">...</div>
```

### Breakpoints

```javascript
// Tailwind default breakpoints
sm: '640px',   // Mobile landscape
md: '768px',   // Tablet
lg: '1024px',  // Desktop
xl: '1280px',  // Large desktop
```

### Touch-Friendly UI

- Minimum 44×44px touch targets
- Large radio buttons for question responses
- Adequate spacing between interactive elements
- No hover-dependent functionality

## Performance Optimization

### Build Optimizations

1. **AOT Compilation**: Templates compiled at build time
2. **Tree Shaking**: Removes unused code
3. **Minification**: Reduces file sizes
4. **Code Splitting**: Lazy loads routes (if configured)
5. **Asset Optimization**: Compresses images and fonts

### Runtime Optimizations

1. **Signals-based Reactivity**: Fine-grained updates
2. **OnPush Change Detection**: Reduces checks
3. **Computed Signals**: Memoized derived state
4. **Local Data Storage**: No network requests for state

### Bundle Size

```
Main bundle:     ~350 KB (uncompressed)
Polyfills:       ~35 KB
Styles:          ~22 KB
Total:           ~408 KB
Gzipped:         ~107 KB (served size)
```

## Security

### Client-Side Security

- **No server-side data**: All processing in browser
- **No authentication**: Publicly accessible
- **localStorage only**: No cookies or tracking
- **XSS protection**: Angular built-in sanitization
- **HTTPS enforced**: Vercel serves over TLS

### Code Obfuscation

Export codes are obfuscated with XOR mask to prevent casual inspection, but **not for security**. Codes are for convenience, not authentication.

## Browser Compatibility

### Supported Browsers

- **Chrome/Edge**: Latest 2 versions
- **Firefox**: Latest 2 versions
- **Safari**: Latest 2 versions (iOS and macOS)
- **Opera**: Latest version

### Required Features

- ES2022+ (native BigInt for code generation)
- Signals (Angular 16+)
- Fetch API
- localStorage
- CSS Grid and Flexbox

## Testing Strategy

### Manual Testing

1. **Functional Testing**: Complete assessment end-to-end
2. **Code Generation**: Generate and restore codes
3. **Threshold Detection**: Test Level 0 and critical violations
4. **Cross-Browser**: Test on Chrome, Firefox, Safari, Edge
5. **Responsive Design**: Test on 375px, 768px, 1024px viewports

### Automated Testing (Future)

```bash
# Unit tests
ng test

# E2E tests
ng e2e
```

## Accessibility

### WCAG Compliance

- **Semantic HTML**: Proper heading hierarchy
- **ARIA labels**: Screen reader support
- **Keyboard navigation**: Full keyboard support
- **Color contrast**: WCAG AA compliant
- **Focus indicators**: Visible focus states

### Target Lighthouse Scores

- Performance: >90
- Accessibility: >95
- Best Practices: >90
- SEO: >90

## Future Enhancements

### Potential Improvements

1. **Internationalization**: Support multiple languages
2. **PDF Export**: Generate PDF reports client-side
3. **Comparison Mode**: Compare multiple assessments
4. **Progress Tracking**: Track improvements over time
5. **Team Collaboration**: Share assessments with team
6. **Custom Sectors**: Allow users to define sector benchmarks

### Technical Debt

- Add comprehensive unit tests
- Implement E2E testing with Playwright
- Add error boundary components
- Implement service worker for offline support
- Add telemetry for usage analytics

## Maintenance

### Updating Dependencies

```bash
# Check for updates
npm outdated

# Update Angular
ng update @angular/core @angular/cli

# Update other dependencies
npm update
```

### Content Updates

See [CONTENT-UPDATE-GUIDE.md](./CONTENT-UPDATE-GUIDE.md) for updating questions and guidance.

## Support

For architectural questions or technical issues:
- Review this documentation
- Check Angular documentation: [angular.dev](https://angular.dev)
- Check Tailwind CSS documentation: [tailwindcss.com](https://tailwindcss.com)
- Open issue in repository
