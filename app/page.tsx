import React from 'react';
import dynamic from 'next/dynamic';
import TopNavBar from '@/components/TopNavBar';
import ChatArea from '@/components/ChatArea';
import AzureRealtimeAssistant from '@/components/AzureRealtimeAssistant';
import RealtimeAssistant from '@/components/RealtimeAssistant';
import config from '@/config';

const LeftSidebar = dynamic(() => import('@/components/LeftSidebar'), {
  ssr: false,
});
const RightSidebar = dynamic(() => import('@/components/RightSidebar'), {
  ssr: false,
});

export default function Home() {
  return (
    <div className='flex flex-col h-screen w-full bg-gradient-to-b from-background to-muted/5'>
      <div className='absolute top-0 left-0 right-0 h-32 bg-gradient-to-b from-primary/5 to-transparent pointer-events-none'></div>
      <TopNavBar />
      <div className='flex flex-1 overflow-hidden h-[calc(100vh-4rem)] p-4 animate-fade-in'>
        {config.includeLeftSidebar && <LeftSidebar />}
        <main className='flex-1 min-w-0 mr-4 shadow-xl rounded-xl overflow-hidden'>
          <AzureRealtimeAssistant />
        </main>
        {/*<RealtimeAssistant />
        {/* <ChatArea /> */}
        <div
          className='w-[400px] flex-shrink-0 xl:w-1/4 shadow-xl rounded-xl overflow-hidden animate-fade-in-up-fast'
          style={{ animationDelay: '100ms' }}
        >
          <RightSidebar />
        </div>
      </div>
    </div>
  );
}
