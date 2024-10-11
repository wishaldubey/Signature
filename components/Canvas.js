import { useRef, useState, useEffect } from 'react';
import { FaPencilAlt, FaEraser, FaUndo, FaRedo, FaTrash } from 'react-icons/fa';

const Canvas = () => {
  const canvasRef = useRef(null);
  const ctxRef = useRef(null);
  const [isDrawing, setIsDrawing] = useState(false);
  const [color, setColor] = useState('#000000');
  const [pencilSize, setPencilSize] = useState(5);
  const [eraserSize, setEraserSize] = useState(20);
  const [history, setHistory] = useState([]);
  const [historyStep, setHistoryStep] = useState(0);
  const [isErasing, setIsErasing] = useState(false);

  useEffect(() => {
    prepareCanvas();
    window.addEventListener('resize', prepareCanvas);
    return () => window.removeEventListener('resize', prepareCanvas);
  }, []);

  const prepareCanvas = () => {
    const canvas = canvasRef.current;
    canvas.width = window.innerWidth * 0.9;
    canvas.height = window.innerHeight * 0.6;
    const ctx = canvas.getContext('2d');
    ctx.lineCap = 'round';
    ctx.strokeStyle = color;
    ctx.lineWidth = pencilSize;
    ctxRef.current = ctx;

    // Prevent scrolling while drawing
    canvas.addEventListener('touchstart', preventScroll, { passive: false });
    canvas.addEventListener('touchmove', preventScroll, { passive: false });
  };

  const preventScroll = (event) => {
    event.preventDefault();
  };

  const getPosition = (event) => {
    const canvas = canvasRef.current;
    const rect = canvas.getBoundingClientRect();
    const x = (event.clientX || (event.touches[0]?.clientX)) - rect.left;
    const y = (event.clientY || (event.touches[0]?.clientY)) - rect.top;
    return { x, y };
  };

  const startDrawing = (event) => {
    event.preventDefault(); // Prevent default touch behavior
    const { x, y } = getPosition(event);
    ctxRef.current.beginPath();
    ctxRef.current.moveTo(x, y);
    setIsDrawing(true);
  };

  const finishDrawing = () => {
    if (!isDrawing) return;
    ctxRef.current.closePath();
    setIsDrawing(false);
    const canvas = canvasRef.current;
    const newHistory = history.slice(0, historyStep);
    newHistory.push(canvas.toDataURL());
    setHistory(newHistory);
    setHistoryStep(newHistory.length);
  };

  const draw = (event) => {
    event.preventDefault(); // Prevent default touch behavior
    if (!isDrawing) return;
    const { x, y } = getPosition(event);
    ctxRef.current.lineTo(x, y);
    ctxRef.current.stroke();
  };

  const changeColor = (newColor) => {
    setColor(newColor);
    ctxRef.current.strokeStyle = newColor;
  };

  const undo = () => {
    if (historyStep === 0) return;
    setHistoryStep(historyStep - 1);
    const canvasPic = new Image();
    canvasPic.src = history[historyStep - 1];
    canvasPic.onload = () => {
      ctxRef.current.clearRect(0, 0, canvasRef.current.width, canvasRef.current.height);
      ctxRef.current.drawImage(canvasPic, 0, 0);
    };
  };

  const redo = () => {
    if (historyStep >= history.length) return;
    setHistoryStep(historyStep + 1);
    const canvasPic = new Image();
    canvasPic.src = history[historyStep];
    canvasPic.onload = () => {
      ctxRef.current.clearRect(0, 0, canvasRef.current.width, canvasRef.current.height);
      ctxRef.current.drawImage(canvasPic, 0, 0);
    };
  };

  const erase = () => {
    ctxRef.current.strokeStyle = '#FFFFFF';
    ctxRef.current.lineWidth = eraserSize;
    setIsErasing(true);
  };

  const normalDraw = () => {
    ctxRef.current.strokeStyle = color;
    ctxRef.current.lineWidth = pencilSize;
    setIsErasing(false);
  };

  const clearCanvas = () => {
    ctxRef.current.clearRect(0, 0, canvasRef.current.width, canvasRef.current.height);
    setHistory([]); 
    setHistoryStep(0); 
  };

  const exportPNG = () => {
    const canvas = canvasRef.current;
    const link = document.createElement('a');
    link.download = 'drawing.png';
    link.href = canvas.toDataURL('image/png');
    link.click();
  };

  const exportJPEG = () => {
    const canvas = canvasRef.current;
    const link = document.createElement('a');
    link.download = 'drawing.jpg';
    link.href = canvas.toDataURL('image/jpeg');
    link.click();
  };

  return (
    <div className="flex flex-col items-center space-y-4">
      <canvas
        ref={canvasRef}
        onMouseDown={startDrawing}
        onMouseUp={finishDrawing}
        onMouseMove={draw}
        onTouchStart={startDrawing}
        onTouchEnd={finishDrawing}
        onTouchMove={draw}
        className="border bg-white rounded-lg shadow-md transition-all duration-300 ease-in-out"
      />
      <div className="flex flex-wrap justify-center space-x-2 space-y-2">
        {/* Other UI elements like color picker, undo, redo, export buttons */}
      </div>
    </div>
  );
};

export default Canvas;
