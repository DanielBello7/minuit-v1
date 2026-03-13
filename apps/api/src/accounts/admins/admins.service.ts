import { BadRequestException, Injectable } from '@nestjs/common';
import { CreateAdminDto } from './dto/create-admin.dto';
import { EntityManager, Repository } from 'typeorm';
import { AdminSchema } from './schemas/admin.schema';
import { InjectRepository } from '@nestjs/typeorm';
import { create_helper, find_by_id_helper, isValidDto } from '@app/util';
import { MutationsService } from '@app/mutations';

const relations = ['User'];

enum USER_USED_RESPONSE_ENUM {
  USED,
  UNUSED,
}
@Injectable()
export class AdminsService {
  constructor(
    @InjectRepository(AdminSchema)
    private readonly admins: Repository<AdminSchema>,
    private readonly mutations: MutationsService,
  ) {}

  is_user_used = async (user_id: string, session?: EntityManager) => {
    const db = this.mutations.getRepo(this.admins, session);
    const search = await db.findOne({
      where: { user_id },
    });
    if (search) return USER_USED_RESPONSE_ENUM.USED;
    return USER_USED_RESPONSE_ENUM.UNUSED;
  };

  insert_admin = async (body: CreateAdminDto, session?: EntityManager) => {
    const errors = isValidDto(body, CreateAdminDto);
    if (errors.length > 0) throw new BadRequestException(errors);

    const actions = async (em: EntityManager) => {
      const response = await this.is_user_used(body.user_id, em);
      if (response !== USER_USED_RESPONSE_ENUM.UNUSED) {
        throw new BadRequestException('user account already used');
      }
      return this.create(body, em);
    };

    if (session) return actions(session);
    return this.mutations.execute(actions);
  };

  create = async (body: CreateAdminDto, session?: EntityManager) => {
    const errors = isValidDto(body, CreateAdminDto);
    if (errors.length > 0) throw new BadRequestException(errors);
    const response = await create_helper<AdminSchema>(this.admins, body, session);
    return this.find_by_id(response.id, session);
  };

  find_by_id = async (id: string, session?: EntityManager) => {
    return find_by_id_helper(this.admins, id, { relations }, session);
  };
}
