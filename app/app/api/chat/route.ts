import { streamText } from 'ai';
import { getAIModel, getSystemPrompt } from '@/lib/ai/providers';

export const runtime = 'edge';
export const maxDuration = 60;

export async function POST(req: Request) {
  try {
    const { messages, modelId, contextMode } = await req.json();

    if (!messages || !Array.isArray(messages)) {
      return new Response('Invalid messages format', { status: 400 });
    }

    const model = getAIModel(modelId || 'gpt-4o');
    const systemPrompt = getSystemPrompt(contextMode);

    const result = await streamText({
      model,
      system: systemPrompt,
      messages,
      maxTokens: 4096,
      temperature: 0.7,
    });

    return result.toDataStreamResponse();
  } catch (error) {
    console.error('Chat API error:', error);
    return new Response(JSON.stringify({ error: 'Failed to process request' }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' },
    });
  }
}
