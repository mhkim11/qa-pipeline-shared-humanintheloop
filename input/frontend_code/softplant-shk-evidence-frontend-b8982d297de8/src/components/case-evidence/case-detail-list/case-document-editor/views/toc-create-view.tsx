import { useCallback, useState } from 'react';

import { ChevronLeft, SparkleIcon, Undo2, X } from 'lucide-react';

import {
  DocumentStatusBadge,
  TDocumentEditorView,
  TDocumentStatus,
} from '@/components/case-evidence/case-detail-list/case-document-editor';
import { Button, Textarea } from '@/components/ui';

interface ITocCreateViewProps {
  onNavigate: (view: TDocumentEditorView) => void;
}

/**
 * * 목차 생성 뷰 (제목, 가이드, 하이라이트 선택)
 * @param {ITocCreateViewProps} props - 목차 생성 뷰 속성
 * @returns JSX.Element
 */
export const TocCreateView = ({ onNavigate }: ITocCreateViewProps): JSX.Element => {
  const [isConfirmModalOpen, setIsConfirmModalOpen] = useState(false);

  // ! Handler
  /**
   * * 생성 준비로 돌아가기 버튼 클릭 핸들러
   * @returns void
   */
  const onClickBackSetup = useCallback(() => {
    setIsConfirmModalOpen(true);
  }, []);

  return (
    <>
      <div className='h-full w-full'>
        {/* Header */}
        <header className='flex w-full items-center justify-between gap-2 border-b p-2'>
          <div className='flex items-center'>
            <Button variant='ghost' size='icon' onClick={() => onNavigate('list')} className='size-8 rounded-xl'>
              <ChevronLeft className='size-5' />
            </Button>

            <div className='mr-2 text-sm font-medium text-zinc-800'>
              <span className='font-medium'>서면 목록</span>
              <span className='mx-1'>/</span>
              <span className='font-semibold'>서면 생성</span>
            </div>

            <DocumentStatusBadge status={TDocumentStatus.TOC_PREPARING} />
          </div>

          <div className='flex items-center gap-2'>
            <Button
              size='sm'
              onClick={onClickBackSetup}
              className='font-sm h-8 gap-1 rounded-lg bg-zinc-100 px-3 font-semibold text-zinc-900 hover:bg-zinc-100'
            >
              <Undo2 className='size-4' />
              <span>생성 준비로 돌아가기</span>
            </Button>

            <Button
              size='sm'
              onClick={() => {
                onNavigate('list');
              }}
              className='h-8 gap-1 rounded-lg bg-sky-400 px-3 font-semibold text-white hover:bg-sky-500'
            >
              <SparkleIcon className='size-4' />
              <span>서면 생성하기</span>
            </Button>
          </div>
        </header>

        {/* Content */}
        <div className='mx-auto max-w-xl py-4'>
          <div className='mb-6'>
            <h2 className='mb-1 text-xl font-bold'>서면 목차</h2>
            <p className='text-xs text-zinc-500'>AI가 서면 초안을 생성할 때 활용할 서면의 방향성과 참고할 내용을 작성해주세요.</p>
          </div>

          {/* 에디터 영역 */}
          <div className='w-full'>
            <Textarea value='목차 생성중...' disabled className='block h-[100vh] w-full border-zinc-200 disabled:bg-zinc-100' />
          </div>
        </div>
      </div>

      {/* ---- 컨펌 모달 --- */}
      {isConfirmModalOpen && (
        <div className='fixed inset-0 z-[10000] flex items-center justify-center'>
          <div className='absolute inset-0 h-auto bg-gray-500 opacity-75' />
          <div className='z-10 max-w-sm rounded-2xl bg-white shadow-lg'>
            <div className='flex items-center justify-between p-4'>
              <h3 className='text-lg font-semibold text-zinc-900'>생성 준비 단계로 돌아가기</h3>
              <button className='rounded-full p-1 text-zinc-900 hover:bg-zinc-100' onClick={() => setIsConfirmModalOpen(false)}>
                <X className='size-5' />
              </button>
            </div>

            <p className='px-5 py-2 text-sm text-zinc-600'>
              지금까지 생성 및 수정된 <b>목차는 삭제</b>됩니다. 이 행동은 돌이킬 수 없습니다. 그래도 진행하시겠습니까?
            </p>

            <div className='flex justify-end gap-2 p-4'>
              <button className='h-9 w-fit rounded-lg border border-zinc-200 bg-zinc-50 px-4 text-sm text-zinc-900 hover:bg-zinc-100'>
                취소
              </button>

              <button
                className='h-9 w-fit rounded-lg border border-sky-400 bg-sky-400 px-4 text-sm text-white hover:bg-sky-500'
                onClick={() => {
                  onNavigate('setup');
                }}
              >
                목차 제거하고 돌아가기
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
};
