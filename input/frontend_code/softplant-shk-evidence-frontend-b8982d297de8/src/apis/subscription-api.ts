import { authClient } from '@/apis';
import type {
  TGetSubscriptionPlansInput,
  TGetSubscriptionPlansOutput,
  TGetSubscriptionPlanDetailOutput,
  TUpdateSubscriptionPlanInput,
  TUpdateSubscriptionPlanOutput,
  TCreateSubscriptionPlanInput,
  TCreateSubscriptionPlanOutput,
  TDeactivateSubscriptionPlanOutput,
  TGetSubscriptionsOutput,
  TCancelSubscriptionOutput,
} from '@/apis/type/subscription.type';

// 구독 API 라우트 정의
export const SUBSCRIPTION_ROUTE = {
  GET_PLANS: '/subscription/plan/list',
  GET_PLAN_DETAIL: '/subscription/plan',
  UPDATE_PLAN: '/subscription/plan',
  CREATE_PLAN: '/subscription/plan/create',
  DEACTIVATE_PLAN: '/subscription/plan',
  GET_SUBSCRIPTIONS: '/subscription/list',
  CANCEL_SUBSCRIPTION: '/subscription',
} as const;

// 구독 API 쿼리 키 정의
export const SUBSCRIPTION_QUERY_KEY = {
  GET_PLANS: 'getSubscriptionPlans',
  GET_PLAN_DETAIL: 'getSubscriptionPlanDetail',
  GET_SUBSCRIPTIONS: 'getSubscriptions',
} as const;

/**
 * 구독 플랜 목록 조회
 * @param {TGetSubscriptionPlansInput} input - 플랜 목록 조회 파라미터
 * @returns {Promise<TGetSubscriptionPlansOutput>} 플랜 목록 조회 결과
 */
export const fetchGetSubscriptionPlans = async (input: TGetSubscriptionPlansInput): Promise<TGetSubscriptionPlansOutput> => {
  const { data } = await authClient.get<TGetSubscriptionPlansOutput>(
    `${SUBSCRIPTION_ROUTE.GET_PLANS}?include_inactive=${input.include_inactive}`,
  );
  return data;
};

/**
 * 구독 플랜 상세 조회
 * @param {string} planId - 플랜 ID
 * @returns {Promise<TGetSubscriptionPlanDetailOutput>} 플랜 상세 조회 결과
 */
export const fetchGetSubscriptionPlanDetail = async (planId: string): Promise<TGetSubscriptionPlanDetailOutput> => {
  const { data } = await authClient.get<TGetSubscriptionPlanDetailOutput>(`${SUBSCRIPTION_ROUTE.GET_PLAN_DETAIL}/${planId}`);
  return data;
};

/**
 * 구독 플랜 수정
 * @param {string} planId - 플랜 ID
 * @param {TUpdateSubscriptionPlanInput} input - 플랜 수정 데이터
 * @returns {Promise<TUpdateSubscriptionPlanOutput>} 플랜 수정 결과
 */
export const fetchUpdateSubscriptionPlan = async (
  planId: string,
  input: TUpdateSubscriptionPlanInput,
): Promise<TUpdateSubscriptionPlanOutput> => {
  const { data } = await authClient.put<TUpdateSubscriptionPlanOutput>(`${SUBSCRIPTION_ROUTE.UPDATE_PLAN}/${planId}`, input);
  return data;
};

/**
 * 구독 플랜 생성
 * @param {TCreateSubscriptionPlanInput} input - 플랜 생성 데이터
 * @returns {Promise<TCreateSubscriptionPlanOutput>} 플랜 생성 결과
 */
export const fetchCreateSubscriptionPlan = async (input: TCreateSubscriptionPlanInput): Promise<TCreateSubscriptionPlanOutput> => {
  const { data } = await authClient.post<TCreateSubscriptionPlanOutput>(SUBSCRIPTION_ROUTE.CREATE_PLAN, input);
  return data;
};

/**
 * 구독 플랜 비활성화
 * @param {string} planId - 플랜 ID
 * @returns {Promise<TDeactivateSubscriptionPlanOutput>} 플랜 비활성화 결과
 */
export const fetchDeactivateSubscriptionPlan = async (planId: string): Promise<TDeactivateSubscriptionPlanOutput> => {
  const { data } = await authClient.delete<TDeactivateSubscriptionPlanOutput>(`${SUBSCRIPTION_ROUTE.DEACTIVATE_PLAN}/${planId}`);
  return data;
};

/**
 * 구독 목록 조회
 * @returns {Promise<TGetSubscriptionsOutput>} 구독 목록 조회 결과
 */
export const fetchGetSubscriptions = async (): Promise<TGetSubscriptionsOutput> => {
  const { data } = await authClient.get<TGetSubscriptionsOutput>(SUBSCRIPTION_ROUTE.GET_SUBSCRIPTIONS);
  return data;
};

/**
 * 구독 취소
 * @param {string} subscriptionId - 구독 ID
 * @returns {Promise<TCancelSubscriptionOutput>} 구독 취소 결과
 */
export const fetchCancelSubscription = async (subscriptionId: string): Promise<TCancelSubscriptionOutput> => {
  const { data } = await authClient.delete<TCancelSubscriptionOutput>(`${SUBSCRIPTION_ROUTE.CANCEL_SUBSCRIPTION}/${subscriptionId}/cancel`);
  return data;
};
