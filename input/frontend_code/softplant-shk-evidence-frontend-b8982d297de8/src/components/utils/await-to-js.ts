/**
 * * await-to-js
 * @description Promise를 받아서 성공하면 [null, data]를 반환하고 실패하면 [error, undefined]를 반환합니다.
 * @param {Promise<T>} promise
 * @param {object} errorExt - 추가적인 에러 정보를 전달할 수 있습니다.
 * @return {Promise<[TU, undefined] | [null, T]>}
 */
export const to = async <T, TU = Error>(promise: Promise<T>, errorExt?: object): Promise<[TU, undefined] | [null, T]> => {
  return promise
    .then<[null, T]>((data: T) => [null, data])
    .catch<[TU, undefined]>((err: TU) => {
      if (errorExt) {
        const parsedError = Object.assign({}, err, errorExt);
        return [parsedError, undefined];
      }

      return [err, undefined];
    });
};
