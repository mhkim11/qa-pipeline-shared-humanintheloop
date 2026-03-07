import { useEffect, useMemo, useState } from 'react';

import { ChevronDown, ChevronRight, Image, Pencil, UserRound } from 'lucide-react';
import { Tooltip } from 'react-tooltip';

import type { TRequestListClientDetailOutput } from '@/apis/type/case-type/request-type';
import ClientMessageComposer from '@/components/case-evidence/request-list/modal/client-message-composer';
import { useGetRequestListClientDetail } from '@/hooks/react-query/mutation/case';
import { useGetRequestMessagesClient } from '@/hooks/react-query/mutation/case/use-get-request-messages-client';

type TRequestDetailPanelProps = {
  requestId?: string | null;
  clientEmail?: string;
  request?: any | null; // 미리보기/레거시 전용
  isLoading?: boolean;
};

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

// ! 날짜시간 포맷
const formatDateTime = (raw: unknown) => {
  const s = String(raw ?? '').trim();
  if (!s) return '';
  const d = new Date(s);
  if (Number.isNaN(d.getTime())) return s;
  const y = d.getFullYear();
  const mm = String(d.getMonth() + 1).padStart(2, '0');
  const dd = String(d.getDate()).padStart(2, '0');
  const hh = String(d.getHours()).padStart(2, '0');
  const min = String(d.getMinutes()).padStart(2, '0');
  return `${y}.${mm}.${dd} ${hh}:${min}`;
};

// ! 미디어 URL 정규화
const BUCKET_BASE_URL = 'https://kr.object.ncloudstorage.com/ailex/';
const normalizeMediaUrl = (rawUrl?: string | null) => {
  let url = String(rawUrl ?? '').trim();
  if (!url) return '';
  // 중복 http(s):// 처리
  const httpRegex = /https?:\/\//g;
  let match: RegExpExecArray | null;
  let lastHttpIndex = -1;
  while ((match = httpRegex.exec(url)) !== null) lastHttpIndex = match.index;
  if (lastHttpIndex > 0) url = url.substring(lastHttpIndex);
  if (url && !url.startsWith('http')) {
    const trimmed = url.startsWith('/') ? url.slice(1) : url;
    return `${BUCKET_BASE_URL}${trimmed}`;
  }
  return url;
};

// ! 유저 컬러 HEX 변환
const getUserColorHex = (colorKey?: string | null) => {
  const palette: Record<string, string> = {
    green: '#406CFF',
    brown: '#B6753F',
    orange: '#FF6B1B',
    yellow: '#F3AA00',
    lightgreen: '#3BBC07',
    darkgreen: '#799C19',
    skyblue: '#43A5FF',
    purple: '#AC58FF',
    pink: '#E739D5',
  };
  const k = String(colorKey ?? '').trim();
  return palette[k] || '#E4E4E7';
};

export default function ClientRequestDetailPanel({
  requestId,
  clientEmail,
  request,
  isLoading = false,
}: TRequestDetailPanelProps): JSX.Element {
  const { onGetRequestListClientDetail, isPending } = useGetRequestListClientDetail();
  const [fetched, setFetched] = useState<TRequestListClientDetailOutput | null>(null);
  const { onGetRequestMessagesClient, isPending: isMessagesPending } = useGetRequestMessagesClient();
  const [messages, setMessages] = useState<any[]>([]);
  const [collapsedMessageIds, setCollapsedMessageIds] = useState<Set<string>>(new Set());
  const [composerHeightPx, setComposerHeightPx] = useState(0);

  // ! 클라이언트 요청 상세 데이터 패치
  useEffect(() => {
    let mounted = true;
    (async () => {
      const id = String(requestId ?? '').trim();
      const email = String(clientEmail ?? '').trim();
      if (!id || !email) {
        if (mounted) setFetched(null);
        return;
      }
      const res = await onGetRequestListClientDetail({
        request_id: id,
        client_email: email,
      });
      if (!mounted) return;
      setFetched((res ?? null) as any);
    })();
    return () => {
      mounted = false;
    };
  }, [clientEmail, onGetRequestListClientDetail, requestId]);

  // ! 요청 메시지 목록 패치
  useEffect(() => {
    let mounted = true;
    (async () => {
      const id = String(requestId ?? '').trim();
      if (!id) {
        if (mounted) {
          setMessages([]);
          setCollapsedMessageIds(new Set());
        }
        return;
      }
      const res = await onGetRequestMessagesClient({
        requestId: id,
        page: 1,
        limit: 50,
      });
      if (!mounted) return;
      const next = Array.isArray((res as any)?.results) ? ((res as any).results as any[]) : [];
      setMessages(next);
      setCollapsedMessageIds(new Set());
    })();
    return () => {
      mounted = false;
    };
  }, [onGetRequestMessagesClient, requestId]);

  // ! 작성기 높이 초기화
  useEffect(() => {
    if (!requestId) setComposerHeightPx(0);
  }, [requestId]);

  // ! 유효 요청 데이터 계산
  const effectiveRequest: any = useMemo(() => {
    // 일부 환경에서 { result }로 래핑되는 경우 처리
    return (fetched as any)?.result ?? fetched ?? request ?? null;
  }, [fetched, request]);

  const title = String(effectiveRequest?.request_text ?? '').trim() || '요청을 선택해주세요';
  const _date = formatDate(effectiveRequest?.requested_at ?? effectiveRequest?.created_at ?? effectiveRequest?.updated_at);
  const requestedBy = effectiveRequest?.requested_by;
  const requestedByName = String(requestedBy?.name ?? '').trim();
  const requestedByNickname = String(requestedBy?.nickname ?? '').trim();
  const _thumbUrl = normalizeMediaUrl(requestedBy?.thumbnail);
  const _colorHex = getUserColorHex(requestedBy?.color ?? null);
  const badgeText = requestedByNickname || requestedByName || '';
  const _badgeInitial = badgeText ? badgeText.charAt(0) : '';

  // ! 첫 번째 변호사 메시지 ID 추출 (안내문 한 번만 노출)
  const firstLawyerMessageId = useMemo(() => {
    const list = Array.isArray(messages) ? messages : [];
    for (let i = 0; i < list.length; i += 1) {
      const m = list[i];
      const senderType = String(m?.sender_type ?? '')
        .trim()
        .toUpperCase();
      if (senderType === 'LAWYER') {
        return String(m?.message_id ?? '').trim();
      }
    }
    return '';
  }, [messages]);

  return (
    <div className='relative flex h-full min-h-0 w-full flex-col overflow-hidden bg-[#E3EAF2]'>
      {/* top title bar */}
      <div className='flex h-[56px] items-center justify-between border-b border-l border-[#E4E4E7] bg-white px-4'>
        <div className='flex min-w-0 items-center gap-2'>
          <div className='min-w-0 truncate text-[14px] font-semibold text-[#18181B]'>{title}</div>
          {request ? <Pencil className='h-[16px] w-[16px] text-[#8A8A8E]' /> : null}
        </div>
      </div>

      <div
        className='min-h-0 flex-1 overflow-auto p-6'
        style={{ paddingBottom: requestId ? `${Math.max(24, composerHeightPx + 16)}px` : '24px' }}
      >
        {isLoading || isPending || isMessagesPending ? (
          <div className='flex h-full items-center justify-center text-[14px] text-[#8A8A8E]'>불러오는 중...</div>
        ) : !requestId ? (
          <div className='flex h-full items-center justify-center text-[14px] text-[#8A8A8E]'>왼쪽에서 요청을 선택해주세요.</div>
        ) : (
          <div className='flex w-full flex-col gap-4'>
            {/* 메시지 목록 (의뢰인 오른쪽, 변호사 왼쪽) */}
            {messages.length === 0 ? (
              <div className='py-6 text-center text-[14px] text-[#8A8A8E]'>메세지가 없습니다.</div>
            ) : (
              <div className='flex flex-col gap-4'>
                {messages.map((m: any, idx: number) => {
                  const msgId = String(m?.message_id ?? '').trim() || String(idx);
                  const text = String(m?.message_text ?? '').trim();
                  const img = normalizeMediaUrl(String(m?.linked_image_url ?? '').trim());
                  const created = String(m?.createdAt ?? m?.created_at ?? '').trim();
                  const senderType = String(m?.sender_type ?? '')
                    .trim()
                    .toUpperCase();
                  const isLawyer = senderType === 'LAWYER';
                  const isClient = !isLawyer;
                  const attachments = Array.isArray(m?.attachments) ? m.attachments : [];

                  const createdBy = m?.created_by ?? null;
                  const senderName = String(createdBy?.name ?? m?.sender?.name ?? '').trim();

                  const senderThumb = normalizeMediaUrl(createdBy?.thumbnail_url ?? null);

                  const dateTime = formatDateTime(created);

                  const isCollapsed = collapsedMessageIds.has(msgId);

                  const justify = isClient ? 'justify-end' : 'justify-start';

                  return (
                    <div key={msgId} className='flex flex-col gap-2'>
                      <div className={`flex w-full ${justify}`}>
                        <div className='flex w-[640px] max-w-full flex-col gap-2'>
                          <button
                            type='button'
                            className='mb-2 flex w-full items-center justify-between rounded-[10px] px-1 py-1 text-left'
                            onClick={() => {
                              setCollapsedMessageIds((prev) => {
                                const next = new Set(prev);
                                if (next.has(msgId)) next.delete(msgId);
                                else next.add(msgId);
                                return next;
                              });
                            }}
                          >
                            <div className='flex shrink-0 items-center gap-2'>
                              {senderThumb ? (
                                <img src={senderThumb} alt='' className='h-[20px] w-[20px] rounded-full object-cover' />
                              ) : (
                                <div className='flex h-[20px] w-[20px] items-center justify-center rounded-full bg-white text-[12px] font-bold text-white'>
                                  {/* 유저아이콘 */}
                                  <UserRound className='h-4 w-4 shrink-0 text-[#52525B]' />
                                </div>
                              )}
                              <span className='text-[13px] font-semibold text-[#18181B]'>{isLawyer ? `${senderName} 변호사` : '나'}</span>
                            </div>

                            <div className='flex items-center gap-2'>
                              <span className='text-[12px] text-[#8A8A8E]'>{dateTime}</span>
                              {isCollapsed ? (
                                <ChevronRight className='h-5 w-5 text-[#8A8A8E]' />
                              ) : (
                                <ChevronDown className='h-5 w-5 text-[#8A8A8E]' />
                              )}
                            </div>
                          </button>

                          {!isCollapsed ? (
                            <div className='rounded-[14px] bg-white p-4 shadow-sm'>
                              {text ? <div className='whitespace-pre-wrap text-[14px] leading-6 text-[#000]'>{text}</div> : null}
                              {img ? (
                                <div className='mt-3 h-[128px] overflow-hidden rounded-[4px] border border-[#E4E4E7] bg-white'>
                                  <img src={img} alt='' className='h-full w-full object-contain' />
                                </div>
                              ) : null}
                              {/* 첨부 파일 목록 */}
                              {attachments.length > 0 ? (
                                <div className='mt-3 flex flex-col gap-2'>
                                  {attachments.map((att: any, attIdx: number) => {
                                    const fileName = String(att?.file_name ?? '').trim() || '파일';
                                    const attKey = String(att?.case_document_id ?? attIdx);
                                    return (
                                      <div
                                        key={attKey}
                                        className='group relative flex h-[32px] items-center gap-2 rounded-[8px] border border-[#E4E4E7] bg-[#fafafa] px-3'
                                        title='보안상의 이유로 이미 제출한 자료는 확인하실 수 없습니다.'
                                      >
                                        <Image className='h-5 w-5 shrink-0 text-[#8A8A8E]' />
                                        <span
                                          className='min-w-0 flex-1 truncate text-[13px] text-[#3F3F46]'
                                          data-tooltip-id='file-tooltip'
                                          data-tooltip-content={fileName}
                                        >
                                          {fileName}
                                        </span>
                                        {/* 파일명 호버 툴팁 */}
                                        <div className='pointer-events-none absolute bottom-full left-1/2 mb-2 hidden -translate-x-1/2 whitespace-nowrap rounded-[8px] bg-[#18181B] px-3 py-2 text-[12px] text-white group-hover:block'>
                                          보안상의 이유로 이미 제출한 자료는 확인하실 수 없습니다.
                                        </div>
                                      </div>
                                    );
                                  })}
                                </div>
                              ) : null}
                            </div>
                          ) : null}

                          {/* 안내 배너 (첫 변호사 요청 메시지 "바로 아래"에 별도 표시) */}
                          {isLawyer && msgId && msgId === firstLawyerMessageId ? (
                            <div className='mt-4 rounded-[10px] bg-[#FFEDD5] px-4 py-3 text-[13px] font-semibold leading-5 text-[#18181B]'>
                              <div>변호사님이 요청하신 자료를 첨부하여 설명을 작성해주세요.</div>
                              <div>관련 자료가 없다면 다른 자료를 추가하거나 메세지로 설명을 작성해주세요.</div>
                            </div>
                          ) : null}
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        )}
      </div>

      <ClientMessageComposer
        requestId={requestId}
        onMessagesRefresh={(next) => setMessages(next)}
        onHeightChange={(h) => setComposerHeightPx(h)}
      />
      <Tooltip
        id='file-tooltip'
        place='bottom'
        delayShow={100}
        className='custom-tooltip'
        style={{
          backgroundColor: '#333',
          color: '#fff',
          borderRadius: '4px',
          fontSize: '12px',
          zIndex: 9999,
          position: 'fixed',
        }}
      />
    </div>
  );
}
