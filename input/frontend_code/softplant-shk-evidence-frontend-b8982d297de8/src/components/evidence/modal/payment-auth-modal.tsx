import { useState, useEffect, useCallback, useMemo } from 'react';

import { loadTossPayments } from '@tosspayments/payment-sdk';
import { AiOutlineLoading3Quarters } from 'react-icons/ai';
import { FaUser, FaCheckCircle } from 'react-icons/fa';

import { fetchGetBillingKey, fetchCreatePayment, fetchCreateBillingKey } from '@/apis/payment-api';
import { onMessageToast } from '@/components/utils';
import { useFindUserInfo, useFindProjectMembers } from '@/hooks/react-query';

// 새로운 빌링키 생성 API 함수 (향후 사용 예정)
const _fetchCreateBillingKey = async (customerKey: string, authKey: string) => {
  const response = await fetch(`/api/payment/billingKey/create?customerKey=${customerKey}&authKey=${authKey}`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
  });

  if (!response.ok) {
    throw new Error('빌링키 생성에 실패했습니다.');
  }

  return response.json();
};

// 결제 승인 API 함수 (기존 fetchCreatePayment 사용)
const fetchApprovePayment = async (paymentData: any) => {
  console.log('결제 데이터 전송:', paymentData);

  try {
    // 기존 fetchCreatePayment API 사용
    const result = await fetchCreatePayment(paymentData);
    console.log('API 응답 데이터:', result);
    return result;
  } catch (error: any) {
    console.error('API 호출 에러:', error);
    console.error('에러 응답 데이터:', error.response?.data);
    console.error('에러 상태 코드:', error.response?.status);
    console.error('에러 메시지:', error.message);
    throw error;
  }
};

type TInvitedMember = {
  email: string;
  thumbnail?: boolean;
  thumbnail_url?: string;
  user_nm?: string;
  nickname?: string;
  user_color?: string;
};

interface IPaymentModalProps {
  isOpen: boolean;
  onClose: () => void;
  onPayment: () => void;
  projectName?: string;
  projectId?: string;
  userId?: string;
  newBillingKey?: string;
  newCustomerKey?: string;
  invitedMembers?: TInvitedMember[];
  onPaymentSuccess?: (memberPaymentMethods: Record<string, 'me' | 'participant'>) => void;
  isInviting?: boolean;
}

export const PaymentParticipationModal = ({
  isOpen,
  onClose,
  projectName,
  projectId,
  userId,
  newBillingKey,
  newCustomerKey,
  invitedMembers = [],
  onPaymentSuccess,
  isInviting = false,
}: IPaymentModalProps) => {
  console.log('PaymentParticipationModal 렌더링:', {
    isOpen,
    newBillingKey,
    newCustomerKey,
    projectName,
    projectId,
    userId,
    invitedMembers,
  });

  // props 변화 추적
  useEffect(() => {
    console.log('PaymentParticipationModal props 변화:', { newBillingKey, newCustomerKey, isOpen });
  }, [newBillingKey, newCustomerKey, isOpen]);

  const [showCancelModal, setShowCancelModal] = useState(false);
  const [showFailModal, setShowFailModal] = useState(false);
  const [showCardRegisteredModal, setShowCardRegisteredModal] = useState(false);
  const [failErrorMessage, setFailErrorMessage] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [_existingBillingKey, setExistingBillingKey] = useState<string>('');
  const [hasExistingBillingKey, setHasExistingBillingKey] = useState<boolean>(false);
  const [cardInfo, setCardInfo] = useState<any>(null);
  const [_existingCustomerKey, setExistingCustomerKey] = useState<string>('');
  const [_pendingBillingKey, setPendingBillingKey] = useState<string>('');
  const [_pendingCustomerKey, setPendingCustomerKey] = useState<string>('');

  // 멤버별 결제 방식 관리 (내가 결제: 'me', 참여자가 결제: 'participant')
  const [memberPaymentMethods, setMemberPaymentMethods] = useState<Record<string, 'me' | 'participant'>>({});

  // 사용자 정보 조회
  const { response: findEvidenceUserInfo } = useFindUserInfo();

  // 프로젝트 멤버 조회 (React Query hook 사용) - 모달이 열릴 때만 호출
  const { response: projectMembersResponse } = useFindProjectMembers({
    projectId: projectId || '',
    enabled: isOpen && !!projectId, // 모달이 열리고 projectId가 있을 때만 호출
  });
  const projectMembers = useMemo(() => projectMembersResponse?.data?.members || [], [projectMembersResponse?.data?.members]);

  // 빌링키 조회 함수
  const checkExistingBillingKey = useCallback(async () => {
    console.log('checkExistingBillingKey 호출됨:', { userId, newBillingKey, newCustomerKey });
    if (!userId) return;

    // 새로 발급받은 빌링키가 있으면 그것을 사용
    if (newBillingKey && newCustomerKey) {
      console.log('새로 발급받은 빌링키 사용:', { newBillingKey, newCustomerKey });
      setExistingBillingKey(newBillingKey);
      setExistingCustomerKey(newCustomerKey);
      setHasExistingBillingKey(true);
      console.log('새 빌링키로 상태 설정 완료');

      // 새로 발급받은 빌링키의 카드 정보를 조회
      try {
        const response = await fetchGetBillingKey(newCustomerKey, '');
        if (response.success && response.data && response.data.length > 0) {
          const billingData = response.data[0];
          setCardInfo(billingData.card);
        }
      } catch (error) {
        console.error('새 빌링키 카드 정보 조회 실패:', error);
      }
      return;
    }

    // 기존 빌링키 조회 (빈 문자열로 호출 - 백엔드에서 자동으로 로그인 사용자의 빌링키 반환)
    try {
      const response = await fetchGetBillingKey('', '');

      if (response.success && response.data && response.data.length > 0) {
        const billingData = response.data[0];
        setExistingBillingKey(billingData.billingKey);
        setExistingCustomerKey(billingData.customerKey);
        setHasExistingBillingKey(true);
        setCardInfo(billingData.card);
        console.log('기존 빌링키 조회 성공:', billingData.billingKey);
      } else {
        setHasExistingBillingKey(false);
        setExistingCustomerKey('');
        console.log('기존 빌링키 없음');
      }
    } catch (error) {
      console.error('빌링키 조회 실패:', error);
      setHasExistingBillingKey(false);
    }
  }, [userId, newBillingKey, newCustomerKey]);

  // newBillingKey나 newCustomerKey가 변경되면 빌링키 조회 다시 실행
  useEffect(() => {
    if (isOpen && (newBillingKey || newCustomerKey)) {
      console.log('새 빌링키 정보 감지, 빌링키 조회 재실행');
      checkExistingBillingKey();
    }
  }, [newBillingKey, newCustomerKey, isOpen, checkExistingBillingKey]);

  // 모달이 열릴 때 빌링키 조회
  useEffect(() => {
    if (isOpen && projectId) {
      console.log('모달이 열렸습니다. 빌링키 조회 시작');
      // 빌링키 조회 실행
      checkExistingBillingKey();
    }
  }, [isOpen, projectId, checkExistingBillingKey]);

  // 모달이 열릴 때마다 상태 초기화 및 기본 플랜 선택
  useEffect(() => {
    if (isOpen) {
      setShowCancelModal(false);
      setShowFailModal(false);

      setShowCardRegisteredModal(false);
      setFailErrorMessage('');
      setIsLoading(false);
      setPendingBillingKey('');
      setPendingCustomerKey('');
      // 빌링키 관련 상태는 초기화하지 않음 (checkExistingBillingKey에서 설정됨)

      // invitedMembers가 있으면 초대 멤버 사용, 없으면 기존 프로젝트 멤버 사용
      const initialPaymentMethods: Record<string, 'me' | 'participant'> = {};

      if (invitedMembers && invitedMembers.length > 0) {
        // 초대 멤버별 결제 방식 초기화 (기본값: 참여자가 결제)
        invitedMembers.forEach((member) => {
          initialPaymentMethods[member.email] = 'participant';
        });
      } else {
        // 나 자신을 제외한 멤버들만 필터링
        const currentUserId = findEvidenceUserInfo?.data?.user_id;
        const filteredMembers = projectMembers.filter((member) => member.user_id !== currentUserId);

        // 멤버별 결제 방식 초기화 (기본값: 참여자가 결제)
        filteredMembers.forEach((member) => {
          initialPaymentMethods[member.user_id] = 'participant';
        });
      }

      setMemberPaymentMethods(initialPaymentMethods);
    } else {
      // 모달이 닫힐 때 상태 초기화
      setShowCancelModal(false);
      setShowFailModal(false);

      setShowCardRegisteredModal(false);
      setFailErrorMessage('');
      setIsLoading(false);
      setExistingBillingKey('');
      setHasExistingBillingKey(false);
      setCardInfo(null);
      setExistingCustomerKey('');
      setPendingBillingKey('');
      setPendingCustomerKey('');
    }
  }, [isOpen, projectMembers, findEvidenceUserInfo?.data?.user_id, invitedMembers]);

  // 결제 금액 계산 함수
  const calculatePaymentAmounts = useCallback(() => {
    const payments: Array<{
      type: 'case_subscription' | 'case_participation';
      amount: number;
      memberId: string;
      memberName: string;
    }> = [];

    // invitedMembers가 있으면 초대 멤버 사용, 없으면 기존 프로젝트 멤버 사용
    if (invitedMembers && invitedMembers.length > 0) {
      // 초대 멤버별 결제 처리 (참여자별 19,000원)
      invitedMembers.forEach((member) => {
        const paymentMethod = memberPaymentMethods[member.email];
        if (paymentMethod === 'me') {
          payments.push({
            type: 'case_participation',
            amount: 19000,
            memberId: member.email,
            memberName: member.email,
          });
        }
        // 참여자가 결제하는 경우는 0원이므로 추가하지 않음
      });
    } else {
      // 기존 프로젝트 멤버 처리
      const currentUserId = findEvidenceUserInfo?.data?.user_id;
      const filteredMembers = projectMembers.filter((member) => member.user_id !== currentUserId);

      // 멤버별 결제 처리
      filteredMembers.forEach((member) => {
        const paymentMethod = memberPaymentMethods[member.user_id];
        if (paymentMethod === 'me') {
          payments.push({
            type: 'case_participation',
            amount: 19000,
            memberId: member.user_id,
            memberName: member.name,
          });
        }
        // 참여자가 결제하는 경우는 0원이므로 추가하지 않음
      });
    }

    const totalAmount = payments.reduce((sum, payment) => sum + payment.amount, 0);

    return { totalAmount, payments };
  }, [projectMembers, memberPaymentMethods, findEvidenceUserInfo?.data?.user_id, invitedMembers]);

  // 토스 페이먼츠 빌링키 발급 (구독 결제)
  const handleTossPayment = useCallback(async () => {
    const { payments, totalAmount } = calculatePaymentAmounts();

    // 결제 금액이 0원인 경우 (모든 사용자가 "참여자가 결제" 선택)
    if (totalAmount === 0) {
      console.log('결제 금액이 0원 - 바로 성공 처리');
      console.log('memberPaymentMethods:', memberPaymentMethods);
      setIsLoading(true); // 로딩 상태 설정
      onMessageToast({
        message: '결제가 완료되었습니다',
        icon: <FaCheckCircle className='h-5 w-5 text-[#004AA4]' />,
      });
      onPaymentSuccess?.(memberPaymentMethods);
      return;
    }

    // 기존 빌링키가 있으면 바로 결제 진행
    if (hasExistingBillingKey && _existingBillingKey) {
      console.log('빌링키가 있음 - 기존 빌링키로 결제 진행');
      setIsLoading(true);

      const currentBillingKey = _existingBillingKey;
      const currentCustomerKey = _existingCustomerKey || (userId ? `customer_${userId}` : '');

      try {
        console.log('결제 시작 - 빌링키:', currentBillingKey);
        console.log('결제 시 사용할 customerKey:', currentCustomerKey);

        // 결제 유형별 플랜 ID 설정
        const getPlanId = (paymentType: string) => {
          if (paymentType === 'case_subscription') {
            return 'plan_01K5B9Y83AKY5XX8Z78D7HSC73'; // 사건 생성/구독 결제 (19,000원)
          }
          if (paymentType === 'case_participation') {
            return 'plan_01K7GPCHPZXX4CZM6TTRYAA2CW'; // 사건 참여 결제 (19,000원)
          }
          return '';
        };

        // 각 결제를 개별적으로 처리
        for (const payment of payments) {
          console.log(`처리 중인 결제:`, payment);

          const paymentData = {
            user_id: '',
            email: payment.memberId,
            billingKey: currentBillingKey,
            customerKey: currentCustomerKey,
            orderId: `order_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
            amount: payment.amount,
            orderName: `${projectName || '사건명'} - ${payment.memberName}`,
            payment_type: payment.type,
            payer_name: findEvidenceUserInfo?.data?.name || '',
            payer_email: findEvidenceUserInfo?.data?.email || '',
            project_nm: projectName || '',
            project_id: projectId || '',
            plan_id: getPlanId(payment.type),
            subscription_id: '',
            metadata: {},
          };

          const response = await fetchApprovePayment(paymentData);
          console.log(`${payment.memberName} API 응답:`, response);

          if (!response.success) {
            throw new Error(response.message || `${payment.memberName} 결제 처리에 실패했습니다.`);
          }

          console.log(`${payment.memberName} 결제 성공:`, response);
        }

        // 모든 결제가 완료되면 성공 처리
        console.log('모든 결제 완료');
        onMessageToast({
          message: '결제가 완료되었습니다. ',
          icon: <FaCheckCircle className='h-5 w-5 text-green-500' />,
        });
        onPaymentSuccess?.(memberPaymentMethods);
      } catch (error) {
        console.error('결제 실패:', error);
        setFailErrorMessage(error instanceof Error ? error.message : '결제 처리 중 오류가 발생했습니다.');
        setShowFailModal(true);
      } finally {
        setIsLoading(false);
      }
      return;
    }

    // 빌링키가 없으면 토스 빌링키 발급 화면으로 이동
    const clientKey = import.meta.env.VITE_TOSS_CLIENT_KEY;

    if (!clientKey) {
      console.error('VITE_TOSS_CLIENT_KEY가 설정되지 않았습니다.');
      setFailErrorMessage('결제 설정이 올바르지 않습니다. 관리자에게 문의해주세요.');
      setShowFailModal(true);
      return;
    }

    setIsLoading(true);

    try {
      const tossPayments = await loadTossPayments(clientKey);
      const customerKey = userId ? `customer_${userId}` : `customer_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;

      await tossPayments.requestBillingAuth('카드', {
        customerKey,
        successUrl: `${window.location.origin}/payment?tab=case-list&payment=success&customerKey=${customerKey}&projectName=${encodeURIComponent(projectName || '사건명')}&projectId=${encodeURIComponent(projectId || '')}&userId=${userId}&isBillCreate=true`,
        failUrl: `${window.location.origin}/payment?tab=case-list&payment=fail`,
      });

      console.log('토스 페이먼츠 빌링키 발급 요청');
    } catch (error) {
      setIsLoading(false);
      console.error('빌링키 발급 실패:', error);
      setFailErrorMessage('빌링키 발급 중 오류가 발생했습니다. 다시 시도해주세요.');
      setShowFailModal(true);
    }
  }, [
    userId,
    _existingBillingKey,
    _existingCustomerKey,
    projectName,
    projectId,
    findEvidenceUserInfo?.data?.name,
    findEvidenceUserInfo?.data?.email,
    onPaymentSuccess,
    calculatePaymentAmounts,
    hasExistingBillingKey,
    memberPaymentMethods,
  ]);

  // URL 파라미터 확인 - 빌링키 발급 성공 후 돌아왔을 때
  useEffect(() => {
    const checkBillingKeyFromUrl = async () => {
      const urlParams = new URLSearchParams(window.location.search);
      const paymentStatus = urlParams.get('payment');
      const isBillCreate = urlParams.get('isBillCreate');
      const urlProjectId = urlParams.get('projectId');
      const customerKey = urlParams.get('customerKey');
      const authKey = urlParams.get('authKey');

      // 빌링키 발급 성공 후 돌아온 경우
      if (isOpen && paymentStatus === 'success' && isBillCreate === 'true' && urlProjectId === projectId && authKey && customerKey) {
        console.log('authKey 받음 - 빌링키 생성 시작:', { customerKey, authKey });

        try {
          // 1. 먼저 빌링키 생성 API 호출 (/payment/billingKey/create)
          const createResponse = await fetchCreateBillingKey(customerKey, authKey);

          console.log('빌링키 생성 API 응답:', createResponse);

          if (!createResponse.success) {
            console.error('빌링키 생성 실패:', createResponse.message);
            setFailErrorMessage('빌링키 생성에 실패했습니다.');
            setShowFailModal(true);
            return;
          }

          // 2. 빌링키 생성 성공 후 실제 빌링키 조회
          console.log('빌링키 생성 성공 - 빌링키 조회 시작');
          const response = await fetchGetBillingKey('', '');

          if (response.success && response.data && response.data.length > 0) {
            const billingData = response.data[0];
            const actualBillingKey = billingData.billingKey;
            const actualCustomerKey = billingData.customerKey;
            console.log('실제 빌링키 조회 성공:', actualBillingKey);

            // 빌링키를 임시 상태에 저장
            setPendingBillingKey(actualBillingKey);
            setPendingCustomerKey(actualCustomerKey);

            // 즉시 카드 정보도 설정 (나중에 "예, 결제하기" 클릭 시 사용)
            if (billingData.card) {
              setCardInfo(billingData.card);
            }

            // URL 파라미터 제거
            const newUrl = window.location.pathname + '?tab=case-list';
            window.history.replaceState({}, '', newUrl);

            // 카드 등록 성공 모달 표시
            setShowCardRegisteredModal(true);
          } else {
            console.error('빌링키 조회 실패');
            setFailErrorMessage('빌링키 조회에 실패했습니다.');
            setShowFailModal(true);
          }
        } catch (error) {
          console.error('빌링키 생성/조회 실패:', error);
          setFailErrorMessage('빌링키 처리 중 오류가 발생했습니다.');
          setShowFailModal(true);
        }
      }
    };

    checkBillingKeyFromUrl();
  }, [isOpen, projectId]);

  if (!isOpen) return null;

  return (
    <div className='fixed inset-0 z-[999] flex items-center justify-center bg-black bg-opacity-50'>
      {/* 로딩 모달 */}
      {(isLoading || isInviting) && (
        <div className='absolute inset-0 z-[1001] flex items-center justify-center bg-black bg-opacity-75'>
          <div className='flex flex-col items-center gap-4 rounded-lg bg-white p-[32px]'>
            <AiOutlineLoading3Quarters className='h-8 w-8 animate-spin text-[#004AA4]' />
            <p className='text-[16px] font-medium text-[#252525]'>{isInviting ? '초대 진행중...' : '결제 진행중...'}</p>
            <p className='text-[14px] text-[#666666]'>잠시만 기다려주세요.</p>
          </div>
        </div>
      )}

      <div
        className='relative max-h-[90vh] overflow-y-auto bg-white'
        style={{
          display: 'inline-flex',
          padding: '32px',
          flexDirection: 'column',
          alignItems: 'flex-start',

          borderRadius: '20px',
          background: '#FFF',
          maxWidth: '500px',
          width: '100%',
        }}
      >
        {/* 헤더 */}
        <div className='w-full'>
          <h2 className='text-[24px] font-bold text-[#252525]'>구독 및 결제</h2>
        </div>

        {/* 결제 단계 */}
        <div className='w-full pt-[32px]'>
          <div className='flex items-center'>
            <span className='text-[14px] font-medium text-[#5B5B5B]'>결제할 사건</span>
          </div>

          {/* 상품 정보 */}
          <div className='mb-[20px] pt-[8px]'>
            <div className='flex items-center justify-between'>
              <p className='mb-[4px] text-[20px] font-bold text-[#212121]'>{projectName || '사건명'}</p>
            </div>
            <div className='flex items-center justify-between'>
              <p className='text-xs text-gray-500'>
                매월 {new Date().getDate()}일 결제 (다음 결제일{' '}
                {new Date(new Date().setMonth(new Date().getMonth() + 1)).toLocaleDateString('ko-KR', {
                  month: 'long',
                  day: 'numeric',
                })}
                )
              </p>
            </div>

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

          {/* 결제 멤버 섹션 */}
          {(() => {
            // invitedMembers가 있으면 초대 멤버 사용, 없으면 기존 프로젝트 멤버 사용
            const membersToDisplay =
              invitedMembers && invitedMembers.length > 0
                ? invitedMembers
                : (() => {
                    const currentUserId = findEvidenceUserInfo?.data?.user_id;
                    return projectMembers.filter((member) => member.user_id !== currentUserId);
                  })();

            const isInvitedMode = invitedMembers && invitedMembers.length > 0;

            return (
              membersToDisplay.length > 0 && (
                <div className='mb-[20px]'>
                  <p className='mb-[12px] text-[14px] font-medium text-[#5B5B5B]'>결제 멤버</p>
                  <div className='space-y-[12px]'>
                    {membersToDisplay.map((member: any) => {
                      const memberId = isInvitedMode ? member.email : member.user_id;
                      const memberName = isInvitedMode ? member.email : member.name;

                      return (
                        <div key={memberId} className='items-center justify-between rounded-[8px] bg-[#F7F8F8] px-[16px] py-[12px]'>
                          <div className='flex items-center space-x-3'>
                            <div className='flex h-[24px] w-[24px] items-center justify-center rounded-full bg-[#E5E5E5]'>
                              <FaUser className='text-[14px] text-[#fff]' />
                            </div>
                            <span className='text-[14px] font-medium text-[#5B5B5B]'>{memberName}</span>
                          </div>

                          <div className='mt-[12px] flex items-center justify-between space-x-4'>
                            <div className='flex items-center space-x-4'>
                              <label className='flex items-center space-x-2'>
                                <input
                                  type='radio'
                                  name={`payment_${memberId}`}
                                  value='me'
                                  checked={memberPaymentMethods[memberId] === 'me'}
                                  onChange={() =>
                                    setMemberPaymentMethods((prev) => ({
                                      ...prev,
                                      [memberId]: 'me',
                                    }))
                                  }
                                  className='text-[#004AA4]'
                                />
                                <span className='text-[14px] text-[#5B5B5B]'>내가 결제</span>
                              </label>

                              <label className='flex items-center space-x-2'>
                                <input
                                  type='radio'
                                  name={`payment_${memberId}`}
                                  value='participant'
                                  checked={memberPaymentMethods[memberId] === 'participant'}
                                  onChange={() =>
                                    setMemberPaymentMethods((prev) => ({
                                      ...prev,
                                      [memberId]: 'participant',
                                    }))
                                  }
                                  className='text-[#004AA4]'
                                />
                                <span className='text-[14px] text-[#5B5B5B]'>참여자가 결제</span>
                              </label>
                            </div>
                            <span className='text-[16px] text-[#5B5B5B]'>
                              {memberPaymentMethods[memberId] === 'me' ? '19,000원' : '0원'}
                            </span>
                          </div>

                          {/* 결제자 표시 */}
                          {memberPaymentMethods[memberId] === 'participant' && (
                            <div className='mt-[10px] text-[14px] text-[#1890FF]'>{memberName}님이 결제해요.</div>
                          )}
                        </div>
                      );
                    })}
                  </div>
                </div>
              )
            );
          })()}
          <div className='mt-[16px] border-t border-[#E5E5E5]'></div>
          {/* 결제 금액 */}
          {(() => {
            const { totalAmount } = calculatePaymentAmounts();

            return (
              <div className='mt-[20px] w-full'>
                <div className='mb-[8px] text-[14px] font-medium text-[#5B5B5B]'>결제 금액</div>
                <div className='text-[28px] font-bold text-[#212121]'>
                  ₩{totalAmount.toLocaleString()}
                  <span className='text-[18px] font-normal text-[#8E8E8E]'> /월</span>
                </div>
                <div className='text-[14px] font-medium text-[#1890FF]'>결제 완료 후 사건에 참여할 수 있습니다.</div>
              </div>
            );
          })()}

          {/* 결제 버튼들 */}
          <div className='mt-[20px] flex w-full gap-3'>
            <button
              onClick={handleTossPayment}
              disabled={isLoading || isInviting}
              className={`h-[48px] flex-1 rounded-lg text-[16px] font-medium transition-colors ${
                isLoading || isInviting ? 'cursor-not-allowed bg-gray-400 text-white' : 'bg-[#004AA4] text-white hover:bg-[#004AA4]/90'
              }`}
            >
              {/* 결제하기로 이름 통일 */}
              {/*    {(() => {
                const { totalAmount } = calculatePaymentAmounts();
                if (isLoading || isInviting) {
                  return (
                    <div className='flex items-center justify-center'>
                      <div className='mr-2 h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent'></div>
                      {isInviting ? '초대 중...' : totalAmount === 0 ? '초대 중...' : '결제 진행중...'}
                    </div>
                  );
                }
                if (totalAmount === 0) return '초대하기';
                return hasExistingBillingKey ? '결제하기' : '카드 등록 및 결제하기';
              })()} */}
              결제하기
            </button>
            <button
              onClick={() => setShowCancelModal(true)}
              disabled={isLoading || isInviting}
              className={`h-[48px] flex-1 rounded-lg border border-[#E5E5E5] text-[16px] font-medium transition-colors ${
                isLoading || isInviting ? 'cursor-not-allowed bg-gray-100 text-gray-400' : 'bg-white text-[#212121] hover:bg-[#F5F5F5]'
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
              {isInviting || (invitedMembers && invitedMembers.length > 0) ? (
                <p className='text-[14px] leading-[20px] text-[#666666]'>
                  지금 취소하실 경우,
                  <br />
                  초대하기가 자동으로 취소됩니다.
                </p>
              ) : (
                <p className='text-[14px] leading-[20px] text-[#666666]'>
                  지금 취소하시면, 결제 전까지 증거문서를
                  <br />
                  디지털화 변환할 수 없습니다.
                </p>
              )}
            </div>

            {/* 버튼들 */}
            <div className='flex w-full gap-3'>
              <button
                onClick={onClose}
                className='h-[48px] flex-1 rounded-lg bg-[#004AA4] text-[16px] font-medium text-white transition-colors hover:bg-[#004AA4]/90'
              >
                {isInviting || (invitedMembers && invitedMembers.length > 0) ? '취소하기' : '나중에 결제하기'}
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

      {/* 카드 등록 성공 확인 모달 */}
      {showCardRegisteredModal && (
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
              <h3 className='text-[18px] font-bold text-[#252525]'>카드 등록이 완료되었습니다</h3>
            </div>

            {/* 설명 */}
            <div className='mb-[24px] mt-[16px] text-center'>
              <p className='text-[14px] leading-[20px] text-[#666666]'>
                결제 카드가 성공적으로 등록되었습니다.
                <br />
                지금 바로 결제를 진행하시겠습니까?
              </p>
            </div>

            {/* 버튼들 */}
            <div className='flex w-full gap-3'>
              <button
                onClick={async () => {
                  setShowCardRegisteredModal(false);

                  // 빌링키 상태를 최신으로 갱신
                  console.log('빌링키 상태 갱신 시작');
                  await checkExistingBillingKey();

                  // 잠시 대기 후 결제 진행 (상태 업데이트 완료 대기)
                  setTimeout(() => {
                    console.log('사용자 확인 후 결제 진행');
                    handleTossPayment();
                  }, 500);
                }}
                className='h-[48px] flex-1 rounded-lg bg-[#004AA4] text-[16px] font-medium text-white transition-colors hover:bg-[#004AA4]/90'
              >
                예, 결제하기
              </button>
              <button
                onClick={() => {
                  setShowCardRegisteredModal(false);
                  setPendingBillingKey('');
                  setPendingCustomerKey('');
                  onClose();
                }}
                className='h-[48px] flex-1 rounded-lg border border-[#E5E5E5] bg-white text-[16px] font-medium text-[#212121] transition-colors hover:bg-[#F5F5F5]'
              >
                나중에
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
