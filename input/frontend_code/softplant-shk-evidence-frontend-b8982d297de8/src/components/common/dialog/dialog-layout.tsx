import { JSX } from 'react';

import { Dialog, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui';

type TDialogLayoutProps = {
  isOpen: boolean;
  title: string;
  subTitle: string;
  onSetIsOpen: (value: boolean) => void;
  children: React.ReactNode;
};

/**
 * DialogLayout 컴포넌트
 * @param {TDialogLayoutProps} props - DialogLayout 컴포넌트 props
 * @returns {JSX.Element} DialogLayout 컴포넌트
 */
export const DialogLayout = ({ isOpen, title, subTitle, onSetIsOpen, children }: TDialogLayoutProps): JSX.Element => {
  return (
    <Dialog open={isOpen} onOpenChange={onSetIsOpen}>
      <DialogTitle className='hidden'>{title}</DialogTitle>
      <DialogHeader className='hidden'>
        <DialogDescription>{subTitle}</DialogDescription>
      </DialogHeader>
      {children}
    </Dialog>
  );
};
