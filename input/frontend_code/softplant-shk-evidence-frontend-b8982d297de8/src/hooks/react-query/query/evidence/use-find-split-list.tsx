import { useQuery } from '@tanstack/react-query';
import { AxiosError } from 'axios';

import { fetchSplitOcrEvidence } from '@/apis';
import { TEvidenceSplitOcrInput, TEvidenceSplitOcrOutput } from '@/apis/type';

type TUseSplitOcrEvidenceInput = TEvidenceSplitOcrInput;

type TUseSplitOcrEvidenceOutput = {
  response?: TEvidenceSplitOcrOutput;
  isFetching: boolean;
  isLoading: boolean;
  error: AxiosError | null;
  refetch: () => void;
};

/**
 * * 페이지 분리 및 OCR결과 조회 react-query query hook
 * @param {TUseSplitOcrEvidenceInput} input - API 호출 입력 값
 * @returns {TUseSplitOcrEvidenceOutput} - API 호출 결과
 */
export const useSplitOcrEvidence = ({
  office_id,
  project_id,
  page_no,
  block_cnt,
  file_nm,
}: TUseSplitOcrEvidenceInput): TUseSplitOcrEvidenceOutput => {
  const {
    data: response,
    error,
    isFetching,
    refetch,
    isLoading,
  } = useQuery<TEvidenceSplitOcrOutput, AxiosError>({
    queryKey: ['splitOcrEvidence', { office_id, project_id, page_no, block_cnt, file_nm }],
    queryFn: async () => {
      const result = await fetchSplitOcrEvidence({
        office_id,
        project_id,
        page_no,
        block_cnt,
        file_nm,
      });
      return result;
    },
    enabled: office_id !== '' && project_id !== '',
    retry: 0,
    staleTime: 1000 * 5, // split-files 과도 호출 방지 (5초 캐시)
    gcTime: 1000 * 60 * 10,
    refetchOnMount: false,
    refetchOnWindowFocus: false,
    refetchOnReconnect: false,
  });

  if (error) {
    console.error('Query Error:', error); // 에러 로그 출력
  }

  return { response, error, isFetching, refetch, isLoading };
};
