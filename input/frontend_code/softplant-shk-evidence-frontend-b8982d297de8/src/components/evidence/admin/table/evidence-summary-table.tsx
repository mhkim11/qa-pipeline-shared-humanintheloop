import { useState, useEffect, useRef } from 'react';

import { AiOutlineLoading3Quarters } from 'react-icons/ai';

import { fetchApplySummaryEvidence, fetchFindProjectUploadStatus, fetchResetSummaryTable } from '@/apis';
import type { TFindProjectUploadStatusInput, TResetSummaryTableInput } from '@/apis/type';
import { AdminSummaryModal } from '@/components/evidence/admin/modal/admin-summary-modal';
import { onMessageToast } from '@/components/utils';
import { useFindSummaryResultList } from '@/hooks/react-query/query/evidence/use-find-summary-list';
interface IEvidenceSummaryTableProps {
  selectedProjectId: string;
  selectedOfficeId: string;
}
export const EvidenceSummaryTable = ({ selectedProjectId, selectedOfficeId }: IEvidenceSummaryTableProps): JSX.Element => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isSummaryUploadActive, setIsSummaryUploadActive] = useState(false);
  const [isDownloading, setIsDownloading] = useState(false);
  const didInitSummaryStatusRef = useRef<string | null>(null);
  const { response, refetch } = useFindSummaryResultList({
    office_id: selectedOfficeId,
    project_id: selectedProjectId,
    page_no: 1,
    block_cnt: '10000', // 훨씬 더 큰 값으로 설정
  });
  const isNoSummaryData = !response?.data?.items || response.data.items.length === 0;
  const handleApplyEvidence = async () => {
    try {
      const result = await fetchApplySummaryEvidence({
        project_id: selectedProjectId,
        office_id: selectedOfficeId,
      });
      /* console.log('result', result); */
      if (result.success) {
        onMessageToast({ message: '증거문서 반영 성공' });
        await refetch();
      } else {
        onMessageToast({ message: result.message || '증거문서 반영 실패' });
      }
    } catch (error) {
      console.error('증거문서 반영 오류:', error);
      onMessageToast({ message: '증거문서 반영 중 오류가 발생했습니다' });
    }
  };

  const handleResetSummaryTable = async () => {
    try {
      const input: TResetSummaryTableInput = {
        office_id: selectedOfficeId,
        project_id: selectedProjectId,
        limit: 1000, // 초기화할 증거의 개수, 필요에 따라 조정 가능
      };

      /*    console.log('Reset Summary Table - Input:', input);
      console.log('Reset Summary Table - URL:', '/admin/project/summary/reset'); */

      const result = await fetchResetSummaryTable(input);

      /*    console.log('Reset Summary Table - Result:', result); */

      if (result.success) {
        onMessageToast({ message: '요약 테이블 초기화 성공' });
        await refetch();
      } else {
        onMessageToast({ message: result.message || '요약 테이블 초기화 실패' });
      }
    } catch (error) {
      console.error('요약 테이블 초기화 오류:', error);
      onMessageToast({ message: '요약 테이블 초기화 중 오류가 발생했습니다' });
    }
  };

  const handleDownloadSummary = async () => {
    if (isDownloading) return; // 이미 다운로드 중이면 중복 실행 방지

    setIsDownloading(true);
    try {
      const { authClient } = await import('@/apis');

      const downloadResponse = await authClient.post(
        `/admin/project/summary/download/zip`,
        { project_id: selectedProjectId },
        {
          responseType: 'blob',
          headers: {
            Accept: 'application/zip, application/octet-stream',
          },
        },
      );

      // Blob을 파일로 다운로드
      const blob = downloadResponse.data;
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `summary_${selectedProjectId}_${new Date().getTime()}.zip`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      window.URL.revokeObjectURL(url);

      onMessageToast({ message: '요약 파일 다운로드가 완료되었습니다.' });
    } catch (error) {
      console.error('요약 파일 다운로드 오류:', error);
      onMessageToast({ message: '요약 파일 다운로드 중 오류가 발생했습니다' });
    } finally {
      setIsDownloading(false);
    }
  };

  useEffect(() => {
    const checkUploadStatus = async () => {
      if (!selectedProjectId || !selectedOfficeId) return;
      const key = `${selectedOfficeId}:${selectedProjectId}`;
      if (didInitSummaryStatusRef.current === key) return;
      didInitSummaryStatusRef.current = key;

      try {
        const input: TFindProjectUploadStatusInput = {
          office_id: selectedOfficeId,
          project_id: selectedProjectId,
          page_no: 1,
          block_cnt: 1000,
        };

        const uploadStatusResponse = await fetchFindProjectUploadStatus(input);
        setIsSummaryUploadActive(uploadStatusResponse.data.summary_active === true);
      } catch (error) {
        console.error('Failed to fetch upload status:', error);
        setIsSummaryUploadActive(false);
      }
    };

    checkUploadStatus();
  }, [selectedProjectId, selectedOfficeId]);

  return (
    <div className='pl-[20px]'>
      <div className='mt-10'>
        <div className='mt-10 flex items-center justify-between'>
          <h1 className='mr-4 text-[20px] font-bold'>요약테이블 </h1>
          <div className='flex justify-end'>
            <div className='flex space-x-4'>
              <button
                type='button'
                onClick={handleApplyEvidence}
                disabled={isNoSummaryData}
                className={`block rounded-md px-3 py-2 text-center text-sm font-semibold text-white shadow-sm focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-600 ${
                  isNoSummaryData ? 'cursor-not-allowed bg-gray-400' : 'bg-sky-400 hover:bg-gray-500'
                }`}
              >
                사용자 증거목록에 반영
              </button>
              <button
                type='button'
                onClick={handleResetSummaryTable}
                disabled={isNoSummaryData}
                className={`block rounded-md px-3 py-2 text-center text-sm font-semibold text-white shadow-sm focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-red-600 ${
                  isNoSummaryData ? 'cursor-not-allowed bg-gray-400' : 'bg-red-600 hover:bg-red-700'
                }`}
              >
                요약 초기화
              </button>
              <button
                type='button'
                onClick={handleDownloadSummary}
                disabled={isNoSummaryData || isDownloading}
                className={`block rounded-md px-3 py-2 text-center text-sm font-semibold text-white shadow-sm focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-600 ${
                  isNoSummaryData || isDownloading ? 'cursor-not-allowed bg-gray-400' : 'bg-green-600 hover:bg-green-700'
                }`}
              >
                {isDownloading ? '다운로드 중...' : '다운로드'}
              </button>
              <button
                type='button'
                onClick={() => setIsModalOpen(true)}
                disabled={!isSummaryUploadActive}
                className={`block rounded-md px-3 py-2 text-center text-sm font-semibold text-white shadow-sm focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-600 ${
                  isSummaryUploadActive ? 'bg-sky-800 hover:bg-sky-500' : 'cursor-not-allowed bg-gray-400'
                }`}
              >
                파일 업로드
              </button>
            </div>
          </div>
        </div>

        <div className='mt-4 flow-root'>
          <div className='-mx-4 -my-2 overflow-x-auto sm:-mx-6 lg:-mx-8'>
            <div className='inline-block min-w-full py-2 align-middle sm:px-6 lg:px-8'>
              <div className='overflow-hidden shadow ring-1 ring-black/5 sm:rounded-lg'>
                <table className='min-w-full divide-y divide-gray-300'>
                  <thead className='bg-gray-50'>
                    <tr>
                      <th scope='col' className='px-3 py-3.5 text-left text-sm font-semibold text-gray-900'>
                        증거번호
                      </th>
                      <th scope='col' className='px-3 py-3.5 text-left text-sm font-semibold text-gray-900'>
                        요약
                      </th>
                    </tr>
                  </thead>

                  <tbody className='divide-y divide-gray-200 bg-white'>
                    {response?.data.items.map((item) => (
                      <tr key={item.evidence_number}>
                        <td className='whitespace-nowrap px-3 py-4 text-sm text-gray-500'>{item.evidence_number}</td>
                        <td className='whitespace-pre-line px-3 py-4 text-sm text-gray-500'>
                          <div className='flex items-center gap-2'>{item.content}</div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        </div>
      </div>
      {/* 업로드 모달 */}
      <AdminSummaryModal
        isOpen={isModalOpen}
        onClose={() => {
          setIsModalOpen(false);
        }}
        selectedProjectId={selectedProjectId}
        selectedOfficeId={selectedOfficeId}
        onSuccess={() => refetch()}
      />
      {/* 다운로드 중 로딩 모달 */}
      {isDownloading && (
        <div className='fixed inset-0 z-[10000] flex items-center justify-center bg-black bg-opacity-75'>
          <div className='flex flex-col items-center gap-4 rounded-lg bg-white p-[32px]'>
            <AiOutlineLoading3Quarters className='h-8 w-8 animate-spin text-[#004AA4]' />
            <p className='text-[16px] font-medium text-[#252525]'>다운로드 중입니다</p>
            <p className='text-center text-[14px] text-[#666666]'>
              압축파일 후 다운로드 되어
              <br />
              시간이 소요됩니다
            </p>
          </div>
        </div>
      )}
    </div>
  );
};
