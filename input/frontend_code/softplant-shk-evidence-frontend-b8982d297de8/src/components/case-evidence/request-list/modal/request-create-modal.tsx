import { useCallback, useEffect, useMemo, useRef, useState } from 'react';

import { useQueryClient } from '@tanstack/react-query';
import { Check, X } from 'lucide-react';

import type { TGetClippingListOutput } from '@/apis/type/case-type/cliping.type';
import { onMessageToast } from '@/components/utils/global-utils';
import { useCreateRequest } from '@/hooks/react-query/mutation/case/use-create-request';
import { useCreateRequestDraft } from '@/hooks/react-query/mutation/case/use-create-request-draft';
import { useSendRequest } from '@/hooks/react-query/mutation/case/use-send-request';
import { useUpdateRequest } from '@/hooks/react-query/mutation/case/use-update-request';
import { useGetClippingListForEvidenceRequest } from '@/hooks/react-query/query/case/use-get-clipping-list-for-evidence-request';
import { useGetMessageDraft } from '@/hooks/react-query/query/case/use-get-message-draft';
import { useGetRequestClientEmails } from '@/hooks/react-query/query/case/use-get-request-client-emails';
import { useGetRequestDraftByTarget } from '@/hooks/react-query/query/case/use-get-request-draft-by-target';
import { useFindUserInfo } from '@/hooks/react-query/query/evidence/use-find-user-info';

type TRequestCreateModalProps = {
  isOpen: boolean;
  mode: 'highlight' | 'message';
  civilCaseId: string;
  highlightId: string;
  onClose: () => void;
};

const SESSION_CLIP_URL_KEY = 'ailex:lastClippingImageUrl';

// ! 미디어 URL 정규화
const normalizeMediaUrl = (rawUrl?: string | null) => {
  let url = String(rawUrl ?? '').trim();
  if (!url) return '';
  const httpRegex = /https?:\/\//g;
  let match: RegExpExecArray | null;
  let lastHttpIndex = -1;
  while ((match = httpRegex.exec(url)) !== null) lastHttpIndex = match.index;
  if (lastHttpIndex > 0) url = url.substring(lastHttpIndex);
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
  return palette[k] || (k.startsWith('#') ? k : '#71717A');
};

// ! 상대 시간 포맷
const formatRelativeTimeKo = (iso?: string | null) => {
  const s = String(iso ?? '').trim();
  if (!s) return '';
  const d = new Date(s);
  const t = d.getTime();
  if (Number.isNaN(t)) return '';
  const diffSec = Math.floor((Date.now() - t) / 1000);
  if (diffSec < 60) return '방금 전';
  const diffMin = Math.floor(diffSec / 60);
  if (diffMin < 60) return `${diffMin}분 전`;
  const diffHour = Math.floor(diffMin / 60);
  if (diffHour < 24) return `${diffHour}시간 전`;
  const diffDay = Math.floor(diffHour / 24);
  return `${diffDay}일 전`;
};

export default function RequestCreateModal({
  isOpen,
  mode,
  civilCaseId,
  highlightId,
  onClose,
}: TRequestCreateModalProps): JSX.Element | null {
  const queryClient = useQueryClient();
  const { isPending: isCreatePending, onCreateRequest } = useCreateRequest();
  const { isPending: isDraftPending, onCreateRequestDraft } = useCreateRequestDraft();
  const { isPending: isUpdatePending, onUpdateRequest } = useUpdateRequest();
  const { isPending: isSendPending, onSendRequest } = useSendRequest();
  const firstFieldRef = useRef<HTMLInputElement | null>(null);
  const emailInputRef = useRef<HTMLInputElement | null>(null);
  const emailTouchedRef = useRef(false);
  // 하이라이트 카드별 폼 값을 로컬에 즉시 캐싱 (API 왕복 없이 카드 전환 시 복원)
  const localFormCacheRef = useRef<Record<string, { request_text: string; message_text: string }>>({});
  const { response: userInfo } = useFindUserInfo({ enabled: isOpen });
  const assigneeId = String((userInfo as any)?.data?.user_id ?? '').trim();

  // ! 세션 클립 URL 초기값 추출
  const initialLinkedUrl = useMemo(() => {
    if (typeof window === 'undefined') return '';
    return String(window.sessionStorage.getItem(SESSION_CLIP_URL_KEY) ?? '').trim();
  }, []);

  const [requestText, setRequestText] = useState('');
  const [messageText, setMessageText] = useState('');
  // 의뢰인/담당자/첨부파일은 "메일로 보내기" 기능에서 받을 예정이라 UI에서 제거
  const [isMailChecked, setIsMailChecked] = useState(false);
  const [emailInput, setEmailInput] = useState('');
  const [selectedEmails, setSelectedEmails] = useState<string[]>([]);
  const [emailActiveIndex, setEmailActiveIndex] = useState(0);
  // message mode에서 메일 자동완성 검색 결과가 "없음"이면,
  // 같은 prefix로는 추가 호출을 멈춰(타이핑 끝날 때까지 계속 호출되는 문제 방지)준다.
  const [emailNoResultPrefix, setEmailNoResultPrefix] = useState<string>('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const isBusy = isSubmitting || isCreatePending || isDraftPending || isUpdatePending || isSendPending;

  const { response: clippingListResponse, isLoading: isClippingLoading } = useGetClippingListForEvidenceRequest({
    civilCaseId,
    status: 'all',
    enabled: isOpen && mode === 'highlight' && !!civilCaseId,
  });

  const emailSearchValue = emailInput.trim();
  const shouldSearchEmails = emailSearchValue.length >= 2;
  const emailSearchKey = emailSearchValue.toLowerCase();
  const isEmailSearchBlocked =
    mode === 'message' &&
    !!emailNoResultPrefix &&
    emailSearchKey.startsWith(emailNoResultPrefix) &&
    emailSearchKey.length >= emailNoResultPrefix.length;
  const enableEmailSearch = isOpen && isMailChecked && !!civilCaseId && shouldSearchEmails && !isEmailSearchBlocked;

  const { response: clientEmailsResponse, isLoading: isClientEmailsLoading } = useGetRequestClientEmails({
    input: enableEmailSearch
      ? {
          civil_case_id: String(civilCaseId),
          search: emailSearchValue,
        }
      : null,
    enabled: enableEmailSearch,
  });

  const { response: messageDraftResponse, isFetching: isMessageDraftFetching } = useGetMessageDraft({
    civilCaseId,
    enabled: isOpen && mode === 'message' && !!civilCaseId,
  });

  // message mode: 결과가 없으면 prefix를 저장해 추가 호출을 막고,
  // 입력이 변경/삭제되어 prefix가 달라지면 다시 검색할 수 있게 prefix를 해제한다.
  useEffect(() => {
    if (!isOpen) return;
    if (mode !== 'message') {
      if (emailNoResultPrefix) setEmailNoResultPrefix('');
      return;
    }
    if (!emailSearchKey || emailSearchKey.length < 2) {
      if (emailNoResultPrefix) setEmailNoResultPrefix('');
      return;
    }
    if (emailNoResultPrefix && !emailSearchKey.startsWith(emailNoResultPrefix)) {
      setEmailNoResultPrefix('');
    }
  }, [emailNoResultPrefix, emailSearchKey, isOpen, mode]);

  // ! 클리핑 목록 정규화
  const clippingItems = useMemo(() => {
    const r = clippingListResponse as TGetClippingListOutput | undefined;
    const data = (r as any)?.data ?? r;
    return (data?.clippings ?? data?.results ?? []) as any[];
  }, [clippingListResponse]);

  // ! 클라이언트 이메일 자동완성 옵션
  const clientEmailOptions = useMemo(() => {
    if (!shouldSearchEmails) return [];
    const data = (clientEmailsResponse as any)?.data ?? clientEmailsResponse;
    const raw = (data?.emails ?? data?.results ?? []) as any[];
    const selectedLower = new Set(selectedEmails.map((x) => x.toLowerCase()));
    return raw
      .map((x: any) => {
        if (typeof x === 'string') return x.trim();
        if (x && typeof x === 'object') return String(x.email ?? x.value ?? x.label ?? '').trim();
        return String(x ?? '').trim();
      })
      .filter((x: string) => x)
      .filter((x: string) => !selectedLower.has(x.toLowerCase()));
  }, [clientEmailsResponse, selectedEmails, shouldSearchEmails]);

  useEffect(() => {
    if (!isOpen) return;
    if (mode !== 'message') return;
    if (!enableEmailSearch) return;
    if (isClientEmailsLoading) return;
    if (!shouldSearchEmails) return;

    const data = (clientEmailsResponse as any)?.data ?? clientEmailsResponse;
    const raw = (data?.emails ?? data?.results ?? []) as any[];
    const normalized = raw
      .map((x: any) => {
        if (typeof x === 'string') return x.trim();
        if (x && typeof x === 'object') return String(x.email ?? x.value ?? x.label ?? '').trim();
        return String(x ?? '').trim();
      })
      .filter(Boolean);

    if (normalized.length === 0) {
      setEmailNoResultPrefix(emailSearchKey);
    } else if (emailNoResultPrefix) {
      // 결과가 다시 생기면 unblock
      setEmailNoResultPrefix('');
    }
  }, [
    clientEmailsResponse,
    emailNoResultPrefix,
    emailSearchKey,
    enableEmailSearch,
    isClientEmailsLoading,
    isOpen,
    mode,
    shouldSearchEmails,
  ]);

  useEffect(() => {
    if (!clientEmailOptions.length) return;
    setEmailActiveIndex(0);
  }, [clientEmailOptions]);

  const [selectedHighlightIds, setSelectedHighlightIds] = useState<Set<string>>(new Set());
  const [activeHighlightId, setActiveHighlightId] = useState<string>('');

  const [draftRequestIdsByTarget, setDraftRequestIdsByTarget] = useState<Record<string, string>>({});
  const [draftClientNameByTarget, setDraftClientNameByTarget] = useState<Record<string, string>>({});
  const [draftDirtyByTarget, setDraftDirtyByTarget] = useState<Record<string, boolean>>({});
  const [draftSnapshotByTarget, setDraftSnapshotByTarget] = useState<
    Record<
      string,
      {
        request_text: string;
        message_text: string;
        client_name: string;
        client_email: string;
        linked_image_url: string;
      }
    >
  >({});
  const hydratedTargetRef = useRef<string>('');
  const lastActiveTargetRef = useRef<string>('');
  const messageDraftHydratedRef = useRef(false);

  useEffect(() => {
    if (!isOpen) return;
    // 모달 열릴 때마다 폼 초기화 (이전 값 남지 않도록)
    setRequestText('');
    setMessageText('');
    setSelectedHighlightIds(new Set());
    setActiveHighlightId('');

    setIsMailChecked(false);
    setEmailInput('');
    setSelectedEmails([]);
    setEmailNoResultPrefix('');
    setIsSubmitting(false);
    emailTouchedRef.current = false;
    setDraftRequestIdsByTarget({});
    setDraftClientNameByTarget({});
    setDraftDirtyByTarget({});
    hydratedTargetRef.current = '';
    messageDraftHydratedRef.current = false;
    localFormCacheRef.current = {};
    // 첫 번째 필드로 포커스 이동
    requestAnimationFrame(() => firstFieldRef.current?.focus());
  }, [initialLinkedUrl, isOpen, mode]);

  // message mode: 임시저장된 드래프트가 있으면 폼에 복원
  useEffect(() => {
    if (!isOpen || mode !== 'message') return;
    if (messageDraftHydratedRef.current) return;
    if (isMessageDraftFetching) return;
    const draft = (messageDraftResponse as any)?.result ?? (messageDraftResponse as any)?.data?.result ?? null;
    if (!draft) return;
    messageDraftHydratedRef.current = true;
    setRequestText(String(draft.request_text ?? ''));
    setMessageText(String(draft.message_text ?? ''));
    const emailSeed = String(draft.client_email ?? '').trim();
    if (emailSeed) {
      const seeds = emailSeed
        .split(/[,\s;]+/g)
        .map((x: string) => x.trim())
        .filter(Boolean);
      setSelectedEmails(seeds);
      setIsMailChecked(true);
    }
  }, [isOpen, mode, messageDraftResponse, isMessageDraftFetching]);

  useEffect(() => {
    if (!isOpen) return;
    if (mode !== 'highlight') return;
    // 하이라이트 모드 진입 시 외부 highlightId 또는 첫 번째 클리핑 사전 선택
    setSelectedHighlightIds((prev) => {
      if (prev.size > 0) return prev;
      const next = new Set<string>();
      const seed = String(highlightId ?? '').trim() || String(clippingItems[0]?.clipping_id ?? '').trim();
      if (seed) next.add(seed);
      return next;
    });
  }, [clippingItems, highlightId, isOpen, mode]);

  const selectedIdList = useMemo(() => Array.from(selectedHighlightIds.values()), [selectedHighlightIds]);
  const selectedCount = selectedIdList.length;

  const effectiveActiveId = selectedCount ? String(activeHighlightId || selectedIdList[0] || highlightId || '').trim() : '';
  useEffect(() => {
    if (effectiveActiveId) lastActiveTargetRef.current = effectiveActiveId;
  }, [effectiveActiveId]);
  const activeClip = effectiveActiveId
    ? (clippingItems.find((x: any) => String(x?.clipping_id ?? '').trim() === effectiveActiveId) as any)
    : null;
  const activeNote = String(activeClip?.notes?.[0]?.content ?? activeClip?.comment ?? '').trim();
  const activeCreator = activeClip?.created_by ?? null;
  const activeCreatorName = String(activeCreator?.nickname ?? activeCreator?.name ?? '').trim();
  const activeCreatorThumb = normalizeMediaUrl(activeCreator?.thumbnail_url ?? null);
  const activeCreatorColor = getUserColorHex(activeCreator?.user_color ?? null);
  const activeCreatorInitial = (activeCreatorName || ' ').slice(0, 1);
  const activeTime = formatRelativeTimeKo(String(activeClip?.created_at ?? activeClip?.createdAt ?? '').trim());

  // ! 드래프트 존재 여부 매핑
  const hasDraftById = useMemo(() => {
    const map: Record<string, boolean> = {};
    for (const item of clippingItems) {
      const id = String((item as any)?.clipping_id ?? '').trim();
      if (!id) continue;
      const raw = (item as any)?.hasDraft ?? (item as any)?.has_draft;
      map[id] = Boolean(raw);
    }
    return map;
  }, [clippingItems]);

  const activeClipHasDraft = Boolean(hasDraftById[effectiveActiveId]) || Boolean(draftRequestIdsByTarget[effectiveActiveId]);

  const { response: draftResponse, isFetching: isDraftFetching } = useGetRequestDraftByTarget({
    targetType: 'CLIPPING',
    targetId: effectiveActiveId,
    enabled: isOpen && mode === 'highlight' && !!effectiveActiveId && activeClipHasDraft,
  });

  // ! 드래프트 데이터 정규화
  const draftData = useMemo(() => {
    const raw = (draftResponse as any)?.result ?? (draftResponse as any)?.data?.result ?? (draftResponse as any)?.data ?? null;
    if (!raw) return null;
    return raw;
  }, [draftResponse]);

  useEffect(() => {
    if (!isOpen || mode !== 'highlight') return;
    if (selectedCount === 0) {
      setActiveHighlightId('');
      setRequestText('');
      setMessageText('');
      return;
    }
    if (!effectiveActiveId) return;
    if (draftDirtyByTarget[effectiveActiveId]) return;

    // 로컬 캐시에 이전에 입력한 값이 있으면 API 응답 대기 없이 즉시 복원
    const cached = localFormCacheRef.current[effectiveActiveId];
    if (cached) {
      setRequestText(cached.request_text);
      setMessageText(cached.message_text);
      return;
    }

    // 이 카드에 드래프트가 없으면 빈 폼으로 초기화 (stale draftData 사용 방지)
    if (!activeClipHasDraft) {
      setRequestText('');
      setMessageText('');
      return;
    }

    // draft를 아직 가져오는 중이면 폼을 비우지 않고 대기
    if (isDraftFetching) return;

    // draftData가 없으면 빈 폼
    if (!draftData) {
      setRequestText('');
      setMessageText('');
      return;
    }

    const requestId = String(draftData?.request_id ?? '').trim();
    if (requestId) {
      setDraftRequestIdsByTarget((prev) => {
        if (prev[effectiveActiveId] === requestId) return prev;
        return { ...prev, [effectiveActiveId]: requestId };
      });
    }
    const newClientName = String(draftData?.client_name ?? '').trim();
    setDraftClientNameByTarget((prev) => {
      if (prev[effectiveActiveId] === newClientName) return prev;
      return { ...prev, [effectiveActiveId]: newClientName };
    });
    setRequestText(String(draftData?.request_text ?? ''));
    setMessageText(String(draftData?.message_text ?? ''));
    const emailSeed = String(draftData?.client_email ?? '').trim();
    if (emailSeed && !emailTouchedRef.current) {
      const seeds = emailSeed
        .split(/[,\s;]+/g)
        .map((x) => x.trim())
        .filter(Boolean);
      setSelectedEmails(seeds);
      setIsMailChecked(true);
    }
    // 값이 실제로 변경될 때만 새 객체 생성 (무한 루프 방지)
    setDraftDirtyByTarget((prev) => {
      if (!prev[effectiveActiveId]) return prev;
      return { ...prev, [effectiveActiveId]: false };
    });
    const newSnapshot = {
      request_text: String(draftData?.request_text ?? ''),
      message_text: String(draftData?.message_text ?? ''),
      client_name: String(draftData?.client_name ?? ''),
      client_email: String(draftData?.client_email ?? ''),
      linked_image_url: String(draftData?.linked_image_url ?? ''),
    };
    setDraftSnapshotByTarget((prev) => {
      const existing = prev[effectiveActiveId];
      if (
        existing &&
        existing.request_text === newSnapshot.request_text &&
        existing.message_text === newSnapshot.message_text &&
        existing.client_name === newSnapshot.client_name &&
        existing.client_email === newSnapshot.client_email &&
        existing.linked_image_url === newSnapshot.linked_image_url
      ) {
        return prev;
      }
      return { ...prev, [effectiveActiveId]: newSnapshot };
    });
    hydratedTargetRef.current = effectiveActiveId;
  }, [activeClipHasDraft, draftData, draftDirtyByTarget, effectiveActiveId, isDraftFetching, isOpen, mode, selectedCount]);

  // ! 드래프트 변경 플래그 설정
  const markDraftDirty = (targetId: string) => {
    if (!targetId) return;
    setDraftDirtyByTarget((prev) => ({ ...prev, [targetId]: true }));
  };

  // ! 이메일 값 정규화
  const normalizeEmailValue = (raw: string) => String(raw ?? '').trim();

  // ! 이메일 추가
  const addEmailValue = useCallback(
    (raw: string, opts?: { clearInput?: boolean }) => {
      const value = normalizeEmailValue(raw);
      if (!value) return;
      emailTouchedRef.current = true;
      setSelectedEmails((prev) => {
        const exists = prev.some((x) => x.toLowerCase() === value.toLowerCase());
        if (exists) return prev;
        return [...prev, value];
      });
      if (opts?.clearInput !== false) setEmailInput('');
      if (mode === 'highlight' && effectiveActiveId) markDraftDirty(effectiveActiveId);
    },
    [effectiveActiveId, mode],
  );

  // ! 이메일 제거
  const removeEmailValue = useCallback(
    (value: string) => {
      emailTouchedRef.current = true;
      setSelectedEmails((prev) => prev.filter((x) => x !== value));
      if (mode === 'highlight' && effectiveActiveId) markDraftDirty(effectiveActiveId);
    },
    [effectiveActiveId, mode],
  );

  // ! 최종 클라이언트 이메일 값 조합
  const resolveClientEmailValue = useCallback(() => {
    if (!isMailChecked) return '';
    const extra = String(emailInput ?? '').trim();
    const extraParts = extra
      ? extra
          .split(/[,\s;]+/g)
          .map((x) => x.trim())
          .filter(Boolean)
      : [];
    const all = [...(selectedEmails ?? []), ...extraParts].map((x) => String(x ?? '').trim()).filter(Boolean);
    const seen = new Set<string>();
    const uniq: string[] = [];
    for (const v of all) {
      const key = v.toLowerCase();
      if (seen.has(key)) continue;
      seen.add(key);
      uniq.push(v);
    }
    return uniq.join(',');
  }, [emailInput, isMailChecked, selectedEmails]);

  useEffect(() => {
    if (!clippingItems.length) return;
    setDraftRequestIdsByTarget((prev) => {
      const next = { ...prev };
      for (const item of clippingItems) {
        const id = String((item as any)?.clipping_id ?? '').trim();
        if (!id || next[id]) continue;
        const requestId = String(
          (item as any)?.request_id ??
            (item as any)?.draft_request_id ??
            (item as any)?.evidence_request_id ??
            (item as any)?.evidence_request?.request_id ??
            '',
        ).trim();
        if (requestId) next[id] = requestId;
      }
      return next;
    });
  }, [clippingItems]);

  // ! 현재 활성 타겟 ID 반환
  const resolveActiveTargetId = useCallback(() => {
    if (effectiveActiveId) return effectiveActiveId;
    if (lastActiveTargetRef.current) return lastActiveTargetRef.current;
    const selectedFirst = selectedIdList[0];
    if (selectedFirst) return selectedFirst;
    const firstClipId = String(clippingItems[0]?.clipping_id ?? '').trim();
    return firstClipId || '';
  }, [clippingItems, effectiveActiveId, selectedIdList]);

  // ! 클리핑 이미지 URL 반환
  const resolveLinkedImageUrl = useCallback(
    (targetId: string) => {
      if (!targetId) return '';
      const clip = clippingItems.find((x: any) => String(x?.clipping_id ?? '').trim() === targetId);
      return normalizeMediaUrl(String(clip?.attachment_url ?? '').trim());
    },
    [clippingItems],
  );

  // ! 클리핑 프로젝트 ID 반환
  const resolveProjectId = useCallback(
    (targetId: string) => {
      const clip = clippingItems.find((x: any) => String(x?.clipping_id ?? '').trim() === targetId);
      return String(clip?.project_id ?? clip?.case_document?.project_id ?? '').trim();
    },
    [clippingItems],
  );

  // ! 드래프트 저장 (변경 시에만)
  const saveDraftIfNeeded = useCallback(
    async (targetId: string, linkedImageUrl: string) => {
      if (!targetId) return;
      const requestTextValue = requestText.trim();
      const messageTextValue = messageText.trim();
      const clientNameValue = String(draftClientNameByTarget[targetId] ?? '').trim();
      const clientEmailValue = resolveClientEmailValue();
      const linkedImageValue = String(linkedImageUrl ?? '').trim();
      if (!requestTextValue && !messageTextValue) return;
      const lastSnapshot = draftSnapshotByTarget[targetId];
      const existingDraftId = String(draftRequestIdsByTarget[targetId] ?? '').trim();

      // 드래프트가 이미 있으면 PATCH로 업데이트
      if (existingDraftId) {
        if (
          lastSnapshot &&
          lastSnapshot.request_text === requestTextValue &&
          lastSnapshot.message_text === messageTextValue &&
          lastSnapshot.client_name === clientNameValue &&
          lastSnapshot.client_email === clientEmailValue
        ) {
          return;
        }
        await onUpdateRequest({
          requestId: existingDraftId,
          input: {
            request_text: requestTextValue,
            message_text: messageTextValue,
            client_name: clientNameValue,
            client_email: clientEmailValue,
          },
        });
      } else {
        // 처음 저장 시: 드래프트 생성
        if (
          lastSnapshot &&
          lastSnapshot.request_text === requestTextValue &&
          lastSnapshot.message_text === messageTextValue &&
          lastSnapshot.client_name === clientNameValue &&
          lastSnapshot.client_email === clientEmailValue &&
          lastSnapshot.linked_image_url === linkedImageValue
        ) {
          return;
        }
        const draftRes = await onCreateRequestDraft({
          civil_case_id: civilCaseId,
          project_id: resolveProjectId(targetId),
          request_text: requestTextValue,
          message_text: messageTextValue,
          client_name: clientNameValue,
          client_email: clientEmailValue,
          target_type: 'CLIPPING',
          target_id: targetId,
          linked_image_url: linkedImageValue,
        });
        const draftReqId = String((draftRes as any)?.result?.request_id ?? (draftRes as any)?.data?.result?.request_id ?? '').trim();
        if (draftReqId) {
          setDraftRequestIdsByTarget((prev) => ({ ...prev, [targetId]: draftReqId }));
        }
      }
      setDraftDirtyByTarget((prev) => {
        if (!prev[targetId]) return prev;
        return { ...prev, [targetId]: false };
      });
      setDraftSnapshotByTarget((prev) => {
        const existing = prev[targetId];
        if (
          existing &&
          existing.request_text === requestTextValue &&
          existing.message_text === messageTextValue &&
          existing.client_name === clientNameValue &&
          existing.client_email === clientEmailValue &&
          existing.linked_image_url === linkedImageValue
        ) {
          return prev;
        }
        return {
          ...prev,
          [targetId]: {
            request_text: requestTextValue,
            message_text: messageTextValue,
            client_name: clientNameValue,
            client_email: clientEmailValue,
            linked_image_url: linkedImageValue,
          },
        };
      });
    },
    [
      civilCaseId,
      draftClientNameByTarget,
      draftRequestIdsByTarget,
      draftSnapshotByTarget,
      messageText,
      onCreateRequestDraft,
      onUpdateRequest,
      requestText,
      resolveClientEmailValue,
      resolveProjectId,
    ],
  );
  // ! 하이라이트 선택 핸들러
  const handleSelectHighlight = async (id: string) => {
    if (!id) return;
    const currentId = effectiveActiveId;

    // 현재 활성 카드의 폼 값을 로컬 캐시에 즉시 저장 (API 호출 전, 카드 전환 전)
    if (currentId) {
      localFormCacheRef.current[currentId] = {
        request_text: requestText,
        message_text: messageText,
      };
    }

    // 현재 활성 카드의 드래프트를 API에 저장 (체크 해제 시에도 저장)
    if (mode === 'highlight' && currentId) {
      const currentClip = clippingItems.find((x: any) => String(x?.clipping_id ?? '').trim() === currentId);
      const linkedImageUrl = normalizeMediaUrl(String(currentClip?.attachment_url ?? '').trim());
      await saveDraftIfNeeded(currentId, linkedImageUrl);
    }

    setSelectedHighlightIds((prev) => {
      const next = new Set(prev);
      if (next.has(id)) {
        next.delete(id);
        if (id === activeHighlightId) {
          const nextId = Array.from(next.values())[0] || '';
          setActiveHighlightId(nextId);
        }
      } else {
        next.add(id);
        setActiveHighlightId(id);
      }
      return next;
    });
  };

  const canSubmit =
    !!civilCaseId &&
    !!assigneeId &&
    !!requestText.trim() &&
    !!messageText.trim() &&
    (mode !== 'highlight' || selectedCount > 0) &&
    // 하이라이트 모드: 선택된 클리핑마다 이미지 URL(attachment_url)이 있어야 함
    (mode === 'message' ||
      selectedCount === 0 ||
      Array.from(selectedHighlightIds.values()).every((id) => {
        const clip = clippingItems.find((x: any) => String(x?.clipping_id ?? '').trim() === String(id).trim());
        return Boolean(String(clip?.attachment_url ?? '').trim());
      }));

  if (!isOpen) return null;

  return (
    <div className='fixed inset-0 z-[100000] flex items-center justify-center bg-black/40 px-4' role='dialog' aria-modal='true'>
      <div className='w-full max-w-[1040px] overflow-hidden rounded-[16px] bg-white shadow-xl'>
        <div className='flex items-center justify-between border-b border-[#E4E4E7] px-5 py-4'>
          <div className='text-[16px] font-bold text-[#18181B]'>
            {mode === 'message' ? '메세지로 자료 요청하기' : '의뢰인에게 자료요청하기'}
          </div>
          <button
            type='button'
            className='rounded-[10px] p-2 text-[#8A8A8E] hover:bg-[#F4F4F5]'
            onClick={async () => {
              if (isBusy) return;
              if (mode === 'highlight') {
                const targetId = resolveActiveTargetId();
                const linkedImageUrl = resolveLinkedImageUrl(targetId);
                await saveDraftIfNeeded(targetId, linkedImageUrl);
              }
              if (mode === 'message' && (requestText.trim() || messageText.trim())) {
                try {
                  const existingDraftId = String(
                    (messageDraftResponse as any)?.result?.request_id ?? (messageDraftResponse as any)?.data?.result?.request_id ?? '',
                  ).trim();
                  if (existingDraftId) {
                    await onUpdateRequest({
                      requestId: existingDraftId,
                      input: {
                        request_text: requestText.trim(),
                        message_text: messageText.trim(),
                        client_name: '',
                        client_email: resolveClientEmailValue(),
                      },
                    });
                  } else {
                    await onCreateRequest({
                      civil_case_id: civilCaseId,
                      request_text: requestText.trim(),
                      message_text: messageText.trim(),
                      linked_image_url: '',
                      client_email: resolveClientEmailValue(),
                      client_name: '',
                      assignee_id: assigneeId,
                      target_type: '',
                      target_id: '',
                      files: [],
                    });
                  }
                  onMessageToast({ message: '임시 저장되었습니다.' });
                } catch {
                  onMessageToast({ message: '임시 저장에 실패했습니다.' });
                }
              }
              onClose();
            }}
            aria-label='close'
            disabled={isBusy}
          >
            <X className='h-4 w-4' />
          </button>
        </div>
        <div className='border-b border-[#D4D4D8] p-[16px]'>
          <div className='flex items-center gap-2'>
            <input
              type='checkbox'
              checked={isMailChecked}
              onChange={(e) => {
                const next = e.target.checked;
                setIsMailChecked(next);
                emailTouchedRef.current = true;
                if (!next) {
                  setSelectedEmails([]);
                  setEmailInput('');
                }
                if (mode === 'highlight' && effectiveActiveId) markDraftDirty(effectiveActiveId);
              }}
              className='h-4 w-4 rounded-[4px] text-[#333] focus:ring-0'
            />
            <label className='text-[14px] text-[#3F3F46]'>메일로 보내기</label>
          </div>
          {isMailChecked ? (
            <div className='mt-3'>
              <div className='text-[12px] font-semibold text-[#18181B]'>메일 주소</div>
              <div className='mt-2 rounded-[8px] border border-[#D4D4D8] bg-white p-[1px] text-[#18181B] focus-within:border-[#18181B] focus-within:ring-1 focus-within:ring-[#18181B]'>
                <div
                  className='flex min-h-[44px] flex-wrap items-center gap-[8px] rounded-[7px] bg-white'
                  onMouseDown={(e) => {
                    // 컨테이너 클릭 시 입력 필드로 포커스 이동 (칩 스타일 멀티 입력)
                    const target = e.target as HTMLElement | null;
                    if (target?.closest('button')) return;
                    e.preventDefault();
                    emailInputRef.current?.focus();
                  }}
                  role='group'
                  aria-label='email-multi-input'
                >
                  {selectedEmails.map((email) => (
                    <div
                      key={email}
                      className='ml-1 flex h-[32px] items-center gap-2 rounded-[8px] border border-[#D4D4D8] px-2 text-[12px]'
                    >
                      <span className='font-bold'>{email}</span>
                      <button
                        type='button'
                        className='rounded-[4px] p-[2px] text-[#71717A] hover:bg-[#F4F4F5]'
                        onClick={() => removeEmailValue(email)}
                        aria-label={`remove-${email}`}
                      >
                        <X className='h-3 w-3' />
                      </button>
                    </div>
                  ))}
                  <input
                    ref={emailInputRef}
                    value={emailInput}
                    onChange={(e) => {
                      emailTouchedRef.current = true;
                      setEmailInput(e.target.value);
                    }}
                    onKeyDown={(e) => {
                      if (clientEmailOptions.length > 0 && (e.key === 'ArrowDown' || e.key === 'ArrowUp')) {
                        e.preventDefault();
                        setEmailActiveIndex((prev) => {
                          if (e.key === 'ArrowDown') return Math.min(prev + 1, clientEmailOptions.length - 1);
                          return Math.max(prev - 1, 0);
                        });
                        return;
                      }
                      if (clientEmailOptions.length > 0 && e.key === 'Enter') {
                        e.preventDefault();
                        const active = clientEmailOptions[emailActiveIndex] ?? clientEmailOptions[0];
                        if (active) {
                          addEmailValue(active); // selecting from list should clear the input
                          requestAnimationFrame(() => emailInputRef.current?.focus());
                        }
                        return;
                      }
                      if (e.key === 'Backspace' && !emailInput.trim() && selectedEmails.length > 0) {
                        e.preventDefault();
                        removeEmailValue(selectedEmails[selectedEmails.length - 1]);
                        return;
                      }
                      if (e.key === 'Enter' || e.key === ',') {
                        e.preventDefault();
                        addEmailValue(emailInput);
                      }
                    }}
                    placeholder={selectedEmails.length ? '' : '메일 주소 입력'}
                    className='h-[28px] min-w-[140px] flex-1 border-none bg-transparent text-[13px] text-[#18181B] outline-none placeholder:text-[#A1A1AA] focus:border-0 focus:outline-none focus:ring-0 focus:ring-offset-0 focus-visible:outline-none'
                  />
                </div>
              </div>
              {clientEmailOptions.length > 0 ? (
                <div className='mt-2 rounded-[8px] bg-white p-[1px] text-[13px] shadow-md'>
                  <div className='max-h-[132px] overflow-auto rounded-[7px] bg-white text-[13px]'>
                    {clientEmailOptions.map((email, idx) => {
                      const isActive = idx === emailActiveIndex;
                      return (
                        <button
                          key={email}
                          type='button'
                          className={`flex h-[32px] w-full items-center px-3 text-left text-[13px] text-[#18181B] ${
                            isActive ? 'bg-[#E4E4E7]' : 'hover:bg-[#E4E4E7]'
                          }`}
                          onMouseEnter={() => setEmailActiveIndex(idx)}
                          onMouseDown={(e) => {
                            // mousedown으로 처리해야 포커스/리렌더 시 클릭 이벤트 손실 방지
                            e.preventDefault();
                            e.stopPropagation();
                            addEmailValue(email); // selecting from list should clear the input
                            requestAnimationFrame(() => emailInputRef.current?.focus());
                          }}
                        >
                          {email}
                        </button>
                      );
                    })}
                    {isClientEmailsLoading ? <div className='px-3 py-2 text-[12px] text-[#8A8A8E]'>불러오는 중...</div> : null}
                  </div>
                </div>
              ) : null}
            </div>
          ) : null}
        </div>

        <div className='max-h-[75vh] overflow-hidden'>
          <div className='flex min-h-0'>
            {/* 왼쪽: 하이라이트 선택 */}
            {mode === 'highlight' ? (
              <div className='w-[420px] shrink-0 border-r border-[#E4E4E7] p-5'>
                <div className='text-[14px] font-semibold text-[#000000]'>요청할 하이라이트를 선택해주세요</div>
                <div className='mt-1 text-[13px] text-[#09090B]'>각 하이라이트마다 하나의 요청이 됩니다. 중복되는 내용은 생략해주세요</div>

                <div className='mt-4 max-h-[60vh] min-h-0 overflow-auto pr-1'>
                  {isClippingLoading ? (
                    <div className='py-6 text-[13px] text-[#8A8A8E]'>불러오는 중...</div>
                  ) : clippingItems.length === 0 ? (
                    <div className='py-6 text-[13px] text-[#8A8A8E]'>하이라이트가 없습니다.</div>
                  ) : (
                    <div className='flex flex-col gap-2'>
                      {clippingItems.map((c: any) => {
                        const id = String(c?.clipping_id ?? '').trim();
                        const selected = id ? selectedHighlightIds.has(id) : false;
                        const img = normalizeMediaUrl(String(c?.attachment_url ?? '').trim());

                        const createdAt = String(c?.created_at ?? c?.createdAt ?? '').trim();
                        const relTime = formatRelativeTimeKo(createdAt);
                        const createdBy = c?.created_by ?? null;
                        const creatorName = String(createdBy?.nickname ?? createdBy?.name ?? '').trim() || '작성자';
                        const creatorInitial = creatorName.slice(0, 1);
                        const creatorThumb = normalizeMediaUrl(createdBy?.thumbnail_url ?? null);
                        const creatorColor = getUserColorHex(createdBy?.user_color ?? null);
                        return (
                          <div className='flex gap-2'>
                            <div className='mt-1'>
                              <div
                                onClick={async () => {
                                  if (!id) return;
                                  await handleSelectHighlight(id);
                                }}
                                className={`flex h-[18px] w-[18px] items-center justify-center rounded-[4px] border ${
                                  selected ? 'border-[#69C0FF] bg-[#69C0FF]' : 'border-[#D4D4D8] bg-white'
                                }`}
                              >
                                {selected ? <Check className='h-3.5 w-3.5 text-white' /> : null}
                              </div>
                            </div>
                            <button
                              key={id}
                              type='button'
                              onClick={async () => {
                                if (!id) return;
                                await handleSelectHighlight(id);
                              }}
                              className={`max-h-[110px] w-full overflow-hidden rounded-[12px] border p-3 text-left ${
                                selected ? 'border-2 border-[#69C0FF] bg-[#f4f4f5]' : 'border-[#E4E4E7] bg-white'
                              }`}
                            >
                              <div className='flex items-start gap-3'>
                                <div className='min-w-0 flex-1'>
                                  {/* 이미지 미리보기 */}
                                  {img ? (
                                    <div className='relative mb-2 h-[60px] max-h-[60px] w-full overflow-hidden rounded-[8px] border border-[#E4E4E7] bg-[#fafafa]'>
                                      <img src={img} alt='' className='h-full w-full object-cover object-center' />
                                      <div className='pointer-events-none absolute inset-0' />
                                    </div>
                                  ) : null}

                                  <div className='mb-2 mt-2 flex items-center gap-2'>
                                    <div className='h-[18px] w-[18px] overflow-hidden rounded-full bg-[#E4E4E7]'>
                                      {creatorThumb ? (
                                        <img src={creatorThumb} alt='' className='h-full w-full object-cover' />
                                      ) : (
                                        <div
                                          className='flex h-full w-full items-center justify-center text-[10px] font-bold text-white'
                                          style={{ backgroundColor: creatorColor }}
                                        >
                                          {creatorInitial}
                                        </div>
                                      )}
                                    </div>
                                    <div className='min-w-0 truncate text-[13px] text-[#000]'>{creatorName}</div>
                                    {relTime ? <div className='shrink-0 text-[11px] text-[#A1A1AA]'>{relTime}</div> : null}
                                  </div>
                                </div>
                              </div>
                            </button>
                          </div>
                        );
                      })}
                    </div>
                  )}
                </div>
              </div>
            ) : null}

            {/* 오른쪽: 폼 입력 */}
            <div className={`min-w-0 flex-1 overflow-auto bg-[#f4f4f5] px-5 py-4 ${mode === 'message' ? 'w-full' : ''}`}>
              {/*  <div className='text-[13px] font-semibold text-[#18181B]'>요청사항 작성</div> */}
              <div className='grid gap-3'>
                {/* 선택된 하이라이트 요약 */}
                {mode === 'highlight' ? (
                  <div className='rounded-[12px]'>
                    {selectedCount === 0 ? (
                      <div className='mt-2 rounded-[10px] border border-[#E4E4E7] bg-white p-[8px]'>
                        <div className='flex min-h-[84px] items-center justify-center text-[13px] text-[#A1A1AA]'>
                          왼쪽 하이라이트 카드를 선택해주세요
                        </div>
                      </div>
                    ) : (
                      <div className='mt-2 rounded-[10px] border border-[#E4E4E7] bg-white p-[8px]'>
                        {/* (요청사항 작성 카드) 문서 제목은 제거 */}
                        {activeClip?.attachment_url ? (
                          <>
                            <div className='relative mb-2 h-[60px] max-h-[60px] w-full overflow-hidden rounded-[10px] border border-[#E4E4E7] bg-[#F4F4F5]'>
                              <img
                                src={normalizeMediaUrl(String(activeClip?.attachment_url ?? '').trim())}
                                alt=''
                                className='h-full w-full object-cover object-center'
                              />
                            </div>
                            <div className='mt-2 flex items-start gap-2'>
                              <div className='h-[18px] w-[18px] overflow-hidden rounded-full bg-[#E4E4E7]'>
                                {activeCreatorThumb ? (
                                  <img src={activeCreatorThumb} alt='' className='h-full w-full object-cover' />
                                ) : (
                                  <div
                                    className='flex h-full w-full items-center justify-center text-[10px] font-bold text-white'
                                    style={{ backgroundColor: activeCreatorColor }}
                                  >
                                    {activeCreatorInitial}
                                  </div>
                                )}
                              </div>
                              <div className='min-w-0 flex-1'>
                                <div className='flex items-center gap-2'>
                                  <div className='text-[13px] font-medium text-[#000]'>{activeCreatorName || ' '}</div>
                                  <div className='text-[11px] text-[#A1A1AA]'>{activeTime || ''}</div>
                                </div>
                              </div>
                            </div>
                            {activeNote ? <div className='mt-1 text-[12px] text-[#18181B]'>{activeNote}</div> : null}
                            <div className='mt-2 text-[11px] text-[#1890FF]'>하이라이트 메모는 의뢰인에게 보여지지 않습니다.</div>
                          </>
                        ) : (
                          <div className='py-4 text-center text-[13px] text-[#A1A1AA]'>하이라이트를 선택해주세요</div>
                        )}
                      </div>
                    )}
                  </div>
                ) : null}

                <div className='grid gap-1'>
                  <div className='text-[14px] font-medium text-[#09090B]'>요청 제목</div>
                  <input
                    ref={firstFieldRef}
                    value={requestText}
                    onChange={(e) => {
                      setRequestText(e.target.value);
                      markDraftDirty(effectiveActiveId);
                    }}
                    className='h-[40px] w-full rounded-[10px] border border-[#E4E4E7] px-3 text-[14px] focus:outline-none focus:ring-1 focus:ring-[#69C0FF]'
                    placeholder='예) 계약서 원본 제출 요청'
                  />
                </div>

                <div className='grid gap-1'>
                  <div className='text-[14px] font-medium text-[#09090B]'>요청 사항</div>
                  <textarea
                    value={messageText}
                    onChange={(e) => {
                      setMessageText(e.target.value);
                      markDraftDirty(effectiveActiveId);
                    }}
                    className='min-h-[360px] w-full resize-none rounded-[10px] border border-[#E4E4E7] px-3 py-2 text-[14px] focus:outline-none focus:ring-1 focus:ring-[#69C0FF]'
                    placeholder='의뢰인에게 전달할 메시지를 입력해주세요.'
                  />
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className='flex items-center justify-end gap-2 border-t border-[#E4E4E7] px-5 py-4'>
          <button
            type='button'
            className='h-[40px] rounded-[10px] border border-[#E4E4E7] bg-white px-4 text-[14px] font-semibold text-[#18181B] hover:bg-[#F4F4F5]'
            onClick={async () => {
              if (isBusy) return;
              if (mode === 'highlight') {
                const targetId = resolveActiveTargetId();
                const linkedImageUrl = resolveLinkedImageUrl(targetId);
                await saveDraftIfNeeded(targetId, linkedImageUrl);
              }
              if (mode === 'message' && (requestText.trim() || messageText.trim())) {
                try {
                  const existingDraftId = String(
                    (messageDraftResponse as any)?.result?.request_id ?? (messageDraftResponse as any)?.data?.result?.request_id ?? '',
                  ).trim();
                  if (existingDraftId) {
                    await onUpdateRequest({
                      requestId: existingDraftId,
                      input: {
                        request_text: requestText.trim(),
                        message_text: messageText.trim(),
                        client_name: '',
                        client_email: resolveClientEmailValue(),
                      },
                    });
                  } else {
                    await onCreateRequest({
                      civil_case_id: civilCaseId,
                      request_text: requestText.trim(),
                      message_text: messageText.trim(),
                      linked_image_url: '',
                      client_email: resolveClientEmailValue(),
                      client_name: '',
                      assignee_id: assigneeId,
                      target_type: '',
                      target_id: '',
                      files: [],
                    });
                  }
                  onMessageToast({ message: '임시 저장되었습니다.' });
                } catch {
                  onMessageToast({ message: '임시 저장에 실패했습니다.' });
                }
              }
              onClose();
            }}
            disabled={isBusy}
          >
            {mode === 'message' && (requestText.trim() || messageText.trim()) ? '임시 저장 및 닫기' : '취소'}
          </button>
          <button
            type='button'
            className='h-[36px] rounded-[8px] bg-[#69C0FF] px-4 text-[14px] font-semibold text-white hover:bg-[#1677FF] disabled:cursor-not-allowed disabled:bg-[#E4E4E7] disabled:text-[#A1A1AA]'
            disabled={!canSubmit || isBusy}
            onClick={async () => {
              if (!canSubmit || isBusy) return;
              setIsSubmitting(true);
              let shouldClose = false;
              if (mode === 'highlight') {
                try {
                  const ids = Array.from(selectedHighlightIds.values()).filter(Boolean);
                  for (const id of ids) {
                    const clip = clippingItems.find((x: any) => String(x?.clipping_id ?? '').trim() === id);
                    const clipUrl = String(clip?.attachment_url ?? '').trim();
                    if (!clipUrl) {
                      onMessageToast({ message: '선택한 하이라이트 중 이미지 URL이 없는 항목이 있어 요청을 보낼 수 없습니다.' });
                      return;
                    }
                    const existingDraftId = String(draftRequestIdsByTarget[id] ?? '').trim();
                    if (existingDraftId) {
                      const sent = await onSendRequest(existingDraftId, {
                        request_text: requestText.trim(),
                        message_text: messageText.trim(),
                        client_name: draftClientNameByTarget[id] ?? '',
                        client_email: resolveClientEmailValue(),
                        linked_image_url: clipUrl,
                      });
                      if (!sent) return;
                    } else {
                      // 드래프트 없을 때: draft 생성 후 바로 send
                      const draftRes = await onCreateRequestDraft({
                        civil_case_id: civilCaseId,
                        project_id: resolveProjectId(id),
                        request_text: requestText.trim(),
                        message_text: messageText.trim(),
                        client_name: '',
                        client_email: resolveClientEmailValue(),
                        target_type: 'CLIPPING',
                        target_id: id,
                        linked_image_url: clipUrl,
                      });
                      const newDraftId = String(draftRes?.result?.request_id ?? (draftRes as any)?.data?.result?.request_id ?? '').trim();
                      if (!newDraftId) return;
                      const sent = await onSendRequest(newDraftId, {
                        request_text: requestText.trim(),
                        message_text: messageText.trim(),
                        client_name: '',
                        client_email: resolveClientEmailValue(),
                        linked_image_url: clipUrl,
                      });
                      if (!sent) return;
                    }
                  }

                  // 기존 드래프트를 보낸 경우에도 목록 최신화
                  await queryClient.refetchQueries({
                    predicate: (q) =>
                      Array.isArray(q.queryKey) &&
                      q.queryKey[0] === 'evidence-request' &&
                      q.queryKey[1] === 'list' &&
                      q.queryKey[2] === civilCaseId,
                  });

                  shouldClose = true;
                } finally {
                  if (!shouldClose) setIsSubmitting(false);
                }

                if (shouldClose) {
                  onClose();
                  onMessageToast({ message: '자료 요청이 완료 되었습니다' });
                }
                return;
              }

              try {
                // 이미 드래프트(request_id)가 있으면 send, 없으면 create
                const existingDraftId = String(
                  (messageDraftResponse as any)?.result?.request_id ?? (messageDraftResponse as any)?.data?.result?.request_id ?? '',
                ).trim();

                let res: any;
                if (existingDraftId) {
                  res = await onSendRequest(existingDraftId, {
                    request_text: requestText.trim(),
                    message_text: messageText.trim(),
                    client_name: '',
                    client_email: resolveClientEmailValue(),
                    linked_image_url: '',
                  });
                } else {
                  // 드래프트 없을 때: draft 생성 후 바로 send
                  const draftRes = await onCreateRequestDraft({
                    civil_case_id: civilCaseId,
                    project_id: '',
                    request_text: requestText.trim(),
                    message_text: messageText.trim(),
                    client_name: '',
                    client_email: resolveClientEmailValue(),
                    target_type: 'MESSAGE',
                    target_id: civilCaseId,
                    linked_image_url: '',
                  });
                  const newDraftId = String(draftRes?.result?.request_id ?? (draftRes as any)?.data?.result?.request_id ?? '').trim();
                  if (!newDraftId) return;
                  res = await onSendRequest(newDraftId, {
                    request_text: requestText.trim(),
                    message_text: messageText.trim(),
                    client_name: '',
                    client_email: resolveClientEmailValue(),
                    linked_image_url: '',
                  });
                }
                if (!res) return;

                await queryClient.refetchQueries({
                  predicate: (q) =>
                    Array.isArray(q.queryKey) &&
                    q.queryKey[0] === 'evidence-request' &&
                    q.queryKey[1] === 'list' &&
                    q.queryKey[2] === civilCaseId,
                });

                shouldClose = true;
              } finally {
                if (!shouldClose) setIsSubmitting(false);
              }

              if (shouldClose) {
                onClose();
                onMessageToast({ message: '자료 요청이 완료 되었습니다' });
              }
            }}
          >
            {isBusy ? '전송 중...' : mode === 'highlight' ? `요청 ${selectedCount}개 보내기` : '요청 보내기'}
          </button>
        </div>
      </div>
    </div>
  );
}
