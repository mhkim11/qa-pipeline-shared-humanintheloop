import { useMutation } from '@tanstack/react-query';
import { AxiosError } from 'axios';

import { fetchUpdateComment } from '@/apis/case-api/cliping-api';
import type { TUpdateCommentInput, TUpdateCommentOutput } from '@/apis/type/case-type/cliping.type';

type TUpdateCommentRequest = { comment_id: string; input: TUpdateCommentInput };

type TUseUpdateCommentOutput = {
  isPending: boolean;
  onUpdateComment: (data: TUpdateCommentRequest) => Promise<TUpdateCommentOutput | undefined>;
};

export const useUpdateComment = (): TUseUpdateCommentOutput => {
  const { mutateAsync, isPending } = useMutation<TUpdateCommentOutput, AxiosError, TUpdateCommentRequest>({
    mutationFn: fetchUpdateComment,
  });

  const onUpdateComment = async (input: TUpdateCommentRequest): Promise<TUpdateCommentOutput | undefined> => {
    try {
      return await mutateAsync(input);
    } catch (error: any) {
      console.error('댓글 수정 실패:', error?.message);
      return undefined;
    }
  };

  return { isPending, onUpdateComment };
};
