import { useMutation, useQueryClient } from '@tanstack/react-query';

import {
  fetchUpdateDocumentFileName,
  type TCivilCaseDocumentUpdateFileNameInput,
  type TCivilCaseDocumentUpdateFileNameOutput,
} from '@/apis/case-api/civil-case-api';

import type { AxiosError } from 'axios';

type TUseUpdateCivilCaseDocumentFileNameOutput = {
  isPending: boolean;
  onUpdateCivilCaseDocumentFileName: (
    input: TCivilCaseDocumentUpdateFileNameInput,
  ) => Promise<TCivilCaseDocumentUpdateFileNameOutput | undefined>;
};

export const useUpdateCivilCaseDocumentFileName = (): TUseUpdateCivilCaseDocumentFileNameOutput => {
  const queryClient = useQueryClient();

  const { mutateAsync, isPending } = useMutation<TCivilCaseDocumentUpdateFileNameOutput, AxiosError, TCivilCaseDocumentUpdateFileNameInput>(
    {
      mutationFn: fetchUpdateDocumentFileName,
      onSuccess: async () => {
        // refresh all civil-case document lists (client/lawyer)
        await queryClient.invalidateQueries({
          predicate: (q) => Array.isArray(q.queryKey) && q.queryKey[0] === 'civil-case' && q.queryKey[1] === 'case-documents',
        });
      },
    },
  );

  const onUpdateCivilCaseDocumentFileName = async (
    input: TCivilCaseDocumentUpdateFileNameInput,
  ): Promise<TCivilCaseDocumentUpdateFileNameOutput | undefined> => {
    try {
      return await mutateAsync(input);
    } catch (error: any) {
      console.error('파일명 변경 실패:', error?.message);
      return undefined;
    }
  };

  return { isPending, onUpdateCivilCaseDocumentFileName };
};
