import { useQuery } from '@tanstack/react-query';

import { fetchListEvidenceTagsProjectDistinct, EVIDENCE_QUERY_KEY } from '@/apis';
import { TListEvidenceTagsInput, TListEvidenceTagsProjectDistinctOutput } from '@/apis/type';

type TUseListEvidenceTagsProjectDistinctInput = TListEvidenceTagsInput & {
  enabled?: boolean;
};

type TUseListEvidenceTagsProjectDistinctOutput = {
  response: TListEvidenceTagsProjectDistinctOutput | undefined;
  refetch: () => Promise<any>;
  isLoading: boolean;
};

/**
 * * 프로젝트 사용중인 태그 목록 조회 : list [react-query query]
 * @param {TUseListEvidenceTagsProjectDistinctInput} input 프로젝트 사용중인 태그 목록 조회 입력 데이터
 * @returns {TUseListEvidenceTagsProjectDistinctOutput} 프로젝트 사용중인 태그 목록 조회 결과
 */
export const useListEvidenceTagsProjectDistinct = (
  input: TUseListEvidenceTagsProjectDistinctInput,
): TUseListEvidenceTagsProjectDistinctOutput => {
  const {
    data: response,
    refetch,
    isLoading,
  } = useQuery<TListEvidenceTagsProjectDistinctOutput>({
    queryKey: [EVIDENCE_QUERY_KEY.LIST_ASSIGN_TAG_PROJECT, input.project_id],
    queryFn: () => fetchListEvidenceTagsProjectDistinct(input),
    enabled: input.enabled !== false && !!input.project_id,
    staleTime: 1 * 60 * 1000, // 1분
    gcTime: 5 * 60 * 1000, // 5분
    refetchOnWindowFocus: false,
    refetchOnMount: false,
    refetchOnReconnect: false,
  });

  return { response, refetch, isLoading };
};
