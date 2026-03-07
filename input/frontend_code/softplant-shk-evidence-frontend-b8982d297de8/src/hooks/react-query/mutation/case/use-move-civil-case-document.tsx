import { useMutation, useQueryClient } from '@tanstack/react-query';
import { AxiosError } from 'axios';

import { fetchMoveDocument } from '@/apis/case-api/civil-case-api';
import type { TCivilCaseDocumentMoveInput, TCivilCaseDocumentMoveOutput } from '@/apis/type/case-type/civil-case.type';

type TUseMoveCivilCaseDocumentOutput = {
  isPending: boolean;
  onMoveCivilCaseDocument: (data: TCivilCaseDocumentMoveInput) => Promise<TCivilCaseDocumentMoveOutput | undefined>;
};

export const useMoveCivilCaseDocument = (): TUseMoveCivilCaseDocumentOutput => {
  const queryClient = useQueryClient();

  const { mutateAsync, isPending } = useMutation<TCivilCaseDocumentMoveOutput, AxiosError, TCivilCaseDocumentMoveInput>({
    mutationFn: fetchMoveDocument,
    onSuccess: async (_data, variables) => {
      await queryClient.refetchQueries({
        predicate: (q) =>
          Array.isArray(q.queryKey) &&
          q.queryKey[0] === 'civil-case' &&
          q.queryKey[1] === 'case-documents' &&
          q.queryKey[2] === variables.civil_case_id,
      });
    },
  });

  const onMoveCivilCaseDocument = async (input: TCivilCaseDocumentMoveInput): Promise<TCivilCaseDocumentMoveOutput | undefined> => {
    try {
      return await mutateAsync(input);
    } catch (error: any) {
      console.error('민사 문서 이동 실패:', error?.message);
      return undefined;
    }
  };

  return { isPending, onMoveCivilCaseDocument };
};
