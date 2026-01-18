/**
 * Valuation data models for SME Exit Readiness Assessment
 *
 * These interfaces define the structure for collecting financial data
 * and calculating indicative business valuations.
 */

/**
 * Business type determines base EBITDA/revenue multiple ranges.
 * - service: Professional services, consulting, agencies (2-4x EBITDA)
 * - product: Manufacturing, retail, distribution (3-6x EBITDA)
 * - tech-saas: Software, SaaS, technology platforms (4-10x EBITDA)
 */
export type BusinessType = 'service' | 'product' | 'tech-saas';

/**
 * Growth trend affects the multiple adjustment.
 * - declining: Year-over-year revenue decline (-15% to -20% discount)
 * - flat: Stable revenue (no adjustment)
 * - growing: Year-over-year revenue growth (+10% to +15% premium)
 */
export type GrowthTrend = 'declining' | 'flat' | 'growing';

/**
 * Customer concentration level affects risk perception.
 * - high: >40% revenue from single customer (-20% to -30% discount)
 * - medium: 20-40% from single customer (-10% to -15% discount)
 * - low: <20% from any single customer (no adjustment)
 */
export type CustomerConcentration = 'high' | 'medium' | 'low';

/**
 * Financial data for a single year.
 * Users may provide turnover, EBITDA/profit, or both.
 */
export interface FinancialYearData {
  /** The calendar year (e.g., 2023, 2024, 2025) */
  year: number;
  /** Annual turnover/revenue in GBP. Null if not provided. */
  turnover: number | null;
  /**
   * EBITDA or Profit in GBP. Null if not provided.
   * EBITDA preferred but profit accepted as equivalent for small businesses.
   */
  ebitda: number | null;
}

/**
 * All user inputs required for valuation calculation.
 * All fields are optional - the calculation will use what's available.
 */
export interface ValuationInputs {
  /** Business type determines base multiple range */
  businessType: BusinessType | null;

  /** Historical financial data - completed years only (up to 3 years) */
  historicalFinancials: FinancialYearData[];

  /** Forecast financial data - current and future years (up to 3 years) */
  forecastFinancials: FinancialYearData[];

  /** Total debt/liabilities in GBP for EV to Equity conversion */
  totalDebt: number | null;

  /** Growth trend assessment */
  growthTrend: GrowthTrend | null;

  /** Customer concentration level */
  customerConcentration: CustomerConcentration | null;

  /** Percentage of revenue that is recurring (0-100) */
  recurringRevenuePercentage: number | null;
}

/**
 * Result of valuation calculation with full breakdown.
 */
export interface ValuationResult {
  /** Whether we have enough data to calculate a valuation */
  isCalculable: boolean;

  /** The method used for calculation */
  method: 'ebitda-multiple' | 'revenue-multiple' | 'insufficient-data';

  /** Enterprise Value range (before debt deduction) */
  enterpriseValueMin: number | null;
  enterpriseValueMax: number | null;

  /** Equity Value range (after debt deduction - what owner receives) */
  equityValueMin: number | null;
  equityValueMax: number | null;

  /** The multiple range applied */
  multipleMin: number | null;
  multipleMax: number | null;

  /** The base value used for calculation (normalised EBITDA or turnover) */
  baseValue: number | null;

  /** Description of base value (e.g., "Normalised EBITDA" or "Annual Turnover") */
  baseValueLabel: string;

  /** List of adjustments applied to the base multiples */
  adjustments: ValuationAdjustment[];

  /** Confidence level based on data quality */
  confidence: 'low' | 'medium' | 'high';

  /** Caveats and warnings specific to this calculation */
  caveats: string[];
}

/**
 * Individual adjustment applied to the valuation.
 */
export interface ValuationAdjustment {
  /** Name of the adjustment factor */
  factor: string;

  /** Whether this is a premium, discount, or neutral */
  impact: 'premium' | 'discount' | 'neutral';

  /** Percentage change applied (e.g., -20 for 20% discount, +15 for 15% premium) */
  percentageChange: number;

  /** Human-readable explanation of why this adjustment was applied */
  explanation: string;
}

/**
 * Configuration for multiple ranges by business type.
 * Used internally by ValuationService.
 */
export interface MultipleRangeConfig {
  businessType: BusinessType;
  ebitdaMultipleMin: number;
  ebitdaMultipleMax: number;
  revenueMultipleMin: number;
  revenueMultipleMax: number;
}

/**
 * Returns default/empty valuation inputs.
 */
export function getDefaultValuationInputs(): ValuationInputs {
  const currentYear = new Date().getFullYear();

  return {
    businessType: null,
    historicalFinancials: [
      { year: currentYear - 3, turnover: null, ebitda: null },
      { year: currentYear - 2, turnover: null, ebitda: null },
      { year: currentYear - 1, turnover: null, ebitda: null },
    ],
    forecastFinancials: [
      { year: currentYear, turnover: null, ebitda: null },
      { year: currentYear + 1, turnover: null, ebitda: null },
      { year: currentYear + 2, turnover: null, ebitda: null },
    ],
    totalDebt: null,
    growthTrend: null,
    customerConcentration: null,
    recurringRevenuePercentage: null,
  };
}

/**
 * Labels for business types in UI.
 */
export const BUSINESS_TYPE_LABELS: Record<BusinessType, string> = {
  service: 'Service Business',
  product: 'Product Business',
  'tech-saas': 'Tech/SaaS',
};

/**
 * Labels for growth trends in UI.
 */
export const GROWTH_TREND_LABELS: Record<GrowthTrend, string> = {
  declining: 'Declining',
  flat: 'Flat',
  growing: 'Growing',
};

/**
 * Labels for customer concentration in UI.
 */
export const CUSTOMER_CONCENTRATION_LABELS: Record<CustomerConcentration, string> = {
  high: 'High (>40% from one customer)',
  medium: 'Medium (20-40% from one customer)',
  low: 'Low/Diversified (<20%)',
};
