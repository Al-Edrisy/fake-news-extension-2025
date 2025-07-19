// Background service worker for Chrome extension
chrome.runtime.onInstalled.addListener(() => {
  console.log('VeriNews Extension installed');
  
  // Set default settings
  chrome.storage.sync.set({
    enabled: true,
    theme: 'light',
    contextMenuEnabled: true,
    soundEnabled: true,
    autoVerify: false,
    notificationDuration: 10 // seconds
  });

  // Create context menu
  chrome.contextMenus.create({
    id: "verifyWithVeriNews",
    title: "Verify with VeriNews",
    contexts: ["selection"]
  });
});

// Set extension icon badge to indicate text selection is available
chrome.tabs.onActivated.addListener(async (activeInfo) => {
  try {
    const tab = await chrome.tabs.get(activeInfo.tabId);
    if (tab.url && tab.url.startsWith('http')) {
      // Set badge to indicate text selection is available
      chrome.action.setBadgeText({ 
        text: '✓', 
        tabId: activeInfo.tabId 
      });
      chrome.action.setBadgeBackgroundColor({ 
        color: '#22c55e', 
        tabId: activeInfo.tabId 
      });
    } else {
      chrome.action.setBadgeText({ 
        text: '', 
        tabId: activeInfo.tabId 
      });
    }
  } catch (error) {
    console.log('Error setting badge:', error);
  }
});

// Handle context menu clicks
chrome.contextMenus.onClicked.addListener(async (info, tab) => {
  if (info.menuItemId === "verifyWithVeriNews" && info.selectionText) {
    // Ensure content script is injected before verifying
    try {
      await chrome.scripting.executeScript({
        target: { tabId: tab.id },
        files: ['content.js']
      });
      
      // Clear the badge to indicate text selection is now active
      chrome.action.setBadgeText({ 
        text: '', 
        tabId: tab.id 
      });
    } catch (error) {
      console.log('Content script already injected or failed to inject');
    }
    
    // Verify the selected text
    verifyClaimInBackground(info.selectionText, tab.id);
  }
});

// Handle extension icon click - injects content script and enables text selection functionality
chrome.action.onClicked.addListener(async (tab) => {
  try {
    if (tab.url && tab.url.startsWith('http')) {
      await chrome.scripting.executeScript({
        target: { tabId: tab.id },
        files: ['content.js']
      });
      
      // Clear the badge to indicate text selection is now active
      chrome.action.setBadgeText({ 
        text: '', 
        tabId: tab.id 
      });
      
      // Send message to show the floating verify button
      setTimeout(() => {
        chrome.tabs.sendMessage(tab.id, { action: 'showFloatingButton' });
      }, 100);
      
      console.log('Content script injected and text selection enabled for tab:', tab.id);
    }
  } catch (error) {
    console.log('Error handling extension icon click:', error);
  }
});

// Handle messages from content script
chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
  if (request.action === 'verifyClaim' && request.claim) {
    // Verify the claim from content script
    verifyClaimInBackground(request.claim, sender.tab.id);
    sendResponse({ success: true });
  }
  return true; // Keep the message channel open for async responses
});

// Helper function to inject content script and send messages
async function injectContentScriptAndSendMessage(tabId, message, callback = () => {}) {
  try {
    const tab = await chrome.tabs.get(tabId);
    if (!tab || !tab.url || !tab.url.startsWith('http')) {
      console.log('Tab not suitable for content script injection');
      return;
    }

    // Inject content script first
    await chrome.scripting.executeScript({
      target: { tabId: tabId },
      files: ['content.js']
    });

    // Wait a moment for the script to load
    setTimeout(() => {
      chrome.tabs.sendMessage(tabId, message, (response) => {
        if (chrome.runtime.lastError) {
          console.warn('Content script not available:', chrome.runtime.lastError.message);
        } else if (callback) {
          callback(response);
        }
      });
    }, 100);
  } catch (error) {
    console.log('Error injecting content script:', error);
  }
}

// Helper function to safely send messages to content scripts
function safeSendMessage(tabId, message, callback = () => {}) {
  try {
    chrome.tabs.get(tabId, (tab) => {
      if (chrome.runtime.lastError) {
        console.log('Tab not found:', chrome.runtime.lastError.message);
        return;
      }
      if (!tab || !tab.url || !tab.url.startsWith('http')) {
        console.log('Tab not suitable for content script injection');
        return;
      }
      chrome.tabs.sendMessage(tabId, message, (response) => {
        if (chrome.runtime.lastError) {
          // Content script not available, inject it first
          injectContentScriptAndSendMessage(tabId, message, callback);
        } else if (callback) {
          callback(response);
        }
      });
    });
  } catch (error) {
    console.log('Error sending message to content script:', error);
  }
}

// Function to verify claim in background
async function verifyClaimInBackground(claim, tabId) {
  try {
    // Show loading indicator first
    safeSendMessage(tabId, { action: 'showLoadingIndicator' });
    
    // Add timeout to prevent hanging
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 30000); // 30s timeout
    
    const response = await fetch('http://13.60.241.86:5000/api/claims/verify', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ claim: claim.trim() }),
      signal: controller.signal
    });
    
    clearTimeout(timeoutId);

    if (response.ok) {
      const result = await response.json();
      
      // Hide loading indicator
      safeSendMessage(tabId, { action: 'hideLoadingIndicator' });
      
      // Play notification sound if enabled
      chrome.storage.sync.get(['soundEnabled'], (result) => {
        if (result.soundEnabled !== false) { // Default to true
          playNotificationSound();
        }
      });

      // Send result to content script
      safeSendMessage(tabId, {
        action: 'showVerificationResult',
        result: result,
        claim: claim
      }, (response) => {
        // If content script is not available, show popup in background
        if (chrome.runtime.lastError) {
          showVerificationPopup(result, claim);
        }
      });
      
    } else {
      throw new Error(`Server responded with status: ${response.status}`);
    }
  } catch (error) {
    console.error('Verification failed:', error);
    
    // Hide loading indicator
    safeSendMessage(tabId, { action: 'hideLoadingIndicator' });
    
    // Show error message
    const errorMessage = error.name === 'AbortError' ? 
      'Verification timed out (30s)' : 
      error.message || 'Failed to verify claim';
    
    safeSendMessage(tabId, {
      action: 'showVerificationError',
      error: errorMessage
    }, (response) => {
      // If content script is not available, show error popup in background
      if (chrome.runtime.lastError) {
        showVerificationPopup({ 
          verdict: 'Error',
          confidence: 0,
          conclusion: errorMessage,
          sources: []
        }, claim);
      }
    });
  }
}

// Play notification sound from extension assets
function playNotificationSound() {
  try {
    // Create audio from extension assets
    const audio = new Audio(chrome.runtime.getURL('notification.mp3'));
    audio.volume = 0.6; // Adjust volume
    audio.play().catch(e => console.log('Sound playback failed:', e));
  } catch (error) {
    console.log('Could not play notification sound:', error);
    // Fallback to Web Audio API
    fallbackNotificationSound();
  }
}

// Fallback notification sound using Web Audio API
function fallbackNotificationSound() {
  try {
    const audioContext = new (window.AudioContext || window.webkitAudioContext)();
    const oscillator = audioContext.createOscillator();
    const gainNode = audioContext.createGain();
    
    oscillator.connect(gainNode);
    gainNode.connect(audioContext.destination);
    
    oscillator.frequency.setValueAtTime(800, audioContext.currentTime);
    oscillator.frequency.setValueAtTime(600, audioContext.currentTime + 0.1);
    
    gainNode.gain.setValueAtTime(0.1, audioContext.currentTime);
    gainNode.gain.exponentialRampToValueAtTime(0.01, audioContext.currentTime + 0.2);
    
    oscillator.start(audioContext.currentTime);
    oscillator.stop(audioContext.currentTime + 0.2);
  } catch (error) {
    console.log('Could not play fallback notification sound:', error);
  }
}

// Show verification popup in background page
function showVerificationPopup(data, claim = '') {
  // Remove any existing popup
  const oldPopup = document.getElementById('verinews-popup');
  if (oldPopup) oldPopup.remove();

  chrome.storage.sync.get(['notificationDuration'], (result) => {
    const duration = (result.notificationDuration || 10) * 1000;

    // Verdict color/icon
    const verdictMap = {
      True: { color: '#22c55e', bg: '#dcfce7', icon: '✔️' },
      False: { color: '#ef4444', bg: '#fee2e2', icon: '❌' },
      Partial: { color: '#eab308', bg: '#fef3c7', icon: '🟡' },
      Uncertain: { color: '#3b82f6', bg: '#dbeafe', icon: '❓' },
      Unknown: { color: '#64748b', bg: '#f3f4f6', icon: '❓' },
      Error: { color: '#ef4444', bg: '#fee2e2', icon: '❌' }
    };
    const verdict = (data.verdict || 'Unknown');
    const verdictInfo = verdictMap[verdict] || verdictMap.Unknown;

    // Card container
    const popup = document.createElement('div');
    popup.id = 'verinews-popup';
    popup.setAttribute('role', 'dialog');
    popup.setAttribute('aria-modal', 'true');
    popup.tabIndex = 0;
    popup.style.position = 'fixed';
    popup.style.bottom = '32px';
    popup.style.right = '32px';
    popup.style.zIndex = '99999';
    popup.style.background = 'hsl(var(--card))';
    popup.style.border = '1.5px solid hsl(var(--border))';
    popup.style.borderRadius = '18px';
    popup.style.boxShadow = '0 8px 32px rgba(0,0,0,0.18), 0 2px 8px rgba(0,0,0,0.10)';
    popup.style.padding = '0';
    popup.style.maxWidth = '420px';
    popup.style.width = '90vw';
    popup.style.fontFamily = 'system-ui, -apple-system, sans-serif';
    popup.style.maxHeight = '80vh';
    popup.style.overflowY = 'auto';
    popup.style.minWidth = '320px';
    popup.style.opacity = '0';
    popup.style.transform = 'translateY(30px)';
    popup.style.transition = 'opacity 0.3s cubic-bezier(.4,0,.2,1), transform 0.3s cubic-bezier(.4,0,.2,1)';

    // Timings
    let timingsHtml = '';
    if (data.timings) {
      timingsHtml =
        '<div style="margin-top:18px; padding:12px; background:#f8fafc; border-radius:10px; border:1px solid #e5e7eb;">' +
          '<div style="font-weight:600; color:hsl(var(--primary-text)); margin-bottom:8px;">Performance Timings</div>' +
          '<div style="display:flex; gap:12px; font-size:13px; color:hsl(var(--secondary-text));">' +
            `<span>Analysis: <b>${data.timings.analysis.toFixed(2)}s</b></span>` +
            `<span>DB: <b>${data.timings.database.toFixed(2)}s</b></span>` +
            `<span>Scraping: <b>${data.timings.scraping.toFixed(2)}s</b></span>` +
          '</div>' +
        '</div>';
    }

    // Sources
    let sourcesHtml = `
  <div style="margin-top:18px;">
    <div style="font-weight:600; color:hsl(var(--primary-text)); margin-bottom:8px; display:flex; align-items:center; gap:6px;">
      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="hsl(var(--secondary-text))"><circle cx="12" cy="12" r="10"></circle></svg>
      Sources (${data.sources.length})
    </div>
    <div style="max-height:200px; overflow-y:auto; padding-right:4px;">
      ${data.sources.map(src => `
        <div style="margin-bottom:14px; padding:12px; background:#f9fafb; border-radius:8px; border:1px solid #e5e7eb;">
          <div style="display:flex; align-items:center; gap:8px; margin-bottom:6px;">
            <span style="padding:3px 8px; border-radius:4px; font-size:12px; font-weight:600; background:${src.support==='Support'?'#dcfce7':src.support==='Contradict'?'#fee2e2':src.support==='Partial'?'#fef3c7':'#f3f4f6'}; color:${src.support==='Support'?'#166534':src.support==='Contradict'?'#991b1b':src.support==='Partial'?'#92400e':'#64748b'};">${src.support}</span>
            <span style="color:hsl(var(--secondary-text)); font-size:12px;">${src.confidence?.toFixed(1) || '0'}%</span>
            ${src.authoritative ? '<span style="padding:3px 6px; border-radius:4px; font-size:11px; background:#dbeafe; color:#1e40af;">Auth</span>' : ''}
            <a href="${src.url}" target="_blank" rel="noopener noreferrer" style="margin-left:auto; color:#3b82f6; font-size:12px; text-decoration:underline;">Visit</a>
          </div>
          ${src.title ? `<div style="font-weight:600; color:hsl(var(--primary-text)); margin-bottom:2px; font-size:14px;">${src.title}</div>` : ''}
          ${src.snippet ? `<div style="color:hsl(var(--primary-text)); font-size:13px; margin-bottom:2px;">${src.snippet}</div>` : ''}
          ${src.reason ? `<div style="color:hsl(var(--secondary-text)); font-size:12px; margin-bottom:2px;">${src.reason}</div>` : ''}
          ${src.relevant === false ? `<div style="color:#ef4444; font-size:12px;">Irrelevant</div>` : ''}
        </div>
      `).join('')}
    </div>
  </div>
`;

    // Copy button
    const copyBtnHtml = '<button id="copy-verinews-claim" style="padding:6px 12px; background:#f1f5f9; border:1px solid #e5e7eb; border-radius:6px; cursor:pointer; font-size:13px; color:hsl(var(--primary-text)); margin-right:8px;">Copy</button>';

    // Main content
    popup.innerHTML =
      `<div style="padding:24px 24px 18px 24px;">
        <div style="display:flex; align-items:center; gap:12px; margin-bottom:10px;">
          <span style="font-size:1.7rem; background:${verdictInfo.bg}; color:${verdictInfo.color}; border-radius:8px; padding:4px 10px; font-weight:700;">${verdictInfo.icon}</span>
          <span style="font-size:1.2rem; font-weight:700; color:${verdictInfo.color};">${verdict}</span>
          <span style="margin-left:auto; font-size:13px; color:hsl(var(--secondary-text));">${data.category ? data.category.charAt(0).toUpperCase() + data.category.slice(1) : ''}</span>
        </div>
        <div style="font-size:15px; color:hsl(var(--primary-text)); font-weight:600; margin-bottom:6px;">${data.conclusion || 'No conclusion available'}</div>
        <div style="margin-bottom:10px; color:hsl(var(--secondary-text)); font-size:13px;">${data.explanation || ''}</div>
        <div style="display:flex; align-items:center; gap:8px; margin-bottom:10px;">
          <div style="flex:1; height:8px; background:#f1f5f9; border-radius:4px; overflow:hidden;">
            <div style="height:100%; background:${verdictInfo.color}; width:${Math.round(data.confidence || 0)}%; transition:width 0.7s; border-radius:4px;"></div>
          </div>
          <span style="font-size:13px; color:${verdictInfo.color}; font-weight:600; min-width:38px; text-align:right;">${(data.confidence !== undefined && data.confidence !== null) ? Number(data.confidence).toFixed(1) : '0'}%</span>
        </div>
        <div style="display:flex; align-items:center; gap:8px; margin-bottom:10px;">
          ${copyBtnHtml}
          <span style="font-size:12px; color:hsl(var(--secondary-text));">Claim ID: <span style="font-family:monospace;">${data.claim_id || ''}</span></span>
        </div>
        ${timingsHtml}
        ${sourcesHtml}
        <div style="margin-top:18px; display:flex; justify-content:flex-end;">
          <button id="close-verinews-popup" style="padding:6px 12px; background:#e2e8f0; border:1px solid #cbd5e1; border-radius:6px; cursor:pointer; font-size:13px; color:hsl(var(--primary-text));">Close</button>
        </div>
      </div>`;

    // Copy button logic
    popup.querySelector('#copy-verinews-claim').onclick = () => {
      navigator.clipboard.writeText(
        `Claim: ${claim || ''}\nConclusion: ${data.conclusion || ''}\nExplanation: ${data.explanation || ''}\nConfidence: ${data.confidence || ''}%\nCategory: ${data.category || ''}\nClaim ID: ${data.claim_id || ''}`
      );
    };

    // Close button logic
    popup.querySelector('#close-verinews-popup').onclick = () => {
      popup.style.opacity = '0';
      popup.style.transform = 'translateY(30px)';
      setTimeout(() => popup.remove(), 300);
    };

    // Animate in
    setTimeout(() => {
      popup.style.opacity = '1';
      popup.style.transform = 'translateY(0)';
      popup.focus();
    }, 10);

    // Auto-remove after duration
    setTimeout(() => {
      if (popup.parentNode) {
        popup.style.opacity = '0';
        popup.style.transform = 'translateY(30px)';
        setTimeout(() => popup.remove(), 300);
      }
    }, duration);
  });
}

// Handle messages from other parts of the extension
chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
  console.log('Background received message:', message, sender);
  if (message.action === 'showVerificationResult') {
    showVerificationPopup(message.result, message.claim);
  }
  if (message.action === 'showVerificationError') {
    showVerificationPopup({ 
      verdict: 'Error',
      confidence: 0,
      conclusion: message.error,
      sources: []
    });
  }
  if (message.action === 'verifyClaim') {
    verifyClaimInBackground(message.claim, sender.tab ? sender.tab.id : undefined);
  }
  sendResponse({ success: true });
  return true;
});

// On every page load, check and request permission for text selection feature
chrome.tabs.onUpdated.addListener((tabId, changeInfo, tab) => {
  if (changeInfo.status === 'complete' && tab.url && tab.url.startsWith('http')) {
    const url = new URL(tab.url);
    const origin = url.origin + '/*';
    chrome.permissions.contains({origins: [origin]}, (hasPerm) => {
      if (hasPerm) {
        // Already have permission, inject content script
        chrome.scripting.executeScript({
          target: { tabId: tabId },
          files: ['content.js']
        }, () => {
          console.log('Content script auto-injected for', origin);
        });
      } else {
        // Request permission for this site
        chrome.permissions.request({origins: [origin]}, (granted) => {
          if (granted) {
            chrome.scripting.executeScript({
              target: { tabId: tabId },
              files: ['content.js']
            }, () => {
              console.log('Content script injected after permission for', origin);
            });
          } else {
            console.log('User denied permission for', origin);
          }
        });
      }
    });
  }
});

// Handle extension startup
chrome.runtime.onStartup.addListener(() => {
  console.log('VeriNews Extension starting up');
});

// Handle extension wakeup
chrome.runtime.onSuspend.addListener(() => {
  console.log('VeriNews Extension suspending');
});