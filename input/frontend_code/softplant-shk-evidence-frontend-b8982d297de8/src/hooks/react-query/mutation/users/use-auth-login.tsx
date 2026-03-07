import { useState } from 'react';

import { useQueryClient } from '@tanstack/react-query';

import { fetchLoginUser, USER_QUERY_KEY } from '@/apis';
import { TLoginUserInput, TLoginUserOutput } from '@/apis/type';
import { queryKeyMaker, to } from '@/components/utils';

type TUseLoginUserOutput = {
  isPending: boolean;
  onAuthLogin: (input: TLoginUserInput) => Promise<TLoginUserOutput | undefined>;
};

/**
 * * 로그인 유저 커스텀 훅
 * @returns {TUseLoginUserOutput} 로그인 유저 커스텀 훅 반환
 */
export const useAuthLogin = (): TUseLoginUserOutput => {
  // ! 기본 state
  const [isPending, setIsPending] = useState<boolean>(false);

  // ! react-query 클라이언트
  const queryClient = useQueryClient();

  // ! 로그인 함수
  const onAuthLogin = async (input: TLoginUserInput): Promise<TLoginUserOutput | undefined> => {
    setIsPending(true);

    try {
      const [error, result] = await to(
        queryClient.fetchQuery({
          queryKey: queryKeyMaker({
            queryKeyName: USER_QUERY_KEY.LOGIN_USER,
          }),
          queryFn: () => fetchLoginUser(input),
          retry: 0,
        }),
      );

      if (error) {
        console.error('Login Error:', error);
        return undefined;
      }

      return result;
    } catch (err) {
      console.error('Unexpected Error:', err);
      return undefined;
    } finally {
      setIsPending(false);
    }
  };

  return { onAuthLogin, isPending };
};
