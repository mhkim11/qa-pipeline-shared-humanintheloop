import { onMessageToast } from '@/components/utils';
import { globalStyle as G_S } from '@/shared/styled';

type TMutationResponseResultInput = {
  error: string;
  onSuccess: () => void;
  condition: {
    VALIDATION_FAILED: boolean;
    SERVER_FAILED: boolean;
  };
};

/**
 * * mutation 응답 결과에 따른 처리
 * @param {TMutationResponseResultInput} input mutation 응답 결과에 따른 처리 input
 * @returns {void} output mutation 응답 결과에 따른 처리 output
 */
export const mutationResponse = ({ error, onSuccess, condition }: TMutationResponseResultInput): void => {
  /**
   * ! 응답에 따른 데이터 처리 map
   */
  const responseByStatus = {
    VALIDATION_FAILED: undefined,
    SERVER_FAILED: () => {
      onMessageToast({
        message: error,
        icon: <G_S.ToastWarningIcon />,
      });
    },
    SUCCESS: onSuccess,
  } as const;

  if (condition.VALIDATION_FAILED) return;

  if (condition.SERVER_FAILED) responseByStatus.SERVER_FAILED();

  responseByStatus.SUCCESS();
};
