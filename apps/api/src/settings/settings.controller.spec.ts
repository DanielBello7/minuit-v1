/**
 * Integration tests for SettingsController using Postgres test container.
 * Controller methods are called directly (guards not executed).
 */
import { Test, TestingModule } from '@nestjs/testing';
import { getDataSourceToken } from '@nestjs/typeorm';
import { DataSource } from 'typeorm';
import { JwtModule } from '@nestjs/jwt';
import { TypeOrmModule } from '@nestjs/typeorm';
import { SettingsController } from './settings.controller';
import { SettingSchema } from './schemas/setting.schema';
import { SettingsModule } from './settings.module';
import { UpdateSettingDto } from './dto/update-setting.dto';
import { PostgresTestContainer } from '@test/helpers/pg-test-container';

const TEST_JWT_SECRET = process.env.JWT_SECRET || 'test-jwt-secret';

describe('SettingsController (integration)', () => {
  const pg = new PostgresTestContainer();
  let app: TestingModule;
  let controller: SettingsController;
  let dataSource: DataSource;

  beforeAll(async () => {
    await pg.start();

    app = await Test.createTestingModule({
      imports: [
        TypeOrmModule.forRoot(
          pg.getTypeOrmOptions({
            entities: [SettingSchema],
          }),
        ),
        JwtModule.register({
          global: true,
          secret: TEST_JWT_SECRET,
          signOptions: { expiresIn: 86400 },
        }),
        SettingsModule,
      ],
    }).compile();

    controller = app.get(SettingsController);
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

  describe('get_settings', () => {
    it('returns settings (creates default when none exist)', async () => {
      const result = await controller.get_settings();
      expect(result).toBeDefined();
      expect(result.version).toBe('1.0.0');
      expect(result.max_free_alarms).toBe(1);
      expect(result.max_free_clocks).toBe(3);
    });
  });

  describe('update_settings', () => {
    it('updates and returns settings', async () => {
      await controller.get_settings();
      const body: UpdateSettingDto = { max_free_alarms: 7, max_free_clocks: 9 };
      const result = await controller.update_settings(body);
      expect(result.max_free_alarms).toBe(7);
      expect(result.max_free_clocks).toBe(9);
    });
  });
});
