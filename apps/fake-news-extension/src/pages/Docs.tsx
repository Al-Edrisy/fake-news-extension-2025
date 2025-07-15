import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";
import { ScrollArea } from "@/components/ui/scroll-area";
import Navbar from "@/components/Navbar";
import { config, buildApiUrl } from "@/utils/config";
import { 
  Brain, 
  Database, 
  Download, 
  Code, 
  BarChart3,
  FileText,
  Globe,
  Zap,
  CheckCircle,
  ArrowRight,
  Copy,
  ExternalLink,
  Menu,
  X,
  ChevronRight
} from "lucide-react";

const Docs = () => {
  const [copiedCode, setCopiedCode] = useState<string>("");
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [activeSection, setActiveSection] = useState("overview");

  const scrollToSection = (sectionId: string) => {
    const element = document.getElementById(sectionId);
    if (element) {
      element.scrollIntoView({ behavior: 'smooth', block: 'start' });
      setActiveSection(sectionId);
      setSidebarOpen(false); // Close mobile sidebar
    }
  };

  const copyToClipboard = (text: string, id: string) => {
    navigator.clipboard.writeText(text);
    setCopiedCode(id);
    setTimeout(() => setCopiedCode(""), 2000);
  };

  const endpoints = [
    {
      id: "verify-claim",
      method: "POST",
      endpoint: "/api/claims/verify",
      title: "Claim Verification",
      description: "Submit a factual claim and receive AI-powered verification",
      icon: Brain,
      tags: ["AI", "verification", "claims"],
      isPublic: false,
      exportCSV: false,
      requestExample: `{
  "claim": "SpaceX launched a new internet satellite with fast speed."
}`,
      responseExample: `{
  "category": "science",
  "claim_id": "81d4a748-cd91-4b79-84a4-7df93e777cc1",
  "conclusion": "🟡 The claim is partially supported",
  "confidence": 54.35,
  "verdict": "Partial",
  "sources": [...],
  "status": "success"
}`,
      javascriptExample: `fetch('${config.apiBaseUrl}/api/claims/verify', {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
  },
  body: JSON.stringify({
    claim: "SpaceX launched a new internet satellite with fast speed."
  })
})
.then(response => response.json())
.then(data => console.log(data));`,
      pythonExample: `import requests

url = "${config.apiBaseUrl}/api/claims/verify"
data = {
    "claim": "SpaceX launched a new internet satellite with fast speed."
}

response = requests.post(url, json=data)
result = response.json()
print(result)`,
      curlExample: `curl -X POST "${config.apiBaseUrl}/api/claims/verify" \\
  -H "Content-Type: application/json" \\
  -d '{
    "claim": "SpaceX launched a new internet satellite with fast speed."
  }'`,
      parameters: [
        { name: "claim", type: "string", required: true, description: "The factual claim to verify" }
      ]
    },
    {
      id: "analyze-articles",
      method: "POST", 
      endpoint: "/api/analysis/analyze",
      title: "Article Analysis",
      description: "Analyze articles against a claim for AI-based verdict",
      icon: BarChart3,
      tags: ["AI", "analysis", "articles"],
      isPublic: false,
      exportCSV: false,
      requestExample: `{
  "claim": "COVID-19 vaccines cause infertility",
  "articles": [{
    "title": "Vaccine Facts",
    "date": "2024-12-01",
    "source": "reuters",
    "content": "Extensive studies show...",
    "url": "https://reuters.com/article/covid-vaccine"
  }]
}`,
      responseExample: `{
  "conclusion": "❌ Most sources contradict this claim",
  "confidence": 27.84,
  "verdict": "False",
  "sources": [...],
  "status": "success"
}`,
      javascriptExample: `fetch('${config.apiBaseUrl}/api/analysis/analyze', {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
  },
  body: JSON.stringify({
    claim: "COVID-19 vaccines cause infertility",
    articles: [...]
  })
})
.then(response => response.json())
.then(data => console.log(data));`,
      pythonExample: `import requests

url = "${config.apiBaseUrl}/api/analysis/analyze"
data = {
    "claim": "COVID-19 vaccines cause infertility",
    "articles": [...]
}

response = requests.post(url, json=data)
result = response.json()`,
      curlExample: `curl -X POST "${config.apiBaseUrl}/api/analysis/analyze" \\
  -H "Content-Type: application/json" \\
  -d '{
    "claim": "COVID-19 vaccines cause infertility",
    "articles": [...]
  }'`,
      parameters: [
        { name: "claim", type: "string", required: true, description: "The claim to analyze" },
        { name: "articles", type: "array", required: true, description: "Array of articles to analyze" }
      ]
    },
    {
      id: "get-claims",
      method: "GET",
      endpoint: "/public/claims",
      title: "Get Public Claims",
      description: "Retrieve paginated claims from the database",
      icon: Database,
      tags: ["public", "claims", "data"],
      isPublic: true,
      exportCSV: true,
      requestExample: `GET /public/claims?page=1&limit=10`,
      responseExample: `{
  "data": [
    {
      "id": "81d4a748-cd91-4b79-84a4-7df93e777cc1",
      "text": "SpaceX launched a new internet satellite",
      "category": "science",
      "verdict": "Partial",
      "confidence": 54.35,
      "created_at": "2025-01-09T10:30:00Z"
    }
  ],
  "pagination": {
    "page": 1,
    "limit": 10,
    "total": 150,
    "pages": 15
  }
}`,
      javascriptExample: `fetch('${config.apiBaseUrl}/public/claims?page=1&limit=10')
  .then(response => response.json())
  .then(data => console.log(data));`,
      pythonExample: `import requests

url = "${config.apiBaseUrl}/public/claims"
params = {"page": 1, "limit": 10}

response = requests.get(url, params=params)
result = response.json()`,
      curlExample: `curl "${config.apiBaseUrl}/public/claims?page=1&limit=10"`,
      parameters: [
        { name: "page", type: "number", required: false, description: "Page number (default: 1)" },
        { name: "limit", type: "number", required: false, description: "Items per page (default: 10)" }
      ]
    },
    {
      id: "get-claims-by-category",
      method: "GET",
      endpoint: "/public/claims/by-category/:category",
      title: "Get Claims by Category",
      description: "Retrieve claims filtered by category with pagination",
      icon: Database,
      tags: ["public", "claims", "category"],
      isPublic: true,
      exportCSV: true,
      requestExample: `GET /public/claims/by-category/science?page=1&limit=10`,
      responseExample: `{
  "data": [...],
  "pagination": {
    "page": 1,
    "limit": 10,
    "total": 45,
    "pages": 5
  }
}`,
      javascriptExample: `fetch('${config.apiBaseUrl}/public/claims/by-category/science?page=1&limit=10')
  .then(response => response.json())
  .then(data => console.log(data));`,
      pythonExample: `import requests

url = "${config.apiBaseUrl}/public/claims/by-category/science"
params = {"page": 1, "limit": 10}

response = requests.get(url, params=params)
result = response.json()`,
      curlExample: `curl "${config.apiBaseUrl}/public/claims/by-category/science?page=1&limit=10"`,
      parameters: [
        { name: "category", type: "string", required: true, description: "Category: Environment, Health, Science, Politics" },
        { name: "page", type: "number", required: false, description: "Page number (default: 1)" },
        { name: "limit", type: "number", required: false, description: "Items per page (default: 10)" }
      ]
    },
    {
      id: "get-sources",
      method: "GET",
      endpoint: "/public/sources",
      title: "Get Public Sources",
      description: "Retrieve trusted sources with pagination",
      icon: Globe,
      tags: ["public", "sources", "data"],
      isPublic: true,
      exportCSV: true,
      requestExample: `GET /public/sources?page=1&limit=10`,
      responseExample: `{
  "data": [
    {
      "id": "source-123",
      "name": "Reuters",
      "url": "https://reuters.com",
      "credibility_score": 95,
      "category": "news",
      "verified": true
    }
  ],
  "pagination": {
    "page": 1,
    "limit": 10,
    "total": 50,
    "pages": 5
  }
}`,
      javascriptExample: `fetch('${config.apiBaseUrl}/public/sources?page=1&limit=10')
  .then(response => response.json())
  .then(data => console.log(data));`,
      pythonExample: `import requests

url = "${config.apiBaseUrl}/public/sources"
params = {"page": 1, "limit": 10}

response = requests.get(url, params=params)
result = response.json()`,
      curlExample: `curl "${config.apiBaseUrl}/public/sources?page=1&limit=10"`,
      parameters: [
        { name: "page", type: "number", required: false, description: "Page number (default: 1)" },
        { name: "limit", type: "number", required: false, description: "Items per page (default: 10)" }
      ]
    },
    {
      id: "get-analyses",
      method: "GET",
      endpoint: "/public/analyses",
      title: "Get All Analyses",
      description: "Retrieve detailed list of all claim analyses",
      icon: BarChart3,
      tags: ["public", "analyses", "data"],
      isPublic: true,
      exportCSV: true,
      requestExample: `GET /public/analyses?page=1&limit=10`,
      responseExample: `{
  "data": [
    {
      "id": "analysis-456",
      "claim_id": "81d4a748-cd91-4b79-84a4-7df93e777cc1",
      "verdict": "Partial",
      "confidence": 54.35,
      "sources_count": 3,
      "created_at": "2025-01-09T10:30:00Z"
    }
  ],
  "pagination": {
    "page": 1,
    "limit": 10,
    "total": 200,
    "pages": 20
  }
}`,
      javascriptExample: `fetch('${config.apiBaseUrl}/public/analyses?page=1&limit=10')
  .then(response => response.json())
  .then(data => console.log(data));`,
      pythonExample: `import requests

url = "${config.apiBaseUrl}/public/analyses"
params = {"page": 1, "limit": 10}

response = requests.get(url, params=params)
result = response.json()`,
      curlExample: `curl "${config.apiBaseUrl}/public/analyses?page=1&limit=10"`,
      parameters: [
        { name: "page", type: "number", required: false, description: "Page number (default: 1)" },
        { name: "limit", type: "number", required: false, description: "Items per page (default: 10)" }
      ]
    },
    {
      id: "export-csv",
      method: "GET",
      endpoint: "/api/export/<table_name>",
      title: "CSV Export",
      description: "Export data from database tables as CSV files",
      icon: Download,
      tags: ["export", "csv", "data"],
      isPublic: false,
      exportCSV: true,
      requestExample: `GET /api/export/claims`,
      responseExample: `[Downloads: data_management_system_claims.csv]`,
      javascriptExample: `fetch('${config.apiBaseUrl}/api/export/claims')
  .then(response => response.blob())
  .then(blob => {
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'data_management_system_claims.csv';
    a.click();
  });`,
      pythonExample: `import requests

url = "${config.apiBaseUrl}/api/export/claims"
response = requests.get(url)

with open('data_management_system_claims.csv', 'wb') as f:
    f.write(response.content)`,
      curlExample: `curl "${config.apiBaseUrl}/api/export/claims" \\
  -o data_management_system_claims.csv`,
      parameters: [
        { name: "table_name", type: "string", required: true, description: "Table name: claims, sources, analyses" }
      ]
    }
  ];

  const features = [
    {
      icon: Zap,
      title: "Real-time Processing",
      description: "Instant claim verification with AI-powered analysis"
    },
    {
      icon: Globe,
      title: "Global Sources",
      description: "Multi-source verification from trusted publications"
    },
    {
      icon: Code,
      title: "Developer API",
      description: "RESTful API with comprehensive documentation"
    },
    {
      icon: Download,
      title: "Data Export",
      description: "CSV export functionality for research purposes"
    }
  ];

  const navigationItems = [
    { id: "overview", label: "Overview", icon: FileText },
    { id: "authentication", label: "Authentication", icon: CheckCircle },
    { id: "endpoints", label: "API Endpoints", icon: Code },
    { id: "examples", label: "Getting Started", icon: ArrowRight },
  ];

  const SidebarContent = () => (
    <div className="h-full flex flex-col">
      <div className="flex items-center justify-between p-4 border-b border-border">
        <h2 className="font-semibold text-primary-text">Documentation</h2>
        <Button
          variant="ghost"
          size="sm"
          onClick={() => setSidebarOpen(false)}
          className="lg:hidden"
        >
          <X className="h-4 w-4" />
        </Button>
      </div>
      
      <ScrollArea className="flex-1 p-4">
          <nav className="space-y-6">
          {/* Quick Navigation */}
            <div>
            <h3 className="font-semibold text-primary-text mb-3 text-sm">Quick Navigation</h3>
            <ul className="space-y-1">
              {navigationItems.map((item) => {
                const Icon = item.icon;
                return (
                  <li key={item.id}>
                  <button 
                      onClick={() => scrollToSection(item.id)} 
                      className={`w-full flex items-center gap-2 px-3 py-2 rounded-lg text-sm transition-colors ${
                        activeSection === item.id 
                          ? 'bg-primary/10 text-primary' 
                          : 'text-muted-text hover:text-primary hover:bg-muted/20'
                      }`}
                    >
                      <Icon className="h-4 w-4" />
                      {item.label}
                  </button>
                </li>
                );
              })}
              </ul>
            </div>
            
          {/* API Endpoints */}
            <div>
            <h3 className="font-semibold text-primary-text mb-3 text-sm">API Endpoints</h3>
            <div className="space-y-1">
                {endpoints.map((endpoint) => {
                  const Icon = endpoint.icon;
                  return (
                    <button
                      key={endpoint.id}
                      onClick={() => scrollToSection(endpoint.id)}
                    className={`w-full flex items-center gap-3 p-2 rounded-lg transition-colors group text-left ${
                      activeSection === endpoint.id 
                        ? 'bg-primary/10 text-primary' 
                        : 'hover:bg-muted/20'
                    }`}
                    >
                      <div className="bg-primary/10 p-1.5 rounded">
                        <Icon className="h-3 w-3 text-primary" />
                      </div>
                      <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-1 mb-1">
                          <Badge variant={endpoint.method === 'GET' ? 'secondary' : 'default'} className="text-xs">
                            {endpoint.method}
                          </Badge>
                          {endpoint.isPublic && <Badge variant="outline" className="text-xs">Public</Badge>}
                        </div>
                      <p className={`text-xs transition-colors truncate ${
                        activeSection === endpoint.id ? 'text-primary' : 'text-primary-text group-hover:text-primary'
                      }`}>
                          {endpoint.title}
                        </p>
                        </div>
                    <ChevronRight className="h-3 w-3 text-muted-text" />
                    </button>
                  );
                })}
              </div>
            </div>
            
          {/* Backend Info */}
            <div className="pt-4 border-t border-border">
              <p className="text-xs text-muted-text mb-2">Backend Insights</p>
              <ul className="text-xs text-muted-text space-y-1">
                <li>• All requests logged securely</li>
                <li>• Anonymized data for public datasets</li>
                <li>• Future: Dataset subscriptions</li>
                <li>• Future: Quality feedback system</li>
              </ul>
            </div>
          </nav>
      </ScrollArea>
    </div>
  );

  return (
    <div className="min-h-screen bg-background">
      <Navbar currentPage="docs" />

      <div className="flex">
        {/* Mobile Sidebar */}
        <Sheet open={sidebarOpen} onOpenChange={setSidebarOpen}>
          <SheetTrigger asChild>
            <Button
              variant="outline"
              size="sm"
              className="fixed top-20 left-4 z-50 lg:hidden"
            >
              <Menu className="h-4 w-4" />
            </Button>
          </SheetTrigger>
          <SheetContent side="left" className="w-80 p-0">
            <SidebarContent />
          </SheetContent>
        </Sheet>

        {/* Desktop Sidebar */}
        <aside className="w-80 min-h-screen bg-surface/30 border-r border-border sticky top-20 hidden lg:block">
          <SidebarContent />
        </aside>

        {/* Main Content */}
        <main className="flex-1 p-6 lg:p-8">
          {/* Hero Section */}
          <section id="overview" className="mb-12">
            <div className="text-center space-y-6 mb-12">
              <h1 className="text-4xl font-bold text-primary-text">
                VeriNews API Documentation
              </h1>
              <p className="text-xl text-muted-text max-w-3xl mx-auto">
                Powerful fact-checking APIs for developers. Verify claims, analyze articles, and access public data with our comprehensive suite of tools.
              </p>
              <div className="flex gap-4 justify-center">
                <Badge className="bg-primary/10 text-primary border border-primary/20">
                  Free to Use
                </Badge>
                <Badge className="bg-accent/10 text-accent border border-accent/20">
                  No API Key Required
                </Badge>
                <Badge className="bg-success/10 text-success border border-success/20">
                  RESTful API
                </Badge>
              </div>
            </div>

            {/* Features Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-12">
              {features.map((feature, index) => {
                const Icon = feature.icon;
                return (
                  <Card key={index} className="border-border bg-surface hover:shadow-lg transition-all">
                    <CardContent className="p-6 text-center">
                      <div className="bg-primary/10 w-12 h-12 rounded-lg flex items-center justify-center mx-auto mb-4">
                        <Icon className="h-6 w-6 text-primary" />
                      </div>
                      <h3 className="font-semibold text-primary-text mb-2">{feature.title}</h3>
                      <p className="text-sm text-muted-text">{feature.description}</p>
                    </CardContent>
                  </Card>
                );
              })}
            </div>
          </section>

          {/* Authentication Section */}
          <section id="authentication" className="mb-12">
            <Card className="border-border bg-surface">
              <CardHeader>
                <CardTitle className="text-primary-text flex items-center gap-2">
                  <CheckCircle className="h-5 w-5 text-accent" />
                  Authentication
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="bg-accent/10 border border-accent/20 rounded-lg p-4">
                  <p className="text-primary-text font-medium mb-2">✅ No Authentication Required</p>
                  <p className="text-muted-text">
                    All VeriNews APIs are free and open to use. No API keys, tokens, or registration required. 
                    Simply make HTTP requests to our endpoints and start fact-checking immediately.
                  </p>
                </div>
              </CardContent>
            </Card>
          </section>

          {/* API Endpoints */}
          <section id="endpoints" className="mb-12">
            <h2 className="text-3xl font-bold text-primary-text mb-8">API Endpoints</h2>
            
            <div className="space-y-8">
              {endpoints.map((endpoint) => {
                const Icon = endpoint.icon;
                return (
                  <Card key={endpoint.id} id={endpoint.id} className="border-border bg-surface scroll-mt-20">
                    <CardHeader>
                      <div className="flex items-center gap-3 mb-2">
                        <div className="bg-primary/10 p-2 rounded-lg">
                          <Icon className="h-5 w-5 text-primary" />
                        </div>
                        <div className="flex-1">
                          <CardTitle className="text-primary-text">{endpoint.title}</CardTitle>
                          <div className="flex items-center gap-2 mt-1">
                            <Badge variant={endpoint.method === 'GET' ? 'secondary' : 'default'}>
                              {endpoint.method}
                            </Badge>
                            <code className="text-sm bg-muted/20 px-2 py-1 rounded text-muted-text">
                              {endpoint.endpoint}
                            </code>
                          </div>
                        </div>
                      </div>
                      <CardDescription className="text-muted-text">
                        {endpoint.description}
                      </CardDescription>
                    </CardHeader>
                    <CardContent>
                      <Tabs defaultValue="request" className="w-full">
                        <TabsList className="grid w-full grid-cols-5">
                          <TabsTrigger value="request">Request</TabsTrigger>
                          <TabsTrigger value="response">Response</TabsTrigger>
                          <TabsTrigger value="javascript">JavaScript</TabsTrigger>
                          <TabsTrigger value="python">Python</TabsTrigger>
                          <TabsTrigger value="curl">cURL</TabsTrigger>
                        </TabsList>
                        
                        <TabsContent value="request" className="mt-4">
                          <div className="space-y-4">
                            <div className="relative">
                              <pre className="bg-muted/10 border border-border rounded-lg p-4 overflow-x-auto text-sm">
                                <code className="text-muted-text">{endpoint.requestExample}</code>
                              </pre>
                              <Button
                                size="sm"
                                variant="outline"
                                className="absolute top-2 right-2"
                                onClick={() => copyToClipboard(endpoint.requestExample, `${endpoint.id}-req`)}
                              >
                                {copiedCode === `${endpoint.id}-req` ? <CheckCircle className="h-4 w-4" /> : <Copy className="h-4 w-4" />}
                              </Button>
                            </div>
                            
                            {/* Parameters */}
                            <div>
                              <h4 className="font-semibold text-primary-text mb-2">Parameters</h4>
                              <div className="space-y-2">
                                {endpoint.parameters.map((param, index) => (
                                  <div key={index} className="border border-border rounded-lg p-3">
                                    <div className="flex items-center gap-2 mb-1">
                                      <code className="text-sm font-mono text-primary">{param.name}</code>
                                      <Badge variant={param.required ? "default" : "secondary"} className="text-xs">
                                        {param.required ? "Required" : "Optional"}
                                      </Badge>
                                      <span className="text-xs text-muted-text">{param.type}</span>
                                    </div>
                                    <p className="text-sm text-muted-text">{param.description}</p>
                                  </div>
                                ))}
                              </div>
                            </div>
                          </div>
                        </TabsContent>
                        
                        <TabsContent value="response" className="mt-4">
                          <div className="relative">
                            <pre className="bg-muted/10 border border-border rounded-lg p-4 overflow-x-auto text-sm">
                              <code className="text-muted-text">{endpoint.responseExample}</code>
                            </pre>
                            <Button
                              size="sm"
                              variant="outline"
                              className="absolute top-2 right-2"
                              onClick={() => copyToClipboard(endpoint.responseExample, `${endpoint.id}-res`)}
                            >
                              {copiedCode === `${endpoint.id}-res` ? <CheckCircle className="h-4 w-4" /> : <Copy className="h-4 w-4" />}
                            </Button>
                          </div>
                          {endpoint.exportCSV && (
                            <div className="mt-4 p-3 bg-accent/10 border border-accent/20 rounded-lg">
                              <div className="flex items-center gap-2 mb-2">
                                <Download className="h-4 w-4 text-accent" />
                                <span className="font-medium text-accent">Export as CSV Available</span>
                              </div>
                              <p className="text-sm text-muted-text">
                                This endpoint supports CSV export. Filename: <code>data_management_system_{endpoint.id.replace('-', '_')}.csv</code>
                              </p>
                            </div>
                          )}
                        </TabsContent>
                        
                        <TabsContent value="javascript" className="mt-4">
                          <div className="relative">
                            <pre className="bg-muted/10 border border-border rounded-lg p-4 overflow-x-auto text-sm">
                              <code className="text-muted-text">{endpoint.javascriptExample}</code>
                            </pre>
                            <Button
                              size="sm"
                              variant="outline"
                              className="absolute top-2 right-2"
                              onClick={() => copyToClipboard(endpoint.javascriptExample, `${endpoint.id}-js`)}
                            >
                              {copiedCode === `${endpoint.id}-js` ? <CheckCircle className="h-4 w-4" /> : <Copy className="h-4 w-4" />}
                            </Button>
                          </div>
                        </TabsContent>
                        
                        <TabsContent value="python" className="mt-4">
                          <div className="relative">
                            <pre className="bg-muted/10 border border-border rounded-lg p-4 overflow-x-auto text-sm">
                              <code className="text-muted-text">{endpoint.pythonExample}</code>
                            </pre>
                            <Button
                              size="sm"
                              variant="outline"
                              className="absolute top-2 right-2"
                              onClick={() => copyToClipboard(endpoint.pythonExample, `${endpoint.id}-py`)}
                            >
                              {copiedCode === `${endpoint.id}-py` ? <CheckCircle className="h-4 w-4" /> : <Copy className="h-4 w-4" />}
                            </Button>
                          </div>
                        </TabsContent>
                        
                        <TabsContent value="curl" className="mt-4">
                          <div className="relative">
                            <pre className="bg-muted/10 border border-border rounded-lg p-4 overflow-x-auto text-sm">
                              <code className="text-muted-text">{endpoint.curlExample}</code>
                            </pre>
                            <Button
                              size="sm"
                              variant="outline"
                              className="absolute top-2 right-2"
                              onClick={() => copyToClipboard(endpoint.curlExample, `${endpoint.id}-curl`)}
                            >
                              {copiedCode === `${endpoint.id}-curl` ? <CheckCircle className="h-4 w-4" /> : <Copy className="h-4 w-4" />}
                            </Button>
                          </div>
                        </TabsContent>
                      </Tabs>
                    </CardContent>
                  </Card>
                );
              })}
            </div>
          </section>

          {/* Getting Started */}
          <section id="examples" className="mb-12">
            <Card className="border-border bg-surface">
              <CardHeader>
                <CardTitle className="text-primary-text">Getting Started</CardTitle>
                <CardDescription className="text-muted-text">
                  Ready to start fact-checking? Here's how to make your first API call.
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-6">
                  <div>
                    <h4 className="font-semibold text-primary-text mb-2">Quick Example</h4>
                    <div className="relative">
                      <pre className="bg-muted/10 border border-border rounded-lg p-4 overflow-x-auto text-sm">
                        <code className="text-muted-text">{`curl -X POST "${config.apiBaseUrl}/api/claims/verify" \\
  -H "Content-Type: application/json" \\
  -d '{
    "claim": "SpaceX launched a new internet satellite with fast speed."
  }'`}</code>
                      </pre>
                    </div>
                  </div>
                  
                  <div className="flex gap-4">
                    <Button className="bg-primary hover:bg-secondary text-white" asChild>
                      <a href="/services">
                        <ArrowRight className="h-4 w-4 mr-2" />
                        View All Services
                      </a>
                    </Button>
                    <Button variant="outline" className="border-border" asChild>
                      <a href="https://github.com/Al-Edrisy/fake-news-extension-2025" target="_blank">
                        <ExternalLink className="h-4 w-4 mr-2" />
                        Contribute on GitHub
                      </a>
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          </section>
        </main>
      </div>
    </div>
  );
};

export default Docs;