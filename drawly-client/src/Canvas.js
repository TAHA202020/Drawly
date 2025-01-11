import React, { useRef, useState, useEffect } from 'react';
import { socket } from './socket';
const DrawingCanvas = () => {
  const canvasRef = useRef(null);
  const [isDrawing, setIsDrawing] = useState(false);



  useEffect(() => {
    const canvas = canvasRef.current;
    const context = canvas.getContext('2d');

    // Initialize canvas settings
    context.lineWidth = 5;
    context.lineCap = 'round';
    context.strokeStyle = 'black';
    socket.on("draw-start",(data)=>
        {
            context.beginPath()
            context.moveTo(data.x, data.y);
        })
    socket.on("draw-end",()=>
        {
            context.closePath()
        })
    socket.on("draw",(data)=>
        {
            context.lineTo(data.x, data.y);
            context.stroke();
        })
    socket.on()
  }, []);

  const handleMouseDown = (e) => {
    const canvas = canvasRef.current;
    const context = canvas.getContext('2d');
    context.beginPath();
    context.moveTo(e.nativeEvent.offsetX, e.nativeEvent.offsetY);
    setIsDrawing(true);
    socket.emit("draw-start",{x:e.nativeEvent.offsetX,y: e.nativeEvent.offsetY})
  };

  const handleMouseMove = (e) => {
    if (!isDrawing) return;

    const canvas = canvasRef.current;
    const context = canvas.getContext('2d');
    context.lineTo(e.nativeEvent.offsetX, e.nativeEvent.offsetY);
    context.stroke();
    socket.emit("draw",{x:e.nativeEvent.offsetX,y: e.nativeEvent.offsetY})
  };

  const handleMouseUp = () => {
    setIsDrawing(false);
    socket.emit("draw-end",{})
  };

  return (
    <canvas
      ref={canvasRef}
      width={500}
      height={500}
      style={{ border: '1px solid black', cursor: 'crosshair' }}
      onMouseDown={handleMouseDown}
      onMouseMove={handleMouseMove}
      onMouseUp={handleMouseUp}
      onMouseLeave={handleMouseUp} // Stops drawing if mouse leaves the canvas
    ></canvas>
  );
};

export default DrawingCanvas;
