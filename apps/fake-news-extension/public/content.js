
// Content script that runs on web pages
console.log('VeriNews Extension content script loaded');

// Initialize text selection functionality immediately
initializeTextSelection();

// Theme system integration
const getThemeColors = () => {
  // Get computed styles from the page to detect theme
  const root = document.documentElement;
  const computedStyle = getComputedStyle(root);
  
  // Check if dark mode is active
  const isDark = root.classList.contains('dark') || 
                 window.matchMedia('(prefers-color-scheme: dark)').matches;
  
  return {
    background: isDark ? 'hsl(217, 100%, 15%)' : 'hsl(0, 0%, 100%)',
    card: isDark ? 'hsl(216, 79%, 19%)' : 'hsl(0, 0%, 100%)',
    border: isDark ? 'hsl(217, 44%, 37%)' : 'hsl(220, 22%, 92%)',
    primary: 'hsl(348, 85%, 60%)',
    secondary: 'hsl(345, 100%, 57%)',
    accent: 'hsl(73, 55%, 67%)',
    text: isDark ? 'hsl(0, 0%, 100%)' : 'hsl(217, 84%, 15%)',
    muted: isDark ? 'hsl(228, 35%, 84%)' : 'hsl(217, 66%, 33%)',
    error: isDark ? 'hsl(348, 70%, 50%)' : 'hsl(348, 60%, 45%)',
    surface: isDark ? 'hsl(216, 79%, 19%)' : 'hsl(218, 35%, 97%)',
    success: 'hsl(107, 41%, 81%)',
    warning: isDark ? 'hsl(37, 94%, 65%)' : 'hsl(37, 94%, 52%)',
  };
};

// Utility function to get favicon for a domain
const getFaviconUrl = (url) => {
  try {
    const domain = new URL(url).hostname;
    return `https://www.google.com/s2/favicons?domain=${domain}&sz=32`;
  } catch {
    return null;
  }
};

// Listen for messages from popup or background script
if (typeof chrome !== "undefined" && chrome.runtime && chrome.runtime.onMessage) {
  chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
    console.log('Content script received message:', request);
    
    try {
      if (request.action === 'highlightText') {
        highlightPageText();
        sendResponse({ success: true });
      }
      
      if (request.action === 'getPageInfo') {
        const pageInfo = {
          title: document.title,
          url: window.location.href,
          textLength: document.body.innerText.length
        };
        sendResponse(pageInfo);
      }
      
      if (request.action === 'showVerificationResult') {
        showVerificationPopup(request.result, request.claim);
        sendResponse({ success: true });
      }
      
      if (request.action === 'showVerificationError') {
        showErrorNotification(request.error);
        sendResponse({ success: true });
      }
  
      if (request.action === 'showLoadingIndicator') {
        showLoadingIndicatorAtSelection();
        sendResponse({ success: true });
      }
      
      if (request.action === 'hideLoadingIndicator') {
        removeLoadingIndicator();
        sendResponse({ success: true });
      }
      
      if (request.action === 'playCustomSound') {
        playCustomSound();
        sendResponse({ success: true });
      }
      
      if (request.action === 'showFloatingButton') {
        showFloatingVerifyButton();
        sendResponse({ success: true });
      }
      
      if (request.action === 'ping') {
        sendResponse({ success: true, message: 'Content script is active' });
      }
    } catch (error) {
      console.error('Error handling message in content script:', error);
      sendResponse({ success: false, error: error.message });
    }
    
    return true; // Keep the message channel open for async responses
  });
} else {
  console.warn("chrome.runtime.onMessage is not available in this context.");
}

// Example function to highlight text on the page
function highlightPageText() {
  // Remove existing highlights
  document.querySelectorAll('.lovable-highlight').forEach(el => {
    el.classList.remove('lovable-highlight');
  });
  
  // Add highlight style
  const style = document.createElement('style');
  style.textContent = `
    .lovable-highlight {
      background-color: #fef08a !important;
      transition: background-color 0.3s ease !important;
    }
  `;
  document.head.appendChild(style);
  
  // Highlight paragraphs
  document.querySelectorAll('p').forEach(p => {
    if (p.innerText.trim().length > 50) {
      p.classList.add('lovable-highlight');
    }
  });
}

// --- Enhanced Loading indicator logic ---
function showLoadingIndicatorAtSelection() {
  removeLoadingIndicator();
  const c = getThemeColors();
  
  const indicator = document.createElement('div');
  indicator.id = 'verinews-loading-indicator';
  indicator.style.cssText = `
    position: fixed;
    z-index: 2147483647;
    background: hsl(var(--card, #fff));
    color: hsl(var(--primary-text, #222));
    border: 1px solid hsl(var(--primary, #e11d48));
    border-radius: 8px;
    box-shadow: 0 4px 16px rgba(0,0,0,0.12), 0 2px 8px rgba(0,0,0,0.08);
    padding: 8px 12px;
    font-size: 12px;
    font-weight: 500;
    font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
    display: flex;
    align-items: center;
    gap: 8px;
    pointer-events: auto;
    user-select: none;
    transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
    opacity: 0;
    transform: translateY(-10px) scale(0.95);
    cursor: grab;
    backdrop-filter: blur(8px);
    min-width: 160px;
    max-width: 200px;
  `;
  indicator.setAttribute('aria-live', 'polite');
  indicator.innerHTML = `
    <div style="position: relative; width: 16px; height: 16px;">
      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
        <circle cx="12" cy="12" r="10" stroke="hsl(var(--primary, #e11d48))" stroke-width="2" opacity="0.2"/>
        <path d="M22 12a10 10 0 0 1-10 10" stroke="hsl(var(--primary, #e11d48))" stroke-width="2" stroke-linecap="round">
          <animateTransform attributeName="transform" type="rotate" from="0 12 12" to="360 12 12" dur="1s" repeatCount="indefinite"/>
        </path>
      </svg>
    </div>
    <div style="flex: 1; min-width: 0;">
      <div id="verinews-loading-text" style="font-weight: 500; color: hsl(var(--primary-text, #222)); font-size: 11px;">Analyzing...</div>
      <div id="verinews-loading-timer" style="font-size: 10px; color: hsl(var(--muted-text, #6b7280)); font-weight: 400;">0.0s</div>
    </div>
    <div style="width: 6px; height: 6px; background: hsl(var(--primary, #e11d48)); border-radius: 50%; animation: pulse 2s infinite;"></div>
  `;
  
  // Add pulse animation
  const style = document.createElement('style');
  style.textContent = `
    @keyframes pulse {
      0%, 100% { opacity: 1; transform: scale(1); }
      50% { opacity: 0.5; transform: scale(1.2); }
    }
  `;
  document.head.appendChild(style);
  
  // Position in center of screen for better visibility
  const x = window.innerWidth / 2;
  const y = window.innerHeight / 2;
  
  indicator.style.left = `${x}px`;
  indicator.style.top = `${y}px`;
  indicator.style.transform = 'translate(-50%, -50%) scale(0.95)';
  indicator.style.position = 'fixed';
  document.body.appendChild(indicator);

  // Animate in
  requestAnimationFrame(() => {
    indicator.style.opacity = '1';
    indicator.style.transform = 'translate(-50%, -50%) scale(1)';
  });

  // Enhanced movable logic
  let isDragging = false, startX = 0, startY = 0, startLeft = 0, startTop = 0;
  indicator.addEventListener('mousedown', (e) => {
    if (e.target.closest('svg, .pulse')) return; // Don't drag when clicking on spinner or pulse
    isDragging = true;
    startX = e.clientX;
    startY = e.clientY;
    const rect = indicator.getBoundingClientRect();
    startLeft = rect.left;
    startTop = rect.top;
    indicator.style.cursor = 'grabbing';
    indicator.style.transform = 'scale(0.98)';
    document.body.style.userSelect = 'none';
  });
  
  document.addEventListener('mousemove', onDrag);
  document.addEventListener('mouseup', onStopDrag);
  
  function onDrag(e) {
    if (!isDragging) return;
    let newLeft = startLeft + (e.clientX - startX);
    let newTop = startTop + (e.clientY - startY);
    // Keep within viewport
    const minMargin = 20;
    newLeft = Math.max(minMargin, Math.min(window.innerWidth - indicator.offsetWidth - minMargin, newLeft));
    newTop = Math.max(minMargin, Math.min(window.innerHeight - indicator.offsetHeight - minMargin, newTop));
    indicator.style.left = newLeft + 'px';
    indicator.style.top = newTop + 'px';
    indicator.style.position = 'fixed';
  }
  
  function onStopDrag() {
    if (isDragging) {
      isDragging = false;
      indicator.style.cursor = 'grab';
      indicator.style.transform = 'scale(1)';
      document.body.style.userSelect = '';
    }
  }
  
  indicator.addEventListener('mouseleave', onStopDrag);

  // Simple timer logic
  let startTime = Date.now();
  let timerInterval = setInterval(() => {
    const elapsed = (Date.now() - startTime) / 1000;
    const timerSpan = indicator.querySelector('#verinews-loading-timer');
    if (timerSpan) {
      timerSpan.textContent = `${elapsed.toFixed(1)}s`;
    }
  }, 100);
  indicator.dataset.timerInterval = timerInterval;
}

function removeLoadingIndicator() {
  const el = document.getElementById('verinews-loading-indicator');
  if (el) {
    // Animate out
    el.style.opacity = '0';
    el.style.transform = 'translateY(-10px) scale(0.95)';
    
    // Remove timer interval if exists
    if (el.dataset.timerInterval) {
      clearInterval(Number(el.dataset.timerInterval));
    }
    
    // Clean up event listeners
    document.removeEventListener('mousemove', null);
    document.removeEventListener('mouseup', null);
    
    // Remove after animation
    setTimeout(() => {
      if (el.parentNode) el.remove();
    }, 300);
  }
}

// --- Helper functions for UI rendering ---
function getVerdictStyle(verdict, c) {
  switch (verdict) {
    case 'True':
      return { color: c.success, icon: '✓', bg: 'hsl(var(--success) / 0.15)' };
    case 'False':
      return { color: c.error, icon: '✗', bg: 'hsl(var(--error) / 0.15)' };
    case 'Partial':
      return { color: c.warning, icon: '🟡', bg: 'hsl(var(--warning) / 0.15)' };
    case 'Uncertain':
      return { color: c.info, icon: '❓', bg: 'hsl(var(--info) / 0.15)' };
    default:
      return { color: c.muted, icon: '?', bg: 'hsl(var(--muted-text) / 0.15)' };
  }
}

function renderConfidenceBar(confidence, c) {
  // confidence: 0-100
  const percent = Math.max(0, Math.min(100, Number(confidence) || 0));
  return `
    <div style="margin: 4px 0 8px 0; width: 100%;">
      <div style="height: 8px; background: hsl(var(--muted)); border-radius: 4px; overflow: hidden;">
        <div style="height: 100%; width: ${percent}%; background: hsl(var(--primary)); transition: width 0.7s; border-radius: 4px;"></div>
      </div>
      <span style="font-size: 12px; color: ${c.muted};">Confidence: <b style="color:${c.text};">${percent.toFixed(1)}%</b></span>
    </div>
  `;
}

function renderSourcesConfidenceChart(sources, c) {
  if (!Array.isArray(sources) || sources.length === 0) return '';
  // Prepare data
  const max = 100;
  return `
    <div style="margin-bottom: 18px;">
      <div style="font-weight:600; color:${c.text}; margin-bottom:8px; font-size:15px;">Sources Confidence Overview</div>
      <div style="display: flex; flex-direction: column; gap: 8px;">
        ${sources.map(src => {
          const percent = Math.max(0, Math.min(100, Number(src.confidence) || 0));
          const label = src.title ? src.title : (src.source ? src.source : 'Source');
          const domain = (() => { try { return new URL(src.url).hostname; } catch { return ''; } })();
          return `
            <div style="display: flex; align-items: center; gap: 10px;">
              <span style="min-width: 80px; max-width: 160px; font-size: 12px; color: ${c.muted}; overflow: hidden; text-overflow: ellipsis; white-space: nowrap;">${domain}</span>
              <div style="flex:1; height: 8px; background: hsl(var(--muted)); border-radius: 4px; overflow: hidden;">
                <div style="height: 100%; width: ${percent}%; background: hsl(var(--primary)); transition: width 0.7s; border-radius: 4px;"></div>
              </div>
              <span style="font-size: 12px; color: ${c.text}; min-width: 38px; text-align: right;">${percent.toFixed(1)}%</span>
            </div>
          `;
        }).join('')}
      </div>
    </div>
  `;
}

function renderSources(sources, c) {
  if (!Array.isArray(sources) || sources.length === 0) return '';
  return `
    <div style="margin-top: 18px;">
      <div style="font-weight:600; color:${c.text}; margin-bottom:8px; display:flex; align-items:center; gap:6px; font-size:15px;">
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="${c.muted}" style="min-width:16px;"><circle cx="12" cy="12" r="10"></circle></svg>
        Sources (${sources.length})
      </div>
      ${renderSourcesConfidenceChart(sources, c)}
      <div style="max-height:320px; overflow-y:auto; padding-right:4px; display: flex; flex-direction: column; gap: 18px;">
        ${sources.map((src, i) => {
          const favicon = getFaviconUrl(src.url);
          return `
            <div style="background:${c.card}; border-radius:12px; border:1px solid ${c.border}; box-shadow:0 2px 8px rgba(0,0,0,0.06); padding:20px 18px 16px 18px; display:flex; flex-direction:column; gap:10px;">
              <div style="display:flex; align-items:center; gap:14px; margin-bottom:2px;">
                <img src="${favicon}" alt="favicon" style="width:22px;height:22px;border-radius:6px;object-fit:cover;box-shadow:0 1px 4px rgba(0,0,0,0.07);background:${c.surface};"/>
                <span style="padding:3px 10px; border-radius:6px; font-size:13px; font-weight:600; background:${src.support==='Support'?c.success:src.support==='Contradict'?c.error:src.support==='Partial'?c.warning:c.muted}; color:${c.text}; letter-spacing:0.01em;">${src.support}</span>
                <div style="flex:1; min-width:0; margin-left:10px;"></div>
              </div>
              <a href="${src.url}" target="_blank" rel="noopener noreferrer" style="font-weight:700; color:${c.primary}; font-size:15px; text-decoration:underline; margin-bottom:2px; display:block; line-height:1.3;">${src.title || src.source}</a>
              ${src.snippet ? `<div style="color:${c.muted}; font-size:13px; margin-bottom:2px; line-height:1.5;">${src.snippet}</div>` : ''}
              <button class="verinews-source-toggle" data-index="${i}" style="margin:6px 0 0 0; background: hsl(var(--muted)); color: hsl(var(--primary-text)); border: none; border-radius: 6px; padding: 4px 14px; font-size: 13px; font-weight: 500; cursor: pointer; align-self:flex-start;">Show more</button>
              <div class="verinews-source-details" style="display:none; margin-top: 6px;">
                ${src.reason ? `<div style=\"color:${c.text}; font-size:13px; margin-bottom:2px; line-height:1.5;\">${src.reason}</div>` : ''}
                ${src.relevant === false ? `<div style=\"color:${c.error}; font-size:12px;\">Irrelevant</div>` : ''}
              </div>
            </div>
          `;
        }).join('')}
      </div>
    </div>
  `;
}

function renderTimingsDropdown(timings, c) {
  if (!timings) return '';
  const timingItems = Object.entries(timings).map(([k, v]) => 
    `<div style="display: flex; justify-content: space-between; padding: 4px 0; border-bottom: 1px solid ${c.border}20;">
      <span style="font-size: 13px; color: ${c.muted}; font-weight: 500;">${k.charAt(0).toUpperCase() + k.slice(1)}</span>
      <span style="font-size: 13px; color: ${c.text}; font-weight: 600; font-family: monospace;">${Number(v).toFixed(2)}s</span>
    </div>`
  ).join('');
  return `
    <div style="margin-bottom: 10px;">
      <button id="verinews-timings-toggle" style="background: hsl(var(--muted)); color: hsl(var(--primary-text)); border: none; border-radius: 6px; padding: 5px 14px; font-size: 13px; font-weight: 500; cursor: pointer;">Show timings</button>
    </div>
    <div id="verinews-timings-section" style="margin-top: 8px; padding: 8px; background: ${c.surface}; border-radius: 8px; border: 1px solid ${c.border}30; display: none; text-align:center;">
      <div style="margin-bottom: 12px;">${renderTimingDonutChart(timings)}</div>
      ${timingItems}
    </div>
  `;
}

// --- Professional Comprehensive Result Popup ---
function showVerificationPopup(result, claim) {
  playCustomSound();
  // Remove existing popup if any
  const existingPopup = document.getElementById('verinews-popup');
  if (existingPopup) existingPopup.parentElement?.remove();

  // Professional color scheme
  const c = {
    background: '#ffffff',
    card: '#ffffff',
    border: '#e5e7eb',
    primary: '#e11d48',
    text: '#1f2937',
    muted: '#6b7280',
    error: '#ef4444',
    success: '#22c55e',
    warning: '#f59e0b',
    info: '#3b82f6',
    surface: '#f9fafb',
    surfaceDark: '#f3f4f6'
  };
  
  const verdictStyle = getVerdictStyle(result.verdict, c);

  // Overlay
  const overlay = document.createElement('div');
  overlay.id = 'verinews-popup-overlay';
  overlay.style.cssText = `
    position: fixed; top: 0; left: 0; right: 0; bottom: 0;
    background: rgba(0,0,0,0.4); backdrop-filter: blur(4px);
    z-index: 10000;
    display: flex; align-items: center; justify-content: center;
    opacity: 0;
    transition: opacity 0.3s ease;
    padding: 20px;
  `;
  overlay.tabIndex = 0;

  // Professional Popup
  const popup = document.createElement('div');
  popup.id = 'verinews-popup';
  popup.setAttribute('role', 'dialog');
  popup.setAttribute('aria-modal', 'true');
  popup.style.cssText = `
    background: ${c.card};
    border-radius: 16px;
    box-shadow: 0 20px 60px rgba(0,0,0,0.2);
    max-width: 600px;
    width: 100%;
    max-height: 80vh;
    padding: 0;
    font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
    color: ${c.text};
    border: 1px solid ${c.border};
    outline: none;
    position: relative;
    transform: scale(0.95);
    transition: all 0.3s ease;
    user-select: none;
    overflow: hidden;
    display: flex;
    flex-direction: column;
  `;

  // Professional Header
  const header = document.createElement('div');
  header.style.cssText = `
    display: flex; align-items: center; gap: 16px; 
    background: ${c.primary}; color: white; 
    padding: 20px 24px; font-weight: 600; font-size: 16px;
    position: relative;
    flex-shrink: 0;
  `;
  
  const verdictIcon = document.createElement('div');
  verdictIcon.style.cssText = `
    width: 32px; height: 32px; border-radius: 8px; 
    background: rgba(255,255,255,0.2); 
    display: flex; align-items: center; justify-content: center; 
    font-size: 18px; color: white;
  `;
  verdictIcon.textContent = verdictStyle.icon;
  
  const verdictInfo = document.createElement('div');
  verdictInfo.style.cssText = `
    flex: 1; display: flex; flex-direction: column; gap: 4px;
  `;
  
  const verdictText = document.createElement('div');
  verdictText.style.cssText = `
    font-size: 18px; font-weight: 700;
  `;
  verdictText.textContent = result.verdict || 'Uncertain';
  
  const categoryText = document.createElement('div');
  categoryText.style.cssText = `
    font-size: 13px; opacity: 0.9; font-weight: 400;
  `;
  categoryText.textContent = result.category ? result.category.charAt(0).toUpperCase() + result.category.slice(1) : 'News Verification';
  
  verdictInfo.appendChild(verdictText);
  verdictInfo.appendChild(categoryText);
  
  const closeBtn = document.createElement('div');
  closeBtn.id = 'verinews-close-btn';
  closeBtn.style.cssText = `
    cursor: pointer; padding: 8px; border-radius: 6px; 
    transition: all 0.2s; opacity: 0.8; hover:opacity:1;
  `;
  closeBtn.innerHTML = `
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
          <path d="M18 6L6 18M6 6l12 12"/>
        </svg>
  `;
  
  header.appendChild(verdictIcon);
  header.appendChild(verdictInfo);
  header.appendChild(closeBtn);
  popup.appendChild(header);

  // Scrollable Content Area
  const contentArea = document.createElement('div');
  contentArea.style.cssText = `
    flex: 1; overflow-y: auto; padding: 24px;
  `;
  
  // 3. Enhanced Original Claim Card
  if (claim) {
    const claimSection = document.createElement('div');
    claimSection.style.cssText = `
      margin-bottom: 20px; padding: 18px 20px; background: ${c.surface}; 
      border-radius: 14px; box-shadow: 0 2px 8px rgba(0,0,0,0.06);
      display: flex; align-items: flex-start; gap: 12px;
    `;
    claimSection.innerHTML = `
      <div style="color: ${c.primary}; font-size: 22px; margin-top: 2px;">“</div>
      <div style="flex:1;">
        <div style="font-size: 12px; color: ${c.muted}; font-weight: 600; margin-bottom: 6px; text-transform: uppercase; letter-spacing: 0.5px;">Original Claim</div>
        <div style="font-size: 15px; color: ${c.text}; line-height: 1.6; font-style: italic;">${claim}</div>
      </div>
    `;
    contentArea.appendChild(claimSection);
  }

  // Main Result Section (unchanged except for claim ID removal)
  const resultSection = document.createElement('div');
  resultSection.style.cssText = `
    margin-bottom: 24px;
  `;
  
  // Conclusion
  if (result.conclusion) {
    const conclusion = document.createElement('div');
    conclusion.style.cssText = `
      font-size: 16px; font-weight: 600; margin-bottom: 16px; 
      color: ${c.text}; line-height: 1.5;
    `;
    conclusion.textContent = result.conclusion;
    resultSection.appendChild(conclusion);
  }
  
  // Explanation
  if (result.explanation) {
    const explanation = document.createElement('div');
    explanation.style.cssText = `
      font-size: 14px; color: ${c.muted}; margin-bottom: 16px; 
      line-height: 1.6;
    `;
    explanation.textContent = result.explanation;
    resultSection.appendChild(explanation);
  }
  
  // Confidence and Metrics
  const metricsSection = document.createElement('div');
  metricsSection.style.cssText = `
    display: flex; gap: 16px; margin-bottom: 20px; flex-wrap: wrap;
  `;
  
  // Confidence
  if (result.confidence !== undefined) {
    const confidenceCard = document.createElement('div');
    confidenceCard.style.cssText = `
      flex: 1; min-width: 120px; padding: 16px; background: ${c.surface}; 
      border-radius: 12px; border: 1px solid ${c.border};
    `;
    confidenceCard.innerHTML = `
      <div style="font-size: 12px; color: ${c.muted}; font-weight: 600; margin-bottom: 8px; text-transform: uppercase; letter-spacing: 0.5px;">Confidence</div>
      <div style="font-size: 24px; font-weight: 700; color: ${c.primary}; margin-bottom: 8px;">${result.confidence.toFixed(1)}%</div>
      <div style="height: 8px; background: ${c.surfaceDark}; border-radius: 4px; overflow: hidden;">
        <div style="height: 100%; width: ${result.confidence}%; background: ${c.primary}; transition: width 0.7s; border-radius: 4px;"></div>
      </div>
    `;
    metricsSection.appendChild(confidenceCard);
  }
  
  // Sources Count (unchanged)
  if (result.sources && result.sources.length > 0) {
    const sourcesCard = document.createElement('div');
    sourcesCard.style.cssText = `
      flex: 1; min-width: 120px; padding: 16px; background: ${c.surface}; 
      border-radius: 12px; border: 1px solid ${c.border};
    `;
    sourcesCard.innerHTML = `
      <div style="font-size: 12px; color: ${c.muted}; font-weight: 600; margin-bottom: 8px; text-transform: uppercase; letter-spacing: 0.5px;">Sources</div>
      <div style="font-size: 24px; font-weight: 700; color: ${c.info}; margin-bottom: 8px;">${result.sources.length}</div>
      <div style="font-size: 12px; color: ${c.muted};">Verified sources</div>
    `;
    metricsSection.appendChild(sourcesCard);
  }
  
  // (No claim ID card)
  resultSection.appendChild(metricsSection);
  contentArea.appendChild(resultSection);

  // 4. Sources Section with Line Chart for Confidence
  if (result.sources && result.sources.length > 0) {
    const sourcesSection = document.createElement('div');
    sourcesSection.style.cssText = `
      margin-bottom: 20px;
    `;
    const sourcesHeader = document.createElement('div');
    sourcesHeader.style.cssText = `
      font-size: 16px; font-weight: 600; margin-bottom: 16px; 
      color: ${c.text}; display: flex; align-items: center; gap: 8px;
    `;
    sourcesHeader.innerHTML = `
      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="${c.muted}" stroke-width="2">
        <circle cx="12" cy="12" r="10"/>
      </svg>
      Sources (${result.sources.length})
    `;
    sourcesSection.appendChild(sourcesHeader);
    // SVG line chart for all sources' confidence
    const chartDiv = document.createElement('div');
    chartDiv.style.cssText = 'width: 100%; height: 180px; margin-bottom: 16px;';
    chartDiv.id = 'verinews-sources-chart';
    // Prepare data
      const chartData = result.sources.map((src, i) => ({
        name: src.title || src.source || `Source ${i+1}`,
      confidence: typeof src.confidence === 'number' ? src.confidence : 0
      }));
    // SVG line chart rendering
    function renderLineChart(data, color) {
      if (!data.length) return '<div style="color:' + c.muted + ';font-size:13px;">No data</div>';
      const w = 520, h = 140, pad = 32;
      const maxY = 100, minY = 0;
      const stepX = (w - 2 * pad) / (data.length - 1 || 1);
      const points = data.map((d, i) => {
        const x = pad + i * stepX;
        const y = pad + (h - 2 * pad) * (1 - (d.confidence - minY) / (maxY - minY));
        return { x, y };
      });
      let polyline = points.map(p => `${p.x},${p.y}`).join(' ');
      let circles = points.map((p, i) => `<circle cx="${p.x}" cy="${p.y}" r="4" fill="${color}" />`).join('');
      let labels = points.map((p, i) => `<text x="${p.x}" y="${h - pad + 16}" font-size="11" text-anchor="middle" fill="${c.muted}">${data[i].name.length > 10 ? data[i].name.slice(0,10)+'…' : data[i].name}</text>`).join('');
      let yLabels = [0, 25, 50, 75, 100].map(val => {
        const y = pad + (h - 2 * pad) * (1 - (val - minY) / (maxY - minY));
        return `<text x="8" y="${y+4}" font-size="10" fill="${c.muted}">${val}%</text>`;
      }).join('');
      return `<svg width="${w}" height="${h}">
        <polyline fill="none" stroke="${color}" stroke-width="2.5" points="${polyline}" />
        ${circles}
        ${labels}
        ${yLabels}
      </svg>`;
      }
    chartDiv.innerHTML = renderLineChart(chartData, c.primary);
    sourcesSection.appendChild(chartDiv);
    // Individual sources list (no progress bars)
    const sourcesList = document.createElement('div');
    sourcesList.style.cssText = `
      display: flex; flex-direction: column; gap: 12px; max-height: 300px; overflow-y: auto;
    `;
    result.sources.forEach((src, i) => {
      const sourceCard = document.createElement('div');
      sourceCard.style.cssText = `
        padding: 16px; background: ${c.surface}; border-radius: 12px; 
        border: 1px solid ${c.border}; display: flex; flex-direction: column; gap: 12px;
      `;
      const favicon = getFaviconUrl(src.url);
      const supportColor = src.support === 'Support' ? c.success : 
                          src.support === 'Contradict' ? c.error : 
                          src.support === 'Partial' ? c.warning : c.muted;
      sourceCard.innerHTML = `
        <div style="display: flex; align-items: center; gap: 12px;">
          <img src="${favicon}" alt="favicon" style="width: 24px; height: 24px; border-radius: 6px; object-fit: cover; box-shadow: 0 1px 4px rgba(0,0,0,0.1);"/>
          <span style="padding: 4px 12px; border-radius: 6px; font-size: 12px; font-weight: 600; background: ${supportColor}; color: white;">${src.support}</span>
          ${src.confidence ? `<span style=\"font-size: 12px; color: ${c.muted};\">${src.confidence.toFixed(1)}% confidence</span>` : ''}
        </div>
        <a href="${src.url}" target="_blank" rel="noopener noreferrer" style="font-weight: 600; color: ${c.primary}; font-size: 14px; text-decoration: none; line-height: 1.4;">${src.title || src.source}</a>
        ${src.snippet ? `<div style=\"color: ${c.muted}; font-size: 13px; line-height: 1.5;\">${src.snippet}</div>` : ''}
        ${src.reason ? `<div style=\"color: ${c.text}; font-size: 13px; line-height: 1.5; font-style: italic;\">${src.reason}</div>` : ''}
        ${src.relevant === false ? `<div style=\"color: ${c.error}; font-size: 12px; font-weight: 600;\">⚠️ Irrelevant source</div>` : ''}
      `;
      sourcesList.appendChild(sourceCard);
    });
    sourcesSection.appendChild(sourcesList);
    contentArea.appendChild(sourcesSection);
  }

  // 2. Timing Section with shadcn LineChart
  if (result.timings) {
    const timingsSection = document.createElement('div');
    timingsSection.style.cssText = `
      margin-bottom: 20px;
    `;
    const timingsHeader = document.createElement('div');
    timingsHeader.style.cssText = `
      font-size: 16px; font-weight: 600; margin-bottom: 16px; 
      color: ${c.text}; display: flex; align-items: center; gap: 8px; cursor: pointer;
    `;
    timingsHeader.innerHTML = `
      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="${c.muted}" stroke-width="2">
        <circle cx="12" cy="12" r="10"/>
        <polyline points="12,6 12,12 16,14"/>
      </svg>
      Performance Metrics
    `;
    const timingsChartDiv = document.createElement('div');
    timingsChartDiv.style.cssText = 'width: 100%; height: 140px;';
    timingsChartDiv.id = 'verinews-timings-chart';
    // Prepare data
      const timingData = Object.entries(result.timings).map(([k, v]) => ({
        name: k.charAt(0).toUpperCase() + k.slice(1),
        value: Number(v)
      }));
    // SVG line chart rendering
    function renderTimingLineChart(data, color) {
      if (!data.length) return '<div style="color:' + c.muted + ';font-size:13px;">No data</div>';
      const w = 520, h = 100, pad = 32;
      const maxY = Math.max(...data.map(d => d.value), 1);
      const minY = 0;
      const stepX = (w - 2 * pad) / (data.length - 1 || 1);
      const points = data.map((d, i) => {
        const x = pad + i * stepX;
        const y = pad + (h - 2 * pad) * (1 - (d.value - minY) / (maxY - minY));
        return { x, y };
      });
      let polyline = points.map(p => `${p.x},${p.y}`).join(' ');
      let circles = points.map((p, i) => `<circle cx="${p.x}" cy="${p.y}" r="4" fill="${color}" />`).join('');
      let labels = points.map((p, i) => `<text x="${p.x}" y="${h - pad + 16}" font-size="11" text-anchor="middle" fill="${c.muted}">${data[i].name}</text>`).join('');
      let yLabels = [0, maxY/2, maxY].map(val => {
        const y = pad + (h - 2 * pad) * (1 - (val - minY) / (maxY - minY));
        return `<text x="8" y="${y+4}" font-size="10" fill="${c.muted}">${val.toFixed(2)}s</text>`;
      }).join('');
      return `<svg width="${w}" height="${h}">
        <polyline fill="none" stroke="${color}" stroke-width="2.5" points="${polyline}" />
        ${circles}
        ${labels}
        ${yLabels}
      </svg>`;
    }
    timingsChartDiv.innerHTML = renderTimingLineChart(timingData, c.primary);
    timingsSection.appendChild(timingsHeader);
    timingsSection.appendChild(timingsChartDiv);
    contentArea.appendChild(timingsSection);
  }

  popup.appendChild(contentArea);

  // Footer with actions (unchanged)
  const footer = document.createElement('div');
  footer.style.cssText = `
    padding: 20px 24px; background: ${c.surface}; border-top: 1px solid ${c.border};
    display: flex; gap: 12px; justify-content: flex-end; flex-shrink: 0;
  `;
  
  // Copy button
  const copyButton = document.createElement('button');
  copyButton.style.cssText = `
    padding: 10px 20px; background: ${c.surface}; color: ${c.text}; 
    border: 1px solid ${c.border}; border-radius: 8px; font-size: 14px; 
    font-weight: 500; cursor: pointer; transition: all 0.2s;
  `;
  copyButton.textContent = 'Copy Result';
  copyButton.onclick = () => {
    const resultText = `VeriNews Verification Result:
Claim: ${claim || ''}
Verdict: ${result.verdict || 'Uncertain'}
Confidence: ${result.confidence ? result.confidence.toFixed(1) + '%' : 'N/A'}
Conclusion: ${result.conclusion || ''}
Explanation: ${result.explanation || ''}
Sources: ${result.sources ? result.sources.length : 0}
Claim ID: ${result.claim_id || ''}`;
    
    navigator.clipboard.writeText(resultText).then(() => {
      copyButton.textContent = 'Copied!';
      copyButton.style.background = c.success;
      copyButton.style.color = 'white';
      setTimeout(() => {
        copyButton.textContent = 'Copy Result';
        copyButton.style.background = c.surface;
        copyButton.style.color = c.text;
      }, 2000);
    });
  };
  
  // Close button
  const closeButton = document.createElement('button');
  closeButton.style.cssText = `
    padding: 10px 20px; background: ${c.primary}; color: white; 
    border: none; border-radius: 8px; font-size: 14px; 
    font-weight: 600; cursor: pointer; transition: all 0.2s;
  `;
  closeButton.textContent = 'Close';
  
  footer.appendChild(copyButton);
  footer.appendChild(closeButton);
  popup.appendChild(footer);

  // Close handlers
  const closePopup = () => {
    overlay.style.opacity = '0';
    popup.style.transform = 'scale(0.95)';
    popup.style.opacity = '0';
    setTimeout(() => overlay.remove(), 300);
  };
  
  closeButton.onclick = closePopup;
  closeBtn.onclick = closePopup;
  overlay.addEventListener('mousedown', (e) => {
    if (e.target === overlay) closePopup();
  });
  overlay.addEventListener('keydown', (e) => {
    if (e.key === 'Escape') closePopup();
  });

  overlay.appendChild(popup);
  document.body.appendChild(overlay);
  
  // Animate in
  requestAnimationFrame(() => {
    overlay.style.opacity = '1';
    popup.style.transform = 'scale(1)';
    popup.style.opacity = '1';
  });
  
  popup.focus();
}



// Function to play custom notification sound using Web Audio API
function playCustomSound() {
  try {
    const audio = new Audio(chrome.runtime.getURL('notification.mp3'));
    audio.volume = 1.0; // Always 100%
    audio.play().catch(error => {
      console.log('Could not play custom notification sound:', error);
    });
  } catch (error) {
    console.log('Custom sound not available:', error);
  }
}

// Enhanced error notification
function showErrorNotification(error) {
  const c = getThemeColors();
  
  const notification = document.createElement('div');
  notification.style.cssText = `
    position: fixed;
    top: 20px;
    right: 20px;
    background: hsl(var(--error));
    color: hsl(var(--primary-foreground));
    padding: 12px 16px;
    border-radius: 10px;
    font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
    font-size: 14px;
    font-weight: 500;
    z-index: 10000;
    box-shadow: 0 8px 24px rgba(0,0,0,0.15);
    border: 1px solid hsl(var(--error) / 0.3);
    backdrop-filter: blur(8px);
    opacity: 0;
    transform: translateX(100%);
    transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
    max-width: 300px;
    display: flex;
    align-items: center;
    gap: 8px;
  `;
  
  notification.innerHTML = `
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
      <circle cx="12" cy="12" r="10"/>
      <path d="M15 9l-6 6M9 9l6 6"/>
    </svg>
    <span>VeriNews: ${error}</span>
  `;
  
  document.body.appendChild(notification);
  
  // Animate in
  requestAnimationFrame(() => {
    notification.style.opacity = '1';
    notification.style.transform = 'translateX(0)';
  });
  
  // Auto remove after 5 seconds
  setTimeout(() => {
    notification.style.opacity = '0';
    notification.style.transform = 'translateX(100%)';
    setTimeout(() => {
      if (notification.parentNode) {
        notification.remove();
      }
    }, 300);
  }, 5000);
}

// Enhanced extension indicator
const indicator = document.createElement('div');
indicator.id = 'verinews-extension-indicator';
const c = getThemeColors();
indicator.style.cssText = `
  position: fixed;
  top: 20px;
  right: 20px;
  background: linear-gradient(135deg, ${c.primary}, ${c.secondary});
  color: white;
  padding: 8px 12px;
  border-radius: 8px;
  font-size: 12px;
  font-weight: 600;
  font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
  z-index: 10000;
  opacity: 0;
  transform: translateY(-20px);
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
  box-shadow: 0 4px 16px rgba(0,0,0,0.15);
  backdrop-filter: blur(8px);
  border: 1px solid rgba(255,255,255,0.1);
  display: flex;
  align-items: center;
  gap: 6px;
`;
indicator.innerHTML = `
  <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
    <path d="M9 12l2 2 4-4"/>
    <path d="M21 12c0 4.97-4.03 9-9 9s-9-4.03-9-9 4.03-9 9-9 9 4.03 9 9z"/>
  </svg>
  VeriNews Active
`;
document.body.appendChild(indicator);

// Animate indicator in and out
setTimeout(() => {
  indicator.style.opacity = '1';
  indicator.style.transform = 'translateY(0)';
  
  setTimeout(() => {
    indicator.style.opacity = '0';
    indicator.style.transform = 'translateY(-20px)';
    setTimeout(() => indicator.remove(), 300);
  }, 3000);
}, 500);

function renderTimingDonutChart(timings) {
  // Accept both capitalized and lowercase keys
  const data = [
    { label: "Analysis", value: Number(timings.Analyst ?? timings.analysis ?? 0), color: 'hsl(var(--primary))' },
    { label: "Database", value: Number(timings.Database ?? timings.database ?? 0), color: 'hsl(var(--secondary))' },
    { label: "Scraping", value: Number(timings.Scraping ?? timings.scraping ?? 0), color: 'hsl(var(--accent))' },
  ];
  const total = data.reduce((sum, d) => sum + (isNaN(d.value) ? 0 : d.value), 0);
  if (!total) {
    return `<div style="text-align:center;color:hsl(var(--muted-text));font-size:13px;">No timing data</div>`;
  }
  let startAngle = 0;
  const radius = 40, cx = 50, cy = 50, strokeWidth = 16;
  let svg = `<svg width="100" height="100" viewBox="0 0 100 100">`;
  data.forEach(d => {
    if (!d.value || isNaN(d.value)) return;
    const angle = (d.value / total) * 360;
    const endAngle = startAngle + angle;
    const largeArc = angle > 180 ? 1 : 0;
    const x1 = cx + radius * Math.cos((Math.PI / 180) * (startAngle - 90));
    const y1 = cy + radius * Math.sin((Math.PI / 180) * (startAngle - 90));
    const x2 = cx + radius * Math.cos((Math.PI / 180) * (endAngle - 90));
    const y2 = cy + radius * Math.sin((Math.PI / 180) * (endAngle - 90));
    svg += `
      <path d="M${x1},${y1} 
        A${radius},${radius} 0 ${largeArc} 1 ${x2},${y2}" 
        stroke="${d.color}" stroke-width="${strokeWidth}" fill="none"/>
    `;
    startAngle += angle;
  });
  svg += `<circle cx="${cx}" cy="${cy}" r="${radius - strokeWidth/2}" fill="hsl(var(--card))"/>`;
  svg += `<text x="${cx}" y="${cy}" text-anchor="middle" dy="6" font-size="14" fill="hsl(var(--primary-text))">${total.toFixed(2)}s</text>`;
  svg += `</svg>`;
  return svg;
}

// --- Enhanced Floating Verify/Copy Button on Text Selection ---
let verifyFab = null;
let lastSelectedText = '';
let selectionTimeout = null;

function initializeTextSelection() {
  console.log('Initializing text selection functionality...');
  
  // Remove any existing listeners to prevent duplicates
  document.removeEventListener('selectionchange', handleSelectionChange);
  document.removeEventListener('mousedown', handleMouseDown);
  
  // Add event listeners
  document.addEventListener('selectionchange', handleSelectionChange);
  document.addEventListener('mousedown', handleMouseDown);
  
  console.log('Text selection functionality initialized');
}

function handleSelectionChange() {
  // Clear existing timeout
  if (selectionTimeout) {
    clearTimeout(selectionTimeout);
  }
  
  // Remove existing floating button
  if (verifyFab) {
    verifyFab.remove();
    verifyFab = null;
  }
  
  // Add delay to prevent flickering
  selectionTimeout = setTimeout(() => {
  const selection = window.getSelection();
    if (selection && selection.toString().trim().length > 10) { // Minimum 10 characters
    const range = selection.getRangeAt(0);
    const rect = range.getBoundingClientRect();
    if (rect && rect.width && rect.height) {
        lastSelectedText = selection.toString().trim();
        createEnhancedFloatingButton(rect, lastSelectedText);
      }
    }
  }, 150); // 150ms delay for better UX
}

function handleMouseDown(e) {
  if (verifyFab && !verifyFab.contains(e.target)) {
    verifyFab.remove();
    verifyFab = null;
  }
}

function createEnhancedFloatingButton(rect, selectedText) {
      verifyFab = document.createElement('div');
      verifyFab.id = 'verinews-verify-fab';
  
  // Enhanced positioning and styling
  const buttonWidth = 140;
  const buttonHeight = 40;
  let left = rect.left + window.scrollX + rect.width / 2 - buttonWidth / 2;
  let top = rect.top + window.scrollY - buttonHeight - 12;
  
  // Keep within viewport bounds
  const margin = 20;
  left = Math.max(margin, Math.min(window.innerWidth - buttonWidth - margin, left));
  if (top < margin) {
    top = rect.bottom + window.scrollY + 12; // Show below selection if above is out of view
  }
  
      verifyFab.style.cssText = `
        position: fixed;
    left: ${left}px;
    top: ${top}px;
        z-index: 2147483647;
        background: hsl(var(--card, #fff));
        color: hsl(var(--primary-text, #222));
    border: 1.5px solid hsl(var(--primary, #e11d48));
    border-radius: 12px;
    box-shadow: 0 4px 20px rgba(0,0,0,0.15), 0 2px 8px rgba(0,0,0,0.08);
    padding: 8px 12px;
    font-size: 13px;
    font-weight: 600;
        display: flex;
        align-items: center;
    gap: 8px;
    transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
    backdrop-filter: blur(12px);
        user-select: none;
    width: ${buttonWidth}px;
    height: ${buttonHeight}px;
    opacity: 0;
    transform: translateY(-10px) scale(0.95);
    cursor: pointer;
  `;
  
  // Enhanced verify button
      const verifyBtn = document.createElement('button');
  verifyBtn.innerHTML = `
    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5">
      <path d="M9 12l2 2 4-4"/>
      <circle cx="12" cy="12" r="10"/>
    </svg>
    <span>Verify</span>
  `;
      verifyBtn.style.cssText = `
        background: hsl(var(--primary, #e11d48));
        color: hsl(var(--primary-foreground, #fff));
        border: none;
    border-radius: 8px;
    padding: 6px 12px;
    font-size: 12px;
    font-weight: 600;
        cursor: pointer;
        display: flex;
        align-items: center;
    gap: 6px;
    transition: all 0.2s cubic-bezier(0.4, 0, 0.2, 1);
    box-shadow: 0 2px 8px rgba(225, 29, 72, 0.3);
    flex: 1;
    height: 100%;
  `;
  
  // Enhanced hover effects
  verifyBtn.addEventListener('mouseenter', () => {
    verifyBtn.style.background = 'hsl(var(--secondary, #be123c))';
    verifyBtn.style.transform = 'translateY(-1px)';
    verifyBtn.style.boxShadow = '0 4px 12px rgba(225, 29, 72, 0.4)';
  });
  
  verifyBtn.addEventListener('mouseleave', () => {
    verifyBtn.style.background = 'hsl(var(--primary, #e11d48))';
    verifyBtn.style.transform = 'translateY(0)';
    verifyBtn.style.boxShadow = '0 2px 8px rgba(225, 29, 72, 0.3)';
  });
  
      verifyBtn.onmousedown = (e) => { e.preventDefault(); };
      verifyBtn.onclick = () => {
        if (!lastSelectedText) return;
    
    // Show loading state on button
    verifyBtn.innerHTML = `
      <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" class="animate-spin">
        <circle cx="12" cy="12" r="10" stroke="currentColor" stroke-width="2.5" opacity="0.2"/>
        <path d="M22 12a10 10 0 0 1-10 10" stroke="currentColor" stroke-width="2.5" stroke-linecap="round">
          <animateTransform attributeName="transform" type="rotate" from="0 12 12" to="360 12 12" dur="1s" repeatCount="indefinite"/>
        </path>
      </svg>
      <span>Verifying...</span>
    `;
    verifyBtn.style.cursor = 'not-allowed';
    verifyBtn.disabled = true;
    
    // Show loading indicator
        showLoadingIndicatorAtSelection();
    
    // Send verification request
        chrome.runtime.sendMessage({ action: 'verifyClaim', claim: lastSelectedText }, (response) => {
          if (chrome.runtime.lastError) {
            console.error('Failed to send message to background:', chrome.runtime.lastError.message);
            showErrorNotification('Extension background not available. Please reload the extension.');
        // Reset button state
        resetVerifyButton();
          } else {
            console.log('Background response:', response);
        // Button will be reset when verification result is shown
      }
    });
    
    // Remove floating button
    if (verifyFab) {
      verifyFab.style.opacity = '0';
      verifyFab.style.transform = 'translateY(-10px) scale(0.95)';
      setTimeout(() => {
        if (verifyFab) verifyFab.remove();
        verifyFab = null;
      }, 300);
    }
      };
  
  // Enhanced copy button
      const copyBtn = document.createElement('button');
  copyBtn.innerHTML = `
    <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5">
      <rect x="9" y="9" width="13" height="13" rx="2"/>
      <path d="M5 15V5a2 2 0 0 1 2-2h10"/>
    </svg>
  `;
      copyBtn.style.cssText = `
        background: hsl(var(--muted, #f3f4f6));
        color: hsl(var(--primary-text, #222));
        border: none;
    border-radius: 8px;
    padding: 6px;
    font-size: 12px;
    font-weight: 600;
        cursor: pointer;
        display: flex;
        align-items: center;
    justify-content: center;
    transition: all 0.2s cubic-bezier(0.4, 0, 0.2, 1);
    box-shadow: 0 2px 6px rgba(0,0,0,0.1);
    width: 32px;
    height: 100%;
  `;
  
  // Enhanced copy button hover effects
  copyBtn.addEventListener('mouseenter', () => {
    copyBtn.style.background = 'hsl(var(--muted, #e5e7eb))';
    copyBtn.style.transform = 'translateY(-1px)';
    copyBtn.style.boxShadow = '0 4px 10px rgba(0,0,0,0.15)';
  });
  
  copyBtn.addEventListener('mouseleave', () => {
    copyBtn.style.background = 'hsl(var(--muted, #f3f4f6))';
    copyBtn.style.transform = 'translateY(0)';
    copyBtn.style.boxShadow = '0 2px 6px rgba(0,0,0,0.1)';
  });
  
      copyBtn.onmousedown = (e) => { e.preventDefault(); };
      copyBtn.onclick = async () => {
        if (!lastSelectedText) return;
    
        try {
          await navigator.clipboard.writeText(lastSelectedText);
      
      // Show success state
      copyBtn.innerHTML = `
        <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5">
          <path d="M20 6L9 17l-5-5"/>
        </svg>
      `;
      copyBtn.style.background = 'hsl(var(--success, #dcfce7))';
      copyBtn.style.color = 'hsl(var(--success-foreground, #166534))';
      
          setTimeout(() => {
        copyBtn.innerHTML = `
          <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5">
            <rect x="9" y="9" width="13" height="13" rx="2"/>
            <path d="M5 15V5a2 2 0 0 1 2-2h10"/>
          </svg>
        `;
        copyBtn.style.background = 'hsl(var(--muted, #f3f4f6))';
        copyBtn.style.color = 'hsl(var(--primary-text, #222))';
      }, 1500);
        } catch (err) {
      // Show error state
      copyBtn.innerHTML = `
        <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5">
          <path d="M18 6L6 18M6 6l12 12"/>
        </svg>
      `;
      copyBtn.style.background = 'hsl(var(--error, #fee2e2))';
      copyBtn.style.color = 'hsl(var(--error-foreground, #991b1b))';
      
          setTimeout(() => {
        copyBtn.innerHTML = `
          <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5">
            <rect x="9" y="9" width="13" height="13" rx="2"/>
            <path d="M5 15V5a2 2 0 0 1 2-2h10"/>
          </svg>
        `;
        copyBtn.style.background = 'hsl(var(--muted, #f3f4f6))';
        copyBtn.style.color = 'hsl(var(--primary-text, #222))';
      }, 1500);
    }
  };
  
      verifyFab.appendChild(verifyBtn);
      verifyFab.appendChild(copyBtn);
      document.body.appendChild(verifyFab);
  
  // Animate in
  requestAnimationFrame(() => {
    verifyFab.style.opacity = '1';
    verifyFab.style.transform = 'translateY(0) scale(1)';
  });
}

// Function to reset verify button state
function resetVerifyButton() {
  if (verifyFab) {
    const verifyBtn = verifyFab.querySelector('button');
    if (verifyBtn) {
      verifyBtn.innerHTML = `
        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5">
          <path d="M9 12l2 2 4-4"/>
          <circle cx="12" cy="12" r="10"/>
        </svg>
        <span>Verify</span>
      `;
      verifyBtn.style.cursor = 'pointer';
      verifyBtn.disabled = false;
    }
  }
}


// Function to show floating verify button manually
function showFloatingVerifyButton() {
  // Remove any existing floating button
  if (verifyFab) {
    verifyFab.remove();
  }
  
  // Create a floating button that appears in the center of the screen
  verifyFab = document.createElement('div');
  verifyFab.id = 'verinews-verify-fab';
  verifyFab.style.cssText = `
    position: fixed;
    left: 50%;
    top: 50%;
    transform: translate(-50%, -50%);
    z-index: 2147483647;
    background: hsl(var(--card, #fff));
    color: hsl(var(--primary-text, #222));
    border: 1px solid hsl(var(--primary, #e11d48));
    border-radius: 12px;
    box-shadow: 0 4px 16px rgba(0,0,0,0.15);
    padding: 12px 16px;
    font-size: 14px;
    font-weight: 500;
    display: flex;
    align-items: center;
    gap: 8px;
    transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
    backdrop-filter: blur(8px);
    user-select: none;
    min-width: 120px;
    opacity: 0;
    transform: translate(-50%, -50%) scale(0.9);
  `;
  
  verifyFab.innerHTML = `
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
      <path d="M9 12l2 2 4-4"/>
      <circle cx="12" cy="12" r="10"/>
    </svg>
    <span>Select text to verify</span>
  `;
  
  document.body.appendChild(verifyFab);
  
  // Animate in
  requestAnimationFrame(() => {
    verifyFab.style.opacity = '1';
    verifyFab.style.transform = 'translate(-50%, -50%) scale(1)';
  });
  
  // Auto-hide after 3 seconds
  setTimeout(() => {
    if (verifyFab) {
      verifyFab.style.opacity = '0';
      verifyFab.style.transform = 'translate(-50%, -50%) scale(0.9)';
      setTimeout(() => {
        if (verifyFab) verifyFab.remove();
      }, 300);
    }
  }, 3000);
}

// Add theme switcher logic and UI
function applyThemeToPopup(theme, popup) {
  // theme: 'system' | 'light' | 'dark'
  let themeVars = '';
  if (theme === 'dark') {
    themeVars = `
      --background: 217 100% 15%;
      --foreground: 0 0% 100%;
      --surface: 216 79% 19%;
      --primary: 348 85% 60%;
      --secondary: 345 100% 57%;
      --accent: 73 55% 67%;
      --muted-text: 228 35% 84%;
      --primary-text: 0 0% 100%;
      --success: 107 41% 81%;
      --info: 217 66% 33%;
      --warning: 37 94% 65%;
      --error: 348 70% 50%;
      --border: 217 44% 37%;
      --card: 216 79% 19%;
      --primary-foreground: 0 0% 100%;
    `;
  } else if (theme === 'light') {
    themeVars = `
      --background: 0 0% 100%;
      --foreground: 217 84% 15%;
      --surface: 218 35% 97%;
      --primary: 348 85% 60%;
      --secondary: 345 100% 57%;
      --accent: 73 55% 67%;
      --muted-text: 217 66% 33%;
      --primary-text: 217 84% 15%;
      --success: 107 41% 81%;
      --info: 217 66% 33%;
      --warning: 37 94% 52%;
      --error: 348 60% 45%;
      --border: 220 22% 92%;
      --card: 0 0% 100%;
      --primary-foreground: 0 0% 100%;
    `;
  } else {
    // system
    const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
    themeVars = prefersDark ? `
      --background: 217 100% 15%;
      --foreground: 0 0% 100%;
      --surface: 216 79% 19%;
      --primary: 348 85% 60%;
      --secondary: 345 100% 57%;
      --accent: 73 55% 67%;
      --muted-text: 228 35% 84%;
      --primary-text: 0 0% 100%;
      --success: 107 41% 81%;
      --info: 217 66% 33%;
      --warning: 37 94% 65%;
      --error: 348 70% 50%;
      --border: 217 44% 37%;
      --card: 216 79% 19%;
      --primary-foreground: 0 0% 100%;
    ` : `
      --background: 0 0% 100%;
      --foreground: 217 84% 15%;
      --surface: 218 35% 97%;
      --primary: 348 85% 60%;
      --secondary: 345 100% 57%;
      --accent: 73 55% 67%;
      --muted-text: 217 66% 33%;
      --primary-text: 217 84% 15%;
      --success: 107 41% 81%;
      --info: 217 66% 33%;
      --warning: 37 94% 52%;
      --error: 348 60% 45%;
      --border: 220 22% 92%;
      --card: 0 0% 100%;
      --primary-foreground: 0 0% 100%;
    `;
  }
  popup.style.cssText += `;${themeVars}`;
}
