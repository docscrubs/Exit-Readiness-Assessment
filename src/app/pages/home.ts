import { Component } from '@angular/core';
import { RouterLink } from '@angular/router';

@Component({
  selector: 'app-home-page',
  standalone: true,
  imports: [RouterLink],
  template: `
    <section class="relative isolate overflow-hidden">
      <div class="absolute inset-0 -z-10 opacity-60">
        <div class="absolute -top-24 -right-24 h-64 w-64 rounded-full bg-primary/10 blur-3xl"></div>
        <div class="absolute top-40 -left-16 h-72 w-72 rounded-full bg-accent/10 blur-3xl"></div>
      </div>
      <div class="container mx-auto px-6 py-16 lg:py-24">
        <div class="grid lg:grid-cols-2 gap-12 items-center">
          <div>
            <h1 class="text-4xl sm:text-5xl font-extrabold tracking-tight text-slate-900">
              SME Exit Readiness Assessment
            </h1>
            <p class="mt-6 text-lg text-slate-600 max-w-prose">
              Understand your business's readiness for exit across 6 critical domains. Get instant insights on where you stand, what gaps to close, and realistic timelines to transaction readiness. <strong>Transparency over perfection</strong> — understanding your gaps is more valuable than hiding them.
            </p>
            <div class="mt-8 flex items-center gap-4">
              <a routerLink="/assessment" class="btn btn-primary">Start assessment</a>
            </div>
            <div class="mt-8 grid grid-cols-2 sm:grid-cols-4 gap-4 text-center">
              <div class="rounded-lg border border-slate-200 bg-white p-4">
                <div class="text-3xl font-bold text-slate-900">6</div>
                <div class="text-xs uppercase tracking-wide text-slate-500">Domains</div>
              </div>
              <div class="rounded-lg border border-slate-200 bg-white p-4">
                <div class="text-3xl font-bold text-slate-900">36</div>
                <div class="text-xs uppercase tracking-wide text-slate-500">Questions</div>
              </div>
              <div class="rounded-lg border border-slate-200 bg-white p-4">
                <div class="text-3xl font-bold text-slate-900">5</div>
                <div class="text-xs uppercase tracking-wide text-slate-500">Levels</div>
              </div>
              <div class="rounded-lg border border-slate-200 bg-white p-4">
                <div class="text-3xl font-bold text-slate-900">30-60</div>
                <div class="text-xs uppercase tracking-wide text-slate-500">Minutes</div>
              </div>
            </div>
          </div>
          <div>
            <div class="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
              <div class="flex items-center justify-between">
                <h3 class="font-semibold text-slate-900">Exit Readiness Levels</h3>
                <span class="text-xs text-slate-500">Scale</span>
              </div>
              <ol class="mt-4 space-y-2">
                <li class="flex items-center gap-3">
                  <span class="h-2 w-2 rounded-full bg-red-600"></span>
                  <span class="text-slate-700"><strong>0:</strong> Incomplete</span>
                </li>
                <li class="flex items-center gap-3">
                  <span class="h-2 w-2 rounded-full bg-orange-500"></span>
                  <span class="text-slate-700"><strong>1:</strong> Initial</span>
                </li>
                <li class="flex items-center gap-3">
                  <span class="h-2 w-2 rounded-full bg-blue-500"></span>
                  <span class="text-slate-700"><strong>2:</strong> Defined</span>
                </li>
                <li class="flex items-center gap-3">
                  <span class="h-2 w-2 rounded-full bg-green-500"></span>
                  <span class="text-slate-700"><strong>3:</strong> Managed</span>
                </li>
                <li class="flex items-center gap-3">
                  <span class="h-2 w-2 rounded-full bg-emerald-600"></span>
                  <span class="text-slate-700"><strong>4:</strong> Optimised</span>
                </li>
              </ol>
              <div class="mt-6">
                <div class="h-3 w-full rounded-full bg-slate-100">
                  <div class="h-3 rounded-full bg-gradient-to-r from-red-600 via-orange-500 via-blue-500 via-green-500 to-emerald-600" style="width: 55%"></div>
                </div>
                <div class="mt-2 text-sm text-slate-600">Example: Level 2 (Defined) — Transaction-ready for trade sale</div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>

    <section class="container mx-auto px-6 pb-16 lg:pb-24">
      <div class="grid md:grid-cols-3 gap-6">
        <div class="card">
          <div class="card-icon bg-primary/10 text-primary">1</div>
          <h3 class="card-title">Answer honestly</h3>
          <p class="card-text">Rate 36 statements across 6 exit-critical domains on a 0–4 scale. Choose 0 for "incomplete/unknown" through 4 for "institutional-grade/transaction-ready." Each level explains what it means, helping you self-assess accurately. Transparency matters more than perfection — buyers will uncover gaps during due diligence anyway.</p>
        </div>
        <div class="card">
          <div class="card-icon bg-accent/10 text-accent">2</div>
          <h3 class="card-title">Understand your position</h3>
          <p class="card-text">Get instant scoring across Financial, Legal & Corporate, Commercial, Operational, People & Organisation, and ESG & Risk. See your current valuation tier (£1-3M, £3-8M, £8-20M, or £20M+), critical threshold violations, and realistic timeline to transaction readiness (months to years).</p>
        </div>
        <div class="card">
          <div class="card-icon bg-emerald-100 text-emerald-600">3</div>
          <h3 class="card-title">Build your roadmap</h3>
          <p class="card-text">Receive domain-specific recommendations prioritized by severity. Identify deal-blockers (Level 0), critical gaps (below thresholds), and opportunities to elevate valuation tier. Get actionable next steps with realistic timelines for improvement.</p>
        </div>
      </div>
    </section>
  `
})
export class HomePageComponent {}
