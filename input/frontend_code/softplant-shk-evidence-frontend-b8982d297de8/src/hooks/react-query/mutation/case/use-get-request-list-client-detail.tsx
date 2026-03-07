import { useCallback } from 'react';

import { useMutation } from '@tanstack/react-query';

import { fetchGetRequestListClientDetail } from '@/apis/case-api/request-api';
import type { TRequestListClientDetailOutput } from '@/apis/type/case-type/request-type';

import type { AxiosError } from 'axios';

type TUseGetRequestListClientDetailInput = {
  request_id: string;
  client_email: string;
};

type TUseGetRequestListClientDetailOutput = {
  isPending: boolean;
  onGetRequestListClientDetail: (input: TUseGetRequestListClientDetailInput) => Promise<TRequestListClientDetailOutput | undefined>;
};

export const useGetRequestListClientDetail = (): TUseGetRequestListClientDetailOutput => {
  const { mutateAsync, isPending } = useMutation<TRequestListClientDetailOutput, AxiosError, TUseGetRequestListClientDetailInput>({
    mutationFn: ({ request_id, client_email }) => fetchGetRequestListClientDetail(request_id, client_email),
  });

  const onGetRequestListClientDetail = useCallback(
    async (input: TUseGetRequestListClientDetailInput): Promise<TRequestListClientDetailOutput | undefined> => {
      try {
        const requestId = String(input?.request_id ?? '').trim();
        const email = String(input?.client_email ?? '').trim();
        if (!requestId || !email) return undefined;
        return await mutateAsync({ request_id: requestId, client_email: email });
      } catch (error: any) {
        console.error('비회원 자료 요청 상세 조회 실패:', error?.message);
        return undefined;
      }
    },
    [mutateAsync],
  );

  return { isPending, onGetRequestListClientDetail };
};
