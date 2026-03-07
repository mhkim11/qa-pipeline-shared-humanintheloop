import { useEffect } from 'react';

import { Link2, X } from 'lucide-react';

type TRequestAddMessagePopupProps = {
  isOpen: boolean;
  value: string;
  isSubmitting?: boolean;
  onChange: (next: string) => void;
  onClose: () => void;
  onSubmit: () => Promise<void>;
};

export default function RequestAddMessagePopup({
  isOpen,
  value,
  isSubmitting = false,
  onChange,
  onClose,
  onSubmit,
}: TRequestAddMessagePopupProps): JSX.Element | null {
  // ! ESC 키 닫기 처리
  useEffect(() => {
    if (!isOpen) return;
    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    window.addEventListener('keydown', onKeyDown);
    return () => window.removeEventListener('keydown', onKeyDown);
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  const disabled = isSubmitting || !String(value ?? '').trim();

  return (
    <div className='absolute bottom-5 left-1/2 z-[1000] w-[calc(100%-48px)] max-w-[760px] -translate-x-1/2'>
      <div className='w-full overflow-hidden rounded-[16px] border border-[#E4E4E7] bg-white shadow-sm'>
        <div className='flex items-center justify-between p-[8px]'>
          <div className='text-[14px] font-semibold text-[#18181B]'>추가 요청</div>
          <button type='button' className='rounded-[8px] p-[8px] text-[#8A8A8E] hover:bg-[#F4F4F5]' aria-label='close' onClick={onClose}>
            <X className='h-4 w-4' />
          </button>
        </div>

        <div className=''>
          <textarea
            value={value}
            onChange={(e) => onChange(e.target.value)}
            placeholder='메시지를 입력하세요.'
            className='h-[72px] w-full resize-none rounded-[12px] border border-none border-[#E4E4E7] bg-white text-[14px] outline-none placeholder:text-[#A1A1AA] focus:border-none focus:outline-none focus:ring-0'
          />

          <div className='flex items-center justify-end p-[8px]'>
            <button
              type='button'
              className='flex h-[36px] items-center gap-2 rounded-[10px] bg-[#69C0FF] px-4 text-[13px] font-semibold text-white hover:bg-[#43A5FF] disabled:cursor-not-allowed disabled:bg-[#E4E4E7] disabled:text-[#A1A1AA]'
              disabled={disabled}
              onClick={onSubmit}
            >
              <Link2 className='h-4 w-4 text-white' />
              {isSubmitting ? '처리 중...' : '요청 추가 및 링크 복사'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
