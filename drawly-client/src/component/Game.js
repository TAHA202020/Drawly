import DrawingCanvas from "./Canvas";
import Players from "./Players";
import Chat from "./Chat";
function Game() {
  return (
  <div className="flex justify-center items-center h-[100vh]">
    <div className="flex justify-around h-[50vh] items-grow w-full">
      
      <Players/>
      <DrawingCanvas/>
      <Chat/>
    </div>
  </div>
  );
}

export default Game;
