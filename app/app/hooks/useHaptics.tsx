'use client';

import { useCallback, useMemo } from 'react';

/**
 * Haptic Feedback Patterns
 * Each pattern is designed for specific interaction types
 */
export type HapticPattern =
  | 'light'
  | 'medium'
  | 'heavy'
  | 'success'
  | 'warning'
  | 'error'
  | 'selection'
  | 'impact-light'
  | 'impact-medium'
  | 'impact-heavy'
  | 'notification'
  | 'keyboard';

interface HapticConfig {
  pattern: number[];
  description: string;
}

const HAPTIC_PATTERNS: Record<HapticPattern, HapticConfig> = {
  'light': {
    pattern: [10],
    description: 'Subtle single vibration for minor interactions'
  },
  'medium': {
    pattern: [25],
    description: 'Standard vibration for button presses'
  },
  'heavy': {
    pattern: [50],
    description: 'Strong vibration for important actions'
  },
  'success': {
    pattern: [20, 50, 30],
    description: 'Double pulse indicating successful completion'
  },
  'warning': {
    pattern: [15, 30, 15, 30, 15],
    description: 'Triple quick vibration for warnings'
  },
  'error': {
    pattern: [100],
    description: 'Long vibration indicating an error'
  },
  'selection': {
    pattern: [5],
    description: 'Very subtle tick for selections'
  },
  'impact-light': {
    pattern: [8],
    description: 'iOS-style light impact'
  },
  'impact-medium': {
    pattern: [18],
    description: 'iOS-style medium impact'
  },
  'impact-heavy': {
    pattern: [35],
    description: 'iOS-style heavy impact'
  },
  'notification': {
    pattern: [50, 100, 50],
    description: 'Notification arrival pattern'
  },
  'keyboard': {
    pattern: [3],
    description: 'Ultra-subtle keyboard tick'
  },
};

interface UseHapticsReturn {
  /** Trigger a haptic feedback pattern */
  trigger: (pattern: HapticPattern, options?: { force?: boolean }) => void;
  /** Check if haptics are supported */
  isSupported: boolean;
  /** Check if haptics are enabled in settings */
  isEnabled: boolean;
  /** Toggle haptics on/off */
  setEnabled: (enabled: boolean) => void;
}

export function useHaptics(): UseHapticsReturn {
  const isSupported = useMemo(() => {
    if (typeof navigator === 'undefined') return false;
    return 'vibrate' in navigator;
  }, []);

  const isEnabled = useMemo(() => {
    if (typeof localStorage === 'undefined') return true;
    const stored = localStorage.getItem('omnidev-haptics-enabled');
    return stored !== 'false';
  }, []);

  const setEnabled = useCallback((enabled: boolean) => {
    if (typeof localStorage !== 'undefined') {
      localStorage.setItem('omnidev-haptics-enabled', String(enabled));
    }
  }, []);

  const trigger = useCallback((
    pattern: HapticPattern,
    options?: { force?: boolean }
  ) => {
    if (!isSupported) return;
    if (!isEnabled && !options?.force) return;

    const config = HAPTIC_PATTERNS[pattern];
    if (!config) {
      console.warn(`Unknown haptic pattern: ${pattern}`);
      return;
    }

    try {
      navigator.vibrate(config.pattern);
    } catch (error) {
      // eslint-disable-next-line no-console
      console.debug('Haptic feedback failed:', error);
    }
  }, [isSupported, isEnabled]);

  return {
    trigger,
    isSupported,
    isEnabled,
    setEnabled,
  };
}

/**
 * Higher-order component for adding haptic feedback to buttons
 */
export function withHaptics<P extends { onClick?: () => void }>(
  WrappedComponent: React.ComponentType<P>,
  pattern: HapticPattern = 'medium'
) {
  return function HapticWrapper(props: P) {
    const { trigger } = useHaptics();

    const handleClick = () => {
      trigger(pattern);
      props.onClick?.();
    };

    return <WrappedComponent {...props} onClick={handleClick} />;
  };
}
