// ! 민사 사건 생성 input 타입
export type TCivilCaseCreateInput = {
  project_nm: string;
  client_nm: string;
  case_number: string;
  trial_level: number;
  description: string;
  is_plaintiff: boolean;
};

// ! 민사 사건 생성 output 타입
export type TCivilCaseCreateOutput = {
  success: boolean;
  message: string;
  data: {
    project_id: string;
    office_id: string;
    title: string;
    case_number: string;
    trial_level: number;
    description: string;
    is_plaintiff: boolean;
    isActive: boolean;
    civil_case_id: string;
    createdAt: string;
    updatedAt: string;
  };
};

// ! 업로드 output 타입
export type TCivilCaseUploadDocumentOutput = {
  success: boolean;
  message: string;
  data: {
    civil_case_id: string;
    project_id: string;
    office_id: string;
    title: string;
    document_type: string;
    is_plaintiff: boolean;
    ocr_step: string;
    ocr_status: string;
    chat_category: string;
    attachment_id: string;
    file_url: string;
    clipping_count: number;
    isActive: boolean;
    case_document_id: string;
    createdAt: string;
    updatedAt: string;
  };
};

// ! 의뢰인 문서 목록 조회 output 타입
export type TCivilPagination = {
  total: number;
  page: number;
  limit: number;
  pages: number;
};

export type TCivilCaseDocumentListOutput = {
  success: boolean;
  message: string;
  /** pagination info (new backend spec; optional for backward compatibility) */
  pagination?: TCivilPagination;
  data: {
    _id: string;
    civil_case_id: string;
    project_id: string;
    office_id: string;
    user_id: string;
    title: string;
    document_type: string;
    is_plaintiff: boolean;
    ocr_step: string;
    ocr_status: string;
    chat_category: string;
    document_date: string;
    file_url: string;
    clipping_count: number;
    isActive: boolean;
    case_document_id: string;
    createdAt: string;
    updatedAt: string;
    status: string;
    isPinned: boolean;
    customOrder: number | null;
    isBookmarked: boolean;
    bookmarkCount: number;
    tags: string[];
    note_count: number;
  }[];
};

// ! 문서보기 input 타입
export type TCivilCaseDocumentViewInput = {
  project_id: string;
  civil_case_id: string;
  case_document_id: string;
  doc_type: string;
};

// ! 문서보기 output 타입
export type TCivilCaseDocumentViewOutput = Blob;

// ! 문서 텍스트(간편검색) content output 타입
export type TCivilCaseDocumentContentItem = {
  page_number: number;
  description: string;
};

export type TCivilCaseDocumentContentOutput = {
  success?: boolean;
  message?: string;
  data?:
    | {
        content?: TCivilCaseDocumentContentItem[];
      }
    | TCivilCaseDocumentContentItem[];
  content?: TCivilCaseDocumentContentItem[];
};

// ! 문서 카테고리 분류 input/output 타입
export type TCivilCaseDocumentCategorizeInput = {
  case_document_id: string;
  evidence_category: 'RELEVANT' | 'IRRELEVANT';
};

export type TCivilCaseDocumentCategorizeOutput = {
  success: boolean;
  message: string;
};

// ! 문서 파싱 정보 수정 input/output 타입
export type TCivilCaseDocumentParsedInfoUpdateColumn =
  | 'parsed_case_number'
  | 'parsed_category'
  | 'parsed_sub_category'
  | 'parsed_submitter_type'
  | 'parsed_submitter_name'
  | 'parsed_document_number';

export type TCivilCaseDocumentParsedInfoUpdateInput = {
  case_document_id: string;
  update_column: TCivilCaseDocumentParsedInfoUpdateColumn;
  update_value: string;
};

export type TCivilCaseDocumentParsedInfoUpdateOutput = {
  success: boolean;
  message: string;
};

// ! 사건 문서 생성(업로드) input 타입
export type TCivilCaseDocumentCreateInput = {
  civil_case_id: string;
  file: File;
  title: string;
  document_type: string;
  is_plaintiff: boolean;
  source_type?: 'LAWYER' | 'CLIENT';
};

// ! 사건 문서 생성(업로드) output 타입
export type TCivilCaseDocumentCreateOutput = {
  success: boolean;
  message: string;
  data: {
    civil_case_id: string;
    project_id: string;
    office_id: string;
    user_id: string;
    title: string;
    document_type: string;
    is_plaintiff: boolean;
    ocr_step: string;
    ocr_status: string;
    chat_category: string;
    document_date: string;
    file_url: string;
    file_name: string;
    file_size: number;
    page_count: number;
    extension: string;
    isUploaded: boolean;
    uploadCompletedAt: string;
    upload_version: string;
    job_status: string;
    group_id: string;
    clipping_count: number;
    isActive: boolean;
    case_document_id: string;
    createdAt: string;
    updatedAt: string;
  };
};

// ! 문서 고정 input 타입
export type TCivilCaseDocumentPinInput = {
  civil_case_id: string;
  case_document_id: string;
};

// ! 문서 고정 output 타입
export type TCivilCaseDocumentPinOutput = {
  success: boolean;
  message: string;
  data: {
    isPinned: boolean;
  };
};

// ! 문서이동 (드래그앤드랍 이동) input 타입
export type TCivilCaseDocumentMoveInput = {
  civil_case_id: string;
  target_id: string;
  before_id: string;
  after_id: string;
};

// ! 문서이동 (드래그앤드랍 이동) output 타입
export type TCivilCaseDocumentMoveOutput = {
  success: boolean;
  message: string;
};

// ! 문서 북마크 추가 input 타입
export type TCivilCaseDocumentBookmarkAddInput = {
  civil_case_id: string;
  case_document_id: string;
};

// ! 문서 북마크 추가 output 타입
export type TCivilCaseDocumentBookmarkAddOutput = {
  success: boolean;
  message: string;
};

// ! 태그 셋 생성 input 타입
export type TCivilCaseDocumentTagSetCreateInput = {
  civil_case_id: string;
  tag_name: string;
  color: string;
};
// ! 태그 셋 생성 output 타입
export type TCivilCaseDocumentTagSetCreateOutput = {
  success: boolean;
  message: string;
  data: {
    tag_set_id: string;
    tag_name: string;
    color: string;
  };
};
// ! 태그셋 수정 input 타입
export type TCivilCaseDocumentTagSetUpdateInput = {
  tag_set_id: string;
  tag_name: string;
  color: string;
};
// ! 태그셋 수정 output 타입
export type TCivilCaseDocumentTagSetUpdateOutput = {
  success: boolean;
  message: string;
  data: {
    tag_set_id: string;
    tag_name: string;
    color: string;
  };
};

// ! 태그셋 삭제 input 타입
export type TCivilCaseDocumentTagSetDeleteInput = {
  tag_set_id: string;
};
// ! 태그셋 삭제 output 타입
export type TCivilCaseDocumentTagSetDeleteOutput = {
  success: boolean;
  message: string;
};

// ! 문서 태그 추가 input 타입
export type TCivilCaseDocumentTagAddInput = {
  civil_case_id: string;
  case_document_id: string;
  tags: { tag_set_id: string }[];
};
// ! 문서 태그 추가 output 타입
export type TCivilCaseDocumentTagAddOutput = {
  success: boolean;
  message: string;
};

// ! 태그삭제 input 타입
export type TCivilCaseDocumentTagDeleteInput = {
  tag_set_id: string;
};

// ! 문서 태그 삭제 output 타입
export type TCivilCaseDocumentTagDeleteOutput = {
  success: boolean;
  message: string;
};

// ! 태그 목록 조회 output 타입
export type TCivilCaseDocumentTagListOutput = {
  success: boolean;
  message: string;
  data: {
    tag_set_id: string;
    tag_name: string;
    color: string;
  }[];
};

// ! 문서의 메모 추가 input 타입
export type TCivilCaseDocumentMemoAddInput = {
  case_document_id: string;
  civil_case_id: string;
  content: string;
  mentioned_user_ids?: string[] | null;
};
// ! 문서의 메모 추가 output 타입
export type TCivilCaseDocumentMemoAddOutput = {
  success: boolean;
  message: string;
};

// ! 문서의 수정 메모 input 타입
export type TCivilCaseDocumentMemoUpdateInput = {
  memo_id: string;
  content: string;
  mentioned_user_ids?: string[] | null;
};
// ! 문서의 수정 메모 output 타입
export type TCivilCaseDocumentMemoUpdateOutput = {
  success: boolean;
  message: string;
};

// ! 문서의 메모 삭제 input 타입
export type TCivilCaseDocumentMemoDeleteInput = {
  memo_id: string;
};
// ! 문서의 메모 삭제 output 타입
export type TCivilCaseDocumentMemoDeleteOutput = {
  success: boolean;
  message: string;
};

// ! 문서별 메모 목록 조회 output 타입
export type TCivilCaseDocumentMemoListOutput = {
  success: boolean;
  message: string;
  data: {
    memo_id: string;
    case_document_id: string;
    civil_case_id: string;
    content: string;
    createdAt: string;
    updatedAt: string;
    user: {
      user_id: string;
      name: string;
      nickname: string;
      thumbnail: string;
      user_color?: string;
    };
  }[];
};
// ! 사건별 태그셋 목록 조회 output 타입
export type TCivilCaseDocumentTagSetListOutput = {
  success: boolean;
  message: string;
  data: {
    tag_set_id: string;
    tag_name: string;
    color: string;
  }[];
};

// ! 필터조회 output 타입
export type TCivilCaseFilterListOutput = {
  success: boolean;
  message: string;
  data: {
    parsed_category: string[];
    parsed_submitter_name: string[];
    tags: {
      tag_set_id: string;
      tag_name: string;
      color: string;
    }[];
  };
};
