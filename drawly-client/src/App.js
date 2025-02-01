import DrawingCanvas from "./Canvas";
import Players from "./Players";
import Chat from "./Chat";
import {socket} from "./socket"
import { useContext, useEffect, useState } from "react";
import {useNavigate, useParams } from "react-router-dom";
import { userNameContext } from "./AppRoutes";
import Timer from "./Timer";



function App() {

  const {id}=useParams();
  const [owner,setOwner]=useState(false);
  const [players,setPlayers]=useState([]);
  const [canDraw,setCanDraw]=useState(false);
  const usernameContext=useContext(userNameContext);
  const navigate=useNavigate();
  const startGame=()=>{
    socket.emit("start-game")
  }

  useEffect(()=>
    {
      if(usernameContext.userName=="")
        navigate(`/?redirect=${id}`)

      socket.emit("get-room-info",{room_id:id})
      socket.on("player-joined",(data)=>
        {
          setPlayers((prevPlayers) => [...prevPlayers, { id: data.id, name: data.name }]);
        })
      socket.on("transfer-ownership",()=>{
        setOwner(true)
      })
      socket.on("room-info",(data)=>
        {
          setOwner(data.owner)
          setPlayers(data.clients)
        })
        socket.on("invalid-room",()=>
          {
            navigate("/")
          })
      socket.on("player-disconnected",(data)=>
        {
          setPlayers((prevPlayers) => prevPlayers.filter((player) => player.id !== data.id));
        })
    },[]);
  return (
    <>{owner && <button onClick={()=>startGame()}>start Game</button>}
  <div className="flex justify-center items-center h-[100vh]">
    <div className="flex justify-around h-[50vh] items-grow w-full">
      <Timer  />
      <Players players={players}/>
      <DrawingCanvas canDraw={canDraw}/>
      <Chat/>
    </div>
  </div>
  </>
  
  );
}

export default App;
