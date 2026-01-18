import { Injectable } from '@angular/core';
import {
  BusinessType,
  CustomerConcentration,
  FinancialYearData,
  GrowthTrend,
  MultipleRangeConfig,
  ValuationAdjustment,
  ValuationInputs,
  ValuationResult,
} from '../models/valuation';

/**
 * Service for calculating indicative business valuations.
 *
 * Uses EBITDA or revenue multiples based on business type,
 * with adjustments for customer concentration, recurring revenue,
 * growth trend, and company size.
 *
 * See public/valuation-methodology.md for full methodology documentation.
 */
@Injectable({
  providedIn: 'root',
})
export class ValuationService {
  /**
   * Base multiple ranges by business type.
   * Sources: UK200Group SME Valuation Index 2024, Hilton Smythe H2 2024
   */
  private readonly multipleRanges: MultipleRangeConfig[] = [
    {
      businessType: 'service',
      ebitdaMultipleMin: 2.0,
      ebitdaMultipleMax: 4.0,
      revenueMultipleMin: 0.5,
      revenueMultipleMax: 1.0,
    },
    {
      businessType: 'product',
      ebitdaMultipleMin: 3.0,
      ebitdaMultipleMax: 6.0,
      revenueMultipleMin: 0.8,
      revenueMultipleMax: 1.5,
    },
    {
      businessType: 'tech-saas',
      ebitdaMultipleMin: 4.0,
      ebitdaMultipleMax: 10.0,
      revenueMultipleMin: 1.0,
      revenueMultipleMax: 2.0,
    },
  ];

  /** Maximum turnover for revenue-multiple fallback (£3M) */
  private readonly maxTurnoverForRevenueMultiple = 3_000_000;

  /**
   * Main valuation calculation method.
   * Returns a complete ValuationResult with ranges, adjustments, and caveats.
   */
  calculateValuation(inputs: ValuationInputs): ValuationResult {
    // Check minimum data requirements
    if (!this.hasMinimumData(inputs)) {
      return this.createInsufficientDataResult(inputs);
    }

    const businessType = inputs.businessType!;
    const baseMultiples = this.getBaseMultiples(businessType);

    // Try EBITDA method first (preferred)
    const normalisedEbitda = this.getNormalisedEbitda([
      ...inputs.historicalFinancials,
      ...inputs.forecastFinancials,
    ]);

    if (normalisedEbitda !== null && normalisedEbitda > 0) {
      return this.calculateEbitdaBasedValuation(inputs, normalisedEbitda, baseMultiples);
    }

    // Fallback to revenue method for small businesses
    const latestTurnover = this.getLatestTurnover([
      ...inputs.historicalFinancials,
      ...inputs.forecastFinancials,
    ]);

    if (
      latestTurnover !== null &&
      latestTurnover > 0 &&
      latestTurnover <= this.maxTurnoverForRevenueMultiple
    ) {
      return this.calculateRevenueBasedValuation(inputs, latestTurnover, baseMultiples);
    }

    // If turnover > £3M but no EBITDA, we can't calculate
    if (latestTurnover !== null && latestTurnover > this.maxTurnoverForRevenueMultiple) {
      return {
        isCalculable: false,
        method: 'insufficient-data',
        enterpriseValueMin: null,
        enterpriseValueMax: null,
        equityValueMin: null,
        equityValueMax: null,
        multipleMin: null,
        multipleMax: null,
        baseValue: null,
        baseValueLabel: '',
        adjustments: [],
        confidence: 'low',
        caveats: [
          'EBITDA/Profit data is required for businesses with turnover above £3M.',
          'Please provide at least one year of EBITDA or profit data.',
        ],
      };
    }

    return this.createInsufficientDataResult(inputs);
  }

  /**
   * Check if we have minimum data for any valuation method.
   */
  hasMinimumData(inputs: ValuationInputs): boolean {
    if (!inputs.businessType) {
      return false;
    }

    const allFinancials = [...inputs.historicalFinancials, ...inputs.forecastFinancials];

    // Need at least one year with either EBITDA or turnover
    const hasEbitda = allFinancials.some(
      (f) => f.ebitda !== null && f.ebitda !== undefined && f.ebitda > 0
    );
    const hasTurnover = allFinancials.some(
      (f) => f.turnover !== null && f.turnover !== undefined && f.turnover > 0
    );

    return hasEbitda || hasTurnover;
  }

  /**
   * Calculate normalised EBITDA from available financial data.
   * Uses average of all years with data to smooth fluctuations.
   */
  getNormalisedEbitda(financials: FinancialYearData[]): number | null {
    const validValues = financials
      .filter((f) => f.ebitda !== null && f.ebitda !== undefined)
      .map((f) => f.ebitda as number);

    if (validValues.length === 0) {
      return null;
    }

    // Return average for normalisation
    const sum = validValues.reduce((a, b) => a + b, 0);
    return sum / validValues.length;
  }

  /**
   * Get the most recent turnover value.
   */
  getLatestTurnover(financials: FinancialYearData[]): number | null {
    // Sort by year descending and find first with turnover
    const sorted = [...financials].sort((a, b) => b.year - a.year);
    const withTurnover = sorted.find(
      (f) => f.turnover !== null && f.turnover !== undefined && f.turnover > 0
    );

    return withTurnover?.turnover ?? null;
  }

  /**
   * Get base multiple ranges for a business type.
   */
  getBaseMultiples(businessType: BusinessType): MultipleRangeConfig {
    return (
      this.multipleRanges.find((r) => r.businessType === businessType) ?? this.multipleRanges[0]
    );
  }

  /**
   * Calculate valuation using EBITDA multiple method.
   */
  private calculateEbitdaBasedValuation(
    inputs: ValuationInputs,
    normalisedEbitda: number,
    baseMultiples: MultipleRangeConfig
  ): ValuationResult {
    const { adjustedMin, adjustedMax, adjustments } = this.applyAdjustments(
      baseMultiples.ebitdaMultipleMin,
      baseMultiples.ebitdaMultipleMax,
      inputs,
      normalisedEbitda
    );

    const evMin = normalisedEbitda * adjustedMin;
    const evMax = normalisedEbitda * adjustedMax;

    const debt = inputs.totalDebt ?? 0;
    const equityMin = Math.max(0, evMin - debt);
    const equityMax = Math.max(0, evMax - debt);

    const caveats = this.generateCaveats(inputs, 'ebitda-multiple', normalisedEbitda);
    const confidence = this.determineConfidence(inputs);

    return {
      isCalculable: true,
      method: 'ebitda-multiple',
      enterpriseValueMin: evMin,
      enterpriseValueMax: evMax,
      equityValueMin: equityMin,
      equityValueMax: equityMax,
      multipleMin: adjustedMin,
      multipleMax: adjustedMax,
      baseValue: normalisedEbitda,
      baseValueLabel: 'Normalised EBITDA/Profit',
      adjustments,
      confidence,
      caveats,
    };
  }

  /**
   * Calculate valuation using revenue multiple method (fallback).
   */
  private calculateRevenueBasedValuation(
    inputs: ValuationInputs,
    turnover: number,
    baseMultiples: MultipleRangeConfig
  ): ValuationResult {
    const { adjustedMin, adjustedMax, adjustments } = this.applyAdjustments(
      baseMultiples.revenueMultipleMin,
      baseMultiples.revenueMultipleMax,
      inputs,
      null // No EBITDA for size adjustment
    );

    const evMin = turnover * adjustedMin;
    const evMax = turnover * adjustedMax;

    const debt = inputs.totalDebt ?? 0;
    const equityMin = Math.max(0, evMin - debt);
    const equityMax = Math.max(0, evMax - debt);

    const caveats = this.generateCaveats(inputs, 'revenue-multiple', turnover);
    const confidence = this.determineConfidence(inputs);

    return {
      isCalculable: true,
      method: 'revenue-multiple',
      enterpriseValueMin: evMin,
      enterpriseValueMax: evMax,
      equityValueMin: equityMin,
      equityValueMax: equityMax,
      multipleMin: adjustedMin,
      multipleMax: adjustedMax,
      baseValue: turnover,
      baseValueLabel: 'Annual Turnover',
      adjustments,
      confidence,
      caveats,
    };
  }

  /**
   * Apply all adjustment factors to base multiples.
   */
  private applyAdjustments(
    baseMin: number,
    baseMax: number,
    inputs: ValuationInputs,
    ebitda: number | null
  ): { adjustedMin: number; adjustedMax: number; adjustments: ValuationAdjustment[] } {
    const adjustments: ValuationAdjustment[] = [];
    let totalAdjustmentPercent = 0;

    // Customer concentration adjustment
    if (inputs.customerConcentration) {
      const adj = this.getCustomerConcentrationAdjustment(inputs.customerConcentration);
      if (adj.percentageChange !== 0) {
        adjustments.push(adj);
        totalAdjustmentPercent += adj.percentageChange;
      }
    }

    // Recurring revenue adjustment
    if (
      inputs.recurringRevenuePercentage !== null &&
      inputs.recurringRevenuePercentage !== undefined
    ) {
      const adj = this.getRecurringRevenueAdjustment(inputs.recurringRevenuePercentage);
      if (adj.percentageChange !== 0) {
        adjustments.push(adj);
        totalAdjustmentPercent += adj.percentageChange;
      }
    }

    // Growth trend adjustment
    if (inputs.growthTrend) {
      const adj = this.getGrowthTrendAdjustment(inputs.growthTrend);
      if (adj.percentageChange !== 0) {
        adjustments.push(adj);
        totalAdjustmentPercent += adj.percentageChange;
      }
    }

    // Size adjustment (affects which end of range to use)
    const sizeAdjustment = this.getSizeAdjustment(ebitda);

    // Apply adjustments
    const adjustmentFactor = 1 + totalAdjustmentPercent / 100;

    // Size adjustment shifts where in the range we sit
    let adjustedMin = baseMin * adjustmentFactor;
    let adjustedMax = baseMax * adjustmentFactor;

    // For small businesses, compress toward lower end of range
    if (sizeAdjustment.impact === 'discount') {
      const range = adjustedMax - adjustedMin;
      adjustedMax = adjustedMin + range * 0.6; // Compress range to lower 60%
      if (sizeAdjustment.percentageChange !== 0) {
        adjustments.push(sizeAdjustment);
      }
    }

    // Round to 1 decimal place
    adjustedMin = Math.round(adjustedMin * 10) / 10;
    adjustedMax = Math.round(adjustedMax * 10) / 10;

    return { adjustedMin, adjustedMax, adjustments };
  }

  /**
   * Get customer concentration adjustment.
   */
  private getCustomerConcentrationAdjustment(
    concentration: CustomerConcentration
  ): ValuationAdjustment {
    switch (concentration) {
      case 'high':
        return {
          factor: 'Customer concentration',
          impact: 'discount',
          percentageChange: -25,
          explanation: 'High customer concentration (>40% from one customer) increases revenue risk',
        };
      case 'medium':
        return {
          factor: 'Customer concentration',
          impact: 'discount',
          percentageChange: -12,
          explanation: 'Moderate customer concentration (20-40%) presents some risk',
        };
      case 'low':
        return {
          factor: 'Customer concentration',
          impact: 'neutral',
          percentageChange: 0,
          explanation: 'Well-diversified customer base',
        };
    }
  }

  /**
   * Get recurring revenue adjustment.
   */
  private getRecurringRevenueAdjustment(percentage: number): ValuationAdjustment {
    if (percentage >= 70) {
      return {
        factor: 'Recurring revenue',
        impact: 'premium',
        percentageChange: 15,
        explanation: `High recurring revenue (${percentage}%) provides predictable income`,
      };
    } else if (percentage >= 50) {
      return {
        factor: 'Recurring revenue',
        impact: 'premium',
        percentageChange: 7,
        explanation: `Good recurring revenue (${percentage}%) supports valuation`,
      };
    }
    return {
      factor: 'Recurring revenue',
      impact: 'neutral',
      percentageChange: 0,
      explanation: `Recurring revenue below 50%`,
    };
  }

  /**
   * Get growth trend adjustment.
   */
  private getGrowthTrendAdjustment(trend: GrowthTrend): ValuationAdjustment {
    switch (trend) {
      case 'growing':
        return {
          factor: 'Growth trend',
          impact: 'premium',
          percentageChange: 12,
          explanation: 'Growing revenue trajectory attracts premium valuations',
        };
      case 'flat':
        return {
          factor: 'Growth trend',
          impact: 'neutral',
          percentageChange: 0,
          explanation: 'Stable revenue',
        };
      case 'declining':
        return {
          factor: 'Growth trend',
          impact: 'discount',
          percentageChange: -18,
          explanation: 'Declining revenue increases buyer risk perception',
        };
    }
  }

  /**
   * Get size-based adjustment (affects range position, not percentage).
   */
  private getSizeAdjustment(ebitda: number | null): ValuationAdjustment {
    if (ebitda === null) {
      return {
        factor: 'Company size',
        impact: 'neutral',
        percentageChange: 0,
        explanation: 'Size adjustment not applicable',
      };
    }

    if (ebitda < 500_000) {
      return {
        factor: 'Company size',
        impact: 'discount',
        percentageChange: 0, // Handled via range compression
        explanation: 'Smaller businesses typically command lower multiples due to higher risk',
      };
    }

    return {
      factor: 'Company size',
      impact: 'neutral',
      percentageChange: 0,
      explanation: 'Business size supports mid-range multiples',
    };
  }

  /**
   * Determine confidence level based on data quality.
   */
  private determineConfidence(inputs: ValuationInputs): 'low' | 'medium' | 'high' {
    const historicalCount = inputs.historicalFinancials.filter(
      (f) => (f.ebitda !== null && f.ebitda > 0) || (f.turnover !== null && f.turnover > 0)
    ).length;

    const hasAllOptionals =
      inputs.growthTrend !== null &&
      inputs.customerConcentration !== null &&
      inputs.recurringRevenuePercentage !== null;

    if (historicalCount >= 3 && hasAllOptionals) {
      return 'high';
    } else if (historicalCount >= 2 || hasAllOptionals) {
      return 'medium';
    }
    return 'low';
  }

  /**
   * Generate caveats based on data and calculation method.
   */
  private generateCaveats(
    inputs: ValuationInputs,
    method: 'ebitda-multiple' | 'revenue-multiple',
    baseValue: number
  ): string[] {
    const caveats: string[] = [
      'This is an indicative estimate only, not a professional valuation.',
    ];

    if (method === 'revenue-multiple') {
      caveats.push(
        'Valuation based on turnover multiple (EBITDA data would improve accuracy).'
      );
    }

    const historicalCount = inputs.historicalFinancials.filter(
      (f) => (f.ebitda !== null && f.ebitda > 0) || (f.turnover !== null && f.turnover > 0)
    ).length;

    if (historicalCount < 2) {
      caveats.push(
        'Limited historical data available. More years of data would improve accuracy.'
      );
    }

    if (baseValue < 200_000 && method === 'ebitda-multiple') {
      caveats.push(
        'Small business valuations may be significantly affected by owner involvement and key person risk.'
      );
    }

    if (baseValue > 5_000_000 && method === 'ebitda-multiple') {
      caveats.push(
        'For businesses of this size, professional valuation advisory is strongly recommended.'
      );
    }

    if (inputs.totalDebt === null) {
      caveats.push(
        'No debt information provided. Equity value assumes zero debt.'
      );
    }

    if (
      inputs.growthTrend === null ||
      inputs.customerConcentration === null ||
      inputs.recurringRevenuePercentage === null
    ) {
      caveats.push(
        'Providing additional business characteristics would improve valuation accuracy.'
      );
    }

    return caveats;
  }

  /**
   * Create result for insufficient data.
   */
  private createInsufficientDataResult(inputs: ValuationInputs): ValuationResult {
    const caveats: string[] = [];

    if (!inputs.businessType) {
      caveats.push('Please select a business type to calculate valuation.');
    }

    const allFinancials = [...inputs.historicalFinancials, ...inputs.forecastFinancials];
    const hasAnyData = allFinancials.some(
      (f) =>
        (f.ebitda !== null && f.ebitda > 0) || (f.turnover !== null && f.turnover > 0)
    );

    if (!hasAnyData) {
      caveats.push(
        'Please provide at least one year of financial data (turnover or EBITDA/profit).'
      );
    }

    return {
      isCalculable: false,
      method: 'insufficient-data',
      enterpriseValueMin: null,
      enterpriseValueMax: null,
      equityValueMin: null,
      equityValueMax: null,
      multipleMin: null,
      multipleMax: null,
      baseValue: null,
      baseValueLabel: '',
      adjustments: [],
      confidence: 'low',
      caveats,
    };
  }

  /**
   * Format currency value for display.
   * Uses compact notation for large values (e.g., £2.4M).
   */
  formatCurrency(value: number | null): string {
    if (value === null || value === undefined) {
      return '—';
    }

    // Use Intl.NumberFormat for proper British formatting
    if (value >= 1_000_000) {
      const millions = value / 1_000_000;
      return `£${millions.toFixed(1)}M`;
    } else if (value >= 1_000) {
      const thousands = value / 1_000;
      return `£${thousands.toFixed(0)}K`;
    } else {
      return new Intl.NumberFormat('en-GB', {
        style: 'currency',
        currency: 'GBP',
        maximumFractionDigits: 0,
      }).format(value);
    }
  }

  /**
   * Format a number with thousands separators for input display.
   */
  formatNumber(value: number | null): string {
    if (value === null || value === undefined) {
      return '';
    }
    return new Intl.NumberFormat('en-GB').format(value);
  }

  /**
   * Parse a formatted number string back to a number.
   */
  parseNumber(value: string): number | null {
    if (!value || value.trim() === '') {
      return null;
    }
    // Remove currency symbols, commas, and spaces
    const cleaned = value.replace(/[£,\s]/g, '');
    const parsed = parseFloat(cleaned);
    return isNaN(parsed) ? null : parsed;
  }
}
