import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Boleto } from './boleto.entity';
import { Lote } from '../lotes/lote.entity';
import { Mapeamento } from '../mapeamento/mapeamento.entity';
import { Repository, Between, Like } from 'typeorm';
import { PDFDocument } from 'pdf-lib';

@Injectable()
export class BoletosService {
  constructor(
    @InjectRepository(Boleto)
    private readonly boletoRepository: Repository<Boleto>,
    
    @InjectRepository(Lote)
    private readonly loteRepository: Repository<Lote>,
    
    @InjectRepository(Mapeamento)
    private readonly mapeamentoRepository: Repository<Mapeamento>,
  ) {}

  /**
   * Atividade 1 & 2: Importação de boletos via CSV
   * com mapeamento automático de lotes
   */
  async importarBoletos(
    nomeSacado: string,
    unidade: string,
    valor: number,
    linhaDigitavel: string,
  ): Promise<Boleto> {
    // Busca o mapeamento para a unidade
    const mapeamento = await this.mapeamentoRepository.findOne({
      where: { nome_externo: unidade },
    });

    if (!mapeamento) {
      throw new Error(`Unidade ${unidade} não mapeada`);
    }

    // Verifica se o lote existe
    const lote = await this.loteRepository.findOne({
      where: { id: mapeamento.id_lote },
    });

    if (!lote) {
      throw new Error(`Lote ID ${mapeamento.id_lote} não encontrado`);
    }

    // Cria o novo boleto
    return this.boletoRepository.save({
      nome_sacado: nomeSacado,
      lote: lote,
      valor: valor,
      linha_digitavel: linhaDigitavel,
      ativo: true,
    });
  }

  /**
   * Atividade 4: Listagem de boletos com filtros
   */
  async listarBoletos(filtros: {
    nome?: string;
    valor_inicial?: number;
    valor_final?: number;
    id_lote?: number;
  }) {
    const where: any = { ativo: true };

    if (filtros.nome) {
      where.nome_sacado = Like(`%${filtros.nome}%`);
    }

    if (filtros.valor_inicial && filtros.valor_final) {
      where.valor = Between(filtros.valor_inicial, filtros.valor_final);
    } else if (filtros.valor_inicial) {
      where.valor = Between(filtros.valor_inicial, Number.MAX_SAFE_INTEGER);
    } else if (filtros.valor_final) {
      where.valor = Between(0, filtros.valor_final);
    }

    if (filtros.id_lote) {
      where.lote = { id: filtros.id_lote };
    }

    return this.boletoRepository.find({
      where,
      relations: ['lote'],
      order: { id: 'ASC' }, // Ordem fixa para corresponder ao PDF
    });
  }

  /**
   * Atividade 5: Gerar relatório em PDF
   */
  async gerarRelatorioPdf(boletos: Boleto[]): Promise<Buffer> {
    const pdfDoc = await PDFDocument.create();
    const page = pdfDoc.addPage([595, 842]); // A4

    // Cabeçalho
    page.drawText('RELATÓRIO DE BOLETOS - CONDOMÍNIO GREEN PARK', {
      x: 50,
      y: 800,
      size: 14,
    });

    // Cabeçalhos da tabela
    const headers = ['ID', 'Nome', 'Lote', 'Valor', 'Linha Digitável'];
    const colWidths = [30, 150, 50, 60, 200];
    let y = 750;

    headers.forEach((header, index) => {
      page.drawText(header, {
        x: 50 + colWidths.slice(0, index).reduce((a, b) => a + b, 0),
        y,
        size: 12,
      });
    });

    y -= 30;

    // Linhas da tabela
    boletos.forEach((boleto) => {
      const row = [
        boleto.id.toString(),
        boleto.nome_sacado,
        boleto.lote.nome,
        `R$ ${boleto.valor.toFixed(2)}`,
        boleto.linha_digitavel,
      ];

      row.forEach((cell, index) => {
        page.drawText(cell, {
          x: 50 + colWidths.slice(0, index).reduce((a, b) => a + b, 0),
          y,
          size: 10,
        });
      });

      y -= 20;
    });

    const pdfBytes = await pdfDoc.save();
    return Buffer.from(pdfBytes);
  }

  /**
   * Método auxiliar para obter boletos na ordem correta
   * para correspondência com o PDF
   */
  async getBoletosOrdenados(): Promise<Boleto[]> {
    return this.boletoRepository.find({
      order: { id: 'ASC' },
      relations: ['lote'],
    });
  }
}