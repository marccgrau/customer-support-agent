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
const MAX_EMOTION_SCORES = 100; // Number of emotion scores to keep for the trace
const MOVING_AVERAGE_WINDOW = 5; // Number of observations for moving average

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

  // Initialize emotionScores with pre-filled random values
  const [emotionScores, setEmotionScores] = useState<number[]>(
    Array.from({ length: MAX_EMOTION_SCORES }, () => Math.random())
  );

  useEffect(() => {
    // Simulate emotion score changing every 200ms
    const interval = setInterval(() => {
      const randomScore = Math.random(); // Random score between 0 and 1

      setEmotionScores((prevScores) => {
        const newScores = [...prevScores.slice(1), randomScore]; // Remove first element, add new score at the end
        return newScores;
      });
    }, 200);

    return () => clearInterval(interval);
  }, []);

  // Compute smoothed emotion scores for the trace
  const smoothedEmotionScores = emotionScores.map((_, index, arr) => {
    const start = Math.max(0, index - MOVING_AVERAGE_WINDOW + 1);
    const window = arr.slice(start, index + 1);
    const average = window.reduce((sum, val) => sum + val, 0) / window.length;
    return average;
  });

  // The current emotion value is the last value in smoothedEmotionScores
  const currentEmotionValue =
    smoothedEmotionScores[smoothedEmotionScores.length - 1] || 0.5; // Default to 0.5 if undefined

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

  return (
    <aside className='w-[20%] pl-4 overflow-hidden pb-4 h-full'>
      <div className='flex flex-col h-full'>
        {/* Assistant Thinking Section */}
        <Card
          className={`${fadeInUpClass} overflow-hidden flex-grow flex flex-col`}
          style={fadeStyle}
        >
          <CardHeader>
            <CardTitle className='text-sm font-medium leading-none'>
              Assistant Thinking
            </CardTitle>
          </CardHeader>
          <CardContent className='overflow-y-auto flex-grow'>
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

        {/* Customer Emotion Section */}
        <Card
          className={`${fadeInUpClass} overflow-hidden mt-4`}
          style={fadeStyle}
        >
          <CardHeader>
            <CardTitle className='text-sm font-medium leading-none'>
              Customer Emotion
            </CardTitle>
          </CardHeader>
          <CardContent className='flex-grow flex flex-col justify-center items-center'>
            {/* Emotion Line Chart */}
            <div className='w-full h-full flex items-center justify-center'>
              <svg viewBox='0 0 100 50' className='w-full h-full'>
                {/* Gray Trace Line */}
                <polyline
                  fill='none'
                  stroke='#D1D5DB' // Tailwind's gray-300
                  strokeWidth='2'
                  strokeLinecap='round'
                  strokeLinejoin='round'
                  points={smoothedEmotionScores
                    .map((score, index) => {
                      // Adjust x to position current point more to the left
                      const x = (index / (MAX_EMOTION_SCORES - 1)) * 80; // 80 instead of 100
                      const y = (1 - score) * 50;
                      return `${x},${y}`;
                    })
                    .join(' ')}
                />
                {/* Current Point */}
                {smoothedEmotionScores.length >= MOVING_AVERAGE_WINDOW && (
                  <circle
                    // Position current point at x=80 instead of x=100
                    cx='80'
                    cy={(1 - currentEmotionValue) * 50}
                    r='2'
                    fill='#000000' // Black color
                  />
                )}
              </svg>
            </div>
          </CardContent>
        </Card>
      </div>
    </aside>
  );
};

export default LeftSidebar;
