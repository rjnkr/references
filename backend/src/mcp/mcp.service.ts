import { Injectable, Logger } from '@nestjs/common';
import { McpServer } from '@modelcontextprotocol/sdk/server/mcp.js';
import { ContractType, Prisma } from '@prisma/client';
import { z } from 'zod';
import { DbService } from '../database/db-service/db.service';
import { CONTRACT_INCLUDE } from '../modules/contracts/contracts.service';
import { SYSTEM_INCLUDE, productSearch } from '../modules/systems/systems.service';

const DEFAULT_LIMIT = 25;
const MAX_LIMIT = 100;

/**
 * Thin pass-through wrapper around `McpServer.registerTool`, used at every
 * call site in this file instead of calling the method directly.
 *
 * `registerTool`'s generic signature checks the tool config against the SDK's
 * internal dual zod v3/v4 compatibility type (`AnySchema | ZodRawShapeCompat`
 * in `@modelcontextprotocol/sdk`'s `zod-compat` module). In this SDK version
 * (1.30.0) with zod 3.25.x, that check overflows TypeScript's type
 * instantiation depth (TS2589) for any of our multi-field `inputSchema`
 * objects - reproducible even with a plain `{ id: z.number().optional() }`
 * once a couple more properties are added alongside it. This is an upstream
 * limitation of the SDK's dual-compat generics, not a defect in our schemas:
 * zod's actual runtime parsing/validation of tool arguments is entirely
 * unaffected, only the static structural check on the config object is
 * bypassed here. Revisit this if a future SDK release simplifies that typing.
 */
function registerMcpTool(
  server: McpServer,
  name: string,
  config: { description: string; inputSchema?: z.ZodRawShape },
  handler: (...args: never[]) => unknown,
): void {
  (server.registerTool as (...args: unknown[]) => unknown)(name, config, handler);
}

const CONTRACT_TYPE_VALUES = ['PMIS', 'VTS', 'AIS', 'COASTAL', 'PILOT', 'OTHER'] as const;

/**
 * Tool input schemas declare `contractType` as a plain string, not
 * `z.enum(CONTRACT_TYPE_VALUES)`, and this function validates it at runtime
 * instead. Putting the enum's literal-tuple type into a schema that flows
 * through the MCP SDK's dual zod v3/v4 compat generics (`registerTool`)
 * blows past TypeScript's instantiation-depth limit (TS2589) - reproducible
 * with just `z.enum([...]).optional()` in an `inputSchema`. A plain string,
 * validated here, sidesteps the compiler limit without weakening validation.
 */
function parseContractType(value: string | undefined): ContractType | undefined {
  if (value === undefined) {
    return undefined;
  }
  if ((CONTRACT_TYPE_VALUES as readonly string[]).includes(value)) {
    return value as ContractType;
  }
  throw new Error(`Invalid contractType "${value}". Expected one of: ${CONTRACT_TYPE_VALUES.join(', ')}`);
}

/**
 * Named separately (rather than inlined into the `registerTool` call) so
 * TypeScript resolves its type once here instead of re-deriving it inside
 * `registerTool`'s generic signature.
 */
const listSystemsInputSchema = {
  search: z.string().optional().describe('Free text matched against system name and product code/name'),
  contractType: z
    .string()
    .optional()
    .describe(`Filter on the type of system. One of: ${CONTRACT_TYPE_VALUES.join(', ')}`),
  countryId: z.number().int().optional().describe('Country id, see list_countries'),
  limit: z.number().int().min(1).max(MAX_LIMIT).optional(),
} satisfies z.ZodRawShape;

const listContractsInputSchema = {
  search: z.string().optional().describe('Free text matched against the contract number and name'),
  systemId: z.number().int().optional().describe('System id, see list_systems, to find its contracts'),
  limit: z.number().int().min(1).max(MAX_LIMIT).optional(),
} satisfies z.ZodRawShape;

/** Wraps a result as MCP tool output. JSON keeps it unambiguous for the model. */
const asJson = (payload: unknown) => ({
  content: [{ type: 'text' as const, text: JSON.stringify(payload, null, 2) }],
});

@Injectable()
export class McpService {
  private readonly logger = new Logger(McpService.name);

  constructor(private readonly db: DbService) {}

  /**
   * A fresh McpServer per connection: an McpServer instance can only be bound
   * to a single transport, and every SSE connection gets its own transport.
   */
  createServer(): McpServer {
    const server = new McpServer(
      { name: 'tidalis-contract-references', version: '1.0.0' },
      {
        instructions:
          'Read-only access to the Tidalis contract reference database: delivered systems with ' +
          'their scope, products, ports, sub-systems and people, plus the commercial contracts ' +
          '(deals) linked to them. Use search_reference_systems when looking for systems that ' +
          'may be quoted to customers - it excludes sensitive systems and those the customer ' +
          'has not approved as a reference.',
      },
    );

    this.registerSystemTools(server);
    this.registerContractTools(server);
    this.registerLookupTools(server);

    return server;
  }

  // -------------------------------------------------------------------------
  // System tools
  // -------------------------------------------------------------------------

  private registerSystemTools(server: McpServer): void {
    registerMcpTool(server,
      'list_systems',
      {
        description:
          'List Tidalis delivered systems, optionally filtered. Returns a compact summary per ' +
          'system; use get_system for the full record.',
        inputSchema: listSystemsInputSchema,
      },
      async ({ search, contractType, countryId, limit }) => {
        const where: Prisma.SystemWhereInput = { deleted: false };
        if (search) {
          where.OR = [{ name: { contains: search } }, productSearch(search)];
        }
        const parsedContractType = parseContractType(contractType);
        if (parsedContractType) {
          where.contractType = parsedContractType;
        }
        if (countryId !== undefined) {
          where.countryId = countryId;
        }

        const [systems, total] = await Promise.all([
          this.db.system.findMany({
            where,
            include: { country: true, products: { include: { product: true } } },
            orderBy: { name: 'asc' },
            take: limit ?? DEFAULT_LIMIT,
          }),
          this.db.system.count({ where }),
        ]);

        return asJson({
          total,
          returned: systems.length,
          systems: systems.map((system) => this.toSystemSummary(system)),
        });
      },
    );

    registerMcpTool(server,
      'get_system',
      {
        description:
          'Get one system in full, including ports, modules, sub-systems, external interfaces, ' +
          'people, document metadata and the contracts (commercial deals) linked to it.',
        inputSchema: {
          id: z.number().int().describe('Numeric system id'),
        },
      },
      async ({ id }) => {
        const system = await this.db.system.findFirst({
          where: { id, deleted: false },
          include: SYSTEM_INCLUDE,
        });

        if (!system) {
          return asJson({ error: `No system found for id ${id}` });
        }

        const contracts = await this.db.contract.findMany({
          where: { systemId: id, deleted: false },
          include: { currency: true },
          orderBy: { awardDate: 'desc' },
        });

        return asJson({
          ...this.toSystemDetail(system),
          contracts: contracts.map((contract) => this.toContractSummary(contract)),
        });
      },
    );

    registerMcpTool(server,
      'search_reference_systems',
      {
        description:
          'Find systems that may be used as a commercial reference. Only returns systems the ' +
          'customer approved as a reference (canBeUsedAsReference) and that are not marked ' +
          'sensitive. The query is matched across name, products, scope and description; add a ' +
          'country name or ISO code to the query to narrow it down geographically.',
        inputSchema: {
          query: z
            .string()
            .describe('Free text, e.g. "VTS systems in Belgium" or "coastal radar surveillance"'),
          contractType: z
            .string()
            .optional()
            .describe(`One of: ${CONTRACT_TYPE_VALUES.join(', ')}`),
          limit: z.number().int().min(1).max(MAX_LIMIT).optional(),
        },
      },
      async ({ query, contractType: contractTypeInput, limit }) => {
        const contractType = parseContractType(contractTypeInput);
        // The query arrives as a natural language phrase. Rather than trying to
        // parse it, every meaningful word is matched across the free-text
        // fields and against country name/ISO code, and the results are ranked
        // by how many words matched.
        const words = this.significantWords(query);

        const baseWhere: Prisma.SystemWhereInput = {
          deleted: false,
          canBeUsedAsReference: true,
          isSensitive: false,
          ...(contractType ? { contractType } : {}),
        };

        const where: Prisma.SystemWhereInput =
          words.length === 0
            ? baseWhere
            : {
                ...baseWhere,
                OR: words.flatMap((word) => [
                  { name: { contains: word } },
                  productSearch(word),
                  { scope: { contains: word } },
                  { description: { contains: word } },
                  { country: { name: { contains: word } } },
                  { country: { isoCode: word.length === 2 ? word.toUpperCase() : undefined } },
                ]),
              };

        const systems = await this.db.system.findMany({
          where,
          include: { country: true, products: { include: { product: true } } },
          orderBy: { name: 'asc' },
          take: Math.min((limit ?? DEFAULT_LIMIT) * 2, MAX_LIMIT * 2),
        });

        const ranked = systems
          .map((system) => ({
            system,
            score: this.matchScore(system, words),
          }))
          .sort((a, b) => b.score - a.score)
          .slice(0, limit ?? DEFAULT_LIMIT);

        return asJson({
          query,
          matchedWords: words,
          returned: ranked.length,
          systems: ranked.map(({ system, score }) => ({
            ...this.toSystemSummary(system),
            matchScore: score,
            scope: system.scope,
          })),
        });
      },
    );
  }

  // -------------------------------------------------------------------------
  // Contract tools
  // -------------------------------------------------------------------------

  private registerContractTools(server: McpServer): void {
    registerMcpTool(server,
      'list_contracts',
      {
        description:
          'List Tidalis commercial contracts (deals), optionally filtered. Returns a compact ' +
          'summary per contract - the commercial facts (name, award date, prices, contract ' +
          'number) - use get_contract for the full record including its linked system.',
        inputSchema: listContractsInputSchema,
      },
      async ({ search, systemId, limit }) => {
        const where: Prisma.ContractWhereInput = { deleted: false };
        if (search) {
          where.OR = [{ contractNumber: { contains: search } }, { name: { contains: search } }];
        }
        if (systemId !== undefined) {
          where.systemId = systemId;
        }

        const [contracts, total] = await Promise.all([
          this.db.contract.findMany({
            where,
            include: { currency: true, system: true },
            orderBy: { awardDate: 'desc' },
            take: limit ?? DEFAULT_LIMIT,
          }),
          this.db.contract.count({ where }),
        ]);

        return asJson({
          total,
          returned: contracts.length,
          contracts: contracts.map((contract) => this.toContractSummary(contract)),
        });
      },
    );

    registerMcpTool(server,
      'get_contract',
      {
        description:
          'Get one contract in full: commercial facts (award date, prices, Pipedrive links, ' +
          'completion dates) plus its linked system, if any. Give either id or contractNumber.',
        inputSchema: {
          id: z.number().int().optional().describe('Numeric contract id'),
          contractNumber: z.string().optional().describe('Tidalis contract number, e.g. TID-2024-017'),
        },
      },
      async ({ id, contractNumber }) => {
        if (id === undefined && !contractNumber) {
          return asJson({ error: 'Either id or contractNumber is required' });
        }

        const contract = await this.db.contract.findFirst({
          where: id !== undefined ? { id, deleted: false } : { contractNumber, deleted: false },
          include: CONTRACT_INCLUDE,
        });

        if (!contract) {
          return asJson({
            error: `No contract found for ${id !== undefined ? `id ${id}` : `contract number ${contractNumber}`}`,
          });
        }

        return asJson(this.toContractDetail(contract));
      },
    );
  }

  // -------------------------------------------------------------------------
  // Lookup tools
  // -------------------------------------------------------------------------

  private registerLookupTools(server: McpServer): void {
    registerMcpTool(server,
      'list_currencies',
      { description: 'List the currencies contract prices can be recorded in.', inputSchema: {} },
      async () => asJson(await this.db.currency.findMany({ orderBy: { code: 'asc' } })),
    );

    registerMcpTool(server,
      'list_products',
      { description: 'List the Tidalis products with their product codes and names.', inputSchema: {} },
      async () => asJson(await this.db.product.findMany({ orderBy: { code: 'asc' } })),
    );

    registerMcpTool(server,
      'list_countries',
      {
        description: 'List countries with their ids and ISO 3166-1 alpha-2 codes.',
        inputSchema: {},
      },
      async () => asJson(await this.db.country.findMany({ orderBy: { name: 'asc' } })),
    );

    registerMcpTool(server,
      'list_unlocodes',
      {
        description: 'List or search UN/LOCODE port locations by code or name.',
        inputSchema: {
          search: z.string().optional().describe('Matches the UN/LOCODE or the location name'),
          limit: z.number().int().min(1).max(MAX_LIMIT).optional(),
        },
      },
      async ({ search, limit }) =>
        asJson(
          await this.db.unLocode.findMany({
            where: search
              ? { OR: [{ code: { contains: search } }, { name: { contains: search } }] }
              : {},
            include: { country: { select: { isoCode: true, name: true } } },
            orderBy: { code: 'asc' },
            take: limit ?? DEFAULT_LIMIT,
          }),
        ),
    );

    registerMcpTool(server,
      'list_document_types',
      { description: 'List the document types documents can be filed under.', inputSchema: {} },
      async () => asJson(await this.db.documentType.findMany({ orderBy: { name: 'asc' } })),
    );
  }

  // -------------------------------------------------------------------------
  // Shaping - systems
  // -------------------------------------------------------------------------

  private toSystemSummary(system: Record<string, any>) {
    return {
      id: system.id,
      name: system.name,
      contractType: system.contractType,
      products: system.products?.map((row: any) => row.product?.name),
      country: system.country?.name,
      countryCode: system.country?.isoCode,
      canBeUsedAsReference: system.canBeUsedAsReference,
      isSensitive: system.isSensitive,
      systemDecommissioned: system.systemDecommissioned,
    };
  }

  private toSystemDetail(system: Record<string, any>) {
    return {
      ...this.toSystemSummary(system),
      scope: system.scope,
      description: system.description,
      customerDetails: system.customerDetails,
      endUserDetails: system.endUserDetails,
      pointOfContact: {
        name: system.pocName,
        email: system.pocEmail,
        phone: system.pocPhone,
      },
      urls: system.urls?.map((row: any) => ({
        urlType: row.urlType?.name,
        description: row.description,
        url: row.url,
      })),
      ports: system.ports?.map((row: any) => ({
        unlocode: row.unlocode?.code,
        name: row.unlocode?.name,
        country: row.unlocode?.country?.name,
      })),
      modules: system.modules?.map((row: any) => row.module?.name),
      subSystems: system.subSystems?.map((row: any) => row.name),
      externalInterfaces: system.externalInterfaces?.map((row: any) => ({
        name: row.name,
        description: row.description,
      })),
      people: system.people?.map((row: any) => ({
        name: row.name,
        role: row.role,
        email: row.email,
      })),
      documents: system.documents?.map((row: any) => ({
        id: row.id,
        fileName: row.fileName,
        documentType: row.documentType?.name,
        fileSize: row.fileSize,
        uploadedAt: row.uploadedAt,
      })),
      createdAt: system.createdAt,
      updatedAt: system.updatedAt,
    };
  }

  // -------------------------------------------------------------------------
  // Shaping - contracts
  // -------------------------------------------------------------------------

  private toContractSummary(contract: Record<string, any>) {
    return {
      id: contract.id,
      contractNumber: contract.contractNumber,
      name: contract.name,
      awardDate: this.dateOnly(contract.awardDate),
      endDate: this.dateOnly(contract.endDate),
      contractType: contract.contractType,
      currency: contract.currency?.code,
      implementationPrice: contract.implementationPrice,
      maintenancePricePerYear: contract.maintenancePricePerYear,
      system: contract.system ? { id: contract.system.id, name: contract.system.name } : null,
    };
  }

  private toContractDetail(contract: Record<string, any>) {
    return {
      ...this.toContractSummary(contract),
      newDevelopments: contract.newDevelopments,
      implementationDetails: contract.implementationDetails,
      pipedriveNumber: contract.pipedriveNumber,
      urls: contract.urls?.map((row: any) => ({
        urlType: row.urlType?.name,
        description: row.description,
        url: row.url,
      })),
      completionDates: contract.completionDates?.map((row: any) => ({
        completionDate: this.dateOnly(row.completionDate),
        description: row.description,
      })),
      documents: contract.documents?.map((row: any) => ({
        id: row.id,
        fileName: row.fileName,
        documentType: row.documentType?.name,
        fileSize: row.fileSize,
        uploadedAt: row.uploadedAt,
      })),
      createdAt: contract.createdAt,
      updatedAt: contract.updatedAt,
    };
  }

  private dateOnly(value: Date | null | undefined): string | null {
    return value ? value.toISOString().slice(0, 10) : null;
  }

  /** Drops the filler words a natural language question is full of. */
  private significantWords(query: string): string[] {
    const stopWords = new Set([
      'a', 'an', 'and', 'any', 'are', 'as', 'at', 'be', 'been', 'can', 'contract', 'contracts',
      'find', 'for', 'from', 'get', 'give', 'has', 'have', 'in', 'is', 'it', 'list', 'me', 'of',
      'on', 'or', 'our', 'reference', 'references', 'search', 'show', 'system', 'systems',
      'that', 'the', 'to', 'us', 'usable', 'use', 'used', 'we', 'what', 'where', 'which', 'with',
    ]);

    return [
      ...new Set(
        query
          .toLowerCase()
          .split(/[^a-z0-9]+/)
          .filter((word) => word.length > 1 && !stopWords.has(word)),
      ),
    ].slice(0, 12);
  }

  private matchScore(system: Record<string, any>, words: string[]): number {
    if (words.length === 0) {
      return 0;
    }

    const haystack = [
      system.name,
      ...(system.products ?? []).flatMap((row: any) => [row.product?.code, row.product?.name]),
      system.scope,
      system.description,
      system.country?.name,
      system.country?.isoCode,
      system.contractType,
    ]
      .filter(Boolean)
      .join(' ')
      .toLowerCase();

    return words.filter((word) => haystack.includes(word)).length;
  }
}
