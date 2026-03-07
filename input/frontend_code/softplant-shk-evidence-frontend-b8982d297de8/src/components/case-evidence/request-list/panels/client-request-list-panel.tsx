import { useEffect, useMemo, useRef, useState } from 'react';

import { ChevronDown, ChevronRight } from 'lucide-react';
import { useSearchParams } from 'react-router-dom';

import type { TRequestListOutput } from '@/apis/type/case-type/request-type';
import AiLexLogo from '@/assets/images/AiLexLogo.png';
import { onMessageToast } from '@/components/utils/global-utils';
import { useGetRequestListClient } from '@/hooks/react-query/mutation/case';

type TRequestListPanelProps = {
  items?: Array<NonNullable<TRequestListOutput['results']>[number]>; // 미리보기/레거시 전용 (비어도 됨)
  isLoading?: boolean; // 외부 로딩 상태 (부모에서 제어)
  civilCaseId?: string; // 비회원용: /evidence-request?civil_case_id=...
  selectedRequestId?: string | null;
  onSelectRequest?: (req: NonNullable<TRequestListOutput['results']>[number]) => void;
};

type TReqItem = NonNullable<TRequestListOutput['results']>[number] & { request_id?: string };

// ! 제출 여부 확인
const isSubmitted = (item: any): boolean => {
  // 서버 truthy 플래그 (우선)
  if (item?.has_submission) return true;
  const rf = item?.response_file;
  if (!rf) return false;
  if (Array.isArray(rf)) return rf.length > 0;
  if (Array.isArray(rf?.files)) return rf.files.length > 0;
  if (typeof rf === 'object') {
    if (rf?.file_url || rf?.url || rf?.file_id || rf?.file_name) return true;
    return Object.keys(rf).length > 0;
  }
  return false;
};

// ! 섹션 컴포넌트
function Section({
  title,
  open,
  onToggle,
  children,
}: {
  title: string;
  open: boolean;
  onToggle: () => void;
  children: React.ReactNode;
}): JSX.Element {
  return (
    <div className='border-b border-[#E4E4E7]'>
      <button type='button' className='flex h-[44px] w-full items-center gap-2 px-4 text-left text-[14px]' onClick={onToggle}>
        {open ? <ChevronDown className='h-4 w-4 text-[#18181B]' /> : <ChevronRight className='h-4 w-4 text-[#18181B]' />}
        <span className='flex-1 text-[#8A8A8E]'>{title}</span>
      </button>
      {open ? <div>{children}</div> : null}
    </div>
  );
}

export default function ClientRequestListPanel({
  items,
  isLoading = false,
  civilCaseId,
  selectedRequestId,
  onSelectRequest,
}: TRequestListPanelProps): JSX.Element {
  const [searchParams] = useSearchParams();
  const [openNew, setOpenNew] = useState(true);
  const [openChecked, setOpenChecked] = useState(true);

  const { onGetRequestListClient, isPending } = useGetRequestListClient();
  const [fetchedItems, setFetchedItems] = useState<TReqItem[]>([]);

  // ! ref 동기화
  const onSelectRequestRef = useRef<TRequestListPanelProps['onSelectRequest']>(onSelectRequest);
  const selectedRequestIdRef = useRef<string | null | undefined>(selectedRequestId);
  useEffect(() => {
    onSelectRequestRef.current = onSelectRequest;
  }, [onSelectRequest]);
  useEffect(() => {
    selectedRequestIdRef.current = selectedRequestId;
  }, [selectedRequestId]);

  // ! 유효 civil_case_id 계산
  const effectiveCivilCaseId = useMemo(() => {
    return String(civilCaseId ?? searchParams.get('civil_case_id') ?? searchParams.get('civilCaseId') ?? '').trim();
  }, [civilCaseId, searchParams]);

  // ! 요청 목록 패치
  useEffect(() => {
    let mounted = true;
    (async () => {
      if (!effectiveCivilCaseId) return;
      const res = await onGetRequestListClient({ civil_case_id: effectiveCivilCaseId, page: 1, limit: 200 });
      const next = Array.isArray((res as any)?.results) ? (((res as any).results ?? []) as TReqItem[]) : [];
      if (!mounted) return;
      setFetchedItems(next);
      if (!String(selectedRequestIdRef.current ?? '').trim() && next.length > 0) {
        const first = next[0] as any;
        if (String(first?.request_id ?? '').trim()) onSelectRequestRef.current?.(first);
      }
    })();
    return () => {
      mounted = false;
    };
  }, [effectiveCivilCaseId, onGetRequestListClient]);

  // ! 전체 아이템 목록 정규화
  const allItems: TReqItem[] = useMemo(() => {
    const base = Array.isArray(items) && items.length > 0 ? items : fetchedItems;
    return (base ?? []) as unknown as TReqItem[];
  }, [fetchedItems, items]);

  // ! 새 요청 / 확인한 요청 분류
  const { newItems, checkedItems } = useMemo(() => {
    const newReqItems: TReqItem[] = [];
    const checkedReqItems: TReqItem[] = [];
    for (const item of allItems) {
      const checked = Boolean((item as any)?.is_response_read);
      if (checked) checkedReqItems.push(item);
      else newReqItems.push(item);
    }
    return { newItems: newReqItems, checkedItems: checkedReqItems };
  }, [allItems]);

  return (
    <div className='flex min-h-0 w-full flex-1 flex-col overflow-hidden bg-white'>
      <div className='flex items-center justify-between px-4 pt-4'>
        <div className='text-[20px] font-bold text-[#18181B]'>자료 제출하기</div>
        <button
          type='button'
          className='h-[32px] rounded-[10px] bg-[#69C0FF] px-3 text-[12px] font-semibold text-white hover:bg-[#43A5FF]'
          onClick={() => onMessageToast({ message: '기타 자료 제출 기능은 준비 중입니다.' })}
        >
          기타 자료 제출하기
        </button>
      </div>

      <div className='relative mt-3 flex min-h-0 flex-1 flex-col overflow-hidden'>
        <div className='min-h-0 flex-1 overflow-auto'>
          {isLoading || isPending ? (
            <div className='h-full w-full px-3 py-3'>
              <div className='rounded-[12px] bg-white'>
                <div className='border-b border-[#E4E4E7] px-4 py-3' />
                {Array.from({ length: 10 }).map((_, i) => (
                  <div key={i} className='flex h-[44px] items-center border-b border-[#E4E4E7] px-4'>
                    <div className='h-[12px] w-[240px] rounded-full bg-[#F4F4F5]' />
                    <div className='ml-auto h-[12px] w-[60px] rounded-full bg-[#F4F4F5]' />
                  </div>
                ))}
              </div>
            </div>
          ) : (
            <div className='border-t border-[#E4E4E7]'>
              <Section title='새 요청' open={openNew} onToggle={() => setOpenNew((v) => !v)}>
                {newItems.length === 0 ? (
                  <div className='px-4 py-4 text-[14px] text-[#8A8A8E]'>데이터가 없습니다</div>
                ) : (
                  newItems.map((x: any) => {
                    const id = String(x?.request_id ?? '');
                    const selected = id && selectedRequestId ? id === selectedRequestId : false;
                    const submitted = isSubmitted(x);
                    return (
                      <button
                        key={id || String(Math.random())}
                        type='button'
                        className={`flex h-[44px] w-full items-center gap-3 border-t border-[#E4E4E7] px-4 text-left text-[14px] ${
                          selected ? 'bg-[#E4E4E7]' : submitted ? 'bg-[#F4F4F5]' : 'bg-white hover:bg-[#F4F4F5]'
                        }`}
                        onClick={() => onSelectRequest?.(x)}
                      >
                        <div className='min-w-0 flex-1 truncate text-[14px] font-medium text-[#09090B]'>
                          {String(x?.request_text ?? '-')}
                        </div>
                        <div className='shrink-0 text-[12px] font-medium text-[#A1A1AA]'>{submitted ? '제출 완료' : '제출하기'}</div>
                      </button>
                    );
                  })
                )}
              </Section>

              <Section title='확인한 요청' open={openChecked} onToggle={() => setOpenChecked((v) => !v)}>
                {checkedItems.length === 0 ? (
                  <div className='px-4 py-4 text-[14px] text-[#8A8A8E]'>데이터가 없습니다</div>
                ) : (
                  checkedItems.map((x: any) => {
                    const id = String(x?.request_id ?? '');
                    const selected = id && selectedRequestId ? id === selectedRequestId : false;
                    const submitted = isSubmitted(x);
                    return (
                      <button
                        key={id || String(Math.random())}
                        type='button'
                        className={`flex h-[44px] w-full items-center gap-3 border-t border-[#E4E4E7] px-4 text-left text-[14px] ${
                          selected ? 'bg-[#E4E4E7]' : submitted ? 'bg-[#F4F4F5]' : 'bg-white hover:bg-[#F4F4F5]'
                        }`}
                        onClick={() => onSelectRequest?.(x)}
                      >
                        <div className='min-w-0 flex-1 truncate text-[14px] font-medium text-[#09090B]'>
                          {String(x?.request_text ?? '-')}
                        </div>
                        <div className='shrink-0 text-[12px] font-medium text-[#A1A1AA]'>{submitted ? '제출 완료' : '제출하기'}</div>
                      </button>
                    );
                  })
                )}
              </Section>
            </div>
          )}
        </div>

        <div className='flex h-[44px] shrink-0 items-center gap-2 px-4 text-[12px] text-[#A1A1AA]'>
          <span>powered by</span>
          <img src={AiLexLogo} alt='AiLex' className='h-[18px] w-auto' />
        </div>
      </div>
    </div>
  );
}
