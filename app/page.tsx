import React from 'react';
import dynamic from 'next/dynamic';
import TopNavBar from '@/components/TopNavBar';
import config from '@/config';

// Dynamically import all client components with SSR disabled
const LeftSidebar = dynamic(() => import('@/components/LeftSidebar'), {
  ssr: false,
});
const RightSidebar = dynamic(() => import('@/components/RightSidebar'), {
  ssr: false,
});
const ConvoSuggestCard = dynamic(
  () => import('@/components/ConvoSuggestCard'),
  {
    ssr: false,
  }
);
const ProcessTree = dynamic(() => import('@/components/ProcessTree'), {
  ssr: false,
});

export default function Home() {
  return (
    <div className='flex flex-col h-screen w-full bg-gradient-to-b from-background via-background to-muted/10'>
      <div className='absolute top-0 left-0 right-0 h-40 bg-gradient-to-b from-primary/5 to-transparent pointer-events-none'></div>

      <TopNavBar />

      <div className='flex flex-1 overflow-hidden h-[calc(100vh-4rem)] p-6 animate-fade-in'>
        {config.includeLeftSidebar && <LeftSidebar />}

        <main className='flex-1 min-w-0 mr-5 flex gap-5'>
          <div className='flex-1 shadow-xl rounded-xl overflow-hidden backdrop-blur-[2px]'>
            <ConvoSuggestCard />
          </div>

          <div className='w-[480px] shadow-xl rounded-xl overflow-hidden backdrop-blur-[2px]'>
            <ProcessTree />
          </div>
        </main>

        <div
          className='w-[400px] flex-shrink-0 xl:w-1/4 shadow-xl rounded-xl overflow-hidden backdrop-blur-[2px] animate-fade-in-up-fast'
          style={{ animationDelay: '100ms' }}
        >
          <RightSidebar />
        </div>
      </div>

      {/* Background decorative elements */}
      <div className='fixed inset-0 -z-10 pointer-events-none'>
        <div className='absolute top-[20%] right-[15%] w-[350px] h-[350px] bg-blue-500/5 rounded-full blur-[120px]'></div>
        <div className='absolute bottom-[10%] left-[10%] w-[250px] h-[250px] bg-blue-500/5 rounded-full blur-[100px]'></div>
      </div>
    </div>
  );
}
