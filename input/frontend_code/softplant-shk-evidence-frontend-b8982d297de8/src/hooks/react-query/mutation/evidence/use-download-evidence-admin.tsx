import { useMutation, useQueryClient } from '@tanstack/react-query';
import { AxiosError } from 'axios';

import { fetchDownloadOriginalFile, EVIDENCE_ADMIN_QUERY_KEY } from '@/apis';
import { TEvidenceOriginalDownloadInput, TEvidenceOriginalDownloadOutput } from '@/apis/type';
import { mutationKeyMaker } from '@/components/utils';

type TUseProcessJoinRequestOutput = {
  isPending: boolean;
  onDownloadOriginalFile: (data: TEvidenceOriginalDownloadInput) => Promise<TEvidenceOriginalDownloadOutput>;
};

export const useDownloadOriginalFile = (): TUseProcessJoinRequestOutput => {
  const queryClient = useQueryClient();

  const { mutateAsync, isPending } = useMutation<TEvidenceOriginalDownloadOutput, AxiosError, TEvidenceOriginalDownloadInput>({
    mutationKey: mutationKeyMaker({
      mutationKeyName: EVIDENCE_ADMIN_QUERY_KEY.DOWNLOAD_ORIGINAL_FILE,
      status: 'I',
    }),
    mutationFn: fetchDownloadOriginalFile,
    onSuccess: async (data) => {
      // 성공 시, 쿼리 무효화 조건 추가
      if (data?.success) {
        await queryClient.invalidateQueries({
          predicate: (query) => query.queryKey.includes(EVIDENCE_ADMIN_QUERY_KEY.DOWNLOAD_ORIGINAL_FILE),
        });
      }
    },
  });

  const onDownloadOriginalFile = async (data: TEvidenceOriginalDownloadInput): Promise<TEvidenceOriginalDownloadOutput> => {
    try {
      const response = await mutateAsync(data);

      // 성공 여부 반환
      if (response?.success) {
        return {
          success: true,
          message: response.message || '파일 다운로드에 성공했습니다.',
          data: response.data || [
            {
              file_id: '',
              file_nm: '기본 파일명',
              url: '',
            },
          ], // 최소 1개의 데이터 포함
        };
      }

      // 실패 시 더미 데이터 반환
      return {
        success: false,
        message: response.message || '파일 다운로드에 실패했습니다.',
        data: [
          {
            file_id: '',
            file_nm: '다운로드 실패',
            url: '',
          },
        ],
      };
    } catch (error) {
      // AxiosError로 타입 가드 추가
      const axiosError = error as AxiosError;

      return {
        success: false,
        message: axiosError.message || '알 수 없는 오류가 발생했습니다.',
        data: [
          {
            file_id: '',
            file_nm: '다운로드 실패',
            url: '',
          },
        ],
      };
    }
  };

  return { isPending, onDownloadOriginalFile };
};
