'use client';

import React, { useState, useEffect, useRef } from 'react';
import { useChat } from 'ai/react';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import ConversationCard from './ConversationCard';
import SuggestionsCard from './SuggestionsCard';
import ProcessTree from './ProcessTree';
import { BrainCircuit } from 'lucide-react';
import { azureSpeechService } from '../lib/azureSpeechService';
import config from '@/config';
import { mockMessageHistory } from './data/mockData';
import { RealtimeAssistantProps, MessageHistory, ApiResponse } from '../types';
import CollapsibleLayout from './ui/collapsible-layout';

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
  const [messageHistory, setMessageHistory] = useState<MessageHistory>(
    config.includeMockMessages
      ? mockMessageHistory
      : { conversations: [], suggestions: [] }
  );

  console.log('Initial message history:', messageHistory);

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
    <div className='h-full'>
      <Card className='h-full flex flex-col'>
        <CardHeader className='p-4 flex flex-row items-center justify-between border-b flex-shrink-0'>
          <div className='flex items-center'>
            <div className='flex items-center gap-2'>
              <BrainCircuit className='h-5 w-5 text-primary' />
              <CardTitle>Conversation</CardTitle>
            </div>
          </div>
        </CardHeader>

        <CardContent className='flex-1 p-4 overflow-auto'>
          <div className='flex flex-col h-full'>
            {error && (
              <div className='mb-4 p-3 rounded-lg bg-destructive/10 text-destructive text-sm'>
                Error: {error.message}
              </div>
            )}

            <CollapsibleLayout
              conversationCard={
                <ConversationCard
                  messageHistory={messageHistory}
                  currentTranscript={currentTranscript}
                  isListening={isListening}
                  toggleListening={toggleListening}
                  isLoading={isLoading}
                />
              }
              processTree={<ProcessTree />}
              suggestionsCard={
                <SuggestionsCard
                  messageHistory={messageHistory}
                  isLoading={isLoading}
                />
              }
            />
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default AzureRealtimeAssistant;
