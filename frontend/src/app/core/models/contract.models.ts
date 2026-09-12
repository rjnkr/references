import { Currency, DocumentType, Tag, UrlType } from './lookup.models';

/* ====================================================================================
 * Contract types — mirrors the API contract implemented by the NestJS backend. A Contract
 * is the commercial deal (award date, prices, currency, Pipedrive links, completion
 * dates); the delivered system itself lives on the linked `System` - see `systemId`.
 * ================================================================================== */

export const CONTRACT_TYPES = ['PMIS', 'VTS', 'AIS', 'COASTAL', 'PILOT', 'OTHER'] as const;

export type ContractType = (typeof CONTRACT_TYPES)[number];

export const CONTRACT_TYPE_LABELS: Record<ContractType, string> = {
  PMIS: 'PMIS',
  VTS: 'VTS',
  AIS: 'AIS',
  COASTAL: 'Coastal',
  PILOT: 'Pilot',
  OTHER: 'Other',
};

/** Multi-select: which phase(s) of work a contract covers - `Contract.contractType`. Not to
 *  be confused with `System.contractType` (`ContractType`) above. */
export const CONTRACT_TAGS = [
  'IMPLEMENTATION',
  'SM',
  'PROOF_OF_CONCEPT',
  'STUDY',
  'CONSULTANCY',
  'REQUIREMENT_ANALYSIS',
] as const;

export type ContractTag = (typeof CONTRACT_TAGS)[number];

export const CONTRACT_TAG_LABELS: Record<ContractTag, string> = {
  IMPLEMENTATION: 'Implementation',
  SM: 'Support & Maintenance',
  PROOF_OF_CONCEPT: 'Proof of concept',
  STUDY: 'Study',
  CONSULTANCY: 'Consultancy',
  REQUIREMENT_ANALYSIS: 'Requirement Analyse',
};

/* --- Child collections (as returned by the API) ------------------------------------ */

export interface ContractCompletionDate {
  id: number;
  /** ISO date, date only (`YYYY-MM-DD`). */
  completionDate: string;
  description?: string;
}

/** The subset of a System's own fields surfaced on `Contract.system` - just enough to
 *  identify and link to it, without its own nested relations. */
export interface SystemRef {
  id: number;
  name: string;
}

export interface ContractTagAssignment {
  id: number;
  tagId: number;
  tag: Tag;
}

export interface ContractUrl {
  id: number;
  urlTypeId: number;
  urlType: UrlType;
  description?: string;
  url: string;
}

export interface ContractDocument {
  id: number;
  documentTypeId: number;
  documentType: DocumentType;
  fileName: string;
  fileSize: number;
  mimeType: string;
  /** ISO date-time. */
  uploadedAt: string;
  uploadedBy?: string;
}

/* --- The main entity --------------------------------------------------------------- */

export interface Contract {
  id: number;
  contractNumber: string | null;
  name?: string;
  /** ISO date, date only (`YYYY-MM-DD`). */
  awardDate: string;
  /** ISO date, date only (`YYYY-MM-DD`). Optional - many contracts are still ongoing. */
  endDate?: string;
  contractType: ContractTag[];
  implementationPrice: number;
  maintenancePricePerYear: number;
  currencyId: number;
  currency: Currency;
  /** System.id this contract relates to. Not every contract links to a System, and several
   *  contracts (e.g. an implementation plus later maintenance renewals) can link to the
   *  same one. */
  systemId: number | null;
  system?: SystemRef | null;
  newDevelopments?: string;
  implementationDetails?: string;
  pipedriveNumber?: string;
  /** Internal use only — Tidalis employees only. Never surfaced to customers or through
   *  any public-facing output (AI/MCP tools, reference search, customer-facing exports). */
  internalNotes?: string;
  createdAt: string;
  updatedAt: string;
  completionDates: ContractCompletionDate[];
  documents: ContractDocument[];
  tags: ContractTagAssignment[];
  urls: ContractUrl[];
}

/* --- Write payloads ---------------------------------------------------------------- */

/**
 * Nested write shape. Child arrays carry only the writable fields (no `id`); when a
 * child array is present the backend replaces that collection wholesale.
 */
export interface ContractWritePayload {
  contractNumber?: string;
  name?: string;
  awardDate?: string;
  endDate?: string | null;
  contractType?: ContractTag[];
  implementationPrice?: number;
  maintenancePricePerYear?: number;
  currencyId?: number;
  systemId?: number | null;
  newDevelopments?: string | null;
  implementationDetails?: string | null;
  pipedriveNumber?: string | null;
  internalNotes?: string | null;
  completionDates?: { completionDate: string; description?: string | null }[];
  tags?: number[];
  urls?: { urlTypeId: number; description?: string | null; url: string }[];
}

/* --- Query / response -------------------------------------------------------------- */

export type SortDirection = 'asc' | 'desc';

export interface ContractQuery {
  search?: string;
  currencyId?: number | null;
  systemId?: number | null;
  /** `field:asc` / `field:desc` — see ContractService for the exact encoding. */
  sort?: string;
  page?: number;
  pageSize?: number;
}

export interface PagedResult<T> {
  data: T[];
  total: number;
}
