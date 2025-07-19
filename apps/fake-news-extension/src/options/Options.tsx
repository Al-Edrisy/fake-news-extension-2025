
import React, { useState, useEffect } from 'react';
import { 
  Shield, 
  Settings, 
  Bell, 
  Globe, 
  Zap, 
  Save,
  CheckCircle2,
  Info,
  AlertTriangle,
  Sun,
  Moon,
  Monitor,
  Sparkles,
  Target,
  Users,
  Cpu,
  Network,
  ArrowRight,
  ExternalLink,
  Copy,
  RefreshCw,
  Palette,
  Volume2,
  VolumeX,
  Menu,
  Search,
  Database,
  Clock,
  Star,
  TrendingUp,
  AlertCircle,
  Github
} from 'lucide-react';
import { Card, CardHeader, CardTitle, CardContent } from '../components/ui/card';
import { Button } from '../components/ui/button';
import { Input } from '../components/ui/input';
import { Label } from '../components/ui/label';
import { Switch } from '../components/ui/switch';
import { Separator } from '../components/ui/separator';
import { Badge } from '../components/ui/badge';
import { Progress } from '../components/ui/progress';
import { useToast } from '../hooks/use-toast';
import { config } from '../utils/config';

interface Settings {
  enabled: boolean;
  notifications: boolean;
  autoVerify: boolean;
  serverUrl: string;
  theme: 'light' | 'dark' | 'system';
  showTimings: boolean;
  contextMenuEnabled: boolean;
  soundEnabled: boolean;
  autoSave: boolean;
  showConfidence: boolean;
  maxSources: number;
  requestTimeout: number;
}

const Options = () => {
  const [settings, setSettings] = useState<Settings>({
    enabled: true,
    notifications: true,
    autoVerify: false,
    serverUrl: config.apiBaseUrl,
    theme: 'system',
    showTimings: true,
    contextMenuEnabled: true,
    soundEnabled: true,
    autoSave: true,
    showConfidence: true,
    maxSources: 5,
    requestTimeout: 30
  });
  const [isSaving, setIsSaving] = useState(false);
  const [serverStatus, setServerStatus] = useState<'checking' | 'online' | 'offline'>('checking');
  const [animateContent, setAnimateContent] = useState(false);
  const { toast } = useToast();

  useEffect(() => {
    // Load settings from Chrome storage
    chrome.storage.sync.get([
      'enabled',
      'notifications', 
      'autoVerify',
      'serverUrl',
      'theme',
      'showTimings',
      'contextMenuEnabled',
      'soundEnabled',
      'autoSave',
      'showConfidence',
      'maxSources',
      'requestTimeout'
    ], (result) => {
      setSettings({
        enabled: result.enabled ?? true,
        notifications: result.notifications ?? true,
        autoVerify: result.autoVerify ?? false,
        serverUrl: result.serverUrl ?? config.apiBaseUrl,
        theme: result.theme ?? 'system',
        showTimings: result.showTimings ?? true,
        contextMenuEnabled: result.contextMenuEnabled ?? true,
        soundEnabled: result.soundEnabled ?? true,
        autoSave: result.autoSave ?? true,
        showConfidence: result.showConfidence ?? true,
        maxSources: result.maxSources ?? 5,
        requestTimeout: result.requestTimeout ?? 30
      });
    });

    // Trigger animation after component mounts
    const timer = setTimeout(() => setAnimateContent(true), 100);
    return () => clearTimeout(timer);
  }, []);

  useEffect(() => {
    // Apply theme
    if (settings.theme === 'dark') {
      document.documentElement.classList.add('dark');
    } else if (settings.theme === 'light') {
      document.documentElement.classList.remove('dark');
    } else {
      if (window.matchMedia('(prefers-color-scheme: dark)').matches) {
        document.documentElement.classList.add('dark');
      } else {
        document.documentElement.classList.remove('dark');
      }
    }
  }, [settings.theme]);

  const handleSettingChange = <K extends keyof Settings>(key: K, value: Settings[K]) => {
    setSettings(prev => ({ ...prev, [key]: value }));
    
    // Auto-save if enabled
    if (settings.autoSave) {
      chrome.storage.sync.set({ [key]: value });
    }
  };

  const saveSettings = async () => {
    setIsSaving(true);
    try {
      await chrome.storage.sync.set(settings);
      toast({
        title: "Settings saved successfully",
        description: "Your preferences have been updated and will take effect immediately.",
      });
    } catch (error) {
      toast({
        title: "Error saving settings",
        description: "Failed to save your preferences. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsSaving(false);
    }
  };

  const testServerConnection = async () => {
    setServerStatus('checking');
    try {
      const response = await fetch(`${settings.serverUrl}/health`, {
        method: 'GET',
        headers: { 'Content-Type': 'application/json' },
      });
      if (response.ok) {
        setServerStatus('online');
        toast({
          title: "Connection successful",
          description: "Server is reachable and responding correctly.",
        });
      } else {
        throw new Error('Server responded with error');
      }
    } catch (error) {
      setServerStatus('offline');
      toast({
        title: "Connection failed",
        description: "Could not connect to the server. Check the URL and ensure the server is running.",
        variant: "destructive",
      });
    }
  };

  const copyServerUrl = () => {
    navigator.clipboard.writeText(settings.serverUrl);
    toast({
      title: "URL copied",
      description: "Server URL has been copied to clipboard.",
    });
  };

  const resetToDefaults = () => {
    const defaultSettings: Settings = {
      enabled: true,
      notifications: true,
      autoVerify: false,
      serverUrl: config.apiBaseUrl,
      theme: 'system',
      showTimings: true,
      contextMenuEnabled: true,
      soundEnabled: true,
      autoSave: true,
      showConfidence: true,
      maxSources: 5,
      requestTimeout: 30
    };
    setSettings(defaultSettings);
    chrome.storage.sync.set(defaultSettings);
    toast({
      title: "Settings reset",
      description: "All settings have been reset to their default values.",
    });
  };

  const getServerStatusIcon = () => {
    switch (serverStatus) {
      case 'online':
        return <CheckCircle2 className="w-4 h-4 text-green-500" />;
      case 'offline':
        return <AlertTriangle className="w-4 h-4 text-red-500" />;
      case 'checking':
        return <RefreshCw className="w-4 h-4 text-amber-500 animate-spin" />;
    }
  };

  const getServerStatusText = () => {
    switch (serverStatus) {
      case 'online':
        return 'Online';
      case 'offline':
        return 'Offline';
      case 'checking':
        return 'Checking...';
    }
  };

  const getServerStatusColor = () => {
    switch (serverStatus) {
      case 'online':
        return 'text-green-600';
      case 'offline':
        return 'text-red-600';
      case 'checking':
        return 'text-amber-600';
    }
  };

  const themeOptions = [
    { id: 'light', label: 'Light', icon: Sun, description: 'Clean light theme' },
    { id: 'dark', label: 'Dark', icon: Moon, description: 'Easy on the eyes' },
    { id: 'system', label: 'System', icon: Monitor, description: 'Follows your OS' }
  ];

  return (
    <div className="min-h-screen bg-background">
      <div className="max-w-6xl mx-auto p-6">
        {/* Header */}
        <div className={`mb-8 transition-all duration-500 ${animateContent ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4'}`}>
          <div className="flex items-center gap-4 mb-4">
            <div className="p-3 bg-primary/10 rounded-xl">
            <Shield className="w-8 h-8 text-primary" />
            </div>
            <div>
              <h1 className="text-3xl font-bold text-primary-text">VeriNews Settings</h1>
              <p className="text-muted-text">
                Configure your AI-powered news verification extension
              </p>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Main Settings */}
          <div className="lg:col-span-2 space-y-6">
            {/* General Settings */}
            <Card className={`border-border shadow-lg transition-all duration-500 ${animateContent ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4'}`} style={{ animationDelay: '100ms' }}>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Settings className="w-5 h-5 text-primary" />
                  General Settings
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="flex items-center justify-between p-3 rounded-lg hover:bg-muted/50 transition-colors">
                  <div className="space-y-1">
                    <Label className="text-base font-medium flex items-center gap-2">
                      <Shield className="w-4 h-4" />
                      Extension Enabled
                    </Label>
                    <p className="text-sm text-muted-foreground">
                      Turn the extension on or off globally
                    </p>
                  </div>
                  <Switch
                    checked={settings.enabled}
                    onCheckedChange={(checked) => handleSettingChange('enabled', checked)}
                  />
                </div>

                <Separator />

                <div className="flex items-center justify-between p-3 rounded-lg hover:bg-muted/50 transition-colors">
                  <div className="space-y-1">
                    <Label className="text-base font-medium flex items-center gap-2">
                      <Menu className="w-4 h-4" />
                      Context Menu Integration
                    </Label>
                    <p className="text-sm text-muted-foreground">
                      Add "Verify with VeriNews" to right-click menu
                    </p>
                  </div>
                  <Switch
                    checked={settings.contextMenuEnabled}
                    onCheckedChange={(checked) => handleSettingChange('contextMenuEnabled', checked)}
                  />
                </div>

                <Separator />

                <div className="flex items-center justify-between p-3 rounded-lg hover:bg-muted/50 transition-colors">
                  <div className="space-y-1">
                    <Label className="text-base font-medium flex items-center gap-2">
                      {settings.soundEnabled ? <Volume2 className="w-4 h-4" /> : <VolumeX className="w-4 h-4" />}
                      Sound Notifications
                    </Label>
                    <p className="text-sm text-muted-foreground">
                      Play sound when verification completes
                    </p>
                  </div>
                  <Switch
                    checked={settings.soundEnabled}
                    onCheckedChange={(checked) => handleSettingChange('soundEnabled', checked)}
                  />
                </div>

                <Separator />

                <div className="flex items-center justify-between p-3 rounded-lg hover:bg-muted/50 transition-colors">
                  <div className="space-y-1">
                    <Label className="text-base font-medium flex items-center gap-2">
                      <Clock className="w-4 h-4" />
                      Show Performance Metrics
                    </Label>
                    <p className="text-sm text-muted-foreground">
                      Display timing information for verifications
                    </p>
                  </div>
                  <Switch
                    checked={settings.showTimings}
                    onCheckedChange={(checked) => handleSettingChange('showTimings', checked)}
                  />
                </div>
              </CardContent>
            </Card>

            {/* Theme Settings */}
            <Card className={`border-border shadow-lg transition-all duration-500 ${animateContent ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4'}`} style={{ animationDelay: '200ms' }}>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Palette className="w-5 h-5 text-primary" />
                  Theme & Appearance
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                  {themeOptions.map((theme) => {
                    const Icon = theme.icon;
                    return (
                      <button
                        key={theme.id}
                        onClick={() => handleSettingChange('theme', theme.id as Settings['theme'])}
                        className={`flex flex-col items-center gap-3 p-4 rounded-xl border transition-all duration-200 hover:scale-105 ${
                          settings.theme === theme.id 
                            ? 'border-primary bg-primary/10 shadow-md' 
                            : 'border-border hover:bg-muted/50 hover:border-primary/30'
                        }`}
                      >
                        <Icon className="w-6 h-6" />
                        <div className="text-center">
                          <div className="font-medium text-sm">{theme.label}</div>
                          <div className="text-xs text-muted-foreground">{theme.description}</div>
                        </div>
                      </button>
                    );
                  })}
                </div>
              </CardContent>
            </Card>

            {/* Server Configuration */}
            <Card className={`border-border shadow-lg transition-all duration-500 ${animateContent ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4'}`} style={{ animationDelay: '300ms' }}>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Globe className="w-5 h-5 text-primary" />
                  Server Configuration
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-3">
                  <Label htmlFor="serverUrl" className="flex items-center gap-2">
                    <Database className="w-4 h-4" />
                    Server URL
                  </Label>
                  <div className="flex gap-2">
                    <Input
                      id="serverUrl"
                      value={settings.serverUrl}
                      onChange={(e) => handleSettingChange('serverUrl', e.target.value)}
                      placeholder="http://13.60.241.86:5000"
                      className="flex-1"
                    />
                    <Button variant="outline" onClick={copyServerUrl} size="icon">
                      <Copy className="w-4 h-4" />
                    </Button>
                    <Button variant="outline" onClick={testServerConnection}>
                      <RefreshCw className="w-4 h-4 mr-2" />
                      Test
                    </Button>
                  </div>
                  <p className="text-sm text-muted-foreground">
                    URL of the VeriNews backend server for AI analysis
                  </p>
                </div>
              </CardContent>
            </Card>

            {/* Advanced Settings */}
            <Card className={`border-border shadow-lg transition-all duration-500 ${animateContent ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4'}`} style={{ animationDelay: '400ms' }}>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Zap className="w-5 h-5 text-primary" />
                  Advanced Settings
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="flex items-center justify-between p-3 rounded-lg hover:bg-muted/50 transition-colors">
                  <div className="space-y-1">
                    <Label className="text-base font-medium flex items-center gap-2">
                      <Search className="w-4 h-4" />
                      Auto-verify Selected Text
                    </Label>
                    <p className="text-sm text-muted-foreground">
                      Automatically verify when text is selected (experimental)
                    </p>
                  </div>
                  <div className="flex items-center gap-2">
                    <Badge variant="outline" className="text-xs bg-amber-50 text-amber-700 border-amber-200">Beta</Badge>
                    <Switch
                      checked={settings.autoVerify}
                      onCheckedChange={(checked) => handleSettingChange('autoVerify', checked)}
                    />
                  </div>
                </div>

                <Separator />

                <div className="flex items-center justify-between p-3 rounded-lg hover:bg-muted/50 transition-colors">
                  <div className="space-y-1">
                    <Label className="text-base font-medium flex items-center gap-2">
                      <Bell className="w-4 h-4" />
                      Desktop Notifications
                    </Label>
                    <p className="text-sm text-muted-foreground">
                      Show system notifications for completed verifications
                    </p>
                  </div>
                  <Switch
                    checked={settings.notifications}
                    onCheckedChange={(checked) => handleSettingChange('notifications', checked)}
                  />
                </div>

                <Separator />

                <div className="flex items-center justify-between p-3 rounded-lg hover:bg-muted/50 transition-colors">
                  <div className="space-y-1">
                    <Label className="text-base font-medium flex items-center gap-2">
                      <Save className="w-4 h-4" />
                      Auto-save Settings
                    </Label>
                    <p className="text-sm text-muted-foreground">
                      Automatically save settings when changed
                    </p>
                  </div>
                  <Switch
                    checked={settings.autoSave}
                    onCheckedChange={(checked) => handleSettingChange('autoSave', checked)}
                  />
                </div>

                <Separator />

                <div className="flex items-center justify-between p-3 rounded-lg hover:bg-muted/50 transition-colors">
                  <div className="space-y-1">
                    <Label className="text-base font-medium flex items-center gap-2">
                      <Target className="w-4 h-4" />
                      Show Confidence Scores
                    </Label>
                    <p className="text-sm text-muted-foreground">
                      Display confidence percentages in results
                    </p>
                  </div>
                  <Switch
                    checked={settings.showConfidence}
                    onCheckedChange={(checked) => handleSettingChange('showConfidence', checked)}
                  />
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Save Settings */}
            <Card className={`border-border shadow-lg transition-all duration-500 ${animateContent ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4'}`} style={{ animationDelay: '500ms' }}>
              <CardContent className="p-6">
                <Button 
                  onClick={saveSettings} 
                  disabled={isSaving}
                  className="w-full gap-2 mb-3"
                  size="lg"
                >
                  {isSaving ? (
                    <>
                      <div className="w-4 h-4 border-2 border-current border-t-transparent rounded-full animate-spin" />
                      Saving...
                    </>
                  ) : (
                    <>
                      <Save className="w-4 h-4" />
                      Save Settings
                    </>
                  )}
                </Button>
                <Button 
                  variant="outline" 
                  onClick={resetToDefaults}
                  className="w-full gap-2"
                >
                  <RefreshCw className="w-4 h-4" />
                  Reset to Defaults
                </Button>
              </CardContent>
            </Card>

            {/* Status Card */}
            <Card className={`border-border shadow-lg transition-all duration-500 ${animateContent ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4'}`} style={{ animationDelay: '600ms' }}>
              <CardHeader>
                <CardTitle className="text-base flex items-center gap-2">
                  <TrendingUp className="w-4 h-4 text-primary" />
                  System Status
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center justify-between p-2 rounded-lg bg-muted/30">
                  <span className="text-sm font-medium">Extension</span>
                  <div className="flex items-center gap-2">
                    <CheckCircle2 className="w-4 h-4 text-green-500" />
                    <span className="text-sm text-green-600 font-medium">Active</span>
                  </div>
                </div>
                <div className="flex items-center justify-between p-2 rounded-lg bg-muted/30">
                  <span className="text-sm font-medium">Server</span>
                  <div className="flex items-center gap-2">
                    {getServerStatusIcon()}
                    <span className={`text-sm font-medium ${getServerStatusColor()}`}>
                      {getServerStatusText()}
                    </span>
                  </div>
                </div>
                <div className="flex items-center justify-between p-2 rounded-lg bg-muted/30">
                  <span className="text-sm font-medium">Theme</span>
                  <div className="flex items-center gap-2">
                    {settings.theme === 'light' ? <Sun className="w-4 h-4 text-amber-500" /> :
                     settings.theme === 'dark' ? <Moon className="w-4 h-4 text-blue-500" /> :
                     <Monitor className="w-4 h-4 text-green-500" />}
                    <span className="text-sm font-medium capitalize">{settings.theme}</span>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Quick Actions */}
            <Card className={`border-border shadow-lg transition-all duration-500 ${animateContent ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4'}`} style={{ animationDelay: '700ms' }}>
              <CardHeader>
                <CardTitle className="text-base flex items-center gap-2">
                  <Sparkles className="w-4 h-4 text-primary" />
                  Quick Actions
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <Button variant="outline" size="sm" className="w-full justify-start" asChild>
                  <a href="http://localhost:5173/" target="_blank" rel="noopener noreferrer">
                    <Globe className="w-4 h-4 mr-2" />
                    Open Web App
                    <ExternalLink className="w-3 h-3 ml-auto" />
                  </a>
                </Button>
                <Button variant="outline" size="sm" className="w-full justify-start" asChild>
                  <a href="http://localhost:5173/playground" target="_blank" rel="noopener noreferrer">
                    <Zap className="w-4 h-4 mr-2" />
                    API Playground
                    <ExternalLink className="w-3 h-3 ml-auto" />
                  </a>
                </Button>
                <Button variant="outline" size="sm" className="w-full justify-start" asChild>
                  <a href="http://localhost:5173/docs" target="_blank" rel="noopener noreferrer">
                    <Info className="w-4 h-4 mr-2" />
                    Documentation
                    <ExternalLink className="w-3 h-3 ml-auto" />
                  </a>
                </Button>
              </CardContent>
            </Card>

            {/* Help Card */}
            <Card className={`border-border shadow-lg transition-all duration-500 ${animateContent ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4'}`} style={{ animationDelay: '800ms' }}>
              <CardHeader>
                <CardTitle className="text-base flex items-center gap-2">
                  <Info className="w-4 h-4 text-primary" />
                  Need Help?
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-muted-foreground mb-4">
                  Having trouble with the extension? Check our documentation or get support.
                </p>
                <div className="space-y-2">
                  <Button variant="outline" size="sm" className="w-full justify-start" asChild>
                    <a href="https://github.com/Al-Edrisy/fake-news-extension-2025" target="_blank" rel="noopener noreferrer">
                      <Github className="w-4 h-4 mr-2" />
                      GitHub Repository
                      <ExternalLink className="w-3 h-3 ml-auto" />
                    </a>
                  </Button>
                  <Button variant="outline" size="sm" className="w-full justify-start">
                    <AlertCircle className="w-4 h-4 mr-2" />
                    Report Issue
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Options;
