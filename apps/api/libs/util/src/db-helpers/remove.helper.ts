import { NotFoundException } from '@nestjs/common';
import { EntityManager, FindOneOptions, ObjectLiteral, Repository } from 'typeorm';

export async function remove_helper<T extends ObjectLiteral & { id: string }>(
  db: Repository<T>,
  id: string,
  manager?: EntityManager,
  options?: FindOneOptions<T>,
) {
  const opt = options ?? {};
  const repo = manager?.getRepository<T>(db.target) ?? db;
  const response = await repo.findOne({
    where: { id },
    ...opt,
  } as FindOneOptions<T>);
  if (!response) throw new NotFoundException(`Unable to find entity with id - ${id}`);
  await repo.softDelete(id);
  return response;
}
