import { useState, useEffect } from 'react';

import { IoIosCloseCircleOutline } from 'react-icons/io';
import { Tooltip } from 'react-tooltip';

import CustomSpinner from '@components/common/spiner';
import { fetchFindCase } from '@/apis/evidence-admin-api';
import { fetchChangeCaseStatus } from '@/apis/payment-api';
import { PaymentParticipationModal } from '@/components/evidence/modal/payment-participation-modal';
import { EvidencePagination } from '@/components/evidence/pagination/evidence-pagination';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { onMessageToast } from '@/components/utils';
import { useFindUserInfo } from '@/hooks/react-query';
import { useGetPaymentHistory } from '@/hooks/react-query/query/payment/use-get-payment-history';
// import { useGetSubscriptions } from '@/hooks/react-query/query/subscription/use-get-subscriptions';

interface ICaseDetailModalProps {
  isOpen: boolean;
  onClose: () => void;
  caseData: {
    project_id: string;
    project_nm: string;
    status: string;
    project_role?: string; // 사건 목록에서 사용
    user_role?: string; // 현재 플랜에서 사용
    payment_status: string;
    has_subscription?: boolean; // 구독 여부
    subscription_amount?: number; // 구독 금액
    total_amount?: number; // 현재 플랜에서 사용하는 총 금액
    created_at?: string; // 생성일
    createdAt?: string; // 생성일 (API 응답)
  } | null;
  onStatusChange?: () => void; // 상태 변경 시 콜백 함수
}

export const CaseDetailModal = ({ isOpen, onClose, caseData, onStatusChange }: ICaseDetailModalProps): JSX.Element | null => {
  const [caseStatus, setCaseStatus] = useState<string>(caseData?.status || '진행중');
  const [_currentPage, setCurrentPage] = useState(1);

  // 날짜 포맷팅 함수
  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    return `${year}.${month}.${day}`;
  };

  // 현재 사용자 정보 가져오기
  const { response: findEvidenceUserInfo } = useFindUserInfo();

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
    24: ['text-xl', 'text-2xl', 'text-3xl', 'text-4xl', 'text-5xl', 'text-6xl', 'text-7xl'],
  } as const;

  // 폰트 크기 조정 클래스 선택
  const getFontSizeClass = (baseSize: keyof typeof fontSizeClasses, adjustment: number) => {
    const steps = [-30, -20, -10, 0, 10, 20, 30];
    const index = steps.indexOf(adjustment);
    // 지원하지 않는 크기는 16을 기본값으로 사용
    const sizeKey = baseSize in fontSizeClasses ? baseSize : 16;
    return fontSizeClasses[sizeKey as keyof typeof fontSizeClasses][index !== -1 ? index : 3]; // 기본값(0%)은 index 3
  };

  // 영수증 모달 상태
  const [isReceiptModalOpen, setIsReceiptModalOpen] = useState(false);
  const [selectedReceiptUrl, setSelectedReceiptUrl] = useState<string>('');

  // 상태 변경 확인 모달 상태
  const [isStatusChangeModalOpen, setIsStatusChangeModalOpen] = useState(false);
  const [pendingStatus, setPendingStatus] = useState<string>('');

  // 결제 참여 모달 상태
  const [isPaymentModalOpen, setIsPaymentModalOpen] = useState(false);

  // 결제 내역 조회 (전체 데이터 가져오기)
  // project_id가 있을 때만 API 호출
  const {
    data: paymentHistoryResponse,
    isLoading: isLoadingPaymentHistory,
    refetch: refetchPaymentHistory,
  } = useGetPaymentHistory({
    project_id: caseData?.project_id || '',
    page_no: 1,
    block_cnt: 1000, // 충분히 큰 값으로 설정하여 전체 데이터 가져오기
  });

  // caseData 또는 projectInfo가 변경될 때마다 caseStatus 업데이트
  useEffect(() => {
    const projectInfo = paymentHistoryResponse?.data?.project_info;
    const statusToUse = projectInfo?.status || caseData?.status;
    if (statusToUse) {
      setCaseStatus(statusToUse);
    }
  }, [caseData?.project_id, caseData?.status, paymentHistoryResponse?.data?.project_info]);

  if (!isOpen || !caseData) return null;

  // 실제 결제 내역 데이터
  const allPaymentHistory = paymentHistoryResponse?.data?.list || [];
  const paging = paymentHistoryResponse?.data?.paging || { total_cnt: 0, total_page: 1, page_no: 1, block_cnt: 50 };
  const projectInfo = paymentHistoryResponse?.data?.project_info;

  // paymentHistoryResponse에서 받은 데이터를 우선 사용, 없으면 caseData 사용
  const displayProjectName = projectInfo?.project_nm || caseData?.project_nm || '';
  const displayStatus = projectInfo?.status || caseData?.status || caseStatus;

  // 권한 체크 함수
  const isManager = () => {
    const projectRole = caseData?.project_role;
    const userRole = caseData?.user_role;

    return (
      projectRole === '사건관리자' ||
      projectRole === '사건관리자권한' ||
      userRole === '사건관리자' ||
      projectRole?.includes('관리자') ||
      userRole?.includes('관리자')
    );
  };

  // 결제 내역 필터링: 항상 내 결제 내역(is_me === true)만 표시
  const paymentHistory = allPaymentHistory.filter((payment) => (payment as any).is_me === true);

  // 디버깅용 로그
  console.log('Case Detail Modal Debug:', {
    paymentHistoryResponse,
    paymentHistory,
    paging,
    isLoadingPaymentHistory,
    caseData,
    caseDataStatus: caseData?.status,
    caseStatus,
    projectRole: caseData?.project_role,
    userRole: caseData?.user_role,
    isManager: isManager(),
    createdAt: caseData?.createdAt,
    created_at: caseData?.created_at,
    allCaseDataKeys: caseData ? Object.keys(caseData) : [],
  });

  // 내 결제 금액 계산 - paymentHistoryResponse의 project_info에서 가져오기
  const myPaymentAmount =
    projectInfo?.my_amount !== undefined
      ? projectInfo.my_amount
      : caseData?.has_subscription
        ? caseData.subscription_amount || 0
        : caseData?.total_amount || 0;
  // 전체 금액: 사건관리자는 total_amount, 일반 사용자는 내 결제 금액과 동일
  const totalAmount = isManager()
    ? projectInfo?.total_amount !== undefined
      ? projectInfo.total_amount
      : caseData?.total_amount || myPaymentAmount
    : myPaymentAmount;

  // 페이지 변경 핸들러
  const handlePageChange = (page: number) => {
    setCurrentPage(page);
    // TODO: API 호출로 페이지 데이터 가져오기
  };

  // 영수증 모달 핸들러 (현재 테이블 버튼이 주석 처리되어 있어 unused 방지용으로 prefix 처리)
  const _handleReceiptView = (receiptUrl: string) => {
    setSelectedReceiptUrl(receiptUrl);
    setIsReceiptModalOpen(true);
  };

  // 사건 상태 변경 확인 모달 열기
  const handleCaseStatusChange = (newStatus: string) => {
    // "생성중" 상태일 때는 변경 불가
    if (displayStatus === '생성중') {
      return;
    }
    setPendingStatus(newStatus);
    setIsStatusChangeModalOpen(true);
  };

  // 사건 상태 변경 실행
  const handleConfirmStatusChange = async () => {
    if (!caseData?.project_id || !pendingStatus) return;

    // "진행중"으로 변경하는 경우
    if (pendingStatus === '진행중') {
      try {
        // 사건 조회하여 payment_status 확인
        const projectData = await fetchFindCase(caseData.project_id);
        const paymentStatus = (projectData.data as any)?.payment_status;
        const expireDate = (projectData.data as any)?.expire_date;

        // payment_status가 'trial'이고 expire_date가 오늘 이후인 경우에만 결제 모달 없이 바로 상태 변경
        if (paymentStatus === 'trial' && expireDate) {
          const today = new Date();
          today.setHours(0, 0, 0, 0); // 오늘 날짜의 시작 시간
          const expire = new Date(expireDate);
          expire.setHours(0, 0, 0, 0);

          // expire_date가 오늘 이후인 경우에만 무료 처리
          if (expire >= today) {
            const response = await fetchChangeCaseStatus({
              project_id: caseData.project_id,
              status: '진행중',
            });

            if (response.success) {
              setCaseStatus('진행중');
              await refetchPaymentHistory();
              onMessageToast({ message: '사건 상태가 "진행중"으로 변경되었습니다.' });
              setIsStatusChangeModalOpen(false);
              setPendingStatus('');

              if (onStatusChange) {
                onStatusChange();
              }
            } else {
              onMessageToast({ message: '사건 상태 변경에 실패했습니다.' });
            }
            return;
          }
        }

        // trial이 아니거나 expire_date가 지난 경우 기존처럼 결제 모달 열기
        setIsPaymentModalOpen(true);
        setIsStatusChangeModalOpen(false);
        setPendingStatus('');
        return;
      } catch (error) {
        console.error('사건 조회 실패:', error);
        // 에러 발생 시 기존 로직대로 결제 모달 열기
        setIsPaymentModalOpen(true);
        setIsStatusChangeModalOpen(false);
        setPendingStatus('');
        return;
      }
    }

    // "진행중"이 아닌 경우에만 즉시 상태 변경
    try {
      const response = await fetchChangeCaseStatus({
        project_id: caseData.project_id,
        status: pendingStatus,
      });

      if (response.success) {
        setCaseStatus(pendingStatus);
        // 결제 내역 API를 다시 호출하여 최신 상태 반영
        await refetchPaymentHistory();
        onMessageToast({ message: `사건 상태가 "${pendingStatus}"로 변경되었습니다.` });
        setIsStatusChangeModalOpen(false);
        setPendingStatus('');

        // 부모 컴포넌트에 상태 변경 알림
        if (onStatusChange) {
          onStatusChange();
        }
      } else {
        onMessageToast({ message: '사건 상태 변경에 실패했습니다.' });
      }
    } catch (error) {
      console.error('사건 상태 변경 중 오류 발생:', error);
      onMessageToast({ message: '사건 상태 변경 중 오류가 발생했습니다.' });
    }
  };

  // 상태 변경 취소
  const handleCancelStatusChange = () => {
    setIsStatusChangeModalOpen(false);
    setPendingStatus('');
  };

  // 결제 성공 시 상태 변경 처리
  const handlePaymentSuccess = async () => {
    try {
      // 결제 성공 시에만 상태를 "진행중"으로 변경
      const response = await fetchChangeCaseStatus({
        project_id: caseData?.project_id || '',
        status: '진행중',
      });

      if (response.success) {
        setCaseStatus('진행중');
        // 결제 내역 API를 다시 호출하여 최신 상태 반영
        await refetchPaymentHistory();
        onMessageToast({ message: '사건 상태가 "진행중"으로 변경되었습니다.' });

        // 부모 컴포넌트에 상태 변경 알림
        if (onStatusChange) {
          onStatusChange();
        }
      } else {
        onMessageToast({ message: '사건 상태 변경에 실패했습니다.' });
      }
    } catch (error) {
      console.error('상태 변경 중 오류 발생:', error);
      onMessageToast({ message: '상태 변경 중 오류가 발생했습니다.' });
    }
  };

  // 상태별 메시지 생성
  const getStatusChangeMessage = (status: string) => {
    switch (status) {
      case '일시중지':
        return {
          title: '사건을 일시중지하시겠어요?',
          message: (
            <>
              결제가 중지되며, 이후 사건에 접근하려면
              <br />
              일시중지를 해제해야 합니다.
            </>
          ),
          confirmText: '일시중지',
          cancelText: '취소',
        };
      case '종결':
        return {
          title: '사건을 종결하시겠습니까?',
          message: (
            <>
              사건을 종결하면 결제가 중단되고 사건에
              <br />
              더이상 접근할 수 없습니다.
              <br />
              필요 시 진행중으로 변경할 수 있습니다.
            </>
          ),
          confirmText: '종결',
          cancelText: '취소',
        };
      case '진행중':
        return {
          title: '진행중으로 변경하시겠습니까?',
          message: (
            <>
              진행중으로 변경하면 결제가 다시 시작되고
              <br />
              기존 참여자가 사건에 참여할 수 있습니다.
            </>
          ),
          confirmText: '진행',
          cancelText: '취소',
        };
      default:
        return {
          title: '상태를 변경하시겠습니까?',
          message: `사건 상태를 "${status}"로 변경합니다.`,
          confirmText: '변경',
          cancelText: '취소',
        };
    }
  };

  return (
    <div className='fixed inset-0 z-[1000] flex items-center justify-center bg-black bg-opacity-50'>
      <div className='max-h-[90vh] w-full max-w-4xl overflow-auto rounded-lg bg-white p-[32px]'>
        {/* 헤더 */}
        <div className=''>
          <div className='flex items-center justify-between'>
            <h2
              className={`font-bold text-[#252525] ${getFontSizeClass(24, fontSizeAdjustment)}`}
              style={{ fontSize: `${getAdjustedSize(24)}px` }}
            >
              {displayProjectName}
            </h2>
          </div>
        </div>

        {/* 메인 컨텐츠 */}
        <div className='mt-[24px]'>
          {/* 사건 상태 및 결제 금액 섹션 */}
          <div className='flex items-center justify-between'>
            <div className='w-[50%]'>
              <div className=''>
                <label
                  className={`font-bold text-[#5B5B5B] ${getFontSizeClass(14, fontSizeAdjustment)}`}
                  style={{ fontSize: `${getAdjustedSize(14)}px` }}
                >
                  사건 상태
                </label>
                <div className=''>
                  {displayStatus === '생성중' ? (
                    // 생성중 상태일 때는 변경 불가 (텍스트만 표시)
                    <p
                      className={`font-bold text-[#000] ${getFontSizeClass(20, fontSizeAdjustment)}`}
                      style={{ fontSize: `${getAdjustedSize(20)}px` }}
                    >
                      {displayStatus}
                    </p>
                  ) : isManager() ? (
                    <Select value={displayStatus} onValueChange={handleCaseStatusChange}>
                      <SelectTrigger
                        className={`flex h-[40px] w-[120px] justify-start border-none pl-0 pr-2 font-bold text-[#000] focus:outline-none focus:ring-0 ${getFontSizeClass(20, fontSizeAdjustment)}`}
                        style={{ fontSize: `${getAdjustedSize(20)}px` }}
                      >
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent className={getFontSizeClass(20, fontSizeAdjustment)} style={{ fontSize: `${getAdjustedSize(20)}px` }}>
                        <SelectItem value='진행중'>진행중</SelectItem>
                        {displayStatus !== '종결' && <SelectItem value='일시중지'>일시중지</SelectItem>}
                        <SelectItem value='종결'>종결</SelectItem>
                      </SelectContent>
                    </Select>
                  ) : (
                    <p
                      className={`font-bold text-[#000] ${getFontSizeClass(20, fontSizeAdjustment)}`}
                      style={{ fontSize: `${getAdjustedSize(20)}px` }}
                    >
                      {displayStatus}
                    </p>
                  )}
                </div>
                <p
                  className={`leading-[20px] tracking-[-0.028px] text-[#5B5B5B] ${getFontSizeClass(14, fontSizeAdjustment)}`}
                  style={{ fontSize: `${getAdjustedSize(14)}px` }}
                >
                  {(() => {
                    const createdDate = (projectInfo as any)?.createdAt || caseData?.created_at || caseData?.createdAt;
                    return createdDate ? formatDate(createdDate) + ' 생성' : '';
                  })()}
                </p>
              </div>
            </div>

            <div className='w-[50%] text-left'>
              <div>
                <p
                  className={`font-bold text-[#5B5B5B] ${getFontSizeClass(14, fontSizeAdjustment)}`}
                  style={{ fontSize: `${getAdjustedSize(14)}px` }}
                >
                  내 결제 금액
                </p>
                <div className='mt-1 flex items-baseline space-x-1'>
                  <p
                    className={`font-bold text-[#252525] ${getFontSizeClass(24, fontSizeAdjustment)}`}
                    style={{ fontSize: `${getAdjustedSize(24)}px` }}
                  >
                    {myPaymentAmount.toLocaleString()}원
                  </p>
                </div>
                <p
                  className={`text-[#5B5B5B] ${getFontSizeClass(14, fontSizeAdjustment)}`}
                  style={{ fontSize: `${getAdjustedSize(14)}px` }}
                >
                  전체 금액 {totalAmount.toLocaleString()}원
                </p>
              </div>
            </div>
          </div>

          {/* 사건 결제 내역 테이블 */}
          <div>
            <h3
              className={`mb-[20px] mt-[24px] font-bold text-[#5B5B5B] ${getFontSizeClass(14, fontSizeAdjustment)}`}
              style={{ fontSize: `${getAdjustedSize(14)}px` }}
            >
              사건 결제 내역
            </h3>
            <div className='max-h-[400px] overflow-auto'>
              <table className='w-full'>
                <thead>
                  <tr className='border-b border-[#F7F8F8] bg-[#F7F8F8] text-[#212121]'>
                    <th
                      className={`px-4 py-3 text-left font-medium ${getFontSizeClass(14, fontSizeAdjustment)}`}
                      style={{ fontSize: `${getAdjustedSize(14)}px` }}
                    >
                      결제 상태
                    </th>
                    <th
                      className={`px-4 py-3 text-left font-medium ${getFontSizeClass(14, fontSizeAdjustment)}`}
                      style={{ fontSize: `${getAdjustedSize(14)}px` }}
                    >
                      결제 유형
                    </th>
                    <th
                      className={`px-4 py-3 text-left font-medium ${getFontSizeClass(14, fontSizeAdjustment)}`}
                      style={{ fontSize: `${getAdjustedSize(14)}px` }}
                    >
                      권한
                    </th>
                    <th
                      className={`px-4 py-3 text-left font-medium ${getFontSizeClass(14, fontSizeAdjustment)}`}
                      style={{ fontSize: `${getAdjustedSize(14)}px` }}
                    >
                      이용자
                    </th>
                    <th
                      className={`px-4 py-3 text-left font-medium ${getFontSizeClass(14, fontSizeAdjustment)}`}
                      style={{ fontSize: `${getAdjustedSize(14)}px` }}
                    >
                      결제자
                    </th>
                    <th
                      className={`px-4 py-3 text-left font-medium ${getFontSizeClass(14, fontSizeAdjustment)}`}
                      style={{ fontSize: `${getAdjustedSize(14)}px` }}
                    >
                      결제일
                    </th>
                    <th
                      className={`px-4 py-3 text-left font-medium ${getFontSizeClass(14, fontSizeAdjustment)}`}
                      style={{ fontSize: `${getAdjustedSize(14)}px` }}
                    >
                      결제 금액
                    </th>
                    {/*   <th
                      className={`px-4 py-3 text-center font-medium ${getFontSizeClass(14, fontSizeAdjustment)}`}
                      style={{ fontSize: `${getAdjustedSize(14)}px` }}
                    >
                      영수증
                    </th> */}
                  </tr>
                </thead>
                <tbody>
                  {isLoadingPaymentHistory ? (
                    <tr>
                      <td colSpan={8} className='py-8 text-center text-gray-500'>
                        <CustomSpinner />
                      </td>
                    </tr>
                  ) : paymentHistory.length === 0 ? (
                    <tr>
                      <td
                        colSpan={8}
                        className={`py-8 text-center text-gray-500 ${getFontSizeClass(14, fontSizeAdjustment)}`}
                        style={{ fontSize: `${getAdjustedSize(14)}px` }}
                      >
                        결제 내역이 없습니다.
                      </td>
                    </tr>
                  ) : (
                    paymentHistory.map((payment) => (
                      <tr key={payment.payment_id} className='border-b border-[#F7F8F8] text-[#212121]'>
                        <td
                          className={`px-4 py-3 ${getFontSizeClass(14, fontSizeAdjustment)}`}
                          style={{ fontSize: `${getAdjustedSize(14)}px` }}
                        >
                          {payment.record_type}
                        </td>
                        <td
                          className={`px-4 py-3 ${getFontSizeClass(14, fontSizeAdjustment)}`}
                          style={{ fontSize: `${getAdjustedSize(14)}px` }}
                        >
                          {payment.payment_type === 'case_subscription'
                            ? '사건구독'
                            : payment.payment_type === 'case_participation'
                              ? '사건 참여'
                              : payment.payment_type}
                        </td>
                        <td
                          className={`px-4 py-3 ${getFontSizeClass(14, fontSizeAdjustment)}`}
                          style={{ fontSize: `${getAdjustedSize(14)}px` }}
                        >
                          {(payment as any).project_role || caseData.project_role || '-'}
                        </td>

                        <td
                          className={`max-w-[130px] cursor-pointer overflow-hidden text-ellipsis whitespace-nowrap px-4 py-3 ${getFontSizeClass(14, fontSizeAdjustment)}`}
                          style={{ fontSize: `${getAdjustedSize(14)}px` }}
                          {...(() => {
                            const email = (payment as any).email;
                            const userName = payment.user_name;
                            const fullText = userName && email ? `${userName} (${email})` : email || userName || '-';
                            return fullText && fullText !== '-'
                              ? {
                                  'data-tooltip-id': 'tooltip',
                                  'data-tooltip-content': fullText,
                                }
                              : {};
                          })()}
                        >
                          {(() => {
                            const email = (payment as any).email;
                            const userName = payment.user_name;
                            const displayText = userName ? `${userName}${email ? ` (${email})` : ''}` : email || '-';
                            return displayText;
                          })()}
                        </td>
                        <td
                          className={`px-4 py-3 ${getFontSizeClass(14, fontSizeAdjustment)}`}
                          style={{ fontSize: `${getAdjustedSize(14)}px` }}
                        >
                          {payment.payer_name || '-'}
                          {(payment as any).payer_id && (payment as any).payer_id === findEvidenceUserInfo?.data?.user_id && (
                            <span
                              className={`ml-1 inline-flex rounded-full bg-gray-100 px-2 py-0.5 ${getFontSizeClass(12, fontSizeAdjustment)}`}
                              style={{ fontSize: `${getAdjustedSize(12)}px` }}
                            >
                              나
                            </span>
                          )}
                        </td>
                        <td
                          className={`px-4 py-3 ${getFontSizeClass(14, fontSizeAdjustment)}`}
                          style={{ fontSize: `${getAdjustedSize(14)}px` }}
                        >
                          {payment.billing_day ? `매월 ${payment.billing_day}일` : '-'}
                        </td>
                        <td
                          className={`px-4 py-3 font-medium ${getFontSizeClass(14, fontSizeAdjustment)}`}
                          style={{ fontSize: `${getAdjustedSize(14)}px` }}
                        >
                          {(payment.amount || 0).toLocaleString()}원
                        </td>
                        {/* <td className='px-4 py-3 text-center'>
                          {payment.record_type === '결제 완료' && payment.receipt_url ? (
                            <button
                              className={`text-blue-500 hover:text-blue-700 ${getFontSizeClass(14, fontSizeAdjustment)}`}
                              style={{ fontSize: `${getAdjustedSize(14)}px` }}
                              onClick={() => handleReceiptView(payment.receipt_url!)}
                            >
                              영수증
                            </button>
                          ) : (
                            <span
                              className={`text-gray-400 ${getFontSizeClass(14, fontSizeAdjustment)}`}
                              style={{ fontSize: `${getAdjustedSize(14)}px` }}
                            >
                              -
                            </span>
                          )}
                        </td> */}
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>

            {/* 페이지네이션 */}
            <div className='mt-6 flex items-center justify-center'>
              <EvidencePagination currentPage={paging.page_no} totalPages={paging.total_page} onPageChange={handlePageChange} />
            </div>
          </div>
        </div>

        {/* 하단 닫기 버튼 */}
        <div className='mt-[24px] text-center'>
          <button
            onClick={onClose}
            className={`h-[48px] w-[200px] rounded-lg bg-[#F3F3F3] font-medium text-[#212121] transition-colors hover:bg-[#004AA4]/90 hover:text-white ${getFontSizeClass(16, fontSizeAdjustment)}`}
            style={{ fontSize: `${getAdjustedSize(16)}px` }}
          >
            닫기
          </button>
        </div>
      </div>

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

      {/* 상태 변경 확인 모달 */}
      {isStatusChangeModalOpen && pendingStatus && (
        <div className='fixed inset-0 z-[1001] flex items-center justify-center bg-black bg-opacity-50'>
          <div
            style={{
              display: 'flex',
              width: '400px',
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
              <h3
                className={`font-extrabold text-[#252525] ${getFontSizeClass(18, fontSizeAdjustment)}`}
                style={{ fontSize: `${getAdjustedSize(18)}px` }}
              >
                {getStatusChangeMessage(pendingStatus).title}
              </h3>
            </div>

            {/* 설명 */}
            <div className='mb-[24px] mt-[16px] text-center'>
              <div
                className={`leading-[20px] text-[#666666] ${getFontSizeClass(14, fontSizeAdjustment)}`}
                style={{ fontSize: `${getAdjustedSize(14)}px` }}
              >
                {getStatusChangeMessage(pendingStatus).message}
              </div>
            </div>

            {/* 버튼들 */}
            <div className='flex w-full gap-3'>
              <button
                onClick={handleConfirmStatusChange}
                className={`h-[48px] flex-1 rounded-lg bg-[#004AA4] font-medium text-white transition-colors hover:bg-[#004AA4]/90 ${getFontSizeClass(16, fontSizeAdjustment)}`}
                style={{ fontSize: `${getAdjustedSize(16)}px` }}
              >
                {getStatusChangeMessage(pendingStatus).confirmText}
              </button>
              <button
                onClick={handleCancelStatusChange}
                className={`h-[48px] flex-1 rounded-lg border border-[#E5E5E5] bg-white font-medium text-[#212121] transition-colors hover:bg-[#F5F5F5] ${getFontSizeClass(16, fontSizeAdjustment)}`}
                style={{ fontSize: `${getAdjustedSize(16)}px` }}
              >
                {getStatusChangeMessage(pendingStatus).cancelText}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* 결제 참여 모달 */}
      <PaymentParticipationModal
        isOpen={isPaymentModalOpen}
        onClose={() => setIsPaymentModalOpen(false)}
        onPayment={() => {
          // 결제 성공 시 처리
          setIsPaymentModalOpen(false);
        }}
        projectName={caseData?.project_nm}
        projectId={caseData?.project_id}
        userId={caseData?.project_id}
        onPaymentSuccess={() => {
          // 결제 성공 시 처리
          setIsPaymentModalOpen(false);
          handlePaymentSuccess();
        }}
      />

      {/* 툴팁 */}
      <Tooltip
        id='tooltip'
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
        }}
      />
    </div>
  );
};
