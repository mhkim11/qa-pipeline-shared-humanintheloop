import { TOutput } from '@apis/type';

/**
 * 아이디(가입 이메일) 모두 찾기
 * @summary [REST API] - POST | [ROUTE] - /auth/id/find/all
 */
export type TFindAllIdsInput = {
  name: string;
  phone: string;
};

export type TFindAllIdsOutput = {
  data: {
    total: number;
    emails: string[];
  };
} & TOutput;
