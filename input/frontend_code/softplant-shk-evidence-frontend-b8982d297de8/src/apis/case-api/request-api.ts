import { authClient, unAuthClient } from '@apis/index';
import type {
  TRequestListInput,
  TRequestListOutput,
  TRequestFilterOptionsOutput,
  TRequestCreateInput,
  TRequestCreateOutput,
  TRequestDetailOutput,
  TRequestListClientOutput,
  TRequestListClientDetailOutput,
  TCreateLaywerRequestMessageInput,
  TCreateLaywerRequestMessageOutput,
  TRequestMessageListOutput,
  TRequestCreateClientMessageInput,
  TRequestCreateClientMessageOutput,
  TRequestDocumentListInput,
  TRequestDocumentListOutput,
  TRequestDraftByTargetInput,
  TRequestDraftByTargetOutput,
  TRequestSendInput,
  TRequestSendOutput,
  TRequestDraftCreateInput,
  TRequestDraftCreateOutput,
  TRequestClientEmailListInput,
  TRequestClientEmailListOutput,
  TRequestUpdateInput,
  TRequestUpdateOutput,
  TRequestPinToggleInput,
  TRequestPinToggleOutput,
  TMessageDraftInput,
  TMessageDraftOutput,
} from '@/apis/type/case-type/request-type';

type TCaseRequestQueryKey = {
  GET_REQUEST_LIST: 'GET_REQUEST_LIST';
  GET_REQUEST_FILTER_OPTIONS: 'GET_REQUEST_FILTER_OPTIONS';
  PIN_REQUEST: 'PIN_REQUEST';
  UPDATE_REQUEST: 'UPDATE_REQUEST';
  CREATE_REQUEST: 'CREATE_REQUEST';
  GET_REQUEST_DETAIL: 'GET_REQUEST_DETAIL';
  CREATE_LAYWER_REQUEST_MESSAGE: 'CREATE_LAYWER_REQUEST_MESSAGE';
  GET_REQUEST_MESSAGES: 'GET_REQUEST_MESSAGES';
  GET_REQUEST_DOCUMENT_LIST: 'GET_REQUEST_DOCUMENT_LIST';
  GET_REQUEST_DRAFT_BY_TARGET: 'GET_REQUEST_DRAFT_BY_TARGET';
  SEND_REQUEST: 'SEND_REQUEST';
  GET_REQUEST_CLIENT_EMAILS: 'GET_REQUEST_CLIENT_EMAILS';
  GET_MESSAGE_DRAFT: 'GET_MESSAGE_DRAFT';
  // ! 의뢰인용 (비회원 용)
  GET_REQUEST_LIST_CLIENT: 'GET_REQUEST_LIST_CLIENT';
  GET_REQUEST_LIST_CLIENT_DETAIL: 'GET_REQUEST_LIST_CLIENT_DETAIL';
  GET_REQUEST_MESSAGES_CLIENT: 'GET_REQUEST_MESSAGES_CLIENT';
  CREATE_CLIENT_REQUEST_MESSAGE: 'CREATE_CLIENT_REQUEST_MESSAGE';
};
type TCaseRequestRouteKey = {
  GET_REQUEST_LIST: '/evidence-request/list';
  GET_REQUEST_FILTER_OPTIONS: '/evidence-request/filter-options';
  PIN_REQUEST: '/evidence-request/pin/toggle';
  UPDATE_REQUEST: '/evidence-request/:requestId';
  CREATE_REQUEST: '/evidence-request/create';
  GET_REQUEST_DETAIL: '/evidence-request/detail/:request_id';
  CREATE_LAYWER_REQUEST_MESSAGE: '/evidence-request/:requestId/message';
  GET_REQUEST_MESSAGES: '/evidence-request/:requestId/messages';
  GET_REQUEST_DOCUMENT_LIST: '/evidence-request/documents';
  GET_REQUEST_DRAFT_BY_TARGET: '/evidence-request/draft-by-target';
  SEND_REQUEST: '/evidence-request/:requestId/send';
  GET_REQUEST_CLIENT_EMAILS: '/evidence-request/client-emails';
  GET_MESSAGE_DRAFT: '/evidence-request/message-draft';
  // ! 의뢰인용 (비회원 용)
  GET_REQUEST_LIST_CLIENT: '/evidence-request/client/case';
  GET_REQUEST_LIST_CLIENT_DETAIL: '/evidence-request/client/detail/:request_id/:client_email';
  GET_REQUEST_MESSAGES_CLIENT: '/evidence-request/:requestId/messages/client';
  CREATE_CLIENT_REQUEST_MESSAGE: '/evidence-request/:requestId/message/client';
};
export const EVIDENCE_QUERY_KEY: TCaseRequestQueryKey = {
  GET_REQUEST_LIST: 'GET_REQUEST_LIST',
  GET_REQUEST_FILTER_OPTIONS: 'GET_REQUEST_FILTER_OPTIONS',
  PIN_REQUEST: 'PIN_REQUEST',
  UPDATE_REQUEST: 'UPDATE_REQUEST',
  CREATE_REQUEST: 'CREATE_REQUEST',
  GET_REQUEST_DETAIL: 'GET_REQUEST_DETAIL',
  CREATE_LAYWER_REQUEST_MESSAGE: 'CREATE_LAYWER_REQUEST_MESSAGE',
  GET_REQUEST_MESSAGES: 'GET_REQUEST_MESSAGES',
  GET_REQUEST_DOCUMENT_LIST: 'GET_REQUEST_DOCUMENT_LIST',
  GET_REQUEST_DRAFT_BY_TARGET: 'GET_REQUEST_DRAFT_BY_TARGET',
  SEND_REQUEST: 'SEND_REQUEST',
  GET_REQUEST_CLIENT_EMAILS: 'GET_REQUEST_CLIENT_EMAILS',
  GET_MESSAGE_DRAFT: 'GET_MESSAGE_DRAFT',
  // ! 의뢰인용 (비회원 용)
  GET_REQUEST_LIST_CLIENT: 'GET_REQUEST_LIST_CLIENT',
  GET_REQUEST_LIST_CLIENT_DETAIL: 'GET_REQUEST_LIST_CLIENT_DETAIL',
  GET_REQUEST_MESSAGES_CLIENT: 'GET_REQUEST_MESSAGES_CLIENT',
  CREATE_CLIENT_REQUEST_MESSAGE: 'CREATE_CLIENT_REQUEST_MESSAGE',
};
export const EVIDENCE_ROUTE: TCaseRequestRouteKey = {
  GET_REQUEST_LIST: '/evidence-request/list',
  GET_REQUEST_FILTER_OPTIONS: '/evidence-request/filter-options',
  PIN_REQUEST: '/evidence-request/pin/toggle',
  UPDATE_REQUEST: '/evidence-request/:requestId',
  CREATE_REQUEST: '/evidence-request/create',
  GET_REQUEST_DETAIL: '/evidence-request/detail/:request_id',
  CREATE_LAYWER_REQUEST_MESSAGE: '/evidence-request/:requestId/message',
  GET_REQUEST_MESSAGES: '/evidence-request/:requestId/messages',
  GET_REQUEST_DOCUMENT_LIST: '/evidence-request/documents',
  GET_REQUEST_DRAFT_BY_TARGET: '/evidence-request/draft-by-target',
  SEND_REQUEST: '/evidence-request/:requestId/send',
  GET_REQUEST_CLIENT_EMAILS: '/evidence-request/client-emails',
  GET_MESSAGE_DRAFT: '/evidence-request/message-draft',
  // ! 의뢰인용 (비회원 용)
  GET_REQUEST_LIST_CLIENT: '/evidence-request/client/case',
  GET_REQUEST_LIST_CLIENT_DETAIL: '/evidence-request/client/detail/:request_id/:client_email',
  GET_REQUEST_MESSAGES_CLIENT: '/evidence-request/:requestId/messages/client',
  CREATE_CLIENT_REQUEST_MESSAGE: '/evidence-request/:requestId/message/client',
};
// ! 증거제출 요청 목록 조회
export const fetchGetRequestList = async (input: TRequestListInput): Promise<TRequestListOutput> => {
  const { data } = await authClient.post<TRequestListOutput>(EVIDENCE_ROUTE.GET_REQUEST_LIST, input);
  return data;
};

// ! 자료요청 필터 옵션 조회
export const fetchGetRequestFilterOptions = async (civil_case_id: string): Promise<TRequestFilterOptionsOutput> => {
  const { data } = await authClient.get<TRequestFilterOptionsOutput>(EVIDENCE_ROUTE.GET_REQUEST_FILTER_OPTIONS, {
    params: { civil_case_id },
  });
  return data;
};

// ! 자료요청 핀 토글
export const fetchToggleRequestPin = async (input: TRequestPinToggleInput): Promise<TRequestPinToggleOutput> => {
  const { data } = await authClient.post<TRequestPinToggleOutput>(EVIDENCE_ROUTE.PIN_REQUEST, input);
  return data;
};

// ! 자료요청 수정
export const fetchUpdateRequest = async (requestId: string, input: TRequestUpdateInput): Promise<TRequestUpdateOutput> => {
  const url = EVIDENCE_ROUTE.UPDATE_REQUEST.replace(':requestId', requestId);
  const { data } = await authClient.patch<TRequestUpdateOutput>(url, input);
  return data;
};

// ! 자료목록/숨긴자료 조회 (증거요청 기준)
export const fetchGetRequestDocumentList = async (input: TRequestDocumentListInput): Promise<TRequestDocumentListOutput> => {
  const { data } = await authClient.get<TRequestDocumentListOutput>(EVIDENCE_ROUTE.GET_REQUEST_DOCUMENT_LIST, {
    params: {
      evidence_request_id: input.evidence_request_id,
      evidence_category: input.evidence_category,
      page: input.page,
      limit: input.limit,
    },
  });
  return data;
};

// ! 임시 요청 조회 (타겟 기준)
export const fetchGetRequestDraftByTarget = async (input: TRequestDraftByTargetInput): Promise<TRequestDraftByTargetOutput> => {
  const { data } = await authClient.get<TRequestDraftByTargetOutput>(EVIDENCE_ROUTE.GET_REQUEST_DRAFT_BY_TARGET, {
    params: {
      target_type: input.target_type,
      target_id: input.target_id,
    },
  });
  return data;
};

// ! 의뢰인 이메일 목록 조회
export const fetchGetRequestClientEmails = async (input: TRequestClientEmailListInput): Promise<TRequestClientEmailListOutput> => {
  const { data } = await authClient.get<TRequestClientEmailListOutput>(EVIDENCE_ROUTE.GET_REQUEST_CLIENT_EMAILS, {
    params: {
      civil_case_id: input.civil_case_id,
      ...(input.search ? { search: input.search } : {}),
    },
  });
  return data;
};

// ! 메세지 임시저장 조회
export const fetchGetMessageDraft = async (input: TMessageDraftInput): Promise<TMessageDraftOutput> => {
  const { data } = await authClient.get<TMessageDraftOutput>(EVIDENCE_ROUTE.GET_MESSAGE_DRAFT, {
    params: {
      civil_case_id: input.civil_case_id,
    },
  });
  return data;
};

const normalizeMediaUrl = (rawUrl?: string | null) => {
  let url = String(rawUrl ?? '').trim();
  if (!url) return '';
  // handle duplicated http(s)://
  const httpRegex = /https?:\/\//g;
  let match: RegExpExecArray | null;
  let lastHttpIndex = -1;
  while ((match = httpRegex.exec(url)) !== null) lastHttpIndex = match.index;
  if (lastHttpIndex > 0) url = url.substring(lastHttpIndex);
  return url;
};

const guessFileNameFromUrl = (url: string, fallbackBase: string, contentType?: string | null) => {
  const safeUrl = String(url ?? '')
    .split('?')[0]
    .split('#')[0];
  const last = safeUrl.substring(safeUrl.lastIndexOf('/') + 1).trim();
  const hasExt = last.includes('.') && last.length <= 120;
  if (hasExt) return last;

  const ct = String(contentType ?? '').toLowerCase();
  let ext = '';
  if (ct.includes('png')) ext = 'png';
  else if (ct.includes('jpeg') || ct.includes('jpg')) ext = 'jpg';
  else if (ct.includes('webp')) ext = 'webp';
  else if (ct.includes('gif')) ext = 'gif';
  return `${fallbackBase}${ext ? `.${ext}` : ''}`;
};

const downloadUrlAsFile = async (rawUrl: string, fallbackBaseName: string): Promise<File | null> => {
  const url = normalizeMediaUrl(rawUrl);
  if (!url) return null;
  const res = await fetch(url);
  if (!res.ok) return null;
  const blob = await res.blob();
  const contentType = blob.type || res.headers.get('content-type') || undefined;
  const filename = guessFileNameFromUrl(url, fallbackBaseName, contentType);
  return new File([blob], filename, { type: contentType || 'application/octet-stream' });
};

// ! 증거제출 요청 생성
export const fetchCreateRequest = async (input: TRequestCreateInput): Promise<TRequestCreateOutput> => {
  const formData = new FormData();

  // fields (string)
  formData.append('civil_case_id', String(input?.civil_case_id ?? ''));
  formData.append('request_text', String(input?.request_text ?? ''));
  formData.append('message_text', String(input?.message_text ?? ''));
  formData.append('linked_image_url', String(input?.linked_image_url ?? ''));
  formData.append('client_email', String(input?.client_email ?? ''));
  formData.append('client_name', String(input?.client_name ?? ''));
  formData.append('assignee_id', String(input?.assignee_id ?? ''));
  formData.append('target_type', String(input?.target_type ?? ''));
  formData.append('target_id', String(input?.target_id ?? ''));

  // files (multipart)
  const baseFiles = Array.isArray(input?.files) ? input.files : [];
  for (const f of baseFiles) {
    if (!(f instanceof File)) continue;
    formData.append('files', f, f.name);
  }

  // also attach the clipping image itself (download from URL) if provided
  const linked = String(input?.linked_image_url ?? '').trim();
  if (linked) {
    try {
      const clipFile = await downloadUrlAsFile(linked, 'clipping');
      if (clipFile) formData.append('files', clipFile, clipFile.name);
    } catch (e) {
      // ignore download failure; URL is still sent as linked_image_url
      console.warn('failed to download linked_image_url as file', e);
    }
  }

  const { data } = await authClient.post<TRequestCreateOutput>(EVIDENCE_ROUTE.CREATE_REQUEST, formData, {
    // NOTE: let the browser/axios set proper multipart boundaries
  });
  return data;
};

// ! 임시저장 요청 생성 (JSON)
export const fetchCreateRequestDraft = async (input: TRequestDraftCreateInput): Promise<TRequestDraftCreateOutput> => {
  const { data } = await authClient.post<TRequestDraftCreateOutput>(EVIDENCE_ROUTE.CREATE_REQUEST, input);
  return data;
};

// ! 증거제출 요청 상세 조회
export const fetchGetRequestDetail = async (request_id: string): Promise<TRequestDetailOutput> => {
  const { data } = await authClient.get<TRequestDetailOutput>(`${EVIDENCE_ROUTE.GET_REQUEST_DETAIL.replace(':request_id', request_id)}`);
  return data;
};

// ! 안읽은 요청 읽음 처리 (GET /evidence-request/detail/:requestId 호출 시 서버에서 읽음으로 변경)
export const fetchMarkRequestAsRead = async (requestId: string): Promise<TRequestDetailOutput> => {
  const { data } = await authClient.get<TRequestDetailOutput>(EVIDENCE_ROUTE.GET_REQUEST_DETAIL.replace(':request_id', requestId));
  return data;
};

// ! 임시 요청 저장/전송
export const fetchSendRequest = async (requestId: string, input: TRequestSendInput): Promise<TRequestSendOutput> => {
  const url = EVIDENCE_ROUTE.SEND_REQUEST.replace(':requestId', requestId);
  const { data } = await authClient.post<TRequestSendOutput>(url, input);
  return data;
};

// ! 증거요청 목록 조회 (클라이언트 용)
export const fetchGetRequestListClient = async (civil_case_id: string, page: number, limit: number): Promise<TRequestListClientOutput> => {
  const { data } = await unAuthClient.get<TRequestListClientOutput>(EVIDENCE_ROUTE.GET_REQUEST_LIST_CLIENT, {
    params: { civil_case_id, page, limit },
  });
  return data;
};

// ! 증거요청 상세 조회 (클라이언트 용)
export const fetchGetRequestListClientDetail = async (
  request_id: string,
  client_email: string,
): Promise<TRequestListClientDetailOutput> => {
  const { data } = await unAuthClient.get<TRequestListClientDetailOutput>(
    EVIDENCE_ROUTE.GET_REQUEST_LIST_CLIENT_DETAIL.replace(':request_id', request_id).replace(
      ':client_email',
      encodeURIComponent(client_email),
    ),
  );
  return data;
};
// ! 메세지 생성 (변호사 용) - 폼데이터로 전송
export const fetchCreateLaywerRequestMessage = async (
  requestId: string,
  input: TCreateLaywerRequestMessageInput,
): Promise<TCreateLaywerRequestMessageOutput> => {
  const formData = new FormData();
  formData.append('message_text', String(input?.message_text ?? ''));
  formData.append('linked_image_url', String(input?.linked_image_url ?? ''));
  const files = Array.isArray(input?.files) ? input.files : [];
  for (const f of files) {
    if (!(f instanceof File)) continue;
    formData.append('files', f, f.name);
  }
  const { data } = await authClient.post<TCreateLaywerRequestMessageOutput>(
    EVIDENCE_ROUTE.CREATE_LAYWER_REQUEST_MESSAGE.replace(':requestId', requestId),
    formData,
  );
  return data;
};

// ! 요청 메세지 리스트 조회 (변호사/내부용)
export const fetchGetRequestMessages = async (requestId: string, page = 1, limit = 50): Promise<TRequestMessageListOutput> => {
  const { data } = await authClient.get<TRequestMessageListOutput>(
    EVIDENCE_ROUTE.GET_REQUEST_MESSAGES.replace(':requestId', encodeURIComponent(requestId)),
    { params: { page, limit } },
  );
  return data;
};

// ! 요청 메세지 리스트 조회 (의뢰인용/비회원용)
export const fetchGetRequestMessagesClient = async (requestId: string, page = 1, limit = 50): Promise<TRequestMessageListOutput> => {
  const { data } = await unAuthClient.get<TRequestMessageListOutput>(
    EVIDENCE_ROUTE.GET_REQUEST_MESSAGES_CLIENT.replace(':requestId', encodeURIComponent(requestId)),
    { params: { page, limit } },
  );
  return data;
};

// ! 메세지 생성 (의뢰인용/비회원용)
export const fetchCreateClientRequestMessage = async (
  requestId: string,
  input: TRequestCreateClientMessageInput,
): Promise<TRequestCreateClientMessageOutput> => {
  const formData = new FormData();
  formData.append('message_text', String(input?.message_text ?? ''));
  formData.append('linked_image_url', String(input?.linked_image_url ?? ''));
  const files = Array.isArray(input?.files) ? input.files : [];
  for (const f of files) {
    if (!(f instanceof File)) continue;
    formData.append('files', f, f.name.normalize('NFC'));
  }
  const { data } = await unAuthClient.post<TRequestCreateClientMessageOutput>(
    EVIDENCE_ROUTE.CREATE_CLIENT_REQUEST_MESSAGE.replace(':requestId', encodeURIComponent(requestId)),
    formData,
  );
  return data;
};
