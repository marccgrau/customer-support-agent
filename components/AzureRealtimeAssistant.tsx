'use client';

import React, { useState, useEffect, useRef } from 'react';
import { useChat } from 'ai/react';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import {
  Minimize,
  Maximize,
  Mic,
  MessageCircle,
  Lightbulb,
  User,
} from 'lucide-react';
import { azureSpeechService } from '../lib/azureSpeechService';

// Type Definitions
interface TranscribedSegment {
  text: string;
  timestamp: number;
  isPartial: boolean;
  speakerId: string;
}

interface ApiResponse {
  id: string;
  response: string;
  thinking: string;
  user_mood:
    | 'positive'
    | 'neutral'
    | 'negative'
    | 'curious'
    | 'frustrated'
    | 'confused';
  suggested_questions: string[];
  debug: {
    context_used: boolean;
  };
  matched_categories?: string[];
  redirect_to_agent?: {
    should_redirect: boolean;
    reason?: string;
  };
}

interface ConversationMessage {
  id: string;
  timestamp: number;
  text: string;
  speakerId: string;
  type: 'user' | 'system';
}

interface SuggestionMessage {
  id: string;
  timestamp: number;
  response: ApiResponse;
}

interface MessageHistory {
  conversations: ConversationMessage[];
  suggestions: SuggestionMessage[];
}

// Component Props
interface ConversationCardProps {
  messageHistory: MessageHistory;
  currentTranscript: string;
  isListening: boolean;
  toggleListening: () => Promise<void>;
  isLoading: boolean;
}

interface SuggestionsCardProps {
  messageHistory: MessageHistory;
  isLoading: boolean;
}

interface RealtimeAssistantProps {
  selectedKnowledgeBase?: string;
  selectedModel?: string;
}

// Conversation Card Component
const ConversationCard: React.FC<ConversationCardProps> = ({
  messageHistory,
  currentTranscript,
  isListening,
  toggleListening,
  isLoading,
}) => (
  <Card className='flex-1 flex flex-col overflow-hidden'>
    <CardHeader className='p-4 flex flex-row items-center justify-between'>
      <div className='flex items-center gap-2'>
        <MessageCircle className='h-4 w-4' />
        <CardTitle className='text-sm font-medium'>
          Conversation History
        </CardTitle>
      </div>
      <Button
        variant={isListening ? 'destructive' : 'outline'}
        size='sm'
        onClick={toggleListening}
        className='h-8 w-8 p-0'
        disabled={isLoading}
      >
        <Mic className='h-4 w-4' />
      </Button>
    </CardHeader>
    <CardContent className='flex-1 overflow-y-auto p-4'>
      <div className='space-y-4'>
        {messageHistory.conversations.map((message) => (
          <div key={message.id} className='flex items-start gap-2'>
            <Avatar className='h-8 w-8'>
              <AvatarFallback>
                <User className='h-4 w-4' />
              </AvatarFallback>
            </Avatar>
            <div className='flex flex-col flex-1'>
              <div className='text-xs text-muted-foreground'>
                Speaker {message.speakerId} •{' '}
                {new Date(message.timestamp).toLocaleTimeString()}
              </div>
              <div className='p-3 bg-muted rounded-lg text-sm'>
                {message.text}
              </div>
            </div>
          </div>
        ))}
        {currentTranscript && (
          <div className='p-3 bg-muted/50 rounded-lg text-sm text-muted-foreground'>
            {currentTranscript}
          </div>
        )}
        {isLoading && (
          <div className='flex items-center justify-center'>
            <div className='animate-spin rounded-full h-4 w-4 border-b-2 border-primary'></div>
          </div>
        )}
      </div>
    </CardContent>
  </Card>
);

// Suggestions Card Component
const SuggestionsCard: React.FC<SuggestionsCardProps> = ({
  messageHistory,
  isLoading,
}) => (
  <Card className='flex-1 flex flex-col overflow-hidden'>
    <CardHeader className='p-4 flex flex-row items-center justify-between border-b'>
      <div className='flex items-center gap-2'>
        <Lightbulb className='h-4 w-4' />
        <CardTitle className='text-sm font-medium'>
          AI Insights History
        </CardTitle>
      </div>
    </CardHeader>
    <CardContent className='flex-1 overflow-y-auto p-4'>
      {isLoading ? (
        <div className='flex items-center justify-center h-full'>
          <div className='animate-spin rounded-full h-8 w-8 border-b-2 border-primary'></div>
        </div>
      ) : messageHistory.suggestions.length > 0 ? (
        <div className='space-y-8'>
          {messageHistory.suggestions.map((suggestion) => (
            <div key={suggestion.id} className='space-y-6'>
              <div className='text-xs text-muted-foreground'>
                {new Date(suggestion.timestamp).toLocaleString()}
              </div>

              {/* Response Card */}
              <Card className='border shadow-sm'>
                <CardHeader className='p-3 border-b bg-muted/30'>
                  <div className='flex items-center justify-between'>
                    <div className='text-sm font-medium'>Agent Guidance</div>
                    <div className='flex gap-2'>
                      {suggestion.response.matched_categories?.map(
                        (category) => (
                          <span
                            key={category}
                            className='px-2 py-1 bg-blue-100 text-blue-800 rounded-full text-xs'
                          >
                            {category}
                          </span>
                        )
                      )}
                    </div>
                  </div>
                </CardHeader>
                <CardContent className='p-4'>
                  <p className='text-sm whitespace-pre-wrap'>
                    {suggestion.response.response}
                  </p>
                </CardContent>
              </Card>

              {/* Thinking Process Card */}
              <Card className='border shadow-sm'>
                <CardHeader className='p-3 border-b bg-muted/30'>
                  <div className='flex items-center justify-between'>
                    <div className='text-sm font-medium'>Analysis</div>
                    <div className='flex items-center gap-2'>
                      <span
                        className={`px-2 py-1 rounded-full text-xs ${
                          {
                            positive: 'bg-green-100 text-green-800',
                            negative: 'bg-red-100 text-red-800',
                            neutral: 'bg-gray-100 text-gray-800',
                            curious: 'bg-blue-100 text-blue-800',
                            frustrated: 'bg-orange-100 text-orange-800',
                            confused: 'bg-yellow-100 text-yellow-800',
                          }[suggestion.response.user_mood]
                        }`}
                      >
                        {suggestion.response.user_mood.charAt(0).toUpperCase() +
                          suggestion.response.user_mood.slice(1)}
                      </span>
                    </div>
                  </div>
                </CardHeader>
                <CardContent className='p-4'>
                  <p className='text-sm text-muted-foreground'>
                    {suggestion.response.thinking}
                  </p>
                </CardContent>
              </Card>

              {/* Suggested Questions */}
              {suggestion.response.suggested_questions.length > 0 && (
                <Card className='border shadow-sm'>
                  <CardHeader className='p-3 border-b bg-muted/30'>
                    <div className='text-sm font-medium'>
                      Suggested Follow-ups
                    </div>
                  </CardHeader>
                  <CardContent className='p-4'>
                    <div className='space-y-2'>
                      {suggestion.response.suggested_questions.map(
                        (question, index) => (
                          <div
                            key={index}
                            className='p-3 bg-muted/30 rounded-lg text-sm hover:bg-muted/40 transition-colors cursor-pointer'
                          >
                            {question}
                          </div>
                        )
                      )}
                    </div>
                  </CardContent>
                </Card>
              )}

              {/* Redirection Alert */}
              {suggestion.response.redirect_to_agent?.should_redirect && (
                <Card className='border-red-200 bg-red-50'>
                  <CardHeader className='p-3 border-b border-red-200 bg-red-100/50'>
                    <div className='text-sm font-medium text-red-800'>
                      Agent Redirection Required
                    </div>
                  </CardHeader>
                  <CardContent className='p-4'>
                    <p className='text-sm text-red-700'>
                      {suggestion.response.redirect_to_agent.reason}
                    </p>
                  </CardContent>
                </Card>
              )}
            </div>
          ))}
        </div>
      ) : (
        <div className='flex items-center justify-center h-full text-muted-foreground text-sm'>
          Waiting for conversation to begin...
        </div>
      )}
    </CardContent>
  </Card>
);

// Main Component
const AzureRealtimeAssistant: React.FC<RealtimeAssistantProps> = ({
  selectedKnowledgeBase = 'HHCPVMC1YV',
  selectedModel = 'claude-3-haiku-20240307',
}) => {
  const [isMinimized, setIsMinimized] = useState(false);
  const [isListening, setIsListening] = useState(false);
  const [currentTranscript, setCurrentTranscript] = useState('');
  const [error, setError] = useState<Error | null>(null);

  // Message history state
  const [messageHistory, setMessageHistory] = useState<MessageHistory>({
    conversations: [],
    suggestions: [],
  });

  // Handle API response processing
  const processApiResponse = (content: any) => {
    try {
      // Ensure we have a valid API response
      const apiResponse = content as ApiResponse;
      if (!apiResponse.id || !apiResponse.response) {
        console.error('Invalid API response structure:', content);
        return;
      }

      console.log('Processing API response:', apiResponse);

      // Update message history with new suggestion
      setMessageHistory((prev) => {
        const newSuggestion = {
          id: apiResponse.id,
          timestamp: Date.now(),
          response: apiResponse,
        };

        // Check if this suggestion already exists
        const exists = prev.suggestions.some((s) => s.id === apiResponse.id);
        if (exists) {
          return prev;
        }

        const newHistory = {
          ...prev,
          suggestions: [...prev.suggestions, newSuggestion],
        };

        console.log('Updated message history:', newHistory);
        return newHistory;
      });
    } catch (error) {
      console.error('Error processing API response:', error);
    }
  };

  const { messages, append, isLoading } = useChat({
    api: '/api/support',
    body: {
      knowledgeBaseId: selectedKnowledgeBase,
      model: selectedModel,
    },
    onResponse: async (response) => {
      console.log('Response received:', response);

      // Handle RAG sources
      const ragSources = response.headers.get('x-rag-sources');
      if (ragSources) {
        const parsedSources = JSON.parse(ragSources);
        window.dispatchEvent(
          new CustomEvent('updateRagSources', {
            detail: {
              sources: parsedSources,
              query: currentTranscript,
              debug: { context_used: true },
            },
          })
        );
      }

      // Try to get response body and process it
      try {
        const responseClone = response.clone();
        const responseBody = await responseClone.json();
        console.log('Response body:', responseBody);

        if (responseBody && typeof responseBody === 'object') {
          processApiResponse(responseBody);
        }
      } catch (error) {
        console.error('Error processing response body:', error);
      }
    },
    onFinish: (message) => {
      console.log('onFinish called with message:', message);
      if (message.role === 'assistant' && typeof message.content === 'object') {
        processApiResponse(message.content);
      }
    },
  });

  // Monitor messages for changes
  useEffect(() => {
    const assistantMessages = messages.filter(
      (m) => m.role === 'assistant' && typeof m.content === 'object'
    );

    assistantMessages.forEach((message) => {
      processApiResponse(message.content);
    });
  }, [messages]);

  // Cleanup effect
  useEffect(() => {
    return () => {
      if (isListening) {
        azureSpeechService.stopTranscription();
      }
    };
  }, [isListening]);

  // Buffer for collecting complete utterances
  const utteranceBuffer = useRef<
    {
      text: string;
      timestamp: number;
      speakerId: string;
    }[]
  >([]);

  // Process completed utterances
  const processUtterance = async (segment: {
    text: string;
    timestamp: number;
    speakerId: string;
  }) => {
    if (segment.text.trim().length < 5) {
      console.log('🔍 Utterance too short, skipping processing');
      return;
    }

    try {
      console.log('📝 Processing utterance:', segment.text);

      // Add to conversation history
      setMessageHistory((prev) => ({
        ...prev,
        conversations: [
          ...prev.conversations,
          {
            id: crypto.randomUUID(),
            timestamp: segment.timestamp,
            text: segment.text,
            speakerId: segment.speakerId,
            type: 'user',
          },
        ],
      }));

      // Send to API
      await append({
        role: 'user',
        content: segment.text,
      });
    } catch (error) {
      console.error('❌ Error processing utterance:', error);
      setError(error as Error);
    }
  };

  const toggleListening = async (): Promise<void> => {
    if (isListening) {
      await azureSpeechService.stopTranscription();
      setIsListening(false);
      setCurrentTranscript('');

      // Process any remaining utterances
      const pendingUtterances = utteranceBuffer.current;
      if (pendingUtterances.length > 0) {
        const combinedUtterance = {
          text: pendingUtterances.map((u) => u.text).join(' '),
          timestamp: Date.now(),
          speakerId: pendingUtterances[0].speakerId,
        };
        await processUtterance(combinedUtterance);
        utteranceBuffer.current = [];
      }
    } else {
      utteranceBuffer.current = [];
      const started = await azureSpeechService.startTranscription(
        // Partial transcript handler
        (text: string) => {
          console.log('✏️ Partial recognition:', text);
          setCurrentTranscript(text);
        },
        // Final transcript handler
        async (text: string, speakerId: string) => {
          console.log('📝 Final recognition:', text);
          const utterance = {
            text,
            timestamp: Date.now(),
            speakerId: speakerId || 'Unknown',
          };

          // Process the segment if it appears complete
          if (/[.!?]$/.test(text.trim())) {
            await processUtterance(utterance);
            utteranceBuffer.current = [];
          } else {
            utteranceBuffer.current.push(utterance);

            // Process if buffer gets too large
            if (utteranceBuffer.current.length >= 3) {
              const combinedUtterance = {
                text: utteranceBuffer.current.map((u) => u.text).join(' '),
                timestamp: Date.now(),
                speakerId: utteranceBuffer.current[0].speakerId,
              };
              await processUtterance(combinedUtterance);
              utteranceBuffer.current = [];
            }
          }
        },
        // Error handler
        (error: Error) => {
          console.error('❌ Azure Speech error:', error);
          setError(error);
          setIsListening(false);
        }
      );

      if (started) {
        setIsListening(true);
        setError(null);
      }
    }
  };

  // Debug effect to monitor state changes
  useEffect(() => {
    console.log('Message history updated:', messageHistory);
  }, [messageHistory]);

  return (
    <div className='flex-1 flex flex-col mb-4 mr-4 ml-4 overflow-hidden'>
      <Card className='flex-1 flex flex-col overflow-hidden'>
        <CardContent className='flex-1 flex flex-col overflow-hidden pt-4 px-4 pb-0'>
          <div className='flex items-center justify-between mb-4'>
            {error && (
              <div className='text-destructive text-sm'>
                Error: {error.message}
              </div>
            )}
            <Button
              variant='ghost'
              size='sm'
              onClick={() => setIsMinimized(!isMinimized)}
              className='h-8 w-8 p-0 ml-auto'
            >
              {isMinimized ? (
                <Maximize className='h-4 w-4' />
              ) : (
                <Minimize className='h-4 w-4' />
              )}
            </Button>
          </div>

          {!isMinimized && (
            <div className='flex-1 flex gap-4 overflow-hidden'>
              <ConversationCard
                messageHistory={messageHistory}
                currentTranscript={currentTranscript}
                isListening={isListening}
                toggleListening={toggleListening}
                isLoading={isLoading}
              />
              <SuggestionsCard
                messageHistory={messageHistory}
                isLoading={isLoading}
              />
            </div>
          )}
        </CardContent>
      </Card>

      {/* Debug output */}
      <div className='hidden'>
        <pre>
          {JSON.stringify(
            {
              conversations: messageHistory.conversations.length,
              suggestions: messageHistory.suggestions.length,
              isListening,
              isLoading,
              hasError: !!error,
            },
            null,
            2
          )}
        </pre>
      </div>
    </div>
  );
};

export default AzureRealtimeAssistant;
