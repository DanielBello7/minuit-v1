import { DataSource } from 'typeorm';
import { Seeder } from 'typeorm-extension';
import { TransactionSchema } from '@/transactions/schemas/transaction.schema';
import { transactionsSeed } from './seeds';

class TransactionsSeeder implements Seeder {
  async run(dataSource: DataSource): Promise<void> {
    const repo = dataSource.getRepository(TransactionSchema);
    let inserted = 0;
    let skipped = 0;
    for (const row of transactionsSeed) {
      const exists = await repo.findOneBy({ id: row.id });
      if (exists) {
        skipped++;
        continue;
      }
      await repo.save(repo.create(row as any));
      inserted++;
    }
    console.log(
      `Transactions: ${inserted} inserted, ${skipped} skipped (total ${transactionsSeed.length}).`,
    );
  }
}

export { TransactionsSeeder };
