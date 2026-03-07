import { useQuery } from '@tanstack/react-query';
import { AxiosError } from 'axios';

import { fetchGetUserInfo, EVIDENCE_QUERY_KEY } from '@/apis';
import { TGetUserInfoOutput } from '@/apis/type';

type TUseFindUserInfoOutput = {
  response?: TGetUserInfoOutput;
  isFetching: boolean;
  isLoading: boolean;
  error: AxiosError | null;
  refetch: () => void;
};

type TUseFindUserInfoParams = {
  enabled?: boolean;
};

/**
 * * 사용자 정보 조회 react-query query hook
 * @returns {TUseFindUserInfoOutput} 사용자 정보 조회 결과
 */
export const useFindUserInfo = (params?: TUseFindUserInfoParams): TUseFindUserInfoOutput => {
  const enabled = params?.enabled !== false;

  const {
    data: userInfo,
    error,
    isFetching,
    refetch,
    isLoading,
  } = useQuery<TGetUserInfoOutput, AxiosError>({
    queryKey: [EVIDENCE_QUERY_KEY.FIND_USER_INFO],
    queryFn: fetchGetUserInfo,
    enabled,
    staleTime: 30 * 60 * 1000, // 30분간 데이터를 fresh로 유지 (사용자 정보는 자주 변경되지 않음)
    gcTime: 60 * 60 * 1000, // 60분간 캐시 유지
    refetchOnWindowFocus: false, // 윈도우 포커스 시 refetch 방지
    refetchOnMount: false, // 컴포넌트 마운트 시 refetch 방지 (캐시된 데이터가 있으면)
    refetchOnReconnect: false, // 네트워크 재연결 시 refetch 방지
  });

  if (error) {
    console.error('Query Error:', error);
  }

  return { response: userInfo, error, isFetching, refetch, isLoading };
};
