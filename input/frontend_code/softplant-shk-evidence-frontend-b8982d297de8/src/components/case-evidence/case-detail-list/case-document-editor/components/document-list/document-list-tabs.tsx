import { useCallback } from 'react';

import { cn } from '@nextui-org/theme';

import { TDocumentEditorTableTab } from '@/components/case-evidence/case-detail-list/case-document-editor';

interface IDocumentListTabsProps {
  activeTab: TDocumentEditorTableTab;
  onChangeTab: (tab: TDocumentEditorTableTab) => void;
}

/**
 * * 문서 목록 탭 컴포넌트
 * @param {IDocumentListTabsProps} props - 문서 목록 탭 컴포넌트 속성
 * @returns JSX.Element
 */
export const DocumentListTabs = ({ activeTab, onChangeTab }: IDocumentListTabsProps): JSX.Element => {
  const onClickTab = useCallback(
    (tab: TDocumentEditorTableTab) => {
      onChangeTab(tab);
    },
    [onChangeTab],
  );

  return (
    <dl className='flex items-center rounded-xl bg-zinc-200 p-1'>
      {Object.values(TDocumentEditorTableTab).map((tab) => (
        <dd
          key={tab}
          className={cn(
            'cursor-pointer rounded-lg px-2 py-1 text-sm font-semibold text-primary',
            activeTab === tab && 'bg-white text-zinc-800 shadow-sm',
          )}
          onClick={() => onClickTab(tab)}
        >
          {tab}
        </dd>
      ))}
    </dl>
  );
};
