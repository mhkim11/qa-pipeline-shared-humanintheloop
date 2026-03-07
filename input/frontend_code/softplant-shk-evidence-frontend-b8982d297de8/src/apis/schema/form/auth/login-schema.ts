import { z } from 'zod';

export const loginFormSchema = z.object({
  email: z
    .string()
    .min(1, { message: '아이디를 입력 해주세요.' })
    .max(255, { message: '아이디는 최대 255자까지 입력 가능합니다.' })
    .refine(
      (email) => {
        // admin.로 시작하는 패턴은 허용 (예: admin.sekonga2d2.co.kr)
        if (email.startsWith('admin.')) {
          return true;
        }
        // 일반 이메일 형식 (@ 포함)
        return email.includes('@');
      },
      { message: '이메일 형식이 아닙니다.' },
    ),
  password: z
    .string()
    .min(1, {
      message: '비밀번호를 입력해주세요.',
    })
    .max(30, {
      message: '비밀번호는 최대 30자까지 입력 가능합니다.',
    }),
});

export const JoinFormSchema = z
  .object({
    email: z
      .string()
      .min(1, { message: '아이디를 입력 해주세요.' })
      .max(255, { message: '아이디는 최대 255자까지 입력 가능합니다.' })
      .refine(
        (email) => {
          return email.includes('@');
        },
        { message: '이메일 형식이 아닙니다.' },
      ),

    password: z
      .string()
      .min(8, { message: '비밀번호는 최소 8자 이상 입력해주세요.' })
      .max(20, { message: '비밀번호는 최대 20자까지 입력 가능합니다.' })
      .refine((password) => /[a-zA-Z]/.test(password), { message: '비밀번호에는 영문자가 포함되어야 합니다.' })
      .refine((password) => /\d/.test(password), { message: '비밀번호에는 숫자가 포함되어야 합니다.' })
      .refine((password) => /[!@#$%^&*(),.?":{}|<>]/.test(password), { message: '비밀번호에는 특수문자가 포함되어야 합니다.' }),

    Repassword: z
      .string()
      .min(8, { message: '비밀번호 확인을 입력해주세요.' })
      .max(20, { message: '비밀번호 확인은 최대 20자까지 입력 가능합니다.' }),
    name: z.string().optional(),

    phone: z.string().optional(),
  })
  .refine((data) => data.password === data.Repassword, {
    message: '비밀번호가 일치하지 않습니다.',
    path: ['Repassword'], // `Repassword` 필드에 에러 메시지 적용
  });
export const EmailFormSchema = z.object({
  email: z
    .string()
    .min(1, { message: '아이디를 입력 해주세요.' })
    .max(255, { message: '아이디는 최대 255자까지 입력 가능합니다.' })
    .refine((email) => email.includes('@'), { message: '이메일 형식이 아닙니다.' })
    .refine((email) => !/[ㄱ-ㅎ|ㅏ-ㅣ|가-힣]/.test(email), { message: '이메일 주소에는 한글을 사용할 수 없습니다.' }),
  /*  .refine(
      (email) => {
        return !personalEmailDomains.some((domain) => email.endsWith(domain));
      },
      { message: 'gmail, 네이버 등 개인 메일 주소는 사용할 수 없습니다. 로펌 혹은 소속 조직의 이메일 주소를 입력해주세요.' },
    ), */
});
export const OfficeNmFormSchema = z.object({
  email: z.string().min(1, { message: '로펌명을 입력해주세요' }).max(20, { message: '로펌명은 최대 20자까지 입력 가능합니다.' }),
});

export const finePwFormSchema = z.object({
  email: z
    .string()
    .min(1, { message: '아이디를 입력 해주세요.' })
    .max(255, { message: '아이디는 최대 255자까지 입력 가능합니다.' })
    .refine(
      (email) => {
        return email.includes('@');
      },
      { message: '이메일 형식이 아닙니다.' },
    ),
});

export const JoinUserSchema = z.object({
  email: z.string().min(1, { message: '아이디를 입력 해주세요.' }).max(255, { message: '아이디는 최대 255자까지 입력 가능합니다.' }),

  password: z.string().min(8, { message: '비밀번호는 최소 8자 이상 입력해주세요.' }),
  name: z.string().optional(),

  phone: z.string().optional(),
  marketing_agree: z.boolean().optional(),
  office_nm: z.string().optional(),
  birthdate: z.string().optional(),
  gender: z.string().optional(),
  registration_source: z.string().optional(),
  registration_source_other: z.string().optional(),
});

export const FindPwFormSchema = z.object({
  email: z
    .string()
    .min(1, { message: '아이디를 입력 해주세요.' })
    .max(255, { message: '아이디는 최대 255자까지 입력 가능합니다.' })
    .refine(
      (email) => {
        return email.includes('@');
      },
      { message: '이메일 형식이 아닙니다.' },
    ),
});
