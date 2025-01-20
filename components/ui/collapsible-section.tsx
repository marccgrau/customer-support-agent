// CollapsibleSection.tsx
'use client';

import React, { useState } from 'react';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { ChevronDown, ChevronUp } from 'lucide-react';

interface CollapsibleSectionProps {
  title: string;
  icon?: React.ReactNode;
  children: React.ReactNode;
  defaultExpanded?: boolean;
  headerExtra?: React.ReactNode;
  isNested?: boolean;
  className?: string;
}

const CollapsibleSection: React.FC<CollapsibleSectionProps> = ({
  title,
  icon,
  children,
  defaultExpanded = true,
  headerExtra,
  isNested = false,
  className = '',
}) => {
  const [isExpanded, setIsExpanded] = useState(defaultExpanded);

  const containerStyles = isNested
    ? 'border rounded-lg overflow-hidden bg-card'
    : 'overflow-hidden bg-card flex flex-col';

  const headerStyles = `
    ${isNested ? 'p-3' : 'p-4'} 
    flex flex-row items-center 
    justify-between 
    ${isNested ? 'bg-muted/30' : 'border-b'} 
    cursor-pointer 
    hover:bg-muted/5 
    transition-colors
    flex-shrink-0
    min-h-[56px]
  `;

  const contentStyles = `
    transition-all 
    duration-200 
    ease-in-out
    overflow-hidden
    ${isExpanded ? 'flex-1' : 'h-0'}
  `;

  const innerContentStyles = `
    ${isNested ? 'p-3' : 'p-4'}
    h-full
    overflow-y-auto
    ${isNested ? 'max-h-[60vh]' : ''} // Added max height for nested sections
  `;

  return (
    <div className={`${containerStyles} ${className}`}>
      <div className={headerStyles} onClick={() => setIsExpanded(!isExpanded)}>
        <div className='flex items-center gap-2'>
          {icon}
          <div className={`${isNested ? 'text-sm' : ''} font-medium`}>
            {title}
          </div>
        </div>
        <div className='flex items-center gap-2'>
          {headerExtra && (
            <div onClick={(e) => e.stopPropagation()}>{headerExtra}</div>
          )}
          {isExpanded ? (
            <ChevronUp className='h-4 w-4 text-muted-foreground' />
          ) : (
            <ChevronDown className='h-4 w-4 text-muted-foreground' />
          )}
        </div>
      </div>
      <div className={contentStyles}>
        {isExpanded && <div className={innerContentStyles}>{children}</div>}
      </div>
    </div>
  );
};

export default CollapsibleSection;
