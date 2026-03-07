import { useMemo } from 'react';

import { BLOCK_CNT, PAGE_SIZE_GROUP } from '@constants/pagination-constant';

type TUseBlockCnt = {
  refetchPageNumber: number;
  type?: (typeof PAGE_SIZE_GROUP)[keyof typeof PAGE_SIZE_GROUP];
};

/**
 * * blockCnt 계산: useMemo
 * @param {TUseBlockCnt} input - 페이지 번호 및 페이지 당 데이터 개수
 * @returns {string} blockCnt - 한 페이지에 보여줄 데이터 개수
 */
export const useBlockCnt = ({ refetchPageNumber, type }: TUseBlockCnt) => {
  /**
   * * userPageNumber 가 바뀔 때마다 blockCnt 를 계산하는 useMemo
   * @description userPageNumber 가 10의 배수일 때는 blockCnt 가 200 증가하고, 아닐 때는 100이 증가한다.
   */
  const blockCnt = useMemo(() => {
    const pageSize = type ? type : PAGE_SIZE_GROUP.PAGE_SIZE_TEN;
    const blockCntSize = type === 5 ? BLOCK_CNT.SIZE_50 : BLOCK_CNT.SIZE_100;

    const page =
      refetchPageNumber % (type ? type : 10) === 0
        ? (Math.ceil(refetchPageNumber / pageSize) + 1) * blockCntSize
        : Math.ceil(refetchPageNumber / pageSize) * blockCntSize;
    return String(page);
  }, [refetchPageNumber, type]);

  return { blockCnt };
};
