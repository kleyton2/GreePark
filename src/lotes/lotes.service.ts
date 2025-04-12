import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Lotes } from './lote.entity';
import { CreateLoteDto } from './create-lote.dto';

@Injectable()
export class LotesService {
  constructor(
    @InjectRepository(Lotes)
    private lotesRepository: Repository<Lotes>,
  ) {}

  async create(createLoteDto: CreateLoteDto): Promise<Lotes> {
    const lote = this.lotesRepository.create(createLoteDto);
    return this.lotesRepository.save(lote);
  }

  async findAll(): Promise<Lotes[]> {
    return this.lotesRepository.find();
  }

  async findOne(id: number): Promise<Lotes | null> {
    return this.lotesRepository.findOne({ where: { id } });
  }
}