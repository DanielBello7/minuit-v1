/**
 * Integration tests for PackagesController using Postgres test container.
 * Real PackagesService and controller; controller methods called directly (guards not executed).
 */
import { Test, TestingModule } from '@nestjs/testing';
import { getDataSourceToken } from '@nestjs/typeorm';
import { DataSource } from 'typeorm';
import { TypeOrmModule } from '@nestjs/typeorm';
import { PackagesController } from './packages.controller';
import { PackageSchema } from './schemas/package.schema';
import { PackagesModule } from './packages.module';
import { CreatePackagesDto } from './dto/create-package.dto';
import { UpdatePackagesDto } from './dto/update-package.dto';
import { DURATION_PERIOD_ENUM, PRICING_TYPE_ENUM } from '@repo/types';
import { USD } from '@repo/types';
import { PostgresTestContainer } from '@test/helpers/pg-test-container';
import { JwtModule } from '@nestjs/jwt';

const TEST_JWT_SECRET = process.env.JWT_SECRET || 'test-jwt-secret';

describe('PackagesController (integration)', () => {
  const pg = new PostgresTestContainer();
  const admin_id = '6e9a4c21-1f7b-4a3e-bd58-2a6f9c7d3b40';

  let app: TestingModule;
  let controller: PackagesController;
  let dataSource: DataSource;

  beforeAll(async () => {
    await pg.start();

    app = await Test.createTestingModule({
      imports: [
        TypeOrmModule.forRoot(
          pg.getTypeOrmOptions({
            entities: [PackageSchema],
          }),
        ),
        JwtModule.register({
          global: true,
          secret: TEST_JWT_SECRET,
          signOptions: { expiresIn: 86400 },
        }),
        PackagesModule,
      ],
    }).compile();

    controller = app.get(PackagesController);
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

  function validCreateDto(): CreatePackagesDto {
    return {
      pricings: [{ currency_code: USD, amount: '10.00' }],
      title: 'Pro',
      description: 'Pro plan',
      features: ['Feature A', 'Feature B'],
      duration: 30,
      type: PRICING_TYPE_ENUM.PAID,
      duration_period: DURATION_PERIOD_ENUM.DAYS,
      admin_id: admin_id,
    };
  }

  describe('add_package', () => {
    it('creates package and returns it', async () => {
      const body = validCreateDto();

      const result = await controller.add_package(body);

      expect(result).toBeDefined();
      expect(result.id).toBeDefined();
      expect(result.title).toBe(body.title);
      expect(result.description).toBe(body.description);
      expect(result.duration).toBe(body.duration);
      expect(result.duration_period).toBe(body.duration_period);
    });

    it('propagates validation errors for invalid body', async () => {
      await expect(
        controller.add_package({
          ...validCreateDto(),
          title: '',
        } as CreatePackagesDto),
      ).rejects.toThrow();
    });
  });

  describe('get_by_page', () => {
    it('returns paginated list (empty when none)', async () => {
      const result = await controller.get_by_page({} as any);

      expect(result).toBeDefined();
      expect(result.docs).toEqual([]);
      expect(result.total_docs).toBe(0);
      expect(result).toHaveProperty('has_next_page');
      expect(result).toHaveProperty('total_pages');
    });

    it('returns packages after creating', async () => {
      await controller.add_package(validCreateDto());
      await controller.add_package({
        ...validCreateDto(),
        title: 'Basic',
        description: 'Basic plan',
      } as CreatePackagesDto);

      const result = await controller.get_by_page({} as any);

      expect(result.docs.length).toBe(2);
      expect(result.total_docs).toBe(2);
    });
  });

  describe('update', () => {
    it('updates package by id and returns it', async () => {
      const created = await controller.add_package(validCreateDto());
      const body: UpdatePackagesDto = {
        title: 'Updated Title',
        description: 'Updated description',
      } as UpdatePackagesDto;

      const result = await controller.update(created.id, body);

      expect(result.title).toBe('Updated Title');
      expect(result.description).toBe('Updated description');
    });

    it('propagates errors for invalid id', async () => {
      await expect(
        controller.update('6e9a4c21-1f7b-4a3e-bd58-2a6f9c7d3b40', {
          title: 'X',
        } as UpdatePackagesDto),
      ).rejects.toThrow();
    });
  });

  describe('remove', () => {
    it('removes package by id', async () => {
      const created = await controller.add_package(validCreateDto());

      await controller.remove(created.id);

      const list = await controller.get_by_page({} as any);
      expect(list.docs.find((d) => d.id === created.id)).toBeUndefined();
    });

    it('propagates errors for invalid id', async () => {
      await expect(
        controller.remove('6e9a4c21-1f7b-4a3e-bd58-2a6f9c7d3b40'),
      ).rejects.toThrow();
    });
  });
});
