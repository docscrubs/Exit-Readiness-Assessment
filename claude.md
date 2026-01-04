# Claude AI Development Guide

## Project Overview

This is an **SME Exit Readiness Assessment** application built with Angular 18+ (standalone components), TypeScript, and Tailwind CSS. The application helps Small and Medium-sized Enterprise (SME) owners assess their business's readiness for exit (sale, acquisition, etc.) across 6 critical domains:

1. **Financial** - Financial records, reporting, EBITDA, tax compliance
2. **Legal & Corporate** - Corporate structure, contracts, IP, compliance
3. **Commercial** - Customer concentration, revenue quality, market position
4. **Operational** - Process documentation, IT systems, scalability
5. **People & Organisation** - Employment contracts, management depth, retention
6. **ESG & Risk** - Health & Safety, data protection, risk management

Users answer 36 questions (6 per domain) on a 0-4 maturity scale:
- **0: Incomplete** - Critical gaps, deal-breakers
- **1: Initial** - Basic awareness, significant work needed
- **2: Defined** - Documented and consistent, transaction-ready baseline
- **3: Managed** - Measured and controlled, institutional standards
- **4: Optimised** - Continuously improved, best-in-class

The assessment generates:
- Overall readiness score and domain-specific scores
- Valuation tier assessment (£1-3M, £3-8M, £8-20M, £20M+)
- Timeline guidance for exit readiness
- Threshold violations (Level 0 blockers, critical gaps)
- Detailed recommendations and improvement roadmap

## British English Requirement

**CRITICAL: All user-facing text, variable names, function names, comments, and documentation MUST use British English spelling conventions.**

Common differences from American English:
- `organisation` NOT `organization`
- `optimise/optimised/optimising` NOT `optimize/optimized/optimizing`
- `normalise/normalised` NOT `normalize/normalized`
- `recognise/recognised` NOT `recognize/recognized`
- `systematise/systematised` NOT `systematize/systematized`
- `programme` NOT `program` (when referring to a structured initiative)
- `colour` NOT `color`
- `behaviour` NOT `behavior`
- `licence` (noun) / `license` (verb) NOT `license` (both)

This requirement applies to:
- All JSON data files (assessment.json, etc.)
- All TypeScript code (components, services, models)
- All HTML templates
- All comments and documentation
- Variable names and function names where appropriate

## Architecture

### Project Structure
```
src/
├── app/
│   ├── components/     # Reusable UI components (radar chart, etc.)
│   ├── models/         # TypeScript interfaces and types
│   ├── pages/          # Page components (home, assessment, report)
│   ├── services/       # Business logic services
│   └── app.ts          # Root component
├── public/
│   └── assessment.json # Assessment specification data
└── index.html
```

### Key Files

**Data Files:**
- `public/assessment.json` - Complete assessment specification with all questions, explanations, levels, and benchmarks

**Models:**
- `src/app/models/assessment.ts` - Core TypeScript interfaces (AssessmentSpec, AssessmentQuestion, AssessmentDimension, etc.)
- `src/app/models/valuation-tiers.ts` - Valuation tier definitions

**Services:**
- `src/app/services/assessment.service.ts` - Loads and manages assessment spec
- `src/app/services/recommendation.service.ts` - Business logic for scoring, recommendations, threshold detection

**Pages:**
- `src/app/pages/home.ts` - Landing page
- `src/app/pages/assessment.ts` - Interactive assessment form
- `src/app/pages/report.ts` - Results and recommendations report

### Design Patterns

1. **Signals-based reactivity** - Angular 18+ signals for state management
2. **Standalone components** - No NgModules, all components are standalone
3. **Data-driven** - Assessment questions and explanations stored in JSON, not hardcoded
4. **Service-based business logic** - Complex calculations in services, not components
5. **Mobile-first responsive design** - Tailwind CSS utility classes, works on mobile and desktop

### Code Style

- Use TypeScript strict mode
- Prefer `const` over `let`, avoid `var`
- Use arrow functions for callbacks
- Use template literals for string interpolation
- Use optional chaining (`?.`) and nullish coalescing (`??`)
- Keep components focused on presentation, move logic to services
- Use computed signals for derived state

### Adding Features

When adding new features:
1. **Check existing patterns** - Follow established conventions in similar files
2. **Use British English** - All new text must use British spellings
3. **Update assessment.json** - Keep questions and explanations in JSON, not code
4. **Add to recommendation.service.ts** - Business logic goes in services
5. **Test thoroughly** - Verify builds succeed and functionality works end-to-end

### Common Tasks

**Adding a new question:**
1. Add question object to appropriate dimension in `public/assessment.json`
2. Include `explanations` array with 5 strings (one per level 0-4)
3. Question IDs follow pattern: `{domain-prefix}{number}` (e.g., `f7` for 7th financial question)

**Updating recommendations logic:**
1. Edit rules array in `src/app/services/recommendation.service.ts`
2. Add new rule conditions (domain_avg_lt, domain_avg_between, domain_avg_gte)
3. Ensure messages use British English

**Modifying UI:**
1. Edit component template (inline in `.ts` file)
2. Use Tailwind utility classes for styling
3. Follow existing colour scheme (primary: #3f1954, accent: #ed0776)
4. Ensure mobile responsiveness with Tailwind breakpoints (`md:`, `lg:`)
5. Use `flex-col md:flex-row` for layouts that stack on mobile
6. Ensure touch targets are minimum 44×44px for mobile usability

## Build and Deploy

**Development:**
```bash
npm install
ng serve
# Navigate to http://localhost:4200
```

**Production build:**
```bash
ng build
# Output to dist/ directory
```

**Deployment:**
- Static site deployment to Vercel (config in `vercel.json`)
- All routes redirect to index.html for client-side routing

## Important Notes

- **No server-side logic** - This is a pure client-side application
- **Data persistence** - Uses localStorage for saving/restoring responses
- **Export codes** - Base36-encoded obfuscated responses for easy sharing
- **Print-friendly report** - Report page has print media queries for clean PDF export
- **Mobile & desktop support** - CRITICAL: Application must work on both mobile and desktop. Use responsive Tailwind classes for all layouts. Test on 375px (mobile), 768px (tablet), and 1024px+ (desktop) viewports.
- **Accessibility** - Use semantic HTML and ARIA labels where appropriate

## References

- [Angular Documentation](https://angular.dev)
- [Tailwind CSS](https://tailwindcss.com)
- [TypeScript](https://www.typescriptlang.org)

---

**Remember: British English for ALL user-facing content and code identifiers!**
