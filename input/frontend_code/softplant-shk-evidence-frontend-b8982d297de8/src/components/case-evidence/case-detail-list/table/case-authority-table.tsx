import { useState } from 'react';

import { useQuery } from '@tanstack/react-query';
import { FaExclamationCircle } from 'react-icons/fa';
import { FaUser } from 'react-icons/fa6';
import { IoIosWarning, IoMdCheckmarkCircle } from 'react-icons/io';
import { TbChessQueenFilled } from 'react-icons/tb';
import { useSearchParams } from 'react-router-dom';

import { useFindUserInfo } from '@query/query';
import { fetchFindCase } from '@/apis/evidence-admin-api';
import { fetchExitProject, fetchCancelProjectInvitation } from '@/apis/evidence-api';
import { TExitProjectInput } from '@/apis/type';
import ModalSelect from '@/components/common/modal/modal-select';
import ModalSelectBox from '@/components/common/modal/modal-select-box';
import WarningModal from '@/components/common/modal/modal-warning-component';
import { AuthModal } from '@/components/evidence/modal/evidence-auth-modal';
import { Select, SelectContent, SelectItem, SelectTrigger } from '@/components/ui/select';
import { onMessageToast } from '@/components/utils';
import { useDelegateSuperPermission, useProcessJoinRequest, useExcludeProject } from '@/hooks/react-query';
import {
  // useResignEvidenceSuperUser,
  // useResignEvidenceUser,
  // useResignEvidenceSelfUser,

  useSuperPermissionRequest,
} from '@/hooks/react-query/mutation';
import { useFindProjectMembers } from '@/hooks/react-query/query/evidence/use-find-project-members';

export const CaseAuthorityTable = (): JSX.Element => {
  // ! api
  const { onProcessJoinRequest } = useProcessJoinRequest();
  // const { onResignEvidenceUser } = useResignEvidenceUser();
  // const { onResignEvidenceSelfUser } = useResignEvidenceSelfUser();
  const { onExcludeProject } = useExcludeProject();
  const { response: findEvidenceUserInfo } = useFindUserInfo();
  const [searchParams] = useSearchParams();
  const projectId = searchParams.get('project_id');
  const projectName = searchParams.get('project_name');

  const [selectedUserName, setSelectedUserName] = useState<string>('');
  const [selectedRequestId, setSelectedRequestId] = useState<string>('');
  const [selectedRequestRole, setSelectedRequestRole] = useState<string>('');
  const [selectedProjectId, setSelectedProjectId] = useState<string>('');
  const [selectedUserId, setSelectedUserId] = useState<string>('');

  console.log('selectedProjectId', selectedProjectId);
  console.log('setSelectedRequestRole', setSelectedRequestRole);
  // ! 모달 관련 상태
  const [isAuthModalOpen, setIsAuthModalOpen] = useState(false);
  const [isRefusalModalOpen, setIsRefusalModalOpen] = useState(false);
  const [isRequestModalOpen, setIsRequestModalOpen] = useState(false);
  const [isSuperRoleModalOpen, setIsSuperRoleModalOpen] = useState(false);
  const [isExitModalOpen, setIsExitModalOpen] = useState(false);
  const [isSuperExitModalOpen, setIsSuperExitModalOpen] = useState(false);
  const [isDelegateSuperPermissionModalOpen, setIsDelegateSuperPermissionModalOpen] = useState(false);
  // const [isSuperExitProcessModalOpen, setIsSuperExitProcessModalOpen] = useState(false);
  const [isExcludeProjectModalOpen, setIsExcludeProjectModalOpen] = useState(false);
  // const [isSelfResignProcessModalOpen, setIsSelfResignProcessModalOpen] = useState(false);
  // const [isResignProcessModalOpen, setIsResignProcessModalOpen] = useState(false);
  const [isPromoteProcessModalOpen, setIsPromoteProcessModalOpen] = useState(false);
  const [isWarningOpen, setIsWarningOpen] = useState(false);
  const [isCancelRequestModalOpen, setIsCancelRequestModalOpen] = useState(false);
  const [selectedRequestIdForCancel, setSelectedRequestIdForCancel] = useState<string>('');
  const fontSizeAdjustment = findEvidenceUserInfo?.data?.font_size_rate || 0;
  const currentUserId = findEvidenceUserInfo?.data?.user_id;

  const { onDelegateSuperPermission } = useDelegateSuperPermission();
  const { onRequestSuperPermission } = useSuperPermissionRequest();

  // 사건 정보 조회 (payment_status, expire_date 확인용) - 캐시로 중복 호출 방지
  const { data: findCaseResponse } = useQuery({
    queryKey: ['find-case', projectId],
    queryFn: () => fetchFindCase(projectId || ''),
    enabled: !!projectId,
    staleTime: 5 * 60 * 1000,
    gcTime: 10 * 60 * 1000,
    refetchOnWindowFocus: false,
    refetchOnMount: false,
    refetchOnReconnect: false,
  });
  const projectPaymentStatus = ((findCaseResponse as any)?.data as any)?.payment_status || null;
  const projectExpireDate = ((findCaseResponse as any)?.data as any)?.expire_date || null;
  // 프로젝트 멤버 조회 (React Query hook 사용)
  const { response: memberData, refetch: refetchMembers } = useFindProjectMembers({
    projectId: projectId || '',
  });
  const currentUserIsSuperRole = memberData?.data?.members?.find((m) => m.user_id === currentUserId)?.role === '사건관리자권한';
  // 폰트 크기 조정 옵션
  const fontSizeClasses = {
    18: ['text-base', 'text-lg', 'text-xl', 'text-2xl', 'text-3xl', 'text-4xl', 'text-5xl'],
    16: ['text-sm', 'text-base', 'text-lg', 'text-xl', 'text-2xl', 'text-3xl', 'text-4xl'],
    14: ['text-xs', 'text-sm', 'text-base', 'text-lg', 'text-xl', 'text-2xl', 'text-3xl'],
    12: ['text-2xs', 'text-xs', 'text-sm', 'text-base', 'text-lg', 'text-xl', 'text-2xl'],
  } as const;
  //  폰크크기 조정 클래스 선택
  const getFontSizeClass = (baseSize: keyof typeof fontSizeClasses, adjustment: number) => {
    const steps = [-30, -20, -10, 0, 10, 20, 30];
    const index = steps.indexOf(adjustment);
    return fontSizeClasses[baseSize][index !== -1 ? index : 3]; // 기본값(0%)은 index 3
  };
  const colorPalette = {
    green: '#406CFF',
    brown: '#B6753F',
    orange: '#FF6B1B',
    yellow: '#F3AA00',
    lightgreen: '#3BBC07',
    darkgreen: '#799C19',
    skyblue: '#43A5FF',
    purple: '#AC58FF',
    pink: '#E739D5',
  };
  const getUserColor = (color: string) => {
    return colorPalette[color as keyof typeof colorPalette] || color;
  };
  // 동적 폰트 크기 조정
  const getAdjustedSize = (baseSize: number) => {
    return baseSize * (1 + fontSizeAdjustment / 100);
  };
  // 참여중인 멤버 + 요청중인 멤버 통합
  const allMembers = [
    ...(memberData?.data?.members || []).map((member) => {
      console.log('Original member:', member);
      return {
        ...member,
        is_invited: (member as any).is_invited || false, // members에서 is_invited 속성 추가
        request_id: (member as any).request_id || member.user_id, // request_id 설정 (is_invited가 true면 이미 request_id가 있음)
      };
    }),
    ...(memberData?.data?.requests || []).map((request) => {
      console.log('Original request:', request);
      return {
        ...request,
        role: '요청중',
        isMe: false,
        requestedSuper: false,
        request_id: request.request_id,
        isRequest: true, // 요청중인 멤버 구분용
        is_invited: false, // requests는 일반 요청이므로 is_invited는 false
        // nickname과 user_color가 없어도 기본값 설정
        nickname: request.nickname || '',
        user_color: request.user_color || 'gray', // 기본 색상 설정
      };
    }),
  ];

  const sortedMembers = allMembers.sort((a, b) => {
    // '나'를 항상 최상위로
    if (a.isMe && !b.isMe) return -1;
    if (!a.isMe && b.isMe) return 1;

    // '나'가 아닌 경우, 슈퍼권한자를 그 다음으로
    if (!a.isMe && !b.isMe) {
      if (a.role === '사건관리자권한' && b.role !== '사건관리자권한') return -1;
      if (a.role !== '사건관리자권한' && b.role === '사건관리자권한') return 1;
    }

    // 슈퍼권한 요청 상태는 그 다음 순서로 유지
    if (a.requestedSuper && !b.requestedSuper) return -1;
    if (!a.requestedSuper && b.requestedSuper) return 1;

    return 0;
  });
  const isOnlyMember = () => {
    return memberData?.data?.members?.length === 1;
  };
  const handleRequestSuperAuthority = async () => {
    try {
      if (!projectId) {
        onMessageToast({
          message: '프로젝트 정보를 찾을 수 없습니다.',
          icon: <IoIosWarning className='h-5 w-5 text-yellow-500' />,
        });
        return;
      }

      const response = await onRequestSuperPermission({
        project_id: projectId,
      });

      console.log('응답:', response); // 응답 로깅

      if (response?.success) {
        onMessageToast({
          message: '사건관리자권한 요청이 전송되었습니다.',
          icon: <IoMdCheckmarkCircle className='h-5 w-5 text-green-500' />,
        });
        await refetchMembers();
      } else {
        // 실패 응답 처리
        onMessageToast({
          message: '이미 처리 대기중인 가입 요청이 있습니다.',
          icon: <FaExclamationCircle className='h-5 w-5 text-yellow-500' />,
        });
      }
    } catch (error: any) {
      console.error('예상치 못한 오류:', error);
      onMessageToast({
        message: '사건관리자권한 요청 중 오류가 발생했습니다.',
        icon: <FaExclamationCircle className='h-5 w-5 text-yellow-500' />,
      });
    } finally {
      setIsPromoteProcessModalOpen(false);
    }
  };
  const handleApprove = async (request_id: string, status: 'APPROVED' | 'REJECTED') => {
    try {
      const response = await onProcessJoinRequest({ request_id, status });
      if (response?.success) {
        onMessageToast({
          message: status === 'APPROVED' ? '승인되었습니다.' : '거절되었습니다.',
          icon: <IoMdCheckmarkCircle className='h-5 w-5 text-yellow-500' />,
        });
        await refetchMembers();
        setIsRefusalModalOpen(false);
        setIsRequestModalOpen(false);
        setIsSuperRoleModalOpen(false);
      } else {
        onMessageToast({
          message: `${status === 'APPROVED' ? '승인' : '거절'}에 실패했습니다.`,
          icon: <IoIosWarning className='h-5 w-5 text-yellow-500' />,
        });
      }
    } catch (error) {
      onMessageToast({
        message: `${status === 'APPROVED' ? '승인' : '거절'}에 실패했습니다.`,
        icon: <IoIosWarning className='h-5 w-5 text-yellow-500' />,
      });
      console.error(error);
    }
  };
  const handleExitProject = async () => {
    try {
      if (!projectId) return;

      const input: TExitProjectInput = {
        project_id: projectId,
      };

      const response = await fetchExitProject(input);

      if (response.success) {
        onMessageToast({
          message: '사건에서 나가기가 완료되었습니다.',
          icon: <IoMdCheckmarkCircle className='h-5 w-5 text-yellow-500' />,
        });
        window.location.href = '/';
      } else {
        onMessageToast({
          message: '사건에서 나가기에 실패했습니다.',
          icon: <IoIosWarning className='h-5 w-5 text-yellow-500' />,
        });
      }
    } catch (error) {
      console.error('사건에서 나가기 실패:', error);
      onMessageToast({
        message: '사건에서 나가기에 실패했습니다.',
        icon: <IoIosWarning className='h-5 w-5 text-yellow-500' />,
      });
    } finally {
      setIsExitModalOpen(false);
    }
  };
  const handleDelegateSuperPermission = async (targetUserId: string) => {
    try {
      const response = await onDelegateSuperPermission({
        project_id: projectId || '',
        receiver_id: targetUserId,
      });

      if (response?.success) {
        onMessageToast({
          message: '사건관리자권한이 위임되었습니다.',
          icon: <IoMdCheckmarkCircle className='h-5 w-5 text-yellow-500' />,
        });
        await refetchMembers(); // 멤버 목록 새로고침
        setIsDelegateSuperPermissionModalOpen(false);
      } else {
        onMessageToast({
          message: '사건관리자권한 위임에 실패했습니다.',
          icon: <IoIosWarning className='h-5 w-5 text-yellow-500' />,
        });
      }
    } catch (error) {
      console.error('사건관리자권한 위임 실패:', error);
      onMessageToast({
        message: '사건관리자권한 위임에 실패했습니다.',
        icon: <IoIosWarning className='h-5 w-5 text-yellow-500' />,
      });
    }
  };
  // 슈퍼권한자 위임 후 나가기
  const handleSuperExitProcess = async () => {
    try {
      // 1. 먼저 슈퍼권한 위임
      const delegateResponse = await onDelegateSuperPermission({
        project_id: projectId || '',
        receiver_id: selectedUserId,
      });

      if (delegateResponse?.success) {
        // 2. 위임 성공 시 사건 나가기 실행
        await handleExitProject();
        onMessageToast({
          message: '사건관리자권한 위임 및 사건 나가기가 완료되었습니다.',
          icon: <IoMdCheckmarkCircle className='h-5 w-5 text-yellow-500' />,
        });
      } else {
        onMessageToast({
          message: '사건관리자권한 위임에 실패했습니다.',
          icon: <IoIosWarning className='h-5 w-5 text-yellow-500' />,
        });
      }
    } catch (error) {
      console.error('사건관리자권한 위임 실패:', error);
      onMessageToast({
        message: '사건관리자권한 위임에 실패했습니다.',
        icon: <IoIosWarning className='h-5 w-5 text-yellow-500' />,
      });
    }
  };
  const handleExcludeProject = async () => {
    try {
      const response = await onExcludeProject({
        project_id: projectId || '',
        target_id: selectedUserId,
      });

      if (response?.success) {
        onMessageToast({
          message: '사건에서 제외되었습니다.',
          icon: <IoMdCheckmarkCircle className='h-5 w-5 text-yellow-500' />,
        });
        await refetchMembers(); // 멤버 목록 새로고침
        setIsExcludeProjectModalOpen(false);
      } else {
        onMessageToast({
          message: '사건 제외에 실패했습니다.',
          icon: <IoIosWarning className='h-5 w-5 text-yellow-500' />,
        });
      }
    } catch (error) {
      console.error('사건 제외 실패:', error);
      onMessageToast({
        message: '사건 제외에 실패했습니다.',
        icon: <IoIosWarning className='h-5 w-5 text-yellow-500' />,
      });
    }
  };
  // ! 퇴사처리 숨김 요청 250702
  // 슈퍼권한자 퇴사처리
  // const { onResignEvidenceSuperUser } = useResignEvidenceSuperUser();
  /*  const handleSuperUserResign = async () => {
    try {
      if (!projectId || !selectedUserId) {
        onMessageToast({
          message: '위임할 사용자를 선택해주세요.',
          icon: <IoIosWarning className='h-5 w-5 text-yellow-500' />,
        });
        return;
      }

      const response = await onResignEvidenceSuperUser({
        project_id: projectId,
        receiver_id: selectedUserId,
      });

      if (response?.isSuccess) {
        onMessageToast({
          message: '사건관리자권한 위임 및 퇴사처리가 완료되었습니다.',
          icon: <IoMdCheckmarkCircle className='h-5 w-5 text-yellow-500' />,
        });
        setIsSuperExitProcessModalOpen(false);
        window.location.href = '/'; // 메인 페이지로 이동
      } else {
        onMessageToast({
          message: response?.message || '퇴사처리에 실패했습니다.',
          icon: <IoIosWarning className='h-5 w-5 text-yellow-500' />,
        });
      }
    } catch (error) {
      console.error('사건관리자권한 퇴사 처리 실패:', error);
      onMessageToast({
        message: '퇴사처리에 실패했습니다.',
        icon: <IoIosWarning className='h-5 w-5 text-yellow-500' />,
      });
    }
  }; */
  // ! 일반 사용자 퇴사처리
  /*  const handleUserResign = async (userId: string) => {
    try {
      if (!projectId) return;

      const response = await onResignEvidenceUser({
        project_id: projectId,
        user_id: userId,
      });

      if (response?.isSuccess) {
        onMessageToast({
          message: '사용자 퇴사처리가 완료되었습니다.',
          icon: <IoMdCheckmarkCircle className='h-5 w-5 text-green-500' />,
        });
        setIsResignProcessModalOpen(false);
      } else {
        onMessageToast({
          message: response?.message || '퇴사처리에 실패했습니다.',
          icon: <IoIosWarning className='h-5 w-5 text-yellow-500' />,
        });
      }
    } catch (error) {
      console.error('사용자 퇴사 처리 실패:', error);
      onMessageToast({
        message: '퇴사처리에 실패했습니다.',
        icon: <IoIosWarning className='h-5 w-5 text-yellow-500' />,
      });
    }
  }; */
  // 본인 퇴사
  /* const handleSelfResign = async () => {
    try {
      if (!projectId) return;

      const response = await onResignEvidenceSelfUser({
        project_id: projectId,
      });

      if (response?.isSuccess) {
        onMessageToast({
          message: '퇴사처리가 완료되었습니다.',
          icon: <IoMdCheckmarkCircle className='h-5 w-5 text-green-500' />,
        });
        setIsSelfResignProcessModalOpen(false);
        window.location.href = '/'; // 메인 페이지로 이동
      } else {
        onMessageToast({
          message: response?.message || '퇴사처리에 실패했습니다.',
          icon: <IoIosWarning className='h-5 w-5 text-yellow-500' />,
        });
      }
    } catch (error: any) {
      onMessageToast({
        message: error?.response?.data?.error?.message || error?.response?.data?.message || '퇴사처리에 실패했습니다.',
        icon: <IoIosWarning className='h-5 w-5 text-yellow-500' />,
      });
    }
  }; */
  // 사건 참여 요청 취소
  const handleCancelProjectInvitation = async () => {
    try {
      console.log('handleCancelProjectInvitation - selectedRequestIdForCancel:', selectedRequestIdForCancel);
      if (!selectedRequestIdForCancel) {
        onMessageToast({
          message: '요청 ID를 찾을 수 없습니다.',
          icon: <IoIosWarning className='h-5 w-5 text-yellow-500' />,
        });
        return;
      }

      const response = await fetchCancelProjectInvitation({
        request_id: selectedRequestIdForCancel,
      });

      if (response.success) {
        onMessageToast({
          message: '사건 참여 요청이 취소되었습니다.',
          icon: <IoMdCheckmarkCircle className='h-5 w-5 text-green-500' />,
        });
        await refetchMembers(); // 멤버 목록 새로고침
        setIsCancelRequestModalOpen(false);
        setSelectedRequestIdForCancel('');
      } else {
        onMessageToast({
          message: '사건 참여 요청 취소에 실패했습니다.',
          icon: <IoIosWarning className='h-5 w-5 text-yellow-500' />,
        });
      }
    } catch (error) {
      console.error('사건 참여 요청 취소 실패:', error);
      onMessageToast({
        message: '사건 참여 요청 취소 중 오류가 발생했습니다.',
        icon: <IoIosWarning className='h-5 w-5 text-yellow-500' />,
      });
    }
  };
  // 유저 선택 시 이름도 함께 저장
  const handleUserSelect = (userId: string) => {
    setSelectedUserId(userId);
    // allMembers에서 사용자 찾기 (요청중인 멤버 포함)
    const selectedUser = allMembers.find((member) => member.user_id === userId);
    setSelectedUserName(selectedUser?.name || '');
  };

  // 사용자 이름 색상 결정 함수
  const getUserNameColor = (member: any) => {
    // 사건의 상태가 trial이고 expire_date가 있는 경우
    // isRequest이거나 has_subscription === false 여부와 상관없이 모든 사용자 색상을 #212121로
    if (projectPaymentStatus === 'trial' && projectExpireDate) {
      return '#212121';
    }

    // trial이 아니거나 expire_date가 없는 경우에만 기존 로직 적용
    // isRequest이거나 has_subscription이 false인 경우 #c1c1c1
    if ((member as any).isRequest) {
      return '#c1c1c1';
    }
    if ((member as any).has_subscription === false) {
      return '#c1c1c1';
    }

    return undefined; // 기본 색상
  };

  return (
    <div className='flex h-full w-full flex-col bg-[#f4f4f5] pb-[10px] pr-[10px] pt-[50px]'>
      <div className='flex min-h-0 w-full flex-1 items-center justify-center overflow-auto rounded-[16px] border border-[#D4D4D8] bg-white'>
        <div className='w-full max-w-[606px] py-[24px]'>
          <div className='mb-10 min-h-[320px] w-full rounded-[16px] bg-white lg:min-h-[420px]'>
            <div className='rounded-[16px] bg-white pb-10'>
              <div className='flex items-center justify-between p-4 lg:p-[23px]'>
                <h1
                  className={`font-semibold text-[#545454] ${getFontSizeClass(18, fontSizeAdjustment)}`}
                  style={{ fontSize: `${getAdjustedSize(18)}px` }}
                >
                  참여중인 멤버
                </h1>
                {currentUserIsSuperRole && (
                  <button
                    className='h-[48px] w-[133px] rounded-[8px] bg-[#004AA4] text-[16px] font-medium text-white lg:h-[48px] lg:text-[16px]'
                    onClick={() => setIsAuthModalOpen(true)}
                  >
                    초대하기
                  </button>
                )}
              </div>
              {sortedMembers?.map((member, index) => (
                <div
                  key={member.user_id || member.request_id || `member-${index}`}
                  className='flex min-h-[64px] items-center border-b border-gray-100 px-4 py-2 text-[#545454] lg:h-[64px] lg:px-0 lg:py-0'
                >
                  <div className='flex w-full items-center pl-0 lg:pl-[30px]'>
                    <div className='flex h-[24px] w-[24px] items-center justify-center rounded-full border'>
                      {(member as any).isRequest ? (
                        // requests에 있는 사람은 항상 FaUser 아이콘과 배경색 c1c1c1
                        <div
                          className='flex h-full w-full items-center justify-center rounded-full text-[13px]'
                          style={{ backgroundColor: '#c1c1c1' }}
                        >
                          <FaUser className='text-[12px]' style={{ color: '#fff' }} />
                        </div>
                      ) : member.thumbnail_url ? (
                        <div className='h-[24px] w-[24px] rounded-full border-2' style={{ borderColor: getUserColor(member.user_color) }}>
                          <img src={member.thumbnail_url} alt='profile' className='h-full w-full rounded-full' />
                        </div>
                      ) : (
                        <div
                          style={{ backgroundColor: getUserColor(member.user_color) }}
                          className='flex h-full w-full items-center justify-center rounded-full text-[13px] text-white'
                        >
                          {member.nickname && member.nickname.trim() !== ''
                            ? member.nickname.charAt(0)
                            : member.name && member.name.trim() !== ''
                              ? member.name.charAt(0)
                              : '?'}
                        </div>
                      )}
                    </div>

                    <div className='flex w-full flex-col items-start justify-between gap-2 lg:flex-row lg:items-center lg:gap-0'>
                      <div className='flex w-full items-center'>
                        <div className={`flex ${member.requestedSuper ? 'w-full lg:w-[50%]' : 'w-full lg:w-[90%]'} items-center`}>
                          <div
                            className={`ml-[8px] ${getFontSizeClass(16, fontSizeAdjustment)}`}
                            style={{
                              fontSize: `${getAdjustedSize(16)}px`,
                              color: getUserNameColor(member),
                            }}
                          >
                            {member.name}
                          </div>
                          {member.isMe && member.role === '사건관리자권한' ? (
                            <>
                              <div className='ml-[8px] flex h-[26px] w-[26px] items-center justify-center rounded-full bg-[#F5F5F5] text-[10px] lg:text-[12px]'>
                                나
                              </div>
                              <div className='ml-[8px] flex h-[26px] w-[70px] items-center justify-center rounded-full bg-[#545454] text-[10px] text-white lg:w-[96px] lg:text-[12px]'>
                                <TbChessQueenFilled className='mr-1 text-[12px]' />
                                사건관리자
                              </div>
                            </>
                          ) : member.isMe ? (
                            <div className='ml-[8px] flex h-[26px] w-[26px] items-center justify-center rounded-full bg-[#F5F5F5] text-[12px]'>
                              나
                            </div>
                          ) : member.role === '사건관리자권한' ? (
                            <div className='ml-[8px] flex h-[26px] w-[70px] items-center justify-center rounded-full bg-[#545454] text-[10px] text-white lg:w-[96px] lg:text-[12px]'>
                              <TbChessQueenFilled className='mr-1 text-[12px]' />
                              사건관리자
                            </div>
                          ) : null}
                        </div>
                        {member.requestedSuper && member.isMe && (
                          <div
                            className={`mr-0 w-full font-medium text-[#252525] lg:mr-[16px] lg:w-[100px] ${getFontSizeClass(12, fontSizeAdjustment)}`}
                            style={{ fontSize: `${getAdjustedSize(12)}px` }}
                          >
                            사건관리자권한 요청함
                          </div>
                        )}
                        {member.requestedSuper && currentUserIsSuperRole ? (
                          <div className='mr-0 flex w-full flex-col gap-2 lg:mr-[30px] lg:flex-row lg:items-center lg:justify-end lg:space-x-2'>
                            <div className='flex flex-col items-start lg:flex-row lg:items-center lg:justify-end'>
                              <div
                                className={`mb-2 mr-0 lg:mb-0 lg:mr-[16px] ${getFontSizeClass(12, fontSizeAdjustment)}`}
                                style={{ fontSize: `${getAdjustedSize(12)}px` }}
                              >
                                사건관리자권한을 요청했어요
                              </div>
                              <div className='flex gap-2'>
                                <button
                                  className='h-[32px] w-[49px] rounded-[8px] bg-[#0050B3] text-[14px] text-white'
                                  onClick={() => {
                                    handleUserSelect(member.user_id);
                                    setSelectedRequestId(member.request_id);
                                    setIsSuperRoleModalOpen(true);
                                  }}
                                >
                                  승인
                                </button>
                                <button
                                  className='h-[32px] w-[49px] rounded-[8px] border border-gray-200 text-[14px] text-[#373737]'
                                  onClick={() => {
                                    handleUserSelect(member.user_id);
                                    setSelectedRequestId(member.request_id);
                                    setIsRefusalModalOpen(true);
                                  }}
                                >
                                  거절
                                </button>
                              </div>
                            </div>
                          </div>
                        ) : (member as any).isRequest ? (
                          // 요청중인 멤버인 경우 (일반권한으로 셀렉트 박스 표시)
                          <div className='mr-0 flex w-full items-center justify-start lg:mr-[30px] lg:w-[240px] lg:justify-end'>
                            {currentUserIsSuperRole ? (
                              <Select
                                defaultValue='일반권한'
                                onValueChange={(value) => {
                                  if (value === 'exclude') {
                                    // requests 데이터인 경우 request_id로 사건참여 취소
                                    console.log('Setting request_id for cancel (requests):', member.request_id, 'member:', member);
                                    setSelectedRequestIdForCancel(member.request_id);
                                    setIsCancelRequestModalOpen(true);
                                  }
                                }}
                              >
                                <SelectTrigger className='h-[40px] w-[150px] text-[14px] lg:w-full'>일반권한</SelectTrigger>
                                <SelectContent>
                                  {/* requests 데이터는 사건관리자 이양 옵션 숨김 */}
                                  <SelectItem value='exclude'>사건에서 제외</SelectItem>
                                </SelectContent>
                              </Select>
                            ) : (
                              <div className='text-[14px] text-[#8E8E8E]'>요청중</div>
                            )}
                          </div>
                        ) : (
                          <div className='mr-0 flex w-full items-center justify-start lg:mr-[30px] lg:w-[240px] lg:justify-end'>
                            {currentUserIsSuperRole ? (
                              // 내가 슈퍼권한자인 경우
                              member.user_id === currentUserId ? (
                                // 자기 자신인 경우
                                <Select
                                  defaultValue={member.role}
                                  onValueChange={(value) => {
                                    if (value === 'leave' || value === 'resign') {
                                      // 혼자인지 먼저 체크
                                      if (isOnlyMember()) {
                                        setIsWarningOpen(true);
                                        return; // 여기서 함수 종료
                                      }
                                      if (value === 'leave') {
                                        setSelectedProjectId(projectId || '');
                                        if (member.role === '사건관리자권한') {
                                          setIsSuperExitModalOpen(true);
                                        } else {
                                          setIsExitModalOpen(true);
                                        }
                                      }
                                      /*  if (value === 'resign') {
                                      setSelectedUserId(member.user_id);
                                      setIsSuperExitProcessModalOpen(true);
                                    } */
                                    }
                                  }}
                                >
                                  <SelectTrigger className='h-[40px] w-[150px] text-[14px] lg:w-full'>{member.role}</SelectTrigger>
                                  <SelectContent>
                                    <SelectItem value='leave'>사건에서 나가기</SelectItem>
                                  </SelectContent>
                                </Select>
                              ) : (
                                // 다른 멤버인 경우
                                <Select
                                  defaultValue={member.role}
                                  onValueChange={(value) => {
                                    // has_subscription: true인 사용자도 사건관리자권한 이양 가능
                                    if (
                                      value === 'promote' &&
                                      !(member as any).isRequest &&
                                      ((member as any).has_subscription === true || (member as any).is_invited === false)
                                    ) {
                                      handleUserSelect(member.user_id);
                                      setIsDelegateSuperPermissionModalOpen(true);
                                    }
                                    if (value === 'exclude') {
                                      if ((member as any).isRequest) {
                                        // requests에 있는 사람은 사건참여 요청 취소
                                        console.log('Setting request_id for cancel:', member.request_id, 'member:', member);
                                        setSelectedRequestIdForCancel(member.request_id);
                                        setIsCancelRequestModalOpen(true);
                                      } else if ((member as any).is_invited === true) {
                                        // 초대된 멤버인 경우 초대취소
                                        console.log('Setting request_id for cancel:', member.request_id, 'member:', member);
                                        setSelectedRequestIdForCancel(member.request_id);
                                        setIsCancelRequestModalOpen(true);
                                      } else {
                                        // 일반 멤버인 경우 사건에서 제외
                                        handleUserSelect(member.user_id);
                                        setIsExcludeProjectModalOpen(true);
                                      }
                                    }
                                    /* if (value === 'resign') {
                                    handleUserSelect(member.user_id);
                                    setIsResignProcessModalOpen(true);
                                  } */
                                  }}
                                >
                                  <SelectTrigger className='h-[40px] w-[150px] text-[14px] lg:w-full'>{member.role}</SelectTrigger>
                                  <SelectContent>
                                    {/* has_subscription: true인 사용자의 경우 사건관리자권한 이양 옵션 표시 */}
                                    {!(member as any).isRequest &&
                                      ((member as any).has_subscription === true || (member as any).is_invited === false) && (
                                        <SelectItem value='promote'>사건관리자권한 이양</SelectItem>
                                      )}
                                    <SelectItem value='exclude'>
                                      {(member as any).isRequest ? '사건참여 요청 취소' : '사건에서 제외'}
                                    </SelectItem>
                                  </SelectContent>
                                </Select>
                              )
                            ) : // 내가 슈퍼권한자가 아닌 경우
                            member.user_id === currentUserId ? (
                              <Select
                                defaultValue={member.role}
                                onValueChange={(value) => {
                                  if (value === 'leave') {
                                    setSelectedProjectId(projectId || '');
                                    setIsExitModalOpen(true);
                                  }
                                  /*  if (value === 'resign') {
                                  handleUserSelect(member.user_id);
                                  setIsSelfResignProcessModalOpen(true);
                                } */
                                  if (value === 'promote') {
                                    handleUserSelect(member.user_id);
                                    setIsPromoteProcessModalOpen(true);
                                  }
                                }}
                              >
                                <SelectTrigger className='h-[40px] w-[150px] text-[14px] lg:w-full'>{member.role}</SelectTrigger>
                                {member.requestedSuper ? (
                                  <SelectContent>
                                    <SelectItem value='leave'>사건에서 나가기</SelectItem>
                                  </SelectContent>
                                ) : (
                                  <SelectContent>
                                    <SelectItem value='promote'>사건관리자권한 요청</SelectItem>
                                    <SelectItem value='leave'>사건에서 나가기</SelectItem>
                                  </SelectContent>
                                )}
                              </Select>
                            ) : null}
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
          {/*  <div className='mb-10 mt-[16px] min-h-[102px] w-full rounded-[8px] bg-white'>
          <div className='flex flex-col items-start justify-between gap-4 p-4 pb-[20px] lg:flex-row lg:items-center lg:gap-0 lg:p-[32px]'>
            <div className='text-[18px] font-semibold text-[#252525]'>사건참여 요청중인 멤버</div>
            {currentUserIsSuperRole && (
              <button
                className='h-[48px] w-full rounded-[8px] bg-[#004AA4] text-[16px] text-white lg:w-[133px]'
                onClick={() => setIsAuthModalOpen(true)}
              >
                사건참여 요청
              </button>
            )}
          </div>

          <div className='px-4 pb-[20px] lg:px-[30px]'>
            {memberData?.data?.requests?.length ? (
              memberData.data.requests.map((request) => (
                <div
                  key={request.user_id}
                  className='flex min-h-[64px] items-center border-b border-gray-100 py-2 text-[#545454] lg:h-[64px] lg:py-0'
                >
                  <div className='flex w-full items-center'>
                    <div className='flex h-[24px] w-[24px] items-center justify-center'>
                      {request.thumbnail_url ? (
                        <div className='h-[24px] w-[24px] rounded-full border-2' style={{ borderColor: getUserColor(request.user_color) }}>
                          <img src={request.thumbnail_url} alt='profile' className='h-full w-full rounded-full' />
                        </div>
                      ) : (
                        <div
                          style={{
                            backgroundColor:
                              (request.nickname && request.nickname !== '') ||
                              (request.name && request.name !== '' && !request.name.includes('@'))
                                ? getUserColor(request.user_color)
                                : '#E5E5E5',
                          }}
                          className='flex h-[24px] w-[24px] items-center justify-center rounded-full text-[13px] text-white'
                        >
                          {request.name && request.name !== '' && !request.name.includes('@') ? (
                            request.name.slice(1, 2)
                          ) : (
                            <FaUser className='text-[10px] text-white' />
                          )}
                        </div>
                      )}
                    </div>
                    <div className='ml-[8px] flex w-full flex-col items-start justify-between gap-1 lg:flex-row lg:items-center lg:gap-0'>
                      <div
                        className={`${getFontSizeClass(16, fontSizeAdjustment)} flex items-center`}
                        style={{ fontSize: `${getAdjustedSize(16)}px` }}
                      >
                        {request.name}
                        {currentUserIsSuperRole && (
                          <div
                            className='ml-[8px] cursor-pointer text-[#5B5B5B]'
                            onClick={() => {
                              setSelectedRequestIdForCancel(request.request_id);
                              setIsCancelRequestModalOpen(true);
                            }}
                          >
                            <IoIosCloseCircle className='text-[24px]' />
                          </div>
                        )}
                      </div>

                      <div
                        className={`mr-0 ${getFontSizeClass(16, fontSizeAdjustment)} text-[#8E8E8E] lg:mr-[16px] lg:text-[16px]`}
                        style={{ fontSize: `${getAdjustedSize(16)}px` }}
                      >
                        사건참여 요청중
                      </div>
                    </div>
                  </div>
                </div>
              ))
            ) : (
              <div className='flex min-h-[64px] items-center justify-center py-4 text-[#999999] lg:h-[64px] lg:py-0'>
                <div className={`${getFontSizeClass(14, fontSizeAdjustment)}`} style={{ fontSize: `${getAdjustedSize(14)}px` }}>
                  요청중인 멤버가 없습니다
                </div>
              </div>
            )}
          </div>
        </div> */}
        </div>
        {isRefusalModalOpen && (
          <ModalSelect
            sendMessage={`${selectedRequestRole} 권한 요청 거절`}
            storageMessage={`${selectedRequestRole} 권한 요청을 거절하시겠습니까?`}
            handleSave={() => handleApprove(selectedRequestId, 'REJECTED')}
            setIsModalOpen={() => setIsRefusalModalOpen(false)}
            confirmButtonText='거절하기'
          />
        )}
        {isRequestModalOpen && (
          <ModalSelect
            sendMessage={`${selectedRequestRole} 권한 요청 승인`}
            storageMessage={`${selectedRequestRole} 권한 요청을 승인하시겠습니까?`}
            handleSave={() => handleApprove(selectedRequestId, 'APPROVED')}
            setIsModalOpen={() => setIsRequestModalOpen(false)}
            confirmButtonText='승인하기'
          />
        )}
        {isSuperRoleModalOpen && (
          <ModalSelect
            sendMessage={`${selectedRequestRole} 권한 요청 승인`}
            storageMessage={`${selectedRequestRole} 사건별 사건관리자권한 1명으로, 승인 시 나의 사건관리자권한 일반권한으로 변경됩니다. 
          사건관리자권한 요청을 승인하시겠습니까?`}
            handleSave={() => handleApprove(selectedRequestId, 'APPROVED')}
            setIsModalOpen={() => {
              setIsSuperRoleModalOpen(false);
            }}
            confirmButtonText='승인하기'
          />
        )}
        {isExitModalOpen && (
          <ModalSelect
            sendMessage='사건에서 나가기'
            storageMessage='사건에서 나가기를 진행하시겠습니까?'
            handleSave={handleExitProject}
            setIsModalOpen={() => setIsExitModalOpen(false)}
            confirmButtonText='사건 나가기'
          />
        )}
        {isExcludeProjectModalOpen && (
          <ModalSelect
            sendMessage='사건에서 제외시키기'
            storageMessage={`${selectedUserName} 님의 사건 접근권한을 회수 하시겠습니까? 이후 ${selectedUserName}님은 ${projectName} 에 접근할 수 없습니다`}
            handleSave={handleExcludeProject}
            setIsModalOpen={() => setIsExcludeProjectModalOpen(false)}
            confirmButtonText='사건 제외'
          />
        )}
        {isSuperExitModalOpen && (
          <ModalSelectBox
            members={
              sortedMembers
                ?.filter((member) => member.user_id !== currentUserId) // 현재 사용자 제외
                .map((member) => ({
                  user_id: member.user_id,
                  name: member.name,
                  role: member.role,
                  thumbnail_url: member.thumbnail_url,
                  user_color: member.user_color,
                })) || []
            }
            onSelectMember={(userId) => setSelectedUserId(userId)}
            sendMessage='사건에서 나가기'
            storageMessage={`사건마다 사건관리자권한은 필수로 있어야 합니다. 사건관리자권한을 이양할 사용자를 지정해주세요. 이후 ${projectName} 에 접근할 수 없습니다.`}
            handleSave={handleSuperExitProcess}
            setIsModalOpen={() => setIsSuperExitModalOpen(false)}
            confirmButtonText='사건 나가기'
          />
        )}
        {isDelegateSuperPermissionModalOpen && (
          <ModalSelect
            sendMessage='사건관리자권한 이양'
            storageMessage={`${selectedUserName} 님에게 사건관리자권한을 이양하시겠습니까?`}
            handleSave={() => handleDelegateSuperPermission(selectedUserId)}
            setIsModalOpen={() => setIsDelegateSuperPermissionModalOpen(false)}
            confirmButtonText='이양하기'
          />
        )}
        {/*   {isSuperExitProcessModalOpen && (
        <ModalSelectBox
          members={
            sortedMembers
              ?.filter((member) => member.user_id !== currentUserId) // 현재 사용자 제외
              .map((member) => ({
                user_id: member.user_id,
                name: member.name,
                role: member.role,
                thumbnail_url: member.thumbnail_url,
                user_color: member.user_color,
              })) || []
          }
          onSelectMember={(userId) => setSelectedUserId(userId)}
          sendMessage='퇴사처리'
          storageMessage={`사건마다 사건관리자권한은 필수로 있어야 합니다. 사건관리자권한을 이양할 사용자를 지정해주세요. 이후 ${projectName} 에 접근할 수 없습니다`}
          handleSave={handleSuperUserResign}
          setIsModalOpen={() => setIsSuperExitProcessModalOpen(false)}
          confirmButtonText='퇴사 처리하기'
        />
      )} */}
        {/*  {isSelfResignProcessModalOpen && (
        <ModalSelect
          sendMessage='퇴사처리'
          storageMessage='나의 퇴사처리를 진행하시겠습니까?'
          handleSave={() => handleSelfResign()}
          setIsModalOpen={() => setIsSelfResignProcessModalOpen(false)}
          confirmButtonText='퇴사 처리하기'
        />
      )} */}
        {/* {isResignProcessModalOpen && (
        <ModalSelect
          sendMessage='퇴사처리'
          storageMessage={`퇴사처리 시 ${selectedUserName} 님은 ${projectName}내 모든사건에 접근할 수 없습니다 퇴사처리 하시겠습니까?`}
          handleSave={() => handleUserResign(selectedUserId)}
          setIsModalOpen={() => setIsResignProcessModalOpen(false)}
          confirmButtonText='퇴사 처리하기'
        />
      )} */}
        {isPromoteProcessModalOpen && (
          <ModalSelect
            sendMessage='사건관리자권한 요청'
            storageMessage={
              '사건별 사건관리자권한은 1명으로, 요청이 승인되면 기존 사건관리자권한은 일반권한자로 변경됩니다. 사건관리자권한을 요청하시겠습니까?'
            }
            handleSave={() => handleRequestSuperAuthority()}
            setIsModalOpen={() => setIsPromoteProcessModalOpen(false)}
            confirmButtonText='요청하기'
          />
        )}
        {isWarningOpen && (
          <WarningModal
            sendMessage={'멤버 확인'}
            storageMessage={'사건 멤버가 혼자일 경우 사건에서 나가기 또는 퇴사 처리를 할 수 없습니다.'}
            setIsModalOpen={() => setIsWarningOpen(false)}
          />
        )}
        {isAuthModalOpen && (
          <AuthModal
            isOpen={isAuthModalOpen}
            onClose={() => {
              setIsAuthModalOpen(false);
            }}
            projectId={projectId || ''}
            currentMembers={memberData?.data?.members || []}
            requestingMembers={memberData?.data?.requests || []}
            onInviteSuccess={refetchMembers}
            paymentStatus={projectPaymentStatus}
            expireDate={projectExpireDate}
          />
        )}
        {isCancelRequestModalOpen && (
          <ModalSelect
            sendMessage='사건 참여요청을 취소할까요?'
            storageMessage={`이미 보낸 참여 요청을 취소하면
이사건에는 더 이상 접근할 수 없습니다.`}
            handleSave={handleCancelProjectInvitation}
            setIsModalOpen={() => setIsCancelRequestModalOpen(false)}
            confirmButtonText='요청 취소하기'
          />
        )}
      </div>
    </div>
  );
};
