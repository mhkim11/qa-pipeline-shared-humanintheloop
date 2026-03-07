import { useQuery } from '@tanstack/react-query';
import { AxiosError } from 'axios';

import { fetchListHistoryUserFilter, EVIDENCE_QUERY_KEY } from '@/apis';
import { paginationQueryKeyMaker } from '@/components/utils';

// ✅ 히스토리 사용자 필터 조회 input type
export type TListHistoryUserFilterInput = {
  project_id: string;
};

// ✅ 히스토리 사용자 필터 조회 data type
export type TListHistoryUserFilterData = {
  user_id: string;
  user_nm: string;
  count: number;
  isMe: boolean;
  isManager: boolean;
  user_color: string;
  thumbnail: string;
  nickname: string;
  thumbnail_url: string;
};

// ✅ 히스토리 사용자 필터 조회 output type
export type TListHistoryUserFilterOutput = {
  success: boolean; // 요청 성공 여부
  message: string; // 응답 메시지
  data: TListHistoryUserFilterData[]; // 사용자 필터 목록 데이터
};

// ✅ React Query 훅 반환 타입
export type TUseListEvidenceOutput = {
  response?: TListHistoryUserFilterData[];
  error: AxiosError | null;
  isFetching: boolean;
  isLoading: boolean;
  refetch: () => void;
};

/**
 * * 히스토리 사용자 필터 검색 react-query query hook
 * @param {TListHistoryUserFilterInput} input 검색 조건
 * @returns {TUseListEvidenceOutput} output 히스토리 사용자 필터 검색 결과
 */
export const useHistoryFiltersEvidence = ({ project_id }: TListHistoryUserFilterInput): TUseListEvidenceOutput => {
  const { data, error, isFetching, refetch, isLoading } = useQuery<TListHistoryUserFilterOutput, AxiosError>({
    queryKey: paginationQueryKeyMaker({
      queryKeyName: EVIDENCE_QUERY_KEY.FINE_LIST_HISTORY_USER_FILTER,
      pageSize: '10',
      otherQueryParams: { project_id },
    }),
    queryFn: async () => await fetchListHistoryUserFilter({ project_id }),
    enabled: !!project_id, // project_id가 존재할 때만 실행
  });

  return { response: data?.data, error, isFetching, refetch, isLoading };
};
