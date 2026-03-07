import { IoIosWarning, IoMdCheckmarkCircle } from 'react-icons/io';

import { onMessageToast } from '@/components/utils';
import { useJoinRequestList, useProcessJoinRequest } from '@/hooks/react-query';
type TPermissionListModalProps = {
  isOpen: boolean;

  onClose: () => void;
};
// ! 권한 요청 리스트 모달
export const PermissionListModal = ({ isOpen, onClose }: TPermissionListModalProps) => {
  // 초기 리스트 API
  const { response: RequestlistEvidenceOutput, refetch } = useJoinRequestList({
    block_cnt: 10,
    page_no: 1,
    status: 'PENDING',
  });

  // 승인 API 훅
  const { onProcessJoinRequest, isPending } = useProcessJoinRequest();

  const handleApprove = async (request_id: string) => {
    try {
      const response = await onProcessJoinRequest({ request_id, status: 'APPROVED' });
      if (response?.success) {
        onMessageToast({
          message: '승인되었습니다.',
          icon: <IoMdCheckmarkCircle className='h-5 w-5 text-yellow-500' />,
        });
        refetch();
      } else {
        onMessageToast({
          message: '승인에 실패했습니다.',
          icon: <IoIosWarning className='h-5 w-5 text-yellow-500' />,
        });
      }
    } catch (error) {
      onMessageToast({
        message: '승인에 실패했습니다.',
        icon: <IoIosWarning className='h-5 w-5 text-yellow-500' />,
      });
      console.error(error);
    }
  };

  if (!isOpen) return null;
  return (
    <div className='fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50'>
      <div className='w-[800px] rounded-lg border-3 border-[#737980] bg-[#EFFBFF] p-10'>
        <h2 className='mb-4 text-[30px] font-bold'>사건 권한 요청</h2>
        <div className='px-4 sm:px-6 lg:px-8'>
          <div className='mt-8 flow-root'>
            <div className='-mx-4 -my-2 sm:-mx-6 lg:-mx-8'>
              <div className='max-h-[500px] overflow-y-auto rounded-lg border bg-white p-10'>
                <table className='min-w-full divide-y divide-gray-300'>
                  <thead>
                    <tr>
                      <th scope='col' className='py-3.5 pl-4 pr-3 text-left text-sm font-semibold text-gray-900 sm:pl-0'>
                        요청자
                      </th>
                      <th scope='col' className='px-3 py-3.5 text-left text-sm font-semibold text-gray-900'>
                        사건명
                      </th>
                      <th scope='col' className='px-3 py-3.5 text-left text-sm font-semibold text-gray-900'>
                        이메일
                      </th>
                      <th scope='col' className='px-3 py-3.5 text-left text-sm font-semibold text-gray-900'>
                        권한요청
                      </th>
                      <th scope='col' className='px-3 py-3.5 text-left text-sm font-semibold text-gray-900'></th>
                    </tr>
                  </thead>
                  <tbody className='divide-y divide-gray-200'>
                    {RequestlistEvidenceOutput?.data?.requests.map((request) => (
                      <tr key={request.request_id}>
                        <td className='whitespace-nowrap py-4 pl-4 pr-3 text-sm font-medium text-gray-900 sm:pl-0'>
                          {request.user?.name || 'Unknown'}
                        </td>
                        <td className='whitespace-nowrap px-3 py-4 text-sm text-gray-500'>{request.project_nm}</td>
                        <td className='whitespace-nowrap px-3 py-4 text-sm text-gray-500'>{request.user?.email || 'Unknown'}</td>
                        <td className='whitespace-nowrap px-3 py-4 text-sm text-gray-500'>{request.requested_role}</td>
                        <td className='relative whitespace-nowrap py-4 pl-3 pr-4 text-right text-sm font-medium sm:pr-0'>
                          <button
                            onClick={() => handleApprove(request.request_id)}
                            className={`rounded-md bg-[#87CEEB] px-2 py-1 text-white ${isPending ? 'cursor-not-allowed opacity-50' : ''}`}
                            disabled={isPending}
                          >
                            {isPending ? '처리 중' : '승인'}
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        </div>
        <div className='mt-1 flex justify-end'>
          <button onClick={onClose} type='button' className='mt-4 rounded bg-gray-500 px-4 py-2 font-bold text-white hover:bg-gray-700'>
            닫기
          </button>
        </div>
      </div>
    </div>
  );
};
