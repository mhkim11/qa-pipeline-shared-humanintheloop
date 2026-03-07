import { useCallback, useEffect, useMemo, useRef, useState } from 'react';

import ClassicEditor from '@ckeditor/ckeditor5-build-classic';
import { CKEditor } from '@ckeditor/ckeditor5-react';

import '@/styles/case-document-editor.css';

type TCaseDocumentEditorProps = {
  title?: string;
  value: string;
  onChange: (next: string) => void;
};

export default function CaseDocumentEditor({ title = '문서작성', value, onChange }: TCaseDocumentEditorProps) {
  const editorRef = useRef<any>(null);
  const detachSelectionListenersRef = useRef<null | (() => void)>(null);
  const [selectionAction, setSelectionAction] = useState<null | {
    x: number;
    y: number;
  }>(null);
  const [highlightColor, setHighlightColor] = useState<'yellow' | 'green' | 'pink' | 'blue'>('yellow');
  const [hoverTip, setHoverTip] = useState<null | {
    x: number;
    y: number;
    doc: string;
    page: string;
    pages: string;
    snippet: string;
  }>(null);

  const editorConfig = useMemo(
    () => ({
      placeholder: '서면 내용을 입력하세요.',
    }),
    [],
  );

  const loadTestHtml = useCallback(async () => {
    try {
      const res = await fetch('/test.html', { cache: 'no-store' });
      if (!res.ok) throw new Error(`HTTP ${res.status}`);

      const html = await res.text();
      const parser = new DOMParser();
      const doc = parser.parseFromString(html, 'text/html');
      const root = (doc.querySelector('.inner') as HTMLElement | null) ?? doc.body;
      const next = root.innerHTML?.trim() || '<p></p>';
      onChange(next);
    } catch (e) {
      console.error(e);
      alert('test.html 불러오기에 실패했습니다.');
    }
  }, [onChange]);

  const getSelectedText = useCallback((editor: any) => {
    try {
      const selection = editor.model.document.selection;
      let text = '';

      for (const range of selection.getRanges()) {
        for (const item of range.getItems()) {
          if (item.is && item.is('$textProxy')) text += item.data;
        }
      }
      return text.trim();
    } catch {
      return '';
    }
  }, []);

  const applyHighlight = useCallback(
    (color: 'yellow' | 'green' | 'pink' | 'blue' = 'yellow') => {
      const editor = editorRef.current;
      if (!editor) return;

      const selection = editor.model.document.selection;
      if (selection.isCollapsed) {
        setSelectionAction(null);
        return;
      }

      const snippet = getSelectedText(editor).slice(0, 160);
      // Prototype defaults (can be wired to actual PDF later)
      const doc = 'test.html';
      const page = '-';
      const pages = '-';

      const href = `https://cite.local/?doc=${encodeURIComponent(doc)}&page=${encodeURIComponent(page)}&pages=${encodeURIComponent(
        pages,
      )}&snippet=${encodeURIComponent(snippet)}&color=${encodeURIComponent(color)}`;

      editor.execute('link', href);
      editor.editing.view.focus();
      setSelectionAction(null);
    },
    [getSelectedText],
  );

  useEffect(() => {
    const editor = editorRef.current;
    if (!editor) return;

    const editable = editor.ui.getEditableElement?.() as HTMLElement | null;
    if (!editable) return;

    const onMouseMove = (e: MouseEvent) => {
      const target = e.target as HTMLElement | null;
      const a = target?.closest?.('a') as HTMLAnchorElement | null;
      const href = a?.getAttribute?.('href') ?? '';
      if (!href.startsWith('https://cite.local/')) {
        setHoverTip(null);
        return;
      }

      let doc = '-';
      let page = '-';
      let pages = '-';
      let snippet = '';
      try {
        const url = new URL(href);
        doc = url.searchParams.get('doc') || '-';
        page = url.searchParams.get('page') || '-';
        pages = url.searchParams.get('pages') || '-';
        snippet = url.searchParams.get('snippet') || '';
      } catch {
        // ignore
      }

      setHoverTip({
        x: e.clientX + 12,
        y: e.clientY + 12,
        doc,
        page,
        pages,
        snippet,
      });
    };

    const onMouseLeave = () => setHoverTip(null);
    const onClick = (e: MouseEvent) => {
      const target = e.target as HTMLElement | null;
      const a = target?.closest?.('a') as HTMLAnchorElement | null;
      const href = a?.getAttribute?.('href') ?? '';
      if (href.startsWith('https://cite.local/')) {
        e.preventDefault();
        e.stopPropagation();
      }
    };

    editable.addEventListener('mousemove', onMouseMove);
    editable.addEventListener('mouseleave', onMouseLeave);
    editable.addEventListener('click', onClick);
    return () => {
      editable.removeEventListener('mousemove', onMouseMove);
      editable.removeEventListener('mouseleave', onMouseLeave);
      editable.removeEventListener('click', onClick);
    };
  }, [value]);

  useEffect(() => {
    return () => {
      detachSelectionListenersRef.current?.();
      detachSelectionListenersRef.current = null;
    };
  }, []);

  return (
    <div className='flex h-full min-h-0 flex-1 flex-col'>
      <div className='flex items-center justify-between border-b border-gray-200 bg-white px-4 py-2'>
        <div className='flex items-center gap-3'>
          <div className='text-sm font-medium text-gray-900'>{title}</div>
          <div className='flex items-center gap-2'>
            <button
              onClick={loadTestHtml}
              className='rounded border border-gray-200 bg-white px-2 py-1 text-xs text-gray-700 hover:bg-gray-50'
            >
              test.html 불러오기
            </button>
            <div className='ml-2 flex items-center gap-1 rounded-md bg-white p-1 ring-1 ring-gray-200'>
              <button
                type='button'
                title='하이라이트: 노랑'
                className={`h-5 w-5 rounded-full border border-gray-300 bg-[#fff59d] hover:opacity-90 ${highlightColor === 'yellow' ? 'ring-2 ring-gray-900' : ''}`}
                onClick={() => setHighlightColor('yellow')}
              />
              <button
                type='button'
                title='하이라이트: 초록'
                className={`h-5 w-5 rounded-full border border-gray-300 bg-[#bbf7d0] hover:opacity-90 ${highlightColor === 'green' ? 'ring-2 ring-gray-900' : ''}`}
                onClick={() => setHighlightColor('green')}
              />
              <button
                type='button'
                title='하이라이트: 분홍'
                className={`h-5 w-5 rounded-full border border-gray-300 bg-[#fecdd3] hover:opacity-90 ${highlightColor === 'pink' ? 'ring-2 ring-gray-900' : ''}`}
                onClick={() => setHighlightColor('pink')}
              />
              <button
                type='button'
                title='하이라이트: 파랑'
                className={`h-5 w-5 rounded-full border border-gray-300 bg-[#bfdbfe] hover:opacity-90 ${highlightColor === 'blue' ? 'ring-2 ring-gray-900' : ''}`}
                onClick={() => setHighlightColor('blue')}
              />
            </div>
          </div>
        </div>
      </div>

      {/* Document-like surface */}
      <div className='flex flex-1 flex-col overflow-auto bg-[#f3f4f6]'>
        <div className='mx-auto flex h-full w-full max-w-[900px] flex-col'>
          <div className='flex flex-1 flex-col bg-white shadow-sm ring-1 ring-gray-200'>
            <div className='flex flex-1 flex-col p-[18px]'>
              <div className='case-document-editor min-h-0 flex-1'>
                <CKEditor
                  editor={ClassicEditor as any}
                  data={value}
                  config={editorConfig as any}
                  onReady={(editor) => {
                    editorRef.current = editor;

                    // Selection -> show floating action button near selection (no top buttons)
                    detachSelectionListenersRef.current?.();
                    const editableEl = editor.ui.getEditableElement?.() as HTMLElement | null;

                    const isSelectionInsideEditable = () => {
                      const sel = window.getSelection();
                      if (!sel || sel.rangeCount === 0) return false;
                      const anchor = sel.anchorNode;
                      if (!anchor) return false;
                      return editableEl ? editableEl.contains(anchor) : false;
                    };

                    const updateSelectionUi = () => {
                      try {
                        if (!editableEl) {
                          setSelectionAction(null);
                          return;
                        }
                        if (!isSelectionInsideEditable()) {
                          setSelectionAction(null);
                          return;
                        }

                        const sel = window.getSelection();
                        if (!sel || sel.rangeCount === 0 || sel.isCollapsed) {
                          setSelectionAction(null);
                          return;
                        }

                        const range = sel.getRangeAt(0);
                        const rect = range.getBoundingClientRect();
                        if (!rect || (rect.width === 0 && rect.height === 0)) {
                          setSelectionAction(null);
                          return;
                        }

                        setSelectionAction({
                          x: rect.left + rect.width / 2,
                          y: rect.bottom + 10,
                        });
                      } catch {
                        setSelectionAction(null);
                      }
                    };

                    const onMouseUp = () => updateSelectionUi();
                    const onKeyUp = () => updateSelectionUi();
                    const onSelectionChange = () => {
                      // selectionchange fires globally; filter to editor
                      if (!isSelectionInsideEditable()) return;
                      updateSelectionUi();
                    };
                    const onScroll = () => setSelectionAction(null);

                    editableEl?.addEventListener('mouseup', onMouseUp);
                    editableEl?.addEventListener('keyup', onKeyUp);
                    document.addEventListener('selectionchange', onSelectionChange);
                    editableEl?.addEventListener('scroll', onScroll, {
                      passive: true,
                    });

                    detachSelectionListenersRef.current = () => {
                      editableEl?.removeEventListener('mouseup', onMouseUp);
                      editableEl?.removeEventListener('keyup', onKeyUp);
                      document.removeEventListener('selectionchange', onSelectionChange);
                      editableEl?.removeEventListener('scroll', onScroll);
                    };
                  }}
                  onChange={(_event, editor) => {
                    onChange(editor.getData());
                  }}
                />
              </div>
            </div>
          </div>
        </div>
      </div>

      {selectionAction && (
        <div
          className='case-document-editor-selection-action'
          style={{
            left: selectionAction.x,
            top: selectionAction.y,
          }}
          onMouseDown={(e) => {
            // Keep selection when clicking the floating button
            e.preventDefault();
          }}
        >
          <button
            onClick={() => applyHighlight(highlightColor)}
            className='rounded-md bg-yellow-300 px-3 py-1 text-xs font-semibold text-gray-900 shadow-md hover:bg-yellow-200'
          >
            하이라이트
          </button>
          <div className='ml-2 flex items-center gap-1 rounded-md bg-white/90 p-1 shadow-md ring-1 ring-gray-200'>
            <button
              type='button'
              title='노랑'
              className='h-5 w-5 rounded-full border border-gray-300 bg-[#fff59d] hover:opacity-90'
              onClick={() => {
                setHighlightColor('yellow');
                applyHighlight('yellow');
              }}
            />
            <button
              type='button'
              title='초록'
              className='h-5 w-5 rounded-full border border-gray-300 bg-[#bbf7d0] hover:opacity-90'
              onClick={() => {
                setHighlightColor('green');
                applyHighlight('green');
              }}
            />
            <button
              type='button'
              title='분홍'
              className='h-5 w-5 rounded-full border border-gray-300 bg-[#fecdd3] hover:opacity-90'
              onClick={() => {
                setHighlightColor('pink');
                applyHighlight('pink');
              }}
            />
            <button
              type='button'
              title='파랑'
              className='h-5 w-5 rounded-full border border-gray-300 bg-[#bfdbfe] hover:opacity-90'
              onClick={() => {
                setHighlightColor('blue');
                applyHighlight('blue');
              }}
            />
          </div>
        </div>
      )}

      {hoverTip && (
        <div
          className='case-document-editor-tooltip'
          style={{
            left: hoverTip.x,
            top: hoverTip.y,
          }}
        >
          <div className='case-document-editor-tooltip__title'>
            {hoverTip.doc} · {hoverTip.page}/{hoverTip.pages}p
          </div>
          {hoverTip.snippet ? <div className='case-document-editor-tooltip__body'>{hoverTip.snippet}</div> : null}
        </div>
      )}
    </div>
  );
}
