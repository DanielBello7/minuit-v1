import { Controller, Get, Post, Body, Patch, Param, Delete } from '@nestjs/common';
import { PackagesService } from './packages.service';
import { CreatePricingDto } from './dto/create-package.dto';
import { UpdatePricingDto } from './dto/update-package.dto';

@Controller('packages')
export class PackagesController {
  constructor(private readonly pricingsService: PackagesService) {}

  @Post()
  create(@Body() createPricingDto: CreatePricingDto) {
    return this.pricingsService.create(createPricingDto);
  }

  @Get()
  findAll() {
    return this.pricingsService.findAll();
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.pricingsService.findOne(+id);
  }

  @Patch(':id')
  update(@Param('id') id: string, @Body() updatePricingDto: UpdatePricingDto) {
    return this.pricingsService.update(+id, updatePricingDto);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.pricingsService.remove(+id);
  }
}
