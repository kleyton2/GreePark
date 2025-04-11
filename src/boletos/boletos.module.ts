import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Boleto } from './boleto.entity';
import { BoletosController } from './boletos.controller';
import { BoletosService } from './boletos.service';
import { CsvService } from './csv.service';
import { PdfService } from './pdf.service';
import { Lote } from '../lotes/lote.entity';
import { Mapeamento } from '../mapeamento/mapeamento.entity';

@Module({
  imports: [TypeOrmModule.forFeature([Boleto, Lote, Mapeamento])],
  controllers: [BoletosController],
  providers: [BoletosService, CsvService, PdfService],
})
export class BoletosModule {}