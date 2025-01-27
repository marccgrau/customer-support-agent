import React from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Mic, MessageCircle, User, UserCircle2, Lightbulb } from 'lucide-react';
import { ConvoSuggestCardProps } from '../types';

const ConvoSuggestCard: React.FC<ConvoSuggestCardProps> = ({
  messageHistory,
  currentTranscript,
  isListening,
  toggleListening,
  isLoading,
}) => {
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

  return (
    <Card className='h-full flex flex-col'>
      <CardHeader className='p-4 flex flex-row items-center justify-between border-b flex-shrink-0'>
        <div className='flex items-center gap-2'>
          <MessageCircle className='h-4 w-4 text-primary' />
          <CardTitle className='text-base'>Conversation Monitor</CardTitle>
        </div>
      </CardHeader>

      <CardContent className='flex-1 p-4 overflow-y-auto'>
        <div className='space-y-6'>
          {/* Recording Control Section */}
          <div className='flex items-center gap-3 p-3 bg-muted/30 rounded-lg'>
            <Button
              variant={isListening ? 'destructive' : 'secondary'}
              size='sm'
              onClick={toggleListening}
              className='h-8 w-8 p-0'
              disabled={isLoading}
            >
              <Mic
                className={`h-4 w-4 ${isListening ? 'animate-pulse' : ''}`}
              />
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
            {latestMessages.map((message) => (
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
                <div
                  className={`flex flex-col flex-1 ${
                    message.type === 'system' ? 'items-end' : 'items-start'
                  }`}
                >
                  <div className='text-xs text-muted-foreground'>
                    {message.speakerId} •{' '}
                    {new Date(message.timestamp).toLocaleTimeString()}
                  </div>
                  <div
                    className={`p-3 rounded-lg text-sm ${
                      message.type === 'user'
                        ? 'bg-blue-100 text-blue-900'
                        : 'bg-gray-100 text-gray-900'
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
                <div className='animate-spin rounded-full h-8 w-8 border-b-2 border-primary'></div>
              </div>
            ) : (
              hasSuggestions && (
                <div className='pl-10 space-y-3'>
                  <div className='text-sm text-muted-foreground font-medium flex items-center gap-2'>
                    <Lightbulb className='h-4 w-4' />
                    Suggested next steps:
                  </div>
                  {latestSuggestion.response.suggested_questions.map(
                    (question, index) => (
                      <div
                        key={index}
                        className='group relative bg-primary/5 hover:bg-primary/10 rounded-lg p-3 transition-colors cursor-pointer border border-primary/10 hover:border-primary/20'
                      >
                        <div className='flex items-start gap-3'>
                          <div className='flex-1'>
                            <div className='text-sm text-primary group-hover:text-primary/80 transition-colors'>
                              {question}
                            </div>
                          </div>
                        </div>
                      </div>
                    )
                  )}
                </div>
              )
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default ConvoSuggestCard;
