import { useMutation, useQueryClient } from '@tanstack/react-query';
import { AxiosError } from 'axios';

import { fetchModifyMatchingItem, EVIDENCE_ADMIN_QUERY_KEY } from '@/apis';
import { useModifyAdminMatchingSchema } from '@/apis/schema';
import { TModifyMatchingItemInput, TModifyMatchingItemOutput, TMutationOutput } from '@/apis/type';
import { mutationKeyMaker } from '@/components/utils';

type TUseModifyMatchingOutput = {
  isPending: boolean;
  onModifyAdminMatching: (data: TModifyMatchingItemInput) => Promise<TMutationOutput | undefined>;
};

/**
 *수정: modify [react-query mutation]
 * @returns {TUseCreateEvidenceMemoOutput} 메모 등록 결과
 */
export const useModifyAdminMatching = (): TUseModifyMatchingOutput => {
  // - useQueryClient 모음
  const queryClient = useQueryClient();

  // - useMutation 모음
  const { mutateAsync, isPending } = useMutation<TModifyMatchingItemOutput, AxiosError, TModifyMatchingItemInput>({
    mutationKey: mutationKeyMaker({
      mutationKeyName: EVIDENCE_ADMIN_QUERY_KEY.MODIFY_EVIDENCE_ITEM,
      status: 'U',
    }),
    mutationFn: fetchModifyMatchingItem,
    onSuccess: async (_response) => {
      await Promise.all([
        queryClient.invalidateQueries({
          predicate: (query) => {
            return query.queryKey.includes(EVIDENCE_ADMIN_QUERY_KEY.MODIFY_EVIDENCE_ITEM);
          },
        }),
        queryClient.invalidateQueries({
          predicate: (query) => {
            return query.queryKey.includes(EVIDENCE_ADMIN_QUERY_KEY.MODIFY_EVIDENCE_ITEM);
          },
        }),
      ]);
    },
  });
  /**
   * * 메모 수정 함수
   * @param {TCreateEvidenceMemoInput} input 메모 등록 입력 데이터
   * @returns {Promise<TMutationOutput | undefined>} 메모 등록 결과
   */
  const onModifyAdminMatching = async (input: TModifyMatchingItemInput): Promise<TMutationOutput | undefined> => {
    console.log('Input received:', input);

    const parsedInput = useModifyAdminMatchingSchema.safeParse(input);

    if (!parsedInput.success) {
      console.log('Validation errors:', parsedInput.error.errors);
      return {
        isSuccess: false,
        message: '유효성 검사 실패. 입력 데이터를 확인해주세요.',
      };
    }

    try {
      const response = await mutateAsync({
        office_id: parsedInput.data.office_id,
        project_id: parsedInput.data.project_id,
        matching_id: parsedInput.data.matching_id,
        pdf_page: String(parsedInput.data.pdf_page),
        pdf_name: parsedInput.data.pdf_name,
        sequence_number: parsedInput.data.sequence_number,
        evidence_page: parsedInput.data.evidence_page,
        evidence_number: String(parsedInput.data.evidence_number),
      });

      if (response?.success) {
        return {
          isSuccess: true,
          message: response.message || '수정에 성공했습니다.',
        };
      }

      return {
        isSuccess: false,
        message: response?.message || '수정에 실패했습니다.',
      };
    } catch (error: any) {
      return {
        isSuccess: false,
        message: error.message || '서버 오류가 발생했습니다.',
      };
    }
  };
  return { isPending, onModifyAdminMatching };
};
