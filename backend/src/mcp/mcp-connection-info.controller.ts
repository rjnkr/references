import { Controller, Get } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { ApiOkResponse, ApiOperation, ApiTags } from '@nestjs/swagger';
import { McpConnectionInfoDto } from './dto/mcp-connection-info.dto';

/**
 * Authenticated (normal session cookie) counterpart to `McpController`: that controller
 * is `@Public()` with its own `X-MCP-Key` shared-secret guard for machine clients, this
 * one needs the opposite - a real signed-in user - so the frontend's "Connect Claude" page
 * can show the real key instead of a placeholder. This reveals nothing a signed-in user
 * couldn't already reach through the normal API (see that page's own security note).
 *
 * Lives under `/mcp`, same as McpController, but the route itself (`mcp/connection-info`)
 * is not in main.ts's global-prefix exclusion list, so it is served under `/api` and so
 * picks up the default `JwtCookieAuthGuard` like every other API route.
 */
@Controller('mcp')
@ApiTags('MCP')
export class McpConnectionInfoController {
  constructor(private readonly configService: ConfigService) {}

  @Get('connection-info')
  @ApiOperation({
    summary: "Get the current MCP connection details for the \"Connect Claude\" page",
    description:
      'Requires the normal session cookie. Returns the live MCP_API_KEY value so a ' +
      'signed-in user can copy a working configuration straight away.',
  })
  @ApiOkResponse({ type: McpConnectionInfoDto })
  getConnectionInfo(): McpConnectionInfoDto {
    return { apiKey: this.configService.get<string>('MCP.API_KEY') || null };
  }
}
