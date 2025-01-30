import DrawingCanvas from "./Canvas";
import Players from "./Players";
import Chat from "./Chat";
import {socket} from "./socket"
import { useContext, useEffect, useState } from "react";
import {useNavigate, useParams } from "react-router-dom";
import { userNameContext } from "./AppRoutes";



function App() {

  const {id}=useParams();
  const [owner,setOwner]=useState(false)
  const [players,setPlayers]=useState([])
  const usernameContext=useContext(userNameContext)
  const navigate=useNavigate()
  
  useEffect(()=>
    {
      if(usernameContext.userName=="")
        navigate(`/?redirect=${id}`)

      socket.emit("get-room-info",{room_id:id})
      socket.on("player-joined",(data)=>
        {
          console.log(data)
          let newPlayers=JSON.parse(JSON.stringify(players)).push({id:data.client,name:data.name})
          setPlayers([newPlayers])
        })
      socket.on("invalid-room",()=>
        {
          navigate("/")
        })
      socket.on("room-info",(data)=>
        {
          console.log(data.clients)
          console.log(data)
          setOwner(data.owner)
          setPlayers(data.clients)
        })
      socket.on("player-disconnected",(data)=>
        {
        })
    },[])
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
