import { Currency, DocumentType, Tag, UrlType } from './lookup.models';

/* ====================================================================================
 * Project types — mirrors the API contract implemented by the NestJS backend. A Project
 * is the commercial deal (award date, prices, currency, Pipedrive links, completion
 * dates); the delivered system itself lives on the linked `System` - see `systemId`.
 * ================================================================================== */

export const PROJECT_TYPES = ['PMIS', 'VTS', 'AIS', 'COASTAL', 'PILOT', 'OTHER'] as const;

export type ProjectType = (typeof PROJECT_TYPES)[number];

export const PROJECT_TYPE_LABELS: Record<ProjectType, string> = {
  PMIS: 'PMIS',
  VTS: 'VTS',
  AIS: 'AIS',
  COASTAL: 'Coastal',
  PILOT: 'Pilot',
  OTHER: 'Other',
};

/** Multi-select: which phase(s) of work a project covers - `Project.projectType`. Not to
 *  be confused with `System.projectType` (`ProjectType`) above. */
export const PROJECT_TAGS = [
  'IMPLEMENTATION',
  'SM',
  'PROOF_OF_CONCEPT',
  'STUDY',
  'CONSULTANCY',
  'REQUIREMENT_ANALYSIS',
] as const;

export type ProjectTag = (typeof PROJECT_TAGS)[number];

export const PROJECT_TAG_LABELS: Record<ProjectTag, string> = {
  IMPLEMENTATION: 'Implementation',
  SM: 'Support & Maintenance',
  PROOF_OF_CONCEPT: 'Proof of concept',
  STUDY: 'Study',
  CONSULTANCY: 'Consultancy',
  REQUIREMENT_ANALYSIS: 'Requirement Analyse',
};

/* --- Child collections (as returned by the API) ------------------------------------ */

export interface ProjectCompletionDate {
  id: number;
  /** ISO date, date only (`YYYY-MM-DD`). */
  completionDate: string;
  description?: string;
}

/** The subset of a System's own fields surfaced on `Project.system` - just enough to
 *  identify and link to it, without its own nested relations. */
export interface SystemRef {
  id: number;
  name: string;
}

export interface ProjectTagAssignment {
  id: number;
  tagId: number;
  tag: Tag;
}

export interface ProjectUrl {
  id: number;
  urlTypeId: number;
  urlType: UrlType;
  description?: string;
  url: string;
}

export interface ProjectDocument {
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

export interface Project {
  id: number;
  projectNumber: string | null;
  name?: string;
  /** ISO date, date only (`YYYY-MM-DD`). */
  awardDate: string;
  /** ISO date, date only (`YYYY-MM-DD`). Optional - many projects are still ongoing. */
  endDate?: string;
  projectType: ProjectTag[];
  implementationPrice: number;
  maintenancePricePerYear: number;
  currencyId: number;
  currency: Currency;
  /** System.id this project relates to. Not every project links to a System, and several
   *  projects (e.g. an implementation plus later maintenance renewals) can link to the
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
  completionDates: ProjectCompletionDate[];
  documents: ProjectDocument[];
  tags: ProjectTagAssignment[];
  urls: ProjectUrl[];
}

/* --- Write payloads ---------------------------------------------------------------- */

/**
 * Nested write shape. Child arrays carry only the writable fields (no `id`); when a
 * child array is present the backend replaces that collection wholesale.
 */
export interface ProjectWritePayload {
  projectNumber?: string;
  name?: string;
  awardDate?: string;
  endDate?: string | null;
  projectType?: ProjectTag[];
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

export interface ProjectQuery {
  search?: string;
  currencyId?: number | null;
  systemId?: number | null;
  /** `field:asc` / `field:desc` — see ProjectService for the exact encoding. */
  sort?: string;
  page?: number;
  pageSize?: number;
}

export interface PagedResult<T> {
  data: T[];
  total: number;
}
