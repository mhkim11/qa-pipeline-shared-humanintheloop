import { useQuery, useQueryClient } from '@tanstack/react-query';
import { AxiosError } from 'axios';

import { fetchListProject, EVIDENCE_QUERY_KEY } from '@/apis';
import { TGetUserInfoOutput, TListProjectOutput } from '@/apis/type';
import { paginationQueryKeyMaker } from '@/components/utils';

type TUseFindAllEvidenceInput = {
  page_no: number;
  block_cnt: number;
  keyword: string;
  isActive?: boolean;
  assignedMe: boolean;
  sort_column: string;
  isFinish: boolean;
  sort_direction: 'asc' | 'desc';
  filters: {
    status?: string[];
    project_role?: string[];
    lawyers?: string[];
    project_display_nm?: string[];
    total_pages?: string[];
    created_date?: string[];
  };
};
type TUseFindAllEvidenceOutput = {
  response?: TListProjectOutput;
  isFetching: boolean;
  isLoading: boolean;
  error: AxiosError | null;
  refetch: () => void;
};

/**
 * * 전체 사건목록 조회 react-query query hook
 * @returns {TUseFindAllEvidenceOutput} output 전체 사건 목록 조회 결과
 */
export const useFindAllEvidenceList = ({
  page_no,
  block_cnt,
  keyword,
  isActive,
  assignedMe,
  sort_column,
  sort_direction,
  filters,
  isFinish,
}: TUseFindAllEvidenceInput): TUseFindAllEvidenceOutput => {
  // ! react-query 모음
  // - useQueryClient 모음
  const queryClient = useQueryClient();
  // -- queryKey 모음
  const findAllEvidenceListQueryKey = paginationQueryKeyMaker({
    queryKeyName: EVIDENCE_QUERY_KEY.FIND_EVIDENCE,
    pageSize: block_cnt.toString(),
    otherQueryParams: {
      keyword,
      sort_column,
      sort_direction,
      page_no: String(page_no),
      status: JSON.stringify(filters.status),
      project_role: JSON.stringify(filters.project_role),
      lawyers: JSON.stringify(filters.lawyers),
      project_display_nm: JSON.stringify(filters.project_display_nm),
      total_pages: JSON.stringify(filters.total_pages),
      created_date: JSON.stringify(filters.created_date),
    },
  });
  const findUserInfoQueryKey = [EVIDENCE_QUERY_KEY.FIND_USER_INFO];

  // -- queryData 모음
  const findAllEvidenceListQueryData = queryClient.getQueryData<TListProjectOutput>(findAllEvidenceListQueryKey);
  const findUserInfoQueryData = queryClient.getQueryData<TGetUserInfoOutput>(findUserInfoQueryKey);

  const {
    data: response,
    error,
    isFetching,
    refetch,
    isLoading,
  } = useQuery<TListProjectOutput, AxiosError>({
    queryKey: findAllEvidenceListQueryKey,
    queryFn: async () => {
      const result = await fetchListProject({
        page_no,
        block_cnt: Number(block_cnt),
        keyword,
        isActive,
        sort_column,
        sort_direction,
        assignedMe,
        filters,
        isFinish,
      });

      return result;
    },
    enabled: block_cnt !== 0 && !!findUserInfoQueryData,
    gcTime: 1000 * 60 * 1, // 1분
    staleTime: 1000 * 60 * 1, // 1분
    initialData: () => {
      if (findAllEvidenceListQueryData) {
        return findAllEvidenceListQueryData;
      } else {
        queryClient.refetchQueries({ queryKey: findAllEvidenceListQueryKey });
        return findAllEvidenceListQueryData;
      }
    },
  });

  if (error) {
    console.error('Query Error:', error); // 에러 로그 출력
  }

  return { response, error, isFetching, refetch, isLoading };
};
