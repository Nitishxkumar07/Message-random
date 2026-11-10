// src/app/api/suggest-messages/route.ts
import { google } from '@ai-sdk/google';
import { streamText } from 'ai';

export const maxDuration = 30;

// 👇 Put your custom message here
const CUSTOM_MESSAGE =
  'Give 3 short, friendly, open-ended questions for an anonymous messaging app. Avoid personal or sensitive topics.';

const SYSTEM_PROMPT =
  "Output only 3 questions on one line, separated by '||'. No numbering, quotes, markdown or extra text.";

const FALLBACK =
  "What's a hobby you've recently started?||" +
  'If you could have dinner with any historical figure, who would it be?||' +
  "What's a simple thing that makes you happy?";

export async function POST() {
  if (!process.env.GOOGLE_GENERATIVE_AI_API_KEY) {
    return new Response('Missing GOOGLE_GENERATIVE_AI_API_KEY in .env', { status: 500 });
  }

  const result = streamText({
    model: google('gemini-3.5-flash-lite'),
    system: SYSTEM_PROMPT,
    prompt: CUSTOM_MESSAGE,
    maxOutputTokens: 200,
    providerOptions: {
      google: { thinkingConfig: { thinkingLevel: 'minimal' } },
    },
    onError: ({ error }) => {
      console.error('Gemini stream error:', error);
    },
  });

  const encoder = new TextEncoder();

  const stream = new ReadableStream({
    async start(controller) {
      let sentText = false;
      try {
        for await (const chunk of result.textStream) {
          if (chunk) {
            sentText = true;
            controller.enqueue(encoder.encode(chunk));
          }
        }
      } catch (error) {
        console.error('Suggestion stream crashed:', error);
      }

      if (!sentText) {
        controller.enqueue(encoder.encode(FALLBACK));
      }
      controller.close();
    },
  });

  return new Response(stream, {
    headers: {
      'Content-Type': 'text/plain; charset=utf-8',
      'Cache-Control': 'no-store',
    },
  });
}