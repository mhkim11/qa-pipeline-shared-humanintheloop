import { useQuery } from '@tanstack/react-query';
import { AxiosError } from 'axios';

import { fetchUnreadNotificationCount } from '@/apis/evidence-api';
import { TUnreadNotificationOutput } from '@/apis/type';

type TUseUnreadNotificationCountOutput = {
  response?: TUnreadNotificationOutput; // 읽지 않은 알림 개수 데이터
  isLoading: boolean; // 쿼리 초기 로딩 상태
  error: AxiosError | null; // 쿼리 에러 정보
  refetch: () => void; // 쿼리 재실행 함수
};

/**
 * * 읽지 않은 알림 개수 조회 react-query query hook
 * @returns {TUseUnreadNotificationCountOutput} output 읽지 않은 알림 개수 조회 결과
 */
export const useUnreadNotificationCount = (): TUseUnreadNotificationCountOutput => {
  const hasAccessToken = (() => {
    try {
      const raw = localStorage.getItem('evidence-frontend-login') || '{}';
      const parsed = JSON.parse(raw);
      return !!parsed?.data?.accessToken;
    } catch {
      return false;
    }
  })();

  const {
    data: response, // 쿼리 결과 데이터
    error, // 에러 정보
    isLoading, // 쿼리 초기 로딩 상태
    refetch, // 쿼리 재실행 함수
  } = useQuery<TUnreadNotificationOutput, AxiosError>({
    queryKey: ['notification', 'unreadCount'], // 쿼리 키 정의
    queryFn: fetchUnreadNotificationCount, // API 호출 함수
    enabled: hasAccessToken, // 로그인 전에는 호출하지 않음
    // "한 번만 호출" 정책: 캐시를 영구 보관 + 포커스/리커넥트/마운트 리패치 방지
    staleTime: Number.POSITIVE_INFINITY,
    gcTime: Number.POSITIVE_INFINITY,
    refetchOnWindowFocus: false,
    refetchOnReconnect: false,
    refetchOnMount: false,
    // 토큰 없을 때 401/네트워크 에러로 재시도하며 여러 번 호출되는 것을 방지
    retry: false,
    retryOnMount: false,
  });

  return { response, isLoading, error, refetch };
};
