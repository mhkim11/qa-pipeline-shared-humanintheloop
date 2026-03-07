import { useMutation, useQueryClient } from '@tanstack/react-query';

import { fetchSplitDocument, type TCivilCaseDocumentSplitInput, type TCivilCaseDocumentSplitOutput } from '@/apis/case-api/civil-case-api';

import type { AxiosError } from 'axios';

type TUseSplitCivilCaseDocumentOutput = {
  isPending: boolean;
  onSplitCivilCaseDocument: (input: TCivilCaseDocumentSplitInput) => Promise<TCivilCaseDocumentSplitOutput | undefined>;
};

export const useSplitCivilCaseDocument = (): TUseSplitCivilCaseDocumentOutput => {
  const queryClient = useQueryClient();

  const { mutateAsync, isPending } = useMutation<TCivilCaseDocumentSplitOutput, AxiosError, TCivilCaseDocumentSplitInput>({
    mutationFn: fetchSplitDocument,
    onSuccess: async () => {
      // refresh all civil-case document lists (client/lawyer)
      await queryClient.invalidateQueries({
        predicate: (q) => Array.isArray(q.queryKey) && q.queryKey[0] === 'civil-case' && q.queryKey[1] === 'case-documents',
      });
    },
  });

  const onSplitCivilCaseDocument = async (input: TCivilCaseDocumentSplitInput): Promise<TCivilCaseDocumentSplitOutput | undefined> => {
    try {
      return await mutateAsync(input);
    } catch (error: any) {
      const axiosErr = error as AxiosError<any>;
      const msg = String(
        axiosErr?.response?.data?.message ?? axiosErr?.response?.data?.error ?? axiosErr?.message ?? '문서 분리에 실패했습니다.',
      ).trim();
      console.error('문서 분리 실패:', msg);
      return { success: false, message: msg };
    }
  };

  return { isPending, onSplitCivilCaseDocument };
};
