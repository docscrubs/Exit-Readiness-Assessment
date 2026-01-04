import { inject, Injectable, signal } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { AssessmentSpec } from '../models/assessment';
import { catchError, of } from 'rxjs';

const defaultSpec: AssessmentSpec = {
  title: 'IT & Product Maturity Assessment',
  description: "Assess your organization's maturity across 6 domains. Each sub-domain is rated 0–4.",
  scale: { min: 0, max: 4, labels: ['Absent','Ad hoc','Defined','Managed','Optimised'] },
  levels: [
    { name: 'Absent', min: 0, max: 0.9, color: '#e11d48' },
    { name: 'Ad hoc', min: 0.9, max: 1.9, color: '#f59e0b' },
    { name: 'Defined', min: 1.9, max: 2.9, color: '#3f1954' },
    { name: 'Managed', min: 2.9, max: 3.6, color: '#6e2b86' },
    { name: 'Optimised', min: 3.6, max: 5, color: '#ed0776' }
  ],
  dimensions: [
    {
      id: 'strategy',
      name: 'Strategy & Governance',
      weight: 1,
      questions: [
        { id: 's1', text: 'IT/Business alignment ensures technology supports strategic objectives.' },
        { id: 's2', text: 'IT risk management identifies and mitigates key technology risks.' },
        { id: 's3', text: 'IT investment planning prioritizes spending for business value.' },
        { id: 's4', text: 'Compliance and regulatory requirements are embedded into IT processes.' }
      ]
    },
    {
      id: 'product',
      name: 'Product Development & Delivery',
      weight: 1,
      questions: [
        { id: 'p1', text: 'Requirements and backlog are captured, prioritized and refined.' },
        { id: 'p2', text: 'Design and architecture practices ensure scalability and maintainability.' },
        { id: 'p3', text: 'Build and test practices (CI/CD) are established and reliable.' },
        { id: 'p4', text: 'Release and deployment management minimizes risk to production.' }
      ]
    },
    {
      id: 'service',
      name: 'Service Management & Operations',
      weight: 1,
      questions: [
        { id: 'sm1', text: 'Incidents and problems are handled and root-cause is addressed.' },
        { id: 'sm2', text: 'Change management processes reduce disruption and risk.' },
        { id: 'sm3', text: 'Capacity, availability and continuity are planned and tested.' },
        { id: 'sm4', text: 'Knowledge and asset management practices are maintained.' }
      ]
    },
    {
      id: 'security',
      name: 'Security & Risk',
      weight: 1,
      questions: [
        { id: 'sec1', text: 'Security governance and policies define responsibilities and controls.' },
        { id: 'sec2', text: 'Identity and access management controls are enforced.' },
        { id: 'sec3', text: 'Threat detection and response processes are in place.' },
        { id: 'sec4', text: 'Data protection and privacy controls meet regulatory needs.' }
      ]
    },
    {
      id: 'data',
      name: 'Data & Analytics',
      weight: 1,
      questions: [
        { id: 'd1', text: 'Data governance and quality practices ensure reliable data.' },
        { id: 'd2', text: 'Business intelligence and reporting provide actionable insights.' },
        { id: 'd3', text: 'Advanced analytics and AI are used where they add value.' },
        { id: 'd4', text: 'Data lifecycle management addresses retention and disposal.' }
      ]
    },
    {
      id: 'people',
      name: 'People & Organisation',
      weight: 1,
      questions: [
        { id: 'pe1', text: 'Skills and training programs support required capabilities.' },
        { id: 'pe2', text: 'Roles and responsibilities are clear and documented.' },
        { id: 'pe3', text: 'A culture of collaboration and agility is encouraged.' },
        { id: 'pe4', text: 'Supplier and partner management ensures external delivery and value.' }
      ]
    }
  ]
};

@Injectable({ providedIn: 'root' })
export class AssessmentService {
  private http = inject(HttpClient);
  spec = signal<AssessmentSpec | null>(null);

  load() {
    return this.http.get<AssessmentSpec>('/assessment.json').pipe(
      catchError(() => of(defaultSpec))
    );
  }
}
