import { cn } from '@nextui-org/theme';
import { Loader } from 'lucide-react';

import { TDocumentStatus } from '@/components/case-evidence/case-detail-list/case-document-editor/types/case-document-editor.type';

type TDocumentStatusBadgeProps = {
  status: TDocumentStatus;
};

const commonStyle =
  'rounded-full px-[8px] py-[4px] h-[24px] text-xs font-semibold text-gray-700 flex items-center justify-center gap-1 tracking-tight';

/**
 * * 문서 상태 배지 컴포넌트
 * @param {TDocumentStatusBadgeProps} props - 문서 상태 배지 컴포넌트 속성
 * @returns JSX.Element
 */
export const DocumentStatusBadge = ({ status }: TDocumentStatusBadgeProps): JSX.Element => {
  switch (status) {
    case TDocumentStatus.PREPARING:
      return <div className={cn(commonStyle, 'bg-amber-200 text-primary')}>생성 준비</div>;

    case TDocumentStatus.TOC_PREPARING:
      return <div className={cn(commonStyle, 'bg-orange-200 text-primary')}>목차 작성</div>;

    case TDocumentStatus.CREATING:
      return (
        <div className={cn(commonStyle, 'bg-zinc-300 text-primary')}>
          <Loader className='size-3.5' />
          생성중
        </div>
      );

    case TDocumentStatus.WRITING:
      return <div className={cn(commonStyle, 'bg-blue-300 text-primary')}>작성중</div>;

    case TDocumentStatus.SUBMITTED:
      return <div className={cn(commonStyle, 'bg-zinc-600 text-white')}>제출됨</div>;

    case TDocumentStatus.COMPLETED:
      return <div className={cn(commonStyle, 'bg-zinc-600 text-white')}>완료</div>;

    default:
      return <></>;
  }
};
