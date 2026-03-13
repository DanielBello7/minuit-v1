import { Module } from '@nestjs/common';
import { PackagesService } from './packages.service';
import { PackagesController } from './packages.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { PackageSchema } from './schemas/package.schema';

@Module({
  exports: [PackagesService],
  imports: [TypeOrmModule.forFeature([PackageSchema])],
  providers: [PackagesService],
  controllers: [PackagesController],
})
export class PackagesModule {}
