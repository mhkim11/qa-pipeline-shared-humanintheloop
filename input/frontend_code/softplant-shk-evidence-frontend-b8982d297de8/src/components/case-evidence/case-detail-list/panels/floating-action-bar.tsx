import { Check, ChevronDown, MessageSquarePlus, Plus, Trash2 } from 'lucide-react';

type TDocTag = '근거' | '강화' | '반박';

type TActionBarPos = {
  left: number;
  top: number;
};

type TSelectionLike = {
  id: number;
  color?: string;
  flags?: {
    docUsableType?: TDocTag;
    relatedMissing?: boolean;
  };
};

type THighlightColor = { key: string; hex: string; border: string };

type TFloatingActionBarProps = {
  actionBarPos: TActionBarPos;
  selection: TSelectionLike;

  // 태그
  onSelectDocTag: (tag: TDocTag) => void;
  onToggleRelatedMissing: () => void;

  // 메모
  onClickMemo: () => void;

  // 색상 팔레트
  isPaletteOpen: boolean;
  onTogglePalette: () => void;
  colors: THighlightColor[];
  defaultFillHex: string;
  onSelectColor: (c: THighlightColor) => void;

  // 삭제
  onDelete: () => void;
};

export default function FloatingActionBar({
  actionBarPos,
  selection,
  onSelectDocTag,
  onToggleRelatedMissing,
  onClickMemo,
  isPaletteOpen,
  onTogglePalette,
  colors,
  defaultFillHex,
  onSelectColor,
  onDelete,
}: TFloatingActionBarProps) {
  const usableType = selection.flags?.docUsableType;
  const relatedMissing = !!selection.flags?.relatedMissing;

  const tagList: readonly TDocTag[] = ['근거', '강화', '반박'] as const;
  const currentFill = selection.color || defaultFillHex;

  return (
    <div className='fixed z-[9999]' style={{ left: actionBarPos.left, top: actionBarPos.top }}>
      <div className='flex w-max flex-nowrap items-center gap-1 whitespace-nowrap rounded-[12px] border border-[#D4D4D8] bg-white p-[4px] shadow-lg'>
        {/* 근거/강화/반박 */}
        <div className='flex items-center'>
          {tagList.map((t, idx) => {
            const isActive = usableType === t;
            const isFirst = idx === 0;
            const isLast = idx === tagList.length - 1;
            let roundedClass = '';
            if (isFirst) roundedClass = 'rounded-l-[4px]';
            else if (isLast) roundedClass = 'rounded-r-[4px]';

            return (
              <button
                key={t}
                type='button'
                onClick={onSelectDocTag.bind(null, t)}
                className={`h-[24px] w-[37px] text-[12px] font-semibold hover:bg-[#F2F2F2] ${roundedClass} ${
                  isActive ? 'bg-[#F0F8FF] text-[#0071CC]' : 'bg-white text-[#8A8A8E]'
                }`}
              >
                {t}
              </button>
            );
          })}
        </div>

        <div className='h-[24px] w-[1px] bg-[#D4D4D8]' />

        {/* 관련 자료 부족 */}
        <button
          type='button'
          onClick={onToggleRelatedMissing}
          className={`flex shrink-0 items-center gap-1 rounded-[8px] px-2 py-1 text-xs hover:bg-[#F2F2F2] ${
            relatedMissing ? 'bg-[#F2F2F2] font-bold text-[#111827]' : 'bg-white font-medium text-[#8A8A8E]'
          }`}
        >
          <div
            className={`flex h-[13px] w-[13px] items-center justify-center rounded-full ${
              relatedMissing ? 'border-0 bg-transparent' : 'border-1.5 border-[#8A8A8E] bg-white'
            }`}
          >
            {relatedMissing ? (
              <Check className='text-xl text-[#111827]' />
            ) : (
              <Plus className='h-[9px] w-[9px] font-semibold text-[#52525B]' />
            )}
          </div>
          <span className='text-[12px] font-semibold'>관련 자료 부족</span>
        </button>

        <div className='h-[24px] w-[1px] bg-[#D4D4D8]' />

        {/* 메모 */}
        <button
          type='button'
          onClick={onClickMemo}
          className='flex shrink-0 items-center gap-1 rounded-[8px] bg-white px-2 py-1 text-xs font-semibold text-[#000000] hover:bg-[#F4F4F5]'
        >
          <MessageSquarePlus className='h-[18px] w-[18px] text-[#000000]' />
          <span>메모</span>
        </button>

        <div className='h-[24px] w-[1px] bg-[#D4D4D8]' />

        {/* 색상 팔레트 */}
        <div className='relative flex items-center'>
          <button
            type='button'
            onClick={onTogglePalette}
            className='flex shrink-0 items-center gap-1 rounded-full border border-[#D4D4D8] bg-white px-2 py-1 text-xs font-medium text-[#8A8A8E]'
          >
            <span className='h-4 w-4 rounded-full border border-[#D4D4D8]' style={{ backgroundColor: currentFill }} />
            <ChevronDown className='h-3.5 w-3.5' />
          </button>

          {isPaletteOpen ? (
            <div className='absolute bottom-full right-0 mb-2 rounded-[12px] bg-white p-2 shadow-lg'>
              <div className='flex items-center gap-2'>
                {colors.map((c) => (
                  <button
                    key={c.key}
                    type='button'
                    onClick={() => onSelectColor(c)}
                    className={`h-6 w-6 rounded-full ${currentFill === c.hex ? 'border-2' : 'border-0'}`}
                    style={{ backgroundColor: c.hex, borderColor: currentFill === c.hex ? c.border : 'transparent' }}
                    title={c.key}
                  />
                ))}
              </div>
            </div>
          ) : null}
        </div>

        <div className='h-[24px] w-[1px] bg-[#D4D4D8]' />

        {/* 휴지통 */}
        <button
          type='button'
          onClick={onDelete}
          className='flex shrink-0 items-center justify-center bg-white px-2 py-1 text-xs font-medium text-[#000]'
          title='삭제'
        >
          <Trash2 className='h-[18px] w-[18px] text-[#000]' />
        </button>
      </div>
    </div>
  );
}
