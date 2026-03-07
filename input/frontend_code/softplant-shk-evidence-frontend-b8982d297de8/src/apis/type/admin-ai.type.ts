import { TOutput } from '@apis/type';

// ! 공통 카테고리 데이터 타입 (조회용)
export type TCommonCategoryData = {
  templates: [
    {
      category_nm: string;
      description: string;
      display_order: number;
      version: number;
      created_by: string;
      createdAt: string;
      updatedAt: string;
      category_template_id: string;
      menus_count: number;
    },
  ];
};

// ! 공통 카테고리 단일 데이터 타입 (생성/수정용)
export type TCommonCategorySingleData = {
  template: {
    category_nm: string;
    description: string;
    display_order: number;
    version: number;
    created_by: string;
    createdAt: string;
    updatedAt: string;
    category_template_id: string;
    menus_count: number;
  };
};

// ! 공통 카테고리 조회 타입
export type TGetCommonCategoryOutput = {
  success: true;
  message: string;
  data: TCommonCategoryData;
};

// ! 공통 카테고리 생성 타입
export type TCreateCommonCategoryInput = {
  category_nm: string;
  description: string;
};

// ! 공통 카테고리 생성 타입
export type TCreateCommonCategoryOutput = {
  success: boolean;
  message: string;
  data: TCommonCategorySingleData;
} & TOutput;

// ! 공통 카테고리 편집 타입
export type TEditCommonCategoryInput = {
  category_template_id: string;
  category_nm: string;
  isEnabled?: string | boolean; // string 또는 boolean 모두 허용
};

// ! 공통 카테고리 편집 타입
export type TEditCommonCategoryOutput = {
  success: boolean;
  message: string;
  data: TCommonCategorySingleData;
} & TOutput;

// ! 공통 카테고리 삭제 타입
export type TDeleteCommonCategoryInput = {
  category_template_id: string;
};

// ! 공통 하위메뉴 생성 타입
export type TCreateCommonSubMenuInput = {
  category_template_id: string;
  menu_nm: string;
  description: string;
};

// ! 공통 하위메뉴 생성 타입
export type TCreateCommonSubMenuOutput = {
  success: boolean;
  message: string;
  data: TCommonCategorySingleData;
} & TOutput;

// ! 공통 하위메뉴 편집 타입
export type TEditCommonSubMenuInput = {
  category_id: string;
  menu_id: string;
  menu_nm: string;
  isEnabled: boolean;
};

// ! 공통 템플릿 하위메뉴 편집 타입 (올바른 API 스펙)
export type TEditCommonTemplateSubMenuInput = {
  menu_template_id: string;
  menu_nm: string;
  isEnabled: boolean;
};

// ! 프로젝트 하위메뉴 편집 타입 (사건별 메뉴 수정용)
export type TEditProjectSubMenuInput = {
  menu_id: string;
  project_id: string;
  isEnabled: boolean;
};

// ! 공통 하위메뉴 편집 타입
export type TEditCommonSubMenuOutput = {
  success: boolean;
  message: string;
  data: TCommonCategorySingleData;
} & TOutput;

// ! 공통 하위 메뉴 조회 output 타입
export type TGetCommonSubMenuOutput = {
  success: boolean;
  message: string;
  data: TCommonCategoryData;
} & TOutput;
// ! 공통 카테고리 순서 변경 타입
export type TChangeCommonCategoryOrderInput = {
  templates: {
    display_order: number;
    category_template_id: string;
  }[];
};

// ! 공통 카테고리 순서 변경 타입
export type TChangeCommonCategoryOrderOutput = {
  success: boolean;
  message: string;
} & TOutput;

// ! 공통 하위메뉴 순서 변경 타입
export type TChangeCommonSubMenuOrderInput = {
  templates: {
    menu_template_id: string;
    display_order: number;
  }[];
};

// ! 공통 하위메뉴 순서 변경 타입
export type TChangeCommonSubMenuOrderOutput = {
  success: boolean;
  message: string;
} & TOutput;

// ! 사용자 분석메뉴 조회 타입
export type TGetUserAnalysisMenuOutput = {
  success: boolean;
  message: string;
  data: {
    project_id: string;
    category_nm: string;
    description: string;
    display_order: number;
    isEnabled: boolean;
    created_by: string;
    category_id: string;
    createdAt: string;
    updatedAt: string;
    menus_count: number;
  }[];
} & TOutput;

// ! AI 프로젝트 메뉴 업로드 input 타입
export type TUploadAIProjectMenuInput = {
  project_id: string;
  menu_id: string;
  file_nm: string;
  file: File;
};

// ! AI 프로젝트 메뉴 업로드 output 타입
export type TUploadAIProjectMenuOutput = {
  success: boolean;
  message: string;
  data: {
    file_id: string;
    file_nm: string;
    original_file_nm: string;
    created_at: string;
  };
} & TOutput;

// ! 사건별 카테고리 조회 타입
export interface IProjectCategory {
  category_id: string;
  project_id: string;
  deployment_id: string;
  category_nm: string;
  description: string;
  display_order: number;
  isEnabled: boolean | string;
  created_by: string;
  createdAt: string;
  updatedAt: string;
}

export type TGetProjectCategoryOutput = {
  success: boolean;
  message: string;
  data: IProjectCategory[];
};

// ! 사건 카테고리 수정 input 타입
export interface IEditProjectCategoryInput {
  project_id: string;
  category_id: string;
  isEnabled: boolean;
}

// ! 사건 카테고리 수정 output 타입
export interface IEditProjectCategoryOutput {
  success: boolean;
  message: string;
  data: IProjectCategory;
}
export interface ICreateSubMenuInput {
  category_template_id: string;
  menu_nm: string;
  description: string;
}

export interface ICreateSubMenuOutput {
  status: number;
  message: string;
  data: {
    submenu_id: string;
    category_template_id: string;
    menu_nm: string;
    description: string;
    created_at: string;
  };
}
export interface IAIMenuItem {
  id: string;
  name: string;
  icon?: string;
  subMenus?: IAIMenuItem[];
}

export interface IAIAnalysisMenuOutput {
  status: number;
  message: string;
  data: {
    menus: IAIMenuItem[];
  };
}

// ! 사건 하위메뉴 조회 타입
export interface IGetSubMenuInput {
  category_id: string;
  project_id: string;
}

export interface IGetSubMenuOutput {
  success: boolean;
  message: string;
  data: Array<{
    menu_id: string;
    category_id: string;
    project_id: string;
    menu_nm: string;
    description: string;
    display_order: number;
    isEnabled: boolean;
    has_file: boolean;
    file_nm?: string;
    file_path?: string;
    file_type?: string;
    created_by: string;
    createdAt: string;
    updatedAt: string;
  }>;
}

// ! 공통 하위메뉴 삭제 타입
export interface IDeleteSubMenuInput {
  menu_template_id: string;
}

export interface IDeleteSubMenuOutput {
  success: boolean;
  message: string;
}

// ! 프로젝트 배포 (템플릿- 사건별) 타입
export interface IDeployProjectTemplateOutput {
  success: boolean;
  message: string;
  data: {
    deployment: {
      deployment_id: string;
      category_templates: string[];
      menu_templates: string[];
      deployment_status: string;
      created_by: string;
      createdAt: string;
      updatedAt: string;
    };
  };
}

// ! 프로젝트 배포 (사용자) 타입
export interface IDeployProjectUserInput {
  project_id: string;
}

export interface IDeployProjectUserOutput {
  success: boolean;
  message: string;
  data: boolean; // 배포 성공 여부
}

// ! ai분석 버튼 On/off 타입
export interface IAIAnalysisToggleInput {
  ai_analysis: boolean;
}
export interface IAIAnalysisToggleOutput {
  success: boolean;
  message: string;
  data: {
    ai_analysis: boolean;
  };
}

// ! 설정조회output 타입
export interface IGetSettingsOutput {
  success: boolean;
  message: string;
  data: {
    ai_analysis: boolean;
    createdAt: string;
    updatedAt: string;
  };
}

// ! 파일 다운로드  input 타입
export interface IDownloadFileInput {
  project_id: string;
  menu_id: string;
}

// ! 파일 다운로드 output 타입
export interface IDownloadFileOutput {
  success: boolean;
  message: string;
  data: {
    file_id: string;
    file_nm: string;
    original_file_nm: string;
    file_path: string;
  } & TOutput;
}

// ! 사건별 ai분석 설정조회 타입
export interface IGetProjectAIAnalysisOutput {
  success: boolean;
  message: string;
  data: {
    ai_analysis: boolean;
  };
}

// 사건별 ai분석 설정 타입
export interface ISetProjectAIAnalysisInput {
  project_id: string;
  ai_analysis: boolean;
}

export interface ISetProjectAIAnalysisOutput {
  success: boolean;
  message: string;
}

// !공통 카테고리 삭제 타입
export interface IDeleteCommonCategoryInput {
  category_template_id: string;
}

export interface IDeleteCommonCategoryOutput {
  success: boolean;
  message: string;
}
