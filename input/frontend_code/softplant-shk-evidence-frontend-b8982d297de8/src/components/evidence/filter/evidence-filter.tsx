import { useEffect, useMemo, useRef, useState } from 'react';

import ReactDOM from 'react-dom';
import { IoIosArrowDown, IoIosArrowUp } from 'react-icons/io';

import { useFindUserInfo } from '@query/query';
type TDropdownFilterProps = {
  column: string;
  options: string[];
  /** 현재 적용된 값(checked 상태). 빈 배열이면 '전체 선택'으로 간주 */
  appliedValues?: string[];
  onFilter: (values: string[]) => void;
  isOpen: boolean;
  onToggle: () => void;
  isFinished?: boolean;
  oneGoing?: boolean;
  closing?: boolean;
  disableUserInfo?: boolean;
};

const DropdownFilter = ({
  column,
  options,
  appliedValues,
  onFilter,
  isOpen,
  onToggle,
  isFinished,
  oneGoing,
  closing,
  disableUserInfo,
}: TDropdownFilterProps): JSX.Element => {
  const filteredOptions = useMemo(() => {
    // 사건 상태 필터링 로직
    if (column === '사건 상태') {
      if (oneGoing) {
        const filtered = options.filter(
          (option) => option === '생성중' || option === '진행중' || option === '결제대기' || option === '일시중지',
        );
        return filtered.length > 0 ? filtered : options;
      }
      if (closing || isFinished) {
        const filtered = options.filter((option) => option === '종결' || option === '일시중지');
        return filtered.length > 0 ? filtered : options;
      }
    }

    return options;
  }, [options, column, oneGoing, closing, isFinished]);

  const [isFilterApplied, setIsFilterApplied] = useState(false);
  const [selectedFilters, setSelectedFilters] = useState<string[]>([]);
  const prevOpenRef = useRef(false);
  const triggerRef = useRef<HTMLDivElement>(null);
  const [position, setPosition] = useState({ top: 0, left: 0 });
  const [isPositionReady, setIsPositionReady] = useState(false);
  // ! 유저정보 api 호출
  const { response: findEvidenceUserInfo } = useFindUserInfo({ enabled: disableUserInfo !== true });
  const fontSizeAdjustment = disableUserInfo ? 0 : findEvidenceUserInfo?.data?.font_size_rate || 0;

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

  // 전체 선택/해제
  const handleSelectAll = () => {
    if (selectedFilters.length === filteredOptions.length) {
      setSelectedFilters([]);
    } else {
      setSelectedFilters(filteredOptions);
    }
  };

  // 개별 옵션 선택/해제
  const handleOptionChange = (option: string) => {
    const updatedFilters = selectedFilters.includes(option)
      ? selectedFilters.filter((filter) => filter !== option)
      : [...selectedFilters, option];
    setSelectedFilters(updatedFilters);
  };

  // 확인 버튼 클릭 시 필터 값 전달
  const handleConfirm = () => {
    setIsFilterApplied(true);
    onFilter(selectedFilters);
    onToggle();
  };
  const formatNumberWithCommas = (option: string) => {
    // '총페이지' 컬럼에 대해서만 콤마 추가 로직 적용
    if (column === '총 페이지') {
      // 숫자 문자열인지 확인
      const num = parseInt(option);
      if (!isNaN(num)) {
        // 콤마 추가
        return num.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ',');
      }
    }
    return option;
  };

  const filterRef = useRef<HTMLDivElement>(null);

  // 위치 계산
  useEffect(() => {
    if (isOpen && triggerRef.current) {
      const rect = triggerRef.current.getBoundingClientRect();
      setPosition({
        top: rect.bottom + window.scrollY,
        left: rect.left + window.scrollX,
      });
    }
  }, [isOpen]);

  useEffect(() => {
    if (column === '사건 상태') {
      setSelectedFilters((prev) => {
        if (oneGoing) {
          return prev.filter((filter) => filter === '생성중' || filter === '진행중' || filter === '결제대기' || filter === '일시중지');
        }
        if (closing || isFinished) {
          return prev.filter((filter) => filter === '종결' || filter === '일시중지');
        }
        return prev;
      });
    }
  }, [oneGoing, closing, isFinished, column]);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        isOpen &&
        filterRef.current &&
        !filterRef.current.contains(event.target as Node) &&
        triggerRef.current &&
        !triggerRef.current.contains(event.target as Node)
      ) {
        onToggle();
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [isOpen, onToggle]);

  useEffect(() => {
    if (isOpen) {
      setIsPositionReady(false); // 위치 계산 전에 준비 상태 초기화

      if (triggerRef.current) {
        const rect = triggerRef.current.getBoundingClientRect();
        setPosition({
          top: rect.bottom + window.scrollY,
          left: rect.left + window.scrollX,
        });

        // 위치 계산이 완료된 후 약간의 지연을 두고 준비 상태 활성화
        setTimeout(() => {
          setIsPositionReady(true);
        }, 10);
      }
    } else {
      setIsPositionReady(false);
    }
  }, [isOpen]);

  useEffect(() => {
    // 팝업이 "열릴 때"만 초기 체크 상태를 맞춘다.
    // - appliedValues가 있으면: 적용된 상태를 그대로 반영 (빈 배열이면 전체 선택)
    // - appliedValues가 없으면: 기존 동작 유지 (최초 오픈은 전체 선택)
    const wasOpen = prevOpenRef.current;
    prevOpenRef.current = isOpen;
    if (!isOpen || wasOpen) return;

    if (Array.isArray(appliedValues)) {
      setSelectedFilters(appliedValues.length ? appliedValues : [...filteredOptions]);
      setIsFilterApplied(true);
      return;
    }

    if (!isFilterApplied) setSelectedFilters([...filteredOptions]);
  }, [appliedValues, filteredOptions, isFilterApplied, isOpen]);

  return (
    <div className='relative inline-block'>
      <div ref={triggerRef} className='flex cursor-pointer items-center text-[#252525]' onClick={onToggle}>
        <p className={` ${getFontSizeClass(12, fontSizeAdjustment)}`} style={{ fontSize: `${getAdjustedSize(12)}px` }}>
          {column}
        </p>
        {isOpen ? <IoIosArrowUp className='ml-1 text-[#8e8e8e]' /> : <IoIosArrowDown className='ml-1 text-[#8e8e8e]' />}
      </div>
      {isOpen &&
        isPositionReady &&
        ReactDOM.createPortal(
          <div
            ref={filterRef}
            className='fixed z-[9999] min-h-[180px] w-[180px] rounded-[8px] border bg-white shadow-lg'
            style={{
              top: `${position.top}px`,
              left: `${position.left}px`,
            }}
            onClick={(e) => e.stopPropagation()}
          >
            <div className='flex h-full flex-col'>
              <div className='flex-grow'>
                <label className='flex'>
                  <div className='ml-[16px] flex h-[48px] items-center'>
                    <input
                      type='checkbox'
                      checked={selectedFilters.length === filteredOptions.length}
                      onChange={handleSelectAll}
                      className='h-[20px] w-[20px] rounded-[2px] border-[#CCD0D1] text-[#0050B3] outline-none focus:ring-0'
                    />
                    <p className={`ml-2 ${getFontSizeClass(14, fontSizeAdjustment)}`} style={{ fontSize: `${getAdjustedSize(14)}px` }}>
                      전체
                    </p>
                  </div>
                </label>
                <div className='max-h-[300px] min-h-[60px] overflow-y-auto 2xl:max-h-[376px]'>
                  <ul className='relative'>
                    {filteredOptions.map((option) => (
                      <li key={option} className='flex h-[48px] items-center pl-[16px]'>
                        <input
                          type='checkbox'
                          checked={selectedFilters.includes(option)}
                          onChange={() => handleOptionChange(option)}
                          className='mr-2 h-[20px] w-[20px] rounded-[2px] border-[#CCD0D1] text-[#0050B3] outline-none focus:ring-0'
                        />
                        <p
                          className={`ml-2 max-w-[120px] overflow-hidden truncate ${getFontSizeClass(14, fontSizeAdjustment)}`}
                          style={{ fontSize: `${getAdjustedSize(14)}px` }}
                        >
                          {formatNumberWithCommas(option)}
                        </p>
                      </li>
                    ))}
                  </ul>
                </div>
              </div>
              <div className='sticky bottom-0 flex h-[64px] w-full items-center justify-center gap-2 rounded-b-[8px] bg-white'>
                <button
                  onClick={handleConfirm}
                  disabled={selectedFilters.length === 0}
                  className={`h-[30px] w-[70px] rounded-[6px] ${
                    selectedFilters.length === 0 ? 'cursor-not-allowed bg-gray-300' : 'cursor-pointer bg-[#0050B3]'
                  } text-white`}
                >
                  적용
                </button>
                <button onClick={onToggle} className='h-[30px] w-[70px] rounded-[6px] border text-[#373737]'>
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

export default DropdownFilter;
