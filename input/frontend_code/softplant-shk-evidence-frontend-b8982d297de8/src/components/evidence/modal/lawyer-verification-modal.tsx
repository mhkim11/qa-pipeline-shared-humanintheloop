import { useState, useEffect } from 'react';

import { IoMdClose, IoIosArrowForward } from 'react-icons/io';

// import { fetchVerifyLawyer } from '@/apis/evidence-api';
import { Input } from '@/components/ui/input';
import { onMessageToast } from '@/components/utils';
import { useUpdateUserInfo } from '@/hooks/react-query/mutation';
import { useFindUserInfo } from '@/hooks/react-query/query';

interface ILawyerVerificationModalProps {
  isOpen: boolean;
  onClose: () => void;
  onVerificationSuccess?: () => void;
  onVerificationFailure?: (message: string) => void;
}

export const LawyerVerificationModal = ({
  isOpen,
  onClose,
  onVerificationSuccess,
  onVerificationFailure,
}: ILawyerVerificationModalProps): JSX.Element => {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [lawyerNumber, setLawyerNumber] = useState('');
  const [registrationNumber, setRegistrationNumber] = useState('');
  const [birthday, setBirthday] = useState('');
  const [isAgreed, setIsAgreed] = useState(false);

  // 유저 정보 가져오기
  const { response: userInfo } = useFindUserInfo();
  const showBirthdayField = !userInfo?.data?.birthdate;

  // 사용자 정보 업데이트 훅
  const { onUpdateUserInfo } = useUpdateUserInfo();

  // 모달이 열릴 때마다 입력값 초기화
  useEffect(() => {
    if (isOpen) {
      // 기존 값이 있으면 사용, 없으면 빈 문자열로 초기화
      setLawyerNumber(userInfo?.data?.licenseNumber || '');
      setRegistrationNumber(userInfo?.data?.issueNumber || '');
      setBirthday('');
      setIsAgreed(false);
    }
  }, [isOpen, userInfo]);

  const handleVerification = async () => {
    // 필수 필드 검증
    if (!lawyerNumber.trim() || !registrationNumber.trim() || !isAgreed) {
      onMessageToast({
        message: '모든 필드를 입력하고 개인정보 처리에 동의해주세요.',
      });
      return;
    }

    // 생년월일 필드가 표시되는 경우 필수 검증 (8자리)
    if (showBirthdayField && (!birthday.trim() || birthday.trim().length !== 8)) {
      onMessageToast({
        message: '생년월일을 8자리로 정확히 입력해주세요.',
      });
      return;
    }

    setIsSubmitting(true);
    try {
      // /user/modify API 호출을 위한 데이터 준비
      // licenseNumber와 issueNumber는 입력값이 있으면 입력값을, 없으면 빈 문자열로 전송
      const updateData = {
        licenseNumber: lawyerNumber.trim() || '',
        issueNumber: registrationNumber.trim() || '',
        birthdate: showBirthdayField ? birthday.trim() : userInfo?.data?.birthdate || '',
        certify_status: '인증대기',
      };

      const result = await onUpdateUserInfo(updateData);

      if (result?.isSuccess) {
        onMessageToast({
          message: '변호사 정보가 성공적으로 저장되었습니다.',
        });

        // 성공 콜백 호출
        if (onVerificationSuccess) {
          onVerificationSuccess();
        }

        onClose();
      } else {
        const failureMessage = '변호사 정보 저장이 실패하였습니다. 다시 시도해주세요.';
        if (onVerificationFailure) {
          onVerificationFailure(failureMessage);
        }
        onClose();
      }
    } catch (error) {
      console.error('변호사 정보 저장 오류:', error);
      const errorMessage = '변호사 정보 저장이 실패하였습니다. 다시 시도해주세요.';
      if (onVerificationFailure) {
        onVerificationFailure(errorMessage);
      }
      onClose();
    } finally {
      setIsSubmitting(false);
    }
  };

  if (!isOpen) return <></>;

  return (
    <div className='fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50'>
      <div
        className='relative flex flex-col items-center justify-center gap-6 rounded-2xl bg-white p-8 shadow-lg'
        style={{
          display: 'inline-flex',
          padding: '32px',
          flexDirection: 'column',
          justifyContent: 'center',
          alignItems: 'center',
          gap: '24px',
          borderRadius: '16px',
          background: '#FFF',
          boxShadow: '0 0 16px 0 rgba(91, 122, 176, 0.16)',
        }}
      >
        {/* 닫기 버튼 */}
        <button
          onClick={onClose}
          className='absolute right-4 top-4 flex h-8 w-8 items-center justify-center rounded-full hover:bg-gray-100'
        >
          <IoMdClose className='h-5 w-5 text-gray-500' />
        </button>

        {/* 모달 내용 */}
        <div className='flex w-[300px] flex-col gap-6 lg:w-[400px]'>
          <div>
            <h2 className='text-[24px] font-bold text-[#212121]'>변호사 정보 입력</h2>
            {userInfo?.data?.certify_status === '인증실패' && (
              <p
                className='mt-2'
                style={{
                  color: '#F5222D',
                  fontFamily: 'Pretendard',
                  fontSize: '14px',
                  fontStyle: 'normal',
                  fontWeight: 500,
                  lineHeight: '20px',
                }}
              >
                변호사 인증이 실패하였습니다. 다시 인증해주세요.
              </p>
            )}
          </div>

          {/* 대한변호사협회 신청 등록번호 */}
          <div className='flex flex-col gap-2'>
            <label className='text-[14px] font-medium text-[#5B5B5B]'>
              대한변호사협회 신청 등록번호 <span className='text-[#1890FF]'>*</span>
            </label>
            <Input
              type='text'
              value={lawyerNumber}
              onChange={(e) => setLawyerNumber(e.target.value.replace(/\D/g, ''))}
              placeholder='등록번호를 입력해주세요'
              className='h-[56px] w-full rounded-[8px] px-4 text-[16px] placeholder-[#BABABA] focus:outline-none'
              maxLength={5}
            />
          </div>

          {/* 대한변호사협회 신청 발급번호 */}
          <div className='flex flex-col gap-2'>
            <label className='text-[14px] font-medium text-[#5B5B5B]'>
              대한변호사협회 신청 발급번호 <span className='text-[#1890FF]'>*</span>
            </label>
            <Input
              type='text'
              value={registrationNumber}
              onChange={(e) => setRegistrationNumber(e.target.value.replace(/\D/g, ''))}
              placeholder='발급번호를 입력해주세요'
              className='h-[56px] w-full rounded-[8px] px-4 text-[16px] placeholder-[#BABABA] focus:outline-none'
              maxLength={5}
            />
          </div>
          {/* 생년월일 필드 - 유저 정보에 birthdate가 없을 때만 표시 */}
          {showBirthdayField && (
            <div className='flex flex-col gap-2'>
              <label className='text-[14px] font-medium text-[#5B5B5B]'>
                생년월일 8자리 <span className='text-[#1890FF]'>*</span>
              </label>
              <Input
                type='text'
                value={birthday}
                onChange={(e) => setBirthday(e.target.value.replace(/\D/g, ''))}
                placeholder='생년월일을 입력해주세요 (예 : 19700101)'
                className={`h-[56px] w-full rounded-[8px] px-4 text-[16px] placeholder-[#BABABA] focus:outline-none ${
                  birthday.trim() && birthday.trim().length !== 8 ? 'border-red-500 focus:border-red-500' : ''
                }`}
                maxLength={8}
              />
              {birthday.trim() && birthday.trim().length !== 8 && (
                <p className='text-[12px] text-red-500'>생년월일을 8자리로 정확히 입력해주세요.</p>
              )}
            </div>
          )}

          {/* 개인정보 처리 동의 */}
          <div className='flex items-center justify-between'>
            <div className='flex items-center gap-2'>
              <input
                type='checkbox'
                id='privacy-agreement'
                checked={isAgreed}
                onChange={(e) => setIsAgreed(e.target.checked)}
                className='h-4 w-4 rounded border-gray-300 text-[#004AA4] focus:border-[#004AA4]'
              />
              <label htmlFor='privacy-agreement' className='text-[14px] text-[#212121]'>
                <span className='text-[#7D7D7D]'>(필수)</span> 개인정보 수집 및 이용에 동의합니다.
              </label>
            </div>
            <IoIosArrowForward
              className='h-5 w-5 cursor-pointer text-gray-400 hover:text-gray-600'
              onClick={() => window.open('/policy', '_blank')}
            />
          </div>

          {/* 버튼 */}
          <div className='flex gap-3'>
            <button
              onClick={handleVerification}
              disabled={
                isSubmitting ||
                !lawyerNumber.trim() ||
                !registrationNumber.trim() ||
                !isAgreed ||
                (showBirthdayField && (!birthday.trim() || birthday.trim().length !== 8))
              }
              className='flex-1 rounded-[8px] bg-[#004AA4] py-3 text-[16px] font-medium text-white disabled:cursor-not-allowed disabled:bg-[#F3F3F3] disabled:text-[#BABABA]'
            >
              {isSubmitting ? '처리 중...' : '등록'}
            </button>
            <button onClick={onClose} className='flex-1 rounded-[8px] border border-[#E5E5E5] py-3 text-[16px] font-medium text-[#212121]'>
              취소
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
