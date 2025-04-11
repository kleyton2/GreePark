import { Controller, Post, UploadedFile, UseInterceptors, Get, Query, Res, Header } from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { BoletosService } from './boletos.service';
import { CsvService } from './csv.service';
import { PdfService } from './pdf.service';
import { StreamableFile } from '@nestjs/common';
import * as fs from 'fs';

@Controller('boletos')
export class BoletosController {
  constructor(
    private readonly boletosService: BoletosService,
    private readonly csvService: CsvService,
    private readonly pdfService: PdfService,
  ) {}

  @Post('importar-csv')
  @UseInterceptors(FileInterceptor('arquivo'))
  async importarCsv(@UploadedFile() arquivo: Express.Multer.File) {
    return this.csvService.processarCsv(arquivo.path);
  }

  @Post('dividir-pdf')
  @UseInterceptors(FileInterceptor('arquivo'))
  async dividirPdf(@UploadedFile() arquivo: Express.Multer.File) {
    const pastaDestino = './boletos_pdf';
    if (!fs.existsSync(pastaDestino)) fs.mkdirSync(pastaDestino, { recursive: true });
    
    await this.boletosService.getBoletosOrdenados();
    return this.pdfService.dividirPdf(arquivo.path);
  }

  @Get()
  async listar(
    @Query('nome') nome?: string,
    @Query('valor_inicial') valorInicial?: string,
    @Query('valor_final') valorFinal?: string,
    @Query('id_lote') idLote?: string,
    @Query('relatorio') relatorio?: string,
  ) {
    const boletos = await this.boletosService.listarBoletos({
      nome,
      valor_inicial: valorInicial ? parseFloat(valorInicial) : undefined,
      valor_final: valorFinal ? parseFloat(valorFinal) : undefined,
      id_lote: idLote ? parseInt(idLote) : undefined,
    });
  
    if (relatorio === '1') {
      const pdfBuffer = await this.pdfService.gerarRelatorioPdf(boletos);
      return new StreamableFile(pdfBuffer, {
        type: 'application/pdf',
        disposition: 'inline; filename=relatorio-boletos.pdf'
      });
    }
  
    return {
      success: true,
      count: boletos.length,
      data: boletos
    };
  }
}