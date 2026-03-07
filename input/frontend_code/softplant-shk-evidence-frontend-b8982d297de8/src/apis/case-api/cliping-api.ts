import { authClient } from '@apis/index';
import type {
  TCreateClippingOutput,
  TCreateClippingRequest,
  TGetClippingFolderListInput,
  TGetClippingFolderListOutput,
  TDeleteClippingInput,
  TDeleteClippingOutput,
  TGetClippingListInput,
  TGetClippingListOutput,
  TGetClippingNotesInput,
  TGetClippingNotesOutput,
  TUpdateClippingOutput,
  TUpdateClippingRequest,
  TAddMemoInput,
  TAddMemoOutput,
  TUpdateMemoInput,
  TUpdateMemoOutput,
  TDeleteMemoOutput,
  TAddCommentInput,
  TAddCommentOutput,
  TUpdateCommentInput,
  TUpdateCommentOutput,
  TDeleteCommentOutput,
  TGetClippingListByTagInput,
} from '@/apis/type/case-type/cliping.type';

type TCaseClippingQueryKey = {
  CREATE_CLIPPING_FOLDER: 'CREATE_CLIPPING_FOLDER';
  UPDATE_CLIPPING_FOLDER: 'UPDATE_CLIPPING_FOLDER';
  DELETE_CLIPPING_FOLDER: 'DELETE_CLIPPING_FOLDER';
  GET_CLIPPING_FOLDER_LIST: 'GET_CLIPPING_FOLDER_LIST';
  CREATE_CLIPPING: 'CREATE_CLIPPING';
  UPDATE_CLIPPING: 'UPDATE_CLIPPING';
  DELETE_CLIPPING: 'DELETE_CLIPPING';
  GET_CLIPPING_LIST: 'GET_CLIPPING_LIST';
  GET_CLIPPING_LIST_BY_TAG: 'GET_CLIPPING_LIST_BY_TAG';
  GET_CLIPPING_LIST_FOR_EVIDENCE_REQUEST: 'GET_CLIPPING_LIST_FOR_EVIDENCE_REQUEST';
  ADD_MEMO: 'ADD_MEMO';
  UPDATE_MEMO: 'UPDATE_MEMO';
  DELETE_MEMO: 'DELETE_MEMO';
  ADD_COMMENT: 'ADD_COMMENT';
  UPDATE_COMMENT: 'UPDATE_COMMENT';
  DELETE_COMMENT: 'DELETE_COMMENT';
};
type TCaseClippingRouteKey = {
  CREATE_CLIPPING_FOLDER: '/office/:office_id/clipping-folder';
  UPDATE_CLIPPING_FOLDER: '/office/:office_id/clipping-folder/:folderId';
  DELETE_CLIPPING_FOLDER: '/office/:office_id/clipping-folder/:folderId';
  GET_CLIPPING_FOLDER_LIST: '/office/:office_id/clipping-folder';
  CREATE_CLIPPING: '/clipping';
  UPDATE_CLIPPING: '/clipping/:clippingId';
  DELETE_CLIPPING: '/clipping/:clippingId';
  GET_CLIPPING_LIST: '/clipping';
  GET_CLIPPING_LIST_BY_TAG: '/clipping/by-tag';
  GET_CLIPPING_LIST_FOR_EVIDENCE_REQUEST: '/clipping/for-evidence-request';
  GET_CLIPPING_NOTES: '/clipping/:clippingId/notes';
  ADD_MEMO: '/clipping/:clippingId/notes';
  UPDATE_MEMO: '/clipping/notes/:noteId';
  DELETE_MEMO: '/clipping/notes/:noteId';
  ADD_COMMENT: '/clipping/notes/:noteId/comments';
  UPDATE_COMMENT: '/clipping/notes/comments/:commentId';
  DELETE_COMMENT: '/clipping/notes/comments/:commentId';
};

export const EVIDENCE_QUERY_KEY: TCaseClippingQueryKey = {
  CREATE_CLIPPING_FOLDER: 'CREATE_CLIPPING_FOLDER',
  UPDATE_CLIPPING_FOLDER: 'UPDATE_CLIPPING_FOLDER',
  DELETE_CLIPPING_FOLDER: 'DELETE_CLIPPING_FOLDER',
  GET_CLIPPING_FOLDER_LIST: 'GET_CLIPPING_FOLDER_LIST',
  CREATE_CLIPPING: 'CREATE_CLIPPING',
  UPDATE_CLIPPING: 'UPDATE_CLIPPING',
  DELETE_CLIPPING: 'DELETE_CLIPPING',
  GET_CLIPPING_LIST: 'GET_CLIPPING_LIST',
  GET_CLIPPING_LIST_BY_TAG: 'GET_CLIPPING_LIST_BY_TAG',
  GET_CLIPPING_LIST_FOR_EVIDENCE_REQUEST: 'GET_CLIPPING_LIST_FOR_EVIDENCE_REQUEST',
  ADD_MEMO: 'ADD_MEMO',
  UPDATE_MEMO: 'UPDATE_MEMO',
  DELETE_MEMO: 'DELETE_MEMO',
  ADD_COMMENT: 'ADD_COMMENT',
  UPDATE_COMMENT: 'UPDATE_COMMENT',
  DELETE_COMMENT: 'DELETE_COMMENT',
};

export const EVIDENCE_ROUTE: TCaseClippingRouteKey = {
  CREATE_CLIPPING_FOLDER: '/office/:office_id/clipping-folder',
  UPDATE_CLIPPING_FOLDER: '/office/:office_id/clipping-folder/:folderId',
  DELETE_CLIPPING_FOLDER: '/office/:office_id/clipping-folder/:folderId',
  GET_CLIPPING_FOLDER_LIST: '/office/:office_id/clipping-folder',
  CREATE_CLIPPING: '/clipping',
  UPDATE_CLIPPING: '/clipping/:clippingId',
  DELETE_CLIPPING: '/clipping/:clippingId',
  GET_CLIPPING_LIST: '/clipping',
  GET_CLIPPING_LIST_BY_TAG: '/clipping/by-tag',
  GET_CLIPPING_LIST_FOR_EVIDENCE_REQUEST: '/clipping/for-evidence-request',
  GET_CLIPPING_NOTES: '/clipping/:clippingId/notes',
  ADD_MEMO: '/clipping/:clippingId/notes',
  UPDATE_MEMO: '/clipping/notes/:noteId',
  DELETE_MEMO: '/clipping/notes/:noteId',
  ADD_COMMENT: '/clipping/notes/:noteId/comments',
  UPDATE_COMMENT: '/clipping/notes/comments/:commentId',
  DELETE_COMMENT: '/clipping/notes/comments/:commentId',
};

export const fetchGetClippingFolderList = async (officeId: string, input: TGetClippingFolderListInput) => {
  const url = EVIDENCE_ROUTE.GET_CLIPPING_FOLDER_LIST.replace(':office_id', officeId);
  const { data } = await authClient.get<TGetClippingFolderListOutput>(url, { params: input });
  return data;
};

export const fetchGetClippingList = async () => {
  const url = EVIDENCE_ROUTE.GET_CLIPPING_LIST;
  const { data } = await authClient.get<TGetClippingListOutput>(url);
  return data;
};

export const fetchGetClippingListByCivilCase = async (input: TGetClippingListInput) => {
  const url = EVIDENCE_ROUTE.GET_CLIPPING_LIST;
  const { data } = await authClient.get<TGetClippingListOutput>(url, { params: input });
  return data;
};

export const fetchGetClippingListByTag = async (input: TGetClippingListByTagInput) => {
  const url = EVIDENCE_ROUTE.GET_CLIPPING_LIST_BY_TAG;
  const { data } = await authClient.post<TGetClippingListOutput>(url, input);
  return data;
};

export const fetchGetClippingListForEvidenceRequest = async (civilCaseId: string, status: string = 'all') => {
  const url = EVIDENCE_ROUTE.GET_CLIPPING_LIST_FOR_EVIDENCE_REQUEST;
  const { data } = await authClient.get<TGetClippingListOutput>(url, {
    params: {
      civil_case_id: civilCaseId,
      status,
    },
  });
  return data;
};

export const fetchGetClippingNotes = async ({ clipping_id, input }: { clipping_id: string; input: TGetClippingNotesInput }) => {
  const url = EVIDENCE_ROUTE.GET_CLIPPING_NOTES.replace(':clippingId', clipping_id);
  const { data } = await authClient.get<TGetClippingNotesOutput>(url, { params: input });
  return data;
};

export const fetchCreateClipping = async ({ office_id, input }: TCreateClippingRequest) => {
  const url = EVIDENCE_ROUTE.CREATE_CLIPPING.replace(':office_id', office_id);
  // backend: multipart/form-data (file 포함)
  const formData = new FormData();
  Object.entries(input ?? {}).forEach(([k, v]) => {
    if (v === undefined || v === null) return;
    if (k === 'file') return;
    if (k === 'tags' && Array.isArray(v)) {
      formData.append('tags', JSON.stringify(v));
      return;
    }
    if (typeof v === 'boolean') {
      formData.append(k, v ? 'true' : 'false');
      return;
    }
    formData.append(k, String(v));
  });
  if (input?.file instanceof File) {
    formData.append('file', input.file);
  }

  const { data } = await authClient.post<TCreateClippingOutput>(url, formData, {
    headers: { 'Content-Type': 'multipart/form-data' },
  });
  return data;
};

export const fetchUpdateClipping = async ({ clipping_id, input }: TUpdateClippingRequest) => {
  const url = EVIDENCE_ROUTE.UPDATE_CLIPPING.replace(':clippingId', clipping_id);
  const { data } = await authClient.put<TUpdateClippingOutput>(url, input);
  return data;
};

export const fetchDeleteClipping = async ({ clipping_id }: TDeleteClippingInput) => {
  const url = EVIDENCE_ROUTE.DELETE_CLIPPING.replace(':clippingId', clipping_id);
  const { data } = await authClient.delete<TDeleteClippingOutput>(url);
  return data;
};

export const fetchAddMemo = async ({ clipping_id, input }: { clipping_id: string; input: TAddMemoInput }) => {
  const url = EVIDENCE_ROUTE.ADD_MEMO.replace(':clippingId', clipping_id);
  const { data } = await authClient.post<TAddMemoOutput>(url, input);
  return data;
};

export const fetchUpdateMemo = async ({ note_id, input }: { note_id: string; input: TUpdateMemoInput }) => {
  const url = EVIDENCE_ROUTE.UPDATE_MEMO.replace(':noteId', note_id);
  const { data } = await authClient.put<TUpdateMemoOutput>(url, input);
  return data;
};

export const fetchDeleteMemo = async ({ note_id }: { note_id: string }) => {
  const url = EVIDENCE_ROUTE.DELETE_MEMO.replace(':noteId', note_id);
  const { data } = await authClient.delete<TDeleteMemoOutput>(url);
  return data;
};

export const fetchAddComment = async ({ note_id, input }: { note_id: string; input: TAddCommentInput }) => {
  const url = EVIDENCE_ROUTE.ADD_COMMENT.replace(':noteId', note_id);
  const { data } = await authClient.post<TAddCommentOutput>(url, input);
  return data;
};

export const fetchUpdateComment = async ({ comment_id, input }: { comment_id: string; input: TUpdateCommentInput }) => {
  const url = EVIDENCE_ROUTE.UPDATE_COMMENT.replace(':commentId', comment_id);
  const { data } = await authClient.put<TUpdateCommentOutput>(url, input);
  return data;
};

export const fetchDeleteComment = async ({ comment_id }: { comment_id: string }) => {
  const url = EVIDENCE_ROUTE.DELETE_COMMENT.replace(':commentId', comment_id);
  const { data } = await authClient.delete<TDeleteCommentOutput>(url);
  return data;
};
