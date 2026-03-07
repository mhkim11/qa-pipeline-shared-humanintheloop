import { useCallback, useEffect, useMemo, useRef, useState } from 'react';

import { FileText, Minus, Plus, Trash2, X } from 'lucide-react';
import { createPortal } from 'react-dom';
import { Document, Page } from 'react-pdf';

import PdfPagination from '@/components/case-evidence/case-detail-list/common/pdf-pagination';
import DocumentSplitNameModal from '@/components/case-evidence/case-detail-list/modal/document-split-name-modal';
import CustomSpinner from '@/components/common/spiner';
import { onMessageToast } from '@/components/utils/global-utils';
import { useSplitCivilCaseDocument } from '@/hooks/react-query/mutation/case/use-split-civil-case-document';

type TSplitRange = { id: string; start: number; end: number };

type TDocumentSplitModalProps = {
  isOpen: boolean;
  caseDocumentId?: string | null;
  title?: string;
  pdfUrl?: string | null;
  onClose: () => void;
};

const clampInt = (v: unknown, min: number, max: number) => {
  const n = Number(v);
  if (!Number.isFinite(n)) return min;
  return Math.max(min, Math.min(max, Math.trunc(n)));
};

export default function DocumentSplitModal({
  isOpen,
  caseDocumentId,
  title,
  pdfUrl,
  onClose,
}: TDocumentSplitModalProps): JSX.Element | null {
  const [numPages, setNumPages] = useState<number>(0);
  const [visiblePageNumber, setVisiblePageNumber] = useState<number>(1);
  const [zoomPercent, setZoomPercent] = useState<number>(100);
  const [pdfError, setPdfError] = useState<string>('');
  const [ranges, setRanges] = useState<TSplitRange[]>([{ id: 'range-1', start: 1, end: 1 }]);
  const [isNameModalOpen, setIsNameModalOpen] = useState(false);
  const [namesByRangeId, setNamesByRangeId] = useState<Record<string, string>>({});
  const { isPending: isSplitting, onSplitCivilCaseDocument } = useSplitCivilCaseDocument();

  const nextIdRef = useRef(2);
  const pdfScrollRef = useRef<HTMLDivElement | null>(null);
  const pageWrapRefs = useRef<Record<number, HTMLDivElement | null>>({});

  // ! 모달 열림/닫힘 시 로컬 상태 초기화
  useEffect(() => {
    // 이 모달은 닫힌 상태에서도 마운트 상태를 유지하므로,
    // close/open 시 이전 입력값이 남지 않도록 로컬 상태를 초기화한다.
    if (!isOpen) {
      setPdfError('');
      setIsNameModalOpen(false);
      setZoomPercent(100);
      setVisiblePageNumber(1);
      setNumPages(0);
      setRanges([{ id: 'range-1', start: 1, end: 1 }]);
      setNamesByRangeId({});
      nextIdRef.current = 2;
      return;
    }

    setPdfError('');
    setIsNameModalOpen(false);
    setZoomPercent(100);
    setVisiblePageNumber(1);
    setNumPages(0);
    setRanges([{ id: 'range-1', start: 1, end: 1 }]);
    setNamesByRangeId({});
    nextIdRef.current = 2;
  }, [isOpen]);

  // ! numPages 변경 시 범위 유효성 보정
  useEffect(() => {
    if (!isOpen) return;
    if (!numPages) return;
    setRanges((prev) =>
      prev.map((r) => {
        const s = clampInt(r.start, 1, numPages);
        const e = clampInt(r.end, s, numPages);
        return s === r.start && e === r.end ? r : { ...r, start: s, end: e };
      }),
    );
  }, [isOpen, numPages]);

  const canRender = Boolean(isOpen && pdfUrl);

  // ! 범위 추가
  const onAddRange = useCallback(() => {
    setRanges((prev) => {
      const last = prev[prev.length - 1];
      const lastEnd = clampInt(last?.end ?? 1, 1, Math.max(1, numPages || 1));
      const start = Math.min(Math.max(1, lastEnd + 1), Math.max(1, numPages || 1));
      const end = start;
      const id = `range-${nextIdRef.current++}`;
      return [...prev, { id, start, end }];
    });
  }, [numPages]);

  // ! 범위 제거
  const onRemoveRange = useCallback((id: string) => {
    setRanges((prev) => (prev.length <= 1 ? prev : prev.filter((r) => r.id !== id)));
  }, []);

  // ! 범위 값 수정
  const updateRange = useCallback(
    (id: string, patch: Partial<{ start: number | string; end: number | string }>) => {
      setRanges((prev) =>
        prev.map((r) => {
          if (r.id !== id) return r;
          const max = Math.max(1, numPages || 1);
          const s = clampInt(patch.start ?? r.start, 1, max);
          let e = clampInt(patch.end ?? r.end, 1, max);
          if (s > e) e = s;
          return { ...r, start: s, end: e };
        }),
      );
    },
    [numPages],
  );

  const uiTitle = String(title ?? '').trim() || '문서';
  const zoomScale = Math.max(50, Math.min(200, zoomPercent)) / 100;

  // ! 지정 페이지로 스크롤 이동
  const scrollToPage = useCallback(
    (page: number) => {
      const p = Math.max(1, Math.min(numPages || 1, Math.trunc(page)));
      const el = pageWrapRefs.current[p];
      if (el) {
        el.scrollIntoView({ behavior: 'smooth', block: 'start' });
        setVisiblePageNumber(p);
        return;
      }
      const scroller = pdfScrollRef.current;
      if (!scroller) return;
      scroller.scrollTo({ top: 0, behavior: 'smooth' });
      setVisiblePageNumber(1);
    },
    [numPages],
  );

  // ! 스크롤 기반 현재 페이지 번호 추적 (PdfPagination 연동)
  useEffect(() => {
    if (!isOpen) return;
    const scroller = pdfScrollRef.current;
    if (!scroller) return;
    if (!numPages) return;
    let raf = 0;
    const update = () => {
      const rootRect = scroller.getBoundingClientRect();
      const threshold = rootRect.top + 140;
      let current = 1;
      for (let p = 1; p <= numPages; p += 1) {
        const el = pageWrapRefs.current[p];
        if (!el) continue;
        const r = el.getBoundingClientRect();
        if (r.top <= threshold) current = p;
        else break;
      }
      setVisiblePageNumber((prev) => (prev === current ? prev : current));
    };
    const onScroll = () => {
      if (raf) cancelAnimationFrame(raf);
      raf = requestAnimationFrame(update);
    };
    update();
    scroller.addEventListener('scroll', onScroll, { passive: true });
    window.addEventListener('resize', onScroll);
    return () => {
      scroller.removeEventListener('scroll', onScroll);
      window.removeEventListener('resize', onScroll);
      if (raf) cancelAnimationFrame(raf);
    };
  }, [isOpen, numPages, zoomPercent]);

  // ! 표시용 범위 레이블 계산
  const rightRanges = useMemo(() => ranges.map((r, idx) => ({ ...r, label: `범위 ${idx + 1}` })), [ranges]);

  if (!isOpen) return null;

  if (typeof document === 'undefined') return null;

  return createPortal(
    <div className='fixed inset-0 z-[2147483000] bg-black/40 p-4'>
      <div className='h-full w-full overflow-hidden rounded-[16px] bg-white shadow-xl'>
        {/* 상단 바 */}
        <div className='flex h-[48px] items-center justify-between border-b border-[#D4D4D8] px-4'>
          <div className='flex min-w-0 items-center gap-2'>
            <FileText className='h-4 w-4 text-[#71717A]' />
            <div className='min-w-0 truncate text-[14px] font-semibold text-[#18181B]'>{uiTitle}</div>
          </div>
          <button
            type='button'
            className='flex h-[32px] w-[32px] items-center justify-center rounded-[8px] text-[#8A8A8E] hover:bg-[#F4F4F5]'
            onClick={onClose}
            aria-label='close'
          >
            <X className='h-4 w-4' />
          </button>
        </div>

        {/* 바디 영역 */}
        <div className='flex h-[calc(100%-48px)] min-h-0 min-w-0'>
          {/* 왼쪽: PDF 뷰어 */}
          <div className='relative flex min-w-0 flex-1 flex-col bg-[#E3EAF2]'>
            <div ref={pdfScrollRef} className='min-h-0 flex-1 overflow-auto p-4'>
              <div className='mx-auto w-full max-w-[860px]'>
                {canRender ? (
                  <Document
                    file={String(pdfUrl)}
                    onLoadSuccess={(info: any) => {
                      setNumPages(Number(info?.numPages ?? 0));
                    }}
                    onLoadError={(err: any) => {
                      setPdfError(String(err?.message ?? 'PDF load failed'));
                    }}
                    loading={
                      <div className='flex h-[800px] items-center justify-center'>
                        <div className='flex flex-col items-center gap-2 text-[#8A8A8E]'>
                          <div className='flex h-[16px] w-[16px] scale-[0.7] items-center justify-center'>
                            <CustomSpinner size='sm' />
                          </div>
                          <div className='text-[13px] font-medium'>pdf 문서 로딩중</div>
                        </div>
                      </div>
                    }
                  >
                    {pdfError ? (
                      <div className='flex h-[800px] items-center justify-center'>
                        <div className='text-center'>
                          <p className='text-lg font-medium text-red-500'>PDF를 불러올 수 없습니다</p>
                          <p className='mt-2 text-sm text-gray-500'>{pdfError}</p>
                        </div>
                      </div>
                    ) : numPages ? (
                      <div className='flex w-full flex-col gap-6'>
                        {Array.from({ length: numPages }, (_, idx) => idx + 1).map((n) => (
                          <div
                            key={`split-page-${n}`}
                            ref={(el) => {
                              pageWrapRefs.current[n] = el;
                            }}
                            className='flex items-start gap-4'
                          >
                            <div className='w-[64px] shrink-0 pt-2 text-center text-[12px] font-semibold text-[#71717A]'>{n} 페이지</div>
                            <div className='overflow-hidden rounded-[8px] bg-white shadow-sm'>
                              <Page
                                pageNumber={n}
                                width={720}
                                scale={zoomScale}
                                renderMode='canvas'
                                renderTextLayer={false}
                                renderAnnotationLayer={false}
                                loading={null}
                              />
                            </div>
                          </div>
                        ))}
                      </div>
                    ) : null}
                  </Document>
                ) : (
                  <div className='flex h-[800px] items-center justify-center'>
                    <div className='text-gray-500'>PDF URL이 설정되지 않았습니다</div>
                  </div>
                )}
              </div>
            </div>

            {numPages ? (
              <PdfPagination
                visiblePageNumber={visiblePageNumber}
                numPages={numPages}
                scrollToPage={scrollToPage}
                zoomPercent={Math.max(50, Math.min(200, zoomPercent))}
                onZoomOut={() => setZoomPercent((p) => Math.max(50, p - 10))}
                onZoomIn={() => setZoomPercent((p) => Math.min(200, p + 10))}
                canZoomOut={zoomPercent > 50}
                canZoomIn={zoomPercent < 200}
              />
            ) : null}
          </div>

          {/* 오른쪽: 분리 범위 설정 */}
          <div className='flex w-[360px] flex-col border-l border-[#D4D4D8] bg-white'>
            <div className='px-4 py-4'>
              <div className='text-[16px] font-bold text-[#18181B]'>문서 분리</div>

              <div className='mt-4 flex flex-col gap-3'>
                {rightRanges.map((r) => (
                  <div key={r.id} className='border-t border-[#E4E4E7] pt-3'>
                    <div className='flex items-center justify-between'>
                      <div className='text-[12px] font-semibold text-[#3F3F46]'>{r.label}</div>
                      {rightRanges.length > 1 ? (
                        <button
                          type='button'
                          className='flex h-[28px] w-[28px] items-center justify-center rounded-[8px] text-[#A1A1AA] hover:bg-[#F4F4F5] hover:text-[#71717A]'
                          onClick={() => onRemoveRange(r.id)}
                          aria-label='delete-range'
                        >
                          <Trash2 className='h-4 w-4' />
                        </button>
                      ) : null}
                    </div>

                    <div className='mt-2 flex items-center gap-2'>
                      {/* 시작 페이지 컨트롤 */}
                      <button
                        type='button'
                        className='flex h-[28px] w-[28px] items-center justify-center rounded-[8px] border border-[#E4E4E7] bg-white text-[#18181B] hover:bg-[#F4F4F5]'
                        onClick={() => updateRange(r.id, { start: r.start - 1 })}
                        aria-label='start-minus'
                        disabled={r.start <= 1}
                      >
                        <Minus className='h-4 w-4' />
                      </button>
                      <input
                        value={String(r.start)}
                        onChange={(e) => updateRange(r.id, { start: e.target.value })}
                        inputMode='numeric'
                        className='h-[28px] w-[52px] rounded-[8px] border border-[#E4E4E7] bg-white text-center text-[12px] font-semibold text-[#18181B] outline-none focus:ring-1 focus:ring-[#93C5FD]'
                      />
                      <button
                        type='button'
                        className='flex h-[28px] w-[28px] items-center justify-center rounded-[8px] border border-[#E4E4E7] bg-white text-[#18181B] hover:bg-[#F4F4F5]'
                        onClick={() => updateRange(r.id, { start: r.start + 1 })}
                        aria-label='start-plus'
                        disabled={numPages ? r.start >= numPages : false}
                      >
                        <Plus className='h-4 w-4' />
                      </button>

                      <div className='px-1 text-[12px] font-semibold text-[#71717A]'>~</div>

                      {/* 종료 페이지 컨트롤 */}
                      <button
                        type='button'
                        className='flex h-[28px] w-[28px] items-center justify-center rounded-[8px] border border-[#E4E4E7] bg-white text-[#18181B] hover:bg-[#F4F4F5]'
                        onClick={() => updateRange(r.id, { end: r.end - 1 })}
                        aria-label='end-minus'
                        disabled={r.end <= r.start}
                      >
                        <Minus className='h-4 w-4' />
                      </button>
                      <input
                        value={String(r.end)}
                        onChange={(e) => updateRange(r.id, { end: e.target.value })}
                        inputMode='numeric'
                        className='h-[28px] w-[52px] rounded-[8px] border border-[#E4E4E7] bg-white text-center text-[12px] font-semibold text-[#18181B] outline-none focus:ring-1 focus:ring-[#93C5FD]'
                      />
                      <button
                        type='button'
                        className='flex h-[28px] w-[28px] items-center justify-center rounded-[8px] border border-[#E4E4E7] bg-white text-[#18181B] hover:bg-[#F4F4F5]'
                        onClick={() => updateRange(r.id, { end: r.end + 1 })}
                        aria-label='end-plus'
                        disabled={numPages ? r.end >= numPages : false}
                      >
                        <Plus className='h-4 w-4' />
                      </button>
                    </div>
                  </div>
                ))}

                <button
                  type='button'
                  className='mt-1 inline-flex h-[32px] w-fit items-center gap-2 rounded-[8px] border border-[#D4D4D8] bg-white px-3 text-[12px] font-semibold text-[#18181B] hover:bg-[#F4F4F5]'
                  onClick={onAddRange}
                >
                  <Plus className='h-4 w-4' />
                  범위 추가
                </button>
              </div>
            </div>

            <div className='mt-auto border-t border-[#E4E4E7] p-4'>
              <button
                type='button'
                className='h-[40px] w-full rounded-[12px] bg-[#69C0FF] text-[14px] font-semibold text-white hover:bg-[#1677FF] disabled:cursor-not-allowed disabled:bg-[#E4E4E7] disabled:text-[#A1A1AA]'
                onClick={() => {
                  if (!numPages) {
                    onMessageToast({ message: 'PDF를 불러온 뒤에 분리 범위를 설정해주세요.' });
                    return;
                  }
                  setIsNameModalOpen(true);
                }}
              >
                문서 분리
              </button>
            </div>
          </div>
        </div>

        <DocumentSplitNameModal
          isOpen={isNameModalOpen}
          ranges={ranges}
          initialNames={namesByRangeId}
          isSubmitting={isSplitting}
          onClose={() => {
            setIsNameModalOpen(false);
            setNamesByRangeId({});
          }}
          onSubmit={async (names) => {
            const docId = String(caseDocumentId ?? '').trim();
            if (!docId) {
              onMessageToast({ message: '문서 ID가 없어 분리를 진행할 수 없습니다.' });
              return;
            }
            if (!numPages) {
              onMessageToast({ message: 'PDF를 불러온 뒤에 분리 범위를 설정해주세요.' });
              return;
            }

            // 입력된 이름 저장
            setNamesByRangeId(names);

            const splits = ranges.map((r) => {
              const start = clampInt(r.start, 1, numPages);
              const end = clampInt(r.end, start, numPages);
              const fileName = String(names?.[r.id] ?? '').trim() || `문서 분리 ${r.id}`;
              return { type: 'range' as const, pages: `${start}-${end}`, file_name: fileName };
            });

            const res = await onSplitCivilCaseDocument({ case_document_id: docId, splits });
            if (!res || res.success === false) {
              const errMsg = String(res?.message ?? (res as any)?.error ?? '').trim() || '문서 분리에 실패했습니다.';
              // 실패 시 이름 지정 모달은 닫고, 에러 메시지만 토스트로 안내한다.
              setIsNameModalOpen(false);
              setNamesByRangeId({});
              onMessageToast({ message: errMsg });
              return;
            }

            onMessageToast({ message: '문서 분리가 완료되었습니다.' });
            setIsNameModalOpen(false);
            onClose();
          }}
        />
      </div>
    </div>,
    document.body,
  );
}
