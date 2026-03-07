import { authClient } from '@apis/index';
import type {
  TCivilCaseCreateInput,
  TCivilCaseCreateOutput,
  TCivilCaseUploadDocumentOutput,
  TCivilCaseDocumentListOutput,
  TCivilCaseDocumentViewInput,
  TCivilCaseDocumentContentOutput,
  TCivilCaseDocumentCategorizeInput,
  TCivilCaseDocumentCategorizeOutput,
  TCivilCaseDocumentParsedInfoUpdateInput,
  TCivilCaseDocumentParsedInfoUpdateOutput,
  TCivilCaseDocumentCreateInput,
  TCivilCaseDocumentCreateOutput,
  TCivilCaseDocumentPinInput,
  TCivilCaseDocumentPinOutput,
  TCivilCaseDocumentMoveInput,
  TCivilCaseDocumentMoveOutput,
  TCivilCaseDocumentBookmarkAddInput,
  TCivilCaseDocumentBookmarkAddOutput,
  TCivilCaseDocumentTagAddInput,
  TCivilCaseDocumentTagAddOutput,
  TCivilCaseDocumentTagDeleteOutput,
  TCivilCaseDocumentTagListOutput,
  TCivilCaseDocumentTagSetCreateInput,
  TCivilCaseDocumentTagSetCreateOutput,
  TCivilCaseDocumentTagSetUpdateInput,
  TCivilCaseDocumentTagSetUpdateOutput,
  TCivilCaseDocumentTagSetDeleteOutput,
  TCivilCaseDocumentMemoAddInput,
  TCivilCaseDocumentMemoAddOutput,
  TCivilCaseDocumentMemoUpdateInput,
  TCivilCaseDocumentMemoUpdateOutput,
  TCivilCaseDocumentMemoDeleteInput,
  TCivilCaseDocumentMemoDeleteOutput,
  TCivilCaseDocumentMemoListOutput,
  TCivilCaseDocumentTagSetListOutput,
  TCivilCaseFilterListOutput,
} from '@/apis/type/case-type/civil-case.type';

type TCaseClippingQueryKey = {
  CREATE_CIVIL_CASE: 'CREATE_CIVIL_CASE';
  UPLOAD_DOCUMENT: 'UPLOAD_DOCUMENT';
  GET_DOCUMENT_LIST: 'GET_DOCUMENT_LIST';
  VIEW_DOCUMENT: 'VIEW_DOCUMENT';
  CREATE_DOCUMENT: 'CREATE_DOCUMENT';
  PIN_DOCUMENT: 'PIN_DOCUMENT';
  MOVE_DOCUMENT: 'MOVE_DOCUMENT';
  BOOKMARK_DOCUMENT: 'BOOKMARK_DOCUMENT';
  TAG_DOCUMENT: 'TAG_DOCUMENT';
  DELETE_TAG_DOCUMENT: 'DELETE_TAG_DOCUMENT';
  LIST_TAG_DOCUMENT: 'LIST_TAG_DOCUMENT';
  CREATE_TAG_SET: 'CREATE_TAG_SET';
  UPDATE_TAG_SET: 'UPDATE_TAG_SET';
  DELETE_TAG_SET: 'DELETE_TAG_SET';
  ADD_MEMO: 'ADD_MEMO';
  UPDATE_MEMO: 'UPDATE_MEMO';
  DELETE_MEMO: 'DELETE_MEMO';
  LIST_TAG_SET: 'LIST_TAG_SET';
  LIST_MEMO: 'LIST_MEMO';
  LIST_FILTER: 'LIST_FILTER';
  GET_DOCUMENT_CONTENT: 'GET_DOCUMENT_CONTENT';
  CATEGORIZE_DOCUMENT: 'CATEGORIZE_DOCUMENT';
  UPDATE_PARSED_INFO: 'UPDATE_PARSED_INFO';
  UPDATE_FILE_NAME: 'UPDATE_FILE_NAME';
  DOWNLOAD_DOCUMENT: 'DOWNLOAD_DOCUMENT';
  SPLIT_DOCUMENT: 'SPLIT_DOCUMENT';
};
type TCaseClippingRouteKey = {
  CREATE_CIVIL_CASE: '/civil-case';
  UPLOAD_DOCUMENT: '/case-document';
  GET_DOCUMENT_LIST: '/case-document/list';
  VIEW_DOCUMENT: '/case-document/document';
  CREATE_DOCUMENT: '/case-document';
  PIN_DOCUMENT: '/case-document-pin/toggle';
  MOVE_DOCUMENT: '/case-document-order/move';
  BOOKMARK_DOCUMENT: '/case-document-bookmark/toggle';
  TAG_DOCUMENT: '/case-document-tag';
  DELETE_TAG_DOCUMENT: '/case-document-tag/:tag_set_id';
  LIST_TAG_DOCUMENT: '/case-document-tag/document/:civil_case_id/:case_document_id';
  CREATE_TAG_SET: '/civil-case-tagset/create';
  UPDATE_TAG_SET: '/civil-case-tagset/modify';
  DELETE_TAG_SET: '/civil-case-tagset/delete';
  ADD_MEMO: '/case-document-memo/create';
  UPDATE_MEMO: '/case-document-memo/modify';
  DELETE_MEMO: '/case-document-memo/delete';
  LIST_TAG_SET: '/civil-case-tagset/list/:case_id';
  LIST_MEMO: '/case-document-memo/document/:case_document_id';
  LIST_FILTER: '/case-document/filter-options:civil_case_id';
  GET_DOCUMENT_CONTENT: '/case-document/content';
  CATEGORIZE_DOCUMENT: '/case-document/:case_document_id/categorize';
  UPDATE_PARSED_INFO: '/case-document/:case_document_id/parsed-info';
  UPDATE_FILE_NAME: '/case-document/:case_document_id/file-name';
  DOWNLOAD_DOCUMENT: '/case-document/:case_document_id/download';
  SPLIT_DOCUMENT: '/case-document-split/:case_document_id/split';
};

export const EVIDENCE_QUERY_KEY: TCaseClippingQueryKey = {
  CREATE_CIVIL_CASE: 'CREATE_CIVIL_CASE',
  UPLOAD_DOCUMENT: 'UPLOAD_DOCUMENT',
  GET_DOCUMENT_LIST: 'GET_DOCUMENT_LIST',
  VIEW_DOCUMENT: 'VIEW_DOCUMENT',
  CREATE_DOCUMENT: 'CREATE_DOCUMENT',
  PIN_DOCUMENT: 'PIN_DOCUMENT',
  MOVE_DOCUMENT: 'MOVE_DOCUMENT',
  BOOKMARK_DOCUMENT: 'BOOKMARK_DOCUMENT',
  TAG_DOCUMENT: 'TAG_DOCUMENT',
  DELETE_TAG_DOCUMENT: 'DELETE_TAG_DOCUMENT',
  LIST_TAG_DOCUMENT: 'LIST_TAG_DOCUMENT',
  CREATE_TAG_SET: 'CREATE_TAG_SET',
  UPDATE_TAG_SET: 'UPDATE_TAG_SET',
  DELETE_TAG_SET: 'DELETE_TAG_SET',
  ADD_MEMO: 'ADD_MEMO',
  UPDATE_MEMO: 'UPDATE_MEMO',
  DELETE_MEMO: 'DELETE_MEMO',
  LIST_TAG_SET: 'LIST_TAG_SET',
  LIST_MEMO: 'LIST_MEMO',
  LIST_FILTER: 'LIST_FILTER',
  GET_DOCUMENT_CONTENT: 'GET_DOCUMENT_CONTENT',
  CATEGORIZE_DOCUMENT: 'CATEGORIZE_DOCUMENT',
  UPDATE_PARSED_INFO: 'UPDATE_PARSED_INFO',
  UPDATE_FILE_NAME: 'UPDATE_FILE_NAME',
  DOWNLOAD_DOCUMENT: 'DOWNLOAD_DOCUMENT',
  SPLIT_DOCUMENT: 'SPLIT_DOCUMENT',
};

export const EVIDENCE_ROUTE: TCaseClippingRouteKey = {
  CREATE_CIVIL_CASE: '/civil-case',
  UPLOAD_DOCUMENT: '/case-document',
  GET_DOCUMENT_LIST: '/case-document/list',
  VIEW_DOCUMENT: '/case-document/document',
  CREATE_DOCUMENT: '/case-document',
  PIN_DOCUMENT: '/case-document-pin/toggle',
  MOVE_DOCUMENT: '/case-document-order/move',
  BOOKMARK_DOCUMENT: '/case-document-bookmark/toggle',
  TAG_DOCUMENT: '/case-document-tag',
  DELETE_TAG_DOCUMENT: '/case-document-tag/:tag_set_id',
  LIST_TAG_DOCUMENT: '/case-document-tag/document/:civil_case_id/:case_document_id',
  CREATE_TAG_SET: '/civil-case-tagset/create',
  UPDATE_TAG_SET: '/civil-case-tagset/modify',
  DELETE_TAG_SET: '/civil-case-tagset/delete',
  ADD_MEMO: '/case-document-memo/create',
  UPDATE_MEMO: '/case-document-memo/modify',
  DELETE_MEMO: '/case-document-memo/delete',
  LIST_TAG_SET: '/civil-case-tagset/list/:case_id',
  LIST_MEMO: '/case-document-memo/document/:case_document_id',
  LIST_FILTER: '/case-document/filter-options:civil_case_id',
  GET_DOCUMENT_CONTENT: '/case-document/content',
  CATEGORIZE_DOCUMENT: '/case-document/:case_document_id/categorize',
  UPDATE_PARSED_INFO: '/case-document/:case_document_id/parsed-info',
  UPDATE_FILE_NAME: '/case-document/:case_document_id/file-name',
  DOWNLOAD_DOCUMENT: '/case-document/:case_document_id/download',
  SPLIT_DOCUMENT: '/case-document-split/:case_document_id/split',
};

export type TCivilCaseDocumentDownloadInput = {
  case_document_id: string;
};

export type TCivilCaseDocumentUpdateFileNameInput = {
  case_document_id: string;
  file_name: string;
};

export type TCivilCaseDocumentUpdateFileNameOutput = {
  success?: boolean;
  message?: string;
  result?: any;
};

export type TCivilCaseDocumentSplitInput = {
  case_document_id: string;
  splits: Array<{
    type: 'range';
    pages: string; // e.g. "1-5"
    file_name: string;
  }>;
};

export type TCivilCaseDocumentSplitOutput = {
  success?: boolean;
  message?: string;
  error?: string;
  result?: any;
};

export const fetchCreateCivilCase = async (input: TCivilCaseCreateInput) => {
  const url = EVIDENCE_ROUTE.CREATE_CIVIL_CASE;
  const { data } = await authClient.post<TCivilCaseCreateOutput>(url, input);
  return data;
};

// ! 문서 업로드 API (civil_case_id, file, title,document_type,is_plaintiff)
export const fetchUploadDocument = async (civilCaseId: string, file: File, title: string, document_type: string, is_plaintiff: boolean) => {
  const url = EVIDENCE_ROUTE.UPLOAD_DOCUMENT;
  const formData = new FormData();
  formData.append('civil_case_id', civilCaseId);
  formData.append('file', file);
  formData.append('title', title);
  formData.append('document_type', document_type);
  formData.append('is_plaintiff', is_plaintiff.toString());
  const { data } = await authClient.post<TCivilCaseUploadDocumentOutput>(url, formData, {
    headers: {
      'Content-Type': 'multipart/form-data',
    },
  });
  return data;
};

// ! 의뢰인 문서 목록 조회 API
export type TCivilCaseDocumentListFilters = {
  parsed_category?: string[];
  parsed_submitter_name?: string[];
  tags?: string[]; // tag_set_id[]
  bookmark?: boolean;
  memo?: boolean;
  clipping?: boolean;
};
export type TCivilCaseDocumentListSortColumn =
  | 'document_date'
  | 'parsed_category'
  | 'parsed_submitter_name'
  | 'clipping_count'
  | 'memo_count'
  | 'bookmark_count';
export type TCivilCaseDocumentListSortDirection = 'asc' | 'desc';

export const fetchGetDocumentList = async (
  civilCaseId: string,
  page = 1,
  limit = 10,
  opts?: {
    keyword?: string;
    powerSearch?: string;
    source_type?: 'LAWYER' | 'CLIENT';
    filters?: TCivilCaseDocumentListFilters;
    sortColumn?: TCivilCaseDocumentListSortColumn;
    sortDirection?: TCivilCaseDocumentListSortDirection;
  },
) => {
  const url = EVIDENCE_ROUTE.GET_DOCUMENT_LIST;
  // 백엔드 변경: /case-document/list 로 POST 호출하고 input(body)에 civil_case_id/page/limit 를 전달한다.
  const { data } = await authClient.post<TCivilCaseDocumentListOutput>(url, {
    civil_case_id: civilCaseId,
    page,
    limit,
    ...(opts?.keyword != null && String(opts.keyword).trim() ? { keyword: String(opts.keyword) } : {}),
    ...(opts?.powerSearch != null && String(opts.powerSearch).trim() ? { power_search: String(opts.powerSearch) } : {}),
    ...(opts?.source_type ? { source_type: opts.source_type } : {}),
    ...(opts?.filters ? { filters: opts.filters } : {}),
    ...(opts?.sortColumn ? { sort_column: opts.sortColumn } : {}),
    ...(opts?.sortDirection ? { sort_direction: opts.sortDirection } : {}),
  });
  return data;
};

// ! 문서보기 API
export const fetchViewDocument = async (input: TCivilCaseDocumentViewInput) => {
  const url = EVIDENCE_ROUTE.VIEW_DOCUMENT;
  const docType = String((input as any)?.doc_type ?? '').toLowerCase();
  const acceptHeader =
    docType === 'text'
      ? // backend may respond with plain text or JSON (page_number + description)
        'application/json, text/plain, */*'
      : 'application/pdf';
  const res = await authClient.post<Blob>(url, input, {
    responseType: 'blob',
    headers: {
      Accept: acceptHeader,
    },
  });
  const blob = res.data;
  const contentType = String((res.headers as any)?.['content-type'] ?? (blob as any)?.type ?? '').toLowerCase();

  // Some server errors are returned as JSON with 200 status; guard against treating them as PDFs.
  const mightBeJson =
    contentType.includes('application/json') ||
    contentType.includes('text/json') ||
    contentType.includes('text/plain') ||
    contentType.includes('application/problem+json');

  if (mightBeJson) {
    try {
      const text = await blob.text();
      const trimmed = text.trim();
      if (trimmed.startsWith('{') || trimmed.startsWith('[')) {
        const parsed: any = JSON.parse(trimmed);
        const msg = String(parsed?.message ?? parsed?.error?.message ?? parsed?.error ?? '').trim();
        if (msg) throw new Error(msg);
        throw new Error(trimmed);
      }
      // plain text error
      if (trimmed) throw new Error(trimmed);
    } catch (e: any) {
      // rethrow as Error so callers can handle (useMutation catch -> undefined)
      throw e instanceof Error ? e : new Error(String(e?.message ?? '문서를 불러올 수 없습니다.'));
    }
  }

  return blob;
};

// ! 문서 텍스트 content 조회 API
export const fetchGetDocumentContent = async (civilCaseId: string, caseDocumentId: string) => {
  const url = EVIDENCE_ROUTE.GET_DOCUMENT_CONTENT;
  const { data } = await authClient.get<TCivilCaseDocumentContentOutput>(url, {
    params: {
      civil_case_id: civilCaseId,
      case_document_id: caseDocumentId,
    },
  });
  return data;
};

// ! 문서 카테고리 분류 API
export const fetchCategorizeDocument = async (input: TCivilCaseDocumentCategorizeInput) => {
  const url = EVIDENCE_ROUTE.CATEGORIZE_DOCUMENT.replace(':case_document_id', input.case_document_id);
  const { data } = await authClient.post<TCivilCaseDocumentCategorizeOutput>(url, {
    evidence_category: input.evidence_category,
  });
  return data;
};

// ! 문서 파싱 정보 수정 API
export const fetchUpdateDocumentParsedInfo = async (input: TCivilCaseDocumentParsedInfoUpdateInput) => {
  const url = EVIDENCE_ROUTE.UPDATE_PARSED_INFO.replace(':case_document_id', input.case_document_id);
  const { data } = await authClient.patch<TCivilCaseDocumentParsedInfoUpdateOutput>(url, {
    update_column: input.update_column,
    update_value: input.update_value,
  });
  return data;
};

// ! 문서 파일명 변경 API
export const fetchUpdateDocumentFileName = async (input: TCivilCaseDocumentUpdateFileNameInput) => {
  const url = EVIDENCE_ROUTE.UPDATE_FILE_NAME.replace(':case_document_id', input.case_document_id);
  const { data } = await authClient.patch<TCivilCaseDocumentUpdateFileNameOutput>(url, {
    file_name: input.file_name,
  });
  return data;
};

// ! 문서 원본 다운로드 API
export const fetchDownloadDocument = async (input: TCivilCaseDocumentDownloadInput) => {
  const url = EVIDENCE_ROUTE.DOWNLOAD_DOCUMENT.replace(':case_document_id', input.case_document_id);
  const res = await authClient.get<Blob>(url, {
    responseType: 'blob',
  });
  return res;
};

// ! 문서 분리 API
export const fetchSplitDocument = async (input: TCivilCaseDocumentSplitInput) => {
  const url = EVIDENCE_ROUTE.SPLIT_DOCUMENT.replace(':case_document_id', input.case_document_id);
  const { data } = await authClient.post<TCivilCaseDocumentSplitOutput>(url, {
    splits: input.splits,
  });
  return data;
};

// ! 사건 문서 생성(업로드) API
export const fetchCreateDocument = async (input: TCivilCaseDocumentCreateInput) => {
  const url = EVIDENCE_ROUTE.CREATE_DOCUMENT;
  const formData = new FormData();
  // macOS 파일명은 NFD(자모 분리)로 들어오는 경우가 많아,
  // 서버에서 '갑/을' 등 키워드 판별이 실패할 수 있다. (Postman은 보통 NFC)
  // multipart에 들어가는 title/filename을 NFC로 정규화해서 서버 판별을 안정화한다.
  const safeTitle = String(input.title ?? '').normalize('NFC');
  const safeFilename = String(input.file?.name ?? 'document.pdf').normalize('NFC');
  formData.append('civil_case_id', input.civil_case_id);
  formData.append('file', input.file, safeFilename);
  formData.append('title', safeTitle);
  formData.append('document_type', input.document_type);
  formData.append('is_plaintiff', input.is_plaintiff.toString());
  if (input.source_type) formData.append('source_type', input.source_type);
  const { data } = await authClient.post<TCivilCaseDocumentCreateOutput>(url, formData, {
    headers: {
      'Content-Type': 'multipart/form-data',
    },
  });
  return data;
};

// ! 문서 고정 API
export const fetchPinDocument = async (input: TCivilCaseDocumentPinInput) => {
  const url = EVIDENCE_ROUTE.PIN_DOCUMENT;
  const { data } = await authClient.post<TCivilCaseDocumentPinOutput>(url, input);
  return data;
};

// ! 문서이동 API
export const fetchMoveDocument = async (input: TCivilCaseDocumentMoveInput) => {
  const url = EVIDENCE_ROUTE.MOVE_DOCUMENT;
  const { data } = await authClient.put<TCivilCaseDocumentMoveOutput>(url, input);
  return data;
};

// ! 문서 북마크 추가 API
export const fetchBookmarkDocument = async (input: TCivilCaseDocumentBookmarkAddInput) => {
  const url = EVIDENCE_ROUTE.BOOKMARK_DOCUMENT;
  const { data } = await authClient.post<TCivilCaseDocumentBookmarkAddOutput>(url, input);
  return data;
};

// ! 문서 태그 추가 API
export const fetchTagDocument = async (input: TCivilCaseDocumentTagAddInput) => {
  const url = EVIDENCE_ROUTE.TAG_DOCUMENT;
  const { data } = await authClient.post<TCivilCaseDocumentTagAddOutput>(url, input);
  return data;
};

// ! 문서 태그 삭제 API
export const fetchDeleteTagDocument = async (tagSetId: string) => {
  const url = EVIDENCE_ROUTE.DELETE_TAG_DOCUMENT.replace(':tag_set_id', tagSetId);
  const { data } = await authClient.delete<TCivilCaseDocumentTagDeleteOutput>(url);
  return data;
};

// ! 문서 태그 목록 조회 API
export const fetchListTagDocument = async (civilCaseId: string, caseDocumentId: string) => {
  const url = EVIDENCE_ROUTE.LIST_TAG_DOCUMENT.replace(':civil_case_id', civilCaseId).replace(':case_document_id', caseDocumentId);
  const { data } = await authClient.get<TCivilCaseDocumentTagListOutput>(url);
  return data;
};

// ! 태그 셋 생성 API
export const fetchCreateTagSet = async (input: TCivilCaseDocumentTagSetCreateInput) => {
  const url = EVIDENCE_ROUTE.CREATE_TAG_SET;
  const { data } = await authClient.post<TCivilCaseDocumentTagSetCreateOutput>(url, input);
  return data;
};

// ! 태그 셋 수정 API
export const fetchUpdateTagSet = async (input: TCivilCaseDocumentTagSetUpdateInput) => {
  const url = EVIDENCE_ROUTE.UPDATE_TAG_SET;
  const { data } = await authClient.put<TCivilCaseDocumentTagSetUpdateOutput>(url, input);
  return data;
};

// ! 태그 셋 삭제 API
// NOTE: backend는 DELETE /civil-case-tagset/delete 에서 body로 { tag_set_id }를 받는다.
export const fetchDeleteTagSet = async (tagSetId: string) => {
  const url = EVIDENCE_ROUTE.DELETE_TAG_SET;
  const { data } = await authClient.delete<TCivilCaseDocumentTagSetDeleteOutput>(url, {
    data: { tag_set_id: tagSetId },
  });
  return data;
};

// ! 문서의 메모 추가 API
export const fetchAddMemo = async (input: TCivilCaseDocumentMemoAddInput) => {
  const url = EVIDENCE_ROUTE.ADD_MEMO;
  const { data } = await authClient.post<TCivilCaseDocumentMemoAddOutput>(url, input);
  return data;
};

// ! 문서의 메모 수정 API
export const fetchUpdateMemo = async (input: TCivilCaseDocumentMemoUpdateInput) => {
  const url = EVIDENCE_ROUTE.UPDATE_MEMO;
  const { data } = await authClient.put<TCivilCaseDocumentMemoUpdateOutput>(url, input);
  return data;
};

// ! 문서의 메모 삭제 API
export const fetchDeleteMemo = async (input: TCivilCaseDocumentMemoDeleteInput) => {
  const url = EVIDENCE_ROUTE.DELETE_MEMO;
  const { data } = await authClient.delete<TCivilCaseDocumentMemoDeleteOutput>(url, {
    data: input,
  });
  return data;
};

// ! 사건별 태그셋 목록 조회 API
export const fetchListTagSet = async (caseId: string) => {
  const url = EVIDENCE_ROUTE.LIST_TAG_SET.replace(':case_id', caseId);
  const { data } = await authClient.get<TCivilCaseDocumentTagSetListOutput>(url);
  return data;
};

// ! 문서별 메모 목록 조회 API
export const fetchListMemo = async (caseDocumentId: string) => {
  const url = EVIDENCE_ROUTE.LIST_MEMO.replace(':case_document_id', caseDocumentId);
  const { data } = await authClient.get<TCivilCaseDocumentMemoListOutput>(url);
  return data;
};

// ! 문서 필터 조회 API
export const fetchListFilter = async (civilCaseId: string) => {
  const url = EVIDENCE_ROUTE.LIST_FILTER.replace(':civil_case_id', civilCaseId);
  const { data } = await authClient.get<TCivilCaseFilterListOutput>(url);
  return data;
};

// ! 문서 매칭(연결) API
export type TCaseDocumentLinkInput = {
  client_document_id: string;
  lawyer_document_ids: string[];
  link_note?: string;
};
export type TCaseDocumentLinkOutput = {
  success?: boolean;
  message?: string;
  data?: {
    link_id?: string;
    [key: string]: any;
  };
};

export const fetchLinkCaseDocument = async (input: TCaseDocumentLinkInput) => {
  const { data } = await authClient.post<TCaseDocumentLinkOutput>('/case-document/link', input);
  return data;
};

// ! 문서 매칭(연결) 삭제 API
export type TCaseDocumentLinkDeleteOutput = {
  success?: boolean;
  message?: string;
};

export const fetchDeleteCaseDocumentLink = async (linkId: string) => {
  const { data } = await authClient.delete<TCaseDocumentLinkDeleteOutput>(`/case-document/link/${linkId}`);
  return data;
};
