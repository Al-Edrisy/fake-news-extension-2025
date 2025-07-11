import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import Navbar from "@/components/Navbar";
import { Brain, FileText, Database, Download, Code, BarChart3, Github, Chrome, ExternalLink } from "lucide-react";

const Services = () => {

  const services = [
    {
      icon: Brain,
      title: "AI Claim Verification",
      description: "Automatically verify factual claims using advanced AI models and real-time web data scraping.",
      features: ["NLP models (LLMs)", "Multi-source verification", "Confidence scoring", "Real-time analysis"],
      color: "primary",
      badge: "AI"
    },
    {
      icon: BarChart3,
      title: "AI Text Analysis", 
      description: "Upload articles and receive structured AI-driven feedback regarding claim support or contradiction.",
      features: ["Content analysis", "Source credibility assessment", "Bias detection", "Sentiment analysis"],
      color: "secondary",
      badge: "AI"
    },
    {
      icon: Database,
      title: "Data Aggregation & Public Datasets",
      description: "Access categorized and timestamped datasets of claims, sources, verdicts, and confidence scores.",
      features: ["RESTful API", "Pagination support", "Category filtering", "Historical data"],
      color: "accent",
      badge: "Public"
    },
    {
      icon: Code,
      title: "REST API (Free Access)",
      description: "Use our comprehensive RESTful API to integrate fact-checking into your applications.",
      features: ["JSON responses", "No API keys required", "Rate limiting", "Comprehensive docs"],
      color: "success",
      badge: "Free"
    },
    {
      icon: Download,
      title: "Dataset Export to CSV",
      description: "Download raw data from database tables as CSV files for research and analysis purposes.",
      features: ["Auto-generated filenames", "Multiple table support", "Bulk data access", "Real-time export"],
      color: "info",
      badge: "Export"
    },
    {
      icon: Chrome,
      title: "Chrome Extension Integration",
      description: "Browser extension for instant fact-checking while browsing the web.",
      features: ["Context menu verification", "Popup interface", "Real-time results", "Dark mode support"],
      color: "primary",
      badge: "Extension"
    },
    {
      icon: Github,
      title: "Open Source Contributions",
      description: "Contribute to our open-source project and help improve fact-checking technology.",
      features: ["GitHub repository", "Community contributions", "Issue tracking", "Documentation"],
      color: "secondary",
      badge: "Open Source"
    }
  ];

  return (
    <div className="min-h-screen bg-background">
      <Navbar currentPage="services" />

      {/* Hero Section */}
      <section className="py-16 px-4 bg-primary/5">
        <div className="max-w-4xl mx-auto text-center space-y-6">
          <h1 className="text-4xl font-bold text-primary-text">
            Powerful AI-Driven
            <span className="text-primary block">Fact-Checking Services</span>
          </h1>
          <p className="text-xl text-muted-text max-w-2xl mx-auto">
            VeriNews provides comprehensive tools and services for combating misinformation through advanced AI analysis and data-driven insights.
          </p>
        </div>
      </section>

      {/* Services Grid */}
      <section className="py-16 px-4">
        <div className="max-w-7xl mx-auto">
          <h2 className="text-3xl font-bold text-center text-primary-text mb-12">
            Our Core Services
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {services.map((service, index) => {
              const Icon = service.icon;
              return (
                <Card key={index} className="border-border shadow-md bg-surface hover:shadow-xl transition-all duration-300 hover:scale-[1.02] h-full flex flex-col group">
                  <CardHeader className="pb-4">
                    <div className="flex items-start justify-between mb-3">
                      <div className={`p-3 rounded-xl transition-all duration-300 group-hover:scale-110 ${
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
                    </div>
                    <CardTitle className="text-primary-text text-lg leading-tight group-hover:text-primary transition-colors">
                      {service.title}
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="flex-1 flex flex-col">
                    <CardDescription className="text-muted-text mb-6 flex-1 leading-relaxed text-sm">
                      {service.description}
                    </CardDescription>
                    <div className="space-y-3 mt-auto">
                      <h4 className="font-semibold text-primary-text text-xs uppercase tracking-wide">Key Features:</h4>
                      <div className="space-y-1">
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
                  </CardContent>
                </Card>
              );
            })}
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-16 px-4 bg-surface/30">
        <div className="max-w-4xl mx-auto">
          <h2 className="text-3xl font-bold text-center text-primary-text mb-12">
            Why Choose VeriNews?
          </h2>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 lg:gap-8">
            <Card className="border-border shadow-lg bg-surface hover:shadow-xl transition-all duration-300">
              <CardHeader>
                <CardTitle className="text-primary-text flex items-center gap-3">
                  <span className="bg-gradient-to-r from-primary to-secondary text-white rounded-full w-8 h-8 flex items-center justify-center text-sm font-bold">✓</span>
                  Real-time Analysis
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-muted-text leading-relaxed">
                  Get instant verification results with our advanced AI models that process claims in real-time.
                </p>
              </CardContent>
            </Card>

            <Card className="border-border shadow-lg bg-surface hover:shadow-xl transition-all duration-300">
              <CardHeader>
                <CardTitle className="text-primary-text flex items-center gap-3">
                  <span className="bg-gradient-to-r from-primary to-secondary text-white rounded-full w-8 h-8 flex items-center justify-center text-sm font-bold">✓</span>
                  Multi-Source Verification
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-muted-text leading-relaxed">
                  Cross-reference multiple reliable sources to provide comprehensive fact-checking results.
                </p>
              </CardContent>
            </Card>

            <Card className="border-border shadow-lg bg-surface hover:shadow-xl transition-all duration-300">
              <CardHeader>
                <CardTitle className="text-primary-text flex items-center gap-3">
                  <span className="bg-gradient-to-r from-primary to-secondary text-white rounded-full w-8 h-8 flex items-center justify-center text-sm font-bold">✓</span>
                  Developer-Friendly API
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-muted-text leading-relaxed">
                  Easy-to-use RESTful API with comprehensive documentation for seamless integration.
                </p>
              </CardContent>
            </Card>

            <Card className="border-border shadow-lg bg-surface hover:shadow-xl transition-all duration-300">
              <CardHeader>
                <CardTitle className="text-primary-text flex items-center gap-3">
                  <span className="bg-gradient-to-r from-primary to-secondary text-white rounded-full w-8 h-8 flex items-center justify-center text-sm font-bold">✓</span>
                  Data Export & Analysis
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-muted-text leading-relaxed">
                  Export verified data in multiple formats for further analysis and research purposes.
                </p>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-16 px-4">
        <div className="max-w-4xl mx-auto text-center space-y-6">
          <h2 className="text-3xl font-bold text-primary-text">
            Ready to Start Fact-Checking?
          </h2>
          <p className="text-xl text-muted-text">
            Explore our documentation to get started with VeriNews services today.
          </p>
          <div className="flex gap-4 justify-center">
            <Button className="bg-primary hover:bg-secondary text-white px-8 py-3 text-lg" asChild>
              <a href="/docs">
                <FileText className="h-5 w-5 mr-2" />
                View Documentation
              </a>
            </Button>
            <Button variant="outline" className="border-border px-8 py-3 text-lg" asChild>
              <a href="https://github.com/Al-Edrisy/fake-news-extension-2025" target="_blank" rel="noopener noreferrer">
                <Github className="h-5 w-5 mr-2" />
                <ExternalLink className="h-4 w-4 ml-1" />
                Contribute on GitHub
              </a>
            </Button>
          </div>
        </div>
      </section>
    </div>
  );
};

export default Services;