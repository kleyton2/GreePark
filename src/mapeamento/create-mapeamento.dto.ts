import { IsString, IsNumber } from 'class-validator';

export class CreateMapeamentoDto {
  @IsString()
  nome_externo: string;

  @IsNumber()
  id_lote: number;

  @IsNumber()
  ordem: number;
}