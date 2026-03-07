import { useAtom } from 'jotai';

import { isCollapsedAtom } from '@atoms/default';
import { TIsCollapsedReducer } from '@/reducers';

type TUseSidebarStore = {
  isCollapsed: boolean;
  dispatchIsCollapsed: (action: TIsCollapsedReducer) => void;
};

/**
 * * 사이드 바 관련 store hook
 * @returns {TUseSidebarStore} 사이드 바 관련 store hook
 */
export const useSidebarStore = (): TUseSidebarStore => {
  const [isCollapsed, dispatchIsCollapsed] = useAtom(isCollapsedAtom);

  return { isCollapsed, dispatchIsCollapsed };
};
