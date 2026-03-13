import { BadRequestException } from '@nestjs/common';
import { IPagePaginated } from '@repo/types';
import { isArray, isObject } from 'class-validator';
import {
  EntityManager,
  FindManyOptions,
  ObjectLiteral,
  Repository,
  SelectQueryBuilder,
} from 'typeorm';

const MIN_PAGE_SIZE = 1;
const MAX_PICK_SIZE = 20;

export type PaginateQueryParams = Record<string, any> & {
  page?: number;
  pick?: number;
  sort?: 'ASC' | 'DESC';
};

type Pagination = {
  pagination: Partial<PaginateQueryParams>;
};

export const safeNumber = (v: any, fallback: number) => {
  return Number.isFinite(Number(v)) ? Number(v) : fallback;
};

export async function paginate_by_page_helper<
  T extends ObjectLiteral & { created_at: Date },
>(
  query: Partial<T & Pagination>,
  db_entity: Repository<T>,
  options: Pick<FindManyOptions<T>, 'relations'> = {},
  session?: EntityManager,
  extend?: (qb: SelectQueryBuilder<T>) => SelectQueryBuilder<T>,
): Promise<IPagePaginated<T>> {
  const db = session ? session.getRepository(db_entity.target) : db_entity;
  const { pagination, ...rest } = query;

  let page = 1;
  let pick = 9;
  let sort_by: PaginateQueryParams['sort'] = 'DESC';

  if (pagination) {
    if (pagination.page !== undefined) {
      page = Math.max(
        MIN_PAGE_SIZE,
        safeNumber(pagination.page, MIN_PAGE_SIZE),
      );
    }

    if (pagination.pick !== undefined) {
      pick = Math.min(
        MAX_PICK_SIZE,
        safeNumber(pagination.pick, MAX_PICK_SIZE),
      );
    }

    if (pagination.sort_by === 'ASC' || pagination.sort_by === 'DESC') {
      sort_by = pagination.sort_by;
    }
  }

  let skip = (page - 1) * pick;
  if (skip > 100_000) throw new BadRequestException('request too deep');

  const qb = db.createQueryBuilder('entity');

  Object.entries(rest).forEach(([key, value]) => {
    if (value !== undefined) {
      qb.andWhere(`entity.${key} = :${key}`, { [key]: value });
    }
  });

  extend?.(qb);

  qb.orderBy('entity.created_at', sort_by).skip(skip).take(pick);

  if (options && isArray(options.relations)) {
    options.relations?.forEach((rel) =>
      qb.leftJoinAndSelect(`entity.${rel}`, rel),
    );
  }
  if (options && isObject(options.relations)) {
    throw new BadRequestException(
      'currently not supporting objects for relations',
    );
  }
  const [docs, count] = await qb.getManyAndCount();
  const total_pages = Math.ceil(count / pick);

  return {
    docs,
    has_next_page: total_pages > page,
    has_prev_page: page > 1,
    pick: pick,
    next_page: total_pages > page ? page + 1 : null,
    page: page,
    paging_counter: skip + 1,
    prev_page: page > 1 ? page - 1 : null,
    total_docs: count,
    total_pages: total_pages,
  };
}
