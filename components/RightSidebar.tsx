// RightSidebar.tsx
'use client';

import React from 'react';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
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
  ChevronRight,
  Shield,
} from 'lucide-react';
import CollapsibleSection from './ui/collapsible-section';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';

// Mock data for customer description
const customerInfo = {
  name: 'John Doe',
  avatar: '/user-avatar.png',
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
      <Card className='h-full flex flex-col card priority-card'>
        <CardHeader className='flex flex-row items-center justify-between card-header-gradient py-5 px-6'>
          <CardTitle className='elegant-title'>Customer</CardTitle>
        </CardHeader>
        <CardContent className='flex-1 p-5 overflow-y-auto'>
          <div className='flex flex-col gap-5'>
            {/* Customer Profile Section */}
            <CollapsibleSection
              title='Profile'
              icon={<CircleUser className='h-4 w-4 text-primary' />}
              defaultExpanded={true}
              className='animate-fade-in-up border border-primary/5 rounded-lg shadow-sm'
            >
              <div className='flex items-center gap-4 mb-5'>
                <Avatar className='h-16 w-16 border border-primary/20 shadow-lg'>
                  <AvatarFallback className='bg-gradient-to-br from-primary/10 to-primary/5 text-primary'>
                    {customerInfo.name
                      .split(' ')
                      .map((n) => n[0])
                      .join('')}
                  </AvatarFallback>
                </Avatar>
                <div>
                  <h2 className='text-lg font-semibold'>{customerInfo.name}</h2>
                  <div className='flex items-center gap-2 text-sm text-muted-foreground'>
                    <Badge
                      variant='outline'
                      className='flex items-center gap-1 px-2 border-blue-500/20 text-xs bg-blue-500/5'
                    >
                      <Crown className='h-3 w-3 text-blue-500/80' />
                      <span>{customerInfo.clientStatus}</span>
                    </Badge>
                  </div>
                </div>
              </div>

              <div className='space-y-4'>
                {/* Basic Info Group */}
                <div className='space-y-2.5 p-3.5 rounded-lg bg-muted/20 border border-muted/50'>
                  <div className='flex items-center gap-2.5 text-sm'>
                    <span className='h-7 w-7 rounded-full bg-muted/30 flex items-center justify-center flex-shrink-0'>
                      <Calendar className='h-3.5 w-3.5 text-muted-foreground' />
                    </span>
                    <span>{customerInfo.age} years old</span>
                  </div>
                  <div className='flex items-center gap-2.5 text-sm'>
                    <span className='h-7 w-7 rounded-full bg-muted/30 flex items-center justify-center flex-shrink-0'>
                      <User className='h-3.5 w-3.5 text-muted-foreground' />
                    </span>
                    <span>{customerInfo.gender}</span>
                  </div>
                  <div className='flex items-center gap-2.5 text-sm'>
                    <span className='h-7 w-7 rounded-full bg-muted/30 flex items-center justify-center flex-shrink-0'>
                      <Briefcase className='h-3.5 w-3.5 text-muted-foreground' />
                    </span>
                    <span>{customerInfo.job}</span>
                  </div>
                </div>

                {/* Products Section */}
                <div className='pt-3 border-t border-primary/5'>
                  <div className='flex items-center gap-2 mb-3'>
                    <Package className='h-4 w-4 text-blue-500/80' />
                    <span className='text-sm font-medium'>Active Products</span>
                  </div>
                  <div className='grid grid-cols-2 gap-2'>
                    {customerInfo.products.map((product, index) => (
                      <div
                        key={index}
                        className='text-sm px-3 py-2 bg-gradient-to-r from-blue-500/10 to-muted/10 rounded-md shadow-sm border border-muted/40 flex items-center gap-1 hover:border-blue-500/20 transition-colors subtle-fade-in'
                        style={{ animationDelay: `${index * 100}ms` }}
                      >
                        <Shield className='h-3.5 w-3.5 text-blue-500/60 mr-1' />
                        {product}
                      </div>
                    ))}
                  </div>
                </div>

                {/* Interaction Channels */}
                <div className='pt-3 border-t border-primary/5'>
                  <div className='flex items-center gap-2 mb-3'>
                    <Activity className='h-4 w-4 text-blue-500/80' />
                    <span className='text-sm font-medium'>
                      Preferred Channels
                    </span>
                  </div>
                  <div className='flex gap-2'>
                    {customerInfo.interactionChannels.map((channel, index) => (
                      <div
                        key={index}
                        className='flex items-center gap-1.5 text-sm px-3 py-1.5 bg-gradient-to-r from-blue-500/5 to-transparent rounded-full shadow-sm border border-blue-500/10 hover:bg-blue-500/10 transition-colors subtle-fade-in'
                        style={{ animationDelay: `${(index + 3) * 100}ms` }}
                      >
                        {getChannelIcon(channel)}
                        <span className='font-medium text-xs'>{channel}</span>
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
              className='animate-fade-in-up border border-primary/5 rounded-lg shadow-sm'
            >
              <div className='space-y-3'>
                {mockPreviousInteractions.map((interaction, index) => (
                  <div
                    key={index}
                    className='rounded-lg border border-muted/50 hover:border-primary/10 p-3.5 text-card-foreground shadow-sm hover:shadow transition-all duration-200 hover:bg-muted/5 subtle-fade-in'
                    style={{ animationDelay: `${index * 150}ms` }}
                  >
                    <div className='flex items-center justify-between mb-2'>
                      <div className='flex items-center gap-2'>
                        <div className='bg-muted/30 p-1.5 rounded-full'>
                          {getChannelIcon(interaction.channel)}
                        </div>
                        <span className='text-sm font-medium'>
                          {interaction.channel}
                        </span>
                      </div>
                      <time className='text-xs bg-muted/20 px-2 py-0.5 rounded-full text-muted-foreground'>
                        {interaction.date}
                      </time>
                    </div>
                    <p className='text-sm text-muted-foreground'>
                      {interaction.summary}
                    </p>

                    <div className='mt-3 flex justify-end'>
                      <div className='text-xs flex items-center gap-1 text-blue-500/80 hover:text-blue-500 cursor-pointer transition-colors'>
                        <span>View details</span>
                        <ChevronRight className='h-3.5 w-3.5' />
                      </div>
                    </div>
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
