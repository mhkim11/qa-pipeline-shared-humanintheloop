import { useAtom } from 'jotai';

import { authErrorAtom } from '@atoms/default';
import { TAuthErrorReducer } from '@/reducers';

type TUseMainStore = {
  authError: TAuthErrorReducer['type'];
  dispatchAuthError: ({ type }: TAuthErrorReducer) => void;
};

/**
 * * 메인 스토어 hook
 * @returns {TUseMainStore} 메인 스토어 hook output
 */
export const useMainStore = (): TUseMainStore => {
  const [authError, dispatchAuthError] = useAtom(authErrorAtom);

  return {
    authError,
    dispatchAuthError,
  };
};
