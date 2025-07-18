import React, { useState, useRef, useEffect } from 'react';
import { Button } from '../components/ui/button';
import { Input } from '../components/ui/input';
import { Card } from '../components/ui/card';
import { Badge } from '../components/ui/badge';
import { LoaderCircle, CheckCircle, XCircle, AlertTriangle, Copy, Shield, ExternalLink, Moon, Sun, ArrowDown, File, Link as LinkIcon, MoreHorizontal, ChevronRight } from 'lucide-react';
import { FixedSizeList as List, ListChildComponentProps } from 'react-window';
import Navbar from "@/components/Navbar";
import { useTheme } from "next-themes";
import { verifyClaim } from '../utils/config';
import { Progress } from '../components/ui/progress'; // If you have a progress bar component
import { v4 as uuidv4 } from 'uuid';

const EXAMPLES = [
  // 1 - Thunderstorm evacuation
  "Did Texas order evacuations due to thunderstorms?",
  "Le Texas a-t-il ordonné des évacuations en raison des orages ?",
  "هل أمرت تكساس بالإخلاء بسبب العواصف الرعدية؟",
  "德克萨斯州是否因雷暴而下令疏散？",
  "¿Texas ordenó evacuaciones debido a tormentas eléctricas?",
  "Teksas, gök gürültülü fırtınalar nedeniyle tahliye emri verdi mi?",

  // 2 - Election fraud
  "Are the elections in 2025 rigged in some states?",
  "Les élections de 2025 sont-elles truquées dans certains États ?",
  "هل تم تزوير الانتخابات في عام 2025 في بعض الولايات؟",
  "2025 年的选举在某些州是否被操纵？",
  "¿Están manipuladas las elecciones de 2025 en algunos estados?",
  "2025 seçimleri bazı eyaletlerde hileli mi?",

  // 3 - Climate change
  "Is there credible evidence of climate change accelerating?",
  "Existe-t-il des preuves crédibles d'une accélération du changement climatique ?",
  "هل توجد أدلة موثوقة على تسارع تغير المناخ؟",
  "是否有可靠证据表明气候变化正在加速？",
  "¿Existe evidencia creíble de que el cambio climático se está acelerando?",
  "İklim değişikliğinin hızlandığına dair güvenilir kanıt var mı?",

  // 4 - Vaccine safety
  "Are these reports about vaccine side effects accurate?",
  "Ces rapports sur les effets secondaires des vaccins sont-ils exacts ?",
  "هل هذه التقارير حول الآثار الجانبية للقاحات دقيقة؟",
  "关于疫苗副作用的这些报告准确吗？",
  "¿Son precisos estos informes sobre efectos secundarios de vacunas?",
  "Aşı yan etkileriyle ilgili bu raporlar doğru mu?",

  // 5 - New tax laws
  "Is the claim about new tax laws true or false?",
  "La déclaration sur les nouvelles lois fiscales est-elle vraie ou fausse ?",
  "هل الادعاء بشأن قوانين الضرائب الجديدة صحيح أم خاطئ؟",
  "关于新税法的说法是真是假？",
  "¿Es verdadera o falsa la afirmación sobre las nuevas leyes fiscales?",
  "Yeni vergi yasalarıyla ilgili iddia doğru mu yoksa yanlış mı?",

  // 6 - War outbreak
  "Has a new war started in Eastern Europe recently?",
  "Une nouvelle guerre a-t-elle éclaté récemment en Europe de l'Est ?",
  "هل اندلعت حرب جديدة في أوروبا الشرقية مؤخرًا؟",
  "最近东欧是否爆发了新的战争？",
  "¿Ha comenzado una nueva guerra en Europa del Este recientemente?",
  "Son zamanlarda Doğu Avrupa'da yeni bir savaş başladı mı?",

  // 7 - AI replacing jobs
  "Is artificial intelligence replacing more jobs every year?",
  "L'intelligence artificielle remplace-t-elle de plus en plus d'emplois chaque année ?",
  "هل الذكاء الاصطناعي يستبدل المزيد من الوظائف كل عام؟",
  "人工智能每年是否取代越来越多的工作？",
  "¿La inteligencia artificial está reemplazando más trabajos cada año?",
  "Yapay zeka her yıl daha fazla işi mi değiştiriyor?",

  // 8 - Cancer cure discovery
  "Has a cure for cancer been discovered recently?",
  "Un remède contre le cancer a-t-il été découvert récemment ?",
  "هل تم اكتشاف علاج للسرطان مؤخرًا؟",
  "最近发现了治疗癌症的方法吗？",
  "¿Se ha descubierto una cura para el cáncer recientemente?",
  "Yakın zamanda kanserin tedavisi bulundu mu?"
];


// Add a list of animated source badges/icons for the empty state
const EMPTY_SOURCES = [
  { title: 'CNN', color: 'bg-blue-400', url: 'https://cnn.com' },
  { title: 'Reuters', color: 'bg-yellow-400', url: 'https://reuters.com' },
  { title: 'BBC', color: 'bg-red-400', url: 'https://bbc.com' },
  { title: 'AP', color: 'bg-green-400', url: 'https://apnews.com' },
];

function AnimatedPlaceholder({ active, examples }: { active: boolean, examples: string[] }) {
  const [index, setIndex] = useState(0);
  const [fade, setFade] = useState(true);
  useEffect(() => {
    if (!active) return;
    const interval = setInterval(() => {
      setFade(false);
      setTimeout(() => {
        setIndex(i => (i + 1) % examples.length);
        setFade(true);
      }, 4000 + Math.random() * 2000);
    }, 4000 + Math.random() * 2000);
    return () => clearInterval(interval);
  }, [active, examples.length]);
  return (
    <span
      aria-hidden
      className={`transition-opacity duration-400 ease-in-out select-none ${fade ? 'opacity-70' : 'opacity-0'}`}
      style={{ color: 'var(--tw-prose-muted, #888)' }}
    >
      {examples[index]}
    </span>
  );
}

function LoadingIndicator() {
  return (
    <span className="inline-flex items-center gap-1 ml-2">
      <span className="w-2 h-2 rounded-full bg-primary animate-bounce" style={{ animationDelay: '0s' }}></span>
      <span className="w-2 h-2 rounded-full bg-primary animate-bounce" style={{ animationDelay: '0.2s' }}></span>
      <span className="w-2 h-2 rounded-full bg-primary animate-bounce" style={{ animationDelay: '0.4s' }}></span>
    </span>
  );
}

function ThemeToggle({ theme, setTheme }: { theme: string, setTheme: (t: string) => void }) {
  return (
    <Button variant="ghost" size="icon" aria-label="Toggle theme" onClick={() => setTheme(theme === 'dark' ? 'light' : 'dark')}>
      {theme === 'dark' ? <Sun className="w-5 h-5" /> : <Moon className="w-5 h-5" />}
    </Button>
  );
}

function CopyButton({ text, onCopied }: { text: string, onCopied?: () => void }) {
  const [copied, setCopied] = useState(false);
  return (
    <Button
      variant="ghost"
      size="icon"
      aria-label="Copy"
      onClick={() => {
        navigator.clipboard.writeText(text);
        setCopied(true);
        if (onCopied) onCopied();
        setTimeout(() => setCopied(false), 1200);
      }}
    >
      <Copy className="w-5 h-5" />
      {copied && <span className="absolute top-0 left-1/2 -translate-x-1/2 text-xs text-green-500 bg-white/80 dark:bg-slate-900/80 px-2 py-0.5 rounded shadow">Copied!</span>}
    </Button>
  );
}

function ErrorBanner({ error, onRetry }: { error: string, onRetry?: () => void }) {
  return (
    <div className="w-full bg-red-100 dark:bg-red-900/60 text-red-700 dark:text-red-200 px-4 py-2 rounded-xl mb-2 text-center font-semibold shadow flex flex-col items-center gap-2">
      <span>{error}</span>
      {onRetry && (
        <Button size="sm" variant="destructive" onClick={onRetry} className="mt-1">Retry</Button>
      )}
    </div>
  );
}

function ScrollToBottomButton({ onClick, visible }: { onClick: () => void, visible: boolean }) {
  if (!visible) return null;
  return (
    <Button variant="ghost" size="icon" className="fixed bottom-24 right-6 z-50 bg-white/80 dark:bg-slate-900/80 shadow-lg rounded-full" onClick={onClick} aria-label="Scroll to bottom">
      <ArrowDown className="w-6 h-6 text-primary" />
    </Button>
  );
}

function getFaviconUrl(domain: string) {
  return `https://www.google.com/s2/favicons?domain=${domain}&sz=64`;
}

function extractDomain(urlOrDomain: string): string {
  if (!urlOrDomain) return '';
  // If it's already a domain (no protocol, no slashes)
  if (!urlOrDomain.includes('://') && !urlOrDomain.includes('/')) return urlOrDomain;
  try {
    const url = new URL(urlOrDomain);
    return url.hostname.replace(/^www\./, '');
  } catch {
    // fallback: try to extract domain-like pattern
    const match = urlOrDomain.match(/([\w-]+\.[\w.-]+)/);
    return match ? match[1].replace(/^www\./, '') : urlOrDomain;
  }
}

function SourceReferences({ sources }: { sources: { title: string; url: string; domain: string; confidence: number; snippet: string }[] }) {
  // Remove duplicate domains
  const uniqueSources = sources.filter((src, idx, arr) => arr.findIndex(s => s.domain === src.domain) === idx);
  return (
    <div className="mt-2 flex flex-row items-center gap-1">
      <div className="flex flex-row -space-x-2">
        {uniqueSources.map((src, i) => (
          <a
            key={i}
            href={src.url}
            target="_blank"
            rel="noopener noreferrer"
            className="group relative z-10 hover:z-20"
            title={src.title || src.domain || src.url}
            style={{ marginLeft: i === 0 ? 0 : '-0.5rem' }}
          >
            <span className="w-7 h-7 rounded-full bg-slate-200 dark:bg-slate-700 flex items-center justify-center text-xs font-bold text-primary shadow border-2 border-white dark:border-slate-900 overflow-hidden group-hover:scale-110 transition-transform relative">
              <img
                src={getFaviconUrl(src.domain)}
                alt={src.domain}
                className="w-full h-full object-cover"
                onError={(e) => { (e.target as HTMLImageElement).style.display = 'none'; }}
                style={{ minWidth: 20, minHeight: 20 }}
              />
              <span className="absolute left-0 right-0 text-center w-full" style={{ display: 'none' }}>{src.title ? src.title[0] : 'S'}</span>
            </span>
          </a>
        ))}
      </div>
    </div>
  );
}

// Skeleton for AI response
function AISkeleton() {
  return (
    <div className="max-w-lg w-full mb-2 px-5 py-4 rounded-2xl shadow glassmorphic bg-white/60 dark:bg-slate-900/60 flex flex-col gap-3 animate-pulse">
      <div className="flex items-center gap-3 mb-2">
        <span className="w-6 h-6 rounded-full bg-slate-200 dark:bg-slate-700" />
        <span className="h-4 w-20 rounded bg-slate-200 dark:bg-slate-700" />
        <span className="h-4 w-12 rounded bg-slate-200 dark:bg-slate-700 ml-2" />
      </div>
      <div className="h-4 w-3/4 rounded bg-slate-200 dark:bg-slate-700 mb-1" />
      <div className="h-4 w-2/3 rounded bg-slate-200 dark:bg-slate-700 mb-1" />
      <div className="h-4 w-1/2 rounded bg-slate-200 dark:bg-slate-700 mb-1" />
      <div className="h-4 w-1/3 rounded bg-slate-200 dark:bg-slate-700" />
    </div>
  );
}

// Streaming AI response hook
import { useRef as useReactRef } from 'react';
function useStreamingText(fullText: string, loading: boolean) {
  const [displayed, setDisplayed] = useState('');
  const indexRef = useReactRef(0);
  useEffect(() => {
    if (!loading && fullText) {
      setDisplayed(fullText);
      return;
    }
    if (!loading) return;
    setDisplayed('');
    indexRef.current = 0;
    let cancelled = false;
    function stream() {
      if (cancelled) return;
      if (indexRef.current < fullText.length) {
        setDisplayed(fullText.slice(0, indexRef.current + 1));
        indexRef.current++;
        setTimeout(stream, 12 + Math.random() * 30);
      }
    }
    stream();
    return () => { cancelled = true; };
  }, [fullText, loading]);
  return displayed;
}

function VerdictBadge({ verdict }: { verdict: string }) {
  let color = 'bg-yellow-400 text-yellow-900';
  if (verdict?.toLowerCase().includes('true')) color = 'bg-green-400 text-green-900';
  if (verdict?.toLowerCase().includes('false')) color = 'bg-red-400 text-red-900';
  if (verdict?.toLowerCase().includes('partial')) color = 'bg-yellow-400 text-yellow-900';
  return (
    <span className={`inline-flex items-center px-2 py-1 rounded text-xs font-bold ${color}`}>
      {verdict}
    </span>
  );
}

function SourceCard({ source }) {
  // Favicon fallback state
  const [imgError, setImgError] = React.useState(false);
  // Prefer source.domain, but extract from URL if missing or invalid
  const domain = extractDomain(source.domain || source.url);
  const displayLetter = (domain || source.title || 'S')[0]?.toUpperCase();
  return (
    <div className="border rounded-lg p-3 mb-2 bg-white dark:bg-slate-800 shadow">
      <div className="flex items-center gap-2 mb-1">
        {/* Avatar with favicon or fallback icon */}
        <a href={source.url} target="_blank" rel="noopener noreferrer" className="flex-shrink-0 group relative" title={domain}>
          <span className="w-6 h-6 rounded-full bg-slate-200 dark:bg-slate-700 flex items-center justify-center overflow-hidden border border-slate-300 dark:border-slate-700 shadow text-xs font-bold text-primary">
            {!imgError ? (
              <img
                src={getFaviconUrl(domain)}
                alt={domain}
                className="w-4 h-4 object-contain"
                onError={() => setImgError(true)}
              />
            ) : (
              <LinkIcon className="w-4 h-4 text-muted-foreground" />
            )}
          </span>
        </a>
        <div className="flex flex-col min-w-0 flex-1">
          <a href={source.url} target="_blank" rel="noopener noreferrer" className="font-semibold text-primary hover:underline truncate">
          {source.title}
        </a>
          {/* Always show the domain as a subtle placeholder */}
          <span className="text-xs text-muted-foreground truncate" title={domain}>{domain}</span>
        </div>
        {/* Only show date if available */}
        {source.date && (
          <span className="text-xs text-muted-foreground whitespace-nowrap">{new Date(source.date).toLocaleDateString()}</span>
        )}
        {/* Support badge */}
        {source.support && (
          <span className={`ml-2 px-2 py-0.5 rounded text-xs font-medium ${source.support === 'Partial' ? 'bg-yellow-200 text-yellow-800' : source.support === 'Support' ? 'bg-green-200 text-green-800' : 'bg-red-200 text-red-800'}`}>
          {source.support}
        </span>
        )}
        {/* Confidence badge */}
        {typeof source.confidence === 'number' && (
        <span className="ml-2 px-2 py-0.5 rounded text-xs bg-slate-200 text-slate-800">{source.confidence?.toFixed(0)}%</span>
        )}
      </div>
      <div className="text-sm text-muted-foreground mb-1">{source.snippet}</div>
      {source.reason && <div className="text-xs text-slate-500 italic">{source.reason}</div>}
    </div>
  );
}

function VerdictMessage({
  verdict,
  confidence,
  conclusion,
  explanation,
  sources,
  streaming,
  loading
}: {
  verdict: string,
  confidence: number,
  conclusion: string,
  explanation: string,
  sources: any[],
  streaming?: boolean,
  loading?: boolean
}) {
  const streamedExplanation = useStreamingText(explanation, streaming ? (loading ?? false) : false);
  return (
    <div className="flex flex-col items-start w-full">
      <div className="max-w-lg w-full mb-1">
        <div className="flex items-center gap-2 mb-2">
          <VerdictBadge verdict={verdict} />
          <span className="ml-2 text-base font-semibold">{conclusion}</span>
        </div>
        <div className="mb-2">
          <span className="text-sm">{streamedExplanation}</span>
        </div>
        <div className="flex items-center gap-2 mb-2">
          <span className="text-xs font-medium">Confidence:</span>
          <span className="font-bold">{confidence?.toFixed(1)}%</span>
          {/* If you have a Progress component */}
          {/* <Progress value={confidence} max={100} className="w-32 h-2" /> */}
        </div>
        {sources && sources.length > 0 && (
          <div className="mt-2">
            <div className="font-semibold mb-1 text-sm">Sources:</div>
            {sources.map((src, i) => <SourceCard key={i} source={src} />)}
          </div>
        )}
      </div>
    </div>
  );
}

// Helper: Copy to clipboard with feedback
function useCopyToClipboard() {
  const [copied, setCopied] = useState(false);
  const copy = (text: string) => {
    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 1200);
  };
  return { copied, copy };
}

// ChatMessage with three-dots menu, edit/copy, branch navigation
function ChatMessage({ message, isUser, onEdit, isEditing, editingText, setEditingText, onSaveEdit, editingMsgId, branches, onBranchNav }: {
  message: { text: string, id: string, children?: string[], status?: 'pending' | 'sent' | 'error' },
  isUser: boolean,
  onEdit?: (id: string) => void,
  isEditing?: boolean,
  editingText?: string,
  setEditingText?: (t: string) => void,
  onSaveEdit?: () => void,
  editingMsgId?: string | null,
  branches?: string[],
  onBranchNav?: (childIdx: number) => void,
}) {
  const [menuOpen, setMenuOpen] = useState(false);
  const { copied, copy } = useCopyToClipboard();
  const inputRef = useRef<HTMLInputElement>(null);
  useEffect(() => { if (isEditing && inputRef.current) inputRef.current.focus(); }, [isEditing]);
  // Branch navigation state
  const [branchIdx, setBranchIdx] = useState(0);
  useEffect(() => { setBranchIdx(0); }, [branches]);
  return (
    <div className={`flex w-full ${isUser ? 'justify-end' : 'justify-start'}`}> 
      <div className={`relative max-w-lg w-full mb-1 px-3 py-1.5 rounded-lg shadow border transition-all duration-300 text-xs md:text-sm font-normal ${isUser ? 'bg-primary/80 text-white border-primary/20 rounded-br-lg' : 'bg-white/95 dark:bg-slate-900/95 text-slate-900 dark:text-white border-slate-200 dark:border-slate-700 rounded-bl-lg'} ${isEditing ? 'ring-2 ring-accent/70 animate-fade-in' : ''}`}> 
        {/* Three-dots menu for user messages */}
        {isUser && !isEditing && (
          <div className="absolute top-1 right-1 z-10">
            <button
              className="p-1 rounded hover:bg-slate-200/60 dark:hover:bg-slate-700/60 transition"
              aria-label="Open menu"
              onClick={() => setMenuOpen(v => !v)}
              tabIndex={0}
            >
              <MoreHorizontal className="w-4 h-4" />
            </button>
            {menuOpen && (
              <div className="absolute right-0 mt-2 w-28 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded shadow-lg animate-fade-in">
                <button
                  className="w-full text-left px-3 py-2 hover:bg-slate-100 dark:hover:bg-slate-700 text-xs"
                  onClick={() => { setMenuOpen(false); onEdit && onEdit(message.id); }}
                  tabIndex={0}
                >Edit</button>
                <button
                  className="w-full text-left px-3 py-2 hover:bg-slate-100 dark:hover:bg-slate-700 text-xs"
                  onClick={() => { setMenuOpen(false); copy(message.text); }}
                  tabIndex={0}
                >{copied ? 'Copied!' : 'Copy'}</button>
              </div>
            )}
          </div>
        )}
        {/* Branch navigation arrow and count */}
        {branches && branches.length > 1 && (
          <button
            className="absolute left-1 top-1 flex items-center gap-1 px-1 py-0.5 rounded bg-slate-100 dark:bg-slate-800 text-primary text-xs font-bold hover:bg-primary/10 transition"
            title="Cycle through branches"
            onClick={() => {
              const nextIdx = (branchIdx + 1) % branches.length;
              setBranchIdx(nextIdx);
              onBranchNav && onBranchNav(nextIdx);
            }}
            tabIndex={0}
          >
            <ChevronRight className="w-3 h-3" />
            {branches.length}
          </button>
        )}
        {/* Editing state */}
        {isEditing ? (
          <form
            onSubmit={e => { e.preventDefault(); onSaveEdit && onSaveEdit(); }}
            className="flex items-center gap-2 animate-fade-in"
          >
            <Input
              ref={inputRef}
              value={editingText}
              onChange={e => setEditingText && setEditingText(e.target.value)}
              className="flex-1 bg-transparent border-none focus:ring-0 focus:outline-none text-base font-medium shadow-none chat-input"
              onKeyDown={e => {
                if (e.key === 'Escape') {
                  setEditingText && setEditingText(message.text);
                  onSaveEdit && onSaveEdit();
                }
                if ((e.key === 'Enter' && (e.metaKey || e.ctrlKey)) || (e.key === 'Enter' && !e.shiftKey)) {
                  e.preventDefault();
                  onSaveEdit && onSaveEdit();
                }
              }}
              style={{ minHeight: 32, fontFamily: 'inherit', lineHeight: 1.6 }}
              aria-label="Edit your message"
            />
            <Button type="submit" size="icon" className="ml-1" variant="ghost" aria-label="Save edit">
              <CheckCircle className="w-4 h-4" />
            </Button>
          </form>
        ) : (
        <span className="select-text" style={{ lineHeight: 1.4 }}>{message.text}</span>
        )}
        {isUser && message.status === 'pending' && (
          <span className="absolute left-2 bottom-1 text-xs text-yellow-500 flex items-center gap-1 animate-fade-in">
            <LoaderCircle className="w-3 h-3 animate-spin" /> Pending
          </span>
        )}
        {isUser && message.status === 'error' && (
          <span className="absolute left-2 bottom-1 text-xs text-red-500 flex items-center gap-1 animate-fade-in">
            <XCircle className="w-3 h-3" /> Error
          </span>
        )}
      </div>
    </div>
  );
}

function MessageInput({ onSend, loading, currentMessages }: { onSend: (text: string) => void, loading: boolean, currentMessages: ChatMessage[] }) {
  const [input, setInput] = useState('');
  const [placeholderActive, setPlaceholderActive] = useState(true);
  const inputRef = useRef<HTMLInputElement>(null);
  const handleInputFocus = () => setPlaceholderActive(false);
  const handleInputBlur = () => { if (!input) setPlaceholderActive(true); };
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setInput(e.target.value);
    setPlaceholderActive(!e.target.value);
  };
  const handleSubmit = (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (!input.trim() || input.length > 250 || loading || (currentMessages.length > 0 && currentMessages[currentMessages.length-1].isUser && currentMessages[currentMessages.length-1].status === 'pending')) return;
    onSend(input.trim());
    setInput('');
    setPlaceholderActive(true);
  };
  const charsLeft = 250 - input.length;
  return (
    <form onSubmit={handleSubmit} className="relative w-full flex flex-col items-end gap-1 bg-white/60 dark:bg-slate-900/60 rounded-2xl shadow px-4 py-3 mt-2 mb-2">
      <div className="w-full flex items-center gap-2">
      <Input
        ref={inputRef}
        value={input}
        onFocus={handleInputFocus}
        onBlur={handleInputBlur}
        onChange={handleInputChange}
          maxLength={250}
        placeholder=" "
        aria-label="Type your claim or question"
        className="flex-1 bg-transparent border-none focus:ring-0 focus:outline-none placeholder:opacity-0 text-base md:text-lg font-medium shadow-none chat-input"
        disabled={loading}
        autoComplete="off"
        spellCheck={false}
        style={{ minHeight: 44, fontFamily: 'inherit', lineHeight: 1.6 }}
      />
      {placeholderActive && (
        <span className="absolute left-5 top-1/2 -translate-y-1/2 text-muted-foreground pointer-events-none select-none text-base md:text-lg transition-opacity duration-300 opacity-80">
          <AnimatedPlaceholder active={placeholderActive} examples={EXAMPLES} />
        </span>
      )}
      <Button
        type="submit"
        size="icon"
        className="rounded-full bg-primary text-white shadow-md hover:scale-105 transition-transform"
          disabled={loading || !input.trim() || input.length > 250 || (currentMessages.length > 0 && currentMessages[currentMessages.length-1].isUser && currentMessages[currentMessages.length-1].status === 'pending')}
        aria-label="Send"
      >
        {loading ? <LoaderCircle className="animate-spin w-6 h-6" /> : <svg width="22" height="22" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path d="M22 2L11 13"/><path d="M22 2L15 22L11 13L2 9L22 2Z"/></svg>}
      </Button>
      </div>
      <div className="w-full flex justify-end">
        <span className={`text-xs ${charsLeft < 0 ? 'text-red-500 font-bold' : 'text-muted-foreground'}`}>{charsLeft} characters left</span>
      </div>
    </form>
  );
}

// Types for messages
interface UserMessage { id: string; text: string; isUser: true; }
interface AiMessage {
  id: string;
  verdict: string;
  confidence: number;
  conclusion: string;
  explanation: string;
  sources: { title: string; url: string; domain: string; confidence: number; snippet: string }[];
  isUser: false;
}
type ChatMessageType = UserMessage | AiMessage;

// --- Tree-based chat data structure for professional, scalable branching ---
// Each message can have multiple children (branches), and knows its parent.
type ChatMessage = {
  id: string;
  text: string;
  isUser: boolean;
  status?: 'pending' | 'sent' | 'error'; // user message status
  aiData?: {
    verdict: string;
    confidence: number;
    conclusion: string;
    explanation: string;
    sources: { title: string; url: string; domain: string; confidence: number; snippet: string }[];
  };
  parentId?: string;
  children: string[]; // array of message IDs (branches)
  timestamp: number;
};

type ChatTree = {
  messages: { [id: string]: ChatMessage };
  rootId: string | null;
  currentPath: string[]; // array of message IDs representing the current visible path
};

// --- Utility functions for language detection and translation (from previous code) ---
function detectLanguage(text: string): string {
  if (/^[\u0600-\u06FF]/.test(text)) return 'ar'; // Arabic
  if (/^[\u4e00-\u9fff]/.test(text)) return 'zh'; // Chinese
  if (/^[A-Za-z]/.test(text)) return 'en'; // English
  if (/^[\u00C0-\u017F]/.test(text)) return 'fr'; // French
  if (/^[\u0400-\u04FF]/.test(text)) return 'ru'; // Russian
  return 'en';
}
async function translateText(text: string, targetLang: string): Promise<string> {
  return text;
}

// Add a custom ChatHeader for the chat page
function ChatHeader({ theme, setTheme, loading }: { theme: string; setTheme: (t: string) => void; loading: boolean }) {
  return (
    <header className="border-b border-border bg-surface/60 sticky top-0 z-50 backdrop-blur-md shadow-sm">
      {loading && <Progress value={100} className="h-1 w-full absolute top-0 left-0" />}
      <div className="w-full px-10 py-3 flex items-center justify-between relative">
        <div className="flex items-center gap-2">
          <Shield className="h-7 w-7 text-primary" />
        </div>
        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            size="icon"
            onClick={() => setTheme(theme === "dark" ? "light" : "dark")}
            className="border-border"
            aria-label="Toggle theme"
          >
            {theme === 'dark' ? <Sun className="h-5 w-5" /> : <Moon className="h-5 w-5" />}
          </Button>
          <Button variant="outline" size="sm" className="text-xs font-medium cursor-not-allowed opacity-70" disabled>
            <File className="w-4 h-4 mr-1" /> Import Files <span className="ml-1 text-[10px] text-muted-foreground">(soon)</span>
          </Button>
        </div>
      </div>
    </header>
  );
}

// --- Chat state and core logic ---
export default function Chat() {
  // Tree-based chat state
  const [chatTree, setChatTree] = useState<ChatTree>({ messages: {}, rootId: null, currentPath: [] });
  const [branchHistory, setBranchHistory] = useState<ChatTree[]>([]); // for undo/restore
  const [editingMsgId, setEditingMsgId] = useState<string | null>(null);
  const [editingText, setEditingText] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [theme, setTheme] = useState('light');
  const chatRef = useRef<HTMLDivElement>(null);
  const [showScroll, setShowScroll] = useState(false);
  const [firstPromptSent, setFirstPromptSent] = useState(false);
  const liveRegionRef = useRef<HTMLDivElement>(null);
  const [lastUserPrompt, setLastUserPrompt] = useState<string | null>(null);
  const [userLang, setUserLang] = useState('en');

  // --- Tree-based chat helpers (must be inside component for state access) ---
  // Get current visible messages (active branch)
  const getCurrentMessages = () => chatTree.currentPath.map(id => chatTree.messages[id]);

  // Add a new user message (as a child of the last message in currentPath, or as root if empty)
  const addUserMessage = (text: string) => {
    const id = uuidv4();
    const now = Date.now();
    let parentId: string | undefined = undefined;
    let newMessages = { ...chatTree.messages };
    let newCurrentPath = [...chatTree.currentPath];
    if (chatTree.currentPath.length > 0) {
      parentId = chatTree.currentPath[chatTree.currentPath.length - 1];
      // Add this message as a child branch of the parent
      newMessages[parentId] = {
        ...newMessages[parentId],
        children: [...(newMessages[parentId].children || []), id],
      };
    }
    newMessages[id] = {
      id,
      text,
      isUser: true,
      status: 'pending',
      parentId,
      children: [],
      timestamp: now,
    };
    newCurrentPath = [...chatTree.currentPath, id];
    setChatTree({
      ...chatTree,
      messages: newMessages,
      rootId: chatTree.rootId || id,
      currentPath: newCurrentPath,
    });
    return id;
  };

  // Add an AI message as a child of the last message in currentPath
  const addAiMessage = (aiData: ChatMessage['aiData'], userMsgId?: string, error?: boolean) => {
    const id = uuidv4();
    const now = Date.now();
    let parentId: string | undefined = undefined;
    let newMessages = { ...chatTree.messages };
    // Always append to the end of the current path
    let newCurrentPath = [...chatTree.currentPath];
    if (chatTree.currentPath.length > 0) {
      parentId = chatTree.currentPath[chatTree.currentPath.length - 1];
      newMessages[parentId] = {
        ...newMessages[parentId],
        children: [...(newMessages[parentId].children || []), id],
      };
    }
    // Mark last user message as 'sent' or 'error'
    if (userMsgId && newMessages[userMsgId]) {
      newMessages[userMsgId] = {
        ...newMessages[userMsgId],
        status: error ? 'error' : 'sent',
      };
    }
    newMessages[id] = {
      id,
      text: '',
      isUser: false,
      aiData,
      parentId,
      children: [],
      timestamp: now,
    };
    // Fix: Always append the AI message to the end of the current path
    newCurrentPath.push(id);
    setChatTree({
      ...chatTree,
      messages: newMessages,
      rootId: chatTree.rootId || id,
      currentPath: newCurrentPath,
    });
    return id;
  };

  // Navigate to a specific branch of a message
  const navigateBranch = (msgId: string, childIdx: number) => {
    const msg = chatTree.messages[msgId];
    if (!msg || !msg.children || msg.children.length === 0) return;
    const targetChildId = msg.children[childIdx];
    const targetMsg = chatTree.messages[targetChildId];
    if (!targetMsg) return;

    // Save current path to history
    setBranchHistory(prev => [...prev, chatTree]);

    // Update current path to the new branch
    setChatTree(prev => ({
      ...prev,
      currentPath: [...prev.currentPath.slice(0, prev.currentPath.indexOf(msgId) + 1), targetChildId],
    }));
  };

  // --- Get current visible messages for UI ---
  const currentMessages = getCurrentMessages();

  // Announce new messages for screen readers
  useEffect(() => {
    if (chatTree.currentPath.length > 0 && liveRegionRef.current) {
      const last = chatTree.currentPath[chatTree.currentPath.length - 1];
      const msg = chatTree.messages[last];
      let announcement = '';
      if (msg.isUser) {
        announcement = `User: ${msg.text}`;
      } else if (msg.aiData) {
        announcement = `AI: ${msg.aiData.verdict}, ${msg.aiData.conclusion}`;
      }
      liveRegionRef.current.textContent = announcement;
    }
  }, [chatTree.currentPath]);

  useEffect(() => {
    document.documentElement.classList.toggle('dark', theme === 'dark');
  }, [theme]);

  useEffect(() => {
    if (chatRef.current) {
      chatRef.current.scrollTop = chatRef.current.scrollHeight;
    }
  }, [chatTree.currentPath, loading]);

  // Helper: get last user message index
  const getLastUserMsgIndex = () => {
    for (let i = chatTree.currentPath.length - 1; i >= 0; i--) {
      const msgId = chatTree.currentPath[i];
      const msg = chatTree.messages[msgId];
      if (msg && msg.isUser) return i;
    }
    return -1;
  };

  // Edit handler
  const handleEdit = (msgId: string) => {
    setEditingMsgId(msgId);
    const msg = chatTree.messages[msgId];
    setEditingText(msg ? msg.text : '');
  };

  // Save edit
  const handleSaveEdit = async () => {
    if (!editingMsgId) return;
    const msg = chatTree.messages[editingMsgId];
    if (!msg || !msg.isUser) return;

    // Create a new branch from this message
    const id = uuidv4();
    const now = Date.now();
    let newMessages = { ...chatTree.messages };
    newMessages[editingMsgId] = {
      ...msg,
      children: [...(msg.children || []), id],
    };
    newMessages[id] = {
      id,
      text: editingText,
      isUser: true,
      parentId: editingMsgId,
      children: [],
      timestamp: now,
    };
    // New path: up to editingMsgId, then the new branch
    const idx = chatTree.currentPath.indexOf(editingMsgId);
    const newCurrentPath = [...chatTree.currentPath.slice(0, idx + 1), id];
    setChatTree({
      ...chatTree,
      messages: newMessages,
      currentPath: newCurrentPath,
    });
    setEditingMsgId(null);
    setEditingText('');
  };

  // Restore previous branch
  const handleRestoreBranch = () => {
    if (branchHistory.length === 0) return;
    const prev = branchHistory[branchHistory.length - 1];
    setChatTree(prev);
    setBranchHistory(branchHistory.slice(0, -1));
    setEditingMsgId(null);
    setEditingText('');
  };

  // --- Send handler using tree logic ---
  const handleSend = async (text: string) => {
    const lang = detectLanguage(text);
    setUserLang(lang);
    if (!firstPromptSent) setFirstPromptSent(true);
    setLastUserPrompt(text);
    const userMsgId = addUserMessage(text);
    setLoading(true);
    setError(null);
    try {
      const res = await verifyClaim(text);
      let conclusion = res.conclusion || '';
      let explanation = res.explanation || '';
      let sources = Array.isArray(res.sources) ? res.sources : [];
      if (lang !== 'en') {
        conclusion = await translateText(conclusion, lang);
        explanation = await translateText(explanation, lang);
        sources = await Promise.all(sources.map(async (src: any) => ({
          ...src,
          title: await translateText(src.title, lang),
          snippet: await translateText(src.snippet, lang),
          reason: await translateText(src.reason, lang)
        })));
      }
      addAiMessage({
        verdict: res.verdict || 'Unknown',
        confidence: typeof res.confidence === 'number' ? res.confidence : 0,
        conclusion,
        explanation,
        sources
      }, userMsgId, false);
    } catch (err) {
      // Mark user message as error
      addAiMessage({
        verdict: 'Error',
        confidence: 0,
        conclusion: 'Failed to verify claim.',
        explanation: '',
        sources: []
      }, userMsgId, true);
      setError('Failed to verify claim.');
    } finally {
      setLoading(false);
    }
  };
  // Retry handler for error banner
  const handleRetry = () => {
    if (lastUserPrompt) {
      setError(null);
      handleSend(lastUserPrompt);
    }
  };

  // Virtualized row renderer for chat messages
  const Row = ({ index, style }: ListChildComponentProps) => {
    const msgId = chatTree.currentPath[index];
    const msg = chatTree.messages[msgId];
    if (!msg) return null; // Should not happen if currentPath is valid

    if (msg.isUser) {
      return <div style={style}><ChatMessage message={msg} isUser={msg.isUser} /></div>;
    } else {
      return <div style={style}><VerdictMessage {...msg.aiData!} /></div>;
    }
  };

  return (
    <>
      <ChatHeader theme={theme} setTheme={setTheme} loading={loading} />
      <div className="min-h-screen flex flex-col bg-gradient-to-b from-slate-100 via-white to-slate-200 dark:from-slate-900 dark:via-slate-950 dark:to-slate-900">
        <div
          className={`flex-1 flex flex-col w-full px-2 md:px-0 mt-16 mb-8 relative transition-all duration-700 ease-in-out
            ${firstPromptSent ? 'max-w-3xl ml-auto mr-4 md:mr-12 md:ml-auto' : 'max-w-2xl mx-auto'}
          `}
        >
          {/* Error banner */}
          {error && <ErrorBanner error={error} onRetry={lastUserPrompt ? handleRetry : undefined} />}
          {/* Accessibility live region for screen readers */}
          <div ref={liveRegionRef} aria-live="polite" aria-atomic="true" className="sr-only" />
          {/* Chat area */}
          <div
            className={`flex-1 flex flex-col gap-4 border border-slate-200 dark:border-slate-800 rounded-2xl bg-white/90 dark:bg-slate-900/90 shadow-2xl px-0 md:px-6 py-8 transition-all duration-700 ease-in-out
              ${firstPromptSent ? 'opacity-100 translate-x-0 md:animate-slide-in-right' : 'opacity-100 translate-x-0'}
            `}
            ref={chatRef}
            tabIndex={0}
            role="log"
            aria-label="Chat message history"
            style={{ minHeight: 320, paddingBottom: 96 }}
          >
            {/* Empty state with friendlier centering */}
            {chatTree.currentPath.length === 0 && !loading && (
              <>
                <Card className="mb-4 flex items-center gap-2 p-3 bg-slate-50 dark:bg-slate-800 border-0 shadow-none">
                  <Badge variant="outline" className="mr-2">Tip</Badge>
                  <span className="text-sm text-muted-foreground">
                    You can ask about news claims in any language. Try one of the examples below!
                  </span>
                </Card>
              <div className="flex flex-1 flex-col items-center justify-center text-center select-none animate-fade-in-slow" style={{ minHeight: 320 }}>
                <div className="text-2xl md:text-3xl font-bold text-muted-foreground mb-2">Welcome to Fake News Checker</div>
                <div className="text-base md:text-lg text-muted-foreground mb-6">Ask a news claim to get started…</div>
                <div className="flex flex-wrap justify-center gap-2 max-w-xl mx-auto">
                  {EXAMPLES.slice(0, 3).map((ex, i) => (
                    <span key={i} className="bg-slate-200 dark:bg-slate-800 text-slate-700 dark:text-slate-200 px-3 py-1 rounded-full text-xs md:text-sm font-medium shadow-sm cursor-pointer hover:bg-primary/10 transition" onClick={() => handleSend(ex)}>{ex}</span>
                  ))}
                </div>
                </div>
              </>
            )}
            {branchHistory.length > 0 && (
              <div className="flex justify-center mb-2 animate-fade-in items-center gap-2">
                <Button variant="outline" size="sm" onClick={handleRestoreBranch} title="Restore previous chat branch (undo)">
                  <svg width="16" height="16" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path d="M3 12h18M3 12l6-6M3 12l6 6"/></svg>
                  <span className="ml-1">Restore Previous Branch</span>
                </Button>
                <span className="ml-2 text-xs text-accent font-semibold flex items-center gap-1">
                  <svg width="14" height="14" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path d="M6 3v6h6"/><path d="M3 12a9 9 0 1 0 9-9"/></svg>
                  You are on a branched path
                </span>
              </div>
            )}
            {/* Chat messages */}
            {chatTree.currentPath.length > 0 && (
              <div className="flex flex-col gap-4">
                {chatTree.currentPath.map((msgId, idx) => {
                  const msg = chatTree.messages[msgId];
                  if (!msg) return null; // Should not happen if currentPath is valid
                  // Always render user message card
                  if (msg.isUser) {
                    return (
                      <ChatMessage
                        key={msg.id}
                        message={msg}
                        isUser={msg.isUser}
                        onEdit={msg.isUser ? handleEdit : undefined}
                        isEditing={editingMsgId === msg.id}
                        editingText={editingMsgId === msg.id ? editingText : undefined}
                        setEditingText={setEditingText}
                        onSaveEdit={handleSaveEdit}
                        editingMsgId={editingMsgId}
                        branches={msg.children || []}
                        onBranchNav={childIdx => navigateBranch(msg.id, childIdx)}
                      />
                    );
                  } else {
                    // Always render AI message card after user message
                    return (
                      <VerdictMessage
                        key={msg.id}
                        verdict={msg.aiData!.verdict}
                        confidence={msg.aiData!.confidence}
                        conclusion={msg.aiData!.conclusion}
                        explanation={msg.aiData!.explanation}
                        sources={msg.aiData!.sources}
                        loading={loading}
                      />
                    );
                  }
                })}
                {loading && <AISkeleton />}
              </div>
            )}
          </div>
          {/* Fixed Message input at the bottom */}
          <div className="fixed bottom-0 left-0 w-full flex justify-center z-50 bg-gradient-to-t from-white/95 dark:from-slate-900/95 via-white/80 dark:via-slate-900/80 to-transparent pb-2 pt-2 px-2 md:px-0" style={{ pointerEvents: 'auto' }}>
            <div className={`w-full ${firstPromptSent ? 'max-w-3xl ml-auto mr-4 md:mr-12 md:ml-auto' : 'max-w-2xl mx-auto'} transition-all duration-700`}>
              <MessageInput onSend={handleSend} loading={loading} currentMessages={currentMessages} />
            </div>
          </div>
        </div>
        {/* Fade-in animation for empty state message and chatbox slide-in */}
        <style>{`
          @keyframes fade-in {
            from { opacity: 0; transform: scale(0.95); }
            to { opacity: 1; transform: scale(1); }
          }
          .animate-fade-in { animation: fade-in 1.2s cubic-bezier(.4,0,.2,1) both; }
          .animate-fade-in-slow { animation: fade-in 2.2s cubic-bezier(.4,0,.2,1) both; }
          @keyframes slide-in-right {
            from { opacity: 0; transform: translateX(60px); }
            to { opacity: 1; transform: translateX(0); }
          }
          .md\:animate-slide-in-right {
            animation: slide-in-right 0.7s cubic-bezier(.4,0,.2,1) both;
          }
          .chat-input:focus {
            outline: none !important;
            box-shadow: none !important;
            border-color: initial !important;
          }
          /* Custom scrollbar for chat area */
          .scrollbar-thin {
            scrollbar-width: thin;
          }
          .scrollbar-thumb-slate-300::-webkit-scrollbar-thumb {
            background: #cbd5e1;
            border-radius: 8px;
          }
          .scrollbar-thumb-slate-700::-webkit-scrollbar-thumb {
            background: #334155;
            border-radius: 8px;
          }
          .scrollbar-track-transparent::-webkit-scrollbar-track {
            background: transparent;
          }
          .scrollbar-thin::-webkit-scrollbar {
            width: 8px;
            height: 8px;
          }
          @keyframes fade-in {
            from { opacity: 0; transform: scale(0.97); }
            to { opacity: 1; transform: scale(1); }
          }
          .animate-fade-in { animation: fade-in 0.4s cubic-bezier(.4,0,.2,1) both; }
          .ring-accent\/70 { box-shadow: 0 0 0 2px var(--accent, #a5b4fc) !important; }
        `}</style>
      </div>
    </>
  );
}

