import { Component, OnInit, computed, inject, signal } from '@angular/core';
import { Router, RouterLink } from '@angular/router';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { AssessmentLevel, AssessmentSpec, Responses } from '../models/assessment';
import { AssessmentService } from '../services/assessment.service';
import { RadarComponent } from '../components/radar';
import { RecommendationService } from '../services/recommendation.service';

@Component({
  selector: 'app-assessment-page',
  standalone: true,
  imports: [CommonModule, RouterLink, RadarComponent, FormsModule],
  template: `
    <section class="container mx-auto px-6 py-10 lg:py-12">
      <div class="mb-8 flex items-start justify-between gap-6">
        <div>
          <h1 class="text-3xl font-bold text-slate-900">SME Exit Readiness Assessment</h1>
          <div class="mt-2 text-slate-600 max-w-prose" >
            Assess your organisation's readiness for exit across 6 critical domains. Each domain is rated 0–4: Incomplete, Initial, Defined, Managed, Optimised. This takes 30-60 minutes and provides instant feedback on gaps, critical thresholds, and timeline to transaction readiness.
            <br />
            Based on the SME Sale Readiness Framework, covering Financial, Legal & Corporate, Commercial, Operational, People & Organisation, and ESG & Risk.
           <br />
            <span class="font-bold">If you don't understand a question or it doesn't apply, choose 0. You'll receive a code to save and restore your answers anytime.</span>

            <div class="mt-4">
              <div class="flex flex-col sm:flex-row sm:items-center">
                <input [(ngModel)]="importCode" placeholder="Enter code to restore saved answers" class="input flex-1 sm:max-w-md rounded-lg h-10 px-3" />
                <div class="flex gap-2 mt-3 sm:mt-0 sm:ml-3">
                  <button class="btn btn-primary h-10" (click)="restoreFromCode(importCode)">Load code</button>
                  <button class="btn btn-outline h-10" (click)="clearImportCode()">Clear</button>
                </div>
              </div>

              <div *ngIf="restoreToast()" class="mt-3">
                <div class="inline-flex items-center gap-3 rounded-md bg-slate-50 border px-3 py-2" [ngStyle]="{ 'border-color': primaryColor }">
                  <svg class="h-5 w-5 text-slate-700" viewBox="0 0 20 20" fill="none" xmlns="http://www.w3.org/2000/svg"><circle cx="10" cy="10" r="9" stroke="currentColor" stroke-opacity="0.12"/><path d="M7 10l2 2 4-4" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"/></svg>
                  <div class="text-sm font-medium text-slate-800">{{ restoreToast()?.text }}</div>
                </div>
              </div>
            </div>
          </div>
        </div>
        <a routerLink="/" class="btn btn-secondary">Back to home</a>
      </div>

      <ng-container *ngIf="spec() as s; else loading">

        <!-- Sector & Lifecycle Selection Section -->
        <div class="mt-6 rounded-xl border border-slate-200 bg-white p-6">
          <h3 class="font-semibold text-slate-900 mb-4">Sector & Lifecycle Stage <span class="text-red-600">*</span></h3>
          <p class="text-sm text-slate-600 mb-4">Select your sector and lifecycle stage to receive tailored benchmarking in your report. <strong class="text-red-600">Both fields are required.</strong></p>

          <div class="grid md:grid-cols-2 gap-4">
            <div>
              <label for="sector-select" class="block text-sm font-medium text-slate-700 mb-2">Select your sector <span class="text-red-600">*</span></label>
              <select
                id="sector-select"
                class="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                [(ngModel)]="sectorModel">
                <option value="">-- Select a sector --</option>
                <option *ngFor="let sector of availableSectors()" [value]="sector.id">{{ sector.name }}</option>
              </select>
            </div>
            <div>
              <label for="lifecycle-select" class="block text-sm font-medium text-slate-700 mb-2">Select your lifecycle stage <span class="text-red-600">*</span></label>
              <select
                id="lifecycle-select"
                class="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                [(ngModel)]="lifecycleModel">
                <option value="">-- Select a stage --</option>
                <option *ngFor="let phase of availableLifecyclePhases()" [value]="phase.id">{{ phase.name }} ({{ phase.valuationRange }})</option>
              </select>
            </div>
          </div>
        </div>

        <div class="mt-8 grid lg:grid-cols-2 gap-6">
          <div class="space-y-6">
            <div *ngFor="let dim of s.dimensions" class="rounded-xl border border-slate-200 bg-white p-5">
              <div class="mb-3 flex items-center justify-between">
                <h2 class="font-semibold text-slate-900">{{ dim.name }}</h2>
                <span class="text-xs text-slate-500">{{ dim.questions.length }} items</span>
              </div>
              <ol class="space-y-4">
                <li *ngFor="let q of dim.questions" class="rounded-lg border border-slate-100 bg-slate-50 p-4">
                  <div class="text-sm text-slate-800">{{ q.text }}</div>
                  <div class="mt-3 flex flex-wrap gap-2">
                    <button
                      *ngFor="let v of scaleValues()"
                      type="button"
                      (click)="setResponse(q.id, v)"
                      [class.btn-selected]="responses()[q.id] === v"
                      class="btn btn-choice"
                    >
                      {{ v }}
                    </button>
                  </div>
                  <div class="mt-2 text-xs text-slate-500" *ngIf="responses()[q.id] !== undefined">Selected: {{ labelFor(responses()[q.id]) }}</div>
                  <div class="mt-3 text-sm text-slate-600" *ngIf="responses()[q.id] !== undefined">
                    <strong>This means:</strong>&nbsp;{{ explanationFor(q.id, responses()[q.id]) }}
                  </div>
                </li>
              </ol>
            </div>
          </div>
          <div class="space-y-6">
            <div class="rounded-xl border border-slate-200 bg-white p-6">
              <h3 class="font-semibold text-slate-900">Your results</h3>
              <p class="mt-1 text-sm text-slate-600">Scores update as you answer.</p>

              <div class="mt-4">
                <app-radar [labels]="dimensionLabels()" [values]="dimensionAverages()" [max]="s.scale.max" [strokeColor]="primaryColor" [fillColor]="accentColor"></app-radar>
              </div>

              <div class="mt-4 space-y-3">
                <div *ngFor="let dim of s.dimensions" class="">
                  <div class="flex items-center justify-between text-sm">
                    <span class="text-slate-700">{{ dim.name }}</span>
                    <span class="font-medium text-slate-900">{{ dimScore(dim.id) | number:'1.0-2' }} / {{ s.scale.max }}</span>
                  </div>
                  <div class="mt-1 h-2 w-full rounded-full bg-slate-100">
                    <div class="h-2 rounded-full bg-secondary" [style.width.%]="(dimScore(dim.id) / s.scale.max) * 100"></div>
                  </div>
                </div>
              </div>

              <div class="mt-6 rounded-lg border border-slate-200 p-4">
                <div class="flex items-center justify-between">
                  <div>
                    <div class="text-xs uppercase tracking-wide text-slate-500">Overall</div>
                    <div class="text-2xl font-bold text-slate-900">{{ overallPercent() | number:'1.0-1' }}%</div>
                  </div>
                  <div class="text-right">
                    <div class="text-xs uppercase tracking-wide text-slate-500">Level</div>
                    <div class="font-semibold" [ngStyle]="{ color: levelColor(overallLevel()) }">{{ overallLevel()?.name || '—' }}</div>
                  </div>
                </div>
                <div class="mt-4 h-2 w-full rounded-full bg-slate-100">
                  <div class="h-2 rounded-full" [ngStyle]="{ width: (overallScore() / s.scale.max) * 100 + '%', background: levelGradient() }"></div>
                </div>
              </div>

              <div class="mt-4 flex gap-3">
                <button class="btn btn-primary flex-1" (click)="exportCSV()">Export CSV</button>
                <button class="btn btn-secondary" (click)="clearResponses()">Clear</button>
              </div>

              <button class="btn btn-primary w-full mt-4" [disabled]="answeredCount() < totalCount()" (click)="finalize()">Finalise and view recommendations</button>
              <div class="mt-2 text-xs text-slate-500" *ngIf="answeredCount() < totalCount()">Answer all items to unlock recommendations.</div>

              <!-- Validation error message for missing sector/lifecycle -->
              <div *ngIf="validationError()" class="mt-3">
                <div class="rounded-md bg-red-50 border border-red-200 px-4 py-3">
                  <div class="flex items-start">
                    <svg class="h-5 w-5 text-red-600 mt-0.5 mr-2 flex-shrink-0" viewBox="0 0 20 20" fill="currentColor" xmlns="http://www.w3.org/2000/svg">
                      <path fill-rule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clip-rule="evenodd"/>
                    </svg>
                    <div class="text-sm font-medium text-red-800">{{ validationError() }}</div>
                  </div>
                </div>
              </div>
            </div>

            <div *ngIf="showTips()" class="rounded-xl border border-slate-200 bg-white p-6">
              <h3 class="font-semibold text-slate-900">Recommendations</h3>
              <ul class="mt-2 list-disc pl-5 text-slate-700 space-y-2">
                <li *ngFor="let tip of recommendations()">{{ tip }}</li>
              </ul>
            </div>
          </div>
        </div>
      </ng-container>

      <ng-template #loading>
        <div class="py-24 text-center text-slate-600">Loading assessment…</div>
      </ng-template>
    </section>
  `,
  styles: [``]
})
export class AssessmentPageComponent implements OnInit {
  private svc = inject(AssessmentService);
  private router = inject(Router);
  private recSvc = inject(RecommendationService);

  spec = signal<AssessmentSpec | null>(null);
  responses = signal<Responses>({});
  showTips = signal(false);

  primaryColor = '#3f1954';
  accentColor = '#ed0776';

  importCode = '';
  restoreToast = signal<{ text: string } | null>(null);
  validationError = signal<string | null>(null);

  // Sector and lifecycle selections for encoding in export code
  selectedSector = signal<string>('');
  selectedLifecycle = signal<string>('');

  availableSectors = computed(() => {
    const spec = this.spec();
    return spec ? this.recSvc.getAvailableSectors(spec) : [];
  });

  availableLifecyclePhases = computed(() => {
    const spec = this.spec();
    return spec ? this.recSvc.getAvailableLifecyclePhases(spec) : [];
  });

  // Getter/setter properties for ngModel binding
  get sectorModel(): string {
    return this.selectedSector();
  }
  set sectorModel(value: string) {
    this.onSectorChange(value);
  }

  get lifecycleModel(): string {
    return this.selectedLifecycle();
  }
  set lifecycleModel(value: string) {
    this.onLifecycleChange(value);
  }

  // encoding constants (primes)
  private readonly CODE_MUL = 15485863n;
  private readonly CODE_OFF = 32452843n;

  clearImportCode() { this.importCode = ''; }

  generateCode(): string {
    const s = this.spec();
    if (!s) return '';
    // gather answers in spec order
    const answers: number[] = [];
    for (const d of s.dimensions) for (const q of d.questions) answers.push(this.responses()[q.id] ?? 0);

    // Encode sector selection (find index in available sectors, or 0 if not selected)
    const sectors = this.availableSectors();
    const sectorIndex = this.selectedSector() ? sectors.findIndex(sec => sec.id === this.selectedSector()) : -1;
    const sectorValue = sectorIndex >= 0 ? sectorIndex + 1 : 0; // 0 = none, 1+ = sector index+1

    // Encode lifecycle selection (find index in available phases, or 0 if not selected)
    const phases = this.availableLifecyclePhases();
    const lifecycleIndex = this.selectedLifecycle() ? phases.findIndex(ph => ph.id === this.selectedLifecycle()) : -1;
    const lifecycleValue = lifecycleIndex >= 0 ? lifecycleIndex + 1 : 0; // 0 = none, 1+ = phase index+1

    // pack in base-5 for questions
    let acc = 0n;
    for (const v of answers) { acc = acc * 5n + BigInt(v); }
    // Append sector and lifecycle (use base matching the max possible values)
    acc = acc * BigInt(sectors.length + 1) + BigInt(sectorValue);
    acc = acc * BigInt(phases.length + 1) + BigInt(lifecycleValue);

    // obfuscate
    const obf = acc * this.CODE_MUL + this.CODE_OFF;
    const checksum = Number(obf % 36n);
    const main = this.bigIntToBase36(obf);
    const code = (main + checksum.toString(36)).toUpperCase();
    return code;
  }

  // convert BigInt to base36 string
  private bigIntToBase36(n: bigint) {
    if (n === 0n) return '0';
    const chars = [];
    let v = n < 0n ? -n : n;
    while (v > 0n) {
      const d = Number(v % 36n);
      chars.push(d.toString(36));
      v = v / 36n;
    }
    return chars.reverse().join('');
  }

  private base36ToBigInt(str: string) {
    let r = 0n;
    for (const ch of str) {
      const d = BigInt(parseInt(ch, 36));
      r = r * 36n + d;
    }
    return r;
  }

  restoreFromCode(code: string) {
    if (!code) return;
    try {
      code = code.trim().toUpperCase();
      const chkChar = code.slice(-1);
      const main = code.slice(0, -1);
      const obf = this.base36ToBigInt(main);
      const chk = Number(obf % 36n);
      if (chk !== parseInt(chkChar, 36)) { this.showRestoreToast('Invalid code'); return; }
      if ((obf - this.CODE_OFF) % this.CODE_MUL !== 0n) { this.showRestoreToast('Invalid code'); return; }
      let acc = (obf - this.CODE_OFF) / this.CODE_MUL;
      const s = this.spec();
      if (!s) { this.showRestoreToast('Spec not loaded'); return; }

      // Decode lifecycle (least significant)
      const phases = this.availableLifecyclePhases();
      const lifecycleValue = Number(acc % BigInt(phases.length + 1));
      acc = acc / BigInt(phases.length + 1);

      // Decode sector
      const sectors = this.availableSectors();
      const sectorValue = Number(acc % BigInt(sectors.length + 1));
      acc = acc / BigInt(sectors.length + 1);

      // Decode question responses
      const total = s.dimensions.reduce((a, d) => a + d.questions.length, 0);
      const vals: number[] = [];
      for (let i = 0; i < total; i++) {
        const v = Number(acc % 5n);
        vals.push(v);
        acc = acc / 5n;
      }
      // vals are least-significant first -> reverse
      vals.reverse();

      // map back to responses
      const newResp: Responses = { ...this.responses() };
      let idx = 0;
      for (const d of s.dimensions) {
        for (const q of d.questions) {
          newResp[q.id] = vals[idx++] ?? 0;
        }
      }
      this.responses.set(newResp);

      // Restore sector and lifecycle selections
      if (sectorValue > 0 && sectorValue <= sectors.length) {
        const sector = sectors[sectorValue - 1];
        this.selectedSector.set(sector.id);
        localStorage.setItem('exit-readiness:selectedSector', sector.id);
      } else {
        this.selectedSector.set('');
        localStorage.removeItem('exit-readiness:selectedSector');
      }

      if (lifecycleValue > 0 && lifecycleValue <= phases.length) {
        const phase = phases[lifecycleValue - 1];
        this.selectedLifecycle.set(phase.id);
        localStorage.setItem('exit-readiness:selectedLifecycle', phase.id);
      } else {
        this.selectedLifecycle.set('');
        localStorage.removeItem('exit-readiness:selectedLifecycle');
      }

      this.saveResponses();
      this.showRestoreToast('Responses restored');
    } catch (e) {
      this.showRestoreToast('Invalid code');
    }
  }

  ngOnInit(): void {
    this.svc.load().subscribe((spec) => {
      this.spec.set(spec);
      // Initialize all responses to 0 so every question is selected as 0 by default.
      this.initializeResponsesToZero();

      // Load saved sector and lifecycle selections from localStorage
      try {
        const savedSector = localStorage.getItem('exit-readiness:selectedSector');
        const savedLifecycle = localStorage.getItem('exit-readiness:selectedLifecycle');
        if (savedSector) this.selectedSector.set(savedSector);
        if (savedLifecycle) this.selectedLifecycle.set(savedLifecycle);
      } catch (e) { /* ignore */ }
    });
  }

  showRestoreToast(text: string) {
    this.restoreToast.set({ text });
    setTimeout(() => this.restoreToast.set(null), 3000);
  }

  initializeResponsesToZero() {
    const s = this.spec();
    if (!s) return;
    const initial: Responses = {};
    for (const d of s.dimensions) {
      for (const q of d.questions) {
        initial[q.id] = 0;
      }
    }
    this.responses.set(initial);
  }

  storageKey() { return `exit-readiness:${this.spec()?.title ?? 'default'}`; }

  // Restore saved responses only when the user requests it
  restoreResponses() {
    try {
      const raw = localStorage.getItem(this.storageKey());
      if (raw) this.responses.set(JSON.parse(raw));
    } catch (e) { /* ignore */ }
  }

  saveResponses() {
    try {
      localStorage.setItem(this.storageKey(), JSON.stringify(this.responses()));
    } catch (e) { /* ignore */ }
  }

  clearResponses() {
    // Reset all responses back to 0 for every question
    this.initializeResponsesToZero();
    try { localStorage.removeItem(this.storageKey()); } catch (e) {}
  }

  hasSavedResponses() {
    try { return !!localStorage.getItem(this.storageKey()); } catch (e) { return false; }
  }

  scaleValues() {
    const s = this.spec();
    if (!s) return [] as number[];
    return Array.from({ length: s.scale.max - s.scale.min + 1 }, (_, i) => s.scale.min + i);
  }

  labelFor(value: number) {
    const s = this.spec();
    if (!s) return String(value);
    const idx = value - s.scale.min;
    return s.scale.labels[idx] ?? String(value);
  }

  setResponse(qid: string, value: number) {
    this.responses.update((r) => ({ ...r, [qid]: value }));
    this.saveResponses();
  }

  totalCount = computed(() => this.spec()?.dimensions.reduce((acc, d) => acc + d.questions.length, 0) ?? 0);
  answeredCount = computed(() => Object.keys(this.responses()).length);
  progressPct = computed(() => (this.totalCount() ? (this.answeredCount() / this.totalCount()) * 100 : 0));

  dimScore = (dimId: string) => {
    const s = this.spec();
    if (!s) return 0;
    const dim = s.dimensions.find((d) => d.id === dimId);
    if (!dim) return 0;
    const values = dim.questions.map((q) => this.responses()[q.id]).filter((v): v is number => typeof v === 'number');
    if (!values.length) return 0;
    const avg = values.reduce((a, b) => a + b, 0) / values.length;
    return avg;
  };

  dimensionAverages() {
    const s = this.spec();
    if (!s) return [] as number[];
    return s.dimensions.map(d => this.dimScore(d.id));
  }

  dimensionLabels() {
    const s = this.spec();
    if (!s) return [] as string[];
    return s.dimensions.map(d => d.name);
  }

  explanationFor(qid: string, value: number) {
    const s = this.spec();
    if (!s) return '';
    // Find the question in the spec
    for (const dim of s.dimensions) {
      const question = dim.questions.find(q => q.id === qid);
      if (question && question.explanations) {
        return question.explanations[value] ?? '';
      }
    }
    return '';
  }

  overallScore = computed(() => {
    const s = this.spec();
    if (!s) return 0;
    const weights = s.dimensions.map((d) => d.weight ?? 1);
    const totalW = weights.reduce((a, b) => a + b, 0);
    const sum = s.dimensions.reduce((acc, d) => acc + this.dimScore(d.id) * (d.weight ?? 1), 0);
    return totalW ? sum / totalW : 0;
  });

  // Overall as percentage (0 - 100)
  overallPercent = computed(() => {
    const s = this.spec();
    if (!s) return 0;
    const max = s.scale.max;
    const score = this.overallScore();
    return max ? (score / max) * 100 : 0;
  });

  overallLevel = computed<AssessmentLevel | null>(() => {
    const s = this.spec();
    if (!s) return null;
    const score = this.overallScore();
    // find matching level
    return s.levels.find((lvl) => score >= lvl.min && score < lvl.max) ?? s.levels[s.levels.length - 1] ?? null;
  });

  levelColor(lvl: AssessmentLevel | null) {
    return lvl?.color ?? '#334155';
  }

  levelGradient() {
    const s = this.spec();
    if (!s) return `linear-gradient(90deg, #e11d48, #f59e0b, ${this.primaryColor}, ${this.accentColor})`;
    const stops = s.levels.map((l) => l.color).join(', ');
    return `linear-gradient(90deg, ${stops})`;
  }

  finalize() {
    // Validate that sector and lifecycle are selected
    if (!this.selectedSector() || !this.selectedLifecycle()) {
      this.validationError.set('Please select both a sector and lifecycle stage before viewing recommendations.');
      // Auto-hide the error after 5 seconds
      setTimeout(() => this.validationError.set(null), 5000);
      return;
    }

    // Clear any validation errors
    this.validationError.set(null);

    // allow report viewing once
    try { localStorage.setItem('exit-readiness:canViewReport', '1'); } catch (e) {}
    this.showTips.set(true);
    this.router.navigate(['/report']);
  }

  recommendations = computed(() => {
    const s = this.spec();
    if (!s) return [] as string[];
    return this.recSvc.computeRecommendations(s, this.responses());
  });

  exportCSV() {
    const s = this.spec();
    if (!s) return;
    const rows: string[] = [];
    rows.push(['domain','questionId','questionText','score'].join(','));
    for (const d of s.dimensions) {
      for (const q of d.questions) {
        const score = this.responses()[q.id];
        rows.push([`"${d.name}"`, q.id, `"${q.text.replace(/"/g,'""')}"`, typeof score === 'number' ? score : ''].join(','));
      }
    }
    const blob = new Blob([rows.join('\n')], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${s.title.replace(/\s+/g,'_')}_responses.csv`;
    a.click();
    URL.revokeObjectURL(url);
  }

  onSectorChange(value: string) {
    this.selectedSector.set(value);
    try {
      if (value) {
        localStorage.setItem('exit-readiness:selectedSector', value);
      } else {
        localStorage.removeItem('exit-readiness:selectedSector');
      }
    } catch (e) { /* ignore */ }
  }

  onLifecycleChange(value: string) {
    this.selectedLifecycle.set(value);
    try {
      if (value) {
        localStorage.setItem('exit-readiness:selectedLifecycle', value);
      } else {
        localStorage.removeItem('exit-readiness:selectedLifecycle');
      }
    } catch (e) { /* ignore */ }
  }
}
