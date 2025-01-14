import { useEffect, useState } from "react"
import { socket } from "./socket"

export default function Players()
{
    const [players,setPlayers]= useState([])
    useEffect(()=>
        {
            socket.on("playerConnected",()=>
                {

                })
        },[])
    return(<div className="bg-black w-[15vw]">
        salam
    </div>)
}