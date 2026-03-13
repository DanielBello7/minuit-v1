import { CommonBase } from '@app/util';
import { ICharge, ICurrency, ISettings } from '@repo/types';
import { Column, Entity, PrimaryColumn, Unique } from 'typeorm';

// prettier-ignore
@Entity("settings")
@Unique('unique_singleton', ['id'])
export class SettingSchema extends CommonBase implements ISettings {
  @PrimaryColumn('uuid') id: string = '00000000-0000-0000-0000-000000000001'; // fixed/static ID
  @Column({ type: 'varchar' }) version: string;
  @Column({ type: 'int', default: 1 }) max_free_alarms: number;
  @Column({ type: 'int', default: 3 }) max_free_clocks: number;
  @Column({ type: "jsonb", default: [] }) currencies: ICurrency[];
  @Column({ type: 'int', default: 6 }) transaction_expiry_hours: number;
  @Column({ type: "jsonb" }) charges: { PAYMENT: ICharge[]; REFUNDS: ICharge[]; };
}
