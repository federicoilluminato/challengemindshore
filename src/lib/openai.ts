import 'server-only';

import OpenAI from 'openai';

export function getOpenAIClient() {
  const apiKey = process.env.OPENAI_API_KEY;

  if (!apiKey || apiKey.includes('your-openai-api-key')) {
    return null;
  }

  return new OpenAI({ apiKey });
}
