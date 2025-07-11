
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import Navbar from "@/components/Navbar";
import { Shield, Download, Code, CheckCircle, AlertCircle, Globe, Github } from "lucide-react";

const Index = () => {
  return (
    <div className="min-h-screen bg-background">
      <Navbar currentPage="home" />

      {/* Hero Section */}
      <section className="py-20 px-4">
        <div className="max-w-4xl mx-auto text-center space-y-6">
          <div className="inline-flex items-center gap-2 bg-primary/10 px-4 py-2 rounded-full text-primary font-medium">
            <Shield className="h-4 w-4" />
            Chrome Extension
          </div>
          <h1 className="text-5xl font-bold text-primary-text leading-tight">
            Combat Fake News with
            <span className="text-primary block">AI-Powered Verification</span>
          </h1>
          <p className="text-xl text-muted-text max-w-2xl mx-auto">
            VeriNews is a powerful Chrome extension that uses advanced AI to fact-check news claims in real-time, helping you navigate the information landscape with confidence.
          </p>
          <div className="flex gap-4 justify-center">
            <Button className="bg-primary hover:bg-secondary text-white px-8 py-3 text-lg">
              <Download className="h-5 w-5 mr-2" />
              Install Extension
            </Button>
            <Button variant="outline" className="border-border px-8 py-3 text-lg" asChild>
              <a href="https://github.com/Al-Edrisy/fake-news-extension-2025" target="_blank" rel="noopener noreferrer">
                <Github className="h-5 w-5 mr-2" />
                Contribute
              </a>
            </Button>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-16 px-4 bg-surface/30">
        <div className="max-w-6xl mx-auto">
          <h2 className="text-3xl font-bold text-center text-primary-text mb-12">
            Powerful Features for News Verification
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <Card className="border-border shadow-lg bg-surface">
              <CardHeader>
                <CheckCircle className="h-12 w-12 text-accent mb-4" />
                <CardTitle className="text-primary-text">Real-time Fact Checking</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-muted-text">
                  Instantly verify news claims with AI-powered analysis that cross-references multiple reliable sources.
                </p>
              </CardContent>
            </Card>

            <Card className="border-border shadow-lg bg-surface">
              <CardHeader>
                <Globe className="h-12 w-12 text-primary mb-4" />
                <CardTitle className="text-primary-text">Source Analysis</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-muted-text">
                  Get detailed credibility scores and analysis of news sources to make informed decisions.
                </p>
              </CardContent>
            </Card>

            <Card className="border-border shadow-lg bg-surface">
              <CardHeader>
                <AlertCircle className="h-12 w-12 text-secondary mb-4" />
                <CardTitle className="text-primary-text">Confidence Scoring</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-muted-text">
                  Receive confidence percentages and detailed explanations for each fact-check result.
                </p>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* How to Use Section */}
      <section className="py-16 px-4">
        <div className="max-w-4xl mx-auto">
          <h2 className="text-3xl font-bold text-center text-primary-text mb-12">
            How to Use VeriNews
          </h2>
          
          <div className="space-y-8">
            <Card className="border-border shadow-lg bg-surface">
              <CardHeader>
                <CardTitle className="text-primary-text flex items-center gap-2">
                  <span className="bg-primary text-white rounded-full w-6 h-6 flex items-center justify-center text-sm">1</span>
                  Install the Extension
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-muted-text">
                  Download and install the VeriNews Chrome extension from the Chrome Web Store.
                </p>
              </CardContent>
            </Card>

            <Card className="border-border shadow-lg bg-surface">
              <CardHeader>
                <CardTitle className="text-primary-text flex items-center gap-2">
                  <span className="bg-primary text-white rounded-full w-6 h-6 flex items-center justify-center text-sm">2</span>
                  Send a Claim for Verification
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <p className="text-muted-text">
                    Send a JSON request with the claim you want to verify:
                  </p>
                  <div className="bg-background border border-border rounded-lg p-4">
                    <h4 className="font-semibold text-primary-text mb-2">Request Format:</h4>
                    <pre className="text-sm text-muted-text overflow-x-auto">
{`{
  "claim": "SpaceX launched a new internet satellite with fast speed."
}`}
                    </pre>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="border-border shadow-lg bg-surface">
              <CardHeader>
                <CardTitle className="text-primary-text flex items-center gap-2">
                  <span className="bg-primary text-white rounded-full w-6 h-6 flex items-center justify-center text-sm">3</span>
                  Get Detailed Analysis
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <p className="text-muted-text">
                    Receive comprehensive analysis with verdict, confidence score, and source verification:
                  </p>
                  <div className="bg-background border border-border rounded-lg p-4 max-h-64 overflow-y-auto">
                    <h4 className="font-semibold text-primary-text mb-2">Response Structure:</h4>
                    <pre className="text-xs text-muted-text">
{`{
  "category": "science",
  "claim_id": "a9450133-7e68-4e84-a9d8-9c0be0de14a7",
  "confidence": 82.5,
  "explanation": "Regarding 'SpaceX launched a new internet satellite with fast speed.', the verdict is 'True' based on 2 relevant sources.",
  "verdict": "True",
  "status": "success",
  "sources": [
    {
      "confidence": 95.0,
      "support": "True",
      "title": "SpaceX Just Launched The First 60 of Nearly 12,000 High-Speed Internet Satellites",
      "url": "https://www.sciencealert.com/spacex-launched-the-first-60-of-nearly-12-000-planned-high-speed-internet-satellites",
      "snippet": "SpaceX, the rocket company founded by Elon Musk, successfully launched its first five dozen Starlink telecommunications satellites...",
      "reason": "The article directly mentions the launch of high-speed internet satellites by SpaceX."
    }
  ]
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
      <section className="py-16 px-4 bg-primary/5">
        <div className="max-w-4xl mx-auto text-center space-y-6">
          <h2 className="text-3xl font-bold text-primary-text">
            Start Fighting Misinformation Today
          </h2>
          <p className="text-xl text-muted-text">
            Join thousands of users who trust VeriNews to help them navigate the complex world of online information.
          </p>
          <div className="flex gap-4 justify-center">
            <Button className="bg-primary hover:bg-secondary text-white px-8 py-3 text-lg">
              <Download className="h-5 w-5 mr-2" />
              Get VeriNews Now
            </Button>
            <Button variant="outline" className="border-border px-8 py-3 text-lg" asChild>
              <a href="https://github.com/Al-Edrisy/fake-news-extension-2025" target="_blank" rel="noopener noreferrer">
                <Code className="h-5 w-5 mr-2" />
                View Source Code
              </a>
            </Button>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-border bg-surface/50 py-8 px-4">
        <div className="max-w-6xl mx-auto text-center">
          <div className="flex items-center justify-center gap-2 mb-4">
            <Shield className="h-6 w-6 text-primary" />
            <span className="text-lg font-semibold text-primary-text">VeriNews</span>
          </div>
          <p className="text-muted-text">
            AI-powered news verification for a more informed world.
          </p>
          <div className="mt-4">
            <Button variant="ghost" className="text-muted-text hover:text-primary-text" asChild>
              <a href="https://github.com/Al-Edrisy/fake-news-extension-2025" target="_blank" rel="noopener noreferrer">
                <Github className="h-4 w-4 mr-2" />
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
