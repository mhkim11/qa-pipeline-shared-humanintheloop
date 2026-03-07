import { useMutation } from '@tanstack/react-query';
import { AxiosError } from 'axios';

import { fetchCategorizeDocument } from '@/apis/case-api/civil-case-api';
import type { TCivilCaseDocumentCategorizeInput, TCivilCaseDocumentCategorizeOutput } from '@/apis/type/case-type/civil-case.type';

type TUseCategorizeCivilCaseDocumentOutput = {
  isPending: boolean;
  onCategorizeCivilCaseDocument: (data: TCivilCaseDocumentCategorizeInput) => Promise<TCivilCaseDocumentCategorizeOutput | undefined>;
};

export const useCategorizeCivilCaseDocument = (): TUseCategorizeCivilCaseDocumentOutput => {
  const { mutateAsync, isPending } = useMutation<TCivilCaseDocumentCategorizeOutput, AxiosError, TCivilCaseDocumentCategorizeInput>({
    mutationFn: fetchCategorizeDocument,
  });

  const onCategorizeCivilCaseDocument = async (
    input: TCivilCaseDocumentCategorizeInput,
  ): Promise<TCivilCaseDocumentCategorizeOutput | undefined> => {
    try {
      return await mutateAsync(input);
    } catch (error: any) {
      console.error('문서 카테고리 분류 실패:', error?.message);
      return undefined;
    }
  };

  return { isPending, onCategorizeCivilCaseDocument };
};
