import { JSX, useState, useEffect, useCallback } from 'react';

import { FaExclamationCircle } from 'react-icons/fa';
import { IoMdCheckmarkCircle } from 'react-icons/io';

import {
  fetchEditProjectCategory,
  fetchSetProjectAIAnalysis,
  fetchGetProjectAIAnalysis,
  fetchDeployProjectUser,
} from '@/apis/admin-ai-api';
import { fetchClickAnalysisMenuToday } from '@/apis/evidence-api';
import AIAnalysisMenuDownTable from '@/components/evidence/admin/table/ai/ai-analysis-menu-down-table';
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
import { useGetProjectCategoryQuery } from '@/query/admin-ai-query';

// AI분석메뉴 데이터 타입 정의
interface IAIAnalysisMenuItem {
  id: string;
  sequence: number;
  dataList: string;
  registrationDate: string;
  isPublic: boolean;
  hasFile: boolean;
  fileName?: string;
  filePath?: string;
  fileType?: string;
}

interface IAIAnalysisMenuTableProps {
  selectedProjectId: string;
  selectedOfficeId: string;
  selectedProjectName?: string;
  selectedClientName?: string;
  selectedAiClickCount?: string;
}

const AIAnalysisMenuUpTable = ({
  selectedProjectId,
  selectedOfficeId,
  selectedProjectName,
  selectedClientName,
  selectedAiClickCount,
}: IAIAnalysisMenuTableProps): JSX.Element => {
  // !페이지네이션관련
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(50);

  // 선택된 메뉴 상태 (하위 테이블 표시용)
  const [selectedMenu, setSelectedMenu] = useState<IAIAnalysisMenuItem | null>(null);
  const [selectedAiClick, setSelectedAiClick] = useState(selectedAiClickCount || '0');
  const [selectedAiClickToday, setSelectedAiClickToday] = useState('0');
  console.log('선택된 AI 클릭 수:', setSelectedAiClick);
  // AI분석메뉴 목록 상태
  const [aiMenuItems, setAiMenuItems] = useState<IAIAnalysisMenuItem[]>([]);
  const {
    data: projectCategoryResponse,
    isLoading: isProjectCategoryLoading,
    refetch: refetchProjectCategory,
  } = useGetProjectCategoryQuery(selectedProjectId);

  // 모달 상태
  const [isActionModalOpen, setIsActionModalOpen] = useState(false);
  const [isActionLoading, setIsActionLoading] = useState(false);
  const [actionType] = useState<'public' | 'private'>('public');
  const [actionTargetItem, setActionTargetItem] = useState<IAIAnalysisMenuItem | null>(null);

  // AI 분석 토글 모달 상태
  const [isToggleModalOpen, setIsToggleModalOpen] = useState(false);
  const [isToggling, setIsToggling] = useState(false);
  const [isAIAnalysisEnabled, setIsAIAnalysisEnabled] = useState(false);
  const [pendingToggleState, setPendingToggleState] = useState(false);

  // Query 응답 -> 로컬 상태로 반영 (토글/수정 UI 때문에 로컬 상태 유지)
  useEffect(() => {
    const response = projectCategoryResponse;
    if (!response?.success || !Array.isArray(response.data)) return;

    const transformedData: IAIAnalysisMenuItem[] = response.data.map((item) => ({
      id: item.category_id,
      sequence: item.display_order,
      dataList: item.category_nm,
      registrationDate: new Date(item.createdAt).toLocaleDateString('ko-KR'),
      isPublic: item.isEnabled === 'true' || item.isEnabled === true,
      hasFile: false,
      fileName: '',
      filePath: '',
      fileType: '',
    }));
    setAiMenuItems(transformedData);
  }, [projectCategoryResponse]);

  const refreshMenuData = useCallback(async () => {
    await refetchProjectCategory();
  }, [refetchProjectCategory]);

  // AI 분석 설정 상태 조회
  const fetchAIAnalysisStatus = async () => {
    if (!selectedProjectId) {
      console.log('selectedProjectId가 없어서 AI 분석 상태 조회를 건너뜁니다.');
      return;
    }

    try {
      const response = await fetchGetProjectAIAnalysis(selectedProjectId);

      if (response.success) {
        // API 응답 구조 확인: data가 boolean인지 객체인지 체크
        const newStatus = typeof response.data === 'boolean' ? response.data : (response.data?.ai_analysis ?? false);

        setIsAIAnalysisEnabled(newStatus);
      } else {
        console.error('AI 분석 설정 조회 실패:', response.message);
        setIsAIAnalysisEnabled(false);
      }
    } catch (error) {
      console.error('AI 분석 설정 조회 중 오류 발생:', error);
      setIsAIAnalysisEnabled(false);
    }
  };

  // 오늘의 AI 조회수 가져오기
  const fetchTodayClickCount = async () => {
    if (!selectedProjectId) return;

    try {
      const response = await fetchClickAnalysisMenuToday(selectedProjectId);
      if (response.success && response.data) {
        setSelectedAiClickToday(response.data.today?.toString() || '0');
      }
    } catch (error) {
      console.error('오늘의 AI 조회수 가져오기 실패:', error);
      setSelectedAiClickToday('0');
    }
  };

  // 프로젝트 ID가 변경될 때마다 데이터 조회
  useEffect(() => {
    fetchAIAnalysisStatus();
    fetchTodayClickCount(); // 오늘의 조회수 조회
  }, [selectedProjectId]); // eslint-disable-line react-hooks/exhaustive-deps

  // AI 분석 상태 변화 추적
  useEffect(() => {
    console.log('🔄 AI 분석 상태 변경됨:', {
      상태: isAIAnalysisEnabled,
      타입: typeof isAIAnalysisEnabled,
      시간: new Date().toISOString(),
    });
  }, [isAIAnalysisEnabled]);

  // 메뉴명 클릭 핸들러 (하위 테이블 표시)
  const handleMenuClick = (item: IAIAnalysisMenuItem) => {
    setSelectedMenu(item);
  };

  // 뒤로가기 핸들러
  const handleBackToMain = (shouldRefresh?: boolean) => {
    if (shouldRefresh) {
      refreshMenuData();
    }
    setSelectedMenu(null);
  };

  // 페이지 크기 변경 핸들러
  const handlePageSizeChange = (newPageSize: number) => {
    setPageSize(newPageSize);
    setCurrentPage(1); // 페이지 크기 변경 시 첫 페이지로
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
      console.log('AI 분석 상태 변경 시작:', {
        projectId: selectedProjectId,
        newState: pendingToggleState,
      });

      // API 호출
      const response = await fetchSetProjectAIAnalysis({
        project_id: selectedProjectId,
        ai_analysis: pendingToggleState,
      });

      if (response.success) {
        setIsAIAnalysisEnabled(pendingToggleState);
        setIsToggleModalOpen(false);

        onMessageToast({
          message: `AI 분석이 ${pendingToggleState ? '활성화' : '비활성화'}되었습니다.`,
          icon: <IoMdCheckmarkCircle className='h-5 w-5 text-green-500' />,
        });

        console.log('AI 분석 상태 변경 성공:', response);
      } else {
        onMessageToast({
          message: response.message || 'AI 분석 설정 변경에 실패했습니다.',
          icon: <FaExclamationCircle className='h-5 w-5 text-yellow-500' />,
        });
        console.error('API 응답 실패:', response);
      }
    } catch (error) {
      console.error('AI 분석 상태 변경 중 오류 발생:', error);
      onMessageToast({
        message: 'AI 분석 설정 변경 중 오류가 발생했습니다.',
        icon: <FaExclamationCircle className='h-5 w-5 text-yellow-500' />,
      });
    } finally {
      setIsToggling(false);
    }
  };

  // 공개/비공개 토글 핸들러
  const handleTogglePublic = async (item: IAIAnalysisMenuItem) => {
    try {
      const response = await fetchEditProjectCategory({
        project_id: selectedProjectId,
        category_id: item.id,
        isEnabled: !item.isPublic,
      });

      if (response.success) {
        // 로컬 상태 업데이트
        setAiMenuItems((prev) =>
          prev.map((menuItem) => (menuItem.id === item.id ? { ...menuItem, isPublic: !menuItem.isPublic } : menuItem)),
        );

        onMessageToast({
          message: `메뉴가 ${!item.isPublic ? '공개' : '비공개'}로 변경되었습니다.`,
          icon: <IoMdCheckmarkCircle className='h-5 w-5 text-green-500' />,
        });
      } else {
        onMessageToast({
          message: '상태 변경에 실패했습니다.',
          icon: <FaExclamationCircle className='h-5 w-5 text-yellow-500' />,
        });
      }
    } catch (error) {
      console.error('토글 처리 중 오류 발생:', error);
      onMessageToast({
        message: '상태 변경 중 오류가 발생했습니다.',
        icon: <FaExclamationCircle className='h-5 w-5 text-yellow-500' />,
      });
    }
  };

  // 액션 확인 핸들러
  const handleActionConfirm = async () => {
    setIsActionLoading(true);
    try {
      if (actionTargetItem) {
        // 공개/비공개 토글
        setAiMenuItems((prev) =>
          prev.map((item) => (item.id === actionTargetItem.id ? { ...item, isPublic: actionType === 'public' } : item)),
        );
        console.log(`메뉴가 ${actionType === 'public' ? '공개' : '비공개'}로 변경되었습니다.`);
      }
      setIsActionModalOpen(false);
      setActionTargetItem(null);
    } catch (error) {
      console.error('액션 처리 중 오류 발생:', error);
    } finally {
      setIsActionLoading(false);
    }
  };

  // 페이지 변경 핸들러
  const handlePageChange = (page: number) => {
    console.log('Changing to page:', page);
    setCurrentPage(page);
  };

  const totalPages = Math.ceil(aiMenuItems.length / pageSize);
  const startIndex = (currentPage - 1) * pageSize;
  const paginatedItems = aiMenuItems.slice(startIndex, startIndex + pageSize);
  // ! 사용자 화면에 반영
  const deployProjectTemplate = async () => {
    if (!selectedProjectId) return;

    try {
      const response = await fetchDeployProjectUser({
        project_id: selectedProjectId,
      });

      if (response.success) {
        onMessageToast({
          message: '사용자 화면에 성공적으로 반영되었습니다..',
        });
      } else {
        onMessageToast({
          message: '사용자 화면 반영에 실패했습니다.',
        });
      }
    } catch (error) {
      console.error('반영오류:', error);
      onMessageToast({
        message: '사용자 화면 반영 중 오류가 발생했습니다.',
      });
    }
  };

  // 하위 테이블이 선택되었을 때
  if (selectedMenu) {
    return (
      <AIAnalysisMenuDownTable
        selectedMenu={selectedMenu}
        onBackToMain={handleBackToMain}
        selectedProjectId={selectedProjectId}
        selectedOfficeId={selectedOfficeId}
        selectedProjectName={selectedProjectName}
        onRefreshParentData={refreshMenuData}
      />
    );
  }

  return (
    <div className='w-full pl-4'>
      {/* 헤더 영역 */}
      <HeaderWrapper>
        <HeaderTitle>
          <div className='mt-10 flex items-center justify-between'>
            <div className='flex items-center'>
              AI분석
              <Switch
                id='ai-analysis-toggle'
                className='ml-2'
                checked={isAIAnalysisEnabled}
                onCheckedChange={(checked) => {
                  console.log('Switch onCheckedChange 호출:', {
                    현재상태: isAIAnalysisEnabled,
                    새로운상태: checked,
                    시간: new Date().toISOString(),
                  });
                  handleAIAnalysisToggle(checked);
                }}
              />
            </div>
            <div className='flex items-center'>
              <button
                onClick={deployProjectTemplate}
                className='ml-[16px] h-[40px] w-[126px] rounded rounded-[8px] bg-[#004AA4] text-sm text-white hover:bg-blue-600'
              >
                사용자 화면에 반영
              </button>
            </div>
          </div>
        </HeaderTitle>
        <span className='text-[14px] text-[#212121]'>의뢰인: {selectedClientName} </span>
        <span className='pl-2 text-[14px] text-[#212121]'>
          Total : <span className='font-bold'>{selectedAiClick}회</span> / Today :{' '}
          <span className='font-bold'>{selectedAiClickToday}회</span>
        </span>
      </HeaderWrapper>

      {/* 테이블 영역 */}
      <TableBox>
        <Table>
          <TableRow>
            <TableCell className='w-[80px] bg-[#f5f5f5] text-center font-bold'>순번</TableCell>
            <TableCell className='w-[400px] bg-[#f5f5f5] text-center font-bold'>메뉴명</TableCell>
            <TableCell className='w-[120px] bg-[#f5f5f5] text-center font-bold'>공개 여부</TableCell>
          </TableRow>
          <tbody>
            {isProjectCategoryLoading ? (
              <TableRow>
                <TableCell colSpan={3} className='text-center'>
                  로딩중...
                </TableCell>
              </TableRow>
            ) : !paginatedItems.length ? (
              <TableRow>
                <TableCell colSpan={3} className='text-center'>
                  AI분석메뉴 데이터가 없습니다.
                </TableCell>
              </TableRow>
            ) : (
              paginatedItems.map((item) => (
                <TableRow key={item.id}>
                  <TableCell className='text-center'>{item.sequence}</TableCell>
                  <TableCell className='text-center'>
                    <button
                      onClick={() => handleMenuClick(item)}
                      className='cursor-pointer text-blue-600 hover:text-blue-800 hover:underline'
                    >
                      {item.dataList}
                    </button>
                  </TableCell>
                  <TableCell className='text-center'>
                    <Switch
                      id={`toggle-${item.id}`}
                      className='ml-2'
                      checked={item.isPublic}
                      onCheckedChange={() => handleTogglePublic(item)}
                    />
                  </TableCell>
                </TableRow>
              ))
            )}
          </tbody>
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

      {/* AI 분석 토글 확인 모달 */}
      <AIAnalysisToggleModal
        isOpen={isToggleModalOpen}
        onClose={() => setIsToggleModalOpen(false)}
        onConfirm={handleToggleConfirm}
        isLoading={isToggling}
        isActivating={pendingToggleState}
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
    </div>
  );
};

export default AIAnalysisMenuUpTable;
