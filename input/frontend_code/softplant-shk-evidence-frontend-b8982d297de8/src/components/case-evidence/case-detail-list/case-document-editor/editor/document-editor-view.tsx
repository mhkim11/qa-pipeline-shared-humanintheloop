import { useCallback, useMemo, useRef, useState } from 'react';

import { EvidenceHighlightList } from '@/components/case-evidence/case-detail-list/case-document-editor/components';
import CaseDocumentEditor, {
  type ICaseDocumentEditorHandle,
} from '@/components/case-evidence/case-detail-list/case-document-editor/editor/case-document-editor';
import {
  DocumentEditorHeader,
  EditorMemoPanel,
  SubmissionInfoPanel,
} from '@/components/case-evidence/case-detail-list/case-document-editor/editor/components';
import { DUMMY_MARKDOWN } from '@/components/case-evidence/case-detail-list/case-document-editor/editor/constants/document-editor-dummy';
import {
  parseRawSections,
  wrapHeaderWithLock,
} from '@/components/case-evidence/case-detail-list/case-document-editor/editor/utils/document-editor-utils';
import {
  type IEvidenceSection,
  TDocumentStatus,
} from '@/components/case-evidence/case-detail-list/case-document-editor/types/case-document-editor.type';
import CustomSpinner from '@/components/common/spiner';
import { cn } from '@/lib/utils';

interface IDocumentEditorViewProps {
  onBack: () => void;
}

/**
 * * 문서 에디터 뷰
 * @param {IDocumentEditorViewProps}
 * @returns {JSX.Element}
 */
export const DocumentEditorView = ({ onBack }: IDocumentEditorViewProps): JSX.Element => {
  // ! Ref
  const editorRef = useRef<ICaseDocumentEditorHandle>(null);

  // ! State
  const [evidenceSections, setEvidenceSections] = useState<IEvidenceSection[]>([]);
  const [isEditorReady, setIsEditorReady] = useState(false);
  const [isOpenMemoToggle, setIsOpenMemoToggle] = useState<boolean>(false);
  const [isOpenSubmissionInfoToggle, setIsOpenSubmissionInfoToggle] = useState<boolean>(false);

  // ! Memo
  /** evidenceSections에서 중복 제거한 flat 목록 (에디터에 전달) */
  const evidenceMap = useMemo(() => {
    const seen = new Set<string>();
    return evidenceSections.flatMap((s) => s.items).filter((item) => (seen.has(item.id) ? false : seen.add(item.id) || true));
  }, [evidenceSections]);

  const documentTitle = useMemo(() => `준비서면 - 3차 재판 001`, []);

  // ! Handler
  /** 에디터 콘텐츠 변경 → 섹션 구조 업데이트 (라벨 자동 부여) */
  const onChangeContent = useCallback((markdown: string) => {
    if (typeof markdown !== 'string') return;

    setEvidenceSections((prev) => {
      const rawSections = parseRawSections(markdown);

      // 구조 변경 여부 체크 (변경 없으면 불필요한 리렌더 방지)
      const isSame =
        rawSections.length === prev.length &&
        rawSections.every(
          (raw, i) =>
            raw.title === prev[i]?.title &&
            raw.ids.length === prev[i]?.items.length &&
            raw.ids.every((id, j) => id === prev[i]?.items[j]?.id),
        );

      if (isSame) return prev;

      // 문서 전체에서 고유 id 등장 순서 → 라벨 자동 생성
      const uniqueIds: string[] = [];
      const seen = new Set<string>();
      rawSections.forEach((s) =>
        s.ids.forEach((id) => {
          if (!seen.has(id)) {
            seen.add(id);
            uniqueIds.push(id);
          }
        }),
      );

      const autoLabelMap = new Map<string, string>();
      uniqueIds.forEach((id, index) => {
        autoLabelMap.set(id, `을 제1호증의 ${index + 1}`);
      });

      // 기존 fileName 보존
      const fileNameMap = new Map<string, string>();
      prev.forEach((s) => s.items.forEach((item) => item.fileName && fileNameMap.set(item.id, item.fileName)));

      return rawSections.map((raw) => ({
        title: raw.title,
        items: raw.ids.map((id) => ({
          id,
          label: autoLabelMap.get(id) ?? id,
          fileName: fileNameMap.get(id),
        })),
      }));
    });
  }, []);

  /** 하이라이트 목록에서 파일명 수정 */
  const onUpdateFileName = useCallback((id: string, newFileName: string) => {
    setEvidenceSections((prev) =>
      prev.map((section) => ({
        ...section,
        items: section.items.map((item) => (item.id === id ? { ...item, fileName: newFileName } : item)),
      })),
    );
  }, []);

  /**
   * * 메모 패널 열기
   * @returns {void}
   */
  const onToggleMemoPanel = useCallback(() => {
    setIsOpenMemoToggle((prev) => !prev);
  }, []);

  return (
    <div className='grid h-full w-full grid-rows-[auto_1fr] bg-[#E3EAF2]'>
      {/* 로딩 오버레이 */}
      {!isEditorReady && (
        <div className='absolute inset-0 z-50 flex items-center justify-center bg-[#E3EAF2]'>
          <CustomSpinner />
        </div>
      )}

      {/* Header */}
      <DocumentEditorHeader
        onBack={onBack}
        status={TDocumentStatus.WRITING}
        title={documentTitle}
        onToggleMemoPanel={onToggleMemoPanel}
        isOpenMemoPanel={isOpenMemoToggle}
      />

      {/* Content */}
      <div
        className={cn(
          'grid grid-cols-[1fr_auto] gap-4 px-4',
          isOpenMemoToggle || isOpenSubmissionInfoToggle ? 'grid-cols-[1fr_auto]' : 'grid-cols-[1fr]',
        )}
      >
        <div className='relative min-h-0 flex-1'>
          {/* Evidence Highlight List */}
          <div className='absolute left-5 top-28 z-10'>
            <EvidenceHighlightList sections={evidenceSections} onUpdateFileName={onUpdateFileName} />
          </div>

          <CaseDocumentEditor
            ref={editorRef}
            initialMarkdown={wrapHeaderWithLock(DUMMY_MARKDOWN)}
            evidenceMap={evidenceMap}
            onContentChange={onChangeContent}
            onReady={() => setIsEditorReady(true)}
            onClickEditArea={() => {
              // TODO: 서명 정보 편집 모달 열기
              console.log('서명 영역 클릭');
              setIsOpenSubmissionInfoToggle(true);
            }}
          />
        </div>

        {/* 메모 패널 */}
        <EditorMemoPanel onClose={() => setIsOpenMemoToggle(false)} isOpen={isOpenMemoToggle} />

        {/* 제출 정보 표시 패널 */}
        <SubmissionInfoPanel isOpen={isOpenSubmissionInfoToggle} onClose={() => setIsOpenSubmissionInfoToggle(false)} />
      </div>
    </div>
  );
};
