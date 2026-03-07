import { useMutation } from '@tanstack/react-query';
import { AxiosError } from 'axios';

import { fetchUpdateTagSet } from '@/apis/case-api/civil-case-api';
import type { TCivilCaseDocumentTagSetUpdateInput, TCivilCaseDocumentTagSetUpdateOutput } from '@/apis/type/case-type/civil-case.type';

type TUseUpdateCivilCaseTagSetOutput = {
  isPending: boolean;
  onUpdateCivilCaseTagSet: (data: TCivilCaseDocumentTagSetUpdateInput) => Promise<TCivilCaseDocumentTagSetUpdateOutput | undefined>;
};

export const useUpdateCivilCaseTagSet = (): TUseUpdateCivilCaseTagSetOutput => {
  const { mutateAsync, isPending } = useMutation<TCivilCaseDocumentTagSetUpdateOutput, AxiosError, TCivilCaseDocumentTagSetUpdateInput>({
    mutationFn: fetchUpdateTagSet,
  });

  const onUpdateCivilCaseTagSet = async (
    input: TCivilCaseDocumentTagSetUpdateInput,
  ): Promise<TCivilCaseDocumentTagSetUpdateOutput | undefined> => {
    try {
      return await mutateAsync(input);
    } catch (error: any) {
      console.error('민사 태그셋 수정 실패:', error?.message);
      return undefined;
    }
  };

  return { isPending, onUpdateCivilCaseTagSet };
};
