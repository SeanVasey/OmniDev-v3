import { NextRequest, NextResponse } from 'next/server';
import OpenAI from 'openai';
import { isProviderConfigured } from '@/lib/env';

export const runtime = 'edge';
export const maxDuration = 60;

export async function POST(req: NextRequest) {
  try {
    const { prompt, aspectRatio = '1:1', quality = 'standard', style = 'vivid' } = await req.json();

    if (!prompt) {
      return NextResponse.json({ error: 'Prompt is required' }, { status: 400 });
    }

    // Check if OpenAI API key is configured
    if (!isProviderConfigured('openai')) {
      return NextResponse.json(
        {
          error:
            'OpenAI API key not configured. Please set OPENAI_API_KEY in your .env.local file.',
        },
        { status: 503 }
      );
    }

    const apiKey = process.env.OPENAI_API_KEY;
    if (!apiKey) {
      return NextResponse.json(
        { error: 'OpenAI API key not configured' },
        { status: 500 }
      );
    }

    const openai = new OpenAI({ apiKey });

    // Map aspect ratio to DALL·E 3 size
    const sizeMap: Record<string, '1024x1024' | '1792x1024' | '1024x1792'> = {
      '1:1': '1024x1024',
      '16:9': '1792x1024',
      '9:16': '1024x1792',
    };

    const size = sizeMap[aspectRatio] || '1024x1024';

    // Generate image using DALL·E 3
    const response = await openai.images.generate({
      model: 'dall-e-3',
      prompt: prompt,
      n: 1,
      size: size,
      quality: quality as 'standard' | 'hd',
      style: style as 'vivid' | 'natural',
      response_format: 'url',
    });

    if (!response.data || response.data.length === 0) {
      throw new Error('No image data returned from DALL·E 3');
    }

    const imageUrl = response.data[0]?.url;
    const revisedPrompt = response.data[0]?.revised_prompt;

    if (!imageUrl) {
      throw new Error('No image URL returned from DALL·E 3');
    }

    return NextResponse.json({
      success: true,
      imageUrl,
      revisedPrompt,
      size,
      quality,
      style,
    });
  } catch (error: any) {
    console.error('Image generation error:', error);

    // Handle specific OpenAI errors
    if (error?.error?.code === 'content_policy_violation') {
      return NextResponse.json(
        {
          error:
            'Your request was rejected due to content policy violations. Please modify your prompt.',
        },
        { status: 400 }
      );
    }

    if (error?.status === 401 || error?.error?.code === 'invalid_api_key') {
      return NextResponse.json(
        { error: 'OpenAI API key is invalid. Please check your configuration.' },
        { status: 401 }
      );
    }

    if (error?.status === 429 || error?.error?.code === 'rate_limit_exceeded') {
      return NextResponse.json(
        { error: 'Rate limit exceeded. Please try again later.' },
        { status: 429 }
      );
    }

    if (error?.status === 503 || error?.error?.code === 'model_overloaded') {
      return NextResponse.json(
        { error: 'DALL·E 3 is currently overloaded. Please try again in a moment.' },
        { status: 503 }
      );
    }

    return NextResponse.json(
      {
        error:
          error?.message || error?.error?.message || 'Failed to generate image. Please try again.',
      },
      { status: error?.status || 500 }
    );
  }
}
