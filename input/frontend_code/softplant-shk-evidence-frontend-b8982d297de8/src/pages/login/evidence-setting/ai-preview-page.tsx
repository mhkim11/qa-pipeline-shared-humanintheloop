import { useSearchParams } from 'react-router-dom';

import AIPage from '@/pages/login/evidence-setting/evidence-ai-view-page';

const AIPreviewPage = (): JSX.Element => {
  const [searchParams] = useSearchParams();

  return (
    <div className='h-[100vh] overflow-hidden'>
      <div className='ml-[5%] pt-[50px]'>
        <h1 className='text-2xl font-bold text-red-500'>****사용자 증거목록 미리보기</h1>
        <p className='text-sm text-gray-600'>프로젝트: {searchParams.get('project_name')}</p>
      </div>

      <AIPage />
    </div>
  );
};

export default AIPreviewPage;
