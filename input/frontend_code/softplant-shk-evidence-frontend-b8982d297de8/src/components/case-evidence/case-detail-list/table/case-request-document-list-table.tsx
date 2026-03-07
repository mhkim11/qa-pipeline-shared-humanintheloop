import { useCallback, useEffect, useLayoutEffect, useMemo, useRef, useState } from 'react';

import { useMutation } from '@tanstack/react-query';
import {
  Check,
  ChevronDown,
  Download,
  FoldVertical,
  Highlighter,
  LayoutList,
  MessageCircleReply,
  Minus,
  MoreHorizontal,
  Pencil,
  Search,
  X,
} from 'lucide-react';
import { Resizable } from 're-resizable';
import { createPortal } from 'react-dom';
import Draggable from 'react-draggable';
import { Document, Page, pdfjs } from 'react-pdf';
import { useSearchParams } from 'react-router-dom';
import 'react-pdf/dist/Page/AnnotationLayer.css';
import 'react-pdf/dist/Page/TextLayer.css';

import { useGetCivilCaseDocumentList, useGetClippingList } from '@query/query';
import { fetchDownloadDocument, fetchGetDocumentContent } from '@/apis/case-api/civil-case-api';
import { fetchDeleteMemo, fetchUpdateMemo } from '@/apis/case-api/cliping-api';
import type { TGetClippingListOutput } from '@/apis/type/case-type/cliping.type';
import rightImg from '@/assets/images/rigjtImg.png';
import { CaseUploadModal, PdfPagination } from '@/components/case-evidence';
import DocumentRenameModal from '@/components/case-evidence/case-detail-list/modal/document-rename-modal';
import DocumentSplitModal from '@/components/case-evidence/case-detail-list/modal/document-split-modal';
import RequestDocumentListPanel from '@/components/case-evidence/request-list/panels/request-document-list-panel';
import RequestRightSidebarPanel from '@/components/case-evidence/request-list/panels/request-right-sidebar-panel';
import ModalSelect from '@/components/common/modal/modal-select';
import CustomSpinner from '@/components/common/spiner';
import { onMessageToast } from '@/components/utils';
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
  active,
}: {
  label: string;
  onClick: () => void;
  children: React.ReactNode;
  disabled?: boolean;
  active?: boolean;
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
          active ? 'bg-[#f2f2f2]' : ''
        } ${disabled ? 'cursor-not-allowed opacity-40' : 'hover:bg-[#f2f2f2]'}`}
        onMouseEnter={() => {
          if (!disabled) setOpen(true);
        }}
        onMouseLeave={() => setOpen(false)}
        onFocus={() => {
          if (!disabled) setOpen(true);
        }}
        onBlur={() => setOpen(false)}
        aria-label={label}
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

type TCaseMainListTableProps = {
  title: string;
  civilCaseId?: string | null;
  evidenceRequestId?: string | null;
  /** 사건(문서) 선택 시 상세 화면으로 전환하기 위한 콜백 */
  onSelectCaseDocumentId: (caseDocumentId: string) => void;
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
  linked_documents?: any[];
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

const CaseRequestDocumentListTable = ({
  title,
  civilCaseId,
  evidenceRequestId: _evidenceRequestId,
  onSelectCaseDocumentId: _onSelectCaseDocumentId,
}: TCaseMainListTableProps): JSX.Element => {
  const [searchParams] = useSearchParams();
  const [selectedFilter, setSelectedFilter] = useState<string>('전체');
  const [selectedDocument, setSelectedDocument] = useState<TDocumentItem | null>(null);
  const [expandedParents, setExpandedParents] = useState<Record<string, boolean>>({});
  const [isUploadModalOpen, setIsUploadModalOpen] = useState(false);
  const [leftPanelWidth, setLeftPanelWidth] = useState(520);
  const isCivilMode = true;
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
    // "전체 자료" 기본값: 20개씩 보기
    limit: 20,
  });
  const toggleParent = (key: string) => setExpandedParents((prev) => ({ ...prev, [key]: !prev[key] }));

  const {
    response: requestDocsResponse,
    isLoading: isCivilDocListLoading,
    refetch: refetchCivilCaseDocs,
  } = useGetCivilCaseDocumentList({
    civilCaseId,
    keyword: civilListQuery.keyword,
    keywordVersion: civilListQuery.keywordVersion,
    powerSearch: civilListQuery.power_search,
    sourceType: 'CLIENT',
    page: civilListQuery.page,
    limit: civilListQuery.limit,
    filters: civilListQuery.filters as any,
    sortColumn: civilListQuery.sortColumn as any,
    sortDirection: civilListQuery.sortDirection as any,
  });

  const civilPagination = useMemo(() => {
    const raw = requestDocsResponse as any;
    const p = raw?.pagination ?? raw?.data?.pagination ?? null;
    const page = Number(p?.page ?? civilListQuery.page ?? 1);
    const limit = Number(p?.limit ?? civilListQuery.limit ?? 100);
    const total = Number(p?.total ?? 0);
    const pages = Number(p?.pages ?? (total > 0 ? Math.ceil(total / Math.max(1, limit)) : 1));
    return { total, page, limit, pages };
  }, [requestDocsResponse, civilListQuery.limit, civilListQuery.page]);

  const documents = useMemo<TDocumentItem[]>(() => {
    // API 응답 shape이 환경/버전별로 달라질 수 있어 배열을 방어적으로 추출한다.
    const rawDocs: any = (requestDocsResponse as any)?.data;
    const data: any[] = Array.isArray(rawDocs)
      ? rawDocs
      : Array.isArray(rawDocs?.data)
        ? rawDocs.data
        : Array.isArray(rawDocs?.results)
          ? rawDocs.results
          : Array.isArray(rawDocs?.files)
            ? rawDocs.files
            : Array.isArray(rawDocs?.data?.results)
              ? rawDocs.data.results
              : [];
    if (!Array.isArray(data) || data.length === 0) return [];

    const formatDate = (iso: string) => {
      if (!iso) return '';
      const d = new Date(iso);
      if (Number.isNaN(d.getTime())) return iso;
      const y = d.getFullYear();
      const m = String(d.getMonth() + 1).padStart(2, '0');
      const day = String(d.getDate()).padStart(2, '0');
      return `${y}.${m}.${day}`;
    };

    const mapDocType = (raw: string): TDocumentItem['type'] => {
      if (raw === '실체 서면' || raw === '서증' || raw === '그 외') return raw;
      if (raw?.includes('서증')) return '서증';
      if (raw?.includes('서면') || raw?.includes('소장') || raw?.includes('준비') || raw?.includes('답변')) return '실체 서면';
      return '그 외';
    };

    return data.map((d: any) => {
      const docDateRaw = String(d.document_date ?? d.documentDate ?? d.createdAt ?? '');
      const asBool = (v: unknown) => v === true || v === 'true' || v === 1 || v === '1';
      const reqId = String(
        d.request_id ??
          d.requestId ??
          d.evidence_request_id ??
          d.evidenceRequestId ??
          d.evidence_request?.request_id ??
          d.evidenceRequest?.request_id ??
          d.request?.request_id ??
          '',
      ).trim();
      const reqText = String(
        d.request_text ??
          d.requestText ??
          d.evidence_request_text ??
          d.evidenceRequestText ??
          d.evidence_request?.request_text ??
          d.evidenceRequest?.request_text ??
          d.request?.request_text ??
          '',
      ).trim();
      return {
        id: d.case_document_id || d.attachment_id || `${d.title}:${d.createdAt}`,
        title: String(d.file_name ?? d.fileName ?? d.parsed_sub_category ?? d.parsedSubCategory ?? d.title ?? ''),
        date: formatDate(docDateRaw),
        type: mapDocType(String(d.document_type ?? '')),
        party: d.is_plaintiff ? '원고' : '피고',
        projectId: d.project_id,
        civilCaseId: d.civil_case_id,
        caseDocumentId: d.case_document_id,
        attachmentUrl: d.file_url,
        request_id: reqId,
        request_text: reqText,
        documentDate: docDateRaw,
        parsedCategory: String(d.parsed_category ?? d.parsedCategory ?? ''),
        parsedSubCategory: String(d.file_name ?? d.fileName ?? d.parsed_sub_category ?? d.parsedSubCategory ?? ''),
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
        linked_documents: Array.isArray(d.linked_documents) ? d.linked_documents : [],
      };
    });
  }, [requestDocsResponse]);

  // URL deep-link 자동 열기(case_document_id)는 handleDocumentClick 정의 이후에 처리된다.

  const filteredDocuments = useMemo(() => {
    if (selectedFilter === '전체') return documents;
    if (selectedFilter === '피고측 기록') return documents.filter((d) => d.party === '피고');
    if (selectedFilter === '원고측 기록') return documents.filter((d) => d.party === '원고');
    // 법원측 기록 분류 기준이 확정되면 적용
    if (selectedFilter === '법원측 기록') return [];
    return documents;
  }, [documents, selectedFilter]);

  const monthTree = useMemo(() => {
    // 민사: 캡쳐 UI는 테이블 기반이므로 flat list로 제공한다.
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
      return {
        monthKey: mk,
        monthLabel: toMonthLabel(mk),
        nodes: docs.map((d) => ({ key: `${mk}:${d.id}`, parent: d, children: [] })),
      };
    });
  }, [filteredDocuments, isCivilMode]);

  useEffect(() => {
    if (filteredDocuments.length === 0) return;
    setExpandedParents((prev) => (prev['civil:complaint'] === undefined ? { ...prev, ['civil:complaint']: true } : prev));
  }, [filteredDocuments.length]);

  const [numPages, setNumPages] = useState<number | null>(null);
  const [pageNumber, setPageNumber] = useState(1);
  const [pdfError, setPdfError] = useState<string | null>(null);
  const [visiblePageNumber, setVisiblePageNumber] = useState(1);
  const pdfScrollContainerRef = useRef<HTMLDivElement>(null!);
  const pdfViewportRef = useRef<HTMLDivElement>(null!);
  const [pageWidth, setPageWidth] = useState<number>(800);
  const ZOOM_MIN = 50;
  const ZOOM_MAX = 200;
  const [zoomPercent, setZoomPercent] = useState<number>(100);
  const zoomScale = useMemo(() => Math.max(ZOOM_MIN, Math.min(ZOOM_MAX, zoomPercent)) / 100, [zoomPercent]);
  const [pdfLayoutVersion, setPdfLayoutVersion] = useState(0);
  const [isSelectionPanelOpen, setIsSelectionPanelOpen] = useState(true);
  const [rightPanelWidth, setRightPanelWidth] = useState(320);
  const [rightPanelTab, setRightPanelTab] = useState<'highlight' | 'memo'>('highlight');
  const [recognizingDots, setRecognizingDots] = useState('');
  const RIGHT_MIN = 340;
  const RIGHT_MAX = 640;

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
  const [isSplitModalOpen, setIsSplitModalOpen] = useState(false);

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
      // 고정 UI 오버헤드:
      // - 컨테이너 padding-x: px-3 => 24
      // - 액션 버튼: 이름변경(18) + 닫기(18) => 36
      // - 보더/호버/픽셀 반올림 여백 => 8
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
    if (!civilCaseId) {
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
  }, [civilCaseId, getRecentTabsKey]);

  // LRU 기반 탭 추가/갱신
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

  // 선택된 문서를 탭으로 노출
  useEffect(() => {
    const docId = String(selectedDocument?.caseDocumentId ?? '');
    if (!docId) return;
    const docTitle = String(selectedDocument?.title ?? '');
    upsertRecentDocTab(docId, docTitle);
  }, [selectedDocument?.caseDocumentId, selectedDocument?.title, upsertRecentDocTab]);

  useEffect(() => {
    if (!civilCaseId) return;
    try {
      localStorage.setItem(getRecentTabsKey(civilCaseId), JSON.stringify(recentDocs.slice(0, RECENT_TABS_LIMIT)));
    } catch {
      // 무시
    }
  }, [civilCaseId, getRecentTabsKey, recentDocs]);

  const clamp = (v: number, min: number, max: number) => Math.max(min, Math.min(max, v));

  const startResizeRight = useCallback(
    (e: React.PointerEvent) => {
      e.preventDefault();
      e.stopPropagation();
      const startX = e.clientX;
      const startW = rightPanelWidth;
      const onMove = (ev: PointerEvent) => {
        const dx = ev.clientX - startX;
        setRightPanelWidth(clamp(startW - dx, RIGHT_MIN, RIGHT_MAX));
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
    [rightPanelWidth],
  );

  useEffect(() => {
    setPdfLayoutVersion((v) => v + 1);
  }, [zoomScale]);

  useEffect(() => {
    const seq = ['', '.', '..', '...'];
    let i = 0;
    const t = window.setInterval(() => {
      i = (i + 1) % seq.length;
      setRecognizingDots(seq[i]);
    }, 350);
    return () => window.clearInterval(t);
  }, []);

  const { isPending: isViewCivilDocPending, onViewCivilCaseDocument } = useViewCivilCaseDocument();
  const activePdfObjectUrlRef = useRef<string | null>(null);
  const previewObjectUrlsRef = useRef<Set<string>>(new Set());

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
      const civilId = String(selectedDocument?.civilCaseId ?? civilCaseId ?? '').trim();
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

  const updatePdfPageWidth = useCallback(() => {
    const el = pdfViewportRef.current;
    if (!el) return;
    const scrollerW = pdfScrollContainerRef.current?.clientWidth ?? 0;
    const rectW = el.getBoundingClientRect().width;
    const wRaw = scrollerW > 0 ? Math.max(0, scrollerW - 32) : rectW;
    if (!(wRaw > 0)) return;
    const maxW = isSelectionPanelOpen ? 900 : 1400;
    const next = Math.max(80, Math.min(maxW, wRaw));
    setPageWidth((prev) => (prev === next ? prev : next));
    setPdfLayoutVersion((v) => v + 1);
  }, [isSelectionPanelOpen]);

  // 보기 설정은 축약하지 않고 항상 "보기 설정"으로 표기
  const viewSettingsLabel = '보기 설정';
  const viewSettingsBtnWidthPx = 114.5;
  const viewSettingsBtnPaddingClass = 'px-3';

  const [moreMenuOpen, setMoreMenuOpen] = useState(false);
  const moreBtnRef = useRef<HTMLSpanElement | null>(null);
  const moreMenuRef = useRef<HTMLDivElement | null>(null);
  const [moreMenuPos, setMoreMenuPos] = useState<{ left: number; top: number } | null>(null);

  const updateMoreMenuPos = useCallback(() => {
    const el = moreBtnRef.current;
    if (!el) return;
    const rect = el.getBoundingClientRect();
    const menuW = 184;
    // 트리거(목록 아이콘) 바로 아래에서 열리도록 좌측 정렬
    const left = Math.max(8, Math.min(rect.left, window.innerWidth - menuW - 8));
    const top = Math.max(8, rect.bottom + 4);
    setMoreMenuPos({ left, top });
  }, []);

  useLayoutEffect(() => {
    if (!moreMenuOpen) return;
    updateMoreMenuPos();
    window.addEventListener('resize', updateMoreMenuPos);
    window.addEventListener('scroll', updateMoreMenuPos, true);
    return () => {
      window.removeEventListener('resize', updateMoreMenuPos);
      window.removeEventListener('scroll', updateMoreMenuPos, true);
    };
  }, [moreMenuOpen, updateMoreMenuPos]);

  useEffect(() => {
    if (!moreMenuOpen) return;
    const onDown = (e: MouseEvent) => {
      const btn = moreBtnRef.current;
      const menu = moreMenuRef.current;
      if (btn && e.target instanceof Node && btn.contains(e.target)) return;
      if (menu && e.target instanceof Node && menu.contains(e.target)) return;
      setMoreMenuOpen(false);
    };
    document.addEventListener('mousedown', onDown);
    return () => document.removeEventListener('mousedown', onDown);
  }, [moreMenuOpen]);

  const downloadSelectedDocument = useCallback(async () => {
    const docId = String(selectedDocument?.caseDocumentId ?? '').trim();
    if (!docId) {
      onMessageToast({ message: '문서를 선택해주세요.' });
      return;
    }
    try {
      const res = await fetchDownloadDocument({ case_document_id: docId });
      const blob = (res as any)?.data as Blob;
      if (!blob) throw new Error('empty blob');
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = String(selectedDocument?.title ?? 'document');
      a.rel = 'noopener noreferrer';
      document.body.appendChild(a);
      a.click();
      a.remove();
      window.setTimeout(() => URL.revokeObjectURL(url), 1000);
    } catch (e) {
      console.error(e);
      onMessageToast({ message: '원본 다운로드에 실패했습니다.' });
    }
  }, [selectedDocument?.caseDocumentId, selectedDocument?.title]);

  const openRequestMessagesForSelected = useCallback(() => {
    const reqId = String((selectedDocument as any)?.request_id ?? (selectedDocument as any)?.requestId ?? '').trim();
    const rowCivilCaseId = String((selectedDocument as any)?.civilCaseId ?? civilCaseId ?? '').trim();
    if (!rowCivilCaseId || !reqId) {
      onMessageToast({ message: '요청 정보를 찾을 수 없습니다.' });
      return;
    }
    const qs = new URLSearchParams();
    qs.set('civil_case_id', rowCivilCaseId);
    qs.set('tab', 'client_request');
    qs.set('evidence_request_id', reqId);
    const w = window.open(`/case-list?${qs.toString()}`, '_blank', 'noopener,noreferrer');
    if (!w) onMessageToast({ message: '팝업 차단이 활성화되어 있습니다. 팝업 차단을 해제해주세요.' });
  }, [civilCaseId, selectedDocument]);

  useLayoutEffect(() => {
    const el = pdfViewportRef.current;
    if (!el) return;
    let raf: number | null = null;
    const scheduleUpdate = () => {
      if (raf !== null) return;
      raf = window.requestAnimationFrame(() => {
        raf = null;
        updatePdfPageWidth();
      });
    };
    scheduleUpdate();
    requestAnimationFrame(() => scheduleUpdate());
    window.setTimeout(scheduleUpdate, 120);
    const ro = new ResizeObserver(() => scheduleUpdate());
    ro.observe(el);
    window.addEventListener('resize', scheduleUpdate);
    return () => {
      window.removeEventListener('resize', scheduleUpdate);
      ro.disconnect();
      if (raf !== null) cancelAnimationFrame(raf);
    };
  }, [updatePdfPageWidth, selectedDocument?.pdfUrl, rightPanelWidth, isSelectionPanelOpen]);

  const [isDragging, setIsDragging] = useState(false);
  const [dragStart, setDragStart] = useState({ x: 0, y: 0 });
  const [dragEnd, setDragEnd] = useState({ x: 0, y: 0 });
  const [selection, setSelection] = useState<{ x: number; y: number; width: number; height: number } | null>(null);
  const [liveSnappedBounds, setLiveSnappedBounds] = useState<{ x: number; y: number; width: number; height: number } | null>(null);
  const [savedSelections, setSavedSelections] = useState<TSelection[]>([]);
  const [creatingSelectionId, setCreatingSelectionId] = useState<number | null>(null);
  const [currentSelectionId, setCurrentSelectionId] = useState<number | null>(null);
  const [isPanelSelectionActive, setIsPanelSelectionActive] = useState(false);
  const [_paletteOpenForId, setPaletteOpenForId] = useState<number | null>(null);
  const selectionPanelScrollRef = useRef<HTMLDivElement | null>(null);
  const [_actionBarPos, setActionBarPos] = useState<{ left: number; top: number } | null>(null);
  const pageContainerRefs = useRef<Record<number, HTMLDivElement | null>>({});
  const activePageContainerRef = useRef<HTMLDivElement | null>(null);
  const activePageNumberRef = useRef<number>(1);
  const selectionIdCounter = useRef(0);
  const SELECTION_PADDING = 4;

  const HIGHLIGHT_COLORS = useMemo(
    () => [
      { key: 'yellow', hex: '#FEF9C3', border: '#FACC15' },
      { key: 'cream', hex: '#FFEDD5', border: '#F97316' },
      { key: 'pink', hex: '#FCE7F3', border: '#EC4899' },
      { key: 'green', hex: '#ECFCCB', border: '#84CC16' },
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

  const isNormalizedCoordinate = useCallback((parts: number[]) => {
    return parts.every((v) => v >= -0.01 && v <= 1.01);
  }, []);

  const legacyPxBaseByPageRef = useRef<Record<number, { w: number; h: number }>>({});

  const normalizeCoordinateFromSelection = useCallback(
    (sel: TSelection): string => {
      const pageEl = pageContainerRefs.current[sel.page];
      const w = pageEl?.clientWidth ?? 0;
      const h = pageEl?.clientHeight ?? 0;
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

  const captureClippingRegionFile = useCallback(
    async (sel: TSelection): Promise<File | null> => {
      const page = sel.page;
      const pageEl = pageContainerRefs.current[page];
      if (!pageEl) return null;
      const canvas = pageEl.querySelector('canvas') as HTMLCanvasElement | null;
      if (!canvas) return null;
      const scaleX = canvas.width / Math.max(1, pageEl.clientWidth);
      const scaleY = canvas.height / Math.max(1, pageEl.clientHeight);
      const sx = Math.max(0, Math.floor(sel.left * scaleX));
      const sy = Math.max(0, Math.floor(sel.top * scaleY));
      const sw = Math.max(1, Math.floor((sel.right - sel.left) * scaleX));
      const sh = Math.max(1, Math.floor((sel.bottom - sel.top) * scaleY));
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
    (c: any): { left: number; top: number; right: number; bottom: number } | null => {
      const parts = parseCoordinateParts(c.coordinate ?? '');
      if (!parts) return null;
      const [a, b, d, e] = parts;
      if (!isNormalizedCoordinate(parts)) {
        const page = c.page_number ?? 1;
        const pageEl = pageContainerRefs.current[page];
        const w = pageEl?.clientWidth ?? 0;
        const h = pageEl?.clientHeight ?? 0;
        const base = legacyPxBaseByPageRef.current[page];
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

  const { response: loginUserInfo } = useFindUserInfo();
  const projectIdForMembers = selectedDocument?.projectId ?? '';
  const { response: projectMembersResponse, refetch: refetchProjectMembers } = useFindProjectMembers({
    projectId: projectIdForMembers,
    enabled: false,
  });

  // ! "보기 설정" (멤버 보기 필터) - 클리핑 목록 필터에 사용
  // - mode=all  : creatorIds 미전달(전체)
  // - mode=custom: "id1,id2,..." 전달
  // - mode=none : API 호출하지 않고 빈 목록으로 처리
  const [viewSelectionMode, setViewSelectionMode] = useState<'all' | 'none' | 'custom'>('all');
  const [viewMemberSelection, setViewMemberSelection] = useState<Set<string>>(new Set());
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
    civilCaseId: civilCaseId ?? null,
    caseDocumentId: selectedDocument?.caseDocumentId ?? null,
    creatorIds: creatorIdsParam,
    page: 1,
    limit: 40,
    enabled: viewSelectionMode !== 'none',
  });

  type TClippingItem = TGetClippingListOutput['data']['results'][number];
  const clippings = useMemo<TClippingItem[]>(() => {
    // 전체 해제 상태면 빈 목록 표시
    if (viewSelectionMode === 'none') return [];
    const d = (clippingListResponse as any)?.data;
    if (!d) return [];
    if (Array.isArray(d)) return d.flatMap((x: any) => x?.results ?? []);
    return (d?.results ?? []) as TClippingItem[];
  }, [clippingListResponse, viewSelectionMode]);

  const [activeClipHighlight, setActiveClipHighlight] = useState<TClipHighlight | null>(null);
  const [openClippingMenuId, setOpenClippingMenuId] = useState<string | null>(null);
  const clippingMenuRef = useRef<HTMLDivElement | null>(null);
  const [openClippingTagMenuId, setOpenClippingTagMenuId] = useState<string | null>(null);
  const clippingTagMenuRef = useRef<HTMLDivElement | null>(null);
  const [openClippingColorMenuId, setOpenClippingColorMenuId] = useState<string | null>(null);
  const clippingColorMenuRef = useRef<HTMLDivElement | null>(null);
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
  const [mentionDropdownPos, setMentionDropdownPos] = useState<any>(null);

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

  useEffect(() => {
    if (!activeMemoInputClippingId) return;
    requestAnimationFrame(() => memoInputRef.current?.focus());
  }, [activeMemoInputClippingId]);

  useEffect(() => {
    setMentionQuery('');
    setIsMentionOpen(false);
    setMentionedUserIdsDraft([]);
  }, [activeMemoInputClippingId]);

  const projectMembers = useMemo(() => {
    const list = (projectMembersResponse as any)?.data?.members;
    return Array.isArray(list) ? list : [];
  }, [projectMembersResponse]);

  // ! 보기 설정 드롭다운 위치/헬퍼
  const BUCKET_BASE_URL = 'https://kr.object.ncloudstorage.com/ailex/';
  const normalizeMediaUrl = useCallback((rawUrl?: string | null) => {
    let url = String(rawUrl ?? '').trim();
    if (!url) return '';
    // http(s):// 가 여러 번 중복된 경우 마지막 유효한 URL만 추출
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
  }, []);

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
      return String(m?.name ?? m?.nickname ?? m?.nickName ?? '');
    },
    [loginUserInfo?.data?.user_id],
  );
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
    const menuMinW = 195;
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
  const isAllViewSelected = useMemo(() => viewSelectionMode === 'all', [viewSelectionMode]);
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
        if (viewSelectionMode === 'all') {
          next.clear();
          for (const id of allMemberIds) next.add(id);
        }
        if (viewSelectionMode === 'none') {
          next.clear();
        }
        if (next.has(memberId)) next.delete(memberId);
        else next.add(memberId);
        if (next.size === 0) {
          setViewSelectionMode('none');
          return next;
        }
        if (allMemberIds.length > 0 && allMemberIds.every((id) => next.has(id))) {
          setViewSelectionMode('all');
          return new Set();
        }
        setViewSelectionMode('custom');
        return next;
      });
    },
    [allMemberIds, viewSelectionMode],
  );

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

  const filteredMentionMembers = useMemo(() => {
    const q = mentionQuery.trim();
    const meId = String(loginUserInfo?.data?.user_id ?? '');
    return (projectMembers as any[])
      .filter((m) => {
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
  }, [mentionQuery, projectMembers, loginUserInfo?.data?.user_id]);

  const computeMentionDropdownPos = useCallback(() => {
    const input = memoInputRef.current;
    if (!input) return;
    const rect = input.getBoundingClientRect();
    const rowCount = Math.max(filteredMentionMembers.length, 1);
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

  const formatRelativeTime = (iso?: string | null) => {
    if (!iso) return '';
    const t = new Date(iso).getTime();
    if (!Number.isFinite(t)) return '';
    const diff = Date.now() - t;
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

  const resolveClippingColor = useCallback(
    (raw?: string) => {
      if (!raw) return { fillHex: '#FFEDD5', borderHex: '#F97316' };
      const s = String(raw).trim();
      const byKey = HIGHLIGHT_COLORS.find((h) => h.key === s);
      if (byKey) return { fillHex: byKey.hex, borderHex: byKey.border };
      const byBorder = HIGHLIGHT_COLORS.find((h) => h.border.toLowerCase() === s.toLowerCase());
      if (byBorder) return { fillHex: byBorder.hex, borderHex: byBorder.border };
      const byHex = HIGHLIGHT_COLORS.find((h) => h.hex.toLowerCase() === s.toLowerCase());
      if (byHex) return { fillHex: byHex.hex, borderHex: byHex.border };
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

  useEffect(() => {
    if (!selectedDocument?.caseDocumentId) return;
    setSavedSelections((prev) => {
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
    parseCoordinateParts,
    resolveClippingColor,
    resolveCoordinateToPx,
    selectedDocument?.caseDocumentId,
    numPages,
    pdfLayoutVersion,
  ]);

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
  }, [clippings, clippingColorOverrides, activeClipHighlight, getClippingColorKey, resolveClippingColor]);

  const buildUpdateInputFromClipping = useCallback(
    (
      c: (typeof clippings)[number],
      patch: Partial<{ comment: string; initial_note: string; tags: string[]; color: string; clippingType: string }>,
    ) => {
      const tags = patch.tags ?? getClippingTags(c);
      const color = patch.color ?? getClippingColorKey(c);
      const comment = patch.comment ?? c.comment ?? '';
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

  const handleDeleteClipping = async (c: (typeof clippings)[number]) => {
    const res = await onDeleteClipping({ clipping_id: c.clipping_id });
    if (res?.success) {
      onMessageToast({ message: '삭제되었습니다.' });
      refetchClippings();
      setSavedSelections((prev) => prev.filter((sel) => sel.clippingId !== c.clipping_id));
      if (activeClipHighlight && activeClipHighlight.clippingId === c.clipping_id) {
        setActiveClipHighlight(null);
      }
    }
    setOpenClippingMenuId(null);
    setOpenClippingTagMenuId(null);
  };

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
      if (!isSelectionPanelOpen) setIsSelectionPanelOpen(true);
      const officeId = loginUserInfo?.data?.office_id;
      const doc = selectedDocument;
      if (!officeId || !doc?.caseDocumentId) return null;
      if (sel.clippingId) return sel.clippingId;
      setCreatingSelectionId(sel.id);
      const coordinate = normalizeCoordinateFromSelection(sel);
      const colorKey = opts?.color ?? HIGHLIGHT_COLORS.find((h) => h.hex === sel.color)?.key ?? 'yellow';
      try {
        let file: File | null = null;
        let previewUrl: string | undefined = undefined;
        try {
          file = await captureClippingRegionFile(sel);
          if (file && typeof URL !== 'undefined') {
            previewUrl = URL.createObjectURL(file);
            previewObjectUrlsRef.current.add(previewUrl);
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
          if (serverImageUrl) {
            setSavedSelections((prev) => prev.map((s) => (s.id === sel.id ? { ...s, previewImageUrl: serverImageUrl } : s)));
          }
          onMessageToast({ message: '하이라이트가 생성되었습니다.' });
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
    ],
  );

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
    const selectionRect = { left: x, top: y, right: x + width, bottom: y + height };
    const textSpans = textLayer.querySelectorAll('span');
    const parentBounds = { left: Infinity, top: Infinity, right: -Infinity, bottom: -Infinity };
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

  const dragEndRef = useRef({ x: 0, y: 0 });
  const animationFrameRef = useRef<number | null>(null);

  const handleMouseDown = (e: React.MouseEvent, pageNum: number) => {
    const pageEl = pageContainerRefs.current[pageNum];
    if (!pageEl) return;
    e.preventDefault();
    e.stopPropagation();
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
    dragEndRef.current = { x, y };
    setSelection(null);
    setLiveSnappedBounds(null);
  };

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
      dragEndRef.current = { x, y };
      if (animationFrameRef.current === null) {
        animationFrameRef.current = requestAnimationFrame(() => {
          setDragEnd(dragEndRef.current);
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
        const selectionRect = { left: x, top: y, right: x + width, bottom: y + height };
        const textSpans = textLayer.querySelectorAll('span');
        const selectedTexts: Array<{ text: string; rect: { left: number; top: number; right: number; bottom: number } }> = [];
        const parentBounds = { left: Infinity, top: Infinity, right: -Infinity, bottom: -Infinity };
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
            selectedTexts.push({ text: span.textContent, rect: relativeRect });
            parentBounds.left = Math.min(parentBounds.left, relativeRect.left);
            parentBounds.top = Math.min(parentBounds.top, relativeRect.top);
            parentBounds.right = Math.max(parentBounds.right, relativeRect.right);
            parentBounds.bottom = Math.max(parentBounds.bottom, relativeRect.bottom);
          }
        });
        if (selectedTexts.length > 0) {
          setSelection({
            x: parentBounds.left - SELECTION_PADDING,
            y: parentBounds.top - SELECTION_PADDING,
            width: parentBounds.right - parentBounds.left + SELECTION_PADDING * 2,
            height: parentBounds.bottom - parentBounds.top + SELECTION_PADDING * 2,
          });
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
          setCurrentSelectionId(newSelection.id);
          setIsPanelSelectionActive(true);
          setActionBarPos(null);
          requestAnimationFrame(() => {
            const pageEl = pageContainerRefs.current[newSelection.page];
            if (!pageEl) return;
            const rect = pageEl.getBoundingClientRect();
            setActionBarPos({ left: rect.left + newSelection.left, top: rect.top + newSelection.bottom + 8 });
          });
          void createClippingFromSelection(newSelection, { notes: '', tags: [], clippingType: 'OTHER' });
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
          setCurrentSelectionId(newSelection.id);
          setIsPanelSelectionActive(true);
          setActionBarPos(null);
          requestAnimationFrame(() => {
            const pageEl = pageContainerRefs.current[newSelection.page];
            if (!pageEl) return;
            const rect = pageEl.getBoundingClientRect();
            setActionBarPos({ left: rect.left + newSelection.left, top: rect.top + newSelection.bottom + 8 });
          });
          void createClippingFromSelection(newSelection, { notes: '', tags: [], clippingType: 'OTHER' });
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
        setCurrentSelectionId(newSelection.id);
        setIsPanelSelectionActive(true);
        setActionBarPos(null);
        requestAnimationFrame(() => {
          const pageEl = pageContainerRefs.current[newSelection.page];
          if (!pageEl) return;
          const rect = pageEl.getBoundingClientRect();
          setActionBarPos({ left: rect.left + newSelection.left, top: rect.top + newSelection.bottom + 8 });
        });
        void createClippingFromSelection(newSelection, { notes: '', tags: [], clippingType: 'OTHER' });
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
  }, [createClippingFromSelection, dragStart, isDragging, DEFAULT_HIGHLIGHT_BORDER, DEFAULT_HIGHLIGHT_COLOR]);

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

  const currentSelection = useMemo(() => {
    if (!currentSelectionId) return null;
    return savedSelections.find((s) => s.id === currentSelectionId) || null;
  }, [currentSelectionId, savedSelections]);

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
    return { left: x, top: y, width, height };
  }, [isDragging, selection, dragStart, dragEnd, liveSnappedBounds]);

  const updateActionBarPos = useCallback(() => {
    if (!currentSelection || isDragging || !isPanelSelectionActive) {
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
  }, [currentSelection, isDragging, isPanelSelectionActive]);

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

  const scrollToClipping = useCallback(
    (c: (typeof clippings)[number]) => {
      const scroller = pdfScrollContainerRef.current;
      const page = c.page_number ?? 1;
      const pageEl = pageContainerRefs.current[page];
      if (!scroller || !pageEl) return;
      const px = resolveCoordinateToPx(c);
      const containerRect = scroller.getBoundingClientRect();
      const pageRect = pageEl.getBoundingClientRect();
      const pageTopInScroller = pageRect.top - containerRect.top;
      const targetTopInScroller = pageTopInScroller + (px?.top ?? 0);
      const nextTop = scroller.scrollTop + targetTopInScroller - 120;
      scroller.scrollTo({ top: Math.max(0, nextTop), behavior: 'smooth' });
      if (px) {
        const { fillHex, borderHex } = resolveClippingColor(getClippingColorKey(c));
        setActiveClipHighlight({
          clippingId: c.clipping_id,
          page,
          left: px.left,
          top: px.top,
          right: px.right,
          bottom: px.bottom,
          fillHex,
          borderHex,
        });
      }
    },
    [getClippingColorKey, resolveClippingColor, resolveCoordinateToPx],
  );

  const _removeSelection = useCallback(
    (id: number) => {
      setSavedSelections((prev) => prev.filter((item) => item.id !== id));
      if (currentSelectionId === id) {
        setCurrentSelectionId(null);
        setIsPanelSelectionActive(false);
      }
    },
    [currentSelectionId],
  );

  useEffect(() => {
    const rootEl = pdfScrollContainerRef.current;
    if (!rootEl) return;
    if (!selectedDocument?.pdfUrl || !numPages) return;
    const computeVisiblePage = () => {
      const anchor = rootEl.scrollTop + 8;
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
    if (!civilCaseId) return;
    const docId = String(selectedDocument?.caseDocumentId ?? '');
    if (!docId) return;
    try {
      localStorage.setItem(getDocPageKey(civilCaseId, docId), String(visiblePageNumber));
    } catch {
      // 무시
    }
  }, [civilCaseId, getDocPageKey, selectedDocument?.caseDocumentId, visiblePageNumber]);

  // 탭 클릭/문서 재오픈 시: 마지막으로 보던 페이지로 복원
  useEffect(() => {
    if (!pendingRestorePage) return;
    if (!selectedDocument?.caseDocumentId) return;
    if (pendingRestorePage.caseDocumentId !== String(selectedDocument.caseDocumentId)) return;
    if (!selectedDocument.pdfUrl || !numPages) return;
    const page = Math.max(1, Math.min(numPages, pendingRestorePage.page));

    requestAnimationFrame(() => scrollToPage(page));
    window.setTimeout(() => scrollToPage(page), 60);

    setPendingRestorePage(null);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [numPages, pendingRestorePage, selectedDocument?.caseDocumentId, selectedDocument?.pdfUrl]);

  useEffect(() => {
    return () => {
      if (activePdfObjectUrlRef.current) {
        URL.revokeObjectURL(activePdfObjectUrlRef.current);
        activePdfObjectUrlRef.current = null;
      }
    };
  }, []);

  const onDocumentLoadSuccess = ({ numPages: totalPages }: { numPages: number }) => {
    setNumPages(totalPages);
    setVisiblePageNumber(1);
    setPdfError(null);
  };

  const onDocumentLoadError = (error: Error) => {
    console.error('PDF 로드 오류:', error);
    setPdfError('PDF를 불러올 수 없습니다');
  };

  const pdfOptions = useMemo(
    () => ({
      cMapUrl: `https://unpkg.com/pdfjs-dist@${pdfjs.version}/cmaps/`,
      cMapPacked: true,
    }),
    [],
  );

  const pdfCenterOffsetPx = 0;

  const handleDocumentClick = useCallback(
    async (doc: any) => {
      const d = doc as TDocumentItem;

      // OCR 미완료 문서는 열 수 없음 (COMPLETED만 허용)
      const _ocrStatus = String(d.ocrStatus ?? '')
        .toUpperCase()
        .trim();
      if (_ocrStatus && _ocrStatus !== 'COMPLETED') {
        onMessageToast({ message: 'OCR 중입니다. 완료 후 가능합니다.' });
        return;
      }
      // 테스트11
      const samplePdfUrl = `${window.location.origin}/list.pdf`;
      setSelectedDocument({ ...d, pdfUrl: undefined });
      setPageNumber(1);
      setVisiblePageNumber(1);
      setPdfError(null);
      setNumPages(null);
      setSavedSelections([]);
      setSelection(null);
      setCurrentSelectionId(null);
      setIsPanelSelectionActive(false);
      setActionBarPos(null);
      setActiveClipHighlight(null);
      setPanelEditClippingId(null);
      setOpenClippingMenuId(null);
      setOpenClippingTagMenuId(null);
      setOpenClippingColorMenuId(null);
      setOpenMemoMenuId(null);
      setActiveMemoInputClippingId(null);
      setMemoInputDraft('');
      setClippingTagOverrides({});
      setClippingColorOverrides({});
      setPaletteOpenForId(null);

      if (d.projectId && (civilCaseId || d.civilCaseId) && d.caseDocumentId) {
        const blob = await onViewCivilCaseDocument({
          project_id: d.projectId,
          civil_case_id: civilCaseId || d.civilCaseId || '',
          case_document_id: d.caseDocumentId,
          doc_type: 'pdf',
        });

        if (!blob) {
          setPdfError('PDF를 불러올 수 없습니다.');
          setSelectedDocument((prev) => (prev ? { ...prev, pdfUrl: samplePdfUrl } : prev));
          return;
        }

        if (activePdfObjectUrlRef.current) {
          URL.revokeObjectURL(activePdfObjectUrlRef.current);
          activePdfObjectUrlRef.current = null;
        }

        const objectUrl = URL.createObjectURL(blob);
        activePdfObjectUrlRef.current = objectUrl;
        setSelectedDocument((prev) => (prev ? { ...prev, pdfUrl: objectUrl } : prev));
        return;
      }

      setSelectedDocument((prev) => (prev ? { ...prev, pdfUrl: samplePdfUrl } : prev));
    },
    [civilCaseId, onViewCivilCaseDocument],
  );

  // URL에서 case_document_id로 진입한 경우: 자료 목록 로드 후 "클릭한 것처럼" 문서를 열어준다.
  // (현재 페이지에 없으면 다음 페이지로 넘기며 찾는다)
  const initialCaseDocumentId = useMemo(() => String(searchParams.get('case_document_id') ?? '').trim(), [searchParams]);
  const autoOpenedCaseDocumentIdRef = useRef<string>('');
  const autoOpenPagingRef = useRef<{ lastRequestedId: string; lastRequestedPage: number } | null>(null);
  const autoOpenPrimedRef = useRef<{ id: string; primed: boolean }>({ id: '', primed: false });
  useEffect(() => {
    if (!initialCaseDocumentId) return;
    if (autoOpenedCaseDocumentIdRef.current === initialCaseDocumentId) return;

    // 1) 현재 페이지에서 문서 탐색
    const target = documents.find((d) => String(d.caseDocumentId ?? '') === initialCaseDocumentId) ?? null;
    if (target) {
      autoOpenedCaseDocumentIdRef.current = initialCaseDocumentId;
      void handleDocumentClick(target);
      return;
    }

    // 2) 더 큰 페이지 크기로 쿼리를 한 번 실행해 대상 문서 포함 가능성 높임 → 행 강조 유지 + 뷰어 열기
    if (documents.length > 0) {
      const primed = autoOpenPrimedRef.current;
      if (primed.id !== initialCaseDocumentId) autoOpenPrimedRef.current = { id: initialCaseDocumentId, primed: false };
      const shouldPrime = !autoOpenPrimedRef.current.primed && Number(civilListQuery?.limit ?? 20) < 200;
      if (shouldPrime) {
        autoOpenPrimedRef.current.primed = true;
        setCivilListQuery((prev) => ({
          ...prev,
          page: 1,
          limit: 200,
        }));
        return;
      }
    }

    // 3) 문서를 못 찾으면 페이지를 넘기며 탐색 (페이지 끝까지)
    const pages = Number(civilPagination?.pages ?? 1);
    const curPage = Number(civilListQuery?.page ?? 1);
    if (!Number.isFinite(pages) || pages <= 1) return;
    if (!Number.isFinite(curPage) || curPage >= pages) return;

    const last = autoOpenPagingRef.current;
    if (last && last.lastRequestedId === initialCaseDocumentId && last.lastRequestedPage === curPage) return;
    autoOpenPagingRef.current = { lastRequestedId: initialCaseDocumentId, lastRequestedPage: curPage };

    setCivilListQuery((prev) => ({
      ...prev,
      // keep higher limit once we're deep-linking to reduce paging hops
      limit: Math.max(200, Number(prev.limit ?? 20)),
      page: Math.min(pages, Number(prev.page ?? 1) + 1),
    }));
  }, [civilListQuery?.limit, civilListQuery?.page, civilPagination?.pages, documents, handleDocumentClick, initialCaseDocumentId]);

  const openRecentDocTab = (caseDocumentId: string) => {
    const targetId = String(caseDocumentId ?? '');
    if (!targetId) return;

    // 이미 열려있는 문서 탭이면: pending restore로 페이지 복원만 수행
    if (String(selectedDocument?.caseDocumentId ?? '') === targetId) {
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

  return (
    <div className='flex h-screen flex-col overflow-hidden bg-[#f4f4f5] pb-[10px] pr-[10px] pt-[50px]'>
      <div className='flex min-h-0 w-full min-w-0 flex-1 justify-center overflow-hidden rounded-[16px] border border-[#D4D4D8] bg-white'>
        <div className='flex min-h-0 min-w-0 flex-1'>
          <div className='flex h-full min-w-0 flex-1 flex-col'>
            <div className='flex min-h-0 min-w-0 flex-1'>
              {!selectedDocument ? (
                <div className='flex w-full'>
                  <RequestDocumentListPanel
                    title={title}
                    selectedFilter={selectedFilter}
                    setSelectedFilter={setSelectedFilter}
                    isCivilMode={true}
                    isLoading={isCivilDocListLoading}
                    monthTree={monthTree as any}
                    expandedParents={expandedParents}
                    toggleParent={toggleParent}
                    handleDocumentClick={handleDocumentClick}
                    selectedDocument={selectedDocument}
                    showRecordSearchInput={true}
                    hideBottomFloatingMenu={true}
                    onRequestOpenRightPanelTab={(tab) => {
                      setRightPanelTab(tab);
                      setIsSelectionPanelOpen(true);
                    }}
                    onRequestOpenSplitModal={() => setIsSplitModalOpen(true)}
                    civilListQuery={civilListQuery as any}
                    civilPagination={civilPagination}
                    onRenamedCaseDocumentTitle={(caseDocumentId, nextTitle) => {
                      setRecentDocs((prev) =>
                        prev.map((t) => (String(t.caseDocumentId ?? '') === String(caseDocumentId) ? { ...t, title: nextTitle } : t)),
                      );
                      setSelectedDocument((prev) => {
                        const prevId = String(prev?.caseDocumentId ?? '');
                        if (!prev || prevId !== String(caseDocumentId)) return prev;
                        return { ...prev, title: nextTitle, parsed_sub_category: nextTitle, parsedSubCategory: nextTitle };
                      });
                    }}
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
                      if (!civilCaseId) {
                        onMessageToast({ message: '민사 사건에서만 업로드할 수 있습니다.' });
                        return;
                      }
                      setIsUploadModalOpen(true);
                    }}
                  />
                </div>
              ) : (
                <>
                  <Resizable
                    size={{ width: leftPanelWidth, height: '100%' }}
                    minWidth={360}
                    maxWidth={720}
                    enable={{ right: true }}
                    className='flex h-full min-w-0 flex-col border-r border-[#D4D4D8] bg-white'
                    onResizeStop={(_e, _dir, ref) => {
                      setLeftPanelWidth(ref.offsetWidth);
                    }}
                  >
                    <RequestDocumentListPanel
                      title={title}
                      selectedFilter={selectedFilter}
                      setSelectedFilter={setSelectedFilter}
                      isCivilMode={true}
                      isLoading={isCivilDocListLoading}
                      monthTree={monthTree as any}
                      expandedParents={expandedParents}
                      toggleParent={toggleParent}
                      handleDocumentClick={handleDocumentClick}
                      selectedDocument={selectedDocument}
                      showRecordSearchInput={true}
                      hideBottomFloatingMenu={true}
                      onRequestOpenRightPanelTab={(tab) => {
                        setRightPanelTab(tab);
                        setIsSelectionPanelOpen(true);
                      }}
                      onRequestOpenSplitModal={() => setIsSplitModalOpen(true)}
                      civilListQuery={civilListQuery as any}
                      civilPagination={civilPagination}
                      onRenamedCaseDocumentTitle={(caseDocumentId, nextTitle) => {
                        setRecentDocs((prev) =>
                          prev.map((t) => (String(t.caseDocumentId ?? '') === String(caseDocumentId) ? { ...t, title: nextTitle } : t)),
                        );
                        setSelectedDocument((prev) => {
                          const prevId = String(prev?.caseDocumentId ?? '');
                          if (!prev || prevId !== String(caseDocumentId)) return prev;
                          return { ...prev, title: nextTitle, parsed_sub_category: nextTitle, parsedSubCategory: nextTitle };
                        });
                      }}
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
                        if (!civilCaseId) {
                          onMessageToast({ message: '민사 사건에서만 업로드할 수 있습니다.' });
                          return;
                        }
                        setIsUploadModalOpen(true);
                      }}
                    />
                  </Resizable>

                  <div className='flex min-w-0 flex-1 overflow-hidden bg-[#E3EAF2]'>
                    <div className='flex min-w-0 flex-1 flex-col overflow-hidden'>
                      <div className='relative flex h-[48px] border-b border-l border-[#D4D4D8] bg-white'>
                        {/* 왼쪽: PDF 헤더(탭/타이틀) 영역 */}
                        <div className='flex min-w-0 flex-1 items-end bg-white pl-1 pr-1'>
                          <div className='flex h-full min-w-0 flex-1 items-end'>
                            {recentDocs.length > 0 ? (
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
                                {selectedDocument?.title ?? '문서'}
                              </div>
                            )}
                          </div>
                        </div>

                        {/* 오른쪽: 우측 패널과 동일 폭의 헤더 영역 (우측 패널 닫힘 시 함께 닫히는 UX: 기록목록과 동일) */}
                        <div
                          className={`flex items-center justify-end gap-1 bg-white pr-[16px] ${
                            isSelectionPanelOpen ? 'border-l border-[#D4D4D8]' : ''
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

                              <HeaderIconButton
                                label='하이라이트 열기'
                                active={isSelectionPanelOpen}
                                onClick={() => {
                                  if (isSelectionPanelOpen) {
                                    setIsSelectionPanelOpen(false);
                                    requestAnimationFrame(() => updatePdfPageWidth());
                                    window.setTimeout(updatePdfPageWidth, 120);
                                  } else {
                                    setIsSelectionPanelOpen(true);
                                    requestAnimationFrame(() => updatePdfPageWidth());
                                    window.setTimeout(updatePdfPageWidth, 120);
                                  }
                                }}
                              >
                                <LayoutList className='h-[18px] w-[18px] text-[#000]' />
                              </HeaderIconButton>

                              <HeaderIconButton label='요청 메세지보기' onClick={openRequestMessagesForSelected}>
                                <MessageCircleReply className='h-[18px] w-[18px] text-[#000]' />
                              </HeaderIconButton>

                              <HeaderIconButton
                                label='간편검색'
                                onClick={() => {
                                  void openQuickSearch();
                                }}
                              >
                                <Search className='h-[18px] w-[18px] text-[#000]' />
                              </HeaderIconButton>

                              <div className='relative'>
                                <HeaderIconButton
                                  label='목록 보기'
                                  active={moreMenuOpen}
                                  onClick={() => {
                                    setMoreMenuOpen((v) => !v);
                                    requestAnimationFrame(() => updateMoreMenuPos());
                                  }}
                                >
                                  <span ref={moreBtnRef}>
                                    <MoreHorizontal className='h-[18px] w-[18px] text-[#000]' />
                                  </span>
                                </HeaderIconButton>
                              </div>

                              <HeaderIconButton
                                label='패널 닫기'
                                onClick={() => {
                                  setIsSelectionPanelOpen(false);
                                  setSelectedDocument(null);
                                  setRecentDocs([]);
                                }}
                              >
                                <X className='h-[18px] w-[18px] text-[#000]' />
                              </HeaderIconButton>

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
                                          if (viewSelectionMode === 'all') {
                                            setViewSelectionMode('none');
                                            setViewMemberSelection(new Set());
                                          } else {
                                            setViewSelectionMode('all');
                                            setViewMemberSelection(new Set());
                                          }
                                          // ensure immediate refresh
                                          requestAnimationFrame(() => refetchClippings());
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
                                          const mid = getMemberId(m);
                                          const name = getMemberName(m);
                                          const avatar = getMemberAvatar(m);
                                          const colorKey = getMemberColorKey(m);
                                          const colorHex = colorKey ? getUserColor(colorKey) : '#E4E4E7';
                                          const checked = isMemberChecked(mid);
                                          if (!mid || !name) return null;
                                          return (
                                            <button
                                              key={mid}
                                              type='button'
                                              className='flex h-[32px] w-full items-center justify-between px-3 text-left hover:bg-[#F4F4F5]'
                                              onClick={() => {
                                                toggleMember(mid);
                                                requestAnimationFrame(() => refetchClippings());
                                              }}
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

                              {moreMenuOpen && moreMenuPos && typeof document !== 'undefined'
                                ? createPortal(
                                    <div
                                      ref={moreMenuRef}
                                      className='fixed z-[2147483647] box-border h-[100px] w-[184px] overflow-hidden rounded-[16px] border border-[#E4E4E7] bg-white p-[2px] shadow-xl'
                                      style={{ left: moreMenuPos.left, top: moreMenuPos.top }}
                                    >
                                      <button
                                        type='button'
                                        className='flex h-[32px] w-full items-center gap-2 rounded-[12px] px-3 text-left text-[14px] font-medium text-[#09090B] hover:bg-[#F4F4F5]'
                                        onClick={() => {
                                          setMoreMenuOpen(false);
                                          const docId = String(selectedDocument?.caseDocumentId ?? '').trim();
                                          if (!docId) return;
                                          setRenameTarget({ caseDocumentId: docId, initialTitle: String(selectedDocument?.title ?? '') });
                                        }}
                                      >
                                        <Pencil className='h-[18px] w-[18px] text-[#09090B]' />
                                        이름 바꾸기
                                      </button>
                                      <button
                                        type='button'
                                        className='flex h-[32px] w-full items-center gap-2 rounded-[12px] px-3 text-left text-[14px] font-medium text-[#09090B] hover:bg-[#F4F4F5]'
                                        onClick={() => {
                                          setMoreMenuOpen(false);
                                          void downloadSelectedDocument();
                                        }}
                                      >
                                        <Download className='h-[18px] w-[18px] text-[#09090B]' />
                                        원본 다운로드
                                      </button>
                                      <button
                                        type='button'
                                        className='flex h-[32px] w-full items-center gap-2 rounded-[12px] px-3 text-left text-[14px] font-medium text-[#09090B] hover:bg-[#F4F4F5]'
                                        onClick={() => {
                                          setMoreMenuOpen(false);
                                          setIsSplitModalOpen(true);
                                        }}
                                      >
                                        <FoldVertical className='h-[18px] w-[18px] text-[#09090B]' />
                                        문서 분리
                                      </button>
                                    </div>,
                                    document.body,
                                  )
                                : null}
                            </>
                          ) : null}
                        </div>
                      </div>

                      <div className='relative flex min-h-0 flex-1 items-stretch overflow-hidden'>
                        <div className='relative min-w-0 flex-1 overflow-visible bg-[#E3EAF2]'>
                          <div
                            ref={pdfScrollContainerRef}
                            className={`evi-scrollbar-hide h-full overflow-auto p-4 ${isQuickSearchOpen ? 'relative z-[2147480500]' : ''}`}
                          >
                            <div
                              ref={pdfViewportRef}
                              className='mx-auto flex w-full justify-center'
                              style={{ transform: `translateX(${pdfCenterOffsetPx}px)`, willChange: 'transform' }}
                            >
                              {selectedDocument?.pdfUrl ? (
                                <div className='relative w-fit overflow-visible'>
                                  {pdfError ? (
                                    <div className='flex h-[800px] items-center justify-center'>
                                      <div className='text-center'>
                                        <p className='text-lg font-medium text-red-500'>PDF를 불러올 수 없습니다</p>
                                        <p className='mt-2 text-sm text-gray-500'>{pdfError}</p>
                                      </div>
                                    </div>
                                  ) : (
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

                                              <div
                                                className='absolute inset-0 cursor-crosshair'
                                                onMouseDown={(e) => handleMouseDown(e, n)}
                                                style={{
                                                  zIndex: 10,
                                                  pointerEvents: isDragging ? 'none' : 'auto',
                                                  backgroundColor: 'transparent',
                                                }}
                                              />

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
                                            </div>
                                          ))}
                                        </div>
                                      ) : null}
                                    </Document>
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
                          </div>

                          {selectedDocument?.pdfUrl && numPages ? (
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
                          {/* 전체 자료에서는 하단 플로팅 버튼(FloatingActionBar)을 노출하지 않음 */}
                        </div>

                        {isSelectionPanelOpen ? (
                          <RequestRightSidebarPanel
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
                            panelClassName=''
                            onResizeStartLeft={startResizeRight}
                            selectionPanelScrollRef={selectionPanelScrollRef}
                            panelEditCardRef={panelEditCardRef}
                            clippingMenuRef={clippingMenuRef}
                            memoMenuRef={memoMenuRef}
                            isCivilMode={true}
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
                  </div>
                </>
              )}
            </div>
          </div>
        </div>
      </div>

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
          setRecentDocs((prev) => prev.map((t) => (String(t.caseDocumentId ?? '') === docId ? { ...t, title: next } : t)));
          setSelectedDocument((prev) => (prev && String(prev.caseDocumentId ?? '') === docId ? { ...prev, title: next } : prev));
          onMessageToast({ message: '이름이 변경되었습니다.' });
          setRenameTarget(null);
        }}
      />

      <DocumentSplitModal
        isOpen={isSplitModalOpen}
        caseDocumentId={selectedDocument?.caseDocumentId ?? null}
        title={String(selectedDocument?.title ?? '')}
        pdfUrl={String(selectedDocument?.pdfUrl ?? '')}
        onClose={() => setIsSplitModalOpen(false)}
      />

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
        sourceType='CLIENT'
      />

      {/* Quick Search: dim all except PDF viewer + modal */}
      {isQuickSearchOpen && typeof document !== 'undefined'
        ? createPortal(
            <div className='fixed inset-0 z-[2147480000] bg-black/70' onClick={() => setIsQuickSearchOpen(false)} aria-hidden='true' />,
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
  );
};

export default CaseRequestDocumentListTable;
