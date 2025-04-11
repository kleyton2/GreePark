import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Mapeamento } from './mapeamento.entity';
import { MapeamentosController } from './mapeamentos.controller';
import { MapeamentosService } from './mapeamentos.service';
import { LotesModule } from '../lotes/lotes.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([Mapeamento]),
    LotesModule // Importamos LotesModule para usar LotesService
  ],
  controllers: [MapeamentosController],
  providers: [MapeamentosService],
  exports: [MapeamentosService] // Exportamos para usar em outros módulos
})
export class MapeamentosModule {}