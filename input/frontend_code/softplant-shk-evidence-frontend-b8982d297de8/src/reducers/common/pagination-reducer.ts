import { TPaginationReducer } from '@/reducers';

export const paginationReducer = (prev: number, action: TPaginationReducer): number => {
  const actionTypeMap: Record<TPaginationReducer['type'], number> = {
    INCREMENT: prev + 1,
    DECREMENT: prev - 1,
    SET: (action?.payload ?? 1) < 1 ? 1 : (action?.payload ?? 1),
    RESET: 1,
  };

  return actionTypeMap[action.type];
};
