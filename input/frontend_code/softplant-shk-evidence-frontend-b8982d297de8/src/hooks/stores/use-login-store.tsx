import { useReducerAtom } from '@hooks/default';
import { loginAtom, TLogin } from '@atoms/default';
import { loginReducer, TLoginReducer } from '@/reducers';

type TUseLoginStore = {
  login: TLogin;
  dispatchLogin: (action: TLoginReducer) => void;
};

/**
 * * 로그인 관련 store hook
 * @returns {TUseLoginStore} 로그인 관련 store hook
 */
export const useLoginStore = (): TUseLoginStore => {
  const [login, dispatchLogin] = useReducerAtom(loginAtom, loginReducer);

  return { login, dispatchLogin };
};
