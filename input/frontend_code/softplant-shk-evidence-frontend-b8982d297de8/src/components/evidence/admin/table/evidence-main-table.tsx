import { useEffect, useMemo, useState, useCallback, useRef } from 'react';

import { Spinner } from '@nextui-org/spinner';
import { ChevronDown, ChevronRight, ChevronLeft } from 'lucide-react';

import { fetchGetSideBarMenuList } from '@/apis';
import { PaymentManagementPage } from '@/components/admin/payment/payment-management-page';
import { CaseListPage } from '@/components/evidence/admin/table/admin-main-list-page';
import AIAnalysisAdminUpMenuTable from '@/components/evidence/admin/table/ai/ai-analysis-admin-menu-up-table';
import AIAnalysisMenuTable from '@/components/evidence/admin/table/ai/ai-analysis-menu-up-table';
import { EvidenceListTable } from '@/components/evidence/admin/table/evidence-list-table';
import { EvidenceMatchingTable } from '@/components/evidence/admin/table/evidence-matching-table';
import { EvidencePermissionTable } from '@/components/evidence/admin/table/evidence-permission-table';
import { EvidenceSummaryTable } from '@/components/evidence/admin/table/evidence-summary-table';
import { EvidenceUploadTable } from '@/components/evidence/admin/table/evidence-upload-table';
import UserInfoTable from '@/components/evidence/admin/table/user-admin-table';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';

interface IEvidenceTableProps {
  selectedProjectId?: string;
  selectedOfficeId?: string;
  showUserInfo?: boolean;
  showAIAnalysisMenu?: boolean;
  showCaseManagement?: boolean;
  showPaymentMenu?: boolean;
  onCaseSelect?: (projectId: string, officeId: string) => void;
  onOcrStatusChange?: (projectId: string, officeId: string, hasFailure: boolean) => void;
}

export function EvidenceTable({
  selectedProjectId,
  selectedOfficeId,
  showUserInfo,
  showAIAnalysisMenu,
  showCaseManagement,
  showPaymentMenu,
  onCaseSelect,
}: IEvidenceTableProps) {
  // 프로젝트와 로펌 정보 가져오기
  const [officeName, setOfficeName] = useState<string>('');
  const [projectName, setProjectName] = useState<string>('');
  const [projectDate, setProjectDate] = useState<string>('');
  const [user, setUser] = useState<string>('');
  const [userEmail, setUserEmail] = useState<string>('');
  const [userPhone, setUserPhone] = useState<string>('');
  const [clientName, setClientName] = useState<string>('');
  const [selectedAiClickCount, setSelectedAiClickCount] = useState<string>('0');

  // 사이드바 관련 상태
  const [requestList, setRequestList] = useState<any[]>([]);
  const [sidebarLoading, setSidebarLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [openItems, setOpenItems] = useState<{ [key: string]: boolean }>({});
  const [isSidebarVisible, setIsSidebarVisible] = useState<boolean>(true);

  const isSelected = !!(selectedProjectId && selectedOfficeId);

  const formatDate = (dateString: string) => {
    if (!dateString) return '';
    const date = new Date(dateString);

    // 유효하지 않은 날짜인 경우 처리
    if (isNaN(date.getTime())) {
      console.warn('Invalid date string:', dateString);
      return '';
    }

    const year = date.getFullYear() % 100; // 년도의 마지막 2자리만 가져옴
    const month = String(date.getMonth() + 1).padStart(2, '0'); // 2자리로 패딩
    const day = String(date.getDate()).padStart(2, '0'); // 2자리로 패딩
    return `${year}${month}${day}`;
  };

  // 사이드바 데이터 가져오기
  const isFetchingSidebarRef = useRef(false);
  const fetchSidebarData = useCallback(async () => {
    if (isFetchingSidebarRef.current) return;
    isFetchingSidebarRef.current = true;
    setSidebarLoading(true);
    setError(null);
    try {
      const response = await fetchGetSideBarMenuList();
      if (response.success && Array.isArray(response.data?.list)) {
        setRequestList(response.data.list);
      } else {
        setError('데이터를 불러올 수 없습니다.');
      }
    } catch (err) {
      console.error('사이드바 데이터 로딩 실패:', err);
      setError('데이터 로딩 중 오류가 발생했습니다.');
    } finally {
      setSidebarLoading(false);
      isFetchingSidebarRef.current = false;
    }
  }, []);

  // requestList에서 선택된 사건 정보를 찾기 (API 재호출 없이 로컬에서만)
  const selectedRequest = useMemo(() => {
    if (!isSelected) return null;
    const allRequests = requestList.flatMap((item) => item?.requests || []);
    return allRequests.find((req: any) => req.project_id === selectedProjectId && req.office_id === selectedOfficeId) || null;
  }, [isSelected, requestList, selectedProjectId, selectedOfficeId]);

  // 사건 선택/변경 시: requestList가 비어있으면 1회만 로딩, 있으면 로컬 데이터로 헤더 갱신
  useEffect(() => {
    if (!isSelected) {
      setOfficeName('');
      setProjectName('');
      setProjectDate('');
      setUser('');
      setUserEmail('');
      setUserPhone('');
      setClientName('');
      setSelectedAiClickCount('0');
      return;
    }

    // 사이드바 데이터가 아직 없으면 1회만 가져오기
    if (requestList.length === 0 && !sidebarLoading && !error) {
      fetchSidebarData();
    }
  }, [isSelected, requestList.length, sidebarLoading, error, fetchSidebarData]);

  // requestList가 준비되면 선택된 사건 헤더 정보를 로컬에서 채움 (중복 API 호출 제거)
  useEffect(() => {
    if (!isSelected) return;
    if (!selectedRequest) return;

    setOfficeName(selectedRequest.office_nm || '');
    setProjectName(selectedRequest.project_nm || '');
    setProjectDate(selectedRequest.requested_at || '');
    setUser(selectedRequest.user_nm || '');
    setUserEmail(selectedRequest.email || '');
    setUserPhone(selectedRequest.phone || '');
    setClientName(selectedRequest.client_nm || '');
    setSelectedAiClickCount(selectedRequest.ai_menu_click_count || '0');
  }, [isSelected, selectedRequest]);

  // 토글 함수
  const onToggle = (date: string) => {
    setOpenItems((prev) => ({
      ...prev,
      [date]: !prev[date],
    }));
  };

  // 프로젝트 선택 핸들러
  const handleProjectSelect = (projectId: string, officeId: string) => {
    if (onCaseSelect) {
      onCaseSelect(projectId, officeId);
    }
  };

  // 사이드바 닫기 핸들러
  const handleCloseSidebar = () => {
    setIsSidebarVisible(false);
  };

  // 사이드바 열기 핸들러
  const handleOpenSidebar = () => {
    setIsSidebarVisible(true);
  };

  // 날짜 포맷팅 함수
  const formatDateWithDots = (dateString: string) => {
    if (!dateString) return '';
    const date = new Date(dateString);

    // 유효하지 않은 날짜인 경우 처리
    if (isNaN(date.getTime())) {
      console.warn('Invalid date string:', dateString);
      return dateString; // 원본 문자열 반환
    }

    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    return `${year}.${month}.${day}`;
  };

  // 프로젝트 완료 여부 확인 함수
  const isProjectCompleted = (project: any) => {
    return (
      project.evidence_upload_status === '완료' && project.matching_upload_status === '완료' && project.summary_upload_status === '완료'
    );
  };

  // 프로젝트 미완료 여부 확인 함수
  const isProjectIncomplete = (project: any) => {
    return !isProjectCompleted(project);
  };

  // 날짜 그룹의 상태 정보 계산
  const getDateGroupStatus = (dateGroup: any) => {
    if (!dateGroup.requests || !Array.isArray(dateGroup.requests)) {
      return { totalProjects: 0, completedProjects: 0, incompleteProjects: 0 };
    }

    const totalProjects = dateGroup.requests.length;
    const completedProjects = dateGroup.requests.filter(isProjectCompleted).length;
    const incompleteProjects = dateGroup.requests.filter(isProjectIncomplete).length;

    return { totalProjects, completedProjects, incompleteProjects };
  };

  const NoSelectionMessage = () => (
    <div className='flex h-[300px] w-full items-center justify-center rounded-lg border border-dashed border-gray-300'>
      <div className='text-center'>
        <p className='text-lg font-semibold text-gray-500'>사건명과 프로젝트를 선택해주세요.</p>
        <p className='mt-1 text-sm text-gray-400'>좌측 메뉴에서 프로젝트를 선택하시면 데이터가 표시됩니다.</p>
      </div>
    </div>
  );

  // NOTE: 컴포넌트 내부에서 래퍼 컴포넌트를 선언하면(리렌더마다 함수가 새로 생성됨)
  // 리사이즈 등으로 부모가 리렌더될 때 자식이 언마운트/리마운트되어 API가 반복 호출될 수 있음.
  // 따라서 회원정보는 래퍼 없이 직접 렌더링한다.

  // CaseListPage는 별도 컴포넌트로 분리됨

  // 새로운 사건이 선택되면 사이드바를 다시 열기
  useEffect(() => {
    if (isSelected) {
      setIsSidebarVisible(true);
    }
  }, [selectedProjectId, selectedOfficeId]); // eslint-disable-line react-hooks/exhaustive-deps

  // 회원정보 페이지 표시 시 다른 컴포넌트 렌더링
  if (showUserInfo) {
    return <UserInfoTable />;
  }

  // AI분석메뉴 관리 페이지 표시 시 다른 컴포넌트 렌더링
  if (showAIAnalysisMenu) {
    return <AIAnalysisAdminUpMenuTable />;
  }

  // 결제관리 페이지 표시 시 다른 컴포넌트 렌더링
  if (showPaymentMenu) {
    return <PaymentManagementPage />;
  }

  // 로딩 상태는 데이터를 실제로 불러오는 중일 때만 표시
  if (sidebarLoading) {
    return (
      <div className='flex h-[400px] w-full items-center justify-center'>
        <Spinner
          size='lg'
          color='primary'
          label='데이터를 불러오는 중입니다...'
          classNames={{
            label: 'text-sm font-medium text-gray-600',
          }}
        />
      </div>
    );
  }

  // 사건관리가 선택된 경우 레이아웃 변경
  if (showCaseManagement) {
    return (
      <div className=''>
        {isSelected ? (
          <div className='flex h-[calc(100vh-100px)]'>
            {/* 사건 목록 사이드바 - 사건이 선택되었을 때만 표시 */}
            {isSidebarVisible && (
              <div className='w-[200px] border-r bg-gray-50'>
                <div className='mb-4 flex items-center justify-between p-2'>
                  <h2 className='text-lg font-semibold text-gray-800'>사건 목록</h2>
                  <button
                    onClick={handleCloseSidebar}
                    className='flex h-6 w-6 items-center justify-center rounded-full bg-gray-200 hover:bg-gray-300'
                    title='사이드바 닫기'
                  >
                    <ChevronLeft className='h-4 w-4 text-gray-600' />
                  </button>
                </div>

                {error && <div className='mx-2 mb-4 rounded bg-red-100 p-3 text-red-700'>{error}</div>}

                <div className='max-h-[calc(100vh-100px)] overflow-y-auto px-2'>
                  {requestList.map((dateGroup) => {
                    const { totalProjects, completedProjects } = getDateGroupStatus(dateGroup);
                    return (
                      <div key={dateGroup.date} className='mb-2 rounded-lg border bg-white'>
                        <div className=''>
                          <button
                            onClick={() => onToggle(dateGroup.date)}
                            className='w-full items-center justify-between rounded p-2 text-left hover:bg-gray-100'
                          >
                            <div className='flex items-center gap-2'>
                              <span className='font-bold text-gray-900'>{formatDateWithDots(dateGroup.date)}</span>
                              {openItems[dateGroup.date] ? <ChevronDown className='h-4 w-4' /> : <ChevronRight className='h-4 w-4' />}
                            </div>

                            {/* 그룹 몇개 중 몇개 완료  */}
                            <div className='flex items-center gap-2'>
                              <span className='text-[12px] text-[#5B5B5B]'>
                                {totalProjects}개중 {completedProjects}개 완료
                              </span>
                            </div>
                          </button>
                        </div>

                        {openItems[dateGroup.date] && (
                          <div className='mt-1 space-y-1'>
                            {dateGroup.requests?.map((request: any, index: number) => {
                              const isIncomplete = isProjectIncomplete(request);
                              const isRequestSelected = selectedProjectId === request.project_id && selectedOfficeId === request.office_id;

                              return (
                                <div
                                  key={`${request.project_id}-${request.office_id}-${index}`}
                                  className={`flex items-center gap-2 rounded bg-white p-2 text-left text-sm ${
                                    isRequestSelected ? 'border-2 border-blue-500' : 'border border-gray-200'
                                  }`}
                                >
                                  <div
                                    className={`flex h-6 w-6 items-center justify-center rounded-full text-xs font-bold text-white ${
                                      isIncomplete ? 'bg-red-500' : 'bg-blue-500'
                                    }`}
                                  >
                                    {index + 1}
                                  </div>
                                  <button
                                    onClick={() => handleProjectSelect(request.project_id, request.office_id)}
                                    className='flex-1 text-left hover:bg-gray-50'
                                  >
                                    <div className={`font-medium ${isIncomplete ? 'text-red-700' : 'text-gray-900'}`}>
                                      {request.office_nm}
                                    </div>
                                    <div className={`text-xs ${isIncomplete ? 'text-red-600' : 'text-gray-500'}`}>{request.project_nm}</div>
                                  </button>
                                </div>
                              );
                            })}
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>
              </div>
            )}

            {/* 메인 컨텐츠 영역 */}
            <div className='flex-1'>
              <div className='w-full pl-[20px]'>
                <div className='border-b border-gray-200'>
                  <div className='flex items-center justify-between gap-4 py-4'>
                    <div className='flex items-center gap-2'>
                      {/* 사이드바 열기 버튼 - 사이드바가 닫혀있을 때만 표시 */}
                      {!isSidebarVisible && (
                        <button
                          onClick={handleOpenSidebar}
                          className='mr-2 flex h-8 w-8 items-center justify-center rounded-lg bg-blue-500 text-white shadow-md transition-all hover:bg-blue-600'
                          title='사이드바 열기'
                        >
                          <ChevronRight className='h-4 w-4' />
                        </button>
                      )}
                      <span className='text-[20px] font-semibold text-[#212121]'>{officeName}</span>
                      <span className='text-[20px] font-semibold text-[#7d7d7d]'>({projectName})</span>
                    </div>
                    <div className='flex items-center justify-end gap-2'>
                      <span className='text-[14px] text-[#5B5B5B]'>업로드 정보:</span>
                      <span className='text-[14px] text-[#5B5B5B]'>{user}</span>
                      <span className='text-[14px] text-[#5B5B5B]'>{userEmail}</span>
                      <span className='text-[14px] text-[#5B5B5B]'>{userPhone}</span>
                    </div>
                  </div>
                </div>

                {/* 기존 탭들 */}
                <Tabs defaultValue='upload' className=''>
                  <TabsList className='mt-4'>
                    <TabsTrigger value='upload' className='text-[18px]'>
                      원본파일
                    </TabsTrigger>
                    <TabsTrigger value='evidence' className='text-[18px]'>
                      증거목록
                    </TabsTrigger>
                    <TabsTrigger value='table' className='text-[18px]'>
                      매칭테이블
                    </TabsTrigger>
                    <TabsTrigger value='summation' className='text-[18px]'>
                      요약
                    </TabsTrigger>
                    <TabsTrigger value='permission' className='text-[18px]'>
                      권한
                    </TabsTrigger>
                    <TabsTrigger value='aiAnalysis' className='text-[18px]'>
                      AI분석
                    </TabsTrigger>
                  </TabsList>
                  <TabsContent value='upload' className=''>
                    <EvidenceUploadTable
                      key={`upload-${selectedProjectId}-${selectedOfficeId}`}
                      selectedProjectId={selectedProjectId}
                      selectedOfficeId={selectedOfficeId}
                      officeName={officeName}
                      projectName={projectName}
                      projectDate={projectDate}
                    />
                  </TabsContent>
                  <TabsContent value='evidence' className=''>
                    <EvidenceListTable
                      key={`evidence-${selectedProjectId}-${selectedOfficeId}`}
                      selectedProjectId={selectedProjectId}
                      selectedOfficeId={selectedOfficeId}
                    />
                  </TabsContent>
                  <TabsContent value='table' className=''>
                    <EvidenceMatchingTable
                      key={`table-${selectedProjectId}-${selectedOfficeId}`}
                      selectedProjectId={selectedProjectId}
                      selectedOfficeId={selectedOfficeId}
                      selectedProjectName={projectName}
                      officeName={officeName}
                      projectName={projectName}
                      projectDate={projectDate}
                    />
                  </TabsContent>
                  <TabsContent value='summation' className=''>
                    <EvidenceSummaryTable
                      key={`summation-${selectedProjectId}-${selectedOfficeId}`}
                      selectedProjectId={selectedProjectId}
                      selectedOfficeId={selectedOfficeId}
                    />
                  </TabsContent>
                  <TabsContent value='permission' className=''>
                    <EvidencePermissionTable
                      key={`permission-${selectedProjectId}-${selectedOfficeId}`}
                      selectedProjectId={selectedProjectId}
                      selectedOfficeId={selectedOfficeId}
                    />
                  </TabsContent>
                  <TabsContent value='aiAnalysis' className=''>
                    <AIAnalysisMenuTable
                      key={`aiAnalysis-${selectedProjectId}-${selectedOfficeId}`}
                      selectedProjectId={selectedProjectId}
                      selectedOfficeId={selectedOfficeId}
                      selectedProjectName={projectName}
                      selectedClientName={clientName}
                      selectedAiClickCount={selectedAiClickCount}
                    />
                  </TabsContent>
                </Tabs>
              </div>
            </div>
          </div>
        ) : (
          <CaseListPage onCaseSelect={onCaseSelect} />
        )}
      </div>
    );
  }

  // 프로젝트가 선택되지 않은 경우 선택 메시지 표시
  if (!isSelected) {
    return <NoSelectionMessage />;
  }

  return (
    <div className='w-full'>
      <div className='flex justify-between border-b border-gray-200'>
        <div className='flex items-center gap-4'>
          <div className='flex items-center gap-2'>
            <span className='text-[20px] font-semibold text-[#212121]'>{officeName}</span>
            <span className='text-[20px] font-semibold text-[#212121]'>({projectName})</span>
            <span className='text-[20px] font-semibold text-[#212121]'>{formatDate(projectDate)}</span>
          </div>
          <div className='flex items-center gap-2'>
            <span className='text-[20px] font-semibold text-[#212121]'>업로드 정보:</span>
            <span className='text-[20px] font-semibold text-[#212121]'>{user}</span>
            <span className='text-[20px] font-semibold text-[#212121]'>{userEmail}</span>
            <span className='text-[20px] font-semibold text-[#212121]'>{userPhone}</span>
          </div>
        </div>
      </div>
      <Tabs defaultValue='original' className='mt-4'>
        <TabsList className='flex'>
          <TabsTrigger value='original' className=' '>
            원본파일
          </TabsTrigger>
          <TabsTrigger value='evidence' className=''>
            증거목록
          </TabsTrigger>
          <TabsTrigger value='table' className=''>
            매칭테이블
          </TabsTrigger>
          <TabsTrigger value='summation' className=''>
            요약
          </TabsTrigger>
          <TabsTrigger value='permission' className=''>
            권한
          </TabsTrigger>
          <TabsTrigger value='aiAnalysis' className=''>
            AI분석
          </TabsTrigger>
        </TabsList>
        <TabsContent value='original' className=''>
          <EvidenceUploadTable
            key={`upload-${selectedProjectId}-${selectedOfficeId}`}
            selectedProjectId={selectedProjectId}
            selectedOfficeId={selectedOfficeId}
            officeName={officeName}
            projectName={projectName}
            projectDate={projectDate}
          />
        </TabsContent>
        {/* 증거목록 */}
        <TabsContent value='evidence' className=''>
          <EvidenceListTable
            key={`list-${selectedProjectId}-${selectedOfficeId}`}
            selectedProjectId={selectedProjectId}
            selectedOfficeId={selectedOfficeId}
          />
        </TabsContent>
        <TabsContent value='table' className=''>
          <EvidenceMatchingTable
            key={`table-${selectedProjectId}-${selectedOfficeId}`}
            selectedProjectId={selectedProjectId}
            selectedOfficeId={selectedOfficeId}
            selectedProjectName={projectName}
            officeName={officeName}
            projectName={projectName}
            projectDate={projectDate}
          />
        </TabsContent>
        <TabsContent value='summation' className=''>
          <EvidenceSummaryTable
            key={`summation-${selectedProjectId}-${selectedOfficeId}`}
            selectedProjectId={selectedProjectId}
            selectedOfficeId={selectedOfficeId}
          />
        </TabsContent>
        <TabsContent value='permission' className=''>
          <EvidencePermissionTable
            key={`permission-${selectedProjectId}-${selectedOfficeId}`}
            selectedProjectId={selectedProjectId}
            selectedOfficeId={selectedOfficeId}
          />
        </TabsContent>
        <TabsContent value='aiAnalysis' className=''>
          <AIAnalysisMenuTable
            key={`aiAnalysis-${selectedProjectId}-${selectedOfficeId}`}
            selectedProjectId={selectedProjectId}
            selectedOfficeId={selectedOfficeId}
            selectedProjectName={projectName}
            selectedClientName={clientName}
            selectedAiClickCount={selectedAiClickCount}
          />
        </TabsContent>
      </Tabs>
    </div>
  );
}
