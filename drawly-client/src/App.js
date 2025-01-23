import DrawingCanvas from "./Canvas";
import Players from "./Players";
import Chat from "./Chat";
import {socket} from "./socket"
import { useEffect, useState } from "react";
import { redirect, useNavigate, useParams } from "react-router-dom";



function App() {

  const {id}=useParams();
  const [owner,setOwner]=useState(false)
  const [loading,setLoading]=useState(true)
  const [players,setPlayers]=useState([])
  const navigate=useNavigate()
  useEffect(()=>
    {
      socket.emit("join-room",{id:id})


      socket.on("player-joined",(data)=>
        {
          console.log(data)
          setPlayers([...players,data.client])
        })
      socket.on("invalid-room",()=>
        {
          navigate("/")
        })
      socket.on("room-info",(data)=>
        {
          setLoading(false)
          setOwner(data.owner)
          console.log(data.clients)
          setPlayers(Array.from(data.clients))
          console.log(data)
        })
      socket.on("player-disconnected",(data)=>
        {
        })
    },[])


  if(loading)
    return  <>Loading</>
  return (
    <>{owner && <button onClick={()=>navigate("/")}>start Game</button>}
  <div className="flex justify-center items-center h-[100vh]">
    <div className="flex justify-around h-[50vh] items-grow w-full">
      
      <Players players={players}/>
      <DrawingCanvas/>
      <Chat/>
    </div>
  </div>
  </>
  
  );
}

export default App;
