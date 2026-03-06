import { create_helper, isValidDto, update_by_id_helper } from '@app/util';
import { BadRequestException, Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { EntityManager, Repository } from 'typeorm';
import { UpdateSettingDto } from './dto/update-setting.dto';
import { SettingSchema } from './schemas/setting.schema';

@Injectable()
export class SettingsService {
  constructor(
    @InjectRepository(SettingSchema)
    private readonly settings: Repository<SettingSchema>,
  ) {}

  find = async (e?: EntityManager) => {
    const em = e ? e.getRepository(this.settings.target) : this.settings;

    const response = await em.find();
    let current: SettingSchema;
    if (response.length !== 1) {
      await this.settings.clear();
      current = await create_helper(this.settings, {
        version: '1.0.0',
        max_free_alarms: 1,
        max_free_clocks: 3,
      });
    } else current = response[0];
    return current;
  };

  update = async (body: UpdateSettingDto) => {
    const errors = isValidDto(body, UpdateSettingDto);
    if (errors.length > 0) throw new BadRequestException(errors);
    const settings = await this.find();
    return update_by_id_helper<SettingSchema>(this.settings, settings.id, body);
  };

  update_count = async (
    body: Partial<
      Record<keyof Pick<SettingSchema, 'max_free_alarms' | 'max_free_clocks'>, number>
    > = {},
    manager?: EntityManager,
  ) => {
    const db = manager ? manager.getRepository(this.settings.target) : this.settings;

    const response = await this.find(manager);
    await Promise.all(
      Object.keys(body).map((i) => {
        return db.increment({ id: response.id }, i, body[i]);
      }),
    );
    return this.find(manager);
  };
}
