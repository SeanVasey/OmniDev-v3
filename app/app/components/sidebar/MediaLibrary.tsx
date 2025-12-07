'use client';

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Image as ImageIcon, Video, ExternalLink, Loader2 } from 'lucide-react';
import { useAuth } from '@/lib/auth/AuthContext';
import { getRecentMediaGenerations } from '@/lib/supabase/database';
import { cn } from '@/lib/utils';

interface MediaItem {
  id: string;
  type: 'image' | 'video';
  url: string;
  created_at: string;
  chat_id: string;
}

interface MediaLibraryProps {
  onSelectChat?: (chatId: string) => void;
}

export function MediaLibrary({ onSelectChat }: MediaLibraryProps) {
  const { userId } = useAuth();
  const [mediaItems, setMediaItems] = useState<MediaItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [selectedItem, setSelectedItem] = useState<MediaItem | null>(null);

  useEffect(() => {
    const loadMedia = async () => {
      if (!userId) return;
      setIsLoading(true);
      try {
        const items = await getRecentMediaGenerations(userId, 4);
        setMediaItems(items);
      } catch (error) {
        console.error('Error loading media:', error);
      } finally {
        setIsLoading(false);
      }
    };

    loadMedia();
  }, [userId]);

  if (isLoading) {
    return (
      <div className="px-3 py-2">
        <h3 className="px-0 py-2 text-xs font-semibold text-[var(--text-muted)] uppercase tracking-wider">
          Media Library
        </h3>
        <div className="flex items-center justify-center py-4">
          <Loader2 className="w-5 h-5 text-[var(--text-muted)] animate-spin" />
        </div>
      </div>
    );
  }

  if (mediaItems.length === 0) {
    return (
      <div className="px-3 py-2">
        <h3 className="px-0 py-2 text-xs font-semibold text-[var(--text-muted)] uppercase tracking-wider">
          Media Library
        </h3>
        <div className="flex flex-col items-center justify-center py-4 text-center">
          <ImageIcon className="w-8 h-8 text-[var(--text-muted)]/50 mb-2" />
          <p className="text-xs text-[var(--text-muted)]">No media yet</p>
        </div>
      </div>
    );
  }

  return (
    <div className="px-3 py-2">
      <h3 className="px-0 py-2 text-xs font-semibold text-[var(--text-muted)] uppercase tracking-wider">
        Media Library
      </h3>
      <div className="grid grid-cols-2 gap-2">
        <AnimatePresence>
          {mediaItems.slice(0, 4).map((item, index) => (
            <motion.button
              key={item.id}
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.9 }}
              transition={{ delay: index * 0.05 }}
              onClick={() => {
                if (onSelectChat && item.chat_id) {
                  onSelectChat(item.chat_id);
                } else {
                  setSelectedItem(item);
                }
              }}
              className={cn(
                'relative aspect-square rounded-xl overflow-hidden',
                'bg-[var(--bg-elevated)] border border-[var(--border-subtle)]',
                'hover:border-[var(--accent-primary)]/50 hover:shadow-lg',
                'transition-all group'
              )}
            >
              {item.type === 'image' ? (
                <img
                  src={item.url}
                  alt="Generated"
                  className="w-full h-full object-cover"
                  onError={(e) => {
                    (e.target as HTMLImageElement).src = '/placeholder-image.png';
                  }}
                />
              ) : (
                <div className="w-full h-full flex items-center justify-center bg-[var(--bg-muted)]">
                  <Video className="w-8 h-8 text-[var(--text-muted)]" />
                </div>
              )}

              {/* Overlay */}
              <div className="absolute inset-0 bg-black/0 group-hover:bg-black/40 transition-all flex items-center justify-center opacity-0 group-hover:opacity-100">
                <ExternalLink className="w-5 h-5 text-white" />
              </div>

              {/* Type badge */}
              <div className="absolute top-1.5 right-1.5 p-1 rounded-md bg-black/50 backdrop-blur-sm">
                {item.type === 'image' ? (
                  <ImageIcon className="w-3 h-3 text-white" />
                ) : (
                  <Video className="w-3 h-3 text-white" />
                )}
              </div>
            </motion.button>
          ))}
        </AnimatePresence>
      </div>

      {/* Fullscreen preview modal */}
      <AnimatePresence>
        {selectedItem && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80"
            onClick={() => setSelectedItem(null)}
          >
            <motion.div
              initial={{ scale: 0.9 }}
              animate={{ scale: 1 }}
              exit={{ scale: 0.9 }}
              className="max-w-3xl max-h-[80vh] rounded-2xl overflow-hidden"
              onClick={(e) => e.stopPropagation()}
            >
              {selectedItem.type === 'image' ? (
                <img
                  src={selectedItem.url}
                  alt="Generated"
                  className="w-full h-full object-contain"
                />
              ) : (
                <video
                  src={selectedItem.url}
                  controls
                  autoPlay
                  className="w-full h-full object-contain"
                />
              )}
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
