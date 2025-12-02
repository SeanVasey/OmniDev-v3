'use client';

import { useState } from 'react';
import { toast } from 'sonner';
import type { AspectRatio } from '@/types';

export interface GeneratedImage {
  imageUrl: string;
  revisedPrompt?: string;
  size: string;
  quality: string;
  style: string;
}

export function useImageGeneration() {
  const [isGenerating, setIsGenerating] = useState(false);
  const [generatedImage, setGeneratedImage] = useState<GeneratedImage | null>(null);

  /**
   * Generate an image using DALL·E 3
   */
  const generateImage = async (
    prompt: string,
    aspectRatio: AspectRatio = '1:1',
    quality: 'standard' | 'hd' = 'standard',
    style: 'vivid' | 'natural' = 'vivid'
  ): Promise<GeneratedImage | null> => {
    if (!prompt.trim()) {
      toast.error('Please provide a prompt for image generation');
      return null;
    }

    setIsGenerating(true);
    toast.info('Generating image...', {
      description: 'This may take a few moments',
    });

    try {
      const response = await fetch('/api/generate-image', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          prompt,
          aspectRatio,
          quality,
          style,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Failed to generate image');
      }

      const result: GeneratedImage = {
        imageUrl: data.imageUrl,
        revisedPrompt: data.revisedPrompt,
        size: data.size,
        quality: data.quality,
        style: data.style,
      };

      setGeneratedImage(result);
      toast.success('Image generated successfully!');

      return result;
    } catch (error) {
      console.error('Image generation error:', error);
      toast.error('Failed to generate image', {
        description: error instanceof Error ? error.message : 'Unknown error',
      });
      return null;
    } finally {
      setIsGenerating(false);
    }
  };

  /**
   * Clear the generated image
   */
  const clearImage = () => {
    setGeneratedImage(null);
  };

  /**
   * Download the generated image
   */
  const downloadImage = async (imageUrl: string, filename: string = 'generated-image.png') => {
    try {
      const response = await fetch(imageUrl);
      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = filename;
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);
      toast.success('Image downloaded');
    } catch (error) {
      console.error('Download error:', error);
      toast.error('Failed to download image');
    }
  };

  return {
    generateImage,
    isGenerating,
    generatedImage,
    clearImage,
    downloadImage,
  };
}
