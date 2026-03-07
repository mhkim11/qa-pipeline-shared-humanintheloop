import { useRef, useEffect } from 'react';

import { useSearchParams } from 'react-router-dom';

import { EvidenceTable } from '@components/evidence/table/evidence-preview-table';
import { useLoginStore } from '@/hooks/stores';

const EvidencePreviewPage = (): JSX.Element => {
  const [searchParams] = useSearchParams();
  const { login } = useLoginStore();

  const handlerRefs = useRef<{
    authorityHandler?: () => void;
    settingHandler?: () => void;
    historyHandler?: () => void;
    aiHandler?: () => void;
  }>({});

  // 세션 체크
  useEffect(() => {
    // 로그인 상태 확인
    if (!login?.data?.accessToken) {
      console.log('세션이 만료되었습니다. 로그인 페이지로 이동합니다.');
      window.location.href = '/';
      return;
    }

    // 어드민 권한 확인
    if (login?.data?.user?.role !== 'ADMIN') {
      console.log('어드민 권한이 필요합니다.');
      window.location.href = '/';
      return;
    }

    // 디버깅: URL 파라미터 확인
    console.log('EvidencePreviewPage - project_id:', searchParams.get('project_id'));
    console.log('EvidencePreviewPage - project_name:', searchParams.get('project_name'));
  }, [login, searchParams]);

  return (
    <div className='min-h-screen'>
      <div className='ml-[5%] pt-[50px]'>
        <h1 className='text-2xl font-bold text-red-500'>****사용자 증거목록 미리보기</h1>
        <p className='text-sm text-gray-600'>프로젝트: {searchParams.get('project_name')}</p>
      </div>

      <EvidenceTable registerHandlers={(handlers) => Object.assign(handlerRefs.current, handlers)} />
    </div>
  );
};

export default EvidencePreviewPage;
