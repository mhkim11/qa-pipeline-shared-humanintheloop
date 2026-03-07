import { AxiosError as _AxiosError } from 'axios';

import { authClient } from '@apis/index';
import type {
  TCreatePaymentInput,
  TCreatePaymentOutput,
  TCreateBillingKeyOutput,
  TGetBillingKeyOutput,
  TGetCurrentPlanOutput,
  TGetPaymentHistoryOutput,
  TGetPaymentHistoryInput,
  TChangeCaseStatusInput,
  TChangeCaseStatusOutput,
} from '@/apis/type/payment.type';

type TPaymentQueryKey = {
  CREATE_BILLING_KEY: 'CREATE_BILLING_KEY';
  CREATE_PAYMENT: 'CREATE_PAYMENT';
  GET_BILLING_KEY: 'GET_BILLING_KEY';
  GET_CURRENT_PLAN: 'GET_CURRENT_PLAN';
  GET_PAYMENT_HISTORY: 'GET_PAYMENT_HISTORY';
  CHANGE_CASE_STATUS: 'CHANGE_CASE_STATUS';
};

type TPaymentRouteKey = {
  CREATE_BILLING_KEY: '/payment/billingKey/create';
  CREATE_PAYMENT: '/payment/approve';
  GET_BILLING_KEY: '/payment/billingKey/list';
  GET_CURRENT_PLAN: '/subscription/current-plan/list';
  GET_PAYMENT_HISTORY: '/subscription/payment/list';
  CHANGE_CASE_STATUS: '/project/status';
};

export const PAYMENT_QUERY_KEY: TPaymentQueryKey = {
  CREATE_BILLING_KEY: 'CREATE_BILLING_KEY',
  CREATE_PAYMENT: 'CREATE_PAYMENT',
  GET_BILLING_KEY: 'GET_BILLING_KEY',
  GET_CURRENT_PLAN: 'GET_CURRENT_PLAN',
  GET_PAYMENT_HISTORY: 'GET_PAYMENT_HISTORY',
  CHANGE_CASE_STATUS: 'CHANGE_CASE_STATUS',
};

const PAYMENT_ROUTE: TPaymentRouteKey = {
  CREATE_BILLING_KEY: '/payment/billingKey/create',
  CREATE_PAYMENT: '/payment/approve',
  GET_BILLING_KEY: '/payment/billingKey/list',
  GET_CURRENT_PLAN: '/subscription/current-plan/list',
  GET_PAYMENT_HISTORY: '/subscription/payment/list',
  CHANGE_CASE_STATUS: '/project/status',
};

/**
 * * 빌링키 생성 API
 * @description 빌링키 생성 API 호출 함수
 * @summary [REST API] - POST | [ROUTE] - /legal/api/v1/payment/billingKey/create
 * @param {string} customerKey - 고객 키
 * @param {string} authKey - 인증 키
 * @throws {AxiosError} axios error
 * @returns {Promise<TCreateBillingKeyOutput>} 빌링키 생성 결과
 */
export const fetchCreateBillingKey = async (customerKey: string, authKey: string): Promise<TCreateBillingKeyOutput> => {
  const { data } = await authClient.get<TCreateBillingKeyOutput>(PAYMENT_ROUTE.CREATE_BILLING_KEY, {
    params: { customerKey, authKey },
  });
  return data;
};

/**
 * * 결제 및 구독 생성 API
 * @description 결제 및 구독 생성 API 호출 함수
 * @summary [REST API] - POST | [ROUTE] - /legal/api/v1/payment/approve
 * @param {TCreatePaymentInput} input - 결제 및 구독 생성 정보
 * @throws {AxiosError} axios error
 * @returns {Promise<TCreatePaymentOutput>} 결제 및 구독 생성 결과
 */
export const fetchCreatePayment = async (input: TCreatePaymentInput): Promise<TCreatePaymentOutput> => {
  const { data } = await authClient.post<TCreatePaymentOutput>(PAYMENT_ROUTE.CREATE_PAYMENT, input);
  return data;
};

/**
 * * 빌링키 조회 API
 * @description 빌링키 조회 API 호출 함수
 * @summary [REST API] - GET | [ROUTE] - /legal/api/v1/payment/billingKey/list
 * @param {string} customerKey - 고객 키
 * @param {string} authKey - 인증 키
 * @throws {AxiosError} axios error
 * @returns {Promise<TGetBillingKeyOutput>} 빌링키 조회 결과
 */
export const fetchGetBillingKey = async (customerKey: string, authKey: string): Promise<TGetBillingKeyOutput> => {
  const { data } = await authClient.get<TGetBillingKeyOutput>(PAYMENT_ROUTE.GET_BILLING_KEY, {
    params: { customerKey, authKey },
  });
  return data;
};

// ! 현재 플랜조회 API
export const fetchGetCurrentPlan = async (): Promise<TGetCurrentPlanOutput> => {
  const { data } = await authClient.get<TGetCurrentPlanOutput>(PAYMENT_ROUTE.GET_CURRENT_PLAN);
  return data;
};

// ! 결제내역 조회 API
export const fetchGetPaymentHistory = async (input: TGetPaymentHistoryInput): Promise<TGetPaymentHistoryOutput> => {
  const { data } = await authClient.post<TGetPaymentHistoryOutput>(PAYMENT_ROUTE.GET_PAYMENT_HISTORY, input);
  return data;
};

// ! 사건 상태 변경 결제 API
export const fetchChangeCaseStatus = async (input: TChangeCaseStatusInput): Promise<TChangeCaseStatusOutput> => {
  const { data } = await authClient.put<TChangeCaseStatusOutput>(PAYMENT_ROUTE.CHANGE_CASE_STATUS, input);
  return data;
};
