import { Controller, Get } from '@nestjs/common';
import { RegistryService } from './registry.service';

@Controller('admin/integration')
export class IntegrationController {
  constructor(private readonly registryService: RegistryService) {}

  @Get('status')
  async getStatus() {
    return {
      success: true,
      ready: this.registryService.checkReady(),
      // To expose list, we'd add a method to registryService. For now, just ready status.
    };
  }
}
