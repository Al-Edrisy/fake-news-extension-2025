// src/popup/index.tsx
import React from 'react';
import { createRoot } from 'react-dom/client';
import Popup from './Popup';
import '@/index.css'; // Make sure this imports Tailwind

const container = document.getElementById('root');
if (!container) throw new Error('Root element not found');

const root = createRoot(container);
root.render(
  <React.StrictMode>
    <Popup />
  </React.StrictMode>
);