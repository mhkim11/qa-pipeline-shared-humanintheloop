import { JSX, useState, useMemo, useEffect } from 'react';

import { DragDropContext, Droppable, Draggable } from '@hello-pangea/dnd';
import { useQueryClient } from '@tanstack/react-query';
import { MdDragIndicator } from 'react-icons/md';

import { ADMIN_AI_QUERY_KEY, fetchAIToggleAnalysis, fetchDeleteCommonCategory, fetchDeployProjectTemplate } from '@/apis/admin-ai-api';
import AIAnalysisAdminDownMenuTable from '@/components/evidence/admin/table/ai/ai-analysis-admin-menu-down-table';
import AIMenuModal from '@/components/evidence/admin/table/ai/ai-menu-modal';
import AIAnalysisToggleModal from '@/components/evidence/admin/table/ai/modal/ai-analysis-toggle-modal';
import AIMenuActionModal from '@/components/evidence/admin/table/ai/modal/ai-menu-action-modal';
import {
  Table,
  TableBox,
  TableCell,
  TableRow,
  HeaderWrapper,
  HeaderTitle,
} from '@/components/evidence/admin/table/user-admin-table.styled';
import { EvidencePagination } from '@/components/evidence/pagination/evidence-pagination';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Switch } from '@/components/ui/switch';
import { onMessageToast } from '@/components/utils';
import {
  useGetCommonCategoryQuery,
  useCreateCommonCategoryMutation,
  useEditCommonCategoryMutation,
  useChangeCommonCategoryOrderMutation,
  useGetSettingsQuery,
  SETTINGS_QUERY_KEY,
} from '@/query/admin-ai-query';
// AI분석메뉴 데이터 타입 정의
interface IAIAnalysisMenuItem {
  id: string;
  sequence: number;
  dataList: string;
  registrationDate: string;
  isPublic: boolean;
}

const AIAnalysisAdminUpMenuTable = (): JSX.Element => {
  // !페이지네이션관련
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(50);

  // 선택된 메뉴 상태 (하위 테이블 표시용)
  const [selectedMenu, setSelectedMenu] = useState<IAIAnalysisMenuItem | null>(null);

  // Query client
  const queryClient = useQueryClient();

  // API 데이터 조회
  const { data: categoryData, isLoading, error } = useGetCommonCategoryQuery();

  // 뮤테이션 훅들
  const createCategoryMutation = useCreateCommonCategoryMutation();
  const editCategoryMutation = useEditCommonCategoryMutation();

  // API 데이터를 IAIAnalysisMenuItem 형식으로 변환
  const aiMenuItems: IAIAnalysisMenuItem[] = useMemo(() => {
    if (!categoryData?.data?.templates) return [];

    const templatesArray = Array.isArray(categoryData.data.templates) ? categoryData.data.templates : [];

    return templatesArray.map((item: any, index: number) => ({
      id: item.category_template_id || `ai-menu-${index + 1}`,
      sequence: index + 1,
      dataList: item.category_nm || `카테고리 ${index + 1}`,
      registrationDate: item.createdAt ? new Date(item.createdAt).toLocaleDateString('ko-KR') : '2025.01.15',
      isPublic: item.is_visible === 'true' || item.is_visible === true || item.isEnabled === 'true' || item.isEnabled === true,
    }));
  }, [categoryData]);

  // 모달 상태
  const [isRegisterModalOpen, setIsRegisterModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [isToggleModalOpen, setIsToggleModalOpen] = useState(false);
  const [isRegistering, setIsRegistering] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [isToggling, setIsToggling] = useState(false);
  const [editingItem, setEditingItem] = useState<IAIAnalysisMenuItem | null>(null);

  // 액션 모달 상태
  const [isActionModalOpen, setIsActionModalOpen] = useState(false);
  const [isActionLoading, setIsActionLoading] = useState(false);
  const [actionType, setActionType] = useState<'public' | 'private' | 'delete'>('delete');
  const [actionTargetItem, setActionTargetItem] = useState<IAIAnalysisMenuItem | null>(null);

  // 체크박스 선택 상태
  const [selectedItems, setSelectedItems] = useState<string[]>([]);

  // AI 분석 전체 활성화 상태
  const [isAIAnalysisEnabled, setIsAIAnalysisEnabled] = useState(false);
  const [pendingToggleState, setPendingToggleState] = useState(false);

  // 설정 조회
  const { data: settingsData } = useGetSettingsQuery();

  // 설정 데이터가 로드되면 초기 상태 설정
  useEffect(() => {
    if (settingsData?.data?.ai_analysis !== undefined) {
      setIsAIAnalysisEnabled(settingsData.data.ai_analysis);
    }
  }, [settingsData]);

  // 드래그앤드랍 관련 상태
  const [showDragHandles, setShowDragHandles] = useState<string | null>(null);

  // 순서 변경 관련 상태
  const [pendingOrderChange, setPendingOrderChange] = useState<IAIAnalysisMenuItem[] | null>(null);
  const [isOrderChangeModalOpen, setIsOrderChangeModalOpen] = useState(false);

  // 순서 변경 뮤테이션
  const changeOrderMutation = useChangeCommonCategoryOrderMutation();

  // 메뉴명 클릭 핸들러 (하위 테이블 표시)
  const handleMenuClick = (item: IAIAnalysisMenuItem) => {
    setSelectedMenu(item);
  };

  // 뒤로가기 핸들러
  const handleBackToMain = () => {
    setSelectedMenu(null);
  };

  // 페이지 크기 변경 핸들러
  const handlePageSizeChange = (newPageSize: number) => {
    setPageSize(newPageSize);
    setCurrentPage(1); // 페이지 크기 변경 시 첫 페이지로
  };

  // 체크박스 선택 핸들러
  const handleSelectItem = (id: string) => {
    setSelectedItems((prev) => (prev.includes(id) ? prev.filter((item) => item !== id) : [...prev, id]));
  };

  // 전체 선택 핸들러
  const handleSelectAll = () => {
    if (selectedItems.length === aiMenuItems.length) {
      setSelectedItems([]);
    } else {
      setSelectedItems(aiMenuItems.map((item) => item.id));
    }
  };

  // 공개/비공개 토글 핸들러 (모달 표시)
  const handleTogglePublic = (item: IAIAnalysisMenuItem) => {
    setActionTargetItem(item);
    setActionType(item.isPublic ? 'private' : 'public');
    setIsActionModalOpen(true);
  };

  // !삭제 버튼 클릭 핸들러
  const handleDeleteClick = () => {
    if (selectedItems.length === 0) {
      onMessageToast({
        message: '삭제할 항목을 선택해주세요.',
      });
      return;
    }
    setActionType('delete');
    setIsActionModalOpen(true);
  };

  // 액션 확인 핸들러
  const handleActionConfirm = async () => {
    setIsActionLoading(true);
    try {
      if (actionType === 'delete') {
        // 선택된 여러 아이템들에 대해 순차적으로 삭제 API 호출
        console.log('삭제할 아이템들:', selectedItems);

        let successCount = 0;
        const totalCount = selectedItems.length;

        for (const itemId of selectedItems) {
          try {
            console.log('삭제 중인 아이템 ID:', itemId);

            const response = await fetchDeleteCommonCategory({
              category_template_id: itemId,
            });

            if (response.success) {
              successCount++;
              console.log(`삭제 성공: ${itemId}`);
            } else {
              console.error(`삭제 실패: ${itemId}`, response.message);
            }
          } catch (deleteError) {
            console.error(`삭제 중 오류 발생: ${itemId}`, deleteError);
          }
        }

        // 결과에 따른 메시지 표시
        if (successCount === totalCount) {
          onMessageToast({
            message: `${successCount}개 메뉴가 삭제되었습니다.`,
          });
        } else if (successCount > 0) {
          onMessageToast({
            message: `${successCount}개 메뉴 삭제 완료, ${totalCount - successCount}개 실패`,
          });
        } else {
          onMessageToast({
            message: '메뉴 삭제에 실패했습니다.',
          });
        }

        // 캐시 무효화하여 데이터 즉시 업데이트
        await queryClient.invalidateQueries({
          queryKey: [ADMIN_AI_QUERY_KEY.GET_COMMON_CATEGORY],
        });

        setSelectedItems([]);
      } else if (actionTargetItem) {
        console.log('토글 처리 시작:', actionTargetItem.dataList);
        console.log('토글 전 상태:', actionTargetItem.isPublic);
        console.log('토글 후 상태:', actionType);

        const isPublic = actionType === 'public';
        const requestData = {
          category_template_id: actionTargetItem.id, // 해당 스위치의 아이디값
          category_nm: actionTargetItem.dataList, // category_nm은 그대로
          isEnabled: isPublic ? 'true' : 'false', // 토글 상태에 따라 'true'/'false'
        };

        console.log('토글 요청 데이터:', requestData);

        const result = await editCategoryMutation.mutateAsync(requestData);
        console.log('토글 API 응답:', result);

        // 캐시 무효화하여 데이터 즉시 업데이트
        await queryClient.invalidateQueries({
          queryKey: [ADMIN_AI_QUERY_KEY.GET_COMMON_CATEGORY],
        });

        onMessageToast({
          message: `메뉴가 ${isPublic ? '공개' : '비공개'}로 변경되었습니다.`,
        });
      }
      setIsActionModalOpen(false);
      setActionTargetItem(null);
    } catch (err) {
      console.error('액션 처리 중 오류 발생:', err);
      console.error('에러 상세:', err);

      // 에러 발생 시 사용자에게 알림
      onMessageToast({
        message: '처리 중 오류가 발생했습니다. 다시 시도해주세요.',
      });
    } finally {
      setIsActionLoading(false);
    }
  };

  // 수정 버튼 클릭 핸들러
  const handleEdit = (item: IAIAnalysisMenuItem) => {
    setEditingItem(item);
    setIsEditModalOpen(true);
  };

  // 페이지 변경 핸들러
  const handlePageChange = (page: number) => {
    console.log('Changing to page:', page);
    setCurrentPage(page);
  };

  // 메뉴 등록 핸들러
  const handleMenuRegister = async (menuName: string) => {
    setIsRegistering(true);
    try {
      await createCategoryMutation.mutateAsync({
        category_nm: menuName,
        description: `${menuName} 카테고리`, // 기본 설명
      });

      onMessageToast({
        message: '메뉴가 등록되었습니다.',
      });
      setIsRegisterModalOpen(false);
    } catch (err) {
      console.error('메뉴 등록 중 오류 발생:', err);
    } finally {
      setIsRegistering(false);
    }
  };

  // 메뉴 수정 핸들러
  const handleMenuEdit = async (menuName: string) => {
    if (!editingItem) return;

    setIsEditing(true);
    try {
      const requestData = {
        category_template_id: editingItem.id,
        category_nm: menuName,
        isEnabled: editingItem.isPublic ? 'true' : 'false',
      };

      console.log('수정 요청 데이터:', requestData);

      await editCategoryMutation.mutateAsync(requestData);

      onMessageToast({
        message: '메뉴가 수정되었습니다.',
      });
      setIsEditModalOpen(false);
      setEditingItem(null);
    } catch (err) {
      console.error('메뉴 수정 중 오류 발생:', err);
      console.error('요청 데이터:', {
        category_template_id: editingItem.id,
        category_nm: menuName,
      });
    } finally {
      setIsEditing(false);
    }
  };

  // AI 분석 토글 스위치 클릭 핸들러
  const handleAIAnalysisToggle = (checked: boolean) => {
    setPendingToggleState(checked);
    setIsToggleModalOpen(true);
  };

  // AI 분석 토글 확인 핸들러
  const handleToggleConfirm = async () => {
    setIsToggling(true);
    try {
      console.log('AI 분석 상태 변경 시작:', pendingToggleState);

      // fetchAIToggleAnalysis API 호출
      const response = await fetchAIToggleAnalysis({
        ai_analysis: pendingToggleState,
      });

      console.log('AI 분석 토글 API 응답:', response);

      if (response.success) {
        setIsAIAnalysisEnabled(pendingToggleState);

        // 설정 캐시 무효화하여 헤더의 AI 버튼 상태도 즉시 업데이트
        await queryClient.invalidateQueries({
          queryKey: [SETTINGS_QUERY_KEY.GET_SETTINGS],
        });

        onMessageToast({
          message: `AI 분석이 ${pendingToggleState ? '활성화' : '비활성화'}되었습니다.`,
        });
      } else {
        throw new Error(response.message || 'AI 분석 상태 변경에 실패했습니다.');
      }

      setIsToggleModalOpen(false);
    } catch (toggleError) {
      console.error('AI 분석 상태 변경 중 오류 발생:', toggleError);
      onMessageToast({
        message: 'AI 분석 상태 변경 중 오류가 발생했습니다. 다시 시도해주세요.',
      });
    } finally {
      setIsToggling(false);
    }
  };

  // 드래그앤드랍 함수 - 모달 확인 후 변경
  const handleDragEnd = (result: any) => {
    if (!result.destination) return;

    // 같은 위치로 드롭한 경우 아무것도 하지 않음
    if (result.source.index === result.destination.index) return;

    const items = Array.from(aiMenuItems);
    const [reorderedItem] = items.splice(result.source.index, 1);
    items.splice(result.destination.index, 0, reorderedItem);

    // 순서 번호 재계산
    const updatedItems = items.map((item, index) => ({
      ...item,
      sequence: index + 1,
    }));

    console.log('드래그 앤 드롭 순서 변경 요청:', {
      드래그된아이템: reorderedItem.dataList,
      원래위치: result.source.index + 1,
      새위치: result.destination.index + 1,
      전체아이템수: updatedItems.length,
    });

    // 변경될 순서를 임시 저장하고 확인 모달 표시
    setPendingOrderChange(updatedItems);
    setIsOrderChangeModalOpen(true);
  };

  // 순서 변경 확인 핸들러
  const handleOrderChangeConfirm = async () => {
    if (!pendingOrderChange) return;

    setIsActionLoading(true);
    try {
      // 전체 아이템들의 새로운 순서를 배열로 한번에 전송
      const updatedTemplates = pendingOrderChange.map((item, index) => ({
        category_template_id: item.id,
        display_order: index + 1,
      }));

      console.log('순서 변경 API 호출 데이터:', updatedTemplates);

      // 배열 형태로 한번에 API 호출
      const response = await changeOrderMutation.mutateAsync({
        templates: updatedTemplates, // 전체 배열로 전달
      });

      if (response) {
        onMessageToast({
          message: '순서가 변경되었습니다.',
        });

        // 캐시 무효화하여 데이터 즉시 업데이트
        await queryClient.invalidateQueries({
          queryKey: [ADMIN_AI_QUERY_KEY.GET_COMMON_CATEGORY],
        });
      }
    } catch (dragError) {
      console.error('순서 변경 실패:', dragError);
      onMessageToast({
        message: '순서 변경 중 오류가 발생했습니다.',
      });
    } finally {
      setIsActionLoading(false);
      setIsOrderChangeModalOpen(false);
      setPendingOrderChange(null);
    }
  };

  // 순서 변경 취소 핸들러
  const handleOrderChangeCancel = () => {
    setIsOrderChangeModalOpen(false);
    setPendingOrderChange(null);
  };

  // !

  const totalPages = Math.ceil(aiMenuItems.length / pageSize);
  const startIndex = (currentPage - 1) * pageSize;
  const paginatedItems = aiMenuItems.slice(startIndex, startIndex + pageSize);
  // ! 프로젝트 배포
  const deployProjectTemplate = async () => {
    try {
      const response = await fetchDeployProjectTemplate();
      if (response.success) {
        onMessageToast({
          message: '성공적으로 반영되었습니다.',
        });
      } else {
        onMessageToast({
          message: '반영에 실패했습니다.',
        });
      }
    } catch (err) {
      console.error('배포 중 오류 발생:', err);
      onMessageToast({
        message: '배포 중 오류가 발생했습니다.',
      });
    }
  };
  // 하위 테이블이 선택되었을 때
  if (selectedMenu) {
    return <AIAnalysisAdminDownMenuTable selectedMenu={selectedMenu} onBackToMain={handleBackToMain} />;
  }

  // 에러 처리
  if (error) {
    return (
      <div className='w-full p-8 text-center'>
        <p className='text-red-500'>데이터를 불러오는 중 오류가 발생했습니다.</p>
        <p className='text-sm text-gray-500'>{error.message}</p>
      </div>
    );
  }

  return (
    <div className='w-full p-[20px]'>
      {/* 헤더 영역 */}
      <HeaderWrapper>
        <HeaderTitle>
          <div className='flex items-center justify-between'>
            <div className='flex items-center'>
              AI분석메뉴관리
              <Switch id='ai-analysis-toggle' className='ml-2' checked={isAIAnalysisEnabled} onCheckedChange={handleAIAnalysisToggle} />
            </div>
            <div className='flex items-center'>
              <button
                onClick={handleDeleteClick}
                className={`h-[40px] w-[57px] rounded rounded-[8px] text-sm transition-colors ${
                  selectedItems.length > 0
                    ? 'bg-red-500 text-white hover:bg-red-600'
                    : 'bg-[#F3F3F3] text-[#BABABA] hover:bg-red-500 hover:text-white'
                }`}
              >
                삭제
              </button>
              <button
                onClick={() => setIsRegisterModalOpen(true)}
                className='ml-[16px] h-[40px] w-[84px] rounded rounded-[8px] bg-[#004AA4] text-sm text-white hover:bg-blue-600'
              >
                메뉴 등록
              </button>
              <button
                onClick={deployProjectTemplate}
                className='ml-[16px] h-[40px] w-[106px] rounded rounded-[8px] bg-[#004AA4] text-sm text-white hover:bg-blue-600'
              >
                시스템에 반영
              </button>
            </div>
          </div>
        </HeaderTitle>
      </HeaderWrapper>

      {/* 테이블 영역 */}
      <DragDropContext onDragEnd={handleDragEnd}>
        <TableBox>
          <Table style={{ width: '100%', tableLayout: 'fixed' }}>
            <TableRow>
              <TableCell className='w-[50px] bg-[#f5f5f5] text-center font-bold' style={{ width: '50px' }}>
                <input
                  type='checkbox'
                  className='ml-[20px] h-[16px] w-[16px]'
                  checked={selectedItems.length === aiMenuItems.length && aiMenuItems.length > 0}
                  onChange={handleSelectAll}
                />
              </TableCell>
              <TableCell className='w-[80px] bg-[#f5f5f5] text-center font-bold' style={{ width: '80px' }}>
                순번
              </TableCell>
              <TableCell className='w-[400px] bg-[#f5f5f5] text-center font-bold' style={{ width: '400px' }}>
                메뉴명
              </TableCell>
              <TableCell className='w-[200px] bg-[#f5f5f5] text-center font-bold' style={{ width: '200px' }}>
                등록일
              </TableCell>
              <TableCell className='w-[100px] bg-[#f5f5f5] text-center font-bold' style={{ width: '100px' }}>
                수정
              </TableCell>
              <TableCell className='w-[120px] bg-[#f5f5f5] text-center font-bold' style={{ width: '120px' }}>
                공개 여부
              </TableCell>
            </TableRow>
            <Droppable droppableId='ai-menu-table'>
              {(provided) => (
                <tbody {...provided.droppableProps} ref={provided.innerRef}>
                  {isLoading ? (
                    <TableRow>
                      <TableCell colSpan={6} className='text-center'>
                        로딩중...
                      </TableCell>
                    </TableRow>
                  ) : !paginatedItems.length ? (
                    <TableRow>
                      <TableCell colSpan={6} className='text-center'>
                        AI분석메뉴 데이터가 없습니다.
                      </TableCell>
                    </TableRow>
                  ) : (
                    paginatedItems.map((item, index) => (
                      <Draggable key={item.id} draggableId={item.id} index={index}>
                        {(dragProvided) => (
                          <TableRow
                            key={item.id}
                            ref={dragProvided.innerRef}
                            {...dragProvided.draggableProps}
                            style={{
                              ...dragProvided.draggableProps.style,
                              width: '100%',
                              display: 'table-row',
                              tableLayout: 'fixed',
                            }}
                            className='group'
                            onMouseEnter={() => setShowDragHandles(item.id)}
                            onMouseLeave={() => setShowDragHandles(null)}
                          >
                            <TableCell className='relative text-center' style={{ width: '100px' }}>
                              <div
                                {...dragProvided.dragHandleProps}
                                className={`absolute left-2 top-1/2 -translate-y-1/2 transition-opacity duration-200 ${
                                  showDragHandles === item.id ? 'opacity-100' : 'opacity-0 group-hover:opacity-100'
                                }`}
                                onClick={(e) => e.stopPropagation()}
                              >
                                <MdDragIndicator className='cursor-move text-xl text-gray-400 hover:text-gray-600' />
                              </div>
                              <input
                                type='checkbox'
                                className='ml-6 h-[16px] w-[16px]'
                                checked={selectedItems.includes(item.id)}
                                onChange={() => handleSelectItem(item.id)}
                                onClick={(e) => e.stopPropagation()}
                              />
                            </TableCell>
                            <TableCell className='text-center' style={{ width: '80px' }}>
                              {item.sequence}
                            </TableCell>
                            <TableCell className='text-center' style={{ width: '400px' }}>
                              <button
                                onClick={() => handleMenuClick(item)}
                                className='cursor-pointer text-blue-600 hover:text-blue-800 hover:underline'
                              >
                                {item.dataList}
                              </button>
                            </TableCell>
                            <TableCell className='text-center' style={{ width: '200px' }}>
                              {item.registrationDate}
                            </TableCell>
                            <TableCell className='text-center' style={{ width: '100px' }}>
                              <button
                                onClick={() => handleEdit(item)}
                                className='h-[32px] w-[49px] rounded-[6px] border border-[#E5E5E5] bg-white text-sm text-[#212121] hover:bg-gray-50'
                              >
                                수정
                              </button>
                            </TableCell>
                            <TableCell className='text-center' style={{ width: '120px' }}>
                              <Switch
                                id={`toggle-${item.id}`}
                                className='ml-2'
                                checked={item.isPublic}
                                onCheckedChange={() => handleTogglePublic(item)}
                              />
                            </TableCell>
                          </TableRow>
                        )}
                      </Draggable>
                    ))
                  )}
                  {provided.placeholder}
                </tbody>
              )}
            </Droppable>
          </Table>
          <div className='flex w-full items-center justify-center'>
            <EvidencePagination currentPage={currentPage} totalPages={totalPages || 1} onPageChange={handlePageChange} />
            <div className='flex justify-end'>
              <div className='flex items-center gap-2'>
                <Select value={pageSize.toString()} onValueChange={(value) => handlePageSizeChange(Number(value))}>
                  <SelectTrigger className='h-[32px] w-[120px]'>
                    <SelectValue placeholder='페이지당 개수' />
                  </SelectTrigger>
                  <SelectContent className='w-[200px]'>
                    {[50, 100, 200].map((option: number) => (
                      <SelectItem key={option} value={option.toString()}>
                        <p className='text-[12px]'>{option}개씩 보기</p>
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>
          </div>
        </TableBox>
      </DragDropContext>

      {/* 모달들 */}
      <AIMenuModal
        isOpen={isRegisterModalOpen}
        onClose={() => setIsRegisterModalOpen(false)}
        onSubmit={handleMenuRegister}
        isLoading={isRegistering}
        title='메뉴 등록'
        submitButtonText='등록'
      />

      <AIMenuModal
        isOpen={isEditModalOpen}
        onClose={() => {
          setIsEditModalOpen(false);
          setEditingItem(null);
        }}
        onSubmit={handleMenuEdit}
        isLoading={isEditing}
        title='메뉴 수정'
        initialValue={editingItem?.dataList}
        submitButtonText='수정'
      />

      <AIAnalysisToggleModal
        isOpen={isToggleModalOpen}
        onClose={() => setIsToggleModalOpen(false)}
        onConfirm={handleToggleConfirm}
        isLoading={isToggling}
        isActivating={pendingToggleState}
      />

      <AIMenuActionModal
        isOpen={isActionModalOpen}
        onClose={() => {
          setIsActionModalOpen(false);
          setActionTargetItem(null);
        }}
        onConfirm={handleActionConfirm}
        isLoading={isActionLoading}
        actionType={actionType}
        menuName={actionTargetItem?.dataList}
      />

      {/* 순서 변경 확인 모달 */}
      <AIMenuActionModal
        isOpen={isOrderChangeModalOpen}
        onClose={handleOrderChangeCancel}
        onConfirm={handleOrderChangeConfirm}
        isLoading={isActionLoading}
        actionType='order'
      />
    </div>
  );
};

export default AIAnalysisAdminUpMenuTable;
