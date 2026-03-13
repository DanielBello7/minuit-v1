import { Module } from '@nestjs/common';
import { AdminsService } from './admins.service';
import { AdminsController } from './admins.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AdminSchema } from './schemas/admin.schema';
import { MutationsModule } from '@app/mutations';

@Module({
  providers: [AdminsService],
  controllers: [AdminsController],
  exports: [AdminsService],
  imports: [TypeOrmModule.forFeature([AdminSchema]), MutationsModule],
})
export class AdminsModule {}
