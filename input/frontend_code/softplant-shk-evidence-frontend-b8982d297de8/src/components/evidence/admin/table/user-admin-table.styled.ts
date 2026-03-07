import { PackageOpen } from 'lucide-react';
import tw from 'twin.macro';

import { Table as UITable, TableCell as UITableCell, TableHead as UITableHead, TableRow as UITableRow } from '@components/ui';
import { PAGE_SIZE_GROUP } from '@/shared/constants';
import { styled } from '@/styles/transient-styled';

// Styled components from user provided style base
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
  ${tw`mt-[17px] flex w-full flex-col items-center overflow-auto`}
  max-height: calc(100vh - 300px);
`;

export const STable = styled.div`
  ${tw`flex h-full w-full flex-col justify-between gap-y-1`}
`;

export const Table = styled(UITable)`
  ${tw`mb-12`}
`;

export const TableHead = styled(UITableHead)`
  ${tw`bg-[#f5f5f5]`}
`;

export const TableRow = styled(UITableRow)`
  ${tw``}
`;

export const HeaderCell = styled(UITableCell)`
  ${tw`border-b border-[#c2c2c2] bg-[#f5f5f5]`}
`;

export const TableCell = styled(UITableCell)`
  ${tw``}
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

export const HeaderWrapper = styled.div`
  ${tw``}
`;

export const Header = styled.div`
  ${tw`text-[12px] font-semibold text-[#71717A]`}
`;

export const HeaderTitle = styled.div`
  ${tw`pt-[12px] text-[20px] font-semibold text-[#000]`}
`;

export const SearchWrapper2 = styled.div`
  ${tw`mt-[22px] w-full`}
`;

export const SearchWrapper = styled.div`
  ${tw`mt-[22px] w-full border`}
`;

export const LabelWrapper = styled.div`
  ${tw`flex h-[50px] w-[180px] items-center bg-[#F5F5F5] pl-[16px] text-[14px] font-semibold text-[#71717A]`}
`;

export const LabelWrapperB = styled.div`
  ${tw`flex h-[50px] items-center bg-[#F5F5F5] pl-[16px] text-[14px] font-semibold text-[#71717A] lg:w-[211px]`}
`;

export const CommonFlex = styled.div`
  ${tw`relative flex w-full items-center`}
`;

export const CommonFlex3 = styled.div`
  ${tw`relative flex w-full items-center`}
`;

export const CommonFlex2 = styled.div`
  ${tw`relative flex items-center`}
`;

export const TooltipContainer = styled.div`
  ${tw`relative inline-block cursor-pointer`}

  &:hover .tooltip-content {
    visibility: visible;
    opacity: 1;
  }
`;

export const TooltipContent = styled.div`
  ${tw`invisible absolute bottom-full left-1/2 z-[10000] mb-2 w-max max-w-[300px] -translate-x-1/2 transform rounded-md bg-gray-900 px-3 py-2 text-sm text-white opacity-0 shadow-lg transition-opacity duration-300`}

  &::after {
    content: '';
    position: absolute;
    top: 100%;
    left: 50%;
    margin-left: -5px;
    border-width: 5px;
    border-style: solid;
    border-color: #1f2937 transparent transparent transparent;
  }
`;
