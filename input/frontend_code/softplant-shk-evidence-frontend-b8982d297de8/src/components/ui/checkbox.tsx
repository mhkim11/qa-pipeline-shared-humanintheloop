import * as React from 'react';

import * as CheckboxPrimitive from '@radix-ui/react-checkbox';
import { FaCheck } from 'react-icons/fa';

import { cn } from '@/lib/utils';

const Checkbox = React.forwardRef<
  React.ElementRef<typeof CheckboxPrimitive.Root>,
  React.ComponentPropsWithoutRef<typeof CheckboxPrimitive.Root>
>(({ className, ...props }, ref) => (
  <CheckboxPrimitive.Root
    ref={ref}
    className={cn(
      'flex items-center justify-center',
      'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-teal-700 focus-visible:ring-offset-2',
      'disabled:cursor-not-allowed disabled:opacity-50',
      'data-[state=checked]:border-zinc-900 data-[state=checked]:bg-zinc-900 data-[state=checked]:text-zinc-900',
      'peer h-4 w-4 shrink-0 rounded-sm border border-primary ring-offset-background',
      className?.replace('indeterminate', ''),
    )}
    {...props}
  >
    <CheckboxPrimitive.Indicator className={cn('text-current')}>
      <FaCheck className={cn(className?.includes('indeterminate') ? 'text-zinc-300' : 'text-white', 'size-2.5')} />
    </CheckboxPrimitive.Indicator>
  </CheckboxPrimitive.Root>
));
Checkbox.displayName = CheckboxPrimitive.Root.displayName;

export { Checkbox };
