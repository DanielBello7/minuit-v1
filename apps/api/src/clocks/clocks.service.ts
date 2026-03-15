import { BadGatewayException, Injectable } from '@nestjs/common';
import { CreateClockDto } from './dto/create-clock.dto';
import { UpdateClockDto } from './dto/update-clock.dto';
import { EntityManager, Repository } from 'typeorm';
import { ClockSchema } from './schemas/clock.schema';
import { InjectRepository } from '@nestjs/typeorm';
import {
  create_helper,
  isValidDto,
  paginate_by_page_helper,
  remove_helper,
  update_by_id_helper,
} from '@app/util';
import { QueryClocksByPage } from './dto/query-clocks-by-index.dto';
import { InsertClockDto } from './dto/insert-clock.dto';
import { MutationsService } from '@app/mutations';

enum CLOCK_ALREADY_EXISTS {
  YES = 'YES',
  NO = 'NO',
}

@Injectable()
export class ClocksService {
  constructor(
    @InjectRepository(ClockSchema)
    private readonly clocks: Repository<ClockSchema>,
    private readonly mutation: MutationsService,
  ) {}

  already_exists = async (user_id: string, city: string, session?: EntityManager) => {
    const db = this.mutation.getRepo(this.clocks, session);
    const response = await db.findOne({
      where: { user_id, city },
    });
    if (response) return CLOCK_ALREADY_EXISTS.YES;
    return CLOCK_ALREADY_EXISTS.NO;
  };

  insert = async (body: InsertClockDto) => {
    const errors = isValidDto(body, InsertClockDto);
    if (errors.length > 0) throw new BadGatewayException(errors);

    return this.mutation.execute(async (em) => {
      const reply = await this.already_exists(body.user_id, body.city, em);
      if (reply === CLOCK_ALREADY_EXISTS.YES) throw new BadGatewayException('already exists');
      return this.create(
        {
          ...body,
          is_active: true,
        },
        em,
      );
    });
  };

  create = async (body: CreateClockDto, session?: EntityManager) => {
    const errors = isValidDto(body, CreateClockDto);
    if (errors.length > 0) throw new BadGatewayException(errors);
    return create_helper<ClockSchema>(this.clocks, body, session);
  };

  get_by_pages = async (query: Partial<QueryClocksByPage> = {}) => {
    return paginate_by_page_helper(query, this.clocks);
  };

  modify = async (id: string, body: UpdateClockDto) => {
    const errors = isValidDto(body, UpdateClockDto);
    if (errors.length > 0) throw new BadGatewayException(errors);
    const { user_id, city, country, region, timezone, ...rest } = body;
    return this.update(id, rest);
  };

  update = async (id: string, body: UpdateClockDto, session?: EntityManager) => {
    const errors = isValidDto(body, UpdateClockDto);
    if (errors.length > 0) throw new BadGatewayException(errors);
    return update_by_id_helper<ClockSchema>(this.clocks, id, body, session);
  };

  remove = async (id: string, session?: EntityManager) => {
    return remove_helper<ClockSchema>(this.clocks, id, session);
  };
}
