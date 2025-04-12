import { DataSource } from 'typeorm';
import { ConfigService } from '@nestjs/config';
import { config } from 'dotenv';
import { Lotes } from './src/lotes/lote.entity';
import { Boleto } from './src/boletos/boleto.entity';
import { Mapeamento } from './src/mapeamento/mapeamento.entity';

config();
const configService = new ConfigService();

export const AppDataSource = new DataSource({
  type: 'postgres',
  host: configService.get('DB_HOST', 'localhost'),
  port: configService.get('DB_PORT', 5432),
  username: configService.get('DB_USER', 'postgres'),
  password: configService.get('DB_PASSWORD', 'postgres'),
  database: configService.get('DB_NAME', 'green_park'),
  entities: [Lotes, Boleto, Mapeamento],
  migrations: [__dirname + '/src/migrations/*{.ts,.js}'],
  logging: configService.get('DB_LOGGING', true),
});