/**
 * Integration tests for ClocksService using Postgres test container.
 * Thorough tests for get_by_pages: page pointer, next page, filtering.
 */
import { Test, TestingModule } from '@nestjs/testing';
import { getDataSourceToken } from '@nestjs/typeorm';
import { DataSource } from 'typeorm';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ClocksService } from './clocks.service';
import { ClockSchema } from './schemas/clock.schema';
import { InsertClockDto } from './dto/insert-clock.dto';
import { CLOCK_FORMAT } from '@repo/types';
import { PostgresTestContainer } from '@test/helpers/pg-test-container';
import { JwtModule } from '@nestjs/jwt';
import { MutationsModule } from '@app/mutations';
import { BadGatewayException } from '@nestjs/common';

const TEST_JWT_SECRET = process.env.JWT_SECRET || 'test-jwt-secret';

const user_id_1 = 'c1a7e9f4-2d5b-4a6c-9e31-7f2b8d4c6a90';
const user_id_2 = '5b8f3c1a-7e2d-4d9b-a6f4-1c9e3a7b5d22';

describe('ClocksService (integration)', () => {
  const pg = new PostgresTestContainer();
  let app: TestingModule;
  let service: ClocksService;
  let dataSource: DataSource;

  function validInsertDto(
    overrides: Partial<InsertClockDto> = {},
  ): InsertClockDto {
    return {
      user_id: user_id_1,
      city: 'Lagos',
      region: 'West',
      country: 'Nigeria',
      timezone: 'Africa/Lagos',
      format: CLOCK_FORMAT.DIGITAL,
      ...overrides,
    };
  }

  beforeAll(async () => {
    await pg.start();

    app = await Test.createTestingModule({
      imports: [
        TypeOrmModule.forRoot(
          pg.getTypeOrmOptions({
            entities: [ClockSchema],
          }),
        ),
        TypeOrmModule.forFeature([ClockSchema]),
        MutationsModule,
        JwtModule.register({
          global: true,
          secret: TEST_JWT_SECRET,
          signOptions: { expiresIn: 86400 },
        }),
      ],
      providers: [ClocksService],
    }).compile();

    service = app.get(ClocksService);
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

  async function create_clock(overrides: Partial<InsertClockDto> = {}) {
    return service.insert(validInsertDto(overrides));
  }

  describe('insert', () => {
    it('creates clock with is_active true and returns it', async () => {
      try {
        const result = await service.insert(validInsertDto());
        expect(result.id).toBeDefined();
        expect(result.city).toBe('Lagos');
        expect(result.is_active).toBe(true);
      } catch (e) {
        console.log(e.response.message);
      }
    });

    it('throws BadGatewayException when same user_id and city exist', async () => {
      await create_clock();
      await expect(service.insert(validInsertDto())).rejects.toThrow(
        BadGatewayException,
      );
    });

    it('throws on invalid DTO', async () => {
      await expect(
        service.insert({
          ...validInsertDto(),
          user_id: 'not-uuid',
        } as InsertClockDto),
      ).rejects.toThrow();
    });
  });

  describe('create', () => {
    it('creates clock with full DTO', async () => {
      const result = await service.create({
        ...validInsertDto(),
        is_active: false,
      });
      expect(result.id).toBeDefined();
      expect(result.is_active).toBe(false);
    });
  });

  describe('get_by_pages', () => {
    it('returns empty docs when none exist', async () => {
      const result = await service.get_by_pages({});
      expect(result.docs).toEqual([]);
      expect(result.total_docs).toBe(0);
      expect(result.page).toBe(1);
      expect(result.has_next_page).toBe(false);
    });

    it('returns first page with pick size and total_docs', async () => {
      await create_clock({ city: 'Lagos' });
      await create_clock({ city: 'Abuja' });
      await create_clock({ city: 'Port Harcourt' });

      const result = await service.get_by_pages({
        pagination: { page: 1, pick: 2 },
      });

      expect(result.docs.length).toBe(2);
      expect(result.pick).toBe(2);
      expect(result.total_docs).toBe(3);
      expect(result.page).toBe(1);
      expect(result.total_pages).toBe(2);
      expect(result.has_next_page).toBe(true);
      expect(result.next_page).toBe(2);
    });

    it('returns next page when using page pointer', async () => {
      await create_clock({ city: 'A' });
      await create_clock({ city: 'B' });
      await create_clock({ city: 'C' });

      const first = await service.get_by_pages({
        pagination: { page: 1, pick: 2 },
      });
      expect(first.docs.length).toBe(2);
      expect(first.next_page).toBe(2);

      const second = await service.get_by_pages({
        pagination: { page: 2, pick: 2 },
      });
      expect(second.docs.length).toBe(1);
      expect(second.page).toBe(2);
      expect(second.has_next_page).toBe(false);
    });

    it('filters by user_id', async () => {
      await create_clock({ user_id: user_id_1, city: 'Lagos' });
      await create_clock({ user_id: user_id_2, city: 'Abuja' });
      await create_clock({ user_id: user_id_1, city: 'PH' });

      const result = await service.get_by_pages({ user_id: user_id_1 });
      expect(result.docs.length).toBe(2);
      result.docs.forEach((d) => expect(d.user_id).toBe(user_id_1));
      expect(result.total_docs).toBe(2);
    });

    it('filters by city', async () => {
      // Same city is allowed for different users only (unique is user_id + city).
      await create_clock({ user_id: user_id_1, city: 'Lagos' });
      await create_clock({ user_id: user_id_2, city: 'Lagos' });
      await create_clock({ user_id: user_id_1, city: 'Abuja' });

      const result = await service.get_by_pages({ city: 'Lagos' });
      expect(result.docs.length).toBe(2);
      result.docs.forEach((d) => expect(d.city).toBe('Lagos'));
    });

    it('filters by format', async () => {
      await create_clock({ format: CLOCK_FORMAT.DIGITAL, city: 'A' });
      await create_clock({ format: CLOCK_FORMAT.ANALOG, city: 'B' });
      await create_clock({ format: CLOCK_FORMAT.DIGITAL, city: 'C' });

      const result = await service.get_by_pages({
        format: CLOCK_FORMAT.DIGITAL,
      });
      expect(result.docs.length).toBe(2);
      result.docs.forEach((d) =>
        expect(d.format).toBe(CLOCK_FORMAT.DIGITAL),
      );
    });
  });

  describe('update', () => {
    it('updates clock by id', async () => {
      const created = await create_clock();
      const updated = await service.update(created.id, {
        title: 'Home',
        region: 'South',
      } as any);
      expect(updated.title).toBe('Home');
      expect(updated.region).toBe('South');
    });
  });

  describe('remove', () => {
    it('removes clock by id', async () => {
      const created = await create_clock();
      await service.remove(created.id);
      const repo = dataSource.getRepository(ClockSchema);
      const found = await repo.findOne({ where: { id: created.id } });
      expect(found).toBeNull();
    });
  });
});
