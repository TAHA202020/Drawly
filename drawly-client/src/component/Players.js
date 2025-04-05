import pen from "../assets/pen.gif"
import { useContext } from "react"
import { GameContext } from "../context/GameContext"
export default function Players()
{
    const {game}=useContext(GameContext)
    return(<div className="player-container w-[9vw]">
        {game.players.map(([id,name,points])=>
        <div className="player" key={id}>
            <div className="flex gap-2 items-end justify-around w-full">
                <h3 className="player-name">{name}</h3>
                <h3>{points}</h3>
            </div>
            {id==game.drawer?.id&&(<img src={pen} alt="pen" className="h-[40px]"/>)}
        </div>)}
    </div>)
}
