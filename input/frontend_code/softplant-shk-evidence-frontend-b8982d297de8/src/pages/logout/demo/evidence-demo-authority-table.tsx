import { useMemo } from 'react';

import { IoIosWarning } from 'react-icons/io';
import { TbChessQueenFilled } from 'react-icons/tb';
import { useSearchParams } from 'react-router-dom';

import { Select, SelectContent, SelectItem, SelectTrigger } from '@/components/ui/select';
import { onMessageToast } from '@/components/utils';

type TDemoMember = {
  user_id: string;
  name: string;
  nickname: string;
  user_color: string;
  role: '사건관리자권한' | '일반권한';
  thumbnail_url?: string;
  isMe?: boolean;
};

export const DemoAuthorityTable = (): JSX.Element => {
  const [searchParams] = useSearchParams();
  const projectName = searchParams.get('project_name') || '데모 사건';

  const fontSizeAdjustment = 0;
  const fontSizeClasses = {
    18: ['text-base', 'text-lg', 'text-xl', 'text-2xl', 'text-3xl', 'text-4xl', 'text-5xl'],
    16: ['text-sm', 'text-base', 'text-lg', 'text-xl', 'text-2xl', 'text-3xl', 'text-4xl'],
    14: ['text-xs', 'text-sm', 'text-base', 'text-lg', 'text-xl', 'text-2xl', 'text-3xl'],
    12: ['text-2xs', 'text-xs', 'text-sm', 'text-base', 'text-lg', 'text-xl', 'text-2xl'],
  } as const;
  const getFontSizeClass = (baseSize: keyof typeof fontSizeClasses, adjustment: number) => {
    const steps = [-30, -20, -10, 0, 10, 20, 30];
    const index = steps.indexOf(adjustment);
    return fontSizeClasses[baseSize][index !== -1 ? index : 3];
  };
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

  const members: TDemoMember[] = useMemo(
    () => [
      {
        user_id: 'demo_user_ailex',
        name: 'Ailex',
        nickname: 'A',
        user_color: 'green',
        role: '사건관리자권한',
        thumbnail_url: '',
        isMe: true,
      },
    ],
    [],
  );

  return (
    <div className='flex min-h-screen justify-center bg-[#F5F5F5] px-4 pt-[200px] lg:pt-[270px]'>
      <div className='w-full max-w-[606px]'>
        <div className='mb-10 min-h-[320px] w-full rounded-[16px] bg-white lg:min-h-[420px]'>
          <div className='rounded-[16px] bg-white pb-10'>
            <div className='flex items-center justify-between p-4 lg:p-[23px]'>
              <h1
                className={`font-semibold text-[#545454] ${getFontSizeClass(18, fontSizeAdjustment)}`}
                style={{ fontSize: `${getAdjustedSize(18)}px` }}
              >
                참여중인 멤버
              </h1>

              <button
                type='button'
                className='h-[48px] w-[133px] rounded-[8px] bg-[#004AA4] text-[16px] font-medium text-white lg:h-[48px] lg:text-[16px]'
                onClick={() => {
                  onMessageToast({
                    message: '데모에서는 멤버 초대를 지원하지 않습니다.',
                    icon: <IoIosWarning className='h-5 w-5 text-yellow-500' />,
                  });
                }}
              >
                초대하기
              </button>
            </div>

            {members.map((member) => (
              <div
                key={member.user_id}
                className='flex min-h-[64px] items-center border-b border-gray-100 px-4 py-2 text-[#545454] lg:h-[64px] lg:px-0 lg:py-0'
              >
                <div className='flex w-full items-center pl-0 lg:pl-[30px]'>
                  <div className='flex h-[24px] w-[24px] items-center justify-center rounded-full border'>
                    {member.thumbnail_url ? (
                      <div className='h-[24px] w-[24px] rounded-full border-2' style={{ borderColor: getUserColor(member.user_color) }}>
                        <img src={member.thumbnail_url} alt='profile' className='h-full w-full rounded-full' />
                      </div>
                    ) : (
                      <div
                        style={{ backgroundColor: getUserColor(member.user_color) }}
                        className='flex h-full w-full items-center justify-center rounded-full text-[13px] text-white'
                      >
                        {member.nickname ? member.nickname.charAt(0) : member.name ? member.name.charAt(0) : 'A'}
                      </div>
                    )}
                  </div>

                  <div className='flex w-full flex-col items-start justify-between gap-2 lg:flex-row lg:items-center lg:gap-0'>
                    <div className='flex w-full items-center'>
                      <div className='flex w-full items-center'>
                        <div
                          className={`ml-[8px] ${getFontSizeClass(16, fontSizeAdjustment)}`}
                          style={{ fontSize: `${getAdjustedSize(16)}px` }}
                        >
                          {member.name}
                        </div>

                        {member.isMe && (
                          <div className='ml-[8px] flex h-[26px] w-[26px] items-center justify-center rounded-full bg-[#F5F5F5] text-[10px] lg:text-[12px]'>
                            나
                          </div>
                        )}

                        {member.role === '사건관리자권한' && (
                          <div className='ml-[8px] flex h-[26px] w-[70px] items-center justify-center rounded-full bg-[#545454] text-[10px] text-white lg:w-[96px] lg:text-[12px]'>
                            <TbChessQueenFilled className='mr-1 text-[12px]' />
                            사건관리자
                          </div>
                        )}
                      </div>
                    </div>

                    <div className='mr-0 flex w-full items-center justify-start lg:mr-[30px] lg:w-[240px] lg:justify-end'>
                      <Select
                        defaultValue={member.role}
                        onValueChange={(value) => {
                          if (value === 'leave') {
                            onMessageToast({
                              message: `데모에서는 '${projectName}' 사건에서 나가기를 지원하지 않습니다.`,
                              icon: <IoIosWarning className='h-5 w-5 text-yellow-500' />,
                            });
                          }
                        }}
                      >
                        <SelectTrigger className='h-[40px] w-[150px] text-[14px] lg:w-full'>{member.role}</SelectTrigger>
                        <SelectContent>
                          <SelectItem value='leave'>사건에서 나가기</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};
