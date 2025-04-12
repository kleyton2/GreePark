import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Lotes } from './lote.entity';
import { LotesController } from './lotes.controller';
import { LotesService } from './lotes.service';

@Module({
  imports: [TypeOrmModule.forFeature([Lotes])],
  controllers: [LotesController],
  providers: [LotesService],
  exports: [LotesService] 
})
export class LotesModule {}