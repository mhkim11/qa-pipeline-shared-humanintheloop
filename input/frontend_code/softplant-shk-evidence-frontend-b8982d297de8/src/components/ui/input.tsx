import * as React from 'react';

import { cva, type VariantProps } from 'class-variance-authority';

import { cn } from '@/lib/utils';

const inputVariants = cva(
  cn(
    'focus:border-0 focus:outline-none focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#0050B3]',
    'file:border-0 file:bg-transparent file:text-sm file:pretendard-medium',
    'placeholder:text-[#BABABA]',
    'disabled:cursor-not-allowed disabled:opacity-50',
    'flex h-10 w-[98%] rounded-md border-0 bg-transparent px-3 py-1 text-sm shadow-sm ring-1 ring-neutral-300 transition-colors',
  ),
  {
    variants: {
      variant: {
        error: 'ring-destructive focus:!ring-destructive',
      },
    },
  },
);

export interface IInputProps extends React.InputHTMLAttributes<HTMLInputElement>, VariantProps<typeof inputVariants> {}

const Input = React.forwardRef<HTMLInputElement, IInputProps>(({ className, variant, type, ...props }, ref) => {
  return <input type={type} className={cn(inputVariants({ variant }), className)} ref={ref} {...props} />;
});
Input.displayName = 'Input';

export { Input };
