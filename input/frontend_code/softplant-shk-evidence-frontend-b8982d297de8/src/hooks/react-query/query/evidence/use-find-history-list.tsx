import { useQuery } from '@tanstack/react-query';
import { AxiosError } from 'axios';

import { fetchListHistory, EVIDENCE_QUERY_KEY } from '@/apis';
import { paginationQueryKeyMaker } from '@/components/utils';

// ✅ 히스토리 목록 조회 input type
export type TListHistoryInput = {
  project_id: string;
  page_no: number;
  block_cnt: number;
  keyword: string;
  start_date: string;
  end_date: string;
  filters: {
    user_id: string[];
  };
};
// ✅ 히스토리 목록 조회 data type
export type TListHistoryData = {
  histories: Array<{
    office_id: string;
    project_id: string;
    ip: string;
    user_id: string;
    user_nm: string;
    category: string;
    type: string;
    content: string;
    prev_content: string;
    reg_dt: string;
    history_id: string;
    title?: string;
    related_id?: string;
    user_color: string;
    thumbnail_url: string;
    nickname: string;
  }>;
  pagination: {
    total: number; // 총 알림 개수
    page_no: number; // 총 페이지 수
    block_cnt: number; // 현재 페이지 번호
    total_pages: number; // 블록당 요청 개수
  };
};

// ✅ 히스토리 목록 조회 output type
export type TListHistoryOutput = {
  success: boolean;
  message: string;
  data: TListHistoryData;
};

// ✅ React Query 훅 반환 타입
export type TUseFindHistoryListOutput = {
  response?: TListHistoryData;

  error: AxiosError | null;
  isFetching: boolean;
  isLoading: boolean;
  refetch: () => void;
};

/**
 * * 히스토리 리스트 검색 react-query query hook
 * @param {TListHistoryInput} input 검색 조건
 * @returns {TUseFindHistoryListOutput} output 히스토리 검색 결과
 */
export const useFindHistoryList = ({
  project_id,
  page_no,
  block_cnt,
  filters,
  start_date,
  end_date,
}: TListHistoryInput): TUseFindHistoryListOutput => {
  const { data, error, isFetching, refetch, isLoading } = useQuery<TListHistoryOutput, AxiosError>({
    queryKey: paginationQueryKeyMaker({
      queryKeyName: EVIDENCE_QUERY_KEY.FINE_LIST_HISTORY,
      pageSize: block_cnt.toString(),
      otherQueryParams: {
        project_id,
        page_no: page_no.toString(),
        filters: JSON.stringify(filters),
      },
    }),
    queryFn: async () => await fetchListHistory({ start_date, end_date, project_id, page_no, block_cnt, filters, keyword: '' }),
    enabled: !!project_id, // project_id가 존재할 때만 실행
  });

  return { response: data?.data, error, isFetching, refetch, isLoading };
};
