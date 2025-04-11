import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Mapeamento } from './mapeamento.entity';
import { MapeamentosController } from './mapeamentos.controller';
import { MapeamentosService } from './mapeamentos.service';
import { LotesModule } from '../lotes/lotes.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([Mapeamento]),
    LotesModule 
  ],
  controllers: [MapeamentosController],
  providers: [MapeamentosService],
  exports: [MapeamentosService] 
})
export class MapeamentosModule {}