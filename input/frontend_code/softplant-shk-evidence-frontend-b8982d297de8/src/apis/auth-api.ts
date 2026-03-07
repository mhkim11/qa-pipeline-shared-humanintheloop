import { unAuthClient } from '@apis/index';
import type { TFindAllIdsInput, TFindAllIdsOutput } from '@apis/type';

/**
 * * 아이디(가입 이메일) 모두 찾기
 * @summary [REST API] - POST | [ROUTE] - /auth/id/find/all
 */
export const fetchFindAllIds = async (input: TFindAllIdsInput): Promise<TFindAllIdsOutput> => {
  const { data } = await unAuthClient.post<TFindAllIdsOutput>('/auth/id/find/all', input);
  return data;
};
