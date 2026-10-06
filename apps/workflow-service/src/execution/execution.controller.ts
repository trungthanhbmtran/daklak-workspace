import { Controller } from '@nestjs/common';
import { EventPattern, Payload } from '@nestjs/microservices';
import { ExecutionService } from './execution.service';

@Controller()
export class ExecutionController {
  constructor(private readonly executionService: ExecutionService) {}

  @EventPattern('workflow.instance.start_requested')
  async handleStartRequested(@Payload() data: { code: string; payload: any }) {
    await this.executionService.startProcess(data.code, data.payload);
  }

  @EventPattern('workflow.auto_binding.trigger')
  async handleAutoBindingTrigger(
    @Payload() data: { entity: string; eventTrigger: string; payloadData: any },
  ) {
    await this.executionService.triggerAutoBinding(data);
  }

  @EventPattern('workflow.task.action_submitted')
  async handleActionSubmitted(
    @Payload() data: { taskId: string; payload: any },
  ) {
    await this.executionService.completeTask(data.taskId, data.payload);
  }
}
