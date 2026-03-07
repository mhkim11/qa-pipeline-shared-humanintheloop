import { PrimitiveAtom, createStore } from 'jotai';
import { atomWithReducer, atomWithStorage } from 'jotai/utils';

// import { to } from '@/components/utils';
import { authErrorReducer } from '@/reducers';

// ! 글로벌 스토어
export const globalStore: ReturnType<typeof createStore> = createStore();

// - main-atom atom type
type TMainAtom = 'loginAtom' | 'authErrorAtom';

// - 로그인 atom type
export type TLogin = {
  success: boolean;
  message: string | null;
  data: {
    accessToken: string;
    user: {
      id: string;
      email: string;
      name: string;
      role: string;
      office_id: string;
      office_nm: string;
      phone: string;
    };
  };
  loginTimestamp?: number;
};

// - initial value 모음
export const initialLoginAtom: TLogin = {
  success: false,
  message: null,
  data: {
    accessToken: '',
    user: {
      id: '',
      email: '',
      name: '',
      role: '',
      office_id: '',
      office_nm: '',
      phone: '',
    },
  },
  loginTimestamp: Date.now(),
};

// ! 디버그 라벨 키
const DEBUG_LABEL_KEY: Record<TMainAtom, TMainAtom> = {
  loginAtom: 'loginAtom',
  authErrorAtom: 'authErrorAtom',
};

// ! atom 모음

// -------------------- storage atom 모음 --------------------

/**
 * * 로그인 성공시 사용자 정보를 저장하는 atom
 * @description 로그인 성공시 사용자 정보를 저장하는 atom 입니다.
 * @see {@link DEBUG_LABEL_KEY.loginAtom}
 */
export const loginAtom: PrimitiveAtom<TLogin> = atomWithStorage(
  'evidence-frontend-login',
  JSON.parse(localStorage.getItem('evidence-frontend-login') || JSON.stringify(initialLoginAtom)),
);
// - [loginAtom] 디버그 라벨 키
loginAtom.debugLabel = DEBUG_LABEL_KEY.loginAtom;

// -------------------- reducer atom 모음 --------------------

/**
 * * 인증 에러 여부를 저장하는 atom
 * @description 인증 에러 여부를 저장하는 atom 입니다.
 * @see {@link DEBUG_LABEL_KEY.authErrorAtom}
 */
export const authErrorAtom = atomWithReducer('RESET', authErrorReducer);
// - [isAuthErrorAtom] 디버그 라벨 키
authErrorAtom.debugLabel = DEBUG_LABEL_KEY.authErrorAtom;
