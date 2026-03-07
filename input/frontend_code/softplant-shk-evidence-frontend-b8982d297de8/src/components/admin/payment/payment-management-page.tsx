import { useState } from 'react';

import { TSubscriptionPlan } from '@/apis/type/subscription.type';
import { PaymentManagementTable } from '@/components/admin/payment/payment-management-table';
import { PlanCreateModal } from '@/components/admin/payment/plan-create-modal';
import { PlanDetailModal } from '@/components/admin/payment/plan-detail-modal';

export const PaymentManagementPage = () => {
  const [selectedPlan, setSelectedPlan] = useState<TSubscriptionPlan | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);

  // 플랜 선택 핸들러
  const handlePlanSelect = (plan: TSubscriptionPlan) => {
    setSelectedPlan(plan);
    setIsModalOpen(true);
  };

  // 모달 닫기
  const handleCloseModal = () => {
    setIsModalOpen(false);
    setSelectedPlan(null);
  };

  // 플랜 생성 핸들러
  const handleCreatePlan = () => {
    setIsCreateModalOpen(true);
  };

  // 생성 모달 닫기
  const handleCloseCreateModal = () => {
    setIsCreateModalOpen(false);
  };

  // 수정 성공 후 처리
  const handleUpdateSuccess = () => {
    // 테이블 데이터가 자동으로 업데이트됨 (React Query 캐시 무효화)
  };

  // 생성 성공 후 처리
  const handleCreateSuccess = () => {
    // 테이블 데이터가 자동으로 업데이트됨 (React Query 캐시 무효화)
  };

  return (
    <div className='h-full w-full'>
      <PaymentManagementTable onPlanSelect={handlePlanSelect} onCreatePlan={handleCreatePlan} />

      <PlanDetailModal isOpen={isModalOpen} onClose={handleCloseModal} plan={selectedPlan} onSuccess={handleUpdateSuccess} />

      <PlanCreateModal isOpen={isCreateModalOpen} onClose={handleCloseCreateModal} onSuccess={handleCreateSuccess} />
    </div>
  );
};
