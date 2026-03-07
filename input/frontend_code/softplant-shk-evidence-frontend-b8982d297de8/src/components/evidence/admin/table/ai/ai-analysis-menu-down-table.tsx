import { JSX, useState, useEffect } from 'react';

import { ArrowLeftIcon } from '@heroicons/react/24/outline';
import { FiDownload } from 'react-icons/fi';

import { fetchGetSubMenu, fetchDeployProjectUser, fetchDownloadFile, fetchEditProjectCategory } from '@/apis/admin-ai-api';
import AIAnalysisToggleModal from '@/components/evidence/admin/table/ai/modal/ai-analysis-toggle-modal';
import AIMenuActionModal from '@/components/evidence/admin/table/ai/modal/ai-menu-action-modal';
import { AiUploadModal } from '@/components/evidence/admin/table/ai/modal/ai-upload-modal';
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
import { useEditProjectSubMenuMutation } from '@/query/admin-ai-query';

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
  selectedMenu: IAIAnalysisMenuItem;
  onBackToMain: (shouldRefresh?: boolean) => void;
  selectedProjectId: string;
  selectedOfficeId: string;
  selectedProjectName?: string;
  onRefreshParentData?: () => void; // 부모 데이터 리패치 함수
}

const AIAnalysisMenuDownTable = ({
  selectedMenu,
  onBackToMain,
  selectedProjectId,
  selectedOfficeId,
  selectedProjectName,
  onRefreshParentData,
}: IAIAnalysisMenuTableProps): JSX.Element => {
  // !페이지네이션관련
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(50);
  const [isFileRegisterModalOpen, setIsFileRegisterModalOpen] = useState(false);
  const [selectedMenuIdForUpload, setSelectedMenuIdForUpload] = useState<string>(''); // 업로드할 메뉴 ID
  const [selectedItemForUpload, setSelectedItemForUpload] = useState<IAIAnalysisMenuItem | null>(null); // 업로드할 아이템 정보
  console.log(selectedProjectId, selectedOfficeId);

  // AI분석메뉴 목록 상태
  const [aiMenuItems, setAiMenuItems] = useState<IAIAnalysisMenuItem[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isAIAnalysisEnabled, setIsAIAnalysisEnabled] = useState(false);
  const [pendingToggleState, setPendingToggleState] = useState(false);
  // Category 상태를 로컬에서 관리
  const [categoryIsPublic, setCategoryIsPublic] = useState(selectedMenu.isPublic);

  console.log(isAIAnalysisEnabled);
  console.log(setPendingToggleState);
  // 하위메뉴 데이터 조회
  const fetchSubMenuData = async () => {
    if (!selectedProjectId || !selectedMenu?.id) return;

    setIsLoading(true);
    try {
      const response = await fetchGetSubMenu({
        category_id: selectedMenu.id,
        project_id: selectedProjectId,
      });

      if (response.success && Array.isArray(response.data)) {
        const transformedData: IAIAnalysisMenuItem[] = response.data.map((item) => ({
          id: item.menu_id,
          sequence: item.display_order,
          dataList: item.menu_nm,
          registrationDate: new Date(item.createdAt).toLocaleDateString('ko-KR'),
          isPublic: item.isEnabled,
          hasFile: item.has_file,
          fileName: item.file_nm,
          filePath: item.file_path,
          fileType: item.file_type,
        }));
        setAiMenuItems(transformedData);
      } else {
        onMessageToast({
          message: '하위 메뉴 데이터 조회에 실패했습니다.',
        });
      }
    } catch (error) {
      console.error('하위 메뉴 데이터 조회 중 오류 발생:', error);
      onMessageToast({
        message: '하위 메뉴 데이터 조회 중 오류가 발생했습니다.',
      });
    } finally {
      setIsLoading(false);
    }
  };
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

  // 컴포넌트 마운트 시 데이터 조회
  useEffect(() => {
    fetchSubMenuData();
  }, [selectedMenu.id, selectedProjectId]); // eslint-disable-line react-hooks/exhaustive-deps

  // selectedMenu 변경 시 로컬 상태 업데이트
  useEffect(() => {
    setCategoryIsPublic(selectedMenu.isPublic);
  }, [selectedMenu.isPublic]);

  // 모달 상태
  const [isActionModalOpen, setIsActionModalOpen] = useState(false);
  const [isActionLoading, setIsActionLoading] = useState(false);
  const [actionType, setActionType] = useState<'public' | 'private'>('public');
  const [actionTargetItem, setActionTargetItem] = useState<IAIAnalysisMenuItem | null>(null);

  // AI 분석 토글 모달 상태
  const [isToggleModalOpen, setIsToggleModalOpen] = useState(false);
  const [isToggling, setIsToggling] = useState(false);

  // 뮤테이션 훅
  const editSubMenuMutation = useEditProjectSubMenuMutation();

  // 페이지 크기 변경 핸들러
  const handlePageSizeChange = (newPageSize: number) => {
    setPageSize(newPageSize);
    setCurrentPage(1); // 페이지 크기 변경 시 첫 페이지로
  };

  // AI 분석 토글 확인 핸들러
  const handleToggleConfirm = async () => {
    setIsToggling(true);
    try {
      setIsAIAnalysisEnabled(pendingToggleState);
      setIsToggleModalOpen(false);

      // 성공 메시지 또는 토스트 알림
      console.log(`AI 분석이 ${pendingToggleState ? '활성화' : '비활성화'}되었습니다.`);
    } catch (error) {
      console.error('AI 분석 상태 변경 중 오류 발생:', error);
    } finally {
      setIsToggling(false);
    }
  };

  // Category 토글 핸들러 (헤더용)
  const handleToggleCategory = async () => {
    const newState = !categoryIsPublic;
    const previousState = categoryIsPublic;

    // Optimistic update - 즉시 UI에 반영
    setCategoryIsPublic(newState);

    try {
      const requestData = {
        category_id: selectedMenu.id,
        project_id: selectedProjectId,
        isEnabled: newState,
      };

      const response = await fetchEditProjectCategory(requestData);

      if (response.success) {
        onMessageToast({
          message: `카테고리가 ${newState ? '공개' : '비공개'}로 변경되었습니다.`,
        });

        // 현재 컴포넌트 데이터 새로고침
        await fetchSubMenuData();

        // 부모 데이터도 새로고침
        if (onRefreshParentData) {
          try {
            await onRefreshParentData();
          } catch (error) {
            console.error('부모 데이터 리패치 중 오류:', error);
          }
        }
      } else {
        // API 실패 시 이전 상태로 되돌리기
        setCategoryIsPublic(previousState);
        onMessageToast({
          message: '카테고리 상태 변경에 실패했습니다.',
        });
      }
    } catch (error) {
      // 오류 발생 시 이전 상태로 되돌리기
      setCategoryIsPublic(previousState);
      console.error('카테고리 토글 중 오류 발생:', error);
      onMessageToast({
        message: '카테고리 상태 변경 중 오류가 발생했습니다.',
      });
    }
  };

  // 공개/비공개 토글 핸들러 (서브메뉴용 - 모달 표시)
  const handleTogglePublic = (item: IAIAnalysisMenuItem) => {
    setActionTargetItem(item);
    setActionType(item.isPublic ? 'private' : 'public');
    setIsActionModalOpen(true);
  };

  // 액션 확인 핸들러
  const handleActionConfirm = async () => {
    setIsActionLoading(true);
    try {
      if (actionTargetItem) {
        const isPublic = actionType === 'public';
        const requestData = {
          menu_id: actionTargetItem.id,
          project_id: selectedProjectId,
          isEnabled: isPublic,
        };

        const result = await editSubMenuMutation.mutateAsync(requestData);
        console.log('토글 API 응답:', result);

        onMessageToast({
          message: `메뉴가 ${isPublic ? '공개' : '비공개'}로 변경되었습니다.`,
        });

        // 서버 데이터와 동기화
        await fetchSubMenuData();
      }
      setIsActionModalOpen(false);
      setActionTargetItem(null);
    } catch (error) {
      console.error('액션 처리 중 오류 발생:', error);
      onMessageToast({
        message: '처리 중 오류가 발생했습니다. 다시 시도해주세요.',
      });
    } finally {
      setIsActionLoading(false);
    }
  };

  // 페이지 변경 핸들러
  const handlePageChange = (page: number) => {
    console.log('Changing to page:', page);
    setCurrentPage(page);
  };

  // 에러 처리
  // The subMenuError state was removed, so this block is no longer relevant.
  // if (subMenuError) {
  //   return (
  //     <div className='w-full p-8 text-center'>
  //       <button onClick={onBackToMain} className='mb-4 text-blue-600 hover:text-blue-800'>
  //         <ArrowLeftIcon className='mr-2 inline h-5 w-5' />
  //         뒤로가기
  //       </button>
  //       <p className='text-red-500'>하위메뉴 데이터를 불러오는 중 오류가 발생했습니다.</p>
  //       <p className='text-sm text-gray-500'>{subMenuError.message}</p>
  //     </div>
  //   );
  // }

  const totalPages = Math.ceil(aiMenuItems.length / pageSize);
  const startIndex = (currentPage - 1) * pageSize;
  const paginatedItems = aiMenuItems.slice(startIndex, startIndex + pageSize);

  // 파일 추가/수정 버튼 클릭 핸들러
  const handleFileAddClick = (item: IAIAnalysisMenuItem) => {
    console.log('File upload modal opened for item:', {
      id: item.id,
      dataList: item.dataList,
      hasFile: item.hasFile,
      fileName: item.fileName,
      filePath: item.filePath,
      fileType: item.fileType,
    });

    setSelectedMenuIdForUpload(item.id);
    setSelectedItemForUpload(item);
    setIsFileRegisterModalOpen(true);
  };

  // 미리보기 버튼 클릭 핸들러
  const handlePreviewClick = () => {
    const encodedProjectName = encodeURIComponent(selectedProjectName || '');
    const previewUrl = `/admin/ai-preview?project_id=${selectedProjectId}&project_name=${encodedProjectName}&officeId=${selectedOfficeId}`;
    window.open(previewUrl, '_blank');
  };

  // 뒤로가기 핸들러 (데이터 새로고침과 함께)
  const handleBackToMain = async () => {
    // 부모 데이터 먼저 리패치
    if (onRefreshParentData) {
      try {
        await onRefreshParentData();
      } catch (error) {
        console.error('부모 데이터 리패치 중 오류:', error);
      }
    }

    // 뒤로가기 실행
    onBackToMain(true);
  };

  // 파일 다운로드 핸들러
  const handleDownloadFile = async (item: IAIAnalysisMenuItem) => {
    if (!item.hasFile || !item.fileName) {
      onMessageToast({
        message: '다운로드할 파일이 없습니다.',
      });
      return;
    }

    try {
      console.log('Downloading file:', {
        project_id: selectedProjectId,
        menu_id: item.id,
        fileName: item.fileName,
      });

      const blob = await fetchDownloadFile({
        project_id: selectedProjectId,
        menu_id: item.id,
      });

      // 파일 확장자 추출 (없으면 기본값 html)
      const fileExtension = item.fileName.split('.').pop()?.toLowerCase() || 'html';
      const fileName = item.fileName.includes('.') ? item.fileName : `${item.fileName}.${fileExtension}`;

      // Blob을 URL로 변환하여 다운로드
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', fileName);
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      window.URL.revokeObjectURL(url);

      onMessageToast({
        message: `${fileName} 파일이 다운로드되었습니다.`,
      });
    } catch (error) {
      console.error('파일 다운로드 중 오류 발생:', error);
      onMessageToast({
        message: '파일 다운로드 중 오류가 발생했습니다.',
      });
    }
  };

  return (
    <div className='w-full'>
      {/* 헤더 영역 */}
      <HeaderWrapper>
        <HeaderTitle>
          <div className='mt-10 flex items-center justify-between'>
            <div className='flex items-center'>
              <button
                onClick={handleBackToMain}
                className='mr-4 flex h-[32px] w-[32px] items-center justify-center rounded-[8px] border border-[#E5E5E5] bg-[#fff]'
              >
                <ArrowLeftIcon className='h-[16px] w-[16px]' />
              </button>
              <span className='mr-3'>{selectedMenu.dataList}</span>
              <div className='flex items-center gap-2'>
                <Switch id={`category-toggle-${selectedMenu.id}`} checked={categoryIsPublic} onCheckedChange={handleToggleCategory} />
              </div>
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
      </HeaderWrapper>

      {/* 테이블 영역 */}
      <TableBox>
        <Table>
          <TableRow>
            <TableCell className='w-[80px] bg-[#f5f5f5] text-center font-bold'>순번</TableCell>
            <TableCell className='w-[300px] bg-[#f5f5f5] text-center font-bold'>AI분석 데이터명</TableCell>
            <TableCell className='w-[250px] bg-[#f5f5f5] text-center font-bold'>파일명</TableCell>
            <TableCell className='w-[120px] bg-[#f5f5f5] text-center font-bold'>등록일</TableCell>
            <TableCell className='w-[120px] bg-[#f5f5f5] text-center font-bold'>미리보기</TableCell>
            <TableCell className='w-[120px] bg-[#f5f5f5] text-center font-bold'>공개 여부</TableCell>
          </TableRow>
          <tbody>
            {isLoading ? (
              <TableRow>
                <TableCell colSpan={6} className='text-center'>
                  로딩중...
                </TableCell>
              </TableRow>
            ) : !paginatedItems.length ? (
              <TableRow>
                <TableCell colSpan={6} className='text-center'>
                  AI분석 데이터가 없습니다.
                </TableCell>
              </TableRow>
            ) : (
              paginatedItems.map((item) => (
                <TableRow key={item.id}>
                  <TableCell className='text-center'>{item.sequence}</TableCell>
                  <TableCell className='text-center'>{item.dataList}</TableCell>
                  <TableCell className='text-center'>
                    {item.hasFile ? (
                      <>
                        <div className='flex items-center justify-center gap-2'>
                          <span
                            className='cursor-pointer text-sm text-gray-600 hover:text-blue-500 hover:underline'
                            onClick={() => handleFileAddClick(item)}
                          >
                            {item.fileName}
                          </span>
                          <button
                            className='cursor-pointer text-[#5B5B5B] hover:text-blue-500'
                            onClick={(e) => {
                              e.stopPropagation();
                              handleDownloadFile(item);
                            }}
                            title={`${item.fileName} 다운로드`}
                          >
                            <FiDownload className='' />
                          </button>
                        </div>
                      </>
                    ) : (
                      <button
                        className='h-[32px] w-[76px] rounded rounded-[8px] border border-[#E5E5E5] bg-[#fff] text-sm text-[#212121]'
                        onClick={() => handleFileAddClick(item)}
                      >
                        파일 추가
                      </button>
                    )}
                  </TableCell>
                  <TableCell className='text-center'>{item.registrationDate}</TableCell>
                  <TableCell className='text-center'>
                    {item.hasFile && (
                      <button
                        className='h-[32px] w-[76px] rounded rounded-[8px] border border-[#E5E5E5] bg-[#fff] text-sm text-[#212121] hover:bg-gray-50'
                        onClick={handlePreviewClick}
                      >
                        미리보기
                      </button>
                    )}
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
      <AiUploadModal
        isOpen={isFileRegisterModalOpen}
        onClose={() => {
          setIsFileRegisterModalOpen(false);
          setSelectedMenuIdForUpload('');
          setSelectedItemForUpload(null);
        }}
        onSuccess={() => {
          console.log('파일 등록 성공');
          fetchSubMenuData();
          setSelectedMenuIdForUpload('');
          setSelectedItemForUpload(null);
        }}
        project_id={selectedProjectId}
        menu_id={selectedMenuIdForUpload}
        existingFile={
          selectedItemForUpload?.hasFile
            ? {
                fileName: selectedItemForUpload.fileName || '',
                filePath: selectedItemForUpload.filePath || '',
                fileType: selectedItemForUpload.fileType || '',
              }
            : undefined
        }
      />
    </div>
  );
};

export default AIAnalysisMenuDownTable;
