import { useQuery } from '@tanstack/react-query';
import { AxiosError } from 'axios';

import { fetchGetRequestClientEmails } from '@/apis/case-api/request-api';
import type { TRequestClientEmailListInput, TRequestClientEmailListOutput } from '@/apis/type/case-type/request-type';

type TUseGetRequestClientEmailsParams = {
  input?: TRequestClientEmailListInput | null;
  enabled?: boolean;
};

type TUseGetRequestClientEmailsOutput = {
  response?: TRequestClientEmailListOutput;
  isFetching: boolean;
  isLoading: boolean;
  error: AxiosError | null;
  refetch: () => void;
};

export const useGetRequestClientEmails = ({
  input,
  enabled = true,
}: TUseGetRequestClientEmailsParams): TUseGetRequestClientEmailsOutput => {
  const {
    data: response,
    error,
    isFetching,
    refetch,
    isLoading,
  } = useQuery<TRequestClientEmailListOutput, AxiosError>({
    queryKey: ['evidence-request', 'client-emails', input?.civil_case_id ?? '', input?.search ?? ''],
    queryFn: () => fetchGetRequestClientEmails(input as TRequestClientEmailListInput),
    enabled: enabled && !!input?.civil_case_id,
    staleTime: 30 * 1000,
    refetchOnWindowFocus: false,
  });

  return { response, error: error ?? null, isFetching, refetch, isLoading };
};
