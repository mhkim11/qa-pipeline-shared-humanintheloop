import { cloneDeep, isFunction } from 'lodash-es';

import { TSwitchOnActionType, TSwitchOnPayload, TSwitchOnType } from '@/reducers/type';

/**
 * * 스위치 토글 리듀서
 * @param {TSwitchOnPayload} state 토글 상태
 * @param {TSwitchOnActionType} action 토글 리듀서 액션
 * @returns {TSwitchOnPayload} 토글 상태
 */
export const switchOnReducer = (state: TSwitchOnPayload, action: TSwitchOnActionType): TSwitchOnPayload => {
  const actionTypeMap: Record<TSwitchOnType, () => TSwitchOnPayload> = {
    ON: () => {
      const cloneState = cloneDeep(state);

      Object.keys(cloneState).forEach((key) => {
        cloneState[key] = true;
      });

      return cloneState;
    },
    CLOSE: () => {
      const cloneState = cloneDeep(state);

      Object.keys(cloneState).forEach((key) => {
        cloneState[key] = false;
      });

      return cloneState;
    },

    TOGGLE: () => {
      const cloneState = cloneDeep(state);

      return {
        ...cloneState,
        ...action.payload,
      };
    },
  };

  return isFunction(actionTypeMap[action.type]) ? actionTypeMap[action.type]() : state;
};
