/** 증거 뱃지 아이템 */
export interface IEvidenceBadgeItem {
  id: string;
  label: string;
  fileName?: string;
}

/** h2 섹션별 증거 그룹 */
export interface IEvidenceSection {
  title: string;
  items: IEvidenceBadgeItem[];
}

/** 테이블 상단 탭 필터 */
export enum TDocumentEditorTableTab {
  ALL = '전체',
  WRITING = '작성중',
  SUBMITTED = '제출됨',
}

/** 개별 문서 상태 */
export enum TDocumentStatus {
  PREPARING = '생성준비',
  TOC_PREPARING = '목차준비',
  CREATING = '생성중',
  WRITING = '작성중',
  SUBMITTED = '제출됨',
  COMPLETED = '완료',
}

/**
 * * 문서 에디터 뷰 타입
 * - list: 기본 목록
 * - create: 문서 생성
 * - toc: 목차 생성
 * - editor: 문서 작성 에디터
 */
export type TDocumentEditorView = 'list' | 'setup' | 'toc' | 'editor';

/** (임시) 개별 문서 상세 정보 */
export interface IDocumentDetail {
  id: number;
  title: string;
  status: TDocumentStatus;
  authorName: string;
  authorAvatar: string;
  editCount: number;
  attachmentCount: number;
  selectedHighlightCount: number;
  mod_dt: string;
  reg_dt: string;
}
