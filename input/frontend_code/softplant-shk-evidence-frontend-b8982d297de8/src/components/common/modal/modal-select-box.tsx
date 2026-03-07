import { useState } from 'react';

import { Select, SelectContent, SelectItem, SelectTrigger } from '@/components/ui/select';

interface IModalProps {
  storageMessage: string;
  sendMessage: string;
  handleSave: () => void;
  setIsModalOpen: () => void;
  members: Array<{
    user_id: string;
    name: string;
    role: string;
    thumbnail_url?: string;
    user_color: string;
  }>;
  onSelectMember: (userId: string) => void;
  confirmButtonText?: string; // 추가
}

const ModalSelect = ({
  confirmButtonText = '확인',
  sendMessage,
  storageMessage,
  setIsModalOpen,
  handleSave,
  members,
  onSelectMember,
}: IModalProps) => {
  const [selectedUserId, setSelectedUserId] = useState<string>('');

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

  const selectedUser = members.find((member) => member.user_id === selectedUserId);

  return (
    <div className='fixed inset-0 z-50 flex items-center justify-center'>
      <div className='absolute inset-0 h-auto bg-gray-500 opacity-75' />
      <div className='z-10 w-[330px] rounded-lg bg-[#fff] p-4 shadow-xl lg:h-auto'>
        <div className='mt-4'>
          <p className='pt-4 text-center text-[18px] font-semibold lg:pt-6'>{sendMessage}</p>
          <p className='mb-4 pt-4 text-center text-[14px]'>{storageMessage}</p>
        </div>
        <div>
          <Select
            value={selectedUserId}
            onValueChange={(value) => {
              setSelectedUserId(value);
              onSelectMember(value);
            }}
          >
            <SelectTrigger className='h-[40px] w-full text-[14px]'>
              {selectedUser ? (
                <div className='flex items-center'>
                  {selectedUser.thumbnail_url ? (
                    <div className='h-[24px] w-[24px] rounded-full border-2' style={{ borderColor: getUserColor(selectedUser.user_color) }}>
                      <img src={selectedUser.thumbnail_url} alt='profile' className='h-full w-full rounded-full' />
                    </div>
                  ) : (
                    <div
                      style={{ backgroundColor: getUserColor(selectedUser.user_color) }}
                      className='flex h-[24px] w-[24px] items-center justify-center rounded-full text-[13px] text-white'
                    >
                      {selectedUser.name.slice(1, 2)}
                    </div>
                  )}
                  <div className='ml-2'>
                    <p className='text-[14px]'>{selectedUser.name}</p>
                  </div>
                </div>
              ) : (
                '관리자 선택'
              )}
            </SelectTrigger>
            <SelectContent>
              {members.map((member) => (
                <SelectItem key={member.user_id} value={member.user_id}>
                  <div className='flex items-center'>
                    {member.thumbnail_url ? (
                      <div className='h-[24px] w-[24px] rounded-full border-2' style={{ borderColor: getUserColor(member.user_color) }}>
                        <img src={member.thumbnail_url} alt='profile' className='h-full w-full rounded-full' />
                      </div>
                    ) : (
                      <div
                        style={{ backgroundColor: getUserColor(member.user_color) }}
                        className='flex h-[24px] w-[24px] items-center justify-center rounded-full text-[13px] text-white'
                      >
                        {member.name.slice(1, 2)}
                      </div>
                    )}
                    <div className='ml-2'>
                      <p className='text-[14px]'>{member.name}</p>
                    </div>
                  </div>
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
        <div className='mb-2 mt-4 flex justify-center'>
          <button
            className='h-[48px] w-full rounded-lg bg-[#0050B3] text-white hover:bg-sky-700'
            onClick={handleSave}
            disabled={!selectedUserId}
          >
            {confirmButtonText}
          </button>
          <button
            className='ml-4 h-[48px] w-full rounded-lg border border-[#DBDBDB] bg-[#fff] text-[#373737] hover:bg-gray-50'
            onClick={() => setIsModalOpen()}
          >
            취소
          </button>
        </div>
      </div>
    </div>
  );
};

export default ModalSelect;
