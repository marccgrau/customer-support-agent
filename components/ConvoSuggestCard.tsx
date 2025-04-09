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
    <Card className='h-full flex flex-col card'>
      <CardHeader className='p-4 flex flex-row items-center justify-between card-header-gradient'>
        <CardTitle className='elegant-title'>Conversation Monitor</CardTitle>
      </CardHeader>

      <CardContent className='flex-1 p-4 overflow-y-auto'>
        <div className='space-y-6'>
          {/* Recording Control Section */}
          <div className='flex items-center gap-3 p-3 bg-gradient-to-r from-muted to-muted/20 rounded-lg animate-fade-in'>
            <Button
              variant={isListening ? 'destructive' : 'secondary'}
              size='sm'
              onClick={toggleListening}
              className={`h-8 w-8 p-0 transition-all duration-300 ${
                isListening ? 'shadow-md shadow-destructive/30' : 'shadow-sm'
              }`}
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
            {latestMessages.map((message, index) => (
              <div
                key={message.id}
                className={`flex items-start gap-2 ${
                  message.type === 'system' ? 'flex-row-reverse' : 'flex-row'
                } animate-in-right`}
                style={{ animationDelay: `${index * 150}ms` }}
              >
                <Avatar
                  className={`h-8 w-8 ${
                    message.type === 'user'
                      ? 'bg-primary/10 border border-primary/30'
                      : 'bg-secondary/30 border border-secondary/30'
                  } shadow-sm`}
                >
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
                    className={`p-3 text-sm shadow-sm ${
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
                <div className='animate-spin rounded-full h-8 w-8 border-b-2 border-primary'></div>
              </div>
            ) : (
              hasSuggestions && (
                <Card className='relative overflow-hidden animate-fade-in-up-fast border-0 shadow-none'>
                  <div className='mb-3 pl-3 border-l-2 border-primary/70'>
                    <h3 className='text-sm font-medium text-primary/90'>
                      Suggested responses
                    </h3>
                  </div>

                  <div className='space-y-2'>
                    {latestSuggestion.response.suggested_questions.map(
                      (question, index) => (
                        <div
                          key={index}
                          className={`suggestion-item ${
                            index === 0 ? 'suggestion-item-active' : ''
                          } animate-fade-in`}
                          style={{ animationDelay: `${index * 100}ms` }}
                        >
                          <div className='flex items-start gap-3'>
                            <div className='mt-0.5 flex-shrink-0 w-5 h-5 rounded-full flex items-center justify-center bg-primary/10 text-primary'>
                              <Lightbulb className='h-3 w-3' />
                            </div>
                            <div className='flex-1'>
                              <div
                                className={`text-sm ${
                                  index === 0
                                    ? 'font-medium text-foreground'
                                    : 'text-muted-foreground'
                                }`}
                              >
                                {question}
                              </div>
                            </div>
                          </div>
                        </div>
                      )
                    )}
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
