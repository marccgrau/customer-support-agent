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
    ? 'border rounded-lg overflow-hidden bg-card/95 backdrop-blur-[1px]'
    : 'overflow-hidden bg-card/95 backdrop-blur-[1px] flex flex-col';

  const headerStyles = `
    ${isNested ? 'p-3' : 'p-3.5'} 
    flex flex-row items-center 
    justify-between 
    ${
      isNested
        ? 'bg-muted/20 border-b border-muted/30'
        : 'border-b border-muted/30'
    } 
    cursor-pointer 
    hover:bg-muted/10 
    transition-all duration-200
    flex-shrink-0
    min-h-[56px]
  `;

  const contentStyles = `
    transition-all 
    duration-300 
    ease-in-out
    overflow-hidden
    ${isExpanded ? 'max-h-[1000px] opacity-100' : 'max-h-0 opacity-0'}
  `;

  const innerContentStyles = `
    ${isNested ? 'p-3.5' : 'p-4'}
    h-full
    overflow-y-auto
    ${isNested ? 'max-h-[60vh]' : ''} // Added max height for nested sections
  `;

  return (
    <div className={`${containerStyles} ${className}`}>
      <div className={headerStyles} onClick={() => setIsExpanded(!isExpanded)}>
        <div className='flex items-center gap-2.5'>
          {icon && (
            <div className='flex-shrink-0 w-6 h-6 flex items-center justify-center bg-blue-500/10 rounded-md text-blue-600 shadow-inner'>
              {icon}
            </div>
          )}
          <div
            className={`${
              isNested
                ? 'text-sm'
                : 'text-sm font-medium tracking-wide uppercase'
            }`}
          >
            {title}
          </div>
        </div>
        <div className='flex items-center gap-2'>
          {headerExtra && (
            <div onClick={(e) => e.stopPropagation()}>{headerExtra}</div>
          )}
          <div className='bg-muted/20 hover:bg-muted/30 transition-colors duration-200 rounded-full w-6 h-6 flex items-center justify-center text-primary'>
            {isExpanded ? (
              <ChevronUp className='h-4 w-4' />
            ) : (
              <ChevronDown className='h-4 w-4' />
            )}
          </div>
        </div>
      </div>
      <div className={contentStyles}>
        {isExpanded && <div className={innerContentStyles}>{children}</div>}
      </div>
    </div>
  );
};

export default CollapsibleSection;
