import { DataSource } from 'typeorm';
import * as fs from 'fs';
import * as path from 'path';

async function main() {
  const dataSource = new DataSource({
    type: 'postgres',
    host: process.env.DB_HOST || 'aws-1-eu-central-1.pooler.supabase.com',
    port: parseInt(process.env.DB_PORT || '5432', 10),
    username: process.env.DB_USERNAME || 'postgres.qlhpnyxosnoaqqjabuar',
    password: process.env.DB_PASSWORD || 'SmgCup!123',
    database: process.env.DB_DATABASE || 'postgres',
  });

  await dataSource.initialize();

  const matchEvents = await dataSource.query('SELECT * FROM match_event ORDER BY created_at ASC');

  const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
  const backupsDir = path.join(__dirname, '..', 'backups');

  if (!fs.existsSync(backupsDir)) {
    fs.mkdirSync(backupsDir, { recursive: true });
  }

  const filename = `match-events-${timestamp}.json`;
  const filepath = path.join(backupsDir, filename);

  fs.writeFileSync(filepath, JSON.stringify(matchEvents, null, 2));

  console.log(`Backed up ${matchEvents.length} match events to ${filepath}`);

  await dataSource.destroy();
}

main().catch((err) => {
  console.error('Backup failed:', err);
  process.exit(1);
});
