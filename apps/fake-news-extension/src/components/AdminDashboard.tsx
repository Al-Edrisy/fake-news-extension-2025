
import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { LogOut, Database, FileText, Globe, Moon, Sun, Download } from 'lucide-react';
import { useTheme } from "next-themes";
import { useToast } from "@/hooks/use-toast";

interface AdminDashboardProps {
  onLogout: () => void;
}

const AdminDashboard = ({ onLogout }: AdminDashboardProps) => {
  const { theme, setTheme } = useTheme();
  const { toast } = useToast();

  const exportToCSV = (tableName: string, data: any[]) => {
    if (data.length === 0) {
      toast({
        title: "No Data",
        description: `No data available for ${tableName} table.`,
        variant: "destructive"
      });
      return;
    }

    // Get headers from the first object
    const headers = Object.keys(data[0]);
    
    // Create CSV content
    const csvContent = [
      headers.join(','), // Header row
      ...data.map(row => 
        headers.map(header => {
          const value = row[header];
          // Escape quotes and wrap in quotes if contains comma or quotes
          if (typeof value === 'string' && (value.includes(',') || value.includes('"') || value.includes('\n'))) {
            return `"${value.replace(/"/g, '""')}"`;
          }
          return value;
        }).join(',')
      )
    ].join('\n');

    // Create and download file
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    const url = URL.createObjectURL(blob);
    link.setAttribute('href', url);
    link.setAttribute('download', `data_management_system_${tableName}.csv`);
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);

    toast({
      title: "Export Successful",
      description: `${tableName} data exported to CSV successfully.`,
    });
  };
  
  // Mock data based on the images provided
  const analysesData = [
    {
      id: 'ec6d1d65-2e3f-4df5-ad6f-2a0b02264628',
      claim_id: '391fa83f-a5dc-4e46-94ca-654234de485f',
      source_id: 'b7495790-8cee-4ebb-a54c-a5c97d174f56',
      support: 'Uncertain',
      confidence: 50,
      reason: '',
      analysis_text: '',
      created_at: '2025-07-07 10:27:24.246712+03'
    },
    {
      id: 'a634b28f-4e7a-42de-ba7b-13db07be5597',
      claim_id: '391fa83f-a5dc-4e46-94ca-654234de485f',
      source_id: '92d40e8c-5980-492e-81e7-0b922d3363ee',
      support: 'Uncertain',
      confidence: 50,
      reason: '',
      analysis_text: '',
      created_at: '2025-07-07 10:27:24.246712+03'
    }
  ];

  const claimsData = [
    {
      id: '391fa83f-a5dc-4e46-94ca-654234de485f',
      text: 'diogo jota is actually alive sport cnn',
      verdict: 'Uncertain',
      confidence: 14,
      explanation: 'The claim "diogo jota is actually alive sport cnn" is uncertain based on 5 relevant sources. 0 partially support, 4 contradict.',
      category: 'general',
      created_at: '2025-07-07 10:27:24.246712+03',
      updated_at: '2025-07-07 10:27:24.246712+03'
    },
    {
      id: '821fb7f9-5f39-4ed5-9990-886b13d82186',
      text: 'NASA discovered water on Mars - reported by Space Today',
      verdict: 'TRUE',
      confidence: 84.5,
      explanation: 'The claim "NASA discovered water on Mars - reported by Space Today" is true based on 4 relevant sources. 3 support it strongly.',
      category: 'general',
      created_at: '2025-07-07 10:29:45.052282+03',
      updated_at: '2025-07-07 10:29:45.052282+03'
    }
  ];

  const sourcesData = [
    {
      id: 'b7495790-8cee-4ebb-a54c-a5c97d174f56',
      url: 'https://www.cnn.com/2025/07/04/sport/diogo-jota-death-what-we-know-spt',
      domain: 'www.cnn.com',
      title: 'Diogo Jota: What we know about the death of the Liverpool soccer ...',
      snippet: '3 days ago ... ... death of Liverpool soccer star Diogo Jota and his brother. 02:36. CNN — ... ICE detained a mother who was still breastfeeding. Her Marine ...',
      source_name: 'CNN',
      credibility_score: 1
    },
    {
      id: '92d40e8c-5980-492e-81e7-0b922d3363ee',
      url: 'https://www.cnn.com/2025/07/05/sport/video/diogo-jota-funeral-gondomar-portugal-digvid',
      domain: 'www.cnn.com',
      title: 'Video: Liverpool soccer stars join family in Portugal for Diogo Jota\'s ...',
      snippet: '2 days ago ... Soccer stars and family members gathered in Gondomar, Portugal to honour Diogo Jota and his brother, André Silva, who died in a car crash in ...',
      source_name: 'CNN',
      credibility_score: 1
    }
  ];

  return (
    <div className="min-h-screen bg-background p-6">
      <div className="max-w-7xl mx-auto space-y-6">
        {/* Header */}
        <div className="flex justify-between items-center">
          <h1 className="text-3xl font-bold text-primary-text flex items-center gap-3">
            <Database className="h-8 w-8 text-primary" />
            Data Management System
          </h1>
          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="icon"
              onClick={() => setTheme(theme === "dark" ? "light" : "dark")}
              className="border-border"
            >
              <Sun className="h-[1.2rem] w-[1.2rem] rotate-0 scale-100 transition-all dark:-rotate-90 dark:scale-0" />
              <Moon className="absolute h-[1.2rem] w-[1.2rem] rotate-90 scale-0 transition-all dark:rotate-0 dark:scale-100" />
              <span className="sr-only">Toggle theme</span>
            </Button>
            <Button
              onClick={onLogout}
              variant="outline"
              className="border-border text-primary-text hover:bg-surface"
            >
              <LogOut className="h-4 w-4 mr-2" />
              Logout
            </Button>
          </div>
        </div>

        {/* Data Tables */}
        <Tabs defaultValue="analyses" className="w-full">
          <TabsList className="grid w-full grid-cols-3 bg-surface border border-border">
            <TabsTrigger value="analyses" className="data-[state=active]:bg-primary data-[state=active]:text-white">
              Analyses
            </TabsTrigger>
            <TabsTrigger value="claims" className="data-[state=active]:bg-primary data-[state=active]:text-white">
              Claims
            </TabsTrigger>
            <TabsTrigger value="sources" className="data-[state=active]:bg-primary data-[state=active]:text-white">
              Sources
            </TabsTrigger>
          </TabsList>

          <TabsContent value="analyses" className="mt-4">
            <Card className="border-border shadow-lg bg-surface">
              <CardHeader className="flex flex-row items-center justify-between">
                <CardTitle className="text-xl text-primary-text flex items-center gap-2">
                  <FileText className="h-5 w-5 text-primary" />
                  Analyses Table
                </CardTitle>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => exportToCSV('analyses', analysesData)}
                  className="border-border"
                >
                  <Download className="h-4 w-4 mr-2" />
                  Export CSV
                </Button>
              </CardHeader>
              <CardContent>
                <div className="overflow-x-auto">
                  <Table>
                    <TableHeader>
                      <TableRow className="border-border">
                        <TableHead className="text-muted-text">ID</TableHead>
                        <TableHead className="text-muted-text">Claim ID</TableHead>
                        <TableHead className="text-muted-text">Source ID</TableHead>
                        <TableHead className="text-muted-text">Support</TableHead>
                        <TableHead className="text-muted-text">Confidence</TableHead>
                        <TableHead className="text-muted-text">Created At</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {analysesData.map((analysis) => (
                        <TableRow key={analysis.id} className="border-border">
                          <TableCell className="font-mono text-xs text-primary-text">{analysis.id.substring(0, 8)}...</TableCell>
                          <TableCell className="font-mono text-xs text-primary-text">{analysis.claim_id.substring(0, 8)}...</TableCell>
                          <TableCell className="font-mono text-xs text-primary-text">{analysis.source_id.substring(0, 8)}...</TableCell>
                          <TableCell>
                            <span className="px-2 py-1 bg-warning text-primary-text rounded-full text-xs">
                              {analysis.support}
                            </span>
                          </TableCell>
                          <TableCell className="text-primary-text">{analysis.confidence}</TableCell>
                          <TableCell className="text-xs text-primary-text">{new Date(analysis.created_at).toLocaleString()}</TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="claims" className="mt-4">
            <Card className="border-border shadow-lg bg-surface">
              <CardHeader className="flex flex-row items-center justify-between">
                <CardTitle className="text-xl text-primary-text flex items-center gap-2">
                  <FileText className="h-5 w-5 text-primary" />
                  Claims Table
                </CardTitle>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => exportToCSV('claims', claimsData)}
                  className="border-border"
                >
                  <Download className="h-4 w-4 mr-2" />
                  Export CSV
                </Button>
              </CardHeader>
              <CardContent>
                <div className="overflow-x-auto">
                  <Table>
                    <TableHeader>
                      <TableRow className="border-border">
                        <TableHead className="text-muted-text">ID</TableHead>
                        <TableHead className="text-muted-text">Text</TableHead>
                        <TableHead className="text-muted-text">Verdict</TableHead>
                        <TableHead className="text-muted-text">Confidence</TableHead>
                        <TableHead className="text-muted-text">Category</TableHead>
                        <TableHead className="text-muted-text">Created At</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {claimsData.map((claim) => (
                        <TableRow key={claim.id} className="border-border">
                          <TableCell className="font-mono text-xs text-primary-text">{claim.id.substring(0, 8)}...</TableCell>
                          <TableCell className="max-w-xs truncate text-primary-text">{claim.text}</TableCell>
                          <TableCell>
                            <span className={`px-2 py-1 rounded-full text-xs ${
                              claim.verdict === 'TRUE' ? 'bg-success text-primary-text' :
                              claim.verdict === 'Uncertain' ? 'bg-warning text-primary-text' :
                              'bg-error text-white'
                            }`}>
                              {claim.verdict}
                            </span>
                          </TableCell>
                          <TableCell className="text-primary-text">{claim.confidence}</TableCell>
                          <TableCell className="text-primary-text">{claim.category}</TableCell>
                          <TableCell className="text-xs text-primary-text">{new Date(claim.created_at).toLocaleString()}</TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="sources" className="mt-4">
            <Card className="border-border shadow-lg bg-surface">
              <CardHeader className="flex flex-row items-center justify-between">
                <CardTitle className="text-xl text-primary-text flex items-center gap-2">
                  <Globe className="h-5 w-5 text-primary" />
                  Sources Table
                </CardTitle>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => exportToCSV('sources', sourcesData)}
                  className="border-border"
                >
                  <Download className="h-4 w-4 mr-2" />
                  Export CSV
                </Button>
              </CardHeader>
              <CardContent>
                <div className="overflow-x-auto">
                  <Table>
                    <TableHeader>
                      <TableRow className="border-border">
                        <TableHead className="text-muted-text">ID</TableHead>
                        <TableHead className="text-muted-text">Domain</TableHead>
                        <TableHead className="text-muted-text">Title</TableHead>
                        <TableHead className="text-muted-text">Source Name</TableHead>
                        <TableHead className="text-muted-text">Credibility Score</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {sourcesData.map((source) => (
                        <TableRow key={source.id} className="border-border">
                          <TableCell className="font-mono text-xs text-primary-text">{source.id.substring(0, 8)}...</TableCell>
                          <TableCell className="text-primary-text">{source.domain}</TableCell>
                          <TableCell className="max-w-xs truncate text-primary-text">{source.title}</TableCell>
                          <TableCell className="text-primary-text">{source.source_name}</TableCell>
                          <TableCell className="text-primary-text">{source.credibility_score}</TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
};

export default AdminDashboard;
