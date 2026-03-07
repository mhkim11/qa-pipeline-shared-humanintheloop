import { useNavigate, useSearchParams } from 'react-router-dom';

import { DocumentEditorView } from '@/components/case-evidence/case-detail-list/case-document-editor';

/**
 * * 서면 작성 에디터 페이지
 * @returns JSX.Element
 */
const CaseDocumentEditorPage = (): JSX.Element => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();

  const handleBack = () => {
    const preserved = new URLSearchParams();
    for (const key of ['civil_case_id', 'project_id', 'project_name', 'client_name'] as const) {
      const value = searchParams.get(key);
      if (value) preserved.set(key, value);
    }
    preserved.set('tab', 'editor');
    const qs = preserved.toString();
    navigate(`/case-list${qs ? `?${qs}` : ''}`, { replace: false });
  };

  return (
    <div className='flex h-screen w-full flex-col bg-[#f4f4f5]'>
      <DocumentEditorView onBack={handleBack} />
    </div>
  );
};

export default CaseDocumentEditorPage;
