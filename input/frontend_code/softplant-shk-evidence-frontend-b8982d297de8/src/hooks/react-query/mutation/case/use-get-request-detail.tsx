import { useCallback } from 'react';

import { useMutation } from '@tanstack/react-query';

import { fetchGetRequestDetail } from '@/apis/case-api/request-api';
import type { TRequestDetailOutput } from '@/apis/type/case-type/request-type';

import type { AxiosError } from 'axios';

type TUseGetRequestDetailOutput = {
  isPending: boolean;
  onGetRequestDetail: (requestId: string) => Promise<TRequestDetailOutput | undefined>;
};

export const useGetRequestDetail = (): TUseGetRequestDetailOutput => {
  const { mutateAsync, isPending } = useMutation<TRequestDetailOutput, AxiosError, string>({
    mutationFn: (requestId) => fetchGetRequestDetail(requestId),
  });

  const onGetRequestDetail = useCallback(
    async (requestId: string): Promise<TRequestDetailOutput | undefined> => {
      try {
        const id = String(requestId ?? '').trim();
        if (!id) return undefined;
        return await mutateAsync(id);
      } catch (error: any) {
        console.error('자료 요청 상세 조회 실패:', error?.message);
        return undefined;
      }
    },
    [mutateAsync],
  );

  return { isPending, onGetRequestDetail };
};
