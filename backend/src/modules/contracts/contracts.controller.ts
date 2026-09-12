import {
  Body,
  Controller,
  Delete,
  Get,
  HttpCode,
  HttpStatus,
  Logger,
  Param,
  ParseIntPipe,
  Patch,
  Post,
  Query,
} from '@nestjs/common';
import { ApiOkResponse, ApiOperation, ApiTags } from '@nestjs/swagger';
import { CurrentUser, SessionUser } from '../../core/decorators/current-user.decorator';
import { CreateContractRequestDto } from './dto/create-contract-request.dto';
import { ExpandedContractDto, ContractListResponseDto } from './dto/expanded-contract.dto';
import { QueryContractsDto } from './dto/query-contracts.dto';
import { UpdateContractRequestDto } from './dto/update-contract-request.dto';
import { ContractsService } from './contracts.service';

@Controller('contracts')
@ApiTags('Contracts')
export class ContractsController {
  private readonly logger = new Logger(ContractsController.name);

  constructor(private readonly contractsService: ContractsService) {}

  @Get()
  @ApiOperation({
    summary: 'List contracts',
    description:
      'Filtered, sorted and paginated list. Every item is fully expanded (currency, linked System summary, completion dates, document metadata) so the list and detail views need no extra requests.',
  })
  @ApiOkResponse({ type: ContractListResponseDto })
  findAll(@Query() query: QueryContractsDto) {
    return this.contractsService.findAll(query);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get one contract, fully expanded' })
  @ApiOkResponse({ type: ExpandedContractDto })
  findOne(@Param('id', ParseIntPipe) id: number) {
    return this.contractsService.findOne(id);
  }

  @Post()
  @ApiOperation({
    summary: 'Create a contract with all of its child collections',
    description: 'The whole nested payload is created in a single transaction.',
  })
  @ApiOkResponse({ type: ExpandedContractDto })
  create(@Body() data: CreateContractRequestDto, @CurrentUser() user: SessionUser) {
    return this.contractsService.create(data, user);
  }

  @Patch(':id')
  @ApiOperation({
    summary: 'Update a contract',
    description:
      'Scalar fields are patched. A child collection present in the body replaces the existing rows completely; an absent collection is left untouched; an empty array clears it. All in one transaction.',
  })
  @ApiOkResponse({ type: ExpandedContractDto })
  update(
    @Param('id', ParseIntPipe) id: number,
    @Body() data: UpdateContractRequestDto,
    @CurrentUser() user: SessionUser,
  ) {
    return this.contractsService.update(id, data, user);
  }

  @Delete(':id')
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiOperation({
    summary: 'Delete a contract',
    description:
      'Soft delete: the contract is flagged as deleted rather than removed, so it can be restored from its audit trail entry. To every normal read (list, detail, MCP) it behaves exactly like a hard delete.',
  })
  async remove(@Param('id', ParseIntPipe) id: number, @CurrentUser() user: SessionUser): Promise<void> {
    await this.contractsService.remove(id, user);
    this.logger.log(`Soft-deleted contract ${id}`);
  }

  @Post(':id/restore')
  @ApiOperation({
    summary: 'Restore a soft-deleted contract',
    description: 'Reachable from the DELETE entry in the audit trail. Clears the deleted flag.',
  })
  @ApiOkResponse({ type: ExpandedContractDto })
  restore(@Param('id', ParseIntPipe) id: number, @CurrentUser() user: SessionUser) {
    return this.contractsService.restore(id, user);
  }
}
