import { BadRequestException, Injectable } from '@nestjs/common';
import { CreatePackagesDto } from './dto/create-package.dto';
import { UpdatePackagesDto } from './dto/update-package.dto';
import { EntityManager, Repository } from 'typeorm';
import { PackageSchema } from './schemas/package.schema';
import { InjectRepository } from '@nestjs/typeorm';
import {
  create_helper,
  find_by_id_helper,
  isValidDto,
  paginate_by_page_helper,
  remove_helper,
  update_by_id_helper,
} from '@app/util';
import { QueryPackagesByPageDto } from './dto/query-packages-by-page.dto';
import { IPackage, IPagePaginated } from '@repo/types';

@Injectable()
export class PackagesService {
  constructor(
    @InjectRepository(PackageSchema)
    private readonly packages: Repository<PackageSchema>,
  ) {}

  create = async (body: CreatePackagesDto) => {
    const errors = isValidDto(body, CreatePackagesDto);
    if (errors.length > 0) throw new BadRequestException(errors);
    return create_helper<PackageSchema>(this.packages, body);
  };

  find_by_id = async (id: string, session?: EntityManager) => {
    return find_by_id_helper(this.packages, id, undefined, session);
  };

  get_by_page = async (query: Partial<QueryPackagesByPageDto> = {}) => {
    const error = isValidDto(query, QueryPackagesByPageDto);
    if (error.length > 0) throw new BadRequestException(error);

    const { all, ...rest } = query;
    if (all) {
      const response = await this.packages.find();
      return {
        docs: response,
        has_next_page: false,
        has_prev_page: false,
        next_page: null,
        page: 1,
        paging_counter: 1,
        pick: response.length,
        prev_page: null,
        total_docs: response.length,
        total_pages: 1,
      } satisfies IPagePaginated<IPackage>;
    }
    return paginate_by_page_helper(rest, this.packages);
  };

  update = async (id: string, body: UpdatePackagesDto) => {
    const error = isValidDto(body, UpdatePackagesDto);
    if (error.length > 0) throw new BadRequestException(error);
    const { admin_id, ...rest } = body;
    return update_by_id_helper(this.packages, id, rest);
  };

  remove = async (id: string) => {
    return remove_helper(this.packages, id);
  };
}
