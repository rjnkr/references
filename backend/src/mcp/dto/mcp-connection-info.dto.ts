import { ApiProperty } from '@nestjs/swagger';

export class McpConnectionInfoDto {
  @ApiProperty({
    nullable: true,
    description:
      'Current MCP_API_KEY value, or null when the MCP endpoint is disabled (MCP_API_KEY unset on the server).',
  })
  apiKey: string | null;
}
