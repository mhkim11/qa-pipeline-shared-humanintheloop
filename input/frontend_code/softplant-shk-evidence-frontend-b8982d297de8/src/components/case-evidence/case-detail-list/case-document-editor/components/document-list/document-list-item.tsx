import { useRef, useState } from 'react';

import { MoreHorizontal } from 'lucide-react';

import { DocumentStatusBadge, TDocumentStatus } from '@/components/case-evidence/case-detail-list/case-document-editor';
import {
  Button,
  Checkbox,
  ContextMenu,
  ContextMenuContent,
  ContextMenuItem,
  ContextMenuSeparator,
  ContextMenuTrigger,
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui';
import { useConfirmStore } from '@/hooks/stores';
import { cn } from '@/lib/utils';

type TDownloadOptions = {
  document: boolean;
  attachment: boolean;
  pdf: boolean;
  docx: boolean;
};

const DOWNLOAD_OPTIONS_DEFAULT: TDownloadOptions = {
  document: true,
  attachment: true,
  pdf: true,
  docx: true,
};

/**
 * 다운로드 컨펌 다이얼로그 내부 컨텐츠
 */
const DownloadConfirmContent = ({ onChange }: { onChange: (options: TDownloadOptions) => void }) => {
  const [options, setOptions] = useState<TDownloadOptions>(DOWNLOAD_OPTIONS_DEFAULT);

  const handleChange = (key: keyof TDownloadOptions, checked: boolean) => {
    const next = { ...options, [key]: checked };
    setOptions(next);
    onChange(next);
  };

  return (
    <div className='flex flex-col gap-2 px-2'>
      <div className='space-y-1.5 px-2'>
        <h4 className='text-sm font-medium text-zinc-800'>다운로드할 항목을 선택하세요.</h4>

        <label className='flex items-center gap-2 text-sm font-medium text-zinc-800'>
          <Checkbox
            checked={options.document}
            onCheckedChange={(checked) => handleChange('document', !!checked)}
            className='data-[state=checked]:bg-zinc-900'
          />
          서면
        </label>
        <label className='flex items-center gap-2 text-sm font-medium text-zinc-800'>
          <Checkbox
            checked={options.attachment}
            onCheckedChange={(checked) => handleChange('attachment', !!checked)}
            className='data-[state=checked]:bg-zinc-900'
          />
          첨부 자료
        </label>
      </div>

      <div className='space-y-1.5 rounded-lg bg-zinc-100 p-2'>
        <h4 className='text-sm font-medium text-zinc-700'>서면 파일 형식</h4>
        <label className='flex items-center gap-2 text-sm font-medium text-zinc-800'>
          <Checkbox
            checked={options.pdf}
            onCheckedChange={(checked) => handleChange('pdf', !!checked)}
            className='data-[state=checked]:bg-zinc-900'
          />
          PDF : 편집 불가한 파일
        </label>
        <label className='flex items-center gap-2 text-sm font-medium text-zinc-800'>
          <Checkbox
            checked={options.docx}
            onCheckedChange={(checked) => handleChange('docx', !!checked)}
            className='data-[state=checked]:bg-zinc-900'
          />
          DOCX : 편집 가능한 파일
        </label>
      </div>
    </div>
  );
};

interface IDocumentListItemProps {
  title: string;
  status: TDocumentStatus;
  reg_dt: string;
  mod_dt: string;
  authorName: string;
  authorAvatar: string;
  editCount: number;
  attachmentCount: number;
  selectedHighlightCount: number;
  isSelected?: boolean;
  hasSelection?: boolean;
  onClickCard?: () => void;
}

/**
 * * 문서 목록 아이템 컴포넌트
 * @param {IDocumentListItemProps} props - 문서 목록 아이템 컴포넌트 속성
 * @returns JSX.Element
 */
export const DocumentListItem = ({
  title,
  status,
  reg_dt,
  mod_dt,
  authorName,
  authorAvatar,
  attachmentCount,
  selectedHighlightCount,
  isSelected = false,
  hasSelection = false,
  onClickCard,
}: IDocumentListItemProps): JSX.Element => {
  // ! Store
  const { onOpen } = useConfirmStore();

  // ! Ref
  const downloadOptionsRef = useRef<TDownloadOptions>(DOWNLOAD_OPTIONS_DEFAULT);

  // ! Handlers
  const onClickRename = () => {
    //
  };

  const onClickSaveAs = () => {
    //
  };

  const onClickDownload = () => {
    setTimeout(() => {
      downloadOptionsRef.current = DOWNLOAD_OPTIONS_DEFAULT;
      onOpen({
        title: '다운로드',
        message: (
          <DownloadConfirmContent
            onChange={(options) => {
              downloadOptionsRef.current = options;
            }}
          />
        ),
        confirmText: '다운로드',
        onConfirm: () => {
          console.log('다운로드 옵션:', downloadOptionsRef.current);
        },
      });
    }, 150);
  };

  const onClickDelete = () => {
    setTimeout(() => {
      onOpen({
        type: 'error',
        title: '서면을 삭제하시겠습니까?',
        message: '이 서면과 연결된 모든 내용이 함께 삭제됩니다.\n삭제된 서면은 복구할 수 없습니다.',
        onConfirm: () => {
          console.log('삭제하기');
        },
      });
    }, 150);
  };

  return (
    <ContextMenu>
      <ContextMenuTrigger asChild>
        <li
          className={cn(
            'grid h-12 grid-cols-[90px_1fr_130px_130px_130px_130px_130px_50px] gap-x-4 rounded-xl border px-4 transition-colors',
            {
              'border-zinc-200 bg-zinc-100': isSelected,
              'border-zinc-200 hover:bg-zinc-100': !isSelected,
              'flex-col items-start justify-center gap-1': hasSelection,
              'flex-row items-center justify-between': !hasSelection,
            },
          )}
          onClick={onClickCard}
        >
          {/* 상태 */}
          <div className='w-fit'>
            <DocumentStatusBadge status={status} />
          </div>

          {/* 서면 이름 */}
          <div className='text-zing-900 flex-1 text-base font-semibold'>{title}</div>

          {/* 첨부자료 */}
          <div className='text-sm font-normal text-[#8A8A8E]'>{attachmentCount > 0 ? `${attachmentCount}개` : '-'}</div>

          {/* 선택된 하이라이트 */}
          <div className='text-sm font-normal text-[#8A8A8E]'>{selectedHighlightCount > 0 ? `${selectedHighlightCount}개` : '-'}</div>

          {/* 생성자 */}
          <div className='flex items-center gap-1.5 text-sm font-medium text-zinc-600'>
            <img src={authorAvatar} alt='Avatar' className='size-6 rounded-full' />
            <span className='text-sm font-medium text-zinc-500'>{authorName}</span>
          </div>

          {/* 생성일 */}
          <div className='text-sm font-normal text-[#8A8A8E]'>{reg_dt}</div>

          {/* 최근 수정일 */}
          <div className='text-sm font-normal text-zinc-900'>{mod_dt}</div>

          {/* 액션 버튼 영역 */}
          <div className='flex items-center gap-1.5'>
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant='ghost' size='sm' onClick={(e) => e.stopPropagation()}>
                  <MoreHorizontal className='size-4' />
                </Button>
              </DropdownMenuTrigger>

              <DropdownMenuContent className='w-48 rounded-xl' onCloseAutoFocus={(e) => e.preventDefault()}>
                <DropdownMenuItem onClick={onClickRename} className='text-sm font-normal'>
                  <span>이름 바꾸기</span>
                </DropdownMenuItem>
                <DropdownMenuItem onClick={onClickSaveAs} className='text-sm font-normal'>
                  <span>다른 이름으로 저장하기</span>
                </DropdownMenuItem>
                <DropdownMenuItem onClick={onClickDownload} className='text-sm font-normal'>
                  <span>다운로드</span>
                </DropdownMenuItem>

                <DropdownMenuSeparator />

                <DropdownMenuItem onClick={onClickDelete} className='text-sm font-normal text-red-600 focus:text-red-600'>
                  <span>삭제하기</span>
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </li>
      </ContextMenuTrigger>

      <ContextMenuContent className='w-48 rounded-xl' onCloseAutoFocus={(e) => e.preventDefault()}>
        <ContextMenuItem onClick={onClickRename} className='text-sm font-normal'>
          <span>이름 바꾸기</span>
        </ContextMenuItem>

        <ContextMenuItem onClick={onClickSaveAs} className='text-sm font-normal'>
          <span>다른 이름으로 저장하기</span>
        </ContextMenuItem>

        <ContextMenuItem onClick={onClickDownload} className='text-sm font-normal'>
          <span>다운로드</span>
        </ContextMenuItem>

        <ContextMenuSeparator />

        <ContextMenuItem onClick={onClickDelete} className='text-sm font-normal text-red-600 focus:text-red-600'>
          <span>삭제하기</span>
        </ContextMenuItem>
      </ContextMenuContent>
    </ContextMenu>
  );
};
