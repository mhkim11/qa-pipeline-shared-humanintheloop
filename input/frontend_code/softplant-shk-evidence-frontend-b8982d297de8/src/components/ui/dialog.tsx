import * as React from 'react';

import * as DialogPrimitive from '@radix-ui/react-dialog';
import { Cross2Icon } from '@radix-ui/react-icons';

import { cn } from '@/lib/utils';

const Dialog = DialogPrimitive.Root;

const DialogTrigger = DialogPrimitive.Trigger;

const DialogPortal = DialogPrimitive.Portal;

const DialogClose = DialogPrimitive.Close;

const DialogOverlay = React.forwardRef<
  React.ElementRef<typeof DialogPrimitive.Overlay>,
  React.ComponentPropsWithoutRef<typeof DialogPrimitive.Overlay>
>(({ className, ...props }, ref) => (
  <DialogPrimitive.Overlay
    ref={ref}
    className={cn(
      'fixed inset-0 z-[9999] flex max-h-screen flex-wrap items-center justify-center overflow-y-scroll bg-neutral-800/60 py-7 no-scrollbar',
      'data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0 data-[state=open]:animate-in-350 data-[state=closed]:animate-out-350',
      className,
    )}
    {...props}
  />
));
DialogOverlay.displayName = DialogPrimitive.Overlay.displayName;

const DialogContent = React.forwardRef<
  React.ElementRef<typeof DialogPrimitive.Content>,
  React.ComponentPropsWithoutRef<typeof DialogPrimitive.Content> & {
    isAutoFocus?: boolean;
  }
>(({ className, children, ...props }, ref) => (
  <DialogPortal>
    <DialogOverlay className={!className?.includes('is-not-animate') ? 'is-not-animate' : ''}>
      <DialogPrimitive.Content
        ref={ref}
        className={cn(
          'group border-transparent focus:border-transparent focus:outline-none focus:ring-0',
          'relative z-[999] w-full max-w-lg gap-3 rounded-[20px] border bg-background shadow-lg',
          'data-[state=closed]:fade-out-20 data-[state=open]:fade-in-20 data-[state=open]:animate-in-350 data-[state=closed]:animate-out-350',
          !className?.includes('is-not-animate')
            ? 'data-[state=closed]:slide-out-to-top-[1%] data-[state=open]:slide-in-from-top-[1%]'
            : '',
          className,
        )}
        onInteractOutside={(e) => {
          const { originalEvent } = e.detail;
          if (originalEvent.target instanceof Element && originalEvent.target.closest('.group.toast')) {
            e.preventDefault();
          }
        }}
        {...props}
      >
        <div
          className={cn(
            'pointer-events-none absolute left-0 top-0 z-[1000] h-full w-full rounded-xl bg-white',
            'group-data-[state=closed]:opacity-100 group-data-[state=open]:opacity-0',
          )}
        />
        {!props?.isAutoFocus && <button type='button' autoFocus className='sr-only' />}

        {children}

        {!className?.includes('is-not-closed') && (
          <DialogPrimitive.Close
            autoFocus={props?.isAutoFocus}
            className={cn(
              props?.isAutoFocus
                ? 'focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2'
                : 'focus:outline-none focus:ring-0 focus:ring-transparent focus:ring-offset-2',

              'absolute right-4 top-4 rounded-sm opacity-70 ring-offset-background transition-opacity hover:opacity-100 disabled:pointer-events-none data-[state=open]:bg-accent data-[state=open]:text-muted-foreground',
            )}
          >
            <Cross2Icon className='h-4 w-4' />
            <span className='sr-only'>닫기</span>
          </DialogPrimitive.Close>
        )}
      </DialogPrimitive.Content>
    </DialogOverlay>
  </DialogPortal>
));
DialogContent.displayName = DialogPrimitive.Content.displayName;

/**
 * DialogHeader 컴포넌트
 * @param {React.HTMLAttributes<HTMLDivElement>} props - DialogHeader 컴포넌트 props
 * @returns {JSX.Element} DialogHeader 컴포넌트
 */
const DialogHeader = ({ className, ...props }: React.HTMLAttributes<HTMLDivElement>): JSX.Element => (
  <div className={cn('flex flex-col space-y-1.5 text-center sm:text-left', className)} {...props} />
);
DialogHeader.displayName = 'DialogHeader';

/**
 * DialogFooter 컴포넌트
 * @param {React.HTMLAttributes<HTMLDivElement>} props - DialogFooter 컴포넌트 props
 * @returns {JSX.Element} DialogFooter 컴포넌트
 */
const DialogFooter = ({ className, ...props }: React.HTMLAttributes<HTMLDivElement>): JSX.Element => (
  <div className={cn('flex flex-col-reverse sm:flex-row sm:justify-end sm:space-x-2', className)} {...props} />
);
DialogFooter.displayName = 'DialogFooter';

const DialogTitle = React.forwardRef<
  React.ElementRef<typeof DialogPrimitive.Title>,
  React.ComponentPropsWithoutRef<typeof DialogPrimitive.Title>
>(({ className, ...props }, ref) => (
  <DialogPrimitive.Title ref={ref} className={cn('text-lg leading-none tracking-tight pretendard-semibold', className)} {...props} />
));
DialogTitle.displayName = DialogPrimitive.Title.displayName;

const DialogDescription = React.forwardRef<
  React.ElementRef<typeof DialogPrimitive.Description>,
  React.ComponentPropsWithoutRef<typeof DialogPrimitive.Description>
>(({ className, ...props }, ref) => (
  <DialogPrimitive.Description ref={ref} className={cn('text-sm text-muted-foreground', className)} {...props} />
));
DialogDescription.displayName = DialogPrimitive.Description.displayName;

export {
  Dialog,
  DialogPortal,
  DialogOverlay,
  DialogTrigger,
  DialogClose,
  DialogContent,
  DialogHeader,
  DialogFooter,
  DialogTitle,
  DialogDescription,
};
