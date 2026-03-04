import { AppService } from './app.service';
import { Controller, Get } from '@nestjs/common';

@Controller()
export class AppController {
  constructor(private readonly app: AppService) {}

  @Get('health')
  async health() {
    return this.app.get_health();
  }
}
