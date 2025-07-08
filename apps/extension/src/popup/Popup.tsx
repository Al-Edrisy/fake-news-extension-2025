// src/popup/Popup.tsx
import React from 'react';
import { Button } from '@/components/ui/button';
import { History, Settings } from 'lucide-react';
import { useChromeStorage } from '@/hooks/useChromeStorage';

// Define Card components inside the file
const Card = ({ children }: { children: React.ReactNode }) => (
  <div className="border rounded-lg bg-card text-card-foreground overflow-hidden">
    {children}
  </div>
);

const CardContent = ({ children, className = '' }: { 
  children: React.ReactNode; 
  className?: string 
}) => (
  <div className={`p-4 ${className}`}>{children}</div>
);

const Popup: React.FC = () => {
  const { data: history } = useChromeStorage<Array<{text: string; timestamp: string}>>('history', []);
  const { data: favorites } = useChromeStorage<string[]>('favorites', []);

  const handleCheckCurrentPage = () => {
    chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
      if (tabs[0]?.id) {
        chrome.tabs.sendMessage(tabs[0].id, { action: 'showWidget' });
      }
    });
  };

  return (
    <div className="w-80 p-4 bg-background text-foreground">
      <div className="flex items-center justify-between mb-4">
        <h1 className="text-xl font-bold flex items-center gap-2">
          <span className="bg-blue-600 text-white px-2 py-1 rounded-md">AI</span>
          VeriNews Pro
        </h1>
        <div className="flex gap-1">
          <Button variant="ghost" size="icon">
            <History className="h-4 w-4" />
          </Button>
          <Button variant="ghost" size="icon">
            <Settings className="h-4 w-4" />
          </Button>
        </div>
      </div>
      
      <Button className="w-full mb-4" onClick={handleCheckCurrentPage}>
        Check Current Page
      </Button>
      
      <div className="grid grid-cols-2 gap-4 mb-4">
        <Card>
          <CardContent className="p-4">
            <div className="text-2xl font-bold">{history?.length || 0}</div>
            <div className="text-sm text-muted-foreground">History</div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="text-2xl font-bold">{favorites?.length || 0}</div>
            <div className="text-sm text-muted-foreground">Favorites</div>
          </CardContent>
        </Card>
      </div>
      
      <div className="text-sm text-muted-foreground">
        <p>Right-click selected text to verify with VeriNews</p>
      </div>
    </div>
  );
};

export default Popup;