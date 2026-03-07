import { useEffect, useRef, useState } from 'react';

import ReactDOM from 'react-dom';
import { IoIosArrowDown, IoIosArrowUp } from 'react-icons/io';

import { useFindUserInfo } from '@query/query';
type TDropdownFilterProps = {
  column: string;
  options: string[];
  onFilter: (values: string[]) => void;
  isOpen: boolean;
  onToggle: () => void;
};
const EvidenceListFilter = ({ column, options, onFilter, isOpen, onToggle }: TDropdownFilterProps): JSX.Element => {
  const [isFilterApplied, setIsFilterApplied] = useState(false);
  const [selectedFilters, setSelectedFilters] = useState<string[]>([]);

  const triggerRef = useRef<HTMLDivElement>(null);

  const shouldShowEmptyOption = (columnName: string) => {
    const excludedColumns = ['북마크', '요약', '누락여부', '메모', '증거인부'];
    return !excludedColumns.includes(columnName);
  };
  const handleSelectAll = () => {
    // 비어있음 항목이 필요한지 확인
    const needsEmptyOption = shouldShowEmptyOption(column);

    // 전체 옵션 수 계산
    const allOptionsLength = needsEmptyOption ? options.length + 1 : options.length;

    // 모든 항목이 선택되었는지 확인
    if (selectedFilters.length === allOptionsLength) {
      // 모두 선택된 상태면 전체 해제
      setSelectedFilters([]);
    } else {
      // 전체 선택 (모든 옵션 포함)
      const newFilters = [...options];
      if (needsEmptyOption) {
        newFilters.push('__EMPTY__');
      }
      setSelectedFilters(newFilters);
    }
  };
  const handleOptionChange = (option: string) => {
    const updatedFilters = selectedFilters.includes(option)
      ? selectedFilters.filter((filter) => filter !== option)
      : [...selectedFilters, option];
    setSelectedFilters(updatedFilters);
  };
  const handleConfirm = () => {
    // 전체 옵션 수 계산
    const totalOptionsCount = shouldShowEmptyOption(column) ? options.length + 1 : options.length;
    // 모든 옵션이 선택되었는지 확인
    const allSelected = selectedFilters.length === totalOptionsCount;

    // 증거인부: "전체" 의미를 필터 해제(=onFilter([]))로 일관되게 처리
    // - 전체 선택(allSelected)도 해제
    // - 아무것도 선택 안 한 상태(selectedFilters.length===0)도 해제
    if (column === '증거인부' && (allSelected || selectedFilters.length === 0)) {
      setIsFilterApplied(false);
      onFilter([]);
      onToggle();
      return;
    }

    setIsFilterApplied(true);

    if (allSelected) {
      onFilter([]);
    } else {
      // 태그 필터의 경우 특별 처리
      if (column === '태그') {
        // 비어있음만 선택된 경우
        if (selectedFilters.length === 1 && selectedFilters.includes('__EMPTY__')) {
          // 태그가 없는 항목만 필터링하도록 빈 문자열 전달
          onFilter(['']);
        } else {
          // 비어있음과 다른 태그가 함께 선택된 경우
          const filtersToSend = selectedFilters.map((filter) => (filter === '__EMPTY__' ? '' : filter));
          onFilter(filtersToSend);
        }
      } else {
        // 다른 필터의 경우 기존 로직 유지
        const filtersToSend = selectedFilters.map((filter) => (filter === '__EMPTY__' ? '' : filter));
        onFilter(filtersToSend);
      }
    }

    onToggle(); // 필터 닫기
  };
  const handleCancel = () => {
    setSelectedFilters([]);
    setIsFilterApplied(false);
    onToggle();
  };
  // ! 폰트 크기
  const { response: findEvidenceUserInfo } = useFindUserInfo();
  const fontSizeAdjustment = findEvidenceUserInfo?.data?.font_size_rate || 0;
  // 동적 폰트 크기 조정
  const getAdjustedSize = (baseSize: number) => {
    return baseSize * (1 + fontSizeAdjustment / 100);
  };

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

  const [triggerRect, setTriggerRect] = useState<DOMRect | null>(null);

  // 버튼의 위치 정보를 가져오기 위한 효과
  useEffect(() => {
    if (triggerRef.current) {
      setTriggerRect(triggerRef.current.getBoundingClientRect());
    }
  }, [isOpen]);
  const filterRef = useRef<HTMLDivElement>(null);
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      // 트리거와 필터 컨테이너 모두 체크
      if (
        isOpen &&
        triggerRef.current &&
        filterRef.current &&
        !triggerRef.current.contains(event.target as Node) &&
        !filterRef.current.contains(event.target as Node)
      ) {
        onToggle();
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [isOpen, onToggle]);
  useEffect(() => {
    if (isOpen) {
      // 이전에 필터가 적용된 적이 없으면 전체 선택으로 초기화
      if (!isFilterApplied) {
        // 전체 선택 상태로 설정
        const needsEmptyOption = shouldShowEmptyOption(column);
        const allOptions = [...options];
        if (needsEmptyOption && !options.includes('__EMPTY__')) {
          allOptions.push('__EMPTY__');
        }
        setSelectedFilters(allOptions);
      }
    }
  }, [isOpen, options, column, isFilterApplied]);
  return (
    <div className='relative inline-block'>
      <div ref={triggerRef} className='flex cursor-pointer items-center text-[#252525]' onClick={onToggle}>
        <p className={` ${getFontSizeClass(12, fontSizeAdjustment)}`} style={{ fontSize: `${getAdjustedSize(12)}px` }}>
          {column}
        </p>
        {isOpen ? <IoIosArrowUp className='ml-1 text-[#8e8e8e]' /> : <IoIosArrowDown className='ml-1 text-[#8e8e8e]' />}
      </div>
      {isOpen &&
        ReactDOM.createPortal(
          <div
            className='mt-2 min-h-[180px] w-[180px] rounded-[8px] border bg-white shadow-lg'
            style={{
              position: 'absolute',
              top: triggerRect ? triggerRect.bottom + window.scrollY : 0,
              left: triggerRect ? triggerRect.left + window.scrollX : 0,
              zIndex: 100001,
            }}
            onClick={(e) => e.stopPropagation()}
          >
            <div className='flex h-full flex-col'>
              <div className='flex-grow'>
                <label className='flex'>
                  <div className='ml-[16px] flex h-[48px] items-center'>
                    <input
                      type='checkbox'
                      checked={selectedFilters.length === (shouldShowEmptyOption(column) ? options.length + 1 : options.length)}
                      onChange={handleSelectAll}
                      className='mr-2 h-[20px] w-[20px] rounded-[2px] border-[#CCD0D1] text-[#4577A4] outline-none focus:ring-0'
                    />
                    <p className='text-[14px]'>전체</p>
                  </div>
                </label>
                <div className='max-h-[250px] min-h-[60px] overflow-y-auto'>
                  <ul className='relative'>
                    {shouldShowEmptyOption(column) && (
                      <li className='flex h-[48px] items-center pl-[16px]'>
                        <input
                          type='checkbox'
                          checked={selectedFilters.includes('__EMPTY__')}
                          onChange={() => handleOptionChange('__EMPTY__')}
                          className='mr-2 h-[20px] w-[20px] rounded-[2px] border-[#CCD0D1] text-[#4577A4] outline-none focus:ring-0'
                        />
                        <p className='max-w-[120px] overflow-hidden truncate text-[14px]'>(비어있음)</p>
                      </li>
                    )}
                    {options.map((option) => (
                      <li key={option} className='flex h-[48px] items-center pl-[16px]'>
                        <input
                          type='checkbox'
                          checked={selectedFilters.includes(option)} // 선택된 필터에 포함되어 있는지 확인
                          onChange={() => handleOptionChange(option)}
                          className='mr-2 h-[20px] w-[20px] rounded-[2px] border-[#CCD0D1] text-[#4577A4] outline-none focus:ring-0'
                        />
                        <p className='max-w-[120px] overflow-hidden truncate text-[14px]'>{option || '(빈 값)'}</p>
                      </li>
                    ))}
                  </ul>
                </div>
              </div>
              <div className='sticky bottom-0 flex h-[64px] w-full items-center justify-center gap-2 bg-white'>
                <button
                  onClick={handleConfirm}
                  disabled={selectedFilters.length === 0 && column !== '증거인부'}
                  className={`h-[30px] w-[70px] rounded-[6px] ${
                    selectedFilters.length === 0 && column !== '증거인부' ? 'cursor-not-allowed bg-gray-300' : 'cursor-pointer bg-[#0050B3]'
                  } text-white`}
                >
                  적용
                </button>
                <button onClick={handleCancel} className='h-[30px] w-[70px] rounded-[6px] border text-[#373737]'>
                  취소
                </button>
              </div>
            </div>
          </div>,
          document.body,
        )}
    </div>
  );
};

export default EvidenceListFilter;
