import { Controller, Get, Logger, OnModuleDestroy, Post, Query, Req, Res, UseGuards } from '@nestjs/common';
import { ApiExcludeController } from '@nestjs/swagger';
import { SSEServerTransport } from '@modelcontextprotocol/sdk/server/sse.js';
import { Request, Response } from 'express';
import { Public } from '../core/decorators/public.decorator';
import { McpApiKeyGuard } from './mcp-api-key.guard';
import { McpService } from './mcp.service';

/**
 * MCP server over HTTP/SSE, mounted outside the /api prefix at:
 *
 *   GET  /mcp/sse        - open the event stream (one per client session)
 *   POST /mcp/messages   - the client posts JSON-RPC requests here, with the
 *                          sessionId query parameter handed out by the stream
 *
 * Both require the `X-MCP-Key` header (McpApiKeyGuard); @Public() opts them out
 * of the browser cookie guard, since machine clients cannot do an SSO redirect.
 *
 * The SDK transports speak raw Node http objects, so the Express req/res are
 * passed straight through - which is why these handlers use @Res() rather than
 * returning a value.
 */
@Controller('mcp')
@ApiExcludeController()
@Public()
@UseGuards(McpApiKeyGuard)
export class McpController implements OnModuleDestroy {
  private readonly logger = new Logger(McpController.name);

  /** Live SSE sessions, keyed by the session id the transport generates. */
  private readonly transports = new Map<string, SSEServerTransport>();

  constructor(private readonly mcpService: McpService) {}

  /** Alias so plain `/mcp` works as well as `/mcp/sse`. */
  @Get()
  openRoot(@Res() res: Response): Promise<void> {
    return this.sse(res);
  }

  @Get('sse')
  async sse(@Res() res: Response): Promise<void> {
    // The endpoint the client should POST its messages back to. It is absolute
    // from the server root because /mcp lives outside the global /api prefix.
    const transport = new SSEServerTransport('/mcp/messages', res);
    const server = this.mcpService.createServer();

    this.transports.set(transport.sessionId, transport);
    this.logger.log(`MCP session ${transport.sessionId} opened`);

    res.on('close', () => {
      this.transports.delete(transport.sessionId);
      this.logger.log(`MCP session ${transport.sessionId} closed`);
      void server.close();
    });

    // connect() calls transport.start(), which writes the SSE headers.
    await server.connect(transport);
  }

  @Post('messages')
  async messages(
    @Query('sessionId') sessionId: string,
    @Req() req: Request,
    @Res() res: Response,
  ): Promise<void> {
    const transport = sessionId ? this.transports.get(sessionId) : undefined;

    if (!transport) {
      res.status(404).json({
        error: 'Unknown MCP sessionId. Open GET /mcp/sse first and reuse the sessionId it returns.',
      });
      return;
    }

    // Nest's body parser has already consumed the stream, so hand the parsed
    // body to the transport instead of letting it re-read the request.
    await transport.handlePostMessage(req, res, req.body);
  }

  async onModuleDestroy(): Promise<void> {
    for (const transport of this.transports.values()) {
      await transport.close().catch(() => undefined);
    }
    this.transports.clear();
  }
}
