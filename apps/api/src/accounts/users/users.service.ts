import {
  create_helper,
  find_by_id_helper,
  find_by_id_lock_helper,
  isValidDto,
  remove_helper,
  update_by_id_helper,
} from '@app/util';
import { Injectable, BadRequestException, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { UserSchema } from './schemas/user.schema';
import { EntityManager, ILike, In, Repository } from 'typeorm';
import { MutationsService } from '@app/mutations';
import { CreateUserDto } from './dto/create-user.dto';
import { InsertUserDto } from './dto/insert-user.dto';
import * as bcrypt from 'bcryptjs';
import { UpdateUserDto } from './dto/update-user.dto';
import { InsertAdminDto } from './dto/insert-admin.dto';
import { AccountType } from '@repo/types';
import { SetPasswordDto } from './dto/set-password.dto';
import { CONSTANTS } from '@app/constants';
import { UpdatePasswordDto } from './dto/update-password.dto';
import { SearchDto } from './dto/search.dto';
import { SORT_TYPE_ENUM } from '@repo/types';

@Injectable()
export class UsersService {
  constructor(
    @InjectRepository(UserSchema)
    private readonly users: Repository<UserSchema>,
    private readonly mutation: MutationsService,
  ) {}

  get_status_by_id = async (id: string) => {
    const user = await this.find_user_by_id(id);
    return { is_onboarded: user.is_onboarded };
  };

  find_by_id_lock = async (id: string, session: EntityManager) => {
    return find_by_id_lock_helper(this.users, id, session);
  };

  modify_user_by_id = async (id: string, body: UpdateUserDto) => {
    return this.mutation.execute(async (session) => {
      const user = await this.find_user_by_id(id, session);
      const { password, email, timezone, has_password, type, is_email_verified, ...rest } = body;
      if (rest.firstname || rest.surname) {
        rest.display_name = `${rest.firstname ?? user.firstname} ${rest.surname ?? user.surname}`;
      }
      return this.update_user(user.id, rest, session);
    });
  };

  update_user = async (id: string, body: UpdateUserDto, session?: EntityManager) => {
    const errors = isValidDto(body, UpdateUserDto);
    if (errors.length > 0) throw new BadRequestException(errors);
    return update_by_id_helper<UserSchema>(this.users, id, body, session);
  };

  is_already_registered = async (email: string, username: string, session: EntityManager) => {
    const db = session.getRepository(this.users.target);
    const response = await db
      .createQueryBuilder('user')
      .where('user.email = :email', { email })
      .orWhere('user.username ILIKE :username', { username })
      .getOne();
    if (response) {
      if (response.email === email) {
        throw new BadRequestException('email already registered');
      }
      throw new BadRequestException('username already registered');
    }
    return void 0;
  };

  insert_admin = async (body: InsertAdminDto, session?: EntityManager) => {
    return this.insert_user(
      {
        ...body,
        type: AccountType.Admins,
      },
      session,
    );
  };

  insert_other_user = async (body: InsertUserDto, session?: EntityManager) => {
    if (body.type === AccountType.Admins) {
      throw new BadRequestException('type cannot be admin');
    }
    return this.insert_user(body, session);
  };

  find_user_by_email = async (email: string, session?: EntityManager) => {
    const db = session ? session.getRepository(this.users.target) : this.users;
    const response = await db.findOne({
      where: { email },
    });
    if (response) return response;
    throw new NotFoundException('email not registered');
  };

  private insert_user = async (body: InsertUserDto, session?: EntityManager) => {
    const errors = isValidDto(body, InsertUserDto);
    if (errors.length > 0) throw new BadRequestException(errors);

    const action = async (s: EntityManager) => {
      await this.is_already_registered(body.email, body.username, s);
      return this.create_user(
        {
          ...body,
          avatar: undefined,
          display_name: body.firstname + ' ' + body.surname,
          is_email_verified: false,
          has_password: false,
          dark_mode: false,
          is_onboarded: false,
          last_login_date: undefined,
          refresh_token: undefined,
        },
        s,
      );
    };

    if (session) return action(session);
    return this.mutation.execute(action);
  };

  create_user = async (body: CreateUserDto, session?: EntityManager) => {
    const errors = isValidDto(body, CreateUserDto);
    if (errors.length > 0) throw new BadRequestException(errors);
    return create_helper<UserSchema>(this.users, body, session);
  };

  find_user_by_id = async (id: string, session?: EntityManager) => {
    return find_by_id_helper(this.users, id, {}, session);
  };

  find_by_ids_lock = async (ids: string[], session: EntityManager) => {
    const db = session.getRepository(this.users.target);
    return db.find({
      where: {
        id: In(ids),
      },
      lock: { mode: 'pessimistic_write' },
    });
  };

  find_by_ids = async (ids: string[]) => {
    return this.users.find({
      where: {
        id: In(ids),
      },
    });
  };

  delete_user = async (id: string, session?: EntityManager) => {
    return remove_helper(this.users, id, session);
  };

  set_password = async (body: SetPasswordDto) => {
    return this.mutation.execute(async (session) => {
      const user = await this.find_by_id_lock(body.id, session);
      if (user.password || user.has_password) {
        throw new BadRequestException('user already has its password set');
      }
      const hashed = bcrypt.hashSync(body.new_password, CONSTANTS.HASH);
      return this.update_user(
        user.id,
        {
          password: hashed,
          has_password: true,
        },
        session,
      );
    });
  };

  update_password = async (id: string, body: UpdatePasswordDto) => {
    return this.mutation.execute(async (session) => {
      const user = await this.find_by_id_lock(id, session);
      if (user.has_password === false || !user.password) {
        throw new BadRequestException("user doesn't have a password set");
      }
      const compare = bcrypt.compareSync(body.old_password, user.password);
      if (!compare) throw new BadRequestException('invalid credentials');

      const hash = bcrypt.hashSync(body.new_password, CONSTANTS.HASH);
      return this.update_user(
        user.id,
        {
          password: hash,
        },
        session,
      );
    });
  };

  search_by_email = async (body: SearchDto) => {
    const errors = isValidDto(body, SearchDto);
    if (errors.length > 0) throw new BadRequestException(errors);

    const page = Math.max(body.pagination?.page ?? 1, 1);
    const pick = Math.min(body.pagination?.pick ?? 9, 100);
    const sort = body.pagination?.sort ?? SORT_TYPE_ENUM.DESC;
    const skip = (page - 1) * pick;

    if (skip > 100_000) throw new BadRequestException('pagination limit exceeded');

    const [response, count] = await this.users.findAndCount({
      where: {
        email: ILike(`%${body.value}%`),
      },
      skip,
      take: pick,
      order: { email: sort },
    });

    const total_pages = Math.ceil(count / pick);

    return {
      docs: response,
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
  };
}
