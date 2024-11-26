// RightSidebar.tsx

'use client';

import React, { useState, useEffect } from 'react';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import {
  Mail,
  Phone,
  MessageSquare,
  User,
  CircleUser,
  Calendar,
  Briefcase,
  Package,
  Activity,
  Crown, // New icon for Client Status
} from 'lucide-react'; // Import necessary icons

// Mock data for customer description
const customerInfo = {
  name: 'John Doe',
  age: 35,
  gender: 'Male',
  job: 'Software Engineer', // Added Job Information
  clientStatus: 'Affluent',
  products: ['Checking Account', 'Savings Account', 'Credit Card'],
  interactionChannels: ['Email', 'Phone', 'Chat'],
};

// Mock data for previous interactions
const mockPreviousInteractions = [
  {
    date: '2023-10-01',
    summary: 'Discussed account setup and initial onboarding.',
    channel: 'Email',
  },
  {
    date: '2023-09-15',
    summary: 'Resolved issue with password reset.',
    channel: 'Phone',
  },
  {
    date: '2023-08-30',
    summary: 'Answered questions about billing cycles.',
    channel: 'Chat',
  },
];

const MAX_EMOTION_SCORES = 100; // Number of emotion scores to keep for the trace
const MOVING_AVERAGE_WINDOW = 5; // Number of observations for moving average

// Animation classes and styles
const fadeInUpClass = 'animate-fade-in-up';
const fadeStyle = {
  animationDuration: '600ms',
  animationFillMode: 'backwards',
  animationTimingFunction: 'cubic-bezier(0.2, 0.8, 0.2, 1)',
};

const RightSidebar: React.FC = () => {
  // State for Emotion Card
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

  // Compute smoothed emotion scores using moving average
  const smoothedEmotionScores = emotionScores.map((_, index, arr) => {
    const start = Math.max(0, index - MOVING_AVERAGE_WINDOW + 1);
    const window = arr.slice(start, index + 1);
    const average = window.reduce((sum, val) => sum + val, 0) / window.length;
    return average;
  });

  // The current emotion value is the last value in smoothedEmotionScores
  const currentEmotionValue =
    smoothedEmotionScores[smoothedEmotionScores.length - 1] || 0.5; // Default to 0.5 if undefined

  // Function to get the appropriate icon for each channel
  const getChannelIcon = (channel: string) => {
    switch (channel.toLowerCase()) {
      case 'email':
        return <Mail size={14} className='text-muted-foreground' />;
      case 'phone':
        return <Phone size={14} className='text-muted-foreground' />;
      case 'chat':
        return <MessageSquare size={14} className='text-muted-foreground' />;
      default:
        return null;
    }
  };

  return (
    <aside className='w-[20%] pr-4 overflow-hidden pb-4 flex flex-col h-full'>
      <div className='flex flex-col flex-grow'>
        {/* Customer Description Card */}
        <Card
          className={`${fadeInUpClass} overflow-hidden mb-4`}
          style={fadeStyle}
        >
          <div className='flex items-start p-4'>
            {/* Large Icon on the Left */}
            <div className='flex-shrink-0'>
              <CircleUser size={64} className='mr-4' />
            </div>
            {/* Customer Info on the Right */}
            <div>
              <h2 className='text-xl font-semibold mb-2'>
                {customerInfo.name}
              </h2>
              <div className='flex items-center text-sm text-muted-foreground mb-1'>
                <Calendar className='mr-2' size={16} />
                <span>{customerInfo.age} years old</span>
              </div>
              <div className='flex items-center text-sm text-muted-foreground mb-1'>
                <User className='mr-2' size={16} />
                <span>{customerInfo.gender}</span>
              </div>
              <div className='flex items-center text-sm text-muted-foreground mb-1'>
                <Briefcase className='mr-2' size={16} />
                <span>{customerInfo.job}</span>
              </div>
              <div className='flex items-center text-sm text-muted-foreground mb-1'>
                <Crown className='mr-2' size={16} />
                <span>{customerInfo.clientStatus}</span>
              </div>
              <div className='flex items-start text-sm text-muted-foreground mb-1'>
                <Package className='mr-2 mt-1' size={16} />
                <div>
                  <span className='font-semibold'>Products:</span>
                  <ul className='list-disc list-inside ml-4'>
                    {customerInfo.products.map((product, index) => (
                      <li key={index}>{product}</li>
                    ))}
                  </ul>
                </div>
              </div>
              <div className='flex items-start text-sm text-muted-foreground'>
                <Activity className='mr-2 mt-1' size={16} />
                <div>
                  <span className='font-semibold'>Interaction Channels:</span>
                  <div className='flex space-x-2 mt-1'>
                    {customerInfo.interactionChannels.map((channel, index) => (
                      <div key={index} className='flex items-center'>
                        {getChannelIcon(channel)}
                        <span className='ml-1 text-xs'>{channel}</span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </Card>

        {/* Summary of Previous Interactions */}
        <Card
          className={`${fadeInUpClass} overflow-hidden flex-grow flex flex-col`}
          style={fadeStyle}
        >
          <CardHeader>
            <CardTitle className='text-sm font-medium leading-none'>
              Summary of Previous Interactions
            </CardTitle>
          </CardHeader>
          <CardContent className='overflow-y-auto flex-grow'>
            {mockPreviousInteractions.length === 0 && (
              <div className='text-sm text-muted-foreground'>
                No previous interactions found.
              </div>
            )}
            {mockPreviousInteractions.map((interaction, index) => (
              <div
                key={index}
                className={`mb-4 ${fadeInUpClass}`}
                style={{ ...fadeStyle, animationDelay: `${index * 50}ms` }}
              >
                <div className='flex items-center text-xs text-muted-foreground mb-1 gap-1'>
                  <span className='font-semibold'>{interaction.date}</span>
                  {getChannelIcon(interaction.channel)}
                  <span>{interaction.channel}</span>
                </div>
                <p className='text-sm text-muted-foreground'>
                  {interaction.summary}
                </p>
              </div>
            ))}
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
          <CardContent className='flex flex-col justify-center items-center'>
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

export default RightSidebar;
