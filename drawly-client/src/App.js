import DrawingCanvas from "./Canvas";
import Players from "./Players";
import Chat from "./Chat";
import {socket} from "./socket"
import { createContext, useCallback, useContext, useEffect, useState } from "react";
import {useNavigate, useParams } from "react-router-dom";
import { userNameContext } from "./AppRoutes";
import Timer from "./Timer";
import Words from "./Words";

export const TimerContext=createContext("")

function App() {
  
  const {id}=useParams();
  const [owner,setOwner]=useState(false);
  const [players,setPlayers]=useState([]);
  const [canDraw,setCanDraw]=useState(false);
  const [time, setTime] = useState(0);
  const [word,setWord]=useState([]);
  const  [gamenotStarted,setGamenotStarted]=useState(true);
  const [playerSelectingWord,setPlayerSelectingWord]=useState("");
  const usernameContext=useContext(userNameContext);
  const navigate=useNavigate();
  const stopTimer=()=>{
    setTime(0)
    setWord([])
  }
  const selectRandom=useCallback((()=>
    {
      socket.emit("selected-word",{word:word[Math.floor(Math.random()*word.length)]})
      stopTimer()   
    }))
  const selectWord=useCallback((word)=>
    {
      socket.emit("selected-word",{word})   
      stopTimer()   
    })

  const startGame=()=>{
    setGamenotStarted(false)
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
        socket.on("word-to-draw",(data)=>
          {
            setWord(data.words)
            setTime(10)
          })
        socket.on("permission-to-draw",()=>
          {
            setCanDraw(true)
          })
        socket.on("word-selected",()=>
          {
            setPlayerSelectingWord("")
          })
        socket.on("player-selecting-word",({player})=>{
          setPlayerSelectingWord(player)
        })
    },[]);
  return (
  <TimerContext.Provider value={{time,setTime}}>
    {owner && gamenotStarted && <button className="start-game-btn" onClick={()=>startGame()}>start Game</button>}
    {word.length>0 && <Words words={word} selectWord={selectWord}/>}
    {playerSelectingWord!="" && <div className="words-container">{playerSelectingWord} is selecting a word</div>}
    <div className="flex justify-center items-center h-[100vh]">
      <div className="flex justify-around h-[50vh] items-grow w-full">
        <Timer  selectRandom={selectRandom}/>
        <Players players={players}/>
        <DrawingCanvas canDraw={canDraw}/>
        <Chat/>
      </div>
    </div>
  </TimerContext.Provider>
  
  );
}

export default App;
