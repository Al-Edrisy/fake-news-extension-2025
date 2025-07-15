
import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { 
  LogOut, 
  FileText, 
  Globe, 
  Moon, 
  Sun, 
  Download, 
  Search, 
  RefreshCw, 
  BarChart3,
  Shield,
  AlertCircle,
  CheckCircle,
  Loader2,
  Activity,
  Database,
  TrendingUp,
  Users,
  Menu,
  X,
  ChevronLeft,
  ChevronRight,
  Filter,
  Settings,
  Home,
  BarChart,
  FileSpreadsheet,
  Calendar,
  Clock
} from 'lucide-react';
import { useTheme } from "next-themes";
import { useToast } from "@/hooks/use-toast";
import { adminApi, Claim, Source, Analysis, SystemStats, PaginatedResponse, ExportFilters } from '@/services/adminApi';

interface AdminDashboardProps {
  onLogout: () => void;
}

const AdminDashboard = ({ onLogout }: AdminDashboardProps) => {
  const { theme, setTheme } = useTheme();
  const { toast } = useToast();

  // Sidebar state
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [activeSection, setActiveSection] = useState('overview');
  
  // Loading states
  const [isLoading, setIsLoading] = useState(true);
  const [isLoadingData, setIsLoadingData] = useState(false);
  const [apiStatus, setApiStatus] = useState<'online' | 'offline'>('online');
  
  // Data states with pagination
  const [claimsData, setClaimsData] = useState<PaginatedResponse<Claim> | null>(null);
  const [sourcesData, setSourcesData] = useState<PaginatedResponse<Source> | null>(null);
  const [analysesData, setAnalysesData] = useState<PaginatedResponse<Analysis> | null>(null);
  const [systemStats, setSystemStats] = useState<SystemStats | null>(null);
  
  // Pagination states
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(20);
  
  // Filter states
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [selectedVerdict, setSelectedVerdict] = useState('all');
  const [selectedDomain, setSelectedDomain] = useState('all');
  const [selectedSupport, setSelectedSupport] = useState('all');
  
  // Export states
  const [showExportModal, setShowExportModal] = useState(false);
  const [exportFilters, setExportFilters] = useState<ExportFilters>({});
  const [isExporting, setIsExporting] = useState(false);

  useEffect(() => {
    initializeDashboard();
  }, []);

  useEffect(() => {
    if (activeSection !== 'overview') {
      loadSectionData();
    }
  }, [activeSection, currentPage, pageSize, searchTerm, selectedCategory, selectedVerdict, selectedDomain, selectedSupport]);

  const initializeDashboard = async () => {
    setIsLoading(true);
    try {
      await adminApi.getHealthCheck();
      setApiStatus('online');
      
      const stats = await adminApi.getSystemStats();
      setSystemStats(stats);
    } catch (error) {
      setApiStatus('offline');
      toast({
        title: "Connection Error",
        description: "Unable to connect to the backend service",
        variant: "destructive"
      });
    } finally {
      setIsLoading(false);
    }
  };

  const loadSectionData = async () => {
    setIsLoadingData(true);
    try {
      switch (activeSection) {
        case 'claims': {
          const data = await adminApi.getClaims(
            currentPage, 
            pageSize, 
            searchTerm || undefined, 
            selectedCategory !== 'all' ? selectedCategory : undefined, 
            selectedVerdict !== 'all' ? selectedVerdict : undefined
          );
          setClaimsData(data);
          break;
        }
        case 'sources': {
          const data = await adminApi.getSources(
            currentPage, 
            pageSize, 
            searchTerm || undefined, 
            selectedDomain !== 'all' ? selectedDomain : undefined
          );
          setSourcesData(data);
          break;
        }
        case 'analyses': {
          const data = await adminApi.getAnalyses(
            currentPage, 
            pageSize, 
            searchTerm || undefined, 
            selectedSupport !== 'all' ? selectedSupport : undefined
          );
          setAnalysesData(data);
          break;
        }
      }
    } catch (error) {
      toast({
        title: "Data Load Error",
        description: "Failed to load data from the server",
        variant: "destructive"
      });
    } finally {
      setIsLoadingData(false);
    }
  };

  const handleExport = async (type: 'claims' | 'sources' | 'analyses') => {
    setIsExporting(true);
    try {
      let data;
      switch (type) {
        case 'claims':
          data = await adminApi.exportClaimsCSV(exportFilters);
          break;
        case 'sources':
          data = await adminApi.exportSourcesCSV(exportFilters);
          break;
        case 'analyses':
          data = await adminApi.exportAnalysesCSV(exportFilters);
          break;
      }

      if (data.data.length === 0) {
      toast({
        title: "No Data",
          description: `No data available for ${type} with current filters.`,
        variant: "destructive"
      });
      return;
    }

      const headers = Object.keys(data.data[0]);
    const csvContent = [
        headers.join(','),
        ...data.data.map(row => 
        headers.map(header => {
          const value = row[header];
          if (typeof value === 'string' && (value.includes(',') || value.includes('"') || value.includes('\n'))) {
            return `"${value.replace(/"/g, '""')}"`;
          }
          return value;
        }).join(',')
      )
    ].join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    const url = URL.createObjectURL(blob);
    link.setAttribute('href', url);
      link.setAttribute('download', `admin_${type}_${new Date().toISOString().split('T')[0]}.csv`);
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);

    toast({
      title: "Export Successful",
        description: `${type} data exported to CSV successfully.`,
      });
      
      setShowExportModal(false);
    } catch (error) {
      toast({
        title: "Export Error",
        description: "Failed to export data",
        variant: "destructive"
      });
    } finally {
      setIsExporting(false);
    }
  };

  const getVerdictBadge = (verdict: string) => {
    const variants = {
      'TRUE': 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200',
      'FALSE': 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200',
      'Uncertain': 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200',
    };
    return variants[verdict as keyof typeof variants] || 'bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-200';
  };

  const getSupportBadge = (support: string) => {
    const variants = {
      'Supported': 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200',
      'Contradicted': 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200',
      'Uncertain': 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200',
    };
    return variants[support as keyof typeof variants] || 'bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-200';
  };

  const StatCard = ({ title, value, icon: Icon, description }: { 
    title: string; 
    value: number; 
    icon: React.ComponentType<{ className?: string }>; 
    description?: string;
  }) => (
    <Card>
      <CardContent className="p-6">
        <div className="flex items-center justify-between">
          <div className="space-y-1">
            <p className="text-sm font-medium text-muted-foreground">{title}</p>
            <p className="text-2xl font-bold">{value.toLocaleString()}</p>
            {description && (
              <p className="text-xs text-muted-foreground">{description}</p>
            )}
          </div>
          <div className="p-2 bg-primary/10 rounded-lg">
            <Icon className="h-6 w-6 text-primary" />
          </div>
        </div>
      </CardContent>
    </Card>
  );

  const Pagination = ({ pagination, onPageChange }: { 
    pagination: {
      page: number;
      limit: number;
      total: number;
      total_pages: number;
      has_next: boolean;
      has_prev: boolean;
    }; 
    onPageChange: (page: number) => void;
  }) => (
    <div className="flex items-center justify-between px-2">
      <div className="flex-1 text-sm text-muted-foreground">
        Showing {((pagination.page - 1) * pagination.limit) + 1} to{' '}
        {Math.min(pagination.page * pagination.limit, pagination.total)} of{' '}
        {pagination.total} results
      </div>
      <div className="flex items-center space-x-2">
        <Button
          variant="outline"
          size="sm"
          onClick={() => onPageChange(pagination.page - 1)}
          disabled={!pagination.has_prev}
        >
          <ChevronLeft className="h-4 w-4" />
          Previous
        </Button>
        <div className="flex items-center space-x-1">
          {Array.from({ length: Math.min(5, pagination.total_pages) }, (_, i) => {
            const pageNum = i + 1;
            return (
              <Button
                key={pageNum}
                variant={pagination.page === pageNum ? "default" : "outline"}
                size="sm"
                onClick={() => onPageChange(pageNum)}
                className="w-8 h-8"
              >
                {pageNum}
              </Button>
            );
          })}
        </div>
        <Button
          variant="outline"
          size="sm"
          onClick={() => onPageChange(pagination.page + 1)}
          disabled={!pagination.has_next}
        >
          Next
          <ChevronRight className="h-4 w-4" />
        </Button>
      </div>
    </div>
  );

  const SidebarItem = ({ icon: Icon, label, section, isActive }: {
    icon: React.ComponentType<{ className?: string }>;
    label: string;
    section: string;
    isActive: boolean;
  }) => (
    <button
      onClick={() => setActiveSection(section)}
      className={`w-full flex items-center space-x-3 px-3 py-2 rounded-lg transition-colors ${
        isActive 
          ? 'bg-primary text-primary-foreground' 
          : 'hover:bg-muted text-muted-foreground hover:text-foreground'
      }`}
    >
      <Icon className="h-5 w-5" />
      <span className="font-medium">{label}</span>
    </button>
  );

  if (isLoading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center space-y-4">
          <Loader2 className="h-8 w-8 animate-spin text-primary mx-auto" />
          <p className="text-muted-foreground">Loading dashboard...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background flex">
      {/* Sidebar */}
      <div className={`${sidebarOpen ? 'w-64' : 'w-16'} bg-card border-r transition-all duration-300 flex flex-col`}>
        <div className="p-4 border-b">
          <div className="flex items-center justify-between">
            {sidebarOpen && (
              <div className="flex items-center space-x-2">
                <Shield className="h-6 w-6 text-primary" />
                <span className="font-bold text-lg">Admin</span>
              </div>
            )}
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setSidebarOpen(!sidebarOpen)}
            >
              {sidebarOpen ? <X className="h-4 w-4" /> : <Menu className="h-4 w-4" />}
            </Button>
          </div>
        </div>

        <nav className="flex-1 p-4 space-y-2">
          <SidebarItem
            icon={Home}
            label="Overview"
            section="overview"
            isActive={activeSection === 'overview'}
          />
          <SidebarItem
            icon={FileText}
            label="Claims"
            section="claims"
            isActive={activeSection === 'claims'}
          />
          <SidebarItem
            icon={Globe}
            label="Sources"
            section="sources"
            isActive={activeSection === 'sources'}
          />
          <SidebarItem
            icon={BarChart3}
            label="Analyses"
            section="analyses"
            isActive={activeSection === 'analyses'}
          />
          <SidebarItem
            icon={FileSpreadsheet}
            label="Export"
            section="export"
            isActive={activeSection === 'export'}
          />
        </nav>

        <div className="p-4 border-t">
          <div className="flex items-center space-x-2">
            <Button
              variant="outline"
              size="icon"
              onClick={() => setTheme(theme === "dark" ? "light" : "dark")}
            >
              <Sun className="h-[1.2rem] w-[1.2rem] rotate-0 scale-100 transition-all dark:-rotate-90 dark:scale-0" />
              <Moon className="absolute h-[1.2rem] w-[1.2rem] rotate-90 scale-0 transition-all dark:rotate-0 dark:scale-100" />
            </Button>
            {sidebarOpen && (
            <Button
              onClick={onLogout}
              variant="outline"
                className="flex-1"
            >
              <LogOut className="h-4 w-4 mr-2" />
              Logout
            </Button>
            )}
          </div>
          </div>
        </div>

      {/* Main Content */}
      <div className="flex-1 flex flex-col">
        {/* Header */}
        <header className="border-b bg-card">
          <div className="px-6 py-4">
            <div className="flex items-center justify-between">
              <div>
                <h1 className="text-2xl font-bold capitalize">{activeSection}</h1>
                <div className="flex items-center space-x-2 mt-1">
                  {apiStatus === 'online' ? (
                    <div className="flex items-center space-x-2 text-green-600 dark:text-green-400">
                      <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
                      <span className="text-sm">Connected</span>
                    </div>
                  ) : (
                    <div className="flex items-center space-x-2 text-red-600 dark:text-red-400">
                      <div className="w-2 h-2 bg-red-500 rounded-full"></div>
                      <span className="text-sm">Offline</span>
                    </div>
                  )}
                </div>
              </div>
              
                <Button
                  variant="outline"
                  size="sm"
                onClick={initializeDashboard}
                disabled={isLoading}
              >
                <RefreshCw className={`h-4 w-4 mr-2 ${isLoading ? 'animate-spin' : ''}`} />
                Refresh
              </Button>
            </div>
          </div>
        </header>

        {/* Content */}
        <main className="flex-1 p-6 overflow-auto">
          {activeSection === 'overview' && (
            <div className="space-y-6">
              {/* Statistics Overview */}
              {systemStats && (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                  <StatCard
                    title="Total Claims"
                    value={systemStats.total_claims}
                    icon={FileText}
                    description="All verified claims"
                  />
                  <StatCard
                    title="Data Sources"
                    value={systemStats.total_sources}
                    icon={Globe}
                    description="Trusted sources"
                  />
                  <StatCard
                    title="Analyses"
                    value={systemStats.total_analyses}
                    icon={BarChart3}
                    description="Fact-checking results"
                  />
                  <StatCard
                    title="High Confidence"
                    value={systemStats.high_confidence_claims}
                    icon={TrendingUp}
                    description="Reliable claims"
                  />
                </div>
              )}

              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* Recent Activity */}
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center space-x-2">
                      <Activity className="h-5 w-5" />
                      <span>Recent Activity</span>
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="flex items-center justify-between p-4 bg-muted rounded-lg">
                      <div className="flex items-center space-x-3">
                        <div className="p-2 bg-blue-500 rounded-lg">
                          <FileText className="h-4 w-4 text-white" />
                        </div>
                        <div>
                          <p className="font-medium">Recent Claims</p>
                          <p className="text-sm text-muted-foreground">Last 24 hours</p>
                        </div>
                      </div>
                      <Badge variant="secondary">
                        {systemStats?.recent_analyses || 0}
                      </Badge>
                    </div>
                    <div className="flex items-center justify-between p-4 bg-muted rounded-lg">
                      <div className="flex items-center space-x-3">
                        <div className="p-2 bg-green-500 rounded-lg">
                          <CheckCircle className="h-4 w-4 text-white" />
                        </div>
                        <div>
                          <p className="font-medium">Supported Claims</p>
                          <p className="text-sm text-muted-foreground">Verified facts</p>
                        </div>
                      </div>
                      <Badge variant="secondary">
                        {systemStats?.supported_analyses || 0}
                      </Badge>
                    </div>
                    {systemStats?.supported_analyses === 0 && (
                      <div className="p-3 bg-yellow-50 dark:bg-yellow-950/20 border border-yellow-200 dark:border-yellow-800 rounded-lg">
                        <p className="text-sm text-yellow-800 dark:text-yellow-200">
                          <strong>Note:</strong> No supported claims found. This may indicate that:
                        </p>
                        <ul className="text-xs text-yellow-700 dark:text-yellow-300 mt-2 space-y-1">
                          <li>• All analyses are currently marked as "Uncertain"</li>
                          <li>• The fact-checking process is still in progress</li>
                          <li>• Claims need manual verification</li>
                        </ul>
                      </div>
                    )}
                  </CardContent>
                </Card>

                {/* Quick Actions */}
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center space-x-2">
                      <Database className="h-5 w-5" />
                      <span>Quick Actions</span>
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="grid grid-cols-2 gap-3">
                      <Button
                        variant="outline"
                        onClick={() => setActiveSection('claims')}
                        className="h-20 flex flex-col items-center justify-center space-y-2"
                      >
                        <FileText className="h-6 w-6" />
                        <span className="text-sm">View Claims</span>
                      </Button>
                      <Button
                        variant="outline"
                        onClick={() => setActiveSection('analyses')}
                        className="h-20 flex flex-col items-center justify-center space-y-2"
                      >
                        <BarChart3 className="h-6 w-6" />
                        <span className="text-sm">View Analyses</span>
                      </Button>
                      <Button
                        variant="outline"
                        onClick={() => setActiveSection('export')}
                        className="h-20 flex flex-col items-center justify-center space-y-2"
                      >
                        <Download className="h-6 w-6" />
                        <span className="text-sm">Export Data</span>
                      </Button>
                      <Button
                        variant="outline"
                        onClick={initializeDashboard}
                        className="h-20 flex flex-col items-center justify-center space-y-2"
                      >
                        <RefreshCw className="h-6 w-6" />
                        <span className="text-sm">Refresh</span>
                </Button>
                    </div>
                  </CardContent>
                </Card>
              </div>
            </div>
          )}

          {/* Claims Section */}
          {activeSection === 'claims' && (
            <div className="space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center space-x-2">
                    <FileText className="h-5 w-5" />
                    <span>Claims Management</span>
                  </CardTitle>
              </CardHeader>
              <CardContent>
                  {/* Filters */}
                  <div className="flex flex-col sm:flex-row gap-4 mb-6">
                    <div className="relative flex-1">
                      <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                      <Input
                        placeholder="Search claims..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="pl-10"
                      />
                    </div>
                    <select
                      value={selectedCategory}
                      onChange={(e) => setSelectedCategory(e.target.value)}
                      className="px-3 py-2 border border-input rounded-md bg-background"
                    >
                      <option value="all">All Categories</option>
                      <option value="general">General</option>
                      <option value="health">Health</option>
                      <option value="politics">Politics</option>
                      <option value="technology">Technology</option>
                      <option value="science">Science</option>
                    </select>
                    <select
                      value={selectedVerdict}
                      onChange={(e) => setSelectedVerdict(e.target.value)}
                      className="px-3 py-2 border border-input rounded-md bg-background"
                    >
                      <option value="all">All Verdicts</option>
                      <option value="TRUE">True</option>
                      <option value="FALSE">False</option>
                      <option value="Uncertain">Uncertain</option>
                    </select>
                  </div>

                  {isLoadingData ? (
                    <div className="flex items-center justify-center py-8">
                      <Loader2 className="h-6 w-6 animate-spin text-primary" />
                    </div>
                  ) : (
                    <>
                <div className="overflow-x-auto">
                  <Table>
                    <TableHeader>
                            <TableRow>
                              <TableHead>ID</TableHead>
                              <TableHead>Text</TableHead>
                              <TableHead>Verdict</TableHead>
                              <TableHead>Confidence</TableHead>
                              <TableHead>Category</TableHead>
                              <TableHead>Created</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                            {claimsData?.data.map((claim) => (
                              <TableRow key={claim.id}>
                                <TableCell className="font-mono text-xs">
                                  {claim.id.substring(0, 8)}...
                                </TableCell>
                                <TableCell className="max-w-xs">
                                  <div className="truncate" title={claim.text}>
                                    {claim.text}
                                  </div>
                                </TableCell>
                                <TableCell>
                                  <Badge className={getVerdictBadge(claim.verdict)}>
                                    {claim.verdict}
                                  </Badge>
                                </TableCell>
                                <TableCell>{claim.confidence}%</TableCell>
                          <TableCell>
                                  <Badge variant="outline">
                                    {claim.category}
                                  </Badge>
                                </TableCell>
                                <TableCell className="text-xs text-muted-foreground">
                                  {new Date(claim.created_at).toLocaleDateString()}
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </div>
                      
                      {claimsData?.pagination && (
                        <div className="mt-4">
                          <Pagination 
                            pagination={claimsData.pagination} 
                            onPageChange={setCurrentPage} 
                          />
                        </div>
                      )}
                    </>
                  )}
              </CardContent>
            </Card>
            </div>
          )}

          {/* Sources Section */}
          {activeSection === 'sources' && (
            <div className="space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center space-x-2">
                    <Globe className="h-5 w-5" />
                    <span>Sources Management</span>
                </CardTitle>
              </CardHeader>
              <CardContent>
                  {/* Filters */}
                  <div className="flex flex-col sm:flex-row gap-4 mb-6">
                    <div className="relative flex-1">
                      <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                      <Input
                        placeholder="Search sources..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="pl-10"
                      />
                    </div>
                    <select
                      value={selectedDomain}
                      onChange={(e) => setSelectedDomain(e.target.value)}
                      className="px-3 py-2 border border-input rounded-md bg-background"
                    >
                      <option value="all">All Domains</option>
                      <option value="bbc.com">BBC</option>
                      <option value="cnn.com">CNN</option>
                      <option value="reuters.com">Reuters</option>
                    </select>
                  </div>

                  {isLoadingData ? (
                    <div className="flex items-center justify-center py-8">
                      <Loader2 className="h-6 w-6 animate-spin text-primary" />
                    </div>
                  ) : (
                    <>
                <div className="overflow-x-auto">
                  <Table>
                    <TableHeader>
                            <TableRow>
                              <TableHead>ID</TableHead>
                              <TableHead>Domain</TableHead>
                              <TableHead>Title</TableHead>
                              <TableHead>Source Name</TableHead>
                              <TableHead>Credibility</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                            {sourcesData?.data.map((source) => (
                              <TableRow key={source.id}>
                                <TableCell className="font-mono text-xs">
                                  {source.id.substring(0, 8)}...
                                </TableCell>
                                <TableCell>
                                  <a 
                                    href={source.url} 
                                    target="_blank" 
                                    rel="noopener noreferrer"
                                    className="text-primary hover:underline"
                                  >
                                    {source.domain}
                                  </a>
                                </TableCell>
                                <TableCell className="max-w-xs">
                                  <div className="truncate" title={source.title}>
                                    {source.title}
                                  </div>
                                </TableCell>
                                <TableCell>{source.source_name}</TableCell>
                          <TableCell>
                                  <Badge variant="outline">
                                    {source.credibility_score}/10
                                  </Badge>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </div>
                      
                      {sourcesData?.pagination && (
                        <div className="mt-4">
                          <Pagination 
                            pagination={sourcesData.pagination} 
                            onPageChange={setCurrentPage} 
                          />
                        </div>
                      )}
                    </>
                  )}
              </CardContent>
            </Card>
            </div>
          )}

          {/* Analyses Section */}
          {activeSection === 'analyses' && (
            <div className="space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center space-x-2">
                    <BarChart3 className="h-5 w-5" />
                    <span>Analyses Management</span>
                </CardTitle>
              </CardHeader>
              <CardContent>
                {/* Data Status Note */}
                <div className="mb-6 p-3 bg-blue-50 dark:bg-blue-950/20 border border-blue-200 dark:border-blue-800 rounded-lg">
                  <p className="text-sm text-blue-800 dark:text-blue-200">
                    <strong>Support Levels:</strong> 
                    <span className="ml-2">
                      <Badge className="bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200 mr-2">Supported</Badge>
                      <Badge className="bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200 mr-2">Contradicted</Badge>
                      <Badge className="bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200">Uncertain</Badge>
                    </span>
                  </p>
                  <p className="text-xs text-blue-700 dark:text-blue-300 mt-1">
                    Currently all analyses are marked as "Uncertain" - indicating the fact-checking process is ongoing.
                  </p>
                </div>
                  {/* Filters */}
                  <div className="flex flex-col sm:flex-row gap-4 mb-6">
                    <div className="relative flex-1">
                      <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                      <Input
                        placeholder="Search analyses..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="pl-10"
                      />
                    </div>
                    <select
                      value={selectedSupport}
                      onChange={(e) => setSelectedSupport(e.target.value)}
                      className="px-3 py-2 border border-input rounded-md bg-background"
                    >
                      <option value="all">All Support</option>
                      <option value="Supported">Supported</option>
                      <option value="Contradicted">Contradicted</option>
                      <option value="Uncertain">Uncertain</option>
                    </select>
                  </div>

                  {isLoadingData ? (
                    <div className="flex items-center justify-center py-8">
                      <Loader2 className="h-6 w-6 animate-spin text-primary" />
                    </div>
                  ) : (
                    <>
                <div className="overflow-x-auto">
                  <Table>
                    <TableHeader>
                            <TableRow>
                              <TableHead>ID</TableHead>
                              <TableHead>Claim Text</TableHead>
                              <TableHead>Support</TableHead>
                              <TableHead>Confidence</TableHead>
                              <TableHead>Source URL</TableHead>
                              <TableHead>Created</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                            {analysesData?.data.map((analysis) => (
                              <TableRow key={analysis.id || analysis.analysis_id}>
                                <TableCell className="font-mono text-xs">
                                  {(analysis.id || analysis.analysis_id || '').substring(0, 8)}...
                                </TableCell>
                                <TableCell className="max-w-xs">
                                  <div className="truncate" title={analysis.claim_text || ''}>
                                    {analysis.claim_text || 'N/A'}
                                  </div>
                                </TableCell>
                                <TableCell>
                                  <Badge className={getSupportBadge(analysis.support)}>
                                    {analysis.support}
                                  </Badge>
                                </TableCell>
                                <TableCell>{analysis.confidence}%</TableCell>
                                <TableCell className="max-w-xs">
                                  {analysis.source_url ? (
                                    <a 
                                      href={analysis.source_url} 
                                      target="_blank" 
                                      rel="noopener noreferrer"
                                      className="text-primary hover:underline truncate block"
                                      title={analysis.source_url}
                                    >
                                      {new URL(analysis.source_url).hostname}
                                    </a>
                                  ) : (
                                    <span className="text-muted-foreground">N/A</span>
                                  )}
                                </TableCell>
                                <TableCell className="text-xs text-muted-foreground">
                                  {new Date(analysis.created_at).toLocaleDateString()}
                                </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                      </div>
                      
                      {analysesData?.pagination && (
                        <div className="mt-4">
                          <Pagination 
                            pagination={analysesData.pagination} 
                            onPageChange={setCurrentPage} 
                          />
                        </div>
                      )}
                    </>
                  )}
                </CardContent>
              </Card>
            </div>
          )}

          {/* Export Section */}
          {activeSection === 'export' && (
            <div className="space-y-6">
              {/* Guidelines Card */}
              <Card className="border-blue-200 bg-blue-50 dark:border-blue-800 dark:bg-blue-950/20">
                <CardHeader>
                  <CardTitle className="flex items-center space-x-2 text-blue-800 dark:text-blue-200">
                    <FileSpreadsheet className="h-5 w-5" />
                    <span>Export Guidelines & Instructions</span>
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="space-y-3">
                      <h4 className="font-semibold text-blue-800 dark:text-blue-200">📋 How to Use Filters</h4>
                      <ul className="space-y-2 text-sm text-blue-700 dark:text-blue-300">
                        <li className="flex items-start space-x-2">
                          <span className="text-blue-600 dark:text-blue-400">•</span>
                          <span><strong>Search Term:</strong> Enter keywords to filter by text content. Works with partial matches.</span>
                        </li>
                        <li className="flex items-start space-x-2">
                          <span className="text-blue-600 dark:text-blue-400">•</span>
                          <span><strong>Category:</strong> Filter claims by topic (Health, Politics, Technology, etc.)</span>
                        </li>
                        <li className="flex items-start space-x-2">
                          <span className="text-blue-600 dark:text-blue-400">•</span>
                          <span><strong>Verdict:</strong> Filter by fact-checking result (True, False, Uncertain)</span>
                        </li>
                        <li className="flex items-start space-x-2">
                          <span className="text-blue-600 dark:text-blue-400">•</span>
                          <span><strong>Domain:</strong> Filter sources by website domain</span>
                        </li>
                        <li className="flex items-start space-x-2">
                          <span className="text-blue-600 dark:text-blue-400">•</span>
                          <span><strong>Support:</strong> Filter analyses by support level (Supported, Contradicted, Uncertain)</span>
                        </li>
                      </ul>
                    </div>
                    <div className="space-y-3">
                      <h4 className="font-semibold text-blue-800 dark:text-blue-200">💡 Pro Tips</h4>
                      <ul className="space-y-2 text-sm text-blue-700 dark:text-blue-300">
                        <li className="flex items-start space-x-2">
                          <span className="text-blue-600 dark:text-blue-400">•</span>
                          <span><strong>Combine Filters:</strong> Use multiple filters together for precise results</span>
                        </li>
                        <li className="flex items-start space-x-2">
                          <span className="text-blue-600 dark:text-blue-400">•</span>
                          <span><strong>Export All:</strong> Leave filters empty to export all data</span>
                        </li>
                        <li className="flex items-start space-x-2">
                          <span className="text-blue-600 dark:text-blue-400">•</span>
                          <span><strong>File Naming:</strong> Exports include date stamps for easy organization</span>
                        </li>
                        <li className="flex items-start space-x-2">
                          <span className="text-blue-600 dark:text-blue-400">•</span>
                          <span><strong>Large Exports:</strong> May take a few seconds for large datasets</span>
                        </li>
                      </ul>
                    </div>
                  </div>
                  <div className="p-3 bg-blue-100 dark:bg-blue-900/30 rounded-lg">
                    <p className="text-sm text-blue-800 dark:text-blue-200">
                      <strong>Note:</strong> Export filters are independent of the pagination in other sections. 
                      You can export all matching data regardless of what's currently displayed in the tables.
                    </p>
                  </div>
                  <div className="p-3 bg-yellow-50 dark:bg-yellow-950/20 border border-yellow-200 dark:border-yellow-800 rounded-lg">
                    <p className="text-sm text-yellow-800 dark:text-yellow-200">
                      <strong>Current Data Status:</strong> All analyses are currently marked as "Uncertain" (429 total). 
                      This indicates the fact-checking process is ongoing. You can still export this data for review.
                    </p>
                  </div>
                </CardContent>
              </Card>

              {/* Export Cards */}
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                {/* Claims Export */}
                <Card className="border-green-200 bg-green-50 dark:border-green-800 dark:bg-green-950/20">
                  <CardHeader>
                    <CardTitle className="flex items-center space-x-2 text-green-800 dark:text-green-200">
                      <FileText className="h-5 w-5" />
                      <span>Export Claims</span>
                    </CardTitle>
                    <p className="text-sm text-green-700 dark:text-green-300">
                      Export fact-checked claims with verdicts and confidence scores
                    </p>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="space-y-2">
                      <label className="text-sm font-medium text-green-800 dark:text-green-200">Search Term</label>
                      <Input
                        placeholder="Filter by claim text..."
                        value={exportFilters.search || ''}
                        onChange={(e) => setExportFilters({...exportFilters, search: e.target.value})}
                        className="border-green-300 focus:border-green-500"
                      />
                      <p className="text-xs text-green-600 dark:text-green-400">
                        Search within claim text content
                      </p>
                    </div>
                    <div className="space-y-2">
                      <label className="text-sm font-medium text-green-800 dark:text-green-200">Category</label>
                      <select
                        value={exportFilters.category || 'all'}
                        onChange={(e) => setExportFilters({...exportFilters, category: e.target.value === 'all' ? undefined : e.target.value})}
                        className="w-full px-3 py-2 border border-green-300 rounded-md bg-background focus:border-green-500"
                      >
                        <option value="all">All Categories</option>
                        <option value="general">General</option>
                        <option value="health">Health</option>
                        <option value="politics">Politics</option>
                        <option value="technology">Technology</option>
                        <option value="science">Science</option>
                      </select>
                    </div>
                    <div className="space-y-2">
                      <label className="text-sm font-medium text-green-800 dark:text-green-200">Verdict</label>
                      <select
                        value={exportFilters.verdict || 'all'}
                        onChange={(e) => setExportFilters({...exportFilters, verdict: e.target.value === 'all' ? undefined : e.target.value})}
                        className="w-full px-3 py-2 border border-green-300 rounded-md bg-background focus:border-green-500"
                      >
                        <option value="all">All Verdicts</option>
                        <option value="TRUE">True</option>
                        <option value="FALSE">False</option>
                        <option value="Uncertain">Uncertain</option>
                      </select>
                    </div>
                    <Button
                      onClick={() => handleExport('claims')}
                      disabled={isExporting}
                      className="w-full bg-green-600 hover:bg-green-700 text-white"
                    >
                      {isExporting ? (
                        <Loader2 className="h-4 w-4 animate-spin mr-2" />
                      ) : (
                        <Download className="h-4 w-4 mr-2" />
                      )}
                      Export Claims CSV
                    </Button>
                  </CardContent>
                </Card>

                {/* Sources Export */}
                <Card className="border-blue-200 bg-blue-50 dark:border-blue-800 dark:bg-blue-950/20">
                  <CardHeader>
                    <CardTitle className="flex items-center space-x-2 text-blue-800 dark:text-blue-200">
                      <Globe className="h-5 w-5" />
                      <span>Export Sources</span>
                    </CardTitle>
                    <p className="text-sm text-blue-700 dark:text-blue-300">
                      Export trusted news sources with credibility scores
                    </p>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="space-y-2">
                      <label className="text-sm font-medium text-blue-800 dark:text-blue-200">Search Term</label>
                      <Input
                        placeholder="Filter by title, domain, or source name..."
                        value={exportFilters.search || ''}
                        onChange={(e) => setExportFilters({...exportFilters, search: e.target.value})}
                        className="border-blue-300 focus:border-blue-500"
                      />
                      <p className="text-xs text-blue-600 dark:text-blue-400">
                        Search within titles, domains, or source names
                      </p>
                    </div>
                    <div className="space-y-2">
                      <label className="text-sm font-medium text-blue-800 dark:text-blue-200">Domain</label>
                      <select
                        value={exportFilters.domain || 'all'}
                        onChange={(e) => setExportFilters({...exportFilters, domain: e.target.value === 'all' ? undefined : e.target.value})}
                        className="w-full px-3 py-2 border border-blue-300 rounded-md bg-background focus:border-blue-500"
                      >
                        <option value="all">All Domains</option>
                        <option value="bbc.com">BBC</option>
                        <option value="cnn.com">CNN</option>
                        <option value="reuters.com">Reuters</option>
                        <option value="ap.org">Associated Press</option>
                        <option value="npr.org">NPR</option>
                      </select>
                    </div>
                    <Button
                      onClick={() => handleExport('sources')}
                      disabled={isExporting}
                      className="w-full bg-blue-600 hover:bg-blue-700 text-white"
                    >
                      {isExporting ? (
                        <Loader2 className="h-4 w-4 animate-spin mr-2" />
                      ) : (
                        <Download className="h-4 w-4 mr-2" />
                      )}
                      Export Sources CSV
                    </Button>
                  </CardContent>
                </Card>

                {/* Analyses Export */}
                <Card className="border-purple-200 bg-purple-50 dark:border-purple-800 dark:bg-purple-950/20">
                  <CardHeader>
                    <CardTitle className="flex items-center space-x-2 text-purple-800 dark:text-purple-200">
                      <BarChart3 className="h-5 w-5" />
                      <span>Export Analyses</span>
                    </CardTitle>
                    <p className="text-sm text-purple-700 dark:text-purple-300">
                      Export fact-checking analyses with support levels
                    </p>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="space-y-2">
                      <label className="text-sm font-medium text-purple-800 dark:text-purple-200">Search Term</label>
                      <Input
                        placeholder="Filter by claim text..."
                        value={exportFilters.search || ''}
                        onChange={(e) => setExportFilters({...exportFilters, search: e.target.value})}
                        className="border-purple-300 focus:border-purple-500"
                      />
                      <p className="text-xs text-purple-600 dark:text-purple-400">
                        Search within the analyzed claim text
                      </p>
                    </div>
                    <div className="space-y-2">
                      <label className="text-sm font-medium text-purple-800 dark:text-purple-200">Support Level</label>
                      <select
                        value={exportFilters.support || 'all'}
                        onChange={(e) => setExportFilters({...exportFilters, support: e.target.value === 'all' ? undefined : e.target.value})}
                        className="w-full px-3 py-2 border border-purple-300 rounded-md bg-background focus:border-purple-500"
                      >
                        <option value="all">All Support Levels</option>
                        <option value="Supported">Supported</option>
                        <option value="Contradicted">Contradicted</option>
                        <option value="Uncertain">Uncertain</option>
                      </select>
                    </div>
                    <Button
                      onClick={() => handleExport('analyses')}
                      disabled={isExporting}
                      className="w-full bg-purple-600 hover:bg-purple-700 text-white"
                    >
                      {isExporting ? (
                        <Loader2 className="h-4 w-4 animate-spin mr-2" />
                      ) : (
                        <Download className="h-4 w-4 mr-2" />
                      )}
                      Export Analyses CSV
                    </Button>
                  </CardContent>
                </Card>
              </div>

              {/* Export Status */}
              {isExporting && (
                <Card className="border-orange-200 bg-orange-50 dark:border-orange-800 dark:bg-orange-950/20">
                  <CardContent className="p-4">
                    <div className="flex items-center space-x-3">
                      <Loader2 className="h-5 w-5 animate-spin text-orange-600" />
                      <div>
                        <p className="font-medium text-orange-800 dark:text-orange-200">
                          Preparing Export...
                        </p>
                        <p className="text-sm text-orange-700 dark:text-orange-300">
                          Please wait while we process your data and generate the CSV file.
                        </p>
                      </div>
                </div>
              </CardContent>
            </Card>
              )}
            </div>
          )}
        </main>
      </div>
    </div>
  );
};

export default AdminDashboard;
