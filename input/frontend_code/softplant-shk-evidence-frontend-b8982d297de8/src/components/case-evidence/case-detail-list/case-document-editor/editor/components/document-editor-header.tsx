import { BellDotIcon, ChevronLeft, FileClockIcon, HighlighterIcon, NotepadTextIcon, SendIcon } from 'lucide-react';

import { DocumentStatusBadge } from '@/components/case-evidence/case-detail-list/case-document-editor/components/shared';
import { type TDocumentStatus } from '@/components/case-evidence/case-detail-list/case-document-editor/types/case-document-editor.type';
import { Button } from '@/components/ui';
import { cn } from '@/lib/utils';

interface IDocumentEditorHeaderProps {
  onBack: () => void;
  status: TDocumentStatus;
  title: string;
  onToggleMemoPanel: () => void;
  isOpenMemoPanel: boolean;
}

export const DocumentEditorHeader = ({
  onBack,
  status,
  title,
  onToggleMemoPanel,
  // _isOpenMemoPanel,
}: IDocumentEditorHeaderProps): JSX.Element => {
  return (
    <header className='flex items-center justify-between gap-1.5 border-b px-2 py-2'>
      <div className='flex items-center gap-1.5 p-1'>
        <div className='flex items-center px-1'>
          <Button variant='ghost' size='icon' onClick={onBack} className='size-7'>
            <ChevronLeft className='size-5' />
          </Button>

          <div className='text-sm font-medium text-zinc-600'>서면 생성</div>
        </div>

        <div className='text-sm font-medium text-zinc-800'>/</div>

        <div className='flex items-center gap-2'>
          <span className='text-base font-semibold text-zinc-800'>{title}</span>
          <DocumentStatusBadge status={status} />
        </div>
      </div>

      <div className='ml-auto flex items-center gap-1.5'>
        <Button size='sm' variant='outline' className='h-8 gap-1 rounded-lg bg-white/10 px-3 py-1.5 font-semibold text-zinc-800'>
          <FileClockIcon className='size-4' /> 버전 기록
        </Button>

        <Button
          size='sm'
          variant='outline'
          className={cn('h-8 gap-1 rounded-lg bg-white/10 px-3 py-1.5 font-semibold text-zinc-800')}
          onClick={onToggleMemoPanel}
        >
          <NotepadTextIcon className={cn('size-4')} /> 메모
        </Button>

        {/* 검토요청 */}
        <Button
          size='sm'
          variant='outline'
          className='h-8 gap-1 rounded-lg bg-transparent bg-zinc-800 px-3 py-1.5 font-semibold text-white hover:bg-zinc-800/80 hover:text-white'
        >
          <SendIcon className='size-4' /> 검토요청
        </Button>

        {/* 증거 첨부 */}
        <Button
          size='sm'
          variant='default'
          className='h-8 gap-1 rounded-lg bg-[#69C0FF] px-3 py-1.5 font-semibold text-white hover:bg-[#69C0FF]/80'
        >
          <HighlighterIcon className='size-4' /> 증거 첨부
        </Button>
      </div>

      <Button size='icon' variant='ghost' className='size-8'>
        <BellDotIcon className='size-5 text-zinc-400' />
      </Button>
    </header>
  );
};
