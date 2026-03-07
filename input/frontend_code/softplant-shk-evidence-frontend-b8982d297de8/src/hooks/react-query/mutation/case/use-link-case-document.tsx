import { useMutation, useQueryClient } from '@tanstack/react-query';
import { AxiosError } from 'axios';

import { fetchLinkCaseDocument, type TCaseDocumentLinkInput, type TCaseDocumentLinkOutput } from '@/apis/case-api/civil-case-api';

type TUseLinkCaseDocumentOutput = {
  isPending: boolean;
  onLinkCaseDocument: (input: TCaseDocumentLinkInput) => Promise<TCaseDocumentLinkOutput | undefined>;
};

export const useLinkCaseDocument = (): TUseLinkCaseDocumentOutput => {
  const queryClient = useQueryClient();

  const { mutateAsync, isPending } = useMutation<TCaseDocumentLinkOutput, AxiosError, TCaseDocumentLinkInput>({
    mutationFn: fetchLinkCaseDocument,
    onSuccess: async () => {
      await queryClient.refetchQueries({
        predicate: (q) =>
          Array.isArray(q.queryKey) && q.queryKey[0] === 'civil-case' && q.queryKey[1] === 'case-documents' && q.queryKey[6] === 'CLIENT',
      });
    },
  });

  const onLinkCaseDocument = async (input: TCaseDocumentLinkInput): Promise<TCaseDocumentLinkOutput | undefined> => {
    try {
      return await mutateAsync(input);
    } catch (error: any) {
      console.error('문서 매칭 실패:', error?.message);
      return undefined;
    }
  };

  return { isPending, onLinkCaseDocument };
};
