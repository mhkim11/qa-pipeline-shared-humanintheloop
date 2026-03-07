import { useEffect, useState } from 'react';

import { ChevronLeft, ChevronRight, Minus, Plus } from 'lucide-react';

type TPdfPaginationProps = {
  visiblePageNumber: number;
  numPages: number;
  scrollToPage: (page: number) => void;
  zoomPercent: number;
  onZoomOut: () => void;
  onZoomIn: () => void;
  canZoomOut?: boolean;
  canZoomIn?: boolean;
};

export default function PdfPagination({
  visiblePageNumber,
  numPages,
  scrollToPage,
  zoomPercent,
  onZoomOut,
  onZoomIn,
  canZoomOut = true,
  canZoomIn = true,
}: TPdfPaginationProps) {
  const [pageInput, setPageInput] = useState(String(visiblePageNumber));
  useEffect(() => setPageInput(String(visiblePageNumber)), [visiblePageNumber]);

  return (
    <div className='pointer-events-none absolute bottom-[5%] left-1/2 z-50 -translate-x-1/2'>
      <div className='pointer-events-auto flex w-fit items-center gap-2 rounded-[10px] border border-gray-200 bg-white/95 px-3 py-2 shadow-lg backdrop-blur'>
        <button
          type='button'
          onClick={() => scrollToPage(visiblePageNumber - 1)}
          disabled={visiblePageNumber <= 1}
          className='inline-flex h-8 w-8 items-center justify-center rounded-[10px] border border-gray-200 bg-white text-gray-700 hover:bg-gray-50 disabled:cursor-not-allowed disabled:opacity-40'
          title='이전 페이지'
        >
          <ChevronLeft className='h-[18px] w-[18px]' />
        </button>
        <div className='flex items-center justify-center text-[13px] font-medium text-gray-800'>
          {/* 현재 페이지 부분의 배경색 효과 추가 */}
          <input
            value={pageInput}
            inputMode='numeric'
            className='h-[32px] w-[42px] rounded-[10px] border-none bg-[#f8f8f8] text-center text-[13px] font-medium text-[#46474b] outline-none focus:outline-none focus:ring-0'
            onChange={(e) => {
              const v = e.target.value;
              if (v === '') {
                setPageInput('');
                return;
              }
              if (!/^\d+$/.test(v)) return;
              const n = Number(v);
              if (!Number.isFinite(n)) return;
              if (n < 1 || n > numPages) return;
              setPageInput(String(n));
              scrollToPage(n);
            }}
            onBlur={() => {
              if (pageInput.trim() === '') setPageInput(String(visiblePageNumber));
            }}
            onKeyDown={(e) => {
              if (e.key !== 'Enter') return;
              const raw = pageInput.trim();
              if (!raw) {
                setPageInput(String(visiblePageNumber));
                return;
              }
              if (!/^\d+$/.test(raw)) return;
              const n = Number(raw);
              if (!Number.isFinite(n)) return;
              if (n < 1 || n > numPages) return;
              scrollToPage(n);
            }}
          />
          <div className='mx-2 flex items-center justify-center text-center text-[13px] font-medium text-[#46474b]'>/</div>
          <div className='flex h-[32px] w-[42px] items-center justify-center text-center text-[13px] font-medium text-[#46474b]'>
            {numPages.toString().padStart(2, '0')}
          </div>
        </div>
        <button
          type='button'
          onClick={() => scrollToPage(visiblePageNumber + 1)}
          disabled={visiblePageNumber >= numPages}
          className='inline-flex h-8 w-8 items-center justify-center rounded-[10px] border border-gray-200 bg-white text-gray-700 hover:bg-gray-50 disabled:cursor-not-allowed disabled:opacity-40'
          title='다음 페이지'
        >
          <ChevronRight className='h-[18px] w-[18px]' />
        </button>

        <div className='mx-1 h-6 w-px bg-gray-200' />

        <button
          type='button'
          onClick={onZoomOut}
          disabled={!canZoomOut}
          className='inline-flex h-8 w-8 items-center justify-center rounded-[10px] border border-gray-200 bg-white text-gray-700 hover:bg-gray-50 disabled:cursor-not-allowed disabled:opacity-40'
          title='축소'
        >
          <Minus className='h-[18px] w-[18px]' />
        </button>
        <div className='flex h-[32px] w-[70px] items-center justify-center rounded-[10px] bg-[#f8f8f8] text-center text-[13px] font-medium text-[#46474b]'>
          {zoomPercent}%
        </div>
        <button
          type='button'
          onClick={onZoomIn}
          disabled={!canZoomIn}
          className='inline-flex h-8 w-8 items-center justify-center rounded-[10px] border border-gray-200 bg-white text-gray-700 hover:bg-gray-50 disabled:cursor-not-allowed disabled:opacity-40'
          title='확대'
        >
          <Plus className='h-[18px] w-[18px]' />
        </button>
      </div>
    </div>
  );
}
