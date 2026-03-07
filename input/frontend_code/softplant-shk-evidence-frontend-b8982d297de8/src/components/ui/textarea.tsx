import * as React from 'react';

import { cva, type VariantProps } from 'class-variance-authority';

import { cn } from '@/lib/utils';

const textareaVariants = cva(
  cn(
    'placeholder:text-muted-foreground',
    'focus:outline-none focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2',
    'disabled:cursor-not-allowed disabled:opacity-50',
    'flex min-h-[80px] w-full rounded-md border-0 bg-background px-3 py-2 text-sm ring-1 ring-neutral-300 ring-offset-background',
  ),
  {
    variants: {
      variant: {
        error: 'ring-destructive focus:!ring-destructive',
      },
    },
  },
);

export interface ITextareaProps extends React.TextareaHTMLAttributes<HTMLTextAreaElement>, VariantProps<typeof textareaVariants> {}

const Textarea = React.forwardRef<HTMLTextAreaElement, ITextareaProps>(({ className, variant, ...props }, ref) => {
  return <textarea className={cn(textareaVariants({ variant }), className)} ref={ref} {...props} />;
});
Textarea.displayName = 'Textarea';

export { Textarea };
