import { useMutation, useQueryClient } from '@tanstack/react-query';

import { fetchDeleteTagDocument } from '@/apis/case-api/civil-case-api';
import type { TCivilCaseDocumentTagDeleteOutput } from '@/apis/type/case-type/civil-case.type';

import type { AxiosError } from 'axios';

type TUseDeleteCivilCaseDocumentTagOutput = {
  isPending: boolean;
  onDeleteCivilCaseDocumentTag: (tagId: string) => Promise<TCivilCaseDocumentTagDeleteOutput | undefined>;
};

export const useDeleteCivilCaseDocumentTag = (): TUseDeleteCivilCaseDocumentTagOutput => {
  const queryClient = useQueryClient();

  const { mutateAsync, isPending } = useMutation<TCivilCaseDocumentTagDeleteOutput, AxiosError, string>({
    mutationFn: fetchDeleteTagDocument,
    onSuccess: async () => {
      await queryClient.invalidateQueries({
        predicate: (q) => Array.isArray(q.queryKey) && q.queryKey[0] === 'civil-case' && q.queryKey[1] === 'case-documents',
      });
    },
  });

  const onDeleteCivilCaseDocumentTag = async (tagId: string): Promise<TCivilCaseDocumentTagDeleteOutput | undefined> => {
    try {
      return await mutateAsync(tagId);
    } catch (error: any) {
      console.error('문서 태그 할당 삭제 실패:', error?.message);
      return undefined;
    }
  };

  return { isPending, onDeleteCivilCaseDocumentTag };
};
