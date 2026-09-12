import { Module } from '@nestjs/common';
import { CoreModule } from '../../core/core.module';
import { ContractDocumentsController } from './contract-documents.controller';
import { ContractDocumentsService } from './contract-documents.service';
import { ContractsController } from './contracts.controller';
import { ContractsService } from './contracts.service';

@Module({
  imports: [CoreModule],
  controllers: [ContractsController, ContractDocumentsController],
  providers: [ContractsService, ContractDocumentsService],
  exports: [ContractsService, ContractDocumentsService],
})
export class ContractsModule {}
