import { useQuery } from '@tanstack/react-query';
import { AxiosError } from 'axios';

import { fetchGetClippingListByCivilCase } from '@/apis/case-api/cliping-api';
import type { TGetClippingListInput, TGetClippingListOutput } from '@/apis/type/case-type/cliping.type';

type TUseGetClippingListParams = {
  civilCaseId?: string | null;
  caseDocumentId?: string | null;
  /** comma-separated creator ids */
  creatorIds?: string | null;
  page?: number;
  limit?: number;
  enabled?: boolean;
};

type TUseGetClippingListOutput = {
  response?: TGetClippingListOutput;
  isFetching: boolean;
  isLoading: boolean;
  error: AxiosError | null;
  refetch: () => void;
};

export const useGetClippingList = ({
  civilCaseId,
  caseDocumentId,
  creatorIds,
  page = 1,
  limit = 20,
  enabled = true,
}: TUseGetClippingListParams): TUseGetClippingListOutput => {
  const input: TGetClippingListInput | null =
    civilCaseId || caseDocumentId
      ? {
          page,
          limit,
          ...(civilCaseId && { civil_case_id: civilCaseId }),
          ...(caseDocumentId && { case_document_id: caseDocumentId }),
          ...(creatorIds && String(creatorIds).trim() ? { creator_ids: String(creatorIds).trim() } : {}),
        }
      : null;

  const {
    data: response,
    error,
    isFetching,
    refetch,
    isLoading,
  } = useQuery<TGetClippingListOutput, AxiosError>({
    queryKey: ['civil-case', 'clipping-list', civilCaseId, caseDocumentId, creatorIds ?? '', page, limit],
    queryFn: () => fetchGetClippingListByCivilCase(input as TGetClippingListInput),
    enabled: enabled && !!input,
    staleTime: 10 * 1000,
    refetchOnWindowFocus: false,
  });

  return { response, error, isFetching, refetch, isLoading };
};
