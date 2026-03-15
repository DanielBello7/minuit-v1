/**
 * Integration tests for ClocksController using Postgres test container.
 * Real ClocksService and controller; controller methods called directly (guards not executed).
 */
import { Test, TestingModule } from '@nestjs/testing';
import { getDataSourceToken } from '@nestjs/typeorm';
import { DataSource } from 'typeorm';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ClocksController } from './clocks.controller';
import { ClockSchema } from './schemas/clock.schema';
import { ClocksModule } from './clocks.module';
import { InsertClockDto } from './dto/insert-clock.dto';
import { UpdateClockDto } from './dto/update-clock.dto';
import { CLOCK_FORMAT } from '@repo/types';
import { PostgresTestContainer } from '@test/helpers/pg-test-container';
import { JwtModule } from '@nestjs/jwt';

const TEST_JWT_SECRET = process.env.JWT_SECRET || 'test-jwt-secret';

const user_id = 'd4e7a9c2-1f5b-4b8d-9c3a-6e2f7a1c4b88';

function validInsertDto(
  overrides: Partial<InsertClockDto> = {},
): InsertClockDto {
  return {
    user_id: user_id,
    city: 'Lagos',
    region: 'West',
    country: 'Nigeria',
    timezone: 'Africa/Lagos',
    format: CLOCK_FORMAT.DIGITAL,
    ...overrides,
  };
}

describe('ClocksController (integration)', () => {
  const pg = new PostgresTestContainer();
  let app: TestingModule;
  let controller: ClocksController;
  let dataSource: DataSource;

  beforeAll(async () => {
    await pg.start();

    app = await Test.createTestingModule({
      imports: [
        TypeOrmModule.forRoot(
          pg.getTypeOrmOptions({
            entities: [ClockSchema],
          }),
        ),
        JwtModule.register({
          global: true,
          secret: TEST_JWT_SECRET,
          signOptions: { expiresIn: 86400 },
        }),
        ClocksModule,
      ],
    }).compile();

    controller = app.get(ClocksController);
    dataSource = app.get(getDataSourceToken());
  }, 60_000);

  afterAll(async () => {
    await dataSource?.destroy();
    await app?.close();
    await pg.stop();
  });

  beforeEach(async () => {
    const repo = dataSource.getRepository(ClockSchema);
    await repo.deleteAll();
  });

  describe('create', () => {
    it('creates clock and returns it', async () => {
      const body = validInsertDto();

      const result = await controller.create(body);

      expect(result).toBeDefined();
      expect(result.id).toBeDefined();
      expect(result.user_id).toBe(body.user_id);
      expect(result.city).toBe(body.city);
      expect(result.format).toBe(body.format);
      expect(result.is_active).toBe(true);
    });

    it('propagates validation errors for invalid body', async () => {
      await expect(
        controller.create({
          ...validInsertDto(),
          user_id: 'not-a-uuid',
        } as InsertClockDto),
      ).rejects.toThrow();
    });

    it('throws when clock already exists for same user_id and city', async () => {
      await controller.create(validInsertDto());
      await expect(controller.create(validInsertDto())).rejects.toThrow();
    });
  });

  describe('get_by_page', () => {
    it('returns paginated list (empty when none)', async () => {
      const result = await controller.get_by_page({} as any);

      expect(result).toBeDefined();
      expect(result.docs).toEqual([]);
      expect(result.total_docs).toBe(0);
      expect(result).toHaveProperty('has_next_page');
      expect(result).toHaveProperty('page');
    });

    it('returns clocks after creating', async () => {
      await controller.create(validInsertDto());
      await controller.create(validInsertDto({ city: 'Abuja' }));

      const result = await controller.get_by_page({} as any);

      expect(result.docs.length).toBe(2);
      expect(result.total_docs).toBe(2);
    });
  });

  describe('update', () => {
    it('updates clock by id and returns it', async () => {
      const created = await controller.create(validInsertDto());
      const body: UpdateClockDto = {
        city: 'Port Harcourt',
        region: 'South',
      };

      const result = await controller.update(created.id, body);

      expect(result.city).toBe('Port Harcourt');
      expect(result.region).toBe('South');
    });

    it('propagates errors for invalid id', async () => {
      await expect(
        controller.update('00000000-0000-0000-4000-000000000099', {
          city: 'X',
        } as UpdateClockDto),
      ).rejects.toThrow();
    });
  });

  describe('remove', () => {
    it('removes clock by id', async () => {
      const created = await controller.create(validInsertDto());

      await controller.remove(created.id);

      const list = await controller.get_by_page({} as any);
      expect(list.docs.find((d) => d.id === created.id)).toBeUndefined();
    });

    it('propagates errors for invalid id', async () => {
      await expect(
        controller.remove('00000000-0000-0000-4000-000000000099'),
      ).rejects.toThrow();
    });
  });
});
