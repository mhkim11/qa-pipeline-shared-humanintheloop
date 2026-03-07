import { Spinner } from '@nextui-org/spinner';
import { ChevronDown, ChevronUp } from 'lucide-react';

interface IProjectRequest {
  office_id: string;
  office_nm: string;
  project_id: string;
  project_nm: string;
  requested_at: string;
  evidence_upload_status: string;
  matching_upload_status: string;
  summary_upload_status: string;
  original_upload_status: string;
  split_status: string;
  ocr_status: string;
  isActive?: boolean;
}

interface IRequestListByDate {
  date: string;
  requests: IProjectRequest[];
}

interface ICaseManagementDashboardProps {
  requestList: IRequestListByDate[];
  openItems: { [key: string]: boolean };
  onToggle: (date: string) => void;
  handleProjectSelect: (projectId: string, officeId: string) => void;
  handleDeleteProject: (projectId: string, projectName: string, officeName: string, e: React.MouseEvent) => void;
  deletingProjectId: string | null;
  selectedProjectId: string | null;
  selectedOfficeId: string | null;
  isProjectCompleted: (request: IProjectRequest) => boolean;
  getDateGroupStatus: (requests: IProjectRequest[]) => { completedProjects: number; totalProjects: number };
  getDateGroupOcrFailures: (requests: IProjectRequest[]) => number;
  formatDateWithDots: (dateString: string) => string;
}

export function CaseManagementDashboard({
  requestList,
  openItems,
  onToggle,
  handleProjectSelect,
  handleDeleteProject,
  deletingProjectId,
  selectedProjectId,
  selectedOfficeId,
  isProjectCompleted,
  getDateGroupStatus,
  getDateGroupOcrFailures,
  formatDateWithDots,
}: ICaseManagementDashboardProps) {
  return (
    <div className='h-full w-full p-6'>
      <div className='mb-6'>
        <h1 className='text-2xl font-bold text-gray-900'>사건 관리 대시보드</h1>
        <p className='mt-2 text-gray-600'>등록된 사건들을 날짜별로 관리하고 모니터링할 수 있습니다.</p>
      </div>

      <div className='grid gap-6'>
        {/* 통계 카드들 */}
        <div className='grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4'>
          {(() => {
            const allRequests = requestList.flatMap((item) => item.requests.filter((req) => req.isActive !== false));
            const totalProjects = allRequests.length;
            const completedProjects = allRequests.filter(isProjectCompleted).length;
            const failedProjects = allRequests.filter((req) => req.ocr_status === '실패').length;
            const inProgressProjects = totalProjects - completedProjects;

            return (
              <>
                <div className='rounded-lg bg-white p-6 shadow-sm ring-1 ring-gray-200'>
                  <div className='flex items-center'>
                    <div className='flex-shrink-0'>
                      <div className='flex h-8 w-8 items-center justify-center rounded-full bg-blue-100'>
                        <span className='text-sm font-medium text-blue-600'>전체</span>
                      </div>
                    </div>
                    <div className='ml-4'>
                      <p className='text-sm font-medium text-gray-500'>총 사건 수</p>
                      <p className='text-2xl font-semibold text-gray-900'>{totalProjects}</p>
                    </div>
                  </div>
                </div>

                <div className='rounded-lg bg-white p-6 shadow-sm ring-1 ring-gray-200'>
                  <div className='flex items-center'>
                    <div className='flex-shrink-0'>
                      <div className='flex h-8 w-8 items-center justify-center rounded-full bg-green-100'>
                        <span className='text-sm font-medium text-green-600'>완료</span>
                      </div>
                    </div>
                    <div className='ml-4'>
                      <p className='text-sm font-medium text-gray-500'>완료된 사건</p>
                      <p className='text-2xl font-semibold text-green-600'>{completedProjects}</p>
                    </div>
                  </div>
                </div>

                <div className='rounded-lg bg-white p-6 shadow-sm ring-1 ring-gray-200'>
                  <div className='flex items-center'>
                    <div className='flex-shrink-0'>
                      <div className='flex h-8 w-8 items-center justify-center rounded-full bg-yellow-100'>
                        <span className='text-sm font-medium text-yellow-600'>진행</span>
                      </div>
                    </div>
                    <div className='ml-4'>
                      <p className='text-sm font-medium text-gray-500'>진행중인 사건</p>
                      <p className='text-2xl font-semibold text-yellow-600'>{inProgressProjects}</p>
                    </div>
                  </div>
                </div>

                <div className='rounded-lg bg-white p-6 shadow-sm ring-1 ring-gray-200'>
                  <div className='flex items-center'>
                    <div className='flex-shrink-0'>
                      <div className='flex h-8 w-8 items-center justify-center rounded-full bg-red-100'>
                        <span className='text-sm font-medium text-red-600'>실패</span>
                      </div>
                    </div>
                    <div className='ml-4'>
                      <p className='text-sm font-medium text-gray-500'>실패한 사건</p>
                      <p className='text-2xl font-semibold text-red-600'>{failedProjects}</p>
                    </div>
                  </div>
                </div>
              </>
            );
          })()}
        </div>

        {/* 날짜별 사건 목록 */}
        <div className='rounded-lg bg-white shadow-sm ring-1 ring-gray-200'>
          <div className='border-b border-gray-200 px-6 py-4'>
            <h2 className='text-lg font-semibold text-gray-900'>날짜별 사건 목록</h2>
          </div>
          <div className='max-h-96 overflow-y-auto p-6'>
            <div className='space-y-4'>
              {requestList.map((item) => {
                const { completedProjects, totalProjects } = getDateGroupStatus(item.requests);
                const failedProjects = getDateGroupOcrFailures(item.requests);

                // 프로젝트가 0개인 경우 날짜 섹션을 숨김
                if (totalProjects === 0) {
                  return null;
                }

                return (
                  <div key={item.date} className='w-full'>
                    <div className='overflow-hidden rounded-lg border border-gray-200 bg-white shadow-sm'>
                      <button
                        className='flex w-full items-center justify-between p-4 text-left transition-all hover:bg-gray-50'
                        onClick={() => onToggle(item.date)}
                      >
                        <div className='flex w-full flex-1 flex-col gap-2'>
                          <span className='text-xl font-semibold text-gray-800'>{formatDateWithDots(item.date)}</span>
                          <div className='flex items-center gap-4'>
                            <div className='flex items-center gap-1'>
                              <span className='text-sm font-bold text-gray-900'>{totalProjects}</span>
                              <span className='text-sm text-gray-500'>개 사건</span>
                            </div>
                            <div className='flex items-center gap-1'>
                              <span className='text-sm font-bold text-green-600'>{completedProjects}</span>
                              <span className='text-xs text-gray-500'>완료</span>
                            </div>
                            {failedProjects > 0 && (
                              <div className='flex items-center gap-1'>
                                <span className='text-sm font-bold text-red-600'>{failedProjects}</span>
                                <span className='text-xs text-gray-500'>실패</span>
                              </div>
                            )}
                          </div>
                        </div>
                        <div className='ml-4 flex flex-shrink-0 items-center'>
                          {openItems[item.date] ? (
                            <ChevronUp className='h-5 w-5 text-gray-600 transition-transform' />
                          ) : (
                            <ChevronDown className='h-5 w-5 text-gray-600 transition-transform' />
                          )}
                        </div>
                      </button>

                      {openItems[item.date] && (
                        <div className='border-t border-gray-100 bg-gray-50/30'>
                          <div className='grid gap-3 p-4 sm:grid-cols-2 lg:grid-cols-3'>
                            {item.requests
                              .filter((request) => request.isActive !== false)
                              .map((request, index) => (
                                <div
                                  key={request.project_id}
                                  className={`group relative cursor-pointer rounded-lg p-4 transition-all hover:shadow-md ${
                                    request.project_id === selectedProjectId && request.office_id === selectedOfficeId
                                      ? 'bg-blue-100 shadow-md ring-2 ring-blue-200'
                                      : isProjectCompleted(request)
                                        ? 'bg-green-50 hover:bg-green-100'
                                        : 'bg-red-50 hover:bg-red-100'
                                  }`}
                                  onClick={() => handleProjectSelect(request.project_id, request.office_id)}
                                >
                                  <div className='flex items-start justify-between'>
                                    <div className='flex-1'>
                                      <div className='flex items-center gap-2'>
                                        <div
                                          className={`flex h-6 w-6 flex-shrink-0 items-center justify-center rounded-full text-xs font-semibold ${
                                            request.project_id === selectedProjectId && request.office_id === selectedOfficeId
                                              ? 'bg-blue-600 text-white'
                                              : isProjectCompleted(request)
                                                ? 'bg-green-600 text-white'
                                                : 'bg-red-600 text-white'
                                          }`}
                                        >
                                          {index + 1}
                                        </div>
                                        <span
                                          className={`text-sm font-semibold ${
                                            request.project_id === selectedProjectId && request.office_id === selectedOfficeId
                                              ? 'text-blue-900'
                                              : isProjectCompleted(request)
                                                ? 'text-green-800'
                                                : 'text-red-800'
                                          }`}
                                        >
                                          {request.office_nm}
                                        </span>
                                      </div>
                                      <p className='mt-2 text-sm font-medium text-gray-900'>{request.project_nm}</p>
                                      <div className='mt-2 flex flex-wrap gap-1'>
                                        <span
                                          className={`inline-flex rounded-full px-2 py-1 text-xs font-medium ${
                                            request.evidence_upload_status === '완료'
                                              ? 'bg-green-100 text-green-800'
                                              : 'bg-yellow-100 text-yellow-800'
                                          }`}
                                        >
                                          증거: {request.evidence_upload_status}
                                        </span>
                                        <span
                                          className={`inline-flex rounded-full px-2 py-1 text-xs font-medium ${
                                            request.ocr_status === '완료'
                                              ? 'bg-green-100 text-green-800'
                                              : request.ocr_status === '실패'
                                                ? 'bg-red-100 text-red-800'
                                                : 'bg-yellow-100 text-yellow-800'
                                          }`}
                                        >
                                          OCR: {request.ocr_status}
                                        </span>
                                      </div>
                                    </div>
                                    <button
                                      className='invisible ml-2 flex-shrink-0 rounded bg-red-500 px-2 py-1 text-xs text-white transition-all hover:bg-red-600 disabled:cursor-not-allowed disabled:bg-gray-400 group-hover:visible'
                                      onClick={(e) => handleDeleteProject(request.project_id, request.project_nm, request.office_nm, e)}
                                      disabled={deletingProjectId === request.project_id}
                                    >
                                      {deletingProjectId === request.project_id ? <Spinner size='sm' color='white' /> : '삭제'}
                                    </button>
                                  </div>
                                </div>
                              ))}
                          </div>
                        </div>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
