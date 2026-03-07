import { useRef, useState } from 'react';

import { type IEvidenceSection } from '@/components/case-evidence/case-detail-list/case-document-editor/types/case-document-editor.type';

interface IEvidenceHighlightListProps {
  sections: IEvidenceSection[];
  onUpdateFileName?: (id: string, newFileName: string) => void;
}

export const EvidenceHighlightList = ({ sections, onUpdateFileName }: IEvidenceHighlightListProps): JSX.Element => {
  const [editingId, setEditingId] = useState<string | null>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  const handleStartEdit = (id: string) => {
    setEditingId(id);
    // 다음 렌더에서 input에 포커스
    setTimeout(() => inputRef.current?.focus(), 0);
  };

  const handleFinishEdit = (id: string, newFileName: string) => {
    const trimmed = newFileName.trim();
    if (trimmed) onUpdateFileName?.(id, trimmed);
    setEditingId(null);
  };

  return (
    <div className='w-[240px]'>
      <h1 className='mb-2 text-lg font-bold text-zinc-900'>첨부자료</h1>
      {sections.map((section, sectionIdx) => (
        <div key={sectionIdx} className='mb-4'>
          <h3 className='mb-1.5 text-sm font-semibold text-zinc-900'>{section.title}</h3>
          {section.items.length > 0 && (
            <ul className='space-y-1.5'>
              {section.items.map((item, i) => (
                <li key={`${item.id}-${i}`} className='flex items-center gap-2'>
                  {editingId === item.id ? (
                    <input
                      ref={inputRef}
                      className='w-full rounded-md border border-zinc-300 px-2 py-1 text-sm font-medium text-zinc-900 outline-none focus:border-sky-400'
                      defaultValue={item.fileName ?? 'Label'}
                      onBlur={(e) => handleFinishEdit(item.id, e.target.value)}
                      onKeyDown={(e) => {
                        if (e.key === 'Enter') handleFinishEdit(item.id, e.currentTarget.value);
                        if (e.key === 'Escape') setEditingId(null);
                      }}
                    />
                  ) : (
                    <div
                      className='w-fit cursor-pointer rounded-md bg-white px-2 py-1 text-sm font-medium text-zinc-900 hover:bg-zinc-100'
                      onClick={() => handleStartEdit(item.id)}
                    >
                      {item.fileName ?? 'Label'}
                    </div>
                  )}

                  <div className='text-sm font-medium text-zinc-500'>{item.label ?? ''}</div>
                </li>
              ))}
            </ul>
          )}
        </div>
      ))}
    </div>
  );
};
