import { useQuery, QueryObserverResult } from '@tanstack/react-query';
import { AxiosError } from 'axios';

import { fetchListTagDocument } from '@/apis/case-api/civil-case-api';
import type { TCivilCaseDocumentTagListOutput } from '@/apis/type/case-type/civil-case.type';

type TUseListCivilCaseDocumentTagsParams = {
  civilCaseId?: string | null;
  caseDocumentId?: string | null;
  enabled?: boolean;
};

type TUseListCivilCaseDocumentTagsOutput = {
  response?: TCivilCaseDocumentTagListOutput;
  isFetching: boolean;
  isLoading: boolean;
  error: AxiosError | null;
  refetch: () => Promise<QueryObserverResult<TCivilCaseDocumentTagListOutput, AxiosError>>;
};

export const useListCivilCaseDocumentTags = ({
  civilCaseId,
  caseDocumentId,
  enabled = true,
}: TUseListCivilCaseDocumentTagsParams): TUseListCivilCaseDocumentTagsOutput => {
  const {
    data: response,
    error,
    isFetching,
    isLoading,
    refetch,
  } = useQuery<TCivilCaseDocumentTagListOutput, AxiosError>({
    queryKey: ['civil-case', 'case-document-tags', civilCaseId, caseDocumentId],
    queryFn: () => fetchListTagDocument(String(civilCaseId), String(caseDocumentId)),
    enabled: enabled && !!civilCaseId && !!caseDocumentId,
    staleTime: 30 * 1000,
    refetchOnWindowFocus: false,
  });

  return { response, error, isFetching, isLoading, refetch };
};
