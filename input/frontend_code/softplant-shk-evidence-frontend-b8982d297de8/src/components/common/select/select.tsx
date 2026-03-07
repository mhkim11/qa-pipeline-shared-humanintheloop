import { Select as UISelect, SelectContent, SelectGroup, SelectItem, SelectTrigger, SelectValue } from '@components/ui';

// 셀렉트 컴포넌트의 props 타입 정의
type TSelectProps = {
  selectOptions: {
    value: string;
    label: string;
  }[];
  value: string;
  onValueChange: (value: string) => void;
  disabled?: boolean;
  placeholder?: string;
  readonly?: boolean;
};

/**
 * 셀렉트 컴포넌트
 * @param selectOptions 셀렉트 옵션
 * @param value 셀렉트 값
 * @param onValueChange 셀렉트 값 변경 이벤트
 * @param disabled 비활성화 여부
 * @param placeholder 플레이스홀더
 * @param readonly 읽기 전용 여부
 * @returns {JSX.Element} 셀렉트 컴포넌트
 */
export const Select = ({ selectOptions = [], value, onValueChange, disabled, placeholder, readonly }: TSelectProps): JSX.Element => {
  return (
    <UISelect disabled={disabled} value={value} onValueChange={(newValue) => !readonly && onValueChange(newValue)}>
      <SelectTrigger className='w-[300px] disabled:border-gray-400 disabled:text-black'>
        {value ? <SelectValue /> : <div className='accent-gray-100'>{placeholder}</div>}
      </SelectTrigger>
      {!readonly && (
        <SelectContent>
          <SelectGroup>
            {selectOptions.map((item) => (
              <SelectItem key={item.value} value={item.value}>
                {item.label}
              </SelectItem>
            ))}
          </SelectGroup>
        </SelectContent>
      )}
    </UISelect>
  );
};
