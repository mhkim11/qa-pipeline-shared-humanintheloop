import { useState, useEffect, useMemo, useRef, useCallback } from 'react';

import { FaExclamationCircle } from 'react-icons/fa';
import { IoDownloadOutline } from 'react-icons/io5';
import { Tooltip } from 'react-tooltip';
import * as XLSX from 'xlsx';

import { useModifyAdminMatching } from '@query/mutation';
import {
  fetchFindCreateEvidenceFilterOutput,
  fetchFindMatchingList,
  fetchResetMatchingTable,
  fetchDownloadMatchingFileBlob,
  fetchResetEvidenceItem,
} from '@apis/evidence-admin-api';
import { fetchCreateEvidence, fetchApplyEvidence, fetchFindCreateEvidence, fetchDownloadEvidenceFile } from '@/apis';
import type { TFindMatchingListData, TResetMatchingTableInput } from '@/apis/type';
import type { TFindCreateEvidenceFilterOutput } from '@/apis/type/evidence-admin.type';
import ModalSelect from '@/components/common/modal/modal-select';
import { AdminMatchingModal } from '@/components/evidence/admin/modal/admin-matching-modal';
import DropdownFilter from '@/components/evidence/filter/evidence-filter';
import { EvidencePagination } from '@/components/evidence/pagination/evidence-pagination';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { onMessageToast } from '@/components/utils';
import { useFindProjectUploadStatus, useGetDailyUploadStatusList } from '@/hooks/react-query';
type TModifyMatchingItemData = {
  pdf_name: string;
  pdf_page: string;
  sequence_number: string;
  evidence_page: string;
  evidence_number: string;
};
interface IEvidenceMatchingTableProps {
  selectedProjectId: string;
  selectedOfficeId: string;
  selectedProjectName?: string;
  officeName?: string;
  projectName?: string;
  projectDate?: string;
}
export const EvidenceMatchingTable = ({
  selectedProjectId,
  selectedOfficeId,
  selectedProjectName,
  officeName,
  projectName,
  projectDate,
}: IEvidenceMatchingTableProps): JSX.Element => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingItem, setEditingItem] = useState<TFindMatchingListData['items'][number] | null>(null);
  const [modifiedData, setModifiedData] = useState<TModifyMatchingItemData | null>(null);
  const [isMatchingUploadActive, setIsMatchingUploadActive] = useState(false);
  const [isApplying, setIsApplying] = useState(false);

  const [isCreating, setIsCreating] = useState(false);
  const [isMatching, setIsMatching] = useState(false);
  const [errorModalOpen, setErrorModalOpen] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');
  const [successModalOpen, setSuccessModalOpen] = useState(false);
  const [successMessage, setSuccessMessage] = useState('');
  // ! 확인 모달 상태
  const [confirmModalOpen, setConfirmModalOpen] = useState(false);
  const [applyUploadVersion, setApplyUploadVersion] = useState<string | null>(null);
  const [isResetting, setIsResetting] = useState(false);
  const [resetConfirmModalOpen, setResetConfirmModalOpen] = useState(false);
  // ! 증거문서 초기화 확인 모달 상태
  const [resetEvidenceConfirmModalOpen, setResetEvidenceConfirmModalOpen] = useState(false);
  const [selectedUploadVersion, setSelectedUploadVersion] = useState<string | null>(null);
  // ! 각 테이블별 매칭 데이터 상태
  const [matchingDataByVersion, setMatchingDataByVersion] = useState<Record<string, TFindMatchingListData['items'][number][]>>({});
  // ! 각 테이블별 증거문서 데이터 상태
  const [evidenceDataByVersion, setEvidenceDataByVersion] = useState<Record<string, any[]>>({});
  // ! 테이블 초기화 관련 상태
  const [resetUploadVersion, setResetUploadVersion] = useState<string | null>(null);
  // ! 페이지네이션 관련상태
  // NOTE: 매칭테이블은 upload_version 별로 독립적인 페이지네이션이 필요함
  const [matchingPageByVersion, setMatchingPageByVersion] = useState<Record<string, number>>({});
  const [matchingPageInputByVersion, setMatchingPageInputByVersion] = useState<Record<string, string>>({});
  const [matchingPaginationByVersion, setMatchingPaginationByVersion] = useState<Record<string, any>>({});
  const [matchingItemsPerPageByVersion, setMatchingItemsPerPageByVersion] = useState<Record<string, number>>({});
  // NOTE: 증거문서는 upload_version 별로 독립적인 페이지네이션이 필요함
  const [evidencePageByVersion, setEvidencePageByVersion] = useState<Record<string, number>>({});
  const [evidencePageInputByVersion, setEvidencePageInputByVersion] = useState<Record<string, string>>({});
  const [evidencePaginationByVersion, setEvidencePaginationByVersion] = useState<Record<string, any>>({});
  const [evidenceItemsPerPageByVersion, setEvidenceItemsPerPageByVersion] = useState<Record<string, number>>({});
  const itemsPerPageOptions = [50, 100, 150, 200];
  // 버전별 증거명칭 검색어 (입력값 / 실행값)
  const [evidenceSearchInputByVersion, setEvidenceSearchInputByVersion] = useState<Record<string, string>>({});
  const [evidenceSearchByVersion, setEvidenceSearchByVersion] = useState<Record<string, string>>({});
  const [selectedItems, setSelectedItems] = useState<string[]>([]);

  // 증거문서 필터(버전별): 생성조회 요청에 `filters: { evidence_title:[], category:[] }`로 전달
  const [evidenceTitleFiltersByVersion, setEvidenceTitleFiltersByVersion] = useState<Record<string, string[]>>({});
  const [evidenceCategoryFiltersByVersion, setEvidenceCategoryFiltersByVersion] = useState<Record<string, string[]>>({});
  const [openEvidenceTitleFilterVersion, setOpenEvidenceTitleFilterVersion] = useState<string | null>(null);
  const [openEvidenceCategoryFilterVersion, setOpenEvidenceCategoryFilterVersion] = useState<string | null>(null);

  // 버전별 필터 옵션(전체 옵션)을 별도로 캐시해서, 서버 필터 적용 후에도 전체 리스트를 유지한다.
  const [evidenceFilterOptionsByVersion, setEvidenceFilterOptionsByVersion] = useState<
    Record<string, { evidence_title: string[]; category: string[] }>
  >({});
  const fetchedEvidenceFilterOptionsRef = useRef<Record<string, true>>({});
  const evidenceFilterOptionsInFlightRef = useRef<Record<string, true>>({});
  // const [isResetting, setIsResetting] = useState(false);

  // 버전별 데이터 캐시
  const fetchedMatchingVersionsRef = useRef<Record<string, true>>({});
  const fetchedEvidenceVersionsRef = useRef<Record<string, true>>({});
  const matchingFetchInFlightRef = useRef<Record<string, true>>({});
  const evidenceFetchInFlightRef = useRef<Record<string, true>>({});
  // NOTE: 필터 변경 시 fetchEvidenceByVersion 콜백이 바뀌면서 useEffect가 재실행되어
  // 동일 endpoint가 2번 호출되는 문제가 있어, 최신 필터값은 ref로 읽도록 한다.
  const evidenceTitleFiltersRef = useRef<Record<string, string[]>>({});
  const evidenceCategoryFiltersRef = useRef<Record<string, string[]>>({});

  useEffect(() => {
    evidenceTitleFiltersRef.current = evidenceTitleFiltersByVersion;
  }, [evidenceTitleFiltersByVersion]);

  useEffect(() => {
    evidenceCategoryFiltersRef.current = evidenceCategoryFiltersByVersion;
  }, [evidenceCategoryFiltersByVersion]);

  const { response: projectUploadStatusResponse } = useFindProjectUploadStatus({
    office_id: selectedOfficeId,
    project_id: selectedProjectId,
  });

  const { response: dailyUploadStatusResponse } = useGetDailyUploadStatusList({
    project_id: selectedProjectId,
  });

  const uploadStatusData = useMemo(() => dailyUploadStatusResponse?.data ?? [], [dailyUploadStatusResponse?.data]);

  useEffect(() => {
    setIsMatchingUploadActive(projectUploadStatusResponse?.data?.matching_active === true);
  }, [projectUploadStatusResponse?.data?.matching_active]);

  // ! 각 버전별 매칭목록 조회 함수 (중복 호출 방지)
  const fetchMatchingByVersion = useCallback(
    async (uploadVersion: string | null, options?: { force?: boolean; page_no?: number; block_cnt?: number }) => {
      const versionKey = uploadVersion || 'original';
      const pageNo = options?.page_no ?? 1;
      const blockCnt = options?.block_cnt ?? 50;
      const cacheKey = `${selectedOfficeId}:${selectedProjectId}:${versionKey}:${pageNo}:${blockCnt}`;

      if (!options?.force && fetchedMatchingVersionsRef.current[cacheKey]) return;
      if (matchingFetchInFlightRef.current[cacheKey]) return;

      matchingFetchInFlightRef.current[cacheKey] = true;

      try {
        const input = {
          office_id: selectedOfficeId,
          project_id: selectedProjectId,
          page_no: pageNo,
          block_cnt: blockCnt,
          upload_version: uploadVersion || null, // 기존 매칭목록(null)이면 null, 새 버전이면 해당 버전 전달
        };

        const matchingResponse = await fetchFindMatchingList(input);
        setMatchingDataByVersion((prev) => ({
          ...prev,
          [versionKey]: matchingResponse.data.items || [],
        }));
        setMatchingPaginationByVersion((prev) => ({
          ...prev,
          [versionKey]: matchingResponse.data.pagination,
        }));
        setMatchingPageByVersion((prev) => ({ ...prev, [versionKey]: pageNo }));
        setMatchingPageInputByVersion((prev) => ({ ...prev, [versionKey]: String(pageNo) }));
        fetchedMatchingVersionsRef.current[cacheKey] = true;
      } catch (error) {
        console.error(`Failed to fetch matching for version ${uploadVersion}:`, error);
      } finally {
        delete matchingFetchInFlightRef.current[cacheKey];
      }
    },
    [selectedOfficeId, selectedProjectId],
  );

  const fetchEvidenceFilterOptionsByVersion = useCallback(
    async (uploadVersion: string | null, options?: { force?: boolean }) => {
      const versionKey = uploadVersion || 'original';
      const cacheKey = `${selectedOfficeId}:${selectedProjectId}:${versionKey}:filter-options`;
      if (!options?.force && fetchedEvidenceFilterOptionsRef.current[cacheKey]) return;
      if (evidenceFilterOptionsInFlightRef.current[cacheKey]) return;
      evidenceFilterOptionsInFlightRef.current[cacheKey] = true;

      try {
        const res: TFindCreateEvidenceFilterOutput = await fetchFindCreateEvidenceFilterOutput({
          office_id: selectedOfficeId,
          project_id: selectedProjectId,
          upload_version: uploadVersion || null,
          filters: { evidence_title: [], category: [] },
        });
        const titles = Array.isArray((res as any)?.data?.evidence_title) ? (res as any).data.evidence_title : [];
        const cats = Array.isArray((res as any)?.data?.category) ? (res as any).data.category : [];
        setEvidenceFilterOptionsByVersion((prev) => ({
          ...prev,
          [versionKey]: { evidence_title: titles, category: cats },
        }));
        fetchedEvidenceFilterOptionsRef.current[cacheKey] = true;
      } catch (e) {
        console.error('Failed to fetch evidence filter options:', e);
      } finally {
        delete evidenceFilterOptionsInFlightRef.current[cacheKey];
      }
    },
    [selectedOfficeId, selectedProjectId],
  );

  // ! 각 버전별 증거문서 조회 함수 (중복 호출 방지)
  const fetchEvidenceByVersion = useCallback(
    async (
      uploadVersion: string | null,
      options?: {
        force?: boolean;
        page_no?: number;
        block_cnt?: number;
        keyword?: string;
        filtersOverride?: { evidence_title?: string[]; category?: string[] };
      },
    ) => {
      const versionKey = uploadVersion || 'original';
      const pageNo = options?.page_no ?? 1;
      const blockCnt = options?.block_cnt ?? 50;
      const keyword = options?.keyword ?? '';
      const appliedEvidenceTitle = options?.filtersOverride?.evidence_title ?? evidenceTitleFiltersRef.current[versionKey] ?? [];
      const appliedCategory = options?.filtersOverride?.category ?? evidenceCategoryFiltersRef.current[versionKey] ?? [];
      const filtersKey = JSON.stringify({ evidence_title: appliedEvidenceTitle, category: appliedCategory });
      const cacheKey = `${selectedOfficeId}:${selectedProjectId}:${versionKey}:${pageNo}:${blockCnt}:${keyword}:${filtersKey}`;

      if (!options?.force && fetchedEvidenceVersionsRef.current[cacheKey]) return;
      if (evidenceFetchInFlightRef.current[cacheKey]) return;

      evidenceFetchInFlightRef.current[cacheKey] = true;

      try {
        const input = {
          office_id: selectedOfficeId,
          project_id: selectedProjectId,
          page_no: pageNo,
          block_cnt: blockCnt,
          keyword,
          filters: {
            evidence_title: appliedEvidenceTitle,
            category: appliedCategory,
          },
          upload_version: uploadVersion || null, // 기존 증거문서(null)이면 null, 새 버전이면 해당 버전 전달
        };

        const evidenceResponse = await fetchFindCreateEvidence(input);
        setEvidenceDataByVersion((prev) => ({
          ...prev,
          [versionKey]: evidenceResponse.data.items || [],
        }));
        setEvidencePaginationByVersion((prev) => ({
          ...prev,
          [versionKey]: evidenceResponse.data.pagination,
        }));
        setEvidencePageByVersion((prev) => ({ ...prev, [versionKey]: pageNo }));
        setEvidencePageInputByVersion((prev) => ({ ...prev, [versionKey]: String(pageNo) }));
        fetchedEvidenceVersionsRef.current[cacheKey] = true;
      } catch (error) {
        console.error(`Failed to fetch evidence for version ${uploadVersion}:`, error);
      } finally {
        delete evidenceFetchInFlightRef.current[cacheKey];
      }
    },
    [selectedOfficeId, selectedProjectId],
  );

  // 프로젝트 변경 시 캐시/입력값 리셋
  useEffect(() => {
    setMatchingPageByVersion({});
    setMatchingPageInputByVersion({});
    setMatchingPaginationByVersion({});
    setMatchingItemsPerPageByVersion({});
    setSelectedUploadVersion(null);
    setSelectedItems([]);
    setMatchingDataByVersion({});
    setEvidenceDataByVersion({});
    setEvidencePageByVersion({});
    setEvidencePageInputByVersion({});
    setEvidencePaginationByVersion({});
    setEvidenceItemsPerPageByVersion({});
    setEvidenceSearchInputByVersion({});
    setEvidenceSearchByVersion({});
    fetchedMatchingVersionsRef.current = {};
    fetchedEvidenceVersionsRef.current = {};
    matchingFetchInFlightRef.current = {};
    evidenceFetchInFlightRef.current = {};
    setEvidenceFilterOptionsByVersion({});
    fetchedEvidenceFilterOptionsRef.current = {};
    evidenceFilterOptionsInFlightRef.current = {};
  }, [selectedProjectId, selectedOfficeId]);

  // ! 업로드 상태 데이터가 변경될 때마다 각 버전별 매칭목록 및 증거문서 조회 (버전 캐시 적용)
  useEffect(() => {
    if (uploadStatusData.length === 0) return;

    const originalMatching = uploadStatusData.find((item) => item.upload_version === null);
    const versionedMatching = uploadStatusData.filter((item) => item.upload_version !== null);

    if (originalMatching) {
      const originalKey = 'original';
      fetchEvidenceFilterOptionsByVersion(null);
      fetchMatchingByVersion(null, {
        page_no: matchingPageByVersion[originalKey] ?? 1,
        block_cnt: matchingItemsPerPageByVersion[originalKey] ?? 50,
      });
      fetchEvidenceByVersion(null, {
        page_no: evidencePageByVersion[originalKey] ?? 1,
        block_cnt: evidenceItemsPerPageByVersion[originalKey] ?? 50,
        keyword: evidenceSearchByVersion[originalKey] ?? '',
      });
    }

    versionedMatching.forEach((versionData) => {
      if (versionData.upload_version) {
        const versionKey = versionData.upload_version;
        fetchEvidenceFilterOptionsByVersion(versionData.upload_version);
        fetchMatchingByVersion(versionData.upload_version, {
          page_no: matchingPageByVersion[versionKey] ?? 1,
          block_cnt: matchingItemsPerPageByVersion[versionKey] ?? 50,
        });
        fetchEvidenceByVersion(versionData.upload_version, {
          page_no: evidencePageByVersion[versionKey] ?? 1,
          block_cnt: evidenceItemsPerPageByVersion[versionKey] ?? 50,
          keyword: evidenceSearchByVersion[versionKey] ?? '',
        });
      }
    });
  }, [
    uploadStatusData,
    fetchEvidenceFilterOptionsByVersion,
    fetchMatchingByVersion,
    fetchEvidenceByVersion,
    matchingPageByVersion,
    matchingItemsPerPageByVersion,
    evidencePageByVersion,
    evidenceItemsPerPageByVersion,
    evidenceSearchByVersion,
  ]);

  // ! 데이터 분리 로직
  const originalMatching = uploadStatusData.find((item) => item.upload_version === null);
  const versionedMatching = uploadStatusData.filter((item) => item.upload_version !== null);

  const filterEvidenceByTitle = (items: any[], keyword: string) => {
    const k = keyword.trim();
    if (!k) return items;
    const lower = k.toLowerCase();
    return items.filter((item) => (item?.evidence_title ?? '').toLowerCase().includes(lower));
  };

  // ZIP 파일명 생성 함수
  const generateZipFileName = () => {
    if (!projectDate || !officeName || !projectName) {
      return `증거문서_${new Date().toISOString().split('T')[0]}.zip`;
    }

    // 사건 생성일에서 월일 추출 (mmdd 형식)
    const date = new Date(projectDate);
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    const mmdd = `${month}${day}`;

    // [mmdd업로드] 로펌명_사건명.zip 형식
    return `[${mmdd}업로드] ${officeName}_${projectName}.zip`;
  };

  // 선택된 파일들의 총 용량 계산 (500MB 제한) - 페이지당 2MB로 추정
  const MAX_DOWNLOAD_SIZE = 500 * 1024 * 1024; // 500MB in bytes
  const ESTIMATED_MB_PER_PAGE = 2; // 페이지당 2MB로 추정

  const selectedFilesInfo = useMemo(() => {
    // 현재 선택된 버전의 증거문서 데이터 사용
    const currentEvidenceData = evidenceDataByVersion[selectedUploadVersion || 'original'] || [];

    if (!currentEvidenceData.length || selectedItems.length === 0) {
      return { count: 0, totalSize: 0, totalSizeMB: 0, totalPages: 0, isOverLimit: false };
    }

    const totalPages = selectedItems.reduce((sum, evidenceId) => {
      const evidenceItem = currentEvidenceData.find((item) => item.evidence_id === evidenceId);
      return sum + (evidenceItem?.page_count || 0);
    }, 0);

    const totalSizeMB = totalPages * ESTIMATED_MB_PER_PAGE;
    const totalSize = totalSizeMB * 1024 * 1024; // MB를 바이트로 변환
    const isOverLimit = totalSize > MAX_DOWNLOAD_SIZE;

    return {
      count: selectedItems.length,
      totalSize,
      totalSizeMB,
      totalPages,
      isOverLimit,
    };
  }, [selectedItems, evidenceDataByVersion, selectedUploadVersion]); // eslint-disable-line react-hooks/exhaustive-deps

  // NOTE: matching_active 조회는 위 useEffect로 project 기준 1회만 수행
  // ! 엑셀다운로드 함수
  const downloadExcel = async (uploadVersion?: string | null) => {
    const allDataResponse = await fetchFindMatchingList({
      office_id: selectedOfficeId,
      project_id: selectedProjectId,
      page_no: 1,
      block_cnt: 1000000,
      upload_version: uploadVersion || null, // 기존 매칭목록(null)이면 null, 새 버전이면 해당 버전 전달
    });

    const dataToExport = allDataResponse.data.items.map(({ evidence_number, pdf_name, pdf_page, sequence_number, evidence_page }) => ({
      원본파일명: pdf_name,
      원본파일페이지: pdf_page,
      책: sequence_number,
      증거페이지: evidence_page,
      증거번호: evidence_number,
    }));

    const ws = XLSX.utils.json_to_sheet(dataToExport);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, '매칭테이블');

    // 파일명 생성 로직
    let fileName = '전체_매칭테이블.xlsx';
    if (uploadVersion) {
      // 날짜가 있는 리스트의 경우 해당 날짜를 파일명에 포함
      fileName = `매칭테이블_${uploadVersion}.xlsx`;
    } else {
      // 기존 매칭목록의 경우
      fileName = '기존_매칭테이블.xlsx';
    }

    XLSX.writeFile(wb, fileName);
    onMessageToast({ message: `${fileName} 다운로드가 완료되었습니다.` });
  };
  // ! 증거문서 엑셀다운로드 함수
  const downloadEvidenceExcel = async (uploadVersion?: string | null) => {
    const allDataResponse = await fetchFindCreateEvidence({
      office_id: selectedOfficeId,
      project_id: selectedProjectId,
      page_no: 1,
      block_cnt: 1000000,
      upload_version: uploadVersion || null, // 기존 증거문서(null)이면 null, 새 버전이면 해당 버전 전달
    });

    const dataToExport = allDataResponse.data.items.map(({ evidence_number, evidence_title, category, start_page, page_count }) => ({
      증거번호: evidence_number,
      '시작페이지/총페이지': `${start_page}/${page_count}`,
      증거명칭: evidence_title,
      구분: category,
    }));

    const ws = XLSX.utils.json_to_sheet(dataToExport);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, '증거문서');

    // 파일명 생성 로직
    let fileName = '전체_증거문서.xlsx';
    if (uploadVersion) {
      // 날짜가 있는 리스트의 경우 해당 날짜를 파일명에 포함
      fileName = `증거문서_${uploadVersion}.xlsx`;
    } else {
      // 기존 증거문서의 경우
      fileName = '기존_증거문서.xlsx';
    }

    XLSX.writeFile(wb, fileName);
    onMessageToast({ message: `${fileName} 다운로드가 완료되었습니다.` });
  };
  // 수정 API 호출
  const { onModifyAdminMatching } = useModifyAdminMatching();
  const handleEdit = (item: TFindMatchingListData['items'][number], uploadVersion?: string | null) => {
    setEditingItem(item);
    setSelectedUploadVersion(uploadVersion || null);
    setModifiedData({
      pdf_name: item.pdf_name,
      pdf_page: item.pdf_page,
      sequence_number: item.sequence_number,
      evidence_page: item.evidence_page,
      evidence_number: item.evidence_number,
    });
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>, key: keyof TModifyMatchingItemData) => {
    if (!modifiedData) return;
    setModifiedData((prev) => ({ ...prev!, [key]: e.target.value }));
  };

  const handleCancel = () => {
    setEditingItem(null);
    setModifiedData(null);
  };

  const handleMatchingPageMove = (uploadVersion?: string | null) => {
    const versionKey = uploadVersion || 'original';
    const pagination = matchingPaginationByVersion[versionKey];
    const totalPages = pagination?.total_pages || 1;
    const nextPage = Number(matchingPageInputByVersion[versionKey] ?? '1');
    const blockCnt = matchingItemsPerPageByVersion[versionKey] ?? 50;
    if (Number.isFinite(nextPage) && nextPage >= 1 && nextPage <= totalPages) {
      fetchMatchingByVersion(uploadVersion || null, { force: true, page_no: nextPage, block_cnt: blockCnt });
    } else {
      onMessageToast({
        message: `1 ~ ${totalPages} 사이의 숫자를 입력해주세요.`,
      });
    }
  };

  const handleEvidencePageMove = (uploadVersion?: string | null) => {
    const versionKey = uploadVersion || 'original';
    const pagination = evidencePaginationByVersion[versionKey];
    const totalPages = pagination?.total_pages || 1;
    const nextPage = Number(evidencePageInputByVersion[versionKey] ?? '1');
    const blockCnt = evidenceItemsPerPageByVersion[versionKey] ?? 50;
    if (Number.isFinite(nextPage) && nextPage >= 1 && nextPage <= totalPages) {
      setSelectedItems([]);
      fetchEvidenceByVersion(uploadVersion || null, {
        force: true,
        page_no: nextPage,
        block_cnt: blockCnt,
        keyword: evidenceSearchByVersion[versionKey] ?? '',
      });
    } else {
      onMessageToast({
        message: `1 ~ ${totalPages} 사이의 숫자를 입력해주세요.`,
      });
    }
  };
  const handleSave = async () => {
    if (!modifiedData || !editingItem) return;

    // 변경된 값만 필터링
    const updatedFields: Partial<TModifyMatchingItemData> = {};
    Object.keys(modifiedData).forEach((key) => {
      if ((modifiedData as any)[key] !== (editingItem as any)[key]) {
        updatedFields[key as keyof TModifyMatchingItemData] = (modifiedData as any)[key];
      }
    });

    // 변경된 데이터가 없으면 API 호출하지 않음
    if (Object.keys(updatedFields).length === 0) {
      onMessageToast({ message: '변경된 데이터가 없습니다.' });
      return;
    }

    // 필수 값 포함
    const requestData = {
      office_id: selectedOfficeId,
      project_id: selectedProjectId,
      matching_id: editingItem.matching_id,
      pdf_name: modifiedData.pdf_name || '',
      pdf_page: modifiedData.pdf_page || '',
      sequence_number: modifiedData.sequence_number || '',
      evidence_page: modifiedData.evidence_page || '',
      evidence_number: modifiedData.evidence_number || '',
    };

    const result = await onModifyAdminMatching(requestData);
    if (result?.isSuccess) {
      // 해당 버전의 데이터 업데이트
      const versionKey = selectedUploadVersion || 'original';
      setMatchingDataByVersion((prev) => ({
        ...prev,
        [versionKey]:
          prev[versionKey]?.map((item) => (item.matching_id === editingItem.matching_id ? { ...item, ...modifiedData } : item)) || [],
      }));
      setEditingItem(null);
      setModifiedData(null);
      onMessageToast({ message: '수정 성공' });
      await fetchMatchingByVersion(selectedUploadVersion || null, {
        force: true,
        page_no: matchingPageByVersion[versionKey] ?? 1,
        block_cnt: matchingItemsPerPageByVersion[versionKey] ?? 50,
      });
    } else {
      onMessageToast({ message: result?.message ?? '수정 실패' });
    }
  };
  const handleCreateEvidence = async (uploadVersion?: string | null) => {
    try {
      setIsCreating(true);
      setIsMatching(true);
      const result = await fetchCreateEvidence({
        project_id: selectedProjectId,
        office_id: selectedOfficeId,
        upload_version: uploadVersion || null, // 기존 증거문서(null)이면 null, 새 버전이면 해당 버전 전달
      });

      if (result.success) {
        setSuccessMessage(`매칭 작업이 시작되었습니다.`);
        setSuccessModalOpen(true);
        {
          const versionKey = uploadVersion || 'original';
          await fetchMatchingByVersion(uploadVersion || null, {
            force: true,
            page_no: matchingPageByVersion[versionKey] ?? 1,
            block_cnt: matchingItemsPerPageByVersion[versionKey] ?? 50,
          });
        }

        // 모든 버전의 증거문서 데이터 다시 조회
        if (uploadStatusData.length > 0) {
          const originalMatchingData = uploadStatusData.find((item) => item.upload_version === null);
          const versionedMatchingData = uploadStatusData.filter((item) => item.upload_version !== null);

          if (originalMatchingData) {
            const originalKey = 'original';
            fetchEvidenceByVersion(null, {
              force: true,
              page_no: evidencePageByVersion[originalKey] ?? 1,
              block_cnt: evidenceItemsPerPageByVersion[originalKey] ?? 50,
              keyword: evidenceSearchByVersion[originalKey] ?? '',
            });
          }

          versionedMatchingData.forEach((versionData) => {
            if (versionData.upload_version) {
              const versionKey = versionData.upload_version;
              fetchEvidenceByVersion(versionData.upload_version, {
                force: true,
                page_no: evidencePageByVersion[versionKey] ?? 1,
                block_cnt: evidenceItemsPerPageByVersion[versionKey] ?? 50,
                keyword: evidenceSearchByVersion[versionKey] ?? '',
              });
            }
          });
        }
      } else {
        setErrorMessage(result.message || '매칭작업 실패');
        setErrorModalOpen(true);
      }
    } catch (error) {
      console.error('증거문서 생성 오류:', error);
      setErrorMessage('매칭작업 중 오류가 발생했습니다');
      setErrorModalOpen(true);
    } finally {
      setIsCreating(false);
      setIsMatching(false);
    }
  };
  // ! 매칭 데이터가 비어있는지 확인 (모든 버전의 데이터를 확인)
  const isMatchingDataEmpty = Object.values(matchingDataByVersion).every((data) => data.length === 0);
  const handleApplyEvidence = (uploadVersion?: string | null) => {
    setApplyUploadVersion(uploadVersion || null);
    setConfirmModalOpen(true);
  };

  const executeApplyEvidence = async () => {
    try {
      setIsApplying(true);
      const result = await fetchApplyEvidence({
        project_id: selectedProjectId,
        office_id: selectedOfficeId,
        upload_version: applyUploadVersion || null,
      });

      if (result.success) {
        onMessageToast({ message: '증거문서 반영 요청 성공' });
        setSuccessMessage('증거문서 반영 요청이 성공적으로 완료되었습니다.');
        setSuccessModalOpen(true);
        {
          const versionKey = applyUploadVersion || 'original';
          fetchMatchingByVersion(applyUploadVersion || null, {
            force: true,
            page_no: matchingPageByVersion[versionKey] ?? 1,
            block_cnt: matchingItemsPerPageByVersion[versionKey] ?? 50,
          });
          fetchEvidenceByVersion(applyUploadVersion || null, {
            force: true,
            page_no: evidencePageByVersion[versionKey] ?? 1,
            block_cnt: evidenceItemsPerPageByVersion[versionKey] ?? 50,
            keyword: evidenceSearchByVersion[versionKey] ?? '',
          });
        }
        setApplyUploadVersion(null);
      } else {
        setErrorMessage(result.message || '증거문서 반영 실패');
        setErrorModalOpen(true);
        setApplyUploadVersion(null);
      }
    } catch (error) {
      console.error('증거문서 반영 오류:', error);
      setErrorMessage('증거문서 반영 중 오류가 발생했습니다');
      setErrorModalOpen(true);
      setApplyUploadVersion(null);
    } finally {
      setIsApplying(false);
    }
  };
  const handleViewPDF = (evidenceId: string) => {
    if (!evidenceId) {
      onMessageToast({
        message: 'PDF 파일 정보가 없습니다.',
        icon: <FaExclamationCircle className='h-5 w-5 text-yellow-500' />,
      });
      return;
    }
    window.open(`/admin/evidence-document/pdf/${evidenceId}?projectId=${selectedProjectId}&officeId=${selectedOfficeId}`, '_blank');
  };
  const handleViewTXT = (evidenceId: string) => {
    if (!evidenceId) {
      onMessageToast({
        message: 'OCR 결과가 없습니다.',
        icon: <FaExclamationCircle className='h-5 w-5 text-yellow-500' />,
      });
      return;
    }

    // OCR 텍스트 뷰어 페이지로 이동
    window.open(`/admin/evidence-document/text/${evidenceId}?projectId=${selectedProjectId}&officeId=${selectedOfficeId}`, '_blank');
  };
  // 증거문서 초기화 확인 모달 열기
  const handleResetEvidenceClick = () => {
    setResetEvidenceConfirmModalOpen(true);
  };

  // 증거문서 초기화 실행
  const executeResetEvidence = async () => {
    try {
      setIsResetting(true);
      const result = await fetchResetEvidenceItem({
        project_id: selectedProjectId,
        office_id: selectedOfficeId,
      });

      if (result.success) {
        onMessageToast({ message: '세팅 초기화 성공' });
        setSuccessMessage('세팅이 성공적으로 초기화되었습니다.');
        setSuccessModalOpen(true);
        // 현재 보고 있는 버전 기준으로 재조회
        {
          const versionKey = selectedUploadVersion || 'original';
          fetchEvidenceByVersion(selectedUploadVersion || null, {
            force: true,
            page_no: evidencePageByVersion[versionKey] ?? 1,
            block_cnt: evidenceItemsPerPageByVersion[versionKey] ?? 50,
            keyword: evidenceSearchByVersion[versionKey] ?? '',
          });
        }
      } else {
        setErrorMessage(result.message || '세팅 초기화 실패');
        setErrorModalOpen(true);
      }
    } catch (error) {
      console.error('세팅 초기화 오류:', error);
      setErrorMessage('세팅 초기화 중 오류가 발생했습니다');
      setErrorModalOpen(true);
    } finally {
      setIsResetting(false);
      setResetEvidenceConfirmModalOpen(false);
    }
  };

  // 사용자 화면 미리보기 함수
  const handlePreviewUserView = () => {
    // 프로젝트 이름을 URL 인코딩
    const encodedProjectName = encodeURIComponent(selectedProjectName || '');
    const previewUrl = `/admin/evidence-preview?project_id=${selectedProjectId}&project_name=${encodedProjectName}&officeId=${selectedOfficeId}`;
    window.open(previewUrl, '_blank');
  };

  // ! 테이블 초기화 함수
  const handleResetTable = (uploadVersion?: string | null) => {
    setResetUploadVersion(uploadVersion || null);
    setResetConfirmModalOpen(true);
  };

  const executeResetTable = async () => {
    try {
      setIsResetting(true);
      const input: TResetMatchingTableInput = {
        office_id: selectedOfficeId,
        project_id: selectedProjectId,
        upload_version: resetUploadVersion || null, // 기존 매칭목록(null)이면 null, 새 버전이면 해당 버전 전달
      };

      const result = await fetchResetMatchingTable(input);

      if (result.success) {
        onMessageToast({ message: '매칭 테이블 초기화가 완료되었습니다.' });

        // 해당 버전의 데이터만 다시 조회 (전체 refetch 제거)
        if (resetUploadVersion) {
          fetchMatchingByVersion(resetUploadVersion);
        } else {
          fetchMatchingByVersion(null);
        }
      } else {
        onMessageToast({ message: '매칭 테이블 초기화에 실패했습니다.' });
      }
    } catch (error) {
      console.error('매칭 테이블 초기화 오류:', error);
      onMessageToast({ message: '매칭 테이블 초기화 중 오류가 발생했습니다.' });
    } finally {
      setIsResetting(false);
      setResetConfirmModalOpen(false);
    }
  };

  // 다운로드 관련 함수들

  const handleDownloadTEXT = async () => {
    if (selectedItems.length === 0) {
      onMessageToast({ message: '다운로드할 항목을 선택해주세요.' });
      return;
    }

    try {
      let successCount = 0;

      // 순차적으로 다운로드
      for (const evidenceId of selectedItems) {
        const result = await fetchDownloadEvidenceFile({
          office_id: selectedOfficeId,
          project_id: selectedProjectId,
          evidence_id: evidenceId,
        });

        console.log('다운로드 결과:', result);

        if (result.success && result.data?.url) {
          const link = document.createElement('a');
          link.href = result.data.url;
          link.download = result.data.filename || `evidence_${evidenceId}.txt`;
          document.body.appendChild(link);
          link.click();
          document.body.removeChild(link);
          successCount++;

          // 다운로드 간격을 두어 브라우저가 처리할 시간을 줌
          await new Promise((resolve) => setTimeout(resolve, 400));
        }
      }

      // 선택된 항목 초기화
      setTimeout(() => setSelectedItems([]), 500);

      // 결과 메시지 표시
      if (successCount === selectedItems.length) {
        onMessageToast({
          message: `${successCount}개 파일 다운로드가 완료되었습니다.`,
        });
      } else {
        onMessageToast({
          message: `${successCount}개 파일 다운로드 완료, ${selectedItems.length - successCount}개 실패`,
        });
      }
    } catch (error) {
      console.error('다운로드 중 오류 발생:', error);
      onMessageToast({
        message: '파일 다운로드 중 오류가 발생했습니다.',
      });
    }
  };

  // ZIP 다운로드 공통 함수
  const handleDownloadZIP = async (docType: 'text' | 'pdf') => {
    if (selectedItems.length === 0) {
      onMessageToast({
        message: '다운로드할 항목을 선택해주세요.',
        icon: <FaExclamationCircle className='h-5 w-5 text-yellow-500' />,
      });
      return;
    }

    // PDF만 용량 제한 체크 (TEXT는 용량 제한 없음)
    if (docType === 'pdf' && selectedFilesInfo.isOverLimit) {
      onMessageToast({
        message: `선택된 파일의 총 용량이 500MB를 초과합니다. (약 ${selectedFilesInfo.totalSizeMB.toFixed(0)}MB)`,
        icon: <FaExclamationCircle className='h-5 w-5 text-yellow-500' />,
      });
      return;
    }

    try {
      const downloadParams = {
        office_id: selectedOfficeId,
        project_id: selectedProjectId,
        evidence_ids: selectedItems,
        doc_type: docType,
      };

      const blob = await fetchDownloadMatchingFileBlob(downloadParams);

      // 파일명에 타입 추가
      const baseFileName = generateZipFileName().replace('.zip', '');
      const zipFileName = `${baseFileName}_${docType}.zip`;

      // Blob으로 압축파일 다운로드
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', zipFileName);
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      window.URL.revokeObjectURL(url);

      // 선택된 항목 초기화
      setTimeout(() => setSelectedItems([]), 500);

      onMessageToast({
        message: `선택된 파일들이 ${docType} 압축파일로 다운로드되었습니다.`,
      });
    } catch (error) {
      console.error(`${docType} ZIP 다운로드 중 오류 발생:`, error);
      onMessageToast({
        message: `${docType} 압축파일 다운로드 중 오류가 발생했습니다.`,
        icon: <FaExclamationCircle className='h-5 w-5 text-yellow-500' />,
      });
    }
  };

  // TEXT ZIP 다운로드
  const handleDownloadTEXTZIP = async () => {
    await handleDownloadZIP('text');
  };

  // PDF ZIP 다운로드
  const handleDownloadPDFZIP = async () => {
    await handleDownloadZIP('pdf');
  };

  // 체크박스 관련 함수들
  const handleSelectAll = (checked: boolean, currentEvidenceData: any[]) => {
    if (checked) {
      const allItemIds = currentEvidenceData.map((item) => item.evidence_id) || [];
      setSelectedItems(allItemIds);
    } else {
      setSelectedItems([]);
    }
  };

  const handleSelectItem = (itemId: string, checked: boolean) => {
    if (checked) {
      setSelectedItems((prev) => [...prev, itemId]);
    } else {
      setSelectedItems((prev) => prev.filter((id) => id !== itemId));
    }
  };

  const getCheckboxState = (currentEvidenceData: any[]) => {
    const isAllSelected = currentEvidenceData.length > 0 && selectedItems.length === currentEvidenceData.length;
    const isIndeterminate = selectedItems.length > 0 && selectedItems.length < currentEvidenceData.length;
    return { isAllSelected, isIndeterminate };
  };

  // ! 테이블 렌더링 함수
  const renderMatchingTable = (title: string, uploadVersion?: string | null) => {
    const versionKey = uploadVersion || 'original';
    const tableData = matchingDataByVersion[versionKey] || [];
    const evidenceTableData = evidenceDataByVersion[versionKey] || [];
    const evidenceSearchInput = evidenceSearchInputByVersion[versionKey] ?? '';
    const evidenceSearch = evidenceSearchByVersion[versionKey] ?? '';
    const evidencePagination = evidencePaginationByVersion[versionKey];
    const evidenceCurrentPage = evidencePageByVersion[versionKey] ?? 1;
    const evidencePageInput = evidencePageInputByVersion[versionKey] ?? String(evidenceCurrentPage);
    const evidenceTotalPages = evidencePagination?.total_pages || 1;
    const evidenceItemsPerPage = evidenceItemsPerPageByVersion[versionKey] ?? 50;

    const matchingPagination = matchingPaginationByVersion[versionKey];
    const matchingCurrentPage = matchingPageByVersion[versionKey] ?? 1;
    const matchingPageInput = matchingPageInputByVersion[versionKey] ?? String(matchingCurrentPage);
    const matchingItemsPerPage = matchingItemsPerPageByVersion[versionKey] ?? 50;
    const matchingTotalPages = matchingPagination?.total_pages || 1;
    const filteredEvidenceTableData = filterEvidenceByTitle(evidenceTableData, evidenceSearch);

    const fallbackEvidenceTitleOptions = Array.from(
      new Set((evidenceTableData ?? []).map((it) => (it?.evidence_title ?? '').trim()).filter(Boolean)),
    );
    const fallbackEvidenceCategoryOptions = Array.from(
      new Set((evidenceTableData ?? []).map((it) => (it?.category ?? '').trim()).filter(Boolean)),
    );
    const evidenceTitleOptions = evidenceFilterOptionsByVersion[versionKey]?.evidence_title ?? fallbackEvidenceTitleOptions;
    const evidenceCategoryOptions = evidenceFilterOptionsByVersion[versionKey]?.category ?? fallbackEvidenceCategoryOptions;
    const appliedTitle = evidenceTitleFiltersByVersion[versionKey] ?? [];
    const appliedCategory = evidenceCategoryFiltersByVersion[versionKey] ?? [];
    const titleSelectedForUi = appliedTitle.length ? appliedTitle : evidenceTitleOptions;
    const categorySelectedForUi = appliedCategory.length ? appliedCategory : evidenceCategoryOptions;

    return (
      <div className='mb-8 min-w-0 max-w-full'>
        <div className='mt-10 flex flex-wrap items-center justify-between gap-2'>
          <h1 className='mr-4 text-[20px] font-bold'>{title}</h1>
          <div className='flex justify-end'>
            <div className='flex flex-wrap justify-end gap-2'>
              <button
                onClick={() => downloadExcel(uploadVersion)}
                type='button'
                className='flex items-center justify-center rounded-md bg-gray-400 px-3 py-2 text-center text-sm font-semibold text-white shadow-sm hover:bg-gray-500 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-600'
                title='다운로드'
              >
                <IoDownloadOutline className='h-5 w-5' />
              </button>
              <button
                type='button'
                onClick={() => handleResetTable(uploadVersion)}
                disabled={!tableData.length || isResetting}
                className={`block rounded-md px-3 py-2 text-center text-sm font-semibold text-white shadow-sm focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-600 ${
                  tableData.length && !isResetting ? 'bg-red-500 hover:bg-red-600' : 'cursor-not-allowed bg-gray-400'
                }`}
              >
                {isResetting ? '초기화 중...' : '테이블 초기화'}
              </button>
              <button
                type='button'
                onClick={() => {
                  setSelectedUploadVersion(uploadVersion === null || uploadVersion === undefined ? null : uploadVersion);
                  setIsModalOpen(true);
                }}
                disabled={!isMatchingUploadActive}
                className={`block rounded-md px-3 py-2 text-center text-sm font-semibold text-white shadow-sm focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-600 ${
                  isMatchingUploadActive ? 'bg-sky-800 hover:bg-sky-500' : 'cursor-not-allowed bg-gray-400'
                }`}
              >
                파일 업로드
              </button>
              <button
                type='button'
                onClick={() => handleCreateEvidence(uploadVersion)}
                disabled={isMatchingDataEmpty || isCreating || isMatching}
                className={`block rounded-md px-3 py-2 text-center text-sm font-semibold text-white shadow-sm focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-600 ${
                  isMatchingDataEmpty || isCreating || isMatching ? 'cursor-not-allowed bg-gray-300' : 'bg-sky-400 hover:bg-sky-500'
                }`}
              >
                {isCreating || isMatching ? '매칭 작업 중...' : '증거문서 생성'}
              </button>
              <button
                type='button'
                onClick={handleDownloadTEXT}
                disabled={selectedItems.length === 0}
                className={`flex items-center justify-center gap-2 rounded-md px-3 py-2 text-center text-sm font-semibold text-white shadow-sm focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-600 ${
                  selectedItems.length === 0 ? 'cursor-not-allowed bg-gray-300' : 'bg-blue-400 hover:bg-blue-500'
                }`}
              >
                <IoDownloadOutline className='h-4 w-4' />
                TXT
              </button>
              <div>
                <button
                  type='button'
                  onClick={handleResetEvidenceClick}
                  className='rounded-md bg-red-800 px-3 py-2 text-white transition-colors hover:bg-red-500'
                >
                  {isResetting ? '초기화 중...' : ' 초기화'}
                </button>
              </div>
            </div>
          </div>
        </div>

        <div className='mt-4 flow-root'>
          {/* 가로 스크롤은 이 래퍼 안에서만 발생 */}
          <div className='w-full overflow-x-auto'>
            <div className='inline-block min-w-full py-2 align-middle'>
              <div className='overflow-hidden shadow ring-1 ring-black/5 sm:rounded-lg'>
                {/* NOTE: 고정 높이로 테이블 바디가 항상 보이도록 */}
                {/* rows가 적으면 내용 높이만큼만, 많으면 450px에서 스크롤 */}
                <div className={`${tableData.length > 0 ? 'max-h-[450px]' : 'h-[100px]'} overflow-auto`}>
                  <table className='min-w-full table-fixed divide-y divide-gray-300'>
                    <colgroup>
                      <col className='w-[520px]' />
                      <col className='w-[110px]' />
                      <col className='w-[80px]' />
                      <col className='w-[110px]' />
                      <col className='w-[90px]' />
                      <col className='w-[90px]' />
                    </colgroup>
                    <thead className='sticky top-0 z-10 bg-gray-50'>
                      <tr>
                        <th scope='col' className='whitespace-nowrap bg-gray-50 px-3 py-3.5 text-left text-sm font-semibold text-gray-900'>
                          원본 파일명
                        </th>
                        <th scope='col' className='whitespace-nowrap bg-gray-50 px-3 py-3.5 text-left text-sm font-semibold text-gray-900'>
                          원본파일 페이지
                        </th>
                        <th scope='col' className='whitespace-nowrap bg-gray-50 px-3 py-3.5 text-left text-sm font-semibold text-gray-900'>
                          책
                        </th>
                        <th scope='col' className='whitespace-nowrap bg-gray-50 px-3 py-3.5 text-left text-sm font-semibold text-gray-900'>
                          증거 페이지
                        </th>
                        <th scope='col' className='whitespace-nowrap bg-gray-50 px-3 py-3.5 text-left text-sm font-semibold text-gray-900'>
                          증거번호
                        </th>
                        <th scope='col' className='whitespace-nowrap bg-gray-50 px-3 py-3.5 text-left text-sm font-semibold text-gray-900'>
                          수정
                        </th>
                      </tr>
                    </thead>
                    <tbody className='divide-y divide-gray-200 bg-white'>
                      {tableData.map((item) => (
                        <tr key={item.matching_id} className='hover:bg-gray-50'>
                          {editingItem?.matching_id === item.matching_id ? (
                            <>
                              <td className='whitespace-nowrap px-3 py-4'>
                                <input
                                  type='text'
                                  className='w-full rounded-md border border-gray-300 px-2 py-1 text-sm'
                                  value={modifiedData?.pdf_name || ''}
                                  onChange={(e) => handleInputChange(e, 'pdf_name')}
                                />
                              </td>
                              <td className='whitespace-nowrap px-3 py-4'>
                                <input
                                  type='text'
                                  className='w-full rounded-md border border-gray-300 px-2 py-1 text-sm'
                                  value={modifiedData?.pdf_page || ''}
                                  onChange={(e) => handleInputChange(e, 'pdf_page')}
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
                                  value={modifiedData?.evidence_page || ''}
                                  onChange={(e) => handleInputChange(e, 'evidence_page')}
                                />
                              </td>
                              <td className='whitespace-nowrap px-3 py-4'>
                                <input
                                  type='text'
                                  className='w-full rounded-md border border-gray-300 px-2 py-1 text-sm'
                                  value={modifiedData?.evidence_number || ''}
                                  onChange={(e) => handleInputChange(e, 'evidence_number')}
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
                              <td className='whitespace-nowrap px-3 py-4 text-sm text-gray-500'>
                                <span
                                  data-tooltip-id='admin-matching-pdfname-tooltip'
                                  data-tooltip-content={item.pdf_name}
                                  className='block max-w-[500px] truncate'
                                >
                                  {item.pdf_name}
                                </span>
                              </td>
                              <td className='whitespace-nowrap px-3 py-4 text-sm text-gray-500'>{item.pdf_page}</td>
                              <td className='whitespace-nowrap px-3 py-4 text-sm text-gray-500'>{item.sequence_number}</td>
                              <td className='whitespace-nowrap px-3 py-4 text-sm text-gray-500'>{item.evidence_page}</td>
                              <td className='whitespace-nowrap px-3 py-4 text-sm text-gray-500'>{item.evidence_number}</td>
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
          <Tooltip
            id='admin-matching-pdfname-tooltip'
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
          <div className='flex h-[78px] w-full items-center justify-center bg-white shadow-inner'>
            <div className='flex items-center justify-between'>
              <div className='ml-[56px] mr-[26px] text-sm'>전체 {matchingPagination?.total ?? tableData.length}건</div>

              <div className='ml-[26px] flex items-center justify-center'>
                <input
                  type='text'
                  value={matchingPageInput}
                  onChange={(e) => setMatchingPageInputByVersion((prev) => ({ ...prev, [versionKey]: e.target.value }))}
                  placeholder='페이지 번호 입력'
                  className='h-[32px] w-[50px] rounded border border-[#C0D5DE] border-gray-400 p-2 text-center text-[14px] focus:border-[#2B7994] focus:outline-none focus:ring-0'
                  min={1}
                />
                <span className='pl-[8px] pr-2 text-[14px]'>/</span>
                <span className='text-[14px]'>{matchingTotalPages}</span>
                <button
                  onClick={() => handleMatchingPageMove(uploadVersion)}
                  className='ml-2 h-[32px] w-[50px] rounded border text-[14px] text-[#313131]'
                >
                  이동
                </button>
              </div>

              <div className=''>
                <EvidencePagination
                  currentPage={matchingCurrentPage}
                  totalPages={matchingTotalPages}
                  onPageChange={(page) => {
                    fetchMatchingByVersion(uploadVersion || null, { force: true, page_no: page, block_cnt: matchingItemsPerPage });
                  }}
                />
              </div>

              <div className='ml-[26px] flex items-center'>
                <Select
                  value={matchingItemsPerPage.toString()}
                  onValueChange={(value) => {
                    const nextBlockCnt = Number(value);
                    setMatchingItemsPerPageByVersion((prev) => ({ ...prev, [versionKey]: nextBlockCnt }));
                    fetchMatchingByVersion(uploadVersion || null, { force: true, page_no: 1, block_cnt: nextBlockCnt });
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

        {/* 증거문서 테이블 */}
        <div className='mt-6 flex items-center justify-between'>
          <h1 className='mr-4 text-[20px] font-bold'>증거문서{uploadVersion ? ` (${uploadVersion})` : ''}</h1>
        </div>

        <div className='mt-2 flex w-full flex-wrap items-start justify-between gap-2'>
          <div className='flex w-full min-w-0 sm:w-1/2'>
            <div className='relative w-full'>
              <input
                type='text'
                placeholder='증거명칭으로 검색'
                value={evidenceSearchInput}
                onChange={(e) => {
                  setEvidenceSearchInputByVersion((prev) => ({ ...prev, [versionKey]: e.target.value }));
                }}
                onKeyDown={(e) => {
                  if (e.key === 'Enter') {
                    setSelectedItems([]);
                    setEvidenceSearchByVersion((prev) => ({ ...prev, [versionKey]: evidenceSearchInput }));
                    fetchEvidenceByVersion(uploadVersion || null, {
                      force: true,
                      page_no: 1,
                      block_cnt: evidenceItemsPerPage,
                      keyword: evidenceSearchInput,
                    });
                  }
                }}
                className='h-[42px] w-full rounded pr-8 placeholder:text-gray-400 focus:ring-1'
              />
              {evidenceSearchInput && (
                <button
                  onClick={() => {
                    setSelectedItems([]);
                    setEvidenceSearchInputByVersion((prev) => ({ ...prev, [versionKey]: '' }));
                    setEvidenceSearchByVersion((prev) => ({ ...prev, [versionKey]: '' }));
                    fetchEvidenceByVersion(uploadVersion || null, {
                      force: true,
                      page_no: 1,
                      block_cnt: evidenceItemsPerPage,
                      keyword: '',
                    });
                  }}
                  type='button'
                  className='absolute right-5 top-1/2 -translate-y-1/2 transform text-gray-400 hover:text-gray-600'
                >
                  ✕
                </button>
              )}
            </div>
            <button
              onClick={() => {
                setSelectedItems([]);
                setEvidenceSearchByVersion((prev) => ({ ...prev, [versionKey]: evidenceSearchInput }));
                fetchEvidenceByVersion(uploadVersion || null, {
                  force: true,
                  page_no: 1,
                  block_cnt: evidenceItemsPerPage,
                  keyword: evidenceSearchInput,
                });
              }}
              type='button'
              className='ml-2 h-[42px] w-[100px] rounded bg-sky-400 px-4 text-sm font-semibold text-white hover:bg-sky-500'
            >
              검색
            </button>
          </div>
          <div className='flex w-full flex-wrap items-center justify-end gap-2 sm:w-auto'>
            <div className='mr-4 flex'>
              {selectedFilesInfo.count > 0 && (
                <div className='text-md text-gray-600'>
                  선택된 파일: <span className='font-semibold text-blue-500'>{selectedFilesInfo.count}개</span>
                </div>
              )}
              {selectedFilesInfo.count > 0 && (
                <div className={`text-md ml-2 ${selectedFilesInfo.isOverLimit ? 'font-semibold text-red-600' : 'text-gray-600'}`}>
                  용량: {selectedFilesInfo.totalSizeMB.toFixed(2)}MB / 500MB
                  {selectedFilesInfo.isOverLimit && <span className='ml-1'>(초과)</span>}
                </div>
              )}
            </div>
            <div className='flex flex-wrap justify-end gap-2'>
              <button
                onClick={() => downloadEvidenceExcel(uploadVersion)}
                type='button'
                className='flex items-center justify-center rounded-md bg-gray-400 px-3 py-2 text-center text-sm font-semibold text-white shadow-sm hover:bg-gray-500 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-600'
                title='다운로드'
              >
                <IoDownloadOutline className='h-5 w-5' />
              </button>
              <button
                type='button'
                onClick={() => handleApplyEvidence(uploadVersion)}
                disabled={isApplying || isMatchingDataEmpty}
                className={`block rounded-md px-3 py-2 text-center text-sm font-semibold text-white shadow-sm focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-600 ${
                  isMatchingDataEmpty || isApplying ? 'cursor-not-allowed bg-gray-300' : 'bg-sky-400 hover:bg-sky-500'
                }`}
              >
                {isApplying ? '반영 요청중...' : '사용자 증거문서에 반영'}
              </button>
              <button
                type='button'
                onClick={handlePreviewUserView}
                disabled={isMatchingDataEmpty}
                className={`block rounded-md px-3 py-2 text-center text-sm font-semibold text-white shadow-sm focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-600 ${
                  isMatchingDataEmpty ? 'cursor-not-allowed bg-gray-300' : 'bg-green-400 hover:bg-green-500'
                }`}
              >
                사용자 화면 미리보기
              </button>

              <button
                type='button'
                onClick={handleDownloadTEXTZIP}
                disabled={selectedItems.length === 0}
                className={`flex items-center justify-center gap-2 rounded-md px-3 py-2 text-center text-sm font-semibold text-white shadow-sm focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-600 ${
                  selectedItems.length === 0 ? 'cursor-not-allowed bg-gray-300' : 'bg-orange-400 hover:bg-orange-500'
                }`}
              >
                <IoDownloadOutline className='h-4 w-4' />
                TEXT ZIP
              </button>
              <button
                type='button'
                onClick={handleDownloadPDFZIP}
                disabled={selectedItems.length === 0 || selectedFilesInfo.isOverLimit}
                className={`flex items-center justify-center gap-2 rounded-md px-3 py-2 text-center text-sm font-semibold text-white shadow-sm focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-600 ${
                  selectedItems.length === 0 || selectedFilesInfo.isOverLimit
                    ? 'cursor-not-allowed bg-gray-300'
                    : 'bg-red-400 hover:bg-red-500'
                }`}
              >
                <IoDownloadOutline className='h-4 w-4' />
                PDF ZIP
              </button>
            </div>
          </div>
        </div>
        <div className='mt-8 flow-root'>
          {/* 가로 스크롤은 이 래퍼 안에서만 발생 */}
          <div className='w-full overflow-x-auto'>
            <div className='inline-block min-w-full py-2 align-middle'>
              <div className='overflow-hidden shadow ring-1 ring-black/5 sm:rounded-lg'>
                <div className={`${filteredEvidenceTableData.length > 0 ? 'max-h-[650px]' : 'h-[100px]'} overflow-auto`}>
                  <table className='w-full min-w-max divide-y divide-gray-300'>
                    <thead className='sticky top-0 z-10 bg-gray-50'>
                      <tr>
                        <th scope='col' className='whitespace-nowrap bg-gray-50 px-3 py-3.5 text-left text-sm font-semibold text-gray-900'>
                          <input
                            type='checkbox'
                            checked={getCheckboxState(filteredEvidenceTableData).isAllSelected}
                            ref={(input) => {
                              if (input) input.indeterminate = getCheckboxState(filteredEvidenceTableData).isIndeterminate;
                            }}
                            onChange={(e) => handleSelectAll(e.target.checked, filteredEvidenceTableData)}
                          />
                        </th>
                        <th scope='col' className='whitespace-nowrap bg-gray-50 px-3 py-3.5 text-left text-sm font-semibold text-gray-900'>
                          증거번호
                        </th>
                        <th scope='col' className='whitespace-nowrap bg-gray-50 px-3 py-3.5 text-left text-sm font-semibold text-gray-900'>
                          시작페이지/총페이지
                        </th>
                        <th scope='col' className='whitespace-nowrap bg-gray-50 px-3 py-3.5 text-left text-sm font-semibold text-gray-900'>
                          <DropdownFilter
                            column='증거명칭'
                            options={evidenceTitleOptions}
                            isOpen={openEvidenceTitleFilterVersion === versionKey}
                            disableUserInfo
                            appliedValues={titleSelectedForUi}
                            onToggle={() => {
                              setOpenEvidenceCategoryFilterVersion(null);
                              setOpenEvidenceTitleFilterVersion((prev) => (prev === versionKey ? null : versionKey));
                            }}
                            onFilter={(values) => {
                              const next = values.length >= evidenceTitleOptions.length ? [] : values;
                              setEvidenceTitleFiltersByVersion((prev) => ({ ...prev, [versionKey]: next }));
                              setSelectedItems([]);
                              fetchEvidenceByVersion(uploadVersion || null, {
                                force: true,
                                page_no: 1,
                                block_cnt: evidenceItemsPerPage,
                                keyword: evidenceSearchByVersion[versionKey] ?? '',
                                filtersOverride: {
                                  evidence_title: next,
                                  category: appliedCategory,
                                },
                              });
                            }}
                          />
                        </th>
                        <th scope='col' className='whitespace-nowrap bg-gray-50 px-3 py-3.5 text-left text-sm font-semibold text-gray-900'>
                          <DropdownFilter
                            column='구분'
                            options={evidenceCategoryOptions}
                            isOpen={openEvidenceCategoryFilterVersion === versionKey}
                            disableUserInfo
                            appliedValues={categorySelectedForUi}
                            onToggle={() => {
                              setOpenEvidenceTitleFilterVersion(null);
                              setOpenEvidenceCategoryFilterVersion((prev) => (prev === versionKey ? null : versionKey));
                            }}
                            onFilter={(values) => {
                              const next = values.length >= evidenceCategoryOptions.length ? [] : values;
                              setEvidenceCategoryFiltersByVersion((prev) => ({ ...prev, [versionKey]: next }));
                              setSelectedItems([]);
                              fetchEvidenceByVersion(uploadVersion || null, {
                                force: true,
                                page_no: 1,
                                block_cnt: evidenceItemsPerPage,
                                keyword: evidenceSearchByVersion[versionKey] ?? '',
                                filtersOverride: {
                                  evidence_title: appliedTitle,
                                  category: next,
                                },
                              });
                            }}
                          />
                        </th>
                        <th scope='col' className='whitespace-nowrap bg-gray-50 px-3 py-3.5 text-left text-sm font-semibold text-gray-900'>
                          PDF보기
                        </th>
                        <th scope='col' className='whitespace-nowrap bg-gray-50 px-3 py-3.5 text-left text-sm font-semibold text-gray-900'>
                          TXT보기
                        </th>
                      </tr>
                    </thead>
                    <tbody className='divide-y divide-gray-200 bg-white'>
                      {filteredEvidenceTableData.map((item) => (
                        <tr key={item.evidence_id} className='hover:bg-gray-50'>
                          <td className='whitespace-nowrap px-3 py-4 text-sm text-gray-500'>
                            <input
                              type='checkbox'
                              checked={selectedItems.includes(item.evidence_id)}
                              onChange={(e) => handleSelectItem(item.evidence_id, e.target.checked)}
                            />
                          </td>
                          <td className='whitespace-nowrap px-3 py-4 text-sm text-gray-500'>{item.evidence_number}</td>
                          <td className='whitespace-nowrap px-3 py-4 text-sm text-gray-500'>
                            {item.start_page} / {item.page_count}
                          </td>
                          <td className='whitespace-nowrap px-3 py-4 text-sm text-gray-500'>
                            <span
                              data-tooltip-id='admin-matching-evidence-title-tooltip'
                              data-tooltip-content={item.evidence_title}
                              className='block max-w-[520px] truncate'
                            >
                              {item.evidence_title}
                            </span>
                          </td>
                          <td className='whitespace-nowrap px-3 py-4 text-sm text-gray-500'>{item.category}</td>
                          <td className='whitespace-nowrap px-3 py-4 text-sm text-gray-500'>
                            {item.pdf_path ? (
                              <button onClick={() => handleViewPDF(item.evidence_id)} className='underline'>
                                PDF보기
                              </button>
                            ) : (
                              <span className='text-gray-300'>PDF없음</span>
                            )}
                          </td>
                          <td className='whitespace-nowrap px-3 py-4 text-sm text-gray-500'>
                            {item.text_path ? (
                              <button onClick={() => handleViewTXT(item.evidence_id)} className='underline'>
                                TXT보기
                              </button>
                            ) : (
                              <span className='text-gray-300'>TXT없음</span>
                            )}
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
        <Tooltip
          id='admin-matching-evidence-title-tooltip'
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
        <div className='flex h-[78px] w-full items-center justify-center bg-white shadow-inner'>
          <div className='flex items-center justify-between'>
            <div className='ml-[56px] mr-[26px] text-sm'>
              전체 {evidencePagination?.total ?? filteredEvidenceTableData.length}건
              {evidenceSearch.trim() ? <span className='ml-2 text-gray-500'>(검색: "{evidenceSearch}" 적용)</span> : null}
            </div>

            <div className='ml-[26px] flex items-center justify-center'>
              <input
                type='text'
                value={evidencePageInput}
                onChange={(e) => setEvidencePageInputByVersion((prev) => ({ ...prev, [versionKey]: e.target.value }))}
                placeholder='페이지 번호 입력'
                className='h-[32px] w-[50px] rounded border border-[#C0D5DE] border-gray-400 p-2 text-center text-[14px] focus:border-[#2B7994] focus:outline-none focus:ring-0'
                min={1}
              />
              <span className='pl-[8px] pr-2 text-[14px]'>/</span>
              <span className='text-[14px]'>{evidenceTotalPages}</span>
              <button
                onClick={() => handleEvidencePageMove(uploadVersion)}
                className='ml-2 h-[32px] w-[50px] rounded border text-[14px] text-[#313131]'
              >
                이동
              </button>
            </div>

            <div className=''>
              <EvidencePagination
                currentPage={evidenceCurrentPage}
                totalPages={evidenceTotalPages}
                onPageChange={(page) => {
                  setSelectedItems([]);
                  fetchEvidenceByVersion(uploadVersion || null, {
                    force: true,
                    page_no: page,
                    block_cnt: evidenceItemsPerPage,
                    keyword: evidenceSearchByVersion[versionKey] ?? '',
                  });
                }}
              />
            </div>

            <div className='ml-[26px] flex items-center'>
              <Select
                value={evidenceItemsPerPage.toString()}
                onValueChange={(value) => {
                  const nextBlockCnt = Number(value);
                  setEvidenceItemsPerPageByVersion((prev) => ({ ...prev, [versionKey]: nextBlockCnt }));
                  setSelectedItems([]);
                  fetchEvidenceByVersion(uploadVersion || null, {
                    force: true,
                    page_no: 1,
                    block_cnt: nextBlockCnt,
                    keyword: evidenceSearchByVersion[versionKey] ?? '',
                  });
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
    );
  };

  return (
    <div className='max-h-[calc(100vh-200px)] w-full overflow-auto overflow-x-hidden pl-[20px] scrollbar-hide'>
      <div className=''>
        {/* 기존 매칭목록 테이블 */}
        {originalMatching && renderMatchingTable(' 매칭테이블', null)}

        {/* 날짜별 매칭목록 테이블들 */}
        {versionedMatching.map((versionData, index) => (
          <div key={index}>{renderMatchingTable(`매칭테이블 (${versionData.upload_version})`, versionData.upload_version)}</div>
        ))}
      </div>

      {/* 업로드 모달 */}
      <AdminMatchingModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        selectedProjectId={selectedProjectId}
        selectedOfficeId={selectedOfficeId}
        uploadVersion={selectedUploadVersion}
        onSuccess={() => {
          // 업로드 성공 후 해당 버전의 데이터 다시 조회
          const versionKey = selectedUploadVersion || 'original';
          fetchMatchingByVersion(selectedUploadVersion || null, {
            force: true,
            page_no: matchingPageByVersion[versionKey] ?? 1,
            block_cnt: matchingItemsPerPageByVersion[versionKey] ?? 50,
          });
        }}
      />
      {errorModalOpen && (
        <ModalSelect
          sendMessage='작업 실패'
          storageMessage={errorMessage}
          handleSave={() => setErrorModalOpen(false)}
          setIsModalOpen={() => setErrorModalOpen(false)}
          confirmButtonText='확인'
        />
      )}
      {successModalOpen && (
        <ModalSelect
          sendMessage='요청 성공'
          storageMessage={successMessage}
          handleSave={() => setSuccessModalOpen(false)}
          setIsModalOpen={() => setSuccessModalOpen(false)}
          confirmButtonText='확인'
        />
      )}
      {confirmModalOpen && (
        <ModalSelect
          sendMessage='확인'
          storageMessage='사용자 증거문서에 반영하시겠습니까?'
          handleSave={() => {
            setConfirmModalOpen(false);
            executeApplyEvidence();
          }}
          setIsModalOpen={() => {
            setConfirmModalOpen(false);
            setApplyUploadVersion(null);
          }}
          confirmButtonText='예'
        />
      )}
      {resetConfirmModalOpen && (
        <ModalSelect
          sendMessage='확인'
          storageMessage='매칭 테이블이 삭제됩니다. 초기화 하시겠습니까?'
          handleSave={() => {
            setResetConfirmModalOpen(false);
            executeResetTable();
          }}
          setIsModalOpen={() => setResetConfirmModalOpen(false)}
          confirmButtonText='예'
        />
      )}
      {resetEvidenceConfirmModalOpen && (
        <ModalSelect
          sendMessage='확인'
          storageMessage='사용자 테이블의 북마크 메모 핀 태그 정보가 초기화됩니다. 초기화 하시겠습니까?'
          handleSave={() => {
            setResetEvidenceConfirmModalOpen(false);
            executeResetEvidence();
          }}
          setIsModalOpen={() => setResetEvidenceConfirmModalOpen(false)}
          confirmButtonText='예'
        />
      )}
    </div>
  );
};
