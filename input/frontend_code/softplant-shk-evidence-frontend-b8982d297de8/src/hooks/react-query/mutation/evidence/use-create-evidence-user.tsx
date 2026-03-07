import { useMutation, useQueryClient } from '@tanstack/react-query';
import { AxiosError } from 'axios';

import { fetchCreateEvidenceUser, EVIDENCE_QUERY_KEY } from '@/apis';
import { JoinUserSchema } from '@/apis/schema';
import { TCreateEvidenceUserInput, TCreateEvidenceUserOutput, TMutationOutput } from '@/apis/type';
import { mutationKeyMaker } from '@/components/utils';

type TUseCreateEvidenceUserOutput = {
  isPending: boolean;
  onCreateEvidenceUser: (data: TCreateEvidenceUserInput) => Promise<TMutationOutput | undefined>;
};

/**
 * *회원가입 등록 : create [react-query mutation]
 * @returns {} 메모 등록 결과
 */
export const useCreateEvidenceUser = (): TUseCreateEvidenceUserOutput => {
  // - useQueryClient 모음
  const queryClient = useQueryClient();

  // - useMutation 모음
  const { mutateAsync, isPending } = useMutation<TCreateEvidenceUserOutput, AxiosError, TCreateEvidenceUserInput>({
    mutationKey: mutationKeyMaker({
      mutationKeyName: EVIDENCE_QUERY_KEY.CREATE_EVIDENCE_USER,
      status: 'I',
    }),
    mutationFn: fetchCreateEvidenceUser,
    onSuccess: async (_response) => {
      await queryClient.invalidateQueries({
        predicate: (query) => {
          return query.queryKey.includes(EVIDENCE_QUERY_KEY.CREATE_EVIDENCE_USER);
        },
      });
    },
  });

  /**
   * * 회원가입 함수
   * @param {TCreateEvidenceMemoInput} input 메모 등록 입력 데이터
   * @returns {Promise<TMutationOutput | undefined>} 메모 등록 결과
   */
  const onCreateEvidenceUser = async (input: TCreateEvidenceUserInput): Promise<TMutationOutput | undefined> => {
    const parsedInput = JoinUserSchema.safeParse(input);
    console.log('parsedInput', parsedInput);
    // 유효성 검사를 통과하지 못한 경우 오류를 처리합니다.
    if (!parsedInput.success) {
      return {
        isSuccess: false,
        message: '유효성 검사에 실패했습니다. 입력한 데이터를 다시 확인해주세요.',
      };
    }
    console.log('parsedInput', parsedInput);
    console.log('parsedInput.data', parsedInput.data);

    try {
      const parsedData = {
        email: parsedInput.data.email,
        password: parsedInput.data.password,
        name: parsedInput.data.name || '',
        phone: parsedInput.data.phone || '',
        office_nm: parsedInput.data.office_nm || '',
        marketing_agree: parsedInput.data.marketing_agree || false,
        birthdate: parsedInput.data.birthdate || '',
        gender: parsedInput.data.gender || '',
        // NOTE: JoinUserSchema에 필드가 추가되더라도, re-export/ts cache로 인해 parsedInput.data 타입이 늦게 반영될 수 있어
        // input에서 직접 읽어 payload에 포함시킨다. (런타임/백엔드 전송은 이 값이 우선)
        registration_source: input.registration_source || '',
        registration_source_other: input.registration_source_other || '',
      };

      const response = await mutateAsync(parsedData);

      if (!response || !response.success) {
        throw new Error(response?.message || '회원가입에 성공했습니다.');
      }

      return { isSuccess: true, message: response?.message || '회원가입에 성공했습니다.' };
    } catch (error: any) {
      return { isSuccess: false, message: error.message };
    }
  };
  return { isPending, onCreateEvidenceUser };
};
