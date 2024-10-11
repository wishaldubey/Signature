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
    // Disable scrolling
    document.body.style.overflow = 'hidden';
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
    // Re-enable scrolling
    document.body.style.overflow = 'auto';
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
    const ctx = ctxRef.current;

    // Create a temporary canvas to draw the image with a white background
    const tempCanvas = document.createElement('canvas');
    const tempCtx = tempCanvas.getContext('2d');
    
    // Set the same width and height as the original canvas
    tempCanvas.width = canvas.width;
    tempCanvas.height = canvas.height;
    
    // Fill the temp canvas with white background
    tempCtx.fillStyle = '#FFFFFF';
    tempCtx.fillRect(0, 0, tempCanvas.width, tempCanvas.height);
    
    // Draw the original canvas on top of the white background
    tempCtx.drawImage(canvas, 0, 0);

    // Export the image as JPEG
    const link = document.createElement('a');
    link.download = 'drawing.jpg';
    link.href = tempCanvas.toDataURL('image/jpeg');
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
        <input
          type="color"
          value={color}
          onChange={(e) => changeColor(e.target.value)}
          className="w-10 h-10 cursor-pointer shadow-md transition-colors duration-300 ease-in-out border border-gray-300"
          title="Select Color"
        />
        <div className="flex items-center">
          <label htmlFor="pencilSize" className="mr-2 text-sm">Pencil Size: {pencilSize}</label>
          <input
            id="pencilSize"
            type="range"
            min="1"
            max="50"
            value={pencilSize}
            onChange={(e) => {
              setPencilSize(e.target.value);
              if (!isErasing) {
                ctxRef.current.lineWidth = e.target.value;
              }
            }}
            className="w-32 accent-blue-600"
          />
        </div>
        <div className="flex items-center">
          <label htmlFor="eraserSize" className="mr-2 text-sm">Eraser Size: {eraserSize}</label>
          <input
            id="eraserSize"
            type="range"
            min="1"
            max="50"
            value={eraserSize}
            onChange={(e) => {
              setEraserSize(e.target.value);
              if (isErasing) {
                ctxRef.current.lineWidth = e.target.value;
              }
            }}
            className="w-32 accent-red-600"
          />
        </div>
        <button
          onClick={() => { normalDraw(); setIsErasing(false); }}
          className={`flex items-center px-4 py-2 rounded-lg transition duration-300 ease-in-out transform hover:scale-110  ${
            !isErasing ? "bg-yellow-500 text-black border border-yellow-600" : "bg-gray-600 text-gray-200 hover:bg-purple-600"
          }`}
        >
          <FaPencilAlt className="mr-1" />
        </button>
        <button
          onClick={() => { erase(); setIsErasing(true); }}
          className={`flex items-center px-4 py-2 rounded-lg transition duration-300 ease-in-out transform hover:scale-110 ${
            isErasing ? "bg-yellow-500 text-black border border-yellow-600" : "bg-gray-600 text-gray-200 hover:bg-purple-600"
          }`}
        >
          <FaEraser className="mr-1" />
        </button>
        <button
          onClick={undo}
          className="flex items-center bg-blue-700 text-white px-4 py-2 rounded-lg hover:bg-purple-600 transition duration-300 ease-in-out transform hover:scale-105"
        >
          <FaUndo className="mr-1" />
        </button>
        <button
          onClick={redo}
          className="flex items-center bg-blue-700 text-white px-4 py-2 rounded-lg hover:bg-purple-600 transition duration-300 ease-in-out transform hover:scale-110"
        >
          <FaRedo className="mr-1" />
        </button>
        <button
          onClick={clearCanvas}
          className="flex items-center bg-red-600 text-white px-4 py-2 rounded-lg hover:bg-purple-600 transition duration-300 ease-in-out transform hover:scale-110"
        >
          <FaTrash className="mr-1" />
        </button>
        <button
          onClick={exportPNG}
          className="bg-green-700 text-white px-4 py-2 rounded-lg hover:bg-purple-600 transition duration-300 ease-in-out transform hover:scale-110"
        >
          Export PNG
        </button>
        <button
          onClick={exportJPEG}
          className="bg-green-700 text-white px-4 py-2 rounded-lg hover:bg-purple-600 transition duration-300 ease-in-out transform hover:scale-110"
        >
          Export JPEG
        </button>
      </div>
    </div>
  );
};

export default Canvas;
