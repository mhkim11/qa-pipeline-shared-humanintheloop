import { useQuery } from '@tanstack/react-query';

import { fetchGetRequestDocumentList } from '@/apis/case-api/request-api';
import type { TRequestDocumentListInput, TRequestDocumentListOutput } from '@/apis/type/case-type/request-type';

import type { AxiosError } from 'axios';

type TUseGetRequestDocumentListParams = {
  input?: TRequestDocumentListInput | null;
  enabled?: boolean;
};

type TUseGetRequestDocumentListOutput = {
  response?: TRequestDocumentListOutput;
  isFetching: boolean;
  isLoading: boolean;
  error: AxiosError | null;
  refetch: () => void;
};

export const useGetRequestDocumentList = ({
  input,
  enabled = true,
}: TUseGetRequestDocumentListParams): TUseGetRequestDocumentListOutput => {
  const {
    data: response,
    error,
    isFetching,
    refetch,
    isLoading,
  } = useQuery<TRequestDocumentListOutput, AxiosError>({
    queryKey: [
      'evidence-request',
      'documents',
      input?.evidence_request_id ?? '',
      input?.evidence_category ?? '',
      input?.page ?? 0,
      input?.limit ?? 0,
    ],
    queryFn: () => fetchGetRequestDocumentList(input as TRequestDocumentListInput),
    enabled: enabled && !!input?.evidence_request_id,
    staleTime: 30 * 1000,
    refetchOnWindowFocus: false,
  });

  return { response, error: error ?? null, isFetching, refetch, isLoading };
};
