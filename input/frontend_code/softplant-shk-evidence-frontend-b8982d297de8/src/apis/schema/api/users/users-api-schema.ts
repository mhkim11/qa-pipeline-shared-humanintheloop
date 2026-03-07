import { z } from 'zod';

export const useAuthLoginSchema = z.object({
  user_id: z
    .string({
      message: '아이디는 문자열이어야 합니다.',
    })
    .min(1, {
      message: '아이디를 입력해주세요.',
    }),
  user_pw: z
    .string({
      message: '비밀번호는 문자열이어야 합니다.',
    })
    .min(1, {
      message: '비밀번호를 입력해주세요.',
    }),
});
