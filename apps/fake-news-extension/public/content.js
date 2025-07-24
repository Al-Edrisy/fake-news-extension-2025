// Enhanced VeriNews Extension Content Script
console.log('VeriNews Extension content script loaded');

// Enhanced configuration and state management
const VeriNewsState = {
  isActive: true,
  currentTheme: 'system',
  loadingIndicator: null,
  verifyFab: null,
  lastSelectedText: '',
  selectionTimeout: null,
  activePopup: null,
  debugMode: false
};

// Enhanced error handling utility
class VeriNewsError extends Error {
  constructor(message, type = 'general', details = {}) {
    super(message);
    this.name = 'VeriNewsError';
    this.type = type;
    this.details = details;
    this.timestamp = new Date().toISOString();
  }
}

// Enhanced logging utility
const Logger = {
  debug: (message, data = {}) => {
    if (VeriNewsState.debugMode) {
      console.log(`[VeriNews Debug] ${message}`, data);
    }
  },
  info: (message, data = {}) => console.log(`[VeriNews] ${message}`, data),
  warn: (message, data = {}) => console.warn(`[VeriNews] ${message}`, data),
  error: (message, error = null) => {
    console.error(`[VeriNews Error] ${message}`, error);
    // Could send to error tracking service here
  }
};

// Initialize text selection functionality immediately
initializeTextSelection();

// Enhanced theme system with better performance
const ThemeManager = {
  cache: new Map(),
  
  getThemeColors: () => {
    const cacheKey = `${VeriNewsState.currentTheme}-${window.matchMedia('(prefers-color-scheme: dark)').matches}`;
    
    if (ThemeManager.cache.has(cacheKey)) {
      return ThemeManager.cache.get(cacheKey);
    }

    const root = document.documentElement;
    const isDark = VeriNewsState.currentTheme === 'dark' || 
                   (VeriNewsState.currentTheme === 'system' && 
                    window.matchMedia('(prefers-color-scheme: dark)').matches);
    
    const colors = {
      background: isDark ? '#0f172a' : '#ffffff',
      card: isDark ? '#1e293b' : '#ffffff',
      surface: isDark ? '#334155' : '#f8fafc',
      border: isDark ? '#475569' : '#e2e8f0',
      primary: '#e11d48',
      secondary: '#be123c',
      accent: '#10b981',
      text: isDark ? '#f8fafc' : '#0f172a',
      textMuted: isDark ? '#94a3b8' : '#64748b',
      error: '#ef4444',
      success: '#22c55e',
      warning: '#f59e0b',
      info: '#3b82f6'
    };

    ThemeManager.cache.set(cacheKey, colors);
    return colors;
  },

  applyTheme: (element) => {
    Object.entries(colors).forEach(([key, value]) => {
      element.style.setProperty(`--vn-${key}`, value);
    });
  }
};

// Utility function to get favicon with fallback
const getFaviconUrl = (url) => {
  try {
    const domain = new URL(url).hostname;
    return `https://www.google.com/s2/favicons?domain=${domain}&sz=32`;
  } catch {
    return 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMzIiIGhlaWdodD0iMzIiIHZpZXdCb3g9IjAgMCAzMiAzMiIgZmlsbD0ibm9uZSIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj4KPHJlY3Qgd2lkdGg9IjMyIiBoZWlnaHQ9IjMyIiByeD0iNCIgZmlsbD0iIzk0YTNiOCIvPgo8dGV4dCB4PSIxNiIgeT0iMjAiIGZvbnQtZmFtaWx5PSJzeXN0ZW0tdWkiIGZvbnQtc2l6ZT0iMTIiIGZpbGw9IndoaXRlIiB0ZXh0LWFuY2hvcj0ibWlkZGxlIj4/PC90ZXh0Pgo8L3N2Zz4K';
  }
};

// Enhanced message handling with better error recovery
const MessageHandler = {
  handlers: new Map(),
  
  register: (action, handler) => {
    MessageHandler.handlers.set(action, handler);
  },

  handle: async (request, sender, sendResponse) => {
    Logger.debug('Received message', request);
    
    try {
      const handler = MessageHandler.handlers.get(request.action);
      if (!handler) {
        throw new VeriNewsError(`Unknown action: ${request.action}`, 'message_handler');
      }

      const result = await handler(request, sender);
      sendResponse({ success: true, data: result });
    } catch (error) {
      Logger.error('Message handling failed', error);
      sendResponse({ 
        success: false, 
        error: error.message,
        type: error.type || 'unknown'
      });
    }
    
    return true; // Keep message channel open
  }
};

// Register message handlers
MessageHandler.register('highlightText', () => {
  highlightPageText();
  return { highlighted: true };
});

MessageHandler.register('getPageInfo', () => ({
  title: document.title,
  url: window.location.href,
  textLength: document.body.innerText.length,
  domain: window.location.hostname
}));

MessageHandler.register('showVerificationResult', (request) => {
  showVerificationPopup(request.result, request.claim);
  return { shown: true };
});

MessageHandler.register('showVerificationError', (request) => {
  NotificationManager.showError(request.error);
  return { shown: true };
});

MessageHandler.register('showLoadingIndicator', () => {
  LoadingManager.show();
  return { shown: true };
});

MessageHandler.register('hideLoadingIndicator', () => {
  LoadingManager.hide();
  return { hidden: true };
});

MessageHandler.register('playCustomSound', () => {
  AudioManager.playNotification();
  return { played: true };
});

MessageHandler.register('showFloatingButton', () => {
  FloatingButtonManager.show();
  return { shown: true };
});

MessageHandler.register('ping', () => ({
  message: 'Content script is active',
  version: '2.0.0',
  state: VeriNewsState
}));

// Set up message listener with enhanced error handling
if (typeof chrome !== "undefined" && chrome.runtime && chrome.runtime.onMessage) {
  chrome.runtime.onMessage.addListener(MessageHandler.handle);
} else {
  Logger.warn("Chrome runtime not available - running in development mode");
}

// Enhanced notification system
const NotificationManager = {
  activeNotifications: new Set(),
  maxNotifications: 3,

  create: (type, message, duration = 5000) => {
    // Remove oldest notification if at limit
    if (NotificationManager.activeNotifications.size >= NotificationManager.maxNotifications) {
      const oldest = Array.from(NotificationManager.activeNotifications)[0];
      NotificationManager.remove(oldest);
    }

    const colors = ThemeManager.getThemeColors();
    const notification = document.createElement('div');
    
    notification.className = 'verinews-notification';
    notification.setAttribute('data-type', type);
    notification.setAttribute('role', 'alert');
    notification.setAttribute('aria-live', 'polite');
    
    const typeConfig = {
      error: { icon: '⚠️', bgColor: colors.error, textColor: '#ffffff' },
      success: { icon: '✅', bgColor: colors.success, textColor: '#ffffff' },
      warning: { icon: '⚠️', bgColor: colors.warning, textColor: '#000000' },
      info: { icon: 'ℹ️', bgColor: colors.info, textColor: '#ffffff' }
    };

    const config = typeConfig[type] || typeConfig.info;
    
    notification.style.cssText = `
      position: fixed;
      top: ${20 + (NotificationManager.activeNotifications.size * 70)}px;
      right: 20px;
      background: ${config.bgColor};
      color: ${config.textColor};
      padding: 16px 20px;
      border-radius: 12px;
      font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
      font-size: 14px;
      font-weight: 500;
      z-index: 2147483647;
      box-shadow: 0 10px 25px rgba(0,0,0,0.2), 0 4px 10px rgba(0,0,0,0.1);
      border: 1px solid rgba(255,255,255,0.1);
      backdrop-filter: blur(12px);
      opacity: 0;
      transform: translateX(100%) scale(0.95);
      transition: all 0.4s cubic-bezier(0.4, 0, 0.2, 1);
      max-width: 350px;
      min-width: 250px;
      display: flex;
      align-items: flex-start;
      gap: 12px;
      cursor: pointer;
      user-select: none;
    `;
    
    notification.innerHTML = `
      <div style="font-size: 18px; line-height: 1; margin-top: 1px;">${config.icon}</div>
      <div style="flex: 1; line-height: 1.4;">
        <div style="font-weight: 600; margin-bottom: 2px;">VeriNews</div>
        <div style="opacity: 0.95;">${message}</div>
      </div>
      <div style="cursor: pointer; opacity: 0.7; hover:opacity:1; padding: 2px;">
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
          <path d="M18 6L6 18M6 6l12 12"/>
        </svg>
      </div>
    `;
    
    // Close button functionality
    const closeBtn = notification.querySelector('svg').parentElement;
    closeBtn.onclick = (e) => {
      e.stopPropagation();
      NotificationManager.remove(notification);
    };
    
    // Click to dismiss
    notification.onclick = () => NotificationManager.remove(notification);
    
    document.body.appendChild(notification);
    NotificationManager.activeNotifications.add(notification);
    
    // Animate in
    requestAnimationFrame(() => {
      notification.style.opacity = '1';
      notification.style.transform = 'translateX(0) scale(1)';
    });
    
    // Auto remove
    if (duration > 0) {
      setTimeout(() => NotificationManager.remove(notification), duration);
    }
    
    return notification;
  },

  remove: (notification) => {
    if (!NotificationManager.activeNotifications.has(notification)) return;
    
    notification.style.opacity = '0';
    notification.style.transform = 'translateX(100%) scale(0.95)';
    
    setTimeout(() => {
      if (notification.parentNode) {
        notification.remove();
      }
      NotificationManager.activeNotifications.delete(notification);
      
      // Reposition remaining notifications
      Array.from(NotificationManager.activeNotifications).forEach((notif, index) => {
        notif.style.top = `${20 + (index * 70)}px`;
      });
    }, 400);
  },

  showError: (message) => NotificationManager.create('error', message),
  showSuccess: (message) => NotificationManager.create('success', message),
  showWarning: (message) => NotificationManager.create('warning', message),
  showInfo: (message) => NotificationManager.create('info', message)
};

// Enhanced loading indicator with better positioning and animations
const LoadingManager = {
  indicator: null,
  timer: null,
  startTime: 0,

  show: () => {
    LoadingManager.hide(); // Remove any existing indicator
    
    const colors = ThemeManager.getThemeColors();
    const indicator = document.createElement('div');
    indicator.id = 'verinews-loading-indicator';
    indicator.setAttribute('role', 'status');
    indicator.setAttribute('aria-label', 'Verifying claim');
    
    const selection = window.getSelection();
    let position = { x: window.innerWidth / 2, y: window.innerHeight / 2 };
    
    // Position near selected text if available
    if (selection && selection.rangeCount > 0) {
      const range = selection.getRangeAt(0);
      const rect = range.getBoundingClientRect();
      if (rect.width && rect.height) {
        position = { 
          x: rect.left + rect.width / 2, 
          y: rect.top - 60
        };
      }
    }
    
    indicator.style.cssText = `
      position: fixed;
      left: ${position.x}px;
      top: ${position.y}px;
      transform: translate(-50%, -50%);
      z-index: 2147483647;
      background: ${colors.card};
      color: ${colors.text};
      border: 2px solid ${colors.primary};
      border-radius: 16px;
      box-shadow: 0 8px 32px rgba(0,0,0,0.15), 0 4px 16px rgba(0,0,0,0.1);
      padding: 16px 20px;
      font-size: 14px;
      font-weight: 600;
      font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
      display: flex;
      align-items: center;
      gap: 12px;
      pointer-events: auto;
      user-select: none;
      transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
      opacity: 0;
      transform: translate(-50%, -50%) translateY(-10px) scale(0.95);
      cursor: grab;
      backdrop-filter: blur(16px);
      min-width: 200px;
      max-width: 280px;
    `;
    
    indicator.innerHTML = `
      <div class="verinews-spinner" style="position: relative; width: 20px; height: 20px;">
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
          <circle cx="12" cy="12" r="10" stroke="${colors.primary}" stroke-width="2" opacity="0.2"/>
          <path d="M22 12a10 10 0 0 1-10 10" stroke="${colors.primary}" stroke-width="2" stroke-linecap="round">
            <animateTransform attributeName="transform" type="rotate" from="0 12 12" to="360 12 12" dur="1s" repeatCount="indefinite"/>
          </path>
        </svg>
      </div>
      <div style="flex: 1; min-width: 0;">
        <div id="verinews-loading-text" style="font-weight: 600; color: ${colors.text}; font-size: 13px; margin-bottom: 2px;">Analyzing claim...</div>
        <div id="verinews-loading-timer" style="font-size: 11px; color: ${colors.textMuted}; font-weight: 400;">0.0s</div>
      </div>
      <div class="verinews-pulse" style="width: 8px; height: 8px; background: ${colors.primary}; border-radius: 50%; animation: verinews-pulse 2s infinite;"></div>
    `;
    
    // Add pulse animation
    if (!document.getElementById('verinews-styles')) {
      const style = document.createElement('style');
      style.id = 'verinews-styles';
      style.textContent = `
        @keyframes verinews-pulse {
          0%, 100% { opacity: 1; transform: scale(1); }
          50% { opacity: 0.5; transform: scale(1.3); }
        }
        .verinews-notification:hover {
          transform: translateX(-5px) scale(1.02) !important;
        }
      `;
      document.head.appendChild(style);
    }
    
    document.body.appendChild(indicator);
    LoadingManager.indicator = indicator;
    
    // Make draggable
    LoadingManager.makeDraggable(indicator);
    
    // Animate in
    requestAnimationFrame(() => {
      indicator.style.opacity = '1';
      indicator.style.transform = 'translate(-50%, -50%) scale(1)';
    });
    
    // Start timer
    LoadingManager.startTime = Date.now();
    LoadingManager.timer = setInterval(() => {
      const elapsed = (Date.now() - LoadingManager.startTime) / 1000;
      const timerElement = indicator.querySelector('#verinews-loading-timer');
      if (timerElement) {
        timerElement.textContent = `${elapsed.toFixed(1)}s`;
      }
    }, 100);
  },

  hide: () => {
    if (LoadingManager.indicator) {
      LoadingManager.indicator.style.opacity = '0';
      LoadingManager.indicator.style.transform = 'translate(-50%, -50%) translateY(-10px) scale(0.95)';
      
      setTimeout(() => {
        if (LoadingManager.indicator && LoadingManager.indicator.parentNode) {
          LoadingManager.indicator.remove();
        }
        LoadingManager.indicator = null;
      }, 300);
    }
    
    if (LoadingManager.timer) {
      clearInterval(LoadingManager.timer);
      LoadingManager.timer = null;
    }
  },

  makeDraggable: (element) => {
    let isDragging = false;
    let startX = 0;
    let startY = 0;
    let startLeft = 0;
    let startTop = 0;
    
    const onMouseDown = (e) => {
      if (e.target.closest('svg, .verinews-pulse')) return;
      
      isDragging = true;
      startX = e.clientX;
      startY = e.clientY;
      
      const rect = element.getBoundingClientRect();
      startLeft = rect.left + rect.width / 2;
      startTop = rect.top + rect.height / 2;
      
      element.style.cursor = 'grabbing';
      element.style.transform = 'translate(-50%, -50%) scale(0.98)';
      document.body.style.userSelect = 'none';
      
      document.addEventListener('mousemove', onMouseMove);
      document.addEventListener('mouseup', onMouseUp);
    };
    
    const onMouseMove = (e) => {
      if (!isDragging) return;
      
      let newX = startLeft + (e.clientX - startX);
      let newY = startTop + (e.clientY - startY);
      
      // Keep within viewport
      const margin = 20;
      newX = Math.max(margin, Math.min(window.innerWidth - margin, newX));
      newY = Math.max(margin, Math.min(window.innerHeight - margin, newY));
      
      element.style.left = newX + 'px';
      element.style.top = newY + 'px';
    };
    
    const onMouseUp = () => {
      if (isDragging) {
        isDragging = false;
        element.style.cursor = 'grab';
        element.style.transform = 'translate(-50%, -50%) scale(1)';
        document.body.style.userSelect = '';
        
        document.removeEventListener('mousemove', onMouseMove);
        document.removeEventListener('mouseup', onMouseUp);
      }
    };
    
    element.addEventListener('mousedown', onMouseDown);
  }
};

// Enhanced audio manager with better error handling
const AudioManager = {
  context: null,
  
  init: () => {
    try {
      AudioManager.context = new (window.AudioContext || window.webkitAudioContext)();
    } catch (error) {
      Logger.warn('Web Audio API not supported', error);
    }
  },

  playNotification: () => {
    try {
      // Try to play custom notification sound first
      if (typeof chrome !== "undefined" && chrome.runtime) {
        const audio = new Audio(chrome.runtime.getURL('notification.mp3'));
        audio.volume = 0.7;
        audio.play().catch(() => {
          // Fallback to system beep
          AudioManager.playSystemBeep();
        });
      } else {
        AudioManager.playSystemBeep();
      }
    } catch (error) {
      Logger.warn('Could not play notification sound', error);
    }
  },

  playSystemBeep: () => {
    if (!AudioManager.context) {
      AudioManager.init();
    }
    
    if (AudioManager.context) {
      try {
        const oscillator = AudioManager.context.createOscillator();
        const gainNode = AudioManager.context.createGain();
        
        oscillator.connect(gainNode);
        gainNode.connect(AudioManager.context.destination);
        
        oscillator.frequency.value = 800;
        oscillator.type = 'sine';
        
        gainNode.gain.setValueAtTime(0, AudioManager.context.currentTime);
        gainNode.gain.linearRampToValueAtTime(0.3, AudioManager.context.currentTime + 0.01);
        gainNode.gain.exponentialRampToValueAtTime(0.01, AudioManager.context.currentTime + 0.3);
        
        oscillator.start(AudioManager.context.currentTime);
        oscillator.stop(AudioManager.context.currentTime + 0.3);
      } catch (error) {
        Logger.warn('Could not play system beep', error);
      }
    }
  }
};

// Enhanced floating button manager
const FloatingButtonManager = {
  show: () => {
    FloatingButtonManager.hide();
    
    const colors = ThemeManager.getThemeColors();
    const fab = document.createElement('div');
    fab.id = 'verinews-floating-fab';
    fab.setAttribute('role', 'button');
    fab.setAttribute('tabindex', '0');
    fab.setAttribute('aria-label', 'Select text to verify with VeriNews');
    
    fab.style.cssText = `
      position: fixed;
      left: 50%;
      top: 50%;
      transform: translate(-50%, -50%);
      z-index: 2147483647;
      background: linear-gradient(135deg, ${colors.primary}, ${colors.secondary});
      color: white;
      border: none;
      border-radius: 16px;
      box-shadow: 0 8px 25px rgba(225, 29, 72, 0.3), 0 4px 15px rgba(0,0,0,0.1);
      padding: 16px 24px;
      font-size: 14px;
      font-weight: 600;
      font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
      display: flex;
      align-items: center;
      gap: 10px;
      transition: all 0.4s cubic-bezier(0.4, 0, 0.2, 1);
      backdrop-filter: blur(12px);
      cursor: pointer;
      user-select: none;
      opacity: 0;
      transform: translate(-50%, -50%) scale(0.8);
      border: 2px solid rgba(255,255,255,0.2);
    `;
    
    fab.innerHTML = `
      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5">
        <path d="M9 12l2 2 4-4"/>
        <circle cx="12" cy="12" r="10"/>
      </svg>
      <span>Select text to verify</span>
      <div style="width: 6px; height: 6px; background: rgba(255,255,255,0.8); border-radius: 50%; animation: verinews-pulse 2s infinite;"></div>
    `;
    
    // Hover effects
    fab.addEventListener('mouseenter', () => {
      fab.style.transform = 'translate(-50%, -50%) scale(1.05)';
      fab.style.boxShadow = '0 12px 35px rgba(225, 29, 72, 0.4), 0 6px 20px rgba(0,0,0,0.15)';
    });
    
    fab.addEventListener('mouseleave', () => {
      fab.style.transform = 'translate(-50%, -50%) scale(1)';
      fab.style.boxShadow = '0 8px 25px rgba(225, 29, 72, 0.3), 0 4px 15px rgba(0,0,0,0.1)';
    });
    
    document.body.appendChild(fab);
    VeriNewsState.verifyFab = fab;
    
    // Animate in
    requestAnimationFrame(() => {
      fab.style.opacity = '1';
      fab.style.transform = 'translate(-50%, -50%) scale(1)';
    });
    
    // Auto-hide after 4 seconds
    setTimeout(() => FloatingButtonManager.hide(), 4000);
  },

  hide: () => {
    if (VeriNewsState.verifyFab) {
      VeriNewsState.verifyFab.style.opacity = '0';
      VeriNewsState.verifyFab.style.transform = 'translate(-50%, -50%) scale(0.8)';
      
      setTimeout(() => {
        if (VeriNewsState.verifyFab && VeriNewsState.verifyFab.parentNode) {
          VeriNewsState.verifyFab.remove();
        }
        VeriNewsState.verifyFab = null;
      }, 400);
    }
  }
};

// Enhanced text selection system
function initializeTextSelection() {
  Logger.info('Initializing enhanced text selection functionality');
  
  // Clean up existing listeners
  document.removeEventListener('selectionchange', handleSelectionChange);
  document.removeEventListener('mousedown', handleMouseDown);
  document.removeEventListener('keydown', handleKeyDown);
  
  // Add enhanced event listeners
  document.addEventListener('selectionchange', handleSelectionChange);
  document.addEventListener('mousedown', handleMouseDown);
  document.addEventListener('keydown', handleKeyDown);
  
  Logger.info('Text selection functionality initialized successfully');
}

function handleSelectionChange() {
  // Clear existing timeout
  if (VeriNewsState.selectionTimeout) {
    clearTimeout(VeriNewsState.selectionTimeout);
  }
  
  // Remove existing floating button
  if (VeriNewsState.verifyFab) {
    VeriNewsState.verifyFab.remove();
    VeriNewsState.verifyFab = null;
  }
  
  // Add delay to prevent flickering during selection
  VeriNewsState.selectionTimeout = setTimeout(() => {
    try {
      const selection = window.getSelection();
      const text = selection.toString().trim();
      
      if (text.length >= 10 && text.length <= 5000) { // Reasonable length limits
        const range = selection.getRangeAt(0);
        const rect = range.getBoundingClientRect();
        
        if (rect && rect.width && rect.height) {
          VeriNewsState.lastSelectedText = text;
          createEnhancedSelectionButton(rect, text);
        }
      }
    } catch (error) {
      Logger.error('Selection change handling failed', error);
    }
  }, 200); // Increased delay for better UX
}

function handleMouseDown(e) {
  if (VeriNewsState.verifyFab && !VeriNewsState.verifyFab.contains(e.target)) {
    VeriNewsState.verifyFab.remove();
    VeriNewsState.verifyFab = null;
  }
}

function handleKeyDown(e) {
  // Ctrl/Cmd + Shift + V for quick verify
  if ((e.ctrlKey || e.metaKey) && e.shiftKey && e.key === 'V') {
    e.preventDefault();
    const selection = window.getSelection();
    const text = selection.toString().trim();
    
    if (text.length >= 10) {
      verifySelectedText(text);
    } else {
      NotificationManager.showWarning('Please select at least 10 characters to verify');
    }
  }
  
  // Escape to close popup
  if (e.key === 'Escape' && VeriNewsState.activePopup) {
    closeActivePopup();
  }
}

function createEnhancedSelectionButton(rect, selectedText) {
  const colors = ThemeManager.getThemeColors();
  const button = document.createElement('div');
  button.id = 'verinews-selection-button';
  button.setAttribute('role', 'toolbar');
  button.setAttribute('aria-label', 'VeriNews verification tools');
  
  // Enhanced positioning with viewport boundaries
  const buttonWidth = 160;
  const buttonHeight = 48;
  let left = rect.left + window.scrollX + rect.width / 2 - buttonWidth / 2;
  let top = rect.top + window.scrollY - buttonHeight - 16;
  
  // Ensure button stays within viewport
  const margin = 20;
  left = Math.max(margin, Math.min(window.innerWidth - buttonWidth - margin, left));
  
  if (top < margin + window.scrollY) {
    top = rect.bottom + window.scrollY + 16; // Show below if no space above
  }
  
  button.style.cssText = `
    position: absolute;
    left: ${left}px;
    top: ${top}px;
    z-index: 2147483647;
    background: ${colors.card};
    border: 2px solid ${colors.primary};
    border-radius: 14px;
    box-shadow: 0 8px 32px rgba(0,0,0,0.15), 0 4px 16px rgba(0,0,0,0.1);
    padding: 8px;
    display: flex;
    align-items: center;
    gap: 6px;
    transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
    backdrop-filter: blur(16px);
    user-select: none;
    width: ${buttonWidth}px;
    height: ${buttonHeight}px;
    opacity: 0;
    transform: translateY(-10px) scale(0.95);
    font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
  `;
  
  // Create verify button
  const verifyBtn = document.createElement('button');
  verifyBtn.setAttribute('aria-label', 'Verify selected text');
  verifyBtn.style.cssText = `
    background: linear-gradient(135deg, ${colors.primary}, ${colors.secondary});
    color: white;
    border: none;
    border-radius: 10px;
    padding: 10px 16px;
    font-size: 12px;
    font-weight: 600;
    cursor: pointer;
    display: flex;
    align-items: center;
    gap: 6px;
    transition: all 0.2s cubic-bezier(0.4, 0, 0.2, 1);
    flex: 1;
    height: 100%;
    box-shadow: 0 2px 8px rgba(225, 29, 72, 0.3);
  `;
  
  verifyBtn.innerHTML = `
    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5">
      <path d="M9 12l2 2 4-4"/>
      <circle cx="12" cy="12" r="10"/>
    </svg>
    <span>Verify</span>
  `;
  
  // Create copy button
  const copyBtn = document.createElement('button');
  copyBtn.setAttribute('aria-label', 'Copy selected text');
  copyBtn.style.cssText = `
    background: ${colors.surface};
    color: ${colors.text};
    border: 1px solid ${colors.border};
    border-radius: 10px;
    padding: 10px;
    cursor: pointer;
    display: flex;
    align-items: center;
    justify-content: center;
    transition: all 0.2s cubic-bezier(0.4, 0, 0.2, 1);
    width: 40px;
    height: 100%;
    box-shadow: 0 2px 6px rgba(0,0,0,0.1);
  `;
  
  copyBtn.innerHTML = `
    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5">
      <rect x="9" y="9" width="13" height="13" rx="2"/>
      <path d="M5 15V5a2 2 0 0 1 2-2h10"/>
    </svg>
  `;
  
  // Enhanced hover effects
  verifyBtn.addEventListener('mouseenter', () => {
    verifyBtn.style.transform = 'translateY(-1px)';
    verifyBtn.style.boxShadow = '0 4px 12px rgba(225, 29, 72, 0.4)';
  });
  
  verifyBtn.addEventListener('mouseleave', () => {
    verifyBtn.style.transform = 'translateY(0)';
    verifyBtn.style.boxShadow = '0 2px 8px rgba(225, 29, 72, 0.3)';
  });
  
  copyBtn.addEventListener('mouseenter', () => {
    copyBtn.style.background = colors.border;
    copyBtn.style.transform = 'translateY(-1px)';
  });
  
  copyBtn.addEventListener('mouseleave', () => {
    copyBtn.style.background = colors.surface;
    copyBtn.style.transform = 'translateY(0)';
  });
  
  // Event handlers
  verifyBtn.onclick = (e) => {
    e.preventDefault();
    e.stopPropagation();
    verifySelectedText(selectedText);
  };
  
  copyBtn.onclick = async (e) => {
    e.preventDefault();
    e.stopPropagation();
    
    try {
      await navigator.clipboard.writeText(selectedText);
      
      // Show success feedback
      copyBtn.innerHTML = `
        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5">
          <path d="M20 6L9 17l-5-5"/>
        </svg>
      `;
      copyBtn.style.background = colors.success;
      copyBtn.style.color = 'white';
      
      setTimeout(() => {
        copyBtn.innerHTML = `
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5">
            <rect x="9" y="9" width="13" height="13" rx="2"/>
            <path d="M5 15V5a2 2 0 0 1 2-2h10"/>
          </svg>
        `;
        copyBtn.style.background = colors.surface;
        copyBtn.style.color = colors.text;
      }, 1500);
      
      NotificationManager.showSuccess('Text copied to clipboard');
    } catch (error) {
      Logger.error('Copy failed', error);
      NotificationManager.showError('Failed to copy text');
    }
  };
  
  button.appendChild(verifyBtn);
  button.appendChild(copyBtn);
  document.body.appendChild(button);
  VeriNewsState.verifyFab = button;
  
  // Animate in
  requestAnimationFrame(() => {
    button.style.opacity = '1';
    button.style.transform = 'translateY(0) scale(1)';
  });
  
  // Auto-hide after 8 seconds
  setTimeout(() => {
    if (VeriNewsState.verifyFab === button) {
      button.style.opacity = '0';
      button.style.transform = 'translateY(-10px) scale(0.95)';
      setTimeout(() => {
        if (button.parentNode) button.remove();
        if (VeriNewsState.verifyFab === button) VeriNewsState.verifyFab = null;
      }, 300);
    }
  }, 8000);
}

// Enhanced verification function with better error handling
async function verifySelectedText(text) {
  if (!text || text.length < 10) {
    NotificationManager.showWarning('Please select at least 10 characters to verify');
    return;
  }
  
  if (text.length > 5000) {
    NotificationManager.showWarning('Selected text is too long. Please select less than 5000 characters.');
    return;
  }
  
  try {
    // Hide selection button
    if (VeriNewsState.verifyFab) {
      VeriNewsState.verifyFab.style.opacity = '0';
      VeriNewsState.verifyFab.style.transform = 'translateY(-10px) scale(0.95)';
      setTimeout(() => {
        if (VeriNewsState.verifyFab && VeriNewsState.verifyFab.parentNode) {
          VeriNewsState.verifyFab.remove();
        }
        VeriNewsState.verifyFab = null;
      }, 300);
    }
    
    // Show loading indicator
    LoadingManager.show();
    
    // Send verification request with timeout
    const response = await new Promise((resolve, reject) => {
      const timeout = setTimeout(() => {
        reject(new VeriNewsError('Verification request timed out', 'timeout'));
      }, 30000); // 30 second timeout
      
      if (typeof chrome !== "undefined" && chrome.runtime) {
        chrome.runtime.sendMessage(
          { action: 'verifyClaim', claim: text },
          (response) => {
            clearTimeout(timeout);
            
            if (chrome.runtime.lastError) {
              reject(new VeriNewsError(
                'Extension communication failed',
                'runtime_error',
                { originalError: chrome.runtime.lastError.message }
              ));
            } else {
              resolve(response);
            }
          }
        );
      } else {
        clearTimeout(timeout);
        reject(new VeriNewsError(
          'Chrome extension runtime not available',
          'runtime_unavailable'
        ));
      }
    });
    
    // Hide loading indicator
    LoadingManager.hide();
    
    if (response && response.success && response.result) {
      showVerificationPopup(response.result, text);
      AudioManager.playNotification();
    } else {
      throw new VeriNewsError(
        response?.error || 'Unknown verification error',
        'verification_failed',
        { response }
      );
    }
    
  } catch (error) {
    LoadingManager.hide();
    Logger.error('Verification failed', error);
    
    let errorMessage = 'Verification failed. Please try again.';
    
    switch (error.type) {
      case 'timeout':
        errorMessage = 'Verification timed out. Please try again with a shorter text.';
        break;
      case 'runtime_error':
        errorMessage = 'Extension communication error. Please reload the page.';
        break;
      case 'runtime_unavailable':
        errorMessage = 'Extension not available. Please ensure VeriNews is installed and enabled.';
        break;
      case 'verification_failed':
        errorMessage = error.message || errorMessage;
        break;
    }
    
    NotificationManager.showError(errorMessage);
  }
}

// Enhanced verification popup with better UX
function showVerificationPopup(result, claim) {
  try {
    // Remove existing popup
    closeActivePopup();
    
    const colors = ThemeManager.getThemeColors();
    AudioManager.playNotification();
    
    // Create overlay
    const overlay = document.createElement('div');
    overlay.id = 'verinews-popup-overlay';
    overlay.setAttribute('role', 'dialog');
    overlay.setAttribute('aria-modal', 'true');
    overlay.setAttribute('aria-labelledby', 'verinews-popup-title');
    overlay.tabIndex = -1;
    
    overlay.style.cssText = `
      position: fixed;
      top: 0;
      left: 0;
      right: 0;
      bottom: 0;
      background: rgba(0,0,0,0.5);
      backdrop-filter: blur(8px);
      z-index: 2147483648;
      display: flex;
      align-items: center;
      justify-content: center;
      opacity: 0;
      transition: opacity 0.3s ease;
      padding: 20px;
    `;
    
    // Create popup
    const popup = document.createElement('div');
    popup.id = 'verinews-popup';
    popup.style.cssText = `
      background: ${colors.card};
      border-radius: 20px;
      box-shadow: 0 25px 75px rgba(0,0,0,0.3), 0 10px 30px rgba(0,0,0,0.2);
      max-width: 700px;
      width: 100%;
      max-height: 85vh;
      font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
      color: ${colors.text};
      border: 1px solid ${colors.border};
      outline: none;
      position: relative;
      transform: scale(0.9);
      transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
      user-select: none;
      overflow: hidden;
      display: flex;
      flex-direction: column;
    `;
    
    // Verdict styling
    const verdictStyles = {
      'True': { color: colors.success, icon: '✓', bg: `${colors.success}20` },
      'False': { color: colors.error, icon: '✗', bg: `${colors.error}20` },
      'Partial': { color: colors.warning, icon: '❓', bg: `${colors.warning}20` },
      'Uncertain': { color: colors.info, icon: '?', bg: `${colors.info}20` }
    };
    
    const verdictStyle = verdictStyles[result.verdict] || verdictStyles['Uncertain'];
    
    // Header
    const header = document.createElement('div');
    header.style.cssText = `
      display: flex;
      align-items: center;
      gap: 16px;
      background: linear-gradient(135deg, ${colors.primary}, ${colors.secondary});
      color: white;
      padding: 24px 28px;
      position: relative;
      flex-shrink: 0;
    `;
    
    header.innerHTML = `
      <div style="
        width: 40px;
        height: 40px;
        border-radius: 12px;
        background: rgba(255,255,255,0.2);
        display: flex;
        align-items: center;
        justify-content: center;
        font-size: 20px;
        font-weight: bold;
      ">${verdictStyle.icon}</div>
      <div style="flex: 1;">
        <h2 id="verinews-popup-title" style="
          font-size: 22px;
          font-weight: 700;
          margin: 0 0 4px 0;
        ">${result.verdict || 'Uncertain'}</h2>
        <p style="
          font-size: 14px;
          opacity: 0.9;
          margin: 0;
          font-weight: 400;
        ">${result.category ? result.category.charAt(0).toUpperCase() + result.category.slice(1) : 'Fact Check Result'}</p>
      </div>
      <button id="verinews-close-btn" style="
        background: rgba(255,255,255,0.2);
        border: none;
        border-radius: 8px;
        width: 36px;
        height: 36px;
        display: flex;
        align-items: center;
        justify-content: center;
        cursor: pointer;
        transition: all 0.2s;
        color: white;
      " aria-label="Close verification result">
        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
          <path d="M18 6L6 18M6 6l12 12"/>
        </svg>
      </button>
    `;
    
    // Content area
    const content = document.createElement('div');
    content.style.cssText = `
      flex: 1;
      overflow-y: auto;
      padding: 28px;
    `;
    
    // Original claim section
    if (claim) {
      const claimSection = document.createElement('div');
      claimSection.style.cssText = `
        margin-bottom: 24px;
        padding: 20px;
        background: ${colors.surface};
        border-radius: 16px;
        border-left: 4px solid ${colors.primary};
        box-shadow: 0 2px 8px rgba(0,0,0,0.05);
      `;
      
      claimSection.innerHTML = `
        <div style="
          font-size: 12px;
          color: ${colors.textMuted};
          font-weight: 600;
          margin-bottom: 8px;
          text-transform: uppercase;
          letter-spacing: 0.5px;
        ">Original Claim</div>
        <div style="
          font-size: 15px;
          color: ${colors.text};
          line-height: 1.6;
          font-style: italic;
        ">"${claim}"</div>
      `;
      
      content.appendChild(claimSection);
    }
    
    // Results section
    const resultsSection = document.createElement('div');
    resultsSection.style.cssText = 'margin-bottom: 24px;';
    
    // Conclusion
    if (result.conclusion) {
      const conclusion = document.createElement('div');
      conclusion.style.cssText = `
        font-size: 17px;
        font-weight: 600;
        margin-bottom: 16px;
        color: ${colors.text};
        line-height: 1.5;
      `;
      conclusion.textContent = result.conclusion;
      resultsSection.appendChild(conclusion);
    }
    
    // Explanation
    if (result.explanation) {
      const explanation = document.createElement('div');
      explanation.style.cssText = `
        font-size: 14px;
        color: ${colors.textMuted};
        margin-bottom: 20px;
        line-height: 1.6;
      `;
      explanation.textContent = result.explanation;
      resultsSection.appendChild(explanation);
    }
    
    // Metrics cards
    const metricsContainer = document.createElement('div');
    metricsContainer.style.cssText = `
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(160px, 1fr));
      gap: 16px;
      margin-bottom: 24px;
    `;
    
    // Confidence card
    if (result.confidence !== undefined) {
      const confidenceCard = document.createElement('div');
      confidenceCard.style.cssText = `
        padding: 20px;
        background: ${verdictStyle.bg};
        border-radius: 16px;
        border: 1px solid ${colors.border};
        text-align: center;
      `;
      
      confidenceCard.innerHTML = `
        <div style="
          font-size: 12px;
          color: ${colors.textMuted};
          font-weight: 600;
          margin-bottom: 8px;
          text-transform: uppercase;
          letter-spacing: 0.5px;
        ">Confidence</div>
        <div style="
          font-size: 28px;
          font-weight: 700;
          color: ${verdictStyle.color};
          margin-bottom: 12px;
        ">${result.confidence.toFixed(1)}%</div>
        <div style="
          height: 8px;
          background: ${colors.border};
          border-radius: 4px;
          overflow: hidden;
        ">
          <div style="
            height: 100%;
            width: ${result.confidence}%;
            background: ${verdictStyle.color};
            transition: width 1s ease;
            border-radius: 4px;
          "></div>
        </div>
      `;
      
      metricsContainer.appendChild(confidenceCard);
    }
    
    // Sources count card
    if (result.sources && result.sources.length > 0) {
      const sourcesCard = document.createElement('div');
      sourcesCard.style.cssText = `
        padding: 20px;
        background: ${colors.surface};
        border-radius: 16px;
        border: 1px solid ${colors.border};
        text-align: center;
      `;
      
      sourcesCard.innerHTML = `
        <div style="
          font-size: 12px;
          color: ${colors.textMuted};
          font-weight: 600;
          margin-bottom: 8px;
          text-transform: uppercase;
          letter-spacing: 0.5px;
        ">Sources</div>
        <div style="
          font-size: 28px;
          font-weight: 700;
          color: ${colors.info};
          margin-bottom: 8px;
        ">${result.sources.length}</div>
        <div style="
          font-size: 12px;
          color: ${colors.textMuted};
        ">Verified sources</div>
      `;
      
      metricsContainer.appendChild(sourcesCard);
    }
    
    resultsSection.appendChild(metricsContainer);
    content.appendChild(resultsSection);
    
    // Sources section
    if (result.sources && result.sources.length > 0) {
      const sourcesSection = createSourcesSection(result.sources, colors);
      content.appendChild(sourcesSection);
    }
    
    // Performance metrics (if available)
    if (result.timings) {
      const timingsSection = createTimingsSection(result.timings, colors);
      content.appendChild(timingsSection);
    }
    
    popup.appendChild(header);
    popup.appendChild(content);
    
    // Footer with actions
    const footer = document.createElement('div');
    footer.style.cssText = `
      padding: 20px 28px;
      background: ${colors.surface};
      border-top: 1px solid ${colors.border};
      display: flex;
      gap: 12px;
      justify-content: flex-end;
      flex-shrink: 0;
    `;
    
    const copyButton = createActionButton('Copy Result', colors.surface, colors.text, () => {
      copyResultToClipboard(result, claim, copyButton, colors);
    });
    
    const closeButton = createActionButton('Close', colors.primary, 'white', closeActivePopup);
    
    footer.appendChild(copyButton);
    footer.appendChild(closeButton);
    popup.appendChild(footer);
    
    // Event handlers
    const closeBtn = header.querySelector('#verinews-close-btn');
    closeBtn.onclick = closeActivePopup;
    
    overlay.onclick = (e) => {
      if (e.target === overlay) closeActivePopup();
    };
    
    overlay.onkeydown = (e) => {
      if (e.key === 'Escape') closeActivePopup();
    };
    
    // Setup and animate
    overlay.appendChild(popup);
    document.body.appendChild(overlay);
    VeriNewsState.activePopup = overlay;
    
    // Focus management
    popup.focus();
    
    // Animate in
    requestAnimationFrame(() => {
      overlay.style.opacity = '1';
      popup.style.transform = 'scale(1)';
    });
    
  } catch (error) {
    Logger.error('Failed to show verification popup', error);
    NotificationManager.showError('Failed to display verification results');
  }
}

// Helper function to create action buttons
function createActionButton(text, bgColor, textColor, onClick) {
  const button = document.createElement('button');
  button.style.cssText = `
    padding: 12px 24px;
    background: ${bgColor};
    color: ${textColor};
    border: 1px solid ${bgColor === '#f8fafc' ? '#e2e8f0' : 'transparent'};
    border-radius: 10px;
    font-size: 14px;
    font-weight: 600;
    cursor: pointer;
    transition: all 0.2s;
    font-family: inherit;
  `;
  button.textContent = text;
  button.onclick = onClick;
  
  button.addEventListener('mouseenter', () => {
    button.style.transform = 'translateY(-1px)';
    button.style.boxShadow = '0 4px 12px rgba(0,0,0,0.15)';
  });
  
  button.addEventListener('mouseleave', () => {
    button.style.transform = 'translateY(0)';
    button.style.boxShadow = 'none';
  });
  
  return button;
}

// Helper function to create sources section
function createSourcesSection(sources, colors) {
  const section = document.createElement('div');
  section.style.cssText = 'margin-bottom: 24px;';
  
  const header = document.createElement('h3');
  header.style.cssText = `
    font-size: 18px;
    font-weight: 600;
    margin-bottom: 16px;
    color: ${colors.text};
    display: flex;
    align-items: center;
    gap: 8px;
  `;
  header.innerHTML = `
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="${colors.textMuted}" stroke-width="2">
      <circle cx="12" cy="12" r="10"/>
      <path d="M8 14s1.5 2 4 2 4-2 4-2"/>
      <line x1="9" y1="9" x2="9.01" y2="9"/>
      <line x1="15" y1="9" x2="15.01" y2="9"/>
    </svg>
    Sources (${sources.length})
  `;
  
  const sourcesList = document.createElement('div');
  sourcesList.style.cssText = `
    display: flex;
    flex-direction: column;
    gap: 16px;
    max-height: 400px;
    overflow-y: auto;
    padding-right: 8px;
  `;
  
  sources.forEach((source, index) => {
    const sourceCard = createSourceCard(source, index, colors);
    sourcesList.appendChild(sourceCard);
  });
  
  section.appendChild(header);
  section.appendChild(sourcesList);
  
  return section;
}

// Helper function to create individual source cards
function createSourceCard(source, index, colors) {
  const card = document.createElement('div');
  card.style.cssText = `
    padding: 20px;
    background: ${colors.surface};
    border-radius: 16px;
    border: 1px solid ${colors.border};
    transition: all 0.2s;
  `;
  
  card.addEventListener('mouseenter', () => {
    card.style.transform = 'translateY(-2px)';
    card.style.boxShadow = '0 8px 25px rgba(0,0,0,0.1)';
  });
  
  card.addEventListener('mouseleave', () => {
    card.style.transform = 'translateY(0)';
    card.style.boxShadow = 'none';
  });
  
  const supportColors = {
    'Support': colors.success,
    'Contradict': colors.error,
    'Partial': colors.warning,
    'Neutral': colors.textMuted
  };
  
  const supportColor = supportColors[source.support] || colors.textMuted;
  const favicon = getFaviconUrl(source.url);
  
  card.innerHTML = `
    <div style="display: flex; align-items: center; gap: 12px; margin-bottom: 12px;">
      <img src="${favicon}" alt="Source favicon" style="
        width: 24px;
        height: 24px;
        border-radius: 6px;
        object-fit: cover;
        box-shadow: 0 2px 8px rgba(0,0,0,0.1);
      " onerror="this.style.display='none'"/>
      <span style="
        padding: 6px 12px;
        border-radius: 8px;
        font-size: 12px;
        font-weight: 600;
        background: ${supportColor}20;
        color: ${supportColor};
        border: 1px solid ${supportColor}40;
      ">${source.support || 'Unknown'}</span>
      ${source.confidence ? `<span style=\"font-size: 12px; color: ${colors.textMuted}; margin-left: auto;\">${source.confidence.toFixed(1)}% confidence</span>` : ''}
    </div>
    
    <a href="${source.url}" target="_blank" rel="noopener noreferrer" style="
      font-weight: 600;
      color: ${colors.primary};
      font-size: 15px;
      text-decoration: none;
      line-height: 1.4;
      display: block;
      margin-bottom: 8px;
      transition: color 0.2s;
    " onmouseover="this.style.textDecoration='underline'" onmouseout="this.style.textDecoration='none'">
      ${source.title || source.source || 'Untitled Source'}
    </a>
    
    ${source.snippet ? `
      <div style="
        color: ${colors.textMuted};
        font-size: 13px;
        line-height: 1.5;
        margin-bottom: 8px;
      ">${source.snippet}</div>
    ` : ''}
    
    ${source.reason ? `
      <div style="
        color: ${colors.text};
        font-size: 13px;
        line-height: 1.5;
        font-style: italic;
        background: ${colors.background};
        padding: 12px;
        border-radius: 8px;
        border-left: 3px solid ${supportColor};
      ">${source.reason}</div>
    ` : ''}
  `;
  
  return card;
}

// Helper function to create timing section
function createTimingsSection(timings, colors) {
  const section = document.createElement('div');
  section.style.cssText = 'margin-bottom: 16px;';
  
  const header = document.createElement('button');
  header.style.cssText = `
    background: ${colors.surface};
    color: ${colors.text};
    border: 1px solid ${colors.border};
    border-radius: 10px;
    padding: 12px 16px;
    font-size: 14px;
    font-weight: 600;
    cursor: pointer;
    display: flex;
    align-items: center;
    gap: 8px;
    transition: all 0.2s;
    width: 100%;
    justify-content: flex-start;
  `;
  
  header.innerHTML = `
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
      <circle cx="12" cy="12" r="10"/>
      <polyline points="12,6 12,12 16,14"/>
    </svg>
    Performance Metrics
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" style="margin-left: auto; transition: transform 0.2s;">
      <polyline points="6,9 12,15 18,9"/>
    </svg>
  `;

  // Collapsible content
  const content = document.createElement('div');
  content.style.cssText = `
    padding: 16px 0 0 0;
    display: block;
    transition: max-height 0.3s cubic-bezier(0.4,0,0.2,1);
  `;

  // Metrics
  const metrics = [
    { label: 'AI Analysis', value: timings.analysis || 0, color: colors.primary },
    { label: 'Database', value: timings.database || 0, color: colors.accent },
    { label: 'Web Scraping', value: timings.scraping || 0, color: colors.info }
  ];

  metrics.forEach(metric => {
    const row = document.createElement('div');
    row.style.cssText = `
      display: flex;
      align-items: center;
      justify-content: space-between;
      padding: 10px 0;
      font-size: 14px;
      border-bottom: 1px solid ${colors.border};
      gap: 12px;
    `;
    row.innerHTML = `
      <span style="display: flex; align-items: center; gap: 8px;">
        <span style="display:inline-block;width:10px;height:10px;border-radius:50%;background:${metric.color};"></span>
        ${metric.label}
      </span>
      <span style="font-weight: 600;">${metric.value.toFixed(2)}s</span>
    `;
    content.appendChild(row);
  });

  // Total
  const total = (timings.analysis || 0) + (timings.database || 0) + (timings.scraping || 0);
  const totalRow = document.createElement('div');
  totalRow.style.cssText = `
    display: flex;
    align-items: center;
    justify-content: space-between;
    padding: 12px 0 0 0;
    font-size: 15px;
    font-weight: 700;
    color: ${colors.primary};
  `;
  totalRow.innerHTML = `
    <span>Total Processing Time</span>
    <span>${total.toFixed(2)}s</span>
  `;
  content.appendChild(totalRow);

  // Collapsible toggle
  let expanded = false;
  content.style.display = 'none';
  header.onclick = () => {
    expanded = !expanded;
    content.style.display = expanded ? 'block' : 'none';
    header.querySelector('svg[style]')?.setAttribute('style', `margin-left: auto; transition: transform 0.2s; transform: rotate(${expanded ? 180 : 0}deg);`);
  };

  section.appendChild(content);
  return section;
}

// Helper to close active popup
function closeActivePopup() {
  if (VeriNewsState.activePopup) {
    VeriNewsState.activePopup.style.opacity = '0';
    setTimeout(() => {
      if (VeriNewsState.activePopup && VeriNewsState.activePopup.parentNode) {
        VeriNewsState.activePopup.remove();
      }
      VeriNewsState.activePopup = null;
    }, 300);
  }
}

// Helper to copy result to clipboard
function copyResultToClipboard(result, claim, button, colors) {
  const text = `Claim: "${claim}"
Verdict: ${result.verdict}
Confidence: ${result.confidence?.toFixed(1) ?? 'N/A'}%
Conclusion: ${result.conclusion ?? ''}
Explanation: ${result.explanation ?? ''}`;
  navigator.clipboard.writeText(text).then(() => {
    button.textContent = 'Copied!';
    button.style.background = colors.success;
    button.style.color = 'white';
    setTimeout(() => {
      button.textContent = 'Copy Result';
      button.style.background = colors.surface;
      button.style.color = colors.text;
    }, 1200);
    NotificationManager.showSuccess('Result copied to clipboard');
  }).catch(() => {
    NotificationManager.showError('Failed to copy result');
  });
}