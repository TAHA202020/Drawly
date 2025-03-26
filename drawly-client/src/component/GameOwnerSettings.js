import { useState } from "react"
import { socket } from "../utils/socket"
import ErrorMessage from "./ErrorMessage"
import crown from "../assets/crown.gif"
export default function GameOwnerSettings({game})
{

    const [maxPlayers,setMaxPlayers]=useState(8)
    const [roundTimer,setRoundTimer] =useState(90)
    const [wordpuckingtimer,Setwordpickingtimer]=useState(10)
    return(<>
    <ErrorMessage/>
    <div className="settings relative">
      <img src={crown} alt="crown" className="absolute top-0 left-0 crown" />
      <div className="flex items-center-justify-center flex-col">
              <p>You are the owner. Click to start the game.</p>
              <div className="w-full flex items-center-justify-center flex-col">
                        <div className="flex items-center justify-between w-full">
                            <p>Number Of Players :</p>
                            <div className="range-container">
                                <span className="signs minus" onClick={()=>
                                  {
                                    if(maxPlayers==game.players.length || maxPlayers==2){
                                      return
                                    }
                                    socket.emit("max-players",{maxPlayers:maxPlayers-1})
                                    setMaxPlayers((prev)=>prev-1)
                                  }}></span>
                                <p>{maxPlayers}</p>
                                <span className="signs plus" onClick={()=>
                                  {
                                    if(maxPlayers==8)
                                      return
                                    socket.emit("max-players",{maxPlayers:maxPlayers+1})
                                    setMaxPlayers((prev)=>prev+1)
                                  }}></span>
                            </div>
                        </div>
                        <div className="flex items-center justify-between w-full">
                            <p>Round Timer :</p>
                            <div className="range-container">
                                <span className="signs minus" onClick={()=>
                                  {
                                    if(roundTimer==30){
                                      return
                                    }
                                    socket.emit("round-timer",{roundTimer:roundTimer-5})
                                    setRoundTimer((prev)=>prev-5)
                                  }}></span>
                                <p>{roundTimer}s</p>
                                <span className="signs plus" onClick={()=>
                                  {
                                    if(roundTimer==90)
                                      return
                                    socket.emit("round-timer",{roundTimer:roundTimer+5})
                                    setRoundTimer((prev)=>prev+5)
                                  }}></span>
                            </div>
                        </div>
                        <div className="flex items-center justify-between w-full">
                            <p>Word Picking Timer :</p>
                            <div className="range-container">
                                <span className="signs minus" onClick={()=>
                                  {
                                    if(wordpuckingtimer==5){
                                      return
                                    }
                                    socket.emit("word-timer",{wordtimer:wordpuckingtimer-1})
                                    Setwordpickingtimer((prev)=>prev-1)
                                  }}></span>
                                <p>{wordpuckingtimer}s</p>
                                <span className="signs plus" onClick={()=>
                                  {
                                    if(wordpuckingtimer==15)
                                      return
                                    socket.emit("word-timer",{roundTimer:wordpuckingtimer+1})
                                    Setwordpickingtimer((prev)=>prev+1)
                                  }}></span>
                            </div>
                        </div>
              </div>
              <button
                onClick={() => socket.emit("gameStarted")}
                className="px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-700 transition"
              >
                Start Game
              </button>
              </div>
    </div>
    </>
    )
}