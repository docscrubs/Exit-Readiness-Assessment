import { Injectable } from '@angular/core';
import {
  MagiliumImpactSummary,
  MagiliumStatistic,
  MitigationOpportunity,
  MAGILIUM_STATISTICS,
} from '../models/magilium-impact';
import { ValuationInputs, ValuationResult } from '../models/valuation';
import { ThresholdViolation } from '../models/assessment';

/**
 * Service for calculating the potential impact of Magilium's
 * professional exit preparation services based on assessment results.
 */
@Injectable({ providedIn: 'root' })
export class MagiliumImpactService {
  /**
   * Calculate full impact analysis based on assessment data
   */
  calculateImpact(
    domainAverages: { id: string; name: string; avg: number }[],
    thresholdViolations: ThresholdViolation[],
    valuationResult: ValuationResult | null,
    valuationInputs: ValuationInputs | null,
    belowMinimumCount: number
  ): MagiliumImpactSummary {
    const opportunities: MitigationOpportunity[] = [];

    // Calculate valuation-related mitigations
    const valuationMitigations = this.calculateValuationMitigations(
      valuationResult,
      valuationInputs
    );
    opportunities.push(...valuationMitigations.opportunities);

    // Calculate data room / documentation opportunities based on domain gaps
    const documentationOpportunities =
      this.calculateDocumentationOpportunities(domainAverages);
    opportunities.push(...documentationOpportunities);

    // Calculate completion probability
    const levelZeroCount = thresholdViolations.filter(
      (v) => v.severity === 'blocker'
    ).length;
    const completionCalc = this.calculateCompletionProbability(
      levelZeroCount,
      belowMinimumCount
    );

    // Calculate estimated value gain if valuation data available
    let estimatedValueGain: number | null = null;
    if (
      valuationResult?.isCalculable &&
      valuationResult.enterpriseValueMin !== null
    ) {
      const midpointEV =
        ((valuationResult.enterpriseValueMin ?? 0) +
          (valuationResult.enterpriseValueMax ?? 0)) /
        2;
      estimatedValueGain = Math.round(
        midpointEV * (valuationMitigations.totalImprovement / 100)
      );
    }

    return {
      hasMitigatableIssues: opportunities.length > 0 || levelZeroCount > 0,
      valuationImpact: {
        currentDiscountPercent: valuationMitigations.currentDiscount,
        mitigatedDiscountPercent: valuationMitigations.mitigatedDiscount,
        improvementPercent: valuationMitigations.totalImprovement,
        estimatedValueGain,
      },
      completionImpact: {
        currentProbability: completionCalc.current,
        mitigatedProbability: completionCalc.mitigated,
        riskFactorCount: levelZeroCount + belowMinimumCount,
      },
      timelineImpact: {
        ddTimeSavings: '6-8 weeks',
        explanation:
          'Professional data room preparation typically reduces DD duration by 6-8 weeks, keeping deals within the critical 90-day window.',
      },
      opportunities,
    };
  }

  /**
   * Calculate valuation discount mitigation opportunities
   */
  private calculateValuationMitigations(
    valuationResult: ValuationResult | null,
    valuationInputs: ValuationInputs | null
  ): {
    opportunities: MitigationOpportunity[];
    totalImprovement: number;
    currentDiscount: number;
    mitigatedDiscount: number;
  } {
    const opportunities: MitigationOpportunity[] = [];
    let currentDiscount = 0;
    let mitigatedDiscount = 0;

    if (!valuationInputs) {
      return { opportunities, totalImprovement: 0, currentDiscount: 0, mitigatedDiscount: 0 };
    }

    // Customer Concentration mitigation
    if (valuationInputs.customerConcentration === 'high') {
      currentDiscount += 25;
      mitigatedDiscount += 12; // Can reduce to -12% with documented strategy
      opportunities.push({
        id: 'customer-concentration',
        category: 'valuation',
        title: 'Customer Concentration Mitigation',
        currentState: '-25% valuation discount (high concentration)',
        mitigatedState: '-12% with documented diversification strategy',
        currentValue: -25,
        mitigatedValue: -12,
        unit: '%',
        magiliumApproach:
          'Document customer diversification strategy, support securing multi-year contracts, institutionalise relationships across multiple contacts per customer, create customer dependency reduction roadmap.',
        evidenceSource: 'L40 M&A Advisory Research',
        evidenceUrl: 'https://www.l40.com/insights/customer-concentration-risk',
      });
    } else if (valuationInputs.customerConcentration === 'medium') {
      currentDiscount += 12;
      mitigatedDiscount += 5;
      opportunities.push({
        id: 'customer-concentration-medium',
        category: 'valuation',
        title: 'Customer Concentration Improvement',
        currentState: '-12% valuation discount (medium concentration)',
        mitigatedState: '-5% with documented mitigation',
        currentValue: -12,
        mitigatedValue: -5,
        unit: '%',
        magiliumApproach:
          'Document customer acquisition pipeline, demonstrate diversification trend, secure contract extensions with key accounts.',
        evidenceSource: 'Morgan & Westfield M&A Research',
        evidenceUrl: 'https://www.morganandwestfield.com/',
      });
    }

    // Growth trend mitigation
    if (valuationInputs.growthTrend === 'declining') {
      currentDiscount += 18;
      mitigatedDiscount += 10; // Can reduce impact with narrative
      opportunities.push({
        id: 'growth-narrative',
        category: 'valuation',
        title: 'Growth Narrative & Pipeline Documentation',
        currentState: '-18% valuation discount (declining trend)',
        mitigatedState: '-10% with contextualised growth story',
        currentValue: -18,
        mitigatedValue: -10,
        unit: '%',
        magiliumApproach:
          'Build compelling growth narrative, document sales pipeline and conversion rates, market opportunity analysis, identify and document growth levers, contextualise historical decline with turnaround evidence.',
        evidenceSource: 'Drooms M&A Deal Intelligence',
        evidenceUrl: 'https://drooms.com/',
      });
    }

    // General data room quality premium (always applicable if any gaps exist)
    if (opportunities.length === 0) {
      // Add baseline data room opportunity even if no specific valuation issues
      currentDiscount += 8; // Implicit discount for uncertainty
      mitigatedDiscount += 0;
      opportunities.push({
        id: 'data-room-quality',
        category: 'documentation',
        title: 'Transaction-Ready Data Room',
        currentState: 'Potential 5-10% implicit uncertainty discount',
        mitigatedState: 'Professional presentation eliminates uncertainty',
        currentValue: -8,
        mitigatedValue: 0,
        unit: '%',
        magiliumApproach:
          'Professional data room structure and indexing, document housekeeping and version control, gap identification with remediation guidance, buyer-ready presentation format.',
        evidenceSource: 'IDEALS Virtual Data Room Research',
        evidenceUrl: 'https://www.idealsvdr.com/',
      });
    }

    const totalImprovement = currentDiscount - mitigatedDiscount;

    return {
      opportunities,
      totalImprovement,
      currentDiscount,
      mitigatedDiscount,
    };
  }

  /**
   * Calculate deal completion probability based on assessment gaps
   */
  private calculateCompletionProbability(
    levelZeroCount: number,
    belowMinimumCount: number
  ): { current: number; mitigated: number } {
    // Base probability for unprepared SME sales: 25-30%
    let baseProbability = 28;

    // Each Level 0 domain reduces probability significantly (deal-breaker risk)
    const levelZeroPenalty = levelZeroCount * 8;

    // Each below-minimum domain adds moderate risk
    const belowMinPenalty = belowMinimumCount * 4;

    const currentProbability = Math.max(
      5,
      baseProbability - levelZeroPenalty - belowMinPenalty
    );

    // With professional preparation, base increases significantly
    // and risks are mitigated through documentation and narrative
    const mitigatedBase = 68;
    const mitigatedLevelZeroPenalty = levelZeroCount * 3; // Reduced impact
    const mitigatedBelowMinPenalty = belowMinimumCount * 2;

    const mitigatedProbability = Math.min(
      85,
      Math.max(
        45,
        mitigatedBase - mitigatedLevelZeroPenalty - mitigatedBelowMinPenalty
      )
    );

    return {
      current: currentProbability,
      mitigated: mitigatedProbability,
    };
  }

  /**
   * Calculate documentation and data room opportunities based on domain gaps
   * Note: Excludes financial domain as Magilium is not an accountancy firm
   */
  private calculateDocumentationOpportunities(
    domainAverages: { id: string; name: string; avg: number }[]
  ): MitigationOpportunity[] {
    const opportunities: MitigationOpportunity[] = [];

    // Domain-specific opportunities (excluding financial)
    const domainOpportunities: Record<
      string,
      {
        title: string;
        approach: string;
        source: string;
        url: string;
      }
    > = {
      legal: {
        title: 'Legal & Corporate Data Room Preparation',
        approach:
          'Organise corporate documents, catalogue contracts with key terms summaries, identify gaps in corporate records, prepare document index for legal DD, flag change-of-control provisions.',
        source: 'Intralinks M&A Leaks Report',
        url: 'https://www.intralinks.com/',
      },
      commercial: {
        title: 'Commercial Documentation & Customer Analysis',
        approach:
          'Structure customer data presentation, document revenue quality metrics, prepare customer concentration analysis, organise pipeline documentation, create commercial narrative.',
        source: 'Merrill DataSite Research',
        url: 'https://www.merrillcorp.com/',
      },
      operational: {
        title: 'Operational Process Documentation',
        approach:
          'Document key processes and SOPs, identify founder dependencies, prepare operational DD materials, create scalability narrative, document IT systems and infrastructure.',
        source: 'Bain M&A Report',
        url: 'https://www.bain.com/insights/topics/mergers-and-acquisitions/',
      },
      people: {
        title: 'People & Organisation DD Materials',
        approach:
          'Organise employment documentation, prepare organisation charts, document management team capabilities, identify retention risks, create people narrative for buyers.',
        source: 'Harvard Business Review M&A Research',
        url: 'https://hbr.org/',
      },
      esg: {
        title: 'ESG & Risk Documentation',
        approach:
          'Compile compliance documentation, organise H&S records, document data protection compliance, prepare risk register, create ESG narrative.',
        source: 'Diligent Institute 2025 Report',
        url: 'https://www.diligent.com/',
      },
    };

    for (const domain of domainAverages) {
      // Skip financial domain - Magilium doesn't provide accountancy services
      if (domain.id === 'financial') continue;

      // Add opportunity if domain is below Level 2 (Defined)
      if (domain.avg < 2 && domainOpportunities[domain.id]) {
        const opp = domainOpportunities[domain.id];
        opportunities.push({
          id: `${domain.id}-documentation`,
          category: 'documentation',
          title: opp.title,
          currentState: `${domain.name} at Level ${domain.avg.toFixed(1)} - gaps in DD readiness`,
          mitigatedState: 'Transaction-ready documentation prepared',
          currentValue: domain.avg,
          mitigatedValue: 2,
          unit: 'level',
          magiliumApproach: opp.approach,
          evidenceSource: opp.source,
          evidenceUrl: opp.url,
        });
      }
    }

    return opportunities;
  }

  /**
   * Get key statistics for display
   */
  getStatistics(): MagiliumStatistic[] {
    return MAGILIUM_STATISTICS;
  }
}
