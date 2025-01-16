'use client';

import React, { useState, useEffect } from 'react';
import { useChat, Message } from 'ai/react';
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

interface TranscribedSegment {
  text: string;
  speakerId: string;
  isPartial: boolean;
  timestamp: number;
}

interface ConversationCardProps {
  segments: TranscribedSegment[];
  currentTranscript: string;
  isListening: boolean;
  toggleListening: () => Promise<void>;
  isLoading: boolean;
}

interface SuggestionsCardProps {
  messages: Message[];
  isLoading: boolean;
}

interface ParsedMessage {
  response?: string;
  thinking?: string;
  user_mood?: string;
  debug?: {
    context_used: boolean;
  };
  matched_categories?: string[];
}

interface RealtimeAssistantProps {
  selectedKnowledgeBase?: string;
  selectedModel?: string;
}

const ConversationCard: React.FC<ConversationCardProps> = ({
  segments,
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
          Conversation Monitor
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
        {segments.length > 0 ? (
          <div className='space-y-4'>
            {segments.map((segment, index) => (
              <div
                key={index}
                className={`flex items-start gap-2 ${
                  segment.isPartial ? 'opacity-70' : ''
                }`}
              >
                <Avatar className='h-8 w-8'>
                  <AvatarFallback>
                    <User className='h-4 w-4' />
                  </AvatarFallback>
                </Avatar>
                <div className='flex flex-col flex-1'>
                  <div className='text-xs text-muted-foreground'>
                    Speaker {segment.speakerId}
                  </div>
                  <div className='p-3 bg-muted rounded-lg text-sm'>
                    {segment.text}
                  </div>
                </div>
              </div>
            ))}
            {currentTranscript && (
              <div className='p-3 bg-muted/50 rounded-lg text-sm text-muted-foreground'>
                {currentTranscript}
              </div>
            )}
          </div>
        ) : (
          <div className='text-muted-foreground text-sm text-center'>
            {isListening
              ? 'Listening for conversation...'
              : 'Click the microphone to start listening'}
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

const SuggestionsCard: React.FC<SuggestionsCardProps> = ({
  messages,
  isLoading,
}) => {
  const getDisplayContent = (message: Message): string => {
    try {
      const parsed: ParsedMessage = JSON.parse(message.content);
      return parsed.response || message.content;
    } catch {
      return message.content;
    }
  };

  return (
    <Card className='flex-1 flex flex-col overflow-hidden'>
      <CardHeader className='p-4 flex flex-row items-center justify-between'>
        <div className='flex items-center gap-2'>
          <Lightbulb className='h-4 w-4' />
          <CardTitle className='text-sm font-medium'>AI Suggestions</CardTitle>
        </div>
      </CardHeader>
      <CardContent className='flex-1 overflow-y-auto p-4'>
        <div className='space-y-4'>
          {messages
            .filter(
              (m): m is Message & { role: 'assistant' } =>
                m.role === 'assistant'
            )
            .map((message, index) => (
              <div
                key={index}
                className='p-3 bg-muted rounded-lg text-sm animate-fade-in-up'
                style={{
                  animationDuration: '300ms',
                  animationFillMode: 'backwards',
                  animationDelay: `${index * 50}ms`,
                }}
              >
                {getDisplayContent(message)}
              </div>
            ))}
          {messages.length === 0 && (
            <div className='text-muted-foreground text-sm text-center'>
              Waiting for conversation to provide suggestions...
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
};

const AzureSpeechAssistant: React.FC<RealtimeAssistantProps> = ({
  selectedKnowledgeBase = 'HHCPVMC1YV',
  selectedModel = 'claude-3-haiku-20240307',
}) => {
  const [isMinimized, setIsMinimized] = useState<boolean>(false);
  const [isListening, setIsListening] = useState<boolean>(false);
  const [currentTranscript, setCurrentTranscript] = useState<string>('');
  const [segments, setSegments] = useState<TranscribedSegment[]>([]);
  const [error, setError] = useState<Error | null>(null);

  const { messages, append, isLoading, setMessages } = useChat({
    api: '/api/chat',
    body: {
      knowledgeBaseId: selectedKnowledgeBase,
      model: selectedModel,
    },
    // Rest of useChat config remains the same...
  });

  useEffect(() => {
    return () => {
      if (isListening) {
        azureSpeechService.stopTranscription();
      }
    };
  }, [isListening]);

  useEffect(() => {
    // Process full transcript segments for AI suggestions
    const processTranscript = async (segment: TranscribedSegment) => {
      const contextPrompt = `You are an AI assistant monitoring an ongoing conversation.
        Previous context: ${messages.map((m) => m.content).join('\n')}
        
        New input from Speaker ${segment.speakerId}: ${segment.text}
        
        Provide relevant insights, suggestions, or helpful information based on this context.
        Format your response as JSON with thinking, response, and user_mood fields.`;

      await append({
        role: 'user',
        content: contextPrompt,
      });
    };

    const latestSegment = segments[segments.length - 1];
    if (latestSegment && !latestSegment.isPartial) {
      processTranscript(latestSegment);
    }
  }, [segments, append, messages]);

  const toggleListening = async (): Promise<void> => {
    if (isListening) {
      await azureSpeechService.stopTranscription();
      setIsListening(false);
      setCurrentTranscript('');
    } else {
      const started = await azureSpeechService.startTranscription(
        // Partial transcript handler
        (text: string) => {
          setCurrentTranscript(text);
        },
        // Final transcript handler
        (text: string, speakerId: string) => {
          setSegments((prev) => [
            ...prev,
            {
              text,
              speakerId,
              isPartial: false,
              timestamp: Date.now(),
            },
          ]);
          setCurrentTranscript('');
        },
        // Error handler
        (error: Error) => {
          console.error('Azure Speech error:', error);
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
                segments={segments}
                currentTranscript={currentTranscript}
                isListening={isListening}
                toggleListening={toggleListening}
                isLoading={isLoading}
              />
              <SuggestionsCard messages={messages} isLoading={isLoading} />
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default AzureSpeechAssistant;
