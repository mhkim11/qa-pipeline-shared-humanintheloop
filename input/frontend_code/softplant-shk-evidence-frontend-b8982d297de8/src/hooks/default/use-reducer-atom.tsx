import { useCallback } from 'react';

import { useAtom } from 'jotai';

// eslint-disable-next-line
import type { PrimitiveAtom } from 'jotai';

/**
 * * useReducerAtom
 * @template TValue - 상태 타입
 * @template TAction - 액션 타입
 * @param {PrimitiveAtom<TValue>} anAtom - 원자
 * @param {(v: TValue, a: TAction) => TValue} reducer - 리듀서
 * @returns {[TValue, (action: TAction) => void]} 상태와 디스패치 함수
 */
export function useReducerAtom<TValue, TAction>(
  anAtom: PrimitiveAtom<TValue>,
  reducer: (v: TValue, a: TAction) => TValue,
): [TValue, (action: TAction) => void] {
  const [state, setState] = useAtom(anAtom);
  const dispatch = useCallback((action: TAction) => setState((prev) => reducer(prev, action)), [setState, reducer]);
  return [state, dispatch] as const;
}
