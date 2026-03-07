import { useEffect, useMemo, useRef, useState } from 'react';

import ReactDOM from 'react-dom';
import { IoIosArrowDown, IoIosArrowUp } from 'react-icons/io';

type TRange = { min?: number; max?: number };

type TRangeDropdownFilterProps = {
  column: string;
  value: TRange;
  onChange: (next: TRange) => void;
  isOpen: boolean;
  onToggle: () => void;
  placeholders?: { min?: number; max?: number };
};

const RangeDropdownFilter = ({ column, value, onChange, isOpen, onToggle, placeholders }: TRangeDropdownFilterProps): JSX.Element => {
  const triggerRef = useRef<HTMLDivElement>(null);
  const filterRef = useRef<HTMLDivElement>(null);
  const [position, setPosition] = useState({ top: 0, left: 0 });
  const [isPositionReady, setIsPositionReady] = useState(false);

  const [draft, setDraft] = useState<TRange>(value);

  const isAll = useMemo(() => typeof draft.min !== 'number' && typeof draft.max !== 'number', [draft.max, draft.min]);

  useEffect(() => {
    if (isOpen && triggerRef.current) {
      const rect = triggerRef.current.getBoundingClientRect();
      setPosition({
        top: rect.bottom + window.scrollY,
        left: rect.left + window.scrollX,
      });
    }
  }, [isOpen]);

  useEffect(() => {
    if (isOpen) {
      setDraft(value);
      setIsPositionReady(false);

      if (triggerRef.current) {
        const rect = triggerRef.current.getBoundingClientRect();
        setPosition({
          top: rect.bottom + window.scrollY,
          left: rect.left + window.scrollX,
        });

        setTimeout(() => setIsPositionReady(true), 10);
      }
    } else {
      setIsPositionReady(false);
    }
  }, [isOpen, value]);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        isOpen &&
        filterRef.current &&
        !filterRef.current.contains(event.target as Node) &&
        triggerRef.current &&
        !triggerRef.current.contains(event.target as Node)
      ) {
        onToggle();
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [isOpen, onToggle]);

  const handleApply = () => {
    onChange(draft);
    onToggle();
  };

  const handleCancel = () => {
    setDraft(value);
    onToggle();
  };

  const handleSelectAll = () => {
    setDraft({});
  };

  return (
    <div className='relative inline-block'>
      <div ref={triggerRef} className='flex cursor-pointer items-center justify-center text-[#252525]' onClick={onToggle}>
        <p className='text-[14px]'>{column}</p>
        {isOpen ? <IoIosArrowUp className='ml-1 text-[#8e8e8e]' /> : <IoIosArrowDown className='ml-1 text-[#8e8e8e]' />}
      </div>

      {isOpen &&
        isPositionReady &&
        ReactDOM.createPortal(
          <div
            ref={filterRef}
            className='fixed z-[9999] min-h-[180px] w-[220px] rounded-[8px] border bg-white shadow-lg'
            style={{
              top: `${position.top}px`,
              left: `${position.left}px`,
            }}
            onClick={(e) => e.stopPropagation()}
          >
            <div className='flex h-full flex-col'>
              <div className='flex-grow'>
                <label className='flex'>
                  <div className='ml-[16px] flex h-[48px] items-center'>
                    <input
                      type='checkbox'
                      checked={isAll}
                      onChange={handleSelectAll}
                      className='h-[20px] w-[20px] rounded-[2px] border-[#CCD0D1] text-[#0050B3] outline-none focus:ring-0'
                    />
                    <p className='ml-2 text-[14px]'>전체</p>
                  </div>
                </label>

                <div className='px-[16px] pb-[16px]'>
                  <div className='flex items-center gap-2'>
                    <input
                      type='number'
                      className='h-[36px] w-[88px] rounded-[6px] border border-[#CCD0D1] px-2 text-[12px] outline-none focus:ring-0'
                      placeholder={placeholders?.min != null ? String(placeholders.min) : 'min'}
                      value={typeof draft.min === 'number' ? draft.min : ''}
                      onChange={(e) => {
                        const v = e.target.value === '' ? undefined : Number(e.target.value);
                        setDraft((prev) => ({ ...prev, min: v }));
                      }}
                    />
                    <span className='text-[12px] text-[#8e8e8e]'>~</span>
                    <input
                      type='number'
                      className='h-[36px] w-[88px] rounded-[6px] border border-[#CCD0D1] px-2 text-[12px] outline-none focus:ring-0'
                      placeholder={placeholders?.max != null ? String(placeholders.max) : 'max'}
                      value={typeof draft.max === 'number' ? draft.max : ''}
                      onChange={(e) => {
                        const v = e.target.value === '' ? undefined : Number(e.target.value);
                        setDraft((prev) => ({ ...prev, max: v }));
                      }}
                    />
                  </div>
                </div>
              </div>

              <div className='sticky bottom-0 flex h-[64px] w-full items-center justify-center gap-2 rounded-b-[8px] bg-white'>
                <button onClick={handleApply} className='h-[30px] w-[70px] cursor-pointer rounded-[6px] bg-[#0050B3] text-white'>
                  적용
                </button>
                <button onClick={handleCancel} className='h-[30px] w-[70px] rounded-[6px] border text-[#373737]'>
                  취소
                </button>
              </div>
            </div>
          </div>,
          document.body,
        )}
    </div>
  );
};

export default RangeDropdownFilter;
