import { useEffect, useState, useRef } from 'react';

import { useParams, useSearchParams } from 'react-router-dom';

import CustomSpinner from '@components/common/spiner';
import { useAdminViewAdminDocument } from '@/hooks/react-query';

const AdminTxtViewer = () => {
  const [searchParams] = useSearchParams();
  const projectId = searchParams.get('projectId');
  const { evidenceId } = useParams();
  const { onAdminViewDocument } = useAdminViewAdminDocument();

  const [loading, setLoading] = useState(true);

  const officeId = searchParams.get('officeId');
  const [textContent, setTextContent] = useState<string>('');
  // API 호출 제어를 위한 ref
  const apiCallMadeRef = useRef(false);
  const textContentRef = useRef<string | null>(null);
  useEffect(() => {
    const fetchText = async () => {
      if (apiCallMadeRef.current || !evidenceId || !projectId) {
        setLoading(false);
        return;
      }

      if (textContentRef.current) {
        setTextContent(textContentRef.current);
        setLoading(false);
        return;
      }

      try {
        const input = {
          office_id: officeId || '',
          project_id: projectId,
          evidence_id: evidenceId,
          doc_type: 'text',
        };

        apiCallMadeRef.current = true;
        const textBlob = await onAdminViewDocument(input);

        if (textBlob) {
          const text = await textBlob.text();
          textContentRef.current = text;
          setTextContent(text);
        }
      } catch (error) {
        console.error('텍스트 로딩 실패:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchText();

    return () => {
      apiCallMadeRef.current = false;
      textContentRef.current = null;
    };
  }, [evidenceId, projectId, officeId]); //eslint-disable-line

  return (
    <div className='flex h-screen w-full items-center justify-center'>
      {loading ? (
        <div className='flex items-center justify-center'>
          <CustomSpinner />
        </div>
      ) : textContent ? (
        <div className='mx-auto flex h-full w-full justify-center'>
          <div className='mx-auto h-full w-full max-w-4xl p-6'>
            <div className='h-[calc(100%-60px)] overflow-auto bg-white'>
              <pre className='whitespace-pre-wrap font-sans text-[16px] leading-relaxed text-[#666]'>{textContent}</pre>
            </div>
          </div>
        </div>
      ) : (
        <p>PDF를 로드할 수 없습니다.</p>
      )}
    </div>
  );
};

export default AdminTxtViewer;
