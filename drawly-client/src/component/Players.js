import {useContext, useEffect, useState } from "react"
import { GameContext } from "../context/GameContext"
import { useNavigate } from "react-router-dom"
import { socket } from "../utils/socket"
import user1 from "../assets/users/user1.png"
export default function Players({players})
{
    return(<div className="player-container w-[9vw]">
        {players.map((player)=><div className="player" key={player[0]}><img alt="user" className="player-img" src={user1} /><h3 className="player-name">{player[1]}</h3></div>)}
    </div>)
}