import { NotFoundException } from '@nestjs/common';
import {
  EntityManager,
  FindOneOptions,
  FindOptionsWhere,
  ObjectLiteral,
  Repository,
} from 'typeorm';

export async function find_by_id_helper<T extends ObjectLiteral & { id: string }>(
  db: Repository<T>,
  id: string,
  options: FindOneOptions<T> = {},
  manager?: EntityManager,
) {
  const em = manager ? manager.getRepository(db.target) : db;
  const response = await em.findOne({
    where: { id } as FindOptionsWhere<T>,
    ...options,
  });
  if (response) return response;
  throw new NotFoundException(`Cannot find entity with id - ${id}`);
}
