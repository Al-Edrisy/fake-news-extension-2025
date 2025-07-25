import React, { useState } from 'react';
import { Button } from '../components/ui/button';
import { Input } from '../components/ui/input';
import { Textarea } from '../components/ui/textarea';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../components/ui/card';
import { Badge } from '../components/ui/badge';
import { Label } from '../components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../components/ui/select';
import { Separator } from '../components/ui/separator';
import { config } from '../utils/config';
import Navbar from '../components/Navbar';
import { BookOpen, Search, Shield, Database, Activity, Globe, FileText, Zap, Plus, X } from 'lucide-react';
import { ScalableOutputWindow } from '../components/playground/ScalableOutputWindow';

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
      name: 'Verify Climate Change Claim',
      url: `${config.apiBaseUrl}/api/claims/verify`,
      method: 'POST',
      description: 'Verify a climate change related claim',
      category: 'Claims',
      body: JSON.stringify({
        claim: "Electric cars are worse for the environment than gas cars due to battery production.",
        include_sources: true,
        detailed_analysis: true
      }, null, 2)
    },
    {
      name: 'Verify Health Claim',
      url: `${config.apiBaseUrl}/api/claims/verify`,
      method: 'POST',
      description: 'Verify a health-related claim',
      category: 'Claims',
      body: JSON.stringify({
        claim: "Drinking 8 glasses of water daily is necessary for optimal health.",
        include_sources: true,
        detailed_analysis: true
      }, null, 2)
    },
    {
      name: 'Verify Technology Claim',
      url: `${config.apiBaseUrl}/api/claims/verify`,
      method: 'POST',
      description: 'Verify a technology-related claim',
      category: 'Claims',
      body: JSON.stringify({
        claim: "5G technology causes cancer and other health problems.",
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
      url: `${config.apiBaseUrl}/public/sources/by-domain/reuters.com`,
      method: 'GET',
      description: 'Get source information by domain',
      category: 'Sources',
      params: 'page=1&limit=10'
    },
    {
      name: 'Get BBC Sources',
      url: `${config.apiBaseUrl}/public/sources/by-domain/bbc.com`,
      method: 'GET',
      description: 'Get BBC news sources',
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
      name: 'Get Supported Analyses',
      url: `${config.apiBaseUrl}/public/analyses/supported`,
      method: 'GET',
      description: 'Get analyses that support claims',
      category: 'Analysis',
      params: 'page=1&limit=10'
    },
    {
      name: 'Analyze Vaccine Content',
      url: `${config.apiBaseUrl}/api/analysis/analyze`,
      method: 'POST',
      description: 'Analyze vaccine-related content with sources',
      category: 'Analysis',
      body: JSON.stringify({
        claim: "mRNA vaccines alter human DNA permanently.",
        articles: [
          {
            title: "How mRNA Vaccines Work - CDC Explanation",
            date: "2024-01-15",
            source: "cdc.gov",
            content: "mRNA vaccines teach our cells how to make a protein that triggers an immune response. The mRNA never enters the cell nucleus where DNA is kept...",
            url: "https://www.cdc.gov/coronavirus/2019-ncov/vaccines/different-vaccines/mrna.html"
          },
          {
            title: "Fact Check: mRNA Vaccines and DNA",
            date: "2024-02-10",
            source: "reuters.com",
            content: "Scientific consensus confirms that mRNA vaccines do not alter human DNA. The mRNA is broken down by the body after use...",
            url: "https://www.reuters.com/article/uk-factcheck-mrna-dna"
          }
        ]
      }, null, 2)
    },
    {
      name: 'Analyze Climate Content',
      url: `${config.apiBaseUrl}/api/analysis/analyze`,
      method: 'POST',
      description: 'Analyze climate change content with sources',
      category: 'Analysis',
      body: JSON.stringify({
        claim: "Global warming stopped in 1998 and hasn't continued since.",
        articles: [
          {
            title: "Global Temperature Records - NASA",
            date: "2024-01-20",
            source: "nasa.gov",
            content: "NASA data shows that global temperatures have continued to rise since 1998, with the last decade being the warmest on record...",
            url: "https://climate.nasa.gov/evidence/"
          },
          {
            title: "Climate Change Evidence - NOAA",
            date: "2024-02-05",
            source: "noaa.gov",
            content: "NOAA confirms that global warming has accelerated since 1998, with clear evidence of rising temperatures worldwide...",
            url: "https://www.climate.gov/news-features/understanding-climate/climate-change-global-temperature"
          }
        ]
      }, null, 2)
    },
    
    // Search endpoints
    {
      name: 'Search Mars Discovery',
      url: `${config.apiBaseUrl}/api/search/web`,
      method: 'POST',
      description: 'Search for Mars water discovery information',
      category: 'Search',
      body: JSON.stringify({
        query: "NASA Mars water discovery 2024 evidence",
        max_results: 8
      }, null, 2)
    },
    {
      name: 'Search AI Technology',
      url: `${config.apiBaseUrl}/api/search/web`,
      method: 'POST',
      description: 'Search for AI technology developments',
      category: 'Search',
      body: JSON.stringify({
        query: "artificial intelligence breakthrough 2024 ChatGPT GPT-4",
        max_results: 10
      }, null, 2)
    },
    {
      name: 'Search Renewable Energy',
      url: `${config.apiBaseUrl}/api/search/web`,
      method: 'POST',
      description: 'Search for renewable energy statistics',
      category: 'Search',
      body: JSON.stringify({
        query: "renewable energy statistics 2024 solar wind power",
        max_results: 6
      }, null, 2)
    },
    
    // System endpoints
    {
      name: 'Health Check',
      url: `${config.apiBaseUrl}/health`,
      method: 'GET',
      description: 'Check server health status',
      category: 'System'
    },
    {
      name: 'System Statistics',
      url: `${config.apiBaseUrl}/public/stats`,
      method: 'GET',
      description: 'Get system statistics and metrics',
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

            {/* Scalable Output Window */}
            <ScalableOutputWindow 
              response={response}
              error={error}
              loading={loading}
            />
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