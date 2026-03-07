import { useState, useMemo } from 'react';

import { IoClose } from 'react-icons/io5';

import { fetchFindCase } from '@/apis/evidence-admin-api';
import { fetchAddProjectInvitation } from '@/apis/evidence-api';
import { PaymentParticipationModal } from '@/components/evidence/modal/payment-auth-modal';
import { Input, Label } from '@/components/ui';
import { onMessageToast } from '@/components/utils';
import { useFindUserInfo, useGetPaymentSettings } from '@/hooks/react-query';

type TInvitedMember = {
  email: string;
  thumbnail?: boolean;
  thumbnail_url?: string;
  user_nm?: string;
  nickname?: string;
  user_color?: string;
};

type TMember = {
  user_id: string;
  name: string;
  email: string;
  user_color: string;
  thumbnail_url: string;
  role: string;
  requestedSuper: boolean;
  nickname: string;
  isMe: string;
  request_id: string;
};

type TRequest = {
  user_id: string;
  name: string;
  email: string;
  user_color: string;
  thumbnail_url: string;
  nickname: string;
  requested_role: string;
  request_id: string;
};

type TAuthModalProps = {
  isOpen: boolean;
  onClose: () => void;
  projectId: string;
  currentMembers: TMember[];
  requestingMembers: TRequest[];
  onInviteSuccess: () => void;
  paymentStatus?: string | null;
  expireDate?: string | null;
};

// 사용자 색상 유틸 함수 (evidence-history-table.tsx 참고)
const getUserColor = (userColor?: string): string => {
  const colors = ['#FF6B6B', '#4ECDC4', '#45B7D1', '#96CEB4', '#FFEAA7', '#DDA0DD', '#98D8C8', '#F7DC6F'];
  return userColor || colors[Math.floor(Math.random() * colors.length)];
};

export const AuthModal = ({
  isOpen,
  onClose,
  projectId,
  currentMembers,
  requestingMembers,
  onInviteSuccess,
  paymentStatus,
  expireDate,
}: TAuthModalProps) => {
  const [email, setEmail] = useState('');
  const [invitedMembers, setInvitedMembers] = useState<TInvitedMember[]>([]);
  const [emailError, setEmailError] = useState('');
  const [isInviting, setIsInviting] = useState(false);
  const [isPaymentModalOpen, setIsPaymentModalOpen] = useState(false);

  const { response: findEvidenceUserInfo } = useFindUserInfo();

  // 결제 설정 조회 API 호출
  const { response: paymentSettingsResponse } = useGetPaymentSettings();

  // URL에서 프로젝트 이름 가져오기
  const projectName = useMemo(() => {
    const urlParams = new URLSearchParams(window.location.search);
    const name = urlParams.get('project_name');
    return name ? decodeURIComponent(name) : projectId;
  }, [projectId]);

  // 이메일 유효성 검사
  const isValidEmail = (emailValue: string): boolean => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(emailValue);
  };

  // 이메일 추가
  const handleAddEmail = async () => {
    setEmailError('');

    if (!isValidEmail(email)) {
      setEmailError('이메일 형식이 아닙니다.');
      return;
    }

    // 이미 초대 목록에 있는지 확인
    if (invitedMembers.some((member) => member.email === email)) {
      setEmailError('이미 초대 목록에 추가된 이메일입니다.');
      return;
    }

    // 이미 사건에 참여중인 멤버인지 확인
    if (currentMembers.some((member) => member.email === email)) {
      setEmailError('이미 사건에 참여중인 멤버입니다.');
      return;
    }

    // 이미 사건참여 요청중인 멤버인지 확인
    if (requestingMembers.some((member) => member.email === email)) {
      setEmailError('이미 사건참여 요청중인 멤버입니다.');
      return;
    }

    const newMember: TInvitedMember = {
      email,
      user_nm: email.split('@')[0], // 이메일 @ 앞부분을 이름으로 사용
      user_color: getUserColor(),
      // 실제로는 API에서 썸네일 정보를 가져와야 하지만, 임시로 랜덤하게 설정
      thumbnail: Math.random() > 0.5,
      thumbnail_url: Math.random() > 0.5 ? 'https://via.placeholder.com/24' : undefined,
    };

    setInvitedMembers((prev) => [...prev, newMember]);
    setEmail('');
  };

  // 멤버 삭제
  const handleRemoveMember = (emailToRemove: string) => {
    setInvitedMembers((prev) => prev.filter((member) => member.email !== emailToRemove));
  };

  // trial인 경우 바로 초대 (결제 모달 없이)
  const handleInviteMembersDirectly = async () => {
    setIsInviting(true);
    try {
      const invitePromises = invitedMembers.map(async (member) => {
        try {
          const result = await fetchAddProjectInvitation({
            project_id: projectId,
            email: member.email,
            is_pre_paid: true, // trial인 경우 항상 true
          });
          return { email: member.email, result, error: null };
        } catch (error) {
          console.error(`초대 실패 - ${member.email}:`, error);
          return { email: member.email, result: { success: false }, error };
        }
      });

      const results = await Promise.all(invitePromises);
      const successResults = results.filter((item) => item.result.success);
      const failResults = results.filter((item) => !item.result.success);

      const successCount = successResults.length;
      const failCount = failResults.length;

      if (failCount > 0) {
        console.log(
          '초대 실패한 이메일들:',
          failResults.map((r) => r.email),
        );
      }

      if (successCount > 0) {
        onMessageToast({
          message: `${successCount}명의 사용자를 초대했습니다.${failCount > 0 ? ` (${failCount}명 실패)` : ''}`,
        });

        onInviteSuccess();

        if (failCount === 0) {
          setInvitedMembers([]);
          setEmail('');
          setEmailError('');
          onClose();
        } else {
          const failedEmails = failResults.map((r) => r.email);
          setInvitedMembers((prev) => prev.filter((member) => failedEmails.includes(member.email)));
          setEmail('');
          setEmailError('');
        }
      } else {
        onMessageToast({
          message: '사건 참여 요청에 실패했습니다.',
        });
      }
    } catch (error) {
      console.error('초대 요청 중 오류:', error);
      onMessageToast({
        message: '사건 참여 요청 중 오류가 발생했습니다.',
      });
    } finally {
      setIsInviting(false);
    }
  };

  // 결제 모달 열기 또는 바로 초대 (trial인 경우)
  const handleOpenPaymentModal = async () => {
    // 결제 설정 확인: free_payment_enabled가 true이고 free_payment_end_date가 오늘 날짜를 지나지 않았으면 결제 모달 열지 않음
    if (paymentSettingsResponse?.data?.free_payment_enabled) {
      const endDate = paymentSettingsResponse.data.free_payment_end_date;
      if (endDate && endDate.trim() !== '') {
        try {
          // YYYYMMDD 형식인 경우
          let dateToCheck: Date;
          if (/^\d{8}$/.test(endDate)) {
            const year = parseInt(endDate.substring(0, 4), 10);
            const month = parseInt(endDate.substring(4, 6), 10) - 1;
            const day = parseInt(endDate.substring(6, 8), 10);
            dateToCheck = new Date(year, month, day);
          } else {
            // ISO 형식인 경우
            dateToCheck = new Date(endDate);
          }

          const today = new Date();
          today.setHours(0, 0, 0, 0);
          dateToCheck.setHours(0, 0, 0, 0);

          // 종료일이 오늘 날짜를 지나지 않았으면 결제 모달 열지 않고 바로 초대
          if (dateToCheck >= today) {
            await handleInviteMembersDirectly();
            return; // 결제 모달을 열지 않고 함수 종료
          }
        } catch (error) {
          console.error('날짜 파싱 실패:', error);
          // 날짜 파싱 실패 시 기존 로직대로 진행
        }
      }
    }

    // payment_status가 'trial'인 경우 expire_date 확인
    if (paymentStatus === 'trial') {
      // expire_date가 prop으로 전달된 경우 사용, 없으면 API 호출
      let expireDateToCheck = expireDate;

      if (!expireDateToCheck) {
        try {
          // 사건 조회하여 expire_date 확인
          const projectData = await fetchFindCase(projectId);
          expireDateToCheck = (projectData.data as any)?.expire_date;
        } catch (error) {
          console.error('사건 조회 실패:', error);
          // 에러 발생 시 기존 로직대로 결제 모달 열기
          setIsPaymentModalOpen(true);
          return;
        }
      }

      // expire_date가 있고 오늘 이후인 경우에만 무료 처리
      if (expireDateToCheck) {
        const today = new Date();
        today.setHours(0, 0, 0, 0); // 오늘 날짜의 시작 시간
        const expire = new Date(expireDateToCheck);
        expire.setHours(0, 0, 0, 0);

        // expire_date가 오늘 이후인 경우에만 결제 모달 없이 바로 초대
        if (expire >= today) {
          await handleInviteMembersDirectly();
          return;
        }
      }
    }

    // trial이 아니거나 expire_date가 지난 경우 결제 모달 열기
    setIsPaymentModalOpen(true);
  };

  // 결제 완료 후 권한 요청
  const handleInviteMembers = async (memberPaymentMethods: Record<string, 'me' | 'participant'>) => {
    setIsInviting(true);
    // 결제 모달은 초대 처리가 완료될 때까지 열어둠
    try {
      const invitePromises = invitedMembers.map(async (member) => {
        try {
          // 이메일을 user_id로 사용 (임시)
          const paymentMethod = memberPaymentMethods[member.email] || 'participant';
          console.log(`초대 처리 - ${member.email}:`, {
            paymentMethod,
            is_pre_paid: paymentMethod === 'me',
            memberPaymentMethods,
          });
          const result = await fetchAddProjectInvitation({
            project_id: projectId,
            email: member.email,
            is_pre_paid: paymentMethod === 'me',
          });
          return { email: member.email, result, error: null };
        } catch (error) {
          console.error(`초대 실패 - ${member.email}:`, error);
          return { email: member.email, result: { success: false }, error };
        }
      });

      const results = await Promise.all(invitePromises);
      const successResults = results.filter((item) => item.result.success);
      const failResults = results.filter((item) => !item.result.success);

      const successCount = successResults.length;
      const failCount = failResults.length;

      // 실패한 이메일들 로깅
      if (failCount > 0) {
        console.log(
          '초대 실패한 이메일들:',
          failResults.map((r) => r.email),
        );
      }

      if (successCount > 0) {
        onMessageToast({
          message: `결제가 완료되어 ${successCount}명의 사용자를 초대했습니다.${failCount > 0 ? ` (${failCount}명 실패)` : ''}`,
        });

        // 성공한 경우 멤버 목록 새로고침
        onInviteSuccess();

        // 성공한 멤버들만 초대 목록에서 제거 (실패한 멤버들은 재시도를 위해 유지)
        if (failCount === 0) {
          // 모든 초대가 성공한 경우에만 모달 닫기 및 전체 상태 초기화
          setInvitedMembers([]);
          setEmail('');
          setEmailError('');
          setIsPaymentModalOpen(false);
          onClose();
        } else {
          // 부분 실패한 경우: 성공한 멤버들만 목록에서 제거
          const failedEmails = failResults.map((r) => r.email);
          setInvitedMembers((prev) => prev.filter((member) => failedEmails.includes(member.email)));
          setEmail('');
          setEmailError('');
          setIsPaymentModalOpen(false); // 부분 실패해도 결제 모달 닫기
        }
      } else {
        onMessageToast({
          message: '사건 참여 요청에 실패했습니다.',
        });
        setIsPaymentModalOpen(false); // 실패해도 결제 모달 닫기
      }
    } catch (error) {
      console.error('초대 요청 중 오류:', error);
      onMessageToast({
        message: '사건 참여 요청 중 오류가 발생했습니다.',
      });
      setIsPaymentModalOpen(false); // 오류 발생해도 결제 모달 닫기
    } finally {
      setIsInviting(false);
    }
  };

  // 버튼 활성화 상태
  const isAddButtonEnabled = email.length > 0 && isValidEmail(email);
  const isRequestButtonEnabled = invitedMembers.length > 0 && !isInviting;

  // 이메일에 변화가 있을 때 에러 초기화
  const handleEmailChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setEmail(e.target.value);
    if (emailError) {
      setEmailError('');
    }
  };

  if (!isOpen) return null;

  return (
    <div className='fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50'>
      <div className='max-h-[80vh] overflow-auto rounded-[16px] border-3 border-[#737980] bg-[#fff] p-[32px] lg:w-[424px]'>
        <h2 className='text-[24px] font-bold text-[#252525]'>사건참여 요청</h2>
        <div className='mt-[24px] flex flex-col'>
          <Label className='text-[14px] text-[#252525]'>이메일</Label>

          <div className='relative mt-[8px]'>
            <Input
              className={`h-[56px] w-full rounded-[8px] border p-[12px] pr-[120px] ${emailError ? 'border-red-500' : 'border-[#E5E5E5]'}`}
              placeholder='이메일을 입력해주세요'
              value={email}
              onChange={handleEmailChange}
              onKeyPress={(e) => {
                if (e.key === 'Enter' && isAddButtonEnabled && isValidEmail(email)) {
                  handleAddEmail();
                }
              }}
            />
            <button
              className={`absolute right-2 top-2 h-[40px] w-[100px] rounded-[8px] text-[#BABABA] transition-colors ${
                isAddButtonEnabled ? 'bg-[#004AA4] text-white hover:bg-[#003875]' : 'cursor-not-allowed bg-[#F3F3F3] text-[#BABABA]'
              }`}
              onClick={handleAddEmail}
              disabled={!isAddButtonEnabled}
            >
              추가하기
            </button>
          </div>
          {emailError && <div className='mt-2 text-[14px] text-red-500'>{emailError}</div>}
        </div>

        <div className='mt-[24px] flex flex-col'>
          <span className='text-[14px] text-[#252525]'>초대할 멤버</span>
          <div className=''>
            {invitedMembers.map((member, index) => (
              <div
                key={index}
                className='mt-[8px] flex h-[44px] w-[360px] w-full items-center justify-between rounded-[8px] bg-[#F5F5F5] px-[12px]'
              >
                <div className='flex items-center'>
                  <div className='relative mr-[8px]'>
                    {member.thumbnail && member.thumbnail_url ? (
                      <div className='relative h-[24px] w-[24px]'>
                        <img
                          className='h-[24px] w-[24px] rounded-full'
                          src={member.thumbnail_url}
                          alt=''
                          onError={(e) => {
                            // 이미지 로딩 실패 시 기본 아바타로 대체
                            const target = e.target as HTMLImageElement;
                            target.style.display = 'none';
                            const parent = target.parentElement;
                            if (parent) {
                              const fallbackAvatar = document.createElement('div');
                              fallbackAvatar.className =
                                'flex h-[24px] w-[24px] items-center justify-center rounded-full text-[13px] text-white';
                              fallbackAvatar.style.backgroundColor = getUserColor(member.user_color);
                              fallbackAvatar.textContent = member.nickname
                                ? member.nickname?.charAt(0)
                                : member.user_nm
                                  ? member.user_nm?.slice(0, 1)
                                  : member.email?.charAt(0).toUpperCase();
                              parent.appendChild(fallbackAvatar);
                            }
                          }}
                        />
                        <div
                          className='absolute top-0 h-[24px] w-[24px] rounded-full border-2'
                          style={{
                            borderColor: getUserColor(member.user_color),
                          }}
                        />
                      </div>
                    ) : (
                      <div className='flex h-[24px] w-[24px] items-center justify-center rounded-full bg-[#E5E5E5] text-[13px] text-white'>
                        {member.nickname
                          ? member.nickname?.charAt(0)
                          : member.user_nm
                            ? member.user_nm?.slice(0, 1)
                            : member.email?.charAt(0).toUpperCase()}
                      </div>
                    )}
                  </div>
                  <span className='max-w-[280px] truncate text-[14px] text-[#252525]'>{member.email}</span>
                </div>
                <button
                  className='flex h-[20px] w-[20px] items-center justify-center rounded-full bg-[#E5E5E5] transition-colors hover:bg-[#DBDBDB]'
                  onClick={() => handleRemoveMember(member.email)}
                >
                  <IoClose className='h-[12px] w-[12px] text-[#5B5B5B]' />
                </button>
              </div>
            ))}
          </div>
        </div>

        <div className='mt-[24px] flex justify-center space-x-[8px]'>
          <button
            className={`h-[48px] w-full rounded-lg transition-colors ${
              isRequestButtonEnabled && !isInviting
                ? 'bg-[#0050B3] text-white hover:bg-[#003d8a]'
                : 'cursor-not-allowed bg-[#F3F3F3] text-[#BABABA]'
            }`}
            disabled={!isRequestButtonEnabled || isInviting}
            onClick={handleOpenPaymentModal}
          >
            {isInviting ? (
              <div className='flex items-center justify-center'>
                <div className='mr-2 h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent'></div>
                초대 중...
              </div>
            ) : (
              '사건 참여요청'
            )}
          </button>
          <button
            className={`h-[48px] w-full rounded-lg border border-[#DBDBDB] transition-colors ${
              isInviting ? 'cursor-not-allowed opacity-50' : 'hover:bg-[#F5F5F5]'
            }`}
            onClick={onClose}
            disabled={isInviting}
          >
            취소
          </button>
        </div>
      </div>

      {/* 결제 모달 */}
      <PaymentParticipationModal
        isOpen={isPaymentModalOpen}
        onClose={() => setIsPaymentModalOpen(false)}
        onPayment={() => undefined}
        projectName={projectName}
        projectId={projectId}
        userId={findEvidenceUserInfo?.data?.user_id}
        invitedMembers={invitedMembers}
        onPaymentSuccess={handleInviteMembers}
        isInviting={isInviting}
      />
    </div>
  );
};
