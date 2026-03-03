import { Module } from '@nestjs/common';
import { AuthService } from './auth.service';
import { AuthController } from './auth.controller';
import { UsersModule } from '@/accounts/users/users.module';
import { TypeOrmModule } from '@nestjs/typeorm';
import { OtpSchema } from './schemas/otp.schema';
import { MutationsModule } from '@app/mutations';

@Module({
  controllers: [AuthController],
  exports: [AuthService],
  providers: [AuthService],
  imports: [UsersModule, TypeOrmModule.forFeature([OtpSchema]), MutationsModule],
})
export class AuthModule {}
