import { useState, useRef, useEffect } from 'react';

import { FiSearch } from 'react-icons/fi';
import { IoMdCloseCircle } from 'react-icons/io';
type TPowerSearchModalProps = {
  isOpen: boolean;
  onClose: () => void;
  reset?: boolean;
  onSearch: (powerSearch: string, excludeTerms: string[]) => void;
};
const sharedInputStyle: React.CSSProperties = {
  fontFamily: 'Menlo, Courier, monospace',
  fontSize: '16px',
  lineHeight: '48px',
  letterSpacing: '0px',
  padding: '0 16px',
  height: '48px',
  width: '100%',
  boxSizing: 'border-box',
};

export const PowerSearchModal = ({ isOpen, onClose, onSearch, reset }: TPowerSearchModalProps) => {
  const [inputValue, setInputValue] = useState('');
  const [passValue, setPassValue] = useState('');
  const [searchTerms, setSearchTerms] = useState<string[]>([]);
  const [isFocused, setIsFocused] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string>('');
  const [cursorPosition, setCursorPosition] = useState<number | null>(null);
  console.log(searchTerms);
  const [usedParentheses, setUsedParentheses] = useState({
    '(': false,
    ')': false,
  });
  const inputRef = useRef<HTMLInputElement>(null);
  // ! 커서 위치 설정
  useEffect(() => {
    if (cursorPosition !== null && inputRef.current) {
      inputRef.current.focus();
      inputRef.current.setSelectionRange(cursorPosition, cursorPosition);
      setCursorPosition(null);
    }
  }, [cursorPosition, inputValue]);

  const handleOperatorClick = (operator: string) => {
    if (!inputRef.current) return;

    const inputEl = inputRef.current;
    const start = inputEl.selectionStart ?? inputValue.length;
    const end = inputEl.selectionEnd ?? inputValue.length;

    // 공백을 하나씩만 포함하도록 수정 (양쪽에 하나씩)
    const operatorWithSpacing = ` ${operator} `;

    // 새 입력값 조합
    const newValue = inputValue.slice(0, start) + operatorWithSpacing + inputValue.slice(end);
    setInputValue(newValue);

    // 괄호 사용 여부 추적
    if (operator === '(' || operator === ')') {
      setUsedParentheses((prev) => ({ ...prev, [operator]: true }));
    }

    // 연산자 뒤 공백 1개 위치로 커서 설정
    const newCursorPos = start + operatorWithSpacing.length;

    // 커서 위치 설정을 위해 setTimeout 사용
    setTimeout(() => {
      inputEl.focus();
      inputEl.setSelectionRange(newCursorPos, newCursorPos);
    }, 10);
  };

  const renderHighlightedInput = () => {
    // 대소문자 구분 없이 분할 (i 플래그 추가)
    const parts = inputValue.split(/(AND|OR|\(|\))/gi);

    return parts.map((part, index) => {
      // 대소문자 무시하고 비교
      const upperPart = part.toUpperCase();
      const isOperator = upperPart === 'AND' || upperPart === 'OR' || part === '(' || part === ')';

      return isOperator ? (
        <span
          key={index}
          className='mx-[1px] text-[#0050B3]'
          style={{
            backgroundColor: '#E6F7FF',
            borderRadius: '8px',
            padding: '1px 4px',
            fontSize: '14px',
            lineHeight: '2.2',
            display: 'inline-block',
            verticalAlign: 'middle',
          }}
        >
          {upperPart === 'AND' || upperPart === 'OR' ? upperPart : part}
        </span>
      ) : (
        <span key={index} className='text-black'>
          {part}
        </span>
      );
    });
  };

  // 입력 처리 수정
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    let value = e.target.value;

    // and, or를 대문자로 자동 변환 (단어 경계 고려)
    value = value.replace(/\b(and|or)\b/gi, (match) => match.toUpperCase());

    setInputValue(value);
  };

  // formatPowerSearch 함수 수정
  const formatPowerSearch = (input: string) => {
    return input
      .split(/(\s+)/)
      .map((term) => {
        // 대소문자 구분 없이 비교 (case-insensitive)
        const upperTerm = term.trim().toUpperCase();
        if (['AND', 'OR', '(', ')'].includes(upperTerm)) {
          // 항상 대문자로 변환하여 일관성 유지
          return `#${upperTerm}`;
        }
        return term.trim();
      })
      .filter((term) => term.length > 0)
      .join('');
  };
  const validateSearch = () => {
    // 입력값이 없는 경우
    if (!inputValue.trim()) {
      setErrorMessage('검색어를 입력해주세요');
      return false;
    }

    // AND 또는 OR이 마지막에 있는 경우
    if (inputValue.trim().endsWith('AND') || inputValue.trim().endsWith('OR')) {
      setErrorMessage('AND나 OR이 마지막에 입력될 수 없습니다');
      return false;
    }

    // AND나 OR 뒤에 바로 괄호가 오는 경우
    /*  if (inputValue.match(/\b(AND|OR)\s*\(/i)) {
      setErrorMessage('검색 조건 뒤에 바로 괄호가 올 수 없습니다');
      return false;
    } */

    // 괄호 짝이 맞지 않는 경우
    const openCount = (inputValue.match(/\(/g) || []).length;
    const closeCount = (inputValue.match(/\)/g) || []).length;
    if (openCount !== closeCount) {
      setErrorMessage('괄호는 쌍으로 사용해야 합니다');
      return false;
    }

    // 유효한 경우 에러 메시지 초기화
    setErrorMessage('');
    return true;
  };
  const handleSearch = () => {
    const formattedSearch = formatPowerSearch(inputValue);
    // 디버깅용

    // 제외 검색어 처리
    const excludeTermsList = passValue
      .split(',')
      .map((term) => term.trim())
      .filter((term) => term !== '');

    // 부모 컴포넌트로 검색어 전달
    onSearch(formattedSearch, excludeTermsList);

    // 검색 실행 후 입력값 초기화
    setInputValue('');
    setPassValue('');
    setSearchTerms([]);
    setUsedParentheses({ '(': false, ')': false });
    setErrorMessage('');
  };

  const handleSearchButtonClick = () => {
    if (!validateSearch()) {
      return; // 유효성 검사 실패 시 함수 종료 (모달 유지)
    }
    handleSearch();
    onClose();
  };
  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      if (!validateSearch()) {
        return; // 유효성 검사 실패 시 함수 종료 (모달 유지)
      }
      handleSearch();
      onClose(); // 엔터 시 모달 닫기
    }
  };

  const clearInput = () => {
    setInputValue('');
    setSearchTerms([]);
    setUsedParentheses({ '(': false, ')': false });
    inputRef.current?.focus();
  };

  const clearPass = () => {
    setPassValue('');
  };
  useEffect(() => {
    if (reset) {
      setInputValue('');
      setPassValue('');
      setSearchTerms([]);
      setUsedParentheses({ '(': false, ')': false });
    }
  }, [reset]);
  if (!isOpen) return null;

  return (
    <div className='fixed inset-0 z-[99] flex items-center justify-center bg-black bg-opacity-50'>
      <div className='w-[635px] rounded-lg bg-white p-[32px]'>
        <div className='flex items-center justify-between'>
          <h2 className='pb-[16px] text-[24px] font-extrabold text-[#252525]'>파워검색</h2>
        </div>
        <p className='text-[16px] text-[#000]'>검색어를 입력한 뒤 AND, OR, (, ) 버튼을 눌러 검색 조건을 설정하세요</p>
        <p className='text-[14px] text-[#888]'>
          ex. '압수수색'을 포함하면서 '서류' 또는 '사진'이 포함된 증거 = 압수수색 AND (서류 OR 사진)
        </p>
        <div className='mt-[20px] flex items-center'>
          <div className='relative flex w-[350px] items-center'>
            <div className='relative h-[48px] w-[350px]'>
              <div
                className='pointer-events-none inset-0 flex h-[48px] w-[350px] items-center overflow-hidden rounded-[8px] border-none px-4 font-bold'
                style={{
                  ...sharedInputStyle,
                  color: '#000',
                  pointerEvents: 'none',
                  border: isFocused ? '2px solid #4577A4' : '1px solid #C2C2C2',
                  borderRadius: '8px',
                }}
              >
                {inputValue ? renderHighlightedInput() : <span className='font-normal text-[#C2C2C2]'></span>}
              </div>
              <input
                ref={inputRef}
                type='text'
                value={inputValue}
                onFocus={() => setIsFocused(true)}
                onBlur={() => setIsFocused(false)}
                onChange={handleInputChange}
                onKeyDown={handleKeyDown}
                placeholder='검색어를 입력하고 우측의 버튼을 눌러주세요'
                className='absolute left-0 top-0 z-10 h-full w-full rounded-[8px] placeholder:text-[#C2C2C2] focus:outline-none focus:ring-0'
                style={{
                  ...sharedInputStyle,
                  color: 'transparent',
                  backgroundColor: 'transparent',
                  caretColor: '#4577A4',
                  border: 'none', // ⚠️ 테두리 제거
                }}
              />
            </div>
            {inputValue && (
              <button onClick={clearInput} className='absolute right-3 z-10 text-gray-400 hover:text-gray-600'>
                <IoMdCloseCircle className='text-xl' />
              </button>
            )}
          </div>
          <div className='flex'>
            <button className='ml-[8px] h-[48px] w-[62px] rounded-[8px] border border-[#C2C2C2]' onClick={() => handleOperatorClick('AND')}>
              AND
            </button>
            <button className='ml-[8px] h-[48px] w-[52px] rounded-[8px] border border-[#C2C2C2]' onClick={() => handleOperatorClick('OR')}>
              OR
            </button>
            <button
              className={`ml-[8px] h-[48px] w-[38px] rounded-[8px] border border-[#C2C2C2] ${
                usedParentheses['('] ? 'cursor-not-allowed bg-[#F5F5F5]' : ''
              }`}
              onClick={() => handleOperatorClick('(')}
              disabled={usedParentheses['(']}
            >
              (
            </button>
            <button
              className={`ml-[8px] h-[48px] w-[38px] rounded-[8px] border border-[#C2C2C2] ${
                usedParentheses[')'] ? 'cursor-not-allowed bg-[#F5F5F5]' : ''
              }`}
              onClick={() => handleOperatorClick(')')}
              disabled={usedParentheses[')']}
            >
              )
            </button>
          </div>
        </div>
        {/* 입력된 검색어 표시 */}
        {inputValue && (
          <div className='ml-[8px] mt-[0px]'>
            <div className=''>
              <span className='text-[14px] text-[#1890FF]'>{inputValue}</span>
            </div>
          </div>
        )}
        {errorMessage && (
          <div className='ml-[8px] mt-1'>
            <span className='text-[14px] text-[#FF4D4F]'>{errorMessage}</span>
          </div>
        )}
        <div className='mt-[32px] flex flex-col'>
          <label className='mb-3 text-[#000]'>제외 검색어</label>
          <div className='relative'>
            <input
              type='text'
              value={passValue}
              onChange={(e) => setPassValue(e.target.value)}
              className='h-[48px] w-[571px] rounded-[8px] border border-[#C2C2C2] px-4 py-3 font-bold placeholder:font-normal placeholder:text-[#C2C2C2] focus:border-[#0050B3] focus:ring-1 focus:ring-[#0050B3]'
              placeholder='검색어를 입력해주세요'
            />
            {passValue && (
              <button onClick={clearPass} className='absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600'>
                <IoMdCloseCircle className='text-xl' />
              </button>
            )}
          </div>
        </div>
        <div className='mt-[24px] border-b'></div>
        <div className='mt-[24px] flex justify-center gap-2'>
          <button
            className='flex h-[48px] w-[132px] items-center justify-center rounded-lg bg-[#0050B3] text-[16px] text-white'
            onClick={() => {
              handleSearchButtonClick();
            }}
          >
            <FiSearch className='mr-1 text-xl' />
            검색하기
          </button>
          <button className='h-[48px] w-[132px] rounded-lg border text-[14px]' onClick={onClose}>
            취소
          </button>
        </div>
      </div>
    </div>
  );
};
