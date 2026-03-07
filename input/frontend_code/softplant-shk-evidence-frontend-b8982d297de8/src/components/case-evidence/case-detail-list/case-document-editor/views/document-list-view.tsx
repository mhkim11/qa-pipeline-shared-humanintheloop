import { useCallback, useMemo, useState } from 'react';

import {
  DocumentDetailPanel,
  DocumentListActions,
  DocumentListItem,
  DocumentListTabs,
} from '@/components/case-evidence/case-detail-list/case-document-editor/components';
import {
  IDocumentDetail,
  TDocumentEditorTableTab,
  TDocumentEditorView,
  TDocumentStatus,
} from '@/components/case-evidence/case-detail-list/case-document-editor/types/case-document-editor.type';
import { cn } from '@/lib/utils';

// 임시 문서 목록 데이터
const MOCK_DOCUMENTS: IDocumentDetail[] = [
  {
    id: 0,
    title: '준비서면 - 1차 재판 서면 1',
    status: TDocumentStatus.PREPARING,
    mod_dt: '2026.01.30',
    reg_dt: '2026.01.30',
    authorName: '이희애',
    authorAvatar: 'https://github.com/shadcn.png',
    editCount: 3,
    attachmentCount: 2,
    selectedHighlightCount: 1,
  },
  {
    id: 1,
    title: '준비서면 - 1차 재판 서면 2',
    status: TDocumentStatus.TOC_PREPARING,
    mod_dt: '2026.01.30',
    reg_dt: '2026.01.30',
    authorName: '이희애',
    authorAvatar: 'https://github.com/shadcn.png',
    editCount: 0,
    attachmentCount: 0,
    selectedHighlightCount: 0,
  },
  {
    id: 2,
    title: '준비서면 - 1차 재판 서면 3',
    status: TDocumentStatus.CREATING,
    mod_dt: '2026.01.30',
    reg_dt: '2026.01.30',
    authorName: '이희애',
    authorAvatar: 'https://github.com/shadcn.png',
    editCount: 0,
    attachmentCount: 1,
    selectedHighlightCount: 0,
  },
  {
    id: 3,
    title: '준비서면 - 1차 재판 서면 4',
    status: TDocumentStatus.WRITING,
    mod_dt: '2026.01.30',
    reg_dt: '2026.01.30',
    authorName: '이희애',
    authorAvatar: 'https://github.com/shadcn.png',
    editCount: 1,
    attachmentCount: 3,
    selectedHighlightCount: 2,
  },
  {
    id: 4,
    title: '준비서면 - 1차 재판 서면 5',
    status: TDocumentStatus.SUBMITTED,
    mod_dt: '2026.01.30',
    reg_dt: '2026.01.30',
    authorName: '이희애',
    authorAvatar: 'https://github.com/shadcn.png',
    editCount: 2,
    attachmentCount: 0,
    selectedHighlightCount: 0,
  },
  {
    id: 5,
    title: '준비서면 - 1차 재판 서면 6',
    status: TDocumentStatus.COMPLETED,
    mod_dt: '2026.01.30',
    reg_dt: '2026.01.30',
    authorName: '이희애',
    authorAvatar: 'https://github.com/shadcn.png',
    editCount: 3,
    attachmentCount: 5,
    selectedHighlightCount: 3,
  },
];

interface IDocumentListViewProps {
  onNavigate: (view: TDocumentEditorView) => void;
}

/**
 * * 문서 목록 뷰
 * @param {IDocumentListViewProps} props - 문서 목록 뷰 속성
 * @returns JSX.Element
 */
export const DocumentListView = ({ onNavigate }: IDocumentListViewProps): JSX.Element => {
  // ! State
  const [activeTab, setActiveTab] = useState<TDocumentEditorTableTab>(TDocumentEditorTableTab.ALL);
  const [selectedDocument, setSelectedDocument] = useState<IDocumentDetail | null>(null);
  const [searchKeyword, setSearchKeyword] = useState<string>('');

  // ! Memo
  const hasSelection = useMemo(() => !!selectedDocument, [selectedDocument]);

  // ! Handler
  /**
   * * 탭 변경 핸들러
   */
  const onChangeTab = useCallback((tab: TDocumentEditorTableTab) => {
    setActiveTab(tab);
  }, []);

  /**
   * * 문서 작성 버튼 클릭 핸들러
   */
  const onClickWriteDocument = useCallback(() => {
    onNavigate('setup');
  }, [onNavigate]);

  /**
   * * 상세 패널 닫기 핸들러
   */
  const onCloseDetailPanel = useCallback(() => {
    setSelectedDocument(null);
  }, []);

  return (
    <div className='flex h-full w-full'>
      {/* Document List Section */}
      <div className={cn('flex h-full flex-col', selectedDocument ? 'w-1/3' : 'w-full')}>
        {/* Header */}
        <header className='flex flex-col gap-3 px-4 pb-2 pt-4'>
          <h1 className='text-xl font-bold text-primary'>서면 작성</h1>

          {/* Table Tools */}
          <div className='flex items-center justify-between gap-2'>
            <DocumentListTabs activeTab={activeTab} onChangeTab={onChangeTab} />

            <DocumentListActions
              searchKeyword={searchKeyword}
              onChangeSearchKeyword={setSearchKeyword}
              onClickWriteDocument={onClickWriteDocument}
            />
          </div>
        </header>

        {/* Document List */}
        <ul
          className={cn('grid grid-cols-1 gap-3 overflow-auto px-4 py-2', {
            'grid-cols-2': hasSelection,
            'grid-cols-1': !hasSelection,
          })}
        >
          {/* List Header */}
          <div className='grid grid-cols-[90px_1fr_130px_130px_130px_130px_130px_50px] gap-x-4 px-4 py-1.5'>
            <div className='text-left text-[13px] font-medium text-zinc-400'>상태</div>
            <div className='text-left text-[13px] font-medium text-zinc-400'>서면 이름</div>
            <div className='text-left text-[13px] font-medium text-zinc-400'>첨부자료</div>
            <div className='text-left text-[13px] font-medium text-zinc-400'>선택된 하이라이트</div>
            <div className='text-left text-[13px] font-medium text-zinc-400'>생성자</div>
            <div className='text-left text-[13px] font-medium text-zinc-400'>생성일</div>
            <div className='text-left text-[13px] font-medium text-zinc-400'>최근 수정일</div>
          </div>

          {/* List Body */}
          {MOCK_DOCUMENTS.map((document, index) => (
            <DocumentListItem
              key={`document-list-item-${index}`}
              title={document.title}
              status={document.status}
              mod_dt={document.mod_dt}
              reg_dt={document.reg_dt}
              authorName={document.authorName}
              authorAvatar={document.authorAvatar}
              editCount={document.editCount}
              attachmentCount={document.attachmentCount}
              selectedHighlightCount={document.selectedHighlightCount}
              isSelected={selectedDocument?.id === document.id}
              hasSelection={hasSelection}
              onClickCard={() => {
                setSelectedDocument(document);
                onNavigate('editor');
              }}
            />
          ))}
        </ul>
      </div>

      {/* Detail Panel Section */}
      {selectedDocument && (
        <div className='h-full w-2/3'>
          <DocumentDetailPanel onClose={onCloseDetailPanel} />
        </div>
      )}
    </div>
  );
};
