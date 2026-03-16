/**
 * Integration tests for PackagesService using Postgres test container.
 * Thorough tests for get_by_page: page pointer, next page, filtering, and all flag.
 */
import { Test, TestingModule } from '@nestjs/testing';
import { getDataSourceToken } from '@nestjs/typeorm';
import { DataSource } from 'typeorm';
import { TypeOrmModule } from '@nestjs/typeorm';
import { PackagesService } from './packages.service';
import { PackageSchema } from './schemas/package.schema';
import { CreatePackagesDto } from './dto/create-package.dto';
import { DURATION_PERIOD_ENUM, PRICING_TYPE_ENUM } from '@repo/types';
import { USD } from '@repo/types';
import { PostgresTestContainer } from '@test/helpers/pg-test-container';
import { JwtModule } from '@nestjs/jwt';

const TEST_JWT_SECRET = process.env.JWT_SECRET || 'test-jwt-secret';

describe('PackagesService (integration)', () => {
  const pg = new PostgresTestContainer();
  const adminId = 'f3c1a8d4-2b6e-4b7e-9c14-7d8a3b0e5f12';

  let app: TestingModule;
  let service: PackagesService;
  let dataSource: DataSource;

  function valid_create_dto(
    overrides: Partial<CreatePackagesDto> = {},
  ): CreatePackagesDto {
    return {
      pricings: [{ currency_code: USD, amount: '10.00' }],
      title: 'Pro',
      description: 'Pro plan',
      features: ['F1', 'F2'],
      duration: 30,
      type: PRICING_TYPE_ENUM.PAID,
      duration_period: DURATION_PERIOD_ENUM.DAYS,
      admin_id: adminId,
      ...overrides,
    };
  }

  beforeAll(async () => {
    await pg.start();

    app = await Test.createTestingModule({
      imports: [
        TypeOrmModule.forRoot(
          pg.getTypeOrmOptions({
            entities: [PackageSchema],
          }),
        ),
        TypeOrmModule.forFeature([PackageSchema]),
        JwtModule.register({
          global: true,
          secret: TEST_JWT_SECRET,
          signOptions: { expiresIn: 86400 },
        }),
      ],
      providers: [PackagesService],
    }).compile();

    service = app.get(PackagesService);
    dataSource = app.get(getDataSourceToken());
  }, 60_000);

  afterAll(async () => {
    await dataSource?.destroy();
    await app?.close();
    await pg.stop();
  });

  beforeEach(async () => {
    const repo = dataSource.getRepository(PackageSchema);
    await repo.deleteAll();
  });

  describe('create', () => {
    it('creates and returns package', async () => {
      const result = await service.create(valid_create_dto());
      expect(result.id).toBeDefined();
      expect(result.title).toBe('Pro');
    });
  });

  describe('get_by_page', () => {
    it('returns empty docs when none exist', async () => {
      const result = await service.get_by_page({});
      expect(result.docs).toEqual([]);
      expect(result.total_docs).toBe(0);
      expect(result.page).toBe(1);
      expect(result.has_next_page).toBe(false);
    });

    it('returns first page with pick size and total_docs', async () => {
      await service.create(valid_create_dto());
      await service.create(
        valid_create_dto({ title: 'Basic', description: 'Basic' }),
      );
      await service.create(
        valid_create_dto({ title: 'Premium', description: 'Premium' }),
      );

      const result = await service.get_by_page({
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
      await service.create(valid_create_dto({ title: 'A' }));
      await service.create(valid_create_dto({ title: 'B' }));
      await service.create(valid_create_dto({ title: 'C' }));

      const first = await service.get_by_page({
        pagination: { page: 1, pick: 2 },
      });
      expect(first.docs.length).toBe(2);
      expect(first.next_page).toBe(2);

      const second = await service.get_by_page({
        pagination: { page: 2, pick: 2 },
      });
      expect(second.docs.length).toBe(1);
      expect(second.page).toBe(2);
      expect(second.has_next_page).toBe(false);
      expect(second.docs[0].title).toBe('A');
    });

    it('filters by title', async () => {
      await service.create(
        valid_create_dto({ title: 'Pro', description: 'Pro' }),
      );
      await service.create(
        valid_create_dto({ title: 'Basic', description: 'Basic' }),
      );
      await service.create(
        valid_create_dto({ title: 'Pro', description: 'Pro Plus' }),
      );

      const result = await service.get_by_page({ title: 'Pro' });
      expect(result.docs.length).toBe(2);
      result.docs.forEach((d) => expect(d.title).toBe('Pro'));
      expect(result.total_docs).toBe(2);
    });

    it('filters by admin_id', async () => {
      const otherAdminId = '6e9a4c21-1f7b-4a3e-bd58-2a6f9c7d3b40';
      await service.create(
        valid_create_dto({ title: 'P1', admin_id: adminId }),
      );
      await service.create(
        valid_create_dto({ title: 'P2', admin_id: otherAdminId }),
      );
      await service.create(
        valid_create_dto({ title: 'P3', admin_id: adminId }),
      );

      const result = await service.get_by_page({ admin_id: adminId });
      expect(result.docs.length).toBe(2);
      result.docs.forEach((d) => expect(d.admin_id).toBe(adminId));
    });

    it('all: true returns all docs without pagination', async () => {
      await service.create(valid_create_dto({ title: 'A' }));
      await service.create(valid_create_dto({ title: 'B' }));
      await service.create(valid_create_dto({ title: 'C' }));

      const result = await service.get_by_page({ all: true });

      expect(result.docs.length).toBe(3);
      expect(result.total_docs).toBe(3);
      expect(result.has_next_page).toBe(false);
      expect(result.next_page).toBeNull();
      expect(result.page).toBe(1);
      expect(result.total_pages).toBe(1);
    });
  });

  describe('update', () => {
    it('updates package by id', async () => {
      const created = await service.create(valid_create_dto());
      const updated = await service.update(created.id, {
        title: 'Updated',
        description: 'Updated desc',
      } as any);
      expect(updated.title).toBe('Updated');
    });
  });

  describe('remove', () => {
    it('removes package by id', async () => {
      const created = await service.create(valid_create_dto());
      await service.remove(created.id);
      await expect(service.find_by_id(created.id)).rejects.toThrow();
    });
  });
});
