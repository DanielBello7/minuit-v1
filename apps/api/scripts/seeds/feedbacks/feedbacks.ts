import { DataSource } from 'typeorm';
import { Seeder } from 'typeorm-extension';
import { FeedbackSchema } from '@/feedbacks/schemas/feedback.schema';
import { feedbacksSeed } from './seeds';

class FeedbacksSeeder implements Seeder {
  async run(dataSource: DataSource): Promise<void> {
    const repo = dataSource.getRepository(FeedbackSchema);
    let inserted = 0;
    let skipped = 0;
    for (const row of feedbacksSeed) {
      await repo.save(repo.create(row));
      inserted++;
    }
    console.log(
      `Feedbacks: ${inserted} inserted, ${skipped} skipped (total ${feedbacksSeed.length}).`,
    );
  }
}

export { FeedbacksSeeder };
