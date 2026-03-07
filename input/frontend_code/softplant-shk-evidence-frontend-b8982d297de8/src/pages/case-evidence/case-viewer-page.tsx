import { useEffect, useState, useRef, useMemo, useCallback } from 'react';

import { Resizable } from 're-resizable';
import Draggable from 'react-draggable';
import { IoMdClose, IoIosSearch, IoIosMove } from 'react-icons/io';
import { useParams, useSearchParams } from 'react-router-dom';

import CustomSpinner from '@components/common/spiner';
import { fetchGetDocumentContent } from '@/apis/case-api/civil-case-api';
import { useViewCivilCaseDocument } from '@/hooks/react-query/mutation/case/use-view-civil-case-document';

const EvidenceViewer = () => {
  const { evidenceId } = useParams();
  const [searchParams] = useSearchParams();
  const projectId = searchParams.get('projectId');
  const civilCaseId = searchParams.get('civilCaseId');
  const docType = (searchParams.get('docType') as 'pdf' | 'text' | null) ?? 'pdf';

  const { onViewCivilCaseDocument } = useViewCivilCaseDocument();
  const pdfUrlRef = useRef<string | null>(null);
  const shouldPrint = searchParams.get('print') === 'true';
  const [loading, setLoading] = useState(true);
  const iframeRef = useRef<HTMLIFrameElement>(null);
  const [pdfLoaded, setPdfLoaded] = useState(false);
  const printAttempted = useRef(false);
  const pdfLoadingTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  const [showTextModal, setShowTextModal] = useState(false);
  const [textContent, setTextContent] = useState('');
  const [textPages, setTextPages] = useState<Array<{ page_number: number; description: string }> | null>(null);
  const [textLoading, setTextLoading] = useState(false);
  const [showPdf, setShowPdf] = useState(false);
  const apiCallMadeRef = useRef(false);

  // NOTE: 기존 모바일 처리 로직은 민사 문서(/case-document/document)에서는 사용하지 않음
  useEffect(() => {
    const handlePopState = (event: PopStateEvent) => {
      event.preventDefault();
      const confirmLeave = window.confirm('페이지를 떠나시겠습니까?');
      if (!confirmLeave) {
        window.history.pushState(null, '', window.location.href);
      } else {
        window.close();
      }
    };
    window.history.pushState(null, '', window.location.href);
    window.addEventListener('popstate', handlePopState);
    return () => {
      window.removeEventListener('popstate', handlePopState);
    };
  }, []);

  const fetchPdf = useCallback(async () => {
    if (apiCallMadeRef.current || !evidenceId || !projectId || !civilCaseId) {
      setLoading(false);
      return;
    }

    // PDF URL이 이미 있으면 리턴
    if (pdfUrlRef.current) {
      setLoading(false);
      setShowPdf(true);
      return;
    }

    try {
      apiCallMadeRef.current = true;
      const blob = await onViewCivilCaseDocument({
        project_id: projectId,
        civil_case_id: civilCaseId,
        case_document_id: evidenceId,
        doc_type: docType,
      });

      if (!blob) {
        setLoading(false);
        return;
      }

      pdfUrlRef.current = URL.createObjectURL(blob);
      setLoading(false);
      setShowPdf(true);
    } catch (error) {
      console.error('PDF 로딩 실패:', error);
      setLoading(false);
    }
  }, [civilCaseId, docType, evidenceId, onViewCivilCaseDocument, projectId]);
  useEffect(() => {
    // params가 바뀌면 재호출 가능하게 리셋
    apiCallMadeRef.current = false;
    fetchPdf();

    // cleanup 함수
    return () => {
      if (pdfLoadingTimeoutRef.current) {
        clearTimeout(pdfLoadingTimeoutRef.current);
      }
      if (pdfUrlRef.current) {
        URL.revokeObjectURL(pdfUrlRef.current);
      }
      apiCallMadeRef.current = false;
    };
  }, [fetchPdf]);
  const handleIframeLoad = () => {
    setPdfLoaded(true);
    if (iframeRef.current) {
      iframeRef.current.style.visibility = 'visible';
    }
  };

  useEffect(() => {
    if (pdfLoaded && shouldPrint && !printAttempted.current) {
      printAttempted.current = true;
      const printTimeout = setTimeout(() => {
        try {
          if (iframeRef.current?.contentWindow) {
            iframeRef.current.contentWindow.print();
          }
        } catch (error) {
          console.error('인쇄 실행 오류:', error);
        }
      }, 1500);
      pdfLoadingTimeoutRef.current = printTimeout;
    }
  }, [pdfLoaded, shouldPrint]);

  const fetchTextDocument = async () => {
    if (!evidenceId || !projectId || !civilCaseId) return;
    setShowTextModal(true);
    setTextLoading(true);
    try {
      // 1) Prefer document-list cached content (no extra API; same as "문서 리스트 content")
      try {
        const key = `evi:civil:quicksearch:${civilCaseId}:${evidenceId}`;
        const cachedRaw = localStorage.getItem(key);
        if (cachedRaw) {
          const cached = JSON.parse(cachedRaw);
          const arr = Array.isArray(cached?.content) ? cached.content : null;
          if (Array.isArray(arr) && arr.length > 0) {
            setTextPages(
              arr
                .map((c: any) => ({ page_number: Number(c?.page_number ?? c?.pageNumber ?? 0), description: String(c?.description ?? '') }))
                .filter((c: any) => Number.isFinite(c.page_number) && c.page_number > 0),
            );
            setTextContent('');
            setShowTextModal(true);
            return;
          }
        }
      } catch {
        // ignore
      }

      // 2) Fallback: fetch from API (direct URL open, cache miss, etc.)
      const res = await fetchGetDocumentContent(civilCaseId, evidenceId);
      const content = (res as any)?.content ?? (res as any)?.data?.content ?? (res as any)?.data ?? null;
      const pages = Array.isArray(content)
        ? content
            .map((c: any) => ({ page_number: Number(c?.page_number ?? c?.pageNumber ?? 0), description: String(c?.description ?? '') }))
            .filter((c: any) => Number.isFinite(c.page_number) && c.page_number > 0)
        : [];
      if (pages.length > 0) {
        setTextPages(pages);
        setTextContent('');
      } else {
        setTextPages(null);
        setTextContent('텍스트 내용이 없습니다.');
      }
      setShowTextModal(true);
    } catch (error) {
      console.error('텍스트 로딩 실패:', error);
    } finally {
      setTextLoading(false);
    }
  };

  // ✨ 여기가 깜빡임 방지 핵심
  const iframeComponent = useMemo(() => {
    if (showPdf && pdfUrlRef.current) {
      const srcUrl = pdfUrlRef.current || '';
      return (
        <iframe
          ref={iframeRef}
          src={srcUrl}
          width='100%'
          height='100%'
          title='Evidence PDF Viewer'
          onLoad={handleIframeLoad}
          onError={(e) => {
            console.error('iframe 로드 오류:', e);
          }}
          style={{
            border: 'none',
            backgroundColor: '#E3EAF2',
            visibility: pdfLoaded ? 'visible' : 'hidden',
          }}
          allow='fullscreen'
        />
      );
    }
    return null;
  }, [showPdf, pdfLoaded]);

  return (
    <div className='flex h-screen w-full items-center justify-center bg-[#E3EAF2]'>
      {loading ? (
        <div className='flex items-center justify-center'>
          <CustomSpinner />
        </div>
      ) : (
        <div className='h-full w-full'>
          <div className='absolute right-[30%] top-2 z-10 flex items-center'>
            <button
              type='button'
              className='flex h-[40px] items-center justify-center gap-2 rounded-[8px] bg-[#1890FF] px-[16px] text-white'
              onClick={fetchTextDocument}
            >
              <IoIosSearch className='text-xl text-white' />
              간편검색
            </button>
          </div>

          {/* ✨ iframe 고정 */}
          {iframeComponent}

          {/* 로딩 중일 때 스피너 */}
          {showPdf && !pdfLoaded && (
            <div className='absolute inset-0 flex items-center justify-center'>
              <CustomSpinner />
            </div>
          )}

          {/* 텍스트 모달 */}
          {showTextModal && (
            <div className='pointer-events-none fixed inset-0 z-50 flex items-center justify-center'>
              {textLoading ? (
                <div className='pointer-events-auto flex h-full w-full items-center justify-center'>
                  <CustomSpinner />
                </div>
              ) : (
                <Draggable handle='.drag-handle' bounds='parent'>
                  <Resizable
                    defaultSize={{
                      width: '60%',
                      height: '70%',
                    }}
                    minWidth='300px'
                    minHeight='200px'
                    maxWidth='90%'
                    maxHeight='90%'
                    style={{
                      background: 'white',
                      borderRadius: '16px',
                      overflow: 'hidden',
                      boxShadow: '0 0 10px rgba(0,0,0,0.2)',
                      pointerEvents: 'auto',
                    }}
                  >
                    <div className='flex h-full flex-col'>
                      <div className='drag-handle flex cursor-move items-center justify-between pl-[32px] pr-[32px] pt-[32px]'>
                        <div className='text-[24px] font-bold text-[#212121]'>간편검색</div>
                        <div className='flex items-center gap-2'>
                          <IoIosMove className='text-[20px] font-bold text-[#5B5B5B]' />
                          <button onClick={() => setShowTextModal(false)} className='text-[24px] text-[#5B5B5B]'>
                            <IoMdClose />
                          </button>
                        </div>
                      </div>
                      <div className='pl-[32px] pt-[8px] text-[16px] text-[#1890FF]'>Ctrl + F 또는 Cmd + F를 눌러 검색하세요.</div>
                      <div className='flex-1 overflow-auto pl-[32px] pr-[32px] pt-[10px]'>
                        <div className='border p-[14px]'>
                          {Array.isArray(textPages) && textPages.length > 0 ? (
                            <div className='flex flex-col gap-4'>
                              {textPages.map((p) => (
                                <div key={p.page_number} className='flex flex-col gap-2'>
                                  <div className='text-[14px] font-bold text-[#212121]'>{`PDF ${p.page_number} 페이지`}</div>
                                  <div className='whitespace-pre-wrap break-words text-[14px] text-[#212121]'>{p.description}</div>
                                </div>
                              ))}
                            </div>
                          ) : (
                            textContent.split('\n').map((line, index) => (
                              <p key={index} className='mb-2'>
                                {line}
                              </p>
                            ))
                          )}
                        </div>
                      </div>
                    </div>
                  </Resizable>
                </Draggable>
              )}
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default EvidenceViewer;
