import {
  EntityManager,
  FindManyOptions,
  FindOptionsWhere,
  ObjectLiteral,
  Repository,
} from 'typeorm';
import { filter_helper } from './filter.helper';

export async function find_helper<T extends ObjectLiteral & { id: string }>(
  db: Repository<T>,
  where: FindOptionsWhere<T> = {},
  options: FindManyOptions<T> = {},
  manager?: EntityManager,
) {
  const database = manager ? manager.getRepository(db.target) : db;
  const sanitized = filter_helper(where);
  return database.find({
    where: sanitized as FindOptionsWhere<T>,
    ...options,
  });
}
