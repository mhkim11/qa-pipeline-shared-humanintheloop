import { useEffect, useState } from 'react';

import { Check, Search, X } from 'lucide-react';
import { createPortal } from 'react-dom';

import { fetchGetDocumentList } from '@/apis/case-api/civil-case-api';

type TMatchEvidenceModalProps = {
  open: boolean;
  civilCaseId: string;
  caseDocumentId: string;
  onClose: () => void;
  onConfirm: (lawyerDocumentIds: string[]) => void;
  isConfirming: boolean;
};

// ! 날짜 포맷
const formatDate = (raw: unknown) => {
  const s = String(raw ?? '').trim();
  if (!s) return '';

  const m0 = s.match(/^(\d{4})(\d{2})(\d{2})$/);
  if (m0) return `${m0[1]}.${m0[2]}.${m0[3]}`;

  const m1 = s.match(/^(\d{4})[.-](\d{1,2})[.-](\d{1,2})/);
  if (m1) {
    const mm = String(Number(m1[2])).padStart(2, '0');
    const dd = String(Number(m1[3])).padStart(2, '0');
    return `${m1[1]}.${mm}.${dd}`;
  }

  const d = new Date(s);
  if (Number.isNaN(d.getTime())) return s;

  const parts = new Intl.DateTimeFormat('ko-KR', {
    timeZone: 'Asia/Seoul',
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
  }).formatToParts(d);

  const y = parts.find((p) => p.type === 'year')?.value ?? '';
  const mm = parts.find((p) => p.type === 'month')?.value ?? '';
  const dd = parts.find((p) => p.type === 'day')?.value ?? '';

  if (y && mm && dd) return `${y}.${mm}.${dd}`;
  return s;
};

export function MatchEvidenceModal({ open, civilCaseId, caseDocumentId, onClose, onConfirm, isConfirming }: TMatchEvidenceModalProps) {
  const [docList, setDocList] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [selectedIds, setSelectedIds] = useState<string[]>([]);
  const [searchQuery, setSearchQuery] = useState('');

  // ! 모달 열릴 때 문서 목록 패치
  useEffect(() => {
    if (!open) return;
    setSelectedIds([]);
    setSearchQuery('');
    setDocList([]);
    setIsLoading(true);
    fetchGetDocumentList(civilCaseId, 1, 1000, { source_type: 'LAWYER' })
      .then((res) => {
        const raw = (res as any)?.data;
        const docs: any[] = Array.isArray(raw?.results) ? raw.results : Array.isArray(raw) ? raw : [];
        setDocList(
          docs.filter((d: any) => {
            const did = String(d?.case_document_id ?? d?.caseDocumentId ?? '');
            return did && did !== caseDocumentId;
          }),
        );
      })
      .catch(() => setDocList([]))
      .finally(() => setIsLoading(false));
  }, [open, civilCaseId, caseDocumentId]);

  if (!open || typeof document === 'undefined') return null;

  const filtered = docList.filter((doc: any) => {
    if (!searchQuery.trim()) return true;
    const docTitleFilter = String(doc?.parsed_sub_category ?? doc?.parsedSubCategory ?? doc?.title ?? '');
    return docTitleFilter.toLowerCase().includes(searchQuery.trim().toLowerCase());
  });

  return createPortal(
    <div className='fixed inset-0 z-[10000] flex items-center justify-center'>
      <div className='absolute inset-0 bg-gray-500 opacity-75' onClick={onClose} />
      <div
        className='relative z-10 flex shrink-0 flex-col items-end rounded-[16px] bg-white shadow-xl'
        style={{ width: 640, maxHeight: 474 }}
      >
        {/* 헤더 */}
        <div className='flex w-full items-center justify-between px-[24px] pb-[16px] pt-[24px]'>
          <p className='text-[16px] font-bold text-[#18181B]'>매칭할 서증을 선택해주세요.</p>
          <button
            type='button'
            className='flex h-[28px] w-[28px] items-center justify-center rounded-[8px] hover:bg-[#F4F4F5]'
            onClick={onClose}
          >
            <X className='h-4 w-4 text-[#8A8A8E]' />
          </button>
        </div>

        {/* 검색 인풋 */}
        <div className='w-full px-[24px] pb-[12px]'>
          <div className='relative'>
            <Search className='absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-[#A1A1AA]' />
            <input
              type='text'
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder='파일명을 입력해주세요'
              className='h-[36px] w-full rounded-[8px] border border-[#E4E4E7] bg-white pl-9 pr-3 text-[13px] text-[#18181B] placeholder:text-[#A1A1AA] focus:outline-none focus:ring-1 focus:ring-[#93C5FD]'
            />
          </div>
        </div>

        {/* 문서 목록 테이블 */}
        <div className='w-full px-[24px]'>
          <div className='overflow-y-auto rounded-[8px] border border-[#E4E4E7]' style={{ maxHeight: 280 }}>
            {isLoading ? (
              <div className='flex items-center justify-center py-6 text-[14px] text-[#8A8A8E]'>불러오는 중...</div>
            ) : filtered.length === 0 ? (
              <div className='flex items-center justify-center py-6 text-[14px] text-[#8A8A8E]'>매칭 가능한 문서가 없습니다.</div>
            ) : (
              filtered.map((doc: any) => {
                const docId = String(doc?.case_document_id ?? doc?.caseDocumentId ?? '');
                const docCategory = String(doc?.parsed_category ?? doc?.parsedCategory ?? doc?.document_type ?? '-');
                const docTitle = String(doc?.parsed_sub_category ?? doc?.parsedSubCategory ?? doc?.title ?? '-');
                const docSubmitter = String(doc?.parsed_submitter_name ?? doc?.parsedSubmitterName ?? '-');
                const docDate = formatDate(doc?.document_date ?? doc?.documentDate ?? doc?.updatedAt ?? doc?.createdAt ?? '');
                const isSelected = selectedIds.includes(docId);
                return (
                  <button
                    key={docId}
                    type='button'
                    className={`grid w-full grid-cols-[20px_120px_1fr_80px_72px] items-center border-b border-[#F4F4F5] px-3 py-[9px] text-left last:border-b-0 hover:bg-[#F4F4F5] ${isSelected ? 'bg-[#EFF6FF]' : ''}`}
                    onClick={() => {
                      setSelectedIds((prev) => (prev.includes(docId) ? prev.filter((x) => x !== docId) : [...prev, docId]));
                    }}
                  >
                    <span
                      className={`flex h-[16px] w-[16px] shrink-0 items-center justify-center rounded-[4px] border ${isSelected ? 'border-[#18181B] bg-[#18181B]' : 'border-[#D4D4D8] bg-white'}`}
                    >
                      {isSelected ? <Check className='h-[12px] w-[12px] text-white' /> : null}
                    </span>
                    <span className='min-w-0 truncate pr-2 text-[12px] text-[#8A8A8E]'>{docCategory}</span>
                    <span className='min-w-0 truncate pr-2 text-[13px] font-medium text-[#18181B]'>{docTitle}</span>
                    <span className='truncate text-[12px] text-[#8A8A8E]'>{docSubmitter}</span>
                    <span className='truncate text-[12px] text-[#8A8A8E]'>{docDate}</span>
                  </button>
                );
              })
            )}
          </div>
        </div>

        {/* 하단 버튼 */}
        <div className='flex w-full items-center justify-end gap-3 px-[24px] pb-[24px] pt-[16px]'>
          <button
            type='button'
            className='h-[40px] w-[88px] rounded-[10px] border border-[#D4D4D8] bg-white text-[14px] font-semibold text-[#18181B] hover:bg-[#F4F4F5]'
            onClick={onClose}
          >
            닫기
          </button>
          <button
            type='button'
            disabled={selectedIds.length === 0 || isConfirming}
            className='h-[40px] w-[100px] rounded-[10px] bg-[#69C0FF] text-[14px] font-semibold text-white hover:bg-[#40A9FF] disabled:cursor-not-allowed disabled:bg-[#E4E4E7] disabled:text-[#8A8A8E]'
            onClick={() => onConfirm(selectedIds)}
          >
            {isConfirming ? '연결 중...' : '연결시키기'}
          </button>
        </div>
      </div>
    </div>,
    document.body,
  );
}
