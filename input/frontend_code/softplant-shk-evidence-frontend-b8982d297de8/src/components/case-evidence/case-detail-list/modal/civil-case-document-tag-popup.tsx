import { useCallback, useEffect, useMemo, useRef, useState } from 'react';

import { MoreHorizontal, X, XCircle } from 'lucide-react';
import ReactDOM from 'react-dom';

import ModalSelect from '@/components/common/modal/modal-select';
import { onMessageToast } from '@/components/utils/global-utils';
import { useCreateCivilCaseTagSet } from '@/hooks/react-query/mutation/case/use-create-civil-case-tag-set';
import { useDeleteCivilCaseDocumentTag } from '@/hooks/react-query/mutation/case/use-delete-civil-case-document-tag';
import { useDeleteCivilCaseTagSet } from '@/hooks/react-query/mutation/case/use-delete-civil-case-tag-set';
import { useTagCivilCaseDocument } from '@/hooks/react-query/mutation/case/use-tag-civil-case-document';
import { useUpdateCivilCaseTagSet } from '@/hooks/react-query/mutation/case/use-update-civil-case-tag-set';
import { useListCivilCaseTagSets } from '@/hooks/react-query/query/case/use-list-civil-case-tag-sets';

type TTagSet = {
  tag_set_id: string;
  tag_name: string;
  color: string;
};

type TCivilCaseDocumentTagPopupProps = {
  isOpen: boolean;
  onClose: () => void;
  /** document.body 기준 absolute 좌표 */
  position: { top: number; left: number };
  civilCaseId: string;
  caseDocumentId: string;
  projectId: string;
  existingTags?: { tag_set_id: string; tag_name: string; color?: string; tag_id?: string }[];
};

const DEFAULT_TAG_COLOR = '#F7F8F8';

export const CivilCaseDocumentTagPopup = ({
  isOpen,
  onClose,
  position,
  civilCaseId,
  caseDocumentId,
  projectId,
  existingTags = [],
}: TCivilCaseDocumentTagPopupProps) => {
  const popupRef = useRef<HTMLDivElement | null>(null);
  const inputRef = useRef<HTMLInputElement | null>(null);
  const listRef = useRef<HTMLDivElement | null>(null);
  const creatingTagNameRef = useRef<string | null>(null);
  const hasInitializedRef = useRef(false);

  const [inputValue, setInputValue] = useState('');
  const [activeIndex, setActiveIndex] = useState(0);
  const [localCreatedTagSets, setLocalCreatedTagSets] = useState<TTagSet[]>([]);
  const [isCreating, setIsCreating] = useState(false);
  const [hoveredTagSetId, setHoveredTagSetId] = useState<string | null>(null);

  // 태그셋 편집/삭제 사이드 팝업 상태
  const [editingTagSet, setEditingTagSet] = useState<TTagSet | null>(null);
  const [editName, setEditName] = useState('');
  const editPopupRef = useRef<HTMLDivElement | null>(null);
  const editInputRef = useRef<HTMLInputElement | null>(null);
  const [editPopupPos, setEditPopupPos] = useState<{ top: number; left: number } | null>(null);
  const [isDeleteConfirmOpen, setIsDeleteConfirmOpen] = useState(false);
  const [deleteTargetTagSet, setDeleteTargetTagSet] = useState<TTagSet | null>(null);

  // 옵션(검색/목록)은 "사건(tagset) 목록"에서 가져온다.
  const { response: listTagSetsResponse, refetch: refetchTagSets } = useListCivilCaseTagSets({
    civilCaseId,
    enabled: isOpen && !!civilCaseId,
  });

  const { isPending: isCreateTagSetPending, onCreateCivilCaseTagSet } = useCreateCivilCaseTagSet();
  const { isPending: isUpdateTagSetPending, onUpdateCivilCaseTagSet } = useUpdateCivilCaseTagSet();
  const { isPending: isDeleteTagSetPending, onDeleteCivilCaseTagSet } = useDeleteCivilCaseTagSet();
  const { onTagCivilCaseDocument } = useTagCivilCaseDocument();
  const { onDeleteCivilCaseDocumentTag } = useDeleteCivilCaseDocumentTag();

  // ! 원격 태그셋 목록 정규화
  const remoteTagSets: TTagSet[] = useMemo(() => {
    const data = listTagSetsResponse?.data ?? [];
    return data.map((t) => ({
      tag_set_id: String(t.tag_set_id ?? ''),
      tag_name: String(t.tag_name ?? ''),
      color: String(t.color ?? DEFAULT_TAG_COLOR),
    }));
  }, [listTagSetsResponse?.data]);

  // ! 원격 + 로컬 생성 태그셋 병합
  const tagSets: TTagSet[] = useMemo(() => {
    const m = new Map<string, TTagSet>();
    for (const t of remoteTagSets) {
      if (t.tag_set_id) m.set(t.tag_set_id, t);
    }
    for (const t of localCreatedTagSets) {
      if (t.tag_set_id) m.set(t.tag_set_id, t);
    }
    return Array.from(m.values());
  }, [localCreatedTagSets, remoteTagSets]);

  // ! 기존 태그명 → 선택된 tag_set_id 목록 (가능한 것만)
  const initialSelectedIds = useMemo(() => {
    return (existingTags ?? []).map((t) => String(t?.tag_set_id ?? '').trim()).filter(Boolean);
  }, [existingTags]);

  // ! tag_set_id → tag_id 매핑 (태그 삭제 API에 tag_id 필요)
  const tagIdBySetId = useMemo(() => {
    const m = new Map<string, string>();
    for (const t of existingTags ?? []) {
      const setId = String(t?.tag_set_id ?? '').trim();
      const tagId = String((t as any)?.tag_id ?? '').trim();
      if (setId && tagId) m.set(setId, tagId);
    }
    return m;
  }, [existingTags]);

  const [selectedTagSetIds, setSelectedTagSetIds] = useState<string[]>([]);

  // ! 팝업 열릴 때 상태 초기화
  useEffect(() => {
    if (!isOpen) return;
    setInputValue('');
    setSelectedTagSetIds([]);
    setLocalCreatedTagSets([]);
    setIsCreating(false);
    setHoveredTagSetId(null);
    setEditingTagSet(null);
    setEditName('');
    setEditPopupPos(null);
    setIsDeleteConfirmOpen(false);
    setDeleteTargetTagSet(null);
    creatingTagNameRef.current = null;
    hasInitializedRef.current = false;
    setActiveIndex(0);
    setTimeout(() => inputRef.current?.focus(), 0);
  }, [isOpen]);

  // ! 태그 목록 로드 후 existingTags → tag_set_id 매핑 1회 동기화
  useEffect(() => {
    if (!isOpen) return;
    if (hasInitializedRef.current) return;
    if (!existingTags.length) return;
    if (!initialSelectedIds.length) return;
    setSelectedTagSetIds(initialSelectedIds);
    hasInitializedRef.current = true;
  }, [existingTags.length, initialSelectedIds, isOpen]);

  // ! 검색 결과 변경 시 첫 항목 하이라이트 초기화
  useEffect(() => {
    if (!isOpen) return;
    setActiveIndex(0);
  }, [isOpen, inputValue, selectedTagSetIds, tagSets.length]);

  // ! 현재 선택된 태그셋 목록
  const selectedTags: TTagSet[] = useMemo(() => {
    const byId = new Map(tagSets.map((t) => [t.tag_set_id, t]));
    return selectedTagSetIds.map((id) => byId.get(id)).filter(Boolean) as TTagSet[];
  }, [selectedTagSetIds, tagSets]);

  // ! 검색 필터링된 태그셋 목록 (선택된 항목 제외)
  const filteredTags: TTagSet[] = useMemo(() => {
    const q = inputValue.trim().toLowerCase();
    // 선택된 태그는 하단 목록에서 제거한다. (X로 해제하면 다시 나타남)
    const base = tagSets.filter((t) => !selectedTagSetIds.includes(t.tag_set_id));
    if (!q) return base;
    return base.filter((t) => t.tag_name.toLowerCase().includes(q));
  }, [inputValue, selectedTagSetIds, tagSets]);

  // ! 입력값과 정확히 일치하는 태그셋 존재 여부
  const isExactMatch = useMemo(() => {
    const q = inputValue.trim().toLowerCase();
    if (!q) return false;
    return tagSets.some((t) => t.tag_name.toLowerCase() === q);
  }, [inputValue, tagSets]);

  // ! 검색 결과가 없을 때만 +생성하기 노출 여부 계산
  const canCreateNewTag = useMemo(() => {
    const q = inputValue.trim();
    if (!q) return false;
    if (!projectId) return false;
    if (isExactMatch) return false;
    return filteredTags.length === 0;
  }, [filteredTags.length, inputValue, isExactMatch, projectId]);

  // ! activeIndex 변경 시 리스트 자동 스크롤
  useEffect(() => {
    if (!isOpen) return;
    if (canCreateNewTag) return;
    const container = listRef.current;
    if (!container) return;
    const item = container.querySelector<HTMLElement>(`[data-tag-index="${activeIndex}"]`);
    item?.scrollIntoView({ block: 'nearest' });
  }, [activeIndex, canCreateNewTag, isOpen]);

  // ! 태그 선택/해제 토글
  const toggleTag = useCallback(
    async (tagSetId: string) => {
      const isRemoving = selectedTagSetIds.includes(tagSetId);

      if (isRemoving) {
        // 태그 해제: DELETE /case-document-tag/:tag_id 호출
        setSelectedTagSetIds((prev) => prev.filter((id) => id !== tagSetId));
        const tagId = tagIdBySetId.get(tagSetId);
        if (tagId) {
          try {
            const res = await onDeleteCivilCaseDocumentTag(tagId);
            if (!res?.success) {
              onMessageToast({ message: res?.message ?? '태그 삭제에 실패했습니다.' });
            }
          } catch {
            onMessageToast({ message: '태그 삭제에 실패했습니다.' });
          }
        } else {
          onMessageToast({ message: '태그 할당 정보를 찾을 수 없습니다.' });
        }
      } else {
        // 태그 적용: POST /case-document-tag 호출
        const nextIds = [...selectedTagSetIds, tagSetId];
        setSelectedTagSetIds(nextIds);
        try {
          const res = await onTagCivilCaseDocument({
            civil_case_id: civilCaseId,
            case_document_id: caseDocumentId,
            tags: nextIds.map((id) => ({ tag_set_id: id })),
          });
          if (!res?.success) {
            onMessageToast({ message: res?.message ?? '태그 적용에 실패했습니다.' });
          }
        } catch {
          onMessageToast({ message: '태그 적용에 실패했습니다.' });
        }
      }
    },
    [selectedTagSetIds, tagIdBySetId, onDeleteCivilCaseDocumentTag, onTagCivilCaseDocument, civilCaseId, caseDocumentId],
  );

  // ! 새 태그 생성
  const handleCreateTag = useCallback(async () => {
    const name = inputValue.trim();
    if (!name || !projectId) return;

    const normalized = name.toLowerCase();
    if (isCreating || creatingTagNameRef.current === normalized) return;
    creatingTagNameRef.current = normalized;
    setIsCreating(true);

    try {
      if (isCreateTagSetPending) return;
      const createdRes = await onCreateCivilCaseTagSet({
        civil_case_id: civilCaseId,
        tag_name: name,
        color: DEFAULT_TAG_COLOR,
      });

      if (!createdRes?.success || !createdRes?.data?.tag_set_id) {
        onMessageToast({ message: createdRes?.message ?? '태그 생성에 실패했습니다.' });
        return;
      }

      const createdId = String(createdRes.data.tag_set_id);
      const createdTag: TTagSet = {
        tag_set_id: createdId,
        tag_name: String(createdRes.data.tag_name ?? name),
        color: String(createdRes.data.color ?? DEFAULT_TAG_COLOR),
      };

      // 생성 직후 문서별 태그목록 API에 바로 안 뜰 수 있으므로, 로컬에 즉시 주입
      setLocalCreatedTagSets((prev) => {
        const next = prev.filter((t) => t.tag_set_id !== createdId);
        next.push(createdTag);
        return next;
      });

      // 생성은 "태그셋만" 만들고, 문서에 태그 적용(fetchTagDocument)은
      // 사용자가 목록에서 태그를 선택했을 때만 수행한다.
      setInputValue('');

      onMessageToast({ message: '태그가 생성되었습니다.' });

      // 서버 목록도 갱신 시도 (가능한 경우)
      void refetchTagSets();
    } catch (e: any) {
      onMessageToast({ message: e?.message ?? '태그 생성 중 오류가 발생했습니다.' });
    } finally {
      setIsCreating(false);
      creatingTagNameRef.current = null;
    }
  }, [civilCaseId, inputValue, isCreateTagSetPending, isCreating, onCreateCivilCaseTagSet, projectId, refetchTagSets]);

  // ! 바깥 클릭 닫기
  useEffect(() => {
    if (!isOpen) return;
    const onDown = (e: MouseEvent) => {
      // 삭제 확인 모달이 떠 있을 때는 바깥 클릭으로 팝업이 닫히면 안 된다.
      if (isDeleteConfirmOpen) return;
      const el = popupRef.current;
      const editEl = editPopupRef.current;
      if (el && e.target instanceof Node && el.contains(e.target)) return;
      if (editEl && e.target instanceof Node && editEl.contains(e.target)) return;
      onClose();
    };
    document.addEventListener('mousedown', onDown);
    return () => document.removeEventListener('mousedown', onDown);
  }, [isDeleteConfirmOpen, isOpen, onClose]);

  // ! 편집 팝업 열릴 때 입력 포커스
  useEffect(() => {
    if (!editingTagSet) return;
    setTimeout(() => editInputRef.current?.focus(), 0);
  }, [editingTagSet]);

  // ! 편집 팝업 위치 계산 및 열기
  const openEditPopup = useCallback(
    (tag: TTagSet, anchorEl: HTMLElement) => {
      const rect = anchorEl.getBoundingClientRect();
      const scrollY = window.scrollY || document.documentElement.scrollTop;
      const scrollX = window.scrollX || document.documentElement.scrollLeft;

      const editW = 220;
      const gap = 8;

      let left = rect.right + scrollX + gap;
      const rightEdge = left + editW;
      const viewportRight = scrollX + window.innerWidth;
      if (rightEdge > viewportRight - 8) {
        // 우측 공간 부족 시 메인 팝업 왼쪽에 열기
        left = position.left - editW - gap;
      }
      // 목록 영역 위쪽에 정렬하되 뷰포트 안에서 클램프
      const topRaw = rect.top + scrollY - 8;
      const top = Math.max(scrollY + 8, Math.min(topRaw, scrollY + window.innerHeight - 140));

      setEditingTagSet(tag);
      setEditName(tag.tag_name);
      setEditPopupPos({ top, left });
    },
    [position.left],
  );

  // ! 태그셋 이름 수정 적용
  const applyTagSetRename = useCallback(
    async (tag: TTagSet) => {
      const nextName = editName.trim();
      if (!nextName) return;
      if (isUpdateTagSetPending) return;
      const res = await onUpdateCivilCaseTagSet({ tag_set_id: tag.tag_set_id, tag_name: nextName, color: tag.color || DEFAULT_TAG_COLOR });
      if (!res?.success) {
        onMessageToast({ message: res?.message ?? '태그 수정에 실패했습니다.' });
        return;
      }
      // 즉시 UI 반영을 위한 로컬 상태 덮어쓰기
      setLocalCreatedTagSets((prev) => {
        const filtered = prev.filter((t) => t.tag_set_id !== tag.tag_set_id);
        filtered.push({ tag_set_id: tag.tag_set_id, tag_name: nextName, color: tag.color || DEFAULT_TAG_COLOR });
        return filtered;
      });
      onMessageToast({ message: '태그가 수정되었습니다.' });
      void refetchTagSets();
      setEditingTagSet(null);
      setEditPopupPos(null);
    },
    [editName, isUpdateTagSetPending, onUpdateCivilCaseTagSet, refetchTagSets],
  );

  // ! 태그셋 삭제 적용
  const applyTagSetDelete = useCallback(
    async (tag: TTagSet) => {
      if (isDeleteTagSetPending) return;
      const tagSetId = String(tag?.tag_set_id ?? '').trim();
      if (!tagSetId) {
        onMessageToast({ message: '태그 삭제에 실패했습니다. (tag_set_id 없음)' });
        return;
      }
      const res = await onDeleteCivilCaseTagSet(tagSetId);
      if (!res?.success) {
        onMessageToast({ message: res?.message ?? '태그 삭제에 실패했습니다.' });
        return;
      }
      // 로컬 상태에서도 제거
      setLocalCreatedTagSets((prev) => prev.filter((t) => t.tag_set_id !== tagSetId));
      // 문서에 선택된 태그였다면 함께 해제
      if (selectedTagSetIds.includes(tagSetId)) {
        const tagId = tagIdBySetId.get(tagSetId);
        if (tagId) {
          try {
            await onDeleteCivilCaseDocumentTag(tagId);
          } catch {
            /* tag set already deleted */
          }
        }
      }
      setSelectedTagSetIds((prev) => prev.filter((id) => id !== tagSetId));
      onMessageToast({ message: '태그가 삭제되었습니다.' });
      void refetchTagSets();
      setEditingTagSet(null);
      setEditPopupPos(null);
      setIsDeleteConfirmOpen(false);
      setDeleteTargetTagSet(null);
    },
    [isDeleteTagSetPending, onDeleteCivilCaseTagSet, refetchTagSets, selectedTagSetIds, tagIdBySetId, onDeleteCivilCaseDocumentTag],
  );

  // ! 태그셋 삭제 확인 모달 열기
  const requestDeleteTagSet = useCallback((tag: TTagSet) => {
    const tagSetId = String(tag?.tag_set_id ?? '').trim();
    if (!tagSetId) {
      onMessageToast({ message: '태그 삭제에 실패했습니다. (tag_set_id 없음)' });
      return;
    }
    setDeleteTargetTagSet({ ...tag, tag_set_id: tagSetId });
    setIsDeleteConfirmOpen(true);
  }, []);

  // ! 키보드 입력 처리 (ESC/화살표/Enter)
  const handleKeyDown = useCallback(
    (e: React.KeyboardEvent<HTMLInputElement>) => {
      if (e.key === 'Escape') {
        e.preventDefault();
        onClose();
        return;
      }

      if (e.key === 'ArrowDown') {
        e.preventDefault();
        const max = filteredTags.length ? filteredTags.length - 1 : 0;
        setActiveIndex((prev) => Math.min(prev + 1, max));
        return;
      }

      if (e.key === 'ArrowUp') {
        e.preventDefault();
        setActiveIndex((prev) => Math.max(prev - 1, 0));
        return;
      }

      if (e.key === 'Enter') {
        e.preventDefault();
        const q = inputValue.trim();

        // 입력값이 있을 때:
        // - 검색 결과가 있으면: 현재 하이라이트된 항목 선택
        // - 검색 결과가 없으면(+생성하기 상태): 생성 뮤테이션
        if (q) {
          if (filteredTags.length > 0) {
            const idx = Math.max(0, Math.min(activeIndex, filteredTags.length - 1));
            const tag = filteredTags[idx];
            if (tag?.tag_set_id) void toggleTag(tag.tag_set_id);
            return;
          }
          if (canCreateNewTag) {
            void handleCreateTag();
          }
          return;
        }

        // 입력이 없을 때: 하이라이트된 항목 선택(편의)
        if (filteredTags.length > 0) {
          const idx = Math.max(0, Math.min(activeIndex, filteredTags.length - 1));
          const tag = filteredTags[idx];
          if (tag?.tag_set_id) void toggleTag(tag.tag_set_id);
        }
      }
    },
    [activeIndex, canCreateNewTag, filteredTags, handleCreateTag, inputValue, onClose, toggleTag],
  );

  if (!isOpen) return null;

  return ReactDOM.createPortal(
    <>
      <div
        ref={popupRef}
        className='absolute z-[999999] max-h-[221px] min-w-[291px] rounded-[8px] bg-white shadow-md'
        style={{
          top: `${position.top}px`,
          left: `${position.left}px`,
          boxShadow: '2px 2px 8px 0 rgba(0, 0, 0, 0.15)',
        }}
        onClick={(e) => e.stopPropagation()}
      >
        {/* 상단: 선택된 태그 + 입력 */}
        <div className='w-full border-b border-[#D4D4D8]'>
          {/* 캡쳐 UX:
              - 선택된 태그도 보더(#E4E4E7)만(배경 없음) + X 버튼
              - 280px 안에서 2개씩 나열
              - 선택 태그가 늘어나면 아래로 자연 확장(스크롤 없음) */}
          <div className='px-2 py-2'>
            {/* 선택 태그: 280px 안에서 짧으면 3개까지도 한 줄에 들어가도록 flex-wrap으로 배치 */}
            <div className='flex w-[280px] flex-wrap items-center gap-1.5'>
              {selectedTags.map((tag) => (
                <div
                  key={tag.tag_set_id}
                  className='inline-flex h-[32px] w-fit max-w-[136px] items-center gap-2 rounded-[12px] border border-[#E4E4E7] bg-transparent px-2 text-[14px] font-semibold text-[#000000]'
                >
                  <span className='min-w-0 truncate'>{tag.tag_name}</span>
                  <button
                    type='button'
                    onClick={(e) => {
                      e.stopPropagation();
                      void toggleTag(tag.tag_set_id);
                    }}
                    className='flex h-[18px] w-[18px] items-center justify-center rounded-[6px] text-[#8A8A8E] hover:bg-[#F4F4F5]'
                    aria-label='remove-tag'
                  >
                    <X className='h-4 w-4' />
                  </button>
                </div>
              ))}
            </div>

            <input
              ref={inputRef}
              type='text'
              value={inputValue}
              onChange={(e) => setInputValue(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder={selectedTags.length === 0 ? '태그를 선택하세요' : ''}
              className='mt-2 h-[32px] w-[280px] border-none bg-transparent px-0 text-[14px] text-[#000000] outline-none placeholder:text-[#71717A] focus:outline-none focus:ring-0'
            />
          </div>
        </div>

        {/* 하단: 태그 목록 */}
        <div className='w-full px-1 py-1'>
          {/* 검색 결과가 없어서 생성하기 버튼이 뜨는 상태라면, "태그 선택 또는 생성" 영역은 숨김 */}
          {!canCreateNewTag ? (
            <>
              <div ref={listRef} className='max-h-[140px] overflow-y-auto'>
                {filteredTags.map((tag, idx) => {
                  const isActive = idx === activeIndex;
                  const isSelected = selectedTagSetIds.includes(tag.tag_set_id);
                  const isHovered = hoveredTagSetId === tag.tag_set_id;
                  return (
                    <div
                      key={tag.tag_set_id}
                      className='mb-1 flex w-full items-center px-1'
                      onMouseEnter={() => {
                        setActiveIndex(idx);
                        setHoveredTagSetId(tag.tag_set_id);
                      }}
                      onMouseLeave={() => setHoveredTagSetId((prev) => (prev === tag.tag_set_id ? null : prev))}
                    >
                      <button
                        type='button'
                        data-tag-index={idx}
                        className={`flex h-[32px] w-full items-center justify-between rounded-[6px] px-2 text-left text-[14px] ${
                          isActive ? 'bg-[#E4E4E7]' : 'hover:bg-[#E4E4E7]'
                        }`}
                        onClick={() => void toggleTag(tag.tag_set_id)}
                      >
                        <span className={`truncate ${isSelected ? 'font-semibold text-[#18181B]' : ''}`}>{tag.tag_name}</span>
                        <span className='ml-2 flex items-center'>
                          {isHovered ? (
                            <button
                              type='button'
                              className='flex h-[20px] w-[20px] items-center justify-center rounded-[4px] bg-[#D4D4D8]'
                              onClick={(e) => {
                                e.preventDefault();
                                e.stopPropagation();
                                openEditPopup(tag, e.currentTarget as unknown as HTMLElement);
                              }}
                              aria-label='edit-tag'
                            >
                              <MoreHorizontal className='h-[14px] w-[14px] text-[#18181B]' />
                            </button>
                          ) : null}
                        </span>
                      </button>
                    </div>
                  );
                })}
              </div>
            </>
          ) : null}

          {/* 생성하기 버튼은 리스트와 분리 (검색 하단 고정 영역) */}
          {canCreateNewTag ? (
            <div className='pt-1'>
              <button
                type='button'
                className='flex h-[32px] w-full items-center rounded-[6px] px-3 text-left text-[14px] hover:bg-[#D4D4D8]'
                onClick={() => void handleCreateTag()}
                disabled={isCreating}
              >
                <span className='truncate'>+ &quot;{inputValue.trim()}&quot; 생성하기</span>
              </button>
            </div>
          ) : null}
        </div>
      </div>

      {/* edit side popup */}
      {editingTagSet && editPopupPos ? (
        <div
          ref={editPopupRef}
          className='absolute z-[1000000] w-[220px] rounded-[8px] border border-[#D4D4D8] bg-white shadow-md'
          style={{ top: `${editPopupPos.top}px`, left: `${editPopupPos.left}px`, boxShadow: '2px 2px 8px 0 rgba(0, 0, 0, 0.15)' }}
          onClick={(e) => e.stopPropagation()}
        >
          <div className='p-2'>
            <div className='flex h-[32px] items-center gap-2 rounded-[10px] border border-[#E4E4E7] bg-white px-1'>
              <input
                ref={editInputRef}
                value={editName}
                onChange={(e) => setEditName(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter') {
                    e.preventDefault();
                    void applyTagSetRename(editingTagSet);
                  }
                  if (e.key === 'Escape') {
                    e.preventDefault();
                    setEditingTagSet(null);
                    setEditPopupPos(null);
                  }
                }}
                className='h-[32px] min-w-0 flex-1 border-none bg-transparent text-[14px] font-medium text-[#18181B] outline-none focus:outline-none focus:ring-0'
              />
              <button
                type='button'
                className='flex h-[20px] w-[20px] items-center justify-center'
                onClick={() => setEditName('')}
                aria-label='clear'
              >
                <XCircle className='h-[20px] w-[20px] text-[#71717A]' />
              </button>
            </div>
          </div>

          <div className='border-t border-[#E4E4E7]'>
            <button
              type='button'
              disabled={isDeleteTagSetPending}
              className='flex h-[40px] w-full items-center px-3 text-[14px] font-medium text-[#DC2626] hover:bg-[#F4F4F5] disabled:opacity-50'
              onClick={() => requestDeleteTagSet(editingTagSet)}
            >
              삭제
            </button>
          </div>
        </div>
      ) : null}

      {/* delete confirm modal (ModalSelect 포맷 사용) */}
      {isDeleteConfirmOpen && deleteTargetTagSet ? (
        <ModalSelect
          sendMessage='태그를 삭제하시겠습니까?'
          storageMessage='삭제한 태그는 복구할 수 없습니다.'
          confirmButtonText='삭제'
          setIsModalOpen={() => {
            setIsDeleteConfirmOpen(false);
            setDeleteTargetTagSet(null);
          }}
          handleSave={() => {
            void applyTagSetDelete(deleteTargetTagSet);
          }}
        />
      ) : null}
    </>,
    document.body,
  );
};
