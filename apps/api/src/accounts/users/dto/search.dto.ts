import { PageQueryParamsDto } from '@app/util/dto';
import { IsNotEmpty, IsString } from 'class-validator';

export class SearchDto extends PageQueryParamsDto {
  @IsNotEmpty()
  @IsString()
  value: string;
}
