import { AxiosError as _AxiosError } from 'axios';

import { authClient } from '@apis/index';
import type {
  TGetCommonCategoryOutput,
  TCreateCommonCategoryInput,
  TCreateCommonCategoryOutput,
  TEditCommonCategoryInput,
  TEditCommonCategoryOutput,
  TCreateCommonSubMenuInput,
  TCreateCommonSubMenuOutput,
  TEditCommonSubMenuInput,
  TEditCommonSubMenuOutput,
  TEditCommonTemplateSubMenuInput,
  TEditProjectSubMenuInput,
  TGetCommonSubMenuOutput,
  TChangeCommonCategoryOrderInput,
  TChangeCommonCategoryOrderOutput,
  TGetUserAnalysisMenuOutput,
  TUploadAIProjectMenuInput,
  // TUploadAIProjectMenuOutput,
  TGetProjectCategoryOutput,
  IEditProjectCategoryInput,
  IEditProjectCategoryOutput,
  ICreateSubMenuInput,
  ICreateSubMenuOutput,
  IAIAnalysisMenuOutput,
  IGetSubMenuInput,
  IGetSubMenuOutput,
  TChangeCommonSubMenuOrderInput,
  TChangeCommonSubMenuOrderOutput,
  IDeleteSubMenuInput,
  IDeleteSubMenuOutput,
  IDeployProjectTemplateOutput,
  IDeployProjectUserInput,
  IDeployProjectUserOutput,
  IAIAnalysisToggleInput,
  IAIAnalysisToggleOutput,
  IGetSettingsOutput,
  IDownloadFileInput,
  IGetProjectAIAnalysisOutput,
  ISetProjectAIAnalysisInput,
  ISetProjectAIAnalysisOutput,
  IDeleteCommonCategoryInput,
  IDeleteCommonCategoryOutput,
} from '@apis/type/admin-ai.type';

type TAdminAiQueryKey = {
  GET_COMMON_CATEGORY: 'GET_COMMON_CATEGORY';
  CREATE_COMMON_CATEGORY: 'CREATE_COMMON_CATEGORY';
  EDIT_COMMON_CATEGORY: 'EDIT_COMMON_CATEGORY';
  CREATE_COMMON_SUB_MENU: 'CREATE_COMMON_SUB_MENU';
  EDIT_COMMON_SUB_MENU: 'EDIT_COMMON_SUB_MENU';
  EDIT_COMMON_TEMPLATE_SUB_MENU: 'EDIT_COMMON_TEMPLATE_SUB_MENU';
  GET_COMMON_SUB_MENU: 'GET_COMMON_SUB_MENU';
  CHANGE_COMMON_CATEGORY_ORDER: 'CHANGE_COMMON_CATEGORY_ORDER';
  GET_USER_ANALYSIS_MENU: 'GET_USER_ANALYSIS_MENU';
  GET_PROJECT_CATEGORY: 'GET_PROJECT_CATEGORY';
  EDIT_PROJECT_CATEGORY: 'EDIT_PROJECT_CATEGORY';
  GET_SUB_MENU: 'GET_SUB_MENU';
  UPLOAD_AI_PROJECT_MENU: 'UPLOAD_AI_PROJECT_MENU';
  CHANGE_COMMON_SUB_MENU_ORDER: 'CHANGE_COMMON_SUB_MENU_ORDER';
  DELETE_COMMON_SUB_MENU: 'DELETE_COMMON_SUB_MENU';
  DEPLOY_PROJECT_TEMPLATE: 'DEPLOY_PROJECT_TEMPLATE';
  DEPLOY_PROJECT_USER: 'DEPLOY_PROJECT_USER';
  GET_SETTINGS: 'GET_SETTINGS';
  TOGGLE_AI_ANALYSIS: 'TOGGLE_AI_ANALYSIS';
  DOWNLOAD_FILE: 'DOWNLOAD_FILE';
  GET_PROJECT_AI_ANALYSIS: 'GET_PROJECT_AI_ANALYSIS';
  SET_PROJECT_AI_ANALYSIS: 'SET_PROJECT_AI_ANALYSIS';
  DELETE_COMMON_CATEGORY: 'DELETE_COMMON_CATEGORY';
};
type TAdminAiRouteKey = {
  GET_COMMON_CATEGORY: '/ai/template/category';
  CREATE_COMMON_CATEGORY: '/ai/template/category/create';
  EDIT_COMMON_CATEGORY: '/ai/template/category/modify';

  CREATE_COMMON_SUB_MENU: '/ai/template/menu/create';
  EDIT_COMMON_SUB_MENU: '/ai/project/menu/modify';
  EDIT_COMMON_TEMPLATE_SUB_MENU: '/ai/template/menu/modify';
  GET_COMMON_SUB_MENU: '/ai/template/menu/:category_template_id';
  CHANGE_COMMON_CATEGORY_ORDER: '/ai/template/category/reorder';
  GET_USER_ANALYSIS_MENU: '/ai/category/:project_id';
  GET_PROJECT_CATEGORY: '/ai/project/category/:project_id';
  EDIT_PROJECT_CATEGORY: '/ai/project/category/modify';
  GET_SUB_MENU: '/ai/project/menus';
  UPLOAD_AI_PROJECT_MENU: '/ai/project/menu/upload';
  CHANGE_COMMON_SUB_MENU_ORDER: '/ai/template/menu/reorder/:category_template_id';
  DELETE_COMMON_SUB_MENU: '/ai/template/menu/delete';
  DEPLOY_PROJECT_TEMPLATE: '/ai/template/deploy';
  DEPLOY_PROJECT_USER: '/ai/project/deploy';
  TOGGLE_AI_ANALYSIS: '/admin/setting/ai-analysis';
  GET_SETTINGS: '/admin/setting';
  DOWNLOAD_FILE: 'ai/project/menu/download';
  GET_PROJECT_AI_ANALYSIS: '/ai/project/setting/ai-analysis/:project_id';
  SET_PROJECT_AI_ANALYSIS: '/ai/project/setting/ai-analysis';
  DELETE_COMMON_CATEGORY: '/ai/template/category/delete';
};

export const ADMIN_AI_QUERY_KEY: TAdminAiQueryKey = {
  GET_COMMON_CATEGORY: 'GET_COMMON_CATEGORY',
  CREATE_COMMON_CATEGORY: 'CREATE_COMMON_CATEGORY',
  EDIT_COMMON_CATEGORY: 'EDIT_COMMON_CATEGORY',

  CREATE_COMMON_SUB_MENU: 'CREATE_COMMON_SUB_MENU',
  EDIT_COMMON_SUB_MENU: 'EDIT_COMMON_SUB_MENU',
  EDIT_COMMON_TEMPLATE_SUB_MENU: 'EDIT_COMMON_TEMPLATE_SUB_MENU',
  GET_COMMON_SUB_MENU: 'GET_COMMON_SUB_MENU',
  CHANGE_COMMON_CATEGORY_ORDER: 'CHANGE_COMMON_CATEGORY_ORDER',
  GET_USER_ANALYSIS_MENU: 'GET_USER_ANALYSIS_MENU',
  GET_PROJECT_CATEGORY: 'GET_PROJECT_CATEGORY',
  EDIT_PROJECT_CATEGORY: 'EDIT_PROJECT_CATEGORY',
  GET_SUB_MENU: 'GET_SUB_MENU',
  UPLOAD_AI_PROJECT_MENU: 'UPLOAD_AI_PROJECT_MENU',
  CHANGE_COMMON_SUB_MENU_ORDER: 'CHANGE_COMMON_SUB_MENU_ORDER',
  DELETE_COMMON_SUB_MENU: 'DELETE_COMMON_SUB_MENU',
  DEPLOY_PROJECT_TEMPLATE: 'DEPLOY_PROJECT_TEMPLATE',
  DEPLOY_PROJECT_USER: 'DEPLOY_PROJECT_USER',
  GET_SETTINGS: 'GET_SETTINGS',
  TOGGLE_AI_ANALYSIS: 'TOGGLE_AI_ANALYSIS',
  DOWNLOAD_FILE: 'DOWNLOAD_FILE',
  GET_PROJECT_AI_ANALYSIS: 'GET_PROJECT_AI_ANALYSIS',
  SET_PROJECT_AI_ANALYSIS: 'SET_PROJECT_AI_ANALYSIS',
  DELETE_COMMON_CATEGORY: 'DELETE_COMMON_CATEGORY',
};

const EVIDENCE_ADMIN_ROUTE: TAdminAiRouteKey = {
  GET_COMMON_CATEGORY: '/ai/template/category',
  CREATE_COMMON_CATEGORY: '/ai/template/category/create',
  EDIT_COMMON_CATEGORY: '/ai/template/category/modify',

  CREATE_COMMON_SUB_MENU: '/ai/template/menu/create',
  EDIT_COMMON_SUB_MENU: '/ai/project/menu/modify',
  EDIT_COMMON_TEMPLATE_SUB_MENU: '/ai/template/menu/modify',
  GET_COMMON_SUB_MENU: '/ai/template/menu/:category_template_id',
  CHANGE_COMMON_CATEGORY_ORDER: '/ai/template/category/reorder',
  GET_USER_ANALYSIS_MENU: '/ai/category/:project_id',
  GET_PROJECT_CATEGORY: '/ai/project/category/:project_id',
  EDIT_PROJECT_CATEGORY: '/ai/project/category/modify',
  GET_SUB_MENU: '/ai/project/menus',
  UPLOAD_AI_PROJECT_MENU: '/ai/project/menu/upload',
  CHANGE_COMMON_SUB_MENU_ORDER: '/ai/template/menu/reorder/:category_template_id',
  DELETE_COMMON_SUB_MENU: '/ai/template/menu/delete',
  DEPLOY_PROJECT_TEMPLATE: '/ai/template/deploy',
  DEPLOY_PROJECT_USER: '/ai/project/deploy',
  TOGGLE_AI_ANALYSIS: '/admin/setting/ai-analysis',
  GET_SETTINGS: '/admin/setting',
  DOWNLOAD_FILE: 'ai/project/menu/download',
  GET_PROJECT_AI_ANALYSIS: '/ai/project/setting/ai-analysis/:project_id',
  SET_PROJECT_AI_ANALYSIS: '/ai/project/setting/ai-analysis',
  DELETE_COMMON_CATEGORY: '/ai/template/category/delete',
};

/**
 * * 공통 카테고리 조회 API
 * @description 공통 카테고리 조회 API 호출 함수
 * @summary [REST API] - GET | [ROUTE] - /legal/api/v1 /ai/template/category
 * @param {TGetCommonCategoryInput} input - 공통 카테고리 조회 정보
 * @throws {AxiosError} axios error
 * @returns {Promise<TGetCommonCategoryOutput>} 공통 카테고리 조회 결과
 */
export const fetchGetCommonCategory = async (): Promise<TGetCommonCategoryOutput> => {
  const { data } = await authClient.get<TGetCommonCategoryOutput>(EVIDENCE_ADMIN_ROUTE.GET_COMMON_CATEGORY);
  return data;
};

/**
 * * 공통 카테고리 생성 API
 * @description 공통 카테고리 생성 API 호출 함수
 * @summary [REST API] - POST | [ROUTE] - /legal/api/v1 /ai/template/category/create
 * @param {TCreateCommonCategoryInput} input - 공통 카테고리 생성 정보
 * @throws {AxiosError} axios error
 * @returns {Promise<TCreateCommonCategoryOutput>} 공통 카테고리 생성 결과
 */
export const fetchCreateCommonCategory = async (input: TCreateCommonCategoryInput): Promise<TCreateCommonCategoryOutput> => {
  const { data } = await authClient.post<TCreateCommonCategoryOutput>(EVIDENCE_ADMIN_ROUTE.CREATE_COMMON_CATEGORY, input);
  return data;
};

/**
 * * 공통 카테고리 수정 API
 * @description 공통 카테고리 수정 API 호출 함수
 * @summary [REST API] - PUT | [ROUTE] - /legal/api/v1 /ai/template/category/modify
 * @param {TEditCommonCategoryInput} input - 공통 카테고리 수정 정보
 * @throws {AxiosError} axios error
 * @returns {Promise<TEditCommonCategoryOutput>} 공통 카테고리 수정 결과
 */
export const fetchEditCommonCategory = async (input: TEditCommonCategoryInput): Promise<TEditCommonCategoryOutput> => {
  const { data } = await authClient.put<TEditCommonCategoryOutput>(EVIDENCE_ADMIN_ROUTE.EDIT_COMMON_CATEGORY, input);
  return data;
};

/**
 * * 공통 하위메뉴 생성 API
 * @description 공통 하위메뉴 생성 API 호출 함수
 * @summary [REST API] - POST | [ROUTE] - /legal/api/v1 /ai/template/menu/create
 * @param {TCreateCommonSubMenuInput} input - 공통 하위메뉴 생성 정보
 * @throws {AxiosError} axios error
 * @returns {Promise<TCreateCommonSubMenuOutput>} 공통 하위메뉴 생성 결과
 */
export const fetchCreateCommonSubMenu = async (input: TCreateCommonSubMenuInput): Promise<TCreateCommonSubMenuOutput> => {
  const { data } = await authClient.post<TCreateCommonSubMenuOutput>(EVIDENCE_ADMIN_ROUTE.CREATE_COMMON_SUB_MENU, input);
  return data;
};

/**
 * * 공통 하위메뉴 수정 API
 * @description 공통 하위메뉴 수정 API 호출 함수
 * @summary [REST API] - PUT | [ROUTE] - /legal/api/v1 /ai/project/menu/modify
 * @param {TEditCommonSubMenuInput} input - 공통 하위메뉴 수정 정보
 * @throws {AxiosError} axios error
 * @returns {Promise<TEditCommonSubMenuOutput>} 공통 하위메뉴 수정 결과
 */
export const fetchEditCommonSubMenu = async (input: TEditCommonSubMenuInput): Promise<TEditCommonSubMenuOutput> => {
  const { data } = await authClient.put<TEditCommonSubMenuOutput>(EVIDENCE_ADMIN_ROUTE.EDIT_COMMON_SUB_MENU, input);
  return data;
};

/**
 * * 공통 템플릿 하위메뉴 수정 API
 * @description 공통 템플릿 하위메뉴 수정 API 호출 함수
 * @summary [REST API] - PUT | [ROUTE] - /legal/api/v1 /ai/template/menu/modify
 * @param {TEditCommonTemplateSubMenuInput} input - 공통 템플릿 하위메뉴 수정 정보
 * @throws {AxiosError} axios error
 * @returns {Promise<TEditCommonSubMenuOutput>} 공통 템플릿 하위메뉴 수정 결과
 */
export const fetchEditCommonTemplateSubMenu = async (input: TEditCommonTemplateSubMenuInput): Promise<TEditCommonSubMenuOutput> => {
  const { data } = await authClient.put<TEditCommonSubMenuOutput>(EVIDENCE_ADMIN_ROUTE.EDIT_COMMON_TEMPLATE_SUB_MENU, input);
  return data;
};

/**
 * * 프로젝트 하위메뉴 수정 API (사건별 메뉴 수정용)
 * @description 프로젝트 하위메뉴 수정 API 호출 함수
 * @summary [REST API] - PUT | [ROUTE] - /legal/api/v1 /ai/project/menu/modify
 * @param {TEditProjectSubMenuInput} input - 프로젝트 하위메뉴 수정 정보
 * @throws {AxiosError} axios error
 * @returns {Promise<TEditCommonSubMenuOutput>} 프로젝트 하위메뉴 수정 결과
 */
export const fetchEditProjectSubMenu = async (input: TEditProjectSubMenuInput): Promise<TEditCommonSubMenuOutput> => {
  const { data } = await authClient.put<TEditCommonSubMenuOutput>(EVIDENCE_ADMIN_ROUTE.EDIT_COMMON_SUB_MENU, input);
  return data;
};

/**
 * * 공통 하위메뉴 조회 API
 * @description 공통 하위메뉴 조회 API 호출 함수
 * @summary [REST API] - GET | [ROUTE] - /legal/api/v1 /ai/template/menu/:category_template_id
 * @param {TGetCommonSubMenuInput} input - 공통 하위메뉴 조회 정보
 * @throws {AxiosError} axios error
 * @returns {Promise<TGetCommonSubMenuOutput>} 공통 하위메뉴 조회 결과
 */
export const fetchGetCommonSubMenu = async (category_template_id: string): Promise<TGetCommonSubMenuOutput> => {
  const url = EVIDENCE_ADMIN_ROUTE.GET_COMMON_SUB_MENU.replace(':category_template_id', category_template_id);
  console.log('Fetching common submenu from URL:', url);
  console.log('Category template ID:', category_template_id);
  const { data } = await authClient.get<TGetCommonSubMenuOutput>(url);
  return data;
};

/**
 * * 공통 카테고리 순서 변경 API
 * @description 공통 카테고리 순서 변경 API 호출 함수
 * @summary [REST API] - PUT | [ROUTE] - /legal/api/v1 /ai/template/category/reorder
 * @param {TChangeCommonCategoryOrderInput} input - 공통 카테고리 순서 변경 정보
 * @throws {AxiosError} axios error
 * @returns {Promise<TChangeCommonCategoryOrderOutput>} 공통 카테고리 순서 변경 결과
 */
export const fetchChangeCommonCategoryOrder = async (input: TChangeCommonCategoryOrderInput): Promise<TChangeCommonCategoryOrderOutput> => {
  const { data } = await authClient.put<TChangeCommonCategoryOrderOutput>(EVIDENCE_ADMIN_ROUTE.CHANGE_COMMON_CATEGORY_ORDER, input);
  return data;
};

/**
 * * 사용자 분석메뉴 조회 API
 * @description 사용자 분석메뉴 조회 API 호출 함수
 * @summary [REST API] - GET | [ROUTE] - /legal/api/v1 /ai/category/:project_id
 * @param {string} project_id - 사용자 분석메뉴 조회 정보
 * @throws {AxiosError} axios error
 * @returns {Promise<TGetUserAnalysisMenuOutput>} 사용자 분석메뉴 조회 결과
 */
export const fetchGetUserAnalysisMenu = async (project_id: string): Promise<TGetUserAnalysisMenuOutput> => {
  const url = EVIDENCE_ADMIN_ROUTE.GET_USER_ANALYSIS_MENU.replace(':project_id', project_id);
  const { data } = await authClient.get<TGetUserAnalysisMenuOutput>(url);
  return data;
};

/**
 * * AI 분석메뉴 조회 API
 * @description AI 분석메뉴 조회 API 호출 함수
 * @summary [REST API] - GET | [ROUTE] - /legal/api/v1/ai/category/:project_id
 * @param {string} project_id - 프로젝트 ID
 * @throws {AxiosError} axios error
 * @returns {Promise<IAIAnalysisMenuOutput>} AI 분석메뉴 조회 결과
 */
export const fetchGetAIAnalysisMenu = async (project_id: string): Promise<IAIAnalysisMenuOutput> => {
  const url = `/legal/api/v1/ai/category/${project_id}`;
  const { data } = await authClient.get<IAIAnalysisMenuOutput>(url);
  return data;
};

/**
 * * AI 분석 하위메뉴 등록 API
 * @description AI 분석 하위메뉴 등록 API 호출 함수
 * @summary [REST API] - POST | [ROUTE] - /legal/api/v1/ai/category/submenu
 * @param {ICreateSubMenuInput} input - 하위메뉴 등록 정보
 * @throws {AxiosError} axios error
 * @returns {Promise<ICreateSubMenuOutput>} 하위메뉴 등록 결과
 */
export const fetchCreateSubMenu = async (input: ICreateSubMenuInput): Promise<ICreateSubMenuOutput> => {
  const url = '/legal/api/v1/ai/category/submenu';
  const { data } = await authClient.post<ICreateSubMenuOutput>(url, input);
  return data;
};

/**
 * * AI 프로젝트 메뉴 파일 업로드 API
 * @description AI 프로젝트 메뉴 파일 업로드 API 호출 함수
 * @summary [REST API] - POST | [ROUTE] - /ai/project/menu/upload
 * @param {TUploadAIProjectMenuInput} input - AI 프로젝트 메뉴 파일 업로드 정보
 * @throws {AxiosError} axios error
 * @returns {Promise<TUploadAIProjectMenuOutput>} AI 프로젝트 메뉴 파일 업로드 결과
 */
export async function fetchAdminUploadAIProjectMenu(data: TUploadAIProjectMenuInput) {
  const formData = new FormData();
  formData.append('project_id', data.project_id);
  formData.append('menu_id', data.menu_id);
  formData.append('file_nm', data.file_nm);
  formData.append('file', data.file); // File 객체
  console.log('formData', formData.get('file'));
  return await authClient.post(EVIDENCE_ADMIN_ROUTE.UPLOAD_AI_PROJECT_MENU, formData);
}
/**
 * * 사건별 카테고리 조회 API
 * @description 사건별 카테고리 조회 API 호출 함수
 * @summary [REST API] - GET | [ROUTE] - /legal/api/v1/ai/project/category/:project_id
 * @param {string} project_id - 사건 ID
 * @throws {AxiosError} axios error
 * @returns {Promise<TGetProjectCategoryOutput>} 사건별 카테고리 조회 결과
 */
export const fetchGetProjectCategory = async (project_id: string): Promise<TGetProjectCategoryOutput> => {
  const url = EVIDENCE_ADMIN_ROUTE.GET_PROJECT_CATEGORY.replace(':project_id', project_id);
  const { data } = await authClient.get<TGetProjectCategoryOutput>(url);
  return data;
};

/**
 * * 사건 카테고리 수정 API
 * @description 사건 카테고리 수정 API 호출 함수
 * @summary [REST API] - PUT | [ROUTE] - /legal/api/v1/ai/project/category/modify
 * @param {TEditProjectCategoryInput} input - 사건 카테고리 수정 정보
 * @throws {AxiosError} axios error
 * @returns {Promise<TEditProjectCategoryOutput>} 사건 카테고리 수정 결과
 */
export const fetchEditProjectCategory = async (input: IEditProjectCategoryInput): Promise<IEditProjectCategoryOutput> => {
  const { data } = await authClient.put<IEditProjectCategoryOutput>(EVIDENCE_ADMIN_ROUTE.EDIT_PROJECT_CATEGORY, input);
  return data;
};

/**
 * * 사건 하위메뉴 조회 API
 * @description 사건 하위메뉴 조회 API 호출 함수
 * @summary [REST API] - GET | [ROUTE] - /legal/api/v1/ai/project/menus
 * @param {IGetSubMenuInput} input - 사건 하위메뉴 조회 정보
 * @throws {AxiosError} axios error
 * @returns {Promise<IGetSubMenuOutput>} 사건 하위메뉴 조회 결과
 */
export const fetchGetSubMenu = async (input: IGetSubMenuInput): Promise<IGetSubMenuOutput> => {
  const { data } = await authClient.post<IGetSubMenuOutput>(EVIDENCE_ADMIN_ROUTE.GET_SUB_MENU, input);
  return data;
};

/**
 * * 공통 하위메뉴 순서 변경 API
 * @description 공통 하위메뉴 순서 변경 API 호출 함수
 * @summary [REST API] - PUT | [ROUTE] - /legal/api/v1/ai/template/menu/reorder/:category_template_id
 * @param {TChangeCommonSubMenuOrderInput} input - 공통 하위메뉴 순서 변경 정보
 * @throws {AxiosError} axios error
 * @returns {Promise<TChangeCommonSubMenuOrderOutput>} 공통 하위메뉴 순서 변경 결과
 */
export const fetchChangeCommonSubMenuOrder = async (
  category_template_id: string,
  input: TChangeCommonSubMenuOrderInput,
): Promise<TChangeCommonSubMenuOrderOutput> => {
  const url = EVIDENCE_ADMIN_ROUTE.CHANGE_COMMON_SUB_MENU_ORDER.replace(':category_template_id', category_template_id);
  const { data } = await authClient.put<TChangeCommonSubMenuOrderOutput>(url, input);
  return data;
};

// ! 공통 하위메뉴 삭제 API
export const fetchDeleteCommonSubMenu = async (input: IDeleteSubMenuInput): Promise<IDeleteSubMenuOutput> => {
  const { data } = await authClient.delete<IDeleteSubMenuOutput>(EVIDENCE_ADMIN_ROUTE.DELETE_COMMON_SUB_MENU, {
    data: input,
  });
  return data;
};

/**
 * * 프로젝트 템플릿 배포 API
 * @description 프로젝트 템플릿 배포 API 호출 함수
 * @summary [REST API] - POST | [ROUTE] - /legal/api/v1/ai/template/deploy
 * @param {IDeployProjectTemplateOutput} input - 프로젝트 템플릿 배포 정보
 * @throws {AxiosError} axios error
 * @returns {Promise<IDeployProjectTemplateOutput>} 프로젝트 템플릿 배포 결과
 */

export const fetchDeployProjectTemplate = async (): Promise<IDeployProjectTemplateOutput> => {
  const { data } = await authClient.patch<IDeployProjectTemplateOutput>(EVIDENCE_ADMIN_ROUTE.DEPLOY_PROJECT_TEMPLATE);
  return data;
};

/**
 * * 프로젝트 사용자 배포 API
 * @description 프로젝트 사용자 배포 API 호출 함수
 * @summary [REST API] - POST | [ROUTE] - /legal/api/v1/ai/project/deploy
 * @param {IDeployProjectUserInput} input - 프로젝트 사용자 배포 정보
 * @throws {AxiosError} axios error
 * @returns {Promise<IDeployProjectUserOutput>} 프로젝트 사용자 배포 결과
 */
export const fetchDeployProjectUser = async (input: IDeployProjectUserInput): Promise<IDeployProjectUserOutput> => {
  const { data } = await authClient.patch<IDeployProjectUserOutput>(EVIDENCE_ADMIN_ROUTE.DEPLOY_PROJECT_USER, input);
  return data;
};

/**
 * * AI 분석 기능 토글 API
 * @description AI 분석 기능 토글 API 호출 함수
 * @summary [REST API] - POST | [ROUTE] - /admin/settings/ai-analysis
 * @param {IAIAnalysisToggleInput} input - AI 분석 기능 토글 정보
 * @throws {AxiosError} axios error
 * @returns {Promise<IAIAnalysisToggleOutput>} AI 분석 기능 토글 결과
 */
export const fetchAIToggleAnalysis = async (input: IAIAnalysisToggleInput): Promise<IAIAnalysisToggleOutput> => {
  const { data } = await authClient.put<IAIAnalysisToggleOutput>(EVIDENCE_ADMIN_ROUTE.TOGGLE_AI_ANALYSIS, input);
  return data;
};

/**
 * * 설정 조회 API
 * @description 설정 조회 API 호출 함수
 * @summary [REST API] - GET | [ROUTE] - /admin/setting
 * @throws {AxiosError} axios error
 * @returns {Promise<IGetSettingsOutput>} 설정 조회 결과
 */
export const fetchGetSettings = async (): Promise<IGetSettingsOutput> => {
  const { data } = await authClient.get<IGetSettingsOutput>(EVIDENCE_ADMIN_ROUTE.GET_SETTINGS);
  return data;
};

/**
 * * 파일 다운로드 API
 * @description 파일 다운로드 API 호출 함수
 * @summary [REST API] - POST | [ROUTE] - /ai/project/menu/download
 * @param {IDownloadFileInput} input - 파일 다운로드 정보
 * @throws {AxiosError} axios error
 * @returns {Promise<Blob>} 파일 다운로드 결과 (blob)
 */
export const fetchDownloadFile = async (input: IDownloadFileInput): Promise<Blob> => {
  const response = await authClient.post(EVIDENCE_ADMIN_ROUTE.DOWNLOAD_FILE, input, {
    responseType: 'blob', // 파일 다운로드를 위해 blob 타입으로 응답 받기
  });
  return response.data;
};

/**
 * * 사건별 ai분석 설정조회 API
 * @description 사건별 ai분석 설정조회 API 호출 함수
 * @summary [REST API] - GET | [ROUTE] - /ai/project/setting/ai-analysis/:project_id
 * @param {string} project_id - 사건 ID
 * @throws {AxiosError} axios error
 * @returns {Promise<IGetProjectAIAnalysisOutput>} 사건별 ai분석 설정조회 결과
 */
export const fetchGetProjectAIAnalysis = async (project_id: string): Promise<IGetProjectAIAnalysisOutput> => {
  const url = EVIDENCE_ADMIN_ROUTE.GET_PROJECT_AI_ANALYSIS.replace(':project_id', project_id);
  const { data } = await authClient.get<IGetProjectAIAnalysisOutput>(url);
  return data;
};

/**
 * * 사건별 ai분석 설정 API
 * @description 사건별 ai분석 설정 API 호출 함수
 * @summary [REST API] - PUT | [ROUTE] - /ai/project/setting/ai-analysis
 * @param {ISetProjectAIAnalysisInput} input - 사건별 ai분석 설정 정보
 * @throws {AxiosError} axios error
 * @returns {Promise<ISetProjectAIAnalysisOutput>} 사건별 ai분석 설정 결과
 */
export const fetchSetProjectAIAnalysis = async (input: ISetProjectAIAnalysisInput): Promise<ISetProjectAIAnalysisOutput> => {
  const { data } = await authClient.put<ISetProjectAIAnalysisOutput>(EVIDENCE_ADMIN_ROUTE.SET_PROJECT_AI_ANALYSIS, input);
  return data;
};

/**
 * * 공통 카테고리 삭제 API
 * @description 공통 카테고리 삭제 API 호출 함수
 * @summary [REST API] - DELETE | [ROUTE] - /ai/template/category/delete
 * @param {IDeleteCommonCategoryInput} input - 공통 카테고리 삭제 정보
 * @throws {AxiosError} axios error
 * @returns {Promise<IDeleteCommonCategoryOutput>} 공통 카테고리 삭제 결과
 */
export const fetchDeleteCommonCategory = async (input: IDeleteCommonCategoryInput): Promise<IDeleteCommonCategoryOutput> => {
  const { data } = await authClient.delete<IDeleteCommonCategoryOutput>(EVIDENCE_ADMIN_ROUTE.DELETE_COMMON_CATEGORY, {
    data: input,
  });
  return data;
};
