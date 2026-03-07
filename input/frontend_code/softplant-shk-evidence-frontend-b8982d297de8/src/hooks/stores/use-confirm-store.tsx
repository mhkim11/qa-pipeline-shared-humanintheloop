import { useCallback } from 'react';

import { useAtom } from 'jotai';

import { confirmAtom, TConfirmDialogConfig, TConfirmStoreState } from '@atoms/default';

type TUseConfirmStore = TConfirmStoreState & {
  onOpen: (params: Omit<TConfirmDialogConfig, 'id'>) => void;
  onClose: () => void;
};

/**
 * * 컨펌 다이얼로그 관련 store hook
 * @returns {TUseConfirmStore} 컨펌 다이얼로그 관련 store hook
 */
export const useConfirmStore = (): TUseConfirmStore => {
  const [state, setState] = useAtom(confirmAtom);

  const onOpen = useCallback(
    (params: Omit<TConfirmDialogConfig, 'id'>) => {
      const newConfirm: TConfirmDialogConfig = {
        id: Math.random().toString(36).substring(2, 9),
        type: 'default',
        ...params,
      };

      setState((prev) => {
        // 현재 표시 중인 컨펌이 없는 경우
        if (!prev.current) {
          return { isOpen: true, current: newConfirm, queue: [] };
        }

        // 현재 표시 중인 컨펌이 있는 경우 큐에 추가
        return { ...prev, queue: [...prev.queue, newConfirm] };
      });
    },
    [setState],
  );

  const onClose = useCallback(() => {
    setState((prev) => {
      // 큐가 비어있는 경우
      if (prev.queue.length === 0) {
        return { isOpen: false, queue: [], current: null };
      }

      // 큐에 다음 컨펌이 있는 경우
      const [nextConfirm, ...remainingQueue] = prev.queue;
      return { current: nextConfirm, queue: remainingQueue, isOpen: true };
    });
  }, [setState]);

  return { ...state, onOpen, onClose };
};
