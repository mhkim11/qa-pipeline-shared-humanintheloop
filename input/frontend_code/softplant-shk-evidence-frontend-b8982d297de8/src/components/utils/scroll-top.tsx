import { useEffect } from 'react';

import { useLocation } from 'react-router-dom';

/**
 * * 스크롤을 맨 위로 이동하는 컴포넌트
 * @returns {null} 스크롤을 맨 위로 이동하는 컴포넌트
 */
export const ScrollTop = (): null => {
  const { pathname } = useLocation();
  useEffect(() => {
    window.scrollTo(0, 0);
  }, [pathname]);
  return null;
};
