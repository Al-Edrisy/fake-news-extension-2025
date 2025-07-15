import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Separator } from "@/components/ui/separator";
import Navbar from "@/components/Navbar";
import { 
  Brain, 
  FileText, 
  Database, 
  Download, 
  Code, 
  BarChart3, 
  Github, 
  Chrome, 
  ExternalLink,
  Search,
  Globe,
  Activity,
  Shield,
  Zap,
  ArrowRight,
  CheckCircle,
  Sparkles,
  Cpu,
  Network,
  Layers,
  Target,
  TrendingUp,
  Users,
  Lock,
  Unlock,
  Clock,
  Star
} from "lucide-react";
import { useState, useEffect } from "react";
import { config } from "@/utils/config";

const Services = () => {
  const [activeTab, setActiveTab] = useState("all");
  const [animateCards, setAnimateCards] = useState(false);

  useEffect(() => {
    // Trigger animation after component mounts
    const timer = setTimeout(() => setAnimateCards(true), 100);
    return () => clearTimeout(timer);
  }, []);

  const serviceCategories = [
    {
      id: "all",
      name: "All Services",
      icon: Layers,
      count: 15
    },
    {
      id: "claims",
      name: "Claims & Verification",
      icon: Target,
      count: 4
    },
    {
      id: "analysis",
      name: "AI Analysis",
      icon: Brain,
      count: 3
    },
    {
      id: "data",
      name: "Data & Sources",
      icon: Database,
      count: 4
    },
    {
      id: "search",
      name: "Search & Discovery",
      icon: Search,
      count: 2
    },
    {
      id: "system",
      name: "System & Monitoring",
      icon: Shield,
      count: 2
    }
  ];

  const allServices = [
    // Claims & Verification Services
    {
      id: "claim-verification",
      title: "Claim Verification",
      description: "Submit factual claims and receive AI-powered verification with confidence scoring and detailed analysis.",
      category: "claims",
      method: "POST",
      endpoint: "/api/claims/verify",
      icon: Target,
      color: "primary",
      badge: "AI",
      features: ["Real-time verification", "Confidence scoring", "Multi-source analysis", "Detailed explanations"],
      status: "production",
      access: "public",
      responseTime: "< 5s",
      rateLimit: "100/hour",
      animation: "fadeInUp"
    },
    {
      id: "get-claims",
      title: "Get All Claims",
      description: "Retrieve all verified claims with pagination, filtering, and comprehensive metadata.",
      category: "claims",
      method: "GET",
      endpoint: "/public/claims",
      icon: FileText,
      color: "secondary",
      badge: "Public",
      features: ["Pagination support", "Category filtering", "Historical data", "Metadata access"],
      status: "production",
      access: "public",
      responseTime: "< 1s",
      rateLimit: "1000/hour",
      animation: "fadeInUp"
    },
    {
      id: "high-confidence-claims",
      title: "High Confidence Claims",
      description: "Access claims with high confidence scores for reliable fact-checking results.",
      category: "claims",
      method: "GET",
      endpoint: "/public/claims/high-confidence",
      icon: Star,
      color: "accent",
      badge: "Premium",
      features: ["High accuracy", "Verified sources", "Expert review", "Quality assurance"],
      status: "production",
      access: "public",
      responseTime: "< 1s",
      rateLimit: "500/hour",
      animation: "fadeInUp"
    },
    {
      id: "claims-by-category",
      title: "Claims by Category",
      description: "Filter claims by specific categories like Politics, Health, Technology, Environment, etc.",
      category: "claims",
      method: "GET",
      endpoint: "/public/claims/by-category/{category}",
      icon: Layers,
      color: "info",
      badge: "Filtered",
      features: ["Category filtering", "Topic-specific", "Organized data", "Easy navigation"],
      status: "production",
      access: "public",
      responseTime: "< 1s",
      rateLimit: "1000/hour",
      animation: "fadeInUp"
    },

    // AI Analysis Services
    {
      id: "content-analysis",
      title: "Content Analysis",
      description: "Analyze articles and content directly with AI models for comprehensive fact-checking.",
      category: "analysis",
      method: "POST",
      endpoint: "/api/analysis/analyze",
      icon: Brain,
      color: "primary",
      badge: "AI",
      features: ["Direct content analysis", "Article processing", "AI model integration", "Structured results"],
      status: "production",
      access: "public",
      responseTime: "< 10s",
      rateLimit: "50/hour",
      animation: "fadeInUp"
    },
    {
      id: "get-analyses",
      title: "Get All Analyses",
      description: "Retrieve all completed analyses with sources, verdicts, and detailed breakdowns.",
      category: "analysis",
      method: "GET",
      endpoint: "/public/analyses",
      icon: BarChart3,
      color: "secondary",
      badge: "Public",
      features: ["Complete analyses", "Source references", "Verdict history", "Detailed breakdowns"],
      status: "production",
      access: "public",
      responseTime: "< 1s",
      rateLimit: "1000/hour",
      animation: "fadeInUp"
    },
    {
      id: "latest-analyses",
      title: "Latest Analyses",
      description: "Get the most recent analyses in descending order with real-time updates.",
      category: "analysis",
      method: "GET",
      endpoint: "/public/analyses/latest",
      icon: Clock,
      color: "accent",
      badge: "Real-time",
      features: ["Latest results", "Real-time updates", "Descending order", "Fresh data"],
      status: "production",
      access: "public",
      responseTime: "< 1s",
      rateLimit: "1000/hour",
      animation: "fadeInUp"
    },

    // Data & Sources Services
    {
      id: "get-sources",
      title: "Get All Sources",
      description: "Access our comprehensive database of trusted news sources and their credibility scores.",
      category: "data",
      method: "GET",
      endpoint: "/public/sources",
      icon: Database,
      color: "primary",
      badge: "Public",
      features: ["Trusted sources", "Credibility scores", "Verified domains", "Source metadata"],
      status: "production",
      access: "public",
      responseTime: "< 1s",
      rateLimit: "1000/hour",
      animation: "fadeInUp"
    },
    {
      id: "sources-by-domain",
      title: "Sources by Domain",
      description: "Get detailed information about specific news sources by their domain name.",
      category: "data",
      method: "GET",
      endpoint: "/public/sources/by-domain/{domain}",
      icon: Globe,
      color: "secondary",
      badge: "Filtered",
      features: ["Domain-specific", "Detailed info", "Source verification", "Domain analysis"],
      status: "production",
      access: "public",
      responseTime: "< 1s",
      rateLimit: "1000/hour",
      animation: "fadeInUp"
    },
    {
      id: "data-export",
      title: "Data Export",
      description: "Export verified data in CSV format for research, analysis, and integration purposes.",
      category: "data",
      method: "GET",
      endpoint: "/api/export",
      icon: Download,
      color: "accent",
      badge: "Export",
      features: ["CSV format", "Bulk export", "Research ready", "Integration friendly"],
      status: "production",
      access: "public",
      responseTime: "< 5s",
      rateLimit: "100/hour",
      animation: "fadeInUp"
    },
    {
      id: "public-datasets",
      title: "Public Datasets",
      description: "Access categorized and timestamped datasets of claims, sources, and analysis results.",
      category: "data",
      method: "GET",
      endpoint: "/public/datasets",
      icon: Layers,
      color: "info",
      badge: "Datasets",
      features: ["Categorized data", "Timestamped", "Historical records", "Research datasets"],
      status: "production",
      access: "public",
      responseTime: "< 2s",
      rateLimit: "500/hour",
      animation: "fadeInUp"
    },

    // Search & Discovery Services
    {
      id: "web-search",
      title: "Web Search",
      description: "Search the web using Google engine to find relevant articles and sources for fact-checking.",
      category: "search",
      method: "POST",
      endpoint: "/api/search/web",
      icon: Search,
      color: "primary",
      badge: "Search",
      features: ["Google search", "Article discovery", "Source finding", "Query processing"],
      status: "production",
      access: "public",
      responseTime: "< 3s",
      rateLimit: "200/hour",
      animation: "fadeInUp"
    },
    {
      id: "content-scraping",
      title: "Content Scraping",
      description: "Automatically scrape and extract content from news articles and web pages.",
      category: "search",
      method: "POST",
      endpoint: "/api/scrape/content",
      icon: Network,
      color: "secondary",
      badge: "Scraping",
      features: ["Content extraction", "Article parsing", "Text processing", "URL handling"],
      status: "production",
      access: "public",
      responseTime: "< 5s",
      rateLimit: "100/hour",
      animation: "fadeInUp"
    },

    // System & Monitoring Services
    {
      id: "health-check",
      title: "Health Check",
      description: "Monitor the health and status of the VeriNews API and services.",
      category: "system",
      method: "GET",
      endpoint: "/health",
      icon: Shield,
      color: "primary",
      badge: "System",
      features: ["Service status", "Health monitoring", "Uptime tracking", "Performance metrics"],
      status: "production",
      access: "public",
      responseTime: "< 100ms",
      rateLimit: "Unlimited",
      animation: "fadeInUp"
    },
    {
      id: "api-status",
      title: "API Status",
      description: "Get comprehensive status information about all API endpoints and services.",
      category: "system",
      method: "GET",
      endpoint: "/api/status",
      icon: Activity,
      color: "secondary",
      badge: "Monitoring",
      features: ["Endpoint status", "Service health", "Performance data", "System metrics"],
      status: "production",
      access: "public",
      responseTime: "< 500ms",
      rateLimit: "Unlimited",
      animation: "fadeInUp"
    }
  ];

  const filteredServices = activeTab === "all" 
    ? allServices 
    : allServices.filter(service => service.category === activeTab);

  const getStatusColor = (status: string) => {
    switch (status) {
      case "production": return "text-green-600 bg-green-100 dark:bg-green-900/20";
      case "beta": return "text-yellow-600 bg-yellow-100 dark:bg-yellow-900/20";
      case "alpha": return "text-red-600 bg-red-100 dark:bg-red-900/20";
      default: return "text-gray-600 bg-gray-100 dark:bg-gray-900/20";
    }
  };

  const getAccessIcon = (access: string) => {
    return access === "public" ? <Unlock className="h-3 w-3" /> : <Lock className="h-3 w-3" />;
  };

  const getMethodColor = (method: string) => {
    switch (method) {
      case "GET": return "bg-green-100 text-green-700 border-green-200";
      case "POST": return "bg-blue-100 text-blue-700 border-blue-200";
      case "PUT": return "bg-yellow-100 text-yellow-700 border-yellow-200";
      case "DELETE": return "bg-red-100 text-red-700 border-red-200";
      default: return "bg-gray-100 text-gray-700 border-gray-200";
    }
  };

  return (
    <div className="min-h-screen bg-background">
      <Navbar currentPage="services" />

      {/* Hero Section with Animation */}
      <section className="py-20 px-4 bg-gradient-to-br from-primary/5 via-secondary/5 to-accent/5 relative overflow-hidden">
        <div className="absolute inset-0 bg-grid-slate-100 [mask-image:linear-gradient(0deg,white,rgba(255,255,255,0.6))] dark:bg-grid-slate-700/25"></div>
        <div className="relative max-w-6xl mx-auto text-center space-y-8">
          <div className={`transition-all duration-1000 ${animateCards ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-10'}`}>
            <div className="inline-flex items-center gap-2 bg-primary/10 px-4 py-2 rounded-full text-primary font-medium mb-6">
              <Sparkles className="h-4 w-4" />
              Professional Services
            </div>
            <h1 className="text-5xl md:text-6xl font-bold text-primary-text leading-tight">
              Comprehensive
              <span className="text-primary block bg-gradient-to-r from-primary to-secondary bg-clip-text text-transparent">
                Fact-Checking Services
              </span>
          </h1>
            <p className="text-xl md:text-2xl text-muted-text max-w-3xl mx-auto leading-relaxed">
              Discover our complete suite of AI-powered services designed to combat misinformation and provide reliable fact-checking capabilities.
            </p>
          </div>
          
          {/* Stats */}
          <div className={`grid grid-cols-2 md:grid-cols-4 gap-6 max-w-4xl mx-auto transition-all duration-1000 delay-300 ${animateCards ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-10'}`}>
            <div className="text-center">
              <div className="text-3xl font-bold text-primary">15+</div>
              <div className="text-sm text-muted-text">Services</div>
            </div>
            <div className="text-center">
              <div className="text-3xl font-bold text-secondary">99.9%</div>
              <div className="text-sm text-muted-text">Uptime</div>
            </div>
            <div className="text-center">
              <div className="text-3xl font-bold text-accent">&lt;5s</div>
              <div className="text-sm text-muted-text">Response Time</div>
            </div>
            <div className="text-center">
              <div className="text-3xl font-bold text-info">Free</div>
              <div className="text-sm text-muted-text">Access</div>
            </div>
          </div>
        </div>
      </section>

      {/* Services Tabs */}
      <section className="py-16 px-4">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-bold text-primary-text mb-4">
              Explore Our Services
          </h2>
            <p className="text-lg text-muted-text max-w-2xl mx-auto">
              Choose from our comprehensive range of fact-checking and data services
            </p>
          </div>

          <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
            <TabsList className="grid w-full grid-cols-2 md:grid-cols-3 lg:grid-cols-6 mb-8">
              {serviceCategories.map((category) => {
                const Icon = category.icon;
                return (
                  <TabsTrigger 
                    key={category.id} 
                    value={category.id}
                    className="flex items-center gap-2 data-[state=active]:bg-primary data-[state=active]:text-primary-foreground"
                  >
                    <Icon className="h-4 w-4" />
                    <span className="hidden md:inline">{category.name}</span>
                    <Badge variant="secondary" className="ml-1 text-xs">
                      {category.count}
                    </Badge>
                  </TabsTrigger>
                );
              })}
            </TabsList>

            <TabsContent value={activeTab} className="mt-0">
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {filteredServices.map((service, index) => {
              const Icon = service.icon;
              return (
                    <Card 
                      key={service.id} 
                      className={`border-border shadow-lg bg-surface hover:shadow-2xl transition-all duration-500 hover:scale-[1.02] h-full flex flex-col group overflow-hidden relative ${
                        animateCards ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-10'
                      }`}
                      style={{
                        animationDelay: `${index * 100}ms`,
                        animationFillMode: 'both'
                      }}
                    >
                      {/* Gradient Border Effect */}
                      <div className="absolute inset-0 bg-gradient-to-r from-primary/20 via-secondary/20 to-accent/20 opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
                      
                      <CardHeader className="pb-4 relative z-10">
                        <div className="flex items-start justify-between mb-4">
                          <div className={`p-3 rounded-xl transition-all duration-300 group-hover:scale-110 group-hover:rotate-3 ${
                        service.color === 'primary' ? 'bg-primary/10 group-hover:bg-primary/20' :
                        service.color === 'secondary' ? 'bg-secondary/10 group-hover:bg-secondary/20' :
                        service.color === 'accent' ? 'bg-accent/10 group-hover:bg-accent/20' :
                        service.color === 'info' ? 'bg-info/10 group-hover:bg-info/20' :
                        'bg-success/10 group-hover:bg-success/20'
                      }`}>
                        <Icon className={`h-7 w-7 ${
                          service.color === 'primary' ? 'text-primary' :
                          service.color === 'secondary' ? 'text-secondary' :
                          service.color === 'accent' ? 'text-accent' :
                          service.color === 'info' ? 'text-info' :
                          'text-success'
                        }`} />
                      </div>
                          <div className="flex items-center gap-2">
                      <Badge 
                        variant="outline" 
                        className={`text-xs ${
                          service.color === 'primary' ? 'border-primary/20 bg-primary/10 text-primary' :
                          service.color === 'secondary' ? 'border-secondary/20 bg-secondary/10 text-secondary' :
                          service.color === 'accent' ? 'border-accent/20 bg-accent/10 text-accent' :
                          service.color === 'info' ? 'border-info/20 bg-info/10 text-info' :
                          'border-success/20 bg-success/10 text-success'
                        }`}
                      >
                        {service.badge}
                      </Badge>
                            <Badge 
                              variant="outline" 
                              className={`text-xs ${getStatusColor(service.status)}`}
                            >
                              {service.status}
                            </Badge>
                          </div>
                    </div>
                        
                    <CardTitle className="text-primary-text text-lg leading-tight group-hover:text-primary transition-colors">
                      {service.title}
                    </CardTitle>
                        
                        <div className="flex items-center gap-2 mt-3">
                          <Badge 
                            variant="outline" 
                            className={`text-xs font-mono ${getMethodColor(service.method)}`}
                          >
                            {service.method}
                          </Badge>
                          <code className="text-xs bg-muted/50 px-2 py-1 rounded text-muted-text font-mono">
                            {service.endpoint}
                          </code>
                        </div>
                  </CardHeader>
                      
                      <CardContent className="flex-1 flex flex-col relative z-10">
                    <CardDescription className="text-muted-text mb-6 flex-1 leading-relaxed text-sm">
                      {service.description}
                    </CardDescription>
                        
                        {/* Service Stats */}
                        <div className="grid grid-cols-2 gap-3 mb-6">
                          <div className="text-center p-2 bg-muted/30 rounded-lg">
                            <div className="text-xs text-muted-text">Response</div>
                            <div className="text-sm font-semibold text-primary-text">{service.responseTime}</div>
                          </div>
                          <div className="text-center p-2 bg-muted/30 rounded-lg">
                            <div className="text-xs text-muted-text">Rate Limit</div>
                            <div className="text-sm font-semibold text-primary-text">{service.rateLimit}</div>
                          </div>
                        </div>
                        
                        {/* Features */}
                        <div className="space-y-3">
                          <h4 className="font-semibold text-primary-text text-xs uppercase tracking-wide flex items-center gap-2">
                            <CheckCircle className="h-3 w-3" />
                            Key Features:
                          </h4>
                          <div className="space-y-2">
                        {service.features.slice(0, 3).map((feature, featureIndex) => (
                          <div key={featureIndex} className="flex items-center gap-2 text-xs text-muted-text">
                            <div className="w-1.5 h-1.5 rounded-full bg-primary/60"></div>
                            {feature}
                          </div>
                        ))}
                        {service.features.length > 3 && (
                          <div className="text-xs text-muted-text/70">
                            +{service.features.length - 3} more features
                          </div>
                        )}
                      </div>
                    </div>
                        
                        {/* Action Button */}
                        <div className="mt-6 pt-4 border-t border-border/50">
                          <Button 
                            variant="outline" 
                            size="sm" 
                            className="w-full group-hover:bg-primary group-hover:text-primary-foreground transition-all duration-300"
                            asChild
                          >
                            <a href="/playground">
                              Try Service
                              <ArrowRight className="h-3 w-3 ml-2 group-hover:translate-x-1 transition-transform" />
                            </a>
                          </Button>
                    </div>
                  </CardContent>
                </Card>
              );
            })}
          </div>
            </TabsContent>
          </Tabs>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-20 px-4 bg-gradient-to-br from-surface/50 to-background">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold text-primary-text mb-4">
              Why Choose VeriNews Services?
          </h2>
            <p className="text-lg text-muted-text max-w-2xl mx-auto">
              Professional-grade fact-checking services with enterprise-level reliability
            </p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            <div className="text-center group">
              <div className="bg-primary/10 p-4 rounded-full w-16 h-16 mx-auto mb-4 group-hover:scale-110 transition-transform duration-300">
                <Zap className="h-8 w-8 text-primary mx-auto" />
              </div>
              <h3 className="text-xl font-semibold text-primary-text mb-2">Lightning Fast</h3>
              <p className="text-muted-text">Get results in under 5 seconds with our optimized AI models and infrastructure.</p>
            </div>
            
            <div className="text-center group">
              <div className="bg-secondary/10 p-4 rounded-full w-16 h-16 mx-auto mb-4 group-hover:scale-110 transition-transform duration-300">
                <Shield className="h-8 w-8 text-secondary mx-auto" />
              </div>
              <h3 className="text-xl font-semibold text-primary-text mb-2">Enterprise Security</h3>
              <p className="text-muted-text">Bank-level security with encrypted data transmission and secure API endpoints.</p>
            </div>
            
            <div className="text-center group">
              <div className="bg-accent/10 p-4 rounded-full w-16 h-16 mx-auto mb-4 group-hover:scale-110 transition-transform duration-300">
                <Cpu className="h-8 w-8 text-accent mx-auto" />
              </div>
              <h3 className="text-xl font-semibold text-primary-text mb-2">AI-Powered</h3>
              <p className="text-muted-text">Advanced machine learning models trained on millions of verified data points.</p>
            </div>
            
            <div className="text-center group">
              <div className="bg-info/10 p-4 rounded-full w-16 h-16 mx-auto mb-4 group-hover:scale-110 transition-transform duration-300">
                <Network className="h-8 w-8 text-info mx-auto" />
              </div>
              <h3 className="text-xl font-semibold text-primary-text mb-2">Global Coverage</h3>
              <p className="text-muted-text">Access to thousands of trusted sources worldwide for comprehensive verification.</p>
            </div>
            
            <div className="text-center group">
              <div className="bg-success/10 p-4 rounded-full w-16 h-16 mx-auto mb-4 group-hover:scale-110 transition-transform duration-300">
                <TrendingUp className="h-8 w-8 text-success mx-auto" />
              </div>
              <h3 className="text-xl font-semibold text-primary-text mb-2">Scalable</h3>
              <p className="text-muted-text">Built to handle millions of requests with automatic scaling and load balancing.</p>
            </div>
            
            <div className="text-center group">
              <div className="bg-primary/10 p-4 rounded-full w-16 h-16 mx-auto mb-4 group-hover:scale-110 transition-transform duration-300">
                <Users className="h-8 w-8 text-primary mx-auto" />
              </div>
              <h3 className="text-xl font-semibold text-primary-text mb-2">Developer Friendly</h3>
              <p className="text-muted-text">Comprehensive documentation, SDKs, and support for seamless integration.</p>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 px-4 bg-gradient-to-r from-primary/10 via-secondary/10 to-accent/10">
        <div className="max-w-4xl mx-auto text-center space-y-8">
          <div className="space-y-4">
            <h2 className="text-3xl md:text-4xl font-bold text-primary-text">
              Ready to Get Started?
          </h2>
          <p className="text-xl text-muted-text">
              Explore our documentation, test our services, and join the fight against misinformation.
            </p>
          </div>
          
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Button className="bg-primary hover:bg-primary/90 text-white px-8 py-4 text-lg group" asChild>
              <a href="/playground">
                <Zap className="h-5 w-5 mr-2 group-hover:rotate-12 transition-transform" />
                Try Services Now
              </a>
            </Button>
            <Button variant="outline" className="border-border px-8 py-4 text-lg group" asChild>
              <a href="/docs">
                <FileText className="h-5 w-5 mr-2 group-hover:scale-110 transition-transform" />
                View Documentation
              </a>
            </Button>
            <Button variant="outline" className="border-border px-8 py-4 text-lg group" asChild>
              <a href="https://github.com/Al-Edrisy/fake-news-extension-2025" target="_blank" rel="noopener noreferrer">
                <Github className="h-5 w-5 mr-2 group-hover:scale-110 transition-transform" />
                <ExternalLink className="h-4 w-4 ml-1" />
                Contribute
              </a>
            </Button>
          </div>
          
          <div className="text-sm text-muted-text">
            <p>All services are free to use • No API keys required • 99.9% uptime guarantee</p>
          </div>
        </div>
      </section>
    </div>
  );
};

export default Services;