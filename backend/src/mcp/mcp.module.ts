import { Module } from '@nestjs/common';
import { CoreModule } from '../core/core.module';
import { McpApiKeyGuard } from './mcp-api-key.guard';
import { McpConnectionInfoController } from './mcp-connection-info.controller';
import { McpController } from './mcp.controller';
import { McpService } from './mcp.service';

@Module({
  imports: [CoreModule],
  controllers: [McpController, McpConnectionInfoController],
  providers: [McpService, McpApiKeyGuard],
})
export class McpModule {}
