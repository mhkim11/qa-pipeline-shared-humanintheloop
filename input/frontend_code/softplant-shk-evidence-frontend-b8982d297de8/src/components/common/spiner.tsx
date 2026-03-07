const CustomSpinner = ({ size = 'md' }: { size?: 'sm' | 'md' | 'lg' }) => {
  // 크기에 따른 스타일 매핑
  const sizeStyles = {
    sm: { width: '16px', height: '16px', flexShrink: 0 },
    md: { width: '24px', height: '24px', flexShrink: 0 },
    lg: { width: '40px', height: '40px', flexShrink: 0 },
  };

  const style = sizeStyles[size];
  return (
    <div className='flex flex-col items-center justify-center gap-3'>
      <div className='animate-spin' style={style}>
        <svg xmlns='http://www.w3.org/2000/svg' width='100%' height='100%' viewBox='0 0 18 18' fill='none'>
          <path
            d='M9 17C4.58172 17 1 13.4183 1 9C1 4.58172 4.58172 1 9 1C13.4183 1 17 4.58172 17 9'
            stroke='url(#paint0_linear_5387_138046)'
            strokeWidth='2'
            strokeLinecap='round'
            strokeLinejoin='round'
          />
          <defs>
            <linearGradient id='paint0_linear_5387_138046' x1='15' y1='5.4' x2='9' y2='17' gradientUnits='userSpaceOnUse'>
              <stop stopColor='#000C76' />
              <stop offset='1' stopColor='#63A0C4' />
            </linearGradient>
          </defs>
        </svg>
      </div>
      <div className='font-medium text-[#000C76]'></div>
    </div>
  );
};

export default CustomSpinner;
