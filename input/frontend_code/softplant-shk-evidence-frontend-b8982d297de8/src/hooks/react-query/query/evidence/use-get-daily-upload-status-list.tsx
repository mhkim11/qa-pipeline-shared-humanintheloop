import { useQuery } from '@tanstack/react-query';
import { AxiosError } from 'axios';

import { EVIDENCE_ADMIN_QUERY_KEY, fetchGetDailyUploadStatusList } from '@/apis';
import type { TGetDailyUploadStatusListInput, TGetDailyUploadStatusListOutput } from '@/apis/type';

type TUseGetDailyUploadStatusListOutput = {
  response?: TGetDailyUploadStatusListOutput;
  isFetching: boolean;
  isLoading: boolean;
  error: AxiosError | null;
  refetch: () => void;
};

export const useGetDailyUploadStatusList = (
  input: Pick<TGetDailyUploadStatusListInput, 'project_id'>,
): TUseGetDailyUploadStatusListOutput => {
  const projectId = input.project_id ?? '';

  const {
    data: response,
    error,
    isFetching,
    refetch,
    isLoading,
  } = useQuery<TGetDailyUploadStatusListOutput, AxiosError>({
    queryKey: [EVIDENCE_ADMIN_QUERY_KEY.GET_DAILY_UPLOAD_STATUS_LIST, projectId],
    queryFn: async () => {
      return await fetchGetDailyUploadStatusList({ project_id: projectId });
    },
    enabled: projectId !== '',
    staleTime: 10 * 60 * 1000,
    gcTime: 10 * 60 * 1000,
    refetchOnMount: false,
    refetchOnWindowFocus: false,
    refetchOnReconnect: false,
    retry: 0,
  });

  if (error) {
    console.error('Query Error:', error);
  }

  return { response, error, isFetching, refetch, isLoading };
};
