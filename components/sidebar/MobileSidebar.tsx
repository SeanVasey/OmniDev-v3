'use client';

import { motion, AnimatePresence, useDragControls, PanInfo } from 'framer-motion';
import { useHaptics, HAPTIC_TRIGGERS } from '@/hooks/useHaptics';

interface MobileSidebarProps {
  isOpen: boolean;
  onClose: () => void;
  children: React.ReactNode;
}

const DRAWER_WIDTH = 320;
const SWIPE_THRESHOLD = 100;
const VELOCITY_THRESHOLD = 500;

export function MobileSidebar({ isOpen, onClose, children }: MobileSidebarProps) {
  const { trigger } = useHaptics();
  const dragControls = useDragControls();

  const handleDragStart = () => {
    trigger(HAPTIC_TRIGGERS.sidebar.swipeStart);
  };

  const handleDragEnd = (_event: MouseEvent | TouchEvent | PointerEvent, info: PanInfo) => {
    const shouldClose = info.offset.x < -SWIPE_THRESHOLD || info.velocity.x < -VELOCITY_THRESHOLD;

    if (shouldClose) {
      trigger(HAPTIC_TRIGGERS.sidebar.swipeComplete);
      onClose();
    }
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
            onClick={() => {
              trigger(HAPTIC_TRIGGERS.sidebar.close);
              onClose();
            }}
            className="fixed inset-0 z-[var(--z-drawer)] bg-black/60 backdrop-blur-sm"
          />

          <motion.aside
            initial={{ x: '-100%' }}
            animate={{ x: 0 }}
            exit={{ x: '-100%' }}
            transition={{ type: 'spring', damping: 25, stiffness: 300 }}
            drag="x"
            dragControls={dragControls}
            dragConstraints={{ left: -DRAWER_WIDTH, right: 0 }}
            dragElastic={0.2}
            onDragStart={handleDragStart}
            onDragEnd={handleDragEnd}
            style={{ width: DRAWER_WIDTH }}
            className="fixed left-0 top-0 bottom-0 z-[calc(var(--z-drawer)+1)] bg-[var(--bg-secondary)] border-r border-[var(--border-subtle)] flex flex-col pt-[var(--safe-area-top)] pb-[var(--safe-area-bottom)] overflow-hidden"
          >
            {children}
          </motion.aside>
        </>
      )}
    </AnimatePresence>
  );
}
