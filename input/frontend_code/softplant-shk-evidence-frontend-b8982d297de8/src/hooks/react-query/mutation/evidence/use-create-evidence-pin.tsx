import { useMutation, useQueryClient } from '@tanstack/react-query';
import { AxiosError } from 'axios';

import { fetchCreateEvidencePin, EVIDENCE_QUERY_KEY } from '@/apis';
import { useCreateEvidencePinSchema } from '@/apis/schema';
import { TToggleEvidencePinInput, TToggleEvidencePinOutput, TMutationOutput } from '@/apis/type';
import { mutationKeyMaker } from '@/components/utils';

type TUseCreateEvidencePinOutput = {
  isPending: boolean;
  onCreateEvidencePin: (data: TToggleEvidencePinInput) => Promise<TMutationOutput | undefined>;
};

/**
 * * 증거 핀 등록 : create [react-query mutation]
 * @returns {TUseCreateEvidencePinOutput} 증거 핀 등록 결과
 */
export const useCreateEvidencePin = (): TUseCreateEvidencePinOutput => {
  const queryClient = useQueryClient();

  const { mutateAsync, isPending } = useMutation<TToggleEvidencePinOutput, AxiosError, TToggleEvidencePinInput>({
    mutationKey: mutationKeyMaker({
      mutationKeyName: EVIDENCE_QUERY_KEY.CREATE_EVIDENCE_PIN,
      status: 'I',
    }),
    mutationFn: fetchCreateEvidencePin,
    onSuccess: async (_response) => {
      await queryClient.invalidateQueries({
        predicate: (query) => {
          return query.queryKey.includes(EVIDENCE_QUERY_KEY.CREATE_EVIDENCE_PIN);
        },
      });
    },
  });

  /**
   * * 증거 핀 등록 함수
   * @param {TToggleEvidencePinInput} input 증거 핀 등록 입력 데이터
   * @returns {Promise<TMutationOutput | undefined>} 증거 핀 등록 결과
   */
  const onCreateEvidencePin = async (input: TToggleEvidencePinInput): Promise<TMutationOutput | undefined> => {
    const parsedInput = useCreateEvidencePinSchema.safeParse(input);

    if (!parsedInput.success) {
      return {
        isSuccess: false,
        message: '유효성 검사에 실패했습니다. 입력한 데이터를 다시 확인해주세요.',
      };
    }

    try {
      const parsedData = {
        project_id: parsedInput.data.project_id,
        evidence_id: parsedInput.data.evidence_id,
      };

      const response = await mutateAsync(parsedData);

      if (!response || !response.success) {
        throw new Error(response?.message || '증거 핀 등록에 실패했습니다.');
      }

      return { isSuccess: true, message: response?.message || '증거 핀 등록에 성공했습니다.' };
    } catch (error: any) {
      return { isSuccess: false, message: error.message };
    }
  };

  return { isPending, onCreateEvidencePin };
};
