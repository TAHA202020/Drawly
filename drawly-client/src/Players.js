import { useEffect, useState } from "react"
import { socket } from "./socket"

export default function Players({players})
{
    return(<div className="bg-black w-[15vw]">
        {players.map((value)=><div className="text-white" key={value.id}>{value.name}</div> )}
    </div>)
}