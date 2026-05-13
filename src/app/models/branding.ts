export interface BrandColours {
  primary: string;
  primaryDark: string;
  accent: string;
}

export interface BrandConfig {
  id: string;
  displayName: string;
  logoUrl: string;
  faviconBasePath: string;
  colours: BrandColours;
}

export interface BrandingData {
  brands: Record<string, BrandConfig>;
  hostnameMap: Record<string, string>;
  defaultBrand: string;
}
