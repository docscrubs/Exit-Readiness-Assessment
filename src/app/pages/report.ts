import { CommonModule } from '@angular/common';
import { Component, OnInit, inject, signal, computed } from '@angular/core';
import { Router, RouterLink } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { AssessmentService } from '../services/assessment.service';
import { RecommendationService } from '../services/recommendation.service';
import { AssessmentSpec, Responses } from '../models/assessment';
import { RadarComponent } from '../components/radar';
import { ValuationInputs, ValuationResult, getDefaultValuationInputs } from '../models/valuation';
import { ValuationService } from '../services/valuation.service';
import { MagiliumImpactService } from '../services/magilium-impact.service';
import { MagiliumImpactSummary, MagiliumStatistic, MAGILIUM_STATISTICS } from '../models/magilium-impact';

@Component({
  selector: 'app-report-page',
  standalone: true,
  imports: [CommonModule, RadarComponent, FormsModule, RouterLink],
  template: `
    <section class="container mx-auto px-6 py-10 lg:py-12 print:px-0 print:py-0">
      <div class="mb-6 flex items-start justify-between gap-6">
        <div>
          <h1 class="text-2xl font-bold text-slate-900">Exit Readiness Report</h1>
          <div class="text-sm text-slate-600">Your comprehensive exit readiness assessment with valuation and timeline guidance.</div>
          <div *ngIf="exportCode" class="mt-3 rounded-xl bg-slate-50 p-4">
            <div class="font-medium text-sm">Here is a code that represents your answers. Record it for future use:</div>
            <div class="mt-3 flex items-center gap-3">
              <div class="font-mono bg-white border rounded-lg h-10 px-3 flex items-center text-sm">{{ exportCode }}</div>
              <button class="btn btn-primary h-10" (click)="copy(exportCode)">Copy</button>
              <div *ngIf="copyToast()" class="ml-3 inline-flex items-center rounded-md bg-slate-50 border px-3 py-2" [ngStyle]="{ 'border-color': primaryColor }">
                <svg class="h-4 w-4 text-slate-700 mr-2" viewBox="0 0 20 20" fill="none" xmlns="http://www.w3.org/2000/svg"><path d="M7 10l2 2 4-4" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"/></svg>
                <div class="text-sm text-slate-700">{{ copyToast()?.text }}</div>
              </div>
            </div>
          </div>
        </div>
        <div class="flex items-center gap-3">
          <button class="btn btn-secondary" (click)="router.navigate(['/'])">Back to home</button>
          <button class="btn btn-primary" (click)="print()">Print report</button>
        </div>
      </div>

      <!-- Threshold Violations Warning Section 
      <div *ngIf="thresholdViolations().length > 0" class="mb-6 space-y-3">
        <div *ngFor="let violation of thresholdViolations()"
             [ngClass]="{
               'rounded-xl border-2 p-5': true,
               'bg-red-50 border-red-300': violation.severity === 'blocker',
               'bg-orange-50 border-orange-300': violation.severity === 'critical'
             }">
          <div class="flex items-start gap-3">
            <svg *ngIf="violation.severity === 'blocker'" class="h-6 w-6 text-red-600 flex-shrink-0 mt-0.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
            </svg>
            <svg *ngIf="violation.severity === 'critical'" class="h-6 w-6 text-orange-600 flex-shrink-0 mt-0.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            <div class="flex-1">
              <div class="flex items-center justify-between">
                <h3 [ngClass]="{
                  'font-semibold text-lg': true,
                  'text-red-900': violation.severity === 'blocker',
                  'text-orange-900': violation.severity === 'critical'
                }">
                  {{ violation.severity === 'blocker' ? '🚫 DEAL BLOCKER' : '⚠️ CRITICAL ISSUE' }}: {{ violation.domainName }}
                </h3>
                <div class="text-sm font-medium">
                  <span [ngClass]="violation.severity === 'blocker' ? 'text-red-700' : 'text-orange-700'">
                    Current: {{ violation.currentLevel | number:'1.1-1' }}
                  </span>
                  <span class="mx-2">→</span>
                  <span class="text-green-700">Required: {{ violation.requiredLevel | number:'1.0-0' }}</span>
                </div>
              </div>
              <p [ngClass]="{
                'mt-2 text-sm': true,
                'text-red-800': violation.severity === 'blocker',
                'text-orange-800': violation.severity === 'critical'
              }">
                {{ violation.message }}
              </p>
            </div>
          </div>
        </div>
      </div>
-->
      <ng-container *ngIf="spec() as s">

        <!-- Indicative Valuation Section -->
        <div class="rounded-xl border border-slate-200 bg-white mb-6 overflow-hidden shadow-sm">
          <div class="p-6">
            <div class="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-4">
              <div>
                <h3 class="font-semibold text-slate-900 text-lg flex items-center gap-2">
                  <svg class="w-5 h-5 text-slate-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                  Indicative Valuation Range
                </h3>
                <p class="text-sm text-slate-600 mt-1">
                  {{ valuationResult()?.isCalculable ? 'Based on your financial inputs' : 'Add financial data to receive a valuation estimate' }}
                </p>
              </div>
              <div *ngIf="valuationResult()?.isCalculable" class="flex-shrink-0">
                <span class="text-xs px-3 py-1.5 rounded-full font-medium shadow-sm"
                      [ngClass]="{
                        'bg-green-100 text-green-700 border border-green-200': valuationResult()?.confidence === 'high',
                        'bg-yellow-100 text-yellow-700 border border-yellow-200': valuationResult()?.confidence === 'medium',
                        'bg-orange-100 text-orange-700 border border-orange-200': valuationResult()?.confidence === 'low'
                      }">
                  {{ valuationResult()?.confidence === 'high' ? 'High' : valuationResult()?.confidence === 'medium' ? 'Medium' : 'Low' }} Confidence
                </span>
              </div>
            </div>

            <!-- Calculable valuation display -->
            <div *ngIf="valuationResult()?.isCalculable" class="mt-6">
              <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
                <!-- Enterprise Value -->
                <div class="bg-slate-50 rounded-lg p-5 border border-slate-200">
                  <div class="text-xs uppercase tracking-wide text-slate-500 mb-1 flex items-center gap-1">
                    <svg class="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
                    </svg>
                    Enterprise Value
                  </div>
                  <div class="text-2xl font-bold text-slate-900">
                    {{ valuationSvc.formatCurrency(valuationResult()?.enterpriseValueMin ?? null) }} – {{ valuationSvc.formatCurrency(valuationResult()?.enterpriseValueMax ?? null) }}
                  </div>
                  <div class="text-xs text-slate-500 mt-2 pt-2 border-t border-slate-200">
                    {{ valuationResult()?.baseValueLabel }}: {{ valuationSvc.formatCurrency(valuationResult()?.baseValue ?? null) }}
                    × {{ valuationResult()?.multipleMin }}–{{ valuationResult()?.multipleMax }}x
                  </div>
                </div>

                <!-- Equity Value -->
                <div class="bg-slate-50 rounded-lg p-5 border border-slate-200">
                  <div class="text-xs uppercase tracking-wide text-slate-500 mb-1 flex items-center gap-1">
                    <svg class="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M17 9V7a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2m2 4h10a2 2 0 002-2v-6a2 2 0 00-2-2H9a2 2 0 00-2 2v6a2 2 0 002 2zm7-5a2 2 0 11-4 0 2 2 0 014 0z" />
                    </svg>
                    Equity Value (What You Receive)
                  </div>
                  <div class="text-2xl font-bold text-slate-900">
                    {{ valuationSvc.formatCurrency(valuationResult()?.equityValueMin ?? null) }} – {{ valuationSvc.formatCurrency(valuationResult()?.equityValueMax ?? null) }}
                  </div>
                  <div class="text-xs text-slate-500 mt-2 pt-2 border-t border-slate-200">
                    After deducting {{ valuationSvc.formatCurrency(valuationInputs()?.totalDebt ?? 0) }} in liabilities
                  </div>
                </div>
              </div>

              <!-- Adjustments applied -->
              <div *ngIf="valuationResult()?.adjustments && valuationResult()!.adjustments.length > 0" class="mt-4 p-3 bg-white rounded-lg border border-slate-200">
                <div class="text-xs font-medium text-slate-600 mb-2 flex items-center gap-1">
                  <svg class="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 6V4m0 2a2 2 0 100 4m0-4a2 2 0 110 4m-6 8a2 2 0 100-4m0 4a2 2 0 110-4m0 4v2m0-6V4m6 6v10m6-2a2 2 0 100-4m0 4a2 2 0 110-4m0 4v2m0-6V4" />
                  </svg>
                  Adjustments Applied:
                </div>
                <div class="flex flex-wrap gap-2">
                  <span *ngFor="let adj of valuationResult()?.adjustments"
                        class="text-xs px-2.5 py-1 rounded-full font-medium cursor-help transition-all hover:shadow-sm"
                        [ngClass]="{
                          'bg-green-100 text-green-700 border border-green-200': adj.impact === 'premium',
                          'bg-red-100 text-red-700 border border-red-200': adj.impact === 'discount',
                          'bg-slate-100 text-slate-600 border border-slate-200': adj.impact === 'neutral'
                        }"
                        [title]="adj.explanation">
                    {{ adj.factor }}: {{ adj.percentageChange > 0 ? '+' : '' }}{{ adj.percentageChange }}%
                  </span>
                </div>
              </div>

              <!-- How is this calculated? collapsible -->
              <div class="mt-4">
                <button
                  type="button"
                  (click)="toggleMethodologySection()"
                  class="text-sm text-blue-600 hover:text-blue-800 flex items-center gap-1 font-medium transition-colors">
                  <svg class="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8.228 9c.549-1.165 2.03-2 3.772-2 2.21 0 4 1.343 4 3 0 1.4-1.278 2.575-3.006 2.907-.542.104-.994.54-.994 1.093m0 3h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                  How is this calculated?
                  <svg class="w-4 h-4 transition-transform" [class.rotate-180]="methodologySectionExpanded()" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 9l-7 7-7-7" />
                  </svg>
                </button>
                <div *ngIf="methodologySectionExpanded()" class="mt-3 p-4 bg-slate-50 border border-slate-200 rounded-lg text-sm text-slate-700">
                  <p class="mb-2">This valuation uses the <strong>{{ valuationResult()?.method === 'ebitda-multiple' ? 'EBITDA Multiple' : 'Revenue Multiple' }}</strong> method:</p>
                  <ul class="list-disc pl-5 space-y-1">
                    <li *ngIf="valuationResult()?.method === 'ebitda-multiple'">Enterprise Value = Normalised EBITDA × Industry Multiple</li>
                    <li *ngIf="valuationResult()?.method === 'revenue-multiple'">Enterprise Value = Annual Turnover × Revenue Multiple</li>
                    <li>Base multiples adjusted for business characteristics (customer concentration, recurring revenue, growth)</li>
                    <li>Equity Value = Enterprise Value minus Total Debt</li>
                  </ul>
                  <p class="mt-3">
                    <a routerLink="/methodology" class="inline-flex items-center gap-1 text-blue-600 hover:text-blue-800 font-medium transition-colors">
                      <svg class="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                      </svg>
                      View full methodology document with sources →
                    </a>
                  </p>
                </div>
              </div>
            </div>

            <!-- No valuation data message -->
            <div *ngIf="!valuationResult()?.isCalculable" class="mt-6 text-center py-8">
              <svg class="w-16 h-16 mx-auto mb-4 text-slate-300" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5" d="M9 7h6m0 10v-3m-3 3h.01M9 17h.01M9 14h.01M12 14h.01M15 11h.01M12 11h.01M9 11h.01M7 21h10a2 2 0 002-2V5a2 2 0 00-2-2H7a2 2 0 00-2 2v14a2 2 0 002 2z" />
              </svg>
              <p class="text-slate-600 mb-2 font-medium">No valuation data provided</p>
              <p class="text-sm text-slate-500 max-w-md mx-auto">Return to the assessment and complete the optional financial data section to receive an indicative valuation range.</p>
            </div>

            <!-- Caveats (always shown when calculable) -->
            <div *ngIf="valuationResult()?.isCalculable" class="mt-4 p-4 bg-gradient-to-r from-amber-50 to-orange-50 border border-amber-200 rounded-lg">
              <div class="flex gap-3">
                <svg class="w-5 h-5 text-amber-600 flex-shrink-0 mt-0.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                </svg>
                <div class="text-xs text-amber-800">
                  <strong class="text-amber-900">Important:</strong> This is an indicative estimate only, not a professional valuation.
                  Actual transaction values depend on market conditions, buyer synergies, deal structure, negotiation, and comprehensive due diligence.
                  <ul *ngIf="valuationResult()?.caveats && valuationResult()!.caveats.length > 1" class="mt-2 list-disc pl-4 space-y-1">
                    <li *ngFor="let caveat of valuationResult()?.caveats?.slice(1)">{{ caveat }}</li>
                  </ul>
                </div>
              </div>
            </div>
          </div>
        </div>

        <!-- Professional Exit Preparation Impact Section (Magilium) -->
        <div *ngIf="magiliumImpact() as impact" class="rounded-xl border border-slate-200 mb-6 overflow-hidden shadow-sm bg-white">
          <!-- Collapsible Header -->
          <button
            type="button"
            (click)="toggleMagiliumSection()"
            class="w-full p-5 flex items-center justify-between text-left hover:bg-slate-50 transition-colors">
            <div class="flex items-center gap-3">
              <svg class="w-5 h-5 transition-transform" [class.rotate-90]="magiliumSectionExpanded()" [ngClass]="magiliumSectionExpanded() ? 'text-slate-600' : 'text-red-600'" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5l7 7-7 7" />
              </svg>
              <span class="font-semibold transition-colors" [ngClass]="magiliumSectionExpanded() ? 'text-slate-900' : 'text-red-600 animate-pulse'">See how professional preparation can improve your exit outcome in value, timescale and chance of completion here</span>
            </div>
          </button>

          <!-- Expanded Content -->
          <div *ngIf="magiliumSectionExpanded()" class="px-6 pb-6">
            <!-- Summary Cards -->
            <div class="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
              <!-- Valuation Improvement Card -->
              <div class="bg-slate-50 rounded-lg p-5 border border-slate-200">
                <div class="text-xs uppercase tracking-wide text-slate-500 mb-1 flex items-center gap-1">
                  <svg class="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" />
                  </svg>
                  Valuation Improvement
                </div>
                <div class="text-2xl font-bold text-slate-900">
                  +{{ impact.valuationImpact.improvementPercent }}%
                </div>
                <div class="text-xs text-slate-500 mt-1">
                  Potential discount reduction
                </div>
                <div *ngIf="impact.valuationImpact.estimatedValueGain" class="mt-2 pt-2 border-t border-slate-200 text-xs text-green-700 font-medium">
                  Est. {{ valuationSvc.formatCurrency(impact.valuationImpact.estimatedValueGain) }} value gain
                </div>
              </div>

              <!-- Completion Probability Card -->
              <div class="bg-slate-50 rounded-lg p-5 border border-slate-200">
                <div class="text-xs uppercase tracking-wide text-slate-500 mb-1 flex items-center gap-1">
                  <svg class="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                  Deal Completion
                </div>
                <div class="text-2xl font-bold text-slate-900">
                  {{ impact.completionImpact.currentProbability }}% → {{ impact.completionImpact.mitigatedProbability }}%
                </div>
                <div class="text-xs text-slate-500 mt-1">
                  Probability of successful close
                </div>
                <div *ngIf="impact.completionImpact.riskFactorCount > 0" class="mt-2 pt-2 border-t border-slate-200 text-xs text-orange-600">
                  {{ impact.completionImpact.riskFactorCount }} risk factor{{ impact.completionImpact.riskFactorCount > 1 ? 's' : '' }} identified
                </div>
              </div>

              <!-- Timeline Card -->
              <div class="bg-slate-50 rounded-lg p-5 border border-slate-200">
                <div class="text-xs uppercase tracking-wide text-slate-500 mb-1 flex items-center gap-1">
                  <svg class="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                  DD Timeline
                </div>
                <div class="text-2xl font-bold text-slate-900">
                  {{ impact.timelineImpact.ddTimeSavings }}
                </div>
                <div class="text-xs text-slate-500 mt-1">
                  Faster due diligence
                </div>
                <div class="mt-2 pt-2 border-t border-slate-200 text-xs text-slate-600">
                  {{ impact.timelineImpact.explanation }}
                </div>
              </div>
            </div>

            <!-- Specific Opportunities -->
            <div *ngIf="impact.opportunities.length > 0" class="mb-6">
              <h4 class="font-semibold text-slate-900 mb-3">Your Specific Opportunities</h4>
              <div class="space-y-3">
                <div *ngFor="let opp of impact.opportunities" class="bg-white rounded-lg p-4 border border-slate-200">
                  <div class="flex items-start gap-3">
                    <div class="flex-shrink-0 mt-0.5">
                      <span *ngIf="opp.category === 'valuation'" class="text-lg">📊</span>
                      <span *ngIf="opp.category === 'documentation'" class="text-lg">📁</span>
                      <span *ngIf="opp.category === 'completion'" class="text-lg">✅</span>
                      <span *ngIf="opp.category === 'timeline'" class="text-lg">⏱️</span>
                    </div>
                    <div class="flex-1">
                      <div class="font-medium text-slate-900">{{ opp.title }}</div>
                      <div class="mt-1 text-sm text-slate-600">
                        <span class="text-red-600">{{ opp.currentState }}</span>
                        <span class="mx-2">→</span>
                        <span class="text-green-600">{{ opp.mitigatedState }}</span>
                      </div>
                      <div class="mt-2 text-sm text-slate-700">
                        <strong>How:</strong> {{ opp.magiliumApproach }}
                      </div>
                      <div class="mt-2 text-xs text-slate-500">
                        Source: <a [href]="opp.evidenceUrl" target="_blank" class="text-blue-600 hover:underline">{{ opp.evidenceSource }}</a>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            <!-- Evidence Sources (collapsible) -->
            <div class="mb-6">
              <button
                type="button"
                (click)="toggleMagiliumEvidence()"
                class="text-sm text-slate-700 hover:text-slate-900 flex items-center gap-1 font-medium transition-colors">
                <svg class="w-4 h-4 transition-transform" [class.rotate-180]="magiliumEvidenceExpanded()" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 9l-7 7-7-7" />
                </svg>
                View evidence sources
              </button>
              <div *ngIf="magiliumEvidenceExpanded()" class="mt-3 p-4 bg-white rounded-lg border border-slate-200">
                <ul class="space-y-2 text-sm text-slate-700">
                  <li *ngFor="let stat of magiliumStatistics()" class="flex items-start gap-2">
                    <span class="font-semibold text-purple-700">{{ stat.value }}</span>
                    <span>{{ stat.label }}</span>
                    <a [href]="stat.sourceUrl" target="_blank" class="text-blue-600 hover:underline text-xs">({{ stat.source }})</a>
                  </li>
                </ul>
              </div>
            </div>

            <!-- CTA Bar -->
            <div class="rounded-xl p-6 text-white" style="background: linear-gradient(to right, #6e2b86, #ed0776);">
              <div class="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
                <div>
                  <h4 class="font-semibold text-lg">Ready to maximise your exit value?</h4>
                  <p class="text-purple-100 text-sm mt-1">
                    Magilium Ltd prepares SMEs for successful exits, typically 6-12 months before transaction.
                  </p>
                </div>
                <div class="flex flex-col sm:flex-row gap-3">
                  <a href="mailto:connect&#64;magilium.com"
                     class="px-6 py-3 bg-white text-purple-700 rounded-lg font-semibold text-center hover:bg-purple-50 transition-colors shadow-sm">
                    Email Us
                  </a>
                  <a href="https://www.magilium.com" target="_blank"
                     class="px-6 py-3 border-2 border-white text-white rounded-lg font-semibold text-center hover:bg-white/10 transition-colors">
                    Visit Website →
                  </a>
                </div>
              </div>
            </div>
          </div>
        </div>

        <div class="rounded-xl border border-slate-200 bg-white p-6 mb-6">
          <h3 class="font-semibold text-slate-900 mb-4">Due Diligence Maturity Levels</h3>
          <div class="flex flex-col md:flex-row md:items-start items-center gap-6">
            <!-- Radar (left on wide screens) -->
            <div class="w-full md:w-1/2 flex justify-center">
              <div class="w-full max-w-[350px]" style="aspect-ratio: 1 / 1;">
                <app-radar [labels]="dimensionLabels()" [values]="dimensionAverages()" [max]="s.scale.max" [strokeColor]="primaryColor" [fillColor]="accentColor"></app-radar>
              </div>
            </div>

            <!-- Scores and overall (right on wide screens) -->
            <div class="w-full md:w-1/2">
              <div class="text-center md:text-left">
                <div class="text-xs uppercase tracking-wide text-slate-500">Overall</div>
                <div class="text-3xl font-bold text-slate-900">{{ overallPercent() | number:'1.0-1' }}%</div>
                <div class="text-sm text-slate-600">Level: <span class="font-semibold" [ngStyle]="{ color: levelColor(overallLevel()) }">{{ overallLevel()?.name }}</span></div>
              </div>

              <div class="mt-4 space-y-3">
                <div *ngFor="let dim of s.dimensions">
                  <div class="flex items-center justify-between text-sm">
                    <span class="text-slate-700">{{ dim.name }}</span>
                    <span class="font-medium text-slate-900">{{ dimScore(dim.id) | number:'1.0-2' }} / {{ s.scale.max }}</span>
                  </div>
                  <div class="mt-1 h-2 w-full rounded-full bg-slate-100">
                    <div class="h-2 rounded-full bg-secondary" [style.width.%]="(dimScore(dim.id) / s.scale.max) * 100"></div>
                  </div>
                </div>
              </div>
            </div>

          </div>
        </div>

        <!-- Enhanced Sector & Lifecycle Benchmark Comparison Section -->
        <div class="rounded-xl border border-slate-200 bg-white p-6 mb-6">
          <h3 class="font-semibold text-slate-900 mb-4">Sector & Lifecycle Benchmark Comparison</h3>
          <p class="text-sm text-slate-600 mb-4">Your scores compared against minimum and average benchmarks for your sector and company stage.</p>

          <!-- Benchmark Comparison Display -->
          <div *ngIf="benchmarkComparison() as comparison" class="space-y-6">
            <!-- Summary cards -->
            <div class="grid md:grid-cols-3 gap-4">
              <div class="rounded-lg border border-slate-200 bg-slate-50 p-4">
                <div class="text-xs uppercase tracking-wide text-slate-500 mb-1">Sector</div>
                <div class="text-lg font-semibold text-slate-900">{{ comparison.sectorName }}</div>
              </div>
              <div class="rounded-lg border border-slate-200 bg-slate-50 p-4">
                <div class="text-xs uppercase tracking-wide text-slate-500 mb-1">Lifecycle Stage</div>
                <div class="text-lg font-semibold text-slate-900">{{ comparison.lifecycleName }}</div>
              </div>
              <div class="rounded-lg border border-slate-200 bg-slate-50 p-4">
                <div class="text-xs uppercase tracking-wide text-slate-500 mb-1">Critical Domains</div>
                <div class="text-lg font-medium text-slate-900">{{ comparison.criticalDomains.join(', ') || 'None' }}</div>
              </div>
            </div>

            <!-- Radar Chart Comparison -->
            <div class="flex flex-col md:flex-row md:items-start items-center gap-6">
              <!-- Radar chart with three overlays (user, minimum, average) -->
              <div class="w-full md:w-1/2 flex justify-center">
                <div class="w-full max-w-[350px]" style="aspect-ratio: 1 / 1;">
                  <app-radar
                    [labels]="dimensionLabels()"
                    [values]="dimensionAverages()"
                    [overlayValues]="benchmarkMinimumValues()"
                    [secondOverlayValues]="benchmarkAverageValues()"
                    [max]="spec()!.scale.max"
                    [strokeColor]="primaryColor"
                    [fillColor]="accentColor"
                    [overlayStrokeColor]="'#dc2626'"
                    [overlayFillColor]="'rgba(220, 38, 38, 0.1)'"
                    [secondOverlayStrokeColor]="'#10b981'"
                    [secondOverlayFillColor]="'rgba(16, 185, 129, 0.1)'"></app-radar>
                </div>
              </div>

              <!-- Legend and interpretation -->
              <div class="w-full md:w-1/2">
                <div class="p-4 rounded-lg bg-slate-50 mb-4">
                  <div class="text-sm font-medium text-slate-700 mb-3">Legend:</div>
                  <div class="space-y-2 text-xs text-slate-600">
                    <div class="flex items-center gap-2">
                      <div class="w-4 h-4 rounded-full" [ngStyle]="{ 'background-color': accentColor }"></div>
                      <span><strong>Your scores</strong></span>
                    </div>
                    <div class="flex items-center gap-2">
                      <div class="w-4 h-4 rounded-full bg-red-600"></div>
                      <span><strong>Minimum benchmark</strong> - deal requirements</span>
                    </div>
                    <div class="flex items-center gap-2">
                      <div class="w-4 h-4 rounded-full bg-green-600"></div>
                      <span><strong>Average benchmark</strong> - competitive position</span>
                    </div>
                  </div>
                </div>

                <!-- Domain-by-domain comparison table -->
                <div class="space-y-2">
                  <div *ngFor="let gap of comparison.gaps" class="text-xs">
                    <div class="flex items-center justify-between py-2 border-b border-slate-100">
                      <span class="font-medium text-slate-700 capitalize">{{ gap.domain }}</span>
                      <div class="flex items-center gap-2">
                        <span class="text-slate-600">{{ gap.userScore | number:'1.1-1' }}</span>
                        <span class="text-slate-400">vs</span>
                        <span class="text-red-600 font-medium">{{ gap.minScore | number:'1.1-1' }}</span>
                        <span class="text-slate-400">/</span>
                        <span class="text-green-600 font-medium">{{ gap.avgScore | number:'1.1-1' }}</span>
                      </div>
                    </div>
                    <div class="mt-1 pl-2">
                      <span *ngIf="gap.belowMinimum" class="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-red-50 text-red-700 text-xs font-medium">
                        <svg class="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" /></svg>
                        Below minimum - transaction risk
                      </span>
                      <span *ngIf="!gap.belowMinimum && gap.belowAverage" class="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-orange-50 text-orange-700 text-xs font-medium">
                        <svg class="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
                        Below average - opportunity to improve
                      </span>
                      <span *ngIf="!gap.belowMinimum && !gap.belowAverage" class="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-green-50 text-green-700 text-xs font-medium">
                        <svg class="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7" /></svg>
                        Meets or exceeds average
                      </span>
                      <span *ngIf="comparison.criticalDomains.includes(gap.domain)" class="ml-2 inline-flex items-center px-2 py-0.5 rounded-full bg-blue-50 text-blue-700 text-xs font-medium">
                        Critical domain for {{ comparison.sectorName }}
                      </span>
                    </div>
                  </div>
                </div>

                <div class="mt-4 p-3 rounded-lg bg-blue-50 border border-blue-200 text-xs text-slate-700">
                  <strong>Note:</strong> Minimum benchmarks represent deal requirements based on {{ comparison.sectorName }} M&A data. Average benchmarks indicate competitive positioning for premium valuations.
                </div>
              </div>
            </div>
          </div>

          <div *ngIf="!benchmarkComparison()" class="text-center py-12 text-slate-500">
            <svg class="w-12 h-12 mx-auto mb-3 text-slate-300" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
            </svg>
            <p>No sector and lifecycle stage selected. Return to the assessment page to select these options for benchmark comparison.</p>
          </div>
        </div>

        <!-- Timeline Guidance Section -->
        <div *ngIf="timelineGuidance() as timeline" class="rounded-xl border border-slate-200 bg-white p-6 mb-6">
          <h3 class="font-semibold text-slate-900 mb-4">Timeline to Exit Readiness</h3>
          <div class="grid md:grid-cols-3 gap-4 mb-4">
            <div class="text-center p-4 rounded-lg bg-blue-50 border border-blue-200">
              <div class="text-sm text-slate-600 mb-1">Current Overall Level</div>
              <div class="text-2xl font-bold text-slate-900">{{ timeline.overallLevel | number:'1.1-1' }}</div>
            </div>
            <div class="text-center p-4 rounded-lg bg-purple-50 border border-purple-200">
              <div class="text-sm text-slate-600 mb-1">Estimated Timeline</div>
              <div class="text-2xl font-bold text-slate-900">{{ timeline.estimatedMonths }}</div>
            </div>
            <div class="text-center p-4 rounded-lg bg-green-50 border border-green-200">
              <div class="text-sm text-slate-600 mb-1">Priority Status</div>
              <div class="text-sm font-bold text-slate-900">{{ timeline.priority }}</div>
            </div>
          </div>
          <div class="p-4 rounded-lg bg-slate-50">
           <h3 class="font-semibold text-slate-900">Immediate Recommendations</h3>
          <ul class="mt-2 list-disc pl-5 text-slate-700 space-y-2">
            <li *ngFor="let tip of recSvc.computeRecommendations(spec()!, responses())">{{ tip }}</li>
          </ul>
          <br/>
          <div class="font-medium text-slate-900 mb-2">Follow-up Actions</div>
            <ul class="mt-2 list-disc pl-5 text-slate-700 space-y-2">
              <li *ngFor="let rec of timeline.recommendations">{{ rec }}</li>
            </ul>
          </div>
        </div>

        <!-- Detailed guidance section for exit readiness -->
        <div class="mt-6 rounded-xl border border-slate-200 bg-white p-6 text-base detailed-guidance">
          <h3 class="font-semibold text-slate-900">General Domain Level Guidance</h3>
          <p class="mt-2 text-sm text-slate-700">Exit readiness varies by business size, industry, and transaction type. A trade sale to a competitor has different requirements than a PE acquisition. The guidance below is tailored to improving specific scores in each domain, but is not targeted to your industry or transaction type.</p>
          <p class="mt-2 text-sm text-slate-700">Typical improvement: one maturity level per 6-12 months with focused effort. Larger organisations may require 12-18 months per level. Financial and Legal domains often show the fastest ROI from improvement investment.</p>
          <p class="mt-2 text-sm text-slate-700">The following sections provide domain-specific guidance based on your current scores:</p>
            <!-- Financial -->
            <div class="mt-4">
              <h4 class="font-semibold text-slate-900">Financial</h4>
              <p class="text-sm text-slate-700">Financial readiness is the single most critical domain for exit transactions. Buyers will scrutinize historical performance, quality of earnings, and working capital. This domain cannot be compensated for by strength in other areas.</p>
              <p *ngIf="dimScore('financial') < 1" class="mt-2 text-sm text-slate-700"><strong>URGENT:</strong> You are at Level 0 (Incomplete) - this is a deal-breaker. Immediately prioritize: (1) establishing proper bookkeeping and filing statutory accounts, (2) producing monthly management accounts, (3) documenting revenue recognition policies. Expect 18-24 months to reach transaction-ready state. Engage a qualified accountant immediately.</p>
              <p *ngIf="dimScore('financial') >= 1 && dimScore('financial') < 2" class="mt-2 text-sm text-slate-700"><strong>Foundation in place but gaps remain.</strong> Focus on: (1) obtaining audited accounts for last 2-3 years, (2) normalising EBITDA (add-backs for one-off costs, owner remuneration), (3) improving management reporting quality and frequency. You are suitable for trade buyer conversations but expect significant commercial discount. Target 9-15 months to Level 2.</p>
              <p *ngIf="dimScore('financial') >= 2 && dimScore('financial') < 3" class="mt-2 text-sm text-slate-700"><strong>Transaction-ready for most buyers.</strong> To elevate to premium tier: (1) prepare vendor due diligence pack (VDD), (2) obtain tax clearances and resolve any disputes, (3) build detailed financial model with sensitivity analysis. Consider engaging transaction advisors. PE buyers will expect Level 3+ for competitive processes.</p>
              <p *ngIf="dimScore('financial') >= 3" class="mt-2 text-sm text-slate-700"><strong>Excellent position.</strong> You meet institutional standards. Focus on: (1) maintaining audit-ready position, (2) ensuring locked-box mechanics are viable for competitive process, (3) demonstrating predictable cash conversion. VDD investment will yield significant ROI by accelerating process and supporting valuation.</p>
            </div>

            <!-- Legal & Corporate -->
            <div class="mt-4">
              <h4 class="font-semibold text-slate-900">Legal & Corporate</h4>
              <p class="text-sm text-slate-700">Legal and corporate governance issues can derail transactions late in the process or create significant warranty/indemnity exposure. Clean legal housekeeping signals professionalism and reduces transaction risk.</p>
              <p *ngIf="dimScore('legal') < 1" class="mt-2 text-sm text-slate-700"><strong>URGENT:</strong> Level 0 creates deal risk and liability exposure. Immediately: (1) update statutory registers and file overdue returns, (2) document all material contracts and verify they are properly executed, (3) confirm IP ownership and employment contracts. Engage a corporate lawyer to conduct a legal health check. Expect 12-18 months to reach baseline.</p>
              <p *ngIf="dimScore('legal') >= 1 && dimScore('legal') < 2" class="mt-2 text-sm text-slate-700"><strong>Basic compliance in place.</strong> To reach transaction readiness: (1) complete statutory books and ensure all filings are current, (2) catalog all material contracts (customers, suppliers, leases) and identify issues, (3) verify all IP is owned or licensed, not infringing. Address any litigation or regulatory issues. Target Level 2 within 9-12 months.</p>
              <p *ngIf="dimScore('legal') >= 2 && dimScore('legal') < 3" class="mt-2 text-sm text-slate-700"><strong>Transaction-ready.</strong> To optimise: (1) conduct full legal audit to identify any residual issues, (2) prepare legal DD pack (cap table, contracts schedule, IP assignments), (3) resolve any outstanding litigation or regulatory matters. PE buyers expect Level 3 for clean exits.</p>
              <p *ngIf="dimScore('legal') >= 3" class="mt-2 text-sm text-slate-700"><strong>Excellent position.</strong> Your legal and corporate position is institutional-grade. Maintain currency of filings and contracts. Legal VDD will be straightforward and should not reveal material issues. Focus on other domain gaps if any remain.</p>
            </div>

            <!-- Commercial -->
            <div class="mt-4">
              <h4 class="font-semibold text-slate-900">Commercial</h4>
              <p class="text-sm text-slate-700">Commercial strength—customer diversification, recurring revenue, retention, and market position—directly impacts valuation multiples. Buyers pay premiums for predictable, growing revenue with low customer concentration risk.</p>
              <p *ngIf="dimScore('commercial') < 1" class="mt-2 text-sm text-slate-700"><strong>URGENT:</strong> You lack basic commercial tracking. Immediately: (1) implement customer tracking system and understand revenue by customer, (2) identify top 10 customers and concentration risk, (3) begin tracking win/loss and pipeline. Without this foundation, valuation will be heavily discounted. Expect 12-18 months to build baseline.</p>
              <p *ngIf="dimScore('commercial') >= 1 && dimScore('commercial') < 2" class="mt-2 text-sm text-slate-700"><strong>Foundation in place.</strong> To improve: (1) reduce customer concentration (ideally no customer >15% revenue), (2) build recurring or repeat revenue model, (3) track retention and churn metrics, (4) evidence pipeline and sales process. Recurring revenue models command 2-3x higher multiples than project-based. Target 9-15 months.</p>
              <p *ngIf="dimScore('commercial') >= 2 && dimScore('commercial') < 3" class="mt-2 text-sm text-slate-700"><strong>Good commercial position.</strong> To elevate: (1) evidence market position and competitive differentiation, (2) improve LTV/CAC economics and demonstrate unit economics, (3) strengthen customer relationships (NPS, references, case studies). PE buyers expect this level for growth-focused acquisitions.</p>
              <p *ngIf="dimScore('commercial') >= 3" class="mt-2 text-sm text-slate-700"><strong>Excellent commercial profile.</strong> You demonstrate strong revenue quality and market position. Focus on articulating growth strategy and market opportunity in investment memorandum. Your commercial metrics will be a key value driver.</p>
            </div>

            <!-- Operational -->
            <div class="mt-4">
              <h4 class="font-semibold text-slate-900">Operational</h4>
              <p class="text-sm text-slate-700">Operational maturity demonstrates the business can run without the founder and scale post-transaction. Documented processes, IT resilience, and disaster recovery are table stakes for institutional buyers.</p>
              <p *ngIf="dimScore('operational') < 1" class="mt-2 text-sm text-slate-700"><strong>URGENT:</strong> Level 0 indicates high founder dependency and operational risk. Immediately: (1) document core processes (sales, delivery, finance, operations), (2) implement basic IT backups and security, (3) identify single points of failure (key person dependencies). This is a significant red flag for buyers. Expect 18-24 months to build foundation.</p>
              <p *ngIf="dimScore('operational') >= 1 && dimScore('operational') < 2" class="mt-2 text-sm text-slate-700"><strong>Basic processes exist.</strong> To improve: (1) create SOPs for all critical processes, (2) reduce founder dependency (hire management layer or document decision-making), (3) implement disaster recovery and business continuity plans, (4) improve IT systems and infrastructure documentation. Target Level 2 within 12 months.</p>
              <p *ngIf="dimScore('operational') >= 2 && dimScore('operational') < 3" class="mt-2 text-sm text-slate-700"><strong>Transaction-ready.</strong> To optimise: (1) demonstrate operational scalability (capacity for growth), (2) prepare operational DD materials (process maps, IT architecture, supplier dependencies), (3) test disaster recovery procedures. PE buyers expect this for platform acquisitions.</p>
              <p *ngIf="dimScore('operational') >= 3" class="mt-2 text-sm text-slate-700"><strong>Excellent operational position.</strong> You demonstrate institutional-grade operations that can scale. Operational DD should be straightforward. Use this as evidence of quality management in investment memorandum.</p>
            </div>

            <!-- People & Organisation -->
            <div class="mt-4">
              <h4 class="font-semibold text-slate-900">People & Organisation</h4>
              <p class="text-sm text-slate-700">Management depth, employee retention, and HR compliance are critical for value preservation post-close. Buyers fear key person risk and employee exodus. Strong HR practices support premium valuations.</p>
              <p *ngIf="dimScore('people') < 1" class="mt-2 text-sm text-slate-700"><strong>URGENT:</strong> Level 0 creates significant transaction risk. Immediately: (1) ensure all employees have proper employment contracts, (2) identify key person dependencies and create retention/succession plans, (3) document org chart and roles. Expect significant buyer concern about people risk. Target 12-18 months to baseline.</p>
              <p *ngIf="dimScore('people') >= 1 && dimScore('people') < 2" class="mt-2 text-sm text-slate-700"><strong>Basic compliance in place.</strong> To improve: (1) build management depth (hire or promote senior team members who can operate independently), (2) implement HR policies (handbook, performance reviews, compensation framework), (3) create retention plans for key employees, (4) track turnover and identify flight risks. Target Level 2 within 9-12 months.</p>
              <p *ngIf="dimScore('people') >= 2 && dimScore('people') < 3" class="mt-2 text-sm text-slate-700"><strong>Transaction-ready.</strong> To optimise: (1) demonstrate management continuity (team can run without founder), (2) implement long-term incentive plans (equity, bonuses tied to transaction), (3) prepare people DD materials (org chart, compensation benchmarking, retention agreements). PE buyers expect Level 3 for management buyouts or growth equity.</p>
              <p *ngIf="dimScore('people') >= 3" class="mt-2 text-sm text-slate-700"><strong>Excellent people position.</strong> You have institutional-grade HR and management depth. People DD should be clean. Consider using management quality as a key selling point—buyers pay premiums for strong teams.</p>
            </div>

            <!-- ESG & Risk -->
            <div class="mt-4">
              <h4 class="font-semibold text-slate-900">ESG & Risk</h4>
              <p class="text-sm text-slate-700">ESG and risk management are increasingly important for exit transactions, particularly with PE and larger corporates. H&S incidents, data breaches, or regulatory non-compliance can derail deals or trigger indemnity claims post-close.</p>
              <p *ngIf="dimScore('esg') < 1" class="mt-2 text-sm text-slate-700"><strong>URGENT:</strong> Level 0 creates deal risk and potential liability. Immediately: (1) achieve basic H&S compliance (risk assessments, incident reporting), (2) ensure GDPR/data protection baseline compliance (privacy policy, data mapping, consent), (3) document policies and training. Expect 12 months to reach baseline. Regulatory issues discovered in DD can kill deals.</p>
              <p *ngIf="dimScore('esg') >= 1 && dimScore('esg') < 2" class="mt-2 text-sm text-slate-700"><strong>Basic compliance in place.</strong> To improve: (1) formalize risk management framework (risk register, mitigation plans), (2) improve H&S and environmental practices (certifications if relevant to industry), (3) strengthen data protection and cyber security (penetration testing, ISO27001 consideration). Target Level 2 within 9-12 months.</p>
              <p *ngIf="dimScore('esg') >= 2 && dimScore('esg') < 3" class="mt-2 text-sm text-slate-700"><strong>Transaction-ready.</strong> To optimise: (1) achieve relevant certifications (ISO9001, ISO27001, ISO14001), (2) prepare ESG DD pack (policies, training records, incident history), (3) articulate ESG strategy (particularly relevant for PE buyers with ESG mandates). Level 3 is increasingly expected by institutional buyers.</p>
              <p *ngIf="dimScore('esg') >= 3" class="mt-2 text-sm text-slate-700"><strong>Excellent ESG position.</strong> You meet institutional standards. ESG DD should be clean. PE buyers with ESG mandates will see this as a positive signal. Consider highlighting ESG credentials in investment memorandum.</p>
            </div>

          </div>

        <!-- Appendix - Your Answers -->
        <div class="mt-6 rounded-xl border border-slate-200 bg-white p-6 text-base">
          <h2 class="text-xl font-bold text-slate-900 mb-6">Appendix - Your Answers</h2>
          <div class="grid md:grid-cols-2 gap-6">
            <div *ngFor="let d of s.dimensions">
              <div class="flex items-center justify-between mb-3">
                <h3 class="font-semibold text-slate-900">{{ d.name }}</h3>
                <div class="text-sm text-slate-700 font-medium">{{ dimScore(d.id) | number:'1.0-2' }} / {{ s.scale.max }}</div>
              </div>
              <div class="text-sm text-slate-700">
                <ol class="list-decimal pl-5 space-y-2">
                  <li *ngFor="let q of d.questions">
                    <div class="font-medium">{{ q.text }}</div>
                    <div class="text-sm text-slate-600">Answer: <span class="font-semibold">{{ labelFor(responses()[q.id]) }}</span></div>
                    <div class="mt-1 text-sm text-slate-600" *ngIf="responses()[q.id] !== undefined">
                      <strong>This means:</strong> {{ explanationFor(q.id, responses()[q.id]) }}
                    </div>
                  </li>
                </ol>
              </div>
            </div>
          </div>
        </div>

      </ng-container>

      <ng-template #loading>
        <div class="py-24 text-center text-slate-600">Preparing report…</div>
      </ng-template>
    </section>
  `,
  styles: [`
    @media print {
      .btn { display: none !important; }
      header, footer { display: none !important; }
      .container { max-width: 100% !important; padding: 0 !important; }
    }

    /* Ensure radar svg is square on the report page only and allow labels to be visible */
    :host ::ng-deep app-radar svg {
      width: 100%;
      height: auto !important;
      aspect-ratio: 1 / 1;
      display: block;
      overflow: visible;
    }
    /* Ensure the radar container doesn't clip and keeps labels visible */
    :host ::ng-deep app-radar { overflow: visible; }

       /* NEW FIX: Override the scaling of text labels within the radar plots.
   1. Use ::ng-deep to penetrate the component boundary.
   2. Target the SVG <text> elements.
   3. Set a font size using 'vw' (viewport width) units. This ensures the labels
      have a consistent max-size regardless of how much the SVG is scaled up.
   4. A value like 0.7vw is typically appropriate for small labels on a desktop.
 */
 :host ::ng-deep app-radar svg text {
   font-size: 0.7vw !important; /* Adjust this value (e.g., 0.6vw to 0.9vw) until the labels look right */
 }

 /* Make any .text-sm inside the guidance containers slightly larger than the default small size */
 :host ::ng-deep .detailed-guidance .text-sm,
:host ::ng-deep .industry-guidance .text-sm,
:host ::ng-deep .comparison-guidance .text-sm {
   font-size: 0.95rem !important; /* slightly larger than typical tailwind text-sm */
   line-height: 1.5 !important;
 }
  `]
})
export class ReportPageComponent implements OnInit {
  private svc = inject(AssessmentService);
  recSvc = inject(RecommendationService);
  valuationSvc = inject(ValuationService);
  magiliumSvc = inject(MagiliumImpactService);
  router = inject(Router);

  spec = signal<AssessmentSpec | null>(null);
  responses = signal<Responses>({});

  primaryColor = '#3f1954';
  accentColor = '#ed0776';

  // Valuation signals
  valuationInputs = signal<ValuationInputs | null>(null);
  methodologySectionExpanded = signal(false);

  // Magilium impact section signals
  magiliumSectionExpanded = signal(false);
  magiliumEvidenceExpanded = signal(false);

  valuationResult = computed<ValuationResult | null>(() => {
    const inputs = this.valuationInputs();
    if (!inputs) return null;
    return this.valuationSvc.calculateValuation(inputs);
  });

  toggleMethodologySection() {
    this.methodologySectionExpanded.update((v) => !v);
  }

  toggleMagiliumSection() {
    this.magiliumSectionExpanded.update((v) => !v);
  }

  toggleMagiliumEvidence() {
    this.magiliumEvidenceExpanded.update((v) => !v);
  }

  // Magilium impact computed signal
  magiliumImpact = computed<MagiliumImpactSummary | null>(() => {
    const spec = this.spec();
    const resp = this.responses();
    if (!spec || !resp) return null;

    // Build domain averages
    const domainAverages = spec.dimensions.map((d) => ({
      id: d.id,
      name: d.name,
      avg: this.dimScore(d.id),
    }));

    // Get threshold violations
    const thresholdViolations = this.recSvc.detectThresholdViolations(spec, resp);

    // Count domains below minimum benchmark
    const comparison = this.benchmarkComparison();
    const belowMinimumCount = comparison
      ? comparison.gaps.filter((g) => g.belowMinimum).length
      : 0;

    return this.magiliumSvc.calculateImpact(
      domainAverages,
      thresholdViolations,
      this.valuationResult(),
      this.valuationInputs(),
      belowMinimumCount
    );
  });

  magiliumStatistics = computed<MagiliumStatistic[]>(() => {
    return this.magiliumSvc.getStatistics();
  });

  // Computed signals for exit readiness features
  thresholdViolations = computed(() =>
    this.spec() && this.responses() ? this.recSvc.detectThresholdViolations(this.spec()!, this.responses()) : []
  );

  timelineGuidance = computed(() => {
    const spec = this.spec();
    const responses = this.responses();
    const sector = this.selectedSector();
    const lifecycle = this.selectedLifecycle();

    if (!spec || !responses) return null;

    return this.recSvc.generateTimelineGuidance(spec, responses, sector, lifecycle);
  });

  // For sector comparison (legacy - kept for backwards compatibility)
  selectedSector = signal<string>('');
  sectorBenchmark = computed(() =>
    this.selectedSector() && this.spec() ? this.recSvc.getSectorBenchmark(this.spec()!, this.selectedSector()) : null
  );

  // New benchmark comparison
  selectedLifecycle = signal<string>('');
  benchmarkComparison = computed(() => {
    const sector = this.selectedSector();
    const lifecycle = this.selectedLifecycle();
    const spec = this.spec();
    const resp = this.responses();
    if (!sector || !lifecycle || !spec || !resp) return null;
    return this.recSvc.getBenchmarkComparison(spec, resp, sector, lifecycle);
  });

  availableSectors = computed(() => {
    const spec = this.spec();
    return spec ? this.recSvc.getAvailableSectors(spec) : [];
  });

  availableLifecyclePhases = computed(() => {
    const spec = this.spec();
    return spec ? this.recSvc.getAvailableLifecyclePhases(spec) : [];
  });

  // small UI toast for copy feedback
  copyToast = signal<{ text: string } | null>(null);

  // encoding constants must match assessment page
  private readonly CODE_MUL = 15485863n;
  private readonly CODE_OFF = 32452843n;

  get exportCode(): string {
    try {
      const s = this.spec();
      if (!s) return '';
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

      // Pack all values: 36 questions (0-4 each) + sector (0-N) + lifecycle (0-M)
      let acc = 0n;
      for (const v of answers) acc = acc * 5n + BigInt(v);
      // Append sector and lifecycle (use base matching the max possible values)
      acc = acc * BigInt(sectors.length + 1) + BigInt(sectorValue);
      acc = acc * BigInt(phases.length + 1) + BigInt(lifecycleValue);

      // Encode valuation data
      const valuation = this.valuationInputs() ?? getDefaultValuationInputs();
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

      const obf = acc * this.CODE_MUL + this.CODE_OFF;
      const checksum = Number(obf % 36n);
      const main = this.bigIntToBase36(obf);
      return (main + checksum.toString(36)).toUpperCase();
    } catch (e) { return ''; }
  }

  // Encode financial value: scale to thousands, cap at 100M
  private encodeFinancialValue(value: number | null): number {
    if (value === null || value === undefined) return 0;
    // Scale to thousands and cap
    const scaled = Math.round(value / 1000);
    return Math.max(0, Math.min(100000, scaled));
  }

  private bigIntToBase36(n: bigint) {
    if (n === 0n) return '0';
    const chars: string[] = [];
    let v = n < 0n ? -n : n;
    while (v > 0n) {
      const d = Number(v % 36n);
      chars.push(d.toString(36));
      v = v / 36n;
    }
    return chars.reverse().join('');
  }


  ngOnInit(): void {
    // guard: only allow if finalize set
    const allowed = localStorage.getItem('exit-readiness:canViewReport');
    if (!allowed) {
      this.router.navigate(['/']);
      return;
    }

    this.svc.load().subscribe((spec) => {
      this.spec.set(spec);
      // load saved responses
      try {
        const raw = localStorage.getItem(`exit-readiness:${spec.title ?? 'default'}`);
        if (raw) this.responses.set(JSON.parse(raw));
      } catch (e) { /* ignore */ }

      // load saved sector and lifecycle selections
      try {
        const savedSector = localStorage.getItem('exit-readiness:selectedSector');
        const savedLifecycle = localStorage.getItem('exit-readiness:selectedLifecycle');
        if (savedSector) this.selectedSector.set(savedSector);
        if (savedLifecycle) this.selectedLifecycle.set(savedLifecycle);
      } catch (e) { /* ignore */ }

      // load valuation inputs
      try {
        const valuationRaw = localStorage.getItem('exit-readiness:valuationInputs');
        if (valuationRaw) {
          const parsed = JSON.parse(valuationRaw) as ValuationInputs;
          if (parsed && typeof parsed === 'object') {
            this.valuationInputs.set(parsed);
          }
        }
      } catch (e) { /* ignore */ }

      // clear guard so route can't be reused unintentionally
      try { localStorage.removeItem('exit-readiness:canViewReport'); } catch (e) {}
    });
  }

  // helper methods copied from assessment page to compute scores and recommendations
  labelFor(value: number) {
    const s = this.spec();
    if (!s) return String(value);
    const idx = value - s.scale.min;
    return s.scale.labels[idx] ?? String(value);
  }

  dimScore(dimId: string) {
    const s = this.spec();
    if (!s) return 0;
    const dim = s.dimensions.find((d) => d.id === dimId);
    if (!dim) return 0;
    const values = dim.questions.map((q) => this.responses()[q.id]).filter((v): v is number => typeof v === 'number');
    if (!values.length) return 0;
    const avg = values.reduce((a, b) => a + b, 0) / values.length;
    return avg;
  }

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

  sectorComparisonValues() {
    const s = this.spec();
    const benchmark = this.sectorBenchmark();
    if (!s || !benchmark) return [] as number[];
    return s.dimensions.map(d => benchmark.scores[d.id] || 0);
  }

  benchmarkMinimumValues() {
    const comparison = this.benchmarkComparison();
    if (!comparison) return [] as number[];
    return this.recSvc.domainScoresToArray(comparison.minimumScores);
  }

  benchmarkAverageValues() {
    const comparison = this.benchmarkComparison();
    if (!comparison) return [] as number[];
    return this.recSvc.domainScoresToArray(comparison.averageScores);
  }

  overallScore() {
    const s = this.spec();
    if (!s) return 0;
    const weights = s.dimensions.map((d) => d.weight ?? 1);
    const totalW = weights.reduce((a, b) => a + b, 0);
    const sum = s.dimensions.reduce((acc, d) => acc + this.dimScore(d.id) * (d.weight ?? 1), 0);
    return totalW ? sum / totalW : 0;
  }

  overallPercent() {
    const s = this.spec();
    if (!s) return 0;
    const max = s.scale.max;
    const score = this.overallScore();
    return max ? (score / max) * 100 : 0;
  }

  overallLevel() {
    const s = this.spec();
    if (!s) return null;
    const score = this.overallScore();
    return s.levels.find((lvl) => score >= lvl.min && score < lvl.max) ?? s.levels[s.levels.length - 1] ?? null;
  }

  levelColor(lvl: any) { return lvl?.color ?? '#334155'; }

  recommendations() {
    const s = this.spec();
    if (!s) return [] as string[];
    const tips: string[] = [];
    for (const d of s.dimensions) {
      const score = this.dimScore(d.id);
      if (score < (s.scale.min + s.scale.max) / 2) {
        tips.push(`${d.name}: Focus on improving foundational practices.`);
      } else if (score < s.scale.max - 0.5) {
        tips.push(`${d.name}: Standardise and measure to progress to the next level.`);
      } else {
        tips.push(`${d.name}: Continue optimising and innovating.`);
      }
    }
    return tips;
  }

  copy(text: string) {
    if (!text) return;
    // try modern clipboard API first
    if (navigator?.clipboard?.writeText) {
      navigator.clipboard.writeText(text).then(() => this.showCopyToast('Code copied to clipboard'), () => this.fallbackCopy(text));
    } else {
      this.fallbackCopy(text);
    }
  }

  private fallbackCopy(text: string) {
    try {
      const ta = document.createElement('textarea');
      ta.value = text;
      ta.style.position = 'fixed';
      ta.style.left = '-9999px';
      document.body.appendChild(ta);
      ta.select();
      document.execCommand('copy');
      document.body.removeChild(ta);
      this.showCopyToast('Code copied to clipboard');
    } catch (e) {
      this.showCopyToast('Unable to copy');
    }
  }

  showCopyToast(text: string) {
    this.copyToast.set({ text });
    setTimeout(() => this.copyToast.set(null), 2500);
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

  print() { window.print(); }
}
