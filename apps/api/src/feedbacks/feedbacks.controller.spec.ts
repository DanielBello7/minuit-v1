/**
 * Integration tests for FeedbacksController using Postgres test container.
 * Real FeedbacksService and controller; controller methods called directly (guards not executed).
 */
import { Test, TestingModule } from '@nestjs/testing';
import { getDataSourceToken } from '@nestjs/typeorm';
import { DataSource } from 'typeorm';
import { TypeOrmModule } from '@nestjs/typeorm';
import { FeedbacksController } from './feedbacks.controller';
import { FeedbackSchema } from './schemas/feedback.schema';
import { UserSchema } from '@/accounts/users/schemas/user.schema';
import { FeedbacksModule } from './feedbacks.module';
import { CreateFeedbackDto } from './dto/create-feedback.dto';
import { PostgresTestContainer } from '@test/helpers/pg-test-container';
import { JwtModule } from '@nestjs/jwt';

const TEST_JWT_SECRET = process.env.JWT_SECRET || 'test-jwt-secret';

describe('FeedbacksController (integration)', () => {
  const pg = new PostgresTestContainer();
  let app: TestingModule;
  let controller: FeedbacksController;
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
        JwtModule.register({
          global: true,
          secret: TEST_JWT_SECRET,
          signOptions: { expiresIn: 86400 },
        }),
        FeedbacksModule,
      ],
    }).compile();

    controller = app.get(FeedbacksController);
    dataSource = app.get(getDataSourceToken());
  }, 60_000);

  afterAll(async () => {
    await dataSource?.destroy();
    await app?.close();
    await pg.stop();
  });

  beforeEach(async () => {
    const feedbackRepo = dataSource.getRepository(FeedbackSchema);
    await feedbackRepo.deleteAll();
  });

  describe('give_feedback', () => {
    it('creates feedback and returns it', async () => {
      const body: CreateFeedbackDto = {
        name: 'Test User',
        message: 'Great app',
        rating: 5,
      };

      const result = await controller.give_feedback(body);

      expect(result).toBeDefined();
      expect(result.id).toBeDefined();
      expect(result.name).toBe(body.name);
      expect(result.message).toBe(body.message);
      expect(result.rating).toBe(body.rating);
    });

    it('propagates validation errors for invalid body', async () => {
      await expect(
        controller.give_feedback({
          name: '',
          message: 'x',
          rating: 5,
        } as CreateFeedbackDto),
      ).rejects.toThrow();
    });
  });

  describe('get_by_dates', () => {
    it('returns paginated list (empty when none)', async () => {
      const result = await controller.get_by_dates({} as any);

      expect(result).toBeDefined();
      expect(result.docs).toEqual([]);
      expect(result.pick).toBeDefined();
      expect(result).toHaveProperty('has_next_page');
      expect(result).toHaveProperty('next_page');
    });

    it('returns feedbacks ordered by created_at', async () => {
      await controller.give_feedback({
        name: 'A',
        message: 'First',
        rating: 1,
      });
      await controller.give_feedback({
        name: 'B',
        message: 'Second',
        rating: 2,
      });

      const result = await controller.get_by_dates({} as any);

      expect(result.docs.length).toBe(2);
      expect(result.docs.map((d) => d.name)).toContain('A');
      expect(result.docs.map((d) => d.name)).toContain('B');
    });
  });

  describe('get_by_index', () => {
    it('returns paginated list (empty when none)', async () => {
      const result = await controller.get_by_index({} as any);

      expect(result).toBeDefined();
      expect(result.docs).toEqual([]);
      expect(result.pick).toBeDefined();
      expect(result).toHaveProperty('has_next_page');
    });

    it('returns feedbacks ordered by index', async () => {
      await controller.give_feedback({
        name: 'X',
        message: 'One',
        rating: 1,
      });
      await controller.give_feedback({
        name: 'Y',
        message: 'Two',
        rating: 2,
      });

      const result = await controller.get_by_index({} as any);

      expect(result.docs.length).toBe(2);
    });
  });
});
