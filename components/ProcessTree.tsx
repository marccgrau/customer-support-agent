import React from 'react';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { HiOutlineCheckCircle } from 'react-icons/hi';
import { Network } from 'lucide-react';

const ProcessTree = () => {
  const processSteps = [
    {
      id: '1',
      title: 'Identify the Issue',
      description: 'Customer reports inability to access online banking',
      resolved: true,
    },
    {
      id: '2',
      title: 'Gather More Information',
      description: 'Ask about error messages and recent login attempts',
      resolved: true,
    },
    {
      id: '3',
      title: 'Check Account Activity',
      description: 'Review recent transactions and changes',
      resolved: false,
    },
    {
      id: '4',
      title: 'Verify Customer Identity',
      description: 'Perform security checks and authentication',
      resolved: false,
    },
    {
      id: '5',
      title: 'Resolve Access Issue',
      description: 'Reset password or restore account access',
      resolved: false,
    },
    {
      id: '6',
      title: 'Provide Additional Assistance',
      description: 'Offer guidance on preventing future issues',
      resolved: false,
    },
  ];

  // Separate resolved and unresolved steps
  const resolvedSteps = processSteps.filter((step) => step.resolved);
  const unresolvedSteps = processSteps.filter((step) => !step.resolved);
  const currentStep = unresolvedSteps[0];
  const remainingSteps = unresolvedSteps.slice(1);

  // Calculate stack height for resolved steps
  // Only show 8px of each card except the last one
  const stackHeight =
    resolvedSteps.length > 1
      ? (resolvedSteps.length - 1) * 8 + 80 // 80px for the last visible card
      : 80; // Single card height

  return (
    <Card className='h-full flex flex-col'>
      <CardHeader className='p-4 flex flex-row items-center justify-between border-b flex-shrink-0'>
        <div className='flex items-center gap-2'>
          <Network className='h-4 w-4 text-primary' />
          <CardTitle className='text-base'>Request Handling</CardTitle>
        </div>
      </CardHeader>

      <CardContent className='flex-1 p-4 overflow-y-auto'>
        <div className='space-y-6'>
          {/* Resolved Steps Stack */}
          {resolvedSteps.length > 0 && (
            <div style={{ height: stackHeight }} className='relative'>
              {resolvedSteps
                .slice()
                .reverse()
                .map((step, index) => (
                  <Card
                    key={step.id}
                    className={`absolute w-full bg-green-50 border-green-200 ${
                      index === 0 // Now index 0 is the most recent
                        ? 'bg-white' // Fully opaque white background for the most recent
                        : ''
                    }`}
                    style={{
                      top: `${index * 8}px`, // Show only 8px of each card except the last
                      zIndex: resolvedSteps.length - index,
                    }}
                  >
                    <CardContent className='p-3'>
                      <div className='flex items-start gap-4'>
                        <div className='w-6 h-6 rounded-full flex-shrink-0 flex items-center justify-center border-2 border-green-500 text-green-500'>
                          <HiOutlineCheckCircle />
                        </div>
                        <div className='flex-1'>
                          <div className='text-sm font-medium text-green-700'>
                            {step.title}
                          </div>
                          <div className='mt-1 text-sm text-green-600'>
                            {step.description}
                          </div>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
            </div>
          )}

          {/* Current Active Step */}
          {currentStep && (
            <Card className='border-2 border-primary bg-primary/5 shadow-md'>
              <CardContent className='p-4'>
                <div className='flex items-start gap-4'>
                  <div className='w-6 h-6 rounded-full flex-shrink-0 flex items-center justify-center border-2 border-primary text-primary font-semibold'>
                    {resolvedSteps.length + 1}
                  </div>
                  <div className='flex-1'>
                    <div className='text-sm font-medium text-primary'>
                      {currentStep.title}
                    </div>
                    <div className='mt-1 text-sm text-primary/80'>
                      {currentStep.description}
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          )}

          {/* Remaining Steps */}
          {remainingSteps.length > 0 && (
            <div className='space-y-4 opacity-60'>
              {remainingSteps.map((step, index) => (
                <Card key={step.id} className='border-gray-200'>
                  <CardContent className='p-4'>
                    <div className='flex items-start gap-4'>
                      <div className='w-6 h-6 rounded-full flex-shrink-0 flex items-center justify-center border-2 border-gray-300 text-gray-500'>
                        {resolvedSteps.length + index + 2}
                      </div>
                      <div className='flex-1'>
                        <div className='text-sm font-medium text-gray-600'>
                          {step.title}
                        </div>
                        <div className='mt-1 text-sm text-gray-500'>
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
