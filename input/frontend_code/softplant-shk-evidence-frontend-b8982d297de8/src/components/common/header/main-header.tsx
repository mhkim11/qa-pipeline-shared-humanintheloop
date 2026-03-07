import { useEffect, useRef, useState } from 'react';

const Gear = new URL('/src/assets/images/setting.svg', import.meta.url).href;
const Bell = new URL('/src/assets/images/bell.svg', import.meta.url).href;
const Home = new URL('/src/assets/images/home.svg', import.meta.url).href;
import { delay } from 'lodash-es';
import { FiEdit3, FiUser } from 'react-icons/fi';
import { IoMdArrowRoundUp, IoIosWarning, IoMdCheckmarkCircle } from 'react-icons/io';
import { MdLogout } from 'react-icons/md';
import { PiMonitorLight } from 'react-icons/pi';
import { useNavigate, useSearchParams } from 'react-router-dom';

import { useFindUserInfo } from '@query/query';
import { NotificationsModal } from '@/components/evidence/modal/evidence-notification-modal';
import { onMessageToast } from '@/components/utils';
import { useUnreadNotificationCount } from '@/hooks/react-query';
import { useModifyProject } from '@/hooks/react-query/mutation/evidence/use-modify-project';
// import { fetchCreateEvidenceUserUnAuth } from '@/apis/evidence-api';
// import { IoIosNotificationsOutline } from "react-icons/io";
import { useLoginStore } from '@/hooks/stores';

export const MainHeader = () => {
  const navigate = useNavigate();

  const [isSettingDropdownOpen, setIsSettingDropdownOpen] = useState(false); // 설정 드롭다운 상태
  const dropdownRef = useRef<HTMLDivElement>(null);
  const userIconRef = useRef<HTMLDivElement>(null);
  const settingIconRef = useRef<HTMLImageElement>(null); // 설정 아이콘 ref 추가
  const [isNotificationModalOpen, setIsNotificationModalOpen] = useState(false);
  const { dispatchLogin } = useLoginStore();
  const [searchParams] = useSearchParams();
  const projectName = searchParams.get('project_name');
  const projectId = searchParams.get('project_id');

  const clientName = searchParams.get('client_name') || '';

  const [isEditing, setIsEditing] = useState(false);
  const [editedProjectName, setEditedProjectName] = useState(projectName || '');
  const [editedClientName, setEditedClientName] = useState('');

  // 유저정보 가져오기
  const { response: findEvidenceUserInfo } = useFindUserInfo();
  const fontSizeAdjustment = findEvidenceUserInfo?.data?.font_size_rate || 0;
  const userImg = findEvidenceUserInfo?.data?.thumbnail_url || '';
  const officeName = findEvidenceUserInfo?.data?.office_nm || '';
  // 알림 개수 가져오기
  const { response: unreadNotificationResponse } = useUnreadNotificationCount();
  const unreadCount = unreadNotificationResponse?.data?.count ?? 0;

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

  // 동적 폰트 크기 조정
  const getAdjustedSize = (baseSize: number) => {
    return baseSize * (1 + fontSizeAdjustment / 100);
  };
  const colorPalette = {
    green: '#406CFF',
    brown: '#B6753F',
    orange: '#FF6B1B',
    yellow: '#F3AA00',
    lightgreen: '#3BBC07',
    darkgreen: '#799C19',
    skyblue: '#43A5FF',
    purple: '#AC58FF',
    pink: '#E739D5',
  };
  const getUserColor = (color: string) => {
    return colorPalette[color as keyof typeof colorPalette] || color;
  };
  const { onModifyProject, isPending } = useModifyProject();
  // 알림 모달 토글 함수
  const toggleNotificationModal = () => {
    setIsNotificationModalOpen(!isNotificationModalOpen);
  };

  const handleSave = async () => {
    if (!projectId || !editedProjectName.trim()) {
      onMessageToast({
        message: '사건명을 입력해주세요.',
        icon: <IoIosWarning className='h-5 w-5 text-yellow-500' />,
      });
      return;
    }

    const result = await onModifyProject({
      project_id: projectId,
      project_nm: editedProjectName.trim(),
      client_nm: editedClientName.trim() || undefined,
    });

    if (result?.isSuccess) {
      const newSearchParams = new URLSearchParams(searchParams);
      newSearchParams.set('project_name', editedProjectName.trim());
      if (editedClientName.trim()) {
        newSearchParams.set('client_name', editedClientName.trim());
      }
      navigate(`?${newSearchParams.toString()}`);
      localStorage.setItem('project_name_updated', 'true');
      localStorage.setItem('updated_project_id', projectId);
      setIsEditing(false);
    }

    onMessageToast({
      message: result?.isSuccess ? '사건 정보가 수정되었습니다.' : '사건 정보 수정에 실패했습니다.',
      icon: result?.isSuccess ? (
        <IoMdCheckmarkCircle className='h-5 w-5 text-green-500' />
      ) : (
        <IoIosWarning className='h-5 w-5 text-yellow-500' />
      ),
    });
  };

  const handleListClick = () => {
    navigate('/');
  };
  const handleEditClick = () => {
    setIsEditing(true);
    setEditedProjectName(projectName || '');
    setEditedClientName(clientName || '');
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
      case '/settings':
        return '설정';
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
                <div
                  className={`flex h-[40px] w-[40px] cursor-pointer items-center justify-center rounded-full border font-bold ${getFontSizeClass(16, fontSizeAdjustment)}`}
                  style={{ fontSize: `${getAdjustedSize(16)}px` }}
                  onClick={handleListClick}
                >
                  <IoMdArrowRoundUp className='text-2xl' />
                </div>
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
                      <div className='group relative hidden lg:block'>
                        <FiEdit3 className='cursor-pointer text-[20px]' onClick={handleEditClick} />
                        <div className='absolute bottom-[-40px] left-[50%] hidden h-[36px] w-[80px] -translate-x-1/2 rounded-md border border-[#e5e5e5] bg-white text-center text-[14px] leading-[36px] text-[#666] shadow-lg group-hover:block'>
                          수정하기
                        </div>
                      </div>
                    </div>
                  </>
                )}
              </div>
            </>
          ) : (
            <div className='flex w-full items-center'>
              <div className='group relative'>
                <div
                  className='flex h-[40px] w-[40px] cursor-pointer items-center justify-center rounded-full border border-[#c2c2c2] p-[6px]'
                  onClick={handleListClick}
                >
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

          <div className='ml-4 flex w-full items-center justify-end lg:ml-0'>
            <div className='relative mr-2'>
              <div className='relative mr-2 cursor-pointer' onClick={toggleNotificationModal}>
                <div className='group relative'>
                  <img src={Bell} alt='bell' className='h-[36px] w-[36px]' />
                  {/* 알림 개수 */}
                  {unreadCount > 0 && (
                    <div className='absolute -right-0.5 -top-1 flex h-5 w-5 items-center justify-center rounded-full bg-red-500 text-[12px] font-bold text-white'>
                      {unreadCount}
                    </div>
                  )}
                  <div className='absolute bottom-[-40px] left-[50%] hidden h-[36px] w-[53px] -translate-x-1/2 rounded-md border border-[#e5e5e5] bg-white text-center text-[14px] leading-[36px] text-[#666] shadow-lg group-hover:block'>
                    알림
                  </div>
                </div>
              </div>
              {isNotificationModalOpen && (
                <NotificationsModal isOpen={isNotificationModalOpen} onClose={() => setIsNotificationModalOpen(false)} />
              )}
            </div>
            <span className='ml-1 cursor-pointer'>
              <div className='group relative'>
                <img
                  src={Gear}
                  alt='gear'
                  className='h-[36px] w-[36px]'
                  onClick={() => setIsSettingDropdownOpen(!isSettingDropdownOpen)} // 클릭 이벤트 추가
                  ref={settingIconRef} // 설정 아이콘 ref 할당
                />
                <div className='absolute bottom-[-40px] left-[50%] hidden h-[36px] w-[53px] -translate-x-1/2 rounded-md border border-[#e5e5e5] bg-white text-center text-[14px] leading-[36px] text-[#666] shadow-lg group-hover:block'>
                  설정
                </div>
              </div>
              {/* 설정 드롭다운 메뉴 추가 */}
              {isSettingDropdownOpen && (
                <div
                  ref={dropdownRef}
                  className='absolute right-10 top-14 z-10 w-[132px] rounded-[8px] border border-[#E5E5E5] bg-white shadow-lg lg:right-20'
                >
                  <div className='flex flex-col'>
                    <button
                      className='flex h-[44px] w-full items-center pl-[16px] text-[14px] text-[#666] hover:bg-[#F5F5F5]'
                      onClick={() => {
                        navigate('/settings');
                        setIsSettingDropdownOpen(false);
                      }}
                    >
                      <FiUser className='mr-2 text-xl text-[#666666]' />
                      설정
                    </button>
                    <button
                      className='flex h-[44px] w-full items-center border-b border-[#E5E5E5] pl-[16px] text-[14px] text-[#666666] hover:bg-[#F5F5F5]'
                      onClick={() => {
                        navigate('/payment');
                        /*   onMessageToast({
                          message: '결제관리 기능은 준비중입니다.',
                          icon: <IoIosWarning className='h-5 w-5 text-yellow-500' />,
                        });
                        setIsSettingDropdownOpen(false); */
                      }}
                    >
                      <PiMonitorLight className='mr-2 text-xl text-[#666666]' />
                      결제관리
                    </button>
                    <button
                      className='flex h-[44px] w-full items-center pl-[16px] text-[14px] text-[#666666] hover:bg-[#F5F5F5]'
                      onClick={async (): Promise<void> => {
                        navigate('/logout', { replace: true });
                        delay(() => {
                          dispatchLogin({ type: 'LOGOUT' });
                        }, 5);
                      }}
                    >
                      <span className='flex items-center text-[14px] text-[#F5222D]'>
                        <MdLogout className='mr-2 text-xl text-[#F5222D]' />
                        로그아웃
                      </span>
                    </button>
                  </div>
                </div>
              )}
            </span>
            <div className='relative cursor-pointer'>
              {userImg !== '' ? (
                <div className='relative ml-4 flex h-[38px] w-[38px]' ref={userIconRef}>
                  <img src={userImg} alt='user' className='h-full w-full rounded-full' />
                  <div
                    className='absolute top-0 h-[38px] w-[38px] rounded-full border-2'
                    style={{
                      borderColor: getUserColor(findEvidenceUserInfo?.data?.user_color || '') as keyof typeof colorPalette,
                    }}
                  ></div>
                </div>
              ) : (
                <div
                  style={{ backgroundColor: getUserColor(findEvidenceUserInfo?.data?.user_color || '') as keyof typeof colorPalette }}
                  className='ml-4 flex h-[38px] w-[38px] cursor-pointer items-center justify-center rounded-full text-[20px] font-bold text-[#fff]'
                  ref={userIconRef}
                >
                  {
                    findEvidenceUserInfo?.data?.nickname
                      ? findEvidenceUserInfo.data.nickname.charAt(0) // 닉네임 있으면 첫번째 글자
                      : findEvidenceUserInfo?.data?.name?.slice(1, 2) || '' // 닉네임 없으면 이름의 두번째 글자
                  }
                </div>
              )}
            </div>
          </div>
          {/* 드롭다운 메뉴 */}
        </div>
      </div>
    </div>
  );
};
