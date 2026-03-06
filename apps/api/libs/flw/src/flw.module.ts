import { DynamicModule, Global, Module } from '@nestjs/common';
import { FlwService } from './flw.service';
import { IPayment } from '@app/util/interfaces/payment.interface';
import { CurrencyType } from './types';

export type flconfig = {
  secretkey: string;
  publickey: string;
  aCurrency: CurrencyType; // account currency
};

@Global()
@Module({
  providers: [FlwService],
  exports: [FlwService],
})
export class FlwModule {
  static register(data: flconfig): DynamicModule {
    return {
      exports: [IPayment],
      module: FlwModule,
      providers: [
        {
          provide: 'FLUTTERWAVE',
          useValue: data,
        },
        {
          provide: IPayment,
          useClass: FlwService,
        },
      ],
    };
  }
}
