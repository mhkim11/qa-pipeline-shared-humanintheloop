import { useEffect } from 'react';

type TUseEnterKeySearch = {
  isEnterDisabled: boolean;
  onSearch: () => void;
};

/**
 * * 엔터를 쳤을 때 넘겨준 search 함수를 실행할 수 있도록 제어
 * - isEnterDisabled 가 true 일 경우, 엔터키를 눌러도 search 함수가 실행되지 않음
 * @param {TUseEnterKeySearch} input - 엔터키를 눌렀을 때 실행할 함수와 실행 여부
 */
export const useEnterKeySearch = ({ isEnterDisabled, onSearch }: TUseEnterKeySearch) => {
  useEffect(() => {
    if (isEnterDisabled) return;

    const onEnterPress = (event: KeyboardEvent) => {
      if (event.key === 'Enter') {
        event.preventDefault();
        onSearch();
      }
    };

    window.addEventListener('keydown', onEnterPress);

    return () => {
      window.removeEventListener('keydown', onEnterPress);
    };
  }, [isEnterDisabled, onSearch]);
};
