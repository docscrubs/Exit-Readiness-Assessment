import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';

@Component({
  selector: 'app-methodology-page',
  standalone: true,
  imports: [CommonModule, RouterLink],
  template: `
    <div class="min-h-screen bg-gradient-to-b from-slate-50 to-white">
      <!-- Header -->
      <header class="bg-white border-b border-slate-200 sticky top-0 z-10">
        <div class="container mx-auto px-6 py-4 flex items-center justify-between">
          <div class="flex items-center gap-3">
            <div class="w-10 h-10 rounded-lg bg-gradient-to-br from-purple-600 to-pink-600 flex items-center justify-center">
              <svg class="w-6 h-6 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
              </svg>
            </div>
            <div>
              <h1 class="font-bold text-slate-900">Valuation Methodology</h1>
              <p class="text-xs text-slate-500">SME Exit Readiness Assessment</p>
            </div>
          </div>
          <a routerLink="/" class="btn btn-secondary text-sm">Back to Home</a>
        </div>
      </header>

      <!-- Main Content -->
      <main class="container mx-auto px-6 py-10 lg:py-12 max-w-4xl">
        <!-- Introduction -->
        <section class="mb-10">
          <div class="bg-gradient-to-r from-purple-50 to-pink-50 rounded-xl p-6 border border-purple-100">
            <h2 class="text-2xl font-bold text-slate-900 mb-3">Indicative Valuation Methodology</h2>
            <p class="text-slate-700">
              This document explains how the SME Exit Readiness Assessment calculates indicative business valuations.
              This methodology is provided for transparency and educational purposes.
            </p>
            <div class="mt-4 p-4 bg-white rounded-lg border border-amber-200">
              <div class="flex gap-3">
                <svg class="w-5 h-5 text-amber-600 flex-shrink-0 mt-0.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                </svg>
                <p class="text-sm text-amber-800">
                  <strong>Important:</strong> This is an indicative estimate only, not a professional valuation. Actual transaction values depend on market conditions, buyer synergies, deal structure, negotiation, and comprehensive due diligence. A qualified valuation professional should be engaged before any transaction.
                </p>
              </div>
            </div>
          </div>
        </section>

        <!-- Table of Contents -->
        <nav class="mb-10 p-4 bg-slate-50 rounded-lg border border-slate-200">
          <h3 class="font-semibold text-slate-900 mb-3">Contents</h3>
          <ol class="space-y-1 text-sm">
            <li><a href="#base-methods" class="text-purple-600 hover:text-purple-800 hover:underline">1. Base Valuation Methods</a></li>
            <li><a href="#multiple-ranges" class="text-purple-600 hover:text-purple-800 hover:underline">2. Multiple Ranges by Business Type</a></li>
            <li><a href="#adjustments" class="text-purple-600 hover:text-purple-800 hover:underline">3. Adjustment Factors</a></li>
            <li><a href="#ev-to-equity" class="text-purple-600 hover:text-purple-800 hover:underline">4. Enterprise Value to Equity Value</a></li>
            <li><a href="#confidence" class="text-purple-600 hover:text-purple-800 hover:underline">5. Confidence Levels</a></li>
            <li><a href="#caveats" class="text-purple-600 hover:text-purple-800 hover:underline">6. Important Caveats</a></li>
            <li><a href="#references" class="text-purple-600 hover:text-purple-800 hover:underline">7. References and Sources</a></li>
            <li><a href="#glossary" class="text-purple-600 hover:text-purple-800 hover:underline">8. Glossary</a></li>
          </ol>
        </nav>

        <!-- Section 1: Base Methods -->
        <section id="base-methods" class="mb-10">
          <h2 class="text-xl font-bold text-slate-900 mb-4 flex items-center gap-2">
            <span class="w-8 h-8 rounded-lg bg-purple-100 text-purple-700 flex items-center justify-center text-sm font-bold">1</span>
            Base Valuation Methods
          </h2>

          <div class="space-y-4">
            <div class="bg-white rounded-lg border border-slate-200 p-5">
              <h3 class="font-semibold text-slate-900 mb-2 flex items-center gap-2">
                <svg class="w-5 h-5 text-green-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                EBITDA Multiple Method (Preferred)
              </h3>
              <div class="bg-slate-50 rounded p-3 font-mono text-sm mb-3">
                Enterprise Value = Normalised EBITDA × Industry Multiple
              </div>
              <ul class="text-sm text-slate-700 space-y-1 list-disc pl-5">
                <li><strong>EBITDA</strong> (Earnings Before Interest, Tax, Depreciation & Amortisation) or <strong>Profit</strong> can be used as the earnings base</li>
                <li><strong>Normalised</strong> = average of available years to smooth fluctuations</li>
                <li>This is the standard approach for established businesses with reliable profit data</li>
              </ul>
            </div>

            <div class="bg-white rounded-lg border border-slate-200 p-5">
              <h3 class="font-semibold text-slate-900 mb-2 flex items-center gap-2">
                <svg class="w-5 h-5 text-blue-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                Revenue Multiple Method (Fallback)
              </h3>
              <div class="bg-slate-50 rounded p-3 font-mono text-sm mb-3">
                Enterprise Value = Annual Turnover × Revenue Multiple
              </div>
              <ul class="text-sm text-slate-700 space-y-1 list-disc pl-5">
                <li>Used when profitability data is unavailable for smaller businesses (turnover under £3M)</li>
                <li>Less accurate as it doesn't account for profitability differences between businesses</li>
                <li>Appropriate for early-stage or high-growth businesses where profits are reinvested</li>
              </ul>
            </div>
          </div>
        </section>

        <!-- Section 2: Multiple Ranges -->
        <section id="multiple-ranges" class="mb-10">
          <h2 class="text-xl font-bold text-slate-900 mb-4 flex items-center gap-2">
            <span class="w-8 h-8 rounded-lg bg-purple-100 text-purple-700 flex items-center justify-center text-sm font-bold">2</span>
            Multiple Ranges by Business Type
          </h2>

          <div class="overflow-x-auto">
            <table class="w-full text-sm border-collapse">
              <thead>
                <tr class="bg-slate-100">
                  <th class="border border-slate-200 px-4 py-2 text-left font-semibold">Business Type</th>
                  <th class="border border-slate-200 px-4 py-2 text-center font-semibold">EBITDA Multiple</th>
                  <th class="border border-slate-200 px-4 py-2 text-center font-semibold">Revenue Multiple</th>
                  <th class="border border-slate-200 px-4 py-2 text-left font-semibold">Rationale</th>
                </tr>
              </thead>
              <tbody>
                <tr class="bg-white">
                  <td class="border border-slate-200 px-4 py-3 font-medium">Service Business</td>
                  <td class="border border-slate-200 px-4 py-3 text-center">2x – 4x</td>
                  <td class="border border-slate-200 px-4 py-3 text-center">0.5x – 1.0x</td>
                  <td class="border border-slate-200 px-4 py-3 text-slate-600">Lower capital intensity, higher labour dependency, relationship-driven</td>
                </tr>
                <tr class="bg-slate-50">
                  <td class="border border-slate-200 px-4 py-3 font-medium">Product Business</td>
                  <td class="border border-slate-200 px-4 py-3 text-center">3x – 6x</td>
                  <td class="border border-slate-200 px-4 py-3 text-center">0.8x – 1.5x</td>
                  <td class="border border-slate-200 px-4 py-3 text-slate-600">Asset base, inventory value, manufacturing scalability</td>
                </tr>
                <tr class="bg-white">
                  <td class="border border-slate-200 px-4 py-3 font-medium">Tech/SaaS</td>
                  <td class="border border-slate-200 px-4 py-3 text-center">4x – 10x</td>
                  <td class="border border-slate-200 px-4 py-3 text-center">1.0x – 2.0x</td>
                  <td class="border border-slate-200 px-4 py-3 text-slate-600">High scalability, recurring revenue potential, IP value, lower marginal costs</td>
                </tr>
              </tbody>
            </table>
          </div>

          <div class="mt-6 grid md:grid-cols-3 gap-4">
            <div class="bg-blue-50 rounded-lg p-4 border border-blue-200">
              <h4 class="font-semibold text-blue-900 mb-2">Service Businesses</h4>
              <p class="text-xs text-blue-800">Trade at lower multiples because revenue depends on key personnel, harder to scale without proportional cost increases, and customer relationships may not transfer easily.</p>
            </div>
            <div class="bg-green-50 rounded-lg p-4 border border-green-200">
              <h4 class="font-semibold text-green-900 mb-2">Product Businesses</h4>
              <p class="text-xs text-green-800">Command mid-range multiples due to physical assets and inventory value, scalable manufacturing processes, and brand value that transfers with the business.</p>
            </div>
            <div class="bg-purple-50 rounded-lg p-4 border border-purple-200">
              <h4 class="font-semibold text-purple-900 mb-2">Tech/SaaS Businesses</h4>
              <p class="text-xs text-purple-800">Attract higher multiples because software scales with minimal cost, recurring subscriptions are predictable, IP creates defensible value, and gross margins are typically 65-80%.</p>
            </div>
          </div>
        </section>

        <!-- Section 3: Adjustment Factors -->
        <section id="adjustments" class="mb-10">
          <h2 class="text-xl font-bold text-slate-900 mb-4 flex items-center gap-2">
            <span class="w-8 h-8 rounded-lg bg-purple-100 text-purple-700 flex items-center justify-center text-sm font-bold">3</span>
            Adjustment Factors
          </h2>

          <div class="space-y-6">
            <!-- Customer Concentration -->
            <div class="bg-white rounded-lg border border-slate-200 p-5">
              <h3 class="font-semibold text-slate-900 mb-3">Customer Concentration</h3>
              <table class="w-full text-sm border-collapse mb-3">
                <thead>
                  <tr class="bg-slate-100">
                    <th class="border border-slate-200 px-3 py-2 text-left">Level</th>
                    <th class="border border-slate-200 px-3 py-2 text-center">Adjustment</th>
                    <th class="border border-slate-200 px-3 py-2 text-left">Description</th>
                  </tr>
                </thead>
                <tbody>
                  <tr>
                    <td class="border border-slate-200 px-3 py-2 font-medium text-red-700">High (&gt;40% from one customer)</td>
                    <td class="border border-slate-200 px-3 py-2 text-center text-red-600">-20% to -30%</td>
                    <td class="border border-slate-200 px-3 py-2 text-slate-600">Significant revenue risk if key customer leaves</td>
                  </tr>
                  <tr class="bg-slate-50">
                    <td class="border border-slate-200 px-3 py-2 font-medium text-amber-700">Medium (20-40%)</td>
                    <td class="border border-slate-200 px-3 py-2 text-center text-amber-600">-10% to -15%</td>
                    <td class="border border-slate-200 px-3 py-2 text-slate-600">Moderate concentration risk</td>
                  </tr>
                  <tr>
                    <td class="border border-slate-200 px-3 py-2 font-medium text-green-700">Low (&lt;20%)</td>
                    <td class="border border-slate-200 px-3 py-2 text-center text-green-600">No adjustment</td>
                    <td class="border border-slate-200 px-3 py-2 text-slate-600">Well-diversified customer base</td>
                  </tr>
                </tbody>
              </table>
              <p class="text-xs text-slate-600"><strong>Rationale:</strong> High customer concentration increases revenue risk. Buyers apply discounts because losing a key customer could dramatically impact the business. This is one of the most significant factors in SME valuations.</p>
            </div>

            <!-- Recurring Revenue -->
            <div class="bg-white rounded-lg border border-slate-200 p-5">
              <h3 class="font-semibold text-slate-900 mb-3">Recurring Revenue</h3>
              <table class="w-full text-sm border-collapse mb-3">
                <thead>
                  <tr class="bg-slate-100">
                    <th class="border border-slate-200 px-3 py-2 text-left">Recurring %</th>
                    <th class="border border-slate-200 px-3 py-2 text-center">Adjustment</th>
                    <th class="border border-slate-200 px-3 py-2 text-left">Description</th>
                  </tr>
                </thead>
                <tbody>
                  <tr>
                    <td class="border border-slate-200 px-3 py-2 font-medium text-green-700">&gt;70%</td>
                    <td class="border border-slate-200 px-3 py-2 text-center text-green-600">+15% premium</td>
                    <td class="border border-slate-200 px-3 py-2 text-slate-600">Highly predictable revenue stream</td>
                  </tr>
                  <tr class="bg-slate-50">
                    <td class="border border-slate-200 px-3 py-2 font-medium text-blue-700">50-70%</td>
                    <td class="border border-slate-200 px-3 py-2 text-center text-blue-600">+5% to +10% premium</td>
                    <td class="border border-slate-200 px-3 py-2 text-slate-600">Good revenue visibility</td>
                  </tr>
                  <tr>
                    <td class="border border-slate-200 px-3 py-2 font-medium text-slate-700">&lt;50%</td>
                    <td class="border border-slate-200 px-3 py-2 text-center text-slate-600">No adjustment</td>
                    <td class="border border-slate-200 px-3 py-2 text-slate-600">Project-based or transactional revenue</td>
                  </tr>
                </tbody>
              </table>
              <p class="text-xs text-slate-600"><strong>Rationale:</strong> Predictable, contractual revenue reduces risk and supports higher valuations. Subscription or retainer-based models command significant premiums because they're easier to forecast, have lower customer acquisition costs, and higher lifetime value per customer.</p>
            </div>

            <!-- Growth Trend -->
            <div class="bg-white rounded-lg border border-slate-200 p-5">
              <h3 class="font-semibold text-slate-900 mb-3">Growth Trend</h3>
              <table class="w-full text-sm border-collapse mb-3">
                <thead>
                  <tr class="bg-slate-100">
                    <th class="border border-slate-200 px-3 py-2 text-left">Trend</th>
                    <th class="border border-slate-200 px-3 py-2 text-center">Adjustment</th>
                    <th class="border border-slate-200 px-3 py-2 text-left">Description</th>
                  </tr>
                </thead>
                <tbody>
                  <tr>
                    <td class="border border-slate-200 px-3 py-2 font-medium text-green-700">Growing (&gt;10% YoY)</td>
                    <td class="border border-slate-200 px-3 py-2 text-center text-green-600">+10% to +15% premium</td>
                    <td class="border border-slate-200 px-3 py-2 text-slate-600">Momentum attracts buyers</td>
                  </tr>
                  <tr class="bg-slate-50">
                    <td class="border border-slate-200 px-3 py-2 font-medium text-slate-700">Flat</td>
                    <td class="border border-slate-200 px-3 py-2 text-center text-slate-600">No adjustment</td>
                    <td class="border border-slate-200 px-3 py-2 text-slate-600">Stable but not exciting</td>
                  </tr>
                  <tr>
                    <td class="border border-slate-200 px-3 py-2 font-medium text-red-700">Declining</td>
                    <td class="border border-slate-200 px-3 py-2 text-center text-red-600">-15% to -20% discount</td>
                    <td class="border border-slate-200 px-3 py-2 text-slate-600">Higher risk, turnaround required</td>
                  </tr>
                </tbody>
              </table>
              <p class="text-xs text-slate-600"><strong>Rationale:</strong> Growth trajectory significantly impacts buyer willingness to pay. Growing businesses demonstrate market demand and operational capability. Declining businesses require turnaround investment and carry execution risk.</p>
            </div>

            <!-- Company Size -->
            <div class="bg-white rounded-lg border border-slate-200 p-5">
              <h3 class="font-semibold text-slate-900 mb-3">Company Size (EBITDA-Based)</h3>
              <table class="w-full text-sm border-collapse mb-3">
                <thead>
                  <tr class="bg-slate-100">
                    <th class="border border-slate-200 px-3 py-2 text-left">EBITDA Level</th>
                    <th class="border border-slate-200 px-3 py-2 text-center">Multiple Position</th>
                    <th class="border border-slate-200 px-3 py-2 text-left">Rationale</th>
                  </tr>
                </thead>
                <tbody>
                  <tr>
                    <td class="border border-slate-200 px-3 py-2 font-medium">&lt;£500K</td>
                    <td class="border border-slate-200 px-3 py-2 text-center">Lower end of range</td>
                    <td class="border border-slate-200 px-3 py-2 text-slate-600">Higher risk, key person dependency, limited buyer pool</td>
                  </tr>
                  <tr class="bg-slate-50">
                    <td class="border border-slate-200 px-3 py-2 font-medium">£500K – £2M</td>
                    <td class="border border-slate-200 px-3 py-2 text-center">Mid-range</td>
                    <td class="border border-slate-200 px-3 py-2 text-slate-600">Established operations, growing buyer interest</td>
                  </tr>
                  <tr>
                    <td class="border border-slate-200 px-3 py-2 font-medium">&gt;£2M</td>
                    <td class="border border-slate-200 px-3 py-2 text-center">Higher end of range</td>
                    <td class="border border-slate-200 px-3 py-2 text-slate-600">Institutional interest, management depth, proven scalability</td>
                  </tr>
                </tbody>
              </table>
              <p class="text-xs text-slate-600"><strong>Rationale:</strong> Larger businesses command higher multiples due to reduced key person risk, more robust management structures, larger pool of potential buyers (including PE firms), and better negotiating position. Industry data shows significant size premiums: businesses with £200K EBITDA average 3.1x multiples, while those with £10M EBITDA average 8.5x (Source: First Page Sage 2025).</p>
            </div>
          </div>
        </section>

        <!-- Section 4: EV to Equity -->
        <section id="ev-to-equity" class="mb-10">
          <h2 class="text-xl font-bold text-slate-900 mb-4 flex items-center gap-2">
            <span class="w-8 h-8 rounded-lg bg-purple-100 text-purple-700 flex items-center justify-center text-sm font-bold">4</span>
            Enterprise Value to Equity Value
          </h2>

          <div class="bg-white rounded-lg border border-slate-200 p-5">
            <div class="bg-gradient-to-r from-purple-50 to-pink-50 rounded p-4 font-mono text-center mb-4">
              <span class="text-lg font-bold text-purple-900">Equity Value = Enterprise Value − Total Debt</span>
            </div>

            <table class="w-full text-sm border-collapse mb-4">
              <thead>
                <tr class="bg-slate-100">
                  <th class="border border-slate-200 px-4 py-2 text-left font-semibold">Term</th>
                  <th class="border border-slate-200 px-4 py-2 text-left font-semibold">Definition</th>
                </tr>
              </thead>
              <tbody>
                <tr>
                  <td class="border border-slate-200 px-4 py-2 font-medium">Enterprise Value (EV)</td>
                  <td class="border border-slate-200 px-4 py-2 text-slate-600">The value of the operating business to all stakeholders</td>
                </tr>
                <tr class="bg-slate-50">
                  <td class="border border-slate-200 px-4 py-2 font-medium">Total Debt</td>
                  <td class="border border-slate-200 px-4 py-2 text-slate-600">All financial liabilities including loans, overdrafts, finance leases, and other borrowings</td>
                </tr>
                <tr>
                  <td class="border border-slate-200 px-4 py-2 font-medium">Equity Value</td>
                  <td class="border border-slate-200 px-4 py-2 text-slate-600">What the owner receives after debt repayment – the "take-home" amount</td>
                </tr>
              </tbody>
            </table>

            <div class="bg-blue-50 rounded-lg p-4 border border-blue-200">
              <h4 class="font-semibold text-blue-900 mb-2">Example</h4>
              <div class="grid grid-cols-3 gap-4 text-center">
                <div>
                  <div class="text-xs text-slate-500">Enterprise Value</div>
                  <div class="text-lg font-bold text-slate-900">£3,000,000</div>
                </div>
                <div>
                  <div class="text-xs text-slate-500">Total Debt</div>
                  <div class="text-lg font-bold text-red-600">− £500,000</div>
                </div>
                <div>
                  <div class="text-xs text-slate-500">Equity Value</div>
                  <div class="text-lg font-bold text-green-600">= £2,500,000</div>
                </div>
              </div>
              <p class="text-xs text-blue-800 mt-3 text-center">The owner receives the Equity Value after debt is repaid</p>
            </div>
          </div>
        </section>

        <!-- Section 5: Confidence Levels -->
        <section id="confidence" class="mb-10">
          <h2 class="text-xl font-bold text-slate-900 mb-4 flex items-center gap-2">
            <span class="w-8 h-8 rounded-lg bg-purple-100 text-purple-700 flex items-center justify-center text-sm font-bold">5</span>
            Confidence Levels
          </h2>

          <div class="bg-white rounded-lg border border-slate-200 p-5">
            <p class="text-sm text-slate-600 mb-4">The confidence level indicates how reliable the valuation estimate is based on data quality:</p>

            <div class="grid md:grid-cols-3 gap-4 mb-4">
              <div class="bg-green-50 rounded-lg p-4 border border-green-200 text-center">
                <div class="w-10 h-10 rounded-full bg-green-100 text-green-700 mx-auto mb-2 flex items-center justify-center">
                  <svg class="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7" />
                  </svg>
                </div>
                <h4 class="font-semibold text-green-900">High</h4>
                <p class="text-xs text-green-800 mt-1">3+ years historical data, all optional adjustments provided, consistent financials</p>
              </div>
              <div class="bg-yellow-50 rounded-lg p-4 border border-yellow-200 text-center">
                <div class="w-10 h-10 rounded-full bg-yellow-100 text-yellow-700 mx-auto mb-2 flex items-center justify-center">
                  <svg class="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8v4m0 4h.01" />
                  </svg>
                </div>
                <h4 class="font-semibold text-yellow-900">Medium</h4>
                <p class="text-xs text-yellow-800 mt-1">1-2 years data, some adjustment factors provided</p>
              </div>
              <div class="bg-orange-50 rounded-lg p-4 border border-orange-200 text-center">
                <div class="w-10 h-10 rounded-full bg-orange-100 text-orange-700 mx-auto mb-2 flex items-center justify-center">
                  <svg class="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                  </svg>
                </div>
                <h4 class="font-semibold text-orange-900">Low</h4>
                <p class="text-xs text-orange-800 mt-1">Minimal data, significant estimation required, missing key factors</p>
              </div>
            </div>

            <div class="bg-slate-50 rounded-lg p-4">
              <h4 class="font-semibold text-slate-900 mb-2">How to improve confidence:</h4>
              <ul class="text-sm text-slate-700 list-disc pl-5 space-y-1">
                <li>Provide more years of historical financial data</li>
                <li>Complete all optional adjustment fields</li>
                <li>Use EBITDA rather than just turnover</li>
              </ul>
            </div>
          </div>
        </section>

        <!-- Section 6: Caveats -->
        <section id="caveats" class="mb-10">
          <h2 class="text-xl font-bold text-slate-900 mb-4 flex items-center gap-2">
            <span class="w-8 h-8 rounded-lg bg-purple-100 text-purple-700 flex items-center justify-center text-sm font-bold">6</span>
            Important Caveats
          </h2>

          <div class="bg-amber-50 rounded-lg border border-amber-200 p-5">
            <p class="text-sm text-amber-900 mb-4">This indicative valuation should be used for guidance only. Key limitations include:</p>

            <div class="grid md:grid-cols-2 gap-4">
              <div class="bg-white rounded-lg p-4 border border-amber-200">
                <h4 class="font-semibold text-slate-900 mb-2">What This Methodology Does NOT Account For:</h4>
                <ul class="text-xs text-slate-700 list-disc pl-4 space-y-1">
                  <li><strong>Specific deal terms</strong> – Earn-outs, deferred consideration, vendor financing</li>
                  <li><strong>Working capital adjustments</strong> – Normal vs. actual working capital at completion</li>
                  <li><strong>Minority/control premiums</strong> – Different values for different ownership stakes</li>
                  <li><strong>Synergies</strong> – Strategic buyers may pay premiums for specific combinations</li>
                  <li><strong>Market timing</strong> – M&A market conditions vary significantly</li>
                  <li><strong>Comparable transactions</strong> – Specific recent deals in your sector</li>
                  <li><strong>Asset values</strong> – Property, equipment, or other specific assets</li>
                  <li><strong>Intellectual property</strong> – Patents, trademarks, proprietary technology</li>
                  <li><strong>Employee/management factors</strong> – Key person risk, retention arrangements</li>
                </ul>
              </div>
              <div class="bg-white rounded-lg p-4 border border-amber-200">
                <h4 class="font-semibold text-slate-900 mb-2">When to Seek Professional Advice:</h4>
                <p class="text-xs text-slate-700 mb-2">We strongly recommend engaging professional advisors when:</p>
                <ul class="text-xs text-slate-700 list-disc pl-4 space-y-1">
                  <li>Considering an actual transaction</li>
                  <li>Valuation exceeds £1M</li>
                  <li>Complex ownership structures exist</li>
                  <li>Significant intangible assets are involved</li>
                  <li>Tax planning is required</li>
                  <li>Multiple potential buyers are expected</li>
                </ul>
              </div>
            </div>
          </div>
        </section>

        <!-- Section 7: References -->
        <section id="references" class="mb-10">
          <h2 class="text-xl font-bold text-slate-900 mb-4 flex items-center gap-2">
            <span class="w-8 h-8 rounded-lg bg-purple-100 text-purple-700 flex items-center justify-center text-sm font-bold">7</span>
            References and Sources
          </h2>

          <div class="bg-white rounded-lg border border-slate-200 p-5">
            <p class="text-sm text-slate-600 mb-4">The multiples and adjustment factors used in this methodology are based on:</p>

            <div class="space-y-4">
              <div>
                <h4 class="font-semibold text-slate-900 mb-2">Industry Valuation Data</h4>
                <ul class="text-sm text-slate-700 space-y-2">
                  <li class="flex items-start gap-2">
                    <svg class="w-4 h-4 text-purple-600 flex-shrink-0 mt-0.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13.828 10.172a4 4 0 00-5.656 0l-4 4a4 4 0 105.656 5.656l1.102-1.101m-.758-4.899a4 4 0 005.656 0l4-4a4 4 0 00-5.656-5.656l-1.1 1.1" />
                    </svg>
                    <span><strong>UK200Group SME Valuation Index 2024</strong> – Median EBITDA multiple 5.4x for UK SMEs</span>
                  </li>
                  <li class="flex items-start gap-2">
                    <svg class="w-4 h-4 text-purple-600 flex-shrink-0 mt-0.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13.828 10.172a4 4 0 00-5.656 0l-4 4a4 4 0 105.656 5.656l1.102-1.101m-.758-4.899a4 4 0 005.656 0l4-4a4 4 0 00-5.656-5.656l-1.1 1.1" />
                    </svg>
                    <span><strong>Hilton Smythe UK Mid-Market Multiples H2 2024</strong> – Industry-specific EBITDA multiples</span>
                  </li>
                  <li class="flex items-start gap-2">
                    <svg class="w-4 h-4 text-purple-600 flex-shrink-0 mt-0.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13.828 10.172a4 4 0 00-5.656 0l-4 4a4 4 0 105.656 5.656l1.102-1.101m-.758-4.899a4 4 0 005.656 0l4-4a4 4 0 00-5.656-5.656l-1.1 1.1" />
                    </svg>
                    <span><strong>First Page Sage EBITDA Multiples for Small Business 2025</strong> – Size-based multiple analysis</span>
                  </li>
                  <li class="flex items-start gap-2">
                    <svg class="w-4 h-4 text-purple-600 flex-shrink-0 mt-0.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13.828 10.172a4 4 0 00-5.656 0l-4 4a4 4 0 105.656 5.656l1.102-1.101m-.758-4.899a4 4 0 005.656 0l4-4a4 4 0 00-5.656-5.656l-1.1 1.1" />
                    </svg>
                    <span><strong>GS Verde UK M&A Deal Multiples 2025</strong> – Sector-specific transaction analysis</span>
                  </li>
                </ul>
              </div>

              <div>
                <h4 class="font-semibold text-slate-900 mb-2">Valuation Methodology</h4>
                <ul class="text-sm text-slate-700 space-y-2">
                  <li class="flex items-start gap-2">
                    <svg class="w-4 h-4 text-blue-600 flex-shrink-0 mt-0.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
                    </svg>
                    <span><strong>Corporate Finance Institute</strong> – Enterprise Value calculation methodology</span>
                  </li>
                  <li class="flex items-start gap-2">
                    <svg class="w-4 h-4 text-blue-600 flex-shrink-0 mt-0.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
                    </svg>
                    <span><strong>Wall Street Prep</strong> – Enterprise Value vs Equity Value detailed comparison</span>
                  </li>
                </ul>
              </div>

              <div>
                <h4 class="font-semibold text-slate-900 mb-2">Adjustment Factor Sources</h4>
                <ul class="text-sm text-slate-700 space-y-1 list-disc pl-5">
                  <li><strong>Customer concentration risk</strong> – Standard PE due diligence practice, L40° insights</li>
                  <li><strong>Recurring revenue premiums</strong> – SaaS Capital benchmarks, ClearlyAcquired analysis</li>
                  <li><strong>Growth rate adjustments</strong> – Industry M&A practice, deal flow analysis</li>
                </ul>
              </div>
            </div>
          </div>
        </section>

        <!-- Section 8: Glossary -->
        <section id="glossary" class="mb-10">
          <h2 class="text-xl font-bold text-slate-900 mb-4 flex items-center gap-2">
            <span class="w-8 h-8 rounded-lg bg-purple-100 text-purple-700 flex items-center justify-center text-sm font-bold">8</span>
            Glossary
          </h2>

          <div class="bg-white rounded-lg border border-slate-200 overflow-hidden">
            <table class="w-full text-sm">
              <thead>
                <tr class="bg-slate-100">
                  <th class="border-b border-slate-200 px-4 py-3 text-left font-semibold w-1/4">Term</th>
                  <th class="border-b border-slate-200 px-4 py-3 text-left font-semibold">Definition</th>
                </tr>
              </thead>
              <tbody>
                <tr class="border-b border-slate-100">
                  <td class="px-4 py-3 font-medium text-purple-700">EBITDA</td>
                  <td class="px-4 py-3 text-slate-600">Earnings Before Interest, Tax, Depreciation and Amortisation – a measure of operating profitability</td>
                </tr>
                <tr class="border-b border-slate-100 bg-slate-50">
                  <td class="px-4 py-3 font-medium text-purple-700">Enterprise Value (EV)</td>
                  <td class="px-4 py-3 text-slate-600">The total value of a business, including debt</td>
                </tr>
                <tr class="border-b border-slate-100">
                  <td class="px-4 py-3 font-medium text-purple-700">Equity Value</td>
                  <td class="px-4 py-3 text-slate-600">The value of the owner's stake after deducting debt</td>
                </tr>
                <tr class="border-b border-slate-100 bg-slate-50">
                  <td class="px-4 py-3 font-medium text-purple-700">Multiple</td>
                  <td class="px-4 py-3 text-slate-600">A factor applied to earnings or revenue to estimate value</td>
                </tr>
                <tr class="border-b border-slate-100">
                  <td class="px-4 py-3 font-medium text-purple-700">Normalised</td>
                  <td class="px-4 py-3 text-slate-600">Adjusted to remove one-off or non-recurring items</td>
                </tr>
                <tr class="border-b border-slate-100 bg-slate-50">
                  <td class="px-4 py-3 font-medium text-purple-700">Recurring Revenue</td>
                  <td class="px-4 py-3 text-slate-600">Revenue that repeats predictably (subscriptions, retainers)</td>
                </tr>
                <tr class="border-b border-slate-100">
                  <td class="px-4 py-3 font-medium text-purple-700">SaaS</td>
                  <td class="px-4 py-3 text-slate-600">Software as a Service – subscription-based software</td>
                </tr>
                <tr>
                  <td class="px-4 py-3 font-medium text-purple-700">Turnover</td>
                  <td class="px-4 py-3 text-slate-600">Total revenue or sales of the business</td>
                </tr>
              </tbody>
            </table>
          </div>
        </section>

        <!-- Footer -->
        <footer class="border-t border-slate-200 pt-6 text-center">
          <p class="text-xs text-slate-500">
            <em>Last updated: January 2026</em>
          </p>
          <p class="text-xs text-slate-500 mt-2">
            This methodology document is provided for informational purposes. The SME Exit Readiness Assessment tool and its valuation estimates are not a substitute for professional financial advice.
          </p>
          <div class="mt-4">
            <a routerLink="/" class="text-sm text-purple-600 hover:text-purple-800 font-medium">← Back to Home</a>
          </div>
        </footer>
      </main>
    </div>
  `,
  styles: [`
    :host {
      display: block;
    }
  `]
})
export class MethodologyPageComponent {}
