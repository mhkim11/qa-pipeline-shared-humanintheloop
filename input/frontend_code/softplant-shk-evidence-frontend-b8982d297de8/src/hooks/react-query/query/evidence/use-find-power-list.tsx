import { useQuery } from '@tanstack/react-query';
import { AxiosError } from 'axios';

import { fetchPowerSearch, EVIDENCE_QUERY_KEY } from '@/apis';
import { TPowerSearchOutput } from '@/apis/type';
import { paginationQueryKeyMaker } from '@/components/utils';

type TUsePowerSearchInput = {
  project_id: string;
  power_search: string;
  not_contain?: string[];
  page: number | string;
  limit: number | string;
};

type TUsePowerSearchOutput = {
  response?: TPowerSearchOutput;
  isFetching: boolean;
  isLoading: boolean;
  error: AxiosError | null;
  refetch: () => void;
};

/**
 * * 파워검색 react-query query hook
 * @param {TUsePowerSearchInput} input 검색 조건
 * @returns {TUsePowerSearchOutput} output 파워검색 결과
 */
export const usePowerSearch = ({ project_id, power_search, not_contain, page, limit }: TUsePowerSearchInput): TUsePowerSearchOutput => {
  const {
    data: response,
    error,
    isFetching,
    refetch,
    isLoading,
  } = useQuery<TPowerSearchOutput, AxiosError>({
    queryKey: paginationQueryKeyMaker({
      queryKeyName: EVIDENCE_QUERY_KEY.FINE_POWER_SEARCH,
      pageSize: limit.toString(),
      otherQueryParams: { project_id, power_search },
    }),
    queryFn: async () => {
      const result = await fetchPowerSearch({ project_id, power_search, not_contain, page, limit });
      return result;
    },
    enabled: project_id !== '' && power_search !== '',
  });

  if (error) {
    console.error('Query Error:', error);
  }

  return { response, error, isFetching, refetch, isLoading };
};
