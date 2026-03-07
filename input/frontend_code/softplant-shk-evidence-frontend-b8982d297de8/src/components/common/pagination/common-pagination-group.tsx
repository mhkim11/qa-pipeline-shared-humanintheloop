import { ReactNode, useMemo } from 'react';

import { size } from 'lodash-es';
import { ChevronsLeftIcon, ChevronsRightIcon } from 'lucide-react';

import {
  Pagination,
  PaginationContent,
  PaginationItem,
  PaginationLink,
  PaginationNext,
  PaginationPrevious,
} from '@components/ui/pagination';
import { onMessageToast } from '@/components/utils/global-utils';
import { TPaginationReducer } from '@/reducers';
import { PAGE_SIZE_GROUP } from '@/shared/constants';
import { NEXT, PREV } from '@/shared/constants/global-constant';

type TPaginationGroupProps = {
  data: number[];
  total: number;
  pageNumber: number;
  refetchPageNumber: number;
  dispatchPageNumber: (input: TPaginationReducer) => void;
  dispatchRefetchPageNumber: (input: TPaginationReducer) => void;
  pageType?: (typeof PAGE_SIZE_GROUP)[keyof typeof PAGE_SIZE_GROUP];
};

/**
 * * SettingPaginationGroup 컴포넌트
 * @param {TPaginationGroupProps} props - 페이지네이션 그룹 컴포넌트에 필요한 props
 * @returns {ReactNode}  PaginationGroup 컴포넌트
 */
export const CommonPaginationGroup = ({
  data,
  total,
  pageNumber,
  refetchPageNumber,
  dispatchPageNumber,
  dispatchRefetchPageNumber,
  pageType = PAGE_SIZE_GROUP.PAGE_SIZE_TEN,
}: TPaginationGroupProps): ReactNode => {
  /**
   * * 첫번째 페이지나 마지막 페이지일 때 warning 메시지
   * @param {typeof NEXT | typeof PREV} type - typeof NEXT | typeof PREV
   * @description 첫번째 페이지나 마지막 페이지일 때 warning 메시지를 띄워주는 함수입니다.
   * @returns {void} void
   */
  const onWarning = (type: typeof NEXT | typeof PREV): void => {
    const minText = '이동할 수 있는 최소 페이지입니다.';
    const maxText = '이동할 수 있는 최대 페이지입니다.';

    if (pageNumber === 1 && type === PREV) {
      onMessageToast({
        message: minText,
      });
      return;
    }

    if (pageNumber === 1 && type === NEXT) {
      onMessageToast({
        message: maxText,
      });
      return;
    }

    if (pageNumber === Math.ceil(total / pageType)) {
      onMessageToast({
        message: maxText,
      });
      return;
    }
  };

  /**
   * * 다음 페이지로 이동하게 하는 함수
   * @description 다음 페이지로 이동하게 하는 함수입니다. pageNumber 와
   * refetchPageNumber 가 같을 때 refetchPageNumber 도 같이 변경해줍니다.
   */
  const onNextPage = () => {
    dispatchPageNumber({ type: 'INCREMENT' });
    if (refetchPageNumber === pageNumber) {
      dispatchRefetchPageNumber({ type: 'INCREMENT' });
    }
  };

  /**
   * * 10개씩 다음 페이지로 이동하게 하는 함수
   * @description 10개씩 다음 페이지로 이동하게 하는 함수입니다.
   */
  const onTenNextPage = () => {
    const plusPageNumber = pageNumber + 10;
    const isMaxPage = plusPageNumber > data.length;

    dispatchPageNumber({
      type: 'SET',
      payload: isMaxPage ? data.length : pageNumber + 10,
    });
    if (refetchPageNumber < (isMaxPage ? data.length : pageNumber + 10)) {
      dispatchRefetchPageNumber({ type: 'SET', payload: isMaxPage ? data.length : pageNumber + 10 });
    }
  };

  /**
   * * 사용자가 직접 클릭했을때 페이지 번호 변경하는 함수
   * @description 사용자가 직접 클릭했을때 페이지 번호 변경하는 함수입니다.
   * count 가 refetchPageNumber 보다 크면 refetchPageNumber 도 같이 변경해줍니다.
   * @param {number} count - 페이지 번호
   */
  const onCountPage = (count: number) => {
    dispatchPageNumber({ type: 'SET', payload: count });
    if (refetchPageNumber < count) {
      dispatchRefetchPageNumber({ type: 'SET', payload: count });
    }
  };

  /**
   * * 10개씩 페이지 번호
   * @description 10개씩 페이지 번호를 만들어주는 useMemo 입니다.
   * @returns {{ begin : number , end: number }} begin 과 end 를 가진 객체
   */
  const divisibleByTenPage: { begin: number; end: number } = useMemo(() => {
    const page = {
      begin: 0,
      end: 0,
    };

    const beginResult =
      pageNumber % PAGE_SIZE_GROUP.PAGE_SIZE_TEN === 0 //
        ? Math.floor(pageNumber / PAGE_SIZE_GROUP.PAGE_SIZE_TEN) - 1
        : Math.floor(pageNumber / PAGE_SIZE_GROUP.PAGE_SIZE_TEN);

    const endResult =
      pageNumber % PAGE_SIZE_GROUP.PAGE_SIZE_TEN === 0 //
        ? Math.floor(pageNumber / PAGE_SIZE_GROUP.PAGE_SIZE_TEN)
        : Math.floor(pageNumber / PAGE_SIZE_GROUP.PAGE_SIZE_TEN) + 1;

    page.begin = beginResult * PAGE_SIZE_GROUP.PAGE_SIZE_TEN;
    page.end = endResult * PAGE_SIZE_GROUP.PAGE_SIZE_TEN;

    return page;
  }, [pageNumber]);

  if (size(data) === 0) {
    return null;
  }

  return (
    <Pagination>
      <PaginationContent>
        <PaginationItem
          onClick={
            pageNumber !== 1 ? (): void => dispatchPageNumber({ type: 'SET', payload: pageNumber - 10 }) : (): void => onWarning(PREV)
          }
        >
          <PaginationLink className='gap-1'>
            <span className='sr-only'>10개 이전</span>
            <ChevronsLeftIcon className='h-4 w-4' />
          </PaginationLink>
        </PaginationItem>
        <PaginationItem onClick={pageNumber !== 1 ? (): void => dispatchPageNumber({ type: 'DECREMENT' }) : (): void => onWarning(PREV)}>
          <PaginationPrevious />
        </PaginationItem>
        {data.slice(divisibleByTenPage.begin, divisibleByTenPage.end).map((count: number) => {
          return (
            <PaginationItem className='hidden sm:block' data-cy={`paginationItem${count}`} key={count} onClick={() => onCountPage(count)}>
              <PaginationLink isActive={count === pageNumber}>{count}</PaginationLink>
            </PaginationItem>
          );
        })}
        <PaginationItem onClick={pageNumber !== data.length ? onNextPage : (): void => onWarning(NEXT)}>
          <PaginationNext />
        </PaginationItem>
        <PaginationItem onClick={pageNumber !== data.length ? onTenNextPage : (): void => onWarning(NEXT)}>
          <PaginationLink className='gap-1'>
            <span className='sr-only'>10개 다음</span>
            <ChevronsRightIcon className='h-4 w-4' />
          </PaginationLink>
        </PaginationItem>
      </PaginationContent>
    </Pagination>
  );
};
