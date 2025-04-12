import { MigrationInterface, QueryRunner } from "typeorm";

export class CreateMapeamento implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
      CREATE TABLE mapeamento (
        id SERIAL PRIMARY KEY,
        nome_externo VARCHAR(50) NOT NULL UNIQUE,
        id_lote INTEGER NOT NULL,
        ordem INTEGER NOT NULL,
        criado_em TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        CONSTRAINT fk_mapeamento_lote
          FOREIGN KEY (id_lote)
          REFERENCES lotes(id)
          ON DELETE CASCADE,
        CONSTRAINT uq_ordem UNIQUE (ordem) -- Garante ordem única se necessário
      );

      CREATE INDEX idx_mapeamento_nome_externo ON mapeamento(nome_externo);
      CREATE INDEX idx_mapeamento_lote ON mapeamento(id_lote);
    `);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
      DROP INDEX IF EXISTS idx_mapeamento_nome_externo;
      DROP INDEX IF EXISTS idx_mapeamento_lote;
      DROP TABLE mapeamento CASCADE;
    `);
  }
}