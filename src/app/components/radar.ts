import { Component, Input } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-radar',
  standalone: true,
  imports: [CommonModule],
  template: `
     <svg [attr.viewBox]="viewBox" class="w-full h-[290px] mb-[18px] block">
      <g *ngFor="let level of gridLevels; let i = index">
        <polygon [attr.points]="polygonPoints(level)" fill="none" stroke="#e6e6e6"></polygon>
      </g>
      <g *ngFor="let axis of labels; let i = index">
        <line [attr.x1]="cx" [attr.y1]="cy" [attr.x2]="axisPoint(i).x" [attr.y2]="axisPoint(i).y" stroke="#e6e6e6"></line>
        <text [attr.x]="labelPos(i).x" [attr.y]="labelPos(i).y" font-size="10" style="font-size:10px;" fill="#6b7280" text-anchor="middle">{{ axis }}</text>
      </g>
      <polygon [attr.points]="dataPolygonPoints()" [attr.fill]="fillColor" [attr.fill-opacity]="0.25" [attr.stroke]="strokeColor" stroke-width="2"></polygon>
      <polygon *ngIf="overlayValues?.length" [attr.points]="overlayPolygonPoints()" [attr.fill]="overlayFillColor" [attr.fill-opacity]="0.18" [attr.stroke]="overlayStrokeColor" stroke-width="2" stroke-dasharray="5,5"></polygon>
      <polygon *ngIf="secondOverlayValues?.length" [attr.points]="secondOverlayPolygonPoints()" [attr.fill]="secondOverlayFillColor" [attr.fill-opacity]="0.18" [attr.stroke]="secondOverlayStrokeColor" stroke-width="2" stroke-dasharray="3,3"></polygon>
    </svg>
  ` 
})
export class RadarComponent {
  @Input() labels: string[] = [];
  @Input() values: number[] = [];
  @Input() max = 4;
  @Input() strokeColor = '#3f1954';
  @Input() fillColor = '#ed0776';
  /** Horizontal padding percent (0-100). Reduces horizontal plotting radius to avoid label clipping. */
  @Input() horizontalPaddingPct = 0;
  @Input() overlayValues: number[] | null = null;
  @Input() overlayStrokeColor = '#0b84ff';
  @Input() overlayFillColor = '#0b84ff';
  @Input() secondOverlayValues: number[] | null = null;
  @Input() secondOverlayStrokeColor = '#10b981';
  @Input() secondOverlayFillColor = 'rgba(16, 185, 129, 0.1)';

  // GJS - change from 300 to 350
  size = 350;
  // GJS - change from 20 to 40
  padding = 40;
  get viewBox() { return `0 0 ${this.size} ${this.size}`; }
  get cx() { return this.size / 2; }
  get cy() { return this.size / 2; }
  get radius() { return (this.size / 2) - this.padding; }
  get gridLevels() { return Array.from({ length: this.max + 1 }, (_, i) => (i / this.max) * this.radius).reverse(); }

  angle(i: number) { return (Math.PI * 2 * i) / (this.labels.length || 1); }
  axisPoint(i: number, r = this.radius) {
    const a = this.angle(i);
    const rx = r - (r * (this.horizontalPaddingPct / 100));
    return { x: this.cx + Math.sin(a) * rx, y: this.cy - Math.cos(a) * r };
  }
  // GJS - change offset from 18 to 25
  labelPos(i: number) { const p = this.axisPoint(i, this.radius + 25); return { x: p.x, y: p.y + (p.y > this.cy ? 8 : -6) }; }

  polygonPoints(r: number) {
    return this.labels.map((_, i) => {
      const p = this.axisPoint(i, r);
      return `${p.x},${p.y}`;
    }).join(' ');
  }

  dataPolygonPoints() {
    if (!this.values || !this.values.length) return '';
    return this.values.map((v, i) => {
      const r = (v / this.max) * this.radius;
      const p = this.axisPoint(i, r);
      return `${p.x},${p.y}`;
    }).join(' ');
  }

  overlayPolygonPoints() {
    if (!this.overlayValues || !this.overlayValues.length) return '';
    return this.overlayValues.map((v, i) => {
      const r = (v / this.max) * this.radius;
      const p = this.axisPoint(i, r);
      return `${p.x},${p.y}`;
    }).join(' ');
  }

  secondOverlayPolygonPoints() {
    if (!this.secondOverlayValues || !this.secondOverlayValues.length) return '';
    return this.secondOverlayValues.map((v, i) => {
      const r = (v / this.max) * this.radius;
      const p = this.axisPoint(i, r);
      return `${p.x},${p.y}`;
    }).join(' ');
  }
}
