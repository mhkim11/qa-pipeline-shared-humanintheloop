import { useState } from 'react';

import { Spinner } from '@nextui-org/spinner';
import { IoMdSend, IoIosWarning } from 'react-icons/io';

import { onMessageToast } from '@/components/utils';
import { useAssignLawyerToCase } from '@/hooks/react-query/mutation';
import { useFindAllUser, useFindCase } from '@/hooks/react-query/query';

// 권한 부여 확인 모달 컴포넌트
const PermissionAssignModal = ({
  isOpen,
  onClose,
  onConfirm,
  userName,
  userEmail,
  isLoading,
}: {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
  userName: string;
  userEmail: string;
  isLoading: boolean;
}) => {
  if (!isOpen) return null;

  return (
    <div className='fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50'>
      <div className='w-full max-w-md transform rounded-lg bg-white p-6 shadow-xl transition-all'>
        <div className='mb-4 flex items-center justify-between'>
          <h3 className='text-lg font-semibold text-gray-900'>권한 부여 확인</h3>
          <button onClick={onClose} className='rounded-full p-1 text-gray-400 transition-colors hover:bg-gray-100 hover:text-gray-600'>
            <svg className='h-5 w-5' fill='none' viewBox='0 0 24 24' stroke='currentColor'>
              <path strokeLinecap='round' strokeLinejoin='round' strokeWidth={2} d='M6 18L18 6M6 6l12 12' />
            </svg>
          </button>
        </div>

        <div className='mb-6'>
          <div className='mb-4 rounded-lg bg-orange-50 p-4'>
            <div className='flex items-center'>
              <div className='flex-shrink-0'>
                <svg className='h-5 w-5 text-orange-400' viewBox='0 0 20 20' fill='currentColor'>
                  <path
                    fillRule='evenodd'
                    d='M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z'
                    clipRule='evenodd'
                  />
                </svg>
              </div>
              <div className='ml-3'>
                <h3 className='text-sm font-medium text-red-500'>이 작업은 되돌릴 수 없습니다.</h3>
              </div>
            </div>
          </div>

          <div className='space-y-2'>
            <p className='text-sm text-gray-600'>
              다음 사용자에게 <strong>일반권한</strong>을 부여하시겠습니까?
            </p>
            <div className='rounded-lg border border-gray-200 bg-gray-50 p-3'>
              <p className='font-medium text-gray-900'>{userName}</p>
              <p className='text-sm text-gray-600'>{userEmail}</p>
            </div>
          </div>
        </div>

        <div className='flex gap-3'>
          <button
            onClick={onClose}
            disabled={isLoading}
            className='flex-1 rounded-lg border border-gray-300 bg-white px-4 py-2 text-sm font-medium text-gray-700 transition-colors hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-gray-500 focus:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50'
          >
            취소
          </button>
          <button
            onClick={onConfirm}
            disabled={isLoading}
            className='flex-1 rounded-lg bg-blue-600 px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50'
          >
            {isLoading ? (
              <div className='flex items-center justify-center'>
                <Spinner size='sm' color='white' />
                <span className='ml-2'>처리 중...</span>
              </div>
            ) : (
              '권한 부여'
            )}
          </button>
        </div>
      </div>
    </div>
  );
};

interface IEvidencePermissionTableProps {
  selectedProjectId: string;
  selectedOfficeId: string;
}

interface IUser {
  user_id: string;
  name: string;
  email: string;
  role: string;
  isActive: boolean;
}

export const EvidencePermissionTable = ({ selectedProjectId, selectedOfficeId }: IEvidencePermissionTableProps): JSX.Element => {
  const [isAssignModalOpen, setIsAssignModalOpen] = useState(false);
  const [selectedUser, setSelectedUser] = useState<IUser | null>(null);

  // API 호출 - 전체 사용자 조회
  const {
    response: allUsersData,
    isLoading: isLoadingUsers,
    error: usersError,
    refetch: refetchUsers,
  } = useFindAllUser({
    email: '',
    tel: '',
    name: '',
    role: '',
    phone: '',
    isActive: '',
    registrationStatus: '',
    office_id: selectedOfficeId,
    page_no: 1,
    certify_status: '',
    block_cnt: 10000,
  });

  // API 호출 - 사건 조회
  const { response: caseData, isLoading: isLoadingCase, error: caseError, refetch: refetchCase } = useFindCase(selectedProjectId);

  // API 호출 - 사용자 권한 부여
  const { onAssignLawyerToCase, isPending: isAssigning } = useAssignLawyerToCase();

  // 사용자 데이터 안전하게 추출 (여러 가능한 구조 고려)
  const getUsersArray = () => {
    if (!allUsersData?.data) return [];

    const data = allUsersData.data as any;

    // 다양한 API 응답 구조 처리
    if (Array.isArray(data)) return data;
    if (Array.isArray(data.items)) return data.items;
    if (Array.isArray(data.list)) return data.list;
    if (Array.isArray(data.users)) return data.users;

    return [];
  };

  const allUsers = getUsersArray();
  const caseMembers = Array.isArray(caseData?.data?.members) ? caseData.data.members : [];
  const caseManagers = Array.isArray(caseData?.data?.managers) ? caseData.data.managers : [];

  // 사용자 권한 상태 확인 함수
  const getUserPermissionStatus = (userId: string) => {
    const isManager = caseManagers.some((manager) => manager.user_id === userId);
    const isMember = caseMembers.some((member) => member.user_id === userId);

    if (isManager) return 'manager';
    if (isMember) return 'member';
    return 'none';
  };

  // 권한 부여 버튼 클릭 핸들러
  const handleAssignPermission = (user: IUser) => {
    setSelectedUser(user);
    setIsAssignModalOpen(true);
  };

  // 권한 부여 확인 핸들러
  const handleConfirmAssign = async () => {
    if (!selectedUser) return;

    try {
      const result = await onAssignLawyerToCase({
        project_id: selectedProjectId,
        user_id: selectedUser.user_id,
      });

      if (result?.isSuccess) {
        onMessageToast({
          message: `${selectedUser.name}님에게 권한이 부여되었습니다.`,
          icon: <IoMdSend className='h-5 w-5 text-green-500' />,
        });

        // 데이터 새로고침
        refetchCase();
        refetchUsers();
      } else {
        onMessageToast({
          message: result?.message || '권한 부여에 실패했습니다.',
          icon: <IoIosWarning className='h-5 w-5 text-yellow-500' />,
        });
      }
    } catch (error) {
      console.error(error);
      onMessageToast({
        message: '권한 부여 중 오류가 발생했습니다.',
        icon: <IoIosWarning className='h-5 w-5 text-yellow-500' />,
      });
    } finally {
      setIsAssignModalOpen(false);
      setSelectedUser(null);
    }
  };

  // 권한 상태에 따른 표시 텍스트 및 스타일
  const getPermissionDisplay = (status: string) => {
    switch (status) {
      case 'manager':
        return {
          text: '사건 관리자 권한',
          className: 'text-blue-600 font-semibold bg-blue-50 px-2 py-1 rounded',
        };
      case 'member':
        return {
          text: '권한 있음',
          className: 'text-green-600 font-semibold bg-green-50 px-2 py-1 rounded',
        };
      default:
        return {
          text: '',
          className: '',
        };
    }
  };

  return (
    <div className='max-h-[calc(100vh-200px)] overflow-y-auto pb-10 pl-4'>
      {/* 프로젝트 정보 표시 */}
      <div className='mb-4 mt-10 flex items-center text-xs'>
        <div>
          <strong>Project ID:</strong> {selectedProjectId || ''} / <strong>Office ID:</strong> {selectedOfficeId || ''}
        </div>
      </div>

      {/* 로딩 상태 */}
      {(isLoadingUsers || isLoadingCase) && (
        <div className='flex h-40 items-center justify-center'>
          <div className='text-gray-500'>로딩 중...</div>
        </div>
      )}

      {/* 오류 상태 체크 */}
      {!isLoadingUsers && !isLoadingCase && (usersError || caseError) && (
        <div className='rounded-lg bg-red-50 p-4'>
          <div className='text-sm text-red-800'>
            <h3 className='mb-2 font-semibold'>데이터 로딩 오류</h3>
            {usersError && <p>• 사용자 데이터: {usersError.message || '알 수 없는 오류'}</p>}
            {caseError && <p>• 사건 데이터: {caseError.message || '알 수 없는 오류'}</p>}
            <p className='mt-2 text-xs text-red-600'>콘솔을 확인하여 자세한 정보를 확인해주세요.</p>
          </div>
        </div>
      )}

      {/* allUsers가 배열이 아닌 경우 */}
      {!isLoadingUsers && !isLoadingCase && !usersError && !Array.isArray(allUsers) && (
        <div className='rounded-lg bg-yellow-50 p-4'>
          <div className='text-sm text-yellow-800'>
            <h3 className='mb-2 font-semibold'>데이터 구조 오류</h3>
            <p>사용자 데이터가 예상된 배열 형태가 아닙니다.</p>
            <p className='mt-2 text-xs'>받은 데이터 타입: {typeof allUsersData?.data}</p>
          </div>
        </div>
      )}

      {/* 사용자 목록 테이블 */}
      {!isLoadingUsers && !isLoadingCase && Array.isArray(allUsers) && (
        <div className='rounded-lg bg-white shadow'>
          <div className='border-b bg-gray-50 px-4 py-3'>
            <h3 className='text-lg font-medium text-gray-900'>사용자 권한 관리</h3>
          </div>

          <div className='overflow-x-auto'>
            <table className='min-w-full divide-y divide-gray-200'>
              <thead className='bg-gray-50'>
                <tr>
                  <th className='px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500'>사용자명</th>
                  <th className='px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500'>이메일</th>

                  <th className='px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500'>상태</th>
                  <th className='px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500'>권한 상태</th>
                  <th className='px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500'>액션</th>
                </tr>
              </thead>
              <tbody className='divide-y divide-gray-200 bg-white'>
                {allUsers.map((user: any) => {
                  const permissionStatus = getUserPermissionStatus(user.user_id);
                  const permissionDisplay = getPermissionDisplay(permissionStatus);

                  return (
                    <tr key={user.user_id} className='hover:bg-gray-50'>
                      <td className='whitespace-nowrap px-6 py-4 text-sm font-medium text-gray-900'>{user.name}</td>
                      <td className='whitespace-nowrap px-6 py-4 text-sm text-gray-500'>{user.email}</td>

                      <td className='whitespace-nowrap px-6 py-4'>
                        <span
                          className={`inline-flex rounded-full px-2 py-1 text-xs font-semibold ${
                            user.isActive ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
                          }`}
                        >
                          {user.isActive ? '활성' : '비활성'}
                        </span>
                      </td>
                      <td className='whitespace-nowrap px-6 py-4 text-sm'>
                        {permissionDisplay.text && <span className={permissionDisplay.className}>{permissionDisplay.text}</span>}
                      </td>
                      <td className='whitespace-nowrap px-6 py-4 text-sm font-medium'>
                        {permissionStatus === 'none' && user.isActive && (
                          <button
                            onClick={() => handleAssignPermission(user)}
                            disabled={isAssigning}
                            className='rounded bg-blue-600 px-3 py-1 text-sm text-white hover:bg-blue-700 disabled:cursor-not-allowed disabled:opacity-50'
                          >
                            {isAssigning ? '처리 중...' : '권한 부여'}
                          </button>
                        )}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>

          {/* 데이터가 없을 때 */}
          {allUsers.length === 0 && <div className='py-8 text-center text-gray-500'>사용자 데이터가 없습니다.</div>}
        </div>
      )}

      {/* 권한 부여 확인 모달 */}
      <PermissionAssignModal
        isOpen={isAssignModalOpen}
        onClose={() => {
          setIsAssignModalOpen(false);
          setSelectedUser(null);
        }}
        onConfirm={handleConfirmAssign}
        userName={selectedUser?.name || ''}
        userEmail={selectedUser?.email || ''}
        isLoading={isAssigning}
      />
    </div>
  );
};
