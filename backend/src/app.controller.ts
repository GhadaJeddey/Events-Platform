import { Controller, Get } from '@nestjs/common';
import { ApiOperation, ApiTags } from '@nestjs/swagger';
import { AppService } from './app.service';

@ApiTags('App')
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
  @ApiOperation({ summary: 'Health check' })
  getHello(): string {
    return this.appService.getHello();
  }
}
