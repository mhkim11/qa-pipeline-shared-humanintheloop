import { useMutation, useQueryClient } from '@tanstack/react-query';
import { AxiosError } from 'axios';

import { fetchInitUserPhoto, EVIDENCE_QUERY_KEY } from '@/apis/evidence-api';
import { TInitUserPhotoOutput, TMutationOutput } from '@/apis/type';
import { mutationKeyMaker } from '@/components/utils';

type TUseInitUserPhotoOutput = {
  isPending: boolean;
  onInitUserPhoto: () => Promise<TMutationOutput | undefined>;
};

/**
 * * 사용자 프로필 사진 초기화 react-query mutation hook
 * @returns {TUseInitUserPhotoOutput} 프로필 사진 초기화 결과
 */
export const useInitUserPhoto = (): TUseInitUserPhotoOutput => {
  // QueryClient 인스턴스
  const queryClient = useQueryClient();

  // Mutation 정의
  const { mutateAsync, isPending } = useMutation<TInitUserPhotoOutput, AxiosError>({
    mutationKey: mutationKeyMaker({
      mutationKeyName: EVIDENCE_QUERY_KEY.RESET_USER_PHOTO,
      status: 'U',
    }),
    mutationFn: fetchInitUserPhoto,
    onSuccess: async () => {
      // 사용자 정보 관련 쿼리 무효화
      await queryClient.invalidateQueries({
        predicate: (query) => {
          return query.queryKey.includes(EVIDENCE_QUERY_KEY.RESET_USER_PHOTO);
        },
      });
    },
  });

  /**
   * * 프로필 사진 초기화 함수
   * @returns {Promise<TMutationOutput | undefined>} 프로필 사진 초기화 결과
   */
  const onInitUserPhoto = async (): Promise<TMutationOutput | undefined> => {
    try {
      const response = await mutateAsync();

      if (response?.success) {
        return {
          isSuccess: true,
          message: response.message || '프로필 사진이 초기화되었습니다.',
        };
      }

      return {
        isSuccess: false,
        message: response?.message || '프로필 사진 초기화에 실패했습니다.',
      };
    } catch (error: any) {
      return {
        isSuccess: false,
        message: error.message || '서버 오류가 발생했습니다.',
      };
    }
  };

  return { isPending, onInitUserPhoto };
};
