import { NotFoundException } from '@nestjs/common';
import { EntityManager, FindOneOptions, ObjectLiteral, Repository } from 'typeorm';

export async function update_by_id_helper<T extends ObjectLiteral & { id: string }>(
  db: Repository<T>,
  id: string,
  updates: Partial<T> = {},
  session?: EntityManager,
  options?: FindOneOptions<T>,
) {
  const repo = session?.getRepository<T>(db.target) ?? db;
  await repo.update(id, updates);
  const response = await repo.findOne({
    where: { id: id },
    ...options,
  } as FindOneOptions<T>);
  if (!response) {
    throw new NotFoundException(`Cannot find entity with id - ${id}`);
  }
  return response;
}
