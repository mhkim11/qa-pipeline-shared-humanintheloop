import { useState, useEffect, useMemo } from 'react';

import { IoIosWarning, IoMdCheckmarkCircle, IoIosAlert, IoIosArrowForward } from 'react-icons/io';
import { useNavigate } from 'react-router-dom';

import { useFindUserInfo } from '@query/query';
// import { CTALine } from '@/components/common';
import ModalSelect from '@/components/common/modal/modal-select';
import { LawyerVerificationModal } from '@/components/evidence/modal/lawyer-verification-modal';
import { PaymentModal } from '@/components/evidence/modal/payment-modal';
import { onMessageToast } from '@/components/utils';
import { useProcessJoinRequest, useListNotification, useFindAllEvidenceList, useRejectProjectInvitation } from '@/hooks/react-query';

export const NotificationTable = (): JSX.Element => {
  const navigate = useNavigate();

  const [isRefusalModalOpen, setIsRefusalModalOpen] = useState(false);
  const [isSuperRoleModalOpen, setIsSuperRoleModalOpen] = useState(false);
  const [isRejectModalOpen, setIsRejectModalOpen] = useState(false);
  const [isLawyerVerificationModalOpen, setIsLawyerVerificationModalOpen] = useState(false);
  const [selectedRequestId, setSelectedRequestId] = useState<string>('');

  // 결제 모달 상태
  const [isPaymentModalOpen, setIsPaymentModalOpen] = useState(false);
  const [selectedNotification, setSelectedNotification] = useState<any>(null);
  const [isPrePaidPaymentModalOpen, setIsPrePaidPaymentModalOpen] = useState(false);
  const [selectedPrePaidNotification, setSelectedPrePaidNotification] = useState<any>(null);
  // ! 유저정보 api 호출

  const { response: findEvidenceUserInfo } = useFindUserInfo();
  const fontSizeAdjustment = findEvidenceUserInfo?.data?.font_size_rate || 0;

  // 모달이 열릴 때 상태 초기화
  useEffect(() => {
    setIsPaymentModalOpen(false);
    setSelectedNotification(null);
    setIsPrePaidPaymentModalOpen(false);
    setSelectedPrePaidNotification(null);
    setIsLawyerVerificationModalOpen(false);
  }, []);
  const { response: notificationListResponse, refetch } = useListNotification({
    page_no: '',
    block_cnt: '10000',
  });
  const notifications = useMemo(() => notificationListResponse?.data.notifications || [], [notificationListResponse?.data.notifications]);

  // ! 프로젝트 목록 조회 (결제 상태 확인용)
  const { response: allEvidenceListResponse } = useFindAllEvidenceList({
    page_no: 1,
    block_cnt: 10000,
    keyword: '',
    isActive: true,
    isFinish: false,
    sort_column: '',
    assignedMe: true,
    sort_direction: 'asc',
    filters: {},
  });
  // ! 승인 api 호출
  // const { onProcessJoinRequest, isPending } = useProcessJoinRequest();

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

  // 승인 API 훅
  const { onProcessJoinRequest } = useProcessJoinRequest();
  // 사건 초대 거절 API 훅
  const { onRejectProjectInvitation } = useRejectProjectInvitation();

  const handleApprove = async (request_id: string, status: 'APPROVED' | 'REJECTED', notification?: any) => {
    if (
      status === 'APPROVED' &&
      (notification?.type === 'PROJECT_PERMISSION_REQUEST' || notification?.type === 'PROJECT_INVITE') &&
      notification?.related_id
    ) {
      // 사건참여 요청 승인 시 결제 모달 열기 (related_id가 있을 때만)
      setSelectedNotification(notification);
      setIsPaymentModalOpen(true);
      return;
    }

    try {
      const response = await onProcessJoinRequest({ request_id, status });
      if (response?.success) {
        onMessageToast({
          message: status === 'APPROVED' ? '승인되었습니다.' : '거절되었습니다.',
          icon: <IoMdCheckmarkCircle className='h-5 w-5 text-yellow-500' />,
        });
        refetch();
        setIsRefusalModalOpen(false);
        setIsSuperRoleModalOpen(false);
      } else {
        onMessageToast({
          message: `${status === 'APPROVED' ? '승인' : '거절'}에 실패했습니다.`,
          icon: <IoIosWarning className='h-5 w-5 text-yellow-500' />,
        });
        setIsRefusalModalOpen(false);
        setIsSuperRoleModalOpen(false);
      }
    } catch (error) {
      onMessageToast({
        message: `${status === 'APPROVED' ? '승인' : '거절'}에 실패했습니다.`,
        icon: <IoIosWarning className='h-5 w-5 text-yellow-500' />,
      });
      setIsRefusalModalOpen(false);
      setIsSuperRoleModalOpen(false);
      console.error(error);
    }
  };

  // 결제 성공 후 실제 승인 처리
  const handlePaymentSuccess = async () => {
    if (!selectedNotification) return;

    try {
      const response = await onProcessJoinRequest({
        request_id: selectedNotification.related_id,
        status: 'APPROVED',
      });

      if (response?.success) {
        onMessageToast({
          message: '결제가 완료되어 사건참여 요청이 승인되었습니다.',
          icon: <IoMdCheckmarkCircle className='h-5 w-5 text-yellow-500' />,
        });
        refetch();
      } else {
        onMessageToast({
          message: '승인 처리에 실패했습니다.',
          icon: <IoIosWarning className='h-5 w-5 text-yellow-500' />,
        });
      }
    } catch (error) {
      onMessageToast({
        message: '승인 처리 중 오류가 발생했습니다.',
        icon: <IoIosWarning className='h-5 w-5 text-yellow-500' />,
      });
      console.error(error);
    } finally {
      setIsPaymentModalOpen(false);
      setSelectedNotification(null);
    }
  };
  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    const hours = String(date.getHours()).padStart(2, '0');
    const minutes = String(date.getMinutes()).padStart(2, '0');

    return `${year}.${month}.${day} ${hours}:${minutes}`;
  };

  // 결제 유형을 한국어로 변환하는 함수
  const formatPaymentType = (message: string) => {
    return message.replace(/case_subscription/g, '사건구독').replace(/case_participation/g, '사건 참여');
  };
  const handleAuthorityClick = (project_id: string, project_nm: string, notification?: any) => {
    // 변호사 인증 상태 확인
    if (findEvidenceUserInfo?.data?.certify_status !== '인증완료') {
      onMessageToast({
        message: '변호사 인증이 미완료 상태입니다. 변호사 인증을 먼저 진행해 주세요.',
        icon: <IoIosWarning className='h-5 w-5 text-yellow-500' />,
      });
      setIsLawyerVerificationModalOpen(true);
      return;
    }

    // 결제 상태 확인
    const project = allEvidenceListResponse?.data.projects.find((p) => p.project_id === project_id);
    if (project) {
      if ((project.payment_status === 'pending' || project.payment_status === 'failed') && notification?.related_id) {
        // 결제가 필요하고 related_id가 있는 경우에만 결제 모달 열기
        setSelectedNotification(notification);
        setIsPaymentModalOpen(true);
        return;
      }
    }

    // 먼저 권한 메뉴 활성화를 위해 localStorage에 상태 저장
    localStorage.setItem('activeMenu', 'authority');

    // URL 구성
    const url = `/evidence/list?project_id=${project_id}&project_name=${project_nm}&active=authority`;

    // 페이지 이동
    navigate(url);

    // 모달 닫기
  };
  const handleProjectClick = () => {
    // 사건 목록으로 이동
    navigate('/');
  };

  // PROJECT_STATUS_PAUSED 알림 클릭 처리 - 결제 관리 페이지로 이동
  const handlePaymentManagementClick = (project_id: string, project_nm?: string) => {
    const url = `/payment?tab=case-list&caseId=${project_id}${project_nm ? `&project_name=${encodeURIComponent(project_nm)}` : ''}`;
    navigate(url);
  };

  // 현재 사용자가 프로젝트 멤버인지 확인하는 함수 (is_super 사용)
  const isCurrentUserProjectMember = (notification: any): boolean => {
    // is_super가 정의되어 있으면 멤버로 간주
    // is_super가 true면 사건관리자, false면 일반사용자
    return notification?.is_super !== undefined;
  };

  // PROJECT_PRE_PAID_INVITE 알림 클릭 처리
  const handlePrePaidInviteClick = () => {
    // 사건 목록으로 이동
    navigate('/');
  };

  // 프로젝트가 결제 완료 상태인지 확인하는 함수
  const isProjectPaymentCompleted = useMemo(() => {
    return (projectId: string): boolean => {
      const project = allEvidenceListResponse?.data.projects.find((p) => p.project_id === projectId);
      if (!project) return false;

      if (project.payment_status === 'completed') return true;

      if (project.payment_status === 'trial') {
        // trial인 경우 expire_date 확인
        if (project.expire_date) {
          const today = new Date();
          const expireDate = new Date(project.expire_date);
          return expireDate >= today;
        }
        return true; // expire_date가 없으면 허용
      }

      return false;
    };
  }, [allEvidenceListResponse]);

  return (
    <>
      <div className='mb-20 flex items-center justify-center pt-[100px]'>
        <div className='min-w-[580px]'>
          <div
            className={`font-bold text-[#888] ${getFontSizeClass(16, fontSizeAdjustment)}`}
            style={{ fontSize: `${getAdjustedSize(16)}px` }}
          >
            전체알림
          </div>
          <div>
            <ul className='flex-1 pl-[20px] pt-[20px] text-[#333]'>
              {notifications.length > 0 ? (
                notifications.map((notification) => (
                  <li key={notification.notification_id} className='mt-10'>
                    <p
                      className={`text-[#0050B3] ${getFontSizeClass(14, fontSizeAdjustment)}`}
                      style={{ fontSize: `${getAdjustedSize(14)}px` }}
                    >
                      {notification.title}
                    </p>
                    <div className='flex w-full items-center justify-between text-[14px]'>
                      <div className='flex-grow'>
                        {notification.type === 'PROJECT_PERMISSION_REQUEST' ? (
                          <p
                            className={`mt-[4px] line-clamp-2 max-w-[400px] text-[#000] ${getFontSizeClass(14, fontSizeAdjustment)}`}
                            style={{
                              fontSize: `${getAdjustedSize(14)}px`,
                              display: '-webkit-box',
                              WebkitLineClamp: '2',
                              WebkitBoxOrient: 'vertical',
                              overflow: 'hidden',
                            }}
                          >
                            {formatPaymentType(notification.message)}
                          </p>
                        ) : notification.type === 'PROJECT_SUPER_PERMISSION_REQUEST' ? (
                          <div
                            className={`mt-[4px] line-clamp-2 flex max-w-[400px] text-[#000] ${getFontSizeClass(14, fontSizeAdjustment)}`}
                            style={{
                              fontSize: `${getAdjustedSize(14)}px`,
                              display: '-webkit-box',
                              WebkitLineClamp: '3',
                              WebkitBoxOrient: 'vertical',
                              overflow: 'hidden',
                            }}
                          >
                            <p>
                              {formatPaymentType(notification.message)
                                .split(/(\[사건관리자권한\])/)
                                .map((part, index) =>
                                  part === '[사건관리자권한]' ? (
                                    <span key={index} className='font-bold text-[#1890FF]'>
                                      {part}
                                    </span>
                                  ) : (
                                    <span key={index}>{part}</span>
                                  ),
                                )}
                            </p>
                            <div className='mt-[6px] flex h-[26px] w-full items-center rounded-[4px] bg-[#FFF1F0]'>
                              <IoIosAlert className='ml-2 text-lg text-[#F5222D]' />
                              <p className='ml-1 text-[12px] text-[#666]'>승인 시 나의 권한은 일반권한으로 변경됩니다.</p>
                            </div>
                          </div>
                        ) : (
                          <p
                            className={`line-clamp-2 text-[#000] ${getFontSizeClass(14, fontSizeAdjustment)}`}
                            style={{
                              fontSize: `${getAdjustedSize(14)}px`,
                              display: '-webkit-box',
                              WebkitLineClamp: '2',
                              WebkitBoxOrient: 'vertical',
                              overflow: 'hidden',
                            }}
                          >
                            {formatPaymentType(notification.message)}
                          </p>
                        )}
                      </div>

                      <div className='flex items-center'>
                        {notification.result === '승인완료' || notification.type === 'PROJECT_INVITE_ACCEPT' ? (
                          <div className='flex h-[28px] w-[97px] items-center justify-center rounded-full bg-[#e5e5e5] text-[14px] font-medium text-[#888]'>
                            승인완료
                          </div>
                        ) : notification.result === '거절완료' || notification.type === 'PROJECT_INVITE_REJECT' ? (
                          <div className='flex h-[28px] w-[97px] items-center justify-center rounded-full bg-[#e5e5e5] text-[14px] font-medium text-[#888]'>
                            거절완료
                          </div>
                        ) : (
                          <>
                            {notification.type === 'PROJECT_PERMISSION_REQUEST' && (
                              <button
                                className='h-[48px] w-[53px] rounded-[6px] border bg-[#0050B3] text-xs text-white'
                                onClick={() => {
                                  // related_id가 있을 때만 결제 모달 열기
                                  if (notification?.related_id) {
                                    setSelectedNotification(notification);
                                    setIsPaymentModalOpen(true);
                                  } else {
                                    // related_id가 없으면 승인 처리
                                    handleApprove(notification.related_id, 'APPROVED', notification);
                                  }
                                }}
                              >
                                승인
                              </button>
                            )}
                            {notification.type === 'PROJECT_INVITE' && (
                              <button
                                className='h-[48px] w-[53px] rounded-[6px] border bg-[#0050B3] text-xs text-white'
                                onClick={() => {
                                  // related_id가 있을 때만 결제 모달 열기
                                  if (notification?.related_id) {
                                    setSelectedNotification(notification);
                                    setIsPaymentModalOpen(true);
                                  } else {
                                    // related_id가 없으면 승인 처리
                                    handleApprove(notification.related_id, 'APPROVED', notification);
                                  }
                                }}
                              >
                                승인
                              </button>
                            )}
                            {notification.type === 'PROJECT_SUPER_PERMISSION_REQUEST' && (
                              <button
                                className='h-[48px] w-[53px] rounded-[6px] border bg-[#0050B3] text-xs text-white'
                                onClick={() => {
                                  setSelectedRequestId(notification.related_id);
                                  setIsSuperRoleModalOpen(true);
                                }}
                              >
                                승인
                              </button>
                            )}
                            {(notification.type === 'PROJECT_PERMISSION_REQUEST' ||
                              notification.type === 'PROJECT_SUPER_PERMISSION_REQUEST') && (
                              <button
                                className='ml-2 h-[48px] w-[53px] rounded-[6px] border text-xs text-[#666]'
                                onClick={() => {
                                  setSelectedRequestId(notification.related_id);
                                  setIsRefusalModalOpen(true);
                                }}
                              >
                                거절
                              </button>
                            )}
                            {notification.type === 'PROJECT_INVITE' && (
                              <button
                                className='ml-2 h-[48px] w-[53px] rounded-[6px] border text-xs text-[#666]'
                                onClick={() => {
                                  setSelectedRequestId(notification.related_id);
                                  setIsRejectModalOpen(true);
                                }}
                              >
                                거절
                              </button>
                            )}
                            {notification.type === 'PROJECT_PRE_PAID_INVITE' && (
                              <div className='flex cursor-pointer items-center justify-end pt-[5px]' onClick={handlePrePaidInviteClick}>
                                사건 확인하기 <IoIosArrowForward />
                              </div>
                            )}
                          </>
                        )}
                      </div>
                    </div>

                    <div className='flex items-center justify-between text-[14px] text-[#C2C2C2]'>
                      <div>{formatDate(notification.createdAt)}</div>
                      {notification.type === 'PROJECT_CERTIFY_FAILED' && (
                        <div className='ml-[24px] mr-4 flex items-center'>
                          {findEvidenceUserInfo?.data?.certify_status === '인증완료' ? (
                            <div className='flex h-[28px] w-[97px] items-center justify-center rounded-full bg-[#e5e5e5] text-[14px] font-medium text-[#888]'>
                              인증완료
                            </div>
                          ) : (
                            <>
                              <button
                                className='h-[48px] w-[88px]'
                                style={{
                                  color: '#888',
                                  fontFamily: 'Pretendard',
                                  fontSize: '14px',
                                  fontStyle: 'normal',
                                  fontWeight: 500,
                                  lineHeight: '20px',
                                }}
                                onClick={() => setIsLawyerVerificationModalOpen(true)}
                              >
                                변호사인증하기
                              </button>
                              <IoIosArrowForward />
                            </>
                          )}
                        </div>
                      )}
                      {notification.type === 'PROJECT_PERMISSION_REQUEST' &&
                        notification.result !== '거절완료' &&
                        isCurrentUserProjectMember(notification) &&
                        isProjectPaymentCompleted(notification.project_id) && (
                          <div
                            className='flex cursor-pointer items-center justify-end pt-[5px]'
                            onClick={() => handleAuthorityClick(notification.project_id, notification.project_nm, notification)}
                          >
                            권한 확인하기 <IoIosArrowForward />
                          </div>
                        )}
                      {(notification.type === 'PROJECT_PERMISSION_APPROVED' ||
                        notification.type === 'PROJECT_INVITE_ACCEPT' ||
                        notification.type === 'PROJECT_INVITE_APPROVED' ||
                        notification.type === 'PROJECT_NEW_JOIN') &&
                        isCurrentUserProjectMember(notification) &&
                        isProjectPaymentCompleted(notification.project_id) && (
                          <div className='flex cursor-pointer items-center justify-end pt-[5px]' onClick={handleProjectClick}>
                            사건 확인하기 <IoIosArrowForward />
                          </div>
                        )}
                      {notification.type === 'PROJECT_SUPER_PERMISSION_REQUEST' &&
                        isCurrentUserProjectMember(notification) &&
                        isProjectPaymentCompleted(notification.project_id) && (
                          <div
                            className='flex cursor-pointer items-center justify-end'
                            onClick={() => handleAuthorityClick(notification.project_id, notification.project_nm, notification)}
                          >
                            권한 확인하기 <IoIosArrowForward />
                          </div>
                        )}
                      {notification.type === 'PROJECT_STATUS_PAUSED' && (
                        <div
                          className='flex cursor-pointer items-center justify-end pt-[5px] text-[#888888]'
                          onClick={() => handlePaymentManagementClick(notification.project_id, notification.project_nm)}
                        >
                          결제 관리 확인하기 <IoIosArrowForward />
                        </div>
                      )}
                      {notification.type === 'PROJECT_STATUS_CLOSED' && (
                        <div
                          className='flex cursor-pointer items-center justify-end pt-[5px] text-[#888888]'
                          onClick={() => handlePaymentManagementClick(notification.project_id, notification.project_nm)}
                        >
                          결제 관리 확인하기 <IoIosArrowForward />
                        </div>
                      )}
                    </div>
                  </li>
                ))
              ) : (
                <li className='text-center text-gray-400'>도착한 알림이 없습니다.</li>
              )}
            </ul>
          </div>
        </div>
        {isRefusalModalOpen && (
          <ModalSelect
            sendMessage={'사건관리자 권한 요청 거절'}
            storageMessage={'사건관리자 권한 요청을 거절하시겠습니까?'}
            handleSave={() => handleApprove(selectedRequestId, 'REJECTED')}
            setIsModalOpen={() => setIsRefusalModalOpen(false)}
            confirmButtonText='거절하기'
          />
        )}
        {isRejectModalOpen && (
          <ModalSelect
            sendMessage={'사건참여 요청 거절'}
            storageMessage={'사건 참여 요청을 거절하시겠습니까?'}
            handleSave={async () => {
              try {
                const response = await onRejectProjectInvitation({ request_id: selectedRequestId });
                if (response?.success) {
                  onMessageToast({
                    message: '거절되었습니다.',
                    icon: <IoMdCheckmarkCircle className='h-5 w-5 text-yellow-500' />,
                  });
                  refetch();
                  setIsRejectModalOpen(false);
                } else {
                  onMessageToast({
                    message: '거절에 실패했습니다.',
                    icon: <IoIosWarning className='h-5 w-5 text-yellow-500' />,
                  });
                  setIsRejectModalOpen(false);
                }
              } catch (error) {
                onMessageToast({
                  message: '거절에 실패했습니다.',
                  icon: <IoIosWarning className='h-5 w-5 text-yellow-500' />,
                });
                setIsRejectModalOpen(false);
                console.error(error);
              }
            }}
            setIsModalOpen={() => setIsRejectModalOpen(false)}
            confirmButtonText='거절하기'
          />
        )}
        {isSuperRoleModalOpen && (
          <ModalSelect
            sendMessage={'사건관리자 권한 요청 승인'}
            storageMessage={'사건관리자 권한 요청을 승인하시겠습니까?'}
            handleSave={() => handleApprove(selectedRequestId, 'APPROVED')}
            setIsModalOpen={() => {
              setIsSuperRoleModalOpen(false);
            }}
            confirmButtonText='승인하기'
          />
        )}
        {isLawyerVerificationModalOpen && (
          <LawyerVerificationModal isOpen={isLawyerVerificationModalOpen} onClose={() => setIsLawyerVerificationModalOpen(false)} />
        )}

        {/* 결제 모달 */}
        {selectedNotification && (
          <PaymentModal
            isOpen={isPaymentModalOpen}
            onClose={() => {
              setIsPaymentModalOpen(false);
              setSelectedNotification(null);
            }}
            onPayment={() => undefined}
            projectName={
              selectedNotification.project_nm ||
              allEvidenceListResponse?.data.projects.find((p) => p.project_id === selectedNotification.project_id)?.project_nm ||
              '사건명'
            }
            projectId={selectedNotification.project_id}
            userId={findEvidenceUserInfo?.data?.user_id}
            requestId={selectedNotification.related_id}
            paymentType='case_participation'
            amount={19000}
            planId='plan_01K7GPCHPZXX4CZM6TTRYAA2CW'
            onPaymentSuccess={handlePaymentSuccess}
          />
        )}

        {/* 사전 결제 초대 결제 모달 */}
        {selectedPrePaidNotification && (
          <PaymentModal
            isOpen={isPrePaidPaymentModalOpen}
            onClose={() => {
              setIsPrePaidPaymentModalOpen(false);
              setSelectedPrePaidNotification(null);
            }}
            onPayment={() => undefined}
            projectName={
              selectedPrePaidNotification.project_nm ||
              allEvidenceListResponse?.data.projects.find((p) => p.project_id === selectedPrePaidNotification.project_id)?.project_nm ||
              '사건명'
            }
            projectId={selectedPrePaidNotification.project_id}
            userId={findEvidenceUserInfo?.data?.user_id}
            requestId={selectedPrePaidNotification.related_id}
            paymentType='case_participation'
            amount={19000}
            planId='plan_01K7GPCHPZXX4CZM6TTRYAA2CW'
            onPaymentSuccess={async () => {
              // 결제 성공 후 사건 목록으로 이동
              const projectNm =
                selectedPrePaidNotification.project_nm ||
                allEvidenceListResponse?.data.projects.find((p) => p.project_id === selectedPrePaidNotification.project_id)?.project_nm ||
                '';
              const url = `/evidence/list?project_id=${selectedPrePaidNotification.project_id}${projectNm ? `&project_name=${encodeURIComponent(projectNm)}` : ''}`;
              navigate(url);
              setIsPrePaidPaymentModalOpen(false);
              setSelectedPrePaidNotification(null);
            }}
          />
        )}
      </div>
    </>
  );
};
