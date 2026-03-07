import { isFunction } from 'lodash-es';

import { TOpenDialogActionType, TOpenDialogPayload, TOpenDialogType } from '@/reducers/type';

/**
 * * 다이얼로그 오픈 리듀서
 * @param {TOpenDialogPayload} state 오픈 상태
 * @param {TOpenDialogActionType} action 오픈 리듀서 액션
 * @returns {TOpenDialogPayload} 오픈 상태
 */
export const openDialogReducer = (state: TOpenDialogPayload, action: TOpenDialogActionType): TOpenDialogPayload => {
  const actionTypeMap: Record<TOpenDialogType, () => TOpenDialogPayload> = {
    OPEN: () => [...state, ...((action?.payload && action?.payload) ?? [])],
    CLOSE: () => state.slice(0, state.length - 1),
  };

  return isFunction(actionTypeMap[action.type]) ? actionTypeMap[action.type]() : state;
};
