import { AxiosError as _AxiosError } from 'axios';
// import { map } from 'lodash';

import { authClient, unAuthClient } from '@apis/index';
import type {
  TSearchEvidencesInput,
  TFindEvidenceOutput,
  TCreateEvidenceMemoInput,
  TCreateEvidenceMemoOutput,
  TListEvidencesInput,
  TListEvidenceOutput,
  TCreateEvidenceBookMarkInput,
  TCreateEvidenceBookMarkOutput,
  TModifyEvidenceMemoInput,
  TModifyEvidenceMemoOutput,
  TCreateEvidenceUserInput,
  TCreateEvidenceUserOutput,
  TDeleteEvidenceMemoInput,
  TDeleteEvidenceMemoOutput,
  TListProjectInput,
  TListProjectOutput,
  TCreateProjectInput,
  TCreateProjectOutput,
  TJoinProjectRequestInput,
  TJoinProjectRequestOutput,
  TJoinProjectRequestListInput,
  TJoinProjectRequestListOutput,
  TProcessJoinRequestInput,
  TProcessJoinRequestOutput,
  TUploadFileInput,
  TUploadFileOutput,
  TUnreadNotificationOutput,
  TListNotificationInput,
  TListNotificationOutput,
  TListProjectFilterInput,
  TListProjectFilterOutput,
  TSendAuthEmailInput,
  TSendAuthEmailOutput,
  TViewDocumentInput,
  TDownloadDocumentInput,
  TDownloadDocumentOutput,
  TListHistoryUserFilterInput,
  TListHistoryUserFilterOutput,
  TListHistoryInput,
  TListHistoryOutput,
  TListHistoryActionFilterOutput,
  TCheckAuthEmailOutput,
  TSendResetPasswordEmailInput,
  TSendResetPasswordEmailOutput,
  TResetPasswordInput,
  TResetPasswordOutput,
  TGetUserInfoOutput,
  TUpdateUserInfoInput,
  TUpdateUserInfoOutput,
  TCheckUserExistOutput,
  TUpdateUserPhotoInput,
  TUpdateUserPhotoOutput,
  TRequestA2D2Input,
  TRequestA2D2Output,
  TListProjectMemberOutput,
  TToggleEvidencePinInput,
  TToggleEvidencePinOutput,
  TGetFilterCountOutput,
  TInitUserPhotoOutput,
  TRequestSuperPermissionInput,
  TRequestSuperPermissionOutput,
  TExitProjectInput,
  TExitProjectOutput,
  TDelegateSuperPermissionInput,
  TDelegateSuperPermissionOutput,
  TExcludeProjectInput,
  TExcludeProjectOutput,
  TListMemoedEvidencesInput,
  TListMemoedEvidencesOutput,
  TListRecentEvidencesInput,
  TListRecentEvidencesOutput,
  TListBookmarkedEvidencesInput,
  TListBookmarkedEvidencesOutput,
  TPowerSearchInput,
  TPowerSearchOutput,
  TListEvidenceFilterInput,
  TListEvidenceFilterOutput,
  TDragAndDropEvidenceInput,
  TDragAndDropEvidenceOutput,
  TReadAllNotificationOutput,
  TResignUserInput,
  TResignUserOutput,
  TResignSuperUserInput,
  TResignSuperUserOutput,
  TResignSelfInput,
  TResignSelfOutput,
  TEditProjectInput,
  TEditProjectOutput,
  TVerifyEmailTokenOutput,
  TSettingPasswordInput,
  TSettingPasswordOutput,
  TAddHistoryInput,
  TAddHistoryOutput,
  TSendAuthNumberEmailInput,
  TSendAuthNumberEmailOutput,
  TCheckAuthNumberEmailInput,
  TCheckAuthNumberEmailOutput,
  TSendEmailNotificationInput,
  TSendEmailNotificationOutput,
  TSearchOfficeNmInput,
  TSearchOfficeNmOutput,
  TCreateEvidenceUserDomainInput,
  TAddProjectInvitationInput,
  TAddProjectInvitationOutput,
  TCancelProjectInvitationInput,
  TCancelProjectInvitationOutput,
  TClickAnalysisMenuOutput,
  TClickAnalysisMenuTodayOutput,
  TVerifyLawyerInput,
  TVerifyLawyerOutput,
  TUpdateCertificationStatusInput,
  TUpdateCertificationStatusOutput,
  TRejectProjectInvitationInput,
  TRejectProjectInvitationOutput,
  TGetProjectListForPaymentManagementInput,
  TGetProjectListForPaymentManagementOutput,
  TCreateEvidenceTagInput,
  TCreateEvidenceTagOutput,
  TUpdateEvidenceTagInput,
  TUpdateEvidenceTagOutput,
  TDeleteEvidenceTagSetInput,
  TDeleteEvidenceTagSetOutput,
  TGetEvidenceTagInput,
  TGetEvidenceTagOutput,
  TListEvidenceTagsInput,
  TListEvidenceTagsOutput,
  TListEvidenceTagsDistinctOutput,
  TAssignEvidenceTagInput,
  TAssignEvidenceTagOutput,
  TDeleteEvidenceTagInput,
  TDeleteEvidenceTagOutput,
  TListEvidenceTagsProjectDistinctOutput,
  TUpdateEvidenceTagOrderInput,
  TUpdateEvidenceTagOrderOutput,
  TRegisterEvidenceInput,
  TRegisterEvidenceOutput,
  TUpdateEvidenceInput,
  TUpdateEvidenceOutput,
  TListEvidenceOpinionInput,
  TListEvidenceOpinionOutput,
} from '@/apis/type';

type TEvidendQueryKey = {
  FIND_EVIDENCE: 'FIND_EVIDENCE';
  FIND_LIST_EVIDENCE: 'FIND_LIST_EVIDENCE';
  FIND_LIST_PROJECT: 'FIND_LIST_PROJECT';
  FIND_JOIN_PROJECT_REQUEST: 'FIND_JOIN_PROJECT_REQUEST';
  FINE_LIST_HISTORY_USER_FILTER: 'FINE_LIST_HISTORY_USER_FILTER';
  FINE_LIST_HISTORY: 'FINE_LIST_HISTORY';
  FIND_LIST_HISTORY_ACTION_FILTER: 'FIND_LIST_HISTORY_ACTION_FILTER';
  FIND_LIST_EVIDENCE_FILTER: 'FIND_LIST_EVIDENCE_FILTER';
  FIND_USER_INFO: 'FIND_USER_INFO';
  FINE_LOGIN_CHECK: 'FINE_LOGIN_CHECK';
  FINE_BOOKMARKED_EVIDENCES: 'FINE_BOOKMARKED_EVIDENCES';
  FINE_RECENT_EVIDENCES: 'FINE_RECENT_EVIDENCES';
  FINE_MEMOED_EVIDENCES: 'FINE_MEMOED_EVIDENCES';
  FINE_POWER_SEARCH: 'FINE_POWER_SEARCH';
  REJECT_PROJECT_INVITATION: 'REJECT_PROJECT_INVITATION';

  // Create 관련
  CREATE_EVIDENCE_PIN: 'CREATE_EVIDENCE_PIN';
  CREATE_EVIDENCE_MEMO: 'CREATE_EVIDENCE_MEMO';
  CREATE_EVIDENCE_BOOKMARK: 'CREATE_EVIDENCE_BOOKMARK';
  CREATE_EVIDENCE_USER: 'CREATE_EVIDENCE_USER';
  CREATE_EVIDENCE_DOMAIN: 'CREATE_EVIDENCE_DOMAIN';
  CREATE_PROJECT: 'CREATE_PROJECT';
  CREATE_PROJECT_FILTER: 'CREATE_PROJECT_FILTER';
  CREATE_HISTORY: 'CREATE_HISTORY';
  ADD_PROJECT_INVITATION: 'ADD_PROJECT_INVITATION';
  CANCEL_PROJECT_INVITATION: 'CANCEL_PROJECT_INVITATION';
  SEND_EMAIL_NOTIFICATION: 'SEND_EMAIL_NOTIFICATION';
  DRAG_AND_DROP_EVIDENCE: 'DRAG_AND_DROP_EVIDENCE';
  UPLOAD_FILE: 'UPLOAD_FILE';
  UPLOAD_USER_PHOTO: 'UPLOAD_USER_PHOTO';
  REQUEST_A2D2: 'REQUEST_A2D2';
  UPDATE_USER_INFO: 'UPDATE_USER_INFO';

  DELEGATE_SUPER_PERMISSION: 'DELEGATE_SUPER_PERMISSION';
  SEND_AUTH_EMAIL: 'SEND_AUTH_EMAIL';
  SEND_RESET_PASSWORD_EMAIL: 'SEND_RESET_PASSWORD_EMAIL';
  SEND_AUTH_NUMBER_EMAIL: 'SEND_AUTH_NUMBER_EMAIL';
  CHECK_AUTH_NUMBER_EMAIL: 'CHECK_AUTH_NUMBER_EMAIL';
  VIEW_DOCUMENT: 'VIEW_DOCUMENT';
  DOWNLOAD_DOCUMENT: 'DOWNLOAD_DOCUMENT';

  EXIT_PROJECT: 'EXIT_PROJECT';
  EXCLUDE_PROJECT: 'EXCLUDE_PROJECT';

  NOTIFICATION_ALL_READ: 'NOTIFICATION_ALL_READ';
  NOTIFICATION_UNREAD_COUNT: 'NOTIFICATION_UNREAD_COUNT';
  NOTIFICATION_LIST: 'NOTIFICATION_LIST';

  REQUEST_JOIN_PROJECT: 'REQUEST_JOIN_PROJECT';
  REQUEST_JOIN_ACCEPT: 'REQUEST_JOIN_ACCEPT';
  REQUEST_SUPER_PERMISSION: 'REQUEST_SUPER_PERMISSION';
  RESET_PASSWORD: 'RESET_PASSWORD';
  RESET_USER_PHOTO: 'RESET_USER_PHOTO';
  // Modify 관련
  MODIFY_EVIDENCE_MEMO: 'MODIFY_EVIDENCE_MEMO';
  MODIFY_PROJECT: 'MODIFY_PROJECT';
  // 삭제관련
  DELETE_EVIDENCE_MEMO: 'DELETE_EVIDENCE_MEMO';
  // 퇴사
  RESIGN_USER: 'RESIGN_USER';
  RESIGN_SUPER_USER: 'RESIGN_SUPER_USER';
  RESIGN_SELF: 'RESIGN_SELF';
  SETTING_PASSWORD: 'SETTING_PASSWORD';
  // 로그아웃
  LOGOUT: 'LOGOUT';
  SEARCH_OFFICE_NM: 'SEARCH_OFFICE_NM';
  CLICK_ANALYSIS_MENU: 'CLICK_ANALYSIS_MENU';
  CLICK_ANALYSIS_MENU_TODAY: 'CLICK_ANALYSIS_MENU_TODAY';
  VERIFY_LAWYER: 'VERIFY_LAWYER';
  UPDATE_CERTIFICATION_STATUS: 'UPDATE_CERTIFICATION_STATUS';
  GET_PROJECT_LIST_FOR_PAYMENT_MANAGEMENT: 'GET_PROJECT_LIST_FOR_PAYMENT_MANAGEMENT';
  // !태그관련
  CREATE_EVIDENCE_TAG: 'CREATE_EVIDENCE_TAG';
  UPDATE_EVIDENCE_TAG: 'UPDATE_EVIDENCE_TAG';
  DELETE_EVIDENCE_TAG: 'DELETE_EVIDENCE_TAG';
  GET_EVIDENCE_TAG: 'GET_EVIDENCE_TAG';
  LIST_EVIDENCE_TAGS: 'LIST_EVIDENCE_TAGS';
  LIST_EVIDENCE_TAGS_DISTINCT: 'LIST_EVIDENCE_TAGS_DISTINCT';
  LIST_ASSIGN_EVIDENCE_TAG: 'LIST_ASSIGN_EVIDENCE_TAG';
  DELETE_ASSIGN_EVIDENCE_TAG: 'DELETE_ASSIGN_EVIDENCE_TAG';
  LIST_ASSIGN_TAG_PROJECT: 'LIST_ASSIGN_TAG_PROJECT';
  LIST_EVIDENCE_TAGS_ORDER: 'LIST_EVIDENCE_TAGS_ORDER';

  // !증거인부관련
  REGISTER_EVIDENCE: 'REGISTER_EVIDENCE';
  UPDATE_EVIDENCE: 'UPDATE_EVIDENCE';
  LIST_EVIDENCE_OPINION: 'LIST_EVIDENCE_OPINION';
};
type TEvidenceRouteKey = {
  FIND_EVIDENCE: '/evidences/search';
  FIND_LIST_EVIDENCE: '/evidences/list';
  FIND_LIST_PROJECT: '/project/all';
  FIND_JOIN_PROJECT_REQUEST: '/project/join/request/list';
  FINE_LIST_HISTORY_USER_FILTER: '/history/user-filters';
  FINE_LIST_HISTORY: '/history/list';
  FIND_LIST_HISTORY_ACTION_FILTER: '/history/action-filters';
  FIND_LIST_EVIDENCE_FILTER: '/evidences/filter';
  FIND_USER_INFO: '/user';
  FINE_LOGIN_CHECK: '/auth/email/check';
  FINE_BOOKMARKED_EVIDENCES: '/evidences/bookmark/list';
  FINE_RECENT_EVIDENCES: '/evidences/recent/list';
  FINE_MEMOED_EVIDENCES: '/evidences/memo/list';
  FINE_POWER_SEARCH: '/project/join/request/process';
  DELEGATE_SUPER_PERMISSION: '/project/join/transfer';
  DRAG_AND_DROP_EVIDENCE: '/evidences/move';
  SEND_EMAIL_NOTIFICATION: '/project/work/addition';
  // Create 관련
  CREATE_EVIDENCE_PIN: '/pin/toggle';
  CREATE_EVIDENCE_MEMO: '/memo/create';
  CREATE_EVIDENCE_BOOKMARK: '/bookmark/toggle';
  CREATE_EVIDENCE_USER: '/auth/register';
  CREATE_EVIDENCE_DOMAIN: '/auth/register/personal';
  CREATE_PROJECT: '/project/create';
  CREATE_PROJECT_FILTER: '/project/filter';
  CREATE_HISTORY: '/history/create';
  ADD_PROJECT_INVITATION: '/project/join/invite';
  CANCEL_PROJECT_INVITATION: '/project/join/invite/cancel';
  EXIT_PROJECT: '/project/join/leave';
  EXCLUDE_PROJECT: '/project/join/ban';
  UPLOAD_FILE: '/file/original/upload';
  UPLOAD_USER_PHOTO: '/user/profile/upload';
  REQUEST_A2D2: '/project/work/request';
  UPDATE_USER_INFO: '/user/modify';
  REJECT_PROJECT_INVITATION: '/project/join/invite/reject';
  SEND_AUTH_EMAIL: '/auth/email/request';
  SEND_RESET_PASSWORD_EMAIL: '/auth/password/reset/request';
  SEND_AUTH_NUMBER_EMAIL: '/auth/email/request/code';
  CHECK_AUTH_NUMBER_EMAIL: '/auth/email/verify/code';
  VIEW_DOCUMENT: '/evidences/document';
  DOWNLOAD_DOCUMENT: '/evidences/download';

  NOTIFICATION_ALL_READ: '/notification/read-all';
  NOTIFICATION_UNREAD_COUNT: '/notification/unread';
  NOTIFICATION_LIST: '/notification/list';

  REQUEST_SUPER_PERMISSION: '/project/join/request/super';
  REQUEST_JOIN_PROJECT: '/project/join/request';
  REQUEST_JOIN_ACCEPT: '/project/join/request/process';
  RESET_PASSWORD: '/auth/password/reset';
  RESET_USER_PHOTO: '/user/profile/reset';
  // Modify 관련
  MODIFY_EVIDENCE_MEMO: '/memo/modify';
  MODIFY_PROJECT: '/project/modify';
  // 삭제관련
  DELETE_EVIDENCE_MEMO: '/memo/delete';

  // 퇴사
  RESIGN_USER: '/project/join/resign';
  RESIGN_SUPER_USER: '/project/join/resign/transfer/self';
  RESIGN_SELF: '/project/join/resign/self';
  SETTING_PASSWORD: '/user/password/modify';

  // 로그아웃
  LOGOUT: '/auth/logout';
  SEARCH_OFFICE_NM: '/office/search';
  CLICK_ANALYSIS_MENU: '/ai/category/tracker/:project_id';
  CLICK_ANALYSIS_MENU_TODAY: '/ai/ai-analysis/click-count/:project_id';
  VERIFY_LAWYER: '/auth/lawyer/verify';
  UPDATE_CERTIFICATION_STATUS: 'user/:user_id/certify-status';
  GET_PROJECT_LIST_FOR_PAYMENT_MANAGEMENT: '/subscription/project/list';

  // !증거인부관련
  REGISTER_EVIDENCE: '/opinion/create';
  UPDATE_EVIDENCE: '/opinion/modify';
  LIST_EVIDENCE_OPINION: '/opinion/list';

  // !태그관련
  CREATE_EVIDENCE_TAG: '/tag-sets/create';
  UPDATE_EVIDENCE_TAG: '/tag-sets/modify';
  DELETE_EVIDENCE_TAG: '/tag-sets/delete';
  GET_EVIDENCE_TAG: '/tag-sets/:tag_set_id';
  LIST_EVIDENCE_TAGS: '/tag-sets/list/:project_id';
  LIST_EVIDENCE_TAGS_DISTINCT: '/tag-sets/project/:project_id/distinct';
  LIST_EVIDENCE_TAGS_ORDER: '/tag-sets/reorder';
  LIST_ASSIGN_EVIDENCE_TAG: '/tags/create';
  DELETE_ASSIGN_EVIDENCE_TAG: '/tags/delete';
  LIST_ASSIGN_TAG_PROJECT: '/tags/list/:project_id';
};
export const EVIDENCE_QUERY_KEY: TEvidendQueryKey = {
  FIND_EVIDENCE: 'FIND_EVIDENCE',
  FIND_LIST_EVIDENCE: 'FIND_LIST_EVIDENCE',
  FIND_LIST_PROJECT: 'FIND_LIST_PROJECT',
  FIND_JOIN_PROJECT_REQUEST: 'FIND_JOIN_PROJECT_REQUEST',
  FINE_LIST_HISTORY_USER_FILTER: 'FINE_LIST_HISTORY_USER_FILTER',
  FINE_LIST_HISTORY: 'FINE_LIST_HISTORY',
  FIND_LIST_HISTORY_ACTION_FILTER: 'FIND_LIST_HISTORY_ACTION_FILTER',
  FIND_LIST_EVIDENCE_FILTER: 'FIND_LIST_EVIDENCE_FILTER',
  FIND_USER_INFO: 'FIND_USER_INFO',
  FINE_LOGIN_CHECK: 'FINE_LOGIN_CHECK',
  FINE_BOOKMARKED_EVIDENCES: 'FINE_BOOKMARKED_EVIDENCES',
  FINE_RECENT_EVIDENCES: 'FINE_RECENT_EVIDENCES',
  FINE_MEMOED_EVIDENCES: 'FINE_MEMOED_EVIDENCES',
  FINE_POWER_SEARCH: 'FINE_POWER_SEARCH',
  EXIT_PROJECT: 'EXIT_PROJECT',
  EXCLUDE_PROJECT: 'EXCLUDE_PROJECT',
  DRAG_AND_DROP_EVIDENCE: 'DRAG_AND_DROP_EVIDENCE',
  SEND_EMAIL_NOTIFICATION: 'SEND_EMAIL_NOTIFICATION',
  ADD_PROJECT_INVITATION: 'ADD_PROJECT_INVITATION',
  CANCEL_PROJECT_INVITATION: 'CANCEL_PROJECT_INVITATION',
  REJECT_PROJECT_INVITATION: 'REJECT_PROJECT_INVITATION',
  // Create 관련
  CREATE_EVIDENCE_PIN: 'CREATE_EVIDENCE_PIN',
  CREATE_EVIDENCE_MEMO: 'CREATE_EVIDENCE_MEMO',
  CREATE_EVIDENCE_BOOKMARK: 'CREATE_EVIDENCE_BOOKMARK',
  CREATE_EVIDENCE_USER: 'CREATE_EVIDENCE_USER',
  CREATE_EVIDENCE_DOMAIN: 'CREATE_EVIDENCE_DOMAIN',
  CREATE_PROJECT: 'CREATE_PROJECT',
  CREATE_PROJECT_FILTER: 'CREATE_PROJECT_FILTER',
  CREATE_HISTORY: 'CREATE_HISTORY',

  DELEGATE_SUPER_PERMISSION: 'DELEGATE_SUPER_PERMISSION',
  UPLOAD_FILE: 'UPLOAD_FILE',
  UPLOAD_USER_PHOTO: 'UPLOAD_USER_PHOTO',
  REQUEST_A2D2: 'REQUEST_A2D2',
  UPDATE_USER_INFO: 'UPDATE_USER_INFO',
  SEND_AUTH_EMAIL: 'SEND_AUTH_EMAIL',
  SEND_RESET_PASSWORD_EMAIL: 'SEND_RESET_PASSWORD_EMAIL',
  SEND_AUTH_NUMBER_EMAIL: 'SEND_AUTH_NUMBER_EMAIL',
  CHECK_AUTH_NUMBER_EMAIL: 'CHECK_AUTH_NUMBER_EMAIL',
  VIEW_DOCUMENT: 'VIEW_DOCUMENT',
  DOWNLOAD_DOCUMENT: 'DOWNLOAD_DOCUMENT',

  NOTIFICATION_ALL_READ: 'NOTIFICATION_ALL_READ',
  NOTIFICATION_UNREAD_COUNT: 'NOTIFICATION_UNREAD_COUNT',
  NOTIFICATION_LIST: 'NOTIFICATION_LIST',

  REQUEST_JOIN_PROJECT: 'REQUEST_JOIN_PROJECT',
  REQUEST_JOIN_ACCEPT: 'REQUEST_JOIN_ACCEPT',
  REQUEST_SUPER_PERMISSION: 'REQUEST_SUPER_PERMISSION',
  RESET_PASSWORD: 'RESET_PASSWORD',
  RESET_USER_PHOTO: 'RESET_USER_PHOTO',
  // Modify 관련
  MODIFY_EVIDENCE_MEMO: 'MODIFY_EVIDENCE_MEMO',
  MODIFY_PROJECT: 'MODIFY_PROJECT',
  // 삭제관련
  DELETE_EVIDENCE_MEMO: 'DELETE_EVIDENCE_MEMO',
  // 퇴사
  RESIGN_USER: 'RESIGN_USER',
  RESIGN_SUPER_USER: 'RESIGN_SUPER_USER',
  RESIGN_SELF: 'RESIGN_SELF',
  SETTING_PASSWORD: 'SETTING_PASSWORD',

  // 로그아웃
  LOGOUT: 'LOGOUT',
  SEARCH_OFFICE_NM: 'SEARCH_OFFICE_NM',
  CLICK_ANALYSIS_MENU: 'CLICK_ANALYSIS_MENU',
  CLICK_ANALYSIS_MENU_TODAY: 'CLICK_ANALYSIS_MENU_TODAY',
  VERIFY_LAWYER: 'VERIFY_LAWYER',
  UPDATE_CERTIFICATION_STATUS: 'UPDATE_CERTIFICATION_STATUS',
  GET_PROJECT_LIST_FOR_PAYMENT_MANAGEMENT: 'GET_PROJECT_LIST_FOR_PAYMENT_MANAGEMENT',
  // !태그관련
  CREATE_EVIDENCE_TAG: 'CREATE_EVIDENCE_TAG',
  UPDATE_EVIDENCE_TAG: 'UPDATE_EVIDENCE_TAG',
  DELETE_EVIDENCE_TAG: 'DELETE_EVIDENCE_TAG',
  GET_EVIDENCE_TAG: 'GET_EVIDENCE_TAG',
  LIST_EVIDENCE_TAGS: 'LIST_EVIDENCE_TAGS',
  LIST_EVIDENCE_TAGS_DISTINCT: 'LIST_EVIDENCE_TAGS_DISTINCT',
  LIST_ASSIGN_EVIDENCE_TAG: 'LIST_ASSIGN_EVIDENCE_TAG',
  DELETE_ASSIGN_EVIDENCE_TAG: 'DELETE_ASSIGN_EVIDENCE_TAG',
  LIST_ASSIGN_TAG_PROJECT: 'LIST_ASSIGN_TAG_PROJECT',
  LIST_EVIDENCE_TAGS_ORDER: 'LIST_EVIDENCE_TAGS_ORDER',
  // !증거인부관련
  REGISTER_EVIDENCE: 'REGISTER_EVIDENCE',
  UPDATE_EVIDENCE: 'UPDATE_EVIDENCE',
  LIST_EVIDENCE_OPINION: 'LIST_EVIDENCE_OPINION',
};

const EVIDENCE_ROUTE: TEvidenceRouteKey = {
  FIND_EVIDENCE: '/evidences/search',
  FIND_LIST_EVIDENCE: '/evidences/list',
  FIND_LIST_PROJECT: '/project/all',
  FIND_JOIN_PROJECT_REQUEST: '/project/join/request/list',
  FINE_LIST_HISTORY_USER_FILTER: '/history/user-filters',
  FINE_LIST_HISTORY: '/history/list',
  FIND_LIST_HISTORY_ACTION_FILTER: '/history/action-filters',
  FIND_LIST_EVIDENCE_FILTER: '/evidences/filter',
  FIND_USER_INFO: '/user',
  FINE_LOGIN_CHECK: '/auth/email/check',
  FINE_BOOKMARKED_EVIDENCES: '/evidences/bookmark/list',
  FINE_RECENT_EVIDENCES: '/evidences/recent/list',
  FINE_MEMOED_EVIDENCES: '/evidences/memo/list',
  FINE_POWER_SEARCH: '/project/join/request/process',
  DRAG_AND_DROP_EVIDENCE: '/evidences/move',
  SEND_EMAIL_NOTIFICATION: '/project/work/addition',
  DELEGATE_SUPER_PERMISSION: '/project/join/transfer',
  EXIT_PROJECT: '/project/join/leave',
  EXCLUDE_PROJECT: '/project/join/ban',
  ADD_PROJECT_INVITATION: '/project/join/invite',
  CANCEL_PROJECT_INVITATION: '/project/join/invite/cancel',
  REJECT_PROJECT_INVITATION: '/project/join/invite/reject',
  // Create 관련
  CREATE_EVIDENCE_PIN: '/pin/toggle',
  CREATE_EVIDENCE_MEMO: '/memo/create',
  CREATE_EVIDENCE_BOOKMARK: '/bookmark/toggle',
  CREATE_EVIDENCE_USER: '/auth/register',
  CREATE_EVIDENCE_DOMAIN: '/auth/register/personal',
  CREATE_PROJECT: '/project/create',
  CREATE_PROJECT_FILTER: '/project/filter',
  CREATE_HISTORY: '/history/create',
  DOWNLOAD_DOCUMENT: '/evidences/download',

  NOTIFICATION_ALL_READ: '/notification/read-all',
  NOTIFICATION_UNREAD_COUNT: '/notification/unread',
  NOTIFICATION_LIST: '/notification/list',

  UPLOAD_FILE: '/file/original/upload',
  UPLOAD_USER_PHOTO: '/user/profile/upload',
  REQUEST_A2D2: '/project/work/request',
  UPDATE_USER_INFO: '/user/modify',
  SEND_AUTH_EMAIL: '/auth/email/request',
  SEND_RESET_PASSWORD_EMAIL: '/auth/password/reset/request',
  SEND_AUTH_NUMBER_EMAIL: '/auth/email/request/code',
  CHECK_AUTH_NUMBER_EMAIL: '/auth/email/verify/code',
  VIEW_DOCUMENT: '/evidences/document',

  REQUEST_SUPER_PERMISSION: '/project/join/request/super',
  REQUEST_JOIN_PROJECT: '/project/join/request',
  REQUEST_JOIN_ACCEPT: '/project/join/request/process',
  RESET_PASSWORD: '/auth/password/reset',
  RESET_USER_PHOTO: '/user/profile/reset',
  // Modify 관련
  MODIFY_EVIDENCE_MEMO: '/memo/modify',
  MODIFY_PROJECT: '/project/modify',
  // 삭제관련
  DELETE_EVIDENCE_MEMO: '/memo/delete',
  // 퇴사
  RESIGN_USER: '/project/join/resign',
  RESIGN_SUPER_USER: '/project/join/resign/transfer/self',
  RESIGN_SELF: '/project/join/resign/self',
  SETTING_PASSWORD: '/user/password/modify',
  // 로그아웃
  LOGOUT: '/auth/logout',
  SEARCH_OFFICE_NM: '/office/search',
  CLICK_ANALYSIS_MENU: '/ai/category/tracker/:project_id',
  CLICK_ANALYSIS_MENU_TODAY: '/ai/ai-analysis/click-count/:project_id',
  VERIFY_LAWYER: '/auth/lawyer/verify',
  UPDATE_CERTIFICATION_STATUS: 'user/:user_id/certify-status',
  GET_PROJECT_LIST_FOR_PAYMENT_MANAGEMENT: '/subscription/project/list',

  // !태그관련
  CREATE_EVIDENCE_TAG: '/tag-sets/create',
  UPDATE_EVIDENCE_TAG: '/tag-sets/modify',
  DELETE_EVIDENCE_TAG: '/tag-sets/delete',
  GET_EVIDENCE_TAG: '/tag-sets/:tag_set_id',
  LIST_EVIDENCE_TAGS: '/tag-sets/list/:project_id',
  LIST_EVIDENCE_TAGS_ORDER: '/tag-sets/reorder',
  LIST_EVIDENCE_TAGS_DISTINCT: '/tag-sets/project/:project_id/distinct',
  LIST_ASSIGN_EVIDENCE_TAG: '/tags/create',
  DELETE_ASSIGN_EVIDENCE_TAG: '/tags/delete',
  LIST_ASSIGN_TAG_PROJECT: '/tags/list/:project_id',

  // !증거인부관련
  REGISTER_EVIDENCE: '/opinion/create',
  UPDATE_EVIDENCE: '/opinion/modify',
  LIST_EVIDENCE_OPINION: '/opinion/list',
};

/**
 * * 증거 검색 API
 * @description 증거 검색 API 호출 함수
 * @summary [REST API] - POST | [ROUTE] - /legal/api/v1 /evidences/search
 * @param {TSearchEvidencesInput} input - 증거 검색 정보
 * @throws {AxiosError} axios error
 * @returns {Promise<TSearchEvidencesOutput>} 증거 검색 결과
 * @file https/employee/employee.http - [POST] /employee/employees
 * @see {@link https://planetary-satellite-992503-2597.postman.co/workspace/legal-service~fe225984-e981-4d48-81d6-6ea8f99e599a/collection/37931204-1db99e31-9bce-4095-b173-2c5f07389726?action=share&creator=37936246}
 */
export const fetchFindEvidence = async (input: TSearchEvidencesInput): Promise<TFindEvidenceOutput> => {
  const { data } = await authClient.post<TFindEvidenceOutput>(EVIDENCE_ROUTE.FIND_EVIDENCE, input);
  return data;
};
/**
 * * 증거 리스트 API
 * @description 증거 검색 API 호출 함수
 * @summary [REST API] - POST | [ROUTE] - /legal/api/v1 /evidences/search
 * @param {TSearchEvidencesInput} input - 증거 검색 정보
 * @throws {AxiosError} axios error
 * @returns {Promise<TSearchEvidencesOutput>} 증거 검색 결과
 * @file https/employee/employee.http - [POST] /employee/employees
 */
export const fetchListEvidence = async (input: TListEvidencesInput): Promise<TListEvidenceOutput> => {
  const { data } = await authClient.post<TListEvidenceOutput>(EVIDENCE_ROUTE.FIND_LIST_EVIDENCE, input);
  return data;
};

/**
 * * 메모 생성 API
 * @description 메모 생성 API 호출 함수
 * @summary [REST API] - POST | [ROUTE] - /legal/api/v1 /memo/create
 * @param {TCreateEvidenceMemoInput} input - 메모 생성 정보
 * @throws {AxiosError} axios error
 * @returns {Promise<TCreateEvidenceMemoOutput>} 메모 생성 결과
 * @file
 */
export const fetchCreateEvidenceMemo = async (input: TCreateEvidenceMemoInput): Promise<TCreateEvidenceMemoOutput> => {
  const { data } = await authClient.post<TCreateEvidenceMemoOutput>(EVIDENCE_ROUTE.CREATE_EVIDENCE_MEMO, input);
  return data;
};

/**
 * * 메모 수정 API
 * @description 메모 수정 API 호출 함수
 * @summary [REST API] - PUT | [ROUTE] - /memo/modify
 * @param {TModifyEvidenceMemoInput} input - 메모 수정 정보
 * @throws {AxiosError} axios error
 * @returns {Promise<TModifyEvidenceMemoOutput>} 메모 수정 결과
 */
export const fetchModifyEvidenceMemo = async (input: TModifyEvidenceMemoInput): Promise<TModifyEvidenceMemoOutput> => {
  const { data } = await authClient.put<TModifyEvidenceMemoOutput>(EVIDENCE_ROUTE.MODIFY_EVIDENCE_MEMO, input);
  return data;
};
/**
 * * 메모 삭제 API
 * @description 메모 삭제 API 호출 함수
 * @summary [REST API] - DELETE | [ROUTE] - /memo/delete
 * @param {TDeleteEvidenceMemoInput} input - 메모 삭제 정보
 * @throws {AxiosError} axios error
 * @returns {Promise<TDeleteEvidenceMemoOutput>} 메모 삭제 결과
 * @file
 */
export const fetchDeleteEvidenceMemo = async (input: TDeleteEvidenceMemoInput): Promise<TDeleteEvidenceMemoOutput> => {
  const { data } = await authClient.delete<TDeleteEvidenceMemoOutput>(EVIDENCE_ROUTE.DELETE_EVIDENCE_MEMO, {
    data: input,
  });
  return data;
};
/**
 * * 북마크 생성 API
 * @description 북마크메모 생성 API 호출 함수
 * @summary [REST API] - POST | [ROUTE] - /legal/api/v1 /bookmark/toggle
 * @param {TCreateEvidenceBookMarkInput} input - 북마크 생성 정보
 * @throws {AxiosError} axios error
 * @returns {Promise<TCreateEvidenceBookMarkOutput>} 북마크 생성 결과
 * @file
 */
export const fetchCreateEvidenceBookmark = async (input: TCreateEvidenceBookMarkInput): Promise<TCreateEvidenceBookMarkOutput> => {
  const { data } = await authClient.post<TCreateEvidenceBookMarkOutput>(EVIDENCE_ROUTE.CREATE_EVIDENCE_BOOKMARK, input);
  return data;
};

/**
 * * 사용자 생성 API
 * @description 사용자 생성 API 호출 함수
 * @summary [REST API] - POST | [ROUTE] - /legal/api/v1 /auth/register
 * @param {TCreateEvidenceUserInput} input - 사용자 생성 정보
 * @throws {AxiosError} axios error
 * @returns {Promise<TCreateEvidenceUserOutput>} 사용자 생성 결과
 * @file
 */
export const fetchCreateEvidenceUser = async (input: TCreateEvidenceUserInput): Promise<TCreateEvidenceUserOutput> => {
  const { data } = await unAuthClient.post<TCreateEvidenceUserOutput>(EVIDENCE_ROUTE.CREATE_EVIDENCE_USER, input);
  return data;
};

// ! 개인 도메인 생성
export const fetchCreateEvidenceUserDomain = async (input: TCreateEvidenceUserDomainInput): Promise<TCreateEvidenceUserOutput> => {
  const { data } = await unAuthClient.post<TCreateEvidenceUserOutput>(EVIDENCE_ROUTE.CREATE_EVIDENCE_DOMAIN, input);
  return data;
};

// 로그아웃 시 사용
export const fetchCreateEvidenceUserUnAuth = async (): Promise<void> => {
  await authClient.post(EVIDENCE_ROUTE.LOGOUT);
};

/**
 * * 전체 사건 목록 조회 API
 * @description 전체 사건 목록 조회 API 호출 함수
 * @summary [REST API] - GET | [ROUTE] - /legal/api/v1/project/all
 * @param {TListProjectInput} input
 * @throws {AxiosError} axios error
 * @returns {Promise<TListProjectOutput>} 전체 사건 목록 조회 결과
 */
export const fetchListProject = async (input: TListProjectInput): Promise<TListProjectOutput> => {
  const { data } = await authClient.post<TListProjectOutput>(EVIDENCE_ROUTE.FIND_LIST_PROJECT, input);
  return data;
};

/**
 * * 사건 생성 API
 * @description 사건 생성 API 호출 함수
 * @summary [REST API] - POST | [ROUTE] - /legal/api/v1 /project/create
 * @param {TCreateProjectInput} input - 사건 생성 정보
 * @throws {AxiosError} axios error
 * @returns {Promise<TCreateProjectOutput>} 사건 생성 결과
 * @file
 */
export const fetchCreateProject = async (input: TCreateProjectInput): Promise<TCreateProjectOutput> => {
  const { data } = await authClient.post<TCreateProjectOutput>(EVIDENCE_ROUTE.CREATE_PROJECT, input);
  return data;
};

/**
 * * 프로젝트 권한 요청 API
 * @description 프로젝트 권한 요청 API 호출 함수
 * @summary [REST API] - POST | [ROUTE] - /project/join/request
 * @param {TJoinProjectRequestInput} input - 프로젝트 가입 요청 정보
 * @throws {AxiosError} axios error
 * @returns {Promise<TJoinProjectRequestOutput>} 프로젝트 가입 요청 결과
 */
export const fetchRequestJoinProject = async (input: TJoinProjectRequestInput): Promise<TJoinProjectRequestOutput> => {
  const { data } = await authClient.post<TJoinProjectRequestOutput>(EVIDENCE_ROUTE.REQUEST_JOIN_PROJECT, input);
  return data;
};

/**
 * * 프로젝트 가입 요청 리스트 조회 API
 * @description 프로젝트 가입 요청 리스트 조회 API 호출 함수
 * @summary [REST API] - POST | [ROUTE] - /project/join/request/list
 * @param {TJoinProjectRequestListInput} input - 프로젝트 가입 요청 리스트 조회 정보
 * @throws {AxiosError} axios error
 * @returns {Promise<TJoinProjectRequestListOutput>} 프로젝트 가입 요청 리스트 조회 결과
 */
export const fetchJoinProjectRequestList = async (input: TJoinProjectRequestListInput): Promise<TJoinProjectRequestListOutput> => {
  const { data } = await authClient.post<TJoinProjectRequestListOutput>(EVIDENCE_ROUTE.FIND_JOIN_PROJECT_REQUEST, input);
  return data;
};

/**
 * * 프로젝트 가입 요청 처리 API
 * @description 프로젝트 가입 요청 처리 API 호출 함수
 * @summary [REST API] - PUT | [ROUTE] - /project/join/request/process
 * @param {TProcessJoinRequestInput} input - 프로젝트 가입 요청 처리 정보
 * @throws {AxiosError} axios error
 * @returns {Promise<TProcessJoinRequestOutput>} 프로젝트 가입 요청 처리 결과
 */
export const fetchProcessJoinRequest = async (input: TProcessJoinRequestInput): Promise<TProcessJoinRequestOutput> => {
  const { data } = await authClient.put<TProcessJoinRequestOutput>(EVIDENCE_ROUTE.REQUEST_JOIN_ACCEPT, input);
  return data;
};

// ! 업로드 파일

/**
 * * 파일 업로드 API
 * @description 파일 업로드 API 호출 함수
 * @summary [REST API] - POST | [ROUTE] - /file/original/upload
 * @param {TUploadFileInput} input - 업로드 파일 정보
 * @throws {AxiosError} axios error
 * @returns {Promise<TUploadFileOutput>} 업로드 파일 결과
 */
export const fetchUploadFile = async ({ project_id, file, file_nm }: TUploadFileInput): Promise<TUploadFileOutput> => {
  const formData = new FormData();

  // 프로젝트 ID 추가
  formData.append('project_id', project_id);
  formData.append('file_nm', file_nm);

  if (file) {
    file.forEach((item: any) => {
      if (item instanceof FileList) {
        Array.from(item).forEach((f: File) => {
          formData.append('file', f);
        });
      } else {
        formData.append('file', item);
      }
    });
  }

  const { data } = await authClient.post<TUploadFileOutput>(EVIDENCE_ROUTE.UPLOAD_FILE, formData, {
    headers: { 'Content-Type': 'multipart/form-data' },
  });
  return data;
};
/**
 * * 읽지 않은 메시지 개수 조회 API
 * @description 읽지 않은 메시지 개수를 조회하는 API 호출 함수
 * @summary [REST API] - GET | [ROUTE] - /notification/unread/count
 * @throws {AxiosError} axios error
 * @returns {Promise<TUnreadNotificationOutput>} 읽지 않은 메시지 개수 조회 결과
 */
export const fetchUnreadNotificationCount = async (): Promise<TUnreadNotificationOutput> => {
  const { data } = await authClient.get<TUnreadNotificationOutput>(EVIDENCE_ROUTE.NOTIFICATION_UNREAD_COUNT);
  return data;
};

/**
 * * 메시지 리스트 조회 API
 * @description 메시지 리스트를 조회하는 API 호출 함수
 * @summary [REST API] - POST | [ROUTE] - /notification/list
 * @param {TListNotificationInput} input - 메시지 리스트 조회 정보
 * @throws {AxiosError} axios error
 * @returns {Promise<TListNotificationOutput>} 메시지 리스트 조회 결과
 */
export const fetchListNotification = async (input: TListNotificationInput): Promise<TListNotificationOutput> => {
  const { data } = await authClient.post<TListNotificationOutput>(EVIDENCE_ROUTE.NOTIFICATION_LIST, input);
  return data;
};

/**
 * * 알림 읽음 처리 API
 * @description 알림 읽음 처리 API 호출 함수
 * @summary [REST API] - PATCH | [ROUTE] - /notification/${notification_id}/read
 * @param {string} notificationId - 읽음 처리할 알림 ID
 * @throws {_AxiosError} axios error
 * @returns {Promise<void>} 알림 읽음 처리 결과
 * @file https/notifications.http - [PATCH] /notification/${notification_id}/read
 */
export const fetchMarkNotificationAsRead = async (notificationId: string): Promise<void> => {
  if (!notificationId) {
    throw new Error('notificationId는 필수입니다.');
  }

  const { data } = await authClient.patch<void>(`/notification/${notificationId}/read`);
  return data;
};

/**
 * * 프로젝트 필터 생성 API
 * @description 프로젝트 필터 생성 API 호출 함수
 * @summary [REST API] - POST | [ROUTE] - /project/filter
 * @param {TListProjectFilterInput} input - 프로젝트 필터 생성 정보
 * @throws {AxiosError} axios error
 * @returns {Promise<TListProjectFilterOutput>} 프로젝트 필터 생성 결과
 */
export const fetchCreateProjectFilter = async (input: TListProjectFilterInput): Promise<TListProjectFilterOutput> => {
  const { data } = await authClient.post<TListProjectFilterOutput>(EVIDENCE_ROUTE.CREATE_PROJECT_FILTER, input);
  return data;
};

/**
 * * 이메일 인증 요청 API
 * @description 이메일 인증 요청 API 호출 함수
 * @summary [REST API] - POST | [ROUTE] - /auth/email/request
 * @param {TSendAuthEmailInput} input - 이메일 인증 요청 정보
 * @throws {AxiosError} axios error
 * @returns {Promise<TSendAuthEmailOutput>} 이메일 인증 요청 결과
 */
export const fetchSendAuthEmail = async (input: TSendAuthEmailInput): Promise<TSendAuthEmailOutput> => {
  const { data } = await unAuthClient.post<TSendAuthEmailOutput>(EVIDENCE_ROUTE.SEND_AUTH_EMAIL, input);
  return data;
};

/**
 * * 문서 보기 API
 * @description 서버에서 PDF 문서를 가져오는 API
 * @summary [REST API] - GET | [ROUTE] - /document/view
 * @param {TViewDocumentInput} input - 문서 조회 정보
 * @throws {AxiosError} axios error
 * @returns {Promise<Blob>} PDF 문서 데이터 (바이너리)
 */
export const fetchViewDocument = async (input: TViewDocumentInput): Promise<Blob> => {
  const { data } = await authClient.post(EVIDENCE_ROUTE.VIEW_DOCUMENT, input, {
    responseType: 'blob',
    headers: {
      Accept: 'application/pdf',
    },
  });
  return data;
};

/**
 * * 문서 다운로드 API
 * @description 서버에서 PDF 문서를 다운로드하는 API
 * @summary [REST API] - GET | [ROUTE] - /document/download
 * @param {TDownloadDocumentInput} input - 문서 다운로드 정보
 * @throws {AxiosError} axios error
 * @returns {Promise<TDownloadDocumentOutput>} PDF 문서 다운로드 결과
 */
export const fetchDownloadDocument = async (input: TDownloadDocumentInput): Promise<TDownloadDocumentOutput> => {
  const { data } = await authClient.post<TDownloadDocumentOutput>(EVIDENCE_ROUTE.DOWNLOAD_DOCUMENT, input);
  return data;
};

/**
 * * 사용자 히스토리 필터 리스트 조회 API
 * @description 사용자 히스토리 필터 리스트 조회 API 호출 함수
 * @summary [REST API] - POST | [ROUTE] - /history/user-filters
 * @param {TListHistoryUserFilterInput} input - 사용자 히스토리 필터 리스트 조회 정보
 * @throws {AxiosError} axios error
 * @returns {Promise<TListHistoryUserFilterOutput>} 사용자 히스토리 필터 리스트 조회 결과
 */
export const fetchListHistoryUserFilter = async (input: TListHistoryUserFilterInput): Promise<TListHistoryUserFilterOutput> => {
  const { data } = await authClient.post<TListHistoryUserFilterOutput>(EVIDENCE_ROUTE.FINE_LIST_HISTORY_USER_FILTER, input);
  return data;
};

/**
 * * 사용자 히스토리 리스트 조회 API
 * @description 사용자 히스토리 리스트 조회 API 호출 함수
 * @summary [REST API] - POST | [ROUTE] - /history/list
 * @param {TListHistoryInput} input - 사용자 히스토리 리스트 조회 정보
 * @throws {AxiosError} axios error
 * @returns {Promise<TListHistoryOutput>} 사용자 히스토리 리스트 조회 결과
 */
export const fetchListHistory = async (input: TListHistoryInput): Promise<TListHistoryOutput> => {
  const { data } = await authClient.post<TListHistoryOutput>(EVIDENCE_ROUTE.FINE_LIST_HISTORY, input);
  return data;
};

/**
 * * 사용자 히스토리 액션 필터 리스트 조회 API
 * @description 사용자 히스토리 액션 필터 리스트 조회 API 호출 함수
 * @summary [REST API] - GET | [ROUTE] - /history/action-filters
 * @throws {AxiosError} axios error
 * @returns {Promise<TListHistoryActionFilterOutput>} 사용자 히스토리 액션 필터 리스트 조회 결과
 */
export const fetchListHistoryActionFilter = async (): Promise<TListHistoryActionFilterOutput> => {
  const { data } = await authClient.get<TListHistoryActionFilterOutput>(EVIDENCE_ROUTE.FIND_LIST_HISTORY_ACTION_FILTER);
  return data;
};
/**
 * * 이메일 인증 상태 확인 API
 * @description 이메일 인증 상태를 확인하는 API 호출 함수
 * @summary [REST API] - GET | [ROUTE] - /auth/email/status/:code_id
 * @param {string} codeId - 인증 코드 ID
 * @throws {AxiosError} axios error
 * @returns {Promise<TCheckAuthEmailOutput>} 이메일 인증 상태 확인 결과
 */
export const fetchCheckAuthEmail = async (codeId: string): Promise<TCheckAuthEmailOutput> => {
  if (!codeId) {
    throw new Error('codeId는 필수입니다.');
  }

  const { data } = await unAuthClient.get<TCheckAuthEmailOutput>(`/auth/email/status/${codeId}`);
  return data;
};

/**
 * * 비밀번호 재설정 이메일 전송 API
 * @description 비밀번호 재설정 이메일을 전송하는 API 호출 함수
 * @summary [REST API] - POST | [ROUTE] - /auth/password/reset/request
 * @param {TSendResetPasswordEmailInput} input - 비밀번호 재설정 이메일 전송 정보
 * @throws {AxiosError} axios error
 * @returns {Promise<TSendResetPasswordEmailOutput>} 비밀번호 재설정 이메일 전송 결과
 */
export const fetchSendResetPasswordEmail = async (input: TSendResetPasswordEmailInput): Promise<TSendResetPasswordEmailOutput> => {
  const { data } = await unAuthClient.post<TSendResetPasswordEmailOutput>(EVIDENCE_ROUTE.SEND_RESET_PASSWORD_EMAIL, input);
  return data;
};

/**
 * * 비밀번호 재설정 API
 * @description 비밀번호를 재설정하는 API 호출 함수
 * @summary [REST API] - PUT | [ROUTE] - /auth/password/reset
 * @param {TResetPasswordInput} input - 비밀번호 재설정 정보
 * @throws {AxiosError} axios error
 * @returns {Promise<TResetPasswordOutput>} 비밀번호 재설정 결과
 */
export const fetchResetPassword = async (input: TResetPasswordInput): Promise<TResetPasswordOutput> => {
  const { data } = await unAuthClient.post<TResetPasswordOutput>(EVIDENCE_ROUTE.RESET_PASSWORD, input);
  return data;
};

/**
 * * 사용자 정보 조회 API
 * @description 사용자 정보를 조회하는 API 호출 함수
 * @summary [REST API] - GET | [ROUTE] - /user
 * @throws {AxiosError} axios error
 * @returns {Promise<TGetUserInfoOutput>} 사용자 정보 조회 결과
 */
export const fetchGetUserInfo = async (): Promise<TGetUserInfoOutput> => {
  const { data } = await authClient.get<TGetUserInfoOutput>(EVIDENCE_ROUTE.FIND_USER_INFO);
  return data;
};

/**
 * * 사용자 정보 수정 API
 * @description 사용자 정보를 수정하는 API 호출 함수
 * @summary [REST API] - PUT | [ROUTE] - /user/modify
 * @param {TUpdateUserInfoInput} input - 사용자 정보 수정 정보
 * @throws {AxiosError} axios error
 * @returns {Promise<TUpdateUserInfoOutput>} 사용자 정보 수정 결과
 */
export const fetchUpdateUserInfo = async (input: TUpdateUserInfoInput): Promise<TUpdateUserInfoOutput> => {
  const { data } = await authClient.put<TUpdateUserInfoOutput>(EVIDENCE_ROUTE.UPDATE_USER_INFO, input);
  return data;
};

/**
 * * 사용자 존재 여부 확인 API
 * @description 사용자 존재 여부를 확인하는 API 호출 함수
 * @summary [REST API] - GET | [ROUTE] - /auth/email/check/:email
 * @param {string} email - 사용자 이메일
 * @throws {AxiosError} axios error
 * @returns {Promise<TCheckUserExistOutput>} 사용자 존재 여부 확인 결과
 */
export const fetchCheckUserExist = async (email: string): Promise<TCheckUserExistOutput> => {
  const { data } = await unAuthClient.get<TCheckUserExistOutput>(`${EVIDENCE_ROUTE.FINE_LOGIN_CHECK}/${email}`);
  return data;
};

/**
 * * 사용자 프로필 사진 업로드 API
 * @description 사용자 프로필 사진 업로드 API 호출 함수
 * @summary [REST API] - POST | [ROUTE] - /user/profile/upload
 * @param {TUpdateUserPhotoInput} input - 업로드할 파일 정보
 * @throws {AxiosError} axios error
 * @returns {Promise<TUpdateUserPhotoOutput>} 프로필 사진 업로드 결과
 */
export const fetchUpdateUserPhoto = async ({ file }: TUpdateUserPhotoInput): Promise<TUpdateUserPhotoOutput> => {
  const formData = new FormData();
  if (file) {
    formData.append('file', file);
  }

  const { data } = await authClient.post<TUpdateUserPhotoOutput>(EVIDENCE_ROUTE.UPLOAD_USER_PHOTO, formData, {
    headers: {
      'Content-Type': 'multipart/form-data',
    },
  });
  return data;
};

/**
 * * A2D2 요청 API
 * @description A2D2 요청 API 호출 함수
 * @summary [REST API] - POST | [ROUTE] - /project/work/request
 * @param {TRequestA2D2Input} input - A2D2 요청 정보
 * @throws {AxiosError} axios error
 * @returns {Promise<TRequestA2D2Output>} A2D2 요청 결과
 */
export const fetchRequestA2D2 = async (input: TRequestA2D2Input): Promise<TRequestA2D2Output> => {
  const { data } = await authClient.post<TRequestA2D2Output>(EVIDENCE_ROUTE.REQUEST_A2D2, input);
  return data;
};

/**
 * * 프로젝트 멤버 조회 API
 * @description 프로젝트 멤버를 조회하는 API 호출 함수
 * @summary [REST API] - GET | [ROUTE] - /project/members/:project_id
 * @param {string} projectId - 프로젝트 ID
 * @throws {AxiosError} axios error
 * @returns {Promise<TListProjectMemberOutput>} 프로젝트 멤버 조회 결과
 */

export const fetchListProjectMember = async (projectId: string): Promise<TListProjectMemberOutput> => {
  if (!projectId) {
    throw new Error('projectId 필수입니다.');
  }
  // 동일 projectId로 동시에 여러 번 호출되는 경우(StrictMode, 화면 전환 등) 네트워크 중복 호출 방지
  const inFlightKey = `project-members:${projectId}`;
  (globalThis as any).__inFlightEvidenceRequests ??= new Map<string, Promise<unknown>>();
  const inFlightMap = (globalThis as any).__inFlightEvidenceRequests as Map<string, Promise<unknown>>;

  const existing = inFlightMap.get(inFlightKey) as Promise<TListProjectMemberOutput> | undefined;
  if (existing) return existing;

  const promise = authClient
    .get<TListProjectMemberOutput>(`/project/members/${projectId}`)
    .then(({ data }) => data)
    .finally(() => {
      inFlightMap.delete(inFlightKey);
    });

  inFlightMap.set(inFlightKey, promise);
  return promise;
};

/**
 * * 증거 핀 생성 API
 * @description 증거 핀 생성 API 호출 함수
 * @summary [REST API] - POST | [ROUTE] - /pin/toggle
 * @param {TToggleEvidencePinInput} input - 증거 핀 생성 정보
 * @throws {AxiosError} axios error
 * @returns {Promise<TToggleEvidencePinOutput>} 증거 핀 생성 결과
 */
export const fetchCreateEvidencePin = async (input: TToggleEvidencePinInput): Promise<TToggleEvidencePinOutput> => {
  const { data } = await authClient.post<TToggleEvidencePinOutput>(EVIDENCE_ROUTE.CREATE_EVIDENCE_PIN, input);
  return data;
};

/**
 * * 필터 갯수 가져오기 API
 * @description 필터 갯수를 가져오는 API 호출 함수
 * @summary [REST API] - GET | [ROUTE] - /filter/count
 * @throws {AxiosError} axios error
 * @returns {Promise<TGetFilterCountOutput>} 필터 갯수 가져오기 결과
 */
export const fetchGetFilterCount = async (projectId: string): Promise<TGetFilterCountOutput> => {
  if (!projectId) {
    throw new Error('projectId 필수입니다.');
  }
  const { data } = await authClient.get<TGetFilterCountOutput>(`/evidences/summary/${projectId}`);
  return data;
};

/**
 * * 사용자 프로필 사진 초기화 API
 * @description 사용자 프로필 사진 초기화 API 호출 함수
 * @summary [REST API] - patch | [ROUTE] - /user/profile/reset
 * @throws {AxiosError} axios error
 * @returns {Promise<TInitUserPhotoOutput>} 프로필 사진 초기화 결과
 */
export const fetchInitUserPhoto = async (): Promise<TInitUserPhotoOutput> => {
  const { data } = await authClient.patch<TInitUserPhotoOutput>(EVIDENCE_ROUTE.RESET_USER_PHOTO);
  return data;
};

/**
 * * 사건 멤버가 슈퍼권한 요청 API
 * @description 사건 멤버가 슈퍼권한 요청 API 호출 함수
 * @summary [REST API] - POST | [ROUTE] - /project/join/request/super
 * @param {TRequestSuperPermissionInput} input - 사건 멤버가 슈퍼권한 요청 정보
 */

export const fetchRequestSuperPermission = async (input: TRequestSuperPermissionInput): Promise<TRequestSuperPermissionOutput> => {
  const { data } = await authClient.post<TRequestSuperPermissionOutput>(EVIDENCE_ROUTE.REQUEST_SUPER_PERMISSION, input);
  return data;
};

/**
 * * 시건에서 나가기 API
 * @description 시건에서 나가기 API 호출 함수
 * @summary [REST API] - POST | [ROUTE] - /project/join/leave
 * @param {TExitProjectInput} input - 시건에서 나가기 정보
 */

export const fetchExitProject = async (input: TExitProjectInput): Promise<TExitProjectOutput> => {
  const { data } = await authClient.post<TExitProjectOutput>(EVIDENCE_ROUTE.EXIT_PROJECT, input);
  return data;
};

/**
 * * 슈퍼권한 위임 API
 * @description 슈퍼권한 위임 API 호출 함수
 * @summary [REST API] - PUT | [ROUTE] - /project/join/transfer
 * @param {TDelegateSuperPermissionInput} input - 슈퍼권한 위임 정보
 */

export const fetchDelegateSuperPermission = async (input: TDelegateSuperPermissionInput): Promise<TDelegateSuperPermissionOutput> => {
  const { data } = await authClient.put<TDelegateSuperPermissionOutput>(EVIDENCE_ROUTE.DELEGATE_SUPER_PERMISSION, input);
  return data;
};

/**
 * * 시건 제외 API
 * @description 시건 제외 API 호출 함수
 * @summary [REST API] - POST | [ROUTE] - /project/join/ban
 * @param {TExcludeProjectInput} input - 시건 제외 정보
 */

export const fetchExcludeProject = async (input: TExcludeProjectInput): Promise<TExcludeProjectOutput> => {
  const { data } = await authClient.post<TExcludeProjectOutput>(EVIDENCE_ROUTE.EXCLUDE_PROJECT, input);
  return data;
};

/**
 * * 북마크된 증거 리스트 조회 API
 * @description 북마크된 증거 리스트 조회 API 호출 함수
 * @summary [REST API] - POST | [ROUTE] - /evidences/bookmark/list
 * @param {TListBookmarkedEvidencesInput} input - 북마크된 증거 리스트 조회 정보
 * @throws {AxiosError} axios error
 * @returns {Promise<TListBookmarkedEvidencesOutput>} 북마크된 증거 리스트 조회 결과
 */
export const fetchListBookmarkedEvidences = async (input: TListBookmarkedEvidencesInput): Promise<TListBookmarkedEvidencesOutput> => {
  const { data } = await authClient.post<TListBookmarkedEvidencesOutput>(EVIDENCE_ROUTE.FINE_BOOKMARKED_EVIDENCES, input);
  return data;
};

/**
 * * 최근 본 증거 리스트 조회 API
 * @description 최근 본 증거 리스트 조회 API 호출 함수
 * @summary [REST API] - POST | [ROUTE] - /evidences/recent/list
 * @param {TListRecentEvidencesInput} input - 최근 본 증거 리스트 조회 정보
 * @throws {AxiosError} axios error
 * @returns {Promise<TListRecentEvidencesOutput>} 최근 본 증거 리스트 조회 결과
 */
export const fetchListRecentEvidences = async (input: TListRecentEvidencesInput): Promise<TListRecentEvidencesOutput> => {
  const { data } = await authClient.post<TListRecentEvidencesOutput>(EVIDENCE_ROUTE.FINE_RECENT_EVIDENCES, input);
  return data;
};

/**
 * * 메모된 증거 리스트 조회 API
 * @description 메모된 증거 리스트 조회 API 호출 함수
 * @summary [REST API] - POST | [ROUTE] - /evidences/memo/list
 * @param {TListMemoedEvidencesInput} input - 메모된 증거 리스트 조회 정보
 * @throws {AxiosError} axios error
 * @returns {Promise<TListMemoedEvidencesOutput>} 메모된 증거 리스트 조회 결과
 */
export const fetchListMemoedEvidences = async (input: TListMemoedEvidencesInput): Promise<TListMemoedEvidencesOutput> => {
  const { data } = await authClient.post<TListMemoedEvidencesOutput>(EVIDENCE_ROUTE.FINE_MEMOED_EVIDENCES, input);
  return data;
};

/**
 * * 파워검색 API
 * @description 파워검색 API 호출 함수
 * @summary [REST API] - POST | [ROUTE] - /project/join/request/process
 * @param {TPowerSearchInput} input - 파워검색 정보
 */

export const fetchPowerSearch = async (input: TPowerSearchInput): Promise<TPowerSearchOutput> => {
  const { data } = await authClient.post<TPowerSearchOutput>(EVIDENCE_ROUTE.FINE_POWER_SEARCH, input);
  return data;
};

/**
 * * 증거 목록 필터 조회 API
 * @description 증거 목록 필터 조회 API 호출 함수
 * @summary [REST API] - POST | [ROUTE] - /evidences/filter
 * @param {TListEvidenceFilterInput} input - 증거 목록 필터 조회 정보
 */

export const fetchListEvidenceFilter = async (input: TListEvidenceFilterInput): Promise<TListEvidenceFilterOutput> => {
  const { data } = await authClient.post<TListEvidenceFilterOutput>(EVIDENCE_ROUTE.FIND_LIST_EVIDENCE_FILTER, input);
  return data;
};

/**
 * * 증거 목록 드래그앤 드랍 정렬 API
 * @description 증거 목록 드래그앤 드랍 정렬 API 호출 함수
 * @summary [REST API] - POST | [ROUTE] - /evidences/move
 * @param {TDragAndDropEvidenceInput} input - 증거 목록 드래그앤 드랍 정렬 정보
 */

export const fetchDragAndDropEvidence = async (input: TDragAndDropEvidenceInput): Promise<TDragAndDropEvidenceOutput> => {
  const { data } = await authClient.post<TDragAndDropEvidenceOutput>(EVIDENCE_ROUTE.DRAG_AND_DROP_EVIDENCE, input);
  return data;
};

// 알림 모두 읽음 처리 TReadAllNotificationOutput

export const fetchReadAllNotification = async (): Promise<TReadAllNotificationOutput> => {
  const { data } = await authClient.patch<TReadAllNotificationOutput>(EVIDENCE_ROUTE.NOTIFICATION_ALL_READ);
  return data;
};

// 퇴사
export const fetchResignUser = async (input: TResignUserInput): Promise<TResignUserOutput> => {
  const { data } = await authClient.post<TResignUserOutput>(EVIDENCE_ROUTE.RESIGN_USER, input);
  return data;
};

// 슈퍼권한자 퇴사
export const fetchResignSuperUser = async (input: TResignSuperUserInput): Promise<TResignSuperUserOutput> => {
  const { data } = await authClient.post<TResignSuperUserOutput>(EVIDENCE_ROUTE.RESIGN_SUPER_USER, input);
  return data;
};

// 자기 퇴사
export const fetchResignSelf = async (input: TResignSelfInput): Promise<TResignSelfOutput> => {
  const { data } = await authClient.post<TResignSelfOutput>(EVIDENCE_ROUTE.RESIGN_SELF, input);
  return data;
};

// ! 프로젝트 수정 API
export const fetchModifyProject = async (input: TEditProjectInput): Promise<TEditProjectOutput> => {
  const { data } = await authClient.put<TEditProjectOutput>(EVIDENCE_ROUTE.MODIFY_PROJECT, input);
  return data;
};

/**
 * * 이메일 인증 API
 * @description 이메일 인증 API 호출 함수
 * @summary [REST API] - PATCH | [ROUTE] - /auth/email/verify
 * @param {string} token - 인증 토큰
 * @throws {_AxiosError} axios error
 * @returns {Promise<void>} 이메일 인증 결과
 * @file https/notifications.http - [PATCH] /notification/${notification_id}/read
 */
export const fetchVerifyEmailToken = async (token: string): Promise<TVerifyEmailTokenOutput> => {
  if (!token) {
    throw new Error('token 필수입니다.');
  }

  const { data } = await unAuthClient.get<TVerifyEmailTokenOutput>(`/auth/email/verify?token=${token}`);
  return data;
};

/**
 * * 비밀번호 변경
 * @description 비밀번호 변경 API 호출 함수
 * @summary [REST API] - PATCH | [ROUTE] - /user/password/modify
 * @param {TSettingPasswordInput} input - 비밀번호 변경 정보
 * @throws {AxiosError} axios error
 * @returns {Promise<TSettingPasswordOutput>} 비밀번호 변경 결과
 */

export const fetchSettingPassword = async (input: TSettingPasswordInput): Promise<TSettingPasswordOutput> => {
  const { data } = await authClient.put<TSettingPasswordOutput>(EVIDENCE_ROUTE.SETTING_PASSWORD, input);
  return data;
};

// 히스토리 추가

export const fetchAddHistory = async (input: TAddHistoryInput): Promise<TAddHistoryOutput> => {
  const { data } = await authClient.post<TAddHistoryOutput>(EVIDENCE_ROUTE.CREATE_HISTORY, input);
  return data;
};

// ! 이메일인증 번호 발송
export const fetchSendAuthNumberEmail = async (input: TSendAuthNumberEmailInput): Promise<TSendAuthNumberEmailOutput> => {
  const { data } = await unAuthClient.post<TSendAuthNumberEmailOutput>(EVIDENCE_ROUTE.SEND_AUTH_NUMBER_EMAIL, input);
  return data;
};

// ! 이메일인증 번호 확인
export const fetchCheckAuthNumberEmail = async (input: TCheckAuthNumberEmailInput): Promise<TCheckAuthNumberEmailOutput> => {
  const { data } = await unAuthClient.post<TCheckAuthNumberEmailOutput>(EVIDENCE_ROUTE.CHECK_AUTH_NUMBER_EMAIL, input);
  return data;
};

// ! 증거문서 추가 시 이메일 알림 전송
export const fetchSendEmailNotification = async (input: TSendEmailNotificationInput): Promise<TSendEmailNotificationOutput> => {
  const { data } = await authClient.post<TSendEmailNotificationOutput>(EVIDENCE_ROUTE.SEND_EMAIL_NOTIFICATION, input);
  return data;
};

// ! 로펌명 검색
export const fetchSearchOfficeNm = async (input: TSearchOfficeNmInput): Promise<TSearchOfficeNmOutput> => {
  const { data } = await unAuthClient.post<TSearchOfficeNmOutput>(EVIDENCE_ROUTE.SEARCH_OFFICE_NM, input);
  return data;
};

// ! 사건 초대
export const fetchAddProjectInvitation = async (input: TAddProjectInvitationInput): Promise<TAddProjectInvitationOutput> => {
  const { data } = await authClient.post<TAddProjectInvitationOutput>(EVIDENCE_ROUTE.ADD_PROJECT_INVITATION, input);
  return data;
};

// ! 사건 초대 취소
export const fetchCancelProjectInvitation = async (input: TCancelProjectInvitationInput): Promise<TCancelProjectInvitationOutput> => {
  const { data } = await authClient.put<TCancelProjectInvitationOutput>(EVIDENCE_ROUTE.CANCEL_PROJECT_INVITATION, input);
  return data;
};

// ! 분석 메뉴 클릭 이벤트 추가
export const fetchClickAnalysisMenu = async (projectId: string): Promise<TClickAnalysisMenuOutput> => {
  const { data } = await authClient.get<TClickAnalysisMenuOutput>(EVIDENCE_ROUTE.CLICK_ANALYSIS_MENU.replace(':project_id', projectId));
  return data;
};

// ! 분석 메뉴 클릭 이벤트 추가
export const fetchClickAnalysisMenuToday = async (projectId: string): Promise<TClickAnalysisMenuTodayOutput> => {
  const { data } = await authClient.get<TClickAnalysisMenuTodayOutput>(
    EVIDENCE_ROUTE.CLICK_ANALYSIS_MENU_TODAY.replace(':project_id', projectId),
  );
  return data;
};

// ! 변호사 인증
export const fetchVerifyLawyer = async (input: TVerifyLawyerInput): Promise<TVerifyLawyerOutput> => {
  const { data } = await authClient.post<TVerifyLawyerOutput>(EVIDENCE_ROUTE.VERIFY_LAWYER, input);
  return data;
};

// ! 인증상태 업데이트
export const fetchUpdateCertificationStatus = async (
  user_id: string,
  input: TUpdateCertificationStatusInput,
): Promise<TUpdateCertificationStatusOutput> => {
  const { data } = await authClient.patch<TUpdateCertificationStatusOutput>(
    EVIDENCE_ROUTE.UPDATE_CERTIFICATION_STATUS.replace(':user_id', user_id),
    input,
  );
  return data;
};

// ! 사건 초대 거절
export const fetchRejectProjectInvitation = async (input: TRejectProjectInvitationInput): Promise<TRejectProjectInvitationOutput> => {
  const { data } = await authClient.put<TRejectProjectInvitationOutput>(EVIDENCE_ROUTE.REJECT_PROJECT_INVITATION, input);
  return data;
};

// ! 결제관리 내의 사건목록 가져오기
export const fetchGetProjectListForPaymentManagement = async (
  input: TGetProjectListForPaymentManagementInput,
): Promise<TGetProjectListForPaymentManagementOutput> => {
  const { data } = await authClient.post<TGetProjectListForPaymentManagementOutput>(
    EVIDENCE_ROUTE.GET_PROJECT_LIST_FOR_PAYMENT_MANAGEMENT,
    input,
  );
  return data;
};

// ! 증거목록 태그 생성
export const fetchCreateEvidenceTag = async (input: TCreateEvidenceTagInput): Promise<TCreateEvidenceTagOutput> => {
  const { data } = await authClient.post<TCreateEvidenceTagOutput>(EVIDENCE_ROUTE.CREATE_EVIDENCE_TAG, input);
  return data;
};

// ! 증거목록 태그 수정
export const fetchUpdateEvidenceTag = async (input: TUpdateEvidenceTagInput): Promise<TUpdateEvidenceTagOutput> => {
  const { data } = await authClient.put<TUpdateEvidenceTagOutput>(EVIDENCE_ROUTE.UPDATE_EVIDENCE_TAG, input);
  return data;
};

// ! 증거목록 태그 삭제
export const fetchDeleteEvidenceTagSet = async (input: TDeleteEvidenceTagSetInput): Promise<TDeleteEvidenceTagSetOutput> => {
  const { data } = await authClient.delete<TDeleteEvidenceTagSetOutput>(EVIDENCE_ROUTE.DELETE_EVIDENCE_TAG, {
    data: input,
  });
  return data;
};

// ! 증거목록 태그 상세조회
export const fetchGetEvidenceTag = async (input: TGetEvidenceTagInput): Promise<TGetEvidenceTagOutput> => {
  const { data } = await authClient.get<TGetEvidenceTagOutput>(EVIDENCE_ROUTE.GET_EVIDENCE_TAG.replace(':tag_id', input.tag_id));
  return data;
};

// ! 증거목록 태그 목록조회
export const fetchListEvidenceTags = async (input: TListEvidenceTagsInput): Promise<TListEvidenceTagsOutput> => {
  const { data } = await authClient.get<TListEvidenceTagsOutput>(
    EVIDENCE_ROUTE.LIST_EVIDENCE_TAGS.replace(':project_id', input.project_id),
  );
  return data;
};

// ! 증거목록 태그 목록조회 (프로젝트별 고유 태그)
export const fetchListEvidenceTagsDistinct = async (input: TListEvidenceTagsInput): Promise<TListEvidenceTagsDistinctOutput> => {
  const { data } = await authClient.get<TListEvidenceTagsDistinctOutput>(
    EVIDENCE_ROUTE.LIST_EVIDENCE_TAGS_DISTINCT.replace(':project_id', input.project_id),
  );
  return data;
};

// ! 증거목록에 태그 할당
export const fetchListAssignEvidenceTag = async (input: TAssignEvidenceTagInput): Promise<TAssignEvidenceTagOutput> => {
  const { data } = await authClient.post<TAssignEvidenceTagOutput>(EVIDENCE_ROUTE.LIST_ASSIGN_EVIDENCE_TAG, input);
  return data;
};

// ! 증거목록에 태그 삭제
export const fetchDeleteAssignEvidenceTag = async (input: TDeleteEvidenceTagInput): Promise<TDeleteEvidenceTagOutput> => {
  const { data } = await authClient.delete<TDeleteEvidenceTagOutput>(EVIDENCE_ROUTE.DELETE_ASSIGN_EVIDENCE_TAG, {
    data: input,
  });
  return data;
};

// ! 증거목록 태그 목록조회 (프로젝트별 고유 태그)
export const fetchListEvidenceTagsProjectDistinct = async (
  input: TListEvidenceTagsInput,
): Promise<TListEvidenceTagsProjectDistinctOutput> => {
  const { data } = await authClient.get<TListEvidenceTagsProjectDistinctOutput>(
    EVIDENCE_ROUTE.LIST_ASSIGN_TAG_PROJECT.replace(':project_id', input.project_id),
  );
  return data;
};

// ! 증거목록 태그 정렬 순서 변경
export const fetchUpdateEvidenceTagOrder = async (input: TUpdateEvidenceTagOrderInput): Promise<TUpdateEvidenceTagOrderOutput> => {
  const { data } = await authClient.put<TUpdateEvidenceTagOrderOutput>(EVIDENCE_ROUTE.LIST_EVIDENCE_TAGS_ORDER, input);
  return data;
};

// ! 증거인부 등록
export const fetchRegisterEvidence = async (input: TRegisterEvidenceInput): Promise<TRegisterEvidenceOutput> => {
  const { data } = await authClient.post<TRegisterEvidenceOutput>(EVIDENCE_ROUTE.REGISTER_EVIDENCE, input);
  return data;
};

// ! 증거인부 수정
export const fetchUpdateEvidence = async (input: TUpdateEvidenceInput): Promise<TUpdateEvidenceOutput> => {
  const { data } = await authClient.put<TUpdateEvidenceOutput>(EVIDENCE_ROUTE.UPDATE_EVIDENCE, input);
  return data;
};

// ! 증거인부 목록조회
export const fetchListEvidenceOpinion = async (input: TListEvidenceOpinionInput): Promise<TListEvidenceOpinionOutput> => {
  // 백엔드: /opinion/list 는 POST body로 받음 (GET/params로 보내면 400 발생)
  const { data } = await authClient.post<TListEvidenceOpinionOutput>(EVIDENCE_ROUTE.LIST_EVIDENCE_OPINION, input);
  return data;
};
