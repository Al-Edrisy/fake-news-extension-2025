import React, { useEffect, useRef, useState } from 'react';
import { 
  X, Move, Check, XCircle, HelpCircle, Loader2, ExternalLink, Star, History, Settings 
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { Tooltip, TooltipContent, TooltipTrigger } from '@/components/ui/tooltip';
import { useChromeStorage } from '@/hooks/useChromeStorage';
import { useVerification } from '@/hooks/useVerification';
import { FactCheckResult, FactCheckSource, Theme, Position, HistoryItem, Tab } from '@/types';

interface WidgetProps {
  claim: string;
  position: Position;
  theme: Theme;
  onClose: () => void;
  onPositionChange: (position: Position) => void;
}

const Card: React.FC<{ children: React.ReactNode; className?: string }> = ({ children, className = '' }) => (
  <div className={`border rounded-lg bg-card text-card-foreground overflow-hidden ${className}`}>
    {children}
  </div>
);

const CardHeader: React.FC<{ children: React.ReactNode; className?: string }> = ({ children, className = '' }) => (
  <div className={`border-b p-4 ${className}`}>{children}</div>
);

const CardContent: React.FC<{ children: React.ReactNode; className?: string }> = ({ children, className = '' }) => (
  <div className={`p-4 ${className}`}>{children}</div>
);

export const Widget: React.FC<WidgetProps> = ({ 
  claim, position, theme, onClose, onPositionChange 
}) => {
  const { result: data, loading, error } = useVerification(claim);
  const [activeTab, setActiveTab] = useState<Tab>('results');
  const { data: favorites = [], setData: setFavorites } = useChromeStorage<string[]>('favorites', []);
  const { data: history = [], setData: setHistory } = useChromeStorage<HistoryItem[]>('history', []);
  const widgetRef = useRef<HTMLDivElement>(null);
  const [isDragging, setIsDragging] = useState(false);
  const [dragOffset, setDragOffset] = useState({ x: 0, y: 0 });
  const [currentPosition, setCurrentPosition] = useState(position);

  useEffect(() => {
    setCurrentPosition(position);
  }, [position]);

  const handleMouseDown = (e: React.MouseEvent) => {
    if (widgetRef.current) {
      const rect = widgetRef.current.getBoundingClientRect();
      setDragOffset({
        x: e.clientX - rect.left,
        y: e.clientY - rect.top
      });
      setIsDragging(true);
    }
  };

  useEffect(() => {
    if (!isDragging) return;

    const handleMouseMove = (e: MouseEvent) => {
      if (!widgetRef.current) return;

      const newX = e.clientX - dragOffset.x;
      const newY = e.clientY - dragOffset.y;
      
      const clampedX = Math.max(0, Math.min(window.innerWidth - widgetRef.current.offsetWidth, newX));
      const clampedY = Math.max(0, Math.min(window.innerHeight - widgetRef.current.offsetHeight, newY));
      
      setCurrentPosition({ x: clampedX, y: clampedY });
    };

    const handleMouseUp = () => {
      setIsDragging(false);
      onPositionChange(currentPosition);
    };

    document.addEventListener('mousemove', handleMouseMove);
    document.addEventListener('mouseup', handleMouseUp);
    document.body.style.userSelect = 'none';
    document.body.style.cursor = 'grabbing';

    return () => {
      document.removeEventListener('mousemove', handleMouseMove);
      document.removeEventListener('mouseup', handleMouseUp);
      document.body.style.userSelect = '';
      document.body.style.cursor = '';
    };
  }, [isDragging, dragOffset, currentPosition, onPositionChange]);

  useEffect(() => {
    if (widgetRef.current) {
      widgetRef.current.classList.toggle('dragging-widget', isDragging);
    }
  }, [isDragging]);

  const isFavorite = favorites.includes(claim);
  
  const toggleFavorite = () => {
    if (isFavorite) {
      setFavorites(favorites.filter(fav => fav !== claim));
    } else {
      setFavorites([...favorites, claim]);
    }
  };

  const getVerdictDisplay = () => {
    if (!data) return null;
    
    const verdictMap: Record<FactCheckResult['verdict'], {
      icon: JSX.Element;
      color: string;
      label: string;
    }> = {
      'True': {
        icon: <Check className="h-6 w-6 text-green-500" />,
        color: 'bg-green-100 text-green-800 border-green-300',
        label: 'Verified True'
      },
      'False': {
        icon: <XCircle className="h-6 w-6 text-red-500" />,
        color: 'bg-red-100 text-red-800 border-red-300',
        label: 'Verified False'
      },
      'Unknown': {
        icon: <HelpCircle className="h-6 w-6 text-yellow-500" />,
        color: 'bg-yellow-100 text-yellow-800 border-yellow-300',
        label: 'Unverified'
      }
    };

    const verdictInfo = verdictMap[data.verdict];
    
    return (
      <div className={`flex items-center gap-3 p-3 rounded-lg border ${verdictInfo.color}`}>
        {verdictInfo.icon}
        <div>
          <h3 className="font-bold text-lg">{verdictInfo.label}</h3>
          <p className="text-sm">{data.explanation}</p>
        </div>
      </div>
    );
  };

  const getSupportBadge = (support: FactCheckSource['support']) => {
    const supportMap: Record<FactCheckSource['support'], { 
      variant: 'default' | 'destructive' | 'secondary';
      text: string;
      className: string;
    }> = {
      'True': { 
        variant: 'default', 
        text: 'Supports', 
        className: 'bg-green-100 text-green-800' 
      },
      'False': { 
        variant: 'destructive', 
        text: 'Contradicts', 
        className: 'bg-red-100 text-red-800' 
      },
      'Unknown': { 
        variant: 'secondary', 
        text: 'Unknown', 
        className: 'bg-gray-100 text-gray-800' 
      }
    };

    const supportInfo = supportMap[support];
    
    return (
      <Badge variant={supportInfo.variant} className={supportInfo.className}>
        {supportInfo.text}
      </Badge>
    );
  };

  const relevantSources = data?.sources.filter(source => source.relevant) || [];

  return (
    <div
      ref={widgetRef}
      className={`fixed z-[2147483647] w-[420px] rounded-xl shadow-2xl border bg-card text-card-foreground overflow-hidden transition-all duration-300 ${theme === 'dark' ? 'dark' : ''}`}
      style={{
        top: `${currentPosition.y}px`,
        left: `${currentPosition.x}px`,
        boxShadow: '0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04)',
        maxHeight: '90vh'
      }}
    >
      {/* Header */}
      <div 
        className="flex items-center justify-between p-3 bg-gradient-to-r from-blue-50 to-indigo-50 dark:from-gray-800 dark:to-gray-800 rounded-t-xl cursor-move border-b"
        onMouseDown={handleMouseDown}
      >
        <div className="flex items-center gap-2">
          <Move className="h-4 w-4 text-blue-600 dark:text-blue-400" />
          <h2 className="font-bold flex items-center gap-2">
            <span className="bg-blue-600 text-white px-2 py-1 rounded-md text-xs">AI-Powered</span>
            VeriNews Fact Check
          </h2>
        </div>
        <div className="flex items-center gap-1">
          <Button 
            variant="ghost" 
            size="icon" 
            className="h-7 w-7 rounded-full"
            onClick={toggleFavorite}
          >
            <Star className={`h-4 w-4 ${isFavorite ? 'text-yellow-500 fill-yellow-500' : ''}`} />
          </Button>
          <Button 
            variant="ghost" 
            size="icon" 
            className="h-7 w-7 rounded-full"
            onClick={onClose}
          >
            <X className="h-4 w-4" />
          </Button>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex border-b">
        <Button 
          variant="ghost"
          className={`flex-1 rounded-none ${activeTab === 'results' ? 'border-b-2 border-blue-500' : ''}`}
          onClick={() => setActiveTab('results')}
        >
          Results
        </Button>
        <Button 
          variant="ghost"
          className={`flex-1 rounded-none ${activeTab === 'history' ? 'border-b-2 border-blue-500' : ''}`}
          onClick={() => setActiveTab('history')}
        >
          <History className="h-4 w-4 mr-2" /> History
        </Button>
        <Button 
          variant="ghost"
          className={`flex-1 rounded-none ${activeTab === 'settings' ? 'border-b-2 border-blue-500' : ''}`}
          onClick={() => setActiveTab('settings')}
        >
          <Settings className="h-4 w-4 mr-2" /> Settings
        </Button>
      </div>

      {/* Main Content */}
      <div className="p-4 overflow-y-auto" style={{ maxHeight: 'calc(90vh - 100px)' }}>
        {activeTab === 'results' ? (
          <>
            {loading ? (
              <div className="flex flex-col items-center justify-center py-8 gap-4">
                <Loader2 className="h-10 w-10 animate-spin text-blue-500" />
                <div className="text-center">
                  <p className="font-medium">Analyzing claim</p>
                  <p className="text-sm text-muted-foreground">Verifying with trusted sources...</p>
                </div>
              </div>
            ) : error ? (
              <Card className="bg-red-50 dark:bg-red-900/20 border-red-200 dark:border-red-800">
                <CardHeader>
                  <div className="text-red-700 dark:text-red-300 flex items-center gap-2">
                    <XCircle className="h-5 w-5" /> Error
                  </div>
                </CardHeader>
                <CardContent>
                  <p className="text-red-600 dark:text-red-400">{error}</p>
                  <Button 
                    variant="outline" 
                    className="mt-3 text-red-700 border-red-300 hover:bg-red-100 dark:hover:bg-red-900/30"
                    onClick={() => window.location.reload()}
                  >
                    Try Again
                  </Button>
                </CardContent>
              </Card>
            ) : data ? (
              <div className="space-y-4">
                {/* Claim */}
                <Card>
                  <CardHeader>
                    <div className="font-bold text-lg">Claim Analysis</div>
                  </CardHeader>
                  <CardContent>
                    <p className="bg-gray-100 dark:bg-gray-800 p-3 rounded-lg">
                      "{claim}"
                    </p>
                  </CardContent>
                </Card>

                {/* Verdict */}
                {getVerdictDisplay()}

                {/* Confidence */}
                <Card>
                  <CardContent className="pt-4">
                    <div className="flex justify-between items-center mb-2">
                      <span className="text-sm font-medium">Confidence Score</span>
                      <span className="text-sm font-bold text-blue-600 dark:text-blue-400">
                        {data.confidence}%
                      </span>
                    </div>
                    <Progress value={data.confidence} />
                  </CardContent>
                </Card>

                {/* Sources */}
                <Card>
                  <CardHeader>
                    <div className="font-bold text-lg">Source Analysis</div>
                    <p className="text-sm text-muted-foreground">
                      Based on {relevantSources.length} relevant sources
                    </p>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    {relevantSources.map((source, idx) => (
                      <div key={`${source.url}-${idx}`} className="space-y-3">
                        <div className="flex justify-between items-start gap-2">
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center gap-2 mb-1">
                              <div className="w-3 h-3 rounded-full bg-blue-500 flex-shrink-0"></div>
                              <span className="text-sm font-medium truncate">
                                {source.source}
                              </span>
                            </div>
                            <Tooltip>
                              <TooltipTrigger asChild>
                                <a 
                                  href={source.url} 
                                  target="_blank" 
                                  rel="noopener noreferrer"
                                  className="block font-semibold text-blue-600 hover:text-blue-800 dark:text-blue-400 dark:hover:text-blue-300 hover:underline truncate text-sm"
                                >
                                  <span className="flex items-center gap-1">
                                    {source.title}
                                    <ExternalLink className="h-3 w-3 flex-shrink-0" />
                                  </span>
                                </a>
                              </TooltipTrigger>
                              <TooltipContent className="max-w-xs">
                                <p className="text-xs">Open source in new tab</p>
                              </TooltipContent>
                            </Tooltip>
                          </div>
                          <div className="flex-shrink-0">
                            {getSupportBadge(source.support)}
                            <div className="text-xs text-right mt-1">
                              {source.confidence}% confidence
                            </div>
                          </div>
                        </div>
                        
                        <p className="text-sm line-clamp-2">
                          {source.snippet}
                        </p>
                        
                        <div className="text-xs bg-muted p-3 rounded-lg">
                          <p className="font-medium mb-1">Analysis:</p>
                          <p className="text-muted-foreground">{source.reason}</p>
                        </div>
                        
                        {idx < relevantSources.length - 1 && (
                          <Separator className="my-3" />
                        )}
                      </div>
                    ))}
                  </CardContent>
                </Card>
              </div>
            ) : (
              <Card>
                <CardHeader>
                  <div className="font-bold text-lg">No Claim Analyzed</div>
                </CardHeader>
                <CardContent>
                  <p className="mb-4">
                    Highlight text and select "Verify with VeriNews" from the context menu to check a claim.
                  </p>
                </CardContent>
              </Card>
            )}
          </>
        ) : activeTab === 'history' ? (
          <div className="space-y-3">
            <h3 className="font-semibold">Verification History</h3>
            {history.length > 0 ? (
              <div className="space-y-2">
                {history.map((item, index) => (
                  <Card key={index} className="p-3 hover:bg-muted cursor-pointer">
                    <p className="text-sm line-clamp-2">"{item.text}"</p>
                    <p className="text-xs text-muted-foreground mt-1">
                      {new Date(item.timestamp).toLocaleString()}
                    </p>
                  </Card>
                ))}
              </div>
            ) : (
              <p className="text-muted-foreground text-center py-4">No verification history</p>
            )}
          </div>
        ) : (
          <div className="space-y-4">
            <h3 className="font-semibold">Settings</h3>
            
            <div>
              <h4 className="font-medium mb-2">Theme</h4>
              <div className="flex gap-2">
                <Button 
                  variant={theme === 'light' ? 'default' : 'outline'}
                  onClick={() => chrome.storage.local.set({ theme: 'light' })}
                >
                  Light
                </Button>
                <Button 
                  variant={theme === 'dark' ? 'default' : 'outline'}
                  onClick={() => chrome.storage.local.set({ theme: 'dark' })}
                >
                  Dark
                </Button>
              </div>
            </div>
            
            <Separator />
            
            <div>
              <h4 className="font-medium mb-2">Data Management</h4>
              <Button 
                variant="destructive"
                onClick={() => {
                  if (confirm('Are you sure you want to clear your history?')) {
                    setHistory([]);
                    setFavorites([]);
                  }
                }}
              >
                Clear History & Favorites
              </Button>
            </div>
          </div>
        )}
      </div>

      {/* Footer */}
      <div className="text-center p-2 border-t">
        <p className="text-xs text-muted-foreground">
          Powered by VeriNews AI • {new Date().toLocaleDateString()}
        </p>
      </div>
    </div>
  );
};