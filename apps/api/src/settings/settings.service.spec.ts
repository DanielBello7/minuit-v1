/**
 * Integration tests for SettingsService using Postgres test container.
 * Settings are created via the service (find) only; repo is used only to
 * simulate invalid state (e.g. multiple rows) that the service then corrects.
 */
import { Test, TestingModule } from '@nestjs/testing';
import { getDataSourceToken } from '@nestjs/typeorm';
import { DataSource } from 'typeorm';
import { BadRequestException } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { SettingsService } from './settings.service';
import { SettingSchema } from './schemas/setting.schema';
import { UpdateSettingDto } from './dto/update-setting.dto';
import { PostgresTestContainer } from '@test/helpers/pg-test-container';

describe('SettingsService (integration)', () => {
  const pg = new PostgresTestContainer();
  let app: TestingModule;
  let service: SettingsService;
  let dataSource: DataSource;

  /** Create settings via the service (same path as production). */
  async function ensureSettings() {
    return service.find();
  }

  beforeAll(async () => {
    await pg.start();

    app = await Test.createTestingModule({
      imports: [
        TypeOrmModule.forRoot(
          pg.getTypeOrmOptions({
            entities: [SettingSchema],
          }),
        ),
        TypeOrmModule.forFeature([SettingSchema]),
      ],
      providers: [SettingsService],
    }).compile();

    service = app.get(SettingsService);
    dataSource = app.get(getDataSourceToken());
  }, 60_000);

  afterAll(async () => {
    await dataSource?.destroy();
    await app?.close();
    await pg.stop();
  });

  beforeEach(async () => {
    const repo = dataSource.getRepository(SettingSchema);
    await repo.clear();
  });

  describe('db connection', () => {
    it('connects to the database', async () => {
      const list = await dataSource.getRepository(SettingSchema).find();
      expect(Array.isArray(list)).toBe(true);
    });
  });

  describe('find', () => {
    it('creates default settings when none exist', async () => {
      const result = await service.find();
      expect(result.id).toBeDefined();
      expect(result.version).toBe('1.0.0');
      expect(result.max_free_alarms).toBe(1);
      expect(result.max_free_clocks).toBe(3);
      expect(result.charges).toEqual({ PAYMENT: [], REFUNDS: [] });
      expect(result.transaction_expiry_hours).toBe(6);
    });

    it('returns existing single row when one exists', async () => {
      await ensureSettings();
      await service.update({
        version: '2.0.0',
        max_free_alarms: 5,
        max_free_clocks: 10,
      });
      const result = await service.find();
      expect(result.version).toBe('2.0.0');
      expect(result.max_free_alarms).toBe(5);
      expect(result.max_free_clocks).toBe(10);
    });

    it('replaces multiple rows with single default', async () => {
      await ensureSettings();
      const repo = dataSource.getRepository(SettingSchema);
      // Service only ever maintains one row; use repo to simulate invalid multi-row state.
      await repo.save(
        repo.create({
          id: '00000000-0000-0000-4000-000000000002',
          version: 'a',
          max_free_alarms: 1,
          max_free_clocks: 1,
          charges: { PAYMENT: [], REFUNDS: [] },
        }),
      );
      await repo.save(
        repo.create({
          id: '00000000-0000-0000-4000-000000000003',
          version: 'b',
          max_free_alarms: 2,
          max_free_clocks: 2,
          charges: { PAYMENT: [], REFUNDS: [] },
        }),
      );
      const result = await service.find();
      expect(result.version).toBe('1.0.0');
      expect(result.max_free_alarms).toBe(1);
      expect(result.max_free_clocks).toBe(3);
      const count = await repo.count();
      expect(count).toBe(1);
    });
  });

  describe('update', () => {
    it('updates settings by id', async () => {
      await ensureSettings();
      const body: UpdateSettingDto = { max_free_alarms: 10, max_free_clocks: 20 };
      const result = await service.update(body);
      expect(result.max_free_alarms).toBe(10);
      expect(result.max_free_clocks).toBe(20);
    });

    it('throws BadRequestException for invalid DTO', async () => {
      await ensureSettings();
      await expect(service.update({ max_free_alarms: -1 } as UpdateSettingDto)).rejects.toThrow(
        BadRequestException,
      );
    });
  });

  describe('update_count', () => {
    it('increments max_free_alarms and max_free_clocks', async () => {
      await ensureSettings();
      const result = await service.update_count({
        max_free_alarms: 2,
        max_free_clocks: 1,
      });
      expect(result.max_free_alarms).toBe(3);
      expect(result.max_free_clocks).toBe(4);
    });
  });
});
