export interface AssessmentScale {
  min: number;
  max: number;
  labels: string[];
}

export interface AssessmentQuestion {
  id: string;
  text: string;
  plainSummary?: string;
  explanations?: string[];
}

export interface AssessmentDimension {
  id: string;
  name: string;
  weight?: number;
  critical?: boolean;
  minAcceptable?: number;
  questions: AssessmentQuestion[];
}

export interface AssessmentLevel {
  name: string;
  min: number;
  max: number;
  color: string;
  description?: string;
}

export interface GlossaryTerm {
  term: string;
  definition: string;
}

export interface AssessmentSpec {
  title: string;
  description?: string;
  scale: AssessmentScale;
  levels: AssessmentLevel[];
  dimensions: AssessmentDimension[];
  sectorBenchmarks?: SectorBenchmark[];  // Legacy - deprecated
  benchmarks?: BenchmarkData;
  glossary?: GlossaryTerm[];
}

export type Responses = Record<string, number>;

export interface SectorBenchmark {
  name: string;
  scores: Record<string, number>;
}

// New benchmark interfaces
export interface DomainScores {
  financial: number;
  legal: number;
  commercial: number;
  operational: number;
  people: number;
  esg: number;
}

export interface LifecyclePhaseBenchmark {
  name: string;
  description: string;
  minimum: DomainScores;
  average: DomainScores;
}

export interface SectorBenchmarkData {
  id: string;
  name: string;
  description: string;
  criticalDomains: string[];
  lifecyclePhases: {
    preRevenue: LifecyclePhaseBenchmark;
    fiveM: LifecyclePhaseBenchmark;
    thirtyM: LifecyclePhaseBenchmark;
  };
}

export interface LifecyclePhaseInfo {
  id: string;
  name: string;
  description: string;
  valuationRange: string;
}

export interface BenchmarkData {
  sectors: SectorBenchmarkData[];
  lifecyclePhases: LifecyclePhaseInfo[];
}

export interface BenchmarkComparison {
  sector: string;
  sectorName: string;
  lifecycle: string;
  lifecycleName: string;
  userScores: DomainScores;
  minimumScores: DomainScores;
  averageScores: DomainScores;
  gaps: {
    domain: string;
    domainName: string;
    userScore: number;
    minScore: number;
    avgScore: number;
    belowMinimum: boolean;
    belowAverage: boolean;
  }[];
  criticalDomains: string[];
}

export interface ThresholdViolation {
  type: 'level-zero' | 'financial-critical' | 'legal-critical' | 'people-critical';
  domainId: string;
  domainName: string;
  currentLevel: number;
  requiredLevel: number;
  severity: 'blocker' | 'critical' | 'warning';
  message: string;
}

export interface TimelineGuidance {
  overallLevel: number;
  estimatedMonths: string;
  priority: string;
  recommendations: string[];
}
