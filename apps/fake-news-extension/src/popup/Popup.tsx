import React, { useState, useEffect } from 'react';
import { 
  Shield, 
  CheckCircle2, 
  XCircle, 
  AlertTriangle, 
  Info, 
  Search, 
  Settings, 
  Globe, 
  Loader2, 
  X,
  Clock,
  TrendingUp,
  Zap,
  Link,
  ChevronRight,
  Sun,
  Moon,
  Monitor,
  Sparkles,
  Target,
  Users,
  Cpu,
  Network,
  ArrowRight,
  Copy,
  ExternalLink,
  Star,
  AlertCircle
} from 'lucide-react';
import { Card, CardHeader, CardTitle, CardContent } from '../components/ui/card';
import { Button } from '../components/ui/button';
import { Input } from '../components/ui/input';
import { Badge } from '../components/ui/badge';
import { Separator } from '../components/ui/separator';
import { Progress } from '../components/ui/progress';
import { Switch } from '../components/ui/switch';
import { config } from '../utils/config';

interface PageInfo {
  title: string;
  url: string;
  textLength: number;
}

interface Source {
  authoritative: boolean;
  confidence: number;
  content: string;
  date: string;
  reason: string;
  relevant: boolean;
  snippet: string;
  source: string;
  title: string;
  url: string;
}

interface VerificationResult {
  category: string;
  claim_id: string;
  conclusion: string;
  confidence: number;
  verdict: 'True' | 'False' | 'Partial' | 'Uncertain' | 'Unknown';
  explanation?: string;
  sources?: Source[];
  status: string;
  timings?: {
    analysis: number;
    database: number;
    scraping: number;
  };
}

interface Timings {
  analysis?: number;
  database?: number;
  scraping?: number;
}

type TabType = 'verify' | 'results' | 'settings';

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
        } else if (callback) {
          callback(response);
        }
      });
    });
  } catch (error) {
    console.log('Error sending message to content script:', error);
  }
}

const VerdictBadge = ({ verdict, confidence }: { verdict: string; confidence: number }) => {
  const getVerdictConfig = (verdict: string) => {
    switch (verdict) {
      case 'True':
        return { 
          icon: CheckCircle2, 
          className: 'bg-emerald-50 text-emerald-700 border-emerald-200 dark:bg-emerald-950 dark:text-emerald-300 dark:border-emerald-800',
          color: 'emerald',
          bgGradient: 'from-emerald-500/20 to-green-500/20'
        };
      case 'False':
        return { 
          icon: XCircle, 
          className: 'bg-red-50 text-red-700 border-red-200 dark:bg-red-950 dark:text-red-300 dark:border-red-800',
          color: 'red',
          bgGradient: 'from-red-500/20 to-pink-500/20'
        };
      case 'Partial':
        return { 
          icon: AlertTriangle, 
          className: 'bg-amber-50 text-amber-700 border-amber-200 dark:bg-amber-950 dark:text-amber-300 dark:border-amber-800',
          color: 'amber',
          bgGradient: 'from-amber-500/20 to-orange-500/20'
        };
      case 'Uncertain':
        return { 
          icon: Info, 
          className: 'bg-blue-50 text-blue-700 border-blue-200 dark:bg-blue-950 dark:text-blue-300 dark:border-blue-800',
          color: 'blue',
          bgGradient: 'from-blue-500/20 to-indigo-500/20'
        };
      default:
        return { 
          icon: Info, 
          className: 'bg-muted text-muted-foreground border-border',
          color: 'gray',
          bgGradient: 'from-gray-500/20 to-slate-500/20'
        };
    }
  };

  const config = getVerdictConfig(verdict);
  const Icon = config.icon;

  return (
    <div className={`flex flex-col gap-4 p-6 rounded-xl bg-gradient-to-br ${config.bgGradient} border border-border/50 shadow-lg hover:shadow-xl transition-all duration-300 group`}>
      <div className="flex items-center gap-3">
        <Badge 
          variant="outline" 
          className={`${config.className} px-4 py-2 text-sm font-medium group-hover:scale-105 transition-transform`}
        >
          <Icon className="w-4 h-4 mr-2" />
          {verdict}
        </Badge>
        <div className="ml-auto">
          <Star className="w-5 h-5 text-yellow-500" />
        </div>
      </div>
      <div className="space-y-3">
      <div className="flex items-center gap-3">
          <span className="text-sm font-medium text-muted-foreground">Confidence Score</span>
          <span className="text-lg font-bold text-foreground">{confidence}%</span>
        </div>
        <Progress value={confidence} className="w-full h-3" />
        <div className="flex items-center justify-between text-xs text-muted-foreground">
          <span>Low</span>
          <span>Medium</span>
          <span>High</span>
        </div>
      </div>
    </div>
  );
};

const SourceCard = ({ source }: { source: Source }) => {
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
      return `https://www.google.com/s2/favicons?domain=${domain}&sz=16`;
    } catch {
      return '';
    }
  };

  const getConfidenceColor = (confidence: number) => {
    if (confidence >= 80) return 'text-emerald-600';
    if (confidence >= 60) return 'text-amber-600';
    return 'text-red-600';
  };

  return (
    <Card className="rounded-xl overflow-hidden hover:shadow-lg transition-all duration-300 group border-border/50 hover:border-primary/30">
      <CardContent className="p-4">
        <div className="flex items-start gap-3">
          <img 
            src={getFaviconUrl(source.url)} 
            alt="" 
            className="w-5 h-5 mt-1 flex-shrink-0 rounded group-hover:scale-110 transition-transform"
            onError={(e) => {
              e.currentTarget.style.display = 'none';
            }}
          />
          <div className="flex-1 min-w-0">
            <h4 className="font-semibold text-sm line-clamp-2 mb-2 group-hover:text-primary transition-colors">{source.title}</h4>
            <p className="text-xs text-muted-foreground mb-3 line-clamp-2 leading-relaxed">{source.snippet}</p>
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <span className="text-xs text-muted-foreground font-medium">{getDomainFromUrl(source.url)}</span>
                {source.authoritative && (
                  <Badge variant="outline" className="text-xs bg-blue-50 text-blue-700 border-blue-200">
                    Verified
                  </Badge>
                )}
              </div>
              <div className="flex items-center gap-2">
                <Progress value={source.confidence} className="w-16 h-2" />
                <span className={`text-xs font-bold ${getConfidenceColor(source.confidence)}`}>
                  {source.confidence}%
                </span>
              </div>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

const PerformanceMetrics = ({ timings }: { timings: Timings }) => {
  const total = (timings?.analysis || 0) + (timings?.database || 0) + (timings?.scraping || 0);
  
  const metrics = [
    { label: 'AI Analysis', value: timings?.analysis || 0, color: 'bg-blue-500', icon: Cpu },
    { label: 'Database', value: timings?.database || 0, color: 'bg-green-500', icon: Target },
    { label: 'Web Scraping', value: timings?.scraping || 0, color: 'bg-purple-500', icon: Network },
  ];

  return (
    <Card className="rounded-xl border-border/50">
      <CardHeader className="pb-3">
        <CardTitle className="text-sm font-semibold flex items-center gap-2">
          <Clock className="w-4 h-4 text-primary" />
          Performance Metrics
        </CardTitle>
      </CardHeader>
      <CardContent className="pt-0">
        <div className="space-y-4">
          {metrics.map((metric) => {
            const Icon = metric.icon;
            return (
              <div key={metric.label} className="flex items-center justify-between p-2 rounded-lg hover:bg-muted/50 transition-colors">
                <div className="flex items-center gap-3">
                  <div className={`w-3 h-3 rounded-full ${metric.color}`} />
                  <Icon className="w-4 h-4 text-muted-foreground" />
                <span className="text-sm text-muted-foreground">{metric.label}</span>
                </div>
                <span className="text-sm font-semibold">{metric.value.toFixed(2)}s</span>
              </div>
            );
          })}
          <Separator />
          <div className="flex items-center justify-between font-semibold p-2 rounded-lg bg-primary/5">
            <span className="text-sm">Total Processing Time</span>
            <span className="text-sm text-primary">{total.toFixed(2)}s</span>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

const Popup = () => {
  const [isEnabled, setIsEnabled] = useState(true);
  const [pageInfo, setPageInfo] = useState<PageInfo | null>(null);
  const [claim, setClaim] = useState('');
  const [isVerifying, setIsVerifying] = useState(false);
  const [verificationResult, setVerificationResult] = useState<VerificationResult | null>(null);
  const [error, setError] = useState('');
  const [theme, setTheme] = useState('system');
  const [activeTab, setActiveTab] = useState<TabType>('verify');
  const [animateContent, setAnimateContent] = useState(false);

  useEffect(() => {
    chrome.storage.sync.get(['enabled', 'theme'], (result) => {
      setIsEnabled(result.enabled ?? true);
      setTheme(result.theme ?? 'system');
    });
    getCurrentPageInfo();
    
    // Trigger animation after component mounts
    const timer = setTimeout(() => setAnimateContent(true), 100);
    return () => clearTimeout(timer);
  }, []);

  useEffect(() => {
    if (theme === 'dark') {
      document.documentElement.classList.add('dark');
    } else if (theme === 'light') {
      document.documentElement.classList.remove('dark');
    } else {
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
      setPageInfo({
        title: 'Page Not Available',
        url: 'chrome://extension',
        textLength: 0
      });
    }
  };

  const handleToggleEnabled = (enabled: boolean) => {
    setIsEnabled(enabled);
    chrome.storage.sync.set({ enabled });
  };

  const handleThemeChange = (newTheme: string) => {
    setTheme(newTheme);
    chrome.storage.sync.set({ theme: newTheme });
  };

  const checkServerStatus = async (): Promise<boolean> => {
    try {
      const response = await fetch(`${config.apiBaseUrl}/health`, {
        method: 'GET',
        headers: { 'Content-Type': 'application/json' },
      });
      return response.ok;
    } catch (error) {
      console.log('Server status check failed:', error);
      return false;
    }
  };

  const verifyClaim = async () => {
    if (!claim.trim()) return;

    setIsVerifying(true);
    setError('');
    setVerificationResult(null);

    try {
      const serverAvailable = await checkServerStatus();
      if (!serverAvailable) {
        throw new Error('Backend server is not running or not accessible');
      }
      
      const timeoutPromise = new Promise<never>((_, reject) => {
        setTimeout(() => reject(new Error('Request timeout - server took too long to respond')), 30000);
      });

      const fetchPromise = fetch(`${config.apiBaseUrl}/api/claims/verify`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ claim: claim.trim() }),
      });

      const response = await Promise.race([fetchPromise, timeoutPromise]) as Response;

      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(`Server error: ${response.status} ${response.statusText}`);
      }

      const result = await response.json();
      setVerificationResult(result);
      setActiveTab('results');

      // Play success sound
      try {
        const AudioContextClass = window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
        const audioContext = new AudioContextClass();
        
        if (audioContext.state === 'suspended') {
          await audioContext.resume();
        }
        
        const oscillator = audioContext.createOscillator();
        const gainNode = audioContext.createGain();
        
        oscillator.connect(gainNode);
        gainNode.connect(audioContext.destination);
        
        oscillator.frequency.setValueAtTime(784, audioContext.currentTime);
        oscillator.frequency.setValueAtTime(659, audioContext.currentTime + 0.1);
        oscillator.frequency.setValueAtTime(784, audioContext.currentTime + 0.2);
        
        gainNode.gain.setValueAtTime(0, audioContext.currentTime);
        gainNode.gain.linearRampToValueAtTime(0.1, audioContext.currentTime + 0.01);
        gainNode.gain.exponentialRampToValueAtTime(0.001, audioContext.currentTime + 0.3);
        
        oscillator.start(audioContext.currentTime);
        oscillator.stop(audioContext.currentTime + 0.3);
      } catch (error) {
        console.log('Could not play notification sound:', error);
      }

    } catch (error: unknown) {
      console.error('Verification error:', error);
      const errorMessage = error instanceof Error ? error.message : 'An unexpected error occurred';
      setError(errorMessage);
    } finally {
      setIsVerifying(false);
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

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    // You could add a toast notification here
  };

  return (
    <div className="w-full h-full flex flex-col overflow-hidden">
      {/* Header */}
      <div className="bg-gradient-to-r from-primary via-primary/90 to-secondary/80 px-5 py-4 relative overflow-hidden">
        <div className="absolute inset-0 bg-grid-slate-100/10 [mask-image:linear-gradient(0deg,white,rgba(255,255,255,0.6))]"></div>
        <div className="relative">
        <div className="flex items-center justify-between mb-3">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-white/20 rounded-lg">
                <Shield className="w-5 h-5 text-white" />
              </div>
              <div>
            <h1 className="text-lg font-bold text-white">VeriNews</h1>
                <p className="text-xs text-white/80">AI Fact Checker</p>
              </div>
          </div>
          <button
            onClick={() => setActiveTab('settings')}
              className="text-white hover:bg-white/10 rounded-full p-2 transition-all duration-200 hover:scale-110"
          >
            <Settings className="w-5 h-5" />
          </button>
        </div>
        
        {pageInfo && (
          <div className="flex items-center gap-2 text-sm text-white/90">
            <Globe className="w-4 h-4" />
              <span className="truncate font-medium">{getDomainFromUrl(pageInfo.url)}</span>
              <Badge variant="secondary" className="ml-auto bg-white/20 text-white border-white/30">
              {pageInfo.textLength > 0 ? `${Math.round(pageInfo.textLength/1000)}k chars` : 'No text'}
            </Badge>
          </div>
        )}
        </div>
      </div>
      
      {/* Tabs */}
      <div className="flex border-b bg-muted/30">
        {[
          { id: 'verify', label: 'Verify', icon: Search },
          { id: 'results', label: 'Results', icon: TrendingUp },
          { id: 'settings', label: 'Settings', icon: Settings }
        ].map(({ id, label, icon: Icon }) => (
          <button
            key={id}
            onClick={() => setActiveTab(id as TabType)}
            className={`flex-1 flex items-center justify-center gap-2 py-3 px-4 text-sm font-medium transition-all duration-200 ${
              activeTab === id 
                ? 'text-primary bg-background border-b-2 border-primary shadow-sm' 
                : 'text-muted-foreground hover:text-foreground hover:bg-muted/50'
            }`}
          >
            <Icon className="w-4 h-4" />
            {label}
          </button>
        ))}
      </div>
      
      {/* Tab Content */}
      <div className="flex-1 overflow-y-auto">
        {activeTab === 'verify' && (
          <div className={`p-5 space-y-5 transition-all duration-500 ${animateContent ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4'}`}>
            <div className="space-y-4">
              <div className="flex items-center gap-2">
                <div className="p-2 bg-primary/10 rounded-lg">
                  <Search className="w-5 h-5 text-primary" />
                </div>
              <h2 className="font-bold text-lg">Verify Claim</h2>
              </div>
              <div className="relative">
                <textarea
                  value={claim}
                  onChange={(e) => setClaim(e.target.value)}
                  placeholder="e.g., The COVID-19 vaccine reduces transmission by 90%"
                  className="w-full min-h-[120px] p-4 rounded-xl border border-input bg-card text-sm focus:ring-2 focus:ring-primary focus:border-transparent resize-none transition-all duration-200 hover:border-primary/50"
                  onKeyDown={(e) => {
                    if (e.key === 'Enter' && e.ctrlKey && !isVerifying) {
                      verifyClaim();
                    }
                  }}
                />
                <div className="flex items-center justify-between mt-2 text-xs text-muted-foreground">
                  <span>{claim.length}/500 characters</span>
                  <span className="flex items-center gap-1">
                    <Zap className="w-3 h-3" />
                    Ctrl+Enter to verify
                  </span>
                </div>
              </div>
            </div>

            {error && (
              <div className="p-4 rounded-xl bg-destructive/10 border border-destructive/20 flex items-center gap-3 animate-in slide-in-from-top-2">
                <AlertCircle className="w-5 h-5 text-destructive flex-shrink-0" />
                <span className="text-sm text-destructive font-medium">{error}</span>
              </div>
            )}

            <Button
              onClick={verifyClaim}
              disabled={!claim.trim() || isVerifying}
              className="w-full gap-3 py-6 rounded-xl shadow-lg hover:shadow-xl transition-all duration-300 disabled:opacity-50"
              size="lg"
            >
              {isVerifying ? (
                <>
                  <Loader2 className="w-5 h-5 animate-spin" />
                  Analyzing with AI...
                </>
              ) : (
                <>
                  <Zap className="w-5 h-5" />
                  Verify Claim
                  <ArrowRight className="w-4 h-4" />
                </>
              )}
            </Button>

            <div className="pt-4 border-t border-border/50">
              <div className="flex items-center justify-center gap-2 text-xs text-muted-foreground">
                <Sparkles className="w-3 h-3" />
                Powered by AI fact-checking and multiple trusted sources
              </div>
            </div>
          </div>
        )}

        {activeTab === 'results' && verificationResult && (
          <div className={`p-5 space-y-6 transition-all duration-500 ${animateContent ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4'}`}>
            <VerdictBadge 
              verdict={verificationResult.verdict} 
              confidence={verificationResult.confidence} 
            />
            
            <Card className="rounded-xl border-border/50 hover:shadow-lg transition-shadow">
              <CardHeader>
                <CardTitle className="text-base font-semibold flex items-center gap-2">
                  <Target className="w-4 h-4 text-primary" />
                  Analysis Summary
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-sm leading-relaxed text-foreground">{verificationResult.conclusion}</p>
                {verificationResult.explanation && (
                  <div className="mt-3 pt-3 border-t border-border/20">
                    <p className="text-xs text-muted-foreground leading-relaxed">{verificationResult.explanation}</p>
                  </div>
                )}
              </CardContent>
            </Card>

            {verificationResult.sources && verificationResult.sources.length > 0 && (
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                <h3 className="font-semibold text-sm flex items-center gap-2">
                    <Link className="w-4 h-4 text-primary" />
                  Sources ({verificationResult.sources.length})
                </h3>
                  <Badge variant="outline" className="text-xs">
                    {verificationResult.sources.filter(s => s.authoritative).length} Verified
                  </Badge>
                </div>
                <div className="grid grid-cols-1 gap-3">
                  {verificationResult.sources.slice(0, 3).map((source, index) => (
                    <SourceCard key={index} source={source} />
                  ))}
                </div>
                {verificationResult.sources.length > 3 && (
                  <p className="text-xs text-muted-foreground text-center pt-2">
                    +{verificationResult.sources.length - 3} more sources available
                  </p>
                )}
              </div>
            )}

            {verificationResult.timings && (
              <PerformanceMetrics timings={verificationResult.timings} />
            )}
          </div>
        )}

        {activeTab === 'settings' && (
          <div className={`p-5 space-y-6 transition-all duration-500 ${animateContent ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4'}`}>
            <div className="space-y-4">
              <div className="flex items-center justify-between p-4 bg-card rounded-xl border border-border/50 hover:shadow-md transition-shadow">
                <div>
                  <h3 className="font-semibold flex items-center gap-2">
                    <Shield className="w-4 h-4 text-primary" />
                    Extension Status
                  </h3>
                  <p className="text-sm text-muted-foreground">Enable/disable verification features</p>
                </div>
                <Switch 
                  checked={isEnabled}
                  onCheckedChange={handleToggleEnabled}
                />
              </div>

              <div className="space-y-4 pt-4">
                <h3 className="font-semibold flex items-center gap-2">
                  <Monitor className="w-4 h-4 text-primary" />
                  Theme Preference
                </h3>
                <div className="grid grid-cols-3 gap-3">
                  {[
                    { id: 'light', label: 'Light', icon: Sun },
                    { id: 'dark', label: 'Dark', icon: Moon },
                    { id: 'system', label: 'System', icon: Monitor }
                  ].map(({ id, label, icon: Icon }) => (
                    <button
                      key={id}
                      onClick={() => handleThemeChange(id)}
                      className={`flex flex-col items-center justify-center gap-2 p-4 rounded-xl border transition-all duration-200 hover:scale-105 ${
                        theme === id 
                          ? 'border-primary bg-primary/10 shadow-md' 
                          : 'border-border hover:bg-muted/50 hover:border-primary/30'
                      }`}
                    >
                      <Icon className="w-5 h-5" />
                      <span className="text-xs font-medium">{label}</span>
                    </button>
                  ))}
                </div>
              </div>

              <div className="pt-4 space-y-3">
                <Button
                  variant="outline"
                  className="w-full justify-start py-5 rounded-xl hover:shadow-md transition-shadow"
                  onClick={() => chrome.runtime.openOptionsPage()}
                >
                  <Settings className="w-4 h-4 mr-2" />
                  Advanced Settings
                </Button>
                
                <Button
                  variant="outline"
                  className="w-full justify-start py-5 rounded-xl hover:shadow-md transition-shadow"
                  onClick={() => window.open('http://localhost:5173/', '_blank')}
                >
                  <ExternalLink className="w-4 h-4 mr-2" />
                  Open Web App
                </Button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default Popup;