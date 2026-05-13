import { Injectable, computed, signal } from '@angular/core';
import { BrandConfig, BrandingData } from '../models/branding';

function hexToRgbTriplet(hex: string): string {
  const h = hex.replace('#', '');
  const r = parseInt(h.slice(0, 2), 16);
  const g = parseInt(h.slice(2, 4), 16);
  const b = parseInt(h.slice(4, 6), 16);
  return `${r} ${g} ${b}`;
}

@Injectable({ providedIn: 'root' })
export class BrandingService {
  private data = signal<BrandingData | null>(null);
  private resolvedBrandId = signal<string | null>(null);

  readonly brand = computed<BrandConfig | null>(() => {
    const data = this.data();
    const id = this.resolvedBrandId();
    if (!data || !id) return null;
    return data.brands[id] ?? data.brands[data.defaultBrand] ?? null;
  });

  async load(): Promise<void> {
    const response = await fetch('/brands/branding.json');
    const data = (await response.json()) as BrandingData;
    this.data.set(data);

    const hostname = window.location.hostname;
    const brandId = this.resolveBrandFromHostname(hostname, data);
    this.resolvedBrandId.set(brandId);

    this.applyCssVariables();
    this.applyFavicons();
  }

  private resolveBrandFromHostname(hostname: string, data: BrandingData): string {
    const override = new URLSearchParams(window.location.search).get('brand');
    if (override) {
      if (data.brands[override]) return override;
      console.warn(`[BrandingService] Unknown ?brand=${override} — ignoring and resolving by hostname.`);
    }

    const matched = data.hostnameMap[hostname.toLowerCase()];
    if (matched && data.brands[matched]) return matched;

    return data.defaultBrand;
  }

  private applyCssVariables(): void {
    const b = this.brand();
    if (!b) return;
    const root = document.documentElement;
    root.style.setProperty('--brand-primary', b.colours.primary);
    root.style.setProperty('--brand-primary-rgb', hexToRgbTriplet(b.colours.primary));
    root.style.setProperty('--brand-primary-dark', b.colours.primaryDark);
    root.style.setProperty('--brand-primary-dark-rgb', hexToRgbTriplet(b.colours.primaryDark));
    root.style.setProperty('--brand-accent', b.colours.accent);
    root.style.setProperty('--brand-accent-rgb', hexToRgbTriplet(b.colours.accent));
  }

  private applyFavicons(): void {
    const b = this.brand();
    if (!b) return;
    const base = b.faviconBasePath;
    this.setIcon('icon', `${base}/favicon.ico`, 'image/x-icon');
    this.setIcon('icon', `${base}/favicon-32x32.png`, 'image/png', '32x32');
    this.setIcon('icon', `${base}/favicon-16x16.png`, 'image/png', '16x16');
    this.setIcon('apple-touch-icon', `${base}/apple-touch-icon.png`, undefined, '180x180');
  }

  private setIcon(rel: string, href: string, type?: string, sizes?: string): void {
    const selector = sizes
      ? `link[rel="${rel}"][sizes="${sizes}"]`
      : `link[rel="${rel}"]:not([sizes])`;
    let link = document.querySelector<HTMLLinkElement>(selector);
    if (!link) {
      link = document.createElement('link');
      link.rel = rel;
      if (sizes) link.setAttribute('sizes', sizes);
      document.head.appendChild(link);
    }
    if (type) link.type = type;
    link.href = href;
  }
}
