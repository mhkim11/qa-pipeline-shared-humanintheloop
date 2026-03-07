import { JSX } from 'react';

import { Spinner } from '@nextui-org/spinner';

import * as S from '@styled/common/components/base-table.styled';
import { PAGE_SIZE_GROUP } from '@/shared/constants';

type TEmptyTableRowProps = {
  colSpan: number;
  pageType?: (typeof PAGE_SIZE_GROUP)[keyof typeof PAGE_SIZE_GROUP];
};

/**
 * * tableRenderItem에서 로딩이였을때 렌더링되는 컴포넌트
 * @returns {JSX.Element} 로딩 이였을때 테이블 로우 컴포넌트
 */
export const LoadingTableRow = ({ colSpan, pageType = PAGE_SIZE_GROUP.PAGE_SIZE_TEN }: TEmptyTableRowProps): JSX.Element => {
  return (
    <S.TableRow>
      <S.TableCell colSpan={colSpan} className='text-center'>
        <S.EmptyCell $pageType={pageType}>
          <Spinner color='default' />
        </S.EmptyCell>
      </S.TableCell>
    </S.TableRow>
  );
};
