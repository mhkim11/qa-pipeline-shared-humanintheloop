import { useState, useRef, useEffect, useLayoutEffect, useMemo, useCallback } from 'react';

import { useMutation } from '@tanstack/react-query';
import { Check, ChevronDown, Highlighter, LayoutList, Minus, Pencil, Search, SquareArrowOutUpRight, X } from 'lucide-react';
import { Resizable } from 're-resizable';
import { createPortal } from 'react-dom';
import Draggable from 'react-draggable';
import { Document, Page, pdfjs } from 'react-pdf';
import 'react-pdf/dist/Page/AnnotationLayer.css';
import 'react-pdf/dist/Page/TextLayer.css';

import { useGetCivilCaseDocumentList, useGetClippingList } from '@query/query';
import { fetchGetDocumentContent } from '@/apis/case-api/civil-case-api';
import { fetchDeleteMemo, fetchUpdateMemo } from '@/apis/case-api/cliping-api';
import type { TGetClippingListOutput } from '@/apis/type/case-type/cliping.type';
import rightImg from '@/assets/images/rigjtImg.png';
import {
  CaseDocumentEditor,
  CaseUploadModal,
  DocumentListPanel,
  FloatingActionBar,
  PdfPagination,
  RightSidebarPanel,
} from '@/components/case-evidence';
import DocumentRenameModal from '@/components/case-evidence/case-detail-list/modal/document-rename-modal';
import ModalSelect from '@/components/common/modal/modal-select';
import CustomSpinner from '@/components/common/spiner';
import { onMessageToast } from '@/components/utils/global-utils';
import { useAddMemo, useCreateClipping, useDeleteClipping, useUpdateClipping } from '@/hooks/react-query/mutation/case';
import { useGetClippingNotes } from '@/hooks/react-query/mutation/case/use-get-clipping-notes';
import { useUpdateCivilCaseDocumentFileName } from '@/hooks/react-query/mutation/case/use-update-civil-case-document-file-name';
import { useViewCivilCaseDocument } from '@/hooks/react-query/mutation/case/use-view-civil-case-document';
import { useFindUserInfo } from '@/hooks/react-query/query/evidence';
import { useFindProjectMembers } from '@/hooks/react-query/query/evidence/use-find-project-members';

// PDF.js worker 설정
pdfjs.GlobalWorkerOptions.workerSrc = `https://unpkg.com/pdfjs-dist@${pdfjs.version}/build/pdf.worker.min.mjs`;

function HeaderIconButton({
  label,
  onClick,
  children,
  disabled,
}: {
  label: string;
  onClick: () => void;
  children: React.ReactNode;
  disabled?: boolean;
}): JSX.Element {
  const btnRef = useRef<HTMLButtonElement | null>(null);
  const [open, setOpen] = useState(false);
  const [pos, setPos] = useState<{ left: number; top: number } | null>(null);

  const updatePos = useCallback(() => {
    const el = btnRef.current;
    if (!el) return;
    const rect = el.getBoundingClientRect();
    const left = rect.left + rect.width / 2;
    const top = rect.top - 10;
    setPos({ left, top });
  }, []);

  useLayoutEffect(() => {
    if (!open) return;
    updatePos();
    window.addEventListener('resize', updatePos);
    window.addEventListener('scroll', updatePos, true);
    return () => {
      window.removeEventListener('resize', updatePos);
      window.removeEventListener('scroll', updatePos, true);
    };
  }, [open, updatePos]);

  return (
    <div className='relative'>
      <button
        ref={btnRef}
        type='button'
        disabled={!!disabled}
        onClick={() => {
          if (disabled) return;
          onClick();
        }}
        className={`flex h-[32px] w-[32px] items-center justify-center rounded-[10px] text-gray-600 ${
          disabled ? 'cursor-not-allowed opacity-40' : 'hover:bg-[#f2f2f2]'
        }`}
        onMouseEnter={() => {
          if (!disabled) setOpen(true);
        }}
        onMouseLeave={() => setOpen(false)}
        onFocus={() => {
          if (!disabled) setOpen(true);
        }}
        onBlur={() => setOpen(false)}
      >
        {children}
      </button>

      {open && pos && typeof document !== 'undefined'
        ? createPortal(
            <div
              className='pointer-events-none fixed z-[2147483647]'
              style={{ left: pos.left, top: pos.top, transform: 'translate(-50%, -100%)' }}
            >
              <div className='relative whitespace-nowrap rounded-[10px] bg-black px-3 py-2 text-[12px] font-medium text-white'>
                {label}
                <div className='absolute left-1/2 top-full h-0 w-0 -translate-x-1/2 border-x-[6px] border-t-[6px] border-x-transparent border-t-black' />
              </div>
            </div>,
            document.body,
          )
        : null}
    </div>
  );
}

type TCaseDetailListTableProps = {
  title: string;
  forceEditorOpen?: boolean;
  civilCaseId?: string | null;
  /** case_document_id로 진입했을 때 자동으로 해당 문서를 선택 */
  initialCaseDocumentId?: string | null;
  /** 초기 선택 문서를 직접 넘겨서 리스트 조회 결과와 무관하게 열기 */
  initialDocument?: Partial<TDocumentItem> | null;
  /** 문서 리스트 조회 source_type (기본: LAWYER) */
  sourceType?: 'LAWYER' | 'CLIENT';
  /** 외부 컨테이너에 삽입되는 경우(패딩/높이 보정) */
  embedded?: boolean;
  /** 상단 X 버튼 클릭 시 상세 화면을 닫고(=메인 목록 화면)으로 이동 */
  onExitToMainList?: () => void;
  /** 새탭 뷰어에서 좌측 문서리스트를 숨기고(PDF + 우측패널만) 렌더링 */
  hideLeftPanel?: boolean;
};
type TDocumentItem = {
  id: string;
  title: string;
  date: string;
  type: '실체 서면' | '서증' | '그 외';
  party: '원고' | '피고';
  pageCount?: number;
  pdfUrl?: string;
  projectId?: string;
  civilCaseId?: string;
  caseDocumentId?: string;
  attachmentUrl?: string;
  // 민사 기록 목록 테이블 필드
  documentDate?: string;
  parsedCategory?: string;
  parsedSubCategory?: string;
  parsedSubmitterType?: string;
  parsedSubmitterName?: string;
  clippingCount?: number;
  noteCount?: number;
  isPinned?: boolean;
  isBookmarked?: boolean;
  bookmarkCount?: number;
  tags?: string[];
  highlights?: any[];
  content?: Array<{ page_number: number; description: string }>;
  steps?: any[];
  ocrStep?: string;
  ocrStatus?: string;
};

type TRecentDocTab = {
  caseDocumentId: string;
  title: string;
  lastViewedAt: number;
};

type TClipHighlight = {
  clippingId: string;
  page: number;
  left: number;
  top: number;
  right: number;
  bottom: number;
  fillHex: string;
  borderHex: string;
};

type TSelection = {
  id: number;
  page: number;
  left: number;
  top: number;
  right: number;
  bottom: number;
  text: string;
  /** 로컬(드래그 직후) 카드 표시용 */
  createdAt?: number;
  /** 하이라이트(클리핑) 이미지 프리뷰 URL (인식중 UI에 표시) */
  previewImageUrl?: string;
  border?: string;
  /** 드래그 영역 배경색 */
  color?: string;
  /** 태그/상태 */
  flags?: {
    docUsable?: boolean; // 서면 활용 가능
    docUsableType?: '강화' | '반박' | '근거';
    relatedMissing?: boolean; // 관련 자료 부족
  };
  memo?: string;
  // 민사 모드에서 드래그 하이라이트 → 생성된 클리핑을 연결하기 위해 저장
  clippingId?: string;
  user?: {
    profile_image?: string;
  };
};

const CaseDetailListTable = ({
  title,
  forceEditorOpen,
  civilCaseId,
  initialCaseDocumentId,
  initialDocument,
  sourceType = 'LAWYER',
  embedded = false,
  onExitToMainList,
  hideLeftPanel = false,
}: TCaseDetailListTableProps): JSX.Element => {
  const [selectedFilter, setSelectedFilter] = useState<string>('전체');
  const [searchKeyword, _setSearchKeyword] = useState('');
  const [selectedDocument, setSelectedDocument] = useState<TDocumentItem | null>(null);
  const [numPages, setNumPages] = useState<number | null>(null);
  const [pageNumber, setPageNumber] = useState(1);
  const [pdfError, setPdfError] = useState<string | null>(null);
  const [isSelectionPanelOpen, setIsSelectionPanelOpen] = useState(true);
  // AI 서면 생성 에디터
  const [isEditorOpen, setIsEditorOpen] = useState(false);
  // const [editorData, setEditorData] = useState<string>('');

  // 스크롤형 PDF: 현재 화면에 가장 많이 보이는 페이지
  const [visiblePageNumber, setVisiblePageNumber] = useState(1);
  const pdfScrollContainerRef = useRef<HTMLDivElement>(null!);
  const isCivilMode = !!civilCaseId;

  // ! 민사 문서 목록 쿼리 (필터/정렬)
  const [civilListQuery, setCivilListQuery] = useState<{
    keyword: string;
    keywordVersion: number;
    power_search: string;
    filters: {
      parsed_category: string[];
      parsed_submitter_name: string[];
      tags: string[];
      bookmark: boolean;
      memo: boolean;
      clipping: boolean;
    };
    // sort는 유저가 선택했을 때만 API에 전달한다. (초기에는 보내지 않음)
    sortColumn?: 'document_date' | 'parsed_category' | 'parsed_submitter_name' | 'clipping_count' | 'memo_count' | 'bookmark_count';
    sortDirection?: 'asc' | 'desc';
    page: number;
    limit: number;
  }>({
    keyword: '',
    keywordVersion: 0,
    power_search: '',
    filters: {
      parsed_category: [],
      parsed_submitter_name: [],
      tags: [],
      bookmark: false,
      memo: false,
      clipping: false,
    },
    page: 1,
    // 기록목록 기본값: 20개씩 보기
    limit: 20,
  });
  // 클리핑 캡쳐(Object URL) 메모리 누수 방지
  const previewObjectUrlsRef = useRef<Set<string>>(new Set());
  useEffect(() => {
    const urls = previewObjectUrlsRef.current;
    return () => {
      try {
        for (const u of urls) URL.revokeObjectURL(u);
      } catch {
        // 무시
      }
      urls.clear();
    };
  }, []);
  const openSelectedDocInNewTab = useCallback(() => {
    const docId = String(selectedDocument?.caseDocumentId ?? '');
    const projectId = String(selectedDocument?.projectId ?? '');
    const ccid = String(civilCaseId ?? selectedDocument?.civilCaseId ?? '');
    if (docId && projectId && ccid) {
      const qs = new URLSearchParams();
      qs.set('projectId', projectId);
      qs.set('civilCaseId', ccid);
      // 새탭: PDF + 우측 패널만 보이는 전용 페이지로 이동
      window.open(`/evidence/case-tap/${docId}?${qs.toString()}`, '_blank');
      return;
    }
    if (selectedDocument?.pdfUrl) {
      window.open(String(selectedDocument.pdfUrl), '_blank');
    }
  }, [civilCaseId, selectedDocument?.caseDocumentId, selectedDocument?.civilCaseId, selectedDocument?.pdfUrl, selectedDocument?.projectId]);

  // ! 최근 열람 문서 탭 (최대 3개) + 마지막 열람 페이지 (localStorage)
  const RECENT_TABS_LIMIT = 3;
  const getRecentTabsKey = useCallback((ccid?: string | null) => `evi:civil:recent-docs:${String(ccid ?? '')}`, []);
  const getDocPageKey = useCallback(
    (ccid?: string | null, docId?: string | null) => `evi:civil:doc-page:${String(ccid ?? '')}:${String(docId ?? '')}`,
    [],
  );
  const readSavedPage = useCallback(
    (docId?: string | null) => {
      if (!civilCaseId || !docId) return null;
      try {
        const raw = localStorage.getItem(getDocPageKey(civilCaseId, docId));
        const n = Number(raw);
        if (!Number.isFinite(n)) return null;
        const page = Math.floor(n);
        return page >= 1 ? page : null;
      } catch {
        return null;
      }
    },
    [civilCaseId, getDocPageKey],
  );
  const [recentDocs, setRecentDocs] = useState<TRecentDocTab[]>([]);
  const { isPending: isRenamingDoc, onUpdateCivilCaseDocumentFileName } = useUpdateCivilCaseDocumentFileName();
  const [renameTarget, setRenameTarget] = useState<{ caseDocumentId: string; initialTitle: string } | null>(null);
  // 우측 패널 탭 상태(문서 리스트에서 memo/highlight 클릭 시 제어)
  const [rightPanelTab, setRightPanelTab] = useState<'highlight' | 'memo'>('highlight');

  // 탭 폭 계산용 (제목 길이 비례, 남는 폭은 채우지 않음. overflow 시 비례 축소 + ... 처리)
  const tabsRowRef = useRef<HTMLDivElement | null>(null);
  const [tabsRowWidth, setTabsRowWidth] = useState(0);
  const measureCanvasRef = useRef<HTMLCanvasElement | null>(null);
  const measureTitlePx = useCallback((text: string) => {
    const t = String(text ?? '');
    if (typeof document === 'undefined') return t.length * 10;
    if (!measureCanvasRef.current) measureCanvasRef.current = document.createElement('canvas');
    const ctx = measureCanvasRef.current.getContext('2d');
    if (!ctx) return t.length * 10;
    ctx.font = '500 13px system-ui, -apple-system, Segoe UI, Roboto, Helvetica, Arial';
    return Math.ceil(ctx.measureText(t).width);
  }, []);

  useLayoutEffect(() => {
    const el = tabsRowRef.current;
    if (!el) return;
    const update = () => setTabsRowWidth(Math.round(el.getBoundingClientRect().width));
    update();
    const ro = new ResizeObserver(() => update());
    ro.observe(el);
    return () => ro.disconnect();
  }, []);

  const tabWidthById = useMemo(() => {
    const tabs = recentDocs.slice(0, 3);
    const n = tabs.length;
    if (n === 0) return {} as Record<string, number>;
    const containerW = tabsRowWidth > 0 ? tabsRowWidth : 0;
    // gap-1(4px) 탭 간격 + 여백 패딩
    const available = Math.max(0, (containerW || 0) - (n - 1) * 4 - 8);

    const desired = tabs.map((t) => {
      const titlePx = measureTitlePx(String(t.title ?? ''));

      const fixed = 24 + 36 + 8; // 68
      return Math.max(96, titlePx + fixed);
    });

    let widths = [...desired];
    if (available > 0) {
      const sum = desired.reduce((a, b) => a + b, 0);

      if (sum > available) {
        const base = Math.floor(available / n);
        const remainder = Math.max(0, available - base * n);
        widths = Array.from({ length: n }, (_, i) => base + (i < remainder ? 1 : 0));
      }
    }

    const out: Record<string, number> = {};
    tabs.forEach((t, idx) => {
      out[String(t.caseDocumentId ?? '')] = Math.floor(widths[idx]);
    });
    return out;
  }, [measureTitlePx, recentDocs, tabsRowWidth]);
  const [pendingRestorePage, setPendingRestorePage] = useState<{ caseDocumentId: string; page: number } | null>(null);

  useEffect(() => {
    if (!isCivilMode || !civilCaseId) {
      setRecentDocs([]);
      return;
    }
    try {
      const raw = localStorage.getItem(getRecentTabsKey(civilCaseId));
      if (!raw) {
        setRecentDocs([]);
        return;
      }
      const parsed = JSON.parse(raw);
      if (!Array.isArray(parsed)) {
        setRecentDocs([]);
        return;
      }
      const normalized = parsed
        .map((x: any) => ({
          caseDocumentId: String(x?.caseDocumentId ?? ''),
          title: String(x?.title ?? ''),
          lastViewedAt: Number(x?.lastViewedAt ?? 0),
        }))
        .filter((x: TRecentDocTab) => x.caseDocumentId);
      setRecentDocs(normalized.slice(0, RECENT_TABS_LIMIT));
    } catch {
      setRecentDocs([]);
    }
  }, [civilCaseId, getRecentTabsKey, isCivilMode]);

  // LRU 기반 탭 추가/갱신: "마지막으로 본 탭"은 닫히지 않도록 가장 오래 안 본 탭을 제거한다.
  const upsertRecentDocTab = useCallback(
    (caseDocumentId: string, docTitle: string) => {
      const docId = String(caseDocumentId ?? '');
      if (!docId) return;
      const now = Date.now();
      const safeTitle = String(docTitle ?? '');

      setRecentDocs((prev) => {
        const existingIdx = prev.findIndex((x) => String(x.caseDocumentId ?? '') === docId);
        if (existingIdx >= 0) {
          return prev.map((x, i) => (i === existingIdx ? { ...x, title: safeTitle, lastViewedAt: now } : x));
        }

        const next = [...prev];
        if (next.length >= RECENT_TABS_LIMIT) {
          let removeIdx = 0;
          let minTs = Number.POSITIVE_INFINITY;
          for (let i = 0; i < next.length; i += 1) {
            const ts = Number(next[i]?.lastViewedAt ?? 0);
            if (ts < minTs) {
              minTs = ts;
              removeIdx = i;
            }
          }
          next.splice(removeIdx, 1);
        }
        next.push({ caseDocumentId: docId, title: safeTitle, lastViewedAt: now });
        return next;
      });
    },
    [RECENT_TABS_LIMIT],
  );

  // 메인 리스트에서 문서를 선택해 상세로 진입했을 때도, 선택된 문서를 즉시 "탭"으로 노출한다.
  // (recentDocs가 비어있는 초기 상태에서도 탭 UI가 보이도록 보정)
  useEffect(() => {
    if (!isCivilMode) return;
    const docId = String(selectedDocument?.caseDocumentId ?? '');
    if (!docId) return;
    const docTitle = String(selectedDocument?.title ?? '');
    upsertRecentDocTab(docId, docTitle);
  }, [isCivilMode, selectedDocument?.caseDocumentId, selectedDocument?.title, upsertRecentDocTab]);

  useEffect(() => {
    if (!isCivilMode || !civilCaseId) return;
    try {
      localStorage.setItem(getRecentTabsKey(civilCaseId), JSON.stringify(recentDocs.slice(0, RECENT_TABS_LIMIT)));
    } catch {
      // 무시
    }
  }, [civilCaseId, getRecentTabsKey, isCivilMode, recentDocs]);

  // ! 패널 리사이즈 (중앙 패널이 최소 너비 도달 시 VSCode 스타일 오버레이)
  const contentRowRef = useRef<HTMLDivElement>(null!);
  const [contentRowWidth, setContentRowWidth] = useState(0);
  const CENTER_MIN_WIDTH = 720;

  const LEFT_MIN = 370;
  const LEFT_MAX = 799;
  const RIGHT_MIN = 340;
  const RIGHT_MAX = 640;
  const [leftPanelWidth, setLeftPanelWidth] = useState(hideLeftPanel ? 0 : 400);
  const [rightPanelWidth, setRightPanelWidth] = useState(320);
  const _isRightPanelAtMin = rightPanelWidth <= RIGHT_MIN + 0.5;
  // 보기 설정은 축약하지 않고 항상 "보기 설정"으로 표기
  const viewSettingsLabel = '보기 설정';
  const viewSettingsBtnWidthPx = 114.5;
  const viewSettingsBtnPaddingClass = 'px-3';

  const clamp = (v: number, min: number, max: number) => Math.max(min, Math.min(max, v));

  useLayoutEffect(() => {
    const el = contentRowRef.current;
    if (!el) return;
    const update = () => setContentRowWidth(Math.round(el.getBoundingClientRect().width));
    update();
    const ro = new ResizeObserver(() => update());
    ro.observe(el);
    window.addEventListener('resize', update);
    return () => {
      window.removeEventListener('resize', update);
      ro.disconnect();
    };
  }, []);

  const { overlayLeft, overlayRight } = useMemo(() => {
    const W = contentRowWidth;
    if (!(W > 0)) return { overlayLeft: false, overlayRight: false };
    let ol = false;
    let or = false;
    for (let i = 0; i < 2; i += 1) {
      const leftInFlow: number = ol ? 0 : leftPanelWidth;
      const rightInFlow: number = isSelectionPanelOpen && !or ? rightPanelWidth : 0;
      ol = leftPanelWidth > Math.max(0, W - rightInFlow - CENTER_MIN_WIDTH);
      or = isSelectionPanelOpen && rightPanelWidth > Math.max(0, W - leftInFlow - CENTER_MIN_WIDTH);
    }
    return { overlayLeft: ol, overlayRight: or };
  }, [CENTER_MIN_WIDTH, contentRowWidth, isSelectionPanelOpen, leftPanelWidth, rightPanelWidth]);

  const pdfCenterOffsetPx = 0;

  // 새탭에서 문서를 열 때 가로 스크롤이 오른쪽 끝으로 잡히는 케이스 방지
  useEffect(() => {
    if (!hideLeftPanel) return;
    if (!selectedDocument?.pdfUrl) return;
    const scroller = pdfScrollContainerRef.current;
    if (!scroller) return;
    requestAnimationFrame(() => {
      scroller.scrollLeft = 0;
    });
    window.setTimeout(() => {
      scroller.scrollLeft = 0;
    }, 60);
  }, [hideLeftPanel, selectedDocument?.pdfUrl]);

  const startResize = useCallback(
    (side: 'left' | 'right', e: React.PointerEvent) => {
      e.preventDefault();
      e.stopPropagation();
      const startX = e.clientX;
      const startW = side === 'left' ? leftPanelWidth : rightPanelWidth;

      const onMove = (ev: PointerEvent) => {
        const dx = ev.clientX - startX;
        if (side === 'left') {
          setLeftPanelWidth(clamp(startW + dx, LEFT_MIN, LEFT_MAX));
        } else {
          // 우측 패널 핸들을 왼쪽으로 드래그하면 너비 증가
          setRightPanelWidth(clamp(startW - dx, RIGHT_MIN, RIGHT_MAX));
        }
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
    [LEFT_MAX, LEFT_MIN, RIGHT_MAX, RIGHT_MIN, leftPanelWidth, rightPanelWidth],
  );
  // PDF 레이아웃(뷰포트 크기) 변화 트리거: 정규화 좌표를 px로 재계산하기 위해 사용
  const [pdfLayoutVersion, setPdfLayoutVersion] = useState(0);
  // "하이라이트 내용 인식중..." 애니메이션용 (점 개수)
  const [recognizingDots, setRecognizingDots] = useState('');
  // 스크롤 컨테이너 기준 현재 페이지 계산을 위해 사용 (오프셋 기반)

  // 사이드바에서 "문서작성"을 눌렀을 때 에디터 화면을 강제 오픈
  useEffect(() => {
    if (typeof forceEditorOpen === 'boolean') {
      setIsEditorOpen(forceEditorOpen);
    }
  }, [forceEditorOpen]);

  useEffect(() => {
    const seq = ['', '.', '..', '...'];
    let i = 0;
    const t = window.setInterval(() => {
      i = (i + 1) % seq.length;
      setRecognizingDots(seq[i]);
    }, 350);
    return () => window.clearInterval(t);
  }, []);

  const {
    response: civilCaseDocsResponse,
    refetch: refetchCivilCaseDocs,
    isLoading: isCivilDocListLoading,
  } = useGetCivilCaseDocumentList({
    civilCaseId,
    keyword: civilListQuery.keyword,
    keywordVersion: civilListQuery.keywordVersion,
    powerSearch: civilListQuery.power_search,
    sourceType,
    page: civilListQuery.page,
    limit: civilListQuery.limit,
    filters: isCivilMode ? civilListQuery.filters : undefined,
    sortColumn: isCivilMode ? (civilListQuery.sortColumn as any) : undefined,
    sortDirection: isCivilMode ? (civilListQuery.sortDirection as any) : undefined,
  });

  const civilPagination = useMemo(() => {
    const raw = civilCaseDocsResponse as any;
    const p = raw?.pagination ?? raw?.data?.pagination ?? null;
    const page = Number(p?.page ?? civilListQuery.page ?? 1);
    const limit = Number(p?.limit ?? civilListQuery.limit ?? 100);
    const total = Number(p?.total ?? 0);
    const pages = Number(p?.pages ?? (total > 0 ? Math.ceil(total / Math.max(1, limit)) : 1));
    return { total, page, limit, pages };
  }, [civilCaseDocsResponse, civilListQuery.limit, civilListQuery.page]);

  const [isUploadModalOpen, setIsUploadModalOpen] = useState(false);

  const { isPending: isViewCivilDocPending, onViewCivilCaseDocument } = useViewCivilCaseDocument();
  const activePdfObjectUrlRef = useRef<string | null>(null);

  // ! 간편검색 모달
  const [isQuickSearchOpen, setIsQuickSearchOpen] = useState(false);
  const [quickSearchLoading, setQuickSearchLoading] = useState(false);
  const [quickSearchText, setQuickSearchText] = useState('');
  const [quickSearchPages, setQuickSearchPages] = useState<Array<{ page_number: number; description: string }> | null>(null);

  const openQuickSearch = useCallback(async () => {
    if (!selectedDocument) return;
    setIsQuickSearchOpen(true);
    setQuickSearchLoading(true);
    setQuickSearchPages(null);
    setQuickSearchText('');

    try {
      const civilId = String(civilCaseId ?? '').trim();
      const docId = String(selectedDocument?.caseDocumentId ?? (selectedDocument as any)?.case_document_id ?? '').trim();
      if (!civilId || !docId) {
        setQuickSearchText('텍스트 내용이 없습니다.');
        return;
      }
      const res = await fetchGetDocumentContent(civilId, docId);
      const content = (res as any)?.content ?? (res as any)?.data?.content ?? (res as any)?.data ?? null;
      const pages = Array.isArray(content)
        ? content
            .map((c: any) => ({ page_number: Number(c?.page_number ?? c?.pageNumber ?? 0), description: String(c?.description ?? '') }))
            .filter((c: any) => Number.isFinite(c.page_number) && c.page_number > 0)
        : [];
      if (pages.length > 0) {
        setQuickSearchPages(pages);
        setQuickSearchText('');
      } else {
        setQuickSearchPages(null);
        setQuickSearchText('텍스트 내용이 없습니다.');
      }
    } catch (error) {
      console.error('간편검색 내용 로딩 실패:', error);
      setQuickSearchText('텍스트 내용이 없습니다.');
    } finally {
      setQuickSearchLoading(false);
    }
  }, [civilCaseId, selectedDocument]);

  // 텍스트 선택 관련 상태
  const [isDragging, setIsDragging] = useState(false);
  const [dragStart, setDragStart] = useState({ x: 0, y: 0 });
  const [dragEnd, setDragEnd] = useState({ x: 0, y: 0 });
  const [selection, setSelection] = useState<{ x: number; y: number; width: number; height: number } | null>(null);
  const [liveSnappedBounds, setLiveSnappedBounds] = useState<{ x: number; y: number; width: number; height: number } | null>(null);
  const [savedSelections, setSavedSelections] = useState<TSelection[]>([]);
  const [creatingSelectionId, setCreatingSelectionId] = useState<number | null>(null);

  const [currentSelectionId, setCurrentSelectionId] = useState<number | null>(null); // 현재 선택된 영역 ID
  // 민사: 하이라이팅은 드래그로 생성되지만, "문서 밑 플로팅 버튼"은 우측 패널에서 해당 영역을 클릭했을 때만 노출
  const [isPanelSelectionActive, setIsPanelSelectionActive] = useState(false);
  const [paletteOpenForId, setPaletteOpenForId] = useState<number | null>(null);
  const [_isSelectionPanelButtonActive, setIsSelectionPanelButtonActive] = useState(false);
  const selectionPanelScrollRef = useRef<HTMLDivElement | null>(null);
  const [actionBarPos, setActionBarPos] = useState<{ left: number; top: number } | null>(null);
  const actionBarRef = useRef<HTMLDivElement | null>(null);

  // 스크롤형 PDF를 위해 페이지별 컨테이너를 관리합니다.
  const pageContainerRefs = useRef<Record<number, HTMLDivElement | null>>({});
  const activePageContainerRef = useRef<HTMLDivElement | null>(null);
  const activePageNumberRef = useRef<number>(1);
  const selectionIdCounter = useRef(0);

  // 선택 영역 패딩
  const SELECTION_PADDING = 4;

  const HIGHLIGHT_COLORS = useMemo(
    () => [
      { key: 'yellow', hex: '#FEF9C3', border: '#FACC15' },
      { key: 'cream', hex: '#FFEDD5', border: '#F97316' },
      { key: 'pink', hex: '#FCE7F3', border: '#EC4899' },
      { key: 'green', hex: '#ECFCCB', border: '#84CC16' },
      // 파란 하이라이트 보더 스펙: #69C0FF (PDF 보더와 일치)
      { key: 'blue', hex: '#E0F2FE', border: '#69C0FF' },
    ],
    [],
  );
  const DEFAULT_HIGHLIGHT_COLOR = HIGHLIGHT_COLORS[0]?.hex ?? '#FEF9C3';
  const DEFAULT_HIGHLIGHT_BORDER = HIGHLIGHT_COLORS[0]?.border ?? '#FACC15';

  const getBorderForColor = (hex?: string) => {
    if (!hex) return DEFAULT_HIGHLIGHT_BORDER;
    return HIGHLIGHT_COLORS.find((c) => c.hex === hex)?.border ?? DEFAULT_HIGHLIGHT_BORDER;
  };

  const parseCoordinateParts = useCallback((coord?: string | null): number[] | null => {
    const parts = (coord ?? '')
      .split(',')
      .map((x) => Number(x))
      .filter((n) => Number.isFinite(n));
    return parts.length === 4 ? parts : null;
  }, []);

  // coordinate가 0~1 사이의 "정규화 좌표"인지 판단 (기존 px 좌표와 공존)
  const isNormalizedCoordinate = useCallback((parts: number[]) => {
    // 1을 살짝 넘을 수 있는 부동소수점/여백을 감안
    return parts.every((v) => v >= -0.01 && v <= 1.01);
  }, []);

  // 기존(레거시) px 좌표의 기준 크기를 페이지별로 추정해, 현재 페이지 크기에 맞춰 스케일링하기 위함
  // - clippings 로드 이후에만 계산 가능하므로 ref로 유지하고, clippings 동기화 effect에서 갱신
  const legacyPxBaseByPageRef = useRef<Record<number, { w: number; h: number }>>({});

  const normalizeCoordinateFromSelection = useCallback(
    (sel: TSelection): string => {
      const pageEl = pageContainerRefs.current[sel.page];
      const w = pageEl?.clientWidth ?? 0;
      const h = pageEl?.clientHeight ?? 0;
      // 페이지 DOM 크기를 모르는 경우엔 기존 px로 저장(최소 보장). 가능한 경우 정규화 저장.
      if (!(w > 0 && h > 0)) return `${sel.left},${sel.top},${sel.right},${sel.bottom}`;

      const clamp01 = (v: number) => Math.max(0, Math.min(1, v));
      const l = clamp01(sel.left / w);
      const t = clamp01(sel.top / h);
      const r = clamp01(sel.right / w);
      const b = clamp01(sel.bottom / h);
      return `${l.toFixed(6)},${t.toFixed(6)},${r.toFixed(6)},${b.toFixed(6)}`;
    },
    [pageContainerRefs],
  );

  // 클리핑 생성 시: 선택 영역을 캔버스에서 잘라 이미지(File)로 만들어 함께 전송할 수 있다.
  const captureClippingRegionFile = useCallback(
    async (sel: TSelection): Promise<File | null> => {
      const page = sel.page;
      const pageEl = pageContainerRefs.current[page];
      if (!pageEl) return null;
      const canvas = pageEl.querySelector('canvas') as HTMLCanvasElement | null;
      if (!canvas) return null;

      // sel 좌표는 page wrapper(px) 기준. canvas는 내부 해상도(픽셀)가 다를 수 있어 비율 보정
      const scaleX = canvas.width / Math.max(1, pageEl.clientWidth);
      const scaleY = canvas.height / Math.max(1, pageEl.clientHeight);

      const sx = Math.max(0, Math.floor(sel.left * scaleX));
      const sy = Math.max(0, Math.floor(sel.top * scaleY));
      const sw = Math.max(1, Math.floor((sel.right - sel.left) * scaleX));
      const sh = Math.max(1, Math.floor((sel.bottom - sel.top) * scaleY));

      // bounds clamp
      const clampedW = Math.min(sw, canvas.width - sx);
      const clampedH = Math.min(sh, canvas.height - sy);
      if (!(clampedW > 0 && clampedH > 0)) return null;

      const out = document.createElement('canvas');
      out.width = clampedW;
      out.height = clampedH;
      const ctx = out.getContext('2d');
      if (!ctx) return null;
      ctx.drawImage(canvas, sx, sy, clampedW, clampedH, 0, 0, clampedW, clampedH);

      const blob: Blob | null = await new Promise((resolve) => out.toBlob((b) => resolve(b), 'image/png'));
      if (!blob) return null;

      const docId = String(selectedDocument?.caseDocumentId ?? 'doc');
      const filename = `clipping_${docId}_p${page}.png`;
      return new File([blob], filename, { type: 'image/png' });
    },
    [pageContainerRefs, selectedDocument?.caseDocumentId],
  );

  const resolveCoordinateToPx = useCallback(
    (c: (typeof clippings)[number]): { left: number; top: number; right: number; bottom: number } | null => {
      const parts = parseCoordinateParts(c.coordinate ?? '');
      if (!parts) return null;

      const [a, b, d, e] = parts; // left, top, right, bottom (either px or normalized)
      if (!isNormalizedCoordinate(parts)) {
        // 레거시 px 좌표는 "당시 페이지 DOM 크기" 기준이라, 현재 페이지 크기에 맞춰 스케일링한다.
        const page = c.page_number ?? 1;
        const pageEl = pageContainerRefs.current[page];
        const w = pageEl?.clientWidth ?? 0;
        const h = pageEl?.clientHeight ?? 0;
        const base = legacyPxBaseByPageRef.current[page];
        // base를 충분히 추정할 수 없으면(데이터가 너무 적은 등) 기존 값 그대로 사용
        if (!base || !(base.w > 50 && base.h > 50) || !(w > 0 && h > 0)) {
          return { left: a, top: b, right: d, bottom: e };
        }
        return {
          left: (a / base.w) * w,
          top: (b / base.h) * h,
          right: (d / base.w) * w,
          bottom: (e / base.h) * h,
        };
      }

      const page = c.page_number ?? 1;
      const pageEl = pageContainerRefs.current[page];
      const w = pageEl?.clientWidth ?? 0;
      const h = pageEl?.clientHeight ?? 0;
      if (!(w > 0 && h > 0)) return null;

      return { left: a * w, top: b * h, right: d * w, bottom: e * h };
    },
    [isNormalizedCoordinate, pageContainerRefs, parseCoordinateParts],
  );

  const hexToRgba = (hex: string, alpha: number) => {
    const normalized = hex.replace('#', '').trim();
    if (!/^[0-9a-fA-F]{6}$/.test(normalized)) return `rgba(59, 130, 246, ${alpha})`;
    const r = parseInt(normalized.slice(0, 2), 16);
    const g = parseInt(normalized.slice(2, 4), 16);
    const b = parseInt(normalized.slice(4, 6), 16);
    return `rgba(${r}, ${g}, ${b}, ${alpha})`;
  };

  const updateSelectionFlags = (id: number, patch: NonNullable<TSelection['flags']>) => {
    setSavedSelections((prev) => prev.map((s) => (s.id === id ? { ...s, flags: { ...(s.flags || {}), ...patch } } : s)));
  };

  const updateSelection = (id: number, patch: Partial<TSelection>) => {
    setSavedSelections((prev) => prev.map((s) => (s.id === id ? { ...s, ...patch } : s)));
  };

  const fallbackDocuments = useMemo<TDocumentItem[]>(() => [], []);

  const documents = useMemo<TDocumentItem[]>(() => {
    // API 응답이 환경/버전별로 data shape이 달라질 수 있어 방어적으로 배열을 추출한다.
    const rawDocs: any = (civilCaseDocsResponse as any)?.data;
    const data: any[] = Array.isArray(rawDocs)
      ? rawDocs
      : Array.isArray(rawDocs?.data)
        ? rawDocs.data
        : Array.isArray(rawDocs?.results)
          ? rawDocs.results
          : Array.isArray((civilCaseDocsResponse as any)?.data?.results)
            ? (civilCaseDocsResponse as any).data.results
            : [];
    if (!Array.isArray(data) || data.length === 0) return fallbackDocuments;

    const formatDate = (iso: string) => {
      if (!iso) return '';
      const d = new Date(iso);
      if (Number.isNaN(d.getTime())) return iso;
      const y = d.getFullYear();
      const m = String(d.getMonth() + 1).padStart(2, '0');
      const day = String(d.getDate()).padStart(2, '0');
      return `${y}.${m}.${day}`;
    };

    const mapDocType = (docTypeRaw: string): TDocumentItem['type'] => {
      if (docTypeRaw === '실체 서면' || docTypeRaw === '서증' || docTypeRaw === '그 외') return docTypeRaw;
      if (docTypeRaw?.includes('서증')) return '서증';
      if (docTypeRaw?.includes('서면') || docTypeRaw?.includes('소장') || docTypeRaw?.includes('준비') || docTypeRaw?.includes('답변'))
        return '실체 서면';
      return '그 외';
    };

    return data.map((d: any) => {
      const docDateRaw = String(d.document_date ?? d.documentDate ?? d.createdAt ?? '');
      const asBool = (v: unknown) => v === true || v === 'true' || v === 1 || v === '1';
      return {
        id: d.case_document_id || d.attachment_id || `${d.title}:${d.createdAt}`,
        // 문건명: parsed_sub_category 우선
        title: String(d.parsed_sub_category ?? d.parsedSubCategory ?? d.title ?? ''),
        // 날짜: document_date 우선
        date: formatDate(docDateRaw),
        type: mapDocType(d.document_type),
        party: d.is_plaintiff ? '원고' : '피고',
        projectId: d.project_id,
        civilCaseId: d.civil_case_id,
        caseDocumentId: d.case_document_id,
        attachmentUrl: d.file_url,
        documentDate: docDateRaw,
        parsedCategory: String(d.parsed_category ?? d.parsedCategory ?? ''),
        parsedSubCategory: String(d.parsed_sub_category ?? d.parsedSubCategory ?? ''),
        parsedSubmitterType: String(d.parsed_submitter_type ?? d.parsedSubmitterType ?? ''),
        parsedSubmitterName: String(d.parsed_submitter_name ?? d.parsedSubmitterName ?? ''),
        clippingCount: Number(d.clipping_count ?? d.clippingCount ?? 0),
        // 메모 개수: 최신 스펙 memo_count 우선
        noteCount: Number(d.memo_count ?? d.memoCount ?? d.note_count ?? d.noteCount ?? 0),
        isPinned: asBool(d.isPinned ?? d.is_pinned),
        isBookmarked: asBool(d.isBookmarked ?? d.is_bookmarked),
        bookmarkCount: Number(d.bookmarkCount ?? 0),
        tags: Array.isArray(d.tags) ? d.tags : [],
        highlights: Array.isArray(d.highlights) ? d.highlights : [],
        content: (() => {
          const raw = (d as any)?.content ?? (d as any)?.contents ?? (d as any)?.text_content ?? (d as any)?.textContent ?? null;
          const arr = Array.isArray(raw) ? raw : Array.isArray(raw?.content) ? raw.content : null;
          return Array.isArray(arr)
            ? arr
                .map((c: any) => ({
                  page_number: Number(c?.page_number ?? c?.pageNumber ?? 0),
                  description: String(c?.description ?? ''),
                }))
                .filter((c: any) => Number.isFinite(c.page_number) && c.page_number > 0)
            : [];
        })(),
        steps: Array.isArray(d.steps) ? d.steps : [],
        ocrStep: String(d.ocr_step ?? d.ocrStep ?? ''),
        ocrStatus: String(d.ocr_status ?? d.ocrStatus ?? ''),
      };
    });
  }, [civilCaseDocsResponse, fallbackDocuments]);

  const filteredDocuments = documents.filter((doc) => {
    if (selectedFilter !== '전체') {
      if (selectedFilter === '실체 서면' || selectedFilter === '서증' || selectedFilter === '그 외') {
        if (doc.type !== selectedFilter) return false;
      } else if (selectedFilter === '원고' || selectedFilter === '피고') {
        if (doc.party !== selectedFilter) return false;
      }
    }
    if (searchKeyword) {
      return doc.title.toLowerCase().includes(searchKeyword.toLowerCase());
    }
    return true;
  });

  // ! "보기 설정" (멤버 보기 필터) - 클리핑 목록 필터에 사용
  // - mode=all  : 전체 선택(모두 보기)
  // - mode=none : 전체 해제(아무도 보기 안 함)
  // - mode=custom: 일부 선택
  const [viewSelectionMode, setViewSelectionMode] = useState<'all' | 'none' | 'custom'>('all');
  const [viewMemberSelection, setViewMemberSelection] = useState<Set<string>>(new Set());

  // "보기 설정"에서 선택된 멤버를 클리핑 목록 조회에 creator_ids로 전달한다.
  // - all  : creator_ids 미전달(전체)
  // - custom: "id1,id2,..." 전달
  // - none : API 호출하지 않고 빈 목록으로 처리
  const creatorIdsParam = useMemo(() => {
    if (viewSelectionMode !== 'custom') return null;
    const ids = Array.from(viewMemberSelection ?? [])
      .map((x) => String(x ?? '').trim())
      .filter(Boolean);
    return ids.length ? ids.join(',') : null;
  }, [viewMemberSelection, viewSelectionMode]);

  const {
    response: clippingListResponse,
    isFetching: isClippingFetching,
    refetch: refetchClippings,
  } = useGetClippingList({
    civilCaseId: isCivilMode ? civilCaseId : null,
    caseDocumentId: isCivilMode && selectedDocument ? selectedDocument.caseDocumentId : null,
    creatorIds: creatorIdsParam,
    page: 1,
    limit: 40,
    enabled: viewSelectionMode !== 'none',
  });

  const formatRelativeTime = (iso?: string | null) => {
    if (!iso) return '';
    const t = new Date(iso).getTime();
    if (!Number.isFinite(t)) return '';
    const diff = Date.now() - t; // 과거 -> 양수
    if (diff < 0) return '방금 전';
    const sec = Math.floor(diff / 1000);
    if (sec < 60) return '방금 전';
    const min = Math.floor(sec / 60);
    if (min < 60) return `${min}분 전`;
    const hr = Math.floor(min / 60);
    if (hr < 24) return `${hr}시간 전`;
    const day = Math.floor(hr / 24);
    return `${day}일 전`;
  };

  type TClippingItem = TGetClippingListOutput['data']['results'][number];
  const clippings = useMemo<TClippingItem[]>(() => {
    // 전체 해제 상태면 빈 목록 표시
    if (viewSelectionMode === 'none') return [];
    const d = (clippingListResponse as any)?.data;
    if (!d) return [];
    // (호환) 일부 환경에서 data가 배열로 내려오는 케이스 방어
    if (Array.isArray(d)) return d.flatMap((x: any) => x?.results ?? []);
    return (d?.results ?? []) as TClippingItem[];
  }, [clippingListResponse, viewSelectionMode]);
  const [activeClipHighlight, setActiveClipHighlight] = useState<TClipHighlight | null>(null);
  const [pendingClipHighlight, setPendingClipHighlight] = useState<TClipHighlight | null>(null);
  const [openClippingMenuId, setOpenClippingMenuId] = useState<string | null>(null);
  const clippingMenuRef = useRef<HTMLDivElement | null>(null);
  const [openClippingTagMenuId, setOpenClippingTagMenuId] = useState<string | null>(null);
  const clippingTagMenuRef = useRef<HTMLDivElement | null>(null);
  const [openClippingColorMenuId, setOpenClippingColorMenuId] = useState<string | null>(null);
  const clippingColorMenuRef = useRef<HTMLDivElement | null>(null);
  // 우측 패널 "편집" 상태(태그/색상/플로팅 보더/메모 편집 등)로 들어간 카드
  const [panelEditClippingId, setPanelEditClippingId] = useState<string | null>(null);
  const panelEditCardRef = useRef<HTMLDivElement | null>(null);
  const [activeMemoInputClippingId, setActiveMemoInputClippingId] = useState<string | null>(null);
  const [memoInputDraft, setMemoInputDraft] = useState<string>('');
  const memoInputRef = useRef<HTMLInputElement | null>(null);
  const [editingMemoId, setEditingMemoId] = useState<string | null>(null);
  const [editingMemoDraft, setEditingMemoDraft] = useState<string>('');
  const [openMemoMenuId, setOpenMemoMenuId] = useState<string | null>(null);
  const memoMenuRef = useRef<HTMLDivElement | null>(null);
  const [clippingTagOverrides, setClippingTagOverrides] = useState<Record<string, string[]>>({});
  const [clippingColorOverrides, setClippingColorOverrides] = useState<Record<string, string>>({});
  const rightPanelRef = useRef<HTMLDivElement | null>(null);
  const [isClippingDeleteOpen, setIsClippingDeleteOpen] = useState(false);
  const [deleteTargetClipping, setDeleteTargetClipping] = useState<TClippingItem | null>(null);
  const [mentionQuery, setMentionQuery] = useState('');
  const [isMentionOpen, setIsMentionOpen] = useState(false);
  const [mentionActiveIndex, setMentionActiveIndex] = useState(0);
  const [mentionedUserIdsDraft, setMentionedUserIdsDraft] = useState<string[]>([]);
  const mentionDropdownContainerRef = useRef<HTMLDivElement | null>(null);
  const [mentionDropdownPos, setMentionDropdownPos] = useState<{
    left: number;
    top: number;
    width: number;
    maxHeight: number;
  } | null>(null);

  useEffect(() => {
    const onDown = (e: MouseEvent) => {
      if (!openClippingMenuId) return;
      const el = clippingMenuRef.current;
      if (!el) {
        setOpenClippingMenuId(null);
        return;
      }
      if (e.target instanceof Node && el.contains(e.target)) return;
      setOpenClippingMenuId(null);
    };
    document.addEventListener('mousedown', onDown);
    return () => document.removeEventListener('mousedown', onDown);
  }, [openClippingMenuId]);

  useEffect(() => {
    const onDown = (e: MouseEvent) => {
      if (!openClippingTagMenuId) return;
      const el = clippingTagMenuRef.current;
      if (!el) {
        setOpenClippingTagMenuId(null);
        return;
      }
      if (e.target instanceof Node && el.contains(e.target)) return;
      setOpenClippingTagMenuId(null);
    };
    document.addEventListener('mousedown', onDown);
    return () => document.removeEventListener('mousedown', onDown);
  }, [openClippingTagMenuId]);

  useEffect(() => {
    const onDown = (e: MouseEvent) => {
      if (!openClippingColorMenuId) return;
      const el = clippingColorMenuRef.current;
      if (!el) {
        setOpenClippingColorMenuId(null);
        return;
      }
      if (e.target instanceof Node && el.contains(e.target)) return;
      setOpenClippingColorMenuId(null);
    };
    document.addEventListener('mousedown', onDown);
    return () => document.removeEventListener('mousedown', onDown);
  }, [openClippingColorMenuId]);

  const resolveClippingColor = useCallback(
    (raw?: string) => {
      if (!raw) return { fillHex: '#FFEDD5', borderHex: '#F97316' };
      const s = String(raw).trim();
      // 1) key 매칭 (yellow/cream/pink/green/blue)
      const byKey = HIGHLIGHT_COLORS.find((h) => h.key === s);
      if (byKey) return { fillHex: byKey.hex, borderHex: byKey.border };
      // 2) border 매칭 (#F97316 등)
      const byBorder = HIGHLIGHT_COLORS.find((h) => h.border.toLowerCase() === s.toLowerCase());
      if (byBorder) return { fillHex: byBorder.hex, borderHex: byBorder.border };
      // 3) fill 매칭 (#FEF9C3 등)
      const byHex = HIGHLIGHT_COLORS.find((h) => h.hex.toLowerCase() === s.toLowerCase());
      if (byHex) return { fillHex: byHex.hex, borderHex: byHex.border };
      // 4) fallback: hex 값이면 border로 사용하고 안전한 fill 계산
      if (/^#[0-9a-f]{6}$/i.test(s)) return { fillHex: '#E0F2FE', borderHex: s };
      return { fillHex: '#FFEDD5', borderHex: '#F97316' };
    },
    [HIGHLIGHT_COLORS],
  );

  const resolveClippingColorKey = useCallback(
    (raw?: string) => {
      if (!raw) return HIGHLIGHT_COLORS[0]?.key ?? 'yellow';
      const s = String(raw).trim();
      const byKey = HIGHLIGHT_COLORS.find((h) => h.key === s);
      if (byKey) return byKey.key;
      const byBorder = HIGHLIGHT_COLORS.find((h) => h.border.toLowerCase() === s.toLowerCase());
      if (byBorder) return byBorder.key;
      const byHex = HIGHLIGHT_COLORS.find((h) => h.hex.toLowerCase() === s.toLowerCase());
      if (byHex) return byHex.key;
      return HIGHLIGHT_COLORS[0]?.key ?? 'yellow';
    },
    [HIGHLIGHT_COLORS],
  );

  // 월(YYYY.MM) → 상위(토글) → 하위(자료) 트리 구조로 변환
  const monthTree = useMemo(() => {
    // 민사: 캡쳐 UI는 테이블 기반이므로 (가짜 parent 없이) flat list로 제공한다.
    if (isCivilMode) {
      if (filteredDocuments.length === 0) return [];
      return [
        {
          monthKey: 'civil',
          monthLabel: '',
          nodes: filteredDocuments.map((d) => ({ key: `civil:${d.id}`, parent: d, children: [] })),
        },
      ];
    }

    const parseMonthKey = (date: string) => {
      // supports "2025.04.04" or "2025. 04. 04"
      const parts = date
        .split('.')
        .map((s) => s.trim())
        .filter(Boolean);
      const y = parts[0] || '';
      const m = parts[1] || '';
      return y && m ? `${y}.${m}` : date;
    };
    const toMonthLabel = (monthKey: string) => {
      const [y, m] = monthKey.split('.');
      if (!y || !m) return monthKey;
      return `${y}. ${m}.`;
    };

    const byMonth = filteredDocuments.reduce(
      (acc, doc) => {
        const mk = parseMonthKey(doc.date);
        if (!acc[mk]) acc[mk] = [];
        acc[mk].push(doc);
        return acc;
      },
      {} as Record<string, TDocumentItem[]>,
    );

    const months = Object.keys(byMonth).sort((a, b) => b.localeCompare(a));

    return months.map((mk) => {
      const docs = byMonth[mk] || [];
      const parents = docs.filter((d) => d.type !== '서증');
      const children = docs.filter((d) => d.type === '서증');

      const nodes =
        parents.length > 0
          ? parents.map((p, idx) => {
              const ownChildren = children.filter((c) => c.party === p.party);
              return {
                key: `${mk}:${p.id}`,
                parent: p,
                children: ownChildren.length > 0 ? ownChildren : idx === 0 ? children : [],
              };
            })
          : docs.map((d) => ({ key: `${mk}:${d.id}`, parent: d, children: [] }));

      return {
        monthKey: mk,
        monthLabel: toMonthLabel(mk),
        nodes,
      };
    });
  }, [filteredDocuments, isCivilMode]);

  const [expandedParents, setExpandedParents] = useState<Record<string, boolean>>({});
  const toggleParent = (key: string) => setExpandedParents((prev) => ({ ...prev, [key]: !prev[key] }));

  useEffect(() => {
    if (!isCivilMode) return;
    if (filteredDocuments.length === 0) return;
    setExpandedParents((prev) => (prev['civil:complaint'] === undefined ? { ...prev, ['civil:complaint']: true } : prev));
  }, [filteredDocuments.length, isCivilMode]);

  const handleDocumentClick = async (doc: TDocumentItem) => {
    const _ocrStatus = String(doc.ocrStatus ?? '')
      .toUpperCase()
      .trim();
    if (_ocrStatus && _ocrStatus !== 'COMPLETED') {
      onMessageToast({ message: 'OCR 중입니다. 완료 후 가능합니다.' });
      return;
    }

    const samplePdfUrl = `${window.location.origin}/list.pdf`;

    // 최근 열람 문서 탭 갱신 (민사에서만)
    if (isCivilMode && doc.caseDocumentId) {
      const saved = readSavedPage(String(doc.caseDocumentId));
      setPendingRestorePage({
        caseDocumentId: String(doc.caseDocumentId),
        page: saved ?? 1,
      });
      upsertRecentDocTab(String(doc.caseDocumentId), String(doc.title ?? ''));
    } else {
      setPendingRestorePage(null);
    }

    setSelectedDocument({ ...doc, pdfUrl: undefined });
    setPageNumber(1);
    setVisiblePageNumber(1);
    setPdfError(null);
    setNumPages(null);
    // 문서 전환 시: 이전 문서의 하이라이트/선택/플로팅 상태가 남지 않도록 전부 초기화
    setSavedSelections([]);
    setSelection(null);
    setCurrentSelectionId(null);
    setIsPanelSelectionActive(false);
    setActionBarPos(null);
    setActiveClipHighlight(null);
    setPendingClipHighlight(null);
    setPanelEditClippingId(null);
    setOpenClippingMenuId(null);
    setOpenClippingTagMenuId(null);
    setOpenClippingColorMenuId(null);
    setOpenMemoMenuId(null);
    setActiveMemoInputClippingId(null);
    setMemoInputDraft('');
    // setEditingMemoId(null);
    // setEditingMemoDraft('');
    setClippingTagOverrides({});
    setClippingColorOverrides({});

    // 민사: 문서보기 API로 Blob을 받아 react-pdf로 렌더
    if (isCivilMode && doc.projectId && (civilCaseId || doc.civilCaseId) && doc.caseDocumentId) {
      const blob = await onViewCivilCaseDocument({
        project_id: doc.projectId,
        civil_case_id: civilCaseId || doc.civilCaseId || '',
        case_document_id: doc.caseDocumentId,
        doc_type: 'pdf',
      });

      if (!blob) {
        setPdfError('PDF를 불러올 수 없습니다.');
        setSelectedDocument((prev) => (prev ? { ...prev, pdfUrl: samplePdfUrl } : prev));
        return;
      }

      // 이전 objectURL 정리
      if (activePdfObjectUrlRef.current) {
        URL.revokeObjectURL(activePdfObjectUrlRef.current);
        activePdfObjectUrlRef.current = null;
      }

      const objectUrl = URL.createObjectURL(blob);
      activePdfObjectUrlRef.current = objectUrl;
      setSelectedDocument((prev) => (prev ? { ...prev, pdfUrl: objectUrl } : prev));
      return;
    }

    // fallback
    setSelectedDocument((prev) => (prev ? { ...prev, pdfUrl: samplePdfUrl } : prev));
  };

  const openRecentDocTab = (caseDocumentId: string) => {
    const targetId = String(caseDocumentId ?? '');
    if (!targetId) return;

    // 이미 열려있는 문서 탭이면: pending restore로 페이지 복원만 수행
    if (String(selectedDocument?.caseDocumentId ?? '') === targetId) {
      // 클릭한 탭을 "마지막으로 본 탭"으로 마킹
      const curTitle = recentDocs.find((x) => String(x.caseDocumentId ?? '') === targetId)?.title ?? String(selectedDocument?.title ?? '');
      upsertRecentDocTab(targetId, String(curTitle));
      const saved = readSavedPage(targetId) ?? 1;
      setPendingRestorePage({ caseDocumentId: targetId, page: saved });
      setPageNumber(saved);
      setVisiblePageNumber(saved);
      return;
    }

    const target = documents.find((d) => String(d.caseDocumentId ?? '') === targetId);
    if (!target) return;
    void handleDocumentClick(target);
  };

  const closeRecentDocTab = (caseDocumentId: string) => {
    const targetId = String(caseDocumentId ?? '');
    if (!targetId) return;
    const activeId = String(selectedDocument?.caseDocumentId ?? '');
    setRecentDocs((prev) => {
      const idx = prev.findIndex((x) => String(x.caseDocumentId ?? '') === targetId);
      const nextList = prev.filter((x) => String(x.caseDocumentId ?? '') !== targetId);

      // 현재 활성 탭을 닫으면 이전 탭으로 즉시 전환 (없으면 다음 탭)
      if (activeId && activeId === targetId) {
        const fallback = (idx > 0 ? prev[idx - 1] : prev[idx + 1]) ?? null;
        const nextId = String(fallback?.caseDocumentId ?? '').trim();
        window.setTimeout(() => {
          if (nextId) openRecentDocTab(nextId);
          else setSelectedDocument(null);
        }, 0);
      }
      return nextList;
    });
  };

  // URL에서 case_document_id로 진입한 경우: 문서 목록 로드 후 자동 선택
  const autoOpenedCaseDocumentIdRef = useRef<string | null>(null);
  useEffect(() => {
    if (!initialCaseDocumentId) return;
    if (autoOpenedCaseDocumentIdRef.current === initialCaseDocumentId) return;
    const target = documents.find((d) => String(d.caseDocumentId ?? '') === String(initialCaseDocumentId));
    if (!target) {
      const initialDocId = String(initialDocument?.caseDocumentId ?? initialDocument?.id ?? '');
      if (initialDocId && initialDocId === String(initialCaseDocumentId)) {
        autoOpenedCaseDocumentIdRef.current = initialCaseDocumentId;
        const normalized = {
          id: String(initialDocument?.id ?? initialDocId),
          title: String(initialDocument?.title ?? ''),
          date: String(initialDocument?.date ?? initialDocument?.documentDate ?? ''),
          type: (initialDocument?.type as TDocumentItem['type']) ?? '그 외',
          party: (initialDocument?.party as TDocumentItem['party']) ?? '원고',
          projectId: initialDocument?.projectId,
          civilCaseId: initialDocument?.civilCaseId,
          caseDocumentId: initialDocument?.caseDocumentId ?? initialDocId,
          attachmentUrl: initialDocument?.attachmentUrl,
          documentDate: initialDocument?.documentDate,
          parsedCategory: initialDocument?.parsedCategory,
          parsedSubCategory: initialDocument?.parsedSubCategory,
          parsedSubmitterType: initialDocument?.parsedSubmitterType,
          parsedSubmitterName: initialDocument?.parsedSubmitterName,
          clippingCount: initialDocument?.clippingCount,
          noteCount: initialDocument?.noteCount,
          isPinned: initialDocument?.isPinned,
          isBookmarked: initialDocument?.isBookmarked,
          bookmarkCount: initialDocument?.bookmarkCount,
          tags: initialDocument?.tags,
          highlights: initialDocument?.highlights,
          content: initialDocument?.content,
          steps: initialDocument?.steps,
          ocrStep: initialDocument?.ocrStep,
          ocrStatus: initialDocument?.ocrStatus,
        } as TDocumentItem;
        void handleDocumentClick(normalized);
      }
      return;
    }
    autoOpenedCaseDocumentIdRef.current = initialCaseDocumentId;
    void handleDocumentClick(target);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [initialCaseDocumentId, initialDocument, documents]);

  useEffect(() => {
    return () => {
      if (activePdfObjectUrlRef.current) {
        URL.revokeObjectURL(activePdfObjectUrlRef.current);
        activePdfObjectUrlRef.current = null;
      }
    };
  }, []);

  const onDocumentLoadSuccess = ({ numPages: totalPages }: { numPages: number }) => {
    console.log('PDF 로드 성공:', totalPages);
    setNumPages(totalPages);
    setVisiblePageNumber(1);
    setPdfError(null);
  };

  const onDocumentLoadError = (error: Error) => {
    console.error('PDF 로드 오류:', error);
    setPdfError(`PDF를 불러올 수 없습니다`);
  };
  const { response: loginUserInfo } = useFindUserInfo();
  const projectIdForMembers = selectedDocument?.projectId ?? '';
  const { response: projectMembersResponse, refetch: refetchProjectMembers } = useFindProjectMembers({
    projectId: projectIdForMembers,
    enabled: false,
  });

  const { isPending: _isCreateClippingPending, onCreateClipping } = useCreateClipping();
  const { isPending: _isUpdateClippingPending, onUpdateClipping } = useUpdateClipping();
  const { isPending: isDeleteClippingPending, onDeleteClipping } = useDeleteClipping();
  const { isPending: isAddMemoPending, onAddMemo } = useAddMemo();
  const { onGetClippingNotes } = useGetClippingNotes();

  const { mutateAsync: updateMemoAsync, isPending: isUpdateMemoPending } = useMutation({
    mutationFn: fetchUpdateMemo,
  });

  const { mutateAsync: deleteMemoAsync, isPending: isDeleteMemoPending } = useMutation({
    mutationFn: fetchDeleteMemo,
  });

  const KNOWN_DOC_TAGS = useMemo(() => ['근거', '강화', '반박'] as const, []);
  const RELATED_MISSING_TAG = '관련 자료 부족';
  const toClippingType = (tag: string) => (tag === '반박' ? 'REFUTED' : tag === '근거' ? 'REASON' : 'ENFORCED');

  const getCreatedByUserId = useCallback((createdBy: any): string | null => {
    if (!createdBy) return null;
    if (typeof createdBy === 'string') return createdBy;
    if (typeof createdBy === 'object' && createdBy?.user_id) return String(createdBy.user_id);
    return null;
  }, []);

  const canEditMemo = useCallback(
    (memo: any) => {
      const me = loginUserInfo?.data?.user_id;
      if (!me) return false;
      const createdById = getCreatedByUserId(memo?.created_by);
      return createdById ? createdById === me : false;
    },
    [getCreatedByUserId, loginUserInfo?.data?.user_id],
  );

  const [clippingNotesByClippingId, setClippingNotesByClippingId] = useState<Record<string, any[]>>({});

  const refreshClippingNotes = useCallback(
    async (clippingId: string) => {
      if (!clippingId) return;
      const res = await onGetClippingNotes({ clipping_id: clippingId, input: { page: 1, limit: 20 } });
      const list = (res as any)?.data?.results;
      if (Array.isArray(list)) {
        setClippingNotesByClippingId((prev) => ({ ...prev, [clippingId]: list }));
      }
    },
    [onGetClippingNotes],
  );

  const getMemos = useCallback(
    (c: (typeof clippings)[number]) => {
      const cached = clippingNotesByClippingId[c.clipping_id];
      if (Array.isArray(cached)) return cached;
      const raw = (c as any).notes;
      if (!raw) return [] as any[];
      if (Array.isArray(raw)) return raw.filter(Boolean);
      if (typeof raw === 'object') return [raw];
      if (typeof raw === 'string' && raw.trim()) {
        // legacy: notes가 string인 경우를 단일 메모처럼 취급
        return [
          {
            note_id: 'legacy',
            content: raw,
            created_at: (c as any).created_at,
            updated_at: (c as any).updated_at,
            created_by: { user_id: '', name: '' },
          },
        ];
      }
      return [] as any[];
    },
    [clippingNotesByClippingId],
  );

  // const canEditMemo = useCallback(
  //   (memo: any) => {
  //     const me = loginUserInfo?.data?.user_id;
  //     if (!me) return false;
  //     const createdById = getCreatedByUserId(memo?.created_by);
  //     return createdById ? createdById === me : false;
  //   },
  //   [getCreatedByUserId, loginUserInfo?.data?.user_id],
  // );

  useEffect(() => {
    if (!activeMemoInputClippingId) return;
    requestAnimationFrame(() => memoInputRef.current?.focus());
  }, [activeMemoInputClippingId]);

  useEffect(() => {
    // memo input 전환 시 멘션 상태 초기화
    setMentionQuery('');
    setIsMentionOpen(false);
    setMentionedUserIdsDraft([]);
  }, [activeMemoInputClippingId]);

  const projectMembers = useMemo(() => {
    const list = (projectMembersResponse as any)?.data?.members;
    return Array.isArray(list) ? list : [];
  }, [projectMembersResponse]);

  // 멤버 썸네일 URL 정규화 (상대경로/중복 http(s):// 케이스 방어)
  const BUCKET_BASE_URL = 'https://kr.object.ncloudstorage.com/ailex/';
  const normalizeMediaUrl = useCallback((rawUrl?: string | null) => {
    let url = String(rawUrl ?? '').trim();
    if (!url) return '';

    // http(s):// 가 여러 번 중복된 경우 마지막 유효한 URL만 추출
    const httpRegex = /https?:\/\//g;
    let match: RegExpExecArray | null;
    let lastHttpIndex = -1;
    while ((match = httpRegex.exec(url)) !== null) {
      lastHttpIndex = match.index;
    }
    if (lastHttpIndex > 0) {
      url = url.substring(lastHttpIndex);
    }

    // 상대 경로인 경우 BUCKET_BASE_URL 추가
    if (url && !url.startsWith('http')) {
      const trimmed = url.startsWith('/') ? url.slice(1) : url;
      return `${BUCKET_BASE_URL}${trimmed}`;
    }
    return url;
  }, []);

  // ! "보기 설정" (멤버 보기 필터) - UI
  const [isViewSettingsOpen, setIsViewSettingsOpen] = useState(false);
  const viewSettingsBtnRef = useRef<HTMLButtonElement | null>(null);
  const viewSettingsMenuRef = useRef<HTMLDivElement | null>(null);
  const [viewSettingsPos, setViewSettingsPos] = useState<{ left: number; top: number; width: number } | null>(null);

  const getMemberId = useCallback((m: any) => String(m?.user_id ?? m?.userId ?? ''), []);

  const getMemberName = useCallback(
    (m: any) => {
      const id = String(m?.user_id ?? m?.userId ?? '');
      const meId = String(loginUserInfo?.data?.user_id ?? '');
      if (meId && id && id === meId) return 'my-profile';
      // 보기설정 드롭박스에서는 "닉네임"이 아니라 "사용자 이름(name)"을 표시한다.
      return String(m?.name ?? m?.nickname ?? m?.nickName ?? '');
    },
    [loginUserInfo?.data?.user_id],
  );
  // 썸네일 → 닉네임(=표시명) 순서 UX를 위해, 가능한 썸네일 필드를 최대한 커버한다.
  const getMemberAvatar = useCallback(
    (m: any) => {
      const raw =
        m?.thumbnail_url ??
        m?.thumbnailUrl ??
        m?.thumbnail ??
        m?.profile_image ??
        m?.profileImage ??
        m?.profileImageUrl ??
        m?.avatar_url ??
        m?.avatarUrl ??
        '';
      return normalizeMediaUrl(String(raw ?? ''));
    },
    [normalizeMediaUrl],
  );
  const getMemberColorKey = useCallback(
    (m: any) =>
      String(m?.color ?? m?.profile_color ?? m?.profileColor ?? m?.user_color ?? m?.userColor ?? m?.theme_color ?? m?.themeColor ?? ''),
    [],
  );

  const updateViewSettingsPos = useCallback(() => {
    const el = viewSettingsBtnRef.current;
    if (!el) return;
    const rect = el.getBoundingClientRect();
    const menuMinW = 320;
    const left = Math.max(8, Math.min(rect.left, window.innerWidth - menuMinW - 8));
    const top = Math.max(8, rect.bottom + 8);
    setViewSettingsPos({ left, top, width: rect.width });
  }, []);

  useLayoutEffect(() => {
    if (!isViewSettingsOpen) return;
    updateViewSettingsPos();
    window.addEventListener('resize', updateViewSettingsPos);
    window.addEventListener('scroll', updateViewSettingsPos, true);
    return () => {
      window.removeEventListener('resize', updateViewSettingsPos);
      window.removeEventListener('scroll', updateViewSettingsPos, true);
    };
  }, [isViewSettingsOpen, updateViewSettingsPos]);

  useEffect(() => {
    if (!isViewSettingsOpen) return;
    const onDown = (e: MouseEvent) => {
      const btn = viewSettingsBtnRef.current;
      const menu = viewSettingsMenuRef.current;
      if (btn && e.target instanceof Node && btn.contains(e.target)) return;
      if (menu && e.target instanceof Node && menu.contains(e.target)) return;
      setIsViewSettingsOpen(false);
    };
    document.addEventListener('mousedown', onDown);
    return () => document.removeEventListener('mousedown', onDown);
  }, [isViewSettingsOpen]);

  const allMemberIds = useMemo(() => projectMembers.map((m: any) => getMemberId(m)).filter(Boolean), [getMemberId, projectMembers]);

  const isAllViewSelected = useMemo(() => {
    return viewSelectionMode === 'all';
  }, [viewSelectionMode]);

  const isMemberChecked = useCallback(
    (memberId: string) => {
      if (!memberId) return false;
      if (viewSelectionMode === 'all') return true;
      if (viewSelectionMode === 'none') return false;
      return viewMemberSelection.has(memberId);
    },
    [viewMemberSelection, viewSelectionMode],
  );

  const toggleMember = useCallback(
    (memberId: string) => {
      if (!memberId) return;
      setViewMemberSelection((prev) => {
        const next = new Set(prev);

        // mode=all 이면 "전체 선택" 상태이므로, 커스텀으로 전환하면서 전체를 먼저 채운 뒤 토글한다.
        if (viewSelectionMode === 'all') {
          next.clear();
          for (const id of allMemberIds) next.add(id);
        }

        // mode=none 이면 빈 상태에서 시작
        if (viewSelectionMode === 'none') {
          next.clear();
        }

        if (next.has(memberId)) next.delete(memberId);
        else next.add(memberId);

        // 결과에 따라 mode를 조정한다.
        if (next.size === 0) {
          setViewSelectionMode('none');
          return next;
        }
        if (allMemberIds.length > 0 && allMemberIds.every((id) => next.has(id))) {
          setViewSelectionMode('all');
          return new Set(); // custom selection은 비워서 상태 단순화
        }
        setViewSelectionMode('custom');
        return next;
      });
    },
    [allMemberIds, viewSelectionMode],
  );

  const filteredMentionMembers = useMemo(() => {
    const q = mentionQuery.trim();
    const meId = String(loginUserInfo?.data?.user_id ?? '');
    return (
      (projectMembers as any[])
        .filter((m) => {
          // 멘션 드롭다운에서 "나"는 제외
          const isMe = Boolean(m?.isMe);
          const id = String(m?.user_id ?? '');
          if (isMe) return false;
          if (meId && id && id === meId) return false;

          const name = String(m?.name ?? '');
          const nick = String(m?.nickname ?? '');
          // '@'만 입력한 경우: 전체 멤버(최대 4명) 노출
          if (!q) return true;
          return name.includes(q) || nick.includes(q);
        })
        // "처음 4명만 보이고(드롭다운 maxHeight=128), 그 이상은 스크롤"이 요구사항.
        // 여기서 slice로 잘라버리면 4명 이상이 아예 보이지 않으므로 제한하지 않는다.
        .slice(0, 200)
    );
  }, [mentionQuery, projectMembers, loginUserInfo?.data?.user_id]);

  const computeMentionDropdownPos = useCallback(() => {
    const input = memoInputRef.current;
    if (!input) return;
    const rect = input.getBoundingClientRect();

    // 최대 높이 128, row height 32
    const rowCount = Math.max(filteredMentionMembers.length, 1); // empty -> "사용자가 없습니다" 1행
    const desiredHeight = Math.min(128, rowCount * 32);
    const spaceBelow = window.innerHeight - rect.bottom; // px
    const spaceAbove = rect.top; // px

    // 드롭다운이 윈도우 밖으로 잘리지 않도록, 실제 사용 가능한 공간으로 maxHeight를 조절한다.
    const availableBelow = Math.max(0, spaceBelow - 16);
    const availableAbove = Math.max(0, spaceAbove - 16);
    const shouldOpenUp = availableBelow < desiredHeight && availableAbove > availableBelow;
    const maxHeight = Math.max(32, Math.min(128, shouldOpenUp ? availableAbove : availableBelow));
    const actualHeight = Math.min(desiredHeight, maxHeight);

    // viewport 밖으로 나가지 않도록 좌표 clamp
    const left = Math.max(8, Math.min(rect.left, window.innerWidth - rect.width - 8));
    const topRaw = shouldOpenUp ? rect.top - 8 - actualHeight : rect.bottom + 8;
    const top = Math.max(8, Math.min(topRaw, window.innerHeight - actualHeight - 8));

    setMentionDropdownPos({ left, top, width: rect.width, maxHeight });
  }, [filteredMentionMembers.length]);

  useEffect(() => {
    if (!isMentionOpen) {
      setMentionDropdownPos(null);
      return;
    }
    const update = () => computeMentionDropdownPos();
    update();
    window.addEventListener('resize', update);
    // 내부 스크롤(우측 패널 등)도 반영되도록 capture
    window.addEventListener('scroll', update, true);
    return () => {
      window.removeEventListener('resize', update);
      window.removeEventListener('scroll', update, true);
    };
  }, [isMentionOpen, computeMentionDropdownPos]);

  useEffect(() => {
    if (!isMentionOpen) return;
    setMentionActiveIndex(0);
  }, [isMentionOpen, mentionQuery]);

  const memberNameSet = useMemo(() => {
    const s = new Set<string>();
    for (const m of projectMembers as any[]) {
      const name = String(m?.name ?? '');
      const nick = String(m?.nickname ?? '');
      if (name) s.add(name);
      if (nick) s.add(nick);
    }
    return s;
  }, [projectMembers]);

  const renderMemoWithMentions = useCallback(
    (content: string) => {
      const parts = content.split(/(@[^\s@]+)/g);
      return parts.map((p, idx) => {
        if (p.startsWith('@')) {
          const keyRaw = p.slice(1);
          const keyNormalized = keyRaw.replace(/[.,!?;:)\]]+$/, '');
          const isKnownMember = memberNameSet.size > 0 ? memberNameSet.has(keyRaw) || memberNameSet.has(keyNormalized) : true;
          if (isKnownMember && keyRaw.trim().length > 0) {
            return (
              <span key={`m-${idx}`} className='text-[#0991EE]'>
                {p}
              </span>
            );
          }
        }
        return <span key={`m-${idx}`}>{p}</span>;
      });
    },
    [memberNameSet],
  );

  const submitMemo = useCallback(
    async (clippingId: string) => {
      const content = memoInputDraft.trim();
      if (!content) return;
      if (isAddMemoPending) return;

      await onAddMemo({
        clipping_id: clippingId,
        input: {
          content,
          mentioned_user_ids: mentionedUserIdsDraft.length ? mentionedUserIdsDraft : null,
        },
      });
      onMessageToast({ message: '메모가 등록되었습니다.' });
      setActiveMemoInputClippingId(null);
      setMemoInputDraft('');
      setMentionedUserIdsDraft([]);
      setIsMentionOpen(false);
      setMentionQuery('');
      await refreshClippingNotes(clippingId);
    },
    [isAddMemoPending, memoInputDraft, mentionedUserIdsDraft, onAddMemo, refreshClippingNotes],
  );

  useEffect(() => {
    const onDown = (e: MouseEvent) => {
      if (!openMemoMenuId) return;
      const el = memoMenuRef.current;
      if (!el) {
        setOpenMemoMenuId(null);
        return;
      }
      if (e.target instanceof Node && el.contains(e.target)) return;
      setOpenMemoMenuId(null);
    };
    document.addEventListener('mousedown', onDown);
    return () => document.removeEventListener('mousedown', onDown);
  }, [openMemoMenuId]);

  const exitPanelEditMode = useCallback(() => {
    setPanelEditClippingId(null);
    setOpenClippingMenuId(null);
    setOpenClippingTagMenuId(null);
    setOpenClippingColorMenuId(null);
    setOpenMemoMenuId(null);
    setActiveMemoInputClippingId(null);
    setMemoInputDraft('');
    setEditingMemoId(null);
    setEditingMemoDraft('');
    // 민사: edit 종료 시 PDF 보더/플로팅도 종료
    setIsPanelSelectionActive(false);
    setCurrentSelectionId(null);
    setActionBarPos(null);
    setPaletteOpenForId(null);
  }, []);

  // 우측 패널 edit 모드에서 카드 바깥 클릭 시 edit 모드 종료
  useEffect(() => {
    if (!panelEditClippingId) return;
    const onDown = (e: MouseEvent) => {
      // 편집 중인 카드 안의 클릭은 무시
      const el = panelEditCardRef.current;
      if (el && e.target instanceof Node && el.contains(e.target)) return;

      // PDF 플로팅 액션바(문서 위) 클릭은 edit 종료로 처리하지 않음
      const ab = actionBarRef.current;
      if (ab && e.target instanceof Node && ab.contains(e.target)) return;

      // 멘션 드롭다운(Portal) 클릭은 edit 종료로 처리하지 않음
      const md = mentionDropdownContainerRef.current;
      if (md && e.target instanceof Node && md.contains(e.target)) return;

      // 카드 바깥(패널/문서 배경 포함) 클릭이면 무조건 edit 종료
      exitPanelEditMode();
    };
    document.addEventListener('mousedown', onDown);
    return () => document.removeEventListener('mousedown', onDown);
  }, [exitPanelEditMode, panelEditClippingId]);

  const getClippingTags = useCallback(
    (c: (typeof clippings)[number]) => {
      return clippingTagOverrides[c.clipping_id] ?? c.tags ?? [];
    },
    [clippingTagOverrides],
  );

  const getClippingColorKey = useCallback(
    (c: (typeof clippings)[number]) => {
      return clippingColorOverrides[c.clipping_id] ?? resolveClippingColorKey(c.color);
    },
    [clippingColorOverrides, resolveClippingColorKey],
  );

  // 민사: 서버에서 내려온 clippings(현재 문서) 기준으로 PDF 오버레이(savedSelections)를 항상 유지한다.
  // - 클릭 전에도 하이라이트(배경)는 항상 보여야 함
  // - 보더는 카드 선택 시에만 활성화
  useEffect(() => {
    if (!isCivilMode) return;
    if (!selectedDocument?.caseDocumentId) return;

    setSavedSelections((prev) => {
      // 레거시(px) coordinate의 기준 페이지 크기 추정(페이지별 max right/bottom)
      // - 이후 resolveCoordinateToPx에서 현재 페이지 크기로 스케일링하여 위치 틀어짐을 완화
      const legacyBase: Record<number, { w: number; h: number }> = {};
      for (const c of clippings) {
        const parts = parseCoordinateParts(c.coordinate ?? '');
        if (!parts) continue;
        if (isNormalizedCoordinate(parts)) continue;
        const page = c.page_number ?? 1;
        const [, , right, bottom] = parts;
        const cur = legacyBase[page] ?? { w: 0, h: 0 };
        legacyBase[page] = { w: Math.max(cur.w, right), h: Math.max(cur.h, bottom) };
      }
      legacyPxBaseByPageRef.current = legacyBase;

      const prevByClipId = new Map<string, TSelection>();
      for (const s of prev) {
        if (s.clippingId) prevByClipId.set(s.clippingId, s);
      }

      const next: TSelection[] = [];
      for (const c of clippings) {
        const px = resolveCoordinateToPx(c);
        if (!px) continue;
        const { left, top, right, bottom } = px;

        const tags = getClippingTags(c);
        const docTag = (KNOWN_DOC_TAGS as readonly string[]).find((t) => tags.includes(t)) || undefined;
        const hasRelatedMissing = tags.includes(RELATED_MISSING_TAG);

        const colorKey = getClippingColorKey(c);
        const { fillHex, borderHex } = resolveClippingColor(colorKey);

        const existing = prevByClipId.get(c.clipping_id);
        const id = existing?.id ?? ++selectionIdCounter.current;

        next.push({
          id,
          page: c.page_number ?? 1,
          left: Math.round(left),
          top: Math.round(top),
          right: Math.round(right),
          bottom: Math.round(bottom),
          text: '',
          color: fillHex,
          border: borderHex,
          clippingId: c.clipping_id,
          flags: {
            docUsable: !!docTag,
            docUsableType: docTag as any,
            relatedMissing: hasRelatedMissing,
          },
        });
      }

      return next;
    });
  }, [
    KNOWN_DOC_TAGS,
    RELATED_MISSING_TAG,
    clippings,
    getClippingColorKey,
    getClippingTags,
    isNormalizedCoordinate,
    isCivilMode,
    parseCoordinateParts,
    resolveClippingColor,
    resolveCoordinateToPx,
    numPages,
    pdfLayoutVersion,
    selectedDocument?.caseDocumentId,
  ]);

  // 클리핑 색상이 바뀌면, 현재 PDF에 표시중인 하이라이트도 즉시 색상 동기화
  useEffect(() => {
    if (!activeClipHighlight) return;
    const c = clippings.find((x) => x.clipping_id === activeClipHighlight.clippingId);
    if (!c) return;
    const { fillHex, borderHex } = resolveClippingColor(getClippingColorKey(c));
    setActiveClipHighlight((prev) => {
      if (!prev) return prev;
      if (prev.fillHex === fillHex && prev.borderHex === borderHex) return prev;
      return { ...prev, fillHex, borderHex };
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [clippings, clippingColorOverrides]);

  const buildUpdateInputFromClipping = useCallback(
    (
      c: (typeof clippings)[number],
      patch: Partial<{ comment: string; initial_note: string; tags: string[]; color: string; clippingType: string }>,
    ) => {
      const tags = patch.tags ?? getClippingTags(c);
      const color = patch.color ?? getClippingColorKey(c);
      // 우측 패널 "메모"는 initial_note로 저장/표시한다.
      const comment = patch.comment ?? c.comment ?? '';
      // notes가 객체일 때 content 추출
      const rawNotes = c.notes as any;
      const firstNote = Array.isArray(rawNotes) ? rawNotes[0] : rawNotes;
      const notesValue =
        typeof rawNotes === 'string' ? rawNotes : typeof firstNote === 'object' && firstNote?.content ? firstNote.content : '';
      const initial_note = patch.initial_note ?? notesValue;

      return {
        comment,
        initial_note,
        coordinate: c.coordinate ?? '',
        page_number: c.page_number ?? 1,
        attachment_url: c.attachment_url ?? '',
        attachment_name: c.attachment_name ?? '',
        clipping_type: patch.clippingType ?? c.clipping_type ?? '',
        importance_level: c.importance_level ?? '',
        clipping_folder_id: c.clipping_folder_id ?? '',
        color,
        tags,
      };
    },
    [getClippingTags, getClippingColorKey],
  );

  const applyClippingUpdate = useCallback(
    async (
      c: (typeof clippings)[number],
      patch: Partial<{ comment: string; initial_note: string; tags: string[]; color: string; clippingType: string }>,
    ): Promise<boolean> => {
      const input = buildUpdateInputFromClipping(c, patch);
      const res = await onUpdateClipping({ clipping_id: c.clipping_id, input });
      const ok = !!res?.success;
      if (ok) refetchClippings();
      return ok;
    },
    [buildUpdateInputFromClipping, onUpdateClipping, refetchClippings],
  );

  const handleDeleteClipping = async (c: (typeof clippings)[number]) => {
    const res = await onDeleteClipping({ clipping_id: c.clipping_id });
    if (res?.success) {
      onMessageToast({ message: '삭제되었습니다.' });
      refetchClippings();

      // PDF 하이라이트도 실시간 제거
      // 1. savedSelections에서 해당 clippingId를 가진 selection 제거
      setSavedSelections((prev) => prev.filter((sel) => sel.clippingId !== c.clipping_id));

      // 2. activeClipHighlight가 이 클리핑이면 제거
      if (activeClipHighlight && activeClipHighlight.clippingId === c.clipping_id) {
        setActiveClipHighlight(null);
      }
    }
    // optimistic UI: 메뉴/편집 상태 초기화
    setOpenClippingMenuId(null);
    setOpenClippingTagMenuId(null);
  };

  const canDeleteClipping = useCallback(
    (c: TClippingItem) => {
      const me = loginUserInfo?.data?.user_id;
      if (!me) return false;
      const creatorId = (c as any).created_by_id ?? (c as any).created_by?.user_id;
      if (!creatorId) return false;
      return String(creatorId) === String(me);
    },
    [loginUserInfo?.data?.user_id],
  );

  const requestDeleteClipping = useCallback(
    (c: TClippingItem) => {
      if (!canDeleteClipping(c)) {
        onMessageToast({ message: '삭제 권한이 없습니다.' });
        return;
      }
      setDeleteTargetClipping(c);
      setIsClippingDeleteOpen(true);
    },
    [canDeleteClipping],
  );

  const createClippingFromSelection = useCallback(
    async (
      sel: TSelection,
      opts?: {
        tags?: string[];
        clippingType?: string;
        notes?: string;
        comment?: string;
        color?: string;
      },
    ): Promise<string | null> => {
      // 하이라이트 생성(클리핑 생성)을 호출할 때 우측 패널이 닫혀 있으면 다시 열어준다.
      // (작은 화면에서 특히 생성 직후 패널을 확인해야 하므로 UX 개선)
      if (!isSelectionPanelOpen) {
        setIsSelectionPanelOpen(true);
        setIsSelectionPanelButtonActive(true);
      }
      // 하이라이트가 생성되면(전체메모 탭 상태여도) 항상 하이라이트 탭으로 전환한다.
      setRightPanelTab('highlight');

      const officeId = loginUserInfo?.data?.office_id;
      const doc = selectedDocument;
      if (!officeId || !doc?.caseDocumentId) return null;
      if (sel.clippingId) return sel.clippingId; // already created
      setCreatingSelectionId(sel.id);

      // 좌표는 "페이지 기준 정규화(0~1)"로 저장해서 리사이즈/줌에 강하게 만든다.
      const coordinate = normalizeCoordinateFromSelection(sel);
      const colorKey = opts?.color ?? HIGHLIGHT_COLORS.find((h) => h.hex === sel.color)?.key ?? 'yellow';

      try {
        // 선택 영역 이미지를 함께 전송(가능한 경우)
        let file: File | null = null;
        let previewUrl: string | undefined = undefined;
        try {
          file = await captureClippingRegionFile(sel);
          if (file && typeof URL !== 'undefined') {
            previewUrl = URL.createObjectURL(file);
            previewObjectUrlsRef.current.add(previewUrl);
            // 인식중 카드에 프리뷰 표시
            setSavedSelections((prev) => prev.map((s) => (s.id === sel.id ? { ...s, previewImageUrl: previewUrl } : s)));
          }
        } catch {
          file = null;
        }

        const res = await onCreateClipping({
          office_id: officeId,
          input: {
            case_document_id: doc.caseDocumentId,
            clipping_folder_id: '',
            comment: opts?.comment ?? '',
            initial_note: opts?.notes ?? '',
            coordinate,
            page_number: sel.page,
            attachment_url: doc.attachmentUrl || '',
            attachment_name: doc.title || '',
            clipping_type: opts?.clippingType ?? 'OTHER',
            importance_level: 'MEDIUM',
            is_ai_generated: false,
            color: colorKey,
            tags: opts?.tags ?? [],
            file,
          },
        });

        if (res?.success && res?.data?.clipping_id) {
          const newId = String(res.data.clipping_id);
          const serverImageUrl = String((res as any)?.data?.attachment_url ?? '');

          // 등록 직후 즉시: 서버가 내려준 이미지 URL(attachment_url)을 "인식중" 카드에 바로 노출
          if (serverImageUrl) {
            setSavedSelections((prev) => prev.map((s) => (s.id === sel.id ? { ...s, previewImageUrl: serverImageUrl } : s)));
          }

          onMessageToast({ message: '하이라이트가 생성되었습니다.' });

          // 서버 목록에 반영되면(클리핑 리스트에 포함되면) 해당 카드가 "정상 카드"로 전환되도록 refetch 후 임시카드를 제거한다.
          try {
            await refetchClippings();
          } catch {
            // 무시
          }
          setSavedSelections((prev) => prev.filter((s) => s.id !== sel.id));
          return newId;
        }
        return null;
      } finally {
        setCreatingSelectionId((prev) => (prev === sel.id ? null : prev));
      }
    },
    [
      HIGHLIGHT_COLORS,
      captureClippingRegionFile,
      isSelectionPanelOpen,
      loginUserInfo?.data?.office_id,
      normalizeCoordinateFromSelection,
      onCreateClipping,
      refetchClippings,
      selectedDocument,
      setIsSelectionPanelButtonActive,
      setIsSelectionPanelOpen,
    ],
  );

  // 유저 색상가져오기
  const getUserColor = (color: string) => {
    const v = String(color || '').trim();
    if (v.startsWith('#')) return v;
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
    return palette[v] || '#406CFF';
  };

  const _goToPrevPage = () => {
    setPageNumber((prev) => {
      const newPage = Math.max(1, prev - 1);
      setSelection(null);
      return newPage;
    });
  };

  const _goToNextPage = () => {
    setPageNumber((prev) => {
      const newPage = Math.min(numPages || 1, prev + 1);
      setSelection(null);
      return newPage;
    });
  };

  // 텍스트 영역 스냅 바운딩 박스 계산
  const calculateSnappedBounds = (startX: number, startY: number, endX: number, endY: number) => {
    const containerEl = activePageContainerRef.current;
    if (!containerEl) return null;
    const textLayer = containerEl.querySelector('.react-pdf__Page__textContent');
    if (!textLayer) return null;

    const containerRect = containerEl.getBoundingClientRect();
    const x = Math.min(startX, endX);
    const y = Math.min(startY, endY);
    const width = Math.abs(endX - startX);
    const height = Math.abs(endY - startY);

    if (width < 5 || height < 5) return null;

    const selectionRect = {
      left: x,
      top: y,
      right: x + width,
      bottom: y + height,
    };

    const textSpans = textLayer.querySelectorAll('span');
    const parentBounds = {
      left: Infinity,
      top: Infinity,
      right: -Infinity,
      bottom: -Infinity,
    };
    let hasOverlap = false;

    textSpans.forEach((span) => {
      const spanRect = span.getBoundingClientRect();
      const relativeRect = {
        left: spanRect.left - containerRect.left,
        top: spanRect.top - containerRect.top,
        right: spanRect.right - containerRect.left,
        bottom: spanRect.bottom - containerRect.top,
      };

      const isOverlapping = !(
        relativeRect.right < selectionRect.left ||
        relativeRect.left > selectionRect.right ||
        relativeRect.bottom < selectionRect.top ||
        relativeRect.top > selectionRect.bottom
      );

      if (isOverlapping && span.textContent?.trim()) {
        hasOverlap = true;
        parentBounds.left = Math.min(parentBounds.left, relativeRect.left);
        parentBounds.top = Math.min(parentBounds.top, relativeRect.top);
        parentBounds.right = Math.max(parentBounds.right, relativeRect.right);
        parentBounds.bottom = Math.max(parentBounds.bottom, relativeRect.bottom);
      }
    });

    if (hasOverlap) {
      return {
        x: parentBounds.left - SELECTION_PADDING,
        y: parentBounds.top - SELECTION_PADDING,
        width: parentBounds.right - parentBounds.left + SELECTION_PADDING * 2,
        height: parentBounds.bottom - parentBounds.top + SELECTION_PADDING * 2,
      };
    }
    return null;
  };

  // 드래그 중 상태 업데이트를 위한 ref
  const dragEndRef = useRef({ x: 0, y: 0 });
  const animationFrameRef = useRef<number | null>(null);

  // 드래그 시작
  const handleMouseDown = (e: React.MouseEvent, pageNum: number) => {
    const pageEl = pageContainerRefs.current[pageNum];
    if (!pageEl) return;
    e.preventDefault();
    e.stopPropagation();

    // 새 드래그 시작 시: 기존 플로팅 툴바/팔레트는 닫는다.
    setActionBarPos(null);
    setPaletteOpenForId(null);
    setIsPanelSelectionActive(false);

    activePageContainerRef.current = pageEl;
    activePageNumberRef.current = pageNum;
    setPageNumber(pageNum);

    const rect = pageEl.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;

    setIsDragging(true);
    setDragStart({ x, y });
    setDragEnd({ x, y });
    // 클릭(이동 없는 mouseup)에서도 dragEndRef가 (0,0) 기본값으로 남아 "가짜 큰 드래그"가 되지 않도록 초기화
    dragEndRef.current = { x, y };
    setSelection(null);
    setLiveSnappedBounds(null);
  };

  // 전역 마우스 이벤트 핸들러
  useEffect(() => {
    if (!isDragging) return;

    const handleGlobalMouseMove = (e: MouseEvent) => {
      const containerEl = activePageContainerRef.current;
      if (!containerEl) return;

      e.preventDefault();
      e.stopPropagation();

      const rect = containerEl.getBoundingClientRect();
      const x = e.clientX - rect.left;
      const y = e.clientY - rect.top;

      // ref에 저장하고 requestAnimationFrame으로 업데이트
      dragEndRef.current = { x, y };

      if (animationFrameRef.current === null) {
        animationFrameRef.current = requestAnimationFrame(() => {
          setDragEnd(dragEndRef.current);

          // 실시간 스냅 계산
          const snapped = calculateSnappedBounds(dragStart.x, dragStart.y, dragEndRef.current.x, dragEndRef.current.y);
          setLiveSnappedBounds(snapped);

          animationFrameRef.current = null;
        });
      }
    };

    const handleGlobalMouseUp = (e: MouseEvent) => {
      const containerEl = activePageContainerRef.current;
      if (!containerEl) return;

      e.preventDefault();
      e.stopPropagation();

      setIsDragging(false);

      // ref에서 최종 위치 가져오기
      const finalDragEnd = dragEndRef.current;
      const x = Math.min(dragStart.x, finalDragEnd.x);
      const y = Math.min(dragStart.y, finalDragEnd.y);
      const width = Math.abs(finalDragEnd.x - dragStart.x);
      const height = Math.abs(finalDragEnd.y - dragStart.y);

      if (width < 5 || height < 5) {
        setSelection(null);
        setLiveSnappedBounds(null);
        return;
      }

      const textLayer = containerEl.querySelector('.react-pdf__Page__textContent');
      if (textLayer) {
        const containerRect = containerEl.getBoundingClientRect();
        const selectionRect = {
          left: x,
          top: y,
          right: x + width,
          bottom: y + height,
        };

        const textSpans = textLayer.querySelectorAll('span');
        const selectedTexts: Array<{ text: string; rect: { left: number; top: number; right: number; bottom: number } }> = [];

        const parentBounds = {
          left: Infinity,
          top: Infinity,
          right: -Infinity,
          bottom: -Infinity,
        };

        textSpans.forEach((span) => {
          const spanRect = span.getBoundingClientRect();
          const relativeRect = {
            left: spanRect.left - containerRect.left,
            top: spanRect.top - containerRect.top,
            right: spanRect.right - containerRect.left,
            bottom: spanRect.bottom - containerRect.top,
          };

          const isOverlapping = !(
            relativeRect.right < selectionRect.left ||
            relativeRect.left > selectionRect.right ||
            relativeRect.bottom < selectionRect.top ||
            relativeRect.top > selectionRect.bottom
          );

          if (isOverlapping && span.textContent?.trim()) {
            selectedTexts.push({
              text: span.textContent,
              rect: relativeRect,
            });

            parentBounds.left = Math.min(parentBounds.left, relativeRect.left);
            parentBounds.top = Math.min(parentBounds.top, relativeRect.top);
            parentBounds.right = Math.max(parentBounds.right, relativeRect.right);
            parentBounds.bottom = Math.max(parentBounds.bottom, relativeRect.bottom);
          }
        });

        if (selectedTexts.length > 0) {
          const expandedSelection = {
            x: parentBounds.left - SELECTION_PADDING,
            y: parentBounds.top - SELECTION_PADDING,
            width: parentBounds.right - parentBounds.left + SELECTION_PADDING * 2,
            height: parentBounds.bottom - parentBounds.top + SELECTION_PADDING * 2,
          };
          setSelection(expandedSelection);

          const newSelection: TSelection = {
            id: ++selectionIdCounter.current,
            page: activePageNumberRef.current,
            createdAt: Date.now(),
            left: Math.round(parentBounds.left - SELECTION_PADDING),
            top: Math.round(parentBounds.top - SELECTION_PADDING),
            right: Math.round(parentBounds.right + SELECTION_PADDING),
            bottom: Math.round(parentBounds.bottom + SELECTION_PADDING),
            text: selectedTexts.map((item) => item.text).join(' '),
            color: DEFAULT_HIGHLIGHT_COLOR,
            border: DEFAULT_HIGHLIGHT_BORDER,
            flags: { docUsable: false, relatedMissing: false },
          };

          setSavedSelections((prev) => [...prev, newSelection]);
          // 드래그 종료 직후: 플로팅 메뉴는 바로 노출
          setCurrentSelectionId(newSelection.id);
          setIsPanelSelectionActive(isCivilMode ? true : false);
          setActionBarPos(null);
          requestAnimationFrame(() => {
            const pageEl = pageContainerRefs.current[newSelection.page];
            if (!pageEl) return;
            const rect = pageEl.getBoundingClientRect();
            setActionBarPos({ left: rect.left + newSelection.left, top: rect.top + newSelection.bottom + 8 });
          });

          // 민사: 드래그 끝나면 바로 저장
          if (isCivilMode) {
            void createClippingFromSelection(newSelection, {
              notes: '',
              tags: [],
              clippingType: 'OTHER',
            });
          }
        } else {
          setSelection({ x, y, width, height });
          const newSelection: TSelection = {
            id: ++selectionIdCounter.current,
            page: activePageNumberRef.current,
            createdAt: Date.now(),
            left: Math.round(x),
            top: Math.round(y),
            right: Math.round(x + width),
            bottom: Math.round(y + height),
            text: '',
            color: DEFAULT_HIGHLIGHT_COLOR,
            border: DEFAULT_HIGHLIGHT_BORDER,
            flags: { docUsable: false, relatedMissing: false },
          };
          setSavedSelections((prev) => [...prev, newSelection]);
          // 드래그 종료 직후: 플로팅 메뉴는 바로 노출
          setCurrentSelectionId(newSelection.id);
          setIsPanelSelectionActive(isCivilMode ? true : false);
          setActionBarPos(null);
          requestAnimationFrame(() => {
            const pageEl = pageContainerRefs.current[newSelection.page];
            if (!pageEl) return;
            const rect = pageEl.getBoundingClientRect();
            setActionBarPos({ left: rect.left + newSelection.left, top: rect.top + newSelection.bottom + 8 });
          });
          if (isCivilMode) {
            void createClippingFromSelection(newSelection, {
              notes: '',
              tags: [],
              clippingType: 'OTHER',
            });
          }
        }
      } else {
        setSelection({ x, y, width, height });
        const newSelection: TSelection = {
          id: ++selectionIdCounter.current,
          page: activePageNumberRef.current,
          createdAt: Date.now(),
          left: Math.round(x),
          top: Math.round(y),
          right: Math.round(x + width),
          bottom: Math.round(y + height),
          text: '',
          color: DEFAULT_HIGHLIGHT_COLOR,
          border: DEFAULT_HIGHLIGHT_BORDER,
          flags: { docUsable: false, relatedMissing: false },
        };
        setSavedSelections((prev) => [...prev, newSelection]);
        // 드래그 종료 직후: 플로팅 메뉴는 바로 노출
        setCurrentSelectionId(newSelection.id);
        setIsPanelSelectionActive(isCivilMode ? true : false);
        setActionBarPos(null);
        requestAnimationFrame(() => {
          const pageEl = pageContainerRefs.current[newSelection.page];
          if (!pageEl) return;
          const rect = pageEl.getBoundingClientRect();
          setActionBarPos({ left: rect.left + newSelection.left, top: rect.top + newSelection.bottom + 8 });
        });
        if (isCivilMode) {
          void createClippingFromSelection(newSelection, {
            notes: '',
            tags: [],
            clippingType: 'OTHER',
          });
        }
      }
      setLiveSnappedBounds(null);
    };

    document.addEventListener('mousemove', handleGlobalMouseMove, { passive: false });
    document.addEventListener('mouseup', handleGlobalMouseUp, { passive: false });

    return () => {
      document.removeEventListener('mousemove', handleGlobalMouseMove);
      document.removeEventListener('mouseup', handleGlobalMouseUp);
      if (animationFrameRef.current !== null) {
        cancelAnimationFrame(animationFrameRef.current);
        animationFrameRef.current = null;
      }
    };
  }, [isCivilMode, createClippingFromSelection, isDragging, dragStart, pageNumber, DEFAULT_HIGHLIGHT_BORDER, DEFAULT_HIGHLIGHT_COLOR]);

  // 드래그 중일 때 텍스트 선택 방지
  useEffect(() => {
    if (isDragging) {
      document.body.style.userSelect = 'none';
      document.body.style.cursor = 'crosshair';
    } else {
      document.body.style.userSelect = '';
      document.body.style.cursor = '';
    }

    return () => {
      document.body.style.userSelect = '';
      document.body.style.cursor = '';
    };
  }, [isDragging]);

  // 스크롤형 PDF: 현재 페이지 계산 (스크롤 컨테이너 기준)
  // - 작은 화면에서 1페이지를 보고 있어도 2로 표시되는 문제 방지: "가장 많이 보이는 페이지"가 아니라
  //   스크롤 위치 기준으로 "현재 보고 있는(상단 기준) 페이지"를 계산한다.
  useEffect(() => {
    const rootEl = pdfScrollContainerRef.current;
    if (!rootEl) return;
    if (!selectedDocument?.pdfUrl || !numPages) return;

    const computeVisiblePage = () => {
      const anchor = rootEl.scrollTop + 8; // 컨테이너 상단에서 약간 내려온 지점 기준
      let current = 1;
      for (let p = 1; p <= numPages; p += 1) {
        const pageEl = pageContainerRefs.current[p];
        if (!pageEl) continue;
        if (pageEl.offsetTop <= anchor) current = p;
        else break;
      }
      setVisiblePageNumber((prev) => (prev === current ? prev : current));
    };

    const raf = requestAnimationFrame(computeVisiblePage);
    rootEl.addEventListener('scroll', computeVisiblePage, { passive: true });
    window.addEventListener('resize', computeVisiblePage);

    return () => {
      cancelAnimationFrame(raf);
      rootEl.removeEventListener('scroll', computeVisiblePage);
      window.removeEventListener('resize', computeVisiblePage);
    };
  }, [selectedDocument?.pdfUrl, numPages]);

  const scrollToPage = (targetPage: number) => {
    if (!numPages) return;
    const page = Math.max(1, Math.min(numPages, targetPage));
    const el = pageContainerRefs.current[page];
    if (!el) return;
    el.scrollIntoView({ behavior: 'smooth', block: 'start' });
  };

  // 현재 문서의 "최근 열람 페이지"를 지속 저장
  useEffect(() => {
    if (!isCivilMode || !civilCaseId) return;
    const docId = String(selectedDocument?.caseDocumentId ?? '');
    if (!docId) return;
    try {
      localStorage.setItem(getDocPageKey(civilCaseId, docId), String(visiblePageNumber));
    } catch {
      // 무시
    }
  }, [civilCaseId, getDocPageKey, isCivilMode, selectedDocument?.caseDocumentId, visiblePageNumber]);

  // 탭 클릭/문서 재오픈 시: 마지막으로 보던 페이지로 복원
  useEffect(() => {
    if (!pendingRestorePage) return;
    if (!selectedDocument?.caseDocumentId) return;
    if (pendingRestorePage.caseDocumentId !== String(selectedDocument.caseDocumentId)) return;
    if (!selectedDocument.pdfUrl || !numPages) return;
    const page = Math.max(1, Math.min(numPages, pendingRestorePage.page));

    // 문서 로드 직후 DOM/레이아웃이 안정화된 뒤에 스크롤
    requestAnimationFrame(() => scrollToPage(page));
    window.setTimeout(() => scrollToPage(page), 60);

    setPendingRestorePage(null);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [numPages, pendingRestorePage, selectedDocument?.caseDocumentId, selectedDocument?.pdfUrl]);

  // 문서/페이지 준비되면 pending highlight를 실제로 적용 (스크롤 + 오버레이)
  useEffect(() => {
    if (!pendingClipHighlight) return;
    if (!selectedDocument?.pdfUrl || !numPages) return;
    const page = Math.max(1, Math.min(numPages, pendingClipHighlight.page));
    scrollToPage(page);
    setActiveClipHighlight({ ...pendingClipHighlight, page });
    setPendingClipHighlight(null);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [pendingClipHighlight, selectedDocument?.pdfUrl, numPages]);

  const ensureSelectionForClipping = useCallback(
    (c: (typeof clippings)[number]): number | null => {
      const existing = savedSelections.find((s) => s.clippingId === c.clipping_id);
      if (existing) return existing.id;

      const px = resolveCoordinateToPx(c);
      if (!px) return null;
      const { left, top, right, bottom } = px;
      const colorKey = resolveClippingColorKey(c.color);
      const { fillHex, borderHex } = resolveClippingColor(colorKey);

      const tags = c.tags ?? [];
      const docTag = (KNOWN_DOC_TAGS as readonly string[]).find((t) => tags.includes(t)) as '강화' | '반박' | '근거' | undefined;

      const newSelection: TSelection = {
        id: ++selectionIdCounter.current,
        page: c.page_number ?? 1,
        left: Math.round(left),
        top: Math.round(top),
        right: Math.round(right),
        bottom: Math.round(bottom),
        text: '',
        color: fillHex,
        border: borderHex,
        clippingId: c.clipping_id,
        flags: {
          docUsable: !!docTag,
          docUsableType: docTag,
          relatedMissing: tags.includes(RELATED_MISSING_TAG),
        },
      };

      setSavedSelections((prev) => [...prev, newSelection]);
      return newSelection.id;
    },
    [KNOWN_DOC_TAGS, RELATED_MISSING_TAG, resolveClippingColor, resolveClippingColorKey, resolveCoordinateToPx, savedSelections],
  );

  const currentSelection = useMemo(() => {
    if (!currentSelectionId) return null;
    return savedSelections.find((s) => s.id === currentSelectionId) || null;
  }, [currentSelectionId, savedSelections]);

  const updateActionBarPos = useCallback(() => {
    if (!currentSelection || isDragging || (isCivilMode && !isPanelSelectionActive)) {
      setActionBarPos(null);
      return;
    }
    const pageEl = pageContainerRefs.current[currentSelection.page];
    if (!pageEl) return;
    const rect = pageEl.getBoundingClientRect();
    setActionBarPos({
      left: rect.left + currentSelection.left,
      top: rect.top + currentSelection.bottom + 8,
    });
  }, [currentSelection, isDragging, isCivilMode, isPanelSelectionActive]);

  const scrollToClipping = useCallback(
    (c: TClippingItem) => {
      const scroller = pdfScrollContainerRef.current;
      const page = c.page_number ?? 1;
      const pageEl = pageContainerRefs.current[page];
      if (!scroller || !pageEl) return;

      const px = resolveCoordinateToPx(c);
      const containerRect = scroller.getBoundingClientRect();
      const pageRect = pageEl.getBoundingClientRect();

      // scroller 내부에서 page top 위치 + (하이라이트 top) 으로 이동
      const pageTopInScroller = pageRect.top - containerRect.top;
      const targetTopInScroller = pageTopInScroller + (px?.top ?? 0);
      const nextTop = scroller.scrollTop + targetTopInScroller - 120; // 살짝 위로 여백

      scroller.scrollTo({ top: Math.max(0, nextTop), behavior: 'smooth' });
    },
    [resolveCoordinateToPx],
  );

  // 저장된 영역 삭제
  const removeSelection = useCallback(
    (id: number) => {
      setSavedSelections((prev) => prev.filter((item) => item.id !== id));
      if (currentSelectionId === id) {
        setCurrentSelectionId(null);
        setIsPanelSelectionActive(false);
      }
    },
    [currentSelectionId],
  );

  // ESC: 하이라이트 "삭제"가 아니라, 활성 상태(선택/수정모드)를 해제한다.
  useEffect(() => {
    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key !== 'Escape') return;
      // 플로팅/패널 편집/팔레트 등이 열려있는 상태에서만 처리
      if (!actionBarPos && !panelEditClippingId && paletteOpenForId === null) return;

      // 입력 중 ESC는 영역 삭제로 처리하지 않음
      const el = document.activeElement;
      if (el instanceof HTMLInputElement || el instanceof HTMLTextAreaElement || (el instanceof HTMLElement && el.isContentEditable)) {
        return;
      }

      e.preventDefault();
      // 1) 우측 패널 편집모드/메뉴/메모 입력 등 종료
      exitPanelEditMode();
      // 2) PDF 위 플로팅 액션바/팔레트 종료
      setActionBarPos(null);
      setPaletteOpenForId(null);
      // 3) 카드(div role=button) focus outline이 남아 보더처럼 보이는 현상 방지
      if (document.activeElement instanceof HTMLElement) {
        document.activeElement.blur();
      }
    };
    window.addEventListener('keydown', onKeyDown);
    return () => window.removeEventListener('keydown', onKeyDown);
  }, [actionBarPos, exitPanelEditMode, paletteOpenForId, panelEditClippingId]);

  useEffect(() => {
    updateActionBarPos();
    const scroller = pdfScrollContainerRef.current;
    if (!scroller) return;
    const onScroll = () => updateActionBarPos();
    scroller.addEventListener('scroll', onScroll, { passive: true });
    window.addEventListener('resize', onScroll);
    return () => {
      scroller.removeEventListener('scroll', onScroll);
      window.removeEventListener('resize', onScroll);
    };
  }, [updateActionBarPos, selectedDocument?.pdfUrl]);

  // 모든 영역 삭제
  const _clearAllSelections = () => {
    setSavedSelections([]);
    setSelection(null);
    setCurrentSelectionId(null);
  };

  // PDF 옵션 메모이제이션 (한 번만 생성)
  const pdfOptions = useMemo(
    () => ({
      cMapUrl: `https://unpkg.com/pdfjs-dist@${pdfjs.version}/cmaps/`,
      cMapPacked: true,
    }),
    [],
  );

  // PDF 페이지 너비: 뷰어 컨테이너 폭에 맞춰 반응형으로 계산
  const pdfViewportRef = useRef<HTMLDivElement>(null!);
  const [pageWidth, setPageWidth] = useState<number>(800);
  // zoom (pagination controls)
  const ZOOM_MIN = 50;
  const ZOOM_MAX = 200;
  const [zoomPercent, setZoomPercent] = useState<number>(100);
  const zoomScale = useMemo(() => Math.max(ZOOM_MIN, Math.min(ZOOM_MAX, zoomPercent)) / 100, [zoomPercent]);

  useEffect(() => {
    // zoom에 의해 Page DOM 크기가 바뀌므로, 하이라이트/좌표 재계산을 위해 layout version을 증가
    setPdfLayoutVersion((v) => v + 1);
  }, [zoomScale]);
  const prevSelectionPanelOpenRef = useRef<boolean>(true);
  const resizeRafRef = useRef<number | null>(null);

  const updatePdfPageWidth = useCallback(() => {
    const el = pdfViewportRef.current;
    if (!el) return;

    // 패널 토글 직후에는 flex 레이아웃이 아직 확정되지 않아 width를 잘못 읽는 경우가 있어
    // 실제 스크롤 컨테이너 폭을 우선으로 사용한다. (p-4 => 좌우 padding 16px씩)
    const scrollerW = pdfScrollContainerRef.current?.clientWidth ?? 0;
    const rectW = el.getBoundingClientRect().width;
    const wRaw = scrollerW > 0 ? Math.max(0, scrollerW - 32) : rectW;
    if (!(wRaw > 0)) return;

    const maxW = isSelectionPanelOpen ? 900 : 1400;
    // 작은 화면에서도 좌/우 패널이 유지되려면 PDF는 더 작아질 수 있어야 한다.
    const next = Math.max(80, Math.min(maxW, wRaw));
    setPageWidth((prev) => (prev === next ? prev : next));
    setPdfLayoutVersion((v) => v + 1);
  }, [isSelectionPanelOpen]);

  // 우측 패널을 다시 열 때는 PDF가 즉시 줄어들어야 패널이 잘리지 않는다.
  const openSelectionPanelAndResize = useCallback(() => {
    setIsSelectionPanelOpen(true);
    setIsSelectionPanelButtonActive(true);

    // 큰 canvas가 남는 케이스 방지: 먼저 작은 폭으로 강제 축소 후 재측정
    setPageWidth(80);
    setPdfLayoutVersion((v) => v + 1);

    requestAnimationFrame(() => updatePdfPageWidth());
    window.setTimeout(updatePdfPageWidth, 120);
    window.setTimeout(updatePdfPageWidth, 250);
  }, [updatePdfPageWidth]);

  const openRightPanelWithTab = useCallback(
    (tab: 'highlight' | 'memo') => {
      setRightPanelTab(tab);
      if (!isSelectionPanelOpen) {
        openSelectionPanelAndResize();
      }
    },
    [isSelectionPanelOpen, openSelectionPanelAndResize],
  );

  useLayoutEffect(() => {
    const el = pdfViewportRef.current;
    if (!el) return;

    const scheduleUpdate = () => {
      if (resizeRafRef.current !== null) return;
      resizeRafRef.current = window.requestAnimationFrame(() => {
        resizeRafRef.current = null;
        updatePdfPageWidth();
      });
    };

    scheduleUpdate();
    // 우측 패널 닫았다가 다시 열 때: ResizeObserver가 타이밍상 missed 되는 케이스가 있어
    // 다음 프레임(레이아웃 확정 이후)에 한 번 더 강제 업데이트한다.
    requestAnimationFrame(() => scheduleUpdate());
    window.setTimeout(scheduleUpdate, 120);

    // 컨테이너 리사이즈 감지 (패널 열림/닫힘 포함)
    const ro = new ResizeObserver(() => scheduleUpdate());
    ro.observe(el);

    window.addEventListener('resize', scheduleUpdate);
    return () => {
      window.removeEventListener('resize', scheduleUpdate);
      ro.disconnect();
      if (resizeRafRef.current !== null) {
        cancelAnimationFrame(resizeRafRef.current);
        resizeRafRef.current = null;
      }
    };
  }, [selectedDocument?.pdfUrl, isSelectionPanelOpen, updatePdfPageWidth]);

  // 우측 패널을 "닫았다가 다시 열었을 때"는 반드시 강제 축소 후 재측정해서 큰 canvas가 남지 않게 한다.
  useEffect(() => {
    const wasOpen = prevSelectionPanelOpenRef.current;
    if (!wasOpen && isSelectionPanelOpen) {
      setPageWidth(80);
      setPdfLayoutVersion((v) => v + 1);
      requestAnimationFrame(() => updatePdfPageWidth());
      window.setTimeout(updatePdfPageWidth, 120);
      window.setTimeout(updatePdfPageWidth, 250);
    }
    prevSelectionPanelOpenRef.current = isSelectionPanelOpen;
  }, [isSelectionPanelOpen, updatePdfPageWidth]);

  // 선택 영역 스타일 계산 (드래그 중일 때만 업데이트)
  const selectionStyle = useMemo(() => {
    if (!isDragging && !selection) return { display: 'none' };

    if (isDragging && liveSnappedBounds) {
      return {
        left: liveSnappedBounds.x,
        top: liveSnappedBounds.y,
        width: liveSnappedBounds.width,
        height: liveSnappedBounds.height,
      };
    }

    const x = isDragging ? Math.min(dragStart.x, dragEnd.x) : selection?.x || 0;
    const y = isDragging ? Math.min(dragStart.y, dragEnd.y) : selection?.y || 0;
    const width = isDragging ? Math.abs(dragEnd.x - dragStart.x) : selection?.width || 0;
    const height = isDragging ? Math.abs(dragEnd.y - dragStart.y) : selection?.height || 0;

    return {
      left: x,
      top: y,
      width,
      height,
    };
  }, [isDragging, selection, dragStart, dragEnd, liveSnappedBounds]);

  return (
    <div className={`flex flex-col overflow-hidden bg-[#f4f4f5] ${embedded ? 'h-full p-0' : 'h-screen pb-[10px] pr-[10px] pt-[50px]'}`}>
      <div className='flex min-h-0 w-full min-w-0 flex-1 justify-center overflow-hidden rounded-[16px] border border-[#D4D4D8] bg-white'>
        <div className='flex min-h-0 min-w-0 flex-1'>
          <div id='' className='flex h-full min-w-0 flex-1 flex-col'>
            {/* 메인 컨텐츠 영역 */}
            <div ref={contentRowRef} className='relative flex min-h-0 min-w-0 flex-1 items-stretch'>
              {/* 문서리스트 (resizable) */}
              {!hideLeftPanel && overlayLeft ? (
                <div
                  className='group absolute bottom-0 left-0 top-0 z-40 flex min-h-0 flex-col border-r border-[#D4D4D8] bg-white shadow-lg'
                  style={{ width: leftPanelWidth }}
                >
                  <div
                    role='presentation'
                    onPointerDown={(e) => startResize('left', e)}
                    className='absolute right-0 top-0 z-50 h-full w-[6px] cursor-col-resize opacity-0 transition-opacity group-hover:opacity-100'
                  >
                    <div className='mx-auto h-full w-[2px] bg-transparent group-hover:bg-[#D4D4D8]' />
                  </div>
                  <DocumentListPanel
                    title={title}
                    selectedFilter={selectedFilter}
                    setSelectedFilter={setSelectedFilter}
                    isCivilMode={isCivilMode}
                    isLoading={isCivilDocListLoading}
                    monthTree={monthTree as any}
                    expandedParents={expandedParents}
                    toggleParent={toggleParent}
                    handleDocumentClick={handleDocumentClick}
                    selectedDocument={selectedDocument}
                    onRequestOpenRightPanelTab={openRightPanelWithTab}
                    civilListQuery={civilListQuery as any}
                    civilPagination={civilPagination}
                    onChangeCivilListQuery={(patch) => {
                      setCivilListQuery((prev) => {
                        const next = { ...prev, ...(patch as any) } as any;
                        const touch =
                          Object.prototype.hasOwnProperty.call(patch, 'filters') ||
                          Object.prototype.hasOwnProperty.call(patch, 'sortColumn') ||
                          Object.prototype.hasOwnProperty.call(patch, 'sortDirection') ||
                          Object.prototype.hasOwnProperty.call(patch, 'limit');
                        if (touch && !Object.prototype.hasOwnProperty.call(patch, 'page')) next.page = 1;
                        return next;
                      });
                    }}
                    onClickAddRecord={() => {
                      if (!isCivilMode || !civilCaseId) {
                        onMessageToast({ message: '민사 사건에서만 업로드할 수 있습니다.' });
                        return;
                      }
                      setIsUploadModalOpen(true);
                    }}
                  />
                </div>
              ) : !hideLeftPanel ? (
                <div
                  className='group relative flex h-full min-h-0 flex-shrink-0 flex-col border-r border-[#D4D4D8]'
                  style={{ width: leftPanelWidth }}
                >
                  <div
                    role='presentation'
                    onPointerDown={(e) => startResize('left', e)}
                    className='absolute right-0 top-0 z-50 h-full w-[6px] cursor-col-resize opacity-0 transition-opacity group-hover:opacity-100'
                  >
                    <div className='mx-auto h-full w-[2px] bg-transparent group-hover:bg-[#D4D4D8]' />
                  </div>
                  <DocumentListPanel
                    title={title}
                    selectedFilter={selectedFilter}
                    setSelectedFilter={setSelectedFilter}
                    isCivilMode={isCivilMode}
                    isLoading={isCivilDocListLoading}
                    monthTree={monthTree as any}
                    expandedParents={expandedParents}
                    toggleParent={toggleParent}
                    handleDocumentClick={handleDocumentClick}
                    selectedDocument={selectedDocument}
                    onRequestOpenRightPanelTab={openRightPanelWithTab}
                    civilListQuery={civilListQuery as any}
                    civilPagination={civilPagination}
                    onChangeCivilListQuery={(patch) => {
                      setCivilListQuery((prev) => {
                        const next = { ...prev, ...(patch as any) } as any;
                        const touch =
                          Object.prototype.hasOwnProperty.call(patch, 'filters') ||
                          Object.prototype.hasOwnProperty.call(patch, 'sortColumn') ||
                          Object.prototype.hasOwnProperty.call(patch, 'sortDirection') ||
                          Object.prototype.hasOwnProperty.call(patch, 'limit');
                        if (touch && !Object.prototype.hasOwnProperty.call(patch, 'page')) next.page = 1;
                        return next;
                      });
                    }}
                    onClickAddRecord={() => {
                      if (!isCivilMode || !civilCaseId) {
                        onMessageToast({ message: '민사 사건에서만 업로드할 수 있습니다.' });
                        return;
                      }
                      setIsUploadModalOpen(true);
                    }}
                  />
                </div>
              ) : null}

              {/* 오른쪽 PDF 뷰어 */}
              {/* NOTE: flex row에서 w-full이 있으면(좌측 패널 + 우측 패널과 함께) 전체가 overflow되어 패널이 잘릴 수 있어 min-w-0 + flex-1로만 남긴다. */}
              <div className='flex min-w-0 flex-1 overflow-hidden bg-[#E3EAF2]' style={{ minWidth: CENTER_MIN_WIDTH }}>
                <div className='flex min-w-0 flex-1 flex-col overflow-hidden'>
                  {isEditorOpen ? (
                    <CaseDocumentEditor />
                  ) : selectedDocument ? (
                    <div className='flex h-full flex-col'>
                      {/* PDF 뷰어 컨트롤 */}
                      <div className='relative flex h-[48px] border-b border-l border-[#D4D4D8] bg-white'>
                        {/* 왼쪽: PDF 헤더(탭/타이틀) 영역 */}
                        <div className='flex min-w-0 flex-1 items-end bg-white pl-1 pr-1'>
                          <div className='flex h-full min-w-0 flex-1 items-end'>
                            {/* 새탭(hideLeftPanel=true)에서는 상단 "최근 문서 탭" UI를 숨기고 타이틀만 노출 */}
                            {isCivilMode && !hideLeftPanel && recentDocs.length > 0 ? (
                              <div ref={tabsRowRef} className='flex w-full min-w-0 gap-1 overflow-hidden pb-0'>
                                {recentDocs.slice(0, 3).map((tab) => {
                                  const tabId = String(tab.caseDocumentId ?? '');
                                  const isActive = tabId && tabId === String(selectedDocument?.caseDocumentId ?? '');
                                  const w = tabWidthById[tabId];
                                  return (
                                    <div
                                      key={tabId}
                                      className={`group flex h-[43px] min-w-0 items-center rounded-t-[8px] border border-b-0 px-3 text-[14px] font-medium ${
                                        isActive
                                          ? 'border-[#D4D4D8] bg-[#DFEFFF] text-[#000]'
                                          : 'border-[#D4D4D8] bg-white hover:bg-[#F4F4F5]'
                                      }`}
                                      style={{
                                        width: w ? `${w}px` : undefined,

                                        flex: '0 1 auto',
                                        minWidth: 0,
                                        maxWidth: '100%',
                                      }}
                                    >
                                      <button
                                        type='button'
                                        className={`min-w-0 flex-1 truncate text-left text-[13px] font-medium ${
                                          isActive ? 'text-[#18181B]' : 'text-[#71717A]'
                                        }`}
                                        onClick={(e) => {
                                          e.stopPropagation();
                                          openRecentDocTab(tabId);
                                        }}
                                        title={tab.title}
                                      >
                                        {tab.title || '문서'}
                                      </button>
                                      <button
                                        type='button'
                                        className={`flex h-[18px] w-[18px] items-center justify-center rounded-[4px] hover:bg-[#F4F4F5] hover:text-[#18181B] ${
                                          isActive ? 'text-[#000]' : 'text-[#8A8A8E]'
                                        }`}
                                        onClick={(e) => {
                                          e.stopPropagation();
                                          setRenameTarget({ caseDocumentId: tabId, initialTitle: String(tab.title ?? '') });
                                        }}
                                        aria-label='rename tab'
                                      >
                                        <Pencil className='h-[14px] w-[14px]' />
                                      </button>
                                      <button
                                        type='button'
                                        className={`flex h-[18px] w-[18px] items-center justify-center rounded-[4px] hover:bg-[#F4F4F5] hover:text-[#18181B] ${
                                          isActive ? 'text-[#000]' : 'text-[#8A8A8E]'
                                        }`}
                                        onClick={(e) => {
                                          e.stopPropagation();
                                          closeRecentDocTab(tabId);
                                        }}
                                        aria-label='close tab'
                                      >
                                        <X className='h-[14px] w-[14px]' />
                                      </button>
                                    </div>
                                  );
                                })}
                              </div>
                            ) : (
                              <div className='flex h-full items-center pl-[8px] text-sm font-medium text-gray-900'>
                                {selectedDocument.title}
                              </div>
                            )}

                            <DocumentRenameModal
                              isOpen={Boolean(renameTarget)}
                              initialValue={String(renameTarget?.initialTitle ?? '')}
                              isSubmitting={isRenamingDoc}
                              onClose={() => setRenameTarget(null)}
                              onSubmit={async (nextFileName) => {
                                const docId = String(renameTarget?.caseDocumentId ?? '').trim();
                                const next = String(nextFileName ?? '').trim();
                                if (!docId || !next) return;
                                const res = await onUpdateCivilCaseDocumentFileName({ case_document_id: docId, file_name: next });
                                if (!res) {
                                  onMessageToast({ message: '이름 변경에 실패했습니다.' });
                                  return;
                                }
                                setRecentDocs((prev) =>
                                  prev.map((t) => (String(t.caseDocumentId ?? '') === docId ? { ...t, title: next } : t)),
                                );
                                setSelectedDocument((prev) =>
                                  prev && String(prev.caseDocumentId ?? '') === docId ? { ...prev, title: next } : prev,
                                );
                                onMessageToast({ message: '이름이 변경되었습니다.' });
                                setRenameTarget(null);
                              }}
                            />
                          </div>
                        </div>

                        {/* 오른쪽: 우측 패널과 동일 폭의 헤더(버튼) 영역 */}
                        <div
                          className={`flex items-center justify-end gap-2 border-l border-[#D4D4D8] bg-white pr-[16px] ${
                            isSelectionPanelOpen && overlayRight ? 'absolute right-0 top-0 h-full' : 'relative'
                          }`}
                          style={{ width: isSelectionPanelOpen ? rightPanelWidth : 'auto' }}
                        >
                          {selectedDocument ? (
                            <>
                              <button
                                ref={viewSettingsBtnRef}
                                type='button'
                                className={`flex h-[32px] items-center justify-between rounded-[12px] border border-[#E4E4E7] bg-white ${viewSettingsBtnPaddingClass} text-[14px] font-semibold text-[#18181B] hover:bg-[#f2f2f2]`}
                                style={{ width: `${viewSettingsBtnWidthPx}px` }}
                                onClick={async () => {
                                  // 멤버 목록은 @멘션에서 쓰는 것과 동일한 API로 가져온다.
                                  // 이 버튼을 처음 열 때 한 번만 refetch되도록 한다.
                                  if (!projectMembersResponse) {
                                    try {
                                      await refetchProjectMembers();
                                    } catch {
                                      // 무시
                                    }
                                  }
                                  setIsViewSettingsOpen((prev) => !prev);
                                  requestAnimationFrame(() => updateViewSettingsPos());
                                }}
                              >
                                <span className='flex items-center gap-1'>
                                  <Highlighter className='h-[16px] w-[16px] text-[#18181B]' />
                                  {viewSettingsLabel}
                                </span>
                                <ChevronDown className='h-[16px] w-[16px] text-[#71717A]' />
                              </button>

                              {isViewSettingsOpen && viewSettingsPos && typeof document !== 'undefined'
                                ? createPortal(
                                    <div
                                      ref={viewSettingsMenuRef}
                                      className='fixed z-[2147483647] overflow-hidden rounded-[16px] border border-[#E4E4E7] bg-white shadow-xl'
                                      style={{ left: viewSettingsPos.left, top: viewSettingsPos.top, width: 195 }}
                                    >
                                      <button
                                        type='button'
                                        className='flex h-[32px] w-full items-center justify-between px-3 text-left hover:bg-[#F4F4F5]'
                                        onClick={() => {
                                          // "모두 보기"는 전체 선택.
                                          // 이미 전체 선택 상태면 '-' 아이콘과 함께 "전체 해제"로 동작한다.
                                          if (viewSelectionMode === 'all') {
                                            setViewSelectionMode('none');
                                            setViewMemberSelection(new Set());
                                          } else {
                                            setViewSelectionMode('all');
                                            setViewMemberSelection(new Set());
                                            // 전체 선택 시 데이터 다시 가져오기
                                            setTimeout(() => refetchClippings(), 0);
                                          }
                                        }}
                                      >
                                        <span className='text-[14px] font-semibold text-[#18181B]'>모두 보기</span>
                                        {isAllViewSelected ? (
                                          <Minus className='h-4 w-4 text-[#18181B]' />
                                        ) : (
                                          <Check className='h-4 w-4 text-[#D4D4D8]' />
                                        )}
                                      </button>

                                      <div className='max-h-[256px] overflow-auto'>
                                        {(projectMembers as any[]).map((m) => {
                                          const id = getMemberId(m);
                                          const name = getMemberName(m);
                                          const avatar = getMemberAvatar(m);
                                          const colorKey = getMemberColorKey(m);
                                          const colorHex = colorKey ? getUserColor(colorKey) : '#E4E4E7';
                                          const checked = isMemberChecked(id);
                                          if (!id || !name) return null;
                                          return (
                                            <button
                                              key={id}
                                              type='button'
                                              className='flex h-[32px] w-full items-center justify-between px-3 text-left hover:bg-[#F4F4F5]'
                                              onClick={() => toggleMember(id)}
                                            >
                                              <span className='flex min-w-0 items-center gap-2'>
                                                {avatar ? (
                                                  <img src={avatar} alt='' className='h-[20px] w-[20px] rounded-full object-cover' />
                                                ) : (
                                                  <span
                                                    className='flex h-[20px] w-[20px] items-center justify-center rounded-full text-[12px] font-semibold text-white'
                                                    style={{ backgroundColor: colorHex }}
                                                    title={name}
                                                  >
                                                    {String(name).slice(0, 1)}
                                                  </span>
                                                )}
                                                <span className='min-w-0 truncate text-[14px] font-semibold text-[#18181B]'>{name}</span>
                                              </span>
                                              <Check className={`h-4 w-4 ${checked ? 'text-[#18181B]' : 'text-[#D4D4D8]'}`} />
                                            </button>
                                          );
                                        })}
                                      </div>
                                    </div>,
                                    document.body,
                                  )
                                : null}
                            </>
                          ) : null}

                          {selectedDocument ? (
                            <button
                              type='button'
                              onClick={() => {
                                // "목록" 버튼은 토글: 한 번 누르면 열리고, 다시 누르면 닫힌다.
                                if (isSelectionPanelOpen) {
                                  setIsSelectionPanelOpen(false);
                                  setIsSelectionPanelButtonActive(false);
                                  requestAnimationFrame(() => updatePdfPageWidth());
                                  window.setTimeout(updatePdfPageWidth, 120);
                                } else {
                                  openSelectionPanelAndResize();
                                }
                              }}
                              className={`rounded px-3 py-1 text-sm text-gray-700 hover:bg-[#f2f2f2] ${
                                isSelectionPanelOpen ? 'bg-[#f2f2f2]' : 'bg-transparent'
                              }`}
                            >
                              <LayoutList className='h-[18px] w-[18px] text-[#000]' />
                            </button>
                          ) : null}

                          {selectedDocument ? (
                            <HeaderIconButton label='새창 열기' onClick={openSelectedDocInNewTab} disabled={hideLeftPanel}>
                              <SquareArrowOutUpRight className='h-[18px] w-[18px] text-[#000]' />
                            </HeaderIconButton>
                          ) : null}

                          {selectedDocument ? (
                            <HeaderIconButton
                              label='간편 검색'
                              onClick={() => {
                                void openQuickSearch();
                              }}
                            >
                              <Search className='h-[18px] w-[18px] text-[#000]' />
                            </HeaderIconButton>
                          ) : null}

                          <HeaderIconButton
                            label='뷰어 닫기'
                            onClick={() => {
                              // 기존: 우측 패널 닫기
                              // 변경: 상세 화면 닫고 메인 목록(케이스 메인 리스트)로 이동
                              onExitToMainList?.();
                            }}
                          >
                            <X className='h-[18px] w-[18px] text-[#000]' />
                          </HeaderIconButton>
                        </div>
                      </div>

                      {/* PDF 컨텐츠 + 저장된영역 패널 (헤더 아래에서만 좌우 배치) */}
                      <div className='relative flex min-h-0 flex-1 items-stretch overflow-hidden'>
                        {/* PDF 뷰어 */}
                        <div className='relative min-w-0 flex-1 overflow-visible bg-[#E3EAF2]'>
                          {/* 스크롤 컨테이너 (IntersectionObserver root) */}
                          <div
                            ref={pdfScrollContainerRef}
                            className={`evi-scrollbar-hide h-full overflow-auto p-4 ${isQuickSearchOpen ? 'relative z-[2147480500]' : ''}`}
                          >
                            <div
                              ref={pdfViewportRef}
                              className='mx-auto flex w-full justify-center'
                              style={{
                                transform: `translateX(${pdfCenterOffsetPx}px)`,
                                willChange: 'transform',
                              }}
                            >
                              {selectedDocument.pdfUrl ? (
                                <div className='relative w-fit overflow-visible'>
                                  {pdfError ? (
                                    <div className='flex h-[800px] items-center justify-center'>
                                      <div className='text-center'>
                                        <p className='text-lg font-medium text-red-500'>PDF를 불러올 수 없습니다</p>
                                        <p className='mt-2 text-sm text-gray-500'>{pdfError}</p>
                                      </div>
                                    </div>
                                  ) : (
                                    <>
                                      <Document
                                        key={selectedDocument.pdfUrl}
                                        file={selectedDocument.pdfUrl}
                                        onLoadSuccess={onDocumentLoadSuccess}
                                        onLoadError={onDocumentLoadError}
                                        loading={
                                          <div className='flex h-[800px] items-center justify-center'>
                                            <div className='flex flex-col items-center gap-2 text-[#8A8A8E]'>
                                              <div className='flex h-[16px] w-[16px] scale-[0.7] items-center justify-center'>
                                                <CustomSpinner size='sm' />
                                              </div>
                                              <div className='text-[13px] font-medium'>pdf 문서 로딩중</div>
                                            </div>
                                          </div>
                                        }
                                        options={pdfOptions}
                                      >
                                        {numPages ? (
                                          <div className='flex w-full flex-col items-center'>
                                            {Array.from({ length: numPages }, (_, idx) => idx + 1).map((n) => (
                                              <div
                                                key={`page-wrap-${n}`}
                                                data-page-number={n}
                                                ref={(el) => {
                                                  pageContainerRefs.current[n] = el;
                                                  if (n === 1 && !activePageContainerRef.current && el) {
                                                    activePageContainerRef.current = el;
                                                  }
                                                }}
                                                // 페이지 wrapper가 컨테이너 가로폭에 따라 늘어나면(작→큼) 좌표계가 바뀌어 하이라이트가 틀어질 수 있음
                                                // inline-block으로 실제 PDF 페이지 크기만큼만 차지하게 해서 좌표계를 고정한다.
                                                className='relative mb-6 inline-block'
                                              >
                                                <Page
                                                  key={`page-${n}-${pageWidth}-${zoomPercent}`}
                                                  pageNumber={n}
                                                  width={pageWidth}
                                                  scale={zoomScale}
                                                  loading={null}
                                                  renderMode='canvas'
                                                  renderTextLayer={true}
                                                  renderAnnotationLayer={false}
                                                />

                                                {/* 드래그 오버레이 (페이지별) */}
                                                <div
                                                  className='absolute inset-0 cursor-crosshair'
                                                  onMouseDown={(e) => handleMouseDown(e, n)}
                                                  style={{
                                                    zIndex: 10,
                                                    pointerEvents: isDragging ? 'none' : 'auto',
                                                    backgroundColor: 'transparent',
                                                  }}
                                                />

                                                {/* 저장된 선택 영역들 표시 (페이지별) */}
                                                {activeClipHighlight && activeClipHighlight.page === n ? (
                                                  <div
                                                    className='absolute border-2'
                                                    style={{
                                                      left: activeClipHighlight.left,
                                                      top: activeClipHighlight.top,
                                                      width: activeClipHighlight.right - activeClipHighlight.left,
                                                      height: activeClipHighlight.bottom - activeClipHighlight.top,
                                                      zIndex: 7,
                                                      borderColor:
                                                        isPanelSelectionActive &&
                                                        currentSelection?.clippingId === activeClipHighlight.clippingId
                                                          ? activeClipHighlight.borderHex
                                                          : 'transparent',
                                                      backgroundColor: hexToRgba(activeClipHighlight.fillHex, 0.18),
                                                    }}
                                                  />
                                                ) : null}
                                                {savedSelections
                                                  .filter((sel) => sel.page === n)
                                                  .map((sel) => (
                                                    <div
                                                      key={sel.id}
                                                      className='absolute border-2'
                                                      style={{
                                                        left: sel.left,
                                                        top: sel.top,
                                                        width: sel.right - sel.left,
                                                        height: sel.bottom - sel.top,
                                                        zIndex: 5,
                                                        borderColor:
                                                          isPanelSelectionActive && currentSelectionId === sel.id
                                                            ? sel.border || getBorderForColor(sel.color || DEFAULT_HIGHLIGHT_COLOR)
                                                            : 'transparent',
                                                        backgroundColor: hexToRgba(sel.color || DEFAULT_HIGHLIGHT_COLOR, 0.28),
                                                      }}
                                                    />
                                                  ))}

                                                {/* 현재 드래그 중인 선택 영역 표시 (활성 페이지에서만) */}
                                                {isDragging && pageNumber === n ? (
                                                  <div
                                                    className='absolute border-2 border-blue-500 bg-blue-200 bg-opacity-30'
                                                    style={{
                                                      ...selectionStyle,
                                                      zIndex: 15,
                                                      pointerEvents: 'none',
                                                    }}
                                                  />
                                                ) : null}

                                                {/* 선택된 영역 액션바는 scroll container 밖(fixed overlay)에서 렌더 */}
                                              </div>
                                            ))}
                                          </div>
                                        ) : null}
                                      </Document>
                                    </>
                                  )}
                                </div>
                              ) : isViewCivilDocPending ? (
                                <div className='flex h-[800px] items-center justify-center'>
                                  <div className='flex flex-col items-center gap-2 text-[#8A8A8E]'>
                                    <div className='flex h-[16px] w-[16px] scale-[0.7] items-center justify-center'>
                                      <CustomSpinner size='sm' />
                                    </div>
                                    <div className='text-[13px] font-medium'>pdf 문서 로딩중</div>
                                  </div>
                                </div>
                              ) : (
                                <div className='flex h-[800px] items-center justify-center'>
                                  <div className='text-gray-500'>PDF URL이 설정되지 않았습니다</div>
                                </div>
                              )}
                            </div>

                            {/* 스크롤형 PDF: 페이지 이동은 스크롤로 */}
                          </div>

                          {/* 페이지바: 스크롤과 무관하게 "뷰어" 바닥에 고정 */}
                          {/* 좌측 기록목록이 overlay로 PDF 위에 올라오는 상태에서는 페이지네이션이 기록목록 위로 뜰 수 있어 숨긴다 */}
                          {selectedDocument?.pdfUrl && numPages && !overlayLeft ? (
                            <PdfPagination
                              visiblePageNumber={visiblePageNumber}
                              numPages={numPages}
                              scrollToPage={scrollToPage}
                              zoomPercent={Math.max(50, Math.min(200, zoomPercent))}
                              onZoomOut={() => setZoomPercent((p) => Math.max(50, p - 10))}
                              onZoomIn={() => setZoomPercent((p) => Math.min(200, p + 10))}
                              canZoomOut={zoomPercent > 50}
                              canZoomIn={zoomPercent < 200}
                            />
                          ) : null}

                          {/* 선택 영역 액션바: 스크롤 영역 밖으로 overflow 가능하도록 fixed로 렌더 */}
                          {actionBarPos && currentSelection && (!isCivilMode || isPanelSelectionActive) ? (
                            <div ref={actionBarRef}>
                              <FloatingActionBar
                                actionBarPos={actionBarPos}
                                selection={currentSelection}
                                onSelectDocTag={(t) => {
                                  if (currentSelection.clippingId) {
                                    openSelectionPanelAndResize();
                                    setPanelEditClippingId(currentSelection.clippingId);
                                  }
                                  updateSelectionFlags(currentSelection.id, { docUsable: true, docUsableType: t });

                                  if (!isCivilMode) return;
                                  if (!currentSelection.clippingId) return;
                                  const c = clippings.find((x) => x.clipping_id === currentSelection.clippingId);
                                  if (!c) return;
                                  const baseTags: string[] = [t];
                                  if (currentSelection.flags?.relatedMissing) baseTags.push(RELATED_MISSING_TAG);
                                  void applyClippingUpdate(c, { tags: baseTags, clippingType: toClippingType(t) }).then((ok) => {
                                    if (ok) onMessageToast({ message: '태그가 등록되었습니다.' });
                                  });
                                }}
                                onToggleRelatedMissing={() => {
                                  if (currentSelection.clippingId) {
                                    openSelectionPanelAndResize();
                                    setPanelEditClippingId(currentSelection.clippingId);
                                  }
                                  const next = !currentSelection.flags?.relatedMissing;
                                  updateSelectionFlags(currentSelection.id, { relatedMissing: next });
                                  if (!isCivilMode) return;
                                  if (!currentSelection.clippingId) return;
                                  const c = clippings.find((x) => x.clipping_id === currentSelection.clippingId);
                                  if (!c) return;

                                  const docTag = currentSelection.flags?.docUsableType;
                                  const baseTags: string[] = [];
                                  if (docTag) baseTags.push(docTag);
                                  if (next) baseTags.push(RELATED_MISSING_TAG);

                                  void applyClippingUpdate(c, {
                                    tags: baseTags,
                                    clippingType: docTag ? toClippingType(docTag) : 'OTHER',
                                  }).then((ok) => {
                                    if (ok) onMessageToast({ message: '태그가 등록되었습니다.' });
                                  });
                                }}
                                onClickMemo={() => {
                                  if (!currentSelection.clippingId) return;
                                  openSelectionPanelAndResize();
                                  setPanelEditClippingId(currentSelection.clippingId);
                                  setActiveMemoInputClippingId(currentSelection.clippingId);
                                  setMemoInputDraft('');
                                  setOpenMemoMenuId(null);
                                  setOpenClippingMenuId(null);
                                  setPaletteOpenForId(null);
                                  requestAnimationFrame(() => panelEditCardRef.current?.scrollIntoView({ block: 'nearest' }));
                                }}
                                isPaletteOpen={paletteOpenForId === currentSelection.id}
                                onTogglePalette={() => {
                                  setPaletteOpenForId((prev) => (prev === currentSelection.id ? null : currentSelection.id));
                                }}
                                colors={HIGHLIGHT_COLORS}
                                defaultFillHex={DEFAULT_HIGHLIGHT_COLOR}
                                onSelectColor={(c) => {
                                  updateSelection(currentSelection.id, { color: c.hex, border: c.border });
                                  setPaletteOpenForId(null);
                                  if (isCivilMode && currentSelection.clippingId) {
                                    const clip = clippings.find((x) => x.clipping_id === currentSelection.clippingId);
                                    if (!clip) return;
                                    void applyClippingUpdate(clip, { color: c.key }).then((ok) => {
                                      if (ok) onMessageToast({ message: '하이라이트 색상이 변경되었습니다.' });
                                    });
                                  }
                                }}
                                onDelete={() => {
                                  if (isCivilMode && currentSelection.clippingId) {
                                    const clip = clippings.find((x) => x.clipping_id === currentSelection.clippingId);
                                    if (clip) requestDeleteClipping(clip);
                                  } else {
                                    removeSelection(currentSelection.id);
                                  }
                                  setPaletteOpenForId(null);
                                }}
                              />
                            </div>
                          ) : null}
                        </div>

                        {/* 저장된 영역 패널(드로어) - PDF 컨텐츠 옆에 붙임 */}
                        {selectedDocument && isSelectionPanelOpen ? (
                          <RightSidebarPanel
                            rightImg={rightImg}
                            caseDocumentId={selectedDocument?.caseDocumentId ?? null}
                            civilCaseId={selectedDocument?.civilCaseId ?? civilCaseId ?? null}
                            activeTab={rightPanelTab}
                            onChangeTab={setRightPanelTab}
                            onClickQuickSearch={() => {
                              void openQuickSearch();
                            }}
                            rightPanelRef={rightPanelRef}
                            panelWidthPx={rightPanelWidth}
                            panelClassName={overlayRight ? 'absolute right-0 top-0 bottom-0 z-40 shadow-lg' : ''}
                            onResizeStartLeft={(e) => startResize('right', e)}
                            selectionPanelScrollRef={selectionPanelScrollRef}
                            panelEditCardRef={panelEditCardRef}
                            clippingMenuRef={clippingMenuRef}
                            memoMenuRef={memoMenuRef}
                            isCivilMode={isCivilMode}
                            isClippingFetching={isClippingFetching}
                            clippings={clippings}
                            savedSelections={savedSelections}
                            pageContainerRefs={pageContainerRefs as any}
                            creatingSelectionId={creatingSelectionId}
                            recognizingDots={recognizingDots}
                            loginUserInfo={loginUserInfo}
                            panelEditClippingId={panelEditClippingId}
                            openClippingMenuId={openClippingMenuId}
                            isDeleteClippingPending={isDeleteClippingPending}
                            activeMemoInputClippingId={activeMemoInputClippingId}
                            memoInputDraft={memoInputDraft}
                            memoInputRef={memoInputRef}
                            setActiveMemoInputClippingId={setActiveMemoInputClippingId}
                            setMemoInputDraft={setMemoInputDraft}
                            openMemoMenuId={openMemoMenuId}
                            setOpenMemoMenuId={setOpenMemoMenuId}
                            editingMemoId={editingMemoId}
                            editingMemoDraft={editingMemoDraft}
                            setEditingMemoId={setEditingMemoId}
                            setEditingMemoDraft={setEditingMemoDraft}
                            isUpdateMemoPending={isUpdateMemoPending}
                            isDeleteMemoPending={isDeleteMemoPending}
                            updateMemoAsync={updateMemoAsync}
                            deleteMemoAsync={deleteMemoAsync}
                            projectMembers={projectMembers as any}
                            projectIdForMembers={projectIdForMembers}
                            isMentionOpen={isMentionOpen}
                            setIsMentionOpen={setIsMentionOpen}
                            setMentionQuery={setMentionQuery}
                            mentionActiveIndex={mentionActiveIndex}
                            setMentionActiveIndex={setMentionActiveIndex}
                            mentionDropdownPos={mentionDropdownPos}
                            mentionDropdownContainerRef={mentionDropdownContainerRef}
                            mentionedUserIdsDraft={mentionedUserIdsDraft}
                            setMentionedUserIdsDraft={setMentionedUserIdsDraft}
                            filteredMentionMembers={filteredMentionMembers as any}
                            submitMemo={submitMemo}
                            refetchProjectMembers={refetchProjectMembers}
                            refreshClippingNotes={refreshClippingNotes}
                            getMemos={getMemos as any}
                            canEditMemo={canEditMemo as any}
                            renderMemoWithMentions={renderMemoWithMentions as any}
                            getUserColor={getUserColor}
                            formatRelativeTime={formatRelativeTime}
                            getClippingTags={getClippingTags as any}
                            canDeleteClipping={canDeleteClipping as any}
                            KNOWN_DOC_TAGS={KNOWN_DOC_TAGS as any}
                            RELATED_MISSING_TAG={RELATED_MISSING_TAG}
                            setOpenClippingMenuId={setOpenClippingMenuId}
                            requestDeleteClipping={requestDeleteClipping as any}
                            applyClippingUpdate={applyClippingUpdate as any}
                            toClippingType={toClippingType}
                            scrollToClipping={scrollToClipping as any}
                            ensureSelectionForClipping={ensureSelectionForClipping as any}
                            setCurrentSelectionId={setCurrentSelectionId as any}
                            setIsPanelSelectionActive={setIsPanelSelectionActive}
                            setActionBarPos={setActionBarPos}
                            updateActionBarPos={updateActionBarPos}
                            setPanelEditClippingId={setPanelEditClippingId}
                          />
                        ) : null}
                      </div>
                    </div>
                  ) : hideLeftPanel && initialCaseDocumentId ? (
                    <div className='flex h-full items-center justify-center'>
                      <div className='flex flex-col items-center gap-2 text-[#8A8A8E]'>
                        <div className='flex h-[16px] w-[16px] scale-[0.7] items-center justify-center'>
                          <CustomSpinner size='sm' />
                        </div>
                        <div className='text-[13px] font-medium'>문서 로딩중</div>
                      </div>
                    </div>
                  ) : (
                    <div className='flex h-full items-center justify-center'>
                      <div className='text-center'>
                        <p className='text-lg font-medium text-gray-500'>문서를 선택해주세요</p>
                        <p className='mt-2 text-sm text-gray-400'>왼쪽 목록에서 문서를 클릭하면 여기에 표시됩니다</p>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </div>

            {/* 클리핑 삭제 확인 모달 */}
            {isClippingDeleteOpen && deleteTargetClipping ? (
              <ModalSelect
                sendMessage='클리핑을 삭제하시겠습니까?'
                storageMessage={
                  getMemos(deleteTargetClipping).length > 0
                    ? '해당 클리핑에 메모가 있습니다.\n그래도 삭제하시겠습니까?'
                    : '클리핑을 삭제하시겠습니까?'
                }
                confirmButtonText='삭제'
                setIsModalOpen={() => {
                  setIsClippingDeleteOpen(false);
                  setDeleteTargetClipping(null);
                }}
                handleSave={async () => {
                  if (!deleteTargetClipping) return;
                  setIsClippingDeleteOpen(false);
                  await handleDeleteClipping(deleteTargetClipping);
                  setDeleteTargetClipping(null);
                }}
              />
            ) : null}

            {/* 기록(민사 문서) 업로드 모달 */}
            <CaseUploadModal
              isOpen={isUploadModalOpen}
              civilCaseId={civilCaseId ?? undefined}
              onClose={() => setIsUploadModalOpen(false)}
              onSuccess={() => {
                refetchCivilCaseDocs();
                setIsUploadModalOpen(false);
              }}
              // 서버 스펙 필수값이므로 기본값 제공 (필요 시 추후 UI에서 선택 가능)
              isPlaintiff={true}
              documentType='OTHER'
            />

            {/* Quick Search: dim all except PDF viewer + modal */}
            {isQuickSearchOpen && typeof document !== 'undefined'
              ? createPortal(
                  <div
                    className='fixed inset-0 z-[2147480000] bg-black/70'
                    onClick={() => setIsQuickSearchOpen(false)}
                    aria-hidden='true'
                  />,
                  document.body,
                )
              : null}

            {/* Quick Search modal (same style as CaseViewerPage) */}
            {isQuickSearchOpen && typeof document !== 'undefined'
              ? createPortal(
                  <div className='pointer-events-none fixed inset-0 z-[2147480600] flex items-center justify-center'>
                    {quickSearchLoading ? (
                      <div className='pointer-events-auto flex h-full w-full items-center justify-center'>
                        <CustomSpinner />
                      </div>
                    ) : (
                      <Draggable handle='.drag-handle' bounds='parent'>
                        <Resizable
                          defaultSize={{
                            width: '60%',
                            height: '70%',
                          }}
                          minWidth='300px'
                          minHeight='200px'
                          maxWidth='90%'
                          maxHeight='90%'
                          style={{
                            background: 'white',
                            borderRadius: '16px',
                            overflow: 'hidden',
                            boxShadow: '0 0 10px rgba(0,0,0,0.2)',
                            pointerEvents: 'auto',
                          }}
                        >
                          <div className='flex h-full flex-col'>
                            <div className='drag-handle flex cursor-move items-center justify-between pl-[32px] pr-[32px] pt-[32px]'>
                              <div className='text-[24px] font-bold text-[#212121]'>간편검색</div>
                              <div className='flex items-center gap-2'>
                                <button
                                  type='button'
                                  onClick={() => setIsQuickSearchOpen(false)}
                                  className='text-[24px] text-[#5B5B5B]'
                                  aria-label='close'
                                >
                                  <X className='h-6 w-6' />
                                </button>
                              </div>
                            </div>
                            <div className='pl-[32px] pt-[8px] text-[16px] text-[#1890FF]'>Ctrl + F 또는 Cmd + F를 눌러 검색하세요.</div>
                            <div className='flex-1 overflow-auto pl-[32px] pr-[32px] pt-[10px]'>
                              <div className='border p-[14px]'>
                                {Array.isArray(quickSearchPages) && quickSearchPages.length > 0 ? (
                                  <div className='flex flex-col gap-4'>
                                    {quickSearchPages.map((p) => (
                                      <div key={p.page_number} className='flex flex-col gap-2'>
                                        <div className='text-[14px] font-bold text-[#212121]'>{`PDF ${p.page_number} 페이지`}</div>
                                        <div className='whitespace-pre-wrap break-words text-[14px] text-[#212121]'>{p.description}</div>
                                      </div>
                                    ))}
                                  </div>
                                ) : (
                                  quickSearchText.split('\n').map((line, index) => (
                                    <p key={index} className='mb-2'>
                                      {line}
                                    </p>
                                  ))
                                )}
                              </div>
                            </div>
                          </div>
                        </Resizable>
                      </Draggable>
                    )}
                  </div>,
                  document.body,
                )
              : null}
          </div>
        </div>
      </div>
    </div>
  );
};

export default CaseDetailListTable;
