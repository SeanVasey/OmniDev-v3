import { streamText } from 'ai';
import { getAIModel, getSystemPrompt } from '@/lib/ai/providers';
import { isProviderConfigured, getMissingProviderMessage } from '@/lib/env';
import { getModel } from '@/lib/ai/models';

export const runtime = 'edge';
export const maxDuration = 60;

export async function POST(req: Request) {
  try {
    const { messages, modelId, contextMode } = await req.json();

    if (!messages || !Array.isArray(messages)) {
      return new Response(JSON.stringify({ error: 'Invalid messages format' }), {
        status: 400,
        headers: { 'Content-Type': 'application/json' },
      });
    }

    // Get model configuration
    const modelConfig = getModel(modelId || 'gpt-4o');
    if (!modelConfig) {
      return new Response(JSON.stringify({ error: `Model ${modelId} not found` }), {
        status: 400,
        headers: { 'Content-Type': 'application/json' },
      });
    }

    // Check if provider is configured
    if (!isProviderConfigured(modelConfig.provider)) {
      const message = getMissingProviderMessage(modelConfig.provider);
      return new Response(JSON.stringify({ error: message }), {
        status: 503,
        headers: { 'Content-Type': 'application/json' },
      });
    }

    const model = getAIModel(modelId || 'gpt-4o');
    const systemPrompt = getSystemPrompt(contextMode);

    const result = await streamText({
      model: model as any,
      system: systemPrompt,
      messages,
      maxTokens: 4096,
      temperature: 0.7,
    });

    return result.toDataStreamResponse();
  } catch (error) {
    console.error('Chat API error:', error);

    // Handle specific error types
    let errorMessage = 'Failed to process request';
    let statusCode = 500;

    if (error instanceof Error) {
      // API key errors
      if (error.message.includes('API key') || error.message.includes('401')) {
        errorMessage = 'Invalid or missing API key. Please check your configuration.';
        statusCode = 401;
      }
      // Rate limit errors
      else if (error.message.includes('rate limit') || error.message.includes('429')) {
        errorMessage = 'Rate limit exceeded. Please try again later.';
        statusCode = 429;
      }
      // Timeout errors
      else if (error.message.includes('timeout') || error.message.includes('ETIMEDOUT')) {
        errorMessage = 'Request timed out. Please try again.';
        statusCode = 504;
      }
      // Model not found
      else if (error.message.includes('model') && error.message.includes('not found')) {
        errorMessage = 'Selected model is not available. Please try a different model.';
        statusCode = 404;
      }
      // Generic error with message
      else if (error.message) {
        errorMessage = `Error: ${error.message}`;
      }
    }

    return new Response(JSON.stringify({ error: errorMessage }), {
      status: statusCode,
      headers: { 'Content-Type': 'application/json' },
    });
  }
}
