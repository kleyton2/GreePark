import { MigrationInterface, QueryRunner } from "typeorm";

export class CreateLotes implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
      CREATE TABLE lotes (
        id SERIAL PRIMARY KEY,
        nome VARCHAR(100) NOT NULL,
        ativo BOOLEAN NOT NULL DEFAULT TRUE,
        criado_em TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
      );

      -- Índice para melhorar buscas por nome
      CREATE INDEX idx_lotes_nome ON lotes(nome);
    `);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
      DROP INDEX IF EXISTS idx_lotes_nome;
      DROP TABLE lotes CASCADE;
    `);
  }
}