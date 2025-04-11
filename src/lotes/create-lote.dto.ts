import { IsString, IsBoolean } from 'class-validator';

export class CreateLoteDto {
  @IsString()
  nome: string;

  @IsBoolean()
  ativo: boolean = true;
}