import React from 'react';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { HiOutlineCheckCircle } from 'react-icons/hi';
import { Network } from 'lucide-react';

const ProcessTree: React.FC = () => {
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

  return (
    <Card className='h-full flex flex-col'>
      <CardHeader className='p-4 flex flex-row items-center justify-between border-b flex-shrink-0'>
        <div className='flex items-center gap-2'>
          <Network className='h-4 w-4 text-primary' />
          <CardTitle className='text-base'>Request Handling</CardTitle>
        </div>
      </CardHeader>

      <CardContent className='flex-1 p-4 overflow-y-auto'>
        <div className='space-y-4'>
          {processSteps.map((step, index) => (
            <Card key={step.id} className='relative'>
              <CardContent className='p-4'>
                <div className='flex items-start gap-4'>
                  <div
                    className={`w-6 h-6 rounded-full flex-shrink-0 flex items-center justify-center border-2 ${
                      step.resolved
                        ? 'border-green-500 text-green-500'
                        : 'border-gray-300 text-gray-500'
                    }`}
                  >
                    {step.resolved ? <HiOutlineCheckCircle /> : index + 1}
                  </div>
                  <div className='flex-1'>
                    <div className='text-sm font-medium'>{step.title}</div>
                    <div className='mt-1 text-sm text-muted-foreground'>
                      {step.description}
                    </div>
                  </div>
                </div>
              </CardContent>

              {index < processSteps.length - 1 && (
                <div className='absolute top-12 left-5 bottom-0 w-0.5 bg-gray-200'></div>
              )}
            </Card>
          ))}
        </div>
      </CardContent>
    </Card>
  );
};

export default ProcessTree;
