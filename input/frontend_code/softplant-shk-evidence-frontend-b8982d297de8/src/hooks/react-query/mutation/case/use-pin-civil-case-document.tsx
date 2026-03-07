import { useMutation, useQueryClient } from '@tanstack/react-query';
import { AxiosError } from 'axios';

import { fetchPinDocument } from '@/apis/case-api/civil-case-api';
import type { TCivilCaseDocumentPinInput, TCivilCaseDocumentPinOutput } from '@/apis/type/case-type/civil-case.type';

type TUsePinCivilCaseDocumentOutput = {
  isPending: boolean;
  onPinCivilCaseDocument: (data: TCivilCaseDocumentPinInput) => Promise<TCivilCaseDocumentPinOutput | undefined>;
};

export const usePinCivilCaseDocument = (): TUsePinCivilCaseDocumentOutput => {
  const queryClient = useQueryClient();

  const { mutateAsync, isPending } = useMutation<TCivilCaseDocumentPinOutput, AxiosError, TCivilCaseDocumentPinInput>({
    mutationFn: fetchPinDocument,
    onSuccess: async (_data, variables) => {
      // 토글 완료 후 목록을 "한 번만" 확실히 다시 가져온다.
      await queryClient.refetchQueries({
        predicate: (q) =>
          Array.isArray(q.queryKey) &&
          q.queryKey[0] === 'civil-case' &&
          q.queryKey[1] === 'case-documents' &&
          q.queryKey[2] === variables.civil_case_id,
      });
    },
  });

  const onPinCivilCaseDocument = async (input: TCivilCaseDocumentPinInput): Promise<TCivilCaseDocumentPinOutput | undefined> => {
    try {
      return await mutateAsync(input);
    } catch (error: any) {
      console.error('민사 문서 고정 실패:', error?.message);
      return undefined;
    }
  };

  return { isPending, onPinCivilCaseDocument };
};
