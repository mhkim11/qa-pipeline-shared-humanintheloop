import { useMutation, useQueryClient } from '@tanstack/react-query';
import { AxiosError } from 'axios';

import { fetchAddMemo } from '@/apis/case-api/civil-case-api';
import type { TCivilCaseDocumentMemoAddInput, TCivilCaseDocumentMemoAddOutput } from '@/apis/type/case-type/civil-case.type';

type TUseAddCivilCaseDocumentMemoOutput = {
  isPending: boolean;
  onAddCivilCaseDocumentMemo: (data: TCivilCaseDocumentMemoAddInput) => Promise<TCivilCaseDocumentMemoAddOutput | undefined>;
};

export const useAddCivilCaseDocumentMemo = (): TUseAddCivilCaseDocumentMemoOutput => {
  const queryClient = useQueryClient();

  const { mutateAsync, isPending } = useMutation<TCivilCaseDocumentMemoAddOutput, AxiosError, TCivilCaseDocumentMemoAddInput>({
    mutationFn: fetchAddMemo,
    onSuccess: async (_data, variables) => {
      // 메모 변경 후 문서 목록을 다시 가져온다. (note_count 갱신)
      await queryClient.refetchQueries({
        predicate: (q) =>
          Array.isArray(q.queryKey) &&
          q.queryKey[0] === 'civil-case' &&
          q.queryKey[1] === 'case-documents' &&
          q.queryKey[2] === variables.civil_case_id,
      });
    },
  });

  const onAddCivilCaseDocumentMemo = async (
    input: TCivilCaseDocumentMemoAddInput,
  ): Promise<TCivilCaseDocumentMemoAddOutput | undefined> => {
    try {
      return await mutateAsync(input);
    } catch (error: any) {
      console.error('민사 문서 메모 추가 실패:', error?.message);
      return undefined;
    }
  };

  return { isPending, onAddCivilCaseDocumentMemo };
};
