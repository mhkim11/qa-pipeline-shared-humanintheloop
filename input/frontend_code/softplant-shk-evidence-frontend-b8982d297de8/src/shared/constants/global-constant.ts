// - 페이지네이션 관련 상수
export const NEXT = 'NEXT';
export const PREV = 'PREV';

// - 뮤테이션 상태 상수
export const INSERT = 'I';
export const UPDATE = 'U';
export const DELETE = 'D';

// - 백엔드 URL (환경 변수에서 가져옴)
export const BACKEND_URL = import.meta.env.VITE_BACKEND_URL || '';

// - 데모 백엔드 URL (환경 변수에서 가져옴; 없으면 일반 BACKEND_URL 사용)
export const DEMO_BACKEND_URL =
  import.meta.env.VITE_DEMO_BACKEND_URL ||
  // vite.config.ts defines `process.env` to `loadEnv(..., '')`, so non-VITE_ keys can be read from process.env
  (process.env.DEMO_BACKEND_URL as string | undefined) ||
  (process.env.VITE_DEMO_BACKEND_URL as string | undefined) ||
  BACKEND_URL;
