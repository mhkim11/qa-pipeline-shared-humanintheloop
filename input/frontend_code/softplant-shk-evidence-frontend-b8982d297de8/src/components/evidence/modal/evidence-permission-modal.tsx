import { useState, useEffect } from 'react';

import { IoIosWarning, IoMdCloseCircle } from 'react-icons/io';

import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { onMessageToast } from '@/components/utils';
import { useJoinProjectRequest, useSuperPermissionRequest } from '@/hooks/react-query/mutation/evidence';
type TPermissionModalProps = {
  isOpen: boolean;
  selectedItems: Array<{ project_id: string; project_nm: string; project_role: string }>;
  onClose: () => void;
  onSubmit: (permissions: { [key: string]: string }) => void;
};

type TItem = {
  project_id: string;
  project_nm: string;
  project_role: string;
};
export const PermissionModal = ({ isOpen, selectedItems, onClose, onSubmit }: TPermissionModalProps) => {
  const [items, setItems] = useState<TItem[]>(selectedItems); // 상태 타입 지정
  const [itemsWithPermission, setItemsWithPermission] = useState<TItem[]>([]); // 권한 보유 사건
  const [itemsWithoutPermission, setItemsWithoutPermission] = useState<TItem[]>([]); // 권한 미보유 사건
  const [permissions, setPermissions] = useState<{ [key: string]: string }>({});

  console.log('items', items);
  // ! api 호출
  const { onRequestJoinProject } = useJoinProjectRequest();
  const { onRequestSuperPermission } = useSuperPermissionRequest();
  useEffect(() => {
    // 권한 보유 사건과 미보유 사건으로 분리
    setItemsWithPermission(selectedItems.filter((item) => item.project_role === '일반권한'));
    setItemsWithoutPermission(selectedItems.filter((item) => item.project_role !== '일반권한'));
  }, [selectedItems]);
  // 모달이 열릴 때마다 items 상태 초기화
  useEffect(() => {
    setItems(selectedItems);
  }, [selectedItems]);
  useEffect(() => {
    // 보통권한 보유 사건에 대해 기본적으로 슈퍼권한으로 설정
    const initialPermissions = itemsWithPermission.reduce(
      (acc, item) => ({
        ...acc,
        [item.project_id]: '사건관리자권한',
      }),
      {},
    );
    setPermissions(initialPermissions);
  }, [itemsWithPermission]);
  const handleChange = (id: any, value: string) => {
    setPermissions((prev) => ({ ...prev, [id]: value }));
  };

  const handleDelete = (id: any, isWithPermission: boolean) => {
    if (isWithPermission) {
      setItemsWithPermission((prev) => prev.filter((item) => item.project_id !== id));
    } else {
      setItemsWithoutPermission((prev) => prev.filter((item) => item.project_id !== id));
    }
  };
  const handleSubmit = async () => {
    try {
      // 보통권한 보유 사건 중 슈퍼권한 요청
      const superPermissionRequests = itemsWithPermission
        .filter((item) => permissions[item.project_id] === '사건관리자권한')
        .map((item) => ({
          project_id: item.project_id,
        }));

      // 권한 미보유 사건 요청
      const normalRequests = itemsWithoutPermission
        .filter((item) => permissions[item.project_id])
        .map((item) => ({
          project_id: item.project_id,
          requested_role: permissions[item.project_id],
        }));

      if (superPermissionRequests.length === 0 && normalRequests.length === 0) {
        onMessageToast({
          message: `선택된 권한이 없습니다`,
          icon: <IoIosWarning className='h-5 w-5 text-yellow-500' />,
        });
        return;
      }

      // 슈퍼권한 요청이 있는 경우
      for (const request of superPermissionRequests) {
        const superResponse = await onRequestSuperPermission({
          project_id: request.project_id,
        });
        if (!superResponse?.success) {
          throw new Error(superResponse?.message || '이미 권한요청건이 있습니다.');
        }
      }

      // 일반 권한 요청이 있는 경우
      if (normalRequests.length > 0) {
        const normalResponse = await onRequestJoinProject({
          projects: normalRequests,
        });
        if (!normalResponse?.success) {
          throw new Error(normalResponse?.message || '이미 권한요청건이 있습니다.');
        }
      }

      onMessageToast({
        message: `권한 요청이 완료되었습니다.`,
      });
      onSubmit(permissions);
      onClose();
    } catch (error: any) {
      onMessageToast({
        message: error?.message || '예기치 못한 오류가 발생했습니다.',
        icon: <IoIosWarning className='h-5 w-5 text-yellow-500' />,
      });
    }
  };
  useEffect(() => {
    const initialPermissionsForNonPermission = itemsWithoutPermission.reduce(
      (acc, item) => ({
        ...acc,
        [item.project_id]: '일반권한',
      }),
      {},
    );

    setPermissions((prev) => ({
      ...prev,
      ...initialPermissionsForNonPermission,
    }));
  }, [itemsWithoutPermission]);
  if (!isOpen) return null;
  return (
    <div className='fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50'>
      <div className='max-h-[80vh] w-[601px] overflow-auto rounded-[16px] border-3 border-[#737980] bg-[#fff] p-[32px]'>
        <h2 className='text-[24px] font-bold'>권한 요청</h2>

        <div className=''>
          {/* 권한 보유 사건 */}
          {itemsWithPermission.length > 0 && (
            <>
              <div className='mt-[24px] border-b border-[#F1F1F1]'></div>
              <div>
                <div className='flex w-full'>
                  <div className='w-full'>
                    <h3 className='mt-[32px] text-[18px] font-bold'>일반권한 보유 사건</h3>
                    {itemsWithPermission.map((item) => (
                      <div key={item.project_id} className='mt-[16px] flex h-[66px] w-full items-start rounded-[8px] bg-[#F4FAFD] p-[12px]'>
                        <span className='min-w-[320px] max-w-[320px] truncate'>{item.project_nm}</span>
                        <div>
                          <div className='text-[16px]'>현재 권한 : 일반권한</div>
                          <div className='text-[16px] text-[#0050B3]'>요청 권한 : 사건관리자</div>
                        </div>
                        <button className='ml-[18px] h-[30px] text-[#666]' onClick={() => handleDelete(item.project_id, true)}>
                          <IoMdCloseCircle className='text-xl' />
                        </button>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </>
          )}

          {/* 권한 미보유 사건 */}
          {itemsWithoutPermission.length > 0 && (
            <>
              <div className='mt-[32px] border-b border-[#f1f1f1]'></div>
              <div>
                <div className='mt-[32px] flex w-full bg-white'>
                  <div className='w-full'>
                    <h3 className='text-[18px] font-bold'>권한 미보유 사건</h3>
                    {itemsWithoutPermission.map((item) => (
                      <div key={item.project_id} className='mt-[16px] flex w-full items-center rounded-[8px] bg-[#F4FAFD] p-[12px]'>
                        <span className='max-w-[400px] truncate'>{item.project_nm}</span>
                        <Select
                          onValueChange={(value) => handleChange(item.project_id, value)}
                          defaultValue={permissions[item.project_id] || '일반권한'}
                        >
                          <SelectTrigger className='ml-auto h-[48px] w-[125px] rounded-md border border-[#c2c2c2] p-2 text-xs'>
                            <SelectValue placeholder='권한 선택' />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value='일반권한'>일반권한</SelectItem>
                            <SelectItem value='사건관리자권한'>사건관리자권한</SelectItem>
                          </SelectContent>
                        </Select>
                        <button className='ml-[18px] h-[30px] text-[#666]' onClick={() => handleDelete(item.project_id, false)}>
                          <IoMdCloseCircle className='text-xl' />
                        </button>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </>
          )}
        </div>

        <div className='mt-[24px] border-b border-[#f1f1f1]'></div>
        <div className='mt-[24px] flex justify-center space-x-[8px]'>
          <button className='h-[48px] w-[132px] rounded-lg bg-[#0050B3] text-white' onClick={handleSubmit}>
            권한 요청
          </button>
          <button className='h-[48px] w-[132px] rounded-lg border border-[#DBDBDB]' onClick={onClose}>
            취소
          </button>
        </div>
      </div>
    </div>
  );
};
