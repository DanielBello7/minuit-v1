import { DynamicModule, Global, Module } from '@nestjs/common';
import { FlwService } from './flw.v4.service';
import { IPayment } from '@app/util/interfaces/payment.interface';
import { FLUTTERWAVE_CURRENCY_TYPE } from './types.v3';
import { FlwCurrencyType } from './types.v4';

export type v3_flconfig = {
  secretkey: string;
  publickey: string;
  aCurrency: FLUTTERWAVE_CURRENCY_TYPE; // account currency
};

export type v4_flconfig = {
  client_id: string;
  client_secret: string;
  a_currency: FlwCurrencyType;
  env: 'sandbox' | 'production';
};

@Global()
@Module({
  providers: [FlwService],
  exports: [FlwService],
})
export class FlwModule {
  static register(data: v3_flconfig): DynamicModule {
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
