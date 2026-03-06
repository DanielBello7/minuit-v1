import { Module } from '@nestjs/common';
import { UsersService } from './users.service';
import { UsersController } from './users.controller';
import { UserSchema } from './schemas/user.schema';
import { UserSettingsSchema } from './schemas/user-settings.schema';
import { TypeOrmModule } from '@nestjs/typeorm';
import { MutationsModule } from '@app/mutations';

@Module({
  imports: [
    TypeOrmModule.forFeature([UserSchema, UserSettingsSchema]),
    MutationsModule,
  ],
  providers: [UsersService],
  exports: [UsersService],
  controllers: [UsersController],
})
export class UsersModule {}
