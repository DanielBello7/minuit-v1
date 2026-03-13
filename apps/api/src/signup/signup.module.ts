import { Module } from '@nestjs/common';
import { SignupService } from './signup.service';
import { UsersModule } from '@/accounts/users/users.module';
import { AdminsModule } from '@/accounts/admins/admins.module';
import { MutationsModule } from '@app/mutations';
import { SignupController } from './signup.controller';
import { AuthModule } from '@/auth/auth.module';

@Module({
  exports: [SignupService],
  imports: [UsersModule, AdminsModule, MutationsModule, AuthModule],
  controllers: [SignupController],
  providers: [SignupService],
})
export class SignupModule {}
