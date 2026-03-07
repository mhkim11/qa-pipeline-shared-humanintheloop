interface IRawSection {
  title: string;
  ids: string[];
}

/**
 * * 콘텐츠(HTML 또는 마크다운)에서 h2 섹션별 증거 ID 구조 추출
 * - @@lock_footer_start 이후는 무시
 * - h2 기준으로 섹션 분리 (HTML: <h2>, 마크다운: ## )
 * - 각 섹션 내 @@{id} 패턴의 ID 수집
 */
export const parseRawSections = (content: string): IRawSection[] => {
  // footer 이후 제거
  const footerIdx = content.indexOf('@@lock_footer_start');
  const text = footerIdx !== -1 ? content.substring(0, footerIdx) : content;

  const sections: IRawSection[] = [];

  // h2 위치 수집 (HTML <h2> 또는 마크다운 ## 모두 지원)
  const h2Regex = /(?:<h2[^>]*>([\s\S]*?)<\/h2>|^## (.+)$)/gm;
  const h2Matches: { title: string; index: number; endIndex: number }[] = [];

  let match;
  while ((match = h2Regex.exec(text)) !== null) {
    const rawTitle = match[1] ?? match[2] ?? '';
    const title = rawTitle.replace(/<[^>]*>/g, '').trim();
    h2Matches.push({ title, index: match.index, endIndex: match.index + match[0].length });
  }

  // 각 h2 섹션의 본문에서 @@{id} 수집
  for (let i = 0; i < h2Matches.length; i++) {
    const start = h2Matches[i].endIndex;
    const end = i + 1 < h2Matches.length ? h2Matches[i + 1].index : text.length;
    const body = text.substring(start, end);

    const ids: string[] = [];
    for (const idMatch of body.matchAll(/@@\{(\w+)\}/g)) {
      ids.push(idMatch[1]);
    }

    sections.push({ title: h2Matches[i].title, ids });
  }

  return sections;
};

/**
 * * 마크다운의 첫 번째 --- 기준으로 헤더 영역을 잠금 처리
 * - @@lock_start / @@lock_end 마커로 감쌈
 */
export const wrapHeaderWithLock = (markdown: string): string => {
  const hrIndex = markdown.indexOf('\n---\n');
  if (hrIndex === -1) return markdown;

  const header = markdown.substring(0, hrIndex + 4);
  const body = markdown.substring(hrIndex + 4);
  return `@@lock_start\n${header}\n@@lock_end\n${body}`;
};
