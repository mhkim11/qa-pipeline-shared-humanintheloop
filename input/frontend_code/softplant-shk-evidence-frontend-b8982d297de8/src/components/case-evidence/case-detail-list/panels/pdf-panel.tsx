import type { RefObject } from 'react';

import { ChevronLeft, ChevronRight, LayoutList, X } from 'lucide-react';
import { Document, Page } from 'react-pdf';

import { CaseDocumentEditor } from '@/components/case-evidence';
import CustomSpinner from '@/components/common/spiner';

type TPdfPanelProps = {
  // 상위 상태
  selectedDocument: any;
  isEditorOpen: boolean;
  editorData: string;
  setEditorData: (v: string) => void;
  setIsEditorOpen: (v: boolean) => void;

  // 우측 패널 토글
  isSelectionPanelOpen: boolean;
  setIsSelectionPanelOpen: (v: boolean) => void;
  isSelectionPanelButtonActive: boolean;
  setIsSelectionPanelButtonActive: (v: boolean) => void;

  // PDF
  pdfError: string | null;
  isViewCivilDocPending: boolean;
  numPages: number | null;
  visiblePageNumber: number;
  scrollToPage: (n: number) => void;

  pdfScrollContainerRef: RefObject<HTMLDivElement>;
  pdfViewportRef: RefObject<HTMLDivElement>;
  pageContainerRefs: { current: Record<number, HTMLDivElement | null> };
  activePageContainerRef: { current: HTMLDivElement | null };

  onDocumentLoadSuccess: (args: { numPages: number }) => void;
  onDocumentLoadError: (error: Error) => void;
  pdfOptions: any;
  pageWidth: number;

  // 오버레이 렌더링 props (로직은 부모에서 처리)
  renderOverlaysForPage: (pageNumber: number) => any;
  renderActionBar: () => any;

  // 드래그 오버레이
  isDragging: boolean;
  handleMouseDown: (e: any, pageNum: number) => void;

  // 우측 패널 노드 (카드 목록)
  renderRightPanel: () => any;
};

export default function PdfPanel({
  selectedDocument,
  isEditorOpen,
  // editorData,
  // setEditorData,

  isSelectionPanelOpen,
  setIsSelectionPanelOpen,
  isSelectionPanelButtonActive,
  setIsSelectionPanelButtonActive,
  pdfError,
  isViewCivilDocPending,
  numPages,
  visiblePageNumber,
  scrollToPage,
  pdfScrollContainerRef,
  pdfViewportRef,
  pageContainerRefs,
  activePageContainerRef,
  onDocumentLoadSuccess,
  onDocumentLoadError,
  pdfOptions,
  pageWidth,
  renderOverlaysForPage,
  renderActionBar,
  isDragging,
  handleMouseDown,
  renderRightPanel,
}: TPdfPanelProps) {
  const dragCursor =
    'url("data:image/svg+xml,%3Csvg%20xmlns%3D%27http%3A//www.w3.org/2000/svg%27%20width%3D%2748%27%20height%3D%2748%27%20viewBox%3D%270%200%2048%2048%27%3E%3Cline%20x1%3D%2724%27%20y1%3D%272%27%20x2%3D%2724%27%20y2%3D%2746%27%20stroke%3D%27%23111827%27%20stroke-width%3D%272%27/%3E%3Cline%20x1%3D%272%27%20y1%3D%2724%27%20x2%3D%2746%27%20y2%3D%2724%27%20stroke%3D%27%23111827%27%20stroke-width%3D%272%27/%3E%3Ccircle%20cx%3D%2724%27%20cy%3D%2724%27%20r%3D%273%27%20fill%3D%27none%27%20stroke%3D%27%23111827%27%20stroke-width%3D%272%27/%3E%3C/svg%3E") 24 24, crosshair';

  return (
    <div className='flex min-w-0 flex-1 overflow-hidden bg-[#E3EAF2]'>
      {/* 가운데: PDF/에디터 영역 */}
      <div className='flex min-w-0 flex-1 flex-col overflow-hidden'>
        {isEditorOpen ? (
          <CaseDocumentEditor />
        ) : selectedDocument ? (
          <div className='mr-[4px] flex h-full flex-col'>
            {/* PDF 뷰어 컨트롤 */}
            <div className='flex items-center justify-between border border-[#D4D4D8] bg-white px-4 py-2'>
              <div className='flex items-center gap-2'>
                <div className='text-sm font-medium text-gray-900'>{selectedDocument.title}</div>
              </div>
              <div className='flex items-center gap-2'>
                {selectedDocument && selectedDocument.pdfUrl ? (
                  <button
                    type='button'
                    onClick={() => {
                      setIsSelectionPanelOpen(true);
                      setIsSelectionPanelButtonActive(true);
                    }}
                    className={`rounded px-3 py-1 text-sm text-gray-700 hover:bg-[#e6e6e6] ${
                      isSelectionPanelButtonActive ? 'bg-[#f2f2f2]' : 'bg-transparent'
                    }`}
                  >
                    <LayoutList className='h-[18px] w-[18px] text-[#000]' />
                  </button>
                ) : null}

                <button
                  type='button'
                  className='rounded px-2 py-1 text-sm text-gray-600 hover:bg-gray-100'
                  onClick={() => {
                    setIsSelectionPanelOpen(false);
                    setIsSelectionPanelButtonActive(false);
                  }}
                >
                  <X className='h-[18px] w-[18px] text-[#000]' />
                </button>
              </div>
            </div>

            {/* PDF 컨텐츠 + 저장된영역 패널 (헤더 아래에서만 좌우 배치) */}
            <div className='flex min-h-0 flex-1 overflow-hidden'>
              {/* PDF 뷰어 */}
              <div className='relative min-w-0 flex-1 overflow-visible bg-[#E3EAF2]'>
                <div ref={pdfScrollContainerRef} className='evi-scrollbar-hide h-full overflow-auto p-4'>
                  <div ref={pdfViewportRef} className='mx-auto flex w-full justify-center'>
                    {selectedDocument.pdfUrl ? (
                      <div className='relative w-full overflow-visible'>
                        {pdfError ? (
                          <div className='flex h-[800px] items-center justify-center'>
                            <div className='text-center'>
                              <p className='text-lg font-medium text-red-500'>PDF를 불러올 수 없습니다</p>
                              <p className='mt-2 text-sm text-gray-500'>{pdfError}</p>
                            </div>
                          </div>
                        ) : (
                          <Document
                            key={selectedDocument.pdfUrl}
                            file={selectedDocument.pdfUrl}
                            onLoadSuccess={onDocumentLoadSuccess}
                            onLoadError={onDocumentLoadError}
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
                            options={pdfOptions}
                          >
                            {numPages
                              ? Array.from({ length: numPages }, (_, idx) => idx + 1).map((n) => (
                                  <div
                                    key={`page-wrap-${n}`}
                                    data-page-number={n}
                                    ref={(el) => {
                                      pageContainerRefs.current[n] = el;
                                      if (n === 1 && !activePageContainerRef.current && el) {
                                        activePageContainerRef.current = el;
                                      }
                                    }}
                                    className='relative mb-6 inline-block'
                                    style={{ cursor: dragCursor }}
                                  >
                                    <Page
                                      key={`page-${n}-${pageWidth}`}
                                      pageNumber={n}
                                      width={pageWidth}
                                      loading={null}
                                      renderMode='canvas'
                                      renderTextLayer={true}
                                      renderAnnotationLayer={false}
                                    />

                                    {/* 드래그 오버레이 */}
                                    <div
                                      className='absolute inset-0'
                                      onMouseDown={(e) => handleMouseDown(e, n)}
                                      style={{
                                        zIndex: 10,
                                        pointerEvents: isDragging ? 'none' : 'auto',
                                        backgroundColor: 'transparent',
                                        cursor: dragCursor,
                                      }}
                                    />

                                    {/* 하이라이트/드래그/보더 등 오버레이 */}
                                    {renderOverlaysForPage(n)}
                                  </div>
                                ))
                              : null}
                          </Document>
                        )}
                      </div>
                    ) : isViewCivilDocPending ? (
                      <div className='flex h-[800px] items-center justify-center'>
                        <div className='flex flex-col items-center gap-2 text-[#8A8A8E]'>
                          <div className='flex h-[16px] w-[16px] scale-[0.7] items-center justify-center'>
                            <CustomSpinner size='sm' />
                          </div>
                          <div className='text-[13px] font-medium'>pdf 문서 로딩중</div>
                        </div>
                      </div>
                    ) : (
                      <div className='flex h-[800px] items-center justify-center'>
                        <div className='text-gray-500'>PDF URL이 설정되지 않았습니다</div>
                      </div>
                    )}
                  </div>
                </div>

                {/* 페이지바 */}
                {selectedDocument?.pdfUrl && numPages ? (
                  <div className='pointer-events-none absolute bottom-[5%] left-1/2 z-50 -translate-x-1/2'>
                    <div className='pointer-events-auto flex w-fit items-center gap-2 rounded-full border border-gray-200 bg-white/95 px-3 py-2 shadow-lg backdrop-blur'>
                      <button
                        type='button'
                        onClick={() => scrollToPage(visiblePageNumber - 1)}
                        disabled={visiblePageNumber <= 1}
                        className='inline-flex h-8 w-8 items-center justify-center rounded-full border border-gray-200 bg-white text-gray-700 hover:bg-gray-50 disabled:cursor-not-allowed disabled:opacity-40'
                        title='이전 페이지'
                      >
                        <ChevronLeft className='h-[18px] w-[18px]' />
                      </button>
                      <div className='min-w-[78px] text-center text-sm font-medium text-gray-800'>
                        {visiblePageNumber} / {numPages}
                      </div>
                      <button
                        type='button'
                        onClick={() => scrollToPage(visiblePageNumber + 1)}
                        disabled={visiblePageNumber >= numPages}
                        className='inline-flex h-8 w-8 items-center justify-center rounded-full border border-gray-200 bg-white text-gray-700 hover:bg-gray-50 disabled:cursor-not-allowed disabled:opacity-40'
                        title='다음 페이지'
                      >
                        <ChevronRight className='h-[18px] w-[18px]' />
                      </button>
                    </div>
                  </div>
                ) : null}

                {/* 액션바 (fixed overlay) */}
                {renderActionBar()}
              </div>

              {/* 우측 패널 */}
              {isSelectionPanelOpen ? renderRightPanel() : null}
            </div>
          </div>
        ) : (
          <div className='flex h-full items-center justify-center'>
            <div className='text-center'>
              <p className='text-lg font-medium text-gray-500'>문서를 선택해주세요</p>
              <p className='mt-2 text-sm text-gray-400'>왼쪽 목록에서 문서를 클릭하면 여기에 표시됩니다</p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
