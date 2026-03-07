import { type ReactNode, useEffect, useMemo, useRef, useState } from 'react';

import { useQueryClient } from '@tanstack/react-query';
import { ArrowDown, ArrowUp, Check, ChevronDown, Link2, ListFilter, Minus, PaintbrushVertical, Pin, Search, Send } from 'lucide-react';
import { createPortal } from 'react-dom';

import type { TRequestListOutput, TRequestFilterOptionsOutput } from '@/apis/type/case-type/request-type';
import arrowDownUpImg from '@/assets/images/arrow-down-up.svg?url';
import arrowDownImg from '@/assets/images/arrow-down.svg?url';
import arrowUpImg from '@/assets/images/arrow-up.svg?url';
import toggleButtonImg from '@/assets/images/toggle-button.svg?url';
import RequestCreateModal from '@/components/case-evidence/request-list/modal/request-create-modal';
import { onMessageToast } from '@/components/utils/global-utils';
import { useMarkRequestAsRead, usePinEvidenceRequest } from '@/hooks/react-query/mutation/case';

type TRequestListPanelProps = {
  items: Array<NonNullable<TRequestListOutput['results']>[number]>;
  isLoading?: boolean;
  selectedRequestId?: string | null;
  onSelectRequest?: (req: NonNullable<TRequestListOutput['results']>[number]) => void;
  civilCaseId?: string | null;
  draftCount?: number;
  filterOptions?: TRequestFilterOptionsOutput;
  requestQuery?: {
    status: string[];
    target_type: string[];
    requested_by: string[];
    requested_at_from?: string;
    requested_at_to?: string;
    sort_by?: string;
    sort_order?: 'asc' | 'desc';
  };
  onChangeRequestQuery?: (patch: Partial<NonNullable<TRequestListPanelProps['requestQuery']>>) => void;
};

type TReqItem = NonNullable<TRequestListOutput['results']>[number] & { request_id?: string };

// ! 날짜 포맷
const formatDate = (raw: unknown) => {
  const s = String(raw ?? '').trim();
  if (!s) return '';
  const d = new Date(s);
  if (Number.isNaN(d.getTime())) return s;
  const y = d.getFullYear();
  const mm = String(d.getMonth() + 1).padStart(2, '0');
  const dd = String(d.getDate()).padStart(2, '0');
  return `${y}.${mm}.${dd}`;
};

// ! 상태 그룹 정규화
const normalizeStatusGroup = (statusRaw: unknown): 'review_needed' | 'waiting' | 'done' => {
  const s = String(statusRaw ?? '')
    .trim()
    .toUpperCase();
  if (!s) return 'review_needed';
  if (s === 'WAITING') return 'waiting';
  if (s === 'COMPLETED') return 'done';
  return 'review_needed';
};

// ! 클립보드 복사
const copyToClipboard = async (text: string) => {
  const s = String(text ?? '').trim();
  if (!s) return false;
  try {
    await navigator.clipboard.writeText(s);
    return true;
  } catch {
    try {
      const ta = document.createElement('textarea');
      ta.value = s;
      ta.style.position = 'fixed';
      ta.style.left = '-9999px';
      document.body.appendChild(ta);
      ta.focus();
      ta.select();
      const ok = document.execCommand('copy');
      document.body.removeChild(ta);
      return ok;
    } catch {
      return false;
    }
  }
};

// ! boolean 변환 유틸
const asBool = (v: unknown) => v === true || v === 'true' || v === 1 || v === '1';

export default function RequestListPanel({
  items,
  isLoading = false,
  selectedRequestId,
  onSelectRequest,
  civilCaseId,
  draftCount = 0,
  filterOptions,
  requestQuery,
  onChangeRequestQuery,
}: TRequestListPanelProps): JSX.Element {
  const [query, setQuery] = useState('');
  const queryClient = useQueryClient();
  const [pinnedByRequestId, setPinnedByRequestId] = useState<Record<string, boolean>>({});
  const [pinBusyByRequestId, setPinBusyByRequestId] = useState<Record<string, boolean>>({});
  const { mutateAsync: pinToggleAsync, isPending: isPinPending } = usePinEvidenceRequest();
  const { onMarkRequestAsRead } = useMarkRequestAsRead();

  const [isRequestMenuOpen, setIsRequestMenuOpen] = useState(false);
  const [isRequestModalOpen, setIsRequestModalOpen] = useState(false);
  const [requestMode, setRequestMode] = useState<'highlight' | 'message'>('highlight');
  const requestMenuRef = useRef<HTMLDivElement | null>(null);

  // ! 요청 메뉴 외부 클릭 감지
  useEffect(() => {
    const onDown = (e: MouseEvent) => {
      if (!isRequestMenuOpen) return;
      const el = requestMenuRef.current;
      if (!el) return;
      if (e.target instanceof Node && el.contains(e.target)) return;
      setIsRequestMenuOpen(false);
    };
    window.addEventListener('mousedown', onDown);
    return () => window.removeEventListener('mousedown', onDown);
  }, [isRequestMenuOpen]);

  // ! 검색 필터 적용 목록
  const allItems = useMemo(() => {
    const raw = (items ?? []) as unknown as TReqItem[];
    const q = String(query ?? '').trim();
    if (!q) return raw;
    return raw.filter((x) => String((x as any)?.request_text ?? '').includes(q));
  }, [items, query]);

  const sortedItems = allItems;

  const getStatusBadge = (statusRaw: unknown) => {
    const group = normalizeStatusGroup(statusRaw);
    if (group === 'done') {
      return { label: '읽은 요청', className: 'bg-[#DFEFFF] text-[#18181B]' };
    }
    if (group === 'waiting') {
      return { label: '보낸 요청', className: 'bg-[#FED7AA] text-[#18181B]' };
    }
    return { label: '안읽은 요청', className: 'bg-[#B8DFFF] text-[#18181B]' };
  };

  const isEmpty = sortedItems.length === 0;

  // ! 핀 상태 동기화
  useEffect(() => {
    const next: Record<string, boolean> = {};
    for (const x of (items ?? []) as any[]) {
      const reqId = String(x?.request_id ?? x?.requestId ?? '').trim();
      if (!reqId) continue;
      next[reqId] = asBool(x?.isPinned ?? x?.is_pinned ?? x?.target_clipping?.isPinned ?? x?.target_clipping?.is_pinned);
    }
    setPinnedByRequestId(next);
  }, [items]);

  type THeaderKey = 'status' | 'target_type' | 'requested_by' | 'attachment' | 'date' | 'none';
  const [hoveredHeaderKey, setHoveredHeaderKey] = useState<THeaderKey | null>(null);
  const [headerMenu, setHeaderMenu] = useState<{ key: Exclude<THeaderKey, 'none'>; left: number; top: number } | null>(null);
  const headerMenuRef = useRef<HTMLDivElement | null>(null);
  const sortBy = String(requestQuery?.sort_by ?? '').trim();
  const sortOrder = (requestQuery?.sort_order ?? 'desc') as 'asc' | 'desc';

  // ! 헤더 메뉴 외부 클릭 감지
  useEffect(() => {
    if (!headerMenu) return;
    const onDown = (e: MouseEvent) => {
      const el = headerMenuRef.current;
      if (el && e.target instanceof Node && el.contains(e.target)) return;
      setHeaderMenu(null);
    };
    document.addEventListener('mousedown', onDown);
    return () => document.removeEventListener('mousedown', onDown);
  }, [headerMenu]);

  const HeaderFilterIcon = ({ active }: { active: boolean }) => (
    <span className='ml-2 inline-flex items-center'>
      <ListFilter className='h-4 w-4' style={{ color: active ? '#69C0FF' : '#D4D4D8' }} />
    </span>
  );

  const HeaderSortIcon = ({ active }: { active: boolean }) => {
    const src = active ? (sortOrder === 'asc' ? arrowUpImg : arrowDownImg) : arrowDownUpImg;
    return (
      <span className='ml-2 inline-flex items-center'>
        <img src={src} alt='sort' className='h-[18px] w-[18px] shrink-0' />
      </span>
    );
  };

  const openHeaderMenu = (key: Exclude<THeaderKey, 'none'>, e: React.MouseEvent) => {
    e.stopPropagation();
    const rect = (e.currentTarget as HTMLElement).getBoundingClientRect();
    const left = Math.max(8, Math.min(rect.left, window.innerWidth - 220));
    const top = Math.max(8, rect.bottom + 6);
    setHeaderMenu({ key, left, top });
  };

  const HeaderCell = ({
    label,
    hkey,
    enableFilter,
    isFilterActive,
    enableSort,
    sortKey,
    align = 'left',
    className = '',
  }: {
    label: string;
    hkey: Exclude<THeaderKey, 'none'>;
    enableFilter?: boolean;
    isFilterActive?: boolean;
    enableSort?: boolean;
    sortKey?: string;
    align?: 'left' | 'center';
    className?: string;
  }) => {
    const isHovered = hoveredHeaderKey === hkey;
    const isSorted = !!sortKey && sortBy === sortKey;
    const active = Boolean(isHovered || isFilterActive || isSorted);
    const showFilterIcon = !!enableFilter && active;
    const showSortIcon = !!enableSort && active;
    const showAny = (enableFilter || enableSort) && active;
    const bg = showAny ? 'bg-[#F4F4F5]' : 'bg-white';
    return (
      <div
        className={`group relative h-full px-2 ${bg} ${align === 'center' ? 'text-center' : ''} ${className}`}
        onMouseEnter={() => setHoveredHeaderKey(hkey)}
        onMouseLeave={() => setHoveredHeaderKey((prev) => (prev === hkey ? null : prev))}
      >
        <button
          type='button'
          className={`inline-flex h-full w-full items-center py-3 ${align === 'center' ? 'justify-center' : 'justify-start'}`}
          onClick={(e) => {
            if (!enableFilter && !enableSort) return;
            openHeaderMenu(hkey, e);
          }}
        >
          <span className='text-[12px] font-semibold text-[#8A8A8E]'>{label}</span>
          {showSortIcon ? <HeaderSortIcon active={isSorted} /> : null}
          {showFilterIcon ? <HeaderFilterIcon active={Boolean(isFilterActive)} /> : null}
        </button>
      </div>
    );
  };

  const FilterPopup = ({
    popupTitle,
    options,
    selected,
    onApply,
  }: {
    popupTitle: string;
    options: { id: string; label: string }[];
    selected: string[];
    onApply: (next: string[]) => void;
  }) => {
    const [temp, setTemp] = useState<string[]>(selected);
    useEffect(() => setTemp(selected), [selected]);
    const allIds = options.map((o) => o.id);
    const allChecked = allIds.length > 0 && temp.length === allIds.length;
    const noneChecked = temp.length === 0;
    const indeterminate = !noneChecked && !allChecked;
    const toggleAll = () => {
      if (allChecked || indeterminate) setTemp([]);
      else setTemp(allIds);
    };
    const toggleOne = (id: string) => {
      setTemp((prev) => (prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id]));
    };

    return (
      <div className='w-[220px] rounded-[12px] bg-white p-0 shadow-md'>
        <div className='px-3 pb-2 pt-3 text-[13px] font-semibold text-[#18181B]'>{popupTitle}</div>
        <div className='max-h-[220px] overflow-auto px-2 pb-2'>
          <button
            type='button'
            className='flex h-[32px] w-full items-center gap-2 rounded-[8px] px-2 hover:bg-[#F4F4F5]'
            onClick={toggleAll}
          >
            <span className='flex h-[18px] w-[18px] items-center justify-center rounded-[4px] border border-[#D4D4D8] bg-white'>
              {allChecked ? (
                <Check className='h-[14px] w-[14px] text-[#18181B]' />
              ) : indeterminate ? (
                <Minus className='h-[14px] w-[14px] text-[#18181B]' />
              ) : null}
            </span>
            <span className='text-[13px] font-medium text-[#18181B]'>전체</span>
          </button>
          <div className='my-2 h-[1px] w-full bg-[#E4E4E7]' />
          {options.map((o) => {
            const checked = temp.includes(o.id);
            return (
              <button
                key={o.id}
                type='button'
                className='flex h-[32px] w-full items-center gap-2 rounded-[8px] px-2 hover:bg-[#F4F4F5]'
                onClick={() => toggleOne(o.id)}
              >
                <span
                  className={`flex h-[18px] w-[18px] items-center justify-center rounded-[4px] border ${
                    checked ? 'border-[#18181B] bg-[#18181B]' : 'border-[#D4D4D8] bg-white'
                  }`}
                >
                  {checked ? <Check className='h-[14px] w-[14px] text-white' /> : null}
                </span>
                <span className='min-w-0 truncate text-[13px] font-medium text-[#18181B]'>{o.label}</span>
              </button>
            );
          })}
        </div>
        <div className='flex items-center justify-end gap-2 px-3 pb-3 pt-2'>
          <button
            type='button'
            className='h-[32px] w-[72px] rounded-[10px] border border-[#D4D4D8] bg-white text-[13px] font-semibold text-[#18181B] hover:bg-[#F4F4F5]'
            onClick={() => setHeaderMenu(null)}
          >
            취소
          </button>
          <button
            type='button'
            className='h-[32px] w-[72px] rounded-[10px] bg-[#93C5FD] text-[13px] font-semibold text-white hover:bg-[#60A5FA]'
            onClick={() => {
              onApply(temp);
              setHeaderMenu(null);
            }}
          >
            적용
          </button>
        </div>
      </div>
    );
  };

  const FilterMenu = ({
    title,
    options,
    selected,
    onApply,
  }: {
    title: string;
    options: { id: string; label: string }[];
    selected: string[];
    onApply: (next: string[]) => void;
  }) => <FilterPopup popupTitle={title} options={options} selected={selected} onApply={onApply} />;

  const SortPopup = ({ popupTitle: _popupTitle, sortKey }: { popupTitle: string; sortKey: string }) => {
    const isDesc = sortBy === sortKey && sortOrder === 'desc';
    const isAsc = sortBy === sortKey && sortOrder === 'asc';
    return (
      <div className='w-[190px] overflow-hidden rounded-[12px] border border-[#E4E4E7] bg-white shadow-lg'>
        <div className='py-1'>
          <button
            type='button'
            className={`flex h-[40px] w-full items-center gap-2 px-4 text-left text-[14px] font-medium hover:bg-[#F4F4F5] ${
              isDesc ? 'bg-[#F4F4F5] text-[#18181B]' : 'text-[#18181B]'
            }`}
            onClick={() => {
              onChangeRequestQuery?.({ sort_by: sortKey, sort_order: 'desc' });
              setHeaderMenu(null);
            }}
          >
            <ArrowDown className='h-4 w-4' />
            내림차순 정렬
          </button>
          <button
            type='button'
            className={`flex h-[40px] w-full items-center gap-2 px-4 text-left text-[14px] font-medium hover:bg-[#F4F4F5] ${
              isAsc ? 'bg-[#F4F4F5] text-[#18181B]' : 'text-[#18181B]'
            }`}
            onClick={() => {
              onChangeRequestQuery?.({ sort_by: sortKey, sort_order: 'asc' });
              setHeaderMenu(null);
            }}
          >
            <ArrowUp className='h-4 w-4' />
            오름차순 정렬
          </button>
        </div>
      </div>
    );
  };

  // ! 요청 링크 생성
  const requestLink = useMemo(() => {
    const id = String(civilCaseId ?? '')
      .trim()
      .replace(/\\/g, '');
    if (!id) return '';
    return `https://staging.ailex.co.kr/evidence-request?civil_case_id=${encodeURIComponent(id)}`;
  }, [civilCaseId]);

  return (
    <div className='flex h-full min-h-0 w-full flex-1 flex-col overflow-hidden bg-white'>
      <div className='shrink-0 px-4 pt-4 text-[20px] font-bold text-[#18181B]'>자료 요청</div>

      {/* 상단 컨트롤 영역 */}
      <div className='flex shrink-0 flex-nowrap items-center justify-between gap-1 px-4 pt-3'>
        <div className='relative w-full max-w-[110px] sm:max-w-[140px] md:max-w-[200px] lg:max-w-[240px]'>
          <Search className='absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-[#A1A1AA]' />
          <input
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder='검색'
            className='h-[32px] w-full rounded-[10px] border border-[#E4E4E7] bg-white pl-8 pr-2 text-[12px] font-medium text-[#18181B] placeholder:text-[#A1A1AA] focus:outline-none focus:ring-1 focus:ring-[#93C5FD]'
          />
        </div>
        <div className='flex gap-2'>
          <button
            type='button'
            className='flex h-[32px] shrink-0 items-center gap-1 whitespace-nowrap rounded-[10px] bg-[#F4F4F5] px-2 text-[12px] font-semibold text-[#18181B] hover:bg-[#E4E4E7]'
            onClick={async () => {
              if (!requestLink) {
                onMessageToast({ message: 'civilCaseId가 없어 링크를 만들 수 없습니다.' });
                return;
              }
              const ok = await copyToClipboard(requestLink);
              if (!ok) {
                onMessageToast({ message: '링크 복사에 실패했습니다.' });
                return;
              }
              onMessageToast({ message: '요청 링크를 복사했습니다.' });
            }}
          >
            <Link2 className='h-4 w-4 text-[#18181B]' />
            요청 링크
          </button>
          <div className='relative' ref={requestMenuRef}>
            <button
              type='button'
              className='flex h-[32px] shrink-0 items-center gap-1 whitespace-nowrap rounded-[10px] bg-[#69c0ff] px-2 text-[12px] font-semibold text-white hover:bg-[#1677FF]'
              onClick={() => setIsRequestMenuOpen((v) => !v)}
            >
              <Send className='h-4 w-4 text-white' />
              요청하기 {Number.isFinite(draftCount) ? draftCount : 0}
              <ChevronDown className='h-4 w-4 text-white' />
            </button>
            {isRequestMenuOpen ? (
              <div className='absolute right-0 top-[42px] z-[9999] w-[200px] overflow-hidden rounded-[12px] border border-[#E4E4E7] bg-white shadow-lg'>
                <button
                  type='button'
                  className='w-full px-4 py-3 text-left text-[14px] font-medium text-[#18181B] hover:bg-[#F4F4F5]'
                  onClick={() => {
                    setIsRequestMenuOpen(false);
                    if (!civilCaseId) {
                      onMessageToast({ message: 'civilCaseId가 없어 요청 모달을 열 수 없습니다.' });
                      return;
                    }
                    setRequestMode('highlight');
                    setIsRequestModalOpen(true);
                  }}
                >
                  하이라이트로 요청하기
                </button>
                <button
                  type='button'
                  className='w-full px-4 py-3 text-left text-[14px] font-medium text-[#18181B] hover:bg-[#F4F4F5]'
                  onClick={() => {
                    setIsRequestMenuOpen(false);
                    if (!civilCaseId) {
                      onMessageToast({ message: 'civilCaseId가 없어 요청 모달을 열 수 없습니다.' });
                      return;
                    }
                    setRequestMode('message');
                    setIsRequestModalOpen(true);
                  }}
                >
                  메세지로 요청하기
                </button>
              </div>
            ) : null}
          </div>
        </div>
      </div>

      {civilCaseId ? (
        <RequestCreateModal
          isOpen={isRequestModalOpen}
          mode={requestMode}
          civilCaseId={String(civilCaseId)}
          highlightId={''}
          onClose={() => {
            setIsRequestModalOpen(false);
            void queryClient.invalidateQueries({
              predicate: (q) => Array.isArray(q.queryKey) && q.queryKey[0] === 'evidence-request' && q.queryKey[1] === 'list',
            });
          }}
        />
      ) : null}

      {/* 요청 목록 */}
      <div className={`mt-3 min-h-0 flex-1 ${isEmpty && !isLoading ? 'flex items-center justify-center' : 'overflow-auto scroll-bar'}`}>
        {isLoading ? (
          <div className='px-4 py-6 text-[14px] text-[#8A8A8E]'>불러오는 중...</div>
        ) : isEmpty ? (
          <div className='flex min-h-[500px] flex-col items-center justify-center gap-2 px-4 text-center'>
            <div className='flex h-[52px] w-[52px] items-center justify-center rounded-full bg-[#F4F4F5] text-[#A1A1AA]'>
              <PaintbrushVertical className='h-6 w-6' />
            </div>
            <div className='text-[14px] font-semibold text-[#18181B]'>요청 목록이 비어 있습니다.</div>
            <div className='text-[13px] text-[#8A8A8E]'>사건 진행에 필요한 자료를 의뢰인에게 요청하세요.</div>
          </div>
        ) : (
          <div className='border-t border-[#E4E4E7]'>
            <div className='sticky top-0 z-10 min-w-[980px] border-b border-[#E4E4E7] bg-white px-0 text-[12px] font-semibold text-[#8A8A8E]'>
              <div className='grid grid-cols-[44px_120px_minmax(320px,1fr)_110px_120px_120px_110px]'>
                <div className='py-3 pl-6'>
                  <div className='flex w-full items-center justify-end'>
                    <Pin className='h-4 w-4' />
                  </div>
                </div>
                <HeaderCell
                  label='상태'
                  hkey='status'
                  enableFilter={true}
                  isFilterActive={Boolean((requestQuery?.status ?? []).length)}
                  className='pl-6 pr-2'
                />
                <div className='px-2 py-3'>요청 제목</div>
                <HeaderCell label='첨부 파일 수' hkey='attachment' enableSort={true} sortKey='counters.total_submitted' align='center' />
                <HeaderCell
                  label='구분'
                  hkey='target_type'
                  enableFilter={true}
                  isFilterActive={Boolean((requestQuery?.target_type ?? []).length)}
                  align='center'
                />
                <HeaderCell
                  label='작성자'
                  hkey='requested_by'
                  enableFilter={true}
                  isFilterActive={Boolean((requestQuery?.requested_by ?? []).length)}
                  align='center'
                />
                <HeaderCell label='날짜' hkey='date' enableSort={true} sortKey='requested_at' align='center' className='pr-6' />
              </div>
            </div>
            {sortedItems.map((x: any) => {
              const id = String(x?.request_id ?? '');
              const selected = id && selectedRequestId ? id === selectedRequestId : false;
              const statusBadge = getStatusBadge(x?.status);
              const title = String(x?.request_text ?? x?.title ?? '-');
              const attachmentCount = Number(x?.attachment_count ?? x?.attachmentCount ?? x?.file_count ?? 0);
              const basePinned = asBool(x?.isPinned ?? x?.is_pinned ?? x?.target_clipping?.isPinned ?? x?.target_clipping?.is_pinned);
              const isPinned = id ? asBool(pinnedByRequestId?.[id] ?? basePinned) : basePinned;
              const targetType = String(x?.target_type ?? x?.targetType ?? '')
                .trim()
                .toUpperCase();
              const category = targetType === 'CLIPPING' ? '하이라이트 요청' : '메세지 요청';
              const author = String(
                x?.requested_by?.name ??
                  x?.requested_by?.nickname ??
                  x?.requestedBy?.name ??
                  x?.requestedBy?.nickname ??
                  x?.requested_by_name ??
                  x?.writer_name ??
                  x?.created_by_name ??
                  x?.created_by?.name ??
                  x?.created_by?.nickname ??
                  '-',
              );
              const date = formatDate(x?.updated_at ?? x?.updatedAt ?? x?.createdAt ?? x?.created_at);
              return (
                <button
                  key={id || String(Math.random())}
                  type='button'
                  className={`grid h-[48px] w-full min-w-[980px] grid-cols-[44px_120px_minmax(320px,1fr)_110px_120px_120px_110px] items-center border-b border-[#E4E4E7] px-6 text-left text-[14px] ${
                    selected ? 'bg-[#DFEFFF]' : 'bg-white hover:bg-[#F4F4F5]'
                  }`}
                  onClick={() => {
                    if (normalizeStatusGroup(x?.status) === 'review_needed' && id) {
                      void onMarkRequestAsRead(id);
                    }
                    onSelectRequest?.(x);
                  }}
                >
                  <div className='flex items-center justify-start'>
                    <button
                      type='button'
                      className='flex h-[28px] w-[28px] items-center justify-center rounded-[8px] hover:bg-[#F4F4F5] disabled:cursor-not-allowed disabled:opacity-60'
                      aria-label='pin-toggle'
                      disabled={!id || isPinPending || Boolean(pinBusyByRequestId?.[id])}
                      onClick={async (e) => {
                        e.stopPropagation();
                        if (isPinPending) return;
                        if (!id) return;
                        if (pinBusyByRequestId?.[id]) return;

                        const civilId = String(x?.civil_case_id ?? x?.civilCaseId ?? civilCaseId ?? '').trim();
                        if (!civilId) {
                          onMessageToast({ message: 'civil_case_id를 찾을 수 없습니다.' });
                          return;
                        }

                        const prevPinned = isPinned;
                        const optimisticNext = !prevPinned;
                        setPinBusyByRequestId((prev) => ({ ...(prev ?? {}), [id]: true }));
                        setPinnedByRequestId((prev) => ({ ...(prev ?? {}), [id]: optimisticNext }));

                        try {
                          const res: any = await pinToggleAsync({ civil_case_id: civilId, request_id: id });
                          const hasError = Boolean(res?.error);
                          const ok = res?.success === true && !hasError;
                          if (!ok) {
                            // 낙관적 UI 롤백
                            setPinnedByRequestId((prev) => ({ ...(prev ?? {}), [id]: prevPinned }));
                            onMessageToast({ message: '핀 등록에 실패했습니다.' });
                            // 서버 최신 데이터로 목록 재동기화
                            await queryClient.invalidateQueries({
                              predicate: (q) =>
                                Array.isArray(q.queryKey) && q.queryKey[0] === 'evidence-request' && q.queryKey[1] === 'list',
                            });
                            return;
                          }

                          const nextPinned = asBool(
                            res?.data?.isPinned ?? res?.data?.is_pinned ?? res?.result?.isPinned ?? res?.result?.is_pinned,
                          );
                          setPinnedByRequestId((prev) => ({ ...(prev ?? {}), [id]: nextPinned }));
                          onMessageToast({
                            message: nextPinned ? '1페이지 위치고정이 등록되었습니다.' : '1페이지 위치고정이 해제되었습니다.',
                          });
                        } catch (err) {
                          console.error(err);
                          // API 에러(throw)인 경우 optimistic UI 롤백 + 리스트 재동기화
                          setPinnedByRequestId((prev) => ({ ...(prev ?? {}), [id]: prevPinned }));
                          onMessageToast({ message: '핀 등록에 실패했습니다.' });
                          await queryClient.invalidateQueries({
                            predicate: (q) => Array.isArray(q.queryKey) && q.queryKey[0] === 'evidence-request' && q.queryKey[1] === 'list',
                          });
                        } finally {
                          setPinBusyByRequestId((prev) => ({ ...(prev ?? {}), [id]: false }));
                        }
                      }}
                    >
                      {isPinned ? (
                        <img src={toggleButtonImg} alt='pinned' className='h-[23px] w-[23px]' />
                      ) : (
                        <Pin className='h-4 w-4' style={{ color: '#C4C4C7' }} />
                      )}
                    </button>
                  </div>
                  <div>
                    <span
                      className={`inline-flex h-[24px] items-center rounded-full px-3 text-[12px] font-semibold ${statusBadge.className}`}
                    >
                      {statusBadge.label}
                    </span>
                  </div>
                  <div className='min-w-0 pr-3 text-[14px] font-medium text-[#09090B]'>{title}</div>
                  <div className='text-center text-[13px] text-[#8A8A8E]'>{Number.isFinite(attachmentCount) ? attachmentCount : 0}</div>
                  <div className='text-center text-[13px] text-[#8A8A8E]'>{category || '-'}</div>
                  <div className='text-center text-[13px] text-[#8A8A8E]'>{author || '-'}</div>
                  <div className='text-center text-[13px] text-[#8A8A8E]'>{date}</div>
                </button>
              );
            })}
          </div>
        )}
      </div>

      {headerMenu && typeof document !== 'undefined'
        ? (() => {
            const key = headerMenu.key;
            const style = { position: 'fixed' as const, left: headerMenu.left, top: headerMenu.top, zIndex: 999999 };
            const statusOptions = (filterOptions?.status ?? []).map((s) => {
              const id = String(s).trim().toUpperCase();
              // 테이블 뱃지 레이블과 일치시킴
              const label = id === 'COMPLETED' ? '읽은 요청' : id === 'WAITING' ? '보낸 요청' : '안읽은 요청';
              return { id: String(s), label };
            });
            const targetTypeOptions = (filterOptions?.target_type ?? []).map((s) => {
              const id = String(s).trim().toUpperCase();
              const label = id === 'CLIPPING' ? '하이라이트 요청' : id === 'MESSAGE' ? '메세지 요청' : String(s);
              return { id: String(s), label };
            });
            const requestedByOptions = (filterOptions?.requested_by ?? []).map((u) => ({
              id: String(u.user_id),
              label: String(u.name),
            }));

            const content: ReactNode =
              key === 'status' ? (
                <FilterMenu
                  title='상태 필터'
                  options={statusOptions}
                  selected={requestQuery?.status ?? []}
                  onApply={(next) => onChangeRequestQuery?.({ status: next })}
                />
              ) : key === 'attachment' ? (
                <SortPopup popupTitle='첨부 파일 수 정렬' sortKey='counters.total_submitted' />
              ) : key === 'date' ? (
                <SortPopup popupTitle='날짜 정렬' sortKey='requested_at' />
              ) : key === 'target_type' ? (
                <FilterMenu
                  title='구분 필터'
                  options={targetTypeOptions}
                  selected={requestQuery?.target_type ?? []}
                  onApply={(next) => onChangeRequestQuery?.({ target_type: next })}
                />
              ) : key === 'requested_by' ? (
                <FilterMenu
                  title='작성자 필터'
                  options={requestedByOptions}
                  selected={requestQuery?.requested_by ?? []}
                  onApply={(next) => onChangeRequestQuery?.({ requested_by: next })}
                />
              ) : null;

            return createPortal(
              <div ref={headerMenuRef} style={style}>
                {content}
              </div>,
              document.body,
            );
          })()
        : null}
    </div>
  );
}
