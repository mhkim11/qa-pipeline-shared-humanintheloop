import { useCallback } from 'react';

import { useMutation } from '@tanstack/react-query';

import { fetchGetRequestListClient } from '@/apis/case-api/request-api';
import type { TRequestListClientOutput } from '@/apis/type/case-type/request-type';

import type { AxiosError } from 'axios';

type TUseGetRequestListClientInput = {
  civil_case_id: string;
  page: number;
  limit: number;
};

type TUseGetRequestListClientOutput = {
  isPending: boolean;
  onGetRequestListClient: (input: TUseGetRequestListClientInput) => Promise<TRequestListClientOutput | undefined>;
};

export const useGetRequestListClient = (): TUseGetRequestListClientOutput => {
  const { mutateAsync, isPending } = useMutation<TRequestListClientOutput, AxiosError, TUseGetRequestListClientInput>({
    mutationFn: ({ civil_case_id, page, limit }) => fetchGetRequestListClient(civil_case_id, page, limit),
  });

  const onGetRequestListClient = useCallback(
    async (input: TUseGetRequestListClientInput): Promise<TRequestListClientOutput | undefined> => {
      try {
        const civilCaseId = String(input?.civil_case_id ?? '').trim();
        const page = Math.max(1, Math.floor(Number(input?.page ?? 1)));
        const limit = Math.max(1, Math.floor(Number(input?.limit ?? 20)));
        if (!civilCaseId) return undefined;
        return await mutateAsync({ civil_case_id: civilCaseId, page, limit });
      } catch (error: any) {
        console.error('비회원 자료 요청 목록 조회 실패:', error?.message);
        return undefined;
      }
    },
    [mutateAsync],
  );

  return { isPending, onGetRequestListClient };
};
