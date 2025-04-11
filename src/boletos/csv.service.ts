import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Boleto } from './boleto.entity';
import { Mapeamento } from '../mapeamento/mapeamento.entity';
import { Repository } from 'typeorm';
import * as fs from 'fs';
import * as csv from 'csv-parser';

@Injectable()
export class CsvService {
  constructor(
    @InjectRepository(Boleto)
    private boletoRepository: Repository<Boleto>,
    @InjectRepository(Mapeamento)
    private mapeamentoRepository: Repository<Mapeamento>,
  ) {}

  async processarCsv(caminho: string) {
    const resultados = { sucesso: 0, erros: 0 };

    return new Promise((resolve) => {
      fs.createReadStream(caminho)
        .pipe(csv({ separator: ';' }))
        .on('data', async (row) => {
          try {
            const mapeamento = await this.mapeamentoRepository.findOne({ 
              where: { nome_externo: row.unidade } 
            });
            
            if (!mapeamento) {
              resultados.erros++;
              return;
            }

            await this.boletoRepository.save({
              nome_sacado: row.nome,
              lote: { id: mapeamento.id_lote },
              valor: parseFloat(row.valor),
              linha_digitavel: row.linha_digitavel,
              ativo: true,
            });
            resultados.sucesso++;
          } catch {
            resultados.erros++;
          }
        })
        .on('end', () => resolve(resultados));
    });
  }
}