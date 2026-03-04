import { NotFoundException } from '@nestjs/common';
import { EntityManager, FindOptionsWhere, ObjectLiteral, Repository } from 'typeorm';

export const find_by_id_lock_helper = async <T extends ObjectLiteral & { id: string }>(
  db: Repository<T>,
  id: string,
  manager: EntityManager,
) => {
  const em = manager.getRepository(db.target);
  const response = await em.findOne({
    where: {
      id,
    } as FindOptionsWhere<T>,
    lock: {
      mode: 'pessimistic_write',
    },
  });
  if (response) return response;
  throw new NotFoundException(`Cannot find entity with id - ${id}`);
};
