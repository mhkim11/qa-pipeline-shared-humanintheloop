import { useEffect, useRef, useState } from 'react';

import { AiOutlineMinus, AiOutlinePlus } from 'react-icons/ai';
import { DataSet, Network } from 'vis-network/standalone/esm/vis-network';

type TRelationType = 'family' | 'instruction' | 'employment' | 'other';

type TFilters = {
  [key in TRelationType]: boolean;
};

type TRelationshipType = {
  label: string;
  color: string;
};

type TRelationshipTypes = {
  [key in TRelationType]: TRelationshipType;
};

interface IEdge {
  id: string;
  type: TRelationType;
}

export default function GraphPageTest() {
  const containerRef = useRef<HTMLDivElement>(null);
  const [network, setNetwork] = useState<Network | null>(null);
  const [edgesDataSet, setEdgesDataSet] = useState<DataSet<IEdge> | null>(null);
  const [zoomLevel, setZoomLevel] = useState<number>(100);
  const [filters, setFilters] = useState<TFilters>({
    family: true,
    instruction: true,
    employment: true,
    other: true,
  });

  const relationshipTypes: TRelationshipTypes = {
    family: { label: '가족 관계', color: 'green' },
    instruction: { label: '지시/명령', color: 'red' },
    employment: { label: '고용 관계', color: 'blue' },
    other: { label: '기타 관계', color: 'purple' },
  };

  useEffect(() => {
    const nodes = new DataSet([
      {
        color: '#6BAED6',
        fixed: { x: true, y: true },
        font: { color: 'black' },
        id: '조용준',
        label: '조용준',
        shape: 'dot',
        size: 10,
        title: '<b>조용준</b>',
        그룹: 'people',
      },
      {
        color: '#6BAED6',
        font: { color: 'black' },
        id: '조계찬',
        label: '조계찬',
        shape: 'dot',
        size: 10,
        title: '<b>조계찬</b>',
        그룹: 'people',
      },
      {
        color: '#6BAED6',
        font: { color: 'black' },
        id: '조문수',
        label: '조문수',
        shape: 'dot',
        size: 10,
        title: '<b>조문수</b>',
        그룹: 'people',
      },
      {
        color: '#6BAED6',
        font: { color: 'black' },
        id: '박경애',
        label: '박경애',
        shape: 'dot',
        size: 10,
        title: '<b>박경애</b>',
        그룹: 'people',
      },
      {
        color: '#6BAED6',
        font: { color: 'black' },
        id: '김영식',
        label: '김영식',
        shape: 'dot',
        size: 10,
        title: '<b>김영식</b>',
        그룹: 'people',
      },
      {
        color: '#6BAED6',
        font: { color: 'black' },
        id: '박장호',
        label: '박장호',
        shape: 'dot',
        size: 10,
        title: '<b>박장호</b>',
        그룹: 'people',
      },
      {
        color: '#6BAED6',
        font: { color: 'black' },
        id: '안성환',
        label: '안성환',
        shape: 'dot',
        size: 10,
        title: '<b>안성환</b>',
        그룹: 'people',
      },
      {
        color: '#6BAED6',
        font: { color: 'black' },
        id: '김동배',
        label: '김동배',
        shape: 'dot',
        size: 10,
        title: '<b>김동배</b>',
        그룹: 'people',
      },
      {
        color: '#6BAED6',
        font: { color: 'black' },
        id: '이상모',
        label: '이상모',
        shape: 'dot',
        size: 10,
        title: '<b>이상모</b>',
        그룹: 'people',
      },
      {
        color: '#FB6A4A',
        font: { color: 'black' },
        id: '한국화이바',
        label: '한국화이바',
        shape: 'box',
        size: 10,
        title: '<b>한국화이바</b>',
        그룹: 'companies',
      },
      {
        color: '#FB6A4A',
        font: { color: 'black' },
        id: '(주)월드',
        label: '(주)월드',
        shape: 'box',
        size: 10,
        title: '<b>(주)월드</b>',
        그룹: 'companies',
      },
      {
        color: '#FB6A4A',
        font: { color: 'black' },
        id: '한국카본',
        label: '한국카본',
        shape: 'box',
        size: 10,
        title: '<b>한국카본</b>',
        그룹: 'companies',
      },
      {
        color: '#6BAED6',
        font: { color: 'black' },
        id: '이귀동',
        label: '이귀동',
        shape: 'dot',
        size: 10,
        title: '<b>이귀동</b>',
        그룹: 'people',
      },
    ]);
    const edgesData = new DataSet([
      {
        arrows: 'to',
        color: 'green',
        font: { align: 'top', face: 'Malgun Gothic', size: 10 },
        from: '조용준',
        label: '부자관계',
        relation: '부자관계',
        to: '조계찬',
        type: 'family',
        width: 1,
      },
      {
        arrows: 'to',
        color: 'purple',
        font: { align: 'top', face: 'Malgun Gothic', size: 10 },
        from: '조용준',
        label: '책임전가',
        relation: '책임전가',
        to: '조계찬',
        type: 'other',
        width: 1,
      },
      {
        arrows: 'to',
        color: 'red',
        dashes: true,
        font: { align: 'top', face: 'Malgun Gothic', size: 10 },
        from: '조용준',
        label: '대표이사 지시',
        relation: '대표이사 지시',
        to: '조계찬',
        type: 'instruction',
        width: 1,
      },
      {
        arrows: 'to',
        color: 'green',
        font: { align: 'top', face: 'Malgun Gothic', size: 10 },
        from: '조용준',
        label: '부자관계',
        relation: '부자관계',
        to: '조문수',
        type: 'family',
        width: 1,
      },
      {
        arrows: 'to',
        color: 'purple',
        font: { align: 'top', face: 'Malgun Gothic', size: 10 },
        from: '조용준',
        label: '경영권 분쟁',
        relation: '경영권 분쟁',
        to: '조문수',
        type: 'other',
        width: 1,
      },
      {
        arrows: 'to',
        color: 'purple',
        font: { align: 'top', face: 'Malgun Gothic', size: 10 },
        from: '조용준',
        label: '책임전가',
        relation: '책임전가',
        to: '박경애',
        type: 'other',
        width: 1,
      },
      {
        arrows: 'to',
        color: 'red',
        dashes: true,
        font: { align: 'top', face: 'Malgun Gothic', size: 10 },
        from: '조용준',
        label: '명의 도용 지시',
        relation: '명의 도용 지시',
        to: '김영식',
        type: 'instruction',
        width: 1,
      },
      {
        arrows: 'to',
        color: 'red',
        dashes: true,
        font: { align: 'top', face: 'Malgun Gothic', size: 10 },
        from: '조용준',
        label: '명의 도용 지시',
        relation: '명의 도용 지시',
        to: '박장호',
        type: 'instruction',
        width: 1,
      },
      {
        arrows: 'to',
        color: 'red',
        dashes: true,
        font: { align: 'top', face: 'Malgun Gothic', size: 10 },
        from: '조용준',
        label: '명의 도용 지시',
        relation: '명의 도용 지시',
        to: '안성환',
        type: 'instruction',
        width: 1,
      },
      {
        arrows: 'to',
        color: 'red',
        dashes: true,
        font: { align: 'top', face: 'Malgun Gothic', size: 10 },
        from: '조용준',
        label: '계좌개설 지시',
        relation: '계좌개설 지시',
        to: '김동배',
        type: 'instruction',
        width: 1,
      },
      {
        arrows: 'to',
        color: 'red',
        dashes: true,
        font: { align: 'top', face: 'Malgun Gothic', size: 10 },
        from: '조용준',
        label: '급여 조작 지시',
        relation: '급여 조작 지시',
        to: '이상모',
        type: 'instruction',
        width: 1,
      },
      {
        arrows: 'to',
        color: 'blue',
        font: { align: 'top', face: 'Malgun Gothic', size: 10 },
        from: '조용준',
        label: '회장',
        relation: '회장',
        to: '한국화이바',
        type: 'employment',
        width: 1,
      },
      {
        arrows: 'to',
        color: 'green',
        font: { align: 'top', face: 'Malgun Gothic', size: 10 },
        from: '조계찬',
        label: '형제관계',
        relation: '형제관계',
        to: '조문수',
        type: 'family',
        width: 1,
      },
      {
        arrows: 'to',
        color: 'green',
        font: { align: 'top', face: 'Malgun Gothic', size: 10 },
        from: '조계찬',
        label: '부부관계',
        relation: '부부관계',
        to: '박경애',
        type: 'family',
        width: 1,
      },
      {
        arrows: 'to',
        color: 'blue',
        font: { align: 'top', face: 'Malgun Gothic', size: 10 },
        from: '조계찬',
        label: '대표이사/청산인',
        relation: '대표이사/청산인',
        to: '(주)월드',
        type: 'employment',
        width: 1,
      },
      {
        arrows: 'to',
        color: 'red',
        dashes: true,
        font: { align: 'top', face: 'Malgun Gothic', size: 10 },
        from: '조문수',
        label: '청산인 사임 요구',
        relation: '청산인 사임 요구',
        to: '조계찬',
        type: 'instruction',
        width: 1,
      },
      {
        arrows: 'to',
        color: 'blue',
        font: { align: 'top', face: 'Malgun Gothic', size: 10 },
        from: '조문수',
        label: '대표이사',
        relation: '대표이사',
        to: '한국카본',
        type: 'employment',
        width: 1,
      },
      {
        arrows: 'to',
        color: 'blue',
        font: { align: 'top', face: 'Malgun Gothic', size: 10 },
        from: '박경애',
        label: '부사장',
        relation: '부사장',
        to: '한국화이바',
        type: 'employment',
        width: 1,
      },
      {
        arrows: 'to',
        color: 'blue',
        font: { align: 'top', face: 'Malgun Gothic', size: 10 },
        from: '김영식',
        label: '임원',
        relation: '임원',
        to: '한국화이바',
        type: 'employment',
        width: 1,
      },
      {
        arrows: 'to',
        color: 'blue',
        font: { align: 'top', face: 'Malgun Gothic', size: 10 },
        from: '김영식',
        label: '전 대표이사',
        relation: '전 대표이사',
        to: '(주)월드',
        type: 'employment',
        width: 1,
      },
      {
        arrows: 'to',
        color: 'red',
        dashes: true,
        font: { align: 'top', face: 'Malgun Gothic', size: 10 },
        from: '박장호',
        label: '직속상사',
        relation: '직속상사',
        to: '김동배',
        type: 'instruction',
        width: 1,
      },
      {
        arrows: 'to',
        color: 'blue',
        font: { align: 'top', face: 'Malgun Gothic', size: 10 },
        from: '박장호',
        label: '임원',
        relation: '임원',
        to: '한국화이바',
        type: 'employment',
        width: 1,
      },
      {
        arrows: 'to',
        color: 'blue',
        font: { align: 'top', face: 'Malgun Gothic', size: 10 },
        from: '박장호',
        label: '명의상 임원',
        relation: '명의상 임원',
        to: '(주)월드',
        type: 'employment',
        width: 1,
      },
      {
        arrows: 'to',
        color: 'blue',
        font: { align: 'top', face: 'Malgun Gothic', size: 10 },
        from: '안성환',
        label: '임원',
        relation: '임원',
        to: '한국화이바',
        type: 'employment',
        width: 1,
      },
      {
        arrows: 'to',
        color: 'blue',
        font: { align: 'top', face: 'Malgun Gothic', size: 10 },
        from: '안성환',
        label: '명의상 임원',
        relation: '명의상 임원',
        to: '(주)월드',
        type: 'employment',
        width: 1,
      },
      {
        arrows: 'to',
        color: 'purple',
        font: { align: 'top', face: 'Malgun Gothic', size: 10 },
        from: '김동배',
        label: '급여 데이터 전달',
        relation: '급여 데이터 전달',
        to: '이상모',
        type: 'other',
        width: 1,
      },
      {
        arrows: 'to',
        color: 'blue',
        font: { align: 'top', face: 'Malgun Gothic', size: 10 },
        from: '김동배',
        label: '자금 담당 직원',
        relation: '자금 담당 직원',
        to: '한국화이바',
        type: 'employment',
        width: 1,
      },
      {
        arrows: 'to',
        color: 'blue',
        font: { align: 'top', face: 'Malgun Gothic', size: 10 },
        from: '이상모',
        label: '인사 담당 직원',
        relation: '인사 담당 직원',
        to: '한국화이바',
        type: 'employment',
        width: 1,
      },
      {
        arrows: 'to',
        color: 'red',
        dashes: true,
        font: { align: 'top', face: 'Malgun Gothic', size: 10 },
        from: '이귀동',
        label: '고소',
        relation: '고소',
        to: '조용준',
        type: 'instruction',
        width: 1,
      },
      {
        arrows: 'to',
        color: 'red',
        dashes: true,
        font: { align: 'top', face: 'Malgun Gothic', size: 10 },
        from: '이귀동',
        label: '고소',
        relation: '고소',
        to: '조계찬',
        type: 'instruction',
        width: 1,
      },
      {
        arrows: 'to',
        color: 'blue',
        font: { align: 'top', face: 'Malgun Gothic', size: 10 },
        from: '이귀동',
        label: '주주',
        relation: '주주',
        to: '(주)월드',
        type: 'employment',
        width: 1,
      },
    ]);
    const data = { nodes, edges: edgesData };

    const options = {
      nodes: {
        font: { size: 20, face: 'Noto Sans KR' },
        size: 40,
      },
      edges: {
        arrows: { to: { enabled: true, scaleFactor: 0.5 } },
        font: { size: 16, face: 'Noto Sans KR' },
        smooth: { enabled: true, type: 'discrete', roundness: 0.5 },
        color: { inherit: true },
      },
      physics: {
        barnesHut: {
          gravitationalConstant: -30000,
          centralGravity: 0.1,
          springLength: 180,
          springConstant: 0.01,
          damping: 0.09,
          avoidOverlap: 1,
        },
        minVelocity: 0.75,
      },
      interaction: {
        dragNodes: true,
        hideEdgesOnDrag: false,
        hideNodesOnDrag: false,
      },
    };

    if (containerRef.current) {
      const net = new Network(containerRef.current, data, options);
      setNetwork(net);
      setEdgesDataSet(edgesData);

      // Add zoom event listener
      net.on('zoom', () => {
        const scale = net.getScale();
        setZoomLevel(Math.round(scale * 100));
      });
    }
  }, []);

  useEffect(() => {
    if (!network || !edgesDataSet) return;

    edgesDataSet.forEach((edge: IEdge) => {
      const isVisible = filters[edge.type];
      edgesDataSet.update({ id: edge.id, hidden: !isVisible });
    });
  }, [filters, network, edgesDataSet]);

  const handleFilterChange = (type: TRelationType) => {
    setFilters((prev) => ({
      ...prev,
      [type]: !prev[type],
    }));
  };

  const handleZoom = (direction: 'in' | 'out') => {
    if (!network) return;

    const currentScale = network.getScale();
    const scaleFactor = direction === 'in' ? 1.2 : 0.8;
    const newScale = currentScale * scaleFactor;

    if (newScale >= 0.1 && newScale <= 3) {
      // Limit zoom range
      network.moveTo({
        scale: newScale,
        animation: {
          duration: 300,
          easingFunction: 'easeInOutQuad',
        },
      });
    }
  };

  return (
    <div>
      <div className='mb-4 flex gap-4'>
        <div className='flex items-center rounded-lg border border-gray-200 bg-white p-1 shadow-sm'>
          <button
            onClick={() => handleZoom('out')}
            className='flex h-8 w-8 items-center justify-center rounded hover:bg-gray-100'
            title='축소'
          >
            <AiOutlineMinus className='text-xl text-gray-600' />
          </button>
          <span className='mx-2 min-w-[60px] text-center text-sm font-medium text-gray-700'>{zoomLevel}%</span>
          <button
            onClick={() => handleZoom('in')}
            className='flex h-8 w-8 items-center justify-center rounded hover:bg-gray-100'
            title='확대'
          >
            <AiOutlinePlus className='text-xl text-gray-600' />
          </button>
        </div>
      </div>
      <h2 className='mb-4 mt-2 text-center text-2xl font-bold'>주요 인물 관계도</h2>

      <div style={{ display: 'flex', justifyContent: 'center', gap: '20px', marginBottom: '20px' }}>
        {Object.entries(relationshipTypes).map(([type, { label, color }]) => (
          <label key={type} style={{ display: 'flex', alignItems: 'center', gap: '5px' }}>
            <input
              type='checkbox'
              checked={filters[type as TRelationType]}
              onChange={() => handleFilterChange(type as TRelationType)}
              className='h-5 w-5 rounded-sm checked:bg-[#6BAED6]'
            />
            <div className='h-5 w-5 rounded-full' style={{ backgroundColor: color }} />
            <span className='text-lg'>{label}</span>
          </label>
        ))}
      </div>
      <div ref={containerRef} style={{ width: '100%', height: '800px', border: '1px solid lightgray' }} />
    </div>
  );
}
