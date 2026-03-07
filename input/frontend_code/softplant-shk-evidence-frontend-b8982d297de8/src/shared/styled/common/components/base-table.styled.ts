import { PackageOpen } from 'lucide-react';
import tw from 'twin.macro';

import { Table as UITable, TableCell as UITableCell, TableHead as UITableHead, TableRow as UITableRow } from '@components/ui';
import { PAGE_SIZE_GROUP } from '@/shared/constants';
import { styled } from '@/styles/transient-styled';

type TEmptyCell = {
  $pageType: (typeof PAGE_SIZE_GROUP)[keyof typeof PAGE_SIZE_GROUP];
};

export const TableTitle = styled.h3`
  ${tw`mb-1.5 mt-12 text-lg text-zinc-700 pretendard-medium`}
`;

export const TableTitleRoot = styled.div`
  ${tw`flex w-full flex-col`}
`;

export const TableLayoutWrapper = styled.div`
  ${tw`mb-1 flex w-full flex-col gap-y-3`}
`;

export const TableBox = styled.div`
  ${tw`flex w-full flex-col items-center gap-y-2`}
`;

export const STable = styled.div`
  ${tw`flex h-full w-full flex-col justify-between gap-y-1`}
`;

export const Table = styled(UITable)`
  ${tw`mb-12 border-1 border-zinc-200`}
`;

export const TableHead = styled(UITableHead)`
  ${tw`bg-zinc-100 px-4 py-3 text-sm text-zinc-800 pretendard-medium last:border-r-0`}
`;

export const TableRow = styled(UITableRow)`
  ${tw`border-zinc-200 hover:bg-zinc-200/50`}
`;

export const TableCell = styled(UITableCell)`
  ${tw`h-[50px] place-items-center border-zinc-200 px-4 py-4 text-sm text-zinc-800 pretendard last:border-r-0`}
`;

export const TableTotalCell = styled(TableCell)`
  ${tw`bg-zinc-100 px-4 py-3 text-sm text-zinc-800 pretendard-medium last:border-r-0`}
`;

export const TableInputCell = styled(TableCell)`
  ${tw`py-2`}
`;

export const EmptyCell = styled.div<TEmptyCell>`
  ${({ $pageType }) => {
    const pageTypeMap = {
      [PAGE_SIZE_GROUP.PAGE_SIZE_FIVE]: tw`min-h-[300px]`,
      [PAGE_SIZE_GROUP.PAGE_SIZE_TEN]: tw`min-h-[600px]`,
    };

    return pageTypeMap[$pageType as keyof typeof pageTypeMap];
  }}

  ${tw`flex flex-col items-center justify-center gap-y-2`}
`;

export const EmptyPackageIcon = styled(PackageOpen)`
  ${tw`mx-auto h-14 w-14 text-neutral-400`}
`;

export const EmptyText = styled.p`
  ${tw`text-lg text-neutral-400 pretendard-semibold`}
`;

export const PaginationWrapper = styled.div`
  ${tw`flex items-center justify-center pb-2 pt-4`}
`;
