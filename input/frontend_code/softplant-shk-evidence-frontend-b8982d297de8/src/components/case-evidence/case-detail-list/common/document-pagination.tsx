import { useEffect, useMemo, useRef, useState } from 'react';

import { ChevronLeft, ChevronRight, ChevronsLeft, ChevronsRight } from 'lucide-react';

import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@components/ui';

type TDocumentPaginationProps = {
  pagination: {
    total: number;
    page: number;
    limit: number;
    pages: number;
  };
  onChangePage: (nextPage: number) => void;
  onChangeLimit: (nextLimit: number) => void;
  onClickDownload?: () => void;
  limitOptions?: number[];
};

export default function DocumentPagination({
  pagination,
  onChangePage,
  onChangeLimit,
  onClickDownload,
  limitOptions = [10, 50, 100],
}: TDocumentPaginationProps) {
  const total = Math.max(0, Number(pagination.total || 0));
  const page = Math.max(1, Number(pagination.page || 1));
  const limit = Math.max(1, Number(pagination.limit || 1));
  const pages = Math.max(1, Number(pagination.pages || 1));

  const start = total === 0 ? 0 : (page - 1) * limit + 1;
  const end = total === 0 ? 0 : Math.min(total, page * limit);

  // ! 패널 너비 감지 및 compact 모드 전환
  const rootRef = useRef<HTMLDivElement | null>(null);
  const [isCompact, setIsCompact] = useState(false);
  useEffect(() => {
    const el = rootRef.current;
    if (!el) return;
    const update = () => setIsCompact(el.getBoundingClientRect().width < 520);
    update();
    const ro = new ResizeObserver(() => update());
    ro.observe(el);
    return () => ro.disconnect();
  }, []);

  // 좁은 레이아웃에서 "n개씩 보기" select 너비 축소
  const limitSelectWidth = isCompact ? 96 : 120;

  const [pageInput, setPageInput] = useState(String(page));
  useEffect(() => setPageInput(String(page)), [page]);

  const totalPagesText = useMemo(() => ` / ${pages}`, [pages]);

  return (
    <div ref={rootRef} className='flex h-[48px] items-center justify-between border-t border-[#E4E4E7] bg-white px-3'>
      {/* 왼쪽: 페이지당 개수 선택 + 범위 */}
      <div className='flex items-center gap-3'>
        <Select
          value={String(limit)}
          onValueChange={(v) => {
            const next = Math.max(1, Number(v));
            onChangeLimit(next);
          }}
        >
          <SelectTrigger
            className='h-[32px] rounded-[10px] border border-[#E4E4E7] bg-white text-[12px] font-semibold text-[#18181B] outline-none'
            style={{ width: limitSelectWidth }}
          >
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            {limitOptions.map((n) => (
              <SelectItem key={n} value={String(n)}>
                {n}개씩 보기
              </SelectItem>
            ))}
          </SelectContent>
        </Select>

        {!isCompact ? (
          <div className='text-[12px] font-medium text-[#8A8A8E]'>
            {total.toLocaleString()}건 중 {start.toLocaleString()}~{end.toLocaleString()}건
          </div>
        ) : null}
      </div>

      {/* 가운데: 페이지네이션 */}
      <div className='flex items-center gap-1'>
        <button
          type='button'
          className='flex h-[32px] w-[32px] items-center justify-center rounded-[10px] hover:bg-[#F4F4F5] disabled:opacity-40'
          disabled={page <= 1}
          onClick={() => onChangePage(1)}
        >
          <ChevronsLeft className='h-4 w-4 text-[#3F3F46]' />
        </button>
        <button
          type='button'
          className='flex h-[32px] w-[32px] items-center justify-center rounded-[10px] hover:bg-[#F4F4F5] disabled:opacity-40'
          disabled={page <= 1}
          onClick={() => onChangePage(Math.max(1, page - 1))}
        >
          <ChevronLeft className='h-4 w-4 text-[#3F3F46]' />
        </button>

        <div className='mx-2 flex items-center'>
          <input
            value={pageInput}
            inputMode='numeric'
            className='h-[32px] w-[56px] rounded-[10px] border-none bg-[#F4F4F5] text-center text-[13px] font-semibold text-[#18181B] outline-none focus:outline-none focus:ring-0'
            onChange={(e) => {
              const v = e.target.value;
              if (v === '') {
                setPageInput('');
                return;
              }
              if (!/^\d+$/.test(v)) return;
              const n = Number(v);
              if (!Number.isFinite(n)) return;
              if (n < 1 || n > pages) return;
              setPageInput(String(n));
              onChangePage(n);
            }}
          />
          <span className='ml-2 text-[13px] font-semibold text-[#8A8A8E]'>{totalPagesText}</span>
        </div>

        <button
          type='button'
          className='flex h-[32px] w-[32px] items-center justify-center rounded-[10px] hover:bg-[#F4F4F5] disabled:opacity-40'
          disabled={page >= pages}
          onClick={() => onChangePage(Math.min(pages, page + 1))}
        >
          <ChevronRight className='h-4 w-4 text-[#3F3F46]' />
        </button>
        <button
          type='button'
          className='flex h-[32px] w-[32px] items-center justify-center rounded-[10px] hover:bg-[#F4F4F5] disabled:opacity-40'
          disabled={page >= pages}
          onClick={() => onChangePage(pages)}
        >
          <ChevronsRight className='h-4 w-4 text-[#3F3F46]' />
        </button>
      </div>

      {/* 오른쪽: 다운로드 */}
      {!isCompact && onClickDownload ? (
        <div>
          <button
            type='button'
            className='h-[32px] rounded-[10px] border border-[#E4E4E7] bg-white px-3 text-[13px] font-semibold text-[#18181B] hover:bg-[#F4F4F5]'
            onClick={onClickDownload}
          >
            목록 다운로드
          </button>
        </div>
      ) : (
        <div className='w-[1px]' />
      )}
    </div>
  );
}
