import { useEffect, useRef } from 'react';

import ReactDOM from 'react-dom';
import { IoMdCloseCircle } from 'react-icons/io';

import { cn } from '@/lib/utils';

export type TEvidenceOpinionPopupPosition = {
  top: number;
  left: number;
};

type TEvidenceOpinionPopupProps = {
  isOpen: boolean;
  position: TEvidenceOpinionPopupPosition;
  isEditMode: boolean;
  isAgreed: boolean | null;
  pages: string;
  content: string;
  onChangeIsAgreed: (next: boolean) => void;
  onChangePages: (next: string) => void;
  onChangeContent: (next: string) => void;
  onClose: () => void;
  onApply: () => void | Promise<void>;
};

const POPUP_WIDTH_PX = 360;
const POPUP_HEIGHT_PX = 188;

export const EvidenceOpinionPopup = ({
  isOpen,
  position,
  isEditMode,
  isAgreed,
  pages,
  content,
  onChangeIsAgreed,
  onChangePages,
  onChangeContent,
  onClose,
  onApply,
}: TEvidenceOpinionPopupProps) => {
  const popupRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!isOpen) return;
    const handleClickOutside = (event: MouseEvent) => {
      if (popupRef.current && !popupRef.current.contains(event.target as Node)) {
        onClose();
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  return ReactDOM.createPortal(
    <div
      ref={popupRef}
      className='rounded-[16px] bg-white shadow-xl'
      style={{
        position: 'fixed',
        top: `${position.top}px`,
        left: `${position.left}px`,
        width: `${POPUP_WIDTH_PX}px`,
        height: `${POPUP_HEIGHT_PX}px`,
        zIndex: 9999,
      }}
      onClick={(e) => e.stopPropagation()}
    >
      <div className='flex items-center gap-4 px-4 pt-4'>
        <div className='text-[16px] font-semibold text-[#252525]'>증거인부</div>

        <label className='flex cursor-pointer items-center gap-2'>
          <input type='radio' checked={isAgreed === true} onChange={() => onChangeIsAgreed(true)} className='hidden' />
          <div
            className={cn(
              'flex h-[22px] w-[22px] items-center justify-center rounded-full border-2',
              isAgreed === true ? 'border-[#0050B3]' : 'border-[#D4D4D8]',
            )}
          >
            <div className={cn('h-[10px] w-[10px] rounded-full', isAgreed === true ? 'bg-[#0050B3]' : 'bg-transparent')} />
          </div>
          <span className='text-[14px] text-[#252525]'>동의</span>
        </label>

        <label className='flex cursor-pointer items-center gap-2'>
          <input type='radio' checked={isAgreed === false} onChange={() => onChangeIsAgreed(false)} className='hidden' />
          <div
            className={cn(
              'flex h-[22px] w-[22px] items-center justify-center rounded-full border-2',
              isAgreed === false ? 'border-[#0050B3]' : 'border-[#D4D4D8]',
            )}
          >
            <div className={cn('h-[10px] w-[10px] rounded-full', isAgreed === false ? 'bg-[#0050B3]' : 'bg-transparent')} />
          </div>
          <span className='text-[14px] text-[#252525]'>부동의</span>
        </label>
      </div>

      <div className='px-4 pb-4 pt-3'>
        <div className='grid grid-cols-[56px_1fr] items-center gap-2'>
          <div className='text-[14px] font-medium text-[#252525]'>쪽수</div>
          <div className='relative'>
            <input
              value={pages}
              onChange={(e) => onChangePages(e.target.value)}
              placeholder='1-11'
              className='h-[36px] w-full rounded-[12px] border border-[#E5E5E5] bg-white px-3 pr-9 text-[14px] text-[#252525] focus:outline-none focus:ring-0'
            />
            {isEditMode && pages ? (
              <button type='button' className='absolute right-3 top-1/2 -translate-y-1/2 text-[#A1A1AA]' onClick={() => onChangePages('')}>
                <IoMdCloseCircle className='text-[18px]' />
              </button>
            ) : null}
          </div>

          <div className='text-[14px] font-medium text-[#252525]'>의견</div>
          <div className='relative'>
            <input
              value={content}
              onChange={(e) => onChangeContent(e.target.value)}
              placeholder='의견을 입력하세요'
              className='h-[36px] w-full rounded-[12px] border border-[#E5E5E5] bg-white px-3 pr-9 text-[14px] text-[#252525] focus:outline-none focus:ring-0'
            />
            {isEditMode && content ? (
              <button
                type='button'
                className='absolute right-3 top-1/2 -translate-y-1/2 text-[#A1A1AA]'
                onClick={() => onChangeContent('')}
              >
                <IoMdCloseCircle className='text-[18px]' />
              </button>
            ) : null}
          </div>
        </div>

        <div className='mt-3 flex justify-end gap-2'>
          <button
            type='button'
            className='h-[36px] w-[80px] rounded-[12px] bg-[#0050B3] text-[14px] font-semibold text-white'
            onClick={() => void onApply()}
          >
            적용
          </button>
          <button
            type='button'
            className='h-[36px] w-[80px] rounded-[12px] border border-[#E5E5E5] bg-white text-[14px] font-semibold text-[#252525]'
            onClick={onClose}
          >
            취소
          </button>
        </div>
      </div>
    </div>,
    document.body,
  );
};
