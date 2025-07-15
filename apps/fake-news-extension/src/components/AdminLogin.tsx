
import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Lock, Moon, Sun, Shield, AlertCircle, CheckCircle, Loader2, Zap } from 'lucide-react';
import { useTheme } from "next-themes";
import { adminApi } from '@/services/adminApi';
import { useToast } from "@/hooks/use-toast";

interface AdminLoginProps {
  onLogin: () => void;
}

const AdminLogin = ({ onLogin }: AdminLoginProps) => {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [apiStatus, setApiStatus] = useState<'checking' | 'online' | 'offline'>('checking');
  const { theme, setTheme } = useTheme();
  const { toast } = useToast();

  useEffect(() => {
    checkApiHealth();
  }, []);

  const checkApiHealth = async () => {
    try {
      await adminApi.getHealthCheck();
      setApiStatus('online');
    } catch (error) {
      setApiStatus('offline');
      console.error('API health check failed:', error);
    }
  };

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError('');

    try {
      if (apiStatus === 'offline') {
        throw new Error('Backend service is offline. Please check the server connection.');
      }

      if (username === 'admin' && password === 'admin') {
        await adminApi.getHealthCheck();
        
        onLogin();
        toast({
          title: "Login Successful",
          description: "Welcome to the Admin Dashboard",
        });
      } else {
        throw new Error('Invalid credentials. Use admin/admin for demo.');
      }
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Login failed';
      setError(errorMessage);
      toast({
        title: "Login Failed",
        description: errorMessage,
        variant: "destructive"
      });
    } finally {
      setIsLoading(false);
    }
  };

  const getApiStatusIcon = () => {
    switch (apiStatus) {
      case 'checking':
        return <Loader2 className="h-4 w-4 animate-spin text-yellow-500" />;
      case 'online':
        return <CheckCircle className="h-4 w-4 text-green-500" />;
      case 'offline':
        return <AlertCircle className="h-4 w-4 text-red-500" />;
    }
  };

  const getApiStatusText = () => {
    switch (apiStatus) {
      case 'checking':
        return 'Checking connection...';
      case 'online':
        return 'Backend connected';
      case 'offline':
        return 'Backend offline';
    }
  };

  return (
    <div className="min-h-screen bg-background flex items-center justify-center p-4">
      {/* Theme Toggle */}
      <div className="absolute top-6 right-6">
        <Button
          variant="outline"
          size="icon"
          onClick={() => setTheme(theme === "dark" ? "light" : "dark")}
          className="bg-card"
        >
          <Sun className="h-[1.2rem] w-[1.2rem] rotate-0 scale-100 transition-all dark:-rotate-90 dark:scale-0" />
          <Moon className="absolute h-[1.2rem] w-[1.2rem] rotate-90 scale-0 transition-all dark:rotate-0 dark:scale-100" />
          <span className="sr-only">Toggle theme</span>
        </Button>
      </div>

      <div className="w-full max-w-md space-y-6">
        {/* Header */}
        <div className="text-center space-y-4">
          <div className="flex items-center justify-center">
            <div className="p-4 bg-primary rounded-3xl shadow-2xl">
              <Shield className="h-12 w-12 text-primary-foreground" />
            </div>
          </div>
          <div className="space-y-2">
            <h1 className="text-3xl font-bold">Admin Dashboard</h1>
            <p className="text-muted-foreground">
              Access the data management system
            </p>
          </div>
        </div>

        {/* Login Card */}
        <Card className="bg-card">
          <CardContent className="p-8 space-y-6">
            {/* API Status */}
            <div className="flex items-center justify-center gap-3 p-4 bg-muted rounded-2xl border">
              {getApiStatusIcon()}
              <span className="text-sm font-medium">
                {getApiStatusText()}
              </span>
            </div>

            <form onSubmit={handleLogin} className="space-y-6">
              <div className="space-y-2">
                <Label htmlFor="username" className="text-sm font-semibold">
                  Username
                </Label>
                <Input
                  id="username"
                  type="text"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  className="h-12"
                  placeholder="Enter your username"
                  required
                  disabled={isLoading}
                />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="password" className="text-sm font-semibold">
                  Password
                </Label>
                <Input
                  id="password"
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="h-12"
                  placeholder="Enter your password"
                  required
                  disabled={isLoading}
                />
              </div>
              
              {error && (
                <div className="flex items-center gap-3 p-4 bg-destructive/10 border border-destructive/20 rounded-xl">
                  <AlertCircle className="h-5 w-5 text-destructive flex-shrink-0" />
                  <p className="text-destructive text-sm font-medium">{error}</p>
                </div>
              )}
              
              <Button
                type="submit"
                className="w-full h-12 font-semibold"
                disabled={isLoading || apiStatus === 'offline'}
              >
                {isLoading ? (
                  <>
                    <Loader2 className="h-5 w-5 mr-3 animate-spin" />
                    Connecting...
                  </>
                ) : (
                  <>
                    <Lock className="h-5 w-5 mr-3" />
                    Sign In
                  </>
                )}
              </Button>
            </form>

            {/* Demo Credentials */}
            <div className="text-center p-4 bg-muted rounded-xl border">
              <div className="flex items-center justify-center gap-2 mb-2">
                <Zap className="h-4 w-4 text-amber-600 dark:text-amber-400" />
                <span className="text-sm font-semibold">
                  Demo Access
                </span>
              </div>
              <p className="text-xs text-muted-foreground">
                Username: <code className="bg-background px-2 py-1 rounded text-xs font-mono">admin</code>
              </p>
              <p className="text-xs text-muted-foreground">
                Password: <code className="bg-background px-2 py-1 rounded text-xs font-mono">admin</code>
              </p>
            </div>
          </CardContent>
        </Card>

        {/* Footer */}
        <div className="text-center">
          <p className="text-xs text-muted-foreground">
            Secure access to the VeriNews data management system
          </p>
        </div>
      </div>
    </div>
  );
};

export default AdminLogin;
