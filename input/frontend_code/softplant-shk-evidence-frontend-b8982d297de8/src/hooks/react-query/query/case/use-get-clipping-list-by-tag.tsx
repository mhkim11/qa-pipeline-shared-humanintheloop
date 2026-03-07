import { useQuery } from '@tanstack/react-query';
import { AxiosError } from 'axios';

import { fetchGetClippingListByTag } from '@/apis/case-api/cliping-api';
import type { TGetClippingListByTagInput, TGetClippingListOutput } from '@/apis/type/case-type/cliping.type';

type TUseGetClippingListByTagParams = {
  civilCaseId?: string | null;
  tag?: string | null;
  page?: number;
  limit?: number;
  enabled?: boolean;
};

type TUseGetClippingListByTagOutput = {
  response?: TGetClippingListOutput;
  isFetching: boolean;
  isLoading: boolean;
  error: AxiosError | null;
  refetch: () => void;
};

export const useGetClippingListByTag = ({
  civilCaseId,
  tag,
  page = 1,
  limit = 20,
  enabled = true,
}: TUseGetClippingListByTagParams): TUseGetClippingListByTagOutput => {
  const input: TGetClippingListByTagInput | null =
    civilCaseId && tag
      ? {
          civil_case_id: String(civilCaseId),
          tag: String(tag),
          page,
          limit,
        }
      : null;

  const {
    data: response,
    error,
    isFetching,
    refetch,
    isLoading,
  } = useQuery<TGetClippingListOutput, AxiosError>({
    queryKey: ['civil-case', 'clipping-list-by-tag', civilCaseId ?? '', tag ?? '', page, limit],
    queryFn: () => fetchGetClippingListByTag(input as TGetClippingListByTagInput),
    enabled: enabled && !!input,
    staleTime: 10 * 1000,
    refetchOnWindowFocus: false,
  });

  return { response, error, isFetching, refetch, isLoading };
};
