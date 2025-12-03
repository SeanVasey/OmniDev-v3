'use client';

import { useState } from 'react';
import { toast } from 'sonner';

export interface VideoGenerationResult {
  success: boolean;
  videoUrl?: string;
  thumbnailUrl?: string;
  duration?: number;
  revisedPrompt?: string;
  error?: string;
}

export function useVideoGeneration() {
  const [isGenerating, setIsGenerating] = useState(false);
  const [progress, setProgress] = useState(0);

  const generateVideo = async (
    prompt: string,
    options?: {
      duration?: number; // Duration in seconds
      aspectRatio?: '16:9' | '9:16' | '1:1';
      style?: 'cinematic' | 'animation' | 'realistic';
      sourceImage?: File; // For image-to-video
    }
  ): Promise<VideoGenerationResult> => {
    if (!prompt.trim() && !options?.sourceImage) {
      toast.error('Please provide a prompt or source image');
      return { success: false, error: 'No prompt or image provided' };
    }

    setIsGenerating(true);
    setProgress(0);

    try {
      // Simulate progress updates
      const progressInterval = setInterval(() => {
        setProgress((prev) => Math.min(prev + 10, 90));
      }, 1000);

      const formData = new FormData();
      formData.append('prompt', prompt);
      if (options?.duration) formData.append('duration', options.duration.toString());
      if (options?.aspectRatio) formData.append('aspectRatio', options.aspectRatio);
      if (options?.style) formData.append('style', options.style);
      if (options?.sourceImage) formData.append('image', options.sourceImage);

      const response = await fetch('/api/generate-video', {
        method: 'POST',
        body: formData,
      });

      clearInterval(progressInterval);
      setProgress(100);

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Failed to generate video');
      }

      toast.success('Video generated successfully!');
      return {
        success: true,
        ...data,
      };
    } catch (error) {
      console.error('Video generation error:', error);
      const errorMessage = error instanceof Error ? error.message : 'Failed to generate video';
      toast.error(errorMessage);
      return {
        success: false,
        error: errorMessage,
      };
    } finally {
      setIsGenerating(false);
      setTimeout(() => setProgress(0), 1000);
    }
  };

  return {
    generateVideo,
    isGenerating,
    progress,
  };
}
