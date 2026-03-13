/**
 * Integration tests for FeedbacksService using Postgres test container.
 * Thorough tests for get_by_dates and get_by_index: cursor/pointer, next page, filtering.
 */
import { Test, TestingModule } from '@nestjs/testing';
import { getDataSourceToken } from '@nestjs/typeorm';
import { DataSource } from 'typeorm';
import { TypeOrmModule } from '@nestjs/typeorm';
import { FeedbacksService } from './feedbacks.service';
import { FeedbackSchema } from './schemas/feedback.schema';
import { UserSchema } from '@/accounts/users/schemas/user.schema';
import { CreateFeedbackDto } from './dto/create-feedback.dto';
import { SORT_TYPE_ENUM } from '@repo/types';
import { PostgresTestContainer } from '@test/helpers/pg-test-container';
import { JwtModule } from '@nestjs/jwt';
import { QueryFeedbackByDatesDto } from './dto/query-feedback-by-dates.dto';

const TEST_JWT_SECRET = 'secret';

describe('FeedbacksService (integration)', () => {
  const pg = new PostgresTestContainer();
  let app: TestingModule;
  let service: FeedbacksService;
  let dataSource: DataSource;

  beforeAll(async () => {
    await pg.start();

    app = await Test.createTestingModule({
      imports: [
        TypeOrmModule.forRoot(
          pg.getTypeOrmOptions({
            entities: [FeedbackSchema, UserSchema],
          }),
        ),
        TypeOrmModule.forFeature([FeedbackSchema]),
        JwtModule.register({
          global: true,
          secret: TEST_JWT_SECRET,
          signOptions: { expiresIn: 86400 }, // 24h in seconds
        }),
      ],
      providers: [FeedbacksService],
    }).compile();

    service = app.get(FeedbacksService);
    dataSource = app.get(getDataSourceToken());
  }, 60_000);

  afterAll(async () => {
    await dataSource?.destroy();
    await app?.close();
    await pg.stop();
  });

  beforeEach(async () => {
    const repo = dataSource.getRepository(FeedbackSchema);
    await repo.deleteAll();
  });

  async function createFeedback(overrides: Partial<CreateFeedbackDto> = {}) {
    return service.create({
      name: 'User',
      message: 'Message',
      rating: 5,
      ...overrides,
    });
  }

  describe('create', () => {
    it('creates and returns feedback', async () => {
      const result = await createFeedback({
        name: 'Alice',
        message: 'Great',
        rating: 4,
      });
      expect(result.id).toBeDefined();
      expect(result.name).toBe('Alice');
      expect(result.rating).toBe(4);
    });
  });

  describe('get_by_dates', () => {
    it('returns empty docs when none exist', async () => {
      const result = await service.get_by_dates({});
      expect(result.docs).toEqual([]);
      expect(result.has_next_page).toBe(false);
      expect(result.pick).toBeDefined();
    });

    it('returns first page with pick size and next cursor', async () => {
      await createFeedback({ name: 'A', message: '1', rating: 1 });
      await createFeedback({ name: 'B', message: '2', rating: 2 });
      await createFeedback({ name: 'C', message: '3', rating: 3 });

      const result = await service.get_by_dates({
        pagination: { pick: 2, sort: SORT_TYPE_ENUM.DESC },
      });

      expect(result.docs.length).toBe(2);
      expect(result.pick).toBe(2);
      expect(result.has_next_page).toBe(true);
      expect(result.next_page).toBeDefined();
      expect(result.next_page).toEqual(result.docs[result.docs.length - 1].created_at);
    });

    it('returns next section when using date cursor (pointer)', async () => {
      const a = await createFeedback({
        name: 'First',
        message: '1',
        rating: 1,
      });
      const b = await createFeedback({
        name: 'Second',
        message: '2',
        rating: 2,
      });
      const c = await createFeedback({
        name: 'Third',
        message: '3',
        rating: 3,
      });

      const first = await service.get_by_dates({
        pagination: { pick: 2, sort: SORT_TYPE_ENUM.DESC },
      });
      expect(first.docs.length).toBe(2);
      const cursor = first.next_page;
      expect(cursor).toBeDefined();

      const second = await service.get_by_dates({
        pagination: {
          pick: 2,
          sort: SORT_TYPE_ENUM.DESC,
          date: cursor as Date,
        },
      });
      expect(second.docs.length).toBe(1);
      expect(second.has_next_page).toBe(false);
      const names = second.docs.map((d) => d.name);
      expect(names).toContain('First');
    });

    it('respects sort ASC (oldest first)', async () => {
      await createFeedback({ name: 'Old', message: '1', rating: 1 });
      await createFeedback({ name: 'New', message: '2', rating: 2 });

      const result = await service.get_by_dates({
        pagination: { pick: 10, sort: SORT_TYPE_ENUM.ASC },
      });
      expect(result.docs.length).toBe(2);
      expect(result.docs[0].name).toBe('Old');
      expect(result.docs[1].name).toBe('New');
    });

    it('filters by name', async () => {
      await createFeedback({ name: 'Alice', message: 'a', rating: 1 });
      await createFeedback({ name: 'Bob', message: 'b', rating: 2 });
      await createFeedback({ name: 'Alice', message: 'c', rating: 3 });

      const result = await service.get_by_dates({ name: 'Alice' });
      expect(result.docs.length).toBe(2);
      result.docs.forEach((d) => expect(d.name).toBe('Alice'));
    });

    it('filters by rating', async () => {
      await createFeedback({ name: 'A', message: 'a', rating: 5 });
      await createFeedback({ name: 'B', message: 'b', rating: 3 });
      await createFeedback({ name: 'C', message: 'c', rating: 5 });

      const result = await service.get_by_dates({ rating: 5 } as QueryFeedbackByDatesDto);
      expect(result.docs.length).toBe(2);
      result.docs.forEach((d) => expect(d.rating).toBe(5));
    });
  });

  describe('get_by_index', () => {
    it('returns empty docs when none exist', async () => {
      const result = await service.get_by_index({});
      expect(result.docs).toEqual([]);
      expect(result.has_next_page).toBe(false);
    });

    it('returns first page with pick size and next index cursor', async () => {
      await createFeedback({ name: 'A', message: '1', rating: 1 });
      await createFeedback({ name: 'B', message: '2', rating: 2 });
      await createFeedback({ name: 'C', message: '3', rating: 3 });

      const result = await service.get_by_index({
        pagination: { pick: 2, sort: SORT_TYPE_ENUM.DESC },
      });

      expect(result.docs.length).toBe(2);
      expect(result.pick).toBe(2);
      expect(result.has_next_page).toBe(true);
      expect(result.next_page).toBeDefined();
      expect(typeof result.next_page).toBe('number');
      expect(result.next_page).toBe(result.docs[result.docs.length - 1].index);
    });

    it('returns next section when using index cursor (pointer)', async () => {
      await createFeedback({ name: 'First', message: '1', rating: 1 });
      await createFeedback({ name: 'Second', message: '2', rating: 2 });
      await createFeedback({ name: 'Third', message: '3', rating: 3 });

      const first = await service.get_by_index({
        pagination: { pick: 2, sort: SORT_TYPE_ENUM.DESC },
      });
      expect(first.docs.length).toBe(2);
      const cursor = first.next_page;
      expect(cursor).toBeDefined();

      const second = await service.get_by_index({
        pagination: {
          pick: 2,
          sort: SORT_TYPE_ENUM.DESC,
          index: cursor as number,
        },
      });
      expect(second.docs.length).toBe(1);
      expect(second.has_next_page).toBe(false);
      expect(second.docs[0].name).toBe('First');
    });

    it('respects sort ASC by index', async () => {
      const a = await createFeedback({ name: 'A', message: '1', rating: 1 });
      const b = await createFeedback({ name: 'B', message: '2', rating: 2 });

      const result = await service.get_by_index({
        pagination: { pick: 10, sort: SORT_TYPE_ENUM.ASC },
      });
      expect(result.docs.length).toBe(2);
      expect(result.docs[0].index).toBeLessThan(result.docs[1].index);
    });

    it('filters by message', async () => {
      await createFeedback({ name: 'X', message: 'hello', rating: 1 });
      await createFeedback({ name: 'Y', message: 'world', rating: 2 });
      await createFeedback({ name: 'Z', message: 'hello', rating: 3 });

      const result = await service.get_by_index({ message: 'hello' } as any);
      expect(result.docs.length).toBe(2);
      result.docs.forEach((d) => expect(d.message).toBe('hello'));
    });
  });
});
