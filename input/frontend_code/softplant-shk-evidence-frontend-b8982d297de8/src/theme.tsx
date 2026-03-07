import { JSX } from 'react';

import { Global, css } from '@emotion/react';

// export const transientOptions: Parameters<CreateStyled>[1] = {
//   shouldForwardProp: (propName: string) => !propName.startsWith('$'),
// };

const style = css`
  // ! jotai style
  .jotai-devtools-focus.jotai-devtools-active.internal-jotai-devtools-trigger-button.jotai-devtools-trigger-button {
    background-color: black !important;
  }

  input:-webkit-autofill,
  input:-webkit-autofill:hover,
  input:-webkit-autofill:focus,
  input:-webkit-autofill:active {
    -webkit-text-fill-color: #000;
    transition: background-color 5000s ease-in-out 0s;
  }

  input:autofill,
  input:autofill:hover,
  input:autofill:focus,
  input:autofill:active {
    -webkit-text-fill-color: #000;
    transition: background-color 5000s ease-in-out 0s;
  }

  * {
    // font-family: -apple-system, BlinkMacSystemFont, 'Apple SD Gothic Neo', 'Pretendard Variable', Pretendard, Roboto, 'Noto Sans KR',
    //   'Segoe UI', 'Malgun Gothic', 'Apple Color Emoji', 'Segoe UI Emoji', 'Segoe UI Symbol', sans-serif;
    font-family: 'Pretendard Variable', Pretendard, sans-serif;

    &::-webkit-scrollbar {
      width: 7px;
      height: 7px;
    }

    &::-webkit-scrollbar-thumb {
      background-color: #d4d4d8;
      border-radius: 16px;
    }

    &::-webkit-scrollbar-track {
      background-color: #f4f4f5;
      border-radius: 16px;
    }

    &::-webkit-scrollbar-thumb:hover {
      background-color: #a1a1aa;
    }

    scrollbar-width: thin;
    scrollbar-color: #d4d4d8 #f4f4f5;

    &::selection {
      color: black;
      background-color: #b2d6fe;
    }
  }

  .rdp-caption_dropdowns .rdp-vhidden {
    order: 1;
  }

  .rdp-caption_dropdowns .rdp-dropdown_month {
    order: 3;
  }

  .rdp-caption_dropdowns .rdp-dropdown_year {
    order: 2;
  }

  .rdp-head_row .rdp-head_cell:first-child {
    color: #f43f5e;
  }

  .rdp-head_row .rdp-head_cell:last-child {
    color: #3b82f6;
  }

  .rdp-button {
    border: 2px solid transparent;
    border-radius: 10px;
  }

  .rdp {
    --rdp-cell-size: 40px;
    --rdp-caption-font-size: 16px;
    --rdp-accent-color: #fff;
    --rdp-background-color: #f5f5f5;
    --rdp-accent-color-dark: #fff;
    --rdp-background-color-dark: #525252;
    --rdp-outline: 2px solid #e5e5e5;
    --rdp-outline-selected: 3px solid #e5e5e5;

    margin: 1em;
  }
`;

/**
 * * 테마 컴포넌트
 * @returns  {JSX.Element} 테마 컴포넌트
 */
const Theme = (): JSX.Element => {
  return <Global styles={style} />;
};

export default Theme;
