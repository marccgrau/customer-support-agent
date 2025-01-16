'use client';

import React, { useState, useEffect } from 'react';
import { useChat, Message } from 'ai/react';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import {
  Minimize,
  Maximize,
  Mic,
  MessageCircle,
  Lightbulb,
} from 'lucide-react';
import { assemblyService } from '@/lib/assemblyService';

interface ConversationCardProps {
  transcribedText: string;
  partialTranscript: string;
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
  transcribedText,
  partialTranscript,
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
        {transcribedText || partialTranscript ? (
          <>
            {transcribedText && (
              <div className='p-3 bg-muted rounded-lg text-sm'>
                {transcribedText}
              </div>
            )}
            {partialTranscript && (
              <div className='p-3 bg-muted/50 rounded-lg text-sm text-muted-foreground'>
                {partialTranscript}
              </div>
            )}
          </>
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

const RealtimeAssistant: React.FC<RealtimeAssistantProps> = ({
  selectedKnowledgeBase = 'HHCPVMC1YV',
  selectedModel = 'claude-3-haiku-20240307',
}) => {
  const [isMinimized, setIsMinimized] = useState<boolean>(false);
  const [isListening, setIsListening] = useState<boolean>(false);
  const [transcribedText, setTranscribedText] = useState<string>('');
  const [partialTranscript, setPartialTranscript] = useState<string>('');
  const [error, setError] = useState<Error | null>(null);

  console.log('🎯 Current state:', {
    isMinimized,
    isListening,
    hasTranscribedText: Boolean(transcribedText),
    hasPartialTranscript: Boolean(partialTranscript),
    hasError: Boolean(error),
  });

  const { messages, append, isLoading, setMessages } = useChat({
    api: '/api/chat',
    body: {
      knowledgeBaseId: selectedKnowledgeBase,
      model: selectedModel,
    },
    onResponse: (response: Response) => {
      console.log('📡 Received API response');
      const ragHeader = response.headers.get('x-rag-sources');
      if (ragHeader) {
        console.log('📚 Processing RAG sources');
        const sources = JSON.parse(ragHeader);
        window.dispatchEvent(
          new CustomEvent('updateRagSources', {
            detail: {
              sources,
              query: transcribedText,
              debug: { context_used: true },
            },
          })
        );
      }
    },
    onFinish: (message: Message) => {
      console.log('✨ Message processing complete');
      try {
        const parsedContent: ParsedMessage = JSON.parse(message.content);
        console.log('🔄 Updating sidebar with new content');
        window.dispatchEvent(
          new CustomEvent('updateSidebar', {
            detail: {
              id: crypto.randomUUID(),
              content: parsedContent.thinking?.trim(),
              user_mood: parsedContent.user_mood,
              debug: parsedContent.debug,
              matched_categories: parsedContent.matched_categories,
            },
          })
        );
      } catch (error) {
        console.error('❌ Error parsing message content:', error);
      }
    },
  });

  useEffect(() => {
    console.log('🧹 Setting up cleanup effect');
    return () => {
      if (isListening) {
        console.log('🛑 Cleaning up: stopping transcription');
        assemblyService.stopTranscription();
      }
    };
  }, [isListening]);

  useEffect(() => {
    if (!transcribedText.trim()) {
      console.log('📝 No transcribed text to process');
      return;
    }

    console.log('🔄 Processing new transcript');
    const processTranscript = async () => {
      const contextPrompt = `You are an AI assistant monitoring an ongoing conversation.
        Previous context: ${messages.map((m) => m.content).join('\n')}
        
        New input: ${transcribedText}
        
        Provide relevant insights, suggestions, or helpful information based on this context.
        Format your response as JSON with thinking, response, and user_mood fields.`;

      console.log('📤 Sending transcript for processing');
      await append({
        role: 'user',
        content: contextPrompt,
      });

      console.log('🧹 Clearing transcribed text');
      setTranscribedText('');
    };

    const timeoutId = setTimeout(processTranscript, 1000);
    return () => {
      console.log('🚫 Clearing transcript processing timeout');
      clearTimeout(timeoutId);
    };
  }, [transcribedText, append, messages]);

  const toggleListening = async (): Promise<void> => {
    console.log(`🎙️ Toggle listening: Currently ${isListening ? 'ON' : 'OFF'}`);
    if (isListening) {
      console.log('🛑 Stopping transcription...');
      await assemblyService.stopTranscription();
      console.log('🧹 Cleaning up UI state...');
      setIsListening(false);
      setPartialTranscript('');
      console.log('✅ Transcription stopped successfully');
    } else {
      console.log('🎯 Starting transcription...');
      const started = await assemblyService.startTranscription(
        // Partial transcript handler
        (text: string) => {
          console.log('✏️ Updating partial transcript');
          setPartialTranscript(text);
        },
        // Final transcript handler
        (text: string) => {
          console.log('📝 Received final transcript');
          setTranscribedText((prev) => {
            const newText = prev + ' ' + text;
            console.log('📊 Updated transcript length:', newText.length);
            return newText;
          });
          setPartialTranscript('');
        },
        // Error handler
        (error: Error) => {
          console.error('❌ AssemblyAI error:', error);
          setError(error);
          console.log('🔄 Resetting listening state due to error');
          setIsListening(false);
        }
      );

      if (started) {
        console.log('✅ Transcription started successfully');
        setIsListening(true);
        setError(null);
      } else {
        console.log('❌ Failed to start transcription');
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
                transcribedText={transcribedText}
                partialTranscript={partialTranscript}
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

export default RealtimeAssistant;
