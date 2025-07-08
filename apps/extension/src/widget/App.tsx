import React, { useState } from 'react';
import { Widget } from './Widget';
import { useChromeStorage } from '@/hooks/useChromeStorage';
import { ErrorBoundary } from '@/components/ErrorBoundary';

export const App: React.FC<{ text?: string }> = ({ text = '' }) => {
  const [visible, setVisible] = useState(true);
  const { data: position, setData: setPosition } = useChromeStorage<{x: number; y: number}>(
    'widgetPosition', 
    { x: 100, y: 100 }
  );
  const { data: theme } = useChromeStorage<'light' | 'dark'>('theme', 'light');

  const updatePosition = (newPosition: { x: number; y: number }) => {
    setPosition(newPosition);
  };

  if (!visible) return null;

  return (
    <ErrorBoundary>
      <Widget 
        claim={text}
        position={position || { x: 100, y: 100 }}
        theme={theme === 'dark' ? 'dark' : 'light'}
        onClose={() => setVisible(false)}
        onPositionChange={updatePosition}
      />
    </ErrorBoundary>
  );
};