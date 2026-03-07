import { useEffect, useRef, useState } from 'react';

const Home = new URL('/src/assets/images/home.svg', import.meta.url).href;

import { IoIosWarning, IoMdCheckmarkCircle } from 'react-icons/io';
import { useNavigate, useSearchParams } from 'react-router-dom';

import { onMessageToast } from '@/components/utils';

export const DemoMainHeader = () => {
  const navigate = useNavigate();

  const [isSettingDropdownOpen, setIsSettingDropdownOpen] = useState(false); // 설정 드롭다운 상태
  const dropdownRef = useRef<HTMLDivElement>(null);

  const settingIconRef = useRef<HTMLImageElement>(null); // 설정 아이콘 ref 추가
  const [searchParams] = useSearchParams();
  const projectName = searchParams.get('project_name');
  const projectId = searchParams.get('project_id');

  const clientName = searchParams.get('client_name') || '';

  const [isEditing, setIsEditing] = useState(false);
  const [editedProjectName, setEditedProjectName] = useState(projectName || '');
  const [editedClientName, setEditedClientName] = useState('');

  const officeName = '';

  const isPending = false;

  const handleSave = async () => {
    if (!projectId || !editedProjectName.trim()) {
      onMessageToast({
        message: '사건명을 입력해주세요.',
        icon: <IoIosWarning className='h-5 w-5 text-yellow-500' />,
      });
      return;
    }

    // DEMO: 서버 저장 없이 URL query만 업데이트
    const newSearchParams = new URLSearchParams(searchParams);
    newSearchParams.set('project_name', editedProjectName.trim());
    newSearchParams.set('client_name', editedClientName.trim());
    navigate(`?${newSearchParams.toString()}`);
    setIsEditing(false);

    onMessageToast({
      message: '사건 정보(표시)가 수정되었습니다.',
      icon: <IoMdCheckmarkCircle className='h-5 w-5 text-green-500' />,
    });
  };

  const handleCancel = () => {
    setIsEditing(false);
    setEditedProjectName(projectName || '');
    setEditedClientName(clientName || '');
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      handleSave();
    } else if (e.key === 'Escape') {
      handleCancel();
    }
  };
  const getPageTitle = () => {
    switch (location.pathname) {
      case '/notifications':
        return '알림';
      case '/payment':
        return '결제관리';
      case '/':
        return '사건목록';
      default:
        return projectName || officeName;
    }
  };
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      // 드롭다운이 열려 있고, 클릭된 대상이 드롭다운 메뉴 자체와 설정 아이콘 둘 다의 외부인 경우에만 닫습니다.
      if (
        isSettingDropdownOpen &&
        dropdownRef.current &&
        !dropdownRef.current.contains(event.target as Node) && // 드롭다운 메뉴 외부 클릭
        settingIconRef.current &&
        !settingIconRef.current.contains(event.target as Node) // 설정 아이콘 외부 클릭
      ) {
        setIsSettingDropdownOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [isSettingDropdownOpen]);

  return (
    <div className='fixed z-50 w-full'>
      <div className='flex h-[70px] items-center justify-center border-b border-[#E5E5E5] bg-white'>
        <div id='evidence-table-body' className='flex min-w-[90%] items-center'>
          {projectName ? (
            <>
              <div className='group relative ml-4 flex items-center lg:ml-0'>
                <div className='absolute bottom-[-40px] left-[50%] hidden h-[36px] w-[80px] -translate-x-1/2 rounded-md border border-[#e5e5e5] bg-white text-center text-[14px] leading-[36px] text-[#666] shadow-lg group-hover:block'>
                  사건목록
                </div>
              </div>
              <div className='ml-4 hidden w-full items-center text-[10px] font-bold lg:flex lg:text-[28px]'>
                {isEditing ? (
                  <div className='flex items-center'>
                    <div className='mr-4'>
                      <input
                        type='text'
                        value={editedProjectName}
                        onChange={(e) => setEditedProjectName(e.target.value)}
                        onKeyDown={handleKeyDown}
                        className='min-w-[400px] max-w-[400px] overflow-hidden text-ellipsis whitespace-nowrap rounded border border-gray-300 px-2 py-1 text-[16px] font-bold focus:border-blue-500 focus:outline-none lg:min-w-[200px] lg:text-[24px]'
                        autoFocus
                        maxLength={50}
                        placeholder='사건명을 입력하세요'
                      />
                    </div>
                    <div className='mr-4'>
                      <input
                        type='text'
                        value={editedClientName}
                        onChange={(e) => setEditedClientName(e.target.value)}
                        onKeyDown={handleKeyDown}
                        className='min-w-[200px] max-w-[200px] overflow-hidden text-ellipsis whitespace-nowrap rounded border border-gray-300 px-2 py-1 font-bold focus:border-blue-500 focus:outline-none lg:text-[24px]'
                        maxLength={30}
                        placeholder='의뢰인명을 입력하세요'
                      />
                    </div>
                    <div className='flex items-end'>
                      <button
                        onClick={handleSave}
                        className='mr-2 h-[40px] w-[60px] rounded bg-[#0050B3] text-sm text-white hover:bg-blue-600'
                      >
                        {isPending ? '저장중...' : '저장'}
                      </button>
                      <button onClick={handleCancel} className='h-[40px] w-[60px] rounded border border-gray-300 text-sm hover:bg-gray-100'>
                        취소
                      </button>
                    </div>
                  </div>
                ) : (
                  <>
                    <div className='flex items-center'>
                      <div className='mr-2 overflow-hidden truncate whitespace-nowrap lg:max-w-[500px]'>{projectName}</div>
                      {clientName && (
                        <>
                          <div className='mx-2 text-gray-400'>|</div>
                          <div className='mr-2 overflow-hidden truncate whitespace-nowrap text-gray-600 lg:max-w-[300px]'>{clientName}</div>
                        </>
                      )}
                      {/*  <div className='group relative hidden lg:block'>
                        <FiEdit3 className='cursor-pointer text-[20px]' onClick={handleEditClick} />
                        <div className='absolute bottom-[-40px] left-[50%] hidden h-[36px] w-[80px] -translate-x-1/2 rounded-md border border-[#e5e5e5] bg-white text-center text-[14px] leading-[36px] text-[#666] shadow-lg group-hover:block'>
                          수정하기
                        </div>
                      </div> */}
                    </div>
                  </>
                )}
              </div>
            </>
          ) : (
            <div className='flex w-full items-center'>
              <div className='group relative'>
                <div className='flex h-[40px] w-[40px] cursor-pointer items-center justify-center rounded-full border border-[#c2c2c2] p-[6px]'>
                  <img src={Home} alt='home' className='' />
                </div>
                <div className='absolute bottom-[-60px] left-[-10px] hidden h-[36px] w-[80px] -translate-y-1/2 rounded-md border border-[#e5e5e5] bg-white text-center leading-[36px] text-[#666] shadow-lg group-hover:block'>
                  사건목록
                </div>
              </div>
              <div className='ml-4 flex w-full items-center text-[28px] font-bold'>
                <div className='mr-[12px] h-[24px] w-0 border-l border-[#c2c2c2]'></div>
                {getPageTitle()}
              </div>
            </div>
          )}
          <div
            className='flex h-[40px] w-[160px] cursor-pointer items-center justify-center rounded-[8px] bg-[#004AA4] text-[14px] text-white hover:bg-[#003B82]'
            onClick={() => window.open('https://www.notion.so/AiLex-1f362a7535ba8262a58e0136a01f67be', '_blank')}
          >
            Ailex 설명서 보기
          </div>
        </div>
      </div>
    </div>
  );
};
