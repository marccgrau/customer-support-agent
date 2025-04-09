'use client';
import React from 'react';
import { ModeToggle } from './ModeToggle';
import { LifeBuoy, PanelRight, Settings, LayoutList, Bot } from 'lucide-react';
import { Button } from './ui/button';
import { Separator } from './ui/separator';

const TopNavBar: React.FC = () => {
  return (
    <div className='h-16 border-b border-blue-500/5 backdrop-blur-sm bg-background/80 flex justify-between items-center px-6 sticky top-0 z-50 shadow-sm'>
      <div className='flex items-center gap-2'>
        <div className='flex items-center gap-2 bg-blue-500/5 p-1.5 pr-4 rounded-lg border border-blue-500/10'>
          <div className='h-8 w-8 bg-blue-500/10 rounded-md flex items-center justify-center text-blue-600 shadow-inner'>
            <Bot className='h-5 w-5' />
          </div>
          <span className='font-semibold tracking-wide'>
            Customer Support Assistant
          </span>
        </div>

        <Separator orientation='vertical' className='h-8 mx-2 bg-blue-500/5' />

        <div className='hidden xl:flex'>
          <Button
            variant='ghost'
            size='sm'
            className='flex items-center gap-2 text-muted-foreground hover:text-foreground hover:bg-blue-500/5'
          >
            <LayoutList className='h-4 w-4' />
            <span>Dashboards</span>
          </Button>

          <Button
            variant='ghost'
            size='sm'
            className='flex items-center gap-2 text-muted-foreground hover:text-foreground hover:bg-blue-500/5'
          >
            <PanelRight className='h-4 w-4' />
            <span>Knowledge Base</span>
          </Button>
        </div>
      </div>

      <div className='flex items-center gap-2'>
        <div className='flex items-center gap-1 bg-muted/20 p-1 rounded-lg'>
          <Button
            variant='ghost'
            size='icon'
            className='rounded-md hover:bg-blue-500/5'
          >
            <LifeBuoy className='h-4 w-4 text-muted-foreground' />
          </Button>

          <Button
            variant='ghost'
            size='icon'
            className='rounded-md hover:bg-blue-500/5'
          >
            <Settings className='h-4 w-4 text-muted-foreground' />
          </Button>

          <ModeToggle />
        </div>
      </div>
    </div>
  );
};

export default TopNavBar;
