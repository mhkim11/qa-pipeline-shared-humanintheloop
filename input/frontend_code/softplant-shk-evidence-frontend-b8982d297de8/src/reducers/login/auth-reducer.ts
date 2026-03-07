// ! reducer 모음

import { initialLoginAtom, TLogin } from '@/atoms/default';
import type { TAuthErrorReducer, TLoginReducer } from '@/reducers/type';
// TLogin 타입에 isFetching, error 추가
export type TLoginWithStatus = TLogin & {
  isFetching: boolean;
  error: boolean;
};
/**
 * * 로그인 reducer
 * @param {TLogin} prev - 이전 상태
 * @param {TLoginReducer} action - 액션
 * @returns {TLogin} result - 변경된 상태
 */
export const loginReducer = (prev: TLogin, action: TLoginReducer): TLogin => {
  // LOGOUT 액션 처리 시 React Query 캐시를 초기화하는 작업 추가
  if (action.type === 'LOGOUT') {
    // 로컬 스토리지에서 세션 관련 데이터도 정리
    // 여러 탭에서도 동작하도록 sessionStorage가 아닌 localStorage 이벤트를 통해 처리
    localStorage.setItem('cache-reset', Date.now().toString());

    // 직접적으로 캐시가 초기화되도록 이벤트 발생
    window.dispatchEvent(new Event('storage-reset'));
  }

  const actionTypeMap: Record<TLoginReducer['type'], TLoginWithStatus> = {
    LOGOUT: { ...initialLoginAtom, isFetching: false, error: false },
    FETCHING: { ...prev, isFetching: true, error: false },
    ERROR: { ...prev, error: true, isFetching: false },
    LOGIN: action.payload
      ? { ...action.payload, isFetching: false, error: false }
      : { ...initialLoginAtom, isFetching: false, error: false },
  };

  return actionTypeMap[action.type];
};

/**
 * * 인증 에러 reducer
 * @param {boolean} _prev - 이전 상태
 * @param {TAuthErrorReducer} action - 액션
 * @returns {boolean} result
 */
export const authErrorReducer = (
  _prev: 'AUTH_ERROR' | 'RESET' | 'GLOBAL_ERROR',
  action: TAuthErrorReducer,
): 'AUTH_ERROR' | 'RESET' | 'GLOBAL_ERROR' => {
  const actionTypeMap: Record<TAuthErrorReducer['type'], 'AUTH_ERROR' | 'RESET' | 'GLOBAL_ERROR'> = {
    AUTH_ERROR: 'AUTH_ERROR',
    GLOBAL_ERROR: 'GLOBAL_ERROR',
    RESET: 'RESET',
  };

  return actionTypeMap[action.type];
};
