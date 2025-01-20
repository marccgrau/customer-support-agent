import React from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Mic, MessageCircle, User, UserCircle2 } from 'lucide-react';
import { ConversationCardProps } from '../types';

const ConversationCard: React.FC<ConversationCardProps> = ({
  messageHistory,
  currentTranscript,
  isListening,
  toggleListening,
  isLoading,
}) => (
  <Card className='h-full flex flex-col'>
    <CardHeader className='p-4 flex flex-row items-center justify-between border-b flex-shrink-0'>
      <div className='flex items-center gap-2'>
        <MessageCircle className='h-4 w-4 text-primary' />
        <CardTitle className='text-base'>Conversation Monitor</CardTitle>
      </div>
    </CardHeader>

    <CardContent className='flex-1 p-4 overflow-y-auto'>
      <div className='space-y-4'>
        {/* Recording Control Section */}
        <div className='flex items-center gap-3 p-3 bg-muted/30 rounded-lg'>
          <Button
            variant={isListening ? 'destructive' : 'secondary'}
            size='sm'
            onClick={toggleListening}
            className='h-8 w-8 p-0'
            disabled={isLoading}
          >
            <Mic className={`h-4 w-4 ${isListening ? 'animate-pulse' : ''}`} />
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

        {/* Messages Section */}
        {messageHistory.conversations.map((message) => (
          <div
            key={message.id}
            className={`flex items-start gap-2 ${
              message.type === 'system' ? 'flex-row-reverse' : 'flex-row'
            }`}
          >
            <Avatar className='h-8 w-8'>
              <AvatarFallback>
                {message.type === 'user' ? (
                  <User className='h-4 w-4' />
                ) : (
                  <UserCircle2 className='h-4 w-4' />
                )}
              </AvatarFallback>
            </Avatar>
            <div className='flex flex-col flex-1'>
              <div
                className={`text-xs text-muted-foreground ${
                  message.type === 'system' ? 'text-right' : 'text-left'
                }`}
              >
                {message.speakerId} •{' '}
                {new Date(message.timestamp).toLocaleTimeString()}
              </div>
              <div
                className={`p-3 rounded-lg text-sm ${
                  message.type === 'user'
                    ? 'bg-blue-100 text-blue-900 self-start'
                    : 'bg-gray-100 text-gray-900 self-end'
                }`}
              >
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

export default ConversationCard;
