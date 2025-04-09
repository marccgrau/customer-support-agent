'use client';

import React, { useState } from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';

interface CollapsibleSectionProps {
  title: string;
  children: React.ReactNode;
  isCollapsed: boolean;
  onToggle: () => void;
  expandedWidth: string;
}

const CollapsibleSection: React.FC<CollapsibleSectionProps> = ({
  title,
  children,
  isCollapsed,
  onToggle,
  expandedWidth,
}) => {
  return (
    <div
      className={`transition-all duration-300 ease-in-out overflow-hidden relative ${
        isCollapsed ? 'w-20' : expandedWidth
      }`}
    >
      {isCollapsed ? (
        <div className='h-full grid place-items-center px-1'>
          <Button
            variant='ghost'
            className={cn(
              'h-[250px] w-16 grid grid-rows-[1fr,auto] p-2 rounded-md',
              'border border-primary/30 hover:border-primary/60',
              'bg-gradient-to-b from-muted/20 to-muted/10 hover:shadow-md',
              'group transition-all duration-200'
            )}
            onClick={onToggle}
          >
            {/* Content container */}
            <div className='flex flex-col h-full w-full'>
              {/* Title container - using flex for centering */}
              <div className='flex-1 flex items-center justify-center relative'>
                <div className='absolute rotate-90 whitespace-nowrap origin-center'>
                  <span className='text-sm font-medium text-foreground/80 group-hover:text-foreground group-hover:font-semibold transition-all border-b-2 border-primary/0 group-hover:border-primary/40 pb-0.5'>
                    {title}
                  </span>
                </div>
              </div>

              {/* Chevron at bottom */}
              <div className='flex justify-center pb-2'>
                <div className='w-7 h-7 rounded-full bg-primary/10 flex items-center justify-center group-hover:bg-primary/20 transition-colors'>
                  <ChevronRight className='h-4 w-4 text-primary group-hover:text-primary group-hover:scale-110 transition-all' />
                </div>
              </div>
            </div>
          </Button>
        </div>
      ) : (
        <div className='h-full relative bg-background animate-fade-in-up'>
          <Button
            variant='outline'
            size='icon'
            className='absolute top-2 right-2 z-10 bg-background/80 backdrop-blur-sm border-primary/30 hover:border-primary/60 hover:shadow-md transition-all'
            onClick={onToggle}
          >
            <ChevronLeft className='h-4 w-4 text-primary' />
          </Button>
          <div className='h-full'>{children}</div>
        </div>
      )}
    </div>
  );
};

interface CollapsibleLayoutProps {
  conversationCard: React.ReactNode;
  processTree: React.ReactNode;
}

const CollapsibleLayout: React.FC<CollapsibleLayoutProps> = ({
  conversationCard,
  processTree,
}) => {
  const [collapsedSections, setCollapsedSections] = useState({
    conversation: false,
    processTree: false,
  });

  const toggleSection = (section: keyof typeof collapsedSections) => {
    setCollapsedSections((prev) => ({
      ...prev,
      [section]: !prev[section],
    }));
  };

  // Calculate expanded width based on number of expanded sections
  const expandedCount = Object.values(collapsedSections).filter(
    (v) => !v
  ).length;

  const getExpandedWidth = () => {
    return expandedCount === 1 ? 'w-full' : 'w-1/2';
  };

  return (
    <div className='flex gap-2 h-full'>
      <CollapsibleSection
        title='Conversation Monitor'
        isCollapsed={collapsedSections.conversation}
        onToggle={() => toggleSection('conversation')}
        expandedWidth={getExpandedWidth()}
      >
        {conversationCard}
      </CollapsibleSection>

      <CollapsibleSection
        title='Request Handling'
        isCollapsed={collapsedSections.processTree}
        onToggle={() => toggleSection('processTree')}
        expandedWidth={getExpandedWidth()}
      >
        {processTree}
      </CollapsibleSection>
    </div>
  );
};

export default CollapsibleLayout;
