import { useState } from 'react';

import { zodResolver } from '@hookform/resolvers/zod';
import { delay } from 'lodash-es';
import { X } from 'lucide-react';
import { useForm } from 'react-hook-form';
import { FaExclamationCircle } from 'react-icons/fa';
import { IoMdCheckmarkCircle } from 'react-icons/io';
import { useNavigate } from 'react-router-dom';
import { z } from 'zod';

import { fetchChangeAdminPassword } from '@apis/evidence-admin-api';
import { onMessageToast } from '@/components/utils';
import { useLoginStore } from '@/hooks/stores';

interface IAdminPasswordChangeModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess?: () => void;
}

// 비밀번호 유효성 검사 스키마
const adminPasswordSchema = z
  .object({
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

type TAdminPasswordForm = z.infer<typeof adminPasswordSchema>;

export const AdminPasswordChangeModal = ({ isOpen, onClose, onSuccess }: IAdminPasswordChangeModalProps) => {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [serverErrors, setServerErrors] = useState<{
    newPassword?: string;
  }>({});

  const { login, dispatchLogin } = useLoginStore();
  const navigate = useNavigate();

  const {
    register,
    handleSubmit,
    formState: { errors },
    reset,
  } = useForm<TAdminPasswordForm>({
    resolver: zodResolver(adminPasswordSchema),
    mode: 'onChange',
  });

  const onSubmit = async (data: TAdminPasswordForm) => {
    setIsSubmitting(true);
    setServerErrors({});

    try {
      const email = login?.data?.user?.email;
      if (!email) {
        onMessageToast({
          message: '이메일 정보를 찾을 수 없습니다.',
          icon: <FaExclamationCircle className='h-5 w-5 text-yellow-500' />,
        });
        setIsSubmitting(false);
        return;
      }

      await fetchChangeAdminPassword({
        email,
        newPassword: data.newPassword,
      });

      // 성공 케이스
      onMessageToast({
        message: '비밀번호가 성공적으로 변경되었습니다. 다시 로그인해주세요.',
        icon: <IoMdCheckmarkCircle className='h-5 w-5 text-green-500' />,
      });
      reset();
      onClose();

      // 비밀번호 변경 후 로그아웃 처리
      delay(() => {
        dispatchLogin({ type: 'LOGOUT' });
        navigate('/logout', { replace: true });
      }, 500);

      if (onSuccess) onSuccess();
    } catch (error: any) {
      console.error('비밀번호 변경 오류:', error);

      // 서버 에러 응답이 있는 경우
      if (error.response && error.response.data) {
        const errorData = error.response.data;
        onMessageToast({
          message: errorData.message || '비밀번호 변경에 실패했습니다.',
          icon: <FaExclamationCircle className='h-5 w-5 text-yellow-500' />,
        });
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
    <div className='fixed inset-0 z-[100] flex items-center justify-center bg-black bg-opacity-50' onClick={onClose}>
      <div className='relative min-h-[400px] min-w-[450px] rounded-lg bg-white shadow-xl' onClick={(e) => e.stopPropagation()}>
        {/* 헤더 */}
        <div className='flex items-center justify-between border-b px-6 py-4'>
          <h2 className='text-lg font-semibold text-gray-900'>비밀번호 변경</h2>
          <button onClick={onClose} className='rounded-lg p-1 text-gray-400 transition-colors hover:bg-gray-100 hover:text-gray-600'>
            <X className='h-5 w-5' />
          </button>
        </div>

        {/* 사용자 정보 */}
        <div className='border-b bg-gray-50 px-6 py-4'>
          <div className='space-y-1'>
            <div className='text-sm text-gray-500'>이름</div>
            <div className='text-base font-medium text-gray-900'>{login?.data?.user?.name || '사용자'}</div>
          </div>
          <div className='mt-3 space-y-1'>
            <div className='text-sm text-gray-500'>이메일</div>
            <div className='text-base font-medium text-gray-900'>{login?.data?.user?.email || ''}</div>
          </div>
        </div>

        {/* 폼 */}
        <form onSubmit={handleSubmit(onSubmit)} className='px-6 py-6'>
          <div className='mb-4'>
            <label className='mb-2 block text-sm font-medium text-gray-700'>새 비밀번호</label>
            <input
              type='password'
              {...register('newPassword')}
              placeholder='새 비밀번호 입력'
              className={`h-12 w-full rounded-lg border px-4 ${
                serverErrors.newPassword || errors.newPassword ? 'border-red-500' : 'border-gray-300'
              } focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-200`}
            />
            {errors.newPassword && <p className='mt-1 text-sm text-red-500'>{errors.newPassword.message}</p>}
            {serverErrors.newPassword && <p className='mt-1 text-sm text-red-500'>{serverErrors.newPassword}</p>}
            <p className='mt-1 text-xs text-gray-500'>8자 이상, 영문, 숫자, 특수문자 포함</p>
          </div>

          <div className='mb-6'>
            <label className='mb-2 block text-sm font-medium text-gray-700'>비밀번호 확인</label>
            <input
              type='password'
              {...register('confirmPassword')}
              placeholder='새 비밀번호 재입력'
              className={`h-12 w-full rounded-lg border px-4 ${
                errors.confirmPassword ? 'border-red-500' : 'border-gray-300'
              } focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-200`}
            />
            {errors.confirmPassword && <p className='mt-1 text-sm text-red-500'>{errors.confirmPassword.message}</p>}
          </div>

          {/* 버튼 */}
          <div className='flex items-center justify-end gap-3'>
            <button
              type='button'
              className={`h-11 rounded-lg border border-gray-300 bg-white px-6 text-sm font-medium text-gray-700 transition-colors hover:bg-gray-50 ${
                isSubmitting ? 'cursor-not-allowed opacity-50' : ''
              }`}
              onClick={onClose}
              disabled={isSubmitting}
            >
              취소
            </button>
            <button
              type='submit'
              disabled={isSubmitting}
              className='h-11 rounded-lg bg-blue-600 px-6 text-sm font-medium text-white transition-colors hover:bg-blue-700 disabled:cursor-not-allowed disabled:opacity-50'
            >
              {isSubmitting ? '변경 중...' : '변경하기'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
