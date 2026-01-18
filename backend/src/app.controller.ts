import { Controller, Get } from '@nestjs/common';
import { AppService } from './app.service';

@Controller()
/**
 * Root controller of the application.
 * Handles the base route requests.
 */
export class AppController {
  constructor(private readonly appService: AppService) { }

  /**
   * Returns a hello world greeting.
   * @returns {string} The greeting message.
   */
  @Get()
  getHello(): string {
    return this.appService.getHello();
  }
}
