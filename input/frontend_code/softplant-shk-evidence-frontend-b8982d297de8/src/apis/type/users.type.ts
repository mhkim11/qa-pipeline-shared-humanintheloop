import { TOutput } from '@apis/type';

// ! 검색: users input type
export type TFindUserInput = {
  store_cd: string;
  page_no: string;
  block_cnt: string;
  is_all_page: 'Y' | 'N';
  use_yn: string;
};

// ! 검색: users data type
export type TFindUserData = {
  store_cd: string;
  user_id: string;
  user_auth: string | null;
  emp_id: string;
  memo: string | null;
  use_yn: 'Y';
  reg_id: string | null;
  reg_dt: Date | null;
  mod_id: string | null;
  mod_dt: Date | null;
  emp_nm: string | null;
  emp_alias_nm: string | null;
};

// ! 검색: users output type
export type TFindUserOutput = {
  data: TFindUserData[];
} & TOutput;

// ! 로그인 : login input type
export type TLoginUserInput = {
  email: string;
  password: string;
};

export type TLoginUserData = {
  data: {
    accessToken: string; // 엑세스 토큰
    user: {
      user_id: string;
      email: string;
      name: string;
      role: string;
      office_id: string;
      office_nm: string;
      phone: string;
    };
  };
};
// ! 로그인 : login output type
export type TLoginUserOutput = {
  data: {
    accessToken: string; // 엑세스 토큰
    user: {
      user_id: string;
      email: string;
      name: string;
      role: string;
      office_id: string;
      office_nm: string;
      phone: string;
    };
  };
};

// ! 등록 : create input type
export type TCreateUserInput = {
  store_cd: string;
  user_id: string;
  user_pw: string;
  emp_id: string;
  reg_id: string;
  use_yn: 'Y' | 'N';
};

// ! 등록 : create data type
export type TCreateUserData = {
  store_cd: string;
  user_id: string;
  user_pw: string;
  emp_id: string;
  use_yn: 'Y' | 'N';
  reg_id: string;
  user_auth: string | null;
  memo: string | null;
  mod_id: string | null;
  mod_dt: Date | null;
};

// ! 등록 : create output type
export type TCreateUserOutput = {
  data: TCreateUserData;
} & TOutput;

// ! 비밀번호변경 : password input type
export type TModifyPasswordUserInput = {
  user_id: string;
  user_pw: string;
  new_pw: string;
};

// ! 비밀번호변경 : password output type
export type TModifyPasswordUserOutput = {
  data: null;
} & TOutput;

// ! 사용자 직원 매칭 : emp_id input type
export type TModifyEmpUserInput = {
  store_cd: string;
  user_id: string;
  emp_id: string;
};

// ! 사용자 직원 매칭 : emp_id output type
export type TModifyEmpUserOutput = {
  data: null;
} & TOutput;

// ! 삭제: users input type
export type TDeleteUserInput = {
  userId: string;
};

// ! 삭제: users output type
export type TDeleteUserOutput = {
  data: unknown;
} & TOutput;

// ! 토큰 갱신 : refresh token output type
export type TRefreshTokenOutput = {
  data: {
    accessToken: string;
  };
} & TOutput;
// ! les간편 회원가입 input type
export type TLesSignupAilexAuthenticationInput = {
  office_id: string;
  email: string;
  name: string;
  phone: string;
};

// ! les간편 회원가입 output type
export type TLesSignupAilexAuthenticationOutput = {
  data: null;
} & TOutput;
