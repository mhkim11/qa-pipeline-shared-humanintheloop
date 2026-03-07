// 구독 플랜 관련 타입 정의

/**
 * 구독 플랜 조회 입력 타입
 */
export type TGetSubscriptionPlansInput = {
  include_inactive: boolean;
};

/**
 * 구독 플랜 데이터 타입
 */
export type TSubscriptionPlan = {
  _id: string;
  plan_name: string;
  plan_description: string[];
  payment_type: string;
  unitPrice: number;
  amount: number;
  interval: string;
  discount_amount: number;
  discount_percentage: number | null;
  isActive: boolean;
  plan_id: string;
  createdAt: string;
  updatedAt: string;
  __v: number;
  final_amount: number;
  discount_value: number;
  is_subscription_plan: boolean;
  is_participation_plan: boolean;
  id: string;
  metadata?: {
    max_projects?: number;
    support_level?: string;
    features?: string[];
    [key: string]: any;
  };
};

/**
 * 구독 플랜 목록 조회 출력 타입
 */
export type TGetSubscriptionPlansOutput = {
  success: boolean;
  message: string;
  data: TSubscriptionPlan[];
};

/**
 * 구독 플랜 수정 입력 타입
 */
export type TUpdateSubscriptionPlanInput = {
  plan_name?: string;
  plan_description?: string[];
  payment_type?: string;
  unitPrice?: number;
  amount?: number;
  interval?: string;
  discount_amount?: number;
  discount_percentage?: number;
  metadata?: {
    max_projects?: number;
    support_level?: string;
    features?: string[];
    [key: string]: any;
  };
  isActive?: boolean;
};

/**
 * 구독 플랜 수정 출력 타입
 */
export type TUpdateSubscriptionPlanOutput = {
  success: boolean;
  message: string;
  data: TSubscriptionPlan;
};

/**
 * 구독 플랜 상세 조회 출력 타입
 */
export type TGetSubscriptionPlanDetailOutput = {
  success: boolean;
  message: string;
  data: TSubscriptionPlan;
};

/**
 * 구독 플랜 생성 입력 타입
 */
export type TCreateSubscriptionPlanInput = {
  plan_name: string;
  plan_description: string[];
  payment_type: string;
  unitPrice: number;
  amount: number;
  interval: string;
  discount_amount?: number;
  discount_percentage?: number;
  metadata?: {
    max_projects?: number;
    support_level?: string;
    features?: string[];
    [key: string]: any;
  };
  isActive?: boolean;
};

/**
 * 구독 플랜 생성 출력 타입
 */
export type TCreateSubscriptionPlanOutput = {
  success: boolean;
  message: string;
  data: TSubscriptionPlan;
};

/**
 * 구독 플랜 비활성화 출력 타입
 */
export type TDeactivateSubscriptionPlanOutput = {
  success: boolean;
  message: string;
  data: TSubscriptionPlan;
};

/**
 * 구독 데이터 타입
 */
export type TSubscription = {
  user_id: string;
  office_id: string;
  plan_id: {
    plan_name: string;
    payment_type: string;
    unitPrice: number;
    amount: number;
    interval: string;
    discount_amount: number;
    discount_percentage: number | null;
    isActive: boolean;
    plan_id: string;
  };
  billing_method_id: {
    card: {
      last4: string;
      company: string;
      cardType: string;
      number: string;
      ownerType: string;
    };
    isActive: boolean;
    billing_method_id: string;
    createdAt: string;
  };
  status: 'active' | 'cancelled' | 'expired' | 'pending';
  nextBillingAt: string;
  cancelAt: string | null;
  current_period_start: string;
  current_period_end: string;
  subscription_id: string;
  createdAt: string;
  // 기존 필드들 (하위 호환성을 위해 유지)
  _id?: string;
  project_id?: string;
  billing_key?: string;
  customer_key?: string;
  payment_method?: string;
  updatedAt?: string;
  cancelled_at?: string;
  cancel_reason?: string;
  plan_details?: TSubscriptionPlan;
  project_name?: string;
  user_name?: string;
  user_email?: string;
};

/**
 * 구독 목록 조회 출력 타입
 */
export type TGetSubscriptionsOutput = {
  success: boolean;
  message: string;
  data: TSubscription[];
  paging?: {
    current_page: number;
    total_page: number;
    total_cnt: number;
    block_cnt: number;
  };
};

/**
 * 구독 취소 출력 타입
 */
export type TCancelSubscriptionOutput = {
  success: boolean;
  message: string;
  data: TSubscription;
};
