
import React from 'react';
import { createRoot } from 'react-dom/client';
import { TooltipProvider } from '@/components/ui/tooltip';
import { Toaster } from '@/components/ui/toaster';
import Options from './Options';
import '../index.css';

const container = document.getElementById('options-root');
if (container) {
  const root = createRoot(container);
  root.render(
    <TooltipProvider>
      <Options />
      <Toaster />
    </TooltipProvider>
  );
}
