import React, { useCallback, useMemo } from 'react';

import { X } from 'lucide-react';

import { useConfirmStore } from '@stores/use-confirm-store';
import { Button } from '@/components/ui';
import {
  AlertDialog,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogOverlay,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';
import { cn } from '@/lib/utils';

/**
 * [공통] 컨펌 컴포넌트
 * @returns {React.JSX.Element | null} 컨펌 컴포넌트
 */
export const Confirm: React.FC = (): React.JSX.Element | null => {
  // ! State
  const { isOpen, current, onClose } = useConfirmStore();

  const colorConfig = useMemo(() => {
    if (!current)
      return {
        text: 'text-zinc-500',
        button: 'bg-[#69C0FF] hover:bg-[#69C0FF]/90',
      };

    if (current.type === 'error')
      return {
        text: 'text-zinc-500',
        button: 'bg-[#DC2626] text-white hover:bg-[#DC2626]/90',
      };

    if (current.type === 'success')
      return {
        text: 'text-zinc-500',
        button: 'bg-green-500 hover:bg-green-500',
      };

    if (current.type === 'warning')
      return {
        text: 'text-zinc-500',
        button: 'bg-yellow-500 hover:bg-yellow-500',
      };

    return {
      text: 'text-zinc-500',
      button: 'bg-[#69C0FF] hover:bg-[#69C0FF]/90',
    };
  }, [current]);

  /**
   * 컨펌 확인 버튼 클릭 핸들러
   */
  const onClickConfirmButton = useCallback(() => {
    if (current?.onConfirm) {
      current.onConfirm();
    }
    onClose();
  }, [current, onClose]);

  /**
   * 컨펌 취소 버튼 클릭 핸들러
   */
  const onClickCancelButton = useCallback(() => {
    if (current?.onCancel) {
      current.onCancel();
    }
    onClose();
  }, [current, onClose]);

  if (!isOpen || !current) return null;

  return (
    <AlertDialog open={isOpen} onOpenChange={onClose}>
      <AlertDialogOverlay onMouseDown={() => onClose()} className='bg-black/15' />
      <AlertDialogContent className={cn('w-full max-w-sm !gap-0 !space-y-0 !rounded-2xl border border-gray-200 bg-white p-0 shadow-xl')}>
        <AlertDialogHeader className='relative'>
          <AlertDialogTitle className={cn('whitespace-pre-line p-4 text-lg !font-semibold')}>{current.title}</AlertDialogTitle>

          <Button variant='ghost' size='icon' onClick={() => onClose()} className='absolute right-2 top-0'>
            <X className='size-4' />
          </Button>

          {typeof current.message === 'string' ? (
            <AlertDialogDescription className='!m-0 whitespace-pre-line px-4 py-1.5 text-sm font-medium leading-relaxed text-zinc-800'>
              {current.message}
            </AlertDialogDescription>
          ) : (
            <>
              <AlertDialogDescription className='sr-only'>{current.title}</AlertDialogDescription>
              <div className='!m-0 p-0'>{current.message}</div>
            </>
          )}
        </AlertDialogHeader>

        <AlertDialogFooter className='p-4'>
          <Button
            onClick={onClickCancelButton}
            className='box-sizing-border h-[38px] rounded-lg border border-gray-300 bg-zinc-100 px-4 py-2 text-gray-700 hover:bg-gray-50'
          >
            {current.cancelText ?? '취소'}
          </Button>
          <Button
            onClick={onClickConfirmButton}
            className={cn('h-[38px] rounded-lg px-4 py-2 text-white hover:bg-gray-50', colorConfig.button)}
          >
            {current.confirmText ?? '확인'}
          </Button>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
};
