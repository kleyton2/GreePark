import { Entity, PrimaryGeneratedColumn, Column, ManyToOne } from 'typeorm';
import { Lote } from '../lotes/lote.entity';

@Entity()
export class Boleto {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ length: 255 })
  nome_sacado: string;

  @ManyToOne(() => Lote, (lote) => lote.boletos)
  lote: Lote;

  @Column({ type: 'decimal', precision: 10, scale: 2 })
  valor: number;

  @Column({ length: 255 })
  linha_digitavel: string;

  @Column({ default: true })
  ativo: boolean;

  @Column({ type: 'timestamp', default: () => 'CURRENT_TIMESTAMP' })
  criado_em: Date;
}