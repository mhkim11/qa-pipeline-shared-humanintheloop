import { useEffect, useMemo, useState } from 'react';

import { useSearchParams } from 'react-router-dom';

import { useGetRequestDocumentList } from '@query/query';
import { CaseUploadModal } from '@/components/case-evidence';
import RequestHideListPanel from '@/components/case-evidence/request-list/panels/request-hide-list-panel';
import { onMessageToast } from '@/components/utils';

type TCaseMainListTableProps = {
  title: string;
  civilCaseId?: string | null;
  evidenceRequestId?: string | null;
  /** 사건(문서) 선택 시 상세 화면으로 전환하기 위한 콜백 */
  onSelectCaseDocumentId: (caseDocumentId: string) => void;
};

type TDocumentItem = {
  id: string;
  title: string;
  date: string;
  type: '실체 서면' | '서증' | '그 외';
  party: '원고' | '피고';
  projectId?: string;
  civilCaseId?: string;
  caseDocumentId?: string;
  attachmentUrl?: string;
  documentDate?: string;
  parsedCategory?: string;
  parsedSubCategory?: string;
  parsedSubmitterType?: string;
  parsedSubmitterName?: string;
  clippingCount?: number;
  noteCount?: number;
  isPinned?: boolean;
  isBookmarked?: boolean;
  bookmarkCount?: number;
  tags?: string[];
  highlights?: any[];
  content?: Array<{ page_number: number; description: string }>;
  steps?: any[];
  ocrStep?: string;
  ocrStatus?: string;
};

const CaseRequestHideListTable = ({
  title,
  civilCaseId,
  evidenceRequestId: _evidenceRequestId,
  onSelectCaseDocumentId,
}: TCaseMainListTableProps): JSX.Element => {
  const [searchParams] = useSearchParams();
  const requestId = String(_evidenceRequestId ?? searchParams.get('evidence_request_id') ?? '').trim();
  const evidenceCategory = 'IRRELEVANT' as const;
  const [selectedFilter, setSelectedFilter] = useState<string>('전체');
  const [selectedDocument, setSelectedDocument] = useState<TDocumentItem | null>(null);
  const [expandedParents, setExpandedParents] = useState<Record<string, boolean>>({});
  const [isUploadModalOpen, setIsUploadModalOpen] = useState(false);
  const isCivilMode = true;
  const [civilListQuery, setCivilListQuery] = useState<{
    keyword: string;
    keywordVersion: number;
    power_search: string;
    filters: {
      parsed_category: string[];
      parsed_submitter_name: string[];
      tags: string[];
      bookmark: boolean;
      memo: boolean;
      clipping: boolean;
    };
    sortColumn: 'document_date' | 'parsed_category' | 'parsed_submitter_name' | 'clipping_count' | 'memo_count' | 'bookmark_count';
    sortDirection: 'asc' | 'desc';
    page: number;
    limit: number;
  }>({
    keyword: '',
    keywordVersion: 0,
    power_search: '',
    filters: {
      parsed_category: [],
      parsed_submitter_name: [],
      tags: [],
      bookmark: false,
      memo: false,
      clipping: false,
    },
    sortColumn: 'document_date',
    sortDirection: 'desc',
    page: 1,
    limit: 20,
  });
  const toggleParent = (key: string) => setExpandedParents((prev) => ({ ...prev, [key]: !prev[key] }));

  const {
    response: requestDocsResponse,
    isLoading: isCivilDocListLoading,
    refetch: refetchCivilCaseDocs,
  } = useGetRequestDocumentList({
    input: requestId
      ? {
          evidence_request_id: requestId,
          evidence_category: evidenceCategory,
          page: civilListQuery.page,
          limit: civilListQuery.limit,
        }
      : null,
  });

  const civilPagination = useMemo(() => {
    const raw = requestDocsResponse as any;
    const p = raw?.pagination ?? raw?.data?.pagination ?? null;
    const page = Number(p?.page ?? civilListQuery.page ?? 1);
    const limit = Number(p?.limit ?? civilListQuery.limit ?? 100);
    const total = Number(p?.total ?? 0);
    const pages = Number(p?.pages ?? (total > 0 ? Math.ceil(total / Math.max(1, limit)) : 1));
    return { total, page, limit, pages };
  }, [requestDocsResponse, civilListQuery.limit, civilListQuery.page]);

  const documents = useMemo<TDocumentItem[]>(() => {
    // API 응답 shape이 환경/버전별로 달라질 수 있어 배열을 방어적으로 추출한다.
    const rawDocs: any = requestDocsResponse as any;
    const data: any[] = Array.isArray(rawDocs)
      ? rawDocs
      : Array.isArray(rawDocs?.data)
        ? rawDocs.data
        : Array.isArray(rawDocs?.results)
          ? rawDocs.results
          : Array.isArray(rawDocs?.files)
            ? rawDocs.files
            : Array.isArray(rawDocs?.data?.results)
              ? rawDocs.data.results
              : [];
    if (!Array.isArray(data) || data.length === 0) return [];

    const formatDate = (iso: string) => {
      if (!iso) return '';
      const d = new Date(iso);
      if (Number.isNaN(d.getTime())) return iso;
      const y = d.getFullYear();
      const m = String(d.getMonth() + 1).padStart(2, '0');
      const day = String(d.getDate()).padStart(2, '0');
      return `${y}.${m}.${day}`;
    };

    const mapDocType = (raw: string): TDocumentItem['type'] => {
      if (raw === '실체 서면' || raw === '서증' || raw === '그 외') return raw;
      if (raw?.includes('서증')) return '서증';
      if (raw?.includes('서면') || raw?.includes('소장') || raw?.includes('준비') || raw?.includes('답변')) return '실체 서면';
      return '그 외';
    };

    return data.map((d: any) => {
      const docDateRaw = String(d.document_date ?? d.documentDate ?? d.createdAt ?? '');
      const asBool = (v: unknown) => v === true || v === 'true' || v === 1 || v === '1';
      return {
        id: d.case_document_id || d.attachment_id || `${d.title}:${d.createdAt}`,
        title: String(d.file_name ?? d.fileName ?? d.parsed_sub_category ?? d.parsedSubCategory ?? d.title ?? ''),
        date: formatDate(docDateRaw),
        type: mapDocType(String(d.document_type ?? '')),
        party: d.is_plaintiff ? '원고' : '피고',
        projectId: d.project_id,
        civilCaseId: d.civil_case_id,
        caseDocumentId: d.case_document_id,
        attachmentUrl: d.file_url,
        documentDate: docDateRaw,
        parsedCategory: String(d.parsed_category ?? d.parsedCategory ?? ''),
        parsedSubCategory: String(d.file_name ?? d.fileName ?? d.parsed_sub_category ?? d.parsedSubCategory ?? ''),
        parsedSubmitterType: String(d.parsed_submitter_type ?? d.parsedSubmitterType ?? ''),
        parsedSubmitterName: String(d.parsed_submitter_name ?? d.parsedSubmitterName ?? ''),
        clippingCount: Number(d.clipping_count ?? d.clippingCount ?? 0),
        // 메모 개수: 최신 스펙 memo_count 우선
        noteCount: Number(d.memo_count ?? d.memoCount ?? d.note_count ?? d.noteCount ?? 0),
        isPinned: asBool(d.isPinned ?? d.is_pinned),
        isBookmarked: asBool(d.isBookmarked ?? d.is_bookmarked),
        bookmarkCount: Number(d.bookmarkCount ?? 0),
        tags: Array.isArray(d.tags) ? d.tags : [],
        highlights: Array.isArray(d.highlights) ? d.highlights : [],
        content: (() => {
          const raw = (d as any)?.content ?? (d as any)?.contents ?? (d as any)?.text_content ?? (d as any)?.textContent ?? null;
          const arr = Array.isArray(raw) ? raw : Array.isArray(raw?.content) ? raw.content : null;
          return Array.isArray(arr)
            ? arr
                .map((c: any) => ({
                  page_number: Number(c?.page_number ?? c?.pageNumber ?? 0),
                  description: String(c?.description ?? ''),
                }))
                .filter((c: any) => Number.isFinite(c.page_number) && c.page_number > 0)
            : [];
        })(),
        steps: Array.isArray(d.steps) ? d.steps : [],
        ocrStep: String(d.ocr_step ?? d.ocrStep ?? ''),
        ocrStatus: String(d.ocr_status ?? d.ocrStatus ?? ''),
      };
    });
  }, [requestDocsResponse]);

  const filteredDocuments = useMemo(() => {
    if (selectedFilter === '전체') return documents;
    if (selectedFilter === '피고측 기록') return documents.filter((d) => d.party === '피고');
    if (selectedFilter === '원고측 기록') return documents.filter((d) => d.party === '원고');
    // 법원측 기록 분류 기준이 확정되면 적용
    if (selectedFilter === '법원측 기록') return [];
    return documents;
  }, [documents, selectedFilter]);

  const monthTree = useMemo(() => {
    // 민사: 캡쳐 UI는 테이블 기반이므로 flat list로 제공한다.
    if (isCivilMode) {
      if (filteredDocuments.length === 0) return [];
      return [
        {
          monthKey: 'civil',
          monthLabel: '',
          nodes: filteredDocuments.map((d) => ({ key: `civil:${d.id}`, parent: d, children: [] })),
        },
      ];
    }

    const parseMonthKey = (date: string) => {
      const parts = date
        .split('.')
        .map((s) => s.trim())
        .filter(Boolean);
      const y = parts[0] || '';
      const m = parts[1] || '';
      return y && m ? `${y}.${m}` : date;
    };
    const toMonthLabel = (monthKey: string) => {
      const [y, m] = monthKey.split('.');
      if (!y || !m) return monthKey;
      return `${y}. ${m}.`;
    };

    const byMonth = filteredDocuments.reduce(
      (acc, doc) => {
        const mk = parseMonthKey(doc.date);
        if (!acc[mk]) acc[mk] = [];
        acc[mk].push(doc);
        return acc;
      },
      {} as Record<string, TDocumentItem[]>,
    );

    const months = Object.keys(byMonth).sort((a, b) => b.localeCompare(a));

    return months.map((mk) => {
      const docs = byMonth[mk] || [];
      return {
        monthKey: mk,
        monthLabel: toMonthLabel(mk),
        nodes: docs.map((d) => ({ key: `${mk}:${d.id}`, parent: d, children: [] })),
      };
    });
  }, [filteredDocuments, isCivilMode]);

  useEffect(() => {
    if (filteredDocuments.length === 0) return;
    setExpandedParents((prev) => (prev['civil:complaint'] === undefined ? { ...prev, ['civil:complaint']: true } : prev));
  }, [filteredDocuments.length]);

  const handleDocumentClick = (doc: any) => {
    const d = doc as TDocumentItem;
    setSelectedDocument(d);
    if (d.caseDocumentId) onSelectCaseDocumentId(String(d.caseDocumentId));
  };

  return (
    <div className='flex h-screen flex-col overflow-hidden bg-[#f4f4f5] pb-[10px] pr-[10px] pt-[50px]'>
      <div className='flex min-h-0 w-full min-w-0 flex-1 justify-center overflow-hidden rounded-[16px] border border-[#D4D4D8] bg-white'>
        <div className='flex min-h-0 min-w-0 flex-1'>
          <div className='flex h-full min-w-0 flex-1 flex-col'>
            <div className='flex min-h-0 min-w-0 flex-1'>
              <div className='flex w-full'>
                <RequestHideListPanel
                  title={title}
                  selectedFilter={selectedFilter}
                  setSelectedFilter={setSelectedFilter}
                  isCivilMode={true}
                  isLoading={isCivilDocListLoading}
                  monthTree={monthTree as any}
                  expandedParents={expandedParents}
                  toggleParent={toggleParent}
                  handleDocumentClick={handleDocumentClick}
                  selectedDocument={selectedDocument}
                  showRecordSearchInput={true}
                  civilListQuery={civilListQuery as any}
                  civilPagination={civilPagination}
                  onChangeCivilListQuery={(patch) => {
                    setCivilListQuery((prev) => {
                      const next = { ...prev, ...(patch as any) } as any;
                      const touch =
                        Object.prototype.hasOwnProperty.call(patch, 'filters') ||
                        Object.prototype.hasOwnProperty.call(patch, 'sortColumn') ||
                        Object.prototype.hasOwnProperty.call(patch, 'sortDirection') ||
                        Object.prototype.hasOwnProperty.call(patch, 'limit');
                      if (touch && !Object.prototype.hasOwnProperty.call(patch, 'page')) next.page = 1;
                      return next;
                    });
                  }}
                  onClickAddRecord={() => {
                    if (!civilCaseId) {
                      onMessageToast({ message: '민사 사건에서만 업로드할 수 있습니다.' });
                      return;
                    }
                    setIsUploadModalOpen(true);
                  }}
                />
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* 기록(민사 문서) 업로드 모달 */}
      <CaseUploadModal
        isOpen={isUploadModalOpen}
        civilCaseId={civilCaseId ?? undefined}
        onClose={() => setIsUploadModalOpen(false)}
        onSuccess={() => {
          refetchCivilCaseDocs();
          setIsUploadModalOpen(false);
        }}
        // 서버 스펙 필수값이므로 기본값 제공 (필요 시 추후 UI에서 선택 가능)
        isPlaintiff={true}
        documentType='OTHER'
      />
    </div>
  );
};

export default CaseRequestHideListTable;
