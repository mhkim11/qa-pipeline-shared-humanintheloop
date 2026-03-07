import { useEffect, useMemo, useState } from 'react';

import { ChevronDown, ChevronRight, ExternalLink, File, Image, Pencil, UserRound } from 'lucide-react';
import { Tooltip } from 'react-tooltip';

import type { TRequestDetailOutput } from '@/apis/type/case-type/request-type';
import RequestAddMessagePopup from '@/components/case-evidence/request-list/modal/request-add-message-popup';
import { onMessageToast } from '@/components/utils/global-utils';
import { useCreateLawyerRequestMessage } from '@/hooks/react-query/mutation/case/use-create-lawyer-request-message';
import { useGetRequestMessages } from '@/hooks/react-query/mutation/case/use-get-request-messages';

type TRequestDetailPanelProps = {
  request?: TRequestDetailOutput['result'] | null;
  isLoading?: boolean;
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

// ! 파일 새 창에서 열기
const openFileInNewWindow = (url: string) => {
  const u = String(url ?? '').trim();
  if (!u) return;
  const newWindow = window.open(u, '_blank', 'noopener,noreferrer');
  if (!newWindow) {
    onMessageToast({ message: '팝업 차단이 활성화되어 있습니다. 팝업 차단을 해제해주세요.' });
  }
};

// ! 사건 문서 새 창에서 열기
const openCaseDocumentInNewWindow = (civilCaseId: string, caseDocumentId: string) => {
  const ccid = String(civilCaseId ?? '').trim();
  const docId = String(caseDocumentId ?? '').trim();
  if (!ccid || !docId) return;
  const qs = new URLSearchParams();
  qs.set('civil_case_id', ccid);
  qs.set('tab', 'client_list'); // 자료 목록
  qs.set('case_document_id', docId);
  const newWindow = window.open(`/case-list?${qs.toString()}`, '_blank', 'noopener,noreferrer');
  if (!newWindow) {
    onMessageToast({ message: '팝업 차단이 활성화되어 있습니다. 팝업 차단을 해제해주세요.' });
  }
};

// ! 파일 확장자 추출
const getFileExtension = (raw?: string | null) => {
  const s = String(raw ?? '').trim();
  if (!s) return '';
  const clean = s.split('?')[0].split('#')[0];
  const idx = clean.lastIndexOf('.');
  if (idx === -1) return '';
  return clean.slice(idx + 1).toLowerCase();
};

// ! 이미지 파일 여부 확인
const isImageFile = (raw?: string | null) => {
  const ext = getFileExtension(raw);
  return ext === 'png' || ext === 'jpg' || ext === 'jpeg';
};

// ! 파일 크기 포맷
const formatFileSize = (bytes?: number | null) => {
  const n = Number(bytes ?? 0);
  if (!Number.isFinite(n) || n <= 0) return '';
  const kb = n / 1024;
  if (kb < 1024) return `${kb.toFixed(0)}KB`;
  const mb = kb / 1024;
  return `${mb.toFixed(1)}MB`;
};

// const getUserColorHex = (colorKey?: string | null) => {
//   const palette: Record<string, string> = {
//     green: '#406CFF',
//     brown: '#B6753F',
//     orange: '#FF6B1B',
//     yellow: '#F3AA00',
//     lightgreen: '#3BBC07',
//     darkgreen: '#799C19',
//     skyblue: '#43A5FF',
//     purple: '#AC58FF',
//     pink: '#E739D5',
//   };
//   const k = String(colorKey ?? '').trim();
//   return palette[k] || '#E4E4E7';
// };

export default function RequestDetailPanel({ request, isLoading = false }: TRequestDetailPanelProps): JSX.Element {
  const title = String(request?.request_text ?? '').trim() || '요청을 선택해주세요';

  const [isAddRequestOpen, setIsAddRequestOpen] = useState(false);
  const [addMessageText, setAddMessageText] = useState('');
  const [attachmentActionById, setAttachmentActionById] = useState<Record<string, 'save' | 'hide'>>({});

  const { isPending: isCreatingMessage, onCreateLawyerRequestMessage } = useCreateLawyerRequestMessage();
  const { isPending: isMessagesLoading, onGetRequestMessages } = useGetRequestMessages();
  const [messages, setMessages] = useState<any[]>([]);
  const [collapsedMessageIds, setCollapsedMessageIds] = useState<Set<string>>(new Set());

  // ! 클라이언트 이메일 및 민사 사건 ID 추출
  const clientEmail = useMemo(() => String((request as any)?.client_email ?? '').trim(), [request]);
  const targetCivilCaseId = useMemo(() => String((request as any)?.civil_case_id ?? '').trim(), [request]);

  // ! 요청 링크 생성
  const requestLink = useMemo(() => {
    const civilCaseId = String(request?.civil_case_id ?? '')
      .trim()
      .replace(/\\/g, '');
    const requestId = String(request?.request_id ?? '')
      .trim()
      .replace(/\\/g, '');
    if (!civilCaseId) return '';
    const params = new URLSearchParams();
    params.set('civil_case_id', civilCaseId);
    if (requestId) params.set('request_id', requestId);
    if (clientEmail) params.set('client_email', clientEmail);
    return `https://staging.ailex.co.kr/evidence-request?${params.toString()}`;
  }, [clientEmail, request?.civil_case_id, request?.request_id]);

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

  // ! 요청 메시지 목록 패치
  useEffect(() => {
    let mounted = true;
    const id = String(request?.request_id ?? '').trim();
    if (!id) {
      setMessages([]);
      setCollapsedMessageIds(new Set());
      setAttachmentActionById({});
      return;
    }
    void (async () => {
      const res = await onGetRequestMessages({
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
  }, [onGetRequestMessages, request?.request_id]);

  // ! 첨부 파일 액션 상태 동기화
  useEffect(() => {
    const next: Record<string, 'save' | 'hide'> = {};
    for (const m of messages) {
      const attachments = Array.isArray(m?.attachments) ? m.attachments : [];
      for (const att of attachments) {
        const attKey = String(att?.case_document_id ?? '').trim();
        if (!attKey) continue;
        const category = String(att?.evidence_category ?? '')
          .trim()
          .toUpperCase();
        if (category === 'RELEVANT') next[attKey] = 'save';
        else if (category === 'IRRELEVANT') next[attKey] = 'hide';
      }
    }
    setAttachmentActionById(next);
  }, [messages]);

  return (
    <div className='relative flex h-full min-h-0 w-full flex-col overflow-hidden bg-[#E3EAF2]'>
      {/* 상단 타이틀 바 */}
      <div className='flex h-[56px] items-center justify-between border-b border-l border-[#E4E4E7] bg-white px-4'>
        <div className='flex min-w-0 items-center gap-2'>
          <div className='min-w-0 truncate text-[14px] font-semibold text-[#18181B]'>{title}</div>
          {request ? <Pencil className='h-[16px] w-[16px] text-[#8A8A8E]' /> : null}
        </div>
      </div>

      {/* 콘텐츠 영역 */}
      <div className='max-h-[calc(100vh-200px)] flex-1 overflow-auto p-6'>
        {isLoading ? (
          <div className='flex h-full items-center justify-center'>
            <div className='flex flex-col items-center py-10'>
              <div className='h-[4px] w-[200px] overflow-hidden rounded-full bg-[#E4E4E7]'>
                <div
                  className='h-full w-[40%] rounded-full bg-[#69C0FF]'
                  style={{ animation: 'progressSlide 1.2s ease-in-out infinite' }}
                />
              </div>
            </div>
          </div>
        ) : !request ? (
          <div className='flex h-full items-center justify-center text-[14px] text-[#8A8A8E]'>왼쪽에서 요청을 선택해주세요.</div>
        ) : (
          <div className='flex w-full flex-col gap-2'>
            <div className='flex flex-col gap-4'>
              {isMessagesLoading ? (
                <div className='flex flex-col items-center py-10'>
                  <div className='h-[4px] w-[200px] overflow-hidden rounded-full bg-[#E4E4E7]'>
                    <div
                      className='h-full w-[40%] animate-[progressSlide_1.2s_ease-in-out_infinite] rounded-full bg-[#69C0FF]'
                      style={{ animation: 'progressSlide 1.2s ease-in-out infinite' }}
                    />
                  </div>
                  <style>{`
                    @keyframes progressSlide {
                      0% { transform: translateX(-100%); }
                      100% { transform: translateX(350%); }
                    }
                  `}</style>
                </div>
              ) : messages.length === 0 ? (
                <div className='py-6 text-center text-[14px] text-[#8A8A8E]'>메세지가 없습니다.</div>
              ) : (
                <div className='flex flex-col gap-4'>
                  {messages.map((m: any, idx: number) => {
                    const msgId = String(m?.message_id ?? '').trim() || String(idx);
                    const text = String(m?.message_text ?? '').trim();
                    const img = normalizeMediaUrl(String(m?.linked_image_url ?? '').trim());
                    const attachments = Array.isArray(m?.attachments) ? m.attachments : [];
                    const firstAttachmentCaseDocumentId = String(
                      attachments.find((a: any) => String(a?.case_document_id ?? '').trim())?.case_document_id ?? '',
                    ).trim();
                    // "전체 자료에서 열람하기"는 의뢰인이 보낸 자료(첨부) 문서를 대상으로 한다.
                    // 따라서 attachment의 case_document_id만 사용한다.
                    const openCaseDocumentId = firstAttachmentCaseDocumentId;
                    const created = String(m?.createdAt ?? m?.created_at ?? '').trim();
                    const senderType = String(m?.sender_type ?? '')
                      .trim()
                      .toUpperCase();
                    const isLawyer = senderType === 'LAWYER';
                    const createdBy = m?.created_by ?? null;
                    const senderName = String(createdBy?.name ?? m?.sender?.name ?? '').trim();
                    const senderThumb = normalizeMediaUrl(createdBy?.thumbnail_url ?? null);
                    // const senderNickname = String(createdBy?.nickname ?? '').trim();
                    // const senderColor = getUserColorHex(createdBy?.user_color ?? null);

                    const dateTime = formatDateTime(created);

                    const isCollapsed = collapsedMessageIds.has(msgId);

                    return (
                      <div key={msgId} className='flex flex-col gap-2'>
                        <div className={`flex w-full ${isLawyer ? 'justify-end pr-[5%]' : 'justify-start'}`}>
                          <div className='flex w-[640px] max-w-full flex-col gap-2'>
                            {' '}
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
                                <span className='text-[13px] font-semibold text-[#18181B]'>
                                  {isLawyer ? `${senderName} 변호사` : '의뢰인'}
                                </span>
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
                                <div className='flex gap-3'>
                                  <div className='min-w-0 flex-1'>
                                    {text ? <div className='whitespace-pre-wrap text-[14px] leading-6 text-[#000]'>{text}</div> : null}
                                    {img ? (
                                      <div className='mt-3'>
                                        <div className='rounded-[8px] border border-[#E4E4E7] bg-white p-2'>
                                          {isLawyer ? (
                                            <button
                                              type='button'
                                              className='block w-full cursor-pointer'
                                              onClick={() => openFileInNewWindow(img)}
                                              aria-label='이미지 새 창에서 보기'
                                            >
                                              <img src={img} alt='' className='max-h-[300px] w-full object-contain' />
                                            </button>
                                          ) : (
                                            <img src={img} alt='' className='max-h-[300px] w-full object-contain' />
                                          )}
                                        </div>
                                      </div>
                                    ) : null}

                                    {/* 첨부 파일 목록 */}
                                    {attachments.length > 0 ? (
                                      <div className='mt-3 flex flex-col gap-2'>
                                        {attachments.map((att: any, attIdx: number) => {
                                          const fileName = String(att?.file_name ?? '').trim() || '파일';
                                          const attKey = String(att?.case_document_id ?? attIdx);
                                          const fileUrl = normalizeMediaUrl(
                                            String(att?.file_url ?? att?.url ?? att?.file_path ?? '').trim(),
                                          );
                                          const disabled = !fileUrl;
                                          const isImage = isImageFile(att?.file_name ?? att?.file_path ?? att?.file_url ?? att?.url);
                                          const sizeLabel = formatFileSize(att?.file_size);
                                          const activeAction = attachmentActionById[attKey];
                                          return (
                                            <div
                                              key={attKey}
                                              className={`rounded-[8px] border border-[#E4E4E7] px-3 ${
                                                activeAction ? 'bg-[#F4F4F5]' : 'bg-white'
                                              } ${disabled ? 'opacity-60' : ''}`}
                                            >
                                              <div className='flex gap-2 py-[4px]'>
                                                <div>
                                                  {isImage ? (
                                                    <Image className='h-5 w-5 shrink-0 text-[#8A8A8E]' />
                                                  ) : (
                                                    <File className='h-5 w-5 shrink-0 text-[#8A8A8E]' />
                                                  )}
                                                </div>
                                                <div>
                                                  <div
                                                    className={`flex items-center justify-between gap-2 ${disabled ? '' : ''}`}
                                                    role='button'
                                                    tabIndex={0}
                                                    onKeyDown={(e) => {
                                                      if (disabled) return;
                                                      if (e.key === 'Enter' || e.key === ' ') openFileInNewWindow(fileUrl);
                                                    }}
                                                  >
                                                    <span
                                                      className='max-w-[350px] flex-1 truncate text-[13px] text-[#3F3F46]'
                                                      data-tooltip-id='file-tooltip'
                                                      data-tooltip-content={fileName}
                                                    >
                                                      {fileName}
                                                    </span>
                                                    {sizeLabel ? <span className='text-[12px] text-[#9CA3AF]'>{sizeLabel}</span> : null}
                                                  </div>
                                                </div>
                                              </div>
                                            </div>
                                          );
                                        })}
                                      </div>
                                    ) : null}

                                    {/* 전체 자료에서 열람하기 버튼 */}
                                    {targetCivilCaseId && openCaseDocumentId && attachments.length > 0 && !isLawyer ? (
                                      <button
                                        type='button'
                                        className='mt-1 inline-flex h-[32px] w-fit items-center gap-2 rounded-[8px] border border-[#D4D4D8] bg-white px-4 text-[12px] font-semibold text-[#18181B] hover:bg-[#F4F4F5]'
                                        onClick={() => openCaseDocumentInNewWindow(targetCivilCaseId, openCaseDocumentId)}
                                      >
                                        <span>전체 자료에서 열람하기</span>
                                        <ExternalLink className='h-4 w-4 text-[#18181B]' />
                                      </button>
                                    ) : null}
                                  </div>
                                </div>
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
          </div>
        )}
      </div>

      {/* 하단 액션 영역 */}
      {!isAddRequestOpen ? (
        <div className='flex h-[72px] items-center justify-center bg-transparent pb-4'>
          <button
            type='button'
            className='flex h-[40px] items-center justify-center rounded-full bg-[#69C0FF] px-5 text-[14px] font-semibold text-white shadow-md hover:bg-[#43A5FF]'
            onClick={() => {
              if (!request) return;
              setAddMessageText('');
              setIsAddRequestOpen(true);
            }}
          >
            요청 추가하기
          </button>
        </div>
      ) : null}

      {/* 추가 요청 팝업 */}
      <RequestAddMessagePopup
        isOpen={isAddRequestOpen}
        value={addMessageText}
        isSubmitting={Boolean(isCreatingMessage)}
        onChange={(v) => setAddMessageText(v)}
        onClose={() => setIsAddRequestOpen(false)}
        onSubmit={async () => {
          if (!request) return;
          const msg = String(addMessageText ?? '').trim();
          if (!msg) return;

          const res = await onCreateLawyerRequestMessage({
            requestId: String(request?.request_id ?? '').trim(),
            input: {
              message_text: msg,
              linked_image_url: '', // 메시지만 보낼 때는 이미지 URL 없음
              files: [],
            },
          });

          if (!res) {
            onMessageToast({ message: '추가 요청에 실패했습니다.' });
            return;
          }

          // 메시지 목록 갱신
          const id = String(request?.request_id ?? '').trim();
          if (id) {
            const nextRes = await onGetRequestMessages({
              requestId: id,
              page: 1,
              limit: 50,
            });
            const next = Array.isArray((nextRes as any)?.results) ? ((nextRes as any).results as any[]) : [];
            setMessages(next);
          }

          const ok = await copyToClipboard(requestLink);
          if (!ok)
            onMessageToast({
              message: '요청은 추가되었지만 링크 복사에 실패했습니다.',
            });
          else
            onMessageToast({
              message: '요청이 추가되었고 링크를 복사했습니다.',
            });

          setIsAddRequestOpen(false);
          setAddMessageText('');
        }}
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
