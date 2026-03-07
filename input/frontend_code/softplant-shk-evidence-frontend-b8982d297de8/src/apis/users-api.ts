import { AxiosError as _AxiosError } from 'axios';

import { unAuthClient } from '@apis/axios-base';
import type {
  TCreateUserInput,
  TCreateUserOutput,
  TDeleteUserInput,
  TDeleteUserOutput,
  TFindUserInput,
  TFindUserOutput,
  TLoginUserInput,
  TLoginUserOutput,
  TModifyEmpUserInput,
  TModifyEmpUserOutput,
  TModifyPasswordUserInput,
  TModifyPasswordUserOutput,
  TRefreshTokenOutput,
  TLesSignupAilexAuthenticationInput,
  TLesSignupAilexAuthenticationOutput,
} from '@/apis/type';

type TUserQueryKey =
  | 'FIND_USER'
  | 'FIND_CUSTOMER_PHOTO'
  | 'REFRESH_TOKEN'
  | 'LOGIN_USER'
  | 'CREATE_USER'
  | 'MODIFY_EMP_USER'
  | 'MODIFY_PASSWORD_USER'
  | 'DELETE_USER'
  | 'LES_SIGNUP_AILEX_AUTHENTICATION';

// 문자열만 가지는 키들
type TUserStringKeys = Exclude<TUserQueryKey, 'FIND_CUSTOMER_PHOTO' | 'DELETE_USER'>;

// 함수를 가지는 키들
type TUserStoreCdCustCdFunctionKeys = 'FIND_CUSTOMER_PHOTO';
type TUserFunctionKeys = 'DELETE_USER';

// 문자열 라우트를 위한 타입
type TUserRouteStrings = {
  [K in TUserStringKeys]: string;
};

// 함수 라우트를 위한 타입
type TUserRouteStoreCdCustCdFunctions = {
  [K in TUserStoreCdCustCdFunctionKeys]: (store_cd: string, cust_cd: string) => string;
};

type TUserRouteFunctions = {
  [K in TUserFunctionKeys]: (userId: string) => string;
};

// 최종 통합 타입
type TUserRouteType = TUserRouteStrings & TUserRouteStoreCdCustCdFunctions & TUserRouteFunctions;

export const USER_QUERY_KEY: Record<TUserQueryKey, TUserQueryKey> = {
  FIND_USER: 'FIND_USER',
  FIND_CUSTOMER_PHOTO: 'FIND_CUSTOMER_PHOTO',
  REFRESH_TOKEN: 'REFRESH_TOKEN',
  LOGIN_USER: 'LOGIN_USER',
  CREATE_USER: 'CREATE_USER',
  MODIFY_EMP_USER: 'MODIFY_EMP_USER',
  MODIFY_PASSWORD_USER: 'MODIFY_PASSWORD_USER',
  DELETE_USER: 'DELETE_USER',
  LES_SIGNUP_AILEX_AUTHENTICATION: 'LES_SIGNUP_AILEX_AUTHENTICATION',
} as const;

const USER_ROUTE: TUserRouteType = {
  FIND_USER: '/user/users',
  FIND_CUSTOMER_PHOTO: (store_cd: string, cust_cd: string) => `/customer/image/${store_cd}/${cust_cd}`,
  REFRESH_TOKEN: '/user/token/refresh',
  LOGIN_USER: '/auth/login',
  CREATE_USER: '/user/create',
  MODIFY_PASSWORD_USER: '/user/modify/password',
  MODIFY_EMP_USER: '/users/emp_id',
  DELETE_USER: (userId: string): string => `/users/${userId}`,
  LES_SIGNUP_AILEX_AUTHENTICATION: '/auth/register/simple',
} as const;

/**
 * * 등록 : create
 * @description 회원가입 API 호출 함수
 * @summary [REST API] - POST | [ROUTE] - /user/create
 * @param {TCreateUserInput} input - 회원가입 정보
 * @throws {_AxiosError} axios error
 * @returns {Promise<TCreateUserOutput>} 회원가입 결과
 * @see {@link https://boost20100.postman.co/workspace/f1a2ddbf-7ff9-4518-8546-1f33726431b1/request/13159131-64e54461-ee76-4448-bda1-69d26afc7d4f}
 * @file https/users.http - [POST] /user/create
 */
export const fetchCreateUser = async (input: TCreateUserInput): Promise<TCreateUserOutput> => {
  const { data } = await unAuthClient.post<TCreateUserOutput>(USER_ROUTE.CREATE_USER, input);
  return data;
};

/**
 * * 비밀번호변경 : password
 * @description 회원 비밀번호 변경 API 호출 함수
 * @summary [REST API] - POST | [ROUTE] - /user/modify/password
 * @param {TModifyPasswordUserInput} input - 회원 비밀번호 변경 정보
 * @throws {_AxiosError} axios error
 * @returns {Promise<TModifyPasswordUserOutput>} 회원 비밀번호 변경 결과
 * @see {@link https://boost20100.postman.co/workspace/f1a2ddbf-7ff9-4518-8546-1f33726431b1/request/13159131-6886cac8-d3ac-4116-979d-70fcf5700f84}
 * @file https/users.http - [POST] /user/modify/password
 */
export const fetchModifyPasswordUser = async (input: TModifyPasswordUserInput): Promise<TModifyPasswordUserOutput> => {
  const { data } = await unAuthClient.post<TModifyPasswordUserOutput>(USER_ROUTE.MODIFY_PASSWORD_USER, input);

  return data;
};

/**
 * * 로그인 : login
 * @description 로그인 API 호출 함수
 * @summary [REST API] - POST | [ROUTE] - /auth/login
 * @param {TLoginUserInput} input - 로그인 정보
 * @throws {_AxiosError} axios error
 * @returns {Promise<TLoginUserOutput>} 로그인 결과
 * @file https/users.http - [POST] /user/login
 */
export const fetchLoginUser = async (input: TLoginUserInput): Promise<TLoginUserOutput> => {
  const { data } = await unAuthClient.post<TLoginUserOutput>(USER_ROUTE.LOGIN_USER, input);

  return data;
};

/**
 * * 사용자 직원 매칭 : emp_id
 * @description 사용자 직원 매칭 API 호출 함수
 * @summary [REST API] - PUT | [ROUTE] - /users/emp_id
 * @param {TModifyEmpUserInput} input - 사용자 직원 매칭 정보
 * @throws {_AxiosError} axios error
 * @returns {Promise<TModifyEmpUserOutput>} 사용자 직원 매칭 결과
 * @see {@link https://boost20100.postman.co/workspace/f1a2ddbf-7ff9-4518-8546-1f33726431b1/request/13159131-2eb45769-1a56-4a77-a3b5-c3add1003444?tab=body}
 * @file https/users.http - [PUT] /users/emp_id
 */
export const fetchModifyEmpUser = async (input: TModifyEmpUserInput): Promise<TModifyEmpUserOutput> => {
  const { data } = await unAuthClient.put<TModifyEmpUserOutput>(USER_ROUTE.MODIFY_EMP_USER, input);

  return data;
};

/**
 * * 검색: users
 * @description 사용자 검색 API 호출 함수
 * @summary [REST API] - POST | [ROUTE] - /user/users
 * @param {TFindUserInput} input - 사용자 검색 정보
 * @throws {_AxiosError} axios error
 * @returns {Promise<TFindUserOutput>} 사용자 검색 결과
 * @see {@link https://boost20100.postman.co/workspace/f1a2ddbf-7ff9-4518-8546-1f33726431b1/request/13159131-2c44d582-453c-454c-b786-123ea09b5bdf}
 * @file https/users.http - [POST] /user/users
 */
export const fetchFindUser = async (input: TFindUserInput): Promise<TFindUserOutput> => {
  const { data } = await unAuthClient.post<TFindUserOutput>(USER_ROUTE.FIND_USER, input);

  return data;
};

/**
 * TODO: 정확한 path variable 확인 필요
 * * 삭제: users
 * @description 사용자 삭제 API 호출 함수
 * @summary [REST API] - DELETE | [ROUTE] - /users/{userId}
 * @param {TDeleteUserInput} input - 사용자 삭제 정보
 * @throws {_AxiosError} axios error
 * @returns {Promise<TDeleteUserOutput>} 사용자 삭제 결과
 * @see {@link https://boost20100.postman.co/workspace/f1a2ddbf-7ff9-4518-8546-1f33726431b1/request/13159131-b99057b5-0d0c-42c6-be76-22a905b8ac30?tab=body}
 * @file https/users.http - [DELETE] /users/{userId}
 */
export const fetchDeleteUser = async (input: TDeleteUserInput): Promise<TDeleteUserOutput> => {
  const { data } = await unAuthClient.delete<TDeleteUserOutput>(USER_ROUTE.DELETE_USER(input.userId));

  return data;
};

/**
 * * 토큰 갱신 : refresh token
 * @description 토큰 갱신 API 호출 함수
 * @summary [REST API] - POST | [ROUTE] - /user/token/refresh
 * @throws {_AxiosError} axios error
 * @returns {Promise<TRefreshTokenOutput>} 토큰 갱신 결과
 * @see {@link https://planetary-satellite-992503-2597.postman.co/workspace/spa-crm~1bf7be96-5aa8-416c-92c9-06269b9a7fff/request/37931204-7ed78585-a57c-44bb-b611-559c0144244d?action=share&source=copy-link&creator=37931204&ctx=documentation&tab=body}
 * @file https/users.http - [POST] /user/token/refresh
 */
export const fetchRefreshToken = async (): Promise<TRefreshTokenOutput> => {
  const { data } = await unAuthClient.post<TRefreshTokenOutput>(USER_ROUTE.REFRESH_TOKEN, {});

  return data;
};

/**
 * * les간편 회원가입 : lesSignupAilexAuthentication
 * @description les간편 회원가입 API 호출 함수
 * @summary [REST API] - POST | [ROUTE] - /auth/register/simple
 * @param {TLesSignupAilexAuthenticationInput} input - les간편 회원가입 정보
 * @throws {_AxiosError} axios error
 * @returns {Promise<TLesSignupAilexAuthenticationOutput>} les간편 회원가입 결과
 * @file https/users.http - [POST] /auth/register/simple
 */
export const fetchLesSignupAilexAuthentication = async (
  input: TLesSignupAilexAuthenticationInput,
): Promise<TLesSignupAilexAuthenticationOutput> => {
  const { data } = await unAuthClient.post<TLesSignupAilexAuthenticationOutput>(USER_ROUTE.LES_SIGNUP_AILEX_AUTHENTICATION, input);
  return data;
};
