/** A4 페이지 치수 상수 (96dpi 기준) */
export const PAGE_CONSTANTS = {
  /** A4 높이 (297mm at 96dpi) */
  A4_HEIGHT: 1123,
  /** body padding-top (content_style과 동일) */
  BODY_PADDING_TOP: 60,
  /** body padding-bottom (content_style과 동일) */
  BODY_PADDING_BOTTOM: 60,
  /** body side padding (content_style과 동일) */
  BODY_PADDING_SIDE: 72,
  /** 페이지당 콘텐츠 영역 높이 = 1123 - 60 - 60 */
  CONTENT_PER_PAGE: 1003,
  /** 페이지 간 회색 간격 */
  PAGE_GAP: 40,
} as const;

const { BODY_PADDING_TOP, BODY_PADDING_BOTTOM, CONTENT_PER_PAGE, PAGE_GAP } = PAGE_CONSTANTS;

/**
 * * 요소의 외부 높이(margins 포함) 계산
 */
function getElementOuterHeight(el: Element, computedStyle?: CSSStyleDeclaration): number {
  const style = computedStyle ?? el.ownerDocument.defaultView!.getComputedStyle(el);
  const marginTop = parseFloat(style.marginTop) || 0;
  const marginBottom = parseFloat(style.marginBottom) || 0;
  return el.getBoundingClientRect().height + marginTop + marginBottom;
}

/**
 * * 페이지 스페이서 생성
 *
 * 구조: white(나머지 공간 + 하단여백) → gray(간격) → white(상단여백)
 */
function createPageSpacer(doc: Document, remainingSpace: number, pageNum: number, totalPages: number): HTMLElement {
  const spacer = doc.createElement('div');
  spacer.className = 'page-spacer';
  spacer.setAttribute('data-mce-bogus', 'all');
  spacer.contentEditable = 'false';

  const whiteBottom = remainingSpace + BODY_PADDING_BOTTOM;
  const whiteTop = BODY_PADDING_TOP;
  const totalHeight = whiteBottom + PAGE_GAP + whiteTop;

  spacer.style.height = `${totalHeight}px`;
  spacer.style.background = `linear-gradient(
    to bottom,
    white 0px,
    white ${whiteBottom}px,
    #f0f0f0 ${whiteBottom}px,
    #f0f0f0 ${whiteBottom + PAGE_GAP}px,
    white ${whiteBottom + PAGE_GAP}px,
    white ${totalHeight}px
  )`;

  // 회색 간격 중앙에 페이지 번호 라벨
  const label = doc.createElement('span');
  label.className = 'page-label';
  label.setAttribute('data-mce-bogus', 'all');
  const labelTop = whiteBottom + PAGE_GAP / 2;
  label.style.top = `${labelTop}px`;
  label.style.transform = 'translate(-50%, -50%)';
  label.textContent = `${pageNum} / ${totalPages}`;
  spacer.appendChild(label);

  return spacer;
}

/**
 * * 마지막 페이지 번호 footer 생성
 */
function createLastPageFooter(doc: Document, totalPages: number): HTMLElement {
  const footer = doc.createElement('div');
  footer.className = 'page-number-footer';
  footer.setAttribute('data-mce-bogus', 'all');
  footer.contentEditable = 'false';
  footer.textContent = `${totalPages} / ${totalPages}`;
  return footer;
}

/**
 * * 에디터 콘텐츠에 A4 페이지 스페이서를 삽입
 *
 * 1. 기존 스페이서 제거
 * 2. body 자식 순회하며 높이 누적
 * 3. CONTENT_PER_PAGE 초과 시 스페이서 삽입
 * 4. 마지막 페이지 footer 추가
 */
export function updatePageBreaks(editor: any): void {
  const body = editor.getBody() as HTMLElement | null;
  if (!body) return;

  const doc = body.ownerDocument;
  if (!doc) return;

  // 1. 기존 스페이서/footer 제거
  body.querySelectorAll('.page-spacer, .page-number-footer').forEach((el) => el.remove());

  // 2. 자식 요소 수집
  const children = Array.from(body.children) as HTMLElement[];
  if (children.length === 0) return;

  // 3. 페이지 경계 계산
  let accumulatedHeight = 0;
  let pageNum = 1;
  const insertions: Array<{ before: HTMLElement; remainingSpace: number }> = [];

  for (const child of children) {
    const blockHeight = getElementOuterHeight(child);

    if (accumulatedHeight + blockHeight > CONTENT_PER_PAGE && accumulatedHeight > 0) {
      const remainingSpace = CONTENT_PER_PAGE - accumulatedHeight;
      insertions.push({ before: child, remainingSpace: Math.max(0, remainingSpace) });
      pageNum++;
      accumulatedHeight = blockHeight;
    } else {
      accumulatedHeight += blockHeight;
    }
  }

  const totalPages = pageNum;

  // 4. 스페이서 삽입 (요소 참조 기반이므로 순서 상관없음)
  let currentPage = 1;
  for (const insertion of insertions) {
    const spacer = createPageSpacer(doc, insertion.remainingSpace, currentPage, totalPages);
    body.insertBefore(spacer, insertion.before);
    currentPage++;
  }

  // 5. 마지막 페이지 footer 추가
  const lastPageFooter = createLastPageFooter(doc, totalPages);
  body.appendChild(lastPageFooter);
}
