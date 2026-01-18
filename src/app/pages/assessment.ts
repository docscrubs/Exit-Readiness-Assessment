import { Component, OnInit, computed, inject, signal } from '@angular/core';
import { Router, RouterLink } from '@angular/router';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { AssessmentLevel, AssessmentSpec, Responses } from '../models/assessment';
import { AssessmentService } from '../services/assessment.service';
import { RadarComponent } from '../components/radar';
import { RecommendationService } from '../services/recommendation.service';
import {
  BusinessType,
  CustomerConcentration,
  GrowthTrend,
  ValuationInputs,
  getDefaultValuationInputs,
  BUSINESS_TYPE_LABELS,
  GROWTH_TREND_LABELS,
  CUSTOMER_CONCENTRATION_LABELS,
} from '../models/valuation';
import { ValuationService } from '../services/valuation.service';

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

        <!-- Valuation Data Section (Optional, Collapsible) -->
        <div class="mt-6 rounded-xl border border-slate-200 bg-white overflow-hidden shadow-sm">
          <!-- Collapsed Header (clickable) -->
          <button
            type="button"
            (click)="toggleValuationSection()"
            class="w-full p-6 flex items-center justify-between text-left hover:bg-slate-50 transition-colors"
            [ngClass]="{'bg-gradient-to-r from-purple-50 to-white': valuationSectionExpanded()}">
            <div class="flex-1">
              <div class="flex items-center gap-2">
                <h3 class="font-semibold text-slate-900">Financial Data for Valuation</h3>
                <span class="text-xs px-2 py-0.5 rounded-full bg-purple-100 text-purple-700 font-medium">Optional</span>
              </div>
              <p class="text-sm text-slate-600 mt-1">
                {{ valuationSectionExpanded() ? 'Provide financial data to receive an indicative valuation range in your report.' : 'Complete this section to receive an indicative valuation range in your report.' }}
              </p>
            </div>
            <svg
              class="w-5 h-5 text-purple-600 transition-transform flex-shrink-0 ml-4"
              [class.rotate-180]="valuationSectionExpanded()"
              fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 9l-7 7-7-7" />
            </svg>
          </button>

          <!-- Expanded Content -->
          <div *ngIf="valuationSectionExpanded()" class="px-6 pb-6 border-t border-purple-100">
            <!-- Info Banner -->
            <div class="mt-4 bg-gradient-to-r from-blue-50 to-indigo-50 border border-blue-200 rounded-lg p-4">
              <div class="flex items-start gap-3">
                <svg class="w-5 h-5 text-blue-600 flex-shrink-0 mt-0.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                <p class="text-sm text-blue-800">
                  These inputs are <strong>optional</strong>. Without them, your assessment will still provide exit readiness insights, but no valuation estimate will be shown.
                  All values should be in GBP (£). You can enter either EBITDA or Profit figures - they will be treated equivalently.
                </p>
              </div>
            </div>

            <!-- Business Type Selection -->
            <div class="mt-6">
              <label class="block text-sm font-medium text-slate-700 mb-3">Type of Business</label>
              <p class="text-xs text-slate-500 mb-3">This determines the base valuation multiple range (separate from your sector selection above).</p>
              <div class="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <button
                  type="button"
                  *ngFor="let bt of businessTypes; let btIdx = index"
                  [attr.tabindex]="100 + btIdx"
                  (click)="setBusinessType(bt.value)"
                  (keydown.enter)="setBusinessType(bt.value)"
                  (keydown.space)="setBusinessType(bt.value); $event.preventDefault()"
                  class="px-4 py-3 rounded-lg border-2 text-sm font-medium transition-all focus:outline-none focus:ring-2 focus:ring-purple-500 focus:ring-offset-2"
                  [ngClass]="{
                    'border-purple-600 bg-purple-50 text-purple-700 shadow-sm': valuationInputs().businessType === bt.value,
                    'border-slate-200 bg-white text-slate-700 hover:border-purple-300 hover:bg-purple-50/50': valuationInputs().businessType !== bt.value
                  }">
                  {{ bt.label }}
                </button>
              </div>
            </div>

            <!-- Historical Financials -->
            <div class="mt-6 p-4 bg-slate-50 rounded-lg border border-slate-200">
              <h4 class="text-sm font-semibold text-slate-800 mb-2 flex items-center gap-2">
                <svg class="w-4 h-4 text-slate-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                Historical Financials (Completed Years)
              </h4>
              <p class="text-xs text-slate-500 mb-4">Enter data for completed financial years. Leave blank if not available.</p>
              <div class="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div *ngFor="let yearData of valuationInputs().historicalFinancials; let i = index" class="bg-white p-3 rounded-lg border border-slate-200 space-y-2">
                  <div class="text-xs font-semibold text-slate-700 text-center py-1 bg-slate-100 rounded">{{ getHistoricalYear(i) }}</div>
                  <div>
                    <label class="block text-xs text-slate-500 mb-1">Turnover (£)</label>
                    <input
                      type="text"
                      inputmode="numeric"
                      placeholder="e.g., 1,500,000"
                      [attr.tabindex]="110 + i"
                      [value]="formatNumberForDisplay(yearData.turnover)"
                      (blur)="setHistoricalTurnover(i, $event)"
                      (keydown.enter)="focusNextInput($event)"
                      class="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm focus:ring-2 focus:ring-purple-500 focus:border-purple-500 transition-colors" />
                  </div>
                  <div>
                    <label class="block text-xs text-slate-500 mb-1">EBITDA/Profit (£)</label>
                    <input
                      type="text"
                      inputmode="numeric"
                      placeholder="e.g., 300,000"
                      [attr.tabindex]="113 + i"
                      [value]="formatNumberForDisplay(yearData.ebitda)"
                      (blur)="setHistoricalEbitda(i, $event)"
                      (keydown.enter)="focusNextInput($event)"
                      class="w-full px-3 py-2 border rounded-lg text-sm focus:ring-2 focus:ring-purple-500 focus:border-purple-500 transition-colors"
                      [ngClass]="getEbitdaValidationClass(i, 'historical')" />
                    <div *ngIf="getValidationError(i, 'historical')" class="mt-1 text-xs text-red-600 flex items-center gap-1">
                      <svg class="w-3 h-3" fill="currentColor" viewBox="0 0 20 20"><path fill-rule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clip-rule="evenodd"/></svg>
                      {{ getValidationError(i, 'historical') }}
                    </div>
                  </div>
                </div>
              </div>
            </div>

            <!-- Forecast Financials -->
            <div class="mt-4 p-4 bg-gradient-to-br from-green-50 to-emerald-50 rounded-lg border border-green-200">
              <h4 class="text-sm font-semibold text-slate-800 mb-2 flex items-center gap-2">
                <svg class="w-4 h-4 text-green-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" />
                </svg>
                Forecast Financials (Current &amp; Future Years)
              </h4>
              <p class="text-xs text-slate-500 mb-4">Enter your projections. Include current year if not yet complete.</p>
              <div class="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div *ngFor="let yearData of valuationInputs().forecastFinancials; let i = index" class="bg-white p-3 rounded-lg border border-green-200 space-y-2">
                  <div class="text-xs font-semibold text-green-700 text-center py-1 bg-green-100 rounded">{{ getForecastYear(i) }}{{ i === 0 ? ' (Current)' : '' }}</div>
                  <div>
                    <label class="block text-xs text-slate-500 mb-1">Turnover (£)</label>
                    <input
                      type="text"
                      inputmode="numeric"
                      placeholder="e.g., 2,000,000"
                      [attr.tabindex]="116 + i"
                      [value]="formatNumberForDisplay(yearData.turnover)"
                      (blur)="setForecastTurnover(i, $event)"
                      (keydown.enter)="focusNextInput($event)"
                      class="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm focus:ring-2 focus:ring-green-500 focus:border-green-500 transition-colors" />
                  </div>
                  <div>
                    <label class="block text-xs text-slate-500 mb-1">EBITDA/Profit (£)</label>
                    <input
                      type="text"
                      inputmode="numeric"
                      placeholder="e.g., 400,000"
                      [attr.tabindex]="119 + i"
                      [value]="formatNumberForDisplay(yearData.ebitda)"
                      (blur)="setForecastEbitda(i, $event)"
                      (keydown.enter)="focusNextInput($event)"
                      class="w-full px-3 py-2 border rounded-lg text-sm focus:ring-2 focus:ring-green-500 focus:border-green-500 transition-colors"
                      [ngClass]="getEbitdaValidationClass(i, 'forecast')" />
                    <div *ngIf="getValidationError(i, 'forecast')" class="mt-1 text-xs text-red-600 flex items-center gap-1">
                      <svg class="w-3 h-3" fill="currentColor" viewBox="0 0 20 20"><path fill-rule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clip-rule="evenodd"/></svg>
                      {{ getValidationError(i, 'forecast') }}
                    </div>
                  </div>
                </div>
              </div>
            </div>

            <!-- Debt/Liabilities -->
            <div class="mt-6">
              <label class="block text-sm font-medium text-slate-700 mb-2">Total Debt/Liabilities (£)</label>
              <p class="text-xs text-slate-500 mb-2">Include all loans, overdrafts, and finance leases. Used to convert Enterprise Value to Equity Value.</p>
              <input
                type="text"
                inputmode="numeric"
                placeholder="e.g., 250,000"
                [attr.tabindex]="122"
                [value]="formatNumberForDisplay(valuationInputs().totalDebt)"
                (blur)="setTotalDebt($event)"
                (keydown.enter)="focusNextInput($event)"
                class="w-full max-w-xs px-3 py-2 border border-slate-300 rounded-lg text-sm focus:ring-2 focus:ring-purple-500 focus:border-purple-500 transition-colors" />
            </div>

            <!-- Optional Adjustments -->
            <div class="mt-6 pt-6 border-t border-slate-200">
              <h4 class="text-sm font-semibold text-slate-800 mb-2 flex items-center gap-2">
                <svg class="w-4 h-4 text-slate-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 6V4m0 2a2 2 0 100 4m0-4a2 2 0 110 4m-6 8a2 2 0 100-4m0 4a2 2 0 110-4m0 4v2m0-6V4m6 6v10m6-2a2 2 0 100-4m0 4a2 2 0 110-4m0 4v2m0-6V4" />
                </svg>
                Optional Adjustments
                <span class="font-normal text-slate-400">(for more accurate estimate)</span>
              </h4>
              <p class="text-xs text-slate-500 mb-4">These factors affect the valuation multiple applied.</p>

              <div class="grid grid-cols-1 md:grid-cols-3 gap-4">
                <!-- Growth Trend -->
                <div class="bg-white p-3 rounded-lg border border-slate-200">
                  <label class="block text-xs font-medium text-slate-600 mb-2">Growth Trend</label>
                  <select
                    [attr.tabindex]="123"
                    [value]="valuationInputs().growthTrend ?? ''"
                    (change)="setGrowthTrend($event)"
                    class="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm focus:ring-2 focus:ring-purple-500 focus:border-purple-500 transition-colors">
                    <option value="">-- Select --</option>
                    <option value="declining">Declining</option>
                    <option value="flat">Flat</option>
                    <option value="growing">Growing</option>
                  </select>
                </div>

                <!-- Customer Concentration -->
                <div class="bg-white p-3 rounded-lg border border-slate-200">
                  <label class="block text-xs font-medium text-slate-600 mb-2">Customer Concentration</label>
                  <select
                    [attr.tabindex]="124"
                    [value]="valuationInputs().customerConcentration ?? ''"
                    (change)="setCustomerConcentration($event)"
                    class="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm focus:ring-2 focus:ring-purple-500 focus:border-purple-500 transition-colors">
                    <option value="">-- Select --</option>
                    <option value="high">High (&gt;40% one customer)</option>
                    <option value="medium">Medium (20-40%)</option>
                    <option value="low">Low/Diversified (&lt;20%)</option>
                  </select>
                </div>

                <!-- Recurring Revenue -->
                <div class="bg-white p-3 rounded-lg border border-slate-200">
                  <label class="block text-xs font-medium text-slate-600 mb-2">Recurring Revenue (%)</label>
                  <input
                    type="number"
                    inputmode="numeric"
                    min="0"
                    max="100"
                    placeholder="e.g., 60"
                    [attr.tabindex]="125"
                    [value]="valuationInputs().recurringRevenuePercentage ?? ''"
                    (blur)="setRecurringRevenue($event)"
                    (keydown.enter)="focusNextInput($event)"
                    class="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm focus:ring-2 focus:ring-purple-500 focus:border-purple-500 transition-colors" />
                </div>
              </div>
            </div>

            <!-- Clear Valuation Data Button -->
            <div class="mt-6 pt-4 border-t border-slate-100 flex justify-end">
              <button
                type="button"
                [attr.tabindex]="126"
                (click)="clearValuationInputs()"
                class="text-sm text-slate-500 hover:text-red-600 transition-colors flex items-center gap-1">
                <svg class="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                </svg>
                Clear all valuation data
              </button>
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
  private valuationSvc = inject(ValuationService);

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

  // Valuation input signals
  valuationSectionExpanded = signal(false);
  valuationInputs = signal<ValuationInputs>(getDefaultValuationInputs());

  // Business type options for UI
  businessTypes: { value: BusinessType; label: string }[] = [
    { value: 'service', label: 'Service Business' },
    { value: 'product', label: 'Product Business' },
    { value: 'tech-saas', label: 'Tech/SaaS' },
  ];

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

    // Encode valuation data
    const valuation = this.valuationInputs();
    // Version byte (1 = includes valuation data)
    acc = acc * 2n + 1n;

    // Business type: 0=none, 1=service, 2=product, 3=tech-saas
    const btMap: Record<string, number> = { service: 1, product: 2, 'tech-saas': 3 };
    const btValue = valuation.businessType ? (btMap[valuation.businessType] ?? 0) : 0;
    acc = acc * 4n + BigInt(btValue);

    // Encode financial data (scaled to thousands, max 100M = 100000 in thousands)
    // Historical financials (3 years)
    for (const year of valuation.historicalFinancials) {
      const turnover = this.encodeFinancialValue(year.turnover);
      const ebitda = this.encodeFinancialValue(year.ebitda);
      acc = acc * 100001n + BigInt(turnover);
      acc = acc * 200001n + BigInt(ebitda + 100000); // Offset to handle negative EBITDA
    }

    // Forecast financials (3 years)
    for (const year of valuation.forecastFinancials) {
      const turnover = this.encodeFinancialValue(year.turnover);
      const ebitda = this.encodeFinancialValue(year.ebitda);
      acc = acc * 100001n + BigInt(turnover);
      acc = acc * 200001n + BigInt(ebitda + 100000);
    }

    // Total debt (scaled)
    const debt = this.encodeFinancialValue(valuation.totalDebt);
    acc = acc * 100001n + BigInt(debt);

    // Growth trend: 0=none, 1=declining, 2=flat, 3=growing
    const gtMap: Record<string, number> = { declining: 1, flat: 2, growing: 3 };
    const gtValue = valuation.growthTrend ? (gtMap[valuation.growthTrend] ?? 0) : 0;
    acc = acc * 4n + BigInt(gtValue);

    // Customer concentration: 0=none, 1=high, 2=medium, 3=low
    const ccMap: Record<string, number> = { high: 1, medium: 2, low: 3 };
    const ccValue = valuation.customerConcentration ? (ccMap[valuation.customerConcentration] ?? 0) : 0;
    acc = acc * 4n + BigInt(ccValue);

    // Recurring revenue: 0=not set, 1-101 = 0-100%
    const rrValue = valuation.recurringRevenuePercentage !== null ? valuation.recurringRevenuePercentage + 1 : 0;
    acc = acc * 102n + BigInt(rrValue);

    // obfuscate
    const obf = acc * this.CODE_MUL + this.CODE_OFF;
    const checksum = Number(obf % 36n);
    const main = this.bigIntToBase36(obf);
    const code = (main + checksum.toString(36)).toUpperCase();
    return code;
  }

  // Encode financial value: scale to thousands, cap at 100M
  private encodeFinancialValue(value: number | null): number {
    if (value === null || value === undefined) return 0;
    // Scale to thousands and cap
    const scaled = Math.round(value / 1000);
    return Math.max(0, Math.min(100000, scaled));
  }

  // Decode financial value: convert back from thousands
  private decodeFinancialValue(encoded: number): number | null {
    if (encoded === 0) return null;
    return encoded * 1000;
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

      // Decode in reverse order (last encoded = first decoded)

      // Recurring revenue
      const rrValue = Number(acc % 102n);
      acc = acc / 102n;
      const recurringRevenuePercentage = rrValue === 0 ? null : rrValue - 1;

      // Customer concentration
      const ccValue = Number(acc % 4n);
      acc = acc / 4n;
      const ccMap: Record<number, CustomerConcentration | null> = { 0: null, 1: 'high', 2: 'medium', 3: 'low' };
      const customerConcentration = ccMap[ccValue] ?? null;

      // Growth trend
      const gtValue = Number(acc % 4n);
      acc = acc / 4n;
      const gtMap: Record<number, GrowthTrend | null> = { 0: null, 1: 'declining', 2: 'flat', 3: 'growing' };
      const growthTrend = gtMap[gtValue] ?? null;

      // Total debt
      const debtEncoded = Number(acc % 100001n);
      acc = acc / 100001n;
      const totalDebt = this.decodeFinancialValue(debtEncoded);

      // Forecast financials (3 years, decode in reverse)
      const forecastFinancials: { year: number; turnover: number | null; ebitda: number | null }[] = [];
      const currentYear = new Date().getFullYear();
      for (let i = 2; i >= 0; i--) {
        const ebitdaEncoded = Number(acc % 200001n) - 100000;
        acc = acc / 200001n;
        const turnoverEncoded = Number(acc % 100001n);
        acc = acc / 100001n;
        forecastFinancials.unshift({
          year: currentYear + i,
          turnover: this.decodeFinancialValue(turnoverEncoded),
          ebitda: this.decodeFinancialValue(ebitdaEncoded + 100000) !== null
            ? (ebitdaEncoded * 1000)
            : null,
        });
      }

      // Historical financials (3 years, decode in reverse)
      const historicalFinancials: { year: number; turnover: number | null; ebitda: number | null }[] = [];
      for (let i = 0; i < 3; i++) {
        const ebitdaEncoded = Number(acc % 200001n) - 100000;
        acc = acc / 200001n;
        const turnoverEncoded = Number(acc % 100001n);
        acc = acc / 100001n;
        historicalFinancials.unshift({
          year: currentYear - 3 + (2 - i),
          turnover: this.decodeFinancialValue(turnoverEncoded),
          ebitda: ebitdaEncoded === -100000 ? null : ebitdaEncoded * 1000,
        });
      }

      // Business type
      const btValue = Number(acc % 4n);
      acc = acc / 4n;
      const btMap: Record<number, BusinessType | null> = { 0: null, 1: 'service', 2: 'product', 3: 'tech-saas' };
      const businessType = btMap[btValue] ?? null;

      // Version byte
      const version = Number(acc % 2n);
      acc = acc / 2n;

      // Decode lifecycle (least significant in original encoding)
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

      // Restore valuation inputs if version indicates they were included
      if (version === 1) {
        const valuationInputs: ValuationInputs = {
          businessType,
          historicalFinancials,
          forecastFinancials,
          totalDebt,
          growthTrend,
          customerConcentration,
          recurringRevenuePercentage,
        };
        this.valuationInputs.set(valuationInputs);
        this.saveValuationInputs();
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

      // Load valuation inputs from localStorage
      this.loadValuationInputs();
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

  // ========== Valuation Input Methods ==========

  toggleValuationSection() {
    this.valuationSectionExpanded.update((v) => !v);
    try {
      localStorage.setItem('exit-readiness:valuationExpanded', String(this.valuationSectionExpanded()));
    } catch (e) { /* ignore */ }
  }

  setBusinessType(type: BusinessType) {
    this.valuationInputs.update((inputs) => ({
      ...inputs,
      businessType: inputs.businessType === type ? null : type,
    }));
    this.saveValuationInputs();
  }

  setHistoricalTurnover(index: number, event: Event) {
    const value = this.parseInputValue(event);
    this.valuationInputs.update((inputs) => {
      const historicalFinancials = [...inputs.historicalFinancials];
      historicalFinancials[index] = { ...historicalFinancials[index], turnover: value };
      return { ...inputs, historicalFinancials };
    });
    this.saveValuationInputs();
  }

  setHistoricalEbitda(index: number, event: Event) {
    const value = this.parseInputValue(event);
    this.valuationInputs.update((inputs) => {
      const historicalFinancials = [...inputs.historicalFinancials];
      historicalFinancials[index] = { ...historicalFinancials[index], ebitda: value };
      return { ...inputs, historicalFinancials };
    });
    this.saveValuationInputs();
  }

  setForecastTurnover(index: number, event: Event) {
    const value = this.parseInputValue(event);
    this.valuationInputs.update((inputs) => {
      const forecastFinancials = [...inputs.forecastFinancials];
      forecastFinancials[index] = { ...forecastFinancials[index], turnover: value };
      return { ...inputs, forecastFinancials };
    });
    this.saveValuationInputs();
  }

  setForecastEbitda(index: number, event: Event) {
    const value = this.parseInputValue(event);
    this.valuationInputs.update((inputs) => {
      const forecastFinancials = [...inputs.forecastFinancials];
      forecastFinancials[index] = { ...forecastFinancials[index], ebitda: value };
      return { ...inputs, forecastFinancials };
    });
    this.saveValuationInputs();
  }

  setTotalDebt(event: Event) {
    const value = this.parseInputValue(event);
    this.valuationInputs.update((inputs) => ({ ...inputs, totalDebt: value }));
    this.saveValuationInputs();
  }

  setGrowthTrend(event: Event) {
    const target = event.target as HTMLSelectElement;
    const value = target.value as GrowthTrend | '';
    this.valuationInputs.update((inputs) => ({
      ...inputs,
      growthTrend: value === '' ? null : value,
    }));
    this.saveValuationInputs();
  }

  setCustomerConcentration(event: Event) {
    const target = event.target as HTMLSelectElement;
    const value = target.value as CustomerConcentration | '';
    this.valuationInputs.update((inputs) => ({
      ...inputs,
      customerConcentration: value === '' ? null : value,
    }));
    this.saveValuationInputs();
  }

  setRecurringRevenue(event: Event) {
    const target = event.target as HTMLInputElement;
    const value = target.value ? parseInt(target.value, 10) : null;
    this.valuationInputs.update((inputs) => ({
      ...inputs,
      recurringRevenuePercentage: value !== null && !isNaN(value) ? Math.min(100, Math.max(0, value)) : null,
    }));
    this.saveValuationInputs();
  }

  clearValuationInputs() {
    this.valuationInputs.set(getDefaultValuationInputs());
    this.saveValuationInputs();
  }

  private parseInputValue(event: Event): number | null {
    const target = event.target as HTMLInputElement;
    return this.valuationSvc.parseNumber(target.value);
  }

  formatNumberForDisplay(value: number | null): string {
    return this.valuationSvc.formatNumber(value);
  }

  saveValuationInputs() {
    try {
      localStorage.setItem('exit-readiness:valuationInputs', JSON.stringify(this.valuationInputs()));
    } catch (e) { /* ignore */ }
  }

  loadValuationInputs() {
    try {
      const raw = localStorage.getItem('exit-readiness:valuationInputs');
      if (raw) {
        const parsed = JSON.parse(raw) as ValuationInputs;
        // Ensure the structure is valid
        if (parsed && typeof parsed === 'object') {
          this.valuationInputs.set(parsed);
        }
      }
      const expanded = localStorage.getItem('exit-readiness:valuationExpanded');
      if (expanded === 'true') {
        this.valuationSectionExpanded.set(true);
      }
    } catch (e) { /* ignore */ }
  }

  // ========== Dynamic Year Calculation ==========

  private currentYear = new Date().getFullYear();

  getHistoricalYear(index: number): number {
    // Historical years: currentYear - 3, currentYear - 2, currentYear - 1
    return this.currentYear - 3 + index;
  }

  getForecastYear(index: number): number {
    // Forecast years: currentYear, currentYear + 1, currentYear + 2
    return this.currentYear + index;
  }

  // ========== Validation Methods ==========

  getValidationError(index: number, type: 'historical' | 'forecast'): string | null {
    const inputs = this.valuationInputs();
    const yearData = type === 'historical'
      ? inputs.historicalFinancials[index]
      : inputs.forecastFinancials[index];

    if (!yearData) return null;

    const turnover = yearData.turnover;
    const ebitda = yearData.ebitda;

    // Validation: EBITDA/Profit should not exceed Turnover
    if (turnover !== null && ebitda !== null && ebitda > turnover) {
      return 'Profit cannot exceed turnover';
    }

    // Validation: Warn if EBITDA margin seems unusually high (> 50%)
    if (turnover !== null && turnover > 0 && ebitda !== null && ebitda > 0) {
      const margin = (ebitda / turnover) * 100;
      if (margin > 50) {
        return 'Unusually high margin (>50%)';
      }
    }

    return null;
  }

  getEbitdaValidationClass(index: number, type: 'historical' | 'forecast'): Record<string, boolean> {
    const error = this.getValidationError(index, type);
    return {
      'border-slate-300': !error,
      'border-red-400 bg-red-50': error !== null && error.includes('cannot exceed'),
      'border-amber-400 bg-amber-50': error !== null && error.includes('Unusually high'),
    };
  }

  // ========== Tab Navigation Helper ==========

  focusNextInput(event: Event) {
    const target = event.target as HTMLElement;
    const currentTabIndex = target.tabIndex;

    // Find the next focusable element with a higher tabindex
    const allFocusable = Array.from(
      document.querySelectorAll<HTMLElement>('input, select, button')
    ).filter(el => el.tabIndex > 0);

    // Sort by tabindex
    allFocusable.sort((a, b) => a.tabIndex - b.tabIndex);

    // Find current index and move to next
    const currentIndex = allFocusable.findIndex(el => el.tabIndex === currentTabIndex);
    if (currentIndex >= 0 && currentIndex < allFocusable.length - 1) {
      allFocusable[currentIndex + 1].focus();
    }

    event.preventDefault();
  }
}
