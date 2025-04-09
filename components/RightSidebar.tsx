// RightSidebar.tsx
'use client';

import React from 'react';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import {
  Mail,
  Phone,
  MessageSquare,
  User2,
  User,
  CircleUser,
  Calendar,
  Briefcase,
  Package,
  Activity,
  Crown,
  Clock,
} from 'lucide-react';
import CollapsibleSection from './ui/collapsible-section';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';

// Mock data for customer description
const customerInfo = {
  name: 'John Doe',
  age: 35,
  gender: 'Male',
  job: 'Software Engineer',
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

const RightSidebar: React.FC = () => {
  // Function to get the appropriate icon for each channel
  const getChannelIcon = (channel: string) => {
    switch (channel.toLowerCase()) {
      case 'email':
        return <Mail className='h-4 w-4' />;
      case 'phone':
        return <Phone className='h-4 w-4' />;
      case 'chat':
        return <MessageSquare className='h-4 w-4' />;
      default:
        return null;
    }
  };

  return (
    <div className='h-full'>
      {/* Customer Detail Card */}
      <Card className='h-full flex flex-col card'>
        <CardHeader className='p-4 flex flex-row items-center justify-between card-header-gradient'>
          <CardTitle className='elegant-title'>Customer Details</CardTitle>
        </CardHeader>
        <CardContent className='flex-1 p-4 overflow-y-auto'>
          <div className='flex flex-col gap-4'>
            {/* Customer Profile Section */}
            <CollapsibleSection
              title='Customer Profile'
              icon={<CircleUser className='h-4 w-4 text-primary' />}
              defaultExpanded={true}
              className='animate-fade-in-up'
            >
              <div className='flex items-center gap-4 mb-4'>
                <Avatar className='h-16 w-16 border-2 border-primary/30 shadow-lg'>
                  <AvatarFallback className='bg-gradient-to-br from-primary/20 to-primary/10 text-primary'>
                    {customerInfo.name
                      .split(' ')
                      .map((n) => n[0])
                      .join('')}
                  </AvatarFallback>
                </Avatar>
                <div>
                  <h2 className='text-lg font-semibold'>{customerInfo.name}</h2>
                  <div className='flex items-center gap-2 text-sm text-muted-foreground'>
                    <Crown className='h-4 w-4 text-primary/80' />
                    <span>{customerInfo.clientStatus} Client</span>
                  </div>
                </div>
              </div>

              <div className='space-y-3'>
                {/* Basic Info Group */}
                <div className='space-y-2 p-3 rounded-md bg-gradient-to-r from-muted/50 to-transparent'>
                  <div className='flex items-center gap-2 text-sm'>
                    <Calendar className='h-4 w-4 text-muted-foreground' />
                    <span>{customerInfo.age} years old</span>
                  </div>
                  <div className='flex items-center gap-2 text-sm'>
                    <User className='h-4 w-4 text-muted-foreground' />
                    <span>{customerInfo.gender}</span>
                  </div>
                  <div className='flex items-center gap-2 text-sm'>
                    <Briefcase className='h-4 w-4 text-muted-foreground' />
                    <span>{customerInfo.job}</span>
                  </div>
                </div>

                {/* Products Section */}
                <div className='pt-3 border-t'>
                  <div className='flex items-center gap-2 mb-2'>
                    <Package className='h-4 w-4 text-primary/80' />
                    <span className='text-sm font-medium'>Active Products</span>
                  </div>
                  <div className='grid grid-cols-2 gap-2'>
                    {customerInfo.products.map((product, index) => (
                      <div
                        key={index}
                        className='text-xs px-2 py-1 bg-gradient-to-r from-primary/10 to-primary/5 rounded-md shadow-sm border border-primary/10 animate-fade-in'
                        style={{ animationDelay: `${index * 100}ms` }}
                      >
                        {product}
                      </div>
                    ))}
                  </div>
                </div>

                {/* Interaction Channels */}
                <div className='pt-3 border-t'>
                  <div className='flex items-center gap-2 mb-2'>
                    <Activity className='h-4 w-4 text-primary/80' />
                    <span className='text-sm font-medium'>
                      Preferred Channels
                    </span>
                  </div>
                  <div className='flex gap-3'>
                    {customerInfo.interactionChannels.map((channel, index) => (
                      <div
                        key={index}
                        className='flex items-center gap-1 text-xs px-2 py-1 bg-gradient-to-r from-accent/30 to-accent/10 rounded-md shadow-sm border border-accent/20 animate-fade-in'
                        style={{ animationDelay: `${(index + 3) * 100}ms` }}
                      >
                        {getChannelIcon(channel)}
                        <span>{channel}</span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </CollapsibleSection>

            {/* Interaction History Section */}
            <CollapsibleSection
              title='Interaction History'
              icon={<Clock className='h-4 w-4 text-primary' />}
              defaultExpanded={true}
              className='animate-fade-in-up'
            >
              <div className='space-y-4'>
                {mockPreviousInteractions.map((interaction, index) => (
                  <div
                    key={index}
                    className='rounded-lg border bg-gradient-to-r from-card to-muted/10 p-3 text-card-foreground shadow-sm hover:shadow-md transition-shadow duration-200 animate-fade-in'
                    style={{ animationDelay: `${index * 150}ms` }}
                  >
                    <div className='flex items-center justify-between mb-2'>
                      <div className='flex items-center gap-2'>
                        <div className='bg-primary/10 p-1 rounded-full'>
                          {getChannelIcon(interaction.channel)}
                        </div>
                        <span className='text-xs font-medium'>
                          {interaction.channel}
                        </span>
                      </div>
                      <time className='text-xs text-muted-foreground'>
                        {interaction.date}
                      </time>
                    </div>
                    <p className='text-sm text-muted-foreground'>
                      {interaction.summary}
                    </p>
                  </div>
                ))}
              </div>
            </CollapsibleSection>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default RightSidebar;
