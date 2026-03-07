import { useQuery } from '@tanstack/react-query';
import { AxiosError } from 'axios';

import { fetchListMemo } from '@/apis/case-api/civil-case-api';
import type { TCivilCaseDocumentMemoListOutput } from '@/apis/type/case-type/civil-case.type';

type TUseListCivilCaseDocumentMemosParams = {
  caseDocumentId?: string | null;
  enabled?: boolean;
};

type TUseListCivilCaseDocumentMemosOutput = {
  response?: TCivilCaseDocumentMemoListOutput;
  isFetching: boolean;
  isLoading: boolean;
  error: AxiosError | null;
  refetch: () => void;
};

export const useListCivilCaseDocumentMemos = ({
  caseDocumentId,
  enabled = true,
}: TUseListCivilCaseDocumentMemosParams): TUseListCivilCaseDocumentMemosOutput => {
  const {
    data: response,
    error,
    isFetching,
    isLoading,
    refetch,
  } = useQuery<TCivilCaseDocumentMemoListOutput, AxiosError>({
    queryKey: ['civil-case', 'case-document-memos', caseDocumentId],
    queryFn: () => fetchListMemo(String(caseDocumentId)),
    enabled: enabled && !!caseDocumentId,
    staleTime: 10 * 1000,
    refetchOnWindowFocus: false,
  });

  return { response, error, isFetching, isLoading, refetch };
};
