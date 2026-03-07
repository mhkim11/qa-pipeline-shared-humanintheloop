import { useEffect, useRef, useState } from 'react';

import { X } from 'lucide-react';

type TDocumentRenameModalProps = {
  isOpen: boolean;
  initialValue?: string;
  isSubmitting?: boolean;
  onClose: () => void;
  onSubmit: (nextFileName: string) => void | Promise<void>;
};

export default function DocumentRenameModal({
  isOpen,
  initialValue = '',
  isSubmitting = false,
  onClose,
  onSubmit,
}: TDocumentRenameModalProps): JSX.Element | null {
  const [value, setValue] = useState(String(initialValue ?? ''));
  const inputRef = useRef<HTMLInputElement | null>(null);

  // ! 모달 열릴 때 값 초기화 및 포커스
  useEffect(() => {
    if (!isOpen) return;
    setValue(String(initialValue ?? ''));
    requestAnimationFrame(() => inputRef.current?.focus());
  }, [initialValue, isOpen]);

  if (!isOpen) return null;

  return (
    <div className='fixed inset-0 z-[2147483647] flex items-center justify-center bg-black/40 px-4' role='dialog' aria-modal='true'>
      <div className='w-full max-w-[calc(100vw-32px)] rounded-[16px] bg-white p-4 shadow-xl sm:w-[348px]'>
        <div className='flex items-start justify-between'>
          <div className='text-[20px] font-bold text-[#18181B]'>이름 바꾸기</div>
          <button
            type='button'
            className='rounded-[8px] p-2 text-[#8A8A8E] hover:bg-[#F4F4F5]'
            onClick={() => {
              if (isSubmitting) return;
              onClose();
            }}
            aria-label='close'
          >
            <X className='h-4 w-4' />
          </button>
        </div>

        <div className='mt-2 text-[14px] text-[#09090B]'>목록에 표현될 자료의 이름을 입력해주세요</div>

        <div className='relative mt-2'>
          <input
            ref={inputRef}
            value={value}
            onChange={(e) => setValue(e.target.value)}
            onKeyDown={(e) => {
              if (e.key !== 'Enter') return;
              e.preventDefault();
              if (isSubmitting) return;
              void onSubmit(String(value ?? ''));
            }}
            className='h-[44px] w-full rounded-[12px] border border-[#D4D4D8] bg-white px-4 pr-10 text-[14px] text-[#18181B] outline-none focus:border-[#69C0FF] focus:ring-1 focus:ring-[#69C0FF]'
            placeholder='자료 이름 입력'
          />

          {String(value ?? '').trim() ? (
            <button
              type='button'
              className='absolute right-3 top-1/2 -translate-y-1/2 text-[#A1A1AA] hover:text-[#71717A] disabled:cursor-not-allowed disabled:opacity-60'
              aria-label='clear-input'
              disabled={isSubmitting}
              onClick={() => {
                if (isSubmitting) return;
                setValue('');
                requestAnimationFrame(() => inputRef.current?.focus());
              }}
            >
              <X className='h-4 w-4' />
            </button>
          ) : null}
        </div>

        <div className='mt-6 flex items-center justify-end gap-2'>
          <button
            type='button'
            className='h-[40px] rounded-[12px] border border-[#D4D4D8] bg-white px-5 text-[14px] font-semibold text-[#18181B] hover:bg-[#F4F4F5] disabled:cursor-not-allowed disabled:opacity-60'
            onClick={() => {
              if (isSubmitting) return;
              onClose();
            }}
            disabled={isSubmitting}
          >
            취소
          </button>
          <button
            type='button'
            className='h-[40px] rounded-[12px] bg-[#69C0FF] px-5 text-[14px] font-semibold text-white hover:bg-[#1677FF] disabled:cursor-not-allowed disabled:bg-[#E4E4E7] disabled:text-[#A1A1AA]'
            onClick={() => {
              if (isSubmitting) return;
              void onSubmit(String(value ?? ''));
            }}
            disabled={isSubmitting || !String(value ?? '').trim()}
          >
            완료
          </button>
        </div>
      </div>
    </div>
  );
}
