import { useMutation, useQueryClient } from '@tanstack/react-query';
import { AxiosError } from 'axios';

import { fetchModifyEvidenceItem, EVIDENCE_ADMIN_QUERY_KEY } from '@/apis';
import { useModifyAdminEvidenceSchema } from '@/apis/schema';
import { TModifyEvidenceItemInput, TModifyEvidenceItemOutput, TMutationOutput } from '@/apis/type';
import { mutationKeyMaker } from '@/components/utils';

type TUseModifyEvidenceMemoOutput = {
  isPending: boolean;
  onModifyAdminEvidence: (data: TModifyEvidenceItemInput) => Promise<TMutationOutput | undefined>;
};

/**
 *수정: modify [react-query mutation]
 * @returns {TUseCreateEvidenceMemoOutput} 메모 등록 결과
 */
export const useModifyAdminEvidence = (): TUseModifyEvidenceMemoOutput => {
  // - useQueryClient 모음
  const queryClient = useQueryClient();

  // - useMutation 모음
  const { mutateAsync, isPending } = useMutation<TModifyEvidenceItemOutput, AxiosError, TModifyEvidenceItemInput>({
    mutationKey: mutationKeyMaker({
      mutationKeyName: EVIDENCE_ADMIN_QUERY_KEY.MODIFY_EVIDENCE_ITEM,
      status: 'U',
    }),
    mutationFn: fetchModifyEvidenceItem,
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
  const onModifyAdminEvidence = async (input: TModifyEvidenceItemInput): Promise<TMutationOutput | undefined> => {
    const parsedInput = useModifyAdminEvidenceSchema.safeParse(input);

    // 유효성 검사 실패 처리
    if (!parsedInput.success) {
      return {
        isSuccess: false,
        message: '유효성 검사 실패. 입력 데이터를 확인해주세요.',
      };
    }

    try {
      const response = await mutateAsync({
        ...parsedInput.data,
        evidence_title: parsedInput.data.evidence_title || '',
        evidence_number: parsedInput.data.evidence_number || 0,
        start_page: parsedInput.data.start_page || 0,
        end_page: parsedInput.data.end_page || 0,
        name: parsedInput.data.name || '',
        reference: parsedInput.data.reference || '',
        page_count: parsedInput.data.page_count || 0,
        category: parsedInput.data.category || '',
      });
      // 성공 여부 체크
      if (response?.success) {
        return {
          isSuccess: true,
          message: response.message || '메모 수정에 성공했습니다.',
        };
      }

      // 실패 시 에러 반환
      return {
        isSuccess: false,
        message: response?.message || '메모 수정에 실패했습니다.',
      };
    } catch (error: any) {
      return {
        isSuccess: false,
        message: error.message || '서버 오류가 발생했습니다.',
      };
    }
  };
  return { isPending, onModifyAdminEvidence };
};
