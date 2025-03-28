import {useContext } from "react"
import { GameContext } from "../context/GameContext"
import pen from "../assets/pen.gif"
import user1 from "../assets/users/user1.png"
export default function Players()
{
    const {game}=useContext(GameContext)
    return(<div className="player-container w-[9vw]">
        {game.players.map(([id,name,points])=><div className="player" key={id}><div className="flex gap-2"><img alt="user" className="player-img" src={user1} /><h3 className="player-name">{name}</h3><>{points}</></div>{id==game.drawer?.id&&(<img src={pen} alt="pen" className="h-[40px]"/>)}</div>)}
    </div>)
}