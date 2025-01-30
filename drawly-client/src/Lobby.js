import { useContext, useEffect, useRef } from "react"
import { socket } from "./socket"
import {useNavigate} from "react-router-dom"
import { userNameContext } from "./AppRoutes"

export default function Lobby()
{
    const joinServer=(id,username)=>
        {
            socket.emit("join-room",{room_id:id,username:username})
        }
    
    const { userName, setUsername}=useContext(userNameContext)
    const navigate=useNavigate()
    useEffect(()=>
        {
            socket.on("room-created",(data)=>{
                navigate("/"+data.id)
            })
        })
    const usernameRef=useRef()
    return (<div className="w-full h-[100vh] flex justify-center items-center">
        <div className="flex flex-col justify-center items-center gap-[15px] border border-black p-[50px]">
            <h1 className="w-full text-left">Create Server</h1>
            
            <input type="text" className="outline-none px-[10px] py-[5px] rounded-[2px] border border-black" placeholder="enter a name" ref={usernameRef}/>

            <input type="submit" className="btn" value="create room" onClick={()=>
                {
                    const searchParams=new URLSearchParams(window.location.search)
                    setUsername(usernameRef.current.value)
                    if(searchParams.has("redirect")){
                        const redirect=searchParams.get("redirect")
                        joinServer(redirect,usernameRef.current.value)
                        navigate(`/${redirect}`)
                    }
                    else
                        socket.emit("create-room",{name:usernameRef.current.value})
                }}/>
        </div>
    </div>)
}