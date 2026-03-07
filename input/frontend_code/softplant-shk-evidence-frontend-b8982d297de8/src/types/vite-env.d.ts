/// <reference types="vite/client" />

interface ImportMetaEnv {
  readonly NODE_ENV: 'development' | 'production';
  readonly VITE_BACKEND_URL: string;
  readonly VITE_DEMO_BACKEND_URL?: string;
  readonly VITE_FRONTEND_URL: string;
  readonly VITE_DEBUG_MODE: string;
  readonly VITE_BUILD_TIMESTAMP: string;
}

declare namespace NodeJS {
  interface ProcessEnv {
    NODE_ENV: 'test' | 'development' | 'production';
    VITE_BACKEND_URL: string;
    VITE_DEMO_BACKEND_URL?: string;
    DEMO_BACKEND_URL?: string;
    VITE_FRONTEND_URL: string;
    VITE_DEBUG_MODE: string;
    VITE_BUILD_TIMESTAMP: string;
  }
}

declare const __BUILD_TIMESTAMP__: string;

// SVG 모듈 선언 추가
declare module '*.svg' {
  import React = require('react');
  export const ReactComponent: React.FC<React.SVGProps<SVGSVGElement>>;
  const src: string;
  export default src;
}