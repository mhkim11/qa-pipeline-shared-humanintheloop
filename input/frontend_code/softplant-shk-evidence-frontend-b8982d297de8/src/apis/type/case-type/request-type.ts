// ! 자료요청 목록 조회 Input Type
export type TRequestListInput = {
  civil_case_id: string;
  status?: string[] | string;
  target_type?: string[];
  requested_by?: string[];
  requested_at_from?: string;
  requested_at_to?: string;
  sort_by?: string;
  sort_order?: 'asc' | 'desc';
  page: number;
  limit: number;
};

// ! 자료요청 필터 옵션 조회 Output Type
export type TRequestFilterOptionsOutput = {
  status: string[];
  target_type: string[];
  requested_by: Array<{
    user_id: string;
    name: string;
  }>;
};

// ! 자료요청 수정 Input/Output Type
export type TRequestUpdateInput = {
  request_text: string;
  message_text?: string;
  client_name: string;
  client_email: string;
};

export type TRequestUpdateOutput = {
  success?: boolean;
  message?: string;
  result?: {
    request_id?: string;
  } | null;
};

// ! 자료요청 핀 토글 input/output
export type TRequestPinToggleInput = {
  civil_case_id: string;
  request_id: string;
};

export type TRequestPinToggleOutput = {
  success?: boolean;
  message?: string;
  data?: {
    isPinned?: boolean;
    is_pinned?: boolean;
  } | null;
  result?: {
    isPinned?: boolean;
    is_pinned?: boolean;
  } | null;
};

// ! 자료목록/숨긴자료 조회 Input Type
export type TRequestDocumentListInput = {
  evidence_request_id: string;
  evidence_category: 'RELEVANT' | 'IRRELEVANT';
  page: number;
  limit: number;
};

export type TRequestDocumentListOutput = {
  results: Array<Record<string, any>>;
  pagination?: {
    total: number;
    page: number;
    limit: number;
    pages: number;
  };
};

// ! 자료요청 목록 조회 Output Type
export type TRequestListOutput = {
  results: [
    {
      request_id: string;
      civil_case_id: string;
      project_id: string;
      request_text: string;
      requested_by: {
        user_id: string;
        name: string;
        nickname: string;
        thumbnail: string;
        color: string;
      };
      response_file: {
        file_id: string;
        file_name: string;
        file_url: string;
        file_type: string;
        file_size: number;
        file_created_at: string;
        file_updated_at: string;
      };
      status: string;
      is_response_read: boolean;
      created_at: string;
      updated_at: string;
    },
  ];
  pagination: {
    total: number;
    page: number;
    limit: number;
    pages: number;
  };
};

// ! 증거제출 요청 생성 Input Type
export type TRequestCreateInput = {
  civil_case_id: string;
  request_text: string;
  message_text: string;
  linked_image_url: string;
  client_email: string;
  client_name: string;
  assignee_id: string;
  target_type: string;
  target_id: string;
  files: File[];
};

// ! 증거제출 요청 생성 Output Type
export type TRequestCreateOutput = {
  result: {
    civil_case_id: string;
    project_id: string;
    office_id: string;
    request_text: string;
    requested_by_id: string;
    assignee_id: string;
    client_email: string;
    client_name: string;
    status: string;
    is_response_read: boolean;
    isActive: boolean;
    request_id: string;
    requested_at: string;
    createdAt: string;
    updatedAt: string;
  };
};

// ! 임시저장 요청 생성 input/output
export type TRequestDraftCreateInput = {
  civil_case_id: string;
  project_id: string;
  request_text: string;
  message_text?: string;
  client_name: string;
  client_email: string;
  target_type: 'CLIPPING' | 'MESSAGE';
  target_id: string;
  linked_image_url: string;
};

export type TRequestDraftCreateOutput = {
  result?: {
    request_id: string;
  } | null;
  data?: {
    result?: {
      request_id: string;
    };
  };
};

// ! 의뢰인 이메일 목록 조회 input/output
export type TRequestClientEmailListInput = {
  civil_case_id: string;
  search?: string;
};

export type TRequestClientEmailListOutput = {
  data?: {
    emails?: string[];
    results?: string[];
  };
  emails?: string[];
  results?: string[];
};

// ! 임시 요청 조회 (타겟 기준)
export type TRequestDraftByTargetInput = {
  target_type: 'CLIPPING' | 'MESSAGE';
  target_id: string;
};

export type TRequestDraftByTargetOutput = {
  result?: {
    request_id: string;
    request_text?: string;
    message_text?: string;
    client_name?: string;
    client_email?: string;
    linked_image_url?: string;
    target_type?: string;
    target_id?: string;
  } | null;
};

// ! 임시 요청 저장/전송 input/output
export type TRequestSendInput = {
  request_text: string;
  message_text: string;
  client_name: string;
  client_email: string;
  linked_image_url: string;
};

export type TRequestSendOutput = {
  success?: boolean;
  message?: string;
  result?: Record<string, any>;
};

// ! 증거요청 조회 상세 output type
export type TRequestDetailOutput = {
  result: {
    request_id: string;
    civil_case_id: string;
    project_id: string;
    request_text: string;
    requested_by: {
      user_id: string;
      name: string;
      nickname?: string;
      thumbnail?: string;
      color?: string;
    };
    assignee?: {
      user_id: string;
      name: string;
      nickname?: string;
      thumbnail?: string;
      color?: string;
    };
    response_file?: Record<string, any>;
    status: string;
    is_response_read: boolean;
    created_at: string;
    updated_at: string;
    requested_at?: string;
    initial_message?: {
      message_id: string;
      message_text: string;
      linked_image_url?: string;
      created_at?: string;
    };
    target_clipping?: {
      clipping_id: string;
      comment?: string;
      case_document_id: string;
      case_document_title: string;
      page_number: number;
    };
  };
};

// ! 증거요청 목록 조회 (클라이언트 용 output type)
export type TRequestListClientOutput = {
  results: [];
  pagination: {
    total: number;
    page: number;
    limit: number;
    pages: number;
  };
  status_counts: {
    WAITING: number;
    REVIEW_NEEDED: number;
    COMPLETED: number;
    CANCELLED: number;
    total: number;
  };
};

// !증거요청 조회 상세 (클라이언트 용 output type)
export type TRequestListClientDetailOutput = {
  request_id: string;
  civil_case_id: string;
  project_id: string;
  request_text: string;
  requested_by: {
    user_id: string;
    name: string;
    nickname?: string;
    thumbnail?: string;
    color?: string;
  };
  requested_at: string;
  assignee: {
    user_id: string;
    name: string;
    nickname?: string;
    thumbnail?: string;
    color?: string;
  };
  response_file?: Record<string, any>;
  status: string;
  is_response_read: boolean;
  created_at: string;
  updated_at: string;
  initial_message?: {
    message_id: string;
    message_text: string;
    linked_image_url?: string;
    created_at?: string;
  };
  target_clipping?: {
    clipping_id: string;
    comment?: string;
    case_document_id: string;
    case_document_title: string;
    page_number: number;
  };
};

// ! 메세지 생성 (변호사 용 input type)
export type TCreateLaywerRequestMessageInput = {
  message_text: string;
  linked_image_url: string;
  files: File[];
};

// ! 메세지 새로 작성 (변호사 용 output type)
export type TCreateLaywerRequestMessageOutput = {
  result: {
    evidence_request_id: string;
    sender_type: string;
    sender_id: string;
    message_text: string;
    linked_image_url: string;
    case_document_ids: string[];
    is_edited: boolean;
    office_id: string;
    project_id: string;
    civil_case_id: string;
    isActive: boolean;
    message_id: string;
    createdAt: string;
    updatedAt: string;
  };
};

// ! 요청 메세지 리스트 조회 (변호사/내부용)
export type TRequestMessageListOutput = {
  results: Array<{
    message_id: string;
    evidence_request_id?: string;
    sender_type?: string;
    sender?: {
      user_id: string;
      name: string;
    };
    created_by?: {
      user_id: string;
      name: string;
      nickname?: string;
      user_color?: string;
      thumbnail_url?: string;
    };
    message_text?: string;
    linked_image_url?: string;
    is_edited?: boolean;
    createdAt?: string;
    updatedAt?: string;
    created_at?: string;
    updated_at?: string;
  }>;
  pagination?: {
    total: number;
    page: number;
    limit: number;
    pages: number;
  };
};

// ! 메세지 임시저장 조회 input/output
export type TMessageDraftInput = {
  civil_case_id: string;
};

export type TMessageDraftOutput = {
  result?: {
    request_id: string;
    request_text?: string;
    message_text?: string;
    client_name?: string;
    client_email?: string;
    linked_image_url?: string;
    status?: string;
  } | null;
};

// ! 메세지 생성 (의뢰인용/비회원용)
export type TRequestCreateClientMessageInput = {
  message_text: string;
  linked_image_url: string;
  files: File[];
};

// ! 메세지 생성 (의뢰인용/비회원용) output type
export type TRequestCreateClientMessageOutput = {
  result: {
    evidence_request_id: string;
    sender_type: string;
    sender_client_email: string;
    sender_client_name: string;
    message_text: string;
    case_document_ids: string[];
    is_edited: boolean;
    office_id: string;
    project_id: string;
    civil_case_id: string;
    isActive: boolean;
    message_id: string;
    createdAt: string;
    updatedAt: string;
  };
};
