import { useQuery } from '@tanstack/react-query';
import { AxiosError } from 'axios';
import { size } from 'lodash-es';

import { fetchFindUser, USER_QUERY_KEY } from '@/apis';
import { TFindUserOutput } from '@/apis/type';
import { paginationQueryKeyMaker } from '@/components/utils';

type TUseFindUserInput = {
  store_cd: string;
  page_no: string;
  block_cnt: string;
  is_all_page: 'Y' | 'N';
  use_yn: string;
};

type TUseFindUserOutput = {
  response?: TFindUserOutput;
  isFetching: boolean;
  error: AxiosError | null;
};

/**
 * * 검색: users react-query query hook
 * @returns {TUseFindUserOutput}
 */
export const useFindUser = ({ store_cd, page_no, block_cnt, is_all_page, use_yn }: TUseFindUserInput): TUseFindUserOutput => {
  // ! react-query 모음
  // - useQuery 모음
  const {
    data: response,
    error,
    isFetching,
  } = useQuery<TFindUserOutput, AxiosError>({
    queryKey: paginationQueryKeyMaker({
      queryKeyName: USER_QUERY_KEY.FIND_USER,
      pageSize: block_cnt,
    }),
    queryFn: () => fetchFindUser({ store_cd, page_no, block_cnt, is_all_page, use_yn }),
    enabled: size(store_cd) !== 0 && size(page_no) !== 0 && size(is_all_page) !== 0,
  });

  return { response, error, isFetching };
};
