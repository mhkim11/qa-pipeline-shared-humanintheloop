import { useState, useEffect, useRef, useCallback } from 'react';

import { Tooltip } from 'react-tooltip';
import * as XLSX from 'xlsx';

import { useModifyAdminEvidence } from '@query/mutation';
import { fetchAdminEvidenceList, fetchResetEvidenceTable, fetchGetDailyUploadStatusList } from '@apis/evidence-admin-api';
import { fetchFindProjectUploadStatus } from '@/apis/evidence-admin-api';
import type {
  TUploadEvidenceListData,
  TFindProjectUploadStatusInput,
  TResetEvidenceTableInput,
  TGetDailyUploadStatusListInput,
  TGetDailyUploadStatusListOutput,
} from '@/apis/type';
import ModalSelect from '@/components/common/modal/modal-select';
import { AdminEvidenceUploadModal } from '@/components/evidence/admin/modal/admin-evidence-upload-modal';
import { EvidencePagination } from '@/components/evidence/pagination/evidence-pagination';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { onMessageToast } from '@/components/utils';

type TModifyEvidenceItemData = {
  evidence_number: string | number;
  start_page: string | number;
  page_count: string | number;
  evidence_title: string;
  writer: string;
  sequence_number: string | number;
  name: string;
  reference: string;
  category: string;
  status: string;
};
interface IEvidenceListTableProps {
  selectedProjectId: string;
  selectedOfficeId: string;
}
export const EvidenceListTable = ({ selectedProjectId, selectedOfficeId }: IEvidenceListTableProps): JSX.Element => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingItem, setEditingItem] = useState<TUploadEvidenceListData['items'][number] | null>(null);
  const [modifiedData, setModifiedData] = useState<TModifyEvidenceItemData | null>(null);
  const [editingVersion, setEditingVersion] = useState<string | null>(null);
  const [isUploadActive, setIsUploadActive] = useState(false);
  const [resetConfirmModalOpen, setResetConfirmModalOpen] = useState(false);
  // 각 테이블별 독립적인 로딩 상태 관리
  const [resettingVersions, setResettingVersions] = useState<Set<string>>(new Set());
  // NOTE: 증거목록도 upload_version 별로 페이지네이션이 독립적이어야 함
  const [pageByVersion, setPageByVersion] = useState<Record<string, number>>({});
  const [pageInputByVersion, setPageInputByVersion] = useState<Record<string, string>>({});
  const [paginationByVersion, setPaginationByVersion] = useState<Record<string, any>>({});
  const [itemsPerPageByVersion, setItemsPerPageByVersion] = useState<Record<string, number>>({});
  const itemsPerPageOptions = [50, 100, 150, 200];

  // ! 날짜별 업로드 현황 상태
  const [uploadStatusData, setUploadStatusData] = useState<TGetDailyUploadStatusListOutput['data']>([]);
  const [selectedUploadVersion, setSelectedUploadVersion] = useState<string | null>(null);

  // ! 각 테이블별 증거 데이터 상태
  const [evidenceDataByVersion, setEvidenceDataByVersion] = useState<Record<string, TUploadEvidenceListData['items'][number][]>>({});

  // ! 테이블 초기화 관련 상태
  const [resetUploadVersion, setResetUploadVersion] = useState<string | null>(null);

  // 수정 API 호출
  const { onModifyAdminEvidence } = useModifyAdminEvidence();

  // ! 각 버전별 증거목록 조회 함수
  const fetchEvidenceByVersion = useCallback(
    async (uploadVersion: string | null, options?: { force?: boolean; page_no?: number; block_cnt?: number }) => {
      try {
        const versionKey = uploadVersion || 'original';
        const pageNo = options?.page_no ?? 1;
        const blockCnt = options?.block_cnt ?? itemsPerPageByVersion[versionKey] ?? 50;

        const input = {
          office_id: selectedOfficeId,
          project_id: selectedProjectId,
          page_no: pageNo,
          block_cnt: blockCnt,
          upload_version: uploadVersion || null, // 기존 증거목록(null)이면 null, 새 버전이면 해당 버전 전달
        };

        const evidenceResponse = await fetchAdminEvidenceList(input);
        setEvidenceDataByVersion((prev) => ({
          ...prev,
          [versionKey]: evidenceResponse.data.items || [],
        }));
        setPaginationByVersion((prev) => ({
          ...prev,
          [versionKey]: evidenceResponse.data.pagination,
        }));
        setPageByVersion((prev) => ({ ...prev, [versionKey]: pageNo }));
        setPageInputByVersion((prev) => ({ ...prev, [versionKey]: String(pageNo) }));
        setItemsPerPageByVersion((prev) => ({ ...prev, [versionKey]: blockCnt }));
      } catch (error) {
        console.error(`Failed to fetch evidence for version ${uploadVersion}:`, error);
      }
    },
    [selectedOfficeId, selectedProjectId, itemsPerPageByVersion],
  );
  // StrictMode(dev)에서 mount effect가 2번 실행될 수 있어 1회만 호출되도록 가드
  const didFetchUploadStatusRef = useRef<string>('');
  useEffect(() => {
    const checkUploadStatus = async () => {
      if (!selectedProjectId || !selectedOfficeId) return;

      try {
        const input: TFindProjectUploadStatusInput = {
          office_id: selectedOfficeId,
          project_id: selectedProjectId,
          page_no: 1,
          block_cnt: 1,
        };

        const uploadStatusResponse = await fetchFindProjectUploadStatus(input);
        setIsUploadActive(uploadStatusResponse.data.evidence_active === true);
      } catch (error) {
        console.error('Failed to fetch upload status:', error);
        setIsUploadActive(false);
      }
    };

    const key = `${selectedProjectId}-${selectedOfficeId}`;
    if (didFetchUploadStatusRef.current === key) return;
    didFetchUploadStatusRef.current = key;
    checkUploadStatus();
  }, [selectedProjectId, selectedOfficeId]);

  // ! 날짜별 업로드 현황 조회
  // StrictMode(dev)에서 mount effect가 2번 실행될 수 있어 1회만 호출되도록 가드
  const didFetchUploadDateRef = useRef<string>('');
  useEffect(() => {
    const fetchUploadStatus = async () => {
      if (!selectedProjectId) return;

      try {
        const input: TGetDailyUploadStatusListInput = {
          project_id: selectedProjectId,
        };

        const uploadStatusResponse = await fetchGetDailyUploadStatusList(input);
        setUploadStatusData(uploadStatusResponse.data);
      } catch (error) {
        console.error('Failed to fetch upload status list:', error);
        setUploadStatusData([]);
      }
    };

    if (didFetchUploadDateRef.current === selectedProjectId) return;
    didFetchUploadDateRef.current = selectedProjectId;
    fetchUploadStatus();
  }, [selectedProjectId]);

  // ! 업로드 상태 데이터가 변경될 때마다 각 버전별 증거목록 조회
  // uploadStatusData가 동일한 값으로 2번 세팅될 때(StrictMode/dev 포함)
  // 버전별 evidence/list 재조회가 중복되지 않도록 가드
  const lastProcessedUploadStatusKeyRef = useRef<string>('');
  useEffect(() => {
    if (uploadStatusData.length > 0) {
      const statusKey = JSON.stringify(
        uploadStatusData.map((x: any) => ({
          upload_version: x.upload_version ?? null,
          file_count: x.file_count ?? null,
          upload_version_key: x.upload_version_key ?? null,
        })),
      );
      if (lastProcessedUploadStatusKeyRef.current === statusKey) return;
      lastProcessedUploadStatusKeyRef.current = statusKey;

      // 데이터 분리 로직
      const originalEvidence = uploadStatusData.find((item) => item.upload_version === null);
      const versionedEvidence = uploadStatusData.filter((item) => item.upload_version !== null);

      // 기존 증거목록 조회
      if (originalEvidence) {
        fetchEvidenceByVersion(null, {
          page_no: pageByVersion.original ?? 1,
          block_cnt: itemsPerPageByVersion.original ?? 50,
        });
      }

      // 날짜별 증거목록 조회
      versionedEvidence.forEach((versionData) => {
        if (versionData.upload_version) {
          const versionKey = versionData.upload_version;
          fetchEvidenceByVersion(versionData.upload_version, {
            page_no: pageByVersion[versionKey] ?? 1,
            block_cnt: itemsPerPageByVersion[versionKey] ?? 50,
          });
        }
      });
    }
  }, [uploadStatusData, selectedProjectId, selectedOfficeId, fetchEvidenceByVersion, pageByVersion, itemsPerPageByVersion]);

  // ! 데이터 분리 로직
  const originalEvidence = uploadStatusData.find((item) => item.upload_version === null);
  const versionedEvidence = uploadStatusData.filter((item) => item.upload_version !== null);

  // NOTE: 서버 fetch는 각 버전별로 수행되므로 전역 로딩 UI는 제거

  const handleEdit = (item: TUploadEvidenceListData['items'][number], uploadVersion?: string | null) => {
    setEditingItem(item);
    setEditingVersion(uploadVersion || null);
    setModifiedData({
      evidence_number: item.evidence_number,
      start_page: item.start_page,
      page_count: item.page_count,
      evidence_title: item.evidence_title,
      writer: item.writer,
      sequence_number: item.sequence_number,
      name: item.name,
      reference: item.reference,
      status: item.status,
      category: item.category,
    });
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>, key: keyof TModifyEvidenceItemData) => {
    if (!modifiedData) return;
    setModifiedData((prev) => ({
      ...prev!,
      [key]: e.target.value,
    }));
  };

  const handleCancel = () => {
    setEditingItem(null);
    setModifiedData(null);
    setEditingVersion(null);
  };
  const handleSave = async () => {
    if (!modifiedData || !editingItem) return;

    // 변경된 값만 필터링
    const updatedFields: Partial<TModifyEvidenceItemData> = {};
    Object.keys(modifiedData).forEach((key) => {
      if ((modifiedData as any)[key] !== (editingItem as any)[key]) {
        updatedFields[key as keyof TModifyEvidenceItemData] = (modifiedData as any)[key];
      }
    });
    if (Object.keys(updatedFields).length === 0) {
      onMessageToast({ message: '변경된 데이터가 없습니다.' });
      return;
    }

    // 필수 값 포함
    const requestData = {
      office_id: selectedOfficeId,
      project_id: selectedProjectId,
      evidence_id: editingItem.evidence_id,
      evidence_title: modifiedData.evidence_title || editingItem.evidence_title,
      evidence_number: modifiedData.evidence_number || editingItem.evidence_number,
      writer: modifiedData.writer || editingItem.writer,
      sequence_number: modifiedData.sequence_number || editingItem.sequence_number,
      start_page: modifiedData.start_page || editingItem.start_page,
      page_count: modifiedData.page_count || editingItem.page_count,
      name: modifiedData.name || editingItem.name,
      reference: modifiedData.reference || editingItem.reference,
      category: modifiedData.category || editingItem.category,
    };
    /*   console.log('requestData', requestData); */
    try {
      const result = await onModifyAdminEvidence(requestData);

      if (result?.isSuccess) {
        const versionKey = editingVersion || 'original';
        setEvidenceDataByVersion((prev) => ({
          ...prev,
          [versionKey]:
            prev[versionKey]?.map((item) =>
              item.upload_id === editingItem.upload_id
                ? {
                    ...item,
                    evidence_number: Number(modifiedData.evidence_number) || Number(editingItem.evidence_number),
                    start_page: Number(modifiedData.start_page) || Number(editingItem.start_page),
                    page_count: Number(modifiedData.page_count) || Number(editingItem.page_count),
                    evidence_title: String(modifiedData.evidence_title) || String(editingItem.evidence_title),
                    name: String(modifiedData.name) || String(editingItem.name),
                    reference: String(modifiedData.reference) || String(editingItem.reference),
                    category: String(modifiedData.category) || String(editingItem.category),
                  }
                : item,
            ) || [],
        }));

        setEditingItem(null);
        setModifiedData(null);
        setEditingVersion(null);
        onMessageToast({ message: '수정 성공' });
        await fetchEvidenceByVersion(editingVersion || null, {
          page_no: pageByVersion[versionKey] ?? 1,
          block_cnt: itemsPerPageByVersion[versionKey] ?? 50,
        });
      } else {
        onMessageToast({ message: result?.message ?? '수정 실패' });
      }
    } catch (error) {
      console.error('수정 실패:', error);
      onMessageToast({ message: '수정 실패' });
    }
  };
  const handlePageMove = (uploadVersion?: string | null) => {
    const versionKey = uploadVersion || 'original';
    const totalPages = paginationByVersion[versionKey]?.total_pages || 1;
    const nextPage = Number(pageInputByVersion[versionKey] ?? '1');
    const blockCnt = itemsPerPageByVersion[versionKey] ?? 50;

    if (Number.isFinite(nextPage) && nextPage >= 1 && nextPage <= totalPages) {
      fetchEvidenceByVersion(uploadVersion || null, { force: true, page_no: nextPage, block_cnt: blockCnt });
    } else {
      onMessageToast({
        message: `1 ~ ${totalPages} 사이의 숫자를 입력해주세요.`,
      });
    }
  };

  // ! 엑셀다운로드 함수
  const downloadExcel = async (uploadVersion?: string | null) => {
    try {
      const allDataResponse = await fetchAdminEvidenceList({
        office_id: selectedOfficeId,
        project_id: selectedProjectId,
        page_no: 1,
        block_cnt: 10000,
        upload_version: uploadVersion || null, // 기존 증거목록(null)이면 null, 새 버전이면 해당 버전 전달
      });
      const dataToExport = allDataResponse?.data?.items?.map(
        (item: {
          evidence_number: number;
          writer: string;
          sequence_number: number;
          start_page: number;
          evidence_title: string;
          name: string;
          reference: string;
          category: string;
          page_count: number;
        }) => ({
          증거번호: item.evidence_number,
          작성: item.writer,
          책: item.sequence_number,
          쪽수: item.start_page,
          증거명칭: item.evidence_title,
          이름: item.name,
          참고사항: item.reference,
          구분: item.category,
          페이지수: item.page_count,
        }),
      );

      const ws = XLSX.utils.json_to_sheet(dataToExport);
      const wb = XLSX.utils.book_new();
      XLSX.utils.book_append_sheet(wb, ws, '증거목록');

      // 파일명 생성 로직
      let fileName = '전체_증거목록.xlsx';
      if (uploadVersion) {
        // 날짜가 있는 리스트의 경우 해당 날짜를 파일명에 포함
        fileName = `증거목록_${uploadVersion}.xlsx`;
      } else {
        // 기존 증거목록의 경우
        fileName = '증거목록.xlsx';
      }

      XLSX.writeFile(wb, fileName);

      onMessageToast({ message: `${fileName} 다운로드가 완료되었습니다.` });
    } catch (error) {
      console.error('데이터 다운로드 실패:', error);
      onMessageToast({ message: '데이터 다운로드 중 오류가 발생했습니다.' });
    }
  };

  // ! 테이블 초기화 함수
  const handleResetTable = (uploadVersion?: string | null) => {
    setResetUploadVersion(uploadVersion || null);
    setResetConfirmModalOpen(true);
  };

  const executeResetTable = async () => {
    const versionKey = resetUploadVersion || 'original';

    try {
      // 해당 버전의 로딩 상태만 설정
      setResettingVersions((prev) => new Set(prev).add(versionKey));

      const input: TResetEvidenceTableInput = {
        office_id: selectedOfficeId,
        project_id: selectedProjectId,
        upload_version: resetUploadVersion || null, // 기존 증거목록(null)이면 null, 새 버전이면 해당 버전 전달
      };

      const result = await fetchResetEvidenceTable(input);

      if (result.success) {
        onMessageToast({ message: '테이블 초기화가 완료되었습니다.' });
        // 해당 버전의 데이터 다시 조회
        fetchEvidenceByVersion(resetUploadVersion || null, { force: true, page_no: 1, block_cnt: itemsPerPageByVersion[versionKey] ?? 50 });
      } else {
        onMessageToast({ message: '테이블 초기화에 실패했습니다.' });
      }
    } catch (error) {
      console.error('테이블 초기화 오류:', error);
      onMessageToast({ message: '테이블 초기화 중 오류가 발생했습니다.' });
    } finally {
      // 해당 버전의 로딩 상태만 해제
      setResettingVersions((prev) => {
        const newSet = new Set(prev);
        newSet.delete(versionKey);
        return newSet;
      });
      setResetConfirmModalOpen(false);
    }
  };

  // ! 테이블 렌더링 함수
  const renderTable = (title: string, uploadVersion?: string | null) => {
    const versionKey = uploadVersion || 'original';
    const tableData = evidenceDataByVersion[versionKey] || [];
    const isThisTableResetting = resettingVersions.has(versionKey);
    const pagination = paginationByVersion[versionKey];
    const currentPage = pageByVersion[versionKey] ?? 1;
    const pageInput = pageInputByVersion[versionKey] ?? String(currentPage);
    const totalPages = pagination?.total_pages || 1;
    const perPage = itemsPerPageByVersion[versionKey] ?? 50;

    return (
      <div className='mb-8'>
        <div className='mt-10 flex items-center justify-between'>
          <h1 className='mr-4 text-[20px] font-bold'>{title}</h1>
          <div className='flex justify-end'>
            <div className='flex space-x-4'>
              <button
                onClick={() => downloadExcel(uploadVersion)}
                type='button'
                className='block rounded-md bg-gray-400 px-3 py-2 text-center text-sm font-semibold text-white shadow-sm hover:bg-gray-500 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-600'
              >
                다운로드
              </button>
              <button
                type='button'
                onClick={() => handleResetTable(uploadVersion)}
                disabled={!tableData.length || isThisTableResetting}
                className={`block rounded-md px-3 py-2 text-center text-sm font-semibold text-white shadow-sm focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-600 ${
                  tableData.length && !isThisTableResetting ? 'bg-red-500 hover:bg-red-600' : 'cursor-not-allowed bg-gray-400'
                }`}
              >
                {isThisTableResetting ? '초기화 중...' : '테이블 초기화'}
              </button>
              <button
                type='button'
                onClick={() => {
                  setSelectedUploadVersion(uploadVersion === null || uploadVersion === undefined ? null : uploadVersion);
                  setIsModalOpen(true);
                }}
                disabled={!isUploadActive}
                className={`block rounded-md px-3 py-2 text-center text-sm font-semibold text-white shadow-sm focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-600 ${
                  isUploadActive ? 'bg-sky-800 hover:bg-sky-500' : 'cursor-not-allowed bg-gray-400'
                }`}
              >
                파일 업로드
              </button>
            </div>
          </div>
        </div>

        <div className='mt-4 flow-root'>
          <div className='-mx-4 -my-2 overflow-x-auto sm:-mx-6 lg:-mx-4'>
            <div className='inline-block min-w-full align-middle'>
              <div className='overflow-hidden shadow ring-1 ring-black/5 sm:rounded-lg'>
                {/* rows가 적으면 내용 높이만큼만, 많으면 450px에서 스크롤 */}
                <div className={`${tableData.length > 0 ? 'max-h-[450px]' : 'h-[100px]'} overflow-auto`}>
                  <table className='min-w-full divide-y divide-gray-300'>
                    <thead className='sticky top-0 z-10 bg-gray-50'>
                      <tr>
                        <th scope='col' className='whitespace-nowrap bg-gray-50 px-3 py-3.5 text-left text-sm font-semibold text-gray-900'>
                          순번
                        </th>
                        <th scope='col' className='whitespace-nowrap bg-gray-50 px-3 py-3.5 text-left text-sm font-semibold text-gray-900'>
                          작성
                        </th>
                        <th scope='col' className='whitespace-nowrap bg-gray-50 px-3 py-3.5 text-left text-sm font-semibold text-gray-900'>
                          책
                        </th>
                        <th scope='col' className='whitespace-nowrap bg-gray-50 px-3 py-3.5 text-left text-sm font-semibold text-gray-900'>
                          쪽수
                        </th>
                        <th scope='col' className='min-w-[200px] bg-gray-50 px-3 py-3.5 text-left text-sm font-semibold text-gray-900'>
                          증거명칭
                        </th>
                        <th scope='col' className='whitespace-nowrap bg-gray-50 px-3 py-3.5 text-left text-sm font-semibold text-gray-900'>
                          성명
                        </th>
                        <th scope='col' className='min-w-[150px] bg-gray-50 px-3 py-3.5 text-left text-sm font-semibold text-gray-900'>
                          참조사항
                        </th>
                        <th scope='col' className='whitespace-nowrap bg-gray-50 px-3 py-3.5 text-left text-sm font-semibold text-gray-900'>
                          구분
                        </th>
                        <th scope='col' className='whitespace-nowrap bg-gray-50 px-3 py-3.5 text-left text-sm font-semibold text-gray-900'>
                          페이지수
                        </th>
                        <th scope='col' className='whitespace-nowrap bg-gray-50 px-3 py-3.5 text-left text-sm font-semibold text-gray-900'>
                          수정
                        </th>
                      </tr>
                    </thead>
                    <tbody className='divide-y divide-gray-200 bg-white'>
                      {tableData.map((item) => (
                        <tr key={item.evidence_id} className='cursor-pointer hover:bg-gray-50'>
                          {editingItem?.evidence_id === item.evidence_id ? (
                            <>
                              <td className='whitespace-nowrap px-3 py-4'>
                                <input
                                  type='text'
                                  className='w-full rounded-md border border-gray-300 px-2 py-1 text-sm'
                                  value={modifiedData?.evidence_number || ''}
                                  onChange={(e) => handleInputChange(e, 'evidence_number')}
                                />
                              </td>
                              <td className='whitespace-nowrap px-3 py-4'>
                                <input
                                  type='text'
                                  className='w-full rounded-md border border-gray-300 px-2 py-1 text-sm'
                                  value={modifiedData?.writer || ''}
                                  onChange={(e) => handleInputChange(e, 'writer')}
                                />
                              </td>
                              <td className='whitespace-nowrap px-3 py-4'>
                                <input
                                  type='text'
                                  className='w-full rounded-md border border-gray-300 px-2 py-1 text-sm'
                                  value={modifiedData?.sequence_number || ''}
                                  onChange={(e) => handleInputChange(e, 'sequence_number')}
                                />
                              </td>
                              <td className='whitespace-nowrap px-3 py-4'>
                                <input
                                  type='text'
                                  className='w-full rounded-md border border-gray-300 px-2 py-1 text-sm'
                                  value={modifiedData?.start_page || ''}
                                  onChange={(e) => handleInputChange(e, 'start_page')}
                                />
                              </td>
                              <td className='px-3 py-4'>
                                <input
                                  type='text'
                                  className='w-full rounded-md border border-gray-300 px-2 py-1 text-sm'
                                  value={modifiedData?.evidence_title || ''}
                                  onChange={(e) => handleInputChange(e, 'evidence_title')}
                                />
                              </td>
                              <td className='whitespace-nowrap px-3 py-4'>
                                <input
                                  type='text'
                                  className='w-full rounded-md border border-gray-300 px-2 py-1 text-sm'
                                  value={modifiedData?.name || ''}
                                  onChange={(e) => handleInputChange(e, 'name')}
                                />
                              </td>
                              <td className='px-3 py-4'>
                                <input
                                  type='text'
                                  className='w-full rounded-md border border-gray-300 px-2 py-1 text-sm'
                                  value={modifiedData?.reference || ''}
                                  onChange={(e) => handleInputChange(e, 'reference')}
                                />
                              </td>
                              <td className='whitespace-nowrap px-3 py-4'>
                                <input
                                  type='text'
                                  className='w-full rounded-md border border-gray-300 px-2 py-1 text-sm'
                                  value={modifiedData?.category || ''}
                                  onChange={(e) => handleInputChange(e, 'category')}
                                />
                              </td>
                              <td className='whitespace-nowrap px-3 py-4'>
                                <input
                                  type='text'
                                  className='w-full rounded-md border border-gray-300 px-2 py-1 text-sm'
                                  value={modifiedData?.page_count || ''}
                                  onChange={(e) => handleInputChange(e, 'page_count')}
                                />
                              </td>
                              <td className='whitespace-nowrap px-3 py-4'>
                                <div className='flex gap-1'>
                                  <button
                                    className='rounded-md bg-sky-500 px-3 py-1 text-xs text-white transition-colors hover:bg-sky-600'
                                    onClick={handleSave}
                                  >
                                    저장
                                  </button>
                                  <button
                                    className='rounded-md bg-red-400 px-3 py-1 text-xs text-white transition-colors hover:bg-red-500'
                                    onClick={handleCancel}
                                  >
                                    취소
                                  </button>
                                </div>
                              </td>
                            </>
                          ) : (
                            <>
                              <td className='whitespace-nowrap px-3 py-4 text-sm text-gray-500'>{item.evidence_number}</td>
                              <td className='whitespace-nowrap px-3 py-4 text-sm text-gray-500'>
                                <span
                                  data-tooltip-id='admin-evidence-title-tooltip'
                                  data-tooltip-content={item.writer}
                                  className='block max-w-[180px] truncate'
                                >
                                  {item.writer}
                                </span>
                              </td>
                              <td className='whitespace-nowrap px-3 py-4 text-sm text-gray-500'>
                                <span
                                  data-tooltip-id='admin-evidence-title-tooltip'
                                  data-tooltip-content={String(item.sequence_number)}
                                  className='block max-w-[140px] truncate'
                                >
                                  {item.sequence_number}
                                </span>
                              </td>
                              <td className='whitespace-nowrap px-3 py-4 text-sm text-gray-500'>{item.start_page}</td>
                              <td className='px-3 py-4 text-sm text-gray-500'>
                                <span
                                  data-tooltip-id='admin-evidence-title-tooltip'
                                  data-tooltip-content={item.evidence_title}
                                  className='block max-w-[520px] truncate'
                                >
                                  {item.evidence_title}
                                </span>
                              </td>
                              <td className='whitespace-nowrap px-3 py-4 text-sm text-gray-500'>{item.name}</td>
                              <td className='break-words px-3 py-4 text-sm text-gray-500'>{item.reference}</td>
                              <td className='whitespace-nowrap px-3 py-4 text-sm text-gray-500'>{item.category}</td>
                              <td className='whitespace-nowrap px-3 py-4 text-sm text-gray-500'>{item.page_count}</td>
                              <td className='whitespace-nowrap px-3 py-4'>
                                <button
                                  className='rounded-md bg-gray-500 px-3 py-1 text-xs text-white transition-colors hover:bg-gray-600'
                                  onClick={() => handleEdit(item, uploadVersion)}
                                >
                                  수정
                                </button>
                              </td>
                            </>
                          )}
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          </div>
          <div className='flex h-[78px] w-full items-center justify-center bg-white shadow-inner'>
            <div className='flex items-center justify-between'>
              <div className='ml-[56px] mr-[26px] text-sm'>전체 {pagination?.total ?? tableData.length}건</div>

              <div className='ml-[26px] flex items-center justify-center'>
                <input
                  type='text'
                  value={pageInput}
                  onChange={(e) => setPageInputByVersion((prev) => ({ ...prev, [versionKey]: e.target.value }))}
                  placeholder='페이지 번호 입력'
                  className='h-[32px] w-[50px] rounded border border-[#C0D5DE] border-gray-400 p-2 text-center text-[14px] focus:border-[#2B7994] focus:outline-none focus:ring-0'
                  min={1}
                />
                <span className='pl-[8px] pr-2 text-[14px]'>/</span>
                <span className='text-[14px]'>{totalPages}</span>
                <button
                  onClick={() => handlePageMove(uploadVersion)}
                  className='ml-2 h-[32px] w-[50px] rounded border text-[14px] text-[#313131]'
                >
                  이동
                </button>
              </div>

              <div className=''>
                <EvidencePagination
                  currentPage={currentPage}
                  totalPages={totalPages}
                  onPageChange={(page) => fetchEvidenceByVersion(uploadVersion || null, { force: true, page_no: page, block_cnt: perPage })}
                />
              </div>

              <div className='ml-[26px] flex items-center'>
                <Select
                  value={perPage.toString()}
                  onValueChange={(value) => {
                    const next = Number(value);
                    setItemsPerPageByVersion((prev) => ({ ...prev, [versionKey]: next }));
                    fetchEvidenceByVersion(uploadVersion || null, { force: true, page_no: 1, block_cnt: next });
                  }}
                >
                  <SelectTrigger className='h-[32px] w-[120px]'>
                    <SelectValue placeholder='페이지당 개수' />
                  </SelectTrigger>
                  <SelectContent className='w-[200px]'>
                    {itemsPerPageOptions.map((option) => (
                      <SelectItem key={option} value={option.toString()}>
                        <p className='text-[12px]'>{option}개씩 보기</p>
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  };

  return (
    <div className=''>
      <Tooltip
        id='admin-evidence-title-tooltip'
        place='top'
        delayShow={0}
        offset={8}
        style={{
          backgroundColor: '#111827',
          color: '#FFFFFF',
          fontSize: '12px',
          padding: '6px 8px',
          borderRadius: '6px',
          zIndex: 99999,
          maxWidth: '520px',
          wordBreak: 'break-word',
        }}
      />
      <div className='pl-[20px]'>
        {/* 기존 증거목록 테이블 */}
        {originalEvidence && renderTable(' 증거목록', null)}

        {/* 날짜별 증거목록 테이블들 */}
        {versionedEvidence.map((versionData, index) => (
          <div key={index}>{renderTable(`증거목록 (${versionData.upload_version})`, versionData.upload_version)}</div>
        ))}

        {/* 업로드 모달 */}
        <AdminEvidenceUploadModal
          isOpen={isModalOpen}
          onClose={() => setIsModalOpen(false)}
          selectedProjectId={selectedProjectId}
          selectedOfficeId={selectedOfficeId}
          uploadVersion={selectedUploadVersion}
          onSuccess={() => {
            // 업로드 성공 후 해당 버전의 데이터 다시 조회
            const versionKey = selectedUploadVersion || 'original';
            fetchEvidenceByVersion(selectedUploadVersion || null, {
              force: true,
              page_no: pageByVersion[versionKey] ?? 1,
              block_cnt: itemsPerPageByVersion[versionKey] ?? 50,
            });
          }}
        />

        {/* 초기화 확인 모달 */}
        {resetConfirmModalOpen && (
          <ModalSelect
            sendMessage='확인'
            storageMessage='테이블이 삭제됩니다. 초기화 하시겠습니까?'
            handleSave={() => {
              setResetConfirmModalOpen(false);
              executeResetTable();
            }}
            setIsModalOpen={() => setResetConfirmModalOpen(false)}
            confirmButtonText='예'
          />
        )}
      </div>
    </div>
  );
};
