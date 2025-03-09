import {useContext, useEffect, useState } from "react"
import { socket } from "../utils/socket"
import { GameContext } from "../context/GameContext"
import { useNavigate } from "react-router-dom"

export default function Players()
{
    const {game}=useContext(GameContext)
    const navigate=useNavigate()
    if(game===null)
    {
        navigate("/")
    }

    const [players,setPlayers]= useState(game.players)
    return(<div className="bg-black w-[15vw]">
        {players.map((player)=><div className="player">{player[1]}</div>)}
    </div>)
}