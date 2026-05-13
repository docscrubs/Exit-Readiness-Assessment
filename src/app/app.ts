import { Component, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink, RouterOutlet } from '@angular/router';
import { BrandingService } from './services/branding.service';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [CommonModule, RouterOutlet, RouterLink],
  templateUrl: './app.html',
  styleUrls: ['./app.css']
})
export class App {
  protected readonly brandingSvc = inject(BrandingService);
  protected readonly brand = this.brandingSvc.brand;
  protected readonly title = signal('exit-readiness-assessment');
  protected readonly currentYear = new Date().getFullYear();
}
