/**
 * Lookup entities. These are read-only from the frontend's point of view: the app only
 * fetches them to populate dropdowns / typeaheads (no admin CRUD screens).
 */

export interface Currency {
  id: number;
  code: string;
  name: string;
  symbol: string | null;
}

export interface Country {
  id: number;
  isoCode: string;
  name: string;
}

export interface UnLocode {
  id: number;
  code: string;
  name: string;
  countryId: number | null;
  latitude?: number | null;
  longitude?: number | null;
  country?: Country | null;
}

export interface DocumentType {
  id: number;
  name: string;
}

export interface UrlType {
  id: number;
  name: string;
}

export interface Tag {
  id: number;
  code: string;
  name: string;
  backgroundColor: string;
  textColor: string;
}

export interface Product {
  id: number;
  code: string;
  name: string;
}

export interface Module {
  id: number;
  name: string;
  /** Products this module references (zero or more). */
  productIds: number[];
  products: Product[];
}
