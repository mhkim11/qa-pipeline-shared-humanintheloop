import { useState, useEffect, useCallback } from 'react';

import { loadTossPayments } from '@tosspayments/payment-sdk';
import { AiOutlineLoading3Quarters } from 'react-icons/ai';
import { FaCheck, FaCheckCircle } from 'react-icons/fa';

import { fetchGetBillingKey, fetchCreatePayment } from '@/apis/payment-api';
import { onMessageToast } from '@/components/utils';
import { useFindUserInfo, useRejectProjectInvitation } from '@/hooks/react-query';
// import { useGetSubscriptionPlans } from '@/hooks/react-query/query/subscription';

interface IPaymentModalProps {
  isOpen: boolean;
  onClose: () => void;
  onPayment: () => void;
  projectName?: string;
  projectId?: string;
  userId?: string;
  requestId?: string;
  onPlanSelect?: (planId: string) => void;
  onPaymentSuccess?: () => void;
  paymentType?: 'case_subscription' | 'case_participation';
  amount?: number;
  planId?: string;
  isInvited?: boolean;
}

export const PaymentModal = ({
  isOpen,
  onClose,
  projectName,
  projectId,
  userId,
  requestId,
  onPlanSelect,
  onPaymentSuccess,
  paymentType = 'case_subscription',
  amount,
  planId,
  isInvited = false,
}: IPaymentModalProps) => {
  const [showCancelModal, setShowCancelModal] = useState(false);
  const [showFailModal, setShowFailModal] = useState(false);
  const [failErrorMessage, setFailErrorMessage] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [selectedPlanId, setSelectedPlanId] = useState<string>('');
  const [existingBillingKey, setExistingBillingKey] = useState<string>('');
  const [hasExistingBillingKey, setHasExistingBillingKey] = useState<boolean>(false);
  const [cardInfo, setCardInfo] = useState<any>(null);
  const [existingCustomerKey, setExistingCustomerKey] = useState<string>('');
  const [showRejectModal, setShowRejectModal] = useState(false);

  // 사용자 정보 조회
  const { response: findEvidenceUserInfo } = useFindUserInfo();

  // 사건 초대 거절 API 훅
  const { onRejectProjectInvitation } = useRejectProjectInvitation();

  // 구독 플랜 목록 조회 (19,000원 플랜으로 고정) - 사용하지 않음
  // const { response: plansResponse, isLoading: isLoadingPlans } = useGetSubscriptionPlans({
  //   include_inactive: false,
  // });

  // 결제 타입에 따른 플랜 데이터
  const getPlanData = () => {
    if (paymentType === 'case_participation') {
      return {
        plan_id: planId || 'plan_01K7GPCHPZXX4CZM6TTRYAA2CW',
        plan_name: '사건 참여',
        plan_description: [''],
        final_amount: amount || 19000,
        amount: amount || 19000,
        interval: 'month',
        isActive: true,
      };
    }

    // 기본 case_subscription 플랜
    return {
      plan_id: 'plan_01K5B9Y83AKY5XX8Z78D7HSC73',
      plan_name: '기본 플랜',
      plan_description: ['증거문서 디지털화', '증거문서 AI분석', '사건진척 및 협업'],
      final_amount: 19000,
      amount: 19000,
      interval: 'month',
      isActive: true,
    };
  };

  const fixedPlan = getPlanData();

  // 빌링키 조회 함수
  const checkExistingBillingKey = useCallback(async () => {
    if (!userId) return;

    try {
      const customerKey = `customer_${userId}`;
      const response = await fetchGetBillingKey(customerKey, '');

      if (response.success && response.data && response.data.length > 0) {
        const billingData = response.data[0];
        setExistingBillingKey(billingData.billingKey);
        setExistingCustomerKey(billingData.customerKey || customerKey);
        setHasExistingBillingKey(true);
        setCardInfo(billingData.card);
      } else {
        setHasExistingBillingKey(false);
        setExistingCustomerKey('');
      }
    } catch (error) {
      console.error('빌링키 조회 실패:', error);
      setHasExistingBillingKey(false);
    }
  }, [userId]);

  // 사건 초대 거절 함수
  const handleRejectInvitation = async () => {
    if (!requestId) return;

    try {
      setIsLoading(true);
      const response = await onRejectProjectInvitation({
        request_id: requestId,
      });

      if (response?.success) {
        setShowRejectModal(false);
        onMessageToast({
          message: '사건 초대를 거절했습니다.',
        });
        onClose();
      } else {
        throw new Error(response?.message || '초대 거절에 실패했습니다.');
      }
    } catch (error) {
      console.error('초대 거절 실패:', error);
      setFailErrorMessage(error instanceof Error ? error.message : '초대 거절 중 오류가 발생했습니다.');
      setShowFailModal(true);
    } finally {
      setIsLoading(false);
    }
  };

  // 모달이 열릴 때마다 상태 초기화 및 기본 플랜 선택
  useEffect(() => {
    if (isOpen) {
      // 모달이 처음 열릴 때만 상태 초기화 (showRejectModal은 제외)
      setShowFailModal(false);
      setFailErrorMessage('');
      setIsLoading(false);
      setExistingBillingKey('');
      setHasExistingBillingKey(false);
      setCardInfo(null);
      setExistingCustomerKey('');

      // 빌링키 조회
      checkExistingBillingKey();

      // 고정된 19,000원 플랜을 기본으로 선택
      setSelectedPlanId(fixedPlan.plan_id);
      onPlanSelect?.(fixedPlan.plan_id);
    } else {
      // 모달이 닫힐 때 모든 상태 초기화
      setShowCancelModal(false);
      setShowFailModal(false);
      setShowRejectModal(false);
    }
  }, [isOpen, onPlanSelect, userId, checkExistingBillingKey, fixedPlan.plan_id]);

  // 토스 페이먼츠 빌링키 발급 (구독 결제)
  const handleTossPayment = async () => {
    // 기존 빌링키가 있으면 바로 결제 진행 (URL로 리다이렉트)
    if (hasExistingBillingKey && existingBillingKey) {
      const customerKey =
        existingCustomerKey || (userId ? `customer_${userId}` : `customer_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`);
      const selectedPlan = fixedPlan; // 고정된 19,000원 플랜 사용

      // 기존 빌링키로 직접 결제 처리
      setIsLoading(true);

      try {
        const paymentData = {
          user_id: findEvidenceUserInfo?.data?.user_id || '',
          billingKey: existingBillingKey,
          customerKey,
          email: '',
          orderId: `order_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
          amount: selectedPlan.final_amount,
          orderName: projectName || '사건명',
          payment_type: paymentType,
          payer_name: findEvidenceUserInfo?.data?.name || '',
          payer_email: findEvidenceUserInfo?.data?.email || '',
          project_nm: projectName || '',
          project_id: projectId || '',
          plan_id: selectedPlanId || '',
          subscription_id: '',
          metadata: {},
        };

        const response = await fetchCreatePayment(paymentData);

        if (response.success) {
          console.log('기존 빌링키로 결제 성공:', response);
          onPaymentSuccess?.();
        } else {
          throw new Error(response.message || '결제 처리에 실패했습니다.');
        }
      } catch (error) {
        console.error('기존 빌링키로 결제 실패:', error);
        setFailErrorMessage(error instanceof Error ? error.message : '결제 처리 중 오류가 발생했습니다.');
        setShowFailModal(true);
      } finally {
        setIsLoading(false);
      }
      return;
    }

    const clientKey = import.meta.env.VITE_TOSS_CLIENT_KEY;

    if (!clientKey) {
      console.error('VITE_TOSS_CLIENT_KEY가 설정되지 않았습니다.');
      setFailErrorMessage('결제 설정이 올바르지 않습니다. 관리자에게 문의해주세요.');
      setShowFailModal(true);
      return;
    }

    setIsLoading(true); // 로딩 시작

    try {
      const tossPayments = await loadTossPayments(clientKey);
      console.log('TossPayments 로드 성공');

      const customerKey = userId ? `customer_${userId}` : `customer_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;

      // 구독 결제 (빌링키 발급) 요청
      const result = await tossPayments.requestBillingAuth('카드', {
        customerKey,
        successUrl: `${window.location.origin}/?payment=success&customerKey=${customerKey}&projectName=${encodeURIComponent(projectName || '사건명')}&projectId=${encodeURIComponent(projectId || '')}&planId=${encodeURIComponent(selectedPlanId || '')}&payerName=${encodeURIComponent(findEvidenceUserInfo?.data?.name || '')}&payerEmail=${encodeURIComponent(findEvidenceUserInfo?.data?.email || '')}&userId=${findEvidenceUserInfo?.data?.user_id || ''}&paymentType=${paymentType}&isBillCreate=true`,
        failUrl: `${window.location.origin}/billing/fail`,
      });

      console.log('토스 페이먼츠 빌링키 발급 결과:', result);
    } catch (error) {
      setIsLoading(false);
      console.error('구독 설정 실패:', error);

      // 에러 타입별 처리
      if (error instanceof Error) {
        console.error('에러 메시지:', error.message);
        setFailErrorMessage(`구독 설정 실패: ${error.message}`);
      } else {
        console.error('알 수 없는 에러:', error);
        setFailErrorMessage('구독 설정 중 오류가 발생했습니다. 다시 시도해주세요.');
      }
      setShowFailModal(true);
    }
  };

  if (!isOpen) return null;

  return (
    <div
      className='fixed inset-0 z-[999] flex items-center justify-center bg-black bg-opacity-50'
      onClick={(e) => {
        // 외부 클릭 시 모달이 닫히지 않도록 이벤트 차단
        e.stopPropagation();
      }}
    >
      {/* 사건 초대 거절 확인 모달 */}
      {showRejectModal && (
        <div className='fixed inset-0 z-[9999] flex items-center justify-center bg-black bg-opacity-50'>
          <div
            style={{
              display: 'flex',
              width: '325px',
              padding: '32px',
              flexDirection: 'column',
              justifyContent: 'center',
              alignItems: 'center',
              gap: '24px',
              borderRadius: '16px',
              background: '#FFF',
              boxShadow: '0 0 20px 0 rgba(167, 167, 167, 0.20)',
            }}
          >
            {/* 제목 */}
            <div className='text-center'>
              <h3 className='text-[18px] font-bold text-[#252525]'>초대를 거절하시겠어요?</h3>
            </div>

            {/* 설명 */}
            <div className='text-center'>
              <p className='text-[14px] leading-[20px] text-[#666666]'>
                거절 시 사건에 참여할 수 없습니다. 이후에는 <br /> 다시 초대받아야만 참여할 수 있습니다.
              </p>
            </div>

            {/* 버튼들 */}
            <div className='flex w-full gap-3'>
              <button
                onClick={handleRejectInvitation}
                disabled={isLoading}
                className={`h-[48px] flex-1 rounded-lg text-[16px] font-medium transition-colors ${
                  isLoading ? 'cursor-not-allowed bg-gray-400 text-white' : 'bg-[#004AA4] text-white hover:bg-[#004AA4]/90'
                }`}
              >
                {isLoading ? '처리중...' : '거절하기'}
              </button>
              <button
                onClick={() => setShowRejectModal(false)}
                disabled={isLoading}
                className={`h-[48px] flex-1 rounded-lg border border-[#E5E5E5] text-[16px] font-medium transition-colors ${
                  isLoading ? 'cursor-not-allowed bg-gray-100 text-gray-400' : 'bg-white text-[#212121] hover:bg-[#F5F5F5]'
                }`}
              >
                취소
              </button>
            </div>
          </div>
        </div>
      )}
      {/* 로딩 모달 */}
      {isLoading && (
        <div className='absolute inset-0 z-[1001] flex items-center justify-center bg-black bg-opacity-75'>
          <div className='flex flex-col items-center gap-4 rounded-lg bg-white p-[32px]'>
            <AiOutlineLoading3Quarters className='h-8 w-8 animate-spin text-[#004AA4]' />
            <p className='text-[16px] font-medium text-[#252525]'>결제 진행중...</p>
            <p className='text-[14px] text-[#666666]'>잠시만 기다려주세요.</p>
          </div>
        </div>
      )}

      <div
        className='relative max-w-[325px] bg-white lg:max-w-[497px]'
        style={{
          display: 'inline-flex',
          padding: '32px',
          flexDirection: 'column',
          alignItems: 'flex-start',

          borderRadius: '20px',
          background: '#FFF',

          width: '100%',
        }}
        onClick={(e) => {
          // 모달 컨텐츠 클릭 시 이벤트 전파 차단
          e.stopPropagation();
        }}
      >
        {/* 헤더 */}
        <div className='w-full'>
          <h2 className='text-[24px] font-bold text-[#252525]'>구독 및 결제</h2>
        </div>
        <div className='pt-[32px] text-[18px] font-semibold text-[#1890FF]'>
          {paymentType === 'case_subscription' ? '결제 완료 후 디지털화 작업을 시작합니다.' : '결제 완료 후 사건에 참여할 수 있습니다.'}
        </div>
        {/* 결제 단계 */}
        <div className='w-full pt-[32px]'>
          <div className='flex items-center'>
            <span className='text-[14px] font-medium text-[#5B5B5B]'>결제할 사건</span>
          </div>

          {/* 상품 정보 */}
          <div className='mb-[20px] pt-[8px]'>
            <p className='mb-[4px] text-[20px] font-bold text-[#212121]'>{projectName || '사건명'}</p>
            <p className='text-xs text-gray-500'>
              {(() => {
                const today = new Date();
                const currentDay = today.getDate();
                const nextMonth = new Date(today.getFullYear(), today.getMonth() + 1, currentDay);
                // 다음 달 같은 날짜가 유효하지 않으면 (예: 11월 31일이 없어서 12월 1일이 됨)
                // 해당 월의 마지막 날을 계산
                if (nextMonth.getDate() !== currentDay) {
                  const lastDayOfNextMonth = new Date(today.getFullYear(), today.getMonth() + 2, 0);
                  return `매월 ${currentDay}일 결제 (다음 결제일 ${lastDayOfNextMonth.toLocaleDateString('ko-KR', {
                    month: 'long',
                    day: 'numeric',
                  })})`;
                }
                return `매월 ${currentDay}일 결제 (다음 결제일 ${nextMonth.toLocaleDateString('ko-KR', {
                  month: 'long',
                  day: 'numeric',
                })})`;
              })()}
            </p>

            {/* 기존 카드 정보 표시 */}
            {hasExistingBillingKey && cardInfo && (
              <div className='mt-[20px]'>
                <p className='text-[14px] font-semibold text-[#5B5B5B]'>결제 수단</p>
                <div className='itmems-center flex justify-between'>
                  <p className='max-w-[240px] text-[16px] font-semibold text-[#212121]'>
                    {cardInfo.company} 카드, {cardInfo.number}
                  </p>
                  <p className='text-[#8E8E8E]'>기본 결제 카드</p>
                </div>
              </div>
            )}
          </div>
          {paymentType === 'case_participation' && <div className='border-b border-[#E5E5E5]'></div>}

          {/* 고정된 19,000원 플랜 정보 - case_subscription일 때만 표시 */}
          {paymentType === 'case_subscription' && (
            <div className='w-full rounded-[8px] border-2 border-[#1890FF] bg-[#F3F9FF] p-[22px]'>
              <div className='mb-[16px] flex justify-between'>
                <div className='text-[18px] font-semibold text-[#252525]'>{fixedPlan.plan_name}</div>
                <div>
                  <FaCheckCircle className='text-[20px] text-[#1890FF]' />
                </div>
              </div>

              <div className='space-y-[4px]'>
                {fixedPlan.plan_description.map((description, index) => (
                  <div key={index} className='flex items-center gap-2'>
                    <span className='text-[16px] text-[#1890FF]'>
                      <FaCheck />
                    </span>
                    <span className='text-[16px] leading-[26px] text-[#5B5B5B]'>{description}</span>
                  </div>
                ))}
              </div>

              <div className='mt-[16px]'>
                <span className='pr-[8px] text-[20px] font-semibold text-[#252525]'>사건당</span>
                <span className='text-[20px] font-semibold text-[#252525]'>
                  ₩{fixedPlan.final_amount.toLocaleString()}
                  <span className='pl-[4px] text-[18px] font-normal text-[#8E8E8E]'>
                    / {fixedPlan.interval === 'month' ? '월' : fixedPlan.interval === 'year' ? '년' : fixedPlan.interval}
                  </span>
                </span>
              </div>
            </div>
          )}

          {/* 결제 금액 */}
          <div className='mt-[20px] w-full'>
            <div className='mb-[8px] text-[14px] font-medium text-[#5B5B5B]'>결제 금액</div>
            <div className='text-[28px] font-bold text-[#212121]'>
              ₩{fixedPlan.final_amount.toLocaleString()}{' '}
              <span className='text-[18px] font-normal text-[#8E8E8E]'>
                / {fixedPlan.interval === 'month' ? '월' : fixedPlan.interval === 'year' ? '년' : fixedPlan.interval}
              </span>
            </div>
            <div className='flex items-center justify-between text-[14px] font-medium text-[#1890FF]'>
              {paymentType === 'case_participation' && isInvited && (
                <button
                  onClick={() => setShowRejectModal(true)}
                  className='rounded-lg bg-[#F3F3F3] px-4 py-2 text-[14px] font-medium text-[#212121]'
                >
                  사건초대 거절
                </button>
              )}
            </div>
          </div>

          {/* 결제 버튼들 */}
          <div className='mt-[20px] flex w-full gap-3'>
            <button
              onClick={handleTossPayment}
              disabled={isLoading}
              className={`h-[48px] flex-1 rounded-lg text-[16px] font-medium transition-colors ${
                isLoading ? 'cursor-not-allowed bg-gray-400 text-white' : 'bg-[#004AA4] text-white hover:bg-[#004AA4]/90'
              }`}
            >
              결제하기
            </button>
            <button
              onClick={() => setShowCancelModal(true)}
              disabled={isLoading}
              className={`h-[48px] flex-1 rounded-lg border border-[#E5E5E5] text-[16px] font-medium transition-colors ${
                isLoading ? 'cursor-not-allowed bg-gray-100 text-gray-400' : 'bg-white text-[#212121] hover:bg-[#F5F5F5]'
              }`}
            >
              취소
            </button>
          </div>
        </div>
      </div>

      {/* 취소 확인 모달 */}
      {showCancelModal && (
        <div className='fixed inset-0 z-[1000] flex items-center justify-center bg-black bg-opacity-50'>
          <div
            style={{
              display: 'flex',
              width: '325px',
              padding: '32px',
              flexDirection: 'column',
              justifyContent: 'center',
              alignItems: 'center',
              gap: '24px',
              borderRadius: '16px',
              background: '#FFF',
              boxShadow: '0 0 20px 0 rgba(167, 167, 167, 0.20)',
            }}
          >
            {/* 제목 */}
            <div className='text-center'>
              <h3 className='text-[18px] font-bold text-[#252525]'>정말 취소하시겠어요?</h3>
            </div>

            {/* 설명 */}
            <div className='text-center'>
              <p className='text-[14px] leading-[20px] text-[#666666]'>
                {paymentType === 'case_subscription' ? (
                  <>
                    지금 취소하시면, 결제 전까지 증거문서를
                    <br />
                    디지털화 변환할 수 없습니다.
                  </>
                ) : (
                  <>
                    지금 취소하시면, 사건 참여 요청이
                    <br />
                    승인되지 않습니다.
                  </>
                )}
              </p>
            </div>

            {/* 버튼들 */}
            <div className='flex w-full gap-3'>
              <button
                onClick={onClose}
                className='h-[48px] flex-1 rounded-lg bg-[#004AA4] text-[16px] font-medium text-white transition-colors hover:bg-[#004AA4]/90'
              >
                나중에 결제하기
              </button>
              <button
                onClick={() => setShowCancelModal(false)}
                className='h-[48px] flex-1 rounded-lg border border-[#E5E5E5] bg-white text-[16px] font-medium text-[#212121] transition-colors hover:bg-[#F5F5F5]'
              >
                이전으로 돌아가기
              </button>
            </div>
          </div>
        </div>
      )}

      {/* 결제 실패 모달 */}
      {showFailModal && (
        <div className='fixed inset-0 z-[1000] flex items-center justify-center bg-black bg-opacity-50'>
          <div
            style={{
              display: 'flex',
              width: '325px',
              padding: '32px',
              flexDirection: 'column',
              justifyContent: 'center',
              alignItems: 'center',
              gap: '24px',
              borderRadius: '16px',
              background: '#FFF',
              boxShadow: '0 0 20px 0 rgba(167, 167, 167, 0.20)',
            }}
          >
            {/* 제목 */}
            <div className='text-center'>
              <h3 className='text-[18px] font-bold text-[#252525]'>결제 실패</h3>
            </div>

            {/* 에러 메시지 */}
            <div className='text-center'>
              <p className='text-[14px] leading-[20px] text-[#666666]'>{failErrorMessage}</p>
            </div>

            {/* 버튼들 */}
            <div className='flex w-full gap-3'>
              <button
                onClick={() => {
                  setShowFailModal(false);
                  handleTossPayment(); // 다시 결제 시도
                }}
                className='h-[48px] flex-1 rounded-lg bg-[#004AA4] text-[16px] font-medium text-white transition-colors hover:bg-[#004AA4]/90'
              >
                다시 결제하기
              </button>
              <button
                onClick={() => setShowFailModal(false)}
                className='h-[48px] flex-1 rounded-lg border border-[#E5E5E5] bg-white text-[16px] font-medium text-[#212121] transition-colors hover:bg-[#F5F5F5]'
              >
                취소
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
