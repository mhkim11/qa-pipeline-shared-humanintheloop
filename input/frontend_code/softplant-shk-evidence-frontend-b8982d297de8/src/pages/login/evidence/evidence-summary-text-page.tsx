import { useEffect, useState } from 'react';

import { useParams, useSearchParams } from 'react-router-dom';

import { useViewDocument } from '@query/mutation';
import CustomSpinner from '@components/common/spiner';

const EvidenceViewer = () => {
  const { evidenceId } = useParams(); // URL에서 evidenceId 가져오기
  const [searchParams] = useSearchParams(); // 쿼리 파라미터 가져오기
  const projectId = searchParams.get('projectId'); // projectId 값 가져오기
  const evidenceName = searchParams.get('evidenceName') || '텍스트 문서';
  const officeId = searchParams.get('officeId');
  const { onViewDocument } = useViewDocument();
  const [loading, setLoading] = useState(true); // 로딩 상태
  const [textContent, setTextContent] = useState<string>('');
  useEffect(() => {
    const fetchText = async () => {
      if (!evidenceId || !projectId) {
        setLoading(false);
        return;
      }

      try {
        const input = {
          office_id: officeId || '',
          project_id: projectId,
          evidence_id: evidenceId,
          doc_type: 'summary',
        };

        const textBlob = await onViewDocument(input);
        if (textBlob) {
          // Blob에서 텍스트를 추출하여 상태에 저장
          const text = await textBlob.text();
          setTextContent(text);
        }
      } catch (error) {
        console.error('텍스트 로딩 실패:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchText();
  }, [evidenceId, projectId, onViewDocument, officeId]);

  return (
    <div className='flex h-screen w-full items-center justify-center'>
      {loading ? (
        <div className='flex items-center justify-center'>
          <CustomSpinner />
        </div>
      ) : textContent ? (
        <div className='mx-auto flex h-full w-full justify-center'>
          <div className='mx-auto h-full w-full max-w-4xl p-6'>
            <h1 className='mb-4 text-[18px] font-bold text-[#252525]'>{decodeURIComponent(evidenceName)}</h1>
            <div className='h-[calc(100%-60px)] overflow-auto bg-white'>
              {/* 텍스트 줄바꿈과 공백을 보존하여 표시 */}
              <pre className='whitespace-pre-wrap font-sans text-[16px] leading-relaxed text-[#666]'>{textContent}</pre>
            </div>
          </div>
        </div>
      ) : (
        <div className='flex h-full w-full items-center justify-center'>
          <p className='text-center text-[18px] font-bold text-[#000]'>TEXT파일을 로드할 수 없습니다.</p>
        </div>
      )}
    </div>
  );
};

export default EvidenceViewer;
