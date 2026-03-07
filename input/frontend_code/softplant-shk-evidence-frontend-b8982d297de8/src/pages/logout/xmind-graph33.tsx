import { useRef } from 'react';

import Tree, { RenderCustomNodeElementFn, TreeNodeDatum } from 'react-d3-tree';

import { mindmapData } from '@/pages/logout/mind-map-data';

interface ITreeNode {
  name: string;
  attributes?: {
    id: string;
  };
  children?: ITreeNode[];
}

interface ICustomNodeProps {
  nodeDatum: TreeNodeDatum;
}

const CustomNode = ({ nodeDatum }: ICustomNodeProps) => {
  const colors: { [key: string]: string } = {
    'ai-function': '#FF6B6B', // 빨간색 계열
    timeline: '#4ECDC4', // 청록색 계열
    'case-type': '#45B7D1', // 하늘색 계열
    'lawyer-feedback': '#96CEB4', // 민트색 계열
    'doc-upload': '#FFBE0B', // 노란색 계열
    'legal-result': '#9B5DE5', // 보라색 계열
  };

  const getColor = (nodeId: string): string => {
    if (nodeId === 'root') return '#2C3E50';
    if (nodeId === 'left-group' || nodeId === 'right-group') return 'transparent';
    const parentId = Object.keys(colors).find((key) => nodeId === key || nodeId.startsWith(`${key}-`));
    return parentId ? colors[parentId] : '#6BAED6';
  };

  const nodeId = (nodeDatum.attributes?.id as string) || '';

  // 왼쪽/오른쪽 그룹 노드는 렌더링하지 않음
  if (nodeId === 'left-group' || nodeId === 'right-group') {
    return null;
  }

  return (
    <g>
      <rect
        width={nodeDatum.name.length * 16}
        height='40'
        x={-(nodeDatum.name.length * 16) / 2}
        y='-20'
        rx='5'
        ry='5'
        fill={getColor(nodeId)}
        stroke='none'
      />
      <text
        dominantBaseline='middle'
        textAnchor='middle'
        fill='#FFFFFF'
        style={{
          fontSize: nodeId === 'root' ? '16px' : '14px',
          fontFamily: 'Noto Sans KR',
          fontWeight: '500',
          paintOrder: 'stroke',
          stroke: 'none',
          strokeWidth: '2px',
          strokeLinecap: 'butt',
          strokeLinejoin: 'miter',
        }}
      >
        {nodeDatum.name}
      </text>
    </g>
  );
};

interface IMindMapNode {
  id: string;
  text: string;
  children?: IMindMapNode[];
}

const convertData = (data: IMindMapNode): ITreeNode => {
  const leftSideNodes = ['ai-function', 'timeline', 'case-type'];

  if (!data.children) {
    return {
      name: data.text,
      attributes: {
        id: data.id,
      },
    };
  }

  // 루트 노드의 경우 자식들을 왼쪽/오른쪽으로 분할
  if (data.id === 'root') {
    const leftChildren = data.children.filter((child: IMindMapNode) => leftSideNodes.includes(child.id));
    const rightChildren = data.children.filter((child: IMindMapNode) => !leftSideNodes.includes(child.id));

    return {
      name: data.text,
      attributes: {
        id: data.id,
      },
      children: [
        {
          name: '',
          attributes: { id: 'left-group' },
          children: leftChildren.map((child: IMindMapNode) => convertData(child)),
        },
        {
          name: '',
          attributes: { id: 'right-group' },
          children: rightChildren.map((child: IMindMapNode) => convertData(child)),
        },
      ],
    };
  }

  // 일반 노드의 경우
  return {
    name: data.text,
    attributes: {
      id: data.id,
    },
    children: data.children.map((child: IMindMapNode) => convertData(child)),
  };
};

export default function XMindGraph() {
  const containerRef = useRef<HTMLDivElement>(null);
  const treeData = convertData(mindmapData);

  const renderCustomNode: RenderCustomNodeElementFn = (rd) => <CustomNode nodeDatum={rd.nodeDatum} />;

  return (
    <div>
      <h2 className='mb-10 mt-2 text-center text-2xl font-bold'></h2>
      <div style={{ width: '100%', height: '800px' }} ref={containerRef}>
        <Tree
          data={treeData}
          orientation='horizontal'
          renderCustomNodeElement={renderCustomNode}
          pathFunc='step'
          separation={{ siblings: 2, nonSiblings: 2.5 }}
          translate={{ x: 400, y: 400 }}
          nodeSize={{ x: 250, y: 100 }}
          rootNodeClassName='root-node'
          branchNodeClassName='branch-node'
          leafNodeClassName='leaf-node'
        />
      </div>
    </div>
  );
}
