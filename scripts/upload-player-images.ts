import { readFileSync, writeFileSync } from 'fs';
import { join } from 'path';

const GRAPHQL_URL = 'http://localhost:4000/graphql';
const PLAYERS_FILE = join(__dirname, 'players.txt');
const IMAGES_DIR = join(__dirname, '..', 'player-images');
const FAILED_FILE = join(__dirname, 'failed-uploads.txt');

interface PlayerEntry {
  name: string; // e.g. "aleksander_angelov"
  id: string;
}

function parsePlayers(): PlayerEntry[] {
  const content = readFileSync(PLAYERS_FILE, 'utf-8');
  return content
    .split('\n')
    .filter((line) => line.trim())
    .map((line) => {
      // Format: "FirstName_LastName - uuid"
      const [namePart, id] = line.split(' - ');
      return {
        name: namePart.trim().toLowerCase(),
        id: id.trim(),
      };
    });
}

async function uploadPlayerImage(player: PlayerEntry): Promise<string | null> {
  const imagePath = join(IMAGES_DIR, `${player.name}.webp`);

  let fileBuffer: Buffer;
  try {
    fileBuffer = readFileSync(imagePath);
  } catch {
    return 'Image not found';
  }

  const fileBase64 = fileBuffer.toString('base64');

  const mutation = `
    mutation UpdatePlayer($id: String!, $updatePlayerDto: UpdatePlayerDto!) {
      updatePlayer(id: $id, updatePlayerDto: $updatePlayerDto) {
        id
        imageUrl
      }
    }
  `;

  const variables = {
    id: player.id,
    updatePlayerDto: {
      image: {
        fileBase64,
        mimeType: 'image/webp',
      },
    },
  };

  try {
    const response = await fetch(GRAPHQL_URL, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ query: mutation, variables }),
    });

    const result = await response.json();

    if (result.errors) {
      return result.errors[0].message;
    }

    console.log(`  [OK] ${player.name} -> ${result.data.updatePlayer.imageUrl}`);
    return null;
  } catch (err: any) {
    return err.message || 'Unknown error';
  }
}

async function main() {
  const players = parsePlayers();
  console.log(`Found ${players.length} players\n`);

  const failed: { name: string; id: string; reason: string }[] = [];
  let success = 0;

  for (let i = 0; i < players.length; i++) {
    const player = players[i];
    console.log(`[${i + 1}/${players.length}] ${player.name}`);

    const error = await uploadPlayerImage(player);
    if (error) {
      console.log(`  [FAIL] ${error}`);
      failed.push({ name: player.name, id: player.id, reason: error });
    } else {
      success++;
    }
  }

  console.log(`\nResults: ${success} uploaded, ${failed.length} failed`);

  if (failed.length > 0) {
    const lines = failed.map((f) => `${f.name} - ${f.id} - ${f.reason}`);
    writeFileSync(FAILED_FILE, lines.join('\n'), 'utf-8');
    console.log(`Failed uploads written to ${FAILED_FILE}`);
  }
}

main();
