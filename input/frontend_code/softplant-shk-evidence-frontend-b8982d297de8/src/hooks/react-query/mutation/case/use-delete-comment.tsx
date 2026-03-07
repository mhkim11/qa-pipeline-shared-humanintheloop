import { useMutation } from '@tanstack/react-query';
import { AxiosError } from 'axios';

import { fetchDeleteComment } from '@/apis/case-api/cliping-api';
import type { TDeleteCommentOutput } from '@/apis/type/case-type/cliping.type';

type TDeleteCommentRequest = { comment_id: string };

type TUseDeleteCommentOutput = {
  isPending: boolean;
  onDeleteComment: (data: TDeleteCommentRequest) => Promise<TDeleteCommentOutput | undefined>;
};

export const useDeleteComment = (): TUseDeleteCommentOutput => {
  const { mutateAsync, isPending } = useMutation<TDeleteCommentOutput, AxiosError, TDeleteCommentRequest>({
    mutationFn: fetchDeleteComment,
  });

  const onDeleteComment = async (input: TDeleteCommentRequest): Promise<TDeleteCommentOutput | undefined> => {
    try {
      return await mutateAsync(input);
    } catch (error: any) {
      console.error('댓글 삭제 실패:', error?.message);
      return undefined;
    }
  };

  return { isPending, onDeleteComment };
};
