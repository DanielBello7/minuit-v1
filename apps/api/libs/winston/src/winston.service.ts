import { ConsoleLogger, Inject, Injectable } from '@nestjs/common';
import * as winston from 'winston';

@Injectable()
export class WinstonService extends ConsoleLogger {
  private readonly logger: winston.Logger;
  constructor(
    @Inject('WINSTON')
    private readonly winstonConfig: { dir: string },
  ) {
    super();

    this.logger = winston.createLogger({
      format: winston.format.combine(
        winston.format.json(),
        winston.format.timestamp({
          format: 'YYYY-MM-DD HH:mm:ss',
        }),
      ),
      level: 'info',
      transports: [
        new winston.transports.File({
          format: winston.format.json(),
          level: 'info',
          dirname: this.winstonConfig.dir,
          maxsize: 10240 * 10240,
        }),
      ],
    });
  }

  log(message: any, context?: string) {
    this.logger.info(`${message}\t${context}`);
    super.log(message, context);
  }

  error(message: any, stackOrContext?: string) {
    this.logger.error(`${message}\t${stackOrContext}`);
    super.error(message, stackOrContext);
  }
}
