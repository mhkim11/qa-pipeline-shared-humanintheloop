import axios from 'axios';

import { globalStore, loginAtom } from '@atoms/default';
import { BACKEND_URL } from '@constants/index';

export const unAuthClient = axios.create({
  baseURL: BACKEND_URL,
  withCredentials: true,
});

export const authClient = axios.create({
  baseURL: BACKEND_URL,
  withCredentials: true,
});

/**
 * * AbortSignal 생성 함수
 * @param {number | undefined} timeoutMs - 타임아웃 시간
 * @returns  {AbortSignal} abortSignal
 */
export const cancelAbortSignal = (timeoutMs?: number): AbortSignal => {
  const abortController = new AbortController();
  setTimeout(() => abortController.abort(), timeoutMs || 0);

  return abortController.signal;
};

// unAuthClient.interceptors.request.use(
//   async function (config) {
//     if (config.headers) {
//       config.headers.Cookie = document.cookie;
//     }

//     return config;
//   },
//   function (error) {
//     return Promise.reject(error);
//   },
// );

unAuthClient.interceptors.response.use(
  async function (response) {
    return response;
  },
  function (error) {
    return Promise.reject(error);
  },
);

unAuthClient.interceptors.request.use(
  async function (config) {
    return config;
  },
  function (error) {
    return Promise.reject(error);
  },
);

authClient.interceptors.request.use(
  async function (config) {
    const login = globalStore.get(loginAtom);

    if (!login) throw new Error('인증 관련하여 문제가 발생하였습니다. 잠시후에 로그아웃 됩니다.');

    const accessToken = login?.data.accessToken;

    if (!accessToken) throw new Error('인증 관련하여 문제가 발생하였습니다. 잠시후에 로그아웃 됩니다.');

    if (config.headers) {
      config.headers.Authorization = `Bearer ${accessToken}`;
    }

    return config;
  },
  function (error) {
    return Promise.reject(error);
  },
);

authClient.interceptors.response.use(
  function (response) {
    return response;
  },
  async function (error) {
    return Promise.reject(error);
  },
);
