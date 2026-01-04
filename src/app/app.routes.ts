import { Routes } from '@angular/router';
import { HomePageComponent } from './pages/home';
import { AssessmentPageComponent } from './pages/assessment';
import { ReportPageComponent } from './pages/report';

export const routes: Routes = [
  { path: '', component: HomePageComponent },
  { path: 'assessment', component: AssessmentPageComponent },
  { path: 'report', component: ReportPageComponent },
  { path: '**', redirectTo: '' }
];
