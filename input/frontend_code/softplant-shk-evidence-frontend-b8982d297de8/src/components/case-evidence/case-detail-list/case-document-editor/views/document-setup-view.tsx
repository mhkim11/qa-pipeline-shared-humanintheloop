import { useCallback, useState } from 'react';

import { AvatarIcon } from '@radix-ui/react-icons';
import { Check, ChevronDown, ChevronLeft, ChevronRight, FileCheck, Plus, Search } from 'lucide-react';

import {
  DocumentStatusBadge,
  TDocumentEditorView,
  TDocumentStatus,
} from '@/components/case-evidence/case-detail-list/case-document-editor';
import { Button, Checkbox, Input } from '@/components/ui';
import { cn } from '@/lib/utils';

interface IDocumentSetupViewProps {
  onNavigate: (view: TDocumentEditorView) => void;
}

/**
 * * 서면 설정 뷰 (제목, 가이드, 하이라이트 선택)
 * @param {IDocumentSetupViewProps} props - 서면 설정 뷰 속성
 * @returns JSX.Element
 */
export const DocumentSetupView = ({ onNavigate }: IDocumentSetupViewProps): JSX.Element => {
  // ! State
  const [selectedHighlightIds, setSelectedHighlightIds] = useState<number[]>([]);
  const [activeFilter, setActiveFilter] = useState('사용 여부');

  // ! Handler
  /**
   * * 뒤로가기 버튼 클릭 핸들러
   */
  const onClickBack = useCallback(() => {
    onNavigate('list');
  }, [onNavigate]);

  /**
   * * 다음 버튼 클릭 핸들러
   */
  const onClickNext = useCallback(() => {
    onNavigate('toc');
  }, [onNavigate]);

  return (
    <div className='h-full w-full'>
      {/* Header */}
      <header className='flex w-full items-center justify-between gap-2 border-b p-2'>
        <div className='flex items-center'>
          <Button variant='ghost' size='icon' onClick={onClickBack} className='size-8 rounded-xl'>
            <ChevronLeft className='size-5' />
          </Button>

          <div className='mr-2 text-sm font-medium text-zinc-800'>
            <span className='font-medium'>서면 목록</span>
            <span className='mx-1'>/</span>
            <span className='font-semibold'>서면 생성</span>
          </div>

          <DocumentStatusBadge status={TDocumentStatus.PREPARING} />
        </div>

        <div className='flex items-center gap-2'>
          <Button
            size='sm'
            onClick={onClickNext}
            className='h-8 gap-1 rounded-lg bg-sky-400 px-4 font-semibold text-white hover:bg-sky-500'
          >
            <span>목차 생성하기</span>
            <ChevronRight className='size-4' />
          </Button>
        </div>
      </header>

      {/* Content */}
      <div className='grid grid-cols-[minmax(0,23rem)_2fr] gap-10 px-10'>
        {/* 제목, 서면 작성 가이드 */}
        <div className='w-full py-5'>
          <div className='mb-6'>
            <h3 className='mb-1 text-sm font-semibold text-primary'>제목</h3>
            <Input placeholder='제목을 입력해주세요.' className='w-full rounded-lg shadow-md' />
          </div>

          <div className='flex flex-col gap-1'>
            <h3 className='text-sm font-semibold text-primary'>서면 작성 가이드</h3>

            <p className='text-xs text-zinc-400'>
              필요한 경우 AI가 서면 초안을 생성할 때 활용할 서면의 방향성과 참고할 내용을 작성해주세요.
            </p>

            <Button className='flex h-9 w-full items-center justify-center gap-1 border border-zinc-200 bg-zinc-100 text-sm font-semibold text-zinc-500 hover:bg-zinc-100'>
              <Plus className='size-4' />
              <span>가이드 추가</span>
            </Button>
          </div>
        </div>

        {/* 하이라이트 선택 */}
        <div className='py-5'>
          <div className='flex items-center justify-between'>
            <h3 className='text-base font-semibold text-primary'>하이라이트 선택</h3>
            <Button className='flex h-8 items-center justify-center gap-1 rounded-lg border border-zinc-200 bg-zinc-100 text-sm font-semibold text-zinc-900 shadow-sm hover:bg-zinc-100'>
              선택된 하이라이트 {selectedHighlightIds.length}개
            </Button>
          </div>

          <div className='flex items-center justify-between gap-2 py-4'>
            <div className='flex w-fit rounded-lg border border-zinc-200'>
              {['사용 여부', '생성일 기준', '태그 기준', '사용자 기준', '문서 기준'].map((filter) => (
                <button
                  key={filter}
                  onClick={() => setActiveFilter(filter)}
                  className={cn(
                    'px-3 py-1.5 text-sm font-medium transition-colors first:rounded-l-lg last:rounded-r-lg',
                    activeFilter === filter ? 'bg-zinc-100 text-zinc-900' : 'bg-white text-zinc-500 hover:bg-zinc-100',
                  )}
                >
                  {filter}
                </button>
              ))}
            </div>

            <div className='relative'>
              <Search className='absolute left-2.5 top-1/2 size-5 -translate-y-1/2 text-zinc-600' />
              <Input placeholder='검색' className='h-8 w-60 rounded-lg border-zinc-100 pl-9 shadow-sm outline-none' />
            </div>
          </div>

          <div className='grid grid-cols-[auto_1fr] items-start justify-between gap-6'>
            <div className='max-w-40'>
              <ul className='flex flex-col items-start gap-1'>
                <li className='cursor-pointer px-2 py-1 text-sm font-medium text-zinc-400 hover:text-zinc-500'>미사용 하이라이트</li>
                <li className='max-w-36 cursor-pointer truncate px-2 py-1 text-sm font-medium text-zinc-400 hover:text-zinc-500'>
                  다른 서면에서 사용된 하이라이트
                </li>
              </ul>
            </div>

            <div>
              <div className='mb-3 flex items-center gap-1'>
                <ChevronDown className='size-5' />
                <span className='text-sm font-semibold text-zinc-800'>미사용 하이라이트</span>
              </div>

              <ul className='flex flex-col items-start gap-2'>
                {Array.from({ length: 10 }).map((_, index) => (
                  <li key={index} className='grid w-full grid-cols-[auto_1fr] items-start gap-2'>
                    <Checkbox
                      className='size-4 rounded-sm border-zinc-300 shadow-sm data-[state=checked]:border-zinc-900 data-[state=checked]:bg-zinc-900 data-[state=checked]:text-zinc-900'
                      onClick={() =>
                        setSelectedHighlightIds((prev) => (prev.includes(index) ? prev.filter((id) => id !== index) : [...prev, index]))
                      }
                    />

                    <div className='w-full rounded-lg border border-zinc-200 p-2'>
                      <div className='mb-1 text-xs font-medium text-zinc-500'>소장 - 2페이지</div>

                      <div className='rounded-md border border-zinc-200 bg-zinc-50 p-2 text-xs font-medium text-zinc-500'>
                        피고는 원고에게 금 50,000,000원 및 이에 대한 2025. 1. 1.부터 다 갚는 날까지 연 12%의 비율에 의한 금원을 지급하라.
                      </div>

                      <div className='mt-2'>
                        <div className='flex items-center gap-1 text-zinc-500'>
                          <AvatarIcon className='size-5' />
                          <span className='text-xs font-medium'>2일전</span>
                        </div>

                        <div className='mt-1 text-sm text-zinc-900'>이율이 과하게 높음. 그리고 피고는 일부 갚았다고 주장함.</div>
                      </div>

                      <div className='mt-2'>
                        <div className='flex items-center gap-1 text-zinc-500'>
                          <AvatarIcon className='size-5' />
                          <span className='text-xs font-medium'>답글 1개 더 보기</span>
                        </div>

                        <div className='mt-2 flex gap-2'>
                          <Button variant='ghost' className='h-6 gap-1 rounded-xl bg-blue-50 px-2 text-blue-500 hover:bg-blue-100'>
                            <FileCheck className='size-3' />
                            <span className='text-xs font-medium'>서면 활용 가능</span>
                          </Button>

                          <Button variant='ghost' className='h-6 gap-1 rounded-xl bg-zinc-100 px-2 text-zinc-900 hover:bg-zinc-100'>
                            <Check className='size-3' />
                            <span className='text-xs font-medium'>서면 활용 가능</span>
                          </Button>
                        </div>
                      </div>
                    </div>
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
