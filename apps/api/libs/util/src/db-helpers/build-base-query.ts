import { ObjectLiteral, Repository, SelectQueryBuilder } from 'typeorm';

export function build_base_query<T extends ObjectLiteral>(
  repo: Repository<T>,
  filters: Record<string, any>,
  extend?: (qb: SelectQueryBuilder<T>) => SelectQueryBuilder<T>,
) {
  const qb = repo.createQueryBuilder('entity');

  Object.entries(filters).forEach(([key, value], index) => {
    if (value === undefined) return;

    const paramKey = `filter_${key}_${index}`;
    const column = `entity.${key}`;

    if (value === null) {
      qb.andWhere(`${column} IS NULL`);
      return;
    }

    if (Array.isArray(value)) {
      if (value.length === 0) return;
      qb.andWhere(`${column} IN (:...${paramKey})`, {
        [paramKey]: value,
      });
      return;
    }

    if (value instanceof Date) {
      qb.andWhere(`${column} = :${paramKey}`, {
        [paramKey]: value,
      });
      return;
    }

    if (
      typeof value === 'object' &&
      value !== null &&
      !Array.isArray(value)
    ) {
      if ('from' in value && 'to' in value) {
        qb.andWhere(
          `${column} BETWEEN :${paramKey}_from AND :${paramKey}_to`,
          {
            [`${paramKey}_from`]: value.from,
            [`${paramKey}_to`]: value.to,
          },
        );
        return;
      }

      if ('from' in value) {
        qb.andWhere(`${column} >= :${paramKey}`, {
          [paramKey]: value.from,
        });
        return;
      }

      if ('to' in value) {
        qb.andWhere(`${column} <= :${paramKey}`, {
          [paramKey]: value.to,
        });
        return;
      }
    }

    qb.andWhere(`${column} = :${paramKey}`, { [paramKey]: value });
  });

  extend?.(qb);
  return qb;
}
