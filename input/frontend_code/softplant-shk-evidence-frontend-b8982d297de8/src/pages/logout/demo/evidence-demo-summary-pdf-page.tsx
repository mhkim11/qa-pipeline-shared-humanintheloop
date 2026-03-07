import { useEffect, useState, useRef } from 'react';

import { useParams, useSearchParams } from 'react-router-dom';

import { useViewDocumentDemo } from '@query/mutation';
import CustomSpinner from '@components/common/spiner';

const EvidenceDemoSummaryPdfPage = () => {
  const [searchParams] = useSearchParams();
  const projectId = searchParams.get('projectId');
  const { evidenceId } = useParams();
  const { onViewDocument } = useViewDocumentDemo();
  const pdfUrlRef = useRef<string | null>(null);
  const shouldPrint = searchParams.get('print') === 'true';
  const [loading, setLoading] = useState(true);
  const iframeRef = useRef<HTMLIFrameElement>(null);
  const [pdfLoaded, setPdfLoaded] = useState(false);
  const officeId = searchParams.get('officeId');
  console.log('evidenceId: ', evidenceId);
  console.log('projectId: ', projectId);
  console.log('officeId: ', officeId);

  useEffect(() => {
    const fetchPdf = async () => {
      if (!evidenceId || !projectId || pdfUrlRef.current) {
        setLoading(false);
        return;
      }

      try {
        const input = {
          office_id: officeId || '',
          project_id: projectId || '',
          evidence_id: evidenceId || '',
          doc_type: 'summary_pdf',
        };
        const pdfBlob = await onViewDocument(input);
        console.log('pdfBlob', pdfBlob);
        if (pdfBlob) {
          const blob = new Blob([pdfBlob], { type: 'application/pdf' }); // 타입 명시
          pdfUrlRef.current = URL.createObjectURL(blob);
          setLoading(false);
        }
      } catch (error) {
        console.error('PDF 로딩 실패:', error);
        setLoading(false);
      }
    };

    fetchPdf();
    return () => {
      if (pdfUrlRef.current) {
        URL.revokeObjectURL(pdfUrlRef.current);
        pdfUrlRef.current = null;
      }
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [evidenceId, projectId, officeId]);

  // PDF 로드 완료 후 인쇄 처리를 위한 별도 useEffect
  useEffect(() => {
    if (!loading && pdfLoaded && shouldPrint && iframeRef.current?.contentWindow) {
      setTimeout(() => {
        iframeRef.current?.contentWindow?.print();
      }, 500);
    }
  }, [loading, pdfLoaded, shouldPrint]);

  const handleIframeLoad = () => {
    setPdfLoaded(true);
  };

  return (
    <div className='flex h-screen w-full items-center justify-center'>
      {loading ? (
        <div className='flex items-center justify-center'>
          <CustomSpinner />
        </div>
      ) : pdfUrlRef.current ? (
        <iframe
          ref={iframeRef}
          src={pdfUrlRef.current}
          width='100%'
          height='100%'
          title='Evidence PDF Viewer'
          onLoad={handleIframeLoad}
          style={{ opacity: pdfLoaded ? 1 : 0, transition: 'opacity 0.3s ease-in-out' }}
        />
      ) : (
        <p>PDF를 로드할 수 없습니다.</p>
      )}
    </div>
  );
};

export default EvidenceDemoSummaryPdfPage;
