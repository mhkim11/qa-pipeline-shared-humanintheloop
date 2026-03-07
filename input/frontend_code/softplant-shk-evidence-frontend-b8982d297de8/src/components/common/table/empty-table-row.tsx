import { JSX } from 'react';

import * as S from '@styled/common/components/base-table.styled';
import { TableRow } from '@/components/ui';
import { PAGE_SIZE_GROUP } from '@/shared/constants';

type TEmptyTableRowProps = {
  colSpan: number;
  pageType?: (typeof PAGE_SIZE_GROUP)[keyof typeof PAGE_SIZE_GROUP];
  text: string;
};

/**
 * * tableRenderItem에서 데이터가 없을 때 렌더링되는 컴포넌트
 * @returns {JSX.Element} 빈 테이블 로우 컴포넌트
 */
export const EmptyTableRow = ({ colSpan, pageType = PAGE_SIZE_GROUP.PAGE_SIZE_TEN, text }: TEmptyTableRowProps): JSX.Element => {
  return (
    <TableRow>
      <S.TableCell colSpan={colSpan} className='text-center'>
        <S.EmptyCell $pageType={pageType}>
          <S.EmptyPackageIcon />
          <S.EmptyText>{text}</S.EmptyText>
        </S.EmptyCell>
      </S.TableCell>
    </TableRow>
  );
};
