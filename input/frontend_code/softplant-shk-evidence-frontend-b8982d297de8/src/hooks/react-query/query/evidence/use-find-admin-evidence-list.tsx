import { useQuery } from '@tanstack/react-query';
import { AxiosError } from 'axios';

import { fetchAdminEvidenceList, EVIDENCE_ADMIN_QUERY_KEY } from '@/apis';
import type { TUploadEvidenceListOutput } from '@/apis/type';
import { paginationQueryKeyMaker } from '@/components/utils';

type TUseAdminEvidenceListInput = {
  officeId: string;
  projectId: string;
  page_no: number;
  block_cnt: number;
};

type TUseAdminEvidenceListOutput = {
  response?: TUploadEvidenceListOutput;
  isFetching: boolean;
  isLoading: boolean;
  error: AxiosError | null;
  refetch: () => void;
};

/**
 * * 어드민 증거 목록 조회 React Query 훅
 * @param {TUseAdminEvidenceListInput} input - 조회 조건
 * @returns {TUseAdminEvidenceListOutput} - 증거 목록 데이터
 */
export const useAdminEvidenceList = ({
  officeId,
  projectId,
  page_no,
  block_cnt,
}: TUseAdminEvidenceListInput): TUseAdminEvidenceListOutput => {
  const {
    data: response,
    error,
    isFetching,
    refetch,
    isLoading,
  } = useQuery<TUploadEvidenceListOutput, AxiosError>({
    queryKey: paginationQueryKeyMaker({
      queryKeyName: EVIDENCE_ADMIN_QUERY_KEY.FIND_EVIDENCE_LIST,
      pageSize: block_cnt.toString(),
      otherQueryParams: { officeId, projectId, page: page_no.toString() },
    }),
    queryFn: async () => {
      return await fetchAdminEvidenceList({
        office_id: officeId,
        project_id: projectId,
        page_no: page_no,
        block_cnt: block_cnt,
      });
    },
    enabled: !!officeId && !!projectId, // officeId, projectId가 있을 때만 실행
    retry: 0,
    staleTime: 1000 * 5, // 과도 호출 방지 (5초 캐시)
    gcTime: 1000 * 60 * 10,
    refetchOnMount: false,
    refetchOnWindowFocus: false,
    refetchOnReconnect: false,
  });

  if (error) {
    console.error('Query Error:', error); // 에러 로그 출력
  }

  return { response, error, isFetching, refetch, isLoading };
};
