import { useEffect, useMemo, useState } from 'react';

import { useSearchParams } from 'react-router-dom';

import ClientRequestListPanel from '@/components/case-evidence/request-list/panels/client-request-list-panel';
import ClientRequestDetailPanel from '@/components/case-evidence/request-list/panels/clientrequest-detail-panel';

const EvidenceRequestPage = (): JSX.Element => {
  const [searchParams] = useSearchParams();
  const civilCaseId = useMemo(() => {
    // 고객용 진입: /evidence-request?civil_case_id=ccase_XXXX
    return String(searchParams.get('civil_case_id') ?? searchParams.get('civilCaseId') ?? '').trim();
  }, [searchParams]);
  const clientEmail = useMemo(() => {
    // (detail endpoint 호환) 아직 상세가 email을 요구하는 경우가 있어 유지
    return String(searchParams.get('client_email') ?? searchParams.get('email') ?? '').trim();
  }, [searchParams]);

  const [selectedRequestId, setSelectedRequestId] = useState<string | null>(null);

  const initialRequestId = useMemo(() => {
    return String(searchParams.get('request_id') ?? searchParams.get('requestId') ?? '').trim();
  }, [searchParams]);

  useEffect(() => {
    if (!initialRequestId) return;
    setSelectedRequestId(initialRequestId);
  }, [initialRequestId]);

  return (
    <div className='flex h-screen min-h-0 flex-col overflow-hidden bg-[#f4f4f5] pt-[50px]'>
      <div className='flex min-h-0 flex-1 overflow-hidden'>
        <div className='flex min-h-0 w-[520px] min-w-[420px] flex-col overflow-hidden bg-white'>
          <ClientRequestListPanel
            items={[]}
            civilCaseId={civilCaseId}
            selectedRequestId={selectedRequestId}
            onSelectRequest={(req: any) => {
              const id = String(req?.request_id ?? '').trim();
              if (id) setSelectedRequestId(id);
            }}
          />
        </div>

        <div className='min-h-0 min-w-0 flex-1 overflow-hidden bg-[#E3EAF2]'>
          <ClientRequestDetailPanel requestId={selectedRequestId} clientEmail={clientEmail} request={null} />
        </div>
      </div>
    </div>
  );
};

export default EvidenceRequestPage;
