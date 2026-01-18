/**
 * Magilium Impact Analysis Models
 *
 * These interfaces define the structure for calculating and displaying
 * the potential impact of professional exit preparation services.
 */

/**
 * Individual mitigation opportunity identified from assessment gaps
 */
export interface MitigationOpportunity {
  /** Unique identifier for this opportunity */
  id: string;

  /** Category: valuation, timeline, completion, documentation */
  category: 'valuation' | 'completion' | 'timeline' | 'documentation';

  /** Human-readable title */
  title: string;

  /** Current state description */
  currentState: string;

  /** Mitigated state description */
  mitigatedState: string;

  /** Current numeric value (for calculations) */
  currentValue: number;

  /** Mitigated numeric value (for calculations) */
  mitigatedValue: number;

  /** Unit for display (e.g., '%', 'weeks', 'probability') */
  unit: string;

  /** How Magilium addresses this */
  magiliumApproach: string;

  /** Evidence/source citation */
  evidenceSource: string;

  /** URL for evidence source */
  evidenceUrl: string;
}

/**
 * Summary of all impact calculations
 */
export interface MagiliumImpactSummary {
  /** Whether there are any mitigatable issues */
  hasMitigatableIssues: boolean;

  /** Valuation impact metrics */
  valuationImpact: {
    /** Current total discount percentage being applied */
    currentDiscountPercent: number;
    /** Mitigated discount percentage after preparation */
    mitigatedDiscountPercent: number;
    /** Net improvement in valuation percentage */
    improvementPercent: number;
    /** Estimated value improvement in GBP (if valuation data available) */
    estimatedValueGain: number | null;
  };

  /** Deal completion probability metrics */
  completionImpact: {
    /** Current estimated completion probability (0-100) */
    currentProbability: number;
    /** Mitigated completion probability (0-100) */
    mitigatedProbability: number;
    /** Number of risk factors identified */
    riskFactorCount: number;
  };

  /** Timeline impact metrics */
  timelineImpact: {
    /** Time savings with preparation */
    ddTimeSavings: string;
    /** Explanation */
    explanation: string;
  };

  /** All identified opportunities */
  opportunities: MitigationOpportunity[];
}

/**
 * A statistic for display in the report
 */
export interface MagiliumStatistic {
  /** The statistic value (e.g., "93%", "2-3x") */
  value: string;
  /** Short description */
  label: string;
  /** Source citation */
  source: string;
  /** Source URL */
  sourceUrl: string;
}

/**
 * Evidence-based statistics (hardcoded, credible sources)
 */
export const MAGILIUM_STATISTICS: MagiliumStatistic[] = [
  {
    value: '70-80%',
    label: 'of SME sales fail to complete',
    source: 'Baton Market Research',
    sourceUrl: 'https://www.batonmarket.com/resources',
  },
  {
    value: '60%+',
    label: 'of deal failures cite poor due diligence preparation',
    source: 'Bain M&A Report 2020',
    sourceUrl: 'https://www.bain.com/insights/topics/mergers-and-acquisitions/',
  },
  {
    value: '10-20%',
    label: 'higher valuations for well-documented businesses',
    source: 'IDEALS Virtual Data Room Research',
    sourceUrl: 'https://www.idealsvdr.com/',
  },
  {
    value: '2-3×',
    label: 'faster deal completion with prepared data rooms',
    source: 'Drooms M&A Survey',
    sourceUrl: 'https://drooms.com/',
  },
  {
    value: '<50%',
    label: 'completion probability when DD exceeds 90 days',
    source: 'Business-Sale.com/Investment Bank',
    sourceUrl: 'https://www.business-sale.com/insights',
  },
  {
    value: '83%',
    label: 'of buyers cite poor data rooms as deal friction',
    source: 'Intralinks M&A Leaks Report',
    sourceUrl: 'https://www.intralinks.com/',
  },
];
