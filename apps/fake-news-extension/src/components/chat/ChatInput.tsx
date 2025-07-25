import React, { useState, useRef, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { 
  Send, 
  Loader2, 
  Paperclip, 
  Mic, 
  MicOff,
  Sparkles,
  Zap
} from 'lucide-react';
import { Tooltip, TooltipContent, TooltipTrigger } from '@/components/ui/tooltip';
import { InfinitePromptCarousel } from './InfinitePromptCarousel';

interface ChatInputProps {
  onSend: (message: string) => void;
  loading?: boolean;
  disabled?: boolean;
  placeholder?: string;
}

export function ChatInput({ onSend, loading = false, disabled = false, placeholder }: ChatInputProps) {
  const [input, setInput] = useState('');
  const [isRecording, setIsRecording] = useState(false);
  const [showExamples, setShowExamples] = useState(true);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  const maxLength = 500;
  const remainingChars = maxLength - input.length;

  useEffect(() => {
    if (textareaRef.current) {
      textareaRef.current.style.height = 'auto';
      textareaRef.current.style.height = `${Math.min(textareaRef.current.scrollHeight, 120)}px`;
    }
  }, [input]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim() || loading || disabled || input.length > maxLength) return;
    
    onSend(input.trim());
    setInput('');
    setShowExamples(false);
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSubmit(e);
    }
  };

  const handlePromptSelect = (prompt: string) => {
    setInput(prompt);
    setShowExamples(false);
    textareaRef.current?.focus();
  };

  const toggleRecording = () => {
    setIsRecording(!isRecording);
    // TODO: Implement voice recording functionality
  };

  return (
    <div className="space-y-4">
      {/* Infinite Prompt Carousel */}
      {showExamples && input.length === 0 && (
        <InfinitePromptCarousel 
          onPromptSelect={handlePromptSelect}
          className="px-4"
        />
      )}

      {/* Input form */}
      <Card className="border-2 border-border/50 focus-within:border-primary/50 transition-colors">
        <form onSubmit={handleSubmit} className="p-4">
          <div className="space-y-3">
            <div className="relative">
              <Textarea
                ref={textareaRef}
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyDown={handleKeyDown}
                placeholder={placeholder || "Ask about any news claim to verify its accuracy..."}
                className="min-h-[60px] max-h-[120px] resize-none border-0 focus-visible:ring-0 text-base placeholder:text-muted-foreground/60"
                disabled={loading || disabled}
                maxLength={maxLength}
              />
              
              {/* Character counter */}
              <div className="absolute bottom-2 right-2">
                <Badge 
                  variant="secondary" 
                  className={`text-xs ${remainingChars < 50 ? 'text-amber-600' : remainingChars < 20 ? 'text-red-600' : ''}`}
                >
                  {remainingChars}
                </Badge>
              </div>
            </div>

            {/* Action buttons */}
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Tooltip>
                  <TooltipTrigger asChild>
                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      disabled
                      className="opacity-50"
                    >
                      <Paperclip className="h-4 w-4" />
                    </Button>
                  </TooltipTrigger>
                  <TooltipContent>
                    <p>File upload (coming soon)</p>
                  </TooltipContent>
                </Tooltip>

                <Tooltip>
                  <TooltipTrigger asChild>
                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      onClick={toggleRecording}
                      disabled
                      className="opacity-50"
                    >
                      {isRecording ? (
                        <MicOff className="h-4 w-4 text-red-500" />
                      ) : (
                        <Mic className="h-4 w-4" />
                      )}
                    </Button>
                  </TooltipTrigger>
                  <TooltipContent>
                    <p>Voice input (coming soon)</p>
                  </TooltipContent>
                </Tooltip>
              </div>

              <div className="flex items-center gap-2">
                {input.trim() && (
                  <div className="flex items-center gap-1 text-xs text-muted-foreground">
                    <Zap className="h-3 w-3" />
                    <span>Press Enter to send</span>
                  </div>
                )}
                
                <Button
                  type="submit"
                  disabled={!input.trim() || loading || disabled || input.length > maxLength}
                  className="rounded-full px-6"
                >
                  {loading ? (
                    <>
                      <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                      Analyzing...
                    </>
                  ) : (
                    <>
                      <Send className="h-4 w-4 mr-2" />
                      Send
                    </>
                  )}
                </Button>
              </div>
            </div>
          </div>
        </form>
      </Card>
    </div>
  );
}