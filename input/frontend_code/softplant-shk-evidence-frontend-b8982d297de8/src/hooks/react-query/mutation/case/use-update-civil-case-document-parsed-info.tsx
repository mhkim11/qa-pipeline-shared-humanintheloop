import { useMutation, useQueryClient } from '@tanstack/react-query';
import { AxiosError } from 'axios';

import { fetchUpdateDocumentParsedInfo } from '@/apis/case-api/civil-case-api';
import type {
  TCivilCaseDocumentParsedInfoUpdateInput,
  TCivilCaseDocumentParsedInfoUpdateOutput,
} from '@/apis/type/case-type/civil-case.type';

type TUseUpdateCivilCaseDocumentParsedInfoOutput = {
  isPending: boolean;
  onUpdateCivilCaseDocumentParsedInfo: (
    data: TCivilCaseDocumentParsedInfoUpdateInput,
  ) => Promise<TCivilCaseDocumentParsedInfoUpdateOutput | undefined>;
};

export const useUpdateCivilCaseDocumentParsedInfo = (): TUseUpdateCivilCaseDocumentParsedInfoOutput => {
  const queryClient = useQueryClient();

  const { mutateAsync, isPending } = useMutation<
    TCivilCaseDocumentParsedInfoUpdateOutput,
    AxiosError,
    TCivilCaseDocumentParsedInfoUpdateInput
  >({
    mutationFn: fetchUpdateDocumentParsedInfo,
    onSuccess: async () => {
      await queryClient.refetchQueries({
        predicate: (q) => Array.isArray(q.queryKey) && q.queryKey[0] === 'civil-case' && q.queryKey[1] === 'case-documents',
      });
    },
  });

  const onUpdateCivilCaseDocumentParsedInfo = async (
    input: TCivilCaseDocumentParsedInfoUpdateInput,
  ): Promise<TCivilCaseDocumentParsedInfoUpdateOutput | undefined> => {
    try {
      return await mutateAsync(input);
    } catch (error: any) {
      console.error('문서 파싱 정보 수정 실패:', error?.message);
      return undefined;
    }
  };

  return { isPending, onUpdateCivilCaseDocumentParsedInfo };
};
