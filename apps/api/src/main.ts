import { HttpAdapterHost, NestFactory, Reflector } from '@nestjs/core';
import { AppModule } from './app.module';
import { LogsService } from '@app/logs';
import { ClassSerializerInterceptor, ValidationPipe } from '@nestjs/common';
import * as compression from 'compression';
import * as cookie from 'cookie-parser';
import helmet from 'helmet';
import { ExceptionFilter } from '@app/winston/exception.filter';
import { WinstonService } from '@app/winston';
import { CONSTANTS } from '@app/constants';

async function bootstrap() {
  const app = await NestFactory.create(AppModule, {
    logger: new LogsService(),
  });
  const winston = app.get(WinstonService);
  const { httpAdapter } = app.get(HttpAdapterHost);
  app.enableCors({
    origin: CONSTANTS.ALLOWED_URLS,
    credentials: true,
    methods: 'GET,HEAD,PUT,PATCH,POST,DELETE,OPTIONS',
    allowedHeaders: 'Content-Type, Authorization',
  });
  app.use(cookie());
  app.useGlobalFilters(new ExceptionFilter(winston, httpAdapter));
  app.useGlobalInterceptors(new ClassSerializerInterceptor(app.get(Reflector)));
  app.use(compression());
  app.use(helmet());
  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      transform: true,
    }),
  );
  await app.listen(CONSTANTS.PORT, '0.0.0.0');
}
void bootstrap();
