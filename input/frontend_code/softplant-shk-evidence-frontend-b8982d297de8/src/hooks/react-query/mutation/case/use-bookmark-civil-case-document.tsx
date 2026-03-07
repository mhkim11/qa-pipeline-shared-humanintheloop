import { useMutation, useQueryClient } from '@tanstack/react-query';
import { AxiosError } from 'axios';

import { fetchBookmarkDocument } from '@/apis/case-api/civil-case-api';
import type { TCivilCaseDocumentBookmarkAddInput, TCivilCaseDocumentBookmarkAddOutput } from '@/apis/type/case-type/civil-case.type';

type TUseBookmarkCivilCaseDocumentOutput = {
  isPending: boolean;
  onBookmarkCivilCaseDocument: (data: TCivilCaseDocumentBookmarkAddInput) => Promise<TCivilCaseDocumentBookmarkAddOutput | undefined>;
};

export const useBookmarkCivilCaseDocument = (): TUseBookmarkCivilCaseDocumentOutput => {
  const queryClient = useQueryClient();

  const { mutateAsync, isPending } = useMutation<TCivilCaseDocumentBookmarkAddOutput, AxiosError, TCivilCaseDocumentBookmarkAddInput>({
    mutationFn: fetchBookmarkDocument,
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

  const onBookmarkCivilCaseDocument = async (
    input: TCivilCaseDocumentBookmarkAddInput,
  ): Promise<TCivilCaseDocumentBookmarkAddOutput | undefined> => {
    try {
      return await mutateAsync(input);
    } catch (error: any) {
      console.error('민사 문서 북마크 실패:', error?.message);
      return undefined;
    }
  };

  return { isPending, onBookmarkCivilCaseDocument };
};
