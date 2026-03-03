import { Test, TestingModule } from '@nestjs/testing';
import { SubsController } from './subs.controller';
import { SubsService } from './subs.service';

describe('SubsController', () => {
  let controller: SubsController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [SubsController],
      providers: [SubsService],
    }).compile();

    controller = module.get<SubsController>(SubsController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
