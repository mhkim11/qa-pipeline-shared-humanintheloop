import { useMutation, useQueryClient } from '@tanstack/react-query';
import { AxiosError } from 'axios';

import { fetchDeleteCaseDocumentLink, TCaseDocumentLinkDeleteOutput } from '@/apis/case-api/civil-case-api';

type TUseDeleteCaseDocumentLinkOutput = {
  isPending: boolean;
  onDeleteCaseDocumentLink: (linkId: string) => Promise<TCaseDocumentLinkDeleteOutput | undefined>;
};

export const useDeleteCaseDocumentLink = (): TUseDeleteCaseDocumentLinkOutput => {
  const queryClient = useQueryClient();

  const { mutateAsync, isPending } = useMutation<TCaseDocumentLinkDeleteOutput, AxiosError, string>({
    mutationFn: fetchDeleteCaseDocumentLink,
    onSuccess: async () => {
      await Promise.all([
        queryClient.invalidateQueries({
          predicate: (q) => Array.isArray(q.queryKey) && q.queryKey[0] === 'civil-case' && q.queryKey[1] === 'case-documents',
        }),
        queryClient.invalidateQueries({
          predicate: (q) => Array.isArray(q.queryKey) && q.queryKey[0] === 'evidence-request' && q.queryKey[1] === 'list',
        }),
      ]);
    },
  });

  const onDeleteCaseDocumentLink = async (linkId: string): Promise<TCaseDocumentLinkDeleteOutput | undefined> => {
    try {
      return await mutateAsync(linkId);
    } catch (error: any) {
      console.error('문서 매칭 제거 실패:', error?.message);
      return undefined;
    }
  };

  return { isPending, onDeleteCaseDocumentLink };
};
