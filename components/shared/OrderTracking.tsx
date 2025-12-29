'use client'

import { CheckCircle2, Circle, Package, Truck, CheckCircle } from 'lucide-react'
import { cn } from '@/lib/utils'

interface OrderTrackingProps {
  status: string
}

const statusSteps = [
  { key: 'pending', label: 'Pending', icon: Circle },
  { key: 'processing', label: 'Processing', icon: Package },
  { key: 'shipped', label: 'Shipped', icon: Truck },
  { key: 'delivered', label: 'Delivered', icon: CheckCircle },
]

export function OrderTracking({ status }: OrderTrackingProps) {
  const currentStepIndex = statusSteps.findIndex((step) => step.key === status)

  return (
    <div className="w-full">
      <div className="flex items-center justify-between">
        {statusSteps.map((step, index) => {
          const StepIcon = step.icon
          const isCompleted = index <= currentStepIndex
          const isCurrent = index === currentStepIndex

          return (
            <div key={step.key} className="flex flex-col items-center flex-1">
              <div
                className={cn(
                  'flex items-center justify-center w-12 h-12 rounded-full border-2 transition-colors',
                  isCompleted
                    ? 'bg-primary text-primary-foreground border-primary'
                    : 'bg-background text-muted-foreground border-muted-foreground'
                )}
              >
                <StepIcon className="h-6 w-6" />
              </div>
              <p
                className={cn(
                  'mt-2 text-sm font-medium',
                  isCompleted ? 'text-foreground' : 'text-muted-foreground'
                )}
              >
                {step.label}
              </p>
            </div>
          )
        })}
      </div>
      <div className="mt-4 flex items-center">
        {statusSteps.map((step, index) => {
          const isCompleted = index < currentStepIndex
          return (
            <div
              key={`line-${step.key}`}
              className={cn(
                'h-1 flex-1',
                index < statusSteps.length - 1
                  ? isCompleted
                    ? 'bg-primary'
                    : 'bg-muted'
                  : ''
              )}
            />
          )
        })}
      </div>
    </div>
  )
}

