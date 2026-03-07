import { ComponentType, lazy } from 'react';

export const safeLazy = <T,>(importFunction: () => Promise<{ default: ComponentType<T> }>) => {
  let retries = 0;
  const tryImport = async () => {
    try {
      return await importFunction();
    } catch (error) {
      // 최대 3회까지 재시도
      if (retries < 3) {
        retries++;
        return tryImport();
      }
      throw error;
    }
  };

  // 키는 각 컴포넌트에 대해 고유한 값이면 무엇이든 될 수 있습니다
  const storageKey = importFunction.toString();
  return lazy(async () => {
    try {
      const component = await tryImport();

      // 컴포넌트가 성공적으로 로드되면 sessionStorage 를 지우세요
      sessionStorage.removeItem(storageKey);

      return component;
    } catch (error) {
      if (!sessionStorage.getItem(storageKey)) {
        sessionStorage.setItem(storageKey, 'true');
        window.location.reload();
        return { default: () => null };
      }

      // 새로 고침 후에도 컴포넌트를 로드할 수 없다면 오류를 발생시킵니다
      throw error;
    }
  });
};
