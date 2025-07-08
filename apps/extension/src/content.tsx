import React from 'react';
import { createRoot } from 'react-dom/client';
import { App } from './widget/App';
import '@/index.css'; // Import Tailwind CSS for content script

// Ensure this runs in browser context
if (typeof window !== 'undefined') {
  function initWidgetContainer(): HTMLDivElement {
    let widget = document.getElementById('verinews-widget');
    
    if (!widget) {
      widget = document.createElement('div');
      widget.id = 'verinews-widget';
      widget.style.position = 'fixed';
      widget.style.zIndex = '2147483647';
      widget.style.pointerEvents = 'none';
      document.body.appendChild(widget);
    }
    
    return widget as HTMLDivElement;
  }

  function showWidget(text: string) {
    try {
      const widget = initWidgetContainer();
      widget.style.pointerEvents = 'auto';
      
      const root = createRoot(widget);
      root.render(<App text={text} />);
    } catch (error) {
      console.error('Error rendering widget:', error);
    }
  }

  function hideWidget() {
    const widget = document.getElementById('verinews-widget');
    if (widget) {
      const root = createRoot(widget);
      root.unmount();
      widget.remove();
    }
  }

  chrome.runtime.onMessage.addListener((message: { action: string; text?: string }) => {
    if (message.action === 'showWidget' && message.text) {
      showWidget(message.text);
    } else if (message.action === 'hideWidget') {
      hideWidget();
    }
    return true;
  });
}