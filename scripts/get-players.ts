import { DataSource } from 'typeorm';
import { writeFileSync } from 'fs';
import { join } from 'path';

const dataSource = new DataSource({
  type: 'postgres',
  host: 'aws-1-eu-central-1.pooler.supabase.com',
  port: 5432,
  username: 'postgres.qlhpnyxosnoaqqjabuar',
  password: 'SmgCup!123',
  database: 'postgres',
});

async function main() {
  await dataSource.initialize();

  const players = await dataSource.query('SELECT id, first_name, last_name FROM player ORDER BY last_name, first_name');

  const lines = players.map((p: any) => `${p.first_name}_${p.last_name} - ${p.id}`);
  const output = lines.join('\n');

  const filePath = join(__dirname, 'players.txt');
  writeFileSync(filePath, output, 'utf-8');
  console.log(`Wrote ${players.length} players to ${filePath}`);

  await dataSource.destroy();
}

main();
