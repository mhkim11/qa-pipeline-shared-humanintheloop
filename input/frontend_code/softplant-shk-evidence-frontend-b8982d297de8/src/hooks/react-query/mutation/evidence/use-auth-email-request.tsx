import { useMutation, useQueryClient } from '@tanstack/react-query';
import { AxiosError } from 'axios';

import { fetchSendAuthEmail, fetchSendAuthNumberEmail, fetchCheckAuthNumberEmail, EVIDENCE_QUERY_KEY } from '@/apis';
import {
  TSendAuthEmailInput,
  TSendAuthEmailOutput,
  TSendAuthNumberEmailInput,
  TSendAuthNumberEmailOutput,
  TCheckAuthNumberEmailInput,
  TCheckAuthNumberEmailOutput,
} from '@/apis/type';
import { mutationKeyMaker } from '@/components/utils';

type TUseAuthEmailOutput = {
  isPending: boolean;
  onAuthEmailRequest: (data: TSendAuthEmailInput) => Promise<TSendAuthEmailOutput>;
};

type TUseAuthNumberEmailOutput = {
  isPending: boolean;
  onAuthNumberEmailRequest: (data: TSendAuthNumberEmailInput) => Promise<TSendAuthNumberEmailOutput>;
};

type TUseCheckAuthNumberEmailOutput = {
  isPending: boolean;
  onCheckAuthNumberEmailRequest: (data: TCheckAuthNumberEmailInput) => Promise<TCheckAuthNumberEmailOutput>;
};

export const useAuthEmailRequest = (): TUseAuthEmailOutput => {
  const queryClient = useQueryClient();

  const { mutateAsync, isPending } = useMutation<TSendAuthEmailOutput, AxiosError, TSendAuthEmailInput>({
    mutationKey: mutationKeyMaker({
      mutationKeyName: EVIDENCE_QUERY_KEY.SEND_AUTH_EMAIL,
      status: 'I',
    }),
    mutationFn: fetchSendAuthEmail,
    onSuccess: async () => {
      await queryClient.invalidateQueries({
        predicate: (query) => {
          return query.queryKey.includes(EVIDENCE_QUERY_KEY.SEND_AUTH_EMAIL);
        },
      });
    },
  });

  const onAuthEmailRequest = async (data: TSendAuthEmailInput): Promise<TSendAuthEmailOutput> => {
    const response = await mutateAsync(data);
    return response;
  };

  return { isPending, onAuthEmailRequest };
};

export const useAuthNumberEmailRequest = (): TUseAuthNumberEmailOutput => {
  const queryClient = useQueryClient();

  const { mutateAsync, isPending } = useMutation<TSendAuthNumberEmailOutput, AxiosError, TSendAuthNumberEmailInput>({
    mutationKey: mutationKeyMaker({
      mutationKeyName: EVIDENCE_QUERY_KEY.SEND_AUTH_NUMBER_EMAIL,
      status: 'I',
    }),
    mutationFn: fetchSendAuthNumberEmail,
    onSuccess: async () => {
      await queryClient.invalidateQueries({
        predicate: (query) => {
          return query.queryKey.includes(EVIDENCE_QUERY_KEY.SEND_AUTH_NUMBER_EMAIL);
        },
      });
    },
  });

  const onAuthNumberEmailRequest = async (data: TSendAuthNumberEmailInput): Promise<TSendAuthNumberEmailOutput> => {
    const response = await mutateAsync(data);
    return response;
  };

  return { isPending, onAuthNumberEmailRequest };
};

export const useCheckAuthNumberEmailRequest = (): TUseCheckAuthNumberEmailOutput => {
  const queryClient = useQueryClient();

  const { mutateAsync, isPending } = useMutation<TCheckAuthNumberEmailOutput, AxiosError, TCheckAuthNumberEmailInput>({
    mutationKey: mutationKeyMaker({
      mutationKeyName: EVIDENCE_QUERY_KEY.CHECK_AUTH_NUMBER_EMAIL,
      status: 'I',
    }),
    mutationFn: fetchCheckAuthNumberEmail,
    onSuccess: async () => {
      await queryClient.invalidateQueries({
        predicate: (query) => {
          return query.queryKey.includes(EVIDENCE_QUERY_KEY.CHECK_AUTH_NUMBER_EMAIL);
        },
      });
    },
  });

  const onCheckAuthNumberEmailRequest = async (data: TCheckAuthNumberEmailInput): Promise<TCheckAuthNumberEmailOutput> => {
    const response = await mutateAsync(data);
    return response;
  };

  return { isPending, onCheckAuthNumberEmailRequest };
};
