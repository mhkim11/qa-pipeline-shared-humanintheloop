import { useEffect, useMemo, useState } from 'react';

import { FilePlus, Files, PencilLine } from 'lucide-react';
import { useNavigate, useSearchParams } from 'react-router-dom';

import { useFindUserInfo } from '@query/query';
import { CaseSideBar, CaseHeader } from '@components/common';
import { CaseAuthorityTable, CaseMainListTable } from '@/components/case-evidence';
import { CaseDocumentEditorWrapper } from '@/components/case-evidence/case-detail-list/case-document-editor/wrapper/case-document-editor-wrapper';
import CaseDetailListTable from '@/components/case-evidence/case-detail-list/table/case-detail-list-table';
import CaseRequestDocumentListTable from '@/components/case-evidence/case-detail-list/table/case-request-document-list-table';
import CaseRequestListTable from '@/components/case-evidence/request-list/table/case-request-list-table';

type TActiveMenu = '기록 목록' | '자료 요청' | '전체 자료' | '서면 작성' | '권한관리';

const TAB_TO_MENU: Record<string, TActiveMenu> = {
  list: '기록 목록',
  client: '자료 요청',
  client_request: '자료 요청',
  client_list: '전체 자료',
  editor: '서면 작성',
  authority: '권한관리',
};

const MENU_TO_TAB: Record<TActiveMenu, string> = {
  '기록 목록': 'list',
  '자료 요청': 'client_request',
  '전체 자료': 'client_list',
  '서면 작성': 'editor',
  권한관리: 'authority',
};

const CaseEvidenceHomePage = (): JSX.Element => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const [activeMenu, setActiveMenu] = useState<TActiveMenu>('기록 목록');
  const [selectedCaseId, setSelectedCaseId] = useState<string | null>(null);
  const [selectedCaseDocumentId, setSelectedCaseDocumentId] = useState<string | null>(null);

  const [isSideBarCollapsed, setIsSideBarCollapsed] = useState(false);
  const [caseDetailListReloadNonce, setCaseDetailListReloadNonce] = useState(0);

  const { response: findEvidenceUserInfo } = useFindUserInfo();

  // ! 유저 컬러 팔레트 매핑
  const userColor = useMemo(() => {
    const palette: Record<string, string> = {
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
    const c = findEvidenceUserInfo?.data?.user_color || '';
    return palette[c] || '#E5E7EB';
  }, [findEvidenceUserInfo?.data?.user_color]);

  // ! 유저 이니셜 추출
  const userInitial = useMemo(() => {
    const nickname = findEvidenceUserInfo?.data?.nickname?.trim();
    if (nickname) return nickname.charAt(0);
    const name = findEvidenceUserInfo?.data?.name?.trim();
    if (name) return name.charAt(0);
    return '';
  }, [findEvidenceUserInfo?.data?.nickname, findEvidenceUserInfo?.data?.name]);

  const userThumb = findEvidenceUserInfo?.data?.thumbnail_url || '';

  // ! URL 탭 파라미터 업데이트
  const setTabInUrl = (menu: TActiveMenu, opts?: { replace?: boolean }) => {
    const preserved = new URLSearchParams(searchParams);
    preserved.set('tab', MENU_TO_TAB[menu]);
    const qs = preserved.toString();
    navigate(`/case-list${qs ? `?${qs}` : ''}`, { replace: opts?.replace === true });
  };

  // ! URL 파라미터 기반 상태 초기화
  useEffect(() => {
    setSelectedCaseDocumentId(searchParams.get('case_document_id'));
    const tab = searchParams.get('tab') || 'list';
    // 레거시 처리: client_hidden은 client_list로 변환
    const normalizedTab = tab === 'client_hidden' ? 'client_list' : tab;
    setActiveMenu(TAB_TO_MENU[normalizedTab] ?? '기록 목록');

    // 민사: civil_case_id가 있으면 해당 값으로 의뢰인 문서 목록 조회
    const civilCaseId = searchParams.get('civil_case_id');
    if (civilCaseId) {
      setSelectedCaseId(civilCaseId);
      return;
    }

    // 형사: project_id/project_name/client_name 형태로 전달받는 경우
    const projectId = searchParams.get('project_id');
    if (projectId) {
      setSelectedCaseId(projectId);
      return;
    }

    // 레거시: URL에서 caseId 파라미터 확인
    const caseId = searchParams.get('caseId');
    if (caseId) {
      setSelectedCaseId(caseId);
      // 레거시 파라미터로 들어온 경우 기본 탭 보정
      if (!searchParams.get('tab')) setActiveMenu('자료 요청');
    }
  }, [searchParams]);

  // ! 기록 목록으로 이동
  const handleGoToRecordList = (opts?: { forceReload?: boolean }) => {
    setActiveMenu('기록 목록');
    if (opts?.forceReload) setCaseDetailListReloadNonce((v) => v + 1);
    const preserved = new URLSearchParams();
    for (const key of ['civil_case_id', 'project_id', 'project_name', 'client_name'] as const) {
      const value = searchParams.get(key);
      if (value) preserved.set(key, value);
    }
    preserved.set('tab', MENU_TO_TAB['기록 목록']);
    // 기록 목록으로 돌아갈 때 선택된 문서 파라미터 제거
    preserved.delete('case_document_id');
    const qs = preserved.toString();
    // UI 버튼으로 목록 이동 시 replace로 히스토리 오염 방지
    navigate(`/case-list${qs ? `?${qs}` : ''}`, { replace: true });
    setSelectedCaseDocumentId(null);
  };

  // ! 사건 문서 열기
  const openCaseDocument = (caseDocumentId: string) => {
    if (!caseDocumentId) return;
    setSelectedCaseDocumentId(caseDocumentId);
    setCaseDetailListReloadNonce((v) => v + 1);

    const preserved = new URLSearchParams();
    for (const key of ['civil_case_id', 'project_id', 'project_name', 'client_name'] as const) {
      const value = searchParams.get(key);
      if (value) preserved.set(key, value);
    }
    preserved.set('tab', MENU_TO_TAB['기록 목록']);
    preserved.set('case_document_id', caseDocumentId);
    const qs = preserved.toString();
    // 문서 열기는 push로 남겨서 브라우저 뒤로가기로 목록으로 돌아갈 수 있게 함
    navigate(`/case-list${qs ? `?${qs}` : ''}`, { replace: false });
  };

  return (
    <>
      <div className='h-screen overflow-hidden bg-[#f4f4f5]'>
        <CaseHeader />
        {/* 좌측 사이드바 폭 변경 시 가운데 컨텐츠가 함께 shrink 되려면 min-w-0 필요 */}
        <div className='flex h-full min-w-0 overflow-hidden'>
          <div className='flex-shrink-0 pt-[48px]'>
            <CaseSideBar
              isCollapsed={isSideBarCollapsed}
              onToggleCollapsed={() => setIsSideBarCollapsed((v) => !v)}
              onClickUsers={() => setActiveMenu('권한관리')}
              onClickSettings={() => navigate('/settings')}
              avatar={{
                text: userInitial,
                imageUrl: userThumb || undefined,
                bgColor: userColor,
              }}
              items={[
                {
                  key: 'list',
                  label: '기록 목록 ',
                  icon: <Files className='h-5 w-5' />,
                  isActive: activeMenu === '기록 목록',
                  onClick: () => {
                    setTabInUrl('기록 목록');
                    handleGoToRecordList({ forceReload: true });
                  },
                },
                {
                  key: 'client',
                  label: '의뢰인 자료',
                  icon: <FilePlus className='h-5 w-5' />,
                  isActive: activeMenu === '자료 요청' || activeMenu === '전체 자료',
                  onClick: () => {
                    if (!selectedCaseId) return;
                    setActiveMenu('자료 요청');
                    setTabInUrl('자료 요청');
                  },
                  children: [
                    {
                      key: 'client_request',
                      label: '자료 요청',
                      isActive: activeMenu === '자료 요청',
                      onClick: () => {
                        if (!selectedCaseId) return;
                        setActiveMenu('자료 요청');
                        setTabInUrl('자료 요청');
                      },
                    },
                    {
                      key: 'client_list',
                      label: '전체 자료',
                      isActive: activeMenu === '전체 자료',
                      onClick: () => {
                        if (!selectedCaseId) return;
                        setActiveMenu('전체 자료');
                        setTabInUrl('전체 자료');
                      },
                    },
                  ],
                },
                {
                  key: '서면 작성',
                  label: '서면 작성',
                  icon: <PencilLine className='h-5 w-5' />,
                  isActive: activeMenu === '서면 작성',
                  onClick: () => {
                    setActiveMenu('서면 작성');
                    setTabInUrl('서면 작성');
                  },
                },
              ]}
            />
          </div>
          {/* flex row에서 overflow 방지를 위해 w-full 제거, min-w-0+flex-1 사용 */}
          <main className='flex min-w-0 flex-1 flex-col overflow-hidden'>
            <div className='min-h-0 min-w-0 flex-1'>
              {activeMenu === '서면 작성' ? (
                <CaseDocumentEditorWrapper />
              ) : activeMenu === '권한관리' ? (
                <CaseAuthorityTable />
              ) : activeMenu === '자료 요청' && selectedCaseId ? (
                <CaseRequestListTable civilCaseId={selectedCaseId} />
              ) : activeMenu === '전체 자료' && selectedCaseId ? (
                <CaseRequestDocumentListTable
                  title={activeMenu}
                  civilCaseId={selectedCaseId}
                  evidenceRequestId={searchParams.get('evidence_request_id')}
                  onSelectCaseDocumentId={openCaseDocument}
                />
              ) : activeMenu === '기록 목록' && !selectedCaseDocumentId ? (
                <CaseMainListTable title={activeMenu} civilCaseId={selectedCaseId} onSelectCaseDocumentId={openCaseDocument} />
              ) : (
                <CaseDetailListTable
                  key={`${selectedCaseId ?? 'none'}-${selectedCaseDocumentId ?? 'none'}-${caseDetailListReloadNonce}`}
                  title={activeMenu}
                  civilCaseId={selectedCaseId}
                  initialCaseDocumentId={selectedCaseDocumentId}
                  onExitToMainList={() => handleGoToRecordList({ forceReload: true })}
                />
              )}
            </div>
          </main>
        </div>
      </div>
    </>
  );
};

export default CaseEvidenceHomePage;
