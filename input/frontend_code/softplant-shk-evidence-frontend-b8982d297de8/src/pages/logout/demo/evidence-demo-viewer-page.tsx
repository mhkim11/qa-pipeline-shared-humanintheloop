import { useEffect, useState, useRef, useMemo, useCallback } from 'react';

import { Resizable } from 're-resizable';
import Draggable from 'react-draggable';
import { IoMdClose, IoIosSearch, IoIosMove } from 'react-icons/io';
import { useParams, useSearchParams } from 'react-router-dom';

import { useViewDocumentDemo } from '@query/mutation';
import CustomSpinner from '@components/common/spiner';

const EvidenceDemoViewerPage = () => {
  const { evidenceId } = useParams();
  const [searchParams] = useSearchParams();
  const projectId = searchParams.get('projectId');
  const officeId = searchParams.get('officeId');

  const { onViewDocument } = useViewDocumentDemo();
  const pdfUrlRef = useRef<string | null>(null);
  const googleViewerUrlRef = useRef<string | null>(null); // 모바일용 Google Docs Viewer URL
  const shouldPrint = searchParams.get('print') === 'true';
  const [loading, setLoading] = useState(true);
  const iframeRef = useRef<HTMLIFrameElement>(null);
  const [pdfLoaded, setPdfLoaded] = useState(false);
  const printAttempted = useRef(false);
  const pdfLoadingTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  const [showTextModal, setShowTextModal] = useState(false);
  const [textContent, setTextContent] = useState('');
  const [textLoading, setTextLoading] = useState(false);
  const [showPdf, setShowPdf] = useState(false);
  const apiCallMadeRef = useRef(false);

  // 모바일 감지 (갤럭시 탭 포함)
  const isMobile = useMemo(() => {
    const userAgent = navigator.userAgent;
    const isAndroid = /Android/i.test(userAgent);
    const isTablet = /Tablet|iPad/i.test(userAgent) || (isAndroid && !/Mobile/i.test(userAgent));
    const isMobileDevice = /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(userAgent);
    // 갤럭시 탭은 Android이지만 Mobile이 아닐 수 있으므로 별도 처리
    return isMobileDevice || isTablet;
  }, []);
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
    if (apiCallMadeRef.current || !evidenceId || !projectId) {
      setLoading(false);
      return;
    }

    // PDF URL이 이미 있으면 리턴
    if (pdfUrlRef.current || googleViewerUrlRef.current) {
      setLoading(false);
      setShowPdf(true);
      return;
    }

    try {
      const input = {
        office_id: officeId || '',
        project_id: projectId,
        evidence_id: evidenceId,
        doc_type: 'pdf',
      };

      apiCallMadeRef.current = true;

      // DEMO: /evidences/demo/document 로 blob을 받아 iframe에서 그대로 렌더링
      const pdfBlob = await onViewDocument(input);
      if (pdfBlob) {
        pdfUrlRef.current = URL.createObjectURL(pdfBlob);
        setLoading(false);
        setShowPdf(true);
      }
    } catch (error) {
      console.error('PDF 로딩 실패:', error);
      setLoading(false);
    }
  }, [evidenceId, projectId, officeId, onViewDocument]);
  useEffect(() => {
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
  }, []); //eslint-disable-line
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
    if (!evidenceId || !projectId) return;
    setShowTextModal(true);
    setTextLoading(true);
    try {
      const input = {
        office_id: officeId || '',
        project_id: projectId,
        evidence_id: evidenceId,
        doc_type: 'text',
      };
      const textBlob = await onViewDocument(input);
      if (textBlob) {
        const text = await textBlob.text();
        setTextContent(text);
        setShowTextModal(true);
      }
    } catch (error) {
      console.error('텍스트 로딩 실패:', error);
    } finally {
      setTextLoading(false);
    }
  };

  // ✨ 여기가 깜빡임 방지 핵심
  const iframeComponent = useMemo(() => {
    if (showPdf && (pdfUrlRef.current || googleViewerUrlRef.current)) {
      // 모바일에서는 서버 URL을 직접 사용 (Google Docs Viewer는 사용하지 않음)
      // PC에서는 blob URL 사용
      const srcUrl = pdfUrlRef.current || googleViewerUrlRef.current || '';
      console.log('iframe src 설정:', { srcUrl, isMobile, pdfUrl: pdfUrlRef.current, googleUrl: googleViewerUrlRef.current });
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
            // 모바일에서 서버 URL 실패 시 blob URL로 폴백
            if (isMobile && pdfUrlRef.current && iframeRef.current) {
              console.log('서버 URL 실패, blob URL로 폴백 시도');
              // blob URL 폴백은 fetchPdf에서 처리됨
            }
          }}
          style={{
            border: 'none',
            backgroundColor: 'white',
            visibility: pdfLoaded || isMobile ? 'visible' : 'hidden', // 모바일에서는 즉시 표시
          }}
          allow='fullscreen'
        />
      );
    }
    return null;
  }, [showPdf, pdfLoaded, isMobile]);

  return (
    <div className='flex h-screen w-full items-center justify-center bg-white'>
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
                          {textContent.split('\n').map((line, index) => (
                            <p key={index} className='mb-2'>
                              {line}
                            </p>
                          ))}
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

export default EvidenceDemoViewerPage;
