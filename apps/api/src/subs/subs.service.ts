import { Injectable } from '@nestjs/common';
import { CreateSubDto } from './dto/create-sub.dto';
import { UpdateSubDto } from './dto/update-sub.dto';

@Injectable()
export class SubsService {
  create(createSubDto: CreateSubDto) {
    return 'This action adds a new sub';
  }

  findAll() {
    return `This action returns all subs`;
  }

  findOne(id: number) {
    return `This action returns a #${id} sub`;
  }

  update(id: number, updateSubDto: UpdateSubDto) {
    return `This action updates a #${id} sub`;
  }

  remove(id: number) {
    return `This action removes a #${id} sub`;
  }
}
