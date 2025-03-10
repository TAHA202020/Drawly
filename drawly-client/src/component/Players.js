import {useContext, useEffect, useState } from "react"
import { GameContext } from "../context/GameContext"
import { useNavigate } from "react-router-dom"
import { socket } from "../utils/socket"
import user1 from "../assets/users/user1.png"
export default function Players()
{
    const {game}=useContext(GameContext)
    const [players,setPlayers]= useState([])
    const navigate=useNavigate()
    useEffect(()=>
    {
        if(game===null)
        {
            navigate("/")
        }
        else
        {
            setPlayers(game.players)
        }
        socket.on("player-joined",(data)=>{
            setPlayers((prevPlayers) => [...prevPlayers, data])
        })
        socket.on("player-left", (data) => {
            setPlayers((prevPlayers) => prevPlayers.filter(player => player[0] !== data.playerId));
        });  //need playerId to remove player
    },[navigate])
    

    
    return(<div className="player-container w-[15vw]">
        {players.map((player)=><div className="player" key={player[0]}><img className="player-img" src={user1} /><h3 className="player-name">{player[1]}</h3></div>)}
    </div>)
}