import React, { useState, useRef, useEffect } from 'react';
import { Button } from '../components/ui/button';
import { Input } from '../components/ui/input';
import { Card } from '../components/ui/card';
import { Badge } from '../components/ui/badge';
import { LoaderCircle, CheckCircle, XCircle, AlertTriangle, Copy, Shield, ExternalLink, Moon, Sun, ArrowDown, File } from 'lucide-react';
import { FixedSizeList as List, ListChildComponentProps } from 'react-window';
import Navbar from "@/components/Navbar";
import { useTheme } from "next-themes";
import { verifyClaim } from '../utils/config';
import { Progress } from '../components/ui/progress'; // If you have a progress bar component

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
      }, 400);
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
  return (
    <div className="border rounded-lg p-3 mb-2 bg-white dark:bg-slate-800 shadow">
      <div className="flex items-center gap-2 mb-1">
        <a href={source.url} target="_blank" rel="noopener noreferrer" className="font-semibold text-primary hover:underline">
          {source.title}
        </a>
        <span className="text-xs text-muted-foreground">{new Date(source.date).toLocaleDateString()}</span>
        <span className={`ml-auto px-2 py-0.5 rounded text-xs font-medium ${source.support === 'Partial' ? 'bg-yellow-200 text-yellow-800' : source.support === 'Support' ? 'bg-green-200 text-green-800' : 'bg-red-200 text-red-800'}`}>
          {source.support}
        </span>
        <span className="ml-2 px-2 py-0.5 rounded text-xs bg-slate-200 text-slate-800">{source.confidence?.toFixed(0)}%</span>
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

function ChatMessage({ message, isUser }: { message: { text: string }, isUser: boolean }) {
  return (
    <div className={`flex w-full ${isUser ? 'justify-end' : 'justify-start'}`}> 
      <div className={`max-w-lg w-full mb-1 px-3 py-1.5 rounded-lg shadow border transition-all duration-300 text-xs md:text-sm font-normal ${isUser ? 'bg-primary/80 text-white border-primary/20 rounded-br-lg' : 'bg-white/95 dark:bg-slate-900/95 text-slate-900 dark:text-white border-slate-200 dark:border-slate-700 rounded-bl-lg'}`}> 
        <span className="select-text" style={{ lineHeight: 1.4 }}>{message.text}</span>
      </div>
    </div>
  );
}

function MessageInput({ onSend, loading }: { onSend: (text: string) => void, loading: boolean }) {
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
    if (!input.trim() || loading) return;
    onSend(input.trim());
    setInput('');
    setPlaceholderActive(true);
  };
  return (
    <form onSubmit={handleSubmit} className="relative w-full flex items-center gap-2 bg-white/60 dark:bg-slate-900/60 rounded-2xl shadow px-4 py-3 mt-2 mb-2">
      <Input
        ref={inputRef}
        value={input}
        onFocus={handleInputFocus}
        onBlur={handleInputBlur}
        onChange={handleInputChange}
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
        disabled={loading}
        aria-label="Send"
      >
        {loading ? <LoaderCircle className="animate-spin w-6 h-6" /> : <svg width="22" height="22" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path d="M22 2L11 13"/><path d="M22 2L15 22L11 13L2 9L22 2Z"/></svg>}
      </Button>
    </form>
  );
}

// Types for messages
interface UserMessage { text: string; isUser: true; }
interface AiMessage {
  verdict: string;
  confidence: number;
  conclusion: string;
  explanation: string;
  sources: { title: string; url: string; domain: string; confidence: number; snippet: string }[];
  isUser: false;
}
type ChatMessageType = UserMessage | AiMessage;

// Type guard helpers
function isAiMessage(msg: ChatMessageType): msg is AiMessage {
  return (msg as AiMessage).verdict !== undefined;
}
function isUserMessage(msg: ChatMessageType): msg is UserMessage {
  return (msg as UserMessage).isUser === true && typeof (msg as UserMessage).text === 'string';
}

// Language detection and translation helpers
function detectLanguage(text: string): string {
  // Simple detection for demonstration (could use a library like franc or langdetect)
  if (/^[\u0600-\u06FF]/.test(text)) return 'ar'; // Arabic
  if (/^[\u4e00-\u9fff]/.test(text)) return 'zh'; // Chinese
  if (/^[A-Za-z]/.test(text)) return 'en'; // English
  if (/^[\u00C0-\u017F]/.test(text)) return 'fr'; // French
  if (/^[\u0400-\u04FF]/.test(text)) return 'ru'; // Russian
  // Add more as needed
  return 'en';
}

async function translateText(text: string, targetLang: string): Promise<string> {
  // Placeholder: In production, call a translation API here
  // For now, just return the original text
  return text;
}

// New ChatNavbar component
function ChatNavbar({ theme, setTheme }: { theme: string; setTheme: (t: string) => void }) {
  return (
    <header className="border-b border-border bg-surface/60 sticky top-0 z-50 backdrop-blur-md shadow-sm">
      <div className="w-full px-10 py-3 flex items-center justify-between">
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

export default function Chat() {
  const [messages, setMessages] = useState<ChatMessageType[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [theme, setTheme] = useState('light');
  const chatRef = useRef<HTMLDivElement>(null);
  const [showScroll, setShowScroll] = useState(false);
  const [firstPromptSent, setFirstPromptSent] = useState(false);
  const liveRegionRef = useRef<HTMLDivElement>(null);
  const [lastUserPrompt, setLastUserPrompt] = useState<string | null>(null);
  const [userLang, setUserLang] = useState('en');

  // Announce new messages for screen readers
  useEffect(() => {
    if (messages.length > 0 && liveRegionRef.current) {
      const last = messages[messages.length - 1];
      let announcement = '';
      if (isAiMessage(last)) {
        announcement = `AI: ${last.verdict}, ${last.conclusion}`;
      } else if (isUserMessage(last)) {
        announcement = `User: ${last.text}`;
      }
      liveRegionRef.current.textContent = announcement;
    }
  }, [messages]);

  useEffect(() => {
    document.documentElement.classList.toggle('dark', theme === 'dark');
  }, [theme]);

  useEffect(() => {
    if (chatRef.current) {
      chatRef.current.scrollTop = chatRef.current.scrollHeight;
    }
  }, [messages, loading]);

  const handleSend = async (text: string) => {
    const lang = detectLanguage(text);
    setUserLang(lang);
    if (!firstPromptSent) setFirstPromptSent(true);
    setLastUserPrompt(text);
    setMessages(msgs => [...msgs, { text, isUser: true }]);
    setLoading(true);
    setError(null);
    try {
      const res = await verifyClaim(text);
      // Translate relevant fields if needed
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
      const aiResponse: AiMessage = {
        verdict: res.verdict || 'Unknown',
        confidence: typeof res.confidence === 'number' ? res.confidence : 0,
        conclusion,
        explanation,
        sources,
        isUser: false
      };
      setMessages(msgs => [...msgs, aiResponse]);
    } catch (err) {
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
    const msg = messages[index];
    if (isAiMessage(msg)) {
      return <div style={style}><VerdictMessage {...msg} /></div>;
    } else {
      return <div style={style}><ChatMessage message={msg} isUser={msg.isUser} /></div>;
    }
  };

  return (
    <>
      <ChatNavbar theme={theme} setTheme={setTheme} />
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
            {messages.length === 0 && !loading && (
              <div className="flex flex-1 flex-col items-center justify-center text-center select-none animate-fade-in-slow" style={{ minHeight: 320 }}>
                <div className="text-2xl md:text-3xl font-bold text-muted-foreground mb-2">Welcome to Fake News Checker</div>
                <div className="text-base md:text-lg text-muted-foreground mb-6">Ask a news claim to get started…</div>
                <div className="flex flex-wrap justify-center gap-2 max-w-xl mx-auto">
                  {EXAMPLES.slice(0, 3).map((ex, i) => (
                    <span key={i} className="bg-slate-200 dark:bg-slate-800 text-slate-700 dark:text-slate-200 px-3 py-1 rounded-full text-xs md:text-sm font-medium shadow-sm cursor-pointer hover:bg-primary/10 transition" onClick={() => handleSend(ex)}>{ex}</span>
                  ))}
                </div>
              </div>
            )}
            {/* Chat messages */}
            {messages.length > 0 && (
              <div className="flex flex-col gap-4">
                {messages.map((msg, idx) =>
                  isAiMessage(msg)
                    ? <VerdictMessage key={idx} {...msg} />
                    : <ChatMessage key={idx} message={msg} isUser={msg.isUser} />
                )}
                {loading && <AISkeleton />}
              </div>
            )}
          </div>
          {/* Fixed Message input at the bottom */}
          <div className="fixed bottom-0 left-0 w-full flex justify-center z-50 bg-gradient-to-t from-white/95 dark:from-slate-900/95 via-white/80 dark:via-slate-900/80 to-transparent pb-2 pt-2 px-2 md:px-0" style={{ pointerEvents: 'auto' }}>
            <div className={`w-full ${firstPromptSent ? 'max-w-3xl ml-auto mr-4 md:mr-12 md:ml-auto' : 'max-w-2xl mx-auto'} transition-all duration-700`}>
              <MessageInput onSend={handleSend} loading={loading} />
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
        `}</style>
      </div>
    </>
  );
}

