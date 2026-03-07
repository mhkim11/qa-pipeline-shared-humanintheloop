import { Link } from 'react-router-dom';

const MainBg = new URL('/src/assets/images/mainBg.svg', import.meta.url).href;
const Logo = new URL('/src/assets/images/logo_w.svg', import.meta.url).href;
import { cn } from '@/lib/utils';

type TLoginSidebarProps = {
  text: string;
  isMd?: boolean;
};

export const LoginSidebar = ({ text, isMd = false }: TLoginSidebarProps) => {
  return (
    <div
      className={cn(
        'flex hidden w-full flex-col items-center bg-white opacity-90',
        isMd ? 'bg-[#3E84DA] md:flex md:h-screen md:min-h-screen md:w-2/3' : 'bg-[#3E84DA] lg:flex lg:h-screen lg:min-h-screen lg:w-2/3',
      )}
    >
      <div className='md:ml-[50px] md:mt-[100px] 2xl:mt-[200px]'>
        <div className={cn('', isMd ? '' : '')}>
          <Link to='/'>
            <div className={cn('', isMd ? '' : '')}>
              <img src={Logo} alt='logo' className='' />
            </div>
          </Link>
        </div>
        <div className={cn('mt-[40px] whitespace-pre-line pr-8 font-medium text-white 2xl:text-[20px]', isMd ? '' : 'lg:text-[20px]')}>
          {text}
        </div>
        <div className='flex flex-col items-center 2xl:mt-[45px]'>
          <img src={MainBg} alt='mainBg' className='2xl:h-[100%] 2xl:w-[100%]' />
        </div>
      </div>
    </div>
  );
};
