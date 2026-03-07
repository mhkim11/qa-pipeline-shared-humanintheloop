import { useQuery } from '@tanstack/react-query';
import { AxiosError } from 'axios';

import { fetchGetFilterCount } from '@/apis/evidence-api';
import { TGetFilterCountOutput } from '@/apis/type';

type TUseFindFillterCountOutput = {
  response?: TGetFilterCountOutput; // 증거 요약 데이터
  isLoading: boolean; // 쿼리 초기 로딩 상태
  error: AxiosError | null; // 쿼리 에러 정보
  refetch: () => void; // 쿼리 재실행 함수
};

/**
 * * 필터 갯수 조회 react-query query hook
 * @param {string} projectId 프로젝트 ID
 * @returns {TUseFindFillterCountOutput} output 필터 갯수 조회 결과
 */
export const useFindFillterCount = (projectId: string): TUseFindFillterCountOutput => {
  const {
    data: response,
    error,
    isLoading,
    refetch,
  } = useQuery<TGetFilterCountOutput, AxiosError>({
    queryKey: ['evidence', 'summary', projectId],
    queryFn: () => fetchGetFilterCount(projectId),
    enabled: Boolean(projectId), // projectId가 있을 때만 쿼리 실행
  });

  return { response, isLoading, error, refetch };
};
