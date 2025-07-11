
import React, { useState, useEffect } from 'react';
import { 
  CheckCircle, 
  XCircle, 
  AlertTriangle, 
  Info, 
  Send, 
  Settings, 
  Zap, 
  Globe, 
  Loader2, 
  X
} from 'lucide-react';
import { Card, CardHeader, CardTitle, CardContent } from '../components/ui/card';
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip } from 'recharts';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip as RechartsTooltip, ResponsiveContainer as RechartsResponsiveContainer } from 'recharts';

interface PageInfo {
  title: string;
  url: string;
  textLength: number;
}

interface VerificationResult {
  category: string;
  claim_id: string;
  conclusion: string;
  confidence: number;
  verdict: 'True' | 'False' | 'Partial' | 'Uncertain' | 'Unknown';
  explanation?: string;
  sources?: Array<{
    authoritative: boolean;
    confidence: number;
    content: string;
    date: string;
    reason: string;
    relevant: boolean;
    snippet: string;
    source: string;
    sources: unknown[];
    status: string;
    support: string;
    title: string;
    url: string;
  }>;
  status: string;
  timings?: {
    analysis: number;
    database: number;
    scraping: number;
  };
}

function safeSendMessage<T = unknown>(
  tabId: number,
  message: T,
  callback: (response?: unknown) => void = () => {}
) {
  try {
    chrome.tabs.get(tabId, (tab) => {
      if (chrome.runtime.lastError) {
        console.log('Tab not found:', chrome.runtime.lastError.message);
        return;
      }
      
      if (!tab || !tab.url || !tab.url.startsWith('http')) {
        console.log('Tab not suitable for content script injection');
        return;
      }
      
      chrome.tabs.sendMessage(tabId, message, (response) => {
        if (chrome.runtime.lastError) {
          console.log('Content script not available:', chrome.runtime.lastError.message);
          // Don't throw error, just log it
        } else if (callback) {
          callback(response);
        }
      });
    });
  } catch (error) {
    console.log('Error sending message to content script:', error);
  }
}

// Donut chart for timings using recharts and shadcn/ui Card
const DonutChart = ({ timings }: { timings: { analysis?: number; database?: number; scraping?: number } }) => {
  const data = [
    { name: 'Analysis', value: timings.analysis || 0, color: 'hsl(var(--primary))' },
    { name: 'Database', value: timings.database || 0, color: 'hsl(var(--secondary))' },
    { name: 'Scraping', value: timings.scraping || 0, color: 'hsl(var(--accent))' },
  ];
  const total = data.reduce((sum, d) => sum + d.value, 0) || 1;
  return (
    <Card className="my-4 bg-muted/40 border border-border/60 shadow-none" aria-label="Timing breakdown donut chart">
      <CardHeader className="pb-1 flex flex-row items-center justify-between">
        <CardTitle className="text-base font-semibold flex items-center gap-2">
          <span role="img" aria-label="Donut Chart">🍩</span> Timing Breakdown
        </CardTitle>
        <span className="text-xs text-muted-foreground">Total: {total.toFixed(2)}s</span>
      </CardHeader>
      <CardContent className="flex flex-col items-center gap-2 pt-2 pb-4 animate-fade-in">
        <div className="relative flex items-center justify-center" style={{ width: 160, height: 160 }}>
          <ResponsiveContainer width="100%" height="100%">
            <PieChart aria-label="Timing Donut Chart">
              <Pie
                data={data}
                dataKey="value"
                nameKey="name"
                cx="50%"
                cy="50%"
                innerRadius={50}
                outerRadius={75}
                paddingAngle={3}
                label={({ name, percent }) => percent > 0.12 ? name : ''}
                isAnimationActive={true}
                animationDuration={900}
                animationEasing="ease-out"
                aria-label="Timing Pie"
              >
                {data.map((entry, idx) => (
                  <Cell key={`cell-${idx}`} fill={entry.color} aria-label={`${entry.name}: ${entry.value.toFixed(2)}s`} />
                ))}
              </Pie>
              <Tooltip formatter={(value: number) => `${value.toFixed(2)}s`} />
            </PieChart>
          </ResponsiveContainer>
          <div className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 text-center pointer-events-none">
            <span className="font-bold text-lg text-primary-text drop-shadow" aria-live="polite">{total.toFixed(2)}s</span>
            <div className="text-xs text-muted-foreground">Total</div>
            <span className="sr-only">Timing donut chart shows analysis, database, and scraping durations in seconds.</span>
          </div>
        </div>
        <div className="flex flex-wrap justify-center gap-3 mt-2 text-xs" role="list" aria-label="Timing legend">
          {data.map(d => (
            <span
              key={d.name}
              className="flex items-center gap-1 px-2 py-1 rounded bg-background border border-border/60 focus:outline-none focus:ring-2 focus:ring-primary transition-colors hover:bg-muted/60 cursor-pointer"
              tabIndex={0}
              role="listitem"
              aria-label={`${d.name}: ${d.value.toFixed(2)} seconds`}
              title={`${d.name}: ${d.value.toFixed(2)} seconds`}
            >
              <span style={{ background: d.color, width: 10, height: 10, borderRadius: 2, display: 'inline-block', outline: '1px solid #333' }}></span>
              {d.name}
              <span className="ml-1 font-semibold text-primary-text">{d.value.toFixed(2)}s</span>
            </span>
          ))}
        </div>
      </CardContent>
    </Card>
  );
};

const TimingToggle = ({ timings }: { timings: { analysis?: number; database?: number; scraping?: number } }) => {
  const [open, setOpen] = useState(false);
  return (
    <div className="w-full">
      <button
        className="flex items-center gap-2 text-sm font-medium px-3 py-2 rounded-lg border border-border bg-muted hover:bg-muted/70 transition-colors mb-2"
        onClick={() => setOpen((v) => !v)}
        aria-expanded={open}
        aria-controls="timing-info-section"
      >
        <span>{open ? 'Hide Timing Info' : 'Show Timing Info'}</span>
        <svg className={`w-4 h-4 transition-transform ${open ? 'rotate-180' : ''}`} viewBox="0 0 20 20" fill="currentColor"><path fillRule="evenodd" d="M5.23 7.21a.75.75 0 011.06.02L10 10.584l3.71-3.354a.75.75 0 111.02 1.1l-4.25 3.846a.75.75 0 01-1.02 0l-4.25-3.846a.75.75 0 01.02-1.06z" clipRule="evenodd" /></svg>
      </button>
      {open && (
        <div id="timing-info-section" className="mt-2">
          <DonutChart timings={timings} />
        </div>
      )}
    </div>
  );
};

const ConfidenceLineChart = ({ sources }: { sources: Array<{ title: string; url: string; confidence: number }> }) => {
  if (!sources || sources.length === 0) return null;
  // Prepare data for the chart
  const data = sources.map((src, idx) => ({
    name: src.title || `Source ${idx + 1}`,
    confidence: Math.max(0, Math.min(100, src.confidence ?? 0)),
    idx: idx + 1,
  }));
  return (
    <div className="w-full mt-6">
      <div className="font-semibold text-base mb-3 flex items-center gap-2">
        <svg className="w-5 h-5 text-primary" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path d="M4 17l6-6 4 4 6-6" /></svg>
        Source Confidence Trend
      </div>
      <div className="rounded-xl bg-background border border-border/60 p-3 shadow-sm">
        <RechartsResponsiveContainer width="100%" height={220}>
          <LineChart data={data} margin={{ top: 20, right: 30, left: 10, bottom: 20 }}>
            <CartesianGrid strokeDasharray="4 4" stroke="#e5e7eb" />
            <XAxis dataKey="idx" tickFormatter={i => `#${i}`} label={{ value: 'Source', position: 'insideBottom', offset: -10, style: { fill: '#888', fontSize: 12 } }} tick={{ fontSize: 12, fill: '#666' }} />
            <YAxis domain={[0, 100]} tickCount={6} label={{ value: 'Confidence (%)', angle: -90, position: 'insideLeft', offset: 0, style: { fill: '#888', fontSize: 12 } }} tick={{ fontSize: 12, fill: '#666' }} />
            <RechartsTooltip formatter={(value: number) => `${value.toFixed(1)}%`} labelFormatter={(label) => data[label - 1]?.name || ''} contentStyle={{ fontSize: '14px', borderRadius: '8px' }} />
            <Line type="monotone" dataKey="confidence" stroke="hsl(var(--primary))" strokeWidth={3} dot={{ r: 6, fill: 'hsl(var(--primary))', stroke: '#fff', strokeWidth: 2 }} activeDot={{ r: 8, stroke: 'hsl(var(--primary))', strokeWidth: 3, fill: '#fff' }} />
          </LineChart>
        </RechartsResponsiveContainer>
      </div>
    </div>
  );
};

// Add this style block for card-popup if not using Tailwind for custom values
const cardPopupStyle = {
  width: '96%',
  height: '96%',
  background: 'hsl(var(--background))',
  borderRadius: '24px',
  boxShadow: '0 4px 32px rgba(0,0,0,0.12)',
  overflow: 'hidden',
  border: '1px solid hsl(var(--border))',
  display: 'flex',
  flexDirection: 'column' as const,
};

const Popup = () => {
  const [isEnabled, setIsEnabled] = useState(true);
  const [pageInfo, setPageInfo] = useState<PageInfo | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [claim, setClaim] = useState('');
  const [isVerifying, setIsVerifying] = useState(false);
  const [verificationResult, setVerificationResult] = useState<VerificationResult | null>(null);
  const [error, setError] = useState('');
  const [theme, setTheme] = useState('system');
  // REMOVE: const dragRef = useDraggable('.popup-header');

  useEffect(() => {
    chrome.storage.sync.get(['enabled', 'theme'], (result) => {
      setIsEnabled(result.enabled ?? true);
      setTheme(result.theme ?? 'system');
    });
    getCurrentPageInfo();
  }, []);

  // Automatic theme detection and switching
  useEffect(() => {
    if (theme === 'dark') {
      document.documentElement.classList.add('dark');
    } else if (theme === 'light') {
      document.documentElement.classList.remove('dark');
    } else {
      // System preference
      if (window.matchMedia('(prefers-color-scheme: dark)').matches) {
        document.documentElement.classList.add('dark');
      } else {
        document.documentElement.classList.remove('dark');
      }
    }
  }, [theme]);

  const getCurrentPageInfo = async () => {
    try {
      const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });
      if (tab.id && tab.url && tab.url.startsWith('http')) {
        try {
        const response = await chrome.tabs.sendMessage(tab.id, { action: 'getPageInfo' });
        setPageInfo(response);
        } catch {
          setPageInfo({
            title: tab.title || 'Page Not Available',
            url: tab.url || 'chrome://extension',
            textLength: 0
          });
        }
      } else {
        setPageInfo({
          title: tab.title || 'Extension Page',
          url: tab.url || 'chrome://extension',
          textLength: 0
        });
      }
    } catch {
      try {
        const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });
        setPageInfo({
          title: tab.title || 'Page Not Available',
          url: tab.url || 'chrome://extension',
          textLength: 0
        });
      } catch {
        setPageInfo({
          title: 'Page Not Available',
          url: 'chrome://extension',
          textLength: 0
        });
      }
    }
  };

  const handleToggleEnabled = (enabled: boolean) => {
    setIsEnabled(enabled);
    chrome.storage.sync.set({ enabled });
  };

  const handleHighlightText = async () => {
    setIsLoading(true);
    try {
      const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });
      if (tab.id && tab.url && tab.url.startsWith('http')) {
        try {
        await chrome.tabs.sendMessage(tab.id, { action: 'highlightText' });
        } catch {
          console.log('Content script not available for highlighting');
        }
      } else {
        console.log('Cannot highlight text on this page type');
      }
    } catch (error) {
      console.error('Error highlighting text:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const openOptions = () => {
    chrome.runtime.openOptionsPage();
  };

  // Opens the popup in a standalone window
  const openStandaloneWindow = () => {
    chrome.windows.create({
      url: chrome.runtime.getURL('http://localhost:8080'),
      type: 'popup',
      width: 420,
      height: 640,
      top: 100,
      left: 100
    });
  };

  const getVerdictIcon = (verdict: string) => {
    switch (verdict) {
      case 'True':
        return <CheckCircle className="h-5 w-5 text-green-500" />;
      case 'False':
        return <XCircle className="h-5 w-5 text-red-500" />;
      case 'Partial':
        return <AlertTriangle className="h-5 w-5 text-yellow-500" />;
      case 'Uncertain':
        return <Info className="h-5 w-5 text-blue-500" />;
      default:
        return <Info className="h-5 w-5 text-gray-500" />;
    }
  };

  const getVerdictColor = (verdict: string) => {
    switch (verdict) {
      case 'True':
        return 'bg-green-50 border-green-200 text-green-800 dark:bg-green-900/20 dark:border-green-800 dark:text-green-400';
      case 'False':
        return 'bg-red-50 border-red-200 text-red-800 dark:bg-red-900/20 dark:border-red-800 dark:text-red-400';
      case 'Partial':
        return 'bg-yellow-50 border-yellow-200 text-yellow-800 dark:bg-yellow-900/20 dark:border-yellow-800 dark:text-yellow-400';
      case 'Uncertain':
        return 'bg-blue-50 border-blue-200 text-blue-800 dark:bg-blue-900/20 dark:border-blue-800 dark:text-blue-400';
      default:
        return 'bg-gray-50 border-gray-200 text-gray-800 dark:bg-gray-900/20 dark:border-gray-800 dark:text-gray-400';
    }
  };

  const getDomainFromUrl = (url: string): string => {
    try {
      const domain = new URL(url).hostname.replace('www.', '');
      return domain;
    } catch {
      return url.replace('www.', '').split('/')[0];
    }
  };

  const getFaviconUrl = (url: string): string => {
    try {
      const domain = new URL(url).hostname;
      return `https://www.google.com/s2/favicons?domain=${domain}&sz=32`;
    } catch {
      return '';
    }
  };

  const handleThemeChange = (newTheme: string) => {
    setTheme(newTheme);
    chrome.storage.sync.set({ theme: newTheme });
  };

  // Function to check if the backend server is running
  const checkServerStatus = async (): Promise<boolean> => {
    try {
      const response = await fetch('http://localhost:5000/health', {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        },
      });
      return response.ok;
    } catch (error) {
      console.log('Server status check failed:', error);
      return false;
    }
  };

  // Enhanced verification with server status check
  const verifyClaim = async () => {
    if (!claim.trim()) return;

    setIsVerifying(true);
    setError('');
    setVerificationResult(null);

    try {
      console.log('Starting verification for claim:', claim.trim());
      
      // First check if server is available
      const serverAvailable = await checkServerStatus();
      if (!serverAvailable) {
        throw new Error('Server not available: Backend server is not running or not accessible');
      }
      
      // Create a timeout promise
      const timeoutPromise = new Promise<never>((_, reject) => {
        setTimeout(() => reject(new Error('Request timeout - server took too long to respond')), 30000);
      });

      // Create the fetch promise
      const fetchPromise = fetch('http://localhost:5000/api/claims/verify', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ claim: claim.trim() }),
      });

      // Race between fetch and timeout
      const response = await Promise.race([fetchPromise, timeoutPromise]) as Response;

      console.log('Response received:', response.status, response.statusText);

      if (!response.ok) {
        const errorText = await response.text();
        console.error('Server error response:', errorText);
        throw new Error(`Server error: ${response.status} ${response.statusText}`);
      }

      const result = await response.json();
      console.log('Verification result:', result);
      
      setVerificationResult(result);

      // Play notification sound
      try {
        const audio = new Audio(chrome.runtime.getURL('notification.mp3'));
        audio.volume = 0.5;
        await audio.play();
      } catch (audioError) {
        console.log('Notification sound not available:', audioError);
      }
    } catch (error) {
      console.error('Verification error details:', error);
      
      let errorMessage = 'Failed to verify claim. Please try again.';
      
      if (error instanceof TypeError) {
        if (error.message.includes('fetch')) {
          errorMessage = 'Cannot connect to verification service. Please ensure the backend server is running on localhost:5000';
        } else if (error.message.includes('Failed to fetch')) {
          errorMessage = 'Network error: Unable to reach the verification server. Please check your internet connection and ensure the server is running.';
        }
      } else if (error instanceof Error) {
        if (error.message.includes('Server not available')) {
          errorMessage = 'Backend server is not running. Please start the server on localhost:5000 and try again.';
        } else if (error.message.includes('timeout')) {
          errorMessage = 'Request timeout: The server took too long to respond. Please try again.';
        } else if (error.message.includes('Server error:')) {
          errorMessage = error.message;
        } else if (error.message.includes('CORS')) {
          errorMessage = 'CORS error: The server is not allowing requests from the extension. Please check server configuration.';
        }
      }
      
      setError(errorMessage);
    } finally {
      setIsVerifying(false);
    }
  };

  return (
    <div
      // REMOVE: ref={dragRef}
      className="fixed left-1/2 top-1/2 z-50 shadow-xl bg-background flex flex-col h-full w-full rounded-2xl border border-border"
      style={{
        ...cardPopupStyle,
        transform: 'translate(-50%, -50%)',
        maxWidth: '100vw',
        maxHeight: '100vh',
        width: 'min(420px,96vw)',
        height: 'min(640px,96vh)',
        boxSizing: 'border-box',
      }}
    >
      {/* Header */}
      <div className="popup-header bg-gradient-to-r from-primary to-secondary text-primary-foreground p-4 rounded-t-xl shadow flex items-center justify-between">
        <div className="flex items-center gap-2">
          <div className="p-1 bg-white/20 rounded">
            <Zap className="h-5 w-5" />
          </div>
          <span className="font-bold text-lg tracking-wide">VeriNews</span>
          <div className="flex items-center gap-1 ml-2">
            <div className={`w-2 h-2 rounded-full ${isEnabled ? 'bg-green-400' : 'bg-red-400'}`}></div>
            <span className="text-xs opacity-90">{isEnabled ? 'Active' : 'Inactive'}</span>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="flex-1 overflow-y-auto p-4 space-y-5">
        {/* Status Toggle */}
        <div className="flex items-center justify-between p-4 bg-surface border border-border rounded-xl shadow-sm">
          <div>
            <div className="text-base font-semibold text-primary-text">Extension Status</div>
            <div className="text-xs text-muted-text">
              {isEnabled ? 'Ready to verify claims' : 'Extension disabled'}
            </div>
          </div>
          <button
            onClick={() => handleToggleEnabled(!isEnabled)}
            className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
              isEnabled ? 'bg-primary' : 'bg-muted'
            }`}
            aria-label="Toggle extension status"
          >
            <span
              className={`inline-block h-4 w-4 transform rounded-full bg-primary-foreground transition-transform ${
                isEnabled ? 'translate-x-6' : 'translate-x-1'
              }`}
            />
          </button>
        </div>

        {/* Verification Section */}
        <div className="bg-card border border-border rounded-xl p-5 shadow-sm">
          <div className="flex items-center gap-2 mb-4">
            <Send className="h-5 w-5 text-primary" />
            <h3 className="font-bold text-lg text-primary-text">Claim Verification</h3>
          </div>
          <div className="space-y-3">
            <div className="relative">
              <input
                type="text"
                placeholder="Enter a claim to verify..."
                value={claim}
                onChange={(e) => setClaim(e.target.value)}
                className="w-full px-4 py-2 border border-border rounded-lg bg-input text-primary-text placeholder-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring focus:border-transparent text-base"
                disabled={isVerifying}
                aria-label="Claim input"
              />
              {claim.trim() && (
                <button
                  onClick={() => setClaim('')}
                  className="absolute right-2 top-1/2 transform -translate-y-1/2 text-muted-foreground hover:text-primary transition-colors"
                  aria-label="Clear claim input"
                >
                  <X className="h-5 w-5" />
                </button>
              )}
            </div>
            <button
              onClick={verifyClaim}
              disabled={!claim.trim() || isVerifying}
              className="w-full bg-primary hover:bg-primary/90 disabled:bg-muted text-primary-foreground font-semibold py-2 px-4 rounded-lg transition-colors disabled:cursor-not-allowed flex items-center justify-center gap-2 text-base"
              aria-label="Verify claim"
            >
              {isVerifying ? (
                <>
                  <Loader2 className="h-5 w-5 animate-spin" />
                  Verifying...
                </>
              ) : (
                <>
                  <Send className="h-5 w-5" />
                  Verify Claim
                </>
              )}
            </button>
          </div>
          {error && (
            <div className="mt-3 p-3 bg-destructive/10 border border-destructive/20 rounded-lg flex items-center gap-2">
              <AlertTriangle className="h-5 w-5 text-destructive" />
              <span className="text-base text-destructive">{error}</span>
            </div>
          )}
          {verificationResult && (
            <div className="mt-6 space-y-6">
              {/* Verdict Card */}
              <div className={`p-6 rounded-2xl border-2 shadow-sm flex flex-col gap-4 ${getVerdictColor(verificationResult.verdict)}`}> 
                <div className="flex flex-col sm:flex-row sm:items-center gap-4 mb-2">
                  {getVerdictIcon(verificationResult.verdict)}
                  <div className="flex-1 min-w-0">
                    <div className="font-bold text-2xl mb-1">{verificationResult.verdict}</div>
                    <div className="text-base opacity-80 mb-1">Confidence: {verificationResult.confidence.toFixed(1)}%</div>
                    <div className="flex flex-wrap gap-2 text-xs text-muted-text">
                      {/* Claim ID removed */}
                      {verificationResult.status && (
                        <span>Status: {verificationResult.status}</span>
                      )}
                      {verificationResult.category && (
                        <span>Category: {verificationResult.category}</span>
                      )}
                    </div>
                  </div>
                </div>
                <div className="text-base mb-2 leading-relaxed">{verificationResult.conclusion}</div>
                {verificationResult.explanation && (
                  <div className="text-sm text-muted-text mb-2 leading-snug">{verificationResult.explanation}</div>
                )}
                {/* Timings Donut Chart - now in toggle below */}
              </div>
              {/* Timing Info Toggle */}
              {verificationResult.timings && (
                <TimingToggle timings={verificationResult.timings} />
              )}
              {/* Sources */}
              {verificationResult.sources && verificationResult.sources.length > 0 && (
                <>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 bg-accent/10 border border-border/20 rounded-2xl p-4 max-h-96 overflow-y-auto mt-2 backdrop-blur-sm bg-white/70">
                  <div className="col-span-full font-semibold mb-2 text-accent-foreground flex items-center gap-2 text-base"><Globe className="h-4 w-4" />Sources ({verificationResult.sources.length})</div>
                  {verificationResult.sources.map((source, idx) => (
                    <div key={idx} className="group p-4 rounded-xl border border-border/20 bg-card/70 flex flex-col gap-2 shadow-sm transition-all hover:shadow-lg focus-within:shadow-lg backdrop-blur-sm">
                      <div className="flex items-center gap-2 mb-1 flex-wrap">
                        <img src={getFaviconUrl(source.url)} alt="" className="w-5 h-5 rounded shadow" />
                        <a
                          href={source.url}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="font-semibold text-primary-text underline hover:text-primary focus:outline-none focus:ring-2 focus:ring-primary truncate max-w-[160px] transition-colors"
                          aria-label={`Open source: ${source.title || source.source}`}
                          tabIndex={0}
                        >
                          {source.title || source.source}
                        </a>
                        <span className="text-xs text-muted-text truncate max-w-[100px]">{getDomainFromUrl(source.url)}</span>
                        <span className={`px-2 py-1 rounded text-xs font-medium whitespace-nowrap transition-colors ${
                          source.support === 'Support' ? 'bg-success text-green-800' :
                          source.support === 'Contradict' ? 'bg-destructive/20 text-destructive' :
                          'bg-muted text-muted-foreground'
                        }`}>
                          {source.support}
                        </span>
                        {source.confidence !== undefined && (
                          <span className="text-xs ml-2 font-semibold text-primary-text">{source.confidence.toFixed(1)}%</span>
                        )}
                      </div>
                      {source.snippet && (
                        <div className="text-xs text-muted-text mt-1">{source.snippet}</div>
                      )}
                      {source.reason && (
                        <div className="text-xs text-muted-text mt-1">Reason: {source.reason}</div>
                      )}
                      {source.content && (
                        <details className="mt-1">
                          <summary className="text-xs text-primary cursor-pointer">View Full Content</summary>
                          <div className="text-xs text-muted-text mt-1">{source.content}</div>
                        </details>
                      )}
                    </div>
                  ))}
                </div>
                {/* Confidence Line Chart */}
                <ConfidenceLineChart sources={verificationResult.sources.map(s => ({ title: s.title || s.source, url: s.url, confidence: s.confidence }))} />
                </>
              )}
            </div>
          )}
        </div>

        {/* Actions & Theme Selector */}
        <div className="bg-card border border-border rounded-xl p-4 shadow-sm">
          <div className="flex items-center gap-2 mb-3">
            <Settings className="h-5 w-5 text-primary" />
            <h3 className="font-semibold text-primary-text">Actions</h3>
          </div>
          <div className="space-y-2">
            <button
              onClick={handleHighlightText}
              disabled={!isEnabled || isLoading}
              className="w-full bg-muted hover:bg-muted/80 text-primary-text font-medium py-2 px-4 rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
              aria-label="Highlight text"
            >
              {isLoading ? (
                <>
                  <Loader2 className="h-5 w-5 animate-spin" />
                  Highlighting...
                </>
              ) : (
                <>
                  <Zap className="h-5 w-5" />
                  Highlight Text
                </>
              )}
            </button>
            <button
              onClick={openOptions}
              className="w-full bg-muted hover:bg-muted/80 text-primary-text font-medium py-2 px-4 rounded-lg transition-colors flex items-center justify-center gap-2"
              aria-label="Open settings"
            >
              <Settings className="h-5 w-5" />
              Settings
            </button>
              <button
                onClick={openStandaloneWindow}
                className="w-full bg-muted hover:bg-muted/80 text-primary-text font-medium py-2 px-4 rounded-lg transition-colors flex items-center justify-center gap-2 mt-2"
                aria-label="Open in Standalone Window"
              >
                <Globe className="h-5 w-5" />
                Open in Standalone Window
              </button>
          </div>
          {/* Theme Selector */}
          <div className="mt-4 pt-4 border-t border-border">
            <div className="flex items-center gap-2 mb-2">
              <span className="text-sm font-medium text-primary-text">Theme</span>
            </div>
            <div className="flex gap-2">
              {['light', 'dark', 'system'].map((t) => (
                <button
                  key={t}
                  onClick={() => handleThemeChange(t)}
                  className={`flex items-center gap-1 py-1.5 px-3 rounded-lg text-xs font-medium transition-colors border border-border
                    ${theme === t
                      ? 'bg-primary text-primary-foreground shadow'
                      : 'bg-muted text-primary-text hover:bg-muted/80'
                    }`}
                  aria-label={`Switch to ${t} theme`}
                >
                  {t === 'light' ? ' ☀️ ' : t === 'dark' ? ' 🌙 ' : ' 🖥️ '}
                  {t.charAt(0).toUpperCase() + t.slice(1)}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Page Info */}
        {pageInfo && (
          <div className="bg-card border border-border rounded-xl p-4 shadow-sm">
            <div className="flex items-center gap-2 mb-3">
              <Info className="h-5 w-5 text-primary" />
              <h3 className="font-semibold text-primary-text">Current Page</h3>
            </div>
            <div className="space-y-2">
              <div className="flex items-center gap-2">
                <img 
                  src={getFaviconUrl(pageInfo.url)} 
                  alt=""
                  className="w-4 h-4 rounded" />
                <div className="flex-1 min-w-0">
                  <div className="text-sm font-medium truncate text-primary-text">{pageInfo.title}</div>
                  <div className="text-xs text-muted-text truncate">{getDomainFromUrl(pageInfo.url)}</div>
                </div>
              </div>
            </div>
          </div>
        )}
        </div>
    </div>
  );
};

export default Popup;

