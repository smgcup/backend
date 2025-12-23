"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const genai_1 = require("@google/genai");
async function main() {
    const apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey) {
        throw new Error('GEMINI_API_KEY is not set');
    }
    const GoogleGenAIClass = genai_1.GoogleGenAI;
    const client = new GoogleGenAIClass({ apiKey });
    const displayName = 'research-papers-store';
    const store = await client.fileSearchStores.create({
        config: {
            displayName,
        },
    });
    console.log('Created File Search store:');
    console.log('  name:', store.name);
    console.log('  displayName:', store.displayName);
}
main().catch((err) => {
    console.error(err);
    process.exit(1);
});
//# sourceMappingURL=create-file-search-store.js.map