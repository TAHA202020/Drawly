import DrawingCanvas from "./Canvas";
import Players from "./Players";
import Chat from "./Chat";
import { useContext, useEffect, useState } from "react";
import { UserContext } from "../context/UserContext";
import { useLocation, useNavigate } from "react-router-dom";
import { GameContext } from "../context/GameContext";
import { socket } from "../utils/socket";
import Chronometer from "./Chronometer";

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
      setGame((prev) => ({ ...prev, wordLenght:0, roundTime:0 ,wordchoosingTime: 10  }));
      setWordChosen(null);
    });

    socket.on("drawer-choosing", (data) => {
      if (data.gameStarted) {
        setGame((prev) => ({ ...prev, gameStarted: true }));
      }
      setWordChosen(null);
      setGame((prev) => ({ ...prev, drawerChoosing: true, wordchoosingTime: 10, wordLenght:0 , roundTime:0   }));
      
    });

    socket.on("gameStarted", () => {
      setGame((prev) => ({ ...prev, gameStarted: true }));
    });

    socket.on("wordChosen", (data) => {
      setWordChosen(data.word);
      setWordToChoose([]);
      setGame((prev) => ({ ...prev, drawerChoosing: false }));
    });

    socket.on("wordLength", (data) => {
      setGame((prev) => ({ ...prev, wordLenght: data.wordLenght }));
      setGame((prev) => ({ ...prev, drawerChoosing: false }));
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

  return (
    <div className="flex justify-center items-center h-screen relative">
      {/* Game UI */}
      {game.gameStarted ? (
        <div className="flex flex-col justify-center items-center w-full h-full relative">
          {/* Word Display Box */}
          {wordChosen || game.wordLenght ? (
            <div className="absolute top-4 bg-gray-900 bg-opacity-80 text-white px-6 py-2 rounded-lg text-2xl font-semibold">
              {wordChosen ? wordChosen : "_ ".repeat(game.wordLenght)}
            </div>
          ) : null}

          <div className="flex justify-center items-start gap-5 w-full">
            <Players players={game.players} />
            <DrawingCanvas roundTime={game.roundTime}/>
            <Chat />
          </div>

          {/* Word Selection UI for Drawer - Fullscreen Overlay */}
          {wordToChoose.length > 0 && (<>
            
            <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50 backdrop-blur-md h-full w-full z-50">
              <div className="bg-white bg-opacity-80 p-6 rounded-xl shadow-lg text-center">
                <h2 className="text-lg font-bold mb-4">Pick a word to draw</h2>
                <div className="flex gap-3">
                <Chronometer time={game.wordchoosingTime} />
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
              <Chronometer time={game.wordchoosingTime} />
              <p className="text-white text-2xl font-semibold">Waiting for the drawer to choose a word...</p>
            </div>
          )}
        </div>
      ) : game.owner ? (
        <div>
          <p>You are the owner. Click to start the game.</p>
          <button
            onClick={() => socket.emit("gameStarted")}
            className="px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-700 transition"
          >
            Start Game
          </button>
        </div>
      ) : (
        <div>Waiting for the owner to start the game...</div>
      )}
    </div>
  );
}

export default Game;
