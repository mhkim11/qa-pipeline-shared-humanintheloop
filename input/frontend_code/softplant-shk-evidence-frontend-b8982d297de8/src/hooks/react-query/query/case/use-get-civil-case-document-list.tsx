import { useQuery } from '@tanstack/react-query';
import { AxiosError } from 'axios';

import {
  fetchGetDocumentList,
  type TCivilCaseDocumentListFilters,
  type TCivilCaseDocumentListSortColumn,
  type TCivilCaseDocumentListSortDirection,
} from '@/apis/case-api/civil-case-api';
import type { TCivilCaseDocumentListOutput } from '@/apis/type/case-type/civil-case.type';

type TUseGetCivilCaseDocumentListParams = {
  civilCaseId?: string | null;
  keyword?: string;
  keywordVersion?: number;
  powerSearch?: string;
  sourceType?: 'LAWYER' | 'CLIENT';
  page?: number;
  limit?: number;
  filters?: TCivilCaseDocumentListFilters;
  sortColumn?: TCivilCaseDocumentListSortColumn;
  sortDirection?: TCivilCaseDocumentListSortDirection;
  enabled?: boolean;
};

type TUseGetCivilCaseDocumentListOutput = {
  response?: TCivilCaseDocumentListOutput;
  isFetching: boolean;
  isLoading: boolean;
  error: AxiosError | null;
  refetch: () => void;
};

export const useGetCivilCaseDocumentList = ({
  civilCaseId,
  keyword,
  keywordVersion,
  powerSearch,
  sourceType,
  page = 1,
  limit = 10,
  filters,
  sortColumn,
  sortDirection,
  enabled = true,
}: TUseGetCivilCaseDocumentListParams): TUseGetCivilCaseDocumentListOutput => {
  const {
    data: response,
    error,
    isFetching,
    refetch,
    isLoading,
  } = useQuery<TCivilCaseDocumentListOutput, AxiosError>({
    queryKey: [
      'civil-case',
      'case-documents',
      civilCaseId,
      keyword ?? '',
      keywordVersion ?? 0,
      powerSearch ?? '',
      sourceType ?? '',
      page,
      limit,
      filters ?? null,
      sortColumn ?? null,
      sortDirection ?? null,
    ],
    queryFn: () =>
      fetchGetDocumentList(String(civilCaseId), page, limit, {
        keyword,
        powerSearch,
        source_type: sourceType,
        filters,
        sortColumn,
        sortDirection,
      }),
    enabled: enabled && !!civilCaseId,
    staleTime: 30 * 1000,
    refetchOnWindowFocus: false,
  });

  return { response, error, isFetching, refetch, isLoading };
};
