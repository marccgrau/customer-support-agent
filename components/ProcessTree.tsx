'use client';

import React from 'react';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { HiOutlineCheckCircle, HiChevronRight } from 'react-icons/hi';
import { Network, ChevronRight } from 'lucide-react';

const ProcessTree = () => {
  const processSteps = [
    {
      id: '1',
      title: 'Identify the Issue',
      description: 'Customer reports inability to access online banking',
      resolved: true,
      substeps: [
        { id: '1.1', title: 'Record initial complaint', resolved: true },
        { id: '1.2', title: 'Classify issue type', resolved: true },
        { id: '1.3', title: 'Note affected services', resolved: true },
      ],
    },
    {
      id: '2',
      title: 'Gather More Information',
      description: 'Ask about error messages and recent login attempts',
      resolved: true,
      substeps: [
        { id: '2.1', title: 'Check error messages', resolved: true },
        { id: '2.2', title: 'Verify last successful login', resolved: true },
        { id: '2.3', title: 'Document login attempt history', resolved: true },
      ],
    },
    {
      id: '3',
      title: 'Verify Customer Identity',
      description: 'Perform security checks and authentication',
      resolved: false,
      substeps: [
        { id: '3.1', title: 'Request security information', resolved: false },
        { id: '3.2', title: 'Verify personal details', resolved: false },
        { id: '3.3', title: 'Confirm account ownership', resolved: false },
        { id: '3.4', title: 'Document verification process', resolved: false },
      ],
    },
    {
      id: '4',
      title: 'Check Account Activity',
      description: 'Review recent transactions and changes',
      resolved: false,
      substeps: [
        { id: '4.1', title: 'Review recent transactions', resolved: false },
        { id: '4.2', title: 'Check account settings changes', resolved: false },
        { id: '4.3', title: 'Verify device history', resolved: false },
      ],
    },
    {
      id: '5',
      title: 'Resolve Access Issue',
      description: 'Reset password or restore account access',
      resolved: false,
      substeps: [
        { id: '5.1', title: 'Initiate password reset', resolved: false },
        { id: '5.2', title: 'Verify new credentials', resolved: false },
        { id: '5.3', title: 'Test account access', resolved: false },
      ],
    },
    {
      id: '6',
      title: 'Provide Additional Assistance',
      description: 'Offer guidance on preventing future issues',
      resolved: false,
      substeps: [
        {
          id: '6.1',
          title: 'Explain security best practices',
          resolved: false,
        },
        { id: '6.2', title: 'Provide resource links', resolved: false },
        { id: '6.3', title: 'Schedule follow-up if needed', resolved: false },
      ],
    },
  ];

  // Separate resolved and unresolved steps
  const resolvedSteps = processSteps.filter((step) => step.resolved);
  const unresolvedSteps = processSteps.filter((step) => !step.resolved);
  const currentStep = unresolvedSteps[0];
  const remainingSteps = unresolvedSteps.slice(1);

  // Calculate stack height for resolved steps
  const stackHeight =
    resolvedSteps.length > 1
      ? (resolvedSteps.length - 1) * 8 + 80 // 80px for the last visible card
      : 80; // Single card height

  return (
    <Card className='h-full flex flex-col card priority-card'>
      <CardHeader className='flex flex-row items-center justify-between card-header-gradient py-5 px-6'>
        <CardTitle className='elegant-title'>Process</CardTitle>
      </CardHeader>

      <CardContent className='flex-1 p-5 overflow-y-auto'>
        <div className='space-y-6'>
          {/* Resolved Steps Stack */}
          {resolvedSteps.length > 0 && (
            <div
              style={{ height: stackHeight }}
              className='relative subtle-fade-in'
            >
              {resolvedSteps
                .slice()
                .reverse()
                .map((step, index) => (
                  <Card
                    key={step.id}
                    className={`absolute w-full bg-gradient-to-r from-blue-50 to-blue-50/50 border border-blue-100 shadow-sm ${
                      index === 0 ? 'bg-white' : ''
                    } transition-all duration-300 ease-in-out hover:-translate-y-1 hover:shadow-md process-step rounded-md`}
                    style={{
                      top: `${index * 8}px`,
                      zIndex: resolvedSteps.length - index,
                    }}
                  >
                    <CardContent className='p-3'>
                      <div className='flex items-start gap-3'>
                        <div className='step-indicator step-indicator-completed'>
                          <HiOutlineCheckCircle className='h-4 w-4' />
                        </div>
                        <div className='flex-1'>
                          <div className='text-sm font-medium text-blue-700'>
                            {step.title}
                          </div>
                          <div className='mt-1 text-xs text-blue-600/80'>
                            {step.description}
                          </div>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
            </div>
          )}

          {/* Current Active Step with Substeps */}
          {currentStep && (
            <Card className='process-card animate-fade-in-up overflow-hidden border border-primary/10'>
              <div className='process-card-header'>
                <div className='flex items-center gap-3'>
                  <div className='step-indicator step-indicator-current'>
                    {resolvedSteps.length + 1}
                  </div>
                  <div className='text-sm font-semibold text-foreground'>
                    {currentStep.title}
                  </div>
                </div>
                <div className='ml-10 mt-1 text-sm text-muted-foreground'>
                  {currentStep.description}
                </div>
              </div>

              {/* Substeps */}
              <div className='p-3 space-y-1'>
                {currentStep.substeps.map((substep, index) => (
                  <div
                    key={substep.id}
                    className={`process-substep ${
                      index === 0 ? 'process-substep-active' : ''
                    } animate-fade-in`}
                    style={{ animationDelay: `${index * 100}ms` }}
                  >
                    <div className='flex items-center gap-2'>
                      {index === 0 && (
                        <div className='h-1.5 w-1.5 rounded-full bg-primary/70'></div>
                      )}
                      <span
                        className={
                          index === 0
                            ? 'text-primary font-medium'
                            : 'text-muted-foreground'
                        }
                      >
                        {substep.title}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </Card>
          )}

          {/* Remaining Steps */}
          {remainingSteps.length > 0 && (
            <div className='space-y-3 opacity-80'>
              {remainingSteps.map((step, index) => (
                <Card
                  key={step.id}
                  className='border border-muted/50 shadow-sm hover:shadow transition-all duration-300 ease-in-out hover:bg-muted/5 process-step rounded-md'
                >
                  <CardContent className='p-3.5'>
                    <div className='flex items-start gap-3'>
                      <div className='step-indicator step-indicator-pending'>
                        {resolvedSteps.length + index + 2}
                      </div>
                      <div className='flex-1'>
                        <div className='text-sm font-medium text-gray-600 flex items-center'>
                          {step.title}
                          <ChevronRight className='h-3.5 w-3.5 ml-1 text-muted-foreground/50' />
                        </div>
                        <div className='mt-1 text-xs text-gray-500/80'>
                          {step.description}
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
};

export default ProcessTree;
