import { useEffect, useMemo, useRef, useState } from 'react';

import { Link2, PaintbrushVertical } from 'lucide-react';

import type { TRequestListOutput } from '@/apis/type/case-type/request-type';
import RequestCreateModal from '@/components/case-evidence/request-list/modal/request-create-modal';
import { onMessageToast } from '@/components/utils/global-utils';

type TRequestListPanelProps = {
  items: Array<NonNullable<TRequestListOutput['results']>[number]>;
  isLoading?: boolean;
  selectedRequestId?: string | null;
  onSelectRequest?: (req: NonNullable<TRequestListOutput['results']>[number]) => void;
  civilCaseId?: string | null;
  draftCount?: number;
};

type TReqItem = NonNullable<TRequestListOutput['results']>[number] & { request_id?: string };

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

const normalizeStatusGroup = (statusRaw: unknown): 'review_needed' | 'waiting' | 'done' => {
  const s = String(statusRaw ?? '')
    .trim()
    .toUpperCase();
  if (!s) return 'review_needed';
  if (s === 'WAITING') return 'waiting';
  if (s === 'COMPLETED') return 'done';
  return 'review_needed';
};

export default function CaseRequestListTable({
  items,
  isLoading = false,
  selectedRequestId,
  onSelectRequest,
  civilCaseId,
  draftCount = 0,
}: TRequestListPanelProps): JSX.Element {
  const [query] = useState('');

  const [isRequestMenuOpen, setIsRequestMenuOpen] = useState(false);
  const [isRequestModalOpen, setIsRequestModalOpen] = useState(false);
  const [requestMode, setRequestMode] = useState<'highlight' | 'message'>('highlight');
  const requestMenuRef = useRef<HTMLDivElement | null>(null);

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

  const allItems = useMemo(() => {
    const raw = (items ?? []) as unknown as TReqItem[];
    const q = String(query ?? '').trim();
    if (!q) return raw;
    return raw.filter((x) => String((x as any)?.request_text ?? '').includes(q));
  }, [items, query]);

  const statusRank = useMemo(
    () =>
      ({
        review_needed: 0,
        waiting: 1,
        done: 2,
      }) as const,
    [],
  );
  const sortedItems = useMemo(() => {
    const list = [...allItems];
    list.sort((a, b) => {
      const aRank = statusRank[normalizeStatusGroup((a as any)?.status)];
      const bRank = statusRank[normalizeStatusGroup((b as any)?.status)];
      if (aRank !== bRank) return aRank - bRank;
      return 0;
    });
    return list;
  }, [allItems, statusRank]);

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

  const requestLink = useMemo(() => {
    const id = String(civilCaseId ?? '')
      .trim()
      .replace(/\\/g, '');
    if (!id) return '';
    return `https://staging.ailex.co.kr/evidence-request?civil_case_id=${encodeURIComponent(id)}`;
  }, [civilCaseId]);

  return (
    <div className='flex min-h-0 w-full flex-1 flex-col overflow-hidden bg-white'>
      <div className='flex items-center justify-between px-4 pt-4'>
        <div className='text-[20px] font-bold text-[#18181B]'>자료 요청</div>
        <div className='flex items-center gap-2'>
          <button
            type='button'
            className='flex h-[32px] items-center gap-2 rounded-[10px] bg-[#F4F4F5] px-3 text-[12px] font-semibold text-[#18181B] hover:bg-[#E4E4E7]'
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
              className='flex h-[32px] items-center gap-2 rounded-[10px] bg-[#69c0ff] px-3 text-[12px] font-semibold text-white hover:bg-[#1677FF]'
              onClick={() => setIsRequestMenuOpen((v) => !v)}
            >
              요청하기 {Number.isFinite(draftCount) ? draftCount : 0}
            </button>
            {isRequestMenuOpen ? (
              <div className='absolute right-0 top-[36px] z-50 w-[160px] overflow-hidden rounded-[8px] border border-[#E4E4E7] bg-white shadow-lg'>
                <button
                  type='button'
                  className='flex h-[36px] w-full items-center px-3 text-left text-[13px] text-[#18181B] hover:bg-[#F4F4F5]'
                  onClick={() => {
                    setRequestMode('message');
                    setIsRequestMenuOpen(false);
                    setIsRequestModalOpen(true);
                  }}
                >
                  메세지로 요청하기
                </button>
                <button
                  type='button'
                  className='flex h-[36px] w-full items-center px-3 text-left text-[13px] text-[#18181B] hover:bg-[#F4F4F5]'
                  onClick={() => {
                    setRequestMode('highlight');
                    setIsRequestMenuOpen(false);
                    setIsRequestModalOpen(true);
                  }}
                >
                  하이라이트로 요청하기
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
          onClose={() => setIsRequestModalOpen(false)}
        />
      ) : null}

      {/* list */}
      <div className='mt-3 min-h-0 flex-1 overflow-auto scroll-bar'>
        {isLoading ? (
          // 기록목록 로딩 UI와 동일한 skeleton 스타일
          <div className='h-full w-full px-3 py-3'>
            <div className='overflow-hidden rounded-[12px] bg-white'>
              <div className='border-b border-[#E4E4E7] px-4 py-3' />
              {Array.from({ length: 10 }).map((_, i) => (
                <div key={i} className='flex h-[40px] items-center border-b border-[#E4E4E7] px-4'>
                  <div className='h-[12px] w-[120px] rounded-full bg-[#F4F4F5]' />
                  <div className='ml-6 h-[12px] w-[220px] rounded-full bg-[#F4F4F5]' />
                </div>
              ))}
            </div>
          </div>
        ) : sortedItems.length === 0 ? (
          <div className='flex h-full w-full flex-col items-center justify-center gap-2 px-4 py-10 text-center'>
            <div className='flex h-[52px] min-h-[500px] w-[52px] items-center justify-center rounded-full bg-[#F4F4F5] text-[#A1A1AA]'>
              <PaintbrushVertical className='h-6 w-6' />
            </div>
            <div className='text-[14px] font-semibold text-[#18181B]'>요청 목록이 비어 있습니다.</div>
            <div className='text-[13px] text-[#8A8A8E]'>사건 진행에 필요한 자료를 의뢰인에게 요청하세요.</div>
          </div>
        ) : (
          <div className='border-t border-[#E4E4E7]'>
            <div className='grid grid-cols-[120px_minmax(0,1fr)_110px_120px_120px_110px] border-b border-[#E4E4E7] px-6 py-3 text-[12px] font-semibold text-[#8A8A8E]'>
              <div>상태</div>
              <div>요청 제목</div>
              <div className='text-center'>첨부 파일 수</div>
              <div className='text-center'>구분</div>
              <div className='text-center'>작성자</div>
              <div className='text-center'>날짜</div>
            </div>
            {sortedItems.map((x: any) => {
              const id = String(x?.request_id ?? '');
              const selected = id && selectedRequestId ? id === selectedRequestId : false;
              const statusBadge = getStatusBadge(x?.status);
              const title = String(x?.request_text ?? x?.title ?? '-');
              const attachmentCount = Number(x?.attachment_count ?? x?.attachmentCount ?? x?.file_count ?? 0);
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
              const date = formatDate(x?.created_at ?? x?.updated_at);
              return (
                <button
                  key={id || String(Math.random())}
                  type='button'
                  className={`grid h-[48px] w-full grid-cols-[120px_minmax(0,1fr)_110px_120px_120px_110px] items-center border-b border-[#E4E4E7] px-6 text-left text-[14px] ${
                    selected ? 'bg-[#DFEFFF]' : 'bg-white hover:bg-[#F4F4F5]'
                  }`}
                  onClick={() => onSelectRequest?.(x)}
                >
                  <div>
                    <span
                      className={`inline-flex h-[24px] items-center rounded-full px-3 text-[12px] font-semibold ${statusBadge.className}`}
                    >
                      {statusBadge.label}
                    </span>
                  </div>
                  <div className='min-w-0 truncate pr-3 text-[14px] font-medium text-[#09090B]'>{title}</div>
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
    </div>
  );
}
