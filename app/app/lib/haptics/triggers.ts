/**
 * HAPTIC TRIGGER INTEGRATION POINTS
 * Reference this map when implementing components
 */

export const HAPTIC_TRIGGERS = {
  sidebar: {
    open: 'impact-medium' as const,
    close: 'impact-light' as const,
    swipeStart: 'selection' as const,
    swipeComplete: 'impact-medium' as const,
  },

  modeToggle: {
    enterIncognito: 'impact-heavy' as const,
    exitIncognito: 'impact-medium' as const,
    themeChange: 'selection' as const,
  },

  composer: {
    focus: 'light' as const,
    attachmentAdd: 'selection' as const,
    attachmentRemove: 'light' as const,
    contextPillSelect: 'selection' as const,
    contextPillDeselect: 'light' as const,
    aspectRatioChange: 'selection' as const,
    voiceStart: 'impact-medium' as const,
    voiceStop: 'impact-light' as const,
    send: 'success' as const,
    sendFailed: 'error' as const,
  },

  modelSelector: {
    open: 'light' as const,
    select: 'selection' as const,
    close: 'light' as const,
  },

  uploadMenu: {
    open: 'light' as const,
    selectOption: 'selection' as const,
    fileSelected: 'success' as const,
    uploadError: 'error' as const,
  },

  chat: {
    newConversation: 'impact-medium' as const,
    deleteConversation: 'heavy' as const,
    messageReceived: 'notification' as const,
    copyToClipboard: 'success' as const,
    regenerate: 'medium' as const,
  },

  button: {
    primary: 'medium' as const,
    secondary: 'light' as const,
    destructive: 'heavy' as const,
    icon: 'light' as const,
  },

  gesture: {
    longPressStart: 'heavy' as const,
    pullToRefreshTrigger: 'impact-heavy' as const,
    swipeAction: 'selection' as const,
  },

  system: {
    success: 'success' as const,
    warning: 'warning' as const,
    error: 'error' as const,
    info: 'light' as const,
  },
} as const;
