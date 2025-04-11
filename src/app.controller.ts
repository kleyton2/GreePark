import { Controller, Get } from '@nestjs/common';
import { ApiOperation, ApiResponse, ApiTags } from '@nestjs/swagger';

@ApiTags('Sistema')
@Controller()
export class AppController {
  @Get()
  @ApiOperation({ summary: 'Verificar status da API' })
  @ApiResponse({ status: 200, description: 'API operacional' })
  getStatus() {
    return {
      status: 'online',
      message: 'Sistema de Boletos do Condomínio Green Park',
      version: '1.0',
      docs: '/api',
    };
  }

  @Get('healthcheck')
  @ApiOperation({ summary: 'Verificar saúde da aplicação' })
  @ApiResponse({ status: 200, description: 'Aplicação saudável' })
  healthCheck() {
    return { status: 'healthy' };
  }
}