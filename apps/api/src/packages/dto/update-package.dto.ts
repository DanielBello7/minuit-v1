import { PartialType } from '@nestjs/mapped-types';
import { CreatePricingDto } from './create-package.dto';

export class UpdatePricingDto extends PartialType(CreatePricingDto) {}
