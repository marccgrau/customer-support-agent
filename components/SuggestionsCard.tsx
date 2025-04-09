import React from 'react';
import { Lightbulb } from 'lucide-react';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { SuggestionsCardProps } from '../types';

const SuggestionsCard: React.FC<SuggestionsCardProps> = ({
  messageHistory,
  isLoading,
}) => {
  // Get only the most recent suggestion
  const latestSuggestion =
    messageHistory.suggestions.length > 0
      ? messageHistory.suggestions.reduce((latest, current) =>
          current.timestamp > latest.timestamp ? current : latest
        )
      : null;

  return (
    <Card className='h-full flex flex-col card'>
      <CardHeader className='p-4 flex flex-row items-center justify-between card-header-gradient'>
        <CardTitle className='elegant-title'>Conversation Guide</CardTitle>
      </CardHeader>

      <CardContent className='flex-1 p-4 overflow-y-auto'>
        {isLoading ? (
          <div className='flex items-center justify-center h-32'>
            <div className='animate-spin rounded-full h-8 w-8 border-b-2 border-primary'></div>
          </div>
        ) : latestSuggestion?.response.suggested_questions.length ? (
          <div className='space-y-4'>
            <div className='pl-3 border-l-2 border-primary/70 mb-4'>
              <h3 className='text-sm font-medium text-primary/90'>
                Consider these conversation directions based on the current
                context:
              </h3>
            </div>

            <div className='grid gap-3'>
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
                      {/* Icon */}
                      <div className='mt-0.5 flex-shrink-0 w-5 h-5 rounded-full bg-primary/10 text-primary flex items-center justify-center shadow-inner'>
                        <Lightbulb className='w-3 h-3' />
                      </div>

                      {/* Question text */}
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
          </div>
        ) : (
          <div className='flex flex-col items-center justify-center h-32 text-muted-foreground text-sm gap-3'>
            <div className='w-8 h-8 rounded-full bg-muted/30 flex items-center justify-center'>
              <Lightbulb className='w-4 h-4 text-muted-foreground' />
            </div>
            Waiting for conversation context...
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default SuggestionsCard;
