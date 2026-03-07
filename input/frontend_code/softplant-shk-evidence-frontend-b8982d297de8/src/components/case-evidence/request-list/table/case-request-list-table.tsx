import { useCallback, useEffect, useMemo, useRef, useState } from 'react';

import { useSearchParams } from 'react-router-dom';

import { useGetRequestFilterOptions, useGetRequestList } from '@query/query';
import type { TRequestListOutput } from '@/apis/type/case-type/request-type';
import DocumentPagination from '@/components/case-evidence/case-detail-list/common/document-pagination';
import RequestDetailPanel from '@/components/case-evidence/request-list/panels/request-detail-panel';
import RequestListPanel from '@/components/case-evidence/request-list/panels/request-list-panel';
import { useGetRequestDetail } from '@/hooks/react-query/mutation/case/use-get-request-detail';

type TCaseRequestListTableProps = {
  civilCaseId?: string | null;
};

export default function CaseRequestListTable({ civilCaseId }: TCaseRequestListTableProps): JSX.Element {
  const [searchParams, setSearchParams] = useSearchParams();

  // ! 좌측 패널 리사이즈 처리
  const LEFT_MIN = 481;
  const LEFT_MAX = 770;
  const [leftPanelWidth, setLeftPanelWidth] = useState(420);

  const clamp = (v: number, min: number, max: number) => Math.max(min, Math.min(max, v));

  // ! 좌측 패널 리사이즈 드래그 시작
  const startResizeLeft = useCallback(
    (e: React.PointerEvent) => {
      e.preventDefault();
      e.stopPropagation();
      const startX = e.clientX;
      const startW = leftPanelWidth;

      const onMove = (ev: PointerEvent) => {
        const dx = ev.clientX - startX;
        setLeftPanelWidth(clamp(startW + dx, LEFT_MIN, LEFT_MAX));
      };
      const onUp = () => {
        document.body.style.userSelect = '';
        document.body.style.cursor = '';
        window.removeEventListener('pointermove', onMove);
        window.removeEventListener('pointerup', onUp);
      };

      document.body.style.userSelect = 'none';
      document.body.style.cursor = 'col-resize';
      window.addEventListener('pointermove', onMove);
      window.addEventListener('pointerup', onUp);
    },
    [leftPanelWidth],
  );

  // ! 페이지네이션 상태
  const [page, setPage] = useState(1);
  const [limit, setLimit] = useState(20);

  // ! 필터/정렬 상태 (서버)
  const [requestQuery, setRequestQuery] = useState<{
    status: string[];
    target_type: string[];
    requested_by: string[];
    requested_at_from?: string;
    requested_at_to?: string;
    sort_by?: string;
    sort_order?: 'asc' | 'desc';
  }>({
    status: [],
    target_type: [],
    requested_by: [],
    sort_by: undefined,
    sort_order: undefined,
  });

  const { response: filterOptionsResponse } = useGetRequestFilterOptions({
    civilCaseId: civilCaseId ?? null,
    enabled: !!civilCaseId,
  });

  const { response, isLoading } = useGetRequestList({
    input: civilCaseId
      ? {
          civil_case_id: String(civilCaseId),
          ...(requestQuery.status?.length ? { status: requestQuery.status } : {}),
          ...(requestQuery.target_type?.length ? { target_type: requestQuery.target_type } : {}),
          ...(requestQuery.requested_by?.length ? { requested_by: requestQuery.requested_by } : {}),
          ...(requestQuery.requested_at_from ? { requested_at_from: requestQuery.requested_at_from } : {}),
          ...(requestQuery.requested_at_to ? { requested_at_to: requestQuery.requested_at_to } : {}),
          ...(requestQuery.sort_by ? { sort_by: requestQuery.sort_by } : {}),
          ...(requestQuery.sort_order ? { sort_order: requestQuery.sort_order } : {}),
          page,
          limit,
        }
      : null,
    enabled: !!civilCaseId,
  });

  // ! 요청 목록 아이템 정규화
  const items = useMemo(() => {
    return ((response?.results ?? []) as unknown as Array<NonNullable<TRequestListOutput['results']>[number]>).filter(Boolean);
  }, [response?.results]);

  // ! 드래프트 개수 추출
  const draftCount = useMemo(() => {
    const counts = (response as any)?.status_counts ?? (response as any)?.data?.status_counts ?? null;
    const raw = counts?.DRAFT ?? 0;
    return Number.isFinite(Number(raw)) ? Number(raw) : 0;
  }, [response]);

  const [selectedRequestId, setSelectedRequestId] = useState<string | null>(null);
  const { isPending: isDetailLoading, onGetRequestDetail } = useGetRequestDetail();
  const [detailResult, setDetailResult] = useState<any | null>(null);
  const detailCacheRef = useRef<Map<string, any>>(new Map());

  // ! URL 딥링크: 쿼리 파라미터에서 선택된 요청 ID 복원
  useEffect(() => {
    const fromUrl = String(searchParams.get('evidence_request_id') ?? '').trim();
    if (!fromUrl) return;
    if (fromUrl === String(selectedRequestId ?? '').trim()) return;
    setSelectedRequestId(fromUrl);
  }, [searchParams, selectedRequestId]);

  // ! 페이지/필터 변경으로 선택 항목이 사라진 경우 선택 초기화
  useEffect(() => {
    // URL 딥링크로 들어온 경우는 현재 페이지에 없어도 선택 유지
    const urlId = String(searchParams.get('evidence_request_id') ?? '').trim();
    if (urlId) return;
    const cur = String(selectedRequestId ?? '').trim();
    const hasCur = cur && items.some((x) => String(x?.request_id ?? '') === cur);
    if (hasCur) return;
    setSelectedRequestId(null);
    const preserved = new URLSearchParams(searchParams);
    preserved.delete('evidence_request_id');
    setSearchParams(preserved, { replace: true });
  }, [items, searchParams, selectedRequestId, setSearchParams]);

  // ! 현재 선택된 요청 항목 조회
  const selectedRequest = useMemo(() => {
    if (!selectedRequestId) return null;
    return items.find((x) => String(x?.request_id ?? '') === String(selectedRequestId)) ?? null;
  }, [items, selectedRequestId]);

  // ! 선택된 요청 상세 데이터 패치
  useEffect(() => {
    const id = String(selectedRequestId ?? '').trim();
    if (!id) {
      setDetailResult(null);
      return;
    }
    const cached = detailCacheRef.current.get(id);
    if (cached) {
      setDetailResult(cached);
      return;
    }
    let cancelled = false;
    void (async () => {
      const res = await onGetRequestDetail(id);
      if (cancelled) return;
      const next = res?.result ?? null;
      if (next) detailCacheRef.current.set(id, next);
      setDetailResult(next);
    })();
    return () => {
      cancelled = true;
    };
  }, [onGetRequestDetail, selectedRequestId]);

  // ! 페이지네이션 데이터 정규화
  const pagination = useMemo(() => {
    const p: any = (response as any)?.pagination ?? (response as any)?.data?.pagination ?? null;
    const total = Number(p?.total ?? 0);
    const curPage = Number(p?.page ?? page ?? 1);
    const curLimit = Number(p?.limit ?? limit ?? 20);
    const pages = Number(p?.pages ?? (total > 0 ? Math.ceil(total / Math.max(1, curLimit)) : 1));
    return { total, page: curPage, limit: curLimit, pages: Math.max(1, pages) };
  }, [limit, page, response]);

  const showDetail = Boolean(selectedRequestId);

  return (
    <div className='flex h-screen flex-col overflow-hidden bg-[#f4f4f5] pb-[10px] pr-[10px] pt-[50px]'>
      <div className='flex min-h-0 w-full min-w-0 flex-1 justify-center overflow-hidden rounded-[16px] border border-[#D4D4D8] bg-white'>
        <div className='flex min-h-0 min-w-0 flex-1'>
          <div className='relative flex min-h-0 min-w-0 flex-1 items-stretch'>
            {/* 좌측 목록 패널 */}
            <div
              className={`group relative flex min-h-0 min-w-0 flex-shrink-0 flex-col ${showDetail ? 'border-r border-[#E4E4E7]' : ''}`}
              style={{ width: showDetail ? leftPanelWidth : '100%' }}
            >
              {showDetail ? (
                <div
                  role='presentation'
                  onPointerDown={startResizeLeft}
                  className='absolute right-0 top-0 z-50 h-full w-[6px] cursor-col-resize opacity-0 transition-opacity group-hover:opacity-100'
                >
                  <div className='mx-auto h-full w-[2px] bg-transparent group-hover:bg-[#D4D4D8]' />
                </div>
              ) : null}

              <div className='min-h-0 flex-1'>
                <RequestListPanel
                  items={items}
                  isLoading={isLoading}
                  selectedRequestId={selectedRequestId}
                  civilCaseId={civilCaseId}
                  draftCount={draftCount}
                  filterOptions={filterOptionsResponse ?? undefined}
                  requestQuery={requestQuery}
                  onChangeRequestQuery={(patch) => {
                    setRequestQuery((prev) => ({ ...prev, ...(patch ?? {}) }));
                    setPage(1);
                  }}
                  onSelectRequest={(req) => {
                    const nextId = String(req?.request_id ?? '').trim();
                    setSelectedRequestId(nextId || null);
                    const preserved = new URLSearchParams(searchParams);
                    if (nextId) preserved.set('evidence_request_id', nextId);
                    else preserved.delete('evidence_request_id');
                    setSearchParams(preserved, { replace: true });
                  }}
                />
              </div>

              <DocumentPagination
                pagination={pagination}
                onChangePage={(p) => setPage(p)}
                onChangeLimit={(l) => {
                  setLimit(l);
                  setPage(1);
                }}
                onClickDownload={() => {
                  // 백엔드 엑스포트 기능 제공 시 구현 예정
                }}
                limitOptions={[20, 50, 100]}
              />
            </div>

            {/* 우측 상세 패널 */}
            {showDetail ? (
              <div className='min-h-0 min-w-0 flex-1 overflow-hidden'>
                <RequestDetailPanel request={detailResult ?? (selectedRequest as any)} isLoading={isDetailLoading} />
              </div>
            ) : null}
          </div>
        </div>
      </div>
    </div>
  );
}
