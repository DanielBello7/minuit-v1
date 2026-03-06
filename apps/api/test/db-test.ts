import { PostgresTestContainer } from './helpers/pg-test-container';

async function main() {
  const pg = new PostgresTestContainer();
  await pg.start();

  const client = await pg.getClient();
  const result = await client.query('SELECT 1 as ok');

  console.log(result.rows);

  await client.end();
  await pg.stop();
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
