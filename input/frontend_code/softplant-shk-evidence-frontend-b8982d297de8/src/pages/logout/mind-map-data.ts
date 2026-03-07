interface IMindMapNode {
  id: string;
  text: string;
  children?: IMindMapNode[];
}

export const mindmapData: IMindMapNode = {
  id: 'root',
  text: 'AiLex',
  children: [
    {
      id: 'ai-function',
      text: 'AI 기능',
      children: [
        {
          id: 'nlp',
          text: '자연어 처리',
        },
        {
          id: 'classification',
          text: '문서 분류',
        },
        {
          id: 'summarization',
          text: '요약',
        },
        {
          id: 'similarity',
          text: '유사도 분석',
        },
      ],
    },
    {
      id: 'timeline',
      text: '히스토리',
      children: [
        {
          id: 'ver-history',
          text: '버전별 개선 이력',
        },
        {
          id: 'case-log',
          text: '적용 사례',
        },
      ],
    },
    {
      id: 'case-type',
      text: '사건 유형 판별',
      children: [
        {
          id: 'civil',
          text: '민사 사건',
        },
        {
          id: 'criminal',
          text: '형사 사건',
        },
        {
          id: 'labor',
          text: '노동 사건',
        },
      ],
    },
    {
      id: 'lawyer-feedback',
      text: '변호사 피드백',
      children: [
        {
          id: 'positive',
          text: '긍정 피드백',
        },
        {
          id: 'negative',
          text: '부정 피드백',
        },
      ],
    },
    {
      id: 'doc-upload',
      text: '문서 업로드',
      children: [
        {
          id: 'dragdrop',
          text: '드래그 앤 드롭',
        },
        {
          id: 'autoextract',
          text: '자동 추출 기능',
        },
      ],
    },
    {
      id: 'legal-result',
      text: '검색 필터링',
      children: [
        {
          id: 'law-name',
          text: '법령명',
        },
        {
          id: 'related-term',
          text: '관련 용어',
        },
        {
          id: 'similar-case',
          text: '유사 판례',
        },
      ],
    },
  ],
};
