import { TOutput } from '@apis/type';

export type TSearchEvidencesInput = {
  project_id: string;
  searchQuery: { text: string; operator: 'AND' | 'OR' }[];
  page: number | string;
  limit: number | string;
  titleFilters: {
    type: string;
    text: string;
    operator: 'AND' | 'OR';
    field: string;
    caseSensitive: boolean;
  }[]; // 배열 형태로 수정
};

// ! 증거 검색: search inside data type
export type TFindEvidenceInsideData = {
  evidence_id: string;
  evidence_number: number;
  start_page: number;
  end_page: number;
  evidence_title: string;
  name: string;
  memos: [];
  bookmarks: [];

  isBookmarked: boolean;
  bookmarkCount: number;
  category: string;
  content: string;
  missing_page_count: number;
  score: number;
  ocr_text: string;
  highlights: string[];
  reference: string;
  hitAnalysis: {
    totalHits: number;
    hitsByField: Record<string, number>;
  };
};

// ! 증거 검색: search output type
export type TFindEvidenceData = {
  page: number | string;
  data: TFindEvidenceInsideData[];
  pagination: {
    total: number;
    page: number;
    limit: number;
    pages: number;
  };
};
export type TListEvidencesInput = {
  project_id: string;
  keyword: string;
  filters?: {
    name: string[];
    reference: string[];
    category: string[];
    summary?: string[];
    bookmark?: string[];
    memo?: string[];
    missing_page?: string[];
    tags?: string[];
    /**
     * 증거인부(의견) 필터
     * - UI에서는 '동의'/'부동의'를 사용하지만, 서버로는 'AGREE'/'DISAGREE' 등을 전달할 수 있음
     */
    opinion?: string[];
  };
  power_search?: string;
  not_contain?: string[];
  page: number | string;
  limit: number | string;
  sort_column?: string;
  sort_direction?: 'asc' | 'desc';
};

// ! DEMO: 증거 리스트 API (/evidences/demo/list)
// - /evidences/list 와 동일한 request/response shape
export type TListDemoEvidencesInput = TListEvidencesInput;

// ! 증거 검색: search inside data type
export type TListEvidenceInsideData = {
  _id: string;
  evidence_id: string;
  writer: string;
  project_id: string;
  evidence_number: number;
  created_by: string;
  start_page: number;
  end_page: number;
  page_count: number;
  has_missing_page: boolean;
  evidence_title: string;
  name: string;
  isBookmarked: boolean;
  category: string;
  missing_pages: [];
  missing_page_count: number;
  file_url: string;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
  reference: string;
  isPinned: boolean;
  sequence_number: number;
  summary_text: string;
  highlights: string[];
  hitAnalysis: {
    totalHits: number;
    hitsByField: Record<string, number>;
  };
  memos: [
    {
      user_id: string;
      content: string;
      memo_id: string;
      createdAt: string;
      updatedAt: string;
      user_nm: string;
      user_color: string;
      thumbnail_url: string;
      nickname: string;
    },
  ];

  bookmarks: [
    {
      user_id: string;
      isActive: boolean;
      bookmark_id: string;
      user_nm: string;
    },
  ];
  tags?: [
    {
      tag_id: string;
      tag_name: string;
      color: string;
    },
  ];
  opinions?: [
    {
      opinion_id: string;
      is_agreed: boolean;
      pages: string;
      content: string;
      user_id: string;
      user_nm: string;
      nickname: string;
      user_color: string;
      createdAt: string;
      updatedAt: string;
      thumbnail_url: string;
    },
  ];
};

// ! 증거 검색: search output type
export type TListEvidenceOutput = {
  data: {
    results: TListEvidenceInsideData[];
    pagination: {
      total: number;
      page: number;
      limit: number;
      pages: number;
    };
    project_info: {
      total_pages: number;
      total_missing_pages: string;
      total_evidences: number;
      missing_evidences: number;
    };
  };
} & TOutput;

// ! DEMO: 증거 리스트 API output (/evidences/demo/list)
export type TListDemoEvidenceOutput = TListEvidenceOutput;

// ! 증거 검색: search output type
export type TFindEvidenceOutput = {
  data: {
    results: TFindEvidenceInsideData[];
    isBookmarked: boolean;
    bookmarkCount: number;
    score: number;
    highlights: [
      {
        score: number;
        path: string;
        texts: [
          {
            value: string;
            type: string;
          },
        ];
      },
    ];
    hitAnalysis: {
      totalHits: number;
      hitsByField: Record<string, number>;
    };
    pagination: {
      total: number;
      page: number;
      limit: number;
      pages: number;
    };
  };
} & TOutput;

// ! 파워검색 input type
export type TPowerSearchInput = {
  project_id: string;
  power_search: string;
  not_contain?: string[];
  page: number | string;
  limit: number | string;
};

// ! 파워검색 output type
export type TPowerSearchOutput = {
  data: {
    results: TListEvidenceInsideData[];
    pagination: {
      total: number;
      page: number;
      limit: number;
      pages: number;
    };
  };
} & TOutput;

// ! 메모등록
export type TCreateEvidenceMemoInput = {
  project_id: string;
  evidence_id: string;
  content: string;
};
export type TCreateEvidenceMemoData = {
  evidence_id: string;
  user_id: string;
  project_id: string;
  content: string;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
  _id: string;
  __v: number;
};

export type TCreateEvidenceMemoOutput = {
  data: TCreateEvidenceMemoData;
} & TOutput;

// ! 메모수정
export type TModifyEvidenceMemoInput = {
  memo_id: string;
  content: string;
};
export type TModifyEvidenceMemoData = {
  _id: string;
  evidence_id: string;
  user_id: string;
  project_id: string;
  content: string;
  isActive: string;
  createdAt: string;
  updatedAt: string;
};

export type TModifyEvidenceMemoOutput = {
  data: TModifyEvidenceMemoData;
} & TOutput;

// ! 메모삭제
export type TDeleteEvidenceMemoInput = {
  memo_id: string;
};
export type TDeleteEvidenceMemoOutput = TOutput;

// ! 북마크

export type TCreateEvidenceBookMarkInput = {
  project_id: string;
  evidence_id: string;
};
export type TCreateEvidenceBookMarkData = {
  evidenceId: string;
  user_id: string;
  project_id: string;
  content: string;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
  _id: string;
  __v: number;
};

export type TCreateEvidenceBookMarkOutput = {
  data: TCreateEvidenceBookMarkData;
} & TOutput;

// ! 회원가입: create input type
export type TCreateEvidenceUserInput = {
  email: string;
  password: string;
  name: string;
  phone: string;
  marketing_agree: boolean;
  office_nm: string;
  birthdate: string;
  gender: string;
  registration_source: string;
  registration_source_other: string;
};

export type TCreateEvidenceUserData = {
  success: boolean;
  message: string;
  data: {
    message: string;
    user: {
      id: string;
      email: string;
      name: string;
      office_id: string;
    };
  };
};

// ! 개인도메인 회원가입
export type TCreateEvidenceUserDomainInput = {
  email: string;
  password: string;
  name: string;
  phone: string;
  marketing_agree: boolean;
  office_nm: string;
  is_new_office: boolean;
  is_internal: boolean;
  birthdate: string;
  gender: string;
  registration_source: string;
  registration_source_other: string;
};

export type TCreateEvidenceUserOutput = {
  data: TCreateEvidenceUserData;
} & TOutput;
// ! 전체 사건 목록 조회: input type
export type TListProjectInput = {
  page_no: number; // 페이지 번호
  block_cnt: number; // 블록당 요청 개수
  keyword: string; // 검색어
  isActive?: boolean; // 활성 여부
  assignedMe: boolean; // 나에게 할당된 사건만 조회 여부
  sort_column: string; // 정렬 컬럼
  isFinish: boolean; // 완료된 사건만 조회 여부
  sort_direction: 'asc' | 'desc'; // 정렬 방향
  filters: {
    status?: string[]; // 상태 필터
    project_role?: string[]; // 프로젝트 역할 필터
    lawyers?: string[]; // 변호사 필터
    project_nm?: string[]; // 프로젝트 이름 필터
    total_pages?: string[]; // 총 페이지 수 필터
    created_date?: string[]; // 생성 날짜 필터
  };
};
// ! 전체 사건 목록 조회: output type
export type TListProjectInsideData = {
  project_id: string;
  project_nm: string;
  join_status: string;
  description: string;
  has_active_subscription: boolean;
  expire_date: string;
  created_by: {
    _id: string;
    email: string;
    name: string;
  };
  office_id: string;
  office_nm: string;
  lawyers: string;
  isActive: boolean;
  isPublic: string;
  createdAt: string;
  updatedAt: string;
  client_nm: string;
  status: string;
  managers: {
    _id: string;
    email: string;
    name: string;
  }[];
  members: {
    _id: string;
    name: string;
  }[];
  total_pages: number;
  uploadedFileCount: number;
  uploadedFiles: {
    file_id: string;
    file_nm: string;
    file_size: number;
    extension: string;
    createdAt: string;
  }[];
  project_role: string;
  join_status_text: string;
  payment_status?: string;
};

export type TListProjectOutput = {
  data: {
    projects: TListProjectInsideData[];
    paging: {
      total_cnt: number;
      total_page: number;
      page_no: number;
      block_cnt: number;
    };
  };
} & TOutput;

// ! 권한요청 input type
export type TJoinProjectRequestInput = {
  projects: {
    project_id: string;
    requested_role: string;
  }[];
};

export type TJoinProjectRequestData = {
  success: boolean;
  message: string;
  data: {
    office_id: string;
    project_id: string;
    user_id: string;
    requested_role: string;
    status: string;
    _id: string;
    requested_at: string;
    createdAt: string;
    updatedAt: string;
    __v: number;
  };
  error: {
    message: string;
  };
};

export type TJoinProjectRequestOutput = {
  data: TJoinProjectRequestData;
} & TOutput;

// ! 프로젝트 생성 input type
export type TCreateProjectInput = {
  project_nm: string;
  description: string;
  client_nm: string;
  isPublic: string;
};

// ! 프로젝트 생성 output type
export type TCreateProjectOutput = {
  success: boolean;
  message: string;
  data: {
    project_id: string;
    project_nm: string;
    description: string;
    created_by: string;
    office_id: string;
    members: [];
    managers: string[];
    client_nm: string;
    status: string;
    total_pages: number;
    isActive: boolean;
    isPublic: 'Y' | 'N';
    _id: string;
    createdAt: string;
    updatedAt: string;
    __v: number;
  };
};
// ! a2d2에게 작업요청 input type
export type TRequestA2D2Input = {
  project_id: string;
  office_id: string;
};

// ! a2d2에게 작업요청 data type
export type TRequestA2D2Data = {
  project_id: string;
  office_id: string;
  requested_by: string;
  requested_at: string;
  request_id: string;
  date: string;
  createdAt: string;
  updatedAt: number;
};
// ! a2d2에게 작업요청 output type
export type TRequestA2D2Output = {
  success: boolean;
  message: string;
  data: TRequestA2D2Data;
} & TOutput;
// ! 권한 요청 목록 조회 Input Type
export type TJoinProjectRequestListInput = {
  page_no: number; // 페이지 번호
  block_cnt: number; // 블록당 요청 개수
  status: 'PENDING' | 'APPROVED' | 'REJECTED'; // 요청 상태
};

// ! 권한 요청 데이터 내부 타입
export type TJoinProjectRequestListData = {
  project_id: string; // 프로젝트 ID
  project_nm: string; // 프로젝트 이름
  client_nm: string; // 의뢰인 이름
  requested_role: string; // 요청된 역할
  status: 'PENDING' | 'APPROVED' | 'REJECTED'; // 요청 상태
  requested_at: string; // 요청 날짜 및 시간
  createdAt: string; // 생성일
  updatedAt: string; // 수정일
  request_id: string; // 요청 ID
  user: {
    _id: string; // 사용자 ID
    email: string; // 사용자 이메일
    name: string; // 사용자 이름
  };
};

// 권한 요청 목록 페이징 정보
export type TPagingData = {
  total_cnt: number; // 총 요청 수
  total_page: number; // 총 페이지 수
  page_no: number; // 현재 페이지 번호
  block_cnt: number; // 블록당 요청 개수
};

// !권한 요청 목록 조회 Output Type
export type TJoinProjectRequestListOutput = {
  success: boolean; // 요청 성공 여부
  message: string; // 응답 메시지
  data: {
    requests: TJoinProjectRequestListData[]; // 요청 목록 데이터
    paging: TPagingData; // 페이징 데이터
  };
} & TOutput;

// ! 사건 권한 요청 처리 Input Type
export type TProcessJoinRequestInput = {
  request_id: string; // 요청 ID
  status: 'APPROVED' | 'REJECTED'; // 요청 상태
};

// ! 사건 권한 요청 처리 Output Type
export type TProcessJoinRequestData = {
  _id: string; // 요청 ID
  office_id: string; // 사무실 ID
  project_id: string; // 프로젝트 ID
  user_id: string; // 사용자 ID
  requested_role: string; // 요청된 역할
  status: 'APPROVED' | 'REJECTED'; // 요청 상태
  requested_at: string; // 요청 시간
  createdAt: string; // 생성 시간
  updatedAt: string; // 수정 시간
  __v: number; // 버전
  processed_at: string; // 처리 시간
  processed_by: string; // 처리자 ID
};

export type TProcessJoinRequestOutput = {
  success: boolean; // 요청 성공 여부
  message: string; // 응답 메시지
  data: TProcessJoinRequestData; // 요청 처리 결과 데이터
} & TOutput;

// ! 파일업로드
export type TUploadFileInput = {
  project_id: string;
  file: File[];
  file_nm: string;
};
export type TUploadFileOutput = {
  success: boolean; // 업로드 성공 여부
  message: string; // 응답 메시지
  data: {
    originalUrl: string; // 파일의 원본 URL
    file_nm: string; // 업로드된 파일 이름
    original_file_nm: string; // 원본 파일 이름
    file_type: string; // 파일 유형 (e.g., "ORIGINAL")
    file_size: number; // 파일 크기 (바이트)
    page_count: number; // 페이지 수
    extension: string; // 파일 확장자
    office_id: string; // 사무실 ID
    project_id: string; // 프로젝트 ID
    user_id: string; // 업로드한 사용자 ID
    isActive: boolean; // 활성 상태
    isUploaded: boolean; // 업로드 완료 여부
    splitRequested: boolean; // 분할 요청 여부
    ocrRequested: boolean; // OCR 요청 여부
    file_id: string; // 파일 ID
    createdAt: string; // 생성 시간
    updatedAt: string; // 수정 시간
  };
};

// ! 읽지 않은 메시지 개수 조회 Output Type
export type TUnreadNotificationOutput = {
  success: boolean; // 요청 성공 여부
  message: string; // 응답 메시지
  data: {
    count: number; // 읽지 않은 메시지 개수
  };
} & TOutput;

// ! 메시지 목록 조회 Input Type

export type TListNotificationInput = {
  page_no?: string; // 페이지 번호
  block_cnt?: string; // 블록당 요청 개수
  isRead?: boolean; // 읽음 여부
};

// ! 메시지 목록 조회 Data Type
export type TListNotificationData = {
  notifications: {
    result: string; // 결과
    notification_id: string; // 알림 ID
    recipient: string; // 수신자 ID
    category: string; // 알림 카테고리
    type: string; // 알림 유형
    title: string; // 알림 제목
    message: string; // 알림 내용
    related_id: string; // 관련 ID
    isRead: boolean; // 읽음 여부
    office_id: string; // 사무실 ID
    createdAt: string; // 생성 시간
    project_id: string; // 프로젝트 ID
    project_nm: string; // 프로젝트 이름
    requested_role: string; // 요청된 역할
    is_super: boolean; // 사건관리자 여부 (true: 사건관리자, false: 일반사용자)
  }[];
  paging: {
    total_cnt: number; // 총 알림 개수
    total_page: number; // 총 페이지 수
    page_no: number; // 현재 페이지 번호
    block_cnt: number; // 블록당 요청 개수
  };
};

// 메시지 목록 조회 Output Type
export type TListNotificationOutput = {
  success: boolean; // 요청 성공 여부
  message: string; // 응답 메시지
  data: TListNotificationData; // 알림 목록 데이터
};

// ! 사건 목록 필터 조회 Input Type
export type TListProjectFilterInput = {
  keyword: string; // 검색어
  filters: { key: string[]; value: [] }; // 필터
  assignedMe: boolean; // 나에게 할당된 사건만 조회 여부
};

export type TListProjectFilterOutput = {
  success: boolean; // 요청 성공 여부
  message: string; // 응답 메시지
  data: {
    status: { value: string }[];
    project_role: { value: string }[];
    lawyers: { value: string }[];
    project_nm: { value: string }[];
    total_pages: { value: number }[];
    created_date: { value: string }[];
    client_nm: { value: string }[];
  };
};
// !증거 목록 필터 조회 Input Type
export type TListEvidenceFilterInput = {
  project_id: string; // 프로젝트 ID
  keyword: string; // 검색어
  filters: { key: string[]; value: [] }; // 필터
};

export type TListEvidenceFilterOutput = {
  success: boolean; // 요청 성공 여부
  message: string; // 응답 메시지
  data: {
    name: { value: string }[];
    reference: { value: string }[];
    category: { value: string }[];
    summary: { value: string }[];
    bookmark: { value: string }[];
    missing_page: { value: number }[];
    memo: { value: string }[];
    tags?: string[];
  };
};

// ! DEMO: 증거목록 필터 조회 (/evidences/demo/filter) - /evidences/filter 와 동일한 shape
export type TListDemoEvidenceFilterInput = TListEvidenceFilterInput;
export type TListDemoEvidenceFilterOutput = TListEvidenceFilterOutput;

// ! 패이지 분리 및 OCR 요청 Input Type
export type TSplitAndOcrRequestInput = {
  office_id: string; // 사무실 ID
  project_id: string; // 프로젝트 ID
};

// ! 패이지 분리 및 OCR 요청 Output Type
export type TSplitAndOcrRequestOutput = {
  success: boolean; // 요청 성공 여부
  message: string; // 응답 메시지
  data: {
    file_id: string; // 파일 ID
    file_nm: string; // 파일 이름
    file_size: number; // 파일 크기
    extension: string; // 파일 확장자
    page_count: number; // 페이지 수
    createdAt: string; // 생성 시간
    updatedAt: string; // 수정 시간
  };
} & TOutput;

// ! 어드민 증거목록 업로드 결과 리스트 input type
export type TUploadEvidenceListInput = {
  office_id: string;
  project_id: string;
  page_no: number;
  block_cnt: number;
  upload_version?: string | null;
};

// ! 어드민 증거목록 업로드 결과 리스트 data type
export type TUploadEvidenceListData = {
  items: [
    {
      writer: string;
      sequence_number: number;
      upload_id: string;
      evidence_number: number;
      evidence_title: string;
      name: string;
      reference: string;
      category: string;
      start_page: number;
      end_page: number;
      missing_page_str: number;
      missing_pages: [];
      missing_page_count: number;
      status: string;
      evidence_id: string;
      page_count: number;
      createdAt: string;
      updatedAt: string;
      uploaded_by: string;
      uploaded_at: string;
    },
  ];
  pagination: {
    total: number; // 총 알림 개수
    page: number; // 현재 페이지 번호
    block_cnt: number; // 블록당 요청 개수
    total_pages: number;
  };
};

// ! 어드민 증거목록 업로드 결과 리스트 output type
export type TUploadEvidenceListOutput = {
  success: boolean; // 요청 성공 여부
  message: string; // 응답 메시지
  data: TUploadEvidenceListData; // 알림 목록 데이터
  pagination: {
    total: number; // 총 알림 개수
    page: number; // 현재 페이지 번호
    block_cnt: number; // 블록당 요청 개수
    total_pages: number; // 총 페이지 수
  };
};

// ! 이메일 인증 메일 발송 input type
export type TSendAuthEmailInput = {
  email: string;
  name: string;
  successUrl: string;
  failUrl: string;
};

// ! 인증메일 발송 output type
export type TSendAuthEmailOutput = {
  success: boolean; // 요청 성공 여부
  message: string; // 응답 메시지
  data: {
    code_id: string; // 코드 ID
  };
};

// ! 이메일 인증발송 인증번호 방식으로 변경 input type
export type TSendAuthNumberEmailInput = {
  email: string;
  name: string;
};

// ! 이메일 인증번호 발송 output type
export type TSendAuthNumberEmailOutput = {
  success: boolean; // 요청 성공 여부
  message: string; // 응답 메시지
  data: {
    code_id: string; // 코드 ID
  };
};

// ! 이메일 인증처리 (변경) input type
export type TCheckAuthNumberEmailInput = {
  code_id: string;
  verify_code: string;
};

// ! 이메일 인증처리 (변경) output type
export type TCheckAuthNumberEmailOutput = {
  success: boolean; // 요청 성공 여부
  message: string; // 응답 메시지
  data: {
    code: string; // 이메일 인증 여부
    status: string; // 이메일 인증 상태
    name: string; // 이름
  };
};

// ! 이메일 인증 상태 확인 data type
export type TCheckAuthEmailData = {
  verified: boolean; // 이메일 인증 여부
  email: string; // 이메일
  reg_dt: string; // 등록일
  exp_dt: string; // 만료일
  office_nm: string; // 사무실 이름
  token: string; // 인증 토큰
};
// ! 이메일 인증 상태 확인 output type
export type TCheckAuthEmailOutput = {
  success: boolean; // 요청 성공 여부
  message: string; // 응답 메시지
  data: TCheckAuthEmailData; // 이메일 인증 상태 데이터
};

// ! 비밀번호 재설정 이메일요청 input type
export type TSendResetPasswordEmailInput = {
  email: string;
  successUrl: string;
  failUrl: string;
};
export type TSendResetPasswordEmailOutput = {
  success: boolean; // 요청 성공 여부
  message: string; // 응답 메시지
  data: {
    code_id: string; // 코드 ID
  };
};
// ! 비밀번호 재설정 input type
export type TResetPasswordInput = {
  token: string;
  newPassword: string;
};
export type TResetPasswordOutput = {
  success: boolean; // 요청 성공 여부
  message: string; // 응답 메시지
};

// ! 문서보기 input type
export type TViewDocumentInput = {
  office_id: string;
  project_id: string;
  evidence_id: string;
  doc_type: string;
};

// ! DEMO: 문서보기 input type (/evidences/demo/document) - /evidences/document 와 동일
export type TViewDemoDocumentInput = TViewDocumentInput;

// ! 문서 다운로드 input type
export type TDownloadDocumentInput = {
  office_id: string;
  project_id: string;
  evidence_id: string;
  doc_type: string;
};

// ! 문서다운로드 data type
export type TDownloadDocumentData = {
  url: string; // 파일 ID
  filename: string; // 파일 이름
};

// ! 문서보기 output type
export type TDownloadDocumentOutput = {
  success: boolean; // 요청 성공 여부
  message: string; // 응답 메시지 <p className='text-[#000] text-[20px] pt-2 font-normal lg:block hidden'>전체적인 비율과 취향에 딱 맞는 수술</p>
  data: TDownloadDocumentData; // 문서 데이터
};

// ! 히스토리 사용자 필터 조회 input type
export type TListHistoryUserFilterInput = {
  project_id: string;
};

// ! 히스토리 사용자 필터 조회 data type
export type TListHistoryUserFilterData = {
  user_id: string;
  user_nm: string;
  count: number;
  isMe: boolean;
  isManager: boolean;
  user_color: string;
  thumbnail: string;
  thumbnail_url: string;
  nickname: string;
};

// ! 히스토리 사용자 필터 조회 output type
export type TListHistoryUserFilterOutput = {
  success: boolean; // 요청 성공 여부
  message: string; // 응답 메시지
  data: TListHistoryUserFilterData[]; // 사용자 필터 목록 데이터
};

// ! 히스토리 목록 조회 input type
export type TListHistoryInput = {
  project_id: string;
  page_no: number;
  block_cnt: number;
  keyword: string;
  start_date: string;
  end_date: string;
  filters: {
    user_id: string[];
  };
};

// ✅ 히스토리 목록 조회 data type
export type TListHistoryData = {
  histories: Array<{
    office_id: string;
    project_id: string;
    ip: string;
    user_id: string;
    user_nm: string;
    category: string;
    type: string;
    content: string;
    reg_dt: string;
    history_id: string;
    title?: string;
    related_id?: string;
    prev_content: string; // 추가
    user_color: string; // 추가
    thumbnail_url: string; // 추가
    nickname: string; // 추가
  }>;
  pagination: {
    total: number; // 총 알림 개수
    page_no: number; // 총 페이지 수
    block_cnt: number; // 현재 페이지 번호
    total_pages: number; // 블록당 요청 개수
  };
};

// ! 히스토리 목록 조회 output type
export type TListHistoryOutput = {
  success: boolean; // 요청 성공 여부
  message: string; // 응답 메시지
  data: TListHistoryData; // 히스토리 목록 데이터
};

// ! 히스토리 액션 필터 조회 data type
export type TListHistoryActionFilterData = {
  category_id: string;
  category_nm: string;
  types: [
    {
      type: string;
    },
  ];
};
// ! 히스토리 액션 필터 조회 output type
export type TListHistoryActionFilterOutput = {
  success: boolean; // 요청 성공 여부
  message: string; // 응답 메시지
  data: TListHistoryActionFilterData[]; // 히스토리 액션 필터 목록 데이터
};

// ! 사용자 정보 조회 data type
export type TGetUserInfoData = {
  email: string;
  name: string;
  role: string;
  office_id: string;
  phone: string;
  marketing_agree: string;
  isActive: boolean;
  reg_status: string;
  emailVerified: boolean;
  user_id: string;
  createdAt: string;
  updatedAt: string;
  isResign: boolean;
  lastLogin: string;
  mod_id: string;
  nickname: string;
  user_color: string;
  office_nm: string;
  addr: string;
  addr_detail: string;
  position: string;
  thumbnail_url: string;
  thumbnail: string;
  evi_display_cnt: number;
  font_size_rate: number;
  birthdate?: string;
  certify_status?: string;
  licenseNumber?: string;
  issueNumber?: string;
};
export type TGetUserInfoOutput = {
  success: boolean;
  message: string;
  data: TGetUserInfoData;
};

// ! 사용자 정보 수정 input type
export type TUpdateUserInfoInput = {
  position?: string;
  nickname?: string;
  user_color?: string;
  font_size_rate?: number;
  thumbnail?: string;
  evi_display_cnt?: number;
  addr?: string;
  addr_detail?: string;
  licenseNumber?: string;
  issueNumber?: string;
  birthDate?: string;
  certify_status?: string;
};

// ! 사용자 정보 수정 output data type
export type TUpdateUserInfoData = {
  email: string;
  name: string;
  role: string;
  office_id: string;
  phone: string;
  marketing_agree: string;
  isResign: boolean;
  isActive: boolean;
  reg_status: string;
  emailVerified: boolean;
  user_id: string;
  createdAt: string;
  updatedAt: string;
  lastLogin: string;
  mod_id: string;
  nickname: string;
  user_color: string;
  position: string;
};

// ! 사용자 정보 수정 output type
export type TUpdateUserInfoOutput = {
  success: boolean;
  message: string;
  data: TUpdateUserInfoData;
};

// ! 사용자 로그인 전 회원가입 여부 data type
export type TCheckUserExistData = {
  exists: boolean;
  isActive: boolean;
  message: string;
};
export type TCheckUserExistOutput = {
  success: boolean;
  message: string;
  data: TCheckUserExistData;
};

// ! 사용자 사진 변경 input type
export type TUpdateUserPhotoInput = {
  file: File | null;
};

// ! 사용자 사진 변경 output data type
export type TUpdateUserPhotoData = {
  thumbnail: string;
};

// ! 사용자 사진 변경 output type
export type TUpdateUserPhotoOutput = {
  success: boolean;
  message: string;
  data: TUpdateUserPhotoData;
};

// ! 권한 멤버 조회, 멤버 추가 data type
export type TListProjectMemberData = {
  members: [
    {
      user_id: string;
      name: string;
      email: string;
      user_color: string;
      thumbnail_url: string;
      role: string;
      requestedSuper: boolean;
      nickname: string;
      isMe: string;
      request_id: string;
    },
  ];
  requests: [
    {
      user_id: string;
      name: string;
      email: string;
      user_color: string;
      thumbnail_url: string;
      requested_role: string;
      request_id: string;
      nickname: string;
    },
  ];
};

// ! 권한 멤버 조회, 멤버 추가 output type
export type TListProjectMemberOutput = {
  success: boolean;
  message: string;
  data: TListProjectMemberData;
};

// ! 증거목록 핀 토글 input type
export type TToggleEvidencePinInput = {
  evidence_id: string;
  project_id: string;
};

// ! 증거목록 핀 토글 output type
export type TToggleEvidencePinOutput = {
  success: boolean;
  message: string;
  data: {
    isPinned: boolean;
  };
};

// ! 필터 갯수 가져오기 output type
export type TGetFilterCountOutput = {
  success: boolean;
  message: string;
  data: {
    bookmark_cnt: number;
    memo_cnt: number;
    recent_cnt: number;
  };
};

// ! 사용자 이미지 초기화 data type
export type TInitUserPhotoData = {
  email: string;
  name: string;
  role: string;
  office_id: string;
  phone: string;
  tel: string;
  isActive: boolean;
  regId: string;
  registrationStatus: string;
  createdAt: string;
  updatedAt: string;
  __v: number;
  lastLogin: string;
  emailVerified: boolean;
  lastLogout: string;
  marketing_agree: string;
  user_id: string;
  isResign: boolean;
  nickname: string;
  user_color: string;
  position: string;
  thumbnail: string;
  thumbnail_url: string;
  evi_display_cnt: number;
  font_size_rate: number;
  mod_id: string;
};

// ! 사용자 이미지 초기화 output type
export type TInitUserPhotoOutput = {
  success: boolean;
  message: string;
  data: TInitUserPhotoData;
};

// ! 사건 멤버가 슈퍼권한 요청 input type
export type TRequestSuperPermissionInput = {
  project_id: string;
};

// ! 사건 멤버가 슈퍼권한 요청 output type
export type TRequestSuperPermissionOutput = {
  success: boolean;
  message: string;
  data: {
    office_id: string;
    project_id: string;
    user_id: string;
    project_nm: string;
    requested_role: string;
    user_nm: string;
    status: string;
    requested_at: string;
    request_id: string;
    createdAt: string;
    updatedAt: string;
  };
};

// ! 시건에서 나가기 input type
export type TExitProjectInput = {
  project_id: string;
};

// ! 시건에서 나가기 output type
export type TExitProjectOutput = {
  success: boolean;
  message: string;
  data: {
    project_nm: string;
    description: string;
    created_by: string;
    office_id: string;
    office_nm: string;
    members: string[];
    managers: string[];
    client_nm: string;
    status: string;
    total_pages: number;
    isActive: boolean;
    isPublic: string;
    project_id: string;
    createdAt: string;
    updatedAt: string;
  };
};

// ! 슈퍼권한 위임 input type
export type TDelegateSuperPermissionInput = {
  project_id: string;
  receiver_id: string;
};

// ! 슈퍼권한 위임 output type
export type TDelegateSuperPermissionOutput = {
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
    isActive: boolean;
    isPublic: string;
    project_id: string;
    createdAt: string;
    updatedAt: string;
  };
};

// ! 사건에서 제외시키기 input type
export type TExcludeProjectInput = {
  project_id: string;
  target_id: string;
};

// ! 사건에서 제외시키기 output type
export type TExcludeProjectOutput = {
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
    isActive: boolean;
    isPublic: string;
    project_id: string;
    createdAt: string;
    updatedAt: string;
  };
};

// ! 북마크한 문서 가져오기
export type TListBookmarkedEvidencesInput = {
  project_id: string;
  page: number;
  limit: number;
};

export type TListBookmarkedEvidencesData = {
  results: TListEvidenceInsideData[];
  pagination: {
    total: number;
    page: number;
    limit: number;
    pages: number;
  };
};

export type TListBookmarkedEvidencesOutput = {
  success: boolean;
  message: string;
  data: TListBookmarkedEvidencesData;
};

// ! 메모한 문서 가져오기
export type TListMemoedEvidencesInput = {
  project_id: string;
  page: number;
  limit: number;
};

// ! 메모한 문서 가져오기 data type
export type TListMemoedEvidencesData = {
  results: TListEvidenceInsideData[];
  pagination: {
    total: number;
    page: number;
    limit: number;
    pages: number;
  };
};

// ! 메모한 문서 가져오기 output type
export type TListMemoedEvidencesOutput = {
  success: boolean;
  message: string;
  data: TListMemoedEvidencesData;
};

// ! 최근 본 문서 가져오기
export type TListRecentEvidencesInput = {
  project_id: string;
  page: number;
  limit: number;
};

// ! 최근 본 문서 가져오기 data type
export type TListRecentEvidencesData = {
  results: TListEvidenceInsideData[];
  pagination: {
    total: number;
    page: number;
    limit: number;
    pages: number;
  };
};

// ! 최근 본 문서 가져오기 output type
export type TListRecentEvidencesOutput = {
  success: boolean;
  message: string;
  data: TListRecentEvidencesData;
};

// ! 증거목록 드래그앤 드랍 정렬 input type
export type TDragAndDropEvidenceInput = {
  project_id: string;
  target_id: string;
  after_id: string;
  before_id: string;
};

// ! 증거목록 드래그앤 드랍 정렬 output type
export type TDragAndDropEvidenceOutput = {
  success: boolean;
  message: string;
};

// ! 모든 알림 읽음 처리 output type
export type TReadAllNotificationOutput = {
  success: boolean;
  message: string;
  data: {
    acknowledged: boolean;
    modifiedCount: number;
    upsertedId: string;
    upsertedCount: number;
    matchedCount: number;
  };
};

// ! 사용자 퇴사 처리 input type
export type TResignUserInput = {
  project_id: string;
  user_id: string;
};

// ! 사용자 퇴사 처리 data type
export type TResignUserData = {
  email: string;
  name: string;
  role: string;
  office_id: string;
  phone: string;
  tel: string;
  marketing_agree: string;
  isActive: boolean;
  reg_id: string;
  reg_status: string;
  emailVerified: boolean;
  createdAt: string;
  updatedAt: string;
  __v: number;
  lastLogin: string;
  user_id: string;
  isResign: boolean;
  evi_display_cnt: string;
  font_size_rate: string;
  mod_id: string;
  nickname: string;
  position: string;
  thumbnail: string;
  user_color: string;
  resignDate: string;
};

// ! 사용자 퇴사 처리 output type
export type TResignUserOutput = {
  success: boolean;
  message: string;
  data: TResignUserData;
};

// ! 슈퍼권한 가진 사람이 퇴사하기 input type
export type TResignSuperUserInput = {
  project_id: string;
  receiver_id: string;
};

// ! 슈퍼권한 가진 사람이 퇴사하기 output type
export type TResignSuperUserOutput = {
  success: boolean;
  message: string;
  data: TResignUserData;
};

// ! 본인퇴사하기
export type TResignSelfInput = {
  project_id: string;
};

// ! 본인퇴사하기 output type
export type TResignSelfOutput = {
  success: boolean;
  message: string;
};

// ! 사건 편집
export type TEditProjectInput = {
  project_id: string;
  project_nm: string;
  description?: string;
  client_nm?: string;
};

export type TEditProjectOutput = {
  success: boolean;
  message: string;
  data: {
    project_nm: string;
    description: string;

    created_by: {
      marketing_agree: boolean;
      isResign: boolean;
      isActive: boolean;
      reg_status: string;
      emailVerified: boolean;
      tokenVersion: number;
      user_id: string;
    };
    isActive: boolean;
    createdAt: string;
    updatedAt: string;
    __v: number;
    project_id: string;
    office_id: string;
    client_nm: string;
    status: string;
    managers: string[];
    total_pages: number;
    members: string[];
    isPublic: string;
  };
};

// ! 이메일 인증 토큰 검증 output type
export type TVerifyEmailTokenOutput = {
  success: boolean;
  message: string;
};

// ! 사용자 비밀번호 변경 input type
export type TSettingPasswordInput = {
  password: string;
  new_password: string;
};

// ! 사용자 비밀번호 변경 output type
export type TSettingPasswordOutput = {
  success: boolean;
  message: string;
  error?: {
    code: string;
    status: number;
    name: string;
  };
};

// ! 히스토리 데이터 추가 input type
export type TAddHistoryInput = {
  project_id: string;
  type: string;
  evidence_id: string;
};

// ! 히스토리 데이터 추가 output type
export type TAddHistoryOutput = {
  success: boolean;
  message: string;
  data: {
    history_id: string;
    office_id: string;

    project_id: string;
    user_id: string;
    ip: string;
    category: string;
    type: string;
    title: string;
    related_id: string;
    content: string;
    isExternal: boolean;
    reg_dt: string;
  };
};

// ! 증거문서 추가 시 이메일 알림 전송 input type
export type TSendEmailNotificationInput = {
  project_id: string;
  file_ids: string[];
};

// ! 증거문서 추가 시 이메일 알림 전송 output type
export type TSendEmailNotificationOutput = {
  success: boolean;
  message: string;
};

// ! 로펌명 검색 : search input type
export type TSearchOfficeNmInput = {
  office_nm: string;
};

// ! 로펌명 검색 : search output type
export type TSearchOfficeNmOutput = {
  data: string[];
} & TOutput;

// !사건 초대기능 추가 input type
export type TAddProjectInvitationInput = {
  project_id: string;
  email: string;
  is_pre_paid: boolean;
};

// !사건 초대기능 추가 output type
export type TAddProjectInvitationOutput = {
  success: boolean;
  message: string;
  data: {
    office_id: string;
    project_id: string;
    project_nm: string;
    user_id: string;
    user_nm: string;
    requested_role: string;
    status: string;
    is_invite: boolean;
    request_id: string;
    requested_at: string;
    createdAt: string;
    updatedAt: string;
    is_pre_paid: boolean;
    is_invited: boolean;
  };
};

// ! 사건 초대 취소 input type
export type TCancelProjectInvitationInput = {
  request_id: string;
};

// ! 사건 초대 취소 output type
export type TCancelProjectInvitationOutput = {
  success: boolean;
  message: string;
};

// ! 사건 초대 거절 인풋 타입
export type TRejectProjectInvitationInput = {
  request_id: string;
};

// ! 사건 초대 거절 아웃풋 타입
export type TRejectProjectInvitationOutput = {
  success: boolean;
  message: string;
};

// ! 분석메뉴 클릭 로깅  output type
export type TClickAnalysisMenuOutput = {
  success: true;
  message: string;
  data: {
    event_id: string;
    project_id: string;
    click_count: number;
  };
};

// ! 분석메뉴 클릭 Today output type
export type TClickAnalysisMenuTodayOutput = {
  success: true;
  message: string;
  data: {
    today: number;
    total: number;
  };
};

// ! 변호사 인증 인풋 타입
export type TVerifyLawyerInput = {
  name: string;
  cardnum: string;
  birth: string;
  inputnum: string;
};

// ! 변호사 인증 아웃풋 타입
export type TVerifyLawyerOutput = {
  success: boolean;
  message: string;
  data: {
    verified: boolean;
    message: string;
    data: {
      name: string;
      cardnum: string;
      birth: string;
      inputnum: string;
    };
  };
};

// ! 인증상태 업데이트 인풋 타입
export type TUpdateCertificationStatusInput = {
  certify_status: string;
};

// ! 인증상태 업데이트 아웃풋 타입
export type TUpdateCertificationStatusOutput = {
  success: boolean;
  message: string;
  data: {
    user_id: string;
    certify_status: string;
  };
};

// ! 결제관리 내의 사건목록 가져오기 인풋 타입
export type TGetProjectListForPaymentManagementInput = {
  page_no: number;
  block_cnt: number;
  filters: {
    project_nm?: string[];
    client_nm?: string[];
    project_id?: string[];
    project_role?: string[];
    lawyers?: string[];
    status?: string[];
    created_date?: string[];
  };
};

// ! 결제관리 내의 사건목록 가져오기 아웃풋 타입
export type TGetProjectListForPaymentManagementOutput = {
  success: true;
  message: string;
  data: {
    projects: {
      project_nm: string;
      status: string;
      project_id: string;
      project_role: string;
      has_subscription: boolean;
      subscription_amount: number;
      createdAt?: string;
    }[];
    paging: {
      total_cnt: number;
      total_page: number;
      page_no: number;
      block_cnt: number;
    };
  };
};

// ! 증거목록 태그 생성 인풋 타입
export type TCreateEvidenceTagInput = {
  tag_name: string;
  color: string;
  project_id: string;
};
// ! 증거목록 태그 생성 아웃풋 타입
export type TCreateEvidenceTagOutput = {
  success: boolean;
  message: string;
  data: {
    tag_name: string;
    color: string;
    project_id: string;
    sort_order: number;
    isActive: boolean;
    tag_set_id: string;
    createdAt: string;
    updatedAt: string;
  };
};

// ! 태그 수정 인풋 타입
export type TUpdateEvidenceTagInput = {
  tag_set_id: string;
  tag_name: string;
  color: string;
};

// ! 태그 수정 아웃풋 타입
export type TUpdateEvidenceTagOutput = {
  success: boolean;
  message: string;
};

// ! 태그 삭제 인풋 타입
export type TDeleteEvidenceTagSetInput = {
  tag_set_id: string;
};

// ! 태그 삭제 아웃풋 타입
export type TDeleteEvidenceTagSetOutput = {
  success: boolean;
  message: string;
};

// ! 태그 상세조회 인풋 타입
export type TGetEvidenceTagInput = {
  tag_id: string;
};

// ! 태그 상세조회 아웃풋 타입
export type TGetEvidenceTagOutput = {
  success: boolean;
  message: string;
  data: {
    tag_id: string;
    tag_name: string;
    color: string;
    project_id: string;
    created_at?: string;
    updated_at?: string;
  };
};

// ! 태그 목록조회 인풋 타입
export type TListEvidenceTagsInput = {
  project_id: string;
};

// ! 태그 목록조회 아웃풋 타입
export type TListEvidenceTagsOutput = {
  success: boolean;
  message: string;
  data: {
    _id: string;
    tag_name: string;
    color: string;
    project_id: string;
    sort_order: number;
    isActive: boolean;
    tag_set_id: string;
    createdAt: string;
    updatedAt: string;
  }[];
};

// ! 태그 목록조회 아웃풋 타입 (프로젝트별 고유 태그 - distinct)
export type TListEvidenceTagsDistinctOutput = {
  success: boolean;
  message: string;
  data: {
    tag_name: string;
    color: string;
    count: number;
    first_created: string;
  }[];
};
// ! 태그 정렬 순서 변경 인풋 타입
export type TUpdateEvidenceTagOrderInput = {
  project_id: string;
  sort_order_data: [
    {
      tag_set_id: string;
      sort_order: number;
    },
  ];
};

// ! 태그 정렬 순서 변경 아웃풋 타입
export type TUpdateEvidenceTagOrderOutput = {
  success: boolean;
  message: string;
};

// ! 증거목록에 태그 할당 인풋 타입
export type TAssignEvidenceTagInput = {
  evidence_id: string;
  project_id: string;
  tags: string[];
};

// ! 증거목록에 태그 할당 아웃풋 타입
export type TAssignEvidenceTagOutput = {
  success: boolean;
  message: string;
};

// ! 증거목록에 태그 삭제 인풋 타입
export type TDeleteEvidenceTagInput = {
  tag_id: string;
};

// ! 증거목록에 태그 삭제 아웃풋 타입
export type TDeleteEvidenceTagOutput = {
  success: boolean;
  message: string;
};

// !프로젝트별 사용중인 태그 목록 조회 아웃풋 타입
export type TListEvidenceTagsProjectDistinctOutput = {
  success: boolean;
  message: string;
  data: {
    tag_id: string;
    tag_name: string;
    color: string;
  }[];
};

// ! 증거인부 등록 input type
export type TRegisterEvidenceInput = {
  project_id: string;
  evidence_id: string;
  is_agreed: boolean; // 동의 , 부동의 여부
  pages: string; // 쪽수 (예: "1-11")
  content: string; // 의견
};

// ! 증거인부 등록 output type
export type TRegisterEvidenceOutput = {
  success: boolean;
  message: string;
  data: {
    evidence_id: string;
    user_id: string;
    project_id: string;
    is_agreed: boolean;
    pages: string | number;
    content: string;
    isActive: boolean;
    opinion_id: string;
    createdAt: string;
    updatedAt: string;
  };
};

// ! 증거인부 수정 input type
export type TUpdateEvidenceInput = {
  project_id: string;
  opinion_id: string;
  is_agreed: boolean; // 동의 , 부동의 여부
  pages: string; // 쪽수 (예: "1-11")
  content: string; // 의견
};

// ! 증거인부 수정 output type
export type TUpdateEvidenceOutput = {
  success: boolean;
  message: string;
  data: {
    evidence_id: string;
    user_id: string;
    project_id: string;
    is_agreed: boolean;
    pages: string | number;
    content: string;
    isActive: boolean;
    opinion_id: string;
    createdAt: string;
    updatedAt: string;
  };
};

// ! 증거인부 목록조회 input type
export type TListEvidenceOpinionInput = {
  project_id: string;
  page_no: number;
  block_cnt: number;
};

// ! 증거인부 목록조회 output type
export type TListEvidenceOpinionOutput = {
  success: boolean;
  message: string;
  data: {
    list: {
      evidence_id: string;
      user_id: string;
      project_id: string;
      user_nm?: string;
      nickname?: string;
      user_color?: string;
      thumbnail_url?: string;
      is_agreed: boolean;
      pages: string | number;
      content: string;
      opinion_id: string;
      createdAt: string;
      updatedAt: string;
      evidence: {
        evidence_id: string;
        evidence_number: number;
        evidence_title: string;
      };
    }[];
    paging: {
      total_cnt: number;
      total_page: number;
      page_no: number;
      block_cnt: number;
    };
  };
};
