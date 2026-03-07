import { useEffect, useState, useRef } from 'react';

import { useParams, useSearchParams } from 'react-router-dom';

import CustomSpinner from '@components/common/spiner';
import { useAdminViewAdminDocument } from '@/hooks/react-query';

const AdminViewer = () => {
  const [searchParams] = useSearchParams();
  const projectId = searchParams.get('projectId');
  const { evidenceId } = useParams();
  const { onAdminViewDocument } = useAdminViewAdminDocument();
  const pdfUrlRef = useRef<string | null>(null);
  const shouldPrint = searchParams.get('print') === 'true';
  const [loading, setLoading] = useState(true);
  const iframeRef = useRef<HTMLIFrameElement>(null);
  const [pdfLoaded, setPdfLoaded] = useState(false);
  const officeId = searchParams.get('officeId');

  const apiCallMadeRef = useRef(false);
  useEffect(() => {
    const fetchPdf = async () => {
      // 이미 API 호출이 완료되었거나 필요한 파라미터가 없는 경우 리턴
      if (apiCallMadeRef.current || !evidenceId || !projectId) {
        setLoading(false);
        return;
      }

      // 이미 PDF URL이 있는 경우 리턴
      if (pdfUrlRef.current) {
        setLoading(false);
        return;
      }

      try {
        const input = {
          office_id: officeId || '',
          project_id: projectId || '',
          evidence_id: evidenceId || '',
          doc_type: 'pdf',
        };

        apiCallMadeRef.current = true; // API 호출 시작 전에 플래그 설정
        const pdfBlob = await onAdminViewDocument(input);

        if (pdfBlob) {
          pdfUrlRef.current = URL.createObjectURL(pdfBlob);
          setLoading(false);
        }
      } catch (error) {
        console.error('PDF 로딩 실패:', error);
        setLoading(false);
      }
    };

    fetchPdf();

    // cleanup 함수
    return () => {
      apiCallMadeRef.current = false;
      if (pdfUrlRef.current) {
        URL.revokeObjectURL(pdfUrlRef.current);
        pdfUrlRef.current = null;
      }
    };
  }, [evidenceId, projectId, officeId]); //eslint-disable-line
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

export default AdminViewer;
