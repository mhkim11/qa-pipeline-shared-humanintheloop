import { useCallback, useEffect, useRef, useState } from 'react';

import { Check, ChevronDown, Redo2, Square, Trash2, Undo2, X } from 'lucide-react';

export interface IBox {
  id: string;
  x: number;
  y: number;
  width: number;
  height: number;
  color: string;
  lineWidth: number;
}

interface IImageAnnotationModalProps {
  isOpen: boolean;
  imageSrc: string;
  onClose: () => void;
  onSave: (dataUrl: string) => void;
}

const COLORS = ['#FF0000', '#00FF00', '#0000FF', '#FFFF00', '#FF00FF', '#00FFFF'];
const LINE_WIDTHS = [2, 4, 6, 8];

const ImageAnnotationModal = ({ isOpen, imageSrc, onClose, onSave }: IImageAnnotationModalProps) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const imageRef = useRef<HTMLImageElement | null>(null);

  const [boxes, setBoxes] = useState<IBox[]>([]);
  const [isDrawing, setIsDrawing] = useState(false);
  const [startPos, setStartPos] = useState({ x: 0, y: 0 });
  const [currentBox, setCurrentBox] = useState<IBox | null>(null);
  const [selectedColor, setSelectedColor] = useState(COLORS[0]);
  const [selectedLineWidth, setSelectedLineWidth] = useState(LINE_WIDTHS[1]);
  const [imageLoaded, setImageLoaded] = useState(false);

  // 이미지 로드
  useEffect(() => {
    if (!isOpen || !imageSrc) return;

    const img = new Image();
    img.crossOrigin = 'anonymous';
    img.onload = () => {
      imageRef.current = img;
      setImageLoaded(true);
    };
    img.src = imageSrc;

    return () => {
      setImageLoaded(false);
      setBoxes([]);
    };
  }, [isOpen, imageSrc]);

  // 캔버스 그리기
  const drawCanvas = useCallback(() => {
    const canvas = canvasRef.current;
    const ctx = canvas?.getContext('2d');
    const img = imageRef.current;

    if (!canvas || !ctx || !img) return;

    // 캔버스 크기 설정
    canvas.width = img.width;
    canvas.height = img.height;

    // 이미지 그리기
    ctx.drawImage(img, 0, 0);

    // 저장된 박스들 그리기
    boxes.forEach((box) => {
      ctx.strokeStyle = box.color;
      ctx.lineWidth = box.lineWidth;
      ctx.strokeRect(box.x, box.y, box.width, box.height);
    });

    // 현재 그리고 있는 박스 그리기
    if (currentBox) {
      ctx.strokeStyle = currentBox.color;
      ctx.lineWidth = currentBox.lineWidth;
      ctx.setLineDash([5, 5]);
      ctx.strokeRect(currentBox.x, currentBox.y, currentBox.width, currentBox.height);
      ctx.setLineDash([]);
    }
  }, [boxes, currentBox]);

  useEffect(() => {
    if (imageLoaded) {
      drawCanvas();
    }
  }, [imageLoaded, drawCanvas]);

  // 마우스 좌표 계산 (캔버스 스케일 고려)
  const getMousePos = useCallback((e: React.MouseEvent<HTMLCanvasElement>) => {
    const canvas = canvasRef.current;
    if (!canvas) return { x: 0, y: 0 };

    const rect = canvas.getBoundingClientRect();
    const scaleX = canvas.width / rect.width;
    const scaleY = canvas.height / rect.height;

    return {
      x: (e.clientX - rect.left) * scaleX,
      y: (e.clientY - rect.top) * scaleY,
    };
  }, []);

  // 마우스 이벤트 핸들러
  const onMouseDown = useCallback(
    (e: React.MouseEvent<HTMLCanvasElement>) => {
      const pos = getMousePos(e);
      setIsDrawing(true);
      setStartPos(pos);
      setCurrentBox({
        id: Date.now().toString(),
        x: pos.x,
        y: pos.y,
        width: 0,
        height: 0,
        color: selectedColor,
        lineWidth: selectedLineWidth,
      });
    },
    [getMousePos, selectedColor, selectedLineWidth],
  );

  const onMouseMove = useCallback(
    (e: React.MouseEvent<HTMLCanvasElement>) => {
      if (!isDrawing) return;

      const pos = getMousePos(e);
      setCurrentBox((prev) => {
        if (!prev) return null;
        return {
          ...prev,
          width: pos.x - startPos.x,
          height: pos.y - startPos.y,
        };
      });
    },
    [isDrawing, getMousePos, startPos],
  );

  const onMouseUp = useCallback(() => {
    if (!isDrawing || !currentBox) return;

    // 최소 크기 체크 (너무 작은 박스는 무시)
    if (Math.abs(currentBox.width) > 10 && Math.abs(currentBox.height) > 10) {
      // 음수 width/height 정규화
      const normalizedBox: IBox = {
        ...currentBox,
        x: currentBox.width < 0 ? currentBox.x + currentBox.width : currentBox.x,
        y: currentBox.height < 0 ? currentBox.y + currentBox.height : currentBox.y,
        width: Math.abs(currentBox.width),
        height: Math.abs(currentBox.height),
      };
      setBoxes((prev) => [...prev, normalizedBox]);
    }

    setIsDrawing(false);
    setCurrentBox(null);
  }, [isDrawing, currentBox]);

  // 마지막 박스 삭제
  const onClickUndo = useCallback(() => {
    setBoxes((prev) => prev.slice(0, -1));
  }, []);

  // 모두 삭제
  const onClickClear = useCallback(() => {
    setBoxes([]);
  }, []);

  // 저장
  const onClickSave = useCallback(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const dataUrl = canvas.toDataURL('image/png');
    onSave(dataUrl);
  }, [onSave]);

  if (!isOpen) return null;

  return (
    <div className='fixed inset-0 z-50 flex flex-col items-center justify-center bg-black/70'>
      {/* 플로팅 툴바 */}
      <div className='mb-3 flex items-center gap-1 rounded-lg bg-gray-100 px-2 py-1.5 shadow-lg'>
        {/* 닫기 버튼 */}
        <button onClick={onClose} className='flex h-8 w-8 items-center justify-center rounded hover:bg-gray-200' title='닫기'>
          <X size={18} className='text-gray-600' />
        </button>

        {/* 구분선 */}
        <div className='mx-1 h-5 w-px bg-gray-300' />

        {/* 박스 도구 (활성화 표시) */}
        <button className='flex h-8 w-8 items-center justify-center rounded bg-gray-200' title='사각형 그리기'>
          <Square size={18} className='text-gray-700' />
        </button>

        {/* 구분선 */}
        <div className='mx-1 h-5 w-px bg-gray-300' />

        {/* 실행취소 */}
        <button
          onClick={onClickUndo}
          disabled={boxes.length === 0}
          className='flex h-8 w-8 items-center justify-center rounded hover:bg-gray-200 disabled:opacity-30'
          title='실행취소'
        >
          <Undo2 size={18} className='text-gray-600' />
        </button>

        {/* 다시실행 (현재 미구현이지만 UI만) */}
        <button
          disabled
          className='flex h-8 w-8 items-center justify-center rounded hover:bg-gray-200 disabled:opacity-30'
          title='다시실행'
        >
          <Redo2 size={18} className='text-gray-600' />
        </button>

        {/* 모두 지우기 */}
        <button
          onClick={onClickClear}
          disabled={boxes.length === 0}
          className='flex h-8 w-8 items-center justify-center rounded hover:bg-gray-200 disabled:opacity-30'
          title='모두 지우기'
        >
          <Trash2 size={18} className='text-gray-600' />
        </button>

        {/* 구분선 */}
        <div className='mx-1 h-5 w-px bg-gray-300' />

        {/* 색상 선택 */}
        <div className='relative flex items-center'>
          {COLORS.map((color) => (
            <button
              key={color}
              onClick={() => setSelectedColor(color)}
              className={`mx-0.5 flex h-7 w-7 items-center justify-center rounded border-2 ${
                selectedColor === color ? 'border-gray-800' : 'border-transparent hover:border-gray-400'
              }`}
              title={`색상: ${color}`}
            >
              <div className='h-5 w-5 rounded-sm' style={{ backgroundColor: color }}>
                {selectedColor === color && <Check size={14} className='m-auto mt-0.5 text-white drop-shadow-md' />}
              </div>
            </button>
          ))}
        </div>

        {/* 구분선 */}
        <div className='mx-1 h-5 w-px bg-gray-300' />

        {/* 굵기 선택 */}
        <div className='flex items-center gap-1'>
          {LINE_WIDTHS.map((width) => (
            <button
              key={width}
              onClick={() => setSelectedLineWidth(width)}
              className={`flex h-7 w-7 items-center justify-center rounded border-2 ${
                selectedLineWidth === width ? 'border-gray-800 bg-gray-200' : 'border-transparent hover:bg-gray-200'
              }`}
              title={`굵기: ${width}px`}
            >
              <div className='rounded-full bg-gray-700' style={{ width: width + 2, height: width + 2 }} />
            </button>
          ))}
          <ChevronDown size={14} className='ml-1 text-gray-500' />
        </div>

        {/* 구분선 */}
        <div className='mx-1 h-5 w-px bg-gray-300' />

        {/* 저장 버튼 */}
        <button
          onClick={onClickSave}
          disabled={!imageLoaded}
          className='flex h-8 items-center gap-1 rounded bg-blue-500 px-3 text-sm font-medium text-white hover:bg-blue-600 disabled:opacity-50'
        >
          저장
        </button>
      </div>

      {/* 캔버스 영역 */}
      <div className='max-h-[75vh] max-w-[90vw] overflow-auto rounded-lg bg-white p-2 shadow-xl'>
        {!imageLoaded ? (
          <div className='flex h-64 w-96 items-center justify-center'>
            <span className='text-gray-500'>이미지 로딩 중...</span>
          </div>
        ) : (
          <canvas
            ref={canvasRef}
            onMouseDown={onMouseDown}
            onMouseMove={onMouseMove}
            onMouseUp={onMouseUp}
            onMouseLeave={onMouseUp}
            className='max-w-full cursor-crosshair'
            style={{ maxHeight: '75vh' }}
          />
        )}
      </div>
    </div>
  );
};

export default ImageAnnotationModal;
