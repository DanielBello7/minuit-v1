import { IMailModuleType } from '@app/util';
import { DynamicModule, Global, Module } from '@nestjs/common';
import { BrevoService } from './brevo.service';

export type BrevoProvider = {
  email: string;
  ename: string;
  apiKy: string;
};

@Global()
@Module({})
export class BrevoModule {
  static register(data: BrevoProvider): DynamicModule {
    return {
      module: BrevoModule,
      global: true,
      providers: [
        {
          provide: 'BREVO',
          useValue: data,
        },
        {
          provide: IMailModuleType,
          useClass: BrevoService,
        },
      ],
      exports: [IMailModuleType],
    };
  }
}
