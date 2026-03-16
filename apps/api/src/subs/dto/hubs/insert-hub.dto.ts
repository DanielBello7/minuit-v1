import { OmitType } from '@nestjs/mapped-types';
import { CreateHubDto } from './create-hub.dto';

export class InsertHubDto extends OmitType(CreateHubDto, ['active_at']) {}
