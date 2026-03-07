import { useMutation } from '@tanstack/react-query';
import { AxiosError } from 'axios';

import { fetchDeleteTagSet } from '@/apis/case-api/civil-case-api';
import type { TCivilCaseDocumentTagSetDeleteOutput } from '@/apis/type/case-type/civil-case.type';

type TUseDeleteCivilCaseTagSetOutput = {
  isPending: boolean;
  onDeleteCivilCaseTagSet: (tagSetId: string) => Promise<TCivilCaseDocumentTagSetDeleteOutput | undefined>;
};

export const useDeleteCivilCaseTagSet = (): TUseDeleteCivilCaseTagSetOutput => {
  const { mutateAsync, isPending } = useMutation<TCivilCaseDocumentTagSetDeleteOutput, AxiosError, string>({
    mutationFn: fetchDeleteTagSet,
  });

  const onDeleteCivilCaseTagSet = async (tagSetId: string): Promise<TCivilCaseDocumentTagSetDeleteOutput | undefined> => {
    try {
      return await mutateAsync(tagSetId);
    } catch (error: any) {
      console.error('민사 태그셋 삭제 실패:', error?.message);
      return undefined;
    }
  };

  return { isPending, onDeleteCivilCaseTagSet };
};
