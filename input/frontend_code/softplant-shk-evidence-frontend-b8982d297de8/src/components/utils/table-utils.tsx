import { JSX } from 'react';

type TTableResultInput = {
  loadingTableRow: JSX.Element; // react 컴포넌트
  emptyTableRow: JSX.Element; // react 컴포넌트
  tableRows: JSX.Element | JSX.Element[]; // jsx 를 반환하는 헬퍼 함수
  condition: {
    LOADING: boolean;
    EMPTY: boolean;
  };
};

type TTableResultOutput = JSX.Element | JSX.Element[];

/**
 * * mutation 응답 결과에 따른 처리
 * @param {TTableResultInput} input mutation 응답 결과에 따른 처리 input
 * @returns {TTableResultOutput} output mutation 응답 결과에 따른 처리 output
 */
export const getTableRowContent = ({ loadingTableRow, emptyTableRow, tableRows, condition }: TTableResultInput): TTableResultOutput => {
  /**
   * ! 응답에 따른 데이터 처리 map
   */
  const tableRowByStatus = {
    LOADING: loadingTableRow,
    EMPTY: emptyTableRow,
    TABLE_ROWS: tableRows,
  } as const;

  if (condition.LOADING) return tableRowByStatus.LOADING;
  if (condition.EMPTY) return tableRowByStatus.EMPTY;
  return tableRowByStatus.TABLE_ROWS;
};
