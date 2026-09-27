import { Country, DocumentType, Module, Product, Tag, UnLocode, UrlType } from './lookup.models';
import { ContractType } from './contract.models';

/* ====================================================================================
 * System types — mirrors the API contract implemented by the NestJS backend
 * (GET/POST/PATCH/DELETE /api/systems). A System is the delivered system itself
 * (scope, products, location, ports, modules, sub-systems, external interfaces, people,
 * documents); the commercial deal(s) around it are separate `Contract` rows that link back
 * via `Contract.systemId`.
 * ================================================================================== */

/* --- Child collections (as returned by the API) ------------------------------------ */

export interface SystemPort {
  id: number;
  unlocodeId: number;
  unlocode: UnLocode;
}

export interface SystemNamedItem {
  id: number;
  name: string;
}

export interface SystemExternalInterface {
  id: number;
  name: string;
  description?: string;
}

export interface SystemPerson {
  id: number;
  name: string;
  role: string;
  email?: string;
}

export interface SystemTagAssignment {
  id: number;
  tagId: number;
  tag: Tag;
}

export interface SystemProductAssignment {
  id: number;
  productId: number;
  product: Product;
}

export interface SystemModuleAssignment {
  id: number;
  moduleId: number;
  module: Module;
}

export interface SystemUrl {
  id: number;
  urlTypeId: number;
  urlType: UrlType;
  description?: string;
  url: string;
}

export interface SystemDocument {
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

export interface System {
  id: number;
  /** @maxLength 100 */
  name: string;
  scope: string;
  contractType: ContractType;
  description?: string;
  customerDetails?: string;
  endUserDetails?: string;
  /** Internal use only — Tidalis employees only. Never surfaced to customers or through
   *  any public-facing output (AI/MCP tools, reference search, customer-facing exports). */
  internalNotes?: string;
  countryId: number;
  country: Country;
  /** UnLocode.id where the delivered system itself is installed - the system's own
   *  "main" location, distinct from every port it may additionally reference. */
  systemUnlocodeId: number;
  systemUnlocode: UnLocode;
  pocName?: string;
  pocEmail?: string;
  pocPhone?: string;
  isSensitive: boolean;
  canBeUsedAsReference: boolean;
  systemDecommissioned: boolean;
  createdAt: string;
  updatedAt: string;
  ports: SystemPort[];
  /** Tidalis products used, zero or more. */
  products: SystemProductAssignment[];
  modules: SystemModuleAssignment[];
  subSystems: SystemNamedItem[];
  externalInterfaces: SystemExternalInterface[];
  people: SystemPerson[];
  documents: SystemDocument[];
  tags: SystemTagAssignment[];
  urls: SystemUrl[];
}

/* --- Write payloads ---------------------------------------------------------------- */

/**
 * Nested write shape. Child arrays carry only the writable fields (no `id`); when a
 * child array is present the backend replaces that collection wholesale.
 */
export interface SystemWritePayload {
  name?: string;
  scope?: string;
  contractType?: ContractType;
  /** Product ids. */
  products?: number[];
  description?: string | null;
  customerDetails?: string | null;
  endUserDetails?: string | null;
  internalNotes?: string | null;
  countryId?: number;
  systemUnlocodeId?: number | null;
  pocName?: string | null;
  pocEmail?: string | null;
  pocPhone?: string | null;
  isSensitive?: boolean;
  canBeUsedAsReference?: boolean;
  systemDecommissioned?: boolean;
  ports?: { unlocodeId: number }[];
  modules?: number[];
  subSystems?: { name: string }[];
  externalInterfaces?: { name: string; description?: string | null }[];
  people?: { name: string; role: string; email?: string | null }[];
  tags?: number[];
  urls?: { urlTypeId: number; description?: string | null; url: string }[];
}

/* --- Query / response -------------------------------------------------------------- */

export interface SystemQuery {
  search?: string;
  contractType?: ContractType | '';
  countryId?: number | null;
  isSensitive?: boolean | null;
  canBeUsedAsReference?: boolean | null;
  systemDecommissioned?: boolean | null;
  /** `field:asc` / `field:desc` — see SystemService for the exact encoding. */
  sort?: string;
  page?: number;
  pageSize?: number;
}
