// Enhanced Background Service Worker for VeriNews Chrome Extension
// Key Features: 1) Smart Text Selection, 2) Real-time Verification, 3) Comprehensive Results

// Initialize extension with enhanced settings
chrome.runtime.onInstalled.addListener(() => {
  // Enhanced default settings
  chrome.storage.sync.set({
    enabled: true,
    theme: 'system', // Auto-detect user preference
    contextMenuEnabled: true,
    soundEnabled: true,
    autoVerify: false,
    notificationDuration: 8,
    confidenceThreshold: 70, // Only show high-confidence results prominently
    maxTextLength: 1000, // Prevent overly long text verification
    cacheResults: true, // Cache verification results for 24h
    showSources: true,
    animationsEnabled: true
  });

  // Create enhanced context menu
  chrome.contextMenus.create({
    id: "verifyWithVeriNews",
    title: "🔍 Verify with VeriNews",
    contexts: ["selection"],
    documentUrlPatterns: ["http://*/*", "https://*/*"]
  });

  // Additional context menu for page analysis
  chrome.contextMenus.create({
    id: "analyzePageContent",
    title: "📊 Analyze Page Content",
    contexts: ["page"],
    documentUrlPatterns: ["http://*/*", "https://*/*"]
  });
});

// FEATURE 1: SMART TEXT SELECTION & CONTEXT DETECTION
chrome.action.onClicked.addListener(async (tab) => {
  if (!isValidTab(tab)) return;
  
  try {
    const settings = await chrome.storage.sync.get(['enabled', 'animationsEnabled']);
    if (!settings.enabled) {
      showNotification('VeriNews is disabled', 'Enable in extension settings');
      return;
    }

    // Inject enhanced content script with error handling
    await injectContentScript(tab.id);
    
    // Send activation message with settings
    await sendTabMessage(tab.id, { 
      action: 'activate', 
      settings: settings,
      timestamp: Date.now()
    });
    
    // Show user-friendly activation notice
    await sendTabMessage(tab.id, { action: 'showActivationNotice' });
    
  } catch (error) {
    handleError(error, 'Extension activation failed');
    showNotification('Activation Error', 'Please reload the page and try again');
  }
});

// FEATURE 2: REAL-TIME VERIFICATION WITH CACHING
chrome.contextMenus.onClicked.addListener(async (info, tab) => {
  if (info.menuItemId === "verifyWithVeriNews") {
    await handleTextVerification(info, tab);
  } else if (info.menuItemId === "analyzePageContent") {
    await handlePageAnalysis(tab);
  }
});

async function handleTextVerification(info, tab) {
  if (!info.selectionText || !isValidTab(tab)) return;
  
  try {
    const settings = await getSettings();
    if (!settings.enabled || !settings.contextMenuEnabled) {
      showNotification('VeriNews Disabled', 'Enable in extension settings');
      return;
    }

    const selectedText = info.selectionText.trim();
    
    // Validate text length and content
    if (!isValidTextForVerification(selectedText, settings.maxTextLength)) {
      showNotification('Invalid Selection', 'Text too short, long, or contains no meaningful content');
      return;
    }

    // Check cache first for performance
    const cacheKey = generateCacheKey(selectedText);
    const cachedResult = settings.cacheResults ? await getCachedResult(cacheKey) : null;
    
    if (cachedResult && !isResultExpired(cachedResult, 24 * 60 * 60 * 1000)) {
      await displayVerificationResult(tab.id, cachedResult, selectedText, true);
      return;
    }

    // Ensure content script is active
    const isActive = await pingContentScript(tab.id);
    if (!isActive) {
      await injectContentScript(tab.id);
      await new Promise(resolve => setTimeout(resolve, 100)); // Allow injection time
    }

    // Start verification process
    await verifyTextInBackground(selectedText, tab.id, cacheKey);
    
  } catch (error) {
    handleError(error, 'Text verification failed');
    await sendTabMessage(tab.id, { 
      action: 'showError', 
      message: 'Verification failed. Please try again.' 
    });
  }
}

// FEATURE 3: COMPREHENSIVE RESULTS WITH ENHANCED UI
async function verifyTextInBackground(text, tabId, cacheKey = null) {
  const startTime = Date.now();
  
  try {
    // Show enhanced loading indicator
    await sendTabMessage(tabId, { 
      action: 'showLoadingIndicator',
      text: text.substring(0, 100) + (text.length > 100 ? '...' : ''),
      startTime: startTime
    });

    // Make API request with timeout and retry logic
    const result = await makeVerificationRequest(text);
    
    // Cache successful results
    if (cacheKey && result.verdict) {
      await cacheResult(cacheKey, result);
    }

    // Display comprehensive results
    await displayVerificationResult(tabId, result, text, false);
    
    // Play notification sound if enabled
    const settings = await getSettings();
    if (settings.soundEnabled && result.confidence >= settings.confidenceThreshold) {
      playNotificationSound();
    }
    
  } catch (error) {
    await sendTabMessage(tabId, { action: 'hideLoadingIndicator' });
    
    if (error.name === 'AbortError') {
      await sendTabMessage(tabId, { 
        action: 'showError', 
        message: 'Verification timed out. The service may be busy.' 
      });
    } else {
      await sendTabMessage(tabId, { 
        action: 'showError', 
        message: `Verification failed: ${error.message}` 
      });
    }
    
    handleError(error, 'Background verification');
  }
}

async function makeVerificationRequest(text) {
  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), 30000);
  
  try {
    const response = await fetch('https://api.verinews.space/api/claims/verify', {
      method: 'POST',
      headers: { 
        'Content-Type': 'application/json',
        'User-Agent': 'VeriNews Extension v1.0'
      },
      body: JSON.stringify({ 
        claim: text,
        timestamp: Date.now(),
        source: 'extension'
      }),
      signal: controller.signal
    });
    
    clearTimeout(timeoutId);
    
    if (!response.ok) {
      throw new Error(`Server error: ${response.status} ${response.statusText}`);
    }
    
    const result = await response.json();
    
    // Validate API response structure
    if (!result || typeof result !== 'object') {
      throw new Error('Invalid response format from verification service');
    }
    
    // Ensure required fields with defaults
    return {
      verdict: result.verdict || 'Uncertain',
      confidence: Math.min(100, Math.max(0, Number(result.confidence) || 0)),
      conclusion: result.conclusion || 'No conclusion available',
      explanation: result.explanation || 'No detailed explanation provided',
      sources: Array.isArray(result.sources) ? result.sources : [],
      category: result.category || 'General',
      claim_id: result.claim_id || generateClaimId(),
      timings: result.timings || {},
      timestamp: Date.now()
    };
    
  } finally {
    clearTimeout(timeoutId);
  }
}

async function displayVerificationResult(tabId, result, originalText, fromCache) {
  await sendTabMessage(tabId, { action: 'hideLoadingIndicator' });
  
  // Enhanced result display with additional metadata
  const enhancedResult = {
    ...result,
    fromCache: fromCache,
    originalText: originalText,
    verificationTime: fromCache ? 'Cached' : 'Just verified',
    qualityScore: calculateQualityScore(result)
  };
  
  await sendTabMessage(tabId, { 
    action: 'showVerificationResult', 
    result: enhancedResult, 
    claim: originalText,
    displayMode: 'comprehensive'
  });
}

// UTILITY FUNCTIONS

function isValidTab(tab) {
  return tab?.id && tab?.url && (tab.url.startsWith('http://') || tab.url.startsWith('https://'));
}

function isValidTextForVerification(text, maxLength) {
  if (!text || text.length < 10) return false;
  if (text.length > maxLength) return false;
  
  // Check if text contains meaningful content (not just punctuation/numbers)
  const meaningfulChars = text.replace(/[^\p{L}\p{N}\s]/gu, '').trim();
  return meaningfulChars.length >= 5;
}

async function injectContentScript(tabId) {
  try {
    await chrome.scripting.executeScript({
      target: { tabId: tabId },
      files: ['content.js'],
      injectImmediately: true
    });
  } catch (error) {
    throw new Error(`Script injection failed: ${error.message}`);
  }
}

async function sendTabMessage(tabId, message) {
  return new Promise((resolve) => {
    chrome.tabs.sendMessage(tabId, message, (response) => {
      if (chrome.runtime.lastError) {
        console.warn('Message send failed:', chrome.runtime.lastError.message);
        resolve(null);
      } else {
        resolve(response);
      }
    });
  });
}

async function pingContentScript(tabId) {
  return new Promise((resolve) => {
    chrome.tabs.sendMessage(tabId, { action: 'ping' }, (response) => {
      resolve(!chrome.runtime.lastError && response?.success);
    });
  });
}

async function getSettings() {
  return await chrome.storage.sync.get([
    'enabled', 'contextMenuEnabled', 'soundEnabled', 'maxTextLength',
    'confidenceThreshold', 'cacheResults', 'animationsEnabled'
  ]);
}

function generateCacheKey(text) {
  // Simple hash function for cache keys
  let hash = 0;
  for (let i = 0; i < text.length; i++) {
    const char = text.charCodeAt(i);
    hash = ((hash << 5) - hash) + char;
    hash = hash & hash; // Convert to 32-bit integer
  }
  return `verify_${Math.abs(hash)}`;
}

async function getCachedResult(key) {
  try {
    const result = await chrome.storage.local.get(key);
    return result[key] || null;
  } catch {
    return null;
  }
}

async function cacheResult(key, result) {
  try {
    await chrome.storage.local.set({
      [key]: {
        ...result,
        cachedAt: Date.now()
      }
    });
  } catch (error) {
    console.warn('Failed to cache result:', error);
  }
}

function isResultExpired(cachedResult, maxAge) {
  return !cachedResult.cachedAt || (Date.now() - cachedResult.cachedAt) > maxAge;
}

function calculateQualityScore(result) {
  let score = 0;
  
  // Base score from confidence
  score += (result.confidence || 0) * 0.4;
  
  // Bonus for having sources
  if (result.sources && result.sources.length > 0) {
    score += Math.min(30, result.sources.length * 5);
  }
  
  // Bonus for detailed explanation
  if (result.explanation && result.explanation.length > 50) {
    score += 15;
  }
  
  // Bonus for definitive verdict
  if (result.verdict && ['True', 'False'].includes(result.verdict)) {
    score += 10;
  }
  
  return Math.min(100, Math.max(0, score));
}

function generateClaimId() {
  return 'ext_' + Date.now() + '_' + Math.random().toString(36).substr(2, 9);
}

function showNotification(title, message) {
  if (chrome.notifications) {
    chrome.notifications.create({
      type: 'basic',
      iconUrl: 'icon-48.png',
      title: title,
      message: message
    });
  }
}

function playNotificationSound() {
  chrome.storage.sync.get(['soundEnabled'], (result) => {
    if (result.soundEnabled !== false) {
      // Send message to content script to play sound
      chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
        if (tabs[0]) {
          sendTabMessage(tabs[0].id, { action: 'playCustomSound' });
        }
      });
    }
  });
}

function handleError(error, context) {
  console.error(`${context}:`, error);
  
  // Log to extension analytics in production
  if (typeof chrome !== "undefined" && chrome.runtime) {
    chrome.storage.local.get(['errorLog'], (result) => {
      const errorLog = result.errorLog || [];
      errorLog.push({
        context: context,
        error: error.message || error.toString(),
        timestamp: Date.now(),
        stack: error.stack
      });
      
      // Keep only last 50 errors
      if (errorLog.length > 50) {
        errorLog.splice(0, errorLog.length - 50);
      }
      
      chrome.storage.local.set({ errorLog });
    });
  }
}

// Handle page analysis feature
async function handlePageAnalysis(tab) {
  if (!isValidTab(tab)) return;
  
  try {
    const isActive = await pingContentScript(tab.id);
    if (!isActive) {
      await injectContentScript(tab.id);
    }
    
    await sendTabMessage(tab.id, { action: 'analyzePageContent' });
    
  } catch (error) {
    handleError(error, 'Page analysis failed');
    showNotification('Analysis Error', 'Failed to analyze page content');
  }
}

// Listen for messages from content script
chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
  if (message.action === 'verifyClaim' && sender.tab?.id) {
    handleTextVerification({ selectionText: message.claim }, sender.tab)
      .then(() => sendResponse({ success: true }))
      .catch(error => {
        handleError(error, 'Message handler verification');
        sendResponse({ success: false, error: error.message });
      });
    return true; // Keep message channel open
  }
  
  if (message.action === 'getSettings') {
    getSettings()
      .then(settings => sendResponse({ success: true, settings }))
      .catch(error => sendResponse({ success: false, error: error.message }));
    return true;
  }
  
  sendResponse({ success: false, error: 'Unknown action' });
});