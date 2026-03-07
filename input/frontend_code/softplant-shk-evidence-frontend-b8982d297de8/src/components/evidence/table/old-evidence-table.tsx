// 다중메모 적용하기 전 테이블 컴포넌트

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
import '@/components/evidence/table/evidence.css';

import { useState, useEffect, useRef, useMemo } from 'react';

import { DragDropContext, Droppable, Draggable } from '@hello-pangea/dnd';
import { useQueryClient } from '@tanstack/react-query';
import { Bookmark, BookmarkNone } from 'assets/images';
import ReactDOM from 'react-dom';
import { BsDownload, BsPinFill, BsTrash, BsCopy, BsPin } from 'react-icons/bs';
import { CiStar } from 'react-icons/ci';
import { FiAlertCircle, FiSearch, FiMaximize2, FiPlus } from 'react-icons/fi';
import { IoIosWarning, IoMdSend, IoIosArrowForward, IoMdCloseCircle } from 'react-icons/io';
import { IoDocumentOutline, IoPrintOutline } from 'react-icons/io5';
import { LuPencilLine } from 'react-icons/lu';
import { MdDragIndicator } from 'react-icons/md';
import { TbEye } from 'react-icons/tb';
import { useSearchParams } from 'react-router-dom';
import { Tooltip } from 'react-tooltip';
import { useIsMounted } from 'usehooks-ts';
import * as XLSX from 'xlsx';

import {
  useCreateEvidenceMemo,
  useCreateEvidenceBookmark,
  useModifyEvidenceMemo,
  useDownloadDocumentFile,
  useCreateEvidencePin,
  useDragAndDropEvidence,
  useAddHistory,
} from '@query/mutation';
import { useDeleteEvidenceMemo } from '@query/mutation/evidence/use-delete-evidence-memo';
import { useListEvidence, useFindUserInfo, useEvidenceFilter } from '@query/query';
import CustomSpinner from '@components/common/spiner';
import { EVIDENCE_QUERY_KEY } from '@/apis';
import { fetchListEvidence } from '@/apis/evidence-api';
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
import { evidenceStyle as S } from '@/shared/styled/evidence';

type THandlers = {
  bookmarkHandler?: (selectedItems: number[]) => void; // 선택된 항목에 대한 북마크 핸들러
  memoHandler?: (selectedItems: number[]) => void; // 선택된 항목에 대한 메모 핸들러
  printHandler?: () => void; // 인쇄 핸들러
  downHandler?: () => void; // 다운로드 핸들러
};

type TEvidenceTableWrapperProps = {
  registerHandlers: (handlers: THandlers) => void;
  fontSizeAdjustment?: number;
};
type TContextMenuType = {
  x: number;
  y: number;
  itemId: number; // or string, depending on your evidence_id type
} | null;

// import EvidenceDetailModal from '@/components/evidence/modal/evidence-detail-modal';

// import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';

export const EvidenceTable = ({
  registerHandlers,
}: TEvidenceTableWrapperProps & {
  registerHandlers: (handlers: { [key: string]: () => void }) => void;
}): JSX.Element => {
  const [contextMenu, setContextMenu] = useState<TContextMenuType>(null);
  const [selectedItems, setSelectedItems] = useState<any[]>([]); // 체크된 행의 ID 배열
  const [currentRowIndex, setCurrentRowIndex] = useState<number | null>(null); // 우클릭한 행의 인덱스
  const [lastCheckedIndex, setLastCheckedIndex] = useState<number | null>(null);

  const [isUploadModalOpen, setIsUploadModalOpen] = useState(false);

  const tableContainerRef = useRef<HTMLDivElement>(null);
  // ! 메모관련 상태

  const [fixedMemoId, setFixedMemoId] = useState<string | null>(null);
  const [memoPosition, setMemoPosition] = useState({ top: 0, left: 0 });
  const [hoveredMemoId, setHoveredMemoId] = useState<string | null>(null);
  const [isEditing, setIsEditing] = useState<{
    memoId: string;

    content: string;
  } | null>(null);
  const [writingMemoId, setWritingMemoId] = useState<string | null>(null);

  const [newMemoContent, setNewMemoContent] = useState('');
  const [isNoteDeleteOpen, setIsNoteDeleteOpen] = useState(false);
  const [deleteMemoId, setDeleteMemoId] = useState<string | null>(null);

  // ! 필터관련 상태
  const [selectedNameFilters, setSelectedNameFilters] = useState<string[]>([]);
  const [selectedSummaryFilters, setSelectedSummaryFilters] = useState<string[]>([]);
  const [selectedReferenceFilters, setSelectedReferenceFilters] = useState<string[]>([]);
  const [selectedCategoryFilters, setSelectedCategoryFilters] = useState<string[]>([]);
  const [selectedBookmarkFilters, setSelectedBookmarkFilters] = useState<string[]>([]);
  const [selectedMemoFilters, setSelectedMemoFilters] = useState<string[]>([]);
  const [selectedMissingPageFilters, setSelectedMissingPageFilters] = useState<string[]>([]);
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
  const [summaryPosition, setSummaryPosition] = useState({ top: 0, left: 0 });
  const [hoveredSummaryId, setHoveredSummaryId] = useState<string | null>(null);

  // ! 경고 모달
  const [isWarningOpen, setIsWarningOpen] = useState(false);

  const [isMounted, setIsMounted] = useState(false);

  const [resizingColumn, setResizingColumn] = useState<string | null>(null);
  const [startX, setStartX] = useState(0);
  const [startWidth, setStartWidth] = useState(0);
  // ! usehooks-ts 모음
  const isMountedHook = useIsMounted();

  const projectId = searchParams.get('project_id');
  // !유저정보 가져오기
  const { response: findEvidenceUserInfo } = useFindUserInfo();
  const fontSizeAdjustment = findEvidenceUserInfo?.data?.font_size_rate || 0;
  const [itemsPerPage, setItemsPerPage] = useState(50);
  useEffect(() => {
    if (findEvidenceUserInfo?.data?.evi_display_cnt) {
      setItemsPerPage(findEvidenceUserInfo.data.evi_display_cnt);
    }
  }, [findEvidenceUserInfo?.data?.evi_display_cnt]);
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
      evidence_number: 100,
      evidence_title: 150,
      summary: 130,
      evidence_name: 100,
      reference: 120,
      category: 100,
      bookmark: 100,
      memo: 100,
      start_page: 100,
      page_count: 100,
      missing_page: 100,
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
  const { onAddHistory } = useAddHistory();
  // 초기 리스트 API
  const {
    response: listEvidenceOutput,
    refetch: refetchListEvidence,
    isLoading,
  } = useListEvidence({
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
    },
    sort_column: sortColumn,
    sort_direction: sortDirection,
  });

  // ! useMemo 모음 (1)
  const isProcessing = useMemo(() => {
    return isLoading || !isMounted;
  }, [isLoading, isMounted]);

  const extractSearchTerms = (searchStr: string) => {
    if (!searchStr) return '';

    // AND, OR, (, ) 앞에 #을 붙임
    return searchStr
      .replace(/\b(AND|OR)\b/g, '#$1') // AND, OR 앞에 # 추가
      .replace(/\(/g, '#(') // 여는 괄호 앞에 # 추가
      .replace(/\)/g, '#)'); // 닫는 괄호 앞에 # 추가
  };

  const handlePowerSearchSubmit = (searchQuery: string, excludeQuery: string[]) => {
    setPowerSearch(searchQuery);

    const processedQuery = extractSearchTerms(searchQuery);

    setPowerSearch(processedQuery);
    setExcludeTerms(excludeQuery);
    setTempInput('');
    setCurrentPage(1);
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
    setResetPowerSearch(true); // 파워검색 모달 초기화 트리거
    setIsPowerSearchModalOpen(false); // 파워검색 모달 닫기
    setSearchExecuted(false);
    // API 재호출 전에 약간의 지연
    setTimeout(() => {
      refetchListEvidence();
      // 다음 파워검색을 위해 reset 상태 복원
      setResetPowerSearch(false);
    }, 100);
  };

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
      setSortDirection(sortDirection === 'asc' ? 'desc' : 'asc');
    } else {
      setSortColumn(column);
      setSortDirection('asc');
    }
    refetchListEvidence();
  };
  // ! 증거 목록 필터 리스트 api
  const { response: filterData } = useEvidenceFilter({
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
      ],
    },
  });

  // ! 파워검색 버튼 클릭 시 실행
  const handlePowerSearch = () => {
    setIsPowerSearchModalOpen(true);
  };

  // ! mutation 함수 호출
  const { onCreateEvidenceMemo } = useCreateEvidenceMemo();
  const { onCreateEvidenceBookmark } = useCreateEvidenceBookmark();
  const { onDeleteEvidenceMemo } = useDeleteEvidenceMemo();
  const { onModifyEvidenceMemo } = useModifyEvidenceMemo();
  const { onCreateEvidencePin } = useCreateEvidencePin();
  const { onDragAndDropEvidence } = useDragAndDropEvidence();

  const handleFilterToggle = (filterName: string) => {
    setOpenFilter(openFilter === filterName ? null : filterName);
  };
  const getID = localStorage.getItem('evidence-frontend-login') || '{}';
  const parsedData = JSON.parse(getID);
  const officeId = parsedData?.data?.user?.office_id;

  // ! 문서다운로드 함수 호출
  const { onDownloadDocumentFile } = useDownloadDocumentFile();
  const handleDownloadDocuments = async () => {
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
        const response = await onDownloadDocumentFile({
          office_id: officeId || '',
          project_id: projectId || '',
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

  // TEXT 다운로드도 동일한 방식으로 수정
  const handleDownloadTextDocuments = async () => {
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
        const response = await onDownloadDocumentFile({
          office_id: officeId || '',
          project_id: projectId || '',
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
      const allDataResponse = await fetchListEvidence({
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
    return listEvidenceOutput?.data?.results || [];
  }, [listEvidenceOutput]);

  // !핀등록
  const handlePinToggle = async (evidenceIds: string[]) => {
    try {
      // 선택된 항목들의 현재 핀 상태 확인
      const selectedItemsData = displayData.filter((item) => evidenceIds.includes(item.evidence_id));
      const pinnedCount = selectedItemsData.filter((item) => pinnedItems.includes(item.evidence_id)).length;

      // 조건에 따른 메시지 분기
      let message = '';

      if (pinnedCount === evidenceIds.length) {
        // 모든 항목이 핀 등록된 경우
        message = evidenceIds.length > 1 ? '선택한 모든 항목의 핀 등록이 해제되었습니다.' : '핀 등록이 해제되었습니다.';
      } else if (pinnedCount === 0) {
        // 모든 항목이 핀 등록되지 않은 경우
        message = evidenceIds.length > 1 ? '선택한 모든 항목이 핀 등록되었습니다.' : '핀 등록에 성공했습니다.';
      } else {
        // 일부만 핀 등록된 경우
        message = `선택한 항목 중 ${pinnedCount}개는 핀 등록이 해제되었고, ${evidenceIds.length - pinnedCount}개는 핀 등록되었습니다.`;
      }

      // 선택된 모든 항목에 대해 핀 등록/해제
      const results = await Promise.all(
        evidenceIds.map((evidenceId) =>
          onCreateEvidencePin({
            project_id: projectId || '',
            evidence_id: evidenceId,
          }),
        ),
      );

      // 모든 요청이 성공했는지 확인
      if (results.every((result) => result?.isSuccess)) {
        onMessageToast({
          message: message,
          icon: <IoMdSend className='h-5 w-5 text-green-500' />,
        });
        refetchListEvidence();
        setSelectedItems([]);
      }
    } catch (error) {
      console.error('Pin toggle failed:', error);
    }
  };
  const handleClearInput = () => {
    setTempInput(''); // 먼저 검색어 초기화
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
  // 행 클릭 핸들러 추가
  // 행 클릭 핸들러 수정
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
        if (!isEditing) {
          setMemoPosition({
            top: rect.bottom + scrollTop,
            left: rect.left,
          });
        }

        // 해당 항목 찾기
        const foundItem = displayData.find((item) => item.evidence_id === evidenceId);

        // 메모가 있으면 기존 메모 표시, 없으면 새 메모 작성 창 표시
        if (foundItem?.memos?.length && foundItem.memos.length > 0) {
          setFixedMemoId(evidenceId);
        } else {
          setWritingMemoId(evidenceId);
          setHoveredSummaryId(null);
        }
      }
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

    if (!listEvidenceQueryData) return;

    queryClient.setQueryData<TListEvidenceOutput>(listEvidenceQueryKey, {
      ...listEvidenceQueryData,
      data: {
        ...listEvidenceQueryData.data,
        results: items,
      },
    });

    try {
      const response = await onDragAndDropEvidence({
        project_id: projectId,
        target_id: reorderedItem.evidence_id,
        after_id: items[result.destination.index + 1]?.evidence_id || '',
        before_id: items[result.destination.index - 1]?.evidence_id || '',
      });

      if (response.success) {
        onMessageToast({
          message: '순서가 변경되었습니다.',
          icon: <IoMdSend className='h-5 w-5 text-green-500' />,
        });
        refetchListEvidence();
      }
    } catch (error) {
      console.error('Reorder failed:', error);
    }
  };

  // ! 메모 저장 수정 함수
  const handleSaveNote = async (evidence_id: string, content: string, memoId?: string) => {
    try {
      let response;
      if (memoId) {
        // 메모 수정 API 호출
        response = await onModifyEvidenceMemo({
          memo_id: memoId, // memos 배열 안의 메모 ID
          content: content,
        });
      } else {
        // 새 메모 저장 API 호출
        response = await onCreateEvidenceMemo({
          project_id: projectId || '',
          evidence_id: evidence_id,
          content: content,
        });
      }
      // 체크박스 해제
      setTimeout(() => setSelectedItems([]), 100);

      if (response?.isSuccess) {
        onMessageToast({
          message: memoId ? '메모가 성공적으로 수정되었습니다.' : '메모가 성공적으로 저장되었습니다.',
          icon: <IoMdSend className='h-5 w-5 text-green-500' />,
        });

        refetchListEvidence();
        setIsEditing(null);
      } else {
        onMessageToast({
          message: response?.message ?? '메모 저장/수정에 실패했습니다.',
          icon: <IoIosWarning className='h-5 w-5 text-yellow-500' />,
        });
      }
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
      // API 호출: 메모 삭제
      const response = await onDeleteEvidenceMemo({
        memo_id: memoId,
      });
      console.log('memo_id:', memoId);
      setTimeout(() => setSelectedItems([]), 100);
      if (response?.isSuccess) {
        onMessageToast({
          message: '메모가 성공적으로 삭제되었습니다.',
          icon: <IoMdSend className='h-5 w-5 text-green-500' />,
        });

        refetchListEvidence();

        setIsNoteDeleteOpen(false); // 삭제 모달 닫기
      } else {
        onMessageToast({
          message: response?.message ?? '메모 삭제에 실패했습니다.',
          icon: <IoIosWarning className='h-5 w-5 text-yellow-500' />,
        });
      }
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

        await onCreateEvidenceBookmark({
          project_id: projectId || '',
          evidence_id: evidenceId,
        });

        onMessageToast({
          message: isCurrentlyBookmarked ? '북마크가 해제되었습니다.' : '북마크가 추가되었습니다.',
          icon: <IoMdSend className='h-5 w-5 text-green-500' />,
        });
        refetchListEvidence(); // 목록 갱신
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

      await Promise.all(
        selectedItems.map((id) =>
          onCreateEvidenceBookmark({
            project_id: projectId || '',
            evidence_id: id,
          }),
        ),
      );
      if (!evidenceId) {
        // 직접 ID를 받지 않은 경우 (여러 항목 선택 시)
        setTimeout(() => setSelectedItems([]), 100);
      }
      onMessageToast({
        message: message,
        icon: <IoMdSend className='h-5 w-5 text-green-500' />,
      });
      refetchListEvidence();
    } catch (error) {
      console.error('북마크 저장 실패:', error);
      onMessageToast({
        message: '북마크 저장 중 오류가 발생했습니다.',
        icon: <IoIosWarning className='h-5 w-5 text-yellow-500' />,
      });
    }
  };
  // !문서보기

  const handleViewDocument = async (evidenceId: string) => {
    const url = `/evidence/pdf/${evidenceId}?projectId=${projectId}&officeId=${officeId}`;
    window.open(url, '_blank');
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

        const printUrl = `/evidence/pdf/${evidenceId}?projectId=${projectId}&officeId=${officeId}&print=true`;

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

    if (action === 'note' && selectedItems.length > 1) {
      onMessageToast({
        message: '현재 버전에서 메모는 한 개의 문서에만 추가할 수 있습니다.',
        icon: <IoIosWarning className='h-5 w-5 text-yellow-500' />,
      });
      return;
    }

    const selectedItem = displayData.find((item) => item.evidence_id === contextMenu?.itemId.toString());

    switch (action) {
      case 'note':
        setOpenFilter(null);
        row = document.querySelector(`[data-evidence-id="${selectedItems[0]}"]`);
        memoCell = row ? row.querySelector('.memo-cell') : null;
        if (memoCell) {
          const rect = memoCell.getBoundingClientRect();
          setMemoPosition({
            top: rect.bottom,
            left: rect.left,
          });

          if (selectedItem?.memos && selectedItem.memos.length > 0) {
            setIsEditing({
              memoId: selectedItem.memos[0].memo_id,
              content: selectedItem.memos[0].content,
            });
          } else {
            setWritingMemoId(contextMenu?.itemId.toString() || '');
          }
          setFixedMemoId(selectedItems[0]);
        }
        break;
      case 'bookmark':
        handleSaveBookmark();
        break;
      case 'view':
        handleViewDocument(selectedEvidenceId);

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
  const handleViewPDF = () => {
    if (!officeId) {
      onMessageToast({
        message: '사용자 정보가 없습니다. 다시 로그인해주세요.',
        icon: <IoIosWarning className='h-5 w-5 text-yellow-500' />,
      });
      return;
    }

    if (selectedItems.length === 0) {
      setIsWarningOpen(true);
      setContextMenu(null);
      return;
    }
    setTimeout(() => setSelectedItems([]), 500);
    selectedItems.forEach((evidenceId) => {
      const newWindow = window.open(`/evidence/pdf/${evidenceId}?projectId=${projectId}&officeId=${officeId}`, '_blank');
      if (!newWindow) {
        onMessageToast({
          message: '팝업 차단이 활성화되어 있습니다. 팝업 차단을 해제해주세요.',
          icon: <IoIosWarning className='h-5 w-5 text-yellow-500' />,
        });
      }
    });
  };

  const handleViewText = () => {
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
        `/evidence/text/${evidenceId}?projectId=${projectId}&officeId=${officeId}&evidenceName=${encodedName}`,
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
      }, 500);

      if (tempInput.trim().length >= 2) {
        setSelectedNameFilters([]);
        setSelectedReferenceFilters([]);
        setSelectedCategoryFilters([]);
        setSelectedBookmarkFilters([]);
        setSelectedMemoFilters([]);
        setSearchExecuted(true);
        refetchListEvidence();
      } else if (tempInput.trim().length === 0) {
        setSearchExecuted(true);
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
      setSearchExecuted(true);
      refetchListEvidence();
    } else if (tempInput.trim().length === 0) {
      setSearchExecuted(true);
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
  };
  // 우클릭 메뉴 바깥 클릭 시 닫기
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (contextMenuRef.current && !contextMenuRef.current.contains(event.target as Node)) {
        setContextMenu(null); // 바깥 클릭 시만 닫기
      }
    };

    document.addEventListener('click', handleClickOutside);
    return () => {
      document.removeEventListener('click', handleClickOutside);
    };
  }, []);

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
  const handleSummaryCopy = (text: string) => {
    navigator.clipboard.writeText(text);
    onMessageToast({
      message: '요약이 복사되었습니다.',
    });
  };

  const openSummaryInNewWindow = (text: string, evidenceNumber: string, evidenceTitle: string, evidenceId: string) => {
    onAddHistory({
      project_id: projectId || '',
      evidence_id: evidenceId,
      type: 'SUMMARY_VIEW',
    });

    // 요약 텍스트와 제목을 URL 인코딩하여 쿼리 파라미터로 전달
    const encodedSummary = encodeURIComponent(text);
    const encodedTitle = encodeURIComponent(evidenceTitle || '문서 요약');

    const newWindow = window.open(
      `/evidence/summary/${evidenceNumber}?summaryText=${encodedSummary}&evidenceName=${encodedTitle}`,
      '_blank',
    );

    if (!newWindow) {
      onMessageToast({
        message: '팝업 차단이 활성화되어 있습니다. 팝업 차단을 해제해주세요.',
        icon: <IoIosWarning className='h-5 w-5 text-yellow-500' />,
      });
    }
  };
  // ! API 응답에서 핀 상태 업데이트
  useEffect(() => {
    if (listEvidenceOutput?.data?.results) {
      const pinnedEvidences = listEvidenceOutput.data.results.filter((item) => item.isPinned).map((item) => item.evidence_id);
      setPinnedItems(pinnedEvidences);
    }
  }, [listEvidenceOutput]);
  useEffect(() => {
    // 부모에서 전달받은 핸들러 등록
    registerHandlers({
      bookmarkHandler: () => {
        if (selectedItems.length === 0) {
          setIsWarningOpen(true);
          setContextMenu(null);
          return;
        }
        handleSaveBookmark(); // 첫 번째 선택된 항목에 대해 북마크 처리
      },
      memoHandler: () => {
        if (selectedItems.length === 0) {
          setIsWarningOpen(true);
          setContextMenu(null);

          return;
        }

        // 선택된 항목에 대한 메모 처리 로직 추가
      },
    });
  }, [registerHandlers, selectedItems]); // eslint-disable-line react-hooks/exhaustive-deps

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
  // 모달 외부 클릭 핸들러
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      const isClickOutside = !(event.target as Element).closest('.memo-hover-modal');

      // ✨ 수정 중 or 새 메모 작성 중이면 닫지 않음
      if (isClickOutside && !isEditing && !writingMemoId) {
        setFixedMemoId(null);
        setHoveredMemoId(null);
      }
    };

    const handleScroll = () => {
      if (!isEditing && !writingMemoId) {
        setFixedMemoId(null);
        setHoveredMemoId(null);
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
      selectedMissingPageFilters.length > 0
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
  ]);

  useEffect(() => {
    void delayUtil(1000).then(() => {
      if (isMountedHook()) setIsMounted(true);
    });
  }, [isMountedHook]);

  return (
    <S.AllBody>
      <div id='evidence-table-head' className='absolute right-[7.5%] top-[125px] z-20 flex items-center 2xl:right-[15%]'>
        <div className=''>
          <div className='flex'>
            <div className='relative'>
              <FiSearch
                className='absolute right-4 top-1/2 -translate-y-1/2 transform cursor-pointer text-[25px] text-gray-500'
                onClick={handleSearchClick}
              />
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
              `fixed left-[20px] top-[370px] z-[50] flex -translate-y-1/2 flex-col gap-3 rounded-[12px] bg-white p-[7px] shadow-lg sm:left-1 md:left-[20px] 2xl:left-[calc(15%-85px)]`,
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
                  handleViewPDF();
                }}
              >
                <img src={Eys} className='' />
              </div>
              {selectedItems.length > 0 ? (
                // 항목이 선택되었을 때 서브메뉴 표시
                <div className={cn('submenu absolute left-[50px] top-0 hidden group-hover:block 2xl:left-[-120px]')}>
                  <div className={cn('z-[9999] rounded-[8px] border border-[#E5E5E5] bg-white shadow-lg')}>
                    <div
                      className='cursor-pointer whitespace-nowrap rounded-t-[8px] p-2 hover:bg-[#0050B3] hover:text-white'
                      onClick={handleViewPDF}
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
                <div className='absolute left-[50px] top-1/2 hidden h-[36px] w-[77px] -translate-y-1/2 rounded-md border border-[#e5e5e5] bg-white text-center text-[14px] leading-[36px] text-[#666] shadow-lg group-hover:block 2xl:left-[-90px]'>
                  증거보기
                </div>
              )}
            </div>

            {/* 북마크 */}
            <div className='group relative'>
              <div className='cursor-pointer rounded-lg p-[7px] hover:bg-gray-100' onClick={() => handleMenuAction('bookmark')}>
                <img src={Star} className='' />
              </div>
              <div className='absolute left-[50px] top-1/2 hidden h-[36px] w-[65px] -translate-y-1/2 rounded-md border border-[#e5e5e5] bg-white text-center text-[14px] leading-[36px] text-[#666] shadow-lg group-hover:block 2xl:left-[-80px]'>
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
                    const selectedItem = displayData.find((item) => item.evidence_id === selectedItems[0]);
                    const row = document.querySelector(`[data-evidence-id="${selectedItems[0]}"]`);
                    const memoCell = row ? row.querySelector('.memo-cell') : null;

                    if (memoCell) {
                      const rect = memoCell.getBoundingClientRect();
                      setMemoPosition({
                        top: rect.bottom,
                        left: rect.left,
                      });

                      if (selectedItem?.memos && selectedItem.memos.length > 0) {
                        setIsEditing({
                          memoId: selectedItem.memos[0].memo_id,
                          content: selectedItem.memos[0].content,
                        });
                      } else {
                        setWritingMemoId(selectedItems[0]);
                        setFixedMemoId(null); // 기존 메모 모달 닫기
                        setHoveredMemoId(null);
                      }
                      setFixedMemoId(selectedItems[0]);
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
                className={`absolute left-[50px] top-1/2 hidden min-h-[36px] min-w-[50px] -translate-y-1/2 rounded-md border border-[#e5e5e5] bg-white px-2 text-center text-[14px] leading-[36px] text-[#666] shadow-lg group-hover:block 2xl:left-[-65px] ${
                  selectedItems.length > 1 ? 'w-[240px]' : ''
                }`}
              >
                {selectedItems.length > 1 ? '현재 버전에서는 메모는 1개만 등록가능합니다' : '메모'}
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
                <div className='submenu absolute left-[55px] top-0 hidden min-w-[96px] group-hover:block 2xl:left-[-97px]'>
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
                <div className='absolute left-[50px] top-1/2 hidden h-[36px] w-[77px] -translate-y-1/2 rounded-md border border-[#e5e5e5] bg-white text-center text-[14px] leading-[36px] text-[#666] shadow-lg group-hover:block 2xl:left-[-90px]'>
                  다운로드
                </div>
              )}
            </div>

            {/* 인쇄 */}
            <div className='group relative'>
              <div className='cursor-pointer rounded-lg p-[7px] hover:bg-gray-100' onClick={() => handleMenuAction('print')}>
                <img src={Print} className='' />
              </div>
              <div className='absolute left-[50px] top-1/2 hidden h-[36px] min-w-[50px] -translate-y-1/2 rounded-md border border-[#e5e5e5] bg-white text-center text-[14px] leading-[36px] text-[#666] shadow-lg group-hover:block 2xl:left-[-65px]'>
                인쇄
              </div>
            </div>
          </div>
        </div>
        <div className='mt-4 flex justify-center'>
          <div id='evidence-table-body' className='w-[85%] 2xl:w-[70%]'>
            {(powerSearch || tempInput) && (
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
                    <span className='pl-1 text-[12px] text-[#666]'>검색결과 ({listEvidenceOutput?.data?.pagination?.total || 0}개)</span>
                    <button className='ml-[8px] text-[12px] text-[#FF0000] underline' onClick={handleReset}>
                      초기화
                    </button>
                  </>
                )}
                {powerSearch && (
                  <>
                    <span className='pl-1 text-[12px] text-[#666]'>검색결과 ({listEvidenceOutput?.data?.pagination?.total || 0}개)</span>
                    <button className='ml-[8px] text-[12px] text-[#FF0000] underline' onClick={handleReset}>
                      초기화
                    </button>
                  </>
                )}
              </div>
            )}

            <div className='evidence-table-container evidence-table-scroll relative max-h-[calc(100vh-300px)] w-full overflow-visible'>
              <div className='w-full' ref={tableContainerRef}>
                <Droppable droppableId='evidence-table'>
                  {(provided) => (
                    <table className='' ref={provided.innerRef} {...provided.droppableProps}>
                      <thead className='evidence-table-header sticky top-0 z-50 bg-[#E6EFFF] font-bold text-[#252525]'>
                        {/* 메인 헤더 */}
                        <tr className='h-[52px]'>
                          <th className='rounded-tl-[8px] pb-[26px] pt-[8px] lg:min-w-[50px] lg:max-w-[80px]'>
                            <input
                              ref={selectAllRef}
                              type='checkbox'
                              className='h-[20px] w-[20px] rounded-[2px] border-[#CCD0D1] text-[#4577A4] outline-none focus:ring-0'
                              onChange={(e) => handleSelectAllChange(e.target.checked)}
                              checked={selectedItems.length === (listEvidenceOutput?.data?.results?.length || 0)}
                            />
                          </th>
                          <th
                            className='w-[5%] min-w-[50px] cursor-col-resize whitespace-nowrap pb-[26px] pt-[8px] text-center'
                            data-column-id='evidence_number'
                            style={{
                              width: `${columnWidths.evidence_number}px`,
                              minWidth: `${columnWidths.evidence_number}px`,
                              position: 'relative',
                            }}
                          >
                            <div className='flex' onMouseDown={(e) => handleMouseDown(e, 'evidence_number')}>
                              <button onClick={() => handleHeaderSort('evidence_number')} className='ml-1'>
                                {sortColumn === 'evidence_number' ? (
                                  sortDirection === 'asc' ? (
                                    <img src={clumHIcon} className='h-[20px] w-[20px]' alt='오름차순' />
                                  ) : (
                                    <img src={clumBIcon} className='h-[20px] w-[20px]' alt='내림차순' />
                                  )
                                ) : (
                                  <img src={allSortIcon} className='h-[20px] w-[20px]' />
                                )}
                              </button>
                              <span
                                className={`text-[#252525] ${getFontSizeClass(12, fontSizeAdjustment)}`}
                                style={{ fontSize: `${getAdjustedSize(12)}px` }}
                              >
                                번호
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
                            className='w-[10%] min-w-[100px] cursor-col-resize whitespace-nowrap pb-[26px] pt-[8px] text-left 2xl:w-[15%]'
                          >
                            <div className='flex' onMouseDown={(e) => handleMouseDown(e, 'evidence_title')}>
                              <button onClick={() => handleHeaderSort('evidence_title')} className='ml-1'>
                                {sortColumn === 'evidence_title' ? (
                                  sortDirection === 'asc' ? (
                                    <img src={clumHIcon} className='h-[20px] w-[20px]' alt='오름차순' />
                                  ) : (
                                    <img src={clumBIcon} className='h-[20px] w-[20px]' alt='내림차순' />
                                  )
                                ) : (
                                  <img src={allSortIcon} className='h-[20px] w-[20px]' />
                                )}
                              </button>
                              <span
                                className={`ttext-[#252525] ${getFontSizeClass(12, fontSizeAdjustment)}`}
                                style={{ fontSize: `${getAdjustedSize(12)}px` }}
                              >
                                증거명
                              </span>
                            </div>
                          </th>

                          <th
                            className='w-[13%] min-w-[130px] cursor-col-resize whitespace-nowrap pb-[26px] pt-[8px] text-left'
                            data-column-id='summary'
                            style={{
                              width: `${columnWidths.summary}px`,
                              minWidth: `${columnWidths.summary}px`,
                              position: 'relative',
                            }}
                          >
                            <div className='flex' onMouseDown={(e) => handleMouseDown(e, 'summary')}>
                              <button onClick={() => handleHeaderSort('summary')} className='ml-1'>
                                {sortColumn === 'summary' ? (
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
                            className='w-[8%] min-w-[70px] cursor-col-resize whitespace-nowrap pb-[26px] pl-4 pr-3 pt-[8px] text-left text-sm font-semibold text-gray-900'
                            data-column-id='evidence_name'
                            style={{
                              width: `${columnWidths.evidence_name}px`,
                              minWidth: `${columnWidths.evidence_name}px`,
                              position: 'relative',
                            }}
                          >
                            <div className='flex' onMouseDown={(e) => handleMouseDown(e, 'evidence_name')}>
                              <button onClick={() => handleHeaderSort('evidence_name')} className='ml-1'>
                                {sortColumn === 'evidence_name' ? (
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
                                column='이름'
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
                            className='min-w-[100px] cursor-col-resize whitespace-nowrap pb-[26px] pt-[8px] text-left 2xl:w-[8%]'
                            data-column-id='reference'
                            style={{
                              width: `${columnWidths.reference}px`,
                              minWidth: `${columnWidths.reference}px`,
                              position: 'relative',
                            }}
                          >
                            <div className='flex' onMouseDown={(e) => handleMouseDown(e, 'reference')}>
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
                                column='참고사항'
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
                            className='w-[10%] min-w-[100px] cursor-col-resize whitespace-nowrap pb-[26px] pt-[8px] text-left'
                            data-column-id='category'
                            style={{
                              width: `${columnWidths.category}px`,
                              minWidth: `${columnWidths.category}px`,
                              position: 'relative',
                            }}
                          >
                            <div className='flex' onMouseDown={(e) => handleMouseDown(e, 'category')}>
                              <button onClick={() => handleHeaderSort('category')} className='ml-1'>
                                {sortColumn === 'category' ? (
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
                            className='relative w-[7%] min-w-[110px] cursor-col-resize whitespace-nowrap text-left'
                            data-column-id='bookmark'
                            style={{
                              width: `${columnWidths.bookmark}px`,
                              minWidth: `${columnWidths.bookmark}px`,
                              position: 'relative',
                            }}
                          >
                            <div className='flex' onMouseDown={(e) => handleMouseDown(e, 'bookmark')}>
                              <button onClick={() => handleHeaderSort('bookmark')} className='ml-1'>
                                {sortColumn === 'bookmark' ? (
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
                            className='w-[15%] min-w-[150px] cursor-col-resize whitespace-nowrap text-left'
                            data-column-id='memo'
                            style={{
                              width: `${columnWidths.memo}px`,
                              minWidth: `${columnWidths.memo}px`,
                              position: 'relative',
                            }}
                          >
                            <div className='itmes-center z-[9999] flex' onMouseDown={(e) => handleMouseDown(e, 'memo')}>
                              <button onClick={() => handleHeaderSort('memo')} className='ml-1'>
                                {sortColumn === 'memo' ? (
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
                            </div>
                            <span className='pl-2 text-[12px] font-bold text-[#252525] underline'>
                              {displayData.filter((item) => item.memos?.length > 0).length}
                            </span>
                          </th>

                          <th
                            className='w-[4%] min-w-[50px] cursor-col-resize whitespace-nowrap pb-[26px] pt-[8px] text-left'
                            data-column-id='start_page'
                            style={{
                              width: `${columnWidths.start_page}px`,
                              minWidth: `${columnWidths.start_page}px`,
                              position: 'relative',
                            }}
                          >
                            <div className='flex' onMouseDown={(e) => handleMouseDown(e, 'start_page')}>
                              <button onClick={() => handleHeaderSort('start_page')} className='ml-1'>
                                {sortColumn === 'start_page' ? (
                                  sortDirection === 'asc' ? (
                                    <img src={clumHIcon} className='h-[20px] w-[20px]' alt='오름차순' />
                                  ) : (
                                    <img src={clumBIcon} className='h-[20px] w-[20px]' alt='내림차순' />
                                  )
                                ) : (
                                  <img src={allSortIcon} className='h-[20px] w-[20px]' />
                                )}
                              </button>
                              <span
                                className={`text-[#252525] ${getFontSizeClass(12, fontSizeAdjustment)}`}
                                style={{ fontSize: `${getAdjustedSize(12)}px` }}
                              >
                                시작
                              </span>
                            </div>
                          </th>
                          <th
                            className='w-[5%] min-w-[70px] cursor-col-resize whitespace-nowrap pb-[26px] pt-[8px] text-left'
                            data-column-id='page_count'
                            style={{
                              width: `${columnWidths.page_count}px`,
                              minWidth: `${columnWidths.page_count}px`,
                              position: 'relative',
                            }}
                          >
                            <div className='flex' onMouseDown={(e) => handleMouseDown(e, 'page_count')}>
                              <button onClick={() => handleHeaderSort('page_count')} className='ml-1'>
                                {sortColumn === 'page_count' ? (
                                  sortDirection === 'asc' ? (
                                    <img src={clumHIcon} className='h-[20px] w-[20px]' alt='오름차순' />
                                  ) : (
                                    <img src={clumBIcon} className='h-[20px] w-[20px]' alt='내림차순' />
                                  )
                                ) : (
                                  <img src={allSortIcon} className='h-[20px] w-[20px]' />
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
                            className='w-[7%] min-w-[110px] cursor-col-resize whitespace-nowrap rounded-tr-[8px] pb-[26px] pt-[8px] text-left'
                            data-column-id='missing_page'
                            style={{
                              width: `${columnWidths.missing_page}px`,
                              minWidth: `${columnWidths.missing_page}px`,
                              position: 'relative',
                            }}
                          >
                            <div className='z-[9999] flex' onMouseDown={(e) => handleMouseDown(e, 'missing_page')}>
                              <button onClick={() => handleHeaderSort('missing_page')} className='ml-1'>
                                {sortColumn === 'missing_page' ? (
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
                                column='누락여부'
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

                      <tbody {...provided.droppableProps} ref={provided.innerRef} className='overflow-y-auto'>
                        {isProcessing ? (
                          <tr className=''>
                            <td colSpan={11} className='h-[300px] text-center'>
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
                                        maxHeight: '64px',
                                        marginTop: '12px',
                                        marginBottom: '12px',
                                        width: dragSnapshot.isDragging ? '100%' : 'auto',
                                        display: dragSnapshot.isDragging ? 'table' : 'table-row',
                                        tableLayout: dragSnapshot.isDragging ? 'fixed' : 'auto',
                                      }}
                                      className={cn(
                                        'group text-[#202124] lg:text-[14px]',
                                        selectedItems.includes(item.evidence_id) ? 'bg-[#EFFBFF]' : index % 2 === 1 ? 'bg-[#F8F9F9]' : '',
                                      )}
                                    >
                                      {/*  <tr key={index} className='h-[75px] text-[#202124] lg:text-[14px]'> */}
                                      <td className='relative py-3 text-center lg:min-w-[80px] lg:max-w-[80px]'>
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
                                          <div className='absolute left-[15px] top-[50%] -translate-y-1/2'>
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
                                        className={`w-[5%] truncate py-3 text-[#B3B3B3] ${getFontSizeClass(14, fontSizeAdjustment)}`}
                                        style={{ fontSize: `${getAdjustedSize(14)}px` }}
                                      >
                                        {item.evidence_number}
                                      </td>
                                      <td
                                        className='w-[10%] py-3'
                                        {...(item.evidence_title && {
                                          'data-tooltip-id': 'tooltip',
                                          'data-tooltip-content': item.evidence_title,
                                        })}
                                      >
                                        <div
                                          id=''
                                          className={`font-bold text-[#212121] ${getFontSizeClass(14, fontSizeAdjustment)}`}
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
                                        onMouseEnter={(e) => {
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
                                          {item.summary_text}
                                        </div>

                                        {/* 요약 호버 시 나타나는 팝업 */}
                                        {hoveredSummaryId === item.evidence_id &&
                                          item.summary_text &&
                                          ReactDOM.createPortal(
                                            <div
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
                                                    onClick={() => handleSummaryCopy(item.summary_text || '')}
                                                    className='text-gray-600 hover:text-[#5b5b5b]'
                                                    title='복사'
                                                  >
                                                    <BsCopy className='text-[15px]' />
                                                  </button>
                                                  <button
                                                    onClick={() =>
                                                      openSummaryInNewWindow(
                                                        item.summary_text || '',
                                                        String(item.evidence_number) || '',
                                                        item.evidence_title || '',
                                                        item.evidence_id || '',
                                                      )
                                                    }
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
                                          )}
                                      </td>
                                      <td
                                        className={`w-[8%] py-3 pl-6 2xl:pl-4 text-[#212121]${getFontSizeClass(12, fontSizeAdjustment)}`}
                                        style={{ fontSize: `${getAdjustedSize(12)}px` }}
                                      >
                                        {item.name}
                                      </td>
                                      <td
                                        {...(item.reference && {
                                          'data-tooltip-id': 'tooltip',
                                          'data-tooltip-content': item.reference,
                                        })}
                                        className={`w-[8%] py-3 pl-2 pr-3 text-[#212121] 2xl:pl-0 ${getFontSizeClass(12, fontSizeAdjustment)}`}
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
                                        className={`w-[10%] py-3 pl-2 text-[#212121] ${getFontSizeClass(12, fontSizeAdjustment)}`}
                                        style={{ fontSize: `${getAdjustedSize(12)}px` }}
                                      >
                                        <p className='max-w-[120px] truncate'>{item.category}</p>
                                      </td>

                                      <td className='w-[5%] py-3'>
                                        {item.bookmarks?.length > 0 ? (
                                          // 북마크가 true인 경우
                                          <div
                                            onClick={(e) => {
                                              e.stopPropagation();
                                              handleSaveBookmark(item.evidence_id);
                                            }}
                                            className='cursor-pointer'
                                          >
                                            <img src={Bookmark} alt='북마크 있음' className='h-[20px] w-[20px] cursor-pointer' />
                                          </div>
                                        ) : (
                                          <div
                                            onClick={(e) => {
                                              e.stopPropagation();
                                              handleSaveBookmark(item.evidence_id);
                                            }}
                                            className='cursor-pointer'
                                          >
                                            <img src={BookmarkNone} alt='북마크 없음' className='h-[20px] w-[20px] cursor-pointer' />
                                          </div>
                                        )}
                                      </td>

                                      {/* 메모입력 */}
                                      <td className='memo-cell group/memo relative w-[15%] overflow-visible py-3'>
                                        {item.memos?.length > 0 && (
                                          <div className='group relative'>
                                            <div
                                              className='flex'
                                              onClick={(e) => {
                                                e.stopPropagation();
                                                const rect = e.currentTarget.getBoundingClientRect();
                                                setMemoPosition({
                                                  top: rect.bottom,
                                                  left: rect.left,
                                                });
                                                if (item.memos?.length > 0) {
                                                  setFixedMemoId(item.evidence_id);
                                                } else {
                                                  setWritingMemoId(item.evidence_id);
                                                  setHoveredMemoId(null);
                                                }
                                              }}
                                              onMouseEnter={(e) => {
                                                if (isEditing) return;
                                                const rect = e.currentTarget.getBoundingClientRect();
                                                setMemoPosition({
                                                  top: rect.bottom,
                                                  left: rect.left,
                                                });
                                                setHoveredMemoId(item.evidence_id);
                                              }}
                                              onMouseLeave={() => {
                                                if (!fixedMemoId) {
                                                  setHoveredMemoId(null);
                                                }
                                              }}
                                            >
                                              {item.memos[0]?.thumbnail_url ? (
                                                <div className='relative min-w-[30px] max-w-[50px] rounded-full'>
                                                  <img
                                                    src={item.memos[0]?.thumbnail_url}
                                                    alt='profile'
                                                    className='h-[24px] w-[24px] rounded-full'
                                                  />
                                                  <div
                                                    className='absolute top-0 h-[24px] w-[24px] rounded-full border-2'
                                                    style={{
                                                      borderColor: getUserColor(item.memos[0]?.user_color || ''),
                                                    }}
                                                  />
                                                </div>
                                              ) : (
                                                <div
                                                  className='flex h-[24px] w-[24px] shrink-0 items-center justify-center rounded-full text-sm text-white'
                                                  style={{
                                                    backgroundColor: getUserColor(item.memos[0]?.user_color || ''),
                                                  }}
                                                >
                                                  {item.memos[0]?.nickname
                                                    ? item.memos[0]?.nickname?.charAt(0)
                                                    : item.memos[0]?.user_nm?.slice(1, 2) || ''}
                                                </div>
                                              )}
                                              <div
                                                className={`pl-1 text-[#212121]${getFontSizeClass(12, fontSizeAdjustment)}`}
                                                style={{
                                                  fontSize: `${getAdjustedSize(12)}px`,
                                                }}
                                              >
                                                {item.memos[0]?.content || ''}
                                              </div>
                                            </div>

                                            {/* 메모 호버 시 나타나는 모달 */}
                                            {/* !isEditing && 상태추가 필요 */}
                                            {/* 수정 모드일 때는 메모 호버 모달 안 보이게 처리 */}
                                            {(hoveredMemoId === item.evidence_id ||
                                              fixedMemoId === item.evidence_id ||
                                              isEditing?.memoId === item.memos[0]?.memo_id) &&
                                              /*  hoveredMemoId === item.evidence_id && */
                                              ReactDOM.createPortal(
                                                <div
                                                  className='memo-hover-modal memo-textarea fixed z-[9999] max-h-[150px] min-w-[360px] max-w-[360px] rounded-lg border bg-[#fff] p-3 shadow-lg'
                                                  onClick={(e) => {
                                                    e.stopPropagation();
                                                    setFixedMemoId(item.evidence_id);
                                                    setHoveredMemoId(null);
                                                  }}
                                                  onMouseEnter={() => setHoveredMemoId(item.evidence_id)}
                                                  onMouseLeave={() => {
                                                    if (!fixedMemoId) {
                                                      setHoveredMemoId(null);
                                                    }
                                                  }}
                                                  style={{
                                                    top: `${memoPosition.top}px`,
                                                    left: `${memoPosition.left}px`,
                                                  }}
                                                >
                                                  {isEditing ? (
                                                    <>
                                                      <div className='p-0'>
                                                        <textarea
                                                          className='memo-textarea w-full resize-none border-none bg-[#fff] p-[3px] text-[14px] leading-[1.2] focus:outline-none focus:ring-1 focus:ring-[#4577A4] [&::-webkit-scrollbar]:w-2'
                                                          style={{
                                                            minHeight: '70px',
                                                            // 스크롤바 공간 확보
                                                            overflowY: 'scroll',
                                                          }}
                                                          value={isEditing.content}
                                                          onChange={(e) => {
                                                            const textarea = e.target;
                                                            textarea.style.height = 'auto';
                                                            textarea.style.height = Math.min(textarea.scrollHeight, 80) + 'px'; // 4줄 높이를 픽셀로 지정
                                                            setIsEditing({ ...isEditing, content: e.target.value });
                                                          }}
                                                        />
                                                        <div className='flex justify-between'>
                                                          <div className='flex gap-1 text-[12px] text-[#1890FF]'>
                                                            <FiAlertCircle className='text-lg' />
                                                            증거당 메모 하나씩 등록할 수 있습니다. <br />
                                                            기존 메모를 수정해주세요.
                                                          </div>
                                                          <div className='flex gap-2'>
                                                            <button
                                                              className='h-[32px] w-[45px] rounded-[8px] bg-[#0050B3] text-white'
                                                              onClick={async () => {
                                                                handleSaveNote(item.evidence_id, isEditing.content, item.memos[0]?.memo_id);
                                                              }}
                                                            >
                                                              적용
                                                            </button>
                                                            <button
                                                              className='h-[32px] w-[45px] rounded-[8px] border'
                                                              onClick={(e) => {
                                                                e.stopPropagation();
                                                                setIsEditing(null);
                                                                setFixedMemoId(null);
                                                                e.currentTarget.closest('.memo-hover-modal')?.classList.add('hidden'); // 모달 숨기기
                                                              }}
                                                            >
                                                              취소
                                                            </button>
                                                          </div>
                                                        </div>
                                                      </div>
                                                    </>
                                                  ) : (
                                                    <>
                                                      <div className='flex w-full items-center'>
                                                        <div className='mr-2 flex w-[15%] 2xl:w-[13%]'>
                                                          {item.memos[0]?.thumbnail_url ? (
                                                            <div className='w-[24px]'>
                                                              <img
                                                                src={item.memos[0]?.thumbnail_url}
                                                                alt='profile'
                                                                className='h-[24px] w-[24px] rounded-full'
                                                              />
                                                            </div>
                                                          ) : (
                                                            <div
                                                              className='flex h-[24px] w-[24px] items-center justify-center rounded-full text-sm text-white'
                                                              style={{
                                                                backgroundColor: getUserColor(item.memos[0]?.user_color || ''),
                                                              }}
                                                            >
                                                              {item.memos[0]?.nickname
                                                                ? item.memos[0]?.nickname?.charAt(0)
                                                                : item.memos[0]?.user_nm?.slice(1, 2) || ''}
                                                            </div>
                                                          )}
                                                        </div>
                                                        <div className='flex w-full items-center'>
                                                          <p
                                                            className={`max-w-[120px] truncate text-[#212121] ${getFontSizeClass(14, fontSizeAdjustment)}`}
                                                            style={{ fontSize: `${getAdjustedSize(14)}px` }}
                                                          >
                                                            {item.memos[0]?.user_nm}
                                                          </p>
                                                          <p className='pl-1 pr-1 text-[12px] text-[#7d7d7d]'>|</p>
                                                          <p
                                                            className={`text-[#7d7d7d] ${getFontSizeClass(14, fontSizeAdjustment)}`}
                                                            style={{ fontSize: `${getAdjustedSize(14)}px` }}
                                                          >
                                                            {item.memos[0]?.createdAt
                                                              ? new Date(item.memos[0].createdAt)
                                                                  .toLocaleDateString('ko-KR', {
                                                                    year: 'numeric',
                                                                    month: '2-digit',
                                                                    day: '2-digit',
                                                                  })
                                                                  .replace(/\. /g, '.')
                                                                  .replace(/\.$/, '')
                                                              : ''}
                                                          </p>
                                                        </div>
                                                        <div className='flex w-full justify-end gap-3'>
                                                          <button
                                                            title='복사'
                                                            onClick={() => {
                                                              navigator.clipboard.writeText(item.memos[0]?.content || '');
                                                              onMessageToast({
                                                                message: '메모가 복사되었습니다.',
                                                              });
                                                            }}
                                                          >
                                                            <BsCopy className='text-lg text-[#5b5b5b]' />
                                                          </button>
                                                          <button
                                                            title='수정'
                                                            onClick={() => {
                                                              const memoId = item.memos[0]?.memo_id;
                                                              const content = item.memos[0]?.content;
                                                              if (memoId && content) {
                                                                setIsEditing({
                                                                  memoId,
                                                                  content,
                                                                });
                                                              }
                                                            }}
                                                          >
                                                            <LuPencilLine className='text-lg text-[#5b5b5b]' />
                                                          </button>
                                                          <button
                                                            title='삭제'
                                                            onClick={() => {
                                                              const memoId = item.memos?.[0]?.memo_id;
                                                              if (memoId) {
                                                                openDeleteModal(memoId);
                                                              }
                                                            }}
                                                          >
                                                            <BsTrash className='text-lg text-[#5b5b5b]' />
                                                          </button>
                                                        </div>
                                                      </div>
                                                      <div
                                                        className={`memo-textarea max-h-[90px] overflow-y-scroll pt-2 leading-[1.5] text-[#212121] ${getFontSizeClass(14, fontSizeAdjustment)}`}
                                                        style={{ fontSize: `${getAdjustedSize(14)}px` }}
                                                      >
                                                        {item.memos[0]?.content}
                                                      </div>
                                                    </>
                                                  )}
                                                </div>,
                                                document.body,
                                              )}
                                          </div>
                                        )}
                                      </td>
                                      {/* 메모 작성 모달 */}
                                      {writingMemoId === item.evidence_id && (
                                        <div
                                          className='absolute right-[50px] z-10 rounded-lg border bg-white shadow-lg'
                                          onClick={(e) => e.stopPropagation()}
                                        >
                                          <div className='flex min-h-[75px] w-[400px] rounded-lg bg-white'>
                                            <div className='flex w-full items-center pl-2'>
                                              <textarea
                                                className='memo-textarea flex max-h-[100px] min-h-[50px] w-full resize-none items-center overflow-y-scroll rounded-lg border-none text-sm focus:border-none focus:outline-none focus:ring-0'
                                                value={newMemoContent}
                                                onChange={(e) => setNewMemoContent(e.target.value)}
                                                placeholder='메모를 입력하세요'
                                                autoFocus
                                              />
                                            </div>
                                            <div className='mr-2 flex items-center justify-end gap-2'>
                                              <button
                                                className={`memo-save-button ml-2 h-[32px] w-[49px] rounded-md text-white ${
                                                  newMemoContent.trim().length > 0 ? 'bg-[#0050B3]' : 'bg-[#C2C2C2]'
                                                }`}
                                                onClick={async () => {
                                                  if (!newMemoContent.trim()) return;

                                                  await onCreateEvidenceMemo({
                                                    project_id: projectId || '',
                                                    evidence_id: writingMemoId,
                                                    content: newMemoContent,
                                                  });

                                                  setWritingMemoId(null);
                                                  setHoveredMemoId(null);
                                                  setNewMemoContent('');
                                                  refetchListEvidence();
                                                  onMessageToast({
                                                    message: '메모가 성공적으로 저장되었습니다.',
                                                    icon: <IoMdSend className='h-5 w-5 text-green-500' />,
                                                  });
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
                                        </div>
                                      )}

                                      <td
                                        className={`w-[3%] py-3 text-center text-[#212121] ${getFontSizeClass(12, fontSizeAdjustment)}`}
                                        style={{ fontSize: `${getAdjustedSize(12)}px` }}
                                      >
                                        {item.start_page}
                                      </td>
                                      <td
                                        className={`w-[8%] py-3 text-center text-[#212121] ${getFontSizeClass(12, fontSizeAdjustment)}`}
                                        style={{ fontSize: `${getAdjustedSize(12)}px` }}
                                      >
                                        {item.page_count}
                                      </td>
                                      <td
                                        className={`w-[5%] py-3 text-center text-[#212121] ${getFontSizeClass(12, fontSizeAdjustment)}`}
                                        style={{ fontSize: `${getAdjustedSize(12)}px` }}
                                      >
                                        {item.has_missing_page === true ? <span className=''>Y</span> : <span className=''>-</span>}
                                      </td>
                                    </tr>

                                    {hasMatch(item) && (
                                      <tr className=''>
                                        <td
                                          colSpan={12}
                                          className={`p-2 text-[12px] text-[#888] ${index % 2 === 0 ? 'bg-[#f7f8f8]' : 'bg-[#fff]'}`}
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
                            <td colSpan={14} className='pb-6 pt-8 text-center text-gray-500'>
                              검색 결과가 없습니다.
                            </td>
                          </tr>
                        )}

                        {provided.placeholder}
                      </tbody>
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
                      onClick={handleViewPDF}
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

      <div className='fixed bottom-0 z-[50] flex h-[78px] w-full items-center justify-center bg-white shadow-inner'>
        <div id='footerBody' className='flex items-center justify-between'>
          <div className='flex truncate text-[12px]'>
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
              className='flex h-[32px] w-[101px] cursor-pointer items-center justify-center rounded-[8px] border text-[14px] text-[#252525]'
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
          <div className='ml-[16px] flex w-[135px] items-center'>
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
          <div className='ml-[16px] flex max-w-[200px] items-center'>
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
          <div
            className='ml-[8px] flex h-[40px] cursor-pointer items-center justify-center rounded-[8px] border border-[#0050B3] text-[14px] text-[#0050B3] sm:px-[5px] md:ml-[24px] md:h-[48px] md:px-[10px] md:text-[16px] 2xl:px-[15px]'
            onClick={() => setIsUploadModalOpen(true)}
          >
            <FiPlus className='mr-1 text-[16px] text-[#0050B3] md:mr-2 md:text-[18px]' />
            <span className='max-w-[100px] truncate'>신규 증거 추가</span>
          </div>
        </div>
      </div>
      {/* 페이지당 문서 개수 선택 드롭다운 */}

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
          zIndex: 9999, // 인라인 스타일로도 z-index 추가
          position: 'fixed', // 포지션을 fixed로 변경
        }}
      />
      <UploadModal
        isOpen={isUploadModalOpen}
        onClose={() => setIsUploadModalOpen(false)}
        onSuccess={handleUploadSuccess}
        projectId={projectId || ''}
      />
    </S.AllBody>
  );
};
