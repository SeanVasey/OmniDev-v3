import { create } from 'zustand';

interface UIState {
  isSidebarOpen: boolean;
  theme: 'dark' | 'light';
  isIncognitoMode: boolean;

  // Actions
  setSidebarOpen: (isOpen: boolean) => void;
  toggleSidebar: () => void;
  setTheme: (theme: 'dark' | 'light') => void;
  toggleTheme: () => void;
  setIncognitoMode: (isIncognito: boolean) => void;
  toggleIncognitoMode: () => void;
}

export const useUIStore = create<UIState>((set) => ({
  isSidebarOpen: false,
  theme: 'dark',
  isIncognitoMode: false,

  setSidebarOpen: (isOpen) => set({ isSidebarOpen: isOpen }),

  toggleSidebar: () => set((state) => ({ isSidebarOpen: !state.isSidebarOpen })),

  setTheme: (theme) => {
    set({ theme });
    if (typeof document !== 'undefined') {
      document.body.setAttribute('data-theme', theme);
    }
  },

  toggleTheme: () =>
    set((state) => {
      const newTheme = state.theme === 'dark' ? 'light' : 'dark';
      if (typeof document !== 'undefined') {
        document.body.setAttribute('data-theme', newTheme);
      }
      return { theme: newTheme };
    }),

  setIncognitoMode: (isIncognito) => {
    set({ isIncognitoMode: isIncognito });
    if (typeof document !== 'undefined') {
      document.body.setAttribute('data-mode', isIncognito ? 'incognito' : 'standard');
    }
  },

  toggleIncognitoMode: () =>
    set((state) => {
      const newMode = !state.isIncognitoMode;
      if (typeof document !== 'undefined') {
        document.body.setAttribute('data-mode', newMode ? 'incognito' : 'standard');
      }
      return { isIncognitoMode: newMode };
    }),
}));
