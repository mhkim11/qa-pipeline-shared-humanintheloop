import type { TIsCollapsedReducer } from '@/reducers/type';

/**
 * * 컬드 슬라이드 reducer
 * @param {boolean} prev - 이전 상태
 * @param {TIsCollapsedReducer} action - 액션
 * @returns {boolean} 이전 상태
 */
export const collapsedReducer = (prev: boolean, action: TIsCollapsedReducer): boolean => {
  const actionTypeMap: Record<TIsCollapsedReducer['type'], boolean> = {
    open: true,
    close: false,
  };

  return actionTypeMap[action.type] ?? prev;
};
