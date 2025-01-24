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
    <Card className='h-full flex flex-col'>
      <CardHeader className='p-4 flex flex-row items-center justify-between border-b flex-shrink-0'>
        <div className='flex items-center gap-2'>
          <Lightbulb className='h-4 w-4 text-primary' />
          <CardTitle className='text-base'>Conversation Guide</CardTitle>
        </div>
      </CardHeader>

      <CardContent className='flex-1 p-4 overflow-y-auto'>
        {isLoading ? (
          <div className='flex items-center justify-center h-32'>
            <div className='animate-spin rounded-full h-8 w-8 border-b-2 border-primary'></div>
          </div>
        ) : latestSuggestion?.response.suggested_questions.length ? (
          <div className='space-y-4'>
            <div className='text-sm text-muted-foreground'>
              <p>
                Consider these conversation directions based on the current
                context:
              </p>
            </div>

            <div className='grid gap-3'>
              {latestSuggestion.response.suggested_questions.map(
                (question, index) => (
                  <div
                    key={index}
                    className='group relative bg-muted/30 hover:bg-primary/5 rounded-lg p-4 transition-colors cursor-pointer border border-muted hover:border-primary/20'
                  >
                    <div className='flex items-start gap-3'>
                      {/* Icon */}
                      <div className='mt-0.5 flex-shrink-0 w-5 h-5 rounded-full bg-primary/10 text-primary flex items-center justify-center'>
                        <Lightbulb className='w-3 h-3' />
                      </div>

                      {/* Question text */}
                      <div className='flex-1'>
                        <div className='text-sm font-medium text-foreground group-hover:text-primary transition-colors'>
                          {question}
                        </div>
                      </div>
                    </div>

                    {/* Subtle highlight effect on hover */}
                    <div className='absolute inset-0 border-2 border-primary/0 rounded-lg group-hover:border-primary/10 transition-colors' />
                  </div>
                )
              )}
            </div>
          </div>
        ) : (
          <div className='flex items-center justify-center h-32 text-muted-foreground text-sm'>
            Waiting for conversation context...
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default SuggestionsCard;
