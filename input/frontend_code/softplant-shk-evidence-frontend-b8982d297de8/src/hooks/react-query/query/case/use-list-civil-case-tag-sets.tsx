import { useQuery } from '@tanstack/react-query';
import { AxiosError } from 'axios';

import { fetchListTagSet } from '@/apis/case-api/civil-case-api';
import type { TCivilCaseDocumentTagSetListOutput } from '@/apis/type/case-type/civil-case.type';

type TUseListCivilCaseTagSetsParams = {
  civilCaseId?: string | null;
  enabled?: boolean;
};

type TUseListCivilCaseTagSetsOutput = {
  response?: TCivilCaseDocumentTagSetListOutput;
  isFetching: boolean;
  isLoading: boolean;
  error: AxiosError | null;
  refetch: () => void;
};

export const useListCivilCaseTagSets = ({
  civilCaseId,
  enabled = true,
}: TUseListCivilCaseTagSetsParams): TUseListCivilCaseTagSetsOutput => {
  const {
    data: response,
    error,
    isFetching,
    isLoading,
    refetch,
  } = useQuery<TCivilCaseDocumentTagSetListOutput, AxiosError>({
    queryKey: ['civil-case', 'tag-sets', civilCaseId],
    queryFn: () => fetchListTagSet(String(civilCaseId)),
    enabled: enabled && !!civilCaseId,
    staleTime: 30 * 1000,
    refetchOnWindowFocus: false,
  });

  return { response, error, isFetching, isLoading, refetch };
};
