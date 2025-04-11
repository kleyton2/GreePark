import { Injectable, NotFoundException } from '@nestjs/common';
import { PDFDocument, rgb, StandardFonts } from 'pdf-lib';
import * as fs from 'fs';
import * as path from 'path';
import { InjectRepository } from '@nestjs/typeorm';
import { Boleto } from './boleto.entity';
import { Repository } from 'typeorm';

@Injectable()
export class PdfService {
  private readonly outputBaseDir = './boletos_pdf';

  constructor(
    @InjectRepository(Boleto)
    private boletoRepository: Repository<Boleto>,
  ) {
    // Garante que o diretório de saída existe
    if (!fs.existsSync(this.outputBaseDir)) {
      fs.mkdirSync(this.outputBaseDir, { recursive: true });
    }
  }

  /**
   * Divide um PDF em vários arquivos, um para cada boleto
   * @param inputPath Caminho do PDF de entrada
   * @param boletos Lista de boletos (opcional - busca automaticamente se não fornecido)
   * @returns Resultado da operação
   */
  async dividirPdf(
    inputPath: string,
    boletos?: Boleto[]
  ): Promise<{ success: boolean; files?: string[]; message?: string }> {
    try {
      // Valida se o arquivo existe
      if (!fs.existsSync(inputPath)) {
        throw new NotFoundException('Arquivo PDF não encontrado');
      }

      // Obtém os boletos se não foram fornecidos
      if (!boletos) {
        boletos = await this.boletoRepository.find({ 
          order: { id: 'ASC' },
          relations: ['lote']
        });
      }

      const pdfBytes = fs.readFileSync(inputPath);
      const pdfDoc = await PDFDocument.load(pdfBytes);

      // Valida se o número de páginas corresponde aos boletos
      if (pdfDoc.getPageCount() !== boletos.length) {
        return {
          success: false,
          message: `O PDF tem ${pdfDoc.getPageCount()} páginas, mas existem ${boletos.length} boletos cadastrados.`
        };
      }

      // Processa cada página
      const generatedFiles: string[] = [];
      for (let i = 0; i < pdfDoc.getPageCount(); i++) {
        const newPdf = await PDFDocument.create();
        const [page] = await newPdf.copyPages(pdfDoc, [i]);
        newPdf.addPage(page);

        const outputPath = path.join(this.outputBaseDir, `${boletos[i].id}.pdf`);
        const bytes = await newPdf.save();
        fs.writeFileSync(outputPath, bytes);
        generatedFiles.push(outputPath);
      }

      return { success: true, files: generatedFiles };
    } catch (error) {
      console.error('Erro ao dividir PDF:', error);
      return {
        success: false,
        message: error instanceof NotFoundException ? error.message : 'Falha ao processar o PDF'
      };
    }
  }

  /**
   * Gera um PDF fake para testes
   * @returns Caminho do arquivo e buffer do PDF
   */
  async gerarPdfFake(): Promise<{ path: string; buffer: Buffer }> {
    const boletos = await this.boletoRepository.find({ 
      order: { id: 'ASC' },
      relations: ['lote']
    });

    if (boletos.length === 0) {
      throw new NotFoundException('Nenhum boleto encontrado para gerar PDF');
    }

    const pdfDoc = await PDFDocument.create();
    const font = await pdfDoc.embedFont(StandardFonts.Helvetica);

    // Adiciona uma página por boleto
    for (const [index, boleto] of boletos.entries()) {
      const page = pdfDoc.addPage([550, 750]);
      const { width, height } = page.getSize();
      
      // Cabeçalho
      page.drawText('CONDOMÍNIO GREEN PARK', {
        x: 50,
        y: height - 50,
        size: 16,
        font,
        color: rgb(0, 0.2, 0.4),
      });

      // Detalhes do boleto
      const details = [
        `Boleto #${boleto.id}`,
        `Sacado: ${boleto.nome_sacado}`,
        `Valor: R$ ${boleto.valor.toFixed(2)}`,
        `Lote: ${boleto.lote.nome}`,
        `Linha digitável: ${boleto.linha_digitavel}`,
        `Gerado em: ${new Date().toLocaleDateString()}`
      ];

      // Desenha cada linha de detalhe
      details.forEach((text, i) => {
        page.drawText(text, {
          x: 50,
          y: height - 100 - (i * 30),
          size: 12,
          font,
        });
      });

      // Rodapé em todas as páginas exceto a última
      if (index < boletos.length - 1) {
        page.drawText('---', {
          x: width / 2 - 10,
          y: 50,
          size: 12,
          font,
        });
      }
    }

    // Salva e retorna
    const outputPath = path.join(this.outputBaseDir, 'boletos_fake.pdf');
    const pdfBytes = await pdfDoc.save();
    fs.writeFileSync(outputPath, pdfBytes);

    return { path: outputPath, buffer: Buffer.from(pdfBytes) };
  }

  /**
   * Gera um relatório PDF com todos os boletos
   * @param boletos Lista de boletos para incluir no relatório
   * @returns Buffer contendo o PDF
   */
  async gerarRelatorioPdf(boletos: Boleto[]): Promise<Buffer> {
    if (!boletos || boletos.length === 0) {
      throw new NotFoundException('Nenhum boleto encontrado para gerar relatório');
    }

    const pdfDoc = await PDFDocument.create();
    const font = await pdfDoc.embedFont(StandardFonts.Helvetica);
    const fontSize = 10;
    const margin = 50;
    const rowHeight = 20;
    const headers = ['ID', 'Sacado', 'Lote', 'Valor', 'Linha Digitável'];
    const columnWidths = [40, 150, 60, 70, 200];

    let currentPage = pdfDoc.addPage([595, 842]); // A4
    let y = 800;

    // Título
    currentPage.drawText('RELATÓRIO DE BOLETOS - GREEN PARK', {
      x: margin,
      y,
      size: 16,
      font,
      color: rgb(0, 0.2, 0.4),
    });
    y -= 40;

    // Cabeçalho da tabela
    headers.forEach((header, colIndex) => {
      currentPage.drawText(header, {
        x: margin + columnWidths.slice(0, colIndex).reduce((a, b) => a + b, 0),
        y,
        size: fontSize + 2,
        font,
        color: rgb(0, 0, 0),
      });
    });
    y -= rowHeight;

    // Linhas de dados
    for (const boleto of boletos) {
      // Verifica se precisa de nova página
      if (y < margin + rowHeight) {
        currentPage = pdfDoc.addPage([595, 842]);
        y = 800;
      }

      const rowData = [
        boleto.id.toString(),
        boleto.nome_sacado,
        boleto.lote.nome,
        `R$ ${boleto.valor.toFixed(2)}`,
        boleto.linha_digitavel,
      ];

      rowData.forEach((cell, colIndex) => {
        currentPage.drawText(cell, {
          x: margin + columnWidths.slice(0, colIndex).reduce((a, b) => a + b, 0),
          y,
          size: fontSize,
          font,
        });
      });

      y -= rowHeight;
    }

    // Rodapé
    const lastPage = pdfDoc.getPages()[pdfDoc.getPageCount() - 1];
    lastPage.drawText(`Relatório gerado em: ${new Date().toLocaleString()}`, {
      x: margin,
      y: 30,
      size: 8,
      font,
      color: rgb(0.5, 0.5, 0.5),
    });

    const pdfBytes = await pdfDoc.save();
    return Buffer.from(pdfBytes);
  }
}