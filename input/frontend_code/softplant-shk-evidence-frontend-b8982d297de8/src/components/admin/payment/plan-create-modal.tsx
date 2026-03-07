import { useState } from 'react';

import { X, Loader2 } from 'lucide-react';
import { useForm } from 'react-hook-form';

import { TCreateSubscriptionPlanInput } from '@/apis/type/subscription.type';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { onMessageToast } from '@/components/utils';
import { useCreateSubscriptionPlan } from '@/hooks/react-query/mutation/subscription';

interface IPlanCreateModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess?: () => void;
}

export const PlanCreateModal = ({ isOpen, onClose, onSuccess }: IPlanCreateModalProps) => {
  // 플랜 생성 mutation
  const { mutate: createPlan, isLoading: isCreating } = useCreateSubscriptionPlan({
    onSuccess: () => {
      onSuccess?.();
      onClose();
      onMessageToast({ message: '플랜이 성공적으로 생성되었습니다.' });
    },
    onError: (error) => {
      console.error('Plan create error:', error);
      onMessageToast({ message: '플랜 생성 중 오류가 발생했습니다.' });
    },
  });

  // React Hook Form
  const {
    register,
    handleSubmit,
    reset,
    setValue,
    formState: { errors },
  } = useForm<TCreateSubscriptionPlanInput>({
    defaultValues: {
      plan_name: '',
      plan_description: [],
      payment_type: 'case_subscription',
      unitPrice: 0,
      amount: 0,
      interval: 'month',
      discount_amount: 0,
      discount_percentage: undefined,
      isActive: true,
    },
  });

  // 플랜 설명 상태
  const [descriptions, setDescriptions] = useState<string[]>([]);
  const [newDescription, setNewDescription] = useState('');

  // 설명 추가
  const handleAddDescription = () => {
    if (newDescription.trim()) {
      const updatedDescriptions = [...descriptions, newDescription.trim()];
      setDescriptions(updatedDescriptions);
      setValue('plan_description', updatedDescriptions);
      setNewDescription('');
    }
  };

  // 설명 제거
  const handleRemoveDescription = (index: number) => {
    const updatedDescriptions = descriptions.filter((_, i) => i !== index);
    setDescriptions(updatedDescriptions);
    setValue('plan_description', updatedDescriptions);
  };

  // 폼 제출
  const onSubmit = (data: TCreateSubscriptionPlanInput) => {
    createPlan({
      ...data,
      plan_description: descriptions,
    });
  };

  // 모달 닫기 시 폼 리셋
  const handleClose = () => {
    reset();
    setDescriptions([]);
    setNewDescription('');
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div className='fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50'>
      <div className='max-h-[90vh] w-full max-w-4xl overflow-auto rounded-lg bg-white p-6'>
        {/* 헤더 */}
        <div className='mb-6 flex items-center justify-between'>
          <h2 className='text-2xl font-bold text-gray-900'>새 플랜 생성</h2>
          <button onClick={handleClose} className='flex h-8 w-8 items-center justify-center rounded-lg text-gray-400 hover:bg-gray-100'>
            <X className='h-5 w-5' />
          </button>
        </div>

        <form onSubmit={handleSubmit(onSubmit)}>
          <div className='grid grid-cols-1 gap-6 lg:grid-cols-2'>
            {/* 기본 정보 */}
            <div className='space-y-4'>
              <h3 className='text-lg font-semibold text-gray-900'>기본 정보</h3>

              {/* 플랜명 */}
              <div>
                <label className='block text-sm font-medium text-gray-700'>플랜명 *</label>
                <input
                  type='text'
                  {...register('plan_name', { required: '플랜명을 입력해주세요.' })}
                  className='mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500'
                />
                {errors.plan_name && <p className='mt-1 text-sm text-red-600'>{errors.plan_name.message}</p>}
              </div>

              {/* 결제 타입 */}
              <div>
                <label className='block text-sm font-medium text-gray-700'>결제 타입 *</label>
                <Select
                  defaultValue='case_subscription'
                  onValueChange={(value) => setValue('payment_type', value as 'case_subscription' | 'case_participation_request')}
                >
                  <SelectTrigger className='mt-1 h-[43px] w-full'>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value='case_subscription'>사건 구독</SelectItem>
                    <SelectItem value='case_participation_request'>사건 참여</SelectItem>
                  </SelectContent>
                </Select>
                {errors.payment_type && <p className='mt-1 text-sm text-red-600'>{errors.payment_type.message}</p>}
              </div>

              {/* 결제 주기 */}
              <div>
                <label className='block text-sm font-medium text-gray-700'>결제 주기 *</label>
                <Select defaultValue='month' onValueChange={(value) => setValue('interval', value as 'month' | 'year')}>
                  <SelectTrigger className='mt-1 h-[43px] w-full'>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value='month'>월간</SelectItem>
                    <SelectItem value='year'>연간</SelectItem>
                  </SelectContent>
                </Select>
                {errors.interval && <p className='mt-1 text-sm text-red-600'>{errors.interval.message}</p>}
              </div>

              {/* 활성 상태 */}
              {/*    <div>
                <label className='flex items-center gap-2'>
                  <input type='checkbox' {...register('isActive')} className='h-4 w-4' />
                  <span className='text-sm font-medium text-gray-700'>활성 상태</span>
                </label>
              </div> */}
            </div>

            {/* 가격 정보 */}
            <div className='space-y-4'>
              <h3 className='text-lg font-semibold text-gray-900'>가격 정보</h3>

              {/* 정가 */}
              <div>
                <label className='block text-sm font-medium text-gray-700'>정가 (원) *</label>
                <input
                  type='number'
                  {...register('unitPrice', {
                    required: '정가를 입력해주세요.',
                    min: { value: 0, message: '0 이상의 값을 입력해주세요.' },
                  })}
                  className='mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500'
                />
                {errors.unitPrice && <p className='mt-1 text-sm text-red-600'>{errors.unitPrice.message}</p>}
              </div>

              {/* 실제 결제 금액 */}
              <div>
                <label className='block text-sm font-medium text-gray-700'>실제 결제 금액 (원) *</label>
                <input
                  type='number'
                  {...register('amount', {
                    required: '실제 결제 금액을 입력해주세요.',
                    min: { value: 0, message: '0 이상의 값을 입력해주세요.' },
                  })}
                  className='mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500'
                />
                {errors.amount && <p className='mt-1 text-sm text-red-600'>{errors.amount.message}</p>}
              </div>

              {/* 할인 금액 */}
              <div>
                <label className='block text-sm font-medium text-gray-700'>할인 금액 (원)</label>
                <input
                  type='number'
                  {...register('discount_amount', {
                    min: { value: 0, message: '0 이상의 값을 입력해주세요.' },
                  })}
                  className='mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500'
                />
                {errors.discount_amount && <p className='mt-1 text-sm text-red-600'>{errors.discount_amount.message}</p>}
              </div>

              {/* 할인 퍼센트 */}
              <div>
                <label className='block text-sm font-medium text-gray-700'>할인 퍼센트 (%)</label>
                <input
                  type='number'
                  {...register('discount_percentage', {
                    min: { value: 0, message: '0 이상의 값을 입력해주세요.' },
                    max: { value: 100, message: '100 이하의 값을 입력해주세요.' },
                  })}
                  className='mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500'
                />
                {errors.discount_percentage && <p className='mt-1 text-sm text-red-600'>{errors.discount_percentage.message}</p>}
              </div>
            </div>
          </div>

          {/* 플랜 설명 */}
          <div className='mt-6'>
            <h3 className='text-lg font-semibold text-gray-900'>플랜 설명</h3>
            <div className='mt-4 space-y-2'>
              {descriptions.map((desc, index) => (
                <div key={index} className='flex items-center gap-2'>
                  <span className='flex-1 rounded-md bg-gray-50 px-3 py-2'>{desc}</span>
                  <button
                    type='button'
                    onClick={() => handleRemoveDescription(index)}
                    className='flex h-8 w-8 items-center justify-center rounded-md bg-red-100 text-red-600 hover:bg-red-200'
                  >
                    <X className='h-4 w-4' />
                  </button>
                </div>
              ))}
              <div className='flex items-center gap-2'>
                <input
                  type='text'
                  value={newDescription}
                  onChange={(e) => setNewDescription(e.target.value)}
                  placeholder='새 설명 추가'
                  className='flex-1 rounded-md border border-gray-300 px-3 py-2 focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500'
                  onKeyDown={(e) => {
                    if (e.key === 'Enter') {
                      e.preventDefault();
                      handleAddDescription();
                    }
                  }}
                />
                <button
                  type='button'
                  onClick={handleAddDescription}
                  className='rounded-md bg-blue-600 px-4 py-2 text-white hover:bg-blue-700'
                >
                  추가
                </button>
              </div>
            </div>
          </div>

          {/* 액션 버튼 */}
          <div className='mt-8 flex justify-end gap-4'>
            <button
              type='button'
              onClick={handleClose}
              disabled={isCreating}
              className='h-[45px] w-full rounded-lg border border-gray-300 text-gray-700 hover:bg-gray-50'
            >
              취소
            </button>
            <button
              type='submit'
              disabled={isCreating}
              className='flex h-[45px] w-full items-center justify-center gap-2 rounded-lg bg-[#004AA4] text-white hover:bg-blue-700 disabled:bg-gray-400'
            >
              {isCreating ? (
                <>
                  <Loader2 className='h-4 w-4 animate-spin' />
                  생성 중...
                </>
              ) : (
                <>플랜 생성하기</>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
