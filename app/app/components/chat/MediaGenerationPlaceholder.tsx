'use client';

import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Image as ImageIcon, Video, Loader2 } from 'lucide-react';
import { cn } from '@/lib/utils';
import type { AspectRatio } from '@/types';

interface MediaGenerationPlaceholderProps {
  type: 'image' | 'video';
  aspectRatio?: AspectRatio;
  progress?: number; // 0-100
  prompt?: string;
  previewUrl?: string;
  isComplete?: boolean;
  className?: string;
}

// Aspect ratio to CSS values
const aspectRatioMap: Record<AspectRatio, { width: string; paddingBottom: string }> = {
  '1:1': { width: '100%', paddingBottom: '100%' },
  '3:4': { width: '100%', paddingBottom: '133.33%' },
  '4:3': { width: '100%', paddingBottom: '75%' },
  '16:9': { width: '100%', paddingBottom: '56.25%' },
  '9:16': { width: '56.25%', paddingBottom: '100%' },
};

export function MediaGenerationPlaceholder({
  type,
  aspectRatio = '1:1',
  progress = 0,
  prompt,
  previewUrl,
  isComplete = false,
  className,
}: MediaGenerationPlaceholderProps) {
  const [animationPhase, setAnimationPhase] = useState(0);

  // Cycle through animation phases
  useEffect(() => {
    if (!isComplete) {
      const interval = setInterval(() => {
        setAnimationPhase((prev) => (prev + 1) % 360);
      }, 50);
      return () => clearInterval(interval);
    }
  }, [isComplete]);

  const ratioStyles = aspectRatioMap[aspectRatio];
  const Icon = type === 'image' ? ImageIcon : Video;

  return (
    <div
      className={cn(
        'relative rounded-2xl overflow-hidden',
        'border border-[var(--border-subtle)]',
        'shadow-xl shadow-black/20',
        className
      )}
      style={{ width: ratioStyles.width, maxWidth: '400px' }}
    >
      {/* Aspect ratio container */}
      <div style={{ paddingBottom: ratioStyles.paddingBottom }} className="relative">
        {/* Base dark background */}
        <div className="absolute inset-0 bg-[var(--bg-muted)]" />

        {/* Oil-slick swirling effect */}
        <div className="absolute inset-0 overflow-hidden">
          {/* Primary oil slick gradient */}
          <motion.div
            className="absolute inset-0"
            style={{
              background: `
                radial-gradient(ellipse at ${30 + Math.sin(animationPhase * 0.02) * 20}% ${40 + Math.cos(animationPhase * 0.015) * 20}%,
                  rgba(139, 92, 246, 0.4) 0%,
                  transparent 50%),
                radial-gradient(ellipse at ${70 + Math.cos(animationPhase * 0.018) * 20}% ${60 + Math.sin(animationPhase * 0.022) * 20}%,
                  rgba(59, 130, 246, 0.4) 0%,
                  transparent 50%),
                radial-gradient(ellipse at ${50 + Math.sin(animationPhase * 0.025) * 30}% ${30 + Math.cos(animationPhase * 0.02) * 20}%,
                  rgba(6, 182, 212, 0.4) 0%,
                  transparent 50%),
                radial-gradient(ellipse at ${40 + Math.cos(animationPhase * 0.012) * 25}% ${70 + Math.sin(animationPhase * 0.028) * 15}%,
                  rgba(236, 72, 153, 0.3) 0%,
                  transparent 50%),
                radial-gradient(ellipse at ${60 + Math.sin(animationPhase * 0.03) * 15}% ${50 + Math.cos(animationPhase * 0.017) * 25}%,
                  rgba(16, 185, 129, 0.3) 0%,
                  transparent 50%)
              `,
              filter: 'blur(30px)',
            }}
          />

          {/* Secondary swirl layer */}
          <motion.div
            className="absolute inset-0"
            style={{
              background: `
                conic-gradient(
                  from ${animationPhase}deg at 50% 50%,
                  rgba(139, 92, 246, 0.15),
                  rgba(59, 130, 246, 0.15),
                  rgba(6, 182, 212, 0.15),
                  rgba(16, 185, 129, 0.15),
                  rgba(236, 72, 153, 0.15),
                  rgba(139, 92, 246, 0.15)
                )
              `,
              filter: 'blur(20px)',
            }}
          />

          {/* Noise texture overlay for oil-slick effect */}
          <div
            className="absolute inset-0 opacity-30"
            style={{
              backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 200 200' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noiseFilter'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noiseFilter)'/%3E%3C/svg%3E")`,
              mixBlendMode: 'overlay',
            }}
          />
        </div>

        {/* Digital circuit grid overlay */}
        <div className="absolute inset-0">
          <svg className="w-full h-full opacity-20" viewBox="0 0 100 100" preserveAspectRatio="none">
            <defs>
              {/* Grid pattern */}
              <pattern id="circuitGrid" x="0" y="0" width="10" height="10" patternUnits="userSpaceOnUse">
                <path
                  d="M 10 0 L 0 0 0 10"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="0.3"
                  className="text-cyan-400"
                />
              </pattern>

              {/* Circuit nodes */}
              <pattern id="circuitNodes" x="0" y="0" width="20" height="20" patternUnits="userSpaceOnUse">
                <circle cx="0" cy="0" r="0.8" fill="currentColor" className="text-purple-400" />
                <circle cx="20" cy="0" r="0.8" fill="currentColor" className="text-cyan-400" />
                <circle cx="0" cy="20" r="0.8" fill="currentColor" className="text-blue-400" />
                <circle cx="20" cy="20" r="0.8" fill="currentColor" className="text-purple-400" />
                <circle cx="10" cy="10" r="1" fill="currentColor" className="text-pink-400" />
              </pattern>

              {/* Animated glow filter */}
              <filter id="glow" x="-50%" y="-50%" width="200%" height="200%">
                <feGaussianBlur stdDeviation="1" result="coloredBlur" />
                <feMerge>
                  <feMergeNode in="coloredBlur" />
                  <feMergeNode in="SourceGraphic" />
                </feMerge>
              </filter>
            </defs>

            {/* Base grid */}
            <rect width="100" height="100" fill="url(#circuitGrid)" />

            {/* Circuit nodes */}
            <rect width="100" height="100" fill="url(#circuitNodes)" />

            {/* Animated circuit traces */}
            <g filter="url(#glow)" className="text-cyan-400">
              <motion.line
                x1="0" y1="50" x2="100" y2="50"
                stroke="currentColor"
                strokeWidth="0.5"
                strokeDasharray="5 5"
                initial={{ strokeDashoffset: 0 }}
                animate={{ strokeDashoffset: -10 }}
                transition={{ duration: 1, repeat: Infinity, ease: 'linear' }}
              />
              <motion.line
                x1="50" y1="0" x2="50" y2="100"
                stroke="currentColor"
                strokeWidth="0.5"
                strokeDasharray="5 5"
                initial={{ strokeDashoffset: 0 }}
                animate={{ strokeDashoffset: -10 }}
                transition={{ duration: 1, repeat: Infinity, ease: 'linear' }}
              />
            </g>

            {/* Pulsing nodes at intersections */}
            <motion.circle
              cx="25" cy="25" r="1.5"
              fill="currentColor"
              className="text-purple-400"
              animate={{ opacity: [0.3, 1, 0.3], scale: [0.8, 1.2, 0.8] }}
              transition={{ duration: 2, repeat: Infinity }}
            />
            <motion.circle
              cx="75" cy="25" r="1.5"
              fill="currentColor"
              className="text-cyan-400"
              animate={{ opacity: [1, 0.3, 1], scale: [1.2, 0.8, 1.2] }}
              transition={{ duration: 2, repeat: Infinity }}
            />
            <motion.circle
              cx="25" cy="75" r="1.5"
              fill="currentColor"
              className="text-blue-400"
              animate={{ opacity: [0.5, 1, 0.5], scale: [1, 1.3, 1] }}
              transition={{ duration: 1.5, repeat: Infinity }}
            />
            <motion.circle
              cx="75" cy="75" r="1.5"
              fill="currentColor"
              className="text-pink-400"
              animate={{ opacity: [1, 0.5, 1], scale: [1.2, 1, 1.2] }}
              transition={{ duration: 1.8, repeat: Infinity }}
            />
          </svg>

          {/* Additional animated circuit lines */}
          <motion.div
            className="absolute inset-0"
            style={{
              background: `
                linear-gradient(90deg, transparent 49.5%, rgba(6, 182, 212, 0.3) 50%, transparent 50.5%),
                linear-gradient(0deg, transparent 49.5%, rgba(139, 92, 246, 0.3) 50%, transparent 50.5%)
              `,
            }}
            animate={{
              opacity: [0.2, 0.4, 0.2],
            }}
            transition={{
              duration: 2,
              repeat: Infinity,
              ease: 'easeInOut',
            }}
          />
        </div>

        {/* Preview image fading in */}
        {previewUrl && (
          <motion.div
            className="absolute inset-0"
            initial={{ opacity: 0 }}
            animate={{ opacity: progress / 100 }}
            style={{
              backgroundImage: `url(${previewUrl})`,
              backgroundSize: 'cover',
              backgroundPosition: 'center',
            }}
          />
        )}

        {/* Center content */}
        <div className="absolute inset-0 flex flex-col items-center justify-center z-10">
          {/* Icon with glow */}
          <motion.div
            className={cn(
              'relative w-16 h-16 rounded-2xl flex items-center justify-center',
              'bg-gradient-to-br from-purple-500/20 to-cyan-500/20',
              'border border-white/10 backdrop-blur-sm',
              'shadow-lg shadow-purple-500/20'
            )}
            animate={
              !isComplete
                ? {
                    scale: [1, 1.05, 1],
                    boxShadow: [
                      '0 0 20px rgba(139, 92, 246, 0.3)',
                      '0 0 40px rgba(139, 92, 246, 0.5)',
                      '0 0 20px rgba(139, 92, 246, 0.3)',
                    ],
                  }
                : {}
            }
            transition={{ duration: 2, repeat: Infinity }}
          >
            {isComplete ? (
              <Icon className="w-8 h-8 text-white" />
            ) : (
              <Loader2 className="w-8 h-8 text-white animate-spin" />
            )}
          </motion.div>

          {/* Progress text */}
          <motion.div
            className="mt-4 text-center"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
          >
            <div className="text-2xl font-bold text-white mb-1">
              {isComplete ? '100%' : `${Math.round(progress)}%`}
            </div>
            <div className="text-sm text-white/70">
              {isComplete
                ? `${type === 'image' ? 'Image' : 'Video'} Ready`
                : `Generating ${type}...`}
            </div>
          </motion.div>

          {/* Progress bar */}
          <div className="mt-4 w-48 h-1.5 rounded-full bg-white/10 overflow-hidden">
            <motion.div
              className="h-full rounded-full bg-gradient-to-r from-purple-500 via-cyan-500 to-purple-500"
              style={{ backgroundSize: '200% 100%' }}
              initial={{ width: '0%' }}
              animate={{
                width: `${progress}%`,
                backgroundPosition: ['0% 0%', '100% 0%', '0% 0%'],
              }}
              transition={{
                width: { duration: 0.3 },
                backgroundPosition: { duration: 3, repeat: Infinity, ease: 'linear' },
              }}
            />
          </div>
        </div>

        {/* Prompt preview at bottom */}
        {prompt && (
          <div className="absolute bottom-0 left-0 right-0 p-4 bg-gradient-to-t from-black/80 to-transparent">
            <p className="text-xs text-white/70 line-clamp-2">{prompt}</p>
          </div>
        )}

        {/* Scanning line effect */}
        {!isComplete && (
          <motion.div
            className="absolute left-0 right-0 h-0.5 bg-gradient-to-r from-transparent via-cyan-400 to-transparent"
            initial={{ top: '0%' }}
            animate={{ top: '100%' }}
            transition={{
              duration: 2,
              repeat: Infinity,
              ease: 'linear',
            }}
            style={{ boxShadow: '0 0 20px 5px rgba(6, 182, 212, 0.5)' }}
          />
        )}
      </div>

      {/* Aspect ratio badge */}
      <div className="absolute top-3 right-3 px-2 py-1 rounded-lg bg-black/50 backdrop-blur-sm border border-white/10">
        <span className="text-xs font-medium text-white/70">{aspectRatio}</span>
      </div>

      {/* Type badge */}
      <div className="absolute top-3 left-3 flex items-center gap-1.5 px-2 py-1 rounded-lg bg-black/50 backdrop-blur-sm border border-white/10">
        <Icon className="w-3 h-3 text-white/70" />
        <span className="text-xs font-medium text-white/70 capitalize">{type}</span>
      </div>
    </div>
  );
}
