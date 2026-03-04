import { DynamicModule, Module } from '@nestjs/common';
import { WinstonService } from './winston.service';

type WinstonOptions = {
  dir: string;
};

@Module({})
export class WinstonModule {
  static register({ dir }: WinstonOptions): DynamicModule {
    return {
      global: true,
      providers: [
        WinstonService,
        {
          provide: 'WINSTON',
          useValue: { dir },
        },
      ],
      module: WinstonModule,
      exports: [WinstonService],
    };
  }
}
