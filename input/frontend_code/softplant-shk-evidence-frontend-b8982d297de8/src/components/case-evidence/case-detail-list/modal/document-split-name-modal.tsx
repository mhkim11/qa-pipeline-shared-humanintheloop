import { useEffect, useMemo, useRef, useState } from 'react';

import { X } from 'lucide-react';

type TSplitRange = { id: string; start: number; end: number };

type TDocumentSplitNameModalProps = {
  isOpen: boolean;
  ranges: TSplitRange[];
  initialNames?: Record<string, string>;
  isSubmitting?: boolean;
  onClose: () => void;
  onSubmit: (namesByRangeId: Record<string, string>) => void | Promise<void>;
};

export default function DocumentSplitNameModal({
  isOpen,
  ranges,
  initialNames,
  isSubmitting = false,
  onClose,
  onSubmit,
}: TDocumentSplitNameModalProps): JSX.Element | null {
  const firstInputRef = useRef<HTMLInputElement | null>(null);

  // ! 초기 이름 시드 값 계산
  const seed = useMemo(() => {
    const s: Record<string, string> = {};
    for (const r of ranges) s[r.id] = String(initialNames?.[r.id] ?? '');
    return s;
  }, [initialNames, ranges]);

  const [names, setNames] = useState<Record<string, string>>(seed);

  // ! 모달 열릴 때 이름 초기화 및 포커스
  useEffect(() => {
    if (!isOpen) return;
    setNames(seed);
    requestAnimationFrame(() => firstInputRef.current?.focus());
  }, [isOpen, seed]);

  if (!isOpen) return null;

  return (
    <div className='fixed inset-0 z-[2147483200] flex items-center justify-center bg-black/40 px-4' role='dialog' aria-modal='true'>
      <div className='w-full max-w-[calc(100vw-32px)] rounded-[16px] bg-white p-4 shadow-xl sm:w-[420px]'>
        <div className='flex items-start justify-between'>
          <div className='text-[18px] font-bold text-[#18181B]'>문서 분리</div>
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

        <div className='mt-2 text-[14px] text-[#09090B]'>분리된 문서의 이름을 작성해주세요</div>

        <div className='mt-4 max-h-[400px] overflow-auto pr-1'>
          <div className='flex flex-col gap-3'>
            {ranges.map((r, idx) => {
              const label = `범위 ${idx + 1} (${r.start}~${r.end})`;
              return (
                <div key={r.id} className='flex flex-col gap-2'>
                  <div className='text-[12px] font-semibold text-[#3F3F46]'>{label}</div>
                  <input
                    ref={idx === 0 ? firstInputRef : undefined}
                    value={String(names[r.id] ?? '')}
                    onChange={(e) => setNames((prev) => ({ ...prev, [r.id]: e.target.value }))}
                    className='h-[40px] w-full rounded-[12px] border border-[#D4D4D8] bg-white px-4 text-[14px] text-[#18181B] outline-none focus:border-[#69C0FF] focus:ring-1 focus:ring-[#69C0FF]'
                    placeholder='예) 2025년 세금'
                  />
                </div>
              );
            })}
          </div>
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
              void onSubmit(names);
            }}
            disabled={isSubmitting}
          >
            완료
          </button>
        </div>
      </div>
    </div>
  );
}
