export type GeminiStreamPayload = {
  geminiFileSearchPromptStream: {
    subscriptionId: string;
    chunk: { text: string; done?: boolean };
  };
};
