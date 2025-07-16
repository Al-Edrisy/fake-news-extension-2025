
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import Navbar from "@/components/Navbar";
import { Shield, Download, Code, CheckCircle, AlertCircle, Globe, Github, Monitor, Smartphone } from "lucide-react";

const Index = () => {
  return (
    <div className="min-h-screen bg-background">
      <Navbar currentPage="home" />

      {/* Hero Section */}
      <section className="py-12 px-4 sm:px-6">
        <div className="max-w-4xl mx-auto text-center space-y-4">
          <div className="inline-flex items-center gap-2 bg-primary/10 px-3 py-1.5 rounded-full text-primary font-medium text-sm">
            <Shield className="h-3 w-3" />
            Chrome Extension & Desktop App
          </div>
          <h1 className="text-4xl sm:text-5xl font-bold text-primary-text leading-tight">
            Combat Fake News with
            <span className="text-primary block">AI-Powered Verification</span>
          </h1>
          <p className="text-lg sm:text-xl text-muted-text max-w-2xl mx-auto">
            VeriNews is a powerful tool that uses advanced AI to fact-check news claims in real-time, helping you navigate the information landscape with confidence.
          </p>
          <div className="flex flex-col sm:flex-row gap-3 justify-center pt-2">
            <Button className="bg-primary hover:bg-secondary text-white px-6 py-2.5 text-base">
              <Download className="h-4 w-4 mr-2" />
              Install Extension
            </Button>
            <Button variant="outline" className="border-border px-6 py-2.5 text-base" asChild>
              <a href="https://github.com/Al-Edrisy/fake-news-extension-2025" target="_blank" rel="noopener noreferrer">
                <Github className="h-4 w-4 mr-2" />
                Contribute
              </a>
            </Button>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-10 px-4 sm:px-6 bg-surface/30">
        <div className="max-w-6xl mx-auto">
          <h2 className="text-2xl sm:text-3xl font-bold text-center text-primary-text mb-8">
            Powerful Features for News Verification
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <Card className="border-border shadow-lg bg-surface">
              <CardHeader className="pb-3">
                <CheckCircle className="h-10 w-10 text-accent mb-3" />
                <CardTitle className="text-primary-text text-lg">Real-time Fact Checking</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-muted-text text-sm">
                  Instantly verify news claims with AI-powered analysis that cross-references multiple reliable sources.
                </p>
              </CardContent>
            </Card>

            <Card className="border-border shadow-lg bg-surface">
              <CardHeader className="pb-3">
                <Globe className="h-10 w-10 text-primary mb-3" />
                <CardTitle className="text-primary-text text-lg">Source Analysis</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-muted-text text-sm">
                  Get detailed credibility scores and analysis of news sources to make informed decisions.
                </p>
              </CardContent>
            </Card>

            <Card className="border-border shadow-lg bg-surface">
              <CardHeader className="pb-3">
                <AlertCircle className="h-10 w-10 text-secondary mb-3" />
                <CardTitle className="text-primary-text text-lg">Confidence Scoring</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-muted-text text-sm">
                  Receive confidence percentages and detailed explanations for each fact-check result.
                </p>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* Platform Options */}
      <section className="py-10 px-4 sm:px-6">
        <div className="max-w-4xl mx-auto">
          <h2 className="text-2xl sm:text-3xl font-bold text-center text-primary-text mb-8">
            Choose Your Platform
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <Card className="border-border shadow-lg bg-surface">
              <CardHeader className="pb-3">
                <div className="flex items-center gap-3">
                  <Monitor className="h-8 w-8 text-primary" />
                  <CardTitle className="text-primary-text text-lg">Browser Extension</CardTitle>
                </div>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="flex items-center gap-2">
                  <CheckCircle className="h-4 w-4 text-green-500" />
                  <span className="text-sm text-muted-text">Real-time browsing integration</span>
                </div>
                <div className="flex items-center gap-2">
                  <CheckCircle className="h-4 w-4 text-green-500" />
                  <span className="text-sm text-muted-text">Instant fact-checking</span>
                </div>
                <div className="flex items-center gap-2">
                  <CheckCircle className="h-4 w-4 text-green-500" />
                  <span className="text-sm text-muted-text">Cross-platform compatibility</span>
                </div>
                <Button className="w-full mt-4">
                  <Download className="h-4 w-4 mr-2" />
                  Install Extension
                </Button>
              </CardContent>
            </Card>

            <Card className="border-border shadow-lg bg-surface">
              <CardHeader className="pb-3">
                <div className="flex items-center gap-3">
                  <Smartphone className="h-8 w-8 text-secondary" />
                  <CardTitle className="text-primary-text text-lg">Desktop App</CardTitle>
                </div>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="flex items-center gap-2">
                  <CheckCircle className="h-4 w-4 text-green-500" />
                  <span className="text-sm text-muted-text">Native desktop experience</span>
                </div>
                <div className="flex items-center gap-2">
                  <CheckCircle className="h-4 w-4 text-green-500" />
                  <span className="text-sm text-muted-text">Offline capabilities</span>
                </div>
                <div className="flex items-center gap-2">
                  <CheckCircle className="h-4 w-4 text-green-500" />
                  <span className="text-sm text-muted-text">Advanced analysis features</span>
                </div>
                <Button variant="outline" className="w-full mt-4">
                  <Monitor className="h-4 w-4 mr-2" />
                  Install Desktop App
                </Button>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* How to Use Section */}
      <section className="py-10 px-4 sm:px-6 bg-surface/30">
        <div className="max-w-4xl mx-auto">
          <h2 className="text-2xl sm:text-3xl font-bold text-center text-primary-text mb-8">
            How to Use VeriNews
          </h2>
          
          <div className="space-y-6">
            <Card className="border-border shadow-lg bg-surface">
              <CardHeader className="pb-3">
                <CardTitle className="text-primary-text flex items-center gap-2 text-lg">
                  <span className="bg-primary text-white rounded-full w-6 h-6 flex items-center justify-center text-sm">1</span>
                  Install the Extension
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-muted-text text-sm">
                  Download and install the VeriNews Chrome extension from the Chrome Web Store or use the PWA version.
                </p>
              </CardContent>
            </Card>

            <Card className="border-border shadow-lg bg-surface">
              <CardHeader className="pb-3">
                <CardTitle className="text-primary-text flex items-center gap-2 text-lg">
                  <span className="bg-primary text-white rounded-full w-6 h-6 flex items-center justify-center text-sm">2</span>
                  Send a Claim for Verification
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  <p className="text-muted-text text-sm">
                    Send a JSON request with the claim you want to verify:
                  </p>
                  <div className="bg-background border border-border rounded-lg p-3">
                    <h4 className="font-semibold text-primary-text mb-2 text-sm">Request Format:</h4>
                    <pre className="text-xs text-muted-text overflow-x-auto">
{`{
  "claim": "SpaceX launched a new internet satellite with fast speed."
}`}
                    </pre>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="border-border shadow-lg bg-surface">
              <CardHeader className="pb-3">
                <CardTitle className="text-primary-text flex items-center gap-2 text-lg">
                  <span className="bg-primary text-white rounded-full w-6 h-6 flex items-center justify-center text-sm">3</span>
                  Get Detailed Analysis
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  <p className="text-muted-text text-sm">
                    Receive comprehensive analysis with verdict, confidence score, and source verification:
                  </p>
                  <div className="bg-background border border-border rounded-lg p-3 max-h-48 overflow-y-auto">
                    <h4 className="font-semibold text-primary-text mb-2 text-sm">Response Structure:</h4>
                    <pre className="text-xs text-muted-text">
{`{
  "category": "science",
  "confidence": 82.5,
  "verdict": "True",
  "explanation": "Based on 2 relevant sources...",
  "sources": [...]
}`}
                    </pre>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-10 px-4 sm:px-6 bg-primary/5">
        <div className="max-w-4xl mx-auto text-center space-y-4">
          <h2 className="text-2xl sm:text-3xl font-bold text-primary-text">
            Start Fighting Misinformation Today
          </h2>
          <p className="text-lg text-muted-text">
            Join thousands of users who trust VeriNews to help them navigate the complex world of online information.
          </p>
          <div className="flex flex-col sm:flex-row gap-3 justify-center pt-2">
            <Button className="bg-primary hover:bg-secondary text-white px-6 py-2.5 text-base">
              <Download className="h-4 w-4 mr-2" />
              Get VeriNews Now
            </Button>
            <Button variant="outline" className="border-border px-6 py-2.5 text-base" asChild>
              <a href="https://github.com/Al-Edrisy/fake-news-extension-2025" target="_blank" rel="noopener noreferrer">
                <Code className="h-4 w-4 mr-2" />
                View Source Code
              </a>
            </Button>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-border bg-surface/50 py-6 px-4">
        <div className="max-w-6xl mx-auto text-center">
          <div className="flex items-center justify-center gap-2 mb-3">
            <Shield className="h-5 w-5 text-primary" />
            <span className="text-base font-semibold text-primary-text">VeriNews</span>
          </div>
          <p className="text-muted-text text-sm">
            AI-powered news verification for a more informed world.
          </p>
          <div className="mt-3">
            <Button variant="ghost" className="text-muted-text hover:text-primary-text text-sm" asChild>
              <a href="https://github.com/Al-Edrisy/fake-news-extension-2025" target="_blank" rel="noopener noreferrer">
                <Github className="h-3 w-3 mr-2" />
                Contribute on GitHub
              </a>
            </Button>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default Index;
