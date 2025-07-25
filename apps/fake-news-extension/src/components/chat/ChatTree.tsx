import React, { useState, useCallback } from 'react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card } from '@/components/ui/card';
import { 
  GitBranch, 
  ChevronLeft, 
  ChevronRight, 
  RotateCcw,
  Trash2,
  Eye,
  EyeOff
} from 'lucide-react';
import { Tooltip, TooltipContent, TooltipTrigger } from '@/components/ui/tooltip';

interface ChatMessage {
  id: string;
  text: string;
  isUser: boolean;
  timestamp: number;
  status?: 'pending' | 'sent' | 'error';
  aiData?: any;
  parentId?: string;
  children: string[];
}

interface ChatTree {
  messages: { [id: string]: ChatMessage };
  rootId: string | null;
  currentPath: string[];
}

interface ChatTreeProps {
  chatTree: ChatTree;
  onNavigateToBranch: (messageId: string, branchIndex: number) => void;
  onDeleteBranch: (messageId: string) => void;
  onResetToMessage: (messageId: string) => void;
  className?: string;
}

export function ChatTreeVisualization({ 
  chatTree, 
  onNavigateToBranch, 
  onDeleteBranch, 
  onResetToMessage,
  className = ""
}: ChatTreeProps) {
  const [isVisible, setIsVisible] = useState(false);
  const [selectedMessageId, setSelectedMessageId] = useState<string | null>(null);

  const getCurrentMessages = useCallback(() => {
    return chatTree.currentPath
      .map(id => chatTree.messages[id])
      .filter(msg => msg !== undefined);
  }, [chatTree]);

  const getMessageBranches = useCallback((messageId: string) => {
    const message = chatTree.messages[messageId];
    if (!message || !message.parentId) return [];
    
    const parent = chatTree.messages[message.parentId];
    if (!parent) return [];
    
    return parent.children.map(childId => chatTree.messages[childId]).filter(Boolean);
  }, [chatTree]);

  const getBranchIndex = useCallback((messageId: string) => {
    const message = chatTree.messages[messageId];
    if (!message || !message.parentId) return 0;
    
    const parent = chatTree.messages[message.parentId];
    if (!parent) return 0;
    
    return parent.children.indexOf(messageId);
  }, [chatTree]);

  const currentMessages = getCurrentMessages();
  
  if (currentMessages.length === 0) {
    return null;
  }

  return (
    <div className={`space-y-2 ${className}`}>
      {/* Toggle visibility */}
      <div className="flex items-center justify-between">
        <Button
          variant="ghost"
          size="sm"
          onClick={() => setIsVisible(!isVisible)}
          className="text-muted-foreground hover:text-foreground"
        >
          {isVisible ? (
            <>
              <EyeOff className="h-4 w-4 mr-2" />
              Hide Tree
            </>
          ) : (
            <>
              <Eye className="h-4 w-4 mr-2" />
              Show Tree
            </>
          )}
        </Button>
        
        {isVisible && (
          <div className="flex items-center gap-2 text-xs text-muted-foreground">
            <GitBranch className="h-3 w-3" />
            <span>{currentMessages.length} messages in current path</span>
          </div>
        )}
      </div>

      {/* Tree visualization */}
      {isVisible && (
        <Card className="p-4 bg-muted/30">
          <div className="space-y-3">
            <h4 className="font-semibold text-sm flex items-center gap-2">
              <GitBranch className="h-4 w-4" />
              Conversation Tree
            </h4>
            
            <div className="space-y-2">
              {currentMessages.map((message, index) => {
                const branches = getMessageBranches(message.id);
                const currentBranchIndex = getBranchIndex(message.id);
                const hasBranches = branches.length > 1;
                
                return (
                  <div key={message.id} className="space-y-2">
                    {/* Message node */}
                    <div 
                      className={`flex items-center gap-2 p-2 rounded-lg border transition-colors cursor-pointer ${
                        selectedMessageId === message.id 
                          ? 'bg-primary/10 border-primary/30' 
                          : 'bg-background border-border hover:bg-muted/50'
                      }`}
                      onClick={() => setSelectedMessageId(selectedMessageId === message.id ? null : message.id)}
                    >
                      <div className={`w-2 h-2 rounded-full ${
                        message.isUser ? 'bg-blue-500' : 'bg-green-500'
                      }`} />
                      
                      <span className="text-sm flex-1 truncate">
                        {message.text.slice(0, 50)}
                        {message.text.length > 50 && '...'}
                      </span>
                      
                      {hasBranches && (
                        <Badge variant="secondary" className="text-xs">
                          {branches.length} branches
                        </Badge>
                      )}
                      
                      <span className="text-xs text-muted-foreground">
                        {new Date(message.timestamp).toLocaleTimeString()}
                      </span>
                    </div>

                    {/* Branch controls */}
                    {selectedMessageId === message.id && hasBranches && (
                      <div className="ml-4 p-3 bg-muted/50 rounded-lg border border-dashed">
                        <div className="flex items-center justify-between mb-2">
                          <span className="text-xs font-medium text-muted-foreground">
                            Branch {currentBranchIndex + 1} of {branches.length}
                          </span>
                          
                          <div className="flex items-center gap-1">
                            <Tooltip>
                              <TooltipTrigger asChild>
                                <Button
                                  variant="ghost"
                                  size="sm"
                                  onClick={() => onNavigateToBranch(message.id, Math.max(0, currentBranchIndex - 1))}
                                  disabled={currentBranchIndex === 0}
                                  className="h-6 w-6 p-0"
                                >
                                  <ChevronLeft className="h-3 w-3" />
                                </Button>
                              </TooltipTrigger>
                              <TooltipContent>Previous branch</TooltipContent>
                            </Tooltip>
                            
                            <Tooltip>
                              <TooltipTrigger asChild>
                                <Button
                                  variant="ghost"
                                  size="sm"
                                  onClick={() => onNavigateToBranch(message.id, Math.min(branches.length - 1, currentBranchIndex + 1))}
                                  disabled={currentBranchIndex === branches.length - 1}
                                  className="h-6 w-6 p-0"
                                >
                                  <ChevronRight className="h-3 w-3" />
                                </Button>
                              </TooltipTrigger>
                              <TooltipContent>Next branch</TooltipContent>
                            </Tooltip>
                            
                            <Tooltip>
                              <TooltipTrigger asChild>
                                <Button
                                  variant="ghost"
                                  size="sm"
                                  onClick={() => onResetToMessage(message.id)}
                                  className="h-6 w-6 p-0 text-amber-600 hover:text-amber-700"
                                >
                                  <RotateCcw className="h-3 w-3" />
                                </Button>
                              </TooltipTrigger>
                              <TooltipContent>Reset conversation to this point</TooltipContent>
                            </Tooltip>
                            
                            <Tooltip>
                              <TooltipTrigger asChild>
                                <Button
                                  variant="ghost"
                                  size="sm"
                                  onClick={() => onDeleteBranch(message.id)}
                                  className="h-6 w-6 p-0 text-red-600 hover:text-red-700"
                                >
                                  <Trash2 className="h-3 w-3" />
                                </Button>
                              </TooltipTrigger>
                              <TooltipContent>Delete this branch</TooltipContent>
                            </Tooltip>
                          </div>
                        </div>
                        
                        <div className="text-xs text-muted-foreground">
                          Current: "{branches[currentBranchIndex]?.text.slice(0, 40)}..."
                        </div>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </div>
        </Card>
      )}
    </div>
  );
}

// Hook for managing chat tree state
export function useChatTree() {
  const [chatTree, setChatTree] = useState<ChatTree>({
    messages: {},
    rootId: null,
    currentPath: []
  });

  const addMessage = useCallback((message: Omit<ChatMessage, 'children'>) => {
    const messageWithChildren: ChatMessage = { ...message, children: [] };
    
    setChatTree(prev => {
      const newMessages = { ...prev.messages };
      const newCurrentPath = [...prev.currentPath];
      
      // Add message to messages
      newMessages[message.id] = messageWithChildren;
      
      // Update parent's children if this message has a parent
      if (message.parentId && newMessages[message.parentId]) {
        newMessages[message.parentId] = {
          ...newMessages[message.parentId],
          children: [...newMessages[message.parentId].children, message.id]
        };
      }
      
      // Update current path
      if (!message.parentId) {
        // This is a root message
        return {
          messages: newMessages,
          rootId: message.id,
          currentPath: [message.id]
        };
      } else {
        // Add to current path
        newCurrentPath.push(message.id);
        return {
          messages: newMessages,
          rootId: prev.rootId,
          currentPath: newCurrentPath
        };
      }
    });
  }, []);

  const updateMessage = useCallback((messageId: string, updates: Partial<ChatMessage>) => {
    setChatTree(prev => ({
      ...prev,
      messages: {
        ...prev.messages,
        [messageId]: {
          ...prev.messages[messageId],
          ...updates
        }
      }
    }));
  }, []);

  const navigateToBranch = useCallback((messageId: string, branchIndex: number) => {
    setChatTree(prev => {
      const message = prev.messages[messageId];
      if (!message || !message.parentId) return prev;
      
      const parent = prev.messages[message.parentId];
      if (!parent || branchIndex >= parent.children.length) return prev;
      
      const targetBranchId = parent.children[branchIndex];
      const messageIndex = prev.currentPath.indexOf(messageId);
      
      if (messageIndex === -1) return prev;
      
      // Update current path to use the new branch
      const newCurrentPath = [
        ...prev.currentPath.slice(0, messageIndex),
        targetBranchId
      ];
      
      return {
        ...prev,
        currentPath: newCurrentPath
      };
    });
  }, []);

  const deleteBranch = useCallback((messageId: string) => {
    setChatTree(prev => {
      const message = prev.messages[messageId];
      if (!message || !message.parentId) return prev;
      
      const parent = prev.messages[message.parentId];
      if (!parent) return prev;
      
      // Remove from parent's children
      const newMessages = { ...prev.messages };
      newMessages[message.parentId] = {
        ...parent,
        children: parent.children.filter(id => id !== messageId)
      };
      
      // Remove message and all its descendants
      const toDelete = [messageId];
      while (toDelete.length > 0) {
        const currentId = toDelete.pop()!;
        const currentMessage = newMessages[currentId];
        if (currentMessage) {
          toDelete.push(...currentMessage.children);
          delete newMessages[currentId];
        }
      }
      
      // Update current path if it included the deleted message
      const newCurrentPath = prev.currentPath.filter(id => newMessages[id]);
      
      return {
        messages: newMessages,
        rootId: prev.rootId,
        currentPath: newCurrentPath
      };
    });
  }, []);

  const resetToMessage = useCallback((messageId: string) => {
    setChatTree(prev => {
      const messageIndex = prev.currentPath.indexOf(messageId);
      if (messageIndex === -1) return prev;
      
      return {
        ...prev,
        currentPath: prev.currentPath.slice(0, messageIndex + 1)
      };
    });
  }, []);

  const clearTree = useCallback(() => {
    setChatTree({
      messages: {},
      rootId: null,
      currentPath: []
    });
  }, []);

  const getCurrentMessages = useCallback(() => {
    return chatTree.currentPath
      .map(id => chatTree.messages[id])
      .filter(msg => msg !== undefined);
  }, [chatTree]);

  return {
    chatTree,
    addMessage,
    updateMessage,
    navigateToBranch,
    deleteBranch,
    resetToMessage,
    clearTree,
    getCurrentMessages
  };
}