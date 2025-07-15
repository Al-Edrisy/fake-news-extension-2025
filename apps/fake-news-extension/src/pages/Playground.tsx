import React, { useState } from 'react';
import { Button } from '../components/ui/button';
import { Input } from '../components/ui/input';
import { Textarea } from '../components/ui/textarea';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../components/ui/tabs';
import { Badge } from '../components/ui/badge';
import { Label } from '../components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../components/ui/select';
import { Separator } from '../components/ui/separator';
import { config } from '../utils/config';
import Navbar from '../components/Navbar';
import { BookOpen, Search, Shield, Database, Activity, Globe, FileText, Zap, Plus, X, ExternalLink, ChevronDown, ChevronRight } from 'lucide-react';

interface ApiResponse {
  status: number;
  data: unknown;
  headers: Record<string, string>;
  time: number;
}

interface EndpointExample {
  name: string;
  url: string;
  method: 'GET' | 'POST';
  description: string;
  category: string;
  body?: string;
  params?: string;
}

interface Parameter {
  key: string;
  value: string;
}

interface CollapsibleState {
  [key: string]: boolean;
}

const Playground: React.FC = () => {
  const [method, setMethod] = useState<'GET' | 'POST'>('GET');
  const [url, setUrl] = useState(`${config.apiBaseUrl}/public/claims`);
  const [parameters, setParameters] = useState<Parameter[]>([
    { key: 'page', value: '1' },
    { key: 'limit', value: '10' }
  ]);
  const [body, setBody] = useState('');
  const [response, setResponse] = useState<ApiResponse | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [collapsedSections, setCollapsedSections] = useState<CollapsibleState>({});
  const [displayMode, setDisplayMode] = useState<'vs-code' | 'light' | 'dark' | 'minimal'>('vs-code');

  const endpointExamples: EndpointExample[] = [
    // Claims endpoints
    {
      name: 'Get All Claims',
      url: `${config.apiBaseUrl}/public/claims`,
      method: 'GET',
      description: 'Retrieve all claims with pagination',
      category: 'Claims',
      params: 'page=1&limit=10'
    },
    {
      name: 'Get High Confidence Claims',
      url: `${config.apiBaseUrl}/public/claims/high-confidence`,
      method: 'GET',
      description: 'Get claims with high confidence scores',
      category: 'Claims',
      params: 'page=1&limit=5'
    },
    {
      name: 'Get Claims by Category',
      url: `${config.apiBaseUrl}/public/claims/by-category/Environment`,
      method: 'GET',
      description: 'Get claims filtered by specific category',
      category: 'Claims',
      params: 'page=1&limit=10'
    },
    {
      name: 'Verify Claim',
      url: `${config.apiBaseUrl}/api/claims/verify`,
      method: 'POST',
      description: 'Verify a specific claim',
      category: 'Claims',
      body: JSON.stringify({
        claim: "COVID-19 vaccines cause infertility.",
        include_sources: true,
        detailed_analysis: true
      }, null, 2)
    },
    
    // Sources endpoints
    {
      name: 'Get All Sources',
      url: `${config.apiBaseUrl}/public/sources`,
      method: 'GET',
      description: 'Retrieve all news sources',
      category: 'Sources',
      params: 'page=1&limit=5'
    },
    {
      name: 'Get Source by Domain',
      url: `${config.apiBaseUrl}/public/sources/by-domain/example.com`,
      method: 'GET',
      description: 'Get source information by domain',
      category: 'Sources',
      params: 'page=1&limit=10'
    },
    
    // Analysis endpoints
    {
      name: 'Get All Analyses',
      url: `${config.apiBaseUrl}/public/analyses`,
      method: 'GET',
      description: 'Get all analyses with sources',
      category: 'Analysis',
      params: 'page=1&limit=5'
    },
    {
      name: 'Get Latest Analyses',
      url: `${config.apiBaseUrl}/public/analyses/latest`,
      method: 'GET',
      description: 'Get latest analyses in descending order',
      category: 'Analysis',
      params: 'limit=5&page=1'
    },
    {
      name: 'Analyze Content Directly',
      url: `${config.apiBaseUrl}/api/analysis/analyze`,
      method: 'POST',
      description: 'Send content directly to AI model for analysis',
      category: 'Analysis',
      body: JSON.stringify({
        claim: "COVID-19 vaccines cause infertility.",
        articles: [
          {
            title: "COVID-19 vaccines are safe and effective",
            date: "2024-12-01",
            source: "reuters",
            content: "Extensive studies have shown that COVID-19 vaccines do not affect fertility in men or women. Experts confirm the safety of vaccines...",
            url: "https://www.reuters.com/article/covid-vaccine-safety"
          },
          {
            title: "Concerns raised over vaccine side effects",
            date: "2023-11-15",
            source: "generic",
            content: "Some reports have alleged vaccine side effects, but no causal link to infertility has been established in scientific research...",
            url: "https://example.com/vaccine-side-effects"
          }
        ]
      }, null, 2)
    },
    
    // Search endpoints
    {
      name: 'Web Search',
      url: `${config.apiBaseUrl}/api/search/web`,
      method: 'POST',
      description: 'Search the web using Google engine',
      category: 'Search',
      body: JSON.stringify({
        query: "NASA Mars water discovery",
        max_results: 5
      }, null, 2)
    },
    
    // System endpoints
    {
      name: 'Health Check',
      url: `${config.apiBaseUrl}/health`,
      method: 'GET',
      description: 'Check server health status',
      category: 'System'
    }
  ];

  const categories = ['all', 'Claims', 'Sources', 'Analysis', 'Search', 'System'];

  const filteredExamples = selectedCategory === 'all' 
    ? endpointExamples 
    : endpointExamples.filter(example => example.category === selectedCategory);

  const handleExampleSelect = (example: EndpointExample) => {
    setMethod(example.method);
    setUrl(example.url);
    
    // Parse parameters from example
    if (example.params) {
      const params = example.params.split('&').map(param => {
        const [key, value] = param.split('=');
        return { key: key || '', value: value || '' };
      });
      setParameters(params);
    } else {
      setParameters([]);
    }
    
    setBody(example.body || '');
  };

  const addParameter = () => {
    setParameters([...parameters, { key: '', value: '' }]);
  };

  const removeParameter = (index: number) => {
    setParameters(parameters.filter((_, i) => i !== index));
  };

  const updateParameter = (index: number, field: 'key' | 'value', value: string) => {
    const newParameters = [...parameters];
    newParameters[index][field] = value;
    setParameters(newParameters);
  };

  const buildUrl = (baseUrl: string, params: Parameter[]) => {
    if (params.length === 0) return baseUrl;
    
    const urlObj = new URL(baseUrl);
    params.forEach(param => {
      if (param.key.trim() && param.value.trim()) {
        urlObj.searchParams.append(param.key.trim(), param.value.trim());
      }
    });
    
    return urlObj.toString();
  };

  const executeRequest = async () => {
    setLoading(true);
    setError(null);
    setResponse(null);

    try {
      const finalUrl = method === 'GET' ? buildUrl(url, parameters) : url;
      const startTime = Date.now();

      const requestOptions: RequestInit = {
        method,
        headers: {
          'Content-Type': 'application/json',
        },
      };

      if (method === 'POST' && body.trim()) {
        requestOptions.body = body;
      }

      const response = await fetch(finalUrl, requestOptions);
      const responseTime = Date.now() - startTime;

      const responseData = await response.json().catch(() => null);
      
      const headers: Record<string, string> = {};
      response.headers.forEach((value, key) => {
        headers[key] = value;
      });

      setResponse({
        status: response.status,
        data: responseData,
        headers,
        time: responseTime
      });
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred');
    } finally {
      setLoading(false);
    }
  };

  const getCategoryIcon = (category: string) => {
    switch (category) {
      case 'Claims': return <FileText className="h-4 w-4" />;
      case 'Sources': return <Database className="h-4 w-4" />;
      case 'Analysis': return <Activity className="h-4 w-4" />;
      case 'Search': return <Search className="h-4 w-4" />;
      case 'System': return <Shield className="h-4 w-4" />;
      default: return <Globe className="h-4 w-4" />;
    }
  };

  // Get display mode styles
  const getDisplayStyles = () => {
    switch (displayMode) {
      case 'vs-code':
        return {
          container: 'bg-[#1e1e1e] border-slate-700',
          lineNumbers: 'bg-[#252526] text-[#858585] border-slate-700',
          content: 'text-[#d4d4d4]'
        };
      case 'light':
        return {
          container: 'bg-white border-slate-200',
          lineNumbers: 'bg-slate-50 text-slate-500 border-slate-200',
          content: 'text-slate-900'
        };
      case 'dark':
        return {
          container: 'bg-slate-900 border-slate-600',
          lineNumbers: 'bg-slate-800 text-slate-400 border-slate-600',
          content: 'text-slate-100'
        };
      case 'minimal':
        return {
          container: 'bg-transparent border-slate-200',
          lineNumbers: 'bg-transparent text-slate-400 border-slate-200',
          content: 'text-slate-700'
        };
      default:
        return {
          container: 'bg-[#1e1e1e] border-slate-700',
          lineNumbers: 'bg-[#252526] text-[#858585] border-slate-700',
          content: 'text-[#d4d4d4]'
        };
    }
  };

  // VS Code-style JSON rendering with line numbers and collapsible sections
  const renderJsonValue = (value: unknown, path: string = '', depth: number = 0): React.ReactNode => {
    const indent = '  '.repeat(depth);
    const sectionId = path || 'root';
    const isCollapsed = collapsedSections[sectionId];
    const styles = getDisplayStyles();
    
    if (value === null) {
      return <span className="text-[#569cd6]">null</span>;
    }
    
    if (typeof value === 'boolean') {
      return <span className="text-[#569cd6]">{value.toString()}</span>;
    }
    
    if (typeof value === 'number') {
      return <span className="text-[#b5cea8]">{value}</span>;
    }
    
    if (typeof value === 'string') {
      // Check if it's a URL
      if (value.match(/^https?:\/\/.+/)) {
        return (
          <a 
            href={value} 
            target="_blank" 
            rel="noopener noreferrer"
            className="text-[#ce9178] hover:text-[#d7ba7d] underline decoration-dotted flex items-center gap-1 transition-colors"
          >
            <span>"{value}"</span>
            <ExternalLink className="h-3 w-3 opacity-70" />
          </a>
        );
      }
      
      // Check if it's a date
      if (value.match(/^\d{4}-\d{2}-\d{2}/) || value.match(/^\d{4}-\d{2}-\d{2}T/)) {
        return <span className="text-[#ce9178]">"{value}"</span>;
      }
      
      // Check if it's an email
      if (value.match(/^[^\s@]+@[^\s@]+\.[^\s@]+$/)) {
        return <span className="text-[#ce9178]">"{value}"</span>;
      }
      
      return <span className="text-[#ce9178]">"{value}"</span>;
    }
    
    if (Array.isArray(value)) {
      if (value.length === 0) {
        return <span className="text-[#808080]">[]</span>;
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
            <span className="text-[#d4d4d4]">[</span>
            {isCollapsed && <span className="text-[#808080] ml-1">... {value.length} items</span>}
            {!isCollapsed && <span className="text-[#d4d4d4]">]</span>}
          </div>
          
          {!isCollapsed && (
            <div className="ml-6 space-y-0">
              {value.map((item, index) => (
                <div key={index} className="flex items-start">
                  <span className="text-[#808080] mr-2 select-none text-xs">{indent}</span>
                  <div className="flex-1">
                    {renderJsonValue(item, `${path}[${index}]`, depth + 1)}
                  </div>
                  {index < value.length - 1 && <span className="text-[#d4d4d4] ml-1">,</span>}
                </div>
              ))}
            </div>
          )}
          
          {!isCollapsed && <span className="text-[#d4d4d4]">{indent}]</span>}
        </div>
      );
    }
    
    if (typeof value === 'object') {
      const keys = Object.keys(value as object);
      if (keys.length === 0) {
        return <span className="text-[#808080]">{'{}'}</span>;
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
            <span className="text-[#d4d4d4]">{'{'}</span>
            {isCollapsed && <span className="text-[#808080] ml-1">... {keys.length} properties</span>}
            {!isCollapsed && <span className="text-[#d4d4d4]">{'}'}</span>}
          </div>
          
          {!isCollapsed && (
            <div className="ml-6 space-y-0">
              {keys.map((key, index) => (
                <div key={key} className="flex items-start">
                  <span className="text-[#808080] mr-2 select-none text-xs">{indent}</span>
                  <span className="text-[#9cdcfe]">"{key}"</span>
                  <span className="text-[#d4d4d4] mx-2">:</span>
                  <div className="flex-1">
                    {renderJsonValue((value as Record<string, unknown>)[key], `${path}.${key}`, depth + 1)}
                  </div>
                  {index < keys.length - 1 && <span className="text-[#d4d4d4] ml-1">,</span>}
                </div>
              ))}
            </div>
          )}
          
          {!isCollapsed && <span className="text-[#d4d4d4]">{indent}{'}'}</span>}
        </div>
      );
    }
    
    return <span className="text-[#d4d4d4]">{String(value)}</span>;
  };

  // Generate line numbers for the response
  const generateLineNumbers = (data: unknown): number => {
    if (typeof data === 'object' && data !== null) {
      const jsonString = JSON.stringify(data, null, 2);
      return jsonString.split('\n').length;
    }
    return 1;
  };

  // Get response container styles
  const getResponseContainerStyles = () => {
    const styles = getDisplayStyles();
    return `border rounded-lg overflow-hidden max-h-96 ${styles.container}`;
  };

  return (
    <div className="min-h-screen bg-background">
      <Navbar currentPage="playground" />
      
      <div className="container mx-auto p-6 max-w-7xl">
        <div className="mb-8">
          <h1 className="text-3xl font-bold mb-2">API Playground</h1>
          <p className="text-muted-foreground">
            Test and explore the Fake News Checker API endpoints interactively
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Request Configuration */}
          <div className="lg:col-span-2 space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Zap className="h-5 w-5" />
                  Request Configuration
                </CardTitle>
                <CardDescription>
                  Configure your API request parameters
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                {/* Method Selection */}
                <div className="flex items-center space-x-4">
                  <Label htmlFor="method">Method:</Label>
                  <Select value={method} onValueChange={(value: 'GET' | 'POST') => setMethod(value)}>
                    <SelectTrigger className="w-32">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="GET">GET</SelectItem>
                      <SelectItem value="POST">POST</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                {/* URL Input */}
                <div className="space-y-2">
                  <Label htmlFor="url">URL:</Label>
                  <Input
                    id="url"
                    value={url}
                    onChange={(e) => setUrl(e.target.value)}
                    placeholder="Enter API endpoint URL"
                    className="font-mono text-sm"
                  />
                </div>

                {/* Parameters (GET) - Enhanced Key-Value Interface */}
                {method === 'GET' && (
                  <div className="space-y-3">
                    <div className="flex items-center justify-between">
                      <Label>Query Parameters:</Label>
                      <Button
                        type="button"
                        variant="outline"
                        size="sm"
                        onClick={addParameter}
                        className="h-8 px-2"
                      >
                        <Plus className="h-3 w-3 mr-1" />
                        Add Parameter
                      </Button>
                    </div>
                    
                    <div className="space-y-2">
                      {parameters.map((param, index) => (
                        <div key={index} className="flex items-center gap-2">
                          <Input
                            placeholder="Key"
                            value={param.key}
                            onChange={(e) => updateParameter(index, 'key', e.target.value)}
                            className="font-mono text-sm flex-1"
                          />
                          <span className="text-muted-foreground">=</span>
                          <Input
                            placeholder="Value"
                            value={param.value}
                            onChange={(e) => updateParameter(index, 'value', e.target.value)}
                            className="font-mono text-sm flex-1"
                          />
                          <Button
                            type="button"
                            variant="outline"
                            size="sm"
                            onClick={() => removeParameter(index)}
                            className="h-8 w-8 p-0"
                          >
                            <X className="h-3 w-3" />
                          </Button>
                        </div>
                      ))}
                      
                      {parameters.length === 0 && (
                        <div className="text-sm text-muted-foreground text-center py-4 border-2 border-dashed border-muted-foreground/20 rounded-lg">
                          No parameters added. Click "Add Parameter" to add query parameters.
                        </div>
                      )}
                    </div>
                  </div>
                )}

                {/* Request Body (POST) */}
                {method === 'POST' && (
                  <div className="space-y-2">
                    <Label htmlFor="body">Request Body (JSON):</Label>
                    <Textarea
                      id="body"
                      value={body}
                      onChange={(e) => setBody(e.target.value)}
                      placeholder="Enter JSON request body"
                      rows={12}
                      className="font-mono text-sm"
                    />
                  </div>
                )}

                {/* Execute Button */}
                <Button 
                  onClick={executeRequest} 
                  disabled={loading}
                  className="w-full"
                >
                  {loading ? (
                    <>
                      <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                      Executing...
                    </>
                  ) : (
                    <>
                      <Zap className="h-4 w-4 mr-2" />
                      Execute {method} Request
                    </>
                  )}
                </Button>
              </CardContent>
            </Card>

            {/* Response */}
            {response && (
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center justify-between">
                    Response
                    <div className="flex items-center space-x-2">
                      <Badge variant={response.status >= 200 && response.status < 300 ? "default" : "destructive"}>
                        {response.status}
                      </Badge>
                      <Badge variant="outline">{response.time}ms</Badge>
                    </div>
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="flex items-center justify-between mb-4">
                    <div className="flex items-center space-x-2">
                      <Label htmlFor="display-mode">Display Mode:</Label>
                      <Select value={displayMode} onValueChange={(value: 'vs-code' | 'light' | 'dark' | 'minimal') => setDisplayMode(value)}>
                        <SelectTrigger className="w-32">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="vs-code">VS Code</SelectItem>
                          <SelectItem value="light">Light</SelectItem>
                          <SelectItem value="dark">Dark</SelectItem>
                          <SelectItem value="minimal">Minimal</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>
                  
                  <Tabs defaultValue="response" className="w-full">
                    <TabsList className="grid w-full grid-cols-2">
                      <TabsTrigger value="response">Response Data</TabsTrigger>
                      <TabsTrigger value="headers">Headers</TabsTrigger>
                    </TabsList>
                    <TabsContent value="response" className="mt-4">
                      <div className={getResponseContainerStyles()}>
                        <div className="flex h-96">
                          {/* Line Numbers */}
                          <div className={`text-xs font-mono px-3 py-4 select-none border-r ${getDisplayStyles().lineNumbers}`}>
                            {Array.from({ length: generateLineNumbers(response.data) }, (_, i) => (
                              <div key={i + 1} className="text-right">
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
                    <TabsContent value="headers" className="mt-4">
                      <div className={getResponseContainerStyles()}>
                        <div className="flex h-96">
                          {/* Line Numbers */}
                          <div className={`text-xs font-mono px-3 py-4 select-none border-r ${getDisplayStyles().lineNumbers}`}>
                            {Array.from({ length: generateLineNumbers(response.headers) }, (_, i) => (
                              <div key={i + 1} className="text-right">
                                {i + 1}
                              </div>
                            ))}
                          </div>
                          {/* JSON Content */}
                          <div className="flex-1 p-4 overflow-auto">
                            <div className="font-mono text-sm leading-relaxed">
                              {renderJsonValue(response.headers)}
                            </div>
                          </div>
                        </div>
                      </div>
                    </TabsContent>
                  </Tabs>
                </CardContent>
              </Card>
            )}

            {/* Error Display */}
            {error && (
              <Card className="border-destructive">
                <CardHeader>
                  <CardTitle className="text-destructive">Error</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-destructive font-mono text-sm">{error}</p>
                </CardContent>
              </Card>
            )}
          </div>

          {/* Examples Sidebar */}
          <div className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <BookOpen className="h-5 w-5" />
                  API Endpoints
                </CardTitle>
                <CardDescription>
                  Click to load example requests
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                {/* Category Filter */}
                <div className="space-y-2">
                  <Label>Filter by Category:</Label>
                  <Select value={selectedCategory} onValueChange={setSelectedCategory}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {categories.map(category => (
                        <SelectItem key={category} value={category}>
                          {category === 'all' ? 'All Categories' : category}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <Separator />

                {/* Endpoint Examples */}
                <div className="space-y-3">
                  {filteredExamples.map((example, index) => (
                    <div key={index} className="space-y-2">
                      <Button
                        variant="outline"
                        size="sm"
                        className="w-full justify-start text-left h-auto p-3"
                        onClick={() => handleExampleSelect(example)}
                      >
                        <div className="flex items-start gap-3 w-full">
                          <div className="flex-shrink-0 mt-0.5">
                            {getCategoryIcon(example.category)}
                          </div>
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center gap-2 mb-1">
                              <Badge variant="outline" className="text-xs">
                                {example.method}
                              </Badge>
                              <span className="font-medium text-sm truncate">
                                {example.name}
                              </span>
                            </div>
                            <p className="text-xs text-muted-foreground line-clamp-2">
                              {example.description}
                            </p>
                          </div>
                        </div>
                      </Button>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>API Base URL</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="bg-muted p-3 rounded-lg">
                  <code className="text-sm break-all font-mono">{config.apiBaseUrl}</code>
                </div>
                <p className="text-xs text-muted-foreground mt-2">
                  Configure this in your .env file
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Quick Tips</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="text-xs text-muted-foreground space-y-2">
                  <p>• Use <code className="bg-muted px-1 rounded">page</code> and <code className="bg-muted px-1 rounded">limit</code> for pagination</p>
                  <p>• Categories: Politics, Environment, Technology, Health, etc.</p>
                  <p>• POST requests require valid JSON in the body</p>
                  <p>• All responses include metadata and timing</p>
                  <p>• Click on URLs in responses to open them</p>
                  <p>• Use display modes to change the response appearance</p>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Playground; 