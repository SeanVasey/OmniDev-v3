import { NextRequest, NextResponse } from 'next/server';
import OpenAI from 'openai';
import { isProviderConfigured } from '@/lib/env';

export const runtime = 'edge';
export const maxDuration = 300; // 5 minutes for video generation

export async function POST(req: NextRequest) {
  try {
    const formData = await req.formData();
    const prompt = formData.get('prompt') as string;
    const duration = parseInt(formData.get('duration') as string) || 5;
    const aspectRatio = (formData.get('aspectRatio') as string) || '16:9';
    const style = (formData.get('style') as string) || 'cinematic';
    const sourceImage = formData.get('image') as File | null;

    if (!prompt && !sourceImage) {
      return NextResponse.json({ error: 'Prompt or source image is required' }, { status: 400 });
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

    const openai = new OpenAI({
      apiKey: process.env.OPENAI_API_KEY!,
    });

    // Note: This is a placeholder for Sora API integration
    // The actual Sora API endpoints may differ when officially released
    // For now, we'll return a mock response structure

    // Map aspect ratio to resolution
    const resolutionMap: Record<string, { width: number; height: number }> = {
      '16:9': { width: 1920, height: 1080 },
      '9:16': { width: 1080, height: 1920 },
      '1:1': { width: 1080, height: 1080 },
    };

    const resolution = resolutionMap[aspectRatio] || resolutionMap['16:9'];

    // Placeholder for actual Sora API call
    // const response = await openai.videos.generate({
    //   model: 'sora-2',
    //   prompt: prompt,
    //   duration: duration,
    //   width: resolution.width,
    //   height: resolution.height,
    //   style: style,
    //   image: sourceImage ? await sourceImage.arrayBuffer() : undefined,
    // });

    // Mock response for development
    // In production, replace this with actual API call
    return NextResponse.json({
      success: true,
      videoUrl: 'https://example.com/placeholder-video.mp4',
      thumbnailUrl: 'https://example.com/placeholder-thumbnail.jpg',
      duration: duration,
      revisedPrompt: `${style} video: ${prompt}`,
      message:
        'Sora API integration pending. This is a placeholder response. Once OpenAI releases Sora API, this endpoint will be updated.',
    });
  } catch (error: any) {
    console.error('Video generation error:', error);

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
        {
          error: 'Video generation service is currently overloaded. Please try again in a moment.',
        },
        { status: 503 }
      );
    }

    return NextResponse.json(
      {
        error:
          error?.message || error?.error?.message || 'Failed to generate video. Please try again.',
      },
      { status: error?.status || 500 }
    );
  }
}
