import '@/components/evidence/table/evidence.css';

import { useState, useEffect, useRef, useMemo } from 'react';

import { DragDropContext, Droppable, Draggable } from '@hello-pangea/dnd';
import { useQueryClient } from '@tanstack/react-query';
import { Bookmark, BookmarkNone } from 'assets/images';
import ReactDOM from 'react-dom';
// import { BsDownload, BsPinFill, BsTrash, BsCopy, BsPin } from 'react-icons/bs';
import { BsDownload, BsPinFill, BsTrash, BsPin } from 'react-icons/bs';
import { CiStar } from 'react-icons/ci';
import { FiSearch, FiPlus, FiX } from 'react-icons/fi';
import { IoIosWarning, IoMdSend, IoIosArrowForward, IoMdCloseCircle, IoMdInformationCircleOutline } from 'react-icons/io';
import { IoDocumentOutline, IoPrintOutline } from 'react-icons/io5';
import { LuPencilLine } from 'react-icons/lu';
import { MdDragIndicator } from 'react-icons/md';
import { TbEye } from 'react-icons/tb';
import { useSearchParams } from 'react-router-dom';
import { useIsMounted } from 'usehooks-ts';
import * as XLSX from 'xlsx';

import { useDownloadDocumentFile } from '@query/mutation';
import { useListEvidenceDemo, useEvidenceFilterDemo } from '@query/query';
import CustomSpinner from '@components/common/spiner';
import { EVIDENCE_QUERY_KEY } from '@/apis';
import { fetchListEvidenceDemo } from '@/apis/demo-api';
import { TListEvidenceOutput } from '@/apis/type';
import ModalSelect from '@/components/common/modal/modal-select';
import WarningModal from '@/components/common/modal/modal-warning-component';
import EvidenceListFilter from '@/components/evidence/filter/evidence-list-filter';
import { UploadModal } from '@/components/evidence/modal/evidence-upload-modal';
import { PowerSearchModal } from '@/components/evidence/modal/power-search-modal';
import { EvidencePagination } from '@/components/evidence/pagination/evidence-pagination';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { delayUtil, onMessageToast, paginationQueryKeyMaker } from '@/components/utils';
import { cn } from '@/lib/utils';
import { DEMO_PROJECT_ID } from '@/pages/logout/demo/demo-constants';
import { evidenceStyle as S } from '@/shared/styled/evidence';

const NoteNone = new URL('/src/assets/images/disabled.svg', import.meta.url).href;
const Star = new URL('/src/assets/images/bookMarkNone.svg', import.meta.url).href;
const Note = new URL('/src/assets/images/note.svg', import.meta.url).href;
const Eys = new URL('/src/assets/images/eye.svg', import.meta.url).href;
const Print = new URL('/src/assets/images/print.svg', import.meta.url).href;
const Down = new URL('/src/assets/images/download.svg', import.meta.url).href;
const PowerSearch = new URL('/src/assets/images/power.svg', import.meta.url).href;
const clumHIcon = new URL('/src/assets/images/clumH.svg', import.meta.url).href;
const clumBIcon = new URL('/src/assets/images/clumB.svg', import.meta.url).href;
const allSortIcon = new URL('/src/assets/images/allClum.svg', import.meta.url).href;
const PdfIcon = new URL('/src/assets/images/PDF.svg', import.meta.url).href;

type TContextMenuType = {
  x: number;
  y: number;
  itemId: number; // or string, depending on your evidence_id type
} | null;

type TDemoTag = {
  tag_id: string;
  tag_name: string;
  color?: string;
  tag_set_id?: string;
};

type TDemoTagPopupProps = {
  isOpen: boolean;
  onClose: () => void;
  position: { top: number; left: number };
  evidenceId: string;
  initialTags: TDemoTag[];
  projectTags: TDemoTag[];
  setProjectTags: React.Dispatch<React.SetStateAction<TDemoTag[]>>;
  onChangeTags: (next: TDemoTag[]) => void;
};

const DemoTagPopup = ({
  isOpen,
  onClose,
  position,
  evidenceId: _evidenceId,
  initialTags,
  projectTags,
  setProjectTags,
  onChangeTags,
}: TDemoTagPopupProps) => {
  /**
   * DEMO: EvidenceTagPopup의 UI(클래스/레이아웃)를 최대한 유지하되,
   * 태그 CRUD/할당은 로컬 상태만 사용 (API 호출 제거)
   */
  const [selectedTags, setSelectedTags] = useState<TDemoTag[]>(initialTags || []);
  const [inputValue, setInputValue] = useState('');
  const [editingTag, setEditingTag] = useState<TDemoTag | null>(null);
  const [tagNameEdit, setTagNameEdit] = useState('');
  const [editPopupPosition, setEditPopupPosition] = useState<{ top: number; left: number } | null>(null);

  const popupRef = useRef<HTMLDivElement>(null);
  const editPopupRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (!isOpen) return;
    setSelectedTags(initialTags || []);
    setInputValue('');
    setEditingTag(null);
    setTagNameEdit('');
    setEditPopupPosition(null);
    setTimeout(() => inputRef.current?.focus(), 0);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isOpen]);

  useEffect(() => {
    if (!isOpen) return;
    const onMouseDown = (e: MouseEvent) => {
      if (popupRef.current && !popupRef.current.contains(e.target as Node)) {
        onClose();
      }
    };
    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    document.addEventListener('mousedown', onMouseDown);
    document.addEventListener('keydown', onKeyDown);
    return () => {
      document.removeEventListener('mousedown', onMouseDown);
      document.removeEventListener('keydown', onKeyDown);
    };
  }, [isOpen, onClose]);

  // 편집 팝업 외부 클릭 감지
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        editPopupRef.current &&
        !editPopupRef.current.contains(event.target as Node) &&
        !(event.target as HTMLElement).closest('button[data-edit-button]')
      ) {
        setEditingTag(null);
        setTagNameEdit('');
        setEditPopupPosition(null);
      }
    };

    if (editingTag && editPopupPosition) {
      setTimeout(() => {
        document.addEventListener('mousedown', handleClickOutside);
      }, 0);
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [editingTag, editPopupPosition]);

  const normalizedInput = inputValue.trim().toLowerCase();
  const isExactMatch = useMemo(() => {
    if (!normalizedInput) return false;
    return (projectTags || []).some((t) => (t.tag_name || '').toLowerCase() === normalizedInput);
  }, [normalizedInput, projectTags]);
  const canCreateNewTag = !!normalizedInput && !isExactMatch;

  const filteredTags = useMemo(() => {
    const src = projectTags || [];
    const selectedSet = new Set(selectedTags.map((t) => t.tag_set_id || t.tag_id));
    if (!normalizedInput) return src.filter((t) => !selectedSet.has(t.tag_set_id || t.tag_id));
    return src.filter((t) => !selectedSet.has(t.tag_set_id || t.tag_id) && (t.tag_name || '').toLowerCase().includes(normalizedInput));
  }, [projectTags, selectedTags, normalizedInput]);

  const commitSelected = (next: TDemoTag[]) => {
    setSelectedTags(next);
    onChangeTags(next);
  };

  const handleToggleTag = (tag: TDemoTag) => {
    const key = tag.tag_set_id || tag.tag_id;
    const isSelected = selectedTags.some((t) => (t.tag_set_id || t.tag_id) === key);
    if (isSelected) {
      commitSelected(selectedTags.filter((t) => (t.tag_set_id || t.tag_id) !== key));
    } else {
      commitSelected([...selectedTags, tag]);
    }
    setInputValue('');
  };

  const handleCreateTag = (name: string) => {
    const trimmed = name.trim();
    if (!trimmed) return;
    const exists = (projectTags || []).some((t) => t.tag_name === trimmed);
    if (exists) return;
    const newTag: TDemoTag = {
      tag_id: `demo_tag_${Date.now()}_${Math.random().toString(16).slice(2)}`,
      tag_set_id: `demo_tagset_${Date.now()}_${Math.random().toString(16).slice(2)}`,
      tag_name: trimmed,
      color: '#F7F8F8',
    };
    setProjectTags((prev) => [...(prev || []), newTag]);
    commitSelected([...selectedTags, newTag]);
    setInputValue('');
  };

  const handleEditTag = (tag: TDemoTag, event: React.MouseEvent) => {
    event.stopPropagation();
    event.preventDefault();

    const buttonElement = event.currentTarget as HTMLElement;
    const tagRowElement = buttonElement.closest('div.flex.items-center.justify-between');
    const editPopupHeight = 100;

    if (tagRowElement) {
      const rowRect = tagRowElement.getBoundingClientRect();
      const spaceBelow = window.innerHeight - rowRect.bottom;
      const spaceAbove = rowRect.top;
      const topPosition =
        spaceBelow < editPopupHeight && spaceAbove > editPopupHeight ? rowRect.top - editPopupHeight - 4 : rowRect.bottom + 4;
      setEditPopupPosition({ top: topPosition, left: rowRect.left });
    } else {
      const rect = buttonElement.getBoundingClientRect();
      setEditPopupPosition({ top: rect.bottom + 4, left: rect.left });
    }

    setEditingTag(tag);
    setTagNameEdit(tag.tag_name);
    setInputValue('');
  };

  const handleSaveEdit = () => {
    if (!editingTag || !tagNameEdit.trim()) return;
    const key = editingTag.tag_set_id || editingTag.tag_id;
    const nextName = tagNameEdit.trim();
    setProjectTags((prev) => (prev || []).map((t) => ((t.tag_set_id || t.tag_id) === key ? { ...t, tag_name: nextName } : t)));
    commitSelected(selectedTags.map((t) => ((t.tag_set_id || t.tag_id) === key ? { ...t, tag_name: nextName } : t)));
    setEditingTag(null);
    setTagNameEdit('');
    setEditPopupPosition(null);
  };

  const handleDeleteTag = () => {
    if (!editingTag) return;
    const key = editingTag.tag_set_id || editingTag.tag_id;
    setProjectTags((prev) => (prev || []).filter((t) => (t.tag_set_id || t.tag_id) !== key));
    commitSelected(selectedTags.filter((t) => (t.tag_set_id || t.tag_id) !== key));
    setEditingTag(null);
    setTagNameEdit('');
    setEditPopupPosition(null);
  };

  const handleTagRemove = (tagSetId: string) => {
    commitSelected(selectedTags.filter((t) => (t.tag_set_id || t.tag_id) !== tagSetId));
  };

  const handleInputKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Backspace' && inputValue === '' && selectedTags.length > 0) {
      const last = selectedTags[selectedTags.length - 1];
      handleTagRemove(last.tag_set_id || last.tag_id);
    }
    if (e.key === 'Enter' && inputValue.trim()) {
      e.preventDefault();
      const matched = (projectTags || []).find((t) => (t.tag_name || '').toLowerCase() === normalizedInput);
      if (matched) {
        handleToggleTag(matched);
      } else {
        handleCreateTag(inputValue.trim());
      }
    }
  };

  if (!isOpen) return null;

  return ReactDOM.createPortal(
    <div
      ref={popupRef}
      className='absolute z-[9999] w-[280px] rounded-[8px] bg-white xl:w-[360px]'
      style={{
        top: `${position.top}px`,
        left: `${position.left}px`,
        boxShadow: '2px 2px 8px 0 rgba(0, 0, 0, 0.15)',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'flex-start',
      }}
      onClick={(e) => e.stopPropagation()}
    >
      {/* 상단: 선택된 태그 입력 영역 */}
      <div className='w-full border-b border-[#E5E5E5]'>
        <div className='flex max-h-[250px] min-h-[40px] flex-wrap items-center gap-1 overflow-y-auto rounded-[6px] px-[10px] py-[10px]'>
          {selectedTags.map((tag) => (
            <div
              key={tag.tag_set_id || tag.tag_id}
              className='flex h-[28px] items-center gap-1 truncate rounded-[4px] px-2 text-[14px]'
              style={{ backgroundColor: tag.color || '#F7F8F8', color: '#252525' }}
            >
              <span className='max-w-[180px] truncate xl:max-w-[250px]'>{tag.tag_name}</span>
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  handleTagRemove(tag.tag_set_id || tag.tag_id);
                }}
                className='ml-1 flex h-3 w-3 items-center justify-center rounded-full bg-white/20 hover:bg-white/30'
              >
                <FiX className='h-2 w-2' />
              </button>
            </div>
          ))}
          <input
            ref={inputRef}
            type='text'
            value={inputValue}
            onChange={(e) => setInputValue(e.target.value)}
            onKeyDown={handleInputKeyDown}
            placeholder={selectedTags.length === 0 ? '태그를 선택하세요' : ''}
            className='flex-1 border-none bg-transparent text-[12px] outline-none placeholder:text-[#888] focus:outline-none focus:ring-0'
          />
        </div>
      </div>

      {/* 하단: 태그 선택 또는 생성 */}
      <div className='w-full p-3'>
        <div className='mb-3 text-[12px] text-[#666]'>태그 선택 또는 생성</div>

        <div className='max-h-[250px] space-y-2 overflow-y-auto'>
          {/* 등록된 태그 목록 */}
          {filteredTags.map((tag) => {
            const key = tag.tag_set_id || tag.tag_id;
            const isSelected = selectedTags.some((t) => (t.tag_set_id || t.tag_id) === key);
            return (
              <div
                key={key}
                className='mb-2 flex h-[28px] items-center justify-between gap-2 rounded-[4px] hover:bg-[#F5F5F5]'
                onClick={(e) => {
                  if ((e.target as HTMLElement).closest('button')) return;
                  e.stopPropagation();
                  e.preventDefault();
                  handleToggleTag(tag);
                }}
              >
                <div className='flex flex-1 items-center gap-2'>
                  <div className='cursor-move text-[#888]'>
                    <MdDragIndicator className='h-4 w-4' />
                  </div>
                  <div
                    className={`inline-block max-w-[180px] truncate rounded-[4px] px-2 py-1 text-[14px] xl:max-w-[250px] ${
                      isSelected ? 'ring-2 ring-[#0050B3]' : ''
                    }`}
                    style={{ backgroundColor: tag.color || '#F7F8F8', color: '#252525' }}
                  >
                    <span className='max-w-[180px] truncate xl:max-w-[250px]'>{tag.tag_name}</span>
                  </div>
                </div>
                <button
                  data-edit-button
                  onClick={(e) => handleEditTag(tag, e)}
                  onMouseDown={(e) => {
                    e.stopPropagation();
                    e.preventDefault();
                  }}
                  className='shrink-0 rounded-[4px] px-2 py-1 text-[11px] text-[#666] hover:bg-[#E5E5E5]'
                >
                  편집
                </button>
              </div>
            );
          })}

          {/* 타이핑 중 새 태그 생성 옵션 */}
          {canCreateNewTag && (
            <div
              className='cursor-pointer rounded-[4px] px-2 py-2'
              style={{ backgroundColor: '#F7F8F8' }}
              onClick={() => handleCreateTag(inputValue.trim())}
            >
              <div className='text-[12px] text-[#252525]'>생성 {inputValue.trim()}</div>
            </div>
          )}
        </div>
      </div>

      {/* 편집 팝업 */}
      {editingTag && editPopupPosition && (
        <div
          ref={editPopupRef}
          className='fixed z-[10000] w-[160px] rounded-[8px] bg-white xl:w-[200px]'
          style={{
            top: `${editPopupPosition.top}px`,
            left: `${editPopupPosition.left}px`,
            boxShadow: '2px 2px 8px 0 rgba(0, 0, 0, 0.15)',
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'flex-start',
          }}
          onClick={(e) => e.stopPropagation()}
        >
          <div className='w-full border-b border-[#E5E5E5] px-3 py-2'>
            <div className='relative'>
              <input
                type='text'
                value={tagNameEdit}
                onChange={(e) => setTagNameEdit(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter' && tagNameEdit.trim()) handleSaveEdit();
                  if (e.key === 'Escape') {
                    setEditingTag(null);
                    setTagNameEdit('');
                    setEditPopupPosition(null);
                  }
                }}
                placeholder='태그 이름을 입력하세요'
                className='h-[32px] w-full rounded-[4px] border border-[#0050B3] bg-white px-2 pr-8 text-[12px] focus:border-[#0050B3] focus:outline-none'
                autoFocus
              />
              {tagNameEdit && (
                <button
                  onClick={() => setTagNameEdit('')}
                  className='absolute right-2 top-1/2 flex h-4 w-4 -translate-y-1/2 items-center justify-center rounded-full bg-[#E5E5E5] hover:bg-[#D5D5D5]'
                >
                  <FiX className='h-3 w-3 text-[#666]' />
                </button>
              )}
            </div>
          </div>
          <button onClick={handleDeleteTag} className='flex w-full items-center gap-2 px-3 py-2 text-[12px] text-[#666] hover:bg-[#F5F5F5]'>
            <BsTrash className='h-4 w-4 text-[#888]' />
            <span>삭제</span>
          </button>
        </div>
      )}
    </div>,
    document.body,
  );
};

// import EvidenceDetailModal from '@/components/evidence/modal/evidence-detail-modal';

// import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';

const EvidenceDemoTable = (): JSX.Element => {
  // DEMO: local-only memo overrides so "저장된 것처럼" 보이게 처리
  const [demoMemosByEvidenceId, setDemoMemosByEvidenceId] = useState<Record<string, any[]>>({});
  const [demoMemoContentById, setDemoMemoContentById] = useState<Record<string, string>>({});
  const [demoDeletedMemoById, setDemoDeletedMemoById] = useState<Record<string, boolean>>({});
  // DEMO: local-only bookmark overrides so "북마크 된 것처럼" 보이게 처리
  const [demoBookmarkedByEvidenceId, setDemoBookmarkedByEvidenceId] = useState<Record<string, boolean>>({});
  // DEMO: local-only pin overrides so "핀 등록된 것처럼" 보이게 처리
  const [demoPinnedByEvidenceId, setDemoPinnedByEvidenceId] = useState<Record<string, boolean>>({});
  // DEMO: local-only ordering overrides so DnD "순서가 변경된 것처럼" 보이게 처리
  const [demoOrderByKey, setDemoOrderByKey] = useState<Record<string, string[]>>({});
  // DEMO: local-only tags overrides so "태그가 저장된 것처럼" 보이게 처리 (태그 API 호출 제거)
  const [demoTagsByEvidenceId, setDemoTagsByEvidenceId] = useState<Record<string, TDemoTag[]>>({});
  // DEMO: 프로젝트 태그 목록도 로컬로 유지 (태그 모달 UI 유지, API 호출 제거)
  const [demoProjectTags, setDemoProjectTags] = useState<TDemoTag[]>([]);

  const [contextMenu, setContextMenu] = useState<TContextMenuType>(null);
  const [selectedItems, setSelectedItems] = useState<any[]>([]); // 체크된 행의 ID 배열
  const [currentRowIndex, setCurrentRowIndex] = useState<number | null>(null); // 우클릭한 행의 인덱스
  const [lastCheckedIndex, setLastCheckedIndex] = useState<number | null>(null);

  const [isUploadModalOpen, setIsUploadModalOpen] = useState(false);

  const tableContainerRef = useRef<HTMLDivElement>(null);
  // ! 메모관련 상태

  const [fixedMemoId, setFixedMemoId] = useState<string | null>(null);
  const [memoPosition, setMemoPosition] = useState({ top: 0, left: 0 });

  const [isEditing, setIsEditing] = useState<{
    memoId: string;

    content: string;
  } | null>(null);
  const [writingMemoId, setWritingMemoId] = useState<string | null>(null);

  const [newMemoContent, setNewMemoContent] = useState('');
  const [isNoteDeleteOpen, setIsNoteDeleteOpen] = useState(false);
  const [deleteMemoId, setDeleteMemoId] = useState<string | null>(null);

  // ! 태그 관련 상태
  const [isTagPopupOpen, setIsTagPopupOpen] = useState(false);
  const [tagPopupPosition, setTagPopupPosition] = useState({ top: 0, left: 0 });
  const [tagWritingId, setTagWritingId] = useState<string | null>(null);

  // ! 필터관련 상태
  const [selectedNameFilters, setSelectedNameFilters] = useState<string[]>([]);
  const [selectedSummaryFilters, setSelectedSummaryFilters] = useState<string[]>([]);
  const [selectedReferenceFilters, setSelectedReferenceFilters] = useState<string[]>([]);
  const [selectedCategoryFilters, setSelectedCategoryFilters] = useState<string[]>([]);
  const [selectedBookmarkFilters, setSelectedBookmarkFilters] = useState<string[]>([]);
  const [selectedMemoFilters, setSelectedMemoFilters] = useState<string[]>([]);
  const [selectedMissingPageFilters, setSelectedMissingPageFilters] = useState<string[]>([]);
  const [selectedTagFilters, setSelectedTagFilters] = useState<string[]>([]);
  const [openFilter, setOpenFilter] = useState<string | null>(null);
  const [sortColumn, setSortColumn] = useState<string | undefined>(undefined);
  const [sortDirection, setSortDirection] = useState<'asc' | 'desc' | undefined>(undefined);

  // ! 검색 관련 상태
  const [tempInput, setTempInput] = useState<string>('');
  const [searchParams] = useSearchParams();
  const [isPowerSearchModalOpen, setIsPowerSearchModalOpen] = useState(false);
  const [powerSearch, setPowerSearch] = useState<string>('');
  const [excludeTerms, setExcludeTerms] = useState<string[]>([]);
  const [resetPowerSearch, setResetPowerSearch] = useState(false);
  const [searchExecuted, setSearchExecuted] = useState(false);
  const [isSearching, setIsSearching] = useState(false);
  const [hideSearchCount, setHideSearchCount] = useState(false);

  // ! 페이지네이션 관련 상태
  const [selectedPage, setSelectedPage] = useState<number>(1);
  const [currentPage, setCurrentPage] = useState(1);

  // ! 핀 등록 관련 상태
  const [pinnedItems, setPinnedItems] = useState<string[]>([]);
  // 페이지당 문서 개수 옵션 추가
  const itemsPerPageOptions = [50, 100, 150, 200];

  // ! 드래그앤 드랍 관련 상태
  const [showDragHandles, setShowDragHandles] = useState<string | null>(null);

  console.log('currentRowIndex:', currentRowIndex);

  // !요약관련
  // const [summaryPosition, setSummaryPosition] = useState({ top: 0, left: 0 });
  // const [hoveredSummaryId, setHoveredSummaryId] = useState<string | null>(null);

  // ! 경고 모달
  const [isWarningOpen, setIsWarningOpen] = useState(false);

  const [isMounted, setIsMounted] = useState(false);

  const [resizingColumn, setResizingColumn] = useState<string | null>(null);
  const [startX, setStartX] = useState(0);
  const [startWidth, setStartWidth] = useState(0);
  // ! usehooks-ts 모음
  const isMountedHook = useIsMounted();

  const projectId = searchParams.get('project_id');

  const getID = localStorage.getItem('evidence-frontend-login') || '{}';
  const parsedData = JSON.parse(getID);

  const effectiveProjectId = projectId || DEMO_PROJECT_ID;
  // DEMO: /user API 호출 제거 - 로컬 저장소(loginAtom storage)에서만 유저 정보 사용
  const effectiveOfficeId = parsedData?.data?.user?.office_id || '';
  const fontSizeAdjustment = 0;
  const demoUserId = parsedData?.data?.user?.id || 'demo_user';
  const demoUserNm = parsedData?.data?.user?.name || 'DEMO';

  // DEMO: 권한/멤버 조회 API 호출 제거 (project members 호출 안 함)
  // "신규 증거 추가"는 UI만 보여주고 동작은 비활성화 처리
  const currentUserIsCaseManager = true;

  const [itemsPerPage, setItemsPerPage] = useState(50);
  useEffect(() => {
    // DEMO: 유저 설정 API 호출 제거로 인해 기본값 유지
  }, []);

  // 문서보기(다운로드) API 호출용 (데모에서는 "문서보기"는 실제 API 호출)
  const { onDownloadDocumentFile: onDownloadDocumentFileApi } = useDownloadDocumentFile();
  const colorPalette = {
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
  const getUserColor = (color: string) => {
    return colorPalette[color as keyof typeof colorPalette] || color;
  };
  // ! 테이블 리사이징 관련 상태
  const [columnWidths, setColumnWidths] = useState<Record<string, number>>(() => {
    if (projectId) {
      const projectWidths = localStorage.getItem(`evidence-table-widths-${projectId}`);
      if (projectWidths) return JSON.parse(projectWidths);
    }
    const saved = localStorage.getItem('evidence-table-widths');
    if (saved) return JSON.parse(saved);
    return {
      checkbox: 100,
      evidence_number: 50,
      author: 50,
      sequence_number: 50,
      start_page: 50,
      evidence_title: 120,
      summary: 50,
      evidence_name: 100,
      reference: 100,
      category: 100,
      bookmark: 100,
      memo: 150,
      tag: 150,

      page_count: 50,
      missing_page: 50,
    };
  });
  // ! 리사이징 관련 함수
  const handleMouseDown = (e: React.MouseEvent, columnId: string) => {
    e.preventDefault();
    setResizingColumn(columnId);
    setStartX(e.clientX);
    setStartWidth(columnWidths[columnId]);
  };
  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      if (!resizingColumn) return;
      const deltaX = e.clientX - startX;
      const newWidth = Math.max(50, startWidth + deltaX);

      setColumnWidths((prev) => ({
        ...prev,
        [resizingColumn]: newWidth,
      }));
    };

    const handleMouseUp = () => {
      setResizingColumn(null);
    };

    document.addEventListener('mousemove', handleMouseMove);
    document.addEventListener('mouseup', handleMouseUp);
    return () => {
      document.removeEventListener('mousemove', handleMouseMove);
      document.removeEventListener('mouseup', handleMouseUp);
    };
  }, [resizingColumn, startX, startWidth]);
  // 테이블의 첫 번째 고정 너비 컬럼 (체크박스)의 예상 너비
  const CHECKBOX_COLUMN_WIDTH = 80;

  // columnWidths에 저장된 모든 (조정 가능한) 컬럼 너비의 합계 계산
  const sumOfResizableColumnWidths = useMemo(() => {
    return Object.values(columnWidths).reduce((sum, width) => sum + Number(width || 0), 0);
  }, [columnWidths]);

  // 테이블의 전체 최소 너비 계산
  const totalTableMinWidth = CHECKBOX_COLUMN_WIDTH + sumOfResizableColumnWidths;

  // localStorage애 저장
  useEffect(() => {
    if (projectId) {
      localStorage.setItem(`evidence-table-widths-${projectId}`, JSON.stringify(columnWidths));
    } else {
      localStorage.setItem('evidence-table-widths', JSON.stringify(columnWidths));
    }
  }, [columnWidths, projectId]);
  useEffect(() => {
    if (projectId) {
      // 현재 프로젝트의 저장된 너비 확인
      const projectWidths = localStorage.getItem(`evidence-table-widths-${projectId}`);
      if (projectWidths) {
        setColumnWidths(JSON.parse(projectWidths));
        return;
      }
    }

    // 프로젝트별 설정이 없으면 기본 설정 로드
    const savedWidths = localStorage.getItem('evidence-table-widths');
    if (savedWidths) {
      setColumnWidths(JSON.parse(savedWidths));
    }
  }, [projectId]);

  // ! API 호출
  // - useQueryClient 모음
  const queryClient = useQueryClient();
  // - query key 모음
  const listEvidenceQueryKey = paginationQueryKeyMaker({
    queryKeyName: EVIDENCE_QUERY_KEY.FIND_LIST_EVIDENCE,
    pageSize: String(itemsPerPage),
    otherQueryParams: {
      project_id: projectId || '',
      page: String(currentPage),
    },
  });
  // - query data 모음
  const listEvidenceQueryData = queryClient.getQueryData<TListEvidenceOutput>(listEvidenceQueryKey);
  /**
   * DEMO: remove all mutation API calls.
   * Keep the UI behavior but make side-effects no-op.
   */
  const onAddHistory = async (_input: any) => {
    return { success: true, isSuccess: true };
  };
  // 태그 필터 처리: 빈 문자열을 그대로 전달 (백엔드에서 태그가 없는 항목으로 처리)
  const processedTagFilters = useMemo(() => {
    if (!selectedTagFilters || selectedTagFilters.length === 0) {
      return selectedTagFilters;
    }
    // 빈 문자열을 포함하여 그대로 전달 (백엔드가 빈 문자열을 태그가 없는 항목으로 인식해야 함)
    return selectedTagFilters;
  }, [selectedTagFilters]);

  // 초기 리스트 API
  const {
    response: listEvidenceOutput,
    refetch: refetchListEvidence,
    isLoading,
    isFetching: _isFetching,
  } = useListEvidenceDemo({
    project_id: projectId || '',
    keyword: tempInput,
    page: currentPage,
    not_contain: excludeTerms,
    power_search: powerSearch,
    limit: itemsPerPage,
    filters: {
      name: selectedNameFilters,
      summary: selectedSummaryFilters,
      reference: selectedReferenceFilters,
      category: selectedCategoryFilters,
      bookmark: selectedBookmarkFilters,
      memo: selectedMemoFilters,
      missing_page: selectedMissingPageFilters,
      tags: processedTagFilters, // 빈 문자열 포함하여 그대로 전달
    },
    sort_column: sortColumn,
    sort_direction: sortDirection,
  });

  // DEMO: 초기 태그 목록은 "증거 리스트 응답의 tags"에서만 추출해서 로컬로 고정 (API 없이 태그 모달 유지)
  useEffect(() => {
    if (demoProjectTags.length > 0) return;
    const results: any[] = listEvidenceOutput?.data?.results || [];
    const next: TDemoTag[] = [];
    const seen = new Set<string>();
    results.forEach((it: any) => {
      (it.tags || []).forEach((t: any) => {
        const key = t.tag_set_id || t.tag_id || t.tag_name;
        if (!key || seen.has(key)) return;
        seen.add(key);
        next.push({
          tag_id: t.tag_id || key,
          tag_set_id: t.tag_set_id || key,
          tag_name: t.tag_name,
          color: t.color || '#F7F8F8',
        });
      });
    });
    if (next.length > 0) setDemoProjectTags(next);
  }, [demoProjectTags.length, listEvidenceOutput]);

  // ! useMemo 모음
  const isProcessing = useMemo(() => {
    return isLoading || isSearching || !isMounted;
  }, [isLoading, isSearching, isMounted]);

  const extractSearchTerms = (searchStr: string) => {
    if (!searchStr) return '';

    // AND, OR, (, ) 앞에 #을 붙임
    return searchStr
      .replace(/\b(AND|OR)\b/g, '#$1') // AND, OR 앞에 # 추가
      .replace(/\(/g, '#(') // 여는 괄호 앞에 # 추가
      .replace(/\)/g, '#)'); // 닫는 괄호 앞에 # 추가
  };

  // ! 파워검색
  const handlePowerSearchSubmit = (searchQuery: string, excludeQuery: string[]) => {
    setPowerSearch(searchQuery);

    const processedQuery = extractSearchTerms(searchQuery);

    setPowerSearch(processedQuery);
    setExcludeTerms(excludeQuery);
    setTempInput('');
    setCurrentPage(1);
    setSelectedPage(1); // 페이지 입력 필드도 1로 초기화
    setSearchExecuted(false);
    setIsSearching(true); // 검색 시작 상태 설정
    setHideSearchCount(true); // 검색 시작 시 갯수 숨김
    setTimeout(() => {
      refetchListEvidence();
    }, 0);
  };
  const handleReset = () => {
    // 모든 검색 관련 state 초기화
    setPowerSearch('');
    setExcludeTerms([]);
    setTempInput('');
    setCurrentPage(1);
    setSelectedPage(1); // 페이지 입력 필드도 1로 초기화
    setResetPowerSearch(true); // 파워검색 모달 초기화 트리거
    setIsPowerSearchModalOpen(false); // 파워검색 모달 닫기
    setSearchExecuted(false);
    setIsSearching(false);
    setHideSearchCount(false); // 리셋 시 갯수 표시 허용
    // API 재호출 전에 약간의 지연
    setTimeout(() => {
      refetchListEvidence();
      // 다음 파워검색을 위해 reset 상태 복원
      setResetPowerSearch(false);
    }, 100);
  };
  // ! 검색 하이라이트 처리
  const formatHighlights = (highlights: any) => {
    if (!highlights) return '';

    return highlights
      .map((highlight: any) =>
        highlight.texts
          .map((text: any) => {
            // 파워검색의 경우 #이 붙은 검색어도 하이라이트 처리
            if (text.type === 'hit' || text.value.startsWith('#')) {
              return `<span class="text-[#1890FF] font-bold">${text.value.replace('#', '')}</span>`;
            }
            return text.value;
          })
          .join(''),
      )
      .join(' ... ');
  };
  const countSearchTerms = (highlights: any) => {
    if (!highlights) return 0;

    // 모든 highlights 내의 hit 타입 텍스트 개수 계산
    let count = 0;
    highlights.forEach((highlight: any) => {
      highlight.texts.forEach((text: any) => {
        if (text.type === 'hit' || text.value.startsWith('#')) {
          count++;
        }
      });
    });

    return count;
  };
  const renderHighlightedContent = (item: any) => {
    if (!item.highlights || item.highlights.length === 0) {
      return null;
    }

    const searchTermCount = countSearchTerms(item.highlights);

    return (
      <div className='mt-1 flex max-h-[56px] w-full overflow-y-auto rounded-[8px] border border-[#E5E5E5] bg-white p-2 shadow-sm'>
        <div className='flex min-w-[120px] max-w-[150px] items-start text-[12px]'>
          <span className='font-medium text-[#888]'>검색어 합계:</span>
          <span className='ml-1 font-semibold text-[#666]'>{searchTermCount}개</span>
        </div>
        <div
          dangerouslySetInnerHTML={{
            __html: formatHighlights(item.highlights),
          }}
        />
      </div>
    );
  };

  // ! 정렬관련
  const handleHeaderSort = (column: string) => {
    if (sortColumn === column) {
      // 현재 정렬된 컬럼을 다시 클릭한 경우
      if (sortDirection === 'asc') {
        // 1. 오름차순 -> 내림차순
        setSortDirection('desc');
      } else if (sortDirection === 'desc') {
        // 2. 내림차순 -> 정렬 초기화
        setSortColumn(undefined);
        setSortDirection(undefined);
      } else {
        setSortColumn(column);
        setSortDirection('asc');
      }
    } else {
      setSortColumn(column);
      setSortDirection('asc');
    }

    // state 업데이트 후 API 호출
    setTimeout(() => {
      refetchListEvidence();
    }, 0);
  };

  // ! 증거 목록 필터 리스트 api
  const { response: filterData, refetch: _refetchFilterData } = useEvidenceFilterDemo({
    project_id: projectId || '',
    keyword: '',
    filters: {
      key: [''],
      value: [
        selectedNameFilters.length ? selectedNameFilters[0] : '',
        selectedSummaryFilters.length ? selectedSummaryFilters[0] : '',
        selectedReferenceFilters.length ? selectedReferenceFilters[0] : '',
        selectedCategoryFilters.length ? selectedCategoryFilters[0] : '',
        selectedBookmarkFilters.length ? selectedBookmarkFilters[0] : '',
        selectedMemoFilters.length ? selectedMemoFilters[0] : '',
        selectedMissingPageFilters.length ? selectedMissingPageFilters[0] : '',
        selectedTagFilters.length ? selectedTagFilters[0] : '',
      ],
    },
  });

  // ! 파워검색 버튼 클릭 시 실행
  const handlePowerSearch = () => {
    setIsPowerSearchModalOpen(true);
  };

  // (핀/북마크/드래그앤드랍은 데모에서는 로컬 상태로만 처리)

  const handleFilterToggle = (filterName: string) => {
    setOpenFilter(openFilter === filterName ? null : filterName);
  };

  // const { onViewDocument } = useViewDocument();
  const handleDownloadDocuments = async () => {
    setContextMenu(null);
    if (selectedItems.length === 0) {
      setIsWarningOpen(true);
      setContextMenu(null);
      return;
    }

    try {
      let successCount = 0;

      // 순차적으로 다운로드
      for (const evidenceId of selectedItems) {
        await onAddHistory({
          project_id: projectId || '',
          evidence_id: evidenceId,
          type: 'EVIDENCE_DOWNLOAD',
        });
        const response = await onDownloadDocumentFileApi({
          office_id: effectiveOfficeId,
          project_id: effectiveProjectId,
          evidence_id: evidenceId,
          doc_type: 'pdf',
        });

        if (response.success && response.data?.url) {
          const link = document.createElement('a');
          link.href = response.data.url;
          link.download = response.data.filename || `document_${evidenceId}.pdf`;
          document.body.appendChild(link);
          link.click();
          document.body.removeChild(link);
          successCount++;

          await new Promise((resolve) => setTimeout(resolve, 400));
        }
      }
      setTimeout(() => setSelectedItems([]), 500);
      if (successCount === selectedItems.length) {
        onMessageToast({
          message: `${successCount}개 파일 다운로드가 완료되었습니다.`,
          icon: <IoMdSend className='h-5 w-5 text-green-500' />,
        });
      } else {
        onMessageToast({
          message: `${successCount}개 파일 다운로드 완료, ${selectedItems.length - successCount}개 실패`,
          icon: <IoIosWarning className='h-5 w-5 text-yellow-500' />,
        });
      }
    } catch (error) {
      console.error('다운로드 중 오류 발생:', error);
      onMessageToast({
        message: '파일 다운로드 중 오류가 발생했습니다.',
        icon: <IoIosWarning className='h-5 w-5 text-yellow-500' />,
      });
    }
  };

  // ! TEXT 다운로드
  const handleDownloadTextDocuments = async () => {
    setContextMenu(null);
    if (selectedItems.length === 0) {
      setIsWarningOpen(true);
      setContextMenu(null);
      return;
    }

    try {
      let TextSuccessCount = 0;

      // 순차적으로 다운로드
      for (const evidenceId of selectedItems) {
        await onAddHistory({
          project_id: projectId || '',
          evidence_id: evidenceId,
          type: 'EVIDENCE_DOWNLOAD',
        });
        const response = await onDownloadDocumentFileApi({
          office_id: effectiveOfficeId,
          project_id: effectiveProjectId,
          evidence_id: evidenceId,
          doc_type: 'text',
        });

        if (response.success && response.data?.url) {
          const link = document.createElement('a');
          link.href = response.data.url;
          link.download = response.data.filename || `document_${evidenceId}.txt`;
          document.body.appendChild(link);
          link.click();
          document.body.removeChild(link);
          TextSuccessCount++;

          await new Promise((resolve) => setTimeout(resolve, 400));
        }
      }
      setTimeout(() => setSelectedItems([]), 500);
      if (TextSuccessCount === selectedItems.length) {
        onMessageToast({
          message: `${TextSuccessCount}개 파일 다운로드가 완료되었습니다.`,
          icon: <IoMdSend className='h-5 w-5 text-green-500' />,
        });
      } else {
        onMessageToast({
          message: `${TextSuccessCount}개 파일 다운로드 완료, ${selectedItems.length - TextSuccessCount}개 실패`,
          icon: <IoIosWarning className='h-5 w-5 text-yellow-500' />,
        });
      }
    } catch (error) {
      console.error('다운로드 중 오류 발생:', error);
      onMessageToast({
        message: '파일 다운로드 중 오류가 발생했습니다.',
        icon: <IoIosWarning className='h-5 w-5 text-yellow-500' />,
      });
    }
  };
  // ! 폰트 크기
  // 동적 폰트 크기 조정
  const getAdjustedSize = (baseSize: number) => {
    return baseSize * (1 + fontSizeAdjustment / 100);
  };

  // 폰트 크기 조정 옵션
  const fontSizeClasses = {
    18: ['text-base', 'text-lg', 'text-xl', 'text-2xl', 'text-3xl', 'text-4xl', 'text-5xl'],
    16: ['text-sm', 'text-base', 'text-lg', 'text-xl', 'text-2xl', 'text-3xl', 'text-4xl'],
    14: ['text-xs', 'text-sm', 'text-base', 'text-lg', 'text-xl', 'text-2xl', 'text-3xl'],
    12: ['text-2xs', 'text-xs', 'text-sm', 'text-base', 'text-lg', 'text-xl', 'text-2xl'],
  } as const;

  //  폰크크기 조정 클래스 선택
  const getFontSizeClass = (baseSize: keyof typeof fontSizeClasses, adjustment: number) => {
    const steps = [-30, -20, -10, 0, 10, 20, 30];
    const index = steps.indexOf(adjustment);
    return fontSizeClasses[baseSize][index !== -1 ? index : 3]; // 기본값(0%)은 index 3
  };

  // ! 엑셀다운로드 함수
  const downloadExcel = async () => {
    try {
      const allDataResponse = await fetchListEvidenceDemo({
        project_id: projectId || '',
        keyword: '',
        page: 1,
        limit: 10000,
      });

      const dataToExport = allDataResponse.data.results.map(
        ({ evidence_number, name, summary_text, category, start_page, page_count, reference, evidence_title, missing_page_count }) => ({
          번호: evidence_number,
          증거명: evidence_title,
          요약: summary_text,
          이름: name,
          참고사항: reference,
          구분: category,
          시작: start_page,
          페이지수: page_count,
          누락여부: missing_page_count,
        }),
      );

      const ws = XLSX.utils.json_to_sheet(dataToExport);
      const wb = XLSX.utils.book_new();
      XLSX.utils.book_append_sheet(wb, ws, '증거목록');
      XLSX.writeFile(wb, '증거목록.xlsx');
    } catch (error) {
      console.error('엑셀 다운로드 중 오류 발생:', error);
      onMessageToast({
        message: '엑셀 다운로드 중 오류가 발생했습니다.',
        icon: <IoIosWarning className='h-5 w-5 text-yellow-500' />,
      });
    }
  };

  // ! 체크박스 핸들러
  const handleSelectAllChange = (isChecked: boolean) => {
    if (isChecked) {
      // 모든 아이템 선택
      const allItemIds = listEvidenceOutput?.data?.results.map((item: any) => item.evidence_id) || [];
      setSelectedItems(allItemIds);
    } else {
      // 모든 아이템 선택 해제
      setSelectedItems([]);
    }
  };
  const displayData = useMemo(() => {
    const base: any[] = listEvidenceOutput?.data?.results || [];

    const orderKey = `${projectId || ''}:${currentPage}:${itemsPerPage}`;
    const order = demoOrderByKey[orderKey];
    const orderedBase = order?.length
      ? (() => {
          const idx = new Map<string, number>();
          order.forEach((id, i) => idx.set(id, i));
          return [...base].sort((a, b) => (idx.get(a.evidence_id) ?? 999999) - (idx.get(b.evidence_id) ?? 999999));
        })()
      : base;

    return orderedBase.map((item: any) => {
      const evidenceId = item.evidence_id;
      const demoMemos = demoMemosByEvidenceId[evidenceId] || [];

      const mergedMemos = [...(item.memos || []), ...demoMemos]
        .filter((m: any) => !demoDeletedMemoById[m.memo_id])
        .map((m: any) => ({
          ...m,
          content: demoMemoContentById[m.memo_id] ?? m.content,
        }));

      const bookmarkOverride = demoBookmarkedByEvidenceId[evidenceId];
      const mergedBookmarks = typeof bookmarkOverride === 'boolean' ? (bookmarkOverride ? [{}] : []) : item.bookmarks || [];

      const demoTags = demoTagsByEvidenceId[evidenceId];
      const mergedTags = Array.isArray(demoTags) ? demoTags : item.tags || [];

      return {
        ...item,
        memos: mergedMemos,
        bookmarks: mergedBookmarks,
        tags: mergedTags,
      };
    });
  }, [
    listEvidenceOutput,
    demoMemosByEvidenceId,
    demoDeletedMemoById,
    demoMemoContentById,
    demoBookmarkedByEvidenceId,
    demoTagsByEvidenceId,
    demoOrderByKey,
    projectId,
    currentPage,
    itemsPerPage,
  ]);

  // !핀등록 (DEMO: 로컬에서 즉시 반영)
  const handlePinToggle = async (evidenceIds: string[]) => {
    // 선택된 항목들의 현재 핀 상태 확인
    const selectedItemsData = displayData.filter((item) => evidenceIds.includes(item.evidence_id));
    const pinnedCount = selectedItemsData.filter((item) => pinnedItems.includes(item.evidence_id)).length;

    // 조건에 따른 메시지 분기
    let message = '';
    if (pinnedCount === evidenceIds.length) {
      message = evidenceIds.length > 1 ? '선택한 모든 항목의 핀 등록이 해제되었습니다.' : '핀 등록이 해제되었습니다.';
    } else if (pinnedCount === 0) {
      message = evidenceIds.length > 1 ? '선택한 모든 항목이 핀 등록되었습니다.' : '핀 등록에 성공했습니다.';
    } else {
      message = `선택한 항목 중 ${pinnedCount}개는 핀 등록이 해제되었고, ${evidenceIds.length - pinnedCount}개는 핀 등록되었습니다.`;
    }

    // DEMO: 각 항목별로 토글
    setDemoPinnedByEvidenceId((prev) => {
      const next = { ...prev };
      selectedItemsData.forEach((it) => {
        const id = it.evidence_id;
        const isPinnedNow = pinnedItems.includes(id);
        next[id] = !isPinnedNow;
      });
      return next;
    });

    setPinnedItems((prev) => {
      const set = new Set(prev);
      selectedItemsData.forEach((it) => {
        const id = it.evidence_id;
        if (set.has(id)) set.delete(id);
        else set.add(id);
      });
      return Array.from(set);
    });

    onMessageToast({
      message: message,
      icon: <IoMdSend className='h-5 w-5 text-green-500' />,
    });
    setSelectedItems([]);
  };
  const handleClearInput = () => {
    setTempInput(''); // 먼저 검색어 초기화
    setSearchExecuted(false); // 검색 실행 상태 초기화
    setTimeout(() => {
      // state 업데이트 후 API 호출
      refetchListEvidence();
    }, 0);
  };

  // 개별 체크박스 선택 핸들러
  const handleCheckboxChange = (itemId: string, index: number, event: React.ChangeEvent<HTMLInputElement>) => {
    if ((event.nativeEvent as MouseEvent).shiftKey && lastCheckedIndex !== null) {
      // 쉬프트 키가 눌린 상태이고 이전 선택이 있는 경우
      const start = Math.min(lastCheckedIndex, index);
      const end = Math.max(lastCheckedIndex, index);

      // 범위 내의 모든 아이템 ID 가져오기
      const itemsToSelect = displayData.slice(start, end + 1).map((item) => item.evidence_id);

      // 현재 선택된 항목에 범위 내의 모든 아이템 추가
      setSelectedItems((prev) => {
        const newSelection = new Set([...prev]);
        itemsToSelect.forEach((id) => newSelection.add(id));
        return Array.from(newSelection);
      });
    } else {
      // 일반 클릭인 경우 기존 로직 유지
      setSelectedItems((prev) => {
        const updatedSelection = prev.includes(itemId) ? prev.filter((id) => id !== itemId) : [...prev, itemId];
        return updatedSelection;
      });
    }
    setLastCheckedIndex(index);
  };
  const handleRowClick = (evidenceId: string, index: number, event: React.MouseEvent) => {
    // 메모 셀(td)을 클릭한 경우
    if ((event.target as HTMLElement).closest('td')?.classList.contains('memo-cell')) {
      // 이벤트 전파 중지
      event.stopPropagation();

      // 클릭한 위치에 메모 모달 위치 설정
      const memoCell = (event.target as HTMLElement).closest('td');
      if (memoCell) {
        const rect = memoCell.getBoundingClientRect();
        const scrollTop = window.scrollY || document.documentElement.scrollTop;

        setMemoPosition({
          top: rect.top + rect.height + scrollTop, // 행의 하단 위치
          left: rect.left,
        });

        // 항상 새 메모 작성 창 표시 (메모 유무와 관계없이)
        setWritingMemoId(evidenceId);

        setFixedMemoId(null);
        setIsEditing(null);
      }
      return;
    }

    // 태그 셀(td)을 클릭한 경우
    if ((event.target as HTMLElement).closest('td')?.classList.contains('tag-cell')) {
      // 이벤트 전파 중지 (체크박스 선택 방지)
      event.stopPropagation();

      // 태그 셀의 onClick 핸들러가 처리하도록 함
      return;
    }

    // 체크박스 클릭은 기존 핸들러에서 처리되도록 제외
    if ((event.target as HTMLElement).closest('input[type="checkbox"]')) {
      return;
    }

    handleCheckboxChange(evidenceId, index, event as unknown as React.ChangeEvent<HTMLInputElement>);
  };

  // 우클릭 메뉴 열기
  const handleContextMenu = (e: React.MouseEvent, rowIndex: number, item: any) => {
    e.preventDefault();

    // 현재 선택된 행들 중에 우클릭한 행이 포함되어 있지 않은 경우에만 선택
    if (selectedItems.length === 0) {
      setSelectedItems([item.evidence_id]);
    }

    // 스크롤 위치를 고려한 마우스 클릭 위치 계산
    const x = e.clientX;
    const y = e.clientY + window.scrollY;

    setCurrentRowIndex(rowIndex);
    setContextMenu({ x, y, itemId: item.evidence_id });
  };
  // 메뉴 닫기
  const contextMenuRef = useRef<HTMLDivElement>(null);

  // ! 드래그앤드랍 함수
  const handleDragEnd = async (result: any) => {
    if (!result.destination || !projectId) return;

    const items = Array.from(displayData);
    const [reorderedItem] = items.splice(result.source.index, 1);
    items.splice(result.destination.index, 0, reorderedItem);

    // DEMO: local ordering override (so UI immediately reflects reorder)
    const orderKey = `${projectId || ''}:${currentPage}:${itemsPerPage}`;
    setDemoOrderByKey((prev) => ({ ...prev, [orderKey]: items.map((it: any) => it.evidence_id) }));

    // Also update react-query cache to minimize flicker if other parts read from cache
    if (listEvidenceQueryData) {
      queryClient.setQueryData<TListEvidenceOutput>(listEvidenceQueryKey, {
        ...listEvidenceQueryData,
        data: {
          ...listEvidenceQueryData.data,
          results: items,
        },
      });
    }

    onMessageToast({
      message: '순서가 변경되었습니다.',
      icon: <IoMdSend className='h-5 w-5 text-green-500' />,
    });
  };

  // ! 메모관련

  // DEMO: 삭제 버튼 노출을 위해 "현재 사용자"를 데모 로그인 사용자로 취급
  const currentUserId = demoUserId || parsedData?.data?.user?.id;

  // 메모가 본인의 것인지 확인하는 함수
  const isMyMemo = (memoUserId?: string, memoId?: string) => {
    // 데모에서 생성한 메모는 항상 본인 메모로 취급 (삭제 버튼 노출)
    if (memoId?.startsWith('demo_memo_')) return true;
    if (!memoUserId) return false;
    return memoUserId === currentUserId;
  };
  // ! 메모 저장 수정 함수
  const handleSaveNote = async (evidence_id: string, content: string, memoId?: string) => {
    try {
      const isEdit = !!memoId;
      if (isEdit && memoId) {
        // DEMO: local edit
        setDemoMemoContentById((prev) => ({ ...prev, [memoId]: content }));
      } else {
        // DEMO: local create
        const newMemoId = `demo_memo_${Date.now()}_${Math.random().toString(16).slice(2)}`;
        const newMemo = {
          memo_id: newMemoId,
          content,
          createdAt: new Date().toISOString(),
          user_id: demoUserId,
          user_nm: demoUserNm,
          nickname: demoUserNm,
          user_color: 'green',
          thumbnail_url: null,
        };

        setDemoMemosByEvidenceId((prev) => ({
          ...prev,
          [evidence_id]: [...(prev[evidence_id] || []), newMemo],
        }));
      }

      // 체크박스 해제
      setTimeout(() => setSelectedItems([]), 100);

      onMessageToast({
        message: memoId ? '메모가 성공적으로 수정되었습니다.' : '메모가 성공적으로 저장되었습니다.',
        icon: <IoMdSend className='h-5 w-5 text-green-500' />,
      });

      setIsEditing(null);
    } catch (error) {
      console.error('메모 저장/수정 실패:', error);
      onMessageToast({
        message: '메모 저장/수정 중 오류가 발생했습니다.',
        icon: <IoIosWarning className='h-5 w-5 text-yellow-500' />,
      });
    }
  };
  // ! 메모 삭제 함수

  const openDeleteModal = (memoId: string) => {
    setDeleteMemoId(memoId);
    setIsNoteDeleteOpen(true);
    setOpenFilter(null);
    setContextMenu(null);
  };

  const handleDeleteNote = async (memoId: string) => {
    try {
      setTimeout(() => setSelectedItems([]), 100);
      // DEMO: local delete
      setDemoDeletedMemoById((prev) => ({ ...prev, [memoId]: true }));

      onMessageToast({
        message: '메모가 성공적으로 삭제되었습니다.',
        icon: <IoMdSend className='h-5 w-5 text-green-500' />,
      });

      setIsNoteDeleteOpen(false); // 삭제 모달 닫기
    } catch (error) {
      // 에러 핸들링
      console.error('메모 삭제 실패:', error);
      onMessageToast({
        message: '메모 삭제 중 오류가 발생했습니다.',
        icon: <IoIosWarning className='h-5 w-5 text-yellow-500' />,
      });
    }
  };
  const handleConfirmDelete = () => {
    if (deleteMemoId) {
      handleDeleteNote(deleteMemoId);
      setIsNoteDeleteOpen(false);
      setDeleteMemoId(null);
    }
  };

  // ! 북마크 저장 수정 함수
  const handleSaveBookmark = async (evidenceId?: string) => {
    if (evidenceId) {
      try {
        // 현재 항목 찾기
        const currentItem = displayData.find((item) => item.evidence_id === evidenceId);
        const isCurrentlyBookmarked = currentItem && currentItem.bookmarks && currentItem.bookmarks.length > 0;

        // DEMO: local toggle
        setDemoBookmarkedByEvidenceId((prev) => ({
          ...prev,
          [evidenceId]: !isCurrentlyBookmarked,
        }));

        onMessageToast({
          message: isCurrentlyBookmarked ? '북마크가 해제되었습니다.' : '북마크가 추가되었습니다.',
          icon: <IoMdSend className='h-5 w-5 text-green-500' />,
        });
      } catch (error) {
        console.error('북마크 저장 실패:', error);
        onMessageToast({
          message: '북마크 저장 중 오류가 발생했습니다.',
          icon: <IoIosWarning className='h-5 w-5 text-yellow-500' />,
        });
      }

      return;
    }
    if (selectedItems.length === 0) {
      setIsWarningOpen(true);
      setContextMenu(null);
      return;
    }
    try {
      // 선택된 항목들의 현재 북마크 상태 확인
      const selectedItemsData = displayData.filter((item) => selectedItems.includes(item.evidence_id));
      const bookmarkedCount = selectedItemsData.filter((item) => item.bookmarks && item.bookmarks.length > 0).length;

      // 조건에 따른 메시지 분기
      let message = '';

      if (bookmarkedCount === selectedItems.length) {
        // 모든 항목이 북마크된 경우
        message = selectedItems.length > 1 ? '선택한 모든 항목의 북마크가 해제되었습니다.' : '선택한 항목의 북마크가 해제되었습니다.';
      } else if (bookmarkedCount === 0) {
        // 모든 항목이 북마크되지 않은 경우
        message = selectedItems.length > 1 ? '선택한 모든 항목이 북마크되었습니다.' : '선택한 항목이 북마크되었습니다.';
      } else {
        // 일부만 북마크된 경우
        message = `선택한 항목 중 ${bookmarkedCount}개는 북마크가 해제되었고, ${selectedItems.length - bookmarkedCount}개는 북마크가 추가되었습니다.`;
      }

      // DEMO: local toggle for all selected
      setDemoBookmarkedByEvidenceId((prev) => {
        const next = { ...prev };
        selectedItemsData.forEach((it) => {
          const id = it.evidence_id;
          const isBookmarked = it.bookmarks && it.bookmarks.length > 0;
          next[id] = !isBookmarked;
        });
        return next;
      });
      if (!evidenceId) {
        // 직접 ID를 받지 않은 경우 (여러 항목 선택 시)
        setTimeout(() => setSelectedItems([]), 100);
      }
      onMessageToast({
        message: message,
        icon: <IoMdSend className='h-5 w-5 text-green-500' />,
      });
    } catch (error) {
      console.error('북마크 저장 실패:', error);
      onMessageToast({
        message: '북마크 저장 중 오류가 발생했습니다.',
        icon: <IoIosWarning className='h-5 w-5 text-yellow-500' />,
      });
    }
  };
  // !문서보기
  const openEvidenceFileByApi = async (evidenceId: string, docType: 'pdf' | 'text') => {
    if (docType !== 'pdf') {
      onMessageToast({
        message: '데모에서는 PDF 보기만 지원합니다.',
        icon: <IoIosWarning className='h-5 w-5 text-yellow-500' />,
      });
      return;
    }

    const qs = new URLSearchParams({
      projectId: effectiveProjectId || '',
      officeId: effectiveOfficeId || '',
    });
    const viewerUrl = `/demo-viewer/${evidenceId}?${qs.toString()}`;
    window.open(viewerUrl, '_blank');
  };

  const handleViewDocument = async (evidenceId: string, pageCount: number) => {
    if (pageCount < 1) {
      onMessageToast({
        message: 'PDF문서가 없습니다.',
        icon: <IoIosWarning className='h-5 w-5 text-yellow-500' />,
      });
      return;
    }

    await onAddHistory({
      project_id: projectId || '',
      evidence_id: evidenceId,
      type: 'EVIDENCE_VIEW',
    });

    await openEvidenceFileByApi(evidenceId, 'pdf');
  };
  const handlePrint = () => {
    if (selectedItems.length === 0) {
      setIsWarningOpen(true);
      setContextMenu(null);
      return;
    }

    // 히스토리 추가
    selectedItems.forEach(async (evidenceId) => {
      try {
        await onAddHistory({
          project_id: projectId || '',
          evidence_id: evidenceId,
          type: 'PRINT',
        });

        const qs = new URLSearchParams({
          projectId: effectiveProjectId || '',
          officeId: effectiveOfficeId || '',
          print: 'true',
        });
        const printUrl = `/demo-viewer/${evidenceId}?${qs.toString()}`;
        window.open(printUrl, '_blank');
        setTimeout(() => setSelectedItems([]), 100);
      } catch (error) {
        console.error('인쇄 중 오류 발생:', error);
      }
    });
  };

  // !우클릭 메뉴 클릭 시 실행 함수
  const handleMenuAction = (action: string) => {
    let memoCell: HTMLElement | null;
    let row: Element | null;
    if (selectedItems.length === 0) {
      setIsWarningOpen(true);
      setContextMenu(null);
      return;
    }

    const selectedEvidenceId = selectedItems[0]; // 선택된 첫 번째 항목의 evidenceId
    const selectedEvidence = displayData.find((item) => item.evidence_id === selectedEvidenceId);

    if (action === 'note' && selectedItems.length > 1) {
      onMessageToast({
        message: '하나의 문서를 선택해주세요',
        icon: <IoIosWarning className='h-5 w-5 text-yellow-500' />,
      });
      setContextMenu(null);
      setSelectedItems([]);

      return;
    }

    switch (action) {
      case 'note':
        setOpenFilter(null);
        row = document.querySelector(`[data-evidence-id="${selectedItems[0]}"]`);
        memoCell = row ? row.querySelector('.memo-cell') : null;
        if (memoCell) {
          const rect = memoCell.getBoundingClientRect();
          setMemoPosition({
            top: rect.top + rect.height, // 행의 하단 위치
            left: rect.left,
          });

          // 무조건 새 메모 작성창 열기
          setWritingMemoId(contextMenu?.itemId.toString() || '');
          setNewMemoContent('');

          setFixedMemoId(null);
          setIsEditing(null);
        }
        break;
      case 'bookmark':
        handleSaveBookmark();
        break;
      case 'view':
        handleViewDocument(selectedEvidenceId, selectedEvidence?.page_count || 0);

        break;
      case 'download':
        handleDownloadDocuments();
        break;
      case 'downloadText':
        handleDownloadTextDocuments();
        break;
      case 'pin':
        handlePinToggle(selectedItems);
        break;
      case 'move':
        if (action === 'move' && contextMenu) {
          setShowDragHandles(contextMenu.itemId.toString());
        }
        break;
      case 'print':
        handlePrint();
        break;
      default:
    }

    setContextMenu(null); // 우클릭 메뉴 닫기
  };

  // !문서보기 클릭 시 새창으로 열림 함수
  const handleViewPDF = async (pageCount: number) => {
    if (pageCount < 1) {
      onMessageToast({
        message: 'PDF문서가 없습니다.',
        icon: <IoIosWarning className='h-5 w-5 text-yellow-500' />,
      });
      return;
    }
    setContextMenu(null);

    if (selectedItems.length === 0) {
      setIsWarningOpen(true);
      setContextMenu(null);
      return;
    }

    setTimeout(() => setSelectedItems([]), 500);

    // 각 선택된 항목에 대해 처리
    for (const evidenceId of selectedItems) {
      try {
        // 히스토리 추가
        await onAddHistory({
          project_id: projectId || '',
          evidence_id: evidenceId,
          type: 'EVIDENCE_VIEW',
        });

        const qs = new URLSearchParams({
          projectId: effectiveProjectId || '',
          officeId: effectiveOfficeId || '',
        });
        const newWindow = window.open(`/demo-viewer/${evidenceId}?${qs.toString()}`, '_blank');
        if (!newWindow) {
          onMessageToast({
            message: '팝업 차단이 활성화되어 있습니다. 팝업 차단을 해제해주세요.',
            icon: <IoIosWarning className='h-5 w-5 text-yellow-500' />,
          });
        }
      } catch (error) {
        console.error('PDF 보기 오류:', error);
        onMessageToast({
          message: 'PDF 문서를 불러오는 중 오류가 발생했습니다.',
          icon: <IoIosWarning className='h-5 w-5 text-yellow-500' />,
        });
      }
    }
  };

  const handleViewText = () => {
    setContextMenu(null);
    if (selectedItems.length === 0) {
      setIsWarningOpen(true);
      setContextMenu(null);
      return;
    }
    selectedItems.forEach((evidenceId) => {
      // 해당 evidenceId의 증거 항목 찾기
      const selectedEvidence = displayData.find((item) => item.evidence_id === evidenceId);
      const evidenceName = selectedEvidence?.evidence_title || '텍스트 문서';

      // 이름을 URL 인코딩하여 쿼리 파라미터로 추가
      const encodedName = encodeURIComponent(evidenceName);
      const newWindow = window.open(
        `/evidence/text/${evidenceId}?projectId=${effectiveProjectId}&officeId=${effectiveOfficeId}&evidenceName=${encodedName}`,
        '_blank',
      );
      setTimeout(() => setSelectedItems([]), 500);
      if (!newWindow) {
        onMessageToast({
          message: '팝업 차단이 활성화되어 있습니다. 팝업 차단을 해제해주세요.',
          icon: <IoIosWarning className='h-5 w-5 text-yellow-500' />,
        });
      }
    });
  };

  const keyDownTriggered = useRef(false);
  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      if (keyDownTriggered.current) return;

      keyDownTriggered.current = true;
      setTimeout(() => {
        keyDownTriggered.current = false;
      }, 300);

      if (tempInput.trim().length >= 2) {
        setSelectedNameFilters([]);
        setSelectedReferenceFilters([]);
        setSelectedCategoryFilters([]);
        setSelectedBookmarkFilters([]);
        setSelectedMemoFilters([]);
        setSearchExecuted(false);
        setIsSearching(true);
        setHideSearchCount(true); // 검색 시작 시 갯수 숨김
        setCurrentPage(1); // 검색 시 페이지를 1로 리셋
        setSelectedPage(1); // 페이지 입력 필드도 1로 초기화
        console.log('검색 시작 (엔터) - hideSearchCount를 true로 설정');

        refetchListEvidence();
      } else if (tempInput.trim().length === 0) {
        setSearchExecuted(false);
        setIsSearching(true);
        setHideSearchCount(true); // 검색 시작 시 갯수 숨김
        setCurrentPage(1); // 검색 시 페이지를 1로 리셋
        setSelectedPage(1); // 페이지 입력 필드도 1로 초기화

        refetchListEvidence();
      } else {
        onMessageToast({
          message: '검색어는 2글자 이상 입력해주세요.',
          icon: <IoIosWarning className='h-5 w-5 text-yellow-500' />,
        });
      }
    }
  };
  const handleSearchClick = () => {
    if (tempInput.trim().length >= 2) {
      setSelectedNameFilters([]);
      setSelectedReferenceFilters([]);
      setSelectedCategoryFilters([]);
      setSelectedBookmarkFilters([]);
      setSelectedMemoFilters([]);
      setSearchExecuted(false);
      setIsSearching(true);
      setHideSearchCount(true); // 검색 시작 시 갯수 숨김
      setCurrentPage(1); // 검색 시 페이지를 1로 리셋
      setSelectedPage(1); // 페이지 입력 필드도 1로 초기화
      refetchListEvidence();
    } else if (tempInput.trim().length === 0) {
      setSearchExecuted(false);
      setIsSearching(true);
      setHideSearchCount(true); // 검색 시작 시 갯수 숨김
      setCurrentPage(1); // 검색 시 페이지를 1로 리셋
      setSelectedPage(1); // 페이지 입력 필드도 1로 초기화
      refetchListEvidence();
    } else {
      onMessageToast({
        message: '검색어는 2글자 이상 입력해주세요.',
        icon: <IoIosWarning className='h-5 w-5 text-yellow-500' />,
      });
    }
  };

  const handleUploadSuccess = () => {
    refetchListEvidence();
    setIsUploadModalOpen(false); // 모달 닫기
  };
  // ! 페이지네이션 함수
  const handlePageMove = () => {
    const totalPages = listEvidenceOutput?.data?.pagination.pages || 1;

    if (selectedPage >= 1 && selectedPage <= totalPages) {
      setCurrentPage(selectedPage); // 현재 페이지를 입력된 페이지 번호로 업데이트
      refetchListEvidence(); // 데이터 새로 가져오기
    } else {
      onMessageToast({
        message: `1 ~ ${totalPages} 사이의 숫자를 입력해주세요.`,
        icon: <IoIosWarning className='h-5 w-5 text-yellow-500' />,
      });
    }
  };

  useEffect(() => {
    const query = searchParams.get('query') || '';
    setTempInput(query);
  }, [searchParams]);
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setTempInput(e.target.value);
    // 검색어 입력 시 검색 결과 개수 숨김
    if (searchExecuted) {
      setSearchExecuted(false);
      setIsSearching(false);
    }
  };
  // 우클릭 메뉴 바깥 클릭 시 닫기
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      const isClickOutside = !(event.target as Element).closest('.memo-hover-modal');
      if (isClickOutside && !isEditing && !writingMemoId) {
        setFixedMemoId(null);
      }
    };
    const handleScroll = () => {
      // 메모 텍스트 영역의 스크롤 이벤트는 무시
      const isTextareaScroll = (event?.target as Element)?.closest('.memo-textarea');
      if (isTextareaScroll) return;

      setIsEditing(null); // 페이지 스크롤 시에만 편집 모달 닫기
      if (!writingMemoId) {
        setFixedMemoId(null);
      }
    };
    document.addEventListener('click', handleClickOutside);
    window.addEventListener('scroll', handleScroll, true);

    return () => {
      document.removeEventListener('click', handleClickOutside);
      window.removeEventListener('scroll', handleScroll, true);
    };
  }, [isEditing, writingMemoId]);

  useEffect(() => {
    const handleHorizontalScroll = (event: WheelEvent) => {
      if (tableContainerRef.current) {
        tableContainerRef.current.scrollLeft -= event.deltaY; // deltaY 값을 반대로 적용
      }
    };

    const currentTable = tableContainerRef.current;

    // 이벤트 리스너 추가
    currentTable?.addEventListener('wheel', handleHorizontalScroll);

    // 클린업 함수로 이벤트 리스너 제거
    return () => currentTable?.removeEventListener('wheel', handleHorizontalScroll);
  }, []);
  // !요약관련
  const handleSummaryPdfClick = (evidenceId: string) => {
    const url = `/demo-summary-pdf/${evidenceId}?projectId=${effectiveProjectId}&officeId=${effectiveOfficeId}`;
    window.open(url, '_blank');
  };
  // const handleSummaryCopy = (text: string) => {
  //   navigator.clipboard.writeText(text);
  //   onMessageToast({
  //     message: '요약이 복사되었습니다.',
  //   });
  // };

  // const openSummaryInNewWindow = (evidenceId: string, evidenceTitle: string) => {
  //   const url = `/evidence/summary/${evidenceId}?projectId=${projectId}&officeId=${officeId}&evidenceName=${evidenceTitle}`;
  //   window.open(url, '_blank');
  // };
  // ! API 응답에서 핀 상태 업데이트
  useEffect(() => {
    if (listEvidenceOutput?.data?.results) {
      const pinnedFromApi = listEvidenceOutput.data.results.filter((item) => item.isPinned).map((item) => item.evidence_id);
      const pinnedSet = new Set(pinnedFromApi);

      // DEMO: 로컬 override 병합
      Object.entries(demoPinnedByEvidenceId).forEach(([id, isPinned]) => {
        if (isPinned) pinnedSet.add(id);
        else pinnedSet.delete(id);
      });

      setPinnedItems(Array.from(pinnedSet));
    }
  }, [listEvidenceOutput, demoPinnedByEvidenceId]);

  const queryParam = searchParams.get('query');

  const selectAllRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (selectAllRef.current) {
      selectAllRef.current.indeterminate =
        selectedItems.length > 0 && selectedItems.length < (listEvidenceOutput?.data?.results?.length || 0);
    }
  }, [selectedItems, listEvidenceOutput]);

  // 검색어 처리를 위한 useEffect 추가
  useEffect(() => {
    if (!queryParam) {
      refetchListEvidence();
    } else {
      setSelectedNameFilters([]);
      setSelectedReferenceFilters([]);
      setSelectedCategoryFilters([]);
      setSelectedBookmarkFilters([]);
      setSelectedMemoFilters([]);
      setSelectedMissingPageFilters([]);

      setTempInput(queryParam);
      refetchListEvidence();
    }
  }, [queryParam, currentPage, itemsPerPage]); // eslint-disable-line react-hooks/exhaustive-deps

  console.log(fixedMemoId);
  // 모달 외부 클릭 핸들러
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      const isClickOutside = !(event.target as Element).closest('.memo-hover-modal');

      // ✨ 수정 중 or 새 메모 작성 중이면 닫지 않음
      if (isClickOutside && !isEditing && !writingMemoId) {
        setFixedMemoId(null);
      }
    };

    const handleScroll = () => {
      if (!isEditing && !writingMemoId) {
        setFixedMemoId(null);
      }
    };

    document.addEventListener('click', handleClickOutside);
    window.addEventListener('scroll', handleScroll, true);

    return () => {
      document.removeEventListener('click', handleClickOutside);
      window.removeEventListener('scroll', handleScroll, true);
    };
  }, [isEditing, writingMemoId]); /* eslint-disable react-hooks/exhaustive-deps */
  useEffect(() => {
    if (
      selectedNameFilters.length > 0 ||
      selectedSummaryFilters.length > 0 ||
      selectedReferenceFilters.length > 0 ||
      selectedCategoryFilters.length > 0 ||
      selectedBookmarkFilters.length > 0 ||
      selectedMemoFilters.length > 0 ||
      selectedMissingPageFilters.length > 0 ||
      selectedTagFilters.length > 0
    ) {
      refetchListEvidence();
    }
  }, [
    selectedNameFilters,
    selectedSummaryFilters,
    selectedReferenceFilters,
    selectedCategoryFilters,
    selectedBookmarkFilters,
    selectedMemoFilters,
    selectedMissingPageFilters,
    selectedTagFilters,
  ]);

  useEffect(() => {
    void delayUtil(1000).then(() => {
      if (isMountedHook()) setIsMounted(true);
    });
  }, [isMountedHook]);

  // 검색이 완료되었을 때 상태 업데이트
  useEffect(() => {
    if (isSearching && !isLoading && listEvidenceOutput?.data) {
      const hasSearchKeyword = tempInput.trim().length > 0 || powerSearch.length > 0;

      if (hasSearchKeyword) {
        // 검색어가 있는 경우: highlights가 포함된 데이터가 와야 검색 완료
        const hasHighlights = listEvidenceOutput.data.results?.some(
          (evidence: any) =>
            evidence.highlights &&
            evidence.highlights.some((highlight: any) =>
              highlight.texts.some((text: any) => text.type === 'hit' || text.value.startsWith('#')),
            ),
        );

        if (hasHighlights) {
          console.log('검색 완료 (하이라이트 포함) - hideSearchCount를 false로 설정');
          setIsSearching(false);
          setSearchExecuted(true);
          setHideSearchCount(false); // 검색 완료 시 갯수 표시 허용
        }
      } else {
        // 검색어가 없는 경우: 데이터만 오면 검색 완료
        console.log('검색 완료 (검색어 없음) - hideSearchCount를 false로 설정');
        setIsSearching(false);
        setSearchExecuted(true);
        setHideSearchCount(false); // 검색 완료 시 갯수 표시 허용
      }
    }
  }, [isSearching, isLoading, listEvidenceOutput, tempInput, powerSearch]);

  // ! 우클릭 시
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (contextMenuRef.current && !contextMenuRef.current.contains(event.target as Node)) {
        setContextMenu(null); // 메뉴를 닫습니다.
      }
    };

    if (contextMenu) {
      document.addEventListener('mousedown', handleClickOutside);
    } else {
      // 메뉴가 닫히면 이벤트 리스너를 제거합니다.
      document.removeEventListener('mousedown', handleClickOutside);
    }

    // 컴포넌트가 언마운트되거나 contextMenu 상태가 변경되기 전에 리스너를 정리합니다.
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [contextMenu]); // contextMenu 상태가 변경될 때마다 이 effect를 재실행합니다.

  return (
    <div>
      <S.AllBody>
        <div id='evidence-table-head' className='absolute right-[5%] top-[120px] z-20 flex items-center'>
          <div className=''>
            <div className='hidden lg:flex'>
              <div className='relative'>
                <FiSearch
                  className='absolute right-4 top-1/2 -translate-y-1/2 transform cursor-pointer text-[25px] text-gray-500'
                  onClick={handleSearchClick}
                />
                {searchExecuted && !powerSearch && tempInput && (
                  <>
                    <button
                      className='mr-[16px] h-[48px] w-[105px] rounded-[8px] bg-[#004AA4] text-[16px] text-white'
                      onClick={handleReset}
                    >
                      검색 초기화
                    </button>
                  </>
                )}
                {powerSearch && (
                  <>
                    <button
                      className='mr-[16px] h-[48px] w-[105px] rounded-[8px] bg-[#004AA4] text-[16px] text-white'
                      onClick={handleReset}
                    >
                      검색 초기화
                    </button>
                  </>
                )}
                <input
                  type='text'
                  placeholder='검색어를 입력해주세요'
                  value={tempInput} // 입력값 반영
                  onChange={handleInputChange}
                  onKeyDown={handleKeyDown} // 엔터 키 이벤트 처리
                  className='focus:border[#005AA1] h-[48px] rounded-[8px] pl-4 focus:outline-none focus:ring-1 focus:ring-[#0050B3] lg:w-[277px]'
                />
                {tempInput && (
                  <IoMdCloseCircle
                    className='absolute right-12 top-1/2 -translate-y-1/2 transform cursor-pointer text-xl text-gray-500'
                    onClick={handleClearInput}
                  />
                )}
              </div>
              <div
                className='ml-2 flex h-[48px] w-[120px] cursor-pointer items-center justify-center rounded-[8px] border border-[#DBDBDB] text-[#252525]'
                onClick={handlePowerSearch}
              >
                <img src={PowerSearch} alt='powerSearch' className='mr-[6px] h-[35px] w-[35px]' />
                파워검색
              </div>
            </div>
          </div>
        </div>

        {/* 파워검색 모달 */}
        <PowerSearchModal
          isOpen={isPowerSearchModalOpen}
          onClose={() => setIsPowerSearchModalOpen(false)}
          onSearch={handlePowerSearchSubmit}
          reset={resetPowerSearch}
        />

        <DragDropContext onDragEnd={handleDragEnd}>
          <div className='relative'>
            {/* 플로팅 메뉴 */}

            <div
              id='evidence-floating-menu'
              className={cn(
                `fixed top-[370px] z-[50] flex hidden -translate-y-1/2 flex-col gap-3 rounded-[12px] bg-white p-[7px] shadow-lg lg:flex 2xl:left-[20px]`,
                selectedItems.length > 0 ? 'border border-[#1890FF]' : 'border border-[#e5e5e5]',
              )}
            >
              <div className={cn('text-center text-[12px]', selectedItems.length > 0 ? 'text-[#1890FF]' : 'text-[#C2C2C2]')}>
                {selectedItems.length}개 선택
              </div>

              {/* 문서보기 */}
              <div className='group relative'>
                <div
                  className={cn('flex cursor-pointer items-center justify-center rounded-lg p-[7px] hover:bg-gray-100')}
                  onClick={() => {
                    if (selectedItems.length === 0) {
                      setIsWarningOpen(true);
                      setContextMenu(null);
                      return;
                    }
                    const selectedItem = listEvidenceOutput?.data?.results?.find((item) => item.evidence_id === selectedItems[0]);
                    handleViewPDF(selectedItem?.page_count || 0);
                  }}
                >
                  <img src={Eys} className='' />
                </div>
                {selectedItems.length > 0 ? (
                  // 항목이 선택되었을 때 서브메뉴 표시
                  <div className={cn('submenu absolute left-[50px] top-0 hidden group-hover:block')}>
                    <div className={cn('z-[9999] rounded-[8px] border border-[#E5E5E5] bg-white shadow-lg')}>
                      <div
                        className='cursor-pointer whitespace-nowrap rounded-t-[8px] p-2 hover:bg-[#0050B3] hover:text-white'
                        onClick={() => {
                          const selectedItem = listEvidenceOutput?.data?.results?.find((item) => item.evidence_id === selectedItems[0]);
                          handleViewPDF(selectedItem?.page_count || 0);
                        }}
                      >
                        PDF 파일보기
                      </div>
                      <div
                        className='cursor-pointer whitespace-nowrap rounded-b-[8px] p-2 hover:bg-[#0050B3] hover:text-white'
                        onClick={handleViewText}
                      >
                        텍스트 파일보기
                      </div>
                    </div>
                  </div>
                ) : (
                  // 선택된 항목이 없을 때 툴팁 표시
                  <div className='absolute left-[50px] top-1/2 hidden h-[36px] w-[77px] -translate-y-1/2 rounded-md border border-[#e5e5e5] bg-white text-center text-[14px] leading-[36px] text-[#666] shadow-lg group-hover:block'>
                    증거보기
                  </div>
                )}
              </div>

              {/* 북마크 */}
              <div className='group relative'>
                <div className='cursor-pointer rounded-lg p-[7px] hover:bg-gray-100' onClick={() => handleMenuAction('bookmark')}>
                  <img src={Star} className='' />
                </div>
                <div className='absolute left-[50px] top-1/2 hidden h-[36px] w-[65px] -translate-y-1/2 rounded-md border border-[#e5e5e5] bg-white text-center text-[14px] leading-[36px] text-[#666] shadow-lg group-hover:block'>
                  북마크
                </div>
              </div>

              {/* 메모 */}
              <div className={`group relative ${selectedItems.length > 1 ? 'cursor-not-allowed opacity-50' : ''}`}>
                <div
                  className={`flex items-center justify-center rounded-lg p-[7px] ${
                    selectedItems.length > 1 ? 'cursor-not-allowed' : 'cursor-pointer hover:bg-gray-100'
                  }`}
                  onClick={() => {
                    if (selectedItems.length === 0) {
                      setIsWarningOpen(true);
                      setContextMenu(null);
                      return;
                    }
                    setOpenFilter(null);
                    if (selectedItems.length === 1) {
                      // contextMenu 상태 없이도 동작하도록 수정
                      const row = document.querySelector(`[data-evidence-id="${selectedItems[0]}"]`);
                      const memoCell = row ? row.querySelector('.memo-cell') : null;

                      if (memoCell) {
                        const rect = memoCell.getBoundingClientRect();
                        setMemoPosition({
                          top: rect.top + rect.height, // 행의 하단 위치
                          left: rect.left,
                        });

                        // 무조건 새 메모 작성창 열기
                        setWritingMemoId(selectedItems[0]);
                        setNewMemoContent('');

                        setFixedMemoId(null);
                        setIsEditing(null);
                      }
                    }
                  }}
                >
                  {selectedItems.length > 1 ? (
                    <div className='rounded-[8px] border border-[#E5E5E5] bg-[#f5f5f5]'>
                      <img src={NoteNone} alt='note' />
                    </div>
                  ) : (
                    <img src={Note} alt='note' />
                  )}
                </div>
                <div
                  className={`absolute left-[50px] top-1/2 hidden min-h-[36px] min-w-[50px] -translate-y-1/2 rounded-md border border-[#e5e5e5] bg-white px-2 text-center text-[14px] leading-[36px] text-[#666] shadow-lg group-hover:block ${
                    selectedItems.length > 1 ? 'w-[240px]' : ''
                  }`}
                >
                  {selectedItems.length > 1 ? '하나의 문서를 선택해주세요' : '메모'}
                </div>
              </div>
              {/* 다운로드 */}
              <div className='group relative'>
                <div
                  className='cursor-pointer rounded-lg p-[7px] hover:bg-gray-100'
                  onClick={() => {
                    if (selectedItems.length === 0) {
                      setIsWarningOpen(true);
                      setContextMenu(null);
                      return;
                    }
                  }}
                >
                  <img src={Down} className='' />
                </div>
                {selectedItems.length > 0 ? (
                  <div className='submenu absolute left-[50px] top-0 hidden min-w-[96px] group-hover:block'>
                    <div className='z-[9999] rounded-[8px] border border-[#E5E5E5] bg-white shadow-lg'>
                      <div
                        className='cursor-pointer whitespace-nowrap rounded-t-[8px] p-2 hover:bg-[#0050B3] hover:text-white'
                        onClick={handleDownloadDocuments}
                      >
                        PDF 파일
                      </div>
                      <div
                        className='cursor-pointer whitespace-nowrap rounded-b-[8px] p-2 hover:bg-[#0050B3] hover:text-white'
                        onClick={handleDownloadTextDocuments}
                      >
                        텍스트 파일
                      </div>
                    </div>
                  </div>
                ) : (
                  <div className='absolute left-[50px] top-1/2 hidden h-[36px] w-[77px] -translate-y-1/2 rounded-md border border-[#e5e5e5] bg-white text-center text-[14px] leading-[36px] text-[#666] shadow-lg group-hover:block'>
                    다운로드
                  </div>
                )}
              </div>

              {/* 인쇄 */}
              <div className='group relative'>
                <div className='cursor-pointer rounded-lg p-[7px] hover:bg-gray-100' onClick={() => handleMenuAction('print')}>
                  <img src={Print} className='' />
                </div>
                <div className='absolute left-[50px] top-1/2 hidden h-[36px] min-w-[50px] -translate-y-1/2 rounded-md border border-[#e5e5e5] bg-white text-center text-[14px] leading-[36px] text-[#666] shadow-lg group-hover:block'>
                  인쇄
                </div>
              </div>
            </div>
          </div>
          <div className='mt-4 flex justify-center'>
            <div id='evidence-table-body' className='w-[90%] 2xl:w-[90%]'>
              {(powerSearch || (tempInput && searchExecuted)) && (
                <div className='flex text-[12px]'>
                  {' '}
                  {powerSearch && (
                    <span className='text-[12px] text-[#666]'>
                      '<span className='text-[#252525 font-medium'>{powerSearch.replace(/#/g, '')}</span>' 포함
                    </span>
                  )}{' '}
                  {tempInput && !powerSearch && searchExecuted && (
                    <span className='text-[12px]'>
                      '<span className='font-medium text-[#252525]'>{tempInput}</span>'
                    </span>
                  )}
                  {excludeTerms.length > 0 && excludeTerms[0] !== '' && (
                    <span className='text-[12px]'>
                      , '<span className='font-medium'>{excludeTerms.join(', ')}</span>' 제외
                    </span>
                  )}
                  {searchExecuted && !powerSearch && (
                    <>
                      {isSearching ? (
                        <div className='flex items-center gap-2'>
                          <div className='h-2 w-16 overflow-hidden rounded-full bg-gray-200'>
                            <div className='h-full animate-pulse rounded-full bg-blue-500'></div>
                          </div>
                          <span className='text-[12px] text-[#666]'>검색 중...</span>
                        </div>
                      ) : (
                        <>
                          {(() => {
                            const hasHighlights = listEvidenceOutput?.data?.results?.some(
                              (evidence: any) =>
                                evidence.highlights &&
                                evidence.highlights.some((highlight: any) =>
                                  highlight.texts.some((text: any) => text.type === 'hit' || text.value.startsWith('#')),
                                ),
                            );
                            console.log('검색 결과 갯수 표시 조건:', {
                              hideSearchCount,
                              hasHighlights,
                              total: listEvidenceOutput?.data?.pagination?.total,
                            });
                            return !hideSearchCount && hasHighlights;
                          })() && (
                            <span className='pl-1 text-[12px] text-[#666]'>
                              검색결과 ({listEvidenceOutput?.data?.pagination?.total || 0}개)
                            </span>
                          )}
                        </>
                      )}
                      <button className='ml-[8px] text-[12px] text-[#FF0000] underline' onClick={handleReset}>
                        초기화
                      </button>
                    </>
                  )}
                  {powerSearch && (
                    <>
                      {isSearching ? (
                        <div className='flex items-center gap-2'>
                          <div className='h-2 w-16 overflow-hidden rounded-full bg-gray-200'>
                            <div className='h-full animate-pulse rounded-full bg-blue-500'></div>
                          </div>
                          <span className='text-[12px] text-[#666]'>검색 중...</span>
                        </div>
                      ) : (
                        <>
                          {(() => {
                            const hasHighlights = listEvidenceOutput?.data?.results?.some(
                              (evidence: any) =>
                                evidence.highlights &&
                                evidence.highlights.some((highlight: any) =>
                                  highlight.texts.some((text: any) => text.type === 'hit' || text.value.startsWith('#')),
                                ),
                            );

                            // 파워 검색의 경우 하이라이트가 없어도 갯수 표시
                            const shouldShowCount = !hideSearchCount && (hasHighlights || powerSearch);

                            console.log('파워 검색 결과 갯수 표시 조건:', {
                              hideSearchCount,
                              hasHighlights,
                              powerSearch,
                              shouldShowCount,
                              total: listEvidenceOutput?.data?.pagination?.total,
                              resultsLength: listEvidenceOutput?.data?.results?.length,
                            });

                            return shouldShowCount;
                          })() && (
                            <span className='pl-1 text-[12px] text-[#666]'>
                              검색결과 ({listEvidenceOutput?.data?.pagination?.total || 0}개)
                            </span>
                          )}
                        </>
                      )}
                      <button className='ml-[8px] text-[12px] text-[#FF0000] underline' onClick={handleReset}>
                        초기화
                      </button>
                    </>
                  )}
                </div>
              )}
              {/* 헤더  시작 */}
              <div
                className='evidence-table-container evidence-table-scroll relative max-h-[calc(100vh-300px)] w-full'
                style={{ overflowX: 'auto', overflowY: 'auto' }}
              >
                <div className='w-full' ref={tableContainerRef} style={{ minWidth: `${totalTableMinWidth}px` }}>
                  <Droppable droppableId='evidence-table'>
                    {(provided) => (
                      <table
                        className=''
                        ref={provided.innerRef}
                        {...provided.droppableProps}
                        style={{
                          tableLayout: 'fixed',
                          width: '100%',
                        }}
                      >
                        <thead className='evidence-table-header sticky top-0 z-50 bg-[#E6EFFF] font-bold text-[#252525]'>
                          {/* 메인 헤더 */}
                          <tr className='h-[52px]'>
                            {/* 체크박스 컬럼 헤더 수정 */}
                            <th
                              className='cursor-col-resize whitespace-nowrap rounded-tl-[8px] pb-[26px] pt-[8px] hover:after:absolute hover:after:right-0 hover:after:top-0 hover:after:z-10 hover:after:mr-[1.5px] hover:after:h-full hover:after:w-[6px] hover:after:bg-[#97C0F1] hover:after:content-[""]'
                              data-column-id='checkbox'
                              style={{
                                width: `${columnWidths.checkbox}px`,
                                minWidth: `${columnWidths.checkbox}px`,
                                position: 'relative',
                              }}
                              onMouseDown={(e) => handleMouseDown(e, 'checkbox')}
                            >
                              <div className='flex items-center justify-center'>
                                <input
                                  ref={selectAllRef}
                                  type='checkbox'
                                  className='h-[20px] w-[20px] rounded-[2px] border-[#CCD0D1] text-[#4577A4] outline-none focus:ring-0'
                                  onChange={(e) => handleSelectAllChange(e.target.checked)}
                                  checked={
                                    selectedItems.length === (listEvidenceOutput?.data?.results?.length || 0) &&
                                    (listEvidenceOutput?.data?.results?.length || 0) > 0
                                  }
                                  onClick={(e) => e.stopPropagation()}
                                />
                              </div>
                            </th>
                            <th
                              className='w-[5%] min-w-[50px] cursor-col-resize whitespace-nowrap pb-[26px] pt-[8px] hover:after:absolute hover:after:right-0 hover:after:top-0 hover:after:z-10 hover:after:mr-[1.5px] hover:after:h-full hover:after:w-[6px] hover:after:bg-[#97C0F1] hover:after:content-[""]'
                              data-column-id='evidence_number'
                              style={{
                                width: `${columnWidths.evidence_number}px`,
                                minWidth: `${columnWidths.evidence_number}px`,
                                position: 'relative',
                              }}
                              onMouseDown={(e) => {
                                // 정렬 버튼 클릭 시에는 리사이징 이벤트를 막음
                                if ((e.target as HTMLElement).closest('button')) {
                                  return;
                                }
                                handleMouseDown(e, 'evidence_number');
                              }}
                            >
                              <div className='flex items-center'>
                                <button onClick={() => handleHeaderSort('evidence_number')} className='ml-1'>
                                  {sortColumn === 'evidence_number' ? (
                                    sortDirection === 'asc' ? (
                                      <img src={clumHIcon} className='h-[20px] w-[20px]' alt='오름차순' />
                                    ) : sortDirection === 'desc' ? (
                                      <img src={clumBIcon} className='h-[20px] w-[20px]' alt='내림차순' />
                                    ) : (
                                      <img src={allSortIcon} className='h-[20px] w-[20px]' alt='기본 정렬' />
                                    )
                                  ) : (
                                    <img src={allSortIcon} className='h-[20px] w-[20px]' alt='기본 정렬' />
                                  )}
                                </button>
                                <span
                                  className={`text-[#252525] ${getFontSizeClass(12, fontSizeAdjustment)}`}
                                  style={{ fontSize: `${getAdjustedSize(12)}px` }}
                                >
                                  순번
                                </span>
                              </div>
                            </th>
                            <th
                              id='author'
                              data-column-id='author'
                              style={{
                                width: `${columnWidths.author}px`,
                                minWidth: `${columnWidths.author}px`,
                                position: 'relative',
                              }}
                              className='w-[5%] min-w-[50px] cursor-col-resize whitespace-nowrap pb-[26px] pt-[8px] hover:after:absolute hover:after:right-0 hover:after:top-0 hover:after:z-10 hover:after:mr-[1.5px] hover:after:h-full hover:after:w-[6px] hover:after:bg-[#97C0F1] hover:after:content-[""] 2xl:w-[15%]'
                            >
                              <div className='absolute inset-0' onMouseDown={(e) => handleMouseDown(e, 'author')} />
                              <div className='flex items-center'>
                                <span
                                  className={`text-[#252525] ${getFontSizeClass(12, fontSizeAdjustment)}`}
                                  style={{ fontSize: `${getAdjustedSize(12)}px` }}
                                >
                                  작성
                                </span>
                              </div>
                            </th>
                            <th
                              id='sequence_number'
                              data-column-id='sequence_number'
                              style={{
                                width: `${columnWidths.sequence_number}px`,
                                minWidth: `${columnWidths.sequence_number}px`,
                                position: 'relative',
                              }}
                              className='w-[5%] min-w-[50px] cursor-col-resize whitespace-nowrap pb-[26px] pt-[8px] hover:after:absolute hover:after:right-0 hover:after:top-0 hover:after:z-10 hover:after:mr-[1.5px] hover:after:h-full hover:after:w-[6px] hover:after:bg-[#97C0F1] hover:after:content-[""] 2xl:w-[15%]'
                            >
                              <div className='absolute inset-0' onMouseDown={(e) => handleMouseDown(e, 'sequence_number')} />
                              <div className='flex items-center'>
                                <span
                                  className={`text-[#252525] ${getFontSizeClass(12, fontSizeAdjustment)}`}
                                  style={{ fontSize: `${getAdjustedSize(12)}px` }}
                                >
                                  책
                                </span>
                              </div>
                            </th>
                            <th
                              className='w-[4%] min-w-[40px] cursor-col-resize whitespace-nowrap pb-[26px] pt-[8px] hover:after:absolute hover:after:right-0 hover:after:top-0 hover:after:z-10 hover:after:mr-[1.5px] hover:after:h-full hover:after:w-[6px] hover:after:bg-[#97C0F1] hover:after:content-[""]'
                              data-column-id='start_page'
                              style={{
                                width: `${columnWidths.start_page}px`,
                                minWidth: `${columnWidths.start_page}px`,
                                position: 'relative',
                              }}
                              onMouseDown={(e) => {
                                if ((e.target as HTMLElement).closest('button')) {
                                  return;
                                }
                                handleMouseDown(e, 'start_page');
                              }}
                            >
                              <div className='flex items-center'>
                                <button onClick={() => handleHeaderSort('start_page')} className='ml-1'>
                                  {sortColumn === 'start_page' ? (
                                    sortDirection === 'asc' ? (
                                      <img src={clumHIcon} className='h-[20px] w-[20px]' alt='오름차순' />
                                    ) : sortDirection === 'desc' ? (
                                      <img src={clumBIcon} className='h-[20px] w-[20px]' alt='내림차순' />
                                    ) : (
                                      <img src={allSortIcon} className='h-[20px] w-[20px]' alt='기본 정렬' />
                                    )
                                  ) : (
                                    <img src={allSortIcon} className='h-[20px] w-[20px]' alt='기본 정렬' />
                                  )}
                                </button>
                                <span
                                  className={`text-[#252525] ${getFontSizeClass(12, fontSizeAdjustment)}`}
                                  style={{ fontSize: `${getAdjustedSize(12)}px` }}
                                >
                                  쪽수
                                </span>
                              </div>
                            </th>

                            <th
                              id='evidence-title-head'
                              data-column-id='evidence_title'
                              style={{
                                width: `${columnWidths.evidence_title}px`,
                                minWidth: `${columnWidths.evidence_title}px`,
                                position: 'relative',
                              }}
                              className='w-[15%] min-w-[250px] cursor-col-resize whitespace-nowrap pb-[26px] pt-[8px] hover:after:absolute hover:after:right-0 hover:after:top-0 hover:after:z-10 hover:after:mr-[1.5px] hover:after:h-full hover:after:w-[6px] hover:after:bg-[#97C0F1] hover:after:content-[""] 2xl:w-[15%]'
                            >
                              <div className='absolute inset-0' onMouseDown={(e) => handleMouseDown(e, 'evidence_title')} />
                              <div className='flex items-center'>
                                {/*  <button onClick={() => handleHeaderSort('evidence_title')} className='ml-1'>
                                {sortColumn === 'evidence_title' ? (
                                  sortDirection === 'asc' ? (
                                    <img src={clumHIcon} className='h-[20px] w-[20px]' alt='오름차순' />
                                  ) : sortDirection === 'desc' ? ( // 내림차순인지 확인
                                    <img src={clumBIcon} className='h-[20px] w-[20px]' alt='내림차순' />
                                  ) : (
                                    <img src={allSortIcon} className='h-[20px] w-[20px]' alt='기본 정렬' />
                                  )
                                ) : (
                                  <img src={allSortIcon} className='h-[20px] w-[20px]' alt='기본 정렬' />
                                )}
                              </button> */}
                                <span
                                  className={`text-[#252525] ${getFontSizeClass(12, fontSizeAdjustment)}`}
                                  style={{ fontSize: `${getAdjustedSize(12)}px` }}
                                >
                                  증거명칭
                                </span>
                              </div>
                            </th>

                            <th
                              className='w-[13%] min-w-[130px] cursor-col-resize whitespace-nowrap pb-[26px] pt-[8px] hover:after:absolute hover:after:right-0 hover:after:top-0 hover:after:z-10 hover:after:mr-[1.5px] hover:after:h-full hover:after:w-[6px] hover:after:bg-[#97C0F1] hover:after:content-[""]'
                              data-column-id='summary'
                              style={{
                                width: `${columnWidths.summary}px`,
                                minWidth: `${columnWidths.summary}px`,
                                position: 'relative',
                              }}
                            >
                              <div className='absolute inset-0' onMouseDown={(e) => handleMouseDown(e, 'summary')} />
                              <div className='flex items-center'>
                                {/*   <button onClick={() => handleHeaderSort('summary')} className='ml-1'>
                                {sortColumn === 'summary' ? (
                                  sortDirection === 'asc' ? (
                                    <img src={clumHIcon} className='h-[20px] w-[20px]' alt='오름차순' />
                                  ) : sortDirection === 'desc' ? ( // 내림차순인지 확인
                                    <img src={clumBIcon} className='h-[20px] w-[20px]' alt='내림차순' />
                                  ) : (
                                    <img src={allSortIcon} className='h-[20px] w-[20px]' alt='기본 정렬' />
                                  )
                                ) : (
                                  <img src={allSortIcon} className='h-[20px] w-[20px]' alt='기본 정렬' />
                                )}
                              </button> */}
                                <EvidenceListFilter
                                  column='요약'
                                  options={filterData?.data?.summary as unknown as string[]}
                                  onFilter={(values) => {
                                    setSelectedSummaryFilters(values);

                                    setTimeout(() => {
                                      refetchListEvidence();
                                    }, 0);
                                  }}
                                  isOpen={openFilter === 'summary'}
                                  onToggle={() => handleFilterToggle('summary')}
                                />
                              </div>
                            </th>
                            <th
                              scope='col'
                              className='w-[8%] min-w-[70px] cursor-col-resize whitespace-nowrap pb-[26px] pl-4 pr-3 pt-[8px] text-sm font-semibold text-gray-900 hover:after:absolute hover:after:right-0 hover:after:top-0 hover:after:z-10 hover:after:mr-[1.5px] hover:after:h-full hover:after:w-[6px] hover:after:bg-[#97C0F1] hover:after:content-[""]'
                              data-column-id='evidence_name'
                              style={{
                                width: `${columnWidths.evidence_name}px`,
                                minWidth: `${columnWidths.evidence_name}px`,
                                position: 'relative',
                              }}
                              onMouseDown={(e) => {
                                if ((e.target as HTMLElement).closest('button')) {
                                  return;
                                }
                                handleMouseDown(e, 'evidence_name');
                              }}
                            >
                              <div className='flex items-center'>
                                <button onClick={() => handleHeaderSort('evidence_name')} className='ml-1'>
                                  {sortColumn === 'evidence_name' ? (
                                    sortDirection === 'asc' ? (
                                      <img src={clumHIcon} className='h-[20px] w-[20px]' alt='오름차순' />
                                    ) : sortDirection === 'desc' ? (
                                      <img src={clumBIcon} className='h-[20px] w-[20px]' alt='내림차순' />
                                    ) : (
                                      <img src={allSortIcon} className='h-[20px] w-[20px]' alt='기본 정렬' />
                                    )
                                  ) : (
                                    <img src={allSortIcon} className='h-[20px] w-[20px]' alt='기본 정렬' />
                                  )}
                                </button>
                                <EvidenceListFilter
                                  column='성명'
                                  options={filterData?.data?.name as unknown as string[]}
                                  onFilter={(values) => {
                                    setSelectedNameFilters(values);
                                    setTimeout(() => {
                                      refetchListEvidence();
                                    }, 0);
                                  }}
                                  isOpen={openFilter === 'name'}
                                  onToggle={() => handleFilterToggle('name')}
                                />
                              </div>
                            </th>
                            <th
                              className='min-w-[100px] cursor-col-resize whitespace-nowrap pb-[26px] pt-[8px] hover:after:absolute hover:after:right-0 hover:after:top-0 hover:after:z-10 hover:after:mr-[1.5px] hover:after:h-full hover:after:w-[6px] hover:after:bg-[#97C0F1] hover:after:content-[""] 2xl:w-[8%]'
                              data-column-id='reference'
                              style={{
                                width: `${columnWidths.reference}px`,
                                minWidth: `${columnWidths.reference}px`,
                                position: 'relative',
                              }}
                              onMouseDown={(e) => {
                                if ((e.target as HTMLElement).closest('button')) {
                                  return;
                                }
                                handleMouseDown(e, 'reference');
                              }}
                            >
                              <div className='flex items-center'>
                                <button onClick={() => handleHeaderSort('reference')} className='ml-1'>
                                  {sortColumn === 'reference' ? (
                                    sortDirection === 'asc' ? (
                                      <img src={clumHIcon} className='h-[20px] w-[20px]' alt='오름차순' />
                                    ) : (
                                      <img src={clumBIcon} className='h-[20px] w-[20px]' alt='내림차순' />
                                    )
                                  ) : (
                                    <img src={allSortIcon} className='h-[20px] w-[20px]' />
                                  )}
                                </button>
                                <EvidenceListFilter
                                  column='참조사항'
                                  options={filterData?.data?.reference as unknown as string[]}
                                  onFilter={(values) => {
                                    setSelectedReferenceFilters(values);
                                    setTimeout(() => {
                                      refetchListEvidence();
                                    }, 0);
                                  }}
                                  isOpen={openFilter === 'reference'}
                                  onToggle={() => handleFilterToggle('reference')}
                                />
                              </div>
                            </th>
                            <th
                              className='w-[10%] min-w-[100px] cursor-col-resize whitespace-nowrap pb-[26px] pt-[8px] hover:after:absolute hover:after:right-0 hover:after:top-0 hover:after:z-10 hover:after:mr-[1.5px] hover:after:h-full hover:after:w-[6px] hover:after:bg-[#97C0F1] hover:after:content-[""]'
                              data-column-id='category'
                              style={{
                                width: `${columnWidths.category}px`,
                                minWidth: `${columnWidths.category}px`,
                                position: 'relative',
                              }}
                              onMouseDown={(e) => {
                                if ((e.target as HTMLElement).closest('button')) {
                                  return;
                                }
                                handleMouseDown(e, 'category');
                              }}
                            >
                              <div className='flex items-center'>
                                <button
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    handleHeaderSort('category');
                                  }}
                                  className='ml-1'
                                >
                                  {sortColumn === 'category' ? (
                                    sortDirection === 'asc' ? (
                                      <img src={clumHIcon} className='h-[20px] w-[20px]' alt='오름차순' />
                                    ) : sortDirection === 'desc' ? (
                                      <img src={clumBIcon} className='h-[20px] w-[20px]' alt='내림차순' />
                                    ) : (
                                      <img src={allSortIcon} className='h-[20px] w-[20px]' alt='기본 정렬' />
                                    )
                                  ) : (
                                    <img src={allSortIcon} className='h-[20px] w-[20px]' alt='기본 정렬' />
                                  )}
                                </button>
                                <EvidenceListFilter
                                  column='구분'
                                  options={filterData?.data?.category as unknown as string[]}
                                  onFilter={(values) => {
                                    setSelectedCategoryFilters(values);
                                    setTimeout(() => {
                                      refetchListEvidence();
                                    }, 0);
                                  }}
                                  isOpen={openFilter === 'category'}
                                  onToggle={() => handleFilterToggle('category')}
                                />
                              </div>
                            </th>
                            <th
                              className='relative w-[7%] min-w-[110px] cursor-col-resize whitespace-nowrap hover:after:absolute hover:after:right-0 hover:after:top-0 hover:after:z-10 hover:after:mr-[1.5px] hover:after:h-full hover:after:w-[6px] hover:after:bg-[#97C0F1] hover:after:content-[""]'
                              data-column-id='bookmark'
                              style={{
                                width: `${columnWidths.bookmark}px`,
                                minWidth: `${columnWidths.bookmark}px`,
                                position: 'relative',
                              }}
                              onMouseDown={(e) => {
                                if ((e.target as HTMLElement).closest('button')) {
                                  return;
                                }
                                handleMouseDown(e, 'bookmark');
                              }}
                            >
                              <div className='flex items-center justify-center'>
                                <button
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    handleHeaderSort('bookmark');
                                  }}
                                  className='ml-1'
                                >
                                  {sortColumn === 'bookmark' ? (
                                    sortDirection === 'asc' ? (
                                      <img src={clumHIcon} className='h-[20px] w-[20px]' alt='오름차순' />
                                    ) : sortDirection === 'desc' ? (
                                      <img src={clumBIcon} className='h-[20px] w-[20px]' alt='내림차순' />
                                    ) : (
                                      <img src={allSortIcon} className='h-[20px] w-[20px]' alt='기본 정렬' />
                                    )
                                  ) : (
                                    <img src={allSortIcon} className='h-[20px] w-[20px]' alt='기본 정렬' />
                                  )}
                                </button>
                                <EvidenceListFilter
                                  column='북마크'
                                  options={filterData?.data?.bookmark as unknown as string[]}
                                  onFilter={(values) => {
                                    setSelectedBookmarkFilters(values);
                                    setTimeout(() => {
                                      refetchListEvidence();
                                    }, 0);
                                  }}
                                  isOpen={openFilter === 'bookmark'}
                                  onToggle={() => handleFilterToggle('bookmark')}
                                />
                              </div>
                              <span className='pl-2 text-[12px] font-bold text-[#252525] underline'>
                                {displayData.filter((item) => item.bookmarks?.length > 0).length}
                              </span>
                            </th>
                            <th
                              className='w-[15%] min-w-[150px] cursor-col-resize whitespace-nowrap text-left hover:after:absolute hover:after:right-0 hover:after:top-0 hover:after:z-10 hover:after:mr-[1.5px] hover:after:h-full hover:after:w-[6px] hover:after:bg-[#97C0F1] hover:after:content-[""]'
                              data-column-id='memo'
                              style={{
                                width: `${columnWidths.memo}px`,
                                minWidth: `${columnWidths.memo}px`,
                                position: 'relative',
                              }}
                            >
                              <div className='absolute inset-0' onMouseDown={(e) => handleMouseDown(e, 'memo')} />
                              <div className='flex w-full items-center justify-between'>
                                <EvidenceListFilter
                                  column='메모'
                                  options={filterData?.data?.memo as unknown as string[]}
                                  onFilter={(values) => {
                                    setSelectedMemoFilters(values);
                                    setTimeout(() => {
                                      refetchListEvidence();
                                    }, 0);
                                  }}
                                  isOpen={openFilter === 'memo'}
                                  onToggle={() => handleFilterToggle('memo')}
                                />
                                <div className='group relative mr-2'>
                                  <span className='cursor-pointer text-gray-400 hover:text-sky-600'>
                                    <IoMdInformationCircleOutline size={18} />
                                  </span>
                                  <div className='absolute left-1/2 top-full z-50 mt-2 hidden w-max -translate-x-1/2 rounded border border-[#E5E7EB] bg-white px-[12px] py-[10px] text-[12px] text-[#252525] shadow-lg group-hover:block'>
                                    <div>메모 위에 마우스를 올리면 수정/삭제 옵션이 표시됩니다.</div>
                                    <div>메모를 클릭하면 새 메모를 작성할 수 있습니다.</div>
                                  </div>
                                </div>
                              </div>
                              <span className='pl-2 text-[12px] font-bold text-[#252525] underline'>
                                {displayData.filter((item) => item.memos?.length > 0).length}
                              </span>
                            </th>

                            <th
                              className='w-[10%] min-w-[100px] cursor-col-resize whitespace-nowrap pb-[26px] pt-[8px] hover:after:absolute hover:after:right-0 hover:after:top-0 hover:after:z-10 hover:after:mr-[1.5px] hover:after:h-full hover:after:w-[6px] hover:after:bg-[#97C0F1] hover:after:content-[""]'
                              data-column-id='tag'
                              style={{
                                width: `${columnWidths.tag}px`,
                                minWidth: `${columnWidths.tag}px`,
                                position: 'relative',
                              }}
                              onMouseDown={(e) => {
                                if ((e.target as HTMLElement).closest('button')) {
                                  return;
                                }
                                handleMouseDown(e, 'tag');
                              }}
                            >
                              <div className='flex items-center'>
                                <EvidenceListFilter
                                  column='태그'
                                  options={(filterData?.data?.tags || []) as string[]}
                                  onFilter={(values) => {
                                    setSelectedTagFilters(values);
                                    setTimeout(() => {
                                      refetchListEvidence();
                                    }, 0);
                                  }}
                                  isOpen={openFilter === 'tag'}
                                  onToggle={() => handleFilterToggle('tag')}
                                />
                              </div>
                            </th>

                            <th
                              className='w-[5%] min-w-[70px] cursor-col-resize whitespace-nowrap pb-[26px] pt-[8px] hover:after:absolute hover:after:right-0 hover:after:top-0 hover:after:z-10 hover:after:mr-[1.5px] hover:after:h-full hover:after:w-[6px] hover:after:bg-[#97C0F1] hover:after:content-[""]'
                              data-column-id='page_count'
                              style={{
                                width: `${columnWidths.page_count}px`,
                                minWidth: `${columnWidths.page_count}px`,
                                position: 'relative',
                              }}
                              onMouseDown={(e) => {
                                if ((e.target as HTMLElement).closest('button')) {
                                  return;
                                }
                                handleMouseDown(e, 'page_count');
                              }}
                            >
                              <div className='flex items-center'>
                                <button onClick={() => handleHeaderSort('page_count')} className='ml-1'>
                                  {sortColumn === 'page_count' ? (
                                    sortDirection === 'asc' ? (
                                      <img src={clumHIcon} className='h-[20px] w-[20px]' alt='오름차순' />
                                    ) : sortDirection === 'desc' ? (
                                      <img src={clumBIcon} className='h-[20px] w-[20px]' alt='내림차순' />
                                    ) : (
                                      <img src={allSortIcon} className='h-[20px] w-[20px]' alt='기본 정렬' />
                                    )
                                  ) : (
                                    <img src={allSortIcon} className='h-[20px] w-[20px]' alt='기본 정렬' />
                                  )}
                                </button>
                                <span
                                  className={`text-[#252525] ${getFontSizeClass(12, fontSizeAdjustment)}`}
                                  style={{ fontSize: `${getAdjustedSize(12)}px` }}
                                >
                                  페이지수
                                </span>
                              </div>
                            </th>
                            <th
                              className='w-[7%] min-w-[110px] cursor-col-resize whitespace-nowrap rounded-tr-[8px] pb-[26px] pt-[8px] hover:after:absolute hover:after:right-0 hover:after:top-0 hover:after:z-10 hover:after:mr-[1.5px] hover:after:h-full hover:after:w-[6px] hover:after:bg-[#97C0F1] hover:after:content-[""]'
                              data-column-id='missing_page'
                              style={{
                                width: `${columnWidths.missing_page}px`,
                                minWidth: `${columnWidths.missing_page}px`,
                                position: 'relative',
                              }}
                            >
                              <div className='absolute inset-0' onMouseDown={(e) => handleMouseDown(e, 'missing_page')} />
                              <div className='flex items-center justify-center'>
                                {/* <button onClick={() => handleHeaderSort('missing_page')} className='ml-1'>
                                {sortColumn === 'missing_page' ? (
                                  sortDirection === 'asc' ? (
                                    <img src={clumHIcon} className='h-[20px] w-[20px]' alt='오름차순' />
                                  ) : sortDirection === 'desc' ? ( // 내림차순인지 확인
                                    <img src={clumBIcon} className='h-[20px] w-[20px]' alt='내림차순' />
                                  ) : (
                                    <img src={allSortIcon} className='h-[20px] w-[20px]' alt='기본 정렬' />
                                  )
                                ) : (
                                  <img src={allSortIcon} className='h-[20px] w-[20px]' alt='기본 정렬' />
                                )}
                              </button> */}
                                <EvidenceListFilter
                                  column='누락'
                                  options={filterData?.data?.missing_page as unknown as string[]}
                                  onFilter={(values) => {
                                    setSelectedMissingPageFilters(values);

                                    setTimeout(() => {
                                      refetchListEvidence();
                                    }, 0);
                                  }}
                                  isOpen={openFilter === 'missing_page'}
                                  onToggle={() => handleFilterToggle('missing_page')}
                                />
                              </div>
                            </th>
                          </tr>
                        </thead>
                        {/* 헤더 끝 */}

                        {/* 테이블 시작 */}
                        <tbody {...provided.droppableProps} ref={provided.innerRef} className='overflow-y-auto'>
                          {isProcessing || isLoading || isSearching ? (
                            <tr className=''>
                              <td colSpan={14} className='h-[300px] text-center' style={{ minWidth: `${totalTableMinWidth}px` }}>
                                <CustomSpinner />
                              </td>
                            </tr>
                          ) : displayData.length > 0 ? (
                            displayData.map((item, index) => {
                              // Type Assertion 적용

                              const hasMatch = (evidence: any) => {
                                return (
                                  evidence.highlights &&
                                  evidence.highlights.some((highlight: any) =>
                                    highlight.texts.some((text: any) => text.type === 'hit' || text.value.startsWith('#')),
                                  )
                                );
                              };
                              return (
                                <Draggable key={item.evidence_id} draggableId={item.evidence_id} index={index}>
                                  {(dragProvided, dragSnapshot) => (
                                    <>
                                      <tr
                                        onContextMenu={(e) => handleContextMenu(e, index, item)}
                                        data-evidence-id={item.evidence_id}
                                        ref={dragProvided.innerRef}
                                        {...dragProvided.draggableProps}
                                        onClick={(e) => handleRowClick(item.evidence_id, index, e)}
                                        style={{
                                          ...dragProvided.draggableProps.style,
                                          cursor: 'pointer',
                                          minHeight: '44px',
                                          marginTop: '12px',
                                          marginBottom: '12px',
                                          width: dragSnapshot.isDragging ? '100%' : 'auto',
                                          display: dragSnapshot.isDragging ? 'table' : 'table-row',
                                          tableLayout: dragSnapshot.isDragging ? 'fixed' : 'auto',
                                          alignItems: 'center',
                                        }}
                                        className={cn(
                                          'group text-[#202124] lg:text-[14px]',
                                          selectedItems.includes(item.evidence_id) ? 'bg-[#EFFBFF]' : index % 2 === 1 ? 'bg-[#F8F9F9]' : '',
                                        )}
                                      >
                                        {/*  <tr key={index} className='h-[75px] text-[#202124] lg:text-[14px]'> */}
                                        <td
                                          className='relative py-3 text-center lg:min-w-[80px] lg:max-w-[80px]'
                                          style={{
                                            width: `${columnWidths.checkbox}px`,
                                            minWidth: `${columnWidths.checkbox}px`,
                                            verticalAlign: 'top',
                                          }}
                                        >
                                          <div
                                            {...dragProvided.dragHandleProps}
                                            className={`transition-opacity duration-200 ${
                                              showDragHandles?.toString() === item.evidence_id.toString()
                                                ? 'opacity-100'
                                                : 'opacity-0 group-hover:opacity-100'
                                            }`}
                                            onClick={(e) => e.stopPropagation()}
                                          >
                                            <MdDragIndicator className='absolute pt-[4px] text-xl text-gray-400 hover:text-gray-600' />
                                          </div>
                                          {pinnedItems.includes(item.evidence_id) && (
                                            <div className='absolute left-[15px]'>
                                              <BsPinFill className='text-[#0050B3]' />
                                            </div>
                                          )}
                                          <input
                                            type='checkbox'
                                            className='h-[20px] w-[20px] rounded-[2px] border-[#CCD0D1] text-[#4577A4] outline-none focus:ring-0'
                                            onChange={(e) => handleCheckboxChange(item.evidence_id, index, e)}
                                            onClick={(e) => e.stopPropagation()}
                                            checked={selectedItems.includes(item.evidence_id)}
                                          />
                                        </td>
                                        <td
                                          className={`w-[4%] truncate py-3 pl-3 text-[#212121] ${getFontSizeClass(14, fontSizeAdjustment)}`}
                                          style={{
                                            fontSize: `${getAdjustedSize(14)}px`,
                                            verticalAlign: 'top',
                                          }}
                                        >
                                          {item.evidence_number}
                                        </td>
                                        <td
                                          className={`w-[5%] truncate py-3 text-[#212121] ${getFontSizeClass(14, fontSizeAdjustment)}`}
                                          style={{
                                            fontSize: `${getAdjustedSize(14)}px`,
                                            verticalAlign: 'top',
                                          }}
                                        >
                                          {item.writer}
                                        </td>
                                        <td
                                          className={`w-[5%] truncate py-3 text-[#212121] ${getFontSizeClass(14, fontSizeAdjustment)}`}
                                          style={{
                                            fontSize: `${getAdjustedSize(14)}px`,
                                            verticalAlign: 'top',
                                          }}
                                        >
                                          {item.sequence_number}
                                        </td>
                                        <td
                                          className={`w-[3%] py-3 pl-3 text-[#212121] ${getFontSizeClass(12, fontSizeAdjustment)}`}
                                          style={{
                                            fontSize: `${getAdjustedSize(12)}px`,
                                            verticalAlign: 'top',
                                          }}
                                        >
                                          {item.start_page}
                                        </td>
                                        <td
                                          className='w-[20%] py-3'
                                          {...(item.evidence_title && {
                                            'data-tooltip-id': 'tooltip',
                                            'data-tooltip-content': item.evidence_title,
                                          })}
                                          style={{
                                            width: `${columnWidths.evidence_title}px`,
                                            minWidth: `${columnWidths.evidence_title}px`,
                                            verticalAlign: 'top',
                                          }}
                                        >
                                          <div
                                            id=''
                                            className={`cursor-pointer font-bold text-[#212121] hover:text-[#004AA4] ${getFontSizeClass(14, fontSizeAdjustment)}`}
                                            onClick={(e) => {
                                              e.stopPropagation();
                                              handleViewDocument(item.evidence_id, item.page_count);
                                            }}
                                            style={{
                                              fontSize: `${getAdjustedSize(14)}px`,
                                              display: '-webkit-box',
                                              WebkitBoxOrient: 'vertical',
                                              WebkitLineClamp: 2,
                                              overflow: 'hidden',
                                              wordBreak: 'break-word',
                                              lineHeight: '1.2em',
                                              textOverflow: 'ellipsis',
                                            }}
                                          >
                                            {item.evidence_title}
                                          </div>
                                        </td>
                                        <td
                                          className='py-3'
                                          style={{
                                            verticalAlign: 'top',
                                            height: '100%',
                                          }}
                                          /*  onMouseEnter={(e) => {
                                          if (item.summary_text) {
                                            const rect = e.currentTarget.getBoundingClientRect();
                                            setSummaryPosition({
                                              top: rect.bottom + window.scrollY,
                                              left: rect.left + window.scrollX,
                                            });
                                            setHoveredSummaryId(item.evidence_id);
                                          }
                                        }}
                                        onMouseLeave={() => {
                                          setHoveredSummaryId(null);
                                        }} */
                                        >
                                          <div className='flex h-full'>
                                            {item.summary_text && (
                                              <div
                                                className='flex cursor-pointer'
                                                onClick={() => {
                                                  handleSummaryPdfClick(item.evidence_id);
                                                }}
                                              >
                                                <img src={PdfIcon} alt='pdf' className='h-[20px] w-[20px]' />
                                              </div>
                                            )}
                                            {/* <div
                                            className='flex-1'
                                            style={{
                                              display: '-webkit-box',
                                              WebkitBoxOrient: 'vertical',
                                              WebkitLineClamp: 2,
                                              overflow: 'hidden',
                                              color: '#212121',
                                              wordBreak: 'break-word',
                                              lineHeight: '1.2em',
                                              fontSize: `${getAdjustedSize(12)}px`,
                                              textAlign: 'center',
                                              textOverflow: 'ellipsis',
                                            }}
                                          >
                                            {item.summary_text}
                                          </div> */}
                                          </div>

                                          {/* 요약 호버 시 나타나는 팝업 */}
                                          {/*   {hoveredSummaryId === item.evidence_id &&
                                          item.summary_text &&
                                          ReactDOM.createPortal(
                                            <div
                                              onClick={(e) => e.stopPropagation()}
                                              className='fixed z-[9999] max-h-[200px] min-w-[360px] max-w-[400px] rounded-lg border bg-white p-3 shadow-lg'
                                              style={{
                                                top: `${summaryPosition.top}px`,
                                                left: `${summaryPosition.left}px`,
                                              }}
                                              onMouseEnter={() => {
                                                setHoveredSummaryId(item.evidence_id);
                                              }}
                                              onMouseLeave={() => {
                                                setHoveredSummaryId(null);
                                              }}
                                            >
                                              <div className='mb-2 flex w-full items-center justify-between'>
                                                <div className='flex items-center gap-2 text-[14px] text-[#7d7d7d]'>
                                                  <p>{item.evidence_title}</p>
                                                  <p>|</p>
                                                  <p>번호 {item.evidence_number}</p>
                                                </div>
                                                <div className='flex gap-3'>
                                                  <button
                                                    onClick={(e) => {
                                                      // 이벤트 객체 e를 받도록 수정
                                                      e.stopPropagation(); // 이벤트 전파 중단
                                                      handleSummaryCopy(item.summary_text || '');
                                                    }}
                                                    className='text-gray-600 hover:text-[#5b5b5b]'
                                                    title='복사'
                                                  >
                                                    <BsCopy className='text-[15px]' />
                                                  </button>
                                                  <button
                                                    onClick={(e) => {
                                                      e.stopPropagation();
                                                      openSummaryInNewWindow(item.evidence_id, item.evidence_title);
                                                    }}
                                                    className='text-gray-600 hover:text-[#5b5b5b]'
                                                    title='새 창에서 열기'
                                                  >
                                                    <FiMaximize2 className='text-[15px]' />
                                                  </button>
                                                </div>
                                              </div>
                                              <div
                                                className='summary-content max-h-[150px] overflow-y-auto text-[#212121]'
                                                style={{
                                                  fontSize: `${getAdjustedSize(14)}px`,
                                                  display: '-webkit-box',
                                                  WebkitLineClamp: 4,
                                                  WebkitBoxOrient: 'vertical',
                                                  overflow: 'scroll',
                                                  textOverflow: 'ellipsis',
                                                }}
                                              >
                                                {item.summary_text}
                                              </div>
                                            </div>,
                                            document.body,
                                          )} */}
                                        </td>
                                        <td
                                          className={`w-[8%] py-3 pl-6 2xl:pl-4 text-[#212121]${getFontSizeClass(12, fontSizeAdjustment)}`}
                                          style={{
                                            fontSize: `${getAdjustedSize(12)}px`,
                                            verticalAlign: 'top',
                                          }}
                                        >
                                          {item.name}
                                        </td>
                                        <td
                                          {...(item.reference && {
                                            'data-tooltip-id': 'tooltip',
                                            'data-tooltip-content': item.reference,
                                          })}
                                          className={`w-[8%] py-3 pl-2.5 text-[#212121] ${getFontSizeClass(12, fontSizeAdjustment)}`}
                                          style={{
                                            verticalAlign: 'top',
                                          }}
                                        >
                                          <div
                                            className=''
                                            style={{
                                              display: '-webkit-box',
                                              WebkitBoxOrient: 'vertical',
                                              WebkitLineClamp: 2,
                                              overflow: 'hidden',
                                              color: '#212121',
                                              wordBreak: 'break-word',
                                              lineHeight: '1.2em',
                                              fontSize: `${getAdjustedSize(12)}px`,
                                            }}
                                          >
                                            {' '}
                                            {item.reference}
                                          </div>
                                        </td>
                                        <td
                                          {...(item.category && {
                                            'data-tooltip-id': 'tooltip',
                                            'data-tooltip-content': item.category,
                                          })}
                                          className={`w-[8%] py-3 pl-3 text-[#212121] ${getFontSizeClass(12, fontSizeAdjustment)}`}
                                          style={{
                                            fontSize: `${getAdjustedSize(12)}px`,
                                            verticalAlign: 'top',
                                          }}
                                        >
                                          <p className='max-w-[120px] truncate'>{item.category}</p>
                                        </td>
                                        <td
                                          className='w-[5%] py-3 text-center'
                                          style={{
                                            verticalAlign: 'top',
                                          }}
                                        >
                                          {item.bookmarks?.length > 0 ? (
                                            // 북마크가 true인 경우
                                            <div
                                              onClick={(e) => {
                                                e.stopPropagation();
                                                handleSaveBookmark(item.evidence_id);
                                              }}
                                              className='flex cursor-pointer items-center justify-center'
                                            >
                                              <img src={Bookmark} alt='북마크 있음' className='h-[20px] w-[20px] cursor-pointer' />
                                            </div>
                                          ) : (
                                            <div
                                              onClick={(e) => {
                                                e.stopPropagation();
                                                handleSaveBookmark(item.evidence_id);
                                              }}
                                              className='flex cursor-pointer items-center justify-center'
                                            >
                                              <img src={BookmarkNone} alt='북마크 없음' className='h-[20px] w-[20px] cursor-pointer' />
                                            </div>
                                          )}
                                        </td>
                                        {/* 메모입력 */}

                                        <td className='memo-cell group/memo relative py-3'>
                                          {item.memos?.length > 0 && (
                                            <div className='group relative'>
                                              <div className='flex flex-col'>
                                                {item.memos.map((memo: any) => (
                                                  <>
                                                    <div
                                                      key={memo.memo_id}
                                                      className='group/memo-item flex items-center gap-1'
                                                      onClick={(e) => {
                                                        // 수정/삭제 버튼 클릭 시 이벤트 전파 중단
                                                        if ((e.target as HTMLElement).closest('.memo-actions')) {
                                                          e.stopPropagation();
                                                          return;
                                                        }

                                                        const rect = e.currentTarget.getBoundingClientRect();
                                                        setMemoPosition({
                                                          top: rect.top + rect.height,
                                                          left: rect.left,
                                                        });
                                                        setFixedMemoId(item.evidence_id);
                                                      }}
                                                    >
                                                      {memo.thumbnail_url ? (
                                                        <div className='relative min-w-[24px] rounded-full'>
                                                          <img
                                                            src={memo.thumbnail_url}
                                                            alt='profile'
                                                            className='h-[20px] w-[20px] rounded-full'
                                                          />
                                                          <div
                                                            className='absolute top-0 h-[20px] w-[20px] rounded-full border-2'
                                                            style={{
                                                              borderColor: getUserColor(memo.user_color || ''),
                                                            }}
                                                          />
                                                        </div>
                                                      ) : (
                                                        <div
                                                          className='flex h-[24px] w-[24px] min-w-[24px] shrink-0 items-center justify-center rounded-full text-sm text-white'
                                                          style={{
                                                            backgroundColor: getUserColor(memo.user_color || ''),
                                                          }}
                                                        >
                                                          {memo.nickname ? memo.nickname.charAt(0) : memo.user_nm?.slice(1, 2) || ''}
                                                        </div>
                                                      )}
                                                      <div className='min-w-[35px] text-[12px] text-[#212121]'>{memo.user_nm}</div>
                                                      <div className='text-[12px] text-[#7d7d7d]'>
                                                        {memo.createdAt
                                                          ? new Date(memo.createdAt)
                                                              .toLocaleString('ko-KR', {
                                                                month: '2-digit',
                                                                day: '2-digit',
                                                                hour: '2-digit',
                                                                minute: '2-digit',
                                                                hour12: false,
                                                              })
                                                              .replace(/\. /g, '.')
                                                              .replace(/\.$/, '')
                                                          : ''}
                                                      </div>
                                                      {isMyMemo(memo.user_id, memo.memo_id) && (
                                                        <div className='memo-actions absolute right-0 z-10 flex h-[24px] items-center rounded-[5px] border bg-white opacity-0 transition-opacity duration-200 group-hover/memo-item:opacity-100'>
                                                          <div
                                                            className='flex w-[24px] items-center justify-center text-[15px] text-[#5b5b5b]'
                                                            onClick={() => {
                                                              setIsEditing({
                                                                content: memo.content,
                                                                memoId: memo.memo_id,
                                                              });
                                                              setWritingMemoId(null); // 신규 메모 작성 창 닫기
                                                              setTimeout(() => {
                                                                const row = document.querySelector(
                                                                  `[data-evidence-id="${item.evidence_id}"]`,
                                                                );
                                                                const memoCell = row ? row.querySelector('.memo-cell') : null;
                                                                if (memoCell) {
                                                                  const rect = memoCell.getBoundingClientRect();
                                                                  setMemoPosition({
                                                                    top: rect.top + rect.height,
                                                                    left: rect.left,
                                                                  });
                                                                }
                                                              }, 0);
                                                            }}
                                                          >
                                                            <LuPencilLine />
                                                          </div>
                                                          <div
                                                            className='z-10 flex w-[24px] items-center justify-center text-[15px] text-[#5b5b5b]'
                                                            onClick={() => {
                                                              openDeleteModal(memo.memo_id);
                                                            }}
                                                          >
                                                            <BsTrash />
                                                          </div>
                                                        </div>
                                                      )}
                                                    </div>
                                                    <div
                                                      className='h-full w-full pb-1 pt-1'
                                                      style={{
                                                        fontSize: `${getAdjustedSize(12)}px`,
                                                        whiteSpace: 'pre-wrap',
                                                        wordBreak: 'break-word',
                                                      }}
                                                    >
                                                      {memo.content}
                                                    </div>
                                                  </>
                                                ))}
                                              </div>
                                            </div>
                                          )}
                                        </td>
                                        {isEditing &&
                                          ReactDOM.createPortal(
                                            <div
                                              className='absolute z-[9999] max-h-[138px] min-h-[75px] w-[360px]'
                                              onClick={(e) => e.stopPropagation()}
                                              style={{
                                                top: `${memoPosition.top}px`,
                                                left: `${memoPosition.left}px`,
                                              }}
                                            >
                                              <div className='flex rounded-lg bg-[#E7F1FD]'>
                                                <div className='w-full flex-col p-2'>
                                                  <textarea
                                                    className='memo-textarea flex max-h-[82px] min-h-[56px] w-full resize-none items-center overflow-y-scroll rounded-lg border-none bg-[#E7F1FD] text-sm focus:border-none focus:outline-none focus:ring-0'
                                                    value={isEditing.content}
                                                    onChange={(e) => setIsEditing({ ...isEditing, content: e.target.value })}
                                                    autoFocus
                                                  />
                                                  <div className='flex justify-end gap-2'>
                                                    <button
                                                      className={`h-[32px] w-[49px] rounded-md text-white ${
                                                        isEditing.content.trim().length > 0 ? 'bg-[#0050B3]' : 'bg-[#C2C2C2]'
                                                      }`}
                                                      onClick={() => {
                                                        if (!isEditing.content.trim()) return;
                                                        handleSaveNote(item.evidence_id, isEditing.content, isEditing.memoId);
                                                        setIsEditing(null);
                                                      }}
                                                    >
                                                      저장
                                                    </button>
                                                    <button
                                                      className='h-[32px] w-[49px] rounded-md border bg-white text-[#C2C2C2]'
                                                      onClick={() => {
                                                        setIsEditing(null);
                                                      }}
                                                    >
                                                      취소
                                                    </button>
                                                  </div>
                                                </div>
                                              </div>
                                            </div>,
                                            document.body,
                                          )}
                                        {/* 메모 작성 모달 */}
                                        {writingMemoId === item.evidence_id &&
                                          ReactDOM.createPortal(
                                            <div
                                              className='absolute z-10 rounded-lg bg-[#E7F1FD]'
                                              onClick={(e) => e.stopPropagation()}
                                              style={{
                                                top: `${memoPosition.top}px`,
                                                left: `${memoPosition.left}px`,
                                              }}
                                            >
                                              <div className='min-h-[75px] w-[360px] rounded-lg bg-[#E7F1FD] p-2'>
                                                <textarea
                                                  className='memo-textarea flex max-h-[80px] min-h-[56px] w-full resize-none items-center overflow-y-auto rounded-lg border-none bg-[#E7F1FD] text-sm focus:border-none focus:outline-none focus:ring-0'
                                                  value={newMemoContent}
                                                  onChange={(e) => setNewMemoContent(e.target.value)}
                                                  placeholder='메모를 입력하세요'
                                                  autoFocus
                                                />

                                                <div className='mr-2 flex items-center justify-end gap-2'>
                                                  <button
                                                    className={`memo-save-button ml-2 h-[32px] w-[49px] rounded-md text-white ${
                                                      newMemoContent.trim().length > 0 ? 'bg-[#0050B3]' : 'bg-[#C2C2C2]'
                                                    }`}
                                                    onClick={async () => {
                                                      if (!newMemoContent.trim()) return;
                                                      // DEMO: local create
                                                      if (!writingMemoId) return;
                                                      const newMemoId = `demo_memo_${Date.now()}_${Math.random().toString(16).slice(2)}`;
                                                      const newMemo = {
                                                        memo_id: newMemoId,
                                                        content: newMemoContent,
                                                        createdAt: new Date().toISOString(),
                                                        user_id: demoUserId,
                                                        user_nm: demoUserNm,
                                                        nickname: demoUserNm,
                                                        user_color: 'green',
                                                        thumbnail_url: null,
                                                      };
                                                      setDemoMemosByEvidenceId((prev) => ({
                                                        ...prev,
                                                        [writingMemoId]: [...(prev[writingMemoId] || []), newMemo],
                                                      }));

                                                      setWritingMemoId(null);
                                                      setNewMemoContent('');
                                                      onMessageToast({
                                                        message: '메모가 성공적으로 저장되었습니다.',
                                                        icon: <IoMdSend className='h-5 w-5 text-green-500' />,
                                                      });
                                                      // 선택된 문서 해제
                                                      setSelectedItems([]);
                                                    }}
                                                  >
                                                    저장
                                                  </button>
                                                  <button
                                                    className='memo-save-button h-[32px] w-[49px] rounded-md bg-white text-[#C2C2C2]'
                                                    onClick={(e) => {
                                                      e.stopPropagation();
                                                      setWritingMemoId(null);
                                                    }}
                                                  >
                                                    취소
                                                  </button>
                                                </div>
                                              </div>
                                            </div>,
                                            document.body,
                                          )}

                                        {/* 태그 입력 */}
                                        <td
                                          className='tag-cell group/tag relative py-3'
                                          style={{
                                            width: `${columnWidths.tag}px`,
                                            minWidth: `${columnWidths.tag}px`,
                                            verticalAlign: 'top',
                                          }}
                                          onClick={(e) => {
                                            // 태그 셀 클릭 시 이벤트 전파 중지 (체크박스 선택 방지)
                                            e.stopPropagation();

                                            const tagCell = (e.target as HTMLElement).closest('td');
                                            if (tagCell) {
                                              const rect = tagCell.getBoundingClientRect();
                                              const scrollTop = window.scrollY || document.documentElement.scrollTop;

                                              // 팝업 높이 (대략 400px)
                                              const popupHeight = 400;
                                              // 화면 하단까지의 여유 공간
                                              const spaceBelow = window.innerHeight - rect.bottom;
                                              // 기본 위치 (셀 아래)
                                              let topPosition = rect.top + rect.height + scrollTop;

                                              // 아래쪽 공간이 부족하면 팝업이 화면 안에 들어오도록 위치 조정
                                              if (spaceBelow < popupHeight) {
                                                // 화면 하단에서 팝업 높이만큼 뺀 위치로 조정 (약간만 위로)
                                                topPosition = window.innerHeight + scrollTop - popupHeight - 10; // 10px 여유 공간
                                              }

                                              setTagPopupPosition({
                                                top: topPosition,
                                                left: rect.left,
                                              });

                                              setTagWritingId(item.evidence_id);
                                              setIsTagPopupOpen(true);
                                            }
                                          }}
                                        >
                                          {item.tags && item.tags.length > 0 ? (
                                            <div className='flex flex-wrap items-start gap-1'>
                                              {item.tags.map((tag: any) => {
                                                // tags 배열에 이미 tag_name이 포함되어 있으므로 직접 사용
                                                const tagName = tag.tag_name || '';

                                                // 태그 이름이 없으면 태그를 표시하지 않음
                                                if (!tagName) {
                                                  return null;
                                                }

                                                return (
                                                  <div
                                                    key={tag.tag_id || tag.tag_name}
                                                    className='rounded-[4px] px-2 py-1 text-[11px] text-[#000]'
                                                    style={{ backgroundColor: '#F3F3F3' }}
                                                    onClick={(e) => {
                                                      // 태그 텍스트 클릭 시에도 태그 팝업이 열리도록
                                                      // 이벤트 전파를 막아서 행 클릭 이벤트가 발생하지 않도록
                                                      e.stopPropagation();
                                                      // 태그 셀을 찾아서 태그 팝업 열기
                                                      const tagCell = (e.target as HTMLElement).closest('td.tag-cell');
                                                      if (tagCell) {
                                                        const rect = tagCell.getBoundingClientRect();
                                                        const scrollTop = window.scrollY || document.documentElement.scrollTop;

                                                        // 팝업 높이 (대략 400px)
                                                        const popupHeight = 400;
                                                        // 화면 하단까지의 여유 공간
                                                        const spaceBelow = window.innerHeight - rect.bottom;
                                                        // 기본 위치 (셀 아래)
                                                        let topPosition = rect.top + rect.height + scrollTop;

                                                        // 아래쪽 공간이 부족하면 팝업이 화면 안에 들어오도록 위치 조정
                                                        if (spaceBelow < popupHeight) {
                                                          // 화면 하단에서 팝업 높이만큼 뺀 위치로 조정 (약간만 위로)
                                                          topPosition = window.innerHeight + scrollTop - popupHeight - 10; // 10px 여유 공간
                                                        }

                                                        setTagPopupPosition({
                                                          top: topPosition,
                                                          left: rect.left,
                                                        });

                                                        setTagWritingId(item.evidence_id);
                                                        setIsTagPopupOpen(true);
                                                      }
                                                    }}
                                                  >
                                                    {tagName}
                                                  </div>
                                                );
                                              })}
                                            </div>
                                          ) : (
                                            <div className='text-[12px] text-[#888]'></div>
                                          )}
                                        </td>

                                        {/* DEMO: 태그 팝업 (로컬 상태로만 처리, API 호출 제거) */}
                                        {tagWritingId === item.evidence_id && isTagPopupOpen && (
                                          <DemoTagPopup
                                            isOpen={isTagPopupOpen}
                                            onClose={() => {
                                              setIsTagPopupOpen(false);
                                              setTagWritingId(null);
                                            }}
                                            position={tagPopupPosition}
                                            evidenceId={item.evidence_id}
                                            initialTags={(item.tags || []).map((t: any) => ({
                                              tag_id: t.tag_id || t.tag_set_id || t.tag_name,
                                              tag_name: t.tag_name,
                                              color: t.color || '#F3F3F3',
                                              tag_set_id: t.tag_set_id,
                                            }))}
                                            projectTags={demoProjectTags}
                                            setProjectTags={setDemoProjectTags}
                                            onChangeTags={(next) => {
                                              setDemoTagsByEvidenceId((prev) => ({
                                                ...prev,
                                                [item.evidence_id]: next,
                                              }));
                                            }}
                                          />
                                        )}

                                        <td
                                          className={`w-[8%] py-3 pl-3 text-[#212121] ${getFontSizeClass(12, fontSizeAdjustment)}`}
                                          style={{
                                            fontSize: `${getAdjustedSize(12)}px`,
                                            verticalAlign: 'top',
                                          }}
                                        >
                                          {item.page_count}
                                        </td>
                                        <td
                                          className={`w-[5%] py-3 text-center text-[#212121] ${getFontSizeClass(12, fontSizeAdjustment)}`}
                                          style={{
                                            fontSize: `${getAdjustedSize(12)}px`,
                                            verticalAlign: 'top',
                                          }}
                                        >
                                          {item.has_missing_page === true ? <span className=''>Y</span> : <span className=''>-</span>}
                                        </td>
                                      </tr>

                                      {hasMatch(item) && (
                                        <tr className=''>
                                          <td
                                            colSpan={15}
                                            className={`p-2 text-[12px] text-[#888] ${index % 2 === 0 ? 'bg-[#fff]' : 'bg-[#f7f8f8]'}`}
                                          >
                                            <div
                                              style={{
                                                display: '-webkit-box',
                                                WebkitBoxOrient: 'vertical',
                                                WebkitLineClamp: 2,
                                                overflowY: 'auto', // 세로 스크롤만 필요할 때 표시
                                                overflowX: 'hidden',
                                                textOverflow: 'ellipsis',
                                              }}
                                            >
                                              {renderHighlightedContent(item)}
                                            </div>
                                          </td>
                                        </tr>
                                      )}
                                    </>
                                  )}
                                </Draggable>
                              );
                            })
                          ) : (
                            // 검색 결과 없음
                            <tr>
                              <td colSpan={13} className='pb-6 pt-8 text-center text-gray-500'>
                                검색 결과가 없습니다.
                              </td>
                            </tr>
                          )}

                          {provided.placeholder}
                        </tbody>
                        {/* 테이블 끝 */}
                      </table>
                    )}
                  </Droppable>
                </div>
              </div>
            </div>
            {/* 우클릭 메뉴 */}
            {contextMenu && (
              <div
                ref={contextMenuRef}
                style={{
                  position: 'absolute',
                  top: `${contextMenu.y + 10}px`,
                  left: `${contextMenu.x + 5}px`,
                  backgroundColor: '#fff',
                  boxShadow: '0 2px 8px rgba(0, 0, 0, 0.15)',
                  zIndex: 1000,
                }}
                className='h-[240px] w-[175px] rounded-[8px]'
              >
                <div className='text-sm text-[#666666]'>
                  {/* 문서 보기 (호버하면 PDF 보기, TEXT 보기 표시) */}
                  <div
                    className='relative flex h-[40px] cursor-pointer items-center border-b border-[#e5e5e5] pl-[12px] text-[14px] hover:rounded-t-[8px] hover:bg-[#0050B3] hover:text-white'
                    onMouseEnter={(e) => {
                      e.currentTarget.querySelector('.submenu')?.classList.remove('hidden');
                    }}
                    onMouseLeave={(e) => {
                      e.currentTarget.querySelector('.submenu')?.classList.add('hidden');
                    }}
                  >
                    <div className='mr-2'>
                      <TbEye className='text-lg' />
                    </div>
                    증거보기
                    <div className='absolute right-2 text-lg'>
                      <IoIosArrowForward />
                    </div>
                    <div className='submenu absolute left-full top-0 hidden w-[120px] rounded-[8px] bg-[#fff] text-[#666] shadow-lg'>
                      <div
                        className='flex h-[40px] cursor-pointer items-center px-3 text-[14px] hover:rounded-t-[8px] hover:bg-[#0050B3] hover:text-white'
                        onClick={() => {
                          const selectedItem = listEvidenceOutput?.data?.results?.find((item) => item.evidence_id === selectedItems[0]);
                          handleViewPDF(selectedItem?.page_count || 0);
                        }}
                      >
                        PDF 보기
                      </div>
                      <div
                        className='flex h-[40px] cursor-pointer items-center px-3 text-[14px] hover:bg-[#0050B3] hover:text-white'
                        onClick={handleViewText}
                      >
                        텍스트 파일보기
                      </div>
                    </div>
                  </div>
                  <div
                    className='flex h-[40px] cursor-pointer items-center border-b border-[#e5e5e5] pl-[12px] text-[14px] hover:bg-[#0050B3] hover:text-white'
                    onClick={() => handleMenuAction('bookmark')}
                  >
                    <div className='mr-1'>
                      <CiStar className='text-xl' />
                    </div>
                    <div>북마크</div>
                  </div>
                  <div
                    className='flex h-[40px] cursor-pointer items-center border-b border-[#e5e5e5] pl-[12px] text-[14px] hover:bg-[#0050B3] hover:text-white'
                    onClick={() => handleMenuAction('note')}
                  >
                    <div className='mr-2'>
                      <IoDocumentOutline className='text-lg' />
                    </div>
                    메모
                  </div>
                  <div
                    className='flex h-[40px] cursor-pointer items-center border-b border-[#e5e5e5] pl-[12px] text-[14px] hover:bg-[#0050B3] hover:text-white'
                    onClick={() => handleMenuAction('pin')}
                  >
                    <div className='mr-2'>
                      <BsPin className='text-lg' />
                    </div>
                    {pinnedItems.includes(contextMenu.itemId.toString()) ? '위치고정 해제' : '1페이지 위치고정'}
                  </div>
                  <div
                    className='relative flex h-[40px] cursor-pointer items-center border-b border-[#e5e5e5] pl-[12px] text-[14px] hover:bg-[#0050B3] hover:text-white'
                    onMouseEnter={(e) => {
                      e.currentTarget.querySelector('.submenu2')?.classList.remove('hidden');
                    }}
                    onMouseLeave={(e) => {
                      e.currentTarget.querySelector('.submenu2')?.classList.add('hidden');
                    }}
                  >
                    <div className='mr-2'>
                      <BsDownload className='text-lg' />
                    </div>
                    다운로드
                    <div className='absolute right-2 text-lg'>
                      <IoIosArrowForward />
                    </div>
                    <div className='submenu2 absolute left-full top-0 hidden w-[120px] rounded-[8px] bg-[#fff] text-[#666] shadow-lg'>
                      <div
                        className='flex h-[40px] cursor-pointer items-center px-3 text-[14px] hover:rounded-t-[8px] hover:bg-[#0050B3] hover:text-white'
                        onClick={handleDownloadDocuments}
                      >
                        PDF 다운로드
                      </div>
                      <div
                        className='flex h-[40px] cursor-pointer items-center px-3 text-[14px] hover:bg-[#0050B3] hover:text-white'
                        onClick={handleDownloadTextDocuments}
                      >
                        텍스트 다운로드
                      </div>
                    </div>
                  </div>

                  <div
                    className='flex h-[40px] cursor-pointer items-center border-b border-[#e5e5e5] pl-[12px] text-[14px] hover:rounded-b-[8px] hover:bg-[#0050B3] hover:text-white'
                    onClick={() => handleMenuAction('print')}
                  >
                    <div className='mr-2'>
                      <IoPrintOutline className='text-lg' />
                    </div>
                    인쇄
                  </div>
                  {/*  <div
                  className='flex h-[40px] cursor-pointer items-center border-b border-[#e5e5e5] pl-[12px] text-[14px] hover:bg-[#0050B3] hover:text-white'
                  onClick={() => handleMenuAction('move')}
                >
                  <div className='mr-2'>
                    <TbArrowRightCircle className='text-lg' />
                  </div>
                  이동
                </div> */}
                </div>
              </div>
            )}
          </div>
        </DragDropContext>
        {/* 푸터 시작 */}
        <div className='fixed bottom-0 z-[50] flex h-[78px] w-full items-center justify-center bg-white shadow-inner'>
          <div id='footerBody' className='flex items-center justify-between'>
            <div className='hidden truncate text-[12px] lg:flex'>
              <div className='flex'>
                전체증거
                <p className='pl-[6px] font-bold text-[#252525]'>
                  {listEvidenceOutput?.data?.project_info?.total_evidences
                    ? listEvidenceOutput?.data?.project_info?.total_evidences.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ',')
                    : '0'}
                  개
                </p>
              </div>
              <div className='ml-[12px] flex'>
                누락증거
                <p className='pl-[6px] font-bold text-[#252525]'>
                  {listEvidenceOutput?.data?.project_info?.total_missing_pages
                    ? listEvidenceOutput?.data?.project_info?.total_missing_pages.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ',')
                    : '0'}
                  개
                </p>
              </div>
              <div className='ml-[12px] flex'>
                총 페이지{' '}
                <p className='pl-[6px] font-bold text-[#252525]'>
                  {listEvidenceOutput?.data?.project_info?.total_pages
                    ? listEvidenceOutput?.data?.project_info?.total_pages.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ',')
                    : '0'}
                  장
                </p>
              </div>
            </div>
            <div className='ml-[18px]'>
              <div
                onClick={downloadExcel}
                className='hidden h-[32px] w-[101px] cursor-pointer items-center justify-center rounded-[8px] border text-[14px] text-[#252525] lg:flex'
              >
                엑셀 다운로드
              </div>
            </div>

            <div className='min-w-[320px] 2xl:min-w-[380px]'>
              <EvidencePagination
                currentPage={currentPage}
                totalPages={listEvidenceOutput?.data?.pagination.pages || 1}
                onPageChange={(page) => {
                  setCurrentPage(page); // 현재 페이지를 업데이트
                  setSelectedPage(page); // 인풋 필드에 현재 페이지 값을 업데이트
                  refetchListEvidence(); // 데이터를 새로 불러옴
                }}
              />
            </div>
            <div className='ml-[16px] hidden w-[135px] items-center lg:flex'>
              <input
                type='text'
                value={selectedPage}
                onChange={(e) => {
                  const value = e.target.value;
                  if (/^\d*$/.test(value)) {
                    // 숫자만 허용
                    setSelectedPage(Number(value));
                  }
                }}
                placeholder='페이지 번호 입력'
                className='h-[36px] w-[50px] rounded-[8px] border border-gray-200 p-2 text-center text-[14px] focus:border-[#2B7994] focus:outline-none focus:ring-0'
                min={1}
                max={listEvidenceOutput?.data?.pagination.pages || 1} // 최대 페이지 제한
              />
              <span className='pl-[8px] pr-2 text-[14px]'>/</span>
              <span className='text-[14px]'>{listEvidenceOutput?.data?.pagination.pages || 0}</span>
              <button onClick={handlePageMove} className='ml-2 h-[36px] w-[50px] rounded-[8px] border text-[14px] text-[#313131]'>
                이동
              </button>
            </div>
            <div className='ml-[16px] hidden max-w-[200px] items-center lg:flex'>
              <Select
                value={itemsPerPage?.toString() || '50'}
                onValueChange={(value) => {
                  setItemsPerPage(Number(value));
                  setSelectedPage(1);
                  refetchListEvidence();
                }}
              >
                <SelectTrigger className='h-[32px] w-[120px]'>
                  <SelectValue placeholder='페이지당 개수' />
                </SelectTrigger>
                <SelectContent className='w-[200px]'>
                  {itemsPerPageOptions.map((option) => (
                    <SelectItem key={option} value={option.toString()}>
                      <p className='text-[12px]'>{option}개씩 보기</p>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            {currentUserIsCaseManager && (
              <div
                className='ml-[8px] hidden h-[40px] cursor-pointer items-center justify-center rounded-[8px] border border-[#0050B3] text-[14px] text-[#0050B3] sm:px-[5px] md:ml-[24px] md:h-[48px] md:px-[10px] md:text-[16px] lg:flex 2xl:px-[15px]'
                onClick={() => {
                  onMessageToast({
                    message: '신규 증거 추가 기능은 데모에서 비활성화되어 있습니다.',
                    icon: <IoIosWarning className='h-5 w-5 text-yellow-500' />,
                  });
                }}
              >
                <FiPlus className='mr-1 text-[16px] text-[#0050B3] md:mr-2 md:text-[18px]' />
                <span className='max-w-[100px] truncate'>신규 증거 추가</span>
              </div>
            )}
          </div>
        </div>
        {/* 푸터 끝 */}

        {/* 모달 시작 */}
        {isNoteDeleteOpen && (
          <ModalSelect
            sendMessage={'메모를 삭제하시겠습니까?'}
            storageMessage={'모든 사용자의 증거목록에서 메모가 삭제됩니다. 메모를 삭제하시겠습니까?'}
            handleSave={handleConfirmDelete}
            setIsModalOpen={() => setIsNoteDeleteOpen(false)}
            confirmButtonText='삭제'
          />
        )}

        {isWarningOpen && (
          <WarningModal
            sendMessage={'선택된 문서가 없습니다.'}
            storageMessage={'문서를 선택 후 버튼을 눌러주세요.'}
            setIsModalOpen={() => {
              setIsWarningOpen(false);
              setContextMenu(null);
            }}
          />
        )}
        {/*
      <Tooltip
        id='tooltip'
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
      */}
        <UploadModal
          isOpen={isUploadModalOpen}
          onClose={() => setIsUploadModalOpen(false)}
          onSuccess={handleUploadSuccess}
          projectId={projectId || ''}
        />
      </S.AllBody>
    </div>
  );
};

export default EvidenceDemoTable;
