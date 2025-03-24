import { useState } from "react"
import { socket } from "../utils/socket"
import ErrorMessage from "./ErrorMessage"
export default function GameOwnerSettings({game})
{


    const [maxPlayers,setMaxPlayers]=useState(8)
    return(<>
    <ErrorMessage/>
    <div className="settings">
              <p>You are the owner. Click to start the game.</p>
              <div>
                        <div className="flex items-center">
                            <p>Number Of Players :</p>
                            <div className="range-container">
                                <p>{game.players.length>2?game.players.length:2}</p>
                                <input  type="range" min={game.players.length>2?game.players.length:2} max={8} value={maxPlayers} onChange={(e)=>
                                        {
                                            socket.emit("max-players",({maxPlayers:e.target.value}))
                                            setMaxPlayers(e.target.value)
                                        }}/>
                                <p>8</p>
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
    </>
    )
}