
// Content script that runs on web pages
console.log('VeriNews Extension content script loaded');

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
    position: absolute;
    z-index: 2147483647;
    background: hsl(var(--card));
    color: hsl(var(--primary-text));
    border: 2px solid hsl(var(--primary));
    border-radius: 12px;
    box-shadow: 0 8px 32px rgba(0,0,0,0.12), 0 2px 8px rgba(0,0,0,0.08);
    padding: 12px 20px 12px 16px;
    font-size: 15px;
    font-weight: 600;
    font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
    display: flex;
    align-items: center;
    gap: 12px;
    pointer-events: auto;
    user-select: none;
    transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
    opacity: 0;
    transform: translateY(-10px) scale(0.95);
    cursor: grab;
    backdrop-filter: blur(8px);
    min-width: 200px;
  `;
  indicator.setAttribute('aria-live', 'polite');
  indicator.innerHTML = `
    <div style="position: relative; width: 24px; height: 24px;">
      <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
        <circle cx="12" cy="12" r="10" stroke="hsl(var(--primary))" stroke-width="2.5" opacity="0.2"/>
        <path d="M22 12a10 10 0 0 1-10 10" stroke="hsl(var(--primary))" stroke-width="2.5" stroke-linecap="round">
          <animateTransform attributeName="transform" type="rotate" from="0 12 12" to="360 12 12" dur="1s" repeatCount="indefinite"/>
        </path>
      </svg>
    </div>
    <div style="flex: 1; min-width: 0;">
      <div id="verinews-loading-text" style="font-weight: 600; color: hsl(var(--primary-text)); margin-bottom: 2px;">Verifying claim...</div>
      <div id="verinews-loading-timer" style="font-size: 13px; color: hsl(var(--muted-text)); font-weight: 500;">0.0s</div>
    </div>
    <div style="width: 8px; height: 8px; background: hsl(var(--primary)); border-radius: 50%; animation: pulse 2s infinite;"></div>
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
  
  // Position near selection
  let x = window.innerWidth / 2, y = window.innerHeight / 2;
  const sel = window.getSelection();
  if (sel && sel.rangeCount > 0) {
    const range = sel.getRangeAt(0);
    const rect = range.getBoundingClientRect();
    if (rect && rect.width && rect.height) {
      x = rect.left + rect.width / 2;
      y = rect.top - 40; // above selection
      if (y < 20) y = rect.bottom + 20; // if above is out of view, put below
    }
  }
  
  // Keep within viewport bounds
  const margin = 20;
  x = Math.max(margin, Math.min(window.innerWidth - 220 - margin, x));
  y = Math.max(margin, Math.min(window.innerHeight - 60 - margin, y));
  
  indicator.style.left = `${x}px`;
  indicator.style.top = `${y}px`;
  indicator.style.position = 'fixed';
  document.body.appendChild(indicator);

  // Animate in
  requestAnimationFrame(() => {
    indicator.style.opacity = '1';
    indicator.style.transform = 'translateY(0) scale(1)';
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

  // Enhanced timer logic
  let startTime = Date.now();
  let timerInterval = setInterval(() => {
    const elapsed = (Date.now() - startTime) / 1000;
    const timerSpan = indicator.querySelector('#verinews-loading-timer');
    if (timerSpan) {
      timerSpan.textContent = `${elapsed.toFixed(1)}s`;
      // Change color based on time
      if (elapsed > 10) {
        timerSpan.style.color = c.warning;
      } else if (elapsed > 5) {
        timerSpan.style.color = c.accent;
      }
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

// --- Main popup rendering ---
function showVerificationPopup(result, claim) {
  playCustomSound();
  // Remove existing popup if any
  const existingPopup = document.getElementById('verinews-popup');
  if (existingPopup) existingPopup.parentElement?.remove();

  // Theme CSS variables (from index.css)
  const lightVars = `
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
  const darkVars = `
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
  const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
  const themeVars = prefersDark ? darkVars : lightVars;

  // Theme colors (for inline styles)
  const c = {
    background: 'hsl(var(--background))',
    card: 'hsl(var(--card))',
    border: 'hsl(var(--border))',
    primary: 'hsl(var(--primary))',
    secondary: 'hsl(var(--secondary))',
    accent: 'hsl(var(--accent))',
    text: 'hsl(var(--primary-text))',
    muted: 'hsl(var(--muted-text))',
    error: 'hsl(var(--error))',
    surface: 'hsl(var(--surface))',
    success: 'hsl(var(--success))',
    warning: 'hsl(var(--warning))',
    info: 'hsl(var(--info))',
    borderRadius: '18px',
  };
  const verdictStyle = getVerdictStyle(result.verdict, c);

  // Overlay
  const overlay = document.createElement('div');
  overlay.id = 'verinews-popup-overlay';
  overlay.style.cssText = `
    position: fixed; top: 0; left: 0; right: 0; bottom: 0;
    background: rgba(0,0,0,0.18); backdrop-filter: blur(4px);
    z-index: 10000;
    display: flex; align-items: center; justify-content: center;
    opacity: 0;
    transition: opacity 0.3s ease;
  `;
  overlay.tabIndex = 0;
  overlay.setAttribute('aria-label', 'Verification result overlay');

  // Popup
  const popup = document.createElement('div');
  popup.id = 'verinews-popup';
  popup.setAttribute('role', 'dialog');
  popup.setAttribute('aria-modal', 'true');
  popup.setAttribute('aria-label', 'Verification result');
  popup.style.cssText = `
    background: ${c.card};
    border-radius: ${c.borderRadius};
    box-shadow: 0 20px 60px rgba(0,0,0,0.18), 0 8px 24px rgba(0,0,0,0.10);
    max-width: 480px;
    min-width: 320px;
    width: 100%;
    padding: 0;
    font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
    color: ${c.text};
    border: 1.5px solid ${c.border};
    outline: none;
    position: absolute;
    left: 50%;
    top: 50%;
    transform: translate(-50%, -50%) scale(0.95);
    transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
    user-select: none;
    backdrop-filter: blur(8px);
    overflow: hidden;
    ${themeVars}
  `;
  popup.tabIndex = 0;

  // Add theme switcher UI at the top of the popup
  const themeSwitcher = document.createElement('div');
  themeSwitcher.style.cssText = `
    position: absolute;
    top: 10px;
    right: 10px;
    display: flex;
    gap: 8px;
    z-index: 10;
  `;
  const systemBtn = document.createElement('button');
  systemBtn.id = 'verinews-theme-system';
  systemBtn.innerHTML = `<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M12 2L2 12h20L12 2z"/></svg> System`;
  systemBtn.style.cssText = `
    background: hsl(var(--muted));
    color: hsl(var(--primary-text));
    border: none;
    border-radius: 6px;
    padding: 6px 12px;
    font-size: 13px;
    font-weight: 500;
    cursor: pointer;
    display: flex;
    align-items: center;
    gap: 6px;
    transition: all 0.2s;
  `;
  systemBtn.onclick = () => {
    chrome.storage.sync.set({ theme: 'system' }, () => {
      applyThemeToPopup('system', popup);
      systemBtn.style.backgroundColor = c.primary;
      systemBtn.style.color = c.primaryForeground;
      systemBtn.style.border = `1px solid ${c.primary}`;
      systemBtn.style.boxShadow = `0 2px 8px ${c.primary}30`;
      systemBtn.innerHTML = `<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M12 2L2 12h20L12 2z"/></svg> System`;
    });
  };
  const lightBtn = document.createElement('button');
  lightBtn.id = 'verinews-theme-light';
  lightBtn.innerHTML = `<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M21 12a9 9 0 1 1-18 0 9 9 0 0 1 18 0z"/></svg> Light`;
  lightBtn.style.cssText = `
    background: hsl(var(--muted));
    color: hsl(var(--primary-text));
    border: none;
    border-radius: 6px;
    padding: 6px 12px;
    font-size: 13px;
    font-weight: 500;
    cursor: pointer;
    display: flex;
    align-items: center;
    gap: 6px;
    transition: all 0.2s;
  `;
  lightBtn.onclick = () => {
    chrome.storage.sync.set({ theme: 'light' }, () => {
      applyThemeToPopup('light', popup);
      lightBtn.style.backgroundColor = c.primary;
      lightBtn.style.color = c.primaryForeground;
      lightBtn.style.border = `1px solid ${c.primary}`;
      lightBtn.style.boxShadow = `0 2px 8px ${c.primary}30`;
      lightBtn.innerHTML = `<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M21 12a9 9 0 1 1-18 0 9 9 0 0 1 18 0z"/></svg> Light`;
    });
  };
  const darkBtn = document.createElement('button');
  darkBtn.id = 'verinews-theme-dark';
  darkBtn.innerHTML = `<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M12 2L2 12h20L12 2z"/></svg> Dark`;
  darkBtn.style.cssText = `
    background: hsl(var(--muted));
    color: hsl(var(--primary-text));
    border: none;
    border-radius: 6px;
    padding: 6px 12px;
    font-size: 13px;
    font-weight: 500;
    cursor: pointer;
    display: flex;
    align-items: center;
    gap: 6px;
    transition: all 0.2s;
  `;
  darkBtn.onclick = () => {
    chrome.storage.sync.set({ theme: 'dark' }, () => {
      applyThemeToPopup('dark', popup);
      darkBtn.style.backgroundColor = c.primary;
      darkBtn.style.color = c.primaryForeground;
      darkBtn.style.border = `1px solid ${c.primary}`;
      darkBtn.style.boxShadow = `0 2px 8px ${c.primary}30`;
      darkBtn.innerHTML = `<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M12 2L2 12h20L12 2z"/></svg> Dark`;
    });
  };
  themeSwitcher.appendChild(systemBtn);
  themeSwitcher.appendChild(lightBtn);
  themeSwitcher.appendChild(darkBtn);
  popup.appendChild(themeSwitcher);

  // Main HTML
  popup.innerHTML = `
    <div id="verinews-move-header" style="cursor: move; user-select: none; display: flex; align-items: center; gap: 14px; background: linear-gradient(135deg, hsl(var(--primary)), hsl(var(--secondary))); color: hsl(var(--primary-foreground)); border-radius: 18px 18px 0 0; padding: 18px 24px 14px 24px; font-weight: 700; font-size: 19px; box-shadow: 0 2px 8px rgba(0,0,0,0.08);">
      <div style="width: 36px; height: 36px; border-radius: 10px; background: ${verdictStyle.bg}; display: flex; align-items: center; justify-content: center; font-size: 20px; color: ${verdictStyle.color};">
        ${verdictStyle.icon}
      </div>
      <div style="flex: 1;">
        <div style="font-size: 18px; font-weight: 700; color: hsl(var(--primary-foreground)); letter-spacing: 0.01em;">${result.verdict || 'Uncertain'}</div>
        <div style="font-size: 13px; color: rgba(255,255,255,0.85); margin-top: 2px;">${result.category ? result.category.charAt(0).toUpperCase() + result.category.slice(1) : ''}</div>
      </div>
      <div style="opacity: 0.7; cursor: pointer; padding: 4px; border-radius: 4px; transition: all 0.2s;" id="verinews-close-btn">
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
          <path d="M18 6L6 18M6 6l12 12"/>
        </svg>
      </div>
    </div>
    <div style="padding: 24px 24px 18px 24px; background: ${c.background};">
      <div style="font-size: 16px; font-weight: 600; margin-bottom: 10px; color: ${c.text}; line-height: 1.5; letter-spacing: 0.01em;">${result.conclusion || ''}</div>
      <div style="font-size: 14px; color: ${c.muted}; margin-bottom: 16px; line-height: 1.6;">${result.explanation || ''}</div>
      <div style="display: flex; align-items: center; gap: 12px; margin-bottom: 10px;">
        <span style="font-size: 13px; color: ${c.muted};">Confidence: <b style="color:${c.text};">${result.confidence !== undefined && result.confidence !== null ? Number(result.confidence).toFixed(1) : '0'}%</b></span>
      </div>
      ${renderTimingsDropdown(result.timings, c)}
      ${renderSources(result.sources, c)}
      <div style="margin-top: 18px; display: flex; gap: 12px; justify-content: flex-end;">
        <button id="verinews-close" aria-label="Close verification result" style="padding: 9px 24px; background: hsl(var(--primary)); color: hsl(var(--primary-foreground)); border: none; border-radius: 8px; font-size: 15px; font-weight: 600; cursor: pointer; transition: all 0.2s ease;">Close</button>
      </div>
    </div>
    <style>
      #verinews-popup:focus { outline: 2px solid hsl(var(--primary)); outline-offset: 2px; }
      #verinews-popup-overlay:focus { outline: none; }
      #verinews-move-header:active { background: linear-gradient(135deg, hsl(var(--secondary)), hsl(var(--primary))); }
      #verinews-close-btn:hover { opacity: 1; background: hsl(var(--muted) / 0.13); }
      #verinews-close:hover { transform: translateY(-1px); box-shadow: 0 4px 12px rgba(0,0,0,0.13); }
      @media (max-width: 600px) { 
        #verinews-popup { 
          min-width: 0 !important; 
          max-width: 98vw !important; 
          margin: 10px;
        } 
        #verinews-move-header { padding: 14px 10px 10px 10px; font-size: 16px; }
      }
    </style>
  `;

  // Copy button logic
  const copyBtn = popup.querySelector('#verinews-copy-btn');
  if (copyBtn) {
    copyBtn.onclick = () => {
      navigator.clipboard.writeText(
        `Claim: ${claim || ''}\nConclusion: ${result.conclusion || ''}\nExplanation: ${result.explanation || ''}\nConfidence: ${result.confidence || ''}%\nCategory: ${result.category || ''}\nClaim ID: ${result.claim_id || ''}`
      );
    };
  }

  // Timings toggle logic
  const timingsToggle = popup.querySelector('#verinews-timings-toggle');
  const timingsSection = popup.querySelector('#verinews-timings-section');
  if (timingsToggle && timingsSection) {
    timingsToggle.onclick = () => {
      if (timingsSection.style.display === 'none') {
        timingsSection.style.display = 'block';
        timingsToggle.textContent = 'Hide timings';
      } else {
        timingsSection.style.display = 'none';
        timingsToggle.textContent = 'Show timings';
      }
    };
  }
  // Source show more/less logic
  const sourceToggles = popup.querySelectorAll('.verinews-source-toggle');
  sourceToggles.forEach(btn => {
    btn.onclick = () => {
      const idx = btn.getAttribute('data-index');
      const details = btn.closest('div').querySelector('.verinews-source-details');
      if (details.style.display === 'none') {
        details.style.display = 'block';
        btn.textContent = 'Show less';
      } else {
        details.style.display = 'none';
        btn.textContent = 'Show more';
      }
    };
  });

  // Movable logic
  let isDragging = false, startX = 0, startY = 0, startLeft = 0, startTop = 0;
  const header = popup.querySelector('#verinews-move-header');
  header.addEventListener('mousedown', (e) => {
    if (e.target.closest('#verinews-close-btn')) return;
    isDragging = true;
    startX = e.clientX;
    startY = e.clientY;
    const rect = popup.getBoundingClientRect();
    startLeft = rect.left;
    startTop = rect.top;
    document.body.style.userSelect = 'none';
    popup.style.transform = 'translate(-50%, -50%) scale(0.98)';
  });
  document.addEventListener('mousemove', onDrag);
  document.addEventListener('mouseup', onStopDrag);
  function onDrag(e) {
    if (!isDragging) return;
    let newLeft = startLeft + (e.clientX - startX);
    let newTop = startTop + (e.clientY - startY);
    const minMargin = 20;
    newLeft = Math.max(minMargin, Math.min(window.innerWidth - popup.offsetWidth - minMargin, newLeft));
    newTop = Math.max(minMargin, Math.min(window.innerHeight - popup.offsetHeight - minMargin, newTop));
    popup.style.left = newLeft + 'px';
    popup.style.top = newTop + 'px';
    popup.style.transform = 'scale(0.98)';
  }
  function onStopDrag() {
    if (isDragging) {
      isDragging = false;
      document.body.style.userSelect = '';
      popup.style.transform = 'scale(1)';
    }
  }

  // Close handlers
  const closePopup = () => {
    document.removeEventListener('mousemove', onDrag);
    document.removeEventListener('mouseup', onStopDrag);
    overlay.style.opacity = '0';
    popup.style.transform = 'translate(-50%, -50%) scale(0.95)';
    popup.style.opacity = '0';
    setTimeout(() => overlay.remove(), 300);
  };
  popup.querySelector('#verinews-close').onclick = closePopup;
  popup.querySelector('#verinews-close-btn').onclick = closePopup;
  overlay.addEventListener('mousedown', (e) => {
    if (e.target === overlay) closePopup();
  });
  overlay.addEventListener('keydown', (e) => {
    if (e.key === 'Escape') closePopup();
  });
  overlay.appendChild(popup);
  document.body.appendChild(overlay);
  requestAnimationFrame(() => {
    overlay.style.opacity = '1';
    popup.style.transform = 'translate(-50%, -50%) scale(1)';
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

// --- Floating Verify Button on Text Selection ---
let verifyFab = null;
document.addEventListener('selectionchange', () => {
  if (verifyFab) verifyFab.remove();
  const selection = window.getSelection();
  if (selection && selection.toString().trim().length > 0) {
    const range = selection.getRangeAt(0);
    const rect = range.getBoundingClientRect();
    if (rect && rect.width && rect.height) {
      verifyFab = document.createElement('button');
      verifyFab.id = 'verinews-verify-fab';
      verifyFab.innerHTML = `<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M9 12l2 2 4-4"/><circle cx="12" cy="12" r="10"/></svg> Verify`;
      verifyFab.style.cssText = `
        position: fixed;
        left: ${rect.left + window.scrollX + rect.width / 2 - 40}px;
        top: ${rect.top + window.scrollY - 48}px;
        z-index: 2147483647;
        background: hsl(var(--primary));
        color: hsl(var(--primary-foreground));
        border: none;
        border-radius: 999px;
        box-shadow: 0 4px 16px rgba(0,0,0,0.13);
        padding: 10px 18px;
        font-size: 15px;
        font-weight: 600;
        cursor: pointer;
        display: flex;
        align-items: center;
        gap: 8px;
        transition: background 0.2s, box-shadow 0.2s;
      `;
      verifyFab.onmousedown = (e) => { e.preventDefault(); };
      verifyFab.onclick = () => {
        const claim = selection.toString();
        // Show loading indicator
        showLoadingIndicatorAtSelection();
        // Send message to background to verify
        chrome.runtime.sendMessage({ action: 'verifyClaim', claim }, () => {});
        verifyFab.remove();
      };
      document.body.appendChild(verifyFab);
    }
  }
});
document.addEventListener('mousedown', () => {
  if (verifyFab) verifyFab.remove();
});

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
