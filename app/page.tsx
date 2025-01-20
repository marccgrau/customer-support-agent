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
    <div className='flex flex-col h-screen w-full'>
      <TopNavBar />
      <div className='flex flex-1 overflow-hidden h-[calc(100vh-4rem)] p-4'>
        {config.includeLeftSidebar && <LeftSidebar />}
        <main className='flex-1 min-w-0 mr-4'>
          <AzureRealtimeAssistant />
        </main>
        {/*<RealtimeAssistant />
        {/* <ChatArea /> */}
        <div className='w-[400px] flex-shrink-0 xl:w-1/4'>
          <RightSidebar />
        </div>
      </div>
    </div>
  );
}
