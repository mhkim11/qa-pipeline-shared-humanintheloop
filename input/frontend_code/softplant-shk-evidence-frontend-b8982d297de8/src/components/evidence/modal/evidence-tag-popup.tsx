import { useState, useRef, useEffect, useMemo, useCallback } from 'react';

import { DragDropContext, Droppable, Draggable, DropResult } from '@hello-pangea/dnd';
import ReactDOM from 'react-dom';
import { BsTrash } from 'react-icons/bs';
import { FiX } from 'react-icons/fi';
import { IoMdSend } from 'react-icons/io';
import { MdDragIndicator } from 'react-icons/md';

import {
  useCreateEvidenceTag,
  useUpdateEvidenceTag,
  useDeleteEvidenceTag,
  useAssignEvidenceTag,
  useDeleteAssignEvidenceTag,
  useUpdateEvidenceTagOrder,
} from '@query/mutation';
import { useListEvidenceTags } from '@query/query';
import { onMessageToast } from '@/components/utils';

type TEvidenceTag = {
  tag_set_id: string; // 태그 할당/삭제 시 사용 (필수)
  tag_id?: string; // 태그 삭제 시 사용 (optional)
  tag_name: string;
  color: string;
  sort_order?: number; // 태그 순서
};

type TEvidenceTagPopupProps = {
  isOpen: boolean;
  onClose: () => void;
  position: { top: number; left: number };
  projectId: string;
  evidenceId: string;
  existingTags?: TEvidenceTag[];
  onTagUpdate: () => void;
};

const DEFAULT_TAG_COLOR = '#F7F8F8'; // 기본 태그 색상

export const EvidenceTagPopup = ({
  isOpen,
  onClose,
  position,
  projectId,
  evidenceId,
  existingTags = [],
  onTagUpdate,
}: TEvidenceTagPopupProps) => {
  const [selectedTags, setSelectedTags] = useState<TEvidenceTag[]>(existingTags || []);
  const [inputValue, setInputValue] = useState('');
  const [tagName, setTagName] = useState('');
  const [editingTag, setEditingTag] = useState<TEvidenceTag | null>(null);
  const [tagNameEdit, setTagNameEdit] = useState('');
  const [editPopupPosition, setEditPopupPosition] = useState<{ top: number; left: number } | null>(null);
  const [deletedTagIds, setDeletedTagIds] = useState<Set<string>>(new Set()); // 삭제된 태그 ID 추적 (플리커링 방지)
  const [isCreating, setIsCreating] = useState(false); // 태그 생성 중 플래그 (중복 호출 방지)
  const isProcessingRef = useRef(false); // 중복 호출 방지를 위한 ref
  const isRefetchingTagsRef = useRef(false); // 태그 리스트 리패치 중복 호출 방지
  const creatingTagNameRef = useRef<string | null>(null); // 현재 생성 중인 태그 이름 추적
  const processingTagIdsRef = useRef<Set<string>>(new Set()); // 현재 처리 중인 태그 ID 추적
  const inputRef = useRef<HTMLInputElement>(null);
  const popupRef = useRef<HTMLDivElement>(null);
  const editPopupRef = useRef<HTMLDivElement>(null);

  const { onCreateEvidenceTag } = useCreateEvidenceTag();
  const { onUpdateEvidenceTag } = useUpdateEvidenceTag();
  const { onDeleteEvidenceTag } = useDeleteEvidenceTag();
  const { onAssignEvidenceTag } = useAssignEvidenceTag();
  const { onDeleteAssignEvidenceTag } = useDeleteAssignEvidenceTag();
  const { onUpdateEvidenceTagOrder } = useUpdateEvidenceTagOrder();

  // 프로젝트의 태그 목록 조회 (/tag-sets/list/:project_id)
  const { response: listTagsResponse, refetch: refetchListTagsOriginal } = useListEvidenceTags({
    project_id: projectId,
    enabled: isOpen && projectId !== '',
  });

  // 태그 리스트 리패치 함수 (중복 호출 방지)
  const refetchListTags = useCallback(async () => {
    // 이미 리패치 중이면 중복 호출 방지
    if (isRefetchingTagsRef.current) {
      return;
    }

    isRefetchingTagsRef.current = true;
    try {
      await refetchListTagsOriginal();
    } finally {
      // 짧은 지연 후 플래그 해제 (연속 호출 방지)
      setTimeout(() => {
        isRefetchingTagsRef.current = false;
      }, 300);
    }
  }, [refetchListTagsOriginal]);

  // 프로젝트의 사용중인 태그 목록 (sort_order로 정렬)
  const projectTags = useMemo(() => {
    if (!listTagsResponse?.data) {
      return [];
    }
    const tags = listTagsResponse.data;
    const tagMap = new Map<string, TEvidenceTag>();
    tags.forEach((tag) => {
      // tag_set_id를 키로 사용
      if (tag.tag_set_id) {
        tagMap.set(tag.tag_set_id, {
          tag_set_id: tag.tag_set_id,
          tag_name: tag.tag_name,
          color: tag.color || DEFAULT_TAG_COLOR,
          sort_order: tag.sort_order ?? 0,
        });
      }
    });
    // sort_order로 정렬
    return Array.from(tagMap.values()).sort((a, b) => (a.sort_order ?? 0) - (b.sort_order ?? 0));
  }, [listTagsResponse]);

  // 입력값에 따른 필터링된 태그 목록 (등록된 태그만, 선택된 태그 제외, 삭제된 태그 제외)
  const filteredTags = useMemo(() => {
    if (!inputValue.trim()) {
      // 입력값이 없을 때: 선택되지 않고 삭제되지 않은 모든 등록된 태그 표시
      return projectTags.filter(
        (tag) => !deletedTagIds.has(tag.tag_set_id) && !selectedTags.some((st) => st.tag_set_id === tag.tag_set_id),
      );
    }
    const lowerInput = inputValue.trim().toLowerCase();
    // 입력값이 있을 때: 입력값과 일치하고 선택되지 않고 삭제되지 않은 등록된 태그만 표시
    return projectTags.filter(
      (tag) =>
        !deletedTagIds.has(tag.tag_set_id) &&
        !selectedTags.some((st) => st.tag_set_id === tag.tag_set_id) &&
        tag.tag_name.toLowerCase().includes(lowerInput),
    );
  }, [inputValue, projectTags, selectedTags, deletedTagIds]);

  // 입력한 텍스트가 기존 태그와 완전히 일치하는지 확인
  const isExactMatch = useMemo(() => {
    if (!inputValue.trim()) return false;
    return projectTags.some((tag) => tag.tag_name.toLowerCase() === inputValue.trim().toLowerCase());
  }, [inputValue, projectTags]);

  // 새 태그 생성 가능 여부 (입력값이 있고, 완전히 일치하는 태그가 없을 때)
  const canCreateNewTag = useMemo(() => {
    return inputValue.trim() && !isExactMatch;
  }, [inputValue, isExactMatch]);

  // 팝업이 열릴 때만 초기화 (existingTags 변경 시에는 초기화하지 않음)
  useEffect(() => {
    if (isOpen) {
      // 팝업이 열릴 때는 useListEvidenceTags의 enabled 옵션으로 자동 호출되므로 refetchListTags() 호출 제거
      setSelectedTags(existingTags || []);
      setInputValue('');
      setTagName('');
      setEditingTag(null);
      setTagNameEdit('');
      setEditPopupPosition(null);
      setDeletedTagIds(new Set()); // 팝업이 열릴 때마다 삭제된 태그 추적 초기화
      setIsCreating(false); // 생성 중 플래그 초기화
      isProcessingRef.current = false; // 처리 중 플래그 초기화
      isRefetchingTagsRef.current = false; // 리패치 플래그 초기화
      creatingTagNameRef.current = null; // 생성 중인 태그 이름 초기화
      processingTagIdsRef.current.clear(); // 처리 중인 태그 ID 초기화
      setTimeout(() => {
        inputRef.current?.focus();
      }, 0);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isOpen]); // existingTags를 의존성 배열에서 제거하여 existingTags 변경 시 selectedTags가 재설정되지 않도록 함

  // 외부 클릭 감지 (편집 팝업 닫기)
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      // 편집 팝업이 열려있고, 클릭한 요소가 편집 팝업 내부가 아니고, 편집 버튼도 아닐 때만 닫기
      if (
        editPopupRef.current &&
        !editPopupRef.current.contains(event.target as Node) &&
        !(event.target as HTMLElement).closest('button[data-edit-button]')
      ) {
        setEditingTag(null);
        setTagNameEdit('');
        setEditPopupPosition(null);
      }
    };

    if (editingTag && editPopupPosition) {
      // 약간의 지연을 두어 현재 클릭 이벤트가 처리된 후에 리스너 추가
      setTimeout(() => {
        document.addEventListener('mousedown', handleClickOutside);
      }, 0);
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [editingTag, editPopupPosition]);

  const handleTagToggle = useCallback(
    async (tag: TEvidenceTag) => {
      // 이미 처리 중이면 중복 호출 방지 (전체 처리 중 또는 해당 태그 처리 중)
      if (isProcessingRef.current || processingTagIdsRef.current.has(tag.tag_set_id)) {
        return;
      }

      // 해당 태그 처리 시작 플래그 설정
      processingTagIdsRef.current.add(tag.tag_set_id);
      isProcessingRef.current = true;

      // 현재 선택된 태그 상태 확인 (동기적으로)
      let currentIsSelected = false;
      let currentSelectedTags: TEvidenceTag[] = [];

      setSelectedTags((prevSelectedTags) => {
        currentSelectedTags = prevSelectedTags;
        currentIsSelected = prevSelectedTags.some((t) => t.tag_set_id === tag.tag_set_id);
        return prevSelectedTags; // 일단 상태 변경 없음
      });

      // 상태 확인 후 비동기 작업 수행
      if (currentIsSelected) {
        // 태그 해제
        const newSelectedTags = currentSelectedTags.filter((t) => t.tag_set_id !== tag.tag_set_id);
        setSelectedTags(newSelectedTags);

        // existingTags에 있으면 즉시 할당 삭제 API 호출
        if (existingTags.some((et) => et.tag_set_id === tag.tag_set_id)) {
          (async () => {
            try {
              // existingTags에서 해당 태그를 찾아 tag_id 가져오기
              const existingTag = existingTags.find((et) => et.tag_set_id === tag.tag_set_id);
              const tagIdToDelete = existingTag?.tag_id;

              let deleteResponse;
              if (tagIdToDelete) {
                deleteResponse = await onDeleteAssignEvidenceTag({
                  tag_id: tagIdToDelete, // tag_id를 전달
                });
              } else {
                // tag_id가 없으면 tag_set_id 사용 (fallback)
                deleteResponse = await onDeleteAssignEvidenceTag({
                  tag_id: tag.tag_set_id,
                });
              }

              // API 호출이 성공한 경우에만 업데이트
              if (deleteResponse?.isSuccess) {
                // 태그 목록 리패치 (완료 대기)
                await refetchListTags();

                // 증거 목록 즉시 업데이트
                onTagUpdate();

                // 리스트 업데이트가 완료된 후 deletedTagIds에서 제거하여 태그 목록에 다시 나타나도록 함
                // 약간의 지연을 두어 실제 리스트 업데이트가 완료되도록 함
                setTimeout(() => {
                  setDeletedTagIds((prev) => {
                    const newSet = new Set(prev);
                    newSet.delete(tag.tag_set_id);
                    return newSet;
                  });
                }, 300);
              } else {
                // 삭제 실패 시 선택 상태 복구
                setSelectedTags((prev) => [...prev, tag]);
                onMessageToast({
                  message: deleteResponse?.message || '태그 삭제에 실패했습니다.',
                  icon: <IoMdSend className='h-5 w-5 text-red-500' />,
                });
              }
            } catch (error) {
              console.error('태그 할당 삭제 실패:', error);
              // 실패 시 선택 상태 복구
              setSelectedTags((prev) => [...prev, tag]);
              onMessageToast({
                message: '태그 삭제 중 오류가 발생했습니다.',
                icon: <IoMdSend className='h-5 w-5 text-red-500' />,
              });
            } finally {
              // 처리 완료 후 플래그 해제
              processingTagIdsRef.current.delete(tag.tag_set_id);
              if (processingTagIdsRef.current.size === 0) {
                isProcessingRef.current = false;
              }
            }
          })();
        } else {
          // existingTags에 없으면 플래그만 해제
          processingTagIdsRef.current.delete(tag.tag_set_id);
          if (processingTagIdsRef.current.size === 0) {
            isProcessingRef.current = false;
          }
        }
      } else {
        // 중복 체크: 이미 선택된 태그인지 다시 확인
        const alreadyExists = currentSelectedTags.some((t) => t.tag_set_id === tag.tag_set_id);
        if (alreadyExists) {
          // 중복이면 플래그 해제
          processingTagIdsRef.current.delete(tag.tag_set_id);
          if (processingTagIdsRef.current.size === 0) {
            isProcessingRef.current = false;
          }
          onMessageToast({
            message: '이미 추가된 태그입니다.',
            icon: <IoMdSend className='h-5 w-5 text-yellow-500' />,
          });
          return;
        }

        // 태그 선택 - 기존 태그 + 새로 선택한 태그 모두 포함해서 할당
        const newSelectedTags = [...currentSelectedTags, tag];
        setSelectedTags(newSelectedTags);

        // 비동기 작업 시작
        (async () => {
          try {
            // 기존 태그의 tag_set_id와 새로 선택한 태그의 tag_set_id를 모두 포함한 배열 생성
            const existingTagSetIds = existingTags.map((et) => et.tag_set_id);
            const newTagSetIds = newSelectedTags.map((t) => t.tag_set_id);
            // 중복 제거하여 모든 tag_set_id를 배열로 추출
            const allTagSetIds = Array.from(new Set([...existingTagSetIds, ...newTagSetIds]));

            console.log('태그 할당 시작:', { evidenceId, projectId, tags: allTagSetIds });
            const response = await onAssignEvidenceTag({
              evidence_id: evidenceId,
              project_id: projectId,
              tags: allTagSetIds, // 기존 태그 + 새 태그 모두 포함한 배열로 한 번에 할당
            });
            console.log('태그 할당 응답:', response);

            // 응답 확인
            if (!response?.isSuccess) {
              // 중복 키 오류인 경우는 이미 처리되었으므로 무시
              if (response?.message?.includes('이미 할당')) {
                console.log('태그가 이미 할당되어 있습니다.');
              } else {
                // 다른 오류인 경우에만 에러 처리
                console.error('태그 할당 실패:', response);
                throw new Error(response?.message || '태그 할당에 실패했습니다.');
              }
            } else {
              console.log('태그 할당 성공');
            }

            // 증거 목록 즉시 업데이트 (onTagUpdate가 리패치를 트리거할 수 있음)
            onTagUpdate();

            // 태그 목록 리패치 (완료 대기) - onTagUpdate 후에만 호출
            await refetchListTags();
          } catch (error) {
            console.error('태그 할당 실패:', error);
            // 실패 시 선택 상태 복구
            setSelectedTags((prev) => prev.filter((t) => t.tag_set_id !== tag.tag_set_id));
          } finally {
            // 처리 완료 후 플래그 해제
            processingTagIdsRef.current.delete(tag.tag_set_id);
            if (processingTagIdsRef.current.size === 0) {
              isProcessingRef.current = false;
            }
          }
        })();
      }

      setInputValue(''); // 입력값 초기화
    },
    [existingTags, onAssignEvidenceTag, onDeleteAssignEvidenceTag, evidenceId, projectId, onTagUpdate, refetchListTags],
  );

  const handleCreateTag = useCallback(
    async (tagNameToCreate?: string) => {
      const nameToUse = tagNameToCreate || tagName;
      const normalizedName = nameToUse.trim().toLowerCase();

      if (!normalizedName) return;

      // 이미 생성 중이면 중복 호출 방지 (ref, state, 태그 이름 모두 체크)
      if (isCreating || isProcessingRef.current || creatingTagNameRef.current === normalizedName) {
        return;
      }

      // 이미 선택된 태그인지 확인 (selectedTags에서 확인)
      const isAlreadySelected = selectedTags.some((tag) => tag.tag_name.toLowerCase() === nameToUse.trim().toLowerCase());
      if (isAlreadySelected) {
        onMessageToast({
          message: '이미 추가된 태그입니다.',
          icon: <IoMdSend className='h-5 w-5 text-yellow-500' />,
        });
        return;
      }

      // projectTags에 이미 존재하는 태그인지 확인
      const existingProjectTag = projectTags.find((tag) => tag.tag_name.toLowerCase() === nameToUse.trim().toLowerCase());
      if (existingProjectTag) {
        // 이미 프로젝트에 존재하는 태그이므로 선택만 하기
        // 함수형 업데이트로 중복 체크 강화
        const isSelected = selectedTags.some((t) => t.tag_set_id === existingProjectTag.tag_set_id);
        if (isSelected) {
          onMessageToast({
            message: '이미 추가된 태그입니다.',
            icon: <IoMdSend className='h-5 w-5 text-yellow-500' />,
          });
          setInputValue('');
          return;
        }
        // 중복이 아니면 handleTagToggle 호출
        handleTagToggle(existingProjectTag);
        return;
      }

      // 생성 중 플래그 설정 (ref, state, 태그 이름 모두 설정)
      isProcessingRef.current = true;
      setIsCreating(true);
      creatingTagNameRef.current = normalizedName;

      try {
        // 태그 생성 (/tag-sets/create)
        const response = await onCreateEvidenceTag({
          project_id: projectId,
          tag_name: nameToUse.trim(),
          color: DEFAULT_TAG_COLOR,
        });

        if (response?.isSuccess) {
          // 생성된 태그를 자동으로 선택 (중복 체크 포함)
          // 태그 목록을 먼저 리패치하여 새로 생성된 태그를 찾을 수 있도록 함
          await refetchListTags();

          const createdTagName = nameToUse.trim().toLowerCase();

          // 약간의 지연을 두어 projectTags가 업데이트되도록 함
          setTimeout(() => {
            // projectTags에서 새로 생성된 태그 찾기
            const createdTag = projectTags.find(
              (tag) => tag.tag_name.toLowerCase() === createdTagName && !selectedTags.some((st) => st.tag_set_id === tag.tag_set_id),
            );

            if (createdTag) {
              // 중복 체크: 이미 선택된 태그인지 확인
              setSelectedTags((prevSelectedTags) => {
                const isTagAlreadySelected = prevSelectedTags.some((t) => t.tag_set_id === createdTag.tag_set_id);
                if (isTagAlreadySelected) {
                  return prevSelectedTags; // 이미 선택되어 있으면 상태 변경 없음
                }

                // 태그 선택 - 기존 태그 + 새로 생성한 태그 모두 포함해서 할당
                const newSelectedTags = [...prevSelectedTags, createdTag];

                // 비동기 작업 시작 (태그 할당)
                (async () => {
                  try {
                    // 기존 태그의 tag_set_id와 새로 생성한 태그의 tag_set_id를 모두 포함한 배열 생성
                    const existingTagSetIds = existingTags.map((et) => et.tag_set_id);
                    const newTagSetIds = newSelectedTags.map((t) => t.tag_set_id);
                    // 중복 제거하여 모든 tag_set_id를 배열로 추출
                    const allTagSetIds = Array.from(new Set([...existingTagSetIds, ...newTagSetIds]));

                    const assignResponse = await onAssignEvidenceTag({
                      evidence_id: evidenceId,
                      project_id: projectId,
                      tags: allTagSetIds, // 기존 태그 + 새 태그 모두 포함한 배열로 한 번에 할당
                    });

                    if (!assignResponse?.isSuccess) {
                      // 할당 실패 시 선택 상태 복구
                      setSelectedTags((prev) => prev.filter((t) => t.tag_set_id !== createdTag.tag_set_id));
                      if (!assignResponse?.message?.includes('이미 할당')) {
                        onMessageToast({
                          message: assignResponse?.message || '태그 할당에 실패했습니다.',
                          icon: <IoMdSend className='h-5 w-5 text-red-500' />,
                        });
                      }
                    } else {
                      // 태그 목록은 이미 handleCreateTag에서 리패치했으므로 여기서는 호출하지 않음
                      // 증거 목록 즉시 업데이트
                      onTagUpdate();
                    }
                  } catch (error) {
                    console.error('태그 할당 실패:', error);
                    // 실패 시 선택 상태 복구
                    setSelectedTags((prev) => prev.filter((t) => t.tag_set_id !== createdTag.tag_set_id));
                  }
                })();

                return newSelectedTags;
              });
            }
          }, 100);

          // 인풋 클리어
          setTagName('');
          setInputValue('');

          onMessageToast({
            message: '태그가 생성되었습니다.',
            icon: <IoMdSend className='h-5 w-5 text-green-500' />,
          });
        } else {
          // 중복 키 오류 등의 경우
          const errorMessage = response?.message || '태그 생성에 실패했습니다.';
          onMessageToast({
            message:
              errorMessage.includes('duplicate') || errorMessage.includes('중복')
                ? '이미 존재하는 태그입니다. 목록에서 선택해주세요.'
                : errorMessage,
            icon: <IoMdSend className='h-5 w-5 text-yellow-500' />,
          });
          // 인풋 클리어
          setTagName('');
          setInputValue('');
          // 에러 시에는 리패치 불필요 (사용자가 다시 시도할 수 있음)
        }
      } catch (error) {
        console.error('태그 생성 실패:', error);
        onMessageToast({
          message: '태그 생성 중 오류가 발생했습니다.',
          icon: <IoMdSend className='h-5 w-5 text-red-500' />,
        });
      } finally {
        // 생성 완료 후 플래그 해제 (ref, state, 태그 이름 모두 해제)
        isProcessingRef.current = false;
        setIsCreating(false);
        creatingTagNameRef.current = null;
      }
    },
    [
      tagName,
      onCreateEvidenceTag,
      projectId,
      refetchListTags,
      selectedTags,
      projectTags,
      isCreating,
      handleTagToggle,
      existingTags,
      evidenceId,
      onAssignEvidenceTag,
      onTagUpdate,
    ],
  );

  // 모달 닫기 (할당 삭제는 호출하지 않음, 엑스 버튼에서만 호출)
  const handleClose = useCallback(() => {
    // 팝업이 닫힐 때 리스트를 강제로 업데이트하여 변경사항 반영
    onTagUpdate();
    onClose();
  }, [onClose, onTagUpdate]);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (popupRef.current && !popupRef.current.contains(event.target as Node)) {
        handleClose();
      }
    };

    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [isOpen, handleClose]);

  const handleTagRemove = useCallback(
    async (tagSetId: string) => {
      // 이미 처리 중이면 중복 호출 방지
      if (isProcessingRef.current) {
        return;
      }

      // 선택 해제할 태그 찾기
      const tagToRemove = selectedTags.find((t) => t.tag_set_id === tagSetId);

      if (!tagToRemove) {
        return;
      }

      // selectedTags에서 태그 제거
      const newSelectedTags = selectedTags.filter((t) => t.tag_set_id !== tagSetId);
      setSelectedTags(newSelectedTags);

      // existingTags에서 해당 태그를 찾아 tag_id 가져오기
      const existingTag = existingTags.find((et) => et.tag_set_id === tagToRemove.tag_set_id);
      const tagIdToDelete = existingTag?.tag_id;

      // existingTags에 있으면 (이미 할당된 태그) 삭제 API 호출
      if (existingTag && tagIdToDelete) {
        // 처리 중 플래그 설정
        isProcessingRef.current = true;

        try {
          // 삭제된 태그 ID를 즉시 추가하여 목록에서 제외 (플리커링 방지)
          setDeletedTagIds((prev) => new Set(prev).add(tagToRemove.tag_set_id));

          // 증거에서 태그 할당 삭제 API 호출 (/tags/delete) - tag_id 사용
          const deleteResponse = await onDeleteAssignEvidenceTag({
            tag_id: tagIdToDelete, // tag_id를 전달
          });

          // API 호출이 성공한 경우에만 업데이트
          if (deleteResponse?.isSuccess) {
            // 태그 목록 다시 불러오기 (완료 대기)
            await refetchListTags();

            // 증거 목록 즉시 업데이트
            onTagUpdate();

            // 리스트 업데이트가 완료된 후 deletedTagIds에서 제거하여 태그 목록에 다시 나타나도록 함
            // 약간의 지연을 두어 실제 리스트 업데이트가 완료되도록 함
            setTimeout(() => {
              setDeletedTagIds((prev) => {
                const newSet = new Set(prev);
                newSet.delete(tagToRemove.tag_set_id);
                return newSet;
              });
            }, 300);
          } else {
            // 삭제 실패 시 선택 상태 복구
            setSelectedTags((prev) => [...prev, tagToRemove]);
            setDeletedTagIds((prev) => {
              const newSet = new Set(prev);
              newSet.delete(tagToRemove.tag_set_id);
              return newSet;
            });
            onMessageToast({
              message: deleteResponse?.message || '태그 삭제에 실패했습니다.',
              icon: <IoMdSend className='h-5 w-5 text-red-500' />,
            });
          }
        } catch (error) {
          console.error('태그 할당 삭제 실패:', error);
          // 삭제 실패 시 선택 상태 복구
          setSelectedTags((prev) => [...prev, tagToRemove]);
          setDeletedTagIds((prev) => {
            const newSet = new Set(prev);
            newSet.delete(tagToRemove.tag_set_id);
            return newSet;
          });
          // 삭제 실패 시에도 태그 목록 리패치 시도
          try {
            await refetchListTags();
          } catch (refetchError) {
            console.error('태그 목록 리패치 실패:', refetchError);
          }
          onMessageToast({
            message: '태그 삭제 중 오류가 발생했습니다.',
            icon: <IoMdSend className='h-5 w-5 text-red-500' />,
          });
        } finally {
          // 처리 완료 후 플래그 해제
          isProcessingRef.current = false;
        }
      } else {
        // existingTags에 없는 경우 (새로 선택한 태그이거나 아직 할당되지 않은 태그)
        // 태그 목록과 증거 목록을 리패치하여 최신 상태로 업데이트
        await refetchListTags();
        // 증거 목록 즉시 업데이트 (새로 선택한 태그가 실제로 할당되었는지 확인)
        onTagUpdate();
      }
    },
    [selectedTags, existingTags, onDeleteAssignEvidenceTag, onTagUpdate, refetchListTags],
  );

  const handleInputKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Backspace' && inputValue === '' && selectedTags.length > 0) {
      const lastTag = selectedTags[selectedTags.length - 1];
      handleTagRemove(lastTag.tag_set_id);
    }
    if (e.key === 'Enter' && inputValue.trim()) {
      e.preventDefault();

      const normalizedInput = inputValue.trim().toLowerCase();

      // 이미 처리 중이면 중복 호출 방지 (ref, state, 태그 이름 모두 체크)
      if (isProcessingRef.current || isCreating || creatingTagNameRef.current === normalizedInput) {
        return;
      }

      // 입력된 값으로 태그 검색
      const matchedTag = projectTags.find((tag) => tag.tag_name.toLowerCase() === normalizedInput);
      if (matchedTag) {
        // 기존 태그 선택 - 중복 체크는 handleTagToggle에서 처리
        handleTagToggle(matchedTag);
      } else {
        // 새 태그 생성 - 중복 체크는 handleCreateTag에서 처리
        handleCreateTag(inputValue.trim());
      }
    }
  };

  const handleEditTag = (tag: TEvidenceTag, event: React.MouseEvent) => {
    event.stopPropagation();
    event.preventDefault();

    // 편집 버튼을 클릭한 경우, 태그 행 전체의 위치를 찾기
    const buttonElement = event.currentTarget as HTMLElement;
    // 편집 버튼의 부모 요소(태그 행) 찾기 - closest를 사용하여 가장 가까운 flex 컨테이너 찾기
    const tagRowElement = buttonElement.closest('div.flex.items-center.justify-between');

    // 편집 팝업의 예상 높이 (입력 필드 + 삭제 버튼)
    const editPopupHeight = 100; // 대략 100px

    if (tagRowElement) {
      // 태그 행의 위치 계산 (뷰포트 기준 - position: fixed이므로)
      const rowRect = tagRowElement.getBoundingClientRect();

      // 화면 하단까지의 여유 공간 계산
      const spaceBelow = window.innerHeight - rowRect.bottom;
      const spaceAbove = rowRect.top;

      let topPosition: number;

      // 아래쪽 공간이 부족하고 위쪽 공간이 충분하면 위로 표시
      if (spaceBelow < editPopupHeight && spaceAbove > editPopupHeight) {
        // 위로 표시 (태그 행 위에 팝업 높이만큼 뺀 위치)
        topPosition = rowRect.top - editPopupHeight - 4;
      } else {
        // 아래로 표시 (기본 동작)
        topPosition = rowRect.bottom + 4;
      }

      setEditPopupPosition({
        top: topPosition,
        left: rowRect.left, // 태그 행 왼쪽 정렬
      });
    } else {
      // fallback: 편집 버튼의 위치 사용
      const buttonRect = buttonElement.getBoundingClientRect();

      // 화면 하단까지의 여유 공간 계산
      const spaceBelow = window.innerHeight - buttonRect.bottom;
      const spaceAbove = buttonRect.top;

      let topPosition: number;

      // 아래쪽 공간이 부족하고 위쪽 공간이 충분하면 위로 표시
      if (spaceBelow < editPopupHeight && spaceAbove > editPopupHeight) {
        // 위로 표시
        topPosition = buttonRect.top - editPopupHeight - 4;
      } else {
        // 아래로 표시 (기본 동작)
        topPosition = buttonRect.bottom + 4;
      }

      setEditPopupPosition({
        top: topPosition,
        left: buttonRect.left,
      });
    }

    setEditingTag(tag);
    setTagNameEdit(tag.tag_name);
    setInputValue(''); // 편집 모드로 전환 시 입력값 초기화
  };

  const handleSaveEdit = async () => {
    if (!editingTag || !tagNameEdit.trim()) return;

    try {
      const response = await onUpdateEvidenceTag({
        tag_set_id: editingTag.tag_set_id,
        tag_name: tagNameEdit.trim(),
        color: editingTag.color, // 기존 색상 유지
      });

      if (response?.isSuccess) {
        // 선택된 태그 목록 업데이트
        setSelectedTags(selectedTags.map((t) => (t.tag_set_id === editingTag.tag_set_id ? { ...t, tag_name: tagNameEdit.trim() } : t)));
        onMessageToast({
          message: '태그가 수정되었습니다.',
          icon: <IoMdSend className='h-5 w-5 text-green-500' />,
        });
        setEditingTag(null);
        setTagNameEdit('');
        setEditPopupPosition(null);
        // 태그 목록 다시 불러오기 (완료 대기)
        await refetchListTags();
        // 증거 목록 즉시 업데이트
        onTagUpdate();
      }
    } catch (error) {
      console.error('태그 수정 실패:', error);
    }
  };

  const handleDeleteTag = async () => {
    if (!editingTag) return;

    try {
      const response = await onDeleteEvidenceTag({
        tag_set_id: editingTag.tag_set_id,
      });

      if (response?.isSuccess) {
        // 선택된 태그 목록에서 제거
        setSelectedTags(selectedTags.filter((t) => t.tag_set_id !== editingTag.tag_set_id));
        onMessageToast({
          message: '태그가 삭제되었습니다.',
          icon: <IoMdSend className='h-5 w-5 text-green-500' />,
        });
        setEditingTag(null);
        setTagNameEdit('');
        setEditPopupPosition(null);
        // 태그 목록 다시 불러오기 (완료 대기)
        await refetchListTags();
        // 증거 목록 즉시 업데이트
        onTagUpdate();
      }
    } catch (error) {
      console.error('태그 삭제 실패:', error);
    }
  };

  // 드래그 앤 드롭 핸들러
  const handleDragEnd = useCallback(
    async (result: DropResult) => {
      if (!result.destination || result.source.index === result.destination.index) {
        return;
      }

      // filteredTags는 선택되지 않은 태그만 포함하므로, 전체 태그 목록에서 순서 변경
      const allTags = projectTags.filter(
        (tag) => !deletedTagIds.has(tag.tag_set_id) && !selectedTags.some((st) => st.tag_set_id === tag.tag_set_id),
      );

      const reorderedTags = Array.from(allTags);
      const [movedTag] = reorderedTags.splice(result.source.index, 1);
      reorderedTags.splice(result.destination.index, 0, movedTag);

      // 새로운 sort_order 계산
      // 타입 정의가 튜플이지만 실제로는 배열을 받으므로 타입 단언 사용
      const sortOrderData = reorderedTags.map((tag, index) => ({
        tag_set_id: tag.tag_set_id,
        sort_order: index + 1,
      })) as unknown as [{ tag_set_id: string; sort_order: number }];

      try {
        const response = await onUpdateEvidenceTagOrder({
          project_id: projectId,
          sort_order_data: sortOrderData,
        });

        if (response.success) {
          onMessageToast({
            message: '태그 순서가 변경되었습니다.',
            icon: <IoMdSend className='h-5 w-5 text-green-500' />,
          });
          // 태그 목록 재조회
          await refetchListTags();
        } else {
          onMessageToast({
            message: response.message || '태그 순서 변경에 실패했습니다.',
            icon: <IoMdSend className='h-5 w-5 text-red-500' />,
          });
        }
      } catch (error) {
        console.error('태그 순서 변경 실패:', error);
        onMessageToast({
          message: '태그 순서 변경 중 오류가 발생했습니다.',
          icon: <IoMdSend className='h-5 w-5 text-red-500' />,
        });
      }
    },
    [projectTags, deletedTagIds, selectedTags, projectId, onUpdateEvidenceTagOrder, refetchListTags],
  );

  if (!isOpen) return null;

  return ReactDOM.createPortal(
    <div
      ref={popupRef}
      className='absolute z-[9999] w-[280px] rounded-[8px] bg-white xl:w-[360px]'
      style={{
        top: `${position.top}px`,
        left: `${position.left}px`,
        boxShadow: '2px 2px 8px 0 rgba(0, 0, 0, 0.15)',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'flex-start',
      }}
      onClick={(e) => e.stopPropagation()}
    >
      {/* 상단: 선택된 태그 입력 영역 */}
      <div className='w-full border-b border-[#E5E5E5]'>
        <div className='flex max-h-[250px] min-h-[40px] flex-wrap items-center gap-1 overflow-y-auto rounded-[6px] px-[10px] py-[10px]'>
          {selectedTags.map((tag) => (
            <div
              key={tag.tag_set_id}
              className='flex h-[28px] items-center gap-1 truncate rounded-[4px] px-2 text-[14px]'
              style={{ backgroundColor: tag.color, color: '#252525' }}
            >
              <span className='max-w-[180px] truncate xl:max-w-[250px]'>{tag.tag_name}</span>
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  handleTagRemove(tag.tag_set_id);
                }}
                className='ml-1 flex h-3 w-3 items-center justify-center rounded-full bg-white/20 hover:bg-white/30'
              >
                <FiX className='h-2 w-2' />
              </button>
            </div>
          ))}
          <input
            ref={inputRef}
            type='text'
            value={inputValue}
            onChange={(e) => setInputValue(e.target.value)}
            onKeyDown={handleInputKeyDown}
            placeholder={selectedTags.length === 0 ? '태그를 선택하세요' : ''}
            className='flex-1 border-none bg-transparent text-[12px] outline-none placeholder:text-[#888] focus:outline-none focus:ring-0'
          />
        </div>
      </div>

      {/* 하단: 태그 선택 또는 생성 */}
      <div className='w-full p-3'>
        <div className='mb-3 text-[12px] text-[#666]'>태그 선택 또는 생성</div>

        {/* 태그 목록 */}
        <div className='scrollbar-thin scrollbar-thumb-gray-300 scrollbar-track-gray-100 hover:scrollbar-thumb-gray-400 max-h-[250px] space-y-2 overflow-y-auto'>
          <DragDropContext onDragEnd={handleDragEnd}>
            <Droppable droppableId='tag-list'>
              {(droppableProvided) => (
                <div ref={droppableProvided.innerRef} {...droppableProvided.droppableProps}>
                  {/* 1. 등록된 태그 목록 (드래그 핸들 + pill 형태 태그 + 편집 버튼) */}
                  {filteredTags.length > 0 &&
                    filteredTags.map((tag, index) => {
                      // tag_set_id로 비교
                      const isSelected = selectedTags.some((t) => t.tag_set_id === tag.tag_set_id);
                      return (
                        <Draggable key={tag.tag_set_id} draggableId={tag.tag_set_id} index={index}>
                          {(provided, snapshot) => (
                            <div
                              ref={provided.innerRef}
                              {...provided.draggableProps}
                              className={`mb-2 flex h-[28px] items-center justify-between gap-2 rounded-[4px] hover:bg-[#F5F5F5] ${
                                snapshot.isDragging ? 'bg-[#E5E5E5]' : ''
                              }`}
                              onClick={(e) => {
                                // 편집 버튼 영역이 아닐 때만 태그 선택
                                if (!(e.target as HTMLElement).closest('button')) {
                                  e.stopPropagation();
                                  e.preventDefault();
                                  // 이미 처리 중이면 중복 호출 방지
                                  if (!isProcessingRef.current && !processingTagIdsRef.current.has(tag.tag_set_id)) {
                                    handleTagToggle(tag);
                                  }
                                }
                              }}
                            >
                              <div className='flex flex-1 items-center gap-2'>
                                {/* 드래그 핸들 */}
                                <div {...provided.dragHandleProps} className='cursor-move text-[#888]'>
                                  <MdDragIndicator className='h-4 w-4' />
                                </div>

                                {/* 태그 이름 (글자 크기만큼만 배경) */}
                                <div
                                  className={`inline-block max-w-[180px] truncate rounded-[4px] px-2 py-1 text-[14px] xl:max-w-[250px] ${isSelected ? 'ring-2 ring-[#0050B3]' : ''}`}
                                  style={{ backgroundColor: tag.color, color: '#252525' }}
                                >
                                  <span className='max-w-[180px] truncate xl:max-w-[250px]'>{tag.tag_name}</span>
                                </div>
                              </div>

                              {/* 편집 버튼 */}
                              <button
                                data-edit-button
                                onClick={(e) => {
                                  e.stopPropagation();
                                  e.preventDefault();
                                  handleEditTag(tag, e);
                                }}
                                onMouseDown={(e) => {
                                  e.stopPropagation();
                                  e.preventDefault();
                                }}
                                className='shrink-0 rounded-[4px] px-2 py-1 text-[11px] text-[#666] hover:bg-[#E5E5E5]'
                              >
                                편집
                              </button>
                            </div>
                          )}
                        </Draggable>
                      );
                    })}
                  {droppableProvided.placeholder}
                </div>
              )}
            </Droppable>
          </DragDropContext>

          {/* 2. 타이핑 중 새 태그 생성 옵션 (신규 태그임을 알려주는 텍스트만 표시) */}
          {canCreateNewTag && (
            <div className='rounded-[4px] px-2 py-2' style={{ backgroundColor: '#F7F8F8' }}>
              <div className='text-[12px] text-[#252525]'>생성 {inputValue.trim()}</div>
            </div>
          )}

          {/* 태그가 없을 때 */}
          {/*        {filteredTags.length === 0 && !canCreateNewTag && projectTags.length === 0 && (
            <div className='py-4 text-center text-[12px] text-[#888]'>태그를 생성해보세요.</div>
          )} */}
        </div>

        {/* 태그가 없을 때 입력창에서 태그 생성 안내 */}
        {/*  {projectTags.length === 0 && (
          <div className='mt-2 text-[11px] text-[#888]'>위 입력창에서 태그 이름을 입력하고 Enter를 누르면 생성됩니다.</div>
        )} */}
      </div>

      {/* 편집 팝업 */}
      {editingTag && editPopupPosition && (
        <div
          ref={editPopupRef}
          className='fixed z-[10000] w-[160px] rounded-[8px] bg-white xl:w-[200px]'
          style={{
            top: `${editPopupPosition.top}px`,
            left: `${editPopupPosition.left}px`,
            boxShadow: '2px 2px 8px 0 rgba(0, 0, 0, 0.15)',
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'flex-start',
          }}
          onClick={(e) => e.stopPropagation()}
        >
          {/* 입력 필드 */}
          <div className='w-full border-b border-[#E5E5E5] px-3 py-2'>
            <div className='relative'>
              <input
                type='text'
                value={tagNameEdit}
                onChange={(e) => setTagNameEdit(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter' && tagNameEdit.trim()) {
                    handleSaveEdit();
                  }
                  if (e.key === 'Escape') {
                    setEditingTag(null);
                    setTagNameEdit('');
                    setEditPopupPosition(null);
                  }
                }}
                placeholder='태그 이름을 입력하세요'
                className='h-[32px] w-full rounded-[4px] border border-[#0050B3] bg-white px-2 pr-8 text-[12px] focus:border-[#0050B3] focus:outline-none'
                autoFocus
              />
              {tagNameEdit && (
                <button
                  onClick={() => {
                    setTagNameEdit('');
                  }}
                  className='absolute right-2 top-1/2 flex h-4 w-4 -translate-y-1/2 items-center justify-center rounded-full bg-[#E5E5E5] hover:bg-[#D5D5D5]'
                >
                  <FiX className='h-3 w-3 text-[#666]' />
                </button>
              )}
            </div>
          </div>

          {/* 삭제 버튼 */}
          <button onClick={handleDeleteTag} className='flex w-full items-center gap-2 px-3 py-2 text-[12px] text-[#666] hover:bg-[#F5F5F5]'>
            <BsTrash className='h-4 w-4 text-[#888]' />
            <span>삭제</span>
          </button>
        </div>
      )}
    </div>,
    document.body,
  );
};
