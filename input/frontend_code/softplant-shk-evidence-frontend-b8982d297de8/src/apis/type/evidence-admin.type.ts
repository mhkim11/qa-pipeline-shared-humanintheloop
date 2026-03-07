import { TOutput } from '@apis/type';

// !원본파일 리스트 검색: search input type

export type TFindEvidenceOriginalInput = {
  office_id: string;
  project_id: string;
  page_no: number;
  block_cnt: number;
};
// ! 원본파일 리스트: search inside data type
export type TFindEvidenceOriginalData = {
  files: {
    file_nm: string; // 파일명
    page_count: string; // 페이지 수
    original_file_nm: string; // 원본 파일명
    file_type: string; // 파일 유형 (예: "ORIGINAL")
    file_size: number; // 파일 크기 (바이트 단위)
    extension: string; // 파일 확장자 (예: "pdf")
    project_id: string; // 프로젝트 ID
    user_id: string; // 업로더 사용자 ID
    job_status: string; // 작업 상태 (예: "SUCCESS")

    isUploaded: boolean; // 업로드 상태 여부
    splitRequested: boolean; // 분할 요청 여부
    ocrRequested: boolean; // OCR 요청 여부
    ocr_completed_count: number; // OCR 완료 페이지 수
    file_id: string; // 파일 고유 ID
    createdAt: string; // 생성 시간 (ISO 8601 형식)
    user_nm: string; // 업로더 사용자명
    url: string; // 다운로드 URL
  }[];
  pagination: {
    total: number; // 전체 데이터 개수
    page: number; // 현재 페이지
    block_cnt: number; // 한 페이지의 데이터 개수
  };
};

// ! 증거 검색: search output type
export type TFindEvidenceOriginalOutput = {
  success: boolean; // API 호출 성공 여부
  message: string; // 응답 메시지
  data: TFindEvidenceOriginalData; // 파일 데이터 및 페이지 정보
} & TOutput;

// ! 사용자 업로드 파일명 수정 input type
export type TEvidenceOriginalFileNameInput = {
  project_id: string;
  file_id: string;
  new_file_nm: string;
};

// ! 사용자 업로드 파일명 수정 search inside data type
export type TEvidenceOriginalFileNameData = {
  job_status: string; // 작업 상태 (예: "SUCCESS")
  originalUrl: string; // 원본 파일 URL
  file_nm: string; // 파일명
  original_file_nm: string; // 원본 파일명
  file_type: string; // 파일 유형 (예: "ORIGINAL")
  file_size: number; // 파일 크기 (바이트 단위)
  page_count: number; // 페이지 수
  extension: string; // 파일 확장자 (예: "pdf")
  office_id: string; // 사무소 ID
  project_id: string; // 프로젝트 ID
  user_id: string; // 업로더 사용자 ID
  isActive: boolean; // 활성화 여부
  isUploaded: boolean; // 업로드 상태 여부
  splitRequested: boolean; // 분할 요청 여부
  ocrRequested: boolean; // OCR 요청 여부
  file_id: string; // 파일 고유 ID
  createdAt: string; // 생성 시간 (ISO 8601 형식)
  updatedAt: string; // 수정 시간 (ISO 8601 형식)
  splitRequestedAt: string; // 분할 요청 시간 (ISO 8601 형식)
  split_job_id: string; // 분할 작업 ID
};

// ! 사용자 업로드 파일명 수정 output type
export type TEvidenceOriginalFileNameOutput = {
  success: boolean; // API 호출 성공 여부
  message: string; // 응답 메시지
  data: TEvidenceOriginalFileNameData; // 파일 데이터
} & TOutput;

// ! 사용자 업로드 다운로드 input type
export type TEvidenceOriginalDownloadInput = {
  project_id: string;
  file_ids: string[];
};

// ! 사용자 업로드 다운로드 output type
export type TEvidenceOriginalDownloadOutput = {
  success: boolean; // API 호출 성공 여부
  message: string; // 응답 메시지
  data: [
    {
      file_id: string; // 파일 고유 ID
      file_nm: string; // 파일명
      url: string; // 다운로드 URL
    },
  ]; // 파일 데이터
} & TOutput;

// ! 페이지 분리 및 OCR결과 조회 input type
export type TEvidenceSplitOcrInput = {
  office_id: string;
  project_id: string;
  file_nm: string;
  page_no: number;
  block_cnt: number;
};

// ! 페이지 분리 및 OCR결과 조회 inside data type
export type TEvidenceSplitOcrData = {
  files: [
    {
      split_file_id: string; // 파일명
      split_file_url: string; // 파일 URL
      page_no: string; // 페이지 수
      ocrStatus: string; // OCR 상태 (예: "SUCCESS")
      createdAt: string; // 생성 시간 (ISO 8601 형식)
      ocr_file_url: string; // OCR 파일 URL
      file_url: string; // 원본 파일 URL
      file_nm: string; // 파일명
      pdf_path: string; // 파일 경로
      text_path: string; // 텍스트 경로
    },
  ];

  pagination: {
    total: number; // 전체 데이터 개수
    page: number; // 현재 페이지
    block_cnt: number; // 한 페이지의 데이터 개수
    total_pages: number; // 전체 페이지 수
  };
};

// ! 페이지 분리 및 OCR결과 조회 output type
export type TEvidenceSplitOcrOutput = {
  success: boolean; // API 호출 성공 여부
  message: string; // 응답 메시지
  data: TEvidenceSplitOcrData; // 파일 데이터 및 페이지 정보
} & TOutput;

// ! 어드민 증거목록 업로드 input type
export type TAdminUploadEvidenceInput = {
  office_id: string;
  project_id: string;
  file: File;
  upload_version: string | null;
};

// ! 어드민 증거목록 업로드 data type
export type TAdminUploadEvidenceData = {
  file: {
    file_id: string; // 파일명
    originalUrl: string; // 원본 파일 URL
  };
  upload: {
    writer: string; // 업로더 사용자 ID
    sequence_number: string; // 시퀀스 번호
    upload_id: string; // 업로드 ID
    project_id: string; // 프로젝트 ID
    office_id: string; // 사무실 ID
    file_id: string; // 업로드된 파일 ID
    status: string; // 업로드 상태 (예: "PENDING")
    uploaded_by: string; // 업로드한 사용자 ID
    total_items: number; // 총 항목 수
    processed_items: number; // 처리된 항목 수
    error_count: number; // 오류 개수
    isActive: boolean; // 활성화 여부
    _id: string; // MongoDB 문서 ID
    uploaded_at: string; // 업로드된 시간 (ISO 문자열)
    createdAt: string; // 생성 시간 (ISO 문자열)
    updatedAt: string; // 업데이트 시간 (ISO 문자열)
  };
  itemCount: number; // 전체 아이템 개수
};

// ! 어드민 증거목록 업로드 output type
export type TAdminUploadEvidenceOutput = {
  success: boolean; // API 호출 성공 여부
  message: string; // 응답 메시지
  data: TAdminUploadEvidenceData; // 파일 데이터
} & TOutput;

// ! 사이드 바 메뉴 리스트 가져오기 output type
export type TGetSideBarMenuListOutput = {
  success: boolean; // API 호출 성공 여부
  message: string; // 응답 메시지
  data: {
    list: {
      date: string; // 메뉴 ID
      requests: [
        {
          office_id: string; // 사무실 ID
          office_nm: string; // 사무실명
          project_id: string; // 프로젝트 ID
          project_nm: string; // 프로젝트명
          requested_at: string; // 요청 시간 (ISO 8601 형식)
        },
      ];
      pagination: {
        total: number; // 전체 데이터 개수
        page: number; // 현재 페이지
        block_cnt: number; // 한 페이지의 데이터 개수
        total_pages: number; // 전체 페이지 수
      };
    };
  }; // 사이드 바 메뉴 리스트
} & TOutput;

// ! 증거목록 항목 수정 input type
export type TModifyEvidenceItemInput = {
  office_id: string;
  project_id: string;
  evidence_id: string;
  evidence_title: string;
  evidence_number: string | number;
  page_count: string | number;
  end_page?: string | number;
  name: string;
  reference: string;
  status?: string;
  category: string;
  start_page: string | number;
};

// ! 증거목록 항목 수정 Data type
export type TModifyEvidenceItemData = {
  writer: string;
  sequence_number: string;
  upload_id: string;
  project_id: string;
  office_id: string;
  evidence_number: string | number;
  evidence_title: string;
  name: string;
  reference: string;
  category: string;
  start_page: string | number;
  page_count: string | number;
  end_page: string | number;
  missing_page_str: string;
  missing_pages: string[];
  missing_page_count: string;
  isActive: boolean;
  status: string;

  evidence_id: string;
  createdAt: string;
  updatedAt: string;
};

// ! 증거목록 항목 수정 output type
export type TModifyEvidenceItemOutput = {
  success: boolean; // API 호출 성공 여부
  message: string; // 응답 메시지
  data: TModifyEvidenceItemData; // 파일 데이터
} & TOutput;

// ! 매칭테이블 조회 input type
export type TFindMatchingListInput = {
  office_id: string;
  project_id: string;
  page_no: number | string;
  block_cnt: number | string;
  upload_version?: string | null;
};

// ! 매칭테이블 조회 inside data type
export type TFindMatchingListData = {
  items: {
    pdf_name: string;
    pdf_page: string;
    sequence_number: string;
    evidence_page: string;
    evidence_number: string;
    status: string;
    createdAt: string;
    matching_id: string;
    updatedAt: string;

    _id: string;
  }[];
  pagination: {
    total: number;
    page: number;
    block_cnt: number;
    total_pages: number; // 전체 페이지 수
  };
};

// ! 매칭테이블 조회 output type
export type TFindMatchingListOutput = {
  success: boolean; // API 호출 성공 여부
  message: string; // 응답 메시지
  data: TFindMatchingListData; // 파일 데이터
} & TOutput;

// ! 매칭테이블 수정 input type
export type TModifyMatchingItemInput = {
  office_id: string;
  project_id: string;
  matching_id: string;
  pdf_page: string;
  pdf_name: string;
  sequence_number: string;
  evidence_page: string;
  evidence_number: string;
};

// ! 매칭테이블 수정 data type
export type TModifyMatchingItemData = {
  _id: string;
  writer: string;

  upload_id: string;
  project_id: string;
  office_id: string;
  pdf_name: string;
  pdf_page: string;
  sequence_number: string;
  evidence_page: string;
  evidence_number: string;
  isActive: boolean;
  status: string;
  matching_id: string;
  createdAt: string;
  updatedAt: string;
};

// ! 매칭테이블 수정 output type
export type TModifyMatchingItemOutput = {
  success: boolean; // API 호출 성공 여부
  message: string; // 응답 메시지
  data: TModifyMatchingItemData; // 파일 데이터
} & TOutput;

// ! 어드민 메칭테이블 업로드 input type
export type TAdminUploadMatchingInput = {
  office_id: string;
  project_id: string;
  file: File;
  upload_version: string | null;
};

// ! 어드민 메칭테이블 업로드 data type
export type TAdminUploadMatchingData = {
  file: {
    file_id: string; // 파일명
    originalUrl: string; // 원본 파일 URL
  };
  upload: {
    writer: string; // 업로더 사용자 ID
    sequence_number: string; // 시퀀스 번호
    upload_id: string; // 업로드 ID
    project_id: string; // 프로젝트 ID
    office_id: string; // 사무실 ID
    file_id: string; // 업로드된 파일 ID
    status: string; // 업로드 상태 (예: "PENDING")
    uploaded_by: string; // 업로드한 사용자 ID
    total_items: number; // 총 항목 수
    processed_items: number; // 처리된 항목 수
    error_count: number; // 오류 개수
    isActive: boolean; // 활성화 여부
    _id: string; // MongoDB 문서 ID
    uploaded_at: string; // 업로드된 시간 (ISO 문자열)
    createdAt: string; // 생성 시간 (ISO 문자열)
    updatedAt: string; // 업데이트 시간 (ISO 문자열)
  };
  itemCount: number; // 전체 아이템 개수
};

// ! 어드민 메칭테이블 업로드 output type
export type TAdminUploadMatchingOutput = {
  success: boolean; // API 호출 성공 여부
  message: string; // 응답 메시지
  data: TAdminUploadMatchingData; // 파일 데이터
} & TOutput;

// ! 요약 결과 테이블 조회 input type
export type TFindSummaryResultListInput = {
  office_id: string;
  project_id: string;
  // page_no: number;
  block_cnt: number;
};

// ! 요약 결과 테이블 조회 inside data type

export type TFindSummaryListData = {
  items: {
    upload_id: string;
    evidence_number: string;
    status: 'NEW' | 'UPDATED' | 'UNCHANGED';
    content: string;
  }[];
  pagination: {
    total: number;
    page: number;
    block_cnt: number;
  };
};

// ! 요약 결과 조회 output type
export type TFindSummaryListOutput = {
  success: boolean;
  message: string;
  data: TFindSummaryListData;
} & TOutput;

// !분할파일 다운로드 input type
export type TDownloadSplitFileInput = {
  office_id: string;
  project_id: string;
  split_file_ids: string[];
};

// !분할파일 다운로드 output type
export type TDownloadSplitFileOutput = {
  success: boolean;
  message: string;
  data: [
    {
      split_file_id: string;
      split_file: {
        url: string;
        file_nm: string;
      };
      ocr_file: {
        url: string;
        file_nm: string;
      };
    },
  ];
} & TOutput;

// ! 증거원본 명칭 가져오기 output type
export type TGetEvidenceOriginalNameOutput = {
  success: boolean;
  message: string;
  data: {
    file_nm: string;
    file_id: string;
  }[];
} & TOutput;

// ! 요약파일 업로드 input type
export type TUploadSummaryFileInput = {
  office_id: string;
  project_id: string;
  file: File;
};
// ! 요약 테이블 초기화 input type
export type TResetSummaryTableInput = {
  office_id: string;
  project_id: string;
  limit: number; // 초기화할 증거의 개수, 필요에 따라 조정 가능
};

// ! 요약 테이블 초기화 output type
export type TResetSummaryTableOutput = {
  success: boolean;
  message: string;
  data: {
    success: string;
    message: string;
  };
} & TOutput;

// ! 요약파일 업로드 output type
export type TUploadSummaryFileOutput = {
  success: boolean;
  message: string;
} & TOutput;

// ! 요약 파일 다운로드 input type
export type TDownloadSummaryFileInput = {
  project_id: string;
};

// ! 요약 파일 다운로드 output type
export type TDownloadSummaryFileOutput = {
  success: boolean;
  message: string;
} & TOutput;

// !증거문서 생성 input type

export type TCreateEvidenceInput = {
  office_id: string;
  project_id: string;
  upload_version?: string | null;
};

// !증거문서 생성 output type
export type TCreateEvidenceOutput = {
  success: boolean;
  message: string;
  data: {
    job_id: string;
    message: string;
  };
} & TOutput;

// ! 증거문서 생성조회 input type
export type TFindCreateEvidenceInput = {
  office_id: string;
  project_id: string;
  page_no: number | string;
  block_cnt: number | string;
  keyword?: string;
  filters?: {
    evidence_title?: string[];
    category?: string[];
  };
  upload_version?: string | null;
};

// ! 증거문서 생성조회 output type
export type TFindCreateEvidenceOutput = {
  success: boolean;
  message: string;
  data: {
    items: Array<{
      evidence_number: string;
      evidence_title: string;
      name: string;
      reference: string;
      category: string;
      start_page: string;
      page_count: number;
      evidence_id: string;
      createdAt: string;
      updatedAt: string;
      pdf_path?: string;
      text_path?: string;
    }>;
    pagination: {
      total: number;
      page: number;
      block_cnt: number;
      total_pages: number;
    };
  };
};

// ! 사용자 증거문서에 반영 input type
export type TApplyEvidenceInput = {
  office_id: string;
  project_id: string;
  upload_version?: string | null;
};

// ! 사용자 증거문서에 반영 output type
export type TApplyEvidenceOutput = {
  success: boolean;
  message: string;
  data: {
    job_id: string;
    message: string;
  };
} & TOutput;

// ! 요약 증거문서에 반영 input type
export type TApplySummaryEvidenceInput = {
  office_id: string;
  project_id: string;
};

// ! 요약 증거문서에 반영 output type
export type TApplySummaryEvidenceOutput = {
  success: boolean;
  message: string;
  data: {
    job_id: string;
    message: string;
  };
} & TOutput;

// !증거원본 추가업로드 input type
export type TAddEvidenceOriginalInput = {
  office_id: string;
  project_id: string;
  file_nm: string;
  file: File;
};

// !증거원본 추가업로드 output type
export type TAddEvidenceOriginalOutput = {
  success: boolean;
  message: string;
} & TOutput;

// !문서보기 조회 input type
export type TViewAdminDocumentInput = {
  office_id: string;
  project_id: string;
  split_file_id: string;
  doc_type: string;
};

// !문서보기 조회 output type
export type TViewAdminDocumentOutput = {
  success: boolean;
  message: string;
  data: {
    url: string;
    filename: string;
  };
} & TOutput;

// ! 프로젝트 업로드 상태 조회
export type TFindProjectUploadStatusInput = {
  office_id: string;
  project_id: string;
  page_no: number;
  block_cnt: number;
};
export type TFindProjectUploadStatusOutput = {
  success: boolean;
  message: string;
  data: {
    matching_status: string; // 매칭 상태 (예: "PENDING", "SUCCESS", "FAIL")
    evidence_status: string; // 증거 상태 (예: "PENDING", "SUCCESS", "FAIL")
    has_split_files: boolean; // 분할 파일 여부
    has_summary_files: boolean; // 요약 파일 여부
    matching_active: boolean; // 매칭 활성화 여부
    summary_active: boolean; // 요약 활성화 여부
    evidence_active: boolean; // 증거 활성화 여부
  };
} & TOutput;

// ! 어드민 증거문서 PDF,TXT파일 보기 input type
export type TViewAdmimEvidenceFileInput = {
  office_id: string;
  project_id: string;
  evidence_id: string;
  doc_type: string;
};

// ! 증거목록 메모, 북마크, 핀고정 초기화 input type
export type TResetEvidenceItemInput = {
  office_id: string;
  project_id: string;
};

// ! 증거목록 메모, 북마크, 핀고정 초기화 output type
export type TResetEvidenceItemOutput = {
  success: boolean;
  message: string;
  data: {
    message: string;
  };
} & TOutput;

// ! 어드민 사건 목록 삭제 output type
export type TDeleteAdminCaseListOutput = {
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
    upload_lock: string;
    total_pages: number;
    total_missing_pages: number;
    total_evidences: number;
    missing_evidences: number;
    isActive: boolean;
    isPublic: string;
    project_id: string;
    createdAt: string;
    updatedAt: string;
  };
};

// ! 매칭테이블 생성된 증거문서의 파일 다운로드 input type
export type TDownloadEvidenceFileInput = {
  office_id: string;
  project_id: string;
  evidence_id: string;
};

// ! 매칭테이블 생성된 증거문서의 파일 다운로드 output type
export type TDownloadEvidenceFileOutput = {
  success: boolean;
  message: string;
  data: {
    url: string;
    filename: string;
  };
} & TOutput;

// ! 증거목록 테이블 초기화 input type
export type TResetEvidenceTableInput = {
  office_id: string;
  project_id: string;
  upload_version: string | null;
};

// ! 증거목록 테이블 초기화 output type
export type TResetEvidenceTableOutput = {
  success: boolean;
};

// ! 매칭테이블 초기화 input type
export type TResetMatchingTableInput = {
  office_id: string;
  project_id: string;
  upload_version: string | null;
};

// ! 매칭테이블 초기화 output type
export type TResetMatchingTableOutput = {
  success: boolean;
};

// ! 증거 원본 압출파일로 다운로드 input type
export type TDownloadEvidenceOriginalFileInput = {
  office_id: string;
  project_id: string;
  file_ids: string[];
};

// ! 매칭테이블 압축파일로 다운로드 input type
export type TDownloadMatchingFileInput = {
  office_id: string;
  project_id: string;
  evidence_ids: string[];
  doc_type: string; // 'pdf' or 'txt'
};

// ! 사건에 로펌 사용자 배정 input type
export type TAssignLawyerToCaseInput = {
  project_id: string;
  user_id: string;
};

// ! 사건에 로펌 사용자 배정 output type
export type TAssignLawyerToCaseOutput = {
  success: boolean;
  message: string;
  data: {
    message: string;
  };
} & TOutput;

// ! 해당 사건 조회 output type
export type TFindCaseOutput = {
  success: boolean;
  message: string;
  data: {
    _id: string;
    project_nm: string;
    description: string;
    created_by: string;
    office_id: string;
    members: {
      _id: string;
      email: string;
      name: string;
      user_id: string;
    }[];
    managers: {
      _id: string;
      email: string;
      name: string;
      user_id: string;
    }[];

    client_nm: string;
    status: string;
    total_pages: number;
    isActive: boolean;
    isPublic: string;
    project_id: string;
    createdAt: string;
    updatedAt: string;
    missing_evidences: number;
    total_evidences: number;
    total_missing_pages: number;
    files: [];
    uploadedFileCount: number;
  };
} & TOutput;

// ! 전체 사용자 조회 input type
export type TFindAllUserInput = {
  email: string;
  tel: string;
  name: string;
  role: string;
  phone: string;
  isActive: string;
  registrationStatus: string;
  office_id: string;
  page_no: number;
  block_cnt: number;
  certify_status: string;
  filters?: {
    office_nm?: string[];
    certify_status?: string[];
    project_request_count?: { min: number; max: number };
    project_join_count?: { min: number; max: number };
  };
};

// ! 전체 사용자 조회 output type
export type TFindAllUserOutput = {
  success: boolean;
  message: string;
  data: [
    {
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
      tokenVersion: number;
    },
    {
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
      reg_status: string;
      lastLogout: string;
      marketing_agree: string;
      user_id: string;
      isResign: boolean;
      mod_id: string;
      nickname: string;
      position: string;
      user_color: string;
      thumbnail: string;
      evi_display_cnt: string;
      font_size_rate: string;
      tokenVersion: number;
    },
  ];
} & TOutput;

// ! 전체 어드민 사건목록 조회 input type
export type TFindAllAdminCaseListInput = {
  page_no: number;
  block_cnt: number;
  keyword: string;
  isActive: boolean;
  sort_column: string;
  sort_direction: 'asc' | 'desc';
  filters: { summary_status?: string; ocr_remark?: string };
  isFinish: boolean;
};

// ! 전체 어드민 사건목록 조회 output type
export type TFindAllAdminCaseListOutput = {
  success: boolean;
  message: string;
  data: {
    projects: [
      {
        project_nm: string;
        ocr_status: string;
        ocr_remark?: string | null;
        description: string;
        created_by: string;
        office_id: string;
        members: [];
        payment_status: string;
        last_payment_date: string;
        payer_name: string;
        expire_date: string;
        original_upload_status: string;
        managers: [
          {
            _id: string;
            email: string;
            phone: string;
            name: string;
            user_color: string;
            thumbnail: string;
            user_id: string;
            thumbnail_url: string;
          },
        ];
        client_nm: string;
        status: string;
        upload_lock: string;
        total_pages: number;
        isActive: boolean;
        isPublic: string;
        project_id: string;
        createdAt: string;
        ocr_completed_pages: number;
        ocr_total_pages: number;
        updatedAt: string;
        uploadedFileCount: number;
        uploadedFiles: [
          {
            file_id: string;
            file_nm: string;
            original_file_nm: string;
            file_size: number;
            page_count: number;
            extension: string;
            createdAt: string;
          },
          {
            file_id: string;
            file_nm: string;
            original_file_nm: string;
            file_size: number;
            page_count: number;
            extension: string;
            createdAt: string;
          },
          {
            file_id: string;
            file_nm: string;
            original_file_nm: string;
            file_size: number;
            page_count: number;
            extension: string;
            createdAt: string;
          },
          {
            file_id: string;
            file_nm: string;
            original_file_nm: string;
            file_size: number;
            page_count: number;
            extension: string;
            createdAt: string;
          },
        ];
        office_nm: string;
        project_role: string;
        lawyers: string;
        statusOrder: number;
        roleOrder: number;
        created_date: string;
        join_status: null;
        join_status_text: string;
      },
    ];
    paging: {
      total_cnt: 476;
      total_page: 10;
      page_no: 1;
      block_cnt: 50;
    };
  };
};

// ! 전체사건 필터 갯수 output type
export type TGetAllCaseFilterCountOutput = {
  success: boolean;
  message: string;
  data: {
    unprocessed: number;
    waiting: number;
    processing: number;
    failed: number;
    completed: number;
    evidence_added: number;
    payment_pending: number;
  };
};

// ! 프로젝트 결제 상태 변경 input type
export type TChangeProjectPaymentStatusInput = {
  project_id: string;
  payment_status: string;
  expire_date: string;
};

// ! 프로젝트 결제 상태 변경 output type
export type TChangeProjectPaymentStatusOutput = {
  success: boolean;
  message: string;
};

// ! 날짜별 업로드 현황 목록 조회  input
export type TGetDailyUploadStatusListInput = {
  project_id: string;
};

// ! 날짜별 업로드 현황 목록 조회 output
export type TGetDailyUploadStatusListOutput = {
  success: true;
  message: string;
  data: {
    files: {
      file_id: string;
      file_nm: string;
      file_size: number;
      upload_version?: string;
      createdAt: string;
    }[];
    upload_version: string | null;
    file_count: number;
  }[];
};

// ! 어드민 비밀번호 변경
export type TChangeAdminPasswordInput = {
  email: string;
  newPassword: string;
};

// ! 어드민 비밀번호 변경 output type
export type TChangeAdminPasswordOutput = {
  success: boolean;
  message: string;
};

// !결제기능 사용 on-off input type
export type TChangePaymentFunctionInput = {
  free_payment_enabled: boolean;
  free_payment_end_date: string;
};

// !결제기능 사용 on-off output type
export type TChangePaymentFunctionOutput = {
  success: boolean;
  message: string;
};

// !결제 설정 조회 output type
export type TGetPaymentSettingsOutput = {
  success: boolean;
  message: string;
  data: {
    free_payment_enabled: boolean;
    free_payment_end_date: string | null;
    createdAt?: string;
    updatedAt?: string;
  };
};

// !OCR관리상태 변경 input type
export type TChangeOcrManagementStatusInput = {
  project_id: string;

  ocr_remark: string;
};

// !OCR관리상태 변경 output type
export type TChangeOcrManagementStatusOutput = {
  success: boolean;
  message: string;
};

// ! 전체 사용자 조회 필터 조회 input type
export type TGetAllUserFilterInput = {
  office_nm: string[];
  certify_status: string[];
  project_request_count: { min: number; max: number };
  project_join_count: { min: number; max: number };
};

// ! 전체 사용자 조회 필터 조회 output type
export type TGetAllUserFilterOutput = {
  success: true;
  message: string;
  data: {
    office_nm: string[]; // 사무실 이름 목록
    certify_status: string[]; // 인증 상태 목록
    project_request_count: { min: number; max: number }; // 프로젝트 요청 개수 범위
    project_join_count: { min: number; max: number }; // 프로젝트 참여 개수 범위
  };
};

// ! 증거문서 생성조회 필터 input type
export type TFindCreateEvidenceFilterInput = {
  office_id: string;
  project_id: string;
  filters: {
    evidence_title: string[];
    category: string[];
  };
  upload_version: string | null;
};

// ! 증거문서 생성조회 output type
export type TFindCreateEvidenceFilterOutput = {
  success: true;
  message: string;
  data: {
    evidence_title: string[];
    category: string[];
  };
};
