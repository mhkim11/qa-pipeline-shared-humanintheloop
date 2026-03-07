import { useState, useCallback, useMemo } from 'react';

import { Spinner } from '@nextui-org/spinner';
import { Plus, Trash2 } from 'lucide-react';

import { TSubscriptionPlan } from '@/apis/type/subscription.type';
import { Table, TableBox, TableCell, TableRow } from '@/components/evidence/admin/table/user-admin-table.styled';
import { onMessageToast } from '@/components/utils';
import { useDeactivateSubscriptionPlan } from '@/hooks/react-query/mutation/subscription';
import { useGetSubscriptionPlans } from '@/hooks/react-query/query/subscription';

interface IPaymentManagementTableProps {
  onPlanSelect?: (plan: TSubscriptionPlan) => void;
  onCreatePlan?: () => void;
}

export const PaymentManagementTable = ({ onPlanSelect, onCreatePlan }: IPaymentManagementTableProps) => {
  // 선택된 플랜들
  const [selectedPlans, setSelectedPlans] = useState<string[]>([]);

  // 구독 플랜 목록 조회
  const {
    response: plansResponse,
    isLoading,
    error,
    refetch,
  } = useGetSubscriptionPlans({
    include_inactive: true,
  });

  // 플랜 비활성화 mutation
  const { mutate: deactivatePlan, isLoading: isDeactivating } = useDeactivateSubscriptionPlan({
    onSuccess: () => {
      onMessageToast({ message: '플랜이 성공적으로 삭제되었습니다.' });
      setSelectedPlans([]);
    },
    onError: (err) => {
      console.error('Deactivate plan error:', err);
      onMessageToast({ message: '플랜 삭제 중 오류가 발생했습니다.' });
    },
  });

  const plans = useMemo(() => plansResponse?.data || [], [plansResponse?.data]);

  // 플랜 클릭 핸들러
  const handlePlanClick = useCallback(
    (plan: TSubscriptionPlan) => {
      onPlanSelect?.(plan);
    },
    [onPlanSelect],
  );

  // 체크박스 전체 선택/해제
  const handleSelectAll = useCallback(
    (checked: boolean) => {
      if (checked) {
        const activePlans = plans.filter((plan) => plan.isActive).map((plan) => plan.plan_id);
        setSelectedPlans(activePlans);
      } else {
        setSelectedPlans([]);
      }
    },
    [plans],
  );

  // 개별 체크박스 선택/해제
  const handleSelectPlan = useCallback((planId: string, checked: boolean) => {
    if (checked) {
      setSelectedPlans((prev) => [...prev, planId]);
    } else {
      setSelectedPlans((prev) => prev.filter((id) => id !== planId));
    }
  }, []);

  // 선택된 플랜들 삭제
  const handleDeleteSelected = useCallback(() => {
    if (selectedPlans.length === 0) return;

    if (confirm(`선택된 ${selectedPlans.length}개의 플랜을 삭제하시겠습니까?`)) {
      selectedPlans.forEach((planId) => {
        deactivatePlan(planId);
      });
      setSelectedPlans([]);
    }
  }, [selectedPlans, deactivatePlan]);

  // 금액 포맷팅
  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('ko-KR').format(price);
  };

  // 날짜 포맷팅
  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('ko-KR', {
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
    });
  };

  // 결제 타입 한글 변환
  const getPaymentTypeText = (type: string) => {
    switch (type) {
      case 'case_subscription':
        return '사건 구독';
      case 'case_participation_request':
        return '사건 참여';
      default:
        return type;
    }
  };

  // 주기 한글 변환
  const getIntervalText = (interval: string) => {
    switch (interval) {
      case 'month':
        return '월간';
      case 'year':
        return '연간';
      case 'week':
        return '주간';
      case 'day':
        return '일간';
      default:
        return interval;
    }
  };

  if (isLoading) {
    return (
      <div className='flex h-[400px] w-full items-center justify-center'>
        <Spinner size='lg' color='primary' label='플랜 목록을 불러오는 중입니다...' />
      </div>
    );
  }

  if (error) {
    onMessageToast({ message: '플랜 목록을 불러오는 중 오류가 발생했습니다.' });
    return (
      <div className='flex h-[400px] w-full flex-col items-center justify-center gap-4'>
        <p className='text-red-600'>플랜 목록을 불러오는 중 오류가 발생했습니다.</p>
        <button onClick={() => refetch()} className='rounded-lg bg-blue-600 px-4 py-2 text-white hover:bg-blue-700'>
          다시 시도
        </button>
      </div>
    );
  }

  return (
    <div className='h-full w-full p-[20px]'>
      {/* 헤더 */}
      <div className='mt-4 flex items-center justify-between'>
        <h1 className='mr-4 text-[20px] font-bold'>결제 플랜 관리</h1>
        <div className='flex items-center justify-end gap-4'>
          {selectedPlans.length > 0 && (
            <button
              onClick={handleDeleteSelected}
              disabled={isDeactivating}
              className='flex items-center gap-2 rounded-lg bg-red-600 px-4 py-2 text-sm text-white hover:bg-red-700 disabled:bg-gray-400'
            >
              <Trash2 className='h-4 w-4' />
              삭제 ({selectedPlans.length})
            </button>
          )}
          <button
            onClick={onCreatePlan}
            className='flex items-center gap-2 rounded-lg bg-[#004AA4] px-4 py-2 text-sm text-white hover:bg-blue-700'
          >
            <Plus className='h-4 w-4' />
            신규 플랜 생성
          </button>
        </div>
      </div>

      {/* 테이블 */}
      <TableBox className='h-[calc(100vh-200px)]'>
        <Table>
          <thead>
            <TableRow>
              <TableCell className='sticky top-0 min-w-[50px] bg-[#F7F8F8] text-center font-bold'>
                <input
                  type='checkbox'
                  checked={selectedPlans.length > 0 && selectedPlans.length === plans.filter((p) => p.isActive).length}
                  onChange={(e) => handleSelectAll(e.target.checked)}
                  className='h-4 w-4'
                />
              </TableCell>
              <TableCell className='sticky top-0 min-w-[150px] bg-[#F7F8F8] text-center font-bold'>플랜명</TableCell>
              <TableCell className='sticky top-0 min-w-[120px] bg-[#F7F8F8] text-center font-bold'>결제타입</TableCell>
              <TableCell className='sticky top-0 min-w-[100px] bg-[#F7F8F8] text-center font-bold'>정가</TableCell>
              <TableCell className='sticky top-0 min-w-[100px] bg-[#F7F8F8] text-center font-bold'>할인금액</TableCell>
              <TableCell className='sticky top-0 min-w-[100px] bg-[#F7F8F8] text-center font-bold'>최종금액</TableCell>
              <TableCell className='sticky top-0 min-w-[80px] bg-[#F7F8F8] text-center font-bold'>주기</TableCell>
              <TableCell className='sticky top-0 min-w-[80px] bg-[#F7F8F8] text-center font-bold'>상태</TableCell>
              <TableCell className='sticky top-0 min-w-[120px] bg-[#F7F8F8] text-center font-bold'>생성일</TableCell>
              <TableCell className='sticky top-0 min-w-[120px] bg-[#F7F8F8] text-center font-bold'>수정일</TableCell>
            </TableRow>
          </thead>
          <tbody>
            {plans.length === 0 ? (
              <TableRow>
                <TableCell colSpan={10} className='py-8 text-center text-gray-500'>
                  등록된 플랜이 없습니다.
                </TableCell>
              </TableRow>
            ) : (
              plans.map((plan) => (
                <TableRow key={plan.id} className='cursor-pointer hover:bg-gray-50' onClick={() => handlePlanClick(plan)}>
                  <TableCell className='text-center'>
                    <input
                      type='checkbox'
                      checked={selectedPlans.includes(plan.plan_id)}
                      onChange={(e) => handleSelectPlan(plan.plan_id, e.target.checked)}
                      className='h-4 w-4'
                      onClick={(e) => e.stopPropagation()}
                    />
                  </TableCell>
                  <TableCell className='text-center font-medium'>{plan.plan_name}</TableCell>
                  <TableCell className='text-center'>{getPaymentTypeText(plan.payment_type)}</TableCell>
                  <TableCell className='text-center'>₩{formatPrice(plan.unitPrice)}</TableCell>
                  <TableCell className='text-center'>{plan.discount_amount > 0 ? `₩${formatPrice(plan.discount_amount)}` : '-'}</TableCell>
                  <TableCell className='text-center font-semibold text-blue-600'>₩{formatPrice(plan.final_amount)}</TableCell>
                  <TableCell className='text-center'>{getIntervalText(plan.interval)}</TableCell>
                  <TableCell className='text-center'>
                    <span
                      className={`inline-flex rounded-full px-2 py-1 text-xs font-semibold ${
                        plan.isActive ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
                      }`}
                    >
                      {plan.isActive ? '활성' : '비활성'}
                    </span>
                  </TableCell>
                  <TableCell className='text-center text-sm text-gray-600'>{formatDate(plan.createdAt)}</TableCell>
                  <TableCell className='text-center text-sm text-gray-600'>{formatDate(plan.updatedAt)}</TableCell>
                  {/*  <TableCell className='text-center'>
                    <div className='flex items-center justify-center gap-2'>
                      {plan.isActive && (
                        <>
                          <button
                            onClick={() => handlePlanClick(plan)}
                            className='flex h-8 w-8 items-center justify-center rounded-lg bg-green-100 text-green-600 hover:bg-green-200'
                            title='수정하기'
                          >
                            <Edit className='h-4 w-4' />
                          </button>
                          <button
                            onClick={() => handleDeactivatePlan(plan)}
                            disabled={isDeactivating}
                            className='flex h-8 w-8 items-center justify-center rounded-lg bg-red-100 text-red-600 hover:bg-red-200 disabled:bg-gray-100'
                            title='삭제'
                          >
                            <Trash2 className='h-4 w-4' />
                          </button>
                        </>
                      )}
                    </div>
                  </TableCell> */}
                </TableRow>
              ))
            )}
          </tbody>
        </Table>
      </TableBox>
    </div>
  );
};
