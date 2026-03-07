import { useMutation } from '@tanstack/react-query';
import { AxiosError } from 'axios';

import { fetchCreateRequestDraft } from '@/apis/case-api/request-api';
import type { TRequestDraftCreateInput, TRequestDraftCreateOutput } from '@/apis/type/case-type/request-type';

type TUseCreateRequestDraftOutput = {
  isPending: boolean;
  onCreateRequestDraft: (data: TRequestDraftCreateInput) => Promise<TRequestDraftCreateOutput | undefined>;
};

export const useCreateRequestDraft = (): TUseCreateRequestDraftOutput => {
  const { mutateAsync, isPending } = useMutation<TRequestDraftCreateOutput, AxiosError, TRequestDraftCreateInput>({
    mutationFn: fetchCreateRequestDraft,
  });

  const onCreateRequestDraft = async (input: TRequestDraftCreateInput): Promise<TRequestDraftCreateOutput | undefined> => {
    try {
      return await mutateAsync(input);
    } catch (error: any) {
      console.error('임시저장 요청 생성 실패:', error?.message);
      return undefined;
    }
  };

  return { isPending, onCreateRequestDraft };
};
