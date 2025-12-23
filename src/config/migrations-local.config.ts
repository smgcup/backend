import { DataSource } from 'typeorm';

export default new DataSource({
  type: 'postgres',
  host: 'aws-1-eu-central-1.pooler.supabase.com',
  port: 5432,
  username: 'postgres.syaspxqmzugybgoftbhg',
  password: 'Amatr@123!',
  database: 'postgres', // Don't forget to put the name of your init.sql database here
  migrations: ['src/db/migrations/*{.ts,.js}'],
  entities: ['src/**/*.entity{.ts,.js}'],
  logging: process.env.DB_LOG === 'true',
});
