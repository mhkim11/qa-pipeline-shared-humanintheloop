// ! 빌링키 생성 응답 타입
export type TCreateBillingKeyOutput = {
  success: boolean;
  message: string;
  data?: {
    billingKey: string;
    customerKey: string;
    cardNumber: string;
    cardCompany: string;
    card: {
      company: string;
      number: string;
      cardType: string;
      ownerType: string;
    };
  };
};

// ! 결제 및 구독생성 input type
export type TCreatePaymentInput = {
  user_id: string;
  billingKey: string;
  customerKey: string;
  orderId: string;
  amount: number;
  orderName: string;
  email: string;
  payment_type: string;
  payer_name: string;
  payer_email: string;

  project_nm: string;
  project_id: string;
  plan_id: string;
  subscription_id: string;
  metadata: any;

  // 카드 정보 (빌링키 발급 응답에서 받은 정보)
  card_info?: {
    last4: string;
    company: string;
    cardType: string;
    number: string;
    ownerType: string;
  };
};

// ! 결제 및 구독생성 응답 타입
export type TCreatePaymentOutput = {
  success: boolean;
  message: string;
  data: [
    {
      billing_method_id: string;
      user_id: string;
      office_id: string;
      billingKey: string;
      card: {
        last4: string;
        company: string;
        cardType: string;
        number: string;
        ownerType: string;
      };
      isActive: boolean;
      createdAt: string;
      updatedAt: string;
    },
  ];
};

// ! 빌링키 조회 output type
export type TGetBillingKeyOutput = {
  success: boolean;
  message: string;
  data: {
    billing_method_id: string;
    customerKey: string;
    user_id: string;
    office_id: string;
    billingKey: string;
    card: {
      last4: string;
      company: string;
      cardType: string;
      number: string;
      ownerType: string;
    };
    isActive: boolean;
    createdAt: string;
    updatedAt: string;
  }[];
};

// ! 현재 플랜조회 응답 타입
export type TGetCurrentPlanOutput = {
  success: boolean;
  message: string;
  data: [
    {
      project_nm: string;
      status: string;
      total_amount: number;
      subscription_count: number;
      user_role: string;
      project_id: string;
    },
  ];
};
// ! 결제내역 조회 input type
export type TGetPaymentHistoryInput = {
  project_id: string;
  page_no?: number;
  block_cnt?: number;
};

// ! 결재내역 조회 응답 타입
export type TGetPaymentHistoryOutput = {
  success: boolean;
  message: string;
  data: {
    project_info: {
      project_id: string;
      project_nm: string;
      status: string;
      total_amount: number;
      my_amount: number;
    };
    list: [
      {
        payment_id: string;
        payment_date: string;
        project_nm: string;
        payment_type: string;
        user_id: string;
        user_name: string;
        payer_id: string;
        payer_name: string;
        amount: number;
        billing_day: number;
        status: string;
        card_name: string;
        card_last4: string;
        receipt_url: string | null;
        receipt_id: string | null;
        billing_period_start_str: string;
        billing_period_end_str: string;
        record_type: string;
      },
    ];

    paging: {
      total_cnt: number;
      total_page: number;
      page_no: number;
      block_cnt: number;
    };
  };
};

// ! 사건 상태 변경 결제 input type
export type TChangeCaseStatusInput = {
  project_id: string;
  status: string;
};
// ! 사건 상태 변경 결제 응답 타입
export type TChangeCaseStatusOutput = {
  success: boolean;
  message: string;
  data: {
    project_nm: string;
    description: string;
    created_by: string;
    office_id: string;
    members: string[];
    managers: string[];
    client_nm: string;
    status: string;
    total_pages: number;
    total_missing_pages: number;
    total_evidences: number;
    missing_evidences: number;
    isActive: boolean;
    isPublic: string;
    project_id: string;
    createdAt: string;
    updatedAt: string;
    ai_analysis: boolean;
    ai_menu_click_count: number;
    is_ocr_processing: boolean;
    upload_lock: string;
    expire_date: string;
    last_payment_date: string;
    payer_name: string;
    payment_id: string;
    payment_status: string;
    subscription_id: string;
  };
};
