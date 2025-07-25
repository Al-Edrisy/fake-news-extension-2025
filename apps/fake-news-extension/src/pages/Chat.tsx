import React, { useState, useRef, useEffect } from 'react';
import { Button } from '../components/ui/button';
import { Card, CardContent } from '../components/ui/card';
import { Badge } from '../components/ui/badge';
import { ScrollArea } from '../components/ui/scroll-area';
import { Separator } from '../components/ui/separator';
import { 
  Shield, 
  RefreshCw, 
  Trash2, 
  Download, 
  Settings,
  MessageSquare,
  Sparkles,
  ArrowDown,
  ChevronUp
} from 'lucide-react';
import Navbar from "@/components/Navbar";
import { useTheme } from "next-themes";
import { verifyClaim } from '../utils/config';
import { v4 as uuidv4 } from 'uuid';
import { ChatMessage } from '@/components/chat/ChatMessage';
import { ChatInput } from '@/components/chat/ChatInput';
import { ChatTreeVisualization, useChatTree } from '@/components/chat/ChatTree';
import { Tooltip, TooltipContent, TooltipTrigger } from '@/components/ui/tooltip';

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
    sources: Array<{
      title: string;
      url: string;
      domain: string;
      confidence: number;
      snippet: string;
      support?: string;
      date?: string;
    }>;
    category?: string;
  };
  parentId?: string;
  children: string[];
}

function EmptyState() {
  return (
    <div className="flex-1 flex items-center justify-center">
      <div className="text-center space-y-6 max-w-md mx-auto px-4">
        <div className="w-16 h-16 mx-auto bg-primary/10 rounded-full flex items-center justify-center">
          <MessageSquare className="h-8 w-8 text-primary" />
        </div>
        
        <div className="space-y-2">
          <h2 className="text-2xl font-bold text-foreground">Start a Conversation</h2>
          <p className="text-muted-foreground">
            Ask me to verify any news claim or statement. I'll analyze it using multiple sources and provide you with a detailed fact-check.
          </p>
        </div>

        <div className="flex items-center justify-center gap-2 text-sm text-muted-foreground">
          <Sparkles className="h-4 w-4" />
          <span>Powered by AI fact-checking</span>
        </div>
      </div>
    </div>
  );
}

function ScrollToBottomButton({ onClick, visible }: { onClick: () => void, visible: boolean }) {
  if (!visible) return null;
  
  return (
    <Tooltip>
      <TooltipTrigger asChild>
        <Button 
          variant="secondary" 
          size="icon" 
          className="fixed bottom-32 right-6 z-50 shadow-lg rounded-full" 
          onClick={onClick}
        >
          <ArrowDown className="w-4 h-4" />
        </Button>
      </TooltipTrigger>
      <TooltipContent>
        <p>Scroll to bottom</p>
      </TooltipContent>
    </Tooltip>
  );
}

function ChatHeader({ onClearChat, onExportChat }: { 
  onClearChat: () => void;
  onExportChat: () => void;
}) {
  return (
    <div className="flex items-center justify-between p-4 border-b border-border bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="flex items-center gap-3">
        <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center">
          <Shield className="h-4 w-4 text-primary" />
        </div>
        <div>
          <h1 className="font-semibold text-foreground">VeriNews Chat</h1>
          <p className="text-xs text-muted-foreground">AI-powered fact checking</p>
        </div>
      </div>
      
      <div className="flex items-center gap-2">
        <Tooltip>
          <TooltipTrigger asChild>
            <Button variant="ghost" size="sm" onClick={onExportChat}>
              <Download className="h-4 w-4" />
            </Button>
          </TooltipTrigger>
          <TooltipContent>
            <p>Export conversation</p>
          </TooltipContent>
        </Tooltip>
        
        <Tooltip>
          <TooltipTrigger asChild>
            <Button variant="ghost" size="sm" onClick={onClearChat}>
              <Trash2 className="h-4 w-4" />
            </Button>
          </TooltipTrigger>
          <TooltipContent>
            <p>Clear conversation</p>
          </TooltipContent>
        </Tooltip>
      </div>
    </div>
  );
}

export default function Chat() {
  const { theme } = useTheme();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [editingMessageId, setEditingMessageId] = useState<string | null>(null);
  const [editingText, setEditingText] = useState('');
  const [showScrollButton, setShowScrollButton] = useState(false);
  
  const scrollAreaRef = useRef<HTMLDivElement>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  
  const {
    chatTree,
    addMessage,
    updateMessage,
    navigateToBranch,
    deleteBranch,
    resetToMessage,
    clearTree,
    getCurrentMessages
  } = useChatTree();

  const currentMessages = getCurrentMessages();

  // Auto-scroll to bottom when new messages arrive
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [currentMessages.length]);

  // Handle scroll to show/hide scroll button
  useEffect(() => {
    const scrollArea = scrollAreaRef.current;
    if (!scrollArea) return;

    const handleScroll = () => {
      const { scrollTop, scrollHeight, clientHeight } = scrollArea;
      const isNearBottom = scrollHeight - scrollTop - clientHeight < 100;
      setShowScrollButton(!isNearBottom && currentMessages.length > 0);
    };

    scrollArea.addEventListener('scroll', handleScroll);
    return () => scrollArea.removeEventListener('scroll', handleScroll);
  }, [currentMessages.length]);

  const handleSendMessage = async (text: string) => {
    if (loading) return;

    const userMessageId = uuidv4();
    const userMessage: ChatMessageData = {
      id: userMessageId,
      text,
      isUser: true,
      timestamp: Date.now(),
      status: 'sent',
      children: [],
      parentId: currentMessages.length > 0 ? currentMessages[currentMessages.length - 1].id : undefined
    };

    addMessage(userMessage);
    setLoading(true);
    setError(null);

    try {
      const response = await verifyClaim(text);
      
      const aiMessageId = uuidv4();
      const aiMessage: ChatMessageData = {
        id: aiMessageId,
        text: response.conclusion || 'Analysis complete',
        isUser: false,
        timestamp: Date.now(),
        status: 'sent',
        children: [],
        parentId: userMessageId,
        aiData: {
          verdict: response.verdict || 'Unknown',
          confidence: response.confidence || 0,
          conclusion: response.conclusion || '',
          explanation: response.explanation || '',
          sources: response.sources || [],
          category: response.category
        }
      };

      addMessage(aiMessage);
    } catch (err) {
      setError('Failed to analyze the claim. Please try again.');
      updateMessage(userMessageId, { status: 'error' });
    } finally {
      setLoading(false);
    }
  };

  const handleEditMessage = (messageId: string, newText: string) => {
    setEditingMessageId(messageId);
    setEditingText(newText);
  };

  const handleSaveEdit = () => {
    if (editingMessageId && editingText.trim()) {
      updateMessage(editingMessageId, { text: editingText.trim() });
      setEditingMessageId(null);
      setEditingText('');
    }
  };

  const handleCancelEdit = () => {
    setEditingMessageId(null);
    setEditingText('');
  };

  const handleRegenerateResponse = async (messageId: string) => {
    const message = chatTree.messages[messageId];
    if (!message || message.isUser || !message.parentId) return;

    const parentMessage = chatTree.messages[message.parentId];
    if (!parentMessage) return;

    setLoading(true);
    try {
      const response = await verifyClaim(parentMessage.text);
      
      updateMessage(messageId, {
        text: response.conclusion || 'Analysis complete',
        aiData: {
          verdict: response.verdict || 'Unknown',
          confidence: response.confidence || 0,
          conclusion: response.conclusion || '',
          explanation: response.explanation || '',
          sources: response.sources || [],
          category: response.category
        }
      });
    } catch (err) {
      setError('Failed to regenerate response. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleClearChat = () => {
    clearTree();
    setError(null);
    setEditingMessageId(null);
    setEditingText('');
  };

  const handleExportChat = () => {
    const chatData = {
      messages: currentMessages,
      exportedAt: new Date().toISOString(),
      totalMessages: currentMessages.length
    };

    const blob = new Blob([JSON.stringify(chatData, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `verinews-chat-${new Date().toISOString().split('T')[0]}.json`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  return (
    <div className="min-h-screen bg-background">
      <Navbar currentPage="chat" />
      
      <div className="flex flex-col h-[calc(100vh-64px)]">
        <ChatHeader onClearChat={handleClearChat} onExportChat={handleExportChat} />
        
        {/* Chat Tree Visualization */}
        {currentMessages.length > 0 && (
          <div className="border-b border-border bg-muted/30">
            <div className="max-w-4xl mx-auto">
              <ChatTreeVisualization
                chatTree={chatTree}
                onNavigateToBranch={navigateToBranch}
                onDeleteBranch={deleteBranch}
                onResetToMessage={resetToMessage}
                className="p-4"
              />
            </div>
          </div>
        )}

        {/* Messages Area */}
        <div className="flex-1 relative">
          <ScrollArea className="h-full" ref={scrollAreaRef}>
            <div className="max-w-4xl mx-auto p-4">
              {error && (
                <Card className="mb-4 border-red-200 bg-red-50 dark:border-red-800 dark:bg-red-950/50">
                  <CardContent className="p-4">
                    <div className="flex items-center justify-between">
                      <p className="text-red-700 dark:text-red-300">{error}</p>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => setError(null)}
                        className="text-red-700 dark:text-red-300"
                      >
                        Dismiss
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              )}

              {currentMessages.length === 0 ? (
                <EmptyState />
              ) : (
                <div className="space-y-6">
                  {currentMessages.map((message) => (
                    <div key={message.id} className="group">
                      <ChatMessage
                        message={message}
                        onEdit={handleEditMessage}
                        onRegenerate={handleRegenerateResponse}
                        isEditing={editingMessageId === message.id}
                        editingText={editingText}
                        setEditingText={setEditingText}
                        onSaveEdit={handleSaveEdit}
                        onCancelEdit={handleCancelEdit}
                      />
                    </div>
                  ))}
                  
                  {loading && (
                    <div className="flex justify-start">
                      <div className="bg-muted/50 border border-border rounded-2xl px-4 py-3 max-w-[80%] loading-container">
                        <div className="flex items-center gap-3">
                          <div className="w-5 h-5 loading-spinner"></div>
                          <span className="text-sm text-muted-foreground loading-text">Analyzing claim...</span>
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              )}
              
              <div ref={messagesEndRef} />
            </div>
          </ScrollArea>

          <ScrollToBottomButton onClick={scrollToBottom} visible={showScrollButton} />
        </div>

        {/* Input Area */}
        <div className="border-t border-border bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
          <div className="max-w-4xl mx-auto p-4">
            <ChatInput
              onSend={handleSendMessage}
              loading={loading}
              disabled={loading}
              placeholder="Ask about any news claim to verify its accuracy..."
            />
          </div>
        </div>
      </div>
    </div>
  );
}