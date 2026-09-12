import { CanActivate, ExecutionContext, Injectable, Logger, UnauthorizedException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { Request } from 'express';

/**
 * The MCP endpoint is for machine clients (AI applications), which cannot
 * follow a browser SSO redirect. They authenticate with a shared secret in the
 * `X-MCP-Key` header instead, checked against MCP_API_KEY.
 *
 * When MCP_API_KEY is empty the endpoint is closed rather than open - failing
 * shut is the right default for something that exposes contract data.
 */
@Injectable()
export class McpApiKeyGuard implements CanActivate {
  private readonly logger = new Logger(McpApiKeyGuard.name);

  constructor(private readonly configService: ConfigService) {}

  canActivate(context: ExecutionContext): boolean {
    const expected = this.configService.get<string>('MCP.API_KEY');

    if (!expected) {
      this.logger.warn('MCP request rejected: MCP_API_KEY is not configured on this server');
      throw new UnauthorizedException('The MCP endpoint is disabled (MCP_API_KEY is not set)');
    }

    const request = context.switchToHttp().getRequest<Request>();
    const provided = request.header('X-MCP-Key');

    if (!provided || provided !== expected) {
      throw new UnauthorizedException('Missing or invalid X-MCP-Key header');
    }

    return true;
  }
}
