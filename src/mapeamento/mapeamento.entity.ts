import { Entity, PrimaryGeneratedColumn, Column } from 'typeorm';

@Entity()
export class Mapeamento {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ length: 50, unique: true })
  nome_externo: string;

  @Column()
  id_lote: number;

  @Column()
  ordem: number;
}