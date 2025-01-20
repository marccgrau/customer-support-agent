import React from 'react';
import { Lightbulb } from 'lucide-react';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import CollapsibleSection from './ui/collapsible-section';
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
          <CardTitle className='text-base'>AI Insights</CardTitle>
        </div>
      </CardHeader>

      <CardContent className='flex-1 p-4 overflow-y-auto'>
        {isLoading ? (
          <div className='flex items-center justify-center h-32'>
            <div className='animate-spin rounded-full h-8 w-8 border-b-2 border-primary'></div>
          </div>
        ) : latestSuggestion ? (
          <div className='space-y-4'>
            <div className='text-xs text-muted-foreground'>
              {new Date(latestSuggestion.timestamp).toLocaleString()}
            </div>

            <CollapsibleSection
              title='Agent Guidance'
              defaultExpanded={true}
              isNested={true}
              className='w-full'
              headerExtra={
                <div className='flex gap-2'>
                  {latestSuggestion.response.matched_categories?.map(
                    (category) => (
                      <span
                        key={category}
                        className='px-2 py-1 bg-blue-100 text-blue-800 rounded-full text-xs whitespace-nowrap'
                      >
                        {category}
                      </span>
                    )
                  )}
                </div>
              }
            >
              <p className='text-sm whitespace-pre-wrap'>
                {latestSuggestion.response.response}
              </p>
            </CollapsibleSection>

            <CollapsibleSection
              title='Analysis'
              defaultExpanded={false}
              isNested={true}
              headerExtra={
                <span
                  className={`px-2 py-1 rounded-full text-xs whitespace-nowrap ${
                    {
                      positive: 'bg-green-100 text-green-800',
                      negative: 'bg-red-100 text-red-800',
                      neutral: 'bg-gray-100 text-gray-800',
                      curious: 'bg-blue-100 text-blue-800',
                      frustrated: 'bg-orange-100 text-orange-800',
                      confused: 'bg-yellow-100 text-yellow-800',
                    }[latestSuggestion.response.user_mood]
                  }`}
                >
                  {latestSuggestion.response.user_mood.charAt(0).toUpperCase() +
                    latestSuggestion.response.user_mood.slice(1)}
                </span>
              }
            >
              <p className='text-sm text-muted-foreground'>
                {latestSuggestion.response.thinking}
              </p>
            </CollapsibleSection>

            {latestSuggestion.response.suggested_questions.length > 0 && (
              <CollapsibleSection
                title='Suggested Follow-ups'
                defaultExpanded={false}
                isNested={true}
              >
                <div className='space-y-2'>
                  {latestSuggestion.response.suggested_questions.map(
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
              </CollapsibleSection>
            )}

            {latestSuggestion.response.redirect_to_agent?.should_redirect && (
              <div className='rounded-lg border-2 border-red-200 bg-red-50 p-4'>
                <div className='font-medium text-red-800 mb-2'>
                  Agent Redirection Required
                </div>
                <p className='text-sm text-red-700'>
                  {latestSuggestion.response.redirect_to_agent.reason}
                </p>
              </div>
            )}
          </div>
        ) : (
          <div className='flex items-center justify-center h-32 text-muted-foreground text-sm'>
            Waiting for conversation to begin...
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default SuggestionsCard;
