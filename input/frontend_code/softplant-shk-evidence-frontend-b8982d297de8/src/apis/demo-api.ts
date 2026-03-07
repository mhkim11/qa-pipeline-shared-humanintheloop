import axios from 'axios';

import { BACKEND_URL, DEMO_BACKEND_URL } from '@constants/index';
import type {
  TListDemoEvidenceFilterInput,
  TListDemoEvidenceFilterOutput,
  TListDemoEvidenceOutput,
  TListDemoEvidencesInput,
  TViewDemoDocumentInput,
} from '@/apis/type';
import type { TDemoLoginOutput } from '@/apis/type/demo.type';

const DEMO_ROUTE = {
  DEMO_LOGIN: '/auth/demo/login',
  EVIDENCES_DEMO_LIST: '/evidences/demo/list',
  EVIDENCES_DEMO_FILTER: '/evidences/demo/filter',
  EVIDENCES_DEMO_DOCUMENT: '/evidences/demo/document',
} as const;

const LEGAL_API_V1_PREFIX = '/legal/api/v1';

const getApiV1Path = (baseURL: string, route: string): string => {
  // If baseURL already contains "/api/v1" (commonly ".../legal/api/v1"), keep route short.
  // If baseURL is only host (e.g. "https://example.com"), prepend "/legal/api/v1".
  const normalized = (baseURL || '').toLowerCase();
  const hasApiV1 = normalized.includes('/api/v1');
  return hasApiV1 ? route : `${LEGAL_API_V1_PREFIX}${route}`;
};

const demoUnAuthClient = axios.create({
  baseURL: DEMO_BACKEND_URL,
  withCredentials: true,
});

export const fetchDemoLogin = async (): Promise<TDemoLoginOutput> => {
  if (!DEMO_BACKEND_URL) {
    throw new Error('DEMO_BACKEND_URL is empty. Set VITE_DEMO_BACKEND_URL (or DEMO_BACKEND_URL) to your demo backend base URL.');
  }

  const path = getApiV1Path(DEMO_BACKEND_URL, DEMO_ROUTE.DEMO_LOGIN);
  const { data } = await demoUnAuthClient.post<TDemoLoginOutput>(path);
  return data;
};

/**
 * * DEMO: 증거 리스트 API
 * @description /evidences/list 와 동일한 shape의 데모용 endpoint (/evidences/demo/list)
 * @summary [REST API] - POST | [ROUTE] - /legal/api/v1 /evidences/demo/list
 */
const demoEvidenceClient = axios.create({
  baseURL: BACKEND_URL,
  withCredentials: true,
});

export const fetchListEvidenceDemo = async (input: TListDemoEvidencesInput): Promise<TListDemoEvidenceOutput> => {
  const path = getApiV1Path(BACKEND_URL, DEMO_ROUTE.EVIDENCES_DEMO_LIST);
  const { data } = await demoEvidenceClient.post<TListDemoEvidenceOutput>(path, input);
  return data;
};

/**
 * * DEMO: 증거 목록 필터 조회 API
 * @description /evidences/filter 와 동일한 shape의 데모용 endpoint (/evidences/demo/filter)
 * @summary [REST API] - POST | [ROUTE] - /legal/api/v1 /evidences/demo/filter
 */
export const fetchListEvidenceDemoFilter = async (input: TListDemoEvidenceFilterInput): Promise<TListDemoEvidenceFilterOutput> => {
  const path = getApiV1Path(BACKEND_URL, DEMO_ROUTE.EVIDENCES_DEMO_FILTER);
  const { data } = await demoEvidenceClient.post<TListDemoEvidenceFilterOutput>(path, input);
  return data;
};

/**
 * * DEMO: 문서 보기 API
 * @description /evidences/document 와 동일한 shape의 데모용 endpoint (/evidences/demo/document)
 * @summary [REST API] - POST | [ROUTE] - /legal/api/v1 /evidences/demo/document
 * @returns {Promise<Blob>} PDF/Text 문서 데이터 (바이너리)
 */
export const fetchViewDocumentDemo = async (input: TViewDemoDocumentInput): Promise<Blob> => {
  const path = getApiV1Path(BACKEND_URL, DEMO_ROUTE.EVIDENCES_DEMO_DOCUMENT);
  const accept = input?.doc_type === 'pdf' ? 'application/pdf' : 'text/plain';
  const { data } = await demoEvidenceClient.post(path, input, {
    responseType: 'blob',
    headers: { Accept: accept },
  });
  return data;
};
