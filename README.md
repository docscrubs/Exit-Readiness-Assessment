# SME Exit Readiness Assessment

A comprehensive web-based assessment tool to help Small and Medium-sized Enterprise (SME) owners evaluate their business's readiness for exit (sale, acquisition, merger, etc.) across 6 critical domains.

## Overview

This application provides:
- **36 questions** across 6 exit-critical domains
- **5 maturity levels** (0: Incomplete → 4: Optimised)
- **Instant feedback** on gaps, critical thresholds, and timeline to transaction readiness
- **Valuation tier assessment** (£1-3M, £3-8M, £8-20M, £20M+)
- **Threshold violation detection** for deal-blockers
- **Sector benchmarking** with radar chart overlay
- **Code-based save/restore** for easy sharing and tracking
- **Print-friendly reports** for stakeholder presentations

## Features

### 6 Assessment Domains

1. **Financial** - Financial records, reporting, EBITDA, tax compliance
2. **Legal & Corporate** - Corporate structure, contracts, IP, compliance
3. **Commercial** - Customer concentration, revenue quality, market position
4. **Operational** - Process documentation, IT systems, scalability
5. **People & Organisation** - Employment contracts, management depth, retention
6. **ESG & Risk** - Health & Safety, data protection, risk management

### Advanced Reporting

- **Critical Threshold Detection**: Identifies Level 0 blockers and violations in Financial, Legal, and People domains
- **Valuation Tier Comparison**: Compares current readiness against 3 valuation tiers with gap analysis
- **Timeline Guidance**: Provides realistic timelines (months to years) based on current maturity
- **Sector Benchmarking**: Compare your scores against sector baselines
- **Actionable Recommendations**: Prioritised improvement roadmap

### Mobile & Desktop Support

Fully responsive design works seamlessly on:
- Mobile devices (375px+)
- Tablets (768px+)
- Desktop (1024px+)

## Technology Stack

- **Angular 18+** - Standalone components with signals-based reactivity
- **TypeScript** - Type-safe development
- **Tailwind CSS** - Utility-first responsive styling
- **Chart.js** - Interactive radar charts
- **Vercel** - Static site hosting with SPA routing

## Getting Started

### Prerequisites

- Node.js 18+ and npm
- Modern web browser (Chrome, Firefox, Safari, Edge)

### Installation

```bash
# Clone the repository
git clone <repository-url>
cd Exit-Readiness-Assessment

# Install dependencies
npm install
```

### Development

```bash
# Start development server
npm start
# or
npx ng serve

# Navigate to http://localhost:4200
```

The application will automatically reload when you modify source files.

### Building for Production

```bash
# Create production build
npm run build

# Output will be in dist/exit-readiness-assessment/browser
```

### Testing Production Build Locally

```bash
# Build first
npm run build

# Serve the production build
npx serve dist/exit-readiness-assessment/browser

# Navigate to http://localhost:3000
```

## Deployment

This application is configured for deployment to Vercel with automatic SPA routing.

### Deploy to Vercel (Recommended)

#### Option A: Vercel CLI

```bash
# Install Vercel CLI
npm i -g vercel

# Login to Vercel
vercel login

# Deploy
vercel

# Deploy to production
vercel --prod
```

#### Option B: Git Integration (Recommended)

1. Push code to GitHub repository
2. Import repository in Vercel dashboard
3. Configure build settings (auto-detected for Angular)
4. Deploy automatically on push to main branch

See [DEPLOYMENT.md](./DEPLOYMENT.md) for detailed deployment instructions.

## Project Structure

```
src/
├── app/
│   ├── components/       # Reusable UI components (radar chart, etc.)
│   ├── models/           # TypeScript interfaces and types
│   ├── pages/            # Page components (home, assessment, report)
│   ├── services/         # Business logic services
│   └── app.ts            # Root component
├── public/
│   └── assessment.json   # Assessment specification data
└── index.html
```

## Key Files

- **public/assessment.json** - Complete assessment specification with all questions, explanations, and benchmarks
- **src/app/models/assessment.ts** - Core TypeScript interfaces
- **src/app/models/valuation-tiers.ts** - Valuation tier definitions
- **src/app/services/assessment.service.ts** - Loads and manages assessment spec
- **src/app/services/recommendation.service.ts** - Business logic for scoring and recommendations
- **src/app/pages/home.ts** - Landing page
- **src/app/pages/assessment.ts** - Interactive assessment form
- **src/app/pages/report.ts** - Results and recommendations report

## Usage

1. **Start Assessment**: Click "Start assessment" on the home page
2. **Answer Questions**: Rate 36 statements on a 0-4 scale across 6 domains
3. **View Results**: See instant feedback with radar chart, scores, and recommendations
4. **Save Progress**: Generate a code to save and restore your answers anytime
5. **Print Report**: Export a print-friendly PDF for stakeholder review

### Code-Based Save/Restore

The application generates a compact alphanumeric code representing your answers:
- Enter the code on the assessment page to restore previous answers
- Share the code to transfer assessments between devices
- No server-side storage required - all data stays in your browser

## Content Updates

To update assessment questions or guidance:
- Edit **public/assessment.json** for questions, levels, and benchmarks
- See [CONTENT-UPDATE-GUIDE.md](./CONTENT-UPDATE-GUIDE.md) for detailed instructions

## Architecture

See [ARCHITECTURE.md](./ARCHITECTURE.md) for:
- Technology stack details
- Application structure
- Data flow
- State management
- Code generation algorithm
- Responsive design approach

## British English

All user-facing text uses British English spelling conventions:
- organisation (not organization)
- optimised (not optimized)
- colour (not color)
- behaviour (not behavior)

## License

Copyright © 2026 SME Exit Readiness Assessment

## Support

For issues or questions, please open an issue in the GitHub repository.

## Acknowledgements

Based on the SME Sale Readiness Framework covering Financial, Legal & Corporate, Commercial, Operational, People & Organisation, and ESG & Risk domains.
