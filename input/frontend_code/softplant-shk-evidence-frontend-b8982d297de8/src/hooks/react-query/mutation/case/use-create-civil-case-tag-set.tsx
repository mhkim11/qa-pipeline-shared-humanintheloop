import { useMutation, useQueryClient } from '@tanstack/react-query';
import { AxiosError } from 'axios';

import { fetchCreateTagSet } from '@/apis/case-api/civil-case-api';
import type { TCivilCaseDocumentTagSetCreateInput, TCivilCaseDocumentTagSetCreateOutput } from '@/apis/type/case-type/civil-case.type';

type TUseCreateCivilCaseTagSetOutput = {
  isPending: boolean;
  onCreateCivilCaseTagSet: (data: TCivilCaseDocumentTagSetCreateInput) => Promise<TCivilCaseDocumentTagSetCreateOutput | undefined>;
};

export const useCreateCivilCaseTagSet = (): TUseCreateCivilCaseTagSetOutput => {
  const queryClient = useQueryClient();

  const { mutateAsync, isPending } = useMutation<TCivilCaseDocumentTagSetCreateOutput, AxiosError, TCivilCaseDocumentTagSetCreateInput>({
    mutationFn: fetchCreateTagSet,
    onSuccess: async (_data, variables) => {
      await queryClient.invalidateQueries({
        predicate: (q) =>
          Array.isArray(q.queryKey) &&
          q.queryKey[0] === 'civil-case' &&
          q.queryKey[1] === 'tag-sets' &&
          q.queryKey[2] === variables.civil_case_id,
      });
    },
  });

  const onCreateCivilCaseTagSet = async (
    input: TCivilCaseDocumentTagSetCreateInput,
  ): Promise<TCivilCaseDocumentTagSetCreateOutput | undefined> => {
    try {
      return await mutateAsync(input);
    } catch (error: any) {
      console.error('민사 태그셋 생성 실패:', error?.message);
      return undefined;
    }
  };

  return { isPending, onCreateCivilCaseTagSet };
};
