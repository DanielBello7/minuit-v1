import { ConsoleLogger, Injectable } from '@nestjs/common';

@Injectable()
export class LogsService extends ConsoleLogger {
  static exceptions = [
    'RouterExplorer',
    'RoutesResolver',
    'InstanceLoader',
    'WebSocketsController',
  ];

  private check(value?: string) {
    if (value && LogsService.exceptions.includes(value)) {
      return true;
    }
    return false;
  }

  log(message: any, context?: string) {
    if (this.check(context)) return;
    super.log(message, context);
  }
}
