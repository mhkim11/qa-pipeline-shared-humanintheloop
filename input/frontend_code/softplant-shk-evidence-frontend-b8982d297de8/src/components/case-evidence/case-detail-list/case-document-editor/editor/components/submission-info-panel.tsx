import { X } from 'lucide-react';

import { Button, Input } from '@/components/ui';
import { cn } from '@/lib/utils';

interface ISubmissionInfoPanelProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function SubmissionInfoPanel({ isOpen, onClose }: ISubmissionInfoPanelProps): JSX.Element {
  return (
    <div className={cn('mb-4 mt-11 grid w-72 grid-rows-[auto_1fr] gap-4 rounded-xl bg-white p-4', isOpen ? 'grid' : 'hidden')}>
      <header className='flex items-center justify-between'>
        <h2 className='text-lg font-semibold text-zinc-900'>제출 정보 표시</h2>
        <Button size='icon' variant='ghost' className='size-8' onClick={onClose}>
          <X className='size-5 text-zinc-400' />
        </Button>
      </header>

      <div className='flex flex-1 flex-col gap-5'>
        <div className='flex flex-col gap-1'>
          <label className='text-sm font-semibold text-zinc-900'>제출일</label>
          <Input type='date' className='w-full rounded-md p-2' />
        </div>

        <div className='flex flex-col gap-1'>
          <label className='text-sm font-semibold text-zinc-900'>의뢰인</label>
          <Input type='text' className='w-full rounded-md p-2' readOnly value='홍길동' />
        </div>

        <div className='flex flex-col gap-1'>
          <label className='text-sm font-semibold text-zinc-900'>담당변호사</label>
          <Input type='text' className='w-full rounded-md p-2' value='홍길동' />
        </div>

        <div className='flex flex-col gap-1'>
          <label className='text-sm font-semibold text-zinc-900'>법원</label>
          <Input type='text' className='w-full rounded-md p-2' readOnly value='서울지방법원' />
        </div>
      </div>
    </div>
  );
}
