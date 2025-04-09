// This component is no longer needed as its functionality has been moved directly to ConvoSuggestCard
// and ProcessTree components which are now rendered directly in the page layout
// This file can be kept for future reference if needed

'use client';

import React from 'react';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { BrainCircuit } from 'lucide-react';

const AzureRealtimeAssistant = () => {
  return (
    <div className='h-full'>
      <Card className='h-full flex flex-col card'>
        <CardHeader className='p-4 flex flex-row items-center justify-between card-header-gradient'>
          <CardTitle className='elegant-title'>Assistant</CardTitle>
        </CardHeader>

        <CardContent className='flex-1 p-4 overflow-auto flex items-center justify-center'>
          <div className='text-muted-foreground'>
            This component has been replaced by ConvoSuggestCard and ProcessTree
            components that are now directly rendered in the page layout.
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default AzureRealtimeAssistant;
