import { lazy, ReactElement, Suspense, useEffect, useState } from 'react';

import { MutationCache, QueryCache, QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { AxiosError, isAxiosError } from 'axios';
import dayjs from 'dayjs';
import customParseFormat from 'dayjs/plugin/customParseFormat';
import isBetween from 'dayjs/plugin/isBetween';
import isoWeek from 'dayjs/plugin/isoWeek';
import isSameOrBefore from 'dayjs/plugin/isSameOrBefore';
import localeData from 'dayjs/plugin/localeData';
import { delay } from 'lodash-es';
// import { IoClose } from 'react-icons/io5';
import { RouterProvider } from 'react-router-dom';
import { useWindowSize } from 'usehooks-ts';

import * as S from '@styled/default/global.styled';
import { useLoginStore, useMainStore } from '@stores/index';
import { globalStore } from '@atoms/default';
// import { fetchListNotification } from '@apis/evidence-api';
import { Button } from '@components/ui/button';
import { fetchRefreshToken, USER_QUERY_KEY } from '@/apis';
import { DialogLayout } from '@/components/common';
import { NotificationChecker } from '@/components/notification-checker';
import { onClearCachedImageDataAll, to } from '@/components/utils';
import Router from '@/router';

import 'dayjs/locale/ko';

dayjs.extend(isoWeek);
dayjs.extend(isSameOrBefore);
dayjs.extend(customParseFormat);
dayjs.extend(localeData);
dayjs.extend(isBetween);
dayjs.locale('ko');

let ReactQueryDevtools: React.ComponentType<any> | null = null;
let DevTools: React.ComponentType<any> | null = null;
const SHOW_JOTAI_DEVTOOLS = process.env.NODE_ENV === 'development' && import.meta.env.VITE_SHOW_JOTAI_DEVTOOLS === 'true';

// 여러 쿼리가 동시에 401을 내면 refresh token 요청이 중복으로 발생하면서
// 같은 API가 여러 번 재호출되는 현상이 생길 수 있어 single-flight로 묶는다.
let refreshTokenInFlight: Promise<any> | null = null;

if (process.env.NODE_ENV === 'development') {
  ReactQueryDevtools = lazy(() =>
    import('@tanstack/react-query-devtools').then((module) => ({
      default: module.ReactQueryDevtools,
    })),
  );
  if (SHOW_JOTAI_DEVTOOLS) {
    DevTools = lazy(() =>
      import('jotai-devtools').then((module) => {
        // CSS 파일을 동적으로 import
        const result = import('jotai-devtools/styles.css').then(() => {
          return { default: module.DevTools };
        });

        return result;
      }),
    );
  }
}

/**
 * * 프로젝트 최상위 앱 컴포넌트
 * @returns {ReactElement} 앱 컴포넌트
 */
const App = (): ReactElement => {
  // ! jotai atom 모음
  // - 로그인 관련 store
  const { login, dispatchLogin } = useLoginStore();
  // - main 관련 store
  const { authError, dispatchAuthError } = useMainStore();
  const [lastNotificationId, setLastNotificationId] = useState<string | null>(null);
  const [checkingNotifications, setCheckingNotifications] = useState(false);
  const [latestNotification, setLatestNotification] = useState<{ title: string; message: string; id: string } | null>(null);
  const [showNotification, setShowNotification] = useState(false);
  const [dismissedNotifications, setDismissedNotifications] = useState<string[]>(() => {
    const saved = localStorage.getItem('dismissedNotifications');
    return saved ? JSON.parse(saved) : [];
  });

  // 어드민 여부 확인
  const isAdmin = login?.data?.user?.role === 'ADMIN';

  const shouldUseLoginRouter = !!login?.data?.accessToken;

  // ! 기본 state 모음
  const [queryClient] = useState(
    () =>
      new QueryClient({
        defaultOptions: {
          queries: {
            refetchOnWindowFocus: false,
            retry: 2,
          },
          mutations: {
            retry: 0,
          },
        },
        queryCache: new QueryCache({
          onError: async (error, query) => {
            if (isAxiosError(error)) {
              if (error.response?.status === 401 && !query.queryKey.includes(USER_QUERY_KEY.LOGIN_USER)) {
                // refresh token 요청은 한 번만 수행하고, 나머지는 동일 Promise를 await
                if (!refreshTokenInFlight) {
                  refreshTokenInFlight = fetchRefreshToken().finally(() => {
                    refreshTokenInFlight = null;
                  });
                }

                const [resultError, result] = await to(refreshTokenInFlight);

                if (resultError instanceof AxiosError) {
                  delay(() => {
                    dispatchAuthError({ type: 'AUTH_ERROR' });
                    document.body.style.overflow = 'hidden';
                  }, 500);
                  return;
                }

                dispatchLogin({
                  type: 'LOGIN',
                  payload: {
                    ...login,
                    data: {
                      ...login.data,
                      accessToken: result?.data?.accessToken ?? '',
                    },
                  },
                });

                await query.fetch();
              }
            }
          },
        }),
        mutationCache: new MutationCache({
          onError: async (error, _mutation) => {
            if (isAxiosError(error)) {
              if (error.response?.status === 401) {
                dispatchLogin({
                  type: 'LOGIN',
                  payload: {
                    ...login,
                    data: {
                      ...login.data,
                      accessToken: '',
                    },
                  },
                });
              }
            }
          },
        }),
      }),
  );

  // ! usehooks-ts 모음
  const { width } = useWindowSize();
  // ! router 모음
  const { loginRouter, logoutRouter } = Router({ queryClient });

  if (process.env.NODE_ENV === 'production' && (!window.location.pathname.includes('busan') || !window.location.pathname.includes('sky'))) {
    console.log = () => {}; // eslint-disable-line
    console.warn = () => {}; // eslint-disable-line
    console.error = () => {}; // eslint-disable-line
  }

  if (process.env.NODE_ENV === 'development') {
    const consoleError = console.error;

    console.error = function filterErrors(msg, ...args): void {
      if (/server-side rendering/.test(msg)) {
        return;
      }
      consoleError(msg, ...args);
    };
  }

  // 로그아웃 이벤트로 React Query 캐시 초기화
  useEffect(() => {
    const handleStorageEvent = (event: StorageEvent) => {
      if (event.key === 'cache-reset') {
        // 전체 캐시 초기화
        queryClient.clear();
        // console.log('React Query 캐시가 초기화되었습니다.');
      }
    };

    // 이벤트 리스너 등록
    window.addEventListener('storage', handleStorageEvent);

    // 직접 발생한 이벤트 처리
    const handleStorageResetEvent = () => {
      queryClient.clear();
      // console.log('React Query 캐시가 초기화되었습니다.');
    };

    window.addEventListener('storage-reset', handleStorageResetEvent);

    return () => {
      window.removeEventListener('storage', handleStorageEvent);
      window.removeEventListener('storage-reset', handleStorageResetEvent);
    };
  }, [queryClient]);

  // ! useEffect 모음
  useEffect(() => {
    if (authError === 'RESET') {
      document.body.removeAttribute('style');
    } else {
      document.body.style.overflow = 'hidden';
    }
  }, [authError]);

  // 알림 권한 요청
  const requestNotificationPermission = async () => {
    if ('Notification' in window) {
      if (Notification.permission !== 'granted' && Notification.permission !== 'denied') {
        try {
          const permission = await Notification.requestPermission();
          console.log('알림 권한 요청 결과:', permission);
        } catch (err) {
          console.error('알림 권한 요청 실패:', err);
        }
      }
    } else {
      console.error('이 브라우저는 알림을 지원하지 않습니다');
    }
  };

  // 서비스 워커 등록
  const registerServiceWorker = async () => {
    try {
      if (!('serviceWorker' in navigator)) {
        return;
      }

      // 기존 서비스 워커 확인
      const registrations = await navigator.serviceWorker.getRegistrations();

      // 기존 서비스 워커 해제 (개발 중 테스트용)
      for (const registration of registrations) {
        await registration.unregister();
      }

      // 서비스 워커 등록 시도
      const registration = await navigator.serviceWorker.register('/notification-worker.js', {
        scope: '/',
      });

      // 서비스 워커 갱신
      registration.update();

      return registration;
    } catch (error) {
      console.error('서비스 워커 등록 실패:', error);
      return null;
    }
  };

  useEffect(() => {
    // 서비스 워커 등록
    if ('serviceWorker' in navigator && 'PushManager' in window) {
      registerServiceWorker();
      requestNotificationPermission();

      // 로컬 스토리지에서 마지막 알림 ID 가져오기
      const storedId = localStorage.getItem('lastNotificationId');
      if (storedId) setLastNotificationId(storedId);
    }
  }, []);

  return (
    <QueryClientProvider client={queryClient}>
      {!!login?.data?.accessToken && authError !== 'RESET' && (
        <DialogLayout
          isOpen={authError === 'AUTH_ERROR' || authError === 'GLOBAL_ERROR'}
          title='로그인 세션이 만료되었습니다.'
          subTitle='새로고침을 눌러 다시 로그인 해주세요.'
          onSetIsOpen={(): void => dispatchAuthError({ type: 'RESET' })}
        >
          <S.AuthErrorWrapper>
            <S.AuthError>
              <S.WarningIcon />
              <S.AuthErrorTextWrapper>
                {authError === 'AUTH_ERROR' ? (
                  <>
                    <S.AuthErrorText>로그인 세션이 만료되었습니다.</S.AuthErrorText>
                    <S.AuthErrorText>새로고침을 눌러 다시 로그인 해주세요.</S.AuthErrorText>
                  </>
                ) : (
                  <>
                    <S.AuthErrorText>재로그인이 필요합니다.</S.AuthErrorText>
                    <S.AuthErrorText>새로고침을 눌러 다시 로그인 해주세요.</S.AuthErrorText>
                  </>
                )}
              </S.AuthErrorTextWrapper>
              <Button
                onClick={(): void => {
                  dispatchLogin({ type: 'LOGOUT' });
                  dispatchAuthError({ type: 'RESET' });
                  onClearCachedImageDataAll();
                  document.body.removeAttribute('style');
                  window.location.replace('/logout');
                }}
                className='bg-amber-400 px-12 text-black pretendard-semibold hover:bg-amber-300'
              >
                새로고침
              </Button>
            </S.AuthError>
          </S.AuthErrorWrapper>
        </DialogLayout>
      )}

      {login?.data?.accessToken && !isAdmin && (
        <NotificationChecker
          login={login}
          isAdmin={isAdmin}
          lastNotificationId={lastNotificationId}
          setLastNotificationId={setLastNotificationId}
          checkingNotifications={checkingNotifications}
          setCheckingNotifications={setCheckingNotifications}
          latestNotification={latestNotification}
          setLatestNotification={setLatestNotification}
          showNotification={showNotification}
          setShowNotification={setShowNotification}
          dismissedNotifications={dismissedNotifications}
          setDismissedNotifications={setDismissedNotifications}
        />
      )}

      {process.env.NODE_ENV === 'development' && (
        <Suspense fallback={null}>
          {SHOW_JOTAI_DEVTOOLS && DevTools && <DevTools isInitialOpen={false} theme={'dark'} store={globalStore} />}
          {ReactQueryDevtools && <ReactQueryDevtools initialIsOpen={false} buttonPosition={width < 400 ? 'top-right' : 'bottom-right'} />}
        </Suspense>
      )}
      <RouterProvider key={login?.data.accessToken} router={shouldUseLoginRouter ? loginRouter : logoutRouter} />

      {String(import.meta.env.VITE_BACKEND_URL ?? '').includes('staging') && (
        <div
          style={{
            position: 'fixed',
            top: 12,
            right: 12,
            zIndex: 99999,
            background: '#FF4D4F',
            color: '#fff',
            fontSize: 22,
            fontWeight: 700,
            padding: '4px 12px',
            borderRadius: 6,
            letterSpacing: 1,
            pointerEvents: 'none',
            userSelect: 'none',
            boxShadow: '0 2px 8px rgba(0,0,0,0.15)',
          }}
        >
          STAGING
        </div>
      )}
    </QueryClientProvider>
  );
};

export default App;
