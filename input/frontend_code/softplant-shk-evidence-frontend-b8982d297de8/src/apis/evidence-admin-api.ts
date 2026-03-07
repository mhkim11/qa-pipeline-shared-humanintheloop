import { AxiosError as _AxiosError } from 'axios';

import { authClient } from '@apis/index';
import type {
  TFindEvidenceOriginalInput,
  TFindEvidenceOriginalOutput,
  TEvidenceOriginalFileNameInput,
  TEvidenceOriginalFileNameOutput,
  TEvidenceOriginalDownloadInput,
  TEvidenceOriginalDownloadOutput,
  TEvidenceSplitOcrInput,
  TEvidenceSplitOcrOutput,
  TSplitAndOcrRequestInput,
  TSplitAndOcrRequestOutput,
  TUploadEvidenceListInput,
  TUploadEvidenceListOutput,
  TAdminUploadEvidenceInput,
  TAdminUploadEvidenceOutput,
  TGetSideBarMenuListOutput,
  TModifyEvidenceItemInput,
  TModifyEvidenceItemOutput,
  TFindMatchingListInput,
  TFindMatchingListOutput,
  TModifyMatchingItemInput,
  TModifyMatchingItemOutput,
  TAdminUploadMatchingInput,
  TAdminUploadMatchingOutput,
  TFindSummaryResultListInput,
  TFindSummaryListOutput,
  TDownloadSplitFileInput,
  TDownloadSplitFileOutput,
  TGetEvidenceOriginalNameOutput,
  TUploadSummaryFileInput,
  TUploadSummaryFileOutput,
  TCreateEvidenceInput,
  TCreateEvidenceOutput,
  TFindCreateEvidenceInput,
  TFindCreateEvidenceOutput,
  TApplyEvidenceInput,
  TApplyEvidenceOutput,
  TApplySummaryEvidenceInput,
  TApplySummaryEvidenceOutput,
  TAddEvidenceOriginalInput,
  TAddEvidenceOriginalOutput,
  TViewAdminDocumentInput,
  TFindProjectUploadStatusInput,
  TFindProjectUploadStatusOutput,
  TViewAdmimEvidenceFileInput,
  TResetSummaryTableInput,
  TResetSummaryTableOutput,
  TResetEvidenceItemInput,
  TResetEvidenceItemOutput,
  TDeleteAdminCaseListOutput,
  TDownloadEvidenceFileInput,
  TDownloadEvidenceFileOutput,
  TResetEvidenceTableInput,
  TResetEvidenceTableOutput,
  TResetMatchingTableInput,
  TResetMatchingTableOutput,
  TDownloadEvidenceOriginalFileInput,
  TDownloadMatchingFileInput,
  TDownloadSummaryFileInput,
  TAssignLawyerToCaseInput,
  TAssignLawyerToCaseOutput,
  TFindCaseOutput,
  TFindAllUserInput,
  TFindAllUserOutput,
  TFindAllAdminCaseListInput,
  TFindAllAdminCaseListOutput,
  TGetAllCaseFilterCountOutput,
  TChangeProjectPaymentStatusInput,
  TChangeProjectPaymentStatusOutput,
  TGetDailyUploadStatusListInput,
  TGetDailyUploadStatusListOutput,
  TChangeAdminPasswordInput,
  TChangeAdminPasswordOutput,
  TChangePaymentFunctionInput,
  TChangePaymentFunctionOutput,
  TGetPaymentSettingsOutput,
  TChangeOcrManagementStatusInput,
  TChangeOcrManagementStatusOutput,
  TGetAllUserFilterInput,
  TGetAllUserFilterOutput,
  TFindCreateEvidenceFilterInput,
  TFindCreateEvidenceFilterOutput,
} from '@/apis/type';

type TEvidendQueryKey = {
  FIND_ORIGINAL_EVIDENCE: 'FIND_ORIGINAL_EVIDENCE';
  FIND_SPLIT_OCR_EVIDENCE: 'FIND_SPLIT_OCR_EVIDENCE';
  FIND_EVIDENCE_LIST: 'FIND_EVIDENCE_LIST';
  FIND_MATCHING_LIST: 'FIND_MATCHING_LIST';
  FIND_SUMMARY_RESULT_LIST: 'FIND_SUMMARY_RESULT_LIST';
  FIND_PROJECT_UPLOAD_STATUS: 'FIND_PROJECT_UPLOAD_STATUS';

  MODIFY_ORIGINAL_FILE_NAME: 'MODIFY_ORIGINAL_FILE_NAME';
  MODIFY_EVIDENCE_ITEM: 'MODIFY_EVIDENCE_ITEM';
  MODIFY_MATCHING_ITEM: 'MODIFY_MATCHING_ITEM';

  DOWNLOAD_ORIGINAL_FILE: 'DOWNLOAD_ORIGINAL_FILE';
  DOWNLOAD_SPLIT_FILE: 'DOWNLOAD_SPLIT_FILE';
  DOWNLOAD_EVIDENCE_ORIGINAL_ZIP: 'DOWNLOAD_EVIDENCE_ORIGINAL_ZIP';
  DOWNLOAD_SUMMARY_FILE: 'DOWNLOAD_SUMMARY_FILE';
  SPLIT_AND_OCR_REQUEST: 'SPLIT_AND_OCR_REQUEST';
  EVIDENCE_ADMIN_UPLOAD: 'EVIDENCE_ADMIN_UPLOAD';
  MATCHING_ADMIN_UPLOAD: 'MATCHING_ADMIN_UPLOAD';
  SUMMARY_ADMIN_UPLOAD: 'SUMMARY_ADMIN_UPLOAD';
  RESET_SUMMARY_TABLE: 'RESET_SUMMARY_TABLE';
  RESET_EVIDENCE_TABLE: 'RESET_EVIDENCE_TABLE';
  RESET_MATCHING_TABLE: 'RESET_MATCHING_TABLE';
  GET_SIDEBAR_MENU_LIST: 'GET_SIDEBAR_MENU_LIST';
  GET_EVIDENCE_ORIGINAL_NAME: 'GET_EVIDENCE_ORIGINAL_NAME';

  ADD_EVIDENCE_ORIGINAL: 'ADD_EVIDENCE_ORIGINAL';

  CREATE_EVIDENCE: 'CREATE_EVIDENCE';
  FIND_CREATE_EVIDENCE: 'FIND_CREATE_EVIDENCE';
  // 증거문서 반영
  APPLY_EVIDENCE: 'APPLY_EVIDENCE';

  APPLY_SUMMARY_EVIDENCE: 'APPLY_SUMMARY_EVIDENCE';

  VIEW_ADMIN_DOCUMENT: 'VIEW_ADMIN_DOCUMENT';
  VIEW_ADMIN_EVIDENCE_DOCUMENT: 'VIEW_ADMIN_EVIDENCE_DOCUMENT';

  ADMIN_RESET_EVIDENCE_ITEM: 'ADMIN_RESET_EVIDENCE_ITEM';
  DELETE_ADMIN_CASE_LIST: 'DELETE_ADMIN_CASE_LIST';
  DOWNLOAD_EVIDENCE_FILE: 'DOWNLOAD_EVIDENCE_FILE';
  DOWNLOAD_MATCHING_FILE: 'DOWNLOAD_MATCHING_FILE';

  ASSIGN_LAWYER_TO_CASE: 'ASSIGN_LAWYER_TO_CASE';
  FIND_ALL_USER: 'FIND_ALL_USER';
  FIND_CASE: 'FIND_CASE';
  FIND_ALL_ADMIN_CASE_LIST: 'FIND_ALL_ADMIN_CASE_LIST';
  GET_ALL_CASE_FILTER_COUNT: 'GET_ALL_CASE_FILTER_COUNT';
  CHANGE_PROJECT_PAYMENT_STATUS: 'CHANGE_PROJECT_PAYMENT_STATUS';
  GET_DAILY_UPLOAD_STATUS_LIST: 'GET_DAILY_UPLOAD_STATUS_LIST';

  CHANGE_ADMIN_PASSWORD: 'CHANGE_ADMIN_PASSWORD';
  CHANGE_PAYMENT_FUNCTION: 'CHANGE_PAYMENT_FUNCTION';
  GET_PAYMENT_SETTINGS: 'GET_PAYMENT_SETTINGS';
  CHANGE_OCR_MANAGEMENT_STATUS: 'CHANGE_OCR_MANAGEMENT_STATUS';

  FIND_CREATE_EVIDENCE_FILTER: 'FIND_CREATE_EVIDENCE_FILTER';
  FIND_CREATE_EVIDENCE_FILTER_OUTPUT: 'FIND_CREATE_EVIDENCE_FILTER_OUTPUT';
};
type TEvidenceRouteKey = {
  FIND_ORIGINAL_EVIDENCE: '/admin/project/file/originals';
  FIND_SPLIT_OCR_EVIDENCE: '/admin/project/file/split-files';
  FIND_EVIDENCE_LIST: '/admin/project/evidence/list';
  FIND_MATCHING_LIST: '/admin/project/matching/list';
  FIND_SUMMARY_RESULT_LIST: '/admin/project/summary/result';
  FIND_PROJECT_UPLOAD_STATUS: '/admin/project/upload/status';

  MODIFY_ORIGINAL_FILE_NAME: '/admin/project/file/original/rename';
  MODIFY_EVIDENCE_ITEM: '/admin/project/evidence/modify';
  MODIFY_MATCHING_ITEM: '/admin/project/matching/modify';

  DOWNLOAD_ORIGINAL_FILE: '/admin/project/file/original/download';
  DOWNLOAD_SPLIT_FILE: '/admin/project/file/split-file/download';
  DOWNLOAD_EVIDENCE_ORIGINAL_ZIP: '/admin/project/file/original/download/zip';
  DOWNLOAD_SUMMARY_FILE: '/admin/project/summary/download/zip';

  SPLIT_AND_OCR_REQUEST: '/admin/project/original/split-ocr';
  EVIDENCE_ADMIN_UPLOAD: '/admin/project/evidence/upload';
  MATCHING_ADMIN_UPLOAD: '/admin/project/matching/upload';
  SUMMARY_ADMIN_UPLOAD: '/admin/project/summary/upload';
  RESET_SUMMARY_TABLE: '/admin/project/summary/reset';
  RESET_EVIDENCE_TABLE: '/admin/project/evidence/reset';
  RESET_MATCHING_TABLE: '/admin/project/matching/reset';
  GET_SIDEBAR_MENU_LIST: '/admin/project/requests';
  ADD_EVIDENCE_ORIGINAL: '/admin/project/file/original/upload';
  GET_EVIDENCE_ORIGINAL_NAME: '/admin/project/original/filename/:project_id';

  CREATE_EVIDENCE: '/admin/project/evidence/build';
  FIND_CREATE_EVIDENCE: '/admin/project/evidence/result';
  // 증거문서 반영
  APPLY_EVIDENCE: '/admin/project/evidence/reflect';

  APPLY_SUMMARY_EVIDENCE: '/admin/project/summary/reflect';

  VIEW_ADMIN_DOCUMENT: '/admin/project/file/split-file/document';
  VIEW_ADMIN_EVIDENCE_DOCUMENT: '/admin/project/file/evidence/document';

  ADMIN_RESET_EVIDENCE_ITEM: '/admin/project/reset/settings';
  DELETE_ADMIN_CASE_LIST: '/admin/project/:project_id/delete';
  DOWNLOAD_EVIDENCE_FILE: '/admin/project/evidence/download';
  DOWNLOAD_MATCHING_FILE: '/admin/project/evidence/download/zip';

  ASSIGN_LAWYER_TO_CASE: '/project/member/add';
  FIND_ALL_USER: '/admin/office/users';
  FIND_CASE: '/project/:project_id';
  FIND_ALL_ADMIN_CASE_LIST: '/admin/projects';
  GET_ALL_CASE_FILTER_COUNT: '/admin/projects';
  CHANGE_PROJECT_PAYMENT_STATUS: '/admin/project/payment-status';
  GET_DAILY_UPLOAD_STATUS_LIST: 'admin/project/file/upload-date';
  CHANGE_ADMIN_PASSWORD: '/auth/password/reset/admin';
  CHANGE_PAYMENT_FUNCTION: '/admin/setting/free-payment';
  GET_PAYMENT_SETTINGS: '/admin/setting';
  CHANGE_OCR_MANAGEMENT_STATUS: '/admin/project/ocr-remark';
  FIND_CREATE_EVIDENCE_FILTER: '/admin/office/users/filter';
  FIND_CREATE_EVIDENCE_FILTER_OUTPUT: '/admin/project/evidence/result/filter';
};
export const EVIDENCE_ADMIN_QUERY_KEY: TEvidendQueryKey = {
  FIND_ORIGINAL_EVIDENCE: 'FIND_ORIGINAL_EVIDENCE',
  FIND_SPLIT_OCR_EVIDENCE: 'FIND_SPLIT_OCR_EVIDENCE',
  FIND_EVIDENCE_LIST: 'FIND_EVIDENCE_LIST',
  FIND_MATCHING_LIST: 'FIND_MATCHING_LIST',
  FIND_SUMMARY_RESULT_LIST: 'FIND_SUMMARY_RESULT_LIST',
  FIND_PROJECT_UPLOAD_STATUS: 'FIND_PROJECT_UPLOAD_STATUS',

  MODIFY_ORIGINAL_FILE_NAME: 'MODIFY_ORIGINAL_FILE_NAME',
  MODIFY_EVIDENCE_ITEM: 'MODIFY_EVIDENCE_ITEM',
  MODIFY_MATCHING_ITEM: 'MODIFY_MATCHING_ITEM',

  DOWNLOAD_ORIGINAL_FILE: 'DOWNLOAD_ORIGINAL_FILE',
  DOWNLOAD_SPLIT_FILE: 'DOWNLOAD_SPLIT_FILE',
  DOWNLOAD_EVIDENCE_ORIGINAL_ZIP: 'DOWNLOAD_EVIDENCE_ORIGINAL_ZIP',
  DOWNLOAD_SUMMARY_FILE: 'DOWNLOAD_SUMMARY_FILE',
  SPLIT_AND_OCR_REQUEST: 'SPLIT_AND_OCR_REQUEST',
  EVIDENCE_ADMIN_UPLOAD: 'EVIDENCE_ADMIN_UPLOAD',
  MATCHING_ADMIN_UPLOAD: 'MATCHING_ADMIN_UPLOAD',
  SUMMARY_ADMIN_UPLOAD: 'SUMMARY_ADMIN_UPLOAD',
  RESET_SUMMARY_TABLE: 'RESET_SUMMARY_TABLE',
  RESET_EVIDENCE_TABLE: 'RESET_EVIDENCE_TABLE',
  RESET_MATCHING_TABLE: 'RESET_MATCHING_TABLE',
  GET_SIDEBAR_MENU_LIST: 'GET_SIDEBAR_MENU_LIST',
  GET_EVIDENCE_ORIGINAL_NAME: 'GET_EVIDENCE_ORIGINAL_NAME',

  ADD_EVIDENCE_ORIGINAL: 'ADD_EVIDENCE_ORIGINAL',

  CREATE_EVIDENCE: 'CREATE_EVIDENCE',
  FIND_CREATE_EVIDENCE: 'FIND_CREATE_EVIDENCE',
  // 증거문서 반영
  APPLY_EVIDENCE: 'APPLY_EVIDENCE',

  APPLY_SUMMARY_EVIDENCE: 'APPLY_SUMMARY_EVIDENCE',

  VIEW_ADMIN_DOCUMENT: 'VIEW_ADMIN_DOCUMENT',
  VIEW_ADMIN_EVIDENCE_DOCUMENT: 'VIEW_ADMIN_EVIDENCE_DOCUMENT',

  ADMIN_RESET_EVIDENCE_ITEM: 'ADMIN_RESET_EVIDENCE_ITEM',
  DELETE_ADMIN_CASE_LIST: 'DELETE_ADMIN_CASE_LIST',
  DOWNLOAD_EVIDENCE_FILE: 'DOWNLOAD_EVIDENCE_FILE',
  DOWNLOAD_MATCHING_FILE: 'DOWNLOAD_MATCHING_FILE',
  ASSIGN_LAWYER_TO_CASE: 'ASSIGN_LAWYER_TO_CASE',
  FIND_ALL_USER: 'FIND_ALL_USER',
  FIND_CASE: 'FIND_CASE',
  FIND_ALL_ADMIN_CASE_LIST: 'FIND_ALL_ADMIN_CASE_LIST',
  GET_ALL_CASE_FILTER_COUNT: 'GET_ALL_CASE_FILTER_COUNT',
  CHANGE_PROJECT_PAYMENT_STATUS: 'CHANGE_PROJECT_PAYMENT_STATUS',
  GET_DAILY_UPLOAD_STATUS_LIST: 'GET_DAILY_UPLOAD_STATUS_LIST',
  CHANGE_ADMIN_PASSWORD: 'CHANGE_ADMIN_PASSWORD',
  CHANGE_PAYMENT_FUNCTION: 'CHANGE_PAYMENT_FUNCTION',
  GET_PAYMENT_SETTINGS: 'GET_PAYMENT_SETTINGS',
  CHANGE_OCR_MANAGEMENT_STATUS: 'CHANGE_OCR_MANAGEMENT_STATUS',
  FIND_CREATE_EVIDENCE_FILTER: 'FIND_CREATE_EVIDENCE_FILTER',
  FIND_CREATE_EVIDENCE_FILTER_OUTPUT: 'FIND_CREATE_EVIDENCE_FILTER_OUTPUT',
};
const EVIDENCE_ADMIN_ROUTE: TEvidenceRouteKey = {
  FIND_ORIGINAL_EVIDENCE: '/admin/project/file/originals',
  FIND_SPLIT_OCR_EVIDENCE: '/admin/project/file/split-files',
  FIND_EVIDENCE_LIST: '/admin/project/evidence/list',
  FIND_MATCHING_LIST: '/admin/project/matching/list',
  FIND_SUMMARY_RESULT_LIST: '/admin/project/summary/result',
  FIND_PROJECT_UPLOAD_STATUS: '/admin/project/upload/status',

  MODIFY_ORIGINAL_FILE_NAME: '/admin/project/file/original/rename',
  MODIFY_EVIDENCE_ITEM: '/admin/project/evidence/modify',
  MODIFY_MATCHING_ITEM: '/admin/project/matching/modify',

  DOWNLOAD_ORIGINAL_FILE: '/admin/project/file/original/download',
  DOWNLOAD_SPLIT_FILE: '/admin/project/file/split-file/download',
  DOWNLOAD_EVIDENCE_ORIGINAL_ZIP: '/admin/project/file/original/download/zip',
  DOWNLOAD_SUMMARY_FILE: '/admin/project/summary/download/zip',

  SPLIT_AND_OCR_REQUEST: '/admin/project/original/split-ocr',
  EVIDENCE_ADMIN_UPLOAD: '/admin/project/evidence/upload',
  MATCHING_ADMIN_UPLOAD: '/admin/project/matching/upload',
  SUMMARY_ADMIN_UPLOAD: '/admin/project/summary/upload',
  RESET_SUMMARY_TABLE: '/admin/project/summary/reset',
  RESET_EVIDENCE_TABLE: '/admin/project/evidence/reset',
  RESET_MATCHING_TABLE: '/admin/project/matching/reset',
  GET_SIDEBAR_MENU_LIST: '/admin/project/requests',
  GET_EVIDENCE_ORIGINAL_NAME: '/admin/project/original/filename/:project_id',
  ADD_EVIDENCE_ORIGINAL: '/admin/project/file/original/upload',
  CREATE_EVIDENCE: '/admin/project/evidence/build',
  FIND_CREATE_EVIDENCE: '/admin/project/evidence/result',
  // 증거문서 반영
  APPLY_EVIDENCE: '/admin/project/evidence/reflect',

  APPLY_SUMMARY_EVIDENCE: '/admin/project/summary/reflect',

  VIEW_ADMIN_DOCUMENT: '/admin/project/file/split-file/document',
  VIEW_ADMIN_EVIDENCE_DOCUMENT: '/admin/project/file/evidence/document',

  ADMIN_RESET_EVIDENCE_ITEM: '/admin/project/reset/settings',
  DELETE_ADMIN_CASE_LIST: '/admin/project/:project_id/delete',
  DOWNLOAD_EVIDENCE_FILE: '/admin/project/evidence/download',
  DOWNLOAD_MATCHING_FILE: '/admin/project/evidence/download/zip',
  ASSIGN_LAWYER_TO_CASE: '/project/member/add',
  FIND_ALL_USER: '/admin/office/users',
  FIND_CASE: '/project/:project_id',
  FIND_ALL_ADMIN_CASE_LIST: '/admin/projects',
  GET_ALL_CASE_FILTER_COUNT: '/admin/projects',
  CHANGE_PROJECT_PAYMENT_STATUS: '/admin/project/payment-status',
  GET_DAILY_UPLOAD_STATUS_LIST: 'admin/project/file/upload-date',
  CHANGE_ADMIN_PASSWORD: '/auth/password/reset/admin',
  CHANGE_PAYMENT_FUNCTION: '/admin/setting/free-payment',
  GET_PAYMENT_SETTINGS: '/admin/setting',
  CHANGE_OCR_MANAGEMENT_STATUS: '/admin/project/ocr-remark',
  FIND_CREATE_EVIDENCE_FILTER: '/admin/office/users/filter',
  FIND_CREATE_EVIDENCE_FILTER_OUTPUT: '/admin/project/evidence/result/filter',
};
/**
 * * 원본파일 검색 API
 * @description 증거 검색 API 호출 함수
 * @summary [REST API] - POST | [ROUTE] - /legal/api/v1 /evidences/search
 * @param {TSearchEvidencesInput} input - 증거 검색 정보
 * @throws {AxiosError} axios error
 * @returns {Promise<TSearchEvidencesOutput>} 증거 검색 결과
 * @file https/employee/employee.http - [POST] /employee/employees
 */
export const fetchFindOrigenalEvidence = async (input: TFindEvidenceOriginalInput): Promise<TFindEvidenceOriginalOutput> => {
  const { data } = await authClient.post<TFindEvidenceOriginalOutput>(EVIDENCE_ADMIN_ROUTE.FIND_ORIGINAL_EVIDENCE, input);
  return data;
};

/**
 * * 사용자 업로드 파일명 수정 API
 * @description 사용자 업로드 파일명 수정 API 호출 함수
 * @summary [REST API] - PUT | [ROUTE] - /legal/api/v1 /evidences/{evidenceId}/file-name
 * @param {TModifyEvidenceFileNameInput} input - 사용자 업로드 파일명 수정 정보
 * @throws {AxiosError} axios error
 * @returns {Promise<TModifyEvidenceFileNameOutput>} 사용자 업로드 파일명 수정 결과
 * @file https/employee/employee.http - [PUT] /employee/employees/{employeeId}
 */
export const fetchModifyOriginalFileName = async (input: TEvidenceOriginalFileNameInput): Promise<TEvidenceOriginalFileNameOutput> => {
  const { data } = await authClient.put<TEvidenceOriginalFileNameOutput>(EVIDENCE_ADMIN_ROUTE.MODIFY_ORIGINAL_FILE_NAME, input);
  // console.log(data);
  return data;
};

/**
 * * 사용자 업로드 다운로드 API
 * @description 사용자 업로드 다운로드 API 호출 함수
 * @summary [REST API] - POST | [ROUTE] - /legal/api/v1 /evidences/download
 * @param {TDownloadEvidenceInput} input - 사용자 업로드 다운로드 정보
 * @throws {AxiosError} axios error
 * @returns {Promise<TDownloadEvidenceOutput>} 사용자 업로드 다운로드 결과
 * @file https/employee/employee.http - [POST] /employee/employees
 */
export const fetchDownloadOriginalFile = async (input: TEvidenceOriginalDownloadInput): Promise<TEvidenceOriginalDownloadOutput> => {
  const { data } = await authClient.post<TEvidenceOriginalDownloadOutput>(EVIDENCE_ADMIN_ROUTE.DOWNLOAD_ORIGINAL_FILE, input);
  return data;
};

/**
 * * 분할 및 OCR API
 * @description 분할 및 OCR API 호출 함수
 * @summary [REST API] - POST | [ROUTE] - /legal/api/v1 /evidences/split-ocr
 * @param {TDownloadEvidenceInput} input - 분할 및 OCR 정보
 * @throws {AxiosError} axios error
 * @returns {Promise<TDownloadEvidenceOutput>} 분할 및 OCR 결과
 * @file https/employee/employee.http - [POST] /employee/employees
 */
export const fetchSplitOcrEvidence = async (input: TEvidenceSplitOcrInput): Promise<TEvidenceSplitOcrOutput> => {
  const { data } = await authClient.post<TEvidenceSplitOcrOutput>(EVIDENCE_ADMIN_ROUTE.FIND_SPLIT_OCR_EVIDENCE, input);
  return data;
};

/**
 * * 분할 및 OCR 요청 API
 * @description 분할 및 OCR 요청 API 호출 함수
 * @summary [REST API] - POST | [ROUTE] - /legal/api/v1 /evidences/split-ocr
 * @param {TDownloadEvidenceInput} input - 분할 및 OCR 정보
 * @throws {AxiosError} axios error
 * @returns {Promise<TDownloadEvidenceOutput>} 분할 및 OCR 결과
 * @file https/employee/employee.http - [POST] /employee/employees
 */
export const fetchSplitAndOcrRequest = async (input: TSplitAndOcrRequestInput): Promise<TSplitAndOcrRequestOutput> => {
  const { data } = await authClient.post<TSplitAndOcrRequestOutput>(EVIDENCE_ADMIN_ROUTE.SPLIT_AND_OCR_REQUEST, input);
  return data;
};

/**
 * * 증거 업로드 리스트 API
 * @description 증거 업로드 리스트 API 호출 함수
 * @summary [REST API] - POST | [ROUTE] - /legal/api/v1 /evidences/upload
 * @param {TDownloadEvidenceInput} input - 증거 업로드 정보
 * @throws {AxiosError} axios error
 * @returns {Promise<TDownloadEvidenceOutput>} 증거 업로드 결과
 * @file https/employee/employee.http - [POST] /employee/employees
 */
export const fetchAdminEvidenceList = async (input: TUploadEvidenceListInput): Promise<TUploadEvidenceListOutput> => {
  const { data } = await authClient.post<TUploadEvidenceListOutput>(EVIDENCE_ADMIN_ROUTE.FIND_EVIDENCE_LIST, input);
  return data;
};
/**
 * * 증거 업로드 API
 * @description 증거 업로드 API 호출 함수
 * @summary [REST API] - POST | [ROUTE] - /legal/api/v1 /evidences/upload
 * @param {TDownloadEvidenceInput} input - 증거 업로드 정보
 * @throws {AxiosError} axios error
 * @returns {Promise<TDownloadEvidenceOutput>} 증거 업로드 결과
 * @file https/employee/employee.http - [POST] /employee/employees
 */
export const fetchAdminUploadEvidence = async ({
  project_id,
  office_id,
  file,
  upload_version,
}: TAdminUploadEvidenceInput): Promise<TAdminUploadEvidenceOutput> => {
  const formData = new FormData();
  formData.append('project_id', project_id);
  formData.append('office_id', office_id);
  formData.append('upload_version', upload_version || '');

  if (file) {
    formData.append('file', file); // forEach 없이 추가
  }
  // console.log([...formData.entries()]);
  const { data } = await authClient.post<TAdminUploadEvidenceOutput>(EVIDENCE_ADMIN_ROUTE.EVIDENCE_ADMIN_UPLOAD, formData, {
    headers: {
      'Content-Type': 'multipart/form-data',
    },
  });
  return data;
};
/**
 * * 사이드바 메뉴 리스트 API
 * @description 사이드바 메뉴 리스트 API 호출 함수
 * @summary [REST API] - GET | [ROUTE] - /legal/api/v1 /evidences/upload
 * @throws {AxiosError} axios error
 * @returns {Promise<TDownloadEvidenceOutput>} 증거 업로드 결과
 * @file https/employee/employee.http - [POST] /employee/employees
 */
export const fetchGetSideBarMenuList = async (): Promise<TGetSideBarMenuListOutput> => {
  const { data } = await authClient.post<TGetSideBarMenuListOutput>(EVIDENCE_ADMIN_ROUTE.GET_SIDEBAR_MENU_LIST);
  return data;
};

/**
 * * 증거 항목 수정 API
 * @description 증거 항목 수정 API 호출 함수
 * @summary [REST API] - PUT | [ROUTE] - /legal/api/v1 /evidences/{evidenceId}
 * @param {TModifyEvidenceItemInput} input - 증거 항목 수정 정보
 * @throws {AxiosError} axios error
 * @returns {Promise<TModifyEvidenceItemOutput>} 증거 항목 수정 결과
 * @file https/employee/employee.http - [PUT] /employee/employees/{employeeId}
 */
export const fetchModifyEvidenceItem = async (input: TModifyEvidenceItemInput): Promise<TModifyEvidenceItemOutput> => {
  const { data } = await authClient.put<TModifyEvidenceItemOutput>(EVIDENCE_ADMIN_ROUTE.MODIFY_EVIDENCE_ITEM, input);
  // console.log(data);
  return data;
};

/**
 * * 매칭 리스트 조회 API
 * @description 매칭 리스트 조회 API 호출 함수
 * @summary [REST API] - POST | [ROUTE] - /legal/api/v1 /evidences/matching
 * @param {TFindMatchingListInput} input - 매칭 리스트 조회 정보
 * @throws {AxiosError} axios error
 * @returns {Promise<TFindMatchingListOutput>} 매칭 리스트 조회 결과
 * @file https/employee/employee.http - [POST] /employee/employees
 */
export const fetchFindMatchingList = async (input: TFindMatchingListInput): Promise<TFindMatchingListOutput> => {
  const { data } = await authClient.post<TFindMatchingListOutput>(EVIDENCE_ADMIN_ROUTE.FIND_MATCHING_LIST, input);
  return data;
};

/**
 * * 매칭 항목 수정 API
 * @description 매칭 항목 수정 API 호출 함수
 * @summary [REST API] - PUT | [ROUTE] - /legal/api/v1 /evidences/matching/{matchingId}
 * @param {TModifyMatchingItemInput} input - 매칭 항목 수정 정보
 * @throws {AxiosError} axios error
 * @returns {Promise<TModifyMatchingItemOutput>} 매칭 항목 수정 결과
 * @file https/employee/employee.http - [PUT] /employee/employees/{employeeId}
 */
export const fetchModifyMatchingItem = async (input: TModifyMatchingItemInput): Promise<TModifyMatchingItemOutput> => {
  const { data } = await authClient.put<TModifyMatchingItemOutput>(EVIDENCE_ADMIN_ROUTE.MODIFY_MATCHING_ITEM, input);
  // console.log(data);
  return data;
};

/**
 * * 매칭 업로드 API
 * @description 매칭 업로드 API 호출 함수
 * @summary [REST API] - POST | [ROUTE] - /legal/api/v1 /evidences/matching/upload
 * @param {TDownloadEvidenceInput} input - 매칭 업로드 정보
 * @throws {AxiosError} axios error
 * @returns {Promise<TDownloadEvidenceOutput>} 매칭 업로드 결과
 * @file https/employee/employee.http - [POST] /employee/employees
 */
export const fetchAdminUploadMatching = async ({
  project_id,
  office_id,
  file,
  upload_version,
}: TAdminUploadMatchingInput): Promise<TAdminUploadMatchingOutput> => {
  const formData = new FormData();
  formData.append('project_id', project_id);
  formData.append('office_id', office_id);
  formData.append('upload_version', upload_version || ''); // null이면 빈 문자열로 전달

  if (file) {
    formData.append('file', file); // forEach 없이 추가
  }
  /*  console.log([...formData.entries()]); */
  const { data } = await authClient.post<TAdminUploadMatchingOutput>(EVIDENCE_ADMIN_ROUTE.MATCHING_ADMIN_UPLOAD, formData, {
    headers: {
      'Content-Type': 'multipart/form-data',
    },
  });
  return data;
};

/**
 * * 요약 결과 리스트 조회 API
 * @description 요약 결과 리스트 조회 API 호출 함수
 * @summary [REST API] - POST | [ROUTE] - /legal/api/v1 /evidences/matching
 * @param {TFindSummaryResultListInput} input - 요약 결과 리스트 조회 정보
 * @throws {AxiosError} axios error
 * @returns {Promise<TFindSummaryListOutput>} 요약 결과 리스트 조회 결과
 * @file https/employee/employee.http - [POST] /employee/employees
 */
export const fetchFindSummaryResultList = async (input: TFindSummaryResultListInput): Promise<TFindSummaryListOutput> => {
  const { data } = await authClient.post<TFindSummaryListOutput>(EVIDENCE_ADMIN_ROUTE.FIND_SUMMARY_RESULT_LIST, input);
  return data;
};

// ! 요약 테이블 초기화 API
export const fetchResetSummaryTable = async (input: TResetSummaryTableInput): Promise<TResetSummaryTableOutput> => {
  const { data } = await authClient.delete<TResetSummaryTableOutput>(EVIDENCE_ADMIN_ROUTE.RESET_SUMMARY_TABLE, {
    data: input,
  });
  return data;
};

/**
 * * 분할 파일 다운로드 API
 * @description 분할 파일 다운로드 API 호출 함수
 * @summary [REST API] - POST | [ROUTE] - /legal/api/v1 /evidences/split-file/download
 * @param {TDownloadSplitFileInput} input - 분할 파일 다운로드 정보
 * @throws {AxiosError} axios error
 * @returns {Promise<TDownloadSplitFileOutput>} 분할 파일 다운로드 결과
 * @file https/employee/employee.http - [POST] /employee/employees
 */
export const fetchDownloadSplitFile = async (input: TDownloadSplitFileInput): Promise<TDownloadSplitFileOutput> => {
  const { data } = await authClient.post<TDownloadSplitFileOutput>(EVIDENCE_ADMIN_ROUTE.DOWNLOAD_SPLIT_FILE, input);
  return data;
};

/**
 * * 증거원본 명칭 가져오기 API
 * @description 증거원본 명칭 가져오기 API 호출 함수
 * @summary [GET] - /legal/api/v1 /evidences/original/filename/{projectId}
 */
export const fetchGetEvidenceOriginalName = async (project_id: string): Promise<TGetEvidenceOriginalNameOutput> => {
  const url = EVIDENCE_ADMIN_ROUTE.GET_EVIDENCE_ORIGINAL_NAME.replace(':project_id', project_id);
  const { data } = await authClient.get<TGetEvidenceOriginalNameOutput>(url);
  return data;
};

// ! 요약 업로드 API
export const fetchUploadSummaryFile = async ({
  project_id,
  office_id,
  file,
}: TUploadSummaryFileInput): Promise<TUploadSummaryFileOutput> => {
  const formData = new FormData();
  formData.append('project_id', project_id);
  formData.append('office_id', office_id);

  if (file) {
    formData.append('file', file); // forEach 없이 추가
  }
  // console.log([...formData.entries()]);
  const { data } = await authClient.post<TUploadSummaryFileOutput>(EVIDENCE_ADMIN_ROUTE.SUMMARY_ADMIN_UPLOAD, formData, {
    headers: {
      'Content-Type': 'multipart/form-data',
    },
  });
  return data;
};

// ! 증거 문서 생성 API
export const fetchCreateEvidence = async (input: TCreateEvidenceInput): Promise<TCreateEvidenceOutput> => {
  const { data } = await authClient.post<TCreateEvidenceOutput>(EVIDENCE_ADMIN_ROUTE.CREATE_EVIDENCE, input);
  return data;
};

// ! 증거 문서 생성 결과 조회 API
export const fetchFindCreateEvidence = async (input: TFindCreateEvidenceInput): Promise<TFindCreateEvidenceOutput> => {
  const { data } = await authClient.post<TFindCreateEvidenceOutput>(EVIDENCE_ADMIN_ROUTE.FIND_CREATE_EVIDENCE, input);
  return data;
};

// ! 증거 문서 반영 API
export const fetchApplyEvidence = async (input: TApplyEvidenceInput): Promise<TApplyEvidenceOutput> => {
  const { data } = await authClient.post<TApplyEvidenceOutput>(EVIDENCE_ADMIN_ROUTE.APPLY_EVIDENCE, input);
  return data;
};

// ! 요약 증거 문서 반영 API
export const fetchApplySummaryEvidence = async (input: TApplySummaryEvidenceInput): Promise<TApplySummaryEvidenceOutput> => {
  const { data } = await authClient.post<TApplySummaryEvidenceOutput>(EVIDENCE_ADMIN_ROUTE.APPLY_SUMMARY_EVIDENCE, input);
  return data;
};

// ! 증거원본 추가업로드 API
export const fetchAddEvidenceOriginal = async ({
  project_id,
  office_id,
  file,
  file_nm,
}: TAddEvidenceOriginalInput): Promise<TAddEvidenceOriginalOutput> => {
  const formData = new FormData();
  formData.append('project_id', project_id);
  formData.append('office_id', office_id);
  formData.append('file_nm', file_nm);

  if (file) {
    formData.append('file', file);
  }

  const { data } = await authClient.post<TAddEvidenceOriginalOutput>(EVIDENCE_ADMIN_ROUTE.ADD_EVIDENCE_ORIGINAL, formData, {
    headers: {
      'Content-Type': 'multipart/form-data',
    },
  });
  return data;
};

// ! 문서보기 조회 API

export const fetchViewAdminDocument = async (input: TViewAdminDocumentInput): Promise<Blob> => {
  const { data } = await authClient.post(EVIDENCE_ADMIN_ROUTE.VIEW_ADMIN_DOCUMENT, input, {
    responseType: 'blob',
    headers: {
      Accept: 'application/pdf',
    },
  });
  return data;
};

// ! 프로젝트 업로드 상태 조회 API
export const fetchFindProjectUploadStatus = async (input: TFindProjectUploadStatusInput): Promise<TFindProjectUploadStatusOutput> => {
  const { data } = await authClient.post<TFindProjectUploadStatusOutput>(EVIDENCE_ADMIN_ROUTE.FIND_PROJECT_UPLOAD_STATUS, input);
  return data;
};

export const fetchViewAdminEvidenceDocument = async (input: TViewAdmimEvidenceFileInput): Promise<Blob> => {
  const { data } = await authClient.post(EVIDENCE_ADMIN_ROUTE.VIEW_ADMIN_EVIDENCE_DOCUMENT, input, {
    responseType: 'blob',
    headers: {
      Accept: 'application/pdf',
    },
  });
  return data;
};

// ! 증거목록 메모, 북마크, 핀고정 초기화 API
export const fetchResetEvidenceItem = async (input: TResetEvidenceItemInput): Promise<TResetEvidenceItemOutput> => {
  const { data } = await authClient.post<TResetEvidenceItemOutput>(EVIDENCE_ADMIN_ROUTE.ADMIN_RESET_EVIDENCE_ITEM, input);
  return data;
};

/**
 * * 관리자 프로젝트 삭제 API
 * @description 관리자 프로젝트 삭제 API 호출 함수
 * @summary [REST API] - DELETE | [ROUTE] - /admin/project/:project_id/delete
 * @param {string} project_id - 삭제할 프로젝트 ID
 * @throws {AxiosError} axios error
 * @returns {Promise<TDeleteAdminCaseListOutput>} 프로젝트 삭제 결과
 */
export const fetchDeleteAdminCaseList = async (project_id: string): Promise<TDeleteAdminCaseListOutput> => {
  const url = EVIDENCE_ADMIN_ROUTE.DELETE_ADMIN_CASE_LIST.replace(':project_id', project_id);
  const { data } = await authClient.delete<TDeleteAdminCaseListOutput>(url);
  return data;
};

// ! 매칭테이블 생성된 증거문서의 파일 다운로드 API
export const fetchDownloadEvidenceFile = async (input: TDownloadEvidenceFileInput): Promise<TDownloadEvidenceFileOutput> => {
  const { data } = await authClient.post<TDownloadEvidenceFileOutput>(EVIDENCE_ADMIN_ROUTE.DOWNLOAD_EVIDENCE_FILE, input);
  return data;
};

// ! 증거목록 테이블 초기화 API
export const fetchResetEvidenceTable = async (input: TResetEvidenceTableInput): Promise<TResetEvidenceTableOutput> => {
  const { data } = await authClient.delete<TResetEvidenceTableOutput>(EVIDENCE_ADMIN_ROUTE.RESET_EVIDENCE_TABLE, {
    data: input,
  });
  return data;
};

// ! 매칭테이블 초기화 API
export const fetchResetMatchingTable = async (input: TResetMatchingTableInput): Promise<TResetMatchingTableOutput> => {
  const { data } = await authClient.delete<TResetMatchingTableOutput>(EVIDENCE_ADMIN_ROUTE.RESET_MATCHING_TABLE, {
    data: input,
  });
  return data;
};

/**
 * * 증거 원본 압축파일 직접 다운로드 API (Blob)
 * @description 증거 원본 파일들을 압축파일로 직접 다운로드하는 API 호출 함수
 * @summary [REST API] - POST | [ROUTE] - /admin/project/file/original/download
 * @param {TDownloadEvidenceOriginalFileInput} input - 압축파일 다운로드 정보
 * @throws {AxiosError} axios error
 * @returns {Promise<Blob>} 압축파일 Blob 데이터
 */
export const fetchDownloadEvidenceOriginalFileBlob = async (input: TDownloadEvidenceOriginalFileInput): Promise<Blob> => {
  const { data } = await authClient.post(EVIDENCE_ADMIN_ROUTE.DOWNLOAD_EVIDENCE_ORIGINAL_ZIP, input, {
    responseType: 'blob',
    headers: {
      Accept: 'application/zip, application/octet-stream',
    },
  });
  return data;
};

// ! 매칭테이블 압축파일 직접 다운로드 API (Blob)
export const fetchDownloadMatchingFileBlob = async (input: TDownloadMatchingFileInput): Promise<Blob> => {
  const { data } = await authClient.post(EVIDENCE_ADMIN_ROUTE.DOWNLOAD_MATCHING_FILE, input, {
    responseType: 'blob',
    headers: {
      Accept: 'application/zip, application/octet-stream',
    },
  });
  return data;
};

// ! 요약 파일 압축파일 직접 다운로드 API (Blob)
export const fetchDownloadSummaryFileBlob = async (input: TDownloadSummaryFileInput): Promise<Blob> => {
  const { data } = await authClient.post(EVIDENCE_ADMIN_ROUTE.DOWNLOAD_SUMMARY_FILE, input, {
    responseType: 'blob',
    headers: {
      Accept: 'application/zip, application/octet-stream',
    },
  });
  return data;
};

// ! 사건에 로펌 사용자 배정 API
export const fetchAssignLawyerToCase = async (input: TAssignLawyerToCaseInput): Promise<TAssignLawyerToCaseOutput> => {
  const { data } = await authClient.post<TAssignLawyerToCaseOutput>(EVIDENCE_ADMIN_ROUTE.ASSIGN_LAWYER_TO_CASE, input);
  return data;
};

// ! 전체 사용자 조회 API
export const fetchFindAllUser = async (input: TFindAllUserInput): Promise<TFindAllUserOutput> => {
  console.log('fetchFindAllUser called with input:', input);
  const { data } = await authClient.post<TFindAllUserOutput>(EVIDENCE_ADMIN_ROUTE.FIND_ALL_USER, input);
  console.log('fetchFindAllUser response:', data);
  return data;
};

// ! 사건 조회 API
export const fetchFindCase = async (project_id: string): Promise<TFindCaseOutput> => {
  const url = EVIDENCE_ADMIN_ROUTE.FIND_CASE.replace(':project_id', project_id);
  const { data } = await authClient.get<TFindCaseOutput>(url);
  return data;
};

// ! 관리자 사건 조회 API
export const fetchFindAllAdminCaseList = async (input: TFindAllAdminCaseListInput): Promise<TFindAllAdminCaseListOutput> => {
  const { data } = await authClient.post<TFindAllAdminCaseListOutput>(EVIDENCE_ADMIN_ROUTE.FIND_ALL_ADMIN_CASE_LIST, input);
  return data;
};

// ! 전체 사건 필터 갯수 조회 API
export const fetchGetAllCaseFilterCount = async (): Promise<TGetAllCaseFilterCountOutput> => {
  const { data } = await authClient.get<TGetAllCaseFilterCountOutput>(EVIDENCE_ADMIN_ROUTE.GET_ALL_CASE_FILTER_COUNT);
  return data;
};

// ! 프로젝트 결제 상태 변경 API
export const fetchChangeProjectPaymentStatus = async (
  input: TChangeProjectPaymentStatusInput,
): Promise<TChangeProjectPaymentStatusOutput> => {
  const { data } = await authClient.put<TChangeProjectPaymentStatusOutput>(EVIDENCE_ADMIN_ROUTE.CHANGE_PROJECT_PAYMENT_STATUS, input);
  return data;
};

// ! 날짜별 업로드 현황
export const fetchGetDailyUploadStatusList = async (input: TGetDailyUploadStatusListInput): Promise<TGetDailyUploadStatusListOutput> => {
  const { data } = await authClient.post<TGetDailyUploadStatusListOutput>(EVIDENCE_ADMIN_ROUTE.GET_DAILY_UPLOAD_STATUS_LIST, input);
  return data;
};

// ! 어드민 비밀번호 변경 API
export const fetchChangeAdminPassword = async (input: TChangeAdminPasswordInput): Promise<TChangeAdminPasswordOutput> => {
  const { data } = await authClient.post<TChangeAdminPasswordOutput>(EVIDENCE_ADMIN_ROUTE.CHANGE_ADMIN_PASSWORD, input);
  return data;
};

// ! 결제기능 사용 on-off API
export const fetchChangePaymentFunction = async (input: TChangePaymentFunctionInput): Promise<TChangePaymentFunctionOutput> => {
  const { data } = await authClient.put<TChangePaymentFunctionOutput>(EVIDENCE_ADMIN_ROUTE.CHANGE_PAYMENT_FUNCTION, input);
  return data;
};

// ! 결제 설정 조회 API
export const fetchGetPaymentSettings = async (): Promise<TGetPaymentSettingsOutput> => {
  const { data } = await authClient.get<TGetPaymentSettingsOutput>(EVIDENCE_ADMIN_ROUTE.GET_PAYMENT_SETTINGS);
  return data;
};

// ! OCR관리상태 변경 API
export const fetchChangeOcrManagementStatus = async (input: TChangeOcrManagementStatusInput): Promise<TChangeOcrManagementStatusOutput> => {
  const { data } = await authClient.put<TChangeOcrManagementStatusOutput>(EVIDENCE_ADMIN_ROUTE.CHANGE_OCR_MANAGEMENT_STATUS, input);
  return data;
};

// ! 전체 사용자 조회 필터 조회 API
export const fetchFindCreateEvidenceFilter = async (input: TGetAllUserFilterInput): Promise<TGetAllUserFilterOutput> => {
  const { data } = await authClient.post<TGetAllUserFilterOutput>(EVIDENCE_ADMIN_ROUTE.FIND_CREATE_EVIDENCE_FILTER, input);
  return data;
};

// ! 증거문서 생성조회 필터 조회 API
export const fetchFindCreateEvidenceFilterOutput = async (
  input: TFindCreateEvidenceFilterInput,
): Promise<TFindCreateEvidenceFilterOutput> => {
  const { data } = await authClient.post<TFindCreateEvidenceFilterOutput>(EVIDENCE_ADMIN_ROUTE.FIND_CREATE_EVIDENCE_FILTER_OUTPUT, input);
  return data;
};
