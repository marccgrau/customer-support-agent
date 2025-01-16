import React from 'react';
import dynamic from 'next/dynamic';
import TopNavBar from '@/components/TopNavBar';
import ChatArea from '@/components/ChatArea';
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
      <div className='flex flex-1 overflow-hidden h-screen w-full'>
        {config.includeLeftSidebar && <LeftSidebar />}
        <RealtimeAssistant />
        {/* <ChatArea /> */}
        {config.includeRightSidebar && <RightSidebar />}
      </div>
    </div>
  );
}
