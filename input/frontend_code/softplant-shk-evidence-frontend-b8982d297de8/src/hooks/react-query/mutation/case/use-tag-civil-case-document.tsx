import { useMutation, useQueryClient } from '@tanstack/react-query';
import { AxiosError } from 'axios';

import { fetchTagDocument } from '@/apis/case-api/civil-case-api';
import type { TCivilCaseDocumentTagAddInput, TCivilCaseDocumentTagAddOutput } from '@/apis/type/case-type/civil-case.type';

type TUseTagCivilCaseDocumentOutput = {
  isPending: boolean;
  onTagCivilCaseDocument: (data: TCivilCaseDocumentTagAddInput) => Promise<TCivilCaseDocumentTagAddOutput | undefined>;
};

export const useTagCivilCaseDocument = (): TUseTagCivilCaseDocumentOutput => {
  const queryClient = useQueryClient();

  const { mutateAsync, isPending } = useMutation<TCivilCaseDocumentTagAddOutput, AxiosError, TCivilCaseDocumentTagAddInput>({
    mutationFn: fetchTagDocument,
    onSuccess: async (_data, variables) => {
      // 태그 변경 후 문서 목록을 다시 가져온다 (invalidate만 하여 중복 호출 방지).
      await queryClient.invalidateQueries({
        predicate: (q) =>
          Array.isArray(q.queryKey) &&
          q.queryKey[0] === 'civil-case' &&
          q.queryKey[1] === 'case-documents' &&
          q.queryKey[2] === variables.civil_case_id,
      });

      // 태그 목록도 갱신
      await queryClient.invalidateQueries({
        predicate: (q) =>
          Array.isArray(q.queryKey) &&
          q.queryKey[0] === 'civil-case' &&
          q.queryKey[1] === 'case-document-tags' &&
          q.queryKey[2] === variables.civil_case_id &&
          q.queryKey[3] === variables.case_document_id,
      });
    },
  });

  const onTagCivilCaseDocument = async (input: TCivilCaseDocumentTagAddInput): Promise<TCivilCaseDocumentTagAddOutput | undefined> => {
    try {
      return await mutateAsync(input);
    } catch (error: any) {
      console.error('민사 문서 태그 변경 실패:', error?.message);
      return undefined;
    }
  };

  return { isPending, onTagCivilCaseDocument };
};
