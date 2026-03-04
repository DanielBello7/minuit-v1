import { FindManyOptions, ObjectLiteral, Repository, SelectQueryBuilder } from 'typeorm';
import { build_base_query } from './paginate-by-date.helper';
import { safeNumber } from './paginate-by-page.helper';
import { IIndexPaginated } from '@repo/types';
import { SORT_TYPE } from '@repo/types';
import { isArray, isObject } from 'class-validator';
import { BadRequestException } from '@nestjs/common';

const MAX_PAGE_SIZE = 20;
const MIN_PAGE_SIZE = 1;

export type IndexCursorQueryParams = Record<string, any> & {
  pick?: number;
  index?: number;
  sort?: SORT_TYPE;
};

type PaingationOption = {
  pagination?: IndexCursorQueryParams;
};

/**
 * Cursor pagination by procedural index
 */
export async function paginate_by_index<T extends ObjectLiteral & { index: number }>(
  query: Partial<PaingationOption & T>,
  repo: Repository<T>,
  extend?: (qb: SelectQueryBuilder<T>) => SelectQueryBuilder<T>,
  options?: Pick<FindManyOptions<T>, 'relations'>,
): Promise<IIndexPaginated<T>> {
  const { pagination, ...filters } = query;
  const limit = Math.min(MAX_PAGE_SIZE, Math.max(MIN_PAGE_SIZE, safeNumber(pagination?.pick, 10)));
  const order: 'ASC' | 'DESC' = pagination?.sort === 'ASC' ? 'ASC' : 'DESC';

  const qb = build_base_query(repo, filters, extend);

  if (pagination?.index !== undefined) {
    if (order === 'ASC') qb.andWhere('entity.index > :after', { after: pagination?.index });
    else qb.andWhere('entity.index < :after', { after: pagination?.index });
  }

  qb.orderBy('entity.index', order).take(limit);

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
  const next_cuursor = docs.length > 0 ? docs[docs.length - 1].index : null;

  return {
    docs,
    has_next_page: docs.length === limit,
    has_prev_page: pagination?.index !== undefined,
    pick: limit,
    next_page: next_cuursor,
  };
}
