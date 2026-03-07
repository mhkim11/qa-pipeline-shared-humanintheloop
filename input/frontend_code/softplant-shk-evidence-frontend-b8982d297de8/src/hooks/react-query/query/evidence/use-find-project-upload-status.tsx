import { useQuery } from '@tanstack/react-query';
import { AxiosError } from 'axios';

import { EVIDENCE_ADMIN_QUERY_KEY, fetchFindProjectUploadStatus } from '@/apis';
import type { TFindProjectUploadStatusInput, TFindProjectUploadStatusOutput } from '@/apis/type';

type TUseFindProjectUploadStatusOutput = {
  response?: TFindProjectUploadStatusOutput;
  isFetching: boolean;
  isLoading: boolean;
  error: AxiosError | null;
  refetch: () => void;
};

export const useFindProjectUploadStatus = (
  input: Pick<TFindProjectUploadStatusInput, 'office_id' | 'project_id'>,
): TUseFindProjectUploadStatusOutput => {
  const officeId = input.office_id ?? '';
  const projectId = input.project_id ?? '';

  const {
    data: response,
    error,
    isFetching,
    refetch,
    isLoading,
  } = useQuery<TFindProjectUploadStatusOutput, AxiosError>({
    queryKey: [EVIDENCE_ADMIN_QUERY_KEY.FIND_PROJECT_UPLOAD_STATUS, officeId, projectId],
    queryFn: async () => {
      // 최소 호출로 상태만 확인
      return await fetchFindProjectUploadStatus({
        office_id: officeId,
        project_id: projectId,
        page_no: 1,
        block_cnt: 1,
      });
    },
    enabled: officeId !== '' && projectId !== '',
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
