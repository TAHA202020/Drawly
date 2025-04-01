import { useContext, useEffect, useRef } from "react"
import { socket } from "../utils/socket"
import logo from "../assets/logo.png" 
import {useNavigate, useSearchParams} from "react-router-dom"
import { GameContext } from "../context/GameContext"
import { UserContext } from "../context/UserContext"
import ErrorMessage from "./ErrorMessage"

export default function Lobby()
{
    const {game,setGame}=useContext(GameContext)
    const {user,setUser}=useContext(UserContext)
    const [id]=useSearchParams()
    const navigate=useNavigate()
    useEffect(()=>
        {
            document.title = 'Drawly - Lobby';
            socket.on("room-joined",(data)=>
                {
                    setUser({id:socket.id,username:data.user})
                    setGame(data)
                    console.log(data)
                    navigate(`/${data.room_id}`)
                })
            return()=>{socket.off("room-joined")}
        },[])
    function JoinRoom()
    {
        socket.emit("create-room",{username:usernameRef.current.value,room_id:id.get("id")||null})
    }
    const usernameRef=useRef()
    return (<>
    <ErrorMessage/>
    <div className="lobby-container">
        <div className="lobby">
            {id.get("id")?<h1 className="title">Join Room</h1>:<h1 className="title">Create Room</h1>}
            <div className="coolinput">
            <label htmlFor="input" className="text">Username:</label>
            <input type="text" placeholder="Write here..." name="input" ref={usernameRef} className="input" />
            </div>
            <input type="submit" value="Play" className="text-3xl text-bold submit-button sketch-text " onClick={JoinRoom}/>
        </div>
    </div></>)
}