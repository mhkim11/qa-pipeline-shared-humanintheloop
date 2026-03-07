import { Dispatch, SetStateAction } from 'react';

import { Plus, Search } from 'lucide-react';

import { Button } from '@/components/ui';

type TDocumentListActionsProps = {
  searchKeyword: string;
  onChangeSearchKeyword: Dispatch<SetStateAction<string>>;

  onClickWriteDocument: () => void;
};

/**
 * * 문서 목록 액션 버튼 컴포넌트
 * @param {IDocumentListActionsProps} props - 문서 목록 액션 버튼 컴포넌트 속성
 * @returns JSX.Element
 */
export const DocumentListActions = ({
  searchKeyword,
  onChangeSearchKeyword,
  onClickWriteDocument,
}: TDocumentListActionsProps): JSX.Element => {
  return (
    <div className='flex items-center gap-1.5'>
      {/* 검색바 */}
      <div className='flex h-8 w-60 items-center gap-1.5 rounded-lg border border-zinc-200 bg-white px-3 py-1.5 shadow-sm focus-within:ring-1 focus-within:ring-primary'>
        <Search className='size-5 text-neutral-600' />
        <input
          type='text'
          placeholder='검색'
          className='w-full rounded-lg border-none bg-white p-0 py-1 text-sm font-medium text-zinc-700 outline-none placeholder:text-zinc-400 focus:ring-0'
          value={searchKeyword}
          onChange={(e) => onChangeSearchKeyword(e.target.value)}
        />
      </div>

      {/* 생성 버튼 */}
      <Button className='flex h-9 gap-1 rounded-lg bg-sky-300 text-white hover:bg-sky-400' onClick={onClickWriteDocument}>
        <Plus className='size-4' />
        <span className='text-sm font-medium text-white'>서면 생성</span>
      </Button>
    </div>
  );
};
