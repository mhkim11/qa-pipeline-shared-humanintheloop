import { Pencil, X } from 'lucide-react';

import { Button } from '@/components/ui';

interface IDocumentDetailPanelProps {
  onClose: () => void;
}

/**
 * * 문서 상세 패널 컴포넌트
 * @param {IDocumentDetailPanelProps} props - 문서 상세 패널 속성
 * @returns JSX.Element
 */
export const DocumentDetailPanel = ({ onClose }: IDocumentDetailPanelProps): JSX.Element => {
  return (
    <div className='flex h-full flex-col border-l border-gray-200 bg-white'>
      {/* Header */}
      <header className='flex items-center justify-between border-b border-gray-200 py-2 pl-3'>
        <h2 className='flex-1 text-sm font-medium text-gray-900'>미리보기</h2>

        <Button variant='outline' size='sm' className='h-8 gap-1.5 rounded-lg text-gray-900'>
          <Pencil className='size-4' />
          <span className='text-sm font-semibold'>편집하기</span>
        </Button>

        <Button variant='ghost' size='icon' onClick={onClose} className='h-8'>
          <X className='size-4' />
        </Button>
      </header>

      {/* Content */}
      <div className='flex-1 overflow-auto bg-gray-100 p-4'></div>
    </div>
  );
};
