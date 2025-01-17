import { useEffect, useRef } from "react"
import { socket } from "./socket"
import {useNavigate} from "react-router-dom"

export default function Lobby()
{
    const navigate=useNavigate()
    useEffect(()=>
        {
            socket.on("room-created",(data)=>{
                navigate("/"+data.id)
            })
        })
    const usernameRef=useRef()
    return (<>
        <div>
            <input type="text" placeholder="enter a name" ref={usernameRef}/>
            <input type="submit" value="create room" onClick={()=>
                {
                    socket.emit("create-room",{name:usernameRef.current.value})
                    localStorage.setItem("name",usernameRef.current.value)
                }}/>
        </div>
    </>)
}