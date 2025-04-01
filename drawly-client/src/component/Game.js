import DrawingCanvas from "./Canvas";
import Players from "./Players";
import Chat from "./Chat";
import { useContext, useEffect, useRef, useState } from "react";
import { UserContext } from "../context/UserContext";
import { useLocation, useNavigate } from "react-router-dom";
import { GameContext } from "../context/GameContext";
import { socket } from "../utils/socket";
import Chronometer from "./Chronometer";
import DrawThis from "./DrawThis";
import GuessThis from "./GuessThis";
import ErrorMessage from "./ErrorMessage";
import GameOwnerSettings from "./GameOwnerSettings";
import Round from "./Round";
import PlayerPoints from "./PlayerPoints";

function Game() {
  const clearCanvasRef=useRef(null)
  const { game, setGame } = useContext(GameContext);
  const { user } = useContext(UserContext);
  const location = useLocation();
  const navigate = useNavigate();
  const [messages, setMessages] = useState([]);
  const [wordToChoose, setWordToChoose] = useState([]);
  const [wordChosen, setWordChosen] = useState(null);
  useEffect(() => {
    if (user === null) {
      navigate("/?id=" + location.pathname.slice(1));
    }
    
    const handleMessage=(data) => {
      let newdata={...data}
      delete data.points
      delete data.id
      if(newdata.points)
        {
          setGame((prevGame)=>({...prevGame,players:prevGame.players.map(item =>{
            return item[0] == newdata.id ? [item[0], item[1], item[2] + newdata.points] : item
          })}))
        }
      
      setMessages((prevMessages) => [...prevMessages, data]);
    }
    const handlePlayerJoined = (data) => {
      setGame((prevGame) => {
        return { ...prevGame, players: data };
      });
    };

    const handlePlayerLeft = (data) => {
      setGame((prevGame) => {
        return {...prevGame,players: data.players}});
    };

    const handleOwnership = (data) => {
      setGame((prev) => ({ ...prev, owner: data.owner }));
    };

    const handleWordsChoosing = (data) => {
      if(clearCanvasRef.current){
        clearCanvasRef.current.clearCanvas()
      }
      if (data.gameStarted) {
        setGame((prev) => ({ ...prev, gameStarted: true }));
      }
      setWordToChoose(data.words);
      setWordChosen(null);
      setGame((prev) => ({
        ...prev,
        showingRoundCounter: false,
        showingPlayerPoints:false,
        wordLenght: 0,
        roundTime: 0,
        wordchoosingTime: data.maxWordPickingTimer,
        drawerChoosing: false,
        drawer: data.drawer,
      }));
    };
    const handleGameEnd=(data)=>
    {
      console.log(data.players)
      setGame(prevGame=>({...prevGame,gameStarted:false,drawer:null ,wordLenght:null,showingRoundCounter:false,showingPlayerPoints:false
        , players:data.players
      }))
      setWordToChoose([])
      setWordChosen(null)
      setMessages([])
    }
    const handleDrawerChoosing = (data) => {
      clearCanvasRef.current.clearCanvas()
      setWordChosen(null);
      setGame((prev) => ({
        ...prev,
        showingRoundCounter: false,
        showingPlayerPoints:false,
        drawerChoosing: true,
        wordchoosingTime: data.maxWordPickingTimer,
        wordLenght: 0,
        roundTime: 0,
        drawer: data.drawer,
      }));
    };

    const handleGameStarted = () => {
      setGame((prev) => ({ ...prev, gameStarted: true }));
    };

    const handleWordChosen = (data) => {
      setWordChosen(data.word);
      setWordToChoose([]);
      setGame((prev) => ({
        ...prev,
        drawerChoosing: false,
        roundTime: data.roundmaxTimer,
      }));
    };

    const handleWordLength = (data) => {
      setGame((prev) => ({
        ...prev,
        wordLenght: data.wordLenght,
        drawerChoosing: false,
        roundTime: data.roundmaxTimer,
      }));
    };

    const handleWordTimer = (data) => {
      setGame((prev) => ({ ...prev, wordchoosingTime: data.time }));
    };

    const handleRoundTimer = (data) => {
      setGame((prev) => ({ ...prev, roundTime: data.time }));
    };
    const handleRoundPoints=(data)=>
    {
      setGame((prevGame)=>({...prevGame,wordLenght:null,playerPoints:data,drawer:null ,showingPlayerPoints:true,showingRoundCounter:false, drawerChoosing:false}))
      setWordChosen(null)
    }
    const handleNewRound = (data) => 
      {
        if(data.gameStarted) {
          setGame((prev) => ({ ...prev, gameStarted: true, roundCounter: data.roundCounter,showingRoundCounter:true,showingPlayerPoints:false ,playerPoints:[], drawerChoosing:false }));
        }
        else
        {
          setGame((prev => ({ ...prev, roundCounter: data.roundCounter,showingRoundCounter:true ,showingPlayerPoints:false ,playerPoints:[], drawerChoosing:false})));
        }
      }
    socket.on("new-round",handleNewRound)
    socket.on("players-points",handleRoundPoints)
    socket.on("message", handleMessage);
    socket.on("end-game",handleGameEnd)
    socket.on("player-joined", handlePlayerJoined);
    socket.on("player-left", handlePlayerLeft);
    socket.on("ownership", handleOwnership);
    socket.on("words-choosing", handleWordsChoosing);
    socket.on("drawer-choosing", handleDrawerChoosing);
    socket.on("gameStarted", handleGameStarted);
    socket.on("wordChosen", handleWordChosen);
    socket.on("wordLength", handleWordLength);
    socket.on("word-timer", handleWordTimer);
    socket.on("round-timer", handleRoundTimer);

    // Cleanup event listeners when component unmounts
    return () => {
      socket.off("new-round",handleNewRound)
      socket.off("players-points",handleRoundPoints)
      socket.off("message",handleMessage)
      socket.off("end-game",handleGameEnd)
      socket.off("player-joined", handlePlayerJoined);
      socket.off("player-left", handlePlayerLeft);
      socket.off("ownership", handleOwnership);
      socket.off("words-choosing", handleWordsChoosing);
      socket.off("drawer-choosing", handleDrawerChoosing);
      socket.off("gameStarted", handleGameStarted);
      socket.off("wordChosen", handleWordChosen);
      socket.off("wordLength", handleWordLength);
      socket.off("word-timer", handleWordTimer);
      socket.off("round-timer", handleRoundTimer);
    };
  }, []);
  
  const handleWordChoice = (word) => {
    socket.emit("wordChosen", word);
  };
  if (!game) return <>Loading...</>;

  return (<>
  <ErrorMessage/>
  
    <div className="flex justify-center items-center h-screen relative bg-game">
      
      {/* Game UI */}
      {game.gameStarted ? (
        
        <div>
          {/* Round Counter */}
          {game.showingRoundCounter? (<Round round={game.roundCounter} roundMax={game.number_of_rounds}/>) : null}
          {game.showingPlayerPoints? (<PlayerPoints playerPoints={game.playerPoints} />) : null}
          {/* Word Display Box */}
          <div className="flex relative justify-center items-start gap-5 w-full h-[60vh]">
          
            {wordChosen || game.wordLenght ? (
              <div className="absolute -translate-y-[120%] w-full flex items-center justify-between bg-white">
                <Chronometer time={game.roundTime}/>
                {wordChosen ? <DrawThis word={wordChosen}  />:<GuessThis wordLenght={game.wordLenght} />}
                <Chronometer time={game.roundTime}/>
              </div>
            ) : null}
            <Players />
            <DrawingCanvas roundTime={game.roundTime} canDraw={game.drawer?game.drawer.id==game.user.id:false} ref={clearCanvasRef}/>
            <Chat messages={messages}/>
          </div>

          {/* Word Selection UI for Drawer - Fullscreen Overlay */}
          {wordToChoose.length > 0 && (<>
            
            <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50 backdrop-blur-md h-full w-full z-50">
              <div className="bg-white bg-opacity-80 p-6 rounded-xl shadow-lg text-center">
                <h2 className="text-2xl font-bold mb-4">Pick a word to draw</h2>
                <div className="flex gap-3">
                  {wordToChoose.map((word, index) => (
                    <button
                      key={index}
                      onClick={() => handleWordChoice(word)}
                      className="px-4 py-2 bg-blue-500 text-white text-md rounded-lg hover:bg-blue-700 transition roboto-font"
                    >
                      {word}
                    </button>
                  ))}
                </div>
              </div>
            </div></>
          )}

          {/* Waiting Overlay for Non-Drawer Players - Fullscreen Overlay */}
          {game.drawerChoosing && (
            <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50 backdrop-blur-md h-full w-full z-40">
              <p className="text-white text-2xl font-semibold">Waiting for {game.drawer?.username} to choose a word...</p>
            </div>
          )}
        </div>
      ) : game.owner ? (<GameOwnerSettings/>
      ) : (<div className="waiting-players">
        <div >Waiting for the owner to start the game </div>
        <span class="loader"></span>
        </div>
      )}
    </div></>
  );
}

export default Game;
