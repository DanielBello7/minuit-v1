import { HttpException, Injectable } from '@nestjs/common';
import {
  DataSource,
  EntityManager,
  ObjectLiteral,
  Repository,
} from 'typeorm';

@Injectable()
export class MutationsService {
  constructor(private readonly dataSource: DataSource) {}

  async execute<T>(
    cb: (manager: EntityManager) => Promise<T>,
  ): Promise<T> {
    return await this.dataSource.transaction(async (manager) => {
      try {
        return await cb(manager);
      } catch (error) {
        if (error instanceof HttpException) {
          throw error;
        }
        throw error;
      }
    });
  }

  getRepo<T extends ObjectLiteral>(
    repo: Repository<T>,
    manger?: EntityManager,
  ) {
    return manger ? manger?.getRepository(repo.target) : repo;
  }
}
