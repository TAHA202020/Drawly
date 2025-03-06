import {useContext, useEffect, useState } from "react"
import { socket } from "../utils/socket"
import { GameContext } from "../context/GameContext"

export default function Players()
{
    const {game,setGame}=useContext(GameContext)
    const [players,setPlayers]= useState(game.players)

    return(<div className="bg-black w-[15vw]">
        {players.map((player)=><div className="player">{player[1]}</div>)}
    </div>)
}