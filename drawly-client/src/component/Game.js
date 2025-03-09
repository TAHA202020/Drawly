import DrawingCanvas from "./Canvas";
import Players from "./Players";
import Chat from "./Chat";
import { useContext, useEffect } from "react";
import { UserContext } from "../context/UserContext";
import { useNavigate } from "react-router-dom";
function Game() {
  const {user}=useContext(UserContext);
  const navigate =useNavigate();
  useEffect(() => {
    console.log(user)
    if(user===null){
      navigate("/")
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
