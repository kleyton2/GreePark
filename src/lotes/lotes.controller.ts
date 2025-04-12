import { Controller, Get, Post, Body, Param } from '@nestjs/common';
import { LotesService } from './lotes.service';
import { Lotes } from './lote.entity';
import { CreateLoteDto } from './create-lote.dto';

@Controller('lotes')
export class LotesController {
  constructor(private readonly lotesService: LotesService) {}

  @Post()
  async create(@Body() createLoteDto: CreateLoteDto): Promise<Lotes> {
    return this.lotesService.create(createLoteDto);
  }

  @Get()
  async findAll(): Promise<Lotes[]> {
    return this.lotesService.findAll();
  }

  @Get(':id')
  async findOne(@Param('id') id: number): Promise<Lotes | null> {
    return this.lotesService.findOne(id);
  }
}