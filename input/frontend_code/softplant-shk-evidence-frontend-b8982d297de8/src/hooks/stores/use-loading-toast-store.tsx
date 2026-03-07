import { useCallback, useRef } from 'react';

import { useAtom } from 'jotai';

import { loadingToastAtom } from '@atoms/default';

type TUseLoadingToastStore = {
  toasts: { id: string; message: string }[];
  showLoading: (message: string) => string;
  hideLoading: (id: string) => void;
  hideAllLoading: () => void;
};

/**
 * * 로딩 토스트 관련 store hook
 * @returns {TUseLoadingToastStore} 로딩 토스트 관련 store hook
 */
export const useLoadingToastStore = (): TUseLoadingToastStore => {
  const [state, setState] = useAtom(loadingToastAtom);
  const idRef = useRef('');

  const showLoading = useCallback(
    (message: string) => {
      const id = Math.random().toString(36).substring(2, 11);
      idRef.current = id;

      setState((prev) => ({
        toasts: [...prev.toasts, { id, message }],
      }));

      return id;
    },
    [setState],
  );

  const hideLoading = useCallback(
    (id: string) => {
      setState((prev) => ({
        toasts: prev.toasts.filter((toast) => toast.id !== id),
      }));
    },
    [setState],
  );

  const hideAllLoading = useCallback(() => {
    setState({ toasts: [] });
  }, [setState]);

  return { toasts: state.toasts, showLoading, hideLoading, hideAllLoading };
};
