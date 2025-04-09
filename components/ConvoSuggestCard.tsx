'use client';

import React, { useState, useEffect, useRef } from 'react';
import { useChat } from 'ai/react';
import { Button } from '@/components/ui/button';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import {
  Mic,
  MessageCircle,
  User,
  UserCircle2,
  Lightbulb,
  AlertCircle,
} from 'lucide-react';
import { azureSpeechService } from '../lib/azureSpeechService';
import config from '@/config';
import { mockMessageHistory } from './data/mockData';
import { ApiResponse, MessageHistory } from '../types';
import { MdOutlineLightbulb, MdContentCopy, MdSend } from 'react-icons/md';
import { IoCheckmarkCircleOutline } from 'react-icons/io5';

const ConvoSuggestCard: React.FC = () => {
  // State management
  const [isListening, setIsListening] = useState(false);
  const [currentTranscript, setCurrentTranscript] = useState('');
  const [error, setError] = useState<Error | null>(null);
  const [messageHistory, setMessageHistory] = useState<MessageHistory>(
    config.includeMockMessages
      ? mockMessageHistory
      : { conversations: [], suggestions: [] }
  );
  const [expandedIndex, setExpandedIndex] = useState<number | null>(null);
  const [copiedIndex, setCopiedIndex] = useState<number | null>(null);

  // Get the latest messages from both user and system
  const getLatestMessages = () => {
    const conversations = [...messageHistory.conversations].reverse();
    const latestUser = conversations.find((msg) => msg.type === 'user');
    const latestSystem = conversations.find((msg) => msg.type === 'system');

    // Return messages in chronological order
    if (latestUser && latestSystem) {
      return [latestUser, latestSystem].sort(
        (a, b) => a.timestamp - b.timestamp
      );
    }
    return latestUser ? [latestUser] : [];
  };

  // Get only the most recent suggestion
  const latestSuggestion =
    messageHistory.suggestions.length > 0
      ? messageHistory.suggestions.reduce((latest, current) =>
          current.timestamp > latest.timestamp ? current : latest
        )
      : null;

  const latestMessages = getLatestMessages();

  // Check if we have valid suggestions to display
  const hasSuggestions =
    latestSuggestion?.response?.suggested_questions &&
    latestSuggestion.response.suggested_questions.length > 0;

  const suggestedResponses =
    latestSuggestion?.response.suggested_questions || [];

  const handleToggle = (index: number) => {
    setExpandedIndex(expandedIndex === index ? null : index);
  };

  const handleCopy = (text: string, index: number, e: React.MouseEvent) => {
    e.stopPropagation();
    navigator.clipboard.writeText(text);
    setCopiedIndex(index);
    setTimeout(() => setCopiedIndex(null), 2000);
  };

  const handleSend = (text: string, e: React.MouseEvent) => {
    e.stopPropagation();
    // Add to conversation history
    setMessageHistory((prev) => ({
      ...prev,
      conversations: [
        ...prev.conversations,
        {
          id: crypto.randomUUID(),
          timestamp: Date.now(),
          text: text,
          speakerId: 'Agent',
          type: 'system',
        },
      ],
    }));
    // Clear expanded state
    setExpandedIndex(null);
  };

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
      knowledgeBaseId: 'HHCPVMC1YV',
      model: 'claude-3-haiku-20240307',
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

  return (
    <Card className='h-full flex flex-col card priority-card'>
      <CardHeader className='flex flex-row items-center justify-between card-header-gradient py-5 px-6'>
        <CardTitle className='elegant-title'>Conversation</CardTitle>
      </CardHeader>

      <CardContent className='flex-1 p-5 overflow-y-auto'>
        <div className='space-y-6'>
          {error && (
            <div className='mb-4 p-3 rounded-lg bg-destructive/10 text-destructive text-sm flex items-center gap-2 border border-destructive/20 shadow-sm'>
              <span className='bg-destructive/20 p-1 rounded-full'>
                <AlertCircle className='h-4 w-4' />
              </span>
              {error.message}
            </div>
          )}

          {/* Recording Control Section */}
          <div className='flex items-center gap-3 p-3.5 bg-gradient-to-r from-muted/50 to-muted/10 rounded-lg backdrop-blur-[1px] shadow-sm border border-muted/50 subtle-fade-in'>
            <Button
              variant={isListening ? 'destructive' : 'outline'}
              size='sm'
              onClick={toggleListening}
              className={`h-9 w-9 p-0 transition-all duration-300 action-button ${
                isListening
                  ? 'shadow-md shadow-destructive/20 animate-pulse'
                  : 'shadow-sm'
              }`}
              disabled={isLoading}
            >
              <Mic className={`h-4 w-4 ${isListening ? '' : ''}`} />
            </Button>
            <div className='flex flex-col'>
              <span className='text-sm font-medium'>
                {isListening
                  ? 'Recording in progress...'
                  : 'Record the conversation'}
              </span>
              {isListening && (
                <span className='text-xs text-muted-foreground'>
                  Click to stop recording
                </span>
              )}
            </div>
          </div>

          {/* Conversation Flow */}
          <div className='space-y-4'>
            {/* Latest Messages */}
            {latestMessages.map((message, index) => (
              <div
                key={message.id}
                className={`flex items-start gap-2.5 ${
                  message.type === 'system' ? 'flex-row-reverse' : 'flex-row'
                } animate-in-right`}
                style={{ animationDelay: `${index * 150}ms` }}
              >
                <Avatar
                  className={`h-8 w-8 ${
                    message.type === 'user'
                      ? 'bg-primary/5 border border-primary/20'
                      : 'bg-secondary/20 border border-secondary/40'
                  } shadow-sm`}
                >
                  <AvatarFallback>
                    {message.type === 'user' ? (
                      <User className='h-4 w-4 text-primary/80' />
                    ) : (
                      <UserCircle2 className='h-4 w-4 text-secondary-foreground/80' />
                    )}
                  </AvatarFallback>
                </Avatar>
                <div
                  className={`flex flex-col flex-1 ${
                    message.type === 'system' ? 'items-end' : 'items-start'
                  }`}
                >
                  <div className='text-xs text-muted-foreground mb-1'>
                    {message.speakerId} •{' '}
                    {new Date(message.timestamp).toLocaleTimeString([], {
                      hour: '2-digit',
                      minute: '2-digit',
                    })}
                  </div>
                  <div
                    className={`p-3.5 text-sm shadow-sm ${
                      message.type === 'user'
                        ? 'message-bubble-user'
                        : 'message-bubble-system'
                    }`}
                  >
                    {message.text}
                  </div>
                </div>
              </div>
            ))}

            {/* Loading Indicator or Suggestions */}
            {isLoading ? (
              <div className='flex items-center justify-center h-16'>
                <div className='animate-spin rounded-full h-8 w-8 border-2 border-primary/30 border-t-primary'></div>
              </div>
            ) : (
              hasSuggestions && (
                <Card className='process-card animate-fade-in-up overflow-hidden border border-primary/5'>
                  <div className='process-card-header'>
                    <div className='flex items-center gap-4'>
                      <div className='step-indicator step-indicator-current'>
                        <MdOutlineLightbulb className='h-4 w-4' />
                      </div>
                      <div className='text-sm font-medium text-foreground'>
                        Suggested Responses
                      </div>
                    </div>
                  </div>

                  <div className='p-3 space-y-1'>
                    {suggestedResponses.map((suggestion, index) => (
                      <div
                        key={index}
                        className={`suggestion-item ${
                          expandedIndex === index
                            ? 'suggestion-item-active'
                            : ''
                        } animate-fade-in`}
                        style={{ animationDelay: `${index * 100}ms` }}
                        onClick={() => handleToggle(index)}
                      >
                        <div className='flex justify-between items-start w-full gap-3'>
                          <span
                            className={
                              expandedIndex === index
                                ? 'text-primary font-medium'
                                : 'text-muted-foreground'
                            }
                          >
                            {suggestion}
                          </span>

                          {expandedIndex === index && (
                            <div className='flex gap-2 mt-1 ml-2 flex-shrink-0'>
                              <button
                                onClick={(e) =>
                                  handleCopy(suggestion, index, e)
                                }
                                className='p-2 rounded-full bg-muted/50 hover:bg-muted/80 transition-colors focus:outline-none focus:ring-2 focus:ring-primary/50 action-button'
                                title='Copy to clipboard'
                              >
                                {copiedIndex === index ? (
                                  <IoCheckmarkCircleOutline className='h-4 w-4 text-blue-600' />
                                ) : (
                                  <MdContentCopy className='h-4 w-4' />
                                )}
                              </button>
                              <button
                                onClick={(e) => handleSend(suggestion, e)}
                                className='p-2 rounded-full bg-blue-500/10 hover:bg-blue-500/20 transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500/50 action-button'
                                title='Send response'
                              >
                                <MdSend className='h-4 w-4 text-blue-600' />
                              </button>
                            </div>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                </Card>
              )
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default ConvoSuggestCard;
