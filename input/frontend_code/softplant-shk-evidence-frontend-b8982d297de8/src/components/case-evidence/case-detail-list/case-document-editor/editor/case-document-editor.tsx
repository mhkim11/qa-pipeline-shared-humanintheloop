import { forwardRef, useCallback, useEffect, useImperativeHandle, useRef, useState } from 'react';

import { Editor } from '@tinymce/tinymce-react';
import { debounce } from 'lodash-es';

import { ImageAnnotationModal } from '@/components/case-evidence/case-detail-list/case-document-editor/components/shared';
import { updatePageBreaks } from '@/components/case-evidence/case-detail-list/case-document-editor/editor/utils/page-break-utils';
import { type IEvidenceBadgeItem } from '@/components/case-evidence/case-detail-list/case-document-editor/types/case-document-editor.type';
import { TINY_API_KEY, TINYMCE_INIT } from '@/shared/constants/tiny-editor-constant';
import toolbarStyles from '@/styles/tiny-editor-toolbar.css?raw';

export type { IEvidenceBadgeItem };

export interface ICaseDocumentEditorHandle {
  getContent: () => string;
  getMarkdownContent: () => string;
  insertMarkdown: (markdown: string) => void;
  isReady: () => boolean;
}

interface ICaseDocumentEditorProps {
  initialMarkdown?: string;
  evidenceMap?: IEvidenceBadgeItem[];
  onClickEditArea?: () => void;
  onContentChange?: (markdown: string) => void;
  onAttachEvidence?: () => void;
  onReady?: () => void;
}

/**
 * * @@{id} 패턴을 뱃지 HTML로 변환
 */
const convertBadgesToHtml = (html: string, evidenceMap: IEvidenceBadgeItem[]): string => {
  return html.replace(/@@\{(\w+)\}/g, (_match, id) => {
    const item = evidenceMap.find((e) => e.id === id);
    const label = item?.label ?? id;
    return `<span class="evidence-badge mceNonEditable" data-evidence-id="${id}">${label}</span>`;
  });
};

/**
 * * 뱃지 HTML을 @@{id} 패턴으로 역변환
 */
const convertBadgesToRaw = (html: string): string => {
  return html.replace(
    /<span[^>]*class="[^"]*evidence-badge[^"]*"[^>]*data-evidence-id="(\w+)"[^>]*>[^<]*<\/span>/g,
    (_match, id) => `@@{${id}}`,
  );
};

/**
 * * 마커 → HTML 변환 (@@lock, @@click_edit)
 */
const convertLockedSections = (html: string): string => {
  return html
    .replace(/<p>@@lock_footer_start<\/p>/g, '<div class="mceNonEditable locked-section locked-footer">')
    .replace(/<p>@@lock_start<\/p>/g, '<div class="mceNonEditable locked-section">')
    .replace(/<p>@@click_edit_start<\/p>/g, '<div class="mceNonEditable click-edit-area">')
    .replace(/<p>@@click_edit_end<\/p>/g, '</div>')
    .replace(/<p>@@lock_footer_end<\/p>/g, '</div>')
    .replace(/<p>@@lock_end<\/p>/g, '</div>');
};

/**
 * * HTML → 마커 역변환
 */
const revertLockedSections = (html: string): string => {
  return html
    .replace(
      /<div class="mceNonEditable locked-section locked-footer">([\s\S]*?)<\/div>/g,
      '<p>@@lock_footer_start</p>$1<p>@@lock_footer_end</p>',
    )
    .replace(/<div class="mceNonEditable locked-section">([\s\S]*?)<\/div>/g, '<p>@@lock_start</p>$1<p>@@lock_end</p>')
    .replace(/<div class="mceNonEditable click-edit-area">([\s\S]*?)<\/div>/g, '<p>@@click_edit_start</p>$1<p>@@click_edit_end</p>');
};

const CaseDocumentEditor = forwardRef<ICaseDocumentEditorHandle, ICaseDocumentEditorProps>((props, ref) => {
  const { initialMarkdown = '', evidenceMap = [], onClickEditArea, onContentChange, onAttachEvidence, onReady } = props;

  // ! Ref
  const editorRef = useRef<Editor | null>(null);
  const selectedImageRef = useRef<HTMLImageElement | null>(null);
  const evidenceMapRef = useRef<IEvidenceBadgeItem[]>(evidenceMap);
  evidenceMapRef.current = evidenceMap;
  const onClickEditAreaRef = useRef(onClickEditArea);
  onClickEditAreaRef.current = onClickEditArea;
  const onContentChangeRef = useRef(onContentChange);
  onContentChangeRef.current = onContentChange;
  const onAttachEvidenceRef = useRef(onAttachEvidence);
  onAttachEvidenceRef.current = onAttachEvidence;
  const onReadyRef = useRef(onReady);
  onReadyRef.current = onReady;
  const isUpdatingPagesRef = useRef(false);
  const debouncedUpdatePagesRef = useRef<ReturnType<typeof debounce> | null>(null);

  // ! State
  const [content, setContent] = useState('');
  const [isEditorReady, setIsEditorReady] = useState(false);
  const [isAnnotationModalOpen, setIsAnnotationModalOpen] = useState(false);
  const [editingImageSrc, setEditingImageSrc] = useState('');

  // ! Page Break
  /**
   * * 디바운스된 페이지 스페이서 업데이트
   */
  const triggerPageUpdate = useCallback((editor: any) => {
    if (isUpdatingPagesRef.current) return;
    if (!debouncedUpdatePagesRef.current) {
      debouncedUpdatePagesRef.current = debounce((ed: any) => {
        if (isUpdatingPagesRef.current) return;
        isUpdatingPagesRef.current = true;
        try {
          updatePageBreaks(ed);
        } finally {
          requestAnimationFrame(() => {
            isUpdatingPagesRef.current = false;
          });
        }
      }, 150);
    }
    debouncedUpdatePagesRef.current(editor);
  }, []);

  // ! Event Handler
  /**
   * * 커스텀 이미지 편집 핸들러 - 모달 열기
   */
  const onEditCustomImage = useCallback((editor: any) => {
    const selectedNode = editor.selection.getNode();
    if (selectedNode.nodeName === 'IMG') {
      selectedImageRef.current = selectedNode;
      setEditingImageSrc(selectedNode.src);
      setIsAnnotationModalOpen(true);
    }
  }, []);

  /**
   * * 어노테이션 모달 닫기
   */
  const onCloseAnnotationModal = useCallback(() => {
    setIsAnnotationModalOpen(false);
    setEditingImageSrc('');
    selectedImageRef.current = null;
  }, []);

  /**
   * * 어노테이션 저장 - 에디터의 이미지 교체
   */
  const onSaveAnnotation = useCallback(
    (dataUrl: string) => {
      if (selectedImageRef.current) {
        selectedImageRef.current.src = dataUrl;
      }
      onCloseAnnotationModal();
    },
    [onCloseAnnotationModal],
  );

  /**
   * * TinyMCE setup 함수 - 커스텀 버튼 등록
   */
  const editorSetup = useCallback(
    (editor: any) => {
      // 커스텀 이미지 편집 버튼 등록
      editor.ui.registry.addButton('customImageEdit', {
        icon: 'pencil',
        tooltip: '커스텀 이미지 편집',
        onAction: () => onEditCustomImage(editor),
      });

      // 줌 컨트롤 (에디터 iframe 확대/축소)
      const ZOOM_LEVELS = [50, 75, 100, 125, 150, 200];
      editor.ui.registry.addMenuButton('zoomControl', {
        text: '100%',
        tooltip: '화면 확대/축소',
        fetch: (callback: any) => {
          const items = ZOOM_LEVELS.map((level) => ({
            type: 'menuitem' as const,
            text: `${level}%`,
            onAction: () => {
              const body = editor.getBody();
              if (body) {
                body.style.transformOrigin = 'top left';
                body.style.transform = `scale(${level / 100})`;
                body.style.width = `${10000 / level}%`;
              }
              editor.fire('ZoomChange', { level });
            },
          }));
          callback(items);
        },
        onSetup: (api: any) => {
          const handler = (e: any) => api.setText(`${e.level}%`);
          editor.on('ZoomChange', handler);
          return () => editor.off('ZoomChange', handler);
        },
      });

      // 증거첨부 버튼
      editor.ui.registry.addButton('attachEvidence', {
        icon: 'edit-block',
        text: '증거첨부',
        tooltip: '증거 자료 첨부',
        onAction: () => onAttachEvidenceRef.current?.(),
      });

      // @@{id} → 뱃지, @@lock → div 변환 (콘텐츠 삽입 시)
      editor.on('BeforeSetContent', (e: any) => {
        if (e.content) {
          e.content = convertBadgesToHtml(e.content, evidenceMapRef.current);
          e.content = convertLockedSections(e.content);
        }
      });

      // 뱃지 → @@{id}, div → @@lock 역변환 (콘텐츠 추출 시)
      editor.on('GetContent', (e: any) => {
        if (e.content) {
          e.content = revertLockedSections(e.content);
          e.content = convertBadgesToRaw(e.content);
        }
      });

      // 클릭 편집 영역 클릭 이벤트
      editor.on('click', (e: any) => {
        const clickEditArea = e.target.closest('.click-edit-area');
        if (clickEditArea) {
          onClickEditAreaRef.current?.();
        }
      });

      // ! 페이지 스페이서 이벤트 연결
      editor.on('init', () => {
        // TinyMCE Cloud CSS 로드 후 커스텀 툴바 스타일 주입
        const styleEl = document.createElement('style');
        styleEl.setAttribute('data-tiny-toolbar-override', '');
        styleEl.textContent = toolbarStyles;
        document.head.appendChild(styleEl);

        setTimeout(() => triggerPageUpdate(editor), 300);

        // 이미지 로드 시 페이지 재계산
        const body = editor.getBody();
        if (body) {
          body.addEventListener(
            'load',
            (e: Event) => {
              if ((e.target as HTMLElement)?.tagName === 'IMG') {
                triggerPageUpdate(editor);
              }
            },
            true,
          );
        }
      });
      editor.on('input', () => triggerPageUpdate(editor));
      editor.on('Change', () => triggerPageUpdate(editor));
      editor.on('Undo', () => triggerPageUpdate(editor));
      editor.on('Redo', () => triggerPageUpdate(editor));
      editor.on('SetContent', () => {
        setTimeout(() => triggerPageUpdate(editor), 50);
      });
      editor.on('ObjectResized', () => triggerPageUpdate(editor));
    },
    [onEditCustomImage, triggerPageUpdate],
  );

  /**
   * * init 이벤트 핸들러
   */
  const onInit = useCallback(
    (_evt: any, editor: Editor) => {
      editorRef.current = editor;
      if (initialMarkdown) {
        (editor as any).execCommand('MarkdownInsert', false, initialMarkdown);
        // GetContent 이벤트를 거쳐 @@{id} 보존된 HTML 전달
        const htmlContent = (editor as any).getContent();
        if (htmlContent) onContentChangeRef.current?.(htmlContent);
      }
      setIsEditorReady(true);
      onReadyRef.current?.();
    },
    [initialMarkdown],
  );

  /**
   * * TinyMCE 에디터 인스턴스 가져오기
   */
  const getEditor = useCallback(() => {
    if (!editorRef.current) return null;
    return editorRef.current as any;
  }, []);

  /**
   * * 에디터 내용 가져오기 (HTML)
   */
  const getEditorContent = useCallback(() => {
    return getEditor()?.getContent() || '';
  }, [getEditor]);

  /**
   * * 에디터 내용 가져오기 (Markdown)
   */
  const getMarkdownContent = useCallback(() => {
    return getEditor()?.plugins?.markdown?.getContent() || '';
  }, [getEditor]);

  /**
   * * 마크다운을 HTML로 변환하여 에디터에 삽입
   */
  const insertMarkdown = useCallback(
    (markdown: string) => {
      getEditor()?.execCommand('MarkdownInsert', false, markdown);
    },
    [getEditor],
  );

  // ! Effect - evidenceMap 변경 시 에디터 내부 뱃지 라벨 동기화
  // getContent() → @@{id} 마커 → setContent() → BeforeSetContent에서 evidenceMapRef.current 참조 → 최신 라벨 반영
  useEffect(() => {
    const editor = getEditor();
    if (!editor || !isEditorReady) return;

    const bookmark = editor.selection.getBookmark(2);
    editor.setContent(editor.getContent());
    try {
      editor.selection.moveToBookmark(bookmark);
    } catch {
      /* 커서 복원 실패 무시 */
    }
  }, [evidenceMap, getEditor, isEditorReady]);

  // ! Effect - 디바운스 cleanup
  useEffect(() => {
    return () => {
      debouncedUpdatePagesRef.current?.cancel();
    };
  }, []);

  // ! Imperative Handle - 부모 컴포넌트에 에디터 메서드 노출
  useImperativeHandle(
    ref,
    () => ({
      getContent: getEditorContent,
      getMarkdownContent,
      insertMarkdown,
      isReady: () => isEditorReady,
    }),
    [getEditorContent, getMarkdownContent, insertMarkdown, isEditorReady],
  );

  return (
    <div className='flex h-full w-full flex-col'>
      {/* 에디터 컨테이너 */}
      <div
        className={`flex-1 [&_.tox-edit-area]:border-0 [&_.tox-edit-area]:outline-none [&_.tox-edit-area__iframe]:outline-none [&_.tox-tinymce]:border-0 [&_.tox-tinymce]:outline-none ${!isEditorReady ? 'invisible' : ''}`}
      >
        <Editor
          apiKey={TINY_API_KEY}
          onInit={onInit}
          init={{
            ...TINYMCE_INIT,
            setup: editorSetup,
          }}
          value={content}
          onEditorChange={(newContent: string) => {
            setContent(newContent);
            // newContent는 GetContent 이벤트를 거쳐 @@{id} 패턴이 보존된 HTML
            if (newContent) onContentChangeRef.current?.(newContent);
          }}
        />
      </div>

      {/* 이미지 어노테이션 모달 */}
      <ImageAnnotationModal
        isOpen={isAnnotationModalOpen}
        imageSrc={editingImageSrc}
        onClose={onCloseAnnotationModal}
        onSave={onSaveAnnotation}
      />
    </div>
  );
});

CaseDocumentEditor.displayName = 'CaseDocumentEditor';

export default CaseDocumentEditor;
