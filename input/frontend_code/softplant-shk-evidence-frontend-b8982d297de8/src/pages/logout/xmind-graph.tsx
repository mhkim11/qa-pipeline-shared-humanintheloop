// GoMindMap.tsx
import { useEffect, useRef, useState } from 'react';

import * as go from 'gojs';
import { AiOutlineMinus, AiOutlinePlus } from 'react-icons/ai';

export default function GoMindMap() {
  const diagramRef = useRef<HTMLDivElement>(null);
  const diagramInstance = useRef<go.Diagram | null>(null);
  const [zoomLevel, setZoomLevel] = useState<number>(100);

  const handleZoom = (direction: 'in' | 'out') => {
    if (!diagramInstance.current) return;

    const diagram = diagramInstance.current;
    const currentScale = diagram.scale;
    const scaleFactor = direction === 'in' ? 1.2 : 0.8;
    const newScale = currentScale * scaleFactor;

    if (newScale >= 0.1 && newScale <= 3) {
      // Limit zoom range
      diagram.animationManager.isEnabled = true;
      diagram.startTransaction('zoom');
      diagram.scale = newScale;
      diagram.commitTransaction('zoom');
      setZoomLevel(Math.round(newScale * 100));
    }
  };

  useEffect(() => {
    const div = diagramRef.current;
    const $ = go.GraphObject.make;

    const diagram = $(go.Diagram, div!, {
      initialContentAlignment: go.Spot.Center,
      layout: $(go.TreeLayout, {
        angle: 0, // 0이면 방사형
        arrangement: go.TreeLayout.ArrangementFixedRoots,
      }),
      'undoManager.isEnabled': true,
      // Add zoom event listener
      ModelChanged: (e) => {
        if (e.isTransactionFinished) {
          setZoomLevel(Math.round(diagram.scale * 100));
        }
      },
    });

    // Store the diagram instance in ref for cleanup
    diagramInstance.current = diagram;

    diagram.nodeTemplate = $(
      go.Node,
      'Auto',
      $(go.Shape, 'RoundedRectangle', { strokeWidth: 0, fill: 'lightblue' }, new go.Binding('fill', 'color')),
      $(
        go.TextBlock,
        { margin: 8 },
        { stroke: 'black' },
        new go.Binding('text', 'text'),
        new go.Binding('stroke', 'textColor', (c) => c || 'black'),
      ),
    );

    // 화살표 없는 링크 템플릿 추가
    diagram.linkTemplate = $(go.Link, { routing: go.Link.Orthogonal }, $(go.Shape, { strokeWidth: 1.5 }));

    diagram.model = new go.TreeModel([
      { key: 0, text: 'AiLex', color: '#2C3E50', textColor: 'white' },
      { key: 1, parent: 0, text: 'AI 기능', color: '#FF6B6B' },
      { key: 2, parent: 1, text: '자연어 처리' },
      { key: 3, parent: 1, text: '요약' },
      { key: 4, parent: 0, text: '히스토리', color: '#4ECDC4' },
      { key: 5, parent: 4, text: '버전 이력' },
      { key: 6, parent: 0, text: '사건 판별', color: '#45B7D1' },
      { key: 7, parent: 6, text: '민사 사건' },
    ]);

    return () => {
      // Proper cleanup for GoJS diagram
      if (diagramInstance.current) {
        diagramInstance.current.clear(); // Clear all nodes and links
        diagramInstance.current.div = null; // Remove div reference
        diagramInstance.current = null; // Clear the ref
      }
    };
  }, []);

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

      <div ref={diagramRef} style={{ width: '100%', height: '800px' }} />
    </div>
  );
}
