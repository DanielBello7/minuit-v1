/**
 * Integration tests for AppController using Postgres test container.
 * Real AppService with real DB; mail mocked; controller methods called directly.
 */
import { Test, TestingModule } from '@nestjs/testing';
import { getDataSourceToken } from '@nestjs/typeorm';
import { DataSource } from 'typeorm';
import { TypeOrmModule } from '@nestjs/typeorm';
import { HttpStatus } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { IMailModuleType } from '@app/util';
import { PostgresTestContainer } from '@test/helpers/pg-test-container';

const mailMock = {
  sendmail: jest.fn().mockResolvedValue(undefined),
  sendotp: jest.fn().mockResolvedValue(undefined),
};

describe('AppController (integration)', () => {
  const pg = new PostgresTestContainer();
  let app: TestingModule;
  let controller: AppController;
  let dataSource: DataSource;

  beforeAll(async () => {
    await pg.start();

    app = await Test.createTestingModule({
      imports: [
        TypeOrmModule.forRoot(
          pg.getTypeOrmOptions({
            entities: [],
          }),
        ),
      ],
      controllers: [AppController],
      providers: [
        AppService,
        {
          provide: IMailModuleType,
          useValue: mailMock,
        },
      ],
    }).compile();

    controller = app.get(AppController);
    dataSource = app.get(getDataSourceToken());
  }, 60_000);

  afterAll(async () => {
    await dataSource?.destroy();
    await app?.close();
    await pg.stop();
  });

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  describe('health', () => {
    it('returns health payload with status, services, uptime, version', async () => {
      const result = await controller.health();

      expect(result).toBeDefined();
      expect(result.status).toBe(HttpStatus.OK);
      expect(result.is_active).toBe(true);
      expect(result.timestamp).toBeDefined();
      expect(result.uptime).toBeDefined();
      expect(result.version).toBeDefined();
      expect(result.services).toEqual({
        allHealthy: true,
        database: true,
        email: true,
      });
    });

    it('returns SERVICE_UNAVAILABLE when email check fails', async () => {
      (mailMock.sendmail as jest.Mock).mockRejectedValueOnce(
        new Error('mail down'),
      );

      const result = await controller.health();

      expect(result.status).toBe(HttpStatus.SERVICE_UNAVAILABLE);
      expect(result.services.database).toBe(true);
      expect(result.services.email).toBe(false);
      expect(result.services.allHealthy).toBe(false);
    });
  });
});
