import { Injectable } from '@angular/core';
import {
  AssessmentSpec,
  Responses,
  ThresholdViolation,
  TimelineGuidance,
  SectorBenchmark,
  BenchmarkComparison,
  DomainScores,
  SectorBenchmarkData,
  LifecyclePhaseInfo
} from '../models/assessment';

export type RuleCondition = {
  type: 'domain_avg_lt' | 'domain_avg_between' | 'domain_avg_gte';
  domainId: string;
  // for lt and gte use threshold, for between use [min,max]
  threshold?: number;
  range?: [number, number];
  message: string;
};

@Injectable({ providedIn: 'root' })
export class RecommendationService {
  // Rules are declared in code so they are easy to find and edit.
  // Each rule evaluates against the assessment spec and responses to produce recommendations.
  // You can add/modify rules here.
  public rules: RuleCondition[] = [
    // Level 0-1: Critical foundational gaps
    { type: 'domain_avg_lt', domainId: 'financial', threshold: 1, message: 'Financial: Urgent - establish basic bookkeeping, file accounts, and produce management reports.' },
    { type: 'domain_avg_lt', domainId: 'legal', threshold: 1, message: 'Legal: Urgent - update statutory registers, file returns, and document key contracts.' },
    { type: 'domain_avg_lt', domainId: 'commercial', threshold: 1, message: 'Commercial: Urgent - implement customer tracking and understand revenue sources.' },
    { type: 'domain_avg_lt', domainId: 'operational', threshold: 1, message: 'Operational: Urgent - document core processes and implement basic IT backups.' },
    { type: 'domain_avg_lt', domainId: 'people', threshold: 1, message: 'People: Urgent - ensure employment contracts are in place and identify key person dependencies.' },
    { type: 'domain_avg_lt', domainId: 'esg', threshold: 1, message: 'Governance & Risk: Urgent - achieve basic H&S and GDPR compliance; document policies.' },

    // Level 1-2: Build towards transaction readiness
    { type: 'domain_avg_between', domainId: 'financial', range: [1, 2], message: 'Financial: Obtain audited accounts, normalise EBITDA, and improve management reporting quality.' },
    { type: 'domain_avg_between', domainId: 'legal', range: [1, 2], message: 'Legal: Complete statutory books, catalog material contracts, and verify IP ownership.' },
    { type: 'domain_avg_between', domainId: 'commercial', range: [1, 2], message: 'Commercial: Reduce customer concentration, build recurring revenue, and track retention metrics.' },
    { type: 'domain_avg_between', domainId: 'operational', range: [1, 2], message: 'Operational: Create SOPs, reduce founder dependency, and implement disaster recovery.' },
    { type: 'domain_avg_between', domainId: 'people', range: [1, 2], message: 'People: Build management depth, implement HR policies, and create retention plans.' },

    // Level 2-3: Optimize for competitive positioning
    { type: 'domain_avg_between', domainId: 'financial', range: [2, 3], message: 'Financial: Prepare vendor DD pack, obtain tax clearances, and refine financial model.' },
    { type: 'domain_avg_between', domainId: 'legal', range: [2, 3], message: 'Legal: Conduct legal audit, prepare DD pack, and resolve outstanding litigation.' },
    { type: 'domain_avg_between', domainId: 'commercial', range: [2, 3], message: 'Commercial: Evidence market position, improve LTV/CAC metrics, and strengthen customer relationships.' },

    // Level 3+: Transaction-ready optimization
    { type: 'domain_avg_gte', domainId: 'financial', threshold: 3, message: 'Financial: Maintain audit-ready position and ensure locked-box readiness for competitive process.' },
    { type: 'domain_avg_gte', domainId: 'operational', threshold: 3, message: 'Operational: Demonstrate scalability and prepare operational DD materials to support premium valuation.' }
  ];

  constructor() {}

  // compute domain averages from spec and responses
  computeDomainAverages(spec: AssessmentSpec, responses: Responses) {
    return spec.dimensions.map((d) => {
      const vals = d.questions.map((q) => responses[q.id]).filter((v): v is number => typeof v === 'number');
      const avg = vals.length ? vals.reduce((a, b) => a + b, 0) / vals.length : 0;
      return { id: d.id, name: d.name, avg };
    });
  }

  computeRecommendations(spec: AssessmentSpec, responses: Responses): string[] {
    if (!spec) return [];
    const domainAverages = this.computeDomainAverages(spec, responses);
    const out: string[] = [];

    // Evaluate rules in order
    for (const rule of this.rules) {
      const dom = domainAverages.find((d) => d.id === rule.domainId);
      if (!dom) continue;
      const v = dom.avg;
      if (rule.type === 'domain_avg_lt' && typeof rule.threshold === 'number') {
        if (v < rule.threshold) out.push(rule.message);
      } else if (rule.type === 'domain_avg_between' && rule.range) {
        if (v >= rule.range[0] && v < rule.range[1]) out.push(rule.message);
      } else if (rule.type === 'domain_avg_gte' && typeof rule.threshold === 'number') {
        if (v >= rule.threshold) out.push(rule.message);
      }
    }

    // Fallback: if no rule matched, produce a generic set of recommendations per domain
    if (!out.length) {
      for (const d of domainAverages) {
        if (d.avg < (spec.scale.min + spec.scale.max) / 2) {
          out.push(`${d.name}: focus on improving foundational practices.`);
        } else if (d.avg < spec.scale.max - 0.5) {
          out.push(`${d.name}: Standardise and measure to progress to the next level.`);
        } else {
          out.push(`${d.name}: Continue optimising and innovating.`);
        }
      }
    }

    return out;
  }

  detectThresholdViolations(spec: AssessmentSpec, responses: Responses): ThresholdViolation[] {
    if (!spec) return [];
    const violations: ThresholdViolation[] = [];
    const domainAverages = this.computeDomainAverages(spec, responses);

    for (const dim of spec.dimensions) {
      const avg = domainAverages.find((d) => d.id === dim.id)?.avg || 0;

      // Check for Level 0 (blocker)
      if (avg < 0.9) {
        violations.push({
          type: 'level-zero',
          domainId: dim.id,
          domainName: dim.name,
          currentLevel: avg,
          requiredLevel: 1,
          severity: 'blocker',
          message: `${dim.name} is at Level 0 (Incomplete). This is a potential deal-breaker that must be addressed before engaging buyers.`
        });
      }

      // Check critical thresholds
      if (dim.critical && dim.minAcceptable && avg < dim.minAcceptable) {
        let type: ThresholdViolation['type'] = 'level-zero';
        if (dim.id === 'financial') type = 'financial-critical';
        else if (dim.id === 'legal') type = 'legal-critical';
        else if (dim.id === 'people') type = 'people-critical';

        violations.push({
          type,
          domainId: dim.id,
          domainName: dim.name,
          currentLevel: avg,
          requiredLevel: dim.minAcceptable,
          severity: 'critical',
          message: `${dim.name} is below the critical threshold (Level ${dim.minAcceptable}). This may prevent transaction completion or significantly impact valuation.`
        });
      }
    }

    // Sort by severity (blocker first, then critical)
    return violations.sort((a, b) => {
      if (a.severity === 'blocker' && b.severity !== 'blocker') return -1;
      if (a.severity !== 'blocker' && b.severity === 'blocker') return 1;
      return 0;
    });
  }

  generateTimelineGuidance(
    spec: AssessmentSpec,
    responses: Responses,
    sectorId?: string,
    lifecycleId?: string
  ): TimelineGuidance {
    if (!spec) {
      return {
        overallLevel: 0,
        estimatedMonths: 'Unable to assess',
        priority: 'Complete the assessment',
        recommendations: []
      };
    }

    const domainAverages = this.computeDomainAverages(spec, responses);
    const overallAvg = domainAverages.reduce((sum, d) => sum + d.avg, 0) / (domainAverages.length || 1);

    let estimatedMonths: string;
    let priority: string;
    const recommendations: string[] = [];

    // If sector and lifecycle are provided, calculate timeline based on benchmark gap
    if (sectorId && lifecycleId) {
      const benchmark = this.getBenchmarkComparison(spec, responses, sectorId, lifecycleId);

      if (benchmark) {
        // Calculate average of minimum benchmark scores
        const minBenchmarkAvg = (
          benchmark.minimumScores.financial +
          benchmark.minimumScores.legal +
          benchmark.minimumScores.commercial +
          benchmark.minimumScores.operational +
          benchmark.minimumScores.people +
          benchmark.minimumScores.esg
        ) / 6;

        const gap = minBenchmarkAvg - overallAvg;

        if (gap > 1.5) {
          estimatedMonths = '18-24 months';
          priority = 'Significant preparation required';
          recommendations.push('Focus on minimum levels shown on the radar plot across all domains before engaging buyers');
          recommendations.push('Address any Level 0 domains immediately - these are always deal-breakers');
          recommendations.push('Prioritise Financial and Legal & Corporate as foundational requirements');
        } else if (gap > 0) {
          if (gap > 0.5) {
            estimatedMonths = '9-18 months';
            priority = 'Foundation in place but gaps remain';
            recommendations.push('Suitable for trade buyer conversations with appropriate expectations');
            recommendations.push('Focus on documenting processes and building management depth');
            recommendations.push('Ensure all critical domains (Financial, Legal, People) meet level minimums');
          } else {
            estimatedMonths = '3-9 months';
            priority = 'Transaction-ready for most buyer types';
            recommendations.push('Focus on elevating any domains below Level 3');
            recommendations.push('Begin preparing due diligence materials for key domains');
            recommendations.push('Consider engaging advisors for transaction process optimisation');
          }
        } else {
          estimatedMonths = 'Ready now';
          priority = 'Fully optimised for competitive process';
          recommendations.push('Ready for PE auction or premium trade sale');
          recommendations.push('Vendor DD investment likely to yield significant ROI');
          recommendations.push('Focus on maintaining current position and addressing any remaining Level 3 gaps');
        }

        return { overallLevel: overallAvg, estimatedMonths, priority, recommendations };
      }
    }

    // Fallback to original logic if sector/lifecycle not provided or benchmark not found
    if (overallAvg < 1.0) {
      estimatedMonths = '18-24 months';
      priority = 'Significant preparation required';
      recommendations.push('Focus on achieving Level 2 baseline across all domains before engaging buyers');
      recommendations.push('Address any Level 0 domains immediately - these are deal-breakers');
      recommendations.push('Prioritise Financial and Legal & Corporate as foundational requirements');
    } else if (overallAvg < 2.0) {
      estimatedMonths = '9-15 months';
      priority = 'Foundation in place but gaps remain';
      recommendations.push('Suitable for trade buyer conversations with appropriate expectations');
      recommendations.push('Focus on documenting processes and building management depth');
      recommendations.push('Ensure all critical domains (Financial, Legal, People) meet Level 2 minimum');
    } else if (overallAvg < 3.0) {
      estimatedMonths = '3-9 months';
      priority = 'Transaction-ready for most buyer types';
      recommendations.push('Focus on elevating any domains that are much below the others');
      recommendations.push('Begin preparing due diligence materials for key domains');
      recommendations.push('Consider engaging advisors for transaction process optimisation');
    } else {
      estimatedMonths = 'Ready now';
      priority = 'Fully optimised for competitive process';
      recommendations.push('Ready for competitivePE auction or premium trade sale');
      recommendations.push('Ensure that all domains are evenly strong to maximise valuation');
      recommendations.push('Focus on maintaining current position and addressing any remaining Level 3 gaps');
    }

    return { overallLevel: overallAvg, estimatedMonths, priority, recommendations };
  }

  getSectorBenchmark(spec: AssessmentSpec, sectorName: string): SectorBenchmark | null {
    if (!spec || !spec.sectorBenchmarks) return null;
    return spec.sectorBenchmarks.find((s) => s.name === sectorName) || null;
  }

  // New benchmark comparison methods
  getBenchmarkComparison(
    spec: AssessmentSpec,
    responses: Responses,
    sectorId: string,
    lifecycleId: string
  ): BenchmarkComparison | null {
    if (!spec || !spec.benchmarks || !spec.benchmarks.sectors) return null;

    const sector = spec.benchmarks.sectors.find((s) => s.id === sectorId);
    if (!sector) return null;

    const lifecycle = lifecycleId as 'preRevenue' | 'fiveM' | 'thirtyM';
    const phaseBenchmark = sector.lifecyclePhases[lifecycle];
    if (!phaseBenchmark) return null;

    const domainAverages = this.computeDomainAverages(spec, responses);

    // Convert user scores to DomainScores format
    const userScores: DomainScores = {
      financial: domainAverages.find((d) => d.id === 'financial')?.avg || 0,
      legal: domainAverages.find((d) => d.id === 'legal')?.avg || 0,
      commercial: domainAverages.find((d) => d.id === 'commercial')?.avg || 0,
      operational: domainAverages.find((d) => d.id === 'operational')?.avg || 0,
      people: domainAverages.find((d) => d.id === 'people')?.avg || 0,
      esg: domainAverages.find((d) => d.id === 'esg')?.avg || 0
    };

    // Calculate gaps
    const domains: Array<keyof DomainScores> = ['financial', 'legal', 'commercial', 'operational', 'people', 'esg'];
    const gaps = domains.map((domain) => ({
      domain,
      userScore: userScores[domain],
      minScore: phaseBenchmark.minimum[domain],
      avgScore: phaseBenchmark.average[domain],
      belowMinimum: userScores[domain] < phaseBenchmark.minimum[domain],
      belowAverage: userScores[domain] < phaseBenchmark.average[domain]
    }));

    const lifecyclePhase = spec.benchmarks.lifecyclePhases.find((p) => p.id === lifecycleId);

    return {
      sector: sectorId,
      sectorName: sector.name,
      lifecycle: lifecycleId,
      lifecycleName: lifecyclePhase?.name || lifecycle,
      userScores,
      minimumScores: phaseBenchmark.minimum,
      averageScores: phaseBenchmark.average,
      gaps,
      criticalDomains: sector.criticalDomains
    };
  }

  getAvailableSectors(spec: AssessmentSpec): SectorBenchmarkData[] {
    if (!spec || !spec.benchmarks || !spec.benchmarks.sectors) return [];
    return spec.benchmarks.sectors;
  }

  getAvailableLifecyclePhases(spec: AssessmentSpec): LifecyclePhaseInfo[] {
    if (!spec || !spec.benchmarks || !spec.benchmarks.lifecyclePhases) return [];
    return spec.benchmarks.lifecyclePhases;
  }

  // Helper method to convert domain scores to array format for radar chart
  domainScoresToArray(scores: DomainScores): number[] {
    return [
      scores.financial,
      scores.legal,
      scores.commercial,
      scores.operational,
      scores.people,
      scores.esg
    ];
  }

  // Get domain labels in consistent order
  getDomainLabels(spec: AssessmentSpec): string[] {
    if (!spec) return [];
    return spec.dimensions.map((d) => d.name);
  }
}
