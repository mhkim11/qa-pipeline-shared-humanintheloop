import { useQuery } from '@tanstack/react-query';
import { AxiosError } from 'axios';

import { fetchListNotification } from '@/apis';
import { TListNotificationInput, TListNotificationOutput } from '@/apis/type';
import { paginationQueryKeyMaker } from '@/components/utils';

type TUseListNotificationOutput = {
  response?: TListNotificationOutput;
  isFetching: boolean;
  isLoading: boolean;
  error: AxiosError | null;
  refetch: () => void;
};

/**
 * * 메시지 리스트 조회 react-query query hook
 * @param {TListNotificationInput} input 메시지 리스트 조회 조건
 * @returns {TUseListNotificationOutput} output 메시지 리스트 조회 결과
 */
export const useListNotification = ({ page_no, block_cnt, isRead }: TListNotificationInput): TUseListNotificationOutput => {
  const {
    data: response,
    error,
    isFetching,
    refetch,
    isLoading,
  } = useQuery<TListNotificationOutput, AxiosError>({
    queryKey: paginationQueryKeyMaker({
      queryKeyName: 'NOTIFICATION_LIST',
      pageSize: '',
      otherQueryParams: { page_no: '', isRead: isRead?.toString() ?? '' },
    }),
    queryFn: async () => {
      const result = await fetchListNotification({ page_no, block_cnt, isRead });
      return result;
    },
    staleTime: 1 * 60 * 1000, // 1분간 데이터를 fresh로 유지 (알림은 자주 변경될 수 있음)
    gcTime: 5 * 60 * 1000, // 5분간 캐시 유지
    refetchOnWindowFocus: false, // 윈도우 포커스 시 refetch 방지
    refetchOnMount: false, // 컴포넌트 마운트 시 refetch 방지 (캐시된 데이터가 있으면)
    refetchOnReconnect: false, // 네트워크 재연결 시 refetch 방지
  });

  if (error) {
    console.error('Query Error:', error); // 에러 로그 출력
  }

  return { response, error, isFetching, refetch, isLoading };
};
