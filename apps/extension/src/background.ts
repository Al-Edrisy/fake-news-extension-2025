// Create context menu
chrome.runtime.onInstalled.addListener(() => {
  chrome.contextMenus.create({
    id: "verifyWithVeriNews",
    title: "Verify with VeriNews",
    contexts: ["selection"]
  });
});

// Handle context menu clicks
chrome.contextMenus.onClicked.addListener(async (info, tab) => {
  if (!tab?.id || !info.selectionText || !tab.url) return;

  const restrictedPatterns = [
    'chrome://',
    'about:',
    'edge://',
    'opera://',
    'vivaldi://',
    'moz-extension://'
  ];

  if (restrictedPatterns.some(pattern => tab.url?.startsWith(pattern))) {
    return;
  }

  try {
    const { history = [] } = await chrome.storage.local.get('history');
    const newHistory = [
      { text: info.selectionText, timestamp: new Date().toISOString() },
      ...(history || []).slice(0, 49)
    ];
    await chrome.storage.local.set({ history: newHistory });

    // Inject content script
    await chrome.scripting.executeScript({
      target: { tabId: tab.id },
      files: ['content.js']
    });

    // Show widget
    chrome.tabs.sendMessage(tab.id, {
      action: 'showWidget',
      text: info.selectionText
    });
  } catch (error) {
    console.error('Error handling context menu:', error);
  }
});

// Handle keyboard shortcut
chrome.commands.onCommand.addListener((command) => {
  if (command === 'close-widget') {
    chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
      if (tabs[0]?.id) {
        chrome.tabs.sendMessage(tabs[0].id, { action: 'hideWidget' });
      }
    });
  }
});