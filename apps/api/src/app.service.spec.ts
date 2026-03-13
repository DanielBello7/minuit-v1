/**
 * Integration tests for AppService using Postgres test container.
 * Real DataSource; mail mocked.
 */
import { Test, TestingModule } from '@nestjs/testing';
import { getDataSourceToken } from '@nestjs/typeorm';
import { DataSource } from 'typeorm';
import { TypeOrmModule } from '@nestjs/typeorm';
import { HttpStatus } from '@nestjs/common';
import { AppService } from './app.service';
import { IMailModuleType } from '@app/util';
import { PostgresTestContainer } from '@test/helpers/pg-test-container';

const mailMock = {
  sendmail: jest.fn().mockResolvedValue(undefined),
  sendotp: jest.fn().mockResolvedValue(undefined),
};

describe('AppService (integration)', () => {
  const pg = new PostgresTestContainer();
  let app: TestingModule;
  let service: AppService;
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
      providers: [
        AppService,
        {
          provide: IMailModuleType,
          useValue: mailMock,
        },
      ],
    }).compile();

    service = app.get(AppService);
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
    expect(service).toBeDefined();
  });

  describe('check_db', () => {
    it('returns true when DB query succeeds', async () => {
      const result = await service.check_db();
      expect(result).toBe(true);
    });
  });

  describe('check_email', () => {
    it('returns true when sendmail succeeds', async () => {
      const result = await service.check_email();
      expect(result).toBe(true);
      expect(mailMock.sendmail).toHaveBeenCalledTimes(1);
    });

    it('returns false when sendmail fails', async () => {
      (mailMock.sendmail as jest.Mock).mockRejectedValueOnce(new Error('fail'));
      const result = await service.check_email();
      expect(result).toBe(false);
    });
  });

  describe('get_health', () => {
    it('returns full health shape with allHealthy when DB and email ok', async () => {
      const result = await service.get_health();

      expect(result.status).toBe(HttpStatus.OK);
      expect(result.is_active).toBe(true);
      expect(result.services.database).toBe(true);
      expect(result.services.email).toBe(true);
      expect(result.services.allHealthy).toBe(true);
      expect(typeof result.uptime).toBe('number');
      expect(result.version).toBeDefined();
      expect(result.timestamp).toBeDefined();
    });

    it('returns allHealthy false when email fails', async () => {
      (mailMock.sendmail as jest.Mock).mockRejectedValueOnce(
        new Error('mail down'),
      );
      const result = await service.get_health();

      expect(result.status).toBe(HttpStatus.SERVICE_UNAVAILABLE);
      expect(result.services.allHealthy).toBe(false);
      expect(result.services.email).toBe(false);
    });
  });
});
