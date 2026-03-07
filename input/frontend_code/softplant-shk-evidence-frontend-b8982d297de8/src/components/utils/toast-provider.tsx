import React from 'react';

import * as Portal from '@radix-ui/react-portal';
import * as ToastPrimitives from '@radix-ui/react-toast';

import { cn } from '@/lib/utils';

export const ToastViewport = React.forwardRef<
  React.ElementRef<typeof ToastPrimitives.Viewport>,
  React.ComponentPropsWithoutRef<typeof ToastPrimitives.Viewport>
>(({ className, ...props }, ref) => (
  <Portal.Root className='fixed z-[10000]'>
    <ToastPrimitives.Viewport
      ref={ref}
      className={cn(
        'fixed top-0 z-[10000] flex max-h-screen w-full flex-col-reverse p-4 sm:bottom-0 sm:right-0 sm:top-auto sm:flex-col md:max-w-[420px]',
        className,
      )}
      {...props}
    />
  </Portal.Root>
));
