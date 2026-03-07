import { useMutation, useQueryClient } from '@tanstack/react-query';
import { AxiosError } from 'axios';

import { fetchUpdateMemo } from '@/apis/case-api/civil-case-api';
import type { TCivilCaseDocumentMemoUpdateInput, TCivilCaseDocumentMemoUpdateOutput } from '@/apis/type/case-type/civil-case.type';

type TUseUpdateCivilCaseDocumentMemoOutput = {
  isPending: boolean;
  onUpdateCivilCaseDocumentMemo: (data: TCivilCaseDocumentMemoUpdateInput) => Promise<TCivilCaseDocumentMemoUpdateOutput | undefined>;
};

export const useUpdateCivilCaseDocumentMemo = (): TUseUpdateCivilCaseDocumentMemoOutput => {
  const queryClient = useQueryClient();

  const { mutateAsync, isPending } = useMutation<TCivilCaseDocumentMemoUpdateOutput, AxiosError, TCivilCaseDocumentMemoUpdateInput>({
    mutationFn: fetchUpdateMemo,
    onSuccess: async (_data, _variables) => {
      // note_count 변화가 있을 수 있으므로 전체 civil-doc list를 갱신
      await queryClient.refetchQueries({
        predicate: (q) => Array.isArray(q.queryKey) && q.queryKey[0] === 'civil-case' && q.queryKey[1] === 'case-documents',
      });
    },
  });

  const onUpdateCivilCaseDocumentMemo = async (
    input: TCivilCaseDocumentMemoUpdateInput,
  ): Promise<TCivilCaseDocumentMemoUpdateOutput | undefined> => {
    try {
      return await mutateAsync(input);
    } catch (error: any) {
      console.error('민사 문서 메모 수정 실패:', error?.message);
      return undefined;
    }
  };

  return { isPending, onUpdateCivilCaseDocumentMemo };
};
