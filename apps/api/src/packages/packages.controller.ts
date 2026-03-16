import {
  Controller,
  Get,
  Delete,
  Body,
  Patch,
  ParseUUIDPipe,
  Post,
  Param,
  Query,
  UseGuards,
} from '@nestjs/common';
import { PackagesService } from './packages.service';
import { CreatePackagesDto } from './dto/create-package.dto';
import { UpdatePackagesDto } from './dto/update-package.dto';
import { QueryPackagesByPageDto } from './dto/query-packages-by-page.dto';
import { JwtGuard } from '@/auth/guards';
import { AllowRoles } from '@/auth/decorators/roles.decorator';
import { AccountType } from '@repo/types';
import { Public } from '@/auth/decorators/public.decorator';

@AllowRoles(AccountType.Admins)
@UseGuards(JwtGuard)
@Controller('packages')
export class PackagesController {
  constructor(private readonly packages: PackagesService) {}

  @Post()
  add_package(@Body() body: CreatePackagesDto) {
    return this.packages.create(body);
  }

  @Public()
  @Get()
  get_by_page(@Query() query: QueryPackagesByPageDto) {
    return this.packages.get_by_page(query);
  }

  @Patch(':id')
  update(
    @Param('id', ParseUUIDPipe) id: string,
    @Body() body: UpdatePackagesDto,
  ) {
    return this.packages.update(id, body);
  }

  @Delete(':id')
  remove(@Param('id', ParseUUIDPipe) id: string) {
    return this.packages.remove(id);
  }
}
