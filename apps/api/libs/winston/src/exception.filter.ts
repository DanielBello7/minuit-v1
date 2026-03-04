import { ArgumentsHost, Catch } from '@nestjs/common';
import { WinstonService } from '@app/winston';
import { AbstractHttpAdapter, BaseExceptionFilter } from '@nestjs/core';

@Catch()
export class ExceptionFilter extends BaseExceptionFilter {
  constructor(
    private readonly logger: WinstonService,
    private readonly httpAdapter: AbstractHttpAdapter,
  ) {
    super(httpAdapter);
  }
  catch(exception: unknown, host: ArgumentsHost) {
    this.logger.error((exception as Error).message, ExceptionFilter.name);
    super.catch(exception, host);
  }
}
