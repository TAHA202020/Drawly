import { useEffect } from "react";
import { socket } from "./socket";

export default function Words({words,selectWord}) {
    useEffect(()=>
    {
        const timer = setInterval(()=>{
            
        },1000)
    },[]);
  return (
    <div>
      {words.map((word)=><button className="button-1" onClick={()=>
        {
          selectWord(word)
        }}>{word}</button>)}
    </div>
  );
}