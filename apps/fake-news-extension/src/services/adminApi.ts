import { config } from '@/utils/config';

export interface Claim {
  id: string;
  text: string;
  verdict: string;
  confidence: number;
  explanation: string;
  conclusion: string;
  category: string;
  created_at: string;
}

export interface Source {
  id: string;
  url: string;
  domain: string;
  title: string;
  snippet: string;
  content: string;
  published_date: string | null;
  source_name: string;
  credibility_score: number;
  last_scraped_at: string | null;
}

export interface Analysis {
  analysis_id?: string;
  id?: string;
  claim_id: string;
  source_id: string;
  support: string;
  confidence: number;
  reason: string;
  analysis_text: string;
  created_at: string;
  claim_text?: string;
  conclusion?: string;
  source_url?: string;
}

export interface SystemStats {
  total_claims: number;
  total_sources: number;
  total_analyses: number;
  high_confidence_claims: number;
  supported_analyses: number;
  recent_analyses: number;
}

export interface PaginationInfo {
  page: number;
  limit: number;
  total: number;
  total_pages: number;
  has_next: boolean;
  has_prev: boolean;
}

export interface PaginatedResponse<T> {
  data: T[];
  pagination: PaginationInfo;
}

export interface ExportFilters {
  search?: string;
  category?: string;
  verdict?: string;
  domain?: string;
  support?: string;
}

export interface ExportResponse<T> {
  data: T[];
  filters: ExportFilters;
}

class AdminApiService {
  private baseUrl: string;

  constructor() {
    this.baseUrl = config.apiBaseUrl;
  }

  private async request<T>(endpoint: string, options?: RequestInit): Promise<T> {
    const url = `${this.baseUrl}${endpoint}`;
    
    try {
      const response = await fetch(url, {
        headers: {
          'Content-Type': 'application/json',
          ...options?.headers,
        },
        ...options,
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      return await response.json();
    } catch (error) {
      console.error('API request failed:', error);
      throw error;
    }
  }

  // Claims API with pagination and filtering
  async getClaims(
    page: number = 1, 
    limit: number = 20, 
    search?: string, 
    category?: string, 
    verdict?: string
  ): Promise<PaginatedResponse<Claim>> {
    const params = new URLSearchParams({
      page: page.toString(),
      limit: limit.toString(),
      ...(search && { search }),
      ...(category && { category }),
      ...(verdict && { verdict })
    });
    
    return this.request<PaginatedResponse<Claim>>(`/public/claims?${params}`);
  }

  async getHighConfidenceClaims(page: number = 1, limit: number = 20): Promise<PaginatedResponse<Claim>> {
    const params = new URLSearchParams({
      page: page.toString(),
      limit: limit.toString()
    });
    return this.request<PaginatedResponse<Claim>>(`/public/claims/high-confidence?${params}`);
  }

  async getClaimsByCategory(category: string, page: number = 1, limit: number = 20): Promise<PaginatedResponse<Claim>> {
    const params = new URLSearchParams({
      page: page.toString(),
      limit: limit.toString()
    });
    return this.request<PaginatedResponse<Claim>>(`/public/claims/by-category/${category}?${params}`);
  }

  // Sources API with pagination and filtering
  async getSources(
    page: number = 1, 
    limit: number = 20, 
    search?: string, 
    domain?: string
  ): Promise<PaginatedResponse<Source>> {
    const params = new URLSearchParams({
      page: page.toString(),
      limit: limit.toString(),
      ...(search && { search }),
      ...(domain && { domain })
    });
    
    return this.request<PaginatedResponse<Source>>(`/public/sources?${params}`);
  }

  async getSourcesByDomain(domain: string, page: number = 1, limit: number = 20): Promise<PaginatedResponse<Source>> {
    const params = new URLSearchParams({
      page: page.toString(),
      limit: limit.toString()
    });
    return this.request<PaginatedResponse<Source>>(`/public/sources/by-domain/${domain}?${params}`);
  }

  // Analyses API with pagination and filtering
  async getAnalyses(
    page: number = 1, 
    limit: number = 20, 
    search?: string, 
    support?: string
  ): Promise<PaginatedResponse<Analysis>> {
    const params = new URLSearchParams({
      page: page.toString(),
      limit: limit.toString(),
      ...(search && { search }),
      ...(support && { support })
    });
    
    return this.request<PaginatedResponse<Analysis>>(`/public/analyses?${params}`);
  }

  async getSupportedAnalyses(page: number = 1, limit: number = 20): Promise<PaginatedResponse<Analysis>> {
    const params = new URLSearchParams({
      page: page.toString(),
      limit: limit.toString()
    });
    return this.request<PaginatedResponse<Analysis>>(`/public/analyses/supported?${params}`);
  }

  async getLatestAnalyses(page: number = 1, limit: number = 20): Promise<PaginatedResponse<Analysis>> {
    const params = new URLSearchParams({
      page: page.toString(),
      limit: limit.toString()
    });
    return this.request<PaginatedResponse<Analysis>>(`/public/analyses/latest?${params}`);
  }

  // Export API for CSV
  async exportClaimsCSV(filters: ExportFilters): Promise<ExportResponse<Claim>> {
    const params = new URLSearchParams();
    if (filters.search) params.append('search', filters.search);
    if (filters.category) params.append('category', filters.category);
    if (filters.verdict) params.append('verdict', filters.verdict);
    
    return this.request<ExportResponse<Claim>>(`/public/export/claims?${params}`);
  }

  async exportSourcesCSV(filters: ExportFilters): Promise<ExportResponse<Source>> {
    const params = new URLSearchParams();
    if (filters.search) params.append('search', filters.search);
    if (filters.domain) params.append('domain', filters.domain);
    
    return this.request<ExportResponse<Source>>(`/public/export/sources?${params}`);
  }

  async exportAnalysesCSV(filters: ExportFilters): Promise<ExportResponse<Analysis>> {
    const params = new URLSearchParams();
    if (filters.search) params.append('search', filters.search);
    if (filters.support) params.append('support', filters.support);
    
    return this.request<ExportResponse<Analysis>>(`/public/export/analyses?${params}`);
  }

  // System Health
  async getHealthCheck(): Promise<{ status: string; timestamp: number; service: string; version: string }> {
    return this.request<{ status: string; timestamp: number; service: string; version: string }>('/health');
  }

  // Get system statistics from the new endpoint
  async getSystemStats(): Promise<SystemStats> {
    return this.request<SystemStats>('/public/stats');
  }
}

export const adminApi = new AdminApiService(); 