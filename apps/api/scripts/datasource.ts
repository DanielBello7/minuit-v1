import * as dotenv from 'dotenv';
import * as path from 'path';
import * as fs from 'fs';
import { DataSource } from 'typeorm';

dotenv.config({
  path: path.join(__dirname, '../.env'),
});

const sslMode = (process.env.SQL_SSL_MODE as string) === 'true' ? true : false;
const sslType = (process.env.SQL_SSL_TYPE as 'heavy' | 'light') ?? 'light';
const caCert = process.env.SQL_DATABASE_CA_CERT as string;

export default new DataSource({
  type: 'postgres',
  host: process.env.SQL_DATABASE_HOST,
  port: Number(process.env.SQL_DATABASE_PORT) || 5432,
  username: process.env.SQL_DATABASE_USERNAME,
  password: process.env.SQL_DATABASE_PASSWORD,
  database: process.env.SQL_DATABASE_NAME,
  entities: ['src/**/*.schema.ts'],
  migrations: ['scripts/migrations/*.ts'],
  ssl: sslMode,
  extra: sslMode
    ? {
        ssl: {
          rejectUnauthorized: false,
          ...(sslType === 'heavy' ? { ca: fs.readFileSync(caCert) } : {}),
        },
      }
    : undefined,
  synchronize: false,
  logging: false,
});
