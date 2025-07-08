export interface FactCheckSource {
  confidence: number;
  content: string;
  reason: string;
  relevant: boolean;
  snippet: string;
  source: string;
  support: 'True' | 'False' | 'Unknown';
  title: string;
  url: string;
}

export interface FactCheckResult {
  category: string;
  claim_id: string;
  confidence: number;
  explanation: string;
  sources: FactCheckSource[];
  status: 'success' | 'error';
  verdict: 'True' | 'False' | 'Unknown';
}

export type Theme = 'light' | 'dark';
export type Position = { x: number; y: number };
export type HistoryItem = { text: string; timestamp: string };
export type Tab = 'results' | 'history' | 'settings';