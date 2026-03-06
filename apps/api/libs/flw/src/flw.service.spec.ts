import { Test, TestingModule } from '@nestjs/testing';
import { FlwService } from './flw.service';

describe('FlwService', () => {
  let service: FlwService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [FlwService],
    }).compile();

    service = module.get<FlwService>(FlwService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
