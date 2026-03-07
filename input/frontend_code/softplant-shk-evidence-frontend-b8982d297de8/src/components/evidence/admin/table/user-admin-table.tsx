import { JSX, useState, useEffect, useRef, useMemo, useCallback } from 'react';

import { fetchUpdateCertificationStatus } from '@/apis';
import {
  Table,
  TableBox,
  TableCell,
  TableRow,
  HeaderWrapper,
  HeaderTitle,
  TooltipContainer,
  TooltipContent,
} from '@/components/evidence/admin/table/user-admin-table.styled';
import DropdownFilter from '@/components/evidence/filter/evidence-filter';
import RangeDropdownFilter from '@/components/evidence/filter/range-dropdown-filter';
import { EvidencePagination } from '@/components/evidence/pagination/evidence-pagination';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useFindAllUser } from '@/hooks/react-query/query/evidence/use-find-all-user';
import { useGetAllUserFilter } from '@/hooks/react-query/query/evidence/use-get-all-user-filter';

const UserInfoTable = (): JSX.Element => {
  // !필터 관련
  const [filters, setFilters] = useState({
    keyword: '',
    email: '',
    phone: '',
    tel: '',
    status: '',
    certify_status: 'ALL', // 인증 상태 필터 추가
  });

  // !검색 타입 관련
  const [searchType, setSearchType] = useState('all'); // 'all', 'name', 'email', 'phone', 'office_nm', 'project_nm'

  // !페이지네이션관련
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(50);

  // 인증 상태 관리
  const [certificationStatuses, setCertificationStatuses] = useState<{ [key: string]: string }>({});

  // 상태 변경 모달 관리
  const [isConfirmModalOpen, setIsConfirmModalOpen] = useState(false);
  const [pendingStatusChange, setPendingStatusChange] = useState<{
    userEmail: string;
    userName: string;
    currentStatus: string;
    newStatus: string;
  } | null>(null);

  // 헤더 필터 드롭다운 관리
  const [isHeaderFilterOpen, setIsHeaderFilterOpen] = useState(false);
  const headerFilterRef = useRef<HTMLDivElement>(null);

  // 소속로펌명 / 직접등록한 사건수 / 참여중인 사건수 필터 드롭다운
  const [isOfficeNmFilterOpen, setIsOfficeNmFilterOpen] = useState(false);
  const [isProjectRequestCountFilterOpen, setIsProjectRequestCountFilterOpen] = useState(false);
  const [isProjectJoinCountFilterOpen, setIsProjectJoinCountFilterOpen] = useState(false);

  // 적용된 필터(서버 전송용)
  const [appliedOfficeNm, setAppliedOfficeNm] = useState<string[]>([]);
  const [appliedProjectRequestCount, setAppliedProjectRequestCount] = useState<{ min?: number; max?: number }>({});
  const [appliedProjectJoinCount, setAppliedProjectJoinCount] = useState<{ min?: number; max?: number }>({});

  const defaultAllUserFilterInput = useMemo(
    () => ({
      office_nm: [],
      certify_status: [],
      project_request_count: { min: 0, max: 999999 },
      project_join_count: { min: 0, max: 999999 },
    }),
    [],
  );

  // 필터 옵션(소속로펌명 목록/카운트 범위 등) 조회
  const { response: allUserFilterOptions } = useGetAllUserFilter({
    ...defaultAllUserFilterInput,
  });

  // 검색 중복 호출 방지
  const isSearchingRef = useRef(false);
  // 한글 IME 조합 중 Enter 처리 (조합 중 검색 실행되면 마지막 자모가 누락될 수 있음)
  const isComposingRef = useRef(false);
  const pendingSearchRef = useRef(false);
  const searchInputRef = useRef<HTMLInputElement | null>(null);

  // 초기 로드 여부 추적
  const hasInitialLoadedRef = useRef(false);

  // 검색 파라미터 준비 (전체 데이터 조회) - useMemo로 메모이제이션
  const searchParams = useMemo(() => {
    const params = {
      email: '',
      tel: '',
      name: '',
      role: '',
      phone: '',
      isActive: '',
      registrationStatus: '',
      office_id: '',
      office_nm: '',
      project_nm: '',
      keyword: '',
      certify_status: '', // 항상 전체 데이터 조회
      filters: {
        office_nm: appliedOfficeNm,
        certify_status: filters.certify_status && filters.certify_status !== 'ALL' ? [filters.certify_status] : [],
        project_request_count: {
          min: typeof appliedProjectRequestCount.min === 'number' ? appliedProjectRequestCount.min : 0,
          max: typeof appliedProjectRequestCount.max === 'number' ? appliedProjectRequestCount.max : 999999,
        },
        project_join_count: {
          min: typeof appliedProjectJoinCount.min === 'number' ? appliedProjectJoinCount.min : 0,
          max: typeof appliedProjectJoinCount.max === 'number' ? appliedProjectJoinCount.max : 999999,
        },
      },
      page_no: 1,
      block_cnt: 10000, // 충분히 큰 수로 전체 데이터 가져오기
    };

    // 검색 타입에 따라 keyword를 해당 필드에 매핑
    if (filters.keyword) {
      switch (searchType) {
        case 'all':
          params.keyword = filters.keyword;
          break;
        case 'name':
          params.name = filters.keyword;
          break;
        case 'email':
          params.email = filters.keyword;
          break;
        case 'phone':
          params.phone = filters.keyword;
          break;
        case 'office_nm':
          params.office_nm = filters.keyword;
          break;
        case 'project_nm':
          params.project_nm = filters.keyword;
          break;
      }
    }

    return params;
  }, [
    filters.certify_status,
    filters.keyword,
    searchType,
    appliedOfficeNm,
    appliedProjectJoinCount.max,
    appliedProjectJoinCount.min,
    appliedProjectRequestCount.max,
    appliedProjectRequestCount.min,
  ]);

  // searchParams를 ref로 저장하여 안정적인 참조 유지
  const searchParamsRef = useRef(searchParams);
  useEffect(() => {
    searchParamsRef.current = searchParams;
  }, [searchParams]);

  // 사용자 목록 조회 (전체 데이터)
  // enabled: false로 설정하여 자동 실행 방지, 수동 refetch만 사용
  // searchParamsRef를 사용하여 리렌더링 시 객체 재생성 방지
  const {
    response: userListOutput,
    refetch: refetchUserList,
    isLoading: isUserLoading,
    isFetching: isUserFetching,
  } = useFindAllUser({
    ...searchParamsRef.current,
    enabled: false, // 자동 실행 비활성화
  });

  const handleFilterChange = (field: string, value: string) => {
    setFilters((prev) => ({
      ...prev,
      [field]: value,
    }));
    setCurrentPage(1); // 필터 변경 시 첫 페이지로
  };

  // 검색 실행 함수 (중복 호출 방지)
  const handleSearch = () => {
    if (isSearchingRef.current) {
      return;
    }
    isSearchingRef.current = true;
    // searchParamsRef의 최신 값을 사용하여 refetch
    // refetch는 queryFn에서 inputRef.current를 사용하므로 자동으로 최신 값 사용됨
    refetchUserList();
    setTimeout(() => {
      isSearchingRef.current = false;
    }, 300);
  };

  // 페이지 크기 변경 핸들러
  const handlePageSizeChange = (newPageSize: number) => {
    console.log('페이지 크기 변경:', pageSize, '->', newPageSize);
    setPageSize(newPageSize);
    setCurrentPage(1); // 페이지 크기 변경 시 첫 페이지로
  };

  const formatDate = (dateString: string) => {
    if (!dateString) return '-';
    return new Date(dateString).toLocaleDateString('ko-KR', {
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
    });
  };

  // 인증 상태별 스타일 반환
  const getCertificationStyle = (status: string) => {
    switch (status) {
      case '인증대기':
        return {
          backgroundColor: '#1890FF',
          color: 'white',
        };
      case '인증실패':
        return {
          backgroundColor: '#F5222D',
          color: 'white',
        };
      case '인증완료':
        return {
          backgroundColor: '#5B5B5B',
          color: 'white',
        };
      case '미인증':
      default:
        return {
          backgroundColor: '#999999',
          color: 'white',
        };
    }
  };

  // 사용자의 현재 인증 상태 가져오기
  const getUserCertificationStatus = useCallback(
    (user: any) => {
      // 상태가 변경된 경우 변경된 상태 반환
      if (certificationStatuses[user.email]) {
        return certificationStatuses[user.email];
      }

      // certify_status 필드 기반으로 상태 반환
      if (user.certify_status) {
        // 서버에서 오는 값을 UI에 맞게 매핑
        switch (user.certify_status) {
          case '인증':
          case '인증완료':
            return '인증완료';
          case '인증대기':
          case '대기':
          case '진행중':
            return '인증대기';
          case '실패':
          case '인증실패':
            return '인증실패';
          case '미인증':
          default:
            return '미인증';
        }
      }

      return '미인증';
    },
    [certificationStatuses],
  );

  const allUsers = useMemo(() => (userListOutput as any)?.data?.users ?? [], [userListOutput]);

  // NOTE: 서버가 모든 필터를 지원하지 않는 경우에도 UI의 "카운트/페이지네이션/상단 배지"가 일관되도록
  // certify_status를 제외한 필터들은 공통 base list에 먼저 적용합니다.
  const baseFilteredUsers = useMemo(() => {
    let filtered = allUsers;

    // 소속로펌명 필터링
    if (appliedOfficeNm.length > 0) {
      filtered = filtered.filter((user: any) => appliedOfficeNm.includes(user.office_nm));
    }

    // 직접등록한 사건수 필터링
    if (typeof appliedProjectRequestCount.min === 'number' || typeof appliedProjectRequestCount.max === 'number') {
      const min = typeof appliedProjectRequestCount.min === 'number' ? appliedProjectRequestCount.min : 0;
      const max = typeof appliedProjectRequestCount.max === 'number' ? appliedProjectRequestCount.max : Number.POSITIVE_INFINITY;
      filtered = filtered.filter((user: any) => {
        const v = Number(user.project_request_count ?? 0);
        return v >= min && v <= max;
      });
    }

    // 참여중인 사건수 필터링
    if (typeof appliedProjectJoinCount.min === 'number' || typeof appliedProjectJoinCount.max === 'number') {
      const min = typeof appliedProjectJoinCount.min === 'number' ? appliedProjectJoinCount.min : 0;
      const max = typeof appliedProjectJoinCount.max === 'number' ? appliedProjectJoinCount.max : Number.POSITIVE_INFINITY;
      filtered = filtered.filter((user: any) => {
        const v = Number(user.project_join_count ?? 0);
        return v >= min && v <= max;
      });
    }

    return filtered;
  }, [
    allUsers,
    appliedOfficeNm,
    appliedProjectJoinCount.max,
    appliedProjectJoinCount.min,
    appliedProjectRequestCount.max,
    appliedProjectRequestCount.min,
  ]);

  const filteredUsers = useMemo(() => {
    let filtered = baseFilteredUsers;

    // 인증 상태 필터링 (상단 카드 클릭)
    if (filters.certify_status && filters.certify_status !== 'ALL') {
      filtered = filtered.filter((user: any) => {
        const userStatus = getUserCertificationStatus(user);
        return userStatus === filters.certify_status;
      });
    }

    return filtered;
  }, [baseFilteredUsers, filters.certify_status, getUserCertificationStatus]);

  // 페이지네이션 적용
  const startIndex = (currentPage - 1) * pageSize;
  const endIndex = startIndex + pageSize;
  const users = filteredUsers.slice(startIndex, endIndex);

  // 페이지네이션 정보 계산
  const totalPages = Math.ceil(filteredUsers.length / pageSize);
  const pagination = {
    page: currentPage,
    total_pages: totalPages,
    total_count: filteredUsers.length,
  };

  // 카운트 계산 (certify_status 외 다른 필터 적용된 기준으로 집계)
  const getStatusCount = (status: string) => {
    return baseFilteredUsers.filter((user: any) => getUserCertificationStatus(user) === status).length;
  };

  // 인증 상태 변경 요청 핸들러 (모달 열기)
  const handleCertificationStatusChange = (userEmail: string, newStatus: string) => {
    const user = users.find((u: any) => u.email === userEmail);
    if (!user) {
      console.error('User not found');
      return;
    }

    const currentStatus = getUserCertificationStatus(user);

    // 현재 상태와 동일하면 변경하지 않음
    if (currentStatus === newStatus) {
      return;
    }

    // 모달 정보 설정 및 열기
    setPendingStatusChange({
      userEmail,
      userName: user.name,
      currentStatus,
      newStatus,
    });
    setIsConfirmModalOpen(true);
  };

  // 실제 인증 상태 변경 실행
  const executeCertificationStatusChange = async () => {
    if (!pendingStatusChange) return;

    try {
      // UI 상태를 서버 값으로 매핑
      let certifyStatusValue = '';
      switch (pendingStatusChange.newStatus) {
        case '인증완료':
          certifyStatusValue = '인증완료';
          break;
        case '인증대기':
          certifyStatusValue = '인증대기';
          break;
        case '인증실패':
          certifyStatusValue = '인증실패';
          break;
        case '미인증':
        default:
          certifyStatusValue = '미인증';
          break;
      }

      // 사용자 정보 찾기
      const user = users.find((u: any) => u.email === pendingStatusChange.userEmail);
      if (!user || !user.user_id) {
        console.error('User or user_id not found');
        return;
      }

      // API 호출
      await fetchUpdateCertificationStatus(user.user_id, {
        certify_status: certifyStatusValue,
      });

      // 성공 시 로컬 상태 업데이트
      setCertificationStatuses((prev) => ({
        ...prev,
        [pendingStatusChange.userEmail]: pendingStatusChange.newStatus,
      }));

      console.log(
        `User ${pendingStatusChange.userEmail} certification status changed to: ${pendingStatusChange.newStatus} (${certifyStatusValue})`,
      );

      // 사용자 목록 새로고침
      refetchUserList();

      // 모달 닫기
      setIsConfirmModalOpen(false);
      setPendingStatusChange(null);
    } catch (error) {
      console.error('Failed to update certification status:', error);
      // 에러 발생 시 사용자에게 알림 (필요시 toast 메시지 추가)
    }
  };

  // 모달 취소 핸들러
  const handleModalCancel = () => {
    setIsConfirmModalOpen(false);
    setPendingStatusChange(null);
  };

  // 헤더 필터 옵션 선택 핸들러
  const handleHeaderFilterSelect = (value: string) => {
    handleFilterChange('certify_status', value);
    setIsHeaderFilterOpen(false);
  };
  const officeNmOptions = (allUserFilterOptions as any)?.data?.office_nm ?? [];

  // 컴포넌트 마운트 시 전체 데이터 조회 (한 번만 실행)
  useEffect(() => {
    if (!hasInitialLoadedRef.current) {
      hasInitialLoadedRef.current = true;
      refetchUserList();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // 헤더 필터 드롭다운 외부 클릭 감지
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (headerFilterRef.current && !headerFilterRef.current.contains(event.target as Node)) {
        setIsHeaderFilterOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  // 페이지 변경 핸들러
  const handlePageChange = (page: number) => {
    console.log('페이지 변경:', currentPage, '->', page);
    setCurrentPage(page);
  };

  return (
    <div className='h-[calc(100vh-100px)] w-full p-5'>
      <div className=''>
        {/* 헤더 영역 */}
        <HeaderWrapper>
          <HeaderTitle>회원정보</HeaderTitle>
        </HeaderWrapper>

        {/* 필터 박스와 검색 영역 */}
        <div className='mt-[25px] w-full items-center justify-between 2xl:flex'>
          {/* 왼쪽 필터 박스들 */}
          <div className='flex items-center gap-4'>
            {/* 미인증 필터 박스 */}
            <div
              className={`flex h-[80px] w-[180px] cursor-pointer flex-col items-start justify-center gap-2 rounded-lg p-[10px] transition-colors ${
                filters.certify_status === '미인증' ? 'border border-blue-300 bg-blue-100' : 'bg-[#F7F8F8] hover:bg-gray-200'
              }`}
              onClick={() => handleFilterChange('certify_status', filters.certify_status === '미인증' ? 'ALL' : '미인증')}
            >
              <div className='text-[12px] text-[#666]'>미인증</div>
              <div className='text-[24px] font-bold text-[#000]'>{getStatusCount('미인증')}건</div>
            </div>

            {/* 인증실패 필터 박스 */}
            <div
              className={`flex h-[80px] w-[180px] cursor-pointer flex-col items-start justify-center gap-2 rounded-lg p-[10px] transition-colors ${
                filters.certify_status === '인증실패' ? 'border border-blue-300 bg-blue-100' : 'bg-[#F7F8F8] hover:bg-gray-200'
              }`}
              onClick={() => handleFilterChange('certify_status', filters.certify_status === '인증실패' ? 'ALL' : '인증실패')}
            >
              <div className='text-[12px] text-[#666]'>인증실패</div>
              <div className='text-[24px] font-bold text-[#000]'>{getStatusCount('인증실패')}건</div>
            </div>

            {/* 인증대기 필터 박스 */}
            <div
              className={`flex h-[80px] w-[180px] cursor-pointer flex-col items-start justify-center gap-2 rounded-lg p-[10px] transition-colors ${
                filters.certify_status === '인증대기' ? 'border border-blue-300 bg-blue-100' : 'bg-[#F7F8F8] hover:bg-gray-200'
              }`}
              onClick={() => handleFilterChange('certify_status', filters.certify_status === '인증대기' ? 'ALL' : '인증대기')}
            >
              <div className='text-[12px] text-[#666]'>인증대기</div>
              <div className='text-[24px] font-bold text-[#000]'>{getStatusCount('인증대기')}건</div>
            </div>

            {/* 인증완료 필터 박스 */}
            <div
              className={`flex h-[80px] w-[180px] cursor-pointer flex-col items-start justify-center gap-2 rounded-lg p-[10px] transition-colors ${
                filters.certify_status === '인증완료' ? 'border border-blue-300 bg-blue-100' : 'bg-[#F7F8F8] hover:bg-gray-200'
              }`}
              onClick={() => handleFilterChange('certify_status', filters.certify_status === '인증완료' ? 'ALL' : '인증완료')}
            >
              <div className='text-[12px] text-[#666]'>인증완료</div>
              <div className='text-[24px] font-bold text-[#000]'>{getStatusCount('인증완료')}건</div>
            </div>
          </div>

          {/* 오른쪽 검색 영역 */}
          <div className='mt-4 flex items-center gap-4 2xl:mt-0'>
            <div className='flex items-center gap-2'>
              <span className='text-[12px] text-[#000]'>
                {currentPage}페이지 중 {users.length} 건 | 총 {pagination.total_count} 건 (전체: {baseFilteredUsers.length}건) | {pageSize}
                개씩 보기
              </span>
              {filters.certify_status && filters.certify_status !== 'ALL' && (
                <span className='text-[12px] text-blue-600'>({filters.certify_status} 필터 적용 중)</span>
              )}
            </div>

            <div className='flex items-center gap-2'>
              {/*  <span className='text-[12px] text-[#000]'>페이지당 항목수:</span> */}
              <Select value={pageSize.toString()} onValueChange={(value) => handlePageSizeChange(Number(value))}>
                <SelectTrigger className='h-[32px] w-[120px]'>
                  <SelectValue placeholder='페이지당 개수' />
                </SelectTrigger>
                <SelectContent className='w-[200px]'>
                  {[50, 100, 200].map((option: number) => (
                    <SelectItem key={option} value={option.toString()}>
                      <p className='text-[12px]'>{option}개씩 보기</p>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* 검색 타입 선택과 검색어 입력창 */}
            <div className='flex items-center gap-2'>
              {/* 검색 타입 선택 */}
              <Select value={searchType} onValueChange={setSearchType}>
                <SelectTrigger className='h-[40px] w-[120px]'>
                  <SelectValue placeholder='검색 타입' />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value='all'>전체</SelectItem>
                  <SelectItem value='name'>이름</SelectItem>
                  <SelectItem value='email'>이메일</SelectItem>
                  <SelectItem value='phone'>전화번호</SelectItem>
                  <SelectItem value='office_nm'>로펌명</SelectItem>
                  <SelectItem value='project_nm'>사건명</SelectItem>
                </SelectContent>
              </Select>

              <div className='relative'>
                <input
                  ref={searchInputRef}
                  type='text'
                  className='h-[40px] w-[280px] rounded-lg border border-gray-300 px-4 py-2 pr-20 text-[14px] placeholder:text-[#999] focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500'
                  placeholder={`${
                    searchType === 'all'
                      ? '검색어'
                      : searchType === 'name'
                        ? '이름'
                        : searchType === 'email'
                          ? '이메일'
                          : searchType === 'phone'
                            ? '전화번호'
                            : searchType === 'office_nm'
                              ? '로펌명'
                              : '사건명'
                  }을 입력해주세요`}
                  value={filters.keyword}
                  onChange={(e) => handleFilterChange('keyword', e.target.value)}
                  onCompositionStart={() => {
                    isComposingRef.current = true;
                  }}
                  onCompositionEnd={(e) => {
                    isComposingRef.current = false;

                    // 조합 중 Enter가 눌렸던 경우: 조합이 끝난 "최종 값"으로 검색 실행
                    if (pendingSearchRef.current) {
                      pendingSearchRef.current = false;
                      handleFilterChange('keyword', e.currentTarget.value);
                      // state 반영 이후 검색되도록 다음 tick에 실행
                      setTimeout(() => handleSearch(), 0);
                    }
                  }}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter') {
                      // 한글 입력 조합 중 Enter는 "조합 확정" 용도로 먼저 소비되므로,
                      // 조합이 끝난 뒤에 검색을 실행해야 마지막 글자(받침)가 누락되지 않음.
                      if ((e.nativeEvent as any).isComposing || isComposingRef.current) {
                        pendingSearchRef.current = true;
                        return;
                      }
                      e.preventDefault();
                      handleSearch();
                    }
                  }}
                />

                {/* X 버튼 (검색어가 있을 때만 표시) */}
                {filters.keyword && (
                  <button
                    className='absolute right-10 top-1/2 -translate-y-1/2 transform text-gray-400 hover:text-gray-600'
                    onClick={() => handleFilterChange('keyword', '')}
                  >
                    <svg className='h-4 w-4' fill='none' stroke='currentColor' viewBox='0 0 24 24'>
                      <path strokeLinecap='round' strokeLinejoin='round' strokeWidth={2} d='M6 18L18 6M6 6l12 12' />
                    </svg>
                  </button>
                )}

                {/* 검색 버튼 */}
                <button
                  className='absolute right-3 top-1/2 -translate-y-1/2 transform text-gray-400 hover:text-gray-600'
                  onMouseDown={(e) => {
                    // NOTE: click 시점엔 IME 조합이 아직 확정되기 전이라 마지막 글자가 누락될 수 있어,
                    // mousedown(blur/compositionend 이전)에서 "검색 보류"를 걸고, blur로 조합을 확정시킵니다.
                    e.preventDefault();
                    pendingSearchRef.current = true;

                    // blur가 들어가면 IME 조합이 확정되며 onCompositionEnd가 호출됨
                    searchInputRef.current?.blur();

                    // 이미 조합이 끝난 상태라면(일반 영문/한글 확정 후 클릭) 여기서 바로 실행
                    if (!isComposingRef.current) {
                      const latest = searchInputRef.current?.value ?? filters.keyword;
                      pendingSearchRef.current = false;
                      handleFilterChange('keyword', latest);
                      setTimeout(() => handleSearch(), 0);
                    }
                  }}
                  onClick={(e) => {
                    // onMouseDown에서 처리(중복 실행 방지)
                    e.preventDefault();
                  }}
                >
                  <svg className='h-5 w-5' fill='none' stroke='currentColor' viewBox='0 0 24 24'>
                    <path strokeLinecap='round' strokeLinejoin='round' strokeWidth={2} d='M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z' />
                  </svg>
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* 테이블 영역 */}
        <TableBox>
          <Table>
            <thead className='sticky top-0 z-10'>
              <TableRow>
                <TableCell className='sticky top-0 min-w-[120px] bg-[#F7F8F8] text-center font-bold'>
                  <DropdownFilter
                    column='소속로펌명'
                    options={officeNmOptions}
                    isOpen={isOfficeNmFilterOpen}
                    onToggle={() => setIsOfficeNmFilterOpen((prev) => !prev)}
                    disableUserInfo
                    onFilter={(values) => {
                      const next = values.length >= officeNmOptions.length ? [] : values;
                      setAppliedOfficeNm(next);
                      setTimeout(() => refetchUserList(), 0);
                    }}
                  />
                </TableCell>
                <TableCell className='sticky top-0 min-w-[200px] bg-[#F7F8F8] text-center font-bold'>이메일(아이디)</TableCell>
                <TableCell className='sticky top-0 min-w-[100px] bg-[#F7F8F8] text-center font-bold'>이름</TableCell>
                <TableCell className='sticky top-0 min-w-[70px] bg-[#F7F8F8] text-center font-bold'>생년월일</TableCell>
                <TableCell className='sticky top-0 min-w-[50px] bg-[#F7F8F8] text-center font-bold'>성별</TableCell>
                <TableCell className='sticky top-0 min-w-[120px] bg-[#F7F8F8] text-center font-bold'>전화번호</TableCell>
                <TableCell className='sticky top-0 min-w-[120px] bg-[#F7F8F8] text-center font-bold'>
                  <RangeDropdownFilter
                    column='직접등록한 사건수'
                    value={appliedProjectRequestCount}
                    isOpen={isProjectRequestCountFilterOpen}
                    onToggle={() => setIsProjectRequestCountFilterOpen((prev) => !prev)}
                    placeholders={{
                      min: (allUserFilterOptions as any)?.data?.project_request_count?.min ?? 0,
                      max: (allUserFilterOptions as any)?.data?.project_request_count?.max ?? 0,
                    }}
                    onChange={(next) => {
                      setAppliedProjectRequestCount(next);
                      setTimeout(() => refetchUserList(), 0);
                    }}
                  />
                </TableCell>
                <TableCell className='sticky top-0 min-w-[200px] bg-[#F7F8F8] text-center font-bold'>직접등록한 사건명</TableCell>
                <TableCell className='sticky top-0 min-w-[120px] bg-[#F7F8F8] text-center font-bold'>
                  <RangeDropdownFilter
                    column='참여중인사건수'
                    value={appliedProjectJoinCount}
                    isOpen={isProjectJoinCountFilterOpen}
                    onToggle={() => setIsProjectJoinCountFilterOpen((prev) => !prev)}
                    placeholders={{
                      min: (allUserFilterOptions as any)?.data?.project_join_count?.min ?? 0,
                      max: (allUserFilterOptions as any)?.data?.project_join_count?.max ?? 0,
                    }}
                    onChange={(next) => {
                      setAppliedProjectJoinCount(next);
                      setTimeout(() => refetchUserList(), 0);
                    }}
                  />
                </TableCell>
                <TableCell className='sticky top-0 min-w-[200px] bg-[#F7F8F8] text-center font-bold'>참여중인 사건명</TableCell>
                <TableCell className='sticky top-0 min-w-[120px] bg-[#F7F8F8] text-center font-bold'>회원가입 날짜</TableCell>
                <TableCell className='sticky top-0 min-w-[100px] bg-[#F7F8F8] text-center font-bold'>회원가입 경과일</TableCell>
                <TableCell className='sticky top-0 min-w-[100px] bg-[#F7F8F8] text-center font-bold'>누적로그인수</TableCell>
                <TableCell className='sticky top-0 min-w-[120px] bg-[#F7F8F8] text-center font-bold'>마지막로그인</TableCell>
                <TableCell className='sticky top-0 min-w-[120px] bg-[#F7F8F8] text-center font-bold'>로그인 경과일</TableCell>
                <TableCell className='sticky top-0 min-w-[120px] bg-[#F7F8F8] text-center font-bold'>유입경로</TableCell>
                <TableCell className='sticky top-0 min-w-[120px] bg-[#F7F8F8] text-center font-bold'>유입경로 상세</TableCell>
                <TableCell className='sticky top-0 min-w-[120px] bg-[#F7F8F8] text-center font-bold'>등록번호</TableCell>
                <TableCell className='sticky top-0 min-w-[120px] bg-[#F7F8F8] text-center font-bold'>발급번호</TableCell>
                <TableCell className='sticky top-0 min-w-[150px] bg-[#F7F8F8] text-center font-bold'>
                  <div className='relative flex items-center justify-center gap-1' ref={headerFilterRef}>
                    <span>인증</span>
                    <button
                      className='flex items-center justify-center rounded p-1 hover:bg-gray-200'
                      onClick={() => setIsHeaderFilterOpen(!isHeaderFilterOpen)}
                    >
                      <svg
                        className={`h-4 w-4 transform transition-transform ${isHeaderFilterOpen ? 'rotate-180' : ''}`}
                        fill='none'
                        stroke='currentColor'
                        viewBox='0 0 24 24'
                      >
                        <path strokeLinecap='round' strokeLinejoin='round' strokeWidth={2} d='M19 9l-7 7-7-7' />
                      </svg>
                    </button>

                    {/* 커스텀 드롭다운 */}
                    {isHeaderFilterOpen && (
                      <div className='absolute left-1/2 top-full z-50 mt-1 w-24 -translate-x-1/2 transform rounded-md border border-gray-200 bg-white shadow-lg'>
                        <div className='py-1'>
                          <button
                            className={`block w-full px-3 py-2 text-left text-xs hover:bg-gray-100 ${filters.certify_status === 'ALL' ? 'bg-blue-50 text-blue-600' : ''}`}
                            onClick={() => handleHeaderFilterSelect('ALL')}
                          >
                            전체
                          </button>
                          <button
                            className={`block w-full px-3 py-2 text-left text-xs hover:bg-gray-100 ${filters.certify_status === '미인증' ? 'bg-blue-50 text-blue-600' : ''}`}
                            onClick={() => handleHeaderFilterSelect('미인증')}
                          >
                            미인증
                          </button>
                          <button
                            className={`block w-full px-3 py-2 text-left text-xs hover:bg-gray-100 ${filters.certify_status === '인증대기' ? 'bg-blue-50 text-blue-600' : ''}`}
                            onClick={() => handleHeaderFilterSelect('인증대기')}
                          >
                            인증대기
                          </button>
                          <button
                            className={`block w-full px-3 py-2 text-left text-xs hover:bg-gray-100 ${filters.certify_status === '인증완료' ? 'bg-blue-50 text-blue-600' : ''}`}
                            onClick={() => handleHeaderFilterSelect('인증완료')}
                          >
                            인증완료
                          </button>
                          <button
                            className={`block w-full px-3 py-2 text-left text-xs hover:bg-gray-100 ${filters.certify_status === '인증실패' ? 'bg-blue-50 text-blue-600' : ''}`}
                            onClick={() => handleHeaderFilterSelect('인증실패')}
                          >
                            인증실패
                          </button>
                        </div>
                      </div>
                    )}
                  </div>
                </TableCell>
              </TableRow>
            </thead>
            <tbody>
              {isUserLoading || isUserFetching ? (
                <TableRow>
                  <TableCell colSpan={18} className='py-20 text-center'>
                    <div className='flex flex-col items-center justify-center gap-4'>
                      <div className='relative h-2 w-64 overflow-hidden rounded-full bg-gray-200'>
                        <div className='absolute left-0 top-0 h-full w-1/3 animate-pulse rounded-full bg-gradient-to-r from-blue-400 to-blue-600'></div>
                      </div>
                      <p className='text-sm text-gray-500'>데이터를 불러오는 중...</p>
                    </div>
                  </TableCell>
                </TableRow>
              ) : !users.length ? (
                <TableRow>
                  <TableCell colSpan={18} className='py-20 text-center'>
                    <div className='flex flex-col items-center justify-center gap-4'>
                      <div className='text-6xl text-gray-300'>📋</div>
                      <div>
                        <p className='text-lg font-medium text-gray-600'>회원 정보가 없습니다</p>
                        <p className='mt-1 text-sm text-gray-400'>
                          {filters.certify_status !== 'ALL' || filters.keyword ? '검색 조건을 변경해보세요' : '등록된 회원이 없습니다'}
                        </p>
                      </div>
                    </div>
                  </TableCell>
                </TableRow>
              ) : (
                users.map((user: any, index: number) => (
                  <TableRow key={user.email || index}>
                    <TableCell className='text-center'>{user.office_nm || '-'}</TableCell>
                    <TableCell className='text-center'>{user.email}</TableCell>
                    <TableCell className='text-center'>{user.name}</TableCell>
                    <TableCell className='text-center'>{user.birthdate || '-'}</TableCell>
                    <TableCell className='text-center'>{user.gender || '-'}</TableCell>
                    <TableCell className='text-center'>{user.phone || user.tel || '-'}</TableCell>
                    <TableCell className='text-center'>{user.project_request_count || 0}</TableCell>
                    <TableCell className='text-center'>
                      {user.requested_projects && user.requested_projects.length > 0 ? (
                        <TooltipContainer>
                          <div className='text-blue-600 hover:text-blue-800'>
                            {user.requested_projects.join(', ').length > 20
                              ? `${user.requested_projects.join(', ').substring(0, 20)}...`
                              : user.requested_projects.join(', ')}
                          </div>
                          <TooltipContent className='tooltip-content'>{user.requested_projects.join(', ')}</TooltipContent>
                        </TooltipContainer>
                      ) : (
                        '-'
                      )}
                    </TableCell>
                    <TableCell className='text-center'>{user.project_join_count || 0}</TableCell>
                    <TableCell className='text-center'>
                      {user.projects && user.projects.length > 0 ? (
                        <TooltipContainer>
                          <div className='text-blue-600 hover:text-blue-800'>
                            {user.projects.join(', ').length > 20
                              ? `${user.projects.join(', ').substring(0, 20)}...`
                              : user.projects.join(', ')}
                          </div>
                          <TooltipContent className='tooltip-content'>{user.projects.join(', ')}</TooltipContent>
                        </TooltipContainer>
                      ) : (
                        '-'
                      )}
                    </TableCell>
                    <TableCell className='text-center'>{formatDate(user.createdAt)}</TableCell>
                    <TableCell className='text-center'>{user.join_days || 0}일</TableCell>
                    <TableCell className='text-center'>{user.login_count || 0}</TableCell>
                    <TableCell className='text-center'>{formatDate(user.lastLogin || user.updatedAt)}</TableCell>
                    <TableCell className='text-center'>{user.last_login_days || 0}일</TableCell>
                    <TableCell className='text-center'>{user.registration_source || '-'}</TableCell>
                    <TableCell className='text-center'>{user.registration_source_other || '-'}</TableCell>
                    <TableCell className='text-center'>{user.licenseNumber || '-'}</TableCell>
                    <TableCell className='text-center'>{user.issueNumber || '-'}</TableCell>
                    <TableCell className='flex items-center justify-center text-center'>
                      <Select
                        value={getUserCertificationStatus(user)}
                        onValueChange={(value) => handleCertificationStatusChange(user.email, value)}
                      >
                        <SelectTrigger
                          className='h-6 w-[100px] rounded-full border-none text-xs font-medium shadow-none'
                          style={{
                            ...getCertificationStyle(getUserCertificationStatus(user)),
                            display: 'flex',
                            justifyContent: 'center',
                            alignItems: 'center',
                            gap: '4px',
                            padding: '6px 8px',
                          }}
                        >
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value='미인증'>
                            <div
                              className='flex items-center justify-center rounded-full px-2 py-1 text-xs font-medium text-white'
                              style={{ backgroundColor: '#999999' }}
                            >
                              미인증
                            </div>
                          </SelectItem>
                          <SelectItem value='인증대기'>
                            <div
                              className='flex items-center justify-center rounded-full px-2 py-1 text-xs font-medium text-white'
                              style={{ backgroundColor: '#1890FF' }}
                            >
                              인증대기
                            </div>
                          </SelectItem>
                          <SelectItem value='인증완료'>
                            <div
                              className='flex items-center justify-center rounded-full px-2 py-1 text-xs font-medium text-white'
                              style={{ backgroundColor: '#5B5B5B' }}
                            >
                              인증완료
                            </div>
                          </SelectItem>
                          <SelectItem value='인증실패'>
                            <div
                              className='flex items-center justify-center rounded-full px-2 py-1 text-xs font-medium text-white'
                              style={{ backgroundColor: '#F5222D' }}
                            >
                              인증실패
                            </div>
                          </SelectItem>
                        </SelectContent>
                      </Select>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </tbody>
          </Table>
        </TableBox>

        {/* 인증 상태 변경 확인 모달 */}
        <Dialog open={isConfirmModalOpen} onOpenChange={setIsConfirmModalOpen}>
          <DialogContent className='p-5 sm:max-w-[425px]'>
            <DialogHeader>
              <DialogTitle>인증 상태 변경 확인</DialogTitle>
            </DialogHeader>
            <div className='py-4'>
              {pendingStatusChange && (
                <div className='space-y-2'>
                  <p>
                    <strong>사용자:</strong> {pendingStatusChange.userName} ({pendingStatusChange.userEmail})
                  </p>
                  <p>
                    <strong>현재 상태:</strong> {pendingStatusChange.currentStatus}
                  </p>
                  <p>
                    <strong>변경할 상태:</strong>
                    <span className='pl-2 font-bold text-red-500'>{pendingStatusChange.newStatus}</span>
                  </p>
                  <p className='mt-4 text-sm text-gray-600'>인증 상태를 변경하시겠습니까?</p>
                </div>
              )}
            </div>
            <DialogFooter>
              <Button variant='outline' onClick={handleModalCancel}>
                취소
              </Button>
              <Button onClick={executeCertificationStatusChange}>변경</Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>
      <div className='fixed bottom-0 left-0 right-0 z-0 h-[50px] bg-white pt-2'>
        <EvidencePagination currentPage={currentPage} totalPages={pagination.total_pages || 1} onPageChange={handlePageChange} />
      </div>
    </div>
  );
};

export default UserInfoTable;
