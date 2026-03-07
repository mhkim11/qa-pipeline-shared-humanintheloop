import { atom } from 'jotai';

/**
 * 로딩 토스트 설정 타입
 */
export type TLoadingToast = {
  id: string;
  message: string;
};

/**
 * 로딩 토스트 스토어 상태 타입
 */
export type TLoadingToastStoreState = {
  toasts: TLoadingToast[];
};

// - loading-toast-atom atom type
type TLoadingToastAtom = 'loadingToastAtom';

// ! 디버그 라벨 키
const DEBUG_LABEL_KEY: Record<TLoadingToastAtom, TLoadingToastAtom> = {
  loadingToastAtom: 'loadingToastAtom',
};

/**
 * * 로딩 토스트 atom
 * @description 로딩 토스트 상태를 관리하는 atom 입니다.
 * @see {@link DEBUG_LABEL_KEY.loadingToastAtom}
 */
export const loadingToastAtom = atom<TLoadingToastStoreState>({
  toasts: [],
});
// - [loadingToastAtom] 디버그 라벨 키
loadingToastAtom.debugLabel = DEBUG_LABEL_KEY.loadingToastAtom;
