import { useCallback, useEffect, useMemo, useRef, useState } from 'react';

import { MoreHorizontal, Plus } from 'lucide-react';
import { createPortal } from 'react-dom';

import ModalSelect from '@/components/common/modal/modal-select';
import CustomSpinner from '@/components/common/spiner';
import { onMessageToast } from '@/components/utils/global-utils';
import {
  useAddCivilCaseDocumentMemo,
  useDeleteCivilCaseDocumentMemo,
  useUpdateCivilCaseDocumentMemo,
} from '@/hooks/react-query/mutation/case';
import { useListCivilCaseDocumentMemos } from '@/hooks/react-query/query/case';
import { cn } from '@/lib/utils';

type TRightSidebarPanelProps = {
  rightImg: string;
  caseDocumentId?: string | null;
  civilCaseId?: string | null;
  /** 외부에서 탭을 제어(문서리스트에서 클릭 등) */
  activeTab?: 'highlight' | 'memo';
  onChangeTab?: (tab: 'highlight' | 'memo') => void;
  /** 우측 패널: 간편검색(돋보기) 버튼 클릭 */
  onClickQuickSearch?: () => void;

  // refs: 타입 호환(ref nullability) 이슈를 피하기 위해 any로 둔다. (추후 안정화 시 RefObject로 강화 가능)
  rightPanelRef: any;
  /** CaseDetailListTable에서 리사이즈 폭 적용 */
  panelWidthPx?: number;
  /** CaseDetailListTable에서 오버레이/포지셔닝용 클래스 */
  panelClassName?: string;
  /** 좌측 보더 리사이즈 핸들 */
  onResizeStartLeft?: (e: React.PointerEvent) => void;
  selectionPanelScrollRef: any;
  panelEditCardRef: any;
  clippingMenuRef: any;
  memoMenuRef: any;

  isCivilMode: boolean;
  clippings: any[];
  savedSelections: any[];
  pageContainerRefs: any;
  creatingSelectionId: number | null;
  recognizingDots: string;

  loginUserInfo: any;

  // 상태
  panelEditClippingId: string | null;
  openClippingMenuId: string | null;
  isDeleteClippingPending: boolean;

  // 메모 상태
  activeMemoInputClippingId: string | null;
  memoInputDraft: string;
  memoInputRef: any;
  setActiveMemoInputClippingId: (id: string | null) => void;
  setMemoInputDraft: (v: string) => void;
  openMemoMenuId: string | null;
  setOpenMemoMenuId: (v: string | null | ((prev: string | null) => string | null)) => void;
  editingMemoId: string | null;
  editingMemoDraft: string;
  setEditingMemoId: (id: string | null) => void;
  setEditingMemoDraft: (v: string) => void;
  isUpdateMemoPending: boolean;
  isDeleteMemoPending: boolean;
  updateMemoAsync: (args: any) => Promise<any>;
  deleteMemoAsync: (args: any) => Promise<any>;

  // 멘션 상태
  projectMembers: any[];
  projectIdForMembers: string;
  isMentionOpen: boolean;
  setIsMentionOpen: (v: boolean) => void;
  setMentionQuery: (v: string) => void;
  mentionActiveIndex: number;
  setMentionActiveIndex: (v: number | ((prev: number) => number)) => void;
  mentionDropdownPos: any;
  mentionDropdownContainerRef: any;
  mentionedUserIdsDraft: string[];
  setMentionedUserIdsDraft: (v: string[] | ((prev: string[]) => string[])) => void;
  filteredMentionMembers: any[];
  submitMemo: (clippingId: string) => Promise<void>;
  refetchProjectMembers: () => any;

  /** 메모 변경 후 해당 클리핑의 노트만 재조회 */
  refreshClippingNotes: (clippingId: string) => Promise<void>;

  // 메모 헬퍼
  getMemos: (c: any) => any[];
  canEditMemo: (memo: any) => boolean;
  renderMemoWithMentions: (content: string) => any;

  // 유틸리티
  getUserColor: (color: string) => string;
  formatRelativeTime: (iso?: string | null) => string;
  getClippingTags: (c: any) => string[];
  canDeleteClipping: (c: any) => boolean;

  KNOWN_DOC_TAGS: readonly string[];
  RELATED_MISSING_TAG: string;

  /** 보기설정에서 유저 선택 후 클리핑 목록을 다시 가져오는 중인지 여부 */
  isClippingFetching?: boolean;

  // 액션
  setOpenClippingMenuId: (v: string | null | ((prev: string | null) => string | null)) => void;
  requestDeleteClipping: (c: any) => void;
  applyClippingUpdate: (c: any, patch: any) => Promise<boolean>;
  toClippingType: (tag: string) => string;

  // 내비게이션/선택 동작
  scrollToClipping: (c: any) => void;
  ensureSelectionForClipping: (c: any) => number | null;
  setCurrentSelectionId: (id: number | null) => void;
  setIsPanelSelectionActive: (v: boolean) => void;
  setActionBarPos: (v: any) => void;
  updateActionBarPos: () => void;
  setPanelEditClippingId: (id: string | null) => void;
};

export default function RightSidebarPanel({
  rightImg,
  caseDocumentId,
  civilCaseId,
  activeTab,
  onChangeTab,

  rightPanelRef,
  panelWidthPx,
  panelClassName,
  onResizeStartLeft,
  selectionPanelScrollRef,
  panelEditCardRef,
  clippingMenuRef,
  memoMenuRef,
  isCivilMode,
  clippings,
  savedSelections,
  pageContainerRefs,
  creatingSelectionId,
  recognizingDots,
  loginUserInfo,
  panelEditClippingId,
  openClippingMenuId,
  isDeleteClippingPending,
  activeMemoInputClippingId,
  memoInputDraft,
  memoInputRef,
  setActiveMemoInputClippingId,
  setMemoInputDraft,
  openMemoMenuId,
  setOpenMemoMenuId,
  editingMemoId,
  editingMemoDraft,
  setEditingMemoId,
  setEditingMemoDraft,
  isUpdateMemoPending,
  isDeleteMemoPending,
  updateMemoAsync,
  deleteMemoAsync,
  projectMembers,
  projectIdForMembers,
  isMentionOpen,
  setIsMentionOpen,
  setMentionQuery,
  mentionActiveIndex,
  setMentionActiveIndex,
  mentionDropdownPos,
  mentionDropdownContainerRef,
  mentionedUserIdsDraft: _mentionedUserIdsDraft,
  setMentionedUserIdsDraft,
  filteredMentionMembers,
  submitMemo,
  refetchProjectMembers,
  refreshClippingNotes,
  getMemos,
  canEditMemo,
  renderMemoWithMentions,
  getUserColor,
  formatRelativeTime,
  getClippingTags,
  canDeleteClipping,
  KNOWN_DOC_TAGS,
  RELATED_MISSING_TAG,
  isClippingFetching = false,
  setOpenClippingMenuId,
  requestDeleteClipping,
  applyClippingUpdate,
  toClippingType,
  scrollToClipping,
  ensureSelectionForClipping,
  setCurrentSelectionId,
  setIsPanelSelectionActive,
  setActionBarPos,
  updateActionBarPos,
  setPanelEditClippingId,
}: TRightSidebarPanelProps) {
  const BUCKET_BASE_URL = 'https://ailex.kr.object.ncloudstorage.com/';
  // 백엔드가 attachment_url을 중복 prefix 하여
  // "https://.../ailex/https://.../ailex/....png" 처럼 내려주는 케이스가 있어 정규화한다.
  const normalizeBucketUrl = useCallback(
    (raw: unknown) => {
      let s = String(raw ?? '').trim();
      if (!s) return '';

      // url 문자열 안에 http(s):// 가 여러 번 포함되면 마지막 URL만 유효한 경우가 많다.
      const lastHttps = s.lastIndexOf('https://');
      const lastHttp = s.lastIndexOf('http://');
      const idx = Math.max(lastHttps, lastHttp);
      if (idx > 0) s = s.slice(idx);

      // 상대 경로(키)인 경우에만 base를 붙인다.
      if (s && !s.startsWith('http')) {
        s = s.replace(/^\/+/, '');
        s = `${BUCKET_BASE_URL}${s}`;
      }
      return s;
    },
    [BUCKET_BASE_URL],
  );

  const [internalTab, setInternalTab] = useState<'highlight' | 'memo'>('highlight');
  const panelTab = activeTab ?? internalTab;
  const setPanelTab = useCallback(
    (tab: 'highlight' | 'memo') => {
      if (onChangeTab) onChangeTab(tab);
      else setInternalTab(tab);
    },
    [onChangeTab],
  );
  useEffect(() => {
    // 문서가 바뀌면 기본 탭은 하이라이트로 리셋(단, 외부 제어 중이면 건드리지 않음)
    if (activeTab !== undefined) return;
    setInternalTab('highlight');
  }, [activeTab, caseDocumentId]);

  // ! 텍스트에어리아 내 멘션 하이라이트 오버레이 렌더러
  // native <textarea>는 부분 텍스트 스타일 불가. 동기화된 오버레이를 통해 멘션 색상 처리,
  // 텍스트는 투명하게 유지하면서 캐럿만 보이도록 한다.
  const memberNameSet = useMemo(() => {
    const s = new Set<string>();
    const list = Array.isArray(projectMembers) ? projectMembers : [];
    for (const m of list as any[]) {
      const name = String(m?.name ?? '').trim();
      const nick = String(m?.nickname ?? '').trim();
      if (name) s.add(name);
      if (nick) s.add(nick);
    }
    return s;
  }, [projectMembers]);

  const renderMentionOverlayText = useCallback(
    (contentRaw: unknown) => {
      const content = String(contentRaw ?? '');
      if (!content) return <span className='text-[#000000]'>{'\u200b'}</span>;
      const parts = content.split(/(@[^\s@]+)/g);
      return parts.map((p, idx) => {
        if (p.startsWith('@')) {
          const keyRaw = p.slice(1);
          const keyNormalized = keyRaw.replace(/[.,!?;:)\]]+$/, '');
          const isKnownMember = memberNameSet.size > 0 ? memberNameSet.has(keyRaw) || memberNameSet.has(keyNormalized) : true;
          if (!isKnownMember || !keyRaw.trim()) {
            return (
              <span key={`mo-${idx}`} className='text-[#000000]'>
                {p}
              </span>
            );
          }
          return (
            <span key={`mo-${idx}`} className='text-[#0991EE]'>
              {p}
            </span>
          );
        }
        return (
          <span key={`mo-${idx}`} className='text-[#000000]'>
            {p}
          </span>
        );
      });
    },
    [memberNameSet],
  );

  const [docMemoScrollTop, setDocMemoScrollTop] = useState(0);
  const [docEditMemoScrollTop, setDocEditMemoScrollTop] = useState(0);

  // Optimistic UI: tag 클릭 직후 서버 반영/리패치 전에도 선택 스타일이 즉시 보이도록 로컬 상태로 덮어쓴다.
  const [optimisticDocTagByClippingId, setOptimisticDocTagByClippingId] = useState<Record<string, string | null>>({});
  const mentionListLen = Array.isArray(filteredMentionMembers) ? filteredMentionMembers.length : 0;

  // 문서 메모(전체 메모) 상태/훅
  const {
    response: docMemosResponse,
    isLoading: isDocMemosLoading,
    isFetching: isDocMemosFetching,
    refetch: refetchDocMemos,
  } = useListCivilCaseDocumentMemos({
    caseDocumentId,
    enabled: isCivilMode && panelTab === 'memo' && !!caseDocumentId,
  });
  const { onAddCivilCaseDocumentMemo, isPending: isAddDocMemoPending } = useAddCivilCaseDocumentMemo();
  const { onUpdateCivilCaseDocumentMemo, isPending: isUpdateDocMemoPending } = useUpdateCivilCaseDocumentMemo();
  const { onDeleteCivilCaseDocumentMemo } = useDeleteCivilCaseDocumentMemo();

  const [docMemoDraft, setDocMemoDraft] = useState('');
  const [editingDocMemoId, setEditingDocMemoId] = useState<string | null>(null);
  const [editingDocMemoDraft, setEditingDocMemoDraft] = useState('');
  const [openDocMemoMenuId, setOpenDocMemoMenuId] = useState<string | null>(null);
  const [deleteDocMemoId, setDeleteDocMemoId] = useState<string | null>(null);

  // doc-memo mention state (전체 메모 탭: 새 메모 작성에서도 멘션)
  const docMemoInputRef = useRef<HTMLTextAreaElement>(null);
  const docMentionDropdownContainerRef = useRef<HTMLDivElement>(null);
  const [isDocMentionOpen, setIsDocMentionOpen] = useState(false);
  const [docMentionQuery, setDocMentionQuery] = useState('');
  const [docMentionActiveIndex, setDocMentionActiveIndex] = useState(0);
  const [docMentionDropdownPos, setDocMentionDropdownPos] = useState<any>(null);
  const [docMentionedUserIdsDraft, setDocMentionedUserIdsDraft] = useState<string[]>([]);

  // doc-memo edit mention state (전체 메모 탭: 메모 수정에서도 멘션)
  const docEditMemoInputRef = useRef<HTMLTextAreaElement>(null);
  const docEditMentionDropdownContainerRef = useRef<HTMLDivElement>(null);
  const [isDocEditMentionOpen, setIsDocEditMentionOpen] = useState(false);
  const [docEditMentionQuery, setDocEditMentionQuery] = useState('');
  const [docEditMentionActiveIndex, setDocEditMentionActiveIndex] = useState(0);
  const [docEditMentionDropdownPos, setDocEditMentionDropdownPos] = useState<any>(null);
  const [docEditMentionedUserIdsDraft, setDocEditMentionedUserIdsDraft] = useState<string[]>([]);

  // 문서가 바뀌면 "전체 메모" 입력/편집 상태는 문서별로 분리되어야 하므로 모두 초기화한다.
  useEffect(() => {
    setDocMemoDraft('');
    setEditingDocMemoId(null);
    setEditingDocMemoDraft('');
    setOpenDocMemoMenuId(null);
    setDeleteDocMemoId(null);
    setIsDocMentionOpen(false);
    setDocMentionQuery('');
    setDocMentionedUserIdsDraft([]);
    setDocMentionActiveIndex(0);
    setDocMentionDropdownPos(null);
    setIsDocEditMentionOpen(false);
    setDocEditMentionQuery('');
    setDocEditMentionedUserIdsDraft([]);
    setDocEditMentionActiveIndex(0);
    setDocEditMentionDropdownPos(null);
    setDocMemoScrollTop(0);
    setDocEditMemoScrollTop(0);
  }, [caseDocumentId]);

  const docFilteredMentionMembers = useMemo(() => {
    const q = docMentionQuery.trim();
    const meId = String(loginUserInfo?.data?.user_id ?? '');
    const list = Array.isArray(projectMembers) ? projectMembers : [];
    return list
      .filter((m: any) => {
        const isMe = Boolean(m?.isMe);
        const id = String(m?.user_id ?? '');
        if (isMe) return false;
        if (meId && id && id === meId) return false;
        const name = String(m?.name ?? '');
        const nick = String(m?.nickname ?? '');
        if (!q) return true;
        return name.includes(q) || nick.includes(q);
      })
      .slice(0, 200);
  }, [docMentionQuery, projectMembers, loginUserInfo?.data?.user_id]);

  const docEditFilteredMentionMembers = useMemo(() => {
    const q = docEditMentionQuery.trim();
    const meId = String(loginUserInfo?.data?.user_id ?? '');
    const list = Array.isArray(projectMembers) ? projectMembers : [];
    return list
      .filter((m: any) => {
        const isMe = Boolean(m?.isMe);
        const id = String(m?.user_id ?? '');
        if (isMe) return false;
        if (meId && id && id === meId) return false;
        const name = String(m?.name ?? '');
        const nick = String(m?.nickname ?? '');
        if (!q) return true;
        return name.includes(q) || nick.includes(q);
      })
      .slice(0, 200);
  }, [docEditMentionQuery, projectMembers, loginUserInfo?.data?.user_id]);

  const computeDocMentionDropdownPos = useCallback(() => {
    const input = docMemoInputRef.current;
    if (!input) return;
    const rect = input.getBoundingClientRect();

    const rowCount = Math.max(docFilteredMentionMembers.length, 1);
    const desiredHeight = Math.min(128, rowCount * 32);
    const spaceBelow = window.innerHeight - rect.bottom;
    const spaceAbove = rect.top;
    const availableBelow = Math.max(0, spaceBelow - 16);
    const availableAbove = Math.max(0, spaceAbove - 16);
    const shouldOpenUp = availableBelow < desiredHeight && availableAbove > availableBelow;
    const maxHeight = Math.max(32, Math.min(128, shouldOpenUp ? availableAbove : availableBelow));
    const actualHeight = Math.min(desiredHeight, maxHeight);
    const left = Math.max(8, Math.min(rect.left, window.innerWidth - rect.width - 8));
    const topRaw = shouldOpenUp ? rect.top - 8 - actualHeight : rect.bottom + 8;
    const top = Math.max(8, Math.min(topRaw, window.innerHeight - actualHeight - 8));

    setDocMentionDropdownPos({ left, top, width: rect.width, maxHeight });
  }, [docFilteredMentionMembers.length]);

  const computeDocEditMentionDropdownPos = useCallback(() => {
    const input = docEditMemoInputRef.current;
    if (!input) return;
    const rect = input.getBoundingClientRect();

    const rowCount = Math.max(docEditFilteredMentionMembers.length, 1);
    const desiredHeight = Math.min(128, rowCount * 32);
    const spaceBelow = window.innerHeight - rect.bottom;
    const spaceAbove = rect.top;
    const availableBelow = Math.max(0, spaceBelow - 16);
    const availableAbove = Math.max(0, spaceAbove - 16);
    const shouldOpenUp = availableBelow < desiredHeight && availableAbove > availableBelow;
    const maxHeight = Math.max(32, Math.min(128, shouldOpenUp ? availableAbove : availableBelow));
    const actualHeight = Math.min(desiredHeight, maxHeight);
    const left = Math.max(8, Math.min(rect.left, window.innerWidth - rect.width - 8));
    const topRaw = shouldOpenUp ? rect.top - 8 - actualHeight : rect.bottom + 8;
    const top = Math.max(8, Math.min(topRaw, window.innerHeight - actualHeight - 8));

    setDocEditMentionDropdownPos({ left, top, width: rect.width, maxHeight });
  }, [docEditFilteredMentionMembers.length]);

  useEffect(() => {
    if (!isDocMentionOpen) {
      setDocMentionDropdownPos(null);
      return;
    }
    const update = () => computeDocMentionDropdownPos();
    update();
    window.addEventListener('resize', update);
    window.addEventListener('scroll', update, true);
    return () => {
      window.removeEventListener('resize', update);
      window.removeEventListener('scroll', update, true);
    };
  }, [isDocMentionOpen, computeDocMentionDropdownPos]);

  useEffect(() => {
    if (!isDocEditMentionOpen) {
      setDocEditMentionDropdownPos(null);
      return;
    }
    const update = () => computeDocEditMentionDropdownPos();
    update();
    window.addEventListener('resize', update);
    window.addEventListener('scroll', update, true);
    return () => {
      window.removeEventListener('resize', update);
      window.removeEventListener('scroll', update, true);
    };
  }, [isDocEditMentionOpen, computeDocEditMentionDropdownPos]);

  useEffect(() => {
    if (!isDocMentionOpen) return;
    setDocMentionActiveIndex(0);
  }, [isDocMentionOpen, docMentionQuery]);

  useEffect(() => {
    if (!isDocEditMentionOpen) return;
    setDocEditMentionActiveIndex(0);
  }, [isDocEditMentionOpen, docEditMentionQuery]);

  useEffect(() => {
    if (!isDocMentionOpen) return;
    requestAnimationFrame(() => {
      const root = docMentionDropdownContainerRef.current as HTMLElement | null;
      if (!root) return;
      const items = root.querySelectorAll<HTMLElement>('[data-doc-mention-item="true"]');
      const el = items?.[docMentionActiveIndex] ?? null;
      el?.scrollIntoView({ block: 'nearest' });
    });
  }, [isDocMentionOpen, docMentionActiveIndex, docFilteredMentionMembers.length]);

  useEffect(() => {
    if (!isDocEditMentionOpen) return;
    requestAnimationFrame(() => {
      const root = docEditMentionDropdownContainerRef.current as HTMLElement | null;
      if (!root) return;
      const items = root.querySelectorAll<HTMLElement>('[data-doc-edit-mention-item="true"]');
      const el = items?.[docEditMentionActiveIndex] ?? null;
      el?.scrollIntoView({ block: 'nearest' });
    });
  }, [isDocEditMentionOpen, docEditMentionActiveIndex, docEditFilteredMentionMembers.length]);

  useEffect(() => {
    // 편집 대상 변경 시 멘션 상태 초기화 (전체 메모 수정)
    setIsDocEditMentionOpen(false);
    setDocEditMentionQuery('');
    setDocEditMentionedUserIdsDraft([]);
    setDocEditMentionActiveIndex(0);
    setDocEditMentionDropdownPos(null);
  }, [editingDocMemoId]);

  // edit-memo mention state (memo 수정 모드에서도 멘션)
  const editMemoInputRef = useRef<HTMLTextAreaElement>(null);
  const editMentionDropdownContainerRef = useRef<HTMLDivElement>(null);
  const [isEditMentionOpen, setIsEditMentionOpen] = useState(false);
  const [editMentionQuery, setEditMentionQuery] = useState('');
  const [editMentionActiveIndex, setEditMentionActiveIndex] = useState(0);
  const [editMentionDropdownPos, setEditMentionDropdownPos] = useState<any>(null);
  const [editMentionedUserIdsDraft, setEditMentionedUserIdsDraft] = useState<string[]>([]);

  const editFilteredMentionMembers = useMemo(() => {
    const q = editMentionQuery.trim();
    const meId = String(loginUserInfo?.data?.user_id ?? '');
    const list = Array.isArray(projectMembers) ? projectMembers : [];
    return (
      list
        .filter((m: any) => {
          const isMe = Boolean(m?.isMe);
          const id = String(m?.user_id ?? '');
          if (isMe) return false;
          if (meId && id && id === meId) return false;
          const name = String(m?.name ?? '');
          const nick = String(m?.nickname ?? '');
          if (!q) return true;
          return name.includes(q) || nick.includes(q);
        })
        // 처음 4명만 보이고(드롭다운 maxHeight=128), 그 이상은 스크롤
        .slice(0, 200)
    );
  }, [editMentionQuery, projectMembers, loginUserInfo?.data?.user_id]);

  useEffect(() => {
    // 편집 대상 변경 시 멘션 상태 초기화
    setIsEditMentionOpen(false);
    setEditMentionQuery('');
    setEditMentionedUserIdsDraft([]);
    setEditMentionActiveIndex(0);
    setEditMentionDropdownPos(null);
  }, [editingMemoId]);

  const syncEditTextareaHeight = useCallback(() => {
    const el = editMemoInputRef.current;
    if (!el) return;
    const MIN_H = 32;
    const MAX_H = 150;
    // scrollHeight를 정확히 측정하기 위해 auto로 초기화
    el.style.height = 'auto';
    const next = Math.max(MIN_H, Math.min(MAX_H, el.scrollHeight));
    el.style.height = `${next}px`;
    el.style.overflowY = el.scrollHeight > MAX_H ? 'auto' : 'hidden';
  }, []);

  useEffect(() => {
    // 편집 모드 진입/내용 변경 시 높이 동기화
    requestAnimationFrame(() => syncEditTextareaHeight());
  }, [editingMemoId, editingMemoDraft, syncEditTextareaHeight]);

  const syncNewMemoTextareaHeight = useCallback(() => {
    const el = (memoInputRef?.current ?? null) as HTMLTextAreaElement | null;
    if (!el) return;
    const MIN_H = 32;
    const MAX_H = 150;
    el.style.height = 'auto';
    const next = Math.max(MIN_H, Math.min(MAX_H, el.scrollHeight));
    el.style.height = `${next}px`;
    el.style.overflowY = el.scrollHeight > MAX_H ? 'auto' : 'hidden';
  }, [memoInputRef]);

  useEffect(() => {
    if (!activeMemoInputClippingId) return;
    requestAnimationFrame(() => syncNewMemoTextareaHeight());
  }, [activeMemoInputClippingId, memoInputDraft, syncNewMemoTextareaHeight]);

  const computeEditMentionDropdownPos = useCallback(() => {
    const input = editMemoInputRef.current;
    if (!input) return;
    const rect = input.getBoundingClientRect();

    const rowCount = Math.max(editFilteredMentionMembers.length, 1);
    const desiredHeight = Math.min(128, rowCount * 32);
    const spaceBelow = window.innerHeight - rect.bottom;
    const spaceAbove = rect.top;
    const availableBelow = Math.max(0, spaceBelow - 16);
    const availableAbove = Math.max(0, spaceAbove - 16);
    const shouldOpenUp = availableBelow < desiredHeight && availableAbove > availableBelow;
    const maxHeight = Math.max(32, Math.min(128, shouldOpenUp ? availableAbove : availableBelow));
    const actualHeight = Math.min(desiredHeight, maxHeight);
    const left = Math.max(8, Math.min(rect.left, window.innerWidth - rect.width - 8));
    const topRaw = shouldOpenUp ? rect.top - 8 - actualHeight : rect.bottom + 8;
    const top = Math.max(8, Math.min(topRaw, window.innerHeight - actualHeight - 8));

    setEditMentionDropdownPos({ left, top, width: rect.width, maxHeight });
  }, [editFilteredMentionMembers.length]);

  useEffect(() => {
    if (!isEditMentionOpen) {
      setEditMentionDropdownPos(null);
      return;
    }
    const update = () => computeEditMentionDropdownPos();
    update();
    window.addEventListener('resize', update);
    window.addEventListener('scroll', update, true);
    return () => {
      window.removeEventListener('resize', update);
      window.removeEventListener('scroll', update, true);
    };
  }, [isEditMentionOpen, computeEditMentionDropdownPos]);

  useEffect(() => {
    if (!isEditMentionOpen) return;
    setEditMentionActiveIndex(0);
  }, [isEditMentionOpen, editMentionQuery]);

  // 키보드로 active index가 바뀔 때, 드롭다운 스크롤도 함께 따라가도록 처리 (수정 모드)
  useEffect(() => {
    if (!isEditMentionOpen) return;
    requestAnimationFrame(() => {
      const root = editMentionDropdownContainerRef.current;
      if (!root) return;
      const items = root.querySelectorAll<HTMLElement>('[data-edit-mention-item="true"]');
      const el = items?.[editMentionActiveIndex] ?? null;
      el?.scrollIntoView({ block: 'nearest' });
    });
  }, [isEditMentionOpen, editMentionActiveIndex, editFilteredMentionMembers.length]);

  // 키보드로 active index가 바뀔 때, 드롭다운 스크롤도 함께 따라가도록 처리 (작성 모드)
  useEffect(() => {
    if (!isMentionOpen) return;
    requestAnimationFrame(() => {
      const root = mentionDropdownContainerRef.current as HTMLElement | null;
      if (!root) return;
      const items = root.querySelectorAll<HTMLElement>('[data-mention-item="true"]');
      const el = items?.[mentionActiveIndex] ?? null;
      el?.scrollIntoView({ block: 'nearest' });
    });
  }, [isMentionOpen, mentionActiveIndex, mentionListLen, mentionDropdownContainerRef]);

  // PDF 오버레이(선택 영역)에서 계산된 하이라이트 색상을 카드 UI에도 사용하기 위해 map을 만든다.
  // - savedSelections의 color는 "fill hex"로 유지됨 (#FEF9C3 등)
  const selectionColorByClippingId = useMemo(() => {
    const m = new Map<string, string>();
    for (const s of savedSelections as any[]) {
      const clipId = String((s as any)?.clippingId ?? '');
      const color = String((s as any)?.color ?? '');
      if (clipId && color) m.set(clipId, color);
    }
    return m;
  }, [savedSelections]);

  // 카드 보더 색상: PDF의 보더 색상(border)이 있으면 우선 사용하고, 없으면 fill(color)을 사용한다.
  const selectionBorderColorByClippingId = useMemo(() => {
    const m = new Map<string, string>();
    for (const s of savedSelections as any[]) {
      const clipId = String((s as any)?.clippingId ?? '');
      const borderRaw = String((s as any)?.border ?? '').trim();
      const fill = String((s as any)?.color ?? '').trim();

      // 하위 호환 + 스펙:
      // - 파란 하이라이트 보더는 #69C0FF 사용
      // - 이전 데이터는 #3B82F6 사용
      const normalizeBorder = (b: string, f: string) => {
        const bb = (b || '').trim().toLowerCase();
        const ff = (f || '').trim().toLowerCase();
        if (bb === '#3b82f6') return '#69C0FF';
        if (!bb && (ff === '#e0f2fe' || ff === '#f0f9ff')) return '#69C0FF';
        return b || f;
      };

      const color = normalizeBorder(borderRaw, fill);
      if (clipId && color) m.set(clipId, color);
    }
    return m;
  }, [savedSelections]);

  // 우측 하이라이트 카드에서 "현재 클릭된 카드"를 명확히 보여주기 위한 상태
  const [activeHighlightClippingId, setActiveHighlightClippingId] = useState<string | null>(null);

  useEffect(() => {
    // 문서가 바뀌면 선택 상태 초기화
    setActiveHighlightClippingId(null);
  }, [caseDocumentId]);

  return (
    <div
      ref={rightPanelRef}
      className={`group relative h-full w-[320px] flex-shrink-0 overflow-hidden rounded-br-lg border-l border-[#D4D4D8] bg-[#f4f4f5] ${
        panelClassName ?? ''
      }`}
      style={panelWidthPx ? { width: panelWidthPx } : undefined}
    >
      {onResizeStartLeft ? (
        <div
          role='presentation'
          onPointerDown={onResizeStartLeft}
          className='absolute left-0 top-0 h-full w-[6px] cursor-col-resize opacity-0 transition-opacity group-hover:opacity-100'
        >
          <div className='mx-auto h-full w-[2px] bg-transparent group-hover:bg-[#D4D4D8]' />
        </div>
      ) : null}
      <div ref={selectionPanelScrollRef} className='h-full overflow-y-auto pb-[50px] scrollbar-hide'>
        {/* 민사: 클리핑 리스트 */}
        {isCivilMode ? (
          <div className='px-[16px] pt-[16px]'>
            {/* 탭: 하이라이트 / 전체 메모 */}
            <div className='mb-3 flex w-full rounded-[10px] bg-[#E4E4E7] p-[2px]'>
              <button
                type='button'
                className={cn(
                  'flex h-[28px] flex-1 items-center justify-center rounded-[8px] text-[13px] font-medium',
                  panelTab === 'highlight' ? 'bg-white font-semibold text-[#000]' : 'text-[#71717A]',
                )}
                onClick={() => setPanelTab('highlight')}
              >
                하이라이트
              </button>
              <button
                type='button'
                className={cn(
                  'flex h-[28px] flex-1 items-center justify-center rounded-[8px] text-[13px] font-medium',
                  panelTab === 'memo' ? 'bg-white font-semibold text-[#000]' : 'text-[#71717A]',
                )}
                onClick={() => setPanelTab('memo')}
              >
                전체 메모
              </button>
            </div>

            {panelTab === 'memo' ? (
              <div className='flex flex-col gap-3'>
                <div className='flex flex-col divide-y divide-[#E5E5E5]'>
                  {isDocMemosLoading || isDocMemosFetching ? (
                    <div className='flex h-[240px] items-center justify-center'>
                      <CustomSpinner />
                    </div>
                  ) : (
                    (docMemosResponse?.data ?? [])
                      .slice()
                      .sort((a: any, b: any) => String(b?.createdAt ?? '').localeCompare(String(a?.createdAt ?? '')))
                      .map((m: any) => {
                        const memoId = String(m?.memo_id ?? '');
                        const user = m?.user ?? {};
                        const userId = String(user?.user_id ?? '');
                        const name = String(user?.name ?? '');
                        const nick = String(user?.nickname ?? name);
                        const initial = (nick || name || ' ').slice(0, 1);
                        const thumbRaw = String(user?.thumbnail ?? '');
                        const thumb = thumbRaw ? (thumbRaw.startsWith('http') ? thumbRaw : `${BUCKET_BASE_URL}${thumbRaw}`) : '';
                        const canEdit = Boolean(userId && String(loginUserInfo?.data?.user_id ?? '') === userId);

                        const isEditing = editingDocMemoId === memoId;
                        return (
                          <div key={memoId} className='group relative py-3'>
                            <div className='flex items-start justify-between gap-2'>
                              <div className='flex min-w-0 items-center gap-2'>
                                <div className='h-[28px] w-[28px] flex-shrink-0 overflow-hidden rounded-full bg-[#E5E7EB]'>
                                  {thumb ? (
                                    <img src={thumb} alt='profile' className='h-full w-full object-cover' />
                                  ) : (
                                    <div
                                      className='flex h-full w-full items-center justify-center text-[13px] font-semibold text-white'
                                      style={{ backgroundColor: getUserColor(String(user?.user_color ?? userId ?? name)) }}
                                    >
                                      {initial}
                                    </div>
                                  )}
                                </div>
                                <div className='min-w-0'>
                                  <div className='flex items-center gap-2'>
                                    <div className='text-[13px] font-semibold text-[#000]'>{name}</div>
                                    <div className='text-[13px] text-[#8A8A8E]'>
                                      {m?.createdAt ? formatRelativeTime(String(m.createdAt)) : '방금 전'}
                                    </div>
                                  </div>
                                </div>
                              </div>

                              {canEdit ? (
                                <div className='relative'>
                                  <button
                                    type='button'
                                    className='flex h-[32px] w-[32px] items-center justify-center rounded-[8px] border border-[#E4E4E7] bg-white p-[4px] opacity-0 transition-opacity group-hover:opacity-100'
                                    onClick={(e) => {
                                      e.stopPropagation();
                                      setOpenDocMemoMenuId((prev) => (prev === memoId ? null : memoId));
                                    }}
                                  >
                                    <MoreHorizontal className='h-[20px] w-[20px] text-[#71717A]' />
                                  </button>

                                  {openDocMemoMenuId === memoId ? (
                                    <div
                                      className='absolute right-0 top-[34px] z-[9999] w-[140px] overflow-hidden rounded-[12px] border border-[#E4E4E7] bg-white shadow-lg'
                                      onClick={(e) => e.stopPropagation()}
                                    >
                                      <button
                                        type='button'
                                        className='w-full px-4 py-3 text-left text-[14px] font-medium text-[#18181B] hover:bg-[#F4F4F5]'
                                        onClick={() => {
                                          setOpenDocMemoMenuId(null);
                                          setEditingDocMemoId(memoId);
                                          setEditingDocMemoDraft(String(m?.content ?? ''));
                                        }}
                                      >
                                        수정
                                      </button>
                                      <button
                                        type='button'
                                        className='w-full px-4 py-3 text-left text-[14px] font-medium text-[#EF4444] hover:bg-[#FEE2E2]'
                                        onClick={() => {
                                          setOpenDocMemoMenuId(null);
                                          setDeleteDocMemoId(memoId);
                                        }}
                                      >
                                        삭제
                                      </button>
                                    </div>
                                  ) : null}
                                </div>
                              ) : null}
                            </div>

                            {isEditing ? (
                              <div className='mt-2'>
                                <div className='relative'>
                                  {/* mention highlight overlay */}
                                  <div
                                    aria-hidden='true'
                                    className='pointer-events-none absolute inset-0 z-0 h-[88px] w-full overflow-hidden rounded-[12px] bg-white'
                                  >
                                    <div
                                      className='whitespace-pre-wrap break-words px-3 py-2 text-[13px] leading-[20px] text-[#000000]'
                                      style={{ transform: `translateY(-${docEditMemoScrollTop}px)` }}
                                    >
                                      {renderMentionOverlayText(editingDocMemoDraft)}
                                    </div>
                                  </div>

                                  <textarea
                                    ref={docEditMemoInputRef}
                                    value={editingDocMemoDraft}
                                    onScroll={(e) => setDocEditMemoScrollTop(e.currentTarget.scrollTop)}
                                    onChange={(e) => {
                                      const next = e.target.value;
                                      setEditingDocMemoDraft(next);

                                      const cursor = e.target.selectionStart ?? next.length;
                                      const before = next.slice(0, cursor);
                                      const lastWs = Math.max(before.lastIndexOf(' '), before.lastIndexOf('\n'), before.lastIndexOf('\t'));
                                      const segment = before.slice(lastWs + 1);

                                      if (!segment.startsWith('@')) {
                                        setIsDocEditMentionOpen(false);
                                        setDocEditMentionQuery('');
                                        return;
                                      }
                                      if (segment === '@') {
                                        if (projectIdForMembers) void refetchProjectMembers();
                                        setDocEditMentionActiveIndex(0);
                                        setIsDocEditMentionOpen(true);
                                        setDocEditMentionQuery('');
                                        return;
                                      }
                                      const token = segment.slice(1).trim();
                                      setDocEditMentionQuery(token);
                                      setIsDocEditMentionOpen(true);
                                    }}
                                    onKeyDown={(e) => {
                                      if (e.key === 'Escape') {
                                        setIsDocEditMentionOpen(false);
                                        setDocEditMentionQuery('');
                                        return;
                                      }
                                      if (isDocEditMentionOpen) {
                                        if (e.key === 'ArrowDown') {
                                          e.preventDefault();
                                          setDocEditMentionActiveIndex((prev) => {
                                            const max = Math.max(docEditFilteredMentionMembers.length - 1, 0);
                                            return Math.min(prev + 1, max);
                                          });
                                          return;
                                        }
                                        if (e.key === 'ArrowUp') {
                                          e.preventDefault();
                                          setDocEditMentionActiveIndex((prev) => Math.max(prev - 1, 0));
                                          return;
                                        }
                                        if (e.key === 'Enter') {
                                          if (docEditFilteredMentionMembers.length === 0) return;
                                          e.preventDefault();
                                          const member =
                                            docEditFilteredMentionMembers[
                                              Math.min(docEditMentionActiveIndex, docEditFilteredMentionMembers.length - 1)
                                            ];
                                          if (!member) return;
                                          const id = String((member as any)?.user_id ?? '');
                                          const memberName = String((member as any)?.name ?? '');
                                          const input = docEditMemoInputRef.current;
                                          const cur = input?.selectionStart ?? editingDocMemoDraft.length;
                                          const before = editingDocMemoDraft.slice(0, cur);
                                          const after = editingDocMemoDraft.slice(cur);
                                          const lastWs = Math.max(
                                            before.lastIndexOf(' '),
                                            before.lastIndexOf('\n'),
                                            before.lastIndexOf('\t'),
                                          );
                                          const segStart = lastWs + 1;
                                          const mentionText = `@${memberName} `;
                                          const replaced = before.slice(0, segStart) + mentionText + after.replace(/^\S*/, '');
                                          setEditingDocMemoDraft(replaced);
                                          setDocEditMentionedUserIdsDraft((prev) => (prev.includes(id) ? prev : [...prev, id]));
                                          setIsDocEditMentionOpen(false);
                                          setDocEditMentionQuery('');
                                          requestAnimationFrame(() => {
                                            input?.focus();
                                            const pos = (before.slice(0, segStart) + mentionText).length;
                                            input?.setSelectionRange(pos, pos);
                                          });
                                          return;
                                        }
                                        return;
                                      }
                                    }}
                                    rows={3}
                                    className='relative z-10 h-[88px] w-full resize-none rounded-[12px] border border-[#2563EB] bg-transparent px-3 py-2 text-[13px] leading-[20px] text-transparent caret-[#000000] outline-none placeholder:text-[#71717A] focus:border-[#2563EB]'
                                  />
                                </div>
                                {isDocEditMentionOpen && docEditMentionDropdownPos && typeof document !== 'undefined'
                                  ? createPortal(
                                      <div
                                        ref={docEditMentionDropdownContainerRef}
                                        className='z-[999999] overflow-hidden rounded-[8px] border border-[#E4E4E7] bg-white shadow-md'
                                        style={{
                                          position: 'fixed',
                                          left: docEditMentionDropdownPos.left,
                                          top: docEditMentionDropdownPos.top,
                                          width: docEditMentionDropdownPos.width,
                                        }}
                                        onMouseDown={(ev) => ev.preventDefault()}
                                      >
                                        <div className='overflow-y-auto' style={{ maxHeight: docEditMentionDropdownPos.maxHeight }}>
                                          {docEditFilteredMentionMembers.length === 0 ? (
                                            <div className='flex h-[32px] items-center px-2 text-[14px] text-[#09090B]'>
                                              사용자가 없습니다
                                            </div>
                                          ) : (
                                            docEditFilteredMentionMembers.map((member: any, idx: number) => {
                                              const memberId = String(member?.user_id ?? '');
                                              const memberName = String(member?.name ?? '');
                                              const memberNick = String(member?.nickname ?? memberName);
                                              const memberInitial = (memberNick || memberName || ' ').slice(0, 2);
                                              const memberThumb = member?.thumbnail_url as string | undefined;
                                              const bg = getUserColor(String(member?.user_color ?? memberId));
                                              const isActive = idx === docEditMentionActiveIndex;
                                              return (
                                                <button
                                                  key={`doc-edit-mention-${memberId}`}
                                                  type='button'
                                                  data-doc-edit-mention-item='true'
                                                  className={`flex h-[32px] w-full items-center gap-2 px-2 text-left hover:bg-[#F4F4F5] ${
                                                    isActive ? 'bg-[#F4F4F5]' : ''
                                                  }`}
                                                  onMouseDown={(ev) => ev.preventDefault()}
                                                  onClick={() => {
                                                    const input = docEditMemoInputRef.current;
                                                    const cur = input?.selectionStart ?? editingDocMemoDraft.length;
                                                    const before = editingDocMemoDraft.slice(0, cur);
                                                    const after = editingDocMemoDraft.slice(cur);
                                                    const lastWs = Math.max(
                                                      before.lastIndexOf(' '),
                                                      before.lastIndexOf('\n'),
                                                      before.lastIndexOf('\t'),
                                                    );
                                                    const segStart = lastWs + 1;
                                                    if (before.slice(segStart, segStart + 1) !== '@') return;
                                                    const mentionText = `@${memberName} `;
                                                    const replaced = before.slice(0, segStart) + mentionText + after.replace(/^\S*/, '');
                                                    setEditingDocMemoDraft(replaced);
                                                    setDocEditMentionedUserIdsDraft((prev) =>
                                                      prev.includes(memberId) ? prev : [...prev, memberId],
                                                    );
                                                    setIsDocEditMentionOpen(false);
                                                    setDocEditMentionQuery('');
                                                    requestAnimationFrame(() => {
                                                      input?.focus();
                                                      const pos = (before.slice(0, segStart) + mentionText).length;
                                                      input?.setSelectionRange(pos, pos);
                                                    });
                                                  }}
                                                >
                                                  <div className='h-[24px] w-[24px] flex-shrink-0 overflow-hidden rounded-full bg-[#E5E7EB]'>
                                                    {memberThumb ? (
                                                      <img src={memberThumb} alt='profile' className='h-full w-full object-cover' />
                                                    ) : (
                                                      <div
                                                        className='flex h-full w-full items-center justify-center text-[11px] font-semibold text-white'
                                                        style={{ backgroundColor: bg }}
                                                      >
                                                        {memberInitial}
                                                      </div>
                                                    )}
                                                  </div>
                                                  <span className='text-[14px] text-[#09090B]'>{memberName}</span>
                                                </button>
                                              );
                                            })
                                          )}
                                        </div>
                                      </div>,
                                      document.body,
                                    )
                                  : null}
                                <div className='mt-2 flex justify-end gap-2'>
                                  <button
                                    type='button'
                                    className='h-[32px] w-[56px] rounded-[10px] border border-[#D4D4D8] bg-white text-[13px] font-semibold text-[#09090B]'
                                    onClick={() => {
                                      setEditingDocMemoId(null);
                                      setEditingDocMemoDraft('');
                                      setIsDocEditMentionOpen(false);
                                      setDocEditMentionQuery('');
                                      setDocEditMentionedUserIdsDraft([]);
                                    }}
                                  >
                                    취소
                                  </button>
                                  <button
                                    type='button'
                                    className='h-[32px] w-[56px] rounded-[10px] bg-[#69C0FF] text-[13px] font-semibold text-white disabled:opacity-50'
                                    disabled={isUpdateDocMemoPending || !editingDocMemoDraft.trim()}
                                    onClick={async () => {
                                      const next = editingDocMemoDraft.trim();
                                      if (!next) return;
                                      await onUpdateCivilCaseDocumentMemo({
                                        memo_id: memoId,
                                        content: next,
                                        ...(docEditMentionedUserIdsDraft.length
                                          ? { mentioned_user_ids: docEditMentionedUserIdsDraft }
                                          : {}),
                                      });
                                      await refetchDocMemos();
                                      onMessageToast({ message: '메모가 수정되었습니다.' });
                                      setEditingDocMemoId(null);
                                      setEditingDocMemoDraft('');
                                      setIsDocEditMentionOpen(false);
                                      setDocEditMentionQuery('');
                                      setDocEditMentionedUserIdsDraft([]);
                                    }}
                                  >
                                    저장
                                  </button>
                                </div>
                              </div>
                            ) : (
                              <div className='mt-2 whitespace-pre-wrap break-words text-[13px] leading-[20px] text-[#000]'>
                                {String(m?.content ?? '').trim() ? renderMemoWithMentions(String(m?.content ?? '')) : '-'}
                              </div>
                            )}
                          </div>
                        );
                      })
                  )}
                </div>

                {/* 하단: 메모 작성 */}
                <div className='sticky bottom-0 mt-2 w-full bg-[#f4f4f5] pb-[8px] pt-2'>
                  <div className='relative rounded-[12px] border-none bg-white'>
                    <div className='relative'>
                      {/* mention highlight overlay */}
                      <div
                        aria-hidden='true'
                        className='pointer-events-none absolute inset-0 z-0 h-[88px] w-full overflow-hidden rounded-[12px] bg-white'
                      >
                        <div
                          className='whitespace-pre-wrap break-words px-3 py-2 pr-[72px] text-[13px] leading-[20px] text-[#000000]'
                          style={{ transform: `translateY(-${docMemoScrollTop}px)` }}
                        >
                          {renderMentionOverlayText(docMemoDraft)}
                        </div>
                      </div>

                      <textarea
                        ref={docMemoInputRef}
                        value={docMemoDraft}
                        onScroll={(e) => setDocMemoScrollTop(e.currentTarget.scrollTop)}
                        onChange={(e) => {
                          const next = e.target.value;
                          setDocMemoDraft(next);

                          // 멘션 트리거: 마지막 토큰이 '@'로 시작하면 즉시 드롭다운 오픈
                          const cursor = e.target.selectionStart ?? next.length;
                          const before = next.slice(0, cursor);
                          const lastWs = Math.max(before.lastIndexOf(' '), before.lastIndexOf('\n'), before.lastIndexOf('\t'));
                          const segment = before.slice(lastWs + 1);

                          if (!segment.startsWith('@')) {
                            setIsDocMentionOpen(false);
                            setDocMentionQuery('');
                            return;
                          }
                          if (segment === '@') {
                            if (projectIdForMembers) void refetchProjectMembers();
                            setDocMentionActiveIndex(0);
                            setIsDocMentionOpen(true);
                            setDocMentionQuery('');
                            return;
                          }
                          const token = segment.slice(1).trim();
                          setDocMentionQuery(token);
                          // 1글자만 입력해도 오픈
                          setIsDocMentionOpen(true);
                        }}
                        onKeyDown={(e) => {
                          if (e.key === 'Escape') {
                            setIsDocMentionOpen(false);
                            setDocMentionQuery('');
                            return;
                          }
                          if (isDocMentionOpen) {
                            if (e.key === 'ArrowDown') {
                              e.preventDefault();
                              setDocMentionActiveIndex((prev) => {
                                const max = Math.max(docFilteredMentionMembers.length - 1, 0);
                                return Math.min(prev + 1, max);
                              });
                              return;
                            }
                            if (e.key === 'ArrowUp') {
                              e.preventDefault();
                              setDocMentionActiveIndex((prev) => Math.max(prev - 1, 0));
                              return;
                            }
                            if (e.key === 'Enter') {
                              if (docFilteredMentionMembers.length === 0) return;
                              e.preventDefault();
                              const member =
                                docFilteredMentionMembers[Math.min(docMentionActiveIndex, docFilteredMentionMembers.length - 1)];
                              if (!member) return;
                              const id = String((member as any)?.user_id ?? '');
                              const memberName = String((member as any)?.name ?? '');
                              const input = docMemoInputRef.current;
                              const cur = input?.selectionStart ?? docMemoDraft.length;
                              const before = docMemoDraft.slice(0, cur);
                              const after = docMemoDraft.slice(cur);
                              const lastWs = Math.max(before.lastIndexOf(' '), before.lastIndexOf('\n'), before.lastIndexOf('\t'));
                              const segStart = lastWs + 1;
                              const mentionText = `@${memberName} `;
                              const replaced = before.slice(0, segStart) + mentionText + after.replace(/^\S*/, '');
                              setDocMemoDraft(replaced);
                              setDocMentionedUserIdsDraft((prev) => (prev.includes(id) ? prev : [...prev, id]));
                              setIsDocMentionOpen(false);
                              setDocMentionQuery('');
                              requestAnimationFrame(() => {
                                input?.focus();
                                const pos = (before.slice(0, segStart) + mentionText).length;
                                input?.setSelectionRange(pos, pos);
                              });
                            }
                          }
                        }}
                        rows={3}
                        placeholder='메모를 추가하세요'
                        className='relative z-10 h-[88px] w-full resize-none rounded-[12px] border-none bg-transparent px-3 py-2 pr-[72px] text-[13px] leading-[20px] text-transparent caret-[#000000] outline-none placeholder:text-[#71717A] focus:border-none focus:ring-0'
                      />
                    </div>

                    {/* mention dropdown (doc memo) */}
                    {isDocMentionOpen && docMentionDropdownPos && typeof document !== 'undefined'
                      ? createPortal(
                          <div
                            ref={docMentionDropdownContainerRef}
                            className='z-[999999] overflow-hidden rounded-[8px] border border-[#E4E4E7] bg-white shadow-md'
                            style={{
                              position: 'fixed',
                              left: docMentionDropdownPos.left,
                              top: docMentionDropdownPos.top,
                              width: docMentionDropdownPos.width,
                            }}
                            onMouseDown={(ev) => ev.preventDefault()}
                          >
                            <div className='overflow-y-auto' style={{ maxHeight: docMentionDropdownPos.maxHeight }}>
                              {docFilteredMentionMembers.length === 0 ? (
                                <div className='flex h-[32px] items-center px-2 text-[14px] text-[#09090B]'>사용자가 없습니다</div>
                              ) : (
                                docFilteredMentionMembers.map((m: any, idx: number) => {
                                  const id = String(m?.user_id ?? '');
                                  const name = String(m?.name ?? '');
                                  const nick = String(m?.nickname ?? name);
                                  const initial = (nick || name || ' ').slice(0, 2);
                                  const thumb = m?.thumbnail_url as string | undefined;
                                  const bg = getUserColor(String(m?.user_color ?? id));
                                  const isActive = idx === docMentionActiveIndex;
                                  return (
                                    <button
                                      key={`doc-mention-${id}`}
                                      type='button'
                                      data-doc-mention-item='true'
                                      className={`flex h-[32px] w-full items-center gap-2 px-2 text-left hover:bg-[#F4F4F5] ${
                                        isActive ? 'bg-[#F4F4F5]' : ''
                                      }`}
                                      onMouseDown={(ev) => ev.preventDefault()}
                                      onClick={() => {
                                        const input = docMemoInputRef.current;
                                        const cur = input?.selectionStart ?? docMemoDraft.length;
                                        const before = docMemoDraft.slice(0, cur);
                                        const after = docMemoDraft.slice(cur);
                                        const lastWs = Math.max(
                                          before.lastIndexOf(' '),
                                          before.lastIndexOf('\n'),
                                          before.lastIndexOf('\t'),
                                        );
                                        const segStart = lastWs + 1;
                                        if (before.slice(segStart, segStart + 1) !== '@') return;
                                        const mentionText = `@${name} `;
                                        const replaced = before.slice(0, segStart) + mentionText + after.replace(/^\S*/, '');
                                        setDocMemoDraft(replaced);
                                        setDocMentionedUserIdsDraft((prev) => (prev.includes(id) ? prev : [...prev, id]));
                                        setIsDocMentionOpen(false);
                                        setDocMentionQuery('');
                                        requestAnimationFrame(() => {
                                          input?.focus();
                                          const pos = (before.slice(0, segStart) + mentionText).length;
                                          input?.setSelectionRange(pos, pos);
                                        });
                                      }}
                                    >
                                      <div className='h-[24px] w-[24px] flex-shrink-0 overflow-hidden rounded-full bg-[#E5E7EB]'>
                                        {thumb ? (
                                          <img src={thumb} alt='profile' className='h-full w-full object-cover' />
                                        ) : (
                                          <div
                                            className='flex h-full w-full items-center justify-center text-[11px] font-semibold text-white'
                                            style={{ backgroundColor: bg }}
                                          >
                                            {initial}
                                          </div>
                                        )}
                                      </div>
                                      <span className='text-[14px] text-[#09090B]'>{name}</span>
                                    </button>
                                  );
                                })
                              )}
                            </div>
                          </div>,
                          document.body,
                        )
                      : null}
                    <button
                      type='button'
                      className='absolute bottom-2 right-2 z-20 h-[32px] w-[56px] rounded-[10px] bg-[#69C0FF] text-[13px] font-semibold text-white disabled:opacity-50'
                      disabled={isAddDocMemoPending || !docMemoDraft.trim() || !caseDocumentId || !civilCaseId}
                      onClick={async () => {
                        const content = docMemoDraft.trim();
                        if (!content) return;
                        if (!caseDocumentId || !civilCaseId) return;
                        await onAddCivilCaseDocumentMemo({
                          case_document_id: String(caseDocumentId),
                          civil_case_id: String(civilCaseId),
                          content,
                          mentioned_user_ids: docMentionedUserIdsDraft.length ? docMentionedUserIdsDraft : null,
                        });
                        await refetchDocMemos();
                        onMessageToast({ message: '메모가 등록되었습니다.' });
                        setDocMemoDraft('');
                        setDocMentionedUserIdsDraft([]);
                        setIsDocMentionOpen(false);
                        setDocMentionQuery('');
                      }}
                    >
                      저장
                    </button>
                  </div>
                </div>

                {/* 삭제 확인 모달 */}
                {deleteDocMemoId ? (
                  <ModalSelect
                    sendMessage='메모를 삭제하시겠습니까?'
                    storageMessage='메모를 삭제하시겠습니까?'
                    confirmButtonText='삭제'
                    setIsModalOpen={() => setDeleteDocMemoId(null)}
                    handleSave={async () => {
                      const id = String(deleteDocMemoId);
                      setDeleteDocMemoId(null);
                      await onDeleteCivilCaseDocumentMemo({ memo_id: id });
                      await refetchDocMemos();
                      onMessageToast({ message: '메모가 삭제되었습니다.' });
                    }}
                  />
                ) : null}
              </div>
            ) : null}

            <div className={cn(panelTab === 'highlight' ? '' : 'hidden')}>
              {clippings.length === 0 ? (
                <></>
              ) : (
                <>
                  <div className='mb-2 flex items-center justify-between'></div>
                  <div className='flex flex-col gap-4'>
                    {/* 드래그 직후(서버 반영 전) 임시 카드 */}
                    {Object.entries(
                      savedSelections
                        .filter((s: any) => !s.clippingId)
                        .reduce<Record<number, any[]>>((acc, s: any) => {
                          const p = s.page ?? 1;
                          if (!acc[p]) acc[p] = [];
                          acc[p].push(s);
                          return acc;
                        }, {}),
                    )
                      .sort(([a], [b]) => Number(a) - Number(b))
                      .map(([page, list]) => (
                        <div key={`pending-page-${page}`} className='flex flex-col gap-3'>
                          <div className='text-[13px] font-medium text-[#000]'>Page {page}</div>
                          {(list as any[]).map((s: any) => (
                            <div
                              key={`pending-${s.id}`}
                              role='button'
                              tabIndex={0}
                              className='min-h-[140px] w-full cursor-pointer rounded-[16px] border border-[#D4D4D8] bg-white p-3 text-left shadow-sm hover:bg-[#FAFAFA] focus:outline-none focus-visible:outline-none'
                              onClick={() => {
                                setCurrentSelectionId(s.id);
                                setIsPanelSelectionActive(true);
                                const pageEl = pageContainerRefs.current?.[s.page];
                                if (!pageEl) return;
                                const rect = pageEl.getBoundingClientRect();
                                setActionBarPos({ left: rect.left + s.left, top: rect.top + s.bottom + 8 });
                              }}
                            >
                              {creatingSelectionId === s.id ? (
                                <div
                                  className='flex h-[24px] w-full items-center gap-1 rounded-[8px] px-2 text-[11px] font-medium text-[#C4C4C7]'
                                  style={{ backgroundColor: String(s?.color ?? '#F0F9FF') }}
                                >
                                  <div className='flex h-[16px] w-[16px] scale-[0.55] items-center justify-center'>
                                    <CustomSpinner size='sm' />
                                  </div>
                                  <span>하이라이트 내용 인식중{recognizingDots}</span>
                                </div>
                              ) : null}

                              {/* 하이라이트 캡쳐 이미지 프리뷰 (max height 90) - 인식중에는 숨김 */}
                              {(() => {
                                if (creatingSelectionId === s.id) return null;
                                const img = normalizeBucketUrl(
                                  s?.previewImageUrl ??
                                    s?.attachment_url ??
                                    s?.attachmentUrl ??
                                    s?.image_url ??
                                    s?.imageUrl ??
                                    s?.clipping_image_url ??
                                    s?.clippingImageUrl ??
                                    '',
                                );
                                if (!img) return null;
                                const bg = String(s?.color ?? '#F0F9FF').trim() || '#F0F9FF';
                                return (
                                  <div
                                    className='relative mt-2 h-[90px] w-full overflow-hidden rounded-[8px] border border-[#D4D4D8]'
                                    style={{ backgroundColor: bg }}
                                  >
                                    <img
                                      src={img}
                                      alt=''
                                      className='h-full w-full object-cover object-center'
                                      style={{ display: 'block' }}
                                    />
                                    {/* 하이라이트 색상 오버레이: 이미지 자체는 유지하면서 배경/흰 영역이 색상처럼 보이도록 */}
                                    <div
                                      className='pointer-events-none absolute inset-0'
                                      style={{ backgroundColor: bg, mixBlendMode: 'multiply', opacity: 0.9 }}
                                    />
                                  </div>
                                );
                              })()}

                              <div className='flex items-center gap-2'>
                                <div className='h-[28px] w-[28px] flex-shrink-0 overflow-hidden rounded-full bg-[#E5E7EB]'>
                                  {loginUserInfo?.data?.thumbnail_url ? (
                                    <img src={loginUserInfo.data.thumbnail_url} alt='profile' className='h-full w-full object-cover' />
                                  ) : (
                                    <div
                                      className='flex h-full w-full items-center justify-center rounded-full text-[13px] text-white'
                                      style={{
                                        backgroundColor: getUserColor(loginUserInfo?.data?.user_color || ''),
                                      }}
                                    >
                                      <span className='text-[13px] font-semibold'>{loginUserInfo?.data?.nickname?.slice(0, 1)}</span>
                                    </div>
                                  )}
                                </div>
                                <span className='text-[13px] text-[#8A8A8E]'>
                                  {s.createdAt ? formatRelativeTime(new Date(s.createdAt).toISOString()) : '방금 전'}
                                </span>
                              </div>
                            </div>
                          ))}
                        </div>
                      ))}

                    {Object.entries(
                      clippings.reduce<Record<number, any[]>>((acc, c: any) => {
                        const p = c.page_number ?? 1;
                        if (!acc[p]) acc[p] = [];
                        acc[p].push(c);
                        return acc;
                      }, {}),
                    )
                      .sort(([a], [b]) => Number(a) - Number(b))
                      .map(([page, list]) => (
                        <div key={`page-group-${page}`} className='flex flex-col gap-3'>
                          <div className='text-[13px] font-medium text-[#000]'>Page {page}</div>
                          {(list as any[]).map((c: any) => (
                            <div
                              key={c.clipping_id}
                              role='button'
                              tabIndex={0}
                              onClick={() => {
                                scrollToClipping(c);
                                const selId = ensureSelectionForClipping(c);
                                if (selId) {
                                  setCurrentSelectionId(selId);
                                  setIsPanelSelectionActive(true);
                                  setActionBarPos(null);
                                  requestAnimationFrame(() => updateActionBarPos());
                                }
                                setActiveHighlightClippingId(String(c.clipping_id));
                                setPanelEditClippingId(c.clipping_id);

                                // "하이라이트로 요청하기"를 위해 마지막 선택 클리핑 이미지 저장
                                try {
                                  const img = normalizeBucketUrl(
                                    c?.attachment_url ??
                                      c?.attachmentUrl ??
                                      c?.image_url ??
                                      c?.imageUrl ??
                                      c?.clipping_image_url ??
                                      c?.clippingImageUrl ??
                                      c?.preview_url ??
                                      c?.previewUrl ??
                                      '',
                                  );
                                  if (typeof window !== 'undefined') {
                                    if (img) window.sessionStorage.setItem('ailex:lastClippingImageUrl', img);
                                    window.sessionStorage.setItem('ailex:lastClippingId', String(c?.clipping_id ?? ''));
                                  }
                                } catch {
                                  // 무시
                                }
                              }}
                              onKeyDown={(e) => {
                                if (e.key === 'Enter' || e.key === ' ') {
                                  scrollToClipping(c);
                                  const selId = ensureSelectionForClipping(c);
                                  if (selId) {
                                    setCurrentSelectionId(selId);
                                    setIsPanelSelectionActive(true);
                                    setActionBarPos(null);
                                    requestAnimationFrame(() => updateActionBarPos());
                                  }
                                  setActiveHighlightClippingId(String(c.clipping_id));
                                  setPanelEditClippingId(c.clipping_id);
                                }
                              }}
                              ref={panelEditClippingId === c.clipping_id ? panelEditCardRef : null}
                              className={cn(
                                'group relative min-h-[140px] w-full cursor-pointer rounded-[16px] bg-white p-3 text-left shadow-sm hover:bg-[#FAFAFA] focus:outline-none focus-visible:outline-none',
                                activeHighlightClippingId === String(c.clipping_id) ? 'border-2' : 'border border-[#D4D4D8]',
                              )}
                              style={
                                activeHighlightClippingId === String(c.clipping_id)
                                  ? {
                                      borderColor:
                                        selectionBorderColorByClippingId.get(String(c.clipping_id)) ??
                                        selectionColorByClippingId.get(String(c.clipping_id)) ??
                                        '#D4D4D8',
                                    }
                                  : undefined
                              }
                            >
                              {/* 하이라이트 캡쳐 이미지 URL 프리뷰 (백엔드에서 URL 내려오는 경우) */}
                              {(() => {
                                const clipId = String(c?.clipping_id ?? '');
                                const img = normalizeBucketUrl(
                                  // 백엔드: clipping create 시 attachment_url에 이미지 URL이 내려옴
                                  c?.attachment_url ??
                                    c?.attachmentUrl ??
                                    c?.image_url ??
                                    c?.imageUrl ??
                                    c?.clipping_image_url ??
                                    c?.clippingImageUrl ??
                                    c?.preview_url ??
                                    c?.previewUrl ??
                                    '',
                                );
                                if (!img) return null;
                                const bg = selectionColorByClippingId.get(clipId) ?? '#F0F9FF';
                                return (
                                  <div
                                    className='relative mb-2 h-[90px] w-full overflow-hidden rounded-[8px] border border-[#D4D4D8]'
                                    style={{ backgroundColor: bg }}
                                  >
                                    <img
                                      src={img}
                                      alt=''
                                      className='h-full w-full object-cover object-center'
                                      style={{ display: 'block' }}
                                    />
                                    {/* 하이라이트 색상 오버레이 */}
                                    <div
                                      className='pointer-events-none absolute inset-0'
                                      style={{ backgroundColor: bg, mixBlendMode: 'multiply', opacity: 0.9 }}
                                    />
                                  </div>
                                );
                              })()}

                              {/* 저장된 상태(수정모드 아님): 선택된 태그 pill만 표시 */}
                              {panelEditClippingId !== c.clipping_id ? (
                                <div className='mb-2 flex items-center gap-2'>
                                  {(() => {
                                    const tags = getClippingTags(c);
                                    const docTag = (KNOWN_DOC_TAGS as readonly string[]).find((t) => tags.includes(t)) || null;
                                    const hasRelatedMissing = tags.includes(RELATED_MISSING_TAG);
                                    return (
                                      <>
                                        {docTag ? (
                                          <div className='flex h-[24px] w-[37px] items-center justify-center rounded-full bg-[#F0F8FF] text-[12px] font-semibold text-[#0071CC]'>
                                            {docTag}
                                          </div>
                                        ) : null}
                                        {hasRelatedMissing ? (
                                          <div className='flex h-[24px] w-[84px] items-center justify-center rounded-full bg-[#E4E4E7] text-[12px] font-semibold text-[#000000]'>
                                            관련 자료 부족
                                          </div>
                                        ) : null}
                                      </>
                                    );
                                  })()}
                                </div>
                              ) : null}

                              {/* 수정상태: 근거/강화/반박 + 관련자료부족 */}
                              {panelEditClippingId === c.clipping_id ? (
                                <div className='mb-2 flex flex-nowrap items-center gap-2'>
                                  {(() => {
                                    const tags = getClippingTags(c);
                                    const docTag =
                                      optimisticDocTagByClippingId[c.clipping_id] ??
                                      (KNOWN_DOC_TAGS as readonly string[]).find((t) => tags.includes(t)) ??
                                      null;
                                    const hasRelatedMissing = tags.includes(RELATED_MISSING_TAG);

                                    const setDocTag = async (nextTag: string) => {
                                      setOptimisticDocTagByClippingId((prev) => ({ ...prev, [c.clipping_id]: nextTag }));
                                      const preserved = tags.filter((t) => !(KNOWN_DOC_TAGS as readonly string[]).includes(t as any));
                                      const nextTags = [nextTag, ...preserved.filter((t) => t !== nextTag)];
                                      const ok = await applyClippingUpdate(c, { tags: nextTags, clippingType: toClippingType(nextTag) });
                                      if (!ok) {
                                        setOptimisticDocTagByClippingId((prev) => ({ ...prev, [c.clipping_id]: null }));
                                      }
                                    };

                                    const toggleRelatedMissing = async () => {
                                      const next = !hasRelatedMissing;
                                      const nextTags = next
                                        ? [...tags.filter((t) => t !== RELATED_MISSING_TAG), RELATED_MISSING_TAG]
                                        : tags.filter((t) => t !== RELATED_MISSING_TAG);
                                      await applyClippingUpdate(c, {
                                        tags: nextTags,
                                        clippingType: docTag ? toClippingType(docTag) : 'OTHER',
                                      });
                                    };

                                    return (
                                      <>
                                        <div className='flex h-[24px] w-[109px] overflow-hidden rounded-full border border-[#D4D4D8]'>
                                          {(KNOWN_DOC_TAGS as readonly string[]).map((t, idx) => {
                                            const isActive = docTag === t;
                                            const base = 'h-[24px] w-[34px] shrink-0 text-[12px] font-medium hover:bg-[#F5F5F6]';
                                            const state = isActive ? 'font-semibold' : 'font-medium';
                                            const radius = idx === 0 ? 'rounded-l-[8px]' : idx === 2 ? 'rounded-r-[8px]' : '';
                                            return (
                                              <button
                                                key={t}
                                                type='button'
                                                onClick={async (e) => {
                                                  e.stopPropagation();
                                                  await setDocTag(t);
                                                }}
                                                className={`${base} ${state} ${radius}`}
                                                style={{
                                                  backgroundColor: isActive ? '#F0F8FF' : '#FFFFFF',
                                                  color: isActive ? '#0071CC' : '#8A8A8E',
                                                }}
                                              >
                                                {t}
                                              </button>
                                            );
                                          })}
                                        </div>

                                        <button
                                          type='button'
                                          onClick={async (e) => {
                                            e.stopPropagation();
                                            await toggleRelatedMissing();
                                          }}
                                          className={`flex h-[24px] w-[103px] shrink-0 items-center justify-center gap-1 rounded-full border border-[#D4D4D8] text-[12px] hover:bg-[#F5F5F6] ${
                                            hasRelatedMissing
                                              ? 'bg-[#E4E4E7] font-semibold text-[#000000]'
                                              : 'bg-white font-medium text-[#8A8A8E]'
                                          }`}
                                        >
                                          {hasRelatedMissing ? null : (
                                            <div className='flex h-[13.5px] w-[13.5px] items-center justify-center rounded-full border border-[#8A8A8E]'>
                                              <Plus className='font-bold' />
                                            </div>
                                          )}
                                          <span>관련 자료 부족</span>
                                        </button>
                                      </>
                                    );
                                  })()}
                                </div>
                              ) : null}

                              {/* 카드 hover More 버튼: 인식중 바 우측 상단에 겹치기 */}
                              {canDeleteClipping(c) ? (
                                <div className='absolute right-[8px] top-[4px] z-[99999]'>
                                  <div className='relative'>
                                    <button
                                      type='button'
                                      onClick={(e) => {
                                        e.stopPropagation();
                                        setOpenClippingMenuId((prev) => (prev === c.clipping_id ? null : c.clipping_id));
                                      }}
                                      className='flex h-[32px] w-[32px] items-center justify-center rounded-[8px] border border-[#E4E4E7] bg-white p-[4px] opacity-0 transition-opacity group-hover:opacity-100'
                                      aria-label='클리핑 메뉴'
                                    >
                                      <MoreHorizontal className='h-[24px] w-[24px] text-[#71717A]' />
                                    </button>

                                    {openClippingMenuId === c.clipping_id ? (
                                      <div
                                        ref={clippingMenuRef}
                                        className='absolute right-0 top-[34px] z-[9999] w-[140px] overflow-hidden rounded-[12px] border border-[#E4E4E7] bg-white shadow-lg'
                                        onClick={(e) => e.stopPropagation()}
                                      >
                                        <button
                                          type='button'
                                          className='w-full px-4 py-3 text-left text-[14px] font-medium text-[#EF4444] hover:bg-[#FEE2E2]'
                                          onClick={() => {
                                            setOpenClippingMenuId(null);
                                            requestDeleteClipping(c);
                                          }}
                                          disabled={isDeleteClippingPending}
                                        >
                                          Delete
                                        </button>
                                      </div>
                                    ) : null}
                                  </div>
                                </div>
                              ) : null}

                              {/* 작성자/시간(메모 작성자 기반 표시) + 메모(다중) + 하단 작성(로그인 사용자) */}
                              {(() => {
                                const isEdit = panelEditClippingId === c.clipping_id;
                                const memos = getMemos(c)
                                  .filter((m: any) => typeof m?.content === 'string' && m.content.trim().length > 0)
                                  .slice()
                                  .sort((a: any, b: any) => String(a?.created_at || '').localeCompare(String(b?.created_at || '')));

                                const creatorUser = ((c as any)?.created_by ?? memos[0]?.created_by ?? null) as any;
                                const creatorName = String(creatorUser?.name ?? '');
                                const creatorNick = String(creatorUser?.nickname ?? creatorName);
                                const creatorInitial = (creatorNick || creatorName || ' ').slice(0, 1);
                                const creatorThumb = (creatorUser?.thumbnail_url as string | null) ?? undefined;
                                const creatorBgSeed = String(creatorUser?.user_color ?? creatorUser?.user_id ?? creatorUser?.name ?? '');

                                const me = loginUserInfo?.data as any;
                                const meName = String(me?.name ?? '');
                                const meNick = String(me?.nickname ?? meName);
                                const meInitial = (meNick || meName || ' ').slice(0, 1);
                                const meThumb = me?.thumbnail_url as string | undefined;
                                const meBgSeed = String(me?.user_color ?? me?.user_id ?? me?.name ?? '');

                                return (
                                  <>
                                    {!isEdit ? (
                                      <div className='flex items-start justify-between gap-2'>
                                        <div className='flex min-w-0 items-center gap-2'>
                                          <div className='h-[28px] w-[28px] flex-shrink-0 overflow-hidden rounded-full bg-[#E5E7EB]'>
                                            {creatorThumb ? (
                                              <img src={creatorThumb} alt='profile' className='h-full w-full object-cover' />
                                            ) : (
                                              <div
                                                className='flex h-full w-full items-center justify-center rounded-full text-[13px] text-white'
                                                style={{ backgroundColor: getUserColor(creatorBgSeed) }}
                                              >
                                                <span className='text-[13px] font-semibold'>{creatorInitial}</span>
                                              </div>
                                            )}
                                          </div>
                                          <div className='min-w-0'>
                                            <div className='flex items-center gap-1'>
                                              <span className='text-[13px] text-[#8A8A8E]'>{formatRelativeTime(c.created_at)}</span>
                                            </div>
                                          </div>
                                        </div>
                                        <div className='flex items-center gap-2' />
                                      </div>
                                    ) : null}

                                    {!isEdit ? (
                                      (() => {
                                        const first = memos[0];
                                        return (
                                          <div className='mt-2'>
                                            {first ? (
                                              <div className='max-h-[100px] overflow-hidden whitespace-pre-wrap break-words text-[13px] font-normal leading-[20px] text-[#000000]'>
                                                {renderMemoWithMentions(String(first.content))}
                                              </div>
                                            ) : null}
                                            {memos.length > 1 ? (
                                              <div className='mt-2 flex items-center gap-2 text-[13px] text-[#8A8A8E]'>
                                                <div className='flex items-center -space-x-2'>
                                                  {memos.slice(0, 7).map((m: any) => {
                                                    const u = (m?.created_by ?? null) as any;
                                                    const name = String(u?.name ?? '');
                                                    const nick = String(u?.nickname ?? name);
                                                    const initial = (nick || name || ' ').slice(0, 1);
                                                    const thumb = u?.thumbnail_url as string | undefined;
                                                    const bgSeed = String(u?.user_color ?? u?.user_id ?? u?.name ?? '');
                                                    return (
                                                      <div
                                                        key={`memo-avatar-${String(m.note_id)}`}
                                                        className='h-[20px] w-[20px] overflow-hidden rounded-full border border-white bg-[#E5E7EB]'
                                                      >
                                                        {thumb ? (
                                                          <img src={thumb} alt='profile' className='h-full w-full object-cover' />
                                                        ) : (
                                                          <div
                                                            className='flex h-full w-full items-center justify-center text-[11px] font-semibold text-white'
                                                            style={{ backgroundColor: getUserColor(bgSeed) }}
                                                          >
                                                            {initial}
                                                          </div>
                                                        )}
                                                      </div>
                                                    );
                                                  })}
                                                  {memos.length > 7 ? (
                                                    <div className='flex h-[20px] w-[20px] items-center justify-center rounded-full border border-white bg-[#E4E4E7] text-[11px] font-semibold text-[#09090B]'>
                                                      …
                                                    </div>
                                                  ) : null}
                                                </div>
                                                <div>메모 {memos.length - 1}개 더 보기</div>
                                              </div>
                                            ) : null}
                                          </div>
                                        );
                                      })()
                                    ) : (
                                      <div className='mt-2'>
                                        {memos.length > 0 ? (
                                          <div className='mt-2'>
                                            {memos.map((m: any) => {
                                              const isMine = canEditMemo(m);
                                              const isEditing = editingMemoId === String(m.note_id);
                                              const u = (m?.created_by ?? null) as any;
                                              const name = String(u?.name ?? '');
                                              const nick = String(u?.nickname ?? name);
                                              const initial = (nick || name || ' ').slice(0, 1);
                                              const thumb = u?.thumbnail_url as string | undefined;
                                              const bgSeed = String(u?.user_color ?? u?.user_id ?? u?.name ?? '');
                                              return (
                                                <div key={String(m.note_id)} className='group relative mt-3'>
                                                  <div className='flex items-center gap-2'>
                                                    <div className='h-[24px] w-[24px] flex-shrink-0 overflow-hidden rounded-full bg-[#E5E7EB]'>
                                                      {thumb ? (
                                                        <img src={thumb} alt='profile' className='h-full w-full object-cover' />
                                                      ) : (
                                                        <div
                                                          className='flex h-full w-full items-center justify-center rounded-full text-[12px] text-white'
                                                          style={{ backgroundColor: getUserColor(bgSeed) }}
                                                        >
                                                          <span className='text-[12px] font-semibold'>{initial}</span>
                                                        </div>
                                                      )}
                                                    </div>
                                                    <span className='text-[13px] font-semibold text-[#000000]'>{name}</span>
                                                    <span className='text-[13px] text-[#8A8A8E]'>{formatRelativeTime(m.created_at)}</span>
                                                  </div>

                                                  {isEditing ? (
                                                    <div className='mt-2'>
                                                      <textarea
                                                        ref={editMemoInputRef}
                                                        value={editingMemoDraft}
                                                        onChange={(e) => {
                                                          const next = e.target.value;
                                                          setEditingMemoDraft(next);
                                                          // 자동 높이 조절 (min → max 150px)
                                                          requestAnimationFrame(() => syncEditTextareaHeight());

                                                          const cursor = e.target.selectionStart ?? next.length;
                                                          const before = next.slice(0, cursor);
                                                          const lastWs = Math.max(
                                                            before.lastIndexOf(' '),
                                                            before.lastIndexOf('\n'),
                                                            before.lastIndexOf('\t'),
                                                          );
                                                          const segment = before.slice(lastWs + 1);

                                                          if (!segment.startsWith('@')) {
                                                            setIsEditMentionOpen(false);
                                                            setEditMentionQuery('');
                                                            return;
                                                          }
                                                          if (segment === '@') {
                                                            if (projectIdForMembers) void refetchProjectMembers();
                                                            setEditMentionActiveIndex(0);
                                                            setIsEditMentionOpen(true);
                                                            setEditMentionQuery('');
                                                            return;
                                                          }
                                                          const token = segment.slice(1).trim();
                                                          setEditMentionQuery(token);
                                                          setIsEditMentionOpen(token.length >= 1);
                                                        }}
                                                        onKeyDown={(e) => {
                                                          if (e.key === 'Escape') {
                                                            setIsEditMentionOpen(false);
                                                            setEditMentionQuery('');
                                                            return;
                                                          }
                                                          if (isEditMentionOpen) {
                                                            if (e.key === 'ArrowDown') {
                                                              e.preventDefault();
                                                              setEditMentionActiveIndex((prev) => {
                                                                const max = Math.max(editFilteredMentionMembers.length - 1, 0);
                                                                return Math.min(prev + 1, max);
                                                              });
                                                              return;
                                                            }
                                                            if (e.key === 'ArrowUp') {
                                                              e.preventDefault();
                                                              setEditMentionActiveIndex((prev) => Math.max(prev - 1, 0));
                                                              return;
                                                            }
                                                            if (e.key === 'Enter') {
                                                              if (editFilteredMentionMembers.length === 0) return;
                                                              e.preventDefault();
                                                              const member =
                                                                editFilteredMentionMembers[
                                                                  Math.min(editMentionActiveIndex, editFilteredMentionMembers.length - 1)
                                                                ];
                                                              if (!member) return;
                                                              const id = String((member as any)?.user_id ?? '');
                                                              const memberName = String((member as any)?.name ?? '');
                                                              const input = editMemoInputRef.current;
                                                              const cur = input?.selectionStart ?? editingMemoDraft.length;
                                                              const before = editingMemoDraft.slice(0, cur);
                                                              const after = editingMemoDraft.slice(cur);
                                                              const lastWs = Math.max(
                                                                before.lastIndexOf(' '),
                                                                before.lastIndexOf('\n'),
                                                                before.lastIndexOf('\t'),
                                                              );
                                                              const segStart = lastWs + 1;
                                                              const mentionText = `@${memberName} `;
                                                              const next =
                                                                before.slice(0, segStart) + mentionText + after.replace(/^\S*/, '');
                                                              setEditingMemoDraft(next);
                                                              setEditMentionedUserIdsDraft((prev) =>
                                                                prev.includes(id) ? prev : [...prev, id],
                                                              );
                                                              setIsEditMentionOpen(false);
                                                              setEditMentionQuery('');
                                                              requestAnimationFrame(() => {
                                                                input?.focus();
                                                                const pos = (before.slice(0, segStart) + mentionText).length;
                                                                input?.setSelectionRange(pos, pos);
                                                                syncEditTextareaHeight();
                                                              });
                                                              return;
                                                            }
                                                            return;
                                                          }
                                                        }}
                                                        rows={1}
                                                        placeholder='메모를 작성하세요'
                                                        className='min-h-[32px] w-full resize-none rounded-[12px] border border-[#D4D4D8] bg-white px-3 py-[6px] text-left text-[13px] text-[#000000] outline-none focus:border-[#0071CC]'
                                                      />
                                                      {isEditMentionOpen && editMentionDropdownPos && typeof document !== 'undefined'
                                                        ? createPortal(
                                                            <div
                                                              ref={editMentionDropdownContainerRef}
                                                              className='z-[999999] overflow-hidden rounded-[8px] border border-[#E4E4E7] bg-white shadow-md'
                                                              style={{
                                                                position: 'fixed',
                                                                left: editMentionDropdownPos.left,
                                                                top: editMentionDropdownPos.top,
                                                                width: editMentionDropdownPos.width,
                                                              }}
                                                              onMouseDown={(ev) => ev.preventDefault()}
                                                            >
                                                              <div
                                                                className='overflow-y-auto'
                                                                style={{ maxHeight: editMentionDropdownPos.maxHeight }}
                                                              >
                                                                {editFilteredMentionMembers.length === 0 ? (
                                                                  <div className='flex h-[32px] items-center px-2 text-[14px] text-[#09090B]'>
                                                                    사용자가 없습니다
                                                                  </div>
                                                                ) : (
                                                                  editFilteredMentionMembers.map((member: any, idx: number) => {
                                                                    const id = String(member?.user_id ?? '');
                                                                    const memberName = String(member?.name ?? '');
                                                                    const memberNick = String(member?.nickname ?? memberName);
                                                                    const memberInitial = (memberNick || memberName || ' ').slice(0, 2);
                                                                    const memberThumb = member?.thumbnail_url as string | undefined;
                                                                    const bg = getUserColor(String(member?.user_color ?? id));
                                                                    const isActive = idx === editMentionActiveIndex;

                                                                    return (
                                                                      <button
                                                                        key={`edit-mention-${id}`}
                                                                        type='button'
                                                                        data-edit-mention-item='true'
                                                                        className={`flex h-[32px] w-full items-center gap-2 px-2 text-left hover:bg-[#F4F4F5] ${
                                                                          isActive ? 'bg-[#F4F4F5]' : ''
                                                                        }`}
                                                                        onMouseDown={(ev) => ev.preventDefault()}
                                                                        onClick={() => {
                                                                          const input = editMemoInputRef.current;
                                                                          const cur = input?.selectionStart ?? editingMemoDraft.length;
                                                                          const before = editingMemoDraft.slice(0, cur);
                                                                          const after = editingMemoDraft.slice(cur);
                                                                          const lastWs = Math.max(
                                                                            before.lastIndexOf(' '),
                                                                            before.lastIndexOf('\n'),
                                                                            before.lastIndexOf('\t'),
                                                                          );
                                                                          const segStart = lastWs + 1;
                                                                          if (before.slice(segStart, segStart + 1) !== '@') return;
                                                                          const mentionText = `@${memberName} `;
                                                                          const next =
                                                                            before.slice(0, segStart) +
                                                                            mentionText +
                                                                            after.replace(/^\S*/, '');
                                                                          setEditingMemoDraft(next);
                                                                          setEditMentionedUserIdsDraft((prev) =>
                                                                            prev.includes(id) ? prev : [...prev, id],
                                                                          );
                                                                          setIsEditMentionOpen(false);
                                                                          setEditMentionQuery('');
                                                                          requestAnimationFrame(() => {
                                                                            input?.focus();
                                                                            const pos = (before.slice(0, segStart) + mentionText).length;
                                                                            input?.setSelectionRange(pos, pos);
                                                                          });
                                                                        }}
                                                                      >
                                                                        <div className='h-[24px] w-[24px] flex-shrink-0 overflow-hidden rounded-full bg-[#E5E7EB]'>
                                                                          {memberThumb ? (
                                                                            <img
                                                                              src={memberThumb}
                                                                              alt='profile'
                                                                              className='h-full w-full object-cover'
                                                                            />
                                                                          ) : (
                                                                            <div
                                                                              className='flex h-full w-full items-center justify-center text-[11px] font-semibold text-white'
                                                                              style={{ backgroundColor: bg }}
                                                                            >
                                                                              {memberInitial}
                                                                            </div>
                                                                          )}
                                                                        </div>
                                                                        <span className='text-[14px] text-[#09090B]'>{memberName}</span>
                                                                      </button>
                                                                    );
                                                                  })
                                                                )}
                                                              </div>
                                                            </div>,
                                                            document.body,
                                                          )
                                                        : null}
                                                      <div className='mt-2 flex justify-end gap-2'>
                                                        <button
                                                          type='button'
                                                          className='h-[24px] w-[37px] rounded-[8px] border border-[#D4D4D8] bg-white text-[12px] font-semibold text-[#09090B]'
                                                          onClick={() => {
                                                            setEditingMemoId(null);
                                                            setEditingMemoDraft('');
                                                            setIsEditMentionOpen(false);
                                                            setEditMentionQuery('');
                                                            setEditMentionedUserIdsDraft([]);
                                                          }}
                                                        >
                                                          취소
                                                        </button>
                                                        <button
                                                          type='button'
                                                          className='h-[24px] w-[37px] rounded-[8px] bg-[#69C0FF] text-[12px] font-semibold text-white'
                                                          disabled={isUpdateMemoPending || !editingMemoDraft.trim()}
                                                          onClick={async () => {
                                                            const content = editingMemoDraft.trim();
                                                            if (!content) return;
                                                            await updateMemoAsync({
                                                              note_id: String(m.note_id),
                                                              input: {
                                                                content,
                                                                mentioned_user_ids: editMentionedUserIdsDraft.length
                                                                  ? editMentionedUserIdsDraft
                                                                  : null,
                                                              },
                                                            } as any);
                                                            await refreshClippingNotes(c.clipping_id);
                                                            setEditingMemoId(null);
                                                            setEditingMemoDraft('');
                                                            setIsEditMentionOpen(false);
                                                            setEditMentionQuery('');
                                                            setEditMentionedUserIdsDraft([]);
                                                          }}
                                                        >
                                                          저장
                                                        </button>
                                                      </div>
                                                    </div>
                                                  ) : (
                                                    <div className='mt-1 whitespace-pre-wrap break-words text-left text-[13px] font-normal leading-[20px] text-[#000000]'>
                                                      {renderMemoWithMentions(String(m.content))}
                                                    </div>
                                                  )}

                                                  {isMine ? (
                                                    <div className='absolute right-0 top-0 z-[9999]'>
                                                      <button
                                                        type='button'
                                                        onClick={(e) => {
                                                          e.stopPropagation();
                                                          setOpenMemoMenuId((prev) =>
                                                            prev === String(m.note_id) ? null : String(m.note_id),
                                                          );
                                                        }}
                                                        className='flex h-[32px] w-[32px] items-center justify-center rounded-[8px] border border-[#E4E4E7] bg-white p-[4px] opacity-0 transition-opacity group-hover:opacity-100'
                                                        aria-label='메모 메뉴'
                                                      >
                                                        <MoreHorizontal className='h-[24px] w-[24px] text-[#71717A]' />
                                                      </button>

                                                      {openMemoMenuId === String(m.note_id) ? (
                                                        <div
                                                          ref={memoMenuRef}
                                                          className='absolute right-0 top-[34px] z-[9999] w-[140px] overflow-hidden rounded-[12px] border border-[#E4E4E7] bg-white shadow-lg'
                                                          onClick={(e) => e.stopPropagation()}
                                                        >
                                                          <button
                                                            type='button'
                                                            className='w-full px-4 py-3 text-left text-[14px] font-medium text-[#18181B] hover:bg-[#F4F4F5]'
                                                            onClick={() => {
                                                              setOpenMemoMenuId(null);
                                                              setEditingMemoId(String(m.note_id));
                                                              setEditingMemoDraft(String(m.content || ''));
                                                              setIsEditMentionOpen(false);
                                                              setEditMentionQuery('');
                                                              setEditMentionedUserIdsDraft([]);
                                                            }}
                                                          >
                                                            Edit
                                                          </button>
                                                          <button
                                                            type='button'
                                                            className='w-full px-4 py-3 text-left text-[14px] font-medium text-[#EF4444] hover:bg-[#FEE2E2]'
                                                            disabled={isDeleteMemoPending}
                                                            onClick={async () => {
                                                              setOpenMemoMenuId(null);
                                                              await deleteMemoAsync({ note_id: String(m.note_id) } as any);
                                                              await refreshClippingNotes(c.clipping_id);
                                                            }}
                                                          >
                                                            Delete
                                                          </button>
                                                        </div>
                                                      ) : null}
                                                    </div>
                                                  ) : null}
                                                </div>
                                              );
                                            })}
                                          </div>
                                        ) : null}

                                        {/* 작성(로그인 사용자) */}
                                        <div className='mt-3'>
                                          <div className='flex items-center gap-2'>
                                            <div className='h-[24px] w-[24px] flex-shrink-0 overflow-hidden rounded-full bg-[#E5E7EB]'>
                                              {meThumb ? (
                                                <img src={meThumb} alt='profile' className='h-full w-full object-cover' />
                                              ) : (
                                                <div
                                                  className='flex h-full w-full items-center justify-center rounded-full text-[12px] text-white'
                                                  style={{ backgroundColor: getUserColor(meBgSeed) }}
                                                >
                                                  <span className='text-[12px] font-semibold'>{meInitial}</span>
                                                </div>
                                              )}
                                            </div>
                                            <span className='text-[13px] font-semibold text-[#000000]'>{meName}</span>
                                          </div>

                                          {activeMemoInputClippingId === c.clipping_id ? (
                                            <div className='mt-2'>
                                              <div className='relative'>
                                                <textarea
                                                  ref={memoInputRef}
                                                  value={memoInputDraft}
                                                  onChange={(e) => {
                                                    const next = e.target.value;
                                                    setMemoInputDraft(next);
                                                    requestAnimationFrame(() => syncNewMemoTextareaHeight());

                                                    const cursor = e.target.selectionStart ?? next.length;
                                                    const before = next.slice(0, cursor);
                                                    const lastWs = Math.max(
                                                      before.lastIndexOf(' '),
                                                      before.lastIndexOf('\n'),
                                                      before.lastIndexOf('\t'),
                                                    );
                                                    const segment = before.slice(lastWs + 1);

                                                    if (!segment.startsWith('@')) {
                                                      setIsMentionOpen(false);
                                                      setMentionQuery('');
                                                      return;
                                                    }
                                                    if (segment === '@') {
                                                      if (projectIdForMembers) void refetchProjectMembers();
                                                      setMentionActiveIndex(0);
                                                      setIsMentionOpen(true);
                                                      setMentionQuery('');
                                                      return;
                                                    }
                                                    const token = segment.slice(1).trim();
                                                    setMentionQuery(token);
                                                    setIsMentionOpen(token.length >= 1);
                                                  }}
                                                  onKeyDown={(e) => {
                                                    if (e.key === 'Escape') {
                                                      setIsMentionOpen(false);
                                                      setMentionQuery('');
                                                      return;
                                                    }
                                                    if (isMentionOpen) {
                                                      if (e.key === 'ArrowDown') {
                                                        e.preventDefault();
                                                        setMentionActiveIndex((prev) => {
                                                          const max = Math.max(filteredMentionMembers.length - 1, 0);
                                                          return Math.min(prev + 1, max);
                                                        });
                                                        return;
                                                      }
                                                      if (e.key === 'ArrowUp') {
                                                        e.preventDefault();
                                                        setMentionActiveIndex((prev) => Math.max(prev - 1, 0));
                                                        return;
                                                      }
                                                      if (e.key === 'Enter') {
                                                        if (filteredMentionMembers.length === 0) return;
                                                        e.preventDefault();
                                                        const m =
                                                          filteredMentionMembers[
                                                            Math.min(mentionActiveIndex, filteredMentionMembers.length - 1)
                                                          ];
                                                        if (!m) return;
                                                        const id = String((m as any)?.user_id ?? '');
                                                        const name = String((m as any)?.name ?? '');
                                                        const input = memoInputRef.current;
                                                        const cur = input?.selectionStart ?? memoInputDraft.length;
                                                        const before = memoInputDraft.slice(0, cur);
                                                        const after = memoInputDraft.slice(cur);
                                                        const lastWs = Math.max(
                                                          before.lastIndexOf(' '),
                                                          before.lastIndexOf('\n'),
                                                          before.lastIndexOf('\t'),
                                                        );
                                                        const segStart = lastWs + 1;
                                                        const mentionText = `@${name} `;
                                                        const next = before.slice(0, segStart) + mentionText + after.replace(/^\S*/, '');
                                                        setMemoInputDraft(next);
                                                        setMentionedUserIdsDraft((prev) => (prev.includes(id) ? prev : [...prev, id]));
                                                        setIsMentionOpen(false);
                                                        setMentionQuery('');
                                                        requestAnimationFrame(() => {
                                                          input?.focus();
                                                          const pos = (before.slice(0, segStart) + mentionText).length;
                                                          input?.setSelectionRange(pos, pos);
                                                          syncNewMemoTextareaHeight();
                                                        });
                                                        return;
                                                      }
                                                      return;
                                                    }
                                                    if (e.key === 'Enter') {
                                                      // Shift+Enter: 줄바꿈 / Enter: 저장
                                                      if (e.shiftKey) return;
                                                      e.preventDefault();
                                                      void submitMemo(c.clipping_id);
                                                    }
                                                  }}
                                                  rows={1}
                                                  placeholder='메모를 추가하세요'
                                                  className='min-h-[32px] w-full resize-none rounded-[8px] border border-[#D4D4D8] bg-white px-3 py-[6px] text-left text-[13px] text-[#000000] outline-none placeholder:text-[#71717A] focus:border-[#0071CC]'
                                                />

                                                {isMentionOpen && mentionDropdownPos && typeof document !== 'undefined'
                                                  ? createPortal(
                                                      <div
                                                        ref={mentionDropdownContainerRef}
                                                        className='z-[999999] overflow-hidden rounded-[8px] border border-[#E4E4E7] bg-white shadow-md'
                                                        style={{
                                                          position: 'fixed',
                                                          left: mentionDropdownPos.left,
                                                          top: mentionDropdownPos.top,
                                                          width: mentionDropdownPos.width,
                                                        }}
                                                        onMouseDown={(ev) => ev.preventDefault()}
                                                      >
                                                        <div
                                                          className='overflow-y-auto'
                                                          style={{ maxHeight: mentionDropdownPos.maxHeight }}
                                                        >
                                                          {(() => {
                                                            const filtered = filteredMentionMembers;
                                                            if (filtered.length === 0) {
                                                              return (
                                                                <div className='flex h-[32px] items-center px-2 text-[14px] text-[#09090B]'>
                                                                  사용자가 없습니다
                                                                </div>
                                                              );
                                                            }
                                                            return filtered.map((m: any, idx: number) => {
                                                              const id = String(m?.user_id ?? '');
                                                              const name = String(m?.name ?? '');
                                                              const nick = String(m?.nickname ?? name);
                                                              const initial = (nick || name || ' ').slice(0, 2);
                                                              const thumb = m?.thumbnail_url as string | undefined;
                                                              const bg = getUserColor(String(m?.user_color ?? id));
                                                              const isActive = idx === mentionActiveIndex;

                                                              return (
                                                                <button
                                                                  key={`mention-${id}`}
                                                                  type='button'
                                                                  data-mention-item='true'
                                                                  className={`flex h-[32px] w-full items-center gap-2 px-2 text-left hover:bg-[#F4F4F5] ${
                                                                    isActive ? 'bg-[#F4F4F5]' : ''
                                                                  }`}
                                                                  onMouseDown={(ev) => ev.preventDefault()}
                                                                  onClick={() => {
                                                                    const input = memoInputRef.current;
                                                                    const cur = input?.selectionStart ?? memoInputDraft.length;
                                                                    const before = memoInputDraft.slice(0, cur);
                                                                    const after = memoInputDraft.slice(cur);
                                                                    const lastWs = Math.max(
                                                                      before.lastIndexOf(' '),
                                                                      before.lastIndexOf('\n'),
                                                                      before.lastIndexOf('\t'),
                                                                    );
                                                                    const segStart = lastWs + 1;
                                                                    if (before.slice(segStart, segStart + 1) !== '@') return;
                                                                    const mentionText = `@${name} `;
                                                                    const next =
                                                                      before.slice(0, segStart) + mentionText + after.replace(/^\S*/, '');
                                                                    setMemoInputDraft(next);
                                                                    setMentionedUserIdsDraft((prev) =>
                                                                      prev.includes(id) ? prev : [...prev, id],
                                                                    );
                                                                    setIsMentionOpen(false);
                                                                    setMentionQuery('');
                                                                    requestAnimationFrame(() => {
                                                                      input?.focus();
                                                                      const pos = (before.slice(0, segStart) + mentionText).length;
                                                                      input?.setSelectionRange(pos, pos);
                                                                    });
                                                                  }}
                                                                >
                                                                  <div className='h-[24px] w-[24px] flex-shrink-0 overflow-hidden rounded-full bg-[#E5E7EB]'>
                                                                    {thumb ? (
                                                                      <img
                                                                        src={thumb}
                                                                        alt='profile'
                                                                        className='h-full w-full object-cover'
                                                                      />
                                                                    ) : (
                                                                      <div
                                                                        className='flex h-full w-full items-center justify-center text-[11px] font-semibold text-white'
                                                                        style={{ backgroundColor: bg }}
                                                                      >
                                                                        {initial}
                                                                      </div>
                                                                    )}
                                                                  </div>
                                                                  <span className='text-[14px] text-[#09090B]'>{name}</span>
                                                                </button>
                                                              );
                                                            });
                                                          })()}
                                                        </div>
                                                      </div>,
                                                      document.body,
                                                    )
                                                  : null}
                                              </div>
                                              <div className='mt-2 flex justify-end gap-2'>
                                                <button
                                                  type='button'
                                                  className='h-[24px] w-[37px] rounded-[8px] border border-[#D4D4D8] bg-white text-[12px] font-semibold text-[#09090B]'
                                                  onClick={() => {
                                                    setActiveMemoInputClippingId(null);
                                                    setMemoInputDraft('');
                                                    setMentionedUserIdsDraft([]);
                                                    setIsMentionOpen(false);
                                                    setMentionQuery('');
                                                  }}
                                                >
                                                  취소
                                                </button>
                                                <button
                                                  type='button'
                                                  className='h-[24px] w-[37px] rounded-[8px] bg-[#69C0FF] text-[12px] font-semibold text-white'
                                                  disabled={!memoInputDraft.trim()}
                                                  onClick={async () => {
                                                    const content = memoInputDraft.trim();
                                                    if (!content) return;
                                                    await submitMemo(c.clipping_id);
                                                  }}
                                                >
                                                  저장
                                                </button>
                                              </div>
                                            </div>
                                          ) : (
                                            <button
                                              type='button'
                                              className='mt-1 flex h-[32px] w-full items-center justify-start text-left text-[13px] font-medium text-[#71717A]'
                                              onClick={(e) => {
                                                e.stopPropagation();
                                                setActiveMemoInputClippingId(c.clipping_id);
                                                setMemoInputDraft('');
                                                setMentionedUserIdsDraft([]);
                                                setIsMentionOpen(false);
                                                setMentionQuery('');
                                              }}
                                            >
                                              메모를 추가하세요
                                            </button>
                                          )}
                                        </div>
                                      </div>
                                    )}
                                  </>
                                );
                              })()}
                            </div>
                          ))}
                        </div>
                      ))}
                  </div>
                </>
              )}
            </div>
          </div>
        ) : null}

        {/* 가이드 문구는 "하이라이트 데이터가 없을 때" 그리고 "하이라이트 탭"에서만 노출 */}
        {((isCivilMode && panelTab === 'highlight') || !isCivilMode) && savedSelections.length === 0 && clippings.length === 0 ? (
          isClippingFetching ? (
            <div className='m-[16px] flex flex-col items-center gap-3 rounded-[12px] border border-[#D4D4D8] bg-white p-[16px]'>
              <p className='text-[13px] text-[#888]'>하이라이트 목록을 불러오는 중...</p>
              <div className='relative h-[3px] w-full overflow-hidden rounded-full bg-[#E4E4E7]'>
                <div className='progress-bar-indeterminate absolute h-full w-1/3 rounded-full bg-[#3F3F46]' />
              </div>
            </div>
          ) : (
            <div className='m-[16px] flex flex-col items-center gap-6 rounded-[12px] border border-[#D4D4D8] bg-white p-[12px]'>
              <img src={rightImg} alt='guide' className='w-full' />
              <div className='text-[14px] font-normal leading-[20px] text-[#000]'>
                <p>중요한 부분을 드래그하여 하이라이트 하세요. 원하는 색으로 강조하고 메모도 남길 수 있습니다.</p>

                <p>태그를 붙여, 이후에 서면 작성시에 활용하거나 의뢰인에게 부족한 자료를 요청할 수 있도록 표시해둘 수 있습니다.</p>
              </div>
            </div>
          )
        ) : null}
      </div>
    </div>
  );
}
