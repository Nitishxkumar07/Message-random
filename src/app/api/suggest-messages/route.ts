// app/api/suggest-messages/route.ts
import { google } from '@ai-sdk/google';
import { streamText } from 'ai';

export const maxDuration = 30;

const SYSTEM_PROMPT =
  'You generate conversation-starter questions for an anonymous social messaging platform. ' +
  "Respond with ONLY a single line of plain text: exactly three questions separated by '||'. " +
  'No numbering, no quotes, no markdown, no preamble, no trailing text.';

const USER_PROMPT =
  "Create a list of three open-ended and engaging questions formatted as a single string. " +
  "Each question should be separated by '||'. These questions are for an anonymous social messaging platform, " +
  'like Qooh.me, and should be suitable for a diverse audience. Avoid personal or sensitive topics, ' +
  'focusing instead on universal themes that encourage friendly interaction. ' +
  "For example, your output should be structured like this: " +
  "'What's a hobby you've recently started?||If you could have dinner with any historical figure, who would it be?||What's a simple thing that makes you happy?'. " +
  'Ensure the questions are intriguing, foster curiosity, and contribute to a positive and welcoming conversational environment.';

export async function POST() {
  if (!process.env.GOOGLE_GENERATIVE_AI_API_KEY) {
    return Response.json(
      { error: 'Missing GOOGLE_GENERATIVE_AI_API_KEY' },
      { status: 500 }
    );
  }

  try {
    const result = streamText({
      model: google('gemini-2.5-flash'),
      system: SYSTEM_PROMPT,
      prompt: USER_PROMPT,
      temperature: 1,          // higher = more varied suggestions each call
      maxOutputTokens: 200,    // three short questions don't need more
      onError: ({ error }) => {
        // Errors during streaming land here, not in the catch block
        console.error('Gemini stream error:', error);
      },
    });

    return result.toTextStreamResponse({
      headers: { 'Cache-Control': 'no-store' },
    });
  } catch (error) {
    console.error('Error starting Gemini stream:', error);
    return Response.json(
      { error: 'Failed to stream from Gemini 2.5 Flash' },
      { status: 500 }
    );
  }
}