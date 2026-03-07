import { z } from 'zod';

import { onMessageToast, to } from '@/components/utils';

/**
 * * zod 유효성 검사 미들웨어
 * @description 입력 데이터를 검증하는 미들웨어 입니다.
 * @template T
 * @template TReturn
 * @callback {(callbackData: T) => Promise<TReturn>} callback - 콜백 함수
 * @param {z.SafeParseReturnType<T, T>} validate - zod 유효성 검사 결과
 * @returns {( callback: (callbackData: T) => Promise<TReturn>) => Promise<TReturn> | undefined} 콜백 함수 실행 결과 반환 -> TReturn | undefined
 */
export const withValidationMiddleware = <T, TReturn>(
  validate: z.SafeParseReturnType<T, T>,
): ((callback: (callbackData: T) => Promise<TReturn>) => Promise<TReturn | undefined>) => {
  /**
   * * zod 유효성 검사 후 콜백 함수를 실행하는 함수
   * @description 입력 데이터를 검증 후 콜백 함수를 실행합니다.
   * @template T
   * @template TReturn
   * @param {(callbackData: T) => Promise<TReturn> | undefined} callback - 콜백 함수
   * @returns {Promise<TReturn> | undefined} 콜백 함수 실행 결과 반환 -> TReturn | undefined
   */
  return async (callback: (callbackData: T) => Promise<TReturn>): Promise<TReturn | undefined> => {
    if (!validate.success) {
      // - 프로덕션 환경에서 에러 메시지를 출력
      if (
        process.env.NODE_ENV === 'production' &&
        (!window.location.pathname.includes('busan') || !window.location.pathname.includes('sky'))
      ) {
        const productionMessage = '입력값을 한번 더 확인해주세요.';
        onMessageToast({ message: productionMessage });
        return undefined;
      }

      // - 개발 환경에서 에러 메시지를 출력
      const resultError = validate?.error?.flatten();
      const resultMessage = Object.entries(resultError?.fieldErrors).map(([_key, value]: [string, unknown], index) => {
        const typedValue = value as string[];
        return `${(typedValue ?? [])?.map((item) => `${index + 1}. ${item}`).join(' | ')}`;
      });

      const finalError = `${resultMessage.join(' & ')}`;
      onMessageToast({ message: finalError || '입력값을 한번 더 확인 해주세요.' });
      return undefined;
    }

    const [error, result] = await to(callback(validate.data));

    if (error instanceof Error) {
      console.log('MIDDLEWARE ERROR:: ', error);
      onMessageToast({ message: '전달 과정에서 문제가 생겼습니다.' });
      return undefined;
    }

    return result;
  };
};
