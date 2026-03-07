import { useMutation, useQueryClient } from '@tanstack/react-query';
import { AxiosError } from 'axios';

import { fetchDragAndDropEvidence, EVIDENCE_QUERY_KEY } from '@/apis';
import { TDragAndDropEvidenceInput, TDragAndDropEvidenceOutput } from '@/apis/type';
import { mutationKeyMaker } from '@/components/utils';

type TUseDragAndDropEvidenceOutput = {
  isPending: boolean;
  onDragAndDropEvidence: (data: TDragAndDropEvidenceInput) => Promise<TDragAndDropEvidenceOutput>;
};

export const useDragAndDropEvidence = (): TUseDragAndDropEvidenceOutput => {
  const queryClient = useQueryClient();

  const { mutateAsync, isPending } = useMutation<TDragAndDropEvidenceOutput, AxiosError, TDragAndDropEvidenceInput>({
    mutationKey: mutationKeyMaker({
      mutationKeyName: EVIDENCE_QUERY_KEY.DRAG_AND_DROP_EVIDENCE,
      status: 'I',
    }),
    mutationFn: fetchDragAndDropEvidence,
    onSuccess: async (data) => {
      if (data?.success) {
        await queryClient.invalidateQueries({
          predicate: (query) => query.queryKey.includes(EVIDENCE_QUERY_KEY.DRAG_AND_DROP_EVIDENCE),
        });
      }
    },
  });

  const onDragAndDropEvidence = async (data: TDragAndDropEvidenceInput): Promise<TDragAndDropEvidenceOutput> => {
    try {
      const response = await mutateAsync(data);

      if (response?.success) {
        return {
          success: true,
          message: response.message || '순서 변경에 성공했습니다.',
        };
      }

      return {
        success: false,
        message: response.message || '순서 변경에 실패했습니다.',
      };
    } catch (error) {
      const axiosError = error as AxiosError;

      return {
        success: false,
        message: axiosError.message || '알 수 없는 오류가 발생했습니다.',
      };
    }
  };

  return { isPending, onDragAndDropEvidence };
};
