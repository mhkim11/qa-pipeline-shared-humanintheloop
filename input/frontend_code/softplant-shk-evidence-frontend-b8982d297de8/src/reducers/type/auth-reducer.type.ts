import { TLogin } from '@/atoms/default';

// - 로그인 reducer type
export type TLoginReducer = { type: 'LOGOUT' | 'LOGIN' | 'FETCHING' | 'ERROR'; payload?: TLogin };

// - 인증 에러 reducer type
export type TAuthErrorReducer = { type: 'AUTH_ERROR' | 'GLOBAL_ERROR' | 'RESET' };
