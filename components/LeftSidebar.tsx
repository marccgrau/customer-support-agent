// LeftSidebar.tsx

'use client';

import React, { useState, useEffect } from 'react';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import {
  User,
  DollarSign,
  Wrench,
  Zap,
  Building2,
  Scale,
  ChartBarBig,
  CircleHelp,
  FileIcon,
  MessageCircleIcon,
} from 'lucide-react';
import FullSourceModal from './FullSourceModal';

interface ThinkingContent {
  id: string;
  content: string;
  user_mood?: string;
  matched_categories?: string[];
  debug?: {
    context_used: boolean;
  };
}

// Interfaces for Knowledge Base History
interface RAGSource {
  id: string;
  fileName: string;
  snippet: string;
  score: number;
  timestamp?: string;
}

interface RAGHistoryItem {
  sources: RAGSource[];
  timestamp: string;
  query: string;
}

interface DebugInfo {
  context_used: boolean;
}

interface SidebarEvent {
  id: string;
  content: string;
  user_mood?: string;
  debug?: DebugInfo;
}

const truncateSnippet = (text: string): string => {
  return text?.length > 150 ? `${text.slice(0, 100)}...` : text || '';
};

const getScoreColor = (score: number): string => {
  if (score > 0.6) return 'bg-green-100 text-green-800';
  if (score > 0.4) return 'bg-yellow-100 text-yellow-800';
  return 'bg-red-100 text-red-800';
};

const getDebugPillColor = (value: boolean): string => {
  return value
    ? 'bg-green-100 text-green-800 border-green-300' // Success
    : 'bg-yellow-100 text-yellow-800 border-yellow-300'; // Not Used/Not Relevant
};

const getMoodColor = (mood: string): string => {
  const colors: { [key: string]: string } = {
    positive: 'bg-green-100 text-green-800',
    negative: 'bg-red-100 text-red-800',
    curious: 'bg-blue-100 text-blue-800',
    frustrated: 'bg-orange-100 text-orange-800',
    confused: 'bg-yellow-100 text-yellow-800',
    neutral: 'bg-gray-100 text-gray-800',
  };
  return colors[mood?.toLowerCase()] || 'bg-gray-100 text-gray-800';
};

const MAX_THINKING_HISTORY = 15;
const MAX_HISTORY = 15;

// Animation classes and styles
const fadeInUpClass = 'animate-fade-in-up';
const fadeStyle = {
  animationDuration: '600ms',
  animationFillMode: 'backwards',
  animationTimingFunction: 'cubic-bezier(0.2, 0.8, 0.2, 1)',
};

const LeftSidebar: React.FC = () => {
  const [thinkingContents, setThinkingContents] = useState<ThinkingContent[]>(
    []
  );

  // State for Knowledge Base History
  const [ragHistory, setRagHistory] = useState<RAGHistoryItem[]>([]);
  const [shouldShowSources, setShouldShowSources] = useState(false);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedSource, setSelectedSource] = useState<RAGSource | null>(null);

  useEffect(() => {
    const handleUpdateSidebar = (event: CustomEvent<ThinkingContent>) => {
      if (event.detail && event.detail.id) {
        console.log('🔍 DEBUG: Sidebar Event:', event.detail);
        setThinkingContents((prev) => {
          const exists = prev.some((item) => item.id === event.detail.id);
          if (!exists) {
            console.log(
              '📝 New thinking entry: ',
              event.detail.content.slice(0, 50) + '...'
            );

            const enhancedEntry = {
              ...event.detail,
              timestamp: new Date().toISOString(),
            };

            const newHistory = [enhancedEntry, ...prev].slice(
              0,
              MAX_THINKING_HISTORY
            );

            return newHistory;
          }
          return prev;
        });
      } else {
        console.warn("Missing 'id' in sidebar event detail:", event.detail);
      }
    };

    window.addEventListener(
      'updateSidebar',
      handleUpdateSidebar as EventListener
    );
    return () =>
      window.removeEventListener(
        'updateSidebar',
        handleUpdateSidebar as EventListener
      );
  }, []);

  // Effect for Knowledge Base History
  useEffect(() => {
    const updateRAGSources = (
      event: CustomEvent<{
        sources: RAGSource[];
        query: string;
        debug?: DebugInfo;
      }>
    ) => {
      console.log('🔍 RAG event received:', event.detail);
      const { sources, query, debug } = event.detail;

      const shouldDisplaySources = debug?.context_used;

      if (
        Array.isArray(sources) &&
        sources.length > 0 &&
        shouldDisplaySources
      ) {
        const cleanedSources = sources.map((source) => ({
          ...source,
          snippet: source.snippet || 'No preview available',
          fileName:
            (source.fileName || '').replace(/_/g, ' ').replace('.txt', '') ||
            'Unnamed',
          timestamp: new Date().toISOString(),
        }));

        const historyItem: RAGHistoryItem = {
          sources: cleanedSources,
          timestamp: new Date().toISOString(),
          query: query || 'Unknown query',
        };

        setRagHistory((prev) => {
          const newHistory = [historyItem, ...prev];
          return newHistory.slice(0, MAX_HISTORY);
        });

        console.log(
          '🔍 Sources displayed:',
          shouldDisplaySources ? 'YES' : 'NO'
        );
      }
    };

    const updateDebug = (event: CustomEvent<SidebarEvent>) => {
      const debug = event.detail.debug;
      const shouldShow = debug?.context_used ?? false;
      setShouldShowSources(shouldShow);
    };

    window.addEventListener(
      'updateRagSources' as any,
      updateRAGSources as EventListener
    );
    window.addEventListener(
      'updateSidebar' as any,
      updateDebug as EventListener
    );

    return () => {
      window.removeEventListener(
        'updateRagSources' as any,
        updateRAGSources as EventListener
      );
      window.removeEventListener(
        'updateSidebar' as any,
        updateDebug as EventListener
      );
    };
  }, []);

  const handleViewFullSource = (source: RAGSource) => {
    setSelectedSource(source);
    setIsModalOpen(true);
  };

  return (
    <aside className='w-[20%] pl-4 overflow-hidden pb-4 h-full'>
      <div className='flex flex-col h-full'>
        {/* Knowledge Base History Section */}
        <Card
          className={`${fadeInUpClass} overflow-hidden flex-grow`}
          style={fadeStyle}
        >
          <CardHeader>
            <CardTitle className='text-sm font-medium leading-none'>
              Knowledge Base History
            </CardTitle>
          </CardHeader>
          <CardContent className='overflow-y-auto h-full'>
            {ragHistory.length === 0 && (
              <div className='text-sm text-muted-foreground'>
                The assistant will display sources here once finding them
              </div>
            )}
            {ragHistory.map((historyItem, index) => (
              <div
                key={historyItem.timestamp}
                className={`mb-6 ${fadeInUpClass}`}
                style={{ ...fadeStyle, animationDelay: `${index * 50}ms` }}
              >
                <div className='flex items-center text-xs text-muted-foreground mb-2 gap-1'>
                  <MessageCircleIcon
                    size={14}
                    className='text-muted-foreground'
                  />
                  <span>{historyItem.query}</span>
                </div>
                {historyItem.sources.map((source, sourceIndex) => (
                  <Card
                    key={source.id}
                    className={`mb-2 ${fadeInUpClass}`}
                    style={{
                      ...fadeStyle,
                      animationDelay: `${index * 100 + sourceIndex * 75}ms`,
                    }}
                  >
                    <CardContent className='py-4'>
                      <p className='text-sm text-muted-foreground'>
                        {truncateSnippet(source.snippet)}
                      </p>
                      <div className='flex flex-col gap-2'>
                        <div
                          className={`${getScoreColor(
                            source.score
                          )} px-2 py-1 mt-4 rounded-full text-xs inline-block w-fit`}
                        >
                          {(source.score * 100).toFixed(0)}% match
                        </div>
                        <div
                          className='inline-flex items-center mr-2 mt-2 text-muted-foreground text-xs py-0 cursor-pointer hover:text-gray-600'
                          onClick={() => handleViewFullSource(source)}
                        >
                          <FileIcon className='w-4 h-4 min-w-[12px] min-h-[12px] mr-2' />
                          <span className='text-xs underline'>
                            {truncateSnippet(source.fileName || 'Unnamed')}
                          </span>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            ))}
          </CardContent>
        </Card>

        {/* Assistant Thinking Section */}
        <Card
          className={`${fadeInUpClass} overflow-hidden mt-4 flex-grow flex flex-col`}
          style={fadeStyle}
        >
          <CardHeader>
            <CardTitle className='text-sm font-medium leading-none'>
              Assistant Thinking
            </CardTitle>
          </CardHeader>
          <CardContent className='overflow-y-auto flex-grow'>
            {thinkingContents.length === 0 ? (
              <div className='text-sm text-muted-foreground'>
                The assistant inner dialogue will appear here for you to debug
                it
              </div>
            ) : (
              thinkingContents.map((content, index) => (
                <Card
                  key={content.id}
                  className={`mb-4 ${fadeInUpClass}`}
                  style={{
                    ...fadeStyle,
                    animationDelay: `${index * 50}ms`,
                  }}
                >
                  <CardContent className='py-4'>
                    <div className='text-sm text-muted-foreground'>
                      {content.content}
                    </div>
                    {content.user_mood && content.debug && (
                      <div className='flex items-center space-x-2 mt-4 text-xs'>
                        {/* Mood */}
                        <span
                          className={`px-2 py-1 rounded-full ${getMoodColor(
                            content.user_mood
                          )}`}
                        >
                          {content.user_mood.charAt(0).toUpperCase() +
                            content.user_mood.slice(1)}
                        </span>

                        <span
                          className={`px-2 py-1 rounded-full ${getDebugPillColor(
                            content.debug.context_used
                          )}`}
                        >
                          Context: {content.debug.context_used ? '✅' : '❌'}
                        </span>
                      </div>
                    )}
                    {content.matched_categories &&
                      content.matched_categories.length > 0 && (
                        <div className='mt-2'>
                          {content.matched_categories.map((category) => (
                            <div
                              key={category}
                              className='inline-flex items-center mr-2 mt-2 text-muted-foreground text-xs py-0'
                            >
                              {/* Category Icons */}
                              {category === 'account' && (
                                <User className='w-3 h-3 mr-1' />
                              )}
                              {category === 'billing' && (
                                <DollarSign className='w-3 h-3 mr-1' />
                              )}
                              {category === 'feature' && (
                                <Zap className='w-3 h-3 mr-1' />
                              )}
                              {category === 'internal' && (
                                <Building2 className='w-3 h-3 mr-1' />
                              )}
                              {category === 'legal' && (
                                <Scale className='w-3 h-3 mr-1' />
                              )}
                              {category === 'other' && (
                                <CircleHelp className='w-3 h-3 mr-1' />
                              )}
                              {category === 'technical' && (
                                <Wrench className='w-3 h-3 mr-1' />
                              )}
                              {category === 'usage' && (
                                <ChartBarBig className='w-3 h-3 mr-1' />
                              )}
                              {category
                                .split('_')
                                .map(
                                  (word) =>
                                    word.charAt(0).toUpperCase() + word.slice(1)
                                )
                                .join(' ')}
                            </div>
                          ))}
                        </div>
                      )}
                  </CardContent>
                </Card>
              ))
            )}
          </CardContent>
        </Card>
      </div>

      {/* Full Source Modal */}
      <FullSourceModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        source={selectedSource}
      />
    </aside>
  );
};

export default LeftSidebar;
