import { useMemo } from 'react';

import { useParams, useSearchParams } from 'react-router-dom';

import CaseDetailListTable from '@/components/case-evidence/case-detail-list/table/case-detail-list-table';

export default function CaseTapPage(): JSX.Element {
  const { evidenceId } = useParams();
  const [searchParams] = useSearchParams();

  const civilCaseId = searchParams.get('civilCaseId');
  const title = searchParams.get('title') ?? '문서보기';

  const initialCaseDocumentId = useMemo(() => {
    const raw = String(evidenceId ?? '').trim();
    return raw || null;
  }, [evidenceId]);

  return (
    <CaseDetailListTable
      title={title}
      civilCaseId={civilCaseId}
      initialCaseDocumentId={initialCaseDocumentId}
      hideLeftPanel
      onExitToMainList={() => {
        // 새탭으로 열린 페이지이므로 닫기 시도. (브라우저 정책상 막히면 그대로 유지)
        window.close();
      }}
    />
  );
}
