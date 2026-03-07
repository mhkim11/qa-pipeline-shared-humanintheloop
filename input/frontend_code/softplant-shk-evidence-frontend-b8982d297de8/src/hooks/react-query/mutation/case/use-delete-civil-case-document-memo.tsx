import { useMutation, useQueryClient } from '@tanstack/react-query';
import { AxiosError } from 'axios';

import { fetchDeleteMemo } from '@/apis/case-api/civil-case-api';
import type { TCivilCaseDocumentMemoDeleteInput, TCivilCaseDocumentMemoDeleteOutput } from '@/apis/type/case-type/civil-case.type';

type TUseDeleteCivilCaseDocumentMemoOutput = {
  isPending: boolean;
  onDeleteCivilCaseDocumentMemo: (input: TCivilCaseDocumentMemoDeleteInput) => Promise<TCivilCaseDocumentMemoDeleteOutput | undefined>;
};

export const useDeleteCivilCaseDocumentMemo = (): TUseDeleteCivilCaseDocumentMemoOutput => {
  const queryClient = useQueryClient();

  const { mutateAsync, isPending } = useMutation<TCivilCaseDocumentMemoDeleteOutput, AxiosError, TCivilCaseDocumentMemoDeleteInput>({
    mutationFn: fetchDeleteMemo,
    onSuccess: async () => {
      await queryClient.refetchQueries({
        predicate: (q) => Array.isArray(q.queryKey) && q.queryKey[0] === 'civil-case' && q.queryKey[1] === 'case-documents',
      });
    },
  });

  const onDeleteCivilCaseDocumentMemo = async (
    input: TCivilCaseDocumentMemoDeleteInput,
  ): Promise<TCivilCaseDocumentMemoDeleteOutput | undefined> => {
    try {
      return await mutateAsync(input);
    } catch (error: any) {
      console.error('민사 문서 메모 삭제 실패:', error?.message);
      return undefined;
    }
  };

  return { isPending, onDeleteCivilCaseDocumentMemo };
};
