import { useCallback, useState } from 'react';

import { useNavigate, useSearchParams } from 'react-router-dom';

import {
  DocumentSetupView,
  DocumentListView,
  TDocumentEditorView,
  TocCreateView,
} from '@/components/case-evidence/case-detail-list/case-document-editor';
import { cn } from '@/lib/utils';

/**
 * * 문서 작성 래퍼 (문서작성 화면)
 * @returns JSX.Element
 */
export const CaseDocumentEditorWrapper = (): JSX.Element => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const [currentView, setCurrentView] = useState<TDocumentEditorView>('list');

  /**
   * * 뷰 전환 핸들러
   */
  const onNavigate = useCallback(
    (view: TDocumentEditorView) => {
      if (view === 'editor') {
        const preserved = new URLSearchParams();
        for (const key of ['civil_case_id', 'project_id', 'project_name', 'client_name'] as const) {
          const value = searchParams.get(key);
          if (value) preserved.set(key, value);
        }
        const qs = preserved.toString();
        navigate(`/case-list/editor${qs ? `?${qs}` : ''}`);
        return;
      }
      setCurrentView(view);
    },
    [navigate, searchParams],
  );

  /**
   * * 현재 뷰 렌더링
   */
  const renderView = () => {
    switch (currentView) {
      case 'list':
        return <DocumentListView onNavigate={onNavigate} />;
      case 'setup':
        return <DocumentSetupView onNavigate={onNavigate} />;
      case 'toc':
        return <TocCreateView onNavigate={onNavigate} />;
      default:
        return <DocumentListView onNavigate={onNavigate} />;
    }
  };

  return (
    <div className='flex h-full w-full flex-col bg-[#f4f4f5] pb-[10px] pr-[10px] pt-[50px]'>
      <div
        className={cn(
          'flex min-h-0 w-full flex-1 items-center justify-center overflow-auto rounded-[16px] border border-[#D4D4D8] bg-white',
        )}
      >
        {renderView()}
      </div>
    </div>
  );
};
