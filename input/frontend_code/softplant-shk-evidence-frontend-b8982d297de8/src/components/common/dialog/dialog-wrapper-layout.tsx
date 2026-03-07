import { JSX } from 'react';

import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui';
import { cn } from '@/lib/utils';

type TDialogLayoutProps = {
  isOpen: boolean;
  title: string;
  subTitle: string;
  onSetIsOpen: (value: boolean) => void;
  children: React.ReactNode;
  className?: string;
  onInteractOutside?: (e: Event) => void;
  onOpenAutoFocus?: (e: Event) => void;
};

/**
 * DialogWrapperLayout 컴포넌트
 * @param {TDialogLayoutProps} props - DialogWrapperLayout 컴포넌트 props
 * @returns {JSX.Element} DialogWrapperLayout 컴포넌트
 */
export const DialogWrapperLayout = ({
  isOpen,
  title,
  subTitle,
  onSetIsOpen,
  children,
  className = '',
  onInteractOutside,
  onOpenAutoFocus,
}: TDialogLayoutProps): JSX.Element => {
  return (
    <Dialog open={isOpen} onOpenChange={onSetIsOpen}>
      <DialogTitle className='hidden'>{title}</DialogTitle>
      <DialogHeader className='hidden'>
        <DialogDescription>{subTitle}</DialogDescription>
      </DialogHeader>
      <DialogContent
        className={cn(className, 'relative flex flex-col items-center rounded-xl bg-white')}
        onInteractOutside={typeof onInteractOutside === 'function' ? onInteractOutside : (e) => e.preventDefault()}
        onOpenAutoFocus={typeof onOpenAutoFocus === 'function' ? onOpenAutoFocus : undefined}
      >
        {children}
      </DialogContent>
    </Dialog>
  );
};
