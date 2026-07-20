import { Injectable } from '@nestjs/common';
import {
  WorkflowServiceAction,
  WorkflowContext,
  WorkflowActionResult,
} from './action.interface';
import { DynamicSdkService } from '../sdk/sdk.service';

@Injectable()
export class DynamicIntegrationAction implements WorkflowServiceAction {
  code = 'DYNAMIC_INTEGRATION';

  constructor(private readonly sdkService: DynamicSdkService) {}

  async execute(
    ctx: WorkflowContext,
    payload?: any,
  ): Promise<WorkflowActionResult> {
    if (!payload || !payload.connectionCode) {
      return {
        success: false,
        error: 'Missing connectionCode in payload',
      };
    }

    try {
      const result = await this.sdkService.executeIntegration(
        payload.connectionCode,
        {
          ...payload.data,
          ...ctx.variables, // merge context variables
        },
      );

      return {
        success: true,
        variables: {
          [payload.resultVariable || 'integrationResult']: result,
        },
      };
    } catch (error: any) {
      return {
        success: false,
        error: error.message,
      };
    }
  }
}
