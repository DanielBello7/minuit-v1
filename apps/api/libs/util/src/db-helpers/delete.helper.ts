import { NotFoundException } from '@nestjs/common';
import { EntityManager, FindOneOptions, ObjectLiteral, Repository } from 'typeorm';

export async function delete_helper<T extends ObjectLiteral & { id: string }>(
  db: Repository<T>,
  id: string,
  manager?: EntityManager,
  options?: FindOneOptions<T>,
) {
  const repo = manager?.getRepository<T>(db.target) ?? db;
  const opt = options ?? {};
  const response = await repo.findOne({
    ...opt,
    where: { id },
  } as FindOneOptions<T>);
  if (!response) throw new NotFoundException(`Cannot find entity with id - ${id}`);
  await repo.delete(id);
  return response;
}
