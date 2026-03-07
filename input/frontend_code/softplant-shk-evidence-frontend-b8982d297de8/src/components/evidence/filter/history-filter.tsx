import { useEffect, useRef, useState } from 'react';

import { IoIosArrowDown, IoIosArrowUp } from 'react-icons/io';

import { useFindUserInfo } from '@query/query';

type TDropdownFilterProps = {
  column: string;
  options: { category_nm: string; types: { type: string }[] }[];
  onFilter: (values: string[]) => void;
};

const HistoryFilter = ({ column, options, onFilter }: TDropdownFilterProps): JSX.Element => {
  const [selectedFilters, setSelectedFilters] = useState<string[]>([]);
  const [openCategory, setOpenCategory] = useState<string | null>(null);
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const { response: findEvidenceUserInfo } = useFindUserInfo();
  const fontSizeAdjustment = findEvidenceUserInfo?.data?.font_size_rate || 0;
  const toggleCategoryOnly = (category: string, e: React.MouseEvent) => {
    e.stopPropagation(); // 이벤트 전파 중지
    setOpenCategory((prev) => (prev === category ? null : category));
  };

  // 전체 선택/해제
  const handleSelectAll = (e: React.MouseEvent) => {
    e.stopPropagation(); // 이벤트 전파 중지
    if (selectedFilters.length === options.flatMap((c) => c.types.map((t) => t.type)).length) {
      setSelectedFilters([]); // 전체 해제
    } else {
      setSelectedFilters(options.flatMap((c) => c.types.map((t) => t.type))); // 전체 선택
    }
  };

  // 카테고리 체크박스만 처리
  const handleCategoryCheckbox = (category_nm: string, e: React.MouseEvent) => {
    e.stopPropagation(); // 이벤트 전파 중지

    const categoryTypes = options.find((c) => c.category_nm === category_nm)?.types.map((t) => t.type) || [];
    const allSelected = categoryTypes.every((type) => selectedFilters.includes(type));

    if (allSelected) {
      // 전체 해제
      setSelectedFilters((prev) => prev.filter((type) => !categoryTypes.includes(type)));
    } else {
      // 전체 선택
      setSelectedFilters((prev) => {
        const newFilters = [...prev];
        categoryTypes.forEach((type) => {
          if (!newFilters.includes(type)) {
            newFilters.push(type);
          }
        });
        return newFilters;
      });
    }
  };

  // 필터창 토글
  const toggleDropdown = () => {
    setIsDropdownOpen(!isDropdownOpen);
  };

  const handleTypeCheckbox = (type: string, e: React.MouseEvent) => {
    e.stopPropagation(); // 이벤트 전파 중지
    /*   console.log(`체크박스 클릭: ${type}, 현재 상태:`, selectedFilters.includes(type)); */

    setSelectedFilters((prev) => {
      // 이미 선택된 경우 제거
      if (prev.includes(type)) {
        /*  console.log(`${type} 제거`); */
        return prev.filter((item) => item !== type);
      }
      // 선택되지 않은 경우 추가
      else {
        /*  console.log(`${type} 추가`); */
        return [...prev, type];
      }
    });
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
  const getAdjustedSize = (baseSize: number) => {
    return baseSize * (1 + fontSizeAdjustment / 100);
  };
  const filterRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (isDropdownOpen && filterRef.current && !filterRef.current.contains(event.target as Node)) {
        setIsDropdownOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [isDropdownOpen]);
  useEffect(() => {
    // 드롭다운이 열리면 모든 옵션을 자동으로 선택
    if (isDropdownOpen) {
      // 모든 카테고리의 모든 타입 선택
      const allTypes = options.flatMap((category) => category.types.map((typeObj) => typeObj.type));
      setSelectedFilters(allTypes);

      // 모든 카테고리 펼치기
      options.forEach((category) => {
        setOpenCategory(category.category_nm);
      });
    }
  }, [isDropdownOpen, options]); //eslint-disable-line
  return (
    <div className='relative inline-block' ref={filterRef}>
      <div
        className={`flex cursor-pointer items-center ${getFontSizeClass(12, fontSizeAdjustment)}`}
        onClick={toggleDropdown}
        style={{ fontSize: `${getAdjustedSize(12)}px` }}
      >
        <p>{column}</p>
        {selectedFilters.length > 0 ? (
          <IoIosArrowUp className='ml-1 text-[15px] text-[#8e8e8e]' />
        ) : (
          <IoIosArrowDown className='ml-1 text-[15px] text-[#8e8e8e]' />
        )}
      </div>

      {isDropdownOpen && (
        <div className='absolute mt-2 max-h-[400px] w-[300px] overflow-y-auto rounded-[8px] border bg-white shadow-lg'>
          <div className=''>
            {/* 전체 선택 및 초기화 */}
            <div className='mb-2 flex justify-between'>
              <label className='mt-[16px] flex h-[44px] items-center px-[16px]'>
                <input
                  type='checkbox'
                  checked={selectedFilters.length === options.flatMap((c) => c.types.map((t) => t.type)).length}
                  className='mr-2 h-[20px] w-[20px] rounded-[2px] border-[#CCD0D1] text-[#4577A4] outline-none focus:ring-0'
                  onClick={handleSelectAll}
                />
                전체
              </label>
              {/* <button onClick={resetFilters} className='text-sm text-blue-600'>
                초기화
              </button> */}
            </div>

            {options.map((category) => {
              const categoryTypes = category.types.map((t) => t.type);
              const isCategorySelected = categoryTypes.every((type) => selectedFilters.includes(type));

              return (
                <div key={category.category_nm} className='mb-2'>
                  <div className='flex cursor-pointer items-center justify-between px-[16px]'>
                    <div className='flex h-[44px] items-center' onClick={(e) => e.stopPropagation()}>
                      <input
                        type='checkbox'
                        checked={isCategorySelected}
                        className='mr-2 h-[20px] w-[20px] rounded-[2px] border-[#CCD0D1] text-[#4577A4] outline-none focus:ring-0'
                        onClick={(e) => handleCategoryCheckbox(category.category_nm, e)}
                      />
                      <span className='text-[14px]'>{category.category_nm}</span>
                    </div>

                    {/* 화살표는 메뉴 토글만 담당 */}
                    <div onClick={(e) => toggleCategoryOnly(category.category_nm, e)}>
                      <IoIosArrowDown
                        className={`transform transition-transform ${openCategory === category.category_nm ? 'rotate-180' : ''}`}
                      />
                    </div>
                  </div>

                  {/* 하위 타입 목록 */}
                  {openCategory === category.category_nm && (
                    <div className='ml-4 mt-1 bg-white'>
                      {category.types.map((typeObj) => (
                        <div key={typeObj.type} className='flex cursor-pointer items-center px-4 py-1'>
                          <input
                            type='checkbox'
                            checked={selectedFilters.includes(typeObj.type)}
                            className='mr-2 h-[20px] w-[20px] rounded-[2px] border-[#CCD0D1] text-[#4577A4] outline-none focus:ring-0'
                            onClick={(e) => handleTypeCheckbox(typeObj.type, e)}
                          />
                          <span className='text-sm'>{typeObj.type}</span>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              );
            })}

            <div className='sticky bottom-0 flex h-[64px] w-full items-center justify-center gap-2 bg-white'>
              <button
                onClick={() => {
                  /*   console.log('적용된 필터:', selectedFilters); */
                  onFilter(selectedFilters);
                  setIsDropdownOpen(false);
                }}
                disabled={selectedFilters.length === 0}
                className={`h-[30px] w-[70px] rounded-[6px] ${
                  selectedFilters.length === 0 ? 'cursor-not-allowed bg-gray-300' : 'cursor-pointer bg-[#0050B3]'
                } text-white`}
              >
                적용
              </button>
              <button className='h-[30px] w-[70px] rounded-[6px] border text-[#373737]' onClick={() => setIsDropdownOpen(false)}>
                취소
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default HistoryFilter;
