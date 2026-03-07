import { TOutput } from '@apis/type';

// ! 제품 검색: search input type
export type TFindSalesItemsInput = {
  store_cd: string;
  keyword: string;
  use_yn: string;
};

// ! 제품 검색: search inside data type
export type TFindSalesItemsInsideData = {
  store_cd: string;
  item_cd: string;
  item_nm: string;
  item_gbn: string;
  stnd: string;
  barcode_same_yn: string;
  barcode: string;
  account_cd: string;
  use_gbn: string;
  safe_jaego: string;
  purchase_amt: string;
  sale_amt: string;
  sts_cd: string;
  memo: string;
  use_yn: string;
  reg_id: string;
  reg_dt: string;
  mod_id: string;
  mod_dt: string;
  jaego_qty: string;
};

// ! 제품 검색: search output type
export type TFindSalesItemsData = {
  data: TFindSalesItemsInsideData[];
};

// ! 제품 검색: search output type
export type TFindSalesItemsOutput = {
  data: TFindSalesItemsData;
} & TOutput;

// ! 판매내역 검색: search input type
export type TFindSalesInput = {
  store_cd: string;
  start_dt: string;
  end_dt: string;
  sale_seq: string;
  cust_cd: string;
  item_gbn: 'ALL' | 'SERVICE' | 'PASSCARD' | 'TICKET' | 'PRODUCT' | '';
  pay_gbn: 'ALL' | 'CARD' | 'CASH' | 'MISU' | 'U_POINT' | 'U_PASSCARD' | 'U_TICKET' | '';
  emp_id: string;
  page_no: string;
  block_cnt: string;
  is_all_page: 'Y' | 'N';
  use_yn: 'Y' | 'N';
};
// 직원 정보 타입 정의
export type TFindSalesInsideEmployees = {
  emp_id: string;
  emp_nm: string;
  sale_amt: number;
  emp_amt_gbn: string; // S or other type
};

// 판매 상세 정보 타입 정의
export type TFindSalesInsideDetails = {
  exp_dt: string;
  item_cd: string;
  item_nm: string;
  item_gbn: 'PRODUCT' | 'TICKET' | 'PASSCARD' | 'SERVICE';
  sale_amt: number;
  sale_qty: number;
  sale_danga: number;
  memo: string;
  item_discount: string | null;
  service_discount: string | null;
  employees: TFindSalesInsideEmployees[];
};

// 결제 정보 타입 정의
export type TFindSalesInsidePayment = {
  rmk: string;
  pay_amt: number;
  pay_gbn: string;
};

// ! 제품 검색: search inside data type

export type TFindSalesInsideData = {
  store_cd: string;
  sale_dt: string;
  sale_seq: string;
  temp_cust_yn: 'Y' | 'N';
  cust_cd: string;
  cust_nm: string;
  hp_no: string;
  tot_qty: string;
  tot_amt: string;
  sts_gbn: 'Y' | 'N';
  book_dt: string | null;
  book_seq: string | null;
  temp_yn: 'Y' | 'N';
  memo: string | null;
  reg_id: string;
  reg_dt: string;
  details: TFindSalesInsideDetails[];
  payments: TFindSalesInsidePayment[];
};

// ! 제품 검색: search output type
export type TFindSalesData = {
  paging: {
    total_cnt: number;
    total_page: number;
    page_no: number;
  };
  data: TFindSalesInsideData[];
};

// ! 제품 검색: search output type
export type TFindSalesOutput = {
  data: TFindSalesData;
} & TOutput;

// ! 고객 티켓 검색: search input type
export type TFindSalesTicketInput = {
  store_cd: string;
  cust_cd: string;
  use_yn: string;
  my_ticket: string;
};

// ! 고객 티켓 검색 : search inside data type
export type TFindSalesTicketInsideData = {
  store_cd: string;
  cust_cd: string;
  ticket_dt: string;
  ticket_seq: string;
  ticket_cd: string;
  ticket_reason: string;
  ticket_cnt: string;
  increase_cnt: string;
  remain_cnt: string;
  sale_danga: string;
  exp_dt: string;
  service_discount: string;
  item_discount: string;
  sale_dt: string;
  sale_seq: string;
  use_yn: string;
  reg_id: string;
  reg_dt: string;
  mod_id: string;
  mod_dt: string;
  ticket_nm: string;
  details: {
    item_cd: string;
    item_nm: string;
    sale_amt: string;
    sale_danga: string;
    sale_dt: string;
  }[];
};

// ! 고객 티켓 검색: search output type
export type TFindSalesTicketData = {
  data: TFindSalesTicketInsideData[];
};

// ! 고객 티켓 검색: search output type
export type TFindSalesTicketOutput = {
  data: TFindSalesTicketData;
} & TOutput;

// ! 고객 정액권 검색: search input type
export type TFindSalesPasscardInput = {
  store_cd: string;
  cust_cd: string;
};

// ! 고객 정액권 검색 : search inside data type
export type TFindSalesPasscardInsideData = {
  store_cd: string;
  cust_cd: string;
  pass_dt: string;
  pass_seq: string;
  pass_cd: string;
  pass_reason: string;
  save_amt: string;
  increase_amt: string;
  remain_amt: number;
  exp_dt: string;
  service_discount: string;
  item_discount: string;
  memo: string;
  sale_dt: string;
  sale_seq: string;
  use_yn: string;
  reg_id: string;
  reg_dt: string;
  mod_id: string;
  mod_dt: string;
  pass_nm: string;
};

// ! 고객 정액권 검색: search output type
export type TFindSalesPasscardData = {
  data: TFindSalesPasscardInsideData[];
};

// ! 고객 정액권 검색: search output type
export type TFindSalesPasscardOutput = {
  data: TFindSalesPasscardData;
} & TOutput;

// ! 영업등록: create input type
export type TCreateSalesInput = {
  sale: {
    store_cd: string;
    sale_dt: string;
    temp_cust_yn: 'Y' | 'N'; // 임시 고객 여부
    cust_cd: string;
    cust_nm: string;
    hp_no: string;
    tot_qty: number;
    tot_amt: number;
    sts_gbn: 'Y' | 'R'; // Y: 정상, R: 환불
    book_dt: string;
    book_seq: string;
    temp_yn: 'Y' | 'N'; // 임시 저장 여부
    memo: string;
    reg_id: string;
  };
  details: {
    item_gbn: 'SERVICE' | 'PRODUCT' | 'TICKET' | 'PASSCARD' | 'PACKAGE'; // 패키지 확인필요
    item_cd: string;
    item_nm: string;
    sale_danga: number;
    sale_qty: number;
    sale_amt: number;
    memo: string;
    exp_dt: string;
    dc_gbn: string;
    dc_rt: number;
    dc_amt: number;
    service_discount: string;
    item_discount: string;
    point_dc_amt: number;
    pass_dc_amt: number;
    u_cust_cd: string;
    u_ticket_dt: string;
    u_ticket_seq: string;
    employees: {
      emp_amt_gbn: string; // S or other type
      emp_id: string;
      emp_nm: string;
      sale_amt: number;
    }[];
  }[];
  payments: {
    pay_dt: string;
    pay_gbn: string;
    pay_amt: number;
    rmk: string;
    u_cust_cd: string;
    u_pass_dt: string;
    u_pass_seq: string;
  }[];
};

// ! 영업등록: create output type
export type TCreateSalesOutput = {
  data: any;
} & TOutput;

// ! 판매메모변경 : modify input type
export type TModifyMemoSalesInput = {
  store_cd: string;
  sale_dt: string;
  sale_seq: string;
  memo: string;
  mod_id: string;
};

// ! 판매메모변경 : modify output type
export type TModifyMemoSalesOutput = TOutput;

// ! 미등록고객을 고객으로 전환 (신규) input type
export type TChangeNotRegisteredCustomerInput = {
  store_cd: string;
  sale_dt: string;
  sale_seq: number;
  cust_cd: string;
  cust_nm: string;
  mod_id: string;
};

// ! 미등록고객을 고객으로 전환 (신규) output type
export type TChangeNotRegisteredCustomerOutput = {
  data: null;
} & TOutput;

// ! 매출 합계 input type
export type TFindTotalSalesInput = {
  store_cd: string;
  start_dt: string;
  end_dt: string;
};

// ! 매출 합계 sale total type
export type TFindTotalSalesSaleTotal = {
  sales: {
    amt: number;
    cnt: number;
  };
  points: {
    amt: number;
    cnt: number;
  };
  refunds: {
    amt: number;
    cnt: number;
  };
  tickets: {
    amt: number;
    cnt: number;
  };
  tot_cnt: number;
  item_gbn: 'PRODUCT' | 'SERVICE' | 'PASSCARD' | 'TICKET' | '';
  passcards: {
    amt: number;
    cnt: number;
  };
};

// ! 매출 합계 data type
export type TFindTotalSalesData = {
  pay_total: {
    pay_gbn: string | null;
    unpaid_amt: number | null;
  };
  sale_amt: {
    sale_total_amt: number;
    sale_sub_total_amt: number;
  };
  saleTotal: TFindTotalSalesSaleTotal[];
}[];

// ! 매출 합계 output type
export type TFindTotalSalesOutput = {
  data: TFindTotalSalesData;
} & TOutput;

// ! 고객별 미수금 (신규) input type
export type TFindUnpaidCustomerInput = {
  store_cd: string;
  keyword: string;
  min_amt: number;
  use_yn: 'Y' | 'N';
  page_no: string;
  block_cnt: string;
  is_all_page: 'Y' | 'N';
};

// ! 고객별 미수금 (신규) inside data type
export type TFindUnpaidCustomerData = {
  store_cd: string;
  cust_cd: string;
  cust_nm: string;
  hp_no: string;
  tel_no: string;
  visit_time: string | null;
  remain_amt: string;
};

// ! 고객별 미수금 (신규) output type
export type TFindUnpaidCustomerOutput = {
  data: {
    paging: {
      total_cnt: number;
      total_page: number;
      page_no: number;
    };
    data: TFindUnpaidCustomerData[];
  };
};
