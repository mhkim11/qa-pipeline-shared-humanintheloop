import { Fragment } from 'react';

import { size } from 'lodash-es';

import { CommonPaginationGroup } from '@/components/common';
import { Table, TableBody, TableHeader, TableRow } from '@/components/ui';
import { totalPageArrayMaker } from '@/components/utils';
import { cn } from '@/lib/utils';
import { TPaginationReducer } from '@/reducers';
import { PAGE_SIZE_GROUP } from '@/shared/constants';
import { baseTableStyle as S } from '@/shared/styled';

type TTableLayoutProps<T> = {
  headerItems: JSX.Element[] | (() => JSX.Element);
  colItems: JSX.Element[];
  renderItem: (outputData: T[]) => JSX.Element | JSX.Element[];
  isLoading?: boolean;
  outputData: T[] | [];
  className?: string;
  pagination?: {
    pageNumber: number;
    refetchPageNumber: number;
    dispatchPageNumber: (input: TPaginationReducer) => void;
    dispatchRefetchPageNumber: (input: TPaginationReducer) => void;
  };
  pageType?: (typeof PAGE_SIZE_GROUP)[keyof typeof PAGE_SIZE_GROUP];
};

export const TableLayout = <T,>({
  className = 'min-h-[640px]',
  headerItems,
  colItems,
  renderItem,
  isLoading: _isLoading,
  outputData,
  pagination,
  pageType = PAGE_SIZE_GROUP.PAGE_SIZE_TEN,
}: TTableLayoutProps<T>) => {
  return (
    <div className={cn('flex', className)}>
      <S.TableBox>
        <S.STable>
          <Table>
            {/*
                // ! colgroup - 테이블의 열을 그룹화하여 열의 너비를 설정
            */}

            <colgroup>
              {colItems.map((item, index) => (
                <Fragment key={`TABLE-COL-${index}`}>{item}</Fragment>
              ))}
            </colgroup>

            {/*
                // ! TableHeader - 테이블의 헤더를 설정
            */}

            <TableHeader>
              {Array.isArray(headerItems) ? (
                <TableRow>
                  {headerItems.map((item, index) => (
                    <Fragment key={`TABLE-HEADER-${index}`}>{item}</Fragment>
                  ))}
                </TableRow>
              ) : (
                headerItems()
              )}
            </TableHeader>

            {/*
                // ! TableBody - 테이블의 본문을 설정
            */}

            <TableBody>{renderItem(outputData)}</TableBody>
          </Table>

          {size(outputData) !== 0 && pagination && (
            <S.PaginationWrapper>
              <CommonPaginationGroup
                data={totalPageArrayMaker(size(outputData), pageType)}
                total={size(outputData)}
                pageType={pageType}
                {...pagination}
              />
            </S.PaginationWrapper>
          )}
        </S.STable>
      </S.TableBox>
    </div>
  );
};
