import { useState, JSX } from 'react';

import { buttonVariants } from '@/components/ui';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogOverlay,
  AlertDialogPortal,
  AlertDialogTitle,
  AlertDialogTrigger,
} from '@/components/ui/alert-dialog';
import { cn } from '@/lib/utils';

type TAlertConfirmProps = {
  children: React.ReactNode;
  component?: React.ReactNode;
  title: string;
  description?: string;
  onSubmit: (() => void) | (() => Promise<void>);
  disabled?: boolean;
  className?: string;
  onClose?: () => void;
  isStopOutSideClick?: boolean;
  variant?: 'destructive';
};

/**
 * * 확인 다이얼로그 컴포넌트
 * @param {TAlertConfirmProps} props - 확인 다이얼로그 컴포넌트 props
 * @returns {JSX.Element} view
 */
export function AlertConfirm({
  children,
  title,
  description,
  onSubmit,
  onClose,
  disabled = false,
  className,
  component,
  isStopOutSideClick = false,
  variant,
}: TAlertConfirmProps): JSX.Element {
  // ! 기본 state 모음
  const [isOpen, setIsOpen] = useState<boolean>(false);

  return (
    <AlertDialog
      open={isOpen}
      onOpenChange={(e) => {
        if (disabled) {
          onSubmit();
          return;
        }
        setIsOpen(e);
      }}
    >
      <AlertDialogTrigger asChild>{children}</AlertDialogTrigger>
      <AlertDialogPortal>
        <AlertDialogOverlay
          onMouseDown={(_e) => {
            if (isStopOutSideClick) return;

            setIsOpen(false);
            if (typeof onClose === 'function') onClose();
          }}
        />
        <AlertDialogContent
          onOpenAutoFocus={(e) => {
            e.preventDefault();
          }}
          onKeyDown={async (e) => {
            if (e.key === 'Escape') {
              setIsOpen(false);
              if (typeof onClose === 'function') onClose();
            }
          }}
        >
          <AlertDialogHeader>
            <AlertDialogTitle>{title}</AlertDialogTitle>
            {description && <AlertDialogDescription className='whitespace-pre-wrap'>{description}</AlertDialogDescription>}
          </AlertDialogHeader>
          {component && <AlertDialogDescription>{component}</AlertDialogDescription>}
          <AlertDialogFooter>
            <AlertDialogCancel
              autoFocus
              onClick={() => {
                setIsOpen(false);
                if (typeof onClose === 'function') onClose();
              }}
            >
              취소
            </AlertDialogCancel>
            <AlertDialogAction
              data-cy='alertConfirmActionButton'
              onClick={async () => {
                await onSubmit();
              }}
              className={cn(variant && buttonVariants({ variant }), className)}
            >
              확인
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialogPortal>
    </AlertDialog>
  );
}
