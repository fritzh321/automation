import { Controller, Get } from '@nestjs/common';
import { AppService } from './app.service';

@Controller()
export class AppController {
  constructor(private readonly app.srv: AppService) {}

  @Get()
  getHello(): string {
    return this.app.srv.getHello();
  }
}
