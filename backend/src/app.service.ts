import { Injectable } from '@nestjs/common';

@Injectable()
/**
 * Core service for the application.
 */
export class AppService {
  /**
   * Returns a configured greeting message.
   * @returns {string} The greeting message string.
   */
  getHello(): string {
    return 'Hello World!';
  }
}
