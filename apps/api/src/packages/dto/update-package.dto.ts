import { PartialType } from '@nestjs/mapped-types';
import { CreatePackagesDto } from './create-package.dto';

export class UpdatePackagesDto extends PartialType(CreatePackagesDto) {}
