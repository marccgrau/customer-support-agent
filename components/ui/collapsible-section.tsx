// CollapsibleSection.tsx
'use client';

import React, { useState } from 'react';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { ChevronDown, ChevronUp } from 'lucide-react';

interface CollapsibleSectionProps {
  title: string;
  icon: React.ReactNode;
  children: React.ReactNode;
  defaultExpanded?: boolean;
}

const CollapsibleSection: React.FC<CollapsibleSectionProps> = ({
  title,
  icon,
  children,
  defaultExpanded = true,
}) => {
  const [isExpanded, setIsExpanded] = useState(defaultExpanded);

  return (
    <Card className='overflow-hidden'>
      <CardHeader
        onClick={() => setIsExpanded(!isExpanded)}
        className='p-4 flex flex-row items-center justify-between border-b cursor-pointer hover:bg-muted/5 transition-colors'
      >
        <div className='flex items-center gap-2'>
          {icon}
          <CardTitle className='text-sm font-medium'>{title}</CardTitle>
        </div>
        {isExpanded ? (
          <ChevronUp className='h-4 w-4 text-muted-foreground' />
        ) : (
          <ChevronDown className='h-4 w-4 text-muted-foreground' />
        )}
      </CardHeader>
      <div
        className={`transition-all duration-200 ease-in-out ${
          isExpanded ? 'opacity-100' : 'opacity-0 h-0 overflow-hidden'
        }`}
      >
        {isExpanded && <CardContent className='p-4'>{children}</CardContent>}
      </div>
    </Card>
  );
};

export default CollapsibleSection;
