import DrawingCanvas from "./Canvas";
import Players from "./Players";
import Chat from "./Chat";
import { useContext, useEffect } from "react";
import { UserContext } from "../context/UserContext";
import { useLocation, useNavigate } from "react-router-dom";
function Game() {
  const {user}=useContext(UserContext);
  const location =useLocation();
  const navigate =useNavigate();
  useEffect(() => {
    if(user===null){
      navigate("/?id="+location.pathname.slice(1));
    }
  }, []);
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
