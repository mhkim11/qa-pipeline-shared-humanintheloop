const clumHIcon = new URL('/src/assets/images/clumH.svg', import.meta.url).href;
const clumBIcon = new URL('/src/assets/images/clumB.svg', import.meta.url).href;
const allSortIcon = new URL('/src/assets/images/allClum.svg', import.meta.url).href;
import { useState, useEffect, useMemo, useRef } from 'react';

// import { IoIosArrowDown, IoIosWarning, IoMdSend, IoIosClose } from 'react-icons/io';
import { debounce } from 'lodash-es';
// import { BsArrowDown, BsArrowUp } from 'react-icons/bs';
import { FaCheckCircle } from 'react-icons/fa';
import { FiPlus } from 'react-icons/fi';
import { IoIosWarning, IoMdCloseCircle, IoIosAdd, IoIosSearch } from 'react-icons/io';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { Tooltip } from 'react-tooltip';

import { MainHeader } from '@components/common';
import CustomSpinner from '@components/common/spiner';
import { fetchFindCase } from '@/apis/evidence-admin-api';
import { fetchChangeCaseStatus } from '@/apis/payment-api';
import { TListProjectInsideData } from '@/apis/type';
// import ListBtnHover from '@/assets/images/hoverBtn.png';
// import ListBtn from '@/assets/images/list_Btn.png';
import DropdownFilter from '@/components/evidence/filter/evidence-filter';
import { CaseClosedModal } from '@/components/evidence/modal/case-closed-modal';
import { CaseSuspendedModal } from '@/components/evidence/modal/case-suspended-modal';
import { EvidenceListUploadModal } from '@/components/evidence/modal/evidence-list-upload-modal';
import { EvidenceModifyUploadModal } from '@/components/evidence/modal/evidence-modify-upload-modal';
import { PermissionListModal } from '@/components/evidence/modal/evidence-permission-list-modal';
import { PermissionModal } from '@/components/evidence/modal/evidence-permission-modal';
import { LawyerVerificationModal } from '@/components/evidence/modal/lawyer-verification-modal';
import { PaymentModal } from '@/components/evidence/modal/payment-modal';
import { PaymentParticipationModal } from '@/components/evidence/modal/payment-participation-modal';
import { EvidencePagination } from '@/components/evidence/pagination/evidence-pagination';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { onMessageToast } from '@/components/utils';
import { useFindAllEvidenceList, useFindUserInfo, useGetPaymentSettings } from '@/hooks/react-query';
import { useCreateProjectFilter, useCreateBillingKey, useCreatePayment } from '@/hooks/react-query/mutation';

type TFilterOptions = {
  status: string[];
  project_role: string[];
  lawyers: string[];
  project_nm: string[];
  total_pages: string[];
  created_date: string[];
  client_nm: string[];
};
export const EvidenceListTable = (): JSX.Element => {
  const [searchParams, setSearchParams] = useSearchParams();

  // !페이지네이션 관련 상태
  const [isFinished, setIsFinished] = useState(false);
  const [selectedPage, setSelectedPage] = useState<number>(1);
  const [selectedSubmitPage, setSelectedSubmitPage] = useState<number>(1);
  const [itemsPerPage, setItemsPerPage] = useState<number | null>(null);
  const [selectAll, setSelectAll] = useState(false);
  // !검색조건 관련 상태
  const [searchKeyword, setSearchKeyword] = useState<string>('');
  // !필터관련
  const [filters, setFilters] = useState<Record<string, string[]>>({});
  const [filterOptions, setFilterOptions] = useState<TFilterOptions>({
    status: [],
    project_role: [],
    lawyers: [],
    project_nm: [],
    total_pages: [],
    created_date: [],
    client_nm: [],
  });
  const [sortConfig, setSortConfig] = useState<{ column: string; direction: 'asc' | 'desc' | null }>({
    column: '',
    direction: null,
  });

  const [assignedMe] = useState(true); // 항상 true로 고정

  const navigate = useNavigate();
  // 드롭다운 제어 상태
  const [openDropdown, setOpenDropdown] = useState<string | null>(null);

  // ! 탭 상태
  const [oneGoing, setOnGoing] = useState(true);
  const [closing, setClosing] = useState(false);

  // ! 권한 모달 관련 상태
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isListModalOpen, setIsListModalOpen] = useState(false);

  // ! 검색 관련 상태
  const [keyword, setKeyword] = useState<string>('');

  const [selectedItems, setSelectedItems] = useState<Array<{ project_nm: string; project_id: string; project_role: string }>>([]);
  const [lastCheckedIndex, setLastCheckedIndex] = useState<number | null>(null);
  // ! 업로드 모달 관련 상태
  const [isUploadModalOpen, setIsUploadModalOpen] = useState(false);
  const [isModifyUploadModalOpen, setIsModifyUploadModalOpen] = useState(false);
  // 변호사 인증 모달 상태
  const [isLawyerVerificationModalOpen, setIsLawyerVerificationModalOpen] = useState(false);
  const [isLawyerVerificationFromCaseClick, setIsLawyerVerificationFromCaseClick] = useState(false); // 사건 클릭으로 인한 인증인지 여부
  const [pendingCaseAfterVerification, setPendingCaseAfterVerification] = useState<any>(null); // 인증 후 처리할 사건 정보
  // 결제 모달 상태
  const [isPaymentModalOpen, setIsPaymentModalOpen] = useState(false);
  const [isPaymentProcessingModalOpen, setIsPaymentProcessingModalOpen] = useState(false); // 결제 처리 중 로딩 모달
  const [isBillingKeyCreatingModalOpen, setIsBillingKeyCreatingModalOpen] = useState(false); // 빌링키 발급 중 로딩 모달
  const [registeredProjectName, setRegisteredProjectName] = useState<string>('');
  const [registeredProjectId, setRegisteredProjectId] = useState<string>(''); // 결제할 프로젝트 ID
  const [paymentType, setPaymentType] = useState<'case_subscription' | 'case_participation'>('case_subscription');
  const [paymentAmount, setPaymentAmount] = useState<number>(19000);
  const [isInvited, setIsInvited] = useState<boolean>(false);
  const [requestId, setRequestId] = useState<string>('');

  // 결제 참여 모달 상태
  const [isPaymentParticipationModalOpen, setIsPaymentParticipationModalOpen] = useState(false);

  // 일시중지 모달 상태
  const [isCaseSuspendedModalOpen, setIsCaseSuspendedModalOpen] = useState(false);
  const [suspendedCaseInfo, setSuspendedCaseInfo] = useState<{
    project_id: string;
    project_nm: string;
    isManager: boolean;
  } | null>(null);

  // 종결된 사건 모달 상태
  const [isCaseClosedModalOpen, setIsCaseClosedModalOpen] = useState(false);
  const [closedCaseInfo, setClosedCaseInfo] = useState<{
    project_id: string;
    project_nm: string;
    isManager: boolean;
  } | null>(null);

  // 빌링키 발급 중복 호출 방지를 위한 ref
  const billingKeyCreationRef = useRef<boolean>(false);
  const [processedAuthKey, setProcessedAuthKey] = useState<string | null>(null);

  const [selectedProjectInfo, setSelectedProjectInfo] = useState<{
    project_nm: string;
    client_nm: string;
    project_id: string;
    uploadedFiles: Array<{
      file_nm: string;
      original_file_nm: string;
      file_size: number;
      page_count: number;
      extension: string;
      createdAt: string;
    }>;
  } | null>(null);

  // ! 페이지당 문서 개수 옵션 추가
  const itemsPerPageOptions = [50, 100, 150, 200];

  // ! API 호출
  // ! 유저정보 api 호출
  const { response: findEvidenceUserInfo } = useFindUserInfo();

  // 결제 설정 조회 API 호출
  const { response: paymentSettingsResponse } = useGetPaymentSettings();

  // 초기 리스트 API
  const {
    response: AllListEvidenceOutput,
    isFetching,
    refetch,
  } = useFindAllEvidenceList({
    page_no: selectedSubmitPage,
    block_cnt: itemsPerPage ? Number(itemsPerPage) : findEvidenceUserInfo?.data?.evi_display_cnt || 100,
    keyword: searchKeyword || '',
    isActive: oneGoing || closing,
    isFinish: closing || isFinished,
    sort_column: sortConfig?.column || '',
    assignedMe,
    sort_direction: sortConfig?.direction || 'asc',
    filters,
  });

  /*  console.log('filters', filters); */

  const fontSizeAdjustment = findEvidenceUserInfo?.data?.font_size_rate || 0;

  const { onCreateProjectFilter } = useCreateProjectFilter();

  // 결제 관련 API 훅들
  const { mutateAsync: createBillingKeyAsync } = useCreateBillingKey();
  const { mutate: createPayment } = useCreatePayment();

  // ! 기본 함수 모음
  const onSetSelectedPage = ({ page, onlyPage = false }: { page: number; onlyPage?: boolean }) => {
    setSelectedPage(page);
    if (!onlyPage) {
      setSelectedSubmitPage(page);
    }
  };

  // 동적 폰트 크기 조정
  const getAdjustedSize = (baseSize: number) => {
    return baseSize * (1 + fontSizeAdjustment / 100);
  };

  const getCaseTypeLabel = (evidence: any): '형사' | '민사' => {
    const raw = String(evidence?.case_type ?? '').toLowerCase();
    const hasCivilId = !!(evidence?.civil_case_id || evidence?.civilCaseId || evidence?.civilCaseID);
    return raw === 'civil' || hasCivilId ? '민사' : '형사';
  };

  // 폰트 크기 조정 옵션
  const fontSizeClasses = {
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

  const evidenceList = useMemo(() => {
    return AllListEvidenceOutput?.data.projects || [];
  }, [AllListEvidenceOutput?.data.projects]);

  const paging = useMemo(() => {
    return AllListEvidenceOutput?.data.paging || { total_page: 1 };
  }, [AllListEvidenceOutput?.data.paging]);

  const hasLoadedData = !!AllListEvidenceOutput?.data;

  // ! 페이지네이션 함수
  const handlePageMove = (page: number) => {
    if (page < 1 || page > paging.total_page) {
      onMessageToast({
        message: `1 ~ ${paging.total_page} 사이의 숫자를 입력해주세요.`,
        icon: <IoIosWarning className='h-5 w-5 text-yellow-500' />,
      });
      return;
    }
    onSetSelectedPage({ page });
  };

  const clearSearch = () => {
    setKeyword('');
    setSearchKeyword('');
    refetch();
  };
  // ! 모달열기
  /*  const handlePermissionRequest = () => {
    if (selectedItems.length === 0) {
      // 선택된 항목이 없을 때 에러 메시지 표시
      onMessageToast({
        message: '항목을 선택해주세요.',
        icon: <IoIosWarning className='h-5 w-5 text-yellow-500' />,
      });
      return;
    }

    // 선택된 항목 중 "생성중" 상태인 항목 확인
    const creatingItems = evidenceList.filter(
      (evidence) => selectedItems.some((item) => item.project_id === evidence.project_id) && evidence.status === '생성중',
    );

    if (creatingItems.length > 0) {
      onMessageToast({
        message: '생성 중인 사건은 권한 요청을 할 수 없습니다.',
        icon: <IoIosWarning className='h-5 w-5 text-yellow-500' />,
      });
      return;
    }

    // 선택된 항목 중 내가 이미 '슈퍼권한'인 항목 필터링
    const alreadySuperRoleItems = selectedItems.filter((item) => item.project_role === '사건관리자권한');
    if (alreadySuperRoleItems.length > 0) {
      // 슈퍼권한을 가진 항목이 있는 경우
      if (alreadySuperRoleItems.length >= 3 || selectedItems.length >= 3) {
        // 3개 이상 선택했거나 슈퍼권한 항목이 3개 이상인 경우
        onMessageToast({
          message: `일부 항목은 이미 사건관리자권한을 보유하고 있습니다. 권한을 확인해주세요.`,
          icon: <IoIosWarning className='h-5 w-5 text-yellow-500' />,
        });
      } else {
        // 2개 이하인 경우 기존처럼 항목명 표시
        onMessageToast({
          message: `${alreadySuperRoleItems.map((item) => item.project_nm).join(', ')}는 이미 사건관리자권한을 보유하고 있습니다`,
          icon: <IoIosWarning className='h-5 w-5 text-yellow-500' />,
        });
      }
      return;
    }
    setIsModalOpen(true);
  }; */
  const handleSelectAll = (e: React.ChangeEvent<HTMLInputElement>) => {
    const isChecked = e.target.checked;
    setSelectAll(isChecked);

    if (isChecked) {
      // 모든 항목 선택
      const allItems = evidenceList.map((evidence) => ({
        project_nm: evidence.project_nm,
        project_id: evidence.project_id,
        project_role: evidence.project_role,
      }));
      setSelectedItems(allItems);
    } else {
      // 모든 항목 선택 해제
      setSelectedItems([]);
    }
  };

  // 날짜형식 변경
  const formatDate = (dateString: string) => {
    if (!dateString) return '';

    try {
      const date = new Date(dateString);
      if (isNaN(date.getTime())) return dateString; // 유효하지 않은 날짜인 경우 원본 반환

      const year = date.getFullYear();
      // 월과 일은 항상 두 자리로 표시 (01, 02, ...)
      const month = String(date.getMonth() + 1).padStart(2, '0');
      const day = String(date.getDate()).padStart(2, '0');

      return `${year}.${month}.${day}`;
    } catch (error) {
      console.error('Date formatting error:', error);
      return dateString; // 에러 발생 시 원본 반환
    }
  };

  // 필터관련
  const handleFilter = (column: string, values: string[]) => {
    setFilters((prev) => {
      const newFilters = { ...prev, [column]: values };

      // 필터 변경 후 즉시 데이터 다시 로드 (비동기 상태 업데이트 문제 해결)
      setTimeout(() => {
        refetch(); // 즉시 API 호출
      }, 0);

      return newFilters;
    });
  };

  const filteredEvidenceList = useMemo(() => {
    // API 응답이 없으면 빈 배열 반환
    if (!evidenceList || evidenceList.length === 0) {
      return [];
    }

    const filtered = evidenceList.filter((item) => {
      // 종결 상태 확인 (일시중지는 양쪽 탭에서 모두 표시)
      const statusMatch = isFinished ? item.status === '종결' || item.status === '일시중지' : item.status !== '종결';
      if (!statusMatch) return false;

      // 필터 조건이 없으면 모든 항목 통과
      if (Object.keys(filters).length === 0) return true;

      // 필터 조건 검사
      return Object.entries(filters).every(([column, values]) => {
        // 빈 필터는 항상 true
        if (!values || values.length === 0) return true;

        const key = column as keyof TListProjectInsideData;
        const filterValues = values as string[];
        const fieldValue = item[key];

        // status 필드 특별 처리 (결제대기 상태 포함)
        if (key === 'status') {
          return filterValues.some((filterValue) => {
            if (filterValue === '결제대기') {
              // 결제대기 필터인 경우: payment_status가 completed나 trial이 아닌 경우
              return item.payment_status !== 'completed' && item.payment_status !== 'trial';
            } else {
              // 일반 상태 필터인 경우: 실제 status와 비교
              return fieldValue === filterValue;
            }
          });
        }

        // lawyers 필드 특별 처리 (문자열로 제공됨)
        if (key === 'lawyers') {
          if (fieldValue === undefined || fieldValue === null || fieldValue === '') {
            return filterValues.includes('없음');
          }

          // 문자열 내에 필터값의 이름이 포함되어 있는지 확인
          return filterValues.some((filterValue) => {
            // '없음' 필터인 경우 특별 처리
            if (filterValue === '없음') {
              return !fieldValue || fieldValue === '-';
            }

            // 이름만 추출해서 비교 (괄호 내용 제외)
            const nameOnly = String(fieldValue).split('(')[0].trim();
            return nameOnly === filterValue || String(fieldValue).includes(filterValue);
          });
        }
        if (key === 'total_pages') {
          // 문자열과 숫자 타입 모두 처리
          return filterValues.some((val) => String(fieldValue) === val || Number(fieldValue) === Number(val));
        }

        // 일반 필드 처리
        if (fieldValue === undefined || fieldValue === null) {
          return false;
        }

        if (typeof fieldValue === 'string') {
          return filterValues.includes(fieldValue);
        }

        if (typeof fieldValue === 'number') {
          return filterValues.includes(fieldValue.toString());
        }

        if (Array.isArray(fieldValue)) {
          return fieldValue.some((val) => filterValues.includes(String(val)));
        }

        return false;
      });
    });

    return filtered;
  }, [evidenceList, filters, isFinished]);

  type TFilterKey = keyof TFilterOptions;

  const updateFilters = () => {
    const filteredOptions: TFilterOptions = {
      status: Array.from(
        new Set([
          ...evidenceList.map((item) => item.status),
          // 결제 상태에 따른 추가 상태 옵션
          ...evidenceList.filter((item) => item.payment_status !== 'completed' && item.payment_status !== 'trial').map(() => '결제대기'),
        ]),
      ),
      project_role: Array.from(new Set(evidenceList.map((item) => item.project_role))),
      lawyers: Array.from(
        new Set(
          evidenceList
            .map((item) => {
              // 문자열에서 이름만 추출 (괄호 앞 부분)
              if (typeof item.lawyers === 'string' && item.lawyers) {
                // 여러 이름이 쉼표로 구분된 경우 처리
                if (item.lawyers.includes(',')) {
                  return item.lawyers.split(',').map((name) => name.split('(')[0].trim());
                }
                return item.lawyers.split('(')[0].trim();
              }
              return item.lawyers ? String(item.lawyers) : '없음';
            })
            .flat(),
        ),
      ),
      project_nm: Array.from(new Set(evidenceList.map((item) => item.project_nm))),
      total_pages: Array.from(new Set(evidenceList.map((item) => item.total_pages.toString()))),
      created_date: Array.from(new Set(evidenceList.map((item) => formatDate(item.createdAt)))),
      client_nm: Array.from(new Set(evidenceList.map((item) => item.client_nm))),
    };

    setFilterOptions(filteredOptions);
  };
  // 디바운스된 검색 함수 정의
  const debouncedSearch = useMemo(
    () =>
      debounce((value: string) => {
        setSearchKeyword(value);
      }, 500), // 500ms 후 실행
    [],
  );
  const handleCheckboxChange = (e: React.ChangeEvent<HTMLInputElement>, index: number, evidence: any) => {
    const isChecked = e.target.checked;

    if ((e.nativeEvent as MouseEvent).shiftKey && lastCheckedIndex !== null && lastCheckedIndex !== index) {
      const startIndex = Math.min(lastCheckedIndex, index);
      const endIndex = Math.max(lastCheckedIndex, index);

      const newItems = [...selectedItems];
      for (let i = startIndex; i <= endIndex; i++) {
        if (i < evidenceList.length) {
          const item = evidenceList[i];
          if (!newItems.some((selected) => selected.project_id === item.project_id)) {
            newItems.push({
              project_nm: item.project_nm,
              project_id: item.project_id,
              project_role: item.project_role,
            });
          }
        }
      }
      setSelectedItems(newItems);
    } else {
      // Regular checkbox handling
      setSelectedItems((prev) =>
        isChecked
          ? [...prev, { project_nm: evidence.project_nm, project_id: evidence.project_id, project_role: evidence.project_role }]
          : prev.filter((item) => item.project_id !== evidence.project_id),
      );
    }

    setLastCheckedIndex(index);
  };
  // 검색 입력 핸들러
  const handleSearch = (e: React.ChangeEvent<HTMLInputElement> | React.KeyboardEvent<HTMLInputElement>) => {
    const value = (e.target as HTMLInputElement).value;
    setKeyword(value); // 입력값 업데이트
    debouncedSearch(value); // 디바운스된 함수 호출

    if ('key' in e && e.key === 'Enter') {
      setSearchKeyword(value); // 즉시 검색 실행
    }
  };

  const handleDropdownToggle = async (key: TFilterKey) => {
    if (openDropdown === key) {
      setOpenDropdown(null);
    } else {
      try {
        const response = await onCreateProjectFilter({
          keyword: searchKeyword || '',
          filters: {
            key: [key],
            value: [],
          },
          assignedMe, // assignedMe 상태 포함
        });

        if (response?.data) {
          setFilterOptions((prev) => ({
            ...prev,
            [key]: response.data[key] || [],
          }));
        }
      } catch (error) {
        console.error(`필터 데이터를 가져오는 중 오류 발생 (${key}):`, error);
      }

      setOpenDropdown(key);
    }
  };
  const handleSort = (column: string) => {
    if (sortConfig.column === column) {
      // 현재 정렬된 컬럼을 다시 클릭한 경우
      if (sortConfig.direction === 'asc') {
        // 1. 오름차순 -> 내림차순
        setSortConfig({ column, direction: 'desc' });
      } else if (sortConfig.direction === 'desc') {
        // 2. 내림차순 -> 정렬 초기화
        setSortConfig({ column: '', direction: null });
      } else {
        // 3. 정렬 방향이 없는 상태(null)에서 -> 오름차순
        setSortConfig({ column, direction: 'asc' });
      }
    } else {
      // 다른 컬럼을 처음 클릭한 경우: 해당 컬럼으로 오름차순 정렬
      setSortConfig({ column, direction: 'asc' });
    }
    setTimeout(() => {
      refetch();
    }, 0);
  };

  const resetAllTabs = () => {
    setOnGoing(false);
    setClosing(false);
    setIsFinished(false);
  };
  const handleTabClick = (tabSetter: any, isFinishedTab = false) => {
    resetAllTabs();
    tabSetter(true);
    setIsFinished(isFinishedTab);
    onSetSelectedPage({ page: 1 });
    // setAssignedMe(true) 제거
    setTimeout(() => {
      refetch();
    }, 0);
  };

  // 결제 설정 확인 헬퍼 함수: 무료 상태이면 true 반환
  const isFreePaymentActive = useMemo(() => {
    if (!paymentSettingsResponse?.data?.free_payment_enabled) {
      return false;
    }
    // free_payment_enabled=true 이면 종료일이 비어있어도 무료로 간주 (무기한 무료)
    const endDate = paymentSettingsResponse.data.free_payment_end_date;
    if (!endDate || endDate.trim() === '') {
      return true;
    }
    try {
      // YYYYMMDD 형식인 경우
      let dateToCheck: Date;
      if (/^\d{8}$/.test(endDate)) {
        const year = parseInt(endDate.substring(0, 4), 10);
        const month = parseInt(endDate.substring(4, 6), 10) - 1;
        const day = parseInt(endDate.substring(6, 8), 10);
        dateToCheck = new Date(year, month, day);
      } else {
        // ISO 형식인 경우
        dateToCheck = new Date(endDate);
      }

      const today = new Date();
      today.setHours(0, 0, 0, 0);
      dateToCheck.setHours(0, 0, 0, 0);

      // 종료일이 오늘 날짜를 지나지 않았으면 무료 상태
      return dateToCheck >= today;
    } catch (error) {
      console.error('날짜 파싱 실패:', error);
      // 종료일 파싱 실패 시에도 free_payment_enabled=true면 무료로 간주
      return true;
    }
  }, [paymentSettingsResponse]);

  const handleUploadSuccess = (projectName?: string, projectId?: string) => {
    refetch(); // API 재호출하여 리스트 새로고침
    setIsUploadModalOpen(false); // 모달 닫기

    // 무료 상태이면 결제 모달 열지 않음
    if (isFreePaymentActive) {
      return;
    }

    // 사건명과 프로젝트 ID가 전달되면 결제 모달 열기
    if (projectName && projectId) {
      setRegisteredProjectName(projectName);
      setRegisteredProjectId(projectId); // 프로젝트 ID 저장
      // 신규 사건 등록 시에는 사건관리자권한으로 19,000원 결제
      setPaymentType('case_subscription');
      setPaymentAmount(19000);
      setIsInvited(false); // 신규 사건 등록이므로 초대 아님
      setRequestId(''); // 신규 사건 등록이므로 requestId 없음
      setIsPaymentModalOpen(true);
    }
  };

  // 결제 모달 열기 함수 (권한에 따라 결제 타입과 금액 설정)
  const openPaymentModal = (evidence: any) => {
    // 무료 상태이면 결제 모달 열지 않음
    if (isFreePaymentActive) {
      return;
    }

    // 사건 관리자가 아닌 경우 payment_status가 completed가 아니면 결제 막기
    if (evidence.project_role !== '사건관리자권한' && evidence.payment_status !== 'completed') {
      onMessageToast({
        message: '사건 관리자의 결제가 완료된 후 참여할 수 있습니다.',
        icon: <IoIosWarning className='h-5 w-5 text-yellow-500' />,
      });
      return;
    }

    setRegisteredProjectName(evidence.project_nm);
    setRegisteredProjectId(evidence.project_id);

    // 사용자 권한에 따라 결제 타입과 금액 설정
    if (evidence.project_role === '사건관리자권한') {
      setPaymentType('case_subscription');
      setPaymentAmount(19000);
    } else {
      setPaymentType('case_participation');
      setPaymentAmount(19000);
    }

    // is_invited 상태 설정
    setIsInvited(evidence.is_invited === true);

    // request_id 설정
    setRequestId(evidence.request_id || '');

    setIsPaymentModalOpen(true);
  };

  const handleModifyUploadModalClose = () => {
    setIsModifyUploadModalOpen(false);
    setSelectedProjectInfo(null);
  };

  const handleModifyUploadModalOpen = (project_nm: string, client_nm: string, project_id: string, uploadedFiles: any[]) => {
    setSelectedProjectInfo({ project_nm, client_nm, project_id, uploadedFiles });
    setIsModifyUploadModalOpen(true);
  };

  const handleModifyUploadSuccess = () => {
    setIsModifyUploadModalOpen(false);
    setSelectedProjectInfo(null);
    refetch(); // 리스트 새로고침
  };

  // 일시중지 상태 처리 함수
  const handleSuspendedCaseClick = (evidence: any) => {
    const isManager = evidence.project_role === '사건관리자권한';
    setSuspendedCaseInfo({
      project_id: evidence.project_id,
      project_nm: evidence.project_nm,
      isManager,
    });
    setIsCaseSuspendedModalOpen(true);
  };

  // 일시중지 모달에서 진행중으로 변경
  const handleStatusChangeToProgress = async () => {
    if (suspendedCaseInfo) {
      try {
        // 사건 조회하여 payment_status 확인
        const projectData = await fetchFindCase(suspendedCaseInfo.project_id);
        const paymentStatus = (projectData.data as any)?.payment_status;
        const expireDate = (projectData.data as any)?.expire_date;
        // payment_status가 'trial'인 경우 결제 모달 없이 바로 상태 변경
        if (paymentStatus === 'trial' && expireDate) {
          const response = await fetchChangeCaseStatus({
            project_id: suspendedCaseInfo.project_id,
            status: '진행중',
          });

          if (response.success) {
            onMessageToast({ message: '사건 상태가 "진행중"으로 변경되었습니다.' });
            setIsCaseSuspendedModalOpen(false);
            setSuspendedCaseInfo(null);
            refetch(); // 리스트 새로고침
          } else {
            onMessageToast({ message: '사건 상태 변경에 실패했습니다.' });
          }
          return;
        }

        // trial이 아닌 경우 기존처럼 결제 참여 모달 열기
        setRegisteredProjectName(suspendedCaseInfo.project_nm);
        setRegisteredProjectId(suspendedCaseInfo.project_id);
        setIsPaymentParticipationModalOpen(true);
        setIsCaseSuspendedModalOpen(false);
        // 상태 변경을 위해 suspendedCaseInfo는 나중에 사용할 수 있도록 유지
        // setSuspendedCaseInfo(null); // 나중에 사용하기 위해 주석 처리
      } catch (error) {
        console.error('사건 조회 실패:', error);
        // 에러 발생 시 기존 로직대로 결제 모달 열기
        setRegisteredProjectName(suspendedCaseInfo.project_nm);
        setRegisteredProjectId(suspendedCaseInfo.project_id);
        setIsPaymentParticipationModalOpen(true);
        setIsCaseSuspendedModalOpen(false);
      }
    }
  };

  // 사건상세정보 보기
  const handleCaseDetailView = () => {
    if (suspendedCaseInfo) {
      // evidence-payment-table.tsx로 이동하여 case-detail-modal 열기
      navigate(`/payment?tab=case-list&caseId=${suspendedCaseInfo.project_id}`);
      setIsCaseSuspendedModalOpen(false);
      setSuspendedCaseInfo(null);
    }
  };

  // 종결된 사건 상태 처리 함수
  const handleClosedCaseClick = (evidence: any) => {
    const isManager = evidence.project_role === '사건관리자권한';
    setClosedCaseInfo({
      project_id: evidence.project_id,
      project_nm: evidence.project_nm,
      isManager,
    });
    setIsCaseClosedModalOpen(true);
  };

  // 종결된 사건 모달에서 진행중으로 변경
  const handleClosedStatusChangeToProgress = async () => {
    if (closedCaseInfo) {
      try {
        // 사건 조회하여 payment_status 확인
        const projectData = await fetchFindCase(closedCaseInfo.project_id);
        const paymentStatus = (projectData.data as any)?.payment_status;
        const expireDate = (projectData.data as any)?.expire_date;

        // payment_status가 'trial'이고 expire_date가 오늘 날짜로부터 지나지 않았으면 결제 모달 없이 바로 상태 변경
        let shouldSkipPayment = false;

        // 무료(trial)이고 expire_date가 오늘 이후이거나 오늘인 경우에만 결제 모달 없이 상태 변경
        if (paymentStatus === 'trial' && expireDate) {
          const today = new Date();
          today.setHours(0, 0, 0, 0); // 오늘 날짜의 시작 시간
          const expire = new Date(expireDate);
          expire.setHours(0, 0, 0, 0);

          // expire_date가 오늘 날짜로부터 지나지 않았으면 (오늘 이후이거나 오늘인 경우)
          if (expire >= today) {
            shouldSkipPayment = true;
          }
        }

        if (shouldSkipPayment) {
          const response = await fetchChangeCaseStatus({
            project_id: closedCaseInfo.project_id,
            status: '진행중',
          });

          if (response.success) {
            onMessageToast({ message: '사건 상태가 "진행중"으로 변경되었습니다.' });
            setIsCaseClosedModalOpen(false);
            setClosedCaseInfo(null);
            refetch(); // 리스트 새로고침
          } else {
            onMessageToast({ message: '사건 상태 변경에 실패했습니다.' });
          }
          return;
        }

        // trial이 아니거나 expire_date가 오늘 이전인 경우 기존처럼 결제 참여 모달 열기
        setRegisteredProjectName(closedCaseInfo.project_nm);
        setRegisteredProjectId(closedCaseInfo.project_id);
        setIsPaymentParticipationModalOpen(true);
        setIsCaseClosedModalOpen(false);
        // 상태 변경을 위해 closedCaseInfo는 나중에 사용할 수 있도록 유지
        // setClosedCaseInfo(null); // 나중에 사용하기 위해 주석 처리
      } catch (error) {
        console.error('사건 조회 실패:', error);
        // 에러 발생 시 기존 로직대로 결제 모달 열기
        setRegisteredProjectName(closedCaseInfo.project_nm);
        setRegisteredProjectId(closedCaseInfo.project_id);
        setIsPaymentParticipationModalOpen(true);
        setIsCaseClosedModalOpen(false);
      }
    }
  };

  // 종결된 사건 상세정보 보기
  const handleClosedCaseDetailView = () => {
    if (closedCaseInfo) {
      // evidence-payment-table.tsx로 이동하여 case-detail-modal 열기
      navigate(`/payment?tab=case-list&caseId=${closedCaseInfo.project_id}`);
      setIsCaseClosedModalOpen(false);
      setClosedCaseInfo(null);
    }
  };

  // 결제 참여 모달 성공 핸들러
  const handlePaymentParticipationSuccess = async () => {
    // 결제 성공 시 상태를 "진행중"으로 변경
    if (registeredProjectId) {
      try {
        const response = await fetchChangeCaseStatus({
          project_id: registeredProjectId,
          status: '진행중',
        });

        if (response.success) {
          onMessageToast({ message: '사건 상태가 "진행중"으로 변경되었습니다.' });
        } else {
          onMessageToast({ message: '사건 상태 변경에 실패했습니다.' });
        }
      } catch (error) {
        console.error('사건 상태 변경 중 오류 발생:', error);
        onMessageToast({ message: '사건 상태 변경 중 오류가 발생했습니다.' });
      }
    }

    setIsPaymentParticipationModalOpen(false);
    // 일시중지/종결된 사건 정보 초기화
    setSuspendedCaseInfo(null);
    setClosedCaseInfo(null);
    // 성공 모달 대신 토스트 메시지만 표시하므로 setIsPaymentSuccessModalOpen(true) 제거
    refetch(); // 리스트 새로고침
  };

  // 신규사건등록 버튼 클릭 핸들러
  const handleNewCaseRegistration = () => {
    // 업로드 모달 열기
    setIsUploadModalOpen(true);
  };

  useEffect(() => {
    if (evidenceList.length > 0) {
      updateFilters(); // 검색된 리스트에서 필터 값 추출
    }
  }, [evidenceList]); // eslint-disable-line

  useEffect(() => {
    return () => {
      debouncedSearch.cancel(); // cleanup
    };
  }, [debouncedSearch]);

  // ! 결제관련
  // 빌링키로 결제 처리 함수
  const handlePaymentWithBillingKey = (billingKey: string, customerKey: string) => {
    const projectName = searchParams.get('projectName');
    const projectId = searchParams.get('projectId');
    const planId = searchParams.get('planId');
    const paymentTypeParam = searchParams.get('paymentType');
    const payerName = searchParams.get('payerName');
    const payerEmail = searchParams.get('payerEmail');
    const urlUserId = searchParams.get('userId');

    const effectivePaymentType: 'case_subscription' | 'case_participation' =
      paymentTypeParam === 'case_participation' ? 'case_participation' : 'case_subscription';

    // plan_id / amount는 payment_type 기준으로 고정 매핑
    const effectivePlanId =
      planId || (effectivePaymentType === 'case_subscription' ? 'plan_01K5B9Y83AKY5XX8Z78D7HSC73' : 'plan_01K7GPCHPZXX4CZM6TTRYAA2CW');
    const effectiveAmount = 19000;

    // 결제 처리 중 모달 표시
    setIsPaymentProcessingModalOpen(true);

    // 결제 및 구독 생성
    const paymentData = {
      user_id: urlUserId || findEvidenceUserInfo?.data?.user_id || '',
      billingKey: billingKey,
      customerKey,
      orderId: `order_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      amount: effectiveAmount,
      email: '',
      orderName: projectName || '사건명',
      payment_type: effectivePaymentType,
      payer_name: payerName || findEvidenceUserInfo?.data?.name || '',
      payer_email: payerEmail || findEvidenceUserInfo?.data?.email || '',
      project_nm: projectName || '',
      project_id: projectId || registeredProjectId || '',
      plan_id: effectivePlanId,
      subscription_id: '',
      metadata: {},
    };

    createPayment(paymentData, {
      onSuccess: (paymentResponse) => {
        console.log('결제 및 구독 생성 성공:', paymentResponse);

        // 로딩 모달 닫기
        setIsPaymentProcessingModalOpen(false);

        // 성공 모달 표시
        setRegisteredProjectName(projectName || '');
      },
      onError: (error) => {
        console.error('결제 및 구독 생성 실패:', error);

        // 로딩 모달 닫기
        setIsPaymentProcessingModalOpen(false);

        onMessageToast({
          message: '결제 처리 중 오류가 발생했습니다.',
          icon: <IoIosWarning className='h-5 w-5 text-yellow-500' />,
        });
      },
    });
  };

  // 빌링키 발급 함수
  const handleBillingKeyCreation = async () => {
    const customerKey = searchParams.get('customerKey');
    const authKey = searchParams.get('authKey');

    if (!customerKey || !authKey) return;

    // useRef를 사용한 중복 호출 방지
    if (billingKeyCreationRef.current) {
      console.log('빌링키 생성 중, 중복 호출 방지');
      return;
    }

    // 이미 처리된 authKey인지 확인
    if (processedAuthKey === authKey) {
      console.log('이미 처리된 authKey:', authKey, '중복 호출 방지');
      return;
    }

    // 처리 중 플래그 설정
    billingKeyCreationRef.current = true;
    setProcessedAuthKey(authKey);
    setIsBillingKeyCreatingModalOpen(true);

    console.log('빌링키 발급 시작:', { customerKey, authKey });
    console.log('createBillingKey API 호출 시작');

    try {
      // mutateAsync를 사용하여 직접 응답 처리
      const billingResponse = await createBillingKeyAsync({ customerKey, authKey });

      console.log('=== 빌링키 생성 API 성공 ===');
      console.log('빌링키 생성 성공 - 전체 응답:', billingResponse);

      // 즉시 플래그 리셋하여 중복 호출 방지
      billingKeyCreationRef.current = false;
      setProcessedAuthKey(null);

      if (billingResponse.success && billingResponse.data?.billingKey) {
        console.log('빌링키 생성 성공 - 성공 처리 시작');

        // 빌링키 발급 중 모달 닫기
        setIsBillingKeyCreatingModalOpen(false);

        // 빌링키 발급 성공 후 결제 처리 호출
        handlePaymentWithBillingKey(billingResponse.data.billingKey, customerKey);
      } else {
        console.error('빌링키 생성 실패:', billingResponse.message);

        // 빌링키 발급 중 모달 닫기
        setIsBillingKeyCreatingModalOpen(false);

        onMessageToast({
          message: `빌링키 생성에 실패했습니다: ${billingResponse.message || '알 수 없는 오류'}`,
          icon: <IoIosWarning className='h-5 w-5 text-yellow-500' />,
        });
      }
    } catch (error: any) {
      console.log('=== 빌링키 생성 API 에러 ===');
      console.error('빌링키 생성 실패:', error);

      // 실패 시 플래그 리셋
      billingKeyCreationRef.current = false;
      setProcessedAuthKey(null);

      // 빌링키 발급 중 모달 닫기
      setIsBillingKeyCreatingModalOpen(false);

      onMessageToast({
        message: `빌링키 생성에 실패했습니다: ${error?.response?.data?.message || error?.message || '알 수 없는 오류'}`,
        icon: <IoIosWarning className='h-5 w-5 text-yellow-500' />,
      });
    }
  };

  // 결제 성공 시 URL 파라미터로 처리
  useEffect(() => {
    const paymentStatus = searchParams.get('payment');
    const customerKey = searchParams.get('customerKey');
    const authKey = searchParams.get('authKey');
    const isBillCreate = searchParams.get('isBillCreate');

    console.log('useEffect 실행:', { paymentStatus, customerKey, authKey, processedAuthKey, isBillingKeyCreatingModalOpen });

    // authKey가 있고, 아직 처리되지 않은 authKey인 경우에만 처리
    if (
      paymentStatus === 'success' &&
      customerKey &&
      authKey &&
      isBillCreate === 'true' &&
      processedAuthKey !== authKey &&
      !billingKeyCreationRef.current
    ) {
      // URL 파라미터 제거
      const newSearchParams = new URLSearchParams(window.location.search);
      newSearchParams.delete('payment');
      newSearchParams.delete('projectName');
      newSearchParams.delete('projectId');
      newSearchParams.delete('planId');
      newSearchParams.delete('customerKey');
      newSearchParams.delete('authKey');
      newSearchParams.delete('payerName');
      newSearchParams.delete('payerEmail');
      newSearchParams.delete('userId');
      newSearchParams.delete('isBillCreate');
      setSearchParams(newSearchParams);

      // 새 빌링키 발급 후 결제 처리
      console.log('새 빌링키 발급 후 결제 처리:', { customerKey, authKey });
      handleBillingKeyCreation();
    }

    // URL 파라미터가 없어지면 로딩 모달 강제로 닫기
    if (!paymentStatus && !customerKey && !authKey && isBillingKeyCreatingModalOpen) {
      console.log('URL 파라미터 제거됨, 로딩 모달 강제 닫기');
      setIsBillingKeyCreatingModalOpen(false);
      billingKeyCreationRef.current = false;
      setProcessedAuthKey(null);
    }
  }, [searchParams, processedAuthKey, isBillingKeyCreatingModalOpen]); // eslint-disable-line

  // URL 파라미터로 업로드 모달 열기
  useEffect(() => {
    const openUploadModal = searchParams.get('openUploadModal');
    if (openUploadModal === 'true') {
      // 업로드 모달 열기
      setIsUploadModalOpen(true);

      // URL에서 파라미터 제거
      const newSearchParams = new URLSearchParams(searchParams);
      newSearchParams.delete('openUploadModal');
      setSearchParams(newSearchParams);
    }
  }, [searchParams, setSearchParams]);

  useEffect(() => {
    if (Object.keys(filters).length > 0) {
      refetch();
    }
  }, [filters]); // eslint-disable-line
  useEffect(() => {
    const checkProjectUpdate = () => {
      const wasProjectUpdated = localStorage.getItem('project_name_updated') === 'true';

      if (wasProjectUpdated) {
        // 플래그 초기화
        localStorage.removeItem('project_name_updated');
        localStorage.removeItem('updated_project_id');

        // 목록 데이터 리패치
        refetch();
      }
    };

    // 알림 모달에서 승인/거절 시 데이터 새로고침
    const handleEvidenceListRefresh = () => {
      refetch();
    };

    // 초기 로드 시 확인
    checkProjectUpdate();

    // 포커스가 돌아올 때마다 확인
    window.addEventListener('focus', checkProjectUpdate);
    // 알림 모달에서 승인/거절 이벤트 리스너
    window.addEventListener('evidenceListRefresh', handleEvidenceListRefresh);

    return () => {
      window.removeEventListener('focus', checkProjectUpdate);
      window.removeEventListener('evidenceListRefresh', handleEvidenceListRefresh);
    };
  }, [refetch]);

  return (
    <div className='flex h-screen flex-col overflow-hidden'>
      <MainHeader />

      {/* 검색 */}
      <div className='mt-[64px] flex h-[calc(100vh-64px)] justify-center overflow-hidden'>
        <div id='evidence-table-body' className='flex h-full w-[90%] flex-col'>
          <div className=''>
            <div className=''>
              <div className='flex h-[104px] w-full items-center justify-between'>
                <div className='flex'>
                  <button
                    className={`h-[44px] w-[120px] text-[24px] ${oneGoing ? 'border-b-2 border-[#000] font-bold text-[#000]' : 'text-[#C2C2C2]'}`}
                    onClick={() => handleTabClick(setOnGoing)}
                  >
                    진행 중 사건
                  </button>
                  <button
                    className={`ml-[24px] h-[44px] w-[120px] text-[24px] ${closing ? 'text-[#000 border-b-2 border-[#000] font-bold' : 'text-[#C2C2C2]'}`}
                    onClick={() => handleTabClick(setClosing, true)}
                  >
                    종결된 사건
                  </button>
                </div>

                <div className='hidden lg:flex'>
                  {/*  <div className='mr-[24px]'>
                    <button
                      type='button'
                      className={`flex h-[48px] w-[139px] items-center justify-center rounded-[8px] border-[1px] ${
                        selectedItems.length > 0 ? 'border-[#004AA4] bg-[#004AA4] text-white' : 'border-[#004AA4] text-[#004AA4]'
                      }`}
                      onClick={handlePermissionRequest}
                    >
                      <img src={selectedItems.length > 0 ? ListBtnHover : ListBtn} alt='권한 요청' className='mr-[10px]' />
                      권한 요청
                    </button>
                  </div> */}
                  <div className='relative'>
                    <span className='absolute right-4 top-1/2 -translate-y-1/2 transform'>
                      <IoIosSearch className='text-[25px]' />
                    </span>
                    <input
                      type='text'
                      value={keyword}
                      onChange={handleSearch}
                      onKeyDown={handleSearch}
                      placeholder='검색어를 입력해주세요'
                      className='h-[48px] w-[280px] rounded-[8px] border-[#C2C2C2] px-4 py-3 placeholder:text-[#C2C2C2] focus:outline-none focus:ring-1 focus:ring-[#0050B3]'
                    />
                    {keyword && (
                      <span className='absolute right-12 top-1/2 -translate-y-1/2 transform cursor-pointer' onClick={clearSearch}>
                        <IoMdCloseCircle className='text-[20px] text-gray-500 hover:text-gray-700' />
                      </span>
                    )}
                  </div>
                </div>
              </div>
              <div className='overflow-hidden" min-h-0 flex-1'>
                {oneGoing && (
                  <div className='flex h-full flex-col'>
                    <div className='min-h-0 flex-1 overflow-hidden'>
                      <div className='flex h-full flex-col'>
                        <div className=''>
                          <div className='evidence-table-scroll flex-1 overflow-y-auto' style={{ height: 'calc(100vh - 250px)' }}>
                            <table className='min-w-full'>
                              <thead className='sticky top-0 z-20 bg-[#E6EFFF] font-bold text-[#272727] lg:text-[14px]'>
                                <tr className=''>
                                  <th scope='col' className='w-[5%] rounded-tl-[8px] py-3 pb-2'>
                                    <input
                                      type='checkbox'
                                      checked={selectAll}
                                      onChange={handleSelectAll}
                                      className='h-[20px] w-[20px] rounded-[2px] border-[#CCD0D1] text-[#0050B3] outline-none focus:ring-0'
                                    />
                                  </th>
                                  <th scope='col' className='w-[8%] min-w-[70px] whitespace-nowrap py-3'>
                                    <div className='flex items-center'>
                                      <div className='mr-1 flex text-[#999]'>
                                        <button onClick={() => handleSort('status')} className=''>
                                          {sortConfig.column === 'status' ? (
                                            sortConfig.direction === 'asc' ? (
                                              <img src={clumHIcon} className='h-[20px] w-[20px]' alt='오름차순' />
                                            ) : sortConfig.direction === 'desc' ? (
                                              <img src={clumBIcon} className='h-[20px] w-[20px]' alt='내림차순' />
                                            ) : (
                                              <img src={allSortIcon} className='h-[20px] w-[20px]' alt='기본 정렬' />
                                            )
                                          ) : (
                                            <img src={allSortIcon} className='h-[20px] w-[20px]' alt='기본 정렬' />
                                          )}
                                        </button>
                                      </div>
                                      <DropdownFilter
                                        key={'status'}
                                        column={'사건 상태'}
                                        options={filterOptions.status || []}
                                        onFilter={(values) => handleFilter('status', values)}
                                        isOpen={openDropdown === 'status'}
                                        onToggle={() => handleDropdownToggle('status')}
                                        isFinished={isFinished}
                                        oneGoing={oneGoing}
                                        closing={closing}
                                      />
                                    </div>
                                  </th>
                                  <th scope='col' className='w-[8%] min-w-[100px] whitespace-nowrap py-3'>
                                    <div className='flex items-center'>
                                      <div className='mr-1 flex text-[#999]'>
                                        <button onClick={() => handleSort('createdAt')} className=''>
                                          {sortConfig.column === 'createdAt' ? (
                                            sortConfig.direction === 'asc' ? (
                                              <img src={clumHIcon} className='h-[20px] w-[20px]' alt='오름차순' />
                                            ) : sortConfig.direction === 'desc' ? (
                                              <img src={clumBIcon} className='h-[20px] w-[20px]' alt='내림차순' />
                                            ) : (
                                              <img src={allSortIcon} className='h-[20px] w-[20px]' alt='기본 정렬' />
                                            )
                                          ) : (
                                            <img src={allSortIcon} className='h-[20px] w-[20px]' alt='기본 정렬' />
                                          )}
                                        </button>
                                      </div>
                                      <span
                                        className={`text-[#252525] ${getFontSizeClass(12, fontSizeAdjustment)}`}
                                        style={{ fontSize: `${getAdjustedSize(12)}px` }}
                                      >
                                        사건 등록일
                                      </span>
                                    </div>
                                  </th>
                                  <th scope='col' className='w-[6%] min-w-[70px] whitespace-nowrap py-3'>
                                    <span
                                      className={`text-[#252525] ${getFontSizeClass(12, fontSizeAdjustment)}`}
                                      style={{ fontSize: `${getAdjustedSize(12)}px` }}
                                    >
                                      사건유형
                                    </span>
                                  </th>
                                  <th scope='col' className='w-[15%] min-w-[150px] whitespace-nowrap py-3 2xl:w-[20%]'>
                                    <div className='flex items-center'>
                                      <div className='mr-1 flex text-[#999]'>
                                        {/* <button onClick={() => handleSort('project_nm')} className=''>
                                          <img src={clumHIcon} className='h-[20px] w-[20px]' alt='오름차순' />
                                        </button> */}
                                      </div>
                                      <span
                                        className={`text-[#252525] ${getFontSizeClass(12, fontSizeAdjustment)}`}
                                        style={{ fontSize: `${getAdjustedSize(12)}px` }}
                                      >
                                        사건명
                                      </span>
                                    </div>
                                  </th>
                                  <th scope='col' className='w-[8%] min-w-[100px] whitespace-nowrap py-3'>
                                    <div className='flex items-center'>
                                      <div className='mr-1 flex text-[#999]'>
                                        <button onClick={() => handleSort('client_nm')} className=''>
                                          {sortConfig.column === 'client_nm' ? (
                                            sortConfig.direction === 'asc' ? (
                                              <img src={clumHIcon} className='h-[20px] w-[20px]' alt='오름차순' />
                                            ) : sortConfig.direction === 'desc' ? (
                                              <img src={clumBIcon} className='h-[20px] w-[20px]' alt='내림차순' />
                                            ) : (
                                              <img src={allSortIcon} className='h-[20px] w-[20px]' alt='기본 정렬' />
                                            )
                                          ) : (
                                            <img src={allSortIcon} className='h-[20px] w-[20px]' alt='기본 정렬' />
                                          )}
                                        </button>
                                      </div>
                                      <DropdownFilter
                                        key={'client_nm'}
                                        column={'의뢰인'}
                                        options={filterOptions.client_nm || []}
                                        onFilter={(values) => handleFilter('client_nm', values)}
                                        isOpen={openDropdown === 'client_nm'}
                                        onToggle={() => handleDropdownToggle('client_nm')}
                                        isFinished={isFinished}
                                        oneGoing={oneGoing}
                                        closing={closing}
                                      />
                                    </div>
                                  </th>
                                  <th scope='col' className='w-[6%] min-w-[70px] whitespace-nowrap py-3'>
                                    <div className='flex items-center'>
                                      <div className='mr-1 flex text-[#999]'>
                                        <button onClick={() => handleSort('total_pages')} className=''>
                                          {sortConfig.column === 'total_pages' ? (
                                            sortConfig.direction === 'asc' ? (
                                              <img src={clumHIcon} className='h-[20px] w-[20px]' alt='오름차순' />
                                            ) : (
                                              <img src={clumBIcon} className='h-[20px] w-[20px]' alt='내림차순' />
                                            )
                                          ) : (
                                            <img src={allSortIcon} className='h-[20px] w-[20px]' alt='전체' />
                                          )}
                                        </button>
                                      </div>
                                      <span
                                        className={`text-[#252525] ${getFontSizeClass(12, fontSizeAdjustment)}`}
                                        style={{ fontSize: `${getAdjustedSize(12)}px` }}
                                      >
                                        총 페이지
                                      </span>
                                    </div>
                                  </th>

                                  <th scope='col' className='w-[10%] min-w-[100px] whitespace-nowrap py-3 2xl:w-[15%]'>
                                    <div className='r flex items-center'>
                                      <div className='mr-1 flex text-[#999]'>
                                        <button onClick={() => handleSort('lawyers')} className=''>
                                          {sortConfig.column === 'lawyers' ? (
                                            sortConfig.direction === 'asc' ? (
                                              <img src={clumHIcon} className='h-[20px] w-[20px]' alt='오름차순' />
                                            ) : sortConfig.direction === 'desc' ? (
                                              <img src={clumBIcon} className='h-[20px] w-[20px]' alt='내림차순' />
                                            ) : (
                                              <img src={allSortIcon} className='h-[20px] w-[20px]' alt='기본 정렬' />
                                            )
                                          ) : (
                                            <img src={allSortIcon} className='h-[20px] w-[20px]' alt='기본 정렬' />
                                          )}
                                        </button>
                                      </div>
                                      <DropdownFilter
                                        key={'lawyers'}
                                        column={'참여자 수'}
                                        options={filterOptions.lawyers || []}
                                        onFilter={(values) => handleFilter('lawyers', values)}
                                        isOpen={openDropdown === 'lawyers'}
                                        onToggle={() => handleDropdownToggle('lawyers')}
                                        isFinished={isFinished}
                                        oneGoing={oneGoing}
                                        closing={closing}
                                      />
                                    </div>
                                  </th>
                                  <th scope='col' className='w-[13%] min-w-[100px] whitespace-nowrap rounded-tr-[8px] py-3'>
                                    <div className='flex items-center'>
                                      <div className='mr-1 flex text-[#999]'>
                                        <button onClick={() => handleSort('project_role')} className=''>
                                          {sortConfig.column === 'project_role' ? (
                                            sortConfig.direction === 'asc' ? (
                                              <img src={clumHIcon} className='h-[20px] w-[20px]' alt='오름차순' />
                                            ) : sortConfig.direction === 'desc' ? (
                                              <img src={clumBIcon} className='h-[20px] w-[20px]' alt='내림차순' />
                                            ) : (
                                              <img src={allSortIcon} className='h-[20px] w-[20px]' alt='기본 정렬' />
                                            )
                                          ) : (
                                            <img src={allSortIcon} className='h-[20px] w-[20px]' alt='기본 정렬' />
                                          )}
                                        </button>
                                      </div>
                                      <DropdownFilter
                                        key={'project_role'}
                                        column={'나의 권한'}
                                        options={filterOptions.project_role || []}
                                        onFilter={(values) => handleFilter('project_role', values)}
                                        isOpen={openDropdown === 'project_role'}
                                        onToggle={() => handleDropdownToggle('project_role')}
                                        isFinished={isFinished}
                                        oneGoing={oneGoing}
                                        closing={closing}
                                      />
                                    </div>
                                  </th>
                                </tr>
                              </thead>
                              {!hasLoadedData ? (
                                <tbody className='h-[400px] text-center'>
                                  <tr>
                                    <td colSpan={9} className='pb-6 pt-8 text-gray-500'>
                                      <CustomSpinner />
                                    </td>
                                  </tr>
                                </tbody>
                              ) : isFetching && filteredEvidenceList.length === 0 ? (
                                <tbody className='text-center'>
                                  <tr className='h-[400px]'>
                                    <td colSpan={10} className='text-[24px] font-normal text-[#888]'>
                                      <CustomSpinner />
                                    </td>
                                  </tr>
                                </tbody>
                              ) : filteredEvidenceList.length === 0 ? (
                                <tbody className='text-center'>
                                  <tr className='h-[400px]'>
                                    <td colSpan={10} className='text-[24px] font-normal text-[#888]'>
                                      진행 중인 사건이 없습니다.
                                      <div
                                        className='mt-[20px] flex cursor-pointer items-center justify-center gap-1'
                                        onClick={handleNewCaseRegistration}
                                      >
                                        <FiPlus className='h-4 w-4 text-[#0050B3]' />
                                        <button className='text-[14px] text-[#0050B3]'>신규 사건 등록하기</button>
                                      </div>
                                    </td>
                                  </tr>
                                </tbody>
                              ) : (
                                <tbody className='divide-y divide-gray-200'>
                                  {filteredEvidenceList.map((evidence, index) => (
                                    <tr
                                      key={evidence.project_id}
                                      className='h-[55px] cursor-pointer text-[16px] text-[#272727] hover:bg-[#EFFBFF]'
                                      onClick={() => {
                                        // 일시중지 상태 확인 (최우선)
                                        if (evidence.status === '일시중지') {
                                          handleSuspendedCaseClick(evidence);
                                          return;
                                        }

                                        // 변호사 인증 상태 확인 (무료 상태와 관계없이 먼저 체크)
                                        const certifyStatus = findEvidenceUserInfo?.data?.certify_status;
                                        if (certifyStatus !== '인증' && certifyStatus !== '인증완료') {
                                          // 인증대기 상태일 때는 토스트만 표시
                                          if (certifyStatus === '인증대기' || certifyStatus === '대기') {
                                            onMessageToast({
                                              message: '변호사 인증 완료 후 사건에 접속할 수 있습니다.',
                                              icon: <IoIosWarning className='h-5 w-5 text-yellow-500' />,
                                            });
                                            return;
                                          }

                                          // 인증실패나 미인증일 때는 모달 표시
                                          setIsLawyerVerificationFromCaseClick(true); // 사건 클릭으로 인한 인증임을 표시
                                          setPendingCaseAfterVerification(evidence); // 인증 후 처리할 사건 정보 저장
                                          setIsLawyerVerificationModalOpen(true);
                                          onMessageToast({
                                            message: '변호사 인증을 완료해야 사건에 접속할 수 있습니다.',
                                            icon: <IoIosWarning className='h-5 w-5 text-yellow-500' />,
                                          });
                                          return;
                                        }

                                        if (evidence.status === '생성중') {
                                          onMessageToast({
                                            message: '현재 사건이 생성 중입니다.',
                                            icon: <IoIosWarning className='h-5 w-5 text-yellow-500' />,
                                          });
                                          return;
                                        }
                                        if (evidence.project_role === '권한없음' || evidence.project_role === '-') {
                                          onMessageToast({
                                            message: '해당 사건에 대한 접근 권한이 없습니다.',
                                            icon: <IoIosWarning className='h-5 w-5 text-yellow-500' />,
                                          });
                                          return;
                                        }

                                        // 무료 상태이면 결제 관련 체크만 건너뛰고 바로 접속 허용
                                        if (isFreePaymentActive) {
                                          navigate(
                                            `/evidence/list?project_id=${evidence.project_id}&project_name=${encodeURIComponent(evidence.project_nm)}&client_name=${encodeURIComponent(evidence.client_nm)}`,
                                          );
                                          return;
                                        }

                                        // 결제대기 상태 확인
                                        if (evidence.status === '결제대기') {
                                          openPaymentModal(evidence);
                                          onMessageToast({
                                            message: '결제를 완료한 후 사건에 접속할 수 있습니다.',
                                            icon: <IoIosWarning className='h-5 w-5 text-yellow-500' />,
                                          });
                                          return;
                                        }

                                        // 결제 상태 확인 - trial(무료)는 접속 허용
                                        if (evidence.payment_status !== 'completed' && evidence.payment_status !== 'trial') {
                                          // 결제가 완료되지 않고 무료도 아닌 경우 결제 모달 열기
                                          openPaymentModal(evidence);
                                          onMessageToast({
                                            message: '결제를 완료한 후 사건에 접속할 수 있습니다.',
                                            icon: <IoIosWarning className='h-5 w-5 text-yellow-500' />,
                                          });
                                          return;
                                        }

                                        // has_active_subscription이 false이고 사건관리자가 아닌 경우 접근 막기
                                        // 단, payment_status가 'trial'인 경우는 접속 허용
                                        if (
                                          evidence.has_active_subscription === false &&
                                          evidence.project_role !== '사건관리자권한' &&
                                          evidence.payment_status !== 'trial'
                                        ) {
                                          onMessageToast({
                                            message: '결제를 완료한 후 사건에 접속할 수 있습니다.',
                                            icon: <IoIosWarning className='h-5 w-5 text-yellow-500' />,
                                          });
                                          // 결제 모달도 함께 열기
                                          openPaymentModal(evidence);
                                          return;
                                        }
                                        if (String((evidence as any)?.case_type).toLowerCase() === 'civil') {
                                          const civilCaseId =
                                            (evidence as any)?.civil_case_id ||
                                            (evidence as any)?.civilCaseId ||
                                            (evidence as any)?.civilCaseID;
                                          navigate(
                                            `/case-list?civil_case_id=${encodeURIComponent(
                                              civilCaseId || evidence.project_id,
                                            )}&project_id=${encodeURIComponent(evidence.project_id)}&project_name=${encodeURIComponent(
                                              evidence.project_nm,
                                            )}&client_name=${encodeURIComponent(evidence.client_nm)}`,
                                          );
                                          return;
                                        }

                                        navigate(
                                          `/evidence/list?project_id=${evidence.project_id}&project_name=${encodeURIComponent(
                                            evidence.project_nm,
                                          )}&client_name=${encodeURIComponent(evidence.client_nm)}`,
                                        );
                                      }}
                                    >
                                      <td className='w-[5%] text-center'>
                                        <input
                                          type='checkbox'
                                          checked={selectedItems.some((item) => item.project_id === evidence.project_id)}
                                          onChange={(e) => handleCheckboxChange(e, index, evidence)}
                                          onClick={(e) => e.stopPropagation()}
                                          className='h-[20px] w-[20px] rounded-[2px] border-[#CCD0D1] text-[#0050B3] outline-none focus:ring-0'
                                        />
                                      </td>
                                      <td className='w-[8%] text-center'>
                                        <div className='flex items-center'>
                                          {evidence.status === '진행중' ? (
                                            <div className='flex h-[28px] w-[50px] items-center justify-center rounded-full bg-[#E6F7FF] text-[12px] text-[#1890FF] lg:w-[60px] lg:text-[14px]'>
                                              진행 중
                                            </div>
                                          ) : evidence.status === '종결' ? (
                                            <div className='flex h-[28px] w-[50px] items-center justify-center rounded-full bg-[#E5E5E5] text-[12px] text-[#888] lg:w-[60px] lg:text-[14px]'>
                                              종결
                                            </div>
                                          ) : evidence.status === '일시중지' ? (
                                            <div className='flex h-[28px] w-[55px] items-center justify-center rounded-full bg-[#F3F3F3] text-[12px] text-[#7D7D7D] lg:w-[69px] lg:text-[14px]'>
                                              일시중지
                                            </div>
                                          ) : evidence.status === '결제대기' ? (
                                            <div className='flex h-[28px] w-[55px] items-center justify-center rounded-full bg-[#1890FF] text-[12px] text-white lg:w-[69px] lg:text-[14px]'>
                                              결제대기
                                            </div>
                                          ) : (
                                            <div className='flex h-[28px] w-[50px] items-center justify-center rounded-full bg-[#FFE58F] text-[12px] text-[#AD6800] lg:w-[60px] lg:text-[14px]'>
                                              생성 중
                                            </div>
                                          )}
                                        </div>
                                      </td>

                                      <td
                                        className={`w-[8%] text-[#888] ${getFontSizeClass(14, fontSizeAdjustment)}`}
                                        style={{ fontSize: `${getAdjustedSize(14)}px` }}
                                      >
                                        {formatDate(evidence.createdAt)}
                                      </td>
                                      <td className='w-[6%] min-w-[70px] text-center'>
                                        {(() => {
                                          const label = getCaseTypeLabel(evidence);
                                          const isCivil = label === '민사';
                                          return (
                                            <span
                                              className={`inline-flex items-center justify-center rounded-[6px] px-2 py-1 text-[12px] font-medium ${
                                                isCivil ? 'bg-[#DBEAFE] text-[#1D4ED8]' : 'bg-[#FEE2E2] text-[#B91C1C]'
                                              }`}
                                            >
                                              {label}
                                            </span>
                                          );
                                        })()}
                                      </td>
                                      {evidence.status === '진행중' ? (
                                        <td
                                          className={`w-[20%] truncate pr-5 font-bold text-[#000] ${getFontSizeClass(14, fontSizeAdjustment)}`}
                                          style={{ fontSize: `${getAdjustedSize(14)}px` }}
                                        >
                                          <p className='max-w-[250px] overflow-hidden text-ellipsis whitespace-nowrap 2xl:max-w-[400px]'>
                                            {evidence.project_nm}
                                          </p>
                                        </td>
                                      ) : (
                                        <td
                                          className={`w-[20%] truncate pr-5 text-[#BEC1C6] ${getFontSizeClass(14, fontSizeAdjustment)}`}
                                          style={{ fontSize: `${getAdjustedSize(14)}px` }}
                                        >
                                          <p className='max-w-[250px] overflow-hidden text-ellipsis whitespace-nowrap 2xl:max-w-[400px]'>
                                            {evidence.project_nm}
                                          </p>
                                        </td>
                                      )}
                                      <td
                                        className={`w-[8%] truncate pl-2 text-[#888] ${getFontSizeClass(14, fontSizeAdjustment)}`}
                                        style={{ fontSize: `${getAdjustedSize(14)}px` }}
                                      >
                                        {evidence.client_nm}
                                      </td>
                                      <td
                                        className={`w-[10%] text-[#888] ${getFontSizeClass(14, fontSizeAdjustment)}`}
                                        style={{ fontSize: `${getAdjustedSize(14)}px` }}
                                      >
                                        {evidence.total_pages ? evidence.total_pages.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ',') : '0'}
                                      </td>
                                      <td
                                        className={`w-[6%] pr-5 text-[#888] ${getFontSizeClass(14, fontSizeAdjustment)}`}
                                        style={{ fontSize: `${getAdjustedSize(14)}px` }}
                                        {...(evidence.lawyers && {
                                          'data-tooltip-id': 'tooltip',
                                          'data-tooltip-content': evidence.lawyers,
                                        })}
                                      >
                                        <div className='flex items-center'>
                                          <p className='min-w-[20px] max-w-[25px] text-[12px] text-[#888]'>
                                            {evidence.lawyers ? evidence.lawyers.split(',').length : 0}명
                                          </p>
                                          <p className='max-w-[120px] truncate pl-2 text-[12px] text-[#888] 2xl:max-w-[200px]'>
                                            {evidence.lawyers}
                                          </p>
                                        </div>
                                      </td>
                                      {/* 툴크 */}

                                      <td
                                        className={`w-[13%] pl-2 text-[#888] ${getFontSizeClass(14, fontSizeAdjustment)}`}
                                        style={{ fontSize: `${getAdjustedSize(14)}px` }}
                                      >
                                        {evidence.status === '일시중지' ? (
                                          // 일시중지 사건은 나의 권한만 표시
                                          evidence.project_role
                                        ) : (evidence.status === '결제대기' && evidence.payment_status !== 'trial') ||
                                          (evidence.payment_status !== 'completed' && evidence.payment_status !== 'trial') ? (
                                          <div className='flex gap-2'>
                                            {!isFreePaymentActive && (
                                              <button
                                                onClick={(e) => {
                                                  e.stopPropagation();
                                                  openPaymentModal(evidence);
                                                }}
                                                className='h-[32px] rounded-[6px] bg-[#004AA4] px-2 text-[10px] text-white 2xl:text-[14px]'
                                              >
                                                결제하기
                                              </button>
                                            )}
                                            <button
                                              onClick={(e) => {
                                                e.stopPropagation();
                                                handleModifyUploadModalOpen(
                                                  evidence.project_nm,
                                                  evidence.client_nm,
                                                  evidence.project_id,
                                                  evidence.uploadedFiles || [],
                                                );
                                              }}
                                              className='hidden h-[32px] rounded-[6px] border border-[#004AA4] px-2 text-[10px] text-[#004AA4] lg:flex 2xl:text-[14px]'
                                            >
                                              증거문서 추가
                                            </button>
                                          </div>
                                        ) : evidence.status !== '진행중' ? (
                                          <div className='flex gap-2'>
                                            <button
                                              onClick={(e) => {
                                                e.stopPropagation();
                                                handleModifyUploadModalOpen(
                                                  evidence.project_nm,
                                                  evidence.client_nm,
                                                  evidence.project_id,
                                                  evidence.uploadedFiles || [],
                                                );
                                              }}
                                              className='hidden h-[32px] rounded-[6px] border border-[#004AA4] px-2 text-[10px] text-[#004AA4] lg:flex lg:text-[14px]'
                                            >
                                              증거문서 추가
                                            </button>
                                          </div>
                                        ) : evidence.project_role === '사건관리자권한' ? (
                                          // 사건관리자인 경우: payment_status가 completed가 아니고 trial이 아니고 무료 상태가 아닐 때 결제하기 버튼 표시
                                          evidence.payment_status !== 'completed' &&
                                          evidence.payment_status !== 'trial' &&
                                          !isFreePaymentActive ? (
                                            <button
                                              onClick={(e) => {
                                                e.stopPropagation();
                                                openPaymentModal(evidence);
                                              }}
                                              className='h-[32px] rounded-[6px] bg-[#004AA4] px-2 text-[10px] text-white 2xl:text-[14px]'
                                            >
                                              결제하기
                                            </button>
                                          ) : (
                                            evidence.project_role
                                          )
                                        ) : // 사건관리자가 아닌 경우: has_active_subscription이 false이거나 payment_status가 completed가 아니고 trial이 아니고 무료 상태가 아닐 때 결제하기 버튼 표시
                                        (evidence.has_active_subscription === false || evidence.payment_status !== 'completed') &&
                                          evidence.payment_status !== 'trial' &&
                                          !isFreePaymentActive ? (
                                          <button
                                            onClick={(e) => {
                                              e.stopPropagation();
                                              openPaymentModal(evidence);
                                            }}
                                            className='h-[32px] rounded-[6px] bg-[#004AA4] px-2 text-[10px] text-white 2xl:text-[14px]'
                                          >
                                            결제하기
                                          </button>
                                        ) : (
                                          evidence.project_role
                                        )}
                                      </td>
                                    </tr>
                                  ))}
                                </tbody>
                              )}
                            </table>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                )}
              </div>
              <div className='overflow-hidden" min-h-0 flex-1'>
                {closing && (
                  <div className='flex h-full flex-col'>
                    <div className='min-h-0 flex-1 overflow-hidden'>
                      <div className='flex h-full flex-col'>
                        <div className=''>
                          <div className='flex-1 overflow-y-auto' style={{ height: 'calc(100vh - 250px)' }}>
                            <table className='min-w-full'>
                              <thead className='sticky top-0 z-20 bg-[#E6EFFF] font-bold text-[#272727] lg:text-[14px]'>
                                <tr className=''>
                                  <th scope='col' className='w-[5%] rounded-tl-[8px] py-3'>
                                    <input
                                      type='checkbox'
                                      className='h-[20px] w-[20px] rounded-[2px] border-[#CCD0D1] text-[#4577A4] outline-none focus:ring-0'
                                    />
                                  </th>
                                  <th scope='col' className='w-[8%] py-3'>
                                    <div className='flex items-center'>
                                      {/* <div className='mr-1 flex text-[#999]'>
                                        <button onClick={() => handleSort('status')} className=''>
                                          <img src={allSortIcon} className='h-[20px] w-[20px]' alt='전체' />
                                        </button>
                                      </div> */}
                                      {/*  <DropdownFilter
                                        key={'status'}
                                        column={'사건 상태'}
                                        options={filterOptions.status || []}
                                        onFilter={(values) => handleFilter('status', values)}
                                        isOpen={openDropdown === 'status'}
                                        onToggle={() => handleDropdownToggle('status')}
                                        isFinished={isFinished}
                                        oneGoing={oneGoing}
                                        closing={closing}
                                      /> */}
                                      <span
                                        className={`text-[#252525] ${getFontSizeClass(12, fontSizeAdjustment)}`}
                                        style={{ fontSize: `${getAdjustedSize(12)}px` }}
                                      >
                                        사건 상태
                                      </span>
                                    </div>
                                  </th>
                                  <th scope='col' className='w-[8%] py-3'>
                                    <div className='flex items-center'>
                                      <div className='mr-1 flex text-[#999]'>
                                        <button onClick={() => handleSort('createdAt')} className=''>
                                          <img src={allSortIcon} className='h-[20px] w-[20px]' alt='전체' />
                                        </button>
                                      </div>
                                      <span
                                        className={`text-[#252525] ${getFontSizeClass(12, fontSizeAdjustment)}`}
                                        style={{ fontSize: `${getAdjustedSize(12)}px` }}
                                      >
                                        사건 등록일
                                      </span>
                                    </div>
                                  </th>
                                  <th scope='col' className='w-[6%] py-3'>
                                    <span
                                      className={`text-[#252525] ${getFontSizeClass(12, fontSizeAdjustment)}`}
                                      style={{ fontSize: `${getAdjustedSize(12)}px` }}
                                    >
                                      사건유형
                                    </span>
                                  </th>
                                  <th scope='col' className='w-[15%] py-3 2xl:w-[20%]'>
                                    <div className='flex items-center'>
                                      {/* <div className='mr-1 flex text-[#999]'>
                                        <button onClick={() => handleSort('project_nm')} className=''>
                                          <img src={allSortIcon} className='h-[20px] w-[20px]' alt='전체' />
                                        </button>
                                      </div> */}
                                      <span
                                        className={`text-[#252525] ${getFontSizeClass(12, fontSizeAdjustment)}`}
                                        style={{ fontSize: `${getAdjustedSize(12)}px` }}
                                      >
                                        사건명
                                      </span>
                                    </div>
                                  </th>
                                  <th scope='col' className='w-[10%] py-3'>
                                    <div className='flex items-center'>
                                      <div className='mr-1 flex text-[#999]'>
                                        <button onClick={() => handleSort('client_nm')} className=''>
                                          <img src={allSortIcon} className='h-[20px] w-[20px]' alt='전체' />
                                        </button>
                                      </div>
                                      <DropdownFilter
                                        key={'client_nm'}
                                        column={'의뢰인'}
                                        options={filterOptions.client_nm || []}
                                        onFilter={(values) => handleFilter('client_nm', values)}
                                        isOpen={openDropdown === 'client_nm'}
                                        onToggle={() => handleDropdownToggle('client_nm')}
                                        isFinished={isFinished}
                                        oneGoing={oneGoing}
                                        closing={closing}
                                      />
                                    </div>
                                  </th>
                                  <th scope='col' className='w-[6%] py-3'>
                                    <div className='flex items-center'>
                                      <div className='mr-1 flex text-[#999]'>
                                        <button onClick={() => handleSort('total_pages')} className=''>
                                          <img src={allSortIcon} className='h-[20px] w-[20px]' alt='전체' />
                                        </button>
                                      </div>
                                      {/*  <DropdownFilter
                                        key={'total_pages'}
                                        column={'총 페이지'}
                                        options={filterOptions.total_pages || []}
                                        onFilter={(values) => handleFilter('total_pages', values)}
                                        isOpen={openDropdown === 'total_pages'}
                                        onToggle={() => handleDropdownToggle('total_pages')}
                                        isFinished={isFinished}
                                        oneGoing={oneGoing}
                                        closing={closing}
                                      /> */}
                                      <span
                                        className={`text-[#252525] ${getFontSizeClass(12, fontSizeAdjustment)}`}
                                        style={{ fontSize: `${getAdjustedSize(12)}px` }}
                                      >
                                        총 페이지
                                      </span>
                                    </div>
                                  </th>

                                  <th scope='col' className='w-[10%] py-3 2xl:w-[15%]'>
                                    <div className='flex items-center justify-center'>
                                      <div className='mr-1 flex text-[#999]'>
                                        <button onClick={() => handleSort('lawyers')} className=''>
                                          <img src={allSortIcon} className='h-[20px] w-[20px]' alt='전체' />
                                        </button>
                                      </div>
                                      <DropdownFilter
                                        key={'lawyers'}
                                        column={'참여자 수 '}
                                        options={filterOptions.lawyers || []}
                                        onFilter={(values) => handleFilter('lawyers', values)}
                                        isOpen={openDropdown === 'lawyers'}
                                        onToggle={() => handleDropdownToggle('lawyers')}
                                        isFinished={isFinished}
                                        oneGoing={oneGoing}
                                        closing={closing}
                                      />
                                    </div>
                                  </th>
                                  <th scope='col' className='w-[10%] rounded-tr-[8px] py-3'>
                                    <div className='flex items-center'>
                                      <div className='mr-1 flex text-[#999]'>
                                        <button onClick={() => handleSort('project_role')} className=''>
                                          <img src={allSortIcon} className='h-[20px] w-[20px]' alt='전체' />
                                        </button>
                                      </div>
                                      <DropdownFilter
                                        key={'project_role'}
                                        column={'나의권한'}
                                        options={filterOptions.project_role || []}
                                        onFilter={(values) => handleFilter('project_role', values)}
                                        isOpen={openDropdown === 'project_role'}
                                        onToggle={() => handleDropdownToggle('project_role')}
                                        isFinished={isFinished}
                                        oneGoing={oneGoing}
                                        closing={closing}
                                      />
                                    </div>
                                  </th>
                                </tr>
                              </thead>
                              {filteredEvidenceList.length > 0 ? (
                                <tbody className='divide-y divide-gray-200'>
                                  {filteredEvidenceList.map((evidence, index) => (
                                    <tr
                                      key={evidence.project_id}
                                      className='h-[55px] cursor-pointer text-[16px] text-[#272727] hover:bg-[#EFFBFF]'
                                      onClick={() => {
                                        // 일시중지 상태 확인 (최우선)
                                        if (evidence.status === '일시중지') {
                                          handleSuspendedCaseClick(evidence);
                                          return;
                                        }
                                        // 종결된 사건 처리
                                        handleClosedCaseClick(evidence);
                                      }}
                                    >
                                      <td className='w-[5%] text-center'>
                                        <input
                                          type='checkbox'
                                          onChange={(e) => handleCheckboxChange(e, index, evidence)}
                                          onClick={(e) => e.stopPropagation()}
                                          className='h-[20px] w-[20px] rounded-[2px] border-[#CCD0D1] text-[#0050B3] outline-none focus:ring-0'
                                        />
                                      </td>
                                      <td className='w-[8%]'>
                                        <div className='flex items-center'>
                                          {evidence.status === '일시중지' ? (
                                            <div className='flex h-[28px] w-[69px] items-center justify-center rounded-full bg-[#F3F3F3] text-[14px] text-[#7D7D7D]'>
                                              일시중지
                                            </div>
                                          ) : (
                                            <div className='flex h-[28px] w-[60px] items-center justify-center rounded-full bg-[#E5E5E5] text-[14px] text-[#888]'>
                                              종결
                                            </div>
                                          )}
                                        </div>
                                      </td>

                                      <td
                                        className={`w-[8%] text-[#888] ${getFontSizeClass(14, fontSizeAdjustment)}`}
                                        style={{ fontSize: `${getAdjustedSize(14)}px` }}
                                      >
                                        {formatDate(evidence.createdAt)}
                                      </td>
                                      <td className='w-[6%] min-w-[70px] text-center'>
                                        {(() => {
                                          const label = getCaseTypeLabel(evidence);
                                          const isCivil = label === '민사';
                                          return (
                                            <span
                                              className={`inline-flex items-center justify-center rounded-[6px] px-2 py-1 text-[12px] font-medium ${
                                                isCivil ? 'bg-[#DBEAFE] text-[#1D4ED8]' : 'bg-[#FEE2E2] text-[#B91C1C]'
                                              }`}
                                            >
                                              {label}
                                            </span>
                                          );
                                        })()}
                                      </td>
                                      {evidence.status === '진행중' ? (
                                        <td
                                          className={`w-[20%] font-bold text-[#000] ${getFontSizeClass(14, fontSizeAdjustment)}`}
                                          style={{ fontSize: `${getAdjustedSize(14)}px` }}
                                        >
                                          <p className='max-w-[250px] overflow-hidden text-ellipsis whitespace-nowrap 2xl:max-w-[400px]'>
                                            {evidence.project_nm}
                                          </p>
                                        </td>
                                      ) : (
                                        <td
                                          className={`w-[20%] pr-5 text-[#BEC1C6] ${getFontSizeClass(14, fontSizeAdjustment)}`}
                                          style={{ fontSize: `${getAdjustedSize(14)}px` }}
                                        >
                                          <p className='max-w-[250px] overflow-hidden text-ellipsis whitespace-nowrap 2xl:max-w-[400px]'>
                                            {evidence.project_nm}
                                          </p>
                                        </td>
                                      )}
                                      <td
                                        className={`w-[10%] text-[#888] ${getFontSizeClass(14, fontSizeAdjustment)}`}
                                        style={{ fontSize: `${getAdjustedSize(14)}px` }}
                                      >
                                        {evidence.client_nm}
                                      </td>
                                      <td
                                        className={`w-[10%] text-[#888] ${getFontSizeClass(14, fontSizeAdjustment)}`}
                                        style={{ fontSize: `${getAdjustedSize(14)}px` }}
                                      >
                                        {evidence.total_pages ? evidence.total_pages.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ',') : '0'}
                                      </td>
                                      <td
                                        className={`w-[6%] text-[#888] ${getFontSizeClass(14, fontSizeAdjustment)}`}
                                        style={{ fontSize: `${getAdjustedSize(14)}px` }}
                                        {...(evidence.lawyers && {
                                          'data-tooltip-id': 'tooltip',
                                          'data-tooltip-content': evidence.lawyers,
                                        })}
                                      >
                                        <div className='flex items-center justify-center'>
                                          <p className='min-w-[20px] max-w-[25px] text-[12px] text-[#888]'>
                                            {evidence.lawyers ? evidence.lawyers.split(',').length : 0}명
                                          </p>
                                          <p className='max-w-[120px] truncate pl-2 text-[12px] text-[#888] 2xl:max-w-[200px]'>
                                            {evidence.lawyers}
                                          </p>
                                        </div>
                                      </td>
                                      <td
                                        className={`w-[10%] text-[#888] ${getFontSizeClass(14, fontSizeAdjustment)}`}
                                        style={{ fontSize: `${getAdjustedSize(14)}px` }}
                                      >
                                        {/* 종결된 사건 탭에서는 결제하기 버튼을 표시하지 않음 */}
                                        {evidence.join_status == 'PENDING' ? evidence.join_status_text : evidence.project_role}
                                      </td>
                                    </tr>
                                  ))}
                                </tbody>
                              ) : (
                                <tbody className='text-center'>
                                  <tr className='h-[400px]'>
                                    <td colSpan={100} className='text-[24px] text-[#888]'>
                                      종결된 사건이 없습니다.
                                    </td>
                                  </tr>
                                </tbody>
                              )}
                            </table>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            </div>

            {/* <div className='flex justify-end px-4 sm:px-6 lg:px-8'>
              
              <button
                type='button'
                className='ml-4 h-[46px] w-[120px] rounded-md bg-[#E6F4F1] text-[15px] text-[#004F67]'
                onClick={() => setIsListModalOpen(true)}
              >
                권한 요청 목록
                {assignedMe ? '내 사건 목록보기' : '전체 사건 목록보기'}
              </button>
            </div> */}
          </div>
        </div>
      </div>
      <div className='fixed bottom-0 z-50 flex h-[78px] w-full items-center justify-center bg-white shadow-inner'>
        <div id='evidence-table-body' className='flex w-[90%] items-center justify-between 2xl:w-[70%]'>
          <div
            className={`hidden min-w-[100px] items-center font-light text-[#5b5b5b] lg:flex 2xl:min-w-[200px] ${getFontSizeClass(12, fontSizeAdjustment)}`}
            style={{ fontSize: `${getAdjustedSize(12)}px` }}
          >
            전체 사건{' '}
            <p className='inline font-medium text-[#212121]'>
              {AllListEvidenceOutput?.data?.paging.total_cnt
                ? AllListEvidenceOutput?.data?.paging.total_cnt.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ',')
                : '0'}
              개
            </p>
          </div>

          <div className='flex items-center justify-center'>
            <EvidencePagination
              currentPage={selectedPage}
              totalPages={paging.total_page}
              onPageChange={(page) => {
                onSetSelectedPage({ page });
              }}
            />
            <div className='ml-[5px] hidden items-center justify-center lg:flex 2xl:ml-[26px]'>
              <input
                type='text'
                value={selectedPage}
                onChange={(e) => {
                  const value = e.target.value;
                  if (/^\d*$/.test(value)) {
                    setSelectedPage(Number(value));
                  }
                }}
                onBlur={(e) => {
                  const value = Number(e.target.value);

                  handlePageMove(value);
                }}
                placeholder='페이지 번호 입력'
                className='h-[32px] w-[50px] rounded border border-[#C0D5DE] border-gray-400 p-2 text-[14px] focus:border-[#2B7994] focus:outline-none focus:ring-0'
              />
              <span className='pl-[8px] pr-2 text-[14px]'>/</span>
              <span className='text-[14px]'>{AllListEvidenceOutput?.data?.paging.total_page || 0}</span>
              <button
                onClick={() => handlePageMove(selectedPage)}
                className='ml-2 h-[32px] w-[50px] rounded border text-[14px] text-[#313131]'
              >
                이동
              </button>
            </div>
          </div>
          {/* 페이지당 문서 개수 선택 드롭다운 */}
          <div className='mr-[24px] hidden items-center lg:flex'>
            <Select
              value={itemsPerPage?.toString() || findEvidenceUserInfo?.data?.evi_display_cnt?.toString() || '50'}
              onValueChange={(value) => {
                setItemsPerPage(Number(value));
                onSetSelectedPage({ page: 1 });
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
          <div className=''>
            <button
              type='button'
              className='hidden h-[48px] w-[150px] items-center justify-center rounded-[10px] border border-[#0050B3] text-[14px] text-[#0050B3] lg:flex'
              onClick={handleNewCaseRegistration}
            >
              <IoIosAdd className='mr-1 text-xl text-[#0050B3]' />
              신규 사건 등록
            </button>
          </div>
        </div>
      </div>
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
      <PermissionModal
        isOpen={isModalOpen}
        selectedItems={selectedItems} // 선택된 항목 전달
        onClose={() => setIsModalOpen(false)}
        onSubmit={(permissions) => {
          console.log('Requested Permissions:', permissions);
          setSelectedItems([]); // 모달 제출 후 선택 항목 초기화
        }}
      />
      <PermissionListModal isOpen={isListModalOpen} onClose={() => setIsListModalOpen(false)} />
      <EvidenceListUploadModal isOpen={isUploadModalOpen} onClose={() => setIsUploadModalOpen(false)} onSuccess={handleUploadSuccess} />
      <EvidenceModifyUploadModal
        isOpen={isModifyUploadModalOpen}
        onClose={handleModifyUploadModalClose}
        onSuccess={handleModifyUploadSuccess}
        project_nm={selectedProjectInfo?.project_nm || ''}
        client_nm={selectedProjectInfo?.client_nm || ''}
        project_id={selectedProjectInfo?.project_id || ''}
        uploadedFiles={selectedProjectInfo?.uploadedFiles || []}
      />

      {/* 변호사 인증 모달 */}
      <LawyerVerificationModal
        isOpen={isLawyerVerificationModalOpen}
        onClose={() => {
          setIsLawyerVerificationModalOpen(false);
          setIsLawyerVerificationFromCaseClick(false);
          setPendingCaseAfterVerification(null);
        }}
        onVerificationSuccess={() => {
          setIsLawyerVerificationModalOpen(false);
          onMessageToast({
            message: '변호사 인증 정보가 제출되었습니다.',
          });

          // 사건 클릭으로 인한 인증인 경우
          if (isLawyerVerificationFromCaseClick && pendingCaseAfterVerification) {
            const evidence = pendingCaseAfterVerification;

            // has_active_subscription이 false이고 사건관리자가 아니고 payment_status가 'trial'이 아닌 경우에만 결제 모달 열기
            if (
              evidence.has_active_subscription === false &&
              evidence.project_role !== '사건관리자권한' &&
              evidence.payment_status !== 'trial'
            ) {
              openPaymentModal(evidence);
            }
            // 그 외의 경우는 아무것도 하지 않음 (사용자가 다시 사건을 클릭해야 함)

            setIsLawyerVerificationFromCaseClick(false);
            setPendingCaseAfterVerification(null);
          } else {
            // 신규 사건 등록 버튼으로 인한 인증인 경우 사건 등록 모달 열기
            setIsUploadModalOpen(true);
          }
        }}
        onVerificationFailure={(message) => {
          onMessageToast({
            message,
            icon: <IoIosWarning className='h-5 w-5 text-yellow-500' />,
          });
          setIsLawyerVerificationFromCaseClick(false);
          setPendingCaseAfterVerification(null);
        }}
      />

      {/* 결제 모달 */}
      {isPaymentModalOpen && (
        <PaymentModal
          isOpen={isPaymentModalOpen}
          onClose={() => {
            setIsPaymentModalOpen(false);
            setIsInvited(false); // 모달 닫을 때 초기화
            setRequestId(''); // requestId 초기화
            refetch(); // 리스트 새로고침 (거절 시에도 새로고침)
          }}
          onPayment={() => {
            // 이 함수는 PaymentModal 내부에서 handleTossPayment가 실행되므로 빈 함수로 둠
            // 실제 결제 처리는 PaymentModal 내부의 handleTossPayment에서 처리됨
          }}
          projectName={registeredProjectName}
          projectId={registeredProjectId}
          userId={findEvidenceUserInfo?.data?.user_id}
          requestId={requestId}
          paymentType={paymentType}
          amount={paymentAmount}
          planId={paymentType === 'case_subscription' ? 'plan_01K5B9Y83AKY5XX8Z78D7HSC73' : 'plan_01K7GPCHPZXX4CZM6TTRYAA2CW'}
          isInvited={isInvited}
          onPaymentSuccess={async () => {
            // 기존 빌링키로 결제 성공 시 토스트 메시지 표시
            console.log('기존 빌링키로 결제 성공');
            onMessageToast({
              message: '결제가 완료되었습니다.',
              icon: <FaCheckCircle className='h-5 w-5 text-[#004AA4]' />,
            });
            setIsPaymentModalOpen(false); // 결제 모달 닫기
            setIsInvited(false); // 초기화
            setRequestId(''); // requestId 초기화
            refetch(); // 리스트 새로고침
          }}
        />
      )}

      {/* 빌링키 발급 중 로딩 모달 */}
      {isBillingKeyCreatingModalOpen && (
        <div className='fixed inset-0 z-[1000] flex items-center justify-center bg-black bg-opacity-75'>
          <div className='flex flex-col items-center gap-4 rounded-lg bg-white p-12'>
            <div className='h-8 w-8 animate-spin rounded-full border-4 border-gray-300 border-t-[#004AA4]'></div>
            <p className='text-[16px] font-medium text-[#252525]'>빌링키 발급 중...</p>
            <p className='text-[14px] text-[#666666]'>
              빌링키를 발급하고 있습니다.
              <br />
              잠시만 기다려주세요.
            </p>
          </div>
        </div>
      )}

      {/* 결제 처리 중 로딩 모달 */}
      {isPaymentProcessingModalOpen && (
        <div className='fixed inset-0 z-[1000] flex items-center justify-center bg-black bg-opacity-75'>
          <div className='flex flex-col items-center gap-4 rounded-lg bg-white p-12'>
            <div className='h-8 w-8 animate-spin rounded-full border-4 border-gray-300 border-t-[#004AA4]'></div>
            <p className='text-[16px] font-medium text-[#252525]'>결제 처리 중...</p>
            <p className='text-[14px] text-[#666666]'>
              결제중입니다.
              <br />
              잠시만 기다려주세요.
            </p>
          </div>
        </div>
      )}

      {/* 일시중지 모달 */}
      <CaseSuspendedModal
        isOpen={isCaseSuspendedModalOpen}
        onClose={() => {
          setIsCaseSuspendedModalOpen(false);
          setSuspendedCaseInfo(null);
        }}
        isManager={suspendedCaseInfo?.isManager || false}
        onStatusChange={handleStatusChangeToProgress}
        onCaseDetailView={handleCaseDetailView}
      />

      {/* 종결된 사건 모달 */}
      <CaseClosedModal
        isOpen={isCaseClosedModalOpen}
        onClose={() => {
          setIsCaseClosedModalOpen(false);
          setClosedCaseInfo(null);
        }}
        isManager={closedCaseInfo?.isManager || false}
        onStatusChange={handleClosedStatusChangeToProgress}
        onCaseDetailView={handleClosedCaseDetailView}
      />

      {/* 결제 참여 모달 */}
      {isPaymentParticipationModalOpen && (
        <PaymentParticipationModal
          isOpen={isPaymentParticipationModalOpen}
          onClose={() => setIsPaymentParticipationModalOpen(false)}
          onPayment={() => {
            // 결제 처리 로직은 PaymentParticipationModal 내부에서 처리
          }}
          projectName={registeredProjectName}
          projectId={registeredProjectId}
          userId={findEvidenceUserInfo?.data?.user_id}
          onPaymentSuccess={handlePaymentParticipationSuccess}
        />
      )}
    </div>
  );
};
export default EvidenceListTable;
