
import React from 'react';
import { createRoot } from 'react-dom/client';
import Popup from './Popup';
import '../index.css';

const container = document.getElementById('popup-root');
if (container) {
  const root = createRoot(container);
  root.render(<Popup />);
}
