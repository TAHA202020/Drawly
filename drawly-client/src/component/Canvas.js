import React, { useRef, useState, useEffect, useContext } from "react";
import Chronometer from "./Chronometer";
import { socket } from "../utils/socket";
import fill from "../assets/fill.gif";
import pen from "../assets/pen.gif";
import clear from "../assets/clear.gif";
const DrawingCanvas = ({roundTime , canDraw}) => {
  const canvasRef = useRef(null);
  const [isDrawing, setIsDrawing] = useState(false);
  const [selectedColor, setSelectedColor] = useState("#000000");
  const [tool, setTool] = useState("draw");
  useEffect(() => {
    const canvas = canvasRef.current;
    const context = canvas.getContext("2d");

    canvas.height = window.innerHeight * 0.6;
    canvas.width = window.innerWidth * 0.6;
    context.lineCap = "round";
    

    socket.on("draw-start", (data) => {
      context.beginPath();
      context.lineWidth = 5;
      context.strokeStyle = data.color;
      context.moveTo(data.x, data.y);
    });

    socket.on("draw-end", (data) => {
      context.beginPath();
      context.strokeStyle = data.color;
      context.arc(data.x, data.y, 3, 0, Math.PI * 2);
      context.fillStyle = data.color;
      context.fill();
      context.closePath();
    });

    socket.on("draw", (data) => {
      context.lineTo(data.x, data.y);
      context.stroke();
    });

    socket.on("fill", (data) => {
      scanlineFloodFill(data.x, data.y, data.color);
    });
    socket.on("clear-canvas", () => {
      handleClearCanvas();
    });

    const handleResize = () => {
      const tempCanvas = document.createElement("canvas");
      tempCanvas.width = canvas.width;
      tempCanvas.height = canvas.height;
      const tempContext = tempCanvas.getContext("2d");
      
      // Copy the current drawing to tempCanvas
      tempContext.drawImage(canvas, 0, 0);
  
      // Resize canvas
      canvas.width = window.innerWidth *0.6;
      canvas.height = window.innerHeight *0.6;
  
      // Restore the drawing
      context.drawImage(tempCanvas, 0, 0);
    };
  
    window.addEventListener("resize", handleResize);
    return () => {
      window.removeEventListener("resize", handleResize);
    };
  }, []);
  const handleMouseDown = (e) => {
    if(!canDraw) return;

    if (tool === "fill") {
      const x = e.nativeEvent.offsetX;
      const y = e.nativeEvent.offsetY;
      socket.emit("fill", { x, y, color: selectedColor });

      scanlineFloodFill(x, y, selectedColor);
      return;
    }

    const canvas = canvasRef.current;
    
    const context = canvas.getContext("2d");
    context.strokeStyle = selectedColor;
    context.beginPath();
    context.lineWidth = 5;
    context.moveTo(e.nativeEvent.offsetX, e.nativeEvent.offsetY);
    socket.emit("draw-start", { x: e.nativeEvent.offsetX, y: e.nativeEvent.offsetY ,color:selectedColor});
    setIsDrawing(true);
  };

  const handleMouseMove = (e) => {
    if(!canDraw) return;
    if (!isDrawing) return;

    const canvas = canvasRef.current;
    const context = canvas.getContext("2d");
    context.lineTo(e.nativeEvent.offsetX, e.nativeEvent.offsetY);
    context.stroke();
    socket.emit("draw", { x: e.nativeEvent.offsetX, y: e.nativeEvent.offsetY ,color:selectedColor});
  };

  const handleMouseUp = (e) => {
    if(!canDraw) return;
    if (!isDrawing) return;

    const context = e.target.getContext("2d");
    context.strokeStyle = selectedColor;
    context.beginPath();
    context.arc(e.nativeEvent.offsetX, e.nativeEvent.offsetY, 2.5, 0, Math.PI * 2);
    context.fillStyle = selectedColor;
    context.fill();
    context.closePath();
    socket.emit("draw-end", { x: e.nativeEvent.offsetX, y: e.nativeEvent.offsetY,color:selectedColor });
    setIsDrawing(false);
  };

  const scanlineFloodFill = (startX, startY, fillColor) => {
    const canvas = canvasRef.current;
    if(!canvas) return;
    const ctx = canvas.getContext("2d");
    const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
    const pixels = imageData.data;
    const width = canvas.width;

    const startColor = getPixelColor(startX, startY, pixels, width);
    const newColor = hexToRgbA(fillColor);

    if (colorMatch(startColor, newColor)) return;

    const stack = [{ x: startX, y: startY }];

    while (stack.length) {
      let { x, y } = stack.pop();

      while (y >= 0 && colorMatch(getPixelColor(x, y, pixels, width), startColor)) {
        y--;
      }
      y++;

      let spanLeft = false;
      let spanRight = false;

      while (y < canvas.height && colorMatch(getPixelColor(x, y, pixels, width), startColor, 30)) {
        setPixelColor(x, y, newColor, pixels, width);

        if (!spanLeft && x > 0 && colorMatch(getPixelColor(x - 1, y, pixels, width), startColor)) {
          stack.push({ x: x - 1, y });
          spanLeft = true;
        } else if (spanLeft && x > 0 && !colorMatch(getPixelColor(x - 1, y, pixels, width), startColor)) {
          spanLeft = false;
        }

        if (!spanRight && x < canvas.width - 1 && colorMatch(getPixelColor(x + 1, y, pixels, width), startColor)) {
          stack.push({ x: x + 1, y });
          spanRight = true;
        } else if (spanRight && x < canvas.width - 1 && !colorMatch(getPixelColor(x + 1, y, pixels, width), startColor)) {
          spanRight = false;
        }

        y++;
      }
    }

    ctx.putImageData(imageData, 0, 0);
  };

  const getPixelColor = (x, y, pixels, width) => {
    const index = (y * width + x) * 4;
    return pixels.slice(index, index + 4);
  };

  const setPixelColor = (x, y, color, pixels, width) => {
    const index = (y * width + x) * 4;
    pixels[index] = color[0];
    pixels[index + 1] = color[1];
    pixels[index + 2] = color[2];
    pixels[index + 3] = 255;
  };

  const colorMatch = (color1, color2, tolerance = 20) => {
    return (
      Math.abs(color1[0] - color2[0]) <= tolerance &&
      Math.abs(color1[1] - color2[1]) <= tolerance &&
      Math.abs(color1[2] - color2[2]) <= tolerance
    );
  };

  const hexToRgbA = (hex) => {
    const bigint = parseInt(hex.slice(1), 16);
    return [(bigint >> 16) & 255, (bigint >> 8) & 255, bigint & 255, 255];
  };
  const handleClearCanvas = () => {
    const canvas = canvasRef.current;
    const context = canvas.getContext("2d");
  
    // Clear the canvas
    context.clearRect(0, 0, canvas.width, canvas.height);
    socket.emit("clear-canvas");
  };
  return (
    <div className="flex flex-col items-center relative">
    
      {canDraw && <div className="palette">
      <h1 className="text-2xl font-bold text-center">Palette</h1>
      <div className="flex flex-row justify-center items-center gap-[50px] mt-2 mb-10">
          {/* Colors */}
          <div className="flex flex-row items-start">
          <img src={clear} alt="clear" onClick={()=>handleClearCanvas()} className="tool px-3 py-1 border"/>
          <img src={pen} alt="pen" onClick={() => setTool("draw")} className={`px-3 py-1 border ${tool === "draw" ? "bg-gray-300" : ""} cursor-pointer tool`} />
          <img src={fill} alt="fill" onClick={() => setTool("fill")} className={`px-3 py-1 border ${tool === "fill" ? "bg-gray-300" : ""} fill-bg cursor-pointer tool`} />
          </div>
          {/* Colors */}
          <div className=" flex flex-row flex-wrap gap-2 ">
          <div className="bg-[#000000] w-[50px] aspect-square palette-color" onClick={()=>setSelectedColor("#000000")}></div>
          <div className="bg-[#808080] w-[50px] aspect-square palette-color" onClick={()=>setSelectedColor("#808080")}></div>
          <div className="bg-[#C0C0C0] w-[50px] aspect-square palette-color" onClick={()=>setSelectedColor("#C0C0C0")}></div>
          <div className="bg-[#FFFFFF] w-[50px] aspect-square palette-color" onClick={()=>setSelectedColor("#FFFFFF")}></div>
          <div className="bg-[#FF0000] w-[50px] aspect-square palette-color" onClick={()=>setSelectedColor("#FF0000")}></div>
          <div className="bg-[#FFA500] w-[50px] aspect-square palette-color" onClick={()=>setSelectedColor("#FFA500")}></div>
          <div className="bg-[#FFFF00] w-[50px] aspect-square palette-color" onClick={()=>setSelectedColor("#FFFF00")}></div>
          <div className="bg-[#008000] w-[50px] aspect-square palette-color" onClick={()=>setSelectedColor("#008000")}></div>
          <div className="bg-[#00FF00] w-[50px] aspect-square palette-color" onClick={()=>setSelectedColor("#00FF00")}></div>
          <div className="bg-[#00FFFF] w-[50px] aspect-square palette-color" onClick={()=>setSelectedColor("#00FFFF")}></div>
          <div className="bg-[#0000FF] w-[50px] aspect-square palette-color" onClick={()=>setSelectedColor("#0000FF")}></div>
          <div className="bg-[#00AAFF] w-[50px] aspect-square palette-color" onClick={()=>setSelectedColor("#00AAFF")}></div>
          <div className="bg-[#800080] w-[50px] aspect-square palette-color" onClick={()=>setSelectedColor("#800080")}></div>
          <div className="bg-[#FFC0CB] w-[50px] aspect-square palette-color" onClick={()=>setSelectedColor("#FFC0CB")}></div>
          <div className="bg-[#8B4513] w-[50px] aspect-square palette-color" onClick={()=>setSelectedColor("#8B4513")}></div>
          </div>
          </div>
      </div>}

      <canvas
        ref={canvasRef}
        width={"50%"}
        height={500}
        className="bg-white"
        style={{ border: "1px solid black", cursor: tool === "fill" ? "pointer" : "crosshair" }}
        onMouseDown={handleMouseDown}
        onMouseMove={handleMouseMove}
        onMouseUp={handleMouseUp}
        onMouseLeave={handleMouseUp}
      ></canvas>
    </div>
  );
};

export default DrawingCanvas;
