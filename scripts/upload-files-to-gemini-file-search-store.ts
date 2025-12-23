import { GoogleGenAI } from '@google/genai';
import * as fs from 'fs';
import * as path from 'path';
import * as dotenv from 'dotenv';

dotenv.config();

async function sleep(ms: number) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

async function main() {
  const apiKey = process.env.GEMINI_API_KEY;
  const storeName = process.env.GEMINI_FILE_SEARCH_STORE_NAME;
  const directory = './files';

  if (!apiKey) throw new Error('GEMINI_API_KEY not set');
  if (!storeName) throw new Error('GEMINI_FILE_SEARCH_STORE_NAME not set');
  if (!fs.existsSync(directory)) {
    throw new Error(`Directory does not exist: ${directory}`);
  }

  // Type assertion needed due to optional peer dependency causing type resolution issues
  const GoogleGenAIClass = GoogleGenAI as new (options: { apiKey: string }) => {
    fileSearchStores: {
      uploadToFileSearchStore: (options: {
        file: string;
        fileSearchStoreName: string;
        config: { displayName: string };
      }) => Promise<{ done: boolean; error?: unknown }>;
    };
    operations: {
      get: (options: { operation: { done: boolean; error?: unknown } }) => Promise<{ done: boolean; error?: unknown }>;
    };
  };
  const client = new GoogleGenAIClass({ apiKey });

  const files = fs
    .readdirSync(directory, { withFileTypes: true })
    .filter((entry) => entry.isFile())
    .map((entry) => path.join(directory, entry.name));

  if (files.length === 0) {
    console.log(`No files found in ${directory}`);
    return;
  }

  console.log(`📂 Uploading ${files.length} file(s) to ${storeName}\n`);

  for (const filePath of files) {
    const fileName = path.basename(filePath);
    console.log(`➡️  Uploading: ${fileName}`);

    let operation = await client.fileSearchStores.uploadToFileSearchStore({
      file: filePath,
      fileSearchStoreName: storeName,
      config: {
        displayName: fileName,
      },
    });

    // Poll until indexing completes
    while (!operation.done) {
      console.log(`   ⏳ Indexing ${fileName}...`);
      await sleep(3000);
      operation = await client.operations.get({ operation });
    }

    if (operation.error) {
      console.error(`   ❌ Failed: ${fileName}`);
      console.error(operation.error);
    } else {
      console.log(`   ✅ Indexed: ${fileName}`);
    }

    console.log('-----------------------------------');
  }

  console.log('🎉 All files processed');
}

main().catch((err) => {
  console.error('Fatal error:', err);
  process.exit(1);
});
