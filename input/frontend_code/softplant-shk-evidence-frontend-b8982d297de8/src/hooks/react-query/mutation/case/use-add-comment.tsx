import { useMutation } from '@tanstack/react-query';
import { AxiosError } from 'axios';

import { fetchAddComment } from '@/apis/case-api/cliping-api';
import type { TAddCommentInput, TAddCommentOutput } from '@/apis/type/case-type/cliping.type';

type TAddCommentRequest = { note_id: string; input: TAddCommentInput };

type TUseAddCommentOutput = {
  isPending: boolean;
  onAddComment: (data: TAddCommentRequest) => Promise<TAddCommentOutput | undefined>;
};

export const useAddComment = (): TUseAddCommentOutput => {
  const { mutateAsync, isPending } = useMutation<TAddCommentOutput, AxiosError, TAddCommentRequest>({
    mutationFn: fetchAddComment,
  });

  const onAddComment = async (input: TAddCommentRequest): Promise<TAddCommentOutput | undefined> => {
    try {
      return await mutateAsync(input);
    } catch (error: any) {
      console.error('댓글 추가 실패:', error?.message);
      return undefined;
    }
  };

  return { isPending, onAddComment };
};
