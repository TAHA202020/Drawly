import React, { useRef, useState, useEffect } from 'react';
import { socket } from '../utils/socket';
const DrawingCanvas = () => {
  const canvasRef = useRef(null);
  const [isDrawing, setIsDrawing] = useState(false);


  
  useEffect(() => {
    
    const canvas = canvasRef.current;
    const context = canvas.getContext('2d');
    canvas.height=window.innerHeight/2
    canvas.width=window.innerWidth/2
    context.lineWidth = 5;
    context.lineCap = 'round';
    context.strokeStyle = 'black';
    socket.on("draw-start",(data)=>
        {
            context.beginPath()
            context.moveTo(data.x, data.y);
        })
    socket.on("draw-end",(data)=>
        {
            context.beginPath()
            context.arc(data.x,data.y,3,0,Math.PI*2)
            context.fill()
            context.closePath()
        })
    socket.on("draw",(data)=>
        {
            context.lineTo(data.x, data.y);
            context.stroke();
        })


    // resize canvas on window height or width change
    window.addEventListener("resize",()=>
          { 
            canvas.height=window.innerHeight/2
            canvas.width=window.innerWidth/2
          })
  }, []);

  const handleMouseDown = (e) => {
    const canvas = canvasRef.current;
    const context = canvas.getContext('2d');
    context.beginPath();
    context.moveTo(e.nativeEvent.offsetX, e.nativeEvent.offsetY);
    
    socket.emit("draw-start",{x:e.nativeEvent.offsetX,y: e.nativeEvent.offsetY})
    setIsDrawing(true);
  };

  const handleMouseMove = (e) => {
    if (!isDrawing) return;

    const canvas = canvasRef.current;
    const context = canvas.getContext('2d');
    context.lineTo(e.nativeEvent.offsetX, e.nativeEvent.offsetY);
    context.stroke();
    socket.emit("draw",{x:e.nativeEvent.offsetX,y: e.nativeEvent.offsetY})
  };

  const handleMouseUp = (e) => {
    if(!isDrawing)
      return
    const context =e.target.getContext("2d")
    context.beginPath()
    context.arc(e.nativeEvent.offsetX,e.nativeEvent.offsetY,2.5,0,Math.PI*2)
    context.fill()
    context.closePath()
    socket.emit("draw-end",{x:e.nativeEvent.offsetX,y: e.nativeEvent.offsetY})
    setIsDrawing(false);
  };

  return (
    <canvas
      ref={canvasRef}
      width={"50%"}
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
