import { useMutation } from '@tanstack/react-query';
import { AxiosError } from 'axios';

import { fetchViewDocument } from '@/apis/case-api/civil-case-api';
import type { TCivilCaseDocumentViewInput } from '@/apis/type/case-type/civil-case.type';

type TUseViewCivilCaseDocumentOutput = {
  isPending: boolean;
  onViewCivilCaseDocument: (data: TCivilCaseDocumentViewInput) => Promise<Blob | undefined>;
};

export const useViewCivilCaseDocument = (): TUseViewCivilCaseDocumentOutput => {
  const { mutateAsync, isPending } = useMutation<Blob, AxiosError, TCivilCaseDocumentViewInput>({
    mutationFn: fetchViewDocument,
  });

  const onViewCivilCaseDocument = async (input: TCivilCaseDocumentViewInput): Promise<Blob | undefined> => {
    try {
      return await mutateAsync(input);
    } catch (error: any) {
      console.error('민사 문서 조회 실패:', error?.message);
      return undefined;
    }
  };

  return { isPending, onViewCivilCaseDocument };
};
