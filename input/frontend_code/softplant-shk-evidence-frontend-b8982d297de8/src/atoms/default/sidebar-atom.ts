import { atomWithReducer } from 'jotai/utils';

import { collapsedReducer } from '@/reducers';

// - sidebar-atom atom type
type TSidebarAtom = 'isCollapsedAtom';

// ! 디버그 라벨 키
const DEBUG_LABEL_KEY: Record<TSidebarAtom, TSidebarAtom> = {
  isCollapsedAtom: 'isCollapsedAtom',
};

// ! atom 모음
/**
 * * 컬드 슬라이드 atom
 * @description 컬드 슬라이드 atom 입니다.
 * @see {@link DEBUG_LABEL_KEY.isCollapsedAtom}
 */
export const isCollapsedAtom = atomWithReducer(true, collapsedReducer);
// - [collapsedAtom] 디버그 라벨 키
isCollapsedAtom.debugLabel = DEBUG_LABEL_KEY.isCollapsedAtom;
