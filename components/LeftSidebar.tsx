'use client';

import React, { useState, useEffect } from 'react';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import ProcessTree from './ProcessTree';
import {
  Users,
  Building2,
  Network,
  FileIcon,
  MessageCircleIcon,
  Landmark,
  CreditCard,
  Wallet,
  User,
  CircleUser,
  CircleDot,
  ArrowUpRight,
  ShieldCheck,
  ChevronDown,
  ChevronUp,
} from 'lucide-react';
import CollapsibleSection from './ui/collapsible-section';

// Type definitions
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

// Mock data for network visualization
const accountStructure = {
  primaryAccount: {
    type: 'Premium Checking Account',
    number: '**** 1234',
    balance: '$25,430.50',
    status: 'Active',
    lastTransaction: '2024-01-19',
    protectionLevel: 'Enhanced',
  },
  linkedAccounts: [
    {
      type: 'High-Yield Savings',
      number: '**** 5678',
      balance: '$50,200.75',
      status: 'Active',
      lastTransaction: '2024-01-15',
      interestRate: '3.5% APY',
    },
    {
      type: 'Platinum Credit Card',
      number: '**** 9012',
      balance: '$2,450.00',
      status: 'Active',
      lastTransaction: '2024-01-18',
      availableCredit: '$17,550.00',
    },
  ],
};

const companyContacts = [
  {
    name: 'Sarah Wilson',
    role: 'Personal Banker',
    department: 'Retail Banking',
    lastContact: '2024-01-15',
    availability: 'Available',
    rating: 4.9,
  },
  {
    name: 'Michael Chen',
    role: 'Investment Advisor',
    department: 'Wealth Management',
    lastContact: '2024-01-10',
    availability: 'In Meeting',
    rating: 4.8,
  },
  {
    name: 'Jessica Thompson',
    role: 'Credit Specialist',
    department: 'Credit Services',
    lastContact: '2023-12-28',
    availability: 'Available',
    rating: 4.7,
  },
];

// Helper functions
const truncateSnippet = (text: string): string => {
  return text?.length > 150 ? `${text.slice(0, 100)}...` : text || '';
};

const getScoreColor = (score: number): string => {
  if (score > 0.8) return 'bg-green-100 text-green-800';
  if (score > 0.6) return 'bg-emerald-100 text-emerald-800';
  if (score > 0.4) return 'bg-yellow-100 text-yellow-800';
  return 'bg-red-100 text-red-800';
};

const getAvailabilityColor = (status: string): string => {
  switch (status.toLowerCase()) {
    case 'available':
      return 'text-green-500';
    case 'in meeting':
      return 'text-yellow-500';
    case 'away':
      return 'text-gray-500';
    default:
      return 'text-gray-400';
  }
};

const formatCurrency = (amount: string): string => {
  return amount.startsWith('-')
    ? `−${amount.slice(1)}` // Use minus sign for negative amounts
    : amount;
};

const formatDate = (date: string): string => {
  return new Date(date).toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  });
};

const LeftSidebar: React.FC = () => {
  const [ragHistory, setRagHistory] = useState<RAGHistoryItem[]>([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedSource, setSelectedSource] = useState<RAGSource | null>(null);

  // Effect for Knowledge Base History
  useEffect(() => {
    const updateRAGSources = (
      event: CustomEvent<{
        sources: RAGSource[];
        query: string;
        debug?: { context_used: boolean };
      }>
    ) => {
      const { sources, query, debug } = event.detail;
      if (Array.isArray(sources) && sources.length > 0 && debug?.context_used) {
        const historyItem: RAGHistoryItem = {
          sources: sources.map((source) => ({
            ...source,
            snippet: source.snippet || 'No preview available',
            fileName:
              (source.fileName || '').replace(/_/g, ' ').replace('.txt', '') ||
              'Unnamed',
            timestamp: new Date().toISOString(),
          })),
          timestamp: new Date().toISOString(),
          query: query || 'Unknown query',
        };

        setRagHistory((prev) => [historyItem, ...prev].slice(0, 15));
      }
    };

    window.addEventListener(
      'updateRagSources' as any,
      updateRAGSources as EventListener
    );
    return () => {
      window.removeEventListener(
        'updateRagSources' as any,
        updateRAGSources as EventListener
      );
    };
  }, []);

  return (
    <aside className='w-[400px] pl-4 pb-4 flex flex-col h-full'>
      <div className='flex flex-col gap-4'>
        {/* Support Process */}
        <ProcessTree />

        {/* Account Network Structure */}
        <CollapsibleSection
          title='Account Network'
          icon={<Network className='h-4 w-4' />}
          defaultExpanded={true}
        >
          {/* Primary Account */}
          <div className='mb-6'>
            <div className='flex items-center gap-3 mb-3'>
              <Landmark className='h-5 w-5 text-primary' />
              <span className='text-sm font-medium'>Primary Account</span>
            </div>
            <Card className='bg-primary/5 border-primary/10'>
              <CardContent className='p-4'>
                <div className='flex justify-between items-start mb-3'>
                  <div>
                    <div className='font-medium'>
                      {accountStructure.primaryAccount.type}
                    </div>
                    <div className='text-sm text-muted-foreground mt-1'>
                      {accountStructure.primaryAccount.number}
                    </div>
                  </div>
                  <div className='bg-primary/10 px-2 py-1 rounded-full text-xs font-medium'>
                    {accountStructure.primaryAccount.status}
                  </div>
                </div>
                <div className='flex justify-between items-center mt-4'>
                  <div className='text-lg font-semibold'>
                    {accountStructure.primaryAccount.balance}
                  </div>
                  <div className='flex items-center gap-1 text-xs text-muted-foreground'>
                    <ShieldCheck className='h-3 w-3' />
                    {accountStructure.primaryAccount.protectionLevel}
                  </div>
                </div>
                <div className='text-xs text-muted-foreground mt-2'>
                  Last transaction:{' '}
                  {accountStructure.primaryAccount.lastTransaction}
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Linked Accounts */}
          <div className='space-y-3'>
            <div className='flex items-center gap-2'>
              <Wallet className='h-4 w-4 text-muted-foreground' />
              <span className='text-sm font-medium'>Linked Accounts</span>
            </div>
            {accountStructure.linkedAccounts.map((account, index) => (
              <Card
                key={index}
                className='border border-dashed hover:border-solid transition-all'
              >
                <CardContent className='p-4'>
                  <div className='flex justify-between items-start mb-3'>
                    <div>
                      <div className='font-medium'>{account.type}</div>
                      <div className='text-sm text-muted-foreground mt-1'>
                        {account.number}
                      </div>
                    </div>
                    <div className='bg-muted px-2 py-1 rounded-full text-xs'>
                      {account.status}
                    </div>
                  </div>
                  <div className='flex justify-between items-center mt-4'>
                    <div className='text-lg font-semibold'>
                      {account.balance}
                    </div>
                    {'interestRate' in account && (
                      <div className='text-xs text-emerald-600 font-medium'>
                        {account.interestRate}
                      </div>
                    )}
                    {'availableCredit' in account && (
                      <div className='text-xs text-muted-foreground'>
                        Available: {account.availableCredit}
                      </div>
                    )}
                  </div>
                  <div className='text-xs text-muted-foreground mt-2'>
                    Last transaction: {account.lastTransaction}
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </CollapsibleSection>
        {/* Support Network 
        <CollapsibleSection
          title='Support Network'
          icon={<Users className='h-4 w-4' />}
          defaultExpanded={true}
        >
          <div className='space-y-4'>
            {companyContacts.map((contact, index) => (
              <Card
                key={index}
                className='overflow-hidden hover:bg-muted/5 transition-colors'
              >
                <CardContent className='p-3'>
                  <div className='flex items-center gap-3'>
                    <Avatar className='h-10 w-10'>
                      <AvatarFallback className='bg-primary/10 text-sm'>
                        {contact.name
                          .split(' ')
                          .map((n) => n[0])
                          .join('')}
                      </AvatarFallback>
                    </Avatar>
                    <div className='flex-1'>
                      <div className='flex items-center justify-between'>
                        <div className='flex items-center gap-2'>
                          <span className='font-medium'>{contact.name}</span>
                          <CircleDot
                            className={`h-3 w-3 ${getAvailabilityColor(
                              contact.availability
                            )}`}
                          />
                        </div>
                        <span className='text-xs bg-yellow-100 text-yellow-800 px-2 py-1 rounded-full'>
                          ★ {contact.rating}
                        </span>
                      </div>
                      <div className='text-sm text-muted-foreground mt-1'>
                        {contact.role}
                      </div>
                      <div className='flex items-center justify-between mt-2'>
                        <span className='text-xs text-muted-foreground'>
                          {contact.department}
                        </span>
                        <div className='text-xs flex items-center gap-1 text-primary'>
                          <span>Contact</span>
                          <ArrowUpRight className='h-3 w-3' />
                        </div>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </CollapsibleSection>
        */}

        {/* Knowledge Base History */}
        <CollapsibleSection
          title='Knowledge Base History'
          icon={<FileIcon className='h-4 w-4' />}
          defaultExpanded={false}
        >
          {ragHistory.length === 0 ? (
            <div className='text-sm text-muted-foreground'>
              The assistant will display relevant sources here
            </div>
          ) : (
            <div className='space-y-6'>
              {ragHistory.map((historyItem) => (
                <div key={historyItem.timestamp}>
                  <div className='flex items-center gap-2 mb-2'>
                    <MessageCircleIcon className='h-4 w-4 text-muted-foreground' />
                    <span className='text-sm text-muted-foreground'>
                      {historyItem.query}
                    </span>
                  </div>
                  {historyItem.sources.map((source) => (
                    <Card
                      key={source.id}
                      className='mb-2 hover:bg-muted/5 transition-colors'
                    >
                      <CardContent className='p-3'>
                        <p className='text-sm text-muted-foreground'>
                          {truncateSnippet(source.snippet)}
                        </p>
                        <div className='flex items-center justify-between mt-3'>
                          <div className='flex items-center gap-2'>
                            <FileIcon className='h-4 w-4 text-muted-foreground' />
                            <span className='text-xs text-muted-foreground'>
                              {source.fileName}
                            </span>
                          </div>
                          <span
                            className={`px-2 py-1 rounded-full text-xs ${getScoreColor(
                              source.score
                            )}`}
                          >
                            {(source.score * 100).toFixed(0)}% match
                          </span>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              ))}
            </div>
          )}
        </CollapsibleSection>
      </div>
    </aside>
  );
};

export default LeftSidebar;
