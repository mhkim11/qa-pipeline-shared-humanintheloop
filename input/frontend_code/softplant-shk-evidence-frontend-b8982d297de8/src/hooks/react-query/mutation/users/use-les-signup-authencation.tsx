import { useMutation, useQueryClient } from '@tanstack/react-query';
import { AxiosError } from 'axios';

import { fetchLesSignupAilexAuthentication, USER_QUERY_KEY } from '@/apis';
import { TLesSignupAilexAuthenticationInput, TLesSignupAilexAuthenticationOutput, TMutationOutput } from '@/apis/type';
import { mutationKeyMaker } from '@/components/utils';

type TUseLesSignupAilexAuthenticationOutput = {
  isPending: boolean;
  onLesSignupAilexAuthentication: (data: TLesSignupAilexAuthenticationInput) => Promise<TMutationOutput | undefined>;
};

/**
 * * LES 간편 회원가입 : lesSignupAilexAuthentication [react-query mutation]
 * @returns {TUseLesSignupAilexAuthenticationOutput} LES 간편 회원가입 결과
 */
export const useLesSignupAilexAuthentication = (): TUseLesSignupAilexAuthenticationOutput => {
  // - useQueryClient 모음
  const queryClient = useQueryClient();

  // - useMutation 모음
  const { mutateAsync, isPending } = useMutation<TLesSignupAilexAuthenticationOutput, AxiosError, TLesSignupAilexAuthenticationInput>({
    mutationKey: mutationKeyMaker({
      mutationKeyName: USER_QUERY_KEY.LES_SIGNUP_AILEX_AUTHENTICATION,
      status: 'I',
    }),
    mutationFn: fetchLesSignupAilexAuthentication,
    onSuccess: async (_response) => {
      await queryClient.invalidateQueries({
        predicate: (query) => {
          return query.queryKey.includes(USER_QUERY_KEY.LES_SIGNUP_AILEX_AUTHENTICATION);
        },
      });
    },
  });

  /**
   * * LES 간편 회원가입 함수
   * @param {TLesSignupAilexAuthenticationInput} input LES 간편 회원가입 입력 데이터
   * @returns {Promise<TMutationOutput | undefined>} LES 간편 회원가입 결과
   */
  const onLesSignupAilexAuthentication = async (input: TLesSignupAilexAuthenticationInput): Promise<TMutationOutput | undefined> => {
    try {
      const response = await mutateAsync(input);

      if (!response || !response.success) {
        // 응답이 있지만 success가 false인 경우
        const responseData = response as any; // 타입 단언 (실제 응답에는 errorCode가 있을 수 있음)
        const errorCode = responseData?.errorCode || responseData?.error?.code;
        if (errorCode === 'EMAIL_ALREADY_EXISTS') {
          return { isSuccess: false, message: '동일한 이메일의 가입내역이 존재합니다.' };
        }
        return { isSuccess: false, message: response?.message || '회원가입에 실패했습니다.' };
      }

      return { isSuccess: true, message: response?.message || '회원가입에 성공했습니다.' };
    } catch (error: any) {
      // Axios 에러 처리
      const errorResponse = error?.response?.data;

      // EMAIL_ALREADY_EXISTS 오류 코드 확인 (여러 경로에서 확인)
      const errorCode = errorResponse?.errorCode || errorResponse?.error?.code || error?.errorCode;

      if (errorCode === 'EMAIL_ALREADY_EXISTS') {
        return { isSuccess: false, message: '동일한 이메일의 가입내역이 존재합니다.' };
      }

      // 에러 메시지 추출
      const errorMessage = errorResponse?.message || error?.message || '회원가입에 실패했습니다.';

      return { isSuccess: false, message: errorMessage };
    }
  };

  return { isPending, onLesSignupAilexAuthentication };
};
