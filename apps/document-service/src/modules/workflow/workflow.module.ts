import { Module, Global } from '@nestjs/common';
import { WorkflowService } from './workflow.service';

@Global()
@Module({
  providers: [WorkflowService],
  exports: [WorkflowService],
})
export class WorkflowModule {}
