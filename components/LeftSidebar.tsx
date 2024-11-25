'use client';

import React, { useState, useEffect } from 'react';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import {
  User,
  DollarSign,
  Wrench,
  Zap,
  Building2,
  Scale,
  ChartBarBig,
  CircleHelp,
} from 'lucide-react';

// Moved emotions array outside of the component
const emotions = ['Happy', 'Sad', 'Angry', 'Confused', 'Neutral'];

interface ThinkingContent {
  id: string;
  content: string;
  user_mood?: string;
  matched_categories?: string[];
  debug?: {
    context_used: boolean;
  };
}

const getDebugPillColor = (value: boolean): string => {
  return value
    ? 'bg-green-100 text-green-800 border-green-300' // Success
    : 'bg-yellow-100 text-yellow-800 border-yellow-300'; // Not Used/Not Relevant
};

const getMoodColor = (mood: string): string => {
  const colors: { [key: string]: string } = {
    positive: 'bg-green-100 text-green-800',
    negative: 'bg-red-100 text-red-800',
    curious: 'bg-blue-100 text-blue-800',
    frustrated: 'bg-orange-100 text-orange-800',
    confused: 'bg-yellow-100 text-yellow-800',
    neutral: 'bg-gray-100 text-gray-800',
  };
  return colors[mood?.toLowerCase()] || 'bg-gray-100 text-gray-800';
};

const MAX_THINKING_HISTORY = 15;

// Animation classes and styles
const fadeInUpClass = 'animate-fade-in-up';
const fadeStyle = {
  animationDuration: '600ms',
  animationFillMode: 'backwards',
  animationTimingFunction: 'cubic-bezier(0.2, 0.8, 0.2, 1)',
};

const LeftSidebar: React.FC = () => {
  const [thinkingContents, setThinkingContents] = useState<ThinkingContent[]>(
    []
  );
  const [currentEmotion, setCurrentEmotion] = useState<string>('Neutral');

  useEffect(() => {
    // Update customer emotion every 2 seconds
    const interval = setInterval(() => {
      setCurrentEmotion((prevEmotion) => {
        const currentIndex = emotions.indexOf(prevEmotion);
        const nextIndex = (currentIndex + 1) % emotions.length;
        return emotions[nextIndex];
      });
    }, 2000);

    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    const handleUpdateSidebar = (event: CustomEvent<ThinkingContent>) => {
      if (event.detail && event.detail.id) {
        console.log('🔍 DEBUG: Sidebar Event:', event.detail);
        setThinkingContents((prev) => {
          const exists = prev.some((item) => item.id === event.detail.id);
          if (!exists) {
            console.log(
              '📝 New thinking entry: ',
              event.detail.content.slice(0, 50) + '...'
            );

            const enhancedEntry = {
              ...event.detail,
              timestamp: new Date().toISOString(),
            };

            const newHistory = [enhancedEntry, ...prev].slice(
              0,
              MAX_THINKING_HISTORY
            );

            return newHistory;
          }
          return prev;
        });
      } else {
        console.warn("Missing 'id' in sidebar event detail:", event.detail);
      }
    };

    window.addEventListener(
      'updateSidebar',
      handleUpdateSidebar as EventListener
    );
    return () =>
      window.removeEventListener(
        'updateSidebar',
        handleUpdateSidebar as EventListener
      );
  }, []);

  const getEmotionColor = (emotion: string): string => {
    const colors: { [key: string]: string } = {
      Happy: 'text-green-600',
      Sad: 'text-blue-600',
      Angry: 'text-red-600',
      Confused: 'text-yellow-600',
      Neutral: 'text-gray-600',
    };
    return colors[emotion] || 'text-gray-600';
  };

  return (
    <aside className='w-[20%] pl-4 overflow-hidden pb-4 h-full'>
      <div className='flex flex-col h-full'>
        <Card
          className={`${fadeInUpClass} overflow-hidden flex-grow`}
          style={fadeStyle}
        >
          <CardHeader>
            <CardTitle className='text-sm font-medium leading-none'>
              Assistant Thinking
            </CardTitle>
          </CardHeader>
          <CardContent className='overflow-y-auto h-full'>
            {thinkingContents.length === 0 ? (
              <div className='text-sm text-muted-foreground'>
                The assistant inner dialogue will appear here for you to debug
                it
              </div>
            ) : (
              thinkingContents.map((content, index) => (
                <Card
                  key={content.id}
                  className={`mb-4 ${fadeInUpClass}`}
                  style={{
                    ...fadeStyle,
                    animationDelay: `${index * 50}ms`,
                  }}
                >
                  <CardContent className='py-4'>
                    <div className='text-sm text-muted-foreground'>
                      {content.content}
                    </div>
                    {content.user_mood && content.debug && (
                      <div className='flex items-center space-x-2 mt-4 text-xs'>
                        {/* Mood */}
                        <span
                          className={`px-2 py-1 rounded-full ${getMoodColor(
                            content.user_mood
                          )}`}
                        >
                          {content.user_mood.charAt(0).toUpperCase() +
                            content.user_mood.slice(1)}
                        </span>

                        <span
                          className={`px-2 py-1 rounded-full ${getDebugPillColor(
                            content.debug.context_used
                          )}`}
                        >
                          Context: {content.debug.context_used ? '✅' : '❌'}
                        </span>
                      </div>
                    )}
                    {content.matched_categories &&
                      content.matched_categories.length > 0 && (
                        <div className='mt-2'>
                          {content.matched_categories.map((category) => (
                            <div
                              key={category}
                              className='inline-flex items-center mr-2 mt-2 text-muted-foreground text-xs py-0'
                            >
                              {/* Category Icons */}
                              {category === 'account' && (
                                <User className='w-3 h-3 mr-1' />
                              )}
                              {category === 'billing' && (
                                <DollarSign className='w-3 h-3 mr-1' />
                              )}
                              {category === 'feature' && (
                                <Zap className='w-3 h-3 mr-1' />
                              )}
                              {category === 'internal' && (
                                <Building2 className='w-3 h-3 mr-1' />
                              )}
                              {category === 'legal' && (
                                <Scale className='w-3 h-3 mr-1' />
                              )}
                              {category === 'other' && (
                                <CircleHelp className='w-3 h-3 mr-1' />
                              )}
                              {category === 'technical' && (
                                <Wrench className='w-3 h-3 mr-1' />
                              )}
                              {category === 'usage' && (
                                <ChartBarBig className='w-3 h-3 mr-1' />
                              )}
                              {category
                                .split('_')
                                .map(
                                  (word) =>
                                    word.charAt(0).toUpperCase() + word.slice(1)
                                )
                                .join(' ')}
                            </div>
                          ))}
                        </div>
                      )}
                  </CardContent>
                </Card>
              ))
            )}
          </CardContent>
        </Card>

        <Card
          className={`${fadeInUpClass} overflow-hidden mt-4 flex-grow`}
          style={fadeStyle}
        >
          <CardHeader>
            <CardTitle className='text-sm font-medium leading-none'>
              Customer Emotion
            </CardTitle>
          </CardHeader>
          <CardContent className='overflow-y-auto flex items-center justify-center h-full'>
            <div
              className={`text-4xl font-bold animate-pulse ${getEmotionColor(
                currentEmotion
              )}`}
            >
              {currentEmotion}
            </div>
          </CardContent>
        </Card>
      </div>
    </aside>
  );
};

export default LeftSidebar;
