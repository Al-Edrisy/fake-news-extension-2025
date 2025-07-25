import React, { useEffect, useRef, useState } from 'react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Globe, Sparkles, Play } from 'lucide-react';

interface PromptItem {
  id: string;
  text: string;
  language: string;
  languageCode: string;
  category: string;
  flag: string;
}

const SAMPLE_PROMPTS: PromptItem[] = [
  // English prompts
  {
    id: '1',
    text: "Did NASA discover water on Mars recently?",
    language: "English",
    languageCode: "en",
    category: "Science",
    flag: "🇺🇸"
  },
  {
    id: '2',
    text: "Is Bitcoin going to replace traditional currency by 2030?",
    language: "English",
    languageCode: "en",
    category: "Finance",
    flag: "🇺🇸"
  },
  {
    id: '3',
    text: "Are electric cars really better for the environment?",
    language: "English",
    languageCode: "en",
    category: "Environment",
    flag: "🇺🇸"
  },
  
  // Spanish prompts
  {
    id: '4',
    text: "¿Es cierto que el café previene el Alzheimer?",
    language: "Español",
    languageCode: "es",
    category: "Salud",
    flag: "🇪🇸"
  },
  {
    id: '5',
    text: "¿La inteligencia artificial va a eliminar millones de empleos?",
    language: "Español",
    languageCode: "es",
    category: "Tecnología",
    flag: "🇪🇸"
  },
  
  // French prompts
  {
    id: '6',
    text: "Les voitures autonomes sont-elles vraiment plus sûres?",
    language: "Français",
    languageCode: "fr",
    category: "Transport",
    flag: "🇫🇷"
  },
  {
    id: '7',
    text: "Le télétravail augmente-t-il vraiment la productivité?",
    language: "Français",
    languageCode: "fr",
    category: "Travail",
    flag: "🇫🇷"
  },
  
  // German prompts
  {
    id: '8',
    text: "Verursacht 5G-Technologie wirklich Gesundheitsprobleme?",
    language: "Deutsch",
    languageCode: "de",
    category: "Gesundheit",
    flag: "🇩🇪"
  },
  {
    id: '9',
    text: "Ist Kernenergie die Lösung für den Klimawandel?",
    language: "Deutsch",
    languageCode: "de",
    category: "Energie",
    flag: "🇩🇪"
  },
  
  // Arabic prompts
  {
    id: '10',
    text: "هل تسبب الهواتف الذكية السرطان فعلاً؟",
    language: "العربية",
    languageCode: "ar",
    category: "صحة",
    flag: "🇸🇦"
  },
  {
    id: '11',
    text: "هل ستحل العملات الرقمية محل البنوك التقليدية؟",
    language: "العربية",
    languageCode: "ar",
    category: "مالية",
    flag: "🇸🇦"
  },
  
  // Chinese prompts
  {
    id: '12',
    text: "人工智能真的会取代医生吗？",
    language: "中文",
    languageCode: "zh",
    category: "医疗",
    flag: "🇨🇳"
  },
  {
    id: '13',
    text: "电动汽车的电池真的环保吗？",
    language: "中文",
    languageCode: "zh",
    category: "环境",
    flag: "🇨🇳"
  },
  
  // Japanese prompts
  {
    id: '14',
    text: "リモートワークは本当に生産性を向上させるのか？",
    language: "日本語",
    languageCode: "ja",
    category: "仕事",
    flag: "🇯🇵"
  },
  {
    id: '15',
    text: "量子コンピューターは暗号化を無意味にするのか？",
    language: "日本語",
    languageCode: "ja",
    category: "技術",
    flag: "🇯🇵"
  },
  
  // Portuguese prompts
  {
    id: '16',
    text: "A inteligência artificial pode realmente prever terremotos?",
    language: "Português",
    languageCode: "pt",
    category: "Ciência",
    flag: "🇧🇷"
  },
  {
    id: '17',
    text: "Os carros elétricos são realmente mais baratos a longo prazo?",
    language: "Português",
    languageCode: "pt",
    category: "Economia",
    flag: "🇧🇷"
  },

  // Italian prompts
  {
    id: '18',
    text: "I vaccini COVID-19 sono davvero sicuri a lungo termine?",
    language: "Italiano",
    languageCode: "it",
    category: "Salute",
    flag: "🇮🇹"
  },

  // Russian prompts
  {
    id: '19',
    text: "Действительно ли глобальное потепление вызвано человеком?",
    language: "Русский",
    languageCode: "ru",
    category: "Экология",
    flag: "🇷🇺"
  },

  // Korean prompts
  {
    id: '20',
    text: "5G 기술이 정말로 건강에 해로운가요?",
    language: "한국어",
    languageCode: "ko",
    category: "기술",
    flag: "🇰🇷"
  }
];

interface InfinitePromptCarouselProps {
  onPromptSelect: (prompt: string) => void;
  className?: string;
}

export function InfinitePromptCarousel({ onPromptSelect, className = "" }: InfinitePromptCarouselProps) {
  const [isPaused, setIsPaused] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);
  const [scrollPosition, setScrollPosition] = useState(0);
  
  // Create duplicated array for infinite scroll effect (only 2 copies to reduce redundancy)
  const duplicatedPrompts = [...SAMPLE_PROMPTS, ...SAMPLE_PROMPTS];

  useEffect(() => {
    const scrollContainer = scrollRef.current;
    if (!scrollContainer || isPaused) return;

    const scrollWidth = scrollContainer.scrollWidth;
    const clientWidth = scrollContainer.clientWidth;
    const maxScroll = scrollWidth / 2; // Since we have 2 copies

    const animate = () => {
      setScrollPosition(prev => {
        const newPosition = prev + 0.5; // Adjust speed here
        return newPosition >= maxScroll ? 0 : newPosition;
      });
    };

    const intervalId = setInterval(animate, 16); // ~60fps

    return () => clearInterval(intervalId);
  }, [isPaused]);

  useEffect(() => {
    const scrollContainer = scrollRef.current;
    if (scrollContainer) {
      scrollContainer.scrollLeft = scrollPosition;
    }
  }, [scrollPosition]);

  const handlePromptClick = (prompt: PromptItem) => {
    onPromptSelect(prompt.text);
  };

  const getCategoryColor = (category: string) => {
    const colors = {
      'Science': 'bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-300',
      'Ciência': 'bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-300',
      'Finance': 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-300',
      'Mالية': 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-300',
      'Economia': 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-300',
      'Environment': 'bg-emerald-100 text-emerald-800 dark:bg-emerald-900/30 dark:text-emerald-300',
      'Energía': 'bg-emerald-100 text-emerald-800 dark:bg-emerald-900/30 dark:text-emerald-300',
      'Energie': 'bg-emerald-100 text-emerald-800 dark:bg-emerald-900/30 dark:text-emerald-300',
      'طاقة': 'bg-emerald-100 text-emerald-800 dark:bg-emerald-900/30 dark:text-emerald-300',
      '环境': 'bg-emerald-100 text-emerald-800 dark:bg-emerald-900/30 dark:text-emerald-300',
      'Energia': 'bg-emerald-100 text-emerald-800 dark:bg-emerald-900/30 dark:text-emerald-300',
      'Health': 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-300',
      'Salud': 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-300',
      'Gesundheit': 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-300',
      'صحة': 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-300',
      '医疗': 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-300',
      'Technology': 'bg-purple-100 text-purple-800 dark:bg-purple-900/30 dark:text-purple-300',
      'Tecnología': 'bg-purple-100 text-purple-800 dark:bg-purple-900/30 dark:text-purple-300',
      'Technologie': 'bg-purple-100 text-purple-800 dark:bg-purple-900/30 dark:text-purple-300',
      'Tecnologia': 'bg-purple-100 text-purple-800 dark:bg-purple-900/30 dark:text-purple-300',
      '技术': 'bg-purple-100 text-purple-800 dark:bg-purple-900/30 dark:text-purple-300',
      '技術': 'bg-purple-100 text-purple-800 dark:bg-purple-900/30 dark:text-purple-300',
      'Transport': 'bg-orange-100 text-orange-800 dark:bg-orange-900/30 dark:text-orange-300',
      'Work': 'bg-indigo-100 text-indigo-800 dark:bg-indigo-900/30 dark:text-indigo-300',
      'Travail': 'bg-indigo-100 text-indigo-800 dark:bg-indigo-900/30 dark:text-indigo-300',
      '仕事': 'bg-indigo-100 text-indigo-800 dark:bg-indigo-900/30 dark:text-indigo-300',
      'Nutrition': 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-300'
    };
    return colors[category as keyof typeof colors] || 'bg-gray-100 text-gray-800 dark:bg-gray-900/30 dark:text-gray-300';
  };

  return (
    <div className={`space-y-3 ${className}`}>
      <div className="flex items-center gap-2 mb-3">
        <Sparkles className="h-4 w-4 text-primary" />
        <span className="text-sm font-medium text-muted-foreground">Try these examples:</span>
      </div>

      <div 
        className="relative overflow-hidden"
        onMouseEnter={() => setIsPaused(true)}
        onMouseLeave={() => setIsPaused(false)}
      >
        <div
          ref={scrollRef}
          className="flex gap-3 overflow-x-hidden"
          style={{ 
            scrollBehavior: 'auto',
            WebkitOverflowScrolling: 'touch'
          }}
        >
          {duplicatedPrompts.map((prompt, index) => (
            <Button
              key={`${prompt.id}-${index}`}
              variant="outline"
              onClick={() => handlePromptClick(prompt)}
              className="flex-shrink-0 h-auto py-3 px-4 rounded-full hover:bg-primary/10 hover:border-primary/30 transition-colors group min-w-fit max-w-sm"
            >
              <div className={`flex items-center gap-2 ${prompt.languageCode === 'ar' ? 'flex-row-reverse' : ''}`}>
                <span className="text-sm">{prompt.flag}</span>
                <span className="text-sm font-medium group-hover:text-primary transition-colors line-clamp-1">
                  {prompt.text}
                </span>
              </div>
            </Button>
          ))}
        </div>
        
        {/* Gradient overlays for smooth infinite effect */}
        <div className="absolute left-0 top-0 bottom-0 w-8 bg-gradient-to-r from-background to-transparent pointer-events-none z-10" />
        <div className="absolute right-0 top-0 bottom-0 w-8 bg-gradient-to-l from-background to-transparent pointer-events-none z-10" />
      </div>
      
      <div className="text-center mt-3">
        <p className="text-xs text-muted-foreground">
          Hover to pause • Click any example to start fact-checking
        </p>
      </div>
    </div>
  );
}