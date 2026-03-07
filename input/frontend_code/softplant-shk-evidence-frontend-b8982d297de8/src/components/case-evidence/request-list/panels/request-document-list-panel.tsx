import { Fragment, type Dispatch, type ReactNode, type SetStateAction, useCallback, useEffect, useMemo, useRef, useState } from 'react';

import { DragDropContext, Draggable, Droppable } from '@hello-pangea/dnd';
import {
  ChevronDown,
  ChevronRight,
  Highlighter,
  MessageSquareText,
  Check,
  Minus,
  Pin,
  GripVertical,
  FilePlus,
  Search,
  Star,
  ArrowDown,
  ArrowUp,
  ListFilter,
  X,
  Eye,
  Pencil,
  Download,
  Printer,
  Link2,
  MessageCircleReply,
  MoreHorizontal,
  SquareArrowOutUpRight,
  Unlink2,
} from 'lucide-react';
import { createPortal } from 'react-dom';
import { BsStarFill } from 'react-icons/bs';

import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@components/ui';
import { fetchDownloadDocument } from '@/apis/case-api/civil-case-api';
import '@/components/evidence/table/evidence.css';
import arrowDownUpImg from '@/assets/images/arrow-down-up.svg?url';
import arrowDownImg from '@/assets/images/arrow-down.svg?url';
import arrowUpImg from '@/assets/images/arrow-up.svg?url';
import toggleButtonImg from '@/assets/images/toggle-button.svg?url';
import DocumentPagination from '@/components/case-evidence/case-detail-list/common/document-pagination';
import { CivilCaseDocumentTagPopup } from '@/components/case-evidence/case-detail-list/modal/civil-case-document-tag-popup';
import DocumentRenameModal from '@/components/case-evidence/case-detail-list/modal/document-rename-modal';
import { MatchEvidenceModal } from '@/components/case-evidence/request-list/modal/match-evidence-modal';
import { onMessageToast } from '@/components/utils/global-utils';
import {
  useBookmarkCivilCaseDocument,
  useDeleteCaseDocumentLink,
  useLinkCaseDocument,
  useMoveCivilCaseDocument,
  usePinCivilCaseDocument,
} from '@/hooks/react-query/mutation/case';
import { useCategorizeCivilCaseDocument } from '@/hooks/react-query/mutation/case/use-categorize-civil-case-document';
import { useUpdateCivilCaseDocumentFileName } from '@/hooks/react-query/mutation/case/use-update-civil-case-document-file-name';

type TDocumentListPanelProps = {
  title: string;
  selectedFilter: string;
  setSelectedFilter: Dispatch<SetStateAction<string>>;
  isCivilMode: boolean;
  isLoading?: boolean;
  monthTree: any[];
  expandedParents: Record<string, boolean>;
  toggleParent: (key: string) => void;
  handleDocumentClick: (doc: any) => void;
  selectedDocument: any;
  onClickAddRecord: () => void;
  /** CaseMainListTable: true(검색 인풋 노출) / CaseDetailListTable: false(돋보기 버튼만) */
  showRecordSearchInput?: boolean;
  /** 우측 패널을 특정 탭으로 열기(하이라이트/전체메모) */
  onRequestOpenRightPanelTab?: (tab: 'highlight' | 'memo') => void;
  /** 민사 문서 리스트 서버 정렬/필터 */
  civilListQuery?: {
    keyword?: string;
    keywordVersion?: number;
    power_search?: string;
    filters?: {
      parsed_category: string[];
      parsed_submitter_name: string[];
      tags: string[];
      bookmark: boolean;
      memo: boolean;
      clipping: boolean;
    };
    sortColumn?: 'document_date' | 'parsed_category' | 'parsed_submitter_name' | 'clipping_count' | 'memo_count' | 'bookmark_count';
    sortDirection?: 'asc' | 'desc';
    page?: number;
    limit?: number;
  };
  onChangeCivilListQuery?: (patch: Partial<NonNullable<TDocumentListPanelProps['civilListQuery']>>) => void;
  civilPagination?: {
    total: number;
    page: number;
    limit: number;
    pages: number;
  };
  onRenamedCaseDocumentTitle?: (caseDocumentId: string, nextTitle: string) => void;
  hideBottomFloatingMenu?: boolean;
  onRequestOpenSplitModal?: () => void;
};

const FilterPopup = ({
  popupTitle,
  options,
  selected,
  onApply,
  onCancel,
}: {
  popupTitle: string;
  options: { id: string; label: string }[];
  selected: string[];
  onApply: (next: string[]) => void;
  onCancel: () => void;
}) => {
  const [temp, setTemp] = useState<string[]>(selected);
  const selectedKeyRef = useRef(selected.slice().sort().join('|'));
  useEffect(() => {
    const key = selected.slice().sort().join('|');
    if (key !== selectedKeyRef.current) {
      selectedKeyRef.current = key;
      setTemp(selected);
    }
  }, [selected]);
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
    <div className='w-[220px] rounded-[12px] bg-white p-0'>
      <div className='px-3 pb-2 pt-3 text-[13px] font-semibold text-[#18181B]'>{popupTitle}</div>
      <div className='max-h-[220px] overflow-auto px-2 pb-2'>
        <button type='button' className='flex h-[32px] w-full items-center gap-2 rounded-[8px] px-2 hover:bg-[#F4F4F5]' onClick={toggleAll}>
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
          onClick={onCancel}
        >
          취소
        </button>
        <button
          type='button'
          className='h-[32px] w-[72px] rounded-[10px] bg-[#93C5FD] text-[13px] font-semibold text-white hover:bg-[#60A5FA]'
          onClick={() => onApply(temp)}
        >
          적용
        </button>
      </div>
    </div>
  );
};

export default function RequestDocumentListPanel({
  title,
  selectedFilter,
  setSelectedFilter,
  isCivilMode,
  isLoading = false,
  monthTree,
  expandedParents,
  toggleParent,
  handleDocumentClick,
  selectedDocument,
  onClickAddRecord,
  showRecordSearchInput: _showRecordSearchInput = false,
  onRequestOpenRightPanelTab,
  civilListQuery,
  onChangeCivilListQuery,
  civilPagination,
  onRenamedCaseDocumentTitle,
  hideBottomFloatingMenu = false,
  onRequestOpenSplitModal,
}: TDocumentListPanelProps) {
  const asBool = (v: unknown) => v === true || v === 'true' || v === 1 || v === '1';
  const [recordSearchQuery, setRecordSearchQuery] = useState('');
  const [docNameHeaderHovered, setDocNameHeaderHovered] = useState(false);

  // OCR 완료 판단: ocr_status(또는 ocrStatus) === 'COMPLETED'만 본다.
  // (값이 없으면 UX상 막지 않음)
  const isOcrReady = useCallback((row: any) => {
    const ocrStatus = String(row?.ocr_status ?? row?.ocrStatus ?? '')
      .toUpperCase()
      .trim();
    if (ocrStatus) return ocrStatus === 'COMPLETED';
    return true;
  }, []);

  const toastOcrNotReady = useCallback(() => {
    onMessageToast({ message: 'OCR 중입니다. 완료 후 가능합니다. ' });
  }, []);

  // ! 적용된 키워드와 입력 동기화 (새로고침/이동 시 유지)
  useEffect(() => {
    if (!isCivilMode) return;
    const applied = String(civilListQuery?.keyword ?? '');
    setRecordSearchQuery(applied);
  }, [civilListQuery?.keyword, isCivilMode]);

  const appliedKeyword = String(civilListQuery?.keyword ?? '').trim();
  const appliedSearchLabel = appliedKeyword;
  const isSearchMode = isCivilMode && !!appliedKeyword;

  // ! 검색 하이라이트 정규화
  const normalizeHighlights = useCallback((raw: any): any[] => {
    if (!Array.isArray(raw)) return [];
    const out: any[] = [];
    for (const h of raw) {
      // EvidenceTable 형식: { texts: [...] }
      if (Array.isArray(h?.texts)) {
        out.push(h);
        continue;
      }
      // 민사 검색 형식: { page_number, highlights: [ { texts: [...] }, ... ] }
      if (Array.isArray(h?.highlights)) {
        for (const inner of h.highlights) {
          if (inner && Array.isArray((inner as any)?.texts)) out.push(inner);
        }
      }
    }
    return out;
  }, []);

  const formatHighlights = (highlights: any) => {
    const flat = normalizeHighlights(highlights);
    if (!flat.length) return '';
    return flat
      .map((h: any) =>
        (h?.texts ?? [])
          .map((t: any) => {
            const v = String(t?.value ?? '');
            if (t?.type === 'hit' || v.startsWith('#')) {
              return `<span class="text-[#1890FF] font-bold">${v.replace('#', '')}</span>`;
            }
            return v;
          })
          .join(''),
      )
      .join(' ... ');
  };

  const countSearchTerms = (highlights: any) => {
    const flat = normalizeHighlights(highlights);
    if (!flat.length) return 0;
    let count = 0;
    flat.forEach((h: any) => {
      (h?.texts ?? []).forEach((t: any) => {
        const v = String(t?.value ?? '');
        if (t?.type === 'hit' || v.startsWith('#')) count++;
      });
    });
    return count;
  };

  const hasMatchHighlights = (row: any) => {
    const flat = normalizeHighlights(row?.highlights ?? []);
    if (!flat.length) return false;
    return flat.some(
      (h: any) => Array.isArray(h?.texts) && h.texts.some((t: any) => t?.type === 'hit' || String(t?.value ?? '').startsWith('#')),
    );
  };

  const hasMatchHighlightsStable = useCallback(
    (row: any) => {
      const flat = normalizeHighlights(row?.highlights ?? []);
      if (!flat.length) return false;
      return flat.some(
        (h: any) => Array.isArray(h?.texts) && h.texts.some((t: any) => t?.type === 'hit' || String(t?.value ?? '').startsWith('#')),
      );
    },
    [normalizeHighlights],
  );

  const renderHighlightedContent = (row: any) => {
    const hs = row?.highlights ?? [];
    const flat = normalizeHighlights(hs);
    if (!flat.length) return null;
    const searchTermCount = countSearchTerms(flat);
    return (
      <div className='mt-1 flex max-h-[56px] w-full overflow-y-auto rounded-[8px] bg-[#E4E4E7] p-2'>
        <div className='flex min-w-[120px] max-w-[150px] items-start text-[12px]'>
          <span className='font-medium text-[#888]'>검색어 합계:</span>
          <span className='ml-1 font-semibold text-[#666]'>{searchTermCount}개</span>
        </div>
        <div
          dangerouslySetInnerHTML={{
            __html: formatHighlights(flat),
          }}
        />
      </div>
    );
  };

  // ! 민사 테이블 헤더 정렬/필터 UI 상태
  type TCivilHeaderKey = 'category' | 'submitter' | 'tags' | 'clipping' | 'memo' | 'bookmark' | 'date';
  const [hoveredHeaderKey, setHoveredHeaderKey] = useState<TCivilHeaderKey | null>(null);
  const [headerMenu, setHeaderMenu] = useState<{ key: TCivilHeaderKey; left: number; top: number } | null>(null);
  const [headerMenuView, setHeaderMenuView] = useState<'root' | 'sort' | 'filter'>('root');
  const [sortFlyoutOpen, setSortFlyoutOpen] = useState(false);
  // 기본 정렬이 있더라도(예: 날짜) 초기에는 "미적용" 아이콘/배경으로 보이고,
  // 유저가 정렬을 선택/토글한 이후에만 활성 상태(배경+asc/desc 아이콘)를 표시한다.
  const [sortTouched, setSortTouched] = useState(false);
  const headerMenuRef = useRef<HTMLDivElement | null>(null);
  const sortFlyoutRef = useRef<HTMLDivElement | null>(null);

  // ! 민사 테이블 컬럼 리사이즈
  type TCivilColKey =
    | 'drag'
    | 'check'
    | 'pin'
    | 'category'
    | 'docName'
    | 'requestTitle'
    | 'submitter'
    | 'tags'
    | 'clipping'
    | 'memo'
    | 'bookmark'
    | 'date'
    | 'match';

  const civilProjectId = useMemo(() => {
    return String((selectedDocument as any)?.projectId ?? (selectedDocument as any)?.project_id ?? '').trim();
  }, [selectedDocument]);

  const CIVIL_COL_DEFAULT: Record<TCivilColKey, number> = useMemo(
    () => ({
      drag: 16,
      check: 16,
      // 좁은 패널에서 아이콘 눌림 방지를 위해 pin 컬럼 너비 고정
      pin: 44,
      category: 140,
      docName: 360,
      requestTitle: 240,
      submitter: 120,
      tags: 220,
      clipping: 96,
      memo: 72,
      bookmark: 48,
      date: 84,
      match: 120,
    }),
    [],
  );

  const CIVIL_COL_MIN: Partial<Record<TCivilColKey, number>> = useMemo(
    () => ({
      pin: 44,
      category: 110,
      docName: 220,
      requestTitle: 160,
      submitter: 100,
      tags: 160,
      clipping: 72,
      memo: 64,
      date: 80,
    }),
    [],
  );

  const civilWidthsStorageKey = useMemo(() => {
    if (!civilProjectId) return 'civil-doclist-widths';
    return `civil-doclist-widths-${civilProjectId}`;
  }, [civilProjectId]);

  const [columnWidths, setColumnWidths] = useState<Record<TCivilColKey, number>>(CIVIL_COL_DEFAULT);
  const [resizingColumn, setResizingColumn] = useState<TCivilColKey | null>(null);
  const [startX, setStartX] = useState(0);
  const [startWidth, setStartWidth] = useState(0);

  useEffect(() => {
    try {
      const raw = localStorage.getItem(civilWidthsStorageKey);
      if (!raw) {
        setColumnWidths(CIVIL_COL_DEFAULT);
        return;
      }
      const parsed = JSON.parse(raw) as Partial<Record<TCivilColKey, number>>;
      setColumnWidths((prev) => ({
        ...prev,
        ...CIVIL_COL_DEFAULT,
        ...Object.fromEntries(
          Object.entries(parsed || {}).map(([k, v]) => {
            const n = Number(v);
            if (k === 'pin') return [k, Math.max(44, Number.isFinite(n) ? n : 44)];
            return [k, n];
          }),
        ),
      }));
    } catch {
      setColumnWidths(CIVIL_COL_DEFAULT);
    }
  }, [CIVIL_COL_DEFAULT, civilWidthsStorageKey]);

  useEffect(() => {
    try {
      localStorage.setItem(civilWidthsStorageKey, JSON.stringify(columnWidths));
    } catch {
      // ignore
    }
  }, [civilWidthsStorageKey, columnWidths]);

  const handleResizeMouseDown = (e: React.MouseEvent, col: TCivilColKey) => {
    e.preventDefault();
    e.stopPropagation();
    setResizingColumn(col);
    setStartX(e.clientX);
    setStartWidth(columnWidths[col] ?? CIVIL_COL_DEFAULT[col]);
  };

  useEffect(() => {
    const onMove = (e: MouseEvent) => {
      if (!resizingColumn) return;
      const deltaX = e.clientX - startX;
      const minW = CIVIL_COL_MIN[resizingColumn] ?? 40;
      const next = Math.max(minW, startWidth + deltaX);
      setColumnWidths((prev) => ({ ...prev, [resizingColumn]: next }));
    };
    const onUp = () => setResizingColumn(null);
    document.addEventListener('mousemove', onMove);
    document.addEventListener('mouseup', onUp);
    return () => {
      document.removeEventListener('mousemove', onMove);
      document.removeEventListener('mouseup', onUp);
    };
  }, [CIVIL_COL_MIN, resizingColumn, startWidth, startX]);

  const HeaderResizeHandle = ({ col }: { col: TCivilColKey }) => (
    <div
      className={`absolute right-0 top-0 z-20 h-full w-[10px] cursor-col-resize ${
        resizingColumn === col ? 'opacity-100' : 'opacity-0 group-hover:opacity-100'
      }`}
      onMouseDown={(e) => handleResizeMouseDown(e, col)}
    >
      <div className='absolute right-[4px] top-0 h-full w-[2px] bg-[#69C0FF]' />
    </div>
  );

  const civilFiltersState =
    civilListQuery?.filters ??
    ({
      parsed_category: [],
      parsed_submitter_name: [],
      tags: [],
      bookmark: false,
      memo: false,
      clipping: false,
    } as const);
  const sortColumn = civilListQuery?.sortColumn ?? 'document_date';
  const sortDirection = civilListQuery?.sortDirection ?? 'desc';
  const currentPage = civilListQuery?.page ?? civilPagination?.page ?? 1;
  const currentLimit = civilListQuery?.limit ?? civilPagination?.limit ?? 100;
  const totalCount = civilPagination?.total ?? 0;
  const totalPages = civilPagination?.pages ?? Math.max(1, Math.ceil(totalCount / Math.max(1, currentLimit)));

  const openHeaderMenu = (key: TCivilHeaderKey, e: React.MouseEvent) => {
    e.stopPropagation();
    const rect = (e.currentTarget as HTMLElement).getBoundingClientRect();
    const left = Math.max(8, Math.min(rect.left, window.innerWidth - 180));
    const top = Math.max(8, rect.bottom + 6);
    setHeaderMenu({ key, left, top });
    setHeaderMenuView(key === 'submitter' ? 'root' : key === 'tags' ? 'filter' : 'sort');
    setSortFlyoutOpen(false);
  };

  useEffect(() => {
    if (!headerMenu) return;
    const onDown = (e: MouseEvent) => {
      const el = headerMenuRef.current;
      const fly = sortFlyoutRef.current;
      if (el && e.target instanceof Node && el.contains(e.target)) return;
      if (fly && e.target instanceof Node && fly.contains(e.target)) return;
      setHeaderMenu(null);
      setHeaderMenuView('root');
      setSortFlyoutOpen(false);
    };
    document.addEventListener('mousedown', onDown);
    return () => document.removeEventListener('mousedown', onDown);
  }, [headerMenu]);

  const applySort = (col: NonNullable<TDocumentListPanelProps['civilListQuery']>['sortColumn'], dir: 'asc' | 'desc') => {
    setSortTouched(true);
    onChangeCivilListQuery?.({ sortColumn: col, sortDirection: dir });
    setHeaderMenu(null);
    setHeaderMenuView('root');
    setSortFlyoutOpen(false);
  };

  const HeaderSortIcon = ({ active }: { active: boolean }) => {
    const src = active ? (sortDirection === 'asc' ? arrowUpImg : arrowDownImg) : arrowDownUpImg;
    return (
      <span className='ml-2 inline-flex items-center'>
        <img src={src} alt='sort' className='h-[18px] w-[18px] shrink-0' />
      </span>
    );
  };

  const HeaderFilterIcon = ({ active }: { active: boolean }) => (
    <span className='ml-2 inline-flex items-center'>
      <ListFilter className='h-4 w-4' style={{ color: active ? '#69C0FF' : '#D4D4D8' }} />
    </span>
  );

  const HeaderCell = ({
    label,
    labelNode,
    hkey,
    enableSort,
    enableFilter,
    sortCol,
    align = 'left',
  }: {
    label: string;
    labelNode?: ReactNode;
    hkey: TCivilHeaderKey;
    enableSort?: boolean;
    enableFilter?: boolean;
    sortCol?: NonNullable<TDocumentListPanelProps['civilListQuery']>['sortColumn'];
    align?: 'left' | 'center';
  }) => {
    const isHovered = hoveredHeaderKey === hkey;
    const isSorted = !!sortCol && sortColumn === sortCol;
    const isSortedUi = sortTouched && isSorted;
    const isFilterActive =
      hkey === 'submitter'
        ? (civilFiltersState.parsed_submitter_name ?? []).length > 0
        : hkey === 'tags'
          ? (civilFiltersState.tags ?? []).length > 0
          : false;
    const isActive = isHovered || isSortedUi || isFilterActive;
    const showIcons = (enableSort || enableFilter) && isActive;
    const bg = showIcons ? 'bg-[#F4F4F5]' : 'bg-white';
    return (
      <th
        className={`group relative border-y border-[#E4E4E7] px-3 py-3 ${bg} ${align === 'center' ? 'text-center' : ''}`}
        onMouseEnter={() => setHoveredHeaderKey(hkey)}
        onMouseLeave={() => setHoveredHeaderKey((prev) => (prev === hkey ? null : prev))}
      >
        {/* 리사이즈 핸들 (호버 시 표시) */}
        {hkey === 'category' ? <HeaderResizeHandle col='category' /> : null}
        {hkey === 'submitter' ? <HeaderResizeHandle col='submitter' /> : null}
        {hkey === 'tags' ? <HeaderResizeHandle col='tags' /> : null}
        {hkey === 'clipping' ? <HeaderResizeHandle col='clipping' /> : null}
        {hkey === 'memo' ? <HeaderResizeHandle col='memo' /> : null}
        {hkey === 'bookmark' ? <HeaderResizeHandle col='bookmark' /> : null}
        {hkey === 'date' ? <HeaderResizeHandle col='date' /> : null}
        <button
          type='button'
          className={`inline-flex w-full items-center ${align === 'center' ? 'justify-center' : 'justify-start'}`}
          onClick={(e) => {
            if (!enableSort && !enableFilter) return;

            const isDropdownColumn = hkey === 'submitter' || hkey === 'tags';
            if (isDropdownColumn) {
              openHeaderMenu(hkey, e);
              return;
            }

            if (enableSort && sortCol) {
              e.stopPropagation();
              const nextDir: 'asc' | 'desc' = isSorted ? (sortDirection === 'desc' ? 'asc' : 'desc') : 'desc';
              applySort(sortCol, nextDir);
            }
          }}
        >
          {labelNode ? labelNode : <span className='text-[12px] font-semibold text-[#8A8A8E]'>{label}</span>}
          {showIcons && enableSort ? <HeaderSortIcon active={isSortedUi} /> : null}
          {showIcons && enableFilter ? <HeaderFilterIcon active={isFilterActive} /> : null}
        </button>
      </th>
    );
  };

  const handleFilterCancel = useCallback(() => {
    setHeaderMenu(null);
    setHeaderMenuView('root');
    setSortFlyoutOpen(false);
  }, []);
  const handleFilterApplyAndClose = useCallback((applyFn: (next: string[]) => void, next: string[]) => {
    applyFn(next);
    setHeaderMenu(null);
    setHeaderMenuView('root');
    setSortFlyoutOpen(false);
  }, []);

  const getOfficeIdFromStorage = () => {
    try {
      const raw = localStorage.getItem('evidence-frontend-login') || '{}';
      const parsed = JSON.parse(raw);
      return String(parsed?.data?.user?.office_id ?? '');
    } catch {
      return '';
    }
  };

  const openEvidenceLikeViewer = (row: any, kind: 'pdf' | 'text') => {
    if (isCivilMode && !isOcrReady(row)) {
      toastOcrNotReady();
      return;
    }
    const caseDocumentId = String(row?.case_document_id ?? row?.caseDocumentId ?? '');
    const civilCaseId = String(
      row?.civil_case_id ?? row?.civilCaseId ?? selectedDocument?.civilCaseId ?? selectedDocument?.civil_case_id ?? '',
    );
    const evidenceId = String(
      row?.attachment_id ?? row?.attachmentId ?? row?.split_file_id ?? row?.splitFileId ?? row?.split_fileId ?? row?.id ?? '',
    );
    const projectId = String(row?.project_id ?? row?.projectId ?? selectedDocument?.projectId ?? selectedDocument?.project_id ?? '');
    const officeId = String(row?.office_id ?? row?.officeId ?? getOfficeIdFromStorage());

    if (caseDocumentId && civilCaseId && projectId) {
      // 간편검색(새탭)에서 문서 리스트의 content를 그대로 사용하기 위해 localStorage에 캐시한다.
      try {
        const key = `evi:civil:quicksearch:${civilCaseId}:${caseDocumentId}`;
        const raw = (row as any)?.content ?? (row as any)?.contents ?? (row as any)?.text_content ?? (row as any)?.textContent ?? null;
        const arr = Array.isArray(raw) ? raw : Array.isArray(raw?.content) ? raw.content : null;
        if (Array.isArray(arr) && arr.length > 0) {
          const normalized = arr
            .map((c: any) => ({
              page_number: Number(c?.page_number ?? c?.pageNumber ?? 0),
              description: String(c?.description ?? ''),
            }))
            .filter((c: any) => Number.isFinite(c.page_number) && c.page_number > 0);
          localStorage.setItem(key, JSON.stringify({ content: normalized, savedAt: Date.now() }));
        }
      } catch {
        // 에러 무시
      }

      const qs = new URLSearchParams();
      qs.set('projectId', projectId);
      qs.set('civilCaseId', civilCaseId);
      qs.set('docType', kind);
      window.open(`/evidence/case-viewer/${caseDocumentId}?${qs.toString()}`, '_blank');
      return;
    }

    const fileUrl = String(row?.file_url ?? row?.fileUrl ?? '');
    if (!evidenceId || !projectId || !officeId) {
      if (fileUrl) window.open(fileUrl, '_blank');
      else onMessageToast({ message: '문서를 열 수 없습니다.' });
      return;
    }

    if (kind === 'pdf') {
      window.open(`/evidence/pdf/${evidenceId}?projectId=${projectId}&officeId=${officeId}`, '_blank');
      return;
    }

    const evidenceName = String(row?.parsed_sub_category ?? row?.parsedSubCategory ?? row?.title ?? '텍스트 문서');
    const encodedName = encodeURIComponent(evidenceName);
    window.open(`/evidence/text/${evidenceId}?projectId=${projectId}&officeId=${officeId}&evidenceName=${encodedName}`, '_blank');
  };

  const openEvidenceLikeViewerPrint = (row: any) => {
    if (isCivilMode && !isOcrReady(row)) {
      toastOcrNotReady();
      return;
    }
    const caseDocumentId = String(row?.case_document_id ?? row?.caseDocumentId ?? '');
    const civilCaseId = String(
      row?.civil_case_id ?? row?.civilCaseId ?? selectedDocument?.civilCaseId ?? selectedDocument?.civil_case_id ?? '',
    );
    const projectId = String(row?.project_id ?? row?.projectId ?? selectedDocument?.projectId ?? selectedDocument?.project_id ?? '');
    if (caseDocumentId && civilCaseId && projectId) {
      const qs = new URLSearchParams();
      qs.set('projectId', projectId);
      qs.set('civilCaseId', civilCaseId);
      qs.set('docType', 'pdf');
      qs.set('print', 'true');
      window.open(`/evidence/case-viewer/${caseDocumentId}?${qs.toString()}`, '_blank');
      return;
    }
    openEvidenceLikeViewer(row, 'pdf');
  };

  const triggerDownload = (url: string, filename?: string) => {
    try {
      const a = document.createElement('a');
      a.href = url;
      if (filename) a.download = filename;
      a.rel = 'noopener noreferrer';
      a.target = '_blank';
      document.body.appendChild(a);
      a.click();
      a.remove();
    } catch {
      window.open(url, '_blank');
    }
  };

  const downloadCaseDocument = async (caseDocumentId: string, suggestedFilename?: string) => {
    try {
      const res = await fetchDownloadDocument({ case_document_id: caseDocumentId });
      const blob = (res as any)?.data as Blob;
      if (!blob) throw new Error('empty blob');
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      if (suggestedFilename) a.download = suggestedFilename;
      a.rel = 'noopener noreferrer';
      document.body.appendChild(a);
      a.click();
      a.remove();
      window.setTimeout(() => URL.revokeObjectURL(url), 1000);
    } catch (e) {
      console.error(e);
      onMessageToast({ message: '원본 다운로드에 실패했습니다.' });
    }
  };

  const formatKoreanDate = (raw: unknown) => {
    const s = String(raw ?? '').trim();
    if (!s) return '';

    const m0 = s.match(/^(\d{4})(\d{2})(\d{2})$/);
    if (m0) {
      const y = m0[1];
      const mm = m0[2];
      const dd = m0[3];
      return `${y}.${mm}.${dd}`;
    }
    const m1 = s.match(/^(\d{4})[.-](\d{1,2})[.-](\d{1,2})/);
    if (m1) {
      const y = m1[1];
      const mm = String(Number(m1[2])).padStart(2, '0');
      const dd = String(Number(m1[3])).padStart(2, '0');
      return `${y}.${mm}.${dd}`;
    }

    const d = new Date(s);
    if (Number.isNaN(d.getTime())) return s;

    const parts = new Intl.DateTimeFormat('ko-KR', {
      timeZone: 'Asia/Seoul',
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
    }).formatToParts(d);

    const y = parts.find((p) => p.type === 'year')?.value ?? '';
    const mm = parts.find((p) => p.type === 'month')?.value ?? '';
    const dd = parts.find((p) => p.type === 'day')?.value ?? '';

    if (y && mm && dd) return `${y}.${mm}.${dd}`;
    return s;
  };

  const defaultFilters = ['전체', '피고측 기록', '원고측 기록', '법원측 기록'] as const;
  const filters = defaultFilters;

  const { isPending: isPinPending, onPinCivilCaseDocument } = usePinCivilCaseDocument();
  const { isPending: isBookmarkPending, onBookmarkCivilCaseDocument } = useBookmarkCivilCaseDocument();
  const { isPending: isMovePending, onMoveCivilCaseDocument } = useMoveCivilCaseDocument();
  const { isPending: _isCategorizing, onCategorizeCivilCaseDocument: _onCategorizeCivilCaseDocument } = useCategorizeCivilCaseDocument();
  const { isPending: isLinkPending, onLinkCaseDocument } = useLinkCaseDocument();
  const { isPending: isDeleteLinkPending, onDeleteCaseDocumentLink } = useDeleteCaseDocumentLink();

  // ! 매칭된 증거 모달 상태
  type TMatchModal = {
    rowId: string;
    caseDocumentId: string;
    civilCaseId: string;
  } | null;
  const [matchModal, setMatchModal] = useState<TMatchModal>(null);
  const [matchDropdownRowId, setMatchDropdownRowId] = useState<string | null>(null);
  const [matchDropdownPos, setMatchDropdownPos] = useState<{ top: number; left: number } | null>(null);
  const matchDropdownRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    if (!matchDropdownRowId) return;
    const onDown = (e: MouseEvent) => {
      if (matchDropdownRef.current && e.target instanceof Node && matchDropdownRef.current.contains(e.target)) return;
      setMatchDropdownRowId(null);
      setMatchDropdownPos(null);
    };
    document.addEventListener('mousedown', onDown);
    return () => document.removeEventListener('mousedown', onDown);
  }, [matchDropdownRowId]);

  const openMatchModal = (rowId: string, caseDocumentId: string, civilCaseId: string) => {
    setMatchModal({ rowId, caseDocumentId, civilCaseId });
  };

  const handleConfirmLink = async (lawyerDocumentIds: string[]) => {
    if (!matchModal || lawyerDocumentIds.length === 0 || isLinkPending) return;
    await onLinkCaseDocument({
      client_document_id: matchModal.caseDocumentId,
      lawyer_document_ids: lawyerDocumentIds,
    });
    setMatchModal(null);
  };

  const handleDeleteLink = async (linkId: string) => {
    if (isDeleteLinkPending) return;
    setMatchDropdownRowId(null);
    setMatchDropdownPos(null);
    const res = await onDeleteCaseDocumentLink(linkId);
    if (res) {
      onMessageToast({ message: '매칭이 제거되었습니다.' });
    } else {
      onMessageToast({ message: '매칭 제거에 실패했습니다.' });
    }
  };

  const [selectedRowIds, setSelectedRowIds] = useState<string[]>([]);
  const [hoveredRowId, setHoveredRowId] = useState<string | null>(null);
  const civilTableRef = useRef<HTMLTableElement | null>(null);
  const headerCheckboxRef = useRef<HTMLInputElement | null>(null);

  type TContextMenu = { x: number; y: number; rowId: string } | null;
  const [contextMenu, setContextMenu] = useState<TContextMenu>(null);
  const contextMenuRef = useRef<HTMLDivElement | null>(null);

  type TTagPopup = {
    top: number;
    left: number;
    rowId: string;
    civilCaseId: string;
    projectId: string;
    caseDocumentId: string;
    existingTags: { tag_set_id: string; tag_name: string; color?: string; tag_id?: string }[];
  } | null;
  const [tagPopup, setTagPopup] = useState<TTagPopup>(null);
  const tagPopupOpenRef = useRef(false);
  const pendingCivilRowsRef = useRef<any[] | null>(null);
  const [hoveredTagRowId, setHoveredTagRowId] = useState<string | null>(null);

  const headerRowRef = useRef<HTMLDivElement | null>(null);
  const [headerRowWidth, setHeaderRowWidth] = useState(0);
  useEffect(() => {
    const el = headerRowRef.current;
    if (!el) return;
    const update = () => setHeaderRowWidth(Math.round(el.getBoundingClientRect().width));
    update();
    const ro = new ResizeObserver(() => update());
    ro.observe(el);
    window.addEventListener('resize', update);
    return () => {
      window.removeEventListener('resize', update);
      ro.disconnect();
    };
  }, []);

  const shouldUseFilterSelect = useMemo(() => {
    const threshold = 460;
    return headerRowWidth > 0 && headerRowWidth < threshold;
  }, [headerRowWidth]);

  const civilSearchWidth = useMemo(() => {
    return headerRowWidth > 0 && headerRowWidth < 520 ? 162 : 240;
  }, [headerRowWidth]);

  const civilRows = useMemo(() => {
    if (!isCivilMode) return [];
    const rows: any[] = [];
    for (const m of monthTree ?? []) {
      for (const node of m?.nodes ?? []) {
        if (node?.parent) rows.push(node.parent);
        for (const c of node?.children ?? []) rows.push(c);
      }
    }
    return rows;
  }, [isCivilMode, monthTree]);

  const getRowId = (row: any) => String(row?.caseDocumentId ?? row?.case_document_id ?? row?.id ?? '');
  const getRowCivilCaseId = (row: any) =>
    String(row?.civilCaseId ?? row?.civil_case_id ?? selectedDocument?.civilCaseId ?? selectedDocument?.civil_case_id ?? '');

  const [civilTableRows, setCivilTableRows] = useState<any[]>([]);
  const [hasLocalOrderOverride, setHasLocalOrderOverride] = useState(false);
  const { isPending: isRenamingDoc, onUpdateCivilCaseDocumentFileName } = useUpdateCivilCaseDocumentFileName();
  const [renameTarget, setRenameTarget] = useState<{ caseDocumentId: string; initialTitle: string } | null>(null);

  // 필터 옵션(작성자/태그)은 현재 로드된 리스트에서 유니크하게 추출한다.
  const computeUniqueSubmitters = useMemo(() => {
    if (!isCivilMode) return [];
    const s = new Set<string>();
    for (const r of civilTableRows ?? []) {
      const v = String(r?.parsed_submitter_name ?? r?.parsedSubmitterName ?? '').trim();
      if (v) s.add(v);
    }
    return Array.from(s).sort((a, b) => a.localeCompare(b, 'ko'));
  }, [civilTableRows, isCivilMode]);

  const computeUniqueTagOptions = useMemo(() => {
    if (!isCivilMode) return [] as { tag_set_id: string; tag_name: string; color?: string }[];
    const m = new Map<string, { tag_set_id: string; tag_name: string; color?: string }>();
    for (const r of civilTableRows ?? []) {
      const tagsRaw = Array.isArray(r?.tags) ? r.tags : [];
      for (const t of tagsRaw) {
        if (!t) continue;
        if (typeof t === 'object') {
          const id = String((t as any).tag_set_id ?? (t as any).tagSetId ?? '').trim();
          const name = String((t as any).tag_name ?? (t as any).tagName ?? '').trim();
          const color = String((t as any).color ?? '').trim();
          if (id && name) m.set(id, { tag_set_id: id, tag_name: name, color });
        }
      }
    }
    return Array.from(m.values()).sort((a, b) => a.tag_name.localeCompare(b.tag_name, 'ko'));
  }, [civilTableRows, isCivilMode]);

  const civilRowsById = useMemo(() => {
    const m = new Map<string, any>();
    for (const r of civilRows) m.set(getRowId(r), r);
    return m;
  }, [civilRows]);

  const visibleCivilTableRows = useMemo(() => {
    if (!isCivilMode) return [];
    if (!isSearchMode) return civilTableRows ?? [];
    return (civilTableRows ?? []).filter((r) => {
      const id = getRowId(r);
      const displayRow = (id && civilRowsById.get(id)) || r;
      return hasMatchHighlightsStable(displayRow);
    });
  }, [civilRowsById, civilTableRows, hasMatchHighlightsStable, isCivilMode, isSearchMode]);

  const selectableRowIds = useMemo(() => {
    return visibleCivilTableRows.map((r) => getRowId(r)).filter(Boolean);
  }, [visibleCivilTableRows]);
  const allSelected = selectableRowIds.length > 0 && selectableRowIds.every((id) => selectedRowIds.includes(id));
  const someSelected = selectableRowIds.some((id) => selectedRowIds.includes(id));

  useEffect(() => {
    if (!headerCheckboxRef.current) return;
    headerCheckboxRef.current.indeterminate = someSelected && !allSelected;
  }, [allSelected, someSelected]);

  useEffect(() => {
    if (!isCivilMode) return;
    // 태그 팝업이 열려 있는 동안은 리스트 갱신을 지연하여 깜빡거림 방지
    if (tagPopupOpenRef.current) {
      pendingCivilRowsRef.current = civilRows;
      return;
    }
    // user가 드래그로 순서를 바꾸기 전에는 서버 순서를 그대로 따른다.
    if (!hasLocalOrderOverride) {
      setCivilTableRows(civilRows);
      return;
    }

    // user가 드래그로 순서를 바꾼 이후에는 "순서는 유지"하고, 서버에서 내려온 값만 병합한다.
    setCivilTableRows((prev) => {
      if (!Array.isArray(prev) || prev.length === 0) return civilRows;

      const byId = new Map<string, any>();
      for (const r of civilRows) byId.set(getRowId(r), r);

      const next: any[] = [];
      const seen = new Set<string>();

      for (const oldRow of prev) {
        const id = getRowId(oldRow);
        const fresh = byId.get(id);
        if (!id || !fresh) continue;
        next.push({ ...oldRow, ...fresh });
        seen.add(id);
      }

      // 새로 생긴 row는 서버 순서대로 뒤에 붙인다.
      for (const fresh of civilRows) {
        const id = getRowId(fresh);
        if (!id || seen.has(id)) continue;
        next.push(fresh);
      }

      return next.length ? next : civilRows;
    });
  }, [civilRows, hasLocalOrderOverride, isCivilMode]);

  // 필터 변경 시 선택은 리셋한다. (행 구성 의미가 바뀌므로)
  useEffect(() => {
    setSelectedRowIds([]);
  }, [selectedFilter]);

  // Context menu: 바깥 클릭 시 닫기
  useEffect(() => {
    if (!contextMenu) return;
    const onDown = (e: MouseEvent) => {
      const el = contextMenuRef.current;
      if (el && e.target instanceof Node && el.contains(e.target)) return;
      setContextMenu(null);
    };
    document.addEventListener('mousedown', onDown);
    return () => document.removeEventListener('mousedown', onDown);
  }, [contextMenu]);

  // Tag popup: 리사이즈 시 닫기 (스크롤은 팝업 내부 스크롤까지 닫혀버려 UX가 나빠서 허용)
  useEffect(() => {
    if (!tagPopup) return;
    const close = () => setTagPopup(null);
    window.addEventListener('resize', close);
    return () => {
      window.removeEventListener('resize', close);
    };
  }, [tagPopup]);

  const patchLocalRow = (rowId: string, patch: Partial<{ isPinned: boolean; isBookmarked: boolean }>) => {
    setCivilTableRows((prev) => prev.map((r) => (getRowId(r) === rowId ? { ...r, ...patch } : r)));
  };

  const runPinToggle = async (row: any) => {
    if (isPinPending) return;
    const civilCaseId = getRowCivilCaseId(row);
    const caseDocumentId = getRowId(row);
    if (!civilCaseId || !caseDocumentId) return;
    const optimisticNext = !row?.isPinned;
    patchLocalRow(caseDocumentId, { isPinned: optimisticNext });
    const res = await onPinCivilCaseDocument({ civil_case_id: civilCaseId, case_document_id: caseDocumentId });
    if (!res?.success) {
      patchLocalRow(caseDocumentId, { isPinned: !optimisticNext });
      return;
    }
    const nextPinned = asBool(res?.data?.isPinned);
    patchLocalRow(caseDocumentId, { isPinned: nextPinned });
    onMessageToast({ message: nextPinned ? '핀 고정이 등록되었습니다.' : '핀 고정이 해제되었습니다.' });
    // 핀 고정/해제 완료 후에는 체크박스 선택을 해제한다.
    setSelectedRowIds([]);
    // 핀 고정은 서버에서 목록 정렬(위치)이 바뀌므로, 로컬 드래그 순서 override를 해제하고
    // refetch된 서버 순서를 그대로 따르게 한다.
    setHasLocalOrderOverride(false);
  };

  const runBookmarkToggle = async (row: any) => {
    if (isBookmarkPending) return;
    const civilCaseId = getRowCivilCaseId(row);
    const caseDocumentId = getRowId(row);
    if (!civilCaseId || !caseDocumentId) return;
    const optimisticNext = !row?.isBookmarked;
    patchLocalRow(caseDocumentId, { isBookmarked: optimisticNext });
    const res = await onBookmarkCivilCaseDocument({ civil_case_id: civilCaseId, case_document_id: caseDocumentId });
    if (!res?.success) {
      patchLocalRow(caseDocumentId, { isBookmarked: !optimisticNext });
      return;
    }
    onMessageToast({ message: optimisticNext ? '북마크가 등록되었습니다.' : '북마크가 해제되었습니다.' });
  };

  const runBulkToggle = async (kind: 'pin' | 'bookmark') => {
    if (!selectedRowIds.length) return;
    const selectedSnapshot = [...selectedRowIds];
    const rowsById = new Map(civilTableRows.map((r) => [getRowId(r), r]));
    if (kind === 'pin') {
      for (const id of selectedSnapshot) {
        const row = rowsById.get(id);
        if (row) await runPinToggle(row);
      }
    } else {
      for (const id of selectedSnapshot) {
        const row = rowsById.get(id);
        if (row) await runBookmarkToggle(row);
      }
    }
  };

  const selectedRows = useMemo(() => {
    if (!selectedRowIds.length) return [];
    const byId = new Map(civilTableRows.map((r) => [getRowId(r), r]));
    return selectedRowIds.map((id) => byId.get(id)).filter(Boolean);
  }, [civilTableRows, selectedRowIds]);

  const primarySelectedRow = selectedRows[0] ?? null;
  const requireSingleSelection = () => {
    if (selectedRows.length === 1) return true;
    onMessageToast({ message: '문서 1개만 선택해주세요.' });
    return false;
  };

  return (
    <div className='flex min-h-0 w-full flex-1 flex-col'>
      {/* 헤더 */}
      <div className='pl-[12px] pt-[16px] text-[20px] font-bold'>{title}</div>
      <div ref={headerRowRef} className='flex items-center justify-between gap-3'>
        {/* 좌측 영역 */}
        {isCivilMode ? (
          <div className='flex items-start gap-2 pb-[12px] pl-[15px] pt-[12px]'>
            {/* 기록 검색 input (240x32) */}
            <div className='flex flex-col'>
              <div className='relative' style={{ width: civilSearchWidth }}>
                <Search className='absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-[#A1A1AA]' />
                <input
                  value={recordSearchQuery}
                  onChange={(e) => setRecordSearchQuery(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key !== 'Enter') return;
                    const keyword = String(recordSearchQuery ?? '').trim();
                    onChangeCivilListQuery?.({
                      keyword,
                      power_search: '',
                      keywordVersion: Date.now(),
                      page: 1,
                    });
                  }}
                  type='text'
                  placeholder='검색'
                  className='h-[32px] w-full rounded-[10px] border border-[#E4E4E7] bg-white pl-9 pr-9 text-[12px] font-semibold text-[#18181B] placeholder:font-medium placeholder:text-[#A1A1AA] focus:outline-none focus:ring-1 focus:ring-[#93C5FD]'
                />

                {isSearchMode ? (
                  <button
                    type='button'
                    className='absolute right-2 top-1/2 -translate-y-1/2 text-[#A1A1AA] hover:text-[#71717A]'
                    aria-label='clear-search'
                    onClick={() => {
                      setRecordSearchQuery('');
                      onChangeCivilListQuery?.({
                        keyword: '',
                        power_search: '',
                        keywordVersion: Date.now(),
                        page: 1,
                      });
                    }}
                  >
                    <X className='h-4 w-4' />
                  </button>
                ) : null}
              </div>

              {isSearchMode ? (
                <div className='mt-2 flex min-w-0 items-center gap-2 text-[12px] text-[#666]'>
                  <span className='min-w-0 flex-1 truncate'>
                    '<span className='font-medium text-[#252525]'>{appliedSearchLabel}</span>' 검색 결과 ({totalCount}개)
                  </span>
                  <button
                    type='button'
                    className='shrink-0 whitespace-nowrap text-[12px] text-[#FF0000] underline'
                    onClick={() => {
                      setRecordSearchQuery('');
                      onChangeCivilListQuery?.({
                        keyword: '',
                        power_search: '',
                        keywordVersion: Date.now(),
                        page: 1,
                      });
                    }}
                  >
                    초기화
                  </button>
                </div>
              ) : null}
            </div>
          </div>
        ) : (
          <>
            {/* 넓을 때: 버튼 */}
            <div className={`${shouldUseFilterSelect ? 'hidden' : ''} flex-wrap gap-[6px] pb-[12px] pl-[12px] pt-[12px]`}>
              {filters.map((filter) => (
                <button
                  key={filter}
                  type='button'
                  onClick={() => setSelectedFilter(filter)}
                  className={`rounded-[8px] px-[8px] py-[4px] text-[12px] font-semibold transition-colors ${
                    selectedFilter === filter ? 'bg-[#F4F4F5] text-[#18181B]' : 'bg-white text-[#71717A] hover:bg-[#F4F4F5]'
                  }`}
                >
                  {filter}
                </button>
              ))}
            </div>
            {/* 좁을 때: 셀렉트 */}
            <div className={`${shouldUseFilterSelect ? '' : 'hidden'} relative w-full pb-[12px] pl-[12px] pt-[12px]`}>
              <Select value={selectedFilter} onValueChange={(value) => setSelectedFilter(value)}>
                <SelectTrigger className='h-[32px] w-auto rounded-[10px] border border-[#E4E4E7] bg-white text-[12px] font-semibold text-[#18181B] outline-none'>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {filters.map((filter) => (
                    <SelectItem key={filter} value={filter}>
                      {filter}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </>
        )}

        <div className='mr-[12px] flex items-center gap-2 self-start pb-[12px] pt-[12px]'>
          <button
            type='button'
            onClick={onClickAddRecord}
            className='flex h-[32px] w-[100px] items-center justify-center rounded-[10px] bg-[#69C0FF] text-[13px] font-semibold text-white'
          >
            <FilePlus className='mr-1 h-4 w-4' />
            자료 추가
          </button>
        </div>
      </div>

      {/* 문서 목록 */}
      <div className='mt-[12px] min-h-0 flex-1 overflow-hidden'>
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
        ) : isCivilMode ? (
          <div className='relative flex h-full flex-col overflow-hidden'>
            <div className='civil-doc-scroll flex-1 overflow-x-auto'>
              <div className='w-full' style={{ minWidth: 1100 }}>
                <DragDropContext
                  onDragEnd={async (result) => {
                    if (isSearchMode) return;
                    if (!result.destination) return;
                    if (result.destination.index === result.source.index) return;
                    if (isMovePending) return;

                    setHasLocalOrderOverride(true);

                    const prev = civilTableRows;
                    const next = Array.from(prev);
                    const [moved] = next.splice(result.source.index, 1);
                    next.splice(result.destination.index, 0, moved);
                    setCivilTableRows(next);

                    const civilCaseId = getRowCivilCaseId(moved);
                    const targetId = getRowId(moved);
                    const beforeId = getRowId(next[result.destination.index - 1]);
                    const afterId = getRowId(next[result.destination.index + 1]);

                    if (!civilCaseId || !targetId) return;

                    const res = await onMoveCivilCaseDocument({
                      civil_case_id: civilCaseId,
                      target_id: targetId,
                      before_id: beforeId || '',
                      after_id: afterId || '',
                    });

                    // 실패 시 롤백
                    if (!res?.success) {
                      setCivilTableRows(prev);
                      return;
                    }
                    onMessageToast({ message: '순서가 변경되었습니다.' });
                    // 드래그앤드랍 이후 서버가 최종 순서를 재정렬할 수 있으므로,
                    // 성공 후에는 refetch된 서버 순서를 그대로 따르도록 로컬 override를 해제한다.
                    setHasLocalOrderOverride(false);
                  }}
                >
                  <table ref={civilTableRef} className='w-full min-w-full table-fixed'>
                    {/* colgroup로 헤더/바디 컬럼 너비를 고정해 정렬이 어긋나지 않도록 한다 */}
                    <colgroup>
                      <col style={{ width: columnWidths.drag, minWidth: columnWidths.drag }} />
                      <col style={{ width: columnWidths.check, minWidth: columnWidths.check }} />
                      <col style={{ width: columnWidths.pin, minWidth: columnWidths.pin }} />
                      <col style={{ width: columnWidths.docName, minWidth: columnWidths.docName }} />
                      <col style={{ width: columnWidths.requestTitle, minWidth: columnWidths.requestTitle }} />
                      <col style={{ width: columnWidths.match, minWidth: columnWidths.match }} />
                      <col style={{ width: columnWidths.tags, minWidth: columnWidths.tags }} />
                      <col style={{ width: columnWidths.clipping, minWidth: columnWidths.clipping }} />
                      <col style={{ width: columnWidths.memo, minWidth: columnWidths.memo }} />
                      <col style={{ width: columnWidths.bookmark, minWidth: columnWidths.bookmark }} />
                      <col style={{ width: columnWidths.date, minWidth: columnWidths.date }} />
                    </colgroup>
                    <thead className='sticky top-0 z-10 bg-white'>
                      <tr className='text-left text-[12px] font-semibold text-[#8A8A8E]'>
                        {/* drag/checkbox 영역은 보더 없이 아이콘만 */}
                        <th className='px-0 py-0'>
                          <div className='flex h-[40px] w-[24px] items-center justify-center' />
                        </th>
                        <th className='px-0 py-0'>
                          <div className='flex h-[40px] w-[24px] items-center justify-center'>
                            <div className='flex h-[24px] w-[24px] items-center justify-center rounded-[6px]'>
                              {selectedRowIds.length > 0 ? (
                                <input
                                  ref={headerCheckboxRef}
                                  type='checkbox'
                                  checked={allSelected}
                                  className='h-[16px] w-[16px] rounded-[4px] border border-[#D4D4D8] text-[#000000] hover:border-[#000000] focus:ring-0'
                                  aria-label='select-all-rows'
                                  onChange={(e) => {
                                    e.stopPropagation();
                                    if (!selectableRowIds.length) return;
                                    if (someSelected || allSelected) setSelectedRowIds([]);
                                    else setSelectedRowIds(selectableRowIds);
                                  }}
                                />
                              ) : null}
                            </div>
                          </div>
                        </th>
                        <th className='border-y border-[#E4E4E7] px-2 py-3 text-center'>
                          <div className='flex w-full items-center justify-center'>
                            <Pin className='h-4 w-4' />
                          </div>
                        </th>

                        <th
                          className={`group relative border-y border-[#E4E4E7] px-3 py-3 ${
                            docNameHeaderHovered ? 'bg-[#F4F4F5]' : 'bg-white'
                          }`}
                          onMouseEnter={() => setDocNameHeaderHovered(true)}
                          onMouseLeave={() => setDocNameHeaderHovered(false)}
                        >
                          <HeaderResizeHandle col='docName' />
                          파일명
                        </th>
                        <th className='group relative border-y border-[#E4E4E7] bg-white px-3 py-3'>
                          <HeaderResizeHandle col='requestTitle' />
                          요청 제목
                        </th>
                        <th className='border-y border-[#E4E4E7] px-3 py-3 text-[12px] font-semibold text-[#8A8A8E]'>매칭된 증거</th>
                        <HeaderCell label='태그' hkey='tags' enableSort={false} enableFilter={true} />

                        <HeaderCell label='하이라이트' hkey='clipping' enableSort={true} sortCol='clipping_count' />
                        <HeaderCell label='메모' hkey='memo' enableSort={true} sortCol='memo_count' />
                        <HeaderCell
                          label='북마크'
                          hkey='bookmark'
                          enableSort={true}
                          sortCol='bookmark_count'
                          align='center'
                          labelNode={
                            <span className='inline-flex items-center justify-center'>
                              <Star className='h-4 w-4 text-[#A1A1AA]' />
                            </span>
                          }
                        />
                        <HeaderCell label='날짜' hkey='date' enableSort={true} sortCol='document_date' />
                      </tr>
                    </thead>
                    <Droppable
                      droppableId='civil-doc-table'
                      // 드래그 시 <tr>이 <table> 밖으로 포탈되어 <colgroup> 너비가 사라지는 문제 방지
                      // 동일한 <colgroup>이 있는 실제 <table> 안에 클론을 렌더링해 드래그 미리보기를 일치시킴
                      renderClone={(cloneProvided, _cloneSnapshot, rubric) => {
                        // getBoundingClientRect().width: 가시 너비 (가로 스크롤 시 실제보다 작을 수 있음)
                        // scrollWidth: 실제 렌더링된 테이블 전체 너비 (드래그 미리보기에 사용)
                        const rawW = civilTableRef.current?.scrollWidth ?? civilTableRef.current?.getBoundingClientRect().width ?? 1100;
                        const tableWidth = Math.ceil(rawW);
                        const row = civilTableRows[rubric.source.index];
                        const id = getRowId(row);
                        const displayRow = (id && civilRowsById.get(id)) || row;

                        const dateRaw =
                          (displayRow as any)?.document_date ??
                          (displayRow as any)?.documentDate ??
                          (displayRow as any)?.date ??
                          (displayRow as any)?.updated_at ??
                          (displayRow as any)?.updatedAt ??
                          (displayRow as any)?.createdAt ??
                          (displayRow as any)?.created_at ??
                          '';
                        const date = formatKoreanDate(dateRaw);
                        const docName = String(
                          (displayRow as any)?.parsed_sub_category ??
                            (displayRow as any)?.parsedSubCategory ??
                            (displayRow as any)?.title ??
                            '',
                        );
                        const reqTitle = String(
                          (displayRow as any)?.request_text ??
                            (displayRow as any)?.requestText ??
                            (displayRow as any)?.evidence_request_text ??
                            '',
                        ).trim();
                        const submitterType = String(
                          (displayRow as any)?.parsed_submitter_type ?? (displayRow as any)?.parsedSubmitterType ?? '',
                        );
                        const clipCount = Number((displayRow as any)?.clipping_count ?? (displayRow as any)?.clippingCount ?? 0);
                        const noteCount = Number(
                          (displayRow as any)?.memo_count ??
                            (displayRow as any)?.memoCount ??
                            (displayRow as any)?.note_count ??
                            (displayRow as any)?.noteCount ??
                            0,
                        );
                        const isPinned = asBool((displayRow as any)?.isPinned ?? (displayRow as any)?.is_pinned);
                        const isBookmarked = asBool((displayRow as any)?.isBookmarked ?? (displayRow as any)?.is_bookmarked);
                        const submitterTypeCompact = submitterType.replace(/\s/g, '');
                        const isPlaintiffAgent = submitterTypeCompact === '원고대리인';
                        const categoryAndNameColor = isPlaintiffAgent ? '#B91C1C' : '#18181B';

                        const hasClips = Number.isFinite(clipCount) && clipCount > 0;
                        const highlightColor = hasClips ? '#8A8A8E' : '#E4E4E7';

                        return (
                          <table className='table-fixed' style={{ width: tableWidth, minWidth: tableWidth }}>
                            <colgroup>
                              <col style={{ width: columnWidths.drag, minWidth: columnWidths.drag }} />
                              <col style={{ width: columnWidths.check, minWidth: columnWidths.check }} />
                              <col style={{ width: columnWidths.pin, minWidth: columnWidths.pin }} />
                              <col style={{ width: columnWidths.docName, minWidth: columnWidths.docName }} />
                              <col style={{ width: columnWidths.requestTitle, minWidth: columnWidths.requestTitle }} />
                              <col style={{ width: columnWidths.match, minWidth: columnWidths.match }} />
                              <col style={{ width: columnWidths.tags, minWidth: columnWidths.tags }} />
                              <col style={{ width: columnWidths.clipping, minWidth: columnWidths.clipping }} />
                              <col style={{ width: columnWidths.memo, minWidth: columnWidths.memo }} />
                              <col style={{ width: columnWidths.bookmark, minWidth: columnWidths.bookmark }} />
                              <col style={{ width: columnWidths.date, minWidth: columnWidths.date }} />
                            </colgroup>
                            <tbody>
                              <tr
                                ref={cloneProvided.innerRef}
                                {...cloneProvided.draggableProps}
                                {...cloneProvided.dragHandleProps}
                                className='h-[40px]'
                              >
                                <td className='bg-white px-0'>
                                  <div className='flex h-[40px] w-[24px] items-center justify-center'>
                                    <div className='flex h-[24px] w-[24px] items-center justify-center rounded-[6px] bg-[#F4F4F5]'>
                                      <GripVertical className='h-4 w-4 text-[#A1A1AA]' />
                                    </div>
                                  </div>
                                </td>
                                <td className='bg-white px-0'>
                                  <div className='flex h-[40px] w-[24px] items-center justify-center'>
                                    <div className='flex h-[24px] w-[24px] items-center justify-center rounded-[6px]'>
                                      <input
                                        type='checkbox'
                                        checked={false}
                                        readOnly
                                        className='h-[16px] w-[16px] rounded-[4px] border border-[#D4D4D8] text-[#000000] focus:ring-0'
                                      />
                                    </div>
                                  </div>
                                </td>
                                <td className='border-b border-[#E4E4E7] bg-white px-2 text-center'>
                                  <div className='mx-auto flex h-[28px] w-[28px] items-center justify-center rounded-[8px] bg-[#F4F4F5]'>
                                    {isPinned ? (
                                      <img src={toggleButtonImg} alt='pinned' className='h-[23px] w-[23px]' />
                                    ) : (
                                      <Pin className='h-4 w-4' style={{ color: '#C4C4C7' }} />
                                    )}
                                  </div>
                                </td>
                                <td className='border-b border-[#E4E4E7] bg-white px-3'>
                                  <div
                                    className='w-full min-w-0 truncate text-left text-[14px] font-medium'
                                    style={{ color: categoryAndNameColor }}
                                  >
                                    {docName || '-'}
                                  </div>
                                </td>
                                <td className='border-b border-[#E4E4E7] bg-white px-3'>
                                  <div className='inline-flex h-[24px] max-w-full items-center rounded-[6px] px-2 text-left text-[13px] font-medium text-[#18181B] hover:bg-[#E4E4E7]'>
                                    <span className='min-w-0 truncate'>{reqTitle || '-'}</span>
                                  </div>
                                </td>
                                <td className='border-b border-[#E4E4E7] bg-white px-3' />
                                <td className='border-b border-[#E4E4E7] bg-white'>
                                  <div className='inline-flex h-[24px] items-center gap-2 rounded-[8px]' style={{ color: highlightColor }}>
                                    <Highlighter className='h-4 w-4' />
                                    {hasClips ? <span className='text-[12px] font-semibold'>{clipCount}</span> : null}
                                  </div>
                                </td>
                                <td className='border-b border-[#E4E4E7] bg-white'>
                                  <div className='inline-flex h-[24px] items-center rounded-[8px]'>
                                    <MessageSquareText
                                      className='h-4 w-4'
                                      style={{
                                        color: noteCount > 0 ? '#8A8A8E' : '#E4E4E7',
                                      }}
                                    />
                                    <span className='ml-1 text-[12px] font-semibold text-[#8A8A8E]'>{Number(noteCount || 0)}</span>
                                  </div>
                                </td>
                                <td className='border-b border-[#E4E4E7] bg-white px-3 text-center'>
                                  <div className='mx-auto flex h-[28px] w-[28px] items-center justify-center rounded-[8px] bg-[#F4F4F5]'>
                                    {isBookmarked ? (
                                      <BsStarFill className='h-4 w-4 text-[#FACC15]' />
                                    ) : (
                                      <Star className='h-4 w-4' style={{ color: '#C4C4C7' }} />
                                    )}
                                  </div>
                                </td>
                                <td className='border-b border-[#E4E4E7] bg-white px-3 pr-6 text-[13px] font-normal text-[#8A8A8E]'>
                                  {date}
                                </td>
                              </tr>
                            </tbody>
                          </table>
                        );
                      }}
                    >
                      {(dropProvided) => (
                        <tbody ref={dropProvided.innerRef} {...dropProvided.droppableProps}>
                          {visibleCivilTableRows.length === 0 ? (
                            <tr>
                              <td colSpan={10} className='px-6 py-12 text-center text-[14px] text-[#8A8A8E]'>
                                {isSearchMode ? '데이터가 없습니다' : '파일이 없습니다'}
                              </td>
                            </tr>
                          ) : (
                            visibleCivilTableRows.map((row: any, idx: number) => {
                              const id = getRowId(row);
                              const displayRow = (id && civilRowsById.get(id)) || row;
                              const isSelected = String(selectedDocument?.caseDocumentId ?? selectedDocument?.id ?? '') === id;
                              const isChecked = selectedRowIds.includes(id);
                              const isHovered = !!id && hoveredRowId === id;
                              const showRowControls = isChecked || isHovered;
                              const rowBgClass = isSelected || isChecked ? 'bg-[#DFEFFF]' : isHovered ? 'bg-[#F4F4F5]' : 'bg-white';
                              const rowCellBorderClass = 'border-b border-[#E4E4E7]';

                              const dateRaw =
                                displayRow?.document_date ??
                                displayRow?.documentDate ??
                                displayRow?.date ??
                                displayRow?.updated_at ??
                                displayRow?.updatedAt ??
                                displayRow?.createdAt ??
                                displayRow?.created_at ??
                                '';
                              const date = formatKoreanDate(dateRaw);
                              const docName = String(
                                displayRow?.parsed_sub_category ?? displayRow?.parsedSubCategory ?? displayRow?.title ?? '',
                              );
                              const reqId = String(
                                displayRow?.request_id ??
                                  displayRow?.requestId ??
                                  displayRow?.evidence_request_id ??
                                  displayRow?.evidenceRequestId ??
                                  '',
                              ).trim();
                              const reqTitle = String(
                                displayRow?.request_text ?? displayRow?.requestText ?? displayRow?.evidence_request_text ?? '',
                              ).trim();
                              const rowCivilCaseId = String(displayRow?.civil_case_id ?? displayRow?.civilCaseId ?? '').trim();
                              const submitterType = String(displayRow?.parsed_submitter_type ?? displayRow?.parsedSubmitterType ?? '');
                              const clipCount = Number(displayRow?.clipping_count ?? displayRow?.clippingCount ?? 0);
                              const hasClips = Number.isFinite(clipCount) && clipCount > 0;
                              // 메모 개수: 최신 스펙 memo_count 우선
                              const noteCount = Number(
                                displayRow?.memo_count ?? displayRow?.memoCount ?? displayRow?.note_count ?? displayRow?.noteCount ?? 0,
                              );
                              const isPinned = asBool(displayRow?.isPinned ?? displayRow?.is_pinned);
                              const isBookmarked = asBool(displayRow?.isBookmarked ?? displayRow?.is_bookmarked);

                              const tagsRawRow = Array.isArray((displayRow as any)?.tags) ? (displayRow as any).tags : [];
                              const tagsNormalized = tagsRawRow
                                .map((t: any) => {
                                  if (!t) return null;
                                  if (typeof t === 'string') return { tag_set_id: '', tag_name: t, color: '', tag_id: '' };
                                  if (typeof t === 'object')
                                    return {
                                      tag_set_id: String(t.tag_set_id ?? t.tagSetId ?? ''),
                                      tag_name: String(t.tag_name ?? t.tagName ?? ''),
                                      color: String(t.color ?? ''),
                                      tag_id: String(t.tag_id ?? t.tagId ?? ''),
                                    };
                                  return null;
                                })
                                .filter((t: any) => t && String(t.tag_name ?? '').trim());
                              const tagLabelItems = tagsNormalized.map((t: any) => ({
                                tag_set_id: String(t.tag_set_id ?? ''),
                                tag_name: String(t.tag_name ?? '').trim(),
                                color: String(t.color ?? ''),
                                tag_id: String(t.tag_id ?? ''),
                              }));
                              const hasTags = tagLabelItems.length > 0;
                              const isTagHovered = !!id && hoveredTagRowId === id;

                              const submitterTypeCompact = submitterType.replace(/\s/g, '');
                              const isPlaintiffAgent = submitterTypeCompact === '원고대리인';
                              const categoryAndNameColor = isPlaintiffAgent ? '#B91C1C' : '#18181B';

                              const highlightColor = hasClips ? '#8A8A8E' : '#E4E4E7';

                              return (
                                <Fragment key={id || `${idx}:${docName}`}>
                                  <Draggable draggableId={id || `row-${idx}`} index={idx} isDragDisabled={!id}>
                                    {(dragProvided) => (
                                      <tr
                                        ref={dragProvided.innerRef}
                                        {...dragProvided.draggableProps}
                                        className='h-[40px] cursor-pointer'
                                        onMouseEnter={() => {
                                          if (id) setHoveredRowId(id);
                                        }}
                                        onMouseLeave={() => {
                                          if (!id) return;
                                          setHoveredRowId((prev) => (prev === id ? null : prev));
                                        }}
                                        onClick={() => {
                                          handleDocumentClick(displayRow);
                                        }}
                                        onContextMenu={(e) => {
                                          e.preventDefault();
                                          e.stopPropagation();
                                          if (id) {
                                            setContextMenu({ x: e.clientX, y: e.clientY, rowId: id });
                                            setSelectedRowIds((prev) => (prev.includes(id) ? prev : [id]));
                                          }
                                        }}
                                      >
                                        <td className={`${rowBgClass} px-0`}>
                                          <div
                                            {...dragProvided.dragHandleProps}
                                            className={`flex h-[40px] w-[24px] items-center justify-center transition-opacity ${
                                              showRowControls ? 'opacity-100' : 'opacity-0'
                                            }`}
                                            onClick={(e) => e.stopPropagation()}
                                          >
                                            <div className='flex h-[24px] w-[24px] items-center justify-center rounded-[6px] hover:bg-[#F4F4F5]'>
                                              <GripVertical className='h-4 w-4 text-[#A1A1AA]' />
                                            </div>
                                          </div>
                                        </td>
                                        <td className={`${rowBgClass} px-0`}>
                                          <div
                                            className={`flex h-[40px] w-[24px] items-center justify-center transition-opacity ${
                                              showRowControls ? 'opacity-100' : 'opacity-0'
                                            }`}
                                          >
                                            <div className='flex h-[24px] w-[24px] items-center justify-center rounded-[6px]'>
                                              <input
                                                type='checkbox'
                                                checked={isChecked}
                                                className='h-[16px] w-[16px] rounded-[4px] border border-[#D4D4D8] text-[#000000] hover:border-[#000000] focus:ring-0'
                                                onClick={(e) => e.stopPropagation()}
                                                onChange={() => {
                                                  if (!id) return;
                                                  setSelectedRowIds((prev) =>
                                                    prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id],
                                                  );
                                                }}
                                              />
                                            </div>
                                          </div>
                                        </td>
                                        <td
                                          className={`px-2 text-center ${rowBgClass} ${rowCellBorderClass}`}
                                          onClick={(e) => {
                                            e.stopPropagation();
                                            void runPinToggle(displayRow);
                                          }}
                                        >
                                          <button
                                            type='button'
                                            className='mx-auto flex h-[28px] w-[28px] items-center justify-center rounded-[8px] hover:bg-[#F4F4F5]'
                                            aria-label='pin'
                                          >
                                            {isPinned ? (
                                              <img src={toggleButtonImg} alt='pinned' className='h-[23px] w-[23px]' />
                                            ) : (
                                              <Pin className='h-4 w-4' style={{ color: '#C4C4C7' }} />
                                            )}
                                          </button>
                                        </td>

                                        <td className={`px-3 ${rowBgClass} ${rowCellBorderClass}`}>
                                          {/* 문건명: 컬럼 리사이즈 폭에 맞춰 ... 처리 */}
                                          <div
                                            className='w-full min-w-0 truncate text-left text-[14px] font-medium'
                                            style={{ color: categoryAndNameColor }}
                                          >
                                            {docName || '-'}
                                          </div>
                                        </td>
                                        <td
                                          className={`px-1 ${rowBgClass} ${rowCellBorderClass}`}
                                          onClick={(e) => {
                                            e.stopPropagation();
                                            if (!rowCivilCaseId || !reqId) {
                                              onMessageToast({ message: '요청 정보를 찾을 수 없습니다.' });
                                              return;
                                            }
                                            const qs = new URLSearchParams();
                                            qs.set('civil_case_id', rowCivilCaseId);
                                            qs.set('tab', 'client_request');
                                            qs.set('evidence_request_id', reqId);
                                            const w = window.open(`/case-list?${qs.toString()}`, '_blank', 'noopener,noreferrer');
                                            if (!w) {
                                              onMessageToast({ message: '팝업 차단이 활성화되어 있습니다. 팝업 차단을 해제해주세요.' });
                                            }
                                          }}
                                        >
                                          <div className='group/req inline-flex h-[24px] max-w-full items-center gap-1 rounded-[6px] px-2 text-left text-[13px] font-medium text-[#18181B] hover:bg-[#E4E4E7]'>
                                            <span className='min-w-0 truncate'>{reqTitle || '-'}</span>
                                            <MessageCircleReply className='hidden h-3.5 w-3.5 shrink-0 text-[#8A8A8E] group-hover/req:block' />
                                          </div>
                                        </td>
                                        {/* 매칭된 증거 */}
                                        <td className={`px-3 ${rowBgClass} ${rowCellBorderClass}`} onClick={(e) => e.stopPropagation()}>
                                          {(() => {
                                            const linkedDocs: any[] = Array.isArray(displayRow?.linked_documents)
                                              ? displayRow.linked_documents
                                              : Array.isArray(displayRow?.linkedDocuments)
                                                ? displayRow.linkedDocuments
                                                : [];
                                            const firstLink = linkedDocs[0] ?? null;
                                            const isStringLink = typeof firstLink === 'string';
                                            const linkId = isStringLink
                                              ? firstLink
                                              : String(firstLink?.link_id ?? firstLink?.linkId ?? firstLink?._id ?? firstLink?.id ?? '');
                                            const linkedDocId = isStringLink
                                              ? ''
                                              : String(
                                                  firstLink?.lawyer_case_document_id ??
                                                    firstLink?.case_document_id ??
                                                    firstLink?.caseDocumentId ??
                                                    firstLink?.document_id ??
                                                    firstLink?.documentId ??
                                                    '',
                                                );
                                            const linkedCivilCaseId = isStringLink
                                              ? rowCivilCaseId
                                              : String(firstLink?.civil_case_id ?? firstLink?.civilCaseId ?? rowCivilCaseId ?? '');
                                            const _linkedTitle = isStringLink
                                              ? '-'
                                              : String(
                                                  firstLink?.parsed_sub_category ??
                                                    firstLink?.parsedSubCategory ??
                                                    firstLink?.title ??
                                                    firstLink?.file_name ??
                                                    '-',
                                                );

                                            if (linkedDocs.length > 0) {
                                              const isDropdownOpen = matchDropdownRowId === id;
                                              return (
                                                <div
                                                  className='group relative inline-flex items-center'
                                                  onMouseLeave={() => {
                                                    if (!isDropdownOpen) {
                                                      const wrap = document.getElementById(`match-btn-${id}`);
                                                      if (wrap) wrap.style.width = '67px';
                                                    }
                                                  }}
                                                >
                                                  <div
                                                    id={`match-btn-${id}`}
                                                    className='flex items-center overflow-hidden rounded-full border border-[#E4E4E7] bg-white transition-[width] duration-150 hover:bg-[#E4E4E7]'
                                                    style={{
                                                      width: isDropdownOpen ? 85 : 67,
                                                      height: 24,
                                                      backgroundColor: isDropdownOpen ? '#E4E4E7' : undefined,
                                                    }}
                                                    onMouseEnter={(e) => {
                                                      (e.currentTarget as HTMLElement).style.width = '85px';
                                                    }}
                                                  >
                                                    <span className='flex shrink-0 items-center gap-1 pl-2 text-[12px] font-semibold leading-none text-[#09090B]'>
                                                      <Link2 className='h-3.5 w-3.5 shrink-0' />
                                                      매칭됨
                                                    </span>
                                                    <button
                                                      type='button'
                                                      className='ml-auto flex h-full w-[22px] shrink-0 items-center justify-center text-[#71717A] opacity-0 transition-opacity group-hover:opacity-100'
                                                      style={isDropdownOpen ? { opacity: 1 } : undefined}
                                                      onClick={(e) => {
                                                        e.stopPropagation();
                                                        const wrapEl = document.getElementById(`match-btn-${id}`);
                                                        const rect = (wrapEl ?? e.currentTarget).getBoundingClientRect();
                                                        setMatchDropdownRowId((prev) => (prev === id ? null : id));
                                                        setMatchDropdownPos({ top: rect.bottom + 4, left: rect.left });
                                                      }}
                                                    >
                                                      <MoreHorizontal className='h-3.5 w-3.5' />
                                                    </button>
                                                  </div>
                                                  {isDropdownOpen &&
                                                    matchDropdownPos &&
                                                    createPortal(
                                                      <div
                                                        ref={matchDropdownRef}
                                                        className='fixed z-[9999] overflow-hidden rounded-[10px] border border-[#E4E4E7] bg-white p-[2px] shadow-lg'
                                                        style={{
                                                          top: matchDropdownPos.top,
                                                          left: matchDropdownPos.left,
                                                          width: 170,
                                                          height: 68,
                                                        }}
                                                      >
                                                        <button
                                                          type='button'
                                                          className='flex h-[32px] w-full items-center gap-2 px-3 text-[13px] text-[#000000] hover:bg-[#F4F4F5]'
                                                          onClick={() => {
                                                            setMatchDropdownRowId(null);
                                                            setMatchDropdownPos(null);
                                                            const docIdForOpen =
                                                              linkedDocId ||
                                                              String(firstLink?.case_document_id ?? firstLink?.id ?? firstLink?._id ?? '');
                                                            const civilIdForOpen = linkedCivilCaseId || rowCivilCaseId;
                                                            if (docIdForOpen && civilIdForOpen) {
                                                              const qs = new URLSearchParams();
                                                              qs.set('civil_case_id', civilIdForOpen);
                                                              qs.set('case_document_id', docIdForOpen);
                                                              qs.set('tab', 'list');
                                                              window.open(`/case-list?${qs.toString()}`, '_blank', 'noopener,noreferrer');
                                                            } else {
                                                              onMessageToast({ message: '문서 정보를 찾을 수 없습니다.' });
                                                            }
                                                          }}
                                                        >
                                                          <SquareArrowOutUpRight
                                                            className='h-4 w-4 shrink-0 text-[#000000]'
                                                            strokeWidth={1.5}
                                                          />
                                                          매칭된 증거 열기
                                                        </button>
                                                        <button
                                                          type='button'
                                                          className='flex h-[32px] w-full items-center gap-2 px-3 text-[13px] text-[#000000] hover:bg-[#F4F4F5]'
                                                          onClick={() => {
                                                            if (!linkId) {
                                                              onMessageToast({ message: '매칭 정보를 찾을 수 없습니다.' });
                                                              return;
                                                            }
                                                            setMatchDropdownRowId(null);
                                                            setMatchDropdownPos(null);
                                                            void handleDeleteLink(linkId);
                                                          }}
                                                        >
                                                          <Unlink2 className='h-4 w-4 shrink-0 text-[#000000]' />
                                                          매칭 제거하기
                                                        </button>
                                                      </div>,
                                                      document.body,
                                                    )}
                                                </div>
                                              );
                                            }

                                            return (
                                              <button
                                                type='button'
                                                style={{ width: 78, height: 24 }}
                                                className='flex items-center gap-1 rounded-full border border-[#E4E4E7] bg-white px-2 hover:bg-[#E4E4E7]'
                                                onClick={(e) => {
                                                  e.stopPropagation();
                                                  void openMatchModal(id, id, rowCivilCaseId);
                                                }}
                                              >
                                                <span className='text-[12px]' style={{ color: '#8A8A8E' }}>
                                                  +
                                                </span>
                                                <span className='text-[12px] font-medium' style={{ color: '#8A8A8E' }}>
                                                  매칭하기
                                                </span>
                                              </button>
                                            );
                                          })()}
                                        </td>
                                        {/* 태그 */}
                                        <td
                                          className={`px-3 py-2 ${rowBgClass} ${rowCellBorderClass}`}
                                          onClick={(e) => e.stopPropagation()}
                                        >
                                          {hasTags ? (
                                            <button
                                              type='button'
                                              className='flex w-full flex-wrap items-center gap-1 text-[12px] font-semibold text-[#000000] hover:opacity-90'
                                              onClick={(e) => {
                                                e.stopPropagation();
                                                if (!id) return;
                                                const rect = (e.currentTarget as HTMLButtonElement).getBoundingClientRect();
                                                const scrollY = window.scrollY || document.documentElement.scrollTop;
                                                const scrollX = window.scrollX || document.documentElement.scrollLeft;
                                                const popupWidth = 291;
                                                const popupHeight = 221;
                                                const margin = 12;
                                                const left = Math.min(rect.left + scrollX, scrollX + window.innerWidth - popupWidth - 12);
                                                const belowTop = rect.bottom + scrollY;
                                                const aboveTop = rect.top + scrollY - popupHeight;
                                                const spaceBelow = window.innerHeight - rect.bottom;
                                                const topCandidate = spaceBelow < popupHeight + margin ? aboveTop : belowTop;
                                                const top = Math.max(scrollY + margin, topCandidate);
                                                tagPopupOpenRef.current = true;
                                                setTagPopup({
                                                  top,
                                                  left,
                                                  rowId: id,
                                                  civilCaseId: rowCivilCaseId,
                                                  projectId: String(
                                                    (displayRow as any)?.project_id ??
                                                      (displayRow as any)?.projectId ??
                                                      (selectedDocument as any)?.projectId ??
                                                      (selectedDocument as any)?.project_id ??
                                                      '',
                                                  ),
                                                  caseDocumentId: id,
                                                  existingTags: tagLabelItems.filter((x: { tag_name: string }) => x.tag_name),
                                                });
                                              }}
                                            >
                                              {tagLabelItems.map((t: { tag_set_id: string; tag_name: string }) => (
                                                <span
                                                  key={`${t.tag_set_id || 'name'}:${t.tag_name}`}
                                                  className='inline-flex h-[24px] max-w-full items-center truncate rounded-[8px] border border-[#E4E4E7] bg-transparent px-2 py-[2px] text-[12px] font-semibold text-[#000000]'
                                                >
                                                  {t.tag_name}
                                                </span>
                                              ))}
                                            </button>
                                          ) : (
                                            <button
                                              type='button'
                                              className={`flex h-[24px] items-center rounded-[8px] border border-[#E4E4E7] bg-transparent text-[12px] font-medium text-[#000000] hover:bg-[#E7E7E9] ${
                                                isTagHovered ? 'gap-1 px-3' : 'px-2'
                                              }`}
                                              onMouseEnter={() => {
                                                if (id) setHoveredTagRowId(id);
                                              }}
                                              onMouseLeave={() => {
                                                if (!id) return;
                                                setHoveredTagRowId((prev) => (prev === id ? null : prev));
                                              }}
                                              onClick={(e) => {
                                                e.stopPropagation();
                                                if (!id) return;
                                                const rect = (e.currentTarget as HTMLButtonElement).getBoundingClientRect();
                                                const scrollY = window.scrollY || document.documentElement.scrollTop;
                                                const scrollX = window.scrollX || document.documentElement.scrollLeft;
                                                const popupWidth = 291;
                                                const popupHeight = 221;
                                                const margin = 12;
                                                const left = Math.min(rect.left + scrollX, scrollX + window.innerWidth - popupWidth - 12);
                                                const belowTop = rect.bottom + scrollY;
                                                const aboveTop = rect.top + scrollY - popupHeight;
                                                const spaceBelow = window.innerHeight - rect.bottom;
                                                const topCandidate = spaceBelow < popupHeight + margin ? aboveTop : belowTop;
                                                const top = Math.max(scrollY + margin, topCandidate);
                                                tagPopupOpenRef.current = true;
                                                setTagPopup({
                                                  top,
                                                  left,
                                                  rowId: id,
                                                  civilCaseId: rowCivilCaseId,
                                                  projectId: String(
                                                    (displayRow as any)?.project_id ??
                                                      (displayRow as any)?.projectId ??
                                                      (selectedDocument as any)?.projectId ??
                                                      (selectedDocument as any)?.project_id ??
                                                      '',
                                                  ),
                                                  caseDocumentId: id,
                                                  existingTags: [],
                                                });
                                              }}
                                            >
                                              {isTagHovered ? (
                                                <>
                                                  <span className='flex h-3 w-3 shrink-0 items-center justify-center text-[#8A8A8E]'>
                                                    +
                                                  </span>
                                                  <span className='text-[12px] font-medium text-[#8A8A8E]'>태그</span>
                                                </>
                                              ) : (
                                                <span className='text-[12px] font-medium text-[#8A8A8E]'>태그</span>
                                              )}
                                            </button>
                                          )}
                                        </td>
                                        <td
                                          className={`px-3 ${rowBgClass} ${rowCellBorderClass}`}
                                          onClick={(e) => {
                                            e.stopPropagation();
                                            void (async () => {
                                              await Promise.resolve(handleDocumentClick(displayRow));
                                              onRequestOpenRightPanelTab?.('highlight');
                                            })();
                                          }}
                                        >
                                          <button
                                            type='button'
                                            className='inline-flex h-[24px] items-center gap-2 rounded-[8px] px-2 hover:bg-[#E7E7E9]'
                                            style={{ color: highlightColor }}
                                          >
                                            <Highlighter className='h-4 w-4' />
                                            {hasClips ? <span className='text-[12px] font-semibold'>{clipCount}</span> : null}
                                          </button>
                                        </td>
                                        <td
                                          className={`px-3 ${rowBgClass} ${rowCellBorderClass}`}
                                          onClick={(e) => {
                                            e.stopPropagation();
                                            void (async () => {
                                              await Promise.resolve(handleDocumentClick(displayRow));
                                              onRequestOpenRightPanelTab?.('memo');
                                            })();
                                          }}
                                        >
                                          <button
                                            type='button'
                                            className='inline-flex h-[24px] items-center rounded-[8px] px-2 hover:bg-[#E7E7E9]'
                                          >
                                            <MessageSquareText
                                              className='h-4 w-4'
                                              style={{
                                                color: noteCount > 0 ? '#8A8A8E' : '#E4E4E7',
                                              }}
                                            />
                                            <span className='ml-2 text-[12px] font-semibold text-[#8A8A8E]'>{Number(noteCount || 0)}</span>
                                          </button>
                                        </td>
                                        <td
                                          className={`px-3 text-center ${rowBgClass} ${rowCellBorderClass}`}
                                          onClick={(e) => {
                                            e.stopPropagation();
                                            void runBookmarkToggle(displayRow);
                                          }}
                                        >
                                          <button
                                            type='button'
                                            className='mx-auto flex h-[28px] w-[28px] items-center justify-center rounded-[8px] hover:bg-[#F4F4F5]'
                                            aria-label='bookmark'
                                          >
                                            {isBookmarked ? (
                                              <BsStarFill className='h-4 w-4 text-[#FACC15]' />
                                            ) : (
                                              <Star className='h-4 w-4' style={{ color: '#C4C4C7' }} />
                                            )}
                                          </button>
                                        </td>
                                        {/* 날짜: #8A8A8E / 13 / regular */}
                                        <td
                                          className={`px-3 pr-6 text-[13px] font-normal text-[#8A8A8E] ${rowBgClass} ${rowCellBorderClass}`}
                                        >
                                          {date}
                                        </td>
                                      </tr>
                                    )}
                                  </Draggable>

                                  {hasMatchHighlights(displayRow) ? (
                                    <tr>
                                      {/* highlight row should start after drag/check/pin columns */}
                                      <td className={`px-0 ${rowBgClass}`} />
                                      <td className={`px-0 ${rowBgClass}`} />
                                      <td className={`px-0 ${rowBgClass}`} />
                                      <td colSpan={6} className={`p-2 text-[12px] text-[#888] ${rowBgClass}`}>
                                        <div
                                          style={{
                                            display: '-webkit-box',
                                            WebkitBoxOrient: 'vertical',
                                            WebkitLineClamp: 2,
                                            overflowY: 'auto',
                                            overflowX: 'hidden',
                                            textOverflow: 'ellipsis',
                                          }}
                                        >
                                          {renderHighlightedContent(displayRow)}
                                        </div>
                                      </td>
                                    </tr>
                                  ) : null}
                                </Fragment>
                              );
                            })
                          )}
                          {dropProvided.placeholder}
                        </tbody>
                      )}
                    </Droppable>
                  </table>
                </DragDropContext>
              </div>
            </div>

            {/* 하단 플로팅 메뉴 */}
            {!hideBottomFloatingMenu && selectedRowIds.length > 0 ? (
              <div className='pointer-events-none absolute bottom-[56px] left-1/2 z-[60] -translate-x-1/2'>
                <div className='mb-2 text-center text-[12px] font-semibold text-[#33ABFD]'>선택한 {selectedRowIds.length}개 문서</div>
                <div className='pointer-events-auto h-[40px] w-[189px] rounded-[12px] border border-[#E4E4E7] bg-white shadow-lg'>
                  <div className='flex h-full items-center justify-center gap-2 px-2'>
                    <button
                      type='button'
                      className='flex h-[32px] w-[32px] items-center justify-center rounded-[10px] hover:bg-[#F4F4F5]'
                      aria-label='view-pdf'
                      onClick={() => {
                        if (!primarySelectedRow) return;
                        if (!requireSingleSelection()) return;
                        openEvidenceLikeViewer(primarySelectedRow, 'pdf');
                      }}
                    >
                      <Eye className='h-5 w-5 text-[#8A8A8E]' />
                    </button>
                    <button
                      type='button'
                      className='flex h-[32px] w-[32px] items-center justify-center rounded-[10px] hover:bg-[#F4F4F5]'
                      aria-label='open-memo'
                      onClick={() => {
                        if (!primarySelectedRow) return;
                        if (!requireSingleSelection()) return;
                        void (async () => {
                          await Promise.resolve(handleDocumentClick(primarySelectedRow));
                          onRequestOpenRightPanelTab?.('memo');
                        })();
                      }}
                    >
                      <Pencil className='h-5 w-5 text-[#8A8A8E]' />
                    </button>
                    <button
                      type='button'
                      className='flex h-[32px] w-[32px] items-center justify-center rounded-[10px] hover:bg-[#F4F4F5]'
                      aria-label='pin-toggle'
                      onClick={() => {
                        void runBulkToggle('pin');
                      }}
                    >
                      <Star className='h-5 w-5 text-[#8A8A8E]' />
                    </button>
                    <button
                      type='button'
                      className='flex h-[32px] w-[32px] items-center justify-center rounded-[10px] hover:bg-[#F4F4F5]'
                      aria-label='download-pdf'
                      onClick={() => {
                        if (!primarySelectedRow) return;
                        if (!requireSingleSelection()) return;
                        const caseDocumentId = String(
                          (primarySelectedRow as any)?.caseDocumentId ?? (primarySelectedRow as any)?.case_document_id ?? '',
                        ).trim();
                        const fileUrl = String((primarySelectedRow as any)?.file_url ?? (primarySelectedRow as any)?.fileUrl ?? '');
                        const filenameBase = String(
                          (primarySelectedRow as any)?.parsed_sub_category ??
                            (primarySelectedRow as any)?.parsedSubCategory ??
                            (primarySelectedRow as any)?.title ??
                            'document',
                        );
                        const downloadName = String(
                          (primarySelectedRow as any)?.file_name ?? (primarySelectedRow as any)?.fileName ?? filenameBase,
                        ).trim();

                        if (caseDocumentId) void downloadCaseDocument(caseDocumentId, downloadName);
                        else if (fileUrl) triggerDownload(fileUrl, downloadName);
                        else openEvidenceLikeViewer(primarySelectedRow, 'pdf');
                      }}
                    >
                      <Download className='h-5 w-5 text-[#8A8A8E]' />
                    </button>
                    <button
                      type='button'
                      className='flex h-[32px] w-[32px] items-center justify-center rounded-[10px] hover:bg-[#F4F4F5]'
                      aria-label='print'
                      onClick={() => {
                        if (!primarySelectedRow) return;
                        if (!requireSingleSelection()) return;
                        openEvidenceLikeViewerPrint(primarySelectedRow);
                      }}
                    >
                      <Printer className='h-5 w-5 text-[#8A8A8E]' />
                    </button>
                  </div>
                </div>
              </div>
            ) : null}

            {/* 페이지네이션 바 */}
            <DocumentPagination
              pagination={{
                total: totalCount,
                page: Math.max(1, currentPage),
                limit: Math.max(1, currentLimit),
                pages: Math.max(1, totalPages),
              }}
              onChangePage={(p) => onChangeCivilListQuery?.({ page: p })}
              onChangeLimit={(l) => onChangeCivilListQuery?.({ limit: l, page: 1 })}
              onClickDownload={() => onMessageToast({ message: '목록 다운로드 기능은 준비 중입니다.' })}
              limitOptions={[20, 50, 100]}
            />
          </div>
        ) : (
          <div className='h-full overflow-auto'>
            {/* 기존 트리(비민사) UI 유지 */}
            {monthTree.map((month: any) => (
              <div key={month.monthKey} className='pb-2'>
                {month.monthLabel ? <div className='px-4 py-3 text-[14px] font-medium text-[#8A8A8E]'>{month.monthLabel}</div> : null}

                <div className='border-t border-[#E4E4E7]'>
                  {month.nodes.map(({ key, parent, children }: any) => {
                    const isOpen = !!expandedParents[key];
                    const hasChildren = children.length > 0;
                    const parentColor = parent.party === '원고' ? '#B91C1C' : parent.party === '피고' ? '#1E40AF' : '#09090B';

                    return (
                      <div key={key} className='border-b border-[#E4E4E7]'>
                        <button
                          type='button'
                          onClick={() => {
                            if (hasChildren) toggleParent(key);
                            else handleDocumentClick(parent);
                          }}
                          className='flex w-full items-center justify-between px-4 py-3 text-left hover:bg-[#F4F4F5]'
                        >
                          <div className='flex min-w-0 items-center gap-2'>
                            {hasChildren ? (
                              isOpen ? (
                                <ChevronDown className='h-5 w-5 text-[#18181B]' />
                              ) : (
                                <ChevronRight className='h-5 w-5 text-[#18181B]' />
                              )
                            ) : (
                              <ChevronRight className='h-5 w-5 text-[#18181B]' />
                            )}
                            <span className='truncate text-[14px] font-medium' style={{ color: parentColor }}>
                              {parent.title}
                            </span>
                          </div>
                          <span className='shrink-0 text-[13px] font-normal text-[#8A8A8E]'>{formatKoreanDate(parent.date)}</span>
                        </button>

                        {hasChildren && isOpen ? (
                          <div>
                            {children.map((c: any) => {
                              const childColor = c.party === '원고' ? '#B91C1C' : c.party === '피고' ? '#1E40AF' : '#09090B';
                              return (
                                <button
                                  key={c.id}
                                  type='button'
                                  onClick={() => handleDocumentClick(c)}
                                  className={`flex w-full items-center justify-between px-4 py-3 pl-12 text-left hover:bg-[#F4F4F5] ${
                                    selectedDocument?.id === c.id ? 'bg-[#EEF2FF]' : ''
                                  }`}
                                >
                                  <div className='flex min-w-0 items-center gap-3'>
                                    <span className='truncate text-[14px] font-medium' style={{ color: childColor }}>
                                      {c.title}
                                    </span>
                                  </div>
                                  <span className='shrink-0 text-[13px] font-normal text-[#8A8A8E]'>{formatKoreanDate(c.date)}</span>
                                </button>
                              );
                            })}
                          </div>
                        ) : null}
                      </div>
                    );
                  })}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* 우클릭 컨텍스트 메뉴 (civil table) */}
      {isCivilMode && contextMenu && typeof document !== 'undefined'
        ? createPortal(
            <div
              ref={contextMenuRef}
              style={{
                position: 'fixed',
                top: `${contextMenu.y}px`,
                left: `${contextMenu.x}px`,
                zIndex: 999999,
              }}
              className='w-[175px] overflow-visible rounded-[8px] border border-[#E5E5E5] bg-white text-[14px] text-[#666666] shadow-lg'
              onClick={(e) => e.stopPropagation()}
            >
              {(() => {
                const row = civilTableRows.find((r) => getRowId(r) === contextMenu.rowId);
                const isPinned = asBool(row?.isPinned ?? row?.is_pinned);
                const fileUrl = String(row?.file_url ?? row?.fileUrl ?? '');
                const filename = String(row?.parsed_sub_category ?? row?.parsedSubCategory ?? row?.title ?? 'document');
                const caseDocumentId = getRowId(row);
                const downloadName = String(row?.file_name ?? row?.fileName ?? filename).trim() || filename;

                return (
                  <>
                    <button
                      type='button'
                      className='flex h-[40px] w-full items-center gap-2 border-b border-[#E5E5E5] px-[12px] hover:bg-[#E4E4E7] hover:text-[#18181B]'
                      onClick={() => {
                        setContextMenu(null);
                        if (!caseDocumentId) {
                          onMessageToast({ message: '이름 바꾸기에 실패했습니다.' });
                          return;
                        }
                        setRenameTarget({ caseDocumentId, initialTitle: filename });
                      }}
                    >
                      이름 바꾸기
                    </button>

                    <button
                      type='button'
                      className='flex h-[40px] w-full items-center gap-2 border-b border-[#E5E5E5] px-[12px] hover:bg-[#E4E4E7] hover:text-[#18181B]'
                      onClick={async () => {
                        setContextMenu(null);
                        // 선택된 행의 문서를 열고, 우측 패널의 "전체 메모" 탭을 활성화
                        if (row) await Promise.resolve(handleDocumentClick(row));
                        onRequestOpenRightPanelTab?.('memo');
                      }}
                    >
                      메모
                    </button>

                    <button
                      type='button'
                      className='flex h-[40px] w-full items-center gap-2 border-b border-[#E5E5E5] px-[12px] hover:bg-[#E4E4E7] hover:text-[#18181B]'
                      onClick={() => {
                        if (caseDocumentId) void downloadCaseDocument(caseDocumentId, downloadName);
                        else if (fileUrl) triggerDownload(fileUrl, downloadName);
                        else if (row) openEvidenceLikeViewer(row, 'pdf');
                        setContextMenu(null);
                      }}
                    >
                      원본 다운로드
                    </button>

                    <button
                      type='button'
                      className='flex h-[40px] w-full items-center gap-2 border-b border-[#E5E5E5] px-[12px] hover:bg-[#E4E4E7] hover:text-[#18181B]'
                      onClick={async () => {
                        setContextMenu(null);
                        if (row) await Promise.resolve(handleDocumentClick(row));
                        onRequestOpenSplitModal?.();
                      }}
                    >
                      문서 분리
                    </button>

                    <button
                      type='button'
                      className='flex h-[40px] w-full items-center gap-2 border-b border-[#E5E5E5] px-[12px] hover:bg-[#E4E4E7] hover:text-[#18181B]'
                      onClick={async () => {
                        if (!row) return;
                        // 메뉴가 열린 상태에서 optimistic update로 라벨이 바로 바뀌어 보이지 않도록
                        // 먼저 메뉴를 닫고, 다음 tick에 토글을 실행한다.
                        setContextMenu(null);
                        await new Promise((r) => setTimeout(r, 0));
                        await runPinToggle(row);
                      }}
                    >
                      {isPinned ? '1페이지 위치고정 해제' : '1페이지 위치고정'}
                    </button>
                  </>
                );
              })()}
            </div>,
            document.body,
          )
        : null}

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
          setCivilTableRows((prev) =>
            (prev ?? []).map((r) => {
              const id = getRowId(r);
              if (id !== docId) return r;
              return {
                ...r,
                title: next,
                parsed_sub_category: next,
                parsedSubCategory: next,
                file_name: next,
                fileName: next,
              };
            }),
          );
          onRenamedCaseDocumentTitle?.(docId, next);
          onMessageToast({ message: '이름이 변경되었습니다.' });
          setRenameTarget(null);
        }}
      />

      {/* 태그 선택/생성 팝업 (civil table) */}
      {isCivilMode && tagPopup && typeof document !== 'undefined' ? (
        <CivilCaseDocumentTagPopup
          isOpen={!!tagPopup}
          onClose={() => {
            tagPopupOpenRef.current = false;
            setTagPopup(null);
            if (pendingCivilRowsRef.current) {
              setCivilTableRows(pendingCivilRowsRef.current);
              pendingCivilRowsRef.current = null;
            }
          }}
          position={{ top: tagPopup.top, left: tagPopup.left }}
          civilCaseId={tagPopup.civilCaseId}
          caseDocumentId={tagPopup.caseDocumentId}
          projectId={tagPopup.projectId}
          existingTags={tagPopup.existingTags}
        />
      ) : null}

      {/* 민사 테이블 헤더 정렬/필터 메뉴 */}
      {isCivilMode && headerMenu && typeof document !== 'undefined'
        ? createPortal(
            <>
              {(() => {
                const key = headerMenu.key;

                const renderFilterPanel = () => {
                  if (key === 'submitter') {
                    return (
                      <FilterPopup
                        popupTitle='작성자 필터'
                        options={computeUniqueSubmitters.map((x) => ({ id: x, label: x }))}
                        selected={civilFiltersState.parsed_submitter_name ?? []}
                        onApply={(next) => {
                          handleFilterApplyAndClose((n) => {
                            onChangeCivilListQuery?.({ filters: { ...civilFiltersState, parsed_submitter_name: n } });
                          }, next);
                        }}
                        onCancel={handleFilterCancel}
                      />
                    );
                  }
                  if (key === 'tags') {
                    return (
                      <FilterPopup
                        popupTitle='태그 필터'
                        options={computeUniqueTagOptions.map((t) => ({ id: t.tag_set_id, label: t.tag_name }))}
                        selected={civilFiltersState.tags ?? []}
                        onApply={(next) => {
                          handleFilterApplyAndClose((n) => {
                            onChangeCivilListQuery?.({ filters: { ...civilFiltersState, tags: n } });
                          }, next);
                        }}
                        onCancel={handleFilterCancel}
                      />
                    );
                  }
                  return null;
                };

                // 드롭다운 컬럼만 여기에 해당 (제출자/태그)
                const wrapperWidth = headerMenuView === 'filter' || key === 'tags' ? 220 : 190;

                return (
                  <div
                    ref={headerMenuRef}
                    className='fixed z-[999999] overflow-visible rounded-[12px] border border-[#E4E4E7] bg-white shadow-lg'
                    style={{ left: headerMenu.left, top: headerMenu.top, width: wrapperWidth }}
                    onMouseEnter={() => {
                      // root 메뉴가 열려있는 동안 flyout을 유지하려면 wrapper hover도 고려한다.
                    }}
                    onMouseLeave={() => {
                      // root 메뉴에서 벗어나면 flyout만 닫는다. (메뉴는 바깥 클릭으로 닫힘)
                      setSortFlyoutOpen(false);
                    }}
                  >
                    {(() => {
                      // 작성자: root 메뉴 + 정렬 flyout(hover) + 필터(click)
                      if (key === 'submitter' && headerMenuView === 'root') {
                        return (
                          <div className='py-1'>
                            <button
                              type='button'
                              className='flex h-[40px] w-full items-center gap-2 px-4 text-left text-[14px] font-medium text-[#18181B] hover:bg-[#F4F4F5]'
                              onMouseEnter={() => setSortFlyoutOpen(true)}
                              onFocus={() => setSortFlyoutOpen(true)}
                            >
                              <ArrowUp className='h-4 w-4 text-[#18181B]' />
                              정렬
                              <span className='ml-auto'>
                                <ChevronRight className='h-4 w-4 text-[#A1A1AA]' />
                              </span>
                            </button>
                            <button
                              type='button'
                              className='flex h-[40px] w-full items-center gap-2 px-4 text-left text-[14px] font-medium text-[#18181B] hover:bg-[#F4F4F5]'
                              onMouseEnter={() => setSortFlyoutOpen(false)}
                              onClick={() => {
                                setHeaderMenuView('filter');
                                setSortFlyoutOpen(false);
                              }}
                            >
                              <ListFilter className='h-4 w-4 text-[#18181B]' />
                              필터
                            </button>
                          </div>
                        );
                      }

                      // 필터 전용(태그) 또는 작성자에서 필터 화면으로 진입한 경우
                      if (key === 'tags' || headerMenuView === 'filter') {
                        return renderFilterPanel();
                      }

                      // 작성자 root 외에는 표시할 것이 없다.
                      return null;
                    })()}
                  </div>
                );
              })()}

              {/* 작성자: 정렬 flyout (hover) */}
              {(() => {
                if (!headerMenu) return null;
                if (headerMenu.key !== 'submitter') return null;
                if (headerMenuView !== 'root') return null;
                if (!sortFlyoutOpen) return null;

                const baseLeft = headerMenu.left + 190 + 8;
                const left = Math.max(8, Math.min(baseLeft, window.innerWidth - 190 - 8));
                const top = headerMenu.top;

                return (
                  <div
                    ref={sortFlyoutRef}
                    className='fixed z-[999999] overflow-hidden rounded-[12px] border border-[#E4E4E7] bg-white shadow-lg'
                    style={{ left, top, width: 190 }}
                    onMouseEnter={() => setSortFlyoutOpen(true)}
                    onMouseLeave={() => setSortFlyoutOpen(false)}
                  >
                    {/* 제출자 컬럼에 정렬 렌더러 재사용 */}
                    <div className='py-1'>
                      <button
                        type='button'
                        className={`flex h-[40px] w-full items-center gap-2 px-4 text-left text-[14px] font-medium hover:bg-[#F4F4F5] ${
                          sortColumn === 'parsed_submitter_name' && sortDirection === 'desc'
                            ? 'bg-[#F4F4F5] text-[#18181B]'
                            : 'text-[#18181B]'
                        }`}
                        onClick={() => applySort('parsed_submitter_name', 'desc')}
                      >
                        <ArrowDown className='h-4 w-4' />
                        내림차순 정렬
                      </button>
                      <button
                        type='button'
                        className={`flex h-[40px] w-full items-center gap-2 px-4 text-left text-[14px] font-medium hover:bg-[#F4F4F5] ${
                          sortColumn === 'parsed_submitter_name' && sortDirection === 'asc'
                            ? 'bg-[#F4F4F5] text-[#18181B]'
                            : 'text-[#18181B]'
                        }`}
                        onClick={() => applySort('parsed_submitter_name', 'asc')}
                      >
                        <ArrowUp className='h-4 w-4' />
                        오름차순 정렬
                      </button>
                    </div>
                  </div>
                );
              })()}
            </>,
            document.body,
          )
        : null}

      {/* 매칭된 증거 선택 모달 */}
      <MatchEvidenceModal
        open={matchModal !== null}
        civilCaseId={matchModal?.civilCaseId ?? ''}
        caseDocumentId={matchModal?.caseDocumentId ?? ''}
        onClose={() => setMatchModal(null)}
        onConfirm={(ids) => void handleConfirmLink(ids)}
        isConfirming={isLinkPending}
      />
    </div>
  );
}
