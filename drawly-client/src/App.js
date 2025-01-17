import DrawingCanvas from "./Canvas";
import Players from "./Players";
import Chat from "./Chat";
import {socket} from "./socket"
import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";

function App() {
  const {id}=useParams();
  const [owner,setOwner]=useState(false)
  const [loading,setLoading]=useState(true)
  const navigate=useNavigate()
  useEffect(()=>
    {
      socket.emit("join-room",{id:id})
      socket.on("invalid-room",()=>
        {
          navigate("/")
        })
      socket.on("room-info",(data)=>
        {
          setLoading(false)
          setOwner(data.owner)
          console.log(data)
        })
    },[])


  if(loading)
    return  <>Loading</>
  return (
    <>{owner && <button>start Game</button>}
  <div className="flex justify-center items-center h-[100vh]">
    <div className="flex justify-around h-[50vh] items-grow w-full">
      
      <Players/>
      <DrawingCanvas/>
      <Chat/>
    </div>
  </div>
  </>
  
  );
}

export default App;
