import { JSX, useState, useEffect } from 'react';

import { DragDropContext, Droppable, Draggable } from '@hello-pangea/dnd';
import { ArrowLeftIcon } from '@heroicons/react/24/outline';
import { MdDragIndicator } from 'react-icons/md';

import {
  fetchGetCommonSubMenu,
  fetchDeleteCommonSubMenu,
  fetchEditCommonTemplateSubMenu,
  fetchDeployProjectTemplate,
} from '@/apis/admin-ai-api';
import AIMenuModal from '@/components/evidence/admin/table/ai/ai-menu-modal';
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
import { useCreateCommonSubMenuMutation, useChangeCommonSubMenuOrderMutation } from '@/query/admin-ai-query';

// AI분석메뉴 데이터 타입 정의
interface IAIAnalysisMenuItem {
  id: string;
  sequence: number;
  dataList: string;
  registrationDate: string;
  isPublic: boolean;
}

interface IAIAnalysisAdminDownMenuTableProps {
  selectedMenu: IAIAnalysisMenuItem;
  onBackToMain: () => void;
}

const AIAnalysisAdminDownMenuTable = ({ selectedMenu, onBackToMain }: IAIAnalysisAdminDownMenuTableProps): JSX.Element => {
  // !페이지네이션관련
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(50);

  // AI분석메뉴 목록 상태
  const [aiMenuItems, setAiMenuItems] = useState<IAIAnalysisMenuItem[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  // 드래그앤드랍 관련 상태
  const [showDragHandles, setShowDragHandles] = useState<string | null>(null);

  // 순서 변경 관련 상태
  const [pendingOrderChange, setPendingOrderChange] = useState<IAIAnalysisMenuItem[] | null>(null);
  const [isOrderChangeModalOpen, setIsOrderChangeModalOpen] = useState(false);

  // 순서 변경 뮤테이션
  const changeSubMenuOrderMutation = useChangeCommonSubMenuOrderMutation();

  // 하위메뉴 데이터 조회
  const fetchSubMenuData = async () => {
    if (!selectedMenu?.id) return;

    setIsLoading(true);
    try {
      const response = await fetchGetCommonSubMenu(selectedMenu.id);

      if (response.success && (response.data as any)?.menus && Array.isArray((response.data as any).menus)) {
        // API 응답 데이터를 컴포넌트 데이터 형식으로 변환
        const transformedData: IAIAnalysisMenuItem[] = (response.data as any).menus
          .map((item: any) => ({
            id: item.menu_template_id,
            sequence: item.display_order,
            dataList: item.menu_nm,
            registrationDate: new Date(item.createdAt).toLocaleDateString('ko-KR'),
            isPublic: item.isEnabled === true || item.isEnabled === 'true',
          }))
          .sort((a: IAIAnalysisMenuItem, b: IAIAnalysisMenuItem) => a.sequence - b.sequence); // display_order로 정렬
        setAiMenuItems(transformedData);
      } else {
        console.error('Invalid API response:', response);
        onMessageToast({
          message: '하위메뉴 데이터 조회에 실패했습니다.',
        });
      }
    } catch (error) {
      console.error('하위메뉴 데이터 조회 중 오류 발생:', error);
      onMessageToast({
        message: '하위메뉴 데이터 조회 중 오류가 발생했습니다.',
      });
    } finally {
      setIsLoading(false);
    }
  };

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
    } catch (error) {
      console.error('배포 중 오류 발생:', error);
      onMessageToast({
        message: '배포 중 오류가 발생했습니다.',
      });
    }
  };

  // 컴포넌트 마운트 시 하위메뉴 데이터 조회
  useEffect(() => {
    fetchSubMenuData();
  }, [selectedMenu?.id]); // eslint-disable-line react-hooks/exhaustive-deps

  // 모달 상태
  const [isRegisterModalOpen, setIsRegisterModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);

  const [isRegistering, setIsRegistering] = useState(false);
  const [isEditing, setIsEditing] = useState(false);

  const [editingItem, setEditingItem] = useState<IAIAnalysisMenuItem | null>(null);

  // 액션 모달 상태
  const [isActionModalOpen, setIsActionModalOpen] = useState(false);
  const [isActionLoading, setIsActionLoading] = useState(false);
  const [actionType, setActionType] = useState<'public' | 'private' | 'delete'>('delete');
  const [actionTargetItem, setActionTargetItem] = useState<IAIAnalysisMenuItem | null>(null);

  // 체크박스 선택 상태
  const [selectedItems, setSelectedItems] = useState<string[]>([]);

  // 뮤테이션 훅들
  const createSubMenuMutation = useCreateCommonSubMenuMutation();

  // selectedMenu가 없을 때 안전장치
  if (!selectedMenu) {
    return (
      <div className='w-full p-[20px]'>
        <HeaderWrapper>
          <HeaderTitle>
            <div className='flex items-center justify-between'>
              <div className='flex items-center'>
                <button onClick={onBackToMain} className='mr-4 text-blue-600 hover:text-blue-800'>
                  <ArrowLeftIcon className='h-5 w-5' />
                </button>
                메뉴를 찾을 수 없습니다
              </div>
            </div>
          </HeaderTitle>
        </HeaderWrapper>
      </div>
    );
  }

  // 페이지 크기 변경 핸들러
  const handlePageSizeChange = (newPageSize: number) => {
    setPageSize(newPageSize);
    setCurrentPage(1);
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

  // 삭제 버튼 클릭 핸들러
  const handleDeleteClick = () => {
    if (selectedItems.length === 0) {
      alert('삭제할 항목을 선택해주세요.');
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
        // 선택된 각 아이템에 대해 삭제 API 호출
        const deletePromises = selectedItems.map(async (itemId) => {
          try {
            const response = await fetchDeleteCommonSubMenu({
              menu_template_id: itemId,
            });
            return { success: response.success, itemId };
          } catch (error) {
            console.error(`메뉴 ${itemId} 삭제 실패:`, error);
            return { success: false, itemId };
          }
        });

        const results = await Promise.all(deletePromises);
        const successfulDeletes = results.filter((result) => result.success);
        const failedDeletes = results.filter((result) => !result.success);

        if (successfulDeletes.length > 0) {
          // 성공적으로 삭제된 아이템들만 UI에서 제거
          setAiMenuItems((prev) => prev.filter((item) => !successfulDeletes.some((result) => result.itemId === item.id)));

          onMessageToast({
            message: `${successfulDeletes.length}개의 메뉴가 삭제되었습니다.`,
          });
        }

        if (failedDeletes.length > 0) {
          onMessageToast({
            message: `${failedDeletes.length}개의 메뉴 삭제에 실패했습니다.`,
          });
        }

        setSelectedItems([]);
      } else if (actionType === 'public' || actionType === 'private') {
        if (!actionTargetItem) return;

        const isPublic = actionType === 'public';
        const requestData = {
          menu_template_id: actionTargetItem.id,
          menu_nm: actionTargetItem.dataList,
          isEnabled: isPublic,
        };

        console.log('토글 요청 데이터:', requestData);

        const result = await fetchEditCommonTemplateSubMenu(requestData);
        console.log('토글 API 응답:', result);

        onMessageToast({
          message: `메뉴가 ${isPublic ? '공개' : '비공개'}로 변경되었습니다.`,
        });

        // 서버 데이터와 동기화
        await fetchSubMenuData();
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

  // 하위 메뉴 등록 핸들러
  const handleMenuRegister = async (menuName: string) => {
    setIsRegistering(true);
    try {
      await createSubMenuMutation.mutateAsync({
        category_template_id: selectedMenu.id,
        menu_nm: menuName,
        description: `${menuName} 하위메뉴`, // 기본 설명
      });

      onMessageToast({
        message: '하위메뉴가 등록되었습니다.',
      });

      // 등록 후 데이터 다시 조회
      await fetchSubMenuData();
      setIsRegisterModalOpen(false);
    } catch (error) {
      console.error('하위 메뉴 등록 중 오류 발생:', error);
      onMessageToast({
        message: '하위메뉴 등록 중 오류가 발생했습니다.',
      });
    } finally {
      setIsRegistering(false);
    }
  };

  // 하위 메뉴 수정 핸들러
  const handleMenuEdit = async (menuName: string) => {
    if (!editingItem) return;

    setIsEditing(true);
    try {
      const requestData = {
        menu_template_id: editingItem.id,
        menu_nm: menuName,
        isEnabled: editingItem.isPublic,
      };

      console.log('수정 요청 데이터:', requestData);

      await fetchEditCommonTemplateSubMenu(requestData);

      onMessageToast({
        message: '하위메뉴가 수정되었습니다.',
      });

      // 수정 후 데이터 다시 조회
      await fetchSubMenuData();
      setIsEditModalOpen(false);
      setEditingItem(null);
    } catch (error) {
      console.error('하위 메뉴 수정 중 오류 발생:', error);
      console.error('요청 데이터:', {
        menu_template_id: editingItem.id,
        menu_nm: menuName,
        isEnabled: editingItem.isPublic,
      });
      onMessageToast({
        message: '하위메뉴 수정 중 오류가 발생했습니다.',
      });
    } finally {
      setIsEditing(false);
    }
  };

  // 드래그앤드랍 함수 - 모달 확인 후 변경
  const handleDragEnd = (result: any) => {
    if (!result.destination) return;

    // 같은 위치로 드롭한 경우 아무것도 하지 않음
    if (result.source.index === result.destination.index) return;

    const startIndex = (currentPage - 1) * pageSize;
    const sourceIndex = startIndex + result.source.index;
    const destinationIndex = startIndex + result.destination.index;

    // 전체 아이템에서 순서 변경
    const items = Array.from(aiMenuItems);
    const [reorderedItem] = items.splice(sourceIndex, 1);
    items.splice(destinationIndex, 0, reorderedItem);

    // 순서 번호 재계산
    const updatedItems = items.map((item, index) => ({
      ...item,
      sequence: index + 1,
    }));

    console.log('드래그 앤 드롭 순서 변경 요청:', {
      드래그된아이템: reorderedItem.dataList,
      원래위치: sourceIndex + 1,
      새위치: destinationIndex + 1,
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
      // 전체 메뉴 항목들의 새로운 순서를 배열로 한번에 전송
      const templatesWithNewOrder = pendingOrderChange.map((item, index) => ({
        menu_template_id: item.id,
        display_order: index + 1,
      }));

      console.log('순서 변경 API 호출 데이터:', templatesWithNewOrder);

      const response = await changeSubMenuOrderMutation.mutateAsync({
        category_template_id: selectedMenu.id,
        input: {
          templates: templatesWithNewOrder,
        },
      });

      if (response) {
        onMessageToast({
          message: '순서가 변경되었습니다.',
        });

        // 서버 데이터와 동기화
        await fetchSubMenuData();
      }
    } catch (dragError) {
      console.error('순서 변경 실패:', dragError);
      onMessageToast({
        message: '순서 변경 중 오류가 발생했습니다.',
      });

      // 실패 시 원래 상태로 복원
      await fetchSubMenuData();
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

  const totalPages = Math.ceil(aiMenuItems.length / pageSize);
  const startIndex = (currentPage - 1) * pageSize;
  const paginatedItems = aiMenuItems.slice(startIndex, startIndex + pageSize);

  return (
    <div className='w-full'>
      {/* 헤더 영역 */}
      <HeaderWrapper>
        <HeaderTitle>
          <div className='flex items-center justify-between'>
            <div className='flex items-center'>
              <button
                onClick={onBackToMain}
                className='mr-4 flex h-[32px] w-[32px] items-center justify-center rounded-[8px] border border-[#E5E5E5] bg-[#fff]'
              >
                <ArrowLeftIcon className='h-[16px] w-[16px]' />
              </button>
              {selectedMenu.dataList}
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
                className='ml-[16px] h-[40px] w-[155px] rounded rounded-[8px] bg-[#004AA4] text-sm text-white hover:bg-blue-600'
              >
                AI분석 데이터 메뉴 등록
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
              <TableCell className='w-[100px] bg-[#f5f5f5] text-center font-bold' style={{ width: '100px' }}>
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
                AI분석 데이터명
              </TableCell>
              <TableCell className='w-[100px] bg-[#f5f5f5] text-center font-bold' style={{ width: '100px' }}>
                수정
              </TableCell>
              <TableCell className='w-[120px] bg-[#f5f5f5] text-center font-bold' style={{ width: '120px' }}>
                공개 여부
              </TableCell>
            </TableRow>
            <Droppable droppableId='ai-submenu-table'>
              {(provided) => (
                <tbody {...provided.droppableProps} ref={provided.innerRef}>
                  {isLoading ? (
                    <TableRow>
                      <TableCell colSpan={5} className='text-center'>
                        로딩중...
                      </TableCell>
                    </TableRow>
                  ) : !paginatedItems.length ? (
                    <TableRow>
                      <TableCell colSpan={5} className='text-center'>
                        하위 메뉴 데이터가 없습니다.
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
                              {item.dataList}
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

      {/* 하위 메뉴 등록 모달 */}
      <AIMenuModal
        isOpen={isRegisterModalOpen}
        onClose={() => setIsRegisterModalOpen(false)}
        onSubmit={handleMenuRegister}
        isLoading={isRegistering}
        title='AI분석 데이터 메뉴 등록'
        submitButtonText='등록'
      />

      {/* 하위 메뉴 수정 모달 */}
      <AIMenuModal
        isOpen={isEditModalOpen}
        onClose={() => {
          setIsEditModalOpen(false);
          setEditingItem(null);
        }}
        onSubmit={handleMenuEdit}
        isLoading={isEditing}
        title='AI분석 데이터 메뉴 수정'
        initialValue={editingItem?.dataList}
        submitButtonText='수정'
      />

      {/* 액션 모달 */}
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

export default AIAnalysisAdminDownMenuTable;
