import * as fs from 'fs';
import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { UsersModule } from './accounts/users/users.module';
import { AdminsModule } from './accounts/admins/admins.module';
import { PackagesModule } from './packages/packages.module';
import { SubsModule } from './subs/subs.module';
import { AlarmsModule } from './alarms/alarms.module';
import { ClocksModule } from './clocks/clocks.module';
import { FeedbacksModule } from './feedbacks/feedbacks.module';
import { TransactionsModule } from './transactions/transactions.module';
import { AuthModule } from './auth/auth.module';
import { ThrottlerGuard, ThrottlerModule } from '@nestjs/throttler';
import { JwtStrategy, LocalStrategy } from './auth/strategies';
import { APP_GUARD } from '@nestjs/core';
import { WinstonModule } from '@app/winston';
import { BrevoModule } from '@app/brevo';
import { CONSTANTS } from '@app/constants';
import { TypeOrmModule } from '@nestjs/typeorm';
import { JwtModule } from '@nestjs/jwt';

@Module({
  imports: [
    ThrottlerModule.forRoot([
      { ttl: 1000, limit: 1, name: 'typeA' },
      { ttl: 6000, limit: 3, name: 'typeB' },
    ]),
    AdminsModule,
    UsersModule,
    AlarmsModule,
    AuthModule,
    ClocksModule,
    FeedbacksModule,
    PackagesModule,
    SubsModule,
    TransactionsModule,
    JwtModule.register({
      global: true,
      secret: CONSTANTS.JWT_SECRET,
      signOptions: {
        expiresIn: CONSTANTS.JWT_EXPIRES_IN as any,
      },
    }),
    TypeOrmModule.forRoot({
      type: 'postgres',
      host: CONSTANTS.SQL_DATABASE_HOST,
      port: CONSTANTS.SQL_DATABASE_PORT,
      username: CONSTANTS.SQL_DATABASE_USERNAME,
      password: CONSTANTS.SQL_DATABASE_PASSWORD,
      database: CONSTANTS.SQL_DATABASE_NAME,
      entities: [],
      migrations: [],
      synchronize: CONSTANTS.NODE_ENV === 'development' ? true : false,
      ssl: CONSTANTS.SQL_SSL_MODE,
      extra: CONSTANTS.SQL_SSL_MODE
        ? {
            ssl: {
              rejectUnauthorized: false,
              ...(CONSTANTS.SQL_SSL_TYPE === 'heavy'
                ? {
                    ca: fs.readFileSync(CONSTANTS.SQL_DATABASE_CA_CERT),
                  }
                : {}),
            },
          }
        : undefined,
    }),
    BrevoModule.register({
      apiKy: CONSTANTS.EMAIL_API_KEY,
      email: CONSTANTS.APP_EMAIL,
      ename: CONSTANTS.APP_EMAIL_NAME,
    }),
    WinstonModule.register({ dir: CONSTANTS.LOG_PATH }),
  ],
  providers: [
    AppService,
    LocalStrategy,
    JwtStrategy,
    {
      provide: APP_GUARD,
      useClass: ThrottlerGuard,
    },
  ],
  controllers: [AppController],
})
export class AppModule {}
