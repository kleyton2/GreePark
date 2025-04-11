import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Lote } from './lote.entity';
import { CreateLoteDto } from './create-lote.dto';

@Injectable()
export class LotesService {
  constructor(
    @InjectRepository(Lote)
    private lotesRepository: Repository<Lote>,
  ) {}

  async create(createLoteDto: CreateLoteDto): Promise<Lote> {
    const lote = this.lotesRepository.create(createLoteDto);
    return this.lotesRepository.save(lote);
  }

  async findAll(): Promise<Lote[]> {
    return this.lotesRepository.find();
  }

  async findOne(id: number): Promise<Lote | null> {
    return this.lotesRepository.findOne({ where: { id } });
  }
}