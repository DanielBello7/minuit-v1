import { Injectable } from '@nestjs/common';
import { CreateAlarmDto } from './dto/create-alarm.dto';
import { UpdateAlarmDto } from './dto/update-alarm.dto';
import { EntityManager, Repository } from 'typeorm';
import { AlarmSchema } from './schemas/alarm.schema';
import { InjectRepository } from '@nestjs/typeorm';
import { InsertAlarmDto } from './dto/insert-alarm.dto';
import { QueryAlarmsByPage } from './dto/query-alarm.dto';
import { sanitize } from '@app/util/fns';
import {
  create_helper,
  find_by_id_helper,
  paginate_by_page_helper,
  remove_helper,
  update_by_id_helper,
} from '@app/util';
import { MutationsService } from '@app/mutations';

const relations = ['User'];

@Injectable()
export class AlarmsService {
  constructor(
    @InjectRepository(AlarmSchema)
    private readonly alarms: Repository<AlarmSchema>,
    private readonly mutations: MutationsService,
  ) {}

  insert = async (body: InsertAlarmDto) => {
    const data = sanitize(body, InsertAlarmDto);
    return this.create({
      ...data,
      is_active: true,
    });
  };

  create = async (body: CreateAlarmDto, session?: EntityManager) => {
    const data = sanitize(body, CreateAlarmDto);
    const response = await create_helper<AlarmSchema>(
      this.alarms,
      data,
      session,
    );
    return this.find_by_id(response.id, session);
  };

  get_by_page = async (query: Partial<QueryAlarmsByPage> = {}) => {
    return paginate_by_page_helper(query, this.alarms);
  };

  find_by_id = async (id: string, session?: EntityManager) => {
    return find_by_id_helper(this.alarms, id, { relations }, session);
  };

  modify = async (id: string, body: UpdateAlarmDto) => {
    const params = sanitize(body, UpdateAlarmDto);
    const {
      is_active,
      user_id,
      city,
      country,
      region,
      timezone,
      ...rest
    } = params;
    return this.update(id, rest);
  };

  update = async (
    id: string,
    body: UpdateAlarmDto,
    session?: EntityManager,
  ) => {
    const params = sanitize(body, UpdateAlarmDto);
    return update_by_id_helper(this.alarms, id, params, session, {
      relations,
    });
  };

  remove = async (id: string) => {
    return remove_helper(this.alarms, id);
  };
}
