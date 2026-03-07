import { useEffect, useMemo, useRef, useState } from 'react';

import { useQueryClient } from '@tanstack/react-query';
import { FiAlertCircle, FiEye } from 'react-icons/fi';
import { IoIosNotificationsOutline, IoIosAlert, IoMdCheckmarkCircle, IoIosWarning, IoIosArrowForward } from 'react-icons/io';
import { useNavigate } from 'react-router-dom';

import { useFindUserInfo } from '@query/query';
import { fetchReadAllNotification, fetchMarkNotificationAsRead } from '@/apis/evidence-api';
import { LawyerVerificationModal } from '@/components/evidence/modal/lawyer-verification-modal';
import { PaymentModal } from '@/components/evidence/modal/payment-modal';
import { onMessageToast } from '@/components/utils';
// import { fetchMarkNotificationAsRead } from '@/apis/evidence-api';
// import { onMessageToast } from '@/components/utils';
// import { useListNotification, useUnreadNotificationCount, useProcessJoinRequest } from '@/hooks/react-query';
import { useListNotification, useUnreadNotificationCount, useProcessJoinRequest, useFindAllEvidenceList } from '@/hooks/react-query';
type TNotificationsProps = {
  onClose: () => void;
  isOpen: boolean;
};

export const NotificationsModal = ({ isOpen, onClose }: TNotificationsProps) => {
  const modalRef = useRef<HTMLDivElement>(null);
  const navigate = useNavigate();
  const queryClient = useQueryClient();

  // 변호사 인증 모달 상태
  const [isLawyerVerificationModalOpen, setIsLawyerVerificationModalOpen] = useState(false);

  // 결제 모달 상태
  const [isPaymentModalOpen, setIsPaymentModalOpen] = useState(false);
  const [selectedNotification, setSelectedNotification] = useState<any>(null);
  const [isPrePaidPaymentModalOpen, setIsPrePaidPaymentModalOpen] = useState(false);
  const [selectedPrePaidNotification, setSelectedPrePaidNotification] = useState<any>(null);
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

  const { response: notificationListResponse, refetch: refetchNotifications } = useListNotification({
    page_no: '',
    block_cnt: '',
    isRead: false,
  });
  const notifications = useMemo(() => notificationListResponse?.data.notifications || [], [notificationListResponse?.data.notifications]);
  const { onProcessJoinRequest } = useProcessJoinRequest();

  // ! 알림갯수 api 호출
  const { response: unreadNotificationResponse } = useUnreadNotificationCount();
  const unreadCount = unreadNotificationResponse?.data?.count ?? 0;

  const updateUnreadCountCache = (patch: (prev: number) => number) => {
    queryClient.setQueryData(['notification', 'unreadCount'], (old: any) => {
      const prevCount = Number(old?.data?.count ?? 0);
      const nextCount = Math.max(0, patch(prevCount));
      return {
        ...(old ?? {}),
        data: {
          ...(old?.data ?? {}),
          count: nextCount,
        },
      };
    });
  };

  // ! 유저정보 api 호출
  const { response: findEvidenceUserInfo } = useFindUserInfo();
  const fontSizeAdjustment = findEvidenceUserInfo?.data?.font_size_rate || 0;

  // 모달이 열릴 때 상태 초기화
  useEffect(() => {
    if (isOpen) {
      setIsPaymentModalOpen(false);
      setSelectedNotification(null);
      setIsPrePaidPaymentModalOpen(false);
      setSelectedPrePaidNotification(null);
      setIsLawyerVerificationModalOpen(false);
    }
  }, [isOpen]);

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

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    const hours = String(date.getHours()).padStart(2, '0');
    const minutes = String(date.getMinutes()).padStart(2, '0');

    return `${year}.${month}.${day} ${hours}:${minutes}`;
  };
  const handleAllRead = async () => {
    try {
      await fetchReadAllNotification();
      await refetchNotifications(); // 알림 목록 새로고침
      onMessageToast({
        message: '모든 알림을 읽음 처리했습니다.',
      });
      // unread endpoint 추가 호출 없이 UI만 동기화
      updateUnreadCountCache(() => 0);
      onClose();
    } catch (error) {
      console.error('알림 읽음 처리에 실패했습니다.', error);
      onMessageToast({
        message: '알림 읽음 처리에 실패했습니다.',
      });
    }
  };
  // ! 승인 거절
  const handleApprove = async (request_id: string, status: 'APPROVED' | 'REJECTED', notification?: any) => {
    if (status === 'APPROVED' && (notification?.type === 'PROJECT_PERMISSION_REQUEST' || notification?.type === 'PROJECT_INVITE')) {
      // 사건참여 요청 승인 시 결제 모달 열기
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
        await refetchNotifications(); // 알림 목록 새로고침
        // unread endpoint 추가 호출 없이 UI만 동기화(처리된 알림 1건 감소)
        updateUnreadCountCache((c) => c - 1);

        // 사건 목록 페이지에 데이터 새로고침 신호 전송
        window.dispatchEvent(new CustomEvent('evidenceListRefresh'));
      } else {
        onMessageToast({
          message: `${status === 'APPROVED' ? '승인' : '거절'}에 실패했습니다.`,
          icon: <IoIosWarning className='h-5 w-5 text-yellow-500' />,
        });
      }
    } catch (error) {
      onMessageToast({
        message: `${status === 'APPROVED' ? '승인' : '거절'}에 실패했습니다.`,
        icon: <IoIosWarning className='h-5 w-5 text-yellow-500' />,
      });
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
        await refetchNotifications();
        // unread endpoint 추가 호출 없이 UI만 동기화(처리된 알림 1건 감소)
        updateUnreadCountCache((c) => c - 1);
        window.dispatchEvent(new CustomEvent('evidenceListRefresh'));
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
  const handleAuthorityClick = async (project_id: string, project_nm: string, notification?: any) => {
    // 변호사 인증 상태 확인
    if (findEvidenceUserInfo?.data?.certify_status !== '인증완료') {
      onMessageToast({
        message: '변호사 인증이 미완료 상태입니다. 변호사 인증을 먼저 진행해 주세요.',
        icon: <IoIosWarning className='h-5 w-5 text-yellow-500' />,
      });
      setIsLawyerVerificationModalOpen(true);
      return;
    }

    // 알림 읽음 처리
    if (notification) {
      try {
        console.log('알림 읽음 처리 시작:', notification.notification_id);
        await fetchMarkNotificationAsRead(notification.notification_id);
        console.log('알림 읽음 처리 성공');
        await refetchNotifications();
        // unread endpoint 추가 호출 없이 UI만 동기화(읽음 처리 1건 감소)
        updateUnreadCountCache((c) => c - 1);
      } catch (error) {
        console.error('알림 읽음 처리 실패:', error);
        onMessageToast({
          message: '알림 읽음 처리에 실패했습니다.',
          icon: <IoIosWarning className='h-5 w-5 text-yellow-500' />,
        });
      }
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

    localStorage.setItem('activeMenu', 'authority');
    const url = `/evidence/list?project_id=${project_id}&project_name=${project_nm}&active=authority`;
    navigate(url);
    onClose();
  };
  const handleProjectClick = () => {
    // 사건 목록으로 이동
    navigate('/');
    onClose();
  };

  // PROJECT_STATUS_PAUSED 알림 클릭 처리 - 결제 관리 페이지로 이동
  const handlePaymentManagementClick = (project_id: string, project_nm?: string) => {
    const url = `/payment?tab=case-list&caseId=${project_id}${project_nm ? `&project_name=${encodeURIComponent(project_nm)}` : ''}`;
    navigate(url);
    onClose();
  };

  // PROJECT_PRE_PAID_INVITE 알림 클릭 처리
  const handlePrePaidInviteClick = () => {
    // 사건 목록으로 이동
    navigate('/');
    onClose();
  };

  // 현재 사용자가 프로젝트 멤버인지 확인하는 함수 (is_super 사용)
  const isCurrentUserProjectMember = (notification: any): boolean => {
    // is_super가 정의되어 있으면 멤버로 간주
    // is_super가 true면 사건관리자, false면 일반사용자
    return notification?.is_super !== undefined;
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

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      // 변호사 인증 모달이나 결제 모달이 열려있을 때는 외부 클릭 감지 비활성화
      if (isLawyerVerificationModalOpen || isPaymentModalOpen || isPrePaidPaymentModalOpen) {
        return;
      }

      if (modalRef.current && !modalRef.current.contains(event.target as Node)) {
        onClose();
      }
    };

    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [isOpen, onClose, isLawyerVerificationModalOpen, isPaymentModalOpen, isPrePaidPaymentModalOpen]);
  if (!isOpen) return null;
  return (
    <div className='relative'>
      <div
        ref={modalRef}
        className='] absolute right-[-100px] z-30 mt-3 min-h-[136px] min-w-[330px] max-w-[445px] rounded-[16px] border bg-white shadow-xl lg:right-[-100px] lg:max-h-[600px] lg:min-w-[445px] 2xl:top-4 2xl:max-h-[746px]'
      >
        <div className='flex w-full justify-between border-b border-[#fff] p-2 font-bold text-[#333]'>
          <div className='flex w-full pl-[20px] pt-[20px] text-[20px] font-bold'>
            <div
              className={`flex w-full font-extrabold text-[#000] ${getFontSizeClass(16, fontSizeAdjustment)}`}
              style={{ fontSize: `${getAdjustedSize(16)}px` }}
            >
              알림
              {unreadCount > 0 && (
                <div
                  className={`pl-1 font-extrabold text-[#000] ${getFontSizeClass(16, fontSizeAdjustment)}`}
                  style={{ fontSize: `${getAdjustedSize(16)}px` }}
                >
                  {unreadCount}
                </div>
              )}
            </div>

            <div
              className='mr-[20px] flex w-full cursor-pointer items-center justify-end text-[14px] text-[#888888]'
              onClick={handleAllRead}
            >
              <FiEye className='mr-1 text-lg' />
              모두읽음처리
              <div className='group relative'>
                <FiAlertCircle className='ml-1 text-lg' />
                <div className='absolute right-0 top-full mt-2 hidden group-hover:block' style={{ transform: 'translateX(-5px)' }}>
                  {/* 툴팁 화살표 */}
                  <div className='absolute -top-2 right-[12px] h-0 w-0'>
                    <div className='relative h-0 w-0'>
                      {/* 화살표 보더 */}
                      <div className='absolute h-0 w-0 border-b-[6px] border-l-[6px] border-r-[6px] border-b-[#E5E7EB] border-l-transparent border-r-transparent'></div>
                      {/* 화살표 내부 */}
                      <div className='absolute left-[-5px] top-[1px] h-0 w-0 border-b-[5px] border-l-[5px] border-r-[5px] border-b-white border-l-transparent border-r-transparent'></div>
                    </div>
                  </div>
                  {/* 툴팁 내용 */}
                  <div className='min-w-[280px] rounded border border-[#E5E7EB] bg-[#fff] p-[12px] text-[#252525] shadow-lg'>
                    <p className={`${getFontSizeClass(12, fontSizeAdjustment)}`} style={{ fontSize: `${getAdjustedSize(12)}px` }}>
                      읽음 처리한 알림은 본 목록에서 사라지며, <br />
                      하단의 '전체 알림보기'에서만 확인 가능합니다.
                    </p>

                    <p
                      className={`text-[#666] ${getFontSizeClass(12, fontSizeAdjustment)}`}
                      style={{ fontSize: `${getAdjustedSize(12)}px` }}
                    >
                      (단, 권한 요청 알림은 읽음 처리하여도 목록에 있으며, 승인 또는 거절 버튼을 눌러야 목록에서 사라집니다.)
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/*  <div className='cursor-pointer' onClick={onClose}>
            <IoIosClose className='text-[30px]' />
          </div> */}
        </div>
        <div className='flex max-h-[500px] min-h-[100px] flex-col 2xl:max-h-[600px]'>
          <ul className='flex-1 overflow-y-auto pl-[20px] pt-[20px] text-[#333]'>
            {notifications.length > 0 ? (
              notifications
                .filter((notification) => {
                  // PROJECT_CERTIFY_FAILED 알림은 유저의 certify_status가 '인증완료'일 때 숨김
                  if (notification.type === 'PROJECT_CERTIFY_FAILED' && findEvidenceUserInfo?.data?.certify_status === '인증완료') {
                    return false;
                  }
                  return true;
                })
                .map((notification, index) => (
                  <li key={notification.notification_id} className={` ${index === 0 ? '' : 'mt-6'}`}>
                    <p
                      className={`text-[#0050B3] ${getFontSizeClass(14, fontSizeAdjustment)}`}
                      style={{ fontSize: `${getAdjustedSize(14)}px` }}
                    >
                      {notification.title}
                    </p>
                    <div className='flex items-center text-[14px]'>
                      {notification.type === 'PROJECT_PERMISSION_REQUEST' ? (
                        <p
                          className={`mt-[4px] line-clamp-2 min-w-[267px] text-[#000] ${getFontSizeClass(14, fontSizeAdjustment)}`}
                          style={{
                            fontSize: `${getAdjustedSize(14)}px`,
                            display: '-webkit-box',
                            WebkitLineClamp: '2',
                            WebkitBoxOrient: 'vertical',
                            overflow: 'hidden',
                          }}
                        >
                          {notification.message}
                        </p>
                      ) : notification.type === 'PROJECT_SUPER_PERMISSION_REQUEST' ? (
                        <div
                          className={`mt-[4px] line-clamp-2 flex text-[#000] ${getFontSizeClass(14, fontSizeAdjustment)}`}
                          style={{
                            fontSize: `${getAdjustedSize(14)}px`,
                            display: '-webkit-box',
                            WebkitLineClamp: '3',
                            WebkitBoxOrient: 'vertical',
                            overflow: 'hidden',
                          }}
                        >
                          <p className=''>
                            {notification.message.split(/(\[슈퍼권한\])/).map((part) =>
                              part === '[사건관리자권한]' ? (
                                <span key={index} className='font-bold text-[#1890FF]'>
                                  {part}
                                </span>
                              ) : (
                                <span key={index}>{part}</span>
                              ),
                            )}
                          </p>
                          <div className='mt-[6px] flex h-[26px] items-center rounded-[4px] bg-[#FFF1F0]'>
                            <IoIosAlert className='ml-1 text-lg text-[#F5222D]' />
                            <p className='ml-1 text-[12px] text-[#666]'>승인 시 나의 권한은 일반권한으로 변경됩니다.</p>
                          </div>
                        </div>
                      ) : (
                        <p
                          className={`mr-4 line-clamp-2 text-[#000] ${getFontSizeClass(14, fontSizeAdjustment)}`}
                          style={{
                            fontSize: `${getAdjustedSize(14)}px`,
                            display: '-webkit-box',
                            WebkitLineClamp: '2',
                            WebkitBoxOrient: 'vertical',
                            overflow: 'hidden',
                          }}
                        >
                          {notification.message}
                        </p>
                      )}
                      {notification.type === 'PROJECT_PERMISSION_REQUEST' && (
                        <div className='ml-[24px] mr-4 flex items-center'>
                          <button
                            className='h-[48px] w-[53px] rounded-[6px] border bg-[#0050B3] text-xs text-white'
                            onClick={() => handleApprove(notification.related_id, 'APPROVED', notification)}
                          >
                            승인
                          </button>
                          <button
                            className='ml-2 h-[48px] w-[53px] rounded-[6px] border text-xs'
                            onClick={() => handleApprove(notification.related_id, 'REJECTED')}
                          >
                            거절
                          </button>
                        </div>
                      )}
                      {notification.type === 'PROJECT_INVITE' && (
                        <div className='ml-[24px] mr-4 flex items-center'>
                          <button
                            className='h-[48px] w-[53px] rounded-[6px] border bg-[#0050B3] text-xs text-white'
                            onClick={() => handleApprove(notification.related_id, 'APPROVED', notification)}
                          >
                            승인
                          </button>
                          <button
                            className='ml-2 h-[48px] w-[53px] rounded-[6px] border text-xs'
                            onClick={() => handleApprove(notification.related_id, 'REJECTED')}
                          >
                            거절
                          </button>
                        </div>
                      )}
                      {notification.type === 'PROJECT_SUPER_PERMISSION_REQUEST' && (
                        <div className='ml-[24px] mr-4 flex items-center'>
                          <button
                            className='h-[48px] w-[53px] rounded-[6px] border bg-[#0050B3] text-xs text-white'
                            onClick={() => handleApprove(notification.related_id, 'APPROVED')}
                          >
                            승인
                          </button>
                          <button
                            className='ml-2 h-[48px] w-[53px] rounded-[6px] border text-xs'
                            onClick={() => handleApprove(notification.related_id, 'REJECTED')}
                          >
                            거절
                          </button>
                        </div>
                      )}
                    </div>
                    <div className='mt-2 flex justify-end'></div>
                    <div className='flex items-center justify-between text-[14px] text-[#C2C2C2]'>
                      <div className=''>{formatDate(notification.createdAt)}</div>
                      {notification.type === 'PROJECT_CERTIFY_FAILED' && (
                        <div className='ml-[24px] mr-4 flex items-center'>
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
                        </div>
                      )}
                      {notification.type === 'PROJECT_PERMISSION_REQUEST' &&
                        notification.result !== '거절완료' &&
                        isCurrentUserProjectMember(notification) &&
                        isProjectPaymentCompleted(notification.project_id) && (
                          <div
                            className='mr-4 flex cursor-pointer items-center'
                            onClick={() => handleAuthorityClick(notification.project_id, notification.project_nm, notification)}
                          >
                            권한 확인하기 <IoIosArrowForward />
                          </div>
                        )}
                      {notification.type === 'PROJECT_SUPER_PERMISSION_REQUEST' &&
                        notification.result !== '거절완료' &&
                        isCurrentUserProjectMember(notification) &&
                        isProjectPaymentCompleted(notification.project_id) && (
                          <div
                            className='mr-4 flex cursor-pointer items-center'
                            onClick={() => handleAuthorityClick(notification.project_id, notification.project_nm, notification)}
                          >
                            권한 확인하기 <IoIosArrowForward />
                          </div>
                        )}
                      {(notification.type === 'PROJECT_PERMISSION_APPROVED' || notification.type === 'PROJECT_INVITE_APPROVED') &&
                        isCurrentUserProjectMember(notification) &&
                        isProjectPaymentCompleted(notification.project_id) && (
                          <div className='mr-4 flex cursor-pointer items-center' onClick={handleProjectClick}>
                            사건 확인하기 <IoIosArrowForward />
                          </div>
                        )}
                      {notification.type === 'PROJECT_NEW_JOIN' &&
                        isCurrentUserProjectMember(notification) &&
                        isProjectPaymentCompleted(notification.project_id) && (
                          <div className='mr-4 flex cursor-pointer items-center' onClick={handleProjectClick}>
                            사건 확인하기 <IoIosArrowForward />
                          </div>
                        )}
                      {notification.type === 'PROJECT_PRE_PAID_INVITE' && (
                        <div className='mr-4 flex cursor-pointer items-center' onClick={handlePrePaidInviteClick}>
                          사건 확인하기 <IoIosArrowForward />
                        </div>
                      )}
                      {notification.type === 'PROJECT_STATUS_PAUSED' && (
                        <div
                          className='mr-4 flex cursor-pointer items-center'
                          onClick={() => handlePaymentManagementClick(notification.project_id, notification.project_nm)}
                        >
                          결제관리확인하기 <IoIosArrowForward />
                        </div>
                      )}
                      {notification.type === 'PROJECT_STATUS_CLOSED' && (
                        <div
                          className='mr-4 flex cursor-pointer items-center'
                          onClick={() => handlePaymentManagementClick(notification.project_id, notification.project_nm)}
                        >
                          결제관리확인하기 <IoIosArrowForward />
                        </div>
                      )}
                    </div>
                  </li>
                ))
            ) : (
              <li className='text-center text-gray-400'>도착한 알림이 없습니다.</li>
            )}
          </ul>

          <div className='rounded-b-[16px]' onClick={() => navigate('/notifications')}>
            <div className='hidden h-[48px] cursor-pointer items-center justify-center border-t text-[#666] lg:flex'>
              <IoIosNotificationsOutline className='mr-2 text-2xl' />
              전체알림보기
            </div>
          </div>
        </div>
      </div>

      {/* 변호사 인증 모달 */}
      <LawyerVerificationModal
        isOpen={isLawyerVerificationModalOpen}
        onClose={() => {
          setIsLawyerVerificationModalOpen(false);
        }}
        onVerificationSuccess={() => {
          setIsLawyerVerificationModalOpen(false);
          refetchNotifications(); // 알림 목록 새로고침
        }}
        onVerificationFailure={(message) => {
          onMessageToast({
            message,
            icon: <IoIosWarning className='h-5 w-5 text-yellow-500' />,
          });
        }}
      />

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
            onClose();
          }}
        />
      )}
    </div>
  );
};
