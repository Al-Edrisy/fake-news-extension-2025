import React, { useState, useRef, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent } from '@/components/ui/card';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Tooltip, TooltipContent, TooltipTrigger } from '@/components/ui/tooltip';
import { 
  Copy, 
  Edit3, 
  MoreHorizontal, 
  CheckCircle, 
  XCircle, 
  Clock, 
  RefreshCw,
  ExternalLink,
  Shield,
  User,
  Bot,
  ChevronDown,
  ChevronUp
} from 'lucide-react';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';

interface Source {
  title: string;
  url: string;
  domain: string;
  confidence: number;
  snippet: string;
  support?: string;
  date?: string;
}

interface ChatMessageData {
  id: string;
  text: string;
  isUser: boolean;
  timestamp: number;
  status?: 'pending' | 'sent' | 'error';
  aiData?: {
    verdict: string;
    confidence: number;
    conclusion: string;
    explanation: string;
    sources: Source[];
    category?: string;
  };
  parentId?: string;
  children: string[];
}

interface ChatMessageProps {
  message: ChatMessageData;
  onEdit?: (id: string, newText: string) => void;
  onRegenerate?: (id: string) => void;
  onCopy?: (text: string) => void;
  isEditing?: boolean;
  editingText?: string;
  setEditingText?: (text: string) => void;
  onSaveEdit?: () => void;
  onCancelEdit?: () => void;
}

function VerdictBadge({ verdict, confidence }: { verdict: string; confidence: number }) {
  const getVerdictStyle = (verdict: string) => {
    const lower = verdict.toLowerCase();
    if (lower.includes('true') || lower.includes('supported')) {
      return 'bg-emerald-100 text-emerald-800 border-emerald-200 dark:bg-emerald-900/30 dark:text-emerald-300 dark:border-emerald-700';
    }
    if (lower.includes('false') || lower.includes('refuted')) {
      return 'bg-red-100 text-red-800 border-red-200 dark:bg-red-900/30 dark:text-red-300 dark:border-red-700';
    }
    if (lower.includes('partial') || lower.includes('mixed')) {
      return 'bg-amber-100 text-amber-800 border-amber-200 dark:bg-amber-900/30 dark:text-amber-300 dark:border-amber-700';
    }
    return 'bg-slate-100 text-slate-800 border-slate-200 dark:bg-slate-900/30 dark:text-slate-300 dark:border-slate-700';
  };

  return (
    <div className="flex items-center gap-2 mb-3">
      <Badge variant="outline" className={`${getVerdictStyle(verdict)} font-semibold px-3 py-1`}>
        {verdict}
      </Badge>
      <div className="flex items-center gap-1 text-sm text-muted-foreground">
        <span>Confidence:</span>
        <span className="font-semibold text-foreground">{confidence.toFixed(1)}%</span>
      </div>
    </div>
  );
}

function SourceCard({ source }: { source: Source }) {
  const [expanded, setExpanded] = useState(false);
  const [imgError, setImgError] = useState(false);
  
  const getSupportStyle = (support?: string) => {
    if (!support) return '';
    const lower = support.toLowerCase();
    if (lower.includes('support')) return 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-300';
    if (lower.includes('refute') || lower.includes('contradict')) return 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-300';
    return 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-300';
  };

  const getFaviconUrl = (domain: string) => {
    return `https://www.google.com/s2/favicons?domain=${domain}&sz=32`;
  };

  const extractDomain = (url: string) => {
    try {
      return new URL(url).hostname.replace(/^www\./, '');
    } catch {
      return source.domain || 'unknown';
    }
  };

  const domain = extractDomain(source.url || source.domain || '');

  return (
    <Card className="mb-2 border-l-4 border-l-primary/30 hover:border-l-primary/60 transition-colors">
      <CardContent className="p-4">
        <div className="flex items-start gap-3">
          {/* Domain Avatar/Favicon */}
          <div className="flex-shrink-0 mt-1">
            <div className="w-8 h-8 rounded-full bg-muted flex items-center justify-center overflow-hidden border border-border source-card-avatar domain-avatar">
              {!imgError ? (
                <img
                  src={getFaviconUrl(domain)}
                  alt={domain}
                  className="w-6 h-6 object-contain"
                  onError={() => setImgError(true)}
                />
              ) : (
                <div className="favicon-fallback w-full h-full flex items-center justify-center">
                  {domain.charAt(0).toUpperCase()}
                </div>
              )}
            </div>
          </div>

          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 mb-2">
              <a 
                href={source.url} 
                target="_blank" 
                rel="noopener noreferrer"
                className="font-medium text-primary hover:text-primary/80 transition-colors truncate"
              >
                {source.title}
              </a>
              <ExternalLink className="h-3 w-3 text-muted-foreground flex-shrink-0" />
            </div>
            
            <div className="flex items-center gap-2 mb-2 text-sm text-muted-foreground">
              <span className="truncate">{domain}</span>
              {source.date && (
                <>
                  <span>•</span>
                  <span>{new Date(source.date).toLocaleDateString()}</span>
                </>
              )}
            </div>

            <div className="flex items-center gap-2 mb-2">
              {source.support && (
                <Badge variant="outline" className={`text-xs ${getSupportStyle(source.support)}`}>
                  {source.support}
                </Badge>
              )}
              <Badge variant="outline" className="text-xs">
                {source.confidence.toFixed(0)}% confidence
              </Badge>
            </div>

            <div className={`text-sm text-muted-foreground ${expanded ? '' : 'line-clamp-2'}`}>
              {source.snippet}
            </div>
            
            {source.snippet.length > 150 && (
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setExpanded(!expanded)}
                className="mt-1 h-auto p-0 text-xs text-primary hover:text-primary/80"
              >
                {expanded ? (
                  <>
                    <ChevronUp className="h-3 w-3 mr-1" />
                    Show less
                  </>
                ) : (
                  <>
                    <ChevronDown className="h-3 w-3 mr-1" />
                    Show more
                  </>
                )}
              </Button>
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

function AIResponse({ aiData }: { aiData: NonNullable<ChatMessageData['aiData']> }) {
  const [showAllSources, setShowAllSources] = useState(false);
  const displayedSources = showAllSources ? aiData.sources : aiData.sources.slice(0, 3);

  return (
    <div className="space-y-4">
      <VerdictBadge verdict={aiData.verdict} confidence={aiData.confidence} />
      
      {aiData.conclusion && (
        <div className="p-4 bg-primary/5 border border-primary/20 rounded-lg">
          <h4 className="font-semibold text-primary mb-2">Conclusion</h4>
          <p className="text-sm">{aiData.conclusion}</p>
        </div>
      )}

      {aiData.explanation && (
        <div className="prose prose-sm dark:prose-invert max-w-none">
          <ReactMarkdown remarkPlugins={[remarkGfm]}>
            {aiData.explanation}
          </ReactMarkdown>
        </div>
      )}

      {aiData.sources && aiData.sources.length > 0 && (
        <div>
          <h4 className="font-semibold mb-3 flex items-center gap-2">
            <Shield className="h-4 w-4" />
            Sources ({aiData.sources.length})
          </h4>
          
          <div className="space-y-2">
            {displayedSources.map((source, index) => (
              <SourceCard key={index} source={source} />
            ))}
          </div>

          {aiData.sources.length > 3 && (
            <Button
              variant="outline"
              size="sm"
              onClick={() => setShowAllSources(!showAllSources)}
              className="mt-3 w-full"
            >
              {showAllSources ? (
                <>
                  <ChevronUp className="h-4 w-4 mr-2" />
                  Show fewer sources
                </>
              ) : (
                <>
                  <ChevronDown className="h-4 w-4 mr-2" />
                  Show {aiData.sources.length - 3} more sources
                </>
              )}
            </Button>
          )}
        </div>
      )}
    </div>
  );
}

export function ChatMessage({ 
  message, 
  onEdit, 
  onRegenerate, 
  onCopy,
  isEditing,
  editingText,
  setEditingText,
  onSaveEdit,
  onCancelEdit
}: ChatMessageProps) {
  const [copied, setCopied] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (isEditing && inputRef.current) {
      inputRef.current.focus();
      inputRef.current.select();
    }
  }, [isEditing]);

  const handleCopy = () => {
    const textToCopy = message.aiData 
      ? `${message.text}\n\nVerdict: ${message.aiData.verdict}\nConfidence: ${message.aiData.confidence}%\nConclusion: ${message.aiData.conclusion}`
      : message.text;
    
    navigator.clipboard.writeText(textToCopy);
    onCopy?.(textToCopy);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleEditSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSaveEdit?.();
  };

  const getStatusIcon = () => {
    switch (message.status) {
      case 'pending':
        return <Clock className="h-3 w-3 text-amber-500 animate-pulse" />;
      case 'error':
        return <XCircle className="h-3 w-3 text-red-500" />;
      case 'sent':
        return <CheckCircle className="h-3 w-3 text-green-500" />;
      default:
        return null;
    }
  };

  return (
    <div className={`flex gap-3 mb-6 ${message.isUser ? 'justify-end' : 'justify-start'}`}>
      {!message.isUser && (
        <Avatar className="h-8 w-8 border-2 border-primary/20">
          <AvatarFallback className="bg-primary/10">
            <Bot className="h-4 w-4 text-primary" />
          </AvatarFallback>
        </Avatar>
      )}

      <div className={`max-w-[80%] ${message.isUser ? 'order-first' : ''}`}>
        <div className={`rounded-2xl px-4 py-3 ${
          message.isUser 
            ? 'bg-primary text-primary-foreground ml-auto' 
            : 'bg-muted/50 border border-border'
        }`}>
          {isEditing ? (
            <form onSubmit={handleEditSubmit} className="space-y-2">
              <Input
                ref={inputRef}
                value={editingText}
                onChange={(e) => setEditingText?.(e.target.value)}
                className="bg-transparent border-none focus-visible:ring-0 p-0"
                onKeyDown={(e) => {
                  if (e.key === 'Escape') {
                    onCancelEdit?.();
                  }
                }}
              />
              <div className="flex gap-2">
                <Button type="submit" size="sm" variant="secondary">
                  Save
                </Button>
                <Button type="button" size="sm" variant="ghost" onClick={onCancelEdit}>
                  Cancel
                </Button>
              </div>
            </form>
          ) : (
            <>
              <div className="flex items-start justify-between gap-2">
                <p className="text-sm leading-relaxed flex-1">{message.text}</p>
                
                <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                  {getStatusIcon()}
                  
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button variant="ghost" size="sm" className="h-6 w-6 p-0">
                        <MoreHorizontal className="h-3 w-3" />
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                      <DropdownMenuItem onClick={handleCopy}>
                        <Copy className="h-3 w-3 mr-2" />
                        {copied ? 'Copied!' : 'Copy'}
                      </DropdownMenuItem>
                      {message.isUser && onEdit && (
                        <DropdownMenuItem onClick={() => onEdit(message.id, message.text)}>
                          <Edit3 className="h-3 w-3 mr-2" />
                          Edit
                        </DropdownMenuItem>
                      )}
                      {!message.isUser && onRegenerate && (
                        <DropdownMenuItem onClick={() => onRegenerate(message.id)}>
                          <RefreshCw className="h-3 w-3 mr-2" />
                          Regenerate
                        </DropdownMenuItem>
                      )}
                    </DropdownMenuContent>
                  </DropdownMenu>
                </div>
              </div>

              <div className="flex items-center gap-2 mt-1 text-xs text-muted-foreground">
                <span>{new Date(message.timestamp).toLocaleTimeString()}</span>
                {message.status && (
                  <span className="capitalize">{message.status}</span>
                )}
              </div>
            </>
          )}
        </div>

        {message.aiData && !isEditing && (
          <div className="mt-4 space-y-4">
            <AIResponse aiData={message.aiData} />
          </div>
        )}
      </div>

      {message.isUser && (
        <Avatar className="h-8 w-8 border-2 border-primary/20">
          <AvatarFallback className="bg-primary/10">
            <User className="h-4 w-4 text-primary" />
          </AvatarFallback>
        </Avatar>
      )}
    </div>
  );
}