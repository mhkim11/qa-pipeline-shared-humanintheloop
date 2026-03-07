// ... existing code ...

import { useState } from 'react';

import { zodResolver } from '@hookform/resolvers/zod';
import { useForm } from 'react-hook-form';
import { FaExclamationCircle } from 'react-icons/fa';
import { IoMdCheckmarkCircle } from 'react-icons/io';
import { z } from 'zod';

import { useFindUserInfo } from '@query/query';
import { fetchSettingPassword } from '@apis/evidence-api';
import { onMessageToast } from '@/components/utils';
import { useLoginStore } from '@/hooks/stores';

interface IResetPasswordModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess?: () => void;
}

// 비밀번호 유효성 검사 스키마
const resetPasswordSchema = z
  .object({
    currentPassword: z.string().min(1, '현재 비밀번호를 입력해주세요'),
    newPassword: z
      .string()
      .min(8, '비밀번호는 최소 8자 이상이어야 합니다')
      .regex(/^(?=.*[a-zA-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$/, '영문, 숫자, 특수문자를 포함해야 합니다'),
    confirmPassword: z.string().min(1, '비밀번호 확인을 입력해주세요'),
  })
  .refine((data) => data.newPassword === data.confirmPassword, {
    message: '새 비밀번호와 비밀번호 확인이 일치하지 않습니다',
    path: ['confirmPassword'],
  });

type TResetPasswordForm = z.infer<typeof resetPasswordSchema>;

export const SettingResetPwModal = ({ isOpen, onClose, onSuccess }: IResetPasswordModalProps) => {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [serverErrors, setServerErrors] = useState<{
    currentPassword?: string;
    newPassword?: string;
  }>({});

  // 유저정보 가져오기
  const { login } = useLoginStore();
  const { response: findEvidenceUserInfo } = useFindUserInfo();
  const fontSizeAdjustment = findEvidenceUserInfo?.data?.font_size_rate || 0;

  const {
    register,
    handleSubmit,
    formState: { errors },
    reset,
  } = useForm<TResetPasswordForm>({
    resolver: zodResolver(resetPasswordSchema),
    mode: 'onChange',
  });

  // 폰트 크기 조정 옵션
  const fontSizeClasses = {
    18: ['text-base', 'text-lg', 'text-xl', 'text-2xl', 'text-3xl', 'text-4xl', 'text-5xl'],
    16: ['text-sm', 'text-base', 'text-lg', 'text-xl', 'text-2xl', 'text-3xl', 'text-4xl'],
    14: ['text-xs', 'text-sm', 'text-base', 'text-lg', 'text-xl', 'text-2xl', 'text-3xl'],
    12: ['text-2xs', 'text-xs', 'text-sm', 'text-base', 'text-lg', 'text-xl', 'text-2xl'],
  } as const;

  // 폰트 크기 조정 클래스 선택
  const getFontSizeClass = (baseSize: keyof typeof fontSizeClasses, adjustment: number) => {
    const steps = [-30, -20, -10, 0, 10, 20, 30];
    const index = steps.indexOf(adjustment);
    return fontSizeClasses[baseSize][index !== -1 ? index : 3]; // 기본값(0%)은 index 3
  };

  // 동적 폰트 크기 조정
  const getAdjustedSize = (baseSize: number) => {
    return baseSize * (1 + fontSizeAdjustment / 100);
  };

  const onSubmit = async (data: TResetPasswordForm) => {
    setIsSubmitting(true);
    setServerErrors({});

    try {
      // 토큰 확인
      const token = login.data?.accessToken;
      if (!token) {
        onMessageToast({
          message: '인증 정보가 없습니다.',
          icon: <FaExclamationCircle className='h-5 w-5 text-yellow-500' />,
        });
        setIsSubmitting(false);
        return;
      }
      await fetchSettingPassword({
        password: data.currentPassword,
        new_password: data.newPassword,
      });

      // 성공 케이스
      onMessageToast({
        message: '비밀번호가 성공적으로 변경되었습니다.',
        icon: <IoMdCheckmarkCircle className='h-5 w-5 text-green-500' />,
      });
      reset();
      if (onSuccess) onSuccess();
      onClose();
    } catch (error: any) {
      console.error('비밀번호 변경 오류:', error);

      // 서버 에러 응답이 있는 경우
      if (error.response && error.response.data) {
        const errorData = error.response.data;

        // 현재 비밀번호가 일치하지 않는 경우
        if (errorData.message === '현재 비밀번호가 일치하지 않습니다.') {
          setServerErrors({ currentPassword: '현재 비밀번호가 일치하지 않습니다.' });
        } else {
          onMessageToast({
            message: errorData.message || '비밀번호 변경에 실패했습니다.',
            icon: <FaExclamationCircle className='h-5 w-5 text-yellow-500' />,
          });
        }
      } else {
        // 일반적인 에러 처리
        onMessageToast({
          message: '비밀번호 변경 중 오류가 발생했습니다.',
          icon: <FaExclamationCircle className='h-5 w-5 text-yellow-500' />,
        });
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className='fixed inset-0 z-20 flex items-center justify-center bg-[#999] bg-opacity-80'>
      <div className='relative min-h-[450px] min-w-[425px] rounded-[5px] bg-[#fff]'>
        <div className='border-b pb-[20px] pl-[20px] pt-[20px] text-[16px] text-[#000]'>비밀번호 재설정</div>

        <form onSubmit={handleSubmit(onSubmit)} className='px-[32px] py-[24px]'>
          <div className='mb-6'>
            <label
              className={`block text-[#000] ${getFontSizeClass(14, fontSizeAdjustment)}`}
              style={{ fontSize: `${getAdjustedSize(14)}px` }}
            >
              현재 비밀번호
            </label>
            <input
              type='password'
              placeholder='현재 비밀번호 입력'
              {...register('currentPassword')}
              className={`mt-2 h-[56px] w-full rounded-lg border ${serverErrors.currentPassword ? 'border-red-500' : 'border-[#C2C2C2]'} px-4 ${getFontSizeClass(14, fontSizeAdjustment)}`}
              style={{ fontSize: `${getAdjustedSize(14)}px` }}
            />
            {errors.currentPassword && <p className='mt-1 text-sm text-red-500'>{errors.currentPassword.message}</p>}
            {serverErrors.currentPassword && <p className='mt-1 text-sm text-red-500'>{serverErrors.currentPassword}</p>}
          </div>

          <div className=''>
            <label
              className={`block text-[#000] ${getFontSizeClass(14, fontSizeAdjustment)}`}
              style={{ fontSize: `${getAdjustedSize(14)}px` }}
            >
              새 비밀번호
            </label>

            <input
              type='password'
              {...register('newPassword')}
              placeholder='새 비밀번호 입력'
              className={`mt-2 h-[56px] w-full rounded-lg border ${serverErrors.newPassword ? 'border-red-500' : 'border-[#C2C2C2]'} px-4 ${getFontSizeClass(14, fontSizeAdjustment)}`}
              style={{ fontSize: `${getAdjustedSize(14)}px` }}
            />
            {errors.newPassword && <p className='mt-1 text-sm text-red-500'>{errors.newPassword.message}</p>}
            {serverErrors.newPassword && <p className='mt-1 text-sm text-red-500'>{serverErrors.newPassword}</p>}
          </div>

          <div className='mb-6'>
            <input
              type='password'
              {...register('confirmPassword')}
              placeholder='새 비밀번호 재입력'
              className={`mt-2 h-[56px] w-full rounded-lg border ${errors.confirmPassword ? 'border-red-500' : 'border-[#C2C2C2]'} px-4 ${getFontSizeClass(14, fontSizeAdjustment)}`}
              style={{ fontSize: `${getAdjustedSize(14)}px` }}
            />
            {errors.confirmPassword && <p className='mt-1 text-sm text-red-500'>{errors.confirmPassword.message}</p>}
          </div>

          <div className='flex items-center justify-center pb-[24px] pt-[16px]'>
            <button type='submit' disabled={isSubmitting} className='h-[46px] w-[130px] rounded-lg bg-[#4577A4] text-white'>
              {isSubmitting ? '변경 중...' : '변경하기'}
            </button>
            <button
              type='button'
              className={`ml-6 h-[46px] w-[130px] rounded-lg border border-[#4577A4] bg-white px-4 py-1 text-[#4577A4] ${
                isSubmitting ? 'cursor-not-allowed opacity-50' : ''
              }`}
              onClick={isSubmitting ? undefined : onClose}
              disabled={isSubmitting}
            >
              취소
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
