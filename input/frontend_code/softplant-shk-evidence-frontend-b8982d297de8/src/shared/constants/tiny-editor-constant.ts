import editorStyles from '@/styles/tiny-document-editor.css?raw';

/**
 * TinyMCE API JWK Key
 */
export const TINY_API_KEY = import.meta.env.VITE_TINY_API_KEY;
const TINY_API_JWK_KEY = import.meta.env.VITE_TINY_API_JWK_KEY_1;

const TINY_EDITOR_TOOLBAR_SETTINGS = {
  toolbar_sticky: true,
  toolbar_sticky_offset: 0,
  toolbar: [
    // 1행: 실행취소, 내보내기, 줌, 스타일, 폰트크기, 글자서식, 증거첨부
    'undo redo exportpdf | zoomControl | styles | fontsizeinput | bold italic underline forecolor | attachEvidence',
    // 2행: 삽입, 정렬, 목록/들여쓰기, 서식제거
    'link table image | alignleft aligncenter alignright alignjustify | bullist numlist outdent indent | removeformat',
  ],
};

/**
 * TinyMCE 초기 설정
 */
export const TINYMCE_INIT = {
  language: 'ko-KR',
  width: '100%',
  height: '100%',
  menubar: true,
  statusbar: false,

  /**
   * Toolbar 설정
   */

  ...TINY_EDITOR_TOOLBAR_SETTINGS,

  plugins: [
    'advlist',
    'autolink',
    'lists',
    'link',
    'image',
    'charmap',
    'preview',
    'anchor',
    'searchreplace',
    'visualblocks',
    'code',
    'fullscreen',
    'insertdatetime',
    'media',
    'table',
    'editimage',
    'wordcount',
    'quickbars',
    'markdown',
    'noneditable',
    'advlist',
    'anchor',
    'autolink',
    'charmap',
    'code',
    'fullscreen',
    'help',
    'image',
    'insertdatetime',
    'link',
    'lists',
    'media',
    'preview',
    'searchreplace',
    'table',
    'visualblocks',
  ],

  // Quick Toolbar 설정 (이미지 선택 시 나타나는 툴바)
  quickbars_selection_toolbar: false, // 텍스트 선택 시 Quick Toolbar 비활성화
  quickbars_insert_toolbar: false, // 빈 줄 클릭 시 Quick Toolbar 비활성화
  quickbars_image_toolbar: 'alignleft aligncenter alignright | editimage | customImageEdit',

  // 문서 스타일 - 가운데 흰색 영역 + 회색 배경
  content_style: editorStyles,

  exportpdf_token_provider: 'https://cite.local/pdf-token',
  exportpdf_token_provider_params: {
    token: TINY_API_JWK_KEY,
  },
  exportpdf_token_provider_method: 'POST',
  exportpdf_token_provider_headers: {
    'Content-Type': 'application/json',
  },
};
