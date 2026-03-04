import { SORT_TYPE } from '@repo/types';
import { safeNumber } from './paginate-by-page.helper';
import { IDatePaginated } from '@repo/types';
import { FindManyOptions, ObjectLiteral, Repository, SelectQueryBuilder } from 'typeorm';
import { BadRequestException } from '@nestjs/common';
import { isArray, isObject } from 'class-validator';

const MAX_PAGE_SIZE = 20;
const MIN_PAGE_SIZE = 1;

export type DateCursorQueryParams = Record<string, any> & {
  pick?: number;
  date?: Date;
  sort?: SORT_TYPE;
};

type PaingationOption = {
  pagination?: DateCursorQueryParams;
};

export function build_base_query<T extends ObjectLiteral>(
  repo: Repository<T>,
  filters: Record<string, any>,
  extend?: (qb: SelectQueryBuilder<T>) => SelectQueryBuilder<T>,
) {
  const qb = repo.createQueryBuilder('entity');
  Object.entries(filters).forEach(([key, value]) => {
    if (value !== undefined) qb.andWhere(`entity.${key} = :${key}`, { [key]: value });
  });
  extend?.(qb);
  return qb;
}

export async function paginate_by_date_helper<T extends ObjectLiteral & { created_at: Date }>(
  query: Partial<PaingationOption & T>,
  repo: Repository<T>,
  extend?: (qb: SelectQueryBuilder<T>) => SelectQueryBuilder<T>,
  options?: Pick<FindManyOptions<T>, 'relations'>,
): Promise<IDatePaginated<T>> {
  const { pagination, ...filters } = query;

  const limit = Math.min(MAX_PAGE_SIZE, Math.max(MIN_PAGE_SIZE, safeNumber(pagination?.pick, 10)));
  const order: 'ASC' | 'DESC' = pagination?.sort === 'ASC' ? 'ASC' : 'DESC';

  const qb = build_base_query(repo, filters, extend);

  if (pagination?.date) {
    if (order === 'ASC') {
      qb.andWhere('entity.created_at > :after', {
        after: pagination.date,
      });
    } else
      qb.andWhere('entity.created_at < :after', {
        after: pagination.date,
      });
  }

  qb.orderBy('entity.created_at', order).take(limit);

  if (options && isArray(options.relations)) {
    const joined = new Set<string>();

    for (const rel of options.relations) {
      const parts = rel.split('.');

      let current_name = 'entity';
      let current_path = 'entity';

      for (let i = 0; i < parts.length; i++) {
        const part = parts[i];

        const join_path = `${current_path}.${part}`;
        const join_name = i === 0 ? part : `${parts.slice(0, i + 1).join('_')}`;

        const join_key = `${join_path}__${join_name}`;
        if (!joined.has(join_key)) {
          qb.leftJoinAndSelect(join_path, join_name);
          joined.add(join_key);
        }

        current_name = join_name;
        current_path = join_name;
      }
    }
  }

  if (options && isObject(options.relations)) {
    throw new BadRequestException('currently not supporting objects for relations');
  }

  const docs = await qb.getMany();
  const next_cursor = docs.length > 0 ? docs[docs.length - 1].created_at : null;

  return {
    docs,
    has_next_page: docs.length === limit,
    has_prev_page: !!pagination?.date,
    pick: limit,
    next_page: next_cursor,
    prev_page: null,
  };
}
