import { useMutation } from '@tanstack/react-query';
import { AxiosError } from 'axios';

import { fetchChangeOcrManagementStatus } from '@/apis/evidence-admin-api';
import type { TChangeOcrManagementStatusInput, TChangeOcrManagementStatusOutput } from '@/apis/type/evidence-admin.type';

type TUseChangeOcrManagementStatusOutput = {
  mutate: (input: TChangeOcrManagementStatusInput) => void;
  mutateAsync: (input: TChangeOcrManagementStatusInput) => Promise<TChangeOcrManagementStatusOutput>;
  isPending: boolean;
  error: AxiosError | null;
};

/**
 * OCR 관리상태 변경 react-query mutation hook
 */
export const useChangeOcrManagementStatus = ({
  onSuccess,
  onError,
}: {
  onSuccess?: (data: TChangeOcrManagementStatusOutput) => void;
  onError?: (error: AxiosError) => void;
} = {}): TUseChangeOcrManagementStatusOutput => {
  const { mutate, mutateAsync, isPending, error } = useMutation<
    TChangeOcrManagementStatusOutput,
    AxiosError,
    TChangeOcrManagementStatusInput
  >({
    mutationFn: (input) => fetchChangeOcrManagementStatus(input),
    onSuccess: (data) => {
      onSuccess?.(data);
    },
    onError: (mutationError) => {
      console.error('OCR 관리상태 변경 실패:', mutationError);
      onError?.(mutationError);
    },
  });

  return { mutate, mutateAsync, isPending, error: error || null };
};
