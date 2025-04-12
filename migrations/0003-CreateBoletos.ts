import { MigrationInterface, QueryRunner } from "typeorm";

export class CreateBoletos implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
      CREATE TABLE boletos (
        id SERIAL PRIMARY KEY,
        nome_sacado VARCHAR(255) NOT NULL,
        lote INTEGER NOT NULL,
        valor DECIMAL(10,2) NOT NULL,
        linha_digitavel VARCHAR(255) NOT NULL,
        ativo BOOLEAN NOT NULL DEFAULT TRUE,
        criado_em TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
        CONSTRAINT fk_boletos_lote 
          FOREIGN KEY (id_lote) 
          REFERENCES lotes(id)
          ON DELETE CASCADE
      );

      CREATE INDEX idx_boletos_lote ON boletos(id_lote);
      CREATE INDEX idx_boletos_nome_sacado ON boletos(nome_sacado);
    `);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
      DROP INDEX IF EXISTS idx_boletos_lote;
      DROP INDEX IF EXISTS idx_boletos_nome_sacado;
      DROP TABLE boletos CASCADE;
    `);
  }
}