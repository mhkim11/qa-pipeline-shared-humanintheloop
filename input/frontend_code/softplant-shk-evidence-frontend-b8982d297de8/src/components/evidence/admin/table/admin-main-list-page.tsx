import { useCallback, useEffect, useMemo, useRef, useState } from 'react';

import { Spinner } from '@nextui-org/spinner';
import { X, ChevronDown } from 'lucide-react';
import { FiEdit } from 'react-icons/fi';

import { fetchDeleteAdminCaseList, fetchGetAllCaseFilterCount, fetchChangeProjectPaymentStatus } from '@/apis';
import { AdminFreePaymentModal } from '@/components/evidence/admin/modal/admin-free-payment-modal';
import { AdminPaidPaymentModal } from '@/components/evidence/admin/modal/admin-paid-payment-modal';
import {
  Table,
  TableBox,
  TableCell,
  TableRow,
  HeaderWrapper,
  HeaderTitle,
} from '@/components/evidence/admin/table/user-admin-table.styled';
import { EvidencePagination } from '@/components/evidence/pagination/evidence-pagination';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { onMessageToast } from '@/components/utils';
import { useFindAllAdminCaseList, useGetPaymentSettings } from '@/hooks/react-query';
import { useChangeOcrManagementStatus } from '@/hooks/react-query/mutation/evidence';
import { useChangePaymentFunction } from '@/hooks/react-query/mutation/payment';

// 삭제 확인 모달 컴포넌트
const DeleteConfirmModal = ({
  isOpen,
  onClose,
  onConfirm,
  selectedCount,
  isLoading,
}: {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
  selectedCount: number;
  isLoading: boolean;
}) => {
  if (!isOpen) return null;

  return (
    <div className='fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50'>
      <div className='w-full max-w-md transform rounded-lg bg-white p-6 shadow-xl transition-all'>
        <div className='mb-4 flex items-center justify-between'>
          <h3 className='text-lg font-semibold text-gray-900'>사건 삭제 확인</h3>
          <button onClick={onClose} className='rounded-full p-1 text-gray-400 transition-colors hover:bg-gray-100 hover:text-gray-600'>
            <svg className='h-5 w-5' fill='none' viewBox='0 0 24 24' stroke='currentColor'>
              <path strokeLinecap='round' strokeLinejoin='round' strokeWidth={2} d='M6 18L18 6M6 6l12 12' />
            </svg>
          </button>
        </div>

        <div className='mb-6'>
          <div className='mb-4 rounded-lg bg-red-50 p-4'>
            <div className='flex items-center'>
              <div className='flex-shrink-0'>
                <svg className='h-5 w-5 text-red-400' viewBox='0 0 20 20' fill='currentColor'>
                  <path
                    fillRule='evenodd'
                    d='M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z'
                    clipRule='evenodd'
                  />
                </svg>
              </div>
              <div className='ml-3'>
                <h3 className='text-sm font-medium text-red-800'>이 작업은 되돌릴 수 없습니다.</h3>
              </div>
            </div>
          </div>

          <div className='space-y-2'>
            <p className='text-sm text-gray-600'>선택한 {selectedCount}개의 사건을 삭제하시겠습니까?</p>
            <div className='rounded-lg border border-gray-200 bg-gray-50 p-3'>
              <p className='text-sm text-gray-600'>삭제된 사건과 관련된 모든 데이터가 영구적으로 제거됩니다.</p>
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
            className='flex-1 rounded-lg bg-red-600 px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-red-500 focus:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50'
          >
            {isLoading ? (
              <div className='flex items-center justify-center'>
                <Spinner size='sm' color='white' />
                <span className='ml-2'>삭제 중...</span>
              </div>
            ) : (
              `삭제 (${selectedCount}개)`
            )}
          </button>
        </div>
      </div>
    </div>
  );
};

// OCR 관리상태 변경 확인 모달
const OcrRemarkConfirmModal = ({
  isOpen,
  onClose,
  onConfirm,
  caseName,
  nextLabel,
  isLoading,
}: {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
  caseName: string;
  nextLabel: string;
  isLoading: boolean;
}) => {
  if (!isOpen) return null;

  return (
    <div className='fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50'>
      <div className='w-full max-w-md transform rounded-lg bg-white p-6 shadow-xl transition-all'>
        <div className='mb-4 flex items-center justify-between'>
          <h3 className='text-lg font-semibold text-gray-900'>관리상태 변경</h3>
          <button onClick={onClose} className='rounded-full p-1 text-gray-400 transition-colors hover:bg-gray-100 hover:text-gray-600'>
            <svg className='h-5 w-5' fill='none' viewBox='0 0 24 24' stroke='currentColor'>
              <path strokeLinecap='round' strokeLinejoin='round' strokeWidth={2} d='M6 18L18 6M6 6l12 12' />
            </svg>
          </button>
        </div>

        <div className='mb-6 space-y-2'>
          <p className='text-sm text-gray-700'>관리상태를 변경하시겠습니까?</p>
          <p className='text-sm text-gray-600'>
            <strong>"{caseName}"</strong> 사건의 관리상태를 <strong>{nextLabel}</strong>(으)로 변경합니다.
          </p>
        </div>

        <div className='flex gap-3'>
          <button
            onClick={onClose}
            disabled={isLoading}
            className='flex-1 rounded-lg border border-gray-300 bg-white px-4 py-2 text-sm font-medium text-gray-700 transition-colors hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-gray-500 focus:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50'
          >
            아니오
          </button>
          <button
            onClick={onConfirm}
            disabled={isLoading}
            className='flex-1 rounded-lg bg-[#004AA4] px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50'
          >
            {isLoading ? (
              <div className='flex items-center justify-center'>
                <Spinner size='sm' color='white' />
                <span className='ml-2'>변경 중...</span>
              </div>
            ) : (
              '예'
            )}
          </button>
        </div>
      </div>
    </div>
  );
};

// 결제상태별 색상 Select 컴포넌트
interface IPaymentStatusSelectProps {
  paymentStatus?: string; // API에서 받은 payment_status 값
  expireDate?: string; // 무료 종료일 (무료 상태일 때 필수)
  onValueChange: (value: string) => void;
}

const PaymentStatusSelect = ({ paymentStatus, expireDate, onValueChange }: IPaymentStatusSelectProps) => {
  // payment_status 값을 한국어로 변환
  const getKoreanStatus = (status: string | undefined | null, hasExpireDate: boolean) => {
    // 빈 문자열이나 undefined, null인 경우
    if (!status || status === '') {
      // 무료 종료일이 없으면 결제대기로 처리 (무료 종료일 없이는 무료 상태 불가)
      return hasExpireDate ? '무료' : '결제대기';
    }
    console.log('PaymentStatusSelect - payment_status:', status); // 디버깅용
    switch (status) {
      case 'complete':
      case 'payment_complete':
      case 'completed':
        return '결제완료';
      case 'pending':
      case 'payment_pending':
        return '결제대기';
      case 'trial':
      case 'payment_trial':
      case 'free':
        // 무료 상태는 종료일이 없어도 무료로 표시 (종료일은 나중에 설정 가능)
        return '무료';
      default:
        console.log('Unknown payment_status:', status); // 디버깅용
        // 알 수 없는 상태도 무료 종료일이 없으면 결제대기로 처리
        return hasExpireDate ? '무료' : '결제대기';
    }
  };

  // 무료 종료일이 있는지 확인 (유효한 날짜인지도 검증)
  const hasExpireDate = useMemo(() => {
    if (!expireDate) return false;

    // 문자열인 경우 trim 체크
    if (typeof expireDate === 'string') {
      const trimmed = expireDate.trim();
      if (trimmed === '' || trimmed === 'null' || trimmed === 'undefined') return false;

      // Date 객체로 변환하여 유효성 확인
      const date = new Date(trimmed);
      return !isNaN(date.getTime());
    }

    // 문자열이 아닌 경우 Date 객체로 변환 시도
    const date = new Date(expireDate);
    return !isNaN(date.getTime());
  }, [expireDate]);

  const [currentValue, setCurrentValue] = useState(() => {
    const hasDate = (() => {
      if (!expireDate) return false;
      if (typeof expireDate === 'string') {
        const trimmed = expireDate.trim();
        if (trimmed === '' || trimmed === 'null' || trimmed === 'undefined') return false;
        const date = new Date(trimmed);
        return !isNaN(date.getTime());
      }
      const date = new Date(expireDate);
      return !isNaN(date.getTime());
    })();
    return getKoreanStatus(paymentStatus, hasDate);
  });

  // paymentStatus나 expireDate가 변경될 때 currentValue 업데이트
  useEffect(() => {
    setCurrentValue(getKoreanStatus(paymentStatus, hasExpireDate));
  }, [paymentStatus, expireDate, hasExpireDate]);

  const handleValueChange = (value: string) => {
    // 무료를 선택한 경우 UI를 즉시 변경하지 않고 모달이 열리도록 함
    // 모달이 성공적으로 완료되면 refetchCaseList()가 호출되어 paymentStatus prop이 업데이트되고
    // useEffect에서 자동으로 currentValue가 업데이트됨
    if (value === '무료') {
      // 무료 선택 시 UI는 변경하지 않고 모달만 열기
      onValueChange(value);
    } else {
      // 무료가 아닌 경우에만 즉시 UI 변경
      setCurrentValue(value);
      onValueChange(value);
    }
  };

  const getStatusStyle = (status: string) => {
    switch (status) {
      case '결제완료':
        return {
          backgroundColor: '#5B5B5B',
          color: '#fff',
        };
      case '결제대기':
        return {
          backgroundColor: '#E5E5E5',
          color: '#666',
        };
      case '무료':
        return {
          backgroundColor: '#1890FF',
          color: '#fff',
        };
      default:
        return {
          backgroundColor: '#E5E5E5',
          color: '#666',
        };
    }
  };

  // 현재 상태에 따라 선택 가능한 옵션 결정
  const getAvailableOptions = (currentStatus: string) => {
    switch (currentStatus) {
      case '결제완료':
        // 결제완료 상태에서는 무료로만 변경 가능
        return [
          { value: '결제완료', label: '결제완료' },
          { value: '무료', label: '무료' },
        ];
      case '결제대기':
        // 결제대기 상태에서는 무료로만 변경 가능
        return [
          { value: '결제대기', label: '결제대기' },
          { value: '무료', label: '무료' },
        ];
      case '무료':
        // 무료 상태에서는 무료만 표시
        return [{ value: '무료', label: '무료' }];
      default:
        // 기본적으로 모든 옵션 제공
        return [
          { value: '결제대기', label: '결제대기' },
          { value: '결제완료', label: '결제완료' },
          { value: '무료', label: '무료' },
        ];
    }
  };

  const statusStyle = getStatusStyle(currentValue);
  const availableOptions = getAvailableOptions(currentValue);

  return (
    <Select value={currentValue} onValueChange={handleValueChange}>
      <SelectTrigger
        className='h-8 w-[100px] border-0 text-xs font-semibold'
        style={{
          backgroundColor: statusStyle.backgroundColor,
          color: statusStyle.color,
          borderRadius: '30px',
        }}
      >
        <SelectValue />
      </SelectTrigger>
      <SelectContent>
        {availableOptions.map((option) => (
          <SelectItem key={option.value} value={option.value}>
            {option.label}
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  );
};

// 종료일 선택 모달 컴포넌트
interface IEndDateModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: (endDate: string) => void;
  caseName: string;
  selectedCaseForEndDate: { projectId: string; caseName: string; action: string } | null;
}

const EndDateModal = ({ isOpen, onClose, onConfirm, caseName, selectedCaseForEndDate }: IEndDateModalProps) => {
  const [selectedEndDate, setSelectedEndDate] = useState('');

  // 날짜 입력값 검증 및 정규화
  const handleDateChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    let value = e.target.value;

    // 날짜 형식이 YYYY-MM-DD인지 확인
    if (value.includes('-')) {
      const parts = value.split('-');
      if (parts.length === 3) {
        const year = parts[0];
        const month = parts[1];
        const day = parts[2];

        // 년도가 4자리를 넘으면 4자리로 제한
        if (year.length > 4) {
          value = `${year.substring(0, 4)}-${month}-${day}`;
        }

        // 년도가 유효한 범위인지 확인 (1000-9999)
        const yearNum = parseInt(year.substring(0, 4), 10);
        if (yearNum < 1000 || yearNum > 9999) {
          // 유효하지 않은 년도는 무시
          return;
        }
      }
    }

    setSelectedEndDate(value);
  };

  const handleConfirm = () => {
    if (selectedEndDate) {
      // 최종 검증: 날짜 형식이 올바른지 확인
      const dateRegex = /^\d{4}-\d{2}-\d{2}$/;
      if (dateRegex.test(selectedEndDate)) {
        onConfirm(selectedEndDate);
        setSelectedEndDate('');
      } else {
        // 날짜 형식이 올바르지 않으면 경고
        onMessageToast({ message: '올바른 날짜 형식(YYYY-MM-DD)을 입력해주세요.' });
      }
    }
  };

  const handleClose = () => {
    setSelectedEndDate('');
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div className='fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50'>
      <div className='w-full max-w-md rounded-lg bg-white p-6'>
        {/* 헤더 */}
        <div className='mb-6 flex items-center justify-between'>
          <h2 className='text-xl font-bold text-gray-900'>
            {selectedCaseForEndDate?.action === '종료일변경' ? '무료 플랜 종료일 변경' : '무료 플랜 종료일 설정'}
          </h2>
          <button onClick={handleClose} className='flex h-8 w-8 items-center justify-center rounded-lg text-gray-400 hover:bg-gray-100'>
            <X className='h-5 w-5' />
          </button>
        </div>

        {/* 내용 */}
        <div className='mb-6'>
          <p className='mb-4 text-gray-600'>
            <strong>"{caseName}"</strong> 사건의 무료 플랜 종료일을 {selectedCaseForEndDate?.action === '종료일변경' ? '변경' : '설정'}
            합니다.
          </p>
          <div>
            <label className='mb-2 block text-sm font-medium text-gray-700'>종료일 선택</label>
            <div className='relative'>
              <input
                type='date'
                value={selectedEndDate}
                onChange={handleDateChange}
                min={new Date().toISOString().split('T')[0]}
                max='9999-12-31'
                className='w-full rounded-md border border-gray-300 px-3 py-2 focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500'
              />
              {/* <Calendar className='pointer-events-none absolute right-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400' /> */}
            </div>
          </div>
        </div>

        {/* 버튼 */}
        <div className='flex justify-end gap-3'>
          <button onClick={handleClose} className='rounded-lg border border-gray-300 px-4 py-2 text-gray-700 hover:bg-gray-50'>
            취소
          </button>
          <button
            onClick={handleConfirm}
            disabled={!selectedEndDate}
            className='rounded-lg bg-[#004AA4] px-4 py-2 text-white hover:bg-blue-700 disabled:bg-gray-400'
          >
            확인
          </button>
        </div>
      </div>
    </div>
  );
};

interface ICaseListPageProps {
  onCaseSelect?: (projectId: string, officeId: string) => void;
}

export const CaseListPage = ({ onCaseSelect }: ICaseListPageProps) => {
  // 필터 관련 상태
  const [filters, setFilters] = useState({
    keyword: '',
    status: 'ALL',
    payment_status: 'ALL',
    ocr_remark: 'ALL',
  });

  // 결제상태 필터 드롭다운 상태
  const [isPaymentFilterOpen, setIsPaymentFilterOpen] = useState(false);
  // OCR 관리상태 필터 드롭다운 상태
  const [isOcrRemarkFilterOpen, setIsOcrRemarkFilterOpen] = useState(false);

  // 검색어 입력 상태 (실시간 입력용)
  const [searchInput, setSearchInput] = useState('');

  // 페이지네이션 관련
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(50);

  // 정렬 관련 상태
  const [sortConfig, setSortConfig] = useState({
    column: 'createdAt', // 기본값: 사건등록일
    direction: 'desc' as 'asc' | 'desc', // 기본값: 최신순
  });

  // 선택된 아이템들
  const [selectedItems, setSelectedItems] = useState<string[]>([]);

  // 삭제 관련 상태
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [isDeletingCases, setIsDeletingCases] = useState(false);

  // 무료 플랜 종료일 선택 모달
  const [isEndDateModalOpen, setIsEndDateModalOpen] = useState(false);
  const [selectedCaseForEndDate, setSelectedCaseForEndDate] = useState<{ projectId: string; caseName: string; action: string } | null>(
    null,
  );

  // 전체 결제상태 변경 모달
  const [isGlobalFreePaymentModalOpen, setIsGlobalFreePaymentModalOpen] = useState(false);
  const [isGlobalPaidPaymentModalOpen, setIsGlobalPaidPaymentModalOpen] = useState(false);

  // OCR 관리상태 변경 모달
  const [isOcrRemarkConfirmModalOpen, setIsOcrRemarkConfirmModalOpen] = useState(false);
  const [pendingOcrRemarkChange, setPendingOcrRemarkChange] = useState<{
    projectId: string;
    caseName: string;
    nextValue: '보류' | '대기';
  } | null>(null);

  // 필터 카운트 상태
  const [filterCounts, setFilterCounts] = useState({
    unprocessed: 0,
    waiting: 0,
    processing: 0,
    failed: 0,
    completed: 0,
    evidence_added: 0,
    payment_pending: 0,
  });

  // "전체" 박스의 총 건수는 필터(보류/상태/결제)에 의해 변하면 안 되므로,
  // 필터가 ALL인 상태(=기본 목록)에서의 total_cnt를 캐시해두고 사용한다.
  const [baseTotalCount, setBaseTotalCount] = useState(0);

  // 검색 입력창 ref
  const searchInputRef = useRef<HTMLInputElement>(null);

  // 상태를 영어로 매핑하는 함수
  const mapStatusToEnglish = (status: string) => {
    switch (status) {
      case '미처리':
        return 'unprocessed';
      case '대기':
        return 'waiting';
      case '진행중':
        return 'processing';
      case '실패':
        return 'failed';
      case '증거문서추가':
        return 'evidence_added';
      case '결제대기':
        return 'payment_pending';
      default:
        // 알 수 없는 값(예: 보류)은 summary_status로 보내지 않음
        return '';
    }
  };

  // 결제상태를 영어로 매핑하는 함수
  const mapPaymentStatusToEnglish = (paymentStatus: string) => {
    switch (paymentStatus) {
      case '결제대기':
        return 'payment_pending';
      case '결제완료':
        return 'payment_complete';
      case '무료':
        return 'payment_trial';
      default:
        return paymentStatus;
    }
  };

  // API 인풋 파라미터 준비 - 메모이제이션
  const apiInput = useMemo(() => {
    let summaryStatus = '';
    // OCR 관리상태 필터가 켜져 있으면(summary_status 계열 필터는 무시하고) ocr_remark만 보낸다
    if (filters.ocr_remark === 'ALL') {
      if (filters.payment_status !== 'ALL') {
        summaryStatus = mapPaymentStatusToEnglish(filters.payment_status);
      } else if (filters.status !== 'ALL') {
        summaryStatus = mapStatusToEnglish(filters.status);
      }
    }

    const ocrRemark = filters.ocr_remark === 'ALL' ? '' : filters.ocr_remark;

    const filterPayload: { summary_status?: string; ocr_remark?: string } = {};
    if (summaryStatus) filterPayload.summary_status = summaryStatus;
    if (ocrRemark) filterPayload.ocr_remark = ocrRemark;

    return {
      page_no: currentPage,
      block_cnt: pageSize,
      keyword: filters.keyword,
      isActive: true,
      sort_column: sortConfig.column,
      sort_direction: sortConfig.direction,
      filters: filterPayload,
      isFinish: false,
    };
  }, [
    currentPage,
    pageSize,
    filters.keyword,
    filters.status,
    filters.payment_status,
    filters.ocr_remark,
    sortConfig.column,
    sortConfig.direction,
  ]);

  // 관리자 사건목록 조회 API 호출
  const { response: adminCaseListResponse, isLoading: isLoadingCaseList, refetch: refetchCaseList } = useFindAllAdminCaseList(apiInput);

  // case list (상단 보류 카운트 계산/체크박스 등에서 사용)
  const caseList = adminCaseListResponse?.data?.projects || [];

  // 기본(필터 ALL) 상태에서의 total_cnt 캐시
  useEffect(() => {
    const isBaseFilter = filters.status === 'ALL' && filters.payment_status === 'ALL' && filters.ocr_remark === 'ALL';

    if (!isBaseFilter) return;
    const nextTotal = adminCaseListResponse?.data?.paging?.total_cnt;
    if (typeof nextTotal === 'number') setBaseTotalCount(nextTotal);
  }, [adminCaseListResponse?.data?.paging?.total_cnt, filters.status, filters.payment_status, filters.ocr_remark]);

  // 결제 설정 조회 API 호출
  const { response: paymentSettingsResponse, refetch: refetchPaymentSettings } = useGetPaymentSettings();

  // 현재 결제 설정값 계산
  const currentPaymentSetting = useMemo(() => {
    if (!paymentSettingsResponse?.data) return '';
    return paymentSettingsResponse.data.free_payment_enabled ? '무료' : '유료';
  }, [paymentSettingsResponse]);

  // 전체 변경 셀렉트 박스 스타일 계산
  const globalPaymentSelectStyle = useMemo(() => {
    if (!paymentSettingsResponse?.data) {
      return {
        backgroundColor: '#E5E5E5',
        color: '#666',
      };
    }
    if (paymentSettingsResponse.data.free_payment_enabled) {
      return {
        backgroundColor: '#1890FF',
        color: '#fff',
      };
    }
    return {
      backgroundColor: '#E5E5E5',
      color: '#666',
    };
  }, [paymentSettingsResponse]);

  // 무료 종료일 포맷팅
  const formatFreePaymentEndDate = useCallback((dateString: string | null | undefined) => {
    if (!dateString || dateString.trim() === '' || dateString === 'null' || dateString === 'undefined') {
      return null;
    }
    try {
      // YYYYMMDD 형식인 경우
      if (/^\d{8}$/.test(dateString)) {
        const year = dateString.substring(0, 4);
        const month = dateString.substring(4, 6);
        const day = dateString.substring(6, 8);
        return `${year}.${month}.${day}`;
      }
      // ISO 형식인 경우
      const date = new Date(dateString);
      if (isNaN(date.getTime())) return null;
      const year = date.getFullYear();
      const month = String(date.getMonth() + 1).padStart(2, '0');
      const day = String(date.getDate()).padStart(2, '0');
      return `${year}.${month}.${day}`;
    } catch {
      return null;
    }
  }, []);

  // 전체 무료 종료일 변경 핸들러
  const handleGlobalFreeEndDateChange = useCallback(() => {
    setIsGlobalFreePaymentModalOpen(true);
  }, []);

  // 필터 카운트 가져오기
  const fetchFilterCounts = useCallback(async () => {
    try {
      const response = await fetchGetAllCaseFilterCount();
      if (response.success) {
        setFilterCounts(response.data);
      }
    } catch (error) {
      console.error('필터 카운트 가져오기 실패:', error);
    }
  }, []);

  // 전체 결제상태 변경 뮤테이션
  const { mutateAsync: changePaymentFunction, isPending: isChangingPaymentFunction } = useChangePaymentFunction({
    onSuccess: () => {
      onMessageToast({ message: '전체 결제상태가 변경되었습니다.' });
      refetchCaseList();
      fetchFilterCounts();
      refetchPaymentSettings();
    },
    onError: (error) => {
      onMessageToast({ message: '전체 결제상태 변경에 실패했습니다.' });
      console.error('전체 결제상태 변경 실패:', error);
    },
  });

  // OCR 관리상태 변경 뮤테이션
  const { mutateAsync: changeOcrRemark, isPending: isChangingOcrRemark } = useChangeOcrManagementStatus({
    onSuccess: (data) => {
      if (data?.success) {
        onMessageToast({ message: 'OCR 관리상태가 변경되었습니다.' });
      } else {
        onMessageToast({ message: data?.message || 'OCR 관리상태 변경에 실패했습니다.' });
      }
    },
    onError: () => {
      onMessageToast({ message: 'OCR 관리상태 변경에 실패했습니다.' });
    },
  });

  // 컴포넌트 마운트 시 필터 카운트 가져오기
  // React 18 StrictMode(dev)에서 mount effect가 2번 실행될 수 있어 1회만 호출되도록 가드
  const didInitFilterCountsRef = useRef(false);
  useEffect(() => {
    if (didInitFilterCountsRef.current) return;
    didInitFilterCountsRef.current = true;
    fetchFilterCounts();
  }, [fetchFilterCounts]);

  // 결제상태 필터 드롭다운 외부 클릭 시 닫기
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      const target = event.target as Element;

      if (isPaymentFilterOpen && !target.closest('.payment-filter-dropdown')) {
        setIsPaymentFilterOpen(false);
      }
      if (isOcrRemarkFilterOpen && !target.closest('.ocr-remark-filter-dropdown')) {
        setIsOcrRemarkFilterOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [isPaymentFilterOpen, isOcrRemarkFilterOpen]);

  // 테이블용 날짜 포맷팅 (YYYY.MM.DD)
  const formatTableDate = (dateString: string) => {
    if (!dateString) return '-';

    const date = new Date(dateString);

    // 유효하지 않은 날짜인 경우 처리
    if (isNaN(date.getTime())) {
      console.warn('Invalid date string:', dateString);
      return '-';
    }

    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    return `${year}.${month}.${day}`;
  };

  // 필터 변경 핸들러 - "필터는 각각 하나씩만" (상호 배타)
  const handleFilterChange = useCallback((field: 'status' | 'ocr_remark', value: string) => {
    setFilters((prev) => {
      const next = { ...prev, [field]: value };

      if (field === 'status') {
        // summary_status 계열 선택 시: 결제/ocr_remark 필터는 해제
        next.payment_status = 'ALL';
        next.ocr_remark = 'ALL';
      }

      if (field === 'ocr_remark') {
        // OCR 관리상태 선택 시: summary_status/결제 필터는 해제
        next.status = 'ALL';
        next.payment_status = 'ALL';
      }

      return next;
    });
    setCurrentPage(1); // 필터 변경 시 첫 페이지로
  }, []);

  // 페이지 크기 변경 핸들러 - 메모이제이션
  const handlePageSizeChange = useCallback((newPageSize: number) => {
    setPageSize(newPageSize);
    setCurrentPage(1); // 페이지 크기 변경 시 첫 페이지로
  }, []);

  // 페이지 변경 핸들러 - 메모이제이션
  const handlePageChange = useCallback((page: number) => {
    setCurrentPage(page);
  }, []);

  // 정렬 핸들러
  const handleSort = useCallback((column: string) => {
    setSortConfig((prev) => ({
      column,
      direction: prev.column === column && prev.direction === 'desc' ? 'asc' : 'desc',
    }));
    setCurrentPage(1); // 정렬 변경 시 첫 페이지로 이동
  }, []);

  // 검색어 입력 핸들러 - 한글 입력 문제 해결
  const handleSearchInputChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchInput(e.target.value);
  }, []);

  // 엔터키 핸들러
  const handleSearchKeyDown = useCallback(
    (e: React.KeyboardEvent<HTMLInputElement>) => {
      if (e.key === 'Enter') {
        // 2글자 이상이거나 빈 문자열일 때만 즉시 검색 실행
        if (searchInput.length >= 2 || searchInput.length === 0) {
          setFilters((prev) => ({
            ...prev,
            keyword: searchInput,
          }));
          setCurrentPage(1);
        }
      }
    },
    [searchInput],
  );

  // 검색 클리어 핸들러
  const handleClearSearch = useCallback(() => {
    setSearchInput('');
    setFilters((prev) => ({
      ...prev,
      keyword: '',
    }));
    setCurrentPage(1);
  }, []);

  // 검색 버튼 클릭 핸들러
  const handleSearchClick = useCallback(() => {
    // 2글자 이상이거나 빈 문자열일 때만 검색 실행
    if (searchInput.length >= 2 || searchInput.length === 0) {
      setFilters((prev) => ({
        ...prev,
        keyword: searchInput,
      }));
      setCurrentPage(1);
    }
  }, [searchInput]);

  // 상태별 카운트 계산
  const getStatusCount = (status: string) => {
    switch (status) {
      case '전체':
        return baseTotalCount || adminCaseListResponse?.data?.paging?.total_cnt || 0;
      case '보류':
        return caseList.filter((item) => (item.ocr_remark ?? '').trim() === '보류').length;
      case '미처리':
        return filterCounts.unprocessed;
      case '대기':
        return filterCounts.waiting;
      case '진행중':
        return filterCounts.processing;
      case '실패':
        return filterCounts.failed;
      case '증거문서추가':
        return filterCounts.evidence_added;
      case '결제대기':
        return filterCounts.payment_pending;
      default:
        return 0;
    }
  };

  // 삭제 버튼 클릭 핸들러
  const handleDeleteClick = () => {
    if (selectedItems.length === 0) {
      onMessageToast({ message: '삭제할 사건을 선택해주세요.' });
      return;
    }
    setIsDeleteModalOpen(true);
  };

  // 삭제 확인 핸들러
  const handleConfirmDelete = async () => {
    if (selectedItems.length === 0) return;

    setIsDeletingCases(true);

    try {
      // 선택된 각 사건을 순차적으로 삭제
      const deletePromises = selectedItems.map((projectId) => fetchDeleteAdminCaseList(projectId));
      const results = await Promise.allSettled(deletePromises);

      // 성공/실패 결과 확인
      const successCount = results.filter((result) => result.status === 'fulfilled').length;
      const failureCount = results.filter((result) => result.status === 'rejected').length;

      if (successCount > 0) {
        onMessageToast({
          message: `${successCount}개 사건이 성공적으로 삭제되었습니다.${failureCount > 0 ? ` (${failureCount}개 실패)` : ''}`,
        });

        // 선택 항목 초기화
        setSelectedItems([]);

        // 데이터 새로고침 (refetch)
        refetchCaseList();
        // 필터 카운트도 새로고침
        fetchFilterCounts();
      } else {
        onMessageToast({ message: '사건 삭제에 실패했습니다.' });
      }
    } catch (error) {
      console.error('사건 삭제 중 오류 발생:', error);
      onMessageToast({ message: '사건 삭제 중 오류가 발생했습니다.' });
    } finally {
      setIsDeletingCases(false);
      setIsDeleteModalOpen(false);
    }
  };

  // 삭제 모달 닫기 핸들러
  const handleCloseDeleteModal = () => {
    setIsDeleteModalOpen(false);
  };
  const formatPhoneNumber = (phone: string) => {
    if (!phone) return '-';
    return phone.replace(/(\d{3})(\d{4})(\d{4})/, '$1-$2-$3');
  };

  // 결제상태 변경 핸들러
  const handlePaymentStatusChange = useCallback(
    async (projectId: string, caseName: string, newStatus: string) => {
      try {
        // 한국어 상태를 영어로 변환
        const englishStatus = mapPaymentStatusToEnglish(newStatus);

        // 무료인 경우 종료일 선택 모달 열기
        if (newStatus === '무료') {
          setSelectedCaseForEndDate({ projectId, caseName, action: '무료' });
          setIsEndDateModalOpen(true);
        } else {
          // 무료가 아닌 경우 바로 API 호출
          const response = await fetchChangeProjectPaymentStatus({
            project_id: projectId,
            payment_status: englishStatus,
            expire_date: '', // 무료가 아닌 경우 빈 문자열
          });

          if (response.success) {
            onMessageToast({ message: `"${caseName}" 사건의 결제상태가 "${newStatus}"로 변경되었습니다.` });
            // 데이터 새로고침
            refetchCaseList();
            fetchFilterCounts();
          } else {
            onMessageToast({ message: '결제상태 변경에 실패했습니다.' });
          }
        }
      } catch (error) {
        console.error('결제상태 변경 중 오류 발생:', error);
        onMessageToast({ message: '결제상태 변경 중 오류가 발생했습니다.' });
      }
    },
    [refetchCaseList, fetchFilterCounts],
  );

  // 종료일 변경 버튼 클릭 핸들러
  const handleEndDateChangeClick = useCallback((projectId: string, caseName: string) => {
    setSelectedCaseForEndDate({ projectId, caseName, action: '종료일변경' });
    setIsEndDateModalOpen(true);
  }, []);

  // 결제상태 필터 변경 핸들러
  const handlePaymentFilterChange = useCallback((paymentStatus: string) => {
    setFilters((prev) => ({
      ...prev,
      // 결제 필터 선택 시: summary_status/ocr_remark 필터는 해제
      status: 'ALL',
      ocr_remark: 'ALL',
      payment_status: paymentStatus,
    }));
    setCurrentPage(1);
    setIsPaymentFilterOpen(false);
  }, []);

  // 종료일 선택 완료
  const handleEndDateConfirm = useCallback(
    async (endDate: string) => {
      if (!selectedCaseForEndDate) {
        return;
      }

      // 종료일이 유효한지 확인
      if (!endDate || endDate.trim() === '') {
        onMessageToast({ message: '종료일을 선택해주세요.' });
        return;
      }

      try {
        // 날짜를 YYYYMMDD 형식으로 변환
        const formattedDate = endDate.replace(/-/g, '');

        // 날짜 형식 검증
        if (formattedDate.length !== 8 || !/^\d{8}$/.test(formattedDate)) {
          onMessageToast({ message: '올바른 날짜 형식이 아닙니다.' });
          return;
        }

        const response = await fetchChangeProjectPaymentStatus({
          project_id: selectedCaseForEndDate.projectId,
          payment_status: 'trial', // 무료 상태
          expire_date: formattedDate,
        });

        // API 응답 확인
        if (response && response.success) {
          const actionText = selectedCaseForEndDate.action === '종료일변경' ? '종료일이 변경되었습니다' : '무료로 변경되었습니다';
          onMessageToast({ message: `"${selectedCaseForEndDate.caseName}" 사건의 ${actionText}. (종료일: ${endDate})` });

          // 모달 닫기
          setIsEndDateModalOpen(false);
          setSelectedCaseForEndDate(null);

          // 리스트 리패치하여 변경사항 반영
          await refetchCaseList();
          await fetchFilterCounts();
        } else {
          // API 실패 시 모달은 열어두고 에러 메시지 표시
          const actionText = selectedCaseForEndDate.action === '종료일변경' ? '종료일 변경' : '무료 플랜 변경';
          const errorMessage = response?.message || `${actionText}에 실패했습니다.`;
          onMessageToast({ message: errorMessage });

          // 실패 시 리스트를 리패치하여 원래 상태로 되돌림
          await refetchCaseList();
          await fetchFilterCounts();
        }
      } catch (error) {
        console.error('무료 플랜 변경 중 오류 발생:', error);
        onMessageToast({ message: '무료 플랜 변경 중 오류가 발생했습니다.' });

        // 에러 발생 시에도 리스트를 리패치하여 원래 상태로 되돌림
        try {
          await refetchCaseList();
          await fetchFilterCounts();
        } catch (refetchError) {
          console.error('리스트 리패치 실패:', refetchError);
        }
      }
    },
    [selectedCaseForEndDate, refetchCaseList, fetchFilterCounts],
  );

  // 종료일 선택 취소
  const handleEndDateCancel = useCallback(() => {
    setIsEndDateModalOpen(false);
    setSelectedCaseForEndDate(null);
    // 모달 취소 시 리스트를 리패치하여 원래 상태로 되돌림
    refetchCaseList();
    fetchFilterCounts();
  }, [refetchCaseList, fetchFilterCounts]);

  // 전체 무료 결제상태 변경 확인 핸들러
  const handleGlobalFreePaymentConfirm = useCallback(
    async (endDate: string | null) => {
      try {
        const formattedDate = endDate ? endDate.replace(/-/g, '') : '';
        await changePaymentFunction({
          free_payment_enabled: true,
          free_payment_end_date: formattedDate,
        });
        setIsGlobalFreePaymentModalOpen(false);
      } catch (error) {
        console.error('전체 무료 상태 변경 실패:', error);
      }
    },
    [changePaymentFunction],
  );

  // 전체 유료 결제상태 변경 확인 핸들러
  const handleGlobalPaidPaymentConfirm = useCallback(async () => {
    try {
      await changePaymentFunction({
        free_payment_enabled: false,
        free_payment_end_date: '',
      });
      setIsGlobalPaidPaymentModalOpen(false);
    } catch (error) {
      console.error('전체 유료 상태 변경 실패:', error);
    }
  }, [changePaymentFunction]);

  const getOcrRemarkNormalized = (ocr_remark?: string | null) => (ocr_remark ?? '').trim();
  // OCR진행여부 UI 표시용 라벨(값은 그대로 '대기'를 사용)
  const getOcrRemarkUiLabel = (value: string) => {
    if (value === '대기') return '진행';
    return value;
  };
  const getOcrRemarkDisplayValue = (ocr_remark?: string | null): '보류' | '대기' | undefined => {
    const raw = getOcrRemarkNormalized(ocr_remark);
    if (raw === '보류' || raw === '대기') return raw;
    // 빈값(=상태없음)은 선택값을 가지지 않음
    return undefined;
  };
  const getOcrRemarkDisplayLabel = (ocr_remark?: string | null) => {
    const raw = getOcrRemarkNormalized(ocr_remark);
    return raw ? getOcrRemarkUiLabel(raw) : '상태없음';
  };

  const getOcrRemarkTriggerStyle = (label: string) => {
    if (label === '진행') {
      return { backgroundColor: '#E5E5E5', color: '#212121' };
    }
    if (label === '보류') {
      return { backgroundColor: '#FF0052', color: '#FFFFFF' };
    }
    // 상태없음(기본)
    return { backgroundColor: '#F3F4F6', color: '#111827' };
  };

  const handleOcrRemarkChangeRequest = useCallback((projectId: string, caseName: string, nextValue: '보류' | '대기') => {
    setPendingOcrRemarkChange({ projectId, caseName, nextValue });
    setIsOcrRemarkConfirmModalOpen(true);
  }, []);

  const handleConfirmOcrRemarkChange = useCallback(async () => {
    if (!pendingOcrRemarkChange) return;
    const nextOcrRemark = pendingOcrRemarkChange.nextValue;

    try {
      const res = await changeOcrRemark({
        project_id: pendingOcrRemarkChange.projectId,
        ocr_remark: nextOcrRemark,
      });

      if (res?.success) {
        setIsOcrRemarkConfirmModalOpen(false);
        setPendingOcrRemarkChange(null);
        // 최신값 반영
        refetchCaseList();
      }
    } catch (e) {
      console.error('OCR 관리상태 변경 실패:', e);
    }
  }, [pendingOcrRemarkChange, changeOcrRemark, refetchCaseList]);

  const handleCloseOcrRemarkConfirmModal = useCallback(() => {
    setIsOcrRemarkConfirmModalOpen(false);
    setPendingOcrRemarkChange(null);
  }, []);

  const handleSelectAll = (e: React.ChangeEvent<HTMLInputElement>) => {
    const isChecked = e.target.checked;
    setSelectedItems(isChecked ? caseList.map((item) => item.project_id) : []);
  };

  const handleItemSelect = (projectId: string, isChecked: boolean) => {
    if (isChecked) {
      setSelectedItems((prev) => [...prev, projectId]);
    } else {
      setSelectedItems((prev) => prev.filter((id) => id !== projectId));
    }
  };

  return (
    <div className='h-[calc(100vh-100px)] w-full p-5'>
      <div className=''>
        {/* 헤더 영역 */}
        <HeaderWrapper>
          <HeaderTitle>사건목록</HeaderTitle>
        </HeaderWrapper>

        {/* 필터 박스와 검색 영역 */}
        <div className='mt-[25px] w-full items-center justify-between lg:flex'>
          {/* 왼쪽 필터 박스들 */}
          <div className='flex grid w-3/4 w-full grid-cols-8 items-center gap-4'>
            {/* 전체 필터 박스 */}
            <div
              className={`flex h-[80px] cursor-pointer flex-col items-start justify-center gap-2 rounded-lg p-[5px] transition-colors 2xl:p-[10px] ${
                filters.status === 'ALL' ? 'border border-blue-300 bg-blue-100' : 'bg-[#F7F8F8] hover:bg-gray-200'
              }`}
              onClick={() => handleFilterChange('status', filters.status === 'ALL' ? 'ALL' : 'ALL')}
            >
              <div className='text-[12px] text-[#666]'>전체</div>
              <div className='font-bold text-[#000] 2xl:text-[24px]'>{getStatusCount('전체')}건</div>
            </div>

            {/* 미처리 필터 박스 */}
            <div
              className={`flex h-[80px] cursor-pointer flex-col items-start justify-center gap-2 rounded-lg p-[5px] transition-colors 2xl:p-[10px] ${
                filters.status === '미처리' ? 'border border-blue-300 bg-blue-100' : 'bg-[#F7F8F8] hover:bg-gray-200'
              }`}
              onClick={() => handleFilterChange('status', filters.status === '미처리' ? 'ALL' : '미처리')}
            >
              <div className='text-[12px] text-[#666]'>미처리</div>
              <div className='font-bold text-[#000] 2xl:text-[24px]'>{getStatusCount('미처리')}건</div>
            </div>

            {/* 대기 필터 박스 */}
            <div
              className={`flex h-[80px] cursor-pointer flex-col items-start justify-center gap-2 rounded-lg p-[5px] transition-colors 2xl:p-[10px] ${
                filters.status === '대기' ? 'border border-blue-300 bg-blue-100' : 'bg-[#F7F8F8] hover:bg-gray-200'
              }`}
              onClick={() => handleFilterChange('status', filters.status === '대기' ? 'ALL' : '대기')}
            >
              <div className='text-[12px] text-[#666]'>대기</div>
              <div className='font-bold text-[#000] 2xl:text-[24px]'>{getStatusCount('대기')}건</div>
            </div>

            {/* 진행중 필터 박스 */}
            <div
              className={`flex h-[80px] cursor-pointer flex-col items-start justify-center gap-2 rounded-lg p-[5px] transition-colors 2xl:p-[10px] ${
                filters.status === '진행중' ? 'border border-blue-300 bg-blue-100' : 'bg-[#F7F8F8] hover:bg-gray-200'
              }`}
              onClick={() => handleFilterChange('status', filters.status === '진행중' ? 'ALL' : '진행중')}
            >
              <div className='text-[12px] text-[#666]'>진행중</div>
              <div className='font-bold text-[#000] 2xl:text-[24px]'>{getStatusCount('진행중')}건</div>
            </div>

            {/* 실패 필터 박스 */}
            <div
              className={`flex h-[80px] cursor-pointer flex-col items-start justify-center gap-2 rounded-lg p-[5px] transition-colors 2xl:p-[10px] ${
                filters.status === '실패' ? 'border border-blue-300 bg-blue-100' : 'bg-[#F7F8F8] hover:bg-gray-200'
              }`}
              onClick={() => handleFilterChange('status', filters.status === '실패' ? 'ALL' : '실패')}
            >
              <div className='text-[12px] text-[#666]'>실패</div>
              <div className='font-bold text-[#000] 2xl:text-[24px]'>{getStatusCount('실패')}건</div>
            </div>

            {/* 증거문서추가 필터 박스 */}
            <div
              className={`flex h-[80px] cursor-pointer flex-col items-start justify-center gap-2 rounded-lg p-[5px] transition-colors 2xl:p-[10px] ${
                filters.status === '증거문서추가' ? 'border border-blue-300 bg-blue-100' : 'bg-[#F7F8F8] hover:bg-gray-200'
              }`}
              onClick={() => handleFilterChange('status', filters.status === '증거문서추가' ? 'ALL' : '증거문서추가')}
            >
              <div className='text-[12px] text-[#666]'>증거문서추가</div>
              <div className='font-bold text-[#000] 2xl:text-[24px]'>{getStatusCount('증거문서추가')}건</div>
            </div>

            {/* 결제대기 필터 박스 */}
            <div
              className={`flex h-[80px] cursor-pointer flex-col items-start justify-center gap-2 rounded-lg p-[5px] transition-colors 2xl:p-[10px] ${
                filters.status === '결제대기' ? 'border border-blue-300 bg-blue-100' : 'bg-[#F7F8F8] hover:bg-gray-200'
              }`}
              onClick={() => handleFilterChange('status', filters.status === '결제대기' ? 'ALL' : '결제대기')}
            >
              <div className='text-[12px] text-[#666]'>결제대기</div>
              <div className='font-bold text-[#000] 2xl:text-[24px]'>{getStatusCount('결제대기')}건</div>
            </div>
            <div
              className={`flex h-[80px] cursor-pointer flex-col items-start justify-center gap-2 rounded-lg p-[5px] transition-colors 2xl:p-[10px] ${
                filters.ocr_remark === '보류' ? 'border border-blue-300 bg-blue-100' : 'bg-[#F7F8F8] hover:bg-gray-200'
              }`}
              onClick={() => {
                handleFilterChange('ocr_remark', filters.ocr_remark === '보류' ? 'ALL' : '보류');
              }}
            >
              <div className='text-[12px] text-[#666]'>보류</div>
              <div className='font-bold text-[#000] 2xl:text-[24px]'>{getStatusCount('보류')}건</div>
            </div>
          </div>

          {/* 오른쪽 검색 영역 */}
          <div className='mt-4 flex w-1/3 items-center justify-end gap-4 2xl:ml-10 2xl:mt-0'>
            <div className='flex items-center gap-2'>
              <span className='text-[12px] text-[#000]'>총 {adminCaseListResponse?.data?.paging?.total_cnt || 0} 건</span>
              {filters.status && filters.status !== 'ALL' && (
                <span className='text-[12px] text-blue-600'>({filters.status} 필터 적용 중)</span>
              )}
            </div>

            {/* 통합 검색 입력창 */}
            <div className='flex items-center gap-2'>
              <div className='relative'>
                <input
                  ref={searchInputRef}
                  type='text'
                  className='h-[40px] w-full rounded-lg border border-gray-300 px-4 py-2 pr-20 text-[14px] placeholder:text-[#999] focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500'
                  placeholder='검색어를 입력해주세요.'
                  value={searchInput}
                  onChange={handleSearchInputChange}
                  onKeyDown={handleSearchKeyDown}
                  autoComplete='off'
                />

                {/* X 버튼 (검색어가 있을 때만 표시) */}
                {searchInput && (
                  <button
                    className='absolute right-10 top-1/2 -translate-y-1/2 transform text-gray-400 hover:text-gray-600'
                    onClick={handleClearSearch}
                  >
                    <svg className='h-4 w-4' fill='none' stroke='currentColor' viewBox='0 0 24 24'>
                      <path strokeLinecap='round' strokeLinejoin='round' strokeWidth={2} d='M6 18L18 6M6 6l12 12' />
                    </svg>
                  </button>
                )}

                {/* 검색 버튼 */}
                <button
                  className='absolute right-3 top-1/2 -translate-y-1/2 transform text-gray-400 hover:text-gray-600'
                  onClick={handleSearchClick}
                >
                  <svg className='h-5 w-5' fill='none' stroke='currentColor' viewBox='0 0 24 24'>
                    <path strokeLinecap='round' strokeLinejoin='round' strokeWidth={2} d='M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z' />
                  </svg>
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* 테이블 영역 */}
        <TableBox>
          <Table>
            <thead className='sticky top-0 z-10'>
              <TableRow>
                <TableCell className='sticky top-0 min-w-[50px] bg-[#F7F8F8] text-center font-bold'>
                  <input
                    type='checkbox'
                    className='h-4 w-4'
                    onChange={handleSelectAll}
                    checked={selectedItems.length === caseList.length && selectedItems.length > 0}
                  />
                </TableCell>
                <TableCell className='sticky top-0 min-w-[80px] bg-[#F7F8F8] text-center font-bold'>OCR상태</TableCell>
                <TableCell className='sticky top-0 min-w-[120px] bg-[#F7F8F8] text-center font-bold'>
                  <div className='flex items-center justify-center gap-1'>
                    OCR진행여부
                    <div className='ocr-remark-filter-dropdown relative'>
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          setIsOcrRemarkFilterOpen(!isOcrRemarkFilterOpen);
                        }}
                        className='flex h-6 w-6 items-center justify-center rounded hover:bg-gray-200'
                        title='OCR 관리상태 필터'
                      >
                        <ChevronDown className='h-4 w-4 text-gray-600' />
                      </button>

                      {isOcrRemarkFilterOpen && (
                        <div className='absolute right-0 top-8 z-50 min-w-[100px] rounded-lg border bg-white shadow-lg'>
                          <div className='py-1'>
                            <button
                              onClick={() => {
                                handleFilterChange('ocr_remark', 'ALL');
                                setIsOcrRemarkFilterOpen(false);
                              }}
                              className={`w-full px-3 py-2 text-left text-sm hover:bg-gray-100 ${
                                filters.ocr_remark === 'ALL' ? 'bg-blue-50 text-blue-600' : 'text-gray-700'
                              }`}
                            >
                              전체
                            </button>
                            <button
                              onClick={() => {
                                handleFilterChange('ocr_remark', '보류');
                                setIsOcrRemarkFilterOpen(false);
                              }}
                              className={`w-full px-3 py-2 text-left text-sm hover:bg-gray-100 ${
                                filters.ocr_remark === '보류' ? 'bg-blue-50 text-blue-600' : 'text-gray-700'
                              }`}
                            >
                              보류
                            </button>
                            <button
                              onClick={() => {
                                handleFilterChange('ocr_remark', '대기');
                                setIsOcrRemarkFilterOpen(false);
                              }}
                              className={`w-full px-3 py-2 text-left text-sm hover:bg-gray-100 ${
                                filters.ocr_remark === '대기' ? 'bg-blue-50 text-blue-600' : 'text-gray-700'
                              }`}
                            >
                              진행
                            </button>
                          </div>
                        </div>
                      )}
                    </div>
                  </div>
                </TableCell>
                <TableCell className='sticky top-0 min-w-[100px] bg-[#F7F8F8] text-center font-bold'>
                  <div className='flex items-center justify-center gap-1'>
                    결제상태
                    <div className='payment-filter-dropdown relative'>
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          setIsPaymentFilterOpen(!isPaymentFilterOpen);
                        }}
                        className='flex h-6 w-6 items-center justify-center rounded hover:bg-gray-200'
                        title='결제상태 필터'
                      >
                        <ChevronDown className='h-4 w-4 text-gray-600' />
                      </button>

                      {/* 결제상태 필터 드롭다운 */}
                      {isPaymentFilterOpen && (
                        <div className='absolute right-0 top-8 z-50 min-w-[120px] rounded-lg border bg-white shadow-lg'>
                          <div className='py-1'>
                            <button
                              onClick={() => handlePaymentFilterChange('ALL')}
                              className={`w-full px-3 py-2 text-left text-sm hover:bg-gray-100 ${
                                filters.payment_status === 'ALL' ? 'bg-blue-50 text-blue-600' : 'text-gray-700'
                              }`}
                            >
                              전체
                            </button>
                            <button
                              onClick={() => handlePaymentFilterChange('결제대기')}
                              className={`w-full px-3 py-2 text-left text-sm hover:bg-gray-100 ${
                                filters.payment_status === '결제대기' ? 'bg-blue-50 text-blue-600' : 'text-gray-700'
                              }`}
                            >
                              결제대기
                            </button>
                            <button
                              onClick={() => handlePaymentFilterChange('결제완료')}
                              className={`w-full px-3 py-2 text-left text-sm hover:bg-gray-100 ${
                                filters.payment_status === 'complete' ? 'bg-blue-50 text-blue-600' : 'text-gray-700'
                              }`}
                            >
                              결제완료
                            </button>
                            <button
                              onClick={() => handlePaymentFilterChange('무료')}
                              className={`w-full px-3 py-2 text-left text-sm hover:bg-gray-100 ${
                                filters.payment_status === '무료' ? 'bg-blue-50 text-blue-600' : 'text-gray-700'
                              }`}
                            >
                              무료
                            </button>
                          </div>
                        </div>
                      )}
                    </div>
                  </div>
                </TableCell>
                <TableCell className='sticky top-0 min-w-[120px] bg-[#F7F8F8] text-center font-bold'>
                  다음결제일
                  <br />
                  (무료종료일)
                </TableCell>
                <TableCell className='sticky top-0 min-w-[120px] bg-[#F7F8F8] text-center font-bold'>
                  <button
                    onClick={() => handleSort('createdAt')}
                    className='flex w-full items-center justify-center gap-1 hover:text-blue-600'
                  >
                    사건등록일
                    {/* <span className='text-xs'>
                      {sortConfig.column === 'createdAt' ? (sortConfig.direction === 'desc' ? '▼' : '▲') : '⇅'}
                    </span> */}
                  </button>
                </TableCell>
                <TableCell className='sticky top-0 min-w-[200px] bg-[#F7F8F8] text-center font-bold'>사건명</TableCell>
                <TableCell className='sticky top-0 min-w-[120px] bg-[#F7F8F8] text-center font-bold'>의뢰인</TableCell>
                <TableCell className='sticky top-0 min-w-[120px] bg-[#F7F8F8] text-center font-bold'>로펌명</TableCell>
                <TableCell className='sticky top-0 min-w-[120px] bg-[#F7F8F8] text-center font-bold'>
                  사건관리자
                  <br />
                  권한이름
                </TableCell>
                <TableCell className='sticky top-0 min-w-[180px] bg-[#F7F8F8] text-center font-bold'>
                  사건관리권한
                  <br />
                  이메일
                </TableCell>
                <TableCell className='sticky top-0 min-w-[140px] bg-[#F7F8F8] text-center font-bold'>
                  사건관리자
                  <br />
                  권한연락처
                </TableCell>

                <TableCell className='sticky top-0 min-w-[120px] bg-[#F7F8F8] text-center font-bold'>결제자</TableCell>
                <TableCell className='sticky top-0 min-w-[120px] bg-[#F7F8F8] text-center font-bold'>증거문서추가</TableCell>
                <TableCell className='sticky top-0 min-w-[140px] bg-[#F7F8F8] text-center font-bold'>
                  페이지분리 및<br /> OCR작업페이지
                </TableCell>
                <TableCell className='sticky top-0 min-w-[100px] bg-[#F7F8F8] text-center font-bold'>사건상태</TableCell>
              </TableRow>
            </thead>
            <tbody>
              {isLoadingCaseList ? (
                <TableRow>
                  <TableCell colSpan={14} className='py-20 text-center'>
                    <div className='flex flex-col items-center justify-center gap-4'>
                      <div className='relative h-2 w-64 overflow-hidden rounded-full bg-gray-200'>
                        <div className='absolute left-0 top-0 h-full w-1/3 animate-pulse rounded-full bg-gradient-to-r from-blue-400 to-blue-600'></div>
                      </div>
                      <p className='text-sm text-gray-500'>데이터를 불러오는 중...</p>
                    </div>
                  </TableCell>
                </TableRow>
              ) : !caseList.length ? (
                <TableRow>
                  <TableCell colSpan={14} className='py-20 text-center'>
                    <div className='flex flex-col items-center justify-center gap-4'>
                      <div className='text-6xl text-gray-300'>📋</div>
                      <div>
                        <p className='text-lg font-medium text-gray-600'>
                          {filters.keyword || filters.status !== 'ALL' ? '검색 조건에 맞는 사건이 없습니다' : '등록된 사건이 없습니다'}
                        </p>
                        <p className='mt-1 text-sm text-gray-400'>
                          {filters.keyword || filters.status !== 'ALL' ? '검색 조건을 변경해보세요' : '사건을 등록해주세요'}
                        </p>
                      </div>
                    </div>
                  </TableCell>
                </TableRow>
              ) : (
                caseList.map((caseItem, index) => (
                  <TableRow
                    key={`${caseItem.project_id}-${caseItem.office_id}-${index}`}
                    className='cursor-pointer transition-colors hover:bg-gray-50'
                    onClick={() => {
                      if (onCaseSelect) {
                        onCaseSelect(caseItem.project_id, caseItem.office_id);
                      }
                    }}
                  >
                    <TableCell className='text-center' onClick={(e) => e.stopPropagation()}>
                      <input
                        type='checkbox'
                        className='h-4 w-4'
                        checked={selectedItems.includes(caseItem.project_id)}
                        onChange={(e) => handleItemSelect(caseItem.project_id, e.target.checked)}
                      />
                    </TableCell>
                    <TableCell className='text-center'>
                      <span
                        className='inline-flex rounded-full px-2 py-1 text-xs font-semibold'
                        style={{
                          backgroundColor:
                            caseItem.ocr_status === '진행중'
                              ? '#1890FF'
                              : caseItem.ocr_status === '완료'
                                ? '#5B5B5B'
                                : caseItem.ocr_status === '대기' ||
                                    caseItem.ocr_status === '미처리' ||
                                    caseItem.ocr_status === '증거문서추가' ||
                                    caseItem.ocr_status === '결제대기'
                                  ? '#E5E5E5'
                                  : caseItem.status === '실패'
                                    ? '#FF0052'
                                    : '#E5E5E5',
                          color:
                            caseItem.ocr_status === '대기' ||
                            caseItem.ocr_status === '미처리' ||
                            caseItem.ocr_status === '증거문서추가' ||
                            caseItem.ocr_status === '결제대기' ||
                            caseItem.ocr_status === '생성중'
                              ? '#212121'
                              : '#fff',
                        }}
                      >
                        {caseItem.ocr_status === '생성중' ? '대기' : caseItem.ocr_status}
                      </span>
                    </TableCell>
                    <TableCell className='text-center' onClick={(e) => e.stopPropagation()}>
                      <Select
                        value={getOcrRemarkDisplayValue(caseItem.ocr_remark)}
                        onValueChange={(value) =>
                          handleOcrRemarkChangeRequest(caseItem.project_id, caseItem.project_nm, value as '보류' | '대기')
                        }
                        disabled={isChangingOcrRemark}
                      >
                        <SelectTrigger
                          className='mx-auto h-8 w-[70px] rounded-full border-0 text-[12px] font-semibold'
                          style={getOcrRemarkTriggerStyle(getOcrRemarkDisplayLabel(caseItem.ocr_remark))}
                        >
                          <SelectValue placeholder='' />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value='보류'>보류</SelectItem>
                          <SelectItem value='대기'>진행</SelectItem>
                        </SelectContent>
                      </Select>
                    </TableCell>
                    <TableCell className='text-center' onClick={(e) => e.stopPropagation()}>
                      <PaymentStatusSelect
                        paymentStatus={caseItem.payment_status}
                        expireDate={caseItem.expire_date}
                        onValueChange={(value) => handlePaymentStatusChange(caseItem.project_id, caseItem.project_nm, value)}
                      />
                    </TableCell>
                    <TableCell className='text-center' onClick={(e) => e.stopPropagation()}>
                      {(() => {
                        // expire_date가 유효한지 확인하는 헬퍼 함수
                        const isValidExpireDate = (expireDate: any): boolean => {
                          if (!expireDate) return false;
                          // 문자열인 경우 trim 체크
                          if (typeof expireDate === 'string') {
                            const trimmed = expireDate.trim();
                            if (trimmed === '' || trimmed === 'null' || trimmed === 'undefined') return false;
                          }
                          // Date 객체로 변환하여 유효성 확인
                          try {
                            const date = new Date(expireDate);
                            return !isNaN(date.getTime());
                          } catch {
                            return false;
                          }
                        };

                        const paymentStatus = caseItem.payment_status;

                        // 일시중지 상태이면서 무료 상태가 아닌 경우: "-"만 표시
                        if (
                          caseItem.status === '일시중지' &&
                          paymentStatus !== 'trial' &&
                          paymentStatus !== 'payment_trial' &&
                          paymentStatus !== 'free'
                        ) {
                          return <span className='text-gray-400'>-</span>;
                        }

                        // 결제완료 상태인 경우: 날짜만 표시 (변경 버튼 없음)
                        if (paymentStatus === 'complete' || paymentStatus === 'completed' || paymentStatus === 'payment_complete') {
                          return <span>{formatTableDate(caseItem.expire_date)}</span>;
                        }

                        // 결제대기 상태인 경우: 변경 버튼 없이 "-"만 표시
                        if (paymentStatus === 'pending' || paymentStatus === 'payment_pending') {
                          return <span className='text-gray-400'>-</span>;
                        }

                        // 무료 상태(trial)인 경우에만 변경 버튼 표시 (expire_date 유효성과 관계없이)
                        if (paymentStatus === 'trial' || paymentStatus === 'payment_trial' || paymentStatus === 'free') {
                          const hasValidExpireDate = isValidExpireDate(caseItem.expire_date);
                          const today = new Date();
                          let isExpired = false;

                          if (hasValidExpireDate) {
                            try {
                              const expireDate = new Date(caseItem.expire_date);
                              isExpired = expireDate < today;
                            } catch {
                              // 날짜 파싱 실패 시 만료되지 않은 것으로 처리
                              isExpired = false;
                            }
                          }

                          return (
                            <div className='flex items-center justify-center gap-2'>
                              <span className={isExpired ? 'font-semibold text-red-500' : ''}>
                                {hasValidExpireDate ? formatTableDate(caseItem.expire_date) : '-'}
                              </span>
                              {/* 무료 상태일 때만 변경 버튼 표시 (expire_date 유효성과 관계없이) */}
                              <button
                                onClick={() => handleEndDateChangeClick(caseItem.project_id, caseItem.project_nm)}
                                className='rounded-full bg-red-500 p-1 text-white'
                                title={hasValidExpireDate ? '무료 종료일 변경' : '무료 종료일 설정'}
                              >
                                <FiEdit className='h-4 w-4' />
                              </button>
                            </div>
                          );
                        }

                        // 그 외의 경우: 변경 버튼 없이 "-"만 표시
                        return <span className='text-gray-400'>-</span>;
                      })()}
                    </TableCell>

                    <TableCell className='text-center'>{formatTableDate(caseItem.createdAt)}</TableCell>
                    <TableCell className='text-center font-medium'>{caseItem.project_nm}</TableCell>
                    <TableCell className='text-center'>{caseItem.client_nm}</TableCell>
                    <TableCell className='text-center'>{caseItem.office_nm}</TableCell>
                    <TableCell className='text-center'>
                      {caseItem.managers && caseItem.managers.length > 0 ? caseItem.managers[0].name : '-'}
                    </TableCell>
                    <TableCell className='text-center'>
                      {caseItem.managers && caseItem.managers.length > 0 ? caseItem.managers[0].email : '-'}
                    </TableCell>
                    <TableCell className='text-center'>
                      {formatPhoneNumber(caseItem.managers && caseItem.managers.length > 0 ? caseItem.managers[0].phone : '-')}
                    </TableCell>

                    <TableCell className='text-center'>{caseItem.payer_name || '-'}</TableCell>
                    <TableCell className='text-center'>
                      {caseItem.original_upload_status === '추가' ? caseItem.original_upload_status : '-'}
                    </TableCell>
                    <TableCell className='text-center'>
                      <span className='font-mono text-sm text-gray-700'>
                        {caseItem.ocr_completed_pages || 0}/{caseItem.ocr_total_pages || 0}
                      </span>
                    </TableCell>
                    <TableCell className='text-center'>
                      <span
                        className={`inline-flex rounded-full px-2 py-1 text-xs font-semibold ${
                          caseItem.status === '일시중지'
                            ? 'bg-yellow-100 text-yellow-800'
                            : caseItem.status === '진행중'
                              ? 'bg-green-100 text-green-800'
                              : caseItem.status === '완료'
                                ? 'bg-blue-100 text-blue-800'
                                : 'bg-gray-100 text-gray-800'
                        }`}
                      >
                        {caseItem.status || '상태없음'}
                      </span>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </tbody>
          </Table>
        </TableBox>
      </div>

      {/* 페이지네이션 - 하단 고정 */}
      <div className='fixed bottom-0 left-0 right-0 z-0 h-[50px] bg-white pt-2'>
        <div className='relative flex h-full items-center px-5'>
          {/* 왼쪽: 선택 정보, 삭제 버튼, 셀렉트 박스와 종료일 */}
          <div className='ml-[100px] flex items-center gap-4'>
            {selectedItems.length > 0 && (
              <div className='flex items-center gap-2'>
                <span className='text-sm text-gray-600'>{selectedItems.length}개 선택됨</span>
                <button
                  onClick={handleDeleteClick}
                  disabled={isDeletingCases}
                  className='rounded-lg bg-red-600 px-3 py-1 text-sm font-medium text-white transition-colors hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-red-500 focus:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50'
                >
                  {isDeletingCases ? (
                    <div className='flex items-center gap-1'>
                      <Spinner size='sm' color='white' />
                      <span>삭제 중...</span>
                    </div>
                  ) : (
                    '삭제'
                  )}
                </button>
              </div>
            )}
            {/* 셀렉트 박스와 종료일 */}
            <div className='ml-[50px] mr-[50px] flex items-center justify-start gap-2'>
              <Select
                value={currentPaymentSetting}
                onValueChange={(value) => {
                  if (value === '무료') {
                    setIsGlobalFreePaymentModalOpen(true);
                  } else if (value === '유료') {
                    setIsGlobalPaidPaymentModalOpen(true);
                  }
                }}
              >
                <SelectTrigger
                  className='h-[32px] w-[100px] border-0 text-xs font-semibold'
                  style={{
                    backgroundColor: globalPaymentSelectStyle.backgroundColor,
                    color: globalPaymentSelectStyle.color,
                    borderRadius: '30px',
                  }}
                >
                  <SelectValue placeholder='전체 변경' />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value='무료'>무료</SelectItem>
                  <SelectItem value='유료'>유료</SelectItem>
                </SelectContent>
              </Select>
              {/* 무료 상태일 때 종료일 표시 및 수정 버튼 */}
              {paymentSettingsResponse?.data?.free_payment_enabled && (
                <div className='flex items-center gap-6'>
                  <span className='text-[12px] text-[#7D7D7D]'>
                    {formatFreePaymentEndDate(paymentSettingsResponse.data.free_payment_end_date) || '종료일 없음'} 종료
                  </span>
                  <button
                    onClick={handleGlobalFreeEndDateChange}
                    className='flex h-[32px] items-center justify-center rounded-lg border border-gray-300 bg-white px-3 text-sm font-medium text-gray-700 transition-colors hover:bg-gray-50'
                    title='무료 종료일 변경'
                  >
                    수정
                  </button>
                </div>
              )}
            </div>
          </div>

          {/* 가운데: 페이지네이션 */}
          <div className='absolute left-1/2 top-1/2 flex -translate-x-1/2 -translate-y-1/2 items-center gap-2'>
            <EvidencePagination
              currentPage={adminCaseListResponse?.data?.paging?.page_no || 1}
              totalPages={adminCaseListResponse?.data?.paging?.total_page || 1}
              onPageChange={handlePageChange}
            />
          </div>

          {/* 오른쪽: 페이지당 셀렉트 */}
          <div className='ml-auto flex items-center gap-2'>
            <span className='text-[12px] text-[#000]'>페이지당:</span>
            <Select value={pageSize.toString()} onValueChange={(value) => handlePageSizeChange(Number(value))}>
              <SelectTrigger className='h-[32px] w-[80px]'>
                <SelectValue />
              </SelectTrigger>
              <SelectContent className='w-[120px]'>
                {[20, 50, 100].map((option: number) => (
                  <SelectItem key={option} value={option.toString()}>
                    <p className='text-[12px]'>{option}개</p>
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>
      </div>

      {/* 삭제 확인 모달 */}
      <DeleteConfirmModal
        isOpen={isDeleteModalOpen}
        onClose={handleCloseDeleteModal}
        onConfirm={handleConfirmDelete}
        selectedCount={selectedItems.length}
        isLoading={isDeletingCases}
      />

      {/* 무료 플랜 종료일 선택 모달 */}
      {isEndDateModalOpen && (
        <EndDateModal
          isOpen={isEndDateModalOpen}
          onClose={handleEndDateCancel}
          onConfirm={handleEndDateConfirm}
          caseName={selectedCaseForEndDate?.caseName || ''}
          selectedCaseForEndDate={selectedCaseForEndDate}
        />
      )}

      {/* 전체 무료 결제상태 변경 모달 */}
      <AdminFreePaymentModal
        isOpen={isGlobalFreePaymentModalOpen}
        onClose={() => setIsGlobalFreePaymentModalOpen(false)}
        onConfirm={handleGlobalFreePaymentConfirm}
        isPending={isChangingPaymentFunction}
      />

      {/* 전체 유료 결제상태 변경 모달 */}
      <AdminPaidPaymentModal
        isOpen={isGlobalPaidPaymentModalOpen}
        onClose={() => setIsGlobalPaidPaymentModalOpen(false)}
        onConfirm={handleGlobalPaidPaymentConfirm}
        isPending={isChangingPaymentFunction}
      />

      {/* OCR 관리상태 변경 확인 모달 */}
      <OcrRemarkConfirmModal
        isOpen={isOcrRemarkConfirmModalOpen}
        onClose={handleCloseOcrRemarkConfirmModal}
        onConfirm={handleConfirmOcrRemarkChange}
        caseName={pendingOcrRemarkChange?.caseName || ''}
        nextLabel={pendingOcrRemarkChange?.nextValue ? getOcrRemarkUiLabel(pendingOcrRemarkChange.nextValue) : ''}
        isLoading={isChangingOcrRemark}
      />
    </div>
  );
};
