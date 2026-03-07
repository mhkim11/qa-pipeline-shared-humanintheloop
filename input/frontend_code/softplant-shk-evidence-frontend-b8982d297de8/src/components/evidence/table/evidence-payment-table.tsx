import { useState, useEffect, useCallback, useRef, useMemo } from 'react';

import { loadTossPayments } from '@tosspayments/payment-sdk';
import { IoIosCloseCircleOutline } from 'react-icons/io';
import { useSearchParams, useNavigate } from 'react-router-dom';
import { Tooltip } from 'react-tooltip';

import CustomSpinner from '@components/common/spiner';
import { fetchGetProjectListForPaymentManagement } from '@/apis/evidence-api';
import { fetchGetBillingKey } from '@/apis/payment-api';
import { TSubscription, TGetProjectListForPaymentManagementInput, TGetProjectListForPaymentManagementOutput } from '@/apis/type';
import { CaseDetailModal } from '@/components/evidence/modal/case-detail-modal';
import { PaymentDetailModal } from '@/components/evidence/modal/payment-detail-modal';
import { PaymentParticipationModal } from '@/components/evidence/modal/payment-participation-modal';
import { EvidencePagination } from '@/components/evidence/pagination/evidence-pagination';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { onMessageToast } from '@/components/utils';
import { useFindUserInfo } from '@/hooks/react-query';
import { useCreateBillingKey } from '@/hooks/react-query/mutation';
// import { useCancelSubscription } from '@/hooks/react-query/mutation/subscription';
import { useGetCurrentPlan } from '@/hooks/react-query/query/payment/use-get-current-plan';
import { useGetPaymentHistory } from '@/hooks/react-query/query/payment/use-get-payment-history';
import { useGetSubscriptions } from '@/hooks/react-query/query/subscription';

export const PaymentTable = (): JSX.Element => {
  const [searchParams, setSearchParams] = useSearchParams();
  const [selectedSubscription, setSelectedSubscription] = useState<TSubscription | null>(null);
  const [isDetailModalOpen, setIsDetailModalOpen] = useState(false);
  const [activeTab, setActiveTab] = useState<'current-plan' | 'case-list' | 'payment-history' | 'payment-info'>('current-plan');
  const navigate = useNavigate();

  // URL 파라미터에서 탭 정보 읽기
  useEffect(() => {
    const tabParam = searchParams.get('tab');
    const caseId = searchParams.get('caseId');

    if (tabParam && ['current-plan', 'case-list', 'payment-history', 'payment-info'].includes(tabParam)) {
      setActiveTab(tabParam as 'current-plan' | 'case-list' | 'payment-history' | 'payment-info');
    }

    // caseId가 있으면 사건 목록 탭으로 이동하고 URL에 tab 파라미터 설정
    if (caseId) {
      setActiveTab('case-list');
      const newSearchParams = new URLSearchParams(searchParams);
      newSearchParams.set('tab', 'case-list');
      setSearchParams(newSearchParams);
    }
  }, [searchParams, setSearchParams]);
  // 사건목록 페이지네이션 상태
  const [caseListPage, setCaseListPage] = useState(1);
  const [caseListItemsPerPage, setCaseListItemsPerPage] = useState(10);

  // 새로운 API를 위한 상태
  const [projectListData, setProjectListData] = useState<TGetProjectListForPaymentManagementOutput['data'] | null>(null);
  const [isLoadingProjectList, setIsLoadingProjectList] = useState(false);

  // 결제내역 페이지네이션 상태
  const [paymentHistoryPage, setPaymentHistoryPage] = useState(1);
  const [paymentHistoryItemsPerPage, setPaymentHistoryItemsPerPage] = useState(10);

  // 사건목록 필터 상태
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [roleFilter, setRoleFilter] = useState<string>('all');

  // API 필터 상태
  const [filters, setFilters] = useState<Record<string, string[]>>({});

  // 필터 옵션 상태 - 초기값으로 모든 가능한 상태 설정
  const [filterOptions, setFilterOptions] = useState<{
    status: string[];
    project_role: string[];
  }>({
    status: ['진행중', '생성중', '일시중지', '종결', '결제대기'],
    project_role: [],
  });

  // 결제 참여 모달 상태
  const [isPaymentParticipationModalOpen, setIsPaymentParticipationModalOpen] = useState(false);
  const [registeredProjectName, setRegisteredProjectName] = useState<string>('');
  const [registeredProjectId, setRegisteredProjectId] = useState<string>('');
  const [newBillingKey, setNewBillingKey] = useState<string>('');
  const [newCustomerKey, setNewCustomerKey] = useState<string>('');

  // API 훅들
  const { response: findEvidenceUserInfo } = useFindUserInfo();
  const { response: _subscriptionsResponse, isLoading: _isLoadingSubscriptions } = useGetSubscriptions();
  const { data: currentPlanResponse, isLoading: isLoadingCurrentPlan, refetch: refetchCurrentPlan } = useGetCurrentPlan();
  const {
    data: paymentHistoryResponse,
    isLoading: isLoadingPaymentHistory,
    refetch: refetchPaymentHistory,
  } = useGetPaymentHistory({
    project_id: activeTab === 'payment-history' ? '' : '',
    page_no: paymentHistoryPage,
    block_cnt: paymentHistoryItemsPerPage,
  });
  const { mutateAsync: createBillingKeyAsync } = useCreateBillingKey();

  // 폰트 크기 조정 관련
  const fontSizeAdjustment = findEvidenceUserInfo?.data?.font_size_rate || 0;

  // 동적 폰트 크기 조정
  const getAdjustedSize = (baseSize: number) => {
    return baseSize * (1 + fontSizeAdjustment / 100);
  };

  // 폰트 크기 조정 옵션
  const fontSizeClasses = {
    16: ['text-sm', 'text-base', 'text-lg', 'text-xl', 'text-2xl', 'text-3xl', 'text-4xl'],
    14: ['text-xs', 'text-sm', 'text-base', 'text-lg', 'text-xl', 'text-2xl', 'text-3xl'],
    12: ['text-2xs', 'text-xs', 'text-sm', 'text-base', 'text-lg', 'text-xl', 'text-2xl'],
    18: ['text-base', 'text-lg', 'text-xl', 'text-2xl', 'text-3xl', 'text-4xl', 'text-5xl'],
    20: ['text-lg', 'text-xl', 'text-2xl', 'text-3xl', 'text-4xl', 'text-5xl', 'text-6xl'],
    25: ['text-xl', 'text-2xl', 'text-3xl', 'text-4xl', 'text-5xl', 'text-6xl', 'text-7xl'],
  } as const;

  // 폰트 크기 조정 클래스 선택
  const getFontSizeClass = (baseSize: keyof typeof fontSizeClasses, adjustment: number) => {
    const steps = [-30, -20, -10, 0, 10, 20, 30];
    const index = steps.indexOf(adjustment);
    // 지원하지 않는 크기는 16을 기본값으로 사용
    const sizeKey = baseSize in fontSizeClasses ? baseSize : 16;
    return fontSizeClasses[sizeKey as keyof typeof fontSizeClasses][index !== -1 ? index : 3]; // 기본값(0%)은 index 3
  };

  // URL에서 caseId 파라미터 확인
  const urlCaseId = searchParams.get('caseId');

  // 새로운 API를 사용한 사건 목록 조회 함수
  const fetchProjectList = useCallback(async () => {
    setIsLoadingProjectList(true);
    try {
      // 선택된 필터만 포함
      const apiFilters: any = {};

      if (roleFilter !== 'all') {
        apiFilters.project_role = [roleFilter];
      }

      if (statusFilter !== 'all') {
        apiFilters.status = [statusFilter];
      }

      const input: TGetProjectListForPaymentManagementInput = {
        page_no: caseListPage,
        block_cnt: urlCaseId ? 100 : caseListItemsPerPage,
        filters: apiFilters,
      };

      console.log('API 호출 input:', input);
      const response = await fetchGetProjectListForPaymentManagement(input);
      console.log('API 응답:', response);
      if (response.success) {
        setProjectListData(response.data);
        console.log('프로젝트 데이터:', response.data);
        if (response.data.projects && response.data.projects.length > 0) {
          console.log('첫 번째 프로젝트 데이터:', response.data.projects[0]);
          console.log('첫 번째 프로젝트의 모든 키:', Object.keys(response.data.projects[0]));
        }
      }
    } catch (error) {
      console.error('프로젝트 목록 조회 실패:', error);
      onMessageToast({ message: '사건 목록을 불러오는데 실패했습니다.' });
    } finally {
      setIsLoadingProjectList(false);
    }
  }, [caseListPage, caseListItemsPerPage, urlCaseId, roleFilter, statusFilter]);

  // API 호출
  useEffect(() => {
    fetchProjectList();
  }, [fetchProjectList]);

  // 빌링키 조회 상태
  const [billingKeyData, setBillingKeyData] = useState<any>(null);
  const [isLoadingBillingKey, setIsLoadingBillingKey] = useState(false);

  // 카드 삭제 모달 상태
  const [isDeleteCardModalOpen, setIsDeleteCardModalOpen] = useState(false);

  // 사건내역 모달 상태
  const [isCaseDetailModalOpen, setIsCaseDetailModalOpen] = useState(false);
  const [selectedCase, setSelectedCase] = useState<any>(null);

  // 영수증 모달 상태
  const [isReceiptModalOpen, setIsReceiptModalOpen] = useState(false);
  const [selectedReceiptUrl, setSelectedReceiptUrl] = useState<string>('');

  // 결제 내역 상세 모달 상태
  const [isPaymentDetailModalOpen, setIsPaymentDetailModalOpen] = useState(false);
  const [selectedPayment, setSelectedPayment] = useState<any>(null);

  // 빌링키 발급 관련 상태
  const [isBillingKeyCreating, setIsBillingKeyCreating] = useState(false);
  const [processedAuthKey, setProcessedAuthKey] = useState<string | null>(null);
  const [isBillingKeyCompleted, setIsBillingKeyCompleted] = useState(false);
  const billingKeyCreationRef = useRef<boolean>(false);

  // 구독 취소 mutation
  // const { mutate: cancelSubscription } = useCancelSubscription({
  //   onSuccess: () => {
  //     onMessageToast({ message: '구독이 취소되었습니다.' });
  //     refetch(); // 구독 목록 새로고침
  //   },
  //   onError: (error) => {
  //     onMessageToast({ message: '구독 취소 중 오류가 발생했습니다.' });
  //     console.error('구독 취소 오류:', error);
  //   },
  // });

  const _subscriptions = _subscriptionsResponse?.data || [];
  const currentPlans = currentPlanResponse?.data || [];
  const paymentHistory = paymentHistoryResponse?.data?.list || [];
  const paymentHistoryPaging = paymentHistoryResponse?.data?.paging || { total_cnt: 0, total_page: 1, page_no: 1, block_cnt: 50 };

  // 총 결제 금액 계산 (현재 플랜의 합계)
  const totalAmount = currentPlans.reduce((sum: number, plan: any) => sum + (plan.total_amount || 0), 0);

  // 새로운 API 응답 데이터를 사용한 필터링
  const filteredEvidenceList = useMemo(() => {
    const allProjects = projectListData?.projects || [];
    return allProjects;
  }, [projectListData?.projects]);

  // 페이지네이션 정보
  const caseListPaging = (projectListData as any)?.paging || { total_cnt: 0, page_no: 1, block_cnt: 10, total_page: 1 };

  // 필터 옵션 업데이트 함수 - project_role만 업데이트
  const updateFilterOptions = useCallback(() => {
    const allEvidenceList = projectListData?.projects || [];

    setFilterOptions((prev) => ({
      ...prev,
      project_role: Array.from(new Set(allEvidenceList.map((item) => item.project_role))).filter(Boolean),
    }));
  }, [projectListData?.projects]);

  const _handleRegisterCard = async () => {
    const clientKey = import.meta.env.VITE_TOSS_CLIENT_KEY;

    // 클라이언트 키 확인
    if (!clientKey) {
      console.error('VITE_TOSS_CLIENT_KEY가 설정되지 않았습니다.');
      onMessageToast({
        message: '결제 설정이 올바르지 않습니다. 관리자에게 문의해주세요.',
      });
      return;
    }

    try {
      const tossPayments = await loadTossPayments(clientKey);
      console.log('TossPayments 로드 성공');

      // 사용자 ID를 customerKey로 사용
      const userId = findEvidenceUserInfo?.data?.user_id;
      if (!userId) {
        onMessageToast({
          message: '사용자 정보를 찾을 수 없습니다.',
        });
        return;
      }

      const customerKey = `customer_${userId}`;

      await tossPayments.requestBillingAuth('카드', {
        customerKey,
        successUrl: `${window.location.origin}/payment?billingKey=success&customerKey=${customerKey}`,
        failUrl: `${window.location.origin}/billing/fail`,
      });

      console.log('빌링 인증 요청 성공');
    } catch (error) {
      console.error('카드 등록 실패:', error);

      // 에러 타입별 처리
      if (error instanceof Error) {
        console.error('에러 메시지:', error.message);
        onMessageToast({
          message: `카드 등록 실패: ${error.message}`,
        });
      } else {
        console.error('알 수 없는 에러:', error);
        onMessageToast({
          message: '카드 등록 중 오류가 발생했습니다. 다시 시도해주세요.',
        });
      }
    }
  };

  // 카드 삭제 핸들러
  const handleDeleteCard = () => {
    setIsDeleteCardModalOpen(true);
  };

  // 카드 삭제 확인 핸들러
  const handleConfirmDeleteCard = async () => {
    // 카드 삭제 모달 닫기
    setIsDeleteCardModalOpen(false);

    // 빌링키 처리 플래그 리셋
    setProcessedAuthKey(null);
    billingKeyCreationRef.current = false;
    setIsBillingKeyCompleted(false);

    // 바로 카드 등록 화면으로 이동 (빌링키 발급)
    await _handleRegisterCard();
  };

  // 빌링키 조회 함수
  const fetchBillingKeyData = useCallback(async () => {
    if (!findEvidenceUserInfo?.data?.user_id) return;

    setIsLoadingBillingKey(true);
    try {
      const customerKey = `customer_${findEvidenceUserInfo.data.user_id}`;
      console.log('빌링키 조회 시작:', { customerKey, userId: findEvidenceUserInfo.data.user_id });

      const response = await fetchGetBillingKey(customerKey, '');
      console.log('빌링키 조회 응답:', response);

      if (response.success && response.data) {
        setBillingKeyData(response.data);
        console.log('빌링키 데이터 설정 완료:', response.data);
      } else {
        setBillingKeyData(null);
        console.log('빌링키 데이터 없음');
      }
    } catch (error) {
      console.error('빌링키 조회 실패:', error);
      setBillingKeyData(null);
    } finally {
      setIsLoadingBillingKey(false);
    }
  }, [findEvidenceUserInfo?.data?.user_id]);

  // 빌링키 발급 핸들러
  const handleBillingKeyCreation = useCallback(async () => {
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
    setIsBillingKeyCreating(true);

    console.log('빌링키 발급 시작:', { customerKey, authKey });
    console.log('createBillingKey API 호출 시작');

    try {
      // mutateAsync를 사용하여 직접 응답 처리
      const billingResponse = await createBillingKeyAsync({ customerKey, authKey });

      console.log('=== 빌링키 생성 API 성공 ===');
      console.log('빌링키 생성 성공 - 전체 응답:', billingResponse);
      // 실제 응답 구조에 맞춰 처리
      if (billingResponse.success === true) {
        console.log('빌링키 생성 성공 - 성공 처리 시작');

        // 즉시 플래그 리셋하여 중복 호출 방지
        billingKeyCreationRef.current = false;
        setProcessedAuthKey(null);
        setIsBillingKeyCompleted(true);

        // 완료 토스트 메시지 표시
        onMessageToast({
          message: '카드 등록이 완료되었습니다.',
        });

        setTimeout(() => {
          setIsBillingKeyCreating(false);
        }, 300);

        // 결제정보 탭 유지를 위해 직접 탭 설정
        setActiveTab('payment-info');

        // URL에서 빌링키 관련 파라미터 제거 (먼저 실행)
        const newSearchParams = new URLSearchParams(searchParams);
        newSearchParams.delete('billingKey');
        newSearchParams.delete('customerKey');
        newSearchParams.delete('authKey');
        // 결제정보 탭 유지를 위해 탭 파라미터 추가
        newSearchParams.set('tab', 'payment-info');
        console.log('URL 파라미터 설정:', newSearchParams.toString());
        setSearchParams(newSearchParams);

        // 빌링키 데이터 새로고침 (URL 파라미터 제거 후)
        setTimeout(() => {
          fetchBillingKeyData();
        }, 1000); // 1초 지연으로 서버 반영 시간 확보
      } else {
        console.error('빌링키 생성 실패:', billingResponse.message);

        // 실패 토스트 메시지 표시
        onMessageToast({
          message: `빌링키 생성에 실패했습니다: ${billingResponse.message || '알 수 없는 오류'}`,
        });

        // 토스트 메시지 표시 후 모달 닫기 (2초 지연)
        setTimeout(() => {
          setIsBillingKeyCreating(false);
          setProcessedAuthKey(null); // 실패 시 authKey 리셋
          billingKeyCreationRef.current = false; // 실패 시 ref 리셋
        }, 300);
      }
    } catch (error: any) {
      console.log('=== 빌링키 생성 API 에러 ===');
      console.error('빌링키 생성 실패:', error);

      // 실패 토스트 메시지 표시
      onMessageToast({
        message: `빌링키 생성에 실패했습니다: ${error?.response?.data?.message || error?.message || '알 수 없는 오류'}`,
      });

      // 토스트 메시지 표시 후 모달 닫기 (2초 지연)
      setTimeout(() => {
        setIsBillingKeyCreating(false);
        setProcessedAuthKey(null); // 실패 시 authKey 리셋
        billingKeyCreationRef.current = false; // 실패 시 ref 리셋
      }, 300);
    }
  }, [createBillingKeyAsync, fetchBillingKeyData, setSearchParams]); // eslint-disable-line react-hooks/exhaustive-deps

  // const handleCancelSubscription = (subscriptionId: string) => {
  //   if (window.confirm('정말로 구독을 취소하시겠습니까?')) {
  //     cancelSubscription(subscriptionId);
  //   }
  // };

  const _handleDetailView = (subscription: TSubscription) => {
    setSelectedSubscription(subscription);
    setIsDetailModalOpen(true);
  };

  // 사건내역 모달 핸들러
  const handleCaseDetailView = useCallback((caseData: any) => {
    console.log('모달에 전달할 데이터:', caseData);
    setSelectedCase(caseData);
    setIsCaseDetailModalOpen(true);
  }, []);

  // 사건 상태 변경 시 데이터 리패치
  const handleCaseStatusChange = () => {
    // 현재 플랜 데이터 리패치
    refetchCurrentPlan();
    // 사건 목록 데이터 리패치
    fetchProjectList();
  };

  // 결제 내역 상세 모달 핸들러
  const handlePaymentDetailView = (payment: any) => {
    setSelectedPayment(payment);
    setIsPaymentDetailModalOpen(true);
  };

  // 영수증 모달 핸들러
  const handleReceiptView = (receiptUrl: string) => {
    setSelectedReceiptUrl(receiptUrl);
    setIsReceiptModalOpen(true);
  };

  // 사건목록 페이지네이션 핸들러
  const handleCaseListPageChange = (page: number) => {
    setCaseListPage(page);
  };

  const _handleCaseListItemsPerPageChange = (itemsPerPage: number) => {
    setCaseListItemsPerPage(itemsPerPage);
    setCaseListPage(1); // 페이지를 1로 리셋
  };

  // 결제내역 페이지네이션 핸들러
  const handlePaymentHistoryPageChange = (page: number) => {
    setPaymentHistoryPage(page);
  };

  const _handlePaymentHistoryItemsPerPageChange = (itemsPerPage: number) => {
    setPaymentHistoryItemsPerPage(itemsPerPage);
    setPaymentHistoryPage(1); // 페이지를 1로 리셋
  };

  // 필터 핸들러
  const handleStatusFilterChange = (status: string) => {
    setStatusFilter(status);
    setCaseListPage(1); // 필터 변경 시 페이지를 1로 리셋

    // 클라이언트 필터 업데이트 - 기존 필터 유지
    setFilters((prevFilters) => {
      const newFilters = { ...prevFilters };
      if (status === 'all') {
        delete newFilters.status;
      } else {
        newFilters.status = [status];
      }
      console.log('Status filter updated:', newFilters);
      return newFilters;
    });
  };

  const handleRoleFilterChange = (role: string) => {
    setRoleFilter(role);
    setCaseListPage(1); // 필터 변경 시 페이지를 1로 리셋

    // 클라이언트 필터 업데이트 - 기존 필터 유지
    setFilters((prevFilters) => {
      const newFilters = { ...prevFilters };
      if (role === 'all') {
        delete newFilters.project_role;
      } else {
        newFilters.project_role = [role];
      }
      console.log('Role filter updated:', newFilters);
      return newFilters;
    });
  };

  // 빌링키 생성 완료 시 백엔드 API 호출 (중복 제거)
  useEffect(() => {
    const billingKeyStatus = searchParams.get('billingKey');
    const paymentStatus = searchParams.get('payment');
    const isBillCreate = searchParams.get('isBillCreate');
    const customerKey = searchParams.get('customerKey');
    const authKey = searchParams.get('authKey');
    const projectId = searchParams.get('projectId');
    const projectName = searchParams.get('projectName');
    const _userId = searchParams.get('userId');

    console.log('useEffect 실행:', {
      billingKeyStatus,
      paymentStatus,
      isBillCreate,
      customerKey,
      authKey,
      processedAuthKey,
      isBillingKeyCreating,
    });

    // 기존 빌링키 생성 로직
    if (
      billingKeyStatus === 'success' &&
      customerKey &&
      authKey &&
      processedAuthKey !== authKey &&
      !billingKeyCreationRef.current &&
      !isBillingKeyCompleted
    ) {
      console.log('빌링키 생성 성공 - 백엔드 API 호출 시작:', { customerKey, authKey });
      // 직접 handleBillingKeyCreation 로직 실행
      handleBillingKeyCreation();
    }

    // 결제 참여 모달에서 빌링키 발급 성공 시 처리
    if (paymentStatus === 'success' && isBillCreate === 'true' && projectId && projectName) {
      console.log('결제 참여 모달 빌링키 발급 성공 - 결제 참여 모달 열기');

      // 결제 참여 모달 열기 - 모달 내부에서 빌링키 조회 및 결제 처리
      setRegisteredProjectName(decodeURIComponent(projectName));
      setRegisteredProjectId(projectId);
      setIsPaymentParticipationModalOpen(true);
    }

    // URL 파라미터가 없어지면 로딩 모달 강제로 닫기
    if (!billingKeyStatus && !paymentStatus && !customerKey && !authKey && isBillingKeyCreating) {
      console.log('URL 파라미터 제거됨, 로딩 모달 강제 닫기');
      setIsBillingKeyCreating(false);
      billingKeyCreationRef.current = false;
      setProcessedAuthKey(null);
      setIsBillingKeyCompleted(false);
    }
  }, [searchParams, processedAuthKey, isBillingKeyCreating, isBillingKeyCompleted, handleBillingKeyCreation]); // searchParams를 dependency에 추가하여 URL 변경 시 재실행

  // 사건 목록 데이터가 변경될 때 필터 옵션 업데이트
  useEffect(() => {
    if (projectListData?.projects && projectListData.projects.length > 0) {
      updateFilterOptions();
    }
  }, [projectListData?.projects, updateFilterOptions]);

  // 필터 상태 변경 디버깅
  useEffect(() => {
    console.log('Current filters state:', filters);
  }, [filters]);

  // statusFilter가 변경될 때마다 API 재호출
  useEffect(() => {
    if (statusFilter) {
      console.log('Status filter changed, refetching data:', statusFilter);
      fetchProjectList();
    }
  }, [statusFilter, fetchProjectList]);

  // caseId 파라미터 처리 - 데이터 로드 후 실행
  useEffect(() => {
    const caseId = searchParams.get('caseId');

    if (caseId && projectListData?.projects && projectListData.projects.length > 0) {
      const targetCase = projectListData.projects.find((project) => project.project_id === caseId);

      if (targetCase) {
        // 약간의 지연을 두고 모달 열기
        setTimeout(() => {
          handleCaseDetailView(targetCase);
        }, 100);

        // URL에서 caseId 파라미터 제거
        const newSearchParams = new URLSearchParams(searchParams);
        newSearchParams.delete('caseId');
        setSearchParams(newSearchParams);
      }
    }
  }, [projectListData?.projects, searchParams, setSearchParams, handleCaseDetailView]);

  // 탭 변경 시 필요한 데이터 리패치
  useEffect(() => {
    if (activeTab === 'payment-history') {
      console.log('결제 내역 탭 - 데이터 리패치');
      refetchPaymentHistory();
    } else if (activeTab === 'payment-info') {
      console.log('결제정보 탭 - 빌링키 조회');
      if (findEvidenceUserInfo?.data?.user_id) {
        fetchBillingKeyData();
      }
    }
  }, [activeTab, refetchPaymentHistory, fetchBillingKeyData, findEvidenceUserInfo?.data?.user_id]);

  return (
    <div className='mb-20 flex w-full justify-center overflow-auto pt-[120px]'>
      <div className='w-full max-w-[1200px] px-4 md:px-6 lg:px-8'>
        <h1 className={`mb-8 font-bold ${getFontSizeClass(20, fontSizeAdjustment)}`} style={{ fontSize: `${getAdjustedSize(20)}px` }}>
          결제 관리
        </h1>

        {/* 탭 버튼들 */}
        <div className='mb-6 flex space-x-2 overflow-x-auto pb-2 md:space-x-3'>
          <button
            onClick={() => {
              setActiveTab('current-plan');
              const newSearchParams = new URLSearchParams(searchParams);
              newSearchParams.set('tab', 'current-plan');
              setSearchParams(newSearchParams);
            }}
            className={`px-2 py-2 font-semibold transition-colors ${getFontSizeClass(18, fontSizeAdjustment)} ${activeTab === 'current-plan' ? 'border-b-3 border-[#212121] text-[#212121]' : 'text-[#7D7D7D] hover:text-[#212121]'}`}
            style={{ fontSize: `${getAdjustedSize(18)}px` }}
          >
            현재 플랜
          </button>
          <button
            onClick={() => {
              setActiveTab('case-list');
              const newSearchParams = new URLSearchParams(searchParams);
              newSearchParams.set('tab', 'case-list');
              setSearchParams(newSearchParams);
            }}
            className={`px-2 py-2 font-semibold transition-colors ${getFontSizeClass(18, fontSizeAdjustment)} ${activeTab === 'case-list' ? 'border-b-3 border-[#212121] text-[#212121]' : 'text-[#7D7D7D] hover:text-[#212121]'}`}
            style={{ fontSize: `${getAdjustedSize(18)}px` }}
          >
            사건 목록
          </button>
          <button
            onClick={() => {
              setActiveTab('payment-history');
              const newSearchParams = new URLSearchParams(searchParams);
              newSearchParams.set('tab', 'payment-history');
              setSearchParams(newSearchParams);
            }}
            className={`px-2 py-2 font-semibold transition-colors ${getFontSizeClass(18, fontSizeAdjustment)} ${activeTab === 'payment-history' ? 'border-b-3 border-[#212121] text-[#212121]' : 'text-[#7D7D7D] hover:text-[#212121]'}`}
            style={{ fontSize: `${getAdjustedSize(18)}px` }}
          >
            결제 내역
          </button>
          <button
            onClick={() => {
              setActiveTab('payment-info');
              const newSearchParams = new URLSearchParams(searchParams);
              newSearchParams.set('tab', 'payment-info');
              setSearchParams(newSearchParams);
            }}
            className={`px-2 py-2 font-semibold transition-colors ${getFontSizeClass(18, fontSizeAdjustment)} ${activeTab === 'payment-info' ? 'border-b-3 border-[#212121] text-[#212121]' : 'text-[#7D7D7D] hover:text-[#212121]'}`}
            style={{ fontSize: `${getAdjustedSize(18)}px` }}
          >
            결제정보
          </button>
        </div>

        {/* 탭 내용 */}
        {activeTab === 'current-plan' && (
          <div className='px-2 md:px-4 lg:pl-[10px]'>
            {/* 현재 구독 정보 */}
            <div className='mt-[24px] md:mt-[32px] lg:mt-[44px]'>
              <div className='flex flex-col gap-4 md:flex-row md:justify-between'>
                <div className='w-full flex-1 md:w-[50%]'>
                  {/* 현재 월 */}
                  <h2
                    className={`font-bold text-[#5B5B5B] ${getFontSizeClass(14, fontSizeAdjustment)}`}
                    style={{ fontSize: `${getAdjustedSize(14)}px` }}
                  >
                    {new Date().getMonth() + 1}월 결제 금액
                  </h2>
                  {isLoadingCurrentPlan ? (
                    <div className='py-8 text-center text-gray-500'>
                      <CustomSpinner />
                    </div>
                  ) : currentPlans.length === 0 ? (
                    <div className='flex flex-col justify-center'>
                      <p
                        className={`pt-10 text-center text-gray-500 ${getFontSizeClass(14, fontSizeAdjustment)}`}
                        style={{ fontSize: `${getAdjustedSize(14)}px` }}
                      >
                        구독 정보가 없습니다.
                      </p>
                      <button
                        className={`text-center font-semibold text-[#1890FF] ${getFontSizeClass(16, fontSizeAdjustment)}`}
                        style={{ fontSize: `${getAdjustedSize(14)}px` }}
                        onClick={() => navigate('/subscription')}
                      >
                        자세히 보기
                      </button>
                    </div>
                  ) : (
                    <div className='space-y-[8px]'>
                      <div>
                        <div className='flex items-center'>
                          <p
                            className={`font-bold text-[#000] ${getFontSizeClass(25, fontSizeAdjustment)}`}
                            style={{ fontSize: `${getAdjustedSize(25)}px` }}
                          >
                            {totalAmount.toLocaleString()}
                          </p>
                          <p
                            className={`font-bold text-[#000] ${getFontSizeClass(20, fontSizeAdjustment)}`}
                            style={{ fontSize: `${getAdjustedSize(20)}px` }}
                          >
                            원
                          </p>
                        </div>

                        <p
                          className={`text-[#898989] ${getFontSizeClass(14, fontSizeAdjustment)}`}
                          style={{ fontSize: `${getAdjustedSize(14)}px` }}
                        >
                          *구독중인 사건 결제 금액의 합계입니다.
                        </p>
                      </div>
                    </div>
                  )}
                </div>
                {currentPlans.length > 0 && (
                  <div className='w-full flex-1 md:w-[50%]'>
                    <h2
                      className={`font-bold text-[#5B5B5B] ${getFontSizeClass(14, fontSizeAdjustment)}`}
                      style={{ fontSize: `${getAdjustedSize(14)}px` }}
                    >
                      사용중인 플랜
                    </h2>
                    <div className='space-y-[8px]'>
                      <div>
                        <div className='flex items-end justify-between'>
                          <p
                            className={`font-bold text-[#000] ${getFontSizeClass(20, fontSizeAdjustment)}`}
                            style={{ fontSize: `${getAdjustedSize(20)}px` }}
                          >
                            기본 플랜
                          </p>
                          <button
                            className={`font-semibold text-[#1890FF] ${getFontSizeClass(16, fontSizeAdjustment)}`}
                            style={{ fontSize: `${getAdjustedSize(16)}px` }}
                            onClick={() => navigate('/subscription')}
                          >
                            자세히보기
                          </button>
                        </div>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            </div>

            {/* 현재 플랜 목록 */}
            {currentPlans.length > 0 && (
              <div className='mt-[24px] md:mt-[32px] lg:mt-[44px]'>
                <h2
                  className={`text-[#616161] ${getFontSizeClass(14, fontSizeAdjustment)}`}
                  style={{ fontSize: `${getAdjustedSize(14)}px` }}
                >
                  결제중인 사건
                </h2>
                <div className='-mx-2 overflow-x-auto px-2 md:-mx-4 md:px-4 lg:mx-0 lg:px-0'>
                  <table className='mt-[12px] w-full min-w-[600px]'>
                    <thead>
                      <tr className='] border-b bg-[#F7F8F8]'>
                        <th
                          className={`px-2 py-2 text-left font-medium text-gray-700 md:px-4 md:py-3 ${getFontSizeClass(14, fontSizeAdjustment)}`}
                          style={{ fontSize: `${getAdjustedSize(14)}px` }}
                        >
                          사건 상태
                        </th>
                        <th
                          className={`px-2 py-2 text-left font-medium text-gray-700 md:px-4 md:py-3 ${getFontSizeClass(14, fontSizeAdjustment)}`}
                          style={{ fontSize: `${getAdjustedSize(14)}px` }}
                        >
                          사건명
                        </th>
                        <th
                          className={`px-2 py-2 text-left font-medium text-gray-700 md:px-4 md:py-3 ${getFontSizeClass(14, fontSizeAdjustment)}`}
                          style={{ fontSize: `${getAdjustedSize(14)}px` }}
                        >
                          내권한
                        </th>
                        <th
                          className={`px-2 py-2 text-left font-medium text-gray-700 md:px-4 md:py-3 ${getFontSizeClass(14, fontSizeAdjustment)}`}
                          style={{ fontSize: `${getAdjustedSize(14)}px` }}
                        >
                          결제금액
                        </th>
                        <th
                          className={`px-2 py-2 text-center font-medium text-gray-700 md:px-4 md:py-3 ${getFontSizeClass(14, fontSizeAdjustment)}`}
                          style={{ fontSize: `${getAdjustedSize(14)}px` }}
                        >
                          구독 정보
                        </th>
                      </tr>
                    </thead>
                    <tbody>
                      {currentPlans.map((plan: any) => (
                        <tr key={plan.project_id} className='h-[50px] border-b border-[#F7F8F8] text-[#212121]'>
                          <td
                            className={`px-2 py-2 md:px-4 md:py-3 ${getFontSizeClass(14, fontSizeAdjustment)}`}
                            style={{ fontSize: `${getAdjustedSize(14)}px` }}
                          >
                            {plan.status}
                          </td>
                          <td
                            className={`px-2 py-2 font-medium md:px-4 md:py-3 ${getFontSizeClass(14, fontSizeAdjustment)}`}
                            style={{ fontSize: `${getAdjustedSize(14)}px` }}
                          >
                            {plan.project_nm}
                          </td>
                          <td
                            className={`px-2 py-2 md:px-4 md:py-3 ${getFontSizeClass(14, fontSizeAdjustment)}`}
                            style={{ fontSize: `${getAdjustedSize(14)}px` }}
                          >
                            {plan.user_role}
                          </td>
                          <td
                            className={`px-2 py-2 font-medium md:px-4 md:py-3 ${getFontSizeClass(14, fontSizeAdjustment)}`}
                            style={{ fontSize: `${getAdjustedSize(14)}px` }}
                          >
                            {plan.total_amount.toLocaleString()}원
                          </td>
                          <td className='space-x-2 px-2 py-2 text-center md:px-4 md:py-3'>
                            <button
                              onClick={() => handleCaseDetailView(plan)}
                              className={`text-blue-500 hover:text-blue-700 ${getFontSizeClass(14, fontSizeAdjustment)}`}
                              style={{ fontSize: `${getAdjustedSize(14)}px` }}
                            >
                              구독 정보
                            </button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            )}
          </div>
        )}

        {activeTab === 'case-list' && (
          <div className='px-2 md:px-4 lg:pl-[10px]'>
            <div className='mt-[24px] md:mt-[32px] lg:mt-[44px]'>
              <div className='flex flex-col gap-4 md:flex-row md:items-center md:justify-between'>
                <h2
                  className={`text-[#616161] ${getFontSizeClass(14, fontSizeAdjustment)}`}
                  style={{ fontSize: `${getAdjustedSize(14)}px` }}
                >
                  사건 목록
                </h2>

                {/* 필터 셀렉트 박스 */}
                <div className='flex flex-wrap items-center gap-2 md:space-x-4'>
                  <div className='flex items-center space-x-2'>
                    <Select value={statusFilter} onValueChange={handleStatusFilterChange}>
                      <SelectTrigger className='h-8 w-28 md:w-32'>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value='all'>상태 전체</SelectItem>
                        {filterOptions.status.map((status) => (
                          <SelectItem key={status} value={status}>
                            {status === '진행중'
                              ? '진행중'
                              : status === '종결'
                                ? '종결'
                                : status === '생성중'
                                  ? '생성중'
                                  : status === '일시중지'
                                    ? '일시중지'
                                    : status}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  <div className='flex items-center space-x-2'>
                    <Select value={roleFilter} onValueChange={handleRoleFilterChange}>
                      <SelectTrigger className='h-8 w-32 md:w-40'>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value='all'>권한 전체</SelectItem>
                        <SelectItem value='사건관리자'>사건관리자</SelectItem>
                        <SelectItem value='일반권한'>일반권한</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
              </div>
              <div className='-mx-2 overflow-x-auto px-2 md:-mx-4 md:px-4 lg:mx-0 lg:px-0'>
                <table className='mt-[12px] w-full min-w-[600px]'>
                  <thead>
                    <tr className='border-b border-[#F7F8F8] bg-[#F7F8F8] text-[#212121]'>
                      <th
                        className={`px-2 py-2 text-left font-medium md:px-4 md:py-3 ${getFontSizeClass(14, fontSizeAdjustment)}`}
                        style={{ fontSize: `${getAdjustedSize(14)}px` }}
                      >
                        사건 상태
                      </th>
                      <th
                        className={`px-2 py-2 text-left font-medium md:px-4 md:py-3 ${getFontSizeClass(14, fontSizeAdjustment)}`}
                        style={{ fontSize: `${getAdjustedSize(14)}px` }}
                      >
                        사건명
                      </th>
                      <th
                        className={`px-2 py-2 text-left font-medium md:px-4 md:py-3 ${getFontSizeClass(14, fontSizeAdjustment)}`}
                        style={{ fontSize: `${getAdjustedSize(14)}px` }}
                      >
                        내권한
                      </th>
                      <th
                        className={`px-2 py-2 text-left font-medium md:px-4 md:py-3 ${getFontSizeClass(14, fontSizeAdjustment)}`}
                        style={{ fontSize: `${getAdjustedSize(14)}px` }}
                      >
                        결제금액
                      </th>
                      <th
                        className={`px-2 py-2 text-center font-medium md:px-4 md:py-3 ${getFontSizeClass(14, fontSizeAdjustment)}`}
                        style={{ fontSize: `${getAdjustedSize(14)}px` }}
                      >
                        구독 정보
                      </th>
                    </tr>
                  </thead>
                  <tbody>
                    {isLoadingProjectList ? (
                      <tr>
                        <td colSpan={5} className='py-8 text-center text-gray-500'>
                          <CustomSpinner />
                        </td>
                      </tr>
                    ) : filteredEvidenceList.length === 0 ? (
                      <tr>
                        <td
                          colSpan={5}
                          className={`py-8 text-center text-gray-500 ${getFontSizeClass(14, fontSizeAdjustment)}`}
                          style={{ fontSize: `${getAdjustedSize(14)}px` }}
                        >
                          사건이 없습니다.
                        </td>
                      </tr>
                    ) : (
                      filteredEvidenceList.map((evidence, _index) => {
                        console.log('테이블 행 데이터:', evidence);
                        return (
                          <tr key={evidence.project_id} className='border-b'>
                            <td
                              className={`px-2 py-2 md:px-4 md:py-3 ${getFontSizeClass(14, fontSizeAdjustment)}`}
                              style={{ fontSize: `${getAdjustedSize(14)}px` }}
                            >
                              {evidence.status}
                            </td>
                            <td
                              className={`px-2 py-2 font-medium text-gray-900 md:px-4 md:py-3 ${getFontSizeClass(14, fontSizeAdjustment)}`}
                              style={{ fontSize: `${getAdjustedSize(14)}px` }}
                            >
                              {evidence.project_nm}
                            </td>
                            <td
                              className={`px-2 py-2 text-gray-600 md:px-4 md:py-3 ${getFontSizeClass(14, fontSizeAdjustment)}`}
                              style={{ fontSize: `${getAdjustedSize(14)}px` }}
                            >
                              {evidence.project_role}
                            </td>
                            <td
                              className={`px-2 py-2 font-medium text-gray-900 md:px-4 md:py-3 ${getFontSizeClass(14, fontSizeAdjustment)}`}
                              style={{ fontSize: `${getAdjustedSize(14)}px` }}
                            >
                              {evidence.has_subscription ? `${evidence.subscription_amount.toLocaleString()}원` : '0원'}
                            </td>
                            <td className='space-x-2 px-2 py-2 text-center md:px-4 md:py-3'>
                              <button
                                onClick={() => handleCaseDetailView(evidence)}
                                className={`text-blue-500 hover:text-blue-700 ${getFontSizeClass(14, fontSizeAdjustment)}`}
                                style={{ fontSize: `${getAdjustedSize(14)}px` }}
                              >
                                구독 정보
                              </button>
                            </td>
                          </tr>
                        );
                      })
                    )}
                  </tbody>
                </table>
              </div>

              {/* 페이지네이션 */}
              {filteredEvidenceList.length > 0 && (
                <div className='mt-[26px] flex items-center justify-center'>
                  <div className='flex items-center'>
                    <EvidencePagination
                      currentPage={caseListPage}
                      totalPages={caseListPaging.total_page}
                      onPageChange={handleCaseListPageChange}
                    />
                  </div>
                </div>
              )}
            </div>
          </div>
        )}

        {activeTab === 'payment-history' && (
          <div className='px-2 md:px-4 lg:pl-[10px]'>
            <div className='mt-[24px] md:mt-[32px] lg:mt-[44px]'>
              <h2 className={`text-[#616161] ${getFontSizeClass(14, fontSizeAdjustment)}`} style={{ fontSize: `${getAdjustedSize(14)}px` }}>
                결제 내역
              </h2>
              <div className='-mx-2 overflow-x-auto px-2 md:-mx-4 md:px-4 lg:mx-0 lg:px-0'>
                <table className='mt-[12px] w-full min-w-[900px]'>
                  <thead>
                    <tr className='border-b border-[#F7F8F8] bg-[#F7F8F8] text-[#212121]'>
                      <th
                        className={`px-2 py-2 text-left font-medium text-gray-700 md:px-4 md:py-3 ${getFontSizeClass(14, fontSizeAdjustment)}`}
                        style={{ fontSize: `${getAdjustedSize(14)}px` }}
                      >
                        결제일자
                      </th>
                      <th
                        className={`px-2 py-2 text-left font-medium md:px-4 md:py-3 ${getFontSizeClass(14, fontSizeAdjustment)}`}
                        style={{ fontSize: `${getAdjustedSize(14)}px` }}
                      >
                        사건명
                      </th>
                      <th
                        className={`px-2 py-2 text-left font-medium md:px-4 md:py-3 ${getFontSizeClass(14, fontSizeAdjustment)}`}
                        style={{ fontSize: `${getAdjustedSize(14)}px` }}
                      >
                        결제유형
                      </th>
                      <th
                        className={`px-2 py-2 text-left font-medium md:px-4 md:py-3 ${getFontSizeClass(14, fontSizeAdjustment)}`}
                        style={{ fontSize: `${getAdjustedSize(14)}px` }}
                      >
                        이용자
                      </th>
                      <th
                        className={`px-2 py-2 text-left font-medium md:px-4 md:py-3 ${getFontSizeClass(14, fontSizeAdjustment)}`}
                        style={{ fontSize: `${getAdjustedSize(14)}px` }}
                      >
                        결제금액
                      </th>
                      <th
                        className={`px-2 py-2 text-left font-medium md:px-4 md:py-3 ${getFontSizeClass(14, fontSizeAdjustment)}`}
                        style={{ fontSize: `${getAdjustedSize(14)}px` }}
                      >
                        결제일
                      </th>
                      <th
                        className={`px-2 py-2 text-left font-medium md:px-4 md:py-3 ${getFontSizeClass(14, fontSizeAdjustment)}`}
                        style={{ fontSize: `${getAdjustedSize(14)}px` }}
                      >
                        결제상태
                      </th>
                      <th
                        className={`px-2 py-2 text-left font-medium md:px-4 md:py-3 ${getFontSizeClass(14, fontSizeAdjustment)}`}
                        style={{ fontSize: `${getAdjustedSize(14)}px` }}
                      >
                        결제카드정보
                      </th>
                      <th
                        className={`px-2 py-2 text-center font-medium md:px-4 md:py-3 ${getFontSizeClass(14, fontSizeAdjustment)}`}
                        style={{ fontSize: `${getAdjustedSize(14)}px` }}
                      >
                        영수증
                      </th>
                    </tr>
                  </thead>
                  <tbody>
                    {isLoadingPaymentHistory ? (
                      <tr>
                        <td colSpan={9} className='py-8 text-center text-gray-500'>
                          <CustomSpinner />
                        </td>
                      </tr>
                    ) : paymentHistory.length === 0 ? (
                      <tr>
                        <td
                          colSpan={9}
                          className={`py-8 text-center text-gray-500 ${getFontSizeClass(14, fontSizeAdjustment)}`}
                          style={{ fontSize: `${getAdjustedSize(14)}px` }}
                        >
                          결제 내역이 없습니다.
                        </td>
                      </tr>
                    ) : (
                      paymentHistory.map((payment, _index) => {
                        // 디버깅용 로그 - 각 결제 항목 확인
                        console.log('Payment Item Debug:', {
                          payment,
                          record_type: payment.record_type,
                          card_name: payment.card_name,
                          card_last4: payment.card_last4,
                          receipt_url: payment.receipt_url,
                          isCompleted: payment.record_type === '결제 완료',
                          hasCardInfo: payment.card_name && payment.card_last4,
                          hasReceipt: payment.receipt_url,
                        });

                        return (
                          <tr key={payment.payment_id} className='h-[50px] border-b'>
                            <td
                              className={`px-2 py-2 text-gray-600 md:px-4 md:py-3 ${getFontSizeClass(14, fontSizeAdjustment)}`}
                              style={{ fontSize: `${getAdjustedSize(14)}px` }}
                            >
                              {payment.record_type === '결제 완료' && payment.payment_date
                                ? new Date(payment.payment_date).toLocaleDateString('ko-KR')
                                : '-'}
                            </td>
                            <td
                              className={`px-2 py-2 font-medium text-gray-900 md:px-4 md:py-3 ${getFontSizeClass(14, fontSizeAdjustment)}`}
                              style={{ fontSize: `${getAdjustedSize(14)}px` }}
                              {...(payment.project_nm &&
                                payment.project_nm !== '-' && {
                                  'data-tooltip-id': 'payment-tooltip',
                                  'data-tooltip-content': payment.project_nm,
                                })}
                            >
                              <div className='max-w-[200px] truncate md:max-w-[200px] 2xl:max-w-[350px]'>{payment.project_nm || '-'}</div>
                            </td>
                            <td
                              className={`px-2 py-2 text-gray-600 md:px-4 md:py-3 ${getFontSizeClass(14, fontSizeAdjustment)}`}
                              style={{ fontSize: `${getAdjustedSize(14)}px` }}
                            >
                              {payment.payment_type === 'case_subscription'
                                ? '사건구독'
                                : payment.payment_type === 'case_participation'
                                  ? '사건 참여'
                                  : payment.payment_type}
                            </td>
                            <td
                              className={`px-2 py-2 text-gray-600 md:px-4 md:py-3 ${getFontSizeClass(14, fontSizeAdjustment)}`}
                              style={{ fontSize: `${getAdjustedSize(14)}px` }}
                            >
                              {payment.user_name || (payment as any).email || '-'}
                            </td>
                            <td
                              className={`px-2 py-2 font-medium text-gray-900 md:px-4 md:py-3 ${getFontSizeClass(14, fontSizeAdjustment)}`}
                              style={{ fontSize: `${getAdjustedSize(14)}px` }}
                            >
                              {(payment.amount || 0).toLocaleString()}원
                            </td>
                            <td
                              className={`px-2 py-2 text-gray-600 md:px-4 md:py-3 ${getFontSizeClass(14, fontSizeAdjustment)}`}
                              style={{ fontSize: `${getAdjustedSize(14)}px` }}
                            >
                              {payment.billing_day ? `매월 ${payment.billing_day}일` : '-'}
                            </td>
                            <td
                              className={`px-2 py-2 md:px-4 md:py-3 ${getFontSizeClass(14, fontSizeAdjustment)}`}
                              style={{ fontSize: `${getAdjustedSize(14)}px` }}
                            >
                              {payment.record_type}
                            </td>
                            <td
                              className={`px-2 py-2 text-gray-600 md:px-4 md:py-3 ${getFontSizeClass(14, fontSizeAdjustment)}`}
                              style={{ fontSize: `${getAdjustedSize(14)}px` }}
                            >
                              {payment.record_type === '결제 완료' ? `${payment.card_name || '-'} / ${payment.card_last4 || '-'}` : '-'}
                            </td>
                            <td className='px-2 py-2 text-center md:px-4 md:py-3'>
                              {payment.record_type === '결제 완료' && payment.receipt_url ? (
                                <button
                                  className={`text-blue-500 hover:text-blue-700 ${getFontSizeClass(14, fontSizeAdjustment)}`}
                                  style={{ fontSize: `${getAdjustedSize(14)}px` }}
                                  onClick={() => handlePaymentDetailView(payment)}
                                >
                                  영수증
                                </button>
                              ) : (
                                <span
                                  className={`text-gray-600 ${getFontSizeClass(14, fontSizeAdjustment)}`}
                                  style={{ fontSize: `${getAdjustedSize(14)}px` }}
                                >
                                  -
                                </span>
                              )}
                            </td>
                          </tr>
                        );
                      })
                    )}
                  </tbody>
                </table>
              </div>

              {/* 결제내역 페이지네이션 */}
              <div className='mt-[26px] flex items-center justify-center'>
                <div className='flex items-center'>
                  <EvidencePagination
                    currentPage={paymentHistoryPage}
                    totalPages={paymentHistoryPaging.total_page}
                    onPageChange={handlePaymentHistoryPageChange}
                  />
                </div>
              </div>
            </div>
          </div>
        )}

        {activeTab === 'payment-info' && (
          <div className='mt-[24px] px-2 md:mt-[32px] md:px-4 lg:pl-[10px]'>
            <div className='flex justify-between'>
              <h2
                className={`font-bold text-[#000] ${getFontSizeClass(20, fontSizeAdjustment)}`}
                style={{ fontSize: `${getAdjustedSize(20)}px` }}
              >
                결제 카드
              </h2>
              {billingKeyData && billingKeyData.length > 0 && (
                <button
                  onClick={handleDeleteCard}
                  className='h-[40px] w-[126px] rounded-[8px] border border-[#004AA4] text-[14px] text-[#004AA4] hover:bg-[#004AA4] hover:text-white'
                >
                  카드 변경하기
                </button>
              )}
            </div>

            {/* 결제 정보 */}
            {isLoadingBillingKey ? (
              <div className='mt-4 py-8 text-center text-gray-500'>
                <CustomSpinner />
              </div>
            ) : billingKeyData && billingKeyData.length > 0 ? (
              <div className='mt-4'>
                <div className='flex items-center justify-between rounded-[8px] border border-[#F3F3F3] p-[25px]'>
                  <div className='flex items-center space-x-4'>
                    <div className='flex items-center space-x-2'>
                      <p className='text-[18px] font-medium text-[#212121]'>{billingKeyData[0].card?.company || '카드'}카드,</p>
                      {/* 4자리씩 끊어서 표시 */}
                      <p className='text-[18px] text-[#212121]'>
                        {billingKeyData[0].card?.number
                          ?.match(/.{1,4}/g)
                          ?.map((chunk: string) => chunk)
                          .join(' ') || '****'}
                      </p>
                      <p className='text-[16px] text-[#8E8E8E]'>기본 결제 카드</p>
                    </div>
                  </div>
                </div>
              </div>
            ) : (
              <div className='mt-4'>
                <div className='flex items-center justify-between rounded-[8px] border border-[#F3F3F3] p-[25px]'>
                  <p
                    className={`text-[#8E8E8E] ${getFontSizeClass(18, fontSizeAdjustment)}`}
                    style={{ fontSize: `${getAdjustedSize(18)}px` }}
                  >
                    등록된 결제 카드가 없습니다.
                  </p>
                </div>
              </div>
            )}
          </div>
        )}
      </div>

      {/* 상세보기 모달 */}
      {isDetailModalOpen && selectedSubscription && (
        <div className='fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50'>
          <div className='max-h-[90vh] w-full max-w-2xl overflow-auto rounded-lg bg-white p-6'>
            <div className='mb-6 flex items-center justify-between'>
              <h2 className='text-xl font-bold text-gray-900'>구독 상세 정보</h2>
              <button
                onClick={() => setIsDetailModalOpen(false)}
                className='flex h-8 w-8 items-center justify-center rounded-lg text-gray-400 hover:bg-gray-100'
              >
                ✕
              </button>
            </div>

            <div className='space-y-6'>
              {/* 기본 정보 */}
              <div>
                <h3 className='mb-3 text-lg font-semibold text-gray-800'>기본 정보</h3>
                <div className='grid grid-cols-2 gap-4'>
                  <div>
                    <p className='text-sm text-gray-600'>플랜명</p>
                    <p className='font-medium'>{selectedSubscription.plan_id?.plan_name || '-'}</p>
                  </div>
                  <div>
                    <p className='text-sm text-gray-600'>상태</p>
                    <span
                      className={`inline-flex rounded-full px-2 py-1 text-xs font-semibold ${
                        selectedSubscription.status === 'active'
                          ? 'bg-green-100 text-green-800'
                          : selectedSubscription.status === 'pending'
                            ? 'bg-yellow-100 text-yellow-800'
                            : selectedSubscription.status === 'cancelled'
                              ? 'bg-red-100 text-red-800'
                              : 'bg-gray-100 text-gray-800'
                      }`}
                    >
                      {selectedSubscription.status === 'active'
                        ? '활성'
                        : selectedSubscription.status === 'pending'
                          ? '대기'
                          : selectedSubscription.status === 'cancelled'
                            ? '취소됨'
                            : selectedSubscription.status === 'expired'
                              ? '만료됨'
                              : selectedSubscription.status}
                    </span>
                  </div>
                </div>
              </div>

              {/* 결제 정보 */}
              <div>
                <h3 className='mb-3 text-lg font-semibold text-gray-800'>결제 정보</h3>
                <div className='grid grid-cols-2 gap-4'>
                  <div>
                    <p className='text-sm text-gray-600'>월 결제 금액</p>
                    <p className='text-xl font-bold text-gray-900'>₩{(selectedSubscription.plan_id?.amount || 0).toLocaleString()}</p>
                  </div>
                  <div>
                    <p className='text-sm text-gray-600'>결제 수단</p>
                    <p className='font-medium'>
                      {selectedSubscription.billing_method_id?.card?.company || '카드'} /{' '}
                      {selectedSubscription.billing_method_id?.card?.last4 || '****'}
                    </p>
                  </div>
                  <div>
                    <p className='text-sm text-gray-600'>현재 구독 기간 시작</p>
                    <p className='font-medium'>
                      {selectedSubscription.current_period_start
                        ? new Date(selectedSubscription.current_period_start).toLocaleDateString('ko-KR')
                        : '-'}
                    </p>
                  </div>
                  <div>
                    <p className='text-sm text-gray-600'>다음 결제일</p>
                    <p className='font-medium'>
                      {selectedSubscription.nextBillingAt ? new Date(selectedSubscription.nextBillingAt).toLocaleDateString('ko-KR') : '-'}
                    </p>
                  </div>
                </div>
              </div>
            </div>

            {/* 모달 하단 버튼 */}
            <div className='mt-8 flex justify-end space-x-3'>
              {/* {selectedSubscription.status === 'active' && (
                <button
                  onClick={() => {
                    setIsDetailModalOpen(false);
                    handleCancelSubscription(selectedSubscription.subscription_id);
                  }}
                  className='rounded-lg bg-red-600 px-4 py-2 text-white hover:bg-red-700 disabled:bg-gray-400'
                >
                  구독취소
                </button>
              )} */}
              <button
                onClick={() => setIsDetailModalOpen(false)}
                className='rounded-lg border border-gray-300 px-4 py-2 text-gray-700 hover:bg-gray-50'
              >
                닫기
              </button>
            </div>
          </div>
        </div>
      )}

      {/* 카드 삭제 확인 모달 */}
      {isDeleteCardModalOpen && (
        <div className='fixed inset-0 z-[1000] flex items-center justify-center bg-black bg-opacity-50'>
          <div
            style={{
              display: 'flex',
              width: '350px',
              padding: '32px',
              flexDirection: 'column',
              justifyContent: 'center',
              alignItems: 'center',

              borderRadius: '16px',
              background: '#FFF',
              boxShadow: '0 0 20px 0 rgba(167, 167, 167, 0.20)',
            }}
          >
            {/* 제목 */}
            <div className='text-center'>
              <h3 className='text-[18px] font-bold text-[#252525]'>결제 카드를 삭제하시겠습니까?</h3>
            </div>

            {/* 설명 */}
            <div className='mb-[24px] mt-[16px] text-center'>
              <p className='text-[14px] leading-[20px] text-[#666666]'>
                결제 카드를 삭제하시면
                <br />
                다음 결제를 위해 다시 등록이 필요합니다.
              </p>
            </div>

            {/* 버튼들 */}
            <div className='flex w-full gap-3'>
              <button
                onClick={handleConfirmDeleteCard}
                className='h-[48px] flex-1 rounded-lg bg-[#004AA4] text-[16px] font-medium text-white transition-colors hover:bg-[#004AA4]/90'
              >
                진행
              </button>
              <button
                onClick={() => setIsDeleteCardModalOpen(false)}
                className='h-[48px] flex-1 rounded-lg border border-[#E5E5E5] bg-white text-[16px] font-medium text-[#212121] transition-colors hover:bg-[#F5F5F5]'
              >
                취소
              </button>
            </div>
          </div>
        </div>
      )}

      {/* 빌링키 발급 중 로딩 모달 */}
      {isBillingKeyCreating && (
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

      {/* 사건내역 모달 */}
      <CaseDetailModal
        isOpen={isCaseDetailModalOpen}
        onClose={() => setIsCaseDetailModalOpen(false)}
        caseData={selectedCase}
        onStatusChange={handleCaseStatusChange}
      />

      {/* 결제 내역 상세 모달 */}
      <PaymentDetailModal
        isOpen={isPaymentDetailModalOpen}
        onClose={() => setIsPaymentDetailModalOpen(false)}
        payment={selectedPayment}
        onReceiptView={handleReceiptView}
      />

      {/* 결제 참여 모달 */}
      <PaymentParticipationModal
        isOpen={isPaymentParticipationModalOpen}
        onClose={() => {
          setIsPaymentParticipationModalOpen(false);
          // 모달 닫을 때 새로 발급받은 빌링키 정보 초기화
          setNewBillingKey('');
          setNewCustomerKey('');

          // URL 파라미터도 제거
          const newSearchParams = new URLSearchParams(searchParams);
          newSearchParams.delete('payment');
          newSearchParams.delete('isBillCreate');
          newSearchParams.delete('customerKey');
          newSearchParams.delete('authKey');
          newSearchParams.delete('projectId');
          newSearchParams.delete('projectName');
          newSearchParams.delete('userId');
          setSearchParams(newSearchParams);
          console.log('모달 닫힐 때 URL 파라미터 제거 완료');
        }}
        onPayment={() => {
          // 결제 처리 로직은 PaymentParticipationModal 내부에서 처리
        }}
        projectName={registeredProjectName}
        projectId={registeredProjectId}
        userId={findEvidenceUserInfo?.data?.user_id}
        newBillingKey={newBillingKey}
        newCustomerKey={newCustomerKey}
        onPaymentSuccess={() => {
          // 결제 성공 시 처리
          setIsPaymentParticipationModalOpen(false);
          setNewBillingKey('');
          setNewCustomerKey('');

          // 결제 성공 시 URL 파라미터 제거
          const newSearchParams = new URLSearchParams(searchParams);
          newSearchParams.delete('payment');
          newSearchParams.delete('isBillCreate');
          newSearchParams.delete('customerKey');
          newSearchParams.delete('authKey');
          newSearchParams.delete('projectId');
          newSearchParams.delete('projectName');
          newSearchParams.delete('userId');
          setSearchParams(newSearchParams);
          console.log('결제 성공 - URL 파라미터 제거 완료');

          fetchProjectList(); // 리스트 새로고침
        }}
      />

      {/* 영수증 모달 */}
      {isReceiptModalOpen && (
        <div className='fixed inset-0 z-[1000] flex items-center justify-center bg-black bg-opacity-50'>
          <div className='relative h-[90vh] w-[450px] overflow-auto rounded-[20px]'>
            <iframe src={selectedReceiptUrl} className='h-full w-full border-0' title='영수증' />

            <button onClick={() => setIsReceiptModalOpen(false)} className='absolute right-4 top-3'>
              <IoIosCloseCircleOutline className='text-[30px]' />
            </button>
          </div>
        </div>
      )}

      {/* 툴팁 */}
      <Tooltip
        id='payment-tooltip'
        place='bottom'
        delayShow={100}
        className='custom-tooltip'
        style={{
          backgroundColor: '#333',
          color: '#fff',
          borderRadius: '4px',
          fontSize: `${getAdjustedSize(12)}px`,
          zIndex: 9999,
          position: 'fixed',
          maxWidth: '400px',
        }}
      />
    </div>
  );
};
