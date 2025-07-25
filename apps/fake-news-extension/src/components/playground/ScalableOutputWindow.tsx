import React, { useState, useRef, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { 
  Maximize2, 
  Minimize2, 
  Copy, 
  Download, 
  ExternalLink, 
  ChevronDown, 
  ChevronRight,
  Eye,
  Code,
  FileText,
  Settings,
  Palette,
  X
} from 'lucide-react';
import { Tooltip, TooltipContent, TooltipTrigger } from '@/components/ui/tooltip';

interface ApiResponse {
  status: number;
  data: unknown;
  headers: Record<string, string>;
  time: number;
}

interface ScalableOutputWindowProps {
  response: ApiResponse | null;
  error: string | null;
  loading: boolean;
}

type DisplayMode = 'vs-code' | 'light' | 'dark' | 'minimal' | 'json-tree';
type WindowSize = 'normal' | 'large' | 'fullscreen';

export function ScalableOutputWindow({ response, error, loading }: ScalableOutputWindowProps) {
  const [windowSize, setWindowSize] = useState<WindowSize>('normal');
  const [displayMode, setDisplayMode] = useState<DisplayMode>('vs-code');
  const [collapsedSections, setCollapsedSections] = useState<Record<string, boolean>>({});
  const [copied, setCopied] = useState(false);
  const windowRef = useRef<HTMLDivElement>(null);

  // Handle window size changes
  const toggleWindowSize = () => {
    if (windowSize === 'normal') {
      setWindowSize('large');
    } else if (windowSize === 'large') {
      setWindowSize('fullscreen');
    } else {
      setWindowSize('normal');
    }
  };

  // Handle escape key to close fullscreen
  useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && windowSize !== 'normal') {
        setWindowSize('normal');
      }
    };

    document.addEventListener('keydown', handleEscape);
    return () => document.removeEventListener('keydown', handleEscape);
  }, [windowSize]);

  // Get window size styles
  const getWindowStyles = () => {
    switch (windowSize) {
      case 'large':
        return 'fixed inset-8 z-50 bg-background border-2 border-border rounded-lg shadow-2xl';
      case 'fullscreen':
        return 'fixed inset-0 z-50 bg-background border-0 rounded-none shadow-2xl';
      default:
        return 'relative';
    }
  };

  // Get display mode styles
  const getDisplayStyles = () => {
    switch (displayMode) {
      case 'vs-code':
        return {
          container: 'bg-[#1e1e1e] text-[#d4d4d4] border-slate-700',
          lineNumbers: 'bg-[#252526] text-[#858585] border-slate-700',
          content: 'text-[#d4d4d4]',
          string: 'text-[#ce9178]',
          number: 'text-[#b5cea8]',
          boolean: 'text-[#569cd6]',
          null: 'text-[#569cd6]',
          key: 'text-[#9cdcfe]',
          bracket: 'text-[#d4d4d4]'
        };
      case 'light':
        return {
          container: 'bg-white text-slate-900 border-slate-200',
          lineNumbers: 'bg-slate-50 text-slate-500 border-slate-200',
          content: 'text-slate-900',
          string: 'text-green-600',
          number: 'text-blue-600',
          boolean: 'text-purple-600',
          null: 'text-red-600',
          key: 'text-blue-800',
          bracket: 'text-slate-600'
        };
      case 'dark':
        return {
          container: 'bg-slate-900 text-slate-100 border-slate-600',
          lineNumbers: 'bg-slate-800 text-slate-400 border-slate-600',
          content: 'text-slate-100',
          string: 'text-green-400',
          number: 'text-blue-400',
          boolean: 'text-purple-400',
          null: 'text-red-400',
          key: 'text-cyan-400',
          bracket: 'text-slate-300'
        };
      case 'json-tree':
        return {
          container: 'bg-slate-50 text-slate-800 border-slate-300',
          lineNumbers: 'bg-slate-100 text-slate-600 border-slate-300',
          content: 'text-slate-800',
          string: 'text-emerald-600',
          number: 'text-indigo-600',
          boolean: 'text-amber-600',
          null: 'text-rose-600',
          key: 'text-slate-900',
          bracket: 'text-slate-600'
        };
      case 'minimal':
        return {
          container: 'bg-transparent text-slate-700 border-slate-200',
          lineNumbers: 'bg-transparent text-slate-400 border-slate-200',
          content: 'text-slate-700',
          string: 'text-slate-600',
          number: 'text-slate-600',
          boolean: 'text-slate-600',
          null: 'text-slate-600',
          key: 'text-slate-800',
          bracket: 'text-slate-500'
        };
      default:
        return {
          container: 'bg-[#1e1e1e] text-[#d4d4d4] border-slate-700',
          lineNumbers: 'bg-[#252526] text-[#858585] border-slate-700',
          content: 'text-[#d4d4d4]',
          string: 'text-[#ce9178]',
          number: 'text-[#b5cea8]',
          boolean: 'text-[#569cd6]',
          null: 'text-[#569cd6]',
          key: 'text-[#9cdcfe]',
          bracket: 'text-[#d4d4d4]'
        };
    }
  };

  // Enhanced JSON renderer with better styling
  const renderJsonValue = (value: unknown, path: string = '', depth: number = 0): React.ReactNode => {
    const sectionId = path || 'root';
    const isCollapsed = collapsedSections[sectionId];
    const styles = getDisplayStyles();
    
    if (value === null) {
      return <span className={styles.null}>null</span>;
    }
    
    if (typeof value === 'boolean') {
      return <span className={styles.boolean}>{value.toString()}</span>;
    }
    
    if (typeof value === 'number') {
      return <span className={styles.number}>{value}</span>;
    }
    
    if (typeof value === 'string') {
      // Enhanced URL detection and rendering
      if (value.match(/^https?:\/\/.+/)) {
        return (
          <div className="inline-flex items-center gap-1">
            <span className={styles.string}>"{value}"</span>
            <Tooltip>
              <TooltipTrigger asChild>
                <a 
                  href={value} 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="text-blue-400 hover:text-blue-300 transition-colors"
                >
                  <ExternalLink className="h-3 w-3" />
                </a>
              </TooltipTrigger>
              <TooltipContent>
                <p>Open in new tab</p>
              </TooltipContent>
            </Tooltip>
          </div>
        );
      }
      
      // Enhanced date formatting
      if (value.match(/^\d{4}-\d{2}-\d{2}/) || value.match(/^\d{4}-\d{2}-\d{2}T/)) {
        const date = new Date(value);
        return (
          <Tooltip>
            <TooltipTrigger asChild>
              <span className={styles.string}>"{value}"</span>
            </TooltipTrigger>
            <TooltipContent>
              <p>{date.toLocaleString()}</p>
            </TooltipContent>
          </Tooltip>
        );
      }
      
      return <span className={styles.string}>"{value}"</span>;
    }
    
    if (Array.isArray(value)) {
      if (value.length === 0) {
        return <span className={styles.bracket}>[]</span>;
      }
      
      return (
        <div className="space-y-0">
          <div className="flex items-center">
            <button
              onClick={() => setCollapsedSections(prev => ({ ...prev, [sectionId]: !prev[sectionId] }))}
              className="mr-1 hover:bg-slate-200 dark:hover:bg-slate-700 rounded p-0.5 transition-colors"
            >
              {isCollapsed ? <ChevronRight className="h-3 w-3" /> : <ChevronDown className="h-3 w-3" />}
            </button>
            <span className={styles.bracket}>[</span>
            {isCollapsed && (
              <Badge variant="outline" className="ml-2 text-xs">
                {value.length} items
              </Badge>
            )}
          </div>
          
          {!isCollapsed && (
            <div className="ml-6 space-y-0">
              {value.map((item, index) => (
                <div key={index} className="flex items-start">
                  <span className="text-slate-500 mr-2 select-none text-xs font-mono">{index}:</span>
                  <div className="flex-1">
                    {renderJsonValue(item, `${path}[${index}]`, depth + 1)}
                  </div>
                  {index < value.length - 1 && <span className={styles.bracket}>,</span>}
                </div>
              ))}
              <span className={styles.bracket}>]</span>
            </div>
          )}
        </div>
      );
    }
    
    if (typeof value === 'object') {
      const keys = Object.keys(value as object);
      if (keys.length === 0) {
        return <span className={styles.bracket}>{'{}'}</span>;
      }
      
      return (
        <div className="space-y-0">
          <div className="flex items-center">
            <button
              onClick={() => setCollapsedSections(prev => ({ ...prev, [sectionId]: !prev[sectionId] }))}
              className="mr-1 hover:bg-slate-200 dark:hover:bg-slate-700 rounded p-0.5 transition-colors"
            >
              {isCollapsed ? <ChevronRight className="h-3 w-3" /> : <ChevronDown className="h-3 w-3" />}
            </button>
            <span className={styles.bracket}>{'{'}</span>
            {isCollapsed && (
              <Badge variant="outline" className="ml-2 text-xs">
                {keys.length} properties
              </Badge>
            )}
          </div>
          
          {!isCollapsed && (
            <div className="ml-6 space-y-0">
              {keys.map((key, index) => (
                <div key={key} className="flex items-start">
                  <span className={styles.key}>"{key}"</span>
                  <span className={styles.bracket}>: </span>
                  <div className="flex-1">
                    {renderJsonValue((value as Record<string, unknown>)[key], `${path}.${key}`, depth + 1)}
                  </div>
                  {index < keys.length - 1 && <span className={styles.bracket}>,</span>}
                </div>
              ))}
              <span className={styles.bracket}>{'}'}</span>
            </div>
          )}
        </div>
      );
    }
    
    return <span className={styles.content}>{String(value)}</span>;
  };

  // Copy response to clipboard
  const copyToClipboard = () => {
    if (response?.data) {
      navigator.clipboard.writeText(JSON.stringify(response.data, null, 2));
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  // Download response as JSON file
  const downloadResponse = () => {
    if (response?.data) {
      const blob = new Blob([JSON.stringify(response.data, null, 2)], { type: 'application/json' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `api-response-${Date.now()}.json`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
    }
  };

  // Generate line numbers
  const generateLineNumbers = (data: unknown): number => {
    if (typeof data === 'object' && data !== null) {
      const jsonString = JSON.stringify(data, null, 2);
      return jsonString.split('\n').length;
    }
    return 1;
  };

  const styles = getDisplayStyles();

  return (
    <>
      {/* Backdrop for large/fullscreen modes */}
      {windowSize !== 'normal' && (
        <div 
          className="fixed inset-0 bg-black/50 backdrop-blur-sm z-40" 
          onClick={() => setWindowSize('normal')}
        />
      )}
      
      <div className={getWindowStyles()} ref={windowRef}>
        <Card className={`${windowSize !== 'normal' ? 'h-full flex flex-col' : ''} border-0 shadow-none`}>
          <CardHeader className="pb-3 flex-shrink-0">
            <div className="flex items-center justify-between">
              <CardTitle className="flex items-center gap-2">
                <Eye className="h-5 w-5" />
                API Response
                {response && (
                  <div className="flex items-center gap-2 ml-4">
                    <Badge variant={response.status >= 200 && response.status < 300 ? "default" : "destructive"}>
                      {response.status}
                    </Badge>
                    <Badge variant="outline">{response.time}ms</Badge>
                  </div>
                )}
              </CardTitle>
              
              <div className="flex items-center gap-2">
                {/* Display Mode Selector */}
                <Select value={displayMode} onValueChange={(value: DisplayMode) => setDisplayMode(value)}>
                  <SelectTrigger className="w-32">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="vs-code">
                      <div className="flex items-center gap-2">
                        <Code className="h-3 w-3" />
                        VS Code
                      </div>
                    </SelectItem>
                    <SelectItem value="light">
                      <div className="flex items-center gap-2">
                        <Palette className="h-3 w-3" />
                        Light
                      </div>
                    </SelectItem>
                    <SelectItem value="dark">
                      <div className="flex items-center gap-2">
                        <Palette className="h-3 w-3" />
                        Dark
                      </div>
                    </SelectItem>
                    <SelectItem value="json-tree">
                      <div className="flex items-center gap-2">
                        <FileText className="h-3 w-3" />
                        JSON Tree
                      </div>
                    </SelectItem>
                    <SelectItem value="minimal">
                      <div className="flex items-center gap-2">
                        <Settings className="h-3 w-3" />
                        Minimal
                      </div>
                    </SelectItem>
                  </SelectContent>
                </Select>

                {/* Action Buttons */}
                {response && (
                  <>
                    <Tooltip>
                      <TooltipTrigger asChild>
                        <Button variant="outline" size="sm" onClick={copyToClipboard}>
                          <Copy className="h-4 w-4" />
                        </Button>
                      </TooltipTrigger>
                      <TooltipContent>
                        <p>{copied ? 'Copied!' : 'Copy to clipboard'}</p>
                      </TooltipContent>
                    </Tooltip>

                    <Tooltip>
                      <TooltipTrigger asChild>
                        <Button variant="outline" size="sm" onClick={downloadResponse}>
                          <Download className="h-4 w-4" />
                        </Button>
                      </TooltipTrigger>
                      <TooltipContent>
                        <p>Download as JSON</p>
                      </TooltipContent>
                    </Tooltip>
                  </>
                )}

                {/* Window Size Toggle */}
                <Tooltip>
                  <TooltipTrigger asChild>
                    <Button variant="outline" size="sm" onClick={toggleWindowSize}>
                      {windowSize === 'fullscreen' ? (
                        <Minimize2 className="h-4 w-4" />
                      ) : (
                        <Maximize2 className="h-4 w-4" />
                      )}
                    </Button>
                  </TooltipTrigger>
                  <TooltipContent>
                    <p>
                      {windowSize === 'normal' ? 'Expand window' : 
                       windowSize === 'large' ? 'Fullscreen' : 'Minimize window'}
                    </p>
                  </TooltipContent>
                </Tooltip>

                {/* Close button for large/fullscreen modes */}
                {windowSize !== 'normal' && (
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <Button variant="outline" size="sm" onClick={() => setWindowSize('normal')}>
                        <X className="h-4 w-4" />
                      </Button>
                    </TooltipTrigger>
                    <TooltipContent>
                      <p>Close window</p>
                    </TooltipContent>
                  </Tooltip>
                )}
              </div>
            </div>
          </CardHeader>

          <CardContent className={`p-0 ${windowSize !== 'normal' ? 'flex-1 overflow-hidden' : ''}`}>
            {loading && (
              <div className="flex items-center justify-center h-64">
                <div className="flex items-center gap-3">
                  <div className="w-6 h-6 border-2 border-primary border-t-transparent rounded-full animate-spin"></div>
                  <span className="text-muted-foreground">Executing request...</span>
                </div>
              </div>
            )}

            {error && (
              <div className="p-6">
                <div className="bg-destructive/10 border border-destructive/20 rounded-lg p-4">
                  <h4 className="font-semibold text-destructive mb-2">Request Error</h4>
                  <p className="text-destructive font-mono text-sm">{error}</p>
                </div>
              </div>
            )}

            {response && !loading && (
              <Tabs defaultValue="response" className={`w-full ${windowSize !== 'normal' ? 'h-full flex flex-col' : ''}`}>
                <div className="px-6">
                  <TabsList className="grid w-full grid-cols-2">
                    <TabsTrigger value="response">Response Data</TabsTrigger>
                    <TabsTrigger value="headers">Headers</TabsTrigger>
                  </TabsList>
                </div>
                
                <TabsContent value="response" className={`mt-4 mx-6 mb-6 ${windowSize !== 'normal' ? 'flex-1 overflow-hidden' : ''}`}>
                  <div className={`border rounded-lg overflow-hidden ${
                    windowSize === 'normal' ? 'max-h-96' : 'h-full'
                  } ${styles.container}`}>
                    <div className="flex h-full">
                      {/* Line Numbers */}
                      <div className={`text-xs font-mono px-3 py-4 select-none border-r ${styles.lineNumbers}`}>
                        {Array.from({ length: generateLineNumbers(response.data) }, (_, i) => (
                          <div key={i + 1} className="text-right leading-relaxed">
                            {i + 1}
                          </div>
                        ))}
                      </div>
                      
                      {/* JSON Content */}
                      <div className="flex-1 p-4 overflow-auto">
                        <div className="font-mono text-sm leading-relaxed">
                          {renderJsonValue(response.data)}
                        </div>
                      </div>
                    </div>
                  </div>
                </TabsContent>
                
                <TabsContent value="headers" className={`mt-4 mx-6 mb-6 ${windowSize !== 'normal' ? 'flex-1 overflow-hidden' : ''}`}>
                  <div className={`border rounded-lg overflow-hidden ${
                    windowSize === 'normal' ? 'max-h-96' : 'h-full'
                  } ${styles.container}`}>
                    <div className="flex h-full">
                      {/* Line Numbers */}
                      <div className={`text-xs font-mono px-3 py-4 select-none border-r ${styles.lineNumbers}`}>
                        {Array.from({ length: generateLineNumbers(response.headers) }, (_, i) => (
                          <div key={i + 1} className="text-right leading-relaxed">
                            {i + 1}
                          </div>
                        ))}
                      </div>
                      
                      {/* Headers Content */}
                      <div className="flex-1 p-4 overflow-auto">
                        <div className="font-mono text-sm leading-relaxed">
                          {renderJsonValue(response.headers)}
                        </div>
                      </div>
                    </div>
                  </div>
                </TabsContent>
              </Tabs>
            )}

            {!response && !loading && !error && (
              <div className="flex items-center justify-center h-64 text-muted-foreground">
                <div className="text-center">
                  <Eye className="h-12 w-12 mx-auto mb-4 opacity-50" />
                  <p>Execute a request to see the response</p>
                </div>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </>
  );
}