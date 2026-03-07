// ! 클리핑 폴더 생성 input
export type TCreateClippingFolderInput = {
  civil_case_id: string;
  name: string;
  description: string;
};
// ! 클리핑 폴더 생성 output
export type TCreateClippingFolderOutput = {
  success: boolean;
  message: string;
};

// !클리핑 폴더 수정 input
export type TUpdateClippingFolderInput = {
  name: string;
  description: string;
};

// !클리핑 폴더 수정 output
export type TUpdateClippingFolderOutput = {
  success: boolean;
  message: string;
};

// !클리핑 폴더 삭제 output
export type TDeleteClippingFolderOutput = {
  success: boolean;
  message: string;
};

// ! 클리핑 폴더 목록 조회 output
export type TGetClippingFolderListInput = {
  page: number;
  limit: number;
  civil_case_id: string;
};

export type TGetClippingFolderListOutput = {
  success: boolean;
  message: string;
  data: {
    folders: {
      id: string;
      name: string;
      description: string;
    }[];
  };
};

// ! 클리핑 생성 input
export type TCreateClippingInput = {
  case_document_id: string;
  clipping_folder_id: string;
  comment: string;
  initial_note: string;
  coordinate: string;
  page_number: number;
  attachment_url: string;
  attachment_name: string;
  clipping_type: string;
  importance_level: string;
  is_ai_generated: boolean;
  color: string;
  tags: string[];
  /** 클리핑 영역 이미지(선택): 백엔드가 multipart/form-data로 받는 경우 file 필드로 전송 */
  file?: File | null;
};

// ! 클리핑 생성 output
export type TCreateClippingOutput = {
  success: boolean;
  message: string;
  data: {
    case_document_id: string;
    clipping_folder_id: string;
    civil_case_id: string;
    project_id: string;
    office_id: string;
    comment: string;
    initial_note: string;
    coordinate: string;
    page_number: number;
    attachment_url: string;
    attachment_name: string;
    clipping_type: string;
    importance_level: string;
    color: string;
    tags: string[];
    is_ai_generated: boolean;
    created_by_id: string;
    isActive: true;
    clipping_id: string;
    createdAt: string;
    updatedAt: string;
  };
};

// ! 클리핑 생성 request wrapper
export type TCreateClippingRequest = {
  office_id: string;
  input: TCreateClippingInput;
};

// ! 클리핑 수정 input
export type TUpdateClippingInput = {
  comment: string;
  initial_note: string;
  coordinate: string;
  page_number: number;
  attachment_url: string;
  attachment_name: string;
  clipping_type: string;
  importance_level: string;
  clipping_folder_id: string;
  color: string;
  tags: string[];
};

// ! 클리핑 수정 output
export type TUpdateClippingOutput = {
  success: boolean;
  message: string;
  data: {
    case_document_id: string;
    clipping_folder_id: string;
    civil_case_id: string;
    project_id: string;
    office_id: string;
    comment: string;
    initial_note: string;
    coordinate: string;
    page_number: number;
    attachment_url: string;
    attachment_name: string;
    clipping_type: string;
    importance_level: string;
    color: string;
    tags: string[];
    is_ai_generated: boolean;
    created_by_id: string;
    isActive: true;
    clipping_id: string;
    createdAt: string;
    updatedAt: string;
  };
};

// ! 클리핑 수정 path/input wrapper
export type TUpdateClippingRequest = {
  clipping_id: string;
  input: TUpdateClippingInput;
};

// ! 클리핑 삭제 output
export type TDeleteClippingOutput = {
  success: boolean;
  message: string;
};

// ! 클리핑 삭제 input
export type TDeleteClippingInput = {
  clipping_id: string;
};

// ! 클리핑 전체 목록 조회 output 타입
export type TGetClippingListOutput = {
  success: boolean;
  message: string;
  data: {
    results: {
      clipping_id: string;
      case_document_id: string;
      clipping_folder_id: string;
      comment: string;
      // 클리핑 생성자(권한 체크용)
      created_by_id?: string;
      // 메모(노트): 최신 스펙은 단일 object
      // (호환) 구버전 대응을 위해 string/array도 허용
      notes: [
        {
          note_id: string;
          content: string;
          comment_count: number;
          created_at: string;
          updated_at: string;
          created_by: {
            user_id: string;
            name: string;
            nickname: string;
            user_color: string;
            thumbnail_url: string | null;
          };
        },
      ];
      created_by: {
        user_id: string;
        name: string;
        nickname: string;
        user_color: string;
        thumbnail_url: string | null;
      };
      /*     comments: {
        comment_id: string;
        content: string;
        created_at: string;
        updated_at: string;
        created_by: {
          user_id: string;
          name: string;
        };
      }[]; */
      coordinate: string;
      page_number: number;
      clipping_type: string;
      importance_level: string;
      color: string;
      tags: string[];
      is_ai_generated: boolean;
      created_at: string;
      updated_at: string;
      attachment_url: string;
      attachment_name: string;
      case_document: {
        case_document_id: string;
        title: string;
      };
    }[];
  };
};

// ! 클리핑 전체 목록 조회 input 타입
export type TGetClippingListInput = {
  page: number;
  limit: number;
  civil_case_id?: string;
  case_document_id?: string;
  clipping_folder_id?: string;
  /** 보기설정(작성자 필터): comma-separated ids */
  creator_ids?: string;
};

// ! 클리핑 태그별 목록 조회 input 타입
export type TGetClippingListByTagInput = {
  civil_case_id: string;
  tag: string;
  page: number;
  limit: number;
};

// ! 메모 추가 input 타입
export type TAddMemoInput = {
  content: string;
  mentioned_user_ids?: string[] | null;
};

// ! 메모 추가 output 타입
export type TAddMemoOutput = {
  success: boolean;
  message: string;
};

// ! 메모 수정 input 타입
export type TUpdateMemoInput = {
  content: string;
  mentioned_user_ids?: string[] | null;
};

// ! 메모 수정 output 타입
export type TUpdateMemoOutput = {
  success: boolean;
  message: string;
};

// ! 메모 삭제 output 타입
export type TDeleteMemoOutput = {
  success: boolean;
  message: string;
};

// !댓글 추가 input 타입
export type TAddCommentInput = {
  content: string;
};

// ! 댓글 추가 output 타입
export type TAddCommentOutput = {
  success: boolean;
  message: string;
};

// ! 댓글수정 input 타입
export type TUpdateCommentInput = {
  content: string;
};

// ! 댓글수정 output 타입
export type TUpdateCommentOutput = {
  success: boolean;
  message: string;
};

// ! 댓글삭제 output 타입
export type TDeleteCommentOutput = {
  success: boolean;
  message: string;
};

// ! 클리핑 메모(노트) 목록 조회 input 타입
export type TGetClippingNotesInput = {
  page: number;
  limit: number;
};

export type TGetClippingNotesOutput = {
  success: boolean;
  message: string;
  data: {
    results: {
      note_id: string;
      content: string;
      comment_count: number;
      created_at: string;
      updated_at: string;
      created_by: {
        user_id: string;
        name: string;
        nickname: string;
        user_color: string;
        thumbnail_url: string | null;
      };
    }[];
    page?: number;
    limit?: number;
    total?: number;
  };
};
