import { CommonBase } from '@app/util';
import { AccountType, IUser } from '@repo/types';
import { Column, Entity } from 'typeorm';
import { Exclude } from 'class-transformer';

// prettier-ignore
@Entity("users")
export class UserSchema extends CommonBase implements IUser {
  @Column({ type: 'varchar' }) firstname: string;
  @Column({ type: 'varchar' }) surname: string;
  @Column({ type: 'varchar' }) email: string;
  @Exclude() @Column({ type: 'varchar', nullable: true }) password: string | undefined;
  @Column({ type: 'varchar', nullable: true }) avatar: string | undefined;
  @Column({ type: 'varchar' }) timezone: string;
  @Column({ type: 'varchar' }) username: string;
  @Column({ type: 'varchar' }) display_name: string;
  @Column({ type: 'enum', enum: AccountType }) type: AccountType;
  @Column({ type: 'boolean' }) is_email_verified: boolean;
  @Column({ type: 'boolean' }) has_password: boolean;
  @Exclude() @Column({ type: 'varchar',nullable: true }) refresh_token: string | undefined;
  @Exclude() @Column({ type: 'timestamp', nullable: true }) last_login_date: Date | undefined;
  @Column({ type: 'boolean' }) dark_mode: boolean;
  @Column({ type: 'boolean' }) is_onboarded: boolean;
}
