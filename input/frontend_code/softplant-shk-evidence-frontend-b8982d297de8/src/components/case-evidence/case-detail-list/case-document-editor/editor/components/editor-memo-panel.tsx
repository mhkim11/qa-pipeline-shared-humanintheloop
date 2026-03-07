import { useState } from 'react';

import { X } from 'lucide-react';

import { Button } from '@/components/ui';
import { cn } from '@/lib/utils';

const formatRelativeTime = (iso?: string | null) => {
  if (!iso) return '';
  const t = new Date(iso).getTime();
  if (!Number.isFinite(t)) return '';
  const diff = Date.now() - t;
  if (diff < 0) return '방금 전';
  const sec = Math.floor(diff / 1000);
  if (sec < 60) return '방금 전';
  const min = Math.floor(sec / 60);
  if (min < 60) return `${min}분 전`;
  const hr = Math.floor(min / 60);
  if (hr < 24) return `${hr}시간 전`;
  const day = Math.floor(hr / 24);
  return `${day}일 전`;
};

type TMemoItem = {
  id: string;
  content: string;
  createdAt: string;
  user: {
    user_id: string;
    name: string;
    thumbnail: string;
    user_color?: string;
  };
};

const MemoItem = ({ content, createdAt, user }: TMemoItem) => {
  return (
    <div className='flex flex-col gap-2 p-1'>
      <div className='flex items-center gap-2'>
        <div className='flex size-6 shrink-0 items-center justify-center rounded-full bg-zinc-300 text-xs'>아</div>
        <span className='text-sm font-semibold text-zinc-900'>{user.name}</span>
        <span className='text-xs text-zinc-400'>{formatRelativeTime(createdAt)}</span>
      </div>

      <div className='rounded-lg'>
        <p className='text-[13px] leading-relaxed text-zinc-700'>{content}</p>
      </div>
    </div>
  );
};

interface IEditorMemoPanelProps {
  onClose: () => void;
  isOpen: boolean;
}

/**
 * * 메모 패널 컴포넌트
 * @returns {JSX.Element}
 */
export default function EditorMemoPanel({ onClose, isOpen }: IEditorMemoPanelProps): JSX.Element {
  const [memos] = useState<TMemoItem[]>([
    {
      id: '1',
      content: '2번 부분 000 라고 써있길래 00000 하고 고쳤습니다. 대신 000 하면 좋을것 같아요!',
      createdAt: '2026-02-23T10:00:00.000Z',
      user: {
        user_id: '1',
        name: '홍길동',
        thumbnail: 'https://via.placeholder.com/150',
        user_color: '#000000',
      },
    },
    {
      id: '2',
      content: '2번 부분 000 라고 써있길래 00000 하고 고쳤습니다. 대신 000 하면 좋을것 같아요!',
      createdAt: '2026-02-23T10:00:00.000Z',
      user: {
        user_id: '2',
        name: '김길동',
        thumbnail: 'https://via.placeholder.com/150',
        user_color: '#000000',
      },
    },
  ]);

  return (
    <div className={cn('mb-4 mt-11 grid w-72 grid-rows-[auto_1fr_auto] gap-1 rounded-xl bg-[#F4F4F5] p-2', isOpen ? 'grid' : 'hidden')}>
      <header className='flex items-center justify-between'>
        <h2 className='text-lg font-semibold text-zinc-900'>메모</h2>
        <Button size='icon' variant='ghost' className='size-8' onClick={onClose}>
          <X className='size-5 text-zinc-400' />
        </Button>
      </header>

      <div className='flex flex-1 flex-col gap-3 overflow-auto p-1.5'>
        {memos.map((memo) => (
          <MemoItem key={memo.id} {...memo} />
        ))}
      </div>

      <footer className='grid h-[88px] grid-cols-[1fr_auto] gap-1 rounded-xl border border-zinc-200 bg-white p-3'>
        <textarea
          className='w-full resize-none border-none p-0 text-[13px] leading-tight outline-none ring-0 focus:ring-0 focus:ring-offset-0'
          placeholder='메모를 입력해주세요.'
        />

        <Button size='sm' variant='default' className='h-8 w-fit gap-1 self-end rounded-lg bg-[#69C0FF] px-3 py-1.5'>
          저장
        </Button>
      </footer>
    </div>
  );
}
