import { useEffect, useMemo, useState } from 'react';

import ReactDOM from 'react-dom';
import * as XLSX from 'xlsx';

import { fetchListEvidence } from '@/apis/evidence-api';
import CustomSpinner from '@/components/common/spiner';
import { onMessageToast } from '@/components/utils';
import { useListEvidenceOpinion } from '@/hooks/react-query/query/evidence/use-list-evidence-opinion';
import { cn } from '@/lib/utils';

type TTab = 'ALL' | 'AGREE' | 'DISAGREE';

type TEvidenceOpinionDownloadModalProps = {
  isOpen: boolean;
  initialTab: TTab;
  projectId: string;
  evidenceNameById?: Record<string, string>;
  onClose: () => void;
};

const tabLabel: Record<TTab, string> = {
  ALL: '전체',
  AGREE: '동의',
  DISAGREE: '부동의',
};

const titleLabel: Record<TTab, string> = {
  ALL: '증거인부 전체',
  AGREE: '증거인부 동의',
  DISAGREE: '증거인부 부동의',
};

export const EvidenceOpinionDownloadModal = ({
  isOpen,
  initialTab,
  projectId,
  evidenceNameById,
  onClose,
}: TEvidenceOpinionDownloadModalProps) => {
  const [tab, setTab] = useState<TTab>(initialTab);
  const [fallbackEvidenceNameById, setFallbackEvidenceNameById] = useState<Record<string, string>>({});
  const effectiveEvidenceNameById = useMemo(() => {
    return { ...fallbackEvidenceNameById, ...(evidenceNameById ?? {}) };
  }, [fallbackEvidenceNameById, evidenceNameById]);

  useEffect(() => {
    if (!isOpen) return;
    setTab(initialTab);
  }, [initialTab, isOpen]);

  // evidence-table.tsx 의 "성명(item.name)" 과 동일한 값이 필요하므로
  // 부모에서 매핑을 주지 않으면(또는 일부만 주면) 프로젝트 전체 evidence list 로 fallback 매핑 구성
  useEffect(() => {
    if (!isOpen) return;
    if (!projectId) return;

    let cancelled = false;
    (async () => {
      try {
        const res = await fetchListEvidence({
          project_id: projectId,
          keyword: '',
          page: 1,
          limit: 10000,
        });
        const map: Record<string, string> = {};
        (res?.data?.results ?? []).forEach((item: any) => {
          if (item?.evidence_id) map[String(item.evidence_id)] = String(item?.name ?? '');
        });
        if (!cancelled) setFallbackEvidenceNameById(map);
      } catch (e) {
        console.error('증거인부 다운로드 성명 매핑 로딩 실패:', e);
      }
    })();

    return () => {
      cancelled = true;
    };
  }, [isOpen, projectId]);

  const { response, isLoading, isFetching, refetch } = useListEvidenceOpinion({
    project_id: projectId,
    page_no: 1,
    block_cnt: 10000,
    enabled: isOpen && !!projectId,
  });

  useEffect(() => {
    if (!isOpen) return;
    void refetch();
  }, [isOpen, refetch]);

  const rows = useMemo(() => {
    const list = response?.data?.list ?? [];
    if (tab === 'AGREE') return list.filter((r) => r?.is_agreed === true);
    if (tab === 'DISAGREE') return list.filter((r) => r?.is_agreed === false);
    return list;
  }, [response, tab]);

  // const counts = useMemo(() => {
  //   const list = response?.data?.list ?? [];
  //   return {
  //     ALL: list.length,
  //     AGREE: list.filter((r) => r?.is_agreed === true).length,
  //     DISAGREE: list.filter((r) => r?.is_agreed === false).length,
  //   };
  // }, [response]);

  const handleDownload = () => {
    try {
      const dataToExport = rows.map((r, idx) => ({
        순번: idx + 1,
        쪽수: String(r?.pages ?? ''),
        증거명칭: r?.evidence?.evidence_title ?? '',
        // evidence-table.tsx 의 "성명(item.name)" 을 그대로 내려받아 사용
        성명: effectiveEvidenceNameById?.[String(r?.evidence_id ?? '')] ?? '',
        증거인부: r?.is_agreed ? '동의' : '부동의',
        의견: (r?.content ?? '').trim() || '-',
      }));

      const ws = XLSX.utils.json_to_sheet(dataToExport);
      const wb = XLSX.utils.book_new();
      XLSX.utils.book_append_sheet(wb, ws, '증거인부');
      XLSX.writeFile(wb, `${titleLabel[tab]}.xlsx`);
      onMessageToast({ message: '증거인부 다운로드가 완료되었습니다.' });
      onClose();
    } catch (error) {
      console.error('증거인부 엑셀 다운로드 중 오류:', error);
      onMessageToast({ message: '증거인부 다운로드 중 오류가 발생했습니다.' });
    }
  };

  if (!isOpen) return null;

  return ReactDOM.createPortal(
    <div className='fixed inset-0 z-[9999] flex items-center justify-center bg-black/30' onMouseDown={onClose}>
      <div className='w-[92%] max-w-[1000px] rounded-[16px] bg-white p-6 shadow-xl' onMouseDown={(e) => e.stopPropagation()}>
        <div className='flex items-center justify-between'>
          <div className='text-[18px] font-semibold text-[#252525]'>{titleLabel[tab]}</div>
          <div className='flex items-center gap-3 text-[14px] text-[#666]'>
            {(['ALL', 'AGREE', 'DISAGREE'] as const).map((t) => (
              <button
                key={t}
                type='button'
                className={cn('px-1', tab === t ? 'border-b-2 border-[#212121] font-semibold text-[#212121]' : 'hover:text-[#252525]')}
                onClick={() => setTab(t)}
              >
                {tabLabel[t]}
              </button>
            ))}
          </div>
        </div>

        <div className='mt-4 overflow-hidden border border-[#E5E5E5]'>
          <div className='grid grid-cols-[70px_120px_1fr_120px_120px_1fr] text-[13px] font-semibold text-[#252525]'>
            <div className='border-r border-[#E5E5E5] px-3 py-2'>순번</div>
            <div className='border-r border-[#E5E5E5] px-3 py-2'>쪽수</div>
            <div className='border-r border-[#E5E5E5] px-3 py-2'>증거명칭</div>
            <div className='border-r border-[#E5E5E5] px-3 py-2'>성명</div>
            <div className='border-r border-[#E5E5E5] px-3 py-2'>증거인부</div>
            <div className='px-3 py-2'>의견</div>
          </div>

          <div className='max-h-[500px] overflow-y-auto'>
            {isLoading || isFetching ? (
              <div className='flex h-[240px] items-center justify-center'>
                <CustomSpinner />
              </div>
            ) : rows.length === 0 ? (
              <div className='flex h-[240px] items-center justify-center text-[14px] text-[#A1A1AA]'>데이터가 없습니다.</div>
            ) : (
              rows.map((r, idx) => (
                <div
                  key={`${r.opinion_id}-${idx}`}
                  className='grid grid-cols-[70px_120px_1fr_120px_120px_1fr] border-t border-[#E5E5E5] text-[13px] text-[#252525]'
                >
                  <div className='border-r border-[#E5E5E5] px-3 py-2'>{idx + 1}</div>
                  <div className='border-r border-[#E5E5E5] px-3 py-2'>{String(r.pages ?? '')}</div>
                  <div className='border-r border-[#E5E5E5] px-3 py-2'>{r.evidence?.evidence_title ?? ''}</div>
                  <div className='border-r border-[#E5E5E5] px-3 py-2'>
                    {effectiveEvidenceNameById?.[String(r?.evidence_id ?? '')] ?? ''}
                  </div>
                  <div className='border-r border-[#E5E5E5] px-3 py-2'>{r.is_agreed ? '동의' : '부동의'}</div>
                  <div className='px-3 py-2'>{(r.content ?? '').trim() || '-'}</div>
                </div>
              ))
            )}
          </div>
        </div>

        <div className='mt-6 flex justify-center gap-3'>
          <button
            type='button'
            className='h-[44px] w-[220px] rounded-[10px] bg-[#0050B3] text-[14px] font-semibold text-white'
            onClick={handleDownload}
          >
            증거인부 다운로드
          </button>
          <button
            type='button'
            className='h-[44px] w-[220px] rounded-[10px] border border-[#E5E5E5] bg-white text-[14px] font-semibold text-[#252525]'
            onClick={onClose}
          >
            취소
          </button>
        </div>
      </div>
    </div>,
    document.body,
  );
};
