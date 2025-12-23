import { GoogleGenAI } from '@google/genai';

async function main() {
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) {
    throw new Error('GEMINI_API_KEY is not set');
  }

  // Type assertion needed due to optional peer dependency causing type resolution issues
  const GoogleGenAIClass = GoogleGenAI as new (options: { apiKey: string }) => {
    fileSearchStores: {
      create: (options: { config: { displayName: string } }) => Promise<{ name: string; displayName: string }>;
    };
  };
  const client = new GoogleGenAIClass({ apiKey });

  // Choose a human-friendly name
  const displayName = 'research-papers-store';

  // Create the store
  const store = await client.fileSearchStores.create({
    config: {
      displayName,
      // Optional: you can later add metadata, chunkingConfig, etc.
      // chunkingConfig: { chunkSizeTokens: 800, chunkOverlapTokens: 200 }
    },
  });

  console.log('Created File Search store:');
  console.log('  name:', store.name); // <-- this is the ID you’ll reuse
  console.log('  displayName:', store.displayName);
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
