import { Component, Input, OnChanges, SimpleChanges, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { GlossaryService } from '../services/glossary.service';
import { GlossaryTerm } from '../models/assessment';

interface TextSegment {
  text: string;
  isGlossaryTerm: boolean;
  term?: GlossaryTerm;
}

@Component({
  selector: 'app-glossary-text',
  standalone: true,
  imports: [CommonModule],
  template: `
    <span class="glossary-text">
      <ng-container *ngFor="let segment of segments()">
        <span
          *ngIf="segment.isGlossaryTerm; else plainText"
          class="glossary-term relative cursor-help border-b border-dotted border-purple-400 text-purple-700"
          (mouseenter)="showTooltip(segment.term!)"
          (mouseleave)="hideTooltip()"
          (click)="toggleTooltip(segment.term!)"
          (keydown.enter)="toggleTooltip(segment.term!)"
          (keydown.escape)="hideTooltip()"
          tabindex="0"
          role="button"
          [attr.aria-describedby]="activeTooltip() === segment.term ? 'glossary-tooltip' : null">
          {{ segment.text }}
          <span
            *ngIf="activeTooltip() === segment.term"
            id="glossary-tooltip"
            role="tooltip"
            class="absolute z-50 w-64 sm:w-72 p-3 text-xs font-normal leading-relaxed text-slate-700 bg-white border border-slate-200 rounded-lg shadow-lg -translate-x-1/2 left-1/2 bottom-full mb-2"
            style="text-align: left;">
            <span class="font-semibold text-purple-700 block mb-1">{{ segment.term!.term }}</span>
            <span class="text-slate-600">{{ segment.term!.definition }}</span>
            <span class="absolute w-3 h-3 bg-white border-r border-b border-slate-200 transform rotate-45 -bottom-1.5 left-1/2 -translate-x-1/2"></span>
          </span>
        </span>
        <ng-template #plainText>{{ segment.text }}</ng-template>
      </ng-container>
    </span>
  `,
  styles: [`
    .glossary-term:focus {
      outline: 2px solid #7c3aed;
      outline-offset: 2px;
      border-radius: 2px;
    }
    .glossary-term:hover {
      background-color: rgba(147, 51, 234, 0.1);
    }
  `]
})
export class GlossaryTextComponent implements OnChanges {
  @Input() text = '';

  private glossarySvc = inject(GlossaryService);

  segments = signal<TextSegment[]>([]);
  activeTooltip = signal<GlossaryTerm | null>(null);

  ngOnChanges(changes: SimpleChanges): void {
    if (changes['text']) {
      this.parseText();
    }
  }

  private parseText(): void {
    if (!this.text) {
      this.segments.set([]);
      return;
    }

    const matches = this.glossarySvc.findTermsInText(this.text);

    if (matches.length === 0) {
      this.segments.set([{ text: this.text, isGlossaryTerm: false }]);
      return;
    }

    const segments: TextSegment[] = [];
    let lastIndex = 0;

    for (const match of matches) {
      // Add text before the match
      if (match.start > lastIndex) {
        segments.push({
          text: this.text.slice(lastIndex, match.start),
          isGlossaryTerm: false
        });
      }

      // Add the glossary term (preserve original casing from text)
      segments.push({
        text: this.text.slice(match.start, match.end),
        isGlossaryTerm: true,
        term: match.term
      });

      lastIndex = match.end;
    }

    // Add remaining text after last match
    if (lastIndex < this.text.length) {
      segments.push({
        text: this.text.slice(lastIndex),
        isGlossaryTerm: false
      });
    }

    this.segments.set(segments);
  }

  showTooltip(term: GlossaryTerm): void {
    this.activeTooltip.set(term);
  }

  hideTooltip(): void {
    this.activeTooltip.set(null);
  }

  toggleTooltip(term: GlossaryTerm): void {
    if (this.activeTooltip() === term) {
      this.activeTooltip.set(null);
    } else {
      this.activeTooltip.set(term);
    }
  }
}
