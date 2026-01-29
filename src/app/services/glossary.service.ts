import { Injectable, signal } from '@angular/core';
import { GlossaryTerm } from '../models/assessment';

@Injectable({
  providedIn: 'root'
})
export class GlossaryService {
  private glossaryTerms = signal<GlossaryTerm[]>([]);
  private termMap = signal<Map<string, GlossaryTerm>>(new Map());

  /**
   * Initialise the glossary with terms from the assessment spec
   */
  setGlossary(terms: GlossaryTerm[]) {
    this.glossaryTerms.set(terms);

    // Build a map for quick lookup (case-insensitive)
    const map = new Map<string, GlossaryTerm>();
    for (const term of terms) {
      map.set(term.term.toLowerCase(), term);
    }
    this.termMap.set(map);
  }

  /**
   * Get all glossary terms
   */
  getTerms(): GlossaryTerm[] {
    return this.glossaryTerms();
  }

  /**
   * Look up a specific term (case-insensitive)
   */
  getTerm(term: string): GlossaryTerm | undefined {
    return this.termMap().get(term.toLowerCase());
  }

  /**
   * Check if a term exists in the glossary (case-insensitive)
   */
  hasTerm(term: string): boolean {
    return this.termMap().has(term.toLowerCase());
  }

  /**
   * Find glossary terms within a text string.
   * Returns an array of matches with their positions.
   */
  findTermsInText(text: string): Array<{ term: GlossaryTerm; start: number; end: number }> {
    const matches: Array<{ term: GlossaryTerm; start: number; end: number }> = [];
    const lowerText = text.toLowerCase();

    for (const term of this.glossaryTerms()) {
      const lowerTerm = term.term.toLowerCase();
      let searchPos = 0;

      while (searchPos < lowerText.length) {
        const index = lowerText.indexOf(lowerTerm, searchPos);
        if (index === -1) break;

        // Check for word boundaries to avoid partial matches
        const beforeChar = index > 0 ? lowerText[index - 1] : ' ';
        const afterChar = index + lowerTerm.length < lowerText.length
          ? lowerText[index + lowerTerm.length]
          : ' ';

        const isWordBoundaryBefore = !this.isWordChar(beforeChar);
        const isWordBoundaryAfter = !this.isWordChar(afterChar);

        if (isWordBoundaryBefore && isWordBoundaryAfter) {
          matches.push({
            term,
            start: index,
            end: index + lowerTerm.length
          });
        }

        searchPos = index + 1;
      }
    }

    // Sort by position and remove overlapping matches (keep longer ones)
    matches.sort((a, b) => a.start - b.start);

    const filtered: typeof matches = [];
    for (const match of matches) {
      const lastMatch = filtered[filtered.length - 1];
      if (!lastMatch || match.start >= lastMatch.end) {
        filtered.push(match);
      } else if (match.end - match.start > lastMatch.end - lastMatch.start) {
        // Replace with longer match
        filtered[filtered.length - 1] = match;
      }
    }

    return filtered;
  }

  private isWordChar(char: string): boolean {
    return /[a-zA-Z0-9]/.test(char);
  }
}
