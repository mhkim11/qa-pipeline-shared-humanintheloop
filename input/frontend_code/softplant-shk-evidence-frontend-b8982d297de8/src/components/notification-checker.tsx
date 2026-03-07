import { useEffect } from 'react';

import dayjs from 'dayjs';
import { IoClose } from 'react-icons/io5';

import { useFindUserInfo, useListNotification } from '@/hooks/react-query/query';

interface INotificationCheckerProps {
  login: any;
  isAdmin: boolean;
  lastNotificationId: string | null;
  setLastNotificationId: (id: string | null) => void;
  checkingNotifications: boolean;
  setCheckingNotifications: (checking: boolean) => void;
  latestNotification: { title: string; message: string; id: string } | null;
  setLatestNotification: (notification: { title: string; message: string; id: string } | null) => void;
  showNotification: boolean;
  setShowNotification: (show: boolean) => void;
  dismissedNotifications: string[];
  setDismissedNotifications: (notifications: string[]) => void;
}

export const NotificationChecker = ({
  login,
  isAdmin,
  lastNotificationId,
  setLastNotificationId,
  checkingNotifications,
  setCheckingNotifications,
  latestNotification,
  setLatestNotification,
  showNotification,
  setShowNotification,
  dismissedNotifications,
  setDismissedNotifications,
}: INotificationCheckerProps) => {
  // 유저 정보 조회 (변호사 인증 상태 확인용)
  // 로그인 상태가 아닐 때는 에러가 발생할 수 있으므로 조건부로 사용
  const userInfoResult = useFindUserInfo();
  const userInfo = !!login?.data?.accessToken && !isAdmin ? userInfoResult.response : null;

  // 알림 목록 조회 (React Query hook 사용 - 캐시 공유)
  const { response: notificationListResponse } = useListNotification({
    page_no: '1',
    block_cnt: '5',
    isRead: false,
  });

  // 새 알림 확인
  const checkNewNotifications = async () => {
    // 로그인 상태가 아니면 알림 확인 중지
    if (!login?.data?.accessToken) {
      return;
    }

    // 어드민이면 알림 확인 중지
    if (isAdmin) {
      return;
    }

    // React Query에서 캐시된 데이터 사용
    const notifications = notificationListResponse?.data?.notifications || [];

    // 캐시된 데이터가 없으면 처리하지 않음 (React Query가 자동으로 fetch)
    if (!notificationListResponse) {
      return;
    }

    // 오늘 날짜의 알림만 필터링
    const today = dayjs().startOf('day');
    console.log('오늘 날짜:', today.format('YYYY-MM-DD'));
    const todayNotifications = notifications.filter((notification) => {
      if (notification.createdAt) {
        const isToday = dayjs(notification.createdAt).isAfter(today);
        console.log(`알림 ${notification.notification_id} (${notification.createdAt}): 오늘 알림인가? ${isToday}`);
        return isToday;
      }
      return true;
    });
    console.log('오늘 알림 개수:', todayNotifications.length);

    if (todayNotifications.length > 0) {
      // 변호사 인증 관련 알림들을 먼저 필터링
      const filteredNotifications = todayNotifications.filter((notification) => {
        // 변호사 인증 실패 알림의 경우, 인증완료 상태이면 제외
        if (notification.type === 'PROJECT_CERTIFY_FAILED' && userInfo?.data?.certify_status === '인증완료') {
          return false;
        }
        // 변호사 인증 미완료 관련 알림도 인증완료 상태이면 제외
        if (notification.title?.includes('변호사 인증') && userInfo?.data?.certify_status === '인증완료') {
          return false;
        }
        // 변호사 인증 미완료 타이틀 확인
        if (notification.title === '변호사 인증 미완료' && userInfo?.data?.certify_status === '인증완료') {
          return false;
        }
        return true;
      });

      if (filteredNotifications.length === 0) {
        return;
      }

      const newNotification = filteredNotifications[0];

      // 이미 닫은 알림이면 표시하지 않음
      if (!dismissedNotifications.includes(newNotification.notification_id)) {
        // 새 알림인지 확인
        if (lastNotificationId !== newNotification.notification_id) {
          const isTabActive = document.visibilityState === 'visible';

          if (Notification.permission === 'granted' && !isTabActive) {
            // 브라우저가 백그라운드 상태일 때 네이티브 알림 표시
            const notification = new Notification(newNotification.title, {
              body: newNotification.message,
              icon: '',
              tag: newNotification.notification_id, // 태그 추가해서 같은 알림 중복 방지
            });

            // 알림 클릭 또는 닫기 이벤트 처리
            notification.addEventListener('close', () => {
              // 알림이 닫히면 ID를 저장
              const updatedDismissed = [...dismissedNotifications, newNotification.notification_id];
              setDismissedNotifications(updatedDismissed);
              localStorage.setItem('dismissedNotifications', JSON.stringify(updatedDismissed));
            });
          } else {
            // 앱 내 알림 표시
            setShowNotification(true);
            setLatestNotification({
              title: newNotification.title,
              message: newNotification.message,
              id: newNotification.notification_id,
            });
          }

          // 마지막 알림 ID 저장
          setLastNotificationId(newNotification.notification_id);
          localStorage.setItem('lastNotificationId', newNotification.notification_id);
        }
      }
    }
  };

  // 로그인 상태가 변경될 때 알림 확인 시작/중지
  useEffect(() => {
    if (login?.data?.accessToken && !checkingNotifications && !isAdmin) {
      setCheckingNotifications(true);
      checkNewNotifications();
    } else if (!login?.data?.accessToken) {
      setCheckingNotifications(false);
    }
  }, [login?.data?.accessToken, isAdmin, notificationListResponse]); // eslint-disable-line

  useEffect(() => {
    // 주기적으로 새 알림 확인 (10 분마다)
    const notificationInterval = setInterval(
      () => {
        // 어드민이 아니면 알림 확인
        if (!isAdmin && notificationListResponse) {
          checkNewNotifications();
        }
      },
      10 * 60 * 1000,
    ); // 10분

    return () => clearInterval(notificationInterval);
  }, [isAdmin, userInfo, notificationListResponse]); // eslint-disable-line

  return (
    <>
      {login?.data?.accessToken && showNotification && (
        <div className='fixed bottom-4 right-4 z-[9999]'>
          <div
            className='flex h-[105px] w-[400px] items-center rounded-[16px] p-[20px]'
            style={{
              borderRadius: '16px',
              border: latestNotification?.title === '변호사 인증 미완료' ? '1px solid #F5222D' : '1px solid #096dd9',
              background: latestNotification?.title === '변호사 인증 미완료' ? '#FFF1F0' : '#e6f7ff',
            }}
          >
            <div className='absolute right-4 top-4'>
              <div
                className='flex h-[24px] w-[24px] cursor-pointer items-center justify-center rounded-full'
                style={{
                  backgroundColor: latestNotification?.title === '변호사 인증 미완료' ? '#F5222D' : '#096dd9',
                }}
                onClick={() => {
                  setShowNotification(false);
                  const notificationId = latestNotification?.id;
                  if (notificationId) {
                    const updatedDismissed = [...dismissedNotifications, notificationId];
                    setDismissedNotifications(updatedDismissed);
                    localStorage.setItem('dismissedNotifications', JSON.stringify(updatedDismissed));
                  }
                }}
              >
                <IoClose className='text-[16px] text-white' />
              </div>
            </div>
            <div className='flex flex-col'>
              <div
                className='text-[16px] font-bold'
                style={{
                  color: latestNotification?.title === '변호사 인증 미완료' ? '#F5222D' : '#0050b3',
                }}
              >
                {latestNotification?.title || '알림'}
              </div>
              <div
                className='line-clamp-2 max-w-[350px] pt-[6px] text-[14px] font-medium text-[#000]'
                style={{
                  display: '-webkit-box',
                  WebkitLineClamp: 2,
                  WebkitBoxOrient: 'vertical',
                  overflow: 'hidden',
                }}
              >
                {latestNotification?.message || ''}
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
};
