import { useMutation, useQueryClient } from '@tanstack/react-query';
import { AxiosError } from 'axios';

import { fetchDownloadSplitFile, EVIDENCE_ADMIN_QUERY_KEY } from '@/apis';
import { TDownloadSplitFileInput, TDownloadSplitFileOutput } from '@/apis/type';
import { mutationKeyMaker } from '@/components/utils';

type TUseDownloadSplitFileOutput = {
  isPending: boolean;
  onDownloadSplitFile: (data: TDownloadSplitFileInput) => Promise<TDownloadSplitFileOutput>;
};

export const useDownloadSplitFile = (): TUseDownloadSplitFileOutput => {
  const queryClient = useQueryClient();

  const { mutateAsync, isPending } = useMutation<TDownloadSplitFileOutput, AxiosError, TDownloadSplitFileInput>({
    mutationKey: mutationKeyMaker({
      mutationKeyName: EVIDENCE_ADMIN_QUERY_KEY.DOWNLOAD_SPLIT_FILE,
      status: 'I',
    }),
    mutationFn: fetchDownloadSplitFile,
    onSuccess: async (data) => {
      if (data?.success) {
        await queryClient.invalidateQueries({
          predicate: (query) => query.queryKey.includes(EVIDENCE_ADMIN_QUERY_KEY.DOWNLOAD_SPLIT_FILE),
        });
      }
    },
  });

  const onDownloadSplitFile = async (data: TDownloadSplitFileInput): Promise<TDownloadSplitFileOutput> => {
    try {
      const response = await mutateAsync(data);

      if (response?.success) {
        if (response.data?.[0]?.split_file?.url) {
          window.open(response.data[0].split_file.url, '_blank');
        }
        if (response.data?.[0]?.ocr_file?.url) {
          window.open(response.data[0].ocr_file.url, '_blank');
        }
        return {
          success: true,
          message: response.message || '파일 다운로드에 성공했습니다.',
          data: response.data,
        };
      }

      return {
        success: false,
        message: response.message || '파일 다운로드에 실패했습니다.',
        data: response.data,
      };
    } catch (error) {
      const axiosError = error as AxiosError;
      return {
        success: false,
        message: axiosError.message || '알 수 없는 오류가 발생했습니다.',
        data: [{ split_file_id: '', split_file: { url: '', file_nm: '' }, ocr_file: { url: '', file_nm: '' } }],
      };
    }
  };

  return { isPending, onDownloadSplitFile };
};
