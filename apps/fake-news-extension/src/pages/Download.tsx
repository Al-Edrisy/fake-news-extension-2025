import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Separator } from "@/components/ui/separator";
import { ScrollArea } from "@/components/ui/scroll-area";
import Navbar from "@/components/Navbar";
import { config } from "@/utils/config";
import { 
  Shield, 
  Download as DownloadIcon, 
  Code, 
  CheckCircle, 
  AlertCircle, 
  Globe, 
  Github, 
  Chrome,
  Smartphone,
  Monitor,
  Zap,
  ExternalLink,
  ArrowRight,
  Star,
  Sparkles,
  Users,
  Cpu,
  Network,
  FileText,
  Settings,
  Play,
  Terminal,
  Package,
  Copy,
  Link,
  Search
} from "lucide-react";
import { useState } from "react";

const Download = () => {
  const [activeTab, setActiveTab] = useState("pwa");
  const [copied, setCopied] = useState("");

  const copyToClipboard = (text: string, type: string) => {
    navigator.clipboard.writeText(text);
    setCopied(type);
    setTimeout(() => setCopied(""), 2000);
  };

  const platforms = [
    {
      id: "pwa",
      name: "Desktop App",
      icon: Smartphone,
      description: "Install as a desktop app on your device",
      badge: "Recommended",
      color: "primary"
    },
    {
      id: "web",
      name: "Web Application",
      icon: Globe,
      description: "Use directly in your browser",
      badge: "Instant",
      color: "secondary"
    },
    {
      id: "extension",
      name: "Chrome Extension",
      icon: Chrome,
      description: "Browser extension for real-time fact-checking",
      badge: "Popular",
      color: "accent"
    },
    {
      id: "api",
      name: "API Integration",
      icon: Code,
      description: "Integrate into your own applications",
      badge: "Developer",
      color: "info"
    }
  ];

  const installationSteps = {
    pwa: [
      {
        step: 1,
        title: "Open the Desktop App Page",
        description: "Navigate to the VeriNews desktop app page in your browser",
        code: "http://localhost:5173/",
        icon: Globe
      },
      {
        step: 2,
        title: "Click Install",
        description: "Look for the install button in your browser's address bar or menu",
        code: "Click 'Install' or 'Add to Desktop'",
        icon: DownloadIcon
      },
      {
        step: 3,
        title: "Confirm Installation",
        description: "Follow the prompts to install the Desktop App on your device",
        code: "Confirm the installation in the popup dialog",
        icon: CheckCircle
      },
      {
        step: 4,
        title: "Launch from Desktop",
        description: "The app will now appear on your desktop like a native app",
        code: "Double-click the VeriNews icon to launch",
        icon: Play
      }
    ],
    web: [
      {
        step: 1,
        title: "Open Your Browser",
        description: "Use any modern web browser (Chrome, Firefox, Safari, Edge)",
        code: "Open your preferred browser",
        icon: Globe
      },
      {
        step: 2,
        title: "Navigate to VeriNews",
        description: "Go to the VeriNews web application",
        code: "http://localhost:5173/",
        icon: Link
      },
      {
        step: 3,
        title: "Start Using",
        description: "No installation required - start fact-checking immediately",
        code: "Begin analyzing claims right away",
        icon: Play
      }
    ],
    extension: [
      {
        step: 1,
        title: "Open Chrome Web Store",
        description: "Navigate to the Chrome Web Store",
        code: "https://chrome.google.com/webstore",
        icon: Chrome
      },
      {
        step: 2,
        title: "Search for VeriNews",
        description: "Search for 'VeriNews Fact Checker' in the store",
        code: "Search: 'VeriNews Fact Checker'",
        icon: Search
      },
      {
        step: 3,
        title: "Click Add to Chrome",
        description: "Click the 'Add to Chrome' button to install the extension",
        code: "Click 'Add to Chrome' button",
        icon: DownloadIcon
      },
      {
        step: 4,
        title: "Confirm Installation",
        description: "Confirm the installation in the popup dialog",
        code: "Click 'Add extension' in the dialog",
        icon: CheckCircle
      },
      {
        step: 5,
        title: "Start Fact-Checking",
        description: "The extension icon will appear in your browser toolbar",
        code: "Click the VeriNews icon to start",
        icon: Play
      }
    ],
    api: [
      {
        step: 1,
        title: "Get API Base URL",
        description: "Use the VeriNews API base URL for your requests",
        code: config.apiBaseUrl,
        icon: Link
      },
      {
        step: 2,
        title: "Choose Your Language",
        description: "Select your preferred programming language",
        code: "JavaScript, Python, cURL, etc.",
        icon: Code
      },
      {
        step: 3,
        title: "Make API Calls",
        description: "Start making requests to the VeriNews API endpoints",
        code: `curl -X POST "${config.apiBaseUrl}/api/claims/verify" \\
  -H "Content-Type: application/json" \\
  -d '{"claim": "Your claim here"}'`,
        icon: Terminal
      },
      {
        step: 4,
        title: "Integrate into Your App",
        description: "Use the API responses in your own applications",
        code: "Handle JSON responses in your code",
        icon: Package
      }
    ]
  };

  const platformFeatures = {
    pwa: [
      "Native app experience",
      "Offline capabilities",
      "Push notifications",
      "Home screen installation",
      "Cross-platform compatibility",
      "Automatic updates"
    ],
    web: [
      "No installation required",
      "Instant access",
      "Cross-browser compatibility",
      "Always up-to-date",
      "No storage space needed",
      "Works on any device"
    ],
    extension: [
      "Real-time fact-checking",
      "Browser integration",
      "Context menu access",
      "Popup interface",
      "Background processing",
      "Cross-tab functionality"
    ],
    api: [
      "RESTful API",
      "JSON responses",
      "No API keys required",
      "Rate limiting",
      "Comprehensive documentation",
      "Multiple endpoints"
    ]
  };

  return (
    <div className="min-h-screen bg-background">
      <Navbar currentPage="download" />

      {/* Hero Section */}
      <section className="py-20 px-6 bg-gradient-to-br from-primary/5 via-secondary/5 to-accent/5 relative overflow-hidden">
        <div className="absolute inset-0 bg-grid-slate-100 [mask-image:linear-gradient(0deg,white,rgba(255,255,255,0.6))] dark:bg-grid-slate-700/25"></div>
        <div className="relative max-w-6xl mx-auto text-center space-y-8">
          <div className="space-y-6">
            <div className="inline-flex items-center gap-2 bg-primary/10 px-4 py-2 rounded-full text-primary font-medium">
              <DownloadIcon className="h-4 w-4" />
              Get VeriNews
            </div>
            <h1 className="text-5xl md:text-6xl font-bold text-primary-text leading-tight">
              Choose Your
              <span className="text-primary block bg-gradient-to-r from-primary to-secondary bg-clip-text text-transparent">
                Platform
              </span>
            </h1>
            <p className="text-xl md:text-2xl text-muted-text max-w-3xl mx-auto leading-relaxed">
              Access VeriNews fact-checking capabilities through multiple platforms. 
              From browser extensions to API integrations, find the perfect way to combat misinformation.
            </p>
          </div>
          
          {/* Platform Stats */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6 max-w-4xl mx-auto">
            <div className="text-center">
              <div className="text-3xl font-bold text-primary">4</div>
              <div className="text-sm text-muted-text">Platforms</div>
            </div>
            <div className="text-center">
              <div className="text-3xl font-bold text-secondary">100%</div>
              <div className="text-sm text-muted-text">Free</div>
            </div>
            <div className="text-center">
              <div className="text-3xl font-bold text-accent">24/7</div>
              <div className="text-sm text-muted-text">Available</div>
            </div>
            <div className="text-center">
              <div className="text-3xl font-bold text-info">∞</div>
              <div className="text-sm text-muted-text">Possibilities</div>
            </div>
          </div>
        </div>
      </section>

      {/* Platform Selection */}
      <section className="py-16 px-6">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-bold text-primary-text mb-4">
              How Would You Like to Use VeriNews?
            </h2>
            <p className="text-lg text-muted-text max-w-2xl mx-auto">
              Select your preferred platform and follow the installation guide
            </p>
          </div>

          <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
            <TabsList className="grid w-full grid-cols-2 md:grid-cols-4 mb-8">
              {platforms.map((platform) => {
                const Icon = platform.icon;
                return (
                  <TabsTrigger 
                    key={platform.id} 
                    value={platform.id}
                    className="flex items-center gap-2 data-[state=active]:bg-primary data-[state=active]:text-primary-foreground"
                  >
                    <Icon className="h-4 w-4" />
                    <span className="hidden md:inline">{platform.name}</span>
                    <Badge variant="secondary" className="ml-1 text-xs">
                      {platform.badge}
                    </Badge>
                  </TabsTrigger>
                );
              })}
            </TabsList>

            {platforms.map((platform) => {
              const Icon = platform.icon;
              const steps = installationSteps[platform.id as keyof typeof installationSteps];
              const features = platformFeatures[platform.id as keyof typeof platformFeatures];
              
              return (
                <TabsContent key={platform.id} value={platform.id} className="mt-0">
                  <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                    {/* Installation Steps */}
                    <Card className="border-border shadow-lg bg-surface">
                      <CardHeader>
                        <div className="flex items-center gap-3">
                          <div className={`p-3 rounded-xl bg-${platform.color}/10`}>
                            <Icon className={`h-6 w-6 text-${platform.color}`} />
                          </div>
                          <div>
                            <CardTitle className="text-primary-text">{platform.name}</CardTitle>
                            <CardDescription>{platform.description}</CardDescription>
                          </div>
                        </div>
                      </CardHeader>
                      <CardContent>
                        <div className="space-y-6">
                          {steps.map((step, index) => {
                            const StepIcon = step.icon;
                            return (
                              <div key={index} className="flex gap-4">
                                <div className="flex-shrink-0">
                                  <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center">
                                    <span className="text-sm font-semibold text-primary">{step.step}</span>
                                  </div>
                                </div>
                                <div className="flex-1 space-y-2">
                                  <div className="flex items-center gap-2">
                                    <StepIcon className="h-4 w-4 text-muted-text" />
                                    <h4 className="font-semibold text-primary-text">{step.title}</h4>
                                  </div>
                                  <p className="text-sm text-muted-text">{step.description}</p>
                                  <div className="relative">
                                    <div className="bg-muted/50 p-3 rounded-lg">
                                      <code className="text-xs text-muted-text break-all">{step.code}</code>
                                    </div>
                                    <Button
                                      variant="ghost"
                                      size="sm"
                                      className="absolute top-1 right-1 h-6 w-6 p-0"
                                      onClick={() => copyToClipboard(step.code, `${platform.id}-${index}`)}
                                    >
                                      <Copy className="h-3 w-3" />
                                    </Button>
                                    {copied === `${platform.id}-${index}` && (
                                      <div className="absolute top-1 right-8 text-xs text-green-600">
                                        Copied!
                                      </div>
                                    )}
                                  </div>
                                </div>
                              </div>
                            );
                          })}
                        </div>
                      </CardContent>
                    </Card>

                    {/* Features */}
                    <Card className="border-border shadow-lg bg-surface">
                      <CardHeader>
                        <CardTitle className="text-primary-text flex items-center gap-2">
                          <Star className="h-5 w-5" />
                          Key Features
                        </CardTitle>
                        <CardDescription>
                          What makes {platform.name} special
                        </CardDescription>
                      </CardHeader>
                      <CardContent>
                        <div className="space-y-3">
                          {features.map((feature, index) => (
                            <div key={index} className="flex items-center gap-3">
                              <CheckCircle className="h-4 w-4 text-green-500 flex-shrink-0" />
                              <span className="text-sm text-muted-text">{feature}</span>
                            </div>
                          ))}
                        </div>
                        
                        <Separator className="my-6" />
                        
                        {/* Quick Actions */}
                        <div className="space-y-3">
                          <h4 className="font-semibold text-primary-text">Quick Actions</h4>
                          <div className="grid grid-cols-1 gap-2">
                            {platform.id === "pwa" && (
                              <Button className="w-full" asChild>
                                <a href="http://localhost:5173/" target="_blank">
                                  <Globe className="h-4 w-4 mr-2" />
                                  Open Web App
                                </a>
                              </Button>
                            )}
                            {platform.id === "web" && (
                              <Button className="w-full" asChild>
                                <a href="http://localhost:5173/" target="_blank">
                                  <Globe className="h-4 w-4 mr-2" />
                                  Launch Web App
                                </a>
                              </Button>
                            )}
                            {platform.id === "extension" && (
                              <Button className="w-full" asChild>
                                <a href="https://chrome.google.com/webstore" target="_blank" rel="noopener noreferrer">
                                  <Chrome className="h-4 w-4 mr-2" />
                                  <ExternalLink className="h-4 w-4 mr-2" />
                                  Chrome Web Store
                                </a>
                              </Button>
                            )}
                            {platform.id === "api" && (
                              <Button className="w-full" asChild>
                                <a href="/playground" target="_blank">
                                  <Terminal className="h-4 w-4 mr-2" />
                                  Try API Playground
                                </a>
                              </Button>
                            )}
                            <Button variant="outline" className="w-full" asChild>
                              <a href="/docs" target="_blank">
                                <FileText className="h-4 w-4 mr-2" />
                                View Documentation
                              </a>
                            </Button>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  </div>
                </TabsContent>
              );
            })}
          </Tabs>
        </div>
      </section>

      {/* Platform Comparison */}
      <section className="py-16 px-6 bg-surface/30">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-bold text-primary-text mb-4">
              Platform Comparison
            </h2>
            <p className="text-lg text-muted-text max-w-2xl mx-auto">
              Compare features across all available platforms
            </p>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full border-collapse">
              <thead>
                <tr className="border-b border-border">
                  <th className="text-left p-4 font-semibold text-primary-text">Feature</th>
                  {platforms.map((platform) => (
                    <th key={platform.id} className="text-center p-4 font-semibold text-primary-text">
                      <div className="flex items-center justify-center gap-2">
                        <platform.icon className="h-5 w-5" />
                        <span className="hidden md:inline">{platform.name}</span>
                      </div>
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                <tr className="border-b border-border/50">
                  <td className="p-4 font-medium text-primary-text">Installation</td>
                  <td className="p-4 text-center">
                    <Badge variant="outline" className="bg-green-50 text-green-700 border-green-200">Easy</Badge>
                  </td>
                  <td className="p-4 text-center">
                    <Badge variant="outline" className="bg-blue-50 text-blue-700 border-blue-200">None</Badge>
                  </td>
                  <td className="p-4 text-center">
                    <Badge variant="outline" className="bg-yellow-50 text-yellow-700 border-yellow-200">Store</Badge>
                  </td>
                  <td className="p-4 text-center">
                    <Badge variant="outline" className="bg-purple-50 text-purple-700 border-purple-200">Code</Badge>
                  </td>
                </tr>
                <tr className="border-b border-border/50">
                  <td className="p-4 font-medium text-primary-text">Offline Support</td>
                  <td className="p-4 text-center">
                    <CheckCircle className="h-5 w-5 text-green-500 mx-auto" />
                  </td>
                  <td className="p-4 text-center">
                    <AlertCircle className="h-5 w-5 text-red-500 mx-auto" />
                  </td>
                  <td className="p-4 text-center">
                    <CheckCircle className="h-5 w-5 text-green-500 mx-auto" />
                  </td>
                  <td className="p-4 text-center">
                    <AlertCircle className="h-5 w-5 text-red-500 mx-auto" />
                  </td>
                </tr>
                <tr className="border-b border-border/50">
                  <td className="p-4 font-medium text-primary-text">Real-time Integration</td>
                  <td className="p-4 text-center">
                    <CheckCircle className="h-5 w-5 text-green-500 mx-auto" />
                  </td>
                  <td className="p-4 text-center">
                    <CheckCircle className="h-5 w-5 text-green-500 mx-auto" />
                  </td>
                  <td className="p-4 text-center">
                    <CheckCircle className="h-5 w-5 text-green-500 mx-auto" />
                  </td>
                  <td className="p-4 text-center">
                    <CheckCircle className="h-5 w-5 text-green-500 mx-auto" />
                  </td>
                </tr>
                <tr className="border-b border-border/50">
                  <td className="p-4 font-medium text-primary-text">Cross-platform</td>
                  <td className="p-4 text-center">
                    <CheckCircle className="h-5 w-5 text-green-500 mx-auto" />
                  </td>
                  <td className="p-4 text-center">
                    <CheckCircle className="h-5 w-5 text-green-500 mx-auto" />
                  </td>
                  <td className="p-4 text-center">
                    <AlertCircle className="h-5 w-5 text-yellow-500 mx-auto" />
                  </td>
                  <td className="p-4 text-center">
                    <CheckCircle className="h-5 w-5 text-green-500 mx-auto" />
                  </td>
                </tr>
                <tr className="border-b border-border/50">
                  <td className="p-4 font-medium text-primary-text">Developer Friendly</td>
                  <td className="p-4 text-center">
                    <CheckCircle className="h-5 w-5 text-green-500 mx-auto" />
                  </td>
                  <td className="p-4 text-center">
                    <CheckCircle className="h-5 w-5 text-green-500 mx-auto" />
                  </td>
                  <td className="p-4 text-center">
                    <AlertCircle className="h-5 w-5 text-yellow-500 mx-auto" />
                  </td>
                  <td className="p-4 text-center">
                    <CheckCircle className="h-5 w-5 text-green-500 mx-auto" />
                  </td>
                </tr>
                <tr>
                  <td className="p-4 font-medium text-primary-text">Best For</td>
                  <td className="p-4 text-center text-sm text-muted-text">Mobile & Desktop Users</td>
                  <td className="p-4 text-center text-sm text-muted-text">Quick Access</td>
                  <td className="p-4 text-center text-sm text-muted-text">Browser Integration</td>
                  <td className="p-4 text-center text-sm text-muted-text">Developers & Apps</td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 px-6 bg-gradient-to-r from-primary/10 via-secondary/10 to-accent/10">
        <div className="max-w-4xl mx-auto text-center space-y-8">
          <div className="space-y-4">
            <h2 className="text-3xl md:text-4xl font-bold text-primary-text">
              Ready to Start Fact-Checking?
            </h2>
            <p className="text-xl text-muted-text">
              Choose your preferred platform and join the fight against misinformation today.
            </p>
          </div>
          
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Button className="bg-primary hover:bg-primary/90 text-white px-8 py-4 text-lg group" asChild>
              <a href="/">
                <Globe className="h-5 w-5 mr-2 group-hover:scale-110 transition-transform" />
                Try Web App Now
              </a>
            </Button>
            <Button variant="outline" className="border-border px-8 py-4 text-lg group" asChild>
              <a href="/playground">
                <Terminal className="h-5 w-5 mr-2 group-hover:scale-110 transition-transform" />
                API Playground
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
            <p>All platforms are free to use • No registration required • 99.9% uptime guarantee</p>
          </div>
        </div>
      </section>
    </div>
  );
};

export default Download;