import DrawingCanvas from "./Canvas";
import Players from "./Players";
import Chat from "./Chat";
import { useContext, useEffect, useState } from "react";
import { UserContext } from "../context/UserContext";
import { useLocation, useNavigate } from "react-router-dom";
import { GameContext } from "../context/GameContext";
import { socket } from "../utils/socket";
import Chronometer from "./Chronometer";
import DrawThis from "./DrawThis";
import GuessThis from "./GuessThis";
import ErrorMessage from "./ErrorMessage";
import GameOwnerSettings from "./GameOwnerSettings";

function Game() {
  const { game, setGame } = useContext(GameContext);
  const { user } = useContext(UserContext);
  const location = useLocation();
  const navigate = useNavigate();
  const [wordToChoose, setWordToChoose] = useState([]);
  const [wordChosen, setWordChosen] = useState(null);
  useEffect(() => {
    if (user === null) {
      navigate("/?id=" + location.pathname.slice(1));
    }
    socket.on("player-joined", (data) => {
      setGame((prevGame) => {
        const isAlreadyAdded = prevGame.players.some(player => player[0] === data[0]);
        if (isAlreadyAdded) {
          return prevGame;
        }
        return { ...prevGame, players: [...prevGame.players, data] };
      });
    });

    socket.on("player-left", (data) => {
      setGame((prevGame) => ({
        ...prevGame,
        players: prevGame.players.filter((player) => player[0] !== data.playerId),
      }));
    });

    socket.on("ownership", (data) => {
      setGame((prev) => ({ ...prev, owner: data.owner }));
    });

    socket.on("words-choosing", (data) => {
      if (data.gameStarted) {
        setGame((prev) => ({ ...prev, gameStarted: true }));
      }
      setWordToChoose(data.words);
      setWordChosen(null);
      setGame((prev) => ({ ...prev, wordLenght:0, roundTime:0 ,wordchoosingTime: 10  ,drawerChoosing: false ,drawer: data.drawer }));
      
    });

    socket.on("drawer-choosing", (data) => {
      if (data.gameStarted) {
        setGame((prev) => ({ ...prev, gameStarted: true }));
      }
      setWordChosen(null);
      setGame((prev) => ({ ...prev, drawerChoosing: true, wordchoosingTime: 10, wordLenght:0 , roundTime:0 ,drawer: data.drawer }));
      
    });

    socket.on("gameStarted", () => {
      setGame((prev) => ({ ...prev, gameStarted: true }));
    });

    socket.on("wordChosen", (data) => {
      setWordChosen(data.word);
      setWordToChoose([]);
      setGame((prev) => ({ ...prev, drawerChoosing: false ,roundTime:200 }));
    });

    socket.on("wordLength", (data) => {
      setGame((prev) => ({ ...prev, wordLenght: data.wordLenght, drawerChoosing: false , roundTime:200 }));
    });
  }, []);
  socket.on("word-timer", (data) => {
    setGame((prev) => ({ ...prev, wordchoosingTime: data.time }));
  });
  socket.on("round-timer", (data) => {
    setGame((prev) => ({ ...prev, roundTime: data.time }));});
  const handleWordChoice = (word) => {
    socket.emit("wordChosen", word);
  };

  if (!game) return <>Loading...</>;

  return (<>
  <ErrorMessage/>
    <div className="flex justify-center items-center h-screen relative bg-game">
      
      {/* Game UI */}
      {game.gameStarted ? (
        <div >
          {/* Word Display Box */}
          <div className="flex relative justify-center items-start gap-5 w-full h-[60vh]">
          
            {wordChosen || game.wordLenght ? (
              <div className="absolute -translate-y-[120%] w-full flex items-center justify-between bg-white">
                <Chronometer time={game.roundTime}/>
                {wordChosen ? <DrawThis word={wordChosen}  />:<GuessThis wordLenght={game.wordLenght} />}
                <Chronometer time={game.roundTime}/>
              </div>
            ) : null}
            <Players players={game.players} />
            <DrawingCanvas roundTime={game.roundTime} canDraw={game.drawer.id==game.user.id}/>
            <Chat />
          </div>

          {/* Word Selection UI for Drawer - Fullscreen Overlay */}
          {wordToChoose.length > 0 && (<>
            
            <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50 backdrop-blur-md h-full w-full z-50">
              <div className="bg-white bg-opacity-80 p-6 rounded-xl shadow-lg text-center">
                <h2 className="text-lg font-bold mb-4">Pick a word to draw</h2>
                <div className="flex gap-3">
                  {wordToChoose.map((word, index) => (
                    <button
                      key={index}
                      onClick={() => handleWordChoice(word)}
                      className="px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-700 transition"
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
              <p className="text-white text-2xl font-semibold">Waiting for {game.drawer.username} to choose a word...</p>
            </div>
          )}
        </div>
      ) : game.owner ? (<GameOwnerSettings game={game}/>
      ) : (
        <div>Waiting for the owner to start the game...</div>
      )}
    </div></>
  );
}

export default Game;
