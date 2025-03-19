import {useContext, useEffect, useState } from "react"
import { GameContext } from "../context/GameContext"
import pen from "../assets/pen.gif"
import user1 from "../assets/users/user1.png"
export default function Players({players})
{
    const {game}=useContext(GameContext)
    return(<div className="player-container w-[9vw]">
        {players.map((player)=><div className="player" key={player[0]}><div className="flex gap-2"><img alt="user" className="player-img" src={user1} /><h3 className="player-name">{player[1]}</h3></div>{player[0]==game.drawer.id&&<img src={pen} alt="pen" className="h-[40px]"/>}</div>)}
    </div>)
}