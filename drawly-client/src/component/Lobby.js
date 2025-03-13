import { useContext, useEffect, useRef } from "react"
import { socket } from "../utils/socket"
import logo from "../assets/logo.png" 
import {useNavigate, useSearchParams} from "react-router-dom"
import { GameContext } from "../context/GameContext"
import { UserContext } from "../context/UserContext"

export default function Lobby()
{
    const {game,setGame}=useContext(GameContext)
    const {user,setUser}=useContext(UserContext)
    const [id]=useSearchParams()
    const navigate=useNavigate()
    useEffect(()=>
        {
            socket.on("room-joined",(data)=>
                {
                    setUser({id:socket.id,username:data.user})
                    delete data.user
                    setGame(data)
                    console.log(data)
                    navigate(`/${data.room_id}`)
                })
        },[])
    function JoinRoom()
    {
        socket.emit("create-room",{username:usernameRef.current.value,room_id:id.get("id")||null})
    }
    const usernameRef=useRef()
    return (<div className="lobby-container">
        <div className="lobby">
            <img src={logo} alt="logo" className="logo"/>
            {id.get("id")?<h1 className="title">Join room</h1>:<h1 className="title">Create room</h1>}
            <div className="coolinput">
            <label htmlFor="input" className="text">Username:</label>
            <input type="text" placeholder="Write here..." name="input" ref={usernameRef} className="input" />
            </div>
            <input type="submit" value="Play" className="submit-button" onClick={JoinRoom}/>
        </div>
    </div>)
}