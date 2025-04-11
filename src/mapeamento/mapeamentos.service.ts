import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Mapeamento } from './mapeamento.entity';
import { CreateMapeamentoDto } from './create-mapeamento.dto';
import { LotesService } from '../lotes/lotes.service';

@Injectable()
export class MapeamentosService {
  constructor(
    @InjectRepository(Mapeamento)
    private mapeamentosRepository: Repository<Mapeamento>,
    private lotesService: LotesService,
  ) {}

  async create(createMapeamentoDto: CreateMapeamentoDto): Promise<Mapeamento> {
    // Verifica se o lote existe
    const lote = await this.lotesService.findOne(createMapeamentoDto.id_lote);
    if (!lote) {
      throw new Error('Lote não encontrado');
    }

    const mapeamento = this.mapeamentosRepository.create(createMapeamentoDto);
    return this.mapeamentosRepository.save(mapeamento);
  }

  async findAll(): Promise<Mapeamento[]> {
    return this.mapeamentosRepository.find();
  }

  async findOne(nome_externo: string): Promise<Mapeamento | null> {
    return this.mapeamentosRepository.findOne({ where: { nome_externo } });
  }
}