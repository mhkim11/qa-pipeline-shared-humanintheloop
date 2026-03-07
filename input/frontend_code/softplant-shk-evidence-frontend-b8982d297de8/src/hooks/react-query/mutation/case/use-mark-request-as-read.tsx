import { useCallback } from 'react';

import { useMutation, useQueryClient } from '@tanstack/react-query';

import { fetchMarkRequestAsRead } from '@/apis/case-api/request-api';
import type { TRequestDetailOutput } from '@/apis/type/case-type/request-type';

import type { AxiosError } from 'axios';

type TUseMarkRequestAsReadOutput = {
  isPending: boolean;
  onMarkRequestAsRead: (requestId: string) => Promise<TRequestDetailOutput | undefined>;
};

export const useMarkRequestAsRead = (): TUseMarkRequestAsReadOutput => {
  const queryClient = useQueryClient();

  const { mutateAsync, isPending } = useMutation<TRequestDetailOutput, AxiosError, string>({
    mutationFn: (requestId) => fetchMarkRequestAsRead(requestId),
    onSuccess: () => {
      // 읽음 처리 후 요청 목록 갱신
      void queryClient.invalidateQueries({ queryKey: ['evidence-request', 'list'] });
    },
  });

  const onMarkRequestAsRead = useCallback(
    async (requestId: string): Promise<TRequestDetailOutput | undefined> => {
      try {
        const id = String(requestId ?? '').trim();
        if (!id) return undefined;
        return await mutateAsync(id);
      } catch (error: any) {
        console.error('요청 읽음 처리 실패:', error?.message);
        return undefined;
      }
    },
    [mutateAsync],
  );

  return { isPending, onMarkRequestAsRead };
};
