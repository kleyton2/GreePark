import { Controller, Get, Post, Body, Param } from '@nestjs/common';
import { MapeamentosService } from './mapeamentos.service';
import { Mapeamento } from './mapeamento.entity';
import { CreateMapeamentoDto } from './create-mapeamento.dto';

@Controller('mapeamentos')
export class MapeamentosController {
  constructor(private readonly mapeamentosService: MapeamentosService) {}

  @Post()
  async create(@Body() createMapeamentoDto: CreateMapeamentoDto): Promise<Mapeamento> {
    return this.mapeamentosService.create(createMapeamentoDto);
  }

  @Get()
  async findAll(): Promise<Mapeamento[]> {
    return this.mapeamentosService.findAll();
  }

  @Get(':nome_externo')
  async findOne(@Param('nome_externo') nome_externo: string): Promise<Mapeamento | null> {
    return this.mapeamentosService.findOne(nome_externo);
  }
}