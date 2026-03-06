import { ICommon } from '@repo/types';

const now = new Date();

export function commonBase(
  id: string,
  index: number,
): Pick<ICommon, 'id' | 'index' | 'created_at' | 'updated_at' | 'deleted_at'> {
  return {
    id,
    index,
    created_at: now,
    updated_at: now,
    deleted_at: undefined,
  };
}
