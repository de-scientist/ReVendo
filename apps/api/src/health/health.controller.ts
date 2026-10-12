import { Controller, Get } from '@nestjs/common';

const VERSION = '0.1.0';

@Controller('health')
export class HealthController {
  @Get()
  getHealth() {
    return {
      status: 'ok' as const,
      service: 'revendo-api' as const,
      version: VERSION,
      timestamp: new Date().toISOString(),
    };
  }
}
